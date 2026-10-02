package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"sync"
	"sync/atomic"
	"time"
)

// GitHub reads a user's profile and starred repositories through the REST
// API with the server's token: 5000 requests an hour shared by every
// visitor, instead of 60 per visitor without one. The token needs no scopes;
// everything read here is public.

const perPage = 100

var (
	ErrNotFound = errors.New("user not found")
	// ErrBusy means GitHub's quota is nearly used up, or GitHub asked us to
	// slow down. RetryAfter says when to try again.
	ErrBusy = errors.New("github rate limit")
)

type BusyError struct{ RetryAfter time.Duration }

func (e *BusyError) Error() string {
	return fmt.Sprintf("github rate limit, retry in %s", e.RetryAfter)
}
func (e *BusyError) Unwrap() error { return ErrBusy }

type User struct {
	Login     string `json:"login"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
	HTMLURL   string `json:"html_url"`
	Type      string `json:"type"`
}

type Owner struct {
	Login     string `json:"login"`
	AvatarURL string `json:"avatar_url"`
}

// Repo is the part of GitHub's ~100-field repository object the page uses.
type Repo struct {
	ID              int64    `json:"id"`
	Name            string   `json:"name"`
	FullName        string   `json:"full_name"`
	HTMLURL         string   `json:"html_url"`
	Description     *string  `json:"description"`
	Language        *string  `json:"language"`
	StargazersCount int      `json:"stargazers_count"`
	ForksCount      int      `json:"forks_count"`
	OpenIssuesCount int      `json:"open_issues_count"`
	Archived        bool     `json:"archived"`
	Fork            bool     `json:"fork"`
	PushedAt        string   `json:"pushed_at"`
	CreatedAt       string   `json:"created_at"`
	Topics          []string `json:"topics"`
	Owner           Owner    `json:"owner"`
	StarredAt       string   `json:"starred_at"`
}

// Stars is what /api/stars returns.
type Stars struct {
	User      User   `json:"user"`
	Total     int    `json:"total"`     // everything the user has starred
	Truncated bool   `json:"truncated"` // true when Repos holds only the newest MaxStars
	Repos     []Repo `json:"repos"`     // newest star first
	FetchedAt string `json:"fetched_at"`
}

type GitHub struct {
	BaseURL     string
	Token       string
	MaxStars    int
	Concurrency int
	Client      *http.Client

	// At most this many requests to GitHub at once across all lookups;
	// GitHub answers a page of stars in about 1.5 s, so they overlap.
	slots chan struct{}

	// Quota left as of the last response; fetches stop below the reserve.
	remaining atomic.Int64
	resetAt   atomic.Int64 // unix seconds
	Reserve   int64
}

func NewGitHub(token string, maxStars int) *GitHub {
	g := &GitHub{
		BaseURL:     "https://api.github.com",
		Token:       token,
		MaxStars:    maxStars,
		Concurrency: 10,
		Client:      &http.Client{Timeout: 20 * time.Second},
		Reserve:     100,
		slots:       make(chan struct{}, 20),
	}
	g.remaining.Store(-1) // unknown until the first response
	return g
}

// Quota reports the remaining requests and when the window resets.
func (g *GitHub) Quota() (int64, time.Time) {
	return g.remaining.Load(), time.Unix(g.resetAt.Load(), 0)
}

func (g *GitHub) checkQuota() error {
	left, reset := g.Quota()
	if left >= 0 && left < g.Reserve && time.Now().Before(reset) {
		return &BusyError{RetryAfter: time.Until(reset).Round(time.Second) + time.Second}
	}
	return nil
}

func (g *GitHub) get(ctx context.Context, path string, accept string, out any) (http.Header, error) {
	select {
	case g.slots <- struct{}{}:
		defer func() { <-g.slots }()
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.BaseURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", accept)
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("User-Agent", "astrolabe")
	if g.Token != "" {
		req.Header.Set("Authorization", "Bearer "+g.Token)
	}
	resp, err := g.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	g.noteQuota(resp.Header)

	switch {
	case resp.StatusCode == http.StatusNotFound:
		return nil, ErrNotFound
	case resp.StatusCode == http.StatusTooManyRequests,
		resp.StatusCode == http.StatusForbidden && (resp.Header.Get("Retry-After") != "" || resp.Header.Get("X-RateLimit-Remaining") == "0"):
		return nil, &BusyError{RetryAfter: retryAfter(resp.Header)}
	case resp.StatusCode != http.StatusOK:
		return nil, fmt.Errorf("github: %s %s", path, resp.Status)
	}
	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		return nil, fmt.Errorf("github: %s: %w", path, err)
	}
	return resp.Header, nil
}

func (g *GitHub) noteQuota(h http.Header) {
	if v, err := strconv.ParseInt(h.Get("X-RateLimit-Remaining"), 10, 64); err == nil {
		g.remaining.Store(v)
	}
	if v, err := strconv.ParseInt(h.Get("X-RateLimit-Reset"), 10, 64); err == nil {
		g.resetAt.Store(v)
	}
}

func retryAfter(h http.Header) time.Duration {
	if s, err := strconv.Atoi(h.Get("Retry-After")); err == nil && s > 0 {
		return time.Duration(s) * time.Second
	}
	if reset, err := strconv.ParseInt(h.Get("X-RateLimit-Reset"), 10, 64); err == nil {
		if d := time.Until(time.Unix(reset, 0)); d > 0 {
			return d.Round(time.Second) + time.Second
		}
	}
	return time.Minute
}

var lastPageRe = regexp.MustCompile(`[?&]page=(\d+)>; rel="last"`)

type starItem struct {
	StarredAt string `json:"starred_at"`
	Repo      Repo   `json:"repo"`
}

func (g *GitHub) starPage(ctx context.Context, login string, page int) ([]Repo, int, error) {
	path := fmt.Sprintf("/users/%s/starred?per_page=%d&page=%d", url.PathEscape(login), perPage, page)
	var items []starItem
	h, err := g.get(ctx, path, "application/vnd.github.star+json", &items)
	if err != nil {
		return nil, 0, err
	}
	last := page
	if m := lastPageRe.FindStringSubmatch(h.Get("Link")); m != nil {
		last, _ = strconv.Atoi(m[1])
	}
	repos := make([]Repo, len(items))
	for i, it := range items {
		r := it.Repo
		r.StarredAt = it.StarredAt
		if r.Topics == nil {
			r.Topics = []string{}
		}
		repos[i] = r
	}
	return repos, last, nil
}

// Stars fetches the profile and up to MaxStars stars, newest first.
//
// GitHub takes about 1.5 s per page, so pages are fetched side by side: the
// profile and the first three pages in one round (most accounts have fewer
// than 300 stars), then whatever is left.
func (g *GitHub) Stars(ctx context.Context, login string) (*Stars, error) {
	if err := g.checkQuota(); err != nil {
		return nil, err
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	maxPages := (g.MaxStars + perPage - 1) / perPage
	var user User
	pages := map[int][]Repo{}
	last := 1
	round := func(list []int, withProfile bool) error {
		var (
			wg       sync.WaitGroup
			mu       sync.Mutex
			firstErr error
			sem      = make(chan struct{}, max(1, g.Concurrency))
		)
		fail := func(err error) {
			mu.Lock()
			defer mu.Unlock()
			if firstErr == nil {
				firstErr = err
				cancel()
			}
		}
		if withProfile {
			wg.Add(1)
			go func() {
				defer wg.Done()
				if _, err := g.get(ctx, "/users/"+url.PathEscape(login), "application/vnd.github+json", &user); err != nil {
					fail(err)
				}
			}()
		}
		for _, page := range list {
			wg.Add(1)
			go func() {
				defer wg.Done()
				sem <- struct{}{}
				defer func() { <-sem }()
				repos, l, err := g.starPage(ctx, login, page)
				if err != nil {
					fail(err)
					return
				}
				mu.Lock()
				defer mu.Unlock()
				pages[page] = repos
				if page == 1 {
					last = l
				}
			}()
		}
		wg.Wait()
		return firstErr
	}

	var firstRound []int
	for p := 1; p <= min(3, maxPages); p++ {
		firstRound = append(firstRound, p)
	}
	if err := round(firstRound, true); err != nil {
		return nil, err
	}
	keep := min(last, maxPages)
	var rest []int
	for p := len(firstRound) + 1; p <= keep; p++ {
		rest = append(rest, p)
	}
	if last > keep {
		rest = append(rest, last) // only to count the stars beyond what is kept
	}
	if err := round(rest, false); err != nil {
		return nil, err
	}

	out := &Stars{User: user, Repos: []Repo{}, FetchedAt: time.Now().UTC().Format(time.RFC3339)}
	for p := 1; p <= keep; p++ {
		out.Repos = append(out.Repos, pages[p]...)
	}
	if len(out.Repos) > g.MaxStars {
		out.Repos = out.Repos[:g.MaxStars]
	}
	out.Total = (last-1)*perPage + len(pages[last])
	out.Truncated = out.Total > len(out.Repos)
	return out, nil
}

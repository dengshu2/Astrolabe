package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type App struct {
	cfg     Config
	github  *GitHub
	cache   *Cache
	limiter *Limiter
	csp     string
	files   map[string]string // top-level files of the built page
}

// A visitor can ask for a fresh copy, but not more often than this.
const minRefresh = 2 * time.Minute

var loginRe = regexp.MustCompile(`^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$`)

func NewApp(cfg Config, gh *GitHub) (*App, error) {
	a := &App{
		cfg:     cfg,
		github:  gh,
		limiter: NewLimiter(1/cfg.FetchEvery.Seconds(), cfg.FetchBurst),
		csp:     pageCSP(cfg.AnalyticsOrigins),
		files:   map[string]string{},
	}
	a.cache = NewCache(cfg.CacheTTL, cfg.CacheBytes, a.fetch)
	entries, err := os.ReadDir(cfg.StaticDir)
	if err != nil && !os.IsNotExist(err) {
		return nil, err
	}
	for _, e := range entries {
		if !e.IsDir() && e.Name() != "index.html" {
			a.files[e.Name()] = filepath.Join(cfg.StaticDir, e.Name())
		}
	}
	return a, nil
}

func (a *App) fetch(ctx context.Context, login string) (*Stars, error) {
	start := time.Now()
	stars, err := a.github.Stars(ctx, login)
	left, _ := a.github.Quota()
	if err != nil {
		log.Printf("event=fetch_failed user=%q error=%q quota_left=%d", login, err, left)
		return nil, err
	}
	log.Printf("event=fetch user=%q repos=%d total=%d ms=%d quota_left=%d",
		stars.User.Login, len(stars.Repos), stars.Total, time.Since(start).Milliseconds(), left)
	return stars, nil
}

func pageCSP(analytics string) string {
	extra := strings.TrimSpace(analytics)
	join := func(s string) string { return strings.TrimSpace(s + " " + extra) }
	return strings.Join([]string{
		"default-src 'self'",
		join("script-src 'self'"),
		"style-src 'self' 'unsafe-inline'", // bar widths are inline styles
		"img-src 'self' data: https://avatars.githubusercontent.com",
		"font-src 'self'",
		join("connect-src 'self'"),
		"base-uri 'none'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"object-src 'none'",
	}, "; ")
}

func (a *App) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/stars", a.handleStars)
	mux.HandleFunc("GET /health", a.handleHealth)
	mux.Handle("GET /assets/", immutable(http.StripPrefix("/assets/", http.FileServer(noDirs{http.Dir(filepath.Join(a.cfg.StaticDir, "assets"))}))))
	mux.HandleFunc("GET /{$}", a.handleIndex)
	mux.HandleFunc("GET /{name}", a.handleTopFile)
	return a.headers(mux)
}

func (a *App) headers(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		h.Set("Content-Security-Policy", a.csp)
		next.ServeHTTP(w, r)
	})
}

func (a *App) handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, filepath.Join(a.cfg.StaticDir, "index.html"))
}

func (a *App) handleTopFile(w http.ResponseWriter, r *http.Request) {
	path, ok := a.files[r.PathValue("name")]
	if !ok {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=86400")
	http.ServeFile(w, r, path)
}

// Hashed file names change with their content, so they can be kept for good.
func immutable(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		next.ServeHTTP(w, r)
	})
}

// noDirs hides directory listings.
type noDirs struct{ fs http.FileSystem }

func (n noDirs) Open(name string) (http.File, error) {
	f, err := n.fs.Open(name)
	if err != nil {
		return nil, err
	}
	if st, err := f.Stat(); err == nil && st.IsDir() {
		f.Close()
		return nil, os.ErrNotExist
	}
	return f, nil
}

func (a *App) handleHealth(w http.ResponseWriter, r *http.Request) {
	left, _ := a.github.Quota()
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "github_quota_left": left})
}

type apiError struct {
	Error      string `json:"error"`
	Message    string `json:"message"`
	RetryAfter int    `json:"retry_after,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func retryJSON(w http.ResponseWriter, status int, code, msg string, wait time.Duration) {
	secs := int(math.Ceil(wait.Seconds()))
	w.Header().Set("Retry-After", strconv.Itoa(secs))
	writeJSON(w, status, apiError{Error: code, Message: msg, RetryAfter: secs})
}

func (a *App) clientIP(r *http.Request) string {
	if a.cfg.ClientIPHeader != "" {
		if v := strings.TrimSpace(r.Header.Get(a.cfg.ClientIPHeader)); v != "" {
			return v
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// handleStars answers GET /api/stars?user=<login>[&refresh=1].
func (a *App) handleStars(w http.ResponseWriter, r *http.Request) {
	login := strings.TrimSpace(r.URL.Query().Get("user"))
	if !loginRe.MatchString(login) {
		writeJSON(w, http.StatusBadRequest, apiError{Error: "invalid_user", Message: "not a GitHub username"})
		return
	}
	refresh := r.URL.Query().Get("refresh") == "1"
	if e, ok := a.cache.Lookup(login); ok && (!refresh || time.Since(e.fetched) < minRefresh) {
		writeEntry(w, r, e)
		return
	}
	// Only trips to GitHub count against a visitor's allowance.
	if wait := a.limiter.Take(a.clientIP(r)); wait > 0 {
		log.Printf("event=rate_limited ip=%q user=%q", a.clientIP(r), login)
		retryJSON(w, http.StatusTooManyRequests, "rate_limited", "too many lookups, try again shortly", wait)
		return
	}
	e, err := a.cache.Load(r.Context(), login)
	var busy *BusyError
	switch {
	case err == nil:
		writeEntry(w, r, e)
	case errors.Is(err, ErrNotFound):
		writeJSON(w, http.StatusNotFound, apiError{Error: "not_found", Message: "no such GitHub user"})
	case errors.As(err, &busy):
		retryJSON(w, http.StatusServiceUnavailable, "github_busy", "GitHub's rate limit is used up for now", busy.RetryAfter)
	case r.Context().Err() != nil:
		// The visitor left; nothing to answer.
	default:
		writeJSON(w, http.StatusBadGateway, apiError{Error: "upstream", Message: "GitHub did not answer properly, try again"})
	}
}

func writeEntry(w http.ResponseWriter, r *http.Request, e *entry) {
	h := w.Header()
	h.Set("Content-Type", "application/json")
	h.Set("Cache-Control", "no-cache")
	h.Set("Vary", "Accept-Encoding")
	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		h.Set("Content-Encoding", "gzip")
		h.Set("Content-Length", strconv.Itoa(len(e.gz)))
		_, _ = w.Write(e.gz)
		return
	}
	zr, err := gzip.NewReader(bytes.NewReader(e.gz))
	if err != nil {
		http.Error(w, "corrupt cache entry", http.StatusInternalServerError)
		return
	}
	_, _ = io.Copy(w, zr)
}

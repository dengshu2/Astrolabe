package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
)

// fakeGitHub serves /users/{login} and /users/{login}/starred for users with
// the given number of stars, newest first, with GitHub's Link header.
type fakeGitHub struct {
	*httptest.Server
	stars     map[string]int
	requests  atomic.Int64
	remaining atomic.Int64
	busy      atomic.Bool
}

func newFakeGitHub(t *testing.T, stars map[string]int) *fakeGitHub {
	f := &fakeGitHub{stars: stars}
	f.remaining.Store(5000)
	f.Server = httptest.NewServer(http.HandlerFunc(f.serve))
	t.Cleanup(f.Close)
	return f
}

func (f *fakeGitHub) serve(w http.ResponseWriter, r *http.Request) {
	f.requests.Add(1)
	left := f.remaining.Add(-1)
	w.Header().Set("X-RateLimit-Remaining", strconv.FormatInt(left, 10))
	w.Header().Set("X-RateLimit-Reset", "4102444800")
	if f.busy.Load() {
		w.Header().Set("Retry-After", "42")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 2 || parts[0] != "users" {
		http.NotFound(w, r)
		return
	}
	login := parts[1]
	n, ok := f.stars[strings.ToLower(login)]
	if !ok {
		http.NotFound(w, r)
		return
	}
	if len(parts) == 2 {
		_ = json.NewEncoder(w).Encode(User{Login: login, Name: "Name of " + login, AvatarURL: "https://avatars.githubusercontent.com/u/1?v=4", HTMLURL: "https://github.com/" + login, Type: "User"})
		return
	}
	if r.Header.Get("Accept") != "application/vnd.github.star+json" {
		http.Error(w, "missing star+json", http.StatusBadRequest)
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	last := max(1, (n+perPage-1)/perPage)
	if last > 1 {
		w.Header().Set("Link", fmt.Sprintf(`<%s/users/%s/starred?per_page=100&page=%d>; rel="next", <%s/users/%s/starred?per_page=100&page=%d>; rel="last"`, f.URL, login, page+1, f.URL, login, last))
	}
	items := []map[string]any{}
	for i := (page - 1) * perPage; i < min(n, page*perPage); i++ {
		items = append(items, map[string]any{
			"starred_at": fmt.Sprintf("2026-01-01T00:00:%02dZ", i%60),
			"repo": map[string]any{
				"id": i, "name": fmt.Sprintf("r%d", i), "full_name": fmt.Sprintf("o/r%d", i),
				"html_url": "https://github.com/o/r", "language": "Go", "stargazers_count": i,
				"pushed_at": "2026-01-01T00:00:00Z", "created_at": "2020-01-01T00:00:00Z",
				"owner":   map[string]any{"login": "o", "avatar_url": "https://avatars.githubusercontent.com/u/2?v=4", "url": "dropped"},
				"node_id": "dropped",
				"topics":  nil,
			},
		})
	}
	_ = json.NewEncoder(w).Encode(items)
}

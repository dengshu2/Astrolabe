package main

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

func testApp(t *testing.T, f *fakeGitHub, tweak func(*Config)) (*App, http.Handler) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "assets"), 0o755)
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("<!doctype html><title>Astrolabe</title>"), 0o644)
	os.WriteFile(filepath.Join(dir, "favicon.ico"), []byte("ico"), 0o644)
	os.WriteFile(filepath.Join(dir, "assets", "index-abc.js"), []byte("js"), 0o644)
	os.WriteFile(filepath.Join(filepath.Dir(dir), "secret.txt"), []byte("nope"), 0o644)
	cfg := Config{StaticDir: dir, MaxStars: 3000, CacheTTL: time.Hour, CacheBytes: 1 << 20, FetchBurst: 10, FetchEvery: time.Second, AnalyticsOrigins: "https://stats.example"}
	if tweak != nil {
		tweak(&cfg)
	}
	app, err := NewApp(cfg, testGitHub(f, cfg.MaxStars))
	if err != nil {
		t.Fatal(err)
	}
	return app, app.Routes()
}

func get(h http.Handler, path string, headers ...string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)
	for i := 0; i+1 < len(headers); i += 2 {
		req.Header.Set(headers[i], headers[i+1])
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func decodeStars(t *testing.T, rec *httptest.ResponseRecorder) Stars {
	t.Helper()
	var body io.Reader = rec.Body
	if rec.Header().Get("Content-Encoding") == "gzip" {
		zr, err := gzip.NewReader(rec.Body)
		if err != nil {
			t.Fatal(err)
		}
		body = zr
	}
	var s Stars
	if err := json.NewDecoder(body).Decode(&s); err != nil {
		t.Fatal(err)
	}
	return s
}

func TestStarsAPI(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 150})
	_, h := testApp(t, f, nil)

	rec := get(h, "/api/stars?user=Ann", "Accept-Encoding", "gzip")
	if rec.Code != 200 || rec.Header().Get("Content-Encoding") != "gzip" {
		t.Fatalf("status %d, encoding %q", rec.Code, rec.Header().Get("Content-Encoding"))
	}
	if s := decodeStars(t, rec); len(s.Repos) != 150 || s.User.Login != "Ann" {
		t.Fatalf("got %d repos for %q", len(s.Repos), s.User.Login)
	}
	// The raw repository fields GitHub sends are not passed on.
	plain := get(h, "/api/stars?user=ann")
	if plain.Header().Get("Content-Encoding") != "" || strings.Contains(plain.Body.String(), "node_id") {
		t.Fatal("plain answer is compressed or carries unused fields")
	}
	if n := f.requests.Load(); n != 4 { // one fetch: profile + the first round of 3 pages
		t.Fatalf("second lookup was not served from the cache: %d requests", n)
	}
}

func TestStarsAPIErrors(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 1})
	_, h := testApp(t, f, nil)
	for path, want := range map[string]int{
		"/api/stars":                                 400,
		"/api/stars?user=-bad":                       400,
		"/api/stars?user=a/b":                        400,
		"/api/stars?user=" + strings.Repeat("a", 40): 400,
		"/api/stars?user=ghost":                      404,
	} {
		if rec := get(h, path); rec.Code != want {
			t.Errorf("%s: status %d, want %d", path, rec.Code, want)
		}
	}
	f.busy.Store(true)
	rec := get(h, "/api/stars?user=ann")
	if rec.Code != 503 || rec.Header().Get("Retry-After") != "42" {
		t.Fatalf("busy: status %d, Retry-After %q", rec.Code, rec.Header().Get("Retry-After"))
	}
}

func TestRefreshIsThrottled(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 1})
	app, h := testApp(t, f, nil)
	get(h, "/api/stars?user=ann")
	get(h, "/api/stars?user=ann&refresh=1")
	if n := f.requests.Load(); n != 4 {
		t.Fatalf("a refresh right after a fetch went to GitHub: %d requests", n)
	}
	e, _ := app.cache.Lookup("ann")
	e.fetched = time.Now().Add(-minRefresh - time.Second)
	get(h, "/api/stars?user=ann&refresh=1")
	if n := f.requests.Load(); n != 8 {
		t.Fatalf("an old entry was not refreshed: %d requests", n)
	}
}

func TestLookupsPerVisitorAreLimited(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"a1": 1, "a2": 1, "a3": 1, "a4": 1})
	_, h := testApp(t, f, func(c *Config) {
		c.FetchBurst = 2
		c.FetchEvery = time.Hour
		c.ClientIPHeader = "X-Real-IP"
	})
	if get(h, "/api/stars?user=a1", "X-Real-IP", "1.1.1.1").Code != 200 ||
		get(h, "/api/stars?user=a2", "X-Real-IP", "1.1.1.1").Code != 200 {
		t.Fatal("first lookups refused")
	}
	if rec := get(h, "/api/stars?user=a3", "X-Real-IP", "1.1.1.1"); rec.Code != 429 || rec.Header().Get("Retry-After") == "" {
		t.Fatalf("third lookup: %d", rec.Code)
	}
	if get(h, "/api/stars?user=a1", "X-Real-IP", "1.1.1.1").Code != 200 {
		t.Fatal("a cached answer counted against the limit")
	}
	if get(h, "/api/stars?user=a4", "X-Real-IP", "2.2.2.2").Code != 200 {
		t.Fatal("another visitor was limited")
	}
}

func TestConcurrentLookupsShareOneFetch(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 300})
	_, h := testApp(t, f, nil)
	var wg sync.WaitGroup
	for i := range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			get(h, "/api/stars?user=ann", "X-Real-IP", string(rune('a'+i)))
		}()
	}
	wg.Wait()
	if n := f.requests.Load(); n != 4 {
		t.Fatalf("%d requests for one user, want 4", n)
	}
}

func TestCacheStaysInBudget(t *testing.T) {
	stars := map[string]int{}
	for _, u := range []string{"u1", "u2", "u3", "u4", "u5"} {
		stars[u] = 200
	}
	f := newFakeGitHub(t, stars)
	app, h := testApp(t, f, func(c *Config) { c.CacheBytes = 6000 })
	for _, u := range []string{"u1", "u2", "u3", "u4", "u5"} {
		get(h, "/api/stars?user="+u)
	}
	if app.cache.size > 6000 && len(app.cache.entries) > 1 {
		t.Fatalf("cache holds %d bytes in %d entries", app.cache.size, len(app.cache.entries))
	}
	if _, ok := app.cache.Lookup("u5"); !ok {
		t.Fatal("the newest entry was evicted")
	}
}

func TestPageAndHeaders(t *testing.T) {
	f := newFakeGitHub(t, nil)
	_, h := testApp(t, f, nil)
	rec := get(h, "/?user=ann")
	if rec.Code != 200 || rec.Header().Get("Cache-Control") != "no-cache" {
		t.Fatalf("index: %d %q", rec.Code, rec.Header().Get("Cache-Control"))
	}
	csp := rec.Header().Get("Content-Security-Policy")
	for _, want := range []string{"script-src 'self' https://stats.example", "img-src 'self' data: https://avatars.githubusercontent.com", "frame-ancestors 'none'"} {
		if !strings.Contains(csp, want) {
			t.Errorf("CSP lacks %q: %s", want, csp)
		}
	}
	if rec := get(h, "/assets/index-abc.js"); rec.Code != 200 || !strings.Contains(rec.Header().Get("Cache-Control"), "immutable") {
		t.Fatalf("asset: %d %q", rec.Code, rec.Header().Get("Cache-Control"))
	}
	if rec := get(h, "/favicon.ico"); rec.Code != 200 || rec.Header().Get("Cache-Control") != "public, max-age=86400" {
		t.Fatalf("favicon: %d", rec.Code)
	}
	for _, path := range []string{"/nope", "/assets/", "/assets/missing.js", "/..%2fsecret.txt", "/assets/..%2f..%2fsecret.txt"} {
		if rec := get(h, path); rec.Code != 404 || strings.Contains(rec.Body.String(), "nope") {
			t.Errorf("%s: %d", path, rec.Code)
		}
	}
	if rec := get(h, "/health"); rec.Code != 200 {
		t.Fatalf("health: %d", rec.Code)
	}
}

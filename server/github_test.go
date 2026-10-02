package main

import (
	"context"
	"errors"
	"testing"
	"time"
)

func testGitHub(f *fakeGitHub, maxStars int) *GitHub {
	g := NewGitHub("t", maxStars)
	g.BaseURL = f.URL
	return g
}

func TestStarsAllPages(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 250})
	s, err := testGitHub(f, 3000).Stars(context.Background(), "ann")
	if err != nil {
		t.Fatal(err)
	}
	if len(s.Repos) != 250 || s.Total != 250 || s.Truncated {
		t.Fatalf("got %d repos, total %d, truncated %v", len(s.Repos), s.Total, s.Truncated)
	}
	if s.Repos[0].FullName != "o/r0" || s.Repos[249].FullName != "o/r249" {
		t.Fatalf("pages out of order: %s … %s", s.Repos[0].FullName, s.Repos[249].FullName)
	}
	if s.Repos[0].StarredAt == "" || s.Repos[0].Topics == nil || s.User.Name != "Name of ann" {
		t.Fatalf("fields missing: %+v %+v", s.Repos[0], s.User)
	}
	if got := f.requests.Load(); got != 4 { // profile + 3 pages, in one round
		t.Fatalf("made %d requests, want 4", got)
	}
}

func TestStarsTruncatedKeepsExactTotal(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"big": 1234})
	s, err := testGitHub(f, 300).Stars(context.Background(), "big")
	if err != nil {
		t.Fatal(err)
	}
	if len(s.Repos) != 300 || s.Total != 1234 || !s.Truncated {
		t.Fatalf("got %d repos, total %d, truncated %v", len(s.Repos), s.Total, s.Truncated)
	}
	if got := f.requests.Load(); got != 5 { // profile, pages 1-3, the last page
		t.Fatalf("made %d requests, want 5", got)
	}
}

func TestStarsBeyondTheFirstRound(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"mid": 750})
	s, err := testGitHub(f, 3000).Stars(context.Background(), "mid")
	if err != nil {
		t.Fatal(err)
	}
	if len(s.Repos) != 750 || s.Total != 750 || s.Truncated || s.Repos[749].FullName != "o/r749" {
		t.Fatalf("got %d repos, total %d", len(s.Repos), s.Total)
	}
	if got := f.requests.Load(); got != 9 { // profile + 8 pages
		t.Fatalf("made %d requests, want 9", got)
	}
}

func TestStarsFewerThanTheFirstRound(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"few": 30})
	s, err := testGitHub(f, 3000).Stars(context.Background(), "few")
	if err != nil || len(s.Repos) != 30 || s.Total != 30 {
		t.Fatalf("got %+v, %v", s, err)
	}
}

func TestStarsNone(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"new": 0})
	s, err := testGitHub(f, 3000).Stars(context.Background(), "new")
	if err != nil || s.Total != 0 || s.Repos == nil || len(s.Repos) != 0 {
		t.Fatalf("got %+v, %v", s, err)
	}
}

func TestStarsNotFound(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{})
	if _, err := testGitHub(f, 3000).Stars(context.Background(), "ghost"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("got %v", err)
	}
}

func TestStarsBusy(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 10})
	f.busy.Store(true)
	_, err := testGitHub(f, 3000).Stars(context.Background(), "ann")
	var busy *BusyError
	if !errors.As(err, &busy) || busy.RetryAfter != 42*time.Second {
		t.Fatalf("got %v", err)
	}
}

func TestStarsKeepsAReserve(t *testing.T) {
	f := newFakeGitHub(t, map[string]int{"ann": 10})
	f.remaining.Store(60)
	g := testGitHub(f, 3000)
	if _, err := g.Stars(context.Background(), "ann"); err != nil {
		t.Fatal(err) // quota unknown before the first answer
	}
	before := f.requests.Load()
	if _, err := g.Stars(context.Background(), "ann"); !errors.Is(err, ErrBusy) {
		t.Fatalf("got %v", err)
	}
	if f.requests.Load() != before {
		t.Fatal("asked GitHub although the quota was below the reserve")
	}
}

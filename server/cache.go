package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"strings"
	"sync"
	"time"
)

// Cache keeps each user's answer as gzipped JSON (a 3000-star account is
// about 300 KB that way), drops entries after TTL, and stays under a byte
// budget by evicting the oldest. Concurrent misses for one user share a
// single fetch.
type Cache struct {
	TTL    time.Duration
	Budget int // bytes of gzipped JSON
	Fetch  func(ctx context.Context, login string) (*Stars, error)
	Now    func() time.Time

	mu       sync.Mutex
	entries  map[string]*entry
	size     int
	inflight map[string]*call
}

type entry struct {
	gz      []byte
	fetched time.Time
}

type call struct {
	done chan struct{}
	ent  *entry
	err  error
}

func NewCache(ttl time.Duration, budget int, fetch func(context.Context, string) (*Stars, error)) *Cache {
	return &Cache{TTL: ttl, Budget: budget, Fetch: fetch, Now: time.Now, entries: map[string]*entry{}, inflight: map[string]*call{}}
}

// Lookup returns the cached entry for login if it is younger than TTL.
func (c *Cache) Lookup(login string) (*entry, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.entries[strings.ToLower(login)]
	if !ok || c.Now().Sub(e.fetched) > c.TTL {
		return nil, false
	}
	return e, true
}

// Load fetches login (joining a fetch already under way) and stores it.
func (c *Cache) Load(ctx context.Context, login string) (*entry, error) {
	key := strings.ToLower(login)
	c.mu.Lock()
	if cl, ok := c.inflight[key]; ok {
		c.mu.Unlock()
		select {
		case <-cl.done:
			return cl.ent, cl.err
		case <-ctx.Done():
			return nil, ctx.Err()
		}
	}
	cl := &call{done: make(chan struct{})}
	c.inflight[key] = cl
	c.mu.Unlock()

	// The fetch outlives a visitor who gives up: the next one gets the result.
	fetchCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 90*time.Second)
	stars, err := c.Fetch(fetchCtx, login)
	cancel()
	if err == nil {
		cl.ent, cl.err = c.store(key, stars)
	} else {
		cl.err = err
	}

	c.mu.Lock()
	delete(c.inflight, key)
	c.mu.Unlock()
	close(cl.done)
	return cl.ent, cl.err
}

func (c *Cache) store(key string, stars *Stars) (*entry, error) {
	var buf bytes.Buffer
	zw, _ := gzip.NewWriterLevel(&buf, gzip.BestCompression)
	if err := json.NewEncoder(zw).Encode(stars); err != nil {
		return nil, err
	}
	if err := zw.Close(); err != nil {
		return nil, err
	}
	e := &entry{gz: buf.Bytes(), fetched: c.Now()}

	c.mu.Lock()
	defer c.mu.Unlock()
	if old, ok := c.entries[key]; ok {
		c.size -= len(old.gz)
	}
	c.entries[key] = e
	c.size += len(e.gz)
	for c.size > c.Budget && len(c.entries) > 1 {
		var oldestKey string
		var oldest time.Time
		for k, v := range c.entries {
			if k != key && (oldestKey == "" || v.fetched.Before(oldest)) {
				oldestKey, oldest = k, v.fetched
			}
		}
		c.size -= len(c.entries[oldestKey].gz)
		delete(c.entries, oldestKey)
	}
	return e, nil
}

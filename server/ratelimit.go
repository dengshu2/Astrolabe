package main

import (
	"math"
	"sync"
	"time"
)

// Limiter is a token bucket per key: up to Burst at once, refilled at Rate
// per second.
type Limiter struct {
	Rate  float64
	Burst float64
	Now   func() time.Time

	mu      sync.Mutex
	buckets map[string]bucket
}

type bucket struct {
	tokens float64
	last   time.Time
}

func NewLimiter(rate float64, burst int) *Limiter {
	return &Limiter{Rate: rate, Burst: float64(burst), Now: time.Now, buckets: map[string]bucket{}}
}

// Take spends one token for key. It returns 0 when allowed, else how long
// until a token is back.
func (l *Limiter) Take(key string) time.Duration {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := l.Now()
	b, ok := l.buckets[key]
	if !ok {
		b = bucket{tokens: l.Burst, last: now}
	}
	b.tokens = math.Min(l.Burst, b.tokens+now.Sub(b.last).Seconds()*l.Rate)
	b.last = now
	if b.tokens < 1 {
		l.buckets[key] = b
		return time.Duration(math.Ceil((1-b.tokens)/l.Rate)) * time.Second
	}
	b.tokens--
	l.buckets[key] = b
	if len(l.buckets) > 10000 {
		for k, v := range l.buckets {
			if v.tokens+now.Sub(v.last).Seconds()*l.Rate >= l.Burst {
				delete(l.buckets, k)
			}
		}
	}
	return 0
}

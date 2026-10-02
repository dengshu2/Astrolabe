// Astrolabe serves the page and /api/stars, which reads a GitHub user's
// starred repositories through the server's token and caches the answer.
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

type Config struct {
	Port             string
	StaticDir        string
	Token            string
	MaxStars         int
	CacheTTL         time.Duration
	CacheBytes       int
	ClientIPHeader   string
	AnalyticsOrigins string
	FetchBurst       int
	FetchEvery       time.Duration // one more fetch per visitor every this long
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v, err := strconv.Atoi(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return def
}

func envDuration(key string, def time.Duration) time.Duration {
	if v, err := time.ParseDuration(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return def
}

func loadConfig() Config {
	return Config{
		Port:             env("PORT", "8080"),
		StaticDir:        env("STATIC_DIR", "/app/web"),
		Token:            os.Getenv("GITHUB_TOKEN"),
		MaxStars:         envInt("MAX_STARS", 3000),
		CacheTTL:         envDuration("CACHE_TTL", time.Hour),
		CacheBytes:       envInt("CACHE_MB", 64) << 20,
		ClientIPHeader:   os.Getenv("CLIENT_IP_HEADER"),
		AnalyticsOrigins: os.Getenv("ANALYTICS_ORIGINS"),
		FetchBurst:       envInt("FETCH_BURST", 10),
		FetchEvery:       envDuration("FETCH_EVERY", 30*time.Second),
	}
}

func main() {
	cfg := loadConfig()
	if len(os.Args) > 1 && os.Args[1] == "health" {
		os.Exit(healthCheck(cfg.Port))
	}
	if cfg.Token == "" {
		log.Print("warning: GITHUB_TOKEN is empty; GitHub allows 60 requests an hour without one")
	}
	app, err := NewApp(cfg, NewGitHub(cfg.Token, cfg.MaxStars))
	if err != nil {
		log.Fatal(err)
	}
	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           app.Routes(),
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      2 * time.Minute,
		IdleTimeout:       2 * time.Minute,
	}
	go func() {
		log.Printf("listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

// healthCheck is the container's health probe; the image has no shell tools.
func healthCheck(port string) int {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get("http://127.0.0.1:" + port + "/health")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return 1
	}
	return 0
}

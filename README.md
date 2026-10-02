# Astrolabe

[中文](./README_ZH.md)

Enter a GitHub username and see everything they have starred: which languages, when, and which of those repositories are no longer maintained. No sign-in needed.

**Try it → [astrolabe.dengshu.ovh](https://astrolabe.dengshu.ovh)**

## What it shows

- **Health**: each starred repository is active (a commit within a year), quiet for a year, quiet for two, or archived. Choosing one filters the list.
- **Languages** and a **star timeline** by month.
- **The repositories**, searchable and filterable by health and language, sortable, and exportable as JSON or CSV.
- The newest 3,000 stars of an account are analyzed; the total is always exact. Pages are linkable (`/?user=octocat`) and the page follows the system's light or dark setting, in Chinese or English.

## How it works

A small Go server serves the page and `GET /api/stars?user=<login>`. It reads the profile and starred repositories from GitHub's REST API with its own token, keeps only the fields the page uses, and caches each answer for an hour (gzipped, within a memory budget). That gives every visitor a share of 5,000 requests an hour instead of GitHub's 60 per visitor without a token, and an account with 3,000 stars loads in about six seconds the first time and instantly after.

`?refresh=1` fetches again if the cached copy is older than two minutes. Each visitor gets ten lookups that go to GitHub at once, then one more every 30 seconds (HTTP 429 past that); cached answers do not count. When GitHub's quota runs low the server answers 503 with `Retry-After` instead of using it up.

## Running it

```bash
# A classic token with no scopes: GitHub → Settings → Developer settings →
# Personal access tokens → Tokens (classic), tick nothing.
echo "GITHUB_TOKEN=ghp_..." > .env
docker compose up -d --build
```

The container listens on `127.0.0.1:3002`. To replace the token, edit `.env` and run `docker compose up -d`.

| Variable | Default | Meaning |
|---|---|---|
| `GITHUB_TOKEN` | | Token used for GitHub; without one GitHub allows 60 requests an hour. |
| `MAX_STARS` | 3000 | Newest stars analyzed per account. |
| `CACHE_TTL`, `CACHE_MB` | 1h, 64 | How long and how much to cache. |
| `FETCH_BURST`, `FETCH_EVERY` | 10, 30s | Per-visitor allowance for lookups that reach GitHub. |
| `CLIENT_IP_HEADER` | | Header the reverse proxy puts the visitor's address in (e.g. `X-Real-IP`). |
| `ANALYTICS_ORIGINS` | | Extra origins the Content-Security-Policy allows for scripts and beacons. |

## Development

```bash
npm install
npm run dev            # the page on :5173, /api proxied to :8080
npm test && npm run lint

cd server
GITHUB_TOKEN=... STATIC_DIR=../dist go run .   # the server on :8080
go test ./...
```

## Stack

React 19, TypeScript and Vite, styled with Quiet UI; charts are plain SVG. The server is Go with no dependencies beyond the standard library.

## License

MIT

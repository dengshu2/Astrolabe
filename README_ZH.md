# Astrolabe

[English](./README.md)

输入 GitHub 用户名，看他 Star 过的所有仓库：都是什么语言、什么时候收藏的，以及哪些已经没人维护。不用登录。

**在线使用 → [astrolabe.dengshu.ovh](https://astrolabe.dengshu.ovh)**

## 能看到什么

- **健康度**：每个收藏的仓库分为活跃（一年内有提交）、一年没更新、两年没更新、已归档，点一下就筛选下面的列表。
- **语言分布**和按月的**收藏时间线**。
- **两个 AI 提示词**，复制给任意 AI 助手：一个推测技术画像，一个把 Star 整理成 GitHub Lists 并挑出可以取消的。语言跟随页面。
- **仓库列表**：可以搜索，按健康度和语言筛选，排序，导出 JSON 或 CSV。
- 每个账号分析最近的 3,000 个 Star，总数始终准确。页面可以直接分享（`/?user=octocat`），跟随系统的浅色/深色，中英文都有。

## 工作方式

一个 Go 小服务提供页面和 `GET /api/stars?user=<用户名>`。它用自己的 token 从 GitHub REST 接口读取用户资料和 Star 列表，只保留页面用得到的字段，每个结果缓存一小时（gzip 压缩，有内存上限）。这样所有访客共享每小时 5000 次的额度，而不是每人每小时只有 60 次；一个有 3000 个 Star 的账号第一次大约 6 秒，之后直接读缓存。

`?refresh=1` 会在缓存超过两分钟时重新读取。每个访客可以连续发 10 次需要访问 GitHub 的查询，之后每 30 秒恢复 1 次，超出返回 429；读缓存不计数。GitHub 额度快用完时返回 503 和 `Retry-After`，不会把额度耗尽。

## 部署

```bash
# 经典 token，不勾任何权限：GitHub → Settings → Developer settings →
# Personal access tokens → Tokens (classic)
echo "GITHUB_TOKEN=ghp_..." > .env
docker compose up -d --build
```

容器监听 `127.0.0.1:3002`。要换 token，改 `.env` 后执行 `docker compose up -d`。

| 变量 | 默认 | 作用 |
|---|---|---|
| `GITHUB_TOKEN` | | 访问 GitHub 用的 token；没有的话 GitHub 每小时只给 60 次。 |
| `MAX_STARS` | 3000 | 每个账号分析的最新 Star 数。 |
| `CACHE_TTL`、`CACHE_MB` | 1h、64 | 缓存多久、占多少内存。 |
| `FETCH_BURST`、`FETCH_EVERY` | 10、30s | 每个访客访问 GitHub 的查询额度。 |
| `CLIENT_IP_HEADER` | | 反向代理写入访客地址的请求头（比如 `X-Real-IP`）。 |
| `ANALYTICS_ORIGINS` | | Content-Security-Policy 额外允许的统计脚本和上报地址。 |

## 本地开发

```bash
npm install
npm run dev            # 页面在 :5173，/api 代理到 :8080
npm test && npm run lint

cd server
GITHUB_TOKEN=... STATIC_DIR=../dist go run .   # 服务在 :8080
go test ./...
```

## 技术栈

React 19、TypeScript、Vite，样式用 Quiet UI，图表是手写的 SVG；服务端是只用标准库的 Go。

## 许可

MIT

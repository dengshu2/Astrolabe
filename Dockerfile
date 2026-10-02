# syntax=docker/dockerfile:1

# The page
FROM node:24-alpine AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src
RUN npm run build

# The server
FROM golang:1.26-alpine AS server
WORKDIR /src
COPY server/go.mod ./
COPY server/*.go ./
RUN CGO_ENABLED=0 go build -buildvcs=false -trimpath -ldflags="-s -w" -o /out/astrolabe .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=server /out/astrolabe /app/astrolabe
COPY --from=web /app/dist /app/web
ENV PORT=8080 STATIC_DIR=/app/web TZ=Asia/Shanghai
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/app/astrolabe", "health"]
ENTRYPOINT ["/app/astrolabe"]

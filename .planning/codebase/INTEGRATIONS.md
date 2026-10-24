---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
# External Integrations

**Analysis Date:** 2026-10-21

## APIs & External Services

**Third-party APIs:**
- None detected. No SDK imports for payment, email, AI, analytics or other external APIs in `apps/`, `packages/`. No outbound `fetch` calls to external hosts; the web client only calls its own origin (`apps/web/src/net.ts`).

**Cloudflare Tunnel (ingress, not an API):**
- `cloudflared` container (`docker-compose.yml`) runs `tunnel --config /etc/cloudflared/config.yml run`.
- Config: `cloudflared/config.yml` - tunnel name `games`, hostname `games.figielak.dev` routed to `http://games:2567`, catch-all `http_status:404`.
- Credentials (`cloudflared/*.json`, `cloudflared/*.pem`) are excluded from git and Docker build context; they were not read for this analysis.
- Supports WebSockets (required by Colyseus).

**Hosting/registry (CI only):**
- GitHub Container Registry `ghcr.io/figielak/kwadrans` - image push from `.github/workflows/ci.yml` (`docker/login-action@v3`, `GITHUB_TOKEN`, `packages: write`). Compose pulls `:latest`.
- GitHub Actions - `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `docker/setup-qemu-action@v3`, `docker/setup-buildx-action@v3`, `docker/build-push-action@v6`.

## Data Storage

**Databases:**
- SQLite via Node's built-in `node:sqlite` (`DatabaseSync`).
  - File: `DB_PATH` env, default `data/games.db` (relative to the working directory; in the container `/app/data/games.db`).
  - Module: `apps/server/src/stats.ts` (`openStats`). Tables created with `CREATE TABLE IF NOT EXISTS`:
    - `results (game_id, nick, won, at)` - wins per game for the nick ranking.
    - `scores (game_id, nick, score, tie, at)` - mini-game records. Plus a detail column for the record game (`detail`, one per game, per `KONCEPT.md`).
  - Custom SQL function `nick_key` registered from `nickKey` in `packages/games`.
  - Tests: `apps/server/src/stats.test.ts`. Dev-local database `apps/server/data/games.db` exists in the working tree (gitignored `*.db`).
  - Persistence: Docker named volume `games-data` mounted at `/app/data`; covered by the homelab backup (per `KONCEPT.md`).
- No ORM, no migrations framework.

**Room state:**
- Game rooms are in memory (Colyseus `matchMaker`). Not persisted; a server restart drops active games. Persistence of room state is listed as future work in `KONCEPT.md`.

**File Storage:**
- Local filesystem only. Static frontend served from `apps/web/dist` via `express.static` (`apps/server/src/index.ts`). No object storage.

**Caching:**
- None. The browser keeps session token and nick in `localStorage` (client-side only, `apps/web/src/net.ts`).

## Real-time Communication

**Colyseus WebSocket:**
- Server: `WebSocketTransport` (`@colyseus/ws-transport`) on the same port as HTTP, `maxPayload: 32 * 1024`. Room `lobby` defined with `LobbyRoom` (`apps/server/src/LobbyRoom.ts`).
- Client: `@colyseus/sdk` `Client` in `apps/web/src/net.ts`. Base URL: `location.origin` in production, `http://<hostname>:2567` in dev.
- Reconnect and session token logic lives in `apps/web/src/net.ts`.
- Per-player views are sent as separate messages (no Colyseus Schema sync), per `KONCEPT.md`.
- Rate limit: 10 messages/s per client (`LobbyRoom.ts`). Room limits: 3 rooms per IP, 20 for solo rooms (`ROOMS_PER_IP`, `SOLO_ROOMS_PER_IP`).

## Authentication & Identity

**Auth Provider:**
- None. No accounts. Players enter a nickname and a 4-character room code.
- Identity: random session token stored in browser `localStorage`, used for reconnect (`apps/web/src/net.ts`). Session/seat handling in `apps/server/src/LobbyRoom.ts` (Colyseus reconnection).
- Ranking identity: `nickKey` normalization (case, Polish characters, spaces) in `packages/games/src/core.ts`.
- Secrets: none required by the application.

## Public HTTP Endpoints

Defined in `apps/server/src/index.ts`. CORS `Access-Control-Allow-Origin: *` on the JSON API routes.

| Method | Path | Purpose | Source |
|---|---|---|---|
| GET | `/health` | liveness, returns `ok` | `index.ts` |
| GET | `/api/stats` | per-game wins ranking | `stats.ranking()` |
| GET | `/api/records` | mini-game record table | `stats.records(...)` |
| GET | `/api/records/:gameId/top` | record game state for one mini-game (404 for unknown id) | `stats.top(...)` |
| GET | `/api/daily` | daily challenge game id and its ranking | `dailyGame(...)` |
| GET | `/api/rooms?kody=A,B,C` | which of up to 3 recent room codes still exist, with client counts | `matchMaker.query` |
| GET | `/*` | static frontend (`apps/web/dist`) | `express.static` |

Colyseus WebSocket endpoint is served by the same server (room `lobby`).

## Monitoring & Observability

**Error Tracking:**
- None detected.

**Logs:**
- `console.log` only (`listening on :${port}` in `apps/server/src/index.ts`). Container logs via Docker.

**Metrics:**
- None. Memory is bounded by `mem_limit: 256m`.

## CI/CD & Deployment

**Hosting:**
- Raspberry Pi homelab (arm64) running Docker Compose, with `cloudflared` sidecar. Deployment details: `README.md`.

**CI Pipeline:**
- GitHub Actions, `.github/workflows/ci.yml`. Check job (install, typecheck, test, web build) on push and PR; image job on push to `master` only. Pushing to `master` publishes the production image (per `AGENTS.md`).

## Environment Configuration

**Required env vars:**
- None strictly required. Optional: `PORT` (default 2567), `DB_PATH` (default `data/games.db`), `TZ` (set to `Europe/Warsaw` in compose), `NODE_ENV` (set in image).

**Secrets location:**
- No application secrets. Cloudflare tunnel credentials live in `cloudflared/` on the host (JSON/PEM, gitignored, mounted read-only into the cloudflared container). Not read.
- `.env` files: none in the repository.

## Webhooks & Callbacks

**Incoming:**
- None. The only inbound traffic is HTTP and WebSocket from browsers via Cloudflare Tunnel.

**Outgoing:**
- None.

## Notable Constraints

- Keep `zod` out of `apps/server/package.json` (see `AGENTS.md`).
- No new dependencies without user approval (per `AGENTS.md`).
- Browser-side Polish TTS, sound or notifications: none detected; vibration is used in the UI per `KONCEPT.md` (Web Vibration API, not verified in this pass).

---

*Integration audit: 2026-10-21*

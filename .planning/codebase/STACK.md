---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
# Technology Stack

**Analysis Date:** 2026-10-21

## Languages

**Primary:**
- TypeScript (`^7.0.2` root devDependency, lock `typescript@7.0.2`) - all code: `apps/server/src/`, `apps/web/src/`, `packages/games/src/`. Config in `tsconfig.base.json` (`strict`, `module`/`moduleResolution` NodeNext, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `erasableSyntaxOnly`).
- TSX - React UI: `apps/web/src/screens/`, `apps/web/src/games/`.

**Secondary:**
- CSS - Tailwind v4 plus hand-written classes and animations in `apps/web/src/index.css`.
- HTML - `apps/web/index.html` (PWA meta tags, `lang="pl"`).
- JSON - PWA manifest `apps/web/public/manifest.webmanifest`, `pnpm-workspace.yaml`.

## Runtime

**Environment:**
- Node.js 24 (`node:24-slim` in `Dockerfile`, `node-version: 24` in `.github/workflows/ci.yml`). No `.nvmrc` or `.node-version`.
- Server runs TypeScript directly with Node type stripping: `node apps/server/src/index.ts` (Docker `CMD`), `node --watch src/index.ts` (`apps/server` `dev` script). Hence `erasableSyntaxOnly` and `.ts` import extensions.
- Browser target: modern mobile browsers (PWA, `apple-mobile-web-app-capable`).

**Package Manager:**
- pnpm `12.9.1` (`packageManager` field in root `package.json`; installed in Docker via `npm i -g pnpm@12.9.1`).
- Workspaces: `pnpm-workspace.yaml` covers `packages/*` and `apps/*`. `allowBuilds: msgpackr-extract: false` (native build disabled).
- Lockfile: `pnpm-lock.yaml` present; CI and Docker install with `--frozen-lockfile`.

## Workspace Packages

| Package | Path | Role | Key deps |
|---|---|---|---|
| `kwadrans` (root) | `package.json` | scripts `typecheck`, `test`, `build` run recursively | `typescript`, `vitest`, `@types/node` |
| `server` | `apps/server/` | Colyseus + Express server | `@colyseus/core`, `@colyseus/ws-transport`, `express`, `@kwadrans/games` |
| `web` | `apps/web/` | Vite + React frontend | `react`, `react-dom`, `@colyseus/sdk`, `@phosphor-icons/react`, `@fontsource-variable/geist-mono`, `@kwadrans/games` |
| `@kwadrans/games` | `packages/games/` | pure game rules, shared by server and web | `zod` |

Note: `apps/server` must not depend on `zod` directly (a second copy of `@colyseus/core` causes "seat reservation expired"). Schemas live in `packages/games` (`AGENTS.md`).

## Frameworks

**Core:**
- Colyseus `0.18.18` (`@colyseus/core`) - multiplayer room server, `matchMaker`. Used in `apps/server/src/index.ts` and `apps/server/src/LobbyRoom.ts`.
- `@colyseus/ws-transport` `0.18.4` - WebSocket transport, `maxPayload: 32 * 1024` set in `apps/server/src/index.ts`.
- `@colyseus/sdk` `0.18.5` - browser client, used in `apps/web/src/net.ts`.
- Express `5.2.1` - HTTP layer (`/health`, `/api/*`, static frontend) inside the Colyseus `express` hook (`apps/server/src/index.ts`).
- React `19.3.0` / react-dom `19.3.0` - UI (`apps/web/src/main.tsx`, `App.tsx`).
- Vite `8.3.2` with `@vitejs/plugin-react` `^6.1.2` - frontend dev server (port 5173) and build (`apps/web/vite.config.ts`).

**Styling and icons:**
- Tailwind CSS `4.3.3` with `@tailwindcss/vite` `^4.3.3` - plugin in `apps/web/vite.config.ts`.
- `apps/web/src/index.css` - tokens, `.tile .label .btn .field` classes, CSS keyframe animations (no animation library installed; Motion is only planned per `KONCEPT.md`).
- `@phosphor-icons/react` `2.1.10` - icons.
- Fonts: Satoshi variable woff2 in `apps/web/public/fonts/` (self-hosted, `@font-face` in `index.css`); Geist Mono via `@fontsource-variable/geist-mono` `5.3.0` (imported in `apps/web/src/main.tsx`).

**Validation:**
- `zod` `4.6.5` in `packages/games` (move schemas, `moveSchema` in `GameDefinition`).

**Persistence:**
- `node:sqlite` (`DatabaseSync`, built into Node 24) - `apps/server/src/stats.ts`. No ORM, no separate driver package.

**Testing:**
- Vitest `5.0.3` (root devDependency). Test files: `packages/games/src/*.test.ts` (game rules), `apps/server/src/stats.test.ts`.
- Run: `pnpm test` (`pnpm -r test`); single file: `pnpm --filter @kwadrans/games exec vitest run src/<gra>.test.ts`.

**Build/Dev:**
- TypeScript `typecheck` via `tsc -p .` in each package (`noEmit`).
- Vite `build` for web only; server has no build step.
- `node --watch` for server dev.
- `@types/node` `^26.6.4` (root), `@types/express` `^5.0.6` (server), `@types/react` / `@types/react-dom` `^19.3.0` (web).

## Key Dependencies

**Critical:**
- `@colyseus/core` `0.18.18` - room lifecycle, reconnect, seat reservation. Pinned at a version that must match the one resolved with `zod` (see Workspace Packages note).
- `zod` `4.6.5` - single copy, in `packages/games` only.
- `react` `19.3.0` - whole frontend.
- `node:sqlite` - ranking and records storage at `DB_PATH` (default `data/games.db`).

**Infrastructure:**
- `express` `5.2.1` - static file serving of `apps/web/dist` (`webDist` in `apps/server/src/index.ts`).
- `vite` `8.3.2` - frontend toolchain.

## Configuration

**Environment variables (names only):**
- `PORT` - server port, default `2567` (`apps/server/src/index.ts`). Dockerfile sets `PORT=2567`.
- `DB_PATH` - SQLite file path, default `data/games.db` (`apps/server/src/LobbyRoom.ts`). Dockerfile does not set it; the volume is mounted at `/app/data`.
- `NODE_ENV` - `production` in the Docker image.
- `TZ` - `Europe/Warsaw` in `docker-compose.yml`; the daily challenge rolls over at Polish midnight (`apps/server/src/index.ts`, `/api/daily`).
- `import.meta.env.DEV` (Vite) - selects dev server URL `http://<host>:2567` and `/dev` test page in `apps/web/src/net.ts` and `main.tsx`. Not present in production build.
- No `.env` files exist in the repo; `.gitignore` excludes `.env` and `.env.*` except `.env.example`.

**Build:**
- `tsconfig.base.json` (root), `apps/server/tsconfig.json` (types: node), `apps/web/tsconfig.json`, `packages/games/tsconfig.json`.
- `apps/web/vite.config.ts` - React and Tailwind plugins only.
- `pnpm-workspace.yaml` - workspace globs and `allowBuilds`.
- `.dockerignore` - excludes `node_modules`, `dist`, `.env`, `*.db`, `.git`, `cloudflared/*.json`.

**Static assets:**
- `apps/web/public/`: `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `fonts/`.
- PWA without a service worker (per `KONCEPT.md`).

## CI/CD

- `.github/workflows/ci.yml`: on push to `master` and on PRs, job `check` runs `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm --filter web build`. Job `image` (push only) builds and pushes `linux/arm64` image to GHCR via `docker/build-push-action@v6` (QEMU and Buildx set up, GHA cache).
- `Dockerfile`: three stages on `node:24-slim`. `build` (frontend, `--platform=$BUILDPLATFORM`), `deps` (`pnpm install --prod --frozen-lockfile --filter server...`), runtime (copies `apps/server/src`, `packages/games/src`, `apps/web/dist`; runs as `USER node`).
- `docker-compose.yml`: service `games` (`ghcr.io/figielak/kwadrans:latest`, `mem_limit: 256m`, volume `games-data:/app/data`) and `cloudflared` (`cloudflare/cloudflared:latest`, `mem_limit: 64m`).

## Platform Requirements

**Development:**
- Node.js 24 and pnpm 12.9.1.
- Ports: 2567 (server), 5173 (Vite).
- Commands: `pnpm install`, `pnpm --filter server dev`, `pnpm --filter web dev`, `pnpm typecheck && pnpm test`, `pnpm --filter web build`.

**Production:**
- Raspberry Pi (arm64) homelab host running Docker; image built for `linux/arm64`.
- Cloudflare Tunnel exposes `games.figielak.dev` to `http://games:2567` (`cloudflared/config.yml`).
- Container memory limit 256 MB for the game server (`docker-compose.yml`).
- SQLite file in the named Docker volume `games-data`.

---

*Stack analysis: 2026-10-21*

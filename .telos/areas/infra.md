<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: Dockerfile, docker-compose.yml, .dockerignore, cloudflared/, .github/, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, tsconfig.base.json -->
# infra

## Purpose
Workspace config, CI, the Docker image and deployment to the Raspberry Pi through a Cloudflare tunnel.

## Entry points
- `.github/workflows/ci.yml` — typecheck and tests; on `master` builds and pushes the image to GHCR
- `Dockerfile`, `docker-compose.yml` — image; service with `mem_limit: 256m`, `TZ: Europe/Warsaw`, data volume
- `cloudflared/` — tunnel config (routing changes go here)
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` — workspace scripts and shared TS settings

## Invariants
- A push to `master` publishes production; work on a branch, push only on request.
- The SQLite volume must be mounted, or the database is lost on deploy.
- No new dependencies without the user's consent.

## Decisions
- Locally-managed tunnel created with the CLI; the house is behind CGNAT. Details: `.claude/memory/hosting-setup.md`.
- `TZ` decides when the daily challenge changes (Polish midnight).

## Rejected
- Cloudflare Zero Trust tunnel or `TUNNEL_TOKEN` — the user has no Zero Trust.
- Port forwarding — no public IP.

## Pitfalls
- `docker-compose.yml` on the Pi does not update itself; copy it after a change. Until 2026-10-18 it had no volume and lost the database.

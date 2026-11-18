<!-- telos-map: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · files 255 -->
# Map

## Structure
- `packages/games/src/` rules as pure functions, flat: `<id>.ts` next to `<id>.test.ts`
- `apps/server/src/` Colyseus room, SQLite, HTTP API
- `apps/web/src/` client: shell at the root, `screens/` platform screens, `games/` per-game UI
- Root: sources of truth (`KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`, `DESIGN.md`), Docker, CI

## Areas
- games — contract, registry, rules of every game · `packages/games/`
- server — room, persistence, stats, history, API · `apps/server/`
- web-screens — platform screens and shared UI · `apps/web/src/screens/`
- web-games — per-game UI and mini games · `apps/web/src/games/`
- web-shell — bootstrap, connection, dev mode, live · `apps/web/src/net.ts`
- web-style — tokens, animations, UI consistency tests · `apps/web/src/index.css`
- infra — CI, Docker, tunnel, workspace · `Dockerfile`
- docs — sources of truth, plans, repo memory · `KONCEPT.md`

## Find
- Add a main game → `ZASADY.md` §1-6, then games, web-games, web-screens
- Exact rules of a game → `ZASADY-GIER.md` (its section)
- Move path client → server → views → server, web-shell
- Records, history, profile, report → server, web-screens
- Look and animation rules → web-style, `DESIGN.md`

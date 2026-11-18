<!-- telos-area: commit 44d721f9c5805f4a74c7e5979fa64a2d3faa10d5 · 2026-11-18 · paths: apps/web/src/App.tsx, apps/web/src/main.tsx, apps/web/src/Dev.tsx, apps/web/src/net.ts, apps/web/src/resume.ts, apps/web/src/resume.test.ts, apps/web/src/live.ts, apps/web/src/live.test.ts, apps/web/src/moments.ts, apps/web/src/moments.test.ts, apps/web/src/clock.ts, apps/web/src/clock.test.ts, apps/web/src/stimulus.ts, apps/web/src/stimulus.test.ts, apps/web/src/vibrate.ts, apps/web/src/vibrate.test.ts, apps/web/index.html, apps/web/package.json, apps/web/tsconfig.json, apps/web/vite.config.ts, apps/web/public/ -->
# web-shell

## Purpose
Client bootstrap and connection: routing, reconnect and resume, the dev multi-player mode, the decorative `live`
channel, moments and reactions, vibration and timing probes.

## Entry points
- `apps/web/src/main.tsx:12` — routes: `/dev` (dev only), `/statystyki`, otherwise `App`
- `apps/web/src/App.tsx:16` — `App`: screen state, last room view for the evening summary
- `apps/web/src/net.ts:127-219` — `watchRoom`, `watchLive`, `watchReact`, `createRoom`, `joinRoom`, `resumeRoom`, error texts
- `apps/web/src/resume.ts:18` — `resume` after a reload (`RESUME_TRIES`, `RESUME_WAIT_MS`)
- `apps/web/src/Dev.tsx:7` — `/dev?n=4`: frames `/?dev=N`, each with its own token and nick
- `apps/web/src/live.ts`, `apps/web/src/moments.ts` — `live` throttle and store; moments and reactions
- `apps/web/src/vibrate.ts`, `apps/web/src/stimulus.ts`, `apps/web/src/clock.ts` — vibration patterns, stimulus frame, `?zegar` probe

## Invariants
- A reloaded page waits for the server up to 2 minutes and never drops the session token.
- `live` is a decorative client number; it never touches rules, results or records.

## Decisions
- PWA is a manifest and icons only, without a service worker.

## Rejected
- Service worker — the game needs the server anyway.

## Pitfalls
- Playwright tabs share `localStorage`: the second player enters via `http://127.0.0.1:5173` (other origin), Vite with `--host`.
- Leave the dev servers (:2567, :5173) running after work; the user tests by hand.
- To test without touching the user's dev servers: `pnpm --filter web build`, then `PORT=2568 DB_PATH=<scratch> node src/index.ts` in `apps/server` (serves `web/dist`). Never `pkill -f` with a pattern from your own command.

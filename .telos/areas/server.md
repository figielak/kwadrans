<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: apps/server/ -->
# server

## Purpose
Colyseus room (lobby, matches, timers, votes, tournament, reconnect, persistence), SQLite stats, records and
match history, and the HTTP API.

## Entry points
- `apps/server/src/index.ts:11-79` — boot: `restoreRooms` before listening, `maxPayload` 32 KB, `/api/*` routes, `/statystyki`
- `apps/server/src/LobbyRoom.ts:120-177` — `saveRooms` and `restoreRooms`
- `apps/server/src/LobbyRoom.ts:232-455` — `onCreate` and message handlers (`live`, `react`, moves)
- `apps/server/src/LobbyRoom.ts:456-562` — `snapshot` and `restore` of one room
- `apps/server/src/LobbyRoom.ts:575-711` — auth (IP limits), join, `takeOver`, leave
- `apps/server/src/LobbyRoom.ts:876-1036` — `startMatch`, deadlines (`arm`, `expire`), `play`, `finish`
- `apps/server/src/LobbyRoom.ts:1037-1136` — `measure` (match history), `update`, `viewFor` (per-player view)
- `apps/server/src/stats.ts` — `openStats`: wins, records, record matches, `rooms` table
- `apps/server/src/history.ts` — `openHistory`: `matches`, `match_players`, `game_signals`, profile, report

## Invariants
- Every move, including the clock's, passes `validateMove`; `MoveContext` comes from the call site, never from the client.
- Limits: 3 rooms per IP (solo 20), 10 messages/s, reactions 1/s, `live` 2/s; IP from `cf-connecting-ip`.
- Snapshot at most 5 s after a change and on SIGTERM; `rng` and rate counters are not saved.
- A room closed by the server records no match; a history write error never changes the end of a match.

## Decisions
- Places after a match are computed by the server (`RoomView.game.places`), also for main games with ties (07, D-10).
- In the "Inna gra" vote only present `seats` vote and play (07, D-11).

## Rejected
- Direct `zod` dependency in `apps/server` — second `@colyseus/core` copy, "seat reservation expired".

## Pitfalls
- `zod` in this package breaks every join; schemas live in `packages/games`.
- `maxPayload` 32 KB is set by hand without a test; changing drawing encoding (Koło, Kalambury) needs a size check.
- SDK and WebSocket test scripts: at most 10 messages/s per client, or the rate limit gives false failures.
- The 3-rooms-per-IP limit blocks long browser tests; restarting the dev server resets it.
- `cf-connecting-ip` can be spoofed when Cloudflare is bypassed (known risk).

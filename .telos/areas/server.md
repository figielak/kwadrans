<!-- telos-area: commit c63fb3e1abfbfd98b57e743183261d2d59a13136 · 2026-11-19 · paths: apps/server/ -->
# server

## Purpose
Colyseus room (lobby, matches, timers, votes, tournament, reconnect, persistence), SQLite stats, records and
match history, and the HTTP API.

## Entry points
- `apps/server/src/index.ts:11-79` — boot: `restoreRooms` before listening, `maxPayload` 32 KB, `/api/*` routes, `/statystyki`
- `apps/server/src/LobbyRoom.ts:120-177` — `saveRooms` and `restoreRooms`
- `apps/server/src/LobbyRoom.ts:232-455` — `onCreate` and message handlers
- `apps/server/src/LobbyRoom.ts:456-562` — `snapshot` and `restore`
- `apps/server/src/LobbyRoom.ts:575-711` — auth (IP limits), join, `takeOver`, leave
- `apps/server/src/LobbyRoom.ts:876-1036` — `startMatch`, deadlines (`arm`, `expire`), `play`, `finish`
- `apps/server/src/LobbyRoom.ts:1037-1136` — `measure` (match history), `update`, `viewFor` (per-player view)
- `apps/server/src/LobbyRoom.ts:880-909` — `startMatch` takes the daily seed through `dailyAttempt`; `:1058` `measure` writes `daily` and `tie`
- `apps/server/src/history.ts:19` `dailyDay`; `:110` `dailyRanking`, `:122` `duels`, `:138` `dailyTaken`; `apps/server/src/index.ts:41` `/api/daily` (with `?nick=` adds `me`), `:49` `/api/duels?n=…&game=…`
- `apps/server/src/stats.ts` — `openStats`: wins, records, record matches, `rooms` table
- `apps/server/src/history.ts` — `openHistory`: `matches`, `match_players`, `game_signals`, profile, report

## Invariants
- Every move, including the clock's, passes `validateMove`; `MoveContext` comes from the call site, never from the client.
- Limits: 3 rooms per IP (solo 20), 10 messages/s, reactions 1/s, `live` 2/s; IP from `cf-connecting-ip`.
- Snapshot within 5 s of a change and on SIGTERM; `rng` and rate counters are not saved.
- A room closed by the server records no match; a history write error never changes the end of a match.

## Decisions
- Places after a match come from the server (`RoomView.game.places`), also for main games with ties (07, D-10); only present `seats` vote in "Inna gra" (07, D-11).

- Daily challenge (19-05, 19-06): only the first started solo attempt from the tile (`source = 'daily'`, today's game) gets the shared layout and enters the daily ranking (`matches.daily = 1`); abandoned after the start it still uses the day; a database error means a training game, never a second ranked attempt.
- `matches.daily` and `match_players.tie` are added by `PRAGMA table_info` (`history.ts:51`), not `user_version`: a fresh database must still pass the version-3 import first.

## Rejected
- Direct `zod` dependency in `apps/server` — second `@colyseus/core` copy, "seat reservation expired".

## Pitfalls
- `zod` in this package breaks every join; schemas live in `packages/games`.
- `maxPayload` 32 KB has no test; changing Koło or Kalambury drawing encoding needs a size check.
- WebSocket test scripts: at most 10 messages/s per client, or the rate limit gives false failures.
- `node --watch` once missed a save of `index.ts` (19): on old `/api/*` behaviour compare process start with file mtime first.
- `cf-connecting-ip` can be spoofed if Cloudflare is bypassed (known risk).

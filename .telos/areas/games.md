<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: packages/games/ -->
# games

## Purpose
Game rules as pure functions: contract, `GAMES` registry, every game, room messages, tournament, evening, history types.

## Entry points
- `packages/games/src/core.ts:14-52` — `GameDefinition` contract; helpers below it (`createRng`, `ranked`, `standing`, `soloState`, `dailyGame`, `renameId`, `withSum`)
- `packages/games/src/index.ts:172-219` — `GAMES` registry and `MINI_GAME_IDS`
- `packages/games/src/lobby.ts:29-74` — `RoomView`; `ROOM_MESSAGES` further down
- `packages/games/src/turniej.ts`, `packages/games/src/wieczor.ts` — tournament; evening table, titles, vote
- `packages/games/src/profil.ts` — match-history, profile and report types used by server and web
- Patterns to copy: turn-based `packages/games/src/piec-w-rzedzie.ts`; hidden state `packages/games/src/statki.ts`; simultaneous phases with `turn()` `packages/games/src/wyprawa.ts`; mini game with one `result` move `packages/games/src/stoper.ts`; shared quiz mechanics `packages/games/src/quiz.ts`

## Invariants
- Randomness only from `rng`; state is plain JSON; `applyMove` returns a new state.
- `playerView` hides secrets; the observer gets the view for `""`.
- `id` never changes. Renamed in UI, old ids kept: Sekwencja `simon`, Kolor liter `stroop`, Odcień `kolor`, Gomoku `piec-w-rzedzie`.
- A changed state shape of an existing game bumps its `stateVersion`.
- `MINI_GAME_IDS` (games with `minPlayers: 1`) is the only mini-game list.
- Rule change: test and `ZASADY-GIER.md` first, then code; a main game also updates its card in `apps/web/src/screens/howToPlay.ts`.

## Decisions
- Mini-game limit is one deadline from the end of the intro; norm L >= max(1.2·T, T+10 s), exceptions Środek 60 s, Tort 120 s, Który rok? 270 s (04, ZG4-v1).
- Difficulty is drawn from shuffled sets (Liczenie fours, Obrót sixes, W pamięci floor(n/3) multiplications, Balon 11-20 summing 155); Stoper fixed 10 s, Rytm fixed 100 BPM: equal record chances (05).
- `MoveContext.source` is set by the server; Kalambury `hint` is legal only from a timeout (P4-027).
- Old records are never recalculated after a rule change; history is shared (ZG4-v1).
- Kampus Tour economy was approved with the user after simulations: `.claude/memory/kampus-tour-economy.md`.

## Rejected
- Separate random difficulty per board or balloon instead of shuffled sets — unequal chances.
- Random Stoper target (6-14 s) or random Rytm BPM — unequal record chances.
- `turn()` in a mini game (old `kolo.turn`) — renewed the limit after each attempt.

## Pitfalls
- A mini-game timeout must give the worst possible result; "all zeros" or 0 mistakes can beat an honest game (05-03).
- Check timeout-only moves with `context.source === "timeout"`, never a field in client JSON (05-02).
- Rejection-sampling generators (W pamięci, Obrót): run 10 000 seeds for hangs (05-52).
- Multi-seed generator tests can exceed the Vitest default timeout on CI; set an explicit limit.
- The dev server restarts on any change here; rooms come back from SQLite, but a changed state shape without a `stateVersion` bump breaks restored matches.

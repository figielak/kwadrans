<!-- telos-area: commit c63fb3e1abfbfd98b57e743183261d2d59a13136 · 2026-11-19 · paths: packages/games/ -->
# games

## Purpose
Game rules as pure functions: contract, `GAMES` registry, every game, room messages, tournament, evening, history types.

## Entry points
- `packages/games/src/core.ts:14-52` — `GameDefinition` contract; helpers below it (`createRng`, `ranked`, `standing`, `soloState`, `dailyGame`, `renameId`, `withSum`)
- `packages/games/src/core.ts:215` `tableRecord`, `:288` `dailySeed`, `:302` `dailyStreak`; `Duel` and `Profile.daily` in `packages/games/src/profil.ts`
- `packages/games/src/index.ts:172-219` — `GAMES` registry and `MINI_GAME_IDS`
- `packages/games/src/lobby.ts:29-74` — `RoomView`; `ROOM_MESSAGES` further down
- `packages/games/src/turniej.ts`, `packages/games/src/wieczor.ts` — tournament; evening table, titles, vote
- `packages/games/src/profil.ts` — match-history, profile and report types used by server and web
- Patterns to copy: turn-based `piec-w-rzedzie.ts`; hidden state `statki.ts`; simultaneous phases with `turn()` `wyprawa.ts`; mini game `stoper.ts`; shared quiz `quiz.ts` (all in `packages/games/src/`)

## Invariants
- Randomness only from `rng`; state is plain JSON; `applyMove` returns a new state.
- `playerView` hides secrets; the observer gets the view for `""`.
- `id` never changes. Renamed in UI, old ids kept: Sekwencja `simon`, Kolor liter `stroop`, Odcień `kolor`, Gomoku `piec-w-rzedzie`.
- A changed state shape of an existing game bumps its `stateVersion`.
- `MINI_GAME_IDS` (games with `minPlayers: 1`) is the only mini-game list.
- Rule change: test and `ZASADY-GIER.md` first, then code; a main game also updates `howToPlay.ts`.

## Decisions
- Mini-game limit is one deadline from the end of the intro; norm L >= max(1.2·T, T+10 s) (04, ZG4-v1).
- Difficulty comes from shuffled sets, Stoper fixed 10 s, Rytm fixed 100 BPM: equal record chances (05).
- `MoveContext.source` is set by the server; Kalambury `hint` is legal only from a timeout (P4-027).

- Daily challenge seed: FNV-1a of `day:gameId`, used only for `setup`; moves still draw from the room `rng` (19-05).
- `dailyStreak` forgives one missing day when the previous 7 days of the walk had no other miss (19, D-05); numbers are day indices like `dailyGame`.

## Rejected
- Separate random difficulty per board or balloon instead of shuffled sets — unequal chances.
- Random Stoper target (6-14 s) or random Rytm BPM — unequal record chances.
- `turn()` in a mini game (old `kolo.turn`) — renewed the limit after each attempt.

## Pitfalls
- A mini-game timeout must give the worst possible result; "all zeros" or 0 mistakes can beat an honest game (05-03).
- Check timeout-only moves with `context.source === "timeout"`, never a field in client JSON (05-02).
- Rejection-sampling generators (W pamięci, Obrót): run 10 000 seeds for hangs (05-52).
- The dev server restarts on any change here; rooms come back from SQLite, but a changed state shape without a `stateVersion` bump breaks restored matches.

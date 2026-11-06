---
id: 07-02
title: "Etap 1: miejsca po partii w widoku pokoju, także w grach głównych"
type: code
status: done
critical: false
effort: normal
depends: [07-01]
decisions: [D-10]
scope: ["packages/games/src/memory.ts", "packages/games/src/kalambury.ts", "packages/games/src/panstwa-miasta.ts", "packages/games/src/kampus-tour.ts", "packages/games/src/piec-w-rzedzie.ts", "packages/games/src/memory.test.ts", "packages/games/src/kalambury.test.ts", "packages/games/src/panstwa-miasta.test.ts", "packages/games/src/kampus-tour.test.ts", "packages/games/src/piec-w-rzedzie.test.ts", "packages/games/src/lobby.ts", "packages/games/src/core.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "KONCEPT.md"]
---
## Goal
Klient dostaje od serwera gotowe miejsca po partii, także przy remisach w grach głównych, żeby ekran wyników nie liczył ich sam.

## Read first
- packages/games/src/core.ts:30-32 (places)
- packages/games/src/core.ts:75-85 (rankResults, rankPlaces)
- packages/games/src/lobby.ts:42-53 (game w RoomView)
- apps/server/src/LobbyRoom.ts:461-484 (viewFor)
- packages/games/src/kampus-tour.ts:690-700 (isOver)
- packages/games/src/memory.ts:88-95 (isOver)
- packages/games/src/piec-w-rzedzie.ts:102-110 (isOver)
- KONCEPT.md §3

## Files
- packages/games/src/memory.ts (modify)
- packages/games/src/kalambury.ts (modify)
- packages/games/src/panstwa-miasta.ts (modify)
- packages/games/src/kampus-tour.ts (modify)
- packages/games/src/piec-w-rzedzie.ts (modify)
- packages/games/src/memory.test.ts (modify)
- packages/games/src/kalambury.test.ts (modify)
- packages/games/src/panstwa-miasta.test.ts (modify)
- packages/games/src/kampus-tour.test.ts (modify)
- packages/games/src/piec-w-rzedzie.test.ts (modify)
- packages/games/src/lobby.ts (modify)
- packages/games/src/core.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- KONCEPT.md (modify)

## Constraints
- `places` nie zmienia `isOver`, punktów ani rankingu wygranych. Zasady gier zostają, w `core.ts` tylko komentarz kontraktu (D-10).
- Miejsca liczone tymi samymi porównaniami co `isOver`, żeby były spójne z `ranking`.
- Turniej dalej bierze `def.places`; mini-gry bez zmian.

## Tests (write first)
- Memory, Kalambury, Państwa-miasta: `places` 1, 1, 3 oraz 1, 2, 2
- Kampus Tour: równy majątek na górze 1, 1, 3; remis dalszych 1, 2, 2; biedniejszy monopolista 1; dwóch bankrutów w kolejności `ranking`
- Gomoku: pełna plansza 1, 1
- `game.places` w pokoju: Schulte z remisem 1, 1, 3; Szybki Chińczyk z `result.places`
- `game.places` null: walkower, Gomoku z samym zwycięzcą, partia w toku

## Steps
- Testy `places` w pięciu grach i `game.places` w `LobbyRoom.test.ts`.
- `places` w grach, komentarz kontraktu w `core.ts`, KONCEPT §3.
- `lobby.ts` i `viewFor`: `result.ranking ? result.places ?? def.places?.(state) ?? null : null`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter @kwadrans/games exec vitest run src/memory.test.ts` → exit 0
- [x] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0

## Result
RED: testy pięciu gier → exit 1 (12 asercji: brak `places`); testy LobbyRoom → exit 1 (5 asercji: brak `game.places`).
Dodano `places` w pięciu grach i `RoomView.game.places`: pierwszeństwo `result.places`, potem `def.places`; bez rankingu `null`.
GREEN: 312 testów pięciu gier i 44 testy LobbyRoom; pełne `pnpm typecheck` i `pnpm test` → exit 0; `telos accept 07-02` PASS (MANUAL potwierdzone, SCOPE ok).
Zwycięzcy, punktacja, rekordy i naliczanie turnieju bez zmian; kontrakt opisany w KONCEPT §3.
Deviations: apps/server/src/stats.test.ts — brak bieżących zmian; telos accept przypisuje plik do 07-02 z historycznego commita bca0694 (poprzednia, wycofana rozpiska fazy), którego testy pomiaru należą obecnie do ukończonego 07-01.

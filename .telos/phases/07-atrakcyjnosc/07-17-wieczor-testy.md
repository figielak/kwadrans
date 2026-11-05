---
id: 07-17
title: "Tabela wieczoru i Szybka seria: dokumenty i testy (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-16]
decisions: [D-09]
scope: ["KONCEPT.md", "packages/games/src/wieczor.test.ts", "apps/server/src/LobbyRoom.test.ts"]
---
## Goal
Zapisz czyste zasady tabeli wieczoru, tytułów i Szybkiej serii.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- packages/games/src/turniej.ts:59-90 (punkty, tabela)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- packages/games/src/turniej.test.ts:1-30 (styl)

## Files
- KONCEPT.md (modify)
- packages/games/src/wieczor.test.ts (create)
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Wygrane w `scores` dalej zasilają ranking: tabela wieczoru ich nie zastępuje.

## Steps
1. KONCEPT: tabela wieczoru, tytuły, Szybka seria, podsumowanie.
2. `wieczor.test.ts`: `placesFromResult` (`places`, `ranking`, sam `winner`, przerwana daje null), `addGame`, `eveningTable` z remisami, `titles` (zwycięstwa, seria, powrót, pusto przy <2 grach).
3. `LobbyRoom.test.ts`: partia dopisuje wiersz, solo nie; gracz, który wyszedł, zostaje z nickiem; `quickSeries` od gospodarza daje turniej 5 gier z miejscami dla wszystkich, od gościa nic.

## Acceptance
- [ ] Testy padają przez brak `wieczor.ts`
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 1

## Result

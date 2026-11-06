---
id: 07-18
title: Etap 3: tabela wieczoru i Szybka seria
type: code
status: done
critical: false
effort: normal
depends: [07-17]
decisions: [D-08]
scope: ["packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/tables.test.tsx", "KONCEPT.md"]
---
## Goal
Punkty wieczoru widać przy wynikach i na kropkach, a Szybka seria jednym dotknięciem odpala 5 losowych mini-gier.

## Read first
- apps/server/src/LobbyRoom.ts:108-118 (pickTournament)
- apps/server/src/LobbyRoom.ts:160-168 (start)
- apps/server/src/LobbyRoom.ts:318-326 (startTournamentGame)
- apps/web/src/screens/Game.tsx:300-331 (odznaka kropek)
- packages/games/src/turniej.ts:5-6 (MIN_LENGTH, DEFAULT_LENGTH)
- apps/web/src/screens/Lobby.tsx:81-90 (Zestawy)

## Files
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- KONCEPT.md (modify)

## Constraints
- Szybka seria to zwykły `begin` z `turniej.ts`, bez ekranu ustawień i bez gotowości gości; grają wszyscy w pokoju. Pełny Turniej zostaje.
- W turnieju kropki dalej pokazują punkty turnieju. Tabela wieczoru pod bohaterem dopiero przy 2+ grach.
- Odznaka na kropce to punkty wieczoru, poza nią `scores` bez zmian.
- Tabela przy wynikach nie może być większa od bohatera.

## Tests (write first)
- `LobbyRoom.test.ts`: `quickSeries` od gospodarza → turniej 5 gier z miejscami dla wszystkich; od gościa, poza lobby → nic; przy 6 graczach też
- `tables.test.tsx`: tabela z remisem i graczem, który wyszedł; brak tabeli przy mniej niż 2 grach

## Steps
- KONCEPT §2.4; testy.
- `lobby.ts`: `quickSeries`, `QUICK_SERIES_LENGTH = 5`; `LobbyRoom`: obsługa.
- `ui.tsx`, `Game.tsx`: `EveningTable` przy wynikach i po dotknięciu kropek, odznaka.
- `Lobby.tsx`: kafel „Szybka seria” w Zestawach.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/screens/tables.test.tsx` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0

## Result
Dodano `quickSeries` (`QUICK_SERIES_LENGTH = 5`): gospodarz w lobby odpala turniej 5 gier, siadają wszyscy z pokoju, bez gotowości.
`EveningTable` (ui.tsx) pokazuje się przy wynikach (poza turniejem) po 2+ grach i po dotknięciu kropek; odznaka na kropce to punkty wieczoru.
Kafel „Szybka seria” w Zestawach, opis w KONCEPT §2.4 i regułach platformy.
Testy: 3 serwerowe (RED: brak handlera) i 2 tabeli; `pnpm test` 143 serwer + 350 web zielone.
Niespodzianka: `openRoom(3)` dodaje czwartego uczestnika, więc test oczekuje 4 miejsc.
Deviations: apps/web/src/live.ts, apps/web/src/live.test.ts, packages/games/src/index.ts, packages/games/src/wieczor.ts, packages/games/src/wieczor.test.ts — niezatwierdzona praca z 07-17 leżąca w drzewie (bez nich LobbyRoom.ts się nie buduje)

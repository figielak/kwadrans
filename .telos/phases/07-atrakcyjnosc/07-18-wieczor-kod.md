---
id: 07-18
title: "Tabela wieczoru i Szybka seria: kod (Codex)"
type: code
status: approved
critical: false
effort: normal
depends: [07-17]
decisions: [D-09]
scope: ["packages/games/src/wieczor.ts", "packages/games/src/index.ts", "packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/ui.tsx"]
---
## Goal
Pokój pamięta wieczór: punkty przy wynikach i na kropkach oraz Szybka seria jednym dotknięciem.

## Read first
- packages/games/src/turniej.ts:59-90
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/server/src/LobbyRoom.ts:108-118 (pickTournament)
- apps/web/src/screens/Game.tsx:307-331 (badge kropek)

## Files
- packages/games/src/wieczor.ts (create)
- packages/games/src/index.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-17 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Punkty przez `gamePoints` z `turniej.ts`, bez drugiej implementacji. Szybka seria to zwykły `begin`, bez ekranu ustawień.
- Czyste funkcje bez `Date.now` i `Math.random`.

## Tests (write first)
- `wieczor.test.ts`: placesFromResult, addGame, eveningTable, titles
- `LobbyRoom.test.ts`: zapis wieczoru, solo, wyjście, `quickSeries`

## Steps
1. `wieczor.ts` i eksport.
2. `lobby.ts`: `RoomView.evening`, wiadomość `quickSeries`, `QUICK_SERIES_LENGTH = 5`.
3. `LobbyRoom.finish`: `addGame`; obsługa `quickSeries`.
4. Klient: tabela przy wynikach, odznaka na kropce, przycisk w lobby.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

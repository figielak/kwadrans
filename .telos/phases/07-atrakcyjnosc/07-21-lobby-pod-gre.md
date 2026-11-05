---
id: 07-21
title: "Etap 3: lobby ustawione pod grę i życzenia gości"
type: code
status: approved
critical: false
effort: normal
depends: [07-18]
decisions: [D-08]
scope: ["packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/MiniGames.tsx", "apps/web/src/App.tsx", "apps/web/src/screens/lists.test.ts", "KONCEPT.md", "DESIGN.md"]
---
## Goal
Lobby od góry do dołu służy grze: po dołączeniu drugiej osoby kod się zwija, gry są na pierwszym ekranie, a goście wskazują, w co chcą grać.

## Read first
- apps/web/src/screens/Lobby.tsx:64-107 (Lobby)
- apps/web/src/screens/Lobby.tsx:108-125 (Players)
- apps/web/src/screens/Lobby.tsx:195-210 (StartBar)
- apps/web/src/screens/Lobby.tsx:423-440 (Code)
- apps/web/src/screens/MiniGames.tsx:83-125
- apps/web/src/App.tsx:20-24 (mini)
- DESIGN.md §3.2

## Files
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/MiniGames.tsx (modify)
- apps/web/src/App.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)
- KONCEPT.md (modify)
- DESIGN.md (modify)

## Constraints
- Sam w pokoju: kod zostaje duży, bo trzeba go przekazać. Od 2 osób kod w `TopBar`, kolory w jednej linii.
- Goście dotykają gier: `wish` tylko w lobby, null kasuje, start i `pickGame` czyszczą. Gospodarz wybiera sam.
- Lista mini-gier otwarta u gościa też lokalnie, jak u gospodarza; dotknięcie to `wish`, nie `pickGame`.
- Życzenie to kropka gracza przy grze, kolor gracza z tokenów. Jeden wypełniony przycisk na ekranie.
- Ekran mieści się na 360×640 z 2 i 6 graczami; długie nicki ucięte.

## Tests (write first)
- `LobbyRoom.test.ts`: `wish` od gościa, zmiana, null, poza lobby nic; start i `pickGame` czyszczą; gra spoza `GAMES` odpada
- `lists.test.ts`: `wishDots` przypisuje kropki do gier, gracz, który wyszedł, znika

## Steps
- KONCEPT §3; testy.
- `lobby.ts`: `wish`, `RoomView.wishes`; `LobbyRoom`: obsługa i czyszczenie.
- `Lobby.tsx`: układ, `TopBar`, kolory, kropki życzeń, kafle u gości.
- `MiniGames.tsx`, `App.tsx`: lista dla gościa.
- DESIGN §3.2 i sprawdzenie 360×640.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm --filter web exec vitest run src/screens/lists.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] Odbiór w `/dev?n=2` i `?n=6`: „Szybka seria” i gry bez przewijania

## Result

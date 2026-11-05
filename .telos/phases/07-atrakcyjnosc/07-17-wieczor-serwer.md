---
id: 07-17
title: "Etap 3: pamięć wieczoru w pokoju"
type: code
status: approved
critical: false
effort: hard
depends: [07-02, 07-16]
decisions: [D-08]
scope: ["packages/games/src/wieczor.ts", "packages/games/src/wieczor.test.ts", "packages/games/src/index.ts", "packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "KONCEPT.md"]
---
## Goal
Pokój pamięta wieczór: każda partia daje punkty jak w turnieju, a widok niesie gotową tabelę i tytuły.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- packages/games/src/turniej.ts:71-74 (gamePoints)
- packages/games/src/turniej.ts:76-95 (standings, tablePlaces)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- packages/games/src/core.ts:75-85

## Files
- packages/games/src/wieczor.ts (create)
- packages/games/src/wieczor.test.ts (create)
- packages/games/src/index.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- KONCEPT.md (modify)

## Constraints
- Punkty przez `gamePoints`, bez drugiej implementacji; miejsca z `game.places` lub zwycięzcy, jak bohater (07-04).
- Osoby kluczuje `nickKey`: kto wyjdzie i wróci, zachowuje punkty, a pokazywana jest ostatnia pisownia.
- Widok niesie gotową tabelę i tytuły o stałym rozmiarze. Historia partii zostaje na serwerze, bo `room` idzie przy każdej wiadomości.
- Wygrane w `scores` dalej zasilają ranking; tabela wieczoru ich nie zastępuje.
- Czyste funkcje bez `Date.now` i `Math.random`. Bez zapisu do SQLite: pamięć żyje tyle, co pokój.

## Tests (write first)
- `wieczor.test.ts`: `placesFromResult`, `addGame`, `eveningTable`, `titles` dla każdego punktu Edge cases
- `LobbyRoom.test.ts`: partia dopisuje wiersz, solo nie; wyjście gracza; rozmiar `room` po 100 partiach stały

## Interface
- placesFromResult(result, places, seats) → Record<PlayerId, number> | null
- addGame(evening, gameId, rows: { key, nick, place }[]) → Evening
- eveningTable(evening) → { key, nick, points, wins }[]
- titles(evening) → { title, nick, detail }[]  // najwięcej zwycięstw, najlepsza seria, największy powrót
- RoomView.evening: { games: number; played: string[]; table; titles }

## Edge cases
- partia przerwana `{}` → brak wpisu
- solo i pokój z jednym grającym → brak wpisu
- walkower → brak punktów, bo w `seats` został jeden
- remis → te same punkty
- gracz wyszedł → zostaje w tabeli z nickiem
- ten sam nick po powrocie → te same punkty
- gra turnieju → wpis na każdą grę
- mniej niż 2 gry → `titles` puste
- największy powrót: największa strata do lidera, odrobiona przez końcowego lidera; brak straty → bez tytułu
- seria: najdłuższy ciąg gier z miejscem 1, remis się liczy

## Steps
1. KONCEPT §3: tabela wieczoru i tytuły.
2. Testy padają na brak `wieczor.ts`.
3. `wieczor.ts`, eksport w `index.ts`.
4. `lobby.ts`: `RoomView.evening`.
5. `LobbyRoom.finish`: `addGame` przed ścieżkami turnieju; tabela i tytuły liczone raz na partię.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 0
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

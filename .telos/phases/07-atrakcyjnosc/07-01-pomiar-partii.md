---
id: 07-01
title: Etap 0: pomiar partii w pokoju i odczyt miar
type: code
status: draft
critical: false
effort: normal
depends: []
decisions: [D-08, D-09]
scope: ["apps/server/src/stats.ts", "apps/server/src/stats.test.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "apps/server/src/metrics.ts"]
---
## Goal
Każda partia zostawia anonimowy wpis, a miary z planu §10 da się odczytać skryptem na Pi. To punkt odniesienia dla wszystkich kolejnych etapów.

## Read first
- apps/server/src/stats.ts:16-31 (tabele, migracje)
- apps/server/src/stats.ts:64-104 (zapis i odczyt)
- apps/server/src/LobbyRoom.ts:85-92 (onCreate)
- apps/server/src/LobbyRoom.ts:224-248 (onLeave: miejsca znikają przed finish)
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/server/src/LobbyRoom.ts:444-452 (błąd ruchu po limicie)
- apps/server/src/LobbyRoom.test.ts:38-75 (harness pokoju)
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/server/src/stats.ts (modify)
- apps/server/src/stats.test.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/server/src/metrics.ts (create)

## Constraints
- `room_games` bez nicków, klucz pokoju losowy z `node:crypto`, nie kod pokoju (kody wracają). `played_days` ma tylko `nick_key` i `day`, bez pokoju i gry (D-09).
- Bez publicznego endpointu: miary czyta skrypt (`DB_PATH`, argument to liczba dni, domyślnie 7), wypisuje JSON. `CREATE TABLE IF NOT EXISTS`, bez zmian istniejących tabel.
- Miary: pokój 2+ bez ukończonej partii wchodzi do mediany i `rooms3Plus` jako 0; odsetki to ułamki 0-1 bez zaokrąglania; wpis o `at === since` się liczy; mediana parzystej liczby pokoi to średnia dwóch środkowych.
- `completed` także po wygaśnięciu limitu (partia z rankingiem); `aborted` tylko przy `finish({})`. `walkover` i `aborted` nie dopisują dnia i nie są kolejną partią.
- Gotowe testy leżą w historii: `git show bca0694:apps/server/src/stats.test.ts` i `git show bca0694:apps/server/src/LobbyRoom.test.ts` (zestaw wzorcowy i harness `openRoom`). Przenieś je, sprawdzając zgodność z tym zadaniem.
- Lekcja [tests]: testy przez WebSocket do 10 wiadomości/s; tu wystarczy harness bez sieci.

## Tests (write first)
- `metrics`: zestaw wzorcowy pokoi A, B, C, D, E, S daje `medianGames` 1.5, `nextRate` 0.5, `rooms3Plus` 0.25, `interrupted` 3, `returningNicks` 4
- pusta baza daje zera; solo i pokój z jednym grającym nie wchodzą do miar ani dni
- „Ala” i „ala” to jedna osoba; dwie partie jednej doby to jeden dzień, 23:30 i 00:30 to dwa (doba lokalna)
- `PRAGMA table_info(room_games)` nie ma kolumny z nickiem
- pokój: Gomoku do końca → `players: 2`, `completed`, dwa nicki
- pokój: wyjście w 1v1 → `players: 2`, `walkover`, nigdy `players: 1`; wyjście 1 z 3 → `players: 3`, `aborted`
- pokój: solo → `players: 1`; obserwator się nie liczy; rewanż ma ten sam `roomKey`, drugi pokój inny
- pokój: turniej daje wpis na grę, wyjście w trakcie `aborted`, błąd ruchu po limicie `aborted`, zawsze jeden wpis na partię

## Steps
- Przenieś testy z `bca0694`, zobacz, że padają na brak `recordRoomGame` i `metrics`.
- `stats.ts`: obie tabele, `recordRoomGame({ roomKey, gameId, players, outcome, nicks, at? })`, `metrics(since)` → `{ medianGames, nextRate, rooms3Plus, returningNicks, interrupted }`. Dzień dopisuje tylko `completed` przy `players >= 2`.
- `LobbyRoom`: klucz w `onCreate`, liczba miejsc w `match` przy `startMatch` (bo `onLeave` zmienia `seats` przed `finish`).
- `finish(result, outcome = "completed")`: `onLeave` podaje `walkover` przy zwycięzcy, inaczej `aborted`; błąd ruchu `aborted`. Jeden zapis, zanim rozejdą się ścieżki turnieju.
- `metrics.ts`: odczyt przez `openStats`, wydruk JSON.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/stats.test.ts` → exit 0
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

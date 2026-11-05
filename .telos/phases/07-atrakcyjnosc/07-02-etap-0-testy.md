---
id: 07-02
title: "Etap 0: testy pomiaru (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-01]
decisions: [D-07, D-09, D-11, D-13]
scope: ["apps/server/src/stats.test.ts", "apps/server/src/LobbyRoom.test.ts"]
---
## Goal
Testy tabeli `room_games`, dni gry z innymi, miar z planu §10 i zapisu z prawdziwego pokoju, zanim powstanie kod.

## Read first
- apps/server/src/stats.ts:16-31 (tabele, migracje)
- apps/server/src/stats.ts:64-104 (zapis i odczyt)
- apps/server/src/stats.test.ts:1-20 (styl)
- apps/server/src/LobbyRoom.ts:239-248 (onLeave: miejsca znikają przed finish)
- apps/server/src/LobbyRoom.test.ts:38-75 (harness pokoju)
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/server/src/stats.test.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- `room_games` bez nicków (plan §10), klucz pokoju losowy, nie kod pokoju (kody wracają).
- D-11: powroty tylko z `played_days`, zdanie planu §10 o liczeniu z obecnej bazy już nie obowiązuje.

## Steps
1. `stats.test.ts`: `recordRoomGame({ roomKey, gameId, players, outcome, nicks, at? })` i `metrics(since)` → `{ medianGames, nextRate, rooms3Plus, returningNicks, interrupted }`. `players` to liczba miejsc przy starcie partii, `outcome`: `completed`, `walkover` albo `aborted`.
2. Miary tylko z wpisów `players >= 2`: mediana ukończonych partii na pokój, odsetek ukończonych partii, po których w tym pokoju była kolejna ukończona, odsetek pokoi z 3+ ukończonymi, `returningNicks` (osoby z 2+ różnymi dniami od doby `since`), `interrupted` (liczba walkowerów i partii przerwanych).
3. Brzegi: pusta baza daje zera; solo i pokój z jednym grającym nie wchodzą do miar ani dni, nawet przez dwa dni; `walkover` i `aborted` nie dopisują dnia i nie są kolejną partią; „Ala” i „ala” to jedna osoba; dwie partie w jednej dobie to jeden dzień, a 23:30 i 00:30 to dwa (doba lokalna, `new Date(r, m, d, h, min)`); `room_games` nie ma kolumny z nickiem (`PRAGMA table_info`). Jeden pokój z samymi `aborted`: mediana 0, `nextRate` 0, `rooms3Plus` 0, `interrupted` równe ich liczbie.
   Zestaw wzorcowy (D-13), `since` to północ 1 listopada, `players: 2`:
   - A: `completed` o `at === since` (Ala, Olek), `completed` tego samego dnia (Ala, Olek), `completed` 2 listopada (Olek, Bartek)
   - B: `completed` 1 listopada (Cela, Bartek), `walkover` 2 listopada (Cela), `completed` 2 listopada (ala, Dawid)
   - C: `completed` 1 listopada (Ewa, Dawid)
   - D: `aborted` dwa razy 2 listopada
   - E: `completed` 1 ms przed `since` (Franek, Ewa), a poza tym ani jednego wpisu
   - S: `players: 1` przez oba dni (Gosia)
   Oczekiwane: `medianGames` 1.5 (3, 2, 1, 0), `nextRate` 0.5 (3 z 6), `rooms3Plus` 0.25 (1 z 4), `interrupted` 3. `returningNicks` 4: Ala, Olek, Bartek i Dawid mają po dwa dni; Cela (dzień z walkoweru się nie liczy), Ewa, Franek i Gosia nie.
4. `LobbyRoom.test.ts`, szpieg na `stats.recordRoomGame`, harness zwraca też `room`: Gomoku do końca → `players: 2`, `completed`, dwa nicki; wyjście w 1v1 przez `room.onLeave(client, CloseCode.CONSENTED)` → `players: 2`, `walkover`, nigdy `players: 1`; wyjście 1 z 3 → `players: 3`, `aborted`; solo → `players: 1`; obserwator się nie liczy; rewanż → ten sam `roomKey`, drugi pokój → inny; turniej → wpis na każdą grę, wyjście w trakcie → `aborted`; błąd ruchu po limicie → `aborted`; zawsze jeden wpis na partię.

## Acceptance
- [ ] Testy padają przez brak metod, nie przez błąd składni
- [ ] `pnpm --filter server exec vitest run src/stats.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1

## Result

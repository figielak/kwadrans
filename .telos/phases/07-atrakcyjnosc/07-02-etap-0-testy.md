---
id: 07-02
title: "Etap 0: testy pomiaru (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-01]
decisions: [D-07, D-09]
scope: ["apps/server/src/stats.test.ts"]
---
## Goal
Testy tabeli `room_games` i miar z planu §10, zanim powstanie kod.

## Read first
- apps/server/src/stats.ts:16-31 (tabele, migracje)
- apps/server/src/stats.ts:64-104 (zapis i odczyt)
- apps/server/src/stats.test.ts:1-20 (styl)
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/server/src/stats.test.ts (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Tabela bez nicków (plan §10), klucz pokoju losowy, nie kod pokoju (kody wracają).

## Steps
1. Opisz `recordRoomGame(roomKey, gameId, players, completed)` i `metrics(since)` testami.
2. Miary: mediana partii w pokojach 2+, odsetek partii z kolejną, odsetek pokoi 3+, nicki grające z innymi w 2+ dni tygodnia.
3. Brzegi: pusta baza daje zera, pokoje solo nie wchodzą do miar, partia przerwana nie liczy się jako kolejna.

## Acceptance
- [ ] Testy padają przez brak metod, nie przez błąd składni
- [ ] `pnpm --filter server exec vitest run src/stats.test.ts` → exit 1

## Result

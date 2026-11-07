# 08 · Podróbka
## Goal
Nowa gra główna `podrobka` (3-6 osób, 6 rund): każdy odpowiada na prywatne pytanie, jedna tajna osoba dostaje inne, podobne, potem tajne głosowanie i odsłona.
Faza kończy się po TDD, puli 60 par, ekranie, podpięciu i odbiorze 3/6 graczy z obserwatorem.

## Decisions
- D-01: Przyjęte zasady z `.planning/PODROBKA-PLAN.md` §9 jako jedna propozycja: 3-6 osób, 6 rund, nieznana rola podczas pisania, niezależne losowanie ról, limity 30/60/15 s, wykrycie przez samodzielne prowadzenie od dwóch głosów, punktacja 2/3, anulowanie rundy z brakującą odpowiedzią, 60 par pytań. Plan §9 wymaga jawnej akceptacji użytkownika.

## Constraints
- Praca na gałęzi `faza/08-podrobka`, commity na niej bez pytania (zgoda z 2026-11-06), merge przy `/telos:done`, push tylko na prośbę. Zastępuje zdanie z planu §7 pkt 2 o osobnej prośbie o commit.
- Testy zasad idą osobnym commitem przed kodem (AGENTS.md, ZASADY §2).
- Plan §7 pkt 5 wymienia `OWN_RANKING`, którego już nie ma: tabela końcowa stoi w `ResultDetails`, zabraniają go `tables.test.tsx` i `lists.test.ts`.
- Wpis w CHANGELOG dopiero przed publikacją na `master`, poza fazą.
- Własna nazwa, pytania i opisy, bez nazw istniejących gier.

## Open questions
- none

## Carried over
- none

## Links
- .planning/PODROBKA-PLAN.md
- .telos/PROPOSALS.md §Podróbka (POD-01..07)

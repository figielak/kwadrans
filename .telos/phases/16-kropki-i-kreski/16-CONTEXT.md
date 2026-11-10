# 16 · Kropki i kreski
## Goal
Nowa gra główna `kropki-i-kreski` (2-4 osoby): gracze dorysowują kreski między kropkami, a kto zamknie kwadrat, dostaje punkt i kolejny ruch.
Faza kończy się po TDD, ekranie, podpięciu i odbiorze technicznym 2 i 4 graczy z obserwatorem.

## Decisions
- D-01: 2-4 graczy (odpowiedź użytkownika, 2026-11-09).
- D-02: Trzy rozmiary planszy jako tryby w lobby: 3×3, 5×5 (domyślny) i 7×7 kwadratów (odpowiedź użytkownika, 2026-11-09).
- D-03: Na każdej planszy wybór i potwierdzenie: pierwsze dotknięcie pokazuje kreskę, drugie w tym samym miejscu albo przycisk ją stawia (odpowiedź użytkownika, 2026-11-09).
- D-04: Założenia planu zaakceptowane przez użytkownika (2026-11-09): `id` to `kropki-i-kreski`, limit tury 60 s, po limicie losowa wolna kreska, remis na szczycie bez zwycięzcy, nazwa w UI „Kropki i kreski” mimo zalecenia najwyżej dwóch słów z ZASADY §1. → HISTORY

## Constraints
- Praca na gałęzi `faza/16-kropki-i-kreski`, commity w trakcie, merge przy `/telos:done`, push tylko na prośbę.
- `id` to `kropki-i-kreski`, bo `kropki` należy do mini-gry Policz kropki; nazwa w UI „Kropki i kreski” pochodzi z polecenia użytkownika.
- Bez zadania „próba z ludźmi”: faza kończy się na odbiorze technicznym.
- Wpis w CHANGELOG dopiero przed publikacją na `master`, poza fazą.

## Open questions
- none

## Carried over
- none

## Links
- ZASADY.md §1, §2, §6
- ZASADY-GIER.md §14 (powstaje w 16-01)

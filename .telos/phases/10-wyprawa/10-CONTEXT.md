# 10 · Wyprawa
## Goal
Nowa gra główna `wyprawa` (2-6 osób): wspólny szlak, tajne równoczesne decyzje powrotu, bank i ryzyko drugiego takiego samego zagrożenia.
Faza kończy się po TDD, ekranie, podpięciu i odbiorze 2/6 graczy z obserwatorem.

## Decisions
- D-01: Przyjęte zasady z `.planning/WYPRAWA-PLAN.md` §7: 5 wypraw, podana talia (15 skarbów 1-15, 5 zagrożeń po 3), drugie identyczne zagrożenie kończy wyprawę, jednoczesny podział reszt, bank jawny, timeout decyzji to „Wracam”.
- D-02: Testy zasad idą osobnym commitem przed kodem na gałęzi fazy (AGENTS.md, ZASADY §2 i zgoda na commity w fazie z 2026-11-06), zamiast zdania z planu §6 „osobny commit testów tylko na prośbę użytkownika”.
- D-03: Rozpiska powstaje wprost z `.planning/WYPRAWA-PLAN.md`, bez wzorowania na planach poprzednich faz (polecenie użytkownika).

## Constraints
- Praca na gałęzi `faza/10-wyprawa`, merge przy `/telos:done`, push tylko na prośbę.
- Nie stage'ować niezwiązanych zmian w drzewie (usunięte pliki `.telos/phases/11-sabotaz/`).
- Plan §6 wymienia `OWN_RANKING`, którego już nie ma: gra końcowa stoi w `ResultDetails`.
- Wpis w CHANGELOG dopiero przed publikacją na `master`, poza fazą.

## Open questions
- none

## Carried over
- none

## Links
- .planning/WYPRAWA-PLAN.md
- .telos/PROPOSALS.md §Wyprawa (WYP-01..05)

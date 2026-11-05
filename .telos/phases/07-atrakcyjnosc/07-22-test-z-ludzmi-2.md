---
id: 07-22
title: "Test z ludźmi po etapie 3 i decyzja o dalszych etapach (Ty)"
type: audit
status: approved
critical: false
effort: normal
depends: [07-21]
decisions: [D-06, D-07]
scope: [".telos/"]
---
## Goal
Drugi wieczór, porównanie z pierwszym i decyzja o kolejności etapów 4-5 oraz Blefa na kościach.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §7-10

## Files
- none

## Constraints
- Wykonawca: użytkownik. Wdrożenie na `master` tylko na jego prośbę.
- Graczy jest mało: liczby pokazują kierunek, rozstrzyga obserwacja (plan §10).

## Steps
1. Wdróż etapy 2-3 i rozegrajcie wieczór w podobnym składzie.
2. Porównaj notatki i miary z Result 07-07.
3. Claude zapisuje wnioski w Result.
4. Decyzja: co z etapów 4-5, co wyłączyć i kiedy Blef na kościach (faza 09).

## Acceptance
- [ ] Porównanie i decyzja są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

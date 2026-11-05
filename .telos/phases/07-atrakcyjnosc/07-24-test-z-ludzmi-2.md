---
id: 07-24
title: "Test z ludźmi po etapie 3"
type: audit
status: approved
critical: false
effort: normal
depends: [07-23]
decisions: [D-06]
scope: [".telos/"]
---
## Goal
Drugi wieczór, porównanie z pierwszym i decyzja o etapach 4-5, grach imprezowych i tym, co wyłączyć.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §7-10
- 07-08 §Result (punkt odniesienia)

## Files
- none

## Constraints
- Prowadzi użytkownik. Wdrożenie na `master` tylko na jego prośbę.
- Graczy jest mało: liczby pokazują kierunek, rozstrzyga obserwacja (plan §10).

## Steps
- Wdróż etapy 2-3 i rozegrajcie wieczór w podobnym składzie.
- Porównaj notatki i miary z Result 07-08.
- Claude zapisuje wnioski w Result.
- Decyzja: co z etapów 4-5, co wyłączyć i kiedy Blef na kościach (faza 09).

## Acceptance
- [ ] Porównanie i decyzja są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

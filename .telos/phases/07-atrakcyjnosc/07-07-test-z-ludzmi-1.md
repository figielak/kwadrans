---
id: 07-07
title: "Test z ludźmi przed etapem 2 (Ty)"
type: audit
status: approved
critical: false
effort: normal
depends: [07-06]
decisions: [D-06]
scope: [".telos/"]
---
## Goal
Jeden wieczór 3-4 osób na własnych telefonach z etapami 0-1 na produkcji, żeby mieć punkt odniesienia przed rywalizacją.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- none

## Constraints
- Wykonawca: użytkownik. Wdrożenie na `master` tylko na jego prośbę.
- Punkt odniesienia z `room_games` jest tylko dla partii rozegranych po wdrożeniu etapu 0.

## Steps
1. Wdróż etapy 0-1 i rozegrajcie wieczór.
2. Obserwuj: reakcje na głos, kto prosi o kolejną, gdzie się nudzicie, kiedy i dlaczego kończycie.
3. Odczytaj `metrics.ts` z bazy na Pi.
4. Claude zapisuje notatki i miary w Result; duże zaskoczenia → `/telos:revise` etapu 2.

## Acceptance
- [ ] Notatki z wieczoru i miary są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

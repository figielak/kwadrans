---
id: 07-08
title: "Test z ludźmi przed etapem 2"
type: audit
status: approved
critical: false
effort: normal
depends: [07-07]
decisions: [D-06]
scope: [".telos/"]
---
## Goal
Jeden wieczór 3-4 osób na własnych telefonach z etapami 0-1 na produkcji: punkt odniesienia przed rywalizacją w trakcie.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- none

## Constraints
- Prowadzi użytkownik. Wdrożenie na `master` tylko na jego prośbę; najpierw scalenie gałęzi.
- `room_games` zawiera tylko partie rozegrane po wdrożeniu etapu 0.

## Steps
- Wdróż etapy 0-1 i rozegrajcie wieczór.
- Obserwuj: reakcje na głos, kto prosi o kolejną, gdzie się nudzicie, kiedy i dlaczego kończycie.
- Odczytaj `metrics.ts` z bazy na Pi.
- Claude zapisuje notatki i miary w Result; duże zaskoczenie → `/telos:revise` etapu 2.

## Acceptance
- [ ] Notatki z wieczoru i miary są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

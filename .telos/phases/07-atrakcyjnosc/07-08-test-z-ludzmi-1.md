---
id: 07-08
title: "Test z ludźmi przed etapem 2"
type: audit
status: done
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
POMINIĘTE decyzją użytkownika (2026-11-06): wieczoru z ludźmi nie było, etapy 0-1 nie zostały na jego potrzeby wdrożone, notatek ani miar brak.
Skutek: etap 2 rusza bez punktu odniesienia z testu; pierwsze porównanie da dopiero 07-24 (test po etapie 3). `room_games` zbiera dane dopiero od wdrożenia etapu 0.
Status `done` tylko dlatego, że telos nie ma statusu „pominięte”, a 07-09 od tego zadania zależy; punkt o notatkach celowo nieodhaczony.
Deviations: none

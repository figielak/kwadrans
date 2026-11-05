---
id: 07-08
title: "Etap 2: przegląd planu (Codex)"
type: audit
status: approved
critical: false
effort: normal
depends: [07-07]
decisions: [D-08, D-09]
scope: [".telos/"]
---
## Goal
Niezależny przegląd zadań etapu 2 na kodzie po etapie 1 i po pierwszym teście.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5
- apps/server/src/LobbyRoom.ts:170-175 (begin)
- apps/server/src/LobbyRoom.ts:259-277 (on z limitem)
- apps/web/src/screens/ui.tsx:423-495 (Intro)
- apps/web/src/net.ts:101-122 (watchRoom)

## Files
- none

## Constraints
- Wykonawca: Codex, tylko do odczytu; Claude przepisuje ustalenia do Result. Blokujący problem → `/telos:revise` przed testami.
- Nie oceniamy ponownie decyzji D-01..D-09, tylko to, czy zadania je wiernie i wykonalnie realizują.

## Steps
1. Codex czyta zadania 07-09..07-15 i kod z Read first.
2. Sprawdza: wyścigi w odliczaniu, koszt `live` przy 6 graczach na Pi, spójność klasyfikacji 30 gier, czy podgląd nie odsłania ukrytych danych, czy reakcje nie psują pomiaru.
3. Każde ustalenie: zadanie, plik:linia, skutek, propozycja.
4. Claude zapisuje werdykt `OK` albo listę poprawek do Result.

## Acceptance
- [ ] Werdykt i ustalenia są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

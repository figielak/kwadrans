---
id: 07-01
title: "Etapy 0-1: przegląd planu (Codex)"
type: audit
status: approved
critical: false
effort: normal
depends: []
decisions: [D-08, D-09]
scope: [".telos/"]
---
## Goal
Niezależny przegląd zadań etapów 0-1 przed napisaniem testów.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §4, §10
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/web/src/screens/Game.tsx:425-504 (ekran po partii)

## Files
- none

## Constraints
- Wykonawca: Codex, tylko do odczytu; Claude przepisuje ustalenia do Result. Blokujący problem → `/telos:revise` przed testami.
- Nie oceniamy ponownie decyzji D-01..D-09, tylko to, czy zadania je wiernie i wykonalnie realizują.

## Steps
1. Codex czyta zadania 07-02..07-06 i kod z Read first.
2. Sprawdza: czy interfejsy pasują do kodu, czego brakuje w testach i brzegach, czy solo bez timera nie zostawia wiszących pokoi, czy ResultHero działa dla gier bez `record`.
3. Każde ustalenie: zadanie, plik:linia, skutek, propozycja.
4. Claude zapisuje werdykt `OK` albo listę poprawek do Result.

## Acceptance
- [ ] Werdykt i ustalenia są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

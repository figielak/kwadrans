---
id: 07-16
title: "Etap 3: przegląd planu (Codex)"
type: audit
status: approved
critical: false
effort: normal
depends: [07-15]
decisions: [D-08, D-09]
scope: [".telos/"]
---
## Goal
Niezależny przegląd zadań etapu 3 na kodzie po etapie 2.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- apps/server/src/LobbyRoom.ts:183-198 (rewanż, toLobby)
- apps/server/src/LobbyRoom.ts:318-337 (turniej, rewanż)
- packages/games/src/turniej.ts:59-76 (create, begin, gamePoints)

## Files
- none

## Constraints
- Wykonawca: Codex, tylko do odczytu; Claude przepisuje ustalenia do Result. Blokujący problem → `/telos:revise` przed testami.
- Nie oceniamy ponownie decyzji D-01..D-09, tylko to, czy zadania je wiernie i wykonalnie realizują.

## Steps
1. Codex czyta zadania 07-17..07-21 i kod z Read first.
2. Sprawdza: stany przejściowe głosowania z rewanżem, turniejem i wyjściem gracza, liczenie punktów gier głównych, rozmiar widoku pokoju po długim wieczorze.
3. Każde ustalenie: zadanie, plik:linia, skutek, propozycja.
4. Claude zapisuje werdykt `OK` albo listę poprawek do Result.

## Acceptance
- [ ] Werdykt i ustalenia są w Result
- [ ] `telos lint-plan 07` → exit 0

## Result

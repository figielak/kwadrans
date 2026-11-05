---
id: 07-23
title: "Etap 3: odbiór całego wieczoru"
type: code
status: approved
critical: false
effort: normal
depends: [07-20, 07-21, 07-22]
decisions: [D-08]
scope: ["apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Evening.tsx", "apps/web/src/index.css", "apps/web/src/screens/evening.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Cały wieczór w pokoju działa na telefonie: lobby, seria partii, głosowanie, tabela i podsumowanie.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §6
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Evening.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/screens/evening.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Lekcja 05-09: 360×640, 1, 2 i 6 graczy, długie nicki, obserwator.
- Lekcje [tests]: drugi origin w Playwright, limit 3 pokoi zeruje restart serwera.
- Testy tylko rozszerzać. Tylko poprawki odbioru.

## Tests (write first)
- `evening.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Rozegraj w `/dev?n=3` serię: mini-gra, rewanż, głos, gra główna, Szybka seria, wyjście.
- Reconnect w głosowaniu i odświeżenie po partii.
- `prefers-reduced-motion`, układ i dokumenty.
- Zapisz w Result przebieg i pozostałe rozbieżności.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Lobby, wyniki i podsumowanie sprawdzone na 360×640 z 1, 2 i 6 graczami oraz obserwatorem

## Result

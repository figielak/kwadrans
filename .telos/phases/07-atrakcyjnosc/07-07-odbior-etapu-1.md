---
id: 07-07
title: "Etap 1: odbiór na 360×640"
type: code
status: approved
critical: false
effort: normal
depends: [07-05, 07-06]
decisions: [D-08]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/index.css", "apps/web/src/screens/results.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Wyniki, odsłona i ekran główny są dopracowane na telefonie, a etap 1 nadaje się do wieczoru z ludźmi.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5
- ZASADY.md §6

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Records.tsx (modify)
- apps/web/src/screens/Home.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/screens/results.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Lekcja 05-09: 360×640 z realnym nagłówkiem, 2 i 6 graczami, długimi nickami i obserwatorem.
- Lekcje [tests]: drugi gracz przez `http://127.0.0.1:5173`, Vite z `--host`; restart serwera zeruje limit 3 pokoi na IP.
- Testy tylko rozszerzać. Serwerów dev nie ubijać po pracy.
- Tylko poprawki odbioru, bez nowych funkcji.

## Tests (write first)
- `results.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Przejdź `/dev?n=1`, `?n=2`, `?n=3`, `?n=6`: mini-gra, gra główna, turniej, Kampus Tour na 4 graczy, obserwator.
- Sprawdź `prefers-reduced-motion` i odświeżenie w każdej fazie.
- Popraw hierarchię i odstępy; zmieniony wzorzec opisz w DESIGN.
- Zapisz w Result przebieg i pozostałe rozbieżności.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Zrzuty 360×640 sprawdzone przy 1, 2 i 6 graczach oraz obserwatorze

## Result

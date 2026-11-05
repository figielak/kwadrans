---
id: 07-06
title: "Etap 1: dopracowanie ekranu (Claude)"
type: code
status: approved
critical: false
effort: normal
depends: [07-05]
decisions: [D-01, D-09]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/index.css", "apps/web/src/screens/results.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Przegląd diffu po Codexie i dopracowanie bohatera wyników, odsłony i ekranu głównego na 360×640.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5

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
- Wykonawca: Claude. Serwerowe zachowanie i `results.ts` zostają; zmiana zasady wymaga najpierw testu.
- Lekcja 05-09: 360×640 z realnym nagłówkiem, 2 i 6 graczami, długimi nickami i obserwatorem.
- Największy tekst ekranu po partii to wynik z ludźmi, nie miejsce wszech czasów.
- `results.test.ts` tylko rozszerzać, nie osłabiać.

## Tests (write first)
- `results.test.ts`: test na każdy błąd znaleziony przy przeglądzie, jeśli logika była błędna

## Steps
1. Przejrzyj diff 07-05 pod kątem obejść testów i zasad UI.
2. Przejdź `/dev?n=2` i `/dev?n=6` z mini-grą, grą główną, turniejem i obserwatorem.
3. Dopracuj hierarchię, kolory gracza, odsłonę, `prefers-reduced-motion`.
4. Zaktualizuj dokumenty, jeśli zmienił się wzorzec ekranu.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Zrzuty 360×640 sprawdzone przy 2 i 6 graczach oraz obserwatorze

## Result

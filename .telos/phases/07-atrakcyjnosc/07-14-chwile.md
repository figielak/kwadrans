---
id: 07-14
title: "Etap 2: wspólny komunikat Moment"
type: code
status: done
critical: false
effort: hard
depends: [07-12]
decisions: [D-04]
scope: ["apps/web/src/moments.ts", "apps/web/src/moments.test.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/games/KampusTour.tsx", "apps/web/src/index.css", "DESIGN.md", "ZASADY.md"]
---
## Goal
Ważne chwile dostają jeden wspólny, krótki komunikat w kolorze gracza, którego dotyczą, i nigdy nie przeszkadzają w pomiarze.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Chwile
- DESIGN.md §1
- ZASADY.md §5
- packages/games/src/kampus-tour.ts:128-146 (typy zdarzeń)
- packages/games/src/memory.ts:77-86 (widok)
- packages/games/src/chinczyk.ts:45 (captured)
- packages/games/src/statki.ts:28 (Shot)
- apps/web/src/screens/Game.tsx:241-268 (układ ekranu)

## Files
- apps/web/src/moments.ts (create)
- apps/web/src/moments.test.ts (create)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/games/KampusTour.tsx (modify)
- apps/web/src/index.css (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- D-04: DESIGN §1 dopuszcza krótkie, jednorazowe reakcje; pętli i stroboskopów nadal nie ma. Zmiana w tym zadaniu.
- Lekcja 05-35: `moment-in` trafia do katalogu ZASADY §5 razem z CSS.
- Nieklikalny (`pointer-events: none`), `role="status"`, około 1,2 s, najwyżej jeden na 3 s; `prefers-reduced-motion` bez ruchu.
- Trafienie dalej nie wibruje. Nowy rekord pokazuje panel z 07-05, bez drugiego komunikatu.
- Lekcja 05-14: komunikat nie zjada dotknięcia i nie opóźnia ruchu.

## Tests (write first)
- `moments.test.ts`: każdy punkt Edge cases
- `animations.test.ts`: `moment-in` zgodny z katalogiem

## Interface
- momentFrom(gameId, prev, next, me, nick) → { text, playerId } | null  // porównanie widoków
- leadChange(prevLive, nextLive) → PlayerId | null  // tylko gry `score`
- canShowMoment(lastAt, now) → boolean  // 3 s
- <Moment /> w ui.tsx, wspólny dla Game.tsx i KampusTour

## Edge cases
- brak `prev` (odświeżenie, reconnect) → null
- gra ciszy → null przez całą partię
- para w Memory, zatopiony statek, zbicie w Chińczyku, komplet w Kampus Tour → komunikat z graczem
- „Ola odpada” i „Zostałeś ostatni” w grze przeżycia
- zmiana prowadzenia → komunikat; pierwsze punkty i remis → null
- dwa zdarzenia w 3 s → drugie przepada
- obserwator → te same komunikaty, bez „Ty”

## Steps
1. DESIGN §1, ZASADY §5; testy padają.
2. `moments.ts`: czyste funkcje.
3. `ui.tsx`, `index.css`: `Moment`.
4. `Game.tsx`, `KampusTour.tsx`: poprzedni widok w `useRef`, podpięcie.
5. `/dev?n=2`: Memory, Statki, Chińczyk, Liczenie; układ poziomy Kampusu.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/moments.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/animations.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0

## Result
`moments.ts`: `momentFrom` (Memory, Statki, Chińczyk, Kampus Tour, pięć gier przeżycia), `leadChange`, `canShowMoment`, magazyn komunikatów poza Reactem. `<Moment />` w `ui.tsx`, nieklikalny, `role="status"`, 1,2 s, najwyżej jeden na 3 s, tylko w trakcie partii; Kampus ogłasza komplet po dojściu pionka.
30 testów w `moments.test.ts`, `pnpm test` zielony. `moment-in` w katalogu ZASADY §5, przy `prefers-reduced-motion` `animation: none`, bo skrócona animacja ukryłaby komunikat od razu. D-04 w DESIGN §1.
Odbiór w `/dev?n=2`: Liczenie („Gracz 2 prowadzi” i „Prowadzisz!”, pierwsze punkty bez komunikatu, dotknięcia przechodzą) i Memory („Masz parę!”, „Gracz 1 ma parę”). Statki, Chińczyk, komplet i układ poziomy Kampusu oraz reduced motion tylko testami, nie na ekranie.
Komplet rund w grze przeżycia nie daje „odpada”. Zmiana prowadzenia porównuje z ostatnim stanem z liderem, żeby remis po drodze jej nie gubił. Asercje `moment-in` są w `moments.test.ts`, bo `animations.test.ts` jest poza scope, a jego ogólny test i tak obejmuje nową nazwę.
Deviations: none

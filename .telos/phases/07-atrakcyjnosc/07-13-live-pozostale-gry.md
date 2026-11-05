---
id: 07-13
title: "Etap 2: live w grach przeżycia i postępu"
type: code
status: approved
critical: false
effort: normal
depends: [07-12]
decisions: [D-03]
scope: ["apps/web/src/games/WPamieci.tsx", "apps/web/src/games/Sledzenie.tsx", "apps/web/src/games/Kubki.tsx", "apps/web/src/games/Srodek.tsx", "apps/web/src/games/Mapa.tsx", "apps/web/src/games/Tort.tsx", "apps/web/src/games/Nozyczki.tsx", "apps/web/src/games/Kolor.tsx", "apps/web/src/games/Kolo.tsx", "apps/web/src/games/Zakupy.tsx", "apps/web/src/live.test.ts"]
---
## Goal
Pozostałe gry przeżycia i postępu raportują rundę lub etap, więc pierścienie rywali przestają stać puste.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Podgląd rywali
- apps/web/src/games/Mapa.tsx:40-100
- apps/web/src/games/MiniGame.tsx:47-60

## Files
- apps/web/src/games/WPamieci.tsx (modify)
- apps/web/src/games/Sledzenie.tsx (modify)
- apps/web/src/games/Kubki.tsx (modify)
- apps/web/src/games/Srodek.tsx (modify)
- apps/web/src/games/Mapa.tsx (modify)
- apps/web/src/games/Tort.tsx (modify)
- apps/web/src/games/Nozyczki.tsx (modify)
- apps/web/src/games/Kolor.tsx (modify)
- apps/web/src/games/Kolo.tsx (modify)
- apps/web/src/games/Zakupy.tsx (modify)
- apps/web/src/live.test.ts (modify)

## Constraints
- Tylko numer rundy lub etapu, bez punktów: punkty odsłaniałyby informacje.
- Sześć gier ciszy nie importuje `useLive`; pomiar zostaje bez zmian.
- Sekwencja, Wieża, Policz kropki, Kąt, Który rok?, Schulte, Sudoku, Balon zostają przy `progress`.
- Liczba rośnie przy ukończeniu rundy, nie przy pierwszym dotknięciu.
- Lekcja 05-33: ekran końcowy bez zmian, hook działa tylko w trakcie gry.

## Tests (write first)
- źródła: każda gra `round` lub `survival` bez `progress` woła `useLive`, a gra ciszy go nie importuje
- `liveDots`: rodzaj `round` daje ułamek z `total`, `survival` numer rundy i „odpada” po wyniku

## Steps
- Testy źródeł i `liveDots` w `live.test.ts`.
- Podepnij 10 komponentów, przy każdym sprawdzając miejsce ukończenia rundy.
- Sprawdź w `/dev?n=2` po jednej grze z każdego rodzaju.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/live.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

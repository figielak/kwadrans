---
id: 07-15
title: "Etap 2: dopracowanie ekranu (Claude)"
type: code
status: approved
critical: false
effort: normal
depends: [07-14]
decisions: [D-02, D-03, D-04, D-09]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/index.css", "apps/web/src/moments.test.ts", "apps/web/src/live.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Przegląd diffów 07-10, 07-12 i 07-14 oraz dopracowanie 3-2-1, kropek na żywo, chwil i reakcji.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/moments.test.ts (modify)
- apps/web/src/live.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Wykonawca: Claude. Lekcja: Playwright, drugi gracz przez `http://127.0.0.1:5173`, Vite z `--host`; testy WS do 10 wiadomości/s.
- Warunek zatrzymania z planu §10: `live` lub reakcje obciążają Pi przy 6 graczach albo rozpraszają; wtedy wyłączamy je dla danej gry.
- Testy tylko rozszerzać, nie osłabiać.

## Tests (write first)
- `moments.test.ts` i `live.test.ts`: test na każdy błąd logiki znaleziony przy przeglądzie

## Steps
1. Przejrzyj diffy pod kątem obejść i pomiaru.
2. Sprawdź `/dev?n=6`: wyścig, przeżycie, postęp, cisza pomiaru i obserwator.
3. Sprawdź reconnect w odliczaniu i odświeżenie w każdej fazie.
4. Dopracuj układ na 360×640 i `prefers-reduced-motion`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Pomiar w Refleksie i Stoperze bez ruchu na ekranie, potwierdzony w `/dev`

## Result

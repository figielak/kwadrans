---
id: 07-16
title: "Etap 2: odbiór, pomiar i obciążenie"
type: code
status: approved
critical: false
effort: normal
depends: [07-13, 07-15]
decisions: [D-02, D-03, D-04]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/index.css", "apps/web/src/moments.test.ts", "apps/web/src/live.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Wspólny start, kropki na żywo, chwile i reakcje działają razem na telefonie, nie psują pomiaru i nie obciążają serwera.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/moments.test.ts (modify)
- apps/web/src/live.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Warunek zatrzymania z planu §10: `live` lub reakcje obciążają Pi przy 6 graczach albo rozpraszają; wtedy wyłączamy je dla danej gry przez `def.live`.
- Lekcje [tests]: Playwright z drugim originem; 10 wiadomości/s; restart serwera zeruje limit pokoi.
- Testy tylko rozszerzać. Tylko poprawki odbioru.

## Tests (write first)
- `moments.test.ts`, `live.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Sprawdź `/dev?n=6`: wyścig, przeżycie, postęp, cisza pomiaru, gra główna, obserwator.
- Reconnect w odliczaniu i odświeżenie w każdej fazie.
- Zmierz w `docker stats` lub `top` serwer dev przy 6 graczach z `live`; wynik w Result.
- Popraw układ na 360×640 i `prefers-reduced-motion`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Refleks i Stoper bez ruchu na ekranie w trakcie pomiaru, potwierdzone w `/dev`
- [ ] Obciążenie przy 6 graczach zapisane w Result

## Result

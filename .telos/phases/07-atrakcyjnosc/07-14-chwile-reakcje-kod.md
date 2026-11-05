---
id: 07-14
title: "Chwile i reakcje: kod (Codex)"
type: code
status: approved
critical: false
effort: normal
depends: [07-13]
decisions: [D-04, D-09]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/lobby.ts", "apps/web/src/moments.ts", "apps/web/src/net.ts", "apps/web/src/App.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/index.css"]
---
## Goal
Działające `Moment`, reakcje i ich osobny kanał, w prostej formie do dopracowania w 07-15.

## Read first
- apps/server/src/LobbyRoom.ts:259-277 (on)
- apps/web/src/net.ts:101-122 (nasłuch)
- apps/web/src/screens/ui.tsx:55-100 (PlayerDots)
- apps/web/src/screens/Game.tsx:240-250 (układ ekranu)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/web/src/moments.ts (create)
- apps/web/src/net.ts (modify)
- apps/web/src/App.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/index.css (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-13 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Nieklikalny komunikat około 1,2 s w kolorze gracza; `prefers-reduced-motion` bez ruchu. Emotki systemowe, bez czatu i dźwięku.
- Kanał jak `live`: bez `this.on`, bez pełnego `update()`.

## Tests (write first)
- `moments.test.ts`: momentFrom, canShowMoment, canReact, showReaction
- `LobbyRoom.test.ts`: `react`, limit, odrzucenia
- `animations.test.ts`: nowe keyframes zgodne z katalogiem

## Steps
1. `lobby.ts`, `LobbyRoom`: wiadomość `react`, własny limit, `broadcast`.
2. `moments.ts`: czyste funkcje.
3. `net.ts`, `App.tsx`: nasłuch reakcji.
4. `ui.tsx`: `Moment`, pasek reakcji pod kropkami, unoszenie nad kropką nadawcy.
5. `Game.tsx`: podpięcie porównania poprzedniego i nowego widoku.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/moments.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

<!-- telos-area: commit d2a83565b27b4ed140b9b8ac4ecc20baf471783d · 2026-11-18 · paths: apps/web/src/games/ -->
# web-games

## Purpose
Per-game UI: main game boards, the 30 mini games, shared quiz and estimation screens, Kampus Tour summary.

## Entry points
- `apps/web/src/games/MiniGame.tsx:47` — `MiniGame` picks the mini-game component by id; end screen also for the record match
- `apps/web/src/games/Quiz.tsx` — Kolor liter, Liczenie, Inny element, Obrót, Literówka (Dziesiątki reuse its table)
- `apps/web/src/games/Szacowanie.tsx` — Policz kropki and Kąt
- `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/KampusSummary.tsx` — largest game screen and its summary
- Recent main-game screens to copy: `apps/web/src/games/Wyprawa.tsx`, `apps/web/src/games/Sabotaz.tsx`, `apps/web/src/games/KropkiIKreski.tsx` (each with a `.test.tsx`)

## Invariants
- A mini game runs on the client and sends `result` (some also `progress`); a refresh restarts it.
- Components are keyed by the state `nonce`, so a rematch resets local state.
- A mini-game end screen is drawn only from state (maps by player id), because the record match is shown with `me=""` (05-33).

## Decisions
- Refleks and Stój! measure from the first frame with the stimulus (rAF) to `e.timeStamp`; Stoper and Wieża from their own start via `performance.now()` (P4-061).
- Kampus Tour characters are Phosphor icons.

## Rejected
- Hand-drawn SVG figures for Kampus Tour characters — unreadable at 25 px.

## Pitfalls
- Action during an animation: the first tap ends the show without sending a move; a new server state replaces the show (05-14).
- Mini games duplicate the intro, timeout and ranking skeleton; a fix in one does not reach the others.

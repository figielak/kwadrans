<!-- telos-area: commit e618e97aeaa6c822f3aea64f167382f2c7b0fc48 · 2026-11-18 · paths: apps/web/src/games/ -->
# web-games

## Purpose
Per-game UI: main game boards, the 30 mini games, shared quiz and estimation screens, Kampus Tour summary.

## Entry points
- `apps/web/src/games/MiniGame.tsx:47` — `MiniGame` picks the mini-game component by id; end screen also for the record match
- `apps/web/src/games/Quiz.tsx` — Kolor liter, Liczenie, Inny element, Obrót, Literówka (Dziesiątki reuse its table)
- `apps/web/src/games/Szacowanie.tsx` — Policz kropki and Kąt
- `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/KampusSummary.tsx` — largest game screen and its summary
- Recent main-game screens to copy: `apps/web/src/games/Wyprawa.tsx`, `apps/web/src/games/Sabotaz.tsx`, `apps/web/src/games/KropkiIKreski.tsx`, `apps/web/src/games/Licytacja.tsx` (each with a `.test.tsx`)

## Invariants
- A mini game runs on the client and sends `result` (some also `progress`); a refresh restarts it.
- Components are keyed by the state `nonce`, so a rematch resets local state.
- A mini-game end screen is drawn only from state (maps by player id), because the record match is shown with `me=""` (05-33).

## Decisions
- Licytacja screen: the local card draft is stored under `draftKey` (`nonce:round:phase`), so a new round or rematch drops it and another player's ready mark does not.
  Controls (`HandControls`, `NextBar`) are hook-free functions so tests call them without a DOM; screen tests build views from the real `playerView`.
- Licytacja at 360×640: the choose screen is exactly 640 px with 2 and 6 players because the round number and deck count live in the prize tile
  and 5-6 players are one row of dots with scores (nicks stay as `sr-only`); reveal and end may scroll.
- Refleks and Stój! measure from the first frame with the stimulus (rAF) to `e.timeStamp`; Stoper and Wieża from their own start via `performance.now()` (P4-061).
- Kampus Tour characters are Phosphor icons.

## Rejected
- Hand-drawn SVG figures for Kampus Tour characters — unreadable at 25 px.

## Pitfalls
- Browser acceptance with many Playwright tabs: background tabs are throttled, so `bringToFront()` before each action; otherwise a click misses the 20 s limit and the timeout plays the card.
- Action during an animation: the first tap ends the show without sending a move; a new server state replaces the show (05-14).
- Mini games duplicate the intro, timeout and ranking skeleton; a fix in one does not reach the others.

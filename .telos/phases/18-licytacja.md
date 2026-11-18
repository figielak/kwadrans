# 18-licytacja

## Goal
New main game `licytacja` ("Licytacja na ślepo", 2-6 players): each round a prize card is revealed and everyone
secretly plays one card 1-15 at the same time; tied cards cancel out, the best unique card takes the pot; 15 rounds.

## Done when
ZASADY-GIER has the game section, rule tests and `pnpm run test` pass, the tile and the "Jak grać" card are in the
lobby, and a technical acceptance with 2 and 6 players plus an observer on 360×640 passes.

## Tasks
- [x] **18-01 Rules in the docs**
  `ZASADY-GIER.md`: table row (`licytacja | 2-6 | 20 s wybór, 10 s odsłona | równoczesna, ukryty stan`) and §15 in
  the short order of §14; `KONCEPT.md` §2.2 row. Accept: `grep -q "## 15. Licytacja" ZASADY-GIER.md`.
- [x] **18-02 Rule tests (own commit, before code)**
  `packages/games/src/licytacja.test.ts`: setup, simultaneous choice, cancel-out, carry-over, negative pot, last
  round, timeout, ranking with ties, hidden choices in `playerView`, JSON round-trip, immutability. Not changed later.
- [x] **18-03 Engine and registry**
  `packages/games/src/licytacja.ts` modelled on `wyprawa.ts:160-217` (`turn` key per phase, `ready`, `timeoutMove`);
  exports and `GAMES` entry in `packages/games/src/index.ts`; card in `apps/web/src/screens/howToPlay.ts` + its test.
  Accept: `pnpm --filter @kwadrans/games exec vitest run src/licytacja.test.ts` and `pnpm run test` exit 0.
- [ ] **18-04 Game screen**
  `apps/web/src/games/Licytacja.tsx`: prize and pot on top, player row with "chose" marks, own hand as a 5×3 grid of
  48 px cards with select-and-confirm, reveal of all cards with winner in their colour, end table. Fits 360×640.
- [ ] **18-05 Wiring**
  `apps/web/src/screens/Game.tsx` (score map :39, simultaneous phases :730, mount next to :678),
  `apps/web/src/screens/Lobby.tsx` (icon :512-520, description :561-569). Accept: `pnpm run typecheck && pnpm run build`.
- [ ] **18-06 Technical acceptance**
  `/dev?n=2` and `/dev?n=6` with an observer at 360×640 (Playwright screenshots): full game, a tie that carries the pot,
  a timeout pick, rematch with a fresh `nonce`. Accept: no overflow, no console errors, `pnpm run test` exit 0.

## Notes
- Decided by user (2026-11-18): tied cards cancel and the next highest unique card wins; with no unique card the pot
  carries to the next round. One mode, 15 rounds, no `modes`. 20 s to choose. Claude does all tasks, no Codex split.
- Assumed: `id` `licytacja`, UI name "Licytacja na ślepo" (three words, exception to ZASADY §1 like Kropki i kreski).
- Assumed: prizes are 15 cards −5..−1 and +1..+10 shuffled by `rng`; every hand is 1-15, each card once.
- Assumed: the sign of the newest prize decides the direction for the whole pot (positive: highest unique card,
  negative: lowest unique card), so a pot summing to 0 still has a rule; the pot left after round 15 is discarded.
- 18-01: the reveal lasts 10 s (`REVEAL_SECONDS`, not 15: 15 reveals would drag) with "Dalej" readiness; round 15
  resolves itself (one card left each). Timeout plays a random card from the hand via `rng`. Remaining hands are public (played cards are seen), only the current choice is hidden.
- Assumed: winner is the highest sum; a tie on top has no winner, `places` share ties; no `record`, `live`, `stateVersion`.
- Risk: with 2 players ties are frequent and long carry-overs can feel flat; check in 18-06, change only by test + doc.
- 18-03 deviation: two type-only fixes in `licytacja.test.ts` (readonly `sum` argument, typed `cards` record); no assertion changed.
- CHANGELOG entry only before publishing to `master`, outside this phase.

<!-- telos-area: commit c63fb3e1abfbfd98b57e743183261d2d59a13136 · 2026-11-19 · paths: apps/web/src/index.css, apps/web/src/a11y.test.ts, apps/web/src/animations.test.ts, apps/web/src/tokens.test.ts, apps/web/src/words.test.ts, apps/web/src/states.test.ts, apps/web/src/hierarchy.test.ts, apps/web/src/descriptions.test.ts, apps/web/src/fresh.test.ts, apps/web/src/numbers.test.ts -->
# web-style

## Purpose
Design tokens, classes and keyframes in `index.css`, plus the consistency tests that enforce `ZASADY.md` §4-5.

## Entry points
- `apps/web/src/index.css` — tokens, `.tile .label .btn .field`, keyframes
- `apps/web/src/tokens.test.ts` — token roles, player action colour (P4-050)
- `apps/web/src/animations.test.ts` — keyframes match the table in `ZASADY.md` §5 (P4-041)
- `apps/web/src/words.test.ts`, `apps/web/src/numbers.test.ts` — vocabulary roles (P4-047), numbers and labels (P4-049)
- `apps/web/src/a11y.test.ts`, `apps/web/src/states.test.ts`, `apps/web/src/hierarchy.test.ts` — a11y, loading/disconnect states, one filled accent (P4-051..053)
- `apps/web/src/fresh.test.ts`, `apps/web/src/descriptions.test.ts` — no animation on a found state, descriptions match games (P4-046, P4-054)

## Invariants
- Dark theme only, colours from tokens, Polish texts without em-dashes, player colour instead of red for own actions, touch targets at least 48 px.

## Decisions
- Lighter surfaces than figielak.dev: `surface` #1c1c1f, new `surface-raised` #232327 for game tiles and boards, `line` white 12%, `surface-glass` 70% (19-02). `.label` is Satoshi 13 px, normal case, no letter spacing.
- Tokens otherwise from figielak.dev; timer warning `--color-warning`; chart colours are the three `--color-series-*` tokens.
- `DESIGN.md` is a model, not a limit; `ZASADY.md` wins on conflict.

## Rejected
- Light theme.

## Pitfalls
- `.still` (`index.css:441`) pauses animations at their first frame; `.still-at` (`:449`) sets a negative delay through `--still-at` for games whose frame 0 is empty.
- A new keyframe or duration must be added to the table in `ZASADY.md` §5, or `animations.test.ts` fails (05-35).
- A semi-transparent background disappears on a grid; use `color-mix` with the field background.

---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
# Testing Patterns

**Analysis Date:** 2026-10-21

## Test Framework

**Runner:**
- Vitest (root devDependency `vitest` `^5.0.3` in `package.json`; used in `packages/games` and `apps/server`).
- Config: no `vitest.config.*` file. Defaults apply. Run through each package's `test` script (`vitest run`).
- `apps/web` has no test script and no test files. Its correctness is checked by `tsc -p .` and by manual play in `/dev`.

**Assertion Library:**
- Vitest built-in `expect` (Jest-compatible matchers). Common: `toBe`, `toEqual`, `toBeNull`, `toBeGreaterThanOrEqual`, `toHaveLength`, `toContain`, `toThrow` (rare).
- Custom failure message via the second argument: `expect(game.validateMove(s, player, move), \`${player} oddaje wynik\`).toBe(true);` in `packages/games/src/stoper.test.ts`.

**Run Commands:**

```bash
pnpm test                                                    # All tests (root: pnpm -r test)
pnpm typecheck                                               # tsc -p . in every package (includes test files)
pnpm --filter @kwadrans/games exec vitest run src/<gra>.test.ts   # One game's rule tests
pnpm --filter server test                                    # Server tests (stats.test.ts)
pnpm --filter @kwadrans/games exec vitest   # Watch mode (no `run`)
pnpm --filter web build                                      # CI build check for the frontend
```

- Coverage: no coverage script or provider configured. No `--coverage` in CI.

## Test Scope and Layout

**Location:**
- Colocated with source, same directory, same base name: `packages/games/src/stoper.ts` ↔ `packages/games/src/stoper.test.ts`.
- Cross-game contract test: `packages/games/src/index.test.ts`.
- Shared core: `packages/games/src/core.test.ts`, `packages/games/src/turniej.test.ts` (tournament points rules).
- Server: `apps/server/src/stats.test.ts` (SQLite-backed stats, records, daily, in-memory DB).

**Counts (approximate, from grep):**
- About 40 test files under `packages/games/src/`, plus `apps/server/src/stats.test.ts`.
- About 1,130 `test(` or `it(` declarations in `packages/games` (plus `test.each` rows).
- 34 files use `test.each` or `it.each` for parameter tables.
- 40 files use `describe` blocks to group rules.

**Naming:**
- Test names are Polish, and describe the rule, not the function: `test("trafienie w punkt", ...)`, `test("cel to pełne sekundy 6-14 s i trafiają się oba końce", ...)`, `test("wszyscy grają naraz, rewanż ma inne wyzwanie", ...)` (`packages/games/src/stoper.test.ts`).
- Group by concern with `describe("walidacja", ...)`, `describe("koniec", ...)`.
- `test.each` for boundary tables: `test.each([[-1], [s.target + 1], [1.5]])("odchyłka %s", (d) => expect(game.validateMove(s, A, result(d))).toBe(false));`.

**File header:**
- Each rule test file opens with a Polish comment listing the rules it fixes, numbered by bullet. Example header lines from `packages/games/src/stoper.test.ts`:
  `// - 1-6 graczy naraz, każdy zatrzymuje stoper u siebie, oddaje odchyłkę od celu w ms (0-cel),`
- The header is the spec used when `ZASADY-GIER.md` changes. Keep it in sync.

## Test Structure

**Suite Organization (typical rule test):**

```ts
import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { type Move, type State, stoper as game } from "./stoper.ts";

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (deviation: number): Move => ({ type: "result", deviation });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("cel to pełne sekundy 6-14 s i trafiają się oba końce", () => {
  const targets = Array.from({ length: 200 }, (_, i) => game.setup([A, B], createRng(i)).target);
  for (const t of targets) {
    expect(t % 1000).toBe(0);
    expect(t).toBeGreaterThanOrEqual(6000);
    expect(t).toBeLessThanOrEqual(14_000);
  }
  expect(new Set(targets).size).toBe(9);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  test.each([[-1], [s.target + 1], [1.5]])("odchyłka %s", (d) => expect(game.validateMove(s, A, result(d))).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, result(10))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result(10)), A, result(5))).toBe(false));
  test("trafienie w punkt", () => expect(game.validateMove(s, A, result(0))).toBe(true));
  test("najgorszy wynik", () => expect(game.validateMove(s, A, result(s.target))).toBe(true));
});
```

**Patterns:**
- Players are fixed constants: `const A = "ania"; const B = "bartek"; const C = "celina";` (or similar Polish first names). Do not use real nicks.
- RNG is always `createRng(seed)` with a fixed seed. Same seed → same outcome (determinism is part of the contract).
- Setup helper `send(state, player, move)` asserts `validateMove` then calls `applyMove` with a fixed rng. This is the expected shape across the games.
- Build state with moves, not hand-written object literals, so tests do not depend on the `State` shape (ZASADY.md section 2). Hand-built states are allowed only for a tiny, explicit case.
- Assertions on rule outputs: `isOver(s)` is `null` while playing; `waitingFor(s)` empties after the end; `ranking` order checked with `toEqual`.

**Setup/teardown:**
- No `beforeEach`/`afterEach` in rule tests (pure functions; nothing to reset).
- Server SQLite tests open `":memory:"` databases per test: `const stats = openStats(":memory:");`. Each test gets a fresh store.
- Time-dependent server tests use fake timers: `vi.useFakeTimers()`, `vi.setSystemTime(1_000)`, and `vi.useRealTimers()` in cleanup (`apps/server/src/stats.test.ts`).

## Mocking

**Framework:** Vitest `vi` (only in `apps/server/src/stats.test.ts`). No `vi.mock` module mocks in the repo.

**Patterns:**
- Pure rules need no mocks: inject randomness with `createRng(seed)`.
- Time: `vi.useFakeTimers()` + `vi.setSystemTime(...)`, restored with `vi.useRealTimers()`.
- Filesystem: `mkdtempSync(join(tmpdir(), ...))` is available (imports in `stats.test.ts`) for file-backed DB tests, but the common path is `":memory:"`.

**What to Mock:**
- Time (server only, when a test depends on "today" or ages of records).
- Nothing else: the rules are pure, and the registry contract test runs the real games.

**What NOT to Mock:**
- Game rules, `rng`, `ranked`, `shuffle`: test real behavior with fixed seeds.
- The SQLite layer: use the real `node:sqlite` in memory (`openStats(":memory:")`), not a fake store.
- zod schemas: the contract test feeds real JSON through `moveSchema` (see below).

## Contract Test (cross-game)

`packages/games/src/index.test.ts` runs every game in `GAMES` through random playthroughs:

- Seeds: `const SEEDS = [1, 2, 3];`, `MAX_STEPS = 100_000`.
- Each step: the game's own `timeoutMove` (or an "eager" move table, `EAGER`, for games where timeout never acts, like Kampus Tour and Labirynt) is sent through `moveSchema` and `validateMove`.
- Checks: a stranger's move is rejected; a non-waiting player's move is rejected; partia ends; after end nobody can act; `playerView` for each player and observer `""` survives `JSON.stringify`; mini-games provide finite `places` and `record`.
- Also checks the registry guards: prototype keys such as `"constructor"` are undefined in `GAMES`; `Object.keys(GAMES)` has the expected count (currently 38); each `game.id` equals its key; mini-games (`minPlayers === 1`) have no `modes`.
- Tracks `visited` phases per game (`Record<string, Set<string>>`) to show coverage of phases.

When adding a game, extend `EAGER` only if `timeoutMove` alone never reaches the interesting branch. Update the count in `index.test.ts` when `GAMES` grows.

## Fixtures and Factories

**Test Data:**
- Players: inline constants (`A`, `B`, `C`), not factories.
- States: produced by `setup(players, createRng(seed))` plus a `send` helper; no shared fixture files.
- Word/data lists used by games live in `*-dane.ts` modules (`kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`); tests import them directly when a rule depends on list contents.

**Location:**
- Test helpers are declared at the top of each test file. There is no shared `test-utils` module.

## Coverage

**Requirements:** None enforced. No coverage threshold, no coverage job in `.github/workflows/ci.yml`.

**Required by process (not tooling):** `ZASADY.md` section 2 lists mandatory tests for every game:
- Definition: `minPlayers`, `maxPlayers`, `turnSeconds` or `turn()`; fresh game not finished.
- Setup: initial state, first `waitingFor`, same seed same result, different seeds different results.
- Validation: outsider, out-of-turn, out-of-phase, legal shape but illegal rule, after end, boundary values (first and last allowed pass, neighbors fail).
- Schema: `moveSchema` rejects garbage (wrong type, missing field, too long text, non-integer).
- Every rule section in `ZASADY-GIER.md` has at least one test named after the rule.
- End: each player's win (not only the first), draw, ranking order, empty `waitingFor` after end.
- Timeout: `timeoutMove` in every phase passes `validateMove`.
- State: `applyMove` does not mutate previous state; survives JSON round trip.
- Hidden info: `playerView` for a player and observer never includes opponent data.
- Mini-game: out-of-range and non-integer results rejected, duplicate result rejected, draw has no winner, solo ranking without winner, rewanż gives a different challenge.

**Process rule (TDD):** the test file is committed before the rule file (AGENTS.md). Tests are not changed to fit an implementation; if a rule was wrong, fix the test and `ZASADY-GIER.md` first.

**View Coverage:**

```bash
pnpm --filter @kwadrans/games exec vitest run --coverage   # not configured: needs @vitest/coverage-v8 (new dependency, ask first)
```

## Test Types

**Unit tests (dominant):**
- Every rule module in `packages/games/src/*.ts` is tested in isolation with `vitest`. This is where almost all behavior is verified.
- Helpers in `core.ts` (`createRng`, `ranked`, `shuffle`, `withSum`, `standing`, `compareRecords`, `dailyGame`) are tested in `packages/games/src/core.test.ts`.

**Integration tests:**
- Contract test over the whole registry: `packages/games/src/index.test.ts`.
- Server stats and records with SQLite in memory: `apps/server/src/stats.test.ts` (ranking order, nick normalization, record ties, retention window with fake timers).
- No test boots the Colyseus room (`apps/server/src/LobbyRoom.ts`) or the HTTP server (`apps/server/src/index.ts`). Those are checked manually and through `/dev`.

**UI / Component tests:**
- Not present. No React Testing Library, no jsdom, no Playwright test suite in the repo (`.playwright-mcp` is a local tool directory, not a test suite).
- UI is verified by hand in `/dev?n=4` (see `ZASADY.md` "Gra jest gotowa" checklist) and at a 360×640 viewport.

**E2E Tests:**
- Not used in the repository.

## Common Patterns

**Async / timing (mini-games):**
- Rules are synchronous and pure. Time is an input: the client measures and sends a number (`deviation`, `times`, `taps`), the server scores it. Tests feed numbers directly, never wall-clock timers.
- Boundary tests on time values: a value at the limit passes, one beyond fails (e.g. `s.target` vs `s.target + 1`).

**Determinism:**
- Every randomized rule test uses a fixed seed, and a second test asserts that two different seeds give different outcomes (where that is part of the rule). Example from `stoper.test.ts`: `expect(game.setup([A, B], createRng(2)).nonce).not.toBe(s.nonce);`.

**Error / rejection testing:**
- Rejection is asserted as `validateMove(...)` returning `false` (not thrown). Use `test.each` for the rejection table.
- Schema rejection uses zod's `safeParse`:
  ```ts
  expect(ROOM_MESSAGES.pickGame.safeParse({ gameId: 1 }).success).toBe(false);
  ```
  (pattern from `packages/games/src/index.test.ts`).
- Penalty tests check the block or added time, not game over, per ZASADY.md.

**Ranking and records:**
- Ranking tests build results with a `one(nick, score, tie)` helper and then check order with `.map((r) => r.nick)` and `toEqual` (`apps/server/src/stats.test.ts`).
- Tie rules: equal main score → second criterion; equal both → earlier row wins.

**Test style rules:**
- No snapshots (`toMatchSnapshot` not used).
- No `.only` or `.skip` in committed code (none found).
- Keep each test to one rule; use `describe` for groups.
- Tests must pass before merge: `pnpm typecheck && pnpm test` (same as CI, `.github/workflows/ci.yml`).

## Gaps

- `apps/web/src` has no tests: screen logic (`screens/Game.tsx`, `screens/Records.tsx`, `net.ts`) and game components (`apps/web/src/games/*.tsx`) are verified only by hand.
- `apps/server/src/LobbyRoom.ts` (room lifecycle, reconnect, walkover, rate limit) has no automated test.
- No coverage tool, so untested branches in rule files are not visible in CI.

---

*Testing analysis: 2026-10-21*

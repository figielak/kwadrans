---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
# Coding Conventions

**Analysis Date:** 2026-10-21

## Naming Patterns

**Files:**
- Game rules in `packages/games/src/` are flat, lowercase kebab-case, one file per game: `piec-w-rzedzie.ts`, `kampus-tour.ts`, `panstwa-miasta.ts`, `w-pamieci.ts`. The game id (`id` in the definition) is the kebab-case name, e.g. `piec-w-rzedzie`, `kampus-tour`.
- Each game has a test file next to it: `packages/games/src/<id>.test.ts` (e.g. `packages/games/src/stoper.test.ts`).
- Shared data files carry a `-dane` suffix: `packages/games/src/kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Shared rule modules for games with the same mechanic: `packages/games/src/quiz.ts` (used by `kolor.ts`, `liczenie.ts`, `inny.ts`, `obrot.ts`, `literowka.ts`, `dziesiatki.ts`).
- React components are PascalCase, one per game: `apps/web/src/games/Stoper.tsx`, `apps/web/src/games/KampusTour.tsx`. Screens live in `apps/web/src/screens/` (`Home.tsx`, `Lobby.tsx`, `Setup.tsx`, `Game.tsx`, `Records.tsx`). Shared UI primitives sit in `apps/web/src/screens/ui.tsx`.
- Server files: PascalCase for the Colyseus room (`apps/server/src/LobbyRoom.ts`), lowercase for modules (`apps/server/src/stats.ts`, `index.ts`).
- Tests: `*.test.ts`, colocated. No `__tests__` folders.

**Game export names:**
- The rule object is a camelCase constant named after the game, exported by name: `export const stoper: GameDefinition<State, Move>`, `export const kampusTour`, `export const piecWRzedzie`, `export const panstwaMiasta`. The registry in `packages/games/src/index.ts` imports them by these names.
- Ids with a Polish `w-` or `-` form are converted to camelCase for the constant (`wPamieci`, `w-pamieci.ts`).
- A game file always exports `State`, `Move`, and (for the UI) `View` types, plus constants used by the UI or tests in UPPER_SNAKE_CASE (see below).

**Functions:**
- camelCase, Polish or English words, depending on the file: rule helpers and UI names follow the domain language (`roomCode`, `createRng`, `rankResults`, `soloState`, `withSum`, `dailyGame`). Domain verbs are Polish in UI copy only.
- Game definition methods are arrow properties: `setup`, `validateMove`, `applyMove`, `playerView`, `isOver`, `waitingFor`, `timeoutMove`, `places`, `record`. Contract is in `packages/games/src/core.ts` (`GameDefinition`).
- React components: named function exports, not default exports: `export function Stoper(...)`, `export function Screen(...)`.

**Constants:**
- Tunables and rule numbers are named UPPER_SNAKE_CASE constants at the top of the file, with a comment in Polish when the value is not obvious: `VISIBLE_MS = 3000` in `packages/games/src/stoper.ts`, `DURATION_MS = 30_000`, `QUESTIONS` in `packages/games/src/quiz.ts`, `ROOM_CODE_ALPHABET` in `packages/games/src/core.ts`.
- Numeric separators are used for large literals: `30_000`, `100_000`.
- Limits and time values are never inline magic numbers in rules; in UI, animation durations are constants at the top of the file (`COUNT_MS` in `apps/web/src/games/Stoper.tsx`, `STEP_MS`/`ROLL_MS` in `Chinczyk.tsx`).

**Variables and types:**
- Types and interfaces are PascalCase: `GameDefinition`, `RoomView`, `LobbyPlayer`, `RecordRow`, `PlayerId = string` (alias in `core.ts`).
- Move unions use a `type` discriminant: `type Move = { type: "result"; deviation: number }`, `{ type: "buy" }`, `{ type: "wall", x, y, dir }`.
- State interfaces are named `State`, views `View`, moves `Move` in each game module (exported; `index.ts` re-exports them with a game prefix, e.g. `StoperView`).
- Records of players are keyed by `PlayerId`: `Record<PlayerId, number>` (`results`, `taps`, `places`).

## Code Style

**Formatting:**
- No Prettier, Biome, or EditorConfig config is committed (checked: no `.prettierrc`, `biome.json`, `.editorconfig` at root or in packages).
- Observed style, to be matched by hand: double quotes, semicolons, trailing commas in multi-line literals, 2-space indentation, long single lines allowed (up to about 160-180 columns in rule files like `packages/games/src/stoper.ts`, `packages/games/src/core.ts`).
- Imports within packages use explicit `.ts` / `.tsx` extensions: `import { createRng } from "./core.ts";`. Required by `allowImportingTsExtensions` and `verbatimModuleSyntax` in `tsconfig.base.json`.
- Type-only imports use `import type` or inline `type` modifiers: `import { type GameDefinition, type PlayerId, ranked } from "./core.ts";`.

**TypeScript settings (`tsconfig.base.json`):**
- `strict: true`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true` (no `enum`, no parameter properties, no `namespace`). Use string-literal unions and `const` objects instead of enums.
- `noEmit: true` everywhere; the server runs TypeScript directly with `node src/index.ts` (Node 24 type stripping).
- Module mode `NodeNext`, target `ES2023`.
- Server `apps/server/tsconfig.json` adds `"types": ["node"]`.

**Linting:**
- No ESLint config. Correctness relies on `strict` TypeScript and tests. `pnpm typecheck` and `pnpm test` are the gate (`.github/workflows/ci.yml`).
- Type escape hatches are not used: no `as any` and no `@ts-ignore` across `packages/` and `apps/` (checked with grep). Casts like `as { user_version: number }` appear only at SQLite boundaries (`apps/server/src/stats.ts`).

**Comments:**
- Comments are in Polish, and describe the rule or the reason, not the mechanics. Example: `/** Po tylu ms licznik znika i gracz liczy w głowie. */` in `packages/games/src/stoper.ts`.
- Doc comments (`/** */`) on exported constants, types, and non-obvious functions. Line comments (`//`) for the why in logic.
- Deliberate simplifications are tagged `// ponytail: <ceiling>, <upgrade path>`. Example: `// ponytail: pomiar na kliencie, da się podrobić; między znajomymi wystarczy.` in `packages/games/src/stoper.ts`. About 39 files use this tag.
- Test files open with a Polish header comment listing the rules they fix, e.g. `packages/games/src/stoper.test.ts` ("Testy napisane przed implementacją. Ustalają zasady: ...").

## Import Organization

**Order (observed):**
1. External packages: `zod`, `vitest`, `react`, `@colyseus/sdk`, `@phosphor-icons/react`, `node:*` built-ins (`node:sqlite`, `node:fs`).
2. Workspace package: `@kwadrans/games`.
3. Relative imports: `./core.ts`, `../screens/ui.tsx`.

Within group, no enforced alphabetical sort (the registry in `packages/games/src/index.ts` is loosely ordered).

**Path aliases:**
- None. Cross-package imports go through the workspace name `@kwadrans/games` (exports `./src/index.ts` in `packages/games/package.json`).
- Server must not import `zod` directly: schemas live in `packages/games` (reason in `KONCEPT.md` and `AGENTS.md`: a second copy of `@colyseus/core` breaks seat reservation).

## Error Handling

**Rule code (`packages/games/src`):**
- Rules do not throw on bad input. `validateMove` returns `boolean`; `applyMove` is only called after it passes. Example: `validateMove` in `packages/games/src/stoper.ts` checks membership, one result per player, integer range.
- Network input is validated twice: zod schema (`moveSchema`) for shape, then `validateMove` for rules. The schema alone never decides game legality.
- `timeoutMove` must return a move that passes `validateMove` (checked by the contract test in `packages/games/src/index.test.ts`).
- Mini-games: a bad or missing result is treated as the worst possible score (`timeoutMove` returns `deviation: state.target`), not as a failure.
- Penalties in timed mini-games are a 1 s block or added time, never game over (ZASADY.md section 3).

**Server (`apps/server/src`):**
- Wrap async room handlers in `try/catch` and log with a prefix containing the room id: `console.error(\`[${this.roomId}] ${this.gameId ?? "lobby"}, ${where}:\`, error);` in `apps/server/src/LobbyRoom.ts`.
- Some `catch {}` blocks intentionally swallow errors where a failure is expected (e.g. `apps/server/src/LobbyRoom.ts` around line 234).

**Web (`apps/web/src`):**
- Fetch helpers return a safe default instead of throwing: `fetchRanking` returns `{}`, `fetchDaily` returns `null`, and the UI simply hides the section. See `apps/web/src/net.ts`.
- Share and clipboard actions swallow user cancellation: `await navigator.share({...}).catch(() => {})` in `apps/web/src/screens/ui.tsx`.

## Logging

**Framework:** `console` only (server). No logger library.

**Patterns:**
- Server logs only errors, and prefixes them with room id and phase. No debug logging in rules.
- Rules and the web client do not log. `console.` does not appear in `packages/games/src` or `apps/web/src`.
- Telemetry does not exist; do not add it without asking (AGENTS.md: no new dependencies without consent).

## Comments

**When to comment:**
- Explain a rule with its source in `ZASADY-GIER.md` when non-obvious, e.g. the 2 s limit in Stoper: `const giveUp = 2 * view.target;`.
- Explain why a value is what it is (the reason, not the number): `// Wersja 1: Refleks liczy średnią reakcji w ms zamiast trafień, więc stary rekord byłby nie do pobicia.` in `apps/server/src/stats.ts`.
- Name a ceiling with `ponytail:` when simplifying.

**JSDoc/TSDoc:**
- Used on exported interface members in `packages/games/src/core.ts` (`GameDefinition`), explaining the contract, e.g. `/** Obserwator dostaje widok dla "". */`.
- Not used for trivial helpers.

## Function Design

**Size:**
- Rules: `setup`, `validateMove`, `applyMove`, `playerView`, `isOver` are one-liner-ish arrow properties; long games (`kampus-tour.ts`, `statki.ts`) split logic into named helpers at module scope, not nested closures.
- React screens: one component per file; helpers (`Preview`, `seconds`) live at module scope in the same file.

**Parameters:**
- Rules receive `(state, player, move, rng)` in that order. `rng` is always the last argument and the only source of randomness (`Rng = () => number` in `core.ts`).
- Multi-player helpers take `players: PlayerId[]` first, then `results` record, then comparator: `rankResults(players, results, compare)`.
- Destructure move payloads in the signature: `validateMove: (state, player, { deviation }) => ...`.

**Return values:**
- Rules return new objects (spread). Never mutate the previous `State`: `applyMove: (state, player, { deviation }) => ({ ...state, results: { ...state.results, [player]: deviation } })`.
- `isOver` returns `GameResult | null` (`null` while playing). `ranked` / `rankResults` build the ranking.
- `Infinity` is the sentinel for "no result" in average helpers (`average` in `core.ts`).

## Module Design

**Exports:**
- Named exports only. No default exports in `packages/games`, `apps/server`, or `apps/web` (the one exception pattern is the Vite entry, which is not a source module).
- Each game module exports: the `GameDefinition` constant, `State`, `Move`, `View` (type), and any constants the UI needs (e.g. `VISIBLE_MS` in `stoper.ts`). `index.ts` aggregates them under game-prefixed names (`StoperView`, `STOPER_VISIBLE_MS`).

**Barrel files:**
- One barrel: `packages/games/src/index.ts`. It re-exports `core.ts`, `lobby.ts`, and game constants, and builds the `GAMES` registry keyed by `id`. Prototype keys are guarded: `GAMES["constructor"]` must be undefined (tested in `packages/games/src/index.test.ts`).
- Adding a game: add `<id>.ts` and `<id>.test.ts`, then the entry in `GAMES` and the exports in `index.ts`, then `apps/web/src/games/<Gra>.tsx` and branches in `screens/Game.tsx` and `screens/Lobby.tsx` (full list in `ZASADY.md` section 6).

**Shared helpers, reuse before writing:**
- `packages/games/src/core.ts` holds `createRng`, `roomCode`, `rankResults`, `rankPlaces`, `ranked`, `shuffle`, `average`, `byHitsThenAverage`, `byScoreThenAverage`, `normalize`, `nickKey`, `initials`, `standing`, `compareRecords`, `soloState`, `dailyGame`, `withSum`. Use these instead of local copies.
- `packages/games/src/quiz.ts` for "30 s questions with four answers" mechanics.
- Web: `Screen`, `TopBar`, `StickyBar`, `Scores`, `Intro`, `Stats`, `GameDots` in `apps/web/src/screens/ui.tsx`.
- CSS: classes `.tile`, `.label`, `.btn`, `.btn-primary`, `.btn-ghost`, `.field`, `.landscape` in `apps/web/src/index.css`. New shared classes only when a second game needs them.

## React and Styling Conventions

**Components:**
- Function components with hooks, no class components. Props declared in a local `interface Props` directly above the component (`apps/web/src/games/Stoper.tsx`).
- Game components receive `view`, `me`, `players`, `onMove`, and optionally `canMove` or `ranking`; they know nothing about the network.
- Timers use `useEffect` + `setInterval`/`setTimeout` with cleanup, and `performance.now()` for measurement (never animation state).
- Refs for values read in callbacks: `const start = useRef(0);`.

**Styling:**
- Tailwind v4 utility classes inline in JSX (`className="mx-auto flex min-h-[100dvh] max-w-md ..."`). Design tokens come from the `@theme` block in `apps/web/src/index.css` (`bg`, `surface`, `line`, `fg`, `fg-muted`, `accent`, `warning`, `success`, `accent-soft`, radii `inset`).
- Animations: keyframes in `apps/web/src/index.css` with a comment on purpose, used via `animate-[name_duration_easing]`. Global `prefers-reduced-motion` rule is in the same file.
- Touch targets at least 48 px (`min-h-12` or `.btn`). Numbers use `font-mono tabular-nums`.
- Dark theme only. Text strings are Polish, no em-dashes in UI copy, decimal comma (`10,00 s`).
- Icons: `@phosphor-icons/react`, with `aria-hidden` on decorative icons and `aria-label` on icon-only buttons.
- Animations are CSS, not a library (no Motion yet, per `KONCEPT.md`).

## Game Rule Conventions (checklist distilled from `ZASADY.md`)

- `id` is kebab-case and never changes (it is the SQLite ranking key).
- Every rule module exposes a `GameDefinition` with `minPlayers`, `maxPlayers`, `turnSeconds` or `turn()`, `moveSchema`, `validateMove`, `applyMove`, `playerView`, `isOver`, `waitingFor`, `timeoutMove`.
- Mini-games (`minPlayers: 1`) provide `places` (ranking with ties via `ranked`) and `record` (`lower` plus optional `tie`). They have no `modes`.
- Randomness only through `rng` passed into `setup` / `applyMove`. No `Math.random` or `Date.now` in `packages/games/src`.
- Randomized content must have the same total difficulty per match: use `withSum` or `shuffle` into full sets.
- State is plain JSON. Round-trip `JSON.parse(JSON.stringify(state))` must still work (tested).
- Hidden info goes through `playerView`; observer receives the view for `""`.

## Example: Minimal Rule Module

From `packages/games/src/stoper.ts` (shape to copy for a new mini-game):

```ts
import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked } from "./core.ts";

/** Po tylu ms licznik znika i gracz liczy w głowie. */
export const VISIBLE_MS = 3000;

export type Move = { type: "result"; deviation: number };

export interface State {
  players: PlayerId[];
  target: number;
  nonce: number;
  results: Record<PlayerId, number>;
}

export type View = State;

export const stoper: GameDefinition<State, Move> = {
  id: "stoper",
  name: "Stoper",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 60,
  moveSchema: z.object({ type: z.literal("result"), deviation: z.number() }),
  setup: (players, rng) => ({ players, target: 6000 + Math.floor(rng() * 9) * 1000, nonce: Math.floor(rng() * 2 ** 32), results: {} }),
  validateMove: (state, player, { deviation }) =>
    state.players.includes(player) && !(player in state.results) && Number.isInteger(deviation) && deviation >= 0 && deviation <= state.target,
  applyMove: (state, player, { deviation }) => ({ ...state, results: { ...state.results, [player]: deviation } }),
  playerView: (state): View => state,
  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),
  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),
  timeoutMove: (state) => ({ type: "result", deviation: state.target }),
};
```

---

*Convention analysis: 2026-10-21*

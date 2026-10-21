<!-- GSD:project-start source:PROJECT.md -->

## Project

**Kwadrans**

Prywatna platforma gier multiplayer w przeglądarce (games.figielak.dev) do grania ze znajomymi: jedna strona, kod pokoju, każdy gra na swoim telefonie. Gry główne (Kampus Tour, Gomoku, Statki, Chińczyk, Memory, Kalambury, Labirynt, Państwa-miasta), 30 mini-gier, turniej i wyzwanie dnia z rekordami. Pełny opis: `KONCEPT.md`, zasady gier: `ZASADY-GIER.md`, proces i kryteria spójności: `ZASADY.md`.

Bieżący etap (milestone): **audyt spójności całej platformy**, czyli raport rozbieżności, a potem poprawki.

**Core Value:** Każda gra działa i wygląda tak samo przewidywalnie: kod zgadza się z dokumentacją, a wyniki i rekordy są uczciwe i porównywalne między partiami.

### Constraints

- **Proces**: plan → akceptacja użytkownika → implementacja; zmiana zasad = najpierw test i `ZASADY-GIER.md`, potem kod — wymóg `AGENTS.md`
- **Testy**: `pnpm typecheck && pnpm test` bez błędów przed zgłoszeniem zmiany — to samo sprawdza CI
- **Zależności**: bez nowych zależności bez zgody; `apps/server` bez bezpośredniego `zod` — druga kopia `@colyseus/core`
- **Determinizm**: losowość tylko z `rng`, stan gry to zwykły JSON, `applyMove` niemutujący
- **UI**: ciemny motyw, tokeny kolorów, polskie teksty bez em-dashy, pola min. 48 px, ekran 360×640
- **Git**: praca na gałęzi (push na `master` publikuje produkcję), commity po polsku „<Gra>: co się zmieniło”, commit i push tylko na prośbę

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript (`^7.0.2` root devDependency, lock `typescript@7.0.2`) - all code: `apps/server/src/`, `apps/web/src/`, `packages/games/src/`. Config in `tsconfig.base.json` (`strict`, `module`/`moduleResolution` NodeNext, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `erasableSyntaxOnly`).
- TSX - React UI: `apps/web/src/screens/`, `apps/web/src/games/`.
- CSS - Tailwind v4 plus hand-written classes and animations in `apps/web/src/index.css`.
- HTML - `apps/web/index.html` (PWA meta tags, `lang="pl"`).
- JSON - PWA manifest `apps/web/public/manifest.webmanifest`, `pnpm-workspace.yaml`.

## Runtime

- Node.js 24 (`node:24-slim` in `Dockerfile`, `node-version: 24` in `.github/workflows/ci.yml`). No `.nvmrc` or `.node-version`.
- Server runs TypeScript directly with Node type stripping: `node apps/server/src/index.ts` (Docker `CMD`), `node --watch src/index.ts` (`apps/server` `dev` script). Hence `erasableSyntaxOnly` and `.ts` import extensions.
- Browser target: modern mobile browsers (PWA, `apple-mobile-web-app-capable`).
- pnpm `12.9.1` (`packageManager` field in root `package.json`; installed in Docker via `npm i -g pnpm@12.9.1`).
- Workspaces: `pnpm-workspace.yaml` covers `packages/*` and `apps/*`. `allowBuilds: msgpackr-extract: false` (native build disabled).
- Lockfile: `pnpm-lock.yaml` present; CI and Docker install with `--frozen-lockfile`.

## Workspace Packages

| Package | Path | Role | Key deps |
|---|---|---|---|
| `kwadrans` (root) | `package.json` | scripts `typecheck`, `test`, `build` run recursively | `typescript`, `vitest`, `@types/node` |
| `server` | `apps/server/` | Colyseus + Express server | `@colyseus/core`, `@colyseus/ws-transport`, `express`, `@kwadrans/games` |
| `web` | `apps/web/` | Vite + React frontend | `react`, `react-dom`, `@colyseus/sdk`, `@phosphor-icons/react`, `@fontsource-variable/geist-mono`, `@kwadrans/games` |
| `@kwadrans/games` | `packages/games/` | pure game rules, shared by server and web | `zod` |

## Frameworks

- Colyseus `0.18.18` (`@colyseus/core`) - multiplayer room server, `matchMaker`. Used in `apps/server/src/index.ts` and `apps/server/src/LobbyRoom.ts`.
- `@colyseus/ws-transport` `0.18.4` - WebSocket transport, `maxPayload: 32 * 1024` set in `apps/server/src/index.ts`.
- `@colyseus/sdk` `0.18.5` - browser client, used in `apps/web/src/net.ts`.
- Express `5.2.1` - HTTP layer (`/health`, `/api/*`, static frontend) inside the Colyseus `express` hook (`apps/server/src/index.ts`).
- React `19.3.0` / react-dom `19.3.0` - UI (`apps/web/src/main.tsx`, `App.tsx`).
- Vite `8.3.2` with `@vitejs/plugin-react` `^6.1.2` - frontend dev server (port 5173) and build (`apps/web/vite.config.ts`).
- Tailwind CSS `4.3.3` with `@tailwindcss/vite` `^4.3.3` - plugin in `apps/web/vite.config.ts`.
- `apps/web/src/index.css` - tokens, `.tile .label .btn .field` classes, CSS keyframe animations (no animation library installed; Motion is only planned per `KONCEPT.md`).
- `@phosphor-icons/react` `2.1.10` - icons.
- Fonts: Satoshi variable woff2 in `apps/web/public/fonts/` (self-hosted, `@font-face` in `index.css`); Geist Mono via `@fontsource-variable/geist-mono` `5.3.0` (imported in `apps/web/src/main.tsx`).
- `zod` `4.6.5` in `packages/games` (move schemas, `moveSchema` in `GameDefinition`).
- `node:sqlite` (`DatabaseSync`, built into Node 24) - `apps/server/src/stats.ts`. No ORM, no separate driver package.
- Vitest `5.0.3` (root devDependency). Test files: `packages/games/src/*.test.ts` (game rules), `apps/server/src/stats.test.ts`.
- Run: `pnpm test` (`pnpm -r test`); single file: `pnpm --filter @kwadrans/games exec vitest run src/<gra>.test.ts`.
- TypeScript `typecheck` via `tsc -p .` in each package (`noEmit`).
- Vite `build` for web only; server has no build step.
- `node --watch` for server dev.
- `@types/node` `^26.6.4` (root), `@types/express` `^5.0.6` (server), `@types/react` / `@types/react-dom` `^19.3.0` (web).

## Key Dependencies

- `@colyseus/core` `0.18.18` - room lifecycle, reconnect, seat reservation. Pinned at a version that must match the one resolved with `zod` (see Workspace Packages note).
- `zod` `4.6.5` - single copy, in `packages/games` only.
- `react` `19.3.0` - whole frontend.
- `node:sqlite` - ranking and records storage at `DB_PATH` (default `data/games.db`).
- `express` `5.2.1` - static file serving of `apps/web/dist` (`webDist` in `apps/server/src/index.ts`).
- `vite` `8.3.2` - frontend toolchain.

## Configuration

- `PORT` - server port, default `2567` (`apps/server/src/index.ts`). Dockerfile sets `PORT=2567`.
- `DB_PATH` - SQLite file path, default `data/games.db` (`apps/server/src/LobbyRoom.ts`). Dockerfile does not set it; the volume is mounted at `/app/data`.
- `NODE_ENV` - `production` in the Docker image.
- `TZ` - `Europe/Warsaw` in `docker-compose.yml`; the daily challenge rolls over at Polish midnight (`apps/server/src/index.ts`, `/api/daily`).
- `import.meta.env.DEV` (Vite) - selects dev server URL `http://<host>:2567` and `/dev` test page in `apps/web/src/net.ts` and `main.tsx`. Not present in production build.
- No `.env` files exist in the repo; `.gitignore` excludes `.env` and `.env.*` except `.env.example`.
- `tsconfig.base.json` (root), `apps/server/tsconfig.json` (types: node), `apps/web/tsconfig.json`, `packages/games/tsconfig.json`.
- `apps/web/vite.config.ts` - React and Tailwind plugins only.
- `pnpm-workspace.yaml` - workspace globs and `allowBuilds`.
- `.dockerignore` - excludes `node_modules`, `dist`, `.env`, `*.db`, `.git`, `cloudflared/*.json`.
- `apps/web/public/`: `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `fonts/`.
- PWA without a service worker (per `KONCEPT.md`).

## CI/CD

- `.github/workflows/ci.yml`: on push to `master` and on PRs, job `check` runs `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm --filter web build`. Job `image` (push only) builds and pushes `linux/arm64` image to GHCR via `docker/build-push-action@v6` (QEMU and Buildx set up, GHA cache).
- `Dockerfile`: three stages on `node:24-slim`. `build` (frontend, `--platform=$BUILDPLATFORM`), `deps` (`pnpm install --prod --frozen-lockfile --filter server...`), runtime (copies `apps/server/src`, `packages/games/src`, `apps/web/dist`; runs as `USER node`).
- `docker-compose.yml`: service `games` (`ghcr.io/figielak/kwadrans:latest`, `mem_limit: 256m`, volume `games-data:/app/data`) and `cloudflared` (`cloudflare/cloudflared:latest`, `mem_limit: 64m`).

## Platform Requirements

- Node.js 24 and pnpm 12.9.1.
- Ports: 2567 (server), 5173 (Vite).
- Commands: `pnpm install`, `pnpm --filter server dev`, `pnpm --filter web dev`, `pnpm typecheck && pnpm test`, `pnpm --filter web build`.
- Raspberry Pi (arm64) homelab host running Docker; image built for `linux/arm64`.
- Cloudflare Tunnel exposes `games.figielak.dev` to `http://games:2567` (`cloudflared/config.yml`).
- Container memory limit 256 MB for the game server (`docker-compose.yml`).
- SQLite file in the named Docker volume `games-data`.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Game rules in `packages/games/src/` are flat, lowercase kebab-case, one file per game: `piec-w-rzedzie.ts`, `kampus-tour.ts`, `panstwa-miasta.ts`, `w-pamieci.ts`. The game id (`id` in the definition) is the kebab-case name, e.g. `piec-w-rzedzie`, `kampus-tour`.
- Each game has a test file next to it: `packages/games/src/<id>.test.ts` (e.g. `packages/games/src/stoper.test.ts`).
- Shared data files carry a `-dane` suffix: `packages/games/src/kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Shared rule modules for games with the same mechanic: `packages/games/src/quiz.ts` (used by `kolor.ts`, `liczenie.ts`, `inny.ts`, `obrot.ts`, `literowka.ts`, `dziesiatki.ts`).
- React components are PascalCase, one per game: `apps/web/src/games/Stoper.tsx`, `apps/web/src/games/KampusTour.tsx`. Screens live in `apps/web/src/screens/` (`Home.tsx`, `Lobby.tsx`, `Setup.tsx`, `Game.tsx`, `Records.tsx`). Shared UI primitives sit in `apps/web/src/screens/ui.tsx`.
- Server files: PascalCase for the Colyseus room (`apps/server/src/LobbyRoom.ts`), lowercase for modules (`apps/server/src/stats.ts`, `index.ts`).
- Tests: `*.test.ts`, colocated. No `__tests__` folders.
- The rule object is a camelCase constant named after the game, exported by name: `export const stoper: GameDefinition<State, Move>`, `export const kampusTour`, `export const piecWRzedzie`, `export const panstwaMiasta`. The registry in `packages/games/src/index.ts` imports them by these names.
- Ids with a Polish `w-` or `-` form are converted to camelCase for the constant (`wPamieci`, `w-pamieci.ts`).
- A game file always exports `State`, `Move`, and (for the UI) `View` types, plus constants used by the UI or tests in UPPER_SNAKE_CASE (see below).
- camelCase, Polish or English words, depending on the file: rule helpers and UI names follow the domain language (`roomCode`, `createRng`, `rankResults`, `soloState`, `withSum`, `dailyGame`). Domain verbs are Polish in UI copy only.
- Game definition methods are arrow properties: `setup`, `validateMove`, `applyMove`, `playerView`, `isOver`, `waitingFor`, `timeoutMove`, `places`, `record`. Contract is in `packages/games/src/core.ts` (`GameDefinition`).
- React components: named function exports, not default exports: `export function Stoper(...)`, `export function Screen(...)`.
- Tunables and rule numbers are named UPPER_SNAKE_CASE constants at the top of the file, with a comment in Polish when the value is not obvious: `VISIBLE_MS = 3000` in `packages/games/src/stoper.ts`, `DURATION_MS = 30_000`, `QUESTIONS` in `packages/games/src/quiz.ts`, `ROOM_CODE_ALPHABET` in `packages/games/src/core.ts`.
- Numeric separators are used for large literals: `30_000`, `100_000`.
- Limits and time values are never inline magic numbers in rules; in UI, animation durations are constants at the top of the file (`COUNT_MS` in `apps/web/src/games/Stoper.tsx`, `STEP_MS`/`ROLL_MS` in `Chinczyk.tsx`).
- Types and interfaces are PascalCase: `GameDefinition`, `RoomView`, `LobbyPlayer`, `RecordRow`, `PlayerId = string` (alias in `core.ts`).
- Move unions use a `type` discriminant: `type Move = { type: "result"; deviation: number }`, `{ type: "buy" }`, `{ type: "wall", x, y, dir }`.
- State interfaces are named `State`, views `View`, moves `Move` in each game module (exported; `index.ts` re-exports them with a game prefix, e.g. `StoperView`).
- Records of players are keyed by `PlayerId`: `Record<PlayerId, number>` (`results`, `taps`, `places`).

## Code Style

- No Prettier, Biome, or EditorConfig config is committed (checked: no `.prettierrc`, `biome.json`, `.editorconfig` at root or in packages).
- Observed style, to be matched by hand: double quotes, semicolons, trailing commas in multi-line literals, 2-space indentation, long single lines allowed (up to about 160-180 columns in rule files like `packages/games/src/stoper.ts`, `packages/games/src/core.ts`).
- Imports within packages use explicit `.ts` / `.tsx` extensions: `import { createRng } from "./core.ts";`. Required by `allowImportingTsExtensions` and `verbatimModuleSyntax` in `tsconfig.base.json`.
- Type-only imports use `import type` or inline `type` modifiers: `import { type GameDefinition, type PlayerId, ranked } from "./core.ts";`.
- `strict: true`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true` (no `enum`, no parameter properties, no `namespace`). Use string-literal unions and `const` objects instead of enums.
- `noEmit: true` everywhere; the server runs TypeScript directly with `node src/index.ts` (Node 24 type stripping).
- Module mode `NodeNext`, target `ES2023`.
- Server `apps/server/tsconfig.json` adds `"types": ["node"]`.
- No ESLint config. Correctness relies on `strict` TypeScript and tests. `pnpm typecheck` and `pnpm test` are the gate (`.github/workflows/ci.yml`).
- Type escape hatches are not used: no `as any` and no `@ts-ignore` across `packages/` and `apps/` (checked with grep). Casts like `as { user_version: number }` appear only at SQLite boundaries (`apps/server/src/stats.ts`).
- Comments are in Polish, and describe the rule or the reason, not the mechanics. Example: `/** Po tylu ms licznik znika i gracz liczy w głowie. */` in `packages/games/src/stoper.ts`.
- Doc comments (`/** */`) on exported constants, types, and non-obvious functions. Line comments (`//`) for the why in logic.
- Deliberate simplifications are tagged `// ponytail: <ceiling>, <upgrade path>`. Example: `// ponytail: pomiar na kliencie, da się podrobić; między znajomymi wystarczy.` in `packages/games/src/stoper.ts`. About 39 files use this tag.
- Test files open with a Polish header comment listing the rules they fix, e.g. `packages/games/src/stoper.test.ts` ("Testy napisane przed implementacją. Ustalają zasady: ...").

## Import Organization

- None. Cross-package imports go through the workspace name `@kwadrans/games` (exports `./src/index.ts` in `packages/games/package.json`).
- Server must not import `zod` directly: schemas live in `packages/games` (reason in `KONCEPT.md` and `AGENTS.md`: a second copy of `@colyseus/core` breaks seat reservation).

## Error Handling

- Rules do not throw on bad input. `validateMove` returns `boolean`; `applyMove` is only called after it passes. Example: `validateMove` in `packages/games/src/stoper.ts` checks membership, one result per player, integer range.
- Network input is validated twice: zod schema (`moveSchema`) for shape, then `validateMove` for rules. The schema alone never decides game legality.
- `timeoutMove` must return a move that passes `validateMove` (checked by the contract test in `packages/games/src/index.test.ts`).
- Mini-games: a bad or missing result is treated as the worst possible score (`timeoutMove` returns `deviation: state.target`), not as a failure.
- Penalties in timed mini-games are a 1 s block or added time, never game over (ZASADY.md section 3).
- Wrap async room handlers in `try/catch` and log with a prefix containing the room id: `console.error(\`[${this.roomId}] ${this.gameId ?? "lobby"}, ${where}:\`, error);` in `apps/server/src/LobbyRoom.ts`.
- Some `catch {}` blocks intentionally swallow errors where a failure is expected (e.g. `apps/server/src/LobbyRoom.ts` around line 234).
- Fetch helpers return a safe default instead of throwing: `fetchRanking` returns `{}`, `fetchDaily` returns `null`, and the UI simply hides the section. See `apps/web/src/net.ts`.
- Share and clipboard actions swallow user cancellation: `await navigator.share({...}).catch(() => {})` in `apps/web/src/screens/ui.tsx`.

## Logging

- Server logs only errors, and prefixes them with room id and phase. No debug logging in rules.
- Rules and the web client do not log. `console.` does not appear in `packages/games/src` or `apps/web/src`.
- Telemetry does not exist; do not add it without asking (AGENTS.md: no new dependencies without consent).

## Comments

- Explain a rule with its source in `ZASADY-GIER.md` when non-obvious, e.g. the 2 s limit in Stoper: `const giveUp = 2 * view.target;`.
- Explain why a value is what it is (the reason, not the number): `// Wersja 1: Refleks liczy średnią reakcji w ms zamiast trafień, więc stary rekord byłby nie do pobicia.` in `apps/server/src/stats.ts`.
- Name a ceiling with `ponytail:` when simplifying.
- Used on exported interface members in `packages/games/src/core.ts` (`GameDefinition`), explaining the contract, e.g. `/** Obserwator dostaje widok dla "". */`.
- Not used for trivial helpers.

## Function Design

- Rules: `setup`, `validateMove`, `applyMove`, `playerView`, `isOver` are one-liner-ish arrow properties; long games (`kampus-tour.ts`, `statki.ts`) split logic into named helpers at module scope, not nested closures.
- React screens: one component per file; helpers (`Preview`, `seconds`) live at module scope in the same file.
- Rules receive `(state, player, move, rng)` in that order. `rng` is always the last argument and the only source of randomness (`Rng = () => number` in `core.ts`).
- Multi-player helpers take `players: PlayerId[]` first, then `results` record, then comparator: `rankResults(players, results, compare)`.
- Destructure move payloads in the signature: `validateMove: (state, player, { deviation }) => ...`.
- Rules return new objects (spread). Never mutate the previous `State`: `applyMove: (state, player, { deviation }) => ({ ...state, results: { ...state.results, [player]: deviation } })`.
- `isOver` returns `GameResult | null` (`null` while playing). `ranked` / `rankResults` build the ranking.
- `Infinity` is the sentinel for "no result" in average helpers (`average` in `core.ts`).

## Module Design

- Named exports only. No default exports in `packages/games`, `apps/server`, or `apps/web` (the one exception pattern is the Vite entry, which is not a source module).
- Each game module exports: the `GameDefinition` constant, `State`, `Move`, `View` (type), and any constants the UI needs (e.g. `VISIBLE_MS` in `stoper.ts`). `index.ts` aggregates them under game-prefixed names (`StoperView`, `STOPER_VISIBLE_MS`).
- One barrel: `packages/games/src/index.ts`. It re-exports `core.ts`, `lobby.ts`, and game constants, and builds the `GAMES` registry keyed by `id`. Prototype keys are guarded: `GAMES["constructor"]` must be undefined (tested in `packages/games/src/index.test.ts`).
- Adding a game: add `<id>.ts` and `<id>.test.ts`, then the entry in `GAMES` and the exports in `index.ts`, then `apps/web/src/games/<Gra>.tsx` and branches in `screens/Game.tsx` and `screens/Lobby.tsx` (full list in `ZASADY.md` section 6).
- `packages/games/src/core.ts` holds `createRng`, `roomCode`, `rankResults`, `rankPlaces`, `ranked`, `shuffle`, `average`, `byHitsThenAverage`, `byScoreThenAverage`, `normalize`, `nickKey`, `initials`, `standing`, `compareRecords`, `soloState`, `dailyGame`, `withSum`. Use these instead of local copies.
- `packages/games/src/quiz.ts` for "30 s questions with four answers" mechanics.
- Web: `Screen`, `TopBar`, `StickyBar`, `Scores`, `Intro`, `Stats`, `GameDots` in `apps/web/src/screens/ui.tsx`.
- CSS: classes `.tile`, `.label`, `.btn`, `.btn-primary`, `.btn-ghost`, `.field`, `.landscape` in `apps/web/src/index.css`. New shared classes only when a second game needs them.

## React and Styling Conventions

- Function components with hooks, no class components. Props declared in a local `interface Props` directly above the component (`apps/web/src/games/Stoper.tsx`).
- Game components receive `view`, `me`, `players`, `onMove`, and optionally `canMove` or `ranking`; they know nothing about the network.
- Timers use `useEffect` + `setInterval`/`setTimeout` with cleanup, and `performance.now()` for measurement (never animation state).
- Refs for values read in callbacks: `const start = useRef(0);`.
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

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Pattern Overview

- Każda gra to obiekt `GameDefinition` z `setup`, `validateMove`, `applyMove`, `playerView`, `isOver`, `waitingFor`, opcjonalnie `timeoutMove`, `turn`, `places`, `record` (`packages/games/src/core.ts`).
- Stan gry to zwykły obiekt JSON. `applyMove` zwraca nowy stan i nie modyfikuje poprzedniego.
- Losowość tylko przez `rng` przekazany do `setup`/`applyMove`; zasady nie używają `Math.random` ani `Date.now`.
- Ukryte informacje filtruje `playerView` osobno dla każdego gracza; obserwator dostaje widok dla `""`.
- Synchronizacja to wiadomości z widokiem, a nie Colyseus Schema: po każdym ruchu `LobbyRoom` wysyła każdemu jego `RoomView`.
- Mini-gry grają po stronie klienta w czasie rzeczywistym (pomiar reakcji), a serwer dostaje tylko wynik i go waliduje (`result` / `progress`).
- Rejestr gier `GAMES` w `packages/games/src/index.ts` jest jedynym miejscem, z którego serwer i klient znają listę gier.

## Layers

- Purpose: reguły, stan, walidacja ruchów, rankingi.
- Location: `packages/games/src/`
- Contains: `<gra>.ts` + `<gra>.test.ts` płasko; wspólne `core.ts`, `lobby.ts` (kontrakt wiadomości pokoju, kolory, limity), `turniej.ts` (czysta logika turnieju), `quiz.ts` (wspólne dla Kolor liter, Liczenie, Inny element, Obrót, Literówka); dane `kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Depends on: `zod` (tylko tu; schematy ruchów i wiadomości).
- Used by: `apps/server` (przez `@kwadrans/games`) oraz `apps/web` (typy, `GAMES`, stałe, wspólne funkcje).
- Purpose: pokoje Colyseus, kody, kolejność tur, timery, rate limit, reconnect, zapis wyników.
- Location: `apps/server/src/`
- Contains: `index.ts` (start `Server`, Express, endpointy `/api/*`, statyczny frontend z `apps/web/dist`), `LobbyRoom.ts` (pokój `lobby`), `stats.ts` (SQLite).
- Depends on: `@kwadrans/games`, `@colyseus/core`, `@colyseus/ws-transport`, `express`. Brak bezpośredniej zależności od `zod` (wymóg platformy).
- Used by: przeglądarka przez WebSocket i HTTP.
- Purpose: nick, lobby, wybór gry, rozgrywka, rekordy, komunikacja z pokojem.
- Location: `apps/web/src/`
- Contains: `App.tsx` (routing stanu: home / lobby / setup / mini-gry / rekordy / gra), `net.ts` (klient Colyseus, token w `localStorage`, reconnect, fetch do API), `screens/` (platforma), `games/` (UI każdej gry, `MiniGame.tsx` dla mini-gier po `id`), `Dev.tsx` (tryb testowy `/dev`, tylko w dev).
- Depends on: `@kwadrans/games`, `@colyseus/sdk`, React, Vite, Tailwind, Phosphor Icons.
- Used by: użytkownik w przeglądarce / PWA.

## Data Flow

### Primary Request Path (ruch w grze)

### Mini-gra solo i w pokoju

### Turniej

- Stan pokoju (`players`, `phase`, `gameId`, `match`, `tournament`, `scores`) w polach `LobbyRoom`.
- Stan partii w `Match` (`def`, `state`, `rng`, `result`), w pamięci.
- Klient trzyma tylko ostatni `RoomView` (`useState` w `App.tsx`) i lokalne stany ekranów.

## Key Abstractions

- Purpose: kontrakt każdej gry.
- Examples: `packages/games/src/core.ts` (interfejs), `packages/games/src/piec-w-rzedzie.ts`, `packages/games/src/kampus-tour.ts`.
- Pattern: obiekt typu `GameDefinition<State, Move>` eksportowany przez moduł gry i rejestrowany w `GAMES`.
- Purpose: lista gier dla lobby, serwera i API.
- Examples: `packages/games/src/index.ts`.
- Pattern: mapa `id → definicja`; `id` jest kluczem rankingu w SQLite i nigdy się nie zmienia.
- Purpose: miejsca i remisy bez powielania kodu.
- Examples: `rankResults`, `rankPlaces`, `ranked`, `standing`, `compareRecords` w `packages/games/src/core.ts`.
- Pattern: komparator (`a, b → number`) przekazany do funkcji rankującej.
- Purpose: ten sam mechanizm pokoju dla gry jednoosobowej i serii gier.
- Examples: `solo` w `apps/server/src/LobbyRoom.ts`, `packages/games/src/turniej.ts`.
- Pattern: turniej nie jest w `GAMES`; to konfiguracja pokoju, a poszczególne gry idą zwykłym `startMatch`.
- Purpose: jeden komponent na wszystkie mini-gry wybierany po `id`.
- Examples: `apps/web/src/games/MiniGame.tsx`, `apps/web/src/games/Quiz.tsx` (wspólny dla quizów), `apps/web/src/games/Szacowanie.tsx` (Policz kropki i Kąt).
- Pattern: `Game.tsx` dispatchuje po `view.gameId` do komponentu gry.

## Entry Points

- Location: `apps/server/src/index.ts`
- Triggers: `node apps/server/src/index.ts` (produkcja w kontenerze), `pnpm --filter server dev` (`node --watch`).
- Responsibilities: start `Server`, WebSocket na `maxPayload` 32 KB, endpointy `/health`, `/api/stats`, `/api/records`, `/api/records/:gameId/top`, `/api/daily`, `/api/rooms`, statyczny frontend, rejestracja pokoju `lobby`.
- Location: `apps/web/src/main.tsx` (render), `apps/web/src/App.tsx` (routing ekranów).
- Triggers: otwarcie strony; `/dev` tylko w `import.meta.env.DEV`.
- Responsibilities: wznowienie pokoju z tokenu, wybór ekranu wg `RoomView`.
- Location: `apps/server/src/LobbyRoom.ts` (`onCreate`, `onJoin`, `onMessage` przez `on`).
- Triggers: wiadomości `pickGame`, `start`, `ready`, `move`, `rematch`, `toLobby`, itd. (`ROOM_MESSAGES`).

## Architectural Constraints

- **Threading:** jeden proces Node, pętla zdarzeń; timery przez `this.clock` pokoju. Brak workerów.
- **Global state:** `roomsByIp` i `stats` (singleton SQLite, `export const stats` w `apps/server/src/LobbyRoom.ts`); `roomsByIp` liczy w pamięci, więc restart go zeruje.
- **Circular imports:** nie stwierdzono w analizowanych modułach.
- **Zależność zod:** `apps/server` nie może dodać `zod` (druga kopia `@colyseus/core` psuje rezerwację miejsca); schematy żyją w `packages/games`.
- **Pamięć:** kontener z `mem_limit: 256m` (`docker-compose.yml`), stan pokojów w RAM.
- **Dockerfile:** kopiuje `packages/games/src` i `apps/server/src` jako TypeScript uruchamiany bezpośrednio przez Node 24, bez kroku kompilacji serwera.
- **Stan pokojów nie jest trwały:** restart procesu kończy trwające partie (zapis stanu pokoi w SQLite jest na liście do zrobienia w `KONCEPT.md`).

## Anti-Patterns

### Logika zasad w komponencie React

### Pomiar czasu reakcji na serwerze

### Dodawanie zależności zod w apps/server

## Error Handling

- `on()` w `apps/server/src/LobbyRoom.ts` owija każdą obsługę w `try/catch` i loguje przez `logError`.
- Niepoprawna wiadomość (zod `safeParse` nie przeszedł) jest cicho pomijana.
- Klient: `net.ts` ponawia połączenie; `App.tsx` pokazuje komunikat przy `onLeave` z kodem innym niż `CONSENTED`.
- API: `apps/web/src/net.ts` zwraca puste wartości przy błędzie (`fetchRanking`, `fetchRecords`, `fetchDaily`).

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-fast` for a trivial task inline, with no subagents and no PLAN.md
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

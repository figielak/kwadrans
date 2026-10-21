---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
# Codebase Structure

**Analysis Date:** 2026-10-21

## Directory Layout

```
kwadrans/
├── apps/
│   ├── server/src/      # Serwer Colyseus + Express + SQLite
│   └── web/src/         # Frontend React (PWA)
│       ├── screens/     # Ekrany platformy (lobby, ustawienia, rekordy)
│       └── games/       # Interfejs każdej gry
├── packages/
│   └── games/src/       # Zasady gier, kontrakt, rejestr GAMES (płasko)
├── plany/               # Notatki planistyczne dla poszczególnych mini-gier (sudoku.md, ...)
├── cloudflared/         # config.yml tunelu (credentials.json lokalnie, nie w repo)
├── .github/workflows/   # ci.yml (typecheck, test, build, obraz GHCR)
├── .planning/codebase/  # Dokumenty mapowania (ten plik i inne)
├── .claude/             # Konfiguracja agentów (memory, skills, commands)
├── Dockerfile           # Obraz: build web, deps server, uruchomienie serwera
├── docker-compose.yml   # Usługi games + cloudflared, wolumen games-data
├── pnpm-workspace.yaml  # Workspaces: packages/*, apps/*
├── package.json         # Skrypty root: typecheck, test, build
├── tsconfig.base.json   # Wspólna konfiguracja TypeScript
└── KONCEPT.md, AGENTS.md, README.md, ZASADY.md, ZASADY-GIER.md, DESIGN.md
```

## Directory Purposes

**`packages/games/src/`:**
- Purpose: czyste zasady gier, kontrakt `GameDefinition`, wspólne funkcje, rejestr.
- Contains: `<gra>.ts` z `<gra>.test.ts` obok, `core.ts`, `lobby.ts`, `turniej.ts`, `quiz.ts`, `index.ts`, pliki danych `*-dane.ts`.
- Key files: `core.ts` (kontrakt i utilsy), `index.ts` (`GAMES`, `MINI_GAME_IDS`), `lobby.ts` (`ROOM_MESSAGES`, kolory, `INTRO_SECONDS`), `turniej.ts`.

**`apps/server/src/`:**
- Purpose: transport i trwałość.
- Contains: `index.ts`, `LobbyRoom.ts`, `stats.ts`, `stats.test.ts`.

**`apps/web/src/screens/`:**
- Purpose: ekrany wspólne dla wszystkich gier.
- Contains: `Home.tsx` (start, „Sam”, „Ze znajomymi”), `Lobby.tsx`, `Setup.tsx` (ekran gry głównej i turnieju), `MiniGames.tsx` (lista mini-gier), `Records.tsx` (rekordy), `Game.tsx` (dispatch partii), `ui.tsx` (wspólne `Screen`, `TopBar`, `StickyBar`, `Scores`, `Intro`, `Stats`).

**`apps/web/src/games/`:**
- Purpose: UI jednej gry lub grupy gier.
- Contains: `KampusTour.tsx` + `KampusSummary.tsx`, `Statki.tsx`, `PiecWRzedzie.tsx`, `Chinczyk.tsx`, `Memory.tsx`, `Labirynt.tsx`, `PanstwaMiasta.tsx`, `Kalambury.tsx`, `MiniGame.tsx` (dispatch mini-gier po `id`), `Quiz.tsx`, `Szacowanie.tsx`, oraz pozostałe mini-gry (`Refleks.tsx`, `Kolo.tsx`, `Tort.tsx`, itd.).

**`apps/web/public/`:**
- Purpose: statyczne zasoby PWA.
- Contains: `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `fonts/`.

**`apps/web/src/` (pliki główne):**
- `main.tsx` (render, wybór `Dev` albo `App`), `App.tsx` (routing ekranów), `net.ts` (klient Colyseus, token, API), `Dev.tsx` (tryb testowy), `index.css` (klasy `.tile`, `.label`, `.btn`, `.field`, animacje CSS).

## Key File Locations

**Entry Points:**
- `apps/server/src/index.ts`: start serwera i endpointów.
- `apps/web/src/main.tsx`: start klienta.
- `apps/web/src/App.tsx`: wybór ekranu wg stanu pokoju.

**Configuration:**
- `package.json` (root), `pnpm-workspace.yaml`, `tsconfig.base.json`, `apps/web/vite.config.ts`, `apps/*/tsconfig.json`, `packages/games/tsconfig.json`.
- `docker-compose.yml`, `Dockerfile`, `cloudflared/config.yml`, `.github/workflows/ci.yml`.

**Core Logic:**
- `packages/games/src/core.ts`: kontrakt `GameDefinition`, RNG, rankingi, rekordy.
- `packages/games/src/lobby.ts`: wiadomości pokoju i ich schematy zod.
- `apps/server/src/LobbyRoom.ts`: pokój, tury, timery, rate limit.
- `apps/server/src/stats.ts`: SQLite (ranking, rekordy, `/api/daily`).

**Testing:**
- `packages/games/src/*.test.ts`: testy zasad każdej gry (Vitest).
- `packages/games/src/index.test.ts`, `core.test.ts`: testy rejestru i wspólnych funkcji.
- `apps/server/src/stats.test.ts`: testy statystyk.
- Brak testów UI w repo.

## Naming Conventions

**Files:**
- Zasady gier: kebab-case lub nazwa gry małymi literami, np. `piec-w-rzedzie.ts`, `kampus-tour.ts`, `panstwa-miasta.ts`, `w-pamieci.ts`, `w-pamieci.test.ts`.
- Dane: suffix `-dane.ts`, np. `kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Komponenty UI: PascalCase, np. `KampusTour.tsx`, `PiecWRzedzie.tsx`, `Setup.tsx`.
- Testy: `<modul>.test.ts` obok źródła.

**Directories:**
- Wszystkie katalogi lowercase: `screens`, `games`, `src`.

**Identifiers:**
- Id gry w rejestrze: małe litery z myślnikiem, np. `piec-w-rzedzie`; `id` nie zmienia się nigdy (klucz rankingu).
- Eksporty zasad: nazwa obiektu gry w camelCase, np. `kampusTour`, `piecWRzedzie`, `panstwaMiasta`, `wPamieci`.

## Where to Add New Code

**Nowa gra (mini-gra lub główna):**
- Zasady i testy: `packages/games/src/<gra>.ts` oraz `packages/games/src/<gra>.test.ts` (test pierwszy, osobnym commitem).
- Dane gry (jeśli potrzebne): `packages/games/src/<gra>-dane.ts`.
- Rejestracja: wpis w `GAMES` w `packages/games/src/index.ts` (oraz `MINI_GAME_IDS`, jeśli mini-gra).
- UI: `apps/web/src/games/<Gra>.tsx`; mini-gra wpinana w `apps/web/src/games/MiniGame.tsx`, gra główna w `apps/web/src/screens/Game.tsx`.
- Ikona na liście: `apps/web/src/screens/Lobby.tsx` (lub `MiniGames.tsx` dla mini-gier).
- Zasady w `ZASADY-GIER.md`, proces w `ZASADY.md`.

**Nowy ekran platformy:**
- `apps/web/src/screens/<Nazwa>.tsx`, podpięcie w `apps/web/src/App.tsx`, wspólne elementy z `screens/ui.tsx`.

**Nowy endpoint API:**
- `apps/server/src/index.ts` (Express, w bloku `express: (app) => …`); dane z `stats.ts`.

**Nowa wiadomość pokoju:**
- Schemat w `ROOM_MESSAGES` (`packages/games/src/lobby.ts`), obsługa przez `this.on(...)` w `apps/server/src/LobbyRoom.ts`, wysyłka z klienta przez `room.send` (`apps/web/src/App.tsx`).

**Wspólna funkcja zasad:**
- `packages/games/src/core.ts` (jeśli używa jej więcej niż jedna gra); w innym wypadku w module gry.

**Wspólna funkcja UI:**
- `apps/web/src/screens/ui.tsx` (ekrany), `apps/web/src/index.css` (klasy i animacje).

## Special Directories

**`node_modules/`:**
- Purpose: zależności pnpm.
- Generated: Tak.
- Committed: Nie.

**`apps/web/dist/`:**
- Purpose: zbudowany frontend serwowany przez Express.
- Generated: Tak (`pnpm --filter web build`).
- Committed: Nie.

**`data/`:**
- Purpose: SQLite (`data/games.db`, domyślnie `DB_PATH`).
- Generated: Tak (`mkdirSync` w `LobbyRoom.ts`); w kontenerze to wolumen `games-data`.
- Committed: Nie.

**`plany/`:**
- Purpose: notatki planistyczne mini-gier (np. `sudoku.md`, `zakupy.md`).
- Generated: Nie.
- Committed: Tak.

**`.playwright-mcp/`:**
- Purpose: zrzuty snapshotów z testów przeglądarki.
- Generated: Tak.
- Committed: Tak (pliki `.yml` w repo).

**`.claude/`:**
- Purpose: pamięć projektu (`memory/`) i konfiguracja narzędzi agentów. Część plików nieśledzona w git.
- Generated: Częściowo.
- Committed: Częściowo.

---

*Structure analysis: 2026-10-21*

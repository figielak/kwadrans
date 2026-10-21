---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
<!-- refreshed: 2026-10-21 -->

# Architecture

**Analysis Date:** 2026-10-21

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                 Przeglądarka (PWA, React + Vite)            │
│  `apps/web/src/main.tsx` → `App.tsx` → screens/ + games/    │
└───────────────┬─────────────────────────────┬───────────────┘
                │ WebSocket (Colyseus SDK)    │ HTTP GET (/api/*)
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│        Serwer Node 24 (Colyseus + Express, jeden proces)     │
│  `apps/server/src/index.ts`  →  `LobbyRoom.ts` (pokoje)      │
│                 │ wywołuje czyste funkcje                    │
│                 ▼                                            │
│  `packages/games/src/` (zasady: setup/validateMove/applyMove)│
└───────────────────────────────┬─────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  `apps/server/src/stats.ts` → SQLite (`DB_PATH`, node:sqlite)│
│  ranking wygranych, rekordy mini-gier, rekordowe partie      │
└─────────────────────────────────────────────────────────────┘
```

Stan pokoi (lobby, trwająca partia, timery) żyje w pamięci procesu. Tylko wyniki trafiają do SQLite.

## Pattern Overview

**Overall:** Monorepo z czystym rdzeniem logiki gier (`packages/games`) i cienką warstwą sieciową (serwer Colyseus) oraz klientem React. Serwer jest jedynym źródłem prawdy.

**Key Characteristics:**
- Każda gra to obiekt `GameDefinition` z `setup`, `validateMove`, `applyMove`, `playerView`, `isOver`, `waitingFor`, opcjonalnie `timeoutMove`, `turn`, `places`, `record` (`packages/games/src/core.ts`).
- Stan gry to zwykły obiekt JSON. `applyMove` zwraca nowy stan i nie modyfikuje poprzedniego.
- Losowość tylko przez `rng` przekazany do `setup`/`applyMove`; zasady nie używają `Math.random` ani `Date.now`.
- Ukryte informacje filtruje `playerView` osobno dla każdego gracza; obserwator dostaje widok dla `""`.
- Synchronizacja to wiadomości z widokiem, a nie Colyseus Schema: po każdym ruchu `LobbyRoom` wysyła każdemu jego `RoomView`.
- Mini-gry grają po stronie klienta w czasie rzeczywistym (pomiar reakcji), a serwer dostaje tylko wynik i go waliduje (`result` / `progress`).
- Rejestr gier `GAMES` w `packages/games/src/index.ts` jest jedynym miejscem, z którego serwer i klient znają listę gier.

## Layers

**Zasady gier (domena):**
- Purpose: reguły, stan, walidacja ruchów, rankingi.
- Location: `packages/games/src/`
- Contains: `<gra>.ts` + `<gra>.test.ts` płasko; wspólne `core.ts`, `lobby.ts` (kontrakt wiadomości pokoju, kolory, limity), `turniej.ts` (czysta logika turnieju), `quiz.ts` (wspólne dla Kolor liter, Liczenie, Inny element, Obrót, Literówka); dane `kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Depends on: `zod` (tylko tu; schematy ruchów i wiadomości).
- Used by: `apps/server` (przez `@kwadrans/games`) oraz `apps/web` (typy, `GAMES`, stałe, wspólne funkcje).

**Serwer (transport, pokoje, trwałość):**
- Purpose: pokoje Colyseus, kody, kolejność tur, timery, rate limit, reconnect, zapis wyników.
- Location: `apps/server/src/`
- Contains: `index.ts` (start `Server`, Express, endpointy `/api/*`, statyczny frontend z `apps/web/dist`), `LobbyRoom.ts` (pokój `lobby`), `stats.ts` (SQLite).
- Depends on: `@kwadrans/games`, `@colyseus/core`, `@colyseus/ws-transport`, `express`. Brak bezpośredniej zależności od `zod` (wymóg platformy).
- Used by: przeglądarka przez WebSocket i HTTP.

**Klient (ekrany platformy i UI gier):**
- Purpose: nick, lobby, wybór gry, rozgrywka, rekordy, komunikacja z pokojem.
- Location: `apps/web/src/`
- Contains: `App.tsx` (routing stanu: home / lobby / setup / mini-gry / rekordy / gra), `net.ts` (klient Colyseus, token w `localStorage`, reconnect, fetch do API), `screens/` (platforma), `games/` (UI każdej gry, `MiniGame.tsx` dla mini-gier po `id`), `Dev.tsx` (tryb testowy `/dev`, tylko w dev).
- Depends on: `@kwadrans/games`, `@colyseus/sdk`, React, Vite, Tailwind, Phosphor Icons.
- Used by: użytkownik w przeglądarce / PWA.

## Data Flow

### Primary Request Path (ruch w grze)

1. Klient wysyła intencję, np. `move` z danymi ruchu (`apps/web/src/screens/Game.tsx` → `room.send` w `apps/web/src/App.tsx`).
2. `LobbyRoom.on("move")` sprawdza limit wiadomości, waliduje schemat zod z `ROOM_MESSAGES` (`packages/games/src/lobby.ts`) i wywołuje `play` (`apps/server/src/LobbyRoom.ts`).
3. `play` sprawdza `def.validateMove(state, player, move)`; odrzucony ruch nic nie zmienia.
4. `applyMove` zwraca nowy stan, `isOver` ustala wynik; przy końcu zapis przez `stats` i `scores`.
5. `LobbyRoom` przelicza `playerView` dla każdego gracza i rozsyła `RoomView` (`apps/server/src/LobbyRoom.ts`, około linii 474), a klient przerysowuje ekran przez `watchRoom` (`apps/web/src/net.ts`).

### Mini-gra solo i w pokoju

1. Solo: `LobbyRoom.onCreate({ solo })` ustawia pokój na jednego gracza i od razu startuje `startMatch` (`apps/server/src/LobbyRoom.ts`).
2. Ekran instrukcji (`intro`) rusza grę po wejściu wszystkich graczy albo po `INTRO_SECONDS` (`packages/games/src/lobby.ts`).
3. Limit tury z `turnSeconds` / `turn(state)` odnawia się tylko przy zmianie `waitingFor` lub `key`; po czasie `timeoutMove` wykonuje ruch za gracza.
4. Wynik trafia przez `record` do `stats.ts`; ranking i rekordy czyta `/api/records` i `/api/daily`.

### Turniej

1. `pickTournament` tworzy konfigurację z `turniej.ts`; gospodarz i każdy gracz zaznaczają gry (`markGame`).
2. Serwer losuje kolejne gry i odpala je zwykłym `startMatch`; punkty z `places` sumuje `turniej.ts`.
3. Zwycięzca trafia do rankingu pod `id` `turniej`.

**State Management:**
- Stan pokoju (`players`, `phase`, `gameId`, `match`, `tournament`, `scores`) w polach `LobbyRoom`.
- Stan partii w `Match` (`def`, `state`, `rng`, `result`), w pamięci.
- Klient trzyma tylko ostatni `RoomView` (`useState` w `App.tsx`) i lokalne stany ekranów.

## Key Abstractions

**GameDefinition:**
- Purpose: kontrakt każdej gry.
- Examples: `packages/games/src/core.ts` (interfejs), `packages/games/src/piec-w-rzedzie.ts`, `packages/games/src/kampus-tour.ts`.
- Pattern: obiekt typu `GameDefinition<State, Move>` eksportowany przez moduł gry i rejestrowany w `GAMES`.

**Rejestr GAMES i MINI_GAME_IDS:**
- Purpose: lista gier dla lobby, serwera i API.
- Examples: `packages/games/src/index.ts`.
- Pattern: mapa `id → definicja`; `id` jest kluczem rankingu w SQLite i nigdy się nie zmienia.

**Rankingi (wspólne funkcje):**
- Purpose: miejsca i remisy bez powielania kodu.
- Examples: `rankResults`, `rankPlaces`, `ranked`, `standing`, `compareRecords` w `packages/games/src/core.ts`.
- Pattern: komparator (`a, b → number`) przekazany do funkcji rankującej.

**Gra solo i turniej jako pokój:**
- Purpose: ten sam mechanizm pokoju dla gry jednoosobowej i serii gier.
- Examples: `solo` w `apps/server/src/LobbyRoom.ts`, `packages/games/src/turniej.ts`.
- Pattern: turniej nie jest w `GAMES`; to konfiguracja pokoju, a poszczególne gry idą zwykłym `startMatch`.

**Mini-gra w UI:**
- Purpose: jeden komponent na wszystkie mini-gry wybierany po `id`.
- Examples: `apps/web/src/games/MiniGame.tsx`, `apps/web/src/games/Quiz.tsx` (wspólny dla quizów), `apps/web/src/games/Szacowanie.tsx` (Policz kropki i Kąt).
- Pattern: `Game.tsx` dispatchuje po `view.gameId` do komponentu gry.

## Entry Points

**Serwer:**
- Location: `apps/server/src/index.ts`
- Triggers: `node apps/server/src/index.ts` (produkcja w kontenerze), `pnpm --filter server dev` (`node --watch`).
- Responsibilities: start `Server`, WebSocket na `maxPayload` 32 KB, endpointy `/health`, `/api/stats`, `/api/records`, `/api/records/:gameId/top`, `/api/daily`, `/api/rooms`, statyczny frontend, rejestracja pokoju `lobby`.

**Klient:**
- Location: `apps/web/src/main.tsx` (render), `apps/web/src/App.tsx` (routing ekranów).
- Triggers: otwarcie strony; `/dev` tylko w `import.meta.env.DEV`.
- Responsibilities: wznowienie pokoju z tokenu, wybór ekranu wg `RoomView`.

**Pokój gry:**
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

**What happens:** reguły gry (np. kto może ruszyć, koszt) pojawiają się w `apps/web/src/games/<Gra>.tsx`.
**Why it's wrong:** klient jest niezaufany; serwer nie zna reguły, a rozjazd daje rozbieżne stany.
**Do this instead:** reguła w `packages/games/src/<gra>.ts` (`validateMove`), klient tylko pokazuje wynik `playerView`. Przykład wzorca: `packages/games/src/kampus-tour.ts`.

### Pomiar czasu reakcji na serwerze

**What happens:** mini-gry na refleks liczą czas po stronie klienta, a serwer dostaje gotowy wynik.
**Why it's wrong:** opóźnienie Wi-Fi zmieniłoby wynik, ale to dlatego, że pomiar jest na kliencie. Zmiana na serwer wymaga przesyłania czasów zdarzeń.
**Do this instead:** dla mini-gier zachować wzorzec z `KONCEPT.md` (klient mierzy, serwer waliduje zakres i liczy wynik z danych, np. `packages/games/src/stoj.ts` z czasów reakcji).

### Dodawanie zależności zod w apps/server

**What happens:** import `zod` w `apps/server/src`.
**Why it's wrong:** druga kopia `@colyseus/core` psuje rezerwację miejsca.
**Do this instead:** eksport schematu z `packages/games` i import stamtąd.

## Error Handling

**Strategy:** ruch odrzucony przez `validateMove` nic nie zmienia; wyjątek w obsłudze wiadomości jest łapany i logowany, pokój działa dalej.

**Patterns:**
- `on()` w `apps/server/src/LobbyRoom.ts` owija każdą obsługę w `try/catch` i loguje przez `logError`.
- Niepoprawna wiadomość (zod `safeParse` nie przeszedł) jest cicho pomijana.
- Klient: `net.ts` ponawia połączenie; `App.tsx` pokazuje komunikat przy `onLeave` z kodem innym niż `CONSENTED`.
- API: `apps/web/src/net.ts` zwraca puste wartości przy błędzie (`fetchRanking`, `fetchRecords`, `fetchDaily`).

## Cross-Cutting Concerns

**Logging:** `console.error` w `LobbyRoom.logError`; brak ustrukturyzowanego loggera.
**Validation:** zod na wiadomościach pokoju (`ROOM_MESSAGES`, `packages/games/src/lobby.ts`) i na ruchach gier (`moveSchema`); reguły w `validateMove`.
**Authentication:** brak kont. Token sesji w `localStorage` (`apps/web/src/net.ts`) i `sessionId` Colyseus; nick z `onJoin`.
**Rate limiting:** 10 wiadomości na sekundę na klienta (`withinRateLimit`) i limit pokoi na IP (`ROOMS_PER_IP` 3, `SOLO_ROOMS_PER_IP` 20) w `LobbyRoom.ts`.

---

*Architecture analysis: 2026-10-21*

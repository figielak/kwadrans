---
last_mapped_commit: fb3f09523fa42777ba250c386be734bbd58ac46a
last_mapped_at: 2026-10-21
---
<!-- refreshed: 2026-10-21 -->

# Codebase Concerns

**Analysis Date:** 2026-10-21

## Tech Debt

**Room state lives only in memory:**
- Issue: Pokoje (stan gry, gracze, tury) są w pamięci procesu. Zapis do SQLite jest w planie („dalej”, KONCEPT.md sekcja 8), ale nie istnieje. Każdy restart kontenera albo `node --watch` w dev kasuje trwające partie.
- Files: `apps/server/src/LobbyRoom.ts`, `apps/server/src/index.ts`, `apps/server/src/stats.ts` (tylko wyniki i rekordy są trwałe)
- Impact: Deploy albo restart Raspberry Pi kończy wszystkie partie; `roomsByIp` też się zeruje, więc limit pokoi na IP resetuje się razem z procesem.
- Fix approach: Serializować `this.state` (obiekt JSON z założenia, patrz KONCEPT.md) do tabeli `rooms` i przywracać w `onCreate`. Limit IP przeliczać z przywróconych pokoi.

**Brak testów warstwy UI i serwera:**
- Issue: Zero plików testowych w `apps/web/src` (`find apps/web -name "*.test.*"` nie zwraca nic). `apps/server` ma tylko `apps/server/src/stats.test.ts`; `LobbyRoom.ts` (489 linii: onAuth, onLeave, rate limit, timery tur, rematch, turniej) nie ma testów.
- Files: `apps/server/src/LobbyRoom.ts`, `apps/web/src/screens/Game.tsx`, `apps/web/src/screens/Lobby.tsx`, `apps/web/src/net.ts`
- Impact: Błędy w przepływie pokoju (reconnect, walkower, rewanż, timeout) wychodzą dopiero w grze. Testy zasad w `packages/games/src/*.test.ts` są mocne, ale to tylko czyste funkcje.
- Fix approach: Test `LobbyRoom` z `colyseus` test harness (dwóch klientów, timer przez fake clock) przy najbardziej ryzykownych ścieżkach: `onLeave` w fazie `playing`, `maybeRematch`.

**Duże pliki komponentów:**
- Issue: `apps/web/src/games/KampusTour.tsx` ma 1106 linii, `apps/web/src/games/Statki.tsx` 540, `apps/web/src/games/MiniGame.tsx` 396 (switch po `id` gry dla wszystkich mini-gier). `packages/games/src/kampus-tour.ts` ma 718 linii.
- Files: `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/Statki.tsx`, `apps/web/src/games/MiniGame.tsx`, `packages/games/src/kampus-tour.ts`
- Impact: Trudno zmieniać bez regresji; każda nowa mini-gra dotyka tego samego `MiniGame.tsx`.
- Fix approach: Wydzielić podkomponenty (panel majątku, pasek akcji, plansza) z KampusTour; w MiniGame przejść na mapę `id → komponent` (lazy import).

**Duplikacja wzorców mini-gier:**
- Issue: Wiele mini-gier ma niemal identyczny szkielet (intro, limit tury, `result` po limicie, `timeoutMove`, `rankResults`). Wzorce są w `core.ts` i `quiz.ts`, ale każda gra i tak dopisuje własne warianty.
- Files: `packages/games/src/*.ts` (np. `refleks.ts`, `stoper.ts`, `kolo.ts`, `kat.ts`, `kropki.ts`), `packages/games/src/core.ts`
- Impact: Poprawka w jednej grze (np. zachowanie przy timeout) nie trafia do pozostałych.
- Fix approach: Wspólny helper dla „mini-gra na wynik” (`record`, `places`, `timeoutMove` z tabelą kar) w `core.ts`, zanim powstanie kolejna gra.

**Stare plany w repozytorium:**
- Issue: Katalog `plany/` (`plany/sudoku.md`, `plany/trzy-kubki.md`, `plany/za-zaslona.md`, `plany/zakupy.md`) zawiera notatki projektowe, których nie ma w `ZASADY-GIER.md` jako źródła prawdy dla tych gier mogą się rozjechać.
- Files: `plany/`
- Impact: Dwa źródła zasad; ryzyko, że implementacja pójdzie za przestarzałym planem.
- Fix approach: Sprawdzić zgodność z `ZASADY-GIER.md`, potem usunąć albo przenieść do historii.

## Known Bugs

**Brak znanych błędów w kodzie, ale kilka pułapek:**
- Symptoms: Kanał `ws` zamykał połączenie z kodem 1009 przy większych wiadomościach (rysunek w Narysuj koło). Naprawione przez `maxPayload: 32 * 1024` w `apps/server/src/index.ts`, ale limit jest ręczny i nie jest pilnowany testem.
- Files: `apps/server/src/index.ts`, `apps/web/src/games/Kolo.tsx`
- Trigger: Rysunek przekraczający 32 KB (ok. 1000 punktów przy obecnym kodowaniu).
- Workaround: Limit 1000 punktów w `packages/games/src/kolo.ts`; przy zmianie kodowania punktów zweryfikować rozmiar.

**Daty wyzwania dnia zależą od strefy serwera:**
- Symptoms: `/api/daily` liczy północ przez `new Date().setHours(0,0,0,0)` i `Math.round(midnight / 86_400_000)`.
- Files: `apps/server/src/index.ts`
- Trigger: Uruchomienie kontenera bez `TZ=Europe/Warsaw` (ustawione w `docker-compose.yml`). Przy innej strefie wyzwanie zmienia się o złej godzinie, a `dailyGame` może wypaść na inną grę niż u graczy w Polsce.
- Workaround: `TZ` w compose. Brak testu dla tej funkcji.

## Security Considerations

**Zaufanie do nagłówka `cf-connecting-ip`:**
- Risk: Limit pokoi na IP (`ROOMS_PER_IP = 3`, `SOLO_ROOMS_PER_IP = 20`) bierze IP z nagłówka `cf-connecting-ip`, który klient może sam podać, jeśli połączy się bez Cloudflare.
- Files: `apps/server/src/LobbyRoom.ts` (onAuth, linia ok. 203)
- Current mitigation: `docker-compose.yml` nie publikuje portu 2567; ruch wchodzi tylko przez `cloudflared`, który nagłówek ustawia.
- Recommendations: Przy każdej zmianie sieci (np. publikacja portu na LAN) limit można obejść. Dodać w dokumencie deployu ostrzeżenie albo akceptować nagłówek tylko przy znanym źródle.

**Publiczne endpointy bez limitu:**
- Risk: `/api/stats`, `/api/records`, `/api/records/:gameId/top`, `/api/daily`, `/api/rooms` nie mają rate limitu i zwracają `Access-Control-Allow-Origin: *`. `/api/rooms` przyjmuje do 3 kodów na zapytanie, ale nic nie ogranicza liczby zapytań.
- Files: `apps/server/src/index.ts`
- Current mitigation: Rate limit tylko dla wiadomości WebSocket (`MESSAGES_PER_SECOND` w `apps/server/src/LobbyRoom.ts`). Limit 256 MB RAM.
- Recommendations: Prosty licznik na IP dla endpointów HTTP albo cache odpowiedzi `/api/records` na kilka sekund.

**Brak limitu liczby pokoi bez gracza:**
- Risk: Pokój powstaje przy pierwszym wejściu (`onAuth`), a `onDispose` zwalnia licznik dopiero po zakończeniu pokoju. Gość, który tylko otwiera i nie gra, trzyma miejsce przez godzinę (`IDLE_MS`).
- Files: `apps/server/src/LobbyRoom.ts` (`IDLE_MS`, `onDispose`)
- Current mitigation: Limit 3 pokoi na IP.
- Recommendations: Skrócić `IDLE_MS` dla pokoi bez partii albo zwalniać miejsce po pustym lobby.

**Zapisane dane gracza w localStorage:**
- Risk: Token sesji i nick w `localStorage` (`apps/web/src/net.ts`). Brak kont, więc skutki są ograniczone, ale token pozwala przejąć miejsce w pokoju po kradzieży urządzenia.
- Files: `apps/web/src/net.ts`
- Current mitigation: Brak danych osobowych (KONCEPT.md sekcja 7).
- Recommendations: Akceptowalne przy założeniach projektu; nie zapisywać nic więcej.

## Performance Bottlenecks

**Rekordowa partia i ranking w SQLite przy każdym zapytaniu:**
- Problem: `best` w `apps/server/src/stats.ts` używa funkcji okien i `nick_key(nick)` na całej tabeli `scores` gry, a `/api/records` liczy wszystkie mini-gry na każde wejście na ekran.
- Files: `apps/server/src/stats.ts`, `apps/server/src/index.ts`
- Cause: Brak indeksu na `scores(game_id, at)` ani na wyrażenie `nick_key(nick)`; tabela rośnie z każdą partią.
- Improvement path: Dodać indeks `(game_id, at)`, cache wyniku `/api/records` w pamięci z unieważnieniem przy zapisie.

**Pamięć procesu przy 256 MB:**
- Problem: `mem_limit: 256m` w `docker-compose.yml`, a pokoje (stan każdego ruchu i rekordowe partie w pamięci) rosną z liczbą graczy i rund.
- Files: `docker-compose.yml`, `apps/server/src/LobbyRoom.ts`
- Cause: Brak limitu liczby pokoi globalnie (jest tylko na IP).
- Improvement path: Globalny limit liczby pokoi i monitoring RSS (`/health` może zwracać `process.memoryUsage()`).

## Fragile Areas

**Zasady gier i UI przez ten sam kontrakt `GameDefinition`:**
- Files: `packages/games/src/core.ts`, `packages/games/src/index.ts`, `apps/server/src/LobbyRoom.ts`
- Why fragile: Dodanie pola do kontraktu (`turn`, `places`, `record`, `modes`) wymaga zmian w wielu grach i w `LobbyRoom`. Brak typów sprawdzających, że każda gra z `record` ma `place`/`timeoutMove`.
- Safe modification: Każda nowa gra przechodzi testy z `packages/games/src/index.test.ts` (rejestr); dodać sprawdzenie spójności `record` i `turnSeconds`/`turn`.
- Test coverage: Testy zasad są, testy integracji z pokojem nie.

**Limit czasu tury i zmiana `waitingFor`:**
- Files: `apps/server/src/LobbyRoom.ts` (`turnTimer`, linie ok. 349, 373, 414, 437)
- Why fragile: Cztery miejsca ustawiają `turnTimer`; zmiana warunku (np. `key` z `turn`) może zostawić stary timer albo zresetować go za wcześnie. Reguły w KONCEPT.md sekcja 3 są subtelne (licznik odnawia się tylko przy zmianie `waitingFor`).
- Safe modification: Każdą zmianę przepuścić przez ręczny test z dwoma klientami w `/dev?n=2`.
- Test coverage: Brak testów.

**Ruchy `timeoutMove` z losowością:**
- Files: `packages/games/src/*.ts` (`timeoutMove(state, player, rng)`)
- Why fragile: Ruch za gracza musi być legalny i zależny tylko od `rng` przekazanego do funkcji; użycie `Math.random` albo `Date.now` zepsułoby powtarzalność. Obecnie w kodzie gier nie ma tych wywołań (sprawdzono `grep` w `packages/games/src`), ale nic tego nie pilnuje.
- Safe modification: Dodać regułę ESLint albo test grep w `index.test.ts`, który zabrania `Math.random`/`Date.now` w `packages/games/src` poza testami.

**Zależność od `node:sqlite`:**
- Files: `apps/server/src/stats.ts`
- Why fragile: `node:sqlite` w Node 24 to API wciąż oznaczone jako eksperymentalne; zmiana wersji Node w `Dockerfile` (node:24-slim) może zmienić zachowanie lub wypisywać ostrzeżenia.
- Safe modification: Przypiąć wersję Node w `Dockerfile` i CI (`node-version: 24` w `.github/workflows/ci.yml`) na konkretną minor.

**Zakaz bezpośredniej zależności `zod` w `apps/server`:**
- Files: `apps/server/package.json`
- Why fragile: Reguła z AGENTS.md. Obecnie spełniona (zod tylko w `packages/games`), ale nic tego nie egzekwuje.
- Safe modification: Test albo skrypt w CI sprawdzający `apps/server/package.json`.

## Scaling Limits

**Pokoje w pamięci jednego procesu:**
- Current capacity: Jeden kontener, 256 MB, do 6 graczy w pokoju, 3 pokoje na IP (20 solo).
- Limit: Brak globalnego limitu; przy wielu IP i pokojach proces może wyczerpać pamięć i wszystkie pokoje padną razem.
- Scaling path: Trwały stan w SQLite (patrz Tech Debt) i globalny limit pokoi; przy Cloud Run (KONCEPT.md sekcja 6) `max-instances=1` i Firestore.

**Jeden węzeł, brak wielu instancji:**
- Current capacity: Jeden proces Colyseus z pamięcią lokalną.
- Limit: Drugi proces nie zobaczy pokoi pierwszego; `matchMaker` nie ma sterownika dystrybuowanego.
- Scaling path: Nie skalować poziomo przed przeniesieniem stanu; `max-instances=1` w planie Cloud Run.

## Dependencies at Risk

**Nowe wersje major dla narzędzi:**
- Risk: `typescript` `^7.0.2`, `vitest` `^5.0.3`, `pnpm` `12.9.1`, `@types/node` `^26.6.4` w `package.json`. Wersje są bardzo nowe i zmieniają się szybko.
- Files: `package.json`, `apps/server/package.json`, `Dockerfile`
- Impact: Aktualizacja może zepsuć build i CI bez zmian w kodzie.
- Migration plan: Aktualizować przez osobny commit z pełnym `pnpm typecheck && pnpm test` i buildem obrazu.

**Animacje bez biblioteki:**
- Risk: KONCEPT.md sekcja 4 mówi o Motion jako planowanej bibliotece, ale nie jest zainstalowana; animacje są w `apps/web/src/index.css`. Dokument stack-u i kod się rozjeżdżają.
- Files: `KONCEPT.md`, `apps/web/src/index.css`
- Impact: Złożone animacje (sekwencje, gesty) są trudniejsze do zrobienia w CSS.
- Migration plan: Albo zaktualizować KONCEPT.md, albo dodać Motion po zgodzie użytkownika (AGENTS.md: bez nowych zależności bez zgody).

## Missing Critical Features

**Poprawka (gra karciana typu Uno):**
- Problem: Gra z KONCEPT.md sekcja 2.2 i etap 6 w planie prac nie istnieje w `packages/games/src`.
- Blocks: Ukrywanie kart per gracz w praktyce (`playerView`) zostaje przetestowane tylko na Statkach i Memory.

**Zapis stanu pokoi:**
- Problem: Patrz Tech Debt; to pozycja „dalej” w planie.
- Blocks: Bezpieczne wdrożenia bez przerywania partii.

**Balans Kampus Tour:**
- Problem: KONCEPT.md sekcja 9 zostawia otwarte pytanie o monopol przez grupy dwupolowe i ekonomię (czynsze, kieszonkowe). Decyzja zapisana jako „do sprawdzenia w kolejnych partiach”.
- Blocks: Ostateczne zasady Kampus Tour w `ZASADY-GIER.md` i testy w `packages/games/src/kampus-tour.test.ts`.

## Test Coverage Gaps

**Pokój i protokół wiadomości:**
- What's not tested: `apps/server/src/LobbyRoom.ts` (walkower, reconnect, rate limit, rewanż, limit IP) i walidacja `ROOM_MESSAGES` w `packages/games/src/lobby.ts`.
- Files: `apps/server/src/LobbyRoom.ts`, `packages/games/src/lobby.ts`
- Risk: Regresja w `onLeave` (np. źle wyliczony walkower) zostanie zauważona dopiero przez gracza.
- Priority: High

**Komponenty React:**
- What's not tested: Cały `apps/web/src` (0 testów). Krytyczne: `apps/web/src/screens/Game.tsx`, `apps/web/src/net.ts` (reconnect, token).
- Files: `apps/web/src/screens/Game.tsx`, `apps/web/src/net.ts`
- Risk: Zerwanie reconnectu albo złe przekierowanie po odświeżeniu psuje grę bez sygnału w CI.
- Priority: High

**Funkcje daty i rankingu:**
- What's not tested: `/api/daily` (północ, `dailyGame`) w `apps/server/src/index.ts`.
- Files: `apps/server/src/index.ts`
- Risk: Zła gra dnia albo ranking dnia po północy.
- Priority: Medium

**Dev-only ścieżki:**
- What's not tested: Że `apps/web/src/Dev.tsx` nie trafia do buildu produkcyjnego (`import.meta.env.DEV` w `apps/web/src/main.tsx`). Obecnie działa przez tree-shaking Vite, ale nie jest sprawdzane.
- Files: `apps/web/src/main.tsx`, `apps/web/src/Dev.tsx`
- Risk: Niska; wyciek trybu testowego do produkcji.
- Priority: Low

---

*Concerns audit: 2026-10-21*

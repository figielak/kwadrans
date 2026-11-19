# 19-atrakcyjnosc-etapy-4-5

## Goal
ATR-04 wybór gry i wygląd (jaśniejsze powierzchnie, `.label` bez mono, kafle mini-gier z podglądem, „Dla was teraz”,
karta gry przed startem) oraz ATR-05 powroty (pojedynki, rekord stołu, seria dni wyzwania, wspólny układ wyzwania
z rankingiem z pierwszej próby). Źródło: archiwalny plan `git show 705c4ed^:.planning/ATRAKCYJNOSC-PLAN.md` §3, §7, §8, §11.

## Done when
Wszystkie zadania odhaczone; `pnpm typecheck && pnpm test` i `pnpm --filter web build` bez błędów; zrzuty 360×640
(lista mini-gier w pokoju z 1, 2 i 6 graczami oraz obserwatorem, ekran główny z wyzwaniem dnia, lobby z pojedynkami)
bez przewijania w poziomie i z polami ≥ 48 px; wpis w `CHANGELOG`.

## Decisions
- D-01: Każda funkcja idzie od dokumentu i testów (czerwonych) w osobnym commicie, potem kod (AGENTS „Sposób pracy”).
  Zasady platformy opisuje `KONCEPT.md` §1 i §3; zasady gier się nie zmieniają, więc `ZASADY-GIER.md` i `stateVersion` bez zmian.
- D-02: Wspólny układ wyzwania: partia solo ze źródłem `daily` dostaje do `setup` `createRng(dailySeed(day, gameId))`,
  ale tylko gdy to pierwsza **rozpoczęta** (po instrukcji, `started = 1`) próba tego `nickKey` w tej grze tego dnia.
  Kolejne próby to trening z nowym losowym układem (wybór użytkownika: rekordy wszech czasów zostają uczciwe).
  `applyMove` dostaje dalej zwykłe `newRng()`; ziarno dotyczy tylko `setup`.
- D-03: Ranking dnia (`/api/daily`) liczy wyłącznie próby oznaczone jako dzienne (wybór użytkownika), nie partie tej gry
  w pokoju ani turnieju. Próba porzucona po starcie zużywa dzień bez wyniku (inaczej można podejrzeć układ i wrócić).
- D-04: Schemat historii: `ALTER TABLE matches ADD COLUMN daily INTEGER NOT NULL DEFAULT 0` i
  `ALTER TABLE match_players ADD COLUMN tie REAL` (drugie kryterium rankingu dnia), migracja w `openHistory` jak w `stats.ts`
  (sprawdzenie `PRAGMA table_info`). Stare wiersze: `daily = 0`, `tie = NULL`.
- D-05: Seria dni bez kary: liczy dni z rozpoczętą partią `source = 'daily'` (dane od fazy 17). Idąc wstecz od dziś
  (albo od wczoraj, gdy dziś jeszcze nie grał), jeden brakujący dzień jest wybaczony, jeśli w poprzednich 7 dniach marszu
  nie było innego braku; drugi brak w 7 dniach kończy serię. Wartość = liczba zagranych dni w serii. Po przerwie widać
  tylko łączną liczbę dni („Łącznie 23 dni z wyzwaniem”), bez komunikatów o stracie (plan §11).
- D-06: Rekord stołu = najlepszy wynik wszech czasów spośród osób obecnych teraz w pokoju (po `nickKey`), z tych samych
  wierszy co `/api/records`, liczony u klienta przez czystą funkcję w `core.ts` (wybór użytkownika). Bez nowej tabeli.
- D-07: Pojedynek = bilans dwóch `nickKey` w ukończonych partiach 2+ osób (kto był wyżej), z tych samych reguł co
  `rivals` w profilu (`VERSUS` w `apps/server/src/history.ts`); opcjonalnie zawężony do jednej gry.
- D-08: Tożsamości gry nie budujemy kolorem kategorii (kolor = gracz, plan §3). Kafle niosą nieruchomą pierwszą klatkę
  `Preview`; animuje się tylko podgląd wybranego kafla. Gra, której klatka jest nieczytelna przy ~100 px, zostaje przy ikonie.
- D-09: Wartości tokenów dobieramy na ekranie dev i sprawdzamy kontrast ≥ 4,5:1 dla tekstu; użytkownik może je potem
  skorygować na telefonie (bez zadania „próba z ludźmi”).

## Tasks
- [x] **19-01 Dokumenty platformy**
  `KONCEPT.md` §1 (wyzwanie dnia: wspólny układ, pierwsza próba, trening, ranking tylko z wyzwania, seria dni; ekran główny
  pokazuje serię), §1 „Profil gracza” (seria i łączna liczba dni), §3 „Historia partii” (kolumny `daily`, `tie`),
  §3 reguły platformy (pojedynki w lobby i po partii, rekord stołu, „Dla was teraz”, kafle z podglądem).
  `DESIGN.md` §1-2 i `ZASADY.md` §4: nowe tokeny (`surface-raised`), `.label` w Satoshi bez wersalików, mono tylko dla
  kodów, czasów i wyników. Bez kodu. Accept: dokumenty nie przeczą sobie (`grep -n "label\|mono" DESIGN.md ZASADY.md`).

- [x] **19-02 Jaśniejsze powierzchnie i etykiety**
  `apps/web/src/index.css:13-41` (`@theme`): jaśniejsze `--color-surface`, nowy `--color-surface-raised` (kafle gier, plansze),
  wyraźniejszy `--color-line`; `.tile` (`:72-78`) z mniej przezroczystym tłem. `.label` (`:80-86`): `font-family` Satoshi,
  bez `text-transform` i `letter-spacing`, rozmiar ~13 px. Przejrzyj użycia `.label` (`grep -rn '"label' apps/web/src`)
  i popraw teksty pisane pod wersaliki. Kafle w `MiniGames.tsx:62-64` i `Tile`/`GameTile` w `Lobby.tsx:471-555` na
  `bg-surface-raised`. Najpierw zaktualizuj testy spójności z obszaru web-style, jeśli sprawdzają mono w `.label`.
  Accept: `pnpm typecheck && pnpm test`; kontrast `fg-muted` na `surface-raised` ≥ 4,5:1 (policzony i wpisany w Notes).

- [x] **19-03 Rejestr podglądów i pilot na 5 kaflach**
  Wyeksportuj `Preview` z 25 plików `apps/web/src/games/*.tsx` (lista: `grep -n "function Preview"`) oraz podgląd gier
  z `Quiz.tsx`/`Szacowanie.tsx`; zbierz w jednym rejestrze `PREVIEWS: Record<gameId, Component>` (np. `games/previews.ts`),
  test, że każda gra z `MINI_GAME_IDS` ma wpis. Dodaj w `index.css` klasę `.still`, która zatrzymuje animacje potomków
  na klatce bazowej (ta sama, którą daje reguła `prefers-reduced-motion`). Pilot: Refleks, Kolo, Schulte, Balon, Mapa
  na kaflach `MiniGameGrid` (`MiniGames.tsx:50-84`), podgląd w skali ~100 px, wybrany kafel bez `.still`.
  Accept: zrzut 360×640 listy z pilotem (Playwright, `/dev?n=2`); decyzja „klatka czy znak” dla 5 gier wpisana w Notes.

- [x] **19-04 Kafle z podglądem dla wszystkich mini-gier**
  Rozszerz pilot na wszystkie 30 gier; nieczytelne klatki zostają przy ikonie z `ICONS`. Siatka 3-kolumnowa i podpis
  miejsca zostają; kafel ≥ 48 px wysokości, nazwa nie ucieka poza kafel na 360 px. Ten sam kafel na ekranie głównym
  (lista „Sam”) i w pokoju. Accept: zrzuty listy w pokoju i na ekranie głównym 360×640; `pnpm --filter web build`.

- [x] **19-05 Wspólny układ wyzwania (serwer)**
  Testy najpierw: `packages/games/src/core.test.ts` dla `dailySeed(day, gameId)` (deterministyczny, różny dla różnych gier
  i dni) i `apps/server/src/LobbyRoom.history.test.ts`: dwie pierwsze próby różnych nicków z `from: "daily"` mają ten sam
  stan po `setup`, druga próba tego samego nicku ma inny, próba porzucona po starcie zużywa dzień, rematch solo to trening.
  Kod: `dailySeed` w `core.ts` obok `dailyGame` (`:271`); w `LobbyRoom.startMatch` (`:876-881`) dla `source === "daily"`
  i gry dnia sprawdź w historii rozpoczętą próbę tego `nickKey` dziś (nowa funkcja w `history.ts`) oraz pamięć pokoju;
  ustaw `match.daily` i ziarno `setup`. `daily` zapisz w snapshot pokoju (`:483-527`) i w `MatchEntry`. Migracja z D-04.
  Accept: `pnpm --filter server exec vitest run` i `pnpm typecheck`.

- [x] **19-06 Ranking dnia z pierwszej próby**
  Testy najpierw (`apps/server/src/history.test.ts`): ranking dnia bierze tylko `daily = 1` od północy, wynik i `tie`
  z `match_players`, porządek przez `compareRecords`, próba bez wyniku nie trafia do rankingu, trening się nie liczy.
  Kod: zapis `tie` w `match_players` przy końcu partii (`LobbyRoom.ts:1048` i `history.ts:43-49`), nowa funkcja rankingu
  w `history.ts`, `/api/daily` w `apps/server/src/index.ts:39-43` na nią, ten sam kształt `RecordRow[]`.
  W `Home.tsx:165-190` podpis kafla: „Twoja próba: …” po pierwszej próbie, kolejne to „Trening”.
  Accept: testy serwera; kafel wyzwania pokazuje wynik pierwszej próby po rozegraniu dwóch prób w `/dev`.

- [x] **19-07 Seria dni wyzwania**
  Testy najpierw: czysta `dailyStreak(days: number[], today: number) → { streak, total }` w `core.ts` według D-05
  (seria ciągła, jeden brak wybaczony, dwa braki w 7 dniach kończą, dziś jeszcze nie grane nie przerywa).
  Kod: dni gracza z historii (`source = 'daily' AND started = 1`, dzień po polskiej północy jak `dailyGame`),
  `/api/daily?nick=` dokłada `{ streak, total }`, a profil (`Profile.tsx`) pokazuje to samo. Kafel wyzwania na `Home.tsx`
  dostaje „Seria 5 dni” (od 2 dni), po przerwie „Łącznie 23 dni”. Bez ognia, odliczań i słów o stracie.
  Accept: `pnpm test`; kafel mieści się w jednej linii na 360 px.

- [x] **19-08 Pojedynki (serwer)**
  Testy najpierw (`history.test.ts`): bilans pary z partii 2+ osób, remis miejsc nie daje punktu, solo, import i partie
  przerwane pominięte, zawężenie do gry, kolejność nicków nie zmienia wyniku. Kod: `duels(keys: string[], gameId?)`
  w `history.ts` na regułach `VERSUS` (`:296`), endpoint `GET /api/duels?nicks=a,b&game=id` w `index.ts` (do 6 nicków,
  walidacja jak `/api/profile`), klient `fetchDuels` w `apps/web/src/net.ts`. Accept: testy serwera i `pnpm typecheck`.

- [x] **19-09 Pojedynki w lobby i po partii**
  Lobby (`Lobby.tsx`, okolice `Players` `:281`): pod rzędem awatarów jedna zwięzła linia „Ty : Ola 7:4 · Ty : Bartek 2:2”
  dla obecnych z historią (bez linii, gdy brak); obserwator jej nie widzi. Po partii (ekran wyników w `Game.tsx`/
  `MiniGame.tsx`, przy `EveningTable`) bilans w tej grze z rywalami, mniejszy od bohatera. Dotknięcie nicku otwiera
  profil jak w `Evening.tsx`. Accept: zrzut 360×640 lobby z 6 graczami i ekranu wyników z 2 graczami bez przewijania w poziomie.

- [x] **19-10 Rekord stołu**
  Testy najpierw: `tableRecord(rows, nickKeys, record)` w `core.ts` (najlepszy z obecnych przez `compareRecords`,
  `null` gdy nikt nie grał albo gdy to ten sam wiersz co rekord wszech czasów i siedzi jeden gracz).
  Kod: `RecordPanel` (`Records.tsx`) pokazuje „Rekord stołu: Ola 245 ms” obok miejsca wszech czasów, gdy różny od lidera;
  linia „Rekord: …” na `Intro` (`apps/web/src/games/ui.tsx`) i panel „Wybrana gra” w `MiniGames.tsx:150-170` też.
  Solo bez rekordu stołu. Accept: `pnpm test`; zrzut panelu po partii z 2 graczami.

- [ ] **19-11 „Dla was teraz”**
  Testy najpierw (`apps/web/src/screens/lists.test.ts` albo nowy plik): czysta `forYouNow(view, records, nick)` zwraca
  do 3 gier z powodem, w kolejności: „Nowa dla Bartka” (obecny bez wyniku), „Ola prowadzi o 12 ms” (mała różnica między
  dwoma obecnymi), „Jeszcze nie dziś” (spoza `view.evening.played`); bez powtórek, deterministycznie, pomija bieżącą grę.
  Kod: nad `MiniGameGrid` w `MiniGames.tsx` trzy większe karty z podglądem (bez `.still` tylko na wybranej) i powodem;
  tylko w pokoju z 2+ osobami; dotknięcie działa jak kafel (gospodarz wybiera, gość zgłasza życzenie).
  Accept: zrzut 360×640 z 2 i 6 graczami: karty i pierwszy rząd listy widoczne bez przewijania na 640 px.

- [ ] **19-12 Karta wybranej gry**
  Panel „Wybrana gra” w `MiniGames.tsx:150-170`: duży animowany podgląd z rejestru, nazwa, opis z `BLURBS`, rekord stołu
  i pojedynek w tej grze zamiast tekstu technicznego; `Setup.tsx` dla gier głównych dostaje linię pojedynku w tej grze.
  Bez zmian w `StartBar`. Accept: zrzut 360×640 u gospodarza i gościa; „Start” dalej mieści się w `StickyBar`.

- [ ] **19-13 Odbiór techniczny i Co nowego**
  Wpis na początku `CHANGELOG` w `apps/web/src/screens/Changelog.tsx` (nowość: druga liczba, data) językiem gracza.
  `pnpm typecheck && pnpm test`, `pnpm --filter web build`. Playwright na `/dev?n=1`, `?n=2`, `?n=6` i obserwator: lista
  mini-gier, „Dla was teraz”, lobby, wyniki, ekran główny; `prefers-reduced-motion` (podglądy stoją). Dwie próby wyzwania
  dnia z różnych nicków mają ten sam układ. Serwerów dev nie ubijać. Accept: wszystkie komendy PASS, zrzuty w scratchpadzie.

## Notes
- Assumed: „Dla was teraz” i kafle z podglądem dotyczą listy mini-gier; gry główne zostają przy ikonach (`GameTile`).
- Assumed: seria dni liczy dane od fazy 17 (`source = 'daily'` w `matches`), bez liczenia wstecz z `scores`.
- Poza fazą (wybór użytkownika): postęp (wykres 10 wyników) i wyzwanie znajomego z linkiem z ziarnem; plan §8.
- Ryzyko: 30 podglądów SVG na jednej liście może obciążyć słaby telefon; `.still` musi naprawdę wyłączać animacje,
  a w razie spadków płynności zostawiamy podgląd tylko na „Dla was teraz” i karcie wybranej gry.
- Ryzyko: dwie zakładki tego samego nicku startujące wyzwanie naraz mogą obie dostać układ dnia; akceptowalne.
- Ryzyko: restart serwera w trakcie dziennej próby daje nowe `rng`, ale stan po `setup` jest już zapisany, więc układ zostaje.
- 19-02: `surface` #1c1c1f (fg-muted 5,02:1, fg 14,5:1), `surface-raised` #232327 (fg-muted 4,63:1, fg 13,4:1), `line` biel 12%, `surface-glass` 70%.
- 19-03/04: pilot objął od razu 30 gier. `.still` to `animation-play-state: paused` (każdy krok przy swoim opóźnieniu = pierwsza klatka z instrukcji), nie `animation: none`: przy wyłączonej animacji Koło, Wieża, Balon i Stoper były puste. Pusta chwila 0 tylko w Kole i słaby Refleks: `STILL_AT` w `games/previews.tsx` (`.still-at`). Bez koloru gracza (ekran główny) podgląd dostaje `fg`. Wszystkie 30 klatek czytelne przy ~100 px, żadna gra nie została przy ikonie; Dziesiątki lekko przycięte po bokach. Zrzut listy w pokoju przeniesiony do 19-13.
- 19-09: w pokoju pojedynki bez przejścia do profilu (pokój nie ma ekranu profilu); zrzuty lobby 6 graczy i wyników przeniesione do 19-13. Serwer dev nie przeładował się sam po zmianie `index.ts` (`--watch` przegapił zapis): przed zrzutami restart serwera.
- Carry-over 06 (odbiory U03, U04, U09, U14, P11) zostaje przy fazie 06.

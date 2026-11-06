# kwadrans
<!-- Constitution, ≤ 60 lines. Project-specific facts only; Telos workflow rules
     live in CLAUDE.md. Headings are stable (tasks link to "PROJECT.md §Heading"). -->

## Purpose
Prywatna platforma gier multiplayer w przeglądarce: kod pokoju, każdy gra na swoim telefonie.
games.figielak.dev, do 6 osób w pokoju, bez kont (nick + token sesji). 8 gier głównych, 30 mini-gier, turniej,
gra solo, wyzwanie dnia i rekordy. Wartość: każda gra działa i wygląda tak samo przewidywalnie, kod zgadza się
z dokumentacją, a wyniki i rekordy są uczciwe i porównywalne między partiami.

## Rules
- Serwer jest jedynym źródłem prawdy: klient wysyła intencje, a `validateMove` jest jedynym strażnikiem.
- Losowość w zasadach gier tylko z przekazanego `rng`; bez `Math.random` i `Date.now`.
- Stan gry to zwykły obiekt JSON; `applyMove` zwraca nowy i nie zmienia poprzedniego.
- Ukryte informacje filtruje `playerView`; obserwator dostaje widok dla `""`.
- `apps/server` nie może mieć bezpośredniej zależności `zod`; schematy są w `packages/games`.
- `id` gry nigdy się nie zmienia (klucz rankingu w SQLite), nawet gdy zmienia się nazwa w UI.
- Bez nowych zależności bez zgody użytkownika; animacje w CSS, wspólne funkcje z `core.ts`.
- UI: tylko ciemny motyw, kolory z tokenów, polskie teksty bez em-dashy, kolor gracza zamiast czerwieni, pola dotykowe min. 48 px, ekran partii mieści się na 360×640.
- Zmiana zasad gry: najpierw test i `ZASADY-GIER.md` (`KONCEPT.md` tylko przy zmianie katalogu gier lub reguł platformy), potem kod; testów nie zmienia się pod implementację.
- Push na `master` publikuje obraz produkcyjny; praca na gałęzi, push tylko na prośbę.

## Conventions
- Plan, akceptacja użytkownika, dopiero implementacja. Po akceptacji zakresu nie pytać o każdą małą paczkę.
- Nowa gra: ustalenia → testy zasad (osobny commit, czerwone) → kod zasad → ekran → podpięcie (`ZASADY.md`).
- Commity po polsku „<Gra>: co się zmieniło”. Stała zgoda użytkownika (2026-10-29): commit testów i commit
  implementacji po każdym zadaniu bez pytania; push zawsze wymaga osobnej prośby.
- Gra to płaski `packages/games/src/<id>.ts` + `<id>.test.ts`, wpis w `GAMES`, ekran `apps/web/src/games/<Gra>.tsx`.
- Mini-gra to gra z `minPlayers: 1`; `MINI_GAME_IDS` jest jedyną ich listą. Wspólny moduł dla tej samej mechaniki (`quiz.ts`).
- Stałe zasad UPPER_SNAKE_CASE na górze pliku, komentarze i nazwy testów po polsku (opisują zasadę, nie funkcję).
- TS: `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly` (bez enum), importy z `.ts`; bez `as any`, bez lintera.
- Przed zgłoszeniem zmiany: `pnpm typecheck && pnpm test` (to samo CI), dla UI także `pnpm --filter web build`.
- Po pracy zostawić działające serwery dev (:2567, :5173) i podać `http://localhost:5173/dev?n=2`; użytkownik testuje sam.
- Komunikacja i dokumentacja po polsku. Codexa nie proponować, dopóki użytkownik sam nie wróci do delegacji.

## Context
Źródła prawdy (przy sprzeczności wygrywają): `KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`, `DESIGN.md`
(przy sprzeczności z DESIGN wygrywa ZASADY), `AGENTS.md`. Skróty w `.telos/` (czytaj tylko potrzebny):
- `GAMES.md`: katalog wszystkich gier z `id`, typem, limitem, wynikiem i najważniejszymi stałymi.
- `AUDIT.md`: zakończony audyt spójności (fazy 01-05), decyzje ZG4-v1, wyjątki, otwarte odbiory.
- `PROPOSALS.md`: propozycje po audycie (atrakcyjność, 5 nowych gier) z wymaganiami; pełne plany w `.planning/*-PLAN.md`.

## Out of scope
- Konta użytkowników i dane osobowe: tylko nick i losowy token sesji.
- Publiczna lista pokoi: do gry trzeba znać kod.
- Service worker: PWA to manifest i ikony.
- Dźwięk: tryb cichy, jedyny wyjątek to metronom w Rytmie. Jasny motyw.
- Kopiowanie nazw, grafik i logo oryginału Business Tour.
- Pełny audyt oszustw i czyszczenie bazy rekordów; przeliczanie starych rekordów po zmianie zasad.

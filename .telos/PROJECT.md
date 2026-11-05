# kwadrans
<!-- Constitution, ≤ 60 lines. Project-specific facts only; Telos workflow rules
     live in CLAUDE.md. Headings are stable (tasks link to "PROJECT.md §Heading"). -->

## Purpose
Prywatna platforma gier multiplayer w przeglądarce: kod pokoju, każdy gra na swoim telefonie.

## Rules
- Serwer jest jedynym źródłem prawdy: klient wysyła intencje, a `validateMove` jest jedynym strażnikiem.
- Losowość w zasadach gier tylko z przekazanego `rng`; bez `Math.random` i `Date.now`.
- Stan gry to zwykły obiekt JSON; `applyMove` zwraca nowy i nie zmienia poprzedniego.
- Ukryte informacje filtruje `playerView`; obserwator dostaje widok dla `""`.
- `apps/server` nie może mieć bezpośredniej zależności `zod`; schematy są w `packages/games`.
- `id` gry nigdy się nie zmienia (klucz rankingu), nawet gdy zmienia się nazwa w UI.
- Bez nowych zależności bez zgody użytkownika; animacje w CSS, wspólne funkcje z `core.ts`.
- UI: tylko ciemny motyw, kolory z tokenów, polskie teksty bez em-dashy, kolor gracza zamiast czerwieni, pola dotykowe min. 48 px, ekran mieści się na 360×640.
- Zmiana zasad gry aktualizuje `ZASADY-GIER.md` (i `KONCEPT.md`, jeśli dotyczy opisu gry) w tym samym zadaniu.
- Push na `master` publikuje obraz produkcyjny, więc praca idzie na gałęzi.

## Conventions
- Plan, akceptacja użytkownika, dopiero implementacja.
- TDD: testy zasad gry w osobnym commicie przed implementacją; testów nie zmienia się pod implementację.
- Commity po polsku, w formie „<Gra>: co się zmieniło”, tylko na prośbę użytkownika.
- Gra to płaski plik zasad z testem w `packages/games/src`, wpis w `GAMES` i komponent w `apps/web/src/games`.
- Mini-gra to gra z `minPlayers: 1`; `MINI_GAME_IDS` jest jedyną ich listą.
- Komunikacja i dokumentacja po polsku.

## Out of scope
- Konta użytkowników i dane osobowe: tylko nick i losowy token sesji.
- Publiczna lista pokoi: do gry trzeba znać kod.
- Service worker: PWA to manifest i ikony.
- Dźwięk: tryb cichy, jedyny wyjątek to metronom w Rytmie.
- Kopiowanie nazw, grafik i logo oryginału Business Tour.

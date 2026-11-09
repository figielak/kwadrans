# AGENTS.md

Instrukcje dla agentów AI (Claude Code, GitHub Copilot). Odpowiadaj po polsku.

Kwadrans: prywatna platforma gier multiplayer w przeglądarce (games.figielak.dev): monorepo pnpm, TypeScript,
serwer Colyseus (Node 24), frontend Vite + React, zasady gier jako czyste funkcje w `packages/games`.

## Najpierw przeczytaj

| Plik | Co zawiera | Kiedy czytać |
|---|---|---|
| `KONCEPT.md` | założenia, katalog gier, architektura, kontrakt `GameDefinition`, reguły platformy, mini-gry i rekordy, stack | zawsze, przed pierwszą zmianą |
| `ZASADY-GIER.md` | dokładne zasady każdej gry | przed zmianą gry (jej sekcja) |
| `ZASADY.md` | proces dodawania gry, obowiązkowe testy, spójność zasad, wyglądu, animacji i wibracji | przed nową grą albo zmianą ekranu gry |
| `DESIGN.md` | styl wizualny: tokeny, wzorcowe sekcje, stany (przy sprzeczności wygrywa `ZASADY.md`) | przed zmianą wyglądu |
| `README.md` | dev i deploy | przy pracy z infrastrukturą |

Te pliki są źródłem prawdy. Nie powielaj ich treści tutaj; po zmianie zasad lub architektury popraw właściwy plik.

`.telos/` to pamięć projektu i bieżący stan prac: `STATUS.md` mówi, gdzie jesteśmy, `ROADMAP.md` podaje fazy,
`MAP.md` wskazuje kod, a `GAMES.md`, `AUDIT.md` i `PROPOSALS.md` to skróty kontekstu.
To nie jest źródło prawdy; przy sprzeczności wygrywają pliki z tabeli wyżej. Stan i fazy zmienia się poleceniami `telos`
(`status set`, `roadmap set`, `history add`). `.planning/` zawiera już tylko plany propozycji (`*-PLAN.md`);
zakończony audyt spójności (fazy 01-05) jest w historii gita pod `fb0f5d2`.

## Komendy

```sh
pnpm install
pnpm --filter server dev   # http://localhost:2567, node --watch (restart po zmianie w apps/server i packages/games)
pnpm --filter web dev      # http://localhost:5173, tryb testowy: /dev?n=4
pnpm typecheck && pnpm test
pnpm --filter @kwadrans/games exec vitest run src/<gra>.test.ts   # jeden plik testów
pnpm --filter web build
```

Przed zgłoszeniem zmiany jako gotowej: `pnpm typecheck && pnpm test` bez błędów (to samo sprawdza CI).

## Sposób pracy

- Plan → akceptacja użytkownika → implementacja.
- TDD: testy zasad gry (`packages/games/src/<gra>.test.ts`) w osobnym commicie **przed** implementacją.
  Nie zmieniaj testów pod implementację; jeśli zasada była zła, najpierw popraw test i `ZASADY-GIER.md`.
- Zmiana zasad gry = aktualizacja `ZASADY-GIER.md` w tym samym zadaniu; `KONCEPT.md` tylko przy zmianie katalogu gier albo reguł platformy.
  Zmiana zasad gry głównej poprawia też jej kartę „Jak grać” w `apps/web/src/screens/howToPlay.ts`.
- Przed publikacją na `master` zmian widocznych dla graczy dodaj jeden wpis na początku `CHANGELOG` w `apps/web/src/screens/Changelog.tsx`, opisujący całość językiem gracza: nowy numer (same poprawki: trzecia liczba, nowość: druga) i data. Publikacja bez widocznych zmian nie zmienia numeru.
- Commity po polsku, w formie „<Gra>: co się zmieniło”. Commit i push tylko na prośbę użytkownika.
- Push na `master` buduje i publikuje obraz produkcyjny, więc pracuj na gałęzi.

## Twarde reguły

- **Serwer jest jedynym źródłem prawdy.** Klient wysyła intencje, `validateMove` jest jedynym strażnikiem.
  Jawny wyjątek: kanał `live` to dekoracyjna liczba zgłaszana przez klienta, przekazywana rywalom bez `validateMove`; nie wpływa na stan zasad, wyniki ani rekordy.
- **Losowość tylko z `rng`** przekazanego do `setup` i `applyMove`. Żadnego `Math.random` ani `Date.now` w zasadach.
- **Stan gry to zwykły obiekt JSON**, `applyMove` zwraca nowy i nie zmienia poprzedniego.
- **Ukryte informacje** filtruje `playerView`; obserwator dostaje widok dla `""`.
- **`apps/server` nie może mieć bezpośredniej zależności `zod`** (druga kopia `@colyseus/core` daje
  „seat reservation expired”). Schematy trzymamy w `packages/games`.
- **`id` gry nigdy się nie zmienia** (klucz rankingu w SQLite), nawet gdy zmienia się nazwa w UI.
- **Bez nowych zależności** bez zgody użytkownika; animacje w CSS (`index.css`), wspólne funkcje z `core.ts`.
- **UI**: tylko ciemny motyw, kolory z tokenów, teksty po polsku bez em-dashy, kolor gracza zamiast czerwieni
  dla jego akcji, pola dotykowe min. 48 px, ekran mieści się na 360×640. Szczegóły w `ZASADY.md` (sekcje 4 i 5).

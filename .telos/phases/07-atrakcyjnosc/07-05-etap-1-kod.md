---
id: 07-05
title: "Etap 1: kod wyników i solo (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-04]
decisions: [D-01, D-09, D-12, D-14]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/lobby.ts", "packages/games/src/core.ts", "packages/games/src/memory.ts", "packages/games/src/kalambury.ts", "packages/games/src/panstwa-miasta.ts", "packages/games/src/kampus-tour.ts", "packages/games/src/piec-w-rzedzie.ts", "apps/web/src/screens/results.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/games/Balon.tsx", "apps/web/src/games/KampusSummary.tsx", "apps/web/src/games/KampusTour.tsx", "apps/web/src/games/Mapa.tsx", "apps/web/src/games/Tort.tsx", "apps/web/src/games/Nozyczki.tsx", "apps/web/src/games/Srodek.tsx", "apps/web/src/games/Zaslona.tsx", "apps/web/src/games/Szacowanie.tsx", "apps/web/src/games/Rok.tsx", "apps/web/src/index.css", "ZASADY.md"]
---
## Goal
Działająca, prosta wersja ekranu wyników, solo bez limitu instrukcji i nowy ekran główny. Wygląd dopracuje 07-06.

## Read first
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- packages/games/src/lobby.ts:24-54 (RoomView)
- packages/games/src/core.ts:30-32 (places) i 75-85 (rankPlaces)
- packages/games/src/kampus-tour.ts:689-700 (isOver)
- apps/web/src/screens/Game.tsx:96-115 (gałąź Kampus Tour)
- apps/web/src/screens/Game.tsx:425-504 (po partii)
- apps/web/src/games/KampusSummary.tsx:20-50
- apps/web/src/games/Mapa.tsx:103-120
- apps/web/src/screens/Game.tsx:541-586 (OverActions)
- apps/web/src/screens/ui.tsx:411-495 (Intro)
- apps/web/src/screens/ui.tsx:504-509 (useFresh)
- apps/web/src/screens/Records.tsx:115-130 (RecordPanel)
- apps/web/src/screens/Home.tsx:218-275 (znajomi)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- packages/games/src/lobby.ts (modify)
- packages/games/src/core.ts (modify)
- packages/games/src/memory.ts (modify)
- packages/games/src/kalambury.ts (modify)
- packages/games/src/panstwa-miasta.ts (modify)
- packages/games/src/kampus-tour.ts (modify)
- packages/games/src/piec-w-rzedzie.ts (modify)
- apps/web/src/screens/results.ts (create)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Records.tsx (modify)
- apps/web/src/screens/Home.tsx (modify)
- apps/web/src/games/Balon.tsx (modify)
- apps/web/src/games/KampusSummary.tsx (modify)
- apps/web/src/games/KampusTour.tsx (modify)
- apps/web/src/games/Mapa.tsx (modify)
- apps/web/src/games/Tort.tsx (modify)
- apps/web/src/games/Nozyczki.tsx (modify)
- apps/web/src/games/Srodek.tsx (modify)
- apps/web/src/games/Zaslona.tsx (modify)
- apps/web/src/games/Szacowanie.tsx (modify)
- apps/web/src/games/Rok.tsx (modify)
- apps/web/src/index.css (modify)
- ZASADY.md (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-04 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`. `ZASADY.md` tylko katalog animacji (lekcja 05-35).
- Własne ekrany końcowe gier bez zmian: trafiają pod „Szczegóły”, a ekran „Rekordy” dalej ich używa.
- Lekcja 05-14: dotknięcie kończy odsłonę bez wysyłania ruchu; przyciski działają od początku.
- Bez nowych keyframes, jeśli wystarcza istniejący katalog.
- `places` nie zmienia `isOver`, punktów ani rankingu wygranych; w `core.ts` tylko komentarz kontraktu (D-12).

## Tests (write first)
- `results.test.ts`: heroResult, revealOrder, bestRound, shouldReveal
- `tables.test.tsx`: bestRoundLine (także `labels`, `shortUnit`, `best: false`), ResultHero bez `record`, KampusSummary z `hero`
- `LobbyRoom.test.ts`: limit instrukcji solo, zamykanie pokoju solo, `skipIntro` i `game.places`
- testy `places` w Memory, Kalamburach, Państwach-miastach, Kampus Tour i Gomoku
- `hierarchy.test.ts`: główny przycisk ekranu głównego

## Interface
- RoomView.game.places: Record<PlayerId, number> | null  // serwer: `result.ranking ? result.places ?? def.places?.(state) ?? null : null`
- heroResult({ result, places, seats, scoreOf?, gap?, format?, me, nick }) → { title, rows: { id, place, score?, gap? }[] } | null
  // null: partia jednoosobowa, czyli `ranking` z jedną osobą bez `winner`; walkower `{ winner }` to nie null
  // miejsce: `places`, potem pozycja w `ranking`, a przy samym `winner` zwycięzca 1 i reszta 2
  // scoreOf(id) → { best, tie: number | null } z `def.record` i `game.view`, jak `score` dla RecordPanel w Game.tsx
  // gap({ gap, onTie }) formatuje różnicę jak `formatGap` z Records.tsx
- revealOrder(rows) → rows od ostatniego do pierwszego
- bestRound(rows) → { round, id, error } | null  // jedyny najmniejszy błąd; remis → null
- bestRoundLine({ heads, labels?, rows, format, unit, shortUnit?, best }) → ReactNode | null  // w ui.tsx; `best: false` → null
  // nazwa rundy: `labels[round]`, potem nagłówek tekstowy, a liczbowy jako „runda N”; jednostka: `shortUnit ?? unit`
- RoundTable: nowe propsy `labels?: string[]` i `shortUnit?: string`
  // Mapa: `labels` z nazw miast. `shortUnit`: Tort, Nożyczki, Środek "%", Zasłona "s", Rok "l.", Szacowanie "" (`format` ma już jednostkę)
- shouldReveal(prev: Phase | null, phase: Phase, count: number) → boolean  // tylko `playing` → `over` przy count >= 3
- RoomView.game.skipIntro: boolean  // tylko pokój `solo` po „Jeszcze raz”, póki trwa `intro`; po `begin` false. Intro woła start() tylko przy `skipIntro && intro`
- KampusSummary: prop `hero: ReactNode` pod tytułem; `<ResultHero rowsOnly reveal={false}/>` (D-14)
- <ResultHero reveal/> i <details>Szczegóły</details> w Game.tsx; RoundTable przez portal wstawia `bestRoundLine` do slotu bohatera, poza nim nic nie rysuje

## Edge cases
- gra główna bez `record` → wiersze bez liczby
- wynik `{}` (przerwana) → bez wierszy i bez punktów
- remis na górze → tytuł „Remis”, to samo miejsce, różnica pusta
- równy wynik, różne miejsca (drugie kryterium) → różnica z `tie`, nigdy „o 0”
- wynik nieskończony po limicie → miejsce bez liczby, bez różnicy, także u osoby niżej
- `{ winner }` bez `ranking` (Gomoku, Statki, Labirynt, walkower) → zwycięzca 1, reszta 2, `game.places` null
- odsłona: Game.tsx jest zamontowany już w trakcie partii, `ResultHero` dopiero po końcu, więc decyzję podejmuje Game.tsx; poprzednią fazę zapisuje w `useEffect`, nie w trakcie renderu (StrictMode renderuje dwa razy), a `reveal` trzyma w stanie do końca pokazu
- partia jednoosobowa (`heroResult` → null) → bez bohatera z tabelą, jak dziś; warunek nie patrzy na `seats.length`
- walkower (także mini-gra i Kampus Tour) → bohater ze zwycięzcą i jednym wierszem
- Kampus Tour: bohater przez `hero` w `KampusSummary`; hooki odsłony w `Game.tsx` stoją przed wczesnym `return`
- bohater nie czeka na pobranie rekordów: bez wyniku rekordu rysuje miejsca i nicki
- odświeżenie: przed `begin` przy `skipIntro` gra rusza raz, po `begin` nic nie rusza samo i tyka zwykły limit; StrictMode nie wysyła `begin` dwa razy (`started` w Intro)
- rewanż solo: `startMatch` czyści stary `turnTimer` także w gałęzi bez limitu instrukcji
- turniej jednoosobowy: kolejna gra to inna gra, więc instrukcja zostaje (`skipIntro` tylko przy `solo`)
- `me=""` → bez „ty” i bez linii rekordu
- Balon (`best={false}`) → bez linii rundy
- ekran „Rekordy” → brak slotu, brak linii

## Steps
1. `LobbyRoom.startMatch`: przy `seats.length === 1` bez timera; `skipIntro` po rewanżu w pokoju `solo`, wygaszany przy `begin`, i czyszczenie starego limitu. `viewFor`: `game.places`. Gry: `places` z tych samych porównań co `isOver`.
2. `results.ts`: heroResult, revealOrder, bestRound, shouldReveal.
3. `ui.tsx`: `ResultHero` z odsłoną z propa `reveal` (0,6 s na wiersz), bez `useFresh`; `Intro` ze `skipIntro`; `bestRoundLine` i slot w `RoundTable`.
4. `Game.tsx`: `shouldReveal` przy przejściu faz przed gałęzią Kampus Tour, tam `hero` dla `KampusTour`, który przekazuje go do `KampusSummary`; w pozostałych grach bohater nad szczegółami, „Szczegóły” zwinięte, panel rekordów zwinięty do linii bez rekordu i awansu.
5. `Home.tsx`: kolejność sekcji i główny przycisk.
6. Gry z `RoundTable`: `labels` w Mapie i `shortUnit` według Interface.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] Odbiór w `/dev?n=3`: zwykły koniec daje odsłonę, odświeżenie po końcu pokazuje całość od razu, rewanż daje odsłonę znowu; linia najlepszej rundy widoczna w Mapie przy zwiniętych „Szczegółach”; walkower w Gomoku ma bohatera, solo nie; Kampus Tour na 4 graczy mieści wiersze w podsumowaniu; odświeżenie rewanżu solo przed i po starcie nie zaczyna drugiej próby

## Result

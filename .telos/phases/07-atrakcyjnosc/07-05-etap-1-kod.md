---
id: 07-05
title: "Etap 1: kod wyników i solo (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-04]
decisions: [D-01, D-09, D-12]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/lobby.ts", "packages/games/src/core.ts", "packages/games/src/memory.ts", "packages/games/src/kalambury.ts", "packages/games/src/panstwa-miasta.ts", "packages/games/src/kampus-tour.ts", "packages/games/src/piec-w-rzedzie.ts", "apps/web/src/screens/results.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/games/Balon.tsx", "apps/web/src/index.css", "ZASADY.md"]
---
## Goal
Działająca, prosta wersja ekranu wyników, solo bez limitu instrukcji i nowy ekran główny. Wygląd dopracuje 07-06.

## Read first
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- packages/games/src/lobby.ts:24-54 (RoomView)
- packages/games/src/core.ts:30-32 (places) i 75-85 (rankPlaces)
- packages/games/src/kampus-tour.ts:689-700 (isOver)
- apps/web/src/screens/Game.tsx:425-504 (po partii)
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
- `tables.test.tsx`: bestRoundLine, pozytywnie i z `best: false`
- `LobbyRoom.test.ts`: limit instrukcji solo, `skipIntro` i `game.places`
- testy `places` w Memory, Kalamburach, Państwach-miastach, Kampus Tour i Gomoku
- `hierarchy.test.ts`: główny przycisk ekranu głównego

## Interface
- RoomView.game.places: Record<PlayerId, number> | null  // serwer: `result.ranking ? result.places ?? def.places?.(state) ?? null : null`
- heroResult({ result, places, seats, scoreOf?, gap?, format?, me, nick }) → { title, rows: { id, place, score?, gap? }[] }
  // miejsce: `places`, potem pozycja w `ranking`, a przy samym `winner` zwycięzca 1 i reszta 2
  // scoreOf(id) → { best, tie: number | null } z `def.record` i `game.view`, jak `score` dla RecordPanel w Game.tsx
  // gap({ gap, onTie }) formatuje różnicę jak `formatGap` z Records.tsx
- revealOrder(rows) → rows od ostatniego do pierwszego
- bestRound(rows) → { round, id, error } | null  // jedyny najmniejszy błąd; remis → null
- bestRoundLine({ heads, rows, format, unit, best }) → ReactNode | null  // w ui.tsx; `best: false` → null
- shouldReveal(prev: Phase | null, phase: Phase, count: number) → boolean  // tylko `playing` → `over` przy count >= 3
- RoomView.game.skipIntro: boolean  // rewanż solo: Intro woła start() przy montażu
- <ResultHero reveal/> i <details>Szczegóły</details> w Game.tsx; RoundTable przez portal wstawia `bestRoundLine` do slotu bohatera, poza nim nic nie rysuje

## Edge cases
- gra główna bez `record` → wiersze bez liczby
- wynik `{}` (przerwana) → bez wierszy i bez punktów
- remis na górze → tytuł „Remis”, to samo miejsce, różnica pusta
- równy wynik, różne miejsca (drugie kryterium) → różnica z `tie`, nigdy „o 0”
- wynik nieskończony po limicie → miejsce bez liczby, bez różnicy, także u osoby niżej
- `{ winner }` bez `ranking` (Gomoku, Statki, Labirynt, walkower) → zwycięzca 1, reszta 2, `game.places` null
- odsłona: Game.tsx jest zamontowany już w trakcie partii, `ResultHero` dopiero po końcu, więc decyzję podejmuje Game.tsx; poprzednią fazę zapisuje w `useEffect`, nie w trakcie renderu (StrictMode renderuje dwa razy), a `reveal` trzyma w stanie do końca pokazu
- 1 gracz → bez bohatera z tabelą, jak dziś
- `me=""` → bez „ty” i bez linii rekordu
- Balon (`best={false}`) → bez linii rundy
- ekran „Rekordy” → brak slotu, brak linii

## Steps
1. `LobbyRoom.startMatch`: przy `seats.length === 1` bez timera; `skipIntro` po rewanżu solo. `viewFor`: `game.places`. Gry: `places` z tych samych porównań co `isOver`.
2. `results.ts`: heroResult, revealOrder, bestRound, shouldReveal.
3. `ui.tsx`: `ResultHero` z odsłoną z propa `reveal` (0,6 s na wiersz), bez `useFresh`; `Intro` ze `skipIntro`; `bestRoundLine` i slot w `RoundTable`.
4. `Game.tsx`: `shouldReveal` przy przejściu faz, bohater nad szczegółami, „Szczegóły” zwinięte, panel rekordów zwinięty do linii bez rekordu i awansu.
5. `Home.tsx`: kolejność sekcji i główny przycisk.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] Odbiór w `/dev?n=3`: zwykły koniec daje odsłonę, odświeżenie po końcu pokazuje całość od razu, rewanż daje odsłonę znowu; linia najlepszej rundy widoczna w Mapie przy zwiniętych „Szczegółach”

## Result

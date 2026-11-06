---
id: 07-04
title: "Etap 1: bohater wyników i odsłona po partii"
type: code
status: done
critical: false
effort: hard
depends: [07-02, 07-03]
decisions: [D-08]
scope: ["apps/web/src/screens/results.ts", "apps/web/src/screens/results.test.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/tables.test.tsx", "apps/web/src/games/KampusSummary.tsx", "apps/web/src/games/KampusTour.tsx", "apps/web/src/index.css", "ZASADY.md"]
---
## Goal
Największy tekst po partii to wynik z ludźmi: zwycięzca, miejsca, jedna liczba i różnica. Przy 3+ graczach wiersze odsłaniają się od końca.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §4
- apps/web/src/screens/Game.tsx:96-113 (gałąź Kampus Tour)
- apps/web/src/screens/Game.tsx:425-504 (ekran po partii)
- apps/web/src/screens/Records.tsx:20-61 (FORMAT, formatGap)
- apps/web/src/games/KampusSummary.tsx:20-50
- apps/web/src/screens/ui.tsx:143-160 (Scores)
- apps/web/src/screens/ui.tsx:504-509 (useFresh)
- DESIGN.md §1
- ZASADY.md §5

## Files
- apps/web/src/screens/results.ts (create)
- apps/web/src/screens/results.test.ts (create)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- apps/web/src/games/KampusSummary.tsx (modify)
- apps/web/src/games/KampusTour.tsx (modify)
- apps/web/src/index.css (modify)
- ZASADY.md (modify)

## Constraints
- Własne ekrany końcowe gier bez zmian: trafiają pod „Szczegóły”, a ekran „Rekordy” dalej ich używa.
- Lekcja 05-33: wyniki liczone wyłącznie ze stanu; `me=""` (obserwator, rekordowa partia) musi działać.
- Lekcja 05-14: dotknięcie kończy odsłonę bez wysyłania ruchu; przyciski działają od początku.
- Lekcja 05-35: nowy keyframe tylko, gdy nie wystarcza katalog, i wtedy wpis w ZASADY §5.
- Bez zmian punktacji i starych rekordów. „Inna gra” dochodzi w etapie 3, tu zostaje „Do lobby”.
- Hierarchia i przyciski według ZASADY §4; największy tekst to tytuł bohatera. Kampus Tour: tytuł z monopolem i „Oglądasz” zostają, pod nimi same wiersze, bez odsłony (podsumowanie i tak ma opóźnienie).

## Tests (write first)
- `results.test.ts`: `heroResult` dla każdego punktu Edge cases o wierszach, także Schulte 1, 1, 3 i `result.places` Szybkiego Chińczyka
- `results.test.ts`: `revealOrder`, `shouldReveal` z każdego przejścia
- `tables.test.tsx`: `ResultHero` bez `score` pokazuje miejsca i nicki; `KampusSummary` z `hero`; `Game.tsx` przekazuje `hero` w gałęzi `kampus-tour`

## Interface
- heroResult({ result, places, seats, scoreOf?, gap?, format?, me, nick }) → { title, rows: { id, place, score?, gap? }[] } | null
-   // null: `ranking` z jedną osobą bez `winner`; walkower `{ winner }` to nie null
-   // miejsce: `places`, potem pozycja w `ranking`, a przy samym `winner` zwycięzca 1, reszta 2
- revealOrder(rows) → rows od ostatniego do pierwszego
- shouldReveal(prev: Phase | null, phase: Phase, count: number) → boolean  // tylko `playing` → `over` przy count >= 3
- <ResultHero reveal rowsOnly? /> w ui.tsx, 0,6 s na wiersz; <details>Szczegóły</details> w Game.tsx
- KampusSummary: prop `hero: ReactNode` pod tytułem

## Edge cases
- gra główna bez `record` → wiersze bez liczby
- wynik `{}` (przerwana) → bez wierszy
- remis na górze → tytuł „Remis”, to samo miejsce, bez różnicy
- równy wynik, różne miejsca (drugie kryterium) → różnica z `tie`, nigdy „o 0”
- wynik nieskończony po limicie → miejsce bez liczby i różnicy, także u osoby niżej
- `{ winner }` bez `ranking` (Gomoku, Statki, Labirynt) → zwycięzca 1, reszta 2
- partia jednoosobowa → bez bohatera; warunek nie patrzy na `seats.length`
- walkower (także mini-gra, Kampus Tour) → bohater i jeden wiersz
- odświeżenie w `over` → całość od razu; `playing` → `over` przy 3+ tak, `over` → `over` nie, 2 graczy nie, rewanż znów tak
- `me=""` → bez „ty”
- bohater nie czeka na pobranie rekordów

## Steps
1. `results.test.ts`, `tables.test.tsx`: testy padają.
2. `results.ts`: czyste funkcje; `scoreOf` z `def.record` i `game.view`, jak `score` dla RecordPanel.
3. `ui.tsx`: `ResultHero`; `reveal` z propa, bez `useFresh`.
4. `Game.tsx`: decyzja o odsłonie przed gałęzią Kampus Tour, poprzednia faza zapisywana w `useEffect` (StrictMode), `reveal` w stanie do końca pokazu.
5. `Game.tsx`: bohater nad szczegółami, „Szczegóły” zwinięte, stara lista `ranking` usunięta.
6. `KampusTour`, `KampusSummary`: prop `hero`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/screens/tables.test.tsx` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] Odbiór w `/dev?n=3`: koniec daje odsłonę, odświeżenie całość od razu, rewanż znów odsłonę; walkower w Gomoku ma bohatera, solo nie

## Result
Po partii z ludźmi największy tekst to `ResultHero` (ui.tsx) z `heroResult` (results.ts): tytuł, miejsca, jedna liczba, różnica do osoby wyżej; przy 3+ wierszach odsłona od końca co 0,6 s, tytuł ostatni, dotknięcie kończy pokaz. Kampus Tour: same wiersze w podsumowaniu.
Testy: 227 passed w web (results.test.ts, tables.test.tsx; w tym wszystkie 30 mini-gier: wiersze z widoku obserwatora po limitach). Odbiór w przeglądarce: odsłona 001→011→111+tytuł, odświeżenie całość od razu, rewanż znów, dotknięcie kończy, walkower w Gomoku (WebSocket zamknięty kodem CONSENTED, bo UI nie ma wyjścia z partii) z jednym wierszem, solo bez bohatera.
Decyzja: zamiast `<details>` stabilny `ResultDetails` z `aria-expanded` (`contents` w partii): `<details>` tylko po partii przemontowałby grę i zgubił wibrację szkody z ostatniego ruchu. Decyzja: po ostatniej grze turnieju bez bohatera, tytuł należy do turnieju.
Niespodzianki: `FORMAT` zaokrągla różnicę do „0,0 s”, więc taka różnica znika; „N. miejsce” panelu rekordów (36 px) przebijało tytuł (30 px), pod bohaterem ma 24 px. W trakcie odsłony nagłówek i panele są niewidoczne, żeby nie zdradzać zwycięzcy.
Deviations: apps/web/src/screens/Records.tsx — eksport `formatGap` i prop `underHero` (tytuł bohatera ma być największy); apps/web/src/screens/lists.test.ts — asercja wymagała `OWN_RANKING`, a zadanie usuwa tę listę

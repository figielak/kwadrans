---
id: 16-02
title: Testy zasad i silnik gry
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [16-01]         # task IDs, e.g. [01-01]
decisions: [D-01, D-02]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/kropki-i-kreski.ts", "packages/games/src/kropki-i-kreski.test.ts", "packages/games/src/index.ts", "apps/web/src/screens/howToPlay.ts", "apps/web/src/screens/howToPlay.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Napisać testy zasad, potem silnik `kropki-i-kreski`, wpisać grę do `GAMES` i dodać jej kartę „Jak grać”.

## Read first
- ZASADY.md:52-83 (testy obowiązkowe i sposób pisania)
- ZASADY-GIER.md §14. Kropki i kreski
- packages/games/src/memory.ts:47-103 (kolejny ruch po sukcesie, `rankResults`, `rankPlaces`, timeout)
- packages/games/src/labirynt.ts:5-9 (`MODES`)
- packages/games/src/labirynt.ts:136-139 (tryb w `setup`)
- packages/games/src/core.ts:77-87 (`rankResults`, `rankPlaces`)
- packages/games/src/index.ts:136-142 (eksport stałych i typów)
- apps/web/src/screens/howToPlay.ts:37-64 (wzór karty)
- apps/web/src/screens/howToPlay.test.ts:15-17 (listy gier w testach)
- apps/web/src/screens/howToPlay.test.ts:74-78 (strażnik kompletu kart)

## Files
- packages/games/src/kropki-i-kreski.test.ts (create)
- packages/games/src/kropki-i-kreski.ts (create)
- packages/games/src/index.ts (modify)
- apps/web/src/screens/howToPlay.ts (modify)
- apps/web/src/screens/howToPlay.test.ts (modify)

## Constraints
- Testy idą osobnym commitem „Kropki i kreski: testy zasad” przed kodem; nie zmieniać ich pod implementację (ZASADY §2). Bez kryterium „testy → exit 1”, bo w fazie 10 dało FAIL przy zamknięciu (10:D-04).
- Stan to JSON: `players`, `size`, `nonce` (z `rng`, montuje ekran od nowa przy rewanżu), `edges: boolean[]`, `boxes: (number | null)[]` (miejsce właściciela), `turn`, `last: { edge, seat, boxes: number[] } | null`. Ruch: `{ edge: number }`.
- Numeracja kresek jak w §14. Eksport z `index.ts`: `KRESKI_TURN_SECONDS`, `kreskiEdgeCount`, `kreskiEdgeEnds`, `type KropkiIKreskiMove`, `type KropkiIKreskiView`.
- Losowość tylko z `rng`; `applyMove` zwraca nowy stan; `validateMove` jest jedynym strażnikiem (PROJECT).
- `id` nigdy się nie zmienia; D-01: `minPlayers: 2`, `maxPlayers: 4`, bez `record` i bez `live`.
- Wpis do `GAMES` uruchamia strażnika kart z `howToPlay.test.ts:74`, więc karta powstaje w tym zadaniu (ZASADY §6 pkt 7), a liczby w niej biorą się ze stałych.

## Tests (write first)
- definicja: 2-4 graczy, 60 s, trzy tryby z domyślnym 5×5, świeża gra nie jest skończona
- setup: 24/60/112 kresek i 9/25/49 kwadratów, nieznany tryb daje 5×5, zaczyna `players[0]`, seed wyznacza `nonce`
- walidacja: obcy, cudza tura, zajęta kreska, -1, numer równy liczbie kresek, ułamek i ruch po końcu odpadają; pierwsza i ostatnia dozwolona przechodzą
- schemat: odrzuca tekst, brak pola i liczbę niecałkowitą
- kreska bez kwadratu oddaje ruch następnej osobie, po czwartej wraca do pierwszej
- trzy boki nie dają punktu
- czwarty bok daje punkt, właściciela, ten sam gracz rusza dalej, `last.boxes` wskazuje kwadrat
- kreska między dwoma trzybocznymi kwadratami daje 2 punkty i jeden dodatkowy ruch
- kreska brzegowa należy do jednego kwadratu
- ostatnia kreska kończy partię bez kolejnego ruchu, `waitingFor` jest puste
- wygrana każdego z graczy i ranking malejąco po kwadratach
- remis na szczycie nie ma zwycięzcy, `places` są wspólne
- 2 osoby na każdej planszy zawsze mają zwycięzcę i sumę równą liczbie kwadratów (wiele seedów)
- `timeoutMove` przechodzi `validateMove` w każdym stanie, także przy ostatniej kresce
- `kreskiEdgeEnds` daje unikalne odcinki jednostkowe na każdym rozmiarze
- `applyMove` nie zmienia poprzedniego stanu, stan przeżywa JSON, widok gracza i obserwatora ma całą planszę
- karta „Jak grać” istnieje, mieści się w limicie i mówi o kolejnym ruchu po zamknięciu kwadratu

## Steps
- Napisać `kropki-i-kreski.test.ts` z nagłówkiem listującym zasady; commit testów.
- Napisać `kropki-i-kreski.ts` z `edgeEnds`, `boxEdges`, `MODES` i definicją gry.
- Dopisać eksporty i wpis w `GAMES` w `index.ts`.
- Dodać kartę w `howToPlay.ts`, dopisać id do list i asercję w `howToPlay.test.ts`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/kropki-i-kreski.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

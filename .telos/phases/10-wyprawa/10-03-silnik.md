---
id: 10-03
title: Silnik Wyprawy i wpis w rejestrze
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard      # normal | hard
depends: [10-02]         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/wyprawa.ts", "packages/games/src/index.ts", "packages/games/src/index.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zaimplementować czyste zasady Wyprawy, aż przejdą testy z 10-02, i dodać grę do rejestru z eksportami `WYPRAWA_`.

## Read first
- packages/games/src/wyprawa.test.ts (testy do spełnienia, bez zmian)
- packages/games/src/panstwa-miasta.ts:69-162 (kształt definicji gry faz równoczesnych)
- packages/games/src/core.ts:77-88 (rankResults, rankPlaces)
- packages/games/src/core.ts:239-245 (shuffle)
- packages/games/src/index.ts:115-131 (eksporty stałych z przedrostkiem)
- packages/games/src/index.ts:176-180 (GAMES)
- packages/games/src/index.test.ts:42 (liczba gier w rejestrze)
- packages/games/src/index.test.ts:129-136 (ogólny test partii i `visited`)
- packages/games/src/index.test.ts:245-254 (fazy gier wielofazowych)

## Files
- packages/games/src/wyprawa.ts (create)
- packages/games/src/index.ts (modify)
- packages/games/src/index.test.ts (modify)

## Constraints
- Testów z 10-02 nie zmieniamy pod implementację; zła zasada to najpierw test i ZASADY-GIER.md.
- Losowość tylko z `rng`: `buildDeck` przez `shuffle`, wołany w setupie i przy starcie wyprawy; bez `Math.random` i `Date.now`.
- Rozstrzygnięcie liczone dopiero z kompletu `choices`, bez rng i bez zależności od kolejności nadejścia.
- `playerView` buduje jawny obiekt polami z Interface, nigdy `...state`.
- Timeout bez `context.source`: oba ruchy są legalne także od gracza (plan §4).
- Reuse `shuffle`, `rankResults`, `rankPlaces`; bez nowego ogólnego silnika i zależności. Definicja bez `record`, `live`, `modes`.
- `id` `wyprawa` jest ostateczne: to klucz rankingu w SQLite.
- Nowy wpis w `GAMES` może zmienić losowanie głosowania „Inna gra” w testach serwera; poprawa takiego testu to osobne zgłoszenie, nie zmiana zasad.

## Tests (write first)
- Wszystkie testy `packages/games/src/wyprawa.test.ts` z 10-02, w tym każdy Edge case.
- index.test.ts: rejestr ma 40 gier zamiast 39.
- index.test.ts: Wyprawa w rejestrze jest grą główną 2-6 osób, poza `MINI_GAME_IDS`, bez `record`, `live`, `modes`.
- index.test.ts: stałe `WYPRAWA_EXPEDITIONS`, `WYPRAWA_DECISION_SECONDS`, `WYPRAWA_SUMMARY_SECONDS` to 5, 20, 15.
- index.test.ts: `expected.wyprawa` to `["decision", "summary"]` w teście faz.

## Interface
```ts
type Hazard = "osuwisko" | "zalanie" | "roj" | "przepasc" | "most";
type Card = { kind: "treasure"; value: number } | { kind: "hazard"; hazard: Hazard };
type Choice = "continue" | "return";
type Move = { type: "choose"; choice: Choice; nonce: number; expedition: number; reveal: number }
  | { type: "next"; nonce: number; expedition: number };
type Phase = "decision" | "summary" | "over";
State: players, nonce, phase, expedition (0..4), reveal (= trail.length), deck: Card[] (reszta, tajna), trail: Card[],
  onTrail: PlayerId[], bank, carried, loose, choices (tajne), ready: PlayerId[], last: Resolution | null, history: ExpeditionRecord[]
Resolution: reveal, choices (komplet), returned, share, banked: Record<PlayerId, number>, looseAfter
ExpeditionRecord: trail, gain, lost: Record<PlayerId, number>, discarded, end: "hazard" | "returned" | "empty", hazard: Hazard | null
View: stan bez deck i choices, plus deckLeft, ready (gotowi w decyzji), myChoice: Choice | null
Eksporty: wyprawa, EXPEDITIONS = 5, DECISION_SECONDS = 20, SUMMARY_SECONDS = 15, HAZARDS, buildDeck(rng), openExpedition(state, deck)
turn(): key `${nonce}:${expedition}:${reveal}:${phase}`; seconds 20 / 15 / 0 (over)
```

## Edge cases
- skarb 1 przy 6 osobach → carried bez zmian, loose +1
- skarb 15 przy 2 osobach → po 7, loose +1; stare loose nie wchodzi do podziału
- loose 5, wracają dwie osoby z carried 7 i 4 → bank +9 i +6, na szlaku zostaje 1
- samotny powrót → cała reszta loose do banku tej osoby
- loose mniejsze niż liczba wracających → udział 0, loose zostaje
- powrót i drugie takie samo zagrożenie w tym samym kroku → najpierw bank, potem karta; wracający nic nie traci
- pierwsza karta danego zagrożenia i dwie różne → wyprawa trwa
- wszyscy wracają → bez następnej karty, reszta loose przepada, `end: "returned"`
- druga taka sama karta → pozostali tracą carried, loose przepada, bank bez zmian, `end: "hazard"`
- pusta talia przy kimś na szlaku → pozostali bankują carried i dzielą loose, `end: "empty"`
- 15 skarbów i 5 różnych zagrożeń przed powtórką → najwyżej 20 decyzji, 21. karta kończy
- piąta wyprawa zakończona → od razu `over`, `waitingFor` puste, `turn().seconds` 0
- równe banki na górze → bez zwycięzcy, wspólne miejsca; remis niżej zachowuje zwycięzcę
- komplet timeoutów → wszyscy zawsze wracają razem, koniec partii, remis
- ruch ze starym nonce, wyprawą albo odkryciem; drugi wybór; ruch z obozu; obcy gracz; `next` poza odsłoną → odrzucone
- obserwator i obce id → brak `myChoice`, cudzych wyborów i talii w każdej fazie

## Steps
1. packages/games/src/index.test.ts: liczba gier 40, `describe("Wyprawa w rejestrze")` i wpis w `expected` — czerwone przed kodem.
2. packages/games/src/wyprawa.ts: typy, stałe, `buildDeck`, `openExpedition` — skład talii i pierwsza karta przechodzą.
3. packages/games/src/wyprawa.ts: `validateMove`, `applyMove` z `resolve` i `reveal` — podział, końce i bilans przechodzą.
4. packages/games/src/wyprawa.ts: `playerView`, `isOver`, `places`, `waitingFor`, `turn`, `timeoutMove` — widoki i limity przechodzą.
5. packages/games/src/index.ts: wpis w `GAMES` i eksporty `WYPRAWA_`, `WyprawaView`, `WyprawaMove` — ogólny test kontraktu przechodzi dla 2 i 6 graczy.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter @kwadrans/games exec vitest run src/wyprawa.test.ts src/index.test.ts` → exit 0
- [x] `pnpm run typecheck` → exit 0
- [x] Plik `wyprawa.test.ts` jest niezmieniony względem commitu testów z 10-02.

## Result
Czysty silnik Wyprawy: jednoczesne powroty, bilans monet, pięć wypraw, prywatny widok, timeouty i miejsca z remisami; rejestr 40 gier i eksporty WYPRAWA_, WyprawaView, WyprawaMove.
RED przed implementacją: brak modułu Wyprawy oraz błędna liczba gier i brak eksportowanych stałych. GREEN: 382/382 testów Wyprawy i rejestru, w tym 120/120 testów zasad.
`pnpm typecheck && pnpm test` → exit 0, 3220/3220 testów; `telos accept 10-03` → PASS. Bez potrzeby zmian testów serwera po rozszerzeniu rejestru.
`wyprawa.test.ts` niezmieniony względem 031e1f4 (10-02); wcześniejsze usunięcia plików fazy 11 pozostawiono bez zmian. Bez commitu zgodnie z AGENTS.md.
Deviations: none

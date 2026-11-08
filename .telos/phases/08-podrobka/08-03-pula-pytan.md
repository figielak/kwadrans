---
id: 08-03
title: "Pula 60 par pytań"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-02]         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/podrobka-dane.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Przygotować ręcznie 60 par pytań z wspólną wskazówką formatu i przejrzeć każdą w obu kierunkach. Testy automatyczne sprawdzają strukturę, przegląd jakość.

## Read first
- .planning/PODROBKA-PLAN.md:105-125 (pula, przykłady, kryteria przeglądu)
- packages/games/src/podrobka-dane.test.ts (testy do spełnienia, bez zmian)
- ZASADY-GIER.md §13. Podróbka

## Files
- packages/games/src/podrobka-dane.ts (create)

## Constraints
- Po 20 par: `liczby`, `rzeczy`, `miejsca`. Kategoria służy redakcji, nie jest wysyłana klientowi.
- Przegląd każdej pary: oba kierunki grywalne, odpowiedzi tego samego rodzaju, realne nakładanie się, bez zdradzania roli jednostką, gramatyką ani rzędem wielkości.
- Pytania proste, bez wiedzy encyklopedycznej i wrażliwych szczegółów.
- Forma neutralna płciowo: przykład z planu „Gdzie poszedłbyś…” staje się np. „Gdzie najlepiej pójść…”, bo gracz nie podaje płci.
- Przykłady z planu §4 to materiał do próby, nie gotowa pula; balans ocenia dopiero 08-10.
- Żadnego pytania nie używamy w dwóch parach: rozpoznanie drugiej pary zdradzałoby przydział.
- Plik nie importuje niczego z `podrobka.ts`; bez nowych zależności.

## Tests (write first)
- Wszystkie testy `packages/games/src/podrobka-dane.test.ts` z 08-02.

## Steps
- Napisać typ `Pair`, `Category` i po 20 par na kategorię.
- Przejść listę kontrolną dla każdej pary w obu kierunkach; poprawić albo wymienić słabe.
- Wypisać w Result pary niepewne, do sprawdzenia przy stole w 08-10.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter @kwadrans/games exec vitest run src/podrobka-dane.test.ts` → exit 0
- [x] Plik `podrobka-dane.test.ts` jest niezmieniony względem commitu testów z 08-02.
- [x] Result opisuje wynik przeglądu i listę par niepewnych.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->
Dodano `podrobka-dane.ts`: 60 par (20 liczby, 20 rzeczy, 20 miejsca), wspólna wskazówka na parę, id `l01`-`l20`, `r01`-`r20`, `m01`-`m20`. `podrobka-dane.test.ts`: 13/13 zielone, plik testów niezmieniony od `1c9db4e`.
Przegląd: oba kierunki grywalne, odpowiedzi tego samego rodzaju z realnym nakładaniem, czas teraźniejszy bez form rodzajowych, żadne pytanie nie powtarza się w puli, brak wiedzy encyklopedycznej i wrażliwych tematów. Przykłady z planu §4 poprawiono (np. „Gdzie najlepiej pójść na pierwszą randkę?”).
Pary niepewne do stołu w 08-10: l06 i l13 (rząd wielkości może zdradzać rolę), l10 i l17 (różne częstości), l19 (liczba sztuk bez ostrego nakładania), r18 (gry planszowe kontra komputerowe), r11 i r05 (różne konteksty), m04 (obiad kontra kawa), m09 (tylko trzy możliwe odpowiedzi), m17 i m18 (bardzo bliskie lub mało zróżnicowane).
Typecheck całego repo nadal czerwony tylko przez brak `podrobka.ts` w `podrobka.test.ts` (do 08-04).
Deviations: none

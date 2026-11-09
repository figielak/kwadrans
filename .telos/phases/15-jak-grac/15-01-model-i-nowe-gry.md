---
id: 15-01
title: "Model treści i karty trzech nowych gier"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: []         # task IDs, e.g. [01-01]
decisions: [D-04, D-05]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/howToPlay.ts", "apps/web/src/screens/howToPlay.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Ustalić kształt karty „Jak grać” i napisać karty Sabotażu, Wyprawy i Podróbki, z testami pilnującymi długości i zgodności liczb ze stałymi gier.

## Read first
- ZASADY-GIER.md §11 Sabotaż
- ZASADY-GIER.md §12 Wyprawa
- ZASADY-GIER.md §13 Podróbka
- apps/web/src/screens/Lobby.tsx:425-436 (BLURBS, ton opisów)
- apps/web/src/screens/lists.test.ts:40-41 (zakazane słowa w opisach)
- packages/games/src/index.ts:121-140 (stałe z przedrostkiem gry)

## Files
- apps/web/src/screens/howToPlay.ts (create)
- apps/web/src/screens/howToPlay.test.ts (create)

## Constraints
- Kształt: `HowToPlay = { goal: string; flow: string[]; scoring: string[]; watch: string[] }`, eksport `HOW_TO_PLAY: Record<string, HowToPlay>` kluczowany `id` gry.
- Liczby rund, limity i punkty w template stringach ze stałych `SABOTAZ_*`, `WYPRAWA_*`, `PODROBKA_*`, nie wpisane ręcznie.
- Treść wynika z `ZASADY-GIER.md`; gdy tekst karty upraszcza zasadę, nie może jej zmieniać. Pomijamy szczegóły techniczne (`nonce`, numery decyzji, zachowania serwera niewidoczne dla gracza).
- „Uważaj” ma nieoczywiste rzeczy, np. Sabotaż: cel mniejszy od własnego stosu nie odkrywa reszty; Wyprawa: bez „Gotowe” liczy się „Wracam”; Podróbka: remis na prowadzeniu oznacza ucieczkę.
- Plik bez JSX i bez importów z ekranów, żeby nie tworzyć cyklu z `Lobby.tsx`.

## Tests (write first)
- Karty `sabotaz`, `wyprawa` i `podrobka` istnieją, a klucze to istniejące `id` z `GAMES`.
- Każda karta ma niepusty cel, 2-4 punkty przebiegu, 1-4 punkty punktacji i 2-3 punkty „Uważaj”.
- Łączna długość karty to najwyżej 900 znaków.
- Karty nie mają em-dasha ani nazw `Skull`, `Uno`, `Quoridor`, `Business Tour`.
- Karta zawiera liczbę rund ze stałej gry (`SABOTAZ_ROUNDS`, `WYPRAWA_EXPEDITIONS`, `PODROBKA_ROUNDS`).
- Karta Wyprawy zawiera `WYPRAWA_DECISION_SECONDS`, Podróbki `PODROBKA_WRITE_SECONDS` i `PODROBKA_VOTE_SECONDS`.

## Steps
- Napisać testy i potwierdzić, że są czerwone.
- Dodać typ i `HOW_TO_PLAY` z trzema kartami.
- Przeczytać każdą kartę obok sekcji `ZASADY-GIER.md` i poprawić rozbieżności.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm --filter web exec vitest run src/screens/howToPlay.test.ts` → exit 0

## Result
Dodano `howToPlay.ts`: typ `HowToPlay` i `HOW_TO_PLAY` z kartami Sabotażu, Wyprawy i Podróbki (liczby rund, limity i punkty ze stałych `@kwadrans/games`; punkty Podróbki 2/3 wpisane, bo gra ich nie eksportuje).
Testy `howToPlay.test.ts` (5): klucze z `GAMES`, liczność sekcji, limit 900 znaków, zakazane słowa i em-dash, obecność stałych. RED: brak modułu, potem 5/5 zielone.
Karty sprawdzone z ZASADY-GIER.md §11-13, „Uważaj” zawiera wskazane nieoczywistości.
Deviations: none

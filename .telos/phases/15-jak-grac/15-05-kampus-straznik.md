---
id: 15-05
title: "Karta Kampus Tour, strażnik kompletu i dokumenty"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-03, 15-04]         # task IDs, e.g. [01-01]
decisions: [D-01, D-05]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/howToPlay.ts", "apps/web/src/screens/howToPlay.test.ts", "ZASADY.md", "KONCEPT.md", "AGENTS.md", "DESIGN.md"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dopisać najdłuższą kartę, Kampus Tour, wymusić testem kartę dla każdej gry głównej i wpisać nowy wymóg do dokumentów.

## Read first
- ZASADY-GIER.md §6 Kampus Tour
- ZASADY.md §6 (podpięcie i odbiór)
- KONCEPT.md §3 (reguły platformy)
- AGENTS.md §Sposób pracy
- DESIGN.md §5

## Files
- apps/web/src/screens/howToPlay.ts (modify)
- apps/web/src/screens/howToPlay.test.ts (modify)
- ZASADY.md (modify)
- KONCEPT.md (modify)
- AGENTS.md (modify)
- DESIGN.md (modify)

## Constraints
- Karta Kampus Tour ma ten sam układ, limit 1800 znaków. Opisuje tylko to, czego gracz potrzebuje: rzut i dublet, kupno i czynsz, rozbudowę, wykupienie, pola specjalne, koniec po bankructwie, monopolu albo 20 rundach.
- Pełne kwoty i listy pól zostają poza kartą, bo pokazuje je okienko pola w `KampusTour.tsx`.
- Strażnik czyta `Object.values(GAMES).filter((d) => d.minPlayers > 1)`, bez ręcznej listy.
- `ZASADY.md` §6: karta w `howToPlay.ts` to obowiązkowy krok nowej gry głównej. `AGENTS.md`: zmiana zasad gry aktualizuje też jej kartę. `KONCEPT.md` §3: reguła platformy o „Jak grać”. `DESIGN.md`: krótki opis sekcji i okienka.
- Dokumenty bez powielania treści kart.

## Tests (write first)
- Każda gra z `GAMES` o `minPlayers > 1` ma kartę w `HOW_TO_PLAY`.
- `HOW_TO_PLAY` nie ma kluczy spoza `GAMES` ani kart dla mini-gier.
- Karta `kampus-tour` spełnia reguły kształtu i ma najwyżej 1800 znaków.
- Karta `kampus-tour` zawiera liczbę 20 rund jako granicę długości partii.

## Steps
- Dodać strażnika i potwierdzić, że jest czerwony na braku karty Kampus Tour.
- Napisać kartę i porównać ją z `ZASADY-GIER.md` §6.
- Zaktualizować cztery dokumenty.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0

## Result
Dopisano kartę `kampus-tour` (rzut i dublet, kupno, czynsz, rozbudowa, wykupienie, pola specjalne, koniec; `KAMPUS_ROUNDS` ze stałej, kwoty i lista pól poza kartą) oraz strażnika: zbiór kart równa się zbiorowi gier z `minPlayers > 1` (bez ręcznej listy).
Testy `howToPlay.test.ts`: 15 (RED: 5 padło na braku karty; limit 1800 dla Kampus Tour). Pełny `pnpm run test`, typecheck i build zielone.
Dokumenty: krok 7 w `ZASADY.md` §6, zdanie w `AGENTS.md` (zmiana zasad poprawia kartę), akapit o karcie i ikonie w `KONCEPT.md` §3, reguła „Zasady są pod ręką” w `DESIGN.md` §5, bez powielania treści kart.
Deviations: none

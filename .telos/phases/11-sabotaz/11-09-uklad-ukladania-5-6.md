---
id: 11-09
title: "Sabotaż: układ fazy układania przy 5-6 graczach"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: ["11-06"]
decisions: ["D-01"]
scope: ["apps/web/src/games/Sabotaz.tsx","apps/web/src/games/Sabotaz.test.tsx"]
---
## Goal
Usunąć 4 px przewijania pionowego w fazie układania (`place`) przy 5-6 graczach na 360×640, znalezione w odbiorze 11-07, żeby ekran partii mieścił się bez przewijania (ZASADY §4).

## Read first
- ZASADY.md §4. Spójność wyglądu (ekran partii mieści się na 360×640)
- apps/web/src/games/Sabotaz.tsx (SabotazBoard: siatka stosów, własny stos, ręka, akcje)
- .telos/phases/11-sabotaz/11-07-odbior-techniczny.md §Result (pomiary i reprodukcja)

## Files
- apps/web/src/games/Sabotaz.tsx (modify)
- apps/web/src/games/Sabotaz.test.tsx (modify)

## Constraints
- Reprodukcja: 6 graczy z nickami po 16 znaków, faza `place`, gracz ma w ręce karty (przyciski „Wybierz kartę” i „Licytuj”), okno 360×640: `scrollHeight - innerHeight` = 4 (oczekiwane 0). To samo przy 3 rzędach kafli, czyli 5 graczy (niezmierzone). Przy 3 graczach 0, przy pustej ręce 0.
- Tylko układ pionowy (odstępy, rozmiar kafli, kolejność bloków); bez zmiany zasad, tekstów ani rozmiaru pól dotykowych poniżej 48 px.
- Wymiary mierzy odbiór w przeglądarce (testy renderowania statycznego nie widzą układu).

## Tests (write first)
- Test źródła: klasy układu kafli i bloku własnych kart nie zwiększają wysokości względem budżetu (np. wspólny odstęp i wysokość kafla w stałej), tak by pozostawić margines na 5-6 graczy.

## Steps
- Zmniejszyć łączną wysokość: odstępy między blokami, wysokość kafla stosu albo etykiety „Twój stos”/„Twoja ręka”, o co najmniej 4 px zapasu.
- Powtórzyć pomiar w `/dev` dla 5 i 6 graczy w fazach initial, place, bid, reveal (wszystkie `vscroll` = 0).

## Acceptance
- [x] all listed tests pass
- [x] `pnpm typecheck && pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Pomiar 360×640, 6 graczy z długimi nickami: faza `place` bez przewijania, pola nadal co najmniej 48 px.

## Result
Kafel stosu ma teraz 52 px zamiast 56 (`min-h-13`, `py-1.5`, w stałej `TILE`), co przy 3 rzędach daje 12 px zapasu. Testy: 2 nowe (kafel-grupa i kafel-przycisk), RED na asercji `min-h-13`, potem 52/52 w pliku; całość 2478 + 187 + 430.
Pomiar w przeglądarce (Playwright, 360×640, nicki po 16 zn., pełna droga przez pokój), 5 i 6 graczy: `scrollHeight - innerHeight` = 0 w initial, place (2 okrążenia dokładania z wyborem karty i bez oraz stan przed licytacją przy 3 kartach w stosie), bid, reveal (kafle z trzecią linią: 70 px). Najmniejsze pole 48 px (przycisk reakcji), kafle 52 px.
Niespodzianka: pierwszy `telos accept` zgłosił 1 padający test w apps/server bez nazwy w skróconym logu; potem 4× `pnpm --filter server test` i 5× `pnpm test` zielone, kod serwera i gier bez zmian. Niezidentyfikowana niestabilność do obserwacji.
Deviations: AGENTS.md — zmiana użytkownika sprzed zadania, nie commitowana

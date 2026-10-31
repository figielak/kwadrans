---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 55
status: complete
completed: 2026-10-31
packages: [P4-034]
---

# 05-55 SUMMARY: P4-034

- F4-017: ręczny zbiór 31 id w `Game.tsx` zastąpiony `SIMULTANEOUS` (`MINI_GAME_IDS` + `panstwa-miasta`; nagłówek i licznik bez zmian) i `OWN_RANKING` (+ `kalambury`). Kalambury po partii nie pokazują już drugiej listy miejsc pod własną tabelą „Suma punktów” (W2). `Lobby.tsx` bierze `MINI_GAMES` z `MINI_GAME_IDS`; zestaw 30 id przed i po ten sam (test, lobby „30 gier”).
- F4-048: Sudoku ma `nonce` losowany po planszy (te same plansze z seedu co wcześniej); `MiniGame.tsx` montuje po `nonce ?? puzzle.join()`, więc stara rekordowa partia bez nonce działa.
- F4-051: stałe Śledzenia eksportowane jako `SLEDZENIE_*`; `Sledzenie.tsx` i test etykiet zaktualizowane, id gry bez zmian.
- F4-156: `StartBar` ma `note` (linia nad akcją w tym samym `StickyBar`); Turniej podaje przez nie podsumowanie zamiast owijać `StartBar` drugim przyklejonym paskiem. Sprawdzone w /dev na 360×640: jeden pasek, podsumowanie nad „Zagraj: Turniej”.
- TDD `e3d6157` (5 testów RED), testy bez zmian w implementacji. Typy, testy gier, serwera i web, build PASS.
- Do odbioru: rewanż Sudoku z tą samą planszą, Kalambury 3+ osób po partii, Turniej preset/min/max i gotowość gości przy przyklejonym pasku.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 26
status: complete
completed: 2026-10-31
packages: [P4-025]
---

# 05-26 SUMMARY: P4-025

- Gomoku: pełna plansza bez linii zwraca `{ ranking: [A, B] }` zamiast `{}` (wynik nie wygląda już jak gra przerwana). Wygrana bez zmian; statystyki zapisują tylko zwycięzcę, więc historia wygranych się nie zmienia.
- Chińczyk Szybki: `isOver` dokłada `places` (1 dla zwycięzcy, dalsze według pionków w domku i sumy pozycji, równe = to samo miejsce); `ranking` zachowuje stabilną kolejność graczy. Klasyczny bez pola.
- Turniej: `tablePlaces(standings)` numeruje tabelę wspólnym miejscem przy identycznej parze punkty/wygrane; punkty, `winner` i dogrywka bez zmian.
- UI: lista miejsc gier głównych (3+ graczy) i tabela turnieju biorą numery z `places`/`tablePlaces`. Wyniki bez `places` czytane jak dotąd (pozycja w `ranking`). `GameDefinition.places` mini-gier nietknięte.
- TDD `53201b6`: 5 testów RED przed poprawką; JSON wyniku z `places` przechodzi round-trip, wynik Klasycznego nie ma pola.
- Typy, 2022 testów gier i 45 serwera, build web PASS.
- Do odbioru UI: Szybki Chińczyk na 3-4 osoby z remisem dalszych miejsc i turniej zakończony remisem po dogrywce (numer 1. przy obu).

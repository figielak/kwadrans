---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 44
status: complete
completed: 2026-10-31
packages: [P4-048]
---

# 05-44 SUMMARY: P4-048

- `ScoreTable` (D4-068 A): drugi wspólny wzorzec wyników w ui.tsx. Quiz `Results` (Kolor liter, Liczenie, Inny element, Obrót, Literówka, Dziesiątki, Stój!) i Refleks go używają; Refleks dostał „(ty)” i miejsca z remisem po końcu, wykres reakcji jako szczegół pod tabelą. Komparatory i formaty bez zmian.
- `RoundTable` (D4-069 A): opcjonalny wiersz celów (`goal`), zapis komórki z rundą i graczem (`format`), własny kolor bez wyróżniania najlepszego (`tone`), własny podpis (`caption`) i wynik w wierszu gracza (`score`). Przytrzymaj (cel, znak), Balon (wytrzymałość, pęknięcia), Policz kropki i Kąt (prawdziwa wartość, pomyłka ze znakiem), Który rok? (rok, pomyłka ze znakiem, wydarzenia pod tabelą) przeszły na wspólną tabelę. „bez odpowiedzi” tylko w tabelach bez kolumny wyniku (ukryte rundy rywala w trakcie nie są brakiem odpowiedzi).
- Odcień zostaje z parami próbek jako nazwany wyjątek (ZASADY §4, DESIGN §6).
- TDD `274960c` (11 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 77 web, build PASS.
- Do odbioru UI (U04): 360 px przy 6 graczach i 10 rundach (Policz kropki, Kąt, Który rok?, Balon), obserwator (`me=""`), remis, stary detail rekordowej partii. Odbiór przeglądarkowy nie był wykonany w tej sesji.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 42
status: complete
completed: 2026-10-31
packages: [P4-045]
---

# 05-42 SUMMARY: P4-045

- Zaznaczenie na czas (D4-101 A): już było bez przejścia; Dziesiątki dostały wspólny wzór (pierścień 2 px w kolorze gracza zamiast tła 25%) i `aria-pressed`, Sudoku `aria-pressed`. Chwila zliczania dotknięcia bez zmian.
- Okno z dotyku (D4-102 A): okno pola w Kampus Tour już pojawiało się od razu; zapisane w ZASADY §5, `card-in` tylko dla okien ze stanu gry.
- Błysk trafienia (D4-104 A): w Quiz.tsx (Kolor liter, Liczenie, Inny element, Obrót, Literówka) trafienie błyska licznikiem trafień/punktów, nie przyciskiem nowego pytania; pomyłka dalej `tile-miss` na dotkniętym przycisku. Kara 1 s i długość rundy bez zmian. Dziesiątki zostawiają błysk na polach trafionej pary (miejsce dokonanej odpowiedzi).
- TDD `0dd3706` (4 testy RED). Typy, 2268 gier (1 SKIP), 45 serwera, 57 web, build PASS.
- Do odbioru UI: Inny element przy wzroście siatki, szybkie podwójne dotknięcie w quizie, zaznaczenie w Dziesiątkach, okno pola w Kampus Tour. Odbiór przeglądarkowy nie był wykonany w tej sesji.

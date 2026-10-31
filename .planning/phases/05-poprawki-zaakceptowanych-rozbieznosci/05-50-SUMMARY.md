---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 50
status: complete
completed: 2026-10-31
packages: [P4-057]
---

# 05-50 SUMMARY: P4-057

- `liczenie.ts`: `setup` daje 50 potasowanych czwórek rodzajów (+, −, ×, :), `problem(rng, kind)` losuje działanie danego rodzaju; działanie z wynikiem równym `a` albo `b` jest losowane od nowa w tym samym rodzaju. Zakresy liczb i złe odpowiedzi bez zmian.
- F4-046 domknięte: test udziału rodzajów z P4-031 znowu działa (50/50/50/50), P4-031 ma 20/20 części odebranych.
- Wynik, walidacja i ekran (`Quiz.tsx`) bez zmian; dawne partie i rekordy bez przeliczania (ZG4-v1 §3.2).
- TDD `7205b92` (2 testy RED). W implementacji poprawione tylko sprawdzenie nowego testu: wymagało dodatniej poprawnej odpowiedzi, a zasady dopuszczają 0 przy odejmowaniu (33 − 33); złe odpowiedzi nadal muszą być dodatnie. Typy, testy gier, serwera i web PASS.
- Do odbioru: partia Liczenia w /dev (solo i 6 osób), rekord i turniej.

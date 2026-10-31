---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 52
status: complete
completed: 2026-10-31
packages: [P4-059]
---

# 05-52 SUMMARY: P4-059

- `w-pamieci.ts`: `chain` daje dokładnie floor(n/3) mnożeń (0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4 w rundach 1-12) na potasowanych miejscach; reszta to + albo − po równo, krok poza 1-99 losowany od nowa. Gdy przed mnożeniem wartość przekracza 49, cały ciąg (z tymi samymi miejscami mnożeń) losuje się od nowa.
- Pętla generatora: 10 000 seedów, 120 000 ciągów, 243 429 podejść (średnio 2 na ciąg), najgorsza partia ok. 2000 wywołań `rng`; 10 000 setupów w ok. 0,35 s. Bez zawieszenia.
- Kształt stanu, wynik, walidacja, tie (H-014 bez zmian) i ekran bez zmian; dawne partie i rekordy bez przeliczania (ZG4-v1 §3.2).
- TDD `1cb0e49` (1 test RED), testy bez zmian w implementacji. Typy, testy gier, serwera i web, build PASS.
- Nieodebrane: P11 (wpływ stałej liczby mnożeń na ludzi) zgodnie z ZG4-v1 pozostaje warunkiem odbioru wpływu; do tego partia W pamięci w /dev (solo i 6 osób), rekord i turniej.

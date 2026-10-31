---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 53
status: complete
completed: 2026-10-31
packages: [P4-060]
---

# 05-53 SUMMARY: P4-060

- `balon.ts`: `limits` = potasowany komplet 11, 12, …, 20 (suma 155) zamiast `withSum` 1-30. `MIN_SAFE` 11, `MAX_SAFE` 20, więc walidacja przyjmuje 0-21 stuknięć, a balon na ekranie osiąga pełny rozmiar po 20 stuknięciach.
- Strategie stop na 1000 seedów: stop po 10 zawsze 100 pkt i 0 pękniętych, stop po 15 zawsze 90 pkt i 4 pęknięte. Wynik, tie (pęknięte), timeout (0 pkt, 10 pękniętych) i progress bez zmian.
- Skutek dla gracza: pierwsze 10 stuknięć w każdym balonie jest bezpieczne, a kto liczy wytrzymałości, zna ostatni balon. To akceptowany koszt kompletu (D4-028, FINAL-APPROVAL).
- Dawne partie (1-30) i rekordy bez przeliczania; tabela końcowa starej rekordowej partii rysuje się z jej stanu.
- TDD `51e3625` (3 testy RED; testy zakresu 1-30 i walidacji 31 poprawione razem z zasadą). Typy, testy gier, serwera i web, build PASS.
- Do odbioru: partia 10 balonów w /dev (solo i 6 osób), rekord, turniej, stara rekordowa partia na ekranie „Rekordy”.

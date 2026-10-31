---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 37
status: complete
completed: 2026-10-31
packages: [P4-039]
---

# 05-37 SUMMARY: P4-039

- Wybór kulek przeniesiony z dotyku planszy (najbliższa kulka do 2 promieni) na panel 8 przycisków `.btn` min. 48 px w siatce 4×2; `aria-pressed`, `aria-label`, klawiatura z natury przycisków; poza fazą wskazywania przyciski wyłączone.
- Numery 1-8 na kulkach tylko po zatrzymaniu (pick i reveal), z `labelOrder` według końcowej pozycji; w show/move brak numerów. Numer nie zależy od indeksu stanu, więc nie zdradza celów (test z permutacją indeksów).
- Plansza: `max-w-[calc(100dvh-26rem)]` zamiast 19rem, żeby panel (ok. 104 px) zmieścił się na 640 px; generator, GAP=0,14, prędkości, 8 kulek/3 cele, punktacja, ruch `result` i stary detail bez zmian.
- TDD `05a0dfe`: 3 testy RED przed wdrożeniem.
- Typy, 2268 testów gier (1 SKIP), 45 serwera, 19 web, build PASS.
- Do odbioru: 360×640 i prawdziwy telefon (U12/U13): plansza, panel i status bez przewijania, bliskie kulki z czytelnymi numerami.

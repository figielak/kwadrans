---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 06
subsystem: games
tags: [audyt, balans, mini-gry, trafienia, quiz]

requires: ["03-01", "03-02"]
provides:
  - "03-06-FINDINGS.md: 9 sekcji (Kolor liter, Liczenie, Inny element, Obrót, Literówka, Dziesiątki, Schulte, Sudoku, Zakupy), quiz.ts opisany raz"
affects: [03-09]

actuals:
  tasks: 9
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Liczby z 03-01-CHECKS.md, limit i progi z 03-02-BASELINE.md; wpisy B-* z pewnością W / Z / A i rekomendacją"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-06-FINDINGS.md
  modified: []

key-decisions:
  - "Zakupy: T = 63 s przy L = 60 s (F1:ZK1 potwierdzony, wysoka) i sufit 10 osiągalny, ranking mierzy szybkość klikania (B-ZK2)"
  - "Liczenie: rodzaje działań 1-21 na 40, ok. 13% różnicy (B-LC1)"
  - "Dziesiątki: 4-20 par na planszy (B-DZ1), Sudoku: 1-7 pól od razu (B-SU1), Obrót: kąty i lustra bez kompletów (B-OB1)"
  - "tie-zaokraglenie: waga niska, zostawić"

requirements-completed: []

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 06: mini-gry na trafienia Summary

**Wysoki: limit Zakupów bez zapasu. Średnie: trudność z losowania w Liczeniu, Obrocie, Dziesiątkach i Sudoku oraz sufit Zakupów. Quizy mają limit z dużym zapasem, a pula 200 plansz jest nie do wyczerpania.**

---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 04
subsystem: games
tags: [audyt, balans, gry-glowne, przewaga-pierwszego, symulacja]

requires: ["03-01", "03-02"]
provides:
  - "03-04-FINDINGS.md: przewaga kolejności, tryby i limity dla 7 gier głównych i Turnieju, symulacje botów (Labirynt, Statki, Chińczyk, Memory, Turniej), B-GO1, B-LB1, B-ST1, B-ME1, B-PM1, B-PM2, B-KA1, B-TU1"
affects: [03-09]

actuals:
  tasks: 8
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Liczby z 03-01-CHECKS.md, limit i progi z 03-02-BASELINE.md; wpisy B-* z pewnością W / Z / A i rekomendacją"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-04-FINDINGS.md
  modified: []

key-decisions:
  - "Labirynt 3-4 os.: ostatni w kolejności wygrywa 35-54% u botów (B-LB1, średnia, do partii)"
  - "Labirynt 2 os. Klasyczny: zaczynający 58%, Szybki równo"
  - "Statki: zaczynający 51-54,5%, Chińczyk równo, F2:C8 zamknięte (1 s z 20 s)"
  - "Państwa-miasta: głosowanie 45 s przy 6 os. to 1,5 s na odpowiedź (B-PM1, średnia); na Ł nie ma państwa"
  - "Turniej 2 os. i 8 gier: dogrywka w 27,5% (B-TU1)"

requirements-completed: []

duration: 60min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 04: gry główne i Turniej Summary

**Wysokich wpisów brak. Średnie: kolejność w Labiryncie przy 3-4 osobach i limit głosowania w Państwach-miastach przy 6 osobach. Gomoku jest teoretycznie wygrane dla zaczynającego; rotacja przy rewanżu kompensuje, do zapisania w partiach.**

---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 07
subsystem: games
tags: [audyt, balans, mini-gry, odchylka, limit]

requires: ["03-01", "03-02"]
provides:
  - "03-07-FINDINGS.md: 9 sekcji (Narysuj koło, Odcień, Policz kropki, Kąt, Który rok?, Środek, Mapa, Tort, Nożyczki), Szacowanie.tsx opisany raz"
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
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-07-FINDINGS.md
  modified: []

key-decisions:
  - "Środek (F1:SR1) i Tort: T 63 s / 120,5 s przy wolnym graczu, wysoka wg modelu, do potwierdzenia pomiarem"
  - "Odcień: czułość ΔE 1,35× między partiami (B-KR1)"
  - "Kąt: suma kątów 421-1378°, do partii (B-KAT1)"
  - "Który rok?: zapas 5%, ale T twarde (B-RK2 niska)"

requirements-completed: []

duration: 40min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 07: mini-gry z odchyłką w rundach Summary

**Wysokie (zależne od założenia o czasie celowania): limit Środka 60 s i Tortu 120 s. Średnie: losowanie celów w Odcieniu i Kącie. Koło, Kropki, Mapa, Nożyczki zgodne.**

---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 08
subsystem: games
tags: [audyt, balans, mini-gry, pierwsza-pomylka, sufit]

requires: ["03-01", "03-02"]
provides:
  - "03-08-FINDINGS.md: 4 sekcje (Kubki, Śledzenie, Wieża, W pamięci) z krzywymi, symulacja Wieży z szumem czasu"
affects: [03-09]

actuals:
  tasks: 4
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Liczby z 03-01-CHECKS.md, limit i progi z 03-02-BASELINE.md; wpisy B-* z pewnością W / Z / A i rekomendacją"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-08-FINDINGS.md
  modified: []

key-decisions:
  - "Wieża: przy σ 20 ms 94,5% partii kończy na 30 piętrach, sufit za nisko (B-WZ1)"
  - "W pamięci: 12 rund prawdopodobnie osiągalne, komplet = remis całkowity (B-WP2, wysoka jeśli 12 pada)"
  - "Śledzenie: mijanki 11-138 w rundzie 1 (B-SL1) i zapas limitu 4,5% (B-SL2)"
  - "Kubki: sufit 20 bez tie, do partii (B-KB1)"

requirements-completed: []

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 08: mini-gry do pierwszej pomyłki Summary

**Krzywe zgodne z progami ludzkimi, ale kończą się za wcześnie: Wieża i prawdopodobnie W pamięci mają sufit w zasięgu najlepszych. Średnie: losowanie rund w Śledzeniu i mnożeń w W pamięci, zapas limitu Śledzenia.**

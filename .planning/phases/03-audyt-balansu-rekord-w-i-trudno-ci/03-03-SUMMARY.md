---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 03
subsystem: games
tags: [audyt, balans, kampus-tour, ekonomia, symulacja]

requires: ["03-01", "03-02"]
provides:
  - "03-03-FINDINGS.md: tabela 8 grup, symulacja 6000 partii (2-4 os., dwie strategie), długość partii, K2, K11, U2/KA1, odpowiedzi na KONCEPT §9, B-KT1..B-KT6"
affects: [03-09]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Liczby z 03-01-CHECKS.md, limit i progi z 03-02-BASELINE.md; wpisy B-* z pewnością W / Z / A i rekomendacją"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-03-FINDINGS.md
  modified: []

key-decisions:
  - "Premia +20 zł za miejsce przeważa przewagę ruchu: ostatni gracz wygrywa 31% przy 4 os. (B-KT1, średnia)"
  - "Monopol rzadki (0,2-1%), ale wszystkie 33 przez grupę dwupolową (B-KT2)"
  - "MPK daje 30-38% kompletów (B-KT3, średnia)"
  - "K2 i K11 rzadkie, zostawić i dopisać w ZASADY-GIER"
  - "Każdy ruch odnawia 60 s, marsz 3,3 s nie zagraża limitowi"

requirements-completed: []

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 03: Kampus Tour Summary

**Partie botów kończą się limitem 20 rund w 93-99%, komplety w 65-80% partii. Do zmiany po partiach: premia za miejsce (ostatni wygrywa najczęściej) i Bilet MPK (1/3 kompletów). Monopol pada tylko przez grupy dwupolowe. Partia 4 graczy szacunkowo 26-41 min.**

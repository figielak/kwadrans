---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 02
subsystem: games
tags: [audyt, balans, limit-tury, progi, wzorce]

requires: []
provides:
  - "03-02-BASELINE.md: model czasu partii z działaniem limitu w LobbyRoom.ts, tabela decyzji wolnego gracza, wzór „limit ucina od X” (Sekwencja), progi ludzkie z etykietami, wzorce withSum / kompletów / tie, szablon sekcji z przykładem Balonu"
affects: [03-03, 03-04, 03-05, 03-06, 03-07, 03-08]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Wymagany limit: L ≥ 1,2·T i L ≥ T + 10 s, T = czasy stałe + decyzje wolnego gracza + 3 s sieci"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-02-BASELINE.md
  modified: []

key-decisions:
  - "Limit mini-gier bez turn() odnawia się, gdy ktoś odda wynik (LobbyRoom.ts:375-376), a w 7 grach ze stałym key nie odnawia się wcale; ocena zapasu liczy więc przypadek solo albo ostatniego klikającego Start"
  - "Sekwencja: przy 0,35-0,7 s na kolor limit 300 s ucina serię 21-24, z zapasem 20% najdłuższa seria to 18-21"
  - "withSum wyrównuje oczekiwany błąd tylko, gdy błąd rośnie liniowo z celem (Weber); dla kropek i czasów to wystarcza, dla strategii w Balonie nie"
  - "Wszystkie progi ludzkie mają etykietę założenia; plany gier mogą je poprawić i to opisują"

requirements-completed: []

coverage:
  - id: D1
    description: "Model czasu z plik:linia w LobbyRoom.ts"
    requirement: DIFF-02
    verification:
      - kind: other
        ref: "03-02-BASELINE.md §1"
        status: pass
    human_judgment: false
  - id: D2
    description: "Progi dla każdego rodzaju progresji z DIFF-01 i sufitu quizów"
    requirement: DIFF-01
    verification:
      - kind: other
        ref: "03-02-BASELINE.md §2"
        status: pass
    human_judgment: true
  - id: D3
    description: "Wzorce z plik:linia i szablon sekcji"
    requirement: REC-02
    verification:
      - kind: other
        ref: "03-02-BASELINE.md §3, §4"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 02: model czasu, progi ludzkie, wzorce Summary

**Fala 2 dostaje jeden wzór limitu (L ≥ 1,2·T i ≥ T + 10 s), tabelę decyzji wolnego gracza i progi ludzkie. Najważniejsze ustalenie poboczne: w mini-grach bez `turn()` oddanie wyniku
przez jednego gracza daje pozostałym pełny limit od nowa, a w siedmiu grach ze stałym kluczem limit jest jeden dla wszystkich, więc ta sama gra wieloosobowo daje wolnemu graczowi różnie dużo czasu
(do oceny w 03-05..03-08, prawdopodobnie wpis niski).**

---
phase: 03-audyt-balansu-rekord-w-i-trudno-ci
plan: 01
subsystem: games
tags: [audyt, balans, withSum, symulacja, rekordy]

requires: []
provides:
  - "03-01-CHECKS.md: tabela stałych 30 mini-gier (rundy, limity, czasy klienta, losowanie, record/tie, timeoutMove, progresja z plik:linia), symulacja setup na 1000 seedów (66 miar), krzywa Kubków, stan lokalnej bazy"
affects: [03-05, 03-06, 03-07, 03-08, 03-09]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty sim.ts i db.ts w scratchpadzie (Node 24, import z packages/games/src, node:sqlite readOnly); treść w załączniku CHECKS"

key-files:
  created:
    - .planning/phases/03-audyt-balansu-rekord-w-i-trudno-ci/03-01-CHECKS.md
  modified: []

key-decisions:
  - "Lokalna games.db jest prawie pusta (9 wyników, tylko Za zasłoną): remisy na szczycie i sufit fala 2 ocenia ze stałych i progów 03-02, nie z bazy"
  - "Dziesiątki: liczba par na planszy zależy od wyborów gracza, więc symulacja to jedna strategia (pierwsza znaleziona para), nie cecha partii"
  - "Tort, Narysuj koło i Zakupy oznaczone jako bez losowania wpływającego na wynik (Zakupy: podobieństwo emoji to założenie do partii)"

requirements-completed: []

coverage:
  - id: D1
    description: "Tabela stałych dla 30 mini-gier w czterech grupach"
    requirement: REC-01
    verification:
      - kind: other
        ref: "grep -c '^| `' 03-01-CHECKS.md (97 wierszy tabel)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Symulacja setup, wszystkie gry z F1:Z3 mają miarę trudności (Stoper, Rytm, Liczenie, Odcień, Kąt, W pamięci)"
    requirement: REC-01
    verification:
      - kind: other
        ref: "03-01-CHECKS.md §2"
        status: pass
    human_judgment: false
  - id: D3
    description: "Statystyki z kopii games.db, oryginał bez zmian"
    requirement: REC-02
    verification:
      - kind: other
        ref: "03-01-CHECKS.md §3; mtime oryginału 1792318880 przed i po"
        status: pass
    human_judgment: false

duration: 35min
completed: 2026-10-24
status: complete
---

# Phase 3 Plan 01: stałe, symulacja `setup` i baza wyników Summary

**Stałą sumę mają Stój!, Przytrzymaj, Za zasłoną, Balon, Kolor liter, Inny element, Policz kropki, Tort i liczba działań w W pamięci. Rozrzut rodzaju albo celu między partiami
mierzy się w Stoperze (6-14 s), Rytmie (462-857 ms), Liczeniu (każdy rodzaj 1-21 na 40), Obrocie (lustro 8-29 na 40), Literówce (rodzaj błędu 6-25 na 45),
W pamięci (15-35 mnożeń), Kącie (suma 421-1378°), Odcieniu (czułość 47-86 ΔE), Sudoku (1-7 pól z jednym kandydatem) i Dziesiątkach. Lokalna baza nie ma danych dla 29 mini-gier.**

## Odchylenia od planu

- Śledzenie symulowane na 300 seedach zamiast 1000 (liczy położenia 8 kulek w 51 chwilach dla 3 rund); rozrzut miary stabilny.
- Bazy produkcyjnej nie pobierano (D-11).

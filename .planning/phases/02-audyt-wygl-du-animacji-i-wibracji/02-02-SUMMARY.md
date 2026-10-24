---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 02
subsystem: ui
tags: [audyt, index.css, ui.tsx, keyframes, prefers-reduced-motion, wzorce]

requires: []
provides:
  - "02-02-BASELINE.md: ocena tokenów, klas, 14 keyframes i reguły reduced-motion z index.css oraz każdego eksportu ui.tsx (B-01..B-76), lista W-01..W-18 do odhaczenia w grach, lista rozbieżności platformy z wagami"
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-09, 02-10, 02-11]

actuals:
  tasks: 2
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Dowody z grepa po apps/web/src (polecenia w załączniku A BASELINE), bez plików skryptów"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-02-BASELINE.md
  modified: []

key-decisions:
  - "Intro wymusza propsy time/task/score/preview typem (ui.tsx:268), więc plany 02-07..02-10 sprawdzają treść punktów i obecność samego <Intro, nie obecność punktów"
  - "Ruch będący treścią gry (Kubki, Śledzenie, Za zasłoną, Wieża) to luka w ZASADY.md §5 (B-53, niska), a nie rozbieżność gier"
  - "Klucze [zbiorcze: …] robocze, bo 02-01-CHECKS.md nie istniał w chwili pisania; 02-11 dopasowuje je do kluczy z CHECKS"
  - "360×640 sprawdzone statycznie (szerokości z klas i szacunek szerokości znaków mono), bez przeglądarki"

requirements-completed: []

coverage:
  - id: D1
    description: "index.css: 13 tokenów DESIGN.md §2 + accent-hover, klasy .tile/.label/.btn/.btn-primary/.btn-ghost/.field/.swatch-range/.landscape, poświata, 14 keyframes, view-transition Statków, animacje Tailwinda, reguła prefers-reduced-motion"
    requirement: UI-01
    verification:
      - kind: other
        ref: "grep -n '## index.css' 02-02-BASELINE.md; każdy @keyframes ma B-35..B-48"
        status: pass
    human_judgment: false
  - id: D2
    description: "ui.tsx: punkt dla każdego eksportu (Send, Screen, TopBar, PlayerDots, GameDot/GameDots, Scores, Stats, tenth, grade, RoundTable, StickyBar, IntroContext, Intro) i lista W-01..W-18"
    requirement: UI-02
    verification:
      - kind: other
        ref: "grep -n '## ui.tsx' 02-02-BASELINE.md; B-54..B-76"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-10-23
status: complete
---

# Phase 2 Plan 02: wzorce platformy (index.css, ui.tsx) Summary

**Wzorce platformy są w większości zgodne z `ZASADY.md` §4/§5 i `DESIGN.md`; brak rozbieżności wysokich, trzy średnie (suwak `.swatch-range` 36 px, kolory `#fff`/`#000` jego uchwytu, `ring-pulse` 1 s vs 1,2 s) i około dwudziestu niskich (głównie keyframes spoza listy §5 i nieaktualne komentarze).**

## Accomplishments

- Tokeny: wszystkie 13 z `DESIGN.md` §2 mają w `@theme` tę samą wartość; `accent-hover` jest w kodzie, a nie ma go w tabeli (B-15).
- Klasy: `.btn` 48 px, 180 ms, focus 2 px `accent` z odsunięciem 2 px, `disabled` 40%, `.field` z błędem w `warning`: zgodne (B-22..B-30).
- Poświata nieruchoma, 16%, 60vmax (B-21).
- Katalog 14 keyframes (B-35..B-48) z czasami użyć; 6 spoza listy §5 (`line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`) jako niskie z propozycją dopisania; do tego `animate-pulse`/`animate-ping` Tailwinda (B-50).
- Reguła reduced-motion (B-51): zeruje `animation-duration`, `transition-duration`, ustawia 1 iterację; obejmuje animacje i przejścia CSS, nie obejmuje JS, `::view-transition-*` (Statki obsługują w JS) ani `scroll-behavior` (nieużywany). Skutki uboczne: podgląd `Intro` staje na stanie bazowym (B-52); brak wyjątku na ruch będący treścią gry (B-53).
- `ui.tsx`: każdy eksport ma punkt (B-54..B-76); `GameDots` pokrywa wszystkie stany z `DESIGN.md` §4; `Intro` wymusza `time`/`task`/`score`/`preview` typem; `ui.tsx` nie wibruje.
- Lista W-01..W-18 dla planów fali 2.

## Deviations from Plan

- `02-01-CHECKS.md` nie istniał w chwili pisania (plan 02-01 szedł równolegle), więc klucze `[zbiorcze: …]` są robocze, a dowody z grepa pochodzą z własnych poleceń (załącznik A BASELINE), nie z wierszy CHECKS. 02-11 dopasowuje klucze przy scalaniu.
- Dodano punkty spoza listy z planu, bo dotyczą tych samych plików: `.swatch-range` i `.landscape`, `::view-transition-group` Statków, animacje Tailwinda, brak `color-scheme: dark`, brak wspólnej klasy akcji w kolorze gracza.

## Verification

- `grep -n "## index.css"` → linia 14; `grep -n "## ui.tsx"` → linia 100.
- Każdy z 14 `@keyframes` ma punkt (B-35..B-48); każdy token z `DESIGN.md` §2 ma ocenę (B-01..B-14); każdy eksport `ui.tsx` ma punkt (B-54..B-76); jest lista „Wzorce do sprawdzenia w grach”.
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0; brak em-dashy w BASELINE; żadnego pliku skryptu w repo ani w scratchpadzie (wystarczyły polecenia grep).

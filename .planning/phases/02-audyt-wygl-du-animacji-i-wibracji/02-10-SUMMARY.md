---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 10
subsystem: web
tags: [audyt, mini-gry, kubki, sledzenie, wieza, w-pamieci, wygląd, animacje, wibracje, reduced-motion]

requires: ["02-01", "02-02"]
provides:
  - "02-10-FINDINGS.md: sekcje 4 mini-gier do pierwszej pomyłki, każda z Wyglądem, Tekstami, Animacjami i Sytuacjami; wpisy KB1-KB2, SL1-SL3, WZ1-WZ5, WP1-WP4, lista odstępstw i tabele Sytuacje dla macierzy 02-11"
affects: [02-11]

actuals:
  tasks: 4
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Sprawdzenie statyczne bez skryptów: lektura plików ekranów i stałych zasad, wysokość 360×640 liczona z klas (`max-w-[calc(100dvh-Nrem)]`, `Stats`, nagłówek `Game.tsx`), dowody z 02-01-CHECKS.md i odsyłacze do B-xx / W-xx z 02-02-BASELINE.md"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-10-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-10-SUMMARY.md
  modified: []

key-decisions:
  - "Ruch z requestAnimationFrame w Kubkach, Śledzeniu i Wieży bez reducedMotion na liście odstępstw z odsyłaczem do B-53; wszystkie trzy gry są grywalne przy reduced motion"
  - "Wskazanie nie zależy od klatki: każda gra liczy wynik z danych i wzoru serwera, nie z DOM; brak wpisów wysokich"
  - "WP3 (W pamięci czeka na „Wyniki” bez limitu, wynik niewysłany, timeoutMove po 300 s daje 0 rund) jako średnia; ryzyko utraty wyniku do potwierdzenia w fazie 4"
  - "WZ1: werdykt Wieży w float-up z forwards znika przy reduced motion (dotyczy też Balonu i „+1”), decyzja platformy"
  - "Nowe klucze zbiorcze: `kolor-jedyny-sygnal`, `koniec-po-pomylce`, `float-up-reduced-motion`, `pomiar-timestamp`, `sytuacja-trafienie`"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd 4 gier: tokeny, akcent, kolor jako jedyny sygnał, pola dotykowe, touch-none / onPointerDown, 360×640"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura Kubki.tsx, Sledzenie.tsx, Wieza.tsx, WPamieci.tsx; 02-01-CHECKS.md §1-§6; wysokości statyczne (D-09)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Teksty, liczby, Intro, Stats / Scores, dostępność"
    requirement: UI-05
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §7-§10a; W-01..W-18 z 02-02-BASELINE.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "Każdy setTimeout / requestAnimationFrame, keyframes, przejście i navigator.vibrate w 4 plikach z oceną; reduced motion; niezależność wskazania od klatki"
    requirement: ANIM-02
    verification:
      - kind: other
        ref: "tabele „Animacje i wibracje” w 02-10-FINDINGS.md; 02-01-CHECKS.md §11a-§15"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 10: mini-gry do pierwszej pomyłki Summary

**Cztery gry (Trzy kubki, Śledzenie, Wieża, W pamięci) nie mają rozbieżności wysokich: wskazanie i pomiar liczą się z danych i wzoru serwera, nie z klatki animacji, pola gry na czas mają `touch-none select-none` i `onPointerDown`, a wszystkie ekrany mieszczą się statycznie w 640 px (najwyżej około 578 px w Wieży). Ruch z `requestAnimationFrame` bez `reducedMotion` to świadome odstępstwo (B-53), a gry zostają grywalne przy reduced motion. Najważniejsze średnie: cele w Śledzeniu wyróżnione tylko kolorem (SL1) i W pamięci, która po pomyłce trzyma wynik do dotknięcia „Wyniki” (WP3).**

## Accomplishments

- Sekcje 4 gier z podsekcjami Wygląd, Teksty, Animacje, Sytuacje; każdy timer, keyframes, przejście i wibracja oceniona w tabeli (zgodne albo wpis).
- Sprawdzenie, czy ponowny render (postęp i wyniki innych graczy) przerywa ruch: nie, bo pozycje z JS nie mają odpowiednika zmieniającego się w wirtualnym DOM.
- Tabele Sytuacje dla macierzy 02-11 (trafienie, pomyłka, odsłona, koniec rundy i partii).

## Wpisy (szczegóły w 02-10-FINDINGS.md)

- Wysokie: brak.
- Średnie (4): SL1 (`kolor-jedyny-sygnal`), SL2 (`dotyk-48`), WP2 (`slowa`), WP3 (`koniec-po-pomylce`).
- Niskie (10): KB1 (`transition-domyslny`), KB2, SL3, WZ5 (`brak-w-tabeli-5`), WZ1 (`float-up-reduced-motion`), WZ2 (`pomiar-timestamp`), WZ3 (`promien`), WZ4 (`slowa`), WP1 (`czas-pojawienia`), WP4 (`sytuacja-trafienie`).
- Odstępstwa z powodem: ruch z JS w Kubkach, Śledzeniu i Wieży (B-53), kształty jako treść gry.

## Deviations from Plan

- Brak. Zadania 1-4 wykonane po kolei w jednym pliku; wspólne ustalenia czterech gier (reduced motion, niezależność od klatki, wibracje) opisane raz na górze 02-10-FINDINGS.md. Praca przerwana limitem API i wznowiona bez zmian w zakresie.

## Verification

- `grep -n "^## " 02-10-FINDINGS.md` → Trzy kubki, Śledzenie, Wieża, W pamięci, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Bez skryptów w repo i w scratchpadzie (sprawdzenie przez lekturę i grep).

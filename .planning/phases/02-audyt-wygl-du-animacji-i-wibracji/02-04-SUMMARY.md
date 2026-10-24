---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 04
subsystem: web
tags: [audyt, wygląd, animacje, wibracje, kampus-tour, kampus-summary, 360x640]

requires: ["02-01", "02-02"]
provides:
  - "02-04-FINDINGS.md: sekcje Kampus Tour: plansza i nagłówek, Kampus Tour: animacje, KampusSummary, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje; rachunek sceny na 360×640; wpisy KT1-KT21, KA1-KA6, KS1-KS6; lista odstępstw z powodem"
affects: [02-11]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Rachunek sceny statycznie z kodu: STAGE_H 390, szerokość 800-1000, zoom; na 360×640 skala 0,8, pole planszy około 35 px, nakładka środka 170 px sceny"
    - "Porównanie hooków ruchu z wzorem Chinczyk.tsx (useWalk, useRolling) zamiast oceny od zera"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-04-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-04-SUMMARY.md
  modified: []

key-decisions:
  - "KT10 (treść środka planszy wyższa niż nakładka z overflow-hidden, ucina licznik i log) jako wysoka, ale oznaczona do potwierdzenia w przeglądarce: szacunek statyczny z wysokości linii"
  - "KA1 (przyciski ukryte do dojścia pionka, do 3,3 s) jako wysoka wg litery D-07, z propozycją wyjątku w ZASADY.md §5 obok Statków; zamysł opisany w komentarzu kodu"
  - "Własny nagłówek Kampus Tour sprawdzony element po elemencie wobec Game.tsx: brak koloru gracza na pasku limitu (KT12), inne słowa (KT13), brak wygranych partii i „Oglądasz” (KT14), koniec bez title-pop (KA6)"
  - "Pola planszy (35 px), cienie 2.5D, promienie 1-4 px i kolory rogów to wpisy, nie odstępstwa: wyjątek DESIGN.md §6 obejmuje tylko grupy pól, okna, pionki i przyciski budowy"
  - "Nowe klucze zbiorcze: kolor-jedyny-sygnal, podpis-label, float-up-reduced, koniec-partii"

requirements-completed: [UI-01, UI-02, UI-03, UI-04, UI-05, ANIM-01, ANIM-02, ANIM-03]

coverage:
  - id: D1
    description: "Kampus Tour: plansza i nagłówek (kolory, akcent, pola dotykowe, 360×640, teksty, nagłówek własny wobec wspólnego)"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura KampusTour.tsx i Game.tsx:82-97; 02-01-CHECKS.md sekcje 1-9 (wiersze KampusTour.tsx); B-xx/W-xx z 02-02-BASELINE.md"
        status: pass
    human_judgment: true
  - id: D2
    description: "Kampus Tour: animacje (useWalk, useRolling, Dice, useFloats, keyframes, reducedMotion, wibracje, blokowanie przycisków)"
    requirement: ANIM-02
    verification:
      - kind: other
        ref: "02-01-CHECKS.md sekcje 11a, 12, 13, 15; porównanie z Chinczyk.tsx:57-95; zasady ruchu kampus-tour.ts:388-441, :565-570"
        status: pass
    human_judgment: false
  - id: D3
    description: "KampusSummary (wykres SVG, statystyki, liczby, stany, card-in)"
    requirement: UI-04
    verification:
      - kind: other
        ref: "lektura KampusSummary.tsx; 02-01-CHECKS.md wiersze KampusSummary.tsx"
        status: pass
    human_judgment: true

duration: 55min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 04: Kampus Tour i KampusSummary Summary

**Kampus Tour trzyma się wzoru kroków z Chińczyka (stan pokazywany goni docelowy, `STEP_MS` 220, `ROLL_MS` 700, `reducedMotion` i duże skoki od razu), akcje w partii są w kolorze gracza, a okna używają `card-in`. Dwa wpisy wysokie: treść środka planszy prawdopodobnie nie mieści się w nakładce 170 px i ucina licznik oraz log (szacunek statyczny, do potwierdzenia w przeglądarce), a przyciski decyzji są ukryte do dojścia pionka, czego `ZASADY.md` §5 nie przewiduje. Własny nagłówek nie przejmuje całego zakresu wspólnego (pasek limitu bez koloru gracza, brak wygranych partii i „Oglądasz”, inne słowa).**

## Accomplishments

- Rachunek sceny na 360×640 z kodu: skala 0,8, brak przewijania w poziomie, pole planszy około 35 px, tekst pól 7-8 px, nakładka środka 170 px sceny wobec około 178-250 px treści w zależności od fazy.
- Tabela „nagłówek własny wobec wspólnego” z oceną każdego elementu (`ZASADY.md` §4).
- Każdy timer (`:247`, `:269`, `:280`, `:315`), każde keyframes (`dice-tumble`, `float-up`, `set-glow`, `card-in` ×4) i przejście (`:801`) ocenione; brak `navigator.vibrate` w obu plikach (wibracja tury tylko w `Game.tsx:35`).
- Wykryte różnice wobec Chińczyka: `useRolling` wyzwalany pozycją, więc kości turlają się po kartach bez rzutu (KA2), a przeskok na Kolokwium / MPK / kartą raz idzie krokami, raz od razu (KA3).
- Trzy tabele Sytuacje dla 02-11 i lista odstępstw z powodem (układ poziomy, własny nagłówek, grupy pól, cienie okien i pionków, przyciski budowy 44 px).

## Wpisy (szczegóły w 02-04-FINDINGS.md)

- Wysokie: KT10 (ucinanie środka planszy, do potwierdzenia), KA1 (przyciski ukryte do dojścia pionka, do decyzji).
- Średnie: KT1, KT2 (`kolor-spoza-tokenow`), KT3 (`kolor-spoza-tokenow`), KT4, KT5, KT6 (`dotyk-48`), KT9 (`kolor-jedyny-sygnal`), KT12, KT13, KT15 (`slowa`), KT14, KA2, KA3, KA4, KA6 (`koniec-partii`).
- Niskie: KT7 (`cien`), KT8 (`promien`), KT11, KT16, KS4 (`liczby-mono`), KT17, KS5 (`podpis-label`), KT18 (`aria-hidden`), KT19 (`waga-ikon`), KT20 (`transition-domyslny`), KT21, KA5 (`float-up-reduced`), KS1, KS2, KS3, KS6.
- Razem: 2 wysokie, 15 średnich, 16 niskich.

## Deviations from Plan

- Plan wskazywał w Task 2 zakres `KampusTour.tsx:206-269`; ocena objęła też `useFloats` (`:304-318`) i zasady ruchu w `packages/games/src/kampus-tour.ts` (tylko odczyt), żeby ustalić, które zmiany pozycji nie wynikają z rzutu.
- Wpis o pasku limitu (KT12) wskazuje `Game.tsx:93`, bo to tam Kampus Tour dostaje licznik; poprawka dotyczy tej linii, nie pliku gry.
- Sesja została przerwana po zebraniu ustaleń, przed zapisem; plik FINDINGS powstał w całości po wznowieniu.

## Verification

- `grep -nE "^## |^### " 02-04-FINDINGS.md` → sekcje „Kampus Tour: plansza i nagłówek”, „Kampus Tour: animacje”, „KampusSummary”, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje.
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0.
- Bez przeglądarki, bez serwerów dev, bez skryptów w repo.

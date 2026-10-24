---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 05
subsystem: ui
tags: [audyt, ui, animacje, wibracje, gomoku, statki, chinczyk, labirynt, memory]

requires: ["02-01", "02-02"]
provides:
  - "02-05-FINDINGS.md: sekcje Gomoku, Statki, Chińczyk, Labirynt, Memory, każda z Wyglądem, Tekstami, Animacjami i Sytuacjami; wpisy wspólne Z1-Z4, G1-G4, S1-S7, C1-C8, L1-L6, M1-M7, lista odstępstw z powodem"
affects: [02-11]

actuals:
  tasks: 5
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Wysokość ekranu 360×640 liczona statycznie z klas Tailwinda (Screen, nagłówek Game.tsx, pigułki, plansza, StickyBar) z szacunkiem szerokości nicków; bez przeglądarki i bez skryptów"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-05-FINDINGS.md
  modified: []

key-decisions:
  - "Z1 (wysoka, `wysokosc-640`): wszystkie pięć gier w trakcie partii przekracza 640 px; główną przyczyną jest wspólny nagłówek Game.tsx z pigułkami (142-274 px), a StickyBar przykrywa dół planszy; Chińczyk, Labirynt, Memory i bitwa w Statkach to nowe przypadki spoza DESIGN.md §6"
  - "C8 (wysoka): Chińczyk wstrzymuje akcje do końca rzutu i kroków, choć ZASADY.md §5 jednocześnie zabrania blokowania i wskazuje ten plik jako wzór; do decyzji w fazie 4"
  - "Pola poniżej 48 px na gęstych planszach (G2, S2, C2, L2) jako średnia z propozycją wyjątku w DESIGN.md §6 dla ruchu z podglądem i potwierdzeniem; Labirynt robi krok bez potwierdzenia"
  - "Tryb Szybki Chińczyka (110 / 400 ms) zaliczony do odstępstw z powodem (KONCEPT.md §2.3a: „szybsze animacje”)"
  - "Nowe klucze zbiorcze: `wysokosc-640`, `kolor-gracza-jedyny-sygnal`, `animacja-po-odswiezeniu`, `czekamy-animacja`, `wibracja-zlo-od-gracza`, `aria-plansza`, `podpis-label`"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd (UI-01..UI-03): tokeny i role, akcent vs kolor gracza, akcje w partii, kolor jako jedyny sygnał, cienie i zaokrąglenia, pola dotykowe, 360×640 dla 5 gier"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura 5 plików gier i Game.tsx; wiersze 02-01-CHECKS.md §1-§6; wysokość statycznie (metoda na górze 02-05-FINDINGS.md)"
        status: pass
    human_judgment: true
  - id: D2
    description: "Teksty, liczby i dostępność (UI-04, UI-05)"
    requirement: UI-05
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §7-§9 + lektura; brak em-dashy i kropek dziesiętnych w 5 plikach"
        status: pass
    human_judgment: false
  - id: D3
    description: "Animacje i wibracje (ANIM-01..ANIM-03): każde użycie keyframes, przejście, timer JS i navigator.vibrate w 5 plikach ocenione; tabele Sytuacje dla 02-11"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §11a, §12, §13, §15; 13 użyć animacji, 5 przejść, 6 timerów, 2 wibracje, wszystkie w tabelach 02-05-FINDINGS.md"
        status: pass
    human_judgment: false

duration: ok. 60min (w dwóch częściach, przerwa na limit API)
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 05: gry główne turowe Summary

**Pięć gier głównych używa kolorów gracza i akcji `btn text-bg` zgodnie z `DESIGN.md` §5, a wszystkie animacje to keyframes z katalogu albo przejścia CSS. Najpoważniejszy problem to wysokość: każda z gier w trakcie partii przekracza 640 px (Gomoku 686, Statki do 960, Chińczyk 684-772, Labirynt w turze 742-830, Memory Średnia około 651). `DESIGN.md` §6 zna z tego tylko rozstawianie Statków i Gomoku. Drugi wpis wysokiej wagi: Chińczyk wstrzymuje akcje do końca animacji rzutu i kroków.**

## Accomplishments

- Sekcje 5 gier z czterema podsekcjami i tabelą „Sytuacje” (D-12) dla 02-11.
- Każde użycie keyframes (13), przejście (5), timer JS (6: `Chinczyk.tsx:66`, `:87`, `:100`, `Statki.tsx:73`, `:213`, `Memory.tsx:51`), `startViewTransition` (`Statki.tsx:70`) i `navigator.vibrate` (`Chinczyk.tsx:135`, `Statki.tsx:211`) ocenione: `reducedMotion` jest wszędzie, gdzie ruch idzie z JS.
- Nowe ustalenia spoza grepa z 02-01: `white` w kamieniu Gomoku (`PiecWRzedzie.tsx:71`), akcent jako „niedozwolone” w rozstawianiu Statków (S3), brak wibracji przy trafieniu w moją flotę (S7) i przy pudle w Memory (M6), dwie różne animacje „czekamy” (Z4), `animate-pulse` zamiast `ring-pulse` dla możliwych kroków w Labiryncie (L3), `stone-pop` powtarzany po odświeżeniu (Z3), licznik par bez mono w `Game.tsx:287` (M5).

## Wpisy (szczegóły w 02-05-FINDINGS.md)

- Wysokie (6): G1, S1, C1, L1, M1 (zbiorczo Z1, `wysokosc-640`), C8 (blokowanie akcji przez animację w Chińczyku).
- Średnie (15): G2, S2, C2, L2 (`dotyk-48`), G4, C4, L4, M4 (`kolor-gracza-jedyny-sygnal`), G3-kolor (`kolor-spoza-tokenow`), S3, S7 i M6 (`wibracja-zlo-od-gracza`), C3, L3 (`animate-tailwind`), Z4 (`czekamy-animacja`).
- Niskie (14): Z3, G3-cień, S4, M2 (`cien`), S4, C5 (`promien`), S5 (`podpis-label`), S6, L5 (`aria-plansza`), C6, L6, M5 (`liczby-mono`), C7, M3, M7.
- Odsyłacze do platformy bez osobnych wpisów: B-36, B-37, B-38, B-42, B-49, B-50, B-51.
- Odstępstwa z powodem: trafienie w `accent` i `SWAP_MS` w Statkach, tryb Szybki Chińczyka, emoji w Memory, odcienie OKLCH w Chińczyku.

## Do fazy 3 i 4

- Faza 4 (decyzje): wyjątek dla gęstych plansz z potwierdzeniem (48 px); wyjątek dla kroków sekwencyjnych w §5 albo akcja w trakcie animacji (C8); czy pudło to „pomyłka” (60) w Memory i Statkach; jedna animacja „czekamy”; drugi znak właściciela pionków albo wyjątek w `DESIGN.md` §6; wiersz trybu Szybkiego w tabeli §5; `set-glow` czy `stone-pop` dla świeżej pary.
- Faza 4/5: zmniejszenie nagłówka gier głównych w `Game.tsx` (wspólna przyczyna Z1) i poprawka `DESIGN.md` §6.
- Faza 3 (balans): brak ustaleń; jedyna rzecz czasowa to koszt C8 w trybie Szybkim (do około 1 s z 20 s limitu).

## Deviations from Plan

- Plan wymienia zadania osobno; wpisy wspólne kilku gier (wysokość, kolor jako jedyny sygnał, animacja po odświeżeniu, „czekamy”) opisane raz w sekcji „Wpisy wspólne dla grupy”, a sekcje gier mają krótkie odsyłacze z miejscem i pomiarem.
- M5 dotyczy kodu w `Game.tsx` (gałąź Memory), czyli zakresu 02-04; zapisany z dopiskiem do scalenia.
- Praca przerwana limitem API i dokończona w drugiej części; nic nie zostało pominięte.

## Verification

- `grep -nF "## Gomoku|## Statki|## Chińczyk|## Labirynt|## Memory"` → nagłówki :57, :115, :199, :279, :343; 20 podsekcji `###` (po 4 na grę).
- Brak em-dashy w 02-05-FINDINGS.md.
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0.
- 360×640 sprawdzono statycznie (D-09); wysokości wymagają potwierdzenia w przeglądarce, zwłaszcza Memory (przekroczenie o około 11 px).

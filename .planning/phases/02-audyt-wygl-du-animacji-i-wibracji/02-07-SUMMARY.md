---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 07
subsystem: web
tags: [audyt, mini-gry, refleks, simon, stoper, stoj, rytm, przytrzymaj, zaslona, balon, wygląd, animacje, wibracje]

requires: ["02-01", "02-02"]
provides:
  - "02-07-FINDINGS.md: sekcje 8 mini-gier na czas i reakcję, każda z Wyglądem, Tekstami, Animacjami i tabelą Sytuacje; wpisy RF1-RF4, SQ1-SQ3, SP1-SP2, SJ1-SJ2, RY1-RY3, PT1-PT4, ZS1-ZS2, BL1-BL5; lista odstępstw z powodem"
affects: [02-11]

actuals:
  tasks: 8
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Sprawdzenie statyczne bez skryptu: lektura 8 plików w całości, jeden grep dowodowy (timery, keyframes, przejścia, vibrate, pomiar, onPointer, touch/select, font-mono, toFixed) i wiersze 02-01-CHECKS.md; 360×640 liczone z klas Tailwinda"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-07-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-07-SUMMARY.md
  modified: []

key-decisions:
  - "Brak wpisów wysokiej wagi: każde pole gry na czas ma onPointerDown i touch-none select-none, bodźce bez przejść, pomiar niezależny od animacji, ukryty limit w Stoperze, Rytmie, Przytrzymaj i Za zasłoną działa (Game.tsx:210)"
  - "Pomiar z performance.now() zamiast e.timeStamp (Refleks, Stoper, Stój!) jako niska `pomiar-timestamp`: nie zależy od animacji, tylko od renderu i wątku, u wszystkich podobnie"
  - "Wibracja 30 metronomu w Rytmie na liście odstępstw (KONCEPT.md §2.4, ZASADY-GIER.md), a brak jej wiersza w tabeli §5 jako osobny wpis niski RY3 (D-13)"
  - "Własne tabele końcowe Przytrzymaj i Balonu jako średnie mimo opisu w ZASADY-GIER.md: sprzeczność z ZASADY.md §4 / DESIGN.md §5, wygrywa ZASADY.md (D-13)"
  - "En-dash w Balonie obniżony do niskiej (CHECKS sugerował średnią): to nie em-dash i ma objaśnienie w legendzie oraz aria-label"
  - "accent-fg jako ciemny tekst na kolorze treści (Sekwencja, Stój!) jako niska: wartość równa bg, efekt wizualny zerowy; 02-11 może ujednolicić z W-02"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd 8 gier: tokeny, akcent, kolor gracza, pola dotykowe, touch-none / onPointerDown, 360×640 statycznie"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura <Gra>.tsx + 02-01-CHECKS.md (tabela zbiorcza :50-91, §1, §2, §5, §6) + 02-02-BASELINE.md W-01..W-06, W-13"
        status: pass
    human_judgment: false
  - id: D2
    description: "Teksty, liczby, Intro / Preview, stany DESIGN.md §4, dostępność"
    requirement: UI-05
    verification:
      - kind: other
        ref: "lektura + 02-01-CHECKS.md §7-§10a + BASELINE B-72..B-74, W-08, W-15..W-18"
        status: pass
    human_judgment: false
  - id: D3
    description: "Każde keyframes, przejście, timer, pomiar i navigator.vibrate w 8 plikach z oceną; tabele Sytuacje"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "grep dowodowy po 8 plikach + 02-01-CHECKS.md §11a-§15 + BASELINE B-35..B-53, W-09..W-12"
        status: pass
    human_judgment: false
  - id: D4
    description: "360×640 w przeglądarce, odczucie błysków 100 ms i opóźnienie pierwszej klatki bodźca"
    requirement: UI-04
    verification:
      - kind: other
        ref: "nie wykonano (D-09: bez przeglądarki w tym planie); lista w sekcji „Do sprawdzenia w przeglądarce”"
        status: partial
    human_judgment: true

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 07: mini-gry na czas i reakcję (wygląd, animacje, wibracje) Summary

**Osiem gier spełnia wszystkie reguły o wadze wysokiej: pola na czas reagują na `onPointerDown` z `touch-none select-none`, bodźce zmieniają się bez przejścia, pomiar nie zależy od animacji (trzy nowsze gry mierzą `e.timeStamp`), a Stoper, Rytm, Przytrzymaj i Za zasłoną nie pokazują grającemu ani limitu, ani licznika. Rozbieżności to głównie brak wibracji i znaku przy pomyłce w dwóch najstarszych grach (Refleks, Sekwencja), własne tabele wyników zamiast `Scores` / `RoundTable` oraz drobiazgi typografii i dostępności.**

## Accomplishments

- Sekcja każdej z 8 gier z czterema podsekcjami i tabelą Sytuacje (pojawienie bodźca, trafienie, pomyłka, odsłona, koniec rundy i partii, moja tura) dla macierzy 02-11.
- Ocena każdego `navigator.vibrate` (3), każdego keyframes (`preview-half`, `preview-quarter`, `tile-miss`, `float-up`), przejścia (3) i timera (17 wywołań z `02-01-CHECKS.md` §13) w plikach gier.
- Potwierdzenie ukrytego limitu w `Game.tsx:208-210` i braku licznika we własnym kodzie czterech gier „na oko”.
- Ekran 360×640 policzony statycznie dla fazy gry każdej gry (od około 470 do 570 px wysokości, bez poziomego przewijania).

## Wpisy (szczegóły w 02-07-FINDINGS.md)

- Wysokie: brak.
- Średnie (7): RF1 (`wlasna-lista-wynikow`), RF3 (`brak-wibracji-pomylki`, `pomylka-bez-znaku`), SQ2 (`brak-wibracji-pomylki`), SQ3 (`pomylka-bez-znaku`), PT1 i BL1 (`wlasna-tabela-rund`), ZS2 (`dotyk-zignorowany`).
- Niskie (18): RF2, SP1, RY1, PT2 (`liczby-mono`); RF4, SP2, SJ2 (`pomiar-timestamp`); SQ1, SJ1 (`accent-fg-poza-akcentem`); RY2 (`brak-w-tabeli-5`); RY3; PT3 (`wlasny-grade`); PT4 (`jednostka-odchylki`); ZS1, BL3 (`aria-hidden`); BL2 (`podpis-label`); BL4 (`myslnik`); BL5 (`animacja-ucieta`).
- Odstępstwa z powodem: ukryty limit i brak licznika (4 gry), klik i wibracja 30 metronomu, kolory pól Sekwencji, ruch kulki bez `reducedMotion` (odsyłacz B-53), kształt balonu `rounded-[50%]`, zegar partii w Stój!.

## Deviations from Plan

- Brak w zakresie zadań. Zadania 1-8 zapisane w jednym pliku; metoda i ustalenia wspólne (ukryty limit, wibracja tury, `Intro`) opisane raz na górze, gry odsyłają.
- Praca przerwana limitem API po lekturze plików i podjęta ponownie; plik ustaleń powstał w całości po wznowieniu.
- Numery linii `ZASADY-GIER.md` w pierwszym zapisie przesunięte o jedną w kilku miejscach; poprawione i sprawdzone `sed -n` przed zakończeniem.

## Verification

- `grep -F "## <Gra>"` → po jednym nagłówku dla Refleks, Sekwencja, Stoper, Stój!, Rytm, Przytrzymaj, Za zasłoną, Balon; 32 podsekcje (8 × Wygląd, Teksty, Animacje, Sytuacje).
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Bez skryptów w repo i bez serwerów dev; 360×640 tylko statycznie.

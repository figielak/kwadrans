---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 09
subsystem: web
tags: [audyt, mini-gry, kolo, kolor, kropki, kat, rok, srodek, mapa, tort, nozyczki, szacowanie, wyglad, animacje, wibracje]

requires: ["02-01", "02-02"]
provides:
  - "02-09-FINDINGS.md: sekcje 9 mini-gier z odchyłką w rundach (każda z Wyglądem, Tekstami, Animacjami, Sytuacjami), pełna ocena wspólnego Szacowanie.tsx w sekcji Policz kropki; wpisy W9a-W9h, KO1-KO5, OD1, SZ1-SZ3, RK1, MP1, TO1"
affects: [02-11]

actuals:
  tasks: 9
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Statyczny szacunek wysokości ekranu partii na 360×640: narzut Screen + nagłówek Game.tsx (174 px w pokoju, 198 px solo) plus wysokości elementów gry z klas Tailwinda; kafle z max-w-[calc(100dvh-N rem)] liczone dla 640 px"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-09-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-09-SUMMARY.md
  modified: []

key-decisions:
  - "KO1 (płótno Koła bez zmniejszania na niskim ekranie, ok. 707 px solo) jako wysoka: jedyne kwadratowe pole w paczce bez max-w-[calc(100dvh-…)]; szacunek statyczny, do potwierdzenia w przeglądarce"
  - "SZ1 (kafel Szacowania z max-w liczonym od 100dvh przy interactive-widget=resizes-content) jako wysoka do potwierdzenia na Androidzie: klawiatura może ścisnąć kafel z polem odpowiedzi do ok. 42 px"
  - "Wibracja 60 przy ruchu ignorowanym w Środku i Nożyczkach: zgodna z ZASADY-GIER.md, więc tylko niska luka w tabeli §5 (W9h); średnia jest niespójność z Kołem, które w tej samej sytuacji nie wibruje ani nie potrząsa (W9e)"
  - "Ekran końcowy Koła (karty zamiast Scores) i kolory Odcienia na liście odstępstw z powodem (KONCEPT.md §2.4, DESIGN.md §6)"
  - "Nowe klucze zbiorcze: odslona-animacja, zignorowany-ruch, tabela-rund-wlasna, intro-time, znacznik-prawdy, wysokosc-640, liczby-poza-stats, pasek-rundy-wlasny, brak-wartosci, roundtable-szerokosc"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd 9 gier: tokeny, kolor gracza, akcent, pola dotykowe, touch-none / onPointerDown, 360×640"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura 10 plików .tsx, wiersze 02-01-CHECKS.md §1-§6, wzorce B-xx / W-xx z 02-02-BASELINE.md, szacunek wysokości w FINDINGS"
        status: pass
    human_judgment: true
  - id: D2
    description: "Teksty, liczby, Intro, stany DESIGN.md §4, dostępność"
    requirement: UI-05
    verification:
      - kind: other
        ref: "grep em-dash / toFixed / replace w 10 plikach (0 em-dashy, przecinki przez tenth albo własne replace), 02-01-CHECKS.md §7-§10a"
        status: pass
    human_judgment: false
  - id: D3
    description: "Animacje, timery, reducedMotion, pomiar czasu, wibracje; tabele Sytuacje dla 02-11"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "każde animate-[…], setTimeout / setInterval i navigator.vibrate w plikach paczki ocenione (02-01-CHECKS.md §11a, §13-§15)"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 09: mini-gry z odchyłką w rundach Summary

**Dziewięć gier trzyma się wzorców platformy: akcje w partii mają kolor gracza, liczby nad polem idą przez `Stats` (poza Odcieniem), wszystkie SVG mają `viewBox`, a pola z gestem mają `touch-none select-none` i `onPointerDown`. Wpisy wysokie są dwa, oba z ekranu 360×640 i oba do potwierdzenia w przeglądarce: płótno Koła się nie zmniejsza (ok. 707 px w grze solo), a kafel Szacowania z polem odpowiedzi może się zapaść, gdy na Androidzie otworzy się klawiatura. Największa niespójność paczki to odsłona prawdziwego wyniku: w Mapie pierścień wskakuje przez `stone-pop`, w siedmiu innych grach odsłona nie ma animacji, a w trzech czeka na przycisk z własnym słowem zamiast „Dalej”.**

## Accomplishments

- Pełna ocena wspólnego `Szacowanie.tsx` (D-02) w sekcji Policz kropki; Kąt ma w niej tylko odsyłacze i ocenę własnego rysunku.
- Statyczny model wysokości ekranu partii (narzut `Screen` i nagłówka `Game.tsx`) i tabela wysokości wszystkich faz 9 gier.
- Każde `animate-[…]`, każdy timer i oba `navigator.vibrate` (`Srodek.tsx:91`, `Nozyczki.tsx:80`) ocenione. Wszystkie `setTimeout` / `setInterval` to logika gry (czas pokazu, odsłona, limit rundy), nie animacje, więc `reducedMotion` ich nie dotyczy. Żadna gra paczki nie uzależnia pomiaru od animacji.
- Tabele Sytuacje dla 9 gier, gotowe do macierzy w 02-11.

## Wpisy (szczegóły w 02-09-FINDINGS.md)

- Wysokie: KO1 (`wysokosc-640`, Koło), SZ1 (`wysokosc-640`, Szacowanie z klawiaturą na Androidzie).
- Średnie: W9a (`odslona-animacja`), W9b (`slowa`: „Następny kolor”, „Następna runda”, „Wyniki”), W9e (`zignorowany-ruch`), W9f (`tabela-rund-wlasna`), KO2 (`kolor-spoza-tokenow`, gradient `hsl`), KO3 (`slowa`: „Nowy rekord!” w partii), OD1 (`liczby-poza-stats`), RK1 (`pasek-rundy-wlasny`), TO1 (`dotyk-48`, łapanie cięcia).
- Niskie: W9c (`slowa`), W9d (`znacznik-prawdy`), W9g (`intro-time`), W9h (`brak-w-tabeli-5`), KO4, KO5 (`brak-wartosci`), SZ2, SZ3 (`liczby-mono`), MP1 (`roundtable-szerokosc`).
- Odstępstwa z powodem: kolory Odcienia, ekran końcowy Koła, `Math.random` przy starcie suwaków Odcienia.
- Odsyłacze do platformy bez nowych wpisów: B-31, B-32 (suwaki), B-38 (`line-draw`), B-48 (`shake`), B-68.

## Do fazy 3 i 4

- Faza 4 (decyzje): jedna animacja odsłony (W9a); czy odsłona czeka na przycisk, czy przechodzi sama, i słowo „Dalej” (W9b); wiersz „ruch zignorowany” w tabeli wibracji §5 (W9h, W9e); wyjątek `DESIGN.md` §6 dla par kolorów w Odcieniu albo `RoundTable` z `children` (W9f); znaczenie punktu `time` w `Intro` (W9g); poprawka `DESIGN.md` §6 „mini-gry mieszczą się w 640 px” po pomiarze KO1.
- Faza 3 (balans): bez nowych ustaleń. Sama odsłona 1 s w Środku łączy się z limitem tury SR1 z fazy 1.
- Pomiar w przeglądarce przy 360×640: KO1 (Koło solo i w pokoju) i SZ1 (Policz kropki / Kąt z otwartą klawiaturą numeryczną na Androidzie).

## Deviations from Plan

- Plan wymienia „odsłonę 1,5 s” w Policz kropki; w kodzie i w `ZASADY-GIER.md` 1,5 s to czas pokazu kropek, a odsłona czeka na przycisk. Opisane w sekcji gry, bez wpisu.
- Praca przerwana przez limit API po lekturze kodu, dokończona w drugiej sesji bez zmiany metody.

## Verification

- `grep -n "^## " 02-09-FINDINGS.md`: sekcje Narysuj koło, Odcień, Policz kropki, Kąt, Który rok?, Środek, Mapa, Tort, Nożyczki; 36 podsekcji `###` Wygląd / Teksty / Animacje / Sytuacje (9 × 4).
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0.
- Skryptów w repo brak (wynik grepa CHECKS zapisany w scratchpadzie sesji `02-09/`).

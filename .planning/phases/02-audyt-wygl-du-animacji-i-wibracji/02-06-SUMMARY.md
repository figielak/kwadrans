---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 06
subsystem: web
tags: [audyt, wygląd, animacje, wibracje, panstwa-miasta, kalambury, turniej, 360x640]

requires: ["02-01", "02-02"]
provides:
  - "02-06-FINDINGS.md: sekcje Państwa-miasta, Kalambury i Turniej, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje; wpisy PM1-PM14, KL1-KL8, TU1-TU8 i lista odstępstw z powodem"
affects: [02-11]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Statyczny pomiar wysokości ekranu na 360×640 z klas Tailwinda (Screen 24/24 px, gap 12 px, .field/.btn 48 px, StickyBar około 68 px), bez przeglądarki i bez skryptów"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-06-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-06-SUMMARY.md
  modified: []

key-decisions:
  - "Wykładnia wagi 360×640: ekran działania pod limitem, który się nie mieści, to wysoka; ekran podsumowania z akcją w StickyBar to średnia (do ujednolicenia w 02-11)"
  - "PM1 (Państwa-miasta powyżej 640 px, znane z DESIGN.md §6) jako zwykły wpis wysokiej wagi z wysokościami zmierzonymi na nowo (D-05), nie odstępstwo"
  - "KL1 (ekran zgadującego w Kalamburach około 677-725 px) jako nowe ustalenie wysokiej wagi: BELOW_CANVAS_PX nie liczy nagłówka; do potwierdzenia w przeglądarce"
  - "KL7: wibracja „moja tura” u zgadujących przychodzi w połowie rysowania (waitingFor w half 1) i zdradza podział połówek; średnia"
  - "Przewijanie tabeli głosowania w kaflu (PM2) jako średnia, nie wysoka: strona się nie przewija i da się grać"
  - "Nowe klucze zbiorcze: rola-tokenu, kolor-jedyny-sygnal, stan-krycie, naglowek-wlasny, dalej-kolor, wibracja-fazy"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd (UI-01..03): tokeny i role, akcent i kolor gracza, pola dotykowe, touch-none/onPointerDown, 360×640 w każdej fazie"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura PanstwaMiasta.tsx, Kalambury.tsx, Setup.tsx (TournamentSetup), Game.tsx (część turniejowa) + wiersze 02-01-CHECKS.md §1-§6"
        status: pass
    human_judgment: false
  - id: D2
    description: "Teksty, liczby i dostępność (UI-04, UI-05)"
    requirement: UI-05
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §7-§9, punkty W-03, W-04, W-15..W-18 z 02-02-BASELINE.md"
        status: pass
    human_judgment: false
  - id: D3
    description: "Animacje, timery i wibracje (ANIM-01..03), tabela Sytuacje"
    requirement: ANIM-03
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §11-§15 (każdy setTimeout/setInterval i vibrate w tych plikach oceniony), waitingFor w kalambury.ts:213 i panstwa-miasta.ts:143"
        status: pass
    human_judgment: false
  - id: D4
    description: "360×640 bez przeglądarki"
    requirement: UI-04
    verification:
      - kind: other
        ref: "szacunek statyczny ±30 px; KL1 i TU1 oznaczone do potwierdzenia w przeglądarce"
        status: partial
    human_judgment: true

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 06: fazy równoczesne i Turniej Summary

**Państwa-miasta, Kalambury i ekrany turnieju trzymają się tokenów, koloru gracza dla akcji w partii, 48 px przy prawie wszystkich polach i nie mają ani jednej animacji JS ani wibracji poza `Game.tsx`. Dwa wpisy wysokiej wagi dotyczą wysokości: Państwa-miasta przewijają się w każdej fazie (około 770-1000 px, znane z `DESIGN.md` §6), a ekran zgadującego w Kalamburach wychodzi na około 677-725 px, bo płótno liczy tylko miejsce pod sobą. Najciekawsze nowe ustalenie: zgadujący w Kalamburach dostają wibrację „moja tura” w połowie rysowania, co zdradza podział na połówki.**

## Accomplishments

- Trzy sekcje z czterema podsekcjami i tabelą Sytuacje; każdy `setTimeout`/`setInterval` z tych plików (`PanstwaMiasta.tsx:135`, `Kalambury.tsx:205`, `:319`) oceniony jako logika, nie animacja; keyframes w plikach gier brak, w części turniejowej tylko `title-pop` (wpis platformy B-41).
- Wysokości ekranów policzone faza po fazie: Państwa-miasta (pisanie około 820 px, głosowanie około 770, podsumowanie około 1000), Kalambury (rysujący około 617-665, zgadujący około 677-725, odsłona około 900).
- Sprawdzone stany kafli turnieju (losowo / na pewno / bez) wobec `DESIGN.md` §4: zgodne, tylko „bez” bez słowa podpisu (TU4).
- Wibracje w fazach: `Game.tsx:35` wibruje tylko przy zmianie `myTurn`, co w grach z fazami daje brak wibracji po limicie (PM13) i fałszywą „turę” w połowie rysowania (KL7).

## Wpisy (szczegóły w 02-06-FINDINGS.md)

- Wysokie: PM1 (Państwa-miasta powyżej 640 px), KL1 (ekran zgadującego w Kalamburach powyżej 640 px).
- Średnie: PM2 (tabela głosowania przewija się w bok przy 4+ graczach), PM3 (`dotyk-48`), PM4, PM5 (`rola-tokenu`), PM6 (`kolor-jedyny-sygnal`), PM11 (`dalej-kolor`), KL2, KL7 (`wibracja-fazy`).
- Niskie: PM7, TU4 (`stan-krycie`), PM8, PM9 (`naglowek-wlasny`), PM10, PM12 (`slowa`), PM13 (`wibracja-fazy`), PM14, KL3, TU3 (`transition-domyslny`), KL4, KL5 (`aria-hidden`), KL6 (`waga-ikon`), KL8, TU1, TU2, TU5, TU6, TU7 (`liczby-mono`), TU8.
- Odstępstwa z powodem: własne nagłówki Państw-miast i Kalamburów, paleta Kalamburów, `--ambient` rysującego, prostokątna odznaka turnieju.

## Deviations from Plan

- Plan przerwany limitem API w połowie lektury; po wznowieniu dokończony bez zmian w zakresie.
- `Countdown` i reszta `Game.tsx` należą do 02-03; tu tylko odsyłacze, jak każe podział z 02-03-PLAN.md.
- Lista wyjątków własnego nagłówka w `ZASADY.md` §4 nie wymienia Kalamburów (`DESIGN.md` §6 tak): zapisane przy odstępstwach jako sprzeczność źródeł do fazy 4, bez osobnego ID.

## Verification

- `grep -nE "^## |^### " 02-06-FINDINGS.md` → Państwa-miasta, Kalambury, Turniej, każda z Wygląd, Teksty, Animacje, Sytuacje; dalej Odstępstwa i Zestawienie.
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0.
- Bez skryptów, bez przeglądarki i bez uruchamiania ani zatrzymywania serwerów dev.

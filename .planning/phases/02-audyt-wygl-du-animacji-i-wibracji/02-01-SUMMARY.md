---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 01
subsystem: ui
tags: [audyt, ui, animacje, wibracje, grep]

requires: []
provides:
  - "02-01-CHECKS.md: tabela 51 plików .tsx + index.css × 15 sprawdzeń hurtowych, lista trafień plik:linia z wstępną oceną, katalog 14 keyframes, 16 wywołań vibrate, reguła prefers-reduced-motion, treść skryptu w załączniku A"
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-09, 02-10, 02-11]

actuals:
  tasks: 2
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypt audytu poza repo: node checks.mjs <repo>, grep + prosty parser otwierających znaczników JSX (klamry i napisy), bez AST i bez zależności"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-01-CHECKS.md
  modified: []

key-decisions:
  - "Ocena wstępna w czterech stopniach: rozbieżność (z wagą D-07, gdy znana bez kontekstu), do oceny w planie gry, zgodne, odstępstwo z powodem; ostateczną daje plan gry"
  - "reducedMotion liczone tylko z kodu; wzmianka w komentarzu (Kubki, Zaslona) oznaczona osobno jako „komentarz”"
  - "Ikony i SVG w komponencie Preview albo wewnątrz <Intro> oceniane jako zgodne, bo Intro opakowuje podgląd w aria-hidden (ui.tsx:297)"

requirements-completed: []

coverage:
  - id: D1
    description: "Sprawdzenia wyglądu (kolory, akcent, zaokrąglenia i cienie, pola dotykowe, onClick/touch-none, stałe piksele, teksty, liczby, dostępność, Intro) dla każdego pliku z games/, screens/, App.tsx"
    requirement: UI-01
    verification:
      - kind: other
        ref: "grep -c \"apps/web/src/\" 02-01-CHECKS.md → 938"
        status: pass
    human_judgment: false
  - id: D2
    description: "Katalog keyframes, animate-[…], transition, timery JS, pomiar czasu, vibrate, reguła prefers-reduced-motion"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "grep -n vibrate 02-01-CHECKS.md | wc -l → 31; 14/14 @keyframes w katalogu; 16 plików z vibrate"
        status: pass
    human_judgment: false

duration: 11min
completed: 2026-10-23
status: complete
---

# Phase 2 Plan 01: hurtowe sprawdzenia UI, animacji i wibracji Summary

**Jeden skrypt poza repo przeszedł 51 plików `.tsx` i `index.css` w 15 sprawdzeniach (515 trafień z `plik:linia` i wstępną oceną); twardych rozbieżności jest mało: en-dash w Balonie, osiem wbudowanych `animate-pulse`/`animate-ping`, sześć keyframes spoza tabeli §5, ruch z `requestAnimationFrame` bez `reducedMotion` w czterech grach i dwa pola dotykowe poniżej 48 px poza Kampus Tour.**

## Accomplishments

- `02-01-CHECKS.md`: tabela zbiorcza plik × sprawdzenie (wiersz dla każdego pliku z `games/`, `screens/`, `App.tsx`, `main.tsx`, `index.css`), sekcje 1-16 z listą trafień, sekcja „Najważniejsze dla planów fali 2”, załącznik A z pełną treścią `checks.mjs`.
- Sumy trafień: kolory 28, akcent 27, zaokrąglenia/cienie 43, pola < 48 px 6, onClick w grach 55, stałe piksele 19, teksty 9, liczby 36, a11y 20, Intro 25, animacje 100, przejścia 26, timery 62, pomiar czasu 43, wibracje 16.
- Katalog keyframes: 14/14 z komentarzem, wszystkie użyte, brak nazw spoza katalogu; nie ma w §5: `line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`.
- Wibracje: 16 plików (`Game.tsx` + 15 gier), wszystkie z `?.`; wzory 60 ×13, `[60, 40, 60]` ×1, 40 ×1 (tylko `Game.tsx`), 30 ×1 (Rytm, metronom).
- Intro: 30 mini-gier pokrytych (23 własne + 5 przez `Quiz.tsx` + 2 przez `Szacowanie.tsx`), każde `<Intro>` z kompletem atrybutów; `Kolo.tsx:153` ma podgląd inline zamiast `Preview`.

## Najważniejsze dla planów 02-03..02-10

- Rozbieżności pewne już na etapie grepa: en-dash w UI `Balon.tsx:109` (średnia); wbudowane animacje Tailwinda w `Labirynt.tsx:143`, `PiecWRzedzie.tsx:78`, `:122`, `Statki.tsx:276`, `Memory.tsx:116`, `Game.tsx:596`, `Lobby.tsx:68`, `:69` (niska); zaokrąglenia `rounded-sm`/`rounded-[Npx]` poza 20/10/999 px i poświaty `box-shadow` w Memory, Gomoku i Statkach (niska).
- Kandydaci o wyższej wadze do potwierdzenia w planach: `requestAnimationFrame` bez `reducedMotion` (`Sledzenie.tsx:75`, `Wieza.tsx:77`; Kubki i Zaslona tłumaczą to komentarzem), pomiar czasu w komponentach z animacją (12 gier, lista w CHECKS §14), wibracja 60 przy ruchu „bez kary” (`Nozyczki.tsx:80`, `Srodek.tsx:91`), `Lobby.tsx:385` (`size-10`) i `PanstwaMiasta.tsx:312` (`min-h-11`), `Kolo.tsx:71` (kolor `hsl` spoza tokenów), `text-accent-fg` na `warning` w `Stoj.tsx`.
- Żaden plik gry nie używa `btn-primary`; podwójne wypełnione akcenty sprawdzić na ekranach `Game.tsx` (3), `Home.tsx` (2), `Lobby.tsx` (2).

## Deviations from Plan

- Zakres grepa obejmuje też `apps/web/src/main.tsx` (plan: `**/*.tsx` bez `Dev.tsx`), choć D-01 go nie wymienia; zero trafień.
- Rozszerzenia sprawdzeń ponad listę z planu: stałe szerokości w `rem` (`w-[Nrem]`), siatki `grid-cols-[…]`/`gridTemplateColumns` bez `minmax(0,1fr)` (D-09), wartości tokenów wpisane na sztywno jako hex, `rx=` w SVG i `box-shadow` użyty jako obrys (oznaczone osobno), wbudowane `animate-pulse|ping|spin|bounce`, dodatni `animationDelay` poza `Preview`, 3 linie kontekstu przed każdym `vibrate`.
- Atrybut `width=` liczbą sprawdzany tylko na `svg|img|canvas|video|iframe|div|span|button` (na `<rect>` w SVG to jednostki `viewBox`, nie piksele); `toFixed` we współrzędnych SVG oceniony jako zgodny.
- Heurystyka liczb bez mono pomija wyrażenia z `=>` i `<` (mapowanie JSX) oraz cyfry wewnątrz napisów; wszystkie trafienia zostają „do oceny”, bo klasy mogą przychodzić z rodzica.

## Verification

- `grep -c "apps/web/src/" 02-01-CHECKS.md` → 938.
- `grep -n "vibrate" 02-01-CHECKS.md | wc -l` → 31; lista wibracji ma 16 plików (zgodnie z kryterium).
- Katalog keyframes: 14 wierszy = `grep -c "^@keyframes" apps/web/src/index.css` (14).
- Sekcje kolory, akcent, zaokrąglenia i cienie, pola dotykowe, onClick/touch-none, stałe piksele, teksty, liczby, dostępność, Intro obecne; każde trafienie ma `plik:linia`; treść skryptu w załączniku A.
- `git status --porcelain`: zmiany tylko w `.planning/` (zmiany `.planning/*` z fazy 1 i katalog fazy 2 były przed rozpoczęciem planu); `find . -name checks.mjs` w repo: pusto, skrypt leży w scratchpadzie sesji.

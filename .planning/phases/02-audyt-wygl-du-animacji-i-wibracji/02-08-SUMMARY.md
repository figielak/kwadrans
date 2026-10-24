---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 08
subsystem: web
tags: [audyt, mini-gry, quiz, stroop, liczenie, inny, obrot, literowka, dziesiatki, schulte, sudoku, zakupy, wygląd, animacje, wibracje]

requires: ["02-01", "02-02"]
provides:
  - "02-08-FINDINGS.md: sekcje 9 mini-gier na trafienia, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje; pełna ocena wspólnego Quiz.tsx (D-02) w sekcji Kolor liter; wpisy QZ1-QZ3, ST1-ST2, LI1, IN1-IN2, OB1-OB2, DZ1-DZ2, SC1-SC2, SU1-SU3, ZK1-ZK5"
affects: [02-11]

actuals:
  tasks: 9
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Sprawdzenie statyczne 360×640: szerokość treści 328 px (Screen px-4), okno podglądu Intro 294 px, obudowa partii około 172 px wysokości (zostaje około 468 px na pole gry, 440 px w turnieju); szerokości z klas Tailwinda i szacunku kroju"
    - "Jednorazowy skrypt node (najdłuższe słowo w literowka-dane.ts), bez plików w repo"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-08-FINDINGS.md
  modified: []

key-decisions:
  - "ZK1 (Gotowe w Zakupach na onClick) jako wysoka wg D-07, bo czas zaznaczania to drugie kryterium rankingu i rekordu; w praktyce działa tylko przy remisie punktowym, do potwierdzenia wagi w fazie 4"
  - "QZ1 (Results zamiast Scores) jako średnia wg W-04, z propozycją uznania tabeli z kolumnami za drugi wspólny wzorzec, a nie przepisywania"
  - "Blokada 1 s po pomyłce i kolory treści (Stroop, Inny) na liście odstępstw; rx klocków Obrotu jako niski wpis z propozycją dopisania do DESIGN.md §6"
  - "Nowe klucze zbiorcze: wlasna-tabela-wynikow, siatka-1fr, zaznaczenie-gracza, zaznaczenie-bez-przejscia, stale-piksele, podpis-label, aria-label"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd 9 gier: tokeny, akcent, kolor gracza, pola 48 px, touch-none / onPointerDown, 360×640 w każdej fazie"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura plików gier + 02-01-CHECKS.md §1-6 + 02-02-BASELINE.md W-01..W-06, W-13 (statycznie)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Teksty, liczby, Intro, stany DESIGN.md §4, dostępność"
    requirement: UI-05
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §7-10a + B-64..B-74"
        status: pass
    human_judgment: false
  - id: D3
    description: "Każda animacja, timer, pomiar i wibracja w 10 plikach z oceną; tabele Sytuacje dla 02-11"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §11a, §12-15 (każdy wiersz z tych plików oceniony w FINDINGS)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Podglądy przy reduced-motion, przycięcie podglądu Koloru liter (ST1), łamanie wyniku Zakupów (ZK5)"
    requirement: UI-04
    verification:
      - kind: other
        ref: "szacunek statyczny, bez przeglądarki (D-09)"
        status: partial
    human_judgment: true

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 08: mini-gry na trafienia Summary

**Dziewięć gier na trafienia trzyma się wzorców platformy: `Stats`, `Intro` z animowanym podglądem, `tile-hit` / `tile-miss` 0,35 s, wibracja 60 tylko przy pomyłce, `touch-none select-none` i `onPointerDown` w każdym polu gry na czas, a pomiar czasu nigdy nie czeka na animację. Wszystkie ekrany partii mieszczą się na 360×640 (najwyższy 432 px przy około 468 px miejsca, sprawdzenie statyczne). Jedyny wpis wysokiej wagi: „Gotowe” w Zakupach reaguje na `click`, więc do czasu zaznaczania (drugie kryterium rankingu) dochodzi czas trzymania palca.**

## Accomplishments

- Pełna ocena wspólnego `Quiz.tsx` (D-02) w sekcji Kolor liter: blokada 1 s z napisem „Źle!” i przygaszeniem 40%, wibracja 60, trafienie bez wibracji, `Stats` 30 s, tabela `Results`; pozostałe gry quizowe odsyłają do wpisów QZ.
- Każdy wiersz z `02-01-CHECKS.md` dla 10 plików (keyframes, przejścia, `setTimeout` / `setInterval`, `performance.now`, `vibrate`, siatki, a11y) dostał ocenę: zgodne albo wpis.
- Policzone statycznie pola dotykowe (Inny element 6×6: dokładnie 48 px, Dziesiątki 76 px, Schulte 59 px, Sudoku 60 / 56 px, Zakupy około 57 px) i wysokości każdej fazy.
- Tabele Sytuacje dla 9 gier (wejście do macierzy 02-11): trafienie i pomyłka wszędzie tymi samymi keyframes i czasem; zaznaczenie pola różni się między Dziesiątkami a Sudoku / Zakupami (DZ1).

## Wpisy (szczegóły w 02-08-FINDINGS.md)

- Wysokie: ZK1 (Zakupy, „Gotowe” na `onClick`, `Zakupy.tsx:175`).
- Średnie: QZ1 (`wlasna-tabela-wynikow`, `Results` zamiast `Scores`).
- Niskie: QZ2 (`siatka-1fr`), QZ3 (błysk trafienia na nowym pytaniu), ST1 (podgląd szerszy niż okno), ST2 (instrukcja Koloru liter), LI1 (`liczby-mono`), IN1 (`aria-label`), IN2 (forma „symbolu”),
  OB1 (`promien`), OB2 (`slowa`), DZ1 (`zaznaczenie-gracza`), DZ2 (`zaznaczenie-bez-przejscia`), SC1 (`przecinek`, kara przez szablon), SC2 (podpisy osi 8,3 px), SU1 (`stale-piksele`, `w-64`),
  SU2 (klawiatura bez stanu nieaktywnego), SU3 (`aria-label`), ZK2 (`brak-w-tabeli-5`, pasek pokazu), ZK3 (`podpis-label`), ZK4 (kropki graczy samym kolorem), ZK5 (długi wynik w `Scores`).
- Odstępstwa z powodem: `HUES` Koloru liter (także czerwony / zielony przy daltonizmie), `hsl` figur Innego elementu, blokada 1 s po pomyłce.

## Deviations from Plan

- Sesja przerwana po lekturze kodu, przed zapisem; po wznowieniu ustalenia zapisane w jednym przebiegu, zadania 1-9 po kolei w jednym pliku. Metoda i szacunek wysokości obudowy opisane raz na górze FINDINGS.
- Zestawienie wszystkich wpisów na końcu FINDINGS (ułatwia scalenie w 02-11).

## Verification

- `grep -F "## <Gra>"` → po jednym nagłówku dla 9 gier; 36 podsekcji (9 × Wygląd, Teksty, Animacje, Sytuacje).
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Brak em-dashy w FINDINGS; skrypt pomocniczy tylko w scratchpadzie.

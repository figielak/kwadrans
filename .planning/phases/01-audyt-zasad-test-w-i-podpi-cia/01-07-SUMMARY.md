---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 07
subsystem: games
tags: [audyt, mini-gry, stroop, liczenie, inny, obrot, literowka, dziesiatki, schulte, sudoku, zakupy, quiz, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-07-FINDINGS.md: sekcje 9 mini-gier na trafienia, każda z Zasadami, Regułami §3 i Testami; wpisy W7a, W7b, Q1, Q2, ST1-ST7, LC1-LC9, IN1, OB1, LT1, DZ1, SC1-SC7, ZK1"
affects: [01-10]

actuals:
  tasks: 9
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty audytu poza repo (scratchpad): fuzz07.ts (400 partii każdej gry z losowymi dozwolonymi wynikami, w tym skrajnymi, i timeoutami, w Schultem i Sudoku z progress; jak fuzz06.ts plus sprawdzenie, czy gracz po limicie stoi wyżej niż wynik; rozkład rodzajów działań Liczenia na 2000 seedach) i cases07.ts (pojedyncze przypadki wpisów)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-07-FINDINGS.md
  modified: []

key-decisions:
  - "W7a (limit czasu w Tabeli Schultego i Sudoku lepszy od uczciwego wyniku z dużą karą) jako wysoka: łamie §3 „najgorszy możliwy wynik” i zmienia miejsca w partii i turnieju; fuzz07: 10 i 16 partii na 400"
  - "ZK1 (Zakupy: limit 60 s = 10 s pokazu + 50 s zaznaczania, bez zapasu, ekran nie kończy sam) jako wysoka: wolny gracz traci cały wynik; test zakupy.test.ts:42 utrwala złą zasadę, więc najpierw test i dokument"
  - "LC1 (rodzaje działań w Liczeniu losowane osobno, nie kompletami) jako średnia pod kluczem `trudnosc-z-losowania`, pomiar do fazy 3; trudność rodzajów to założenie audytu"
  - "`quiz.ts` sprawdzony raz w sekcji Koloru liter (Q1, Q2); kara punktowa Obrotu i Literówki zaliczona do odstępstw z powodem (D-11)"
  - "Nowy klucz zbiorczy `timeout-nie-najgorszy` dla 01-10; `brzegi` rozszerzone o sumę 30 s i liczbę 200 czasów w 6 grach quizowych; W7b dopisuje 6 gier do W6b"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "9 mini-gier: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, wspólne quiz.ts, walidacja, limity tury, zasady ekranu wpływające na wynik"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts, quiz.ts, sekcji ZASADY-GIER.md i grep w apps/web/src/games/{Quiz,Dziesiatki,Schulte,Sudoku,Zakupy}.tsx; lista PAIRS sprawdzona node -e; git log (W7a, LC1, ZK1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 na prawdziwych wynikach; limit czasu wobec uczciwych wyników z karą; limit tury wobec najdłuższej uczciwej partii"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md + fuzz07.ts: 3600 partii, 0 błędów, 26 partii z limitem wyżej niż wynik (W7a); cases07.ts (W7a, W7b, Q1, brzegi)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla 9 gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; 01-01-CHECKS.md §4.2 (K4, Lim, solo, rekord przez index.test.ts)"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 07: mini-gry na trafienia Summary

**Stałe 9 gier zgadzają się z `ZASADY-GIER.md` i `KONCEPT.md`, a sześć gier quizowych dzieli poprawną walidację z `quiz.ts`. Dwa wpisy wysokiej wagi: w Tabeli Schultego i Sudoku limit czasu (180 / 120 s bez kary) bywa lepszy od uczciwego wyniku z dużą karą, a w Zakupach limit 60 s nie ma zapasu, więc wolny gracz traci cały wynik. Nowsze pliki testów (Inny element, Obrót, Literówka, Dziesiątki, Sudoku, Zakupy) mają prawie komplet testów obowiązkowych; najstarsze (Kolor liter, Liczenie, Tabela Schultego) mają wszystkie luki tej paczki.**

## Accomplishments

- Porównanie stałych 9 gier z dokumentami: jedna rozbieżność z dokumentem (LC1: „po równo” w Liczeniu, dzielenie 23,3%), dwie zasady tylko w kodzie (Q2) i luźniejsza walidacja `quiz.ts` (Q1); poza tym zgodne, także z `KONCEPT.md`.
- `fuzz07.ts` sprawdził reguły §3 na 3600 partiach z prawdziwymi wynikami: 0 błędów mutacji, JSON, walidacji, drugiego wyniku, klucza `turn()` i zgodności miejsc z rekordami;
  znalazł 26 partii, w których gracz po limicie stoi wyżej niż ktoś z oddanym wynikiem (W7a).
- `cases07.ts` potwierdził, że W6b (zaokrąglona średnia w rekordzie) dotyczy wszystkich 6 gier quizowych, i że ekran końcowy quizu liczy miejsca jeszcze trzecim sposobem (W7b).
- Zestawienie najdłuższej uczciwej partii z limitem tury: 8 gier mieści się z zapasem, Zakupy bez zapasu (ZK1).

## Wpisy (szczegóły w 01-07-FINDINGS.md)

- Wysokie: W7a (`timeout-nie-najgorszy`: schulte, sudoku), ZK1 (zakupy).
- Średnie: LC1 (`trudnosc-z-losowania`), LC2, ST1, LC3, SC1 (`definicja-swieza-gra`), ST2, LC4, SC2 (`setup-ten-sam-seed`), ST3, LC6, IN1, OB1, LT1, DZ1 (`brzegi`),
  ST4, LC5, SC3 (`po-koncu`), ST5, LC7, SC4 (`schemat-smieci`), ST6, LC8, SC5 (`wygrana-kazdego`), ST7, LC9, SC6 (`stan-mutacja-json`).
- Niskie: W7b (`tie-zaokraglenie`), Q1, Q2, SC7.
- Odstępstwa z powodem (D-11): wynik liczony na kliencie (quizy, Schulte, Sudoku), `playerView` z całym stanem, lista w widoku od startu (Zakupy), `solution` w widoku (Sudoku), kara punktowa obok blokady (Obrót, Literówka).

## Deviations from Plan

- Brak w zakresie zadań. Zadania 1-9 wykonane po kolei w jednym pliku; metoda, przebieg skryptów i tabela limitów opisane raz na górze 01-07-FINDINGS.md,
  wpisy wspólne kilku gier (W7a, W7b, Q1, Q2) w osobnej sekcji, a `quiz.ts` oceniony w sekcji Koloru liter, jak każe plan.
- Numery linii `Quiz.tsx` i `LobbyRoom.ts` z pierwszego zapisu pochodziły z wydruku z przesunięciem; poprawione i sprawdzone grepem przed zakończeniem.

## Verification

- `grep -n "^## " 01-07-FINDINGS.md` → nagłówki Kolor liter, Liczenie, Inny element, Obrót, Literówka, Dziesiątki, Tabela Schultego, Sudoku, Zakupy, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypty w scratchpadzie sesji).

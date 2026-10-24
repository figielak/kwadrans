---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 10
subsystem: games
tags: [audyt, scalenie, findings, zasady, testy, podpięcie, reguły-§3]

requires: ["01-01", "01-02", "01-03", "01-04", "01-05", "01-06", "01-07", "01-08", "01-09"]
provides:
  - "FINDINGS.md: jeden plik fazy 1 dla 38 gier i Turnieju; 55 wpisów (2 wysokie, 24 średnie, 29 niskich), 21 zbiorczych Z1-Z21, tabela podpięć, odstępstwa z powodem, sekcje gier, tabela kryterium → sekcja"
affects: [04]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Wpisy zbiorcze Z1-Z21 zachowują identyfikatory wpisów częściowych (K1, SQ1, W7a…) w tabelach gier, więc każdy wpis da się odnaleźć w pliku częściowym z pełnym dowodem"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md
  modified: []

key-decisions:
  - "Z1 `timeout-nie-najgorszy` ujednolicony do wysokiej wagi także dla Policz kropki (01-08 dawało średnią): ten sam skutek, gracz po limicie wyprzedza uczciwy wynik"
  - "Z2 `limit-tury-bez-zapasu` łączy SQ1 (Sekwencja) i ZK1 (Zakupy), oba wysokie; SR1 (Środek) zostaje średni, bo przekroczenie nie jest zmierzone"
  - "W7 (01-02) i WP2 (01-09) to ten sam brak w `KONCEPT.md`; scalone w Z20"
  - "Nowe klucze zbiorcze poza zgłoszonymi w planach: `remis-kolejnosc-miejsc` (C1, T1), `wspolne-funkcje-core` (K6, KB1, W8c, KO1), `mini-games-zbior` (W1, W2, W4, W5), `quiz-walidacja` (Q1), `quiz-ekran-czasy` (Q2), `ekran-stan-lokalny` (W3), `test-solostate` (W9), `koncept-drugie-kryteria` (W7, WP2)"
  - "Przy Z4 i Z10 propozycja alternatywna: jedno sprawdzenie w `describe.each(CASES)` zamyka punkt dla wszystkich gier (D-04)"

requirements-completed: [RULE-01, RULE-02, RULE-03, WIRE-01, WIRE-02]

coverage:
  - id: D1
    description: "Wpisy zbiorcze bez duplikatów, wagi ujednolicone wg D-09"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "grep -c zbiorcze FINDINGS.md = 26; każdy wpis częściowy z kluczem zbiorczym ma w sekcji gry tylko odsyłacz → Zn"
        status: pass
    human_judgment: false
  - id: D2
    description: "Układ D-10: podsumowanie, wysokie, tabela podpięć, zbiorcze, odstępstwa z powodem, sekcje gier w kolejności KONCEPT §2, załącznik"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "pętla po importach index.ts i `turniej`: brak brakujących id (38 + 1)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabela kryterium → sekcja dla 5 kryteriów sukcesu fazy 1"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "grep -n '^| [0-9]\\. ' FINDINGS.md → 5 wierszy, żaden pusty; git status --porcelain poza .planning/ → 0"
        status: pass
    human_judgment: false

duration: 40min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 10: scalenie w FINDINGS.md Summary

**Jeden `FINDINGS.md` obejmuje 38 gier z `GAMES` i Turniej: 55 wpisów (2 wysokie, 24 średnie, 29 niskich), z czego 21 zbiorczych pokrywa 177 wystąpień w grach.
Reguły twarde bez złamań; nieuczciwe wyniki tylko w dwóch wpisach wysokich: limit czasu lepszy od uczciwego wyniku (Schulte, Sudoku, Policz kropki) i limit tury bez zapasu (Sekwencja, Zakupy).**

## Accomplishments

- Wpisy z 01-02..01-09 i granice dowodu z 01-01 scalone; każda luka wspólna kilku gier występuje raz (Z1-Z21), sekcje gier mają odsyłacze.
- Wagi ujednolicone (Z1 wysoka we wszystkich trzech grach); duplikat W7/WP2 usunięty.
- Tabela podpięć 38 × §6 z dodaną kolumną ekranu końcowego (kryteria 4 i 5 w jednym miejscu).
- Lista odstępstw z powodem (14 pozycji, w tym uwaga do fazy 4 o `timeoutMove` Labiryntu).
- Tabela „kryterium → sekcja” dla 5 kryteriów sukcesu, żadne nie zostało bez sekcji.

## Deviations from Plan

- Tabela podpięć dostała kolumnę „ekran końcowy ze stanu”, żeby kryterium 5 miało jedno miejsce obok kryterium 4. Poza tym zgodnie z planem.

## Verification

- `grep -c "zbiorcze" FINDINGS.md` → 26.
- Pętla z planu po importach `packages/games/src/index.ts` i `turniej` → pusto (wszystkie 38 id i `turniej` obecne).
- `grep -n "^| [0-9]\. " FINDINGS.md` → 5 wierszy tabeli kryteriów.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.

---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 04
subsystem: games
tags: [audyt, gomoku, statki, chinczyk, labirynt, memory, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-04-FINDINGS.md: sekcje Gomoku, Statki, Chińczyk, Labirynt, Memory, każda z Zasadami, Regułami §3 i Testami, wpisy G1-G3, S1-S4, C1-C4, L1-L2, M1"
affects: [01-10]

actuals:
  tasks: 5
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty audytu poza repo (scratchpad): fuzz04.ts (losowe partie dozwolonymi ruchami we wszystkich trybach i liczbach graczy, stan zamrożony, JSON round-trip stanu i widoków, klucz turn(), inwarianty ukrywania), cases04.ts i cases04b.ts (przypadki brzegowe do wpisów)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-04-FINDINGS.md
  modified: []

key-decisions:
  - "Remis Gomoku jako `{}` (G1): waga niska i kierunek „popraw kod”, bo §3 wymaga samego `ranking`, ZASADY-GIER opisuje `{}` bez powodu, a linia jest starsza od reguły (0f6ad01 vs bf9f266)"
  - "timeoutMove Labiryntu (najlepszy krok) na liście odstępstw z powodem (D-11), z uwagą do fazy 4: nieruszający się gracz idzie najkrótszą drogą, a rng i tak jest dostępny"
  - "Mutacja i JSON sprawdzone w testach gry na jednym typie ruchu uznane za spełnione; pozostałe typy potwierdza fuzz04.ts"
  - "Nowy klucz zbiorczy `setup-ten-sam-seed` (S2), obok `definicja-swieza-gra`, `schemat-smieci`, `widok-obserwatora` z 01-03"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "Gomoku, Statki, Chińczyk, Labirynt, Memory: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, limity tury, tryby"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts i sekcji ZASADY-GIER.md punkt po punkcie; cases04.ts (C1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 we wszystkich trybach i typach ruchów"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md (same timeouty) + fuzz04.ts: 3150 partii, 848 392 ruchy, 0 błędów"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla pięciu gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; cases04.ts i cases04b.ts (L1, L2, C4, S2)"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 04: gry główne turowe Summary

**Kod Gomoku, Statków, Chińczyka, Labiryntu i Memory zgadza się z `ZASADY-GIER.md` i `KONCEPT.md` we wszystkich stałych, trybach i limitach, a reguły §3 trzymają się we wszystkich trybach i typach ruchów. Rozbieżności to remis Gomoku jako `{}`, nieopisany remis dalszych miejsc w Chińczyku Szybkim i luki w testach (głównie `pass` i skos w Labiryncie, premia po szóstce w Chińczyku, zbiorcze luki §2).**

## Accomplishments

- Pełne porównanie stałych i zasad pięciu gier z dokumentami: brak rozbieżności kod ↔ `ZASADY-GIER.md` i `KONCEPT.md` ↔ `ZASADY-GIER.md`.
- `fuzz04.ts` uzupełnił 01-01 o ruchy spoza timeoutów (6 636 ścianek, 443 `place`, 42 455 wyborów pionka): 0 błędów mutacji, JSON, walidacji, `timeoutMove`, klucza `turn()` i ukrywania.
- Gałęzie, których losowe partie nie trafiają (`pass` w Labiryncie, skos przy dwóch pionkach, szóstka z wejściem do domku), sprawdzone ręcznie w `cases04.ts`: zachowanie zgodne z dokumentem.
- Memory spełnia wszystkie testy obowiązkowe §2; jedyny wpis to brak testu liczby 18 symboli.

## Wpisy (szczegóły w 01-04-FINDINGS.md)

- Wysokie: brak.
- Średnie: G2, S1, C2 (`definicja-swieza-gra`), G3, S3, C3 (`schemat-smieci`), S2 (`setup-ten-sam-seed`), C4 (Szybki: szóstka z wejściem do domku daje jeden rzut, bez testu), L1 (`pass` i `timeoutMove` = `pass` bez testu), L2 (skos przy pionku za pionkiem i przez ściankę bez testu).
- Niskie: G1 (remis Gomoku `{}` zamiast `ranking`), S4 (`widok-obserwatora`), C1 (Szybki: pełny remis dalszych miejsc według kolejności przy stole, nieopisany), M1 (18 symboli bez testu).
- Odstępstwa z powodem (D-11): `timeoutMove` Labiryntu to najlepszy krok, nie losowy.

## Deviations from Plan

- Brak. Zadania 1-5 wykonane po kolei w jednym pliku; metoda i wspólne przebiegi skryptu opisane raz na górze 01-04-FINDINGS.md.

## Verification

- `grep -n "^## " 01-04-FINDINGS.md` → nagłówki Gomoku, Statki, Chińczyk, Labirynt, Memory, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypty w scratchpadzie sesji).

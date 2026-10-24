---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 05
subsystem: games
tags: [audyt, panstwa-miasta, kalambury, turniej, fazy-rownoczesne, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-05-FINDINGS.md: sekcje Państwa-miasta, Kalambury, Turniej, każda z Zasadami, Regułami §3 i Testami, wpisy PM1-PM10, KL1-KL3, T1-T2"
affects: [01-10]

actuals:
  tasks: 3
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypt audytu poza repo (scratchpad): fuzz05.ts (losowe partie Państw-miast i Kalamburów dozwolonymi ruchami we wszystkich trybach i liczbach graczy, stan zamrożony, JSON round-trip stanu i widoków, stałość klucza turn(), inwarianty ukrywania, niezależne przeliczenie punktów; 3000 losowych turniejów z zamrożonymi wejściami)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-05-FINDINGS.md
  modified: []

key-decisions:
  - "`hint` w Kalamburach (KL1) jako niska waga: ruch musi należeć do rysującego, bo `timeoutMove` to ruch czekającego gracza; wcześniejsze odsłonięcie litery nikogo nie krzywdzi, kierunek „popraw dokument”"
  - "Pełny remis w tabeli turnieju (T1) traktowany jak C1 z 01-04: zasada tylko w kodzie, wpływa wyłącznie na kolejność wierszy, kierunek „popraw dokument”"
  - "Turniej oceniany bez kontraktu `GameDefinition`: punkty §2 i §3 bez odpowiednika (`timeoutMove`, start, schemat w `lobby.ts`) jako n/d; `NEXT_SECONDS` jako odpowiednik limitu tury (T2)"
  - "Nowy klucz zbiorczy `turn-key-staly` (PM8, KL2), obok `definicja-swieza-gra`, `setup-ten-sam-seed`, `brzegi`, `schemat-smieci`, `stan-mutacja-json`"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "Państwa-miasta, Kalambury, Turniej: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, limity per faza, tryby"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts i sekcji ZASADY-GIER.md punkt po punkcie; git log -L (KL1, T1, PM10)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 we wszystkich fazach, trybach i typach ruchów; Turniej w zakresie, który go dotyczy"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md (same timeouty) + fuzz05.ts: 1200 partii, 100 236 ruchów, 3000 turniejów, 0 błędów"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla trzech gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; 01-01-CHECKS.md §4.2 (Lim przez index.test.ts dla Państw-miast)"
        status: pass
    human_judgment: false

duration: 35min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 05: fazy równoczesne i Turniej Summary

**Kod Państw-miast, Kalamburów i Turnieju zgadza się z `ZASADY-GIER.md` i `KONCEPT.md` we wszystkich stałych, czasach faz i punktacji, a reguły §3 trzymają się we wszystkich fazach. Kalambury mają prawie wzorcowe testy; Państwa-miasta mają najwięcej luk w testach obowiązkowych §2 (definicja, seedy, po końcu, brzegi, schemat, wygrana B, ukrywanie głosów, mutacja).**

## Accomplishments

- Pełne porównanie trzech sekcji `ZASADY-GIER.md` z kodem: brak rozbieżności kod ↔ dokument i `KONCEPT.md` ↔ `ZASADY-GIER.md`; dwie zasady obecne tylko w kodzie albo niejasne w dokumencie (KL1, T1), obie niskiej wagi.
- `fuzz05.ts` uzupełnił 01-01 o ruchy spoza timeoutów (12 000 głosów z odrzuceniami, 2 407 kresek, 538 cofnięć i wyczyszczeń, 20 273 strzały): 0 błędów mutacji, JSON, walidacji, `timeoutMove`, klucza `turn()`, ukrywania i punktacji (przeliczonej niezależnie z dokumentu).
- 3000 losowych turniejów (konfiguracje z `mark`, przerwane gry, wyjścia graczy, remisy): 0 błędów w losowaniu, dogrywce, zwycięzcy i tabeli.

## Wpisy (szczegóły w 01-05-FINDINGS.md)

- Wysokie: brak.
- Średnie: PM1, T2 (`definicja-swieza-gra`), PM2 (`setup-ten-sam-seed`), PM3 (ruch po końcu bez testu), PM4 (`brzegi`), PM5 (`schemat-smieci`), PM6 (wygrana tylko A), PM7 (ukrywanie głosów bez testu), PM8, KL2 (`turn-key-staly`), PM9 (`stan-mutacja-json`).
- Niskie: PM10 (komentarz `LETTERS` bez Ć), KL1 (`hint` dozwolony rysującemu przed limitem), KL3 (`nonce` bez testu), T1 (pełny remis w tabeli według kolejności miejsc, nieopisany).
- Odstępstwa z powodem (D-11): brak.

## Deviations from Plan

- Brak. Zadania 1-3 wykonane po kolei w jednym pliku; metoda i wspólne przebiegi skryptu opisane raz na górze 01-05-FINDINGS.md.
- Pierwszy przebieg `fuzz05.ts` dał fałszywy alarm („przyszłe hasło w widoku”: strzały skryptu były hasłami z listy i trafiały do jawnego czatu); po wyłączeniu czatu z tego jednego sprawdzenia 0 błędów.

## Verification

- `grep -n "^## " 01-05-FINDINGS.md` → nagłówki Państwa-miasta, Kalambury, Turniej, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypt w scratchpadzie sesji).

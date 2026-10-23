---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 01
subsystem: testing
tags: [audyt, vitest, timeoutMove, kontrakt-gry]

requires: []
provides:
  - "01-01-CHECKS.md: wynik reguł §3 dla 46 przypadków gra × tryb (38 gier), grep losowości, mapa pokrycia index.test.ts dla 38 gier"
affects: [01-03, 01-04, 01-05, 01-06, 01-07, 01-08, 01-09, 01-10]

actuals:
  tasks: 2
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypt audytu poza repo: node --experimental-strip-types, import GAMES ze ścieżki bezwzględnej, bez nowych zależności"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-01-CHECKS.md
  modified: []

key-decisions:
  - "Mutację sprawdza rekursywne Object.freeze przed applyMove (moduły ES w trybie ścisłym rzucają przy zapisie), nie tylko porównanie JSON"
  - "Determinizm: dwa przebiegi z tym samym seedem + liczniki wywołań Math.random/Date.now/performance.now/new Date"
  - "Skrypt sprawdzony na pięciu grach-mutantach, żeby zielone wyniki nie pochodziły z martwego sprawdzenia"

requirements-completed: [RULE-02, RULE-03]

coverage:
  - id: D1
    description: "Tabela reguł §3 (timeoutMove, JSON, mutacja, determinizm, start, remis, places/record, playerView) dla 46 przypadków gra × tryb"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "node --experimental-strip-types checks.ts <repo> (scratchpad sesji), 0 błędów"
        status: pass
    human_judgment: false
  - id: D2
    description: "Mapa pokrycia index.test.ts: co sprawdza każdy test i ocena T/C/N każdego punktu §2 dla 38 gier"
    requirement: RULE-03
    verification:
      - kind: unit
        ref: "pnpm --filter @kwadrans/games exec vitest run src/index.test.ts src/core.test.ts (190 passed)"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 01: hurtowe sprawdzenie §3 i mapa pokrycia testów Summary

**Wszystkie 38 gier (46 trybów) przechodzi automatyczne sprawdzenie reguł §3 bez żadnego błędu; testy kontraktowe pokrywają tylko część punktów §2 (gracz obcy, `waitingFor` po końcu, `timeoutMove` w każdej fazie, rekordy i `soloState` mini-gier), reszta to luki dla planów gier.**

## Accomplishments

- Skrypt `checks.ts` (poza repo, treść w załączniku A `01-01-CHECKS.md`) rozgrywa każdą grę × tryb × {min, max} graczy × 5 seedów na samych `timeoutMove`: 0 błędów w każdej kolumnie.
- Grep na `Math.random|Date.now|performance.now|new Date` w `packages/games/src/*.ts` (bez testów): pusto; liczniki wywołań w trakcie partii: 0.
- Limity tury z `GAMES` zgodne z `KONCEPT.md` §3.
- Mapa pokrycia: każdy `it` z `index.test.ts` opisany, tabela 38 gier × 16 punktów §2; `CASES` i `RECORDS` kompletne wobec `GAMES` / `MINI_GAME_IDS`.

## Najważniejsze dla planów 01-03..01-09

- Luki wspólne dla wszystkich gier w testach kontraktowych (kandydaci na wpisy zbiorcze, D-12): definicja i świeża gra, setup (start, seedy), ruch niedozwolony w poprawnym kształcie, brzegi, schemat odrzucający śmieci, wygrana każdego gracza, mutacja stanu i JSON round-trip stanu. Plany gier sprawdzają, czy pokrywają je testy `<gra>.test.ts`.
- St1 i St2 (§2 „Stan”) nie mają testu w `index.test.ts`, ale skrypt potwierdza zgodność kodu dla wszystkich gier (dowód §3, nie zaliczenie §2).
- Do oceny w planach mini-gier: `balon.ts:36-37` i `zakupy.ts:47-48` (dane wyzwania w widoku od startu, opisane w kodzie jako uproszczenie); najgorszy wynik zależny od losowania w Stoperze, Który rok?, Kącie i Rytmie.
- Fazy Kampus Tour poza `pick/roll/buy/card` i ścianki Labiryntu pokrywa tylko `index.test.ts` (ruchy `EAGER`), nie skrypt.

## Deviations from Plan

Brak. Skrypt uruchomiony przez `node --experimental-strip-types` (wariant dopuszczony w planie). Tabele w CHECKS wygenerowane z `wynik.json` krótkim `node -e`.

## Verification

- `grep -c "index.test.ts:" 01-01-CHECKS.md` → 58.
- `git status --porcelain`: nowy plik tylko w `.planning/`; `D .claude/CLAUDE.md` i zmiany `.planning/*` były przed rozpoczęciem planu.
- Żadnego pliku skryptu w repo.

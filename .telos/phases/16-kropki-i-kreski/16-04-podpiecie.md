---
id: 16-04
title: "Podpięcie: partia, lobby i Jak grać"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [16-03]         # task IDs, e.g. [01-01]
decisions: [D-03]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/Game.tsx", "apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/lists.test.ts", "apps/web/src/vibrate.test.ts", "DESIGN.md"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Udostępnić grę graczom: gałąź w ekranie partii, kafel w lobby z ikoną i opisem oraz wpis gęstej planszy w `DESIGN.md`.

## Read first
- ZASADY.md:331-339 (kolejność podpięcia)
- apps/web/src/screens/Game.tsx:561-568 (gałąź gry po kolei)
- apps/web/src/screens/Game.tsx:647-654 (montaż z `key` z `nonce`)
- apps/web/src/screens/Lobby.tsx:377-387 (`ICONS`)
- apps/web/src/screens/Lobby.tsx:426-435 (`BLURBS`)
- apps/web/src/screens/lists.test.ts:73-92 (wzór testu podpięcia)
- apps/web/src/vibrate.ts:20-39 (`decisionKey`)
- apps/web/src/vibrate.test.ts:128-135 (wzór testu klucza)
- DESIGN.md:213-218 (lista gęstych plansz)

## Files
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)
- apps/web/src/vibrate.test.ts (modify)
- DESIGN.md (modify)

## Constraints
- Ikona `DotsNine` z Phosphor; bez nowych zależności (PROJECT).
- Gra jest po kolei: `isSimultaneous` i `decisionKey` bez zmian, domyślny klucz „turn” nie wibruje przy łańcuchu tej samej osoby.
- Gałąź w `ResultDetails`, `key` z `nonce`, żeby rewanż czyścił wybór i `useFresh`.
- Opis na kaflu bez em-dasha i nazw cudzych gier; `DESIGN.md` podaje rozmiar pola 7×7 i tekst przycisku (D-03).

## Tests (write first)
- kafel ma nazwę, ikonę, opis i limit 2-4, gra nie jest mini-grą i nie ma `record`
- `Game.tsx` montuje `KropkiIKreski` z `key` z `nonce`, propsami `players`, `canMove`, `send("move", move)` wewnątrz `ResultDetails`
- `decisionKey` daje ten sam klucz „turn” przy kolejnym ruchu tej samej osoby i `null`, gdy czekamy na kogoś innego
- ekran gry nie wibruje sam

## Steps
- Dopisać testy w `lists.test.ts` i `vibrate.test.ts`.
- Dodać import i gałąź w `Game.tsx`.
- Dodać `ICONS` i `BLURBS` w `Lobby.tsx`.
- Dopisać Kropki i kreski do gęstych plansz w `DESIGN.md`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0

## Result
Gałąź `kropki-i-kreski` w `Game.tsx` (w `ResultDetails`, `key` z `nonce`, `canMove={myTurn}`), ikona `DotsNine`, opis i kategoria planszówek w `Lobby.tsx`, wpis gęstej planszy w `DESIGN.md`.
5 nowych testów (2 w `lists.test.ts` na RED z asercji, 3 w `vibrate.test.ts` zielone od początku, bo `decisionKey` bez zmian). Pełne `pnpm run test`, `typecheck` i `build` zielone.
Uwaga: ta sama ikona `DotsNine` jest już mini-grą Policz kropki (`kropki`); wymóg zadania, do rozważenia przy odbiorze.
Deviations: none

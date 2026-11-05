---
id: 07-21
title: "Etap 3: lobby, głosowanie, podsumowanie (Claude)"
type: code
status: approved
critical: false
effort: normal
depends: [07-20]
decisions: [D-09]
scope: ["apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Evening.tsx", "apps/web/src/screens/evening.test.ts", "apps/web/src/App.tsx", "apps/web/src/index.css", "DESIGN.md", "ZASADY.md"]
---
## Goal
Lobby ustawione pod grę, dopracowane głosowanie i ekran podsumowania wieczoru z udostępnieniem tekstu.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- apps/web/src/screens/Lobby.tsx:297-343 (lista gier)
- apps/web/src/App.tsx:13-30 (ekrany)
- DESIGN.md §1
- ZASADY.md §4

## Files
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Evening.tsx (create)
- apps/web/src/screens/evening.test.ts (create)
- apps/web/src/App.tsx (modify)
- apps/web/src/index.css (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Wykonawca: Claude. Przejrzyj diffy 07-18 i 07-20 przed zmianami.
- Po dołączeniu drugiej osoby kod zwija się do `TopBar`, kolory do jednej linii, a gry wchodzą na pierwszy ekran 360×640.
- `navigator.share` tylko tekst; bez API przycisk kopiuje albo znika. Bez grafiki.
- Podsumowanie tylko przy 2+ grach w wieczorze i tylko przy własnym wyjściu.

## Tests (write first)
- `evening.test.ts`: `shareText` (mistrz, tytuły, bez em-dashy, link), brak podsumowania przy <2 grach

## Steps
1. Lobby: układ pod grę, „Szybka seria”, kropki życzeń.
2. Głosowanie: karty z licznikiem głosów na żywo.
3. `Evening.tsx`: mistrz, tabela, 2-3 tytuły, udostępnienie.
4. `App.tsx`: pokaż podsumowanie przed wyjściem z pokoju.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/screens/evening.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Lobby i wyniki sprawdzone na 360×640 z 1, 2 i 6 graczami oraz obserwatorem

## Result

---
id: 07-22
title: "Etap 3: podsumowanie wieczoru i udostępnienie"
type: code
status: done
critical: false
effort: normal
depends: [07-18]
decisions: [D-08]
scope: ["apps/web/src/screens/Evening.tsx", "apps/web/src/screens/evening.ts", "apps/web/src/screens/evening.test.ts", "apps/web/src/App.tsx", "KONCEPT.md"]
---
## Goal
Przy wyjściu z pokoju wieczór dostaje zakończenie: mistrz, tabela, 2-3 tytuły i krótki tekst do udostępnienia.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- apps/web/src/App.tsx:36-47 (room.onLeave)
- apps/web/src/App.tsx:59-62 (Home, Game)
- packages/games/src/lobby.ts:24-54 (RoomView)

## Files
- apps/web/src/screens/Evening.tsx (create)
- apps/web/src/screens/evening.ts (create)
- apps/web/src/screens/evening.test.ts (create)
- apps/web/src/App.tsx (modify)
- KONCEPT.md (modify)

## Constraints
- Tylko przy własnym wyjściu i 2+ grach. Zerwane połączenie: dotychczasowy komunikat, bez podsumowania.
- `navigator.share` tylko tekst; bez API przycisk kopiuje, bez schowka znika. Bez grafiki i nowych zależności.
- Polskie teksty bez em-dashy. Bez kodu pokoju w tekście, bo pokój się kończy.
- Ostatni widok trzymany lokalnie w `App`, bo `onLeave` czyści `view`. Serwer bez zmian.

## Tests (write first)
- `shareText`: mistrz, tytuły, link `games.figielak.dev`, bez em-dashy, remis na szczycie bez mistrza
- `shouldSummarize`: 2+ gry i `CONSENTED` tak; 1 gra, zerwane połączenie, solo nie

## Steps
- KONCEPT §1; testy.
- `evening.ts`: `shareText`, `shouldSummarize`.
- `Evening.tsx`: ekran, „Udostępnij”, „Na start”.
- `App.tsx`: przed `Home`, gdy `onLeave` daje podsumowanie.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/screens/evening.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0

## Result
`evening.ts`: `shouldSummarize` (własne wyjście, 2+ gry, nie solo), `champions` (remis daje współliderów), `shareText` (mistrz albo remis, tytuły, link, bez kodu i em-dashy), odmiana „gry/gier”.
`Evening.tsx`: mistrz, `EveningTable`, tytuły, „Udostępnij” (share, kopiowanie albo brak przycisku) i „Na start”. `App.tsx` trzyma ostatni widok i nick w refach, a po własnym wyjściu pokazuje podsumowanie przed `Home`.
Testy: 6 w evening.test.ts; razem 2367 + 171 + 364 PASS.
Nie sprawdzone w przeglądarce: ekran wymaga dwóch rozegranych partii, więc jego wygląd na 360×640 jest do obejrzenia na teście z ludźmi.
Deviations: none

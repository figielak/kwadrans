---
id: 07-04
title: "Etap 1: dokumenty i testy wyników (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-03]
decisions: [D-01, D-09, D-12]
scope: ["KONCEPT.md", "ZASADY-GIER.md", "packages/games/src/memory.test.ts", "packages/games/src/kalambury.test.ts", "packages/games/src/panstwa-miasta.test.ts", "packages/games/src/kampus-tour.test.ts", "packages/games/src/piec-w-rzedzie.test.ts", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/screens/results.test.ts", "apps/web/src/hierarchy.test.ts", "apps/web/src/screens/tables.test.tsx"]
---
## Goal
Zapisz zachowanie ekranu wyników, solo bez limitu instrukcji i nowej kolejności ekranu głównego.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §4
- KONCEPT.md:18-21 (ekran główny)
- KONCEPT.md:137-138 i 160-161 (limit po instrukcji, §3)
- ZASADY-GIER.md:59-60 (start po instrukcji)
- packages/games/src/core.ts:75-85 (rankResults, rankPlaces)
- apps/server/src/LobbyRoom.test.ts:38-70 (harness pokoju)
- apps/web/src/hierarchy.test.ts:10-12
- apps/web/src/screens/Records.tsx:55-58 (formatRecord)
- apps/web/src/screens/ui.tsx:308-405 (RoundTable)

## Files
- KONCEPT.md (modify)
- ZASADY-GIER.md (modify)
- packages/games/src/memory.test.ts (modify)
- packages/games/src/kalambury.test.ts (modify)
- packages/games/src/panstwa-miasta.test.ts (modify)
- packages/games/src/kampus-tour.test.ts (modify)
- packages/games/src/piec-w-rzedzie.test.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/screens/results.test.ts (create)
- apps/web/src/hierarchy.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Lekcja 05-33: wyniki liczone wyłącznie ze stanu, `me=""` (obserwator, rekordowa partia) musi działać.

## Steps
1. KONCEPT §1: znajomi nad „Sam”, „Utwórz pokój” jako główny; solo bez licznika instrukcji; „Jeszcze raz” bez instrukcji. Tę samą regułę startu popraw w KONCEPT §3 (obie linie) i `ZASADY-GIER.md:59-60`: 15 s dotyczy tylko 2+ grających. Kontrakt `places` w KONCEPT §3: mini-gry i gry główne z remisami (D-12).
2. `results.test.ts`, `heroResult`: miejsca z `places`, także gdy `result` ma sam `ranking` (Schulte: 1, 1, 3); `result.places` Szybkiego Chińczyka; sam `winner` jak Gomoku: zwycięzca 1, reszta 2, bez różnic; walkower: jeden wiersz; drugie kryterium: równy wynik i różne miejsca → różnica z `tie`, nigdy „o 0”; to samo miejsce → bez różnicy; wynik nieskończony po limicie → wiersz z miejscem, bez liczby i bez różnicy, także u osoby niżej; gra bez `record`, gra przerwana, obserwator.
3. `results.test.ts`: `revealOrder`; `bestRound` z jedynym najmniejszym błędem → `{ round, id, error }`, remis i puste `errors` pomijane; `shouldReveal`: `playing` → `over` przy 3+ graczach tak, pierwsze renderowanie w `over` (odświeżenie) nie, `over` → `over` nie, 2 graczy nie, kolejne `playing` → `over` (rewanż) znowu tak.
4. `tables.test.tsx`: `bestRoundLine` daje „Najlepsza runda: Ola, Gdańsk, 4 km” (test pozytywny, bo `renderToStaticMarkup` nie obsługuje portalu), a z `best: false` daje null (Balon: `errors` to stuknięcia, nie błędy).
5. `LobbyRoom.test.ts`: jeden grający nie ma limitu instrukcji (`msLeft` null), pokój 2+ ma 15 s; rewanż solo ma `skipIntro`; `game.places` po końcu: Schulte z remisem 1, 1, 3; Szybki Chińczyk z `result.places`; walkower i Gomoku z samym zwycięzcą → null; w trakcie partii null.
6. Testy gier: `places` z remisem. Memory, Kalambury i Państwa-miasta: 1, 1, 3 oraz 1, 2, 2; Kampus Tour: równy majątek na górze 1, 1, 3; Gomoku: pełna plansza 1, 1. Spójne z `isOver`.
7. `hierarchy.test.ts`: jedyny wypełniony przycisk to „Utwórz pokój”, a po pełnym kodzie „Dołącz”.

## Acceptance
- [ ] Testy padają przez brak zachowania
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/memory.test.ts` → exit 1

## Result

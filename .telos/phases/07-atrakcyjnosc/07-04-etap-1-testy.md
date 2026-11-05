---
id: 07-04
title: "Etap 1: dokumenty i testy wyników (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-03]
decisions: [D-01, D-09, D-12, D-14]
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
- apps/web/src/screens/ui.tsx:421-450 (Intro)
- apps/web/src/screens/Game.tsx:96-115 (Kampus Tour wraca wcześniej)
- apps/web/src/games/KampusSummary.tsx:20-50
- apps/web/src/games/Mapa.tsx:103-120
- apps/server/src/LobbyRoom.ts:239-248 (onLeave: walkower zostawia jedno miejsce)
- packages/games/src/kampus-tour.ts:689-700 (isOver)

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
2. `results.test.ts`, `heroResult`: miejsca z `places`, także gdy `result` ma sam `ranking` (Schulte: 1, 1, 3); `result.places` Szybkiego Chińczyka; sam `winner` jak Gomoku: zwycięzca 1, reszta 2, bez różnic; walkower: jeden wiersz; drugie kryterium: równy wynik i różne miejsca → różnica z `tie`, nigdy „o 0”; to samo miejsce → bez różnicy; wynik nieskończony po limicie → wiersz z miejscem, bez liczby i bez różnicy, także u osoby niżej; gra bez `record`, gra przerwana, obserwator. Solo kontra walkower: `{ ranking: [a] }` przy `seats: [a]` → null, a `{ winner: a }` przy `seats: [a]` → tytuł zwycięzcy i jeden wiersz, więc warunek nie może patrzeć na liczbę miejsc.
3. `results.test.ts`: `revealOrder`; `bestRound` z jedynym najmniejszym błędem → `{ round, id, error }`, remis i puste `errors` pomijane; `shouldReveal`: `playing` → `over` przy 3+ graczach tak, pierwsze renderowanie w `over` (odświeżenie) nie, `over` → `over` nie, 2 graczy nie, kolejne `playing` → `over` (rewanż) znowu tak.
4. `tables.test.tsx`: `bestRoundLine` daje „Najlepsza runda: Ola, Gdańsk, 4 km” (test pozytywny, bo `renderToStaticMarkup` nie obsługuje portalu), a z `best: false` daje null (Balon: `errors` to stuknięcia, nie błędy). Bez `labels`: liczbowy nagłówek daje „runda 2”, tekstowy („4 kaw.”) zostaje. `shortUnit` zastępuje `unit`: długi opis z Tortu nie trafia do linii. Źródła gier: Mapa przekazuje `labels` z nazw miast, a Tort, Nożyczki, Środek, Zasłona, Szacowanie i Rok mają `shortUnit`.
   Render bez `record` i bez pobierania rekordów: `ResultHero` z wierszami bez `score` pokazuje miejsca i nicki; `KampusSummary` z propem `hero` pokazuje go pod tytułem; `Game.tsx` przekazuje `hero` w gałęzi `kampus-tour` (test źródła).
5. `LobbyRoom.test.ts`: jeden grający nie ma limitu instrukcji (`msLeft` null), pokój 2+ ma 15 s; rewanż solo ma `skipIntro`, a po `begin` już nie; pierwsza partia solo, rewanż 2+ i kolejna gra turnieju jednoosobowego nie mają `skipIntro`.
   Solo bez limitu instrukcji nie wisi: bez `begin` przez 59:59 `room.disconnect` nie pada, po godzinie pada; wyjście i nieudany reconnect (`allowReconnection` odrzuca) kończą partię bez wyniku; `onDispose` zwalnia limit pokoi solo na IP (przez `onAuth`). Po `begin` `msLeft` to pełny limit gry. Po rewanżu solo `msLeft` null, a stary limit nie kończy partii po czasie gry.
   `game.places` po końcu: Schulte z remisem 1, 1, 3; Szybki Chińczyk z `result.places`; walkower i Gomoku z samym zwycięzcą → null; w trakcie partii null.
6. Testy gier: `places` z remisem. Memory, Kalambury i Państwa-miasta: 1, 1, 3 oraz 1, 2, 2; Kampus Tour: równy majątek na górze 1, 1, 3, remis dalszych miejsc 1, 2, 2, biedniejszy monopolista 1 mimo majątku, dwóch bankrutów na różnych miejscach w kolejności `ranking`; Gomoku: pełna plansza 1, 1. Spójne z `isOver`.
7. `hierarchy.test.ts`: jedyny wypełniony przycisk to „Utwórz pokój”, a po pełnym kodzie „Dołącz”.

## Acceptance
- [ ] Testy padają przez brak zachowania
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/memory.test.ts` → exit 1

## Result

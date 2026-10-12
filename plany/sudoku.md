# Sudoku (`sudoku`): nowa mini-gra

## Kontekst

Nowa mini-gra: sudoku 4×4, ta sama plansza dla wszystkich, wynik = czas + kara za złe cyfry.
Mechanicznie to bliźniak Tabeli Schultego (czas z klienta, doliczana kara, ruch `progress` do pigułek),
więc kopiujemy jej wzorzec: `schulte.ts`, `schulte.test.ts`, `Schulte.tsx`.

Ustalone z użytkownikiem: **4×4, jedna plansza**, **+5 s za złą cyfrę**.

## Ustalenia (trafią do `ZASADY-GIER.md`)

- **Tożsamość**: `id` `sudoku`, nazwa „Sudoku”, 1-6 graczy, mini-gra, bez trybów, limit 120 s (`turn()` ze stałym kluczem, jak Schulte).
- **Plansza**: 4×4, bloki 2×2, cyfry 1-4. `GIVENS = 6` cyfr danych, `BLANKS = 10` do wpisania. Dokładnie jedno rozwiązanie.
- **Losowość** (serwer, `setup`, to samo dla wszystkich): pełna poprawna siatka (wzorzec bazowy + `shuffle` cyfr, wierszy w pasach,
  kolumn w pasach i samych pasów), potem usuwanie pól w wylosowanej kolejności, dopóki rozwiązanie zostaje jedno;
  jeśli zachłanne usuwanie utknie powyżej 6 danych, losujemy od nowa (pętla na `rng`).
- **Stan** (= widok, nic nie ukrywamy, komentarz `ponytail:` jak w reszcie mini-gier):
  `{ players, puzzle: number[16] (0 = puste), solution: number[16], results, progress }`.
- **Przebieg**: gracz dotyka pustego pola, potem jednej z cyfr 1-4. Dobra cyfra zostaje, zła nie zostaje w polu:
  błysk `tile-miss`, wibracja 60, `mistakes + 1`. Partia kończy się po wypełnieniu ostatniego pola.
- **Ruchy**: `{ type: "result", ms, mistakes }` oraz `{ type: "progress", filled }` (int 1-9, po każdej dobrej cyfrze poza ostatnią).
- **Wynik**: `total = ms + mistakes × 5000` (`PENALTY_MS`), mniej lepiej, bez drugiego kryterium; równe = remis bez zwycięzcy.
  `record: { lower: true, score: total }`.
- **Walidacja**: `ms` od 3000 (`BLANKS × 300`) do 120000, `mistakes` int ≥ 0, gracz z gry, bez drugiego wyniku.
  Serwer ufa klientowi co do czasu i pomyłek (jak Schulte).
- **Limit**: `timeoutMove` = `{ ms: 120000, mistakes: 0 }`.
- **Ekran końcowy**: `Scores` z „23,4 s (+5 s kary)” i wiersz przewagi zwycięzcy, bez wykresu.

## Kroki (każdy to osobny commit, wg `ZASADY.md`; commit tylko na prośbę)

0. W drzewie leży niezacommitowany ekran Tortu (`Tort.tsx`, `Game.tsx`, `Lobby.tsx`, `Records.tsx`, `ui.tsx`).
   Krok 4 dotyka tych samych plików, więc Tort trzeba zacommitować wcześniej, osobno.
1. **„Sudoku: zasady w ZASADY-GIER”**: wiersz tabeli, sekcja `### Sudoku (\`sudoku\`)`, dopisek do listy wyjątków z ruchem `progress`.
2. **„Sudoku: testy zasad”**: `packages/games/src/sudoku.test.ts` na wzór `schulte.test.ts`:
   definicja i `turn()`; setup (wspólna plansza, ten sam seed to samo, różne seedy różnie);
   dla 50 seedów: `solution` poprawne (wiersze, kolumny, bloki), dokładnie 6 danych zgodnych z `solution`, dokładnie jedno rozwiązanie
   (solver brute-force w teście, niezależny od kodu); walidacja (obcy gracz, drugi wynik, `ms` 2999/3000/120000/120001,
   pomyłki ujemne i niecałkowite, `progress` 0/1/9/10); schemat; kara 5 s (szybszy z pomyłką przegrywa); remis, solo, każdy gracz wygrywa;
   `progress` nie kończy gry i nie zmienia klucza `turn()`; `timeoutMove`; niezmienność stanu i JSON.
   Do tego `sudoku: { lower: true, good: { ms: 20_000, mistakes: 0 }, bad: { ms: 19_000, mistakes: 1 } }` w `RECORDS` w `index.test.ts`.
3. **„Sudoku: zasady (...)”**: `packages/games/src/sudoku.ts` (ok. 80 linii): stałe, `total`, generator, licznik rozwiązań (backtracking,
   przerywa przy 2), definicja z `ranked(..., (a, b) => total(a) - total(b), { lower: true, score: total })`.
   Wpis w `GAMES` i eksporty w `index.ts` (`SUDOKU_PENALTY_MS`, `SUDOKU_BLANKS`, `sudokuTotal`, `SudokuView`).
4. **„Sudoku: ekran, podpięcie w grze, lobby i rekordach”**:
   - `apps/web/src/games/Sudoku.tsx` na szkielecie `Schulte.tsx`: fazy `intro → run → sent`, `Intro` z `Preview` (mała siatka, cyfra wskakuje
     przez `preview-quarter`), `Stats` (Zostało, Kara, Twój czas), siatka 4×4 z grubszą linią między blokami, wybrane pole z obwódką
     w kolorze gracza, pod spodem 4 przyciski cyfr (min. 48 px, `onPointerDown`, `touch-none select-none`), animacje `tile-hit` / `tile-miss`.
   - `Game.tsx`: gałąź z `key` z `puzzle.join()`, wpis w `MINI_GAMES`, pigułki przez istniejące `Progress` (`x/10`).
   - `Lobby.tsx`: ikona (`GridFour`) w `ICONS`, opis w `BLURBS`. `Records.tsx`: `FORMAT` jak `schulte` (sekundy).
5. **„Sudoku: opis w KONCEPT”**: punkt w 2.4, lista gier z `progress`, limit 120 s w regułach platformy, licznik mini-gier w tabeli etapów.

## Świadomie pominięte

- 6×6 i tryby (mini-gra ma jedne zasady), notatki/kandydaci w polach, międzyczasy i wykres, weryfikacja przebiegu na serwerze.

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/sudoku.test.ts`, potem `pnpm typecheck && pnpm test`.
- `/dev?n=2` w przeglądarce (Playwright, 360×640): pełna partia, zła cyfra (kara, wibracja, pole puste), pigułki postępu u rywala,
  odświeżenie w trakcie, rewanż daje inną planszę, limit 120 s, remis/solo, wynik na ekranie „Rekordy”.

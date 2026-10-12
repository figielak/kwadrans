# Za zasłoną (`zaslona`): nowa mini-gra

## Kontekst

Nowa mini-gra „na oko”: kulka toczy się ze stałą prędkością, znika za zasłoną, a gracz dotyka w chwili,
gdy powinna dotrzeć do mety. 8 rund, wynik = suma odchyłek w ms (mniej lepiej).
Mechanicznie to bliźniak Przytrzymaj (`przytrzymaj.ts`): serwer losuje cele w ms, klient mierzy czas,
serwer liczy odchyłki z surowych czasów. Kopiujemy ten wzorzec, bez nowych abstrakcji.

## Ustalenia (krok 1 z ZASADY.md, do zatwierdzenia)

| | |
|---|---|
| `id` / nazwa | `zaslona` / „Za zasłoną” |
| Gracze / limit | 1-6, `turnSeconds: 120` (najdłuższa uczciwa partia ok. 100 s) |
| Rundy | 8 (`ROUNDS`) |
| Losowanie | na rundę dwa niezależne czasy w pełnych ms, te same dla wszystkich: `visible` 800-2000 (kulkę widać) i `hidden` 1000-4000 (za zasłoną do mety). Z nich wynika i prędkość, i szerokość zasłony (`hidden / (visible + hidden)` toru), więc obie zmieniają się co rundę |
| Ruch | jeden `{ type: "result", taps: number[] }`: ms od zniknięcia kulki do dotknięcia, int 0-8000 (`2 × MAX_HIDDEN`); pusta lista = limit czasu |
| Odchyłka rundy | `deviation(hidden, tap)` = \|tap − hidden\|, ucięta do `hidden` (jak w Przytrzymaj: dotknięcie od razu i brak dotknięcia kosztują tyle samo) |
| Wynik | suma z 8 rund w ms, liczona na serwerze; równe = remis; po limicie suma `hidden` (najgorszy możliwy) |
| Rekord | `{ lower: true }`, bez `tie` |
| Rewanż | bez `nonce`, ekran montuje się po `rounds` (16 losowych ms się nie powtarza) |

Decyzje, które podjąłem sam (popraw, jeśli chcesz inaczej):
- **Dotknięcie, gdy kulkę jeszcze widać, jest ignorowane bez kary** (jak dotknięcie poza strefą w Środku). Liczy się pierwsze dotknięcie po zniknięciu.
- **Kierunek zawsze w prawo**, tor poziomy. Meta to widoczna kreska na zasłonie (nie krawędź pola), za nią zostaje kawałek pola, żeby w odsłonie było widać przestrzelenie.
- Ekran sam kończy rundę po `2 × hidden` (dalej odchyłka i tak ucięta).
- Grający nie widzi limitu tury (tykający pasek podawałby sekundy), jak w Stoperze, Rytmie i Przytrzymaj.

## Ekran (`apps/web/src/games/Zaslona.tsx`, wzór: `Przytrzymaj.tsx`)

- Fazy: `intro` → (`run` → `reveal`) × 8 → `sent`. Runda: 1 s przerwy (`LEAD_MS`), kulka rusza z lewej.
- Kulka w kolorze gracza, pozycja liczona w `requestAnimationFrame` z `performance.now()` (wzór: `Wieza.tsx`).
  Nie CSS transition: globalna reguła `prefers-reduced-motion` w `index.css` zeruje przejścia, a pomiar nie może zależeć od animacji.
- Całe pole to jeden przycisk `touch-none select-none`, `onPointerDown`, czas z `e.timeStamp`.
- Odsłona 1,5 s (`REVEAL_MS`): zasłona robi się przezroczysta, kulka stoi tam, gdzie naprawdę była w chwili dotknięcia,
  pod spodem odchyłka ze znakiem („−0,12 s” = za wcześnie). Progi jak w Stoperze: do 100 ms zielono, ponad 500 ms `warning`.
- `Stats`: „Runda 3/8”, „Suma odchyłek”.
- `Intro` z `Preview` (kulka i zasłona na `preview-half`), trzy punkty.
- Ekran końcowy: `RoundTable` z `ui.tsx` (rundy w kolumnach, najlepszy w rundzie na tle w swoim kolorze).
  Dziś formatuje tylko procenty, więc dostaje dwa opcjonalne propsy (`format` komórki i tekst progów w legendzie)
  z domyślnymi wartościami jak teraz, żeby Tort się nie zmienił.

## Pliki, w kolejności commitów

1. **„Za zasłoną: zasady w ZASADY-GIER”**: wiersz tabeli, sekcja `### Za zasłoną (`zaslona`)`, dopisek na liście „wynik liczy serwer” w `ZASADY-GIER.md`.
2. **„Za zasłoną: testy zasad”**: `packages/games/src/zaslona.test.ts`, skopiowany układ `przytrzymaj.test.ts`
   (definicja, setup z zakresami i seedami, `deviation`, suma, walidacja brzegów 0 i 8000, schemat, koniec dla A/B/C, remis, solo, limit, niezmienność + JSON)
   oraz przypadek `zaslona: { lower: true, good: 10, bad: 200 }` w `RECORDS` w `index.test.ts`.
3. **„Za zasłoną: zasady (...)”**: `packages/games/src/zaslona.ts` (ok. 60 linii, `ranked` z `core.ts`), import, wpis w `GAMES`
   i eksport `ZASLONA_ROUNDS`, `zaslonaDeviation`, `ZaslonaView` w `index.ts`.
4. **„Za zasłoną: ekran, podpięcie w grze, lobby i rekordach”**: `Zaslona.tsx`; `screens/Game.tsx` (gałąź z `key` z `rounds`,
   wpis w `MINI_GAMES`, `zaslona` w warunku ukrywającym `Countdown`); `screens/Lobby.tsx` (`ICONS`: `EyeSlash`, `BLURBS`);
   `screens/Records.tsx` (`FORMAT`: `{ value: ms }`); `screens/ui.tsx` (propsy `RoundTable`).
5. **„Za zasłoną: opis w KONCEPT”**: punkt w 2.4, limit 120 s na liście limitów, licznik mini-gier w tabeli etapów.

Commity tylko na prośbę.

## Uwaga: niezacommitowany Tort

W drzewie roboczym leży niezacommitowany ekran Tortu (`Tort.tsx`, zmiany w `Game.tsx`, `Lobby.tsx`, `Records.tsx`, `ui.tsx`, w tym samo `RoundTable`).
Krok 4 dotyka tych samych plików, więc Tort trzeba zacommitować przed nim, inaczej oba ekrany wylądują w jednym commicie.
Kroki 1-3 są od tego niezależne.

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/zaslona.test.ts` (po kroku 2 czerwone, po kroku 3 zielone).
- `pnpm typecheck && pnpm test`.
- `/dev?n=2` na 360×640: pełna partia, obserwator, odświeżenie w trakcie, dobiegnięcie limitu, remis, rewanż (inne rundy),
  rekord na ekranie „Rekordy” i w panelu po partii, Tort dalej wygląda tak samo. Serwery dev zostają włączone.

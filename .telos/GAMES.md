# Gry
<!-- Skrót tabeli i sekcji ZASADY-GIER.md. Dokładne zasady i stałe: ZASADY-GIER.md (sekcja gry), kod i testy.
     Przed zmianą gry przeczytaj jej sekcję w ZASADY-GIER.md. `id` nigdy się nie zmienia. -->

Stare `id` po zmianie nazw (2026-10-10): Sekwencja = `simon`, Kolor liter = `stroop`, Odcień = `kolor`, Gomoku = `piec-w-rzedzie`.
Typy i wzorce do kopiowania: po kolei (`piec-w-rzedzie.ts`, `chinczyk.ts`), ukryty stan (`statki.ts`),
równoczesna z fazami (`panstwa-miasta.ts`, `turn()`), mini-gra (`stoper.ts`, jeden ruch `result`).

## Gry główne
| Gra | `id` | Gracze | Limit | Typ i najważniejsze |
|---|---|---|---|---|
| Kampus Tour | `kampus-tour` | 2-4 | 60 s | po kolei; plansza 32 pola (12×6, poziomo, `.landscape`), wybór postaci naraz; szczegóły niżej |
| Chińczyk | `chinczyk` | 2-4 | 60 s / Szybki 20 s | po kolei; tryby Klasyczny i Szybki; jedyny możliwy ruch wykonuje się sam |
| Statki | `statki` | 2 | 90 s rozstawianie, 60 s strzał | ukryty stan; tryby Klasyczny, Szybki, Amerykański (`hasbro`), Flota wojenna |
| Gomoku | `piec-w-rzedzie` | 2 | 60 s | po kolei; 15×15, 5 lub więcej w linii, jawny remis bez zwycięzcy |
| Memory | `memory` | 2-6 | 60 s | po kolei, ukryty układ; Mała 4×4, Średnia 4×6 (domyślna), Duża 6×6 |
| Labirynt | `labirynt` | 2-4 | 60 s | po kolei (Quoridor); Klasyczny 9×9 i Szybki 7×7 |
| Państwa-miasta | `panstwa-miasta` | 2-6 | per faza | równoczesna z fazami, własny nagłówek |
| Kalambury | `kalambury` | 2-6 | per faza | równoczesna, ukryte hasło, własny nagłówek |

- **Kampus Tour** (klon mechaniki Business Tour, motyw Politechniki Rzeszowskiej i Rzeszowa): rogi Początek, Kolokwium,
  Juwenalia, Bilet MPK; dwie kości, dublet = dodatkowy rzut, trzeci z rzędu = Kolokwium; 8 grup (pory dnia studenta);
  kupno, czynsz, rozbudowa do landmarku, wykup za 2× (cena + budynki) po czynszu (landmarku nie), sprzedaż bankowi za pół.
  Kolokwium: tracisz turę albo zdajesz dubletem. Juwenalia: wybrane własne pole ×2, kolejne ×3, ×4 (jedno pole naraz).
  Bilet MPK: przeskok na dowolne pole w następnej turze (bez kieszonkowego). 18 Kart Dziekanatu (`CARDS`), Opłata za akademik 15 zł,
  Ksero i Stołówka (czynsz z rzutu). Koniec: bankructwo rywali, monopol (3 pełne grupy) albo po 20 rundach największy majątek.
  Ekonomia (zatwierdzona 2026-10-07): start 200 zł + 20 zł za każde dalsze miejsce, kieszonkowe 40 zł, czynsz P/10 (cała grupa ×2),
  z budynkami 0,4P / P / 2P / 4P, budowa 0,5P za poziom, landmark P; bez kompletu tylko poziom 1, poziom 3 i landmark z kompletem.
  Otwarte (ZASADY-GIER §6, Balans): balans do sprawdzenia w partiach; przy 2 graczach landmark zwraca się po ok. 19 rundach.
  Po partii `KampusSummary.tsx` (wykres majątku, czynsze, dochód, dublety). Partia do ok. 45 min.
- **Chińczyk**: Klasyczny: wyjście tylko na 6, 3 próby bez pionka na torze, 6 = kolejny rzut, max 3 szóstki, pełny ranking.
  Pole startowe z pionkiem właściciela bezpieczne, w domku bez przeskakiwania własnych. Szybki: pionek na starcie, wyjście na 1 i 6,
  nadwyżka do domku przepada, dodatkowy rzut za zbicie i wejście do domku, koniec po pierwszym z 3 pionkami, równe dalsze miejsca (`places`).
- **Statki**: Klasyczny 10×10 (1×4, 2×3, 3×2, 4×1, bez stykania także rogami), Szybki 8×8 (4-3-2-2), Amerykański 10×10
  (5-4-3-3-2, mogą się stykać, bez X wokół zatopionego), Flota wojenna 12×12 (6-5-4-4-3-3-2-2). Losowe ustawienie z przenoszeniem
  i obracaniem, gotowość można cofnąć; trafienie = kolejny strzał; X wokół zatopionego. Po pudle plansze stoją 1,2 s (`SWAP_MS`).
- **Memory**: w turze dwie karty; para zostaje i daje kolejny ruch, po pudle karty widać 1,5 s. Najwięcej par wygrywa, remis bez zwycięzcy.
  `playerView` pokazuje symbole zebranych, pierwszej karty tury i ostatniego pudła.
- **Labirynt**: krok o pole albo ścianka na dwa pola; przeskok rywala (skośnie, gdy za nim ścianka); ścianka nie może odciąć drogi.
  Ścianki 10/7/5 (Klasyczny) i 6/4/3 (Szybki) przy 2/3/4 osobach. Po czasie losowy legalny krok, pass tylko bez kroku.
- **Państwa-miasta**: 5 rund, litery bez Ą Ć Ę Ł Ń Ó Ś Ź Ż Q V X Y (pula 22), kategorie Państwo, Miasto, Zwierzę, Roślina, Rzecz, Imię.
  Pisanie 90 s, pierwsze oddanie = STOP, reszta ma 7 s; szkic leci w tle. Głosowanie 45 s: odpada przy odrzuceniu przez ponad
  połowę pozostałych; zła litera odpada sama. Punkty 15 (jedyna ważna), 10 (unikalna), 5 (powtórzona), 0. Podsumowanie 20 s lub „Dalej” wszystkich.
- **Kalambury**: tryb Krótka (każdy rysuje raz) lub Długa (dwa razy). Rysujący wybiera 1 z 3 haseł (`kalambury-dane.ts`).
  Punkty 10, 8, 6, 5, 4 według kolejności trafień, rysujący 3 za każdego. Dwie połowy po 40 s, po pierwszej odsłania się litera
  (`hint`, tylko ruch timeoutu). Pudła widać na czacie, trafień nie. Paleta 5 kolorów + gumka; kreski w paczkach co 200 ms, do 2000 punktów w stanie.
- **Poprawka** (karciana typu Uno, 2-6, ukryte ręce): w planie, niezrobiona.

## Mini-gry (1-6 graczy, każdy u siebie to samo wyzwanie z serwera)
Wspólne: ekran `Intro`, jeden ruch `result` (+ `progress` w części), `ranked`, `record`, ranking bez zwycięzcy przy remisie i solo.
Model zaufania: czas i reakcje mierzy klient, serwer waliduje i liczy wynik z danych surowych tam, gdzie je ma.
Odświeżenie w trakcie = partia od nowa (wyjątek: Sekwencja wznawia po zaliczonej serii).

| Gra | `id` | Limit | Zadanie | Wynik (kierunek; tie) |
|---|---|---|---|---|
| Refleks | `refleks` | 60 s | 12 zmian koloru po 1-3 s | średnia reakcja ms (mniej); falstart lub > 1 s = 1000 ms |
| Sekwencja | `simon` | 300 s | powtarzanie rosnącej sekwencji 4 kolorów | najdłuższa seria (więcej); po limicie ostatnia zaliczona |
| Stoper | `stoper` | 60 s | licznik znika po 3 s, dotknij po 10 s | odchyłka ms (mniej) |
| Tabela Schultego | `schulte` | 180 s | 1-25 po kolei w siatce 5×5 | czas + 3 s za pomyłkę (mniej); ukończeni przed timeoutami |
| Kolor liter | `stroop` | 90 s | 30 s, kolor liter napisu (czwórki z jedną zgodną) | trafienia (więcej; niższa średnia) |
| Liczenie | `liczenie` | 90 s | 30 s działań, 4 odpowiedzi, rodzaje potasowanymi czwórkami | jak Kolor liter |
| Narysuj koło | `kolo` | 120 s | do 10 prób, liczy się najlepsza | % idealności (więcej), liczy serwer |
| Odcień | `kolor` | 180 s | 5 kolorów po 2 s, odtworzenie suwakami HSB | suma ΔE Lab, każda ≤ 100 (mniej) |
| Policz kropki | `kropki` | 120 s | 10 rund, 8-40 kropek (razem 240) przez 1,5 s | suma błędów (mniej); timeout `max(n, 99-n)` |
| Kąt | `kat` | 120 s | 10 rund, kąt 5-175° przez 1,5 s | suma odchyłek ° (mniej) |
| Który rok? | `rok` | 270 s | 10 wydarzeń, suwak 1900-2025, runda ≤ 20 s | suma odchyłek lat (mniej) |
| Środek | `srodek` | 60 s | 10 odcinków, dotknij środka | suma błędów % długości (mniej); > 60 px od odcinka ignorowane |
| Stój! | `stoj` | 60 s | 30 s, zielone dotknij, czerwone (co trzeci) nie | trafienia − 2×błąd ≥ 0 (więcej; średnia reakcji) |
| Śledzenie | `sledzenie` | 360 s | do 20 rund, 8 kulek, 3 cele | zaliczone rundy (więcej; trafione cele w rundzie z pomyłką) |
| Wieża | `wieza` | 180 s | do 30 pięter, zatrzymaj klocek | wysokość (więcej; szerszy ostatni klocek) |
| Rytm | `rytm` | 60 s | 8 uderzeń 100 BPM, potem 10 s samemu | średnia odchyłka odstępów ms (mniej); bez licznika i paska |
| Inny element | `inny` | 90 s | 30 s, znajdź inny wielokąt, siatka 2×2 → 6×6 | jak Kolor liter |
| Obrót | `obrot` | 90 s | 30 s, „Ta sama” albo „Lustro” (szóstki rodzajów) | trafienia − pomyłki ≥ 0 (więcej; średnia) |
| Literówka | `literowka` | 90 s | 30 s, 4 słowa, jedno z błędem (ó/u, rz/ż, ch/h) | jak Obrót |
| Mapa | `mapa` | 180 s | 10 z 62 miast na konturze Polski | suma km (mniej) |
| Przytrzymaj | `przytrzymaj` | 120 s | 5 rund, czas 1-5 s (razem 15 s), trzymaj tyle samo | suma odchyłek ms (mniej); bez licznika |
| Balon | `balon` | 120 s | 10 balonów, komplet wytrzymałości 11-20 (suma 155) | zgarnięte punkty (więcej; mniej pękniętych) |
| W pamięci | `w-pamieci` | 300 s | do 12 rund, ciąg działań po 1,5 s, floor(n/3) mnożeń | zaliczone rundy (więcej; mniejsza odchyłka w błędnej) |
| Dziesiątki | `dziesiatki` | 90 s | 30 s, pary dające 10 w siatce 4×4 | pary (więcej; średnia) |
| Tort | `tort` | 120 s | 5 tortów na 3-7 równych kawałków | suma błędów % (mniej) |
| Zakupy | `zakupy` | 80 s | lista 10 przez 10 s, potem półka 20, auto-oddanie po 50 s | trafienia − błędne ≥ 0 (więcej; krótszy czas) |
| Za zasłoną | `zaslona` | 120 s | 8 rund, kulka za zasłoną 1-4 s (razem 20 s) | suma odchyłek ms (mniej); bez limitu na ekranie |
| Nożyczki | `nozyczki` | 60 s | 5 kształtów, przetnij na pół jednym ruchem | suma odchyłek pp (mniej) |
| Sudoku | `sudoku` | 120 s | 4×4, 10 cyfr do wpisania, zła cyfra +5 s | czas + kara (mniej); ukończeni przed timeoutami |
| Trzy kubki | `kubki` | 180 s | do 20 rund, 4+ zamian (500 → 150 ms) | zaliczone rundy (więcej, bez tie) |

- Pomyłka w grach na czas: blokada 1 s albo doliczony czas, nigdy koniec partii. Gry do pierwszej pomyłki: Kubki, Śledzenie, Wieża, W pamięci.
- `progress` (postęp rywali na kropkach): Schulte, Sudoku, Kropki, Kąt, Który rok?, Wieża, Balon, Sekwencja.
- Wspólne moduły: `quiz.ts` + `Quiz.tsx` (Kolor liter, Liczenie, Inny element, Obrót, Literówka; Dziesiątki biorą walidację i tabelę),
  `Szacowanie.tsx` (Kropki, Kąt), dane: `kalambury-dane.ts`, `literowka-dane.ts`, `mapa-dane.ts`.
- Pomiar reakcji Refleksu i Stój! od pierwszej klatki z bodźcem (rAF) do `e.timeStamp` (`stimulus.ts`); Stoper i Wieża od własnego
  startu przez `performance.now()`. Narzędzie porównania: `?zegar` (`clock.ts`).

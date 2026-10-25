# 03-04 FINDINGS: gry główne (bez Kampus Tour) i Turniej

**Data:** 2026-10-24 · **Plan:** 03-04 (fala 2) · **Gry:** `piec-w-rzedzie`, `labirynt`, `statki`, `chinczyk`, `memory`, `panstwa-miasta`, `kalambury`, `turniej`.
Model limitu z `03-02-BASELINE.md` §1.4 (najdłuższa tura + zapas ≥ 20% i ≥ 10 s). Symulacje botami w scratchpadzie (`main.ts`, `turniej.ts`, załącznik), seedy od 1, z `setup` / `validateMove` / `applyMove` gry.
Wynik bota to sygnał, nie dowód (D-08): przewaga kolejności u botów zależy od ich strategii. Pewność: **W** wyliczone, **Z** zmierzone (symulacja), **A** założenie.
Rotacja miejsc przy rewanżu (`KONCEPT.md` §3: „kolejność miejsc rotuje”) liczy się jako kompensata (D-09). Repo poza `.planning/` bez zmian.

## Gomoku (`piec-w-rzedzie`)

**Przewaga kolejności (DIFF-03)**
- Zaczyna `players[0]` (`ZASADY-GIER.md` :570). Wolne Gomoku 15×15 z „5 lub więcej” jest rozwiązane: pierwszy gracz wygrywa przy idealnej grze (znany wynik teorii gier, Allis 1994).
  Między znajomymi idealnej gry nie ma, ale przewaga inicjatywy jest w Gomoku wyraźna (A). Kompensata: rotacja przy rewanżu, więc przy parzystej liczbie partii kolejność się wyrównuje.
  Pierwsza partia w pokoju i każda nieparzysta zostają nierówne.
- Tanie zasady wyrównujące, gdyby partie pokazały dużą przewagę: swap (drugi gracz po trzech pierwszych kamieniach wybiera kolor), zakaz drugiego kamienia pierwszego gracza blisko środka (pro), wygrana tylko dokładnie piątką.

**Tryby (DIFF-03)**
- Bez trybów. Bez wpisu.

**Limit tury (DIFF-02)**
- 60 s na kamień (`packages/games/src/piec-w-rzedzie.ts:54`), bez animacji blokujących. Najdłuższa decyzja w Gomoku to kilkanaście-kilkadziesiąt sekund (A). Zgodne.
  `timeoutMove` = losowe wolne pole: w Gomoku to prawie przegrana, ale „ruch, nie przegrana” to reguła platformy (`ZASADY.md` :89). Bez wpisu.

**Rekomendacja:** sprawdzić w partii (zapisać, jak często wygrywa zaczynający). Przy przewadze wyraźnie ponad 60%: swap po trzech kamieniach.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-GO1 | `packages/games/src/piec-w-rzedzie.ts` (setup, tura od `players[0]`); `ZASADY-GIER.md` :570-571 | `KONCEPT.md` §9 / kryterium 5 roadmapy | niska (kompensata rotacją) | zbierać wygrane zaczynającego w partiach; przy dużej przewadze zasada swap (drugi gracz wybiera kolor po 3 kamieniach) `[zbiorcze: przewaga-pierwszego]` | sprawdzić w partii | A (teoria) |

## Labirynt (`labirynt`)

**Przewaga kolejności (DIFF-03)**
Bot: krok najkrótszą drogą (`timeoutMove`), a gdy rywal jest bliżej celu, najlepsza ścianka (największy przyrost drogi lidera minus przyrost własnej, tylko przy zysku ≥ 1), 15% losowo bez ścianki.

| tryb | 2 os. | 3 os. | 4 os. | ruchów (2 / 3 / 4) |
|---|---|---|---|---|
| Klasyczny 9×9 | 58,2% / 41,8% (600 partii) | 21,0 / 34,0 / 45,0% (300) | 13,7 / 19,3 / 32,3 / 34,7% (300) | 72 / 86 / 91 |
| Szybki 7×7 | 49,7% / 50,3% (600) | 22,7 / 23,3 / 54,0% (300) | 18,7 / 16,3 / 27,0 / 38,0% (300) | 42 / 48 / 54 |

- 2 osoby: w Klasycznym zaczynający wygrywa 58% (Z); w Szybkim równo. Quoridor ma znaną, niewielką przewagę zaczynającego (A).
- 3-4 osoby: **ostatni w kolejności wygrywa 35-54%, pierwszy 14-23% (Z)**. Boty stawiają ścianki liderowi, a pierwszy gracz jest liderem najwcześniej. Ludzie robią to samo („bij lidera”, A), więc efekt jest prawdopodobny,
  choć jego wielkość zależy od strategii. Kompensata: rotacja miejsc przy rewanżu, ale pełna wymaga 3-4 partii.
- Ścianki na osobę maleją z liczbą graczy (10 / 7 / 5, Szybki 6 / 4 / 3, `packages/games/src/labirynt.ts:5`), suma ścianek jest więc podobna (20 / 21 / 20, Szybki 12 / 12 / 12). Zgodne.

**Tryby (DIFF-03)**
- Szybki 7×7: partia ok. 40% krótsza (42 kontra 72 ruchy przy 2 osobach, Z) i bez przewagi zaczynającego przy 2 osobach. Ścianek 6 / 4 / 3 wystarcza, żeby gra nie była samym wyścigiem (każdy gracz stawia średnio kilka). Zachowuje sens. Bez wpisu.

**Limit tury (DIFF-02)**
- 60 s na ruch (`:134`), bez animacji blokujących. Wybór ścianki to najdłuższa decyzja: kilkanaście-kilkadziesiąt sekund (A). Zgodne.
  `timeoutMove` = najlepszy krok (odstępstwo F1 D-11, nie kara). Bez wpisu.

**Rekomendacja:** sprawdzić w partii wygrane według miejsca przy 3-4 osobach. Jeśli efekt się potwierdzi, rozważyć dodatkową ściankę dla pierwszych graczy albo start od losowego gracza.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-LB1 | `packages/games/src/labirynt.ts:138` (setup, tura od miejsca 0); `ZASADY-GIER.md` :834-835 | kryterium 5 roadmapy | średnia (3-4 os.) / niska (2 os.) | przy 3-4 osobach: zaczyna losowy gracz albo pierwsi w kolejności dostają +1 ściankę; przy 2 osobach w Klasycznym rotacja wystarcza `[zbiorcze: przewaga-pierwszego]` | sprawdzić w partii | Z (boty), A (ludzie) |

## Statki (`statki`)

**Przewaga kolejności (DIFF-03)**
Bot: polowanie po trafieniu (wzdłuż linii dwóch trafień, inaczej sąsiedzi), poza tym losowe pola w szachownicę. 2000 partii na tryb.

| tryb | plansza, flota | gęstość floty | zaczynający wygrywa | strzałów / tur na partię |
|---|---|---|---|---|
| Szybki | 8×8, 4-3-2-2 | 17% | 51,4% | 50 / 34 |
| Amerykański | 10×10, 5-4-3-3-2, stykanie | 17% | 50,8% | 90 / 61 |
| Klasyczny | 10×10, 4-3-3-2-2-2-1-1-1-1 | 20% | 52,2% | 103 / 68 |
| Flota wojenna | 12×12, 6-5-4-4-3-3-2-2 | 20% | 54,5% | 119 / 69 |

- Przewaga zaczynającego jest mała (1-4,5 pkt %, Z) i rośnie z liczbą strzałów, bo trafienie daje kolejny strzał. Kompensata rotacją. Bez wpisu powyżej niskiej.

**Tryby (DIFF-03)**
- Tryby układają się od krótkiego do długiego (34-69 tur, Z), zgodnie z `ZASADY-GIER.md` :578. Szybki zachowuje sens (ta sama mechanika, mniej strzałów). Bez wpisu.

**Limit tury (DIFF-02)**
- Rozstawianie: jeden licznik 90 s (`packages/games/src/statki.ts:25`), flota już wylosowana, więc wystarczy „Gotowe” albo kilka przesunięć (A). Strzał: 60 s (`:148`), animacja zamiany `SWAP_MS` 1,2 s (F2) mieści się z zapasem. Zgodne.

**Rekomendacja:** zostawić.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-ST1 | `packages/games/src/statki.ts` (bitwa od `players[0]`); `ZASADY-GIER.md` :592 | kryterium 5 roadmapy | niska | brak zmian; w Flocie wojennej 54,5% u botów, do obserwacji `[zbiorcze: przewaga-pierwszego]` | zostawić | Z |

## Chińczyk (`chinczyk`)

**Przewaga kolejności (DIFF-03)**
Bot: zbicie, jeśli możliwe; inaczej wejście do domku, wyjście z bazy, najdalszy pionek. 1000 partii na wariant.

| tryb | 2 os. | 3 os. | 4 os. | rzutów / kroków pionków (2 / 3 / 4 os.) |
|---|---|---|---|---|
| Klasyczny | 49,8 / 50,2% | 33,7 / 36,2 / 30,1% | 24,4 / 23,1 / 26,2 / 26,3% | 151 / 305 / 524 rzutów; 380 / 716 / 1180 kroków |
| Szybki | 51,5 / 48,5% | 34,3 / 33,5 / 32,2% | 25,1 / 26,1 / 25,9 / 22,9% | 93 / 161 / 262 rzutów; 289 / 479 / 751 kroków |

- Bez istotnej przewagi kolejności (różnice w granicach szumu ±3 pkt % przy 1000 partii, Z). Zgodne.

**Tryby (DIFF-03)**
- Długość z animacji (W z Z): Klasyczny 4 os. = 524 × `ROLL_MS` 0,7 s + 1180 × `STEP_MS` 0,18 s ≈ 579 s animacji + ok. 2 s decyzji na rzut ≈ 27 min; 2 os. ≈ 8 min.
  Szybki 4 os. = 262 × 0,4 s + 751 × 0,11 s ≈ 188 s + ok. 1,5 s na rzut ≈ 10 min, zgodnie z „około 10 minut” (`ZASADY-GIER.md` :620). Szybki zachowuje sens. Bez wpisu.

**Limit tury (DIFF-02)**
- Klucz zmienia się po każdym rzucie i ruchu (`ZASADY-GIER.md` :618), więc rzut i wybór pionka mają osobne limity. Szybki 20 s: animacja przed akcją do 0,4 + 6 × 0,11 = 1,06 s (F2:C8)
  + 5 s decyzji + 3 s sieci = 9,1 s; zapas 10,9 s (120%). Klasyczny 60 s: do 0,7 + 6 × 0,18 = 1,8 s animacji, zapas duży. F2:C8 zamknięte: ok. 1 s z 20 s nie zagraża limitowi.

**Rekomendacja:** zostawić.

Bez wpisów.

## Memory (`memory`)

**Przewaga kolejności (DIFF-03)**
Boty z pamięcią wspólną (każdy widzi te same karty): pełna albo ostatnie 6 kart. Bot bierze znaną parę, inaczej odkrywa nieznaną kartę i, jeśli zna jej parę, dobiera ją. 2000 partii na wariant.

| tryb | pamięć | 2 os. (miejsce 1 / 2 / remis) | 3 os. (1 / 2 / 3 / remis) |
|---|---|---|---|
| Mała 4×4 | pełna | 46,6 / 42,6 / 10,8% | 13,7 / 43,3 / 34,0 / 9,0% |
| Mała 4×4 | 6 kart | 41,3 / 37,9 / 20,8% | 26,3 / 24,6 / 26,8 / 22,4% |
| Średnia 4×6 | pełna | 43,3 / 46,7 / 10,1% | 29,9 / 41,9 / 22,0 / 6,2% |
| Średnia 4×6 | 6 kart | 41,6 / 40,1 / 18,3% | 30,9 / 28,2 / 27,0 / 13,9% |
| Duża 6×6 | pełna | 47,7 / 43,8 / 8,6% | 24,3 / 35,4 / 35,5 / 4,8% |
| Duża 6×6 | 6 kart | 42,5 / 41,9 / 15,7% | 29,9 / 27,8 / 29,6 / 12,6% |

- Przy doskonałej pamięci kolejność ma znaczenie, szczególnie w Małej przy 3 osobach: pierwszy wygrywa 13,7%, drugi 43,3% (Z), bo pierwszy odkrywa karty, z których korzystają następni.
  Przy ograniczonej pamięci (bliżej ludzi, A) różnice znikają. Remis na górze (bez zwycięzcy) to 5-22% partii (Z), najwięcej w Małej.

**Tryby (DIFF-03)**
- Długość: 25 / 38 / 57 odkryć przy pełnej pamięci, 31 / 56 / 105 przy 6 kartach (Z). Mała z 8 parami częściej kończy się remisem (do 22%). Wszystkie zachowują sens. Bez wpisu.

**Limit tury (DIFF-02)**
- 60 s na odkrycie (`packages/games/src/memory.ts:52`), pudło widać 1,5 s, ale następny gracz może odkryć wcześniej (`ZASADY-GIER.md` :759-760). Zgodne.

**Rekomendacja:** zostawić; w partiach zapisać wygrane według miejsca w Małej przy 3+ osobach.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-ME1 | `packages/games/src/memory.ts:56` (setup, tura od `players[0]`); `ZASADY-GIER.md` :754 | kryterium 5 roadmapy | niska | brak zmian w zasadach; jeśli partie pokażą przewagę drugiego gracza w Małej, w trybie Mała przy 3+ osobach zaczynać od losowego gracza `[zbiorcze: przewaga-pierwszego]` | sprawdzić w partii | Z (boty), A (ludzie) |

## Państwa-miasta (`panstwa-miasta`)

**Przewaga kolejności (DIFF-03)**
- Wszyscy piszą naraz, kolejności nie ma. Odpowiednik przewagi to STOP: kto odda pierwszy, daje reszcie 7 s (`packages/games/src/panstwa-miasta.ts:43`). 7 s wystarcza na dokończenie jednego słowa na telefonie (A). Zgodne.
- Litery `ABCDEFGHIJKLŁMNOPRSTUWZ` (`:6`). Litery mają różną liczbę odpowiedzi (A). Skrajny przypadek: **na Ł nie ma państwa w języku polskim**, więc w tej rundzie kategoria Państwo daje wszystkim 0.
  Jest to równe dla wszystkich w partii, a gra nie ma rekordów, więc to tylko słabsza runda. Niska waga.

**Tryby (DIFF-03)**
- Bez trybów. Bez wpisu.

**Limit tury (DIFF-02)** (`:43`, `turn()` `:153`)
- Pisanie 90 s: 6 kategorii × (5-8 s wpisania + kilka s myślenia, A) ≈ 60-80 s dla wolnego gracza; zapas mały, ale STOP i tak skraca rundę. Zgodne.
- Głosowanie 45 s: przy 6 graczach każdy przegląda 6 × 5 = 30 cudzych odpowiedzi, czyli 1,5 s na odpowiedź (W). Przy 2-4 graczach 6-18 odpowiedzi, wystarczy.
  Przy 5-6 graczach ciasno (A); limit po czasie = „nic nie odrzucam”, więc złe odpowiedzi przechodzą. Średnia waga, tanio do poprawy (limit zależny od liczby graczy).
- Podsumowanie 20 s z „Dalej”. Zgodne.

**Rekomendacja:** zmienić limit głosowania przy 5-6 graczach; opcjonalnie bez Ł.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-PM1 | `packages/games/src/panstwa-miasta.ts:43`, `:153`; `ZASADY-GIER.md` :637 | `ZASADY.md` §3 :106 (limit = najdłuższa uczciwa faza + zapas) | średnia | głosowanie `20 + 7 × (n − 1)` s (2 os. 27 s, 4 os. 41 s, 6 os. 55 s) `[zbiorcze: limit-tury-bez-zapasu]` | sprawdzić w partii (6 os.), potem zmienić | W (liczba odpowiedzi), A (czas czytania) |
| B-PM2 | `packages/games/src/panstwa-miasta.ts:6` | kryterium 5 roadmapy (balans) | niska | usunąć Ł z `LETTERS` (brak państw) albo zostawić jako znaną słabszą rundę i dopisać w `ZASADY-GIER.md` | zostawić albo zmienić (tanio) | W |

## Kalambury (`kalambury`)

**Przewaga kolejności (DIFF-03)**
- Każdy rysuje tyle samo razy (Krótka 1, Długa 2; `ZASADY-GIER.md` :793-794), więc kolejność rysowania jest symetryczna. Ostatni rysujący zna tabelę, ale niewiele z tego ma (dobre rysowanie pomaga też zgadującym).
- Punkty rundy (W, `GUESS_POINTS` 10 / 8 / 6 / 5 / 4, `DRAWER_POINTS` 3): rysujący maks. 3 × (n − 1), czyli 3 pkt przy 2 os., 15 pkt przy 6 os.; zgadujący maks. 10.
  Przy 2 osobach rysowanie daje 3, a zgadywanie 10 pkt: wynik zależy prawie tylko od zgadywania (szybkość pisania na telefonie, A). Przy 6 osobach rysujący może dostać 15, więcej niż najszybszy zgadujący.
  Waga rysowania rośnie więc z liczbą graczy. To cecha gry, nie błąd: każdy rysuje tyle samo. Niska waga, do obserwacji przy 2 osobach.

**Tryby (DIFF-03)**
- Krótka i Długa różnią się tylko liczbą rund. Długa zmniejsza wpływ jednego trudnego hasła. Bez wpisu.

**Limit tury (DIFF-02)** (`packages/games/src/kalambury.ts:28-29`, `turn()` `:220`)
- Wybór 15 s (trzy hasła), rysowanie 2 × 40 s, odsłona 6 s z „Dalej”. Najdłuższa uczciwa faza to rysowanie; 80 s to cecha gry, nie limit decyzji. Zgodne.

**Rekomendacja:** zostawić; przy 2 osobach rozważyć więcej punktów dla rysującego (np. 5).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-KA1 | `packages/games/src/kalambury.ts` (`GUESS_POINTS`, `DRAWER_POINTS`); `ZASADY-GIER.md` :817 | kryterium 5 roadmapy | niska | `DRAWER_POINTS` zależne od liczby graczy (np. 5 przy 2 os.) albo bez zmian | sprawdzić w partii | W |

## Turniej (`turniej`)

**Przewaga kolejności (DIFF-03)**
- Mini-gry grają wszyscy naraz, kolejności nie ma. Punkty za grę = liczba graczy ze ściśle gorszym miejscem (`packages/games/src/turniej.ts:71`).
- Dogrywka przy równych szansach w każdej grze (symulacja 20 000 turniejów na wariant, losowe miejsca bez remisów, Z):

| graczy | 3 gry | 5 gier | 8 gier (domyślnie) |
|---|---|---|---|
| 2 | 0% | 0% | **27,5%** (remis 4:4) |
| 3 | 5,6% | 9,3% | 6,1% |
| 4 | 9,0% | 5,8% | 3,7% |
| 6 | 7,5% | 4,5% | 3,1% |

  Remis bez zwycięzcy po dogrywce: 0-0,6% (Z). Przy 2 graczach i parzystej liczbie gier co czwarty turniej idzie do dogrywki (punkty i wygrane to wtedy to samo).
- Gry o częstych remisach (Sekwencja, Trzy kubki, Zakupy na 10 pkt; 03-05, 03-06, 03-08) dają remisującym te same punkty, co spłaszcza tabelę i zwiększa liczbę dogrywek (A, bez symulacji).
- Losowanie gier nie równoważy rodzajów (np. 8 gier z samych quizów jest możliwe). Niska waga.

**Tryby (DIFF-03)**
- Bez trybów; długość 3 do liczby niewykluczonych. Bez wpisu.

**Limit tury (DIFF-02)**
- Każda gra ma swój limit (03-05..03-08); między grami 15 s albo „Dalej” od wszystkich (`:8`). Zgodne.

**Rekomendacja:** zostawić; opcjonalnie domyślna liczba gier nieparzysta (7 albo 9), żeby przy 2 graczach nie było dogrywek co czwarty turniej.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-TU1 | `packages/games/src/turniej.ts` (`DEFAULT_LENGTH` 8); `ZASADY-GIER.md` :775 | kryterium 5 roadmapy | niska | `DEFAULT_LENGTH` 7 albo 9 (przy 2 graczach dogrywka 0%, przy 3-6 bez zmian istotnych) | zmienić (tanio) albo zostawić | Z |

## Podsumowanie grupy

| gra | przewaga kolejności | tryby | limit tury | rekomendacja |
|---|---|---|---|---|
| `piec-w-rzedzie` | B-GO1 niska (teoria: wygrywa pierwszy) | bez trybów | ✓ | sprawdzić w partii |
| `labirynt` | B-LB1 średnia (3-4 os.), 2 os. Klasyczny 58% | ✓ Szybki | ✓ | sprawdzić w partii |
| `statki` | B-ST1 niska (51-54,5%) | ✓ | ✓ | zostawić |
| `chinczyk` | ✓ (równo) | ✓ (Szybki ok. 10 min) | ✓ (F2:C8 zamknięte) | zostawić |
| `memory` | B-ME1 niska (zależy od pamięci) | ✓ | ✓ | zostawić |
| `panstwa-miasta` | B-PM2 niska (litera Ł) | bez trybów | B-PM1 średnia (głosowanie przy 6 os.) | zmienić |
| `kalambury` | B-KA1 niska | ✓ | ✓ | zostawić |
| `turniej` | B-TU1 niska (dogrywki przy 2 os.) | – | ✓ | zostawić |

Wpisy: wysokie 0, średnie 2, niskie 6.

## Załącznik: symulacje

`main.ts` (argument `lab`, `ch`, `st`, `mem`) i `turniej.ts` w scratchpadzie sesji; uruchomienie z `packages/games`: `node <scratchpad>/main.ts st`.
Labirynt to ok. 11 min dla wszystkich wariantów (BFS po każdej ściance), reszta poniżej 20 s. Strategie botów opisane przy każdej grze; seedy 1..G, Turniej `createRng(n·100 + L)`.

# 03-01 CHECKS: stałe, symulacja `setup` i baza wyników

**Data:** 2026-10-24 · **Plan:** 03-01 (fala 1) · **Metoda:** grep i czytanie stałych (`packages/games/src/<id>.ts`, `apps/web/src/games/<Gra>.tsx`),
skrypt `sim.ts` (Node 24, `--experimental-strip-types` domyślnie, import z `packages/games/src`, seedy 1..1000, Śledzenie 1..300), skrypt `db.ts` (`node:sqlite`, kopia bazy, tylko do odczytu).
Repo poza `.planning/` bez zmian. Ten plik zbiera liczby i niczego nie ocenia. Oceny robią plany 03-05..03-08, wstępne obserwacje są w §4.

## 1. Stałe

Kolumny: rundy / bodźce (stałe czy losowe), wewnętrzny limit gry, `turnSeconds`, czasy stałe wydłużające partię (serwer i klient), losowanie, `record` i `tie`, `timeoutMove`, progresja.
Ścieżki: `S` = `packages/games/src/`, `W` = `apps/web/src/games/`. Kierunki `lower` i obecność `tie` przepisane z F1 §3 (zgodne z dokumentami we wszystkich 30 grach, D-03).

### 1.1 Na czas i reakcję

| gra | rundy / bodźce | limit wewn. | `turnSeconds` | czasy stałe | losowanie | `record` / `tie` | `timeoutMove` | progresja |
|---|---|---|---|---|---|---|---|---|
| `refleks` | 12 zmian, stałe (`S/refleks.ts:5`) | reakcja ponad 1 s = 1000 ms (`:8`), falstart = 1000 ms (`W/Refleks.tsx:158`, `:177` 800 ms pauzy) | 60 (`:31`) | opóźnienia 1-3 s z serwera (`:36`), suma 17,5-30 s (§2) | osobne `rng()` na opóźnienie (`:36`) | mniej lepiej (średnia ms, `Math.round`, `:48`) / brak | `times: []` → 1000 ms (`:58`, `:48`) | brak |
| `simon` | seria do 100 (`S/simon.ts:5`), koniec po pomyłce | brak | 300 (`:25`) | odtwarzanie: 600 ms + n × (450 + 150) ms (`W/Simon.tsx:21-22`, `:61-64`) | osobne `rng()` na kolor (`:30`), powtórzenia dozwolone | więcej lepiej / brak | `score: 0` (`:45`) | długość +1 na rundę; tempo stałe 600 ms na kolor |
| `stoper` | 1 próba | licznik widać 3 s (`S/stoper.ts:5`) | 60 (`:27`) | odliczanie 3 s (`W/Stoper.tsx:14`) + cel 6-14 s | cel `6000 + floor(rng·9)·1000` (`:30`) | mniej lepiej (odchyłka ms) / brak | odchyłka = cel (`:43`) | brak |
| `stoj` | 41 bodźców, 27 zielonych i 14 czerwonych, stałe (`S/stoj.ts:14-20`, `:54-55`) | 30 s (`:4`) | 60 (`:45`) | harmonogram stały: odstęp 1000 → 500 ms (`:6-7`), świecenie 60% odstępu (`:9`) | `shuffle` czerwonych w stałym harmonogramie (`:54`) | więcej lepiej (trafienia − 2 × błąd, `:11`) / średnia reakcji `Math.round` (`:80`) | `taps: []` → 0 (`:84`) | odstęp maleje liniowo z czasem (`:16`) |
| `rytm` | 8 uderzeń + 10 s stukania (`S/rytm.ts:5`, `:7`), do 60 stuknięć (`:11`) | 10 s | 60 (`:45`) | 1 s wstępu (`W/Rytm.tsx:16`) + 8 × odstęp + 10 s | tempo 70-130 BPM co 5 (`:8-10`, `:50`), 13 wartości | mniej lepiej (średnia odchyłka ms, pominięte = odstęp, `:35`) / brak | `taps: []` → najgorszy (`:69`) | brak |
| `przytrzymaj` | 5 rund (`S/przytrzymaj.ts:4`) | brak | 120 (`:35`) | 1 s wstępu (`W/Przytrzymaj.tsx:17`), cele razem 15 s, odsłona 1,5 s (`:19`) | `withSum(5, 1000, 5000, 15000)` (`:40`) | mniej lepiej (suma odchyłek, ucięta do celu) / brak | `holds: []` (`:64`) | brak |
| `zaslona` | 8 rund (`S/zaslona.ts:4`) | brak | 120 (`:41`) | 1 s wstępu (`W/Zaslona.tsx:16`), widoczność 0,8-2 s (`:6-7`), za zasłoną 1-4 s, razem 20 s (`:9-12`), odsłona 1,5 s (`W:18`) | ukryty czas `withSum` (`:45`), widoczność osobnym `rng()` (`:32`) | mniej lepiej (suma odchyłek, ucięta) / brak | `taps: []` (`:68`) | brak |
| `balon` | 10 balonów (`S/balon.ts:4`) | brak | 120 (`:28`, `:43`) | pauza 800 ms po balonie (`W/Balon.tsx:16`) | wytrzymałość `withSum(10, 1, 30, 155)` (`:53`) | więcej lepiej / mniej pękniętych (`:73`) | `pumps: []` → 0 (`:77`) | brak |

### 1.2 Na trafienia

Wspólne: `S/quiz.ts`: 30 s (`:6`), odpowiedź 150-5000 ms (`:7-8`), 200 plansz w stanie (`QUESTIONS = 30000 / 150`, `:10`), blokada 1 s po pomyłce (`W/Quiz.tsx:33`);
`validQuiz` odrzuca sumę czasów ponad 30 s (`quiz.ts:31`). `timeoutMove` wszędzie `times: [], errors: 0` → 0 pkt.

| gra | rundy / bodźce | limit wewn. | `turnSeconds` | czasy stałe | losowanie | `record` / `tie` | progresja |
|---|---|---|---|---|---|---|---|
| `stroop` | do 200 plansz | 30 s | 90 (`S/stroop.ts:28`) | blokada 1 s | czwórki z dokładnie jedną zgodną (`:35-38`), kolory osobnym `rng()` | więcej lepiej (trafienia) / średnia `Math.round` (`:50`) | brak |
| `liczenie` | do 200 | 30 s | 90 (`S/liczenie.ts:60`) | blokada 1 s | rodzaj działania osobnym `rng()` (`:32`), liczby `between` (`:17`) | jak `stroop` (`:71`) | brak |
| `inny` | do 200 | 30 s | 90 (`S/inny.ts:44`) | blokada 1 s | rodzaje kompletami `shuffle` (`:51`), kształt w pierwszych 8 planszach (`:16`) | jak `stroop` (`:83`) | siatka 2×2 → 6×6 (`:5`, kolumna i wiersz na zmianę), różnica maleje do planszy 16 (`:7`, `:34`): obrót 40 → 8°, jasność 20 → 5, rozmiar 20 → 10% (`:9-14`) |
| `obrot` | do 200 | 30 s | 90 (`S/obrot.ts:60`) | blokada 1 s | lustro `rng() < 0,5` (`:68`), kąt `1 + int(3)` (`:72`) | więcej lepiej (trafienia − pomyłki) / średnia `Math.round` (`:84`) | klocki 4 → 7, +1 co 3 pary (`:5-7`) |
| `literowka` | do 200 | 30 s | 90 (`S/literowka.ts:29`) | blokada 1 s | talia 181 par tasowana, 4 słowa na planszę (`:38-39`), 45 plansz bez powtórzeń | jak `obrot` (`:52`) | brak |
| `dziesiatki` | do 200 par | 30 s | 90 (`S/dziesiatki.ts:44`) | blokada 1 s | plansza 4×4 i dostawy cyfr 1-9 osobnym `rng()` (`:48-58`), `take` gwarantuje parę | jak `stroop` (`:67`) | brak |
| `schulte` | 25 liczb | brak | 180 (`S/schulte.ts:27`, `:35`) | brak | układ `shuffle` (`:45`) | mniej lepiej (ms + 3 s × pomyłka, `:6`, `:71`) / brak | brak |
| `sudoku` | 10 pustych pól (`S/sudoku.ts:7`) | brak | 120 (`:12`, `:84`) | brak | pełna plansza ze wzorca + `shuffle`, usuwanie z kontrolą jednego rozwiązania (`:58-80`) | mniej lepiej (ms + 5 s × pomyłka, `:9`, `:108`) / brak | brak |
| `zakupy` | lista 10 z półki 20 (`S/zakupy.ts:5-6`) | 10 s pokazu + do 50 s (`:8-9`) | 60 (`:37`, `:54`) | pokaz 10 s | `shuffle` przedmiotów i listy (`:59-60`) | więcej lepiej (trafienia − złe) / czas ms (`:81`) | brak |

`schulte` i `sudoku`: `timeoutMove` = cały limit bez pomyłek (`schulte.ts:75`, `sudoku.ts:112`), co F1:W7a opisuje jako lepsze od wyniku z dużą karą. `zakupy`: `picked: [], ms: 50 000` (`:85`).

### 1.3 Z odchyłką w rundach

| gra | rundy | `turnSeconds` | czasy stałe | losowanie | `record` / `tie` | `timeoutMove` |
|---|---|---|---|---|---|---|
| `kolo` | do 10 prób, liczy się najlepsza (`S/kolo.ts:7`) | 120 (`:110`), `turn()` po `waiting` (`:154`) | brak | brak (tylko `nonce`, `:113`) | więcej lepiej (0-1000, `Math.round(1000 · …)`, `:97`, `:146`) / brak | `points: []` (`:157`) |
| `kolor` | 5 (`S/kolor.ts:4`) | 180 (`:80`) | pokaz 2 s (`:6`, `W/Kolor.tsx:88`), odsłona do kliknięcia (`W:96`) | barwa 0-359, nasycenie 25-100, jasność 30-100 osobno (`:89`) | mniej lepiej (suma ΔE × 10, `:101`) / brak | `guesses: []` → 5 × 100 (`:112`) |
| `kropki` | 10 (`S/kropki.ts:4`) | 120 (`:32`, `:50`) | 800 ms czekania (`W/Szacowanie.tsx:29`) + pokaz 1,5 s (`:10`), odsłona do kliknięcia | `withSum(10, 8, 40, 240)` (`:60`) | mniej lepiej (suma błędów) / brak | `answers: []` (`:88`) |
| `kat` | 10 (`S/kat.ts:4`) | 120 (`:31`, `:43`), stały `key` (`:45`) | jak `kropki` (`Szacowanie.tsx`), pokaz 1,5 s (`:11`) | kąt 5-175° i obrót osobno (`kat.ts` setup, `int(rng, MIN, MAX)`) | mniej lepiej / brak | najgorsza odpowiedź na rundę |
| `rok` | 10 z 164 wydarzeń (`S/rok.ts:4`, `:37`) | 240 (`:30`, `:214`) | runda do 20 s (`:8`), odsłona 2,5 s (`:10`) | `shuffle(EVENTS).slice(0, 10)` (`:224`) | mniej lepiej / brak | `answers: []` (`:255`) |
| `srodek` | 10 (`S/srodek.ts:4`) | 60 (`:83`) | odsłona 1 s (`W/Srodek.tsx:14`) | kąt, długość 50-90% boku i położenie osobno (`:66-74`) | mniej lepiej (× 10, `:104`) / brak | `taps: []` (`:115`) |
| `mapa` | 10 z 62 miast (`S/mapa.ts:5`, `mapa-dane.ts:6`) | 180 (`:65`) | odsłona 1,5 s (`W/Mapa.tsx:14`) | `shuffle(CITIES).slice(0, 10)` (`:73`) | mniej lepiej (km, `Math.round` na rundę, `:54`) / brak | `taps: []` (`:93`) |
| `tort` | 5 tortów, 3-7 kawałków po razie (`S/tort.ts:5-6`) | 120 (`:42`) | odsłona 1,5 s (`W/Tort.tsx:14`) | `shuffle(PIECES)`, cięcie startowe 0-359° (`:50`) | mniej lepiej (× 10, `:63`) / brak | `cuts: []` (`:74`) |
| `nozyczki` | 5 kształtów (`S/nozyczki.ts:4`) | 60 (`:100`) | odsłona 1,5 s (`W/Nozyczki.tsx:14`) | 4 fale o losowej amplitudzie i fazie, losowe miejsce (`:76-86`) | mniej lepiej (× 10, `:117`) / brak | `cuts: []` (`:128`) |

### 1.4 Do pierwszej pomyłki

| gra | rundy | `turnSeconds` | czasy stałe | losowanie | `record` / `tie` | `timeoutMove` | progresja |
|---|---|---|---|---|---|---|---|
| `kubki` | do 20 (`S/kubki.ts:4`) | 180 (`:48`) | 300 ms + pokaz 1 s + odsłona 1 s (`W/Kubki.tsx:16`) | kulka i zamiany osobnym `rng()`, bez cofania zamiany (`:30-40`) | więcej lepiej / brak (`:70`) | `picks: []` → 0 (`:74`) | zamiany 4 + r (`:7`, `:22`), ms 500 − 25r, min 150 od rundy 15 (`:8-10`, `:23`) |
| `sledzenie` | do 20 (`S/sledzenie.ts:6`) | 300 (`:70`) | 700 ms + pokaz 1,5 s + lot 5 s + odsłona 1 s (`W/Sledzenie.tsx:16`, `S:7-8`) | położenia i kierunki osobnym `rng()`, odstęp na starcie i końcu (`:31-45`) | więcej lepiej / trafione cele (więcej lepiej, `:121`) | `picks: []` (`:125`) | prędkość 0,3 + 0,06r pola/s (`:10-11`, `:53`) |
| `wieza` | do 30 pięter (`S/wieza.ts:4`) | 180 (`:33`, `:70`) | klocek spada sam po 5 s (`:14`), 1 s po końcu (`W/Wieza.tsx:19`) | strona startu `rng() < 0,5` (`:80`) | więcej lepiej / szerokość klocka (więcej lepiej, `:98`) | `stops: []` (`:102`) | prędkość 0,5 + 0,03 × piętro pola/s (`:11-12`, `:41`), tolerancja 2% pola (`:8`), koniec przy szerokości < 2% (`:10`) |
| `w-pamieci` | do 12 (`S/w-pamieci.ts:4`) | 300 (`:57`) | 800 ms + 1,5 s na liczbę i działanie (`W/WPamieci.tsx:16`, `S:8`), odsłona do kliknięcia | działanie `int(0, 2)` osobno (+, −, × po 1/3), liczby 1-9, × 2-3 (`:35-46`) | więcej lepiej / odchyłka (mniej lepiej, `:82-84`) | `answers: []` → 0 (`:89`) | działania 2 → 13, +1 na rundę (`:6`) |

## 2. Symulacja `setup` (REC-01, D-04)

`setup(["p"], createRng(seed))`, seedy 1..1000 (Śledzenie 1..300, bo liczy położenia w 51 chwilach dla 3 rund). „odch./średnia” to odchylenie standardowe względem średniej. Skrypt w §5.

| gra | miara | min | p5 | mediana | p95 | max | odch./średnia | partii |
|---|---|---|---|---|---|---|---|---|
| `refleks` | suma opóźnień [ms] | 17452 (seed 324) | 20616 | 24036 | 27341 | 30029 (seed 491) | 8.53% | 1000 |
| `refleks` | najkrótsze opóźnienie [ms] | 1000 (seed 75) | 1007 | 1108 | 1476 | 1875 (seed 545) | 13.23% | 1000 |
| `refleks` | opóźnienia < 1,5 s | 0 (seed 64) | 1 | 3 | 6 | 8 (seed 324) | 52.31% | 1000 |
| `simon` | powtórzenia koloru z rzędu w pierwszych 20 | 0 (seed 46) | 2 | 5 | 8 | 11 (seed 693) | 38.33% | 1000 |
| `stoper` | cel [ms] | 6000 (seed 7) | 6000 | 10000 | 14000 | 14000 (seed 4) | 25.94% | 1000 |
| `stoj` | czerwone | 14 | 14 | 14 | 14 | 14 | 0% | 1000 |
| `stoj` | zielone (sufit) | 27 | 27 | 27 | 27 | 27 | 0% | 1000 |
| `stoj` | zielone w ostatniej 1/3 czasu | 6 (seed 343) | 8 | 11 | 13 | 16 (seed 491) | 14.5% | 1000 |
| `rytm` | odstęp [ms] | 462 (seed 4) | 462 | 600 | 857 | 857 (seed 7) | 19.55% | 1000 |
| `rytm` | BPM | 70 (seed 7) | 70 | 100 | 130 | 130 (seed 4) | 18.86% | 1000 |
| `przytrzymaj` | suma celów [ms] | 15000 | 15000 | 15000 | 15000 | 15000 | 0% | 1000 |
| `przytrzymaj` | najdłuższy cel [ms] | 3233 (seed 663) | 3770 | 4488 | 4960 | 5000 (seed 253) | 8.31% | 1000 |
| `przytrzymaj` | suma kwadratów celów [s²] | 45.17 (seed 569) | 47.04 | 51.02 | 55.93 | 58.63 (seed 186) | 5.1% | 1000 |
| `zaslona` | suma za zasłoną [ms] | 20000 | 20000 | 20000 | 20000 | 20000 | 0% | 1000 |
| `zaslona` | suma widoczności [ms] | 8278 (seed 212) | 9557 | 11210 | 12887 | 14170 (seed 604) | 8.77% | 1000 |
| `zaslona` | suma ukryty / widoczny | 11.15 (seed 604) | 12.95 | 15.17 | 17.85 | 19.9 (seed 39) | 10% | 1000 |
| `balon` | suma wytrzymałości | 155 | 155 | 155 | 155 | 155 | 0% | 1000 |
| `balon` | balony z wytrzymałością ≤ 3 | 0 (seed 7) | 0 | 1 | 2 | 3 (seed 18) | 82.33% | 1000 |
| `balon` | wynik strategii „stop na 10” | 50 (seed 128) | 60 | 70 | 80 | 100 (seed 571) | 12.15% | 1000 |
| `balon` | wynik strategii „stop na 15” | 45 (seed 54) | 60 | 75 | 105 | 120 (seed 224) | 15.54% | 1000 |
| `balon` | najlepsza stała strategia (wiedza po fakcie) | 72 (seed 769) | 80 | 95 | 112 | 126 (seed 105) | 9.79% | 1000 |
| `stroop` | zgodne w pierwszych 40 | 10 | 10 | 10 | 10 | 10 | 0% | 1000 |
| `liczenie` | + w pierwszych 40 | 4 (seed 41) | 6 | 10 | 15 | 21 (seed 29) | 26.05% | 1000 |
| `liczenie` | − w 40 | 1 (seed 434) | 6 | 10 | 15 | 20 (seed 937) | 27.44% | 1000 |
| `liczenie` | × w 40 | 1 (seed 817) | 6 | 10 | 15 | 19 (seed 7) | 26.27% | 1000 |
| `liczenie` | : w 40 | 1 (seed 21) | 5 | 9 | 13 | 18 (seed 724) | 27.61% | 1000 |
| `inny` | obrót / odcień / rozmiar w pierwszych 24 | 7 | 7 | 7 | 8 | 8 | ok. 6,4% | 1000 |
| `inny` | kształt w 24 | 2 | 2 | 2 | 2 | 2 | 0% | 1000 |
| `obrot` | lustro w pierwszych 40 | 8 (seed 886) | 15 | 20 | 25 | 29 (seed 367) | 15.79% | 1000 |
| `obrot` | obrót o 180° w 40 | 5 (seed 137) | 8 | 13 | 18 | 25 (seed 187) | 21.96% | 1000 |
| `obrot` | suma kątów w 40 [°] | 5400 (seed 797) | 6210 | 7020 | 7830 | 8550 (seed 811) | 6.8% | 1000 |
| `literowka` | ó/u w pierwszych 45 | 6 (seed 644) | 10 | 14 | 19 | 22 (seed 453) | 19.4% | 1000 |
| `literowka` | rz/ż w 45 | 6 (seed 863) | 11 | 15 | 20 | 24 (seed 922) | 18.32% | 1000 |
| `literowka` | ch/h w 45 | 8 (seed 329) | 12 | 16 | 21 | 25 (seed 536) | 17.49% | 1000 |
| `literowka` | długość błędnego słowa (średnia w 45) | 5.62 (seed 361) | 5.93 | 6.24 | 6.53 | 6.82 (seed 609) | 2.84% | 1000 |
| `literowka` | powtórzone słowa w 45 | 0 | 0 | 0 | 0 | 0 | - | 1000 |
| `dziesiatki` | średnio par na planszy (gracz bierze pierwszą parę, 40 ruchów) | 4.35 (seed 137) | 5.38 | 8.57 | 13.93 | 19.7 (seed 508) | 29.56% | 1000 |
| `dziesiatki` | ruchy z jedną parą na planszy (z 40) | 0 (seed 4) | 0 | 1 | 6 | 10 (seed 142) | 105% | 1000 |
| `schulte` | droga 1→25 [pola] | 45.36 (seed 435) | 55.88 | 63.69 | 71.28 | 77.48 (seed 201) | 7.55% | 1000 |
| `sudoku` | pola z jednym kandydatem na starcie (z 10) | 1 (seed 83) | 2 | 3 | 6 | 7 (seed 7) | 35.74% | 1000 |
| `sudoku` | fale samych pojedynczych kandydatów do końca | 2 (seed 2) | 2 | 3 | 4 | 5 (seed 83) | 23.56% | 1000 |
| `kolor` | ΔE za krok 5 na trzech suwakach (suma 5 celów) | 47.14 (seed 354) | 55.18 | 63.56 | 74.12 | 85.81 (seed 545) | 8.99% | 1000 |
| `kropki` | suma kropek | 240 | 240 | 240 | 240 | 240 | 0% | 1000 |
| `kropki` | największa runda | 30 (seed 72) | 34 | 38 | 40 | 40 | 5.47% | 1000 |
| `kropki` | suma √n (gdyby błąd rósł jak √n) | 46.83 (seed 823) | 47.37 | 47.97 | 48.48 | 48.77 (seed 566) | 0.69% | 1000 |
| `kat` | suma kątów [°] | 421 (seed 324) | 646 | 890 | 1173 | 1378 (seed 200) | 17.78% | 1000 |
| `kat` | suma najgorszych odchyłek [°] | 1082 (seed 154) | 1197 | 1326 | 1457 | 1571 (seed 338) | 5.9% | 1000 |
| `kat` | kąty 80-100° (z 10) | 0 (seed 15) | 0 | 1 | 3 | 5 (seed 145) | 81.06% | 1000 |
| `rok` | średni rok | 1957 (seed 983) | 1969 | 1984 | 1998 | 2005 (seed 339) | 0.43% | 1000 |
| `rok` | suma najgorszych odchyłek [lata] | 786 (seed 227) | 853 | 934 | 1020 | 1093 (seed 921) | 5.52% | 1000 |
| `rok` | wydarzenia od 1990 (z 10) | 1 (seed 227) | 3 | 5 | 8 | 9 (seed 339) | 28.85% | 1000 |
| `srodek` | suma długości odcinków [bok pola] | 5.96 (seed 147) | 6.4 | 7.02 | 7.6 | 7.99 (seed 53) | 5.13% | 1000 |
| `srodek` | suma 1/długość (błąd w % przy stałej precyzji palca) | 12.66 (seed 53) | 13.45 | 14.62 | 16.03 | 17.01 (seed 147) | 5.35% | 1000 |
| `mapa` | suma odległości miast od środka Polski (52°N 19,4°E) [km] | 1454 (seed 116) | 1771 | 2114 | 2478 | 2725 (seed 15) | 10.58% | 1000 |
| `mapa` | suma najgorszych odchyłek (do rogu pola) [km] | 6190 (seed 334) | 6480 | 6844 | 7240 | 7543 (seed 787) | 3.36% | 1000 |
| `nozyczki` | suma wypukłości (pole / otoczka, 5 = same wypukłe) | 4.68 (seed 235) | 4.72 | 4.77 | 4.83 | 4.89 (seed 560) | 0.69% | 1000 |
| `nozyczki` | najmniej wypukły kształt | 0.91 (seed 62) | 0.92 | 0.94 | 0.95 | 0.97 (seed 560) | 0.97% | 1000 |
| `nozyczki` | suma pól kształtów [pole²] | 0.68 (seed 232) | 0.76 | 0.86 | 0.95 | 1.03 (seed 831) | 6.57% | 1000 |
| `kubki` | ruchy kulki w 20 rundach | 166 (seed 247) | 172 | 180 | 188 | 197 (seed 149) | 2.71% | 1000 |
| `kubki` | ruchy kulki w rundzie 11 (14 zamian) | 7 (seed 30) | 8 | 9 | 11 | 13 (seed 118) | 11.56% | 1000 |
| `sledzenie` | bliskie mijanki cel-inna kulka (< 3 promienie, próbki co 100 ms), runda 1 | 11 (seed 155) | 41 | 70 | 106 | 138 (seed 251) | 29.87% | 300 |
| `sledzenie` | jw., runda 10 | 43 (seed 42) | 53 | 75 | 109 | 158 (seed 64) | 22.03% | 300 |
| `sledzenie` | jw., runda 20 | 47 (seed 178) | 61 | 79 | 102 | 127 (seed 150) | 15.73% | 300 |
| `w-pamieci` | mnożenia w partii (z 90 działań) | 15 (seed 13) | 19 | 24 | 30 | 35 (seed 170) | 13.2% | 1000 |
| `w-pamieci` | działania w partii | 90 | 90 | 90 | 90 | 90 | 0% | 1000 |
| `w-pamieci` | mnożenia w rundach 1-6 (z 27) | 2 (seed 13) | 6 | 9 | 13 | 14 (seed 9) | 21.66% | 1000 |
| `wieza` | start klocka z lewej (z 30) | 7 (seed 26) | 10 | 15 | 19 | 23 (seed 407) | 18.5% | 1000 |

Gry bez losowania wpływającego na wynik: `kolo` (tylko `nonce`), `tort` (stały komplet 3-7; kąt startowy obraca cały tort, więc nie zmienia zadania),
`zakupy` (losowe przedmioty z 20; trudność zależy od podobieństwa emoji, nie da się jej policzyć ze stanu: „założenie, do sprawdzenia w partii”).

**Losowanie, którego `setup` nie pokazuje w całości:**
- `stoj`: harmonogram jest stały, a gracz nie wpływa na bodźce; losowe jest tylko rozmieszczenie czerwonych (wiersz „zielone w ostatniej 1/3”).
- `dziesiatki`: plansza zależy od wyborów gracza (które pola zbiera), więc liczba par na planszy to symulacja jednej strategii (pierwsza znaleziona para), nie cecha partii.
- `wieza`: strona startu nie zmienia odległości do celu przy klocku na środku, tylko kierunek; trudność wyznaczają prędkość i szerokość (§1.4).

### 2.1 Kubki: krzywa ze stałych (wyliczone)

| runda | zamiany | ms na zamianę | tasowanie |
|---|---|---|---|
| 1 | 4 | 500 | 2,00 s |
| 2 | 5 | 475 | 2,38 s |
| 3 | 6 | 450 | 2,70 s |
| 4 | 7 | 425 | 2,98 s |
| 5 | 8 | 400 | 3,20 s |
| 6 | 9 | 375 | 3,38 s |
| 7 | 10 | 350 | 3,50 s |
| 8 | 11 | 325 | 3,58 s |
| 9 | 12 | 300 | 3,60 s |
| 10 | 13 | 275 | 3,58 s |
| 11 | 14 | 250 | 3,50 s |
| 12 | 15 | 225 | 3,38 s |
| 13 | 16 | 200 | 3,20 s |
| 14 | 17 | 175 | 2,98 s |
| 15 | 18 | 150 | 2,70 s |
| 16 | 19 | 150 | 2,85 s |
| 17 | 20 | 150 | 3,00 s |
| 18 | 21 | 150 | 3,15 s |
| 19 | 22 | 150 | 3,30 s |
| 20 | 23 | 150 | 3,45 s |

Suma tasowań 20 rund: 62,9 s; z 300 ms + 1 s pokazu + 1 s odsłony na rundę: 108,9 s plus wskazania.

## 3. Baza (REC-02, REC-03)

Kopia `apps/server/data/games.db` (z dziennikiem) w scratchpadzie, otwarta `readOnly`. Oryginał bez zmian (mtime 1792318880 przed i po).

- Tabele: `results`, `scores`. `scores`: **9 wierszy, wszystkie `zaslona`** (2 nicki, wynik 3509-20 000, `tie` puste). `results`: 14 wierszy (Kalambury 10, Labirynt 4).
- Dla 29 mini-gier: **brak danych**. Remisów na szczycie i dobicia do sufitu nie da się ocenić z bazy dev; plany 03-05..03-08 oceniają je ze stałych i progów (D-05).
- Baza produkcyjna nie była pobierana (D-11). Kopia z Pi pozwoliłaby policzyć to samo dla prawdziwych partii.

## 4. Wstępne obserwacje dla fali 2 (bez wag, oceniają plany grup)

- Stała suma potwierdzona w `stoj` (27 / 14), `przytrzymaj`, `zaslona` (ukryty czas), `balon`, `stroop`, `inny`, `kropki`, `w-pamieci` (liczba działań), `tort`.
- Rozrzut sumy lub rodzaju między partiami: `stoper` (cel 6-14 s), `rytm` (462-857 ms), `liczenie` (każdy rodzaj 1-21 na 40), `obrot` (lustro 8-29 na 40, 180° 5-25),
  `literowka` (rodzaj błędu 6-25 na 45), `w-pamieci` (mnożenia 15-35), `kat` (suma 421-1378°), `kolor` (czułość 47-86 ΔE), `sudoku` (1-7 pól z jednym kandydatem),
  `dziesiatki` (4-20 par na planszy), `zaslona` (widoczność 8,3-14,2 s), `refleks` (suma opóźnień 17-30 s, długość partii), `mapa`, `rok`.
- Rozrzut mały (do ok. 7%): `kropki` (√n 0,7%), `nozyczki` (wypukłość 0,7%), `kubki` (ruchy kulki 2,7%), `mapa` i `rok` (najgorsza odchyłka 3-6%), `schulte` (droga 7,6%), `srodek` (5%).
- Sufit teoretyczny: `stoj` 27, `zakupy` 10, `balon` 155, `kubki` 20, `sledzenie` 20, `wieza` 30, `w-pamieci` 12, `kolo` 1000; quizy: 200 plansz w stanie, praktycznie mniej (03-02).
- Bez `tie` przy całkowitym wyniku z sufitem: `kubki`, `simon` (bez sufitu). `tie` z `Math.round(average)`: 6 quizów, `dziesiatki`, `stoj` (klucz `tie-zaokraglenie`).

## 5. Załącznik: skrypty

`sim.ts` i `db.ts` leżały w scratchpadzie sesji. Uruchomienie: `cd packages/games && node <scratchpad>/sim.ts`, `node <scratchpad>/db.ts <kopia games.db>`.

### sim.ts

```ts
// Symulacja setup na wielu seedach: miary "do zdobycia" i trudności z losowania (03-01, D-04).
const S = "/home/figielak/Documents/Projects/kwadrans/packages/games/src/";
const { createRng } = await import(S + "core.ts");
const { GAMES } = await import(S + "index.ts");
const { distance: dE } = await import(S + "kolor.ts");
const { PAIRS } = await import(S + "literowka-dane.ts");
const { SCHEDULE } = await import(S + "stoj.ts");
const { hasPair } = await import(S + "dziesiatki.ts");
const { position: sPos, RADIUS } = await import(S + "sledzenie.ts");
const { swapCount, swapMs } = await import(S + "kubki.ts");
const N = 1000;
const g = (id: string) => (Object.values(GAMES) as any[]).find((x) => x.id === id);
const run = (id: string, f: (s: any) => Record<string, number>, n = N) => {
  const rows: Record<string, number[]> = {};
  const ext: Record<string, [number, number, number, number]> = {};
  for (let seed = 1; seed <= n; seed++) {
    const m = f(g(id).setup(["p"], createRng(seed)));
    for (const [k, v] of Object.entries(m)) {
      (rows[k] ??= []).push(v);
      const e = (ext[k] ??= [Infinity, 0, -Infinity, 0]);
      if (v < e[0]) [e[0], e[1]] = [v, seed];
      if (v > e[2]) [e[2], e[3]] = [v, seed];
    }
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(rows)) {
    const s = [...v].sort((a, b) => a - b);
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
    const r = (x: number) => (Math.abs(x) >= 100 ? Math.round(x) : Math.round(x * 100) / 100);
    out.push(`| \`${id}\` | ${k} | ${r(s[0])} (seed ${ext[k][1]}) | ${r(s[Math.floor(s.length * 0.05)])} | ${r(s[Math.floor(s.length / 2)])} | ${r(s[Math.floor(s.length * 0.95)])} | ${r(s.at(-1)!)} (seed ${ext[k][3]}) | ${mean ? r((sd / mean) * 100) + "%" : "-"} | ${n} |`);
  }
  console.log(out.join("\n"));
};
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const count = <T,>(a: T[], p: (x: T) => boolean) => a.filter(p).length;

console.log("| gra | miara | min | p5 | mediana | p95 | max | odch./średnia | partii |\n|---|---|---|---|---|---|---|---|---|");
run("refleks", (s) => ({ "suma opóźnień [ms]": sum(s.delays), "najkrótsze opóźnienie [ms]": Math.min(...s.delays), "opóźnienia < 1,5 s": count(s.delays, (d: number) => d < 1500) }));
run("simon", (s) => ({ "powtórzenia koloru z rzędu w pierwszych 20": count(s.sequence.slice(1, 20), (c: number, i: number) => c === s.sequence[i]) }));
run("stoper", (s) => ({ "cel [ms]": s.target }));
run("stoj", (s) => ({ "czerwone": count(s.reds, (r: boolean) => r), "zielone (sufit)": count(s.reds, (r: boolean) => !r), "zielone w ostatniej 1/3 czasu": count(s.reds, (r: boolean, i: number) => !r && SCHEDULE[i].at >= 20000) }));
run("rytm", (s) => ({ "odstęp [ms]": s.interval, "BPM": Math.round(60000 / s.interval) }));
run("przytrzymaj", (s) => ({ "suma celów [ms]": sum(s.targets), "najdłuższy cel [ms]": Math.max(...s.targets), "suma kwadratów celów [s²]": sum(s.targets.map((t: number) => (t / 1000) ** 2)) }));
run("zaslona", (s) => {
  const r = s.rounds ?? s.balls ?? s.trials;
  const hid = r.map((x: any) => x.hidden), vis = r.map((x: any) => x.visible);
  return { "suma za zasłoną [ms]": sum(hid), "suma widoczności [ms]": sum(vis), "suma hidden/visible": sum(hid.map((h: number, i: number) => h / vis[i])) };
});
run("balon", (s) => {
  const ev = (k: number) => sum(s.limits.map((l: number) => (l >= k ? k : 0)));
  let best = 0; for (let k = 1; k <= 30; k++) best = Math.max(best, ev(k));
  return { "suma wytrzymałości": sum(s.limits), "balony z wytrzymałością ≤ 3": count(s.limits, (l: number) => l <= 3), "wynik strategii stop na 10": ev(10), "wynik strategii stop na 15": ev(15), "najlepsza stała strategia (wiedza po fakcie)": best };
});
run("stroop", (s) => ({ "zgodne w pierwszych 40": count(s.trials.slice(0, 40), (t: any) => t.word === t.ink) }));
run("liczenie", (s) => {
  const f = s.trials ?? s.problems; const first = f.slice(0, 40).map((p: any) => p.text);
  return { "+ w 40": count(first, (t: string) => t.includes("+")), "− w 40": count(first, (t: string) => t.includes("−")), "× w 40": count(first, (t: string) => t.includes("×")), ": w 40": count(first, (t: string) => t.includes(":")) };
});
run("inny", (s) => {
  const kind = (t: any) => (t.base.angle !== t.other.angle ? 0 : t.base.light !== t.other.light ? 1 : t.base.size !== t.other.size ? 2 : 3);
  const k = s.trials.slice(0, 24).map(kind);
  return { "obrót w 24": count(k, (x: number) => x === 0), "odcień w 24": count(k, (x: number) => x === 1), "rozmiar w 24": count(k, (x: number) => x === 2), "kształt w 24": count(k, (x: number) => x === 3) };
});
{
  const norm = (c: number[][]) => { const mx = Math.min(...c.map((p) => p[0])), my = Math.min(...c.map((p) => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((p, q) => p[0] - q[0] || p[1] - q[1]); };
  const turn = (c: number[][], t: number): number[][] => (t ? turn(norm(c.map(([x, y]) => [-y, x])), t - 1) : c);
  const flip = (c: number[][]) => norm(c.map(([x, y]) => [-x, y]));
  run("obrot", (s) => {
    const angles = s.trials.slice(0, 40).map((t: any) => { const from = t.mirror ? flip(t.a) : t.a; for (const k of [1, 2, 3]) if (String(turn(from, k)) === String(t.b)) return k * 90; return 0; });
    return { "lustro w 40": count(s.trials.slice(0, 40), (t: any) => t.mirror), "180° w 40": count(angles, (a: number) => a === 180), "suma kątów w 40 [°]": sum(angles) };
  });
}
{
  const type = new Map<string, string>();
  for (const [r, w] of PAIRS) type.set(w, /ó/.test(r) !== /ó/.test(w) ? "ó/u" : /rz/.test(r) !== /rz/.test(w) ? "rz/ż" : "ch/h");
  run("literowka", (s) => {
    const t = s.trials.slice(0, 45).map((x: any) => type.get(x.words[x.wrong]));
    const words = s.trials.slice(0, 45).flatMap((x: any) => x.words);
    return { "ó/u w 45": count(t, (x: string) => x === "ó/u"), "rz/ż w 45": count(t, (x: string) => x === "rz/ż"), "ch/h w 45": count(t, (x: string) => x === "ch/h"), "długość błędnego słowa (średnia w 45)": sum(s.trials.slice(0, 45).map((x: any) => x.words[x.wrong].length)) / 45, "powtórzone słowa w 45": words.length - new Set(words).size };
  });
}
run("dziesiatki", (s) => {
  // gracz bierze pierwszą znalezioną parę; ile par jest na planszy przed każdym ruchem (pierwsze 40 ruchów)
  let b = [...s.board]; const pairs: number[] = [];
  const all = (b: number[]) => { let n = 0; for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) if (b[i] + b[j] === 10) n++; return n; };
  for (let n = 0; n < 40; n++) {
    pairs.push(all(b));
    let a = -1, c = -1;
    outer: for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) if (b[i] + b[j] === 10) { a = i; c = j; break outer; }
    const nx = [...b]; nx[a] = s.refills[2 * n]; nx[c] = s.refills[2 * n + 1];
    if (!hasPair(nx)) nx[c] = 10 - nx.find((_: number, i: number) => i !== a && i !== c)!;
    b = nx;
  }
  return { "średnio par na planszy (40 ruchów)": sum(pairs) / 40, "ruchy z jedną parą (z 40)": count(pairs, (p) => p === 1) };
});
run("schulte", (s) => {
  const at = (n: number) => s.grid.indexOf(n);
  let d = 0; for (let n = 1; n < 25; n++) { const a = at(n), b = at(n + 1); d += Math.hypot((a % 5) - (b % 5), Math.floor(a / 5) - Math.floor(b / 5)); }
  return { "droga 1→25 [pola]": d };
});
run("sudoku", (s) => {
  const p = [...(s.puzzle ?? s.grid ?? s.board)];
  const cand = (g: number[], i: number) => { const r = Math.floor(i / 4), c = i % 4, br = r - (r % 2), bc = c - (c % 2); const used = new Set<number>(); for (let k = 0; k < 4; k++) { used.add(g[r * 4 + k]); used.add(g[k * 4 + c]); } for (let y = br; y < br + 2; y++) for (let x = bc; x < bc + 2; x++) used.add(g[y * 4 + x]); return [1, 2, 3, 4].filter((v) => !used.has(v)); };
  const singles0 = p.map((v, i) => (v ? 0 : cand(p, i).length === 1 ? 1 : 0)).reduce((a, b) => a + b, 0);
  let waves = 0, g2 = [...p];
  for (;;) { const f = g2.map((v, i) => (v ? -1 : cand(g2, i).length === 1 ? cand(g2, i)[0] : -1)); if (!f.some((v) => v > 0)) break; f.forEach((v, i) => { if (v > 0) g2[i] = v; }); waves++; }
  return { "pola z jednym kandydatem na starcie (z 10)": singles0, "fale samych singli do końca": g2.includes(0) ? 99 : waves };
});
run("kolor", (s) => {
  const sens = s.targets.map((t: any) => dE(t, { ...t, h: (t.h + 5) % 360 }) + dE(t, { ...t, s: Math.min(100, t.s + 5) }) + dE(t, { ...t, b: Math.min(100, t.b + 5) }));
  return { "ΔE za krok 5 na trzech suwakach (suma 5 celów)": sum(sens) };
});
run("kropki", (s) => ({ "suma kropek": sum(s.rounds.map((r: any[]) => r.length)), "największa runda": Math.max(...s.rounds.map((r: any[]) => r.length)), "suma √n (błąd ∝ √n)": sum(s.rounds.map((r: any[]) => Math.sqrt(r.length))) }));
run("kat", (s) => ({ "suma kątów [°]": sum(s.rounds.map((r: any) => r.angle)), "suma najgorszych odchyłek [°]": sum(s.rounds.map((r: any) => Math.max(r.angle, 180 - r.angle))), "kąty 80-100° (z 10)": count(s.rounds, (r: any) => r.angle >= 80 && r.angle <= 100) }));
run("rok", (s) => ({ "średni rok": sum(s.events.map((e: any) => e.year)) / 10, "suma najgorszych odchyłek [lata]": sum(s.events.map((e: any) => Math.max(e.year - 1900, 2025 - e.year))), "wydarzenia po 1990 (z 10)": count(s.events, (e: any) => e.year >= 1990) }));
run("srodek", (s) => {
  const len = s.segments.map((x: any) => Math.hypot(x.b.x - x.a.x, x.b.y - x.a.y));
  return { "suma długości [bok pola]": sum(len), "suma 1/długość (błąd w % przy stałej precyzji palca)": sum(len.map((l: number) => 1 / l)) };
});
run("mapa", (s) => {
  const B = { west: 13.9, east: 24.3, south: 48.9, north: 54.95 }; const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const hav = (a: number, b: number, c: number, d: number) => 2 * R * Math.asin(Math.sqrt(Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2));
  const worst = s.cities.map((c: any) => Math.max(...[[B.south, B.west], [B.south, B.east], [B.north, B.west], [B.north, B.east]].map(([la, lo]) => hav(c.lat, c.lon, la, lo))));
  const center = s.cities.map((c: any) => hav(c.lat, c.lon, 52, 19.4));
  return { "suma odległości od środka Polski [km]": sum(center), "suma najgorszych odchyłek [km]": sum(worst) };
});
run("nozyczki", (s) => {
  const area = (p: any[]) => Math.abs(sum(p.map((a, i) => a.x * p[(i + 1) % p.length].y - p[(i + 1) % p.length].x * a.y))) / 2;
  const hull = (pts: any[]) => { const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y); const cr = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); const lo: any[] = [], up: any[] = []; for (const q of p) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); } for (const q of p.reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
  const conv = s.shapes.map((sh: any[]) => area(sh) / area(hull(sh)));
  return { "suma wypukłości (pole/otoczka, 5 = same wypukłe)": sum(conv), "najmniej wypukły kształt": Math.min(...conv), "suma pól [pole²]": sum(s.shapes.map(area)) };
});
run("kubki", (s) => {
  const moves = s.rounds.map((r: any) => { let at = r.ball, n = 0; for (const [a, b] of r.swaps) { if (at === a) { at = b; n++; } else if (at === b) { at = a; n++; } } return n; });
  return { "ruchy kulki w 20 rundach": sum(moves), "ruchy kulki w rundzie 10 (14 zamian)": moves[10] };
});
run("sledzenie", (s) => {
  // bliskie mijanki celu (0-2) z innymi kulkami: próbki co 100 ms, odległość < 3 promienie, rundy 0, 9, 19
  const close = (round: number) => { const balls = s.rounds[round]; let n = 0; for (let t = 0; t <= 5000; t += 100) { const p = balls.map((b: any) => sPos(b, round, t)); for (let i = 0; i < 3; i++) for (let j = 3; j < balls.length; j++) if (Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y) < 3 * RADIUS) n++; } return n; };
  return { "mijanki cel-inna, runda 1": close(0), "runda 10": close(9), "runda 20": close(19) };
}, 300);
run("w-pamieci", (s) => {
  const ops = s.rounds.flatMap((r: any) => r.ops);
  return { "mnożenia w partii": count(ops, (o: any) => o.op === "×"), "działania w partii": ops.length, "mnożenia w rundach 1-6": count(s.rounds.slice(0, 6).flatMap((r: any) => r.ops), (o: any) => o.op === "×") };
});
run("wieza", (s) => ({ "start z lewej (z 30)": count(s.sides, (x: boolean) => x) }));
console.log("\nKubki: runda → zamiany → ms → czas tasowania");
for (let r = 0; r < 20; r++) console.log(`| ${r + 1} | ${swapCount(r)} | ${swapMs(r)} | ${((swapCount(r) * swapMs(r)) / 1000).toFixed(2)} s |`);
```

### db.ts

```ts
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
console.log("tabele:", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name).join(", "));
console.log("scores:", (db.prepare("SELECT count(*) n FROM scores").get() as any).n, "results:", (db.prepare("SELECT count(*) n FROM results").get() as any).n);
const rows = db.prepare("SELECT game_id, nick, score, tie, at FROM scores").all() as any[];
const by = new Map<string, any[]>(); for (const r of rows) (by.get(r.game_id) ?? by.set(r.game_id, []).get(r.game_id))!.push(r);
for (const [id, rs] of [...by].sort()) {
  const s = rs.map((r) => r.score).sort((a, b) => a - b);
  console.log(id, "n=" + rs.length, "nicki=" + new Set(rs.map((r) => r.nick.toLowerCase())).size, "min=" + s[0], "med=" + s[Math.floor(s.length / 2)], "max=" + s.at(-1), "tie:", rs.filter(r => r.tie != null).length);
}
console.log(db.prepare("SELECT game_id, count(*) n, sum(won) w FROM results GROUP BY 1").all());
```

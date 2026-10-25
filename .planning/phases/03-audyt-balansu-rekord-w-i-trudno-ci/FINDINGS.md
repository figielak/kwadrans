# Faza 3: audyt balansu rekordów i trudności (FINDINGS)

Stan repo: gałąź `labirynt`, HEAD `06102e7`, 2026-10-24. Zakres: 30 mini-gier, 8 gier głównych i Turniej (39 pozycji), wymagania REC-01, REC-02, REC-03, DIFF-01, DIFF-02, DIFF-03.
Repo bez zmian poza `.planning/`.

Ten plik scala `03-01-CHECKS.md` (stałe 30 mini-gier, symulacja `setup` na 1000 seedów, lokalna baza), `03-02-BASELINE.md` (model czasu partii, progi ludzkie, wzorce)
i `03-03..03-08-FINDINGS.md` (gry). Pliki częściowe zostają jako źródło: mają pełne sekcje gier według szablonu D-12, skrypty symulacji i opis strategii botów.
Wpisy pojedyncze mają identyfikatory z plików częściowych (**B-** + skrót gry, np. B-SQ1), wpisy zbiorcze nowe **R1-R8**. W fazie 4 cytować z prefiksem **F3:** (np. F3:R1, F3:B-KT1),
bo część skrótów ma w fazach 1-2 inne znaczenie (np. F2:KA1 to Kampus Tour, F3:B-KA1 to Kalambury).

Wagi wg D-09: **wysoka** (limit odbiera wynik uczciwej partii, suma do zdobycia zmienia się między partiami, sufit osiągalny bez rozstrzygnięcia remisu, gra główna rozstrzygana kolejnością),
**średnia** (trudność zależna od losowania przy stałej sumie, krzywa niemożliwa albo płaska w zasięgu dobrych graczy, zapas limitu poniżej 20% lub 10 s, przewaga kolejności bez kompensaty),
**niska** (przypadki teoretyczne, założenia bez wpływu na rekord). Pewność liczby: **W** wyliczone ze stałych, **Z** zmierzone (symulacja, baza), **A** założenie.
Rekomendacja przy każdym wpisie: **zostawić**, **zmienić** albo **sprawdzić w partii**.

## 1. Podsumowanie

| Waga | Wpisy zbiorcze | Wpisy pojedyncze | Razem wpisów | Wpisów częściowych (B-*) |
|---|---|---|---|---|
| wysoka | 2 (R1, R3) | 0 | 2 | 5 (B-SQ1, B-ZK1, B-SR1, B-TO1, B-WP2) |
| średnia | 4 (R2, R4, R5, R7) | 1 (B-KT3) | 5 | 20 |
| niska | 2 (R6, R8) | 7 | 9 | 19 |
| **razem** | **8** | **8** | **16** | **44** |

Wpisy częściowe liczone według wagi z plików 03-03..03-08 (wpis zbiorczy ma wagę najwyższego wpisu częściowego, ale każda gra zachowuje w nim swoją).
Wpisy niskie bez klucza w plikach częściowych (B-SJ1, B-ZS1, B-LT1, B-RK1, B-KB2) to ta sama rozbieżność co R2, więc weszły do R2 jako wiersze niskie.

Co mówi audyt w skrócie:
- **Limity tury** (DIFF-02): 24 z 30 mini-gier mają zapas ≥ 20% i ≥ 10 s. Cztery mogą odebrać wynik uczciwej partii: Sekwencja (limit ucina serię 21-24, w zasięgu dobrych graczy), Zakupy (−3 s, W),
  Środek (−3 s) i Tort (−0,5 s), te dwa przy założeniu 5 s na celowanie. Mały zapas mają Śledzenie (4,5%) i Który rok? (5%, ale czas jest twardy). Gry turowe mieszczą się w 60 s
  (marsz pionka w Kampus Tour 3,3 s, Chińczyk Szybki ok. 1 s z 20 s); w Państwach-miastach przy 5-6 osobach ciasne jest głosowanie (45 s). → R1.
- **Do zdobycia** (REC-01): suma celów jest stała we wszystkich grach z celami (`withSum`, komplety, stała liczba bodźców). Trudność partii zależy jednak od losowania w 10 grach
  (największy efekt: Stoper 2,3×, Rytm 1,9×, Odcień 1,35× przy tej samej umiejętności) i w 5 kolejnych w niewielkim stopniu. → R2. Balon ma stałą sumę, ale zmienne szanse strategii (50-100 pkt). → R7.
- **Sufit i remisy** (REC-02, REC-03): Wieża dochodzi do 30 pięter u gracza z precyzją 20 ms w 94,5% partii (Z), W pamięci 12 i Kubki 20 są prawdopodobnie osiągalne (A),
  a Zakupy 10 to sufit pamięci rozpoznawczej (A). Tam, gdzie brak `tie` (Kubki, Sekwencja) albo `tie` nie rozstrzyga kompletu (W pamięci), rekord na szczycie rozstrzyga data. → R3, R4.
  Kierunek `lower` i obecność `tie` zgodne z dokumentami we wszystkich 30 grach (F1 §3, D-03). Zaokrąglenie `tie` do ms (F1:Z13) rzadko remisuje (A): zostawić.
- **Krzywe trudności** (DIFF-01): żadna nie przekracza progów ludzkich w zasięgu gry; Kubki, Śledzenie i Stój! kończą się na granicy percepcji, Inny element i Obrót płasko od planszy 16 / pary 9.
  Wieża i W pamięci kończą się za wcześnie dla najlepszych (to sprawa sufitu, R4 i R3).
- **Gry główne** (DIFF-03): przewaga kolejności jest wyraźna tylko w Labiryncie przy 3-4 osobach (ostatni wygrywa 35-54%, Z) i w Kampus Tour (ostatni 31% przy 4 graczach przez premię +20 zł za miejsce, Z).
  Gomoku ma teoretyczną przewagę pierwszego (A), Statki 51-54,5%, Chińczyk równo. Tryby Szybkie zachowują sens. Kampus Tour: 93-99% partii kończy limit 20 rund, monopol rzadki i zawsze z grupą dwupolową,
  Bilet MPK daje ok. 1/3 kompletów. → R5, B-KT1..B-KT6.
- **Zamknięcie wpisów z faz 1-2** (D-02): wszystkie 14 identyfikatorów zamknięte liczbą; 8 przechodzi do fazy 4 z rekomendacją „zmienić” albo „sprawdzić w partii” (§10).
- **Dane z partii**: lokalna baza ma tylko 9 wyników (Za zasłoną), więc remisy na szczycie oceniono ze stałych i progów. 22 pytania czekają na partie z ludźmi albo kopię bazy produkcyjnej (§11).

## 2. Kryterium 1: do zdobycia (REC-01)

`ZASADY.md` §3 :100-102: losowanie nie zmienia sufitu, każda partia daje tyle samo do zdobycia, rodzaje plansz o różnej trudności idą potasowanymi kompletami.
Mechanizm i rozrzut z `03-01-CHECKS.md` §2 (1000 seedów; „rozrzut” = odchylenie standardowe / średnia miary trudności). Wynik: litera reguły (stała suma) spełniona w 30 grach; uzasadnienie (stała trudność) nie w 16 (R2: 15 gier, R7: Balon).

| gra | mechanizm stałej sumy | co zmienia losowanie | rozrzut | wpis |
|---|---|---|---|---|
| `refleks` | 12 bodźców (`refleks.ts:5`) | tylko długość partii (opóźnienia 17,5-30 s) | 8,5% (długość) | ✓ |
| `simon` | bez sumy (do pomyłki) | powtórzenia koloru z rzędu 0-11 w pierwszych 20 | 38% (wpływ nieznany, A) | ✓ (do partii, §11) |
| `stoper` | 1 próba | cel 6-14 s; błąd rośnie z celem (prawo skalarne) | 26%; 480 → 1120 ms oczekiwanej odchyłki (2,3×) | R2 (B-SP1) |
| `stoj` | stały harmonogram 27 / 14 (`stoj.ts:14-20`) | zielone w szybkiej końcówce 6-16 | 14,5% | R2 niska (B-SJ1) |
| `rytm` | 8 + 10 s | tempo 70-130 BPM, odchyłka w ms bezwzględnych | 20%; 14-23 ms przy 130 BPM, 26-43 ms przy 70 (1,9×) | R2 (B-RY1) |
| `przytrzymaj` | `withSum` 15 000 ms | rozkład celów (suma kwadratów 45-59 s²) | 5% | ✓ |
| `zaslona` | `withSum` 20 000 ms (ukryty czas) | widoczność 8,3-14,2 s, losowana swobodnie | 8,8% | R2 niska (B-ZS1) |
| `balon` | `withSum` 155 | rozkład wytrzymałości: strategia „stop na 10” daje 50-100 pkt | 12% (wynik strategii) | R7 (B-BL1) |
| `stroop` | czwórki z jedną zgodną (`stroop.ts:35-38`) | nic istotnego | 0% | ✓ |
| `liczenie` | 200 plansz | rodzaj działania osobno: każdy 1-21 na 40 | 26%; ok. 2 trafienia (13%) | R2 (B-LC1) |
| `inny` | komplety rodzajów (`inny.ts:51`) | 7-8 każdego rodzaju na 24 (granica kompletów) | 6,4% | ✓ |
| `obrot` | 200 plansz | lustro 8-29 na 40, obrót 180° 5-25 na 40 | 16-22%; ok. 1-1,5 trafienia (8%) | R2 (B-OB1) |
| `literowka` | talia 181 par bez powtórzeń w 45 | rodzaj błędu 6-25 na 45 | 18% (wpływ nieznany, A) | R2 niska (B-LT1) |
| `dziesiatki` | 200 par, `take` gwarantuje parę | średnio par na planszy 4,4-19,7 | 30% | R2 (B-DZ1) |
| `schulte` | 25 liczb | droga oczu 45-77 pól (wpływ mały, A) | 7,6% | ✓ |
| `sudoku` | 10 pustych pól, jedno rozwiązanie | pola z jednym kandydatem 1-7, fale 2-5 | 24-36% | R2 (B-SU1) |
| `zakupy` | 10 z 20 | podobieństwo przedmiotów (nie do policzenia, A) | - | ✓ (do partii, §11) |
| `kolo` | bez losowania (`nonce`) | nic | - | ✓ |
| `kolor` | 5 celów | czułość ΔE na krok suwaka 47-86 | 9%; 1,35× (p95 / p5) | R2 (B-KR1) |
| `kropki` | `withSum` 240 | rozkład (√n 0,7%) | 0,7% | ✓ |
| `kat` | 10 rund | suma kątów 421-1378° (wpływ nieznany, A) | 18% | R2 (B-KAT1) |
| `rok` | 10 z 164 | epoka i dział: wydarzeń od 1990 1-9 | 29% (wpływ zależny od gracza, A) | R2 niska (B-RK1) |
| `srodek` | 10 odcinków | suma 1/długość 12,7-17,0 | 5,4% | ✓ |
| `mapa` | 10 z 62 miast | odległość od środka Polski 1454-2725 km (kierunek wpływu nieznany, A) | 10,6% | ✓ (do partii, §11) |
| `tort` | komplet 3-7 kawałków (`tort.ts:50`) | tylko obrót tortu | 0% | ✓ |
| `nozyczki` | 5 kształtów | wypukłość 4,68-4,89, pole 0,68-1,03 | 0,7-6,6% | ✓ |
| `kubki` | 20 rund ze stałą krzywą | ruchy kulki w rundzie 11: 7-13 | 2,7% partia, 11,6% runda | R2 niska (B-KB2) |
| `sledzenie` | 20 rund ze stałą krzywą | bliskie mijanki celu: runda 1 11-138 | 16-30% | R2 (B-SL1) |
| `wieza` | 30 pięter | tylko strona startu (bez wpływu) | - | ✓ |
| `w-pamieci` | 90 działań (`w-pamieci.ts:6`) | mnożeń 15-35 na partię, 2-14 w rundach 1-6 | 13-22% | R2 (B-WP1) |

## 3. Kryterium 2: sufit, remisy i `tie` (REC-02, REC-03)

**Gry z sufitem** (do pierwszej pomyłki, z limitem rund albo z wynikiem całkowitym). Praktyczne maksimum z progów `03-02-BASELINE.md` §2. Ryzyko według D-05.

| gra | sufit teoretyczny | praktyczne maksimum | `tie` | ryzyko remisów na szczycie | wpis |
|---|---|---|---|---|---|
| `kubki` | 20 rund (W) | prawdopodobnie 20 (23 zamiany po 150 ms, ruch czytelny od ok. 100 ms, A) | brak (`kubki.ts:70`, uzasadnienie `ZASADY-GIER.md` :264) | średnie: wynik 0-20, rozstrzyga data | R3 (B-KB1) |
| `sledzenie` | 20 rund (W) | rzadko 20 (rundy 15-20 na granicy 10-15°/s, A) | trafione cele 0-2 (`sledzenie.ts:121`) | niskie do średniego (ok. 60 poziomów) | ✓ |
| `wieza` | 30 pięter (W) | 30 przy σ ≤ 20 ms: 94,5-100% partii (Z) | szerokość ostatniego klocka (ciągła) | średnie: brak remisów całkowitych, ale rekordy mierzą tylko szerokość | R4 (B-WZ1) |
| `w-pamieci` | 12 rund (W) | prawdopodobnie 12 dla sprawnie liczących (A) | odchyłka w rundzie z pomyłką; przy komplecie 0 dla wszystkich | **wysokie, jeśli 12 pada** | R3 (B-WP2) |
| `simon` | 100 (W), limit ucina na 21-24 | dobrzy 15-20 (A) | brak (`simon.ts:41`) | średnie: wynik całkowity w wąskim pasie | R3 (B-SQ2) |
| `zakupy` | 10 pkt (W) | 10 dla większości (pamięć rozpoznawcza 10 obrazków, A) | czas zaznaczania w ms | średnie: na szczycie gra mierzy szybkość klikania (pomiar osłabia F2:ZK1) | R4 (B-ZK2) |
| `stoj` | 27 pkt (W) | 27 dla bardzo dobrych (okno ≥ 500 ms, A) | średnia reakcji (`Math.round`, F1:Z13) | niskie | ✓ |
| `balon` | 155 (W, wymaga wiedzy) | ok. 70-100 (Z, strategie) | pęknięte balony 0-10 | niskie do średniego | ✓ |
| quizy (6 gier) | 200 plansz w stanie (W) | 12-45 zależnie od gry (A); puli nie da się wyczerpać (150 ms na planszę) | średnia odpowiedzi (`Math.round`, F1:Z13) | niskie | ✓ |
| `kolo` | 1000 (W) | ok. 950-985 (A) | brak, wynik w 0,1% | niskie | ✓ |

**Gry z wynikiem ciągłym** (ms, ΔE, km, stopnie, dziesiąte części %): `refleks`, `stoper`, `rytm`, `przytrzymaj`, `zaslona`, `schulte`, `sudoku`, `kolor`, `kropki`, `kat`, `rok`, `srodek`, `mapa`, `tort`, `nozyczki`.
Sufit to 0 błędu, nieosiągalny; remisy na szczycie rzadkie, `tie` niepotrzebne (D-05). Wyjątek pomiarowy: Refleks i Stój! liczą czas od zmiany stanu, nie od klatki (R6).

**`tie` (REC-03)**: potrzebne i obecne w 12 grach (6 quizów, `dziesiatki`, `stoj`, `balon`, `sledzenie`, `wieza`, `zakupy`, `w-pamieci`); brak tam, gdzie wynik się powtarza: `kubki`, `simon` (R3).
W `w-pamieci` `tie` jest, ale nie rozstrzyga kompletu 12 rund (R3). Kierunek `lower` zgodny z dokumentami we wszystkich 30 grach (F1 §3, pilnuje `index.test.ts:180`).
`timeoutMove` daje najgorszy wynik we wszystkich grach poza trzema z F1:Z1 (Schulte, Sudoku, Policz kropki), bez nowych liczb w fazie 3.

## 4. Kryterium 3: krzywe trudności (DIFF-01)

Tabele wyliczone ze stałych (W), progi ludzkie z `03-02-BASELINE.md` §2 (A). „Za łatwe” = rundy, które przechodzi prawie każdy; „niemożliwe” = parametr poza progiem.

**Trzy kubki** (`kubki.ts:7-10`, `:22-23`; pełna tabela 20 rund: `03-01-CHECKS.md` §2.1)

| runda | 1 | 5 | 9 | 15 | 20 |
|---|---|---|---|---|---|
| zamiany | 4 | 8 | 12 | 18 | 23 |
| ms na zamianę | 500 | 400 | 300 | 150 | 150 |
| tasowanie | 2,0 s | 3,2 s | 3,6 s | 2,7 s | 3,45 s |

Za łatwe rundy 1-5 (ok. 25 s), żadna nie przekracza progu (150 ms > ok. 100 ms). O trudności decyduje liczba zamian. Zgodna; sufit → R3.

**Śledzenie** (`sledzenie.ts:10-11`, `:53`; 1 pole/s ≈ 10°/s, A)

| runda | 1 | 5 | 10 | 15 | 20 |
|---|---|---|---|---|---|
| prędkość [pola/s] | 0,30 | 0,54 | 0,84 | 1,14 | 1,44 |
| ok. [°/s] | 3 | 5 | 8 | 11 | 14 |

Granica śledzenia trzech celów 10-15°/s: rundy 15-20 na granicy, nie poza nią. Za łatwe rundy 1-5. Zgodna.

**Wieża** (`wieza.ts:8`, `:11-12`)

| piętro | 1 | 10 | 20 | 30 |
|---|---|---|---|---|
| prędkość [pola/s] | 0,50 | 0,77 | 1,07 | 1,37 |
| okno idealnego trafienia (±2% pola) | ±40 ms | ±26 ms | ±19 ms | ±15 ms |

Od piętra 20 okno poniżej typowej precyzji 20-40 ms, ale pudło przychodzi dopiero przy szerokości < 2%, więc wieża się zwęża zamiast kończyć. Krzywa sensowna, za krótka (R4).

**W pamięci** (`w-pamieci.ts:6`, `:8`; `WPamieci.tsx:16`)

| runda | 1 | 4 | 8 | 12 |
|---|---|---|---|---|
| działania | 2 | 5 | 9 | 13 |
| pokaz | 5,3 s | 9,8 s | 15,8 s | 21,8 s |

Liniowo, żadna runda niemożliwa (wartości ≤ 99, × tylko 2 i 3). Za łatwe rundy 1-3. Za krótka dla sprawnie liczących (R3).

**Inny element** (`inny.ts:5-14`, `:34`)

| plansza | 0 | 4 | 8 | 12 | 16+ |
|---|---|---|---|---|---|
| siatka | 2×2 | 4×4 | 6×6 | 6×6 | 6×6 |
| obrót / jasność / rozmiar | 40° / 20 / 20 | 32° / 16 / 18 | 24° / 13 / 15 | 16° / 9 / 13 | 8° / 5 / 10 |

Najmniejsze różnice powyżej progów rozróżniania (orientacja 1-2°, rozmiar ok. 5%). Płasko od planszy 16; tam różnicuje szybkość szukania. Zgodna.

**Obrót** (`obrot.ts:5-7`): klocki 4 → 7, +1 co 3 pary, od pary 9 stale 7 (ok. 15-25 s rośnie, potem płasko). Zgodna.

**Sekwencja** (`Simon.tsx:21-22`): długość +1 na rundę, tempo stałe 450 + 150 ms. Trudność rośnie tylko z pamięcią; za łatwe rundy 1-5 (ok. 20 s). Zgodna; limit → R1.

**Stój!** (`stoj.ts:6-7`, `:16`): odstęp 1000 → 500 ms liniowo z czasem; końcówka na granicy go / no-go (300-400 ms), nie poza nią. Zgodna.

**Bez progresji** (jawnie): `refleks`, `stoper`, `rytm`, `przytrzymaj`, `zaslona`, `balon`, `stroop`, `liczenie`, `literowka`, `dziesiatki`, `schulte`, `sudoku`, `zakupy`, `kolo`, `kolor`, `kropki`, `kat`, `rok`, `srodek`, `mapa`, `tort`, `nozyczki`.

## 5. Kryterium 4: limity tury (DIFF-02)

Model z `03-02-BASELINE.md` §1.2: T = czasy stałe + decyzje wolnego, ale uczciwego gracza (A) + 3 s sieci; wymagane L ≥ 1,2 · T i L ≥ T + 10 s. Przypadek najostrzejszy: gra solo albo ostatni klikający „Start”.
Zapas % = (L − T) / T. ✗ = poniżej wymogu D-07.

| gra | najdłuższa uczciwa partia T | limit L | zapas | ocena |
|---|---|---|---|---|
| `refleks` | 45 s (teoretycznie 51 s) | 60 s | 15 s, 33% (teoret. 9 s, 18%) | ✓ (maksimum teoretyczne nie występuje: p95 opóźnień 27,3 s) |
| `simon` | seria N: `N + (0,6 + d)·N(N+1)/2` s | 300 s | ucina serię 21-24, z zapasem mieści 18-21 | ✗ R1 (B-SQ1, wysoka) |
| `stoper` | 34 s | 60 s | 26 s, 76% | ✓ |
| `stoj` | 33 s | 60 s | 27 s, 82% | ✓ |
| `rytm` | 20,9 s | 60 s | 39,1 s, 187% | ✓ |
| `przytrzymaj` | 60,5 s | 120 s | 59,5 s, 98% | ✓ |
| `zaslona` | 77,2 s | 120 s | 42,8 s, 55% | ✓ |
| `balon` | 67,5 s | 120 s | 52,5 s, 78% | ✓ |
| quizy (`stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`) | 33 s (30 s wewnętrznego limitu) | 90 s | 57 s, 173% | ✓ |
| `schulte` | 78 s | 180 s | 102 s, 131% | ✓ |
| `sudoku` | 83 s | 120 s | 37 s, 45% | ✓ |
| `zakupy` | 63 s (10 s pokazu + 50 s `MAX_MS` + 3 s) | 60 s | −3 s, −5% | ✗ R1 (B-ZK1, wysoka, W) |
| `kolo` | 63 s | 120 s | 57 s, 90% | ✓ |
| `kolor` | 98 s | 180 s | 82 s, 84% | ✓ |
| `kropki` | 86 s | 120 s | 34 s, 40% | ✓ |
| `kat` | 86 s | 120 s | 34 s, 40% | ✓ |
| `rok` | 228 s (czas twardy: runda kończy się sama po 20 s) | 240 s | 12 s, 5% | ✗ R1 (B-RK2, niska) |
| `srodek` | 63 s przy 5 s na rundę (43 s przy 3 s) | 60 s | −3 s, −5% (17 s, 40%) | ✗ R1 (B-SR1, wysoka, A) |
| `mapa` | 88 s | 180 s | 92 s, 105% | ✓ |
| `tort` | 120,5 s przy 5 s na cięcie (80,5 s przy 3 s) | 120 s | −0,5 s, 0% (39,5 s, 49%) | ✗ R1 (B-TO1, wysoka, A) |
| `nozyczki` | 30,5 s | 60 s | 29,5 s, 97% | ✓ |
| `kubki` | 131,4 s | 180 s | 48,6 s, 37% | ✓ |
| `sledzenie` | 287 s (227 s przy 1 s na wskazanie) | 300 s | 13 s, 4,5% | ✗ R1 (B-SL2, średnia) |
| `wieza` | 154 s, gdy żaden klocek nie jest zatrzymany (uczciwie 60-95 s) | 180 s | 26 s, 17% (uczciwie ok. 90%) | ✓ (17% dotyczy gracza, który nie gra) |
| `w-pamieci` | 237,6 s | 300 s | 62,4 s, 26% | ✓ |

**Gry turowe i fazy** (60 s na ruch, `03-02-BASELINE.md` §1.4; limit odnawia się przy każdym ruchu tego samego gracza):

| gra | najdłuższa tura | limit | zapas | ocena |
|---|---|---|---|---|
| `kampus-tour` | 0,7 s rzutu + 12 × 0,22 s marszu + 30 s decyzji + 3 s = 36,3 s | 60 s | 23,7 s, 65% | ✓ (F2:U2 / KA1 zamknięte co do limitu) |
| `chinczyk` Szybki | 0,4 + 6 × 0,11 s animacji + 5 s + 3 s = 9,1 s | 20 s | 10,9 s, 120% | ✓ (F2:C8 zamknięte) |
| `chinczyk` Klasyczny | do 1,8 s animacji + decyzja | 60 s | duży | ✓ |
| `piec-w-rzedzie`, `labirynt`, `memory` | decyzja kilkanaście-kilkadziesiąt s (A) | 60 s | duży | ✓ |
| `statki` | rozstawianie: „Gotowe” albo kilka przesunięć (A); strzał z animacją 1,2 s | 90 s / 60 s | duży | ✓ |
| `panstwa-miasta` | pisanie 60-80 s (A); głosowanie przy 6 os. 30 cudzych odpowiedzi, 1,5 s na odpowiedź (W); podsumowanie z „Dalej” | 90 / 45 / 20 s | głosowanie przy 5-6 os. ciasne | ✗ R1 (B-PM1, średnia) |
| `kalambury` | wybór 15 s, rysowanie 2 × 40 s (cecha gry), odsłona 6 s | według fazy | - | ✓ |
| `turniej` | limit każdej gry osobno; między grami 15 s albo „Dalej” | - | - | ✓ |

## 6. Kryterium 5: gry główne (DIFF-03)

**Przewaga kolejności** (boty, sygnał, nie dowód, D-08; rotacja miejsc przy rewanżu to kompensata, `KONCEPT.md` §3):

| gra | wygrane według miejsca | partii | ocena | wpis |
|---|---|---|---|---|
| `kampus-tour` 2 / 3 / 4 os. | 45-48 / 52-54%; 29-31 / 32 / 36-38%; 21-22 / 22-23 / 25-26 / 29-31% | 1000 na wariant | ostatni wygrywa najczęściej: premia +20 zł za miejsce przeważa przewagę pierwszego ruchu | R5 (B-KT1) |
| `piec-w-rzedzie` | teoria: wolne Gomoku 15×15 wygrywa pierwszy przy idealnej grze (Allis 1994) | - | między znajomymi nieznane | R5 (B-GO1) |
| `labirynt` Klasyczny 2 / 3 / 4 os. | 58 / 42%; 21 / 34 / 45%; 14 / 19 / 32 / 35% | 600 / 300 / 300 | przy 3-4 os. wygrywa ostatni („bij lidera”) | R5 (B-LB1) |
| `labirynt` Szybki 2 / 3 / 4 os. | 50 / 50%; 23 / 23 / 54%; 19 / 16 / 27 / 38% | 600 / 300 / 300 | jw. | R5 (B-LB1) |
| `statki` (4 tryby) | zaczynający 50,8-54,5% (najwięcej Flota wojenna) | 2000 na tryb | mała przewaga | R5 (B-ST1) |
| `chinczyk` (2 tryby, 2-4 os.) | w granicach ±3 pkt % | 1000 na wariant | równo | ✓ |
| `memory` (3 tryby, pamięć pełna / 6 kart) | pełna pamięć: Mała 3 os. pierwszy 13,7%, drugi 43,3%; przy 6 kartach różnice znikają; remis na górze 5-22% | 2000 na wariant | zależne od pamięci graczy | R5 (B-ME1) |
| `panstwa-miasta` | brak kolejności; STOP daje reszcie 7 s; na Ł brak państwa | - | litera Ł to słabsza runda dla wszystkich | B-PM2 |
| `kalambury` | każdy rysuje tyle samo razy; przy 2 os. rysowanie daje 3 pkt, zgadywanie 10 | - | wynik przy 2 os. zależy prawie tylko od zgadywania | B-KA1 |
| `turniej` | brak kolejności; dogrywka przy 2 graczach i 8 grach w 27,5% turniejów | 20 000 na wariant | parzysta domyślna liczba gier | B-TU1 |

**Ekonomia Kampus Tour** (`KONCEPT.md` §9; szczegóły i tabela grup: `03-03-FINDINGS.md`):
- Balans (start 200 zł, kieszonkowe 40, czynsze, poziomy): u botów 93-99% partii kończy limit 20 rund, bankructwo 0,6-6%, monopol 0,2-1%, komplety w 65-80% partii (pierwszy ok. r11-13).
  Szybkich bankructw z partii testowych sprzed zmian 2026-10-07 nie widać. Proporcje zwrotu są równe między grupami (wszystko z P); przy 2 graczach budowa nie zwraca się w 20 rundach (A). Zostawić, sprawdzić w partii.
- Monopol: każdy z 33 monopoli w symulacji zawierał grupę dwupolową; rzadki, więc zostawić (B-KT2).
- Bilet MPK: 30-38% kompletów (B-KT3, średnia).
- F1:K2 (Juwenalia po wykupie) i F1:K11 (budynki po utracie kompletu): rzadkie i spójne, zostawić i dopisać w zasadach (B-KT4, B-KT5).
- Długość: szacunek 26-41 min przy 4 graczach, w tym 3,4 min animacji marszu (B-KT6, do zegara w partii).

**Tryby Szybkie**: Labirynt 7×7 (ok. 40% krótszy, przy 2 os. bez przewagi zaczynającego), Statki Szybki 8×8 (34 tury wobec 61-69), Chińczyk Szybki (ok. 10 min przy 4 os., zgodnie z dokumentem)
zachowują sens gry. Memory Mała częściej kończy się remisem (do 22%), ale to cecha 8 par. Bez wpisów.

## 7. Wpisy zbiorcze

Format: reguła, waga (najwyższa z częściowych, z uzasadnieniem), tabela gier z `plik:linia` i identyfikatorem wpisu częściowego, wspólna propozycja i rekomendacja. Sekcje kryteriów (§2-6) i macierz (§9) odsyłają tu.

### R1. Limit tury bez zapasu `[zbiorcze: limit-tury-bez-zapasu]` (= F1:Z2, liczby fazy 3)
- Źródło: `ZASADY.md` §3 :106 („tyle, ile trwa najdłuższa uczciwa partia plus zapas”); wymóg zapasu ≥ 20% i ≥ 10 s z D-07.
- Waga: **wysoka** (Sekwencja i Zakupy wyliczone; Środek i Tort wysokie według modelu 5 s na celowanie, do potwierdzenia pomiarem w partii).
  F1:Z2 dawało Środkowi średnią „do pomiaru”; model fazy 3 daje −3 s, więc wysoka z zastrzeżeniem.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `simon` (B-SQ1, F1:SQ1) | `packages/games/src/simon.ts:25`, `:45`; `apps/web/src/games/Simon.tsx:61-64` | limit ucina serię 21-24 (d = 0,35-0,7 s na kolor), z zapasem mieści 18-21; dobrzy gracze 15-20 | wysoka | ruch `progress` z bieżącą serią i `timeoutMove` oddający ostatnią zaliczoną (odstępstwo z powodem w `ZASADY-GIER.md` §Sekwencja) albo limit 600 s; wzór T(N) w dokumencie | zmienić | W (wzór), A (d) |
| `zakupy` (B-ZK1, F1:ZK1) | `packages/games/src/zakupy.ts:8-9`, `:37`; `zakupy.test.ts:42-45`; `ZASADY-GIER.md` :492 | T = 63 s, L = 60 s, zapas −3 s | wysoka | `turnSeconds` 75-80 s, ekran oddaje sam po `MAX_MS` (styk z F2:ZK1: ta sama funkcja `done`); najpierw test i dokument | zmienić | W |
| `srodek` (B-SR1, F1:SR1) | `packages/games/src/srodek.ts:83`; `srodek.test.ts:39`; `ZASADY-GIER.md` :27; `KONCEPT.md` §3 | T = 63 s przy 5 s na rundę, 43 s przy 3 s | wysoka (A) | `turnSeconds` 90 s | zmienić | A |
| `tort` (B-TO1) | `packages/games/src/tort.ts:42`; `ZASADY-GIER.md` §Tort; `KONCEPT.md` :234 | 20 cięć: T = 120,5 s przy 5 s na cięcie, 80,5 s przy 3 s | wysoka (A) | `turnSeconds` 180 s (zapas 49% przy 5 s) | zmienić albo zmierzyć w partii | A |
| `sledzenie` (B-SL2) | `packages/games/src/sledzenie.ts:70`; `KONCEPT.md` :233 | T = 287 s, zapas 13 s (4,5%); część stała 164 s | średnia | `turnSeconds` 360 s (zapas 25%) | zmienić (tanio) | W, A |
| `panstwa-miasta` (B-PM1) | `packages/games/src/panstwa-miasta.ts:43`, `:153`; `ZASADY-GIER.md` :637 | głosowanie 45 s: przy 6 os. 30 odpowiedzi, 1,5 s na odpowiedź; limit = „nic nie odrzucam” | średnia | głosowanie `20 + 7 × (n − 1)` s (27 / 41 / 55 s przy 2 / 4 / 6 os.) | sprawdzić w partii (6 os.), potem zmienić | W, A |
| `rok` (B-RK2) | `packages/games/src/rok.ts:30`; `ZASADY-GIER.md` :181 | T twarde 228 s, zapas 12 s (5%) tylko na sieć | niska | 270 s albo zapis „T twarde, zapas na sieć” | zmienić (tanio) | W |

- Wspólna propozycja: zapisać model T i wymóg zapasu w `ZASADY.md` §3 :106 (§12) i przy każdej zmianie limitu poprawić `KONCEPT.md` §3 (lista limitów), test `<gra>.test.ts` i `ZASADY-GIER.md`.

### R2. Trudność partii zależy od losowania `[zbiorcze: trudnosc-z-losowania]` (= F1:Z3, liczby fazy 3)
- Źródło: `ZASADY.md` §3 :100-102. Litera (sufit, suma) spełniona; uzasadnienie (każda partia równie trudna) nie.
- Waga: **średnia** (wszyscy w partii grają to samo wyzwanie; dotyka porównania rekordów między partiami: rekord pada w „łatwej” partii).

| gra | miejsce | rozrzut (Z) i skutek | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `stoper` (B-SP1, F1:W6a) | `packages/games/src/stoper.ts:30` | cel 6-14 s; oczekiwana odchyłka 480 → 1120 ms (2,3×) | średnia (największy efekt) | stały cel 10 s albo kilka rund o stałej sumie (`withSum`); albo wynik względny (‰ celu); zmiana wyniku = nowy klucz rekordów | zmienić | W, A |
| `rytm` (B-RY1, F1:W6a) | `packages/games/src/rytm.ts:35`, `:50` | odstęp 462-857 ms; 14-23 ms wobec 26-43 ms (1,9×) | średnia | odchyłka względna (‰ odstępu) albo stałe tempo; nowy klucz rekordów i `FORMAT` | zmienić | Z, A |
| `kolor` (B-KR1, F1:W8b) | `packages/games/src/kolor.ts:89` | czułość 47-86 ΔE, p95 / p5 1,35× | średnia | barwy z sześciu sektorów bez powtórzeń, nasycenie i jasność z pasm na zmianę, albo losowanie do skutku w paśmie mediany ±5% | zmienić | Z, A |
| `liczenie` (B-LC1, F1:LC1) | `packages/games/src/liczenie.ts:32`; `ZASADY-GIER.md` :112 („po równo”) | każdy rodzaj 1-21 na 40; ok. 2 trafienia (13%) | średnia | rodzaje potasowanymi czwórkami (jak `stroop.ts:35`); przy wyniku równym a albo b losować od nowa tylko liczby | zmienić | Z, A |
| `obrot` (B-OB1) | `packages/games/src/obrot.ts:68`, `:72` | lustro 8-29 i 180° 5-25 na 40; ok. 1-1,5 trafienia (8%) | średnia | szóstki 90 / 180 / 270 × ta sama / lustro, tasowane | zmienić | Z, A |
| `dziesiatki` (B-DZ1) | `packages/games/src/dziesiatki.ts:48-58`, `:27-33` | par na planszy 4,4-19,7 (30%) | średnia | dostawy z kompletów cyfr albo `take` pilnujący stałej liczby par (np. dokładnie 2) | zmienić, sprawdzić w partii | Z, A |
| `sudoku` (B-SU1) | `packages/games/src/sudoku.ts:64-80` | pola z jednym kandydatem 1-7, fale 2-5 | średnia | `makePuzzle` losuje do skutku planszę o stałej liczbie fal i pól „od razu” (np. 3 i 3) | zmienić | Z, A |
| `kat` (B-KAT1, F1:W8b) | `packages/games/src/kat.ts` (setup, `int(rng, MIN, MAX)`) | suma kątów 421-1378° (18%); wpływ na błąd nieznany | średnia | po dwa kąty z pięciu pasm (5-38°, 39-72°, 73-106°, 107-140°, 141-175°), tasowane | sprawdzić w partii, potem zmienić | Z, A |
| `sledzenie` (B-SL1) | `packages/games/src/sledzenie.ts:31-45` | mijanki celu w rundzie 1: 11-138 (30%) | średnia | losowanie rundy do skutku w paśmie mediany mijanek ±20% | zmienić | Z, A |
| `w-pamieci` (B-WP1, F1:W9a) | `packages/games/src/w-pamieci.ts:35-46` | mnożeń 15-35 na partię, 2-14 w rundach 1-6 | średnia | co trzecie działanie mnożenie, pozycje tasowane w rundzie | zmienić | Z, A |
| `stoj` (B-SJ1) | `packages/games/src/stoj.ts:54-55` | zielone w szybkiej końcówce 6-16 (14,5%) | niska | czerwone tasowane osobno w każdej tercji harmonogramu | sprawdzić w partii | Z, A |
| `zaslona` (B-ZS1) | `packages/games/src/zaslona.ts:32`, `:46-48` | widoczność 8,3-14,2 s (8,8%) | niska | widoczność przez `withSum` (np. 11 200 ms) albo stały stosunek do ukrytego czasu | sprawdzić w partii | Z, A |
| `literowka` (B-LT1) | `packages/games/src/literowka.ts:38-39`, `literowka-dane.ts` | rodzaj błędu 6-25 na 45 (18%) | niska | rodzaje błędów w tasowanych trójkach (wymaga pola rodzaju w danych) | sprawdzić w partii | Z, A |
| `rok` (B-RK1) | `packages/games/src/rok.ts:37-213`, `:224` | wydarzeń od 1990 1-9 (29%); działy tylko w komentarzach | niska | pole `dzial` w `EVENTS`, po 2-3 wydarzenia z działu | sprawdzić w partii | Z, A |
| `kubki` (B-KB2) | `packages/games/src/kubki.ts:30-40` | ruchy kulki w rundzie 11: 7-13 (11,6%) | niska | udział zamian z kulką w stałym paśmie | zostawić | Z |

- Gry, w których F1:Z3 przypuszczało wpływ, a faza 3 go nie potwierdza liczbą: brak (wszystkie 6 z F1:Z3 mają rozrzut ≥ 9%). Gry spoza F1:Z3 dodane przez fazę 3: Obrót, Dziesiątki, Sudoku, Śledzenie i niskie.
- Historia (F1:Z3): Stoper, Rytm i Liczenie sprzed reguły kompletów (`a590005`, 2026-10-12). Zmiana miary wyniku (Stoper, Rytm) unieważnia stare rekordy: osobny klucz albo wersja w `stats.ts` (decyzja fazy 4).

### R3. Sufit osiągalny bez rozstrzygnięcia remisu `[zbiorcze: sufit-bez-tie]`
- Źródło: D-05, D-09 (sufit osiągalny przez dobrego gracza bez `tie` albo z `tie`, które prawie zawsze daje równość); `KONCEPT.md` §2.4 (rekordy: przy całkiem równych wyżej wcześniejszy).
- Waga: **wysoka warunkowo** (W pamięci, jeśli partie pokażą, że 12 pada), inaczej średnia.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `w-pamieci` (B-WP2) | `packages/games/src/w-pamieci.ts:4`, `:82-84`; `ZASADY-GIER.md` :437 | 12 rund, ostatnia 13 działań w 21,8 s; przy komplecie `diff` = 0 u wszystkich | wysoka, jeśli 12 pada | wolniejszy przyrost długości po rundzie 12 i więcej rund (20 rund wprost daje T ok. 560 s) albo `tie` przy komplecie = czas odpowiedzi w ostatniej rundzie | sprawdzić w partii, potem zmienić | A |
| `kubki` (B-KB1) | `packages/games/src/kubki.ts:4`, `:70`; `ZASADY-GIER.md` :264 | 20 rund, ostatnia 23 zamiany po 150 ms; wynik 0-20 bez `tie` | średnia | rundy bez górnej granicy z tą samą krzywą (np. 40, limit przeliczyć) albo `tie` = czas wskazania w rundzie z pomyłką | sprawdzić w partii | A |
| `simon` (B-SQ2) | `packages/games/src/simon.ts:41`; `ZASADY-GIER.md` :76-78 | serie dobrych 15-20, wynik całkowity bez `tie` | średnia | `tie` = czas wpisywania ostatniej serii albo zapis w `ZASADY-GIER.md`, że remis rozstrzyga data | sprawdzić w partii | A |

- Wspólna propozycja: reguła w `ZASADY.md` §3, że gra z sufitem osiągalnym ma `tie` albo nie ma sufitu (§12). W Turnieju częste remisy w tych grach spłaszczają tabelę (03-04, A).

### R4. Sufit w zasięgu najlepszych, `tie` mierzy co innego `[zbiorcze: sufit-osiagalny]`
- Źródło: D-05 (sufit blisko praktycznego maksimum). Różnica wobec R3: `tie` rozstrzyga (wynik ciągły), ale na szczycie gra mierzy coś innego niż w opisie.
- Waga: **średnia**.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `wieza` (B-WZ1) | `packages/games/src/wieza.ts:4`, `:12`, `:98` | σ 20 ms: 94,5% partii na 30 piętrach; σ 30 ms: 11% (Z) | średnia | 50 pięter (limit 180 s wystarcza: 50 × 3 s) albo `SPEED_STEP` 0,05; po zmianie przeliczyć symulację (`03-08-FINDINGS.md`, załącznik) | zmienić | Z, A (σ człowieka) |
| `zakupy` (B-ZK2) | `packages/games/src/zakupy.ts:5-6`, `:81` | 10 z 10 dla większości (A); na szczycie decyduje czas klikania (pomiar F2:ZK1) | średnia | jeśli 10 pada często: lista 12-14 albo podobne przedmioty na półce | sprawdzić w partii | A |

### R5. Przewaga kolejności w grach głównych `[zbiorcze: przewaga-pierwszego]`
- Źródło: kryterium 5 roadmapy, `KONCEPT.md` §9; D-09 (przewaga bez kompensaty = średnia; rotacja przy rewanżu to kompensata). Nazwa klucza historyczna: w Kampus Tour i Labiryncie wygrywa ostatni.
- Waga: **średnia** (Kampus Tour i Labirynt przy 3-4 os.: rotacja wyrównuje dopiero po 3-4 partiach).

| gra | miejsce | liczby fazy 3 (Z, boty) | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `kampus-tour` (B-KT1) | `packages/games/src/kampus-tour.ts:8` (`SEAT_BONUS`), `:505`; `ZASADY-GIER.md` :671 | 4 os.: 20,7 / 22,4 / 25,8 / 31,0%; 3 os.: 29,2 / 32,2 / 38,3% | średnia | premia 10 zł za miejsce zamiast 20; przed zmianą zapisać wygrane według miejsca w partiach | sprawdzić w partii, potem zmienić | Z |
| `labirynt` (B-LB1) | `packages/games/src/labirynt.ts:138`; `ZASADY-GIER.md` :834-835 | 3-4 os.: ostatni 35-54%, pierwszy 14-23%; 2 os. Klasyczny 58% | średnia (3-4 os.) / niska (2 os.) | przy 3-4 os. zaczyna losowy gracz albo pierwsi dostają +1 ściankę | sprawdzić w partii | Z, A |
| `piec-w-rzedzie` (B-GO1) | setup (tura od `players[0]`); `ZASADY-GIER.md` :570-571 | teoria: pierwszy wygrywa przy idealnej grze | niska (rotacja) | przy przewadze wyraźnie ponad 60%: swap po trzech kamieniach | sprawdzić w partii | A |
| `memory` (B-ME1) | `packages/games/src/memory.ts:56`; `ZASADY-GIER.md` :754 | pełna pamięć, Mała 3 os.: 13,7 / 43,3 / 34,0%; przy 6 kartach równo | niska | jeśli partie potwierdzą: w Małej przy 3+ os. zaczyna losowy gracz | sprawdzić w partii | Z, A |
| `statki` (B-ST1) | bitwa od `players[0]`; `ZASADY-GIER.md` :592 | zaczynający 50,8-54,5% | niska | brak zmian; Flota wojenna do obserwacji | zostawić | Z |

### R6. Pomiar czasu od zmiany stanu, nie od klatki `[zbiorcze: pomiar-od-klatki]` (styk z F2:U28 `pomiar-timestamp`)
- Źródło: `ZASADY.md` §5 (pomiar czasu), §3 :100 (porównywalność rekordów). Faza 2 opisała mechanizm (F2:U28); faza 3 dodaje wpływ na wynik.
- Waga: **niska**.
- Liczby fazy 3: błąd klatkowy 8-17 ms (W, 120 / 60 Hz) wobec opóźnienia ekranu i dotyku 50-100 ms zależnego od telefonu (A). Przy Refleksie ok. 250 ms to kilka do kilkunastu procent między telefonami;
  da się usunąć tylko część klatkową. Stoper (SP2: 8-17 ms przy setkach ms odchyłki) i Wieża (WZ2: przesunięcie stałe dla telefonu, gracz się dostosowuje) bez wpływu, bez wpisu.

| gra | miejsce | propozycja | rekomendacja | pewność |
|---|---|---|---|---|
| `refleks` (B-RF1, F2:RF4) | `apps/web/src/games/Refleks.tsx:154`, `:167` | `goAt` z `requestAnimationFrame` po narysowaniu bodźca; w `ZASADY-GIER.md` §Refleks zapis, że rekordy zależą od telefonu | zmienić (tanio) | W, A |
| `stoj` (B-SJ2, F2:SJ2) | `apps/web/src/games/Stoj.tsx:53`, `:71` | jak wyżej; ma znaczenie tylko dla `tie` i progu 100 ms | zmienić (tanio) | W |

### R7. `withSum` wyrównuje sumę, ale nie szanse `[zbiorcze: withsum-rozklad]`
- Źródło: `ZASADY.md` §3 :100 („tyle samo do zdobycia”); `03-02-BASELINE.md` §3.1 (czego `withSum` nie gwarantuje).
- Waga: **średnia**.

| gra | miejsce | liczby fazy 3 | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|
| `balon` (B-BL1) | `packages/games/src/balon.ts:53` | suma 155 stała, ale „stop na 10” daje 50-100 pkt (12%), „stop na 15” 45-120 (16%), najlepsza stała strategia po fakcie 72-126 (10%) | stały komplet 10 wytrzymałości o sumie 155, tasowany co partię (wzorzec Tortu) | zmienić | Z |

- Przytrzymaj i Za zasłoną też używają `withSum`; przy błędzie liniowym (prawo skalarne) stała suma wystarcza (rozrzut 5% i 0%, Z). Ten sam stały komplet byłby tam potrzebny, tylko gdyby partie pokazały wpływ rozkładu.
- Do dokumentu: w `ZASADY.md` §3 dopisać, że w grze z ryzykiem (decyzja „stop”) stała suma nie wystarcza, potrzebny jest stały komplet (§12).

### R8. Limit mini-gry odnawiany wynikiem rywala `[zbiorcze: limit-odnawiany-wynikiem]`
- Źródło: `ZASADY.md` §3 :106, `KONCEPT.md` §3 (limit po ekranie instrukcji). Waga: **niska** (dotyczy tylko gry wieloosobowej; ocena zapasu w §5 liczy przypadek solo).

| miejsce | liczby fazy 3 | propozycja | rekomendacja | pewność |
|---|---|---|---|---|
| `apps/server/src/LobbyRoom.ts:375-376` (B-PL1); stały `key`: `balon.ts:45`, `kropki.ts:52`, `kat.ts:45`, `sudoku.ts:86`, `rok.ts:216`, `schulte.ts:37`, `wieza.ts:72`; `kolo.ts:154` (`key` po `waiting`) | w 23 mini-grach (22 bez `turn()` i Narysuj koło) oddanie wyniku przez rywala daje reszcie pełny limit od nowa (Refleks do 2 × 60 s), w 7 ze stałym `key` nie (Balon zawsze 120 s) | stały `key` dla wszystkich mini-gier (jeden limit od startu), zapis w `KONCEPT.md` §3 | zmienić (tanio) | W |

## 8. Wpisy pojedyncze

| wpis | gra | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|---|
| B-KT3 | `kampus-tour` | `packages/games/src/kampus-tour.ts:530` (`travel`); `ZASADY-GIER.md` :713-715 | `KONCEPT.md` §9 (MPK jako darmowy komplet) | średnia | MPK daje 30-38% kompletów (279-454 na 1000 partii); opcje: jazda nie może kupić pola domykającego komplet, jazda kosztuje (np. 15 zł), albo bilet tylko na pola specjalne | sprawdzić w partii | Z |
| B-KT2 | `kampus-tour` | `packages/games/src/kampus-tour.ts:366-370`; `KONCEPT.md` §9 | `KONCEPT.md` §9 (grupy dwupolowe) | niska | monopol 0,2-1% partii, 33 z 33 z grupą dwupolową; zostawić, dopisać odpowiedź w §9; jeśli w partiach częściej niż raz na kilka gier: grupa dwupolowa jako pół | zostawić | Z |
| B-KT4 (F1:K2) | `kampus-tour` | `packages/games/src/kampus-tour.ts:575-588`, `:297-298` | `ZASADY-GIER.md` §6 :694-697 | niska | Juwenalia zostają na polu po wykupie (1-17 przypadków na 1000 partii); dopisać w §6 Wykupienie | zostawić | Z |
| B-KT5 (F1:K11) | `kampus-tour` | `packages/games/src/kampus-tour.ts:263-266`, `:611-626` | `ZASADY-GIER.md` §6 :689-692 | niska | budynki ponad poziom 2 zostają po utracie kompletu (0,01-0,14 pola na partię); dopisać w §6 Budowa | zostawić | Z |
| B-KT6 | `kampus-tour` | `KONCEPT.md` §2.1; `apps/web/src/games/KampusTour.tsx:206-207` | `KONCEPT.md` §2.1 (45 min) | niska | szacunek 26-41 min przy 4 os.; przy przekroczeniu 16-18 rund albo krótszy `STEP_MS` | sprawdzić w partii | A |
| B-PM2 | `panstwa-miasta` | `packages/games/src/panstwa-miasta.ts:6` | kryterium 5 roadmapy | niska | usunąć Ł z `LETTERS` (brak państwa) albo zapisać w `ZASADY-GIER.md` jako znaną słabszą rundę | zostawić albo zmienić (tanio) | W |
| B-KA1 | `kalambury` | `packages/games/src/kalambury.ts` (`GUESS_POINTS`, `DRAWER_POINTS`); `ZASADY-GIER.md` :817 | kryterium 5 roadmapy | niska | rysujący 3 pkt × (n − 1); przy 2 os. rozważyć 5 pkt | sprawdzić w partii | W |
| B-TU1 | `turniej` | `packages/games/src/turniej.ts` (`DEFAULT_LENGTH` 8); `ZASADY-GIER.md` :775 | kryterium 5 roadmapy | niska | domyślnie 7 albo 9 gier: przy 2 graczach dogrywka 0% zamiast 27,5% | zmienić (tanio) albo zostawić | Z |

## 9. Macierz gra × kryterium

✓ = zgodne, wpis = identyfikator z wagą (w = wysoka, ś = średnia, n = niska), „n/d” = kryterium nie dotyczy gry (gry główne nie mają rekordów mini-gier, mini-gry nie mają kolejności).
REC-02 = sufit i remisy na szczycie, REC-03 = `tie` i kierunek `lower`. Ostatnia kolumna: rekomendacja dla gry.

| gra | REC-01 | REC-02 | REC-03 | DIFF-01 | DIFF-02 | DIFF-03 | rekomendacja |
|---|---|---|---|---|---|---|---|
| `refleks` | ✓ | ✓ (R6 n) | ✓ niepotrzebne | bez progresji | ✓ 33% | n/d | zostawić (R6 tanio) |
| `simon` | ✓ (do partii) | R3 ś (B-SQ2) | R3 brak `tie` | ✓ | R1 w (B-SQ1) | n/d | zmienić |
| `stoper` | R2 ś (B-SP1) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 76% | n/d | zmienić |
| `stoj` | R2 n (B-SJ1) | ✓ (R6 n) | ✓ (F1:Z13 n) | ✓ | ✓ 82% | n/d | zostawić |
| `rytm` | R2 ś (B-RY1) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 187% | n/d | zmienić |
| `przytrzymaj` | ✓ | ✓ | ✓ niepotrzebne | bez progresji | ✓ 98% | n/d | zostawić |
| `zaslona` | R2 n (B-ZS1) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 55% | n/d | sprawdzić w partii |
| `balon` | R7 ś (B-BL1) | ✓ | ✓ (słabe) | bez progresji | ✓ 78% | n/d | zmienić |
| `stroop` | ✓ | ✓ | ✓ (F1:Z13 n) | bez progresji | ✓ 173% | n/d | zostawić |
| `liczenie` | R2 ś (B-LC1) | ✓ | ✓ (F1:Z13 n) | bez progresji | ✓ 173% | n/d | zmienić |
| `inny` | ✓ | ✓ | ✓ (F1:Z13 n) | ✓ (płasko od 16) | ✓ 173% | n/d | zostawić |
| `obrot` | R2 ś (B-OB1) | ✓ | ✓ (F1:Z13 n) | ✓ | ✓ 173% | n/d | zmienić |
| `literowka` | R2 n (B-LT1) | ✓ | ✓ (F1:Z13 n) | bez progresji | ✓ 173% | n/d | sprawdzić w partii |
| `dziesiatki` | R2 ś (B-DZ1) | ✓ | ✓ (F1:Z13 n) | bez progresji | ✓ 173% | n/d | zmienić |
| `schulte` | ✓ | ✓ (F1:Z1) | ✓ niepotrzebne | bez progresji | ✓ 131% | n/d | zostawić |
| `sudoku` | R2 ś (B-SU1) | ✓ (F1:Z1) | ✓ niepotrzebne | bez progresji | ✓ 45% | n/d | zmienić |
| `zakupy` | ✓ (do partii) | R4 ś (B-ZK2) | ✓ (pomiar F2:ZK1) | bez progresji | R1 w (B-ZK1) | n/d | zmienić |
| `kolo` | ✓ | ✓ | ✓ niepotrzebne | bez progresji | ✓ 90% | n/d | zostawić |
| `kolor` | R2 ś (B-KR1) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 84% | n/d | zmienić |
| `kropki` | ✓ | ✓ (F1:Z1) | ✓ niepotrzebne | bez progresji | ✓ 40% | n/d | zostawić |
| `kat` | R2 ś (B-KAT1) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 40% | n/d | sprawdzić w partii |
| `rok` | R2 n (B-RK1) | ✓ | ✓ niepotrzebne | bez progresji | R1 n (B-RK2) | n/d | zostawić |
| `srodek` | ✓ | ✓ | ✓ niepotrzebne | bez progresji | R1 w (B-SR1, A) | n/d | zmienić |
| `mapa` | ✓ (do partii) | ✓ | ✓ niepotrzebne | bez progresji | ✓ 105% | n/d | zostawić |
| `tort` | ✓ | ✓ | ✓ niepotrzebne | bez progresji | R1 w (B-TO1, A) | n/d | zmienić albo zmierzyć |
| `nozyczki` | ✓ | ✓ | ✓ niepotrzebne | bez progresji | ✓ 97% | n/d | zostawić |
| `kubki` | R2 n (B-KB2) | R3 ś (B-KB1) | R3 brak `tie` | ✓ | ✓ 37% | n/d | sprawdzić w partii |
| `sledzenie` | R2 ś (B-SL1) | ✓ | ✓ (słabe) | ✓ (granica od r15) | R1 ś (B-SL2) | n/d | zmienić |
| `wieza` | ✓ | R4 ś (B-WZ1) | ✓ | ✓ (za krótka) | ✓ 17% / ok. 90% | n/d | zmienić |
| `w-pamieci` | R2 ś (B-WP1) | R3 w warunkowo (B-WP2) | R3 `tie` nie rozstrzyga kompletu | ✓ (za krótka) | ✓ 26% | n/d | zmienić |
| `kampus-tour` | n/d | n/d | n/d | n/d | ✓ 65% (F2:U2) | R5 ś (B-KT1), B-KT3 ś, B-KT2/4/5/6 n | sprawdzić w partii |
| `piec-w-rzedzie` | n/d | n/d | n/d | n/d | ✓ | R5 n (B-GO1) | sprawdzić w partii |
| `statki` | n/d | n/d | n/d | n/d | ✓ | R5 n (B-ST1) | zostawić |
| `chinczyk` | n/d | n/d | n/d | n/d | ✓ 120% Szybki (F2:C8) | ✓ | zostawić |
| `labirynt` | n/d | n/d | n/d | n/d | ✓ | R5 ś (B-LB1) | sprawdzić w partii |
| `memory` | n/d | n/d | n/d | n/d | ✓ | R5 n (B-ME1) | zostawić (zapis w partii) |
| `panstwa-miasta` | n/d | n/d | n/d | n/d | R1 ś (B-PM1) | B-PM2 n | zmienić |
| `kalambury` | n/d | n/d | n/d | n/d | ✓ | B-KA1 n | zostawić |
| `turniej` | n/d | n/d | n/d | n/d | ✓ | B-TU1 n | zostawić |

Platforma (bez wiersza gry): R8 (B-PL1, niska), dotyczy wszystkich mini-gier w grze wieloosobowej.
Liczba rekomendacji (39 pozycji): zmienić 16, sprawdzić w partii 7, zostawić 16.

## 10. Zamknięcie wpisów z faz 1-2 (D-02)

| identyfikator | co przekazano | wynik fazy 3 | wpis fazy 3 | rekomendacja | status |
|---|---|---|---|---|---|
| F1:Z2 / SQ1 | Sekwencja 300 s | limit ucina serię 21-24, z zapasem 18-21 (W z A) | R1 (B-SQ1) | zmienić | zamknięte liczbą, do fazy 4 |
| F1:Z2 / ZK1 | Zakupy 60 s | T = 63 s, zapas −3 s (W) | R1 (B-ZK1) | zmienić | zamknięte liczbą, do fazy 4 |
| F1:Z2 / SR1 | Środek 60 s, do pomiaru | T = 63 s przy 5 s na rundę, 43 s przy 3 s (A); waga podniesiona do wysokiej z zastrzeżeniem | R1 (B-SR1) | zmienić | zamknięte modelem, pomiar w partii (§11) |
| F1:Z3 / W6a | Stoper, Rytm | Stoper 2,3×, Rytm 1,9× przy tej samej umiejętności (W z A) | R2 (B-SP1, B-RY1) | zmienić | zamknięte liczbą, do fazy 4 |
| F1:Z3 / LC1 | Liczenie | ok. 2 trafienia (13%) różnicy, rozbieżność z „po równo” | R2 (B-LC1) | zmienić | zamknięte liczbą, do fazy 4 |
| F1:Z3 / W8b | Odcień, Kąt | Odcień 1,35× (Z); Kąt rozrzut 18%, wpływ do pomiaru | R2 (B-KR1, B-KAT1) | zmienić / sprawdzić w partii | zamknięte liczbą, Kąt w §11 |
| F1:Z3 / W9a | W pamięci | mnożeń 15-35 (13%), w rundach 1-6 2-14 (22%) | R2 (B-WP1) | zmienić | zamknięte liczbą, do fazy 4 |
| F1:K2 | Juwenalia po wykupie | 1-17 na 1000 partii, zachowanie spójne | B-KT4 | zostawić, dopisać w §6 | zamknięte |
| F1:K11 | budynki po utracie kompletu | 0,01-0,14 pola na partię | B-KT5 | zostawić, dopisać w §6 | zamknięte |
| F2:U2 / KA1 | marsz pionka w Kampus Tour | 3,3 s z 60 s, zapas 65%; długość partii 26-41 min | B-KT6 | limit zostawić; UX (akcja po animacji) zostaje w F2:U2 | zamknięte co do balansu |
| F2:U2 / C8 | Chińczyk Szybki | ok. 1 s z 20 s, zapas 120% | ✓ | zostawić | zamknięte |
| F2:A9 / WP3 | W pamięci: 0 rund po limicie | po pomyłce w rundzie 8 zostaje ok. 170 s na „Wyniki”; ryzyko tylko przy porzuconej partii | - | poprawka UX zostaje w F2:A9 | zamknięte co do balansu |
| F2:U28 (RF4, SJ2, SP2, WZ2) | dokładność pomiaru | klatka 8-17 ms wobec sprzętu 50-100 ms; wpływ tylko w Refleksie i Stój! | R6 (B-RF1, B-SJ2) | zmienić (tanio) | zamknięte liczbą, do fazy 4 |
| F2:U31 / SC1 | kary Schultego i Sudoku całkowite czy ułamkowe | kara całkowita (3 s i 5 s), `ms` całkowite, wynik zawsze całkowity; kropka w ekranie to sprawa F2 | - | bez zmian balansu | zamknięte |

Wpisy faz 1-2 dotknięte przy okazji (bez przekazania w D-02): F1:Z13 `tie-zaokraglenie` (równość co do ms rzadka, A: zostawić wagę niską), F1:Z1 `timeout-nie-najgorszy`
(bez nowych liczb, zostaje w fazie 1), F2:ZK1 (pomiar „Gotowe” osłabia `tie` Zakupów na szczycie, R4).

## 11. Sprawdzić w partii

Lista dla użytkownika (D-08, D-11). Każda pozycja: pytanie, na które partia ma odpowiedzieć, i co zapisać. Wyniki mini-gier w bazie produkcyjnej (`scores` z `tie` i `detail`) odpowiadają na pozycje 9-13 bez osobnych partii:
wystarczy kopia `games.db` z Pi do scratchpadu i skrypt `db.ts` z `03-01-CHECKS.md` §5.

| # | gra (wpis) | pytanie | co zapisać |
|---|---|---|---|
| 1 | Kampus Tour (B-KT1) | Czy ostatni w kolejności wygrywa częściej niż pierwszy? | liczba graczy, miejsce startowe zwycięzcy, w ilu partiach (cel ≥ 8 przy 3-4 os.) |
| 2 | Kampus Tour (B-KT3) | Ile kompletów domyka Bilet MPK? | każdy komplet: sposób (zakup, wykup, MPK) i runda |
| 3 | Kampus Tour (B-KT6, balans §9) | Czy partia mieści się w 45 min i czy bankructwa nadal padają wcześnie? | czas partii zegarem, liczba graczy, runda końca, sposób końca, runda pierwszego bankructwa |
| 4 | Kampus Tour (B-KT2) | Czy pada monopol? | grupy w monopolu (dwupolowe czy nie) |
| 5 | Gomoku (B-GO1) | Jak często wygrywa zaczynający? | kto zaczynał, kto wygrał (cel ≥ 10 partii) |
| 6 | Labirynt (B-LB1) | Czy przy 3-4 os. wygrywa ostatni w kolejności? | tryb, liczba graczy, miejsce zwycięzcy w kolejności |
| 7 | Memory (B-ME1) | Czy w Małej przy 3+ os. pierwszy gracz przegrywa częściej? | tryb, liczba graczy, miejsce zwycięzcy, remisy na górze |
| 8 | Państwa-miasta (B-PM1) | Czy przy 5-6 os. wszyscy przeglądają odpowiedzi przed końcem 45 s głosowania? | liczba graczy, ile osób zagłosowało przed limitem, czy złe odpowiedzi przeszły |
| 9 | Sekwencja (B-SQ1, B-SQ2) | Jak długie serie robią najlepsi i jak często serie się powtarzają na szczycie? | seria, czas partii (d = czas wpisania koloru), liczba równych wyników w pierwszej trójce |
| 10 | Trzy kubki (B-KB1) | Czy ktoś zalicza 20 rund? | wynik, odsetek partii z 20 |
| 11 | W pamięci (B-WP2, B-WP1) | Czy ktoś zalicza 12 rund? Czy pomyłki padają na mnożeniu? | wynik, działanie, na którym padła pomyłka (`detail`) |
| 12 | Zakupy (B-ZK2) | Jak często pada 10 z 10? | wynik, czas zaznaczania; przedmioty, przy których padają pomyłki |
| 13 | Wieża (B-WZ1) | Czy najlepsi kończą na 30 piętrach? | wysokość, szerokość ostatniego klocka |
| 14 | Środek (B-SR1) i Tort (B-TO1) | Ile trwa partia wolnego, starannego gracza? | czas od „Start” do wyniku (stoper), liczba poprawek punktu albo cięcia |
| 15 | Kąt (B-KAT1) | Czy błąd zależy od wielkości kąta? | z tabeli rund: kąt i błąd (najlepiej z kilku partii) |
| 16 | Literówka (B-LT1) | Czy któryś rodzaj błędu (ó/u, rz/ż, ch/h) jest wyraźnie wolniejszy albo częściej mylony? | rodzaj planszy, czas, pomyłka |
| 17 | Za zasłoną (B-ZS1) | Czy krótka widoczność kulki podnosi błąd? | z tabeli rund: widoczność, ukryty czas, odchyłka |
| 18 | Stój! (B-SJ1) | Czy błędy skupiają się w szybkiej końcówce? | wynik, liczba zielonych w ostatnich 10 s (ze stanu), błędy według czasu |
| 19 | Dziesiątki (B-DZ1) | Czy wynik rośnie z liczbą par na planszy? | wynik, średnia liczba par na planszy (ze stanu po partii) |
| 20 | Kalambury (B-KA1) | Czy przy 2 os. rysowanie ma znaczenie dla wyniku? | punkty za rysowanie i za zgadywanie u obu graczy |
| 21 | Mapa (03-07, bez wpisu) | Czy miasta przy granicy są łatwiejsze niż w środku kraju? | z tabeli rund: miasto i odległość |
| 22 | Który rok? (B-RK1) | Czy dział albo epoka zmienia błąd tej samej osoby? | wydarzenie, rok, błąd |

## 12. Propozycje zmian w dokumentach (do decyzji w fazie 4)

**`ZASADY-GIER.md`**
- §Kampus Tour: Wykupienie (Juwenalia zostają na polu, B-KT4), Budowa (budynki ponad poziom 2 zostają po utracie kompletu, B-KT5).
- §Liczenie :112: „po równo z czterech typów” zgodnie z kodem po zmianie (B-LC1) albo opis losowania osobnego.
- §Sekwencja: wzór długości partii T(N) i odstępstwo `timeoutMove` (ostatnia zaliczona seria), jeśli faza 4 przyjmie B-SQ1; rozstrzyganie remisu (B-SQ2).
- §Który rok?: zapas limitu tylko na sieć, bo czas rundy jest twardy (B-RK2), albo nowy limit.
- §Refleks (i Stój!): rekordy zależą od telefonu (R6).
- §Państwa-miasta: litera Ł jako słabsza runda albo jej brak (B-PM2); limit głosowania zależny od liczby graczy (B-PM1).
- §Trzy kubki :264: uzasadnienie braku `tie` do potwierdzenia partią (B-KB1); §W pamięci :437 rozstrzygnięcie kompletu (B-WP2).
- Nowe limity tury (Sekwencja, Zakupy, Środek, Tort, Śledzenie) i zmiany losowania z R2 / R7: w sekcji gry, razem z testem (`AGENTS.md`).

**`KONCEPT.md`**
- §9: odpowiedzi z §6 (balans zostaje do partii; monopol tylko przez grupy dwupolowe, rzadki; premia za miejsce za wysoka po zmianach 2026-10-07/08; MPK ok. 1/3 kompletów).
- §3: lista limitów po zmianach R1; jeden limit od startu dla mini-gier (R8).
- §2.6: domyślna liczba gier Turnieju, jeśli faza 4 przyjmie B-TU1.

**`ZASADY.md` §3**
- :106: model najdłuższej uczciwej partii (`03-02-BASELINE.md` §1.2) i wymóg zapasu ≥ 20% i ≥ 10 s jako jawna reguła.
- :100-102: w grze z decyzją „stop” (ryzyko) stała suma nie wystarcza, potrzebny stały komplet celów (R7); wzorzec Tortu jako trzeci obok `withSum` i kompletów rodzajów.
- Nowa reguła: gra z sufitem osiągalnym ma `tie`, które rozstrzyga komplet, albo nie ma sufitu (R3, R4).
- Wynik w grach na odtwarzanie czasu względny (‰ celu) albo cel stały, jeśli faza 4 przyjmie B-SP1, B-RY1.

## 13. Kontrola kryteriów sukcesu fazy 3

| kryterium (ROADMAP Phase 3) | gdzie spełnione | braki |
|---|---|---|
| 1. Mini-gry z losowymi celami, w których suma do zdobycia zmienia się między partiami (brak `withSum`, zmienna liczba bodźców, osobne losowanie zamiast kompletów) | §2 (30 mini-gier: mechanizm, rozrzut, wpis), R2, R7; liczby `03-01-CHECKS.md` §2 | brak: suma stała we wszystkich 30; różnice trudności opisane w R2 (15 gier), R7 (Balon). Wpływ na człowieka w 7 grach to założenie, do partii (§11 poz. 15-19, 21-22) |
| 2. Gry do pierwszej pomyłki i z limitem rund: maksimum osiągalne i ryzyko remisów na szczycie; każda mini-gra: potrzeba `record.tie` i kierunek `lower` | §3 (tabela gier z sufitem, lista gier ciągłych, akapit `tie`), R3, R4 | brak w dokumentacji; osiągalność 20 w Kubkach, 12 w W pamięci i 10 w Zakupach to założenie (A), do potwierdzenia partią albo bazą produkcyjną (§11 poz. 10-12). Lokalna baza ma tylko 9 wyników, więc częstości remisów nie zmierzono |
| 3. Krzywe trudności gier z progresją ze stałych przyrostu, ocena, gdzie za łatwa albo niemożliwa | §4 (Kubki, Śledzenie, Wieża, W pamięci, Inny element, Obrót, Sekwencja, Stój! z tabelami; lista gier bez progresji) | brak; progi ludzkie są założeniem (`03-02-BASELINE.md` §2) |
| 4. Limit tury każdej mini-gry wobec najdłuższej uczciwej partii z zapasem; gry po kolei sprawdzone na 60 s | §5 (30 mini-gier z T, L i zapasem; gry turowe i fazy), R1, R8 | brak; T w Środku i Torcie zależy od założenia o czasie celowania (§11 poz. 14) |
| 5. Ekonomia Kampus Tour (`KONCEPT.md` §9), przewaga pierwszego gracza w Gomoku i Labiryncie, tryby Szybkie: ocena i rekomendacja | §6 (tabela kolejności 8 gier i Turnieju, ekonomia, tryby Szybkie), R5, §8 (B-KT2..B-KT6, B-PM2, B-KA1, B-TU1) | brak; wyniki botów to sygnał (D-08), rekomendacje „sprawdzić w partii” w §11 poz. 1-8 |

Sprawdzenie repo: `git status --porcelain` pokazuje zmiany tylko w `.planning/` (ROADMAP, REQUIREMENTS, STATE i katalog fazy 3).

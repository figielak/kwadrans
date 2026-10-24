# 01-06: mini-gry na czas i reakcję (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `refleks`, `simon`, `stoper`, `stoj`, `rytm`, `przytrzymaj`, `zaslona`, `balon`.
Repo bez zmian (poza `.planning/`). Podpięcie (§6) i ekran końcowy z samego stanu tych gier są w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts` i testy `<id>.test.ts` każdej gry przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :17-43, §1 wspólny schemat :51-65, sekcje gier :67-84, :214-229, :298-319, :395-426, :499-522), `KONCEPT.md` §2.4 (:111-113, :127, :130, :135-136, :140, :145-148)
  i §3 (:233-234), oraz z `ZASADY.md` §2 (:43-83) i §3 (:85-107).
- Zasady, które działają tylko na ekranie (odliczanie, przerwy, „klient sam kończy po dwukrotności celu”, ignorowanie dotknięć < 100 ms),
  sprawdzone grepem w `apps/web/src/games/<Gra>.tsx`, tylko po to, żeby potwierdzić, że ekran wysyła wartości w granicach walidacji serwera
  i że najdłuższa uczciwa partia mieści się w limicie tury (§3 „Limity tury”). Wygląd ekranów to faza 2.
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze tych gier (bez błędów; najgorszy wynik: Refleks 1000, Sekwencja 0, Stoper = cel,
  Stój! 0 · Infinity, Rytm = `interval`, Przytrzymaj 15000, Za zasłoną 20000, Balon 0 · 10).
- Skrypt `fuzz06.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o **prawdziwe** wyniki, nie tylko najgorsze:
  każda z 8 gier × 400 partii (1-6 graczy), każdy gracz oddaje losowy dozwolony wynik (85%) albo `timeoutMove` (15%); w Balonie dodatkowo `progress` (688 razy).
  Sprawdzenia: świeża gra nieskończona; ruch przechodzi schemat i `validateMove`, odrzucony dla `obcy`; stan zamrożony rekursywnie przed `applyMove`
  i porównany JSON-em; round-trip JSON stanu i widoków wszystkich graczy i `""`; drugi wynik odrzucony; `progress` nie zmienia klucza `turn()`;
  **znak różnicy `places` zgodny ze znakiem porównania `record.score`, potem `record.tie` dla każdej pary graczy**.
  Wynik: **0 błędów**, poza 2 parami w Stój!, gdzie miejsca i rekord rozstrzygają remis różnie (wpis SJ1).

| gra | partie | zwycięzca | remis bez zwycięzcy (n > 1) | `places` ≠ rekord |
|---|---|---|---|---|
| refleks | 400 | 327 | 7 | 0 |
| simon | 400 | 310 | 24 | 0 |
| stoper | 400 | 332 | 2 | 0 |
| stoj | 400 | 327 | 7 | **2** |
| rytm | 400 | 320 | 14 | 0 |
| przytrzymaj | 400 | 328 | 6 | 0 |
| zaslona | 400 | 328 | 6 | 0 |
| balon | 400 | 323 | 11 | 0 |

- Najdłuższa uczciwa partia (ze stałych kodu i ekranu) wobec limitu tury:

| gra | najdłuższa uczciwa partia | limit | mieści się |
|---|---|---|---|
| refleks | 12 × (opóźnienie ≤ 3 s + reakcja ≤ 1 s) = 48 s (falstart: ≤ 3 s + 0,8 s) | 60 s | ✓ |
| simon | runda n: 0,6 s + n × 0,6 s pokazu + n wpisów + 0,4 s; przy 350 ms na kolor seria 23 to 285 s, seria 24 to 309 s; przy 200 ms na kolor limit pęka na serii 26 | 300 s | **✗ od serii ok. 24** (SQ1) |
| stoper | odliczanie 3 s + dwukrotność celu ≤ 28 s = 31 s (`Stoper.tsx:45`) | 60 s | ✓ |
| stoj | 41 bodźców, ostatni kończy się w 29 878 ms (`SCHEDULE`) | 60 s | ✓ |
| rytm | 1 s ciszy + 7 odstępów ≤ 857 ms + 10 s ≈ 17 s | 60 s | ✓ |
| przytrzymaj | 5 × (1 s + cel + do 2 × cel + 1,5 s), suma celów 15 s: 57,5 s | 120 s | ✓ |
| zaslona | 8 × (1 s + `visible` + 2 × `hidden` + 1,5 s) ≤ 76 s przy sumie `hidden` 20 s (test `zaslona.test.ts:42` daje górne 100 s) | 120 s | ✓ |
| balon | bez presji czasu: 155 stuknięć najwyżej + 10 × 0,8 s pauzy | 120 s | ✓ |

## Wpisy wspólne tej paczki (do scalenia w 01-10)

#### W6a. Losowe wyzwanie zmienia trudność partii w Stoperze i Rytmie `[zbiorcze: trudnosc-z-losowania]`
- Gry: `stoper` (`packages/games/src/stoper.ts:30`: cel 6-14 s, każdy z prawdopodobieństwem 1/9) i `rytm` (`packages/games/src/rytm.ts:50`: tempo 70-130 BPM, `interval` 462-857 ms).
- Źródło: `ZASADY.md` §3 „Losowanie nie zmienia sufitu wyniku” (:100): „Rekordy porównują różne partie, więc każda musi dawać tyle samo do zdobycia”.
  Litera reguły jest spełniona (sufit to odchyłka 0 w każdej partii), ale jej uzasadnienie w Przytrzymaj (`ZASADY-GIER.md` :399) i Za zasłoną (:505-506)
  mówi wprost, że „odchyłka rośnie z długością celu”, i tam cele mają stałą sumę. Stoper odlicza w głowie 6 albo 14 s, Rytm mierzy odchyłkę w ms przy odstępie 462 albo 857 ms,
  więc rekord zależy od wylosowanego celu albo tempa. Najgorszy wynik też się zmienia (01-01-CHECKS.md, „Najgorszy wynik zależny od wyzwania”).
- Historia: oba losowania powstały 2026-10-10 (`350706a` Stoper, `c681f9e` Rytm), reguła stałej sumy dwa dni później (`a590005`, 2026-10-12: „Mini-gry: zasady wyrównanego losowania”);
  przy jej wprowadzeniu Stopera i Rytmu nie zmieniono, a `ZASADY-GIER.md` nie podaje powodu.
- Waga: **średnia** (stała bez wpływu na uczciwość jednej partii, bo wszyscy grają to samo wyzwanie; dotyka tylko porównań rekordów między partiami).
- Propozycja: przekazać do fazy 3 (REC-01) jako pomiar. Kierunki: Stoper ze stałym celem albo kilkoma rundami o stałej sumie celów (`withSum`, jak Przytrzymaj);
  Rytm z odchyłką względną (% `interval`) albo stałym tempem. Jeśli zostaje, dopisać powód w `ZASADY-GIER.md` (D-11).

#### W6b. Rekord rozstrzyga remis zaokrągloną średnią, miejsca nie `[zbiorcze: tie-zaokraglenie]`
- Gry: `stoj` (`packages/games/src/stoj.ts:80`), a z innych paczek ten sam wzór: `stroop.ts:50`, `liczenie.ts:71`, `inny.ts:83`, `obrot.ts:84`, `literowka.ts:52`, `dziesiatki.ts:67`.
- `places` i `isOver` liczą z komparatora `byScoreThenAverage` / `byHitsThenAverage` (`core.ts:239-247`) na **niezaokrąglonej** średniej, a `record.tie` to `Math.round(average(times))`.
  Przykład: 3 trafienia po 300, 300, 301 ms (średnia 300,33) i 300, 300, 300 ms: w partii drugi gracz jest wyżej, w rekordach obaj mają „3 · 300 ms”
  i wyżej jest wcześniejszy wynik. `fuzz06.ts`: 2 takie pary na 400 partii Stój!.
- Źródło: `ZASADY.md` §3 „Remis nie ma zwycięzcy” (:91): `rankResults` i `places` „z jednego komparatora”; rekord jest drugim wejściem tej samej kolejności (`KONCEPT.md` :152-154).
- Waga: **niska** (różnica poniżej 1 ms, dotyczy tylko kolejności rekordów przy idealnym remisie punktów).
- Propozycja (popraw kod): zaokrąglić średnią także w komparatorze (`Math.round` w `byHitsThenAverage` i `byScoreThenAverage`) albo trzymać `tie` bez zaokrąglenia
  i zaokrąglać dopiero w `FORMAT` (`Records.tsx`). Pierwsza opcja zmienia tylko rozstrzygnięcia poniżej 0,5 ms.

## Refleks (`refleks`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Refleks (:67-74). Opis w `KONCEPT.md` §2: ✓ §2.4 (:111). Brak trybów (mini-gra).

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze | 1-6 (`refleks.ts:29-30`) | tabela :17 | ✓ |
| limit tury | `turnSeconds: 60` (:31) | tabela :17 | ✓ (też `KONCEPT.md` §3 :233 „60 s w większości”) |
| rundy | `ROUNDS = 12` (:5) | :68 | ✓ (też `KONCEPT.md` :111) |
| opóźnienia | `round(1000 + rng × 2000)`, 12 z serwera (:36) | 1-3 s (:68) | ✓ |
| czas reakcji | walidacja 100-1000 ms, int w schemacie (:32, :44) | :70, :73 | ✓ |
| kara | `PENALTY_MS = 1000` (:8); falstart i reakcja < 100 ms liczy ekran jako 1000 (`Refleks.tsx:19`, `:171-177`), po falstarcie 800 ms (`Refleks.tsx:177`) | :70-71 | ✓ (też `KONCEPT.md` :111) |
| wynik | zaokrąglona średnia (:48), mniej lepiej, `ranked` z `a - b` (:54) | :72 | ✓ |
| limit czasu | `times: []` → 1000 ms (:48, :58) | :73 | ✓ najgorszy możliwy |
| stan | `times` każdego gracza (:49) | :74 | ✓ |

#### RF1. Wspólny schemat nie wymienia Refleksu wśród gier z wynikiem liczonym na serwerze
- Gra: `refleks`. Miejsce: `ZASADY-GIER.md` §1 :57-58 („Wynik liczy serwer tam, gdzie się da (…), w reszcie ufa klientowi”); Refleksu na liście nie ma,
  a sekcja gry :72 i kod `refleks.ts:48` liczą średnią na serwerze z surowych czasów.
- Źródło: `ZASADY-GIER.md` §1 ↔ §1 Refleks (rozbieżność wewnątrz dokumentu). Waga: **niska** (kosmetyka dokumentu).
- Propozycja (popraw dokument): dopisać Refleks do listy w :57.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ pusta lista = 1000 ms | 01-01-CHECKS.md (najgorszy: 1000); test :98 |
| remis bez zwycięzcy, solo bez zwycięzcy | ✓ | `ranked` (:54); 01-01-CHECKS.md; `fuzz06.ts` (7 remisów); testy :91, :107 |
| start | ✓ wszyscy naraz | 01-01-CHECKS.md (p1 / wszyscy); test :35 |
| tylko `rng`, stan JSON, brak mutacji | ✓ | 01-01-CHECKS.md §2-3; `fuzz06.ts`; test :118 |
| `ranked` / `places`, rekord zgodny z miejscami | ✓ | `fuzz06.ts` (0 niezgodności); test :88 |
| jeden ruch `result`, pole odróżniające partie | ✓ `delays` (12 losowań) | test :43 |
| sufit wyniku | ✓ stała liczba bodźców (12), zgodnie z §3 :100-101 | `refleks.ts:4-5` |
| limit wobec najdłuższej partii | ✓ 48 s z 60 s | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2) | – |

Odstępstwa z powodem (D-11): `playerView` zwraca cały stan (`refleks.ts:24-25`, `ZASADY-GIER.md` §1 :53-54, „ponytail”), wspólne dla wszystkich mini-gier.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Refleks) | Test (`refleks.test.ts`) |
|---|---|
| 12 rund (:68) | :33 |
| opóźnienia 1-3 s z serwera, te same dla wszystkich (:68) | :36-38 (zakres); te same dla wszystkich: jedna lista w stanie, widok :36 |
| czas reakcji 100-1000 ms (:70) | :51-52, :58-60 |
| falstart i reakcja > 1 s = 1000 ms, 0,8 s przerwy (:70-71) | n/d (ekran, `Refleks.tsx:171-177`); serwer przyjmuje 1000 jak każdy czas, :60 |
| jeden ruch z 12 czasami int (:72) | :53-55 |
| zaokrąglona średnia, mniej lepiej, równe to remis (:72) | :77, :82, :91 |
| pusta lista albo dokładnie 12 (:73) | :54-55, :64 |
| pusta lista = 1000 ms (:73) | :98 |
| `times` w stanie (:74) | :68-75 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: `turnSeconds` | ✓ | :33 |
| Definicja: min/max, świeża gra nieskończona | LUKA | RF2 |
| Setup: stan, kto zaczyna, seedy | ✓ | :32-44 |
| Walidacja: spoza gry, drugi wynik | ✓ | :62, :63 |
| Walidacja: po końcu | LUKA | RF3 |
| Walidacja: brzegi | ✓ | :51-52, :58-60 (99/100, 1000/1001; 11/13 rund) |
| Schemat | LUKA (częściowo) | RF4 |
| Koniec: wygrana każdego gracza | LUKA | RF5 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :91, :82 (`places` :88); puste `waitingFor` przez index.test.ts:93 (01-01 §4.2 K4 T) |
| Limit: `timeoutMove` przechodzi `validateMove` | ✓ | :101 (`send`) |
| Stan: brak mutacji, JSON | ✓ | :118 |
| Mini-gra: zakres, niecałkowity, drugi wynik, remis, solo, rewanż | ✓ | :51-53, :63, :91, :107, :43 |
| Mini-gra: rekord | ✓ | :111; index.test.ts:168, :190 |

#### RF2. Liczba graczy i świeża gra bez testu
- Miejsce: `refleks.test.ts:32-39` sprawdza `turnSeconds`, nie `minPlayers`/`maxPlayers` (`refleks.ts:29-30`) ani `isOver(setup(...))`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**. Zachowanie poprawne (`fuzz06.ts`: świeża gra nieskończona).
- Propozycja: w teście :32 `expect([game.minPlayers, game.maxPlayers]).toEqual([1, 6])` i `expect(game.isOver(fresh())).toBeNull()`.

#### RF3. Ruch po końcu bez testu
- Miejsce: brak w `refleks.test.ts`; index.test.ts:110-112 sprawdza tylko ruchy z tej partii (01-01 §4.2, W4 C). Kod: `refleks.ts:43` (`!(player in state.results)`). `[zbiorcze: po-koncu]`
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: po teście :95 `expect(accepts(s, A, steady(200))).toBe(false)` dla obu graczy.

#### RF4. Schemat: brak pola i zły typ ruchu bez testu
- Miejsce: `refleks.test.ts:56` (lista tekstem) i :53 (niecałkowita) idą przez schemat; brak `{ type: "result" }` i innego `type`. Schemat `refleks.ts:32`. `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia** (schemat poprawny).
- Propozycja: dopisać do `test.each` :50 `["brak listy", { type: "result" }]` i `["zły typ ruchu", { type: "progress", times: [] }]`.

#### RF5. Wygrana tylko jednego gracza
- Miejsce: `refleks.test.ts:82-89` (wygrywa B); A i C nie wygrywają w żadnym teście. `[zbiorcze: wygrana-kazdego]`
- Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `stoj.test.ts:183`.

## Sekwencja (`simon`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Sekwencja (:76-78). Opis w `KONCEPT.md` §2: ✓ §2.4 (:112). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze | 1-6 (`simon.ts:23-24`) | tabela :18 | ✓ |
| limit tury | `turnSeconds: 300` (:25) | tabela :18 | ✓ (też `KONCEPT.md` §3 :233); za krótki wobec najdłuższej partii, SQ1 |
| sekwencja | `LENGTH = 100`, kolory 0-3 z `rng` (:5, :30) | :77 | ✓ |
| tempo pokazu | `LIT_MS = 450`, `GAP_MS = 150` (`Simon.tsx:21-22`) | :77 | ✓ |
| wynik | `score` = najdłuższa seria, więcej lepiej (:41); pierwsza pomyłka kończy (`Simon.tsx:76`) | :78 | ✓ (też `KONCEPT.md` :112) |
| walidacja | 0 do długości sekwencji, int w schemacie (:26, :35) | 0-100 (:78) | ✓ |
| limit czasu | `score: 0` (:45) | :78 | ✓ najgorszy możliwy |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 | 01-01-CHECKS.md; test :63 |
| remis i solo bez zwycięzcy | ✓ | `ranked` (:41); `fuzz06.ts` (24 remisy); test :55 |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts` |
| `ranked` / `places`, rekord zgodny | ✓ | `fuzz06.ts` (0 niezgodności) |
| pole odróżniające partie | ✓ `sequence` (100 losowań) | `simon.ts:30` |
| **limit tury ≥ najdłuższa uczciwa partia + zapas** | **✗** | SQ1 |
| wspólne funkcje `core.ts` | ✓ `ranked` | – |

Odstępstwa z powodem (D-11): wynik liczony na kliencie (`simon.ts:19`, `ZASADY-GIER.md` §1 :57-58); `playerView` zwraca cały stan (§1 :53-54).

#### SQ1. Limit 300 s kasuje wynik dobrego gracza
- Gra: `simon`. Miejsce: `packages/games/src/simon.ts:25` (`turnSeconds: 300`), `:45` (`timeoutMove` = 0); ekran oddaje wynik dopiero po pomyłce albo po całej sekwencji
  (`apps/web/src/games/Simon.tsx:67-79`), bez `progress`.
- Runda n trwa 0,6 s + n × 0,6 s pokazu (`Simon.tsx:61-64`) + n wpisów + 0,4 s (`:79`). Łącznie przy 350 ms na kolor: seria 20 to 220 s, 23 to 285 s, 24 to 309 s;
  przy szybkim wpisywaniu (200 ms) limit pęka na serii 26 (`fuzz06.ts`). Po limicie serwer wpisuje `timeoutMove` (0), a późniejszy wynik klienta
  odpada jako drugi (`simon.ts:35`). Gracz, który dojdzie do serii ok. 24, dostaje 0 zamiast najlepszego wyniku w historii, także w rekordach i turnieju.
- Źródło: `ZASADY.md` §3 „Limity tury” (:106: „w mini-grze tyle, ile trwa najdłuższa uczciwa partia plus zapas”). Najdłuższa uczciwa partia (seria 100) to ponad 80 minut.
- Waga: **wysoka** (nieuczciwy wynik i rekord; dotyczy tylko najlepszych partii, więc rzadko, ale właśnie tych, które bije się w rekordach).
- Propozycja (popraw kod, decyzja w fazie 4, pomiar w fazie 3 kryterium 4): ruch `progress` z bieżącą serią po każdej zaliczonej rundzie
  (jak w Balonie i Wieży) i `timeoutMove` oddający ostatnią zgłoszoną serię; to odstępstwo od „najgorszy możliwy wynik”, więc wymaga wpisu w `ZASADY-GIER.md` z powodem.
  Prostsza wersja: ekran sam oddaje `length − 1`, gdy do limitu zostaje kilka sekund. Samo podniesienie `turnSeconds` nie wystarczy (seria 100).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Sekwencja) | Test (`simon.test.ts`) |
|---|---|
| sekwencja 100 kolorów 0-3, ta sama dla wszystkich (:77) | :21-28 (kolory i wspólność; długość tylko `≥ 50`, SQ3) |
| pokaz 450 ms, przerwa 150 ms (:77) | n/d (ekran) |
| wynik = najdłuższa seria, więcej lepiej (:78) | :45-53 |
| walidacja 0-100 (:78) | :33-37 (−1, długość, długość + 1; 0 bez testu, SQ5) |
| limit czasu: 0 (:78) | :63 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA | SQ2 |
| Setup: stan, kto zaczyna | ✓ | :21-23 |
| Setup: seedy, rewanż daje inne wyzwanie | LUKA | SQ3 |
| Walidacja: spoza gry, drugi wynik | ✓ | :38, :39 |
| Walidacja: po końcu | LUKA | SQ4 |
| Walidacja: brzegi | LUKA (częściowo) | SQ5 |
| Schemat, wynik niecałkowity | LUKA | SQ6 |
| Koniec: wygrana każdego gracza | LUKA | SQ7 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :55, :45; puste `waitingFor` przez index.test.ts:93 |
| Limit: `timeoutMove` przechodzi `validateMove` | ✓ | :63 (kształt); walidacja index.test.ts:72-73 (01-01 §4.2 Lim T) |
| Stan: brak mutacji, JSON | LUKA | SQ8 |
| Mini-gra: zakres, drugi wynik, remis, solo | ✓ | :33, :39, :55, :60 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### SQ2. Definicja bez testu
- Miejsce: brak w `simon.test.ts` (`minPlayers`, `maxPlayers`, `turnSeconds` z `simon.ts:23-25`, `isOver(setup(...))`). `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**.
- Propozycja: test „1-6 graczy, limit 300 s, świeża gra trwa” jak `stoj.test.ts:42`.

#### SQ3. Seedy, długość sekwencji i rewanż bez testu
- Miejsce: `simon.test.ts:25` (`length ≥ 50`, kod :5 ma 100); brak „ten sam seed, ta sama sekwencja” i „inny seed, inna sekwencja”. `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55) i Mini-gra „rewanż daje inne wyzwanie” (:74-75); `ZASADY-GIER.md` :77 (100 kolorów). Waga: **średnia**.
- Propozycja: `expect(sequence).toHaveLength(100)`, `toEqual` dla seeda 7 i `not.toEqual` dla 7 i 8.

#### SQ4. Ruch po końcu bez testu
- Miejsce: brak w `simon.test.ts` (test :45 kończy partię, ale nie próbuje ruchu). `[zbiorcze: po-koncu]`
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: na końcu testu :45 `expect(game.validateMove(s, A, result(1))).toBe(false)`.

#### SQ5. Brzeg 0 bez testu
- Miejsce: `simon.test.ts:33-37` sprawdza −1, długość i długość + 1; pierwsza dozwolona wartość (0) przechodzi tylko pośrednio w `timeoutMove` (:63, bez `validateMove`). `[zbiorcze: brzegi]`
- Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**.
- Propozycja: `expect(game.validateMove(s, A, result(0))).toBe(true)`.

#### SQ6. Schemat i wynik niecałkowity bez testu
- Miejsce: `simon.test.ts` w ogóle nie woła `moveSchema` (`send` :16 idzie tylko przez `validateMove`); `score: 1.5` odrzuca jedynie schemat (`simon.ts:26`). `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62) i Mini-gra „wynik niecałkowity odpada” (:74). Waga: **średnia** (schemat poprawny).
- Propozycja: `accepts` przez `safeParse` jak w `refleks.test.ts:21` i przypadki: `score: 1.5`, `score: "5"`, brak `score`, inny `type`.

#### SQ7. Wygrana tylko jednego gracza
- Miejsce: `simon.test.ts:45-53` (wygrywa B). `[zbiorcze: wygrana-kazdego]`
- Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])`.

#### SQ8. Mutacja i JSON bez testu
- Miejsce: brak w `simon.test.ts`; index.test.ts też nie (01-01 §4.2 St1 N, St2 N). Zachowanie poprawne (01-01-CHECKS.md, `fuzz06.ts`). `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: test jak `refleks.test.ts:118`.

## Stoper (`stoper`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Stoper (:80-84). Opis w `KONCEPT.md` §2: ✓ §2.4 (:113). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze | 1-6 (`stoper.ts:25-26`) | tabela :19 | ✓ |
| limit tury | `turnSeconds: 60` (:27) | tabela :19 | ✓ (też `KONCEPT.md` §3 :233) |
| cel | `6000 + floor(rng × 9) × 1000` (:30): 6-14 s pełne sekundy | :82 | ✓ (też `KONCEPT.md` :113); trudność zależna od celu, W6a |
| licznik widoczny | `VISIBLE_MS = 3000` (:5) | :81 | ✓ (też `KONCEPT.md` :113) |
| odliczanie, koniec po 2 × cel | ekran (`Stoper.tsx:45`, `:118`) | :81 | ✓ |
| wynik | `deviation` int 0..cel (:33), mniej lepiej (:39); ekran ucina do celu (`Stoper.tsx:53`) | :84 | ✓ |
| limit czasu | odchyłka = cel (:43) | :84 | ✓ najgorszy możliwy |
| `nonce` | z `rng` (:30) | §1 :64 | ✓ |

Rozbieżności kod ↔ dokumenty: brak (poza W6a).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ odchyłka = cel | 01-01-CHECKS.md; test :64 |
| remis i solo bez zwycięzcy | ✓ | `ranked` (:39); `fuzz06.ts`; test :57 |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts` |
| `ranked` / `places`, rekord zgodny | ✓ | `fuzz06.ts` (0 niezgodności) |
| pole odróżniające partie | ✓ `nonce` | test :35 |
| sufit wyniku | ✓ litera (sufit 0), duch nie | W6a |
| limit wobec najdłuższej partii | ✓ 31 s z 60 s | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` | – |

Odstępstwa z powodem (D-11): pomiar na kliencie (`stoper.ts:21`, §1 :57-58); `playerView` cały stan.
Schemat bez `.int()` (`stoper.ts:28`) przy `Number.isInteger` w `validateMove` (:33): nie jest dziurą (serwer woła oba, 01-04 „Metoda”), bez wpisu.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Stoper) | Test (`stoper.test.ts`) |
|---|---|
| odliczanie, licznik znika po 3 s, klient kończy po 2 × cel (:81) | n/d (ekran) |
| cel pełne sekundy 6-14 s, ten sam dla wszystkich (:82) | :22-30 |
| limit tury ukryty, odkrycie czasu po dotknięciu (:83) | n/d (ekran) |
| `deviation` int 0..cel, mniej lepiej (:84) | :40, :43-44, :48 |
| limit czasu: odchyłka = cel (:84) | :64 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds` | LUKA | SP1 |
| Definicja: świeża gra nieskończona | ✓ | :50 |
| Setup: stan, kto zaczyna, inny seed inne wyzwanie | ✓ | :22, :34, :35 |
| Setup: ten sam seed to samo | LUKA | SP2 |
| Walidacja: spoza gry, drugi wynik | ✓ | :41, :42 |
| Walidacja: po końcu | LUKA | SP3 |
| Walidacja: brzegi | ✓ | :40, :43-44 (−1/0, cel/cel + 1) |
| Schemat | LUKA | SP4 |
| Koniec: wygrana każdego gracza | LUKA | SP5 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :57, :48; puste `waitingFor` przez index.test.ts:93 |
| Limit | ✓ | :64 (kształt); walidacja index.test.ts:72-73 |
| Stan: brak mutacji, JSON | LUKA | SP6 |
| Mini-gra: zakres, niecałkowity, drugi wynik, remis, rewanż | ✓ | :40, :42, :57, :35 |
| Mini-gra: solo bez zwycięzcy | ✓ (przez index.test.ts:107, n = 1) | 01-01 §4.2 |

#### SP1. `minPlayers`, `maxPlayers` i `turnSeconds` bez testu
- Miejsce: brak w `stoper.test.ts`; kod `stoper.ts:25-27`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**.
- Propozycja: `expect([game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual([1, 6, 60])`.

#### SP2. Ten sam seed bez testu
- Miejsce: `stoper.test.ts:35` sprawdza tylko różne `nonce`. `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**.
- Propozycja: `expect(game.setup([A, B], createRng(1))).toEqual(game.setup([A, B], createRng(1)))`.

#### SP3. Ruch po końcu bez testu
- Miejsce: brak w `stoper.test.ts` (test :48 kończy partię bez próby ruchu). `[zbiorcze: po-koncu]`
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: na końcu :48 `expect(game.validateMove(s, A, result(1))).toBe(false)`.

#### SP4. Schemat bez testu
- Miejsce: `stoper.test.ts` nie woła `moveSchema`; 1.5 (:40) odrzuca `validateMove`, nie schemat. `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia**.
- Propozycja: `safeParse` dla `deviation: "10"`, brak pola, inny `type`.

#### SP5. Wygrana tylko jednego gracza
- Miejsce: `stoper.test.ts:48-55` (wygrywa B). `[zbiorcze: wygrana-kazdego]`
- Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])`.

#### SP6. Mutacja i JSON bez testu
- Miejsce: brak w `stoper.test.ts` i index.test.ts. Zachowanie poprawne (01-01-CHECKS.md, `fuzz06.ts`). `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: test jak `refleks.test.ts:118`.

## Stój! (`stoj`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Stój! (:214-229). Opis w `KONCEPT.md` §2: ✓ §2.4 (:127). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 60 s (`stoj.ts:43-45`) | tabela :28 | ✓ (też `KONCEPT.md` §3 :233) |
| czas partii | `DURATION_MS = 30_000` (:4) | :215 | ✓ (też `KONCEPT.md` :127) |
| odstęp | liniowo 1000 → 500 ms (:6-7, :16); 41 bodźców, ostatni ma 511 ms i kończy się w 29 878 ms | :216-217 | ✓ (też `KONCEPT.md` :127) |
| widoczność | `VISIBLE = 0.6` (:9) | :216 | ✓ |
| czerwone | dokładnie `round(N / 3)` = 14, tasowane `shuffle` (:54-56) | :218 | ✓ (też `KONCEPT.md` :127) |
| zgadywanie | walidacja ≥ 100 ms (:10, :65); ekran ignoruje szybsze (`Stoj.tsx:20-21`) | :219-220 | ✓ |
| wynik | trafienia − 2 × błędy, ≥ 0 (:11, :36) | :223 | ✓ (też `KONCEPT.md` :127) |
| remis | `byScoreThenAverage`: średnia reakcji, dwa wyniki bez trafień to remis, 0 z trafieniami wyżej (`core.ts:244-247`, :80) | :223-224 | ✓ (rekord zaokrągla, W6b) |
| walidacja | ≤ N czasów, każdy 100..odstęp bodźca (:64-65) | :227 | ✓ |
| limit czasu | `taps: []` → 0 pkt, bez trafień (:84) | :227 | ✓ najgorszy możliwy |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · Infinity | 01-01-CHECKS.md; testy :196, :215 |
| remis i solo bez zwycięzcy | ✓ | testy :189, :196, :210; `fuzz06.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts`; test :224 |
| `ranked` / `places`, rekord zgodny | ✗ w 2 / 400 partiach (zaokrąglenie `tie`) | W6b |
| pole odróżniające partie | ✓ `reds` | test :84 |
| sufit wyniku | ✓ stały harmonogram, stała liczba czerwonych | `stoj.ts:13-20`, :54 |
| kara w grze na czas | odstępstwo z powodem (poniżej) | – |
| wspólne funkcje `core.ts` | ✓ `average`, `byScoreThenAverage`, `ranked`, `shuffle` (:2) | – |

Odstępstwa z powodem (D-11): kara punktowa (−2) zamiast blokady 1 s, wbrew `ZASADY.md` §3 :103; powód w `ZASADY-GIER.md` :225-226 („blokada zjadałaby kolejne bodźce”).
Pomiar na kliencie (`stoj.ts:38-39`); `playerView` cały stan.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Stój!) | Test (`stoj.test.ts`) |
|---|---|
| 30 s, pole zielone albo czerwone (:215) | :61-65 |
| odstęp maleje 1000 → 500, harmonogram stały (:216-217) | :49-59 |
| bodziec widać 0,6 odstępu (:216) | LUKA (SJ2) |
| dokładnie co trzeci czerwony, potasowane (:218) | :76-82, :84-87 |
| jedno dotknięcie na bodziec, zielony = trafienie, czerwony = błąd (:219) | :133-144 |
| < 100 ms to zgadywanie (:219-220) | :101-104 |
| przepuszczony zielony nic nie kosztuje (:220) | :151 |
| ruch `taps` z `null`, serwer liczy `times` i `errors` (:221-222) | :133, :159 |
| wynik = trafienia − 2 × błędy, ≥ 0 (:223) | :139, :146 |
| remis: średnia; bez trafień remis; 0 z trafieniami wyżej (:223-224) | :174, :189, :196, :203 |
| klepanie na oślep ≈ 0 (:225-226) | :155 |
| walidacja ≤ N, 100..odstęp; pusta = 0 (:227) | :101-116, :215 |
| ekran (:228-229) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `stoj.test.ts` (definicja :42; setup :69-87; walidacja :94-116 ze wszystkimi brzegami;
schemat :118-126; koniec :174-213 z wygraną każdego :183; limit :215; stan :224; mini-gra: zakres, niecałkowity, drugi, remis, solo, rewanż, liczenie na danych niepełnych :159).

#### SJ1. Rekord a miejsca przy remisie punktów: patrz W6b
- Gra: `stoj`, `packages/games/src/stoj.ts:80`. Waga: **niska**. `[zbiorcze: tie-zaokraglenie]`

#### SJ2. Widoczność bodźca (0,6 odstępu) bez testu
- Miejsce: `stoj.ts:9` (`VISIBLE`), używana tylko przez ekran (`Stoj.tsx:55`); `stoj.test.ts` jej nie importuje.
- Źródło: `ZASADY-GIER.md` :216, `ZASADY.md` §2 „każda zasada z sekcji gry” (:63). Waga: **niska** (stała ekranu, nie wpływa na walidację ani wynik).
- Propozycja: `expect(VISIBLE).toBe(0.6)` w teście harmonogramu :54.

## Rytm (`rytm`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Rytm (:298-319). Opis w `KONCEPT.md` §2: ✓ §2.4 (:130), tryb cichy §1 (:26). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 60 s (`rytm.ts:43-45`) | tabela :31 | ✓ (też `KONCEPT.md` §3 :233) |
| metronom | `BEATS = 8` (:5); 1 s ciszy (`Rytm.tsx:16`) | :299 | ✓ (też `KONCEPT.md` :130) |
| stukanie | `TAP_MS = 10_000` od ostatniego uderzenia (:7) | :300 | ✓ |
| tempo | 70-130 BPM co 5, `interval = round(60000 / BPM)` 462-857 (:8-10, :50) | :301-302 | ✓ (też `KONCEPT.md` :130); trudność zależna od tempa, W6a |
| `nonce` | z `rng` (:51) | :302 | ✓ |
| odchyłka | błąd odstępu ucięty do `interval`, `expected = floor(10000 / interval) − 1`, brakujące jak `interval`, dzielnik = max(oczekiwana, faktyczna), zaokrąglenie (:29, :32-36) | :304-307 | ✓ |
| walidacja | ≤ 60, int, 1-10 000, ściśle rosnące (:11, :46, :58-59) | :313 | ✓ |
| limit czasu | `taps: []` → `interval` (:69) | :313 | ✓ najgorszy możliwy (każdy składnik ≤ `interval`) |
| ukryty limit, dźwięk | ekran (`Rytm.tsx`) | :314-317 | n/d (faza 2) |

Rozbieżności kod ↔ dokumenty: brak (poza W6a).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ = `interval` | 01-01-CHECKS.md; test :201 |
| remis i solo bez zwycięzcy | ✓ | testy :189, :196; `fuzz06.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts`; test :212 |
| `ranked` / `places`, rekord zgodny | ✓ | `fuzz06.ts` |
| pole odróżniające partie | ✓ `nonce` | test :60 |
| sufit wyniku | ✓ litera (0), duch nie | W6a |
| wspólne funkcje `core.ts` | ✓ `ranked` | – |

Odstępstwa z powodem (D-11): jedyna gra z dźwiękiem (`KONCEPT.md` :26, `ZASADY-GIER.md` :315); pomiar na kliencie (`rytm.ts:38-39`); `playerView` cały stan.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Rytm) | Test (`rytm.test.ts`) |
|---|---|
| 8 uderzeń, 10 s stukania (:299-300) | :43 |
| tempo 70-130 co 5, `interval`, to samo dla wszystkich, `nonce` (:301-302) | :47-63 |
| ruch `taps` od ostatniego uderzenia (:303) | :135-140 |
| odstępy, pierwszy od ostatniego uderzenia (:304) | :84 |
| błąd ucięty do `interval` (:305) | :96 |
| `expected` z zapasem, brakujące jak najgorsze (:305-307) | :71, :90, :100 |
| dzielnik = większa z liczb (:307) | :106 |
| odchyłka z odstępów, nie z siatki (:309-310) | :84 (przesunięcie całej serii kosztuje tylko pierwszy odstęp), :79 |
| skutki: pominięte, klepanie, dwa stuknięcia (:311-312) | :90, :118, :100 (2 stuknięcia przy :103) |
| wynik int 0..`interval`, mniej lepiej, równe remis (:312) | :174, :189 |
| walidacja ≤ 60, 1-10 000, rosnące; pusta = `interval` (:313) | :135-152, :113, :201 |
| ekran, dźwięk (:314-319) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `rytm.test.ts` (definicja :38; setup :47-63; walidacja :128-152 z brzegami 0/1 i 10 000/10 001, 60/61;
schemat :154-162; koniec :166-208 z wygraną każdego :183; limit :201; stan :212; mini-gra: zakres, niecałkowity, drugi :129, remis :189, solo :196, rewanż :60,
funkcja licząca na danych niepełnych :100, :113).

Brak wpisów poza W6a.

## Przytrzymaj (`przytrzymaj`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Przytrzymaj (:395-408). Opis w `KONCEPT.md` §2: ✓ §2.4 (:135). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s (`przytrzymaj.ts:33-35`) | tabela :37 | ✓ (też `KONCEPT.md` §3 :234) |
| rundy | `ROUNDS = 5` (:4) | :396 | ✓ (też `KONCEPT.md` :135) |
| przerwa, odsłona | 1 s, 1,5 s (`Przytrzymaj.tsx:17-19`) | :396-397 | ✓ |
| cele | `withSum(rng, 5, 1000, 5000, 15000)` (:6-9, :40) | :398-399 | ✓ (też `KONCEPT.md` :135) |
| odchyłka | `min(cel, abs(trzymanie − cel))` (:26) | :402-403 | ✓ |
| walidacja | pusta albo 5 int 0-10 000 (:48-49) | :404 | ✓ |
| limit czasu | pusta → suma celów (:54, :64) | :404-405 | ✓ najgorszy możliwy |
| koniec po 2 × cel | ekran (`Przytrzymaj.tsx:93`, `:100`) | :406 | ✓ |
| `holds` w stanie | (:55) | :408 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ suma celów | 01-01-CHECKS.md (15000); test :153 |
| remis i solo bez zwycięzcy | ✓ | testy :136, :143; `fuzz06.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts`; test :163 |
| `ranked` / `places`, rekord zgodny | ✓ | `fuzz06.ts` |
| pole odróżniające partie | ✓ `targets` (bez `nonce`, powód w :400-401) | test :65 |
| sufit wyniku | ✓ `withSum` | test :56 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `withSum` (:2) | – |

Odstępstwa z powodem (D-11): brak `nonce` (`ZASADY-GIER.md` :400-401); pomiar na kliencie i cele w widoku (`przytrzymaj.ts:28-29`).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Przytrzymaj) | Test (`przytrzymaj.test.ts`) |
|---|---|
| 5 rund, przerwa, odsłona (:396-397) | :44 (rundy); przerwa i odsłona n/d (ekran) |
| cele 1000-5000 pełne ms, te same dla wszystkich (:398) | :41-54, :61-66 |
| suma 15 000 przez `withSum` (:399) | :56-59 |
| bez `nonce`, rewanż po celach (:400-401) | :65 |
| ruch `holds` (:402) | :90-94 |
| odchyłka ucięta do celu, suma, mniej lepiej, remis (:402-403) | :69-88, :128, :136 |
| walidacja pusta albo 5 × 0-10 000 (:404) | :103-105, :153 |
| pusta = suma celów (:404-405) | :153-159 |
| ekran kończy po 2 × cel, bez licznika (:406-407) | n/d (ekran) |
| `holds` w stanie, tabela (:408) | :90 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja :34; setup :41-66; walidacja :100-105 z brzegami −1/0, 10 000/10 001, 4/6 elementów;
schemat :108-116; koniec :119-159 z wygraną każdego :119; limit :153; stan :163; mini-gra: zakres, niecałkowity :104, drugi :101, remis :136, solo :143, rewanż :65,
funkcja licząca :69-80).

Brak wpisów.

## Za zasłoną (`zaslona`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Za zasłoną (:499-522). Opis w `KONCEPT.md` §2: ✓ §2.4 (:140). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s (`zaslona.ts:39-41`) | tabela :43 | ✓ (też `KONCEPT.md` §3 :234) |
| rundy | `ROUNDS = 8` (:4) | :500 | ✓ (też `KONCEPT.md` :140) |
| `visible` | 800-2000 pełne ms, niezależnie (:6-7, :32, :46) | :503 | ✓ (też `KONCEPT.md` :140, „0,8-2 s”) |
| `hidden` | `withSum(rng, 8, 1000, 4000, 20000)` (:9-12, :45) | :503-505 | ✓ (też `KONCEPT.md` :140) |
| odchyłka | `min(hidden, abs(tap − hidden))` (:30) | :511-512 | ✓ |
| walidacja | pusta albo 8 int 0-8000 (:52-53) | :515 | ✓ |
| limit czasu | pusta → suma `hidden` (:58, :68) | :515-516 | ✓ najgorszy możliwy |
| dotknięcie przed zniknięciem ignorowane | ekran (`Zaslona.tsx:99`) | :517 | ✓ (też `KONCEPT.md` :140) |
| koniec po 2 × `hidden` | ekran (`Zaslona.tsx:83-86`, `:101`) | :518 | ✓ |
| bez `progress` | schemat tylko `result` (:42) | :520 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ suma `hidden` | 01-01-CHECKS.md (20000); test :202 |
| remis i solo bez zwycięzcy | ✓ | testy :182, :190; `fuzz06.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz06.ts`; test :213 |
| `ranked` / `places`, rekord zgodny | ✓ | testy :179, :187; `fuzz06.ts` |
| pole odróżniające partie | ✓ `rounds` (bez `nonce`, powód :508) | test :91 |
| sufit wyniku | ✓ `withSum` | test :65 |
| limit wobec najdłuższej partii | ✓ | test :42 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `withSum`; własne `between` (:32) to jedna linia losowania int, w `core.ts` nie ma odpowiednika | – |

Odstępstwa z powodem (D-11): brak `nonce` (:508); pomiar na kliencie i rundy w widoku (`zaslona.ts:34-35`).

### Testy (RULE-03)

Plik `zaslona.test.ts` (numery od 1 w tym pliku): definicja :36-46, setup :48-103, odchyłka :105-116, wynik :118-137, walidacja :139-149, schemat :151-161, koniec :163-210, stan :212-220.

| Zasada (ZASADY-GIER §1 Za zasłoną) | Test |
|---|---|
| 8 rund, kulka znika, odsłona (:500-502) | :52 (rundy); ruch kulki i odsłona n/d (ekran) |
| `visible` 800-2000, `hidden` 1000-4000, pełne ms, te same dla wszystkich (:502-504) | :51-63, :91-97 |
| suma `hidden` 20 000 (:504-506) | :65-68 |
| prędkość i szerokość zasłony zmieniają się (:507) | :78-89 |
| bez `nonce` (:508) | :96 |
| ruch `taps` (:509) | :132-136 |
| odchyłka ucięta do `hidden`, suma, mniej lepiej, remis; `visible` nie wchodzi (:510-513) | :105-116, :119-130 |
| walidacja, pusta = suma `hidden` (:514-516) | :145-148, :202-209 |
| dotknięcie przed zniknięciem, 2 × `hidden`, ukryty limit (:517-519) | n/d (ekran) |
| bez `progress` (:520) | :158 (`type: "progress"` odrzucony) |
| `taps` w stanie, tabela (:523-524) | :132 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja :37 i limit wobec partii :42; setup :48-103; walidacja :142-148 z brzegami;
schemat :151-161; koniec :164-209 z wygraną każdego :164, `places` :179, :187; limit :202; stan :213; mini-gra: komplet, funkcja licząca :105-116).

Brak wpisów.

## Balon (`balon`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Balon (:410-426). Opis w `KONCEPT.md` §2: ✓ §2.4 (:136), `progress` w §2.4 :147 i `ZASADY-GIER.md` §1 :56.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s (`balon.ts:41-43`, :28) | tabela :38 | ✓ (też `KONCEPT.md` §3 :234) |
| balony | `BALLOONS = 10` (:4) | :411 | ✓ (też `KONCEPT.md` :136) |
| wytrzymałość | 1-30 (:6-7), `withSum` do 155 (:9, :53) | :412-414 | ✓ (też `KONCEPT.md` :136) |
| liczenie | `pumps[i] <= limits[i]` daje `pumps[i]`, inaczej 0 i pęknięty; brak = pęknięty (:31-34) | :417-418 | ✓ |
| ranking | więcej punktów, potem mniej pękniętych (:73) | :419 | ✓ (też `KONCEPT.md` :136, :153) |
| walidacja | pusta albo 10 int 0-31 (:47, :64) | :420 | ✓ |
| limit czasu | pusta → 0 pkt, 10 pękniętych (:77) | :420 | ✓ najgorszy możliwy |
| `progress` | `done` int 1-9 (:48, :63), stały klucz `turn` (:44-45) | :421-422 | ✓ |
| pauza po balonie | 800 ms (`Balon.tsx:16`) | :425 | ✓ |

#### BL1. Uzasadnienie ukrycia punktów rywali nie pasuje do widoku
- Gra: `balon`. Miejsce: `ZASADY-GIER.md` :423 („Punktów rywali w trakcie nie widać: zdradzałyby, ile balon wytrzymuje”), a `limits` są w widoku każdego gracza od startu
  (`balon.ts:36-37`, `:71`; test `balon.test.ts:81`).
- Źródło: `ZASADY-GIER.md` §1 Balon ↔ §1 wspólny schemat (:53-54). Waga: **niska** (dokument; ukrycie ma sens dla ekranu, bo uczciwy gracz nie zagląda w stan).
- Propozycja (popraw dokument): „…zdradzałyby na ekranie, ile balon wytrzymuje (sam stan i tak zawiera `limits`, patrz `ponytail` w kodzie)”.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · 10 | 01-01-CHECKS.md; test :202 |
| remis i solo bez zwycięzcy | ✓ | testy :182, :190; `fuzz06.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ także z `progress` | 01-01-CHECKS.md; `fuzz06.ts` (688 `progress`); test :211 |
| `ranked` / `places`, rekord i `tie` zgodne | ✓ | testy :179, :187; `fuzz06.ts` |
| klucz `turn()` stały przy `progress` | ✓ | test :253; `fuzz06.ts` |
| pole odróżniające partie | ✓ `limits` | test :76 |
| sufit wyniku | ✓ `withSum` (155) | test :65 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `withSum` | – |

Odstępstwa z powodem (D-11): `limits` w widoku od startu (`balon.ts:36-37`, „ponytail”, wymienione w 01-01-CHECKS.md jako jawne odstępstwo).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Balon) | Test (`balon.test.ts`) |
|---|---|
| 10 balonów, stuknięcie = punkt (:411) | :47, :90 |
| wytrzymałość 1-30 int, ta sama dla wszystkich, pierwsze stuknięcie bezpieczne (:412-413) | :46-63, :81 |
| suma 155 przez `withSum` (:413-414) | :65-68 |
| zgarnięcie, pęknięcie 0, zgarnięte zostają, pusty balon (:415-416) | :95, :99 |
| `pumps` int 0-31, 31 zawsze pęka, liczenie serwera (:417-418) | :90-109, :129-134 |
| ranking: punkty, potem pęknięte; równe to remis (:419) | :152, :171, :182 |
| walidacja, pusta = 0 i 10 pękniętych (:420) | :107, :124-135, :202 |
| `progress` 1-9, nie odnawia limitu, może spaść, punktów rywali nie widać (:421-423) | :220-256 (punkty rywali: ekran, n/d) |
| ekran i tabela (:424-426) | n/d (faza 2); `pumps` w stanie :168 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja :39; setup :46-84 z seedami :76; walidacja :117-135 z brzegami 0/−1, 31/32, 9/11 balonów,
`progress` 1/0, 9/10; schemat :137-148; koniec :152-209 z wygraną każdego :153; limit :202; stan :211; mini-gra: komplet, funkcja licząca :87-110).

Brak wpisów poza BL1.

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| SQ1 | simon | **wysoka** | – |
| W6a | stoper, rytm | średnia | `trudnosc-z-losowania` |
| RF2, SQ2, SP1 | refleks, simon, stoper | średnia | `definicja-swieza-gra` |
| SQ3, SP2 | simon, stoper | średnia | `setup-ten-sam-seed` |
| RF3, SQ4, SP3 | refleks, simon, stoper | średnia | `po-koncu` |
| SQ5 | simon | średnia | `brzegi` |
| RF4, SQ6, SP4 | refleks, simon, stoper | średnia | `schemat-smieci` |
| RF5, SQ7, SP5 | refleks, simon, stoper | średnia | `wygrana-kazdego` |
| SQ8, SP6 | simon, stoper | średnia | `stan-mutacja-json` |
| W6b, SJ1 | stoj (i 6 gier z innych paczek) | niska | `tie-zaokraglenie` |
| RF1 | refleks | niska | – |
| SJ2 | stoj | niska | – |
| BL1 | balon | niska | – |

Gry bez żadnej luki w testach obowiązkowych: Stój! (poza SJ2), Rytm, Przytrzymaj, Za zasłoną, Balon. Najstarsze pliki testów (Refleks, Sekwencja, Stoper,
z 2026-10-07/08, sprzed wzorca z nagłówkiem i `accepts`) mają wszystkie luki tej paczki.

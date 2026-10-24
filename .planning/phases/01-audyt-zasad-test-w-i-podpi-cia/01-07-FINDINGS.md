# 01-07: mini-gry na trafienia (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `schulte`, `sudoku`, `zakupy`.
Repo bez zmian (poza `.planning/`). Podpięcie (§6) i ekran końcowy z samego stanu tych gier są w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts`, wspólne `quiz.ts` i testy `<id>.test.ts` każdej gry przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :20-45, §1 wspólny schemat :51-65, sekcje gier :86-115, :321-373, :444-457, :479-497, :547-566), `KONCEPT.md` §2.4 (:114-118, :123, :131-133, :138, :141, :147-153)
  i §3 (:233-234), oraz z `ZASADY.md` §2 (:54-75) i §3 (:89-106).
- `quiz.ts` (Kolor liter, Liczenie, Inny element, Obrót, Literówka, walidacja Dziesiątek) sprawdzony raz, w sekcji Koloru liter (D-12, D-15); pozostałe sekcje odsyłają do wpisów Q1, Q2.
- Zasady działające tylko na ekranie (blokada 1 s, ucinanie czasu do 5 s, „Gotowe” w Zakupach) sprawdzone grepem w `apps/web/src/games/Quiz.tsx`, `Dziesiatki.tsx`,
  `Schulte.tsx`, `Sudoku.tsx`, `Zakupy.tsx`, tylko po to, żeby potwierdzić, że ekran wysyła wartości w granicach walidacji i mieści się w limicie tury. Wygląd ekranów to faza 2.
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze tych gier (bez błędów; najgorszy wynik: quizy 0 · Infinity, Tabela Schultego 180000, Sudoku 120000, Zakupy 0 · 50000).
- Skrypt `fuzz07.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o **prawdziwe** wyniki, wzorem `fuzz06.ts`:
  każda z 9 gier × 400 partii (1-6 graczy), każdy gracz oddaje losowy dozwolony wynik (85%, w tym skrajne: czasy przy limicie, dużo pomyłek) albo `timeoutMove` (15%);
  w Tabeli Schultego i Sudoku przed wynikiem 3 ruchy `progress` (razem 4188 na grę). Sprawdzenia jak w 01-06: świeża gra nieskończona, schemat i `validateMove`,
  `obcy` odrzucony, stan zamrożony rekursywnie przed `applyMove` i porównany JSON-em, round-trip JSON stanu i widoków wszystkich graczy i `""`, drugi wynik odrzucony,
  stały klucz `turn()`, znak różnicy `places` zgodny ze znakiem porównania `record.score`, potem `record.tie` dla każdej pary; **nowe**: czy gracz po limicie stoi wyżej niż gracz z oddanym wynikiem.
  Wynik: **0 błędów**; gracz po limicie wyżej od uczciwego wyniku w 10 partiach Tabeli Schultego i 16 Sudoku (wpis W7a).
- Skrypt `cases07.ts` (scratchpad) odtwarza pojedyncze przypadki wpisów: W7a, W7b, Q1, brzegi sumy i liczby czasów quizu.

| gra | partie | zwycięzca | remis bez zwycięzcy (n > 1) | `places` ≠ rekord | po limicie wyżej niż wynik |
|---|---|---|---|---|---|
| stroop | 400 | 327 | 6 | 0 (przypadek W7b: tak) | 0 |
| liczenie | 400 | 327 | 6 | 0 (W7b: tak) | 0 |
| inny | 400 | 327 | 6 | 0 (W7b: tak) | 0 |
| obrot | 400 | 327 | 6 | 0 (W7b: tak) | 0 |
| literowka | 400 | 327 | 6 | 0 (W7b: tak) | 0 |
| dziesiatki | 400 | 327 | 6 | 0 (W7b: tak) | 0 |
| schulte | 400 | 329 | 4 | 0 | **10** |
| sudoku | 400 | 328 | 5 | 0 | **16** |
| zakupy | 400 | 321 | 12 | 0 | 0 |

- Najdłuższa uczciwa partia wobec limitu tury (`ZASADY.md` §3 :106 „plus zapas”):

| gra | najdłuższa uczciwa partia | limit | mieści się |
|---|---|---|---|
| stroop, liczenie, inny, obrot, literowka, dziesiatki | 30 s rundy (`quiz.ts:6`), ekran kończy sam (`Quiz.tsx:204`, `Dziesiatki.tsx:82`) | 90 s | ✓ |
| schulte | bez limitu na ekranie; serwer przyjmuje `ms` ≤ 180 s (`schulte.ts:56`) | 180 s | ✓ (ale W7a) |
| sudoku | jak wyżej, `ms` ≤ 120 s (`sudoku.ts:99`) | 120 s | ✓ (ale W7a) |
| zakupy | 10 s pokazu + do 50 s zaznaczania = 60 s; ekran nie kończy sam po 50 s (`Zakupy.tsx:68-72`) | 60 s | **✗ bez zapasu** (ZK1) |

## Wpisy wspólne tej paczki (do scalenia w 01-10)

#### W7a. Limit czasu nie jest najgorszym wynikiem w Tabeli Schultego i Sudoku `[zbiorcze: timeout-nie-najgorszy]`
- Gry: `schulte` (`packages/games/src/schulte.ts:75`: 180 000 ms, 0 pomyłek) i `sudoku` (`packages/games/src/sudoku.ts:112`: 120 000 ms, 0 pomyłek).
  Walidacja przyjmuje każdy czas do limitu i dowolnie wiele pomyłek (`schulte.ts:55-58`, `sudoku.ts:99`), a wynik to czas + kara (`schulte.ts:25`, `sudoku.ts:29`),
  więc prawdziwy wynik może być gorszy od limitu: 170 s i 4 pomyłki w Tabeli Schultego to 182 s, 60 s i 13 złych cyfr w Sudoku to 125 s (`cases07.ts`: w obu gracz po limicie wygrywa).
  `fuzz07.ts`: 10 i 16 partii na 400, w których gracz po limicie stoi wyżej niż ktoś, kto oddał wynik.
- Skutek: komu poszło źle (dużo pomyłek), opłaca się przestać grać i czekać na limit; w turnieju zmienia to punkty. Rekordów to nie dotyka (liczy się najlepszy wynik nicku).
- Źródło: `ZASADY.md` §3 :89-90 („w mini-grze jest to najgorszy możliwy wynik”); `ZASADY-GIER.md` :89 i :557 podają limit jako „180000 ms, 0 pomyłek” / „120000 ms, 0 pomyłek”,
  a testy `schulte.test.ts:73` i `sudoku.test.ts:216` („daje ostatnie miejsce”) sprawdzają to tylko wobec wyniku bez kary.
- Historia: od pierwszej wersji (`0178866` 2026-10-08 Schulte, `a6fb8a2` 2026-10-12 Sudoku); `4e49f02` dodał tylko `splits: []`. Żaden komentarz ani dokument nie mówi, że to celowe.
- Waga: **wysoka** (nieuczciwy wynik partii i turnieju; rzadko, bo dotyczy tylko bardzo słabych partii).
- Propozycja (popraw kod i dokument, decyzja w fazie 4): limit czasu zawsze za każdym oddanym wynikiem, np. komparator „wynik z limitu na końcu” (w Schultem rozpoznawalny po `splits: []`,
  w Sudoku potrzebne pole albo `mistakes` z limitu ustawione na sufit), albo górna granica `total` w walidacji równa wynikowi limitu (wtedy uczciwy wynik ponad granicą przepada, co też trzeba opisać).
  Do tego testy „limit przegrywa z wynikiem z karą ponad limit” w obu plikach.

#### W7b. Rekord rozstrzyga remis zaokrągloną średnią, miejsca nie: patrz W6b `[zbiorcze: tie-zaokraglenie]`
- Gry tej paczki: `stroop.ts:50`, `liczenie.ts:71`, `inny.ts:83`, `obrot.ts:84`, `literowka.ts:52`, `dziesiatki.ts:67` (`tie: Math.round(average(times))`, komparator `byHitsThenAverage` /
  `byScoreThenAverage` bez zaokrąglenia, `core.ts:239-247`).
- Dowód (`cases07.ts`, każda z 6 gier): 3 trafienia po 300, 300, 301 ms i po 300 ms: `isOver` daje zwycięzcę `b`, `places` {a: 2, b: 1}, rekordy obu `[3, 300]`.
  Ekran końcowy liczy miejsca jeszcze inaczej, z zaokrągloną średnią (`apps/web/src/games/Quiz.tsx:73`): obaj dostają „1.”, a puchar ma tylko `b`.
- Waga: **niska** (jak W6b). Propozycja: jak W6b; jedna poprawka w `core.ts` naprawia wszystkie 7 gier, a ekran może wtedy brać miejsca z `places`.

#### Q1. `quiz.ts`: czasy niecałkowite i nieograniczona liczba pomyłek przechodzą walidację
- Gry: wszystkie korzystające z `quizMoveSchema` / `validQuiz` (`stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`). Miejsce: `packages/games/src/quiz.ts:18`
  (`times: z.array(z.number())`, bez `.int()`), `:19`, `:29-30` (`errors` int ≥ 0 bez górnej granicy).
- Dowód (`cases07.ts`): `{ times: [150.5, 4999.9], errors: 1e9 }` przechodzi schemat i `validateMove`. Ekran zawsze wysyła całkowite czasy (`Quiz.tsx:182`, `Dziesiatki.tsx:61`),
  a przy blokadzie 1 s pomyłek w 30 s jest najwyżej 30.
- Źródło: `ZASADY.md` §2 Mini-gra (:74 „wynik niecałkowity odpada”), §1 wspólny schemat `ZASADY-GIER.md` :57 („serwer odrzuca tylko nierealne wartości”). Refleks ma czasy `.int()` (`refleks.ts:32`).
- Waga: **niska** (bez wpływu na uczciwość: `errors` nie wchodzi do rankingu w 4 grach, a w Obrocie i Literówce tylko odejmuje; czasy i tak są uśredniane i zaokrąglane w rekordzie).
- Propozycja (popraw kod): `z.array(z.number().int())` i `errors ≤ DURATION_MS / 1000`; test w schemacie każdej z 6 gier („czas niecałkowity”, „pomyłek więcej niż sekund”).

#### Q2. Ekran ucina czasy do 5 s i gubi trafienia szybsze niż 150 ms; dokument mówi o tym tylko częściowo
- Gry: jak Q1. Miejsce: `apps/web/src/games/Quiz.tsx:187-188` i `Dziesiatki.tsx:62-63` (`if (took >= MIN_ANSWER) times.push(Math.min(took, MAX_ANSWER))`, komentarz `ponytail:`).
  Trafienie poniżej 150 ms nie jest liczone, ale pytanie przechodzi dalej; odpowiedź po 5 s liczy się jak 5 s.
- Źródło: `ZASADY-GIER.md` :108 (sama walidacja 150-5000 ms); ucięcie do 5 s opisują tylko Inny element (:339) i Dziesiątki (:456), utraty trafienia < 150 ms nie opisuje żadna sekcja.
  Zasada odczuwalna, tylko w kodzie (D-07).
- Waga: **niska** (trafienie w mniej niż 150 ms prawie się nie zdarza; ucięcie do 5 s zmienia tylko średnią przy remisie).
- Propozycja (popraw dokument): w :108 „ekran liczy czas trafienia najwyżej jako 5 s, a trafienie szybsze niż 150 ms przepada (serwer by je odrzucił)”; z :339 i :456 odesłać do tego zdania.

## Kolor liter (`stroop`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Kolor liter i Liczenie (:101-111), wspólna z Liczeniem. Opis w `KONCEPT.md` §2: ✓ §2.4 (:116, :118). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`stroop.ts:25-28`) | tabela :21 | ✓ (też `KONCEPT.md` §3 :234) |
| czas rundy | `DURATION_MS = 30_000` (`quiz.ts:6`) | :103 | ✓ (też `KONCEPT.md` :116) |
| liczba plansz | `QUESTIONS = 30000 / 150 = 200` (`quiz.ts:10`), 50 czwórek (`stroop.ts:33`) | :103 | ✓ |
| kolory | 4 (`stroop.ts:7`) | :109 | ✓ |
| zgodne plansze | dokładnie 1 na czwórkę, losowa pozycja (`stroop.ts:9`, `:35-38`); słowo niezgodne równo z 3 pozostałych | :110-111 | ✓ (też `KONCEPT.md` :116) |
| blokada po pomyłce | 1 s (`Quiz.tsx:33`, `:195`) | :104 | ✓ (też `KONCEPT.md` :118) |
| walidacja | czas 150-5000, suma ≤ 30 000, ≤ 200 czasów, `errors` int ≥ 0 (`quiz.ts:7-8`, `:18-19`, `:26-32`) | :108 | ✓ (Q1) |
| ranking | `byHitsThenAverage` (`stroop.ts:50`), `errors` poza rankingiem | :105 | ✓ (W7b) |
| limit czasu | `times: [], errors: 0` (`stroop.ts:54`) | :108 | ✓ najgorszy możliwy (0 · Infinity) |

Rozbieżności kod ↔ dokumenty: brak poza Q1, Q2, W7b.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ zero trafień | 01-01-CHECKS.md (0 · Infinity); test :78 |
| remis i solo bez zwycięzcy | ✓ | testy :66 (także dwa puste wyniki); 01-01-CHECKS.md (n = 1); `fuzz07.ts` (6 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts` |
| `ranked` / `places`, rekord zgodny | ✓ poza remisem poniżej 1 ms | `fuzz07.ts` (0 niezgodności); W7b |
| pole odróżniające partie | ✓ `trials` (200 losowań) | `stroop.ts:33-40` |
| sufit wyniku | ✓ zgodne plansze kompletami po 4, zgodnie z §3 :102 | `stroop.ts:34-35`; test :30 |
| limit wobec najdłuższej partii | ✓ 30 s z 90 s | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `average`, `byHitsThenAverage`, `ranked` (:1), wspólne `quiz.ts` | – |

Odstępstwa z powodem (D-11): wynik liczony na kliencie (`quiz.ts:25`, `ZASADY-GIER.md` §1 :57-58); `playerView` zwraca cały stan (§1 :53-54), wspólne dla wszystkich mini-gier.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Kolor liter i Liczenie) | Test (`stroop.test.ts`) |
|---|---|
| 30 s, 200 plansz, starczy przy 150 ms (:103) | :25 (≥ 30 s przy 150 ms; liczba 200 nie wprost) |
| pomyłka blokuje na 1 s (:104) | n/d (ekran, `Quiz.tsx:195`) |
| wynik `times` i `errors`, ranking: trafienia, potem średnia; `errors` poza rankingiem (:105) | :57 (B z 5 pomyłkami wygrywa), :66 |
| ekran końcowy, błysk (:106-107) | n/d (faza 2, 01-02) |
| walidacja 150-5000, suma ≤ 30 s, ≤ 200; limit = zero trafień (:108) | :46-49 (149, 5001, 33 s, −1), :53, :78; brzegi częściowo (ST3) |
| 4 kolory, odpowiedź to kolor liter (:109) | :23, :26 (odpowiedź n/d: ekran) |
| dokładnie jedna zgodna w czwórce, losowa pozycja (:110-111) | :30 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA | ST1 |
| Setup: stan, kto zaczyna, seedy | LUKA | ST2 |
| Walidacja: spoza gry, drugi wynik | ✓ | :51, :52 |
| Walidacja: po końcu | LUKA | ST4 |
| Walidacja: brzegi | LUKA (częściowo) | ST3 |
| Schemat | LUKA | ST5 |
| Koniec: wygrana każdego gracza | LUKA | ST6 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :66, :57; puste `waitingFor` przez index.test.ts:93 (01-01 §4.2 K4 T) |
| Limit: `timeoutMove` przechodzi `validateMove` | ✓ | :78 (kształt); walidacja index.test.ts:72-73 (01-01 §4.2 Lim T) |
| Stan: brak mutacji, JSON | LUKA | ST7 |
| Mini-gra: zakres, drugi wynik, remis | ✓ | :46-49, :52, :66 |
| Mini-gra: wynik niecałkowity | LUKA (kod przyjmuje, Q1) | Q1 |
| Mini-gra: solo bez zwycięzcy | ✓ (przez index.test.ts:107, n = 1) | 01-01 §4.2 |
| Mini-gra: rewanż daje inne wyzwanie | LUKA | ST2 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### ST1. Definicja bez testu
- Miejsce: brak w `stroop.test.ts` (`minPlayers`, `maxPlayers`, `turnSeconds` z `stroop.ts:25-28`, `isOver(setup(...))`). `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**. Zachowanie poprawne (`fuzz07.ts`).
- Propozycja: test „1-6 graczy, limit 90 s, świeża gra trwa” jak `inny.test.ts:34`.

#### ST2. Start i seedy bez testu
- Miejsce: brak w `stroop.test.ts` (`waitingFor` na starcie, ten sam seed to samo, inny seed inne plansze). `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55) i Mini-gra „rewanż daje inne wyzwanie” (:75). Waga: **średnia**.
- Propozycja: jak `inny.test.ts:44` (`toEqual` dla seeda 1, `not.toEqual` dla 1 i 2) i `waitingFor` = [A, B] w teście definicji.

#### ST3. Brzegi tylko z jednej strony
- Miejsce: `stroop.test.ts:46-48` sprawdza 149, 5001 i 33 s; nie sprawdza, że 150 i 5000 przechodzą, ani sumy 30 000 / 30 001 i liczby 200 / 201 czasów. `[zbiorcze: brzegi]`
- Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia** (walidacja poprawna, `cases07.ts`: 30 000 i 200 czasów przechodzą, 30 001 nie).
- Propozycja: jak `inny.test.ts:152` oraz `result(Array(6).fill(5000))` przechodzi, `result([...Array(5).fill(5000), 5001])` nie; `Array(200).fill(150)` przechodzi, 201 nie.

#### ST4. Ruch po końcu bez testu
- Miejsce: brak w `stroop.test.ts` (testy :57, :66 kończą partię bez próby ruchu). `[zbiorcze: po-koncu]`
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: jak `inny.test.ts:155`.

#### ST5. Schemat bez testu
- Miejsce: `stroop.test.ts` nie woła `moveSchema`; „ujemne pomyłki” :49 odrzuca `validateMove`. `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia** (schemat poprawny poza Q1).
- Propozycja: blok „schemat” jak `inny.test.ts:159-167`.

#### ST6. Wygrana tylko jednego gracza
- Miejsce: `stroop.test.ts:57-64` (wygrywa B). `[zbiorcze: wygrana-kazdego]`
- Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `inny.test.ts:171`.

#### ST7. Mutacja i JSON bez testu
- Miejsce: brak w `stroop.test.ts` i index.test.ts (01-01 §4.2 St1 N, St2 N). Zachowanie poprawne (01-01-CHECKS.md, `fuzz07.ts`). `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: test jak `inny.test.ts:211`.

## Liczenie (`liczenie`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Kolor liter i Liczenie (:101-108, :112-115). Opis w `KONCEPT.md` §2: ✓ §2.4 (:117-118). Brak trybów.
- Wspólne `quiz.ts`: patrz Kolor liter i wpisy Q1, Q2 (walidacja, czas rundy, liczba pytań, blokada, limit czasu identyczne: `liczenie.ts:57-61`, `:65`, `:75`).

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`liczenie.ts:57-60`) | tabela :22 | ✓ (też `KONCEPT.md` §3 :234) |
| rodzaje działań | `kind = floor(rng × 4)` niezależnie dla każdego pytania (`liczenie.ts:32`) | :112 „po równo z czterech typów” | ✗ częściowo (LC1) |
| `+` | a, b 10-99 (`:34`) | :112 | ✓ |
| `−` | a 20-99, b 10..a, wynik ≥ 0 (`:37-39`) | :112 | ✓ |
| `×` | 2-9 × 2-12 (`:41`) | :113 | ✓ |
| `:` | dzielnik 2-9, wynik 2-12, bez reszty (`:44-45`) | :113 | ✓ |
| złe odpowiedzi | `SLIPS` ±1, ±2, ±10, ±20 / ±1, ±2, ±a, ±b / ±1, ±2, ±3 (`:20-25`), dodatnie, bez powtórek, bez a i b (`:48-49`) | :113-115 | ✓ |
| wynik równy a albo b | losowane od nowa (`:47`) | :115 | ✓ |
| ranking | `byHitsThenAverage` (`:71`) | :105 | ✓ (W7b) |

#### LC1. Rodzaje działań losowane osobno, nie kompletami; dzielenie rzadsze niż „po równo”
- Gra: `liczenie`. Miejsce: `packages/games/src/liczenie.ts:32` (rodzaj losowany dla każdego pytania osobno) i `:47` (ponowne losowanie całego działania,
  także rodzaju, gdy wynik równa się a albo b; odpada część dzieleń i odejmowań typu a = 2b).
- Dowód (`fuzz07.ts`, 2000 seedów × 200 pytań): udziały `+` 25,7%, `−` 25,2%, `×` 25,8%, `:` **23,3%**; w pierwszych 40 pytaniach (tyle mniej więcej mieści się w 30 s)
  liczba działań z tabliczki (`×` i `:`) waha się od **8 do 29**, a samych dodawań od 3 do 21.
- Źródło: `ZASADY.md` §3 :102 („Rodzaje plansz o różnej trudności idą potasowanymi kompletami, nie osobnym losowaniem na planszę”, przykłady: Kolor liter, Inny element)
  i :100 („każda [partia] musi dawać tyle samo do zdobycia”); `ZASADY-GIER.md` :112 („po równo z czterech typów”).
  Że rodzaje różnią się trudnością (tabliczka mnożenia kontra dodawanie liczb dwucyfrowych), to założenie audytu, do potwierdzenia pomiarem.
- Historia: losowanie bez zmian od `a118764` (2026-10-10); reguła kompletów przyszła dwa dni później (`a590005`, 2026-10-12) i wymieniła tylko Kolor liter i Inny element. `[zbiorcze: trudnosc-z-losowania]`
- Waga: **średnia** (jak W6a: wszyscy w partii mają te same działania, więc dotyka tylko porównań rekordów między partiami).
- Propozycja (popraw kod, pomiar w fazie 3, REC-01): rodzaje w potasowanych czwórkach jak w `stroop.ts:34-35`, a przy wyniku równym a albo b losować od nowa tylko liczby, nie rodzaj.
  Jeśli zostaje, dopisać powód w `ZASADY-GIER.md` (D-11) i doprecyzować „po równo” na „każdy rodzaj z prawdopodobieństwem 1/4”.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ zero trafień | 01-01-CHECKS.md; test :94-99 (z `send`, więc i walidacja) |
| remis i solo bez zwycięzcy | ✓ | test :86 (także solo); :94 (dwa limity); `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts` |
| `ranked` / `places`, rekord zgodny | ✓ poza W7b | `fuzz07.ts` |
| pole odróżniające partie | ✓ `problems` | `liczenie.ts:63` |
| sufit wyniku | ✗ częściowo (rodzaje działań) | LC1 |
| wspólne funkcje `core.ts` | ✓ `average`, `byHitsThenAverage`, `ranked`, `shuffle` (:1); własne `between` (:17) to jedna linia losowania int, w `core.ts` nie ma odpowiednika (jak w Za zasłoną, 01-06) | – |

Odstępstwa z powodem (D-11): jak w Kolorze liter (wynik na kliencie, cały stan w widoku).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Kolor liter i Liczenie) | Test (`liczenie.test.ts`) |
|---|---|
| wspólne :103-108 (30 s, blokada, wynik, ranking, walidacja, limit) | :31 (≥ 30 s), :71, :86, :63-65, :94; blokada n/d (ekran) |
| cztery rodzaje działań, po równo (:112) | :37 (wszystkie rodzaje występują); „po równo” LUKA (LC1, LC2) |
| zakresy liczb każdego rodzaju (:112-113) | LUKA (LC2) |
| `:` zawsze bez reszty (:113) | :33 (wynik z tekstu równa się poprawnej odpowiedzi, więc iloraz całkowity) |
| złe odpowiedzi blisko poprawnej, dodatnie, bez powtórek (:113-115) | :34-35, :48, :52, :55 |
| liczby z działania nie ma wśród opcji (:115) | :50-51 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA | LC3 |
| Setup: kto zaczyna | LUKA (częściowo: `waitingFor` po pierwszym ruchu, :83) | LC4 |
| Setup: seedy, rewanż | LUKA | LC4 |
| Walidacja: spoza gry, drugi wynik | ✓ | :67, :68 |
| Walidacja: po końcu | LUKA | LC5 |
| Walidacja: brzegi | LUKA (częściowo: tylko 149 i 33 s, bez „za wolno”) | LC6 |
| Schemat | LUKA | LC7 |
| Koniec: wygrana każdego gracza | LUKA | LC8 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :86, :71, :99 |
| Limit | ✓ | :94-97 |
| Stan: brak mutacji, JSON | LUKA | LC9 |
| Mini-gra: zakres, drugi, remis, solo | ✓ | :63-65, :68, :86, :91 |
| Mini-gra: niecałkowity | LUKA (kod przyjmuje, Q1) | Q1 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### LC2. Zakresy liczb i równy udział rodzajów bez testu
- Miejsce: `liczenie.test.ts:29-39` sprawdza poprawność odpowiedzi i obecność czterech rodzajów; zakresów a i b (`liczenie.ts:34-45`) ani udziału rodzajów nie sprawdza nikt.
- Źródło: `ZASADY.md` §2 „każda zasada z sekcji gry” (:63); `ZASADY-GIER.md` :112-113. Waga: **średnia** (zakresy decydują o trudności).
- Propozycja: test „liczby w zakresach rodzaju” parsujący `text` dla 50 seedów; po poprawce LC1 test kompletów jak `stroop.test.ts:30`.

#### LC3. Definicja bez testu `[zbiorcze: definicja-swieza-gra]`
- Miejsce: brak w `liczenie.test.ts`; kod `liczenie.ts:57-60`. Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**.
- Propozycja: jak `inny.test.ts:34`.

#### LC4. Start i seedy bez testu `[zbiorcze: setup-ten-sam-seed]`
- Miejsce: `liczenie.test.ts:83` sprawdza `waitingFor` dopiero po ruchu A; seedów nikt. Źródło: `ZASADY.md` §2 Setup (:55), Mini-gra (:75). Waga: **średnia**.
- Propozycja: jak `inny.test.ts:44` i `waitingFor(setup)` = [A, B].

#### LC5. Ruch po końcu bez testu `[zbiorcze: po-koncu]`
- Miejsce: brak w `liczenie.test.ts` (:94 kończy partię bez próby ruchu). Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: na końcu :94 `expect(game.validateMove(s, A, result([500]))).toBe(false)`.

#### LC6. Brzegi tylko z jednej strony, brak „za wolno” `[zbiorcze: brzegi]`
- Miejsce: `liczenie.test.ts:62-66` (149, 33 s, −1); brak 5001, 150 i 5000 przechodzą, suma 30 000 / 30 001, 200 / 201 czasów. Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**.
- Propozycja: jak ST3.

#### LC7. Schemat bez testu `[zbiorcze: schemat-smieci]`
- Miejsce: `liczenie.test.ts` nie woła `moveSchema`. Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia**.
- Propozycja: blok „schemat” jak `inny.test.ts:159-167`.

#### LC8. Wygrana tylko jednego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `liczenie.test.ts:71-77` (wygrywa B). Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])`.

#### LC9. Mutacja i JSON bez testu `[zbiorcze: stan-mutacja-json]`
- Miejsce: brak w `liczenie.test.ts` i index.test.ts. Zachowanie poprawne (01-01-CHECKS.md, `fuzz07.ts`). Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: jak `inny.test.ts:211`.

## Inny element (`inny`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Inny element (:321-340). Opis w `KONCEPT.md` §2: ✓ §2.4 (:131). Brak trybów. `quiz.ts`: patrz Kolor liter, Q1, Q2.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`inny.ts:41-44`) | tabela :32 | ✓ (też `KONCEPT.md` §3 :234) |
| plansze | 200 (`QUESTIONS`, `inny.ts:55`), `{ cols, rows, odd, base, other }` (:71) | :324-325 | ✓ |
| siatka | `cols = min(2 + ceil(i/2), 6)`, `rows = min(2 + floor(i/2), 6)` (:56-57): 2×2, 3×2 … 6×6 od planszy 8 | :326-327 | ✓ (też `KONCEPT.md` :131) |
| komplety rodzajów | plansze 0-3 i 4-7 po czterech rodzajach, dalej trójki (:50-51); 8 + 64 × 3 = 200 | :328-330 | ✓ (też `KONCEPT.md` :131) |
| zanikanie różnicy | liniowo do `HARD = 16` (:7, :34) | :330-331 | ✓ |
| obrót | trójkąt, ± 40 → 8° (:9-10, :61, :65) | :332 | ✓ |
| odcień | `light` ± 20 → 5, bazowa 50-60 (:11-12, :62, :67) | :333 | ✓ |
| rozmiar | ± 20 → 10 przy 80 (:13-14, :17, :69) | :334 | ✓ |
| kształt | n = 3 + floor(i / 3), n ± 1, przy 3 zawsze 4; tylko plansze 0-7 (:16, :61, :70) | :335-336 | ✓ |
| losowe | barwa, kąt bazowy, znak, `odd` (:59, :62, :71) | :337 | ✓ |
| blokada, plansza zostaje, czas od pierwszego pokazania, do 5 s | ekran (`Inny.tsx:34` `retry`, `Quiz.tsx:21`, `:188`, `:195`) | :338-339 | ✓ |
| limit czasu | zero trafień (:87) | :340 | ✓ najgorszy możliwy |

Rozbieżności kod ↔ dokumenty: brak poza Q1, Q2, W7b. Liczba boków bazowego symbolu przy obrocie / odcieniu / rozmiarze (3-8, `inny.ts:18`, `:61`) nie jest opisana; nie zmienia trudności w odczuwalny sposób, bez wpisu (D-07).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | 01-01-CHECKS.md; test :203 (z walidacją) |
| remis i solo bez zwycięzcy | ✓ | testy :186, :199; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts`; test :211 |
| `ranked` / `places`, rekord zgodny | ✓ poza W7b | `fuzz07.ts` |
| pole odróżniające partie | ✓ `trials` | test :44 |
| sufit wyniku | ✓ rodzaje kompletami (§3 :102 wymienia tę grę) | `inny.ts:50-51`; test :115 |
| wspólne funkcje `core.ts` | ✓ `average`, `byHitsThenAverage`, `ranked`, `shuffle` (:1) | – |

Odstępstwa z powodem (D-11): jak w Kolorze liter (wynik na kliencie, `inny.ts:36-37`; cały stan w widoku).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Inny element) | Test (`inny.test.ts`) |
|---|---|
| 30 s, jeden inny symbol (:323) | :42, :61 |
| 200 plansz, te same dla wszystkich, kształt planszy (:324-325) | :44, :55, :68 |
| siatka rośnie 2×2 … 6×6 od planszy 8 (:326-327) | :49 |
| dokładnie jedno pole różnicy, komplety rodzajów (:328-330) | :61, :115 |
| zanikanie do planszy 16 (:330-331) | :80-113, :126 |
| obrót, odcień, rozmiar, kształt: wartości (:332-336) | :80, :92, :103, :132 |
| losowe pola (:337) | :55 (`odd`), :115 (kolejność rodzajów); barwa i kąt pośrednio :44 |
| blokada, plansza zostaje, czas od pierwszego pokazania, do 5 s (:338-339) | n/d (ekran) |
| limit = zero trafień (:340) | :203 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `inny.test.ts` (definicja i start :34; seedy i rewanż :44; walidacja :143-156 ze spoza gry, drugim wynikiem, po końcu;
schemat :159-167; koniec :171-184 z wygraną każdego i pustym `waitingFor`; remis :186; solo :199; limit :203; stan :211; rekord przez index.test.ts:168, :190), poza:

#### IN1. Brzegi sumy i liczby czasów bez testu `[zbiorcze: brzegi]`
- Miejsce: `inny.test.ts:148` („ponad 30 s” jako 33 000) i :164 (201 czasów w schemacie); brak 30 000 / 30 001 i „200 czasów przechodzi”. Brzegi pojedynczego czasu pełne (:146-147, :152).
- Źródło: `ZASADY.md` §2 Walidacja (:61), D-03. Waga: **średnia** (walidacja poprawna, `cases07.ts`).
- Propozycja: jak ST3 (te same przypadki w Obrocie, Literówce i Dziesiątkach).

Wynik niecałkowity: patrz Q1 (test schematu :165 sprawdza tylko pomyłki).

## Obrót (`obrot`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Obrót (:342-359). Opis w `KONCEPT.md` §2: ✓ §2.4 (:132). Brak trybów. `quiz.ts`: patrz Kolor liter, Q1, Q2.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`obrot.ts:57-60`) | tabela :33 | ✓ (też `KONCEPT.md` §3 :234) |
| pary | 200 (`QUESTIONS`, :65), `{ a, b, mirror }`, pola dosunięte do (0, 0) (:26-30) | :346-347 | ✓ |
| klocki | `min(4 + floor(i / 3), 7)` (:5-7, :67) | :348-349 | ✓ (też `KONCEPT.md` :132) |
| chiralność | odbicie ≠ żaden obrót, inaczej od nowa (:48) | :350-351 | ✓ (też `KONCEPT.md` :132) |
| obrót `b` | 90/180/270°, zawsze inny wygląd (:71-72); `mirror` z p = 0,5 (:68) | :352-353 | ✓ |
| kara | blokada 1 s (ekran) i punkt mniej, następna para (`netScore`, `quiz.ts:23`) | :354-355 | ✓ |
| wynik | `max(0, trafienia − pomyłki)`, potem średnia, dwa bez trafień remis (`byScoreThenAverage`, :84; `core.ts:244-247`) | :356 | ✓ (W7b) |
| limit czasu | zero trafień i pomyłek (:88) | :358 | ✓ najgorszy możliwy |

Rozbieżności kod ↔ dokumenty: brak poza Q1, Q2, W7b.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · Infinity | 01-01-CHECKS.md; test :195 |
| remis i solo bez zwycięzcy | ✓ | testy :178, :191; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts`; test :203 |
| `ranked` / `places`, rekord zgodny | ✓ poza W7b | `fuzz07.ts` |
| pole odróżniające partie | ✓ `trials` | test :53 |
| sufit wyniku | ✓ liczba klocków zależy od numeru pary, nie od losowania; `mirror` i kąt to odpowiedzi, nie rodzaje trudności | `obrot.ts:67-72` |
| wspólne funkcje `core.ts` | ✓ `average`, `byScoreThenAverage`, `ranked` (:1), `netScore` z `quiz.ts` | – |

Odstępstwa z powodem (D-11): kara punktowa obok blokady (`ZASADY.md` §3 :103 mówi o blokadzie albo czasie), powód w `ZASADY-GIER.md` :354-355
(„druga próba przy dwóch odpowiedziach byłaby darmowa”, „blokada zmniejsza rozrzut”); wynik liczony na kliencie (:357, `obrot.ts:52-53`); cały stan w widoku.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Obrót) | Test (`obrot.test.ts`) |
|---|---|
| 30 s, dwie figury, dwie odpowiedzi (:344-345) | :51; odpowiedzi n/d (ekran) |
| 200 par, te same dla wszystkich, pola dosunięte do rogu (:346-347) | :53, :66 |
| poliomino spójne, 4 → 7 klocków co 3 pary (:348-349) | :58, :76 |
| figura chiralna (:350-351) | :88 („nigdy jedno i drugie”) |
| `b` obrócone 90/180/270°, zawsze inaczej, `mirror` po równo (:352-353) | :95, :102 |
| pomyłka: blokada, punkt mniej, następna para (:354-355) | :114 (punkt); blokada i kolejna para n/d (ekran) |
| wynik, remis średnią, dwa bez trafień remis (:356) | :114-127, :178 |
| limit czasu (:358) | :195 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja i start :43; seedy :53; walidacja :135-148 z po końcu :147; schemat :151-159; koniec :163-176 z wygraną każdego;
remis :178; solo :191; limit :195; stan :203; rekord przez index.test.ts:168, :190), poza:

#### OB1. Brzegi sumy i liczby czasów bez testu `[zbiorcze: brzegi]`
- Miejsce: `obrot.test.ts:141` (33 000) i :156 (201 w schemacie). Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**. Propozycja: jak ST3.

## Literówka (`literowka`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Literówka (:361-373). Opis w `KONCEPT.md` §2: ✓ §2.4 (:133). Brak trybów. `quiz.ts`: patrz Kolor liter, Q1, Q2.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`literowka.ts:26-29`) | tabela :34 | ✓ (też `KONCEPT.md` §3 :234) |
| plansza | `WORDS = 4` (:6), `{ words, wrong }` (:40) | :363, :368 | ✓ |
| lista par | `PAIRS` w `literowka-dane.ts`: **181** par, wszystkie słowa 4-12 małych liter, 362 różne słowa (sprawdzone `node -e`) | :364-367 | ✓ (też `KONCEPT.md` :133) |
| rodzaje błędów | tylko ó/u, rz/ż, ch/h (komentarz `literowka-dane.ts:4-5`; test :47) | :364 | ✓ |
| rozdawanie | talia tasowana `shuffle`, po 4 na planszę, nowa talia przy < 4 (:38, :40); 181 / 4 = 45 plansz bez powtórzeń | :366-367 | ✓ |
| `wrong` | `floor(rng × 4)` (:39) | :368 | ✓ |
| kara, wynik | jak Obrót (`netScore`, `byScoreThenAverage`, :52) | :369-371 | ✓ (W7b) |
| limit czasu | zero trafień i pomyłek (:56) | :372 | ✓ |

Rozbieżności kod ↔ dokumenty: brak poza Q1, Q2, W7b. „Błędna forma nie może być prawdziwym słowem” (:365) nie da się sprawdzić automatycznie; test :54-57 sprawdza tylko, że nie jest poprawną formą innej pary (lista do przejrzenia ręcznie, bez wpisu).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | 01-01-CHECKS.md; test :183 |
| remis i solo bez zwycięzcy | ✓ | testy :166, :179; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts`; test :191 |
| `ranked` / `places`, rekord zgodny | ✓ poza W7b | `fuzz07.ts` |
| pole odróżniające partie | ✓ `trials` | test :63 |
| sufit wyniku | ✓ każda plansza ma jedno błędne słowo; trudność słów zależy od listy, nie od losowania rodzaju | `literowka.ts:38-40` |
| wspólne funkcje `core.ts` | ✓ `average`, `byScoreThenAverage`, `ranked`, `shuffle` (:1) | – |

Odstępstwa z powodem (D-11): kara punktowa jak w Obrocie (`ZASADY-GIER.md` :362 „jak w Obrocie”, :369 „bez drugiej próby”); wynik liczony na kliencie (:371, `literowka.ts:21-22`); cały stan w widoku.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Literówka) | Test (`literowka.test.ts`) |
|---|---|
| 30 s, 4 słowa, jedno błędne (:363) | :61, :68, :76 |
| tylko ó/u, rz/ż, ch/h; ≥ 100 par; małe litery, 4-12 (:364-365) | :41, :43, :47 |
| błędna forma nie jest prawdziwym słowem (:365) | :54-57 (częściowo, patrz wyżej) |
| 200 plansz, te same dla wszystkich, talia tasowana od nowa, 45 bez powtórzeń (:366-367) | :63, :92 |
| `wrong` po równo (:368) | :84 |
| kara, wynik, remis (:369-371) | :102-120, :166 |
| limit czasu (:372) | :183 |
| ekran (:373) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja i start :33; seedy :63; walidacja :123-136 z po końcu :135; schemat :139-147; koniec :151-164 z wygraną każdego;
remis :166; solo :179; limit :183; stan :191; rekord przez index.test.ts:168, :190), poza:

#### LT1. Brzegi sumy i liczby czasów bez testu `[zbiorcze: brzegi]`
- Miejsce: `literowka.test.ts:128` (33 000) i :144 (201 w schemacie). Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**. Propozycja: jak ST3.

## Dziesiątki (`dziesiatki`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Dziesiątki (:444-457). Opis w `KONCEPT.md` §2: ✓ §2.4 (:138), wspólna walidacja i tabela z `quiz.ts` / `Quiz.tsx` (:149). `quiz.ts`: patrz Kolor liter, Q1, Q2.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 90 s (`dziesiatki.ts:41-44`) | tabela :40 | ✓ (też `KONCEPT.md` §3 :234) |
| siatka, cel | `SIDE = 4`, `TARGET = 10` (:5, :7), liczby 1-9 (:48) | :446 | ✓ (też `KONCEPT.md` :138) |
| dostawy | 200 par = 400 liczb (:51-57), para n: `refills[2n]` w pierwsze dotknięte pole (`Dziesiatki.tsx:66-67`) | :448-449 | ✓ |
| dostawa ≠ 10 | `while (x + y === 10)` (:55) | :450 | ✓ |
| zawsze para | `take`: drugie pole = 10 − pierwsze pole spoza dwójki (:28-34); plansza startowa pole 1 = 10 − pole 0 (:50) | :451-453 | ✓ (też `KONCEPT.md` :138) |
| zaznaczanie, pomyłka | odznaczenie bez kary, zła para: blokada 1 s, plansza zostaje (`Dziesiatki.tsx:52-55`, `:68-73`) | :454-455 | ✓ |
| czas pary | od poprzedniej pary do drugiego dotknięcia, do 5 s (`Dziesiatki.tsx:61-65`) | :456 | ✓ (Q2) |
| wynik, limit | `byHitsThenAverage` (:67), zero par (:71) | :457 | ✓ (W7b) |

Rozbieżności kod ↔ dokumenty: brak poza Q1, Q2, W7b.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | 01-01-CHECKS.md; test :183 |
| remis i solo bez zwycięzcy | ✓ | testy :165 (z `places` :171), :179; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts`; test :191 |
| `ranked` / `places`, rekord zgodny | ✓ poza W7b | test :161; `fuzz07.ts` |
| pole odróżniające partie | ✓ `board`, `refills` | test :52 |
| sufit wyniku | ✓ zawsze jest para, dostawy z serwera; plansza zależy od wyborów gracza z powodem (:452-453) | test :95 |
| wspólne funkcje `core.ts` | ✓ `average`, `byHitsThenAverage`, `ranked` (:1); `take` dzielone z ekranem | – |

Odstępstwa z powodem (D-11): wynik liczony na kliencie (:457, `dziesiatki.ts:36-37`); cały stan w widoku.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Dziesiątki) | Test (`dziesiatki.test.ts`) |
|---|---|
| 30 s, 4×4, 1-9, para daje 10, nie musi sąsiadować (:446-447) | :34 (stałe), :43, :73 |
| ta sama plansza i dostawy, 400 liczb, kolejność pól (:448-449) | :50, :52, :112 |
| dostawa nigdy nie daje 10 (:450) | :62 |
| zawsze para: `take` i plansza startowa (:451-453) | :58, :88, :95 |
| zaznaczanie, odznaczanie, blokada (:454-455) | n/d (ekran) |
| czas pary do 5 s (:456) | n/d (ekran, Q2) |
| wynik na kliencie, limit zero par (:457) | :183 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte (definicja i start :34; seedy :52; walidacja :121-134 z po końcu :133; schemat :137-145; koniec :149-163 z wygraną każdego i `places`;
remis :165; solo :179; limit :183; stan :191; funkcja licząca `take` na danych brzegowych :80-110; rekord przez index.test.ts:168, :190), poza:

#### DZ1. Brzegi sumy i liczby czasów bez testu `[zbiorcze: brzegi]`
- Miejsce: `dziesiatki.test.ts:126` (33 000) i :142 (201 w schemacie). Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**. Propozycja: jak ST3.

## Tabela Schultego (`schulte`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Tabela Schultego (:86-99). Opis w `KONCEPT.md` §2: ✓ §2.4 (:114-115), `progress` (:147). Bez trybów (`modes` brak, test :81).

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 180 s, `turn()` ze stałym kluczem (`schulte.ts:33-37`) | tabela :20, :98 | ✓ (też `KONCEPT.md` §3 :233) |
| siatka | 5×5, permutacja 1-25 przez `shuffle` (:4, :45) | :87 | ✓ (też `KONCEPT.md` :114) |
| wynik | `ms + 3000 × mistakes` (:6, :25), mniej lepiej (:71) | :88 | ✓ (też `KONCEPT.md` :114) |
| walidacja | `ms` 3750-180 000, `mistakes` int ≥ 0 (:8, :55-58) | :89 | ✓ |
| limit czasu | 180 000 ms, 0 pomyłek (:75) | :89 | ✓ z dokumentem, ✗ z §3 (W7a) |
| `splits` | pusta albo 25 int ≥ 0 o sumie `ms` (:59-62); poza rankingiem (:71) | :90-91 | ✓ |
| `progress` | `found` int 1-24, tylko gracz bez wyniku (:51-54), nie zmienia `waitingFor` | :95-97 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. `ms` niecałkowite przy pustych `splits` przechodzi i jest zaokrąglane w `applyMove` (:67); bez wpisu (pomiar czasu, jak schemat Stopera w 01-06).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| **`timeoutMove` to najgorszy wynik** | **✗** | W7a |
| remis i solo bez zwycięzcy | ✓ | test :59; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ także z `progress` | 01-01-CHECKS.md; `fuzz07.ts` (4188 `progress`) |
| `ranked` / `places`, rekord zgodny | ✓ | `fuzz07.ts` (0 niezgodności) |
| klucz `turn()` stały przy `progress` i wyniku | ✓ | test :115; `fuzz07.ts` |
| pole odróżniające partie | ✓ `grid` | `schulte.ts:45` |
| sufit wyniku | ✓ ta sama siatka 25 liczb, kara czasowa | `ZASADY.md` §3 :103 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle` (:2) | – |

Odstępstwa z powodem (D-11): czas mierzony na kliencie (`schulte.ts:29`, `ZASADY-GIER.md` §1 :57-58); cały stan w widoku.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Tabela Schultego) | Test (`schulte.test.ts`) |
|---|---|
| 5×5, 1-25 w losowym układzie (:87) | :28 |
| wynik z karą 3 s, mniej lepiej (:88) | :49 |
| walidacja `ms`, `mistakes`; limit 180 000 / 0 (:89) | :38-43, :67, :73 |
| `splits` 25 int ≥ 0, suma = `ms`, pusta dozwolona (:90-91) | :124-140 |
| `splits` nie wpływają na ranking (:91) | LUKA (SC7) |
| ekran końcowy, przewaga, wykres (:92-93, :99) | n/d (faza 2, 01-02) |
| bez trybów; znalezione zostają, dotknięcie znalezionej nic nie robi (:94) | :81; reszta n/d (ekran) |
| `progress` 1-24, tylko bez wyniku, w widoku, może spaść, bez wpływu (:95-97) | :86-113 |
| stały klucz `turn()` (:98) | :115 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds` / `turn()`, świeża gra | LUKA (`turn()` porównany z `turnSeconds`, nie z 180; min/max i świeżej gry brak) | SC1 |
| Setup: stan, kto zaczyna | ✓ | :28-33 |
| Setup: seedy, rewanż | LUKA | SC2 |
| Walidacja: spoza gry, drugi wynik, `progress` po wyniku | ✓ | :44, :45, :112-113 |
| Walidacja: po końcu | LUKA | SC3 |
| Walidacja: brzegi | ✓ | :39-40, :67-71 (3749/3750, 180 000/180 001), :104, :107-109 (`progress` 0/1, 24/25) |
| Schemat | LUKA | SC4 |
| Koniec: wygrana każdego gracza | LUKA | SC5 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :59, :49; puste `waitingFor` przez index.test.ts:93 |
| Limit | ✓ (ale W7a) | :73-75 (`send` waliduje) |
| Stan: brak mutacji, JSON | LUKA | SC6 |
| Mini-gra: zakres, niecałkowity, drugi wynik, remis, solo | ✓ | :39-42, :45, :59, :64 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### SC1. Definicja bez pełnego testu `[zbiorcze: definicja-swieza-gra]`
- Miejsce: `schulte.test.ts:115-116` porównuje `turn()` z `game.turnSeconds` (sam limit 180 nie jest sprawdzany), brak `minPlayers`/`maxPlayers` (`schulte.ts:33-34`) i `isOver(setup(...))`.
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**. Propozycja: jak `sudoku.test.ts:52-72`.

#### SC2. Seedy bez testu `[zbiorcze: setup-ten-sam-seed]`
- Miejsce: brak w `schulte.test.ts` (:32 sprawdza tylko, że siatka nie jest posortowana). Źródło: `ZASADY.md` §2 Setup (:55), Mini-gra (:75). Waga: **średnia**.
- Propozycja: jak `sudoku.test.ts:83-92`.

#### SC3. Ruch po końcu bez testu `[zbiorcze: po-koncu]`
- Miejsce: brak w `schulte.test.ts` (:113 sprawdza `progress` po własnym wyniku, gdy B jeszcze gra). Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: jak `sudoku.test.ts:133-139` (wynik i `progress` dla A, B i obcego).

#### SC4. Schemat bez testu `[zbiorcze: schemat-smieci]`
- Miejsce: `schulte.test.ts` nie woła `moveSchema` (`schulte.ts:38-41`: `ms`, `mistakes`, `found` jako `z.number()`). Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia** (całkowitość sprawdza `validateMove`).
- Propozycja: jak `sudoku.test.ts:142-158`.

#### SC5. Wygrana tylko jednego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `schulte.test.ts:49-57` i :73-78 (wygrywa B). Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: jak `sudoku.test.ts:174`.

#### SC6. Mutacja i JSON bez testu `[zbiorcze: stan-mutacja-json]`
- Miejsce: brak w `schulte.test.ts` i index.test.ts. Zachowanie poprawne (01-01-CHECKS.md, `fuzz07.ts`). Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: jak `sudoku.test.ts:263-275` (z ruchem `progress`).

#### SC7. „Międzyczasy nie wpływają na ranking” bez testu
- Miejsce: `schulte.test.ts:121-140` sprawdza kształt `splits`, nie ranking; komparator `schulte.ts:71` ich nie używa.
- Źródło: `ZASADY-GIER.md` :91, `ZASADY.md` §2 :63. Waga: **niska** (zasada przecząca, zachowanie widać wprost w komparatorze).
- Propozycja: dwa wyniki o tym samym `ms` i różnych `splits` dają remis.

Limit czasu: patrz W7a (`schulte.ts:75`, waga wysoka).

## Sudoku (`sudoku`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Sudoku (:547-566). Opis w `KONCEPT.md` §2: ✓ §2.4 (:123), `progress` (:147). Bez trybów (test :60).

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s, `turn()` ze stałym kluczem (`sudoku.ts:82-86`) | tabela :45, :562 | ✓ (też `KONCEPT.md` §3 :234) |
| plansza | 4×4, bloki 2×2, 6 danych, 10 pustych (`SIZE`, `BLANKS`, :4-7) | :548-549 | ✓ (też `KONCEPT.md` :123) |
| jedno rozwiązanie | `count` przerwany przy 2 (:43-54), usuwanie w losowej kolejności, losowanie od nowa, gdy utknie (:63-76) | :549-552 | ✓ |
| wzorzec bazowy | cyfry, wiersze i kolumny w pasach, pasy potasowane (:57-61) | :550-551 | ✓ |
| stan | `puzzle`, `solution` (:20-21) | :553 | ✓ |
| wynik | `ms + 5000 × mistakes`, mniej lepiej, bez drugiego kryterium (:9, :29, :108) | :556 | ✓ (też `KONCEPT.md` :123) |
| walidacja | `ms` 3000-120 000, `mistakes` int ≥ 0 (:11, :99) | :557 | ✓ |
| limit czasu | 120 000 ms, 0 pomyłek (:112) | :557 | ✓ z dokumentem, ✗ z §3 (W7a) |
| `progress` | `filled` int 1-9, tylko gracz bez wyniku (:98) | :559-561 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| **`timeoutMove` to najgorszy wynik** | **✗** | W7a |
| remis i solo bez zwycięzcy | ✓ | testy :187, :196; `fuzz07.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ także z `progress` | 01-01-CHECKS.md; `fuzz07.ts`; testy :264, :272 |
| `ranked` / `places`, rekord zgodny | ✓ | test :187-193; `fuzz07.ts` |
| klucz `turn()` stały | ✓ | test :257; `fuzz07.ts` |
| pole odróżniające partie | ✓ `puzzle`, `solution` | test :87 |
| sufit wyniku | ✓ zawsze 10 pól do wpisania, jedno rozwiązanie | testy :100, :108 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle` (:2) | – |

Odstępstwa z powodem (D-11): czas i pomyłki na kliencie (`sudoku.ts:78`, `ZASADY-GIER.md` :558); `solution` w widoku (:553 „nic nie jest ukryte”).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Sudoku) | Test (`sudoku.test.ts`) |
|---|---|
| 4×4, bloki 2×2, cyfra raz w wierszu, kolumnie i bloku; 6 danych, 10 pustych; jedno rozwiązanie (:548-549) | :94, :100, :108 (solver niezależny od kodu, :29-49) |
| losowanie na serwerze, ta sama plansza (:550-552) | :76, :83, :87 |
| stan = widok (:553) | :76-80 |
| przebieg na ekranie (:554-555) | n/d (ekran) |
| wynik z karą 5 s, bez drugiego kryterium, remis (:556) | :162, :187, :202 |
| walidacja, limit (:557-558) | :118-128, :212, :216 |
| `progress` (:559-561) | :223-255 |
| stały klucz (:562) | :52, :257 |
| bez trybów (:563) | :60 |
| ekran (:564-566) | n/d (faza 2, 01-02) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `sudoku.test.ts` (definicja :52-72; setup :66, :83, :87; walidacja :118-139 z brzegami 2999/3000, 120 000/120 001, `progress` 0/1, 9/10 i po końcu :133;
schemat :142-158; koniec :162-200 z wygraną każdego :174; limit :212; stan :264, :272; mini-gra: komplet, rekord :202). Jedyny wpis: W7a (test :216 nie sprawdza wyniku z karą ponad limit).

## Zakupy (`zakupy`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Zakupy (:479-497). Opis w `KONCEPT.md` §2: ✓ §2.4 (:141), drugie kryterium (:153). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 60 s (`zakupy.ts:52-54`, :37) | tabela :42, :492 | ✓ (też `KONCEPT.md` §3 :233 „60 s w większości”); bez zapasu (ZK1) |
| lista, półka, pokaz | `LIST = 10`, `SHELF = 20`, `SHOW_MS = 10_000` (:5-8) | :480-481 | ✓ (też `KONCEPT.md` :141) |
| losowanie | 20 różnych z puli 60 (`ITEMS` :12-19, `shuffle` :59), lista to 10 indeksów w kolejności tasowania (:60) | :482-484 | ✓ |
| zaznaczanie | 0-20 różnych int 0-19, `ms` int 0-50 000 (:55, :65-71) | :485-487 | ✓ |
| wynik | `max(0, hits − wrong)`, liczy serwer (:40-45, :75) | :487-489 | ✓ (też `KONCEPT.md` :141) |
| ranking | punkty, potem krótszy `ms`; równe to remis (:81) | :490 | ✓ |
| limit czasu | pusta półka, `ms = 50 000` (:85) | :491 | ✓ najgorszy możliwy (remis z uczciwą pustą półką po 50 s, `cases07.ts`) |
| bez `progress` | schemat tylko `result` (:55) | :493 | ✓ |

#### ZK1. Limit 60 s bez zapasu, a ekran nie kończy zaznaczania po 50 s
- Gra: `zakupy`. Miejsce: `packages/games/src/zakupy.ts:37` (`TURN_SECONDS = 60`), `:8-9` (`SHOW_MS + MAX_MS` = 60 s); test `zakupy.test.ts:42-45` utrwala równość
  („limit tury to 10 s pokazu i do 50 s zaznaczania”). Ekran: `apps/web/src/games/Zakupy.tsx:47-55` (10 s pokazu), `:68-72` (wynik dopiero po „Gotowe”; `ms` ucięty do 50 000,
  ale nic nie oddaje go samo po 50 s).
- Limit platformy rusza, gdy ostatni gracz kliknie „Start” (`apps/server/src/LobbyRoom.ts:169-173`, `:355-358`); u tego gracza pokaz zaczyna się w tej samej chwili.
  Jeśli zaznacza dłużej niż ok. 50 s, `timeoutMove` przychodzi przed jego „Gotowe” i zamiast prawdziwego wyniku dostaje 0 punktów z najgorszym czasem;
  późniejszy ruch odpada jako drugi wynik. Nawet „Gotowe” tuż przed 50 s nie ma zapasu na opóźnienie sieci i rysowanie ekranu.
- Źródło: `ZASADY.md` §3 :106 („w mini-grze tyle, ile trwa najdłuższa uczciwa partia plus zapas”); `ZASADY-GIER.md` :492 (zasada sama w sobie bez zapasu).
- Historia: tak od pierwszej wersji (`f7e6b1d`, 2026-10-13).
- Waga: **wysoka** (nieuczciwy wynik: wolny, ale uczciwy gracz traci wszystkie punkty; rzadko, bo zwykle zaznacza się w 10-20 s).
- Propozycja (popraw kod, test i dokument, decyzja w fazie 4): `turnSeconds` z zapasem (np. 75 s, jak 90 s przy 30 s quizów) albo `MAX_MS` krótszy od limitu o kilka sekund,
  i ekran sam oddaje zaznaczone przedmioty po `MAX_MS`. Najpierw zmienić test :42 i `ZASADY-GIER.md` :492, potem kod (`AGENTS.md`: zła zasada, najpierw test).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · 50 000 | 01-01-CHECKS.md; test :250 |
| remis i solo bez zwycięzcy | ✓ | testy :230, :238; `fuzz07.ts` (12 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz07.ts`; test :259 |
| `ranked` / `places`, rekord i `tie` zgodne | ✓ | testy :220-235; `fuzz07.ts` (`tie` = `ms` bez zaokrąglenia, więc bez W7b) |
| pole odróżniające partie | ✓ `items`, `listed` | test :96 |
| sufit wyniku | ✓ zawsze 10 z 20 | `zakupy.ts:5-6` |
| **limit wobec najdłuższej partii** | **✗** | ZK1 |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle` (:2) | – |

Odstępstwa z powodem (D-11): lista w widoku od startu (`zakupy.ts:47-48`, „ponytail”, `ZASADY-GIER.md` §1 :53-54; wymienione w 01-01-CHECKS.md jako jawne odstępstwo).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Zakupy) | Test (`zakupy.test.ts`) |
|---|---|
| jedna runda, 10 s listy, półka 20 (:480-481) | :42-45 (stałe); przebieg n/d (ekran) |
| `items` 20 różnych z puli, `listed` 10 indeksów w innej kolejności, bez dobierania podobnych (:482-484) | :49-88 |
| 0-20 zaznaczeń, pusta półka dozwolona (:485) | :153-156 |
| ruch `picked` i `ms` int 0-50 000, wynik serwera (:486-489) | :115-140, :157-174 |
| ranking i remis (:490) | :192-236 |
| limit czasu (:491) | :250 |
| limit 60 s = 10 + 50 s (:492) | :42 (utrwala ZK1) |
| bez `progress` (:493) | :186 |
| ekran i ekran końcowy (:494-497) | n/d (faza 2, 01-02); `picked` w stanie :208 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `zakupy.test.ts` (definicja :37; setup :49-109 z seedami :96 i startem :90; walidacja :146-174 z brzegami indeksów, czasu,
liczby zaznaczeń i po końcu :148; schemat :176-188; koniec :192-257 z wygraną każdego :192; limit :250; stan :259; mini-gra: komplet, funkcja licząca na danych zepsutych :136). Jedyny wpis: ZK1.

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| W7a | schulte, sudoku | **wysoka** | `timeout-nie-najgorszy` |
| ZK1 | zakupy | **wysoka** | – |
| LC1 | liczenie | średnia | `trudnosc-z-losowania` (z W6a) |
| LC2 | liczenie | średnia | – |
| ST1, LC3, SC1 | stroop, liczenie, schulte | średnia | `definicja-swieza-gra` |
| ST2, LC4, SC2 | stroop, liczenie, schulte | średnia | `setup-ten-sam-seed` |
| ST3, LC6, IN1, OB1, LT1, DZ1 | stroop, liczenie, inny, obrot, literowka, dziesiatki | średnia | `brzegi` |
| ST4, LC5, SC3 | stroop, liczenie, schulte | średnia | `po-koncu` |
| ST5, LC7, SC4 | stroop, liczenie, schulte | średnia | `schemat-smieci` |
| ST6, LC8, SC5 | stroop, liczenie, schulte | średnia | `wygrana-kazdego` |
| ST7, LC9, SC6 | stroop, liczenie, schulte | średnia | `stan-mutacja-json` |
| W7b | stroop, liczenie, inny, obrot, literowka, dziesiatki | niska | `tie-zaokraglenie` (z W6b) |
| Q1 | 6 gier z `quiz.ts` | niska | – |
| Q2 | 6 gier z `quiz.ts` | niska | – |
| SC7 | schulte | niska | – |

Odstępstwa z powodem (D-11), sprawdzone: wynik liczony na kliencie (6 gier z `quiz.ts`, Tabela Schultego, Sudoku), `playerView` z całym stanem (wszystkie), lista w widoku od startu (Zakupy),
`solution` w widoku (Sudoku), kara punktowa obok blokady (Obrót, Literówka).

Gry bez luk w testach obowiązkowych poza brzegami sumy (IN1, OB1, LT1, DZ1): Inny element, Obrót, Literówka, Dziesiątki; bez żadnej luki: Sudoku (poza W7a) i Zakupy (poza ZK1).
Najstarsze pliki testów (Kolor liter, Liczenie, Tabela Schultego, z 2026-10-08, sprzed wzorca z blokami „walidacja / schemat / koniec / stan”) mają wszystkie luki tej paczki.

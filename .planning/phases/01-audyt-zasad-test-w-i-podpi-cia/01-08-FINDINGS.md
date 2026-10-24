# 01-08: mini-gry z odchyłką w rundach (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `kolo`, `kolor`, `kropki`, `kat`, `rok`, `srodek`, `mapa`, `tort`, `nozyczki`.
Repo bez zmian (poza `.planning/`). Podpięcie (§6) i ekran końcowy z samego stanu tych gier są w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts` (i `mapa-dane.ts`) oraz testy `<id>.test.ts` każdej gry przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :23-27, :35-36, :41, :44, §1 wspólny schemat :51-65, sekcje gier :117-212, :375-393, :459-477, :524-545), `KONCEPT.md` §2.4 (:119-122, :125-126, :134, :139, :142, :147)
  i §3 (:233-234), oraz z `ZASADY.md` §2 (:54-76) i §3 (:89-106).
- Policz kropki i Kąt dzielą ekran `Szacowanie.tsx`; liczy się tu tylko logika w `packages/games`. Ekrany (`apps/web/src/games/*.tsx`) sprawdzone grepem
  tylko po czasy odsłon i limity rundy, żeby ocenić limit tury wobec najdłuższej uczciwej partii. Wygląd ekranów to faza 2.
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze tych gier (bez błędów; najgorszy wynik: Koło 0, Odcień 5000, Policz kropki 240,
  Kąt i Który rok? zależne od losowania, Środek 10000, Mapa 10000, Tort 5000, Nożyczki 2500).
- Skrypt `fuzz08.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o **prawdziwe** wyniki, wzorem `fuzz07.ts`:
  każda z 9 gier × 400 partii (1-6 graczy), każdy gracz oddaje losowy dozwolony wynik (85%, w tym 20% najgorszych uczciwych: kropki 99 w każdej rundzie,
  kąt i rok na dalszym końcu zakresu, punkt na skraju strefy w Środku, róg pola w Mapie, wszystkie cięcia na gotowym w Torcie, cięcie ledwie draśnięte w Nożyczkach)
  albo `timeoutMove` (15%). Koło: 1-10 losowych prób (także niedokończonych i za małych), potem pusta lista; Policz kropki, Kąt, Który rok?: 3 ruchy `progress` przed wynikiem (razem 4188 na grę).
  Sprawdzenia jak w 01-07: świeża gra nieskończona, schemat i `validateMove`, `obcy` odrzucony, stan zamrożony rekursywnie przed `applyMove` i porównany JSON-em,
  round-trip JSON stanu i widoków wszystkich graczy i `""`, drugi wynik odrzucony (w Kole: ruch po 10 próbach), stały klucz `turn()` po `progress` i po próbie Koła,
  znak różnicy `places` zgodny ze znakiem porównania `record.score`, gracz po limicie wyżej niż gracz z oddanym wynikiem.
  Wynik: **0 błędów**; gracz po limicie wyżej od uczciwego wyniku w **76 partiach Policz kropki** (wpis W8a), w pozostałych grach 0.
- Ten sam skrypt liczy: najgorszy uczciwy wynik wobec limitu czasu na 500 seedach, rozrzut ΔE tej samej pomyłki suwakiem w Odcieniu, rozrzut kątów w Kącie (W8b)
  i brzegi walidacji punktów Koła (KO4).

| gra | partie | zwycięzca | remis bez zwycięzcy (n > 1) | `places` ≠ rekord | po limicie wyżej niż wynik | limit − najgorszy uczciwy |
|---|---|---|---|---|---|---|
| kolo | 400 | 324 | 9 | 0 | 0 | limit to pusta lista, zostaje najlepsza próba (D-11) |
| kolor | 400 | 324 | 9 | 0 | 0 | ≥ 0 (5 × 100 to sufit każdej odpowiedzi) |
| kropki | 400 | 307 | 26 | 0 | **76** | **−510** (240 wobec 750) |
| kat | 400 | 311 | 22 | 0 | 0 | 0 (limit = najgorszy możliwy) |
| rok | 400 | 306 | 27 | 0 | 0 | 0 (limit = najgorszy możliwy) |
| srodek | 400 | 323 | 10 | 0 | 0 | 1655-2511 (dziesiąte %) |
| mapa | 400 | 323 | 10 | 0 | 0 | 2486-3811 km |
| tort | 400 | 322 | 11 | 0 | 0 | 1093 (dziesiąte %) |
| nozyczki | 400 | 323 | 10 | 0 | 0 | 60 przy cięciu 1,2% (dziesiąte p.p.) |

- Najdłuższa uczciwa partia wobec limitu tury (`ZASADY.md` §3 :106 „plus zapas”):

| gra | najdłuższa uczciwa partia | limit | mieści się |
|---|---|---|---|
| kolo | 10 prób bez limitu na ekranie; limit liczy się od nowa, gdy ktoś skończy (`kolo.ts:152-155`) | 120 s | ✓ (ok. 12 s na próbę) |
| kolor | 5 × (2 s pokazu + suwaki bez limitu + porównanie) | 180 s | ✓ (ok. 36 s na kolor) |
| kropki, kat | 10 × (0,8 s + 1,5 s pokazu + wpis bez limitu + porównanie do „Dalej”) (`Szacowanie.tsx:29`, `:69`) | 120 s | ✓ (ok. 12 s na rundę) |
| rok | 10 × (20 s rundy + 2,5 s odsłony) = 225 s, runda kończy się sama (`rok.ts:8-10`, `:29`) | 240 s | ✓ (15 s zapasu, opisane w `ZASADY-GIER.md` :181) |
| srodek | 10 × (celowanie bez limitu, z przytrzymaniem i przesuwaniem + 1 s odsłony) (`Srodek.tsx:14`) | 60 s | **? bez zapasu do sprawdzenia** (SR1: 10 s to same odsłony, na celowanie zostaje 5 s na rundę) |
| mapa | 10 × (szukanie bez limitu + 1,5 s) (`Mapa.tsx:14`) | 180 s | ✓ (ok. 16 s na rundę) |
| tort | 5 × (2-6 cięć bez limitu + 1,5 s) (`Tort.tsx:14`) | 120 s | ✓ (ok. 22 s na tort) |
| nozyczki | 5 × (jedno cięcie bez limitu + 1,5 s) (`Nozyczki.tsx:14`) | 60 s | ✓ (ok. 10 s na kształt) |

## Wpisy wspólne tej paczki (do scalenia w 01-10)

#### W8a. Limit czasu w Policz kropki nie jest najgorszym wynikiem `[zbiorcze: timeout-nie-najgorszy]`
- Gra: `kropki`. Miejsce: `packages/games/src/kropki.ts:78` (pusta lista liczona jak same zera: błąd = suma kropek = 240, `TOTAL` `:8`) przy walidacji
  odpowiedzi 0-99 (`:71`). Najgorszy uczciwy wynik to 99 w każdej rundzie: 990 − 240 = **750**, więc każda partia z błędem ponad 24 na rundę przegrywa z limitem.
- Dowód: `fuzz08.ts`, 76 partii na 400, w których gracz po limicie stoi wyżej niż ktoś, kto oddał wynik (przy 20% skrajnych odpowiedzi w próbie; w zwykłej grze rzadko);
  na 500 seedach limit jest lepszy od najgorszej uczciwej odpowiedzi zawsze o 510.
- Źródło: `ZASADY.md` §3 :89-90 („w mini-grze jest to najgorszy możliwy wynik”). `ZASADY-GIER.md` :152 opisuje limit jako „same zera”, a sekcja Kąta :166-167
  wprost odrzuca ten wzór („nie zera jak w kropkach: zero przy kącie 10° byłoby prawie trafieniem”). Test `kropki.test.ts:67` sprawdza tylko „pusta = suma kropek”.
- Historia: „same zera” od pierwszej wersji (`98a3e34`, 2026-10-08); Kąt (`186bb49`, 2026-10-10) i Który rok? wzięły najgorszy możliwy błąd, Policz kropki nie poprawiono.
- Waga: **średnia** w tej grze (litera §3 złamana, ale żeby przegrać z limitem, trzeba odpowiadać gorzej niż samymi zerami; w Tabeli Schultego i Sudoku, W7a, jest wysoka,
  bo tam wystarczy zła partia). 01-10 łączy z W7a pod jednym kluczem.
- Propozycja (popraw kod, test i dokument): limit = `max(n, 99 − n)` w każdej rundzie, jak `kat.ts:34` i `rok.ts:33`; test „żadna odpowiedź nie jest gorsza od limitu czasu”
  jak `kat.test.ts:88`; w `ZASADY-GIER.md` :152 i KONCEPT bez zmian poza słowem „najgorszy”. Uwaga: wtedy najgorszy wynik zależy od losowania (jak w Kącie, 01-01-CHECKS.md).

#### W8b. Losowe wyzwanie zmienia trudność partii w Odcieniu i Kącie `[zbiorcze: trudnosc-z-losowania]`
- Gry: `kolor` (`packages/games/src/kolor.ts:89`: cel H 0-359, S 25-100, B 30-100 losowany niezależnie dla każdego z 5 kolorów) i `kat` (`packages/games/src/kat.ts:53`: kąt 5-175 niezależnie w każdej rundzie).
- Dowód (`fuzz08.ts`, 2000 seedów): w Odcieniu ta sama pomyłka suwakiem (±10 barwy, −10 nasycenia albo jasności) kosztuje od **4,6 do 20,4** ΔE zależnie od celu (p10 6,3, mediana 8,5, p90 12,1),
  a suma na partię od 38 (p10) do 52 (p90). W Kącie suma kątów partii waha się od 410 do 1451 (p10 696, p90 1105), a suma odległości od 90° od 324 do 528 (p10, p90).
  Że oko myli się bardziej przy kątach dalekich od prostego (albo przy większych), to założenie audytu, do potwierdzenia pomiarem; w Odcieniu rozrzut wynika z samej geometrii Lab.
- Źródło: `ZASADY.md` §3 „Losowanie nie zmienia sufitu wyniku” (:100-102): litera spełniona (sufit 0 w każdej partii), uzasadnienie („każda musi dawać tyle samo do zdobycia”)
  w Policz kropki prowadzi do stałej sumy (`ZASADY-GIER.md` :150 „błąd rośnie z liczbą kropek”), tu nic nie wyrównuje losowania.
- Pozostałe gry paczki: Który rok? i Mapa zależą od wiedzy (które wydarzenie, które miasto), tego nie wyrówna stała suma; Środek i Nożyczki liczą błąd względnie
  (`ZASADY-GIER.md` :195-196, :534), Tort ma każdą liczbę kawałków raz (:461). Bez wpisów.
- Waga: **średnia** (jak W6a i LC1: wszyscy w partii mają to samo wyzwanie, więc dotyka tylko porównań rekordów między partiami).
- Propozycja (pomiar w fazie 3, REC-01): Odcień: cele kompletami (np. po jednym z każdego zakresu jasności) albo błąd względny wobec ΔE progu podobnych pomyłek;
  Kąt: kąty kompletami (np. po dwa z pięciu przedziałów 5-175) albo `withSum` dla sumy odległości od 90°. Jeśli zostaje, dopisać powód w `ZASADY-GIER.md` (D-11).

#### W8c. Szkielet zasad Policz kropki, Kąta i Który rok? to trzy kopie
- Gry: `kropki`, `kat`, `rok`. Miejsca: `kropki.ts:45-89`, `kat.ts:38-85`, `rok.ts:209-256` (ten sam schemat `result` / `progress`, walidacja `progress` 1-9,
  stały klucz `turn`, `ranked` z sumą, `waitingFor`, `timeoutMove`); różnią się tylko losowaniem, zakresem odpowiedzi i wynikiem po limicie (stąd W8a).
  Komentarz `kat.ts:37` (`ponytail:`) przyznaje to wprost: „szkielet zasad to trzecia kopia (kropki, rok, kat); wspólny moduł, gdy dojdzie czwarta”.
- Źródło: `ZASADY.md` §3 :104-105 („Dwie gry o tej samej mechanice dzielą moduł (jak `quiz.ts`…)”). Powód jest tylko w komentarzu, `ZASADY-GIER.md` go nie podaje (D-11).
- Waga: **niska** (bez wpływu na gracza; 0 błędów w `fuzz08.ts`; rozjazd W8a pokazuje jednak, że kopie dryfują).
- Propozycja: wspólny moduł rund z odpowiedzią liczbową (`szacowanie.ts` obok ekranu `Szacowanie.tsx`) albo zdanie z powodem w `ZASADY-GIER.md` §1 i odesłanie z trzech sekcji.

## Narysuj koło (`kolo`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Narysuj koło (:117-133). Opis w `KONCEPT.md` §2: ✓ §2.4 (:119, :147). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s przez `turn()`, klucz = lista rysujących (`kolo.ts:108-110`, `:152-155`) | tabela :23, :118 | ✓ (też `KONCEPT.md` §3 :234) |
| próby | `ATTEMPTS = 10`, liczy się najlepsza, najgorsza zostaje (`:7`, `:137-138`) | :119, :131 | ✓ (też `KONCEPT.md` :119) |
| punkty | 20-1000, każdy w 0-1 (`:8-9`, `:100`, `:118`) | :119, :121 | ✓ (brzegi 19 / 20 / 1000 / 0 i 1 / 1,0001 sprawdzone w `fuzz08.ts`) |
| pusta lista | kończy próby, zostaje dotychczasowa najlepsza albo 0 (`:123-130`) | :121-122 | ✓ |
| obcięcie zakładki, Kåsa | `sweep` do pełnego obrotu (`:46-59`, `:88`), `fit` (`:64-83`) | :124 | ✓ |
| niedokończone | < 20 punktów albo < 0,9 obrotu, 0 pkt (`:13`, `:87`, `:90`) | :125 | ✓ |
| za małe | r < 0,15, 0 pkt (`:11`, `:92`) | :126 | ✓ |
| wzór | `1000 × max(0, 1 − 4 × err/r)² × max(0, 1 − przerwa)`, przerwa ponad 3% obwodu (`:15`, `:17`, `:93-97`) | :127-128 | ✓ |
| wynik | int 0-1000, więcej lepiej (`:97`, `:146`) | :131 | ✓ |
| koniec | każdy ma 10 prób (`:144`, `:148`) | :133 | ✓ |
| `nonce` | losowy, tylko odróżnia partie (`:113`) | §1 :64 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. `KONCEPT.md` :119 zgodny z `ZASADY-GIER.md`.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | odstępstwo opisane (D-11): pusta lista, zostaje najlepsza dotychczasowa próba | `kolo.ts:157`; `ZASADY-GIER.md` :121-122; 01-01-CHECKS.md (0 przy samych timeoutach) |
| remis i solo bez zwycięzcy | ✓ | testy :157, :163; index.test.ts:107; `fuzz08.ts` (9 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts` |
| `ranked` / `places`, rekord zgodny | ✓ jeden komparator `byScore`, ale bez `ranked` | `kolo.ts:144-146`; `fuzz08.ts` (0 niezgodności); KO1 |
| pole odróżniające partie | ✓ `nonce` | `kolo.ts:113`; test :102 |
| sufit wyniku | ✓ 1000 w każdej partii, nic nie jest losowane | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ poza `ranked` (KO1); własne `mean` (:61) to jedna linia średniej bez pustej listy (`average` z `core.ts` daje `Infinity` przy pustej) | – |

Odstępstwa z powodem (D-11): `timeoutMove` nie daje najgorszego wyniku, tylko kończy próby (próby już oddane są prawdziwymi wynikami, więc limit ich nie kasuje;
powód wynika z zasady, wprost nie jest zapisany); limit liczony od nowa, gdy ktoś skończy próby (`ZASADY-GIER.md` :118, komentarz `kolo.ts:150-151`);
wynik liczony na serwerze z punktów, które klient może wygenerować kodem (`kolo.ts:104`, `ponytail:`); `playerView` zwraca cały stan (§1 :53-54).

#### KO1. Koło nie używa `ranked`
- Miejsce: `packages/games/src/kolo.ts:144-146` (`rankResults`, `rankPlaces` i `record` osobno, z jednym komparatorem `byScore`).
  `ranked` (`core.ts:95-106`) kończy partię, gdy każdy ma wynik (`rankResults`, `core.ts:71`), a w Kole `best` jest po pierwszej próbie, więc koniec musi zależeć od `waitingFor`.
- Źródło: `ZASADY.md` §3 :91 („Mini-gry używają `ranked`”) i :104. Wyjątek nie jest opisany w `ZASADY-GIER.md`.
- Historia: `81860c5` (2026-10-10) wprowadził `ranked` i przy okazji dał Kołu `rankPlaces`.
- Waga: **niska** (ranking i miejsca z jednego komparatora, `fuzz08.ts`: 0 niezgodności).
- Propozycja (popraw dokument): w `ZASADY-GIER.md` :133 „Koniec, gdy każdy ma 10 prób, więc gra nie używa `ranked` (ten kończy partię po pierwszym wyniku); ranking i miejsca z jednego komparatora”.
  Albo opcjonalny warunek końca w `ranked`.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Narysuj koło) | Test (`kolo.test.ts`) |
|---|---|
| limit 120 s przez `turn()`, od nowa tylko po końcu prób (:118) | :173 (klucz; liczba 120 nie wprost, porównanie z `game.turnSeconds`) |
| do 10 prób, liczy się najlepsza; punkty 0-1 (:119) | :105, :125, :114 |
| kropka na środku, ocena niezależna od położenia (:120) | :92 (kropka n/d: ekran) |
| ruch `points` 20-1000 w 0-1; pusta lista kończy próby, także po limicie (:121-122) | :112, :113, :114-115 (brzegi częściowo, KO4), :116, :136, :191 |
| klient woła `judge` przed wysłaniem (:123) | n/d (ekran) |
| zakładka obcinana, Kåsa (:124) | :45-47, :56 |
| niedokończone (< 0,9 obrotu, < 20 punktów) (:125) | :75, :79, :84; „< 20 punktów” w `judge` LUKA (KO9) |
| za małe (:126) | :88 |
| wzór, przerwa ponad 3% (:127-128) | :44, :49, :63, :68, :70, :90 (8% kosztuje); „3% za darmo” LUKA (KO9) |
| `circle`, kolorowanie (:129-130) | :56 (kolorowanie n/d: ekran) |
| wynik 0-1000, `best` i `worst` (:131) | :125-132, :116 |
| ekran końcowy (:132) | n/d (faza 2, 01-02) |
| koniec po 10 próbach każdego (:133) | :146, :163 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA | KO2 |
| Setup: kto zaczyna, rewanż | ✓ | :99-102 |
| Setup: ten sam seed to samo | LUKA | KO3 |
| Walidacja: spoza gry | ✓ | :104 |
| Walidacja: niedozwolony (11. próba) | ✓ | :109-110, :167 |
| Walidacja: po końcu | LUKA (częściowo: gracz po 10 próbach, :109) | KO5 |
| Walidacja: brzegi | LUKA (częściowo) | KO4 |
| Schemat | LUKA | KO6 |
| Koniec: wygrana każdego gracza | LUKA | KO7 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :157, :163, :154 ([B, A, C]); :141; index.test.ts:93 |
| Limit | ✓ | :191 (kształt); walidacja index.test.ts:72-73 (01-01 §4.2 Lim T) |
| Stan: brak mutacji, JSON | LUKA | KO8 |
| Mini-gra: zakres, drugi wynik, remis | ✓ | :112-115, :109, :157 |
| Mini-gra: wynik niecałkowity | n/d (wynik liczy serwer, `Math.round`, `kolo.ts:97`) | – |
| Mini-gra: solo bez zwycięzcy | ✓ (przez index.test.ts:107, n = 1; :136 tylko `waitingFor`) | 01-01 §4.2 |
| Mini-gra: rewanż daje inne wyzwanie | ✓ | :102 |
| Mini-gra: funkcja licząca na danych zepsutych (§2 :75-76 wymienia `kolo`) | ✓ | :84 (te same punkty, bez NaN), :79 (prosta kreska) |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### KO2. Definicja bez testu `[zbiorcze: definicja-swieza-gra]`
- Miejsce: brak w `kolo.test.ts` (`minPlayers`, `maxPlayers`, `turnSeconds` z `kolo.ts:108-110`; :176 porównuje `turn().seconds` z `game.turnSeconds`, nie z 120; świeżej gry nikt nie sprawdza).
- Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**. Zachowanie poprawne (`fuzz08.ts`).
- Propozycja: test „1-6 graczy, limit 120 s, świeża gra trwa” jak `kat.test.ts:26`.

#### KO3. Ten sam seed bez testu `[zbiorcze: setup-ten-sam-seed]`
- Miejsce: `kolo.test.ts:102` sprawdza tylko, że inny seed daje inny `nonce`. Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**.
- Propozycja: `expect(game.setup([A, B], createRng(1))).toEqual(s)` w teście :99.

#### KO4. Brzegi tylko z jednej strony `[zbiorcze: brzegi]`
- Miejsce: `kolo.test.ts:112-115` (5 punktów, 1001 punktów, 1,5, NaN); brak 19 / 20, 1000, współrzędnych 0 i 1 oraz tuż ponad 1.
  Walidacja poprawna (`fuzz08.ts`: 19 odrzucone, 20 i 1000 przechodzą, punkt (0, 1) przechodzi, 1,0001 odrzucone).
- Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**.
- Propozycja: `test.each` z 19 / 20 / 1000 / 1001 punktami i punktem (0, 1) / (1,0001, 0), jak `srodek.test.ts:88-95`.

#### KO5. Ruch po końcu gry bez testu `[zbiorcze: po-koncu]`
- Miejsce: `kolo.test.ts:109-110` odrzuca 11. próbę gracza, który skończył, ale nie ruch po `isOver`. Walidacja ma jeden warunek na gracza (`kolo.ts:117`), więc zachowanie jest poprawne.
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia** (D-03).
- Propozycja: na końcu :146 `expect(game.validateMove(s, B, result([]))).toBe(false)`.

#### KO6. Schemat bez testu `[zbiorcze: schemat-smieci]`
- Miejsce: `kolo.test.ts` nie woła `moveSchema`; NaN :115 odrzuca `validateMove`. Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia**.
- Propozycja: blok „schemat” jak `srodek.test.ts:101-110` (brak `points`, punkt `["0.5", 0.5]`, punkt z jedną liczbą, 1001 punktów, zły `type`).

#### KO7. Wygrana tylko jednego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `kolo.test.ts:146-155` (wygrywa B). Źródło: `ZASADY.md` §2 Koniec gry (:64). Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

#### KO8. Mutacja i JSON bez testu `[zbiorcze: stan-mutacja-json]`
- Miejsce: brak w `kolo.test.ts` i index.test.ts (01-01 §4.2 St1 N, St2 N). Zachowanie poprawne (01-01-CHECKS.md, `fuzz08.ts`). Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: test jak `kat.test.ts:130`, z próbą i pustą listą.

#### KO9. „Przerwa do 3% za darmo” i „mniej niż 20 punktów” w `judge` bez testu
- Miejsce: `kolo.ts:15`, `:96` (3% obwodu przerwy bez kary) i `:87` (< 20 punktów: `unfinished`); `kolo.test.ts:90` sprawdza tylko, że 8% kosztuje, a :112 odrzuca 5 punktów w walidacji, nie w `judge`.
  Klient woła `judge` przed wysłaniem (`ZASADY-GIER.md` :123), więc próg 20 punktów działa też na ekranie.
- Źródło: `ZASADY.md` §2 „każda zasada z sekcji” (:63); `ZASADY-GIER.md` :125, :128. Waga: **średnia** (stała odczuwalna: decyduje, czy niedomknięte koło traci punkty).
- Propozycja: test „przerwa 2% nie kosztuje” (`circle({ turns: 0.98 })` w granicy 1-2 pkt od `circle()`) i `judge` 19 punktów idealnego okręgu = `unfinished`.

## Odcień (`kolor`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Odcień (:135-146). Opis w `KONCEPT.md` §2: ✓ §2.4 (:120). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 180 s (`kolor.ts:78-80`) | tabela :24 | ✓ (też `KONCEPT.md` §3 :233) |
| kolory, pokaz | `COUNT = 5`, `SHOW_MS = 2000` (`:4`, `:6`) | :136 | ✓ (też `KONCEPT.md` :120) |
| suwaki | H 0-359, S i B 0-100, int (`:71-72`) | :136, :138 | ✓ |
| cele | H 0-359, S 25-100, B 30-100 (`:89`) | :137 | ✓ |
| wynik | ΔE CIE76 w Lab (D65), każda ucięta do 100 (`:37-54`), suma × 10 zaokrąglona (`:98`, `:101`), mniej lepiej (`:108`) | :138-139 | ✓ |
| limit czasu | pusta lista = 5 × 100 (`:98`, `:112`) | :140 | ✓ najgorszy możliwy (każda odpowiedź ucięta do 100) |
| podpowiedzi | progi 8 / 10 / 10°, kierunek do najbliższej barwy podstawowej (`:59-69`) | :143 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. Ekran (:141-146) poza zakresem (faza 2).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 5000; najgorsza uczciwa odpowiedź też najwyżej 5000 | 01-01-CHECKS.md; `fuzz08.ts` (limit − najgorszy ≥ 163) |
| remis i solo bez zwycięzcy | ✓ | test :85; index.test.ts:107; `fuzz08.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts` |
| `ranked` / `places`, rekord zgodny | ✓ | `kolor.ts:108`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `targets` | test :38 |
| sufit wyniku | ✓ litera (0 w każdej partii), ✗ trudność z losowania | W8b |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2); własne `int` (:26) to jedna linia losowania, w `core.ts` nie ma odpowiednika (jak w Liczeniu, 01-07) | – |

Odstępstwa z powodem (D-11): cele w widoku od startu (`kolor.ts:74`, `ponytail:`, §1 :53-54).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Odcień) | Test (`kolor.test.ts`) |
|---|---|
| 5 kolorów, 2 s, suwaki H 0-359, S i B 0-100 (:136) | :24-25, :52-59 (pokaz n/d: ekran) |
| cele bez szarych i czarnych (:137) | :28-36 |
| ruch z 5 kolorami int; ΔE CIE76, ucięta do 100, dziesiąte, mniej lepiej (:138-139) | :42-46, :58, :66, :75 |
| pusta lista = 5 × 100 (:140) | :66, :92 |
| ekran, porównanie, podpowiedzi z progami (:141-144) | :98-116 (podpowiedzi; brzegów progów 8 / 10 nikt nie sprawdza, ale nie wpływają na wynik); ekran n/d |
| tabela wyników w % (:145-146) | n/d (ekran, faza 2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA (świeża gra częściowo: :78) | OD1 |
| Setup: kto zaczyna, inne seedy | ✓ | :37, :38 |
| Setup: ten sam seed to samo | LUKA | OD2 |
| Walidacja: spoza gry, drugi wynik | ✓ | :60, :61 |
| Walidacja: po końcu | LUKA | OD3 |
| Walidacja: brzegi | LUKA (częściowo: 360, −1, 101 odrzucone; 0 / 359 / 100 nie sprawdzone jako przechodzące) | OD4 |
| Schemat | LUKA | OD5 |
| Koniec: wygrana każdego gracza | LUKA (częściowo: A :72, B :82, C nigdy) | OD6 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :85, :82; index.test.ts:93 |
| Limit | ✓ | :92 (kształt); index.test.ts:72-73 |
| Stan: brak mutacji, JSON | LUKA | OD7 |
| Mini-gra: zakres, niecałkowity, drugi, remis | ✓ | :55-58 (ułamek :58), :61, :85 |
| Mini-gra: solo, rewanż | ✓ | index.test.ts:107; :38 |
| Mini-gra: funkcja licząca (§2 :75-76 wymienia `kolor`) | ✓ | :42-46 (krańce: ten sam, czarny-biały, zawijanie barwy, ucięcie); śmieci odcina walidacja :52-59 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### OD1. Definicja bez testu `[zbiorcze: definicja-swieza-gra]`
- Miejsce: brak w `kolor.test.ts` (`kolor.ts:78-80`). Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:26`, z limitem 180 s.

#### OD2. Ten sam seed bez testu `[zbiorcze: setup-ten-sam-seed]`
- Miejsce: `kolor.test.ts:38` sprawdza tylko inny seed. Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**.
- Propozycja: `expect(game.setup([A, B], createRng(1))).toEqual(s)` w teście :24.

#### OD3. Ruch po końcu bez testu `[zbiorcze: po-koncu]`
- Miejsce: brak w `kolor.test.ts` (:66, :75, :85 kończą partię bez próby ruchu). Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:68`.

#### OD4. Brzegi tylko z jednej strony `[zbiorcze: brzegi]`
- Miejsce: `kolor.test.ts:55-57`; brak „H 0 i 359, S i B 0 i 100 przechodzą” i H −1. Walidacja poprawna (`kolor.ts:72`). Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**.
- Propozycja: test „krańce suwaków przechodzą” jak `kat.test.ts:62`.

#### OD5. Schemat bez testu `[zbiorcze: schemat-smieci]`
- Miejsce: `kolor.test.ts` nie woła `moveSchema`. Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia**.
- Propozycja: blok „schemat” jak `srodek.test.ts:101-110` (brak `guesses`, `h: "0"`, kolor bez `b`, 6 kolorów, zły `type`).

#### OD6. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `kolor.test.ts:72` (A), `:82` (B); C nie wygrywa nigdzie. Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

#### OD7. Mutacja i JSON bez testu `[zbiorcze: stan-mutacja-json]`
- Miejsce: brak w `kolor.test.ts` i index.test.ts. Zachowanie poprawne (01-01-CHECKS.md, `fuzz08.ts`). Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:130`.

## Policz kropki (`kropki`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Policz kropki (:148-158). Opis w `KONCEPT.md` §2: ✓ §2.4 (:121, :147). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s, `turn()` ze stałym kluczem (`kropki.ts:32`, `:48-52`) | tabela :25, :155 | ✓ (też `KONCEPT.md` §3 :234) |
| rundy, kropki | 10 rund, 8-40 kropek, odstęp ≥ 0,08 (`:4-6`, `:12`, `:35-42`) | :149 | ✓ (też `KONCEPT.md` :121) |
| pokaz | `SHOW_MS = 1500` (`:10`) | :149 | ✓ |
| suma | `TOTAL = 240` przez `withSum` (`:8`, `:60`) | :150 | ✓ |
| ruch, wynik | 10 int 0-99 (`:71`); suma \|odpowiedź − liczba\| (`:78`), mniej lepiej (`:84`) | :151, :153 | ✓ |
| limit czasu | pusta lista = same zera = 240 (`:78`, `:88`) | :152 | ✓ wobec dokumentu, ✗ wobec §3 (W8a) |
| `progress` | `done` int 1-9, nie zmienia `waitingFor` ani klucza (`:66-70`, `:75`) | :154-155 | ✓ |

Rozbieżności kod ↔ dokumenty: brak; dokument i kod razem łamią §3 (W8a). Margines kropek 0,05 od krawędzi (`:13`) nieopisany, nieodczuwalny (D-07), bez wpisu.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✗ 240, najgorszy uczciwy 750 | W8a |
| remis i solo bez zwycięzcy | ✓ | test :87; index.test.ts:107; `fuzz08.ts` (26 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts` (z 4188 ruchami `progress`) |
| `ranked` / `places`, rekord zgodny | ✓ | `kropki.ts:84`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `rounds` | test :43 |
| sufit wyniku | ✓ stała suma 240 (§3 :101 wymienia tę grę) | `kropki.ts:60`; test :46 |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked`, `withSum`; szkielet wspólny z Kątem i Który rok? skopiowany | W8c |

Odstępstwa z powodem (D-11): kropki w widoku od startu (`kropki.ts:44`, `ponytail:`); `progress` może spaść po odświeżeniu (`ZASADY-GIER.md` :155).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Policz kropki) | Test (`kropki.test.ts`) |
|---|---|
| 10 rund, 8-40 kropek bez nakładania, 1,5 s (:149) | :24 (pokaz n/d: ekran) |
| razem zawsze 240 (:150) | :46 |
| ruch 10 int 0-99, suma \|odpowiedź − liczba\| (:151) | :54-60, :76 |
| pusta lista = same zera (:152) | :67, :94 |
| bez tolerancji, w obie strony tak samo (:153) | :76-83 |
| `progress` 1-9, podgląd, nie odnawia limitu, może spaść (:154-155) | :100-133 |
| ekran (:156-158) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | LUKA (świeża gra częściowo: :79; :131 porównuje z `game.turnSeconds`) | KR1 |
| Setup: kto zaczyna, inne seedy | ✓ | :42, :43 |
| Setup: ten sam seed to samo | LUKA | KR2 |
| Walidacja: spoza gry, drugi wynik, `progress` po wyniku | ✓ | :61, :62, :127-128 |
| Walidacja: po końcu | LUKA | KR4 |
| Walidacja: brzegi | LUKA (częściowo: odpowiedzi −1 i 100 odrzucone, 0 i 99 nie sprawdzone; `progress` 0 / 1 / 9 / 10 ✓ :112, :119, :122-126) | KR3 |
| Schemat | ✓ | :135-143 |
| Koniec: wygrana każdego gracza | LUKA (częściowo: A :73, B :84) | KR5 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :87, :84; index.test.ts:93 |
| Limit | ✓ | :94; index.test.ts:72-73; najgorszy wynik ✗ (W8a) |
| Stan: brak mutacji, JSON | LUKA (częściowo: :108 tylko po `progress`) | KR6 |
| Mini-gra: zakres, niecałkowity, drugi, remis | ✓ | :57-59, :62, :87 |
| Mini-gra: solo, rewanż | ✓ | index.test.ts:107; :43 |
| Mini-gra: funkcja licząca (§2 :75-76 wymienia `kropki`) | ✓ | :67, :76 (liczenie wbudowane w `applyMove`; śmieci odcina walidacja :54-60) |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

#### KR1. Definicja bez testu `[zbiorcze: definicja-swieza-gra]`
- Miejsce: brak w `kropki.test.ts` (`kropki.ts:48-50`). Źródło: `ZASADY.md` §2 Definicja (:54). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:26`.

#### KR2. Ten sam seed bez testu `[zbiorcze: setup-ten-sam-seed]`
- Miejsce: `kropki.test.ts:43` sprawdza tylko inny seed. Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:48`.

#### KR3. Brzegi odpowiedzi tylko z jednej strony `[zbiorcze: brzegi]`
- Miejsce: `kropki.test.ts:57-58`; brak „0 i 99 przechodzą”. Źródło: `ZASADY.md` §2 Walidacja (:61). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:62`.

#### KR4. Ruch po końcu bez testu `[zbiorcze: po-koncu]`
- Miejsce: brak w `kropki.test.ts` (:128 sprawdza `progress` po własnym wyniku, nie po końcu gry). Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:68`.

#### KR5. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `kropki.test.ts:73` (A), `:84` (B). Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

#### KR6. Mutacja po wyniku i JSON bez testu `[zbiorcze: stan-mutacja-json]`
- Miejsce: `kropki.test.ts:108` sprawdza niezmieniony stan tylko po `progress`; po wyniku i round-trip JSON brak. Zachowanie poprawne (`fuzz08.ts`).
  Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:130`.

## Kąt (`kat`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Kąt (:160-171). Opis w `KONCEPT.md` §2: ✓ §2.4 (:122, :147). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s, `turn()` ze stałym kluczem (`kat.ts:31`, `:41-45`) | tabela :36, :169 | ✓ (też `KONCEPT.md` §3 :234) |
| rundy, pokaz | 10, `SHOW_MS = 1500` (`:4`, `:11`) | :162 | ✓ |
| runda | `angle` int 5-175, `rotation` int 0-359 (`:6-7`, `:53`) | :163-164 | ✓ (też `KONCEPT.md` :122) |
| ruch, wynik | 10 int 0-180 (`:9`, `:64`); suma \|odpowiedź − kąt\| (`:73`), mniej lepiej | :165 | ✓ |
| limit czasu | `max(kąt, 180 − kąt)` w każdej rundzie (`:34`, `:73`) | :166-167 | ✓ najgorszy możliwy (też `KONCEPT.md` :122) |
| `progress` | `done` int 1-9 (`:63`, `:68`) | :168-169 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ (najgorszy zależy od losowania, 01-01-CHECKS.md) | test :88; `fuzz08.ts` (limit = najgorszy uczciwy) |
| remis i solo bez zwycięzcy | ✓ | testy :111, :118; `fuzz08.ts` (22 remisy) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :130 |
| `ranked` / `places`, rekord zgodny | ✓ | `kat.ts:80`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `rounds` | test :49 |
| sufit wyniku | ✓ litera, ✗ trudność z losowania (założenie) | W8b |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked`; szkielet skopiowany z Policz kropki | W8c |

Odstępstwa z powodem (D-11): kąty w widoku od startu (`kat.ts:36`, `ponytail:`); `progress` może spaść (`ZASADY-GIER.md` :169).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Kąt) | Test (`kat.test.ts`) |
|---|---|
| 10 rund, 1,5 s (:162) | :34 (pokaz n/d: ekran) |
| runda `{ angle, rotation }`, zakresy, te same dla wszystkich (:163-164) | :33-47 |
| ruch 10 int 0-180, suma, bez tolerancji (:165) | :55-65, :96-109 |
| pusta lista = najgorszy błąd w każdej rundzie (:166-167) | :77, :88 |
| `progress` (:168-169) | :139-172 |
| ekran (:170-171) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `kat.test.ts` (definicja :26; setup :30, :48-49; walidacja :55-73 z brzegami 0 / 180 / −1 / 181 :62 i po końcu :68;
`progress` brzegi :161-165, :151, :158; schemat :174; koniec z wygraną każdego :96, remisem :111, solo :118, `waitingFor` :85; limit z walidacją :123; stan :130;
mini-gra: rewanż :49, niecałkowity :60, rekord index.test.ts:168, :190). Bez wpisów poza W8b i W8c.

## Który rok? (`rok`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Który rok? (:173-187). Opis w `KONCEPT.md` §2: ✓ §2.4 (:125, :147). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 240 s, `turn()` ze stałym kluczem (`rok.ts:29-30`, `:212-216`) | tabela :26, :181, :183 | ✓ (też `KONCEPT.md` §3 :233) |
| rundy, zakres | 10, 1900-2025 (`:4-6`) | :174 | ✓ (też `KONCEPT.md` :125) |
| pula | 165 wydarzeń w czterech działach (`:37-206`, nagłówki :38, :71, :109, :152), lata 1903-2023, 10 różnych przez `shuffle` (`:224`) | :175-177 („ok. 160”) | ✓ |
| ruch, wynik | 10 int 1900-2025 (`:235`); suma \|odpowiedź − rok\| (`:244`) | :178 | ✓ |
| limit czasu | `max(rok − 1900, 2025 − rok)` w każdej rundzie (`:33`, `:244`) | :179 | ✓ najgorszy możliwy |
| runda | 20 s, odsłona 2,5 s (`:8`, `:10`; ekran `Rok.tsx:59`, `:86`, `:97`) | :180-181, :185 | ✓ (też `KONCEPT.md` :125) |
| `progress` | `done` int 1-9 (`:234`, `:239`) | :182-183 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | test :87-98; `fuzz08.ts` (limit = najgorszy uczciwy) |
| remis i solo bez zwycięzcy | ✓ | test :115; `fuzz08.ts` (27 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :126 |
| `ranked` / `places`, rekord zgodny | ✓ | `rok.ts:251`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `events` | test :46 |
| sufit wyniku | ✓ litera; trudność zależy od wiedzy, stała suma by jej nie wyrównała | W8b (bez wpisu dla tej gry) |
| limit wobec najdłuższej partii | ✓ 225 s z 240 s | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle`; szkielet skopiowany | W8c |

Odstępstwa z powodem (D-11): lata w widoku od startu (`rok.ts:208`, `ponytail:`); `progress` może spaść (`ZASADY-GIER.md` :183).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Który rok?) | Test (`rok.test.ts`) |
|---|---|
| 10 rund, suwak 1900-2025 (:174) | :29-30, :64-78 |
| pula: cztery działy, tekst bez czterocyfrowej liczby, 10 różnych, te same dla wszystkich (:175-177) | :31 (≥ 100), :35, :38, :50-57; działy n/d (dane) |
| ruch 10 int, suma (:178) | :64-70, :87-113 |
| pusta lista = najgorszy błąd (:179) | :87-98 |
| limit rundy 20 s na kliencie, limit 240 s (:180-181) | :24 (240 s); runda n/d (ekran) |
| `progress` (:182-183) | :138-165 |
| ekran, ekran końcowy (:184-187) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: pokryte w `rok.test.ts` (definicja :24; setup :43-47; walidacja :64-83 z brzegami 1899 / 1900 / 2025 / 2026 :67-68, :75 i po końcu :79;
`progress` :151-160; schemat :167; koniec :87, :101, :115; limit z walidacją :126; stan :126-135; mini-gra: rewanż :46, niecałkowity :69, rekord index.test.ts:168, :190).
Jedyna luka: RK1.

#### RK1. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `rok.test.ts:98` (A), `:111` (B); C nie wygrywa nigdzie. Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

## Środek (`srodek`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Środek (:189-212). Opis w `KONCEPT.md` §2: ✓ §2.4 (:126). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 60 s (`srodek.ts:81-83`) | tabela :27 | ✓ (też `KONCEPT.md` §3 :233 „60 s w większości gier”); zapas wątpliwy (SR1) |
| rundy | 10 (`:4`) | :190 | ✓ |
| odcinki | kąt dowolny, długość 0,5-0,9, końce ≥ 0,05 od krawędzi, środek losowy (`:18-20`, `:66-75`) | :191 | ✓ (też `KONCEPT.md` :126) |
| ruch | 10 punktów w ułamkach pola (`:27`, `:98`) | :194 | ✓ |
| błąd | rzut na prostą, \|t − 0,5\| × 100, w bok bez kosztu (`:43-56`) | :195-197 | ✓ |
| strefa akceptacji | ≤ 60 umownych px od odcinka, pole 300 px, także za końcami (`:6`, `:13`, `:59-62`, `:98`); serwer odrzuca cały ruch | :198-201 | ✓ (też `KONCEPT.md` :126) |
| wynik | suma × 10 zaokrąglona, mniej lepiej (`:101`, `:104`) | :202 | ✓ |
| najgorszy uczciwy | 50% + 60 / 150 px = 90% na rundę | :202-203 | ✓ |
| limit czasu | pusta lista = 10 × 100% (`:8`, `:101`) | :204 | ✓ najgorszy możliwy |
| odsłona | 1 s (`Srodek.tsx:14`) | :208 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

#### SR1. Limit 60 s bez wyliczenia zapasu, a 10 s zabierają same odsłony
- Gra: `srodek`. Miejsce: `packages/games/src/srodek.ts:83` (`turnSeconds: 60`); ekran `apps/web/src/games/Srodek.tsx:14` (`REVEAL_MS = 1000` po każdej z 10 rund),
  bez limitu rundy. Na celowanie zostaje średnio 5 s na odcinek, a od `09a2822` (2026-10-10) punkt można przytrzymać i przesuwać (`ZASADY-GIER.md` :205-207),
  co wydłuża rundę. Po limicie gracz traci cały wynik (10 × 100%).
- Źródło: `ZASADY.md` §3 :106 („w mini-grze tyle, ile trwa najdłuższa uczciwa partia plus zapas”). Inne gry tej paczki mają 10-36 s na rundę (tabela w „Metoda”).
- Historia: 60 s od pierwszej wersji (`9636306`, 2026-10-10: jedno stuknięcie na rundę); przytrzymanie i przesuwanie doszły tego samego dnia, limit został.
- Waga: **średnia** (stała możliwie niezgodna z §3; nie zmierzona, więc bez dowodu przekroczenia; jeśli pomiar pokaże przekroczenie, wysoka jak ZK1).
- Propozycja (pomiar w fazie 3, potem popraw kod i dokument): zmierzyć czas powolnej partii z przesuwaniem; jeśli zbliża się do 50 s, limit 90 s
  (tabela `ZASADY-GIER.md` :27, `KONCEPT.md` §3 :233-234, test `srodek.test.ts:39`).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 10000 wobec najgorszego uczciwego ≤ 9000 | test :151, :195; `fuzz08.ts` |
| remis i solo bez zwycięzcy | ✓ | testy :183, :190; `fuzz08.ts` |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :159-169 |
| `ranked` / `places`, rekord zgodny | ✓ | `srodek.ts:111`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `segments` | test :78 |
| sufit wyniku | ✓ błąd względny, każda runda waży tyle samo (`ZASADY-GIER.md` :196) | test :123 |
| limit wobec najdłuższej partii | ? | SR1 |
| wspólne funkcje `core.ts` | ✓ `ranked` | – |

Odstępstwa z powodem (D-11): odcinki w widoku od startu (`srodek.ts:77`, `ponytail:`); strefa w px, nie w % (`ZASADY-GIER.md` :198, powód: dotyczy palca).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Środek) | Test (`srodek.test.ts`) |
|---|---|
| 10 rund, odcinek pod losowym kątem (:190) | :46-74 |
| długość 0,5-0,9, końce w marginesie, środek losowy (:191-193) | :46-74 |
| ruch 10 punktów w ułamkach pola (:194) | :85-99 |
| rzut, błąd w % długości, w bok bez kosztu (:195-197) | :113-139 |
| strefa 60 px, także za końcami, serwer odrzuca cały ruch (:198-201) | :88-95, :142-150 |
| wynik w dziesiątych, najgorszy uczciwy 90% (:202-203) | :151-155, :172-181 |
| pusta lista = 10 × 100% (:204) | :159, :195 |
| ekran, ekran końcowy (:205-212) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: pokryte w `srodek.test.ts` (definicja :39; setup :75-78; walidacja :85-99 z brzegami strefy :88-95; schemat :101; koniec :159, :172, :183, :190;
limit z walidacją :195; stan :161-169; mini-gra: rewanż :78, NaN :90, rekord index.test.ts:168, :190). Luki: SR2, SR3.

#### SR2. Ruch po końcu bez testu `[zbiorcze: po-koncu]`
- Miejsce: brak w `srodek.test.ts` (:98 tylko drugi wynik). Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia**.
- Propozycja: jak `kat.test.ts:68`.

#### SR3. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `srodek.test.ts:167` (A), `:180` (B). Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96` albo trzeci przypadek jak `mapa.test.ts:206`.

## Mapa (`mapa`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Mapa (:375-393). Opis w `KONCEPT.md` §2: ✓ §2.4 (:134). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 180 s (`mapa.ts:63-65`) | tabela :35, :388 | ✓ (też `KONCEPT.md` §3 :233) |
| rundy, pula | 10 różnych z `CITIES` przez `shuffle` (`:5`, `:73`); pula 62 miasta (`mapa-dane.ts`) | :376-379 | ✓ (też `KONCEPT.md` :134 „62”) |
| pole, odwzorowanie | `BOUNDS` 13,9-24,3°E, 48,9-54,95°N, liniowo, `ASPECT` z cos 52° (`:7`, `:17`, `:37-45`) | :380-382 | ✓ |
| ruch | 10 punktów w 0-1, punkt poza polem odrzuca ruch (`:57`, `:79`) | :383, :386 | ✓ |
| błąd | haversine, R = 6371, zaokrąglony do km w każdej rundzie (`:10`, `:48-54`) | :384-385 | ✓ |
| limit czasu | 10 × 1000 km (`:9`, `:83`) | :387 | ✓ najgorszy możliwy (przekątna pola < 1000 km, test :126) |
| kontur | 126 punktów (`OUTLINE`, `mapa-dane.ts`) | :389 | ✓ |
| odsłona | 1,5 s (`Mapa.tsx:14`) | :391 | ✓ (też `KONCEPT.md` :134) |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | test :126, :226; `fuzz08.ts` (zapas ≥ 2486 km) |
| remis i solo bez zwycięzcy | ✓ | testy :214, :221 |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :175-185 |
| `ranked` / `places`, rekord zgodny | ✓ | `mapa.ts:89`; `fuzz08.ts` |
| pole odróżniające partie | ✓ `cities` | test :62 |
| sufit wyniku | ✓ litera; trudność zależy od wiedzy (W8b, bez wpisu) | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle` | – |

Odstępstwa z powodem (D-11): miasta ze współrzędnymi w widoku od startu (`mapa.ts:59`, `ponytail:`); zniekształcenie rysunku do 6% (`ZASADY-GIER.md` :381-382, `mapa.ts:14-15`).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Mapa) | Test (`mapa.test.ts`) |
|---|---|
| 10 rund, kontur bez rzek (:376) | :47-48 (kontur n/d: ekran) |
| 10 różnych z puli 62, te same dla wszystkich (:377-379) | :47-63, :66-69 (≥ 50; dobór miast n/d: dane) |
| `BOUNDS`, odwzorowanie, `ASPECT` (:380-382) | :93-113 |
| ruch 10 punktów, wynik na serwerze (:383) | :134-160 |
| haversine, zaokrąglenie każdej rundy, suma (:384-385) | :116-125, :188-204 |
| poza konturem ważny, poza polem odrzuca ruch (:386) | :141-152 |
| pusta lista = 10 × 1000 km (:387) | :126-131, :175, :226 |
| limit 180 s (:388) | :40 |
| kontur w polu (:389) | :77-90 |
| ekran, ekran końcowy (:390-393) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: wszystkie punkty pokryte w `mapa.test.ts` (definicja :40; setup :59-62; walidacja :138-160 z brzegami pola :141-151 i po końcu :159; schemat :162;
koniec z wygraną A :183, B :196, C :211, remisem :214, solo :221, `waitingFor` :184; limit z walidacją :226; stan :175-185; mini-gra: rewanż :62, rekord index.test.ts:168, :190). Bez wpisów.

## Tort (`tort`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Tort (:459-477). Opis w `KONCEPT.md` §2: ✓ §2.4 (:139). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 120 s (`tort.ts:40-42`) | tabela :41 | ✓ (też `KONCEPT.md` §3 :234) |
| torty | `PIECES` 3-7 potasowane, każda raz; gotowe cięcie int 0-359 (`:5-6`, `:50`) | :460-462 | ✓ (też `KONCEPT.md` :139) |
| ruch | 5 list, i-ta ma `pieces − 1` kątów 0 ≤ kąt < 360, niecałkowite dozwolone (`:45`, `:57`) | :463-464 | ✓ |
| błąd | odstępy po okręgu z gotowym, suma \|kawałek − 360/n\| / 2 w % (`:30-34`); kolejność bez znaczenia, dwa cięcia w jednym miejscu dozwolone | :465-467 | ✓ |
| najgorszy uczciwy | (n − 1)/n, przy 7 kawałkach 85,7% | :468 | ✓ (to maksimum funkcji `error`) |
| wynik | suma × 10 zaokrąglona, mniej lepiej (`:60`, `:63`, `:70`) | :469 | ✓ |
| limit czasu | 5 × 100% (`:8`, `:60`) | :470 | ✓ najgorszy możliwy (najgorsza uczciwa partia 390,7%) |
| bez `progress` | jeden typ ruchu (`:14`) | :471 | ✓ |
| odsłona | 1,5 s (`Tort.tsx:14`) | :475 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | testy :130-135, :176; `fuzz08.ts` (zapas 1093) |
| remis i solo bez zwycięzcy | ✓ | testy :164, :171 |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :139-149 |
| `ranked` / `places`, rekord zgodny | ✓ | `tort.ts:70`; test :161; `fuzz08.ts` |
| pole odróżniające partie | ✓ `cakes` | test :64 |
| sufit wyniku | ✓ każda liczba kawałków raz w partii | `tort.ts:50`; test :49 |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked`, `shuffle` | – |

Odstępstwa z powodem (D-11): torty w widoku od startu (`tort.ts:36`, `ponytail:`).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Tort) | Test (`tort.test.ts`) |
|---|---|
| 5 tortów, 3-7 potasowane, gotowe cięcie int (:460-462) | :42-60 |
| `pieces − 1` cięć, 0 ≤ kąt < 360, niecałkowite (:463-464) | :72-87 |
| błąd tortu, kolejność bez znaczenia, dwa cięcia w jednym miejscu (:465-467) | :110-129, :86 |
| najgorszy uczciwy (n − 1)/n (:468) | :130 |
| wynik w dziesiątych (:469) | :152-161 |
| pusta lista = 5 × 100% (:470) | :139, :176 |
| bez `progress` (:471) | n/d (brak typu ruchu; schemat :97-107 odrzuca inne) |
| ekran, ekran końcowy (:472-477) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: pokryte w `tort.test.ts` (definicja :34; setup :61-64; walidacja :72-95 z brzegami 0 / 359,99 / −0,1 / 360 :77-84 i po końcu :91; schemat :97;
koniec :139, :152, :164, :171; limit z walidacją :176; stan :141-149; mini-gra: rewanż :64, rekord index.test.ts:168, :190). Jedyna luka: TR1.

#### TR1. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `tort.test.ts:147` (A), `:160`, `:184` (B). Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

## Nożyczki (`nozyczki`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Nożyczki (:524-545). Opis w `KONCEPT.md` §2: ✓ §2.4 (:142). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 60 s (`nozyczki.ts:98-100`) | tabela :44 | ✓ (też `KONCEPT.md` §3 :233) |
| kształty | 5, 64 wierzchołki, zaokrąglone do 3 miejsc (`:4`, `:6`, `:88-89`) | :525-526 | ✓ |
| promień | baza 0,20-0,26 × (1 + cztery fale, amplitudy 0,08-0,16) (`:20-24`, `:76-83`); suma amplitud < 1, więc bez samoprzecięć | :527-528 | ✓ (amplitudy nieopisane, nieodczuwalne wprost, D-07) |
| położenie | losowe przesunięcie z marginesem 0,05 (`:8`, `:85-87`) | :529 | ✓ (też `KONCEPT.md` :142) |
| cięcie | prosta przez `a` i `b`, przedłużona (`:48-62`); strony prostej się sumują | :531-533 | ✓ |
| błąd | \|udział − 50%\| w p.p., kierunek bez znaczenia (`:65-68`) | :534 | ✓ |
| odpowiedź | `MIN_CUT` 0,05, `MIN_PART` 1%; serwer odrzuca cały ruch (`:10-12`, `:71-74`, `:111`) | :535-537 | ✓ (też `KONCEPT.md` :142) |
| wynik | suma × 10 zaokrąglona (`:114`, `:117`) | :538 | ✓ |
| limit czasu | 5 × 50 p.p. (`:14`, `:114`) | :539 | ✓ najgorszy możliwy (każde przyjęte cięcie ≤ 49 p.p.) |
| bez `progress` | jeden typ ruchu (`:32`) | :540 | ✓ |
| odsłona | 1,5 s (`Nozyczki.tsx:14`) | :543 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. Punkty cięcia poza polem są przyjmowane (test :159, „palec zjechał z kafla”); dokument tego nie mówi, ale to szczegół techniczny bez wpływu na wynik (D-07), bez wpisu.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ | testy :143, :221; `fuzz08.ts` (zapas 60 przy cięciu 1,2%) |
| remis i solo bez zwycięzcy | ✓ | testy :209, :216 |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz08.ts`; test :184-194 |
| `ranked` / `places`, rekord zgodny | ✓ | `nozyczki.ts:124`; test :206; `fuzz08.ts` |
| pole odróżniające partie | ✓ `shapes` | test :81 |
| sufit wyniku | ✓ błąd względny wobec pola kształtu | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` | – |

Odstępstwa z powodem (D-11): kształty w widoku od startu (`nozyczki.ts:94`, `ponytail:`).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Nożyczki) | Test (`nozyczki.test.ts`) |
|---|---|
| 5 kształtów, 64 wierzchołki, 3 miejsca (:525-526) | :52-68 |
| gładkie, losowy rozmiar, bez symetrii (:527-528) | :74-75 (rozmiar), :77 (środek kafla nie trafia w połowę); symetria wprost LUKA, ale :77 pośrednio |
| losowe przesunięcie w marginesie (:529) | :61-65, :77 |
| prosta przez `a` i `b`, przedłużona (:531) | :96-97 |
| `split`, `share`, strony się sumują (:532-533) | :104-119 |
| błąd \|udział − 50\|, kierunek bez znaczenia (:534) | :90-103, :120-123 |
| `MIN_CUT`, `MIN_PART`, odrzucenie całego ruchu (:535-537) | :126-145, :154-155 |
| wynik w dziesiątych (:538) | :197-206 |
| pusta lista = 5 × 50 (:539) | :184, :221 |
| bez `progress` (:540) | n/d (schemat :170 odrzuca inne typy) |
| ekran, ekran końcowy (:541-545) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2: pokryte w `nozyczki.test.ts` (definicja :44; setup :78-81; walidacja :151-168 z brzegami `MIN_CUT` i `MIN_PART` :130-142 i po końcu :164; schemat :170;
koniec :184, :197, :209, :216; limit z walidacją :221; stan :186-194; mini-gra: rewanż :81, NaN :156, rekord index.test.ts:168, :190). Jedyna luka: NZ1.

#### NZ1. Wygrana nie każdego gracza `[zbiorcze: wygrana-kazdego]`
- Miejsce: `nozyczki.test.ts:192` (A), `:205`, `:229` (B). Źródło: `ZASADY.md` §2 Koniec gry (:64), D-03. Waga: **średnia**.
- Propozycja: `test.each([A, B, C])` jak `kat.test.ts:96`.

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| W8a | kropki | średnia (W7a wysoka) | `timeout-nie-najgorszy` |
| W8b | kolor, kat | średnia | `trudnosc-z-losowania` (z W6a, LC1) |
| SR1 | srodek | średnia (do pomiaru) | – |
| KO9 | kolo | średnia | – |
| KO2, OD1, KR1 | kolo, kolor, kropki | średnia | `definicja-swieza-gra` |
| KO3, OD2, KR2 | kolo, kolor, kropki | średnia | `setup-ten-sam-seed` |
| KO4, OD4, KR3 | kolo, kolor, kropki | średnia | `brzegi` |
| KO5, OD3, KR4, SR2 | kolo, kolor, kropki, srodek | średnia | `po-koncu` |
| KO6, OD5 | kolo, kolor | średnia | `schemat-smieci` |
| KO7, OD6, KR5, RK1, SR3, TR1, NZ1 | kolo, kolor, kropki, rok, srodek, tort, nozyczki | średnia | `wygrana-kazdego` |
| KO8, OD7, KR6 | kolo, kolor, kropki | średnia | `stan-mutacja-json` |
| KO1 | kolo | niska | – |
| W8c | kropki, kat, rok | niska | – |

Brak wpisów o wysokiej wadze w tej paczce (SR1 może nią zostać po pomiarze).

Odstępstwa z powodem (D-11), sprawdzone: wyzwanie w widoku od startu (wszystkie 9, komentarze `ponytail:`), `playerView` z całym stanem (wszystkie),
wynik Koła z punktów, które klient może wygenerować (`kolo.ts:104`), limit w Kole kończy próby zamiast dawać najgorszy wynik i liczy się od nowa po końcu prób innego gracza,
strefa akceptacji Środka w px, zniekształcenie rysunku Mapy, `progress` mogący spaść (Policz kropki, Kąt, Który rok?).

Gry bez luk w testach obowiązkowych: Kąt i Mapa; tylko „wygrana każdego”: Który rok?, Tort, Nożyczki; Środek do tego „po końcu”.
Najstarsze pliki testów (Narysuj koło, Odcień i Policz kropki, wszystkie z 2026-10-08, sprzed wzorca z blokami „definicja / walidacja / schemat / koniec / stan”) mają prawie wszystkie luki tej paczki.
Reguły §3 na prawdziwych wynikach: 0 błędów w 3600 partiach `fuzz08.ts`; jedyne złamanie to W8a.

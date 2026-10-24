# 01-09: mini-gry do pierwszej pomyłki (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `kubki`, `sledzenie`, `wieza`, `w-pamieci`.
Repo bez zmian (poza `.planning/`). Podpięcie (§6) i ekran końcowy z samego stanu tych gier są w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts` i testy `<id>.test.ts` każdej gry przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :29, :30, :39, :46, §1 wspólny schemat :51-65, sekcje gier :231-251, :253-270, :272-296, :428-442), `KONCEPT.md` §2.4 (:124, :128, :129, :137, :153)
  i §3 (:233), oraz z `ZASADY.md` §2 (:54-76) i §3 (:89-106).
- Ekrany (`apps/web/src/games/{Kubki,Sledzenie,Wieza,WPamieci}.tsx`) sprawdzone grepem tylko po czasy faz, żeby ocenić limit tury wobec najdłuższej uczciwej partii.
  Wygląd ekranów to faza 2.
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze tych gier (:62-64, :73; bez błędów; najgorszy wynik: Kubki 0, Śledzenie 0 · 0, Wieża 0 · 0,4, W pamięci 0 · 999).
- Skrypt `fuzz09.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o **prawdziwe** wyniki, wzorem `fuzz08.ts`:
  każda z 4 gier × 400 partii (1-6 graczy), każdy gracz oddaje losowy uczciwy wynik (85%, w tym 20% najgorszych uczciwych: zły kubek w pierwszej rundzie,
  same złe kulki w pierwszej rundzie Śledzenia, losowe dotknięcia w Wieży, odpowiedź 0 albo 999 w pierwszej rundzie W pamięci) albo `timeoutMove` (15%).
  Uczciwy wynik to k rund poprawnie, potem w 80% pomyłka (w Śledzeniu z 0-2 trafionymi), w 20% urwana lista; w Wieży kolejne czasy aż do pudła albo 30 pięter,
  część z szukaniem czasu z najmniejszą odchyłką. Wieża: 3 ruchy `progress` (1-29) przed wynikiem.
  Sprawdzenia jak w 01-08: świeża gra nieskończona, schemat i `validateMove`, `obcy` odrzucony, stan zamrożony rekursywnie przed `applyMove` i porównany JSON-em,
  round-trip JSON stanu i widoków wszystkich graczy i `""`, drugi wynik odrzucony, stały klucz `turn()` po `progress` (Wieża),
  znak różnicy `places` zgodny ze znakiem porównania `record.score`, potem `record.tie`, gracz po limicie wyżej niż gracz z oddanym wynikiem.
  Wynik: **0 błędów**, **0** partii z graczem po limicie wyżej od uczciwego wyniku.
- Ten sam skrypt liczy: najgorszy uczciwy wynik wobec limitu na 500 seedach, najwęższy pierwszy klocek Wieży (200 seedów, co 5 ms),
  liczbę mnożeń na partię W pamięci (2000 seedów, W9a) i, osobnym `kubki09.ts`, liczbę zamian z kulką na partię Trzech kubków (2000 seedów).

| gra | partie | zwycięzca | remis bez zwycięzcy (n > 1) | `places` ≠ rekord | po limicie wyżej niż wynik | limit wobec najgorszego uczciwego (500 seedów) |
|---|---|---|---|---|---|---|
| kubki | 400 | 292 | 41 | 0 | 0 | równy w 500 (0 rund; pomyłka w pierwszej rundzie to też 0) |
| sledzenie | 400 | 311 | 22 | 0 | 0 | równy w 500 (0 · 0 = pomyłka w pierwszej rundzie bez trafionego celu) |
| wieza | 400 | 330 | 3 | 0 | 0 | gorszy w 500 (0 pięter; pierwszy klocek zawsze trafia, więc uczciwie co najmniej 1) |
| w-pamieci | 400 | 318 | 15 | 0 | 0 | gorszy w 500 (odchyłka 999; uczciwa najwyżej 998, bo wynik rundy jest w 1-99) |

- W 8 partiach W pamięci gracz po limicie zremisował z „uczciwym” graczem, który oddał pustą listę (k = 0 bez pomyłki): to ten sam ruch co `timeoutMove`, nie błąd.
- Najdłuższa uczciwa partia wobec limitu tury (`ZASADY.md` §3 :106 „plus zapas”), z czasami faz ekranu:

| gra | najdłuższa uczciwa partia | limit | mieści się |
|---|---|---|---|
| kubki | 20 × (0,3 s czekania + 1 s pokazu + 1 s odsłony) + tasowanie 62,4 s = 108,4 s, do tego 20 wskazań bez limitu (`Kubki.tsx:16`, `kubki.ts:23-24`) | 180 s | ✓ (ok. 3,6 s na wskazanie) |
| sledzenie | 20 × (0,7 s + 1,5 s + 5 s ruchu + 1 s odsłony) = 164 s, do tego 20 × 3 dotknięcia (`Sledzenie.tsx:16`) | 300 s | ✓ (ok. 6,8 s na rundę) |
| wieza | 30 × 5 s (klocek spada sam) + 1 s = 151 s, bez wpisywania (`Wieza.tsx:19`, `:79`) | 180 s | ✓ (29 s zapasu) |
| w-pamieci | 12 × 0,8 s + 102 pozycje × 1,5 s = 162,6 s, do tego 12 wpisów (`WPamieci.tsx:16`, `:55-64`) | 300 s | ✓ (ok. 11 s na wpis) |

- Sufit wyniku: we wszystkich czterech stała liczba rund (20, 20, 30, 12), nic nie zależy od losowania. Krzywa trudności to faza 3; jedyny pomiar przekazany dalej to W9a.

## Wpisy wspólne tej paczki (do scalenia w 01-10)

#### W9a. Liczba mnożeń zmienia trudność partii W pamięci `[zbiorcze: trudnosc-z-losowania]`
- Gra: `w-pamieci`. Miejsce: `packages/games/src/w-pamieci.ts:41-44` (rodzaj działania losowany równo z trzech, potem odrzucany, gdy wartość wyjdzie poza 1-99).
- Dowód (`fuzz09.ts`, 2000 seedów): mnożeń na partię (90 działań) od **15 do 35** (p10 20, mediana 24, p90 29). Że mnożenie jest trudniejsze od dodawania w pamięci,
  to założenie audytu, do potwierdzenia pomiarem (jak W8b w 01-08).
- Pozostałe gry paczki: Trzy kubki mają stałą liczbę zamian, a zamian z kulką na partię jest 164-197 z 270 (p10 174, p90 187, `kubki09.ts`), czyli rozrzut ok. ±6%;
  w Śledzeniu prędkość i liczba kulek są stałe, losowe są tylko tory; w Wieży losowana jest tylko strona startu klocka. Bez wpisów.
- Źródło: `ZASADY.md` §3 „Losowanie nie zmienia sufitu wyniku” (:100-102): litera spełniona (12 rund w każdej partii), uzasadnienie („każda musi dawać tyle samo do zdobycia”)
  i zdanie o kompletach rodzajów (:102) wskazują, że rodzaje działań też powinny iść kompletami. To samo co LC1 w Liczeniu (01-07).
- Waga: **średnia** (wszyscy w partii mają te same ciągi; dotyka tylko porównań rekordów między partiami).
- Propozycja (pomiar w fazie 3, REC-01): rodzaje działań potasowanymi kompletami (np. w każdej rundzie co najmniej jedno mnożenie, gdy wartość pozwala, albo stała liczba mnożeń w partii).
  Jeśli zostaje, dopisać powód w `ZASADY-GIER.md` (D-11).

## Trzy kubki (`kubki`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Trzy kubki (:253-270). Opis w `KONCEPT.md` §2: ✓ §2.4 (:124). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 180 s (`kubki.ts:46-48`) | tabela :46 | ✓ (też `KONCEPT.md` §3 :233) |
| rundy, kubki, pokaz | `ROUNDS = 20`, `CUPS = 3`, `SHOW_MS = 1000` (`:4-6`) | :254-255 | ✓ (też `KONCEPT.md` :124) |
| tempo | `swapCount(r)` = 4 + r, `swapMs(r)` = max(150, 500 − 25·r) (`:7-10`, `:23-24`) | :257-258 | ✓ (150 ms od r = 14, czyli piętnastej rundy; tasowanie najwyżej 18 × 200 = 3,6 s) |
| zamiany | para dwóch różnych miejsc, ta sama para (także odwrócona) nie dwa razy z rzędu (`:30-41`) | :259-260 | ✓ (losowane miejsce pominięte, różne od poprzedniego) |
| `ballAt` | kulka idzie za swoim kubkiem (`:27`) | :261 | ✓ |
| wynik | rundy od początku do pierwszej pomyłki (`:64-65`) | :262-263 | ✓ |
| ranking | więcej rund wyżej, bez drugiego kryterium (`:70`) | :264 | ✓ (też `KONCEPT.md` :124 „bez drugiego kryterium”) |
| walidacja | najwyżej 20 wskazań, int 0-2 (`:51`, `:61`) | :265 | ✓ |
| limit czasu | pusta lista = 0 rund (`:74`) | :265 | ✓ najgorszy możliwy (równy pomyłce w pierwszej rundzie) |
| bez `progress` | schemat zna tylko `result` (`:49-52`) | :266 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. `KONCEPT.md` :124 zgodny z `ZASADY-GIER.md`. Ekran (:267-270) poza zakresem (faza 2).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 rund; uczciwie też najwyżej równo | 01-01-CHECKS.md :63; `fuzz09.ts` (0 wyżej, równy w 500/500) |
| remis i solo bez zwycięzcy | ✓ | testy :216, :223, :230; `fuzz09.ts` (41 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md :63; `fuzz09.ts` |
| `ranked` / `places`, rekord zgodny | ✓ | `kubki.ts:70`; `fuzz09.ts` (0 niezgodności) |
| pole odróżniające partie | ✓ `rounds` | test :68 |
| sufit wyniku | ✓ 20 rund w każdej partii | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2); własna funkcja `shuffle` (:30) nie jest kopią `shuffle` z `core.ts` (losuje zamiany, nie tasuje listy), ale nosi tę samą nazwę (KB1) | – |

Odstępstwa z powodem (D-11): rundy w widoku od startu, cały stan w widoku (§1 :53-54); `ballAt` wspólny dla serwera i ekranu (:261).

#### KB1. Własna funkcja `shuffle` o nazwie funkcji z `core.ts`
- Miejsce: `packages/games/src/kubki.ts:30` (`function shuffle(rng, count)` zwraca listę zamian). `core.ts` eksportuje `shuffle` (tasowanie listy), a `ZASADY.md` §3 :104
  wymienia je wprost wśród funkcji, których nie wolno kopiować; czytelnik albo grep po `shuffle` widzi tu kopię.
- Źródło: `ZASADY.md` §3 „Wspólne funkcje z `core.ts`” (:104). Waga: **niska** (kosmetyka nazwy, zachowanie poprawne, test :103).
- Propozycja (popraw kod): zmienić nazwę na `swapsFor` albo `shuffleCups`.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Trzy kubki) | Test (`kubki.test.ts`) |
|---|---|
| do 20 rund, 3 kubki, kulka pod jednym, 1 s pokazu (:254-255) | :44, :57 (pokaz n/d: ekran) |
| pierwsza pomyłka kończy partię (:256) | :177, :182 |
| tempo: 4 + r zamian, max(150, 500 − 25·r), tasowanie ≤ 3,6 s (:257-258) | :73-81 (r = 0, 1, 13, 14, 19), :83 |
| `ball` 0-2, zamiany `[a, b]`, a ≠ b (:259) | :57, :91 |
| ta sama para nie dwa razy z rzędu, także odwrócona (:260) | :103 |
| `ballAt` (:261) | :115-132, :110 |
| ruch `picks`, wynik od początku, po błędzie ignorowane (:262-263) | :173, :182, :188 |
| ranking bez drugiego kryterium, remis bez zwycięzcy (:264) | :201, :216, :223 |
| walidacja 20 wskazań int 0-2, pusta = limit = 0 (:265) | :146, :152, :158, :235 |
| bez `progress` (:266) | :163 (schemat odrzuca `type: "progress"`) |
| ekran, ekran końcowy (:267-270) | n/d (faza 2, 01-02) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | ✓ | :39 |
| Setup: kto zaczyna, różne seedy, ten sam seed | ✓ | :52, :66-68 |
| Walidacja: spoza gry, drugi wynik, po końcu | ✓ | :139, :140, :141 |
| Walidacja: zła faza | n/d (jedna faza) | – |
| Walidacja: brzegi | ✓ | :146-149 (−1, 0-2, 3), :152-154 (20 / 21) |
| Schemat | ✓ | :157-166 |
| Koniec: wygrana każdego, remis, ranking, `waitingFor` puste | ✓ | :210, :216, :206, :207 |
| Limit | ✓ | :235 |
| Stan: brak mutacji, JSON | ✓ | :244 |
| Mini-gra: zakres, niecałkowity, drugi, remis, solo, rewanż | ✓ | :146, :158, :140, :216, :230, :68 |
| Mini-gra: funkcja licząca | ✓ | `ballAt` :115-132; śmieci odcina walidacja :146-166 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 |

Luki: brak. Plik testów pokrywa każdy punkt §2 i każdą zasadę sekcji.

## Śledzenie (`sledzenie`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Śledzenie (:231-251). Opis w `KONCEPT.md` §2: ✓ §2.4 (:128, drugie kryterium także :153). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 300 s (`sledzenie.ts:68-70`) | tabela :29 | ✓ (też `KONCEPT.md` §3 :233) |
| rundy, kulki, cele | `ROUNDS = 20`, `BALLS = 8`, `TARGETS = 3`, cele = indeksy 0-2 (`:4-6`, `:101`) | :232, :240-241 | ✓ (też `KONCEPT.md` :128) |
| czasy | `SHOW_MS = 1500`, `MOVE_MS = 5000` (`:7-8`) | :232-233 | ✓ |
| tempo | 0,3 + 0,06 × runda boku na sekundę, ta sama dla wszystkich kulek (`:10-11`, `:54`) | :235-236 | ✓ (w dwudziestej 1,44; dokument mówi „ok. 1,45”) |
| ruch | prosta z odbiciem, fala trójkątna na każdej osi, kulki się przenikają (`:28-32`, `:50-63`) | :237-239 | ✓ |
| rozstawienie | promień 0,06, odstęp środków ≥ 0,14 na starcie i po 5 s (`:9`, `:25`, `:34-48`) | :240-242 | ✓ |
| wynik | `rounds` z kompletem celów, `hits` 0-2 w pierwszej rundzie z błędem, po błędzie ignorowane (`:95-117`) | :243-245 | ✓ |
| ranking | więcej rund, potem więcej `hits` (`:121`) | :246 | ✓ (też `KONCEPT.md` :128, :153) |
| walidacja | najwyżej 20 rund, 3 różne int 0-7 (`:73`, `:82-93`) | :247 | ✓ |
| limit czasu | pusta lista = 0 · 0 (`:125`) | :247 | ✓ najgorszy możliwy (równy pomyłce w pierwszej rundzie bez trafionego celu) |
| bez `progress` | schemat zna tylko `result` (`:71-74`) | :248 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. `KONCEPT.md` :128 zgodny z `ZASADY-GIER.md`. Ekran (:249-251) poza zakresem (faza 2).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · 0; uczciwie też najwyżej równo | 01-01-CHECKS.md :62; test :252; `fuzz09.ts` (0 wyżej, równy w 500/500) |
| remis i solo bez zwycięzcy | ✓ | testy :227, :234, :241; `fuzz09.ts` (22 remisy) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md :62; `fuzz09.ts` |
| `ranked` / `places`, rekord zgodny | ✓ (`tie` = `hits`, więcej lepiej) | `sledzenie.ts:121`; `fuzz09.ts` (0 niezgodności) |
| pole odróżniające partie | ✓ `rounds` | test :77 |
| sufit wyniku | ✓ 20 rund w każdej partii | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2); `reflectAxis` i `scatter` nie mają odpowiedników w `core.ts` | – |

Odstępstwa z powodem (D-11): tory kulek w widoku od startu, cały stan w widoku (§1 :53-54); `position` wspólny dla serwera i ekranu (:238-239);
cele zawsze pod indeksami 0-2, bo pozycje są losowe (:240-241).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Śledzenie) | Test (`sledzenie.test.ts`) |
|---|---|
| do 20 rund, 8 kulek, 3 cele, 1,5 s i 5 s (:232-233) | :56, :69 (1,5 s nie wprost, stała z ekranu) |
| pierwsza pomyłka kończy partię (:234) | :186, :195 |
| tempo 0,3 + 0,06 na rundę (:235) | :123, :128 |
| ta sama prędkość wszystkich kulek w rundzie (:236) | LUKA (SL1: `speed` :45-48 bierze najszybszą kulkę) |
| prosta, odbicie od krawędzi, wzór od czasu (:237-239) | :84, :90, :118 |
| cele 0-2, brak nakładania na starcie i po zatrzymaniu, odstęp 0,14 (:240-242) | :109 (brak nakładania sprawdzony progiem 0,12, nie 0,14: SL1); cele :191 |
| ruch `picks`, kolejność bez znaczenia, `rounds`, `hits`, po błędzie ignorowane (:243-245) | :182, :186, :191, :195, :199 |
| ranking: rundy, potem `hits`, remis bez zwycięzcy (:246) | :212, :227, :234 |
| walidacja, pusta = limit = 0 · 0 (:247) | :147, :153, :155, :161, :166, :245 |
| bez `progress` (:248) | :172 |
| ekran (:249-251) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | ✓ | :51 |
| Setup: kto zaczyna, różne seedy, ten sam seed | ✓ | :64, :75-77 |
| Walidacja: spoza gry, drugi wynik, po końcu, ta sama kulka dwa razy | ✓ | :140, :141, :142, :153 |
| Walidacja: zła faza | n/d (jedna faza) | – |
| Walidacja: brzegi | ✓ | :155-158 (−1, 7, 8), :147-150 (2 / 3 / 4 wskazania), :161-163 (20 / 21 rund) |
| Schemat | ✓ | :166-175 |
| Koniec: wygrana każdego, remis, ranking, `waitingFor` puste | ✓ | :221, :227, :217, :218 |
| Limit | ✓ | :245, :252 |
| Stan: brak mutacji, JSON | ✓ | :261 |
| Mini-gra: zakres, niecałkowity, drugi, remis, solo, rewanż | ✓ | :155, :167, :141, :227, :241, :77 |
| Mini-gra: funkcja licząca | ✓ | `position` :84-133, wynik :182-201; śmieci odcina walidacja :147-175 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 (`tied`, 01-01-CHECKS.md :208) |

#### SL1. Ta sama prędkość kulek i odstęp 0,14 bez testu wprost
- Miejsce: `sledzenie.test.ts:45-48` (`speed` to najszybszy krok spośród wszystkich kulek, więc kulka wolniejsza od reszty przeszłaby :123 i :128)
  i `:113` (`> 2 * RADIUS`, czyli 0,12, a dokument podaje odstęp co najmniej 0,14, `sledzenie.ts:25`).
  Zachowanie poprawne: prędkość zależy tylko od rundy (`sledzenie.ts:54`), `scatter` odrzuca bliżej niż `GAP` (`:42-45`).
- Źródło: `ZASADY.md` §2 „każda zasada z sekcji” (:63); `ZASADY-GIER.md` :236, :242. D-03 (test słabszy niż litera zasady).
- Waga: **średnia** (ta sama prędkość wszystkich kulek to rdzeń gry: inaczej cel zdradza się tempem).
- Propozycja: w teście :128 sprawdzić prędkość każdej kulki osobno (`balls.every`), w :113 próg `toBeGreaterThanOrEqual(0.14 - 1e-9)`.

## Wieża (`wieza`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 Wieża (:272-296). Opis w `KONCEPT.md` §2: ✓ §2.4 (:129, drugie kryterium także :153). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 180 s, `turn()` ze stałym kluczem (`wieza.ts:33`, `:68-72`) | tabela :30, :291 | ✓ (też `KONCEPT.md` §3 :233) |
| piętra, podstawa | `LEVELS = 30`, `START_WIDTH = 0.4` na środku (`:4`, `:6`, `:35`) | :273 | ✓ (też `KONCEPT.md` :129) |
| trafienie idealne | odchyłka ≤ `SNAP = 0.02` wyrównuje (`:8`, `:53`) | :275 | ✓ (też `KONCEPT.md` :129 „do 2% szerokości pola”) |
| ucinanie, pudło | część wspólna, poniżej `MIN_WIDTH = 0.02` pudło (`:10`, `:54-56`) | :276-277 | ✓ |
| pierwszy klocek | zawsze trafia | :277-278 | ✓ (`fuzz09.ts`: najwęższy pierwszy klocek 0,1 na 200 seedach) |
| tempo | 0,5 + 0,03 × piętro pola na sekundę (`:11-12`, `:40`) | :279 | ✓ |
| ruch | strona startu z `rng`, fala trójkątna lewej krawędzi w `[0, 1 − width]` (`:38-44`, `:80`) | :280-282 | ✓ |
| samoczynny spadek | po `MAX_STOP_MS = 5000` (`:14`, `:40`) | :283 | ✓ (też `KONCEPT.md` :129) |
| wynik | `build`: `height`, `width` ostatniego (przy 0 szerokość podstawy), po pudle ignorowane (`:47-61`) | :284-286 | ✓ |
| ranking | wyższa, potem szerszy (`:98`) | :287 | ✓ (też `KONCEPT.md` :129, :153) |
| walidacja | najwyżej 30 czasów, int 0-5000 (`:74`, `:88`) | :288 | ✓ |
| limit czasu | pusta lista = 0 pięter (`:102`) | :288 | ✓ najgorszy możliwy (uczciwie co najmniej 1 piętro) |
| `progress` | `height` int 1-29, nie zmienia wyniku ani limitu (`:75`, `:88`, `:91`) | :289-291 | ✓ |

Rozbieżności kod ↔ dokumenty: brak. `KONCEPT.md` :129 zgodny z `ZASADY-GIER.md`. Ekran (:292-296) poza zakresem (faza 2).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · 0,4, ściśle gorszy od każdego uczciwego | 01-01-CHECKS.md :64; test :348; `fuzz09.ts` (gorszy w 500/500) |
| remis i solo bez zwycięzcy | ✓ | testy :322, :329, :336; `fuzz09.ts` (3 remisy: szerokość to liczba z przecinkiem, remis zwykle tylko przy kompletach idealnych) |
| start, tylko `rng`, JSON, brak mutacji | ✓ (także po `progress`) | 01-01-CHECKS.md :64; `fuzz09.ts` |
| `ranked` / `places`, rekord zgodny | ✓ (`tie` = `width`, więcej lepiej, bez zaokrąglenia, więc zgodny z komparatorem; inaczej niż W6b) | `wieza.ts:98`; `fuzz09.ts` (0 niezgodności) |
| `turn()` ze stałym kluczem | ✓ | `wieza.ts:72`; test :285; `fuzz09.ts` |
| pole odróżniające partie | ✓ `sides` | test :95 |
| sufit wyniku | ✓ 30 pięter w każdej partii | – |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2) | – |

Odstępstwa z powodem (D-11): czasy mierzy klient i zna wzór, więc idealne czasy da się policzyć (`wieza.ts:63-64`, `ponytail:`); cały stan w widoku (§1 :53-54);
`progress` od klienta może spaść albo skoczyć, bo jest tylko podglądem (:289-290, jak w 01-08).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 Wieża) | Test (`wieza.test.ts`) |
|---|---|
| do 30 pięter, pole 1, podstawa 0,4 na środku, klocek szerokości poprzedniego od krawędzi do krawędzi (:273-274) | :74, :102, :109, :188 |
| trafienie idealne do 0,02, ucinanie (:275-276) | :153, :160, :166, :175, :184 |
| pudło poniżej 0,02, pierwszy zawsze trafia (:277-278) | :200, :207, :196 |
| tempo 0,5 + 0,03 (:279) | :129, :133 |
| strona z `rng`, fala trójkątna, wzór od czasu (:280-282) | :87, :93, :102, :109, :123 |
| spadek po 5 s (:283) | :139 |
| `stops`, `build`, `height`, `width`, po pudle ignorowane (:284-286) | :149, :212, :217 |
| ranking: wyższa, potem szersza; remis (:287) | :307, :322, :329 |
| walidacja, pusta = limit = 0 (:288) | :233, :240, :245, :341 |
| `progress` 1-29, podgląd, nie zmienia wyniku i limitu (:289-291) | :261, :271, :275, :282, :283, :285, :290 |
| ekran (:292-296) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds` i `turn()`, świeża gra | ✓ | :69, :285-287 |
| Setup: kto zaczyna, różne seedy, ten sam seed | ✓ | :82, :93-95 |
| Walidacja: spoza gry, drugi wynik, po końcu | ✓ | :226, :227, :228; `progress` :282, :283 |
| Walidacja: zła faza | n/d (jedna faza; `progress` po wyniku :283) | – |
| Walidacja: brzegi | ✓ | :233-237 (−1, 0, 5000, 5001), :240-242 (30 / 31), :275-279 (0, 1, 29, 30) |
| Schemat | ✓ | :245-254, :290-296 |
| Koniec: wygrana każdego, remis, ranking, `waitingFor` puste | ✓ | :316, :322, :307, :313 |
| Limit | ✓ | :341, :348 |
| Stan: brak mutacji, JSON | ✓ | :357 (wynik), :268 (`progress`) |
| Mini-gra: zakres, niecałkowity, drugi, remis, solo, rewanż | ✓ | :233, :246, :227, :322, :336, :95 |
| Mini-gra: funkcja licząca | ✓ | `build` :149-219, `left` :102-141; śmieci odcina walidacja :233-254 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 (`tied`, 01-01-CHECKS.md :208) |

Luki: brak. Plik testów pokrywa każdy punkt §2 i każdą zasadę sekcji (próg 0,02 sprawdzony z obu stron: 0,015 wyrównuje, 0,03 ucina).

## W pamięci (`w-pamieci`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §1 W pamięci (:428-442). Opis w `KONCEPT.md` §2: ✓ §2.4 (:137); drugie kryterium brak na liście :153 (WP2). Brak trybów.

| Stała | Kod | ZASADY-GIER | Zgodne |
|---|---|---|---|
| gracze, limit | 1-6, 300 s (`w-pamieci.ts:55-57`) | tabela :39 | ✓ (też `KONCEPT.md` §3 :233) |
| rundy, pokaz | `ROUNDS = 12`, `SHOW_MS = 1500` (`:4`, `:8`) | :429-430 | ✓ (też `KONCEPT.md` :137) |
| długość ciągu | runda i ma i + `START_OPS` (2) działań, każda runda osobno losowana (`:6`, `:62`) | :431 | ✓ (2-13) |
| losowanie | start 1-9, +1..9, −1..9, ×2, ×3, wartość po każdym kroku 1-99 (`:10`, `:36-49`) | :433-434 | ✓ (`fuzz09.ts`: największy wynik rundy 99) |
| `value` | po kolei od lewej (`:30-33`) | :434 | ✓ |
| wynik | `rounds` do pierwszego błędu, `diff` w pierwszej niezaliczonej, brak odpowiedzi 999, komplet 0 (`:72-77`) | :435-437 | ✓ |
| ranking | więcej rund, potem mniejsza odchyłka (`:81-85`) | :438 | ✓ (też `KONCEPT.md` :137) |
| walidacja | najwyżej 12 int 0-999 (`:11`, `:58`, `:66-70`) | :439 | ✓ |
| limit czasu | pusta lista = 0 · 999 (`:89`) | :439 | ✓ najgorszy możliwy (uczciwa odchyłka najwyżej 998) |
| bez `progress` | schemat zna tylko `result` (`:58`) | :440 | ✓ |

Rozbieżności kod ↔ `ZASADY-GIER.md`: brak. `KONCEPT.md` :153: WP2. Ekran (:441-442) poza zakresem (faza 2).

#### WP2. KONCEPT nie wymienia odchyłki W pamięci wśród drugich kryteriów rekordów
- Miejsce: `KONCEPT.md` :152-153 („`tie`: średnia reakcji w grach na trafienia i punkty, trafione cele w Śledzeniu, szerokość klocka w Wieży, pęknięte balony w Balonie,
  czas zaznaczania w Zakupach”), a `w-pamieci.ts:84` ma `tie` (odchyłka, mniej lepiej); `KONCEPT.md` :137 i `ZASADY-GIER.md` :438 opisują to kryterium.
- Historia: lista powstała z rekordami (`97f25af`, 2026-10-11, ten sam dzień co W pamięci, `873b188`); ostatnio poprawiona przy Zakupach (`f7e6b1d`, 2026-10-13),
  które dopisały swoje kryterium, W pamięci dalej brak.
- Źródło: D-06 (rozbieżność między dokumentami). Waga: **niska**.
- Propozycja (popraw dokument): dopisać „odchyłka w rundzie z pomyłką w W pamięci” na liście `KONCEPT.md` :153.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to najgorszy wynik | ✓ 0 · 999, ściśle gorszy od każdej uczciwej odpowiedzi | 01-01-CHECKS.md :73; test :226; `fuzz09.ts` (gorszy w 500/500) |
| remis i solo bez zwycięzcy | ✓ | testy :199, :207, :214; `fuzz09.ts` (15 remisów) |
| start, tylko `rng`, JSON, brak mutacji | ✓ | 01-01-CHECKS.md :73; `fuzz09.ts` |
| `ranked` / `places`, rekord zgodny | ✓ (`tie` = `diff`, mniej lepiej, liczba całkowita) | `w-pamieci.ts:81-85`; test :189, :204; `fuzz09.ts` (0 niezgodności) |
| pole odróżniające partie | ✓ `rounds` | test :92 |
| sufit wyniku | ✓ litera (12 rund w każdej partii), ✗ trudność z losowania | W9a |
| limit wobec najdłuższej partii | ✓ | tabela w „Metoda” |
| wspólne funkcje `core.ts` | ✓ `ranked` (:2); własne `int` (:28) to jedna linia losowania, w `core.ts` nie ma odpowiednika (jak w Liczeniu i Odcieniu) | – |

Odstępstwa z powodem (D-11): ciągi w widoku od startu (`w-pamieci.ts:51`, `ponytail:`, §1 :53-54).

### Testy (RULE-03)

| Zasada (ZASADY-GIER §1 W pamięci) | Test (`w-pamieci.test.ts`) |
|---|---|
| do 12 rund, pozycja 1,5 s, wynik pośredni niewidoczny (:429-430) | :48 (pokaz n/d: ekran) |
| runda i ma i + 2 działań (:431) | :63 |
| każda runda to nowy ciąg, nie przedłużenie poprzedniego (:431) | LUKA (WP1) |
| pierwsza zła odpowiedź kończy partię (:432) | :149, :160 |
| start 1-9, działania, wartość 1-99, te same dla wszystkich (:433-434) | :56, :70, :80, :86 |
| `value` od lewej (:434) | :97, :99 |
| `rounds`, `diff`, brak odpowiedzi 999, komplet 0, po błędzie ignorowane (:435-437) | :145, :149, :154, :160, :166, :170 |
| ranking: rundy, potem odchyłka; remis (:438) | :183, :199, :207 |
| walidacja, pusta = limit = 0 · 999 (:439) | :117, :124, :129, :219 |
| bez `progress` (:440) | :135 |
| ekran (:441-442) | n/d (faza 2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra | ✓ | :43 |
| Setup: kto zaczyna, różne seedy, ten sam seed | ✓ | :58, :90-92 |
| Walidacja: spoza gry, drugi wynik, po końcu | ✓ | :110, :111, :112 |
| Walidacja: zła faza | n/d (jedna faza) | – |
| Walidacja: brzegi | ✓ | :117-121 (−1, 0, 999, 1000), :124-126 (12 / 13) |
| Schemat | ✓ | :129-138 |
| Koniec: wygrana każdego, remis, ranking, `waitingFor` puste | ✓ | :193, :199, :183 (także `places` :189), :190 |
| Limit | ✓ | :219, :226 |
| Stan: brak mutacji, JSON | ✓ | :235 |
| Mini-gra: zakres, niecałkowity, drugi, remis, solo, rewanż | ✓ | :117, :130, :111, :199, :214, :92 |
| Mini-gra: funkcja licząca | ✓ | `value` :96-104, wynik :141-172; śmieci odcina walidacja :117-138 |
| Mini-gra: rekord | ✓ | index.test.ts:168, :190 (`tied`, 01-01-CHECKS.md :208) |

#### WP1. „Każda runda to nowy ciąg” bez testu
- Miejsce: brak w `w-pamieci.test.ts` (:63 sprawdza tylko długości). Zachowanie poprawne: każda runda to osobne wywołanie `chain` (`w-pamieci.ts:62`).
- Źródło: `ZASADY.md` §2 „każda zasada z sekcji” (:63); `ZASADY-GIER.md` :431. Waga: **średnia** (gracz odczuwa: przedłużenie poprzedniego ciągu dawałoby wynik pośredni za darmo).
- Propozycja: test „runda nie zaczyna się ciągiem poprzedniej” na 40 seedach z :54 (`start` albo pierwsze działania różne od poprzedniej rundy w większości rund),
  albo wprost `rounds[i + 1].ops.slice(0, i + 2)` ≠ `rounds[i].ops` przy tym samym `start`.

## Podsumowanie paczki

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| W9a | w-pamieci | średnia | `trudnosc-z-losowania` (z W6a, LC1, W8b) |
| SL1 | sledzenie | średnia | – |
| WP1 | w-pamieci | średnia | – |
| KB1 | kubki | niska | – |
| WP2 | w-pamieci | niska | – |

- Wysokie: brak. Reguły §3 bez złamań: we wszystkich czterech grach limit czasu to najgorszy możliwy wynik, drugie kryterium (`tie`) zgodne z dokumentem i z komparatorem.
- Testy: cztery najmłodsze pliki tej fazy, każdy z kompletem testów obowiązkowych §2; luki tylko w pojedynczych zasadach sekcji (SL1, WP1).

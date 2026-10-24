# 01-03: Kampus Tour (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `8a15cff`, 2026-10-23. Kryteria 1-3 roadmapy dla `kampus-tour` (D-14). Balans ekonomii jest poza zakresem (faza 3).
Repo bez zmian (poza `.planning/`). Podpięcie (§6) jest w 01-02-FINDINGS.md, wiersz `kampus-tour`: komplet, bez luk.

## Metoda

- Kod `packages/games/src/kampus-tour.ts` i testy `kampus-tour.test.ts` przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md` §6 (:646-741),
  `KONCEPT.md` §2.1 (:30-60), §3 (:233) i §9 (:340-348).
- Dowód §3 dla faz `pick`, `roll`, `buy`, `card`: 01-01-CHECKS.md, wiersz `kampus-tour` (same `timeoutMove`).
- Fazy, do których same timeouty nie dochodzą (`build`, `buyout`, `sell`, `juwenalia`, ruch `travel`), sprawdził skrypt `fuzz.ts` (scratchpad sesji, poza repo,
  `node --experimental-strip-types`): 1200 partii (n = 2, 3, 4, seedy 1-400), w każdym kroku losowy **dozwolony** ruch z pełnej listy kandydatów
  (70%) albo `timeoutMove` (30%). Sprawdzenia: `timeoutMove` każdego czekającego przechodzi schemat i `validateMove`; stan zamrożony rekursywnie przed
  `applyMove` (zapis rzuca) i porównany JSON-em przed/po; round-trip JSON stanu po ruchu; gotówka całkowita; ruch odrzucony dla `obcy`; po końcu
  `waitingFor` = `[]`. Wynik: **0 błędów**, odwiedzone wszystkie 8 faz i 10 typów ruchów, gotówka zawsze całkowita, 2 remisy na 1200 (oba bez zwycięzcy).
- Przypadki brzegowe z wpisów poniżej: skrypt `cases.ts` (scratchpad), stan budowany jak w testach (`setup` + nadpisanie pól), kostki sterowane.

## Kampus Tour: plansza, pola i karty (`kampus-tour`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §6 (:646). Opis w `KONCEPT.md` §2: ✓ §2.1 (:30). Brak trybów (`modes`), więc nic do porównania w lobby.
- Stałe planszy i kart, kod ↔ `ZASADY-GIER.md` §6:

| Stała | Kod | ZASADY-GIER §6 | Zgodne |
|---|---|---|---|
| liczba pól, plansza 12×6 | `SIZE = 32` (:4), `BOARD` (:61) | 32 pola (:650) | ✓ |
| rogi | `SPECIAL` 0, 11, 16, 27 (:43-54) | 0 Początek, 11 Kolokwium, 16 Juwenalia, 27 Bilet MPK | ✓ (też `KONCEPT.md` :40) |
| grupy, ceny, nazwy, indeksy | `GROUP_DEFS` (:14-23) | tabela :652-668 | ✓ wszystkie 8 grup, 22 pola |
| Karty Dziekanatu | `SPECIAL` 5, 13, 21 (:45, :48, :50) | 5, 13, 21 | ✓ |
| Ksero, Stołówka | `UTILITIES = [7, 29]`, `UTILITY_PRICE = 30` (:27-28) | 7, 29, cena 30 | ✓ |
| stawki Ksero/Stołówki | `UTILITY_RATES = [2, 5]` (:30) | × 2 przy jednym, × 5 przy obu (:685) | ✓ |
| Opłata za akademik | `TAX = 15` (:11), pole 28 (:52) | 15 zł do banku (:716) | ✓ (też `KONCEPT.md` :56) |
| postaci | `CHARACTERS` 6 (:213) | 6 postaci (:648) | ✓ |
| talia | `CARDS` 18 (:79-110) | 18 kart (:718) | ✓ |
| historia zdarzeń | `LOG = 4` (:228) | 4 ostatnie (:740) | ✓ |
| Juwenalia | `factor = festivals + 2` (:558) | × 2, × 3, × 4… wspólny licznik (:711) | ✓ |

- Karty, treść w dokumencie ↔ efekt w kodzie (`CARDS` :80-109, `applyCard` :403-444):

| Karta | ZASADY-GIER §6 | Kod | Zgodne |
|---|---|---|---|
| Stypendium rektora / socjalne / Zwrot za akademik / Nagroda w konkursie | +30 / +20 / +15 / +25 (:721) | `cash` 30, 20, 15, 25 (:80-83, :409-410) | ✓ |
| Warunek / Kara w bibliotece / Mandat | −30 / −10 / −20 (:721) | `cash` −30, −10, −20 przez `pay` do banku (:85-87, :411) | ✓ |
| Korepetycje | każdy płaci 5 zł, najwyżej tyle, ile ma (:722) | `fromEach` z `Math.min` (:84, :412-421) | ✓ |
| Składka na imprezę | płacisz każdemu po 5 zł (:723) | `toEach` przez `pay` do wszystkich żywych (:88, :422-423) | ✓ |
| Remont w akademiku | 5 zł za poziom, 20 zł za landmark (:724) | `repairs` 5 / 20 (:89-93, :424-430) | ✓ |
| Spóźnienie na zajęcia | na Kolokwium (:725) | `toKolokwium` (:94, :431-432) | ✓ |
| Zaliczenie w pierwszym terminie | karta do zachowania (:725) | `pass`, poza talią do użycia (:95-99, :398, :433-434) | ✓, ale patrz K1 |
| Zgubiona legitymacja | 3 pola wstecz, bez kieszonkowego, pole rozliczane (:726) | `back` 3, `land` (:100, :435-436) | ✓ |
| Pobudka na 8:00 / Wieczorne wyjście na Rynek / Juwenalia! / Przerwa w kawiarni | Idź na 0, 31, 16, 1, do przodu z kieszonkowym (:727) | `goto` przez `moveTo` → `advance` (:101-109, :437-438) | ✓ |
| Nocny autobus MPK | najbliższe Ksero/Stołówka do przodu, podwójny czynsz (:729) | `nearestUtility`, `land(..., 2)` (:104-107, :439-441) | ✓ |

- Pola specjalne (:705-716): Kolokwium (:388-393, :639-655), Juwenalia (:452, :557-562), Bilet MPK (:453, :564-573, :630-635), Opłata (:450): zgodne z dokumentem.
  Limit tury `turnSeconds: 60` (:471) zgodny z tabelą `ZASADY-GIER.md` (:9) i `KONCEPT.md` §3 (:233).

#### K1. Bankrut z kartą „Zaliczenie” zabiera ją z gry do końca partii
- Gra: `kampus-tour`. Miejsce: `packages/games/src/kampus-tour.ts:319-337` (`goBankrupt` nie rusza `passes`), `:398` (karta wyjęta z talii przy dobraniu).
- Źródło: `ZASADY-GIER.md` §6 Karty Dziekanatu (:719, „karta wraca na spód”; „Zaliczenie zostaje u gracza do użycia”), przypadek bankructwa nieopisany.
- Waga: **niska** (rzadkie; reszta graczy już nigdy nie dobierze tej karty, `deckSize` zostaje 17).
- Dowód: `cases.ts`: gracz z `passes: 1` bankrutuje na czynszu → `deckSize` 17, karty nie ma w talii.
- Propozycja (popraw kod): w `goBankrupt` odłożyć zachowane Zaliczenia na spód talii i dopisać to zdanie w §6; test w `kampus-tour.test.ts`.

#### K2. Juwenalia zostają na polu po wykupieniu i przechodzą na nowego właściciela
- Miejsce: `kampus-tour.ts:575-588` (`buyout` nie zmienia `juwenalia`), `:297-298` (`dropFestival` tylko, gdy pole wraca do banku).
- Źródło: `ZASADY-GIER.md` §6 (:703 „pole, które wraca do banku, traci Juwenalia”, :711). Zasada odczuwalna, tylko w kodzie (D-07).
- Waga: **niska**. Dowód: `cases.ts`: wykup pola 4 z `juwenalia: { tile: 4, factor: 2 }` → pole u kupującego, mnożnik ×2 zostaje; `fuzz.ts`: 293 takie wykupy.
- Propozycja (popraw dokument): dopisać w §6 Wykupienie „Juwenalia zostają na polu i działają dla nowego właściciela”. Zmiana zachowania tylko po decyzji w fazie 3 (balans).

#### K3. `KONCEPT.md` §2.1 wymienia kartę „poprawka”, której w talii nie ma
- Miejsce: `KONCEPT.md:54` („stypendium, warunek, poprawka itp.”); talia `kampus-tour.ts:79-110`.
- Źródło: D-06 (rozbieżność KONCEPT ↔ ZASADY-GIER §6 :718-729). Waga: **niska**.
- Propozycja (popraw dokument): „stypendium, warunek, Zaliczenie w pierwszym terminie itp.”.

#### K4. `KONCEPT.md` §9 opisuje talię Kampus Tour w punkcie o Poprawce
- Miejsce: `KONCEPT.md:348` („Zestaw kart specjalnych w Poprawce (talia 18 Kart Dziekanatu ustalona, w kodzie: CARDS w kampus-tour.ts)”).
- Źródło: D-06. Waga: **niska**. Poprawka i Kampus Tour to różne gry (§2.2 vs §2.1); czytelnik może wziąć Karty Dziekanatu za karty Poprawki.
- Propozycja (popraw dokument): rozdzielić na „Kampus Tour: talia 18 Kart Dziekanatu ustalona (`CARDS`)” i „Poprawka: zestaw kart specjalnych do ustalenia”.

#### K5. Tabela gier w `ZASADY-GIER.md` podaje typ „po kolei”, a faza `pick` jest równoczesna
- Miejsce: `ZASADY-GIER.md:9` (typ „planszowa, po kolei”); `kampus-tour.ts:698-699` (`waitingFor` w `pick` = wszyscy bez postaci), opis w §6 :672.
- Źródło: `ZASADY.md` §2 (testy zależne od typu: fazy równoczesne). Waga: **niska** (kosmetyka; testy fazy równoczesnej i tak są, patrz Testy).
- Propozycja (popraw dokument): „planszowa, po kolei (wybór postaci naraz)”.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ `pick` losowa wolna, `card` odkrycie, `juwenalia` najdroższe własne pole | 01-01-CHECKS.md wiersz `kampus-tour` (pick, card); `fuzz.ts` (juwenalia, 0 błędów); `kampus-tour.ts:701-717` |
| tylko `rng` | ✓ talia tasowana `rng` (:476-479) | 01-01-CHECKS.md §3 (grep pusty, determinizm ✓) |
| stan JSON, brak mutacji | ✓ we wszystkich fazach i typach ruchów | 01-01-CHECKS.md (timeouty); `fuzz.ts` (pozostałe fazy, stan zamrożony) |
| ukryte informacje | ✓ `playerView` bez `deck`, z `deckSize` (:660-684) | `kampus-tour.test.ts:567` |
| obserwator `""` | ✓ `playerView` nie zależy od gracza, więc `""` dostaje to samo | `kampus-tour.ts:660` |
| wspólne funkcje `core.ts` | ✗ własne tasowanie | K6 |

#### K6. Talia tasowana własną pętlą zamiast `shuffle` z `core.ts`
- Miejsce: `packages/games/src/kampus-tour.ts:475-479`; wspólna funkcja `packages/games/src/core.ts:221`.
- Źródło: `ZASADY.md` §3 („Wspólne funkcje z `core.ts` zamiast własnych: `shuffle`…”). `ZASADY-GIER.md` nie podaje powodu.
- Waga: **niska** (bez wpływu na gracza). `git blame`: pętla z 2026-10-07 (`24c783e`), `shuffle` w `core.ts` z 2026-10-08 (`0178866`), więc to zaszłość, nie decyzja.
  Algorytm jest identyczny (Fisher-Yates od końca, `Math.floor(rng() * (i + 1))`), więc zamiana nie zmieni talii dla żadnego seeda. To jedyna gra z własną kopią
  (grep `rng() \* (i + 1)`: tylko `core.ts` i `kampus-tour.ts`).
- Propozycja (popraw kod): `deck: shuffle(CARDS.map((_, i) => i), rng)`.

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

Zasady z `ZASADY-GIER.md` §6 (Plansza, Pola specjalne, Karty Dziekanatu, Limit tury i widok) → test w `kampus-tour.test.ts`:

| Zasada (ZASADY-GIER §6) | Test |
|---|---|
| 32 pola, rogi 0 / 11 / 16 / 27 (:650) | :101 |
| pola kart 5, 13, 21; Opłata 28 (:652) | :110 |
| 8 grup: indeksy, nazwy, ceny (:652-668) | :115 (pełna tabela), :137 (suma 675 zł) |
| Ksero 7, Stołówka 29, po 30 zł (:658) | :132 |
| Kolokwium: samo stanięcie nic nie robi (:706) | :704 |
| Kolokwium przez trzeci dublet albo kartę, bez kieszonkowego, koniec tury (:706) | :201, :642 |
| Kolokwium + Zaliczenie: zużywa, wraca na spód, rusza normalnie (:708) | :730 |
| Kolokwium + Zaliczenie: dublet daje kolejny rzut (:708) | LUKA (K7) |
| Kolokwium: dublet zdaje, bez dodatkowego rzutu (:709) | :710 |
| Kolokwium: inaczej tura przerwy, w kolejnej wolny (:710) | :719 |
| Juwenalia: kto ma pole, wybiera własne; bez pól nic (:711) | :820, :844, :852 |
| Juwenalia: × 2, potem × 3…, licznik wspólny dla wszystkich (:711) | :820, :835 (licznik ustawiony ręcznie, ten sam gracz; „wspólny” bez testu, K9) |
| Juwenalia: jedno pole naraz, nowe zastępują stare (:712) | :835 |
| MPK: tura kończy się od razu, także po dublecie (:713) | :875 |
| MPK: `travel` na dowolne inne pole, bez kieszonkowego, z rozliczeniem pola (:713) | :883, :909 |
| MPK: bez dodatkowego rzutu (:714) | LUKA (K8) |
| MPK: kości tylko do czynszu Ksero/Stołówki (:714) | :895 |
| MPK: zwykły rzut zużywa bilet (:715) | :903 |
| Opłata za akademik 15 zł do banku (:716) | :306, :358 |
| talia tasowana w `setup` (:719) | :567 |
| karta z wierzchu, efekt po ruchu `card`, tylko gracza na turze (:719) | :577 |
| karta wraca na spód; Zaliczenie zostaje u gracza (:719) | :591, :650 |
| +30 / +20 / +15 / +25 / −30 / −10 / −20 (:721) | :599 (`test.each`, 7 kart) |
| opłata z karty bez gotówki: sprzedaż, spłata do banku (:699, :721) | :611 |
| Korepetycje (:722) | :620 |
| Składka (:723) | :625, :630 |
| Remont (:724) | :637 |
| Spóźnienie (:725) | :642 |
| Zgubiona legitymacja (:726) | :656 |
| Idź na 0 / 31 / 16 / 1 z kieszonkowym, pole rozliczane (:727) | :662, :669, :676, :682 |
| Nocny autobus (:729) | :689 |
| `timeoutMove` w `pick`, `card`, `juwenalia` (:738) | :1025, :577, :866 |
| `playerView` ukrywa talię, `deckSize` (:740) | :567 |
| `events` = 4 ostatnie (:740) | :398 |
| `stats` do podsumowania (:741) | :1036, :1046, :1056, :1063 |

#### K7. Brak testu: Zaliczenie na Kolokwium plus dublet daje kolejny rzut
- Miejsce: `kampus-tour.test.ts:730` (tylko rzut 1+2); kod `kampus-tour.ts:641-646` z `doubles` z :634.
- Źródło: `ZASADY-GIER.md` §6 :708, `ZASADY.md` §2 („każda zasada z sekcji ma test”). Waga: **średnia**.
- Zachowanie poprawne (`cases.ts`: Zaliczenie, rzut 2+2 → pole 15, `waitingFor` = [gracz], faza `roll`).
- Propozycja: test „Zaliczenie i dublet: wychodzisz i rzucasz jeszcze raz”.

#### K8. Brak testu: jazda Biletem MPK nie daje dodatkowego rzutu, nawet gdy kości pokażą dublet
- Miejsce: `kampus-tour.test.ts:883`, `:895` (rzut 1+2, bez dubletu); kod `kampus-tour.ts:569` (`doubles: 0`).
- Źródło: `ZASADY-GIER.md` §6 :714. Waga: **średnia**. Zachowanie poprawne (`cases.ts`: `travel` z kośćmi 3+3 → tura przechodzi dalej).
- Propozycja: test „jazda MPK z dubletem na kościach kończy turę”.

#### K9. Licznik Juwenaliów „wspólny dla wszystkich” bez testu z dwoma graczami
- Miejsce: `kampus-tour.test.ts:835` (licznik `festivals: 1` wpisany ręcznie, ten sam gracz).
- Źródło: `ZASADY-GIER.md` §6 :711, `ZASADY.md` §2 („Jak pisać”: stan ruchami, nie wpisanym obiektem). Waga: **niska** (sam mnożnik ×3 jest sprawdzony).
- Propozycja: test, w którym A i potem B stają na Juwenaliach, B dostaje × 3.

#### K10. Widok obserwatora `""` bez testu
- Miejsce: `kampus-tour.test.ts:567` sprawdza widok gracza A; widok `""` nie jest sprawdzany. `[zbiorcze: widok-obserwatora]`
- Źródło: `ZASADY.md` §2 (ukryty stan: „widok obserwatora nie zawiera danych żadnej strony”). Waga: **niska** (`playerView` nie zależy od gracza, `kampus-tour.ts:660`).
- Propozycja: w teście :567 dodać `game.playerView(s, "")` bez `deck`.

Brakujące testy obowiązkowe z `ZASADY.md` §2 są wspólne dla obu części Kampus Tour i stoją niżej (K16-K19).

## Kampus Tour: tura, czynsz, budowa, wykupienie, dług (`kampus-tour`)

### Zasady (RULE-01)

- Stałe tury i ekonomii, kod ↔ `ZASADY-GIER.md` §6 ↔ `KONCEPT.md` §9 (:347):

| Stała | Kod | ZASADY-GIER §6 | KONCEPT §9 | Zgodne |
|---|---|---|---|---|
| gotówka startowa | `START_CASH = 200`, `SEAT_BONUS = 20` za dalsze miejsce (:6-8, :487) | 200 + 20 za miejsce (:671) | 200 (+20) | ✓ |
| kieszonkowe | `ALLOWANCE = 40` za każde przejście lub stanięcie na Początku (:10, :375-385) | 40 zł (:673) | 40 zł | ✓ |
| czynsz bez budynków | `baseRent = Math.round(P / 10)`, komplet × 2 (:276, :289-290) | P/10 zaokr., komplet × 2 (:683) | P/10, × 2 | ✓ |
| czynsz z budynkami | `LEVEL_RENT = [0.4, 1, 2, 4]`, bez × 2 (:33, :288) | 0,4P / P / 2P / 4P (:684) | to samo | ✓ |
| koszt budowy | `buildCost`: poziomy 1-3 `Math.round(P / 2)`, landmark P (:255-260) | :690 | – | ✓ |
| limit poziomu | `maxLevel`: bez kompletu 2, z kompletem 4 (:263-266) | :691 | „bez kompletu do poziomu 2” | ✓ (ale K11) |
| wykupienie | `2 * valueOf` (cena + budynki), bez landmarku, tylko gdy stać (:359-364) | :694-696 | – (KONCEPT §2.1 :43 też 2×) | ✓ |
| brak wykupu po sprzedaży | `land` → `pay` bez `offerBuyout` (:461-462) | :696 | – | ✓ |
| sprzedaż | `Math.floor(valueOf / 2)` (:271) | połowa wartości w dół (:699) | – | ✓ |
| bankructwo | gotówka po równo wierzycielom, reszta przepada, pola bez budynków (:319-337) | :701-702 | – | ✓ |
| dublety | kolejny rzut (:315), trzeci → Kolokwium bez ruchu (:653-654) | :674 | – (KONCEPT §2.1 :37) | ✓ |
| Kolokwium | Zaliczenie / dublet bez dodatkowego rzutu / tura przerwy (:639-655) | :706-710 | – | ✓ |
| Juwenalia | × (`festivals` + 2), jedno pole (:557-562) | :711 | – | ✓ |
| Bilet MPK | koniec tury, `travel` bez kieszonkowego i bez dodatkowego rzutu (:453, :564-573) | :713-715 | „jazda Biletem MPK bez kieszonkowego” | ✓ |
| rundy | `ROUNDS = 20`, koniec gdy `round > ROUNDS` (:5, :311) | 20 rund (:734) | – (KONCEPT §2.1 :58 też 20) | ✓ |
| monopol | 3 pełne `GROUPS`, Ksero i Stołówka poza (:369-370) | :733 | – | ✓ |
| remis | równy majątek dwóch pierwszych żywych bez monopolu → samo `ranking` (:694-695) | :734 | – | ✓ |
| ranking | żywi wg majątku (monopolista pierwszy), potem bankruci od ostatniego (:689-692) | :735 | – | ✓ |
| limit tury | `turnSeconds: 60` (:471) | 60 s (:9) | `KONCEPT.md` §3 :233: 60 s | ✓ |
| `timeoutMove` | `buy`/`build`/`buyout` → `skip`, `sell` najtańsze, reszta `roll` (:706-716) | :738 | – | ✓ |

- `KONCEPT.md` §9 ↔ `ZASADY-GIER.md` §6: wszystkie sześć wartości balansu zgodne, bez wpisu.
- `KONCEPT.md` §2.1 (:36-46) ↔ `ZASADY-GIER.md` §6: zgodne. „Monopol (np. 3 pełne grupy)” (:45) to skrót, liczba się zgadza.

#### K11. Budynki powyżej poziomu 2 zostają, gdy właściciel traci komplet grupy
- Miejsce: `kampus-tour.ts:263-266` (`maxLevel` sprawdzany tylko przy budowie, :538), `:611-626` (sprzedaż pola z grupy), `:575-588` (wykupienie pola z grupy).
- Źródło: `ZASADY-GIER.md` §6 Budowa (:691 „bez kompletu grupy najwyżej poziom 2; poziom 3 i landmark tylko z kompletem”); co dzieje się po utracie kompletu, dokument nie mówi.
  Zasada odczuwalna, tylko w kodzie (D-07).
- Waga: **średnia** (wpływa na czynsze i na to, czy pole da się wykupić; nie łamie żadnego zapisu wprost).
- Dowód (`cases.ts`): (a) A sprzedaje pole 18 z grupy 17-18-19, pole 17 zostaje landmarkiem bez kompletu, rywal płaci na nim 120 zł (4P) i nie może go wykupić;
  (b) A wykupuje pole 17 z kompletu B, B zostaje z polem 18 na poziomie 3 bez kompletu. `fuzz.ts`: stan „poziom > 2 bez kompletu” pojawia się w zwykłych losowych partiach.
- Propozycja (popraw dokument): dopisać w §6 Budowa „Budynki zostają, gdy komplet się rozpadnie (sprzedaż, wykupienie)”. Czy wykup albo sprzedaż mają zrzucać
  pozostałe pola grupy do poziomu 2, to decyzja balansu w fazie 3.

#### K12. Statystyka czynszu liczy pełną kwotę, gdy płacący bankrutuje
- Miejsce: `kampus-tour.ts:459-465` (zdarzenie `rent` z pełnym `amount` logowane przed `pay`), `:230-242` (`log` dolicza `rentPaid` i `tileIncome`), `:319-325` (bankrut oddaje tylko gotówkę).
- Źródło: `ZASADY-GIER.md` §6 :741 (`stats`: „zapłacony czynsz, dochód z pól”), `KONCEPT.md` §2.1 :60 (ekran podsumowania).
- Waga: **niska** (tylko ekran podsumowania `KampusSummary.tsx`; wynik i ranking poprawne).
- Dowód (`cases.ts`): czynsz 10 zł, płacący ma 1 zł → bankructwo, właściciel dostaje 1 zł, a `rentPaid` = 10 i `tileIncome[30]` = 10. `fuzz.ts`: 12 takich bankructw.
- Propozycja (popraw kod): przy bankructwie zapisać w `stats` faktycznie oddaną kwotę (np. zdarzenie `rent` z `amount` po rozliczeniu albo korekta w `goBankrupt`).

Obserwacja bez wagi: `pay` dzieli `amount / to.length` (:343) bez zaokrąglenia. Dziś zawsze daje liczbę całkowitą (Składka mnoży kwotę przez liczbę wierzycieli, :423;
czynsz ma jednego wierzyciela), `fuzz.ts` nie znalazł ułamka. Przy nowej karcie z podziałem kwoty warto zaokrąglać jak w `goBankrupt` (:322).

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch neutralny w każdej fazie | ✓ `roll`, `buy`, `build`, `buyout`, `sell` | 01-01-CHECKS.md (roll, buy); `fuzz.ts`: `timeoutMove` każdego czekającego w 1200 partiach, 0 odrzuconych, w tym `build`, `buyout`, `sell` |
| remis bez zwycięzcy | ✓ | `kampus-tour.ts:694-695`; 01-01-CHECKS.md (remis 1/10 bez zwycięzcy); `fuzz.ts` (2/1200 bez zwycięzcy); test :784 |
| start od pierwszego z `players` | ✓ po `pick` rzuca `players[0]` (`turn: 0`, :488) | 01-01-CHECKS.md (start „wszyscy” = faza `pick`); test :1004 |
| tylko `rng` | ✓ kości `rng` (:567, :628) | 01-01-CHECKS.md §3 (grep pusty, 0 wywołań `Math.random`/`Date.now`, determinizm ✓) |
| stan JSON | ✓ | 01-01-CHECKS.md; `fuzz.ts` (round-trip po każdym ruchu, wszystkie typy) |
| brak mutacji | ✓ | `fuzz.ts` (stan zamrożony przed każdym `applyMove`, 10 typów ruchów, 8 faz) |
| `ranked` / `places` | n/d (gra główna; własny ranking :689-692 opisany w §6 :735) | – |
| wspólne funkcje `core.ts` | patrz K6 (talia); kości i ranking nie mają odpowiednika w `core.ts` | – |

Odstępstwa z powodem (D-11): brak. Premia za miejsce (`SEAT_BONUS`, :7-8) nie jest odstępstwem od §3 (start dalej od `players[0]`), powód jest w `ZASADY-GIER.md` :671.

### Testy (RULE-03)

Zasady z `ZASADY-GIER.md` §6 (Start i tura, Pola do kupienia, Czynsz, Budowa, Wykupienie, Dług, Koniec gry, `timeoutMove`) → test w `kampus-tour.test.ts`:

| Zasada (ZASADY-GIER §6) | Test |
|---|---|
| 2-4 graczy, 6 postaci (:648) | :165 |
| gotówka 200 + 20 za dalsze miejsce (:671) | :144 (n = 2, 3, 4) |
| `pick` naraz, każda postać raz (:672) | :995, :1012, :1020 |
| po `pick` tury od `players[0]` (:672) | :1004 |
| rzut dwiema kośćmi, ruch o sumę (:673) | :178 |
| przejście przez Początek albo stanięcie na nim: 40 zł (:673) | :185 (stanięcie na 0), :662, :676, :682 (przejście) |
| dublet: kolejny rzut po rozliczeniu pola (:674) | :193, :508 |
| trzeci dublet: Kolokwium bez ruchu (:674) | :201 |
| fazy po rzucie (:675) | `index.test.ts:121` (8 faz odwiedzonych) |
| wolne pole: `buy`, jeśli stać; nie stać: nic (:678) | :226, :249 |
| `skip` zostawia pole wolne (:678) | :241 |
| kupno/pominięcie tylko w fazie kupna | :255 |
| własne pole, też po kupnie i wykupieniu: `build` (:679) | :275, :491, :922 |
| cudze pole: czynsz, potem wykupienie (:680) | :262 |
| P/10 zaokrąglone, komplet × 2 (:683) | :262, :269, :281 |
| poziomy 1-4: 0,4P / P / 2P / 4P, bez × 2 (:684) | :516 (`test.each`, 4 poziomy) |
| Ksero / Stołówka × 2 / × 5, bez budowy (:685) | :286, :293, :298, :499 |
| Juwenalia i Nocny autobus mnożą czynsz (:686) | :820, :689 |
| budowa tylko na polu pod pionkiem, kilka poziomów naraz (:689) | :452, :463 |
| koszt: P/2 zaokrąglone, landmark P (:690) | :445 |
| bez kompletu do 2, poziom 3 i landmark z kompletem (:691) | :471 |
| budowa ponad gotówkę odrzucona, bez pieniędzy brak fazy (:679) | :484 |
| wykupienie za 2 × wartość, pieniądze dla właściciela, budynki zostają (:694) | :922 |
| landmarku nie da się wykupić (:696) | :944 |
| oferta tylko, gdy stać (:696) | :949 |
| brak oferty, gdy na czynsz trzeba było sprzedawać (:696) | LUKA (K13) |
| `skip` wykupu kończy turę | :938 |
| wykup zamykający grupę: komplet, monopol (:733) | :954, :978 |
| `sell`, gdy gotówka + sprzedaż wystarczy (:699) | :315, :611 |
| sprzedaż za połowę wartości z budynkami, zaokrąglone w dół (:699) | :527 (z budynkami); zaokrąglenie w dół LUKA (K15) |
| sprzedaż aż starczy, dług spłaca się sam (:700) | :383 |
| dług równy gotówce: bez sprzedaży (:699) | :365 |
| bankructwo: gotówka do wierzycieli po równo, reszta przepada (:701) | :333 (jeden wierzyciel), :358 (bank); kilku wierzycieli LUKA (K14) |
| bankructwo: pola do banku bez budynków (:702) | :341, :538 |
| pole wracające do banku traci Juwenalia (:703) | :858 (sprzedaż); bankructwo LUKA (K14) |
| koniec: zostaje jeden gracz (:732) | :333, :372 |
| monopol: 3 grupy, od razu, niezależnie od majątku, Ksero/Stołówka się nie liczą (:733) | :969, :978, :984, :808 |
| limit 20 rund, majątek z budynkami (:734) | :758, :549, :797 |
| równy majątek na górze: remis bez zwycięzcy (:734) | :784, :791 |
| ranking: żywi wg majątku, bankruci od ostatniego (:735) | :372, :776, :808 |
| `timeoutMove`: `roll`, `buy`, `build`, `buyout`, `sell`, Kolokwium (:738) | :745, :557, :960, :751, :739 |

#### K13. Brak testu: po przymusowej sprzedaży nie ma oferty wykupu
- Miejsce: `kampus-tour.test.ts:315`, `:383` kończą się bez fazy `buyout`, ale gracz i tak nie ma na wykup (4 zł i 1 zł gotówki), więc test nie odróżnia reguły od braku pieniędzy.
  Kod: `kampus-tour.ts:461-462`.
- Źródło: `ZASADY-GIER.md` §6 :696. Waga: **średnia**.
- Propozycja: test, w którym po sprzedaży gracz ma gotówkę ≥ 2 × wartość pola, a faza i tak przechodzi dalej.

#### K14. Brak testów bankructwa przy kilku wierzycielach i utraty Juwenaliów przy bankructwie
- Miejsce: `kampus-tour.ts:322` (`Math.floor(s.cash[player] / to.length)`), `:326` (`dropFestival`); testy :333 i :372 mają jednego wierzyciela, :858 sprawdza tylko sprzedaż.
- Źródło: `ZASADY-GIER.md` §6 :701 („po równo, reszta przepada”), :703. Waga: **średnia**.
- Zachowanie poprawne (`cases.ts`: Składka przy 4 graczach i 7 zł → wierzyciele po 2 zł, 1 zł przepada; bankrut z polem z Juwenaliami → `juwenalia: null`).
- Propozycja: dwa testy: „bankructwo na Składce: gotówka po równo, reszta przepada” i „bankructwo właściciela kasuje Juwenalia”.

#### K15. Zaokrąglenie w dół przy sprzedaży nieprzetestowane
- Miejsce: `kampus-tour.ts:271`; testy :315 (10 → 5), :527 (60 → 30), :611 (30 → 15) mają tylko parzyste wartości.
- Źródło: `ZASADY-GIER.md` §6 :699 („zaokrąglone w dół”), `ZASADY.md` §2 (wartości brzegowe). Waga: **niska**.
- Zachowanie poprawne (`cases.ts`: pole 3 za 15 zł daje 7 zł). Propozycja: test na polu 3 albo 12 (nieparzysta wartość).

#### K16. Brak testu definicji: `turnSeconds` i „świeża gra nie jest skończona”
- Miejsce: `kampus-tour.test.ts:165` sprawdza `minPlayers` i `maxPlayers`; `turnSeconds` (`kampus-tour.ts:471`) i `isOver(setup(...))` bez testu. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja. Waga: **średnia**. Zachowanie poprawne (`cases.ts`: `isOver` świeżej gry = `null`; 01-01-CHECKS.md §3: 60 s).
- Propozycja: w teście :165 dopisać `turnSeconds === 60` i `isOver(setup) === null`.

#### K17. Brak testów schematu ruchu
- Miejsce: `kampus-tour.test.ts` nie woła `moveSchema`; `index.test.ts:72`, `:81` sprawdzają tylko, że poprawny ruch przechodzi (01-01-CHECKS.md §4.2, kolumna Sch). `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat. Waga: **średnia**.
- Propozycja: test „schemat odrzuca śmieci”: nieznany `type`, `pick` bez `character`, `character: 1.5`, `tile: 32`, `tile: -1`, `build` z `level: 0` i `5`, `level: "2"`.

#### K18. Wartości brzegowe sprawdzone tylko z jednej strony
- Miejsce: kupno przy gotówce równej cenie bez testu (:249 tylko 9 < 15); wykup przy gotówce równej cenie bez testu (:949 tylko 29 < 30); budowa przy gotówce
  równej kosztowi bez testu (:484 tylko 14 i 20 wobec 15); postać 5 przechodzi (:998), 6 nie (:1016), ale −1 bez testu; pola 0 i 31 w `travel`/`sell`/`juwenalia` bez testu.
  Jedyny pełny brzeg: dług równy gotówce (:365). `[zbiorcze: brzegi]`
- Źródło: `ZASADY.md` §2 Walidacja („pierwsza i ostatnia dozwolona przechodzą, sąsiednie nie”, D-03). Waga: **średnia**.
- Propozycja: pary testów „równo stać: przechodzi / złotówki brakuje: nie” dla `buy`, `buyout`, `build`; `travel` na 0 i 31.

#### K19. Brak testu, że `applyMove` nie zmienia poprzedniego stanu i że stan przeżywa JSON
- Miejsce: brak w `kampus-tour.test.ts` i w `index.test.ts` (01-01-CHECKS.md §4.2, kolumny St1, St2). `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan. Waga: **średnia**. Zachowanie poprawne (`fuzz.ts`: stan zamrożony, round-trip, wszystkie fazy).
- Propozycja: jeden test na partii ruchami (np. ścieżka kupno → budowa → wykup → sprzedaż) z `Object.freeze` i `JSON.parse(JSON.stringify(s))`.

#### K20. Nagłówek i nazwy testów nie nadążyły za zmianami zasad
- Miejsce: `kampus-tour.test.ts:9` („20 zł kieszonkowego”, od `0086efc` 2026-10-07 jest 40 zł, test :185 sprawdza 40); `:13` i `:315` („za połowę ceny”, jest połowa wartości z budynkami);
  `:19` („landmark (4) P i wymaga kompletu”, kompletu wymaga już poziom 3, `f06d59e`); `:26` i `:758` („gotówka + ceny pól”, majątek liczy budynki, test :549).
- Źródło: `ZASADY.md` §2 („nagłówek pliku to lista zasad”, „nazwy testów opisują zasadę”), D-02. Waga: **niska**.
- Propozycja (popraw test, tylko komentarze i nazwy): zsynchronizować nagłówek z `ZASADY-GIER.md` §6.

### Testy obowiązkowe z `ZASADY.md` §2 (podsumowanie dla `kampus-tour.test.ts`)

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max | ✓ | :165 |
| Definicja: `turnSeconds`, świeża gra nieskończona | LUKA | K16 |
| Setup: stan początkowy, kto zaczyna | ✓ | :144, :1004 |
| Setup: różne seedy różne, ten sam seed to samo | ✓ | :567 (talia) |
| Walidacja: gracz spoza gry | ✓ | :175, :1017; `index.test.ts:83` |
| Walidacja: poza turą, zła faza | ✓ | :174, :230-231, :255, :504, :582-584, :1021 |
| Walidacja: poprawny kształt, niedozwolony | ✓ | :1012 (zajęta postać), :484 (za mało pieniędzy), :321 (cudze pole), :844, :909 |
| Walidacja: po końcu gry | ✓ | :771 |
| Walidacja: wartości brzegowe | LUKA (częściowo) | K18 |
| Schemat | LUKA | K17 |
| Każda zasada z §6 | LUKA (częściowo) | tabele wyżej: K7, K8, K9, K13, K14, K15 |
| Koniec: wygrana każdego gracza | ✓ | A: :549, :969; B: :333, :758; C: :372, :791 |
| Koniec: remis | ✓ | :784 |
| Koniec: ranking w dobrej kolejności | ✓ | :372, :758, :776, :808 |
| Koniec: `waitingFor` puste | ✓ | :338, :380, :769 |
| Limit czasu: `timeoutMove` w każdej fazie przechodzi `validateMove` | ✓ (D-04) | testy gry porównują ruch z oczekiwanym (:557, :751, :866, :960), `validateMove` sprawdza `index.test.ts:72-73` we wszystkich 8 fazach (`index.test.ts:121`) |
| Stan: brak mutacji, JSON | LUKA | K19 |
| Typ: fazy równoczesne (`pick`): `waitingFor` kurczy się | ✓ | :995 (01-01 dawało N tylko dla `index.test.ts`) |
| Typ: fazy równoczesne: `turn().key` | n/d | gra nie ma `turn()` |
| Typ: fazy równoczesne: min i max graczy | ✓ | :144 (2, 3, 4), `index.test.ts:57` |
| Typ: ukryty stan (talia): widok gracza | ✓ | :567 |
| Typ: ukryty stan: widok obserwatora `""` | LUKA | K10 |

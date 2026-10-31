# 03-05 FINDINGS: mini-gry na czas i reakcję

**Data:** 2026-10-24 · **Plan:** 03-05 (fala 2) · **Gry:** `refleks`, `simon`, `stoper`, `stoj`, `rytm`, `przytrzymaj`, `zaslona`, `balon`.
Liczby z `03-01-CHECKS.md` (§1 stałe, §2 symulacja), limit i progi z `03-02-BASELINE.md` (§1.2 model, §2 progi). Wpisy z prefiksem `B-` (balans), żeby nie myliły się z F1/F2.
Pewność: **W** wyliczone, **Z** zmierzone, **A** założenie. Repo poza `.planning/` bez zmian.

## Refleks (`refleks`)

**Do zdobycia (REC-01)**
- 12 bodźców w każdej partii (`packages/games/src/refleks.ts:5`), wynik to średnia, więc liczba prób jest stała. Zgodne z `ZASADY.md` :101 (wzorzec wprost wymieniony w regule).
- Opóźnienia 1-3 s losowane osobno (`:36`): suma 17,5-30,0 s (rozrzut 8,5%, Z), najkrótsze 1,00-1,88 s, liczba opóźnień poniżej 1,5 s 0-8 (Z).
  Wynik to czas od bodźca, więc suma zmienia tylko długość partii. Krótkie opóźnienia zwiększają ryzyko falstartu przy graniu „na wyczucie”, ale rozkład jest ten sam dla wszystkich partii (jednostajny 1-3 s). Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit teoretyczny 100 ms (`MIN_REACTION_MS`, `:6`), praktyczny ok. 200-230 ms średniej z 12 na telefonie (A, BASELINE §2). Wynik w ms całkowitych, rozrzut dobrych graczy kilkadziesiąt ms: remis na szczycie mało prawdopodobny (ryzyko niskie, A). `tie` niepotrzebne.
- `timeoutMove` = 1000 ms (`:58`), czyli najgorszy wynik. Zgodne.
- F2:U28 (RF4): czas liczony od `setPhase("go")` (`apps/web/src/games/Refleks.tsx:154`), a nie od klatki, w której bodziec się narysował. Daje to błąd systematyczny ok. jednej klatki
  (8-17 ms przy 120 / 60 Hz, W) plus opóźnienie ekranu i dotyku zależne od telefonu (50-100 ms, A). Przy wyniku ok. 250 ms różnica między telefonami to kilka do kilkunastu procent.
  Usunąć da się tylko część klatkową (start od `requestAnimationFrame` po narysowaniu). Rekordy porównują wyniki z różnych telefonów; tego się nie wyrówna.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Stała trudność różnicuje przez czas reakcji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = suma opóźnień (najwięcej 30,0 s zmierzone, 36 s teoretycznie) + 12 × do 1 s reakcji (kara po 1 s, `Refleks.tsx:157`) + 3 s sieci = 45 s (teoretycznie 51 s), W.
  L = 60 s (`:31`): zapas 15 s (33%), w teoretycznym maksimum 9 s (18%). Teoretyczne 36 s wymaga 12 opóźnień po 3 s i praktycznie nie występuje (p95 = 27,3 s). Zgodne.

**Rekomendacja:** zostawić. Opcjonalnie start pomiaru od klatki z bodźcem (B-RF1).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-RF1 (F2:U28 RF4) | `apps/web/src/games/Refleks.tsx:154`, `:167` | `ZASADY.md` §5 (pomiar czasu), §3 :100 (porównywalność rekordów) | niska | `goAt` z `requestAnimationFrame` po narysowaniu bodźca; różnic sprzętu nie da się usunąć, więc dopisać w `ZASADY-GIER.md` §Refleks, że rekordy zależą od telefonu `[zbiorcze: pomiar-od-klatki]` | zmienić (tanio) | W (klatka), A (sprzęt) |

## Sekwencja (`simon`)

**Do zdobycia (REC-01)**
- Sekwencja 100 kolorów osobnym `rng()` (`packages/games/src/simon.ts:30`). Powtórzenia koloru z rzędu w pierwszych 20: 0-11, mediana 5 (rozrzut 38%, Z).
  Czy powtórzenia ułatwiają, czy utrudniają (dwa razy to samo pole łatwo zgubić), nie wiadomo (A). Długość serii, którą da się zrobić, nie zależy od losowania. Bez wpisu, do sprawdzenia w partii.

**Sufit i remisy (REC-02, REC-03)**
- Sufit teoretyczny 100 (`:5`), ale limit ucina partię dużo wcześniej (niżej). Wynik całkowity bez `tie` (`:41`). Typowe serie 9-12, dobrzy 15-20 (A, BASELINE §2): przy tylu graczach o podobnym poziomie
  równe serie zdarzają się często, a remis rozstrzyga tylko data (wcześniejszy wyżej). `ZASADY-GIER.md` :76-78 nie przewiduje drugiego kryterium.
- `timeoutMove` = 0 (`:45`): przekroczenie limitu kasuje całą serię (F1:SQ1).

**Krzywa trudności (DIFF-01)**
- Długość +1 na rundę, tempo stałe: 450 ms świecenia i 150 ms przerwy (`apps/web/src/games/Simon.tsx:21-22`). Trudność rośnie tylko z pamięcią (próg 5-7 dla sekwencji przestrzennej, A).
  Krzywa sensowna: pierwsze 5 rund przechodzi prawie każdy (nie różnicują, ale trwają razem ok. 20 s). Bez wpisu.

**Limit tury (DIFF-02)**
- BASELINE §1.3: seria N kosztuje `N + (0,6 + d)·N(N+1)/2` s. Przy d = 0,5 s na kolor: seria 15 = 147 s, seria 20 = 251 s, seria 22 = 300,3 s (W, d to A).
  L = 300 s (`:25`) ucina serię 21-24 (zależnie od tempa wpisywania), a z wymaganym zapasem mieści serię 18-21. To zasięg dobrych graczy. Potwierdza F1:SQ1 jako wysoki wpis.
  Wynik oddawany jest dopiero po pomyłce (`Simon.tsx`, bez `progress`), więc limit kasuje całą serię zamiast ją zachować.

**Rekomendacja:** zmienić. Limit nie może kasować rekordowej serii; potrzebne jest też drugie kryterium albo zgoda na remisy.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SQ1 (F1:SQ1, F1:Z2) | `packages/games/src/simon.ts:25`, `:45`; `apps/web/src/games/Simon.tsx:61-64` | `ZASADY.md` §3 :106 | **wysoka** | ruch `progress` z bieżącą serią i `timeoutMove` oddający ostatnią zaliczoną (odstępstwo z powodem w `ZASADY-GIER.md` §Sekwencja) albo limit 600 s; zapis wzoru T(N) w dokumencie `[zbiorcze: limit-tury-bez-zapasu]` | zmienić | W (wzór), A (d) |
| B-SQ2 | `packages/games/src/simon.ts:41` | D-05 (remisy na szczycie), `ZASADY-GIER.md` :76-78 | średnia | `tie` = czas wpisywania ostatniej serii (mniej lepiej) albo jawny zapis w `ZASADY-GIER.md`, że remis rozstrzyga data `[zbiorcze: sufit-bez-tie]` | sprawdzić w partii (jak często równe serie) | A |

## Stoper (`stoper`)

**Do zdobycia (REC-01)**
- Cel 6-14 s co 1 s (`packages/games/src/stoper.ts:30`), mediana 10 s, rozrzut 26% (Z). Sufit (0 ms) jest stały, ale trudność nie: przy odtwarzaniu czasu błąd rośnie z długością
  (prawo skalarne, zmienność 10-15%, A, BASELINE §2). Oczekiwana odchyłka ok. 0,8 × 0,1 × cel = **480 ms przy 6 s i 1120 ms przy 14 s** (W z założenia): ten sam gracz ma 2,3× gorszy wynik tylko przez losowanie.
  Rekord padnie prawie na pewno w partii z celem 6 s. To największy efekt losowania w tej grupie. Potwierdza F1:W6a.
- Jedna próba na partię: wynik to w dużej mierze los jednej próby (rozrzut wyniku tego samego gracza jest rzędu samej odchyłki).

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0 ms, wynik ciągły w ms: remisy na szczycie rzadkie (niskie), `tie` niepotrzebne. `timeoutMove` = odchyłka równa celowi (`:43`), najgorsza możliwa. Zgodne.
- F2:U28 (SP2): pomiar z `performance.now` przy dotknięciu względem startu zapisanego z wyprzedzeniem `COUNT_MS` (`apps/web/src/games/Stoper.tsx:102`). Błąd klatkowy ok. 8-17 ms przy odchyłkach setek ms jest bez znaczenia. Bez wpisu.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 3 s odliczania + do 2 × cel (klient kończy sam, `ZASADY-GIER.md` :82; najwięcej 28 s) + 3 s sieci = 34 s (W). L = 60 s: zapas 26 s (76%). Zgodne.

**Rekomendacja:** zmienić losowanie celu.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SP1 (F1:W6a, F1:Z3) | `packages/games/src/stoper.ts:30` | `ZASADY.md` §3 :100 | średnia (największy efekt w grupie: 2,3×) | stały cel (np. 10 s) albo kilka rund z celami o stałej sumie (`withSum`, jak Przytrzymaj); alternatywa: wynik względny (‰ celu). Zmiana wyniku = osobny klucz rekordów (wersja w `stats.ts`) `[zbiorcze: trudnosc-z-losowania]` | zmienić | W, A (prawo skalarne) |

## Stój! (`stoj`)

**Do zdobycia (REC-01)**
- Harmonogram stały (`packages/games/src/stoj.ts:14-20`): 41 bodźców, 27 zielonych i 14 czerwonych w każdej partii (Z, 0% rozrzutu). Zgodne z `ZASADY.md` :101-102.
- Losowe jest tylko położenie czerwonych (`:54`): zielonych w szybkiej końcówce (ostatnie 10 s, odstęp 670-500 ms) jest 6-16, mediana 11 (rozrzut 14,5%, Z).
  Zielone przy krótkim odstępie są trudniejsze (okno 500 ms przy reakcji go / no-go 300-400 ms, A). Wpływ na wynik to pojedyncze trafienia. Niska waga, do sprawdzenia w partii.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 27 pkt (W). Bardzo dobry gracz może zrobić 27 bez błędu: okno co najmniej 500 ms, reakcja 300-400 ms (A). Remis na 27 rozstrzyga średnia reakcji (`:80`) zaokrąglona do ms;
  przy 27 czasach równość co do ms jest rzadka (ryzyko niskie, A). `timeoutMove` = 0 pkt (`:84`). Zgodne.
- F2:U28 (SJ2): pomiar od zmiany stanu, nie od klatki (jak Refleks). Ma znaczenie tylko dla `tie` i progu 100 ms. Dołącza do B-RF1.

**Krzywa trudności (DIFF-01)**
- Odstęp maleje liniowo 1000 → 500 ms (`:6-7`, `:16`), świecenie 60% odstępu (`:9`), ale dotknięcie liczy się do następnego bodźca. Końcówka jest na granicy go / no-go (A), nie poza nią. Krzywa zgodna, bez wpisu.

**Limit tury (DIFF-02)**
- T = 30 s gry (`:4`) + 3 s sieci = 33 s (W). L = 60 s: zapas 27 s (82%). Zgodne.

**Rekomendacja:** zostawić. Opcjonalnie czerwone potasowane w trzech tercjach czasu, po równo w każdej (B-SJ1).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SJ1 | `packages/games/src/stoj.ts:54-55` | `ZASADY.md` §3 :102 (komplety) | niska | czerwone tasowane osobno w każdej tercji harmonogramu (stała liczba zielonych w szybkiej końcówce) | sprawdzić w partii | Z (rozrzut), A (wpływ) |
| B-SJ2 (F2:U28 SJ2) | `apps/web/src/games/Stoj.tsx:53`, `:71` | jak B-RF1 | niska | jak B-RF1 `[zbiorcze: pomiar-od-klatki]` | zmienić (tanio) | W |

## Rytm (`rytm`)

**Do zdobycia (REC-01)**
- Tempo 70-130 BPM co 5 (`packages/games/src/rytm.ts:8-10`, `:50`), odstęp 462-857 ms, mediana 600 (rozrzut 20%, Z). Wynik to średnia odchyłka odstępu w **ms bezwzględnych** (`:35`).
  Przy stukaniu kontynuacyjnym zmienność to 3-5% odstępu (A, BASELINE §2), czyli **14-23 ms przy 130 BPM i 26-43 ms przy 70 BPM**: ten sam gracz ma ok. 1,9× gorszy wynik w wolnym tempie.
  Rekord padnie w partii z szybkim tempem. Potwierdza F1:W6a.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0 ms (nieosiągalny), wynik w ms całkowitych. Najlepsze wyniki będą się skupiać w kilkunastu ms, więc remisy co do ms są możliwe, ale rzadkie (ryzyko niskie). `timeoutMove` = `interval` (`:69`), najgorszy wynik. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 1 s wstępu (`apps/web/src/games/Rytm.tsx:16`) + 8 × do 857 ms + 10 s (`:7`) + 3 s sieci = 20,9 s (W). L = 60 s: zapas 39 s (187%). Grający nie widzi limitu, ale limit i tak go nie dotyczy. Zgodne.

**Rekomendacja:** zmienić miarę wyniku.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-RY1 (F1:W6a, F1:Z3) | `packages/games/src/rytm.ts:35`, `:50` | `ZASADY.md` §3 :100 | średnia | odchyłka względna (‰ albo % odstępu) albo stałe tempo; zmiana wyniku = nowy klucz rekordów i nowy `FORMAT` `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (prawo skalarne) |

## Przytrzymaj (`przytrzymaj`)

**Do zdobycia (REC-01)**
- Suma celów 15 000 ms w każdej partii (`packages/games/src/przytrzymaj.ts:40`, `withSum`; 0% rozrzutu, Z). Zgodne z `ZASADY.md` :101.
- Gdy błąd rośnie liniowo z celem (prawo skalarne, A), stała suma daje stały oczekiwany błąd partii niezależnie od rozkładu celów. Suma kwadratów celów (miara przy zależności nieliniowej) różni się o 5% (45-59 s², Z). Bez wpisu.
- Ucięcie odchyłki do celu: krótki cel ma mniejszą maksymalną karę, ale dotyczy to tylko grubych pomyłek. Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0 ms, wynik ciągły: remisy niskie. `timeoutMove` = suma celów (`:64`), najgorszy wynik. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 5 × (1 s wstępu + cel + trzymanie do 2 × celu, potem klient kończy sam + 1,5 s odsłony) + 3 s = 5 + 15 + 30 + 7,5 + 3 = 60,5 s w najgorszym przypadku (W;
  `apps/web/src/games/Przytrzymaj.tsx:17`, `:19`). L = 120 s: zapas 59,5 s (98%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Za zasłoną (`zaslona`)

**Do zdobycia (REC-01)**
- Suma czasów za zasłoną 20 000 ms (`packages/games/src/zaslona.ts:45`, `withSum`; 0%, Z). Zgodne z `ZASADY.md` :101.
- Widoczność losowana swobodnie (`:32`): suma 8,3-14,2 s (rozrzut 8,8%), stosunek ukryty / widoczny 11-20 (10%, Z). Krótka widoczność daje mniej informacji o prędkości,
  więc partia z krótką widocznością jest trudniejsza (A). Efekt umiarkowany i nieznany co do wielkości.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0 ms, wynik ciągły: remisy niskie. W lokalnej bazie 9 wyników 3509-20 000 ms (03-01 §3), z czego część to limit (20 000). `timeoutMove` = suma ukrytych (`:68`). Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T najgorszy (gracz nie dotyka, klient kończy rundę po 2 × ukryty czas): 8 × (1 s + 1,5 s odsłony) + widoczność do 14,2 s + 2 × 20 s + 3 s = 77,2 s (W; `apps/web/src/games/Zaslona.tsx:16`, `:18`).
  L = 120 s: zapas 42,8 s (55%). Zgodne.

**Rekomendacja:** sprawdzić w partii, czy krótka widoczność wyraźnie podnosi błąd. Jeśli tak, stała suma widoczności (B-ZS1).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-ZS1 | `packages/games/src/zaslona.ts:32`, `:46-48` | `ZASADY.md` §3 :100 | niska | widoczność też przez `withSum` (np. suma 11 200 ms) albo stały stosunek widoczność / ukryty | sprawdzić w partii | Z (rozrzut), A (wpływ) |

## Balon (`balon`)

**Do zdobycia (REC-01)**
- Suma wytrzymałości 155 (`packages/games/src/balon.ts:53`, `withSum`; 0%, Z). Litera `ZASADY.md` :101 spełniona.
- Rozkład pojedynczych balonów zmienia wynik tej samej strategii: „stop na 10” daje 50-100 pkt (mediana 70, rozrzut 12%), „stop na 15” 45-120 (16%),
  najlepsza stała strategia z wiedzą po fakcie 72-126 (10%, Z). Balony z wytrzymałością ≤ 3 (prawie zawsze pękają przy każdej strategii): 0-3 na partię.
  Dla gry z ryzykiem to więcej niż w grach z błędem liniowym: `withSum` wyrównuje sumę, ale nie szanse (BASELINE §3.1).

**Sufit i remisy (REC-02, REC-03)**
- Sufit teoretyczny 155 (wymaga wiedzy o wytrzymałości), praktyczny ok. 70-100 (A, z symulacji strategii). Remis na szczycie: wynik całkowity w zakresie kilkudziesięciu punktów,
  `tie` = pęknięte balony (0-10, `:73`), więc rozstrzyga słabo; ryzyko remisu całkowitego niskie do średniego (A). `timeoutMove` = 0 pkt, 10 pękniętych (`:77`). Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 155 stuknięć × 0,3 s + 10 zgarnięć × 1 s + 10 × 0,8 s pauzy (`apps/web/src/games/Balon.tsx:16`) + 3 s = 67,5 s (W). L = 120 s: zapas 52,5 s (78%). Zgodne.

**Rekomendacja:** zmienić losowanie na stały zestaw wytrzymałości w losowej kolejności (te same balony w każdej partii, inna kolejność).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-BL1 | `packages/games/src/balon.ts:53` | `ZASADY.md` §3 :100 („tyle samo do zdobycia”) | średnia | stały komplet 10 wytrzymałości o sumie 155 tasowany co partię (jak Tort); ten sam pomysł pasuje do Przytrzymaj i Za zasłoną, gdyby partie pokazały wpływ rozkładu `[zbiorcze: withsum-rozklad]` | zmienić | Z |

## Wpis platformy: odnawianie limitu w grze wieloosobowej

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-PL1 | `apps/server/src/LobbyRoom.ts:375-376`; stały `key`: `balon.ts:45`, `kropki.ts:52`, `kat.ts:45`, `sudoku.ts:86`, `rok.ts:216`, `schulte.ts:37`, `wieza.ts:72` | `ZASADY.md` §3 :106, `KONCEPT.md` §3 (limit po ekranie instrukcji) | niska | w mini-grach bez `turn()` oddanie wyniku przez jednego gracza daje reszcie pełny limit od nowa, w 7 grach ze stałym `key` nie. Wolny gracz w grze wieloosobowej ma więc w Refleksie do 2 × 60 s, a w Balonie zawsze 120 s. Ujednolicić: stały `key` dla wszystkich mini-gier (jeden limit od startu) i dopisać w `KONCEPT.md` §3 `[zbiorcze: limit-odnawiany-wynikiem]` | zmienić (tanio) | W |

## Podsumowanie grupy

| gra | REC-01 | REC-02/03 | DIFF-01 | DIFF-02 | rekomendacja |
|---|---|---|---|---|---|
| `refleks` | ✓ | ✓ (B-RF1 niska) | bez progresji | ✓ 33% | zostawić |
| `simon` | ✓ (do partii) | B-SQ2 średnia | ✓ | **B-SQ1 wysoka** | zmienić |
| `stoper` | B-SP1 średnia | ✓ | bez progresji | ✓ 76% | zmienić |
| `stoj` | B-SJ1 niska | ✓ | ✓ | ✓ 82% | zostawić |
| `rytm` | B-RY1 średnia | ✓ | bez progresji | ✓ 187% | zmienić |
| `przytrzymaj` | ✓ | ✓ | bez progresji | ✓ 98% | zostawić |
| `zaslona` | B-ZS1 niska | ✓ | bez progresji | ✓ 55% | sprawdzić w partii |
| `balon` | B-BL1 średnia | ✓ | bez progresji | ✓ 78% | zmienić |

Wpisy: wysokie 1, średnie 4, niskie 5 (w tym B-PL1).

# 01-01: hurtowe sprawdzenie reguł §3 i mapa pokrycia testów kontraktowych

Stan repo: gałąź `labirynt`, HEAD `8a15cff`, 2026-10-23. Dowód RULE-02 (§3) i RULE-03 (§2) dla planów 01-03..01-09.

## 1. Metoda

Skrypt `checks.ts` (załącznik A) leży w scratchpadzie sesji, poza repo. Uruchomienie bez nowych zależności (Node 24, wbudowane usuwanie typów):

```sh
node --experimental-strip-types checks.ts /home/figielak/Documents/Projects/kwadrans > wynik.json
```

Dla każdej gry z `GAMES` (38 id), każdego trybu z `modes` (razem 46 przypadków), liczby graczy `minPlayers` i `maxPlayers` oraz seedów 1-5
skrypt rozgrywa partię **wyłącznie** ruchami `timeoutMove` (ruch pierwszego gracza z `waitingFor`) do `isOver`, limit 100 000 kroków. Sprawdzenia:

| Kolumna | Co dokładnie sprawdza |
|---|---|
| timeoutMove | w każdym kroku `timeoutMove` **każdego** gracza z `waitingFor` przechodzi `moveSchema.safeParse` i `validateMove`; po końcu `waitingFor` = `[]`; w nawiasie fazy (`state.phase`) odwiedzone przez same timeouty |
| JSON | stan przed każdym ruchem i po końcu: brak `undefined`, `NaN`, `±Infinity`, funkcji, `Map`/`Set`/`Date`, oraz `JSON.parse(JSON.stringify(s))` głęboko równy `s` (`isDeepStrictEqual`) |
| mutacja | stan jest rekursywnie zamrażany (`Object.freeze`) przed `applyMove`; moduły ES działają w trybie ścisłym, więc każdy zapis rzuca; dodatkowo porównanie JSON przed i po |
| determinizm | dwa przebiegi z tym samym seedem dają identyczny ciąg ruchów i stan końcowy; `Math.random`, `Date.now`, `performance.now` i `new Date` są podmienione na liczniki wywołań w trakcie partii (wynik: 0 wywołań) |
| start | `waitingFor(setup(...))`: `p1` (gra po kolei albo solo) albo wszyscy (faza równoczesna); cokolwiek innego to błąd |
| remis | mini-gra: wszyscy grają `timeoutMove`, więc mają równy wynik; przy n > 1 `isOver` nie może dać `winner`, przy n = 1 też nie. Gra główna: `ranking[0] === winner`, w komórce rozkład wyników 10 partii (zwycięzca / remis bez zwycięzcy) |
| places/record | mini-gra: `places` niemalejące wzdłuż `ranking`, `ranking[0]` na 1. miejscu; znak porównania (`record.score`, potem `record.tie`) zgodny ze znakiem różnicy miejsc dla każdej pary graczy; same timeouty dają równe rekordy. W komórce wartość `record.score` (· `tie`) po limicie, czyli „najgorszy wynik” |
| playerView | widok każdego gracza i obserwatora `""` w każdym kroku i po końcu: brak `NaN`, `±Infinity`, funkcji, obiektów nie-JSON (pola `undefined` w widoku pominięte, JSON je po prostu gubi) |

**Kontrola skryptu.** Ten sam skrypt na pięciu celowo zepsutych kopiach Gomoku (załącznik B) zgłasza każdą wadę: mutacja stanu w `applyMove`
→ „mutacja”, `timeoutMove` spoza schematu → „timeoutMove”, `Math.random` w `setup` → „determinizm”, `NaN` w stanie → „JSON”,
start od ostatniego gracza → „start”. Zielone komórki poniżej nie wynikają więc z martwego sprawdzenia.

## 2. Wynik: gra × tryb

Wszystkie 46 przypadków bez błędów. Czas przebiegu: 6,4 s.

| gra | tryb | timeoutMove | JSON | mutacja | determinizm | start | remis | places/record | playerView |
|---|---|---|---|---|---|---|---|---|---|
| piec-w-rzedzie | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 5 | n/d (gra główna) | ✓ |
| labirynt | szybki | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 10 | n/d (gra główna) | ✓ |
| labirynt | klasyczny | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 10 | n/d (gra główna) | ✓ |
| statki | szybki | ✓ (placing, battle) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ zwycięzca 5 | n/d (gra główna) | ✓ |
| statki | hasbro | ✓ (placing, battle) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ zwycięzca 5 | n/d (gra główna) | ✓ |
| statki | klasyczny | ✓ (placing, battle) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ zwycięzca 5 | n/d (gra główna) | ✓ |
| statki | flota | ✓ (placing, battle) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ zwycięzca 5 | n/d (gra główna) | ✓ |
| chinczyk | klasyczny | ✓ (roll, move) | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 10 | n/d (gra główna) | ✓ |
| chinczyk | szybki | ✓ (roll, move) | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 10 | n/d (gra główna) | ✓ |
| kampus-tour | - | ✓ (pick, roll, buy, card) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ zwycięzca 9, remis 1 | n/d (gra główna) | ✓ |
| memory | mala | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 9, remis 1 | n/d (gra główna) | ✓ |
| memory | srednia | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 9, remis 1 | n/d (gra główna) | ✓ |
| memory | duza | ✓ | ✓ | ✓ | ✓ | ✓ p1 | ✓ zwycięzca 7, remis 3 | n/d (gra główna) | ✓ |
| refleks | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 1000 | ✓ |
| simon | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 | ✓ |
| stoper | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 11000, 12000, 14000 | ✓ |
| schulte | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 180000 | ✓ |
| stroop | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| liczenie | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| kolo | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 | ✓ |
| kolor | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 5000 | ✓ |
| kropki | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 240 | ✓ |
| rok | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 982, 810, 898… | ✓ |
| srodek | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 10000 | ✓ |
| stoj | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| sledzenie | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · 0 | ✓ |
| kubki | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 | ✓ |
| wieza | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · 0.4 | ✓ |
| rytm | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 545, 522, 462 | ✓ |
| inny | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| obrot | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| literowka | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| mapa | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 10000 | ✓ |
| kat | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 1172, 1275, 1237… | ✓ |
| przytrzymaj | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 15000 | ✓ |
| balon | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · 10 | ✓ |
| w-pamieci | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · 999 | ✓ |
| dziesiatki | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · Infinity | ✓ |
| tort | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 5000 | ✓ |
| zakupy | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 0 · 50000 | ✓ |
| zaslona | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 20000 | ✓ |
| nozyczki | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 2500 | ✓ |
| sudoku | - | ✓ | ✓ | ✓ | ✓ | ✓ p1 / wszyscy | ✓ remis wszystkich, bez zwycięzcy | ✓ najgorszy: 120000 | ✓ |
| panstwa-miasta | - | ✓ (write, vote, summary) | ✓ | ✓ | ✓ | ✓ wszyscy | ✓ remis 10 | n/d (gra główna) | ✓ |
| kalambury | krotka | ✓ (choose, draw, reveal) | ✓ | ✓ | ✓ | ✓ p1 | ✓ remis 10 | n/d (gra główna) | ✓ |
| kalambury | dluga | ✓ (choose, draw, reveal) | ✓ | ✓ | ✓ | ✓ p1 | ✓ remis 10 | n/d (gra główna) | ✓ |

Uwagi do tabeli (nie są błędami, tylko granice dowodu):

- **Fazy poza zasięgiem samych timeoutów.** Kampus Tour na samych `timeoutMove` przechodzi tylko przez `pick`, `roll`, `buy`, `card`
  (timeout nie kupuje, więc nie ma `buyout`, `build`, `sell`, `juwenalia`). Labirynt na samych timeoutach nie stawia ścianek.
  Te fazy i ruchy sprawdza `index.test.ts:62-127` ruchami „chętnego gracza” (`EAGER`, `index.test.ts:19`) i listą faz (`index.test.ts:119`), sekcja 4.
- **Remis w grach głównych** sprawdzony tylko pośrednio: Państwa-miasta i Kalambury na samych timeoutach kończą się wszyscy z 0 punktów,
  i za każdym razem bez zwycięzcy (10/10). Memory i Kampus Tour trafiły remis odpowiednio 1-3 i 1 raz na 10 partii, również bez zwycięzcy.
  Gomoku, Labirynt, Statki i Chińczyk nie mają remisu w samych timeoutach; remis i „wygrana każdego gracza” zostają dla planów gier.
- **Najgorszy wynik zależny od wyzwania.** W Stoperze (`stoper.ts:43`: odchyłka = cel 6-14 s), Który rok? (`rok.ts:33`), Kącie (`kat.ts:34`)
  i Rytmie (`rytm.ts:32`, brakujące odstępy jak najgorsze) wynik po limicie to najgorszy możliwy dla danego losowania, więc różni się między partiami.
  Sufit (najlepszy wynik 0) jest stały, zmienia się tylko dno. Do oceny w planach tych gier wobec §3 „losowanie nie zmienia sufitu wyniku” (sufit spełniony).
- **Jednostki rekordu.** Środek po limicie daje `10000`: `ROUNDS * MAX_ERROR = 10 * 100` (`srodek.ts:101`) zapisane w dziesiątych częściach
  punktu procentowego (`Math.round(sum * 10)`, `srodek.ts:104`). Prawdziwy błąd rundy to najwyżej 50 (`srodek.ts:56`, dotknięcie rzutowane na odcinek),
  więc limit czasu (100 za rundę) jest gorszy niż każda rozegrana partia. Spójność jednostek z `FORMAT` w `Records.tsx` sprawdza plan podpięć.
- **Jawne odstępstwa w kodzie (do porównania z `ZASADY-GIER.md` w planach mini-gier):** `balon.ts:36-37` (wytrzymałości balonów w widoku od startu)
  i `zakupy.ts:47-48` (lista w widoku od startu): obie gry same opisują to jako uproszczenie „między znajomymi”. Skrypt tego nie łapie,
  bo sprawdza serializowalność widoku, nie jego treść.

## 3. Grep: zakazane źródła czasu i losowości

```sh
grep -nE "Math\.random|Date\.now|performance\.now|new Date" packages/games/src/*.ts | grep -v "\.test\.ts"
```

Wynik: **pusta lista** (kod wyjścia 1). Zgodne z licznikami wywołań w trakcie partii (0 we wszystkich 46 przypadkach).

Dodatkowo limity tury odczytane z `GAMES` w czasie działania zgadzają się z `KONCEPT.md` §3 dla wszystkich gier
(300 s: simon, sledzenie, w-pamieci; 240 s: rok; 180 s: schulte, kolor, wieza, mapa, kubki; 120 s: kolo, sudoku, kropki, kat, przytrzymaj,
zaslona, balon, tort; 90 s: stroop, liczenie, inny, obrot, literowka, dziesiatki; 60 s: reszta; `turn()` w statki, chinczyk, panstwa-miasta, kalambury
i części mini-gier jako dodatek do `turnSeconds`).

## 4. Pokrycie index.test.ts

`pnpm --filter @kwadrans/games exec vitest run src/index.test.ts src/core.test.ts`: 2 pliki, 190 testów, wszystkie przechodzą.

### 4.1 Co sprawdza każdy test

| Test | Gry, tryby, fazy | Co dokładnie |
|---|---|---|
| index.test.ts:24 „rejestr” | wszystkie | `GAMES` ma 38 id, klucz = `game.id`, id z prototypu (`constructor`, `__proto__`…) dają `undefined` |
| index.test.ts:30 „mini-gry mają zasady narzucone z góry” | mini-gry | `minPlayers === 1` ⇒ brak `modes` |
| index.test.ts:34, :41 | brak (lobby) | schematy `pickGame`, `pickTournament`, `markGame`; poza zakresem gier |
| index.test.ts:56-117 `describe.each(CASES)` | każda gra × każdy tryb (`CASES`, index.test.ts:52, budowane z `GAMES`, więc żadnego id nie brakuje), n = min i max, seedy 1-3 | partia do końca losowymi ruchami: `timeoutMove` każdego czekającego przechodzi schemat i `validateMove` (:72-73); wykonany ruch (70% `EAGER` w Kampus Tour i Labiryncie, reszta timeout) przechodzi schemat i walidację (:81-82); ten ruch odrzucony dla gracza `obcy` (:83) i dla każdego gracza spoza `waitingFor` (:85); `waitingFor` niepuste w trakcie (:69) i puste po końcu (:93); widoki wszystkich i `""` przechodzą `JSON.stringify` (:61, :87, :94); `winner` ∈ gracze (:96); `ranking` to permutacja graczy (:98) z `winner` na czele (:99); mini-gra: `places` dla wszystkich (:103), niemalejące wzdłuż rankingu (:105), zwycięzca dokładnie przy n > 1 i samodzielnym 1. miejscu (:107), `record.score` skończony (:108); po końcu każdy ruch z partii odrzucony dla wszystkich i obcego (:110-112) |
| index.test.ts:119 „losowe partie przeszły przez każdą fazę” | kampus-tour (8 faz), chinczyk, statki, panstwa-miasta, kalambury | zbiór odwiedzonych `state.phase` równy liście; lista zgadza się z literałami `phase:` w kodzie gier (bez `over`) |
| index.test.ts:168 „rekord idzie w tę samą stronę co miejsca” | wszystkie `MINI_GAME_IDS`, fixture `RECORDS` (index.test.ts:134) | kierunek `record.lower`, dobry wynik lepszy od złego, `places` = {a:1, b:2}; przy `tied` równy `score` i rozstrzygające `tie`; gra bez `tied` nie ma `tie` |
| index.test.ts:190 „soloState zostawia jednego gracza” | wszystkie `MINI_GAME_IDS`, seed 3, same timeouty | `soloState`: gracze `["1"]`, brak id sesji, ten sam `record.score`, ranking `["1"]`, wspólne pola wyzwania bez zmian, oryginał niezmieniony |
| core.test.ts:4-245 | brak konkretnej gry | `createRng`, `withSum`, `shuffle`, `rankResults`, `byHitsThenAverage`, `rankPlaces`, `ranked` (z `record` i `tie`), `standing`, `nickKey`, `dailyGame`, `initials`; wspólne funkcje, nie zaliczają punktów §2 żadnej gry |

**Czego testy kontraktowe nie sprawdzają mimo pozorów:**
- `views(s)` (index.test.ts:61) tylko woła `JSON.stringify`, który nie rzuca na `NaN` i `undefined`, tylko je gubi; nie ma porównania round-trip ani dla widoku, ani dla stanu.
- Brak sprawdzenia mutacji poprzedniego stanu w `applyMove`.
- Pętla `for (...; !game.isOver(s); ...)` (index.test.ts:66) nie wymaga, by świeża gra nie była skończona: gra skończona od razu przeszłaby test.
- „Poza turą” (:85) używa ruchu z bieżącej fazy; ruch z innej fazy nie jest sprawdzany.
- „Po końcu” (:110-112) sprawdza tylko ruchy, które padły w tej partii.
- Nikt nie sprawdza, kto zaczyna, ani że dwa seedy dają różne losowania (sprawdza to skrypt z sekcji 2 tylko w części: start i determinizm).

### 4.2 Gra × punkt obowiązkowy ZASADY.md §2

Legenda: **T** pokryte, **C** częściowo, **N** nie. Odsyłacze w komórkach to `index.test.ts:linia`.

| Kolumna | Punkt §2 | Ocena dla wszystkich gier |
|---|---|---|
| Def | definicja: min/max, `turnSeconds`/`turn()`, świeża gra nieskończona | N: index.test.ts:24 sprawdza tylko id; wartości nie są porównywane z dokumentem, świeżej gry nikt nie sprawdza (:66) |
| Set | setup: kto zaczyna, różne seedy różne, ten sam seed to samo | N |
| W1 | gracz spoza gry | T: index.test.ts:83 |
| W2 | ruch poza turą albo w złej fazie | C: index.test.ts:85 (poza turą tak, zła faza nie) |
| W3 | ruch poprawny w kształcie, ale niedozwolony | N |
| W4 | ruch po końcu gry | C: index.test.ts:110-112 (tylko ruchy z tej partii) |
| W5 | wartości brzegowe | N |
| Sch | `moveSchema` odrzuca śmieci | N: index.test.ts:72, :81 sprawdzają tylko, że poprawny ruch przechodzi |
| Zas | każda zasada z sekcji gry | N (poza zakresem testu kontraktu, plany gier) |
| K1 | wygrana każdego gracza | N: index.test.ts:96 tylko „zwycięzca należy do graczy” |
| K2 | remis | mini-gry T: index.test.ts:107 (same timeouty dają remis wszystkich); gry główne N |
| K3 | ranking w dobrej kolejności | C: index.test.ts:98 permutacja graczy, :99 zwycięzca pierwszy, mini-gry :105 miejsca niemalejące; prawdziwa kolejność wyników nie |
| K4 | `waitingFor` puste po końcu | T: index.test.ts:93 |
| Lim | `timeoutMove` w każdej fazie przechodzi `validateMove` | T: index.test.ts:72-73 w każdym kroku, fazy wymuszone w index.test.ts:119 |
| St1 | `applyMove` nie zmienia poprzedniego | N (skrypt sekcji 2: ✓ dla wszystkich) |
| St2 | stan przeżywa JSON round-trip | N: tylko widoki przez `JSON.stringify` (:61) (skrypt sekcji 2: ✓ dla wszystkich) |

| gra | typ | tryby w CASES | Def | Set | W1 | W2 | W3 | W4 | W5 | Sch | Zas | K1 | K2 | K3 | K4 | Lim | St1 | St2 | zależne od typu |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| piec-w-rzedzie | główna | - | N | N | T | C | N | C | N | N | N | N | N | C | T | T (bez faz) | N | N | - |
| labirynt | główna | szybki, klasyczny | N | N | T | C | N | C | N | N | N | N | N | C | T | T (bez faz) | N | N | - |
| statki | główna | szybki, hasbro, klasyczny, flota | N | N | T | C | N | C | N | N | N | N | N | C | T | T (placing, battle, :123) | N | N | ukryty stan: playerView bez danych rywala N (index.test.ts:61 tylko serializuje); fazy równoczesne: kurczenie waitingFor N, turn().key N, progi min/max graczy C (partie przy min i max, index.test.ts:57) |
| chinczyk | główna | klasyczny, szybki | N | N | T | C | N | C | N | N | N | N | N | C | T | T (roll, move, :122) | N | N | - |
| kampus-tour | główna | - | N | N | T | C | N | C | N | N | N | N | N | C | T | T (8 faz, :121) | N | N | fazy równoczesne: kurczenie waitingFor N, turn().key N, progi min/max graczy C (partie przy min i max, index.test.ts:57) |
| memory | główna | mala, srednia, duza | N | N | T | C | N | C | N | N | N | N | N | C | T | T (bez faz) | N | N | ukryty stan: playerView bez danych rywala N (index.test.ts:61 tylko serializuje) |
| refleks | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| simon | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| stoper | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| schulte | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| stroop | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| liczenie | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| kolo | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| kolor | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| kropki | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| rok | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| srodek | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| stoj | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| sledzenie | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| kubki | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| wieza | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| rytm | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| inny | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| obrot | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| literowka | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| mapa | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| kat | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| przytrzymaj | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| balon | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| w-pamieci | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| dziesiatki | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| tort | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| zakupy | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| zaslona | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| nozyczki | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| sudoku | mini | - | N | N | T | C | N | C | N | N | N | N | T | C | T | T (bez faz) | N | N | zakres/niecałk. N; drugi wynik C (index.test.ts:85, :112); remis bez zwycięzcy T (index.test.ts:107); solo T (index.test.ts:107, n=1); rewanż inne wyzwanie N; rekord T (index.test.ts:168); soloState T (index.test.ts:190) |
| panstwa-miasta | główna | - | N | N | T | C | N | C | N | N | N | N | N | C | T | T (write, vote, summary, :124) | N | N | ukryty stan: playerView bez danych rywala N (index.test.ts:61 tylko serializuje); fazy równoczesne: kurczenie waitingFor N, turn().key N, progi min/max graczy C (partie przy min i max, index.test.ts:57) |
| kalambury | główna | krotka, dluga | N | N | T | C | N | C | N | N | N | N | N | C | T | T (choose, draw, reveal, :125) | N | N | ukryty stan: playerView bez danych rywala N (index.test.ts:61 tylko serializuje); fazy równoczesne: kurczenie waitingFor N, turn().key N, progi min/max graczy C (partie przy min i max, index.test.ts:57) |

### 4.3 Id z GAMES nieobecne w CASES lub RECORDS

- `CASES` (index.test.ts:52) powstaje z `Object.values(GAMES)` i `modes`, więc zawiera wszystkie 38 id i wszystkie tryby (46 przypadków). Brakujących: **brak**.
- `RECORDS` (index.test.ts:134) ma 32 klucze; `MINI_GAME_IDS` też ma 32 id i zbiory są równe (test :171 wymaga fixture dla każdej mini-gry i przechodzi). Brakujących: **brak**.
- Mini-gry z `tied` w `RECORDS` pokrywają się z grami, które mają `record.tie` (stroop, liczenie, inny, dziesiatki, obrot, literowka, stoj, sledzenie, wieza, w-pamieci, balon, zakupy); test :180 to wymusza.
- Gry główne (piec-w-rzedzie, labirynt, statki, chinczyk, kampus-tour, memory, panstwa-miasta, kalambury) nie są w `RECORDS` i nie powinny (bez `record`).

## Załącznik A: checks.ts

Tabele z sekcji 2 i 4.2 zostały wygenerowane z `wynik.json` krótkim `node -e` (bez logiki sprawdzającej).

```ts
// Audyt reguł ZASADY.md §3 dla wszystkich gier z GAMES (plan 01-01). Uruchomienie:
//   node --experimental-strip-types checks.ts /ścieżka/do/kwadrans > wynik.json
import { isDeepStrictEqual } from "node:util";

const root = process.argv[2];
const { GAMES, createRng } = await import(`${root}/packages/games/src/index.ts`);

const SEEDS = [1, 2, 3, 4, 5];
const MAX_STEPS = 100_000;

// Wywołania zakazanych źródeł czasu i losowości w trakcie partii (zasady mają ich nie używać).
const forbidden = { "Math.random": 0, "Date.now": 0, "performance.now": 0, "new Date": 0 };
const realRandom = Math.random, realNow = Date.now, realPerf = performance.now.bind(performance), RealDate = Date;
let armed = false;
Math.random = () => { if (armed) forbidden["Math.random"]++; return realRandom(); };
Date.now = () => { if (armed) forbidden["Date.now"]++; return realNow(); };
performance.now = () => { if (armed) forbidden["performance.now"]++; return realPerf(); };
globalThis.Date = new Proxy(RealDate, { construct(t, a) { if (armed) forbidden["new Date"]++; return Reflect.construct(t, a); } }) as DateConstructor;

const deepFreeze = (o: unknown): unknown => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); }
  return o;
};
/** Wartości, które JSON gubi albo psuje: undefined, NaN, ±Infinity, funkcje, Map/Set/Date, prototypy inne niż Object/Array. */
function jsonIssues(o: unknown, path = "$", out: string[] = []): string[] {
  if (out.length > 5) return out;
  if (o === undefined) out.push(`${path}=undefined`);
  else if (typeof o === "number" && !Number.isFinite(o)) out.push(`${path}=${o}`);
  else if (typeof o === "function" || typeof o === "bigint" || typeof o === "symbol") out.push(`${path}:${typeof o}`);
  else if (o && typeof o === "object") {
    const proto = Object.getPrototypeOf(o);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) out.push(`${path}:${o.constructor?.name}`);
    for (const [k, v] of Object.entries(o)) jsonIssues(v, `${path}.${k}`, out);
  }
  return out;
}
const phaseOf = (s: any) => String(s?.phase ?? "");

type Run = { trace: string; error?: string; issues: Record<string, string[]>; phases: Set<string>; start: string; result?: any; places?: any; records?: Record<string, number>; ties?: Record<string, number>; steps: number };

function play(game: any, mode: string | undefined, n: number, seed: number): Run {
  const players = ["p1", "p2", "p3", "p4", "p5", "p6"].slice(0, n);
  const rng = createRng(seed);
  const issues: Record<string, string[]> = { timeoutMove: [], JSON: [], mutacja: [], playerView: [] };
  const add = (k: string, msg: string) => { if (issues[k].length < 3) issues[k].push(`seed ${seed}, n ${n}: ${msg}`); };
  const phases = new Set<string>();
  const trace: string[] = [];
  armed = true;
  try {
    let s = game.setup(players, rng, mode);
    const w0 = game.waitingFor(s);
    const start = w0.length === players.length && players.every((p) => w0.includes(p)) ? (n === 1 ? "p1" : "wszyscy") : w0.includes("p1") ? "p1" : `INNY:${w0.join(",")}`;
    let steps = 0;
    for (; !game.isOver(s); steps++) {
      if (steps > MAX_STEPS) throw new Error("partia się nie kończy");
      const phase = phaseOf(s);
      phases.add(phase);
      const ji = jsonIssues(s);
      if (ji.length) add("JSON", `ruch ${steps}, faza "${phase}": ${ji.join(" ")}`);
      else if (!isDeepStrictEqual(JSON.parse(JSON.stringify(s)), s)) add("JSON", `ruch ${steps}, faza "${phase}": round-trip różny`);
      for (const viewer of [...players, ""]) {
        try {
          const vi = jsonIssues(game.playerView(s, viewer)).filter((x) => !x.endsWith("=undefined"));
          if (vi.length) add("playerView", `ruch ${steps}, faza "${phase}", widz "${viewer}": ${vi.join(" ")}`);
        } catch (e) { add("playerView", `ruch ${steps}, widz "${viewer}": wyjątek ${(e as Error).message}`); }
      }
      const waiting: string[] = game.waitingFor(s);
      if (!waiting.length) throw new Error(`ruch ${steps}: waitingFor puste przed końcem`);
      let chosen: unknown;
      for (const p of waiting) {
        const m = game.timeoutMove(s, p, rng);
        const schema = game.moveSchema.safeParse(m).success;
        const valid = game.validateMove(s, p, m);
        if (!schema || !valid) add("timeoutMove", `ruch ${steps}, faza "${phase}", ${p}: ${schema ? "" : "schemat "}${valid ? "" : "validateMove "}odrzuca ${JSON.stringify(m).slice(0, 100)}`);
        if (p === waiting[0]) chosen = m;
      }
      const player = waiting[0];
      deepFreeze(s);
      const before = JSON.stringify(s);
      let next;
      try { next = game.applyMove(s, player, chosen, rng); }
      catch (e) {
        add("mutacja", `ruch ${steps}, faza "${phase}": applyMove na zamrożonym stanie rzuca: ${(e as Error).message}`);
        // Partia toczy się dalej na kopii, żeby zebrać pozostałe wyniki; przebieg rng po tym miejscu nie jest już miarodajny.
        next = game.applyMove(structuredClone(JSON.parse(before)), player, chosen, rng);
      }
      if (JSON.stringify(s) !== before) add("mutacja", `ruch ${steps}: poprzedni stan zmieniony`);
      trace.push(JSON.stringify(chosen));
      s = next;
    }
    const result = game.isOver(s);
    if (game.waitingFor(s).length) add("timeoutMove", `po końcu waitingFor = ${game.waitingFor(s)}`);
    for (const viewer of [...players, ""]) {
      const vi = jsonIssues(game.playerView(s, viewer)).filter((x) => !x.endsWith("=undefined"));
      if (vi.length) add("playerView", `po końcu, widz "${viewer}": ${vi.join(" ")}`);
    }
    const ji = jsonIssues(s);
    if (ji.length) add("JSON", `po końcu: ${ji.join(" ")}`);
    const out: Run = { trace: trace.join("\n") + JSON.stringify(s), issues, phases, start, result, steps };
    if (game.places) out.places = game.places(s);
    if (game.record) {
      out.records = Object.fromEntries(players.map((p) => [p, game.record.score(s, p)]));
      if (game.record.tie) out.ties = Object.fromEntries(players.map((p) => [p, game.record.tie.score(s, p)]));
    }
    return out;
  } catch (e) {
    return { trace: trace.join("\n"), error: (e as Error).stack?.split("\n").slice(0, 3).join(" | "), issues, phases, start: "?", steps: trace.length };
  } finally { armed = false; }
}

const rows: any[] = [];
for (const game of Object.values(GAMES) as any[]) {
  for (const mode of game.modes ?? [undefined]) {
    const row: any = { id: game.id, mode: mode?.id ?? "-", issues: { timeoutMove: [], JSON: [], mutacja: [], determinizm: [], start: [], remis: [], "places/record": [], playerView: [], błąd: [] }, starts: new Set(), phases: new Set(), worst: {} };
    const before = { ...forbidden };
    for (const n of [...new Set([game.minPlayers, game.maxPlayers])]) {
      for (const seed of SEEDS) {
        const a = play(game, mode?.id, n, seed);
        const b = play(game, mode?.id, n, seed);
        if (a.error) row.issues["błąd"].push(`seed ${seed}, n ${n}: ${a.error}`);
        for (const [k, v] of Object.entries(a.issues)) row.issues[k].push(...v);
        if (a.trace !== b.trace) row.issues.determinizm.push(`seed ${seed}, n ${n}: dwa przebiegi z tym samym seedem różne`);
        row.starts.add(a.start);
        if (a.start.startsWith("INNY")) row.issues.start.push(`seed ${seed}, n ${n}: waitingFor na starcie ${a.start}`);
        for (const p of a.phases) row.phases.add(p);
        if (!a.result) continue;
        const { winner, ranking } = a.result;
        if (game.minPlayers === 1) {
          const places = a.places, rec = a.records!, tie = a.ties;
          const firsts = Object.values(places).filter((x) => x === 1).length;
          if (winner !== undefined && (n === 1 || firsts > 1)) row.issues.remis.push(`seed ${seed}, n ${n}: zwycięzca ${winner} przy remisie/solo`);
          if (n > 1 && firsts > 1 && winner !== undefined) row.issues.remis.push(`seed ${seed}, n ${n}: remis na górze ze zwycięzcą`);
          const order = ranking.map((p: string) => places[p]);
          if (order.some((x: number, i: number) => i && x < order[i - 1]) || order[0] !== 1) row.issues["places/record"].push(`seed ${seed}, n ${n}: places ${JSON.stringify(places)} niezgodne z rankingiem ${ranking}`);
          // Rekord idzie w stronę miejsc: lepsze miejsce ma lepszy (wynik, drugie kryterium), równe miejsce równy.
          const key = (p: string) => [rec[p], tie?.[p] ?? 0];
          const cmp = (p: string, q: string) => { const [a1, a2] = key(p), [b1, b2] = key(q); return (game.record.lower ? a1 - b1 : b1 - a1) || (tie && Number.isFinite(a2) && Number.isFinite(b2) ? (game.record.tie.lower ? a2 - b2 : b2 - a2) : 0); };
          for (const p of ranking) for (const q of ranking) {
            const c = cmp(p, q), d = places[p] - places[q];
            if (Math.sign(c) !== Math.sign(d)) { row.issues["places/record"].push(`seed ${seed}, n ${n}: ${p} miejsce ${places[p]} rekord ${key(p)} vs ${q} miejsce ${places[q]} rekord ${key(q)}`); break; }
          }
          // Wszyscy grali timeoutMove: wynik każdego to „najgorszy”, więc wszyscy równi, a przy n > 1 remis bez zwycięzcy.
          const vals = new Set(Object.values(rec).map(String));
          if (vals.size > 1) row.issues["places/record"].push(`seed ${seed}, n ${n}: same timeoutMove dają różne rekordy ${JSON.stringify(rec)}`);
          if (n > 1 && winner !== undefined) row.issues.remis.push(`seed ${seed}, n ${n}: same timeoutMove, a zwycięzca ${winner}`);
          row.worst[`${n}/${seed}`] = rec.p1 + (tie ? ` · ${tie.p1}` : "");
        } else if (winner !== undefined && ranking && ranking[0] !== winner) row.issues.remis.push(`seed ${seed}, n ${n}: ranking[0] ≠ winner`);
        else { row.outcomes ??= {}; const k = winner !== undefined ? "zwycięzca" : ranking ? "remis (ranking bez zwycięzcy)" : "pusty"; row.outcomes[k] = (row.outcomes[k] ?? 0) + 1; }
      }
    }
    row.forbidden = Object.fromEntries(Object.entries(forbidden).map(([k, v]) => [k, v - (before as any)[k]]).filter(([, v]) => v));
    if (Object.keys(row.forbidden).length) row.issues.determinizm.push(`wywołania w trakcie partii: ${JSON.stringify(row.forbidden)}`);
    row.starts = [...row.starts]; row.phases = [...row.phases]; 
    rows.push(row);
  }
}
console.log(JSON.stringify(rows, null, 1));
```

## Załącznik B: kontrola skryptu (gry-mutanty)

`sanity.ts` to `checks.ts` z podmienionym `GAMES` na pięć kopii Gomoku:

```ts
const base = lib.GAMES["piec-w-rzedzie"];
const GAMES = {
  mutuje: { ...base, id: "mutuje", applyMove: (s, p, m, r) => { s.x = 1; return base.applyMove(s, p, m, r); } },
  zlyTimeout: { ...base, id: "zlyTimeout", timeoutMove: () => ({ type: "zly" }) },
  random: { ...base, id: "random", setup: (pl, r) => ({ ...base.setup(pl, r), seed: Math.random() }) },
  nan: { ...base, id: "nan", setup: (pl, r) => ({ ...base.setup(pl, r), bad: NaN }) },
  start: { ...base, id: "start", waitingFor: (s) => base.waitingFor(s).length ? [s.players.at(-1)] : [] },
};
```

Wynik (pierwszy wpis każdej kategorii):

```
mutuje      mutacja: applyMove na zamrożonym stanie rzuca: Cannot add property x, object is not extensible
zlyTimeout  timeoutMove: schemat validateMove odrzuca {"type":"zly"}; błąd: partia się nie kończy
random      determinizm: dwa przebiegi z tym samym seedem różne
nan         JSON: $.bad=NaN
start       start: waitingFor na starcie INNY:p2; timeoutMove: validateMove odrzuca {"x":6,"y":9}
```

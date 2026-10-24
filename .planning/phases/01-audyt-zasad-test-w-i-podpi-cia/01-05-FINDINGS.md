# 01-05: fazy równoczesne i Turniej (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `panstwa-miasta`, `kalambury` i Turnieju (`turniej.ts`, D-15).
Repo bez zmian (poza `.planning/`). Podpięcie (§6) Państw-miast i Kalamburów jest w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts` i testy `<id>.test.ts` przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :7-16, §5 :629-644, §8 :765-789, §9 :791-823), `KONCEPT.md` §2.3c (:94-101), §2.5 (:162-169), §2.6 (:171-181) i §3 (:233-234).
  Turniej: dodatkowo miejsca w `apps/server/src/LobbyRoom.ts`, które wołają funkcje z `turniej.ts` (:110, :123, :165, :320, :405-423), tylko po to,
  żeby potwierdzić wejścia (`places` albo `null`, `NEXT_SECONDS`, `TOURNAMENT_ID`). Reguły pokoju (gotowość, `markedBy`, koniec przez gospodarza) są poza zakresem (D-15).
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze `panstwa-miasta` i `kalambury` (oba tryby, bez błędów, remis wszystkich bez zwycięzcy).
- Skrypt `fuzz05.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o ruchy, których same timeouty nie robią
  (szkice, odrzucenia w głosowaniu, kreski, cofnij, wyczyść, trafienia i pudła, ręczny `pass`):
  - Państwa-miasta: 2-6 graczy × 120 seedów; Kalambury: oba tryby × 2-6 graczy × 60 seedów. W każdym kroku losowy ruch (dozwolony albo nie, liczą się tylko dozwolone)
    albo `timeoutMove` (25%). Sprawdzenia: świeża gra nieskończona; `timeoutMove` każdego czekającego przechodzi schemat i `validateMove`; dozwolony ruch przechodzi schemat
    i jest odrzucony dla `obcy`; stan zamrożony rekursywnie przed `applyMove` i porównany JSON-em; round-trip JSON stanu i widoków wszystkich graczy i `""`;
    klucz `turn()` stały, dopóki faza, runda i STOP (Kalambury: połowa) się nie zmieniają, i nowy przy ich zmianie.
  - Państwa-miasta: w pisaniu widok zawiera tylko własny szkic, w głosowaniu tylko własny głos, litery przyszłych rund puste; punkty każdej komórki
    przeliczone niezależnie z `ZASADY-GIER.md` §5 (:637-640) i równe `roundScores`, suma równa `totals`.
  - Kalambury: hasło i trzy hasła do wyboru nie trafiają do widoku nie-rysującego ani `""` w wyborze i rysowaniu; hasła przyszłych rund nigdy (poza czatem);
    `cleared` tylko u rysującego; długość podpowiedzi = długość hasła, odsłoniętych liter tyle, ile `revealed`; trafienie nigdy w czacie; rysunek ≤ 2000 punktów;
    punkty rundy przeliczone niezależnie (10/8/6/5/4, rysujący 3 × trafienia).
  - Turniej: 3000 turniejów; konfiguracja budowana 25 losowymi `mark` (także nieznane id), 1-6 graczy, wyniki gier 0-2 (dużo remisów) przez `rankPlaces`,
    7% gier przerwanych (`null`), 3% szans na wyjście gracza przed grą. Wejścia zamrożone. Sprawdzenia: `must` ∩ `skip` = ∅, co najmniej 3 gry, długość w zakresie;
    losowanie bez powtórek, z `must`, bez `skip`; `advance` nie zmienia stanu, JSON round-trip; dogrywka najwyżej jedna, nie z wykluczonych, nie powtórzona,
    gdy są wolne gry; zwycięzca dokładnie wtedy, gdy jest samodzielny lider przy 2+ graczach; remis na szczycie zawsze z dogrywką; suma tabeli z punktów gier.
  - Wynik: **0 błędów**. Pierwszy przebieg zgłosił „przyszłe hasło w widoku”, ale to strzały skryptu („kot”, „pies”, „dom” są też hasłami) w jawnym czacie;
    po pominięciu czatu w tym jednym sprawdzeniu: 0.

| gra | partie | ruchy | wyniki |
|---|---|---|---|
| panstwa-miasta | 600 | write 25 209, vote 12 000, next 9 600 | zwycięzca 558, remis 42 (zawsze bez zwycięzcy) |
| kalambury | 600 | choose 3 600, line 2 407, undo 297, clear 241, hint 3 579, guess 20 273, pass 9 230, next 13 800 | zwycięzca 476, remis 124 (zawsze bez zwycięzcy) |
| turniej | 3 000 | 3 256 gier przerwanych, 137 dogrywek (14 powtórzonych, bo wszystkie niewykluczone już były) | zwycięzca 2 182, remis 49, solo 769 |

## Państwa-miasta (`panstwa-miasta`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §5 (:629). Opis w `KONCEPT.md` §2: ✓ §2.5 (:162-169). Brak trybów.

| Stała | Kod | ZASADY-GIER §5 | Zgodne |
|---|---|---|---|
| gracze | 2-6 (:72-73) | :631, tabela :15 | ✓ (też `KONCEPT.md` :164) |
| rundy, litery | `ROUNDS = 5` (:7), `LETTERS` bez Ą Ć Ę Ń Ó Ś Ź Ż Q V X Y (:6), losowanie z `rng` bez zwracania (:84-85) | :631 | ✓ (też `KONCEPT.md` :164), ale komentarz :5 pomija Ć (PM10) |
| przyszłe litery, `nonce` | puste w widoku (:135), `nonce` z `rng` (:87) | :632 | ✓ |
| kategorie, długość | `CATEGORIES` 6 (:4), `ANSWER_MAX = 30` w schemacie (:8, :75) | :633 | ✓ (też `KONCEPT.md` :164) |
| pisanie | `write` z `done` (:108-116), szkic bez `done` (:110), STOP = pierwsze `done` (:112) | :634-635 | ✓ (też `KONCEPT.md` :165) |
| czasy | `SECONDS` 90 / 7 / 45 / 20 (:43, :153) | :634-641 | ✓ (też `KONCEPT.md` :165-168) |
| po czasie pisania | ostatni szkic albo puste pola jako `done` (:157) | :636 | ✓ |
| głosowanie | raz, nie swoje, istniejący gracz i kategoria (:96-99) | :637 | ✓ |
| próg odrzucenia | ważna, gdy `flags <= (n − 1) / 2` (:53), czyli odpada przy ponad połowie pozostałych | :637-638 | ✓ (też `KONCEPT.md` :166) |
| pusta / zła litera | `fits` z `toLocaleUpperCase("pl")`, Ł ≠ L (:47) | :638 | ✓ |
| po czasie głosowania | `rejected: []` (:158) | :638 | ✓ |
| punkty | 15 jedyna ważna, 5 powtórzona, 10 reszta (:59), powtórki przez `normalize` (:58) | :639-640 | ✓ (też `KONCEPT.md` :167); `fuzz05.ts`: każda komórka przeliczona niezależnie |
| podsumowanie, koniec | `next` od wszystkich (:124-127), po 5. rundzie od razu `over` (:122) | :641 | ✓ |
| zwycięzca, remis | `rankResults` po sumie, remis na górze bez `winner` (:141) | :642 | ✓ |
| ukrywanie | pisanie: tylko własne `answers`, głosowanie: tylko własne `votes`, potem całość (:133-139) | :643 | ✓ (`fuzz05.ts`) |
| limit | `turn()`: klucz `faza:runda:stop` (:151-154) | :644, tabela :15 | ✓ (też `KONCEPT.md` :169, §3 :234) |

Rozbieżności kod ↔ `ZASADY-GIER.md` i `KONCEPT.md` ↔ `ZASADY-GIER.md`: brak (poza komentarzem w kodzie, PM10).

#### PM10. Komentarz przy `LETTERS` pomija Ć
- Gra: `panstwa-miasta`. Miejsce: `packages/games/src/panstwa-miasta.ts:5` („Bez Ą Ę Ń Ó Ś Ź Ż Q V X Y”); stała :6 słusznie nie ma Ć.
- Źródło: `KONCEPT.md` §2.5 :164 (lista z Ć). Waga: **niska** (kosmetyka, gra działa zgodnie z dokumentem). Linia z `923c8c0` (2026-10-08, pierwsza wersja gry).
- Propozycja (popraw kod): dopisać Ć w komentarzu.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ neutralny: oddanie szkicu, głos bez odrzuceń, „Dalej” | 01-01-CHECKS.md (write, vote, summary); `fuzz05.ts`; testy :125, :182, :222 |
| remis bez zwycięzcy | ✓ samo `ranking` | `panstwa-miasta.ts:141` (`rankResults`); 01-01-CHECKS.md (remis 10/10); `fuzz05.ts` (42 remisy); test :237 |
| start od pierwszego z `players` | ✓ faza równoczesna: czekają wszyscy | 01-01-CHECKS.md (start „wszyscy”); test :50 |
| tylko `rng` | ✓ litery i `nonce` | 01-01-CHECKS.md §3 (grep pusty, determinizm ✓) |
| stan JSON, brak mutacji | ✓ we wszystkich typach ruchów | 01-01-CHECKS.md; `fuzz05.ts` (46 809 ruchów) |
| ukryte informacje, obserwator `""` | ✓ | `fuzz05.ts`; testy :95, :108 |
| klucz `turn()` | ✓ nowy przy fazie, rundzie i STOP, stały przy szkicu i głosie | `fuzz05.ts`; serwer odnawia limit tylko przy zmianie klucza (`LobbyRoom.ts:369-371`) |
| wspólne funkcje `core.ts` | ✓ `normalize`, `rankResults` (:2) | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §5) | Test (`panstwa-miasta.test.ts`) |
|---|---|
| 2-6 graczy (:631) | LUKA (PM1) |
| 5 rund, różne litery z puli (:631) | :43 |
| przyszłe litery puste dla gracza i obserwatora (:632) | :108 |
| `nonce` odróżnia partie (:632) | :122 (inny seed, inny `nonce`) |
| 6 kategorii (:633) | :45 |
| odpowiedź do 30 znaków (:633) | :92 (31 odrzucone; 30 przyjęte bez testu, PM4) |
| pisanie 90 s, wszyscy naraz (:634) | :51 |
| szkic nie kończy pisania (:634) | :55 |
| pierwsze oddanie to STOP, także bez kompletu; 7 s od nowa (:635) | :63, :74 |
| po czasie: ostatni szkic, bez szkicu puste pola (:636) | :125 |
| głosowanie 45 s, raz, nie swoje (:637) | :143, :147 |
| odpada przy ponad połowie pozostałych (:637-638) | :157 (2 os.), :164 (3 os.), :172 (6 os.) |
| pusta albo zła litera odpada sama, Ł ≠ L (:638) | :188 |
| po czasie głosowania nic nie odrzucam (:638) | :182 |
| 15 / 10 / 5 / 0 (:639) | :188, :203 |
| powtórki przez `normalize` (:640) | :188 (wielkość liter, polskie znaki; spacje tylko przez `normalize` w `core.test.ts`) |
| podsumowanie 20 s, „Dalej” od wszystkich, po czasie „Dalej” (:641) | :211 (:221-225) |
| po 5. rundzie od razu koniec (:641) | :211 (:231) |
| wygrywa suma, remis bez zwycięzcy (:642) | :234, :237 |
| w pisaniu tylko swój szkic (:643) | :95 |
| w głosowaniu tylko swój głos; potem wszystko jawne (:643) | LUKA (PM7); odpowiedzi jawne od głosowania :140 |
| klucz `faza:runda:stop` (:644) | :51, :68, :143, :221 (wartości); stałość klucza LUKA (PM8) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, świeża gra nieskończona | LUKA | PM1 |
| Definicja: `turn()` | ✓ | :51, :68, :143, :221 |
| Setup: stan, kto zaczyna | ✓ | :43, :50 |
| Setup: seedy | LUKA (częściowo) | PM2 |
| Walidacja: spoza gry | ✓ | :84 |
| Walidacja: poza turą, zła faza | ✓ | :83 (po oddaniu), :85, :86, :153 |
| Walidacja: poprawny kształt, niedozwolony | ✓ | :149 (własna odpowiedź) |
| Walidacja: po końcu | LUKA | PM3 |
| Walidacja: brzegi | LUKA (częściowo) | PM4 |
| Schemat | LUKA (częściowo) | PM5 |
| Koniec: wygrana każdego gracza | LUKA (częściowo) | PM6 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :237, :234, :232 |
| Limit: `timeoutMove` w każdej fazie przechodzi `validateMove` | ✓ | testy gry :125, :182, :222 (sam kształt); walidację daje index.test.ts:72-73 we wszystkich trzech fazach (01-01-CHECKS.md §4.2: Lim T, write, vote, summary) |
| Stan: brak mutacji, JSON | LUKA | PM9 |
| Typ: ukryty stan, gracz i obserwator w pisaniu | ✓ | :95, :108 |
| Typ: ukryty stan, w głosowaniu i po odsłonięciu | LUKA | PM7 |
| Typ: fazy równoczesne: `waitingFor` kurczy się | ✓ | :67, :154, :224 |
| Typ: fazy równoczesne: `turn().key` zmienia się tylko przy zmianie fazy | LUKA (częściowo) | PM8 |
| Typ: fazy równoczesne: min i max graczy, progi | ✓ | :157 (2 os., większość z 1), :172 (6 os.) |

#### PM1. Liczba graczy i świeża gra bez testu
- Miejsce: `panstwa-miasta.test.ts` nie sprawdza `minPlayers`/`maxPlayers` (kod :72-73) ani `isOver(setup(...))`; test :43 woła tylko `waitingFor` i `turn`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54), `ZASADY-GIER.md` §5 :631. Waga: **średnia**. Zachowanie poprawne (`fuzz05.ts`: świeża gra nieskończona, 2-6 graczy).
- Propozycja: w teście :43 `expect(game.minPlayers).toBe(2)`, `expect(game.maxPlayers).toBe(6)`, `expect(game.isOver(s)).toBeNull()`.

#### PM2. Seedy: litery nie są porównywane
- Miejsce: `panstwa-miasta.test.ts:122` (inny seed daje inny `nonce`); brak „ten sam seed, te same litery” i „inny seed, inne litery”. Kod :84-85. `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**. Zachowanie poprawne (01-01-CHECKS.md: determinizm ✓).
- Propozycja: `expect(game.setup([A, B], createRng(5))).toEqual(game.setup([A, B], createRng(5)))` i różne `letters` dla dwóch seedów.

#### PM3. Ruch po końcu bez testu
- Miejsce: brak w `panstwa-miasta.test.ts` (test :211 kończy partię, ale nie próbuje ruchu); `index.test.ts:110-112` sprawdza tylko ruchy z tej partii (01-01-CHECKS.md §4.2, W4 C).
- Źródło: `ZASADY.md` §2 Walidacja (:60). Waga: **średnia** (każdy ruch ma warunek fazy, :94, :97, :102, więc w `over` odpada).
- Propozycja: na końcu testu :211 `write`, `vote` i `next` od A i B → `false`.

#### PM4. Brzegi: 30 znaków i kategoria 0..5 tylko z jednej strony
- Miejsce: `panstwa-miasta.test.ts:92` (31 znaków odrzucone, 30 przyjęte bez testu), `:151` (kategoria 6 odrzucona, 5 przyjęta i −1 odrzucona bez testu). Kod :75, :99. `[zbiorcze: brzegi]`
- Źródło: `ZASADY.md` §2 Walidacja: brzegi (:61). Waga: **średnia**.
- Propozycja: `write` z odpowiedzią 30-znakową przechodzi schemat; `vote([B, 5])` przechodzi, `vote([B, -1])` nie.

#### PM5. Schemat sprawdzony tylko dla długości
- Miejsce: `panstwa-miasta.test.ts:89-93` (5 odpowiedzi zamiast 6, 31 znaków); brak złego typu (`done: "tak"`), brakującego pola (`write` bez `done`), liczby niecałkowitej
  (`category: 1.5`), nieznanego `type`. Schemat `panstwa-miasta.ts:74-81` ma te ograniczenia. `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62). Waga: **średnia**. Propozycja: cztery przypadki w teście :89.

#### PM6. Wygrana tylko gracza A
- Miejsce: `panstwa-miasta.test.ts:234` (`winner: A`); B nie wygrywa w żadnym teście.
- Źródło: `ZASADY.md` §2 Koniec gry (:64 „wygrana każdego gracza (nie tylko pierwszego)”), D-03. Waga: **średnia** (`rankResults` jest wspólny, `fuzz05.ts`: 558 zwycięzców na różnych miejscach).
- Propozycja: w teście :211 wariant, w którym komplet pisze B, i `isOver` = `{ winner: B, ranking: [B, A] }`.

#### PM7. Ukrywanie głosów bez testu
- Miejsce: `panstwa-miasta.test.ts:140` sprawdza tylko jawne odpowiedzi w głosowaniu; brak testu, że w głosowaniu gracz i obserwator nie widzą cudzych `votes`,
  i że po głosowaniu (podsumowanie) głosy są jawne. Kod :137-138.
- Źródło: `ZASADY-GIER.md` §5 :643, `ZASADY.md` §2 Ukryty stan (:70-71 „w każdej fazie”, „po odsłonięciu widać dokładnie to, co odsłonięte”). Waga: **średnia**.
  Zachowanie poprawne (`fuzz05.ts`: 12 000 głosów, cudzy głos ani razu w widoku).
- Propozycja: po głosie A `view(s, B).votes` i `view(s, "").votes` bez A; po głosie B w podsumowaniu `view(s, "").votes` z oboma.

#### PM8. Stałość klucza `turn()` bez testu
- Miejsce: `panstwa-miasta.test.ts:55` (szkic) i `:147` (głos) nie porównują klucza przed i po; testy :51, :68, :143, :221 sprawdzają wartości na przejściach. `[zbiorcze: turn-key-staly]`
- Źródło: `ZASADY.md` §2 Fazy równoczesne (:72 „`turn().key` zmienia się tylko przy zmianie fazy”), `ZASADY-GIER.md` §5 :644. Waga: **średnia**.
  Zachowanie poprawne (`fuzz05.ts`: klucz stały przy każdym szkicu, oddaniu bez STOP i głosie).
- Propozycja: w teście :55 i :70 (drugie oddanie) `expect(game.turn!(s).key)` bez zmiany; w :152 po głosie A klucz `vote:0:`.

#### PM9. Mutacja i JSON bez testu w grze
- Miejsce: brak w `panstwa-miasta.test.ts`; `index.test.ts` tego nie sprawdza (01-01-CHECKS.md §4.2, St1 N, St2 N). `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan (:66). Waga: **średnia** (01-01-CHECKS.md i `fuzz05.ts`: 0 błędów).
- Propozycja: test „applyMove nie zmienia poprzedniego stanu, stan przeżywa JSON” jak w `kalambury.test.ts:618`, dla `write`, `vote` i `next`.

## Kalambury (`kalambury`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §9 (:791). Opis w `KONCEPT.md` §2: ✓ §2.3c (:94-101).

| Stała | Kod | ZASADY-GIER §9 | Zgodne |
|---|---|---|---|
| gracze | 2-6 (:105-106) | :793, tabela :16 | ✓ (też `KONCEPT.md` :96) |
| kolejka | `players[round % n]` (:87) | :793 | ✓ |
| tryby | `krotka` 1 × (domyślny), `dluga` 2 × (:5-9), nieznany = Krótka (:120) | :793-794 | ✓ (też `KONCEPT.md` :96) |
| hasła | `shuffle(WORDS)`, `CHOICES = 3` na rundę, bez powtórek (:122) | :795 | ✓ (też `KONCEPT.md` :97) |
| `nonce` | z `rng` (:124) | :796 | ✓ |
| wybór | 15 s (:29), indeks 0-2 (:132), po czasie 0 (:223) | :797 | ✓ |
| połowy | `HALF_SECONDS = 40` (:28), `hint` tylko rysujący, `half === 0` (:146), losowa litera z `rng` bez spacji (:176-179) | :798-801 | ✓ (też `KONCEPT.md` :99), ale KL1 |
| kreski | 0-1000 całkowite (:100, :136), parzysta długość, 2-200 liczb (:110, :136), `start: false` bez kreski odpada (:137) | :802-803 | ✓ |
| paleta | `INKS = 6`, `ERASER = 5` (:16-17), kolor sprawdzany tylko przy `start` (:138, :166) | :804-805 | ✓ (też `KONCEPT.md` :100; kolejność barw w `Kalambury.tsx:21-28` zgodna) |
| limit rysunku | `MAX_POINTS = 2000` (:20, :139) | :806 | ✓ (też `KONCEPT.md` :101) |
| cofnij, wyczyść | `undo` usuwa ostatnią albo przywraca `cleared`, `clear` tylko przy kreskach (:142-144, :172-175) | :807-809 | ✓ (też `KONCEPT.md` :99) |
| zgadywanie | do 30 znaków (:12, :114), niepusty po `trim` (:151), `normalize` (:182), trafienie do `guessed`, pudło do `chat` (:183-188), `MAX_GUESSES = 30` (:22, :152) | :810-812 | ✓ (też `KONCEPT.md` :97) |
| kto strzela | `guessers`: bez rysującego, trafionych i spasowanych (:83) | :813 | ✓ |
| `pass` | w obu połowach (:155); po limicie 2. połowy za każdego (:224) | :814 | ✓ |
| `waitingFor` | 1. połowa rysujący, 2. zgadujący (:215) | :815 | ✓ |
| koniec rundy | `guessers` puste w dowolnej połowie (:189) | :816 | ✓ |
| punkty | `GUESS_POINTS` 10/8/6/5/4, `DRAWER_POINTS = 3` × trafienia (:24-26, :92-97) | :817 | ✓ (też `KONCEPT.md` :98) |
| odsłona | 6 s (:29), „Dalej” od wszystkich (:191-194), po ostatniej rundzie od razu `over` (:97) | :818-819 | ✓ |
| zwycięzca, remis | `rankResults`, remis bez `winner` (:211) | :820 | ✓ |
| ukrywanie | `words` nigdy, `choices` tylko rysujący w wyborze, `word` pusty dla reszty w wyborze i rysowaniu, `hint` z „_”, `cleared` tylko rysujący (:199-209) | :821-822, :809 | ✓ (też `KONCEPT.md` :98) |
| limit | `turn()`: `draw:runda:połowa`, inaczej `faza:runda` (:220) | :823, tabela :16 | ✓ (też `KONCEPT.md` §3 :234) |

- Pasek 80 s na całe rysowanie (:799), paczki co 200 ms (`KONCEPT.md` :101, `Kalambury.tsx:17`) i podwójne „Pasuję” (`KONCEPT.md` :99, `Kalambury.tsx:315`) to ekran,
  sprawdzone tylko jako zgodne z dokumentem; ocena UI należy do innych faz.

#### KL1. `hint` może wysłać sam rysujący w dowolnej chwili pierwszej połowy
- Gra: `kalambury`. Miejsce: `packages/games/src/kalambury.ts:146` (`drawing && s.half === 0`, bez warunku czasu).
- Źródło: `ZASADY-GIER.md` §9 :800 („pierwsza połowa kończy się ruchem `{ type: "hint" }` rysującego (wykonuje go serwer po limicie; tylko rysujący, tylko raz)”).
  Dokument nie mówi wprost, czy rysujący może wysłać go wcześniej; ekran tego nie robi (`Kalambury.tsx` nie wysyła `hint`).
- Waga: **niska**. Ruch musi należeć do rysującego, bo kontrakt wymaga, żeby `timeoutMove` był dozwolonym ruchem czekającego gracza (`f61e42c`, `c84ba5d`, 2026-10-18).
  Zmieniony klient może odsłonić literę wcześniej i skrócić rysowanie, ale korzystają na tym wszyscy zgadujący, a każdy gracz rysuje tyle samo razy.
- Propozycja (popraw dokument): dopisać „rysujący może też sam odsłonić literę wcześniej; ekran tego nie daje”. Ewentualny przycisk „Odsłoń literę” to decyzja fazy 4.

Rozbieżności `KONCEPT.md` ↔ `ZASADY-GIER.md`: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ neutralny: pierwsze hasło, odsłona litery, `pass`, „Dalej” | 01-01-CHECKS.md (choose, draw, reveal, oba tryby); `fuzz05.ts`; testy :187, :484, :400, :453 |
| remis bez zwycięzcy | ✓ samo `ranking` | `kalambury.ts:211`; 01-01-CHECKS.md (remis 10/10); `fuzz05.ts` (124 remisy); test :571 |
| start od pierwszego z `players` | ✓ rysuje `players[0]` | 01-01-CHECKS.md (start p1); test :103 |
| tylko `rng` | ✓ hasła, `nonce`, odsłonięta litera | 01-01-CHECKS.md §3; test :120 |
| stan JSON, brak mutacji | ✓ we wszystkich ośmiu typach ruchów | 01-01-CHECKS.md; `fuzz05.ts` (53 427 ruchów) |
| ukryte informacje, obserwator `""` | ✓ | `fuzz05.ts`; testy :524, :533, :544, :308 |
| klucz `turn()` | ✓ nowy przy fazie, rundzie i połowie, stały przy kresce, cofnij, wyczyść, strzale i pasie | `fuzz05.ts` |
| wspólne funkcje `core.ts` | ✓ `shuffle`, `normalize`, `rankResults` (:2) | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §9) | Test (`kalambury.test.ts`) |
|---|---|
| 2-6 graczy, tryby, Krótka domyślna (:793-794) | :84 |
| kolejka `players[r % n]`, Krótka raz, Długa dwa razy (:793-794) | :145, :155 |
| nieznany tryb = Krótka (:794) | :137 |
| hasła z `WORDS`, 3 na rundę, bez powtórek w partii (:795) | :92, :112, :126 |
| `nonce` (:796) | LUKA (KL3) |
| wybór 15 s, indeks 0-2, po czasie pierwsze (:797) | :109, :167, :177, :187 |
| dwie połowy po 40 s (:798) | :173, :475, :489 |
| odsłona litery: tylko rysujący, raz, losowa, zaczyna 2. połowę (:800-801) | :484, :500 |
| kreski: 0-1000 całkowite, parzysta długość, 2-200 liczb (:802-803) | :241, :596 (:600, :602, :610) |
| `start` zaczyna nową, reszta dokleja, bez kreski odpada (:803) | :196, :250 |
| kolor 0-5, tylko przy `start` (:804-805) | :209, :217 |
| 5 kolorów i gumka, gumka to zwykły kolor (:804-805) | :204, :225 |
| najwyżej 2000 punktów (:806) | :255, :225 |
| `undo`, `clear`, `clear` bez kresek odpada (:807) | :264, :300 |
| `undo` przywraca wyczyszczony, bez niczego odpada (:808-809) | :276, :286 |
| odłożony rysunek zna tylko rysujący (:809) | :308 |
| strzał do 30 znaków, niepusty (:810) | :370 |
| `normalize` (:810-811) | :337 |
| trafienie do `guessed`, treść nigdzie; pudło na czacie (:811-812) | :345 |
| najwyżej 30 pudeł (:812) | :377 |
| kto zgadł albo spasował, nie strzela; rysujący nie zgaduje (:813) | :354, :364 |
| `pass` w obu połowach, po limicie 2. połowy (:814) | :475 (1. połowa), :400 |
| `waitingFor` w połowach (:815) | :174, :478, :490, :361 |
| runda kończy się w dowolnej połowie (:816) | :391, :508 |
| punkty 10/8/6/5/4 i 3 za trafienie, sumy (:817) | :412, :423, :428 |
| odsłona 6 s, „Dalej” od wszystkich, po czasie „Dalej” (:818) | :397, :438, :453 |
| po ostatnim rysowaniu od razu koniec, hasło i rysunek zostają (:819) | :460 |
| wygrywa suma, remis bez zwycięzcy (:820) | :560, :571, :579 |
| ukrywanie haseł i podpowiedź (:821-822) | :524, :533, :544, :484, :438 |
| klucz `faza:runda:połowa`, nie przy kresce ani strzale (:823) | :109, :173, :397, :450, :489, :518 (wartości); stałość klucza LUKA (KL2) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turn()`, świeża gra nieskończona | ✓ | :84, :103, :109 |
| Setup: stan, kto zaczyna, seedy | ✓ | :103, :120 |
| Walidacja: spoza gry | ✓ | :613, :237 |
| Walidacja: poza turą, zła faza | ✓ | :177, :234, :385, :500 |
| Walidacja: poprawny kształt, niedozwolony | ✓ | :250, :300, :377, :354 |
| Walidacja: po końcu | ✓ | :587 |
| Walidacja: brzegi | ✓ | :177 (−1 / 3), :209 (0, 5 / −1, 6), :241 (0, 1000 / −1, 1001), :370, :596 (200 / 202 liczby) |
| Schemat | ✓ | :596 |
| Koniec: wygrana każdego gracza | ✓ | B :564, A :568 |
| Koniec: remis, ranking, `waitingFor` puste | ✓ | :571, :579, :460 |
| Limit: `timeoutMove` w każdej fazie | ✓ | :187 (wybór), :484 (1. połowa), :400 (2. połowa), :453 (odsłona) |
| Stan: brak mutacji, JSON | ✓ | :618 (kreska i strzały; pozostałe typy `fuzz05.ts`) |
| Typ: ukryty stan, gracz i obserwator w każdej fazie | ✓ | :524 (wybór), :533 (rysowanie), :544 (wybór, rysowanie, odsłona), :308 |
| Typ: ukryty stan, po odsłonięciu dokładnie to | ✓ | :484 (jedna litera), :438 (hasło od odsłony) |
| Typ: fazy równoczesne: `waitingFor` kurczy się | ✓ | :361, :444 |
| Typ: fazy równoczesne: `turn().key` tylko przy zmianie fazy | LUKA (częściowo) | KL2 |
| Typ: fazy równoczesne: min i max graczy | ✓ | :412 (6 os.), :564 (2 os.) |

#### KL2. Stałość klucza `turn()` bez testu
- Miejsce: `kalambury.test.ts:196` (kreska), `:345` (strzały) i `:475` (pas) nie porównują klucza; testy :173, :489, :518 sprawdzają wartości na przejściach. Kod :220. `[zbiorcze: turn-key-staly]`
- Źródło: `ZASADY-GIER.md` §9 :823 („a nie przy kresce ani strzale”), `ZASADY.md` §2 Fazy równoczesne (:72). Waga: **średnia**.
  Zachowanie poprawne (`fuzz05.ts`: klucz stały przy 2 407 kreskach, 538 cofnięciach i wyczyszczeniach, 20 273 strzałach).
- Propozycja: w teście :475 `expect(game.turn!(s).key).toBe("draw:0:0")` po kresce, pudle i pasie.

#### KL3. `nonce` bez testu
- Miejsce: brak w `kalambury.test.ts`; kod `kalambury.ts:124`. Państwa-miasta mają taki test (`panstwa-miasta.test.ts:122`).
- Źródło: `ZASADY-GIER.md` §9 :796. Waga: **niska** (pole techniczne do montowania ekranu przy rewanżu; 01-01-CHECKS.md: determinizm ✓).
- Propozycja: `expect(game.setup([A, B], createRng(2)).nonce).not.toBe(game.setup([A, B], createRng(1)).nonce)` w teście :120.

## Turniej (`turniej`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §8 (:765). Opis w `KONCEPT.md` §2: ✓ §2.6 (:171-181). Nie jest w `GAMES` (`turniej.test.ts:26`), więc kontrakt `GameDefinition` nie obowiązuje.

| Stała / zasada | Kod (`turniej.ts`) | ZASADY-GIER §8 | Zgodne |
|---|---|---|---|
| gracze | `players` z pokoju (`this.seats`, `LobbyRoom.ts:406`) | :770 | ✓ (też `KONCEPT.md` :173) |
| konfiguracja | `Config { length, must, skip }` (:11-15), `cleanConfig` (:39-48) | :771 | ✓ |
| zaznaczanie | `mark`: jedna gra, `must`/`skip`/`any`, ostatnie wygrywa (:53-57) | :772-773 | ✓ (też `KONCEPT.md` :175-176) |
| długość | `MIN_LENGTH = 3`, `DEFAULT_LENGTH = 8` (:5-6), przycinanie do 3..niewykluczone (:47) | :775 | ✓ (też `KONCEPT.md` :175) |
| `must` podnosi długość | `max(..., must.length, ...)` (:47) | :776 | ✓ |
| po wykluczeniu co najmniej 3 | :45-46 | :777 | ✓ |
| odrzucenie | nieznane id (:41), `must` ∩ `skip` (:44), niecałkowita długość (:40) | :778 | ✓ |
| losowanie | wszystkie `must` + losowe z reszty, `shuffle` dwa razy (:62-65) | :779 | ✓ |
| punkty za grę | ściśle gorsze miejsca (:71-73), wejście `places` mini-gry albo `null` (`LobbyRoom.ts:405`) | :780-781 | ✓ (też `KONCEPT.md` :177) |
| gra przerwana | `{}` w `points` (:102), czyli 0 dla wszystkich | :781 | ✓ (też `KONCEPT.md` :180) |
| tabela | suma, potem wygrane (:87); wygrana = `n − 1` punktów przy 2+ graczach (:82) | :782 | ✓ (też `KONCEPT.md` :177), ale T1 |
| przerwa między grami | `NEXT_SECONDS = 15` (:8), timer w `LobbyRoom.ts:413-423` | :783 | ✓ (też `KONCEPT.md` :178) |
| zwycięzca | samodzielny lider po końcu (:92-95) | :784 | ✓ |
| dogrywka | remis na szczycie, raz (`extra`), spoza rozegranych i wykluczonych, inaczej dowolna niewykluczona (:101-108) | :784-785 | ✓ (też `KONCEPT.md` :179) |
| solo | bez dogrywki (`players.length < 2`, :103) i bez zwycięzcy (brak `second`, :94) | :786 | ✓ |
| wyjście gracza | `standings` tylko dla `players` (:76-85) | :787 | ✓ (też `KONCEPT.md` :180) |
| rewanż | `begin`: nowe losowanie z tą samą konfiguracją, tabela od zera (:68) | :788 | ✓ |
| ranking SQLite | `TOURNAMENT_ID = "turniej"` (:4), `win(TOURNAMENT_ID, champion)` (`LobbyRoom.ts:411`) | :789 | ✓ (też `KONCEPT.md` :181) |

- Poza zakresem (pokój, D-15): zaznaczanie przez oglądających, `markedBy`, kasowanie gotowości, „Dalej” od wszystkich, koniec przez gospodarza (:772-774, :783, :788).

#### T1. Pełny remis w tabeli rozstrzyga kolejność miejsc, dokument tego nie mówi
- Miejsce: `packages/games/src/turniej.ts:84` (`rows.sort(byStanding)`, stabilne sortowanie zostawia kolejność `players`), komentarz :75 („przy pełnym remisie kolejność miejsc”).
- Źródło: `ZASADY-GIER.md` §8 :782 („suma punktów malejąco, potem liczba wygranych gier”); zasada tylko w kodzie (D-07), test :218 ją zakłada.
- Waga: **niska**. Zwycięzcy nie zmienia (pełny remis na szczycie = dogrywka albo brak zwycięzcy), zmienia tylko kolejność wierszy tabeli na ekranie.
  To ten sam przypadek co C1 w 01-04 (Chińczyk Szybki). Linia z `b9db206` (2026-10-10, pierwsza wersja).
- Propozycja (popraw dokument): dopisać „przy równych punktach i wygranych kolejność miejsc”.

Rozbieżności `KONCEPT.md` ↔ `ZASADY-GIER.md`: brak.

### Reguły §3 (RULE-02)

Zakres jak w planie: tylko reguły, które dotyczą turnieju (D-15).

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | n/d: turniej nie ma tur; odpowiednik to „Dalej” po 15 s w pokoju | `LobbyRoom.ts:413-423` |
| remis bez zwycięzcy | ✓ remis na szczycie po dogrywce i turniej solo bez zwycięzcy | `turniej.ts:92-95`; `fuzz05.ts` (49 remisów, 769 solo, nigdy ze zwycięzcą); testy :281, :295 |
| start od pierwszego z `players` | n/d | – |
| tylko `rng` | ✓ `shuffle` i `rng()` z argumentu (:64, :107); w pokoju `newRng()` i `rng` partii | 01-01-CHECKS.md §3 (grep obejmuje `turniej.ts`, pusty); test :134 |
| stan JSON, brak mutacji | ✓ `create`, `begin`, `mark`, `advance` zwracają nowe obiekty | `fuzz05.ts` (wejścia zamrożone, 0 błędów); testy :102, :225 |
| `ranked` / `places` | ✓ punkty liczone z `places` mini-gry (`rankPlaces`), gra bez rankingu = `null` | `LobbyRoom.ts:405`; 01-01-CHECKS.md (places/record ✓ dla wszystkich mini-gier) |
| wspólne funkcje `core.ts` | ✓ `shuffle` (:1); tabela ma własny komparator, bo `ranked` działa na `GameDefinition` | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §8) | Test (`turniej.test.ts`) |
|---|---|
| nie jest grą z rejestru, `id` `turniej` (:767, :789) | :26 |
| konfiguracja przechodzi bez zmian, domyślnie 8 (:771, :775) | :32 |
| zaznacza każdy, jedna gra, ostatnie wygrywa (:772-773) | :68, :73, :80, :86 |
| długość 3..niewykluczone, przycinana (:775) | :37, :91 |
| `must` podnosi długość (:776) | :46, :91 |
| po wykluczeniu co najmniej 3 (:777) | :54 (:60-61), :96 |
| odrzucenie: nieznane id, obie listy, niecałkowita długość (:778) | :54, :96 |
| losowanie: `must`, reszta z puli, bez powtórzeń i wykluczonych, potasowane (:779) | :111, :120, :129, :134 |
| punkty: ściśle gorsze miejsca, remis po równo (:780) | :157, :161, :167 |
| gra przerwana: 0 dla wszystkich (:781) | :201 |
| tabela: suma, potem wygrane; wygrana = samodzielne 1. miejsce przy 2+ (:782) | :175, :183, :194 |
| „Dalej” najpóźniej po 15 s (:783) | LUKA (T2) |
| zwycięzca: samodzielny lider po ostatniej grze (:784) | :239, :245, :252 |
| dogrywka: jedna, spoza rozegranych i wykluczonych, inaczej powtórka (:784-785) | :265, :274, :288 |
| po dogrywce remis bez zwycięzcy (:785) | :281 |
| solo bez zwycięzcy i dogrywki (:786) | :295 |
| remis poniżej 1. miejsca nie daje dogrywki (wynika z :784) | :302 |
| wyjście gracza: znika z tabeli, turniej trwa (:787) | :211, :308 |
| rewanż: nowe losowanie, tabela od zera (:788) | :140 |

Testy obowiązkowe `ZASADY.md` §2 (w zakresie, który ma sens bez `GameDefinition`):

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: stałe (`MIN_LENGTH`, `DEFAULT_LENGTH`, `TOURNAMENT_ID`) | ✓ | :38, :34, :27 |
| Definicja: `NEXT_SECONDS` | LUKA | T2 |
| Definicja: przed startem nieskończony | ✓ | :144, :151 |
| Setup (`draw`, `begin`): stan, seedy | ✓ | :111, :134, :140 |
| Walidacja (`cleanConfig`, `mark`): niedozwolone, brzegi | ✓ | :54, :96 (odrzucenia); :37 (1 i −5 → 3, 10 zostaje, 99 → 10), :61 (dokładnie 3 po wykluczeniu) |
| Schemat | n/d | schematy `pickTournament` i `markGame` są w `lobby.ts` (index.test.ts:34, :41), poza zakresem (D-15) |
| Koniec: wygrana każdego gracza | ✓ | B :249, A :262 |
| Koniec: remis, kolejność tabeli | ✓ | :281, :295; :175, :183 |
| Limit | n/d | brak `timeoutMove`; przerwa między grami to T2 |
| Stan: brak mutacji, JSON | ✓ | :102 (`mark`), :225 (`advance`); `draw` i `begin` `fuzz05.ts` |

#### T2. Przerwa 15 s między grami bez testu
- Miejsce: `turniej.ts:8` (`NEXT_SECONDS`), używana w `LobbyRoom.ts:413`, `:423`; `turniej.test.ts` jej nie importuje. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY-GIER.md` §8 :783, `KONCEPT.md` :178, `ZASADY.md` §2 Definicja (:54, odpowiednik `turnSeconds`). Waga: **średnia** (dziś zgodne).
- Propozycja: `expect(NEXT_SECONDS).toBe(15)` w teście :26.

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| PM1 | panstwa-miasta | średnia | `definicja-swieza-gra` |
| PM2 | panstwa-miasta | średnia | `setup-ten-sam-seed` |
| PM3 | panstwa-miasta | średnia | – |
| PM4 | panstwa-miasta | średnia | `brzegi` |
| PM5 | panstwa-miasta | średnia | `schemat-smieci` |
| PM6 | panstwa-miasta | średnia | – |
| PM7 | panstwa-miasta | średnia | – |
| PM8 | panstwa-miasta | średnia | `turn-key-staly` |
| PM9 | panstwa-miasta | średnia | `stan-mutacja-json` |
| PM10 | panstwa-miasta | niska | – |
| KL1 | kalambury | niska | – |
| KL2 | kalambury | średnia | `turn-key-staly` |
| KL3 | kalambury | niska | – |
| T1 | turniej | niska | – |
| T2 | turniej | średnia | `definicja-swieza-gra` |

Wpisy o wysokiej wadze: **brak**. Odstępstwa z powodem (D-11): brak. Nowy klucz zbiorczy dla 01-10: `turn-key-staly` (PM8, KL2).

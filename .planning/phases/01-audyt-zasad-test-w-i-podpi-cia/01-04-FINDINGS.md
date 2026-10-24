# 01-04: gry główne turowe (zasady, reguły §3, testy)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23. Kryteria 1-3 roadmapy dla `piec-w-rzedzie`, `statki`, `chinczyk`, `labirynt`, `memory`.
Repo bez zmian (poza `.planning/`). Podpięcie (§6) tych gier jest w 01-02-FINDINGS.md.

## Metoda

- Kod `packages/games/src/<id>.ts` i testy `<id>.test.ts` każdej gry przeczytane w całości i porównane punkt po punkcie z `ZASADY-GIER.md`
  (tabela gier :7-46, §2 :568-573, §3 :575-598, §4 :600-628, §7 :743-763, §10 :825-845), `KONCEPT.md` §1 (:9), §2.3-2.3d (:67-107) i §3 (:233-234).
- Dowód §3 dla samych `timeoutMove`: 01-01-CHECKS.md, wiersze tych gier (wszystkie tryby, bez błędów).
- Skrypt `fuzz04.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`) uzupełnia 01-01 o ruchy, których same timeouty nie robią
  (ścianki w Labiryncie, `place` w Statkach, wybór pionka w Chińczyku): każdy tryb, każda liczba graczy od `minPlayers` do `maxPlayers`, 150 seedów
  (Memory 40), w każdym kroku losowy **dozwolony** ruch (75%) albo `timeoutMove` (25%). Sprawdzenia: świeża gra nieskończona; `timeoutMove` każdego
  czekającego przechodzi schemat i `validateMove`; ruch odrzucony dla `obcy` i dla graczy spoza `waitingFor`; stan zamrożony rekursywnie przed `applyMove`
  i porównany JSON-em; round-trip JSON stanu i widoków wszystkich graczy i `""`; klucz `turn()` (Chińczyk: nowy po każdym ruchu; Statki: stały w rozstawianiu,
  nowy po każdym strzale); Statki: żaden widok nie pokazuje niezatopionego statku rywala; Memory: widoki równe, odkryte dokładnie karty zebrane, `first`, `miss`;
  Chińczyk: dwa pionki nigdy na jednym polu toru. Wynik: **0 błędów** we wszystkich grach.

| gra | partie | ruchy | typy ruchów | wyniki |
|---|---|---|---|---|
| piec-w-rzedzie | 150 | 11 867 | `{x,y}` | zwycięzca 150 |
| statki | 600 | 100 278 | place 443, ready 1200, shoot 98 635 | zwycięzca 600 |
| chinczyk | 900 | 232 684 | roll 190 229, move 42 455 | zwycięzca 900 |
| labirynt | 900 | 30 231 | step 23 595, wall 6 636 (`pass` 0, patrz L1) | zwycięzca 900 |
| memory | 600 | 473 332 | `{card}` | zwycięzca 482, remis 118 (zawsze bez zwycięzcy) |

- Przypadki brzegowe z wpisów: `cases04.ts` i `cases04b.ts` (scratchpad), stan budowany jak w testach (`setup` + nadpisanie pól), kostka sterowana.
- Serwer zawsze puszcza ruch przez `moveSchema.safeParse` przed `validateMove` (`apps/server/src/LobbyRoom.ts:177`, `:363`), więc luźniejsza walidacja kształtu
  w `validateMove` (np. Labirynt przyjmuje `{type:"jump"}` bez schematu) nie jest dziurą i nie ma wpisu.

## Gomoku (`piec-w-rzedzie`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §2 (:568). Opis w `KONCEPT.md` §2: ✓ §2.3 (:67-70). Brak trybów.

| Stała | Kod | ZASADY-GIER §2 | Zgodne |
|---|---|---|---|
| plansza | `SIZE = 15` (:4) | 15×15 (:570) | ✓ (też `KONCEPT.md` :70) |
| gracze | `minPlayers`/`maxPlayers` 2 (:52-53) | tabela :12 | ✓ (też `KONCEPT.md` :9) |
| kto zaczyna | `turn: 0` (:61) | `players[0]` (:570) | ✓ |
| wygrana | `WIN = 5`, `line.length >= WIN` (:5, :44), 4 kierunki (:6-11) | 5 lub więcej, poziomo, pionowo, po skosie (:571) | ✓ |
| remis | pełna plansza → `{}` (:89, :105) | `{}` bez zwycięzcy (:572) | ✓ (ale §3, G1) |
| limit tury | `turnSeconds: 60` (:54) | 60 s (:12) | ✓ (też `KONCEPT.md` §3 :233) |
| `timeoutMove` | losowe wolne pole przez `rng` (:110-114) | :573 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ losowe wolne pole | 01-01-CHECKS.md wiersz `piec-w-rzedzie`; test :217, :225 |
| remis bez zwycięzcy | ✓ bez `winner`, ale bez `ranking` | G1 |
| start od pierwszego z `players` | ✓ | 01-01-CHECKS.md (start p1); test :44 |
| tylko `rng` | ✓ (`setup` bez losowania, `timeoutMove` z `rng`) | 01-01-CHECKS.md §3 (grep pusty, determinizm ✓) |
| stan JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz04.ts` |
| obserwator `""` | ✓ `playerView` nie zależy od gracza (:93) | `fuzz04.ts` |
| `ranked` / `places` | n/d (gra główna) | – |
| wspólne funkcje `core.ts` | n/d (gra nie tasuje i nie układa rankingu) | – |

#### G1. Remis zwraca `{}` zamiast samego `ranking`
- Gra: `piec-w-rzedzie`. Miejsce: `packages/games/src/piec-w-rzedzie.ts:105` (`state.winLine ? { winner } : {}`).
- Źródło: `ZASADY.md` §3 (:91 „Remis nie ma zwycięzcy. `isOver` zwraca wtedy samo `ranking`”). `ZASADY-GIER.md` §2 :572 opisuje `{}`, ale bez powodu, więc to nie jest odstępstwo z D-11.
- Waga: **niska**. Ekran pokazuje „Remis” tak samo (`apps/web/src/screens/Game.tsx:195-197`), a gra główna nie zapisuje rankingu. Ten sam `{}` oznacza jednak też partię przerwaną
  (`LobbyRoom.ts` `finish({})` przy błędzie ruchu po limicie), więc remisu nie da się odróżnić od przerwania po samym wyniku.
- `git log -L`: linia z `0f6ad01` (2026-10-07, etap 2), reguła §3 z `bf9f266` (2026-10-10), więc to zaszłość sprzed reguły, nie decyzja.
  Inne gry główne z remisem (Memory, Kampus Tour) zwracają `ranking`.
- Propozycja (popraw kod): `{ ranking: [...state.players] }` przy pełnej planszy, poprawić `ZASADY-GIER.md` :572 i test :176.

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §2) | Test (`piec-w-rzedzie.test.ts`) |
|---|---|
| plansza 15×15 (:570) | :68-89 (rogi 0 i 14 przechodzą, −1 i 15 nie) |
| dwóch graczy na zmianę (:570) | :33, :50 |
| zaczyna `players[0]` (:570) | :44, :209 |
| 5 w linii: poziomo, pionowo, oba skosy (:571) | :96, :101, :106, :111; przy krawędzi :116; środek linii :121 |
| dłuższa linia też wygrywa (:571) | :126 |
| pełna plansza bez linii = remis `{}` (:572) | :165 |
| limit czasu: losowe wolne pole (:573) | :217 (50 seedów), :225 (jedyne wolne pole) |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, świeża gra nieskończona | ✓ | :33, :38 |
| Definicja: `turnSeconds` | LUKA | G2 |
| Setup: stan, kto zaczyna | ✓ | :44, :209 |
| Setup: seedy | n/d | `setup` nie losuje |
| Walidacja: spoza gry / poza turą / niedozwolony / po końcu | ✓ | :56 / :50 / :63 / :156 |
| Walidacja: brzegi | ✓ | :68-89 |
| Schemat | LUKA (częściowo) | G3 |
| Koniec: wygrana każdego gracza | ✓ | A :96, B :132 |
| Koniec: remis | ✓ | :165 |
| Koniec: ranking | n/d | dwóch graczy, `isOver` bez `ranking` (patrz G1) |
| Koniec: `waitingFor` puste | ✓ | :209 |
| Limit: `timeoutMove` przechodzi `validateMove` | ✓ | :217 (jedna faza) |
| Stan: brak mutacji, JSON | ✓ | :181, :189 |
| Typ: ukryty stan, fazy równoczesne | n/d | widok to cały stan bez sekretów (:199) |

#### G2. Limit tury sprawdzony tylko jako „większy od zera”
- Miejsce: `piec-w-rzedzie.test.ts:237-239` (`toBeGreaterThan(0)`); kod `piec-w-rzedzie.ts:54`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54), D-03. Waga: **średnia**. Zachowanie poprawne (01-01-CHECKS.md §3: 60 s).
- Propozycja: `expect(game.turnSeconds).toBe(60)`.

#### G3. Schemat bez liczby niecałkowitej
- Miejsce: `piec-w-rzedzie.test.ts:255-260` (zły typ, brak pola, `null`); `x: 1.5` jest tylko w teście `validateMove` (:73), nie schematu. `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62 „liczba niecałkowita”), D-03. Waga: **średnia** (schemat ma `.int()`, :55, więc zachowanie poprawne).
- Propozycja: dopisać `{ x: 1.5, y: 2 }` → `false` w teście :255.

## Statki (`statki`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §3 (:575). Opis w `KONCEPT.md` §2: ✓ §2.3 (:71-77).

| Stała | Kod | ZASADY-GIER §3 | Zgodne |
|---|---|---|---|
| tryby, kolejność | `MODES` szybki, hasbro, klasyczny, flota (:16-21) | :577-578, tabela :581-586 | ✓ (też `KONCEPT.md` :72-74) |
| domyślny / nieznany | `DEFAULT` klasyczny, `?? DEFAULT` (:22, :154) | :577 | ✓ |
| `szybki` | 8×8, 4-3-2-2, bez stykania (:17) | :583 | ✓ |
| `hasbro` | 10×10, 5-4-3-3-2, stykanie (:18) | :584 | ✓ |
| `klasyczny` | 10×10, 4-3-3-2-2-2-1-1-1-1, bez stykania (:19) | :585 | ✓ |
| `flota` | 12×12, 6-5-4-4-3-3-2-2, bez stykania (:20) | :586 | ✓ |
| stykanie | bez: statek + pola wokół zajęte, z: tylko pola statku (:102-106) | :588 | ✓ |
| rozstawianie | losowa flota (:155), `place` z `isValidFleet` (:164), `ready`/`unready` (:165-168) | :589-591 | ✓ (`unready` niemożliwe po starcie bitwy, bo faza już `battle`) |
| bitwa | strzela `players[0]` (`shooter: 0`, :190), pudło oddaje turę (:198), trafienie nie (:211-216) | :592 | ✓ |
| zatopienie | `sunk` + `around` wokół, bez `around` przy stykaniu (:202-208) | :593-594 | ✓ (też `KONCEPT.md` :76 „X wokół zatopionego”) |
| koniec | cała flota zatopiona (:209) | :595 | ✓ |
| limit | `turn()`: 90 s stały klucz w rozstawianiu, 60 s nowy klucz po strzale (:245-248), `PLACING_SECONDS = 90` (:25) | :596-597, tabela :11 | ✓ (też `KONCEPT.md` §3 :234) |
| `timeoutMove` | `ready` w rozstawianiu, losowe nieostrzelane pole w bitwie (:256-264) | :591, :595 | ✓ |
| ukrywanie | właściciel wszystkie, reszta i `""` tylko zatopione (:219-228) | :598 | ✓ |

- „Rewanż gra w tym samym trybie, ranking liczy wszystkie tryby razem” (:579) to zachowanie lobby i `stats.ts`, poza zakresem tego planu (D-15).

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ `ready` z obecną flotą, losowy strzał | 01-01-CHECKS.md (placing, battle, 4 tryby); test :458 |
| remis bez zwycięzcy | n/d: remisu nie ma (strzela jeden gracz, partia kończy się na strzale zatapiającym ostatni statek) | `statki.ts:209-215` |
| start od pierwszego z `players` | ✓ rozstawianie naraz, bitwę zaczyna `players[0]` | 01-01-CHECKS.md (start „wszyscy”); test :183 |
| tylko `rng` | ✓ floty i strzały z `rng` | 01-01-CHECKS.md §3 |
| stan JSON, brak mutacji | ✓ także `place` | 01-01-CHECKS.md; `fuzz04.ts` (443 `place`) |
| ukryte informacje, obserwator `""` | ✓ w obu fazach i po końcu | `fuzz04.ts` (0 wycieków); `cases04.ts` (obserwator w rozstawianiu: 0 statków) |
| klucz `turn()` | ✓ stały w rozstawianiu, nowy po każdym strzale | `fuzz04.ts`; serwer odnawia limit tylko przy zmianie klucza (`LobbyRoom.ts:369-371`) |
| wspólne funkcje `core.ts` | n/d (`randomFleet` nie ma odpowiednika) | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §3) | Test (`statki.test.ts`) |
|---|---|
| tryb z lobby, nieznany/brak = klasyczny (:577) | :369 |
| lista od najkrótszej do najdłuższej (:578) | :361 |
| tabela trybów: plansza, flota, stykanie (:581-586) | :379 (szybki, hasbro, flota), :369 (klasyczny), :425, :442 (brzegi plansz) |
| statki proste; bez stykania bokiem i rogiem (:588) | :97, :102, :107 |
| ze stykaniem tylko bez nakładania (:588) | :397 |
| losowa poprawna flota na start (:589) | :87, :134, :379 |
| `place` podmienia flotę z walidacją (:589) | :144 |
| `ready` zamyka, `unready` otwiera, dopóki drugi niegotowy (:590) | :152, :159, :169 |
| obaj gotowi: bitwa (:590) | :183 |
| limit w rozstawianiu: `ready` (:591) | :506 |
| bitwę zaczyna `players[0]` (:592) | :183 |
| pudło oddaje turę, trafienie daje strzał (:592) | :198, :204 |
| zatopienie: `sunk`, `around` także po skosie, nie da się strzelić (:593) | :214, :224, :232, :275 |
| ze stykaniem bez `around` (:594) | :407 |
| wygrywa zatopienie całej floty (:595) | :257, :266, :419 |
| limit w bitwie: losowe nieostrzelane pole (:595) | :513, :458 |
| jeden licznik 90 s, bez odnawiania przy `place`/`ready`/`unready`; 60 s po każdym strzale (:596-597) | :479 |
| widok: właściciel wszystko, reszta i obserwator tylko zatopione (:598) | :301, :306, :312, :318, :324, :272 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max | ✓ | :129 |
| Definicja: `turnSeconds`/`turn()`, świeża gra nieskończona | LUKA (częściowo) | S1 |
| Setup: stan, kto zaczyna | ✓ | :134, :470 |
| Setup: różne seedy różne | ✓ | :91 |
| Setup: ten sam seed to samo | LUKA | S2 |
| Walidacja: spoza gry | ✓ | :190, :173 |
| Walidacja: poza turą, zła faza | ✓ | :210, :178, :187, :174 |
| Walidacja: poprawny kształt, niedozwolony | ✓ | :144 (zła flota), :152 (po gotowości), :232 (to samo pole, pole `around`) |
| Walidacja: po końcu | ✓ | :283, :175 |
| Walidacja: brzegi | ✓ | :239, :111, :425, :442 |
| Schemat | LUKA (częściowo) | S3 |
| Koniec: wygrana każdego gracza | ✓ | A :257, B :266 |
| Koniec: remis, ranking | n/d | remisu nie ma, dwóch graczy |
| Koniec: `waitingFor` puste | ✓ | :262 |
| Limit: `timeoutMove` w każdej fazie | ✓ | :458 (4 tryby × 2 fazy) |
| Stan: brak mutacji, JSON | ✓ | :527 (strzał), :534 |
| Typ: ukryty stan, widok gracza w każdej fazie | ✓ | :306 (rozstawianie), :301, :312 (bitwa), :272 (koniec) |
| Typ: ukryty stan, widok obserwatora | LUKA (częściowo) | S4 |
| Typ: ukryty stan, po odsłonięciu dokładnie to | ✓ | :312, :318 |
| Typ: fazy równoczesne: `waitingFor` kurczy się | ✓ | :470 |
| Typ: fazy równoczesne: `turn().key` | ✓ | :479 |
| Typ: fazy równoczesne: min i max graczy | ✓ | :129 (2 = min = max) |

#### S1. Limit bitwy i świeża gra bez testu wprost
- Miejsce: `statki.test.ts:521-523` (`turnSeconds` tylko > 0), `:497` (sekundy bitwy porównane z `game.turnSeconds`, nie z 60); `isOver(setup(...))` nigdzie. Kod `statki.ts:148`, `:247`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54), `ZASADY-GIER.md` §3 :597 (60 s). Waga: **średnia**. Zachowanie poprawne (`fuzz04.ts`: świeża gra nieskończona; 01-01-CHECKS.md §3).
- Propozycja: w teście :479 `expect(game.turn!(s).seconds).toBe(60)` po starcie bitwy i test „nowa gra nie jest skończona”.

#### S2. Brak testu „ten sam seed daje to samo ustawienie”
- Miejsce: `statki.test.ts:91` (tylko różne seedy dają różne floty), `:134` (A i B mają różne floty). `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55). Waga: **średnia**. Zachowanie poprawne (`cases04.ts`: `setup` z `createRng(5)` dwa razy daje ten sam stan).
- Propozycja: `expect(game.setup([A, B], createRng(5))).toEqual(game.setup([A, B], createRng(5)))`.

#### S3. Schemat bez liczby niecałkowitej i bez brakującego pola
- Miejsce: `statki.test.ts:541-549` (zły typ współrzędnej, nieznany `type`, `ships` nie-tablica); brak `{ type: "shoot", x: 1.5, y: 0 }`, `{ type: "shoot", x: 1 }`,
  statku z `length: 1.5` albo bez `vertical`. Pole 1.5 sprawdza tylko `validateMove` (:243). `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62), D-03. Waga: **średnia** (schemat ma `.int()` i wymagane pola, `statki.ts:59-73`).
- Propozycja: dopisać te cztery przypadki do testu :541.

#### S4. Widok obserwatora sprawdzony tylko w bitwie
- Miejsce: `statki.test.ts:324` (bitwa); rozstawianie i koniec partii bez widoku `""`. `[zbiorcze: widok-obserwatora]`
- Źródło: `ZASADY.md` §2 Ukryty stan (:70-71 „w każdej fazie”, „widok obserwatora nie zawiera danych żadnej strony”). Waga: **niska**
  (`playerView` traktuje `""` jak rywala obu stron, `statki.ts:224`; `fuzz04.ts` i `cases04.ts`: 0 wycieków w każdej fazie).
- Propozycja: w teście :306 i :266 dodać `view(s, "").boards[A|B].ships` równe `[]` (albo tylko zatopione).

## Chińczyk (`chinczyk`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §4 (:600). Opis w `KONCEPT.md` §2: ✓ §2.3a (:79-85).

| Stała | Kod | ZASADY-GIER §4 | Zgodne |
|---|---|---|---|
| gracze, pionki | 2-4 (:173-174), 4 pionki (:186) | :602 | ✓ (też `KONCEPT.md` :9, :81) |
| tor, domek | `TRACK = 40`, `LAST = 43`, `BASE = -1` (:4-7) | :602-603 | ✓ |
| starty | co 10, przy 2 graczach co 20 (:181) | :603-604 | ✓ |
| wyjście | `exits` [6] / [1, 6] (:31-32), tylko pierwszy pionek z domku (:114) | :605, :615, :622 | ✓ |
| dokładny rzut i domek bez przeskakiwania | `exact` (:94-98) | :606-608 | ✓ |
| nadwyżka w Szybkim | najdalsze wolne pole domku przed pionkiem (:100-103) | :623-624 | ✓ (też `KONCEPT.md` :84 „nadwyżka oczek do domku przepada”) |
| własny pionek | `!own.some(...)` (:117) | :606 | ✓ |
| zbicie | pionki rywali na tym samym polu toru do domku (:141-149) | :609 | ✓ |
| bezpieczny start | `guarded` (:111-112) tylko na lądowanie | :610-611 | ✓ (też `KONCEPT.md` :82) |
| szóstki | kolejny rzut także bez ruchu (:166, :218), trzecia kończy turę (:211) | :612 | ✓ (też `KONCEPT.md` :81) |
| 3 próby | `tries` bez pionków na torze 0-39 (:219) | :613 | ✓ (też `KONCEPT.md` :81) |
| jedyny ruch sam | `options.length === 1` (:214) | :614 | ✓ (też `KONCEPT.md` :85) |
| koniec Klasyczny | 4 w domku → `ranking`, bez dodatkowego rzutu, ostatni dopisany (:153, :160-163) | :616-617 | ✓ (też `KONCEPT.md` :85) |
| premia Szybki | zbicie albo wejście z toru do domku → jeden rzut (`again` jest wartością logiczną, :166) | :625 | ✓ (`cases04b.ts`: 6 + wejście daje jeden rzut) |
| koniec Szybki | 3 w domku kończy partię; reszta: więcej w domku, potem większa suma (:153-158) | :626-627 | ✓, ale C1 |
| limit | `turn()`: 60 / 20 s, klucz `turn:phase:roll` (:31-32, :241) | :618, :620, tabela :10 | ✓ (też `KONCEPT.md` §3 :233-234) |
| `timeoutMove` | `roll` albo losowy z `legalMoves` (:245-249) | :618 | ✓ |

#### C1. Szybki: pełny remis dalszych miejsc rozstrzyga kolejność przy stole
- Gra: `chinczyk`. Miejsce: `packages/games/src/chinczyk.ts:157` (sortowanie po `home`, potem `sum`, przy równości zostaje kolejność `players`).
- Źródło: `ZASADY-GIER.md` §4 :626-627 („Reszta rankingu: więcej pionków w domku końcowym, potem większa suma pozycji”); co przy równej sumie, dokument nie mówi. Zasada tylko w kodzie (D-07).
- Waga: **niska**. Zwycięzca się nie zmienia, ranking gry głównej nie trafia do SQLite poza zwycięzcą; zmienia się tylko lista miejsc na ekranie końcowym (`Game.tsx:402`, przy 3-4 graczach).
- Dowód (`cases04.ts`): ten sam układ (a i b po jednym pionku na 10), C kończy; przy `players` [a, b, c] ranking `[c, a, b]`, przy [b, a, c] `[c, b, a]`.
- Propozycja (popraw dokument): dopisać „przy równej sumie decyduje kolejność miejsc”. Wspólne miejsce dla remisu to decyzja fazy 4 (wymagałaby `places` albo zmiany kontraktu dla gier głównych).

Rozbieżności `KONCEPT.md` ↔ `ZASADY-GIER.md`: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ rzut albo losowy pionek | 01-01-CHECKS.md (roll, move, oba tryby); `fuzz04.ts`; testy :386, :391, :515 |
| remis bez zwycięzcy | n/d: Klasyczny gra do pełnego rankingu, Szybki kończy pierwszy z 3 pionkami, więc zwycięzca jest zawsze | `chinczyk.ts:153-163`; `fuzz04.ts` (900/900 ze zwycięzcą) |
| start od pierwszego z `players` | ✓ | 01-01-CHECKS.md; test :53 |
| tylko `rng` | ✓ kostka `Math.floor(rng() * 6) + 1` (:206), `setup` bez losowania | 01-01-CHECKS.md §3 |
| stan JSON, brak mutacji | ✓ w obu fazach i trybach | 01-01-CHECKS.md; `fuzz04.ts` (42 455 ruchów `move`) |
| obserwator `""` | ✓ widok nie zależy od gracza | test :536 |
| klucz `turn()` | ✓ nowy po każdym rzucie i ruchu | `fuzz04.ts` (232 684 ruchy, ani razu bez zmiany klucza); test :405 |
| wspólne funkcje `core.ts` | n/d (własny ranking opisany w §4 :616-627) | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §4) | Test (`chinczyk.test.ts`) |
|---|---|
| 2-4 graczy, 4 pionki (:602) | :53, :69 |
| tor 40, domek 40-43, pozycje od własnego startu (:602-603) | :165, :198, :203, :211 |
| starty co 10, przy 2 graczach 0 i 20 (:603-604) | :61, :65 |
| wyjście tylko na 6 na pozycję 0 (:605) | :114, :121 |
| nie przeskoczyć 43, nie stanąć na własnym (:606) | :216, :160, :138 |
| domek bez przeskakiwania, także z toru (:607-608) | :229, :235 |
| zbicie (:609) | :165, :203, :355 |
| bezpieczny start, przeskok wolno, obcy na cudzym starcie zbijany (:610-611) | :172, :180, :185, :191 |
| szóstka: kolejny rzut, także bez ruchu (:612) | :244, :252 |
| trzecia szóstka kończy turę (:612) | :257, :266, :367 |
| 3 rzuty bez pionka na torze (:613) | :98, :108, :126, :131 |
| jedyny ruch sam, faza `move` przy 2+ (:614) | :121, :162, :86 |
| pionki w domku startowym nierozróżnialne (:615) | :461 (cel tylko dla pionka 2, nie 3) |
| koniec gracza, wypada z kolejki, bez rzutu po szóstce (:616-617) | :285, :309 |
| pełny ranking, ostatni dopisany (:617) | :296, :325 |
| limit: rzut albo losowy pionek; klucz po każdym rzucie i ruchu (:618) | :386, :391, :405 |
| Klasyczny 60 s, Szybki 20 s (:620) | :399 |
| Szybki: pionek na pozycji 0 (:621) | :434 |
| Szybki: wyjście na 1 i 6, kolejny rzut tylko po 6 (:622) | :442, :448 |
| Szybki: nadwyżka na najdalsze wolne pole, brak gdy nie ma (:623-624) | :454, :459, :464 |
| Szybki: przeskakiwanie własnych w domku (:624) | :470 |
| Szybki: zbicie i wejście do domku dają rzut (:625) | :476, :483, :488, :494 |
| Szybki: zawsze jeden dodatkowy rzut, także po szóstce (:625) | LUKA (C4) |
| Szybki: 3 pionki kończą partię, reszta wg domku i sumy (:626-627) | :500, :505 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turn()` | ✓ | :69, :399 |
| Definicja: świeża gra nieskończona | LUKA (częściowo) | C2 |
| Setup: stan, kto zaczyna | ✓ | :53, :434 |
| Setup: seedy | n/d | `setup` nie losuje; wzór kostki przypięty sterowaną kostką (`dice`, :24) |
| Walidacja: spoza gry / poza turą / zła faza | ✓ | :78 / :77, :157 / :86, :92 |
| Walidacja: poprawny kształt, niedozwolony | ✓ | :153 (pionek bez ruchu), :172 (chroniony start) |
| Walidacja: po końcu | ✓ | :282, :314, :512 |
| Walidacja: brzegi | ✓ (bez `pawn: -1` w schemacie, C3) | :211, :216 (pole 43); :156 (pionek 7); :547 (pionek 4) |
| Schemat | LUKA (częściowo) | C3 |
| Koniec: wygrana każdego gracza | ✓ | A :278, B :296, C :505 |
| Koniec: remis | n/d | remisu nie ma |
| Koniec: ranking | ✓ | :296, :325, :505 |
| Koniec: `waitingFor` puste | ✓ | :281, :510 |
| Limit: `timeoutMove` w każdej fazie | ✓ | :386 (roll), :391, :515 (move, oba tryby) |
| Stan: brak mutacji, JSON | ✓ | :523 (rzut), :530 |

#### C2. „Nowa gra nie jest skończona” tylko w trybie Szybkim
- Miejsce: `chinczyk.test.ts:439` (Szybki); test setupu Klasycznego :53 nie woła `isOver`. `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54), D-03 (każdy tryb). Waga: **średnia** (jednolinijkowa poprawka; `isOver` zależy tylko od fazy, `fuzz04.ts` sprawdził świeżą grę w obu trybach).
- Propozycja: w teście :53 `expect(game.isOver(s)).toBeNull()`.

#### C3. Schemat bez liczby niecałkowitej, brakującego pola i dolnej granicy
- Miejsce: `chinczyk.test.ts:542-549`: brak `{ type: "move", pawn: 1.5 }`, `{ type: "move" }` i `{ type: "move", pawn: -1 }` (schemat `.int().min(0).max(3)`, `chinczyk.ts:79`). `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62), Walidacja: brzegi (:61). Waga: **średnia**. Propozycja: trzy przypadki w teście :542.

#### C4. Brak testu: w Szybkim szóstka z wejściem do domku daje jeden dodatkowy rzut, nie dwa
- Miejsce: `chinczyk.test.ts:476`, `:488` (rzut 3, bez szóstki); kod `chinczyk.ts:166`.
- Źródło: `ZASADY-GIER.md` §4 :625 („zawsze jeden dodatkowy rzut, także po szóstce”), `ZASADY.md` §2 („każda zasada z sekcji”). Waga: **średnia**.
- Zachowanie poprawne (`cases04b.ts`: pionek 37, rzut 6, wejście na 43 → faza `roll`, ten sam gracz; następny rzut 3 bez ruchu i bez pionków na torze daje zwykłe 3 próby).
- Propozycja: test „szóstka z wejściem do domku daje jeden dodatkowy rzut”: po nim rzut bez ruchu przy pionku na torze oddaje turę.

## Labirynt (`labirynt`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §10 (:825). Opis w `KONCEPT.md` §2: ✓ §2.3d (:103-107).

| Stała | Kod | ZASADY-GIER §10 | Zgodne |
|---|---|---|---|
| gracze | 2-4 (:132-133) | tabela :14 | ✓ (też `KONCEPT.md` :9, :105) |
| tryby | `klasyczny` 9×9, 10/7/5; `szybki` 7×7, 6/4/3 (:5-8) | :829-832 | ✓ (też `KONCEPT.md` :107) |
| domyślny / nieznany | `klasyczny`, `?? DEFAULT` (:7, :139) | :827 | ✓ |
| start i cel | środek krawędzi, dół, (lewa,) góra, (prawa) (:47, :143); cel przeciwległa krawędź (`atGoal`, :51-52) | :834-835 | ✓ |
| zaczyna | `turn: 0` (:152) | `players[0]` (:835) | ✓ |
| krok, przeskok, skos | `pawnMoves` (:88-111): prosto przez pionek, gdy za nim ścianka/krawędź/pionek skośnie z jego pola, nie przez ściankę | :837-838 | ✓ (`cases04.ts`: pionek za pionkiem → skos; ścianka obok → skos zablokowany) |
| ścianka | punkt 0..size−2 (:117), nachodzenie i krzyżowanie (:119-123), droga dla wszystkich bez pionków (:124-125), pula (:163, :175) | :839-841 | ✓ |
| `pass` | tylko bez kroku (:161) | :842 | ✓ (`cases04.ts`: zamknięty pionek przy 3 osobach, `pass` dozwolony) |
| koniec | pierwszy u celu, bez pełnego rankingu (:172, :182) | :843 | ✓ (też `KONCEPT.md` :107) |
| limit | `turnSeconds: 60` (:134) | tabela :14 | ✓ (też `KONCEPT.md` §3 :233) |
| `timeoutMove` | krok o najmniejszej odległości po ściankach, inaczej `pass` (:186-191) | :844 | ✓ |
| widok | cały stan (:180) | :845 | ✓ |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ krok albo `pass`, zawsze dozwolony | 01-01-CHECKS.md (bez ścianek); `fuzz04.ts` (z 6 636 ściankami); `cases04.ts` (`pass`) |
| `timeoutMove` neutralny albo losowy | odstępstwo z powodem | lista D-11 niżej |
| remis bez zwycięzcy | n/d: „Remisu nie ma” (:843) | – |
| start od pierwszego z `players` | ✓ | 01-01-CHECKS.md; test :52 |
| tylko `rng` | ✓ gra nie losuje nic | 01-01-CHECKS.md §3 (0 wywołań, determinizm ✓) |
| stan JSON, brak mutacji | ✓ także po ściankach | 01-01-CHECKS.md; `fuzz04.ts` |
| obserwator `""` | ✓ widok to cały stan | test :286 |
| wspólne funkcje `core.ts` | n/d | – |

Odstępstwa z powodem (D-11):
- **`timeoutMove` to najlepszy krok, nie ruch neutralny ani losowy** (`labirynt.ts:186-191`, `ZASADY-GIER.md` §10 :844 „krok w stronę celu… Losowości w grze nie ma”).
  Uwaga do fazy 4: gracz, który nie rusza się wcale, idzie najkrótszą drogą do celu i może tak wygrać. Powód w dokumencie mówi tylko, że gra nie losuje,
  a `rng` jest i tak przekazywany do `timeoutMove`, więc losowy dozwolony krok byłby możliwy. Bez wagi (D-11), do decyzji przy przeglądzie §3.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §10) | Test (`labirynt.test.ts`) |
|---|---|
| tryby, domyślny i nieznany klasyczny (:827) | :44, :87 |
| plansze i pule ścianek 2 / 3 / 4 os. (:829-832) | :60, :67, :73, :79 |
| start na środku krawędzi, kolejność miejsc (:834-835) | :60, :67, :73 |
| zaczyna `players[0]` (:835) | :52 |
| jeden ruch w turze (:836) | :97, :105 |
| krok o pole, nie przez ściankę (:837) | :111, :135 |
| przeskok prosto (:837) | :141 |
| skos, gdy za pionkiem ścianka albo krawędź (:838) | :148, :154 |
| skos, gdy za pionkiem inny pionek; nad dwoma się nie skacze (:838) | LUKA (L2) |
| skos z jego pola, nie przez ściankę (:838) | LUKA (L2) |
| ścianka: punkt 0..size−2, nachodzenie, krzyżowanie, styk T (:839-840) | :117, :169, :181 |
| ścianka nie odcina drogi nikomu, pionki nie zasłaniają (:841) | :188, :195, :201 |
| pula się kończy (:841) | :207 |
| `pass` tylko bez kroku (:842) | :163 (tylko przypadek odrzucony); przypadek dozwolony LUKA (L1) |
| pierwszy u celu wygrywa, także przy 3-4 os. (:843) | :227, :235, :242 |
| limit: krok w stronę celu po ściankach (:844) | :263, :267 |
| limit: `pass`, gdy kroku nie ma (:844) | LUKA (L1) |
| widok to cały stan (:845) | :282 |

Testy obowiązkowe `ZASADY.md` §2:

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja: min/max, `turnSeconds`, świeża gra nieskończona | ✓ | :44, :52 |
| Setup: stan, kto zaczyna | ✓ | :52, :60-85 |
| Setup: seedy | n/d | gra nie losuje (nagłówek testów :15) |
| Walidacja: spoza gry / poza turą / niedozwolony / po końcu | ✓ | :93 / :97 / :111, :135, :169, :188 / :255 |
| Walidacja: brzegi | ✓ | :117 (ścianka 0 i 7 / −1 i 8), :111 (krok poza planszę) |
| Schemat | ✓ | :126 (zły typ, brak pola, niecałkowita, zły `dir`, nieznany `type`) |
| Koniec: wygrana każdego gracza | ✓ | :227, :235, :242 (każde z 4 miejsc) |
| Koniec: remis, ranking | n/d | remisu nie ma, ranking niepełny z założenia (:843) |
| Koniec: `waitingFor` puste | ✓ | :232 |
| Limit: `timeoutMove` przechodzi `validateMove` | ✓ (bez przypadku `pass`, L1) | :218-222 (cała partia na timeoutach przez `send`), :263 |
| Stan: brak mutacji, JSON | ✓ | :274 (ścianka i krok), :282 |

#### L1. `pass` dozwolony i `timeoutMove` = `pass` bez testu
- Miejsce: `labirynt.test.ts:163` (tylko „na starcie `pass` odrzucony”), `:263`, `:267` (tylko kroki); kod `labirynt.ts:161`, `:190`.
- Źródło: `ZASADY-GIER.md` §10 :842, :844, `ZASADY.md` §2 („każda zasada z sekcji”, „`timeoutMove` w każdej sytuacji przechodzi `validateMove`”). Waga: **średnia**.
- Losowe partie tego stanu nie trafiają (`fuzz04.ts`: 0 `pass` w 900 partiach), więc gałąź jest sprawdzona tylko ręcznie.
  Zachowanie poprawne (`cases04.ts`: 3 osoby, pionek na (4,8) zamknięty pionkami na (3,8) i (5,8) i ściankami; `pawnMoves` = [], `pass` dozwolony, `timeoutMove` = `pass`).
- Propozycja: test „przy 3 osobach zamknięty pionek może tylko spasować, także po limicie”.

#### L2. Skos przy pionku za pionkiem i skos przez ściankę bez testu
- Miejsce: `labirynt.test.ts:148` (za pionkiem ścianka), `:154` (za pionkiem krawędź); kod `labirynt.ts:101-108`.
- Źródło: `ZASADY-GIER.md` §10 :837-838 („jeśli za nim jest ścianka, krawędź albo inny pionek”, „z jego pola, nie przez ściankę”, „nad dwoma pionkami się nie skacze”). Waga: **średnia**.
- Zachowanie poprawne (`cases04.ts`: pionki na (4,8), (4,7), (4,6) → skos na (3,7) i (5,7), bez skoku na (4,6) ani (4,5);
  ścianka pionowa między (3,7) a (4,7) usuwa skos na (3,7)).
- Propozycja: dwa testy przy 3 osobach: „nad dwoma pionkami się nie skacze, wolno skośnie” i „skos nie przechodzi przez ściankę”.

## Memory (`memory`)

### Zasady (RULE-01)

- Sekcja w `ZASADY-GIER.md`: ✓ §7 (:743). Opis w `KONCEPT.md` §2: ✓ §2.3b (:87-92).

| Stała | Kod | ZASADY-GIER §7 | Zgodne |
|---|---|---|---|
| gracze | 2-6 (:50-51) | :745, tabela :13 | ✓ (też `KONCEPT.md` :89) |
| symbole | `SYMBOLS = 18` (:5), każdy na dwóch kartach (:58-59) | :745 | ✓ (`EMOJI` w `Memory.tsx` ma 18 wpisów) |
| tryby | `mala` 4×8 par, `srednia` 4 kol. × 12 par (domyślny), `duza` 6 × 18 par (:8-12) | :746-752 | ✓ (też `KONCEPT.md` :91 „4×4, 4×6, 6×6”) |
| nieznany / brak | `?? DEFAULT` (`srednia`) (:57) | :746 | ✓ |
| setup | `shuffle` symboli i kart z `rng` (:58-59), `turn: 0` | :754 | ✓ |
| ruch | zakryta karta, nie zebrana, nie drugi raz `first` (:65) | :755 | ✓ |
| para / pudło | para zostaje, ten sam gracz; pudło: tura dalej, `miss` do następnego odkrycia (:70-74) | :756-758 | ✓ (też `KONCEPT.md` :89-90) |
| czas pudła na ekranie | `MISS_MS = 1500` (`apps/web/src/games/Memory.tsx:13`) | :759 | ✓ (też `KONCEPT.md` :90 „1,5 s”) |
| koniec, remis | `rankResults` najwięcej par, remis na górze bez `winner` (:88-92) | :760 | ✓ (też `KONCEPT.md` :90) |
| limit | `turnSeconds: 60` (:52), losowa zakryta karta (:96-99) | :761 | ✓ (też `KONCEPT.md` §3 :233) |
| ukrywanie | widok wspólny, symbole tylko zebranych, `first`, `miss` (:77-86) | :762-763 | ✓ (też `KONCEPT.md` :92) |

Rozbieżności kod ↔ dokumenty: brak.

### Reguły §3 (RULE-02)

| Reguła | Wynik | Dowód |
|---|---|---|
| `timeoutMove` to ruch, nie przegrana | ✓ losowa zakryta karta, także przy odkrytej pierwszej | 01-01-CHECKS.md (3 tryby); test :285 |
| remis bez zwycięzcy | ✓ samo `ranking` | `memory.ts:91` (`rankResults`, `core.ts:73-74`); `fuzz04.ts` (118 remisów, wszystkie bez zwycięzcy); testy :267, :277 |
| start od pierwszego z `players` | ✓ | 01-01-CHECKS.md; test :109 |
| tylko `rng` | ✓ | 01-01-CHECKS.md §3; test :104 |
| stan JSON, brak mutacji | ✓ | 01-01-CHECKS.md; `fuzz04.ts` |
| ukryte informacje, obserwator `""` | ✓ | test :223 (A, B, `""`); `fuzz04.ts` (473 332 ruchy, odkryte dokładnie dozwolone karty) |
| wspólne funkcje `core.ts` | ✓ `shuffle`, `rankResults` (:2) | – |

Odstępstwa z powodem (D-11): brak.

### Testy (RULE-03)

| Zasada (ZASADY-GIER §7) | Test (`memory.test.ts`) |
|---|---|
| 2-6 graczy (:745) | :63 |
| 18 symboli, każdy na dwóch kartach (:745) | :85 (dwie karty na symbol, symbol < `SYMBOLS`); liczba 18 bez testu (M1) |
| tryby, plansze, pary, domyślny (:746-752) | :73, :85 |
| nieznany albo brak = `srednia` (:746) | :99 |
| `setup` losuje i tasuje, zaczyna `players[0]` (:754) | :104, :109 |
| ruch: zakryta karta; nie zebrana, nie drugi raz `first` (:755) | :137, :142, :125 |
| pierwsza karta zostaje odkryta (:756) | :166 |
| para: u gracza, ten sam gracz dalej (:757) | :174 |
| pudło: tura dalej, `miss` do następnego odkrycia (:758) | :185, :192, :202, :211 |
| koniec po wszystkich parach, wygrywa najwięcej (:760) | :250, :256, :260, :273 |
| remis na pierwszym miejscu bez zwycięzcy (:760) | :267, :277 |
| limit 60 s, losowa zakryta karta (:761) | :63, :285 |
| widok wspólny, symbole tylko zebranych, `first`, `miss` (:762-763) | :223, :241 |

Testy obowiązkowe `ZASADY.md` §2: wszystkie spełnione.

| Punkt §2 | Ocena | Gdzie |
|---|---|---|
| Definicja | ✓ | :63, :69 |
| Setup: stan, kto zaczyna, seedy | ✓ | :85, :109, :104 |
| Walidacja: spoza gry / poza turą / niedozwolony / po końcu / brzegi | ✓ | :117 / :121 / :137, :142 / :149 / :125, :133 |
| Schemat | ✓ | :157 (zły typ, brak pola, niecałkowita, `null`) |
| Koniec: wygrana każdego gracza | ✓ | A :250, B :257, :274 |
| Koniec: remis, ranking, `waitingFor` | ✓ | :267, :277 / :273 / :253 |
| Limit: `timeoutMove` | ✓ | :285 (cała partia, także z odkrytą pierwszą kartą) |
| Stan: brak mutacji, JSON | ✓ | :297 (oba rodzaje odkrycia), :307 |
| Typ: ukryty stan (gracz, obserwator, po odsłonięciu) | ✓ | :223 (A, B, `""` przez wszystkie stany tury), :241 |

#### M1. Liczba 18 symboli bez testu
- Miejsce: `memory.test.ts:95` (`symbol < SYMBOLS`); stała `memory.ts:5`. Test przejdzie przy `SYMBOLS = 20`, a ekran ma 18 emoji (`Memory.tsx:17-35`) i pokazałby pustą kartę.
- Źródło: `ZASADY-GIER.md` §7 :745 („jeden z 18 symboli”). Waga: **niska** (dziś zgodne).
- Propozycja: `expect(SYMBOLS).toBe(18)` w teście :73.

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| G1 | piec-w-rzedzie | niska | – |
| G2 | piec-w-rzedzie | średnia | `definicja-swieza-gra` |
| G3 | piec-w-rzedzie | średnia | `schemat-smieci` |
| S1 | statki | średnia | `definicja-swieza-gra` |
| S2 | statki | średnia | `setup-ten-sam-seed` |
| S3 | statki | średnia | `schemat-smieci` |
| S4 | statki | niska | `widok-obserwatora` |
| C1 | chinczyk | niska | – |
| C2 | chinczyk | średnia | `definicja-swieza-gra` |
| C3 | chinczyk | średnia | `schemat-smieci` |
| C4 | chinczyk | średnia | – |
| L1 | labirynt | średnia | – |
| L2 | labirynt | średnia | – |
| M1 | memory | niska | – |

Wpisy o wysokiej wadze: **brak**. Odstępstwa z powodem (D-11): `timeoutMove` w Labiryncie (najlepszy krok zamiast losowego), z uwagą do fazy 4.

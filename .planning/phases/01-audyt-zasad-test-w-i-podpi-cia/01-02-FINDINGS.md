# 01-02: podpięcie gier (WIRE-01) i ekran końcowy mini-gier z samego stanu (WIRE-02)

Stan repo: gałąź `labirynt`, HEAD `8a15cff`, 2026-10-23. Kryteria 4 i 5 roadmapy. Repo bez zmian (poza `.planning/`).

## 1. Metoda

- Tabelę podpięć wygenerował skrypt `table.ts` (scratchpad sesji, poza repo, `node --experimental-strip-types`): ładuje `GAMES`
  i szuka wpisu każdej gry w plikach z listy `ZASADY.md` §6. Komórki „brak” sprawdzone ręcznie (cztery fałszywe alarmy regexa przy
  `export type { View as … }` poprawione na numery linii).
- Kierunek `record.lower` i obecność `tie` odczytane z definicji (`GAMES[id].record`), porównane z `ZASADY-GIER.md` §1 i `KONCEPT.md` §2.4.
- WIRE-02: dwa skrypty na każdej z 30 mini-gier (partia na `timeoutMove`, gracze `a`, `b`, seed 7):
  - `view.ts`: po końcu `playerView(s, "a")`, `playerView(s, "")` i `playerView(soloState(s, "b"), SOLO)` są głęboko równe stanowi
    (`isDeepStrictEqual`). Wynik: **0 różnic w 30 grach**, więc ekran rekordów (który dostaje surowy stan z `soloState`, `LobbyRoom.ts:396`)
    ma te same pola co ekran w pokoju.
  - `keys.ts`: które pola stanu są mapami per gracz (przycina je `soloState`), a które wspólne (zostają). Wynik w kolumnie „dane” w sekcji 4.
  - `keys2.ts`: klucz `key` z `MiniGame.tsx` dla 2000 seedów, liczba powtórzeń (rewanż z tym samym kluczem nie montuje gry od nowa).
- Ścieżka renderu: każdy komponent przeczytany od warunku `playing` do końca gałęzi `!playing || phase === "sent"`;
  sprawdzone `useState`/`useRef`/`localStorage` w tej gałęzi, filtrowanie po `me` i zależność od propsów spoza stanu.
  Ekran rekordów montuje grę tak: `Records.tsx:210-217` (`me=""`, `players=[{ id: SOLO }]`, `ranking=[SOLO]`, bez `winner` i `onRound`).

## 2. Tabela podpięć (WIRE-01, 38 gier × ZASADY.md §6)

Kolumny w kolejności §6: sekcja w `ZASADY-GIER.md` (linia nagłówka), `<id>.test.ts`, wpis w `GAMES` (`index.ts`), eksport typu `View`
(`index.ts`), komponent (`apps/web/src/games/`), gałąź w `Game.tsx` (mini-gra: przez `MiniGame.tsx`, linia gałęzi tam), `ICONS` (`Lobby.tsx`),
`MINI_GAMES` w `Game.tsx:477` (ręczny `Set`), `MINI_GAMES` w `Lobby.tsx:246` (filtr `minPlayers === 1`), `BLURBS` (`Lobby.tsx`, poza §6, opis na
liście gier), dla mini-gier: `record` (kierunek), `tie` (kierunek), wpis w `RECORDS` (`index.test.ts`), jednostka w `FORMAT` (`Records.tsx`).
„–” = nie dotyczy (gra główna). Opis w `KONCEPT.md` §2 i tabeli etapów ma każda z 38 gier (gry główne: §2.1-2.3d, 2.5; mini-gry: §2.4, 30 pozycji;
etapy 2-5 i wiersz „+”). `CATEGORIES` w `MiniGames.tsx:20-27` obejmuje wszystkie 30 mini-gier (żadna nie wpada do „Inne”).

| gra | ZASADY-GIER | test | GAMES | View | komponent | Game.tsx | ICONS | MINI_GAMES (Game) | MINI_GAMES (Lobby) | BLURBS | record | tie | RECORDS | FORMAT |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `piec-w-rzedzie` | ✓ :568 | ✓ | ✓ :124 | ✓ :84 | ✓ PiecWRzedzie.tsx:20 | ✓ :341 | ✓ :285 | – | – | ✓ :331 | – | – | – | – |
| `labirynt` | ✓ :825 | ✓ | ✓ :125 | ✓ :85 | ✓ Labirynt.tsx:59 | ✓ :350 | ✓ :286 | – | – | ✓ :332 | – | – | – | – |
| `statki` | ✓ :575 | ✓ | ✓ :126 | ✓ :119 | ✓ Statki.tsx:52 | ✓ :352 | ✓ :287 | – | – | ✓ :333 | – | – | – | – |
| `chinczyk` | ✓ :600 | ✓ | ✓ :127 | ✓ :44 | ✓ Chinczyk.tsx:115 | ✓ :362 | ✓ :288 | – | – | ✓ :334 | – | – | – | – |
| `kampus-tour` | ✓ :646 | ✓ | ✓ :128 | ✓ :63 | ✓ KampusTour.tsx:345 | ✓ :83 | ✓ :290 | – | – | ✓ :336 | – | – | – | – |
| `memory` | ✓ :743 | ✓ | ✓ :129 | ✓ :86 | ✓ Memory.tsx:38 | ✓ :372 | ✓ :289 | – | – | ✓ :335 | – | – | – | – |
| `refleks` | ✓ :67 | ✓ | ✓ :130 | ✓ :87 | ✓ Refleks.tsx:135 | ✓ MiniGame :51 | ✓ :293 | ✓ | ✓ | ✓ :339 | mniej lepiej | – | ✓ :150 | ✓ :21 |
| `simon` | ✓ :76 | ✓ | ✓ :131 | ✓ :88 | ✓ Simon.tsx:44 | ✓ MiniGame :384 | ✓ :294 | ✓ | ✓ | ✓ :340 | więcej lepiej | – | ✓ :135 | ✓ :29 (W6) |
| `stoper` | ✓ :80 | ✓ | ✓ :132 | ✓ :90 | ✓ Stoper.tsx:37 | ✓ MiniGame :63 | ✓ :295 | ✓ | ✓ | ✓ :341 | mniej lepiej | – | ✓ :151 | ✓ :35 |
| `schulte` | ✓ :86 | ✓ | ✓ :133 | ✓ :89 | ✓ Schulte.tsx:39 | ✓ MiniGame :284 | ✓ :296 | ✓ | ✓ | ✓ :343 | mniej lepiej | – | ✓ :156 | ✓ :40 |
| `stroop` | ✓ :101 | ✓ | ✓ :134 | ✓ :91 | ✓ Stroop.tsx:17 | ✓ MiniGame :358 | ✓ :298 | ✓ | ✓ | ✓ :344 | więcej lepiej | mniej | ✓ :137 | ✓ :22 |
| `liczenie` | ✓ :101 | ✓ | ✓ :135 | ✓ :92 | ✓ Liczenie.tsx:14 | ✓ MiniGame :371 | ✓ :299 | ✓ | ✓ | ✓ :345 | więcej lepiej | mniej | ✓ :138 | ✓ :23 |
| `kolo` | ✓ :117 | ✓ | ✓ :136 | ✓ :97 | ✓ Kolo.tsx:81 | ✓ MiniGame :74 | ✓ :300 | ✓ | ✓ | ✓ :346 | więcej lepiej | – | ✓ :149 | ✓ :34 |
| `kolor` | ✓ :135 | ✓ | ✓ :137 | ✓ :98 | ✓ Kolor.tsx:78 | ✓ MiniGame :85 | ✓ :301 | ✓ | ✓ | ✓ :347 | mniej lepiej | – | ✓ :158 | ✓ :42 |
| `kropki` | ✓ :148 | ✓ | ✓ :138 | ✓ :102 | ✓ Kropki.tsx:28 | ✓ MiniGame :107 | ✓ :302 | ✓ | ✓ | ✓ :348 | mniej lepiej | – | ✓ :159 | ✓ :43 |
| `rok` | ✓ :173 | ✓ | ✓ :139 | ✓ :103 | ✓ Rok.tsx:54 | ✓ MiniGame :118 | ✓ :303 | ✓ | ✓ | ✓ :349 | mniej lepiej | – | ✓ :161 | ✓ :45 |
| `srodek` | ✓ :189 | ✓ | ✓ :140 | ✓ :106 | ✓ Srodek.tsx:52 | ✓ MiniGame :129 | ✓ :304 | ✓ | ✓ | ✓ :350 | mniej lepiej | – | ✓ :162 | ✓ :46 |
| `stoj` | ✓ :214 | ✓ | ✓ :141 | ✓ :109 | ✓ Stoj.tsx:36 | ✓ MiniGame :151 | ✓ :305 | ✓ | ✓ | ✓ :351 | więcej lepiej | mniej | ✓ :143 | ✓ :28 |
| `sledzenie` | ✓ :231 | ✓ | ✓ :142 | ✓ :104 (W10) | ✓ Sledzenie.tsx:42 | ✓ MiniGame :163 | ✓ :306 | ✓ | ✓ | ✓ :353 | więcej lepiej | więcej | ✓ :144 | ✓ :31 |
| `kubki` | ✓ :253 | ✓ | ✓ :143 | ✓ :115 | ✓ Kubki.tsx:46 | ✓ MiniGame :174 | ✓ :307 | ✓ | ✓ | ✓ :352 | więcej lepiej | – | ✓ :136 | ✓ :30 |
| `wieza` | ✓ :272 | ✓ | ✓ :144 | ✓ :105 | ✓ Wieza.tsx:36 | ✓ MiniGame :273 | ✓ :308 | ✓ | ✓ | ✓ :368 | więcej lepiej | więcej | ✓ :145 | ✓ :33 |
| `rytm` | ✓ :298 | ✓ | ✓ :145 | ✓ :110 | ✓ Rytm.tsx:29 | ✓ MiniGame :262 | ✓ :309 | ✓ | ✓ | ✓ :354 | mniej lepiej | – | ✓ :152 | ✓ :36 |
| `inny` | ✓ :321 | ✓ | ✓ :146 | ✓ :93 | ✓ Inny.tsx:29 | ✓ MiniGame :345 | ✓ :310 | ✓ | ✓ | ✓ :355 | więcej lepiej | mniej | ✓ :139 | ✓ :24 |
| `obrot` | ✓ :342 | ✓ | ✓ :147 | ✓ :95 | ✓ Obrot.tsx:37 | ✓ MiniGame :332 | ✓ :311 | ✓ | ✓ | ✓ :357 | więcej lepiej | mniej | ✓ :141 | ✓ :26 |
| `literowka` | ✓ :361 | ✓ | ✓ :148 | ✓ :96 | ✓ Literowka.tsx:16 | ✓ MiniGame :319 | ✓ :312 | ✓ | ✓ | ✓ :356 | więcej lepiej | mniej | ✓ :142 | ✓ :27 |
| `mapa` | ✓ :375 | ✓ | ✓ :149 | ✓ :107 | ✓ Mapa.tsx:47 | ✓ MiniGame :140 | ✓ :313 | ✓ | ✓ | ✓ :358 | mniej lepiej | – | ✓ :163 | ✓ :50 |
| `kat` | ✓ :160 | ✓ | ✓ :150 | ✓ :99 | ✓ Kat.tsx:46 | ✓ MiniGame :96 | ✓ :314 | ✓ | ✓ | ✓ :359 | mniej lepiej | – | ✓ :160 | ✓ :44 |
| `przytrzymaj` | ✓ :395 | ✓ | ✓ :151 | ✓ :111 | ✓ Przytrzymaj.tsx:42 | ✓ MiniGame :251 | ✓ :315 | ✓ | ✓ | ✓ :360 | mniej lepiej | – | ✓ :153 | ✓ :37 |
| `balon` | ✓ :410 | ✓ | ✓ :152 | ✓ :100 | ✓ Balon.tsx:34 | ✓ MiniGame :196 | ✓ :316 | ✓ | ✓ | ✓ :367 | więcej lepiej | mniej | ✓ :147 | ✓ :39 |
| `w-pamieci` | ✓ :428 | ✓ | ✓ :153 | ✓ :101 | ✓ WPamieci.tsx:41 | ✓ MiniGame :185 | ✓ :317 | ✓ | ✓ | ✓ :366 | więcej lepiej | mniej | ✓ :146 | ✓ :32 |
| `dziesiatki` | ✓ :444 | ✓ | ✓ :154 | ✓ :94 | ✓ Dziesiatki.tsx:35 | ✓ MiniGame :306 | ✓ :318 | ✓ | ✓ | ✓ :365 | więcej lepiej | mniej | ✓ :140 | ✓ :25 |
| `tort` | ✓ :459 | ✓ | ✓ :155 | ✓ :114 | ✓ Tort.tsx:50 | ✓ MiniGame :207 | ✓ :319 | ✓ | ✓ | ✓ :362 | mniej lepiej | – | ✓ :164 | ✓ :47 |
| `zakupy` | ✓ :479 | ✓ | ✓ :156 | ✓ :112 | ✓ Zakupy.tsx:37 | ✓ MiniGame :229 | ✓ :320 | ✓ | ✓ | ✓ :364 | więcej lepiej | mniej | ✓ :148 | ✓ :48 |
| `zaslona` | ✓ :499 | ✓ | ✓ :157 | ✓ :113 | ✓ Zaslona.tsx:44 | ✓ MiniGame :218 | ✓ :321 | ✓ | ✓ | ✓ :363 | mniej lepiej | – | ✓ :154 | ✓ :38 |
| `nozyczki` | ✓ :524 | ✓ | ✓ :158 | ✓ :117 | ✓ Nozyczki.tsx:40 | ✓ MiniGame :240 | ✓ :322 | ✓ | ✓ | ✓ :361 | mniej lepiej | – | ✓ :165 | ✓ :49 |
| `sudoku` | ✓ :547 | ✓ | ✓ :159 | ✓ :116 | ✓ Sudoku.tsx:47 | ✓ MiniGame :295 | ✓ :297 | ✓ | ✓ | ✓ :342 | mniej lepiej | – | ✓ :157 | ✓ :41 |
| `panstwa-miasta` | ✓ :629 | ✓ | ✓ :160 | ✓ :70 | ✓ PanstwaMiasta.tsx:21 | ✓ :376 | ✓ :291 | **jest, choć to gra główna** (W1) | – | ✓ :337 | – | – | – | – |
| `kalambury` | ✓ :791 | ✓ | ✓ :161 | ✓ :82 | ✓ Kalambury.tsx:38 | ✓ :389 | ✓ :292 | – (W2) | – | ✓ :338 | – | – | – | – |

**Rekordy (kolumny record i tie).** Kierunek `lower` zgadza się z dokumentami we wszystkich 30 mini-grach („mniej lepiej” ↔ `true`).
`tie` mają dokładnie te gry, którym `ZASADY-GIER.md` daje drugie kryterium: Kolor liter, Liczenie, Inny element, Dziesiątki (niższa średnia, przez
`quiz.ts`), Obrót i Literówka (niższa średnia), Stój! (niższa średnia reakcji), Śledzenie (więcej `hits`), Wieża (szerszy klocek),
Balon (mniej pękniętych), W pamięci (mniejsza odchyłka), Zakupy (krótszy czas). Gry „bez drugiego kryterium” w dokumentach (Trzy kubki,
Sudoku i wszystkie z „równe to remis”) nie mają `tie`, co dodatkowo pilnuje `index.test.ts:180` (`tie` musi być `undefined`, gdy przypadek nie ma `tied`).
Jednostki `FORMAT` zgodne z opisem wyniku w dokumentach (dziesiąte części procenta w Kole, Środku, Torcie i Nożyczkach, ΔE×10 w Odcieniu
pokazywane jako % zgodności, ms, s, km, °, rundy, piętra, pary); jedyny drobiazg to Sekwencja (W6). **Brak wpisów o wysokiej wadze w WIRE-01.**

## 3. Wpisy

Format: gra · `plik:linia` · źródło reguły · waga · propozycja.

### W1. `MINI_GAMES` w `Game.tsx` to ręczny zbiór, który nie zgadza się z `GAMES` (zawiera Państwa-miasta)
- Gra: `panstwa-miasta` (i każda przyszła mini-gra).
- Miejsce: `apps/web/src/screens/Game.tsx:477`; użycia `:201`, `:204`, `:254-255`, `:402`. Lista mini-gier w `GAMES`: `packages/games/src/index.ts:165` (`MINI_GAME_IDS`).
- Źródło: `ZASADY.md` §6 pkt 5 („wpis w `MINI_GAMES`”), `KONCEPT.md` §3 (mini-gra = `minPlayers: 1`).
- Waga: **średnia** (podpięcie).
- Opis: zbiór ma 31 id: 30 mini-gier (zgodne z `MINI_GAME_IDS`) i `panstwa-miasta` (`minPlayers: 2`). W praktyce zbiór znaczy
  „gra bez kolejki i z własną tabelą wyników”, nie „mini-gra”: dla Państw-miast ukrywa listę rankingu po partii (`:402`), bo
  `PanstwaMiasta.tsx:94` pokazuje własną; `:201`, `:204`, `:254-255` dla Państw-miast w trakcie i tak nie działają, bo nagłówek
  zastępuje `ownHeader` (`:179`). Nowa mini-gra bez ręcznego dopisania tutaj dostanie „Twój ruch” i ranking podwójny.
- Propozycja (popraw kod): mini-gry brać z `MINI_GAME_IDS` (albo `def.minPlayers === 1`), a „własny ranking” wyrazić osobno
  (np. zbiór `OWN_RANKING = ["panstwa-miasta", "kalambury"]`); potem w `ZASADY.md` §6 pkt 5 usunąć ręczny krok. Patrz też W2.

### W2. Kalambury po partii pokazują ranking dwa razy (przy 3+ graczach)
- Gra: `kalambury`.
- Miejsce: `apps/web/src/screens/Game.tsx:402` (lista rankingu, bo `kalambury` nie ma w `MINI_GAMES`) i `apps/web/src/games/Kalambury.tsx:104`, `:127-135` (faza `over`: „Suma punktów” przez `Scores`).
- Źródło: `ZASADY.md` §6 pkt 5 (podpięcie gałęzi w `Game.tsx`); ten sam mechanizm co W1.
- Waga: **średnia** (podpięcie, widoczne dla gracza, bez wpływu na wynik).
- Propozycja (popraw kod): razem z W1 (zbiór „własny ranking” obejmuje `kalambury`).

### W3. Stoper i Rytm: część ekranu końcowego pochodzi ze stanu lokalnego, którego nie ma w stanie gry (zbiorczy, D-12)
- Gry i miejsca:
  - `stoper`: kafel „Twój czas” z odchyłką ze znakiem, rysowany z `stopped` (`useState`, `apps/web/src/games/Stoper.tsx:42`, render `:70-83`).
    Stan (`packages/games/src/stoper.ts:10`) trzyma tylko `results` (odchyłka bez znaku), bez czasu dotknięcia.
  - `rytm`: kafel „Twoje tempo” (BPM) z `run.current.taps` (`useRef`, `apps/web/src/games/Rytm.tsx:37`, render `:103-117`).
    Stan (`packages/games/src/rytm.ts:16`) trzyma tylko `results`; czasy stuknięć serwer zużywa do wyniku i odrzuca.
- Źródło: `ZASADY.md` §3 („Ekran końcowy mini-gry rysuje się z samego stanu… wyniki nie zależą od stanu lokalnego komponentu”);
  `ZASADY-GIER.md:83` (Stoper: „po dotknięciu: odkryty czas i odchyłka ze znakiem”), `ZASADY-GIER.md:319` (Rytm: „Ekran końcowy: kafel z własnym tempem w BPM obok celu”).
- Waga: **średnia**. Wynik i ranking są poprawne, rekordowa partia się wyświetla, ale bez kafla, który dokumenty opisują jako część ekranu
  końcowego: na ekranie „Rekordy” lider Stopera i Rytmu to sama liczba w tabeli. Ten sam kafel znika po odświeżeniu strony w pokoju.
  Oba kafle są starsze niż rekordowa partia (`4649af6`, `9239058` przed `30ab8f6`), więc nie zostały dostosowane.
- Propozycja (popraw kod): zapisać w stanie mapę per gracz (`stops: Record<PlayerId, number>` w Stoperze, `taps: Record<PlayerId, number[]>`
  w Rytmie, wzorem `taps` w Środku i Za zasłoną) i rysować kafel z `view`, przy `me=""` dla jedynego gracza z `ranking`.
  Alternatywa: zostawić kafel tylko dla grającego i dopisać w `ZASADY-GIER.md` odstępstwo z powodem.

### W4. Drugi `MINI_GAMES` w `Lobby.tsx` powiela `MINI_GAME_IDS`
- Miejsce: `apps/web/src/screens/Lobby.tsx:246` (filtr `minPlayers === 1` na `GAMES`) obok `packages/games/src/index.ts:165`.
- Źródło: `ZASADY.md` §3 („Wspólne funkcje z `core.ts` zamiast własnych”), `ZASADY.md` §6 pkt 5.
- Waga: **niska**. Lista jest dziś identyczna z `GAMES` (30 gier), różnica tylko w typie (definicje zamiast id).
- Propozycja (popraw kod): `MINI_GAME_IDS.map((id) => GAMES[id])`, jedna definicja.

### W5. `ZASADY.md` §6 pkt 5 mówi o „wpisie w `MINI_GAMES`”, a są dwa zbiory o tej nazwie
- Miejsce: `ZASADY.md` §6 pkt 5; `Game.tsx:477` (ręczny) i `Lobby.tsx:246` (wyliczany).
- Waga: **niska** (dokument). Propozycja (popraw dokument, po W1 zbędne): wskazać `Game.tsx` albo usunąć krok po wyliczaniu zbioru.

### W6. `FORMAT` Sekwencji pokazuje wynik jako punkty, a wynik to długość serii
- Miejsce: `apps/web/src/screens/Records.tsx:29` (`simon: { value: points }` → „7 pkt”).
- Źródło: `ZASADY-GIER.md:78` („`score` = najdłuższa powtórzona seria”), `KONCEPT.md` §2.4. Ekran gry pokazuje gołą liczbę (`Simon.tsx:85`).
- Waga: **niska**. Propozycja (popraw kod): jednostka serii („7 kolorów” albo sama liczba), jak `rundy` w Kubkach.

### W7. `KONCEPT.md` §2.4 „Rekordy”: lista drugich kryteriów pomija W pamięci
- Miejsce: `KONCEPT.md:152-154` (wymienia średnią reakcji, cele w Śledzeniu, klocek w Wieży, balony, czas w Zakupach).
- Źródło: `ZASADY-GIER.md:438` (W pamięci: przy równych mniejsza odchyłka), kod `w-pamieci.ts` (`tie.lower = true`).
- Waga: **niska** (opis w KONCEPT, D-06). Propozycja (popraw dokument): dopisać „odchyłka w rundzie z pomyłką w W pamięci”.

### W8. Sudoku: klucz rewanżu to sama plansza, bez `nonce`
- Miejsce: `apps/web/src/games/MiniGame.tsx:297` (`key={puzzle.join()}`); stan `sudoku.ts` nie ma `nonce`.
- Źródło: `ZASADY.md` §3 („pole odróżniające partie (wyzwanie albo `nonce`), po którym ekran montuje się od nowa przy rewanżu”).
- Dowód: `keys2.ts`, 2000 seedów: Sudoku 6 powtórzonych kluczy (ok. 1 szansa na 300 tys., że rewanż wylosuje tę samą planszę i ekran zostanie
  w fazie „sent”); pozostałe 29 mini-gier: 0 powtórzeń.
- Waga: **niska**. Propozycja (popraw kod): `nonce` w stanie jak w Stoperze i Rytmie, albo zostawić z komentarzem.

### W9. Test `soloState` nie widzi map wypełnianych tylko w prawdziwej partii
- Miejsce: `packages/games/src/index.test.ts:190-210` gra samymi `timeoutMove`, więc `progress` (Schulte, Kropki, Kąt, Który rok?, Wieża, Balon, Sudoku)
  i `attempts`/`best` po częściowej grze w Kole są w teście puste albo jednolite.
- Źródło: `ZASADY.md` §3 (dane gracza w mapach z id w kluczach), D-04.
- Waga: **niska** (luka testu; kod przycina takie mapy poprawnie, `core.ts:148-151` wykrywa mapę po kluczu gracza).
- Propozycja: w teście dorzucić jeden ruch `progress` przed timeoutami tam, gdzie gra go ma.

### W10. Stałe Śledzenia eksportowane bez przedrostka gry
- Miejsce: `packages/games/src/index.ts:104` (`BALLS`, `MOVE_MS`, `RADIUS`, `ROUNDS`, `SHOW_MS`, `SPEED_START`, `SPEED_STEP`, `TARGETS`, typ `State`).
- Źródło: `ZASADY.md` §6 pkt 3 (eksport `View` i stałych w `index.ts`; reszta gier używa przedrostka, np. `KUBKI_ROUNDS`).
- Waga: **niska**. Ogólne `ROUNDS` i `SHOW_MS` łatwo pomylić z inną grą przy imporcie. Propozycja (popraw kod): `SLEDZENIE_*`.

### Obserwacja bez wagi
- Ekran końcowy Odcienia, Policz kropki, Kąta, Który rok?, Środka, Mapy, Tortu, Nożyczek, Przytrzymaj i Za zasłoną pokazuje szczegóły
  rund tylko, gdy `ranking !== undefined` (`over`, np. `Szacowanie.tsx:89`, `Kolor.tsx:106`). Ekran rekordów podaje `ranking={[SOLO]}`
  (`Records.tsx:215`), więc działa; to jednak nieopisany kontrakt: ekran rekordów bez `ranking` pokazałby same tabele.
  Warto dopisać jedno zdanie w `ZASADY.md` §3 przy „Ekran końcowy… z `me=""`”.

## 4. Ekran końcowy z samego stanu (WIRE-02, 30 mini-gier)

Wspólne dla wszystkich 30 (sprawdzone w kodzie każdego komponentu):
- `playing = view.players.includes(me) && …` (Kolo: `… && attempts < KOLO_ATTEMPTS`), więc przy `me=""` gra nigdy nie wchodzi w ekran
  instrukcji ani w rozgrywkę (ekran rekordów nie ma `IntroContext`) i od razu rysuje gałąź końcową.
- Żaden komponent nie czyta `localStorage`/`sessionStorage`. `me` służy w gałęzi końcowej tylko do dopisku „(ty)”, pogrubienia linii
  i „Wygrywasz” zamiast nicku; nic nie jest filtrowane do samego `me` po końcu partii.
- `playerView` po końcu = stan (skrypt `view.ts`), więc nic nie jest ukryte przed obserwatorem ani przed ekranem rekordów.
- „Przewaga zwycięzcy” (Schulte, Sudoku) i wyróżnienie najlepszego w rundzie (Przytrzymaj, Środek, Mapa, Tort, Nożyczki, Za zasłoną)
  pojawiają się tylko przy 2+ graczach; w rekordowej partii (1 gracz) ich brak jest zgodny z opisem w `ZASADY-GIER.md`.

| gra | dane gracza w stanie (mapy przycinane przez `soloState`) | gałąź końcowa | werdykt |
|---|---|---|---|
| `refleks` | `results`, `times` | `Refleks.tsx:183` → `Results` `:23-133` (tabela, wykres czasów) | z samego stanu |
| `simon` | `results` | `Simon.tsx:88` (`Scores`) | z samego stanu (sama liczba, zgodnie z dokumentem) |
| `stoper` | `results` | `Stoper.tsx:70-83` | **zależność**: kafel „Twój czas” z `stopped` (`useState`, `:42`), tabela ze stanu → W3 |
| `schulte` | `results` (z `splits`) | `Schulte.tsx:87-107` (tabela, wykres międzyczasów) | z samego stanu |
| `stroop` | `results` | `Quiz.tsx:217` → `Results` `Quiz.tsx:47-138` | z samego stanu |
| `liczenie` | `results` | jak `stroop` | z samego stanu |
| `kolo` | `attempts`, `best`, `worst` | `Kolo.tsx:229-276` (karty z miniaturami; okrąg liczony z punktów) | z samego stanu |
| `kolor` | `results`, `guesses` | `Kolor.tsx:112-129` (pary kolorów przy `over`) | z samego stanu |
| `kropki` | `results`, `answers` | `Szacowanie.tsx:95-117` | z samego stanu |
| `rok` | `results`, `answers` | `Rok.tsx:107-140` (lista wydarzeń z odpowiedziami) | z samego stanu |
| `srodek` | `results`, `taps` | `Srodek.tsx:105-126` (`RoundTable`) | z samego stanu |
| `stoj` | `results` | `Stoj.tsx:96-108` → `Results` z `Quiz.tsx` (`points = stojScore`) | z samego stanu |
| `sledzenie` | `results` | `Sledzenie.tsx:110-124` (`Scores`) | z samego stanu (wynik i `hits`, zgodnie z dokumentem) |
| `kubki` | `results` | `Kubki.tsx:121-133` (`Scores`) | z samego stanu |
| `wieza` | `results` | `Wieza.tsx:95-108` (`Scores`) | z samego stanu |
| `rytm` | `results` | `Rytm.tsx:103-121` | **zależność**: kafel „Twoje tempo” z `run.current.taps` (`useRef`, `:37`), tabela ze stanu → W3 |
| `inny` | `results` | jak `stroop` | z samego stanu |
| `obrot` | `results` | jak `stroop` (`points = obrotScore`) | z samego stanu |
| `literowka` | `results` | jak `stroop` (`points = literowkaScore`) | z samego stanu |
| `mapa` | `results`, `taps` | `Mapa.tsx:95-123` (`RoundTable` z listą miast) | z samego stanu |
| `kat` | `results`, `answers` | jak `kropki` | z samego stanu |
| `przytrzymaj` | `results`, `holds` | `Przytrzymaj.tsx:112-177` (jedna tabela z celami) | z samego stanu |
| `balon` | `results`, `pumps` | `Balon.tsx:72-120` (wytrzymałość i stuknięcia) | z samego stanu |
| `w-pamieci` | `results` | `WPamieci.tsx:87-100` (`Scores` z odchyłką) | z samego stanu |
| `dziesiatki` | `results` | `Dziesiatki.tsx:95-108` → `Results` z `Quiz.tsx` | z samego stanu |
| `tort` | `results`, `cuts` | `Tort.tsx:111-121` (`RoundTable`) | z samego stanu |
| `zakupy` | `results`, `picked` | `Zakupy.tsx:74-116` (półka z kropkami graczy z `view.players`) | z samego stanu |
| `zaslona` | `results`, `taps` | `Zaslona.tsx:104-130` (`RoundTable`) | z samego stanu |
| `nozyczki` | `results`, `cuts` | `Nozyczki.tsx:94-104` (`RoundTable`) | z samego stanu |
| `sudoku` | `results` | `Sudoku.tsx:99-115` (`Scores`) | z samego stanu |

Wynik: 28 z 30 mini-gier rysuje ekran końcowy wyłącznie ze stanu; Stoper i Rytm mają jeden kafel ze stanu lokalnego (W3, średnia).
Żadna zależność nie psuje rekordowej partii tak, żeby pokazywała zły wynik albo pusty ekran, więc **WIRE-02 nie ma wpisów o wysokiej wadze**.

# Faza 1: audyt zasad, testów i podpięcia (FINDINGS)

Stan repo: gałąź `labirynt`, HEAD `d625d21` (01-01..01-03 na `8a15cff`, bez zmian w `packages/games` i `apps/web` między nimi), 2026-10-23.
Zakres: 38 gier z `GAMES` i Turniej (`turniej`), wymagania RULE-01, RULE-02, RULE-03, WIRE-01, WIRE-02. Repo bez zmian poza `.planning/`.

Ten plik scala ustalenia częściowe: `01-01-CHECKS.md` (dowód hurtowy §3, mapa pokrycia `index.test.ts`), `01-02-FINDINGS.md` (podpięcie, ekran końcowy)
i `01-03..01-09-FINDINGS.md` (gry). Pliki częściowe zostają jako źródło: mają pełne tabele „stała kod ↔ dokument” i „zasada → test” każdej gry,
opis skryptów (`checks.ts`, `fuzz*.ts`, `cases*.ts`, wszystkie w scratchpadzie sesji, poza repo) i dowody. Tu każdy wpis ma format z roadmapy:
gra, `plik:linia`, źródło reguły, waga, propozycja. Identyfikatory wpisów (K1, SQ1, W7a…) są te same co w plikach częściowych; wpisy zbiorcze mają nowe Z1-Z21.

Wagi wg D-09: **wysoka** (nieuczciwy wynik albo rekord, błąd zasady, złamana reguła twarda), **średnia** (luka w testach obowiązkowych, brak podpięcia,
stała niezgodna bez wpływu na uczciwość), **niska** (nazwy testów, opis w `KONCEPT.md`, kosmetyka). Ta sama rozbieżność w kilku grach ma jedną wagę (D-12).

## 1. Podsumowanie

| Waga | Wpisy zbiorcze | Wpisy pojedyncze | Razem wpisów | Wystąpień w grach |
|---|---|---|---|---|
| wysoka | 2 (Z1, Z2) | 0 | 2 | 5 (schulte, sudoku, kropki, simon, zakupy) |
| średnia | 11 (Z3-Z11, Z16, Z17) | 13 | 24 | 111 |
| niska | 8 (Z12-Z15, Z18-Z21) | 21 | 29 | 61 |
| **razem** | **21** | **34** | **55** | **177** |

Wystąpienia: każda gra w wpisie zbiorczym liczy się osobno (np. Z9 to 14 wystąpień); Z2 liczony przy wysokiej (SQ1, ZK1), jego trzecie wystąpienie (SR1, do pomiaru) przy średniej;
Z17 przy średniej (W1, W2), jego części W4 i W5 przy niskiej.

Co mówi audyt w skrócie:
- **Reguły twarde** (`rng`, stan JSON, brak mutacji, start, `waitingFor` po końcu, `timeoutMove` przechodzi `validateMove`): bez złamań w żadnej z 38 gier i w Turnieju
  (`checks.ts` 46 przypadków gra × tryb, `fuzz04..09.ts` ok. 20 tys. partii z prawdziwymi ruchami, grep `Math.random`/`Date.now` pusty).
- **Stałe kod ↔ `ZASADY-GIER.md`**: zgodne we wszystkich grach poza jedną rozbieżnością (LC1 w Z3: „po równo” w Liczeniu). Dwa miejsca, gdzie dokument i kod razem łamią §3: Z1, Z2.
- **Nieuczciwe wyniki** (wysoka): limit czasu lepszy od uczciwego wyniku (Z1) i limit tury krótszy od najdłuższej uczciwej partii (Z2).
- **Testy**: najstarsze pliki (Refleks, Sekwencja, Stoper, Kolor liter, Liczenie, Tabela Schultego, Narysuj koło, Odcień, Policz kropki; 2026-10-07/08) mają prawie wszystkie luki
  testów obowiązkowych §2 (Z4-Z10). Komplet testów obowiązkowych mają: Memory (poza M1), Labirynt (poza L1, L2), Kalambury (poza KL2, KL3), Rytm, Przytrzymaj, Za zasłoną, Balon, Kąt, Mapa, Trzy kubki, Wieża, Sudoku i Zakupy (poza Z1/Z2).
- **Podpięcie**: komplet §6 we wszystkich 38 grach; jedyna luka strukturalna to ręczny zbiór `MINI_GAMES` w `Game.tsx` (Z17).
- **Ekran końcowy z samego stanu**: 28 z 30 mini-gier; Stoper i Rytm mają jeden kafel ze stanu lokalnego (Z16).

## 2. Wpisy o wysokiej wadze

### Z1. Limit czasu nie jest najgorszym wynikiem `[zbiorcze: timeout-nie-najgorszy]`
- Źródło: `ZASADY.md` §3 :89-90 („w mini-grze jest to najgorszy możliwy wynik”). Dokumenty gier opisują limit tak, jak robi to kod, więc rozbieżność jest między §3 a parą kod + `ZASADY-GIER.md`.
- Waga: **wysoka** we wszystkich trzech grach (ujednolicone wg D-09; 01-08 dawało Policz kropki średnią, bo tam trzeba odpowiadać gorzej niż samymi zerami, ale skutek jest ten sam:
  gracz po limicie wyprzedza gracza z oddanym wynikiem, także w turnieju).

| Gra | Miejsce | Limit | Najgorszy uczciwy | Dowód |
|---|---|---|---|---|
| `schulte` | `packages/games/src/schulte.ts:75` (limit), `:55-58` (walidacja), `:25` (wynik); `ZASADY-GIER.md` :89; test `schulte.test.ts:73` | 180 000 ms, 0 pomyłek | bez górnej granicy (np. 170 s + 4 pomyłki = 182 s) | `fuzz07.ts`: 10/400 partii z limitem wyżej (01-07 W7a) |
| `sudoku` | `packages/games/src/sudoku.ts:112`, `:99`, `:29`; `ZASADY-GIER.md` :557; test `sudoku.test.ts:216` | 120 000 ms, 0 pomyłek | bez górnej granicy (60 s + 13 złych cyfr = 125 s) | `fuzz07.ts`: 16/400 (01-07 W7a) |
| `kropki` | `packages/games/src/kropki.ts:78` (pusta lista = same zera), `:71`; `ZASADY-GIER.md` :152; test `kropki.test.ts:67` | 240 | 750 (99 w każdej rundzie) | `fuzz08.ts`: 76/400, na 500 seedach zawsze o 510 lepszy (01-08 W8a) |

- Historia: Schulte od `0178866` (2026-10-08), Sudoku od `a6fb8a2` (2026-10-12), Policz kropki od `98a3e34` (2026-10-08); Kąt (`186bb49`) i Który rok? wzięły już najgorszy możliwy błąd,
  a sekcja Kąta w `ZASADY-GIER.md` :166-167 wprost odrzuca wzór „same zera”.
- Propozycja (popraw test, dokument, kod; decyzja w fazie 4):
  - Policz kropki: limit = `max(n, 99 − n)` w każdej rundzie, jak `kat.ts:34`, `rok.ts:33`; test „żadna odpowiedź nie jest gorsza od limitu” jak `kat.test.ts:88`; `ZASADY-GIER.md` :152.
  - Schulte i Sudoku: limit zawsze za każdym oddanym wynikiem (komparator „wynik z limitu na końcu”: w Schultem rozpoznawalny po `splits: []`, w Sudoku potrzebne pole)
    albo górna granica `ms + kara` w walidacji równa wynikowi limitu (wtedy gorszy uczciwy wynik przepada, co też trzeba opisać). Testy „limit przegrywa z wynikiem z karą ponad limit”.

### Z2. Limit tury krótszy od najdłuższej uczciwej partii `[zbiorcze: limit-tury-bez-zapasu]`
- Źródło: `ZASADY.md` §3 :106 („w mini-grze tyle, ile trwa najdłuższa uczciwa partia plus zapas”). Po limicie serwer wpisuje `timeoutMove` (najgorszy wynik), a późniejszy wynik klienta odpada jako drugi.

| Gra | Miejsce | Wyliczenie | Waga | Propozycja |
|---|---|---|---|---|
| `simon` (SQ1) | `packages/games/src/simon.ts:25` (`turnSeconds: 300`), `:45`; ekran `apps/web/src/games/Simon.tsx:61-79` (wynik dopiero po pomyłce, bez `progress`) | runda n: 0,6 s + n × 0,6 s + n wpisów + 0,4 s; przy 350 ms na kolor seria 24 to 309 s; seria 100 to ponad 80 min | **wysoka**: najlepsze partie (te, które biją rekordy) dostają 0 | ruch `progress` z bieżącą serią i `timeoutMove` oddający ostatnią serię (odstępstwo od „najgorszy wynik”, wpis z powodem w `ZASADY-GIER.md`), albo ekran sam oddaje `length − 1` przed limitem; samo podniesienie `turnSeconds` nie wystarczy |
| `zakupy` (ZK1) | `packages/games/src/zakupy.ts:37` (`TURN_SECONDS = 60`), `:8-9` (`SHOW_MS + MAX_MS` = 60 s); test `zakupy.test.ts:42-45` utrwala równość; ekran `apps/web/src/games/Zakupy.tsx:68-72` nie oddaje sam po 50 s; `ZASADY-GIER.md` :492 | 10 s pokazu + do 50 s zaznaczania = 60 s, zero zapasu na sieć i rysowanie | **wysoka**: wolny uczciwy gracz dostaje 0 pkt | `turnSeconds` z zapasem (np. 75 s) albo `MAX_MS` krótszy od limitu, ekran oddaje sam po `MAX_MS`; najpierw test :42 i `ZASADY-GIER.md` :492 (`AGENTS.md`) |
| `srodek` (SR1) | `packages/games/src/srodek.ts:83` (`turnSeconds: 60`); `apps/web/src/games/Srodek.tsx:14` (1 s odsłony po każdej z 10 rund) | 10 s to same odsłony, na celowanie z przytrzymaniem i przesuwaniem zostaje ok. 5 s na rundę; nie zmierzono | **średnia** do pomiaru (wysoka, jeśli pomiar potwierdzi przekroczenie) | pomiar w fazie 3 (kryterium 4); przy potrzebie 90 s w `ZASADY-GIER.md` :27, `KONCEPT.md` §3 :233-234, test `srodek.test.ts:39` |

- Historia: Sekwencja 300 s od pierwszej wersji; Zakupy od `f7e6b1d` (2026-10-13); Środek 60 s od `9636306` (2026-10-10), przesuwanie punktu doszło tego samego dnia (`09a2822`).

## 3. Tabela podpięć (WIRE-01, kryterium 4)

Kolumny w kolejności `ZASADY.md` §6: sekcja w `ZASADY-GIER.md` (linia nagłówka), `<id>.test.ts`, wpis w `GAMES` (`packages/games/src/index.ts`), eksport `View` (`index.ts`),
komponent (`apps/web/src/games/`), gałąź w `apps/web/src/screens/Game.tsx` (mini-gra: przez `MiniGame.tsx`, linia tam), `ICONS` (`Lobby.tsx`), `MINI_GAMES` w `Game.tsx:477`
(ręczny `Set`), `MINI_GAMES` w `Lobby.tsx:246` (filtr `minPlayers === 1`), `BLURBS` (`Lobby.tsx`, poza §6), dla mini-gier `record` (kierunek), `tie` (kierunek), `RECORDS`
(`index.test.ts`), `FORMAT` (`Records.tsx`), oraz ekran końcowy z samego stanu (WIRE-02, kryterium 5; gałąź końcowa komponentu). „–” = nie dotyczy (gra główna).
Metoda i weryfikacja ręczna: `01-02-FINDINGS.md` §1.

| gra | ZASADY-GIER | test | GAMES | View | komponent | Game.tsx | ICONS | MINI_GAMES (Game) | MINI_GAMES (Lobby) | BLURBS | record | tie | RECORDS | FORMAT | ekran końcowy ze stanu |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `piec-w-rzedzie` | ✓ :568 | ✓ | ✓ :124 | ✓ :84 | ✓ PiecWRzedzie.tsx:20 | ✓ :341 | ✓ :285 | – | – | ✓ :331 | – | – | – | – | – |
| `labirynt` | ✓ :825 | ✓ | ✓ :125 | ✓ :85 | ✓ Labirynt.tsx:59 | ✓ :350 | ✓ :286 | – | – | ✓ :332 | – | – | – | – | – |
| `statki` | ✓ :575 | ✓ | ✓ :126 | ✓ :119 | ✓ Statki.tsx:52 | ✓ :352 | ✓ :287 | – | – | ✓ :333 | – | – | – | – | – |
| `chinczyk` | ✓ :600 | ✓ | ✓ :127 | ✓ :44 | ✓ Chinczyk.tsx:115 | ✓ :362 | ✓ :288 | – | – | ✓ :334 | – | – | – | – | – |
| `kampus-tour` | ✓ :646 | ✓ | ✓ :128 | ✓ :63 | ✓ KampusTour.tsx:345 | ✓ :83 | ✓ :290 | – | – | ✓ :336 | – | – | – | – | – |
| `memory` | ✓ :743 | ✓ | ✓ :129 | ✓ :86 | ✓ Memory.tsx:38 | ✓ :372 | ✓ :289 | – | – | ✓ :335 | – | – | – | – | – |
| `refleks` | ✓ :67 | ✓ | ✓ :130 | ✓ :87 | ✓ Refleks.tsx:135 | ✓ MiniGame :51 | ✓ :293 | ✓ | ✓ | ✓ :339 | mniej lepiej | – | ✓ :150 | ✓ :21 | ✓ Refleks.tsx:183 |
| `simon` | ✓ :76 | ✓ | ✓ :131 | ✓ :88 | ✓ Simon.tsx:44 | ✓ MiniGame :384 | ✓ :294 | ✓ | ✓ | ✓ :340 | więcej lepiej | – | ✓ :135 | ✓ :29 (W6) | ✓ Simon.tsx:88 |
| `stoper` | ✓ :80 | ✓ | ✓ :132 | ✓ :90 | ✓ Stoper.tsx:37 | ✓ MiniGame :63 | ✓ :295 | ✓ | ✓ | ✓ :341 | mniej lepiej | – | ✓ :151 | ✓ :35 | **częściowo** (Z16) |
| `schulte` | ✓ :86 | ✓ | ✓ :133 | ✓ :89 | ✓ Schulte.tsx:39 | ✓ MiniGame :284 | ✓ :296 | ✓ | ✓ | ✓ :343 | mniej lepiej | – | ✓ :156 | ✓ :40 | ✓ Schulte.tsx:87-107 |
| `stroop` | ✓ :101 | ✓ | ✓ :134 | ✓ :91 | ✓ Stroop.tsx:17 | ✓ MiniGame :358 | ✓ :298 | ✓ | ✓ | ✓ :344 | więcej lepiej | mniej | ✓ :137 | ✓ :22 | ✓ Quiz.tsx:217 |
| `liczenie` | ✓ :101 | ✓ | ✓ :135 | ✓ :92 | ✓ Liczenie.tsx:14 | ✓ MiniGame :371 | ✓ :299 | ✓ | ✓ | ✓ :345 | więcej lepiej | mniej | ✓ :138 | ✓ :23 | ✓ Quiz.tsx:217 |
| `kolo` | ✓ :117 | ✓ | ✓ :136 | ✓ :97 | ✓ Kolo.tsx:81 | ✓ MiniGame :74 | ✓ :300 | ✓ | ✓ | ✓ :346 | więcej lepiej | – | ✓ :149 | ✓ :34 | ✓ Kolo.tsx:229-276 |
| `kolor` | ✓ :135 | ✓ | ✓ :137 | ✓ :98 | ✓ Kolor.tsx:78 | ✓ MiniGame :85 | ✓ :301 | ✓ | ✓ | ✓ :347 | mniej lepiej | – | ✓ :158 | ✓ :42 | ✓ Kolor.tsx:112-129 |
| `kropki` | ✓ :148 | ✓ | ✓ :138 | ✓ :102 | ✓ Kropki.tsx:28 | ✓ MiniGame :107 | ✓ :302 | ✓ | ✓ | ✓ :348 | mniej lepiej | – | ✓ :159 | ✓ :43 | ✓ Szacowanie.tsx:95-117 |
| `kat` | ✓ :160 | ✓ | ✓ :150 | ✓ :99 | ✓ Kat.tsx:46 | ✓ MiniGame :96 | ✓ :314 | ✓ | ✓ | ✓ :359 | mniej lepiej | – | ✓ :160 | ✓ :44 | ✓ Szacowanie.tsx:95-117 |
| `sudoku` | ✓ :547 | ✓ | ✓ :159 | ✓ :116 | ✓ Sudoku.tsx:47 | ✓ MiniGame :295 | ✓ :297 | ✓ | ✓ | ✓ :342 | mniej lepiej | – | ✓ :157 | ✓ :41 | ✓ Sudoku.tsx:99-115 |
| `kubki` | ✓ :253 | ✓ | ✓ :143 | ✓ :115 | ✓ Kubki.tsx:46 | ✓ MiniGame :174 | ✓ :307 | ✓ | ✓ | ✓ :352 | więcej lepiej | – | ✓ :136 | ✓ :30 | ✓ Kubki.tsx:121-133 |
| `rok` | ✓ :173 | ✓ | ✓ :139 | ✓ :103 | ✓ Rok.tsx:54 | ✓ MiniGame :118 | ✓ :303 | ✓ | ✓ | ✓ :349 | mniej lepiej | – | ✓ :161 | ✓ :45 | ✓ Rok.tsx:107-140 |
| `srodek` | ✓ :189 | ✓ | ✓ :140 | ✓ :106 | ✓ Srodek.tsx:52 | ✓ MiniGame :129 | ✓ :304 | ✓ | ✓ | ✓ :350 | mniej lepiej | – | ✓ :162 | ✓ :46 | ✓ Srodek.tsx:105-126 |
| `stoj` | ✓ :214 | ✓ | ✓ :141 | ✓ :109 | ✓ Stoj.tsx:36 | ✓ MiniGame :151 | ✓ :305 | ✓ | ✓ | ✓ :351 | więcej lepiej | mniej | ✓ :143 | ✓ :28 | ✓ Stoj.tsx:96-108 |
| `sledzenie` | ✓ :231 | ✓ | ✓ :142 | ✓ :104 (W10) | ✓ Sledzenie.tsx:42 | ✓ MiniGame :163 | ✓ :306 | ✓ | ✓ | ✓ :353 | więcej lepiej | więcej | ✓ :144 | ✓ :31 | ✓ Sledzenie.tsx:110-124 |
| `wieza` | ✓ :272 | ✓ | ✓ :144 | ✓ :105 | ✓ Wieza.tsx:36 | ✓ MiniGame :273 | ✓ :308 | ✓ | ✓ | ✓ :368 | więcej lepiej | więcej | ✓ :145 | ✓ :33 | ✓ Wieza.tsx:95-108 |
| `rytm` | ✓ :298 | ✓ | ✓ :145 | ✓ :110 | ✓ Rytm.tsx:29 | ✓ MiniGame :262 | ✓ :309 | ✓ | ✓ | ✓ :354 | mniej lepiej | – | ✓ :152 | ✓ :36 | **częściowo** (Z16) |
| `inny` | ✓ :321 | ✓ | ✓ :146 | ✓ :93 | ✓ Inny.tsx:29 | ✓ MiniGame :345 | ✓ :310 | ✓ | ✓ | ✓ :355 | więcej lepiej | mniej | ✓ :139 | ✓ :24 | ✓ Quiz.tsx:217 |
| `obrot` | ✓ :342 | ✓ | ✓ :147 | ✓ :95 | ✓ Obrot.tsx:37 | ✓ MiniGame :332 | ✓ :311 | ✓ | ✓ | ✓ :357 | więcej lepiej | mniej | ✓ :141 | ✓ :26 | ✓ Quiz.tsx:217 |
| `literowka` | ✓ :361 | ✓ | ✓ :148 | ✓ :96 | ✓ Literowka.tsx:16 | ✓ MiniGame :319 | ✓ :312 | ✓ | ✓ | ✓ :356 | więcej lepiej | mniej | ✓ :142 | ✓ :27 | ✓ Quiz.tsx:217 |
| `mapa` | ✓ :375 | ✓ | ✓ :149 | ✓ :107 | ✓ Mapa.tsx:47 | ✓ MiniGame :140 | ✓ :313 | ✓ | ✓ | ✓ :358 | mniej lepiej | – | ✓ :163 | ✓ :50 | ✓ Mapa.tsx:95-123 |
| `przytrzymaj` | ✓ :395 | ✓ | ✓ :151 | ✓ :111 | ✓ Przytrzymaj.tsx:42 | ✓ MiniGame :251 | ✓ :315 | ✓ | ✓ | ✓ :360 | mniej lepiej | – | ✓ :153 | ✓ :37 | ✓ Przytrzymaj.tsx:112-177 |
| `balon` | ✓ :410 | ✓ | ✓ :152 | ✓ :100 | ✓ Balon.tsx:34 | ✓ MiniGame :196 | ✓ :316 | ✓ | ✓ | ✓ :367 | więcej lepiej | mniej | ✓ :147 | ✓ :39 | ✓ Balon.tsx:72-120 |
| `w-pamieci` | ✓ :428 | ✓ | ✓ :153 | ✓ :101 | ✓ WPamieci.tsx:41 | ✓ MiniGame :185 | ✓ :317 | ✓ | ✓ | ✓ :366 | więcej lepiej | mniej | ✓ :146 | ✓ :32 | ✓ WPamieci.tsx:87-100 |
| `dziesiatki` | ✓ :444 | ✓ | ✓ :154 | ✓ :94 | ✓ Dziesiatki.tsx:35 | ✓ MiniGame :306 | ✓ :318 | ✓ | ✓ | ✓ :365 | więcej lepiej | mniej | ✓ :140 | ✓ :25 | ✓ Dziesiatki.tsx:95-108 |
| `tort` | ✓ :459 | ✓ | ✓ :155 | ✓ :114 | ✓ Tort.tsx:50 | ✓ MiniGame :207 | ✓ :319 | ✓ | ✓ | ✓ :362 | mniej lepiej | – | ✓ :164 | ✓ :47 | ✓ Tort.tsx:111-121 |
| `zaslona` | ✓ :499 | ✓ | ✓ :157 | ✓ :113 | ✓ Zaslona.tsx:44 | ✓ MiniGame :218 | ✓ :321 | ✓ | ✓ | ✓ :363 | mniej lepiej | – | ✓ :154 | ✓ :38 | ✓ Zaslona.tsx:104-130 |
| `zakupy` | ✓ :479 | ✓ | ✓ :156 | ✓ :112 | ✓ Zakupy.tsx:37 | ✓ MiniGame :229 | ✓ :320 | ✓ | ✓ | ✓ :364 | więcej lepiej | mniej | ✓ :148 | ✓ :48 | ✓ Zakupy.tsx:74-116 |
| `nozyczki` | ✓ :524 | ✓ | ✓ :158 | ✓ :117 | ✓ Nozyczki.tsx:40 | ✓ MiniGame :240 | ✓ :322 | ✓ | ✓ | ✓ :361 | mniej lepiej | – | ✓ :165 | ✓ :49 | ✓ Nozyczki.tsx:94-104 |
| `panstwa-miasta` | ✓ :629 | ✓ | ✓ :160 | ✓ :70 | ✓ PanstwaMiasta.tsx:21 | ✓ :376 | ✓ :291 | **jest, choć to gra główna** (Z17) | – | ✓ :337 | – | – | – | – | – |
| `kalambury` | ✓ :791 | ✓ | ✓ :161 | ✓ :82 | ✓ Kalambury.tsx:38 | ✓ :389 | ✓ :292 | – (Z17) | – | ✓ :338 | – | – | – | – | – |

- Turniej (`turniej`) nie jest w `GAMES` (`turniej.test.ts:26`), więc §6 go nie obejmuje; sekcja `ZASADY-GIER.md` §8 :765, test `turniej.test.ts`, id rankingu `TOURNAMENT_ID` (`turniej.ts:4`).
- Kierunek `record.lower` zgodny z dokumentami we wszystkich 30 mini-grach; `tie` mają dokładnie gry, którym `ZASADY-GIER.md` daje drugie kryterium (pilnuje `index.test.ts:180`).
  `FORMAT` zgodny z opisem wyniku poza Sekwencją (W6). `CATEGORIES` w `MiniGames.tsx:20-27` obejmuje wszystkie 30 mini-gier.
- Ekran końcowy (WIRE-02): przy `me=""` żaden komponent nie wchodzi w rozgrywkę ani w ekran instrukcji; nikt nie czyta `localStorage`; `playerView` po końcu = stan
  (`view.ts`, 0 różnic w 30 grach), więc ekran „Rekordy” (`Records.tsx:210-217`, `soloState`) ma te same dane co pokój. Szczegóły: `01-02-FINDINGS.md` §4.
- Wpisy podpięcia: Z16, Z17, Z21, W6 (simon), W8 (sudoku), W10 (sledzenie). Wysokich brak.

## 4. Wpisy zbiorcze

Format wpisu zbiorczego: reguła, waga, lista gier z `plik:linia` (identyfikator wpisu częściowego w nawiasie), propozycja. Sekcje gier (§6) odsyłają tu.

### Z3. Losowe wyzwanie zmienia trudność partii `[zbiorcze: trudnosc-z-losowania]`
- Źródło: `ZASADY.md` §3 :100-102 („Losowanie nie zmienia sufitu wyniku… każda [partia] musi dawać tyle samo do zdobycia”; „rodzaje plansz o różnej trudności idą potasowanymi kompletami”).
  Litera (sufit) spełniona we wszystkich grach; uzasadnienie nie, bo trudność zależy od losowania. W Liczeniu także rozbieżność z `ZASADY-GIER.md` :112 („po równo”).
- Waga: **średnia** (wszyscy w partii grają to samo wyzwanie; dotyka tylko porównań rekordów między partiami).

| Gra | Miejsce | Co się zmienia | Wpis |
|---|---|---|---|
| `stoper` | `packages/games/src/stoper.ts:30` | cel 6-14 s | W6a |
| `rytm` | `packages/games/src/rytm.ts:50` | tempo 70-130 BPM, odstęp 462-857 ms, odchyłka w ms bezwzględnych | W6a |
| `liczenie` | `packages/games/src/liczenie.ts:32`, `:47` | rodzaj działania losowany osobno; udział `:` 23,3%; tabliczka w pierwszych 40 pytaniach 8-29 razy | LC1 |
| `kolor` | `packages/games/src/kolor.ts:89` | ta sama pomyłka suwakiem kosztuje 4,6-20,4 ΔE zależnie od celu | W8b |
| `kat` | `packages/games/src/kat.ts:53` | suma kątów partii 410-1451 (założenie: błąd oka zależy od kąta, do pomiaru) | W8b |
| `w-pamieci` | `packages/games/src/w-pamieci.ts:41-44` | 15-35 mnożeń na partię (założenie: mnożenie trudniejsze, do pomiaru) | W9a |

- Historia: Stoper, Rytm (`350706a`, `c681f9e`) i Liczenie (`a118764`) powstały przed regułą kompletów (`a590005`, 2026-10-12), której nie zastosowano wstecz.
- Propozycja (pomiar w fazie 3, REC-01; potem popraw kod albo dopisz powód w `ZASADY-GIER.md`, D-11): Stoper ze stałym celem albo kilkoma rundami o stałej sumie (`withSum`, jak Przytrzymaj);
  Rytm z odchyłką względną (% `interval`) albo stałym tempem; Liczenie i W pamięci rodzaje działań potasowanymi kompletami (jak `stroop.ts:34-35`), w Liczeniu przy wyniku równym a albo b
  losować od nowa tylko liczby; Odcień i Kąt cele kompletami z przedziałów albo `withSum`.

### Z4. Definicja bez testu: liczba graczy, limit tury, świeża gra `[zbiorcze: definicja-swieza-gra]`
- Źródło: `ZASADY.md` §2 Definicja (:54); D-03 (każdy tryb). `index.test.ts:24` sprawdza tylko id, `:66` przepuściłby grę skończoną od startu (01-01-CHECKS.md §4.2, kolumna Def).
- Waga: **średnia**. Zachowanie poprawne we wszystkich grach (`fuzz04..09.ts`: świeża gra nieskończona; limity zgodne z `KONCEPT.md` §3, 01-01-CHECKS.md §3).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `kampus-tour.test.ts:165`; `kampus-tour.ts:471` | `turnSeconds`, świeża gra | K16 |
| `piec-w-rzedzie` | `piec-w-rzedzie.test.ts:237-239` (`toBeGreaterThan(0)`) | `turnSeconds === 60` | G2 |
| `statki` | `statki.test.ts:521-523`, `:497`; `statki.ts:148`, `:247` | 60 s bitwy wprost, świeża gra | S1 |
| `chinczyk` | `chinczyk.test.ts:53` (Klasyczny), `:439` (tylko Szybki) | świeża gra w trybie Klasycznym | C2 |
| `panstwa-miasta` | `panstwa-miasta.test.ts:43`; `panstwa-miasta.ts:72-73` | min/max, świeża gra | PM1 |
| `turniej` | `turniej.test.ts:26`; `turniej.ts:8` | `NEXT_SECONDS === 15` | T2 |
| `refleks` | `refleks.test.ts:32-39`; `refleks.ts:29-30` | min/max, świeża gra | RF2 |
| `simon` | brak w `simon.test.ts`; `simon.ts:23-25` | min/max, 300 s, świeża gra | SQ2 |
| `stoper` | brak w `stoper.test.ts`; `stoper.ts:25-27` | min/max, 60 s | SP1 |
| `schulte` | `schulte.test.ts:115-116` (porównanie z `game.turnSeconds`); `schulte.ts:33-34` | 180 s wprost, min/max, świeża gra | SC1 |
| `stroop` | brak w `stroop.test.ts`; `stroop.ts:25-28` | wszystko | ST1 |
| `liczenie` | brak w `liczenie.test.ts`; `liczenie.ts:57-60` | wszystko | LC3 |
| `kolo` | `kolo.test.ts:176`; `kolo.ts:108-110` | min/max, 120 s wprost, świeża gra | KO2 |
| `kolor` | brak w `kolor.test.ts` (świeża gra częściowo :78); `kolor.ts:78-80` | min/max, 180 s | OD1 |
| `kropki` | `kropki.test.ts:79`, `:131`; `kropki.ts:48-50` | min/max, 120 s wprost | KR1 |

- Propozycja: w każdej grze test jak `kat.test.ts:26` / `sudoku.test.ts:52-72` (min, max, limit liczbą, `isOver(setup)` = `null`, w każdym trybie).
  Alternatywa (D-04): jeden test w `index.test.ts` z tabelą oczekiwanych limitów z `KONCEPT.md` §3 i sprawdzeniem `isOver(setup)` w `describe.each(CASES)` zamyka punkt dla wszystkich gier naraz.

### Z5. Setup: ten sam seed daje to samo `[zbiorcze: setup-ten-sam-seed]`
- Źródło: `ZASADY.md` §2 Setup (:55) i Mini-gra „rewanż daje inne wyzwanie” (:75). Waga: **średnia**. Determinizm potwierdzony skryptem (01-01-CHECKS.md §2, 46/46).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `statki` | `statki.test.ts:91`, `:134` | ten sam seed | S2 |
| `panstwa-miasta` | `panstwa-miasta.test.ts:122` (tylko `nonce`); `panstwa-miasta.ts:84-85` | ten sam seed, inne litery dla innego | PM2 |
| `simon` | `simon.test.ts:25` (`length ≥ 50`, kod ma 100) | długość 100, ten sam / inny seed | SQ3 |
| `stoper` | `stoper.test.ts:35` (tylko inny `nonce`) | ten sam seed | SP2 |
| `stroop` | brak | start, ten sam / inny seed | ST2 |
| `liczenie` | `liczenie.test.ts:83` (`waitingFor` po ruchu) | start, seedy | LC4 |
| `schulte` | `schulte.test.ts:32` (tylko „nie posortowana”) | seedy | SC2 |
| `kolo` | `kolo.test.ts:102` (tylko inny `nonce`) | ten sam seed | KO3 |
| `kolor` | `kolor.test.ts:38` (tylko inny seed) | ten sam seed | OD2 |
| `kropki` | `kropki.test.ts:43` (tylko inny seed) | ten sam seed | KR2 |

- Propozycja: `expect(game.setup(p, createRng(n))).toEqual(game.setup(p, createRng(n)))` i `not.toEqual` dla dwóch seedów (wzór `inny.test.ts:44`, `kat.test.ts:48`);
  albo jedno sprawdzenie w `describe.each(CASES)`.

### Z6. Ruch po końcu gry bez testu `[zbiorcze: po-koncu]`
- Źródło: `ZASADY.md` §2 Walidacja (:60). `index.test.ts:110-112` sprawdza tylko ruchy z tej samej partii (01-01-CHECKS.md §4.2, W4 C). Waga: **średnia**. Kod poprawny wszędzie.

| Gra | Miejsce (test kończący partię bez próby ruchu) | Wpis |
|---|---|---|
| `panstwa-miasta` | `panstwa-miasta.test.ts:211` | PM3 |
| `refleks` | `refleks.test.ts:95`; kod `refleks.ts:43` | RF3 |
| `simon` | `simon.test.ts:45` | SQ4 |
| `stoper` | `stoper.test.ts:48` | SP3 |
| `stroop` | `stroop.test.ts:57`, `:66` | ST4 |
| `liczenie` | `liczenie.test.ts:94` | LC5 |
| `schulte` | `schulte.test.ts:113` (tylko `progress` po własnym wyniku) | SC3 |
| `kolo` | `kolo.test.ts:109-110` (11. próba, nie `isOver`), `:146` | KO5 |
| `kolor` | `kolor.test.ts:66`, `:75`, `:85` | OD3 |
| `kropki` | `kropki.test.ts:128` | KR4 |
| `srodek` | `srodek.test.ts:98` (tylko drugi wynik) | SR2 |

- Propozycja: na końcu testu kończącego partię `validateMove` każdego typu ruchu dla A, B i obcego = `false` (wzór `kat.test.ts:68`, `sudoku.test.ts:133-139`).

### Z7. Wartości brzegowe tylko z jednej strony `[zbiorcze: brzegi]`
- Źródło: `ZASADY.md` §2 Walidacja (:61 „pierwsza i ostatnia dozwolona przechodzą, sąsiednie nie”), D-03. Waga: **średnia**. Walidacja poprawna wszędzie (`cases*.ts`, `fuzz*.ts`).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `kampus-tour.test.ts:249`, `:949`, `:484`, `:998`, `:1016` | kupno / wykup / budowa przy gotówce równej cenie; postać −1; pola 0 i 31 w `travel`, `sell`, `juwenalia` | K18 |
| `panstwa-miasta` | `panstwa-miasta.test.ts:92`, `:151` | 30 znaków przechodzi; kategoria 5 przechodzi, −1 nie | PM4 |
| `simon` | `simon.test.ts:33-37` | 0 przechodzi | SQ5 |
| `stroop` | `stroop.test.ts:46-48` | 150 i 5000 przechodzą; suma 30 000 / 30 001; 200 / 201 czasów | ST3 |
| `liczenie` | `liczenie.test.ts:62-66` | jak `stroop` oraz 5001 | LC6 |
| `inny` | `inny.test.ts:148`, `:164` | suma 30 000 / 30 001; 200 czasów przechodzi | IN1 |
| `obrot` | `obrot.test.ts:141`, `:156` | jak `inny` | OB1 |
| `literowka` | `literowka.test.ts:128`, `:144` | jak `inny` | LT1 |
| `dziesiatki` | `dziesiatki.test.ts:126`, `:142` | jak `inny` | DZ1 |
| `kolo` | `kolo.test.ts:112-115` | 19 / 20 / 1000 punktów; współrzędne 0, 1 i 1,0001 | KO4 |
| `kolor` | `kolor.test.ts:55-57` | H 0 i 359, S i B 0 i 100 przechodzą; H −1 | OD4 |
| `kropki` | `kropki.test.ts:57-58` | 0 i 99 przechodzą | KR3 |

- Propozycja: pary „przechodzi / nie przechodzi” na każdej granicy (wzór `kat.test.ts:62`, `srodek.test.ts:88-95`); sześć gier z `quiz.ts` może dostać wspólny `test.each` brzegów sumy i liczby czasów.

### Z8. Schemat ruchu nie jest testowany na śmieciach `[zbiorcze: schemat-smieci]`
- Źródło: `ZASADY.md` §2 Schemat (:62: zły typ, brak pola, liczba niecałkowita, nieznany `type`). `index.test.ts:72`, `:81` sprawdzają tylko, że poprawny ruch przechodzi. Waga: **średnia**.
  Schematy poprawne (serwer zawsze woła `moveSchema.safeParse` przed `validateMove`, `apps/server/src/LobbyRoom.ts:177`, `:363`), z wyjątkiem Q1 (Z14).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `kampus-tour.test.ts` nie woła `moveSchema` | całość | K17 |
| `piec-w-rzedzie` | `piec-w-rzedzie.test.ts:255-260` | `x: 1.5` w schemacie | G3 |
| `statki` | `statki.test.ts:541-549` | niecałkowita, brak pola, statek z `length: 1.5` / bez `vertical` | S3 |
| `chinczyk` | `chinczyk.test.ts:542-549` | `pawn: 1.5`, brak `pawn`, `pawn: -1` | C3 |
| `panstwa-miasta` | `panstwa-miasta.test.ts:89-93` | zły typ, brak `done`, `category: 1.5`, nieznany `type` | PM5 |
| `refleks` | `refleks.test.ts:50-56` | brak listy, inny `type` | RF4 |
| `simon` | `simon.test.ts` nie woła `moveSchema` | całość (`score: 1.5` odrzuca tylko schemat) | SQ6 |
| `stoper` | `stoper.test.ts` nie woła `moveSchema` | całość | SP4 |
| `stroop` | `stroop.test.ts` nie woła `moveSchema` | całość | ST5 |
| `liczenie` | `liczenie.test.ts` nie woła `moveSchema` | całość | LC7 |
| `schulte` | `schulte.test.ts` nie woła `moveSchema` | całość | SC4 |
| `kolo` | `kolo.test.ts` nie woła `moveSchema` | całość | KO6 |
| `kolor` | `kolor.test.ts` nie woła `moveSchema` | całość | OD5 |

- Propozycja: blok „schemat odrzuca śmieci” (wzór `inny.test.ts:159-167`, `srodek.test.ts:101-110`); w starszych plikach `accepts` przez `safeParse` jak `refleks.test.ts:21`.

### Z9. Wygrana tylko jednego gracza `[zbiorcze: wygrana-kazdego]`
- Źródło: `ZASADY.md` §2 Koniec gry (:64 „wygrana każdego gracza (nie tylko pierwszego)”), D-03. `index.test.ts:96` sprawdza tylko, że zwycięzca należy do graczy. Waga: **średnia**.

| Gra | Miejsce | Wygrywa w testach | Wpis |
|---|---|---|---|
| `panstwa-miasta` | `panstwa-miasta.test.ts:234` | A | PM6 |
| `refleks` | `refleks.test.ts:82-89` | B | RF5 |
| `simon` | `simon.test.ts:45-53` | B | SQ7 |
| `stoper` | `stoper.test.ts:48-55` | B | SP5 |
| `stroop` | `stroop.test.ts:57-64` | B | ST6 |
| `liczenie` | `liczenie.test.ts:71-77` | B | LC8 |
| `schulte` | `schulte.test.ts:49-57`, `:73-78` | B | SC5 |
| `kolo` | `kolo.test.ts:146-155` | B | KO7 |
| `kolor` | `kolor.test.ts:72`, `:82` | A, B (C nigdy) | OD6 |
| `kropki` | `kropki.test.ts:73`, `:84` | A, B | KR5 |
| `rok` | `rok.test.ts:98`, `:111` | A, B | RK1 |
| `srodek` | `srodek.test.ts:167`, `:180` | A, B | SR3 |
| `tort` | `tort.test.ts:147`, `:160`, `:184` | A, B | TR1 |
| `nozyczki` | `nozyczki.test.ts:192`, `:205`, `:229` | A, B | NZ1 |

- Propozycja: `test.each([A, B, C])` (wzór `kat.test.ts:96`, `stoj.test.ts:183`); w Państwach-miastach wariant, w którym komplet pisze B.

### Z10. Brak testu mutacji i JSON round-trip `[zbiorcze: stan-mutacja-json]`
- Źródło: `ZASADY.md` §2 Stan (:66). `index.test.ts` tego nie sprawdza (01-01-CHECKS.md §4.2, St1 N, St2 N; `views` tylko woła `JSON.stringify`). Waga: **średnia**.
  Zachowanie poprawne we wszystkich grach (01-01-CHECKS.md: stan zamrożony rekursywnie, round-trip `isDeepStrictEqual`; `fuzz*.ts` dla pozostałych typów ruchów).

| Gra | Miejsce | Wpis |
|---|---|---|
| `kampus-tour` | brak w `kampus-tour.test.ts` | K19 |
| `panstwa-miasta` | brak w `panstwa-miasta.test.ts` | PM9 |
| `simon` | brak w `simon.test.ts` | SQ8 |
| `stoper` | brak w `stoper.test.ts` | SP6 |
| `stroop` | brak w `stroop.test.ts` | ST7 |
| `liczenie` | brak w `liczenie.test.ts` | LC9 |
| `schulte` | brak w `schulte.test.ts` | SC6 |
| `kolo` | brak w `kolo.test.ts` | KO8 |
| `kolor` | brak w `kolor.test.ts` | OD7 |
| `kropki` | `kropki.test.ts:108` (tylko po `progress`) | KR6 |

- Propozycja: test jak `kat.test.ts:130` / `kalambury.test.ts:618` (`Object.freeze` + `JSON.parse(JSON.stringify(s))`) dla każdego typu ruchu.
  Alternatywa (D-04): zamrażanie i round-trip w `describe.each(CASES)` (`index.test.ts:56-117`) zamyka punkt dla wszystkich 38 gier jednym testem.

### Z11. Stałość klucza `turn()` bez testu `[zbiorcze: turn-key-staly]`
- Źródło: `ZASADY.md` §2 Fazy równoczesne (:72 „`turn().key` zmienia się tylko przy zmianie fazy”). Waga: **średnia**. Zachowanie poprawne (`fuzz05.ts`).
- `panstwa-miasta` (PM8): `panstwa-miasta.test.ts:55` (szkic), `:147` (głos) nie porównują klucza przed i po; `ZASADY-GIER.md` §5 :644.
- `kalambury` (KL2): `kalambury.test.ts:196` (kreska), `:345` (strzały), `:475` (pas); kod `kalambury.ts:220`; `ZASADY-GIER.md` §9 :823.
- Propozycja: po ruchu wewnątrz fazy `expect(game.turn!(s).key)` bez zmiany (np. `draw:0:0` po kresce, pudle i pasie).

### Z12. Widok obserwatora `""` nie w każdej fazie `[zbiorcze: widok-obserwatora]`
- Źródło: `ZASADY.md` §2 Ukryty stan (:70-71 „w każdej fazie”, „widok obserwatora nie zawiera danych żadnej strony”). Waga: **niska** (`playerView` w obu grach traktuje `""` jak obcego; `fuzz04.ts`: 0 wycieków).
- `kampus-tour` (K10): `kampus-tour.test.ts:567` sprawdza tylko widok gracza A; kod `kampus-tour.ts:660`.
- `statki` (S4): `statki.test.ts:324` tylko w bitwie; rozstawianie i koniec bez `""`; kod `statki.ts:224`.
- Propozycja: `playerView(s, "")` bez `deck` (Kampus Tour) i bez niezatopionych statków w rozstawianiu i po końcu (Statki, testy :306, :266).

### Z13. Rekord rozstrzyga remis zaokrągloną średnią, miejsca nie `[zbiorcze: tie-zaokraglenie]`
- Źródło: `ZASADY.md` §3 :91 (`rankResults` i `places` z jednego komparatora; rekord to ta sama kolejność, `KONCEPT.md` :152-154). Waga: **niska** (różnica poniżej 1 ms przy równych punktach).
- Gry i miejsca (`record.tie = Math.round(average(times))`, komparator `byHitsThenAverage` / `byScoreThenAverage` w `core.ts:239-247` bez zaokrąglenia):
  `stoj.ts:80` (W6b, SJ1), `stroop.ts:50`, `liczenie.ts:71`, `inny.ts:83`, `obrot.ts:84`, `literowka.ts:52`, `dziesiatki.ts:67` (W7b).
- Dowód: 3 trafienia po 300, 300, 301 ms i po 300 ms: `isOver` daje zwycięzcę `b`, rekordy obu `[3, 300]` (`cases07.ts`); `fuzz06.ts`: 2/400 takich par w Stój!.
  Ekran `apps/web/src/games/Quiz.tsx:73` liczy miejsca jeszcze inaczej (z zaokrągloną średnią): obaj „1.”, puchar tylko u `b`.
- Nie dotyczy: Zakupy (`tie` = `ms` bez zaokrąglenia), Wieża, Śledzenie, Balon, W pamięci (`tie` całkowite albo bez zaokrąglenia).
- Propozycja (popraw kod): `Math.round` średniej w obu komparatorach `core.ts` (jedna poprawka dla 7 gier), ekran `Quiz.tsx` bierze miejsca z `places`; albo `tie` bez zaokrąglenia i zaokrąglanie w `FORMAT`.

### Z14. `quiz.ts`: czasy niecałkowite i nieograniczona liczba pomyłek przechodzą walidację `[zbiorcze: quiz-walidacja]` (Q1)
- Gry: `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`. Miejsce: `packages/games/src/quiz.ts:18` (`times: z.array(z.number())` bez `.int()`), `:19`, `:29-30` (`errors` bez górnej granicy).
- Dowód: `{ times: [150.5, 4999.9], errors: 1e9 }` przechodzi (`cases07.ts`); ekran zawsze wysyła całkowite (`Quiz.tsx:182`, `Dziesiatki.tsx:61`).
- Źródło: `ZASADY.md` §2 Mini-gra (:74 „wynik niecałkowity odpada”); `ZASADY-GIER.md` §1 :57. Waga: **niska** (bez wpływu na ranking; Refleks ma `.int()`, `refleks.ts:32`).
- Propozycja (popraw kod): `z.number().int()` i `errors ≤ DURATION_MS / 1000`; przypadki w teście schematu każdej z 6 gier.

### Z15. Ekran quizów ucina czasy do 5 s i gubi trafienia poniżej 150 ms `[zbiorcze: quiz-ekran-czasy]` (Q2)
- Gry: jak Z14. Miejsce: `apps/web/src/games/Quiz.tsx:187-188`, `Dziesiatki.tsx:62-63` (komentarz `ponytail:`).
- Źródło: `ZASADY-GIER.md` :108 opisuje tylko walidację 150-5000 ms; ucięcie do 5 s opisują Inny element (:339) i Dziesiątki (:456), utraty trafienia < 150 ms żadna sekcja (D-07).
- Waga: **niska**. Propozycja (popraw dokument): zdanie w :108, odesłanie z :339 i :456.

### Z16. Ekran końcowy z kaflem ze stanu lokalnego `[zbiorcze: ekran-stan-lokalny]` (W3)
- Źródło: `ZASADY.md` §3 („Ekran końcowy mini-gry rysuje się z samego stanu”); `ZASADY-GIER.md` :83 (Stoper: odchyłka ze znakiem), :319 (Rytm: kafel z tempem w BPM).
- `stoper`: kafel „Twój czas” z `stopped` (`useState`, `apps/web/src/games/Stoper.tsx:42`, render `:70-83`); stan `packages/games/src/stoper.ts:10` ma tylko odchyłkę bez znaku.
- `rytm`: kafel „Twoje tempo” z `run.current.taps` (`useRef`, `apps/web/src/games/Rytm.tsx:37`, render `:103-117`); stan `packages/games/src/rytm.ts:16` bez czasów stuknięć.
- Waga: **średnia** (wynik i ranking poprawne, ale kafel znika na ekranie „Rekordy” i po odświeżeniu; kafle starsze od rekordowej partii: `4649af6`, `9239058` przed `30ab8f6`).
- Propozycja (popraw kod): mapa per gracz w stanie (`stops`, `taps`, wzorem Środka i Za zasłoną) i kafel z `view`; albo odstępstwo z powodem w `ZASADY-GIER.md`.

### Z17. Ręczne zbiory `MINI_GAMES` `[zbiorcze: mini-games-zbior]` (W1, W2, W4, W5)
- W1 (**średnia**, `panstwa-miasta`): `apps/web/src/screens/Game.tsx:477` to ręczny `Set` 31 id: 30 mini-gier i `panstwa-miasta` (`minPlayers: 2`). Użycia `:201`, `:204`, `:254-255`, `:402`.
  Zbiór znaczy w praktyce „gra z własną tabelą wyników”; nowa mini-gra bez ręcznego dopisania dostanie „Twój ruch” i podwójny ranking. Źródło: `ZASADY.md` §6 pkt 5, `KONCEPT.md` §3.
- W2 (**średnia**, `kalambury`): ranking po partii dwa razy przy 3+ graczach: `Game.tsx:402` (lista, bo brak w zbiorze) i `apps/web/src/games/Kalambury.tsx:104`, `:127-135` („Suma punktów”).
- W4 (**niska**): drugi `MINI_GAMES` w `apps/web/src/screens/Lobby.tsx:246` powiela `MINI_GAME_IDS` (`packages/games/src/index.ts:165`); `ZASADY.md` §3 (wspólne zamiast własnych).
- W5 (**niska**, dokument): `ZASADY.md` §6 pkt 5 mówi o „wpisie w `MINI_GAMES`”, a są dwa zbiory.
- Propozycja (popraw kod, potem dokument): mini-gry z `MINI_GAME_IDS` (albo `minPlayers === 1`), osobny zbiór „własny ranking” (`panstwa-miasta`, `kalambury`),
  w `Lobby.tsx` `MINI_GAME_IDS.map((id) => GAMES[id])`; potem usunąć ręczny krok z `ZASADY.md` §6 pkt 5.

### Z18. Pełny remis rozstrzyga kolejność miejsc, dokument tego nie mówi `[zbiorcze: remis-kolejnosc-miejsc]`
- Źródło: zasada odczuwalna tylko w kodzie (D-07). Waga: **niska** (zwycięzca się nie zmienia, tylko kolejność dalszych miejsc na ekranie).
- `chinczyk` (C1): `packages/games/src/chinczyk.ts:157` (tryb Szybki: dom, potem suma, przy równości kolejność `players`); `ZASADY-GIER.md` §4 :626-627. Dowód `cases04.ts`.
- `turniej` (T1): `packages/games/src/turniej.ts:84` (stabilne sortowanie), komentarz `:75`; `ZASADY-GIER.md` §8 :782; test `turniej.test.ts:218` to zakłada.
- Propozycja (popraw dokument): w obu sekcjach „przy pełnym remisie decyduje kolejność miejsc”. Wspólne miejsce przy remisie w grach głównych to decyzja fazy 4 (wymaga `places` albo zmiany kontraktu).

### Z19. Wspólne funkcje i moduły `core.ts` `[zbiorcze: wspolne-funkcje-core]`
- Źródło: `ZASADY.md` §3 :91, :104-105 („Mini-gry używają `ranked`”, „Wspólne funkcje z `core.ts` zamiast własnych”, „dwie gry o tej samej mechanice dzielą moduł”). Waga: **niska** (bez wpływu na gracza).
- `kampus-tour` (K6): talia tasowana własną pętlą `packages/games/src/kampus-tour.ts:475-479` zamiast `shuffle` (`core.ts:221`); algorytm identyczny. Propozycja: `deck: shuffle(CARDS.map((_, i) => i), rng)`.
- `kubki` (KB1): `packages/games/src/kubki.ts:30` lokalna funkcja `shuffle` (losuje zamiany) o nazwie funkcji z `core.ts`. Propozycja: `swapsFor`.
- `kropki`, `kat`, `rok` (W8c): trzy kopie szkieletu rund `kropki.ts:45-89`, `kat.ts:38-85`, `rok.ts:209-256`; powód tylko w komentarzu `kat.ts:37` (`ponytail:`); dryf kopii widać w Z1.
  Propozycja: wspólny `szacowanie.ts` albo zdanie z powodem w `ZASADY-GIER.md` §1.
- `kolo` (KO1): `packages/games/src/kolo.ts:144-146` bez `ranked` (koniec zależy od `waitingFor`, nie od pierwszego wyniku); jeden komparator, 0 niezgodności. Propozycja: zdanie w `ZASADY-GIER.md` :133 albo opcjonalny warunek końca w `ranked`.

### Z20. `KONCEPT.md` §2.4 pomija drugie kryterium W pamięci `[zbiorcze: koncept-drugie-kryteria]` (W7 = WP2)
- Gra: `w-pamieci`. Miejsce: `KONCEPT.md` :152-154 (lista `tie`); kod `packages/games/src/w-pamieci.ts:84` (`tie`, mniej lepiej); opisane w `KONCEPT.md` :137 i `ZASADY-GIER.md` :438.
  Ten sam wpis padł w 01-02 (W7) i 01-09 (WP2); tu jeden.
- Źródło: D-06. Waga: **niska**. Propozycja (popraw dokument): dopisać „odchyłka w rundzie z pomyłką w W pamięci”.

### Z21. Test `soloState` nie widzi map wypełnianych tylko w prawdziwej partii `[zbiorcze: test-solostate]` (W9)
- Gry: `schulte`, `kropki`, `kat`, `rok`, `wieza`, `balon`, `sudoku` (`progress`), `kolo` (`attempts`/`best` po częściowej grze). Miejsce: `packages/games/src/index.test.ts:190-210` (same `timeoutMove`).
- Źródło: `ZASADY.md` §3 (dane gracza w mapach z id w kluczach), D-04. Waga: **niska** (kod przycina poprawnie, `core.ts:148-151`).
- Propozycja: w teście jeden ruch `progress` (albo próba Koła) przed timeoutami.

## 5. Odstępstwa z powodem (D-11, bez wagi)

Odstępstwa od `ZASADY.md` §3 opisane w `ZASADY-GIER.md` z powodem; sprawdzone, nie są rozbieżnościami.

| Odstępstwo | Gry | Powód (miejsce) |
|---|---|---|
| `playerView` zwraca cały stan, wyzwanie widoczne od startu (`ponytail:` w kodzie) | wszystkie 30 mini-gier (jawnie: `balon.ts:36-37` wytrzymałości, `zakupy.ts:47-48` lista, `sudoku` `solution`) | `ZASADY-GIER.md` §1 :53-54 („między znajomymi”), Sudoku :553 |
| wynik albo pomiar liczony na kliencie, serwer odrzuca nierealne wartości | simon, stoper, stoj, rytm, przytrzymaj, zaslona, schulte, sudoku, wieza, stroop, liczenie, inny, obrot, literowka, dziesiatki | `ZASADY-GIER.md` §1 :57-58 |
| wynik Koła z punktów, które klient może wygenerować | kolo (`kolo.ts:104`) | `ponytail:` w kodzie, §1 :57-58 |
| `timeoutMove` = najlepszy krok, nie ruch neutralny ani losowy | labirynt (`labirynt.ts:186-191`) | `ZASADY-GIER.md` §10 :844 („losowości w grze nie ma”). **Uwaga do fazy 4:** gracz, który się nie rusza, idzie najkrótszą drogą i może tak wygrać, a `rng` jest dostępny |
| `timeoutMove` kończy próby zamiast dawać najgorszy wynik; limit od nowa, gdy ktoś skończy próby | kolo (`kolo.ts:150-157`) | `ZASADY-GIER.md` :118, :121-122 (powód wynika z zasady: oddane próby są prawdziwymi wynikami; wprost niezapisany) |
| kara punktowa (−2) zamiast blokady 1 s | stoj | `ZASADY-GIER.md` :225-226 („blokada zjadałaby kolejne bodźce”) |
| kara punktowa obok blokady | obrot, literowka | `ZASADY-GIER.md` :354-355, :362, :369 („druga próba przy dwóch odpowiedziach byłaby darmowa”) |
| jedyna gra z dźwiękiem | rytm | `KONCEPT.md` :26, `ZASADY-GIER.md` :315 |
| brak `nonce` (partie odróżniają cele) | przytrzymaj, zaslona | `ZASADY-GIER.md` :400-401, :508 |
| `progress` od klienta może spaść albo skoczyć (tylko podgląd) | kropki, kat, rok, wieza | `ZASADY-GIER.md` :155, :169, :183, :289-290 |
| strefa akceptacji w px, nie w % | srodek | `ZASADY-GIER.md` :198 (dotyczy palca) |
| zniekształcenie rysunku mapy do 6% | mapa (`mapa.ts:14-15`) | `ZASADY-GIER.md` :381-382 |
| plansza zależy od wyborów gracza | dziesiatki | `ZASADY-GIER.md` :452-453 (zawsze jest para, dostawy wspólne) |
| premia za miejsce przy stole (`SEAT_BONUS`) | kampus-tour (`kampus-tour.ts:7-8`) | `ZASADY-GIER.md` :671 (start dalej od `players[0]`, więc nie odstępstwo od §3) |

## 6. Gry

Kolejność jak w `KONCEPT.md` §2. Każda gra: Zasady (sekcja w `ZASADY-GIER.md`, opis w `KONCEPT.md` §2, stałe), Reguły §3, Testy (luki testów obowiązkowych §2 i zasad sekcji),
dla mini-gier Ekran końcowy. „→ Zn” to odsyłacz do wpisu zbiorczego. Pełne tabele stałych i „zasada → test”: plik częściowy podany przy grze.
Dowód hurtowy §3 każdej gry: 01-01-CHECKS.md §2 (wiersz gry, wszystkie tryby, bez błędów) i grep `Math.random`/`Date.now` (pusty).

`KONCEPT.md` §2.2 Poprawka: gry nie ma w `GAMES` (etap 6 do zrobienia), poza zakresem audytu.

### 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §6 :646; opis ✓ `KONCEPT.md` §2.1 :30. Stałe planszy, kart, tury i ekonomii zgodne z §6 i `KONCEPT.md` §9 (37 pozycji); brak trybów.
  Zasady tylko w kodzie: K1, K2, K11. Rozbieżności dokumentów: K3, K4, K5.
- **Reguły §3:** ✓ wszystkie (`fuzz.ts`: 1200 partii, 8 faz, 10 typów ruchów, 0 błędów); wspólne funkcje → Z19 (K6). Odstępstw z powodem brak (`SEAT_BONUS` w §5).
- **Testy:** luki obowiązkowe → Z4 (K16), Z7 (K18), Z8 (K17), Z10 (K19), Z12 (K10); zasady sekcji: K7, K8, K9, K13, K14, K15; nazwy: K20.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| K1. Bankrut z kartą „Zaliczenie” zabiera ją z gry | `packages/games/src/kampus-tour.ts:319-337`, `:398` | `ZASADY-GIER.md` §6 :719 (przypadek nieopisany) | niska | w `goBankrupt` odłożyć Zaliczenia na spód talii, zdanie w §6, test |
| K2. Juwenalia zostają na polu po wykupieniu | `kampus-tour.ts:575-588`, `:297-298` | `ZASADY-GIER.md` §6 :703, :711 (D-07) | niska | dopisać w §6 Wykupienie; zmiana zachowania tylko po decyzji balansu (faza 3) |
| K3. `KONCEPT.md` wymienia kartę „poprawka”, której nie ma | `KONCEPT.md:54`; talia `kampus-tour.ts:79-110` | D-06 | niska | „stypendium, warunek, Zaliczenie w pierwszym terminie itp.” |
| K4. `KONCEPT.md` §9 opisuje talię Kampus Tour pod Poprawką | `KONCEPT.md:348` | D-06 | niska | rozdzielić na dwa punkty |
| K5. Tabela gier: „po kolei”, a `pick` jest równoczesna | `ZASADY-GIER.md:9`; `kampus-tour.ts:698-699` | `ZASADY.md` §2 (typy gier) | niska | „planszowa, po kolei (wybór postaci naraz)” |
| K7. Brak testu: Zaliczenie na Kolokwium plus dublet daje kolejny rzut | `kampus-tour.test.ts:730`; kod `kampus-tour.ts:641-646` | `ZASADY-GIER.md` §6 :708, `ZASADY.md` §2 | średnia | test z rzutem 2+2 |
| K8. Brak testu: jazda MPK z dubletem nie daje rzutu | `kampus-tour.test.ts:883`, `:895`; kod `:569` | `ZASADY-GIER.md` §6 :714 | średnia | test `travel` z kośćmi 3+3 |
| K9. Licznik Juwenaliów „wspólny” bez testu z dwoma graczami | `kampus-tour.test.ts:835` | `ZASADY-GIER.md` §6 :711, `ZASADY.md` §2 „Jak pisać” | niska | A, potem B na Juwenaliach, B dostaje × 3 |
| K11. Budynki powyżej poziomu 2 zostają po utracie kompletu | `kampus-tour.ts:263-266`, `:538`, `:611-626`, `:575-588` | `ZASADY-GIER.md` §6 :691 (przypadek nieopisany, D-07) | średnia | dopisać w §6 Budowa; zrzut poziomów to decyzja balansu (faza 3) |
| K12. Statystyka czynszu liczy pełną kwotę przy bankructwie płacącego | `kampus-tour.ts:459-465`, `:230-242`, `:319-325` | `ZASADY-GIER.md` §6 :741, `KONCEPT.md` §2.1 :60 | niska | zapisać w `stats` kwotę faktycznie oddaną |
| K13. Brak testu: po przymusowej sprzedaży nie ma oferty wykupu | `kampus-tour.test.ts:315`, `:383`; kod `:461-462` | `ZASADY-GIER.md` §6 :696 | średnia | test z gotówką ≥ 2 × wartość po sprzedaży |
| K14. Brak testów bankructwa przy kilku wierzycielach i utraty Juwenaliów przy bankructwie | `kampus-tour.ts:322`, `:326`; testy :333, :372, :858 | `ZASADY-GIER.md` §6 :701, :703 | średnia | dwa testy (Składka przy 4 graczach, bankrut z Juwenaliami) |
| K15. Zaokrąglenie w dół przy sprzedaży nieprzetestowane | `kampus-tour.ts:271`; testy :315, :527, :611 | `ZASADY-GIER.md` §6 :699 | niska | test na polu o nieparzystej wartości |
| K20. Nagłówek i nazwy testów nie nadążyły za zasadami | `kampus-tour.test.ts:9`, `:13`, `:19`, `:26`, `:315`, `:758` | `ZASADY.md` §2, D-02 | niska | zsynchronizować komentarze i nazwy z §6 |

### 6.2 Gomoku (`piec-w-rzedzie`), szczegóły: 01-04-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §2 :568; opis ✓ `KONCEPT.md` §2.3 :67-70. Stałe zgodne (15×15, 5 w linii, 60 s, `timeoutMove`); brak trybów.
- **Reguły §3:** ✓ poza G1.
- **Testy:** → Z4 (G2), Z8 (G3); reszta punktów §2 pokryta.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| G1. Remis zwraca `{}` zamiast samego `ranking` | `packages/games/src/piec-w-rzedzie.ts:105`; `ZASADY-GIER.md` §2 :572; test :176 | `ZASADY.md` §3 :91 (bez powodu w dokumencie, więc nie D-11) | niska | `{ ranking: [...state.players] }`, poprawić :572 i test; `{}` znaczy też partię przerwaną (`LobbyRoom.ts` `finish({})`) |

### 6.3 Statki (`statki`), szczegóły: 01-04-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §3 :575; opis ✓ `KONCEPT.md` §2.3 :71-77. Stałe czterech trybów, stykanie, rozstawianie, limit 90/60 s zgodne.
- **Reguły §3:** ✓ wszystkie (remisu nie ma; ukrywanie i klucz `turn()` w `fuzz04.ts`, 0 wycieków).
- **Testy:** → Z4 (S1), Z5 (S2), Z8 (S3), Z12 (S4); zasady sekcji komplet.

### 6.4 Chińczyk (`chinczyk`), szczegóły: 01-04-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §4 :600; opis ✓ `KONCEPT.md` §2.3a :79-85. Stałe obu trybów zgodne; zasada tylko w kodzie → Z18 (C1).
- **Reguły §3:** ✓ wszystkie (remisu nie ma; klucz `turn()` nowy po każdym ruchu, `fuzz04.ts`).
- **Testy:** → Z4 (C2), Z8 (C3); zasada sekcji: C4.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| C4. Brak testu: w Szybkim szóstka z wejściem do domku daje jeden dodatkowy rzut | `chinczyk.test.ts:476`, `:488`; kod `packages/games/src/chinczyk.ts:166` | `ZASADY-GIER.md` §4 :625 | średnia | test: po szóstce z wejściem jeden rzut, potem tura dalej |

### 6.5 Memory (`memory`), szczegóły: 01-04-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §7 :743; opis ✓ `KONCEPT.md` §2.3b :87-92. Stałe trzech trybów, 18 symboli, 1,5 s pudła zgodne.
- **Reguły §3:** ✓ wszystkie (`shuffle`, `rankResults`; 118 remisów bez zwycięzcy).
- **Testy:** wszystkie punkty §2; zasada sekcji: M1.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| M1. Liczba 18 symboli bez testu | `memory.test.ts:95`; `packages/games/src/memory.ts:5`; ekran `Memory.tsx:17-35` (18 emoji) | `ZASADY-GIER.md` §7 :745 | niska | `expect(SYMBOLS).toBe(18)` |

### 6.6 Kalambury (`kalambury`), szczegóły: 01-05-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §9 :791; opis ✓ `KONCEPT.md` §2.3c :94-101. Stałe (tryby, 3 hasła, 2 × 40 s, 2000 punktów, paleta, punkty 10/8/6/5/4 i 3) zgodne.
- **Reguły §3:** ✓ wszystkie (`fuzz05.ts`: 600 partii, 8 typów ruchów, ukrywanie haseł bez wycieku). Podwójny ranking po partii → Z17 (W2).
- **Testy:** → Z11 (KL2); `nonce`: KL3.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| KL1. `hint` może wysłać sam rysujący w dowolnej chwili 1. połowy | `packages/games/src/kalambury.ts:146` | `ZASADY-GIER.md` §9 :800 | niska | dopisać w dokumencie; przycisk „Odsłoń literę” to decyzja fazy 4 |
| KL3. `nonce` bez testu | brak w `kalambury.test.ts`; kod `kalambury.ts:124` | `ZASADY-GIER.md` §9 :796 | niska | inny seed, inny `nonce` w teście :120 |

### 6.7 Labirynt (`labirynt`), szczegóły: 01-04-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §10 :825; opis ✓ `KONCEPT.md` §2.3d :103-107. Stałe obu trybów, przeskok, skos, ścianki, `pass` zgodne.
- **Reguły §3:** ✓; `timeoutMove` = najlepszy krok to odstępstwo z powodem z uwagą do fazy 4 (§5).
- **Testy:** wszystkie punkty §2; zasady sekcji: L1, L2.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| L1. `pass` dozwolony i `timeoutMove` = `pass` bez testu | `labirynt.test.ts:163`, `:263`, `:267`; kod `packages/games/src/labirynt.ts:161`, `:190` | `ZASADY-GIER.md` §10 :842, :844 | średnia | test zamkniętego pionka przy 3 osobach (losowe partie nie trafiają tego stanu) |
| L2. Skos przy pionku za pionkiem i przez ściankę bez testu | `labirynt.test.ts:148`, `:154`; kod `labirynt.ts:101-108` | `ZASADY-GIER.md` §10 :837-838 | średnia | dwa testy przy 3 osobach |

### 6.8 Mini-gry (`KONCEPT.md` §2.4)

Wspólne dla 30 mini-gier: `record.lower` i `tie` zgodne z dokumentami, `RECORDS` i `soloState` w `index.test.ts:168`, `:190` (01-01-CHECKS.md §4.3), remis i solo bez zwycięzcy,
`places` zgodne z rekordem (`fuzz06..09.ts`, poza Z13), pole odróżniające partie obecne (poza W8). Kolumna „limit” porównuje limit tury z najdłuższą uczciwą partią
(tabele w 01-06..01-09 „Metoda”).

#### Refleks (`refleks`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :67; ✓ `KONCEPT.md` :111. Stałe zgodne (12 rund, 1-3 s, 100-1000 ms, kara 1000 ms). Dokument: RF1.
- **Reguły §3:** ✓ (limit 48 s z 60 s, stała liczba bodźców). **Testy:** → Z4 (RF2), Z6 (RF3), Z8 (RF4), Z9 (RF5). **Ekran końcowy:** ze stanu (`Refleks.tsx:183`).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| RF1. Wspólny schemat nie wymienia Refleksu wśród gier z wynikiem na serwerze | `ZASADY-GIER.md` §1 :57-58 ↔ :72, `refleks.ts:48` | rozbieżność wewnątrz `ZASADY-GIER.md` | niska | dopisać Refleks w :57 |

#### Sekwencja (`simon`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :76; ✓ `KONCEPT.md` :112. Stałe zgodne (100 kolorów, 450/150 ms, wynik = seria).
- **Reguły §3:** ✗ limit tury → **Z2 (SQ1, wysoka)**; reszta ✓. **Testy:** → Z4 (SQ2), Z5 (SQ3), Z6 (SQ4), Z7 (SQ5), Z8 (SQ6), Z9 (SQ7), Z10 (SQ8). **Ekran końcowy:** ze stanu (`Simon.tsx:88`).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| W6. `FORMAT` pokazuje wynik jako punkty, a wynik to długość serii | `apps/web/src/screens/Records.tsx:29` | `ZASADY-GIER.md` :78, `KONCEPT.md` §2.4 | niska | jednostka serii albo sama liczba, jak `rundy` w Kubkach |

#### Stoper (`stoper`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :80; ✓ `KONCEPT.md` :113. Stałe zgodne (cel 6-14 s, licznik 3 s); trudność zależna od celu → Z3 (W6a).
- **Reguły §3:** ✓ (limit 31 s z 60 s). **Testy:** → Z4 (SP1), Z5 (SP2), Z6 (SP3), Z8 (SP4), Z9 (SP5), Z10 (SP6). **Ekran końcowy:** częściowo ze stanu lokalnego → Z16.

#### Tabela Schultego (`schulte`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :86; ✓ `KONCEPT.md` :114-115. Stałe zgodne (5×5, kara 3 s, 3750-180 000 ms, `splits`, `progress`).
- **Reguły §3:** ✗ `timeoutMove` → **Z1 (W7a, wysoka)**; reszta ✓. **Testy:** → Z4 (SC1), Z5 (SC2), Z6 (SC3), Z8 (SC4), Z9 (SC5), Z10 (SC6); zasada sekcji: SC7. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SC7. „Międzyczasy nie wpływają na ranking” bez testu | `schulte.test.ts:121-140`; komparator `packages/games/src/schulte.ts:71` | `ZASADY-GIER.md` :91 | niska | dwa wyniki o tym samym `ms` i różnych `splits` dają remis |

#### Kolor liter (`stroop`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :101; ✓ `KONCEPT.md` :116, :118. Stałe zgodne (30 s, 200 plansz, czwórki z jedną zgodną); `quiz.ts` → Z14, Z15.
- **Reguły §3:** ✓ poza → Z13 (W7b). **Testy:** → Z4 (ST1), Z5 (ST2), Z6 (ST4), Z7 (ST3), Z8 (ST5), Z9 (ST6), Z10 (ST7); wynik niecałkowity → Z14. **Ekran końcowy:** ze stanu.

#### Liczenie (`liczenie`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :101, :112-115; ✓ `KONCEPT.md` :117-118. Zakresy liczb zgodne; „po równo z czterech typów” niezgodne → Z3 (LC1).
- **Reguły §3:** ✓ poza → Z3, Z13. **Testy:** → Z4 (LC3), Z5 (LC4), Z6 (LC5), Z7 (LC6), Z8 (LC7), Z9 (LC8), Z10 (LC9), Z14; zasada sekcji: LC2. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| LC2. Zakresy liczb i udział rodzajów bez testu | `liczenie.test.ts:29-39`; kod `packages/games/src/liczenie.ts:34-45` | `ZASADY-GIER.md` :112-113, `ZASADY.md` §2 :63 | średnia | test zakresów parsujący `text`; po poprawce Z3 test kompletów jak `stroop.test.ts:30` |

#### Narysuj koło (`kolo`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :117; ✓ `KONCEPT.md` :119. Stałe zgodne (10 prób, 20-1000 punktów, 0,9 obrotu, r 0,15, przerwa 3%).
- **Reguły §3:** ✓; `timeoutMove` kończy próby (odstępstwo, §5); bez `ranked` → Z19 (KO1). **Testy:** → Z4 (KO2), Z5 (KO3), Z6 (KO5), Z7 (KO4), Z8 (KO6), Z9 (KO7), Z10 (KO8); zasady sekcji: KO9. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| KO9. „Przerwa do 3% za darmo” i „mniej niż 20 punktów” w `judge` bez testu | `packages/games/src/kolo.ts:15`, `:87`, `:96`; `kolo.test.ts:90`, `:112` | `ZASADY-GIER.md` :125, :128 | średnia | „przerwa 2% nie kosztuje”; `judge` 19 punktów = `unfinished` |

#### Odcień (`kolor`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :135; ✓ `KONCEPT.md` :120. Stałe zgodne (5 kolorów, 2 s, ΔE ucięta do 100); trudność z losowania → Z3 (W8b).
- **Reguły §3:** ✓ (limit = najgorszy). **Testy:** → Z4 (OD1), Z5 (OD2), Z6 (OD3), Z7 (OD4), Z8 (OD5), Z9 (OD6), Z10 (OD7). **Ekran końcowy:** ze stanu.

#### Policz kropki (`kropki`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :148; ✓ `KONCEPT.md` :121. Stałe zgodne (10 rund, 8-40 kropek, suma 240, 1,5 s).
- **Reguły §3:** ✗ `timeoutMove` → **Z1 (W8a, wysoka)**; kopia szkieletu → Z19 (W8c). **Testy:** → Z4 (KR1), Z5 (KR2), Z6 (KR4), Z7 (KR3), Z9 (KR5), Z10 (KR6). **Ekran końcowy:** ze stanu.

#### Kąt (`kat`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :160; ✓ `KONCEPT.md` :122. Stałe zgodne (5-175°, 0-180, limit = najgorszy błąd); trudność z losowania → Z3 (W8b).
- **Reguły §3:** ✓; kopia szkieletu → Z19 (W8c). **Testy:** komplet §2. **Ekran końcowy:** ze stanu.

#### Sudoku (`sudoku`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :547; ✓ `KONCEPT.md` :123. Stałe zgodne (4×4, 6 danych, jedno rozwiązanie, kara 5 s).
- **Reguły §3:** ✗ `timeoutMove` → **Z1 (W7a, wysoka)**. **Testy:** komplet §2 (test :216 nie sprawdza wyniku z karą ponad limit, Z1). **Ekran końcowy:** ze stanu; W8.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| W8. Klucz rewanżu to sama plansza, bez `nonce` | `apps/web/src/games/MiniGame.tsx:297` (`key={puzzle.join()}`) | `ZASADY.md` §3 (pole odróżniające partie) | niska | `nonce` w stanie, albo komentarz; `keys2.ts`: 6 powtórzeń na 2000 seedów |

#### Trzy kubki (`kubki`), 01-09-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :253; ✓ `KONCEPT.md` :124. Stałe zgodne (20 rund, 4 + r zamian, 500 → 150 ms).
- **Reguły §3:** ✓; nazwa funkcji → Z19 (KB1). **Testy:** komplet §2 i zasad sekcji. **Ekran końcowy:** ze stanu.

#### Który rok? (`rok`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :173; ✓ `KONCEPT.md` :125. Stałe zgodne (10 rund, 1900-2025, 165 wydarzeń, 20 s rundy, 240 s).
- **Reguły §3:** ✓ (225 s z 240 s); kopia szkieletu → Z19 (W8c). **Testy:** → Z9 (RK1). **Ekran końcowy:** ze stanu.

#### Środek (`srodek`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :189; ✓ `KONCEPT.md` :126. Stałe zgodne (10 rund, 0,5-0,9, strefa 60 px, limit 10 × 100%).
- **Reguły §3:** limit tury do pomiaru → Z2 (SR1, średnia); reszta ✓. **Testy:** → Z6 (SR2), Z9 (SR3). **Ekran końcowy:** ze stanu.

#### Stój! (`stoj`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :214; ✓ `KONCEPT.md` :127. Stałe zgodne (30 s, 1000 → 500 ms, 14 czerwonych, −2 za błąd).
- **Reguły §3:** ✓ poza → Z13 (SJ1); kara punktowa to odstępstwo z powodem (§5). **Testy:** komplet §2; zasada sekcji: SJ2. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SJ2. Widoczność bodźca 0,6 odstępu bez testu | `packages/games/src/stoj.ts:9` (`VISIBLE`, używa tylko `Stoj.tsx:55`) | `ZASADY-GIER.md` :216 | niska | `expect(VISIBLE).toBe(0.6)` |

#### Śledzenie (`sledzenie`), 01-09-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :231; ✓ `KONCEPT.md` :128. Stałe zgodne (20 rund, 8 kulek, 3 cele, tempo 0,3 + 0,06).
- **Reguły §3:** ✓. **Testy:** komplet §2; zasada sekcji: SL1. **Ekran końcowy:** ze stanu; eksport stałych: W10.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SL1. Ta sama prędkość kulek i odstęp 0,14 sprawdzone słabiej niż w dokumencie | `sledzenie.test.ts:45-48`, `:113`, `:128`; kod `packages/games/src/sledzenie.ts:25`, `:54` | `ZASADY-GIER.md` :236, :242, D-03 | średnia | prędkość każdej kulki osobno; próg `≥ 0.14` |
| W10. Stałe eksportowane bez przedrostka gry | `packages/games/src/index.ts:104` (`BALLS`, `ROUNDS`, `SHOW_MS`…) | `ZASADY.md` §6 pkt 3 | niska | `SLEDZENIE_*` |

#### Wieża (`wieza`), 01-09-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :272; ✓ `KONCEPT.md` :129. Stałe zgodne (30 pięter, 0,4, `SNAP` 0,02, 5 s spadku). **Reguły §3:** ✓ (151 s z 180 s). **Testy:** komplet. **Ekran końcowy:** ze stanu.

#### Rytm (`rytm`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :298; ✓ `KONCEPT.md` :130. Stałe zgodne (8 uderzeń, 10 s, 70-130 BPM); trudność z losowania → Z3 (W6a).
- **Reguły §3:** ✓. **Testy:** komplet. **Ekran końcowy:** częściowo ze stanu lokalnego → Z16.

#### Inny element (`inny`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :321; ✓ `KONCEPT.md` :131. Stałe zgodne (siatka 2×2 → 6×6, komplety rodzajów, zanikanie do 16).
- **Reguły §3:** ✓ poza → Z13. **Testy:** → Z7 (IN1), Z14. **Ekran końcowy:** ze stanu.

#### Obrót (`obrot`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :342; ✓ `KONCEPT.md` :132. Stałe zgodne (4 → 7 klocków, chiralność, kara punktowa).
- **Reguły §3:** ✓ poza → Z13; kara punktowa odstępstwem z powodem (§5). **Testy:** → Z7 (OB1), Z14. **Ekran końcowy:** ze stanu.

#### Literówka (`literowka`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :361; ✓ `KONCEPT.md` :133. Stałe zgodne (181 par, 45 plansz bez powtórzeń).
- **Reguły §3:** ✓ poza → Z13. **Testy:** → Z7 (LT1), Z14. **Ekran końcowy:** ze stanu.

#### Mapa (`mapa`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :375; ✓ `KONCEPT.md` :134. Stałe zgodne (10 z 62 miast, haversine, 10 × 1000 km). **Reguły §3:** ✓. **Testy:** komplet. **Ekran końcowy:** ze stanu.

#### Przytrzymaj (`przytrzymaj`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :395; ✓ `KONCEPT.md` :135. Stałe zgodne (5 rund, cele 1-5 s o sumie 15 s). **Reguły §3:** ✓ (57,5 s z 120 s). **Testy:** komplet. **Ekran końcowy:** ze stanu.

#### Balon (`balon`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :410; ✓ `KONCEPT.md` :136. Stałe zgodne (10 balonów, 1-30, suma 155). Dokument: BL1.
- **Reguły §3:** ✓. **Testy:** komplet. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| BL1. Uzasadnienie ukrycia punktów rywali nie pasuje do widoku | `ZASADY-GIER.md` :423 ↔ `packages/games/src/balon.ts:36-37`, `:71` | `ZASADY-GIER.md` §1 :53-54 | niska | „zdradzałyby na ekranie…” |

#### W pamięci (`w-pamieci`), 01-09-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :428; ✓ `KONCEPT.md` :137 (lista drugich kryteriów → Z20). Stałe zgodne (12 rund, 2-13 działań, 1-99); trudność z losowania → Z3 (W9a).
- **Reguły §3:** ✓. **Testy:** komplet §2; zasada sekcji: WP1. **Ekran końcowy:** ze stanu.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| WP1. „Każda runda to nowy ciąg” bez testu | `w-pamieci.test.ts:63`; kod `packages/games/src/w-pamieci.ts:62` | `ZASADY-GIER.md` :431 | średnia | test: runda nie zaczyna się ciągiem poprzedniej |

#### Dziesiątki (`dziesiatki`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :444; ✓ `KONCEPT.md` :138. Stałe zgodne (4×4, 1-9, 400 liczb dostaw, zawsze para).
- **Reguły §3:** ✓ poza → Z13. **Testy:** → Z7 (DZ1), Z14. **Ekran końcowy:** ze stanu.

#### Tort (`tort`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :459; ✓ `KONCEPT.md` :139. Stałe zgodne (5 tortów, 3-7 kawałków raz). **Reguły §3:** ✓. **Testy:** → Z9 (TR1). **Ekran końcowy:** ze stanu.

#### Za zasłoną (`zaslona`), 01-06-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :499; ✓ `KONCEPT.md` :140. Stałe zgodne (8 rund, 0,8-2 s, suma 20 s). **Reguły §3:** ✓. **Testy:** komplet. **Ekran końcowy:** ze stanu.

#### Zakupy (`zakupy`), 01-07-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :479; ✓ `KONCEPT.md` :141. Stałe zgodne z dokumentem (10 z 20, 10 s, 50 s, 60 s), ale limit bez zapasu wbrew §3.
- **Reguły §3:** ✗ limit tury → **Z2 (ZK1, wysoka)**. **Testy:** komplet §2 (test :42 utrwala ZK1). **Ekran końcowy:** ze stanu.

#### Nożyczki (`nozyczki`), 01-08-FINDINGS.md
- **Zasady:** ✓ `ZASADY-GIER.md` :524; ✓ `KONCEPT.md` :142. Stałe zgodne (5 kształtów, `MIN_CUT`, `MIN_PART`, 5 × 50). **Reguły §3:** ✓. **Testy:** → Z9 (NZ1). **Ekran końcowy:** ze stanu.

### 6.9 Państwa-miasta (`panstwa-miasta`), szczegóły: 01-05-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §5 :629; opis ✓ `KONCEPT.md` §2.5 :162-169. Stałe zgodne (5 rund, litery, 90/7/45/20 s, 15/10/5/0); komentarz w kodzie: PM10.
- **Reguły §3:** ✓ wszystkie (`fuzz05.ts`: 600 partii, punkty przeliczone niezależnie). Podpięcie → Z17 (W1).
- **Testy:** → Z4 (PM1), Z5 (PM2), Z6 (PM3), Z7 (PM4), Z8 (PM5), Z9 (PM6), Z10 (PM9), Z11 (PM8); ukryty stan: PM7.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| PM7. Ukrywanie głosów bez testu | `panstwa-miasta.test.ts:140`; kod `packages/games/src/panstwa-miasta.ts:137-138` | `ZASADY-GIER.md` §5 :643, `ZASADY.md` §2 :70-71 | średnia | widok B i `""` bez głosu A w głosowaniu, wszystkie głosy w podsumowaniu |
| PM10. Komentarz przy `LETTERS` pomija Ć | `panstwa-miasta.ts:5` | `KONCEPT.md` §2.5 :164 | niska | dopisać Ć |

### 6.10 Turniej (`turniej`), szczegóły: 01-05-FINDINGS.md

- **Zasady:** sekcja ✓ `ZASADY-GIER.md` §8 :765; opis ✓ `KONCEPT.md` §2.6 :171-181. Stałe zgodne (`MIN_LENGTH` 3, `DEFAULT_LENGTH` 8, `NEXT_SECONDS` 15, punkty, dogrywka, `TOURNAMENT_ID`).
  Zasada tylko w kodzie → Z18 (T1). Kontrakt `GameDefinition` nie obowiązuje; reguły pokoju poza zakresem (D-15).
- **Reguły §3:** ✓ w zakresie, który dotyczy turnieju (`fuzz05.ts`: 3000 turniejów, 0 błędów; tylko `rng`, nowe obiekty, punkty z `places`).
- **Testy:** → Z4 (T2); reszta punktów w zakresie bez `GameDefinition` pokryta.

## 7. Załącznik: dowód hurtowy i granice dowodu

`01-01-CHECKS.md`: skrypt `checks.ts` (załącznik A tam) na 46 przypadkach gra × tryb, z kontrolą na pięciu celowo zepsutych kopiach Gomoku (załącznik B), oraz mapa pokrycia
`index.test.ts` gra × punkt §2 (§4.2). Granice dowodu z tego pliku, nadal ważne:
- Same `timeoutMove` nie dochodzą do części faz (Kampus Tour `build`, `buyout`, `sell`, `juwenalia`; ścianki w Labiryncie); te fazy sprawdziły `fuzz.ts` (01-03) i `fuzz04.ts` (01-04).
- `index.test.ts` nie sprawdza mutacji, round-tripu, świeżej gry, kto zaczyna, ruchu z innej fazy ani ruchu spoza partii po końcu (źródło Z4-Z10; tam też propozycja domknięcia w jednym miejscu, D-04).
- W Stoperze, Który rok?, Kącie i Rytmie najgorszy wynik po limicie zależy od losowania (sufit stały); ocenione w Z3 i Z1.

## 8. Kryteria sukcesu fazy 1 → sekcje

| Kryterium | Sekcja, która je spełnia |
|---|---|
| 1. Każda gra: sekcja w `ZASADY-GIER.md`, opis w `KONCEPT.md` §2, każda niezgodna stała z miejscem w kodzie i dokumencie | §6, pierwszy punkt „Zasady” każdej z 38 gier i Turnieju (✓ z linią nagłówka i linią opisu); niezgodne stałe: Z3 (LC1, „po równo” w Liczeniu), Z1 i Z2 (stałe zgodne z dokumentem, ale wbrew §3); rozbieżności dokumentów: K3, K4, K5, RF1, BL1, PM10, Z15, Z20; zasady tylko w kodzie (D-07): K1, K2, K11, KL1, Z18. Pełne tabele stałych: pliki 01-03..01-09 |
| 2. Każde odstępstwo od §3 z `plik:linia` i informacją, czy `ZASADY-GIER.md` podaje powód | §2 (Z1, Z2: bez powodu), §4 (Z3, Z13, Z19: bez powodu), G1 (bez powodu), §5 „Odstępstwa z powodem” (z powodem); punkt „Reguły §3” każdej gry w §6; dowód hurtowy §7 i 01-01-CHECKS.md §2-3 |
| 3. Dla każdego `<gra>.test.ts` lista brakujących testów obowiązkowych §2 | punkt „Testy” każdej gry w §6 (odsyłacze do Z4-Z12 i wpisy pojedyncze: K7-K9, K13-K15, K20, C4, L1, L2, M1, KL3, PM7, SC7, LC2, KO9, SJ2, SL1, WP1); gry z kompletem wymienione w §1; mapa pokrycia testów kontraktowych: 01-01-CHECKS.md §4.2 |
| 4. Tabela podpięć §6 z zaznaczonymi lukami | §3 (38 wierszy × kolumny §6, luki: Z17 w wierszach `panstwa-miasta` i `kalambury`; pozostałe wpisy podpięcia W6, W8, W10, Z21) |
| 5. Dla każdej mini-gry: ekran końcowy z samego stanu, zależności od stanu lokalnego z `plik:linia` | §3, ostatnia kolumna (30 mini-gier, gałąź końcowa z linią) i Z16 (Stoper, Rytm z `plik:linia` stanu lokalnego); punkt „Ekran końcowy” każdej mini-gry w §6.8 |

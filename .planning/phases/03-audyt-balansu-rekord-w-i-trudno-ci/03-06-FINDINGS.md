# 03-06 FINDINGS: mini-gry na trafienia

**Data:** 2026-10-24 · **Plan:** 03-06 (fala 2) · **Gry:** `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `schulte`, `sudoku`, `zakupy`.
Liczby z `03-01-CHECKS.md`, model i progi z `03-02-BASELINE.md`. Pewność: **W** wyliczone, **Z** zmierzone, **A** założenie. Repo poza `.planning/` bez zmian.

## Kolor liter (`stroop`)

Wspólne dla sześciu quizów (D-13, opisane raz tutaj): `packages/games/src/quiz.ts` (30 s, `:6`; odpowiedź 150-5000 ms, `:7-8`; 200 plansz w stanie, `:10`; suma czasów ≤ 30 s, `:31`),
blokada 1 s po pomyłce (`apps/web/src/games/Quiz.tsx:33`), `byHitsThenAverage` / `byScoreThenAverage` z `tie` = średnia zaokrąglona do ms. Limit 90 s.
- **Sufit puli:** 200 plansz wymaga 150 ms na planszę, więc puli nie da się wyczerpać (W). Sufit praktyczny wynika z czasu na planszę (BASELINE §2).
- **Limit:** T = 30 s + 3 s sieci = 33 s; L = 90 s, zapas 57 s (173%). Zgodne dla wszystkich sześciu quizów (`stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`).
- **`tie`:** średnia całkowitych ms; przy wynikach ok. 700-2000 ms i rozrzucie dziesiątek ms równość co do ms jest rzadka (A). Klucz F1 `tie-zaokraglenie` dostaje wagę niską i rekomendację zostawić.

**Do zdobycia (REC-01)**
- Każda czwórka plansz ma dokładnie jedną zgodną (`packages/games/src/stroop.ts:35-38`): 10 zgodnych na 40 plansz w każdej partii (Z, 0%). Zgodne z `ZASADY.md` :102 (wzorzec wprost wymieniony).
- Kolory liter i słowa w planszach niezgodnych losowane swobodnie; wszystkie niezgodne są tak samo trudne (A). Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit praktyczny ok. 35-45 trafień (0,7-0,9 s na planszę, A). Remisy w trafieniach częste, rozstrzyga `tie` (`:50`). Ryzyko remisu całkowitego niskie.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak wyżej: zapas 173%. Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Liczenie (`liczenie`)

**Do zdobycia (REC-01)**
- Rodzaj działania losowany osobno (`packages/games/src/liczenie.ts:32`): w pierwszych 40 pytaniach dodawania jest 4-21, odejmowania 1-20, mnożenia 1-19, dzielenia 1-18 (każdy rodzaj ok. 26% rozrzutu, Z).
  Przyjmując ok. 1,5 s na tabliczkę i dzielenie oraz 2,5 s na dwucyfrowe dodawanie i odejmowanie (A), udział trudnych (p5-p95: 15-25 z 40) zmienia średni czas na pytanie z 1,87 do 2,13 s,
  czyli **ok. 2 trafienia różnicy (ok. 13%) przy tej samej umiejętności** (W z założenia). Potwierdza F1:LC1.
- Rozbieżność z dokumentem: `ZASADY-GIER.md` :112 mówi „po równo z czterech typów”, a kod losuje każde pytanie osobno.

**Sufit i remisy (REC-02, REC-03)**
- Sufit praktyczny ok. 12-20 trafień (A). Jak w Kolorze liter. Bez wpisu.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Kolorze liter. Zgodne.

**Rekomendacja:** zmienić (komplety rodzajów, tanio).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-LC1 (F1:LC1, F1:Z3) | `packages/games/src/liczenie.ts:32`; `ZASADY-GIER.md` :112 | `ZASADY.md` §3 :102, `ZASADY-GIER.md` §Liczenie | średnia | rodzaje działań potasowanymi czwórkami (jak `stroop.ts:35`); przy wyniku równym `a` albo `b` losować od nowa tylko liczby, nie rodzaj `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (czasy działań) |

## Inny element (`inny`)

**Do zdobycia (REC-01)**
- Rodzaje różnicy potasowanymi kompletami (`packages/games/src/inny.ts:51`): obrót, odcień i rozmiar po 7-8 w pierwszych 24 planszach, kształt dokładnie 2 (Z). Zgodne z `ZASADY.md` :102.
  Rozrzut 7-8 wynika z kompletów 4, a potem 3 (granica komplety nie zawsze trafia w 24). Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit praktyczny ok. 10-20 trafień (szukanie na siatce 36 pól: 1,5-3 s, A). Jak w Kolorze liter. Bez wpisu.

**Krzywa trudności (DIFF-01)** (W, `inny.ts:5-14`, `:34`, `:55-56`)

| plansza (= trafienia) | siatka | obrót | jasność | rozmiar |
|---|---|---|---|---|
| 0 | 2×2 | ±40° | ±20 | ±20 |
| 4 | 4×4 | ±32° | ±16 | ±18 |
| 8 | 6×6 | ±24° | ±13 | ±15 |
| 12 | 6×6 | ±16° | ±9 | ±13 |
| 16 i dalej | 6×6 | ±8° | ±5 | ±10 (12,5% z 80) |

- Najmniejsze różnice (8° obrotu trójkąta, 5 punktów jasności HSL, 12,5% rozmiaru) są powyżej progów rozróżniania (A: orientacja 1-2°, rozmiar ok. 5%), więc gra nie staje się niemożliwa.
  Od planszy 16 jest płaska, a dobry gracz tam dochodzi (A), więc końcówka różnicuje szybkością szukania na 6×6. Krzywa zgodna, bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Kolorze liter. Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Obrót (`obrot`)

**Do zdobycia (REC-01)**
- Lustro losowane `rng() < 0,5` na parę (`packages/games/src/obrot.ts:68`): w pierwszych 40 parach 8-29 luster (rozrzut 16%, Z). Kąt losowany osobno (`:72`): obrotów o 180° 5-25 na 40 (22%),
  suma kątów 5400-8550° (6,8%, Z). Rotacja mentalna rośnie ok. 2-4 ms/° (A): różnica p5-p95 sumy kątów (1620° na 40 par) to ok. 5 s na 40 par,
  czyli przy ok. 15-20 parach dobrego gracza w 30 s ok. 1-1,5 trafienia (ok. 8%, W z założenia).

**Sufit i remisy (REC-02, REC-03)**
- Wynik trafienia − pomyłki (`quiz.ts` `netScore`), sufit praktyczny ok. 15-20 (A). Jak w Kolorze liter. Bez wpisu.

**Krzywa trudności (DIFF-01)**
- Klocki 4 → 7, +1 co 3 pary, od pary 9 zawsze 7 (`:5-7`). Rośnie przez pierwsze 9 par (ok. 15-25 s gry), potem płasko. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Kolorze liter. Zgodne.

**Rekomendacja:** zmienić (komplety kątów i luster, tanio).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-OB1 | `packages/games/src/obrot.ts:68`, `:72` | `ZASADY.md` §3 :102 | średnia | lustro i kąt potasowanymi kompletami (np. szóstki: 90 / 180 / 270 × ta sama / lustro); figury z symetrią 180° dostają w komplecie 90 albo 270 `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (wpływ) |

## Literówka (`literowka`)

**Do zdobycia (REC-01)**
- Talia 181 par tasowana (`packages/games/src/literowka.ts:38`), w pierwszych 45 planszach 0 powtórzeń (Z). Rodzaj błędu wynika z tasowania: ó/u 6-22, rz/ż 6-24, ch/h 8-25 na 45 (ok. 18% rozrzutu, Z).
  Średnia długość błędnego słowa 5,6-6,8 liter (2,8%, Z). Czy rodzaje różnią się trudnością, nie wiadomo (A).

**Sufit i remisy (REC-02, REC-03)**
- Sufit praktyczny ok. 12-20 plansz w 30 s (A); pula 45 plansz bez powtórzeń wystarcza z zapasem. Jak w Kolorze liter. Bez wpisu.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Kolorze liter. Zgodne.

**Rekomendacja:** sprawdzić w partii, czy któryś rodzaj błędu jest wyraźnie wolniejszy. Jeśli tak, komplety rodzajów (B-LT1).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-LT1 | `packages/games/src/literowka.ts:38-39`, `literowka-dane.ts` (pary w trzech grupach w komentarzach) | `ZASADY.md` §3 :102 | niska | rodzaj błędnego słowa kompletami (ó/u, rz/ż, ch/h po kolei w tasowanych trójkach); wymaga pola z rodzajem w danych | sprawdzić w partii | Z (rozrzut), A (wpływ) |

## Dziesiątki (`dziesiatki`)

**Do zdobycia (REC-01)**
- Plansza startowa i dostawy cyfr 1-9 losowane osobno (`packages/games/src/dziesiatki.ts:48-58`). Przy tej samej strategii (gracz bierze pierwszą znalezioną parę) średnia liczba par na planszy w 40 ruchach
  to **4,4-19,7, mediana 8,6 (rozrzut 30%, Z)**, a ruchów z jedną jedyną parą na planszy 0-10 (Z). Im więcej par, tym szybsze szukanie (A), więc partia z „dobrymi” dostawami daje więcej trafień.
  To największy rozrzut miary trudności w grupie. Plansza zależy też od wyborów gracza, więc liczba to cecha partii przy jednej strategii, nie gwarancja (03-01 §2).

**Sufit i remisy (REC-02, REC-03)**
- Pula 400 dostaw starcza przy 150 ms na parę (W). Sufit praktyczny ok. 15-25 par (A). Jak w Kolorze liter. Bez wpisu.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Kolorze liter. Zgodne.

**Rekomendacja:** zmienić dostawy tak, żeby gęstość par była stała, i sprawdzić w partii skalę efektu.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-DZ1 | `packages/games/src/dziesiatki.ts:48-58`, `take` (`:27-33`) | `ZASADY.md` §3 :100 | średnia | dostawy z kompletów cyfr (np. tasowane dziewiątki 1-9, w których pary 1-9, 2-8, 3-7, 4-6, 5-5 mają stały udział) albo `take` pilnujący stałej liczby par na planszy (np. dokładnie 2) zamiast „co najmniej 1” `[zbiorcze: trudnosc-z-losowania]` | zmienić, sprawdzić w partii | Z (rozrzut), A (wpływ) |

## Tabela Schultego (`schulte`)

**Do zdobycia (REC-01)**
- Układ 1-25 `shuffle` (`packages/games/src/schulte.ts:45`). Droga oczu 1→25 to 45-77 pól (rozrzut 7,6%, Z), ale szukanie kolejnej liczby to przeszukiwanie całej siatki, a nie przejście od poprzedniej (A),
  więc wpływ odległości jest mały. Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Wynik ciągły w ms + 3 s za pomyłkę (`:6`, `:71`), sufit praktyczny ok. 15-25 s (A). Remisy niskie, `tie` niepotrzebne.
- F2:U31 / SC1: kara jest całkowitą wielokrotnością 3 s, a `ms` całkowite, więc wynik zawsze jest liczbą całkowitą; kropka dziesiętna w ekranie to sprawa F2, nie balansu. Bez wpisu.
- `timeoutMove` = 180 000 ms bez kar (`:75`): wynik wolnego gracza z dużą karą może być gorszy od limitu (F1:W7a, faza 4). Tu tylko liczba: potrzeba ponad 180 s z karami, czyli np. 60 s gry i 40 pomyłek. Bez nowego wpisu.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 25 × 3 s (wolny gracz) + 3 s = 78 s (W z A). L = 180 s, zapas 102 s (131%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Sudoku (`sudoku`)

**Do zdobycia (REC-01)**
- Plansza z 10 pustymi polami i jednym rozwiązaniem (`packages/games/src/sudoku.ts:58-80`), ale jej trudność się zmienia: pól z jednym kandydatem na starcie jest **1-7, mediana 3 (rozrzut 36%, Z)**,
  a fal samych pojedynczych kandydatów do końca 2-5 (24%, Z). Plansza z jednym polem „od razu” wymaga dłuższego wnioskowania niż plansza z siedmioma (A).
  W grze na czas, gdzie wynik to kilkanaście sekund, różnica w planszy dominuje (A).

**Sufit i remisy (REC-02, REC-03)**
- Wynik ciągły (ms + 5 s za pomyłkę, `:9`, `:108`), sufit praktyczny ok. 8-15 s (A). Remisy niskie. SC1: kara całkowita, jak w Schultem. `timeoutMove` = 120 000 ms bez kar (`:112`, F1:W7a).

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 10 × (4 s pole i cyfra + 4 s myślenia) + 3 s = 83 s (W z A). L = 120 s, zapas 37 s (45%). Zgodne.

**Rekomendacja:** zmienić (losowanie do skutku planszy o stałej trudności).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SU1 | `packages/games/src/sudoku.ts:64-80` | `ZASADY.md` §3 :100 | średnia | w `makePuzzle` losować do skutku planszę o stałej liczbie fal pojedynczych kandydatów (np. 3) i stałej liczbie pól „od razu” (np. 3); koszt kilka prób na partię `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (wpływ) |

## Zakupy (`zakupy`)

**Do zdobycia (REC-01)**
- 10 przedmiotów z listy i 10 innych z puli `ITEMS` (`packages/games/src/zakupy.ts:59-60`). Trudność zależy od podobieństwa przedmiotów (np. dwa owoce na liście i trzy na półce), czego nie da się policzyć ze stanu (A). Bez wpisu, do partii.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 10 pkt (W). To pamięć rozpoznawcza (półka pokazuje przedmioty, nie trzeba ich przypominać), która dla 10 obrazków po 10 s jest prawie bezbłędna (A).
  **Wielu graczy będzie miało 10**, a wtedy o kolejności decyduje tylko `tie` = czas zaznaczania w ms (`:81`), czyli szybkość klikania. Wynik ciągły, więc remisów całkowitych nie ma,
  ale gra na szczycie mierzy coś innego niż w opisie. Dokładność tego czasu osłabia „Gotowe” na `onClick` (F2:ZK1).

**Krzywa trudności (DIFF-01)**
- Bez progresji (jedna runda). Bez wpisu.

**Limit tury (DIFF-02)**
- Zasady pozwalają zaznaczać do 50 s (`MAX_MS`, `:9`), a klient nie oddaje sam po 50 s (F1:ZK1). T = 10 s pokazu + 50 s + 3 s sieci = 63 s (W). L = 60 s (`:37`): **zapas −3 s**.
  Potwierdza F1:ZK1 (wysoka). Wolny, ale nie skrajny gracz (10 × 3 s) mieści się w 43 s, więc problem dotyczy tych, którzy korzystają z całego dozwolonego czasu.

**Rekomendacja:** zmienić limit (tanio) i sprawdzić w partii, jak często pada 10.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-ZK1 (F1:ZK1, F1:Z2) | `packages/games/src/zakupy.ts:8-9`, `:37`; `zakupy.test.ts:42-45`; `ZASADY-GIER.md` :492 | `ZASADY.md` §3 :106 | **wysoka** | `turnSeconds` 75 s (zapas 12 s, 19%) albo 80 s, ekran oddaje sam po `MAX_MS`; najpierw test i dokument `[zbiorcze: limit-tury-bez-zapasu]` | zmienić | W |
| B-ZK2 | `packages/games/src/zakupy.ts:5-6`, `:81` | D-05 (sufit osiągalny) | średnia | jeśli partie pokażą częste 10: dłuższa lista (12-14) albo dobieranie podobnych przedmiotów na półkę, żeby wynik mierzył pamięć, a nie szybkość klikania `[zbiorcze: sufit-osiagalny]` | sprawdzić w partii | A |

## Podsumowanie grupy

| gra | REC-01 | REC-02/03 | DIFF-01 | DIFF-02 | rekomendacja |
|---|---|---|---|---|---|
| `stroop` | ✓ | ✓ | bez progresji | ✓ 173% | zostawić |
| `liczenie` | B-LC1 średnia | ✓ | bez progresji | ✓ | zmienić |
| `inny` | ✓ | ✓ | ✓ (płasko od 16) | ✓ | zostawić |
| `obrot` | B-OB1 średnia | ✓ | ✓ | ✓ | zmienić |
| `literowka` | B-LT1 niska | ✓ | bez progresji | ✓ | sprawdzić w partii |
| `dziesiatki` | B-DZ1 średnia | ✓ | bez progresji | ✓ | zmienić |
| `schulte` | ✓ | ✓ (F1:W7a) | bez progresji | ✓ 131% | zostawić |
| `sudoku` | B-SU1 średnia | ✓ (F1:W7a) | bez progresji | ✓ 45% | zmienić |
| `zakupy` | do partii | B-ZK2 średnia | bez progresji | **B-ZK1 wysoka** | zmienić |

Wpisy: wysokie 1, średnie 5, niskie 1.

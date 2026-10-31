# 03-02 BASELINE: model czasu, progi ludzkie, wzorce i szablon

**Data:** 2026-10-24 · **Plan:** 03-02 (fala 1) · Punkt odniesienia dla planów 03-03..03-08: oceny limitu, sufitu i krzywej liczy się względem tego pliku, nie każdy od zera (D-07, D-05, D-06).
Etykiety: **wyliczone** (ze stałych w kodzie), **zmierzone** (symulacja, baza), **założenie** (wartość przyjęta tu, do poprawy, jeśli plan gry pokaże inaczej; wtedy plan to opisuje).
Repo poza `.planning/` bez zmian.

## 1. Model czasu

### 1.1 Jak działa limit (wyliczone, `apps/server/src/LobbyRoom.ts`)

- **Start.** Mini-gra (`minPlayers === 1`) zaczyna się od ekranu instrukcji; limit nie tyka (`:344-352`). Kończy go „Start” wszystkich graczy z miejscem (`begin`, `:169-173`)
  albo `INTRO_SECONDS = 15` (`packages/games/src/lobby.ts:11`); wtedy `endIntro` uruchamia limit (`:355-359`). Gra główna startuje limit od razu (`:345`).
  Każdy gracz zaczyna grać po swoim „Start”, więc szybki gracz ma przed startem limitu nawet do 15 s gry „za darmo”, a ostatni klikający zero. **Najostrzejszy przypadek to ostatni klikający albo gra solo.**
- **Odnawianie.** `play` (`:361-377`): gra z `turn()` odnawia limit tylko przy zmianie `key` (`:369-371`); gra bez `turn()` przy zmianie `waitingFor` albo gdy czekamy na jedną osobę (`:375-376`).
  Skutki dla mini-gier:
  - gry z `turn: () => ({ key: "run" })` (`balon.ts:45`, `kropki.ts:52`, `kat.ts:45`, `sudoku.ts:86`, `rok.ts:216`, `schulte.ts:37`, `wieza.ts:72`): **jeden limit od startu dla wszystkich**, ruchy `progress` i wyniki rywali go nie odnawiają,
  - pozostałe mini-gry (bez `turn()`, wszyscy grają naraz): gdy ktoś odda wynik, `waitingFor` się zmienia i **reszta dostaje pełny limit od nowa**; `kolo.ts:154` (`key: waiting.join()`) działa tak samo.
    W grze wieloosobowej wolny gracz ma więc więcej czasu niż solo; ocena zapasu liczy przypadek solo.
- **Po limicie** `timeoutMove` za każdego, na kogo czekamy (`:432-449`), a późniejszy wynik klienta odpada w `validateMove` (`!(player in state.results)`). Błąd w `timeoutMove` kończy partię bez zwycięzcy (`:444-447`).

### 1.2 Najdłuższa uczciwa partia

`T = Σ czasy stałe + Σ decyzje wolnego gracza + sieć`. Wymagany limit (D-07): **`L ≥ 1,2 · T` i `L ≥ T + 10 s`**. Zapas podaje się w s i w %.

**Czasy stałe** (wyliczone): z `03-01-CHECKS.md` §1, w tym czasy klienta (wstęp, pokaz, odsłona, pauza, animacja). Odsłona „do kliknięcia” (`Szacowanie.tsx`, `WPamieci.tsx`, `Kolor.tsx`) liczy się jako decyzja „Dalej”.

**Decyzje wolnego, ale uczciwego gracza** (założenie; ok. 2× typowego czasu dorosłego, bez przerw na rozmowę):

| akcja | czas | przykłady |
|---|---|---|
| dotknięcie bodźca, który właśnie się pojawił | 1 s | Kubki (wskazanie), Balon (jedno stuknięcie: 0,3 s) |
| wybór jednego z kilku pól na planszy | 2 s | Śledzenie (3 wskazania = 6 s), Sudoku (pole + cyfra = 4 s) |
| wpisanie liczby 1-3 cyfr i zatwierdzenie | 4 s | Policz kropki, Kąt, W pamięci |
| ustawienie suwaka | 5 s | Odcień (3 suwaki = 15 s), Który rok? (do limitu rundy 20 s) |
| postawienie i poprawienie znacznika, cięcia, punktu | 5 s | Mapa, Środek, Tort (na każde cięcie), Nożyczki |
| narysowanie koła palcem | 4 s | Narysuj koło (próba) |
| przycisk „Dalej” / „Następna runda” po odsłonie | 2 s | Szacowanie, W pamięci, Odcień |
| znalezienie i zaznaczenie przedmiotu z listy | 3 s | Zakupy (10 przedmiotów = 30 s, ale gra ma własny limit 50 s) |

**Sieć** (założenie): 3 s na wysłanie wyniku na słabym Wi-Fi z ponownym połączeniem; ruchy `progress` się nie liczą (nie są potrzebne do wyniku).

**Gra z wewnętrznym limitem** (quizy 30 s, Stój! 30 s, Rytm 10 s, Zakupy 50 s, Który rok? 20 s na rundę): `T` = limit wewnętrzny + czasy stałe + sieć; decyzji nie dolicza się ponad limit wewnętrzny.

### 1.3 Gra bez sufitu: „limit ucina partię od wyniku X”

Sekwencja (wyliczone ze stałych `Simon.tsx:21-22`, `:61-64`; d = czas wpisania jednego koloru, założenie):
runda n trwa `0,6 + 0,6·n + d·n + 0,4 s` (odtwarzanie, wpisywanie, przerwa przed następną; 0,4 s według F1:Z2), więc seria N kosztuje `N + (0,6 + d) · N(N+1)/2` s.

| d (s na kolor) | pierwsza seria, którą 300 s ucina | najdłuższa seria z zapasem (1,2 × T ≤ 300 s) |
|---|---|---|
| 0,35 (szybki gracz, F1:SQ1) | 24 (T = 309 s) | 21 (T = 240 s) |
| 0,5 | 22 (T = 300,3 s) | 19 (T = 228 s) |
| 0,7 | 21 (T = 321 s) | 18 (T = 240 s) |

Wzór ogólny: znaleźć najmniejsze X, dla którego `T(X) > L`; porównać X z wynikiem dobrego gracza z §2 (Sekwencja: 9-12 typowo, 15-20 dobrzy, założenie). Jeśli X leży w zasięgu dobrych graczy, wpis jest wysoki (D-09).

### 1.4 Gry turowe (60 s na ruch)

Najdłuższa uczciwa tura = animacje, w czasie których gracz nie może działać (F2:U2: marsz pionka do 12 × `STEP_MS`, rzut `ROLL_MS`) + decyzje w turze (każda 5 s, założenie; Kampus Tour: kupno, budowa, Juwenalia, karta) + sieć 3 s.
Ten sam wymóg zapasu (≥ 20% i ≥ 10 s). Limit odnawia się, gdy ten sam gracz ma kolejny ruch (`:375-376`), więc dublet i strzał po trafieniu liczą się jako nowe tury.

## 2. Progi ludzkie

Wartości to ogólnie znane wyniki psychologii i ergonomii, wszystkie z etykietą **założenie** (nie mierzone w tych grach). Dotyk na telefonie dokłada 50-100 ms opóźnienia ekranu i czujnika (założenie, zależne od telefonu).

| próg | wartość | źródło (ogólnie) | użycie |
|---|---|---|---|
| prosty czas reakcji wzrokowej | 200-250 ms (najlepsi ok. 170 ms), na telefonie mierzone 250-330 ms | klasyczne pomiary czasu reakcji | Refleks: średnia z 12 poniżej ok. 200 ms praktycznie nieosiągalna; sufit praktyczny ok. 200-230 ms |
| reakcja go / no-go | 300-400 ms, błędy rosną przy odstępie poniżej ok. 500 ms | zadania hamowania reakcji | Stój!: okno 500 ms na końcu (`stoj.ts:7`) w zasięgu, ale na granicy |
| wybór z 4 (prawo Hicka) | 450-600 ms, Stroop niezgodny + ok. 100 ms | prawo Hicka-Hymana, efekt Stroopa | quizy: dobry gracz 0,7-0,9 s na planszę, ok. 35-40 trafień w 30 s; bardzo dobry ok. 45 |
| proste działanie w pamięci (2 liczby) | 1,5-3 s (tabliczka szybciej niż dzielenie) | badania arytmetyki umysłowej | Liczenie: 10-20 trafień; rodzaj działania zmienia czas |
| odczyt 4 słów i wskazanie błędu | 1,5-2,5 s | szybkość czytania ok. 4-5 słów/s + decyzja | Literówka: ok. 12-20 plansz w 30 s, pula 45 bez powtórzeń wystarcza z zapasem |
| rotacja mentalna | czas rośnie liniowo z kątem, ok. 2-4 ms/°; 180° najtrudniejsze | Shepard i Metzler | Obrót: liczba obrotów o 180° zmienia trudność partii |
| pamięć robocza | 4 ± 1 elementy (Cowan), 7 ± 2 cyfry (Miller); sekwencja przestrzenna (Corsi) 5-7 | klasyczne badania pamięci | Sekwencja: typowo 9-12 (powtarzanie z odtworzeniem wspiera pamięć), dobrzy 15-20, rekordy 30+ po treningu; W pamięci: utrzymanie jednej wartości z 8-13 działaniami po 1,5 s to głównie szybkość liczenia |
| śledzenie wielu obiektów (MOT) | 3-5 celów; przy rosnącej prędkości liczba śledzonych spada; dla 3 celów granica ok. 10-15°/s kąta widzenia | Pylyshyn, Alvarez i Franconeri | Śledzenie: pole 300 px ≈ 5-6 cm ≈ 10° z 30-35 cm, więc 1 pole/s ≈ 10°/s |
| śledzenie jednego obiektu w zamianach | ruch pozorny czytelny od ok. 100 ms na ruch; trudność rośnie z liczbą zamian (utrata uwagi) | percepcja ruchu | Kubki: 150 ms na zamianę na granicy, ale czytelne; o trudności decyduje raczej liczba zamian |
| precyzja czasowa dotknięcia (synchronizacja) | odchylenie 20-40 ms przy przewidywalnym ruchu | zadania synchronizacji | Wieża: okno ± tolerancja / prędkość (§3 w planie gry) poniżej ok. 30 ms = większość prób pudłuje |
| odtwarzanie odstępów (rytm) | zmienność 3-5% odstępu przy 400-900 ms | prawo skalarne w percepcji czasu, stukanie kontynuacyjne | Rytm: 462 ms → 14-23 ms, 857 ms → 26-43 ms odchyłki przy tej samej umiejętności |
| odtwarzanie dłuższych czasów | zmienność ok. 10-15% czasu (Weber) | prawo skalarne | Stoper (cel 6-14 s), Przytrzymaj (1-5 s), Za zasłoną (1-4 s): błąd rośnie z długością |
| szacowanie liczby kropek | błąd ok. 15-25% liczby (Weber) | szacowanie liczebności | Policz kropki: błąd ∝ n, więc przy stałej sumie 240 oczekiwany błąd partii jest stały |
| ocena kąta | ostre i bliskie 90° dokładniej, rozwarte gorzej (założenie słabsze) | percepcja kątów | Kąt: suma kątów partii może zmieniać trudność (F1:W8b) |
| celowanie palcem | 7-10 mm średnicy trafienia | ergonomia ekranów dotykowych | Środek, Mapa, Tort: błąd w px stały, więc krótszy odcinek = większy błąd w % |
| częstość stuknięć | 5-7 na s | motoryka | Balon: 155 stuknięć to ok. 25-30 s |

**Sufit praktyczny quizów** (wyliczone z progów): 30 s / czas na planszę; przy pomyłce +1 s blokady. Pula planszy w stanie: 200 (`quiz.ts:10`), więc wyczerpanie puli w 30 s jest niemożliwe (wymaga 150 ms na planszę).
Wynik bliski sufitowi puli nie istnieje; „remisy na szczycie” w quizach zależą od tego, jak często dwóch dobrych graczy ma tę samą liczbę trafień (o tym decyduje `tie`).

## 3. Wzorce

### 3.1 Wzorce zgodne z `ZASADY.md` §3 (losowanie nie zmienia sumy do zdobycia)

| wzorzec | gdzie | co gwarantuje | czego nie gwarantuje |
|---|---|---|---|
| `withSum(rng, n, min, max, total)` (`core.ts:213-218`): losowanie z odrzucaniem, aż suma = total | `balon.ts:53`, `przytrzymaj.ts:40`, `zaslona.ts:45`, `kropki.ts:60` | stała suma celów (zmierzone: 0% rozrzutu, 03-01 §2) | rozkładu pojedynczych celów; gdy błąd gracza rośnie liniowo z celem (Weber: kropki, czasy), stała suma daje też stały oczekiwany błąd, ale nie przy zależności nieliniowej (np. ucięcie odchyłki do celu, strategia w Balonie: rozrzut wyniku strategii 10-15%, 03-01 §2) |
| potasowane komplety | `stroop.ts:35-38` (w każdej czwórce dokładnie jedna zgodna), `inny.ts:51` (rodzaje 0-3 tasowane po 4, potem 0-2) | stała liczba plansz każdego rodzaju w każdym prefiksie długości 4 (zmierzone: Stroop 10 na 40, Inny 7-8 na 24) | parametrów wewnątrz rodzaju (kolor, barwa) |
| stały zestaw w losowej kolejności | `tort.ts:50` (3-7 kawałków, każda liczba raz), `stoj.ts:54` (stały harmonogram, czerwone tasowane: 27 / 14) | identyczne zadania, inna kolejność | wpływu kolejności (Stój!: zielone w szybkiej końcówce 6-16, 03-01 §2) |
| stała liczba bodźców | `refleks.ts:5`, `kubki.ts:4`, `sledzenie.ts:6`, `wieza.ts:4`, `w-pamieci.ts:4-6` (90 działań) | ta sama liczba prób | trudności pojedynczej próby (W pamięci: mnożenia 15-35) |

### 3.2 Drugie kryterium (`tie`)

- **Bez zaokrąglenia:** `balon.ts:73` (pęknięte, całkowite 0-10: rozstrzyga słabo, D-05), `sledzenie.ts:121` (trafione cele 0-2: słabo), `wieza.ts:98` (szerokość, liczba rzeczywista: rozstrzyga),
  `zakupy.ts:81` (ms: rozstrzyga), `w-pamieci.ts:84` (odchyłka całkowita: średnio).
- **Z zaokrągleniem do ms** (`Math.round(average(times))`): `stroop.ts:50`, `liczenie.ts:71`, `inny.ts:83`, `obrot.ts:84`, `literowka.ts:52`, `dziesiatki.ts:67`, `stoj.ts:80`.
  Przy średniej ok. 800 ms i rozrzucie dziesiątek ms równość co do ms jest rzadka (założenie; klucz F1 `tie-zaokraglenie`, waga niska, chyba że plan gry pokaże inaczej).
- **Brak `tie` przy wyniku całkowitym z sufitem:** `kubki.ts:70` (0-20), `simon.ts:41` (bez sufitu). Przy wynikach ciągłych (ms, km, ΔE, % idealności) brak `tie` jest zgodny z D-05,
  o ile wynik nie jest zaokrąglany zbyt grubo (`kolo.ts:97`: 0-1000, czyli 0,1%; do oceny w 03-07).

## 4. Szablon sekcji (D-12)

Plany 03-05..03-08 kopiują ten układ. Przykład wypełniony dla Balonu (liczby z 03-01-CHECKS.md, oceny tylko poglądowe; właściwą sekcję pisze 03-05).

```markdown
## Balon (`balon`)

**Do zdobycia (REC-01)**
- Suma wytrzymałości 155 w każdej partii (`packages/games/src/balon.ts:53`, `withSum`; zmierzone 0% rozrzutu, 03-01 §2). Zgodne z `ZASADY.md` §3.
- Rozkład pojedynczych balonów zmienia wynik stałej strategii: „stop na 10” daje 50-100 pkt (mediana 70, rozrzut 12%; zmierzone).
  Waga: … · Propozycja: … · Pewność: zmierzone.

**Sufit i remisy (REC-02, REC-03)**
- Sufit teoretyczny 155 (wyliczone), praktyczny … (założenie: gracz nie zna wytrzymałości). Ryzyko remisów na szczycie: … `tie` = pęknięte balony (0-10) …

**Krzywa trudności (DIFF-01)**
- Bez progresji. …

**Limit tury (DIFF-02)**
- T = 155 stuknięć × 0,3 s + 10 zgarnięć × 1 s + 10 × 0,8 s pauzy (`apps/web/src/games/Balon.tsx:16`) + 3 s sieci = 67,5 s; L = 120 s (`balon.ts:28`); zapas 52,5 s (78%). Zgodne.

**Rekomendacja:** zostawić / zmienić / sprawdzić w partii: …

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| BL… | … | … | … | … | … | … |
```

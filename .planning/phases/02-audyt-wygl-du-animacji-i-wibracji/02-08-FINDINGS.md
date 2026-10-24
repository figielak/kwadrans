# 02-08 FINDINGS: mini-gry na trafienia (wygląd, animacje, wibracje)

**Plan:** `02-08-PLAN.md` (fala 2). **Gry:** Kolor liter (`stroop`), Liczenie (`liczenie`), Inny element (`inny`), Obrót (`obrot`), Literówka (`literowka`),
Dziesiątki (`dziesiatki`), Tabela Schultego (`schulte`), Sudoku (`sudoku`), Zakupy (`zakupy`).
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI), decyzje D-01..D-13 z `02-CONTEXT.md`.
**Dowody:** wiersze z `02-01-CHECKS.md` (grep), punkty B-xx / W-xx z `02-02-BASELINE.md` (wzorce platformy), lektura plików gier.
**Stan kodu:** gałąź `labirynt`, 2026-10-23/24. Repo bez zmian poza `.planning/`.

## Metoda i założenia

- **360×640 sprawdzono statycznie** (D-09), bez przeglądarki i bez serwerów dev: szerokości z klas Tailwinda, Geist Mono około 0,6 em na znak,
  Satoshi około 0,55 em (pogrubiony wersalik około 0,65 em).
- Szerokość treści: `Screen` ma `px-4`, więc na 360 px zostaje **328 px** (`ui.tsx:10`). Okno podglądu w `Intro`: `tile p-4` + obrys, czyli **294 px** (`ui.tsx:296-297`).
- Wysokość obudowy w partii (szacunek z `Game.tsx:221-260` i `ui.tsx:10`): `pt-6` 24 px + nagłówek w kaflu `p-4` (tytuł i `GameDots` 48 px, odstęp 12 px, pasek `Countdown` około 20 px) około 112 px
  + odstęp 12 px + dół 24 px = **około 172 px**, czyli na pole gry zostaje **około 468 px**. W turnieju dochodzi wiersz `.label` (około 28 px, zostaje około 440 px);
  w grze solo zamiast `GameDots` jest „Wyjdź” (około 44 px), zostaje około 444 px. Pasek `Stats` (`ui.tsx:163`) ma około 56 px.
- Wspólny `Quiz.tsx` oceniony raz, w sekcji Kolor liter (D-02, D-03); pozostałe gry quizowe odsyłają do wpisów QZ.
- Identyfikatory: QZ (Quiz.tsx), ST, LI, IN, OB, LT, DZ, SC, SU, ZK. Waga wg D-07.

---

## Kolor liter (`stroop`)

Pliki: `apps/web/src/games/Stroop.tsx` (48 linii), wspólny `apps/web/src/games/Quiz.tsx` (269 linii).

### Komponent wspólny `Quiz.tsx` (D-02, pełna ocena)

Używają go: Kolor liter, Liczenie, Inny element, Obrót, Literówka (cały przebieg); Dziesiątki, Refleks i Stój! biorą `Results`, `BLOCK_MS`, `MIN_ANSWER`, `MAX_ANSWER`.

| Punkt | `plik:linia` | Ocena |
|---|---|---|
| `Stats` z trzema pozycjami (Trafienia albo Punkty, Błędy z `warn`, Seria) | `Quiz.tsx:234-240` | zgodny z B-65, W-01 (trzy pozycje mieszczą się na 360 px) |
| czas partii 30 s: `Intro` `time` = „30 sekund”, nagłówek pokazuje czas rundy przez `onRound` | `Quiz.tsx:223`, `:215` | zgodny (W-08); licznik ma `Game.tsx` (`Countdown`, label „Czas”), gra nie rysuje własnego |
| `Intro` z `preview` z pliku gry (`QuizPreview`), `task`, `score` (domyślnie „Liczą się trafienia, pomyłka blokuje na sekundę”), „Start” z `Intro` | `Quiz.tsx:219-228`, `:159` | zgodny z B-72 (komplet atrybutów: CHECKS 10a, wiersz `Quiz.tsx:221`) |
| `QuizPreview`: dobra odpowiedź podświetla się `preview-half` 2,4 s `linear` ∞, ujemny `animation-delay`, ramka `success` | `Quiz.tsx:141-157`, `:150` | zgodny z B-39 (CHECKS 11a: `Quiz.tsx:150`). Przy reduced-motion nakładka ma bazowo `opacity-0`, więc statyczny podgląd to samo pytanie i odpowiedzi bez zaznaczenia: czytelna klatka (W-12 zgodny) |
| przyciski odpowiedzi: `touch-none select-none`, `onPointerDown` | `Quiz.tsx:253-254` | zgodny (W-13); CHECKS §5: `Quiz.tsx` ma `pointerDown` 1, `touch/select` tak / tak |
| pola dotykowe: 2×2 `min-h-24` (96 px, szerokość (328 − 12) / 2 = 158 px); siatka `cols` `aspect-square` | `Quiz.tsx:254` | zgodny (W-06); siatkę `cols` przy 6×6 liczy sekcja Inny element (48 px) |
| zaokrąglenia: odpowiedź `rounded-tile` (20 px), komórka siatki i wiersze tabeli `rounded-inset` (10 px) | `Quiz.tsx:254`, `:94`, `:113`, `:128` | zgodny (`DESIGN.md` §2) |
| pomyłka: wibracja `navigator.vibrate?.(60)`, faza `wrong` na `BLOCK_MS` = 1000 ms, dotknięta odpowiedź `border-warning` + `tile-miss` 0,35 s, reszta `opacity-40` i `disabled`, w kaflu pytania albo w linii `status` napis „Źle!” w `warning` | `Quiz.tsx:191-195`, `:252`, `:255-256`, `:243`, `:263-264` | zgodny: wzór 60 z tabeli §5 (CHECKS §15: `Quiz.tsx:193`, `?.` tak), kolor nie jest jedynym sygnałem (napis i potrząśnięcie), przygaszenie 40% ma podpis „Źle!” (`DESIGN.md` §4). Keyframes `tile-miss` poza listą §5: wpis platformy B-46, tu bez powtórzenia |
| trafienie: `tile-hit` 0,35 s, bez wibracji | `Quiz.tsx:185-189`, `:256` | zgodny z tabelą wibracji §5 (brak wibracji przy trafieniu). Keyframes poza listą §5: B-45. Miejsce błysku: QZ3 |
| `setTimeout(…, BLOCK_MS)` | `Quiz.tsx:195` (CHECKS §13) | zgodny: logika blokady, nie animacja, więc `reducedMotion` nie dotyczy; sprzątany przy odmontowaniu (`:212`) i na końcu czasu (`:205`) |
| `setInterval(…, 100)` zegara 30 s | `Quiz.tsx:202-209` (CHECKS §13) | zgodny: koniec partii, nie animacja |
| pomiar: `performance.now()` w `start`, `next`, `answer`, zegarze | `Quiz.tsx:168`, `:174`, `:182`, `:204` (CHECKS §14) | zgodny: znacznik `shownAt` ustawiany synchronicznie w `next()` przed renderem, błysk `tile-hit` idzie równolegle i niczego nie opóźnia; blokada 1 s jest zasadą gry (KONCEPT §2.4), nie animacją. Brak przejść na pytaniu (bodziec bez przejścia, `DESIGN.md` §4) |
| animacje z JS | brak (`requestAnimationFrame`, `startViewTransition` nie występują) | zgodny (W-11): nic do `reducedMotion` |
| tabela wyników `Results`: nagłówki `.label`, liczby mono `tabular-nums` (`table` i `tr` `font-mono`), czas przez `duration()` z `toFixed(2).replace(".", ",")`, „gra…”, „brak trafień”, „(ty)”, zwycięzca: wiersz z tłem 16% koloru gracza, `Trophy` `fill` z `aria-label` „Zwycięzca”, miejsca mono w kolorze gracza | `Quiz.tsx:47-138`, `:40` | zgodny w tekstach i liczbach (W-03, W-16, W-18; CHECKS §8 `Quiz.tsx:125`, `:128` dziedziczą mono z `tr`). 360×640: kolumny liczb około 200 px z 296 px, nick zawija się (`break-words`, `:106`), `whitespace-nowrap` (`:78`, CHECKS §6) nie wypycha ekranu. Komponent jako taki: QZ1 |
| jeden wypełniony przycisk akcentu | brak `btn-primary` w pliku (CHECKS: btn-primary 0) | zgodny (W-05): w partii nie ma akcji wymagającej wypełnienia, „Start” daje `Intro` |
| wysokość na 360×640 (bez `cols`) | `Stats` 56 + 12 + kafel pytania `min-h-32` 128 + 12 + odpowiedzi 2 × 96 + 12 = **412 px** | zgodny (zostaje około 468 px, w turnieju 440 px) |

Rozbieżności `Quiz.tsx`:

- **QZ1** (średnia) `[zbiorcze: wlasna-tabela-wynikow]`: Kolor liter, Liczenie, Inny element, Obrót, Literówka, Dziesiątki (oraz Refleks i Stój! z innych paczek),
  `Quiz.tsx:47-138` (`Results`). Wyniki mini-gry to własna tabela z kolumnami (wynik, średni czas, błędy), a nie `Scores`.
  Źródło: `ZASADY.md` §4 „Z czego gra się składa” („Wyniki mini-gry: komponent `Scores`, wiersz na gracza”), W-04.
  Tabela zachowuje słowa i zachowanie `Scores` („gra…”, „(ty)”, kolejność rankingu) i ma powód (trzy liczby na gracza nie mieszczą się w jednym napisie `score`).
  Propozycja: uznać ją za drugi wspólny wzorzec (przenieść do `ui.tsx` jako `ScoreTable` i dopisać do `ZASADY.md` §4 obok `Scores`), zamiast przepisywać na `Scores`.
- **QZ2** (niska) `[zbiorcze: siatka-1fr]`: Inny element, Literówka, `Quiz.tsx:246`. Siatka `cols` ma `repeat(N, 1fr)` zamiast `repeat(N, minmax(0, 1fr))`
  (CHECKS §6: `Quiz.tsx:246`). Dziś bez skutku: zawartość to SVG w procentach (Inny element) i słowa do 10 liter (Literówka, około 120 px w kaflu 158 px).
  Źródło: `ZASADY.md` §4 „Ekran mieści się na 360×640 bez poziomego przewijania”, D-09. Propozycja: `minmax(0, 1fr)` (jak `grid-cols-*` Tailwinda).
- **QZ3** (niska): wszystkie gry quizowe, najbardziej Inny element; `Quiz.tsx:184`, `:189`, `:250`, `:256`. Po trafieniu `next()` od razu pokazuje następne pytanie,
  a klucz z błysku (`${i}-${flash.id}`) restartuje `tile-hit` na przycisku o tym samym indeksie **w nowym pytaniu**. Zielony błysk pada więc na inną odpowiedź
  (w Innym elemencie, gdy siatka rośnie, na inną komórkę innej siatki), a nie na tę, którą gracz dotknął.
  Źródło: `ZASADY.md` §5 („Animacja ma pokazać, co się właśnie stało”). Pomiar czasu nie cierpi (stan i znacznik idą od razu).
  Propozycja: przy przejściu do nowego pytania nie restartować błysku trafienia na przyciskach (np. błysk tylko w fazie `wrong`, a trafienie jako krótki `tile-hit`
  całego pola odpowiedzi albo liczby „Trafienia” w `Stats`), albo świadomie dopisać do §5, że błysk oznacza miejsce dotknięcia, nie odpowiedź.

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: `HUES` (`Stroop.tsx:5`: `#ff2445`, `#3b82f6`, `#facc15`, `#22c55e`) to kolory treści gry (napisy Koloru liter, `DESIGN.md` §6) z jednym źródłem w pliku: **odstępstwo z powodem** (lista na końcu; CHECKS §1: `Stroop.tsx:5`).
  Reszta ekranu to `Quiz.tsx` (tokeny, kolor gracza tylko przez `style`).
- Akcent, przyciski, pola dotykowe, `touch-none` / `onPointerDown`: przez `Quiz.tsx` (zgodne; CHECKS §5 pokazuje „nie / nie” dla `Stroop.tsx`, bo klasy są w `Quiz.tsx`).
- 360×640 (statycznie): napis bodźca `text-[min(12vw,3.5rem)]` pogrubiony wersalikami (`Stroop.tsx:38`): na 360 px 43 px, najdłuższe „NIEBIESKI” około 263 px wobec 294 px w kaflu: mieści się. Odpowiedzi `text-base` w kaflach 158 px. Wysokość 412 px (QZ).
- **ST1** (niska): Kolor liter, `Stroop.tsx:30` z układem `Quiz.tsx:145`. Podgląd na ekranie instrukcji stawia cztery nazwy kolorów w jednym rzędzie bez zawijania
  („czerwony”, „niebieski”, „żółty”, „zielony”, `text-sm` `font-semibold` `px-2`, odstęp 8 px): około 300-320 px wobec 294 px okna podglądu, które ma `overflow-hidden` (`ui.tsx:297`),
  więc skrajne nazwy mogą być ucięte. Szacunek statyczny, do potwierdzenia w przeglądarce. Źródło: `ZASADY.md` §4 („Ekran mieści się na 360×640”), `DESIGN.md` §3.3.
  Propozycja: `flex-wrap justify-center` w `QuizPreview` albo trzy odpowiedzi w podglądzie Koloru liter.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Bez em-dashy, bez ułamków, słowa wspólne z `Quiz.tsx` / `Intro` („Start”, „(ty)”, „gra…”). Nazwy kolorów małymi literami w odpowiedziach, wersalikami w bodźcu (treść gry).
- Intro: `time` i `score` z `Quiz.tsx` (zgodne), `task` w pliku gry, `preview` = `QuizPreview` z animacją CSS (W-08 zgodny).
- **ST2** (niska): Kolor liter, `Stroop.tsx:22`. Instrukcja mówi „Nazwa koloru jest napisana innym kolorem”, a co czwarta plansza jest zgodna
  (`KONCEPT.md` §2.4: „w każdej czwórce plansz jedna zgodna”; `stroop.ts:8`). Tekst wprowadza w błąd co do zasady. Źródło: `ZASADY.md` §4 „Teksty po polsku, krótkie” (treść ma mówić prawdę o grze).
  Propozycja: „Wybierz kolor liter, nie znaczenie słowa (zwykle się różnią)”.
- Dostępność: przyciski mają tekst (nazwy kolorów), podgląd pod `aria-hidden` z `Intro`. Bez rozbieżności.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- `Stroop.tsx` nie ma własnych animacji, timerów, pomiaru ani wibracji (CHECKS: tabela zbiorcza, same kropki poza `kol` i `liczby`). Wszystko z `Quiz.tsx` (tabela wyżej: `preview-half`, `tile-hit`, `tile-miss`, wibracja 60, `setTimeout`, `setInterval`, `performance.now` zgodne; QZ3).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s `linear` ∞ (`Quiz.tsx:150`) | brak | „Start” (`Intro`) |
| pojawienie się nowej planszy | brak (bodziec bez przejścia) | brak | nazwy kolorów |
| trafienie | `tile-hit` 0,35 s `ease-out` (na przycisku o tym samym indeksie w nowym pytaniu, QZ3) | brak | - |
| pomyłka | `tile-miss` 0,35 s `ease-out` + `border-warning`, reszta `opacity-40`, „Źle!”, blokada 1 s | 60 (`Quiz.tsx:193`) | - |
| koniec partii | brak (tabela `Results`) | brak (40 tury tylko w `Game.tsx`) | „Rewanż” / „Do lobby” albo „Jeszcze raz” / „Wyjdź” (`Game.tsx`) |
| moja tura | nie dotyczy (wszyscy grają naraz) | 40 w `Game.tsx` | - |

---

## Liczenie (`liczenie`)

Plik: `apps/web/src/games/Liczenie.tsx` (31 linii). Przebieg, wygląd wspólny i animacje: `Quiz.tsx` (sekcja Kolor liter, QZ1-QZ3).

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: brak własnych (CHECKS: `Liczenie.tsx` bez trafień `kol`). Bez rozbieżności.
- Cztery odpowiedzi: 2×2 `min-h-24` z `Quiz.tsx:254`, każda 158 × 96 px na 360 px: zgodne z 48 px. `touch-none select-none` i `onPointerDown` z `Quiz.tsx:253-254`.
- 360×640 (statycznie): działanie `font-mono text-5xl` (`Liczenie.tsx:24`), najdłuższe „99 + 99” / „108 : 9” 7 znaków około 202 px wobec 294 px: mieści się. Wynik do 198 (3 cyfry) w odpowiedziach. Wysokość 412 px.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Znaki działań: serwer daje `−` (U+2212), `×` i `:` (`packages/games/src/liczenie.ts:22-24`, `:38-44`, tekst `:51`), dodawanie `+`; podgląd „7 × 6” (`Liczenie.tsx:20`). Zgodne (żadnych `-`, `*`, `/`).
- Intro: `task` „Licz w pamięci i wybierz dobry wynik”, reszta z `Quiz.tsx`. Zgodne.
- **LI1** (niska) `[zbiorcze: liczby-mono]`: Liczenie, `Liczenie.tsx:20`, `:24`, `:25`. Działanie i odpowiedzi są `font-mono`, ale bez `tabular-nums`
  (`tabular-nums` mają tylko `Stats` i tabela wyników). Liczby zmieniają się co pytanie w tym samym miejscu. Źródło: `ZASADY.md` §4 „Liczby, czasy i kody czcionką mono z `tabular-nums`”, `DESIGN.md` §5, W-16.
  Propozycja: dopisać `tabular-nums` do obu `span`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Brak własnych animacji, timerów, pomiaru i wibracji w `Liczenie.tsx`; ocena w `Quiz.tsx` (zgodne poza QZ3).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s ∞ (`Quiz.tsx:150`) | brak | „Start” |
| nowe działanie | brak | brak | liczby |
| trafienie | `tile-hit` 0,35 s (QZ3) | brak | - |
| pomyłka | `tile-miss` 0,35 s, „Źle!”, blokada 1 s | 60 | - |
| koniec partii | brak (`Results`) | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

---

## Inny element (`inny`)

Plik: `apps/web/src/games/Inny.tsx` (56 linii), przebieg z `Quiz.tsx` w trybie `cols` z `retry`.

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: wypełnienie figur `hsl(${hue} 70% ${light}%)` (`Inny.tsx:22`, CHECKS §1) to treść gry (figury Innego elementu, `DESIGN.md` §6): **odstępstwo z powodem**.
- Siatka od 2×2 do 6×6: `cols = 2 + ceil(i/2)`, `rows = 2 + floor(i/2)`, `MAX_SIDE` 6 (`packages/games/src/inny.ts:5`, `:56-57`), więc kolumn jest zawsze co najmniej tyle co wierszy.
  Komórka 6×6 na 360 px: (328 − 5 × 8) / 6 = **48 px**, czyli dokładnie granica 48 px (zgodne, bez zapasu). Siatka jest najwyżej kwadratem 328 × 328 px.
- Wysokość (statycznie): `Stats` 56 + 12 + siatka 328 + 12 + linia `status` `h-6` 24 = **432 px** (zostaje 468 px, w turnieju 440 px, solo 444 px): mieści się.
- Plansza zostaje po pomyłce: `retry` (`Inny.tsx:34`) → `setPhase("play")` po blokadzie (`Quiz.tsx:195`), bez nowego pytania. Zgodne z KONCEPT §2.4.
- SVG ma `viewBox="-1 -1 2 2"` i rozmiar w procentach (`Inny.tsx:21`, `size-4/5`): skaluje się. Siatka `1fr`: QZ2. Pole gry `touch-none` / `onPointerDown` z `Quiz.tsx`.

### Teksty, liczby i dostępność (UI-04, UI-05)

- `toFixed(3)` tylko we współrzędnych wielokąta (`Inny.tsx:18`, CHECKS §7: zgodne, nie tekst UI).
- **IN1** (niska) `[zbiorcze: aria-label]`: Inny element, `Inny.tsx:21`, `:50` z `Quiz.tsx:248-259`. Komórki siatki to przyciski, których jedyną treścią jest SVG z `aria-hidden`,
  bez `aria-label`: czytnik ekranu ogłasza puste przyciski. Źródło: `ZASADY.md` §4 „przyciski bez tekstu `aria-label`”, W-15.
  Propozycja: `aria-label={`Symbol ${cell + 1}`}` (bez zdradzania, który jest inny).
- **IN2** (niska): Inny element, `Inny.tsx:49`. Linia stanu „Dotknij symbol, który się różni”: po „dotknij” dopełniacz („Dotknij symbolu, który się różni”), jak w `task` (`:35`: „dotknij go”).
  Źródło: `ZASADY.md` §4 „Teksty po polsku”. Propozycja: poprawić formę.
- Intro: `task` mówi o czterech rodzajach różnicy i rosnącej siatce, `time` / `score` z `Quiz.tsx`. Podgląd: cztery trójkąty w rzędzie, jeden obrócony (uproszczenie siatki): zgodne.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Brak własnych animacji, timerów, pomiaru i wibracji; z `Quiz.tsx` (zgodne). QZ3 dotyka tę grę najmocniej: po trafieniu siatka zmienia rozmiar, a błysk `tile-hit` pada na komórkę o tym samym indeksie w nowej siatce.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s ∞ | brak | „Start” |
| nowa (większa) siatka | brak | brak | - (figury) |
| trafienie | `tile-hit` 0,35 s na komórce nowej siatki (QZ3) | brak | - |
| pomyłka | `tile-miss` 0,35 s, `border-warning`, reszta `opacity-40`, „Źle!” w linii stanu, ta sama plansza po 1 s | 60 | - |
| koniec partii | brak (`Results`) | brak | „Rewanż” / „Do lobby” |

---

## Obrót (`obrot`)

Plik: `apps/web/src/games/Obrot.tsx` (83 linie), przebieg z `Quiz.tsx` z `points` (trafienia minus błędy).

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: figury `fill="currentColor"` (`fg`, `Obrot.tsx:24`). Bez rozbieżności.
- Dwie figury `w-2/5` w kaflu pytania (`Obrot.tsx:63-66`), SVG z `viewBox` kwadratowym (`:24`): po około 118 px na 360 px, skalują się do szerokości. Zgodne.
- „Ta sama” / „Lustro”: dwa przyciski 158 × 96 px (`Quiz.tsx:254`), ikony `ArrowsClockwise` / `FlipHorizontal` 24 px `regular` z `aria-hidden` (`Obrot.tsx:70`, `:74`). Zgodne z 48 px i `DESIGN.md` §2.
- Wysokość jak w Kolorze liter: 412 px. Zgodne.
- **OB1** (niska) `[zbiorcze: promien]`: Obrót, `Obrot.tsx:26`. Klocki mają `rx={0.12}` w jednostkach `viewBox` (około 3-4 px na ekranie), poza skalą 20 / 10 / 999 px
  (CHECKS §3: `Obrot.tsx:26`). To rysunek treści gry, nie element interfejsu. Źródło: `DESIGN.md` §2 „Zaokrąglenia”. Propozycja: dopisać figury Obrotu do `DESIGN.md` §6 jako treść gry (wtedy odstępstwo), bez zmiany kodu.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Notka i punktacja w pliku gry (`Obrot.tsx:43-44`), zgodne z KONCEPT §2.4 (trafienie punkt, pomyłka zabiera punkt). `Stats` pokazuje „Punkty” (`Quiz.tsx:236`).
- **OB2** (niska) `[zbiorcze: slowa]`: Obrót, `Obrot.tsx:55` wobec `:71`, `:75`. Podgląd pisze „ta sama” / „lustro” małymi literami, przyciski w partii i KONCEPT §2.4 „Ta sama” / „Lustro”.
  Źródło: `ZASADY.md` §4 „te same słowa”. Propozycja: w podglądzie te same napisy co na przyciskach.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Brak własnych animacji, timerów, pomiaru i wibracji; z `Quiz.tsx` (zgodne poza QZ3).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s ∞ | brak | „Start” |
| nowa para figur | brak | brak | „Ta sama”, „Lustro” |
| trafienie | `tile-hit` 0,35 s (QZ3) | brak | - |
| pomyłka (zabiera punkt) | `tile-miss` 0,35 s, „Źle!”, blokada 1 s | 60 | - |
| koniec partii | brak (`Results` z kolumną „Punkty”) | brak | „Rewanż” / „Do lobby” |

---

## Literówka (`literowka`)

Plik: `apps/web/src/games/Literowka.tsx` (38 linii), przebieg z `Quiz.tsx` w trybie `cols: 2` z `points`.

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: brak własnych. Bez rozbieżności.
- Siatka 2×2: komórki `aspect-square` (328 − 8) / 2 = 160 px. Najdłuższe słowa w `literowka-dane.ts` mają 10 liter („przepiórka”, „chrabąszcz”, „wychowawca”; skrypt w scratchpadzie, 362 słowa),
  `text-xl font-semibold` około 120 px wobec około 158 px wnętrza: mieszczą się bez zawijania (słowa bez spacji, `whitespace-nowrap` niepotrzebne). Komentarz `Literowka.tsx:29` mówi o 12 literach: też by się zmieściło (około 144 px).
- Wysokość: 56 + 12 + 328 + 12 + 24 = 432 px. Zgodne. Siatka `1fr`: QZ2.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Pytanie „Które słowo ma błąd?” jako linia stanu (`Literowka.tsx:14`, `:33`), notka i punktacja jak w Obrocie (`:22-23`). Bez em-dashy i ułamków. Przyciski mają tekst (słowo).
- Podgląd: trzy słowa w rzędzie zamiast siatki 2×2 z czterema (uproszczenie, zgodne).
- Bez rozbieżności poza wpisami `Quiz.tsx`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Brak własnych animacji, timerów, pomiaru i wibracji; z `Quiz.tsx` (zgodne poza QZ3).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s ∞ | brak | „Start” |
| nowe cztery słowa | brak | brak | słowa |
| trafienie | `tile-hit` 0,35 s (QZ3) | brak | - |
| pomyłka (zabiera punkt) | `tile-miss` 0,35 s, „Źle!” w linii stanu, blokada 1 s, następna plansza | 60 | - |
| koniec partii | brak (`Results`, „Punkty”) | brak | „Rewanż” / „Do lobby” |

---

## Dziesiątki (`dziesiatki`)

Plik: `apps/web/src/games/Dziesiatki.tsx` (155 linii). Własny przebieg, z `Quiz.tsx` bierze `Results`, `BLOCK_MS`, `MIN_ANSWER`, `MAX_ANSWER` (`Dziesiatki.tsx:4`).

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: tokeny i kolor gracza przez `style` (zaznaczenie `Dziesiatki.tsx:143`). Brak `btn-primary`.
- Siatka 4×4: (328 − 3 × 8) / 4 = **76 px** na komórkę, `aspect-square` (`Dziesiatki.tsx:130`, `:140`): zgodne z 48 px. Siatka `repeat(4, 1fr)` (CHECKS §6: `Dziesiatki.tsx:130`) z jedną cyfrą `text-3xl` w komórce: bez skutku, ten sam klucz co QZ2 `[zbiorcze: siatka-1fr]` (niska, bez osobnego wpisu).
- Pole gry: `touch-none select-none`, `onPointerDown` (`Dziesiatki.tsx:139-140`). Zgodne (W-13).
- Wysokość: `Stats` 56 + 12 + 328 + 12 + linia stanu 24 = 432 px. Zgodne.
- Pomyłka: obie komórki `border-warning`, reszta `opacity-40` i `disabled`, „Źle!” w `warning` (`:141`, `:150-151`): zgodne z `DESIGN.md` §4 (przygaszenie z podpisem).
- **DZ1** (niska) `[zbiorcze: zaznaczenie-gracza]`: Dziesiątki, `Dziesiatki.tsx:143` (i `:134-146`). Zaznaczona pierwsza liczba ma tylko ramkę 1 px i tło 25% w kolorze gracza,
  bez `aria-pressed`; Sudoku (`Sudoku.tsx:156`) i Zakupy (`Zakupy.tsx:165`) zaznaczają pole pierścieniem 2 px w kolorze gracza (Zakupy z `aria-pressed`).
  Źródło: `DESIGN.md` §4 („kafel zaznaczony: … `aria-pressed`”), §5 („Kolor nigdy nie jest jedynym sygnałem”: tu sygnałem jest sam odcień ramki i tła).
  Propozycja: jeden wzór zaznaczenia w trzech grach (pierścień 2 px w kolorze gracza + `aria-pressed`).
- **DZ2** (niska) `[zbiorcze: zaznaczenie-bez-przejscia]`: Dziesiątki `Dziesiatki.tsx:143`, Sudoku `Sudoku.tsx:156`, Zakupy `Zakupy.tsx:165`. Zaznaczenie pola (ramka, tło, pierścień w `style`)
  przeskakuje bez przejścia. Źródło: `ZASADY.md` §5 „Mechanizm: zmiany stanu (kolor, obwódka) przez `transition-colors`” i tabela „reakcja na dotyk 100 ms”.
  W grach na czas natychmiastowa zmiana jest bezpieczniejsza, więc propozycja do decyzji: albo `transition-[border-color,background-color,box-shadow] duration-100`,
  albo dopisać do §5, że zaznaczenie w polu gry na czas nie ma przejścia (jak bodziec).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Liczby w komórkach `font-mono tabular-nums` (`:140`). Intro: `time` „30 sekund”, `task`, `score` „Liczą się pary, pomyłka blokuje na sekundę” (`:111-117`, CHECKS 10a: komplet). Wyniki: `Results` z „Pary” (`:97-106`, QZ1).
- Linia stanu `role="status"` „Dotknij dwóch liczb, które dają 10” / „Źle!” (`:150-151`). Przyciski mają tekst (cyfra; CHECKS §9 `Dziesiatki.tsx:134`: zgodne).
- Bez em-dashy i ułamków. Bez rozbieżności poza DZ1 (`aria-pressed`).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Element | `plik:linia` | Ocena |
|---|---|---|
| podgląd: `preview-half` 2,4 s ∞, `[animation-delay:-1.2s]`, para 3 + 7 w ramce `success` | `Dziesiatki.tsx:27` (CHECKS 11a) | zgodny z B-39; przy reduced-motion statycznie cztery liczby bez zaznaczenia (czytelne) |
| para: `tile-hit` 0,35 s na obu komórkach, w których od razu stoją nowe liczby z dostaw | `:59`, `:67`, `:136`, `:142` | zgodny co do czasu i keyframes z innymi grami (W-10; poza listą §5: B-45). Nowe liczby wchodzą bez `stone-pop`: błysk trafienia obejmuje też pojawienie (jedna animacja na sytuację, uwaga do macierzy 02-11) |
| pomyłka: `tile-miss` 0,35 s na obu komórkach, blokada `BLOCK_MS` 1 s, plansza bez zmian | `:68-73`, `:142` | zgodny (B-46) |
| `navigator.vibrate?.(60)` przy pomyłce, brak przy parze | `:71` (CHECKS §15) | zgodny z tabelą §5 |
| `setTimeout(…, BLOCK_MS)` | `:73` (CHECKS §13) | zgodny: logika blokady, nie animacja; sprzątany `:83`, `:90` |
| `setInterval(…, 100)` zegara 30 s | `:80-87` (CHECKS §13) | zgodny: koniec partii |
| pomiar `performance.now()` | `:46`, `:57`, `:82` (CHECKS §14) | zgodny: czas pary od poprzedniej pary (`shownAt`), stan planszy zmienia się od razu, błysk niczego nie opóźnia |
| zaznaczenie pierwszej liczby | `:143` | bez animacji i bez `ring-pulse` (`ring-pulse` to „to można wybrać”, tu byłby podpowiedzią): DZ2 |

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 2,4 s ∞ | brak | „Start” |
| zaznaczenie pierwszej liczby | brak (ramka i tło w kolorze gracza od razu, DZ1, DZ2) | brak | - |
| para (trafienie) + pojawienie dwóch nowych liczb | `tile-hit` 0,35 s `ease-out` | brak | - |
| pomyłka | `tile-miss` 0,35 s, „Źle!”, blokada 1 s | 60 | - |
| koniec partii | brak (`Results`, „Pary”) | brak | „Rewanż” / „Do lobby” |

---

## Tabela Schultego (`schulte`)

Plik: `apps/web/src/games/Schulte.tsx` (211 linii).

### Wygląd (UI-01, UI-02, UI-03)

- Siatka 5×5: `grid aspect-square grid-cols-5 gap-2` (`Schulte.tsx:134`), komórka (328 − 4 × 8) / 5 = **59 px**: zgodne z 48 px; `grid-cols-5` to już `minmax(0, 1fr)`.
- Pole gry: `touch-none select-none`, `onPointerDown` (`:140-141`). Zgodne.
- Znalezione liczby zostają widoczne i niczym się nie różnią, ponowne dotknięcie nic nie robi (`:58`): zgodne z `ZASADY-GIER.md` („znalezione liczby zostają widoczne, jak w oryginale”).
- Wysokość: `Stats` 56 + 12 + 328 = **396 px**. Zgodne.
- Kolory: tokeny; wykres `stroke="var(--color-line)"`, `fill-fg-muted`, linie i kropki w kolorze gracza (`:171-194`); wiersz przewagi w kolorze zwycięzcy (`:98`). Zgodne.
- Wykres `SplitChart` (`:156-211`): SVG z `viewBox`, `w-full`: skaluje się. Legenda z nickami (kolor nie jest jedynym nośnikiem, komentarz `:197`). Zgodne.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Czas z przecinkiem: `seconds()` = `toFixed(1).replace` (`:14`), przewaga `toFixed(2|1).replace` (`:99`). Zgodne (W-03).
- `Stats`: „Szukaj”, „Kara”, „Twój czas” (`:127-133`): zgodne z `ZASADY-GIER.md` (etykieta „Twój czas”). Wyniki przez `Scores` (`:94`): zgodne (W-04).
- Intro: `time` „Stoper rusza po Starcie”, `task`, `score` z karą (`:111-121`, CHECKS 10a: komplet). Postęp rywali: ruch `progress` po każdym trafieniu (`:68`), pierścień rysuje `GameDots` (B-60). Zgodne.
- Wykres: `role="img"` z `aria-label` (z przecinkiem), legenda kreski `aria-hidden` (`:166-167`, `:201`). Przyciski mają tekst (CHECKS §9 `Schulte.tsx:136`: zgodne).
- **SC1** (niska) `[zbiorcze: przecinek]`: Tabela Schultego i Sudoku, `Schulte.tsx:83`, `:115`, `:130`; `Sudoku.tsx:95`, `:123`, `:138`. Kara w sekundach to `${(mistakes * PENALTY_MS) / 1000}`
  przez szablon, bez zamiany kropki. Dziś kary są całkowite (3 s, 5 s), więc tekst jest poprawny, ale zmiana stałej na np. 2500 ms dałaby „+2.5 s”.
  Źródło: `ZASADY.md` §4 „przecinek dziesiętny”, B-66. Propozycja: wspólny zapis liczby (`decimal` z B-66 albo `tenth`).
- **SC2** (niska): Tabela Schultego, `Schulte.tsx:172`, `:178`. Podpisy osi wykresu `text-[9px]` w jednostkach `viewBox` 320: na 360 px około 8,3 px, mniej niż najmniejszy krój w `DESIGN.md` §2 (`.label` 11 px).
  Źródło: `DESIGN.md` §2 „Typografia”. Propozycja: 11 jednostek albo mniejszy `W`, żeby skala była bliska 1.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Element | `plik:linia` | Ocena |
|---|---|---|
| podgląd: `preview-quarter` 2,4 s ∞, opóźnienia ujemne `(n − 1) × 0,6 − 2,4 s` | `:25-26` (CHECKS 11a) | zgodny z B-40; przy reduced-motion statyczna siatka 3×3 bez podświetleń (czytelna) |
| trafienie: `tile-hit` 0,35 s na dotkniętym kafelku, bez wibracji | `:59`, `:141` | zgodny (B-45; ta sama sytuacja i czas co w `Quiz.tsx`) |
| pomyłka: `tile-miss` 0,35 s + `navigator.vibrate?.(60)`, kara w `Stats` z `warn` | `:60-63`, `:141`, `:130` | zgodny z tabelą §5 (CHECKS §15: `Schulte.tsx:62`); potrząśnięcie i liczba kary obok koloru |
| `setInterval(…, 100)` zegara „Twój czas” | `:51-55` (CHECKS §13) | zgodny: licznik tekstu, nie animacja |
| pomiar: `performance.now()` przy starcie i trafieniu, międzyczasy | `:117`, `:65-66` (CHECKS §14) | zgodny: czas z dotknięcia, niezależny od błysku |
| animacje z JS | brak | zgodny (W-11) |

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-quarter` 2,4 s ∞ | brak | „Start” |
| trafienie | `tile-hit` 0,35 s `ease-out` | brak | - |
| pomyłka (+3 s) | `tile-miss` 0,35 s `ease-out` | 60 | - |
| koniec partii | brak (`Scores`, wiersz przewagi, wykres) | brak | „Rewanż” / „Do lobby” |

---

## Sudoku (`sudoku`)

Plik: `apps/web/src/games/Sudoku.tsx` (180 linii).

### Wygląd (UI-01, UI-02, UI-03)

- Plansza: bloki 2×2 z `gap-2` między blokami i `gap-1` w bloku (grubsza przerwa jak w `ZASADY-GIER.md`), komórka (124 − 4) / 2 = **60 px**; klawiatura cyfr `grid-cols-4`, `h-14` (**56 px**, `:166-172`). Zgodne z 48 px.
- Pole gry i klawiatura: `touch-none select-none`, `onPointerDown` (`:155-157`, `:171-172`). Zgodne.
- Dane cyfry: `bg-bg text-fg-muted` i `disabled`, wpisane `bg-surface` z `fg` (`:154`, `:157`): różnią się jasnością tła i tekstu, nie barwą, więc kolor nie jest jedynym sygnałem. Zgodne.
- Wybrane pole: ramka i pierścień `box-shadow: 0 0 0 2px` w kolorze gracza (`:156`, CHECKS §3): obrys, nie cień (zgodne z `DESIGN.md` §2); brak przejścia: DZ2; brak `aria-pressed`: SU3.
- Wysokość: `Stats` 56 + 12 + plansza 256 + 12 + klawiatura 56 = **392 px**. Zgodne.
- **SU1** (niska) `[zbiorcze: stale-piksele]`: Sudoku, `Sudoku.tsx:142`. Plansza ma stałą szerokość `w-64` (256 px). Na 360 px mieści się (328 px), ale nie skaluje się do szerokości.
  Źródło: `ZASADY.md` §4 („plansza skaluje się do szerokości, nie ma stałych pikseli”). Propozycja: `w-full max-w-64` (albo `max-w-72`), komórki dalej `aspect-square`.
- **SU2** (niska): Sudoku, `Sudoku.tsx:166-177` z `:72`. Klawiatura cyfr jest aktywna także wtedy, gdy nie wybrano pola (na starcie i po każdej dobrej cyfrze, `:81`);
  dotknięcie cyfry nic nie robi i nic tego nie tłumaczy. Źródło: `DESIGN.md` §4 („przycisk nieaktywny: krycie 40%… Każdy stan, który coś blokuje, tłumaczy się podpisem”).
  Propozycja: `disabled` (krycie 40%) bez wybranego pola i krótki podpis „Wybierz puste pole” pod klawiaturą.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Czas z przecinkiem (`seconds()` `:13`, przewaga `:109`); kara całkowita: SC1. `Stats`: „Zostało”, „Kara”, „Twój czas”; wyniki przez `Scores` (`:105`), przewaga w kolorze zwycięzcy (`:108`). Zgodne.
- Intro: `time` „Stoper rusza po Starcie”, `task` z „4×4”, „2×2”, „1-4”, `score` z karą (`:119-129`, CHECKS 10a: komplet). Postęp: ruch `progress` (`:82`). Zgodne.
- Liczby `font-mono` (bez `tabular-nums`, ale to pojedyncze cyfry w stałych polach: bez skutku, bez wpisu).
- **SU3** (niska) `[zbiorcze: aria-label]`: Sudoku, `Sudoku.tsx:150-160`. Puste pola to przyciski bez tekstu (`{n || ""}`) i bez `aria-label`, a wybrane pole nie ma `aria-pressed`
  (CHECKS §9: `Sudoku.tsx:150`). Źródło: `ZASADY.md` §4 „przyciski bez tekstu `aria-label`”, `DESIGN.md` §4 (kafel zaznaczony, `aria-pressed`).
  Propozycja: `aria-label` „wiersz W, kolumna K, puste”, `aria-pressed={selected === i}`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Element | `plik:linia` | Ocena |
|---|---|---|
| podgląd: `preview-quarter` 2,4 s ∞, opóźnienia `order × 0,6 − 2,4 s` | `:32-33` (CHECKS 11a) | zgodny z B-40; statycznie plansza z lukami (czytelna) |
| dobra cyfra: `tile-hit` 0,35 s na polu, bez wibracji | `:74`, `:80`, `:157` | zgodny (B-45) |
| zła cyfra: `tile-miss` 0,35 s, cyfra nie zostaje, pole zostaje wybrane, `navigator.vibrate?.(60)`, kara +5 s w `Stats` z `warn` | `:75-79`, `:157`, `:138` | zgodny z tabelą §5 i `ZASADY-GIER.md` (CHECKS §15: `Sudoku.tsx:77`) |
| `setInterval(…, 100)` zegara | `:59-63` (CHECKS §13) | zgodny: licznik tekstu |
| pomiar `performance.now()` | `:125`, `:84` (CHECKS §14) | zgodny: czas z ostatniej dobrej cyfry, stan od razu |
| animacje z JS | brak | zgodny |

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-quarter` 2,4 s ∞ | brak | „Start” |
| wybór pola | brak (pierścień 2 px w kolorze gracza od razu, DZ2) | brak | - |
| trafienie (dobra cyfra) | `tile-hit` 0,35 s `ease-out` | brak | cyfry 1-4 |
| pomyłka (+5 s) | `tile-miss` 0,35 s `ease-out` | 60 | - |
| koniec partii | brak (`Scores`, wiersz przewagi) | brak | „Rewanż” / „Do lobby” |

---

## Zakupy (`zakupy`)

Plik: `apps/web/src/games/Zakupy.tsx` (181 linii).

### Wygląd (UI-01, UI-02, UI-03)

- Lista: siatka 5×2 w kaflu `p-3` (`Zakupy.tsx:136-142`), komórki około 57 px. Półka: siatka 5×4, `aspect-square min-h-12`, około **57 px** (`:156-164`). Zgodne z 48 px.
- Pole gry: `touch-none select-none` na kaflu półki (`:156`; `touch-action` i `user-select` obejmują przyciski w środku), `onPointerDown` + `onClick` tylko dla klawiatury (`e.detail === 0`, `:166-168`). Zgodne.
- Zaznaczenie: ramka i pierścień 2 px w kolorze gracza + `aria-pressed` (`:163`, `:165`): grubość zmienia się razem z kolorem, więc kolor nie jest jedynym sygnałem. Pierścień `box-shadow: 0 0 0 2px` to obrys, nie cień (CHECKS §3). Przejście: DZ2.
- „Gotowe”: `btn text-bg` z tłem w kolorze gracza (`:175`): zgodne z `DESIGN.md` §5 (akcja w partii), brak `btn-primary`. Pomiar: ZK1.
- Wysokość w fazie wyboru: `Stats` 56 + 8 + półka około 266 + 8 + „Gotowe” 48 + 8 + podpis 20 = **około 414 px**; w fazie pokazu: pasek 6 + 8 + lista około 138 + 8 + podpis 20 = około 180 px. Zgodne.
- Ekran końcowy: przedmioty z listy `border-success`, pozostałe `opacity-60`, legenda tekstem (`:99`, `:112`): kolor nie jest jedynym sygnałem.
- **ZK3** (niska) `[zbiorcze: podpis-label]`: Zakupy, `Zakupy.tsx:92`. Podpis bloku „Lista zakupów” w kaflu jest `text-sm text-fg-muted` (Satoshi), a nie `.label`.
  Źródło: `DESIGN.md` §5 „Podpis to `.label`”, W-17. Propozycja: `<span className="label">Lista zakupów</span>`.
- **ZK4** (niska): Zakupy, `Zakupy.tsx:103-106`, `:100`. Na końcowej półce gracza, który zaznaczył przedmiot, oznacza tylko kropka 6 px w jego kolorze; `aria-label` przedmiotu nie mówi, kto go zaznaczył.
  Legendą są kropki w `Scores` obok nicków, więc przy kilku graczach o bliskich kolorach (np. `#46a758` i `#0ac5b3`) i dla daltonistów rozpoznanie zależy od samego koloru.
  Źródło: `DESIGN.md` §5 („Kolor nigdy nie jest jedynym sygnałem”), `ZASADY.md` §4 (dostępność). Propozycja: inicjał w kropce jak w `GameDots` (`initials`) albo nicki w `aria-label` przedmiotu („…, zaznaczyli: Ala, Bob”).
- **ZK5** (niska): Zakupy, `Zakupy.tsx:83` w `Scores` (`ui.tsx:148-152`). Wynik „10 pkt (10 traf., 0 błędów) · 12,3 s” ma do około 36 znaków mono 16 px (około 345 px), więc na 360 px
  łamie się na dwie linie i ściska kolumnę nicku (`flex-1` bez `min-w`). Bez poziomego przewijania (napis się zawija), ale wiersz `Scores` traci czytelność.
  Szacunek statyczny. Źródło: `ZASADY.md` §4 („Teksty … krótkie”, 360×640). Propozycja: w `Scores` „8 pkt · 12,3 s”, a trafienia i błędy na półce albo w drugim wierszu.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Czas przez `tenth` (`:83`, `:153`), odmiana „błąd / błędy / błędów” (`:16`). `Stats`: „Zaznaczone”, „Czas” (zgodne z `ZASADY-GIER.md`). Wyniki przez `Scores` (`:89`).
- Intro: `time` „10 s na zapamiętanie, potem zaznaczasz”, `task`, `score` (`:120-126`, CHECKS 10a: komplet). Bez em-dashy.
- Przyciski półki mają tekst (emoji) i `aria-pressed`; pasek pokazu `aria-hidden` z podpisem tekstowym „Zapamiętaj te przedmioty. Za chwilę znikną.” (`:133`, `:143`). Zgodne.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Element | `plik:linia` | Ocena |
|---|---|---|
| podgląd: `preview-half` 3 s ∞, ramka w kolorze gracza, opóźnienia `i × −0,5 s` | `:27-28` (CHECKS 11a) | zgodny z B-39; statycznie siatka emoji bez zaznaczeń (czytelna) |
| pasek pokazu: inline `transition: width 10000ms linear` | `:134` (CHECKS §12) | ZK2 |
| `setTimeout(…, ZAKUPY_SHOW_MS)` kończy pokaz i ustawia start pomiaru | `:50-53` (CHECKS §13) | zgodny: logika fazy, nie animacja; start pomiaru z `performance.now()` w tej samej funkcji, niezależny od paska |
| `setInterval(…, 200)` czasu w `Stats` | `:59` (CHECKS §13) | zgodny: licznik tekstu |
| pomiar `performance.now()` | `:51`, `:59`, `:71` (CHECKS §14) | zgodny co do animacji; moment końca: ZK1 |
| wibracje | brak w pliku | zgodny: gra nie ma pomyłki w trakcie (złe zaznaczenia liczy serwer na końcu), więc nie ma czego sygnalizować |

- **ZK1** (wysoka wg D-07): Zakupy, `Zakupy.tsx:175` (`onClick={done}`) z `:71`. „Gotowe” kończy pomiar `ms`, który jest drugim kryterium rankingu i rekordu
  (`ZASADY-GIER.md` Zakupy: „przy równych krótszy czas zaznaczania”; KONCEPT §2.4: `tie` = czas zaznaczania), a reaguje na `click`, czyli dopiero po puszczeniu palca:
  do wyniku dochodzi czas trzymania palca (zwykle 50-150 ms, różny u różnych osób). Źródło: `ZASADY.md` §4 („pola gry na czas … reagują na `onPointerDown`”), D-07 („pole gry na czas bez `onPointerDown`… wpływa na wynik”).
  W praktyce dotyczy tylko remisów punktowych (wtedy decyduje). Propozycja: `onPointerDown={done}` i `onClick` tylko dla klawiatury, jak na półce (`:166-168`).
- **ZK2** (niska) `[zbiorcze: brak-w-tabeli-5]`: Zakupy, `Zakupy.tsx:133-134`. Pasek pokazu listy to inline `transition` szerokości przez 10 s, poza keyframes z `index.css` i bez kategorii w tabeli §5 (D-06).
  Przy reduced-motion reguła globalna (B-51) skraca przejście do 0,01 ms, więc pasek od razu jest pusty i nie mówi, ile czasu zostało. Tor paska ma `bg-surface`, a pasek limitu w `Game.tsx:594` `bg-line`.
  Źródło: `ZASADY.md` §5 („Mechanizm”, „Czasy”, `prefers-reduced-motion`). Propozycja: szerokość liczona z `setInterval` jak w `Countdown` (`Game.tsx:589-598`) albo sam `Countdown` z `total` 10 s, tor `bg-line`;
  ewentualnie dopisać „pasek czasu” do tabeli §5.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| ekran instrukcji | `preview-half` 3 s ∞ | brak | „Start” |
| pokaz listy (10 s) | pasek: inline `transition` szerokości 10 s `linear` (ZK2) | brak | - |
| pojawienie się półki | brak | brak | - |
| zaznaczenie / odznaczenie | brak (pierścień od razu, DZ2) | brak | emoji |
| zatwierdzenie | brak | brak | „Gotowe” (kolor gracza) |
| odsłona prawdziwego wyniku / koniec partii | brak (półka z ramkami `success` i kropkami graczy) | brak | „Rewanż” / „Do lobby” |

---

## Odstępstwa z powodem (bez wagi)

| Gra | `plik:linia` | Co | Powód (źródło) |
|---|---|---|---|
| Kolor liter | `Stroop.tsx:5`, `:26`, `:38` | `HUES` spoza tokenów, w tym `#ff2445` (wartość `accent`) jako kolor czerwonych liter | `DESIGN.md` §6 „napisy Koloru liter”, D-04 (jedno źródło w pliku). Uwaga: ta sama paleta stoi osobno w `Simon.tsx:16-19` (komentarz `Stroop.tsx:4`: „jak pola Simona”); wspólna stała dla obu gier uprościłaby utrzymanie, nie jest wymagana |
| Kolor liter | `Stroop.tsx:5` | czerwony i zielony atrament trudne do odróżnienia przy daltonizmie | gra polega na kolorze (treść, `DESIGN.md` §6); zasada „kolor nigdy nie jest jedynym sygnałem” dotyczy interfejsu |
| Inny element | `Inny.tsx:22` | wypełnienie figur `hsl(...)` | `DESIGN.md` §6 „figury Innego elementu”, D-04 |
| wszystkie gry quizowe, Dziesiątki | `Quiz.tsx:33`, `:195`; `Dziesiatki.tsx:73` | blokada 1 s po pomyłce (przyciski `disabled`) | zasada gry z `KONCEPT.md` §2.4 („pomyłka blokuje na 1 s”), nie animacja blokująca ruch |

## Rozbieżności (zestawienie)

| ID | Waga | Gra | Krótko | `plik:linia` | Klucz |
|---|---|---|---|---|---|
| ZK1 | wysoka | Zakupy | „Gotowe” na `onClick` kończy pomiar czasu (drugie kryterium rankingu) | `Zakupy.tsx:175`, `:71` | - |
| QZ1 | średnia | quizy, Dziesiątki (+ Refleks, Stój!) | własna tabela `Results` zamiast `Scores` | `Quiz.tsx:47-138` | `wlasna-tabela-wynikow` |
| QZ2 | niska | Inny element, Literówka, Dziesiątki | siatka `repeat(N, 1fr)` bez `minmax(0, 1fr)` | `Quiz.tsx:246`, `Dziesiatki.tsx:130` | `siatka-1fr` |
| QZ3 | niska | gry quizowe | błysk trafienia pada na przycisk nowego pytania | `Quiz.tsx:184`, `:189`, `:250`, `:256` | - |
| ST1 | niska | Kolor liter | podgląd: cztery nazwy w rzędzie szersze niż okno 294 px (statycznie) | `Stroop.tsx:30`, `Quiz.tsx:145` | - |
| ST2 | niska | Kolor liter | instrukcja „napisana innym kolorem”, a co czwarta plansza zgodna | `Stroop.tsx:22` | - |
| LI1 | niska | Liczenie | działanie i odpowiedzi bez `tabular-nums` | `Liczenie.tsx:20`, `:24`, `:25` | `liczby-mono` |
| IN1 | niska | Inny element | komórki siatki bez nazwy dostępnej | `Inny.tsx:21`, `:50` | `aria-label` |
| IN2 | niska | Inny element | „Dotknij symbol” zamiast „symbolu” | `Inny.tsx:49` | - |
| OB1 | niska | Obrót | `rx` klocków poza skalą zaokrągleń (treść gry) | `Obrot.tsx:26` | `promien` |
| OB2 | niska | Obrót | podgląd „ta sama / lustro” małymi, przyciski wielkimi | `Obrot.tsx:55` | `slowa` |
| DZ1 | niska | Dziesiątki (wobec Sudoku, Zakupy) | zaznaczenie samym odcieniem 1 px, bez `aria-pressed`, inny wzór niż w Sudoku i Zakupach | `Dziesiatki.tsx:143` | `zaznaczenie-gracza` |
| DZ2 | niska | Dziesiątki, Sudoku, Zakupy | zaznaczenie bez przejścia 100 ms | `Dziesiatki.tsx:143`, `Sudoku.tsx:156`, `Zakupy.tsx:165` | `zaznaczenie-bez-przejscia` |
| SC1 | niska | Tabela Schultego, Sudoku | kara w sekundach przez szablon, bez przecinka (dziś całkowita) | `Schulte.tsx:83`, `:115`, `:130`; `Sudoku.tsx:95`, `:123`, `:138` | `przecinek` |
| SC2 | niska | Tabela Schultego | podpisy osi wykresu około 8,3 px | `Schulte.tsx:172`, `:178` | - |
| SU1 | niska | Sudoku | plansza `w-64` (stałe piksele) | `Sudoku.tsx:142` | `stale-piksele` |
| SU2 | niska | Sudoku | klawiatura cyfr aktywna bez wybranego pola, bez podpisu | `Sudoku.tsx:166-177` | - |
| SU3 | niska | Sudoku | puste pola bez `aria-label`, wybrane bez `aria-pressed` | `Sudoku.tsx:150-160` | `aria-label` |
| ZK2 | niska | Zakupy | pasek pokazu: inline `transition` 10 s, przy reduced-motion od razu pusty, tor `bg-surface` | `Zakupy.tsx:133-134` | `brak-w-tabeli-5` |
| ZK3 | niska | Zakupy | „Lista zakupów” bez `.label` | `Zakupy.tsx:92` | `podpis-label` |
| ZK4 | niska | Zakupy | kto zaznaczył przedmiot: sam kolor kropki 6 px | `Zakupy.tsx:100-106` | - |
| ZK5 | niska | Zakupy | długi wynik w `Scores` łamie się i ściska nick na 360 px | `Zakupy.tsx:83` | - |

Razem: 1 wysoka, 1 średnia, 20 niskich (22 wpisy). Literówka nie ma własnych rozbieżności (tylko wpisy `Quiz.tsx`).

Odwołania do platformy bez powtórzeń (D-03, D-10): `tile-hit` / `tile-miss` poza listą §5 (B-45, B-46), `preview-half` / `preview-quarter` (B-39, B-40), `Intro` (B-72, w tym B-73, B-74), `Stats` (B-65), `tenth` (B-66), `Scores` (B-64).

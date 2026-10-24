# 02-10 FINDINGS: mini-gry do pierwszej pomyłki (Trzy kubki, Śledzenie, Wieża, W pamięci)

**Data:** 2026-10-24
**Plan:** `.planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-10-PLAN.md`
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI), decyzje D-01..D-13 z `02-CONTEXT.md`.
**Punkt odniesienia:** `02-02-BASELINE.md` (B-xx, W-xx), dowody grepa z `02-01-CHECKS.md` (numer sekcji CHECKS w nawiasie, np. „CHECKS §15”).
**Stan kodu:** gałąź `labirynt`; `Kubki.tsx` 186 linii, `Sledzenie.tsx` 176, `Wieza.tsx` 173, `WPamieci.tsx` 175; zasady w `packages/games/src/{kubki,sledzenie,wieza,w-pamieci}.ts`.

## Metoda

- Lektura całych plików ekranów i stałych z plików zasad (`RADIUS`, `MOVE_MS`, `SHOW_MS`, `SPEED_*`, `MAX_STOP_MS`, `GAP`, `timeoutMove`), porównanie z tabelami §5 i z wzorcami B-xx.
- **360×640 sprawdzono statycznie (D-09)**, bez przeglądarki i bez serwerów dev. Wysokość liczona z klas: `Screen` `pt-6` + `pb-6` (48 px), nagłówek `Game.tsx:233` jako `.tile p-4` z tytułem i `GameDots` (wiersz 48 px), odstępem 12 px i paskiem limitu (około 20 px), razem około 114 px, plus `gap-3` (12 px) do sekcji gry; stała część około 174 px. `Stats` około 60 px (`py-2`, `.label` + `text-lg`). Szerokość treści na 360 px: 328 px (B-55). Kafle gier mają `max-w-[calc(100dvh-Nrem)]`, więc przy 640 px wysokości rozmiar to `min(328, 640 − 16·N)`.
- Wszystkie cztery gry toczą się w całości na kliencie z danymi z `view` (ustalone przy `setup`); serwer przysyła w trakcie tylko postęp i wyniki innych. „Nowy stan z serwera przerywa animację” oceniono jako: czy ponowny render w trakcie ruchu nie nadpisuje pozycji ustawianych z JS i czy nie restartuje ruchu.
- Wagi wg D-07. Wspólne komponenty: gry używają tylko `Intro`, `Stats`, `Scores` z `ui.tsx` (B-64, B-65, B-72, zgodne), `Quiz.tsx` i `Szacowanie.tsx` nie używają (`Szacowanie.tsx` pojawia się tylko jako odsyłacz w WP2).

## Wspólne dla czterech gier

- **Ruch jako treść gry a reduced motion (D-05, B-53).** Kubki, Śledzenie i Wieża ustawiają pozycje z JS (`requestAnimationFrame`) bez `reducedMotion`. Przy `prefers-reduced-motion` **wszystkie trzy pozostają grywalne**: ruch z JS działa dalej, a reguła globalna `index.css:360-368` zeruje tylko przejścia i keyframes pomocnicze (uniesienie kubka, przesunięcie widoku wieży, ucięty kawałek, werdykt), które przeskakują do stanu końcowego. Jedyna strata informacji: werdykt Wieży (WZ1). Lista „Odstępstwa z powodem” na końcu, z odsyłaczem do B-53 (luka w `ZASADY.md` §5 do decyzji w fazie 4).
- **Wskazanie nie zależy od klatki animacji.** Kubki liczą wskazane miejsce z tercji kafla i miejsca kulki z `kubkiBallAt` (dane serwera), Śledzenie z pozycji końcowych `sledzeniePosition(ball, round, MOVE_MS)` (ten sam wzór co serwer), Wieża z czasu zatrzymania wpisanego do tego samego wzoru `wiezaLeft`, co serwer. Żadna gra nie czyta pozycji z DOM. Zgodne z `ZASADY.md` §5 „Pomiar czasu nigdy nie zależy od animacji” (uwaga o źródle czasu w Wieży: WZ2).
- **Ponowny render w trakcie ruchu.** W Kubkach, Śledzeniu i Wieży efekt z `requestAnimationFrame` zależy tylko od `[phase]` (Wieża `[phase, level]`), a wartości `style` w wirtualnym DOM są w trakcie ruchu stałe (pozycja startowa), więc React ich nie nadpisuje: postęp i wyniki innych graczy nie przerywają ani nie cofają ruchu. Po końcu ruchu render ustawia pozycję końcową z wzoru (skok najwyżej o jedną klatkę). Zgodne.
- **Wibracje (W-09).** Każda gra ma jedno `navigator.vibrate?.(60)` przy pomyłce kończącej partię, z `?.`, bez wibracji przy trafieniu i bez powtarzania wibracji tury (CHECKS §15). Zgodne.
- **Koniec partii po pomyłce.** Kubki, Śledzenie i Wieża po 1 s same wysyłają wynik i pokazują `Scores`; W pamięci czeka na przycisk (WP3).

## Trzy kubki (`kubki`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: kubki `bg-fg` (`Kubki.tsx:39`, `:173`), kulka w kolorze gracza przez `style` (`:38`, `:171`), kafel `.tile`. Tylko tokeny i kolor gracza (W-02, CHECKS §1: 0 trafień). Akcentu brak (CHECKS §2: 0), przycisków w partii brak. Zgodne.
- Kolor nie jest jedynym sygnałem: pomyłkę pokazuje słowo „Pomyłka” w `Stats` (`:147`, `:154`), przygaszony wskazany kubek (`:177`) i uniesiony właściwy; trafienie słowo „Dobrze”. Zgodne (`DESIGN.md` §5).
- Cienie i zaokrąglenia: brak cieni; kształt kubka z `clip-path` (treść gry), kulka `rounded-full`. Zgodne.
- Pole gry na czas: kafel `touch-none select-none` z `onPointerDown` (`:157`), bez `onClick` (CHECKS §5). Zgodne (W-13). Gra nie mierzy czasu, ale zasada i tak spełniona.
- Pola dotykowe: dotyk łapie cały kafel i wybiera tercję (`:112-115`); na 360 px kafel 328 × 219 px, tercja około 109 × 219 px, kubek 24% (około 79 px). Zgodne (W-06).
- Dotyk w trakcie pokazu i tasowania jest ignorowany bez komunikatu (`:113`); co robić, mówi pole „Teraz” w `Stats` („Patrz”, „Śledź”, „Wskaż”). Zgodne z `DESIGN.md` §4 („stan, który coś blokuje, tłumaczy się podpisem”).
- **360×640 (statycznie):** kafel `aspect-[3/2]`, `max-w-[calc(100dvh-19rem)]` = min(328, 336) = 328 px, wysokość 219 px. Ekran: 174 + 60 (`Stats`) + 8 + 219 ≈ 461 px. Brak stałych pikseli, brak SVG, pozycje w %. Zgodne.

Bez rozbieżności w tej podsekcji.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Teksty po polsku, bez em-dashy i ułamków (CHECKS §7: 0 trafień); odmiana „runda / rundy / rund” (`:29`). Słowa przycisków: tylko „Start” z `Intro`; „Rewanż” / „Do lobby” daje `Game.tsx`. Zgodne (W-18).
- Liczby nad polem gry tylko w `Stats` („Runda 3/20”, `:151-156`). Wynik przez `Scores` (`:129`, W-04). Tabeli rund nie ma (gra jej nie potrzebuje). Zgodne (W-01, W-07, W-16).
- `Intro` (`:137-143`): `Preview` z pliku gry z `preview-half` 3 s w pętli (`:38`), punkty `time` / `task` / `score` z właściwą treścią, „Start” z `ui.tsx`. Przy reduced motion podgląd pokazuje kulkę nad środkowym kubkiem (bazowo widoczna), czytelna klatka (W-12). Zgodne (W-08, CHECKS §10a).
- Dostępność: puste `span` kubków i kulki nie są czytane; brak przycisków bez tekstu (CHECKS §9: 0). Zgodne.

Bez rozbieżności w tej podsekcji.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

Ocena każdego timera, animacji i wibracji w pliku:

| Miejsce | Co | Ocena |
|---|---|---|
| `Kubki.tsx:38` | `preview-half` 3 s ∞ w `Preview` | zgodne (B-39) |
| `Kubki.tsx:65` | `setTimeout` faz `wait` 300 ms, `show` `KUBKI_SHOW_MS` (1000 ms), `reveal` 1000 ms | zgodne: logika gry (czas pokazania kulki z zasad), nie animacja; przy reduced motion bez zmian |
| `Kubki.tsx:90`, `:106` | `requestAnimationFrame` tasowania, pozycje wprost w DOM, łuk `ARC` 30% | odstępstwo z powodem (B-53, komentarz `:77-78`); czas zamiany: KB2 |
| `Kubki.tsx:89` | `performance.now()` jako początek tasowania | zgodne: tylko do ruchu, wynik nie jest czasem; `Math.max(0, …)` (`:92`) chroni przed znacznikiem klatki sprzed startu |
| `Kubki.tsx:173` | `transition-transform duration-150` uniesienia kubka | KB1 |
| `Kubki.tsx:118` | `navigator.vibrate?.(60)` przy `slot !== ballSlot` | zgodne (pomyłka, nie przy trafieniu, `?.`) |

- Kulka widoczna 1 s: uniesienie zaczyna się na starcie `show` i opada po 1000 ms, przejście 150 ms w obie strony, więc kulkę widać około 1 s (symetrycznie). Zgodne z `ZASADY-GIER.md`.
- Po wskazaniu właściwy kubek unosi się na 1 s (`:161`), wskazany zły przygasa do 0,3 bez przejścia (`:177`). Zgodne.
- Przy reduced motion uniesienie przeskakuje (B-51), tasowanie z JS trwa dalej: gra grywalna.

**KB1.** Trzy kubki, `apps/web/src/games/Kubki.tsx:173`: uniesienie kubka ma `duration-150` (domyślne 150 ms Tailwinda), a tabela §5 daje przejściu stanu 180 ms. Źródło: `ZASADY.md` §5 „Czasy”. Waga: **niska** `[zbiorcze: transition-domyslny]` (jak B-62). Propozycja: `duration-[180ms]` (tak ma już `Wieza.tsx:140`) albo uznać 150 ms w tabeli §5.

**KB2.** Trzy kubki, `apps/web/src/games/Kubki.tsx:81-104` (`kubkiSwapMs`, od 500 do 150 ms na zamianę): ruch zamiany nie ma kategorii w tabeli czasów §5 (czas wynika z zasad gry i rośnie trudność). Źródło: `ZASADY.md` §5 „Czasy”, D-06. Waga: **niska** `[zbiorcze: brak-w-tabeli-5]`. Propozycja: przy dopisywaniu wyjątku B-53 dodać wiersz „ruch będący treścią gry: czas z `ZASADY-GIER.md`” (obejmie Kubki, Śledzenie, Wieżę, Za zasłoną).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w `Stats` |
|---|---|---|---|
| pojawienie elementu (kulka na starcie rundy) | uniesienie kubka, `transition-transform` 150 ms; kubki opadają przez 300 ms (`wait`) | brak | „Teraz: Patrz” |
| ruch (tasowanie) | JS `requestAnimationFrame`, 500→150 ms na zamianę, łuk góra / dół | brak | „Teraz: Śledź” |
| trafienie | właściwy kubek unosi się (150 ms) | brak | „Teraz: Dobrze” (bez koloru) |
| pomyłka | wskazany kubek krycie 0,3 bez przejścia, właściwy unosi się (150 ms), „Pomyłka” w `warning` | 60 | „Teraz: Pomyłka” |
| odsłona prawdziwego wyniku | jak trafienie / pomyłka, 1 s | jak wyżej | - |
| koniec rundy | kubki opadają 150 ms, przerwa 300 ms | brak | - |
| koniec partii | po 1 s same `Scores` (bez animacji) | brak (poza pomyłką) | „Rewanż” / „Do lobby” (`Game.tsx`) |
| zbicie, moja tura | nie występują (moja tura w `Game.tsx`) | - | - |

## Śledzenie (`sledzenie`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: kulki `bg-fg` (`Sledzenie.tsx:158`), cele w pokazie i zaznaczone kulki w kolorze gracza (`:164`), odsłona: pierścień `outline` 3 px `var(--color-success)` na prawdziwych celach (`:167`), złe wskazania krycie 0,3 (`:166`). Tylko tokeny i kolor gracza, `success` w roli „trafienie / dobrze” (CHECKS §1: 0). Akcentu i przycisków w partii brak. Zgodne z W-02, W-05.
- Pole gry: `touch-none select-none`, `onPointerDown` (`:148`). Zgodne (W-13).
- **360×640 (statycznie):** kafel `aspect-square`, `max-w-[calc(100dvh-19rem)]` = min(328, 336) = 328 px. Ekran: 174 + 60 + 8 + 328 ≈ 570 px. Pozycje i rozmiar kulek w % (`SIZE` `:18`). Zgodne.

**SL1.** Śledzenie, `apps/web/src/games/Sledzenie.tsx:151`, `:158`, `:164`: cele w fazie pokazu (1,5 s) i zaznaczone kulki różnią się od reszty tylko wypełnieniem (kolor gracza zamiast `fg`). Przy żółtym graczu (`#ffc53d`) i `fg` (`#ededef`) kontrast jasności wynosi około 1,3:1, więc dla części osób z zaburzeniami widzenia barw cele są słabo widoczne, a od tego zależy cała runda. Źródło: `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem”. Waga: **średnia** `[zbiorcze: kolor-jedyny-sygnal]`. Propozycja: dodać sygnał kształtu, np. obrys 3 px w kolorze gracza z odsunięciem (jak pierścień `success` w odsłonie, `:167-168`) albo ciemny punkt w środku celu i zaznaczonej kulki.

**SL2.** Śledzenie, `apps/web/src/games/Sledzenie.tsx:94-101` z `packages/games/src/sledzenie.ts:9`, `:25`: kulka ma średnicę 12% kafla (około 39 px na 328 px). Dotyk wybiera najbliższą kulkę w promieniu `2 * RADIUS`, więc obszar jest większy niż kulka, ale po zatrzymaniu środki mogą być od siebie o `GAP` = 0,14 (około 46 px): obszar dotyku między dwiema bliskimi kulkami ma wtedy około 46 px, a przy krawędzi kafla (kulka 0,06 od brzegu, dotyk poza kaflem się nie liczy) około 43 px. Źródło: `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”, `AGENTS.md`. Waga: **średnia** `[zbiorcze: dotyk-48]` (tylko na najwęższych ekranach i przy najbliższym ułożeniu). Propozycja: `GAP` co najmniej 0,15 (48 / 328) w zasadach gry (zmiana zasad, decyzja fazy 4) albo uznać za wyjątek w `DESIGN.md` §6.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Teksty po polsku, bez em-dashy i ułamków (CHECKS §7: 0). „Wskaż 2/3” w `Stats` (`:138`). Słowa przycisków tylko z `Intro` i `Game.tsx`. Zgodne.
- Liczby nad polem tylko w `Stats` (`:142-147`), wynik w `Scores` (`:118`) jako „3 rundy +2” z objaśnieniem plusa (`:119-121`). Zgodne (W-01, W-04, W-16).
- `Intro` (`:128-134`): `Preview` z 8 kropkami i 3 celami w `preview-half` 3 s (`:35`), komplet punktów, „Start”. Przy reduced motion cele bazowo podświetlone, czytelna klatka (W-12). Zgodne (W-08).
- Dostępność: puste `span` kulek, brak przycisków bez tekstu (CHECKS §9: 0). Zgodne.

Bez rozbieżności w tej podsekcji.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Miejsce | Co | Ocena |
|---|---|---|
| `Sledzenie.tsx:35` | `preview-half` 3 s ∞ w `Preview` | zgodne (B-39) |
| `Sledzenie.tsx:58` | `setTimeout` faz `wait` 700 ms, `show` `SHOW_MS` (1500 ms), `reveal` 1000 ms | zgodne: logika gry (cele widać 1,5 s, jak w `ZASADY-GIER.md`) |
| `Sledzenie.tsx:75`, `:85` | `requestAnimationFrame` ruchu 8 kulek przez `MOVE_MS` (5 s), prędkość `SPEED_START + round * SPEED_STEP` | odstępstwo z powodem (B-53); czas: SL3. W pliku brak komentarza, dlaczego bez `reducedMotion` (powód jest tylko w `Kubki.tsx:77-78`) |
| `Sledzenie.tsx:74` | `performance.now()` jako początek ruchu | zgodne: tylko do ruchu, wynik to wskazania, nie czas |
| `Sledzenie.tsx:107` | `navigator.vibrate?.(60)` przy `!next.every(isTarget)` | zgodne (pomyłka po trzecim wskazaniu, nie przy trafieniu, `?.`) |

- Podświetlenie celu i zaznaczenia zmienia się bez przejścia (natychmiast), pierścień odsłony też. Zgodne (bodziec bez przejścia).
- Przy reduced motion nic się nie zmienia (gra nie ma przejść CSS w polu), gra grywalna.

**SL3.** Śledzenie, `apps/web/src/games/Sledzenie.tsx:72-88`: ruch kulek (5 s, coraz szybszy) nie ma kategorii w tabeli §5. Źródło: `ZASADY.md` §5 „Czasy”, D-06 (wymienia ten przypadek). Waga: **niska** `[zbiorcze: brak-w-tabeli-5]`. Propozycja: jak KB2 (jeden wiersz „ruch będący treścią gry”), a w pliku komentarz o reduced motion jak w `Kubki.tsx:77-78`.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w `Stats` |
|---|---|---|---|
| pojawienie elementu (cele) | podświetlenie bez przejścia, 1,5 s (po pustej przerwie 700 ms) | brak | „Teraz: Patrz” |
| ruch | JS `requestAnimationFrame`, 5 s | brak | „Teraz: Śledź” |
| zaznaczenie kulki | wypełnienie kolorem gracza bez przejścia (drugie dotknięcie zdejmuje) | brak | „Teraz: Wskaż 1/3” |
| trafienie | pierścień `success` na celach, bez przejścia | brak | „Teraz: Dobrze” (bez koloru) |
| pomyłka | złe wskazania krycie 0,3, pierścień `success` na prawdziwych celach, „Pomyłka” w `warning` | 60 | „Teraz: Pomyłka” |
| odsłona prawdziwego wyniku | jak wyżej, 1 s | jak wyżej | - |
| koniec rundy | przerwa 700 ms bez podświetleń | brak | - |
| koniec partii | po 1 s same `Scores` | brak (poza pomyłką) | „Rewanż” / „Do lobby” (`Game.tsx`) |
| zbicie, moja tura | nie występują | - | - |

## Wieża (`wieza`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: podstawa `bg-fg-muted` (`Wieza.tsx:141`, szarość „wszystko inne” z `DESIGN.md` §5), klocki w kolorze gracza (`:147`, `:155`), ucięty kawałek `bg-warning` (`:142`, strata szerokości = kara), werdykt `text-warning` / `text-success` / `fg` (`:163`). Tylko tokeny i kolor gracza. Zgodne (W-02).
- Kolor nie jest jedynym sygnałem: werdykt ma słowo („Pudło”, „Idealnie!”, procent). Zgodne (z zastrzeżeniem WZ1 przy reduced motion).
- Pole gry: `touch-none select-none`, `onPointerDown` (`:137-138`), bez `onClick`. Zgodne (W-13). Pole dotyku to cały kafel. Zgodne (W-06).
- Zaokrąglenia: klocki prostokątne (treść gry); `rounded-sm` w podglądzie: WZ3.
- **360×640 (statycznie):** kafel `aspect-square`, `max-w-[calc(100dvh-22rem)]` = min(328, 288) = 288 px. Ekran: 174 + 60 + 8 + 288 + 8 + podpowiedź (`:170`, 2 linie `text-sm`, około 40 px) ≈ 578 px. Wieża 30 pięter: widać 8 rzędów (`VISIBLE` `:16`), widok zjeżdża przez `translateY` (`:125`, `:140`), strona się nie przewija. `Stats` z trzema pozycjami („Wysokość 12/30”, „Szerokość 35%”, „Seria 3”) mieści się w 296 px (B-65). Zgodne.

**WZ3.** Wieża, `apps/web/src/games/Wieza.tsx:29-31`: klocki w `Preview` mają `rounded-sm` (4 px), spoza skali 20 / 10 / 999 px, a klocki w grze są prostokątne. Źródło: `DESIGN.md` §2 „Zaokrąglenia”, CHECKS §3. Waga: **niska** `[zbiorcze: promien]`. Propozycja: usunąć `rounded-sm` (podgląd jak gra).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Teksty po polsku, bez em-dashy; procent zaokrąglony do całości (`percent` `:23`), bez ułamków. Zgodne (W-03).
- Liczby nad polem tylko w `Stats` (`:129-135`); werdykt w polu to pływająca liczba `float-up` (kategoria „pływająca liczba” z §5), mono `tabular-nums`, `pointer-events-none`. Wynik w `Scores` (`:103`) jako „12 pięter (35%)”. Zgodne (W-01, W-04, W-16).
- `Intro` (`:113-119`): `Preview` z trzecim klockiem w `preview-half` 3 s (`:31`), komplet punktów, „Start”. Przy reduced motion widać trzy klocki naraz (wieża), czytelna klatka (W-12). Zgodne (W-08).
- Dostępność: warstwa wieży `aria-hidden` (`:140`). Zgodne.

**WZ4.** Wieża, `apps/web/src/games/Wieza.tsx:116` i `:170`: instrukcja mówi „zostaje ucięte”, a podpowiedź pod polem „zostaje odcięte” (`ZASADY-GIER.md` i `KONCEPT.md`: „ucinane”). Źródło: `ZASADY.md` §4 „te same słowa”. Waga: **niska** `[zbiorcze: slowa]`. Propozycja: „ucięte” w obu miejscach.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Miejsce | Co | Ocena |
|---|---|---|
| `Wieza.tsx:31` | `preview-half` 3 s ∞ w `Preview` | zgodne (B-39) |
| `Wieza.tsx:77`, `:81` | `requestAnimationFrame` jazdy klocka, `style.left` z `wiezaLeft` | odstępstwo z powodem (B-53); czas: WZ5 |
| `Wieza.tsx:79` | samoczynny spadek po `WIEZA_MAX_STOP_MS` (5 s) wołany z klatki | zgodne: czas zapisany jako 5000 niezależnie od klatki; przy ukrytej karcie klatki stają, więc spadek przychodzi po powrocie (bez wpływu na wynik) |
| `Wieza.tsx:76`, `:138` | `performance.now()`: start jazdy i czas zatrzymania | zgodne z §5 (czas nie zależy od animacji); źródło czasu: WZ2 |
| `Wieza.tsx:88` | `setTimeout` `OVER_MS` 1000 ms przed wysłaniem wyniku | zgodne: logika gry |
| `Wieza.tsx:140` | `transition-transform duration-[180ms]` przesunięcia widoku | zgodne (przejście stanu 180 ms); jadący klocek jest w tej warstwie, ale przesunięcie jest pionowe, a pomiar poziomy |
| `Wieza.tsx:142` | `piece-fall` 0,5 s `ease-in` `forwards` uciętego kawałka | zgodne co do użycia; keyframes spoza listy §5 opisuje B-47 `[zbiorcze: keyframes-poza-5]` (bez osobnego wpisu, D-03) |
| `Wieza.tsx:146` | `tile-hit` 0,35 s przy trafieniu idealnym | zgodne z W-10 (trafienie = `tile-hit` 0,35 s jak w innych grach); poza listą §5: B-45 |
| `Wieza.tsx:162` | `float-up` 1,6 s `forwards` werdyktu | zgodne co do czasu (B-44); reduced motion: WZ1 |
| `Wieza.tsx:68` | `navigator.vibrate?.(60)` przy `built.height < next.length` | zgodne (pudło, także po samoczynnym spadku; ucięcie częściowe i ostatnie piętro nie wibrują) |

**WZ1.** Wieża, `apps/web/src/games/Wieza.tsx:162`: werdykt („Pudło”, „Idealnie!”, procent szerokości) żyje tylko w `float-up` z `forwards`. Przy `prefers-reduced-motion` reguła `index.css:360-368` skraca animację do 0,01 ms, więc tekst od razu ląduje w stanie końcowym `opacity: 0` i gracz go nie widzi (B-51: „animacje z `forwards` od razu lądują w stanie końcowym”). Gra zostaje grywalna (`Stats` pokazuje wysokość i szerokość, pudło kończy partię), ale informacja znika. Ten sam mechanizm dotyczy `Balon.tsx:157` i „+1” w `ui.tsx:132`. Źródło: `ZASADY.md` §5 „`prefers-reduced-motion`” (przeskok do stanu końcowego zakłada, że stan końcowy coś pokazuje), `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem” (tu: ruch). Waga: **niska** `[zbiorcze: float-up-reduced-motion]`. Propozycja (decyzja platformy w fazie 4): w regule reduced-motion zostawić pływającą liczbę widoczną bez ruchu (np. `@media (prefers-reduced-motion: reduce)` z `animation-name: none` dla `float-up` i wygaszenie przez zmianę stanu) albo powtarzać werdykt w `Stats`.

**WZ2.** Wieża, `apps/web/src/games/Wieza.tsx:138` i `:76`: czas zatrzymania to `performance.now()` w chwili wykonania handlera, a start to `performance.now()` w `useEffect` (po malowaniu). Pomiar nie zależy od animacji (zgodne z §5), ale od opóźnienia obsługi zdarzenia; `Zaslona.tsx:99`, `Przytrzymaj.tsx:90` i `Rytm.tsx:85` biorą `e.timeStamp` (chwilę dotyku). Przy prędkości do 1,37 szerokości pola na sekundę (piętro 30) każde 10 ms to około 1,4% pola, a próg trafienia idealnego `SNAP` to 2%. Źródło: `ZASADY.md` §5 „Pomiar czasu”. Waga: **niska** `[zbiorcze: pomiar-timestamp]` (bez zależności od animacji). Propozycja: `e.timeStamp - started.current` w `onPointerDown`, jak w pozostałych grach z pomiarem z dotyku.

**WZ5.** Wieża, `apps/web/src/games/Wieza.tsx:74-84`: jazda klocka (prędkość `SPEED_START + level * SPEED_STEP`) nie ma kategorii w tabeli §5. Źródło: `ZASADY.md` §5 „Czasy”, D-06. Waga: **niska** `[zbiorcze: brak-w-tabeli-5]`. Propozycja: jak KB2; w pliku komentarz o reduced motion jak w `Kubki.tsx:77-78`.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie elementu (nowy klocek) | bez animacji, od razu jedzie (JS `requestAnimationFrame`) | brak | - |
| trafienie idealne | `tile-hit` 0,35 s na klocku + werdykt `float-up` 1,6 s w `success` | brak | „Idealnie!” |
| trafienie z ucięciem | `piece-fall` 0,5 s (kawałek `warning`) + werdykt `float-up` 1,6 s | brak | „35%” |
| pomyłka (pudło, także po 5 s) | cały klocek `piece-fall` 0,5 s + werdykt `float-up` 1,6 s w `warning` | 60 | „Pudło” |
| odsłona prawdziwego wyniku | werdykt (jak wyżej) | - | - |
| koniec rundy (piętro w górę) | widok zjeżdża `transition-transform` 180 ms | brak | - |
| koniec partii | po 1 s same `Scores` | brak (poza pudłem) | „Rewanż” / „Do lobby” (`Game.tsx`) |
| zbicie, moja tura | nie występują | - | - |

## W pamięci (`w-pamieci`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: „Dobrze” `text-success` (`WPamieci.tsx:127`), w odsłonie wynik `text-success` (`:160`) i wpisana liczba `text-warning` (`:163`), oba ze słowem („= 57”, „wpisałeś 12”). Tylko tokeny i kolor gracza. Zgodne (W-02).
- Akcja w partii „Zatwierdź” (`:149`) i „Wyniki” (`:169`) jako `btn text-bg` z kolorem gracza; `btn-primary` brak (CHECKS §2). Zgodne z `DESIGN.md` §5 (słowo „Wyniki”: WP2).
- Pole odpowiedzi `.field` (48 px), `inputMode="numeric"`, `enterKeyHint="done"`, `autoFocus`, tylko cyfry do 3 znaków (`:139-147`); przycisk `.btn` 48 px. Zgodne (W-06).
- `touch-none` brak, `onClick` na „Wyniki” (CHECKS §5: `WPamieci.tsx` bez `touch-none`, `:169`): gra nie mierzy czasu, wynik to wpisana liczba, więc wymóg pola gry na czas jej nie dotyczy. Zgodne.
- **360×640 (statycznie):** kafel `aspect-square`, `max-w-[calc(100dvh-23.5rem)]` = min(328, 264) = 264 px (ten sam wzór co `Szacowanie.tsx:140`). Faza odpowiedzi: formularz w kaflu (podpis ~20 px + pole ~56 px + 12 + przycisk 48 px + `p-4`) ≈ 170 px z 264. Odsłona: ciąg do 14 pozycji `text-lg` mono w 232 px łamie się w 2-3 wiersze (około 120 px w kaflu) + przycisk pod kaflem. Ekran: 174 + 60 + 8 + 264 + 8 + 48 ≈ 562 px. Zgodne.

Bez rozbieżności w tej podsekcji.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Znaki działań z danych: „−” (U+2212) i „×” (`packages/games/src/w-pamieci.ts:13`), w podglądzie „+7”, „×2”, „= ?” (`:28`). Czas w `Intro` z przecinkiem („1,5 s”, `:107`). Bez em-dashy. Zgodne (W-03).
- Liczby nad polem tylko w `Stats` („Runda”, „Działanie 2/5”, `:120-125`); pokazywana pozycja `font-mono text-6xl tabular-nums` (`:130`); odsłona `font-mono tabular-nums` (`:156`, `:160` dziedziczy mono z rodzica, CHECKS §8 do oceny → zgodne). Wynik w `Scores` (`:97`) jako „5 rund (o 3)”. Zgodne (W-01, W-04, W-16).
- „Ile wyszło?” (`:138`) i „wpisałeś” (`:163`) mają ten sam zapis co `Szacowanie.tsx:146`, `:172` (spójne między grami).
- `Intro` (`:105-111`): `Preview` z czterema pozycjami w `preview-quarter` 4 s, kolejność ujemnym `animationDelay` (`:31-32`), komplet punktów, „Start”. Przy reduced motion widać tylko „5” (reszta bazowo `opacity-0`), czytelna klatka (W-12). Zgodne (W-08).
- Dostępność: pole w `label`, przyciski z tekstem (CHECKS §9: 0). Zgodne.

**WP2.** W pamięci, `apps/web/src/games/WPamieci.tsx:170`: przycisk po pomyłce mówi „Wyniki”, spoza wspólnego zestawu („Dalej” w tej samej roli: przejście do następnego ekranu). To samo słowo ma `Szacowanie.tsx:183` (ocena w 02-09, tu tylko odsyłacz, D-03). Źródło: `ZASADY.md` §4 „te same słowa co w innych grach”. Waga: **średnia** `[zbiorcze: slowa]`. Propozycja: „Dalej” (albo dopisać „Wyniki” do zestawu w `ZASADY.md` §4, jeśli zostaje w obu grach).

**WP4.** W pamięci, `apps/web/src/games/WPamieci.tsx:127`: trafienie to napis „Dobrze” w `success` na środku kafla przez 800 ms, a w Trzech kubkach (`Kubki.tsx:147`) i Śledzeniu (`Sledzenie.tsx:138`) to samo słowo stoi w `Stats` („Teraz”) bez koloru. Źródło: `ZASADY.md` §5 „Ta sama sytuacja w nowej grze używa tej samej animacji” (tu: tego samego sygnału), `ZASADY.md` §4 „te same słowa”. Waga: **niska** `[zbiorcze: sytuacja-trafienie]` (bez animacji, słowo to samo). Propozycja: do macierzy 02-11; jedno miejsce na „Dobrze” w grach do pierwszej pomyłki (np. `Stats` „Teraz” we wszystkich czterech, Wieża ma werdykt w polu).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Miejsce | Co | Ocena |
|---|---|---|
| `WPamieci.tsx:31-32` | `preview-quarter` 4 s ∞, ujemny `animationDelay` | zgodne (B-40) |
| `WPamieci.tsx:55` | `setTimeout`: przerwa `WAIT_MS` 800 ms, każda pozycja `W_PAMIECI_SHOW_MS` (1500 ms) | zgodne: czas pokazu z zasad (logika gry, nie animacja), więc przy reduced motion nie przeskakuje; zgodny z `ZASADY-GIER.md` (1,5 s) |
| `WPamieci.tsx:130` | `stone-pop` 180 ms `ease-out` każdej pozycji (klucz z pozycji, dwa takie same działania wskakują osobno) | WP1 |
| `WPamieci.tsx:80` | `navigator.vibrate?.(60)` przy złej odpowiedzi | zgodne (pomyłka kończąca partię, nie przy trafieniu, `?.`) |

- Pojawienie się działania nie skraca czasu widoczności istotnie: `stone-pop` zaczyna od `opacity: 0` i `scale(1.6)`, ale po 180 ms pozycja jest w pełni widoczna, a stoper fazy liczy 1,5 s od zmiany pozycji. Zgodne z `ZASADY-GIER.md`.

**WP1.** W pamięci, `apps/web/src/games/WPamieci.tsx:130`: `stone-pop` trwa 180 ms, a tabela §5 daje pojawieniu się elementu 350 ms `ease-out` (W-10: pojawienie `stone-pop` 0,35 s). Krótszy czas ma sens (350 ms zjadałoby czwartą część 1,5 s pokazu), ale nie jest opisany. Źródło: `ZASADY.md` §5 „Czasy”, B-37. Waga: **niska** `[zbiorcze: czas-pojawienia]`. Propozycja: komentarz w kodzie i wiersz w tabeli §5 („pojawienie w pokazie na czas: 180 ms”) albo 350 ms z wydłużeniem pokazu o różnicę.

**WP3.** W pamięci, `apps/web/src/games/WPamieci.tsx:154-172` (wysłanie wyniku tylko w `:169`): po pomyłce gra pokazuje odsłonę i czeka na „Wyniki” bez limitu, a Trzy kubki (`Kubki.tsx:68-71`), Śledzenie (`Sledzenie.tsx:61-64`) i Wieża (`Wieza.tsx:88-91`) po 1 s same wysyłają wynik i przechodzą do `Scores`. Wynik nie jest wysłany przed dotknięciem: gracz, który odłoży telefon, po limicie 300 s dostanie `timeoutMove` z pustą listą odpowiedzi (`packages/games/src/w-pamieci.ts:89`), czyli 0 rund mimo zaliczonych. Źródło: `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji” (koniec partii po pomyłce w jednej rodzinie gier), `ZASADY.md` §5 „Animacja nie blokuje gry” (odsłona trzyma wynik). Waga: **średnia** `[zbiorcze: koniec-po-pomylce]`. Propozycja: wysłać wynik od razu przy pomyłce (`onMove` w `submit`), a odsłonę zostawić lokalnie z przyciskiem „Dalej” albo z samoczynnym przejściem (np. po 2,5 s jak odsłona w Który rok?). Ryzyko utraty wyniku do potwierdzenia w fazie 4 (to także sprawa przepływu partii, nie tylko wyglądu).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie elementu (liczba, działanie) | `stone-pop` 180 ms `ease-out`, widoczne 1,5 s | brak | - |
| trafienie | napis „Dobrze” w `success` przez 800 ms, bez animacji | brak | „Zatwierdź” |
| pomyłka | odsłona bez animacji: ciąg, „= wynik” w `success`, „wpisałeś N” w `warning` | 60 | „Zatwierdź” |
| odsłona prawdziwego wyniku | jak pomyłka, do dotknięcia (bez limitu) | - | „Wyniki” (WP2) |
| koniec rundy | pusty kafel 800 ms („Dobrze” po zaliczonej) | brak | - |
| koniec partii | po pomyłce dopiero po „Wyniki”; po 12 rundach od razu `Scores` | brak (poza pomyłką) | „Rewanż” / „Do lobby” (`Game.tsx`) |
| zbicie, moja tura | nie występują | - | - |

## Odstępstwa z powodem (D-04, D-05; bez wagi)

| Wzorzec | `plik:linia` | Powód |
|---|---|---|
| ruch kubków z JS bez `reducedMotion` | `Kubki.tsx:79-109` (komentarz `:77-78`) | ruch jest zadaniem (śledzenie identycznych kubków); przeskok do końca zrobiłby grę niegrywalną. Wyjątku nie ma jeszcze w `ZASADY.md` §5: B-53 (niska, platforma). Przy reduced motion gra grywalna |
| ruch kulek z JS bez `reducedMotion` | `Sledzenie.tsx:72-88` | jak wyżej (B-53); w pliku brak komentarza z powodem. Przy reduced motion gra grywalna |
| jazda klocka z JS bez `reducedMotion` | `Wieza.tsx:74-84` | jak wyżej (B-53); zatrzymanie jest pomiarem, więc ruch musi trwać. Przy reduced motion gra grywalna, traci werdykt (WZ1) |
| kształt kubka z `clip-path`, prostokątne klocki, kulki `rounded-full` | `Kubki.tsx:31`, `Wieza.tsx:123`, `Sledzenie.tsx:158` | kształty są treścią gry, nie elementami interfejsu |

## Lista wpisów

| ID | Gra | `plik:linia` | Źródło | Waga | Klucz |
|---|---|---|---|---|---|
| SL1 | Śledzenie | `Sledzenie.tsx:151`, `:158`, `:164` | `DESIGN.md` §5 | średnia | `kolor-jedyny-sygnal` |
| SL2 | Śledzenie | `Sledzenie.tsx:94-101`, `sledzenie.ts:9`, `:25` | `ZASADY.md` §4, `AGENTS.md` | średnia | `dotyk-48` |
| WP2 | W pamięci | `WPamieci.tsx:170` | `ZASADY.md` §4 | średnia | `slowa` |
| WP3 | W pamięci | `WPamieci.tsx:154-172`, `w-pamieci.ts:89` | `ZASADY.md` §5 | średnia | `koniec-po-pomylce` |
| KB1 | Trzy kubki | `Kubki.tsx:173` | `ZASADY.md` §5 | niska | `transition-domyslny` |
| KB2 | Trzy kubki | `Kubki.tsx:81-104` | `ZASADY.md` §5, D-06 | niska | `brak-w-tabeli-5` |
| SL3 | Śledzenie | `Sledzenie.tsx:72-88` | `ZASADY.md` §5, D-06 | niska | `brak-w-tabeli-5` |
| WZ1 | Wieża | `Wieza.tsx:162` | `ZASADY.md` §5 | niska | `float-up-reduced-motion` |
| WZ2 | Wieża | `Wieza.tsx:138`, `:76` | `ZASADY.md` §5 | niska | `pomiar-timestamp` |
| WZ3 | Wieża | `Wieza.tsx:29-31` | `DESIGN.md` §2 | niska | `promien` |
| WZ4 | Wieża | `Wieza.tsx:116`, `:170` | `ZASADY.md` §4 | niska | `slowa` |
| WZ5 | Wieża | `Wieza.tsx:74-84` | `ZASADY.md` §5, D-06 | niska | `brak-w-tabeli-5` |
| WP1 | W pamięci | `WPamieci.tsx:130` | `ZASADY.md` §5 | niska | `czas-pojawienia` |
| WP4 | W pamięci | `WPamieci.tsx:127` | `ZASADY.md` §4, §5 | niska | `sytuacja-trafienie` |

Wysokich rozbieżności brak: żaden pomiar nie zależy od animacji, każde pole gry na czas ma `touch-none select-none` i `onPointerDown`, wszystkie ekrany mieszczą się statycznie w 640 px bez poziomego przewijania, żadna animacja nie blokuje ruchu.

Odsyłacze do platformy (bez osobnych wpisów, D-03): B-45 (`tile-hit` poza listą §5, `Wieza.tsx:146`), B-47 (`piece-fall`, `Wieza.tsx:142`), B-53 (wyjątek dla ruchu jako treści gry).

## Nie do pełnej oceny bez przeglądarki

- Płynność ruchu z `requestAnimationFrame` na słabszych telefonach (Kubki przy 150 ms na zamianę, Śledzenie w późnych rundach) i czy szybkie zamiany da się śledzić wzrokiem.
- W pamięci: czy przycisk „Zatwierdź” zostaje nad klawiaturą numeryczną na iOS i Androidzie (komentarz `WPamieci.tsx:135`; `100dvh` przy otwartej klawiaturze).
- Rzeczywista wysokość nagłówka `Game.tsx` (szacunek 114 px) i zawijanie podpowiedzi w Wieży; zapas do 640 px jest jednak duży (najwyżej około 578 px).
- Kontrast celu w Śledzeniu (SL1) dla każdego z sześciu kolorów graczy oceniony z wartości, nie na ekranie.

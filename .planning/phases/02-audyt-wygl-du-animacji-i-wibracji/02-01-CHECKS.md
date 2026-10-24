# 02-01 CHECKS: hurtowe sprawdzenia wyglądu, animacji i wibracji

**Data:** 2026-10-23
**Plan:** `.planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-01-PLAN.md`
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI), decyzje D-01..D-13 z `02-CONTEXT.md`.
**Metoda:** statyczna (D-08, D-09). Jeden skrypt `node checks.mjs <repo>` w scratchpadzie sesji (poza repo, bez zależności, treść w załączniku A), grep i prosty parser otwierających znaczników JSX (bez AST). Bez przeglądarki i bez serwerów dev.
**Zakres:** `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, 42 pliki `apps/web/src/games/*.tsx`, 7 plików `apps/web/src/screens/*.tsx`, `apps/web/src/index.css` (51 plików `.tsx` + CSS). `Dev.tsx` i `net.ts` poza zakresem (D-01).

## Jak czytać

- Każde trafienie to wiersz `plik:linia: [co znaleziono] fragment → *wstępna ocena*`. Fragment jest przycięty do 140 znaków (wibracje do 420), znak `` ` `` w kodzie zastąpiony przez `ʼ`.
- Wstępne oceny: **rozbieżność** (z wagą wg D-07, gdy da się ją ustalić bez kontekstu gry), **do oceny w planie gry** (trafienie wymaga kontekstu: czy to pole gry na czas, czy kolor jest treścią, czy animacja jest w tabeli §5), **zgodne** (trafienie sprawdzone i niegroźne, np. komentarz, współrzędne SVG, podgląd w `Intro` pod `aria-hidden`), **odstępstwo z powodem** (wyjątek z `DESIGN.md` §6 / `ZASADY.md`, D-05).
- Plany 02-03..02-10 cytują wiersze stąd jako dowód i wydają ocenę ostateczną. Wspólne komponenty (`ui.tsx`, `Quiz.tsx`, `Szacowanie.tsx`) oceniają wskazane plany (D-02), a `index.css` i `ui.tsx` 02-02 (D-10).
- Liczby w tabeli zbiorczej to liczba trafień grepa, nie liczba rozbieżności.

## Najważniejsze dla planów fali 2

**Wibracje (ANIM-03).** 16 plików (`screens/Game.tsx` i 15 gier), 16 wywołań, wszystkie z `navigator.vibrate?.(…)`. Wzory: `60` ×13, `[60, 40, 60]` ×1 (`Chinczyk.tsx:135`, zbity mój pionek), `40` ×1 (`Game.tsx:35`, moja tura), `30` ×1 (`Rytm.tsx:70`, uderzenie metronomu: wzór spoza tabeli §5, KONCEPT.md opisuje wibrację metronomu, do oceny w planie Rytmu). Żadna gra nie powtarza `40`. Do oceny w planach: `Nozyczki.tsx:80` i `Srodek.tsx:91` wibrują `60` przy ruchu ignorowanym „bez kary” (komentarz w kodzie i `shake` w `index.css` mówią „to nie kara”), `Balon.tsx:58` wibruje przy pęknięciu balonu.

**Keyframes (ANIM-01).** 14 reguł `@keyframes`, każda z komentarzem (`preview-quarter` i `tile-miss` dzielą komentarz z poprzednią regułą). Wszystkie użyte, żadna nazwa w `animate-[…]` spoza katalogu. Sześć nie jest wymienionych w `ZASADY.md` §5: `line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake` (wpis niski D-06/D-07 do decyzji w 02-11). Wbudowane animacje Tailwinda bez keyframes z komentarzem: `animate-pulse` w `Labirynt.tsx:143`, `PiecWRzedzie.tsx:78`, `PiecWRzedzie.tsx:122`, `Statki.tsx:276`, `Game.tsx:596`, `Lobby.tsx:68`, `Lobby.tsx:69` i `animate-ping` w `Memory.tsx:116` (rozbieżność niska; `Game.tsx:596` pulsuje paskiem limitu w ostatnich 10 s).

**reducedMotion (ANIM-02).** Kod sprawdza `reducedMotion` tylko w `Chinczyk.tsx`, `KampusTour.tsx`, `Statki.tsx`. Ruch sterowany z JS przez `requestAnimationFrame` bez tej flagi: `Sledzenie.tsx:75`, `Wieza.tsx:77`, `Kubki.tsx:90`, `Zaslona.tsx:84`; w `Kubki.tsx:78` i `Zaslona.tsx:78` komentarz tłumaczy, dlaczego ruch zostaje (śledzenie kubków, pomiar czasu), więc do oceny jako świadome odstępstwo. Reguła globalna `index.css:360-368` zeruje animacje i przejścia CSS, nie rusza animacji z JS.

**Pomiar czasu (ANIM-02, waga wysoka przy zależności).** 43 trafienia `performance.now` / `Date.now` / `timeStamp` w 15 plikach gier. W tym samym komponencie co pomiar są animacje w: `Dziesiatki`, `Quiz`, `Schulte`, `Sudoku`, `Stoj` (`tile-hit`/`tile-miss` po dotknięciu), `Wieza` (rAF, `piece-fall`, przejście 180 ms), `Kubki`, `Sledzenie`, `Zaslona` (rAF), `Rok`, `Rytm`, `Zakupy` (przejście szerokości paska). `Refleks`, `Stoper`, `Przytrzymaj` nie mają animacji w komponencie z pomiarem.

**Akcent (UI-01, DESIGN.md §5).** Żaden plik gry nie używa `btn-primary` (akcje w partii idą kolorem gracza). `btn-primary` jest w `Game.tsx` ×3 (`:501`, `:525`, `:554`), `Home.tsx` ×2 (`:160` „Zagraj”, `:241` „Dołącz” warunkowo), `Lobby.tsx` ×2 (`:213`, `:223`), `ui.tsx:315` („Start” w `Intro`); kandydaci na dwa wypełnione przyciski na jednym ekranie do oceny w 02-02 / planach ekranów. W grach akcent pojawia się w `Statki.tsx` (odstępstwo z powodem), `KampusTour.tsx:802` (`outline-accent` przy sprzedaży), `PanstwaMiasta.tsx:320-321` (głosowanie), `Stoj.tsx:28` i `:149` (`text-accent-fg` jako ciemny tekst na `warning`: token w innej roli, D-04), `Simon.tsx:121`.

**Kolory (UI-01).** 28 trafień. Kolory treści gry z `DESIGN.md` §6 (Simon, Kolor liter, Inny element, Odcień, grupy Kampus Tour, paleta Kalamburów) idą na listę odstępstw. Do oceny jako rozbieżność średnia: `Kolo.tsx:71` (gradient `hsl` zieleń→czerwień jakości koła, gra nie jest na liście §6), `PiecWRzedzie.tsx:72` (czarny cień `rgb`), `Chinczyk.tsx:46` (`oklch` z koloru gracza, pochodna `PLAYER_COLORS`). Wartości tokenów wpisane na sztywno: `Simon.tsx:16` i `Stroop.tsx:5` (`#ff2445` = accent jako kolor treści), `KampusTour.tsx:128` (`#ff6369` = warning), `KampusTour.tsx:140` (`#3dd68c` = success). `index.css:158-167` (biel i czerń kciuka suwaka) do oceny w 02-02.

**Zaokrąglenia i cienie (niska).** 43 trafienia. Cienie poza miejscami z `DESIGN.md` §2: poświaty w `Memory.tsx:98`, `PiecWRzedzie.tsx:72`, `Statki.tsx:44`; obrysy przez `box-shadow: 0 0 0 Npx` (nie cień) w `Chinczyk.tsx:242`, `Sudoku.tsx:156`, `Zakupy.tsx:165`. Zaokrąglenia spoza 20 / 10 / 999 px: `rounded-sm` w `Wieza.tsx:29-31` (podgląd), `ui.tsx:125`, kilka w `KampusTour.tsx`; `rounded-[50%]` w `Balon.tsx:149` (kształt balonu), `rounded-[6px]` w `Chinczyk.tsx:307`, `rounded-[1px]` w `Statki.tsx:165`.

**Pola dotykowe (UI-03).** Elementy z handlerem i rozmiarem < 48 px: `Lobby.tsx:385` (`size-10`, 40 px próbki koloru), `PanstwaMiasta.tsx:312` (`min-h-11`, 44 px komórka głosowania), `KampusTour.tsx:894`, `:906`, `:970` (`min-h-11`, odstępstwo z powodem DESIGN.md §6), `KampusTour.tsx:796` (`min-h-0`, pole planszy). Pliki gier bez `touch-none` i `select-none`, które są mini-grami na czas z własnym polem: `Rok.tsx`, `WPamieci.tsx` (bez `touch-none`), `Szacowanie.tsx`, `Kolor.tsx` (do oceny w planach: część z nich ma tylko suwaki i pola tekstowe). Gry przez `Quiz.tsx` dziedziczą `touch-none select-none` z `Quiz.tsx`.

**360×640 (UI-04, statycznie).** Brak `<svg>` bez `viewBox`. Do oceny: `PanstwaMiasta.tsx:275` (`overflow-x-auto` w kaflu tabeli), `whitespace-nowrap` w tabelach `Quiz.tsx:78`, `Refleks.tsx:48` i przyciskach `Home.tsx:188`, `:195`; siatki `1fr` bez `minmax(0,1fr)`: `Przytrzymaj.tsx:130`, `KampusTour.tsx:665`, `:774`, `Dziesiatki.tsx:130`, `Quiz.tsx:246`. Stałe szerokości w rem są tylko w oknach Kampus Tour (układ poziomy).

**Teksty (UI-05).** Jedyny myślnik w tekście UI: en-dash `Balon.tsx:109` (`"–"` dla balonu z zerem punktów, rozbieżność średnia). Brak em-dashy w kodzie UI. `toFixed` tylko we współrzędnych SVG (`Inny.tsx:18`, `Mapa.tsx:25`). Słowa spoza wspólnego zestawu: „OK” w `KampusTour.tsx:1044`, `:1097`, „Wróć” w `Home.tsx:108`, `Records.tsx:336` (do oceny), „Zagraj ponownie” w `Records.tsx:276` i „Wróć do pokoju” w `Home.tsx:324` są nazwane w KONCEPT.md.

**Intro (UI-02).** 30 mini-gier = 23 z własnym `<Intro>` + 5 przez `Quiz.tsx` (Inny, Liczenie, Literówka, Obrót, Kolor liter) + 2 przez `Szacowanie.tsx` (Kąt, Policz kropki). Każde `<Intro>` ma `time`, `task`, `score`, `preview`, `onStart`. Jedyny podgląd wpisany inline zamiast komponentu `Preview`: `Kolo.tsx:153`.

**Liczby i dostępność (niska, heurystyka).** 36 kandydatów na liczby bez mono / `tabular-nums` (wszystkie „do oceny”, klasy mogą przychodzić z rodzica), 20 kandydatów a11y: ikony i SVG bez `aria-hidden` poza podglądem `Intro` (np. `KampusTour.tsx:660` ikona `X`, `Memory.tsx:86`, `Kolo.tsx:188` pole gry, `Kalambury.tsx:153` płótno) i przyciski, których tekst przychodzi tylko z wyrażenia (`{n}`, `{item}`, `{word}`), żaden przycisk nie jest całkiem pusty bez `aria-label`.

## Tabela zbiorcza: plik × sprawdzenie (liczba trafień)

Kolumny: **kol** = Kolory spoza tokenów; **akc** = Akcent (accent / btn-primary); **zaokr/cień** = Zaokrąglenia i cienie; **<48px** = Pola dotykowe poniżej 48 px; **onClick** = onClick w plikach gier; **px** = Stałe piksele i przewijanie w poziomie; **tekst** = Teksty (myślniki, kropka dziesiętna, słowa); **liczby** = Liczby bez mono / tabular-nums; **a11y** = Dostępność (aria-hidden, aria-label); **Intro** = Intro; **anim** = Animacje (animate-[...], animation); **trans** = Przejścia (transition, duration); **timery** = setTimeout / setInterval / rAF / startViewTransition / animate(; **pomiar** = Pomiar czasu (performance.now, Date.now, timeStamp); **vibrate** = Wibracje. Dodatkowo: **btn-primary** = liczba `btn-primary` w pliku, **pointerDown** = liczba `onPointerDown`, **touch/select** = `touch-none` / `select-none` w pliku (tylko gry), **RM** = plik sprawdza `reducedMotion` / `prefers-reduced-motion`.

| Plik | kol | akc | zaokr/cień | <48px | onClick | px | tekst | liczby | a11y | Intro | anim | trans | timery | pomiar | vibrate | btn-primary | pointerDown | touch/select | RM |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| apps/web/src/App.tsx | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | - | nie |
| apps/web/src/main.tsx | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | - | nie |
| apps/web/src/games/Balon.tsx | · | · | 1 | · | 1 | · | 1 | · | · | 1 | 2 | 1 | 1 | · | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Chinczyk.tsx | 1 | · | 3 | · | 2 | · | · | 2 | · | · | 2 | · | 3 | · | 1 | · | · | nie / nie | tak |
| apps/web/src/games/Dziesiatki.tsx | · | · | · | · | · | 1 | · | · | 1 | 1 | 4 | · | 2 | 3 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Inny.tsx | 1 | · | · | · | · | · | 1 | · | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Kalambury.tsx | 4 | · | · | · | 6 | · | · | · | 2 | · | · | 1 | 2 | · | · | · | 3 | tak / tak | nie |
| apps/web/src/games/KampusSummary.tsx | · | · | 1 | · | 1 | 1 | · | 2 | · | · | 1 | · | · | · | · | · | · | tak / nie | nie |
| apps/web/src/games/KampusTour.tsx | 8 | 2 | 16 | 4 | 16 | 6 | 2 | 7 | 1 | · | 7 | 1 | 4 | · | · | · | · | nie / nie | tak |
| apps/web/src/games/Kat.tsx | · | · | · | · | · | · | · | · | · | · | 3 | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Kolo.tsx | 1 | · | · | · | 1 | · | · | · | 2 | 1 | 1 | · | · | · | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Kolor.tsx | 3 | · | · | · | 2 | · | · | 1 | · | 1 | 2 | · | 1 | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Kropki.tsx | · | · | · | · | · | · | · | · | · | · | 3 | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Kubki.tsx | · | · | · | · | · | · | · | · | · | 1 | 1 | 1 | 3 | 1 | 1 | · | 1 | tak / tak | komentarz |
| apps/web/src/games/Labirynt.tsx | · | · | 5 | · | 4 | · | · | · | · | · | 2 | 2 | · | · | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Liczenie.tsx | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Literowka.tsx | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Mapa.tsx | · | · | · | · | 1 | · | 1 | · | · | 1 | 3 | · | 1 | · | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Memory.tsx | · | · | 1 | · | 1 | 1 | · | · | 1 | · | 3 | 2 | 1 | · | · | · | · | nie / nie | nie |
| apps/web/src/games/MiniGame.tsx | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Nozyczki.tsx | · | · | · | · | · | · | · | · | 1 | 1 | 3 | · | 1 | · | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Obrot.tsx | · | · | 1 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/PanstwaMiasta.tsx | · | 2 | · | 1 | 4 | 1 | · | · | · | · | · | · | 1 | · | · | · | 2 | nie / nie | nie |
| apps/web/src/games/PiecWRzedzie.tsx | 1 | · | 1 | · | 2 | · | · | · | · | · | 4 | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Przytrzymaj.tsx | · | · | · | · | · | 1 | · | 3 | 1 | 1 | 3 | · | 3 | 4 | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Quiz.tsx | · | · | · | · | · | 2 | · | 2 | 1 | 1 | 4 | · | 2 | 4 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Refleks.tsx | · | · | · | · | · | 1 | · | 2 | · | 1 | 2 | · | 3 | 2 | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Rok.tsx | · | · | · | · | 3 | · | · | · | · | 1 | 4 | 1 | 2 | 2 | · | · | · | nie / nie | nie |
| apps/web/src/games/Rytm.tsx | · | · | · | · | · | · | · | 1 | · | 1 | 1 | 1 | 2 | 3 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Schulte.tsx | · | · | · | · | · | · | · | 1 | 1 | 1 | 4 | · | 1 | 3 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Simon.tsx | 4 | 1 | · | · | · | · | · | · | · | 1 | 2 | 1 | 1 | · | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Sledzenie.tsx | · | · | · | · | · | · | · | · | · | 1 | 1 | · | 3 | 1 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Srodek.tsx | · | · | · | · | · | · | · | · | · | 1 | 3 | · | 1 | · | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Statki.tsx | · | 3 | 2 | · | 6 | 1 | · | 2 | · | · | 2 | 1 | 3 | · | 1 | · | 1 | tak / tak | tak |
| apps/web/src/games/Stoj.tsx | · | 2 | · | · | · | · | · | · | 1 | 1 | 3 | · | 2 | 6 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Stoper.tsx | · | · | · | · | · | · | · | · | · | 1 | 2 | · | 1 | 4 | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Stroop.tsx | 1 | · | · | · | · | · | · | 1 | · | · | · | · | · | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Sudoku.tsx | · | · | 1 | · | · | · | · | 1 | 2 | 1 | 4 | · | 1 | 3 | 1 | · | 2 | tak / tak | nie |
| apps/web/src/games/Szacowanie.tsx | · | · | · | · | 1 | · | · | 1 | · | 1 | · | · | 1 | · | · | · | · | nie / nie | nie |
| apps/web/src/games/Tort.tsx | · | · | · | · | 1 | · | · | · | 1 | 1 | 2 | · | 1 | · | · | · | 1 | tak / tak | nie |
| apps/web/src/games/WPamieci.tsx | · | · | · | · | 1 | · | · | 1 | · | 1 | 3 | · | 1 | · | 1 | · | · | nie / tak | nie |
| apps/web/src/games/Wieza.tsx | · | · | 3 | · | · | · | · | · | · | 1 | 4 | 1 | 3 | 2 | 1 | · | 1 | tak / tak | nie |
| apps/web/src/games/Zakupy.tsx | · | · | 1 | · | 2 | · | · | · | 1 | 1 | 2 | 1 | 2 | 3 | · | · | 1 | tak / tak | nie |
| apps/web/src/games/Zaslona.tsx | · | · | · | · | · | · | · | · | · | 1 | 3 | · | 4 | 2 | · | · | 1 | tak / tak | komentarz |
| apps/web/src/screens/Game.tsx | · | 3 | · | · | · | 1 | · | 3 | · | · | 5 | 3 | 1 | · | 1 | 3 | · | - | nie |
| apps/web/src/screens/Home.tsx | · | 4 | · | · | · | 2 | 2 | 1 | 1 | · | · | · | · | · | · | 2 | · | - | nie |
| apps/web/src/screens/Lobby.tsx | · | 3 | · | 1 | · | · | · | · | 2 | · | 2 | 2 | 2 | · | · | 2 | · | - | nie |
| apps/web/src/screens/MiniGames.tsx | · | 1 | · | · | · | · | · | · | · | · | · | 1 | · | · | · | · | · | - | nie |
| apps/web/src/screens/Records.tsx | · | · | · | · | · | · | 2 | 2 | · | · | 1 | 1 | · | · | · | · | · | - | nie |
| apps/web/src/screens/Setup.tsx | · | 4 | · | · | · | · | · | 2 | 1 | · | · | 3 | · | · | · | · | · | - | nie |
| apps/web/src/screens/ui.tsx | · | 2 | 1 | · | · | 1 | · | 1 | · | · | 2 | 2 | 2 | · | · | 1 | · | - | nie |
| apps/web/src/index.css | 4 | · | 6 | · | · | · | · | · | · | · | · | · | · | · | · | - | - | - | tak (reguła globalna) |
| **Razem** | **28** | **27** | **43** | **6** | **55** | **19** | **9** | **36** | **20** | **25** | **100** | **26** | **62** | **43** | **16** | | | | |

`·` = 0 trafień. `apps/web/src/main.tsx` jest w zakresie grepa (`**/*.tsx` bez `Dev.tsx`), choć D-01 go nie wymienia.

## 1. Kolory spoza tokenów (UI-01)

Szukane: `#hex`, `rgb(`/`rgba(`, `hsl(`, `oklch(`, `hwb(`, `lab(` (w `index.css` poza `@theme`) i klasy palety Tailwinda (`bg|text|border|ring|fill|stroke|from|to|via|outline|…-(red|…|white|black)`). Linie-komentarze pominięte. `PLAYER_COLORS` przychodzą przez `style` z danych, więc nie dają trafień.

Trafień: 28.

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:46`: [oklch(] const tint = (color: string, lightness: number, chroma: number) => ʼoklch(from ${color} ${lightness} calc(c * ${chroma}) h)ʼ; → *do oceny w planie gry: odcień wyliczany z koloru gracza (pochodna PLAYER_COLORS, nie nowy kolor)*

**apps/web/src/games/Inny.tsx**

- `apps/web/src/games/Inny.tsx:22`: [hsl(] <polygon points={points} transform={ʼrotate(${angle}) scale(${size / 100})ʼ} fill={ʼhsl(${hue} 70% ${light}%)ʼ} /> → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*

**apps/web/src/games/Kalambury.tsx**

- `apps/web/src/games/Kalambury.tsx:23`: [#facc15] { name: "Żółty", color: "#facc15" }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Kalambury.tsx:24`: [#4ade80] { name: "Zielony", color: "#4ade80" }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Kalambury.tsx:25`: [#60a5fa] { name: "Niebieski", color: "#60a5fa" }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Kalambury.tsx:26`: [#b4763a] { name: "Brązowy", color: "#b4763a" }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:84`: [#ff8a3d, #38bdf8, #d946ef, #a3e635, #6366f1, #facc15, #14b8a6, #d4d4d8] const GROUP_COLORS = ["#ff8a3d", "#38bdf8", "#d946ef", "#a3e635", "… → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/KampusTour.tsx:125`: [#ffb224] start: { icon: Sun, color: "#ffb224", sub: ʼ+${ALLOWANCE} złʼ, info: ʼZa każde przejście dostajesz ${ALLOWANCE} zł kieszonkowego.ʼ… → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/KampusTour.tsx:128`: [#ff6369] color: "#ff6369", → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6); wartość tokenu wpisana na sztywno (#ff6369 = warning), lepiej var(--color-…)*
- `apps/web/src/games/KampusTour.tsx:134`: [#e879f9] color: "#e879f9", → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/KampusTour.tsx:140`: [#3dd68c] color: "#3dd68c", → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6); wartość tokenu wpisana na sztywno (#3dd68c = success), lepiej var(--color-…)*
- `apps/web/src/games/KampusTour.tsx:203`: [rgb(] const TILE_EDGE = "0 3px 0 rgb(0 0 0 / 0.45)"; → *do oceny: czerń w cieniu (patrz sekcja 3), Kampus Tour ma wyjątek na cienie*
- `apps/web/src/games/KampusTour.tsx:519`: [border-white] className="grid shrink-0 place-items-center rounded-full border-2 border-white text-bg shadow-[0_2px_4px_rgb(0_0_0/0.8)]" → *do oceny: czerń w cieniu (patrz sekcja 3), Kampus Tour ma wyjątek na cienie; biel/czerń spoza tokenów*
- `apps/web/src/games/KampusTour.tsx:779`: [rgb(] boxShadow: "0 10px 0 color-mix(in srgb, var(--color-fg) 3%, var(--color-bg)), 0 28px 40px rgb(0 0 0 / 0.6)", → *do oceny: czerń w cieniu (patrz sekcja 3), Kampus Tour ma wyjątek na cienie*

**apps/web/src/games/Kolo.tsx**

- `apps/web/src/games/Kolo.tsx:71`: [hsl(] stroke={ʼhsl(${140 * (1 - Math.min(1, off / RED_AT))} 80% 55%)ʼ} → *rozbieżność (średnia) albo do oceny w planie gry*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:20`: [rgb(] const css = (c: Hsb) => ʼrgb(${kolorHsbToRgb(c).join(" ")})ʼ; → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Kolor.tsx:63`: [#2f8fd8] ["Wzór", "#2f8fd8", ""], → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Kolor.tsx:64`: [#3f7fe6] ["Twój kolor", "#3f7fe6", "opacity-0 [animation-delay:-1.5s]"], → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*

**apps/web/src/games/PiecWRzedzie.tsx**

- `apps/web/src/games/PiecWRzedzie.tsx:72`: [rgb(] boxShadow: win.has(i) ? ʼ0 0 10px 2px ${colorOf(cell)}ʼ : "0 1px 2px rgb(0 0 0 / 0.6)", → *do oceny: czerń w cieniu (patrz sekcja 3)*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:16`: [#ff2445] { color: "#ff2445", icon: Circle }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6); wartość tokenu wpisana na sztywno (#ff2445 = accent), lepiej var(--color-…)*
- `apps/web/src/games/Simon.tsx:17`: [#3b82f6] { color: "#3b82f6", icon: Square }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Simon.tsx:18`: [#facc15] { color: "#facc15", icon: Triangle }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*
- `apps/web/src/games/Simon.tsx:19`: [#22c55e] { color: "#22c55e", icon: Star }, → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)*

**apps/web/src/games/Stroop.tsx**

- `apps/web/src/games/Stroop.tsx:5`: [#ff2445, #3b82f6, #facc15, #22c55e] const HUES = ["#ff2445", "#3b82f6", "#facc15", "#22c55e"]; → *do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6); wartość tokenu wpisana na sztywno (#ff2445 = accent), lepiej var(--color-…)*

**apps/web/src/index.css**

- `apps/web/src/index.css:158`: [#fff] border: 3px solid #fff; → *do oceny w 02-02 (kciuk suwaka .swatch-range)*
- `apps/web/src/index.css:159`: [#000] box-shadow: 0 0 0 1px #000; → *do oceny w 02-02 (kciuk suwaka .swatch-range)*
- `apps/web/src/index.css:166`: [#fff] border: 3px solid #fff; → *do oceny w 02-02 (kciuk suwaka .swatch-range)*
- `apps/web/src/index.css:167`: [#000] box-shadow: 0 0 0 1px #000; → *do oceny w 02-02 (kciuk suwaka .swatch-range)*

### Akcent: liczba użyć per plik

| Plik | użycia (token: liczba linii) |
|---|---|
| apps/web/src/games/KampusTour.tsx | `outline-accent`: 1, `bg-accent-soft`: 1 |
| apps/web/src/games/PanstwaMiasta.tsx | `bg-accent-soft`: 1, `border-accent`: 1 |
| apps/web/src/games/Simon.tsx | `--color-accent`: 1 |
| apps/web/src/games/Statki.tsx | `--color-accent`: 2, `text-accent`: 1 |
| apps/web/src/games/Stoj.tsx | `text-accent-fg`: 2 |
| apps/web/src/screens/Game.tsx | `btn-primary`: 3 |
| apps/web/src/screens/Home.tsx | `fill-accent`: 1, `bg-accent-soft`: 1, `text-accent`: 1, `btn-primary`: 2 |
| apps/web/src/screens/Lobby.tsx | `btn-primary`: 2, `border-accent`: 1, `bg-accent-soft`: 1 |
| apps/web/src/screens/MiniGames.tsx | `border-accent`: 1, `bg-accent-soft`: 1 |
| apps/web/src/screens/Setup.tsx | `border-accent`: 3, `bg-accent-soft`: 3, `text-accent`: 1 |
| apps/web/src/screens/ui.tsx | `bg-accent-soft`: 1, `btn-primary`: 1 |

## 2. Akcent (UI-01, DESIGN.md §5)

Szukane: `(bg|text|border|ring|outline|fill|stroke|…)-accent(-soft|-hover|-fg)?`, `btn-primary`, `--color-accent`. Każdy `btn-primary` w pliku gry to kandydat na akcję w partii w akcencie zamiast koloru gracza; dwa lub więcej `btn-primary` w pliku to kandydat na dwa wypełnione przyciski na jednym ekranie (do oceny, bo mogą być na różnych ekranach).

Trafień: 27.

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:802`: [outline-accent] sellable ? "z-10 outline-2 outline-accent" : deciding === i ? "z-10 -translate-y-0.5 outline-2" : selected === i ? "outline… → *do oceny w planie gry (akcent w partii)*
- `apps/web/src/games/KampusTour.tsx:862`: [bg-accent-soft] <p role="status" className="flex items-center gap-2 rounded-inset bg-accent-soft px-3 py-1.5 text-sm"> → *do oceny w planie gry (akcent w partii)*

**apps/web/src/games/PanstwaMiasta.tsx**

- `apps/web/src/games/PanstwaMiasta.tsx:320`: [bg-accent-soft] voted \|\| out ? "bg-accent-soft" : canToggle ? "bg-surface-inset" : "" → *do oceny w planie gry (akcent w partii)*
- `apps/web/src/games/PanstwaMiasta.tsx:321`: [border-accent] } ${canToggle ? (voted ? "border-accent" : "border-line-hover") : "border-transparent"} ${onToggle && id === me ? "opacity-5… → *do oceny w planie gry (akcent w partii)*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:121`: [--color-accent] color: lit === i ? "var(--color-accent-fg)" : color, → *do oceny w planie gry (akcent w partii)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:174`: [--color-accent] const RED = "var(--color-accent)"; → *odstępstwo z powodem (trafienie w accent, DESIGN.md §6), sprawdzić w planie gry*
- `apps/web/src/games/Statki.tsx:294`: [--color-accent] cell={(i) => ({ background: blocked.has(i) ? "var(--color-accent-soft)" : undefined })} → *odstępstwo z powodem (trafienie w accent, DESIGN.md §6), sprawdzić w planie gry*
- `apps/web/src/games/Statki.tsx:396`: [text-accent] if (shot?.result === "hit") return { content: <Fire size={compact ? 10 : 18} weight="fill" className={ʼtext-accent ${pop(i)}ʼ}… → *odstępstwo z powodem (trafienie w accent, DESIGN.md §6), sprawdzić w planie gry*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:28`: [text-accent-fg] <span className="absolute inset-0 flex animate-[preview-half_2.4s_linear_infinite] items-center justify-center gap-2 bg-war… → *do oceny w planie gry (akcent w partii)*
- `apps/web/src/games/Stoj.tsx:149`: [text-accent-fg] ? "bg-warning text-accent-fg" → *do oceny w planie gry (akcent w partii)*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:501`: [btn-primary] <button type="button" className="btn btn-primary flex-1" onClick={() => send("rematch")}> → *do oceny: jeden wypełniony akcent na ekran*
- `apps/web/src/screens/Game.tsx:525`: [btn-primary] className={ʼbtn btn-primary flex-1 ${wants.length > 0 && !iWant ? "animate-[ring-pulse_1.2s_ease-in-out_infinite] outline-2 ou… → *do oceny: jeden wypełniony akcent na ekran*
- `apps/web/src/screens/Game.tsx:554`: [btn-primary] <button type="button" className="btn btn-primary w-full" disabled={iWant} onClick={() => send("rematch")}> → *do oceny: jeden wypełniony akcent na ekran*

**apps/web/src/screens/Home.tsx**

- `apps/web/src/screens/Home.tsx:28`: [fill-accent] <path d="M136 120V32a88 88 0 0 1 88 88z" className="fill-accent" /> → *do oceny (rola akcentu)*
- `apps/web/src/screens/Home.tsx:146`: [bg-accent-soft, text-accent] <span className="flex size-12 shrink-0 items-center justify-center rounded-inset bg-accent-soft text-accent"> → *do oceny (rola akcentu)*
- `apps/web/src/screens/Home.tsx:160`: [btn-primary] <button type="button" className="btn btn-primary w-full" disabled={!!busy} onClick={() => play(daily.gameId)}> → *do oceny: jeden wypełniony akcent na ekran*
- `apps/web/src/screens/Home.tsx:241`: [btn-primary] <button type="submit" className={ʼbtn shrink-0 ${full ? "btn-primary" : "btn-ghost"}ʼ} disabled={!!busy \|\| !full}> → *do oceny: jeden wypełniony akcent na ekran*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:213`: [btn-primary] <button type="button" className="btn btn-primary w-full" onClick={() => send("start")}> → *do oceny: jeden wypełniony akcent na ekran*
- `apps/web/src/screens/Lobby.tsx:223`: [btn-primary] className={ʼbtn w-full ${meReady ? "btn-ghost" : "btn-primary"}ʼ} → *do oceny: jeden wypełniony akcent na ekran*
- `apps/web/src/screens/Lobby.tsx:256`: [border-accent, bg-accent-soft] picked ? "border-accent bg-accent-soft" : "border-line enabled:hover:border-line-hover" → *do oceny (rola akcentu)*

**apps/web/src/screens/MiniGames.tsx**

- `apps/web/src/screens/MiniGames.tsx:58`: [border-accent, bg-accent-soft] picked === id ? "border-accent bg-accent-soft" : "border-line hover:border-line-hover" → *do oceny (rola akcentu)*

**apps/web/src/screens/Setup.tsx**

- `apps/web/src/screens/Setup.tsx:49`: [border-accent, bg-accent-soft] on ? "border-accent bg-accent-soft" : "border-line enabled:hover:border-line-hover disabled:opacity-50" → *do oceny (rola akcentu)*
- `apps/web/src/screens/Setup.tsx:157`: [border-accent, bg-accent-soft] length === games ? "border-accent bg-accent-soft" : "border-line hover:border-line-hover" → *do oceny (rola akcentu)*
- `apps/web/src/screens/Setup.tsx:185`: [border-accent, bg-accent-soft] state === "na pewno" ? "border-accent bg-accent-soft" : state === "bez" ? "border-line opacity-50" : "border… → *do oceny (rola akcentu)*
- `apps/web/src/screens/Setup.tsx:197`: [text-accent] <Check size={12} weight="bold" className="text-accent" aria-hidden /> → *do oceny (rola akcentu)*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:12`: [bg-accent-soft] <p role="status" className="flex items-center gap-2 rounded-inset bg-accent-soft px-4 py-3 text-sm"> → *do oceny (rola akcentu)*
- `apps/web/src/screens/ui.tsx:315`: [btn-primary] <button type="button" className="btn btn-primary w-full" onClick={start}> → *do oceny: jeden wypełniony akcent na ekran*

## 3. Zaokrąglenia i cienie (UI-01, DESIGN.md §2)

Szukane: `rounded*` inne niż `rounded-tile`, `rounded-inset`, `rounded-full`, `rounded-[20px]`, `rounded-[10px]` (także warianty narożników); `shadow*`, `drop-shadow*`, `box-shadow`/`boxShadow`, `border-radius`/`borderRadius`, `rx=` w SVG.

Trafień: 43.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:149`: [rounded-[50%]] className="aspect-[5/6] rounded-[50%] transition-[width] duration-100" → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:242`: [boxShadow] style={{ backgroundColor: cell.background, boxShadow: cell.ring && ʼinset 0 0 0 2px ${cell.ring}ʼ }} → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*
- `apps/web/src/games/Chinczyk.tsx:248`: [boxShadow] <span key={i} className={className} style={{ backgroundColor: cell.background, boxShadow: cell.ring && ʼinset 0 0 0 2px ${cell.r… → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*
- `apps/web/src/games/Chinczyk.tsx:307`: [rounded-[6px]] <svg viewBox="0 0 2 2" className="size-full overflow-hidden rounded-[6px]" role="img" aria-label="Meta"> → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/KampusSummary.tsx**

- `apps/web/src/games/KampusSummary.tsx:41`: [shadow-[0_16px_48px_rgb(0_0_0/0.7)]] className="flex w-[36rem] animate-[card-in_0.35s_ease-out] flex-col gap-2 rounded-inset border border-… → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:162`: [rounded-[3px]] <span className="grid size-4 place-items-center rounded-[3px] text-bg" style={{ backgroundColor: GROUP_COLORS[group] }}> → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/KampusTour.tsx:174`: [boxShadow] style={{ backgroundColor: ʼcolor-mix(in srgb, ${color} 22%, var(--color-surface))ʼ, boxShadow: ʼinset 0 0 0 1px ${color}ʼ }} → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*
- `apps/web/src/games/KampusTour.tsx:519`: [shadow-[0_2px_4px_rgb(0_0_0/0.8)]] className="grid shrink-0 place-items-center rounded-full border-2 border-white text-bg shadow-[0_2px_4px… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:575`: [rounded-t-sm] className="flex h-[26%] w-full shrink-0 items-center justify-between rounded-t-sm px-1 text-bg" → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/KampusTour.tsx:586`: [rounded-[1px]] <span key={k} className="size-[5px] rounded-[1px] bg-bg" /> → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/KampusTour.tsx:650`: [shadow-[0_12px_32px_rgb(0_0_0/0.6)]] className="absolute inset-x-0 top-1/2 z-10 flex max-h-[calc(100cqh-1rem)] -translate-y-1/2 flex-col ga… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:733`: [boxShadow] style={active ? { borderColor: color(id), boxShadow: ʼ0 0 14px ${mix(color(id), 55)}ʼ } : undefined} → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:756`: [drop-shadow-[0_1px_2px_rgb(0_0_0/0.9)]] className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 animate-[float-up_1.6s_ea… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:779`: [boxShadow] boxShadow: "0 10px 0 color-mix(in srgb, var(--color-fg) 3%, var(--color-bg)), 0 28px 40px rgb(0 0 0 / 0.6)", → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:801`: [rounded-sm] className={ʼrelative flex min-h-0 min-w-0 flex-col items-center justify-center rounded-sm bg-[color-mix(in_srgb,var(--color-fg)… → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/KampusTour.tsx:812`: [boxShadow] boxShadow: edges, → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:819`: [rounded-br-sm] className="absolute top-0 left-0 flex items-center rounded-br-sm bg-bg/80 px-0.5 font-mono text-[10px] leading-none font-sem… → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/KampusTour.tsx:832`: [drop-shadow-[0_0_1.5px_var(--color-bg)]] className="absolute -top-1.5 -right-1.5 drop-shadow-[0_0_1.5px_var(--color-bg)]" → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:987`: [shadow-[0_16px_48px_rgb(0_0_0/0.7)]] className="flex w-[30rem] animate-[card-in_0.35s_ease-out] flex-col gap-3 rounded-inset border border-… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:1033`: [shadow-[0_16px_48px_rgb(0_0_0/0.7)]] className="flex w-72 animate-[card-in_0.35s_ease-out] flex-col overflow-hidden rounded-inset border bo… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*
- `apps/web/src/games/KampusTour.tsx:1073`: [shadow-[0_16px_48px_rgb(0_0_0/0.7)]] className="flex w-80 animate-[card-in_0.35s_ease-out] flex-col overflow-hidden rounded-inset border bo… → *odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)*

**apps/web/src/games/Labirynt.tsx**

- `apps/web/src/games/Labirynt.tsx:137`: [rx={0.4] <rect key={side} {...goalRect(side, size)} rx={0.4} fill={colorOf(i)} opacity={0.7} /> → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*
- `apps/web/src/games/Labirynt.tsx:140`: [rx={1.2] <rect key={i} x={(i % size) * CELL + GAP / 2} y={Math.floor(i / size) * CELL + GAP / 2} width={CELL - GAP} height={CELL - GAP} rx=… → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*
- `apps/web/src/games/Labirynt.tsx:149`: [rx={0.6] rx={0.6} → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*
- `apps/web/src/games/Labirynt.tsx:158`: [rx={0.6] rx={0.6} → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*
- `apps/web/src/games/Labirynt.tsx:181`: [rx={0.35] return <rect x={x - 2.4} y={y + 4} width={4.8} height={0.7} rx={0.35} fill="var(--color-fg)" className="transition-all duration-2… → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:98`: [boxShadow] boxShadow: live ? ʼ0 0 14px color-mix(in srgb, ${color} 55%, transparent)ʼ : undefined, → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/Obrot.tsx**

- `apps/web/src/games/Obrot.tsx:26`: [rx={0.12] <rect key={ʼ${x},${y}ʼ} x={x + dx + 0.04} y={y + dy + 0.04} width={0.92} height={0.92} rx={0.12} /> → *do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px*

**apps/web/src/games/PiecWRzedzie.tsx**

- `apps/web/src/games/PiecWRzedzie.tsx:72`: [boxShadow] boxShadow: win.has(i) ? ʼ0 0 10px 2px ${colorOf(cell)}ʼ : "0 1px 2px rgb(0 0 0 / 0.6)", → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:44`: [boxShadow] boxShadow: solid ? ʼ0 0 12px ${color}ʼ : undefined, → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/Statki.tsx:165`: [rounded-[1px]] <span key={j} className="size-1.5 rounded-[1px]" style={{ backgroundColor: h ? RED : color }} /> → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:156`: [boxShadow] style={selected === i ? { borderColor: color, boxShadow: ʼ0 0 0 2px ${color}ʼ } : undefined} → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:29`: [rounded-sm] <span className="absolute bottom-[18%] left-[30%] h-[18%] w-[40%] rounded-sm" style={{ backgroundColor: color }} /> → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/Wieza.tsx:30`: [rounded-sm] <span className="absolute bottom-[36%] left-[34%] h-[18%] w-[36%] rounded-sm opacity-80" style={{ backgroundColor: color }} /> → *rozbieżność (niska) albo do oceny w planie gry*
- `apps/web/src/games/Wieza.tsx:31`: [rounded-sm] <span className="absolute bottom-[54%] left-[40%] h-[18%] w-[30%] animate-[preview-half_3s_linear_infinite] rounded-sm" style={… → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:165`: [boxShadow] style={on ? { borderColor: color, boxShadow: ʼ0 0 0 2px ${color}ʼ } : undefined} → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:125`: [rounded-sm] className={ʼabsolute -top-1 -right-1 grid h-4 min-w-4 place-items-center border border-line bg-surface px-0.5 font-mono text-[1… → *rozbieżność (niska) albo do oceny w planie gry*

**apps/web/src/index.css**

- `apps/web/src/index.css:157`: [border-radius: 6px] border-radius: 6px; → *do oceny w 02-02 (set-glow / kciuk suwaka)*
- `apps/web/src/index.css:159`: [box-shadow] box-shadow: 0 0 0 1px #000; → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*
- `apps/web/src/index.css:165`: [border-radius: 6px] border-radius: 6px; → *do oceny w 02-02 (set-glow / kciuk suwaka)*
- `apps/web/src/index.css:167`: [box-shadow] box-shadow: 0 0 0 1px #000; → *do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień*
- `apps/web/src/index.css:197`: [box-shadow] box-shadow: 0 0 0 0 transparent; → *do oceny w 02-02*
- `apps/web/src/index.css:200`: [box-shadow] box-shadow: 0 0 18px 2px var(--glow); → *do oceny w 02-02 (set-glow / kciuk suwaka)*

## 4. Pola dotykowe poniżej 48 px (UI-03)

Znaczniki JSX z `onClick`/`onPointerDown`/`onPointerUp`/`onTouchStart` i klasą `h-N`/`size-N`/`w-N`/`min-h-N`/`min-w-N` dla N < 12, `…-[Npx]` dla N < 48 albo atrybutem `width`/`height` < 48. Heurystyka: nie widzi paddingu ani rozmiaru rodzica.

Trafień: 6.

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:796`: <button> [min-h-0, min-w-0] <button key={i} type="button" aria-label={tile.name} aria-pressed={selected === i} → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*
- `apps/web/src/games/KampusTour.tsx:894`: <button> [min-h-11] <button key={l} type="button" style={mine} className="btn min-h-11 flex-col gap-0 → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*
- `apps/web/src/games/KampusTour.tsx:906`: <button> [min-h-11] <button type="button" className="btn btn-ghost min-h-11 px-4" onClick={() => onMove({ type: "skip" })}> → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*
- `apps/web/src/games/KampusTour.tsx:970`: <button> [min-h-11] <button type="button" className="btn btn-ghost min-h-11 px-4 text-sm" onClick={() => setSummaryHidden(false)}> → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*

**apps/web/src/games/PanstwaMiasta.tsx**

- `apps/web/src/games/PanstwaMiasta.tsx:312`: <Cell> [min-h-11] <Cell {...(canToggle && { type: "button" as const, onClick: () => onToggle(key), → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:385`: <button> [size-10] <button key={color} type="button" role="radio" aria-checked={color === mine} aria-label={t → *do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)*

## 5. onClick w plikach gier i touch-none / select-none (UI-03)

| Plik | onClick | onPointerDown | touch-none | select-none |
|---|---:|---:|---|---|
| apps/web/src/games/Balon.tsx | 1 | 1 | tak | tak |
| apps/web/src/games/Chinczyk.tsx | 2 | 0 | **nie** | **nie** |
| apps/web/src/games/Dziesiatki.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Inny.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Kalambury.tsx | 6 | 3 | tak | tak |
| apps/web/src/games/KampusSummary.tsx | 1 | 0 | tak | **nie** |
| apps/web/src/games/KampusTour.tsx | 16 | 0 | **nie** | **nie** |
| apps/web/src/games/Kat.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Kolo.tsx | 1 | 1 | tak | tak |
| apps/web/src/games/Kolor.tsx | 2 | 0 | **nie** | **nie** |
| apps/web/src/games/Kropki.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Kubki.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Labirynt.tsx | 4 | 1 | tak | tak |
| apps/web/src/games/Liczenie.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Literowka.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Mapa.tsx | 1 | 1 | tak | tak |
| apps/web/src/games/Memory.tsx | 1 | 0 | **nie** | **nie** |
| apps/web/src/games/MiniGame.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Nozyczki.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Obrot.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/PanstwaMiasta.tsx | 4 | 2 | **nie** | **nie** |
| apps/web/src/games/PiecWRzedzie.tsx | 2 | 0 | **nie** | **nie** |
| apps/web/src/games/Przytrzymaj.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Quiz.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Refleks.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Rok.tsx | 3 | 0 | **nie** | **nie** |
| apps/web/src/games/Rytm.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Schulte.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Simon.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Sledzenie.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Srodek.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Statki.tsx | 6 | 1 | tak | tak |
| apps/web/src/games/Stoj.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Stoper.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Stroop.tsx | 0 | 0 | **nie** | **nie** |
| apps/web/src/games/Sudoku.tsx | 0 | 2 | tak | tak |
| apps/web/src/games/Szacowanie.tsx | 1 | 0 | **nie** | **nie** |
| apps/web/src/games/Tort.tsx | 1 | 1 | tak | tak |
| apps/web/src/games/WPamieci.tsx | 1 | 0 | **nie** | tak |
| apps/web/src/games/Wieza.tsx | 0 | 1 | tak | tak |
| apps/web/src/games/Zakupy.tsx | 2 | 1 | tak | tak |
| apps/web/src/games/Zaslona.tsx | 0 | 1 | tak | tak |

Pliki gier bez `touch-none`: `apps/web/src/games/Chinczyk.tsx`, `apps/web/src/games/Inny.tsx`, `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/Kat.tsx`, `apps/web/src/games/Kolor.tsx`, `apps/web/src/games/Kropki.tsx`, `apps/web/src/games/Liczenie.tsx`, `apps/web/src/games/Literowka.tsx`, `apps/web/src/games/Memory.tsx`, `apps/web/src/games/MiniGame.tsx`, `apps/web/src/games/Obrot.tsx`, `apps/web/src/games/PanstwaMiasta.tsx`, `apps/web/src/games/PiecWRzedzie.tsx`, `apps/web/src/games/Rok.tsx`, `apps/web/src/games/Stroop.tsx`, `apps/web/src/games/Szacowanie.tsx`, `apps/web/src/games/WPamieci.tsx`.

Pliki gier bez `select-none`: `apps/web/src/games/Chinczyk.tsx`, `apps/web/src/games/Inny.tsx`, `apps/web/src/games/KampusSummary.tsx`, `apps/web/src/games/KampusTour.tsx`, `apps/web/src/games/Kat.tsx`, `apps/web/src/games/Kolor.tsx`, `apps/web/src/games/Kropki.tsx`, `apps/web/src/games/Liczenie.tsx`, `apps/web/src/games/Literowka.tsx`, `apps/web/src/games/Memory.tsx`, `apps/web/src/games/MiniGame.tsx`, `apps/web/src/games/Obrot.tsx`, `apps/web/src/games/PanstwaMiasta.tsx`, `apps/web/src/games/PiecWRzedzie.tsx`, `apps/web/src/games/Rok.tsx`, `apps/web/src/games/Stroop.tsx`, `apps/web/src/games/Szacowanie.tsx`.

Ocena per plik należy do planu gry: reguła dotyczy tylko pól gry na czas; gry turowe i pliki pomocnicze (`MiniGame.tsx`, `KampusSummary.tsx`) mogą zgodnie nie mieć tych klas.

## 5a. Lista onClick w plikach gier

Każdy znacznik z `onClick` w `games/*.tsx`. `.btn` w klasie = przycisk (zgodny, jeśli nie jest polem gry na czas).

Trafień: 55.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:165`: <button> <button type="button" className="btn text-bg" style={{ backgroundColor: color }} disabled={phase !== "play"} onClick={() => finish(… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:237`: <button> <button key={i} type="button" aria-label={isTarget ? ʼRusz pionek ${pick! + 1} tutajʼ : isPick ? ʼRusz pione → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/Chinczyk.tsx:265`: <button> <button type="button" className="btn h-14 w-full text-lg font-semibold text-bg" style={{ backgroundCol → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Kalambury.tsx**

- `apps/web/src/games/Kalambury.tsx:92`: <button> <button key={word} type="button" className="btn btn-ghost w-full text-lg" onClick={() => onMove({ type: "choose", index: i })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Kalambury.tsx:139`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: player(me)?.color }} disabled={view.ready.includes(m… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Kalambury.tsx:271`: <button> <button key={p.name} type="button" role="radio" aria-checked={ink === i} aria-label={p.nam → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/Kalambury.tsx:286`: <button> <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0 && cleared.length === 0} onClick={() => edit(… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Kalambury.tsx:290`: <button> <button type="button" className="btn btn-ghost flex-1" disabled={strokes.length === 0} onClick={() => edit("clear")}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Kalambury.tsx:379`: <button> <button type="button" className={ʼbtn btn-ghost w-full ${sure ? "border-fg" : ""}ʼ} onClick={() => (sure ? onMove({ type: "pass" })… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/KampusSummary.tsx**

- `apps/web/src/games/KampusSummary.tsx:75`: <button> <button type="button" className="btn btn-ghost" onClick={onClose}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:659`: <button> <button type="button" className="-m-1 p-1 text-fg-muted" aria-label="Zamknij" onClick={() => setSelected(null)}> → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/KampusTour.tsx:677`: <button> <button type="button" style={mine} className="btn self-start" onClick={() => { onMove({ type: "sell" → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:689`: <button> <button type="button" style={mine} className="btn self-start" onClick={() => { onMove({ type: "juwen → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:701`: <button> <button type="button" style={mine} className="btn self-start" onClick={() => { onMove({ type: "trave → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:796`: <button> <button key={i} type="button" aria-label={tile.name} aria-pressed={selected == → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/KampusTour.tsx:872`: <button> <button type="button" style={mine} className="btn" onClick={() => onMove({ type: "roll" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:882`: <button> <button type="button" style={mine} className="btn" onClick={() => onMove({ type: "buy" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:885`: <button> <button type="button" className="btn btn-ghost" onClick={() => onMove({ type: "skip" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:894`: <button> <button key={l} type="button" style={mine} className="btn min-h-11 flex- → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:906`: <button> <button type="button" className="btn btn-ghost min-h-11 px-4" onClick={() => onMove({ type: "skip" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:913`: <button> <button type="button" style={mine} className="btn" onClick={() => onMove({ type: "buyout" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:916`: <button> <button type="button" className="btn btn-ghost" onClick={() => onMove({ type: "skip" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:970`: <button> <button type="button" className="btn btn-ghost min-h-11 px-4 text-sm" onClick={() => setSummaryHidden(false)}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:995`: <button> <button key={k} type="button" disabled={!canMove \|\| !!owner} a → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/KampusTour.tsx:1043`: <button> <button type="button" style={mine} className="btn mt-2" autoFocus onClick={() => onMove({ type: "card" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/KampusTour.tsx:1096`: <button> <button type="button" style={mine} className="btn mt-2" autoFocus onClick={warning.dismiss}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Kolo.tsx**

- `apps/web/src/games/Kolo.tsx:221`: <button> <button type="button" className="btn btn-ghost w-full" onClick={() => onMove({ type: "result", points: [] })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:177`: <button> <button type="button" className="btn mt-auto w-full text-bg" style={{ backgroundColor: color }} onClick={next}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Kolor.tsx:202`: <button> <button type="button" className="btn mt-auto w-full text-bg" style={{ backgroundColor: color }} onClick={confirm}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Labirynt.tsx**

- `apps/web/src/games/Labirynt.tsx:192`: <button> <button key={m} type="button" aria-pressed={mode === m} disabled={m === "wall" → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Labirynt.tsx:207`: <button> <button type="button" className="btn btn-ghost h-14 w-full" onClick={() => onMove({ type: "pass" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Labirynt.tsx:215`: <button> <button type="button" className="btn btn-ghost h-14 px-5 disabled:opacity-40" disabled={!picked} → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Labirynt.tsx:223`: <button> <button type="button" className={ʼbtn h-14 flex-1 font-semibold disabled:opacity-40 ${error === "blocks" ? "border → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Mapa.tsx**

- `apps/web/src/games/Mapa.tsx:191`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} disabled={!pin} onClick={confirm}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:70`: <button> <button key={i} type="button" disabled={!canMove \|\| up} aria-label={ʼKarta ${i + 1}, ${up ? na → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*

**apps/web/src/games/PanstwaMiasta.tsx**

- `apps/web/src/games/PanstwaMiasta.tsx:104`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: player(me)?.color }} disabled={view.ready.includes(m… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/PanstwaMiasta.tsx:211`: <button> <button type="button" className="btn flex-1 text-bg" style={{ backgroundColor: color }} onPointerDown={(e) => e.preventDefault()} o… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/PanstwaMiasta.tsx:245`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: player(me)?.color }} onClick={submit}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/PanstwaMiasta.tsx:312`: <Cell> <Cell {...(canToggle && { type: "button" as const, onClick: () => onToggle(key), → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*

**apps/web/src/games/PiecWRzedzie.tsx**

- `apps/web/src/games/PiecWRzedzie.tsx:58`: <button> <button key={i} type="button" disabled={!canMove \|\| cell !== null} aria-label={ʼPole $ → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/PiecWRzedzie.tsx:109`: <button> <button type="button" className="btn h-14 w-full text-lg font-semibold text-bg disabled:opacity-40" style={{ backg → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:184`: <button> <button type="button" className="btn btn-ghost size-12 shrink-0 p-0 font-mono" aria-label="Rok wcześniej" onClick={() => setYear(Ma… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Rok.tsx:188`: <button> <button type="button" className="btn btn-ghost size-12 shrink-0 p-0 font-mono" aria-label="Rok później" onClick={() => setYear(Math… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Rok.tsx:201`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} onClick={submit}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:279`: <button> <button type="button" className="btn btn-ghost" onClick={() => onMove({ type: "unready" })}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Statki.tsx:302`: <button> <button type="button" className="btn btn-ghost" disabled={selected === null} onClick={() => selected !== null → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Statki.tsx:311`: <button> <button type="button" className="btn btn-ghost" onClick={() => { setSelected(null); commit(rando → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Statki.tsx:324`: <button> <button type="button" className="btn h-14 w-full text-lg font-semibold text-bg" style={{ backgroundColor: color }} → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Statki.tsx:407`: <button> <button type="button" className="btn h-14 w-full text-lg font-semibold text-bg disabled:opacity-40" style={{ backg → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*
- `apps/web/src/games/Statki.tsx:519`: <button> <button key={i} type="button" data-cell={i} aria-label={name({ x, y })} classNam → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*

**apps/web/src/games/Szacowanie.tsx**

- `apps/web/src/games/Szacowanie.tsx:182`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} autoFocus onClick={next}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Tort.tsx**

- `apps/web/src/games/Tort.tsx:182`: <button> <button type="button" className="btn w-full text-bg disabled:opacity-40" style={{ backgroundColor: color }} disabled={phase !== "pl… → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:169`: <button> <button type="button" className="btn w-full text-bg" style={{ backgroundColor: color }} autoFocus onClick={() => send(answers)}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:160`: <button> <button key={i} type="button" aria-pressed={on} className="flex aspect-square min-h-12 items-c → *do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)*
- `apps/web/src/games/Zakupy.tsx:175`: <button> <button type="button" className="btn text-bg" style={{ backgroundColor: color }} onClick={done}> → *zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)*

## 6. Stałe piksele i przewijanie w poziomie (UI-04, D-09, sprawdzenie statyczne)

Szukane: `w-/min-w-/max-w-[Npx]`, `min-w-[..]`, `width=` liczbą, `style` `width:` liczbą, `whitespace-nowrap`, `overflow-x*`, `grid-cols-[..]`/`gridTemplateColumns` (czy jest `minmax(0,1fr)`), `<svg>` bez `viewBox`.

Trafień: 19.

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:130`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] <div className="grid gap-2" style={{ gridTemplateColumns: ʼrepeat(${DZIES… → *do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)*

**apps/web/src/games/KampusSummary.tsx**

- `apps/web/src/games/KampusSummary.tsx:41`: [stała szerokość w rem (rozszerzenie planu): w-[36rem]] className="flex w-[36rem] animate-[card-in_0.35s_ease-out] flex-col gap-2 rounded-in… → *do oceny w planie gry (360×640, D-09)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:151`: [whitespace-nowrap: whitespace-nowrap] <span className="font-mono whitespace-nowrap"> → *do oceny w planie gry (360×640, D-09)*
- `apps/web/src/games/KampusTour.tsx:173`: [whitespace-nowrap: whitespace-nowrap] className="flex max-w-full items-center gap-0.5 rounded-full px-1 py-px text-[9px] leading-tight font… → *do oceny w planie gry (360×640, D-09)*
- `apps/web/src/games/KampusTour.tsx:665`: [siatka z własnym szablonem (minmax(0,1fr)?): grid-cols-[auto_1fr]] <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm"> → *do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)*
- `apps/web/src/games/KampusTour.tsx:756`: [whitespace-nowrap: whitespace-nowrap] className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 animate-[float-up_1.6s_ease… → *do oceny w planie gry (360×640, D-09)*
- `apps/web/src/games/KampusTour.tsx:774`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] gridTemplateColumns: "1.5fr repeat(10, 1fr) 1.5fr", → *do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)*
- `apps/web/src/games/KampusTour.tsx:987`: [stała szerokość w rem (rozszerzenie planu): w-[30rem]] className="flex w-[30rem] animate-[card-in_0.35s_ease-out] flex-col gap-3 rounded-in… → *do oceny w planie gry (360×640, D-09)*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:60`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] <div className="grid gap-2" style={{ gridTemplateColumns: ʼrepeat(${view.… → *zgodne (minmax(0,1fr))*

**apps/web/src/games/PanstwaMiasta.tsx**

- `apps/web/src/games/PanstwaMiasta.tsx:275`: [overflow-x: overflow-x-auto] <div className="tile overflow-x-auto p-2"> → *do oceny w planie gry: przewijanie w poziomie wewnątrz kafla (reguła mówi o ekranie; wysokie, jeśli bez tego nie widać treści)*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:130`: [siatka z własnym szablonem (minmax(0,1fr)?): grid-cols-[auto_repeat(5,1fr)]] <div className="grid grid-cols-[auto_repeat(5,1fr)] items-cent… → *do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:78`: [whitespace-nowrap: whitespace-nowrap] <table className="w-full border-separate border-spacing-y-1 whitespace-nowrap tabular-nums"> → *do oceny w planie gry (360×640, D-09)*
- `apps/web/src/games/Quiz.tsx:246`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] <div className={q.cols ? "grid gap-2" : "grid grid-cols-2 gap-3"} style={… → *do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:48`: [whitespace-nowrap: whitespace-nowrap] <table className="w-full border-separate border-spacing-y-1 whitespace-nowrap tabular-nums"> → *do oceny w planie gry (360×640, D-09)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:478`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] style={{ gridTemplateColumns: ʼ${compact ? "0.9rem" : "1.25rem"} repeat($… → *zgodne (minmax(0,1fr))*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:601`: [whitespace-nowrap: whitespace-nowrap] <span className={ʼmin-w-10 text-right font-mono text-sm font-medium whitespace-nowrap tabular-nums ${… → *do oceny w planie gry (360×640, D-09)*

**apps/web/src/screens/Home.tsx**

- `apps/web/src/screens/Home.tsx:188`: [whitespace-nowrap: whitespace-nowrap] className="btn btn-ghost px-2 whitespace-nowrap" → *do oceny w planie gry (360×640, D-09)*
- `apps/web/src/screens/Home.tsx:195`: [whitespace-nowrap: whitespace-nowrap] <button type="button" className="btn btn-ghost px-2 whitespace-nowrap" disabled={!!busy} onClick={() … → *do oceny w planie gry (360×640, D-09)*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:216`: [siatka z własnym szablonem (minmax(0,1fr)?): gridTemplateColumns] <div className="grid gap-1 text-center font-mono text-xs tabular-nums" st… → *zgodne (minmax(0,1fr))*

## 7. Teksty (UI-05)

Szukane: em-dash `—` i en-dash `–` (w każdej linii; linie-komentarze ocenione jako zgodne), `toFixed(` bez `.replace(".", ",")` ani `tenth` w tej samej linii, słowa `Rewanz|Restart|Zagraj ponownie|Wróć|Powrót|Kontynuuj|Next|OK|Start gry|Dalej »`.

Trafień: 9.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:109`: [en-dash] {n === 0 ? "–" : n} → *rozbieżność (średnia), jeśli w tekście UI*

**apps/web/src/games/Inny.tsx**

- `apps/web/src/games/Inny.tsx:18`: [toFixed w współrzędnych] return ʼ${Math.cos(a).toFixed(3)},${Math.sin(a).toFixed(3)}ʼ; → *zgodne (współrzędne SVG, nie tekst UI)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:1044`: [słowo: OK] OK → *do oceny: inne słowo niż wspólne (ZASADY.md §4)*
- `apps/web/src/games/KampusTour.tsx:1097`: [słowo: OK] OK → *do oceny: inne słowo niż wspólne (ZASADY.md §4)*

**apps/web/src/games/Mapa.tsx**

- `apps/web/src/games/Mapa.tsx:25`: [toFixed w współrzędnych] return ʼ${cx.toFixed(1)} ${cy.toFixed(1)}ʼ; → *zgodne (współrzędne SVG, nie tekst UI)*

**apps/web/src/screens/Home.tsx**

- `apps/web/src/screens/Home.tsx:108`: [słowo: Wróć] Wróć → *do oceny: inne słowo niż wspólne (ZASADY.md §4)*
- `apps/web/src/screens/Home.tsx:324`: [słowo: Wróć] Wróć do pokoju → *do oceny (słowo z KONCEPT.md: „Zagraj ponownie” w Rekordach, „Wróć do pokoju” na ekranie głównym)*

**apps/web/src/screens/Records.tsx**

- `apps/web/src/screens/Records.tsx:276`: [słowo: Zagraj ponownie] {lead ? "Zagraj ponownie" : "Pobij"} → *do oceny (słowo z KONCEPT.md: „Zagraj ponownie” w Rekordach, „Wróć do pokoju” na ekranie głównym)*
- `apps/web/src/screens/Records.tsx:336`: [słowo: Wróć] Wróć → *do oceny: inne słowo niż wspólne (ZASADY.md §4)*

## 8. Liczby bez mono / tabular-nums (UI-01, heurystyka)

Znacznik `span|div|p|td|th|strong|b|li|text|tspan|dd|output`, którego bezpośrednia treść (do następnego `<`) zawiera `{…}` z wyrażeniem wyglądającym na liczbę (cyfra, `Math.`, `tenth(`, `toFixed(`, nazwy typu `score`, `ms`, `round`, `length`), a klasa nie ma `font-mono`, `tabular-nums` ani `label`. Klasy dziedziczone z rodzica nie są widoczne, więc wszystko jest „do oceny”.

Trafień: 36.

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:206`: <div class="tile grid aspect-square w-full gap-[3px] p-2"> {Array.from({ length: 121 }, (_, i) => { if (i === CENTER) return → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Chinczyk.tsx:273`: <span class="font-normal"> (próba {4 - view.tries} z 3) → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/KampusSummary.tsx**

- `apps/web/src/games/KampusSummary.tsx:50`: <dd class=""> {who(rent[0])} · {rent[1]} zł → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusSummary.tsx:66`: <dd class=""> {who(doubles[0])} · {doubles[1]} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:584`: <span class="flex gap-[2px]"> {Array.from({ length: level(i) }, (_, k) => ( → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:604`: <span class="pointer-events-none absolute inset-0 z-10 grid place-items-c…"> {tokens(i, side ? 28 : 32)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:740`: <span class="text-sm"> {out ? "bankrut" : zl(cash[id])} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:746`: <span class="text-fg-muted"> {fields(ownedBy(id).length)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:769`: <div class="grid gap-[3px] rounded-inset p-[3px]"> {BOARD.map((tile, i) => { const [x, y] = cell(i); const owner = owners[i]; const sellable… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:901`: <span class="text-[11px] font-normal"> {buildCost(here, level(here), l)} zł · czynsz {levelRent(here, l)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/KampusTour.tsx:1091`: <li class="rounded-full border px-1.5 py-0.5"> {groupChip(k)} {mine}/{total} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:176`: <p class="text-center text-fg-muted"> {wrong.length ? ʼTwój kolor: ${wrong.join(", ")}ʼ : "Bardzo blisko"} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:135`: <span class="text-fg-muted"> {i + 1} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Przytrzymaj.tsx:141`: <span class=""> {seconds(t)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Przytrzymaj.tsx:170`: <p class="text-xs text-fg-muted"> Wynik to suma błędów z {PRZYTRZYMAJ_ROUNDS} rund, mniej znaczy lepiej. {played.length > 0 && " Czasy w sek… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:125`: <td class="px-1.5"> {duration(r.avg)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Quiz.tsx:128`: <td class="ʼrounded-r-inset pr-2 pl-1.5 ${r.res.errors > 0 ? "text-warn…"> {r.res.errors} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:84`: <td class="px-1.5"> {r.avg} ms → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Refleks.tsx:86`: <td class="rounded-r-inset pr-2 pl-1.5"> {r.best} ms → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:141`: <div class="flex items-center justify-center gap-2"> {Array.from({ length: RYTM_BEATS }, (_, i) => ( → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:24`: <span class="absolute -inset-px flex animate-[preview-quarter_2.4s_linear…"> {n} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:476`: <div class="ʼgrid rounded-inset border border-line bg-surface-inset ${co…"> {Array.from({ length: SIZE }, (_, k) => ( → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/games/Statki.tsx:490`: <span class="ʼflex items-center justify-center ${axis(k === py)}ʼ"> {k + 1} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Stroop.tsx**

- `apps/web/src/games/Stroop.tsx:26`: <span class="text-3xl font-bold tracking-wide"> {STROOP_COLORS[3]} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:31`: <span class="absolute -inset-px flex animate-[preview-quarter_2.4s_linear…"> {[2, 3, 2][order]} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/Szacowanie.tsx**

- `apps/web/src/games/Szacowanie.tsx:38`: <span class=""> {n} {unit} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:160`: <span class="font-semibold text-success"> = {wPamieciValue(round)} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:306`: <span class="id === winner ? "animate-[stone-pop_0.5s_ease-out]" : """> {view.scores[id] ?? 0} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/screens/Game.tsx:518`: <p class="basis-full text-center text-sm"> {wants.map((p) => p.nick).join(", ")} {wants.length === 1 ? "chce" : "chcą"} rewanżu → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/screens/Game.tsx:549`: <span class="font-semibold"> {t.extra && t.index === t.games.length - 1 ? "dogrywka, " : ""}{GAMES[t.games[t.index]]?.name} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/screens/Home.tsx**

- `apps/web/src/screens/Home.tsx:331`: <span class="flex-1 truncate text-sm text-fg-muted"> {(r.gameId && GAMES[r.gameId]?.name) \|\| "Lobby"} · {alive[r.code]} {alive[r.code] ===… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/screens/Records.tsx**

- `apps/web/src/screens/Records.tsx:161`: <p class="mt-1 text-sm text-fg-muted"> Ranking wszech czasów. {was && was.place > now.place ? ʼAwans z ${was.place}. miejsca. ʼ : ""} {/* Je… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/screens/Records.tsx:251`: <span class="truncate"> {rows[0].nick}: {formatRecord(id, rows[0])} {nick && ʼ · ty: ${mine ? formatRecord(id, mine) : "brak wyniku"}ʼ} → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/screens/Setup.tsx**

- `apps/web/src/screens/Setup.tsx:112`: <p class="text-sm text-fg-muted"> {view.seats.length > 1 ? "Seria mini-gier po kolei. Za każdą grę dostajesz punkt za każdego pokonanego ryw… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*
- `apps/web/src/screens/Setup.tsx:211`: <span class="text-fg-muted"> · ok. {minutes(length)} min → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:243`: <p class="text-xs text-fg-muted"> Błąd w każdej rundzie ({unit}){played.length > 1 && "; tło w kolorze gracza ma najlepszy w rundzie"}. {leg… → *do oceny w planie gry (klasy mogą być dziedziczone z rodzica)*

## 9. Dostępność (UI-05: aria-hidden, aria-label)

`<svg>` i ikony Phosphor (importy z `@phosphor-icons/react` w pliku, oraz `Icon`/`PointIcon`/`GameIcon`) bez `aria-hidden`/`aria-label`/`role`; `<button>` bez tekstu dosłownego i bez `aria-label`.

Trafień: 20.

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:134`: [button bez tekstu (tylko wyrażenia)] <button // Klucz z błysku: przycisk montuje się od nowa i animacja startuje jeszcze raz. key … {n} → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/games/Kalambury.tsx**

- `apps/web/src/games/Kalambury.tsx:92`: [button bez tekstu (tylko wyrażenia)] <button key={word} type="button" className="btn btn-ghost w-full text-lg" onClick={() => onMove({ type… → *do oceny: tekst może przychodzić z wyrażenia*
- `apps/web/src/games/Kalambury.tsx:153`: [svg bez aria-hidden \| komponent: Canvas] <svg viewBox={ʼ0 0 ${KALAMBURY_SIDE} ${KALAMBURY_SIDE}ʼ} className="mx-auto block aspect-square w… → *do oceny (niska): ozdoba bez aria-hidden; może mieć aria-hidden na rodzicu albo być treścią (pole gry)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:660`: [ikona X bez aria-hidden \| komponent: KampusTour] <X size={18} /> → *do oceny (niska): ozdoba bez aria-hidden; może mieć aria-hidden na rodzicu albo być treścią (pole gry)*

**apps/web/src/games/Kolo.tsx**

- `apps/web/src/games/Kolo.tsx:155`: [svg bez aria-hidden \| komponent: Kolo] <svg viewBox="0 0 1 1" className="h-24"> → *zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)*
- `apps/web/src/games/Kolo.tsx:188`: [svg bez aria-hidden \| komponent: Kolo] <svg viewBox="0 0 1 1" className="block aspect-square w-full touch-none select-none rounded-tile bo… → *do oceny (niska): ozdoba bez aria-hidden; może mieć aria-hidden na rodzicu albo być treścią (pole gry)*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:86`: [ikona DiamondsFour bez aria-hidden \| komponent: Memory] <DiamondsFour className="size-[38%]" weight="fill" /> → *do oceny (niska): ozdoba bez aria-hidden; może mieć aria-hidden na rodzicu albo być treścią (pole gry)*

**apps/web/src/games/Nozyczki.tsx**

- `apps/web/src/games/Nozyczki.tsx:31`: [svg bez aria-hidden \| komponent: Preview] <svg viewBox="0 0 100 100" className="h-28"> → *zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:36`: [ikona HandTap bez aria-hidden \| komponent: Preview] <HandTap size={36} /> → *zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:248`: [button bez tekstu (tylko wyrażenia)] <button // Klucz z błysku: przycisk montuje się od nowa i animacja startuje jeszcze raz. key={i … {opt… → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:136`: [button bez tekstu (tylko wyrażenia)] <button // Klucz z błysku: kafelek montuje się od nowa i animacja startuje jeszcze raz. key={n = … {n} → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:29`: [ikona HandPalm bez aria-hidden \| komponent: Preview] <HandPalm size={20} weight="fill" /> → *zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:150`: [button bez tekstu (tylko wyrażenia)] <button // Klucz z błysku: pole montuje się od nowa i animacja startuje jeszcze raz. … {n \\|\\| ""} → *do oceny: tekst może przychodzić z wyrażenia*
- `apps/web/src/games/Sudoku.tsx:168`: [button bez tekstu (tylko wyrażenia)] <button key={d} type="button" onPointerDown={() => enter(d)} className=" … {d} → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/games/Tort.tsx**

- `apps/web/src/games/Tort.tsx:39`: [svg bez aria-hidden \| komponent: Preview] <svg viewBox="0 0 100 100" className="h-28"> → *zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:160`: [button bez tekstu (tylko wyrażenia)] <button key={i} type="button" aria-pressed={on} className="flex … {item} → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/screens/Home.tsx**

- `apps/web/src/screens/Home.tsx:172`: [button bez tekstu (tylko wyrażenia)] <button type="button" className="flex min-h-12 w-full items-center gap-3 text-left" disabled={!!busy} … → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:163`: [button bez tekstu (tylko wyrażenia)] <button type="button" className={className} styl … {row} → *do oceny: tekst może przychodzić z wyrażenia*
- `apps/web/src/screens/Lobby.tsx:251`: [button bez tekstu (tylko wyrażenia)] <button type="button" aria-pressed={picked} disabled={disabled} className={ʼflex rounded-inset b … <Ti… → *do oceny: tekst może przychodzić z wyrażenia*

**apps/web/src/screens/Setup.tsx**

- `apps/web/src/screens/Setup.tsx:42`: [button bez tekstu (tylko wyrażenia)] <button key={m.id} type="button" role="radio" aria-check … <span className="leading-tight">{m.name}</s… → *do oceny: tekst może przychodzić z wyrażenia*

## 10. Intro (UI-02)

| Plik | `<Intro` | `Preview` w pliku | przez wspólny ekran | podgląd z innego pliku |
|---|---:|---|---|---|
| apps/web/src/games/Balon.tsx | 1 | tak | - | - |
| apps/web/src/games/Chinczyk.tsx | · | nie | - | - |
| apps/web/src/games/Dziesiatki.tsx | 1 | tak | Quiz | - |
| apps/web/src/games/Inny.tsx | · | nie | Quiz | QuizPreview |
| apps/web/src/games/Kalambury.tsx | · | nie | - | - |
| apps/web/src/games/KampusSummary.tsx | · | nie | - | - |
| apps/web/src/games/KampusTour.tsx | · | nie | - | - |
| apps/web/src/games/Kat.tsx | · | tak | Szacowanie | - |
| apps/web/src/games/Kolo.tsx | 1 | nie | - | - |
| apps/web/src/games/Kolor.tsx | 1 | tak | - | - |
| apps/web/src/games/Kropki.tsx | · | tak | Szacowanie | - |
| apps/web/src/games/Kubki.tsx | 1 | tak | - | - |
| apps/web/src/games/Labirynt.tsx | · | nie | - | - |
| apps/web/src/games/Liczenie.tsx | · | nie | Quiz | QuizPreview |
| apps/web/src/games/Literowka.tsx | · | nie | Quiz | QuizPreview |
| apps/web/src/games/Mapa.tsx | 1 | tak | - | - |
| apps/web/src/games/Memory.tsx | · | nie | - | - |
| apps/web/src/games/MiniGame.tsx | · | nie | - | - |
| apps/web/src/games/Nozyczki.tsx | 1 | tak | - | - |
| apps/web/src/games/Obrot.tsx | · | nie | Quiz | QuizPreview |
| apps/web/src/games/PanstwaMiasta.tsx | · | nie | - | - |
| apps/web/src/games/PiecWRzedzie.tsx | · | nie | - | - |
| apps/web/src/games/Przytrzymaj.tsx | 1 | tak | - | - |
| apps/web/src/games/Quiz.tsx | 1 | nie | - | QuizPreview |
| apps/web/src/games/Refleks.tsx | 1 | tak | - | - |
| apps/web/src/games/Rok.tsx | 1 | tak | - | - |
| apps/web/src/games/Rytm.tsx | 1 | tak | - | - |
| apps/web/src/games/Schulte.tsx | 1 | tak | - | - |
| apps/web/src/games/Simon.tsx | 1 | tak | - | - |
| apps/web/src/games/Sledzenie.tsx | 1 | tak | - | - |
| apps/web/src/games/Srodek.tsx | 1 | tak | - | - |
| apps/web/src/games/Statki.tsx | · | nie | - | - |
| apps/web/src/games/Stoj.tsx | 1 | tak | Quiz | - |
| apps/web/src/games/Stoper.tsx | 1 | tak | - | - |
| apps/web/src/games/Stroop.tsx | · | nie | Quiz | QuizPreview |
| apps/web/src/games/Sudoku.tsx | 1 | tak | - | - |
| apps/web/src/games/Szacowanie.tsx | 1 | nie | - | - |
| apps/web/src/games/Tort.tsx | 1 | tak | - | - |
| apps/web/src/games/WPamieci.tsx | 1 | tak | - | - |
| apps/web/src/games/Wieza.tsx | 1 | tak | - | - |
| apps/web/src/games/Zakupy.tsx | 1 | tak | - | - |
| apps/web/src/games/Zaslona.tsx | 1 | tak | - | - |

Mini-gry z własnym `<Intro`: 23; przez `Quiz.tsx` (bez własnego `<Intro`): 5 (`games/Inny.tsx`, `games/Liczenie.tsx`, `games/Literowka.tsx`, `games/Obrot.tsx`, `games/Stroop.tsx`); przez `Szacowanie.tsx`: 2 (`games/Kat.tsx`, `games/Kropki.tsx`). Razem 30 (KONCEPT.md §2.4: 30 mini-gier). Pliki bez `<Intro` i bez wspólnego ekranu to gry główne albo pomocnicze (`MiniGame.tsx`, `KampusSummary.tsx`): zgodne, Intro dotyczy tylko mini-gier.

## 10a. Atrybuty `<Intro>`

Dla każdego `<Intro` sprawdzone atrybuty `time`, `task`, `score`, `preview`, `onStart`. Wartości do oceny treści w planach gier (krótkie, po polsku, bez em-dashy).

Trafień: 25.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:124`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time={ʼ${BALON_BALLOONS} balonów, bez pośpiechuʼ}… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:111`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${QUIZ_DURATION_MS / 1000} sekundʼ} task="Dotknij dwóch … → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Kolo.tsx**

- `apps/web/src/games/Kolo.tsx:153`: [atrybuty: time, task, score, preview, onStart] <Intro preview={ <svg viewBox="0 0 1 1" className="h-24"> <circle cx={0.5} cy={0.5} r={0.4} … → *do oceny: komplet atrybutów, podgląd wpisany inline zamiast komponentu Preview (ZASADY.md §4: „mały komponent Preview”)*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:134`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${KOLOR_COUNT} kolorów, każdy widać przez ${KOLOR_SHOW_M… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:137`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time={ʼDo ${KUBKI_ROUNDS} rund, kubki mieszają si… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Mapa.tsx**

- `apps/web/src/games/Mapa.tsx:127`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${MAPA_ROUNDS} rund, w każdej jedno miastoʼ} task="Dotkn… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Nozyczki.tsx**

- `apps/web/src/games/Nozyczki.tsx:108`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${NOZYCZKI_SHAPES} kształtów, każdy na jedno cięcieʼ} ta… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:181`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${PRZYTRZYMAJ_ROUNDS} rund, pole świeci się od 1 do 5 se… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:221`: [atrybuty: time, task, score, preview, onStart] <Intro preview={preview} time={ʼ${QUIZ_DURATION_MS / 1000} sekundʼ} task={task} score={score… → *do oceny: komplet atrybutów, podgląd przychodzi z propsów (wspólny ekran); Preview sprawdzić w plikach gier*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:187`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${REFLEKS_ROUNDS} zmian koloruʼ} task="Dotknij pola, gdy… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:143`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${ROK_ROUNDS} rund, ${ROK_ROUND_MS / 1000} s na każdąʼ} … → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:126`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${RYTM_BEATS} uderzeń metronomu, potem ciszaʼ} task={ʼSt… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:111`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time="Stoper rusza po Starcie" task="Dotykaj liczby od 1 do 25 … → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:92`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time="Bez pośpiechu: co rundę dochodzi jeden krok" task="Zapami… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Sledzenie.tsx**

- `apps/web/src/games/Sledzenie.tsx:128`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time={ʼDo ${ROUNDS} rund, kulki lecą coraz szybci… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Srodek.tsx**

- `apps/web/src/games/Srodek.tsx:129`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${SRODEK_ROUNDS} rund, w każdej jeden odcinekʼ} task="Ws… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:112`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${STOJ_DURATION_MS / 1000} sekund, tempo rośnieʼ} task="… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Stoper.tsx**

- `apps/web/src/games/Stoper.tsx:92`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼPo odliczaniu 3, 2, 1 stoper rusza od zera i po ${STOPER… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:119`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time="Stoper rusza po Starcie" task="Uzupełnij planszę 4×4: w k… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Szacowanie.tsx**

- `apps/web/src/games/Szacowanie.tsx:120`: [atrybuty: time, task, score, preview, onStart] <Intro preview={preview} time={time} task={task} score={score} onStart={() => setPhase("wait… → *do oceny: komplet atrybutów, podgląd przychodzi z propsów (wspólny ekran); Preview sprawdzić w plikach gier*

**apps/web/src/games/Tort.tsx**

- `apps/web/src/games/Tort.tsx:125`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼ${TORT_CAKES} tortów, każdy na 3 do 7 kawałkówʼ} task="P… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:105`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview />} time={ʼDo ${W_PAMIECI_ROUNDS} rund, każde działanie widać ${Str… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:113`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time={ʼDo ${WIEZA_LEVELS} pięter, klocek jedzie c… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:120`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time="10 s na zapamiętanie, potem zaznaczasz" tas… → *zgodne (komplet atrybutów, Preview w pliku)*

**apps/web/src/games/Zaslona.tsx**

- `apps/web/src/games/Zaslona.tsx:135`: [atrybuty: time, task, score, preview, onStart] <Intro preview={<Preview color={color} />} time={ʼ${ZASLONA_ROUNDS} rund, kulka toczy się od… → *zgodne (komplet atrybutów, Preview w pliku)*

## 11. Katalog keyframes z index.css (ANIM-01)

| Nazwa | Linia | Komentarz nad regułą | Wymienione w ZASADY.md §5 | Użycia (`animate-[…]`) |
|---|---:|---|---|---|
| `set-glow` | apps/web/src/index.css:194 | tak | tak | games/KampusTour.tsx:803, screens/Records.tsx:144 |
| `ring-pulse` | apps/web/src/index.css:205 | tak | tak | games/Chinczyk.tsx:219, games/Memory.tsx:90, screens/Game.tsx:525 |
| `stone-pop` | apps/web/src/index.css:217 | tak | tak | games/Labirynt.tsx:151, games/Mapa.tsx:177, games/Memory.tsx:104, games/PiecWRzedzie.tsx:69, games/Statki.tsx:373, games/WPamieci.tsx:130, screens/Game.tsx:306, screens/ui.tsx:125 |
| `line-draw` | apps/web/src/index.css:225 | tak | nie | games/Kolo.tsx:166, games/PiecWRzedzie.tsx:100 |
| `preview-half` | apps/web/src/index.css:235 | tak | tak | games/Balon.tsx:28, games/Dziesiatki.tsx:27, games/Kat.tsx:40, games/Kat.tsx:41, games/Kolor.tsx:68, games/Kropki.tsx:21, games/Kropki.tsx:23, games/Kubki.tsx:38, games/Mapa.tsx:40, games/Nozyczki.tsx:33, games/Przytrzymaj.tsx:31, games/Przytrzymaj.tsx:33, games/Quiz.tsx:150, games/Rok.tsx:33, games/Rok.tsx:43, games/Rytm.tsx:26, games/Sledzenie.tsx:35, games/Srodek.tsx:45, games/Stoj.tsx:28, games/Tort.tsx:43, games/Wieza.tsx:31, games/Zakupy.tsx:27, games/Zaslona.tsx:34, games/Zaslona.tsx:37 |
| `preview-quarter` | apps/web/src/index.css:246 | wspólny z poprzednią | tak | games/Refleks.tsx:128, games/Schulte.tsx:25, games/Simon.tsx:33, games/Stoper.tsx:25, games/Sudoku.tsx:32, games/WPamieci.tsx:31 |
| `title-pop` | apps/web/src/index.css:258 | tak | nie | screens/Game.tsx:243 |
| `dice-tumble` | apps/web/src/index.css:266 | tak | tak | games/Chinczyk.tsx:108, games/KampusTour.tsx:293 |
| `card-in` | apps/web/src/index.css:280 | tak | tak | games/KampusSummary.tsx:41, games/KampusTour.tsx:987, games/KampusTour.tsx:1033, games/KampusTour.tsx:1073 |
| `float-up` | apps/web/src/index.css:288 | tak | tak | games/Balon.tsx:157, games/KampusTour.tsx:756, games/Wieza.tsx:162, screens/Game.tsx:311, screens/ui.tsx:132 |
| `tile-hit` | apps/web/src/index.css:303 | tak | nie | games/Dziesiatki.tsx:142, games/Quiz.tsx:256, games/Schulte.tsx:141, games/Sudoku.tsx:157, games/Wieza.tsx:146 |
| `tile-miss` | apps/web/src/index.css:310 | wspólny z poprzednią | nie | games/Dziesiatki.tsx:142, games/Quiz.tsx:256, games/Schulte.tsx:141, games/Stoj.tsx:145, games/Sudoku.tsx:157 |
| `piece-fall` | apps/web/src/index.css:330 | tak | nie | games/Wieza.tsx:142 |
| `shake` | apps/web/src/index.css:338 | tak | nie | games/Nozyczki.tsx:142, games/Srodek.tsx:162 |

Reguł `@keyframes`: 14. Nieużywane w plikach .tsx przez `animate-[…]`: brak. Nazwy użyte w `animate-[…]` spoza katalogu: brak.

View transitions w `index.css`: `apps/web/src/index.css:354` (::view-transition-group(statki-own),); `apps/web/src/index.css:355` (::view-transition-group(statki-enemy) {).

## 11a. Użycia animacji w kodzie (ANIM-01)

`animate-[nazwa_czas_easing…]` rozbite na nazwę, czas i resztę (easing, iteracje), wbudowane `animate-spin|pulse|ping|bounce`, inline `animation*:` i `[animation-*:…]`.

Trafień: 100.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:28`: [preview-half \| 3s \| linear infinite] <span className="absolute top-1/2 left-1/2 aspect-square h-[70%] -translate-1/2 animate-[preview-hal… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Balon.tsx:157`: [float-up \| 1.6s \| ease-out forwards] className={ʼpointer-events-none absolute inset-x-0 top-[12%] animate-[float-up_1.6s_ease-out_forward… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:108`: [dice-tumble \| 0.3s \| ease-in-out infinite] className={ʼshrink-0 ${rolling ? "animate-[dice-tumble_0.3s_ease-in-out_infinite]" : ""}ʼ} → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Chinczyk.tsx:219`: [ring-pulse \| 1s \| ease-in-out infinite] isPick ? "outline-2 outline-offset-1" : movable ? "animate-[ring-pulse_1s_ease-in-out_infinite] o… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:27`: [preview-half \| 2.4s \| linear infinite] <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset bord… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Dziesiatki.tsx:27`: [[animation-delay:-1.2s]] <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset border-2 border-succ… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Dziesiatki.tsx:142`: [tile-hit \| 0.35s \| ease-out] } ${flashed ? (flash!.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]") : ""}… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Dziesiatki.tsx:142`: [tile-miss \| 0.35s \| ease-out] } ${flashed ? (flash!.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]") : ""… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/KampusSummary.tsx**

- `apps/web/src/games/KampusSummary.tsx:41`: [card-in \| 0.35s \| ease-out] className="flex w-[36rem] animate-[card-in_0.35s_ease-out] flex-col gap-2 rounded-inset border border-line bg… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:293`: [dice-tumble \| 0.3s \| ease-in-out infinite] className={rolling ? "animate-[dice-tumble_0.3s_ease-in-out_infinite]" : ""} → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/KampusTour.tsx:294`: [animationDelay:] style={{ animationDelay: ʼ${i * 80}msʼ }} → *do oceny: delay bez widocznego minusa (poza Preview albo wyliczany)*
- `apps/web/src/games/KampusTour.tsx:756`: [float-up \| 1.6s \| ease-out forwards] className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 animate-[float-up_1.6s_eas… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/KampusTour.tsx:803`: [set-glow \| 0.9s \| ease-in-out 4] } ${pickable(i) === false ? "opacity-40" : ""} ${fresh.includes(i) ? "animate-[set-glow_0.9s_ease-in-out… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/KampusTour.tsx:987`: [card-in \| 0.35s \| ease-out] className="flex w-[30rem] animate-[card-in_0.35s_ease-out] flex-col gap-3 rounded-inset border border-line bg… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/KampusTour.tsx:1033`: [card-in \| 0.35s \| ease-out] className="flex w-72 animate-[card-in_0.35s_ease-out] flex-col overflow-hidden rounded-inset border border-li… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/KampusTour.tsx:1073`: [card-in \| 0.35s \| ease-out] className="flex w-80 animate-[card-in_0.35s_ease-out] flex-col overflow-hidden rounded-inset border border-li… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Kat.tsx**

- `apps/web/src/games/Kat.tsx:40`: [preview-half \| 3s \| linear infinite] <Angle angle={65} rotation={-80} className="animate-[preview-half_3s_linear_infinite]" /> → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Kat.tsx:41`: [preview-half \| 3s \| linear infinite] <span className="animate-[preview-half_3s_linear_infinite] font-mono text-3xl font-semibold opacity-… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Kat.tsx:41`: [[animation-delay:-1.5s]] <span className="animate-[preview-half_3s_linear_infinite] font-mono text-3xl font-semibold opacity-0 [animation-d… → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Kolo.tsx**

- `apps/web/src/games/Kolo.tsx:166`: [line-draw \| 2.5s \| ease-in-out infinite] className="animate-[line-draw_2.5s_ease-in-out_infinite]" → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:64`: [[animation-delay:-1.5s]] ["Twój kolor", "#3f7fe6", "opacity-0 [animation-delay:-1.5s]"], → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Kolor.tsx:68`: [preview-half \| 3s \| linear infinite] <span className={ʼsize-16 animate-[preview-half_3s_linear_infinite] rounded-inset ${late}ʼ} style={{… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Kropki.tsx**

- `apps/web/src/games/Kropki.tsx:21`: [preview-half \| 3s \| linear infinite] <span key={x} className="absolute size-2.5 animate-[preview-half_3s_linear_infinite] rounded-full bg… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Kropki.tsx:23`: [preview-half \| 3s \| linear infinite] <span className="animate-[preview-half_3s_linear_infinite] font-mono text-3xl font-semibold opacity-… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Kropki.tsx:23`: [[animation-delay:-1.5s]] <span className="animate-[preview-half_3s_linear_infinite] font-mono text-3xl font-semibold opacity-0 [animation-d… → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:38`: [preview-half \| 3s \| linear infinite] {i === 1 && <span className="absolute -top-1 size-4 animate-[preview-half_3s_linear_infinite] rounde… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Labirynt.tsx**

- `apps/web/src/games/Labirynt.tsx:143`: [tailwind animate-pulse] <circle key={ʼ${c.x},${c.y}ʼ} cx={(c.x + 0.5) * CELL} cy={(c.y + 0.5) * CELL} r={1.6} fill={myColor} className="ani… → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*
- `apps/web/src/games/Labirynt.tsx:151`: [stone-pop \| 0.35s \| ease-out] className={i === last ? "animate-[stone-pop_0.35s_ease-out]" : ""} → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Mapa.tsx**

- `apps/web/src/games/Mapa.tsx:40`: [preview-half \| 2s \| linear infinite] <circle cx={W * 0.62} cy={H * 0.45} r={4} className="animate-[preview-half_2s_linear_infinite] fill-… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Mapa.tsx:40`: [[animation-delay:-1s]] <circle cx={W * 0.62} cy={H * 0.45} r={4} className="animate-[preview-half_2s_linear_infinite] fill-success opacity-… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Mapa.tsx:177`: [stone-pop \| 0.35s \| ease-out] className={ʼorigin-center animate-[stone-pop_0.35s_ease-out] [transform-box:fill-box] ${grade(error).stroke… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:90`: [ring-pulse \| 1.2s \| ease-in-out infinite] live ? "animate-[ring-pulse_1.2s_ease-in-out_infinite] border-2 outline-2" : owner !== null ? "… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Memory.tsx:104`: [stone-pop \| 0.35s \| ease-out] <span className={ʼtext-[50cqw] leading-none ${owner !== null ? "animate-[stone-pop_0.35s_ease-out]" : ""}ʼ}… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Memory.tsx:116`: [tailwind animate-ping] {!canMove && <span className="absolute inset-0 animate-ping rounded-full" style={{ backgroundColor: turnColor }} />} → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*

**apps/web/src/games/Nozyczki.tsx**

- `apps/web/src/games/Nozyczki.tsx:33`: [preview-half \| 2s \| linear infinite] <line x1={10} y1={72} x2={92} y2={26} className="animate-[preview-half_2s_linear_infinite] stroke-su… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Nozyczki.tsx:33`: [[animation-delay:-1s]] <line x1={10} y1={72} x2={92} y2={26} className="animate-[preview-half_2s_linear_infinite] stroke-success opacity-0 … → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Nozyczki.tsx:142`: [shake \| 0.3s \| ease-out] <svg key={miss} viewBox="0 0 100 100" className={ʼabsolute inset-0 size-full ${miss ? "animate-[shake_0.3s_ease-… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/PiecWRzedzie.tsx**

- `apps/web/src/games/PiecWRzedzie.tsx:69`: [stone-pop \| 0.35s \| ease-out] className={ʼaspect-square w-[80%] rounded-full ${last === i ? "animate-[stone-pop_0.35s_ease-out] outline-2… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/PiecWRzedzie.tsx:78`: [tailwind animate-pulse] <span className="animate-pulse rounded-full" style={{ backgroundColor: ʼcolor-mix(in srgb, ${myColor} 55%, transpar… → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*
- `apps/web/src/games/PiecWRzedzie.tsx:100`: [line-draw \| 0.5s \| ease-out backwards] className="animate-[line-draw_0.5s_ease-out_backwards]" → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/PiecWRzedzie.tsx:122`: [tailwind animate-pulse] <span className="size-2.5 animate-pulse rounded-full" style={{ backgroundColor: myColor }} aria-hidden /> → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:31`: [preview-half \| 3s \| linear infinite] <span className="absolute size-20 animate-[preview-half_3s_linear_infinite] rounded-tile bg-fg" /> → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Przytrzymaj.tsx:33`: [preview-half \| 3s \| linear infinite] className="absolute flex size-20 animate-[preview-half_3s_linear_infinite] items-center justify-cent… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Przytrzymaj.tsx:34`: [animationDelay:] style={{ animationDelay: "-1.5s" }} → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:150`: [preview-half \| 2.4s \| linear infinite] <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset bord… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Quiz.tsx:150`: [[animation-delay:-1.2s]] <span className="absolute -inset-px animate-[preview-half_2.4s_linear_infinite] rounded-inset border-2 border-succ… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Quiz.tsx:256`: [tile-hit \| 0.35s \| ease-out] } ${i === flash?.i ? (flash.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]")… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Quiz.tsx:256`: [tile-miss \| 0.35s \| ease-out] } ${i === flash?.i ? (flash.ok ? "animate-[tile-hit_0.35s_ease-out]" : "animate-[tile-miss_0.35s_ease-out]"… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:128`: [preview-quarter \| 2.4s \| linear infinite] <span className="absolute inset-0 flex animate-[preview-quarter_2.4s_linear_infinite] items-cen… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Refleks.tsx:128`: [[animation-delay:-1.2s]] <span className="absolute inset-0 flex animate-[preview-quarter_2.4s_linear_infinite] items-center justify-center … → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:33`: [preview-half \| 3s \| linear infinite] className={ʼabsolute inset-0 animate-[preview-half_3s_linear_infinite] text-center font-mono text-3x… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Rok.tsx:33`: [[animation-delay:-1.5s]] className={ʼabsolute inset-0 animate-[preview-half_3s_linear_infinite] text-center font-mono text-3xl font-semibol… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Rok.tsx:43`: [preview-half \| 3s \| linear infinite] className={ʼabsolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-[preview-half_3s_linea… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Rok.tsx:43`: [[animation-delay:-1.5s]] className={ʼabsolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-[preview-half_3s_linear_infinite] ro… → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:26`: [preview-half \| 1s \| linear infinite] return <span className="size-12 animate-[preview-half_1s_linear_infinite] rounded-full bg-fg" />; → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:25`: [preview-quarter \| 2.4s \| linear infinite] className="absolute -inset-px flex animate-[preview-quarter_2.4s_linear_infinite] items-center … → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Schulte.tsx:26`: [animationDelay:] style={{ animationDelay: ʼ${(n - 1) * 0.6 - 2.4}sʼ }} → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Schulte.tsx:141`: [tile-hit \| 0.35s \| ease-out] className={ʼtouch-none select-none rounded-inset border border-line bg-surface font-mono text-2xl font-semib… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Schulte.tsx:141`: [tile-miss \| 0.35s \| ease-out] className={ʼtouch-none select-none rounded-inset border border-line bg-surface font-mono text-2xl font-semi… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:33`: [preview-quarter \| 2.4s \| linear infinite] className="absolute inset-0 animate-[preview-quarter_2.4s_linear_infinite] rounded-inset opacit… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Simon.tsx:34`: [animationDelay:] style={{ backgroundColor: color, animationDelay: ʼ${PREVIEW_ORDER.indexOf(i) * 0.6 - 2.4}sʼ }} → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Sledzenie.tsx**

- `apps/web/src/games/Sledzenie.tsx:35`: [preview-half \| 3s \| linear infinite] {isTarget(i) && <span className="absolute inset-0 animate-[preview-half_3s_linear_infinite]" style={… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Srodek.tsx**

- `apps/web/src/games/Srodek.tsx:45`: [preview-half \| 2s \| linear infinite] <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 animate-[preview-half_2s_linear_inf… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Srodek.tsx:45`: [[animation-delay:-1s]] <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2 animate-[preview-half_2s_linear_infinite] rounded-f… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Srodek.tsx:162`: [shake \| 0.3s \| ease-out] <svg key={miss} viewBox="0 0 100 100" className={ʼabsolute inset-0 size-full ${miss ? "animate-[shake_0.3s_ease-… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:276`: [tailwind animate-pulse] <span className="size-2.5 animate-pulse rounded-full" style={{ backgroundColor: color }} aria-hidden /> → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*
- `apps/web/src/games/Statki.tsx:373`: [stone-pop \| 0.35s \| ease-out] const pop = (i: number) => (fresh && fresh.y * SIZE + fresh.x === i ? "animate-[stone-pop_0.35s_ease-out]" … → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:28`: [preview-half \| 2.4s \| linear infinite] <span className="absolute inset-0 flex animate-[preview-half_2.4s_linear_infinite] items-center ju… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Stoj.tsx:28`: [[animation-delay:-1.2s]] <span className="absolute inset-0 flex animate-[preview-half_2.4s_linear_infinite] items-center justify-center gap… → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Stoj.tsx:145`: [tile-miss \| 0.35s \| ease-out] ? "animate-[tile-miss_0.35s_ease-out] bg-surface text-warning" → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Stoper.tsx**

- `apps/web/src/games/Stoper.tsx:25`: [preview-quarter \| 4s \| linear infinite] className={ʼabsolute animate-[preview-quarter_4s_linear_infinite] text-4xl font-semibold tabular-… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Stoper.tsx:26`: [animationDelay:] style={{ animationDelay: ʼ${i - 4}sʼ }} → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:32`: [preview-quarter \| 2.4s \| linear infinite] className="absolute -inset-px flex animate-[preview-quarter_2.4s_linear_infinite] items-center … → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Sudoku.tsx:33`: [animationDelay:] style={{ animationDelay: ʼ${order * 0.6 - 2.4}sʼ }} → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/Sudoku.tsx:157`: [tile-hit \| 0.35s \| ease-out] className={ʼaspect-square touch-none select-none rounded-inset border border-line font-mono text-3xl font-se… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Sudoku.tsx:157`: [tile-miss \| 0.35s \| ease-out] className={ʼaspect-square touch-none select-none rounded-inset border border-line font-mono text-3xl font-s… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Tort.tsx**

- `apps/web/src/games/Tort.tsx:43`: [preview-half \| 2s \| linear infinite] <Cut deg={240} className="animate-[preview-half_2s_linear_infinite] stroke-success opacity-0 [animat… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Tort.tsx:43`: [[animation-delay:-1s]] <Cut deg={240} className="animate-[preview-half_2s_linear_infinite] stroke-success opacity-0 [animation-delay:-1s]" … → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:31`: [preview-quarter \| 4s \| linear infinite] className={ʼabsolute inset-0 flex animate-[preview-quarter_4s_linear_infinite] items-center justi… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/WPamieci.tsx:32`: [animationDelay:] style={{ animationDelay: ʼ${i ? i - 4 : 0}sʼ }} → *zgodne (ujemny delay w Preview, §5)*
- `apps/web/src/games/WPamieci.tsx:130`: [stone-pop \| 180ms \| ease-out] <span key={pos} className="animate-[stone-pop_180ms_ease-out] font-mono text-6xl font-semibold tabular-nums… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:31`: [preview-half \| 3s \| linear infinite] <span className="absolute bottom-[54%] left-[40%] h-[18%] w-[30%] animate-[preview-half_3s_linear_in… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Wieza.tsx:142`: [piece-fall \| 0.5s \| ease-in forwards] {cut && <span key={ʼcut${level}ʼ} className="absolute animate-[piece-fall_0.5s_ease-in_forwards] bg… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Wieza.tsx:146`: [tile-hit \| 0.35s \| ease-out] className={ʼabsolute ${i % 2 ? "opacity-80" : ""} ${perfect && i === tower.height - 1 ? "animate-[tile-hit_0… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Wieza.tsx:162`: [float-up \| 1.6s \| ease-out forwards] className={ʼpointer-events-none absolute inset-x-0 top-[12%] animate-[float-up_1.6s_ease-out_forward… → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:27`: [preview-half \| 3s \| linear infinite] className="absolute -inset-px animate-[preview-half_3s_linear_infinite] rounded-inset border-2 opaci… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Zakupy.tsx:28`: [animationDelay:] style={{ borderColor: color, animationDelay: ʼ${i * -0.5}sʼ }} → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/games/Zaslona.tsx**

- `apps/web/src/games/Zaslona.tsx:34`: [preview-half \| 3s \| linear infinite] className="absolute top-1/2 left-[15%] size-5 -translate-y-1/2 animate-[preview-half_3s_linear_infin… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Zaslona.tsx:37`: [preview-half \| 3s \| linear infinite] <span className="absolute inset-y-0 left-[45%] flex w-[35%] animate-[preview-half_3s_linear_infinite… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/games/Zaslona.tsx:37`: [[animation-delay:-1.5s]] <span className="absolute inset-y-0 left-[45%] flex w-[35%] animate-[preview-half_3s_linear_infinite] items-center… → *zgodne (ujemny delay w Preview, §5)*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:243`: [title-pop \| 0.5s \| cubic-bezier(0.2,0.8,0.4,1)] className={ʼorigin-left text-xl font-semibold ${headline === me ? "animate-[title-pop_0.5… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/screens/Game.tsx:306`: [stone-pop \| 0.5s \| ease-out] <span key={view.scores[id] ?? 0} className={id === winner ? "animate-[stone-pop_0.5s_ease-out]" : ""}> → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/screens/Game.tsx:311`: [float-up \| 1.6s \| ease-out forwards] className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 animate-[float-up_1.6s… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/screens/Game.tsx:525`: [ring-pulse \| 1.2s \| ease-in-out infinite] className={ʼbtn btn-primary flex-1 ${wants.length > 0 && !iWant ? "animate-[ring-pulse_1.2s_eas… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/screens/Game.tsx:596`: [tailwind animate-pulse] className={ʼh-full rounded-full transition-[width] duration-300 ease-linear ${seconds <= 10 ? "animate-pulse bg-war… → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:68`: [tailwind animate-pulse] <div className="tile h-36 animate-pulse" aria-label="Wczytywanie" /> → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*
- `apps/web/src/screens/Lobby.tsx:69`: [tailwind animate-pulse] <div className="tile h-24 animate-pulse" /> → *rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem*

**apps/web/src/screens/Records.tsx**

- `apps/web/src/screens/Records.tsx:144`: [set-glow \| 0.9s \| ease-in-out 4] className="animate-[set-glow_0.9s_ease-in-out_4] rounded-full border border-success px-3 py-0.5 text-sm … → *do oceny czasu wobec tabeli §5 (D-06)*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:125`: [stone-pop \| 0.5s \| ease-out] className={ʼabsolute -top-1 -right-1 grid h-4 min-w-4 place-items-center border border-line bg-surface px-0.… → *do oceny czasu wobec tabeli §5 (D-06)*
- `apps/web/src/screens/ui.tsx:132`: [float-up \| 1.6s \| ease-out forwards] <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 animate-[float-u… → *do oceny czasu wobec tabeli §5 (D-06)*

## 12. Przejścia (ANIM-01)

Klasy `transition*`, `duration-*`, `delay-*`, `ease-*` i inline `transition*:`. Czas: z `duration-*`, z inline albo domyślne 150 ms Tailwinda dla gołego `transition*`.

Trafień: 26.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:149`: [transition-[width, duration-100 \| czas: 100ms] className="aspect-[5/6] rounded-[50%] transition-[width] duration-100" → *zgodne z tabelą §5, jeśli rola się zgadza*

**apps/web/src/games/Kalambury.tsx**

- `apps/web/src/games/Kalambury.tsx:277`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex size-12 items-center justify-center rounded-full border border-line… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:801`: [transition-[opacity,translate \| czas: 150ms (domyślne Tailwinda)] className={ʼrelative flex min-h-0 min-w-0 flex-col items-center justify-… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:173`: [transition-transform, duration-150 \| czas: 150ms] className="absolute inset-0 bg-fg transition-transform duration-150" → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/games/Labirynt.tsx**

- `apps/web/src/games/Labirynt.tsx:167`: [transition-transform, duration-200, ease-out \| czas: 200ms] <g key={i} className="transition-transform duration-200 ease-out" style={{ tra… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*
- `apps/web/src/games/Labirynt.tsx:181`: [transition-all, duration-200, ease-out \| czas: 200ms] return <rect x={x - 2.4} y={y + 4} width={4.8} height={0.7} rx={0.35} fill="var(--co… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:78`: [transition-transform, duration-180 \| czas: 180ms] <span className={ʼrelative block size-full transition-transform duration-180 transform-3… → *zgodne z tabelą §5, jeśli rola się zgadza*
- `apps/web/src/games/Memory.tsx:81`: [transition-opacity, duration-180 \| czas: 180ms] className={ʼabsolute inset-0 grid place-items-center rounded-inset border border-line-hove… → *zgodne z tabelą §5, jeśli rola się zgadza*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:168`: [transition-[width, duration-250, ease-linear \| czas: 250ms] className={ʼh-full rounded-full transition-[width] duration-250 ease-linear ${… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:148`: [transition-[width, ease-linear, transitionDuration: \| czas: ${RYTM_TAP_MS}ms] <div className="h-full bg-fg-muted transition-[width] ease-l… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:118`: [transition-colors, duration-100 \| czas: 100ms] className="flex touch-none select-none items-center justify-center rounded-tile transition-… → *zgodne z tabelą §5, jeśli rola się zgadza*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:500`: [transition-colors, duration-100 \| czas: 100ms] className={ʼpointer-events-none rounded-inset transition-colors duration-100 ${outline ? "o… → *zgodne z tabelą §5, jeśli rola się zgadza*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:140`: [transition-transform, duration-[180ms] \| czas: 180ms] <div className="absolute inset-0 transition-transform duration-[180ms]" style={{ tra… → *zgodne z tabelą §5, jeśli rola się zgadza*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:134`: [transition \| czas: width ${ZAKUPY_SHOW_MS}ms linear] <div className="h-full" style={{ width: draining ? "0%" : "100%", backgroundColor: co… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:266`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex min-h-9 items-center gap-2 rounded-full border px-3 text-sm transit… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*
- `apps/web/src/screens/Game.tsx:486`: [transition-[width, duration-200 \| czas: 200ms] <span className="block h-full rounded-full transition-[width] duration-200" style={{ width:… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*
- `apps/web/src/screens/Game.tsx:596`: [transition-[width, duration-300, ease-linear \| czas: 300ms] className={ʼh-full rounded-full transition-[width] duration-300 ease-linear ${… → *do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:158`: [transition-opacity \| czas: 150ms (domyślne Tailwinda)] const className = ʼflex w-full min-h-11 items-center gap-3 rounded-inset px-3 text-… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*
- `apps/web/src/screens/Lobby.tsx:255`: [transition-[color,border \| czas: 150ms (domyślne Tailwinda)] className={ʼflex rounded-inset border p-3 text-left transition-[color,border-… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/screens/MiniGames.tsx**

- `apps/web/src/screens/MiniGames.tsx:57`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex min-h-20 flex-col items-start gap-1 rounded-inset border p-2 text-l… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/screens/Records.tsx**

- `apps/web/src/screens/Records.tsx:268`: [transition-transform \| czas: 150ms (domyślne Tailwinda)] <CaretDown size={14} className="shrink-0 text-fg-muted transition-transform group… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/screens/Setup.tsx**

- `apps/web/src/screens/Setup.tsx:48`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex min-h-12 flex-col items-start justify-center rounded-inset border p… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*
- `apps/web/src/screens/Setup.tsx:156`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex min-h-12 flex-col items-center justify-center rounded-inset border … → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*
- `apps/web/src/screens/Setup.tsx:184`: [transition-colors \| czas: 150ms (domyślne Tailwinda)] className={ʼflex min-h-20 flex-col items-start gap-1 rounded-inset border p-2 text-l… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:64`: [transition-opacity \| czas: 150ms (domyślne Tailwinda)] className={ʼgrid size-4 place-items-center rounded-full transition-opacity ${p.conn… → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*
- `apps/web/src/screens/ui.tsx:114`: [transition-opacity \| czas: 150ms (domyślne Tailwinda)] className={ʼgrid size-7 place-items-center rounded-full leading-none font-semibold … → *do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)*

## 13. Timery i animacje z JS (ANIM-02)

`setTimeout`, `setInterval`, `requestAnimationFrame`, `startViewTransition`, `.animate(` w plikach gier i ekranów, z informacją, czy plik sprawdza `reducedMotion`/`prefers-reduced-motion`.

Trafień: 62.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:64`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:66`: [setTimeout \| reducedMotion w pliku: tak] const t = setTimeout(() => setRolling(false), rollMs); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/Chinczyk.tsx:87`: [setTimeout \| reducedMotion w pliku: tak] const t = setTimeout(() => { → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/Chinczyk.tsx:100`: [setInterval \| reducedMotion w pliku: tak] const id = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 90); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:73`: [setTimeout \| reducedMotion w pliku: nie] r.timer = window.setTimeout(() => setPhase("play"), BLOCK_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Dziesiatki.tsx:80`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Kalambury.tsx**

- `apps/web/src/games/Kalambury.tsx:205`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(flush, SEND_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Kalambury.tsx:319`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => setSure(false), CONFIRM_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/KampusTour.tsx**

- `apps/web/src/games/KampusTour.tsx:247`: [setTimeout \| reducedMotion w pliku: tak] const t = setTimeout(() => { → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/KampusTour.tsx:269`: [setTimeout \| reducedMotion w pliku: tak] const t = setTimeout(() => setRolling(false), ROLL_MS); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/KampusTour.tsx:280`: [setInterval \| reducedMotion w pliku: tak] const id = setInterval(() => setFaces([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.ra… → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/KampusTour.tsx:315`: [setTimeout \| reducedMotion w pliku: tak] setTimeout(() => setFloats((f) => f.filter((x) => !added.includes(x))), 1700); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*

**apps/web/src/games/Kolor.tsx**

- `apps/web/src/games/Kolor.tsx:88`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => setPhase("pick"), KOLOR_SHOW_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:65`: [setTimeout \| reducedMotion w pliku: tylko w komentarzu] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Kubki.tsx:90`: [requestAnimationFrame \| reducedMotion w pliku: tylko w komentarzu] let id = requestAnimationFrame(function frame(now) { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Kubki.tsx:106`: [requestAnimationFrame \| reducedMotion w pliku: tylko w komentarzu] id = requestAnimationFrame(frame); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Mapa.tsx**

- `apps/web/src/games/Mapa.tsx:60`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Memory.tsx**

- `apps/web/src/games/Memory.tsx:51`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => setMissShown(false), MISS_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Nozyczki.tsx**

- `apps/web/src/games/Nozyczki.tsx:54`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/PanstwaMiasta.tsx**

- `apps/web/src/games/PanstwaMiasta.tsx:135`: [setTimeout \| reducedMotion w pliku: nie] timer.current = window.setTimeout(() => onMove({ type: "write", answers: next, done: false }), DR… → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:57`: [setTimeout \| reducedMotion w pliku: nie] const after = (ms: number, fn: () => void) => r.timers.push(window.setTimeout(fn, begin + ms - pe… → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Przytrzymaj.tsx:75`: [setTimeout \| reducedMotion w pliku: nie] window.setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Przytrzymaj.tsx:94`: [setTimeout \| reducedMotion w pliku: nie] r.giveUp = window.setTimeout(() => finish(limit), limit); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:195`: [setTimeout \| reducedMotion w pliku: nie] r.timer = window.setTimeout(retry ? () => setPhase("play") : next, BLOCK_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Quiz.tsx:202`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:154`: [setTimeout \| reducedMotion w pliku: nie] r.timer = window.setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Refleks.tsx:158`: [setTimeout \| reducedMotion w pliku: nie] r.timer = window.setTimeout(() => next(REFLEKS_PENALTY_MS), REFLEKS_PENALTY_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Refleks.tsx:177`: [setTimeout \| reducedMotion w pliku: nie] r.timer = window.setTimeout(() => next(REFLEKS_PENALTY_MS), 800); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:87`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Rok.tsx:97`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(next, ROK_REVEAL_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:45`: [setTimeout \| reducedMotion w pliku: nie] const after = (ms: number, fn: () => void) => r.timers.push(window.setTimeout(fn, begin + ms - pe… → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Rytm.tsx:90`: [setTimeout \| reducedMotion w pliku: nie] r.press = window.setTimeout(() => setPressed(false), FLASH_MS); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:53`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => setNow(performance.now()), 100); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Simon.tsx**

- `apps/web/src/games/Simon.tsx:52`: [setTimeout \| reducedMotion w pliku: nie] const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms)); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Sledzenie.tsx**

- `apps/web/src/games/Sledzenie.tsx:58`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Sledzenie.tsx:75`: [requestAnimationFrame \| reducedMotion w pliku: nie] let id = requestAnimationFrame(function frame(now) { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Sledzenie.tsx:85`: [requestAnimationFrame \| reducedMotion w pliku: nie] id = requestAnimationFrame(frame); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Srodek.tsx**

- `apps/web/src/games/Srodek.tsx:66`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:70`: [startViewTransition \| reducedMotion w pliku: tak] document.startViewTransition(() => flushSync(() => setDefending(turn))); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/Statki.tsx:73`: [setTimeout \| reducedMotion w pliku: tak] const id = setTimeout(swap, SWAP_MS); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*
- `apps/web/src/games/Statki.tsx:213`: [setTimeout \| reducedMotion w pliku: tak] setTimeout(() => setGhost(null), 600); → *do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:47`: [setTimeout \| reducedMotion w pliku: nie] run.current.timer = window.setTimeout(fn, run.current.start + ms - performance.now()); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Stoj.tsx:83`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Stoper.tsx**

- `apps/web/src/games/Stoper.tsx:58`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:61`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => setNow(performance.now()), 100); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Szacowanie.tsx**

- `apps/web/src/games/Szacowanie.tsx:69`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => setPhase(phase === "wait" ? "show" : "answer"), phase === "wait" ? WA… → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Tort.tsx**

- `apps/web/src/games/Tort.tsx:64`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:55`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout( → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:77`: [requestAnimationFrame \| reducedMotion w pliku: nie] let id = requestAnimationFrame(function frame(now) { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Wieza.tsx:81`: [requestAnimationFrame \| reducedMotion w pliku: nie] id = requestAnimationFrame(frame); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Wieza.tsx:88`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:50`: [setTimeout \| reducedMotion w pliku: nie] const id = setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Zakupy.tsx:59`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => setElapsed(performance.now() - start.current), 200); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/games/Zaslona.tsx**

- `apps/web/src/games/Zaslona.tsx:61`: [setTimeout \| reducedMotion w pliku: tylko w komentarzu] run.current.timers.push(window.setTimeout(() => setPhase("run"), LEAD_MS)); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Zaslona.tsx:70`: [setTimeout \| reducedMotion w pliku: tylko w komentarzu] window.setTimeout(() => { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Zaslona.tsx:84`: [requestAnimationFrame \| reducedMotion w pliku: tylko w komentarzu] let id = requestAnimationFrame(function frame(now) { → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/games/Zaslona.tsx:88`: [requestAnimationFrame \| reducedMotion w pliku: tylko w komentarzu] id = requestAnimationFrame(frame); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:582`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => setNow(Date.now()), 250); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/screens/Lobby.tsx**

- `apps/web/src/screens/Lobby.tsx:417`: [setTimeout \| reducedMotion w pliku: nie] setTimeout(() => setCopied(false), 2000); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/screens/Lobby.tsx:428`: [setTimeout \| reducedMotion w pliku: nie] setTimeout(() => setCopied(false), 2000); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

**apps/web/src/screens/ui.tsx**

- `apps/web/src/screens/ui.tsx:35`: [setTimeout \| reducedMotion w pliku: nie] setTimeout(() => setCopied(false), 2000); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*
- `apps/web/src/screens/ui.tsx:285`: [setInterval \| reducedMotion w pliku: nie] const id = setInterval(() => setNow(Date.now()), 250); → *do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne*

## 14. Pomiar czasu w grach (ANIM-02)

`performance.now(`, `Date.now`, `.timeStamp` w `games/*.tsx`; komponent (najbliższa `function`/`const X = (…) =>` od początku linii) i animacje/przejścia w tym samym komponencie.

Trafień: 43.

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:46`: [performance.now( \| komponent: Dziesiatki (35-156) \| animacje w komponencie: tile-hit, tile-miss] const t = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Dziesiatki.tsx:57`: [performance.now( \| komponent: Dziesiatki (35-156) \| animacje w komponencie: tile-hit, tile-miss] const now = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Dziesiatki.tsx:82`: [performance.now( \| komponent: Dziesiatki (35-156) \| animacje w komponencie: tile-hit, tile-miss] if (performance.now() - r.start < QUIZ_D… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:89`: [performance.now( \| komponent: Kubki (46-187) \| animacje w komponencie: requestAnimationFrame, transition-transform] const start = perform… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Przytrzymaj.tsx**

- `apps/web/src/games/Przytrzymaj.tsx:54`: [performance.now( \| komponent: Przytrzymaj (42-240) \| animacje w komponencie: brak] const begin = performance.now(); → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Przytrzymaj.tsx:57`: [performance.now( \| komponent: Przytrzymaj (42-240) \| animacje w komponencie: brak] const after = (ms: number, fn: () => void) => r.timers… → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Przytrzymaj.tsx:90`: [.timeStamp \| komponent: Przytrzymaj (42-240) \| animacje w komponencie: brak] r.down = e.timeStamp; → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Przytrzymaj.tsx:100`: [.timeStamp \| komponent: Przytrzymaj (42-240) \| animacje w komponencie: brak] finish(Math.min(2 * view.targets[r.holds.length], Math.max(0… → *zgodne wstępnie (brak animacji w komponencie)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:168`: [performance.now( \| komponent: Quiz (159-270) \| animacje w komponencie: tile-hit, tile-miss] run.current.shownAt = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Quiz.tsx:174`: [performance.now( \| komponent: Quiz (159-270) \| animacje w komponencie: tile-hit, tile-miss] const t = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Quiz.tsx:182`: [performance.now( \| komponent: Quiz (159-270) \| animacje w komponencie: tile-hit, tile-miss] const took = Math.round(performance.now() - r… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Quiz.tsx:204`: [performance.now( \| komponent: Quiz (159-270) \| animacje w komponencie: tile-hit, tile-miss] if (performance.now() - r.start < QUIZ_DURATI… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Refleks.tsx**

- `apps/web/src/games/Refleks.tsx:155`: [performance.now( \| komponent: Refleks (135-220) \| animacje w komponencie: brak] r.goAt = performance.now(); → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Refleks.tsx:170`: [performance.now( \| komponent: Refleks (135-220) \| animacje w komponencie: brak] const reaction = Math.round(performance.now() - r.goAt); → *zgodne wstępnie (brak animacji w komponencie)*

**apps/web/src/games/Rok.tsx**

- `apps/web/src/games/Rok.tsx:86`: [Date.now \| komponent: Rok (54-209) \| animacje w komponencie: transition-[width] const end = Date.now() + ROK_ROUND_MS; → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Rok.tsx:88`: [Date.now \| komponent: Rok (54-209) \| animacje w komponencie: transition-[width] const ms = end - Date.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:41`: [performance.now( \| komponent: Rytm (29-165) \| animacje w komponencie: transition-[width] const begin = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Rytm.tsx:45`: [performance.now( \| komponent: Rytm (29-165) \| animacje w komponencie: transition-[width] const after = (ms: number, fn: () => void) => r.… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Rytm.tsx:85`: [.timeStamp \| komponent: Rytm (29-165) \| animacje w komponencie: transition-[width] const t = Math.round(e.timeStamp - r.last); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:53`: [performance.now( \| komponent: Schulte (39-155) \| animacje w komponencie: tile-hit, tile-miss] const id = setInterval(() => setNow(perform… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Schulte.tsx:65`: [performance.now( \| komponent: Schulte (39-155) \| animacje w komponencie: tile-hit, tile-miss] const ms = Math.round(performance.now() - s… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Schulte.tsx:117`: [performance.now( \| komponent: Schulte (39-155) \| animacje w komponencie: tile-hit, tile-miss] start.current = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Sledzenie.tsx**

- `apps/web/src/games/Sledzenie.tsx:74`: [performance.now( \| komponent: Sledzenie (42-177) \| animacje w komponencie: requestAnimationFrame] const start = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:47`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] run.current.timer = window.setTimeout(fn, run.current.st… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Stoj.tsx:53`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] run.current.shownAt = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Stoj.tsx:62`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] run.current = { start: performance.now(), shownAt: 0, ta… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Stoj.tsx:71`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] const reaction = Math.round(performance.now() - r.shownA… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Stoj.tsx:85`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] setNow(performance.now()); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Stoj.tsx:86`: [performance.now( \| komponent: Stoj (36-169) \| animacje w komponencie: tile-miss] if (performance.now() - r.start < STOJ_DURATION_MS) retu… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Stoper.tsx**

- `apps/web/src/games/Stoper.tsx:49`: [performance.now( \| komponent: Stoper (37-124) \| animacje w komponencie: brak] const took = Math.min(performance.now() - start.current, gi… → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Stoper.tsx:59`: [performance.now( \| komponent: Stoper (37-124) \| animacje w komponencie: brak] setElapsed(performance.now() - start.current); → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Stoper.tsx:60`: [performance.now( \| komponent: Stoper (37-124) \| animacje w komponencie: brak] if (performance.now() - start.current >= giveUp) stop(); → *zgodne wstępnie (brak animacji w komponencie)*
- `apps/web/src/games/Stoper.tsx:102`: [performance.now( \| komponent: Stoper (37-124) \| animacje w komponencie: brak] start.current = performance.now() + COUNT_MS; → *zgodne wstępnie (brak animacji w komponencie)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:61`: [performance.now( \| komponent: Sudoku (47-181) \| animacje w komponencie: tile-hit, tile-miss] const id = setInterval(() => setNow(performa… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Sudoku.tsx:84`: [performance.now( \| komponent: Sudoku (47-181) \| animacje w komponencie: tile-hit, tile-miss] onMove({ type: "result", ms: Math.round(perf… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Sudoku.tsx:125`: [performance.now( \| komponent: Sudoku (47-181) \| animacje w komponencie: tile-hit, tile-miss] start.current = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:76`: [performance.now( \| komponent: Wieza (36-174) \| animacje w komponencie: requestAnimationFrame, transition-transform, piece-fall, tile-hit,… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Wieza.tsx:138`: [performance.now( \| komponent: Wieza (36-174) \| animacje w komponencie: requestAnimationFrame, transition-transform, piece-fall, tile-hit,… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Zakupy.tsx**

- `apps/web/src/games/Zakupy.tsx:51`: [performance.now( \| komponent: Zakupy (37-182) \| animacje w komponencie: transition] start.current = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Zakupy.tsx:59`: [performance.now( \| komponent: Zakupy (37-182) \| animacje w komponencie: transition] const id = setInterval(() => setElapsed(performance.n… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Zakupy.tsx:71`: [performance.now( \| komponent: Zakupy (37-182) \| animacje w komponencie: transition] onMove({ type: "result", picked, ms: Math.min(ZAKUPY_… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

**apps/web/src/games/Zaslona.tsx**

- `apps/web/src/games/Zaslona.tsx:82`: [performance.now( \| komponent: Zaslona (44-208) \| animacje w komponencie: requestAnimationFrame] r.start = performance.now(); → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*
- `apps/web/src/games/Zaslona.tsx:99`: [.timeStamp \| komponent: Zaslona (44-208) \| animacje w komponencie: requestAnimationFrame] const tap = e.timeStamp - r.start - round.visib… → *do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)*

## 15. Wibracje (ANIM-03)

Każde wywołanie `vibrate(` z wzorem, obecnością `?.`, najbliższą funkcją / handlerem / efektem i komponentem.

Trafień: 16.

**apps/web/src/games/Balon.tsx**

- `apps/web/src/games/Balon.tsx:58`: [vibrate wzór: 60 \| ?.: tak \| kontekst: pump (:55) w Balon] navigator.vibrate?.(60); ‖ 3 linie wcześniej: function pump() { ⏎ if (phase !== "play") return; ⏎ if (current < view.limits[pumps.length]) return setCurrent(current + 1); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Chinczyk.tsx**

- `apps/web/src/games/Chinczyk.tsx:135`: [vibrate wzór: [60, 40, 60] \| ?.: tak \| kontekst: useEffect (:132) w Chinczyk \| warunek: last.move.captured.includes(me)] if (last.move.captured.includes(me)) navigator.vibrate?.([60, 40, 60]); ‖ 3 linie wcześniej: useEffect(() => { ⏎ if (!settled \|\| !last?.move \|\| buzzed.current === last.roll) return; ⏎ buzzed.current = last.roll; → *zgodne z tabelą §5, jeśli to zdarzenie od innego gracza*

**apps/web/src/games/Dziesiatki.tsx**

- `apps/web/src/games/Dziesiatki.tsx:71`: [vibrate wzór: 60 \| ?.: tak \| kontekst: tap (:51) w Dziesiatki] navigator.vibrate?.(60); ‖ 3 linie wcześniej: } else { ⏎ r.errors++; ⏎ r.streak = 0; → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Kubki.tsx**

- `apps/web/src/games/Kubki.tsx:118`: [vibrate wzór: 60 \| ?.: tak \| kontekst: tap (:112) w Kubki \| warunek: slot !== ballSlot] if (slot !== ballSlot) navigator.vibrate?.(60); ‖ 3 linie wcześniej: const slot = Math.min(CUPS.length - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * CUPS.length))); ⏎ setPicks([...picks, slot]); ⏎ setPhase("reveal"); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Nozyczki.tsx**

- `apps/web/src/games/Nozyczki.tsx:80`: [vibrate wzór: 60 \| ?.: tak \| kontekst: up (:74) w Nozyczki] navigator.vibrate?.(60); ‖ 3 linie wcześniej: setAim(null); ⏎ // Za krótki ruch albo prosta obok kształtu to nie odpowiedź (serwer też by ją odrzucił): runda trwa dalej, bez kary. ⏎ if (!nozyczkiAccepts(view.shapes[index], cut)) { → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Quiz.tsx**

- `apps/web/src/games/Quiz.tsx:193`: [vibrate wzór: 60 \| ?.: tak \| kontekst: answer (:179) w Quiz] navigator.vibrate?.(60); ‖ 3 linie wcześniej: } else { ⏎ r.errors++; ⏎ r.streak = 0; → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Rytm.tsx**

- `apps/web/src/games/Rytm.tsx:70`: [vibrate wzór: 30 \| ?.: tak \| kontekst: after (:45) w Rytm] navigator.vibrate?.(30); ‖ 3 linie wcześniej: after(at(i), () => { ⏎ setBeat(i); ⏎ setLit(true); → *do oceny: wzór spoza tabeli §5 (metronom, KONCEPT.md: klik, błysk i wibracja)*

**apps/web/src/games/Schulte.tsx**

- `apps/web/src/games/Schulte.tsx:62`: [vibrate wzór: 60 \| ?.: tak \| kontekst: press (:57) w Schulte] navigator.vibrate?.(60); ‖ 3 linie wcześniej: setFlash((f) => ({ n, ok: n === target, id: (f?.id ?? 0) + 1 })); ⏎ if (n !== target) { ⏎ setMistakes((m) => m + 1); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Sledzenie.tsx**

- `apps/web/src/games/Sledzenie.tsx:107`: [vibrate wzór: 60 \| ?.: tak \| kontekst: next (:102) w Sledzenie \| warunek: !next.every(isTarget)] if (!next.every(isTarget)) navigator.vibrate?.(60); ‖ 3 linie wcześniej: if (next.length < TARGETS) return; ⏎ setPicks([...picks, next]); ⏎ setPhase("reveal"); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Srodek.tsx**

- `apps/web/src/games/Srodek.tsx:91`: [vibrate wzór: 60 \| ?.: tak \| kontekst: up (:85) w Srodek] navigator.vibrate?.(60); ‖ 3 linie wcześniej: setAim(null); ⏎ // Poza strefą to nie odpowiedź (serwer też by ją odrzucił): runda trwa dalej, bez kary. ⏎ if (srodekOffset(view.segments[index], p) > SRODEK_ACCEPT_PX) { → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Statki.tsx**

- `apps/web/src/games/Statki.tsx:211`: [vibrate wzór: 60 \| ?.: tak \| kontekst: commit (:209) w Placement] navigator.vibrate?.(60); ‖ 3 linie wcześniej: function commit(next: Ship[], index?: number) { ⏎ if (!isValidFleet(next, rules)) { → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Stoj.tsx**

- `apps/web/src/games/Stoj.tsx:76`: [vibrate wzór: 60 \| ?.: tak \| kontekst: tap (:68) w Stoj \| warunek: view.reds[shown.i]] if (view.reds[shown.i]) navigator.vibrate?.(60); ‖ 3 linie wcześniej: // Spóźniony timer następnego bodźca mógłby wydłużyć okno ponad to, co przyjmie serwer. ⏎ r.taps[shown.i] = Math.min(reaction, STOJ_SCHEDULE[shown.i].window); ⏎ setShown({ ...shown, tapped: true }); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Sudoku.tsx**

- `apps/web/src/games/Sudoku.tsx:77`: [vibrate wzór: 60 \| ?.: tak \| kontekst: enter (:71) w Sudoku] navigator.vibrate?.(60); ‖ 3 linie wcześniej: setFlash((f) => ({ i: selected, ok, id: (f?.id ?? 0) + 1 })); ⏎ if (!ok) { ⏎ setMistakes((m) => m + 1); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/WPamieci.tsx**

- `apps/web/src/games/WPamieci.tsx:80`: [vibrate wzór: 60 \| ?.: tak \| kontekst: submit (:73) w WPamieci] navigator.vibrate?.(60); ‖ 3 linie wcześniej: setAnswers(all); ⏎ setInput(""); ⏎ if (all.at(-1) !== wPamieciValue(round)) { → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/games/Wieza.tsx**

- `apps/web/src/games/Wieza.tsx:68`: [vibrate wzór: 60 \| ?.: tak \| kontekst: drop (:64) w Wieza \| warunek: built.height < next.length] if (built.height < next.length) navigator.vibrate?.(60); ‖ 3 linie wcześniej: const next = [...stops, t]; ⏎ const built = wiezaBuild(view.sides, next); ⏎ setStops(next); → *zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)*

**apps/web/src/screens/Game.tsx**

- `apps/web/src/screens/Game.tsx:35`: [vibrate wzór: 40 \| ?.: tak \| kontekst: useEffect (:34) w Game \| warunek: myTurn] if (myTurn) navigator.vibrate?.(40); ‖ 3 linie wcześniej: // Tryb cichy: krótka wibracja zamiast dźwięku, gdy przychodzi moja tura. ⏎ useEffect(() => { → *zgodne (moja tura w Game.tsx)*

Pliki z `vibrate`: 16 (`apps/web/src/games/Balon.tsx`, `apps/web/src/games/Chinczyk.tsx`, `apps/web/src/games/Dziesiatki.tsx`, `apps/web/src/games/Kubki.tsx`, `apps/web/src/games/Nozyczki.tsx`, `apps/web/src/games/Quiz.tsx`, `apps/web/src/games/Rytm.tsx`, `apps/web/src/games/Schulte.tsx`, `apps/web/src/games/Sledzenie.tsx`, `apps/web/src/games/Srodek.tsx`, `apps/web/src/games/Statki.tsx`, `apps/web/src/games/Stoj.tsx`, `apps/web/src/games/Sudoku.tsx`, `apps/web/src/games/WPamieci.tsx`, `apps/web/src/games/Wieza.tsx`, `apps/web/src/screens/Game.tsx`).

## 16. Reguła `prefers-reduced-motion` z index.css (ANIM-02)

`apps/web/src/index.css:360-368`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Co wyłącza: wszystkie animacje CSS (`animation-duration: 0.01ms`, jedna iteracja, więc pętle `infinite` w `Preview` stają po pierwszej, a element zostaje w stanie końcowym keyframes) i wszystkie przejścia CSS (`transition-duration: 0.01ms`) na każdym elemencie i pseudoelemencie. Nie obejmuje: animacji z JS (`setTimeout`/`requestAnimationFrame` sterujących stanem, `startViewTransition`; pseudoelementy `::view-transition-*` dziedziczą z `*` tylko przez `animation-duration`, do oceny), ani `animationDelay` (ujemny delay nadal działa). Inline `transitionDuration`/`transition` w `style` przegrywa z `!important` reguły, więc też jest zerowane.

## Załącznik A: skrypt `checks.mjs`

Uruchomienie: `node checks.mjs /home/figielak/Documents/Projects/kwadrans > body.md` (Node 24, bez zależności). Skrypt leży w scratchpadzie sesji, poza repo; poniżej pełna treść z chwili wygenerowania tego pliku. Na stderr wypisuje sumy: `{"totals":{"kolory":28,"akcent":27,"ksztalt":43,"dotyk":6,"onclick":55,"piksele":19,"teksty":9,"liczby":36,"a11y":20,"intro":25,"anim":100,"trans":26,"timery":62,"pomiar":43,"vibrate":16},"keyframes":14,"unused":[],"vibrateFiles":16,"files":51}`.

````js
// Hurtowe sprawdzenia UI / animacji / wibracji (02-01). Uruchomienie: node checks.mjs <repo> > body.md
// Tylko odczyt repo, bez zależności. Heurystyki: parser znaczników JSX bez AST.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REPO = process.argv[2];
const SRC = join(REPO, "apps/web/src");
const rel = (f) => `apps/web/src/${f}`;

const files = [
  "App.tsx",
  "main.tsx",
  ...readdirSync(join(SRC, "games")).filter((f) => f.endsWith(".tsx")).sort().map((f) => `games/${f}`),
  ...readdirSync(join(SRC, "screens")).filter((f) => f.endsWith(".tsx")).sort().map((f) => `screens/${f}`),
];
const CSS = "index.css";
const text = Object.fromEntries([...files, CSS].map((f) => [f, readFileSync(join(SRC, f), "utf8")]));
const lines = Object.fromEntries(Object.entries(text).map(([f, t]) => [f, t.split("\n")]));
const zasady = readFileSync(join(REPO, "ZASADY.md"), "utf8").split("\n");
const sec5 = zasady.slice(zasady.findIndex((l) => l.startsWith("## 5.")), zasady.findIndex((l) => l.startsWith("## 6."))).join("\n");

// Gry, których kolor jest treścią (DESIGN.md §6, CONTEXT D-04; Kalambury: paleta).
const CONTENT_COLOR = ["games/Simon.tsx", "games/Stroop.tsx", "games/Inny.tsx", "games/Kolor.tsx", "games/KampusTour.tsx", "games/Kalambury.tsx"];

const TOKEN_HEX = {};
for (const m of readFileSync(join(SRC, "index.css"), "utf8").matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{3,8})\b/g)) TOKEN_HEX[m[2].toLowerCase()] = m[1];
for (const c of ["#3b9eff", "#ffc53d", "#46a758", "#8e7cff", "#0ac5b3", "#f76fbe"]) TOKEN_HEX[c] = "PLAYER_COLORS";
const lineOf = (t, idx) => t.slice(0, idx).split("\n").length;
const clip = (s, n = 140) => {
  s = s.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
  return s.length > n ? s.slice(0, n) + "…" : s;
};
const isComment = (l) => /^\s*(\/\/|\/\*|\*|\{\/\*)/.test(l);

// --- parser otwierających znaczników JSX: <Tag ...> z uwzględnieniem klamr i napisów ---
function tags(f) {
  const t = text[f];
  const out = [];
  const re = /<([A-Za-z][\w.]*)(?=[\s/>])/g;
  let m;
  while ((m = re.exec(t))) {
    const prev = t[m.index - 1];
    // `a<b` w wyrażeniach i generyki: wymagamy, żeby przed < był odstęp, (, {, >, ?, :, & lub początek
    if (prev && !/[\s({>?:&|,=[]/.test(prev)) continue;
    let i = m.index + m[0].length, depth = 0, q = null, ok = false;
    for (; i < t.length && i - m.index < 4000; i++) {
      const c = t[i];
      if (q) {
        if (c === "\\") { i++; continue; }
        if (c === q) q = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { if (depth > 0 || c !== "'") q = c; continue; }
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) { ok = true; break; }
    }
    if (!ok) continue;
    const src = t.slice(m.index, i + 1);
    out.push({ name: m[1], src, start: m.index, end: i + 1, line: lineOf(t, m.index), self: src.endsWith("/>") });
  }
  return out;
}
const TAGS = Object.fromEntries(files.map((f) => [f, tags(f)]));
const classOf = (src) => {
  const parts = [];
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{([\s\S]*?)\}(?=\s+\w+=|\s*\/?>))/g)) parts.push(m[1] ?? m[2]);
  return parts.join(" ");
};

// Pomiar czasu z sąsiedztwem animacji w komponencie
function components(f) {
  const out = [];
  lines[f].forEach((l, i) => {
    const m = l.match(/^(?:export\s+)?(?:default\s+)?function\s+(\w+)/) ?? l.match(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/);
    if (m) out.push({ name: m[1], start: i + 1 });
  });
  out.forEach((c, k) => (c.end = k + 1 < out.length ? out[k + 1].start - 1 : lines[f].length));
  return out;
}
const COMPS = Object.fromEntries(files.map((f) => [f, components(f)]));
const compAt = (f, line) => COMPS[f].find((c) => line >= c.start && line <= c.end);
// --- zbiór trafień ---
const checks = {}; // klucz -> { title, hits: [{f, line, frag, ocena}] }
function hit(key, f, line, frag, ocena) {
  (checks[key] ??= []).push({ f, line, frag: clip(frag, key === "vibrate" ? 420 : 140), ocena });
}
const KEYS = [
  ["kolory", "Kolory spoza tokenów"],
  ["akcent", "Akcent (accent / btn-primary)"],
  ["ksztalt", "Zaokrąglenia i cienie"],
  ["dotyk", "Pola dotykowe poniżej 48 px"],
  ["onclick", "onClick w plikach gier"],
  ["piksele", "Stałe piksele i przewijanie w poziomie"],
  ["teksty", "Teksty (myślniki, kropka dziesiętna, słowa)"],
  ["liczby", "Liczby bez mono / tabular-nums"],
  ["a11y", "Dostępność (aria-hidden, aria-label)"],
  ["intro", "Intro"],
  ["anim", "Animacje (animate-[...], animation)"],
  ["trans", "Przejścia (transition, duration)"],
  ["timery", "setTimeout / setInterval / rAF / startViewTransition / animate("],
  ["pomiar", "Pomiar czasu (performance.now, Date.now, timeStamp)"],
  ["vibrate", "Wibracje"],
];

// 1. Kolory
const PALETTE = /\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|divide|accent|caret|placeholder)-(?:red|rose|pink|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|slate|gray|zinc|neutral|stone|white|black)(?:-\d+)?(?:\/\d+)?\b/g;
const COLORFN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\bhwb\(|\blab\(/g;
for (const f of [...files, CSS]) {
  let inTheme = false;
  lines[f].forEach((l, i) => {
    if (f === CSS) {
      if (/^@theme\b/.test(l)) inTheme = true;
      else if (inTheme && /^\}/.test(l)) { inTheme = false; return; }
      if (inTheme) return;
    }
    if (isComment(l)) return;
    const found = [...l.matchAll(COLORFN)].map((m) => m[0]).filter((s) => !/^#[0-9a-fA-F]{3,8}$/.test(s) || !/(href|to|id)=["'`{][^"'`]*$/.test(l.slice(0, l.indexOf(s))));
    const pal = [...l.matchAll(PALETTE)].map((m) => m[0]);
    if (!found.length && !pal.length) return;
    let ocena = CONTENT_COLOR.includes(f) ? "do oceny w planie gry (gra z kolorem jako treścią, DESIGN.md §6)" : "rozbieżność (średnia) albo do oceny w planie gry";
    const tokenHex = found.filter((h) => TOKEN_HEX[h.toLowerCase()]);
    if (tokenHex.length) ocena += `; wartość tokenu wpisana na sztywno (${tokenHex.map((h) => h + " = " + TOKEN_HEX[h.toLowerCase()]).join(", ")}), lepiej var(--color-…)`;
    if (/rgb\(0 0 0|rgb\(0_0_0/.test(l) && /shadow|Shadow|EDGE/.test(l)) ocena = "do oceny: czerń w cieniu (patrz sekcja 3)" + (f === "games/KampusTour.tsx" ? ", Kampus Tour ma wyjątek na cienie" : "");
    if (/oklch\(from \$\{color\}/.test(l)) ocena = "do oceny w planie gry: odcień wyliczany z koloru gracza (pochodna PLAYER_COLORS, nie nowy kolor)";
    if (f === CSS) ocena = "do oceny w 02-02 (kciuk suwaka .swatch-range)";
    if (pal.length && pal.every((p) => /^(bg|text|border|ring|fill|stroke)-(white|black)$/.test(p))) ocena += "; biel/czerń spoza tokenów";
    hit("kolory", f, i + 1, `[${[...found, ...pal].join(", ")}] ${l}`, ocena);
  });
}

// 2. Akcent
const ACC = /\b(?:bg|text|border|ring|outline|fill|stroke|from|to|decoration)-accent(?:-(?:soft|hover|fg))?\b|\bbtn-primary\b|--color-accent\b|\baccent-(?:soft|fg)\b/g;
const accentCount = {};
for (const f of files) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    const found = [...new Set([...l.matchAll(ACC)].map((m) => m[0]))];
    if (!found.length) return;
    for (const a of found) (accentCount[f] ??= {})[a] = ((accentCount[f] ??= {})[a] ?? 0) + 1;
    let ocena;
    if (found.includes("btn-primary")) ocena = f.startsWith("games/") ? "do oceny w planie gry: akcja w partii w akcencie zamiast koloru gracza (DESIGN.md §5)?" : "do oceny: jeden wypełniony akcent na ekran";
    else if (f === "games/Statki.tsx") ocena = "odstępstwo z powodem (trafienie w accent, DESIGN.md §6), sprawdzić w planie gry";
    else ocena = f.startsWith("games/") ? "do oceny w planie gry (akcent w partii)" : "do oceny (rola akcentu)";
    hit("akcent", f, i + 1, `[${found.join(", ")}] ${l}`, ocena);
  });
}

// 3. Zaokrąglenia i cienie
const ROUND_OK = new Set(["rounded-tile", "rounded-inset", "rounded-full", "rounded-[20px]", "rounded-[10px]", "rounded-[999px]"]);
for (const f of [...files, CSS]) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    const r = f === CSS ? [] : [...l.matchAll(/(?<![\w-])rounded(?:-[A-Za-z0-9.]+)*(?:-\[[^\]]+\])?/g)].map((m) => m[0]).filter((x) => !ROUND_OK.has(x.replace(/^rounded-(?:[trblse]{1,2})-/, "rounded-").replace(/^rounded-(?:[trblse]{1,2})$/, "rounded")) );
    const s = [...l.matchAll(/(?<![\w-])(?:drop-)?shadow(?:-[A-Za-z0-9.]+)*(?:-\[[^\]]+\])?|box-shadow|boxShadow|\bborder-radius:[^;]*|\bborderRadius\b|\brx=\{?[\d.]+/g)].map((m) => m[0]).filter((x) => !/^border-radius:\s*(var\(--radius-(tile|inset)\)|999px)/.test(x));
    if (!r.length && !s.length) return;
    let ocena = "rozbieżność (niska) albo do oceny w planie gry";
    if (f === "games/KampusTour.tsx" && s.length) ocena = "odstępstwo z powodem, jeśli pod oknem/pionkiem (DESIGN.md §2, §6)";
    if (f === CSS) ocena = /set-glow|0 0 18px/.test(l) || /swatch|thumb/.test(lines[f].slice(Math.max(0, i - 8), i).join(" ")) ? "do oceny w 02-02 (set-glow / kciuk suwaka)" : "do oceny w 02-02";
    if (r.length && r.every((x) => /^rounded$/.test(x))) ocena = "rozbieżność (niska): `rounded` = 4 px";
    if (!r.length && s.length && s.every((x) => /^rx=/.test(x))) ocena = "do oceny (niska): zaokrąglenie w jednostkach viewBox SVG, nie px";
    if (!r.length && /(?:inset )?0 0 0 \d+px/.test(l) && !/blur|\d+px \d+px \$|0 0 1\dpx/.test(l)) ocena = "do oceny (niska): box-shadow użyty jako obrys (0 0 0 Npx), nie cień";
    hit("ksztalt", f, i + 1, `[${[...r, ...s].join(", ")}] ${l}`, ocena);
  });
}

// 4. Pola dotykowe: elementy z handlerem dotyku i rozmiarem < 48 px
for (const f of files) {
  for (const tg of TAGS[f]) {
    if (!/\bon(Click|PointerDown|PointerUp|TouchStart)\b/.test(tg.src)) continue;
    const cls = classOf(tg.src);
    const small = [];
    for (const m of cls.matchAll(/(?<![\w-])(h|size|w|min-h|min-w)-(\d+(?:\.\d+)?)(?![\w.])/g)) if (+m[2] < 12) small.push(m[0]);
    for (const m of cls.matchAll(/(?<![\w-])(h|size|w|min-h|min-w)-\[(\d+(?:\.\d+)?)px\]/g)) if (+m[2] < 48) small.push(m[0]);
    for (const m of tg.src.matchAll(/\b(width|height)=\{?["']?(\d+)/g)) if (+m[2] < 48) small.push(m[0]);
    if (!small.length) continue;
    const btn = /(?<![\w-])btn(?![\w-])/.test(cls);
    const hasH = small.some((s) => /^(h|size|min-h|height)/.test(s));
    let ocena = btn && !hasH ? "do oceny (.btn daje min. 48 px wysokości; szerokość mniejsza)" : "do oceny w planie gry (rozbieżność średnia, jeśli to faktyczny cel dotyku; sprawdzić rodzica i padding)";
    hit("dotyk", f, tg.line, `<${tg.name}> [${small.join(", ")}] ${tg.src.slice(0, 160)}`, ocena);
  }
}

// 5. onClick w grach + touch-none / select-none / onPointerDown per plik
const touchStats = {};
for (const f of files.filter((f) => f.startsWith("games/"))) {
  const t = text[f];
  touchStats[f] = {
    onClick: (t.match(/\bonClick\b/g) ?? []).length,
    onPointerDown: (t.match(/\bonPointerDown\b/g) ?? []).length,
    touchNone: /\btouch-none\b|touchAction:\s*["']none/.test(t),
    selectNone: /\bselect-none\b|userSelect:\s*["']none/.test(t),
  };
  for (const tg of TAGS[f]) {
    if (!/\bonClick\b/.test(tg.src)) continue;
    const cls = classOf(tg.src);
    const btn = /(?<![\w-])btn(?![\w-])/.test(cls);
    hit("onclick", f, tg.line, `<${tg.name}> ${tg.src.slice(0, 150)}`, btn ? "zgodne, jeśli to przycisk platformy/akcja bez pomiaru czasu (.btn)" : "do oceny w planie gry: pole gry na czas powinno mieć onPointerDown (ZASADY.md §4)");
  }
}

// 6. Stałe piksele
const PX = [
  [/\b(?:w|min-w|max-w)-\[\d+(?:\.\d+)?px\]/g, "stała szerokość w px"],
  [/\b(?:w|min-w)-\[\d+(?:\.\d+)?rem\]/g, "stała szerokość w rem (rozszerzenie planu)"],
  [/\bmin-w-\[[^\]]+\]/g, "min-w-[..]"],
  [/\bwidth:\s*\d+(?:\.\d+)?\s*[,}]/g, "style width liczbą (px)"],
  [/\bwhitespace-nowrap\b/g, "whitespace-nowrap"],
  [/\boverflow-x(?:-[\w]+)?\b|overflowX/g, "overflow-x"],
  [/\bgrid-cols-\[[^\]]+\]|gridTemplateColumns/g, "siatka z własnym szablonem (minmax(0,1fr)?)"],
];
for (const f of files) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    for (const [re, what] of PX) for (const m of l.matchAll(re)) {
      let ocena = "do oceny w planie gry (360×640, D-09)";
      if (what.startsWith("siatka") && /minmax\(0,\s*1fr\)/.test(l)) ocena = "zgodne (minmax(0,1fr))";
      if (what === "overflow-x" && /overflow-x-(hidden|clip)/.test(m[0])) ocena = "zgodne (ucina, nie przewija)";
      if (what === "overflow-x" && /overflow-x-auto|overflow-x-scroll/.test(m[0])) ocena = "do oceny w planie gry: przewijanie w poziomie wewnątrz kafla (reguła mówi o ekranie; wysokie, jeśli bez tego nie widać treści)";
      if (what.startsWith("siatka") && !/minmax\(0,\s*1fr\)/.test(l) && /1fr/.test(l)) ocena = "do oceny w planie gry: `1fr` bez `minmax(0,1fr)` nie zwęża się poniżej treści (D-09)";
      hit("piksele", f, i + 1, `[${what}: ${m[0]}] ${l}`, ocena);
    }
  });
  for (const tg of TAGS[f]) {
    const w = /^(svg|img|canvas|video|iframe|div|span|button)$/.test(tg.name) && tg.src.match(/\bwidth=\{?["']?(\d+)/);
    if (w) hit("piksele", f, tg.line, `[atrybut width=${w[1]} na <${tg.name}>] ${tg.src.slice(0, 140)}`, "do oceny w planie gry (360×640, D-09)");
  }
  for (const tg of TAGS[f]) if (tg.name === "svg" && !/\bviewBox\b/.test(tg.src)) hit("piksele", f, tg.line, `[svg bez viewBox] ${tg.src}`, "do oceny w planie gry (SVG nie skaluje się bez viewBox)");
}

// 7. Teksty
const WORDS = /\b(Rewanz|Restart|Zagraj ponownie|Kontynuuj|Next|OK|Start gry)\b|Wróć|Powrót|Dalej\s*»/g;
for (const f of files) {
  lines[f].forEach((l, i) => {
    const com = isComment(l);
    for (const m of l.matchAll(/[—–]/g)) hit("teksty", f, i + 1, `[${m[0] === "—" ? "em-dash" : "en-dash"}] ${l}`, com ? "zgodne (komentarz, nie UI)" : "rozbieżność (średnia), jeśli w tekście UI");
    if (com) return;
    if (/toFixed\(\d\)\}[ ,]\$\{/.test(l)) { hit("teksty", f, i + 1, `[toFixed w współrzędnych] ${l}`, "zgodne (współrzędne SVG, nie tekst UI)"); return; }
    if (/toFixed\(/.test(l) && !/replace\(\s*["']\.["']\s*,\s*["'],["']\s*\)|tenth/.test(l)) hit("teksty", f, i + 1, `[toFixed bez przecinka] ${l}`, "do oceny: kropka dziesiętna w UI = rozbieżność (średnia); w obliczeniach zgodne");
    for (const m of l.matchAll(WORDS)) hit("teksty", f, i + 1, `[słowo: ${m[0]}] ${l}`, /Zagraj ponownie|Wróć do pokoju/.test(l) ? "do oceny (słowo z KONCEPT.md: „Zagraj ponownie” w Rekordach, „Wróć do pokoju” na ekranie głównym)" : "do oceny: inne słowo niż wspólne (ZASADY.md §4)");
  });
}

// 8. Liczby bez mono / tabular-nums (heurystyka)
const NUMERIC = /\b(score|points?|pts|ms|sec(onds)?|count|total|length|left|round|best|avg|average|time|hits|misses|err(or)?s?|value|n|num|level|height|place|wins?|money|cash|sum|diff|km|deg|pct|percent)\b|tenth\(|toFixed\(|Math\.|\d/i;
for (const f of files) {
  const t = text[f];
  const tg = TAGS[f];
  for (let k = 0; k < tg.length; k++) {
    const g = tg[k];
    if (!/^(span|div|p|td|th|strong|b|li|text|tspan|dd|output)$/.test(g.name) || g.self) continue;
    const nextLt = t.indexOf("<", g.end);
    const content = t.slice(g.end, nextLt === -1 ? t.length : nextLt);
    const exprs = [...content.matchAll(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)].map((m) => m[1]).filter((e) => e.trim() && !/^\s*\/\*/.test(e));
    const strip = (e) => e.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '""');
    if (!exprs.some((e) => !/=>|</.test(e) && NUMERIC.test(strip(e)) && !/nick|name|label|title|icon|children/i.test(e))) continue;
    const cls = classOf(g.src);
    if (/font-mono|tabular-nums|\blabel\b/.test(cls)) continue;
    hit("liczby", f, g.line, `<${g.name} class="${clip(cls, 60)}"> ${content}`, "do oceny w planie gry (klasy mogą być dziedziczone z rodzica)");
  }
}

// 9. Dostępność
const phosphor = {};
for (const f of files) {
  const imp = [...text[f].matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@phosphor-icons\/react["']/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean));
  phosphor[f] = new Set(imp.filter((n) => !/^type\s/.test(n) && n !== "IconProps" && n !== "Icon"));
  for (const g of TAGS[f]) {
    const isIcon = phosphor[f].has(g.name) || /^(PointIcon|Icon|GameIcon)$/.test(g.name);
    if ((g.name === "svg" || isIcon) && !/aria-hidden|aria-label|role=|aria-labelledby/.test(g.src)) {
      const comp = compAt(f, g.line)?.name ?? "";
      const inIntro = /Preview$/.test(comp) || TAGS[f].some((x) => x.name === "Intro" && x.start < g.start && g.end <= x.end);
      hit("a11y", f, g.line, `[${g.name === "svg" ? "svg" : "ikona " + g.name} bez aria-hidden | komponent: ${comp || "?"}] ${g.src.slice(0, 140)}`, inIntro ? "zgodne (podgląd Intro: rodzic ma aria-hidden, ui.tsx:297)" : "do oceny (niska): ozdoba bez aria-hidden; może mieć aria-hidden na rodzicu albo być treścią (pole gry)");
    }
    if (g.name === "button" && !g.self) {
      const close = text[f].indexOf("</button>", g.end);
      const inner = text[f].slice(g.end, close);
      const stripped = inner.replace(/<[^>]*>/g, "").replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
      const literal = stripped.replace(/\{[\s\S]*?\}/g, "").trim() || (stripped.match(/["'`][^"'`]*\p{L}{2}[^"'`]*["'`]/u) ?? [""])[0];
      const hasExpr = /\{[\s\S]*?\}/.test(stripped);
      if (!literal && !/aria-label/.test(g.src)) hit("a11y", f, g.line, `[button bez tekstu${hasExpr ? " (tylko wyrażenia)" : ""}] ${g.src.slice(0, 120)} … ${clip(inner, 80)}`, hasExpr ? "do oceny: tekst może przychodzić z wyrażenia" : "rozbieżność (niska): przycisk bez tekstu i bez aria-label");
    }
  }
}

// 10. Intro
const introStats = {};
for (const f of files.filter((f) => f.startsWith("games/"))) {
  const ins = TAGS[f].filter((g) => g.name === "Intro");
  const hasPreview = /function Preview\b|const Preview\b/.test(text[f]);
  introStats[f] = { n: ins.length, preview: hasPreview, uses: (text[f].match(/from "\.\/(Quiz|Szacowanie)(?:\.tsx)?"/) ?? [])[1] ?? "", inlinePreview: ins.some((g) => /preview=\{\s*</.test(g.src)) };
  for (const g of ins) {
    const miss = ["time", "task", "score", "preview", "onStart"].filter((a) => !new RegExp(`\\b${a}=`).test(g.src));
    hit("intro", f, g.line, `[atrybuty: ${["time", "task", "score", "preview", "onStart"].filter((a) => !miss.includes(a)).join(", ")}${miss.length ? "; brak: " + miss.join(", ") : ""}] ${g.src.replace(/\s+/g, " ").slice(0, 300)}`, miss.length ? "rozbieżność (średnia): brak punktu Intro" : hasPreview ? "zgodne (komplet atrybutów, Preview w pliku)" : /preview=\{\s*</.test(g.src) && !/preview=\{\s*<Preview/.test(g.src) ? "do oceny: komplet atrybutów, podgląd wpisany inline zamiast komponentu Preview (ZASADY.md §4: „mały komponent Preview”)" : "do oceny: komplet atrybutów, podgląd przychodzi z propsów (wspólny ekran); Preview sprawdzić w plikach gier");
  }
}

// --- Task 2 ---
// Katalog keyframes
const cssL = lines[CSS];
const keyframes = [];
cssL.forEach((l, i) => {
  const m = l.match(/^@keyframes\s+([\w-]+)/);
  if (!m) return;
  let j = i - 1;
  while (j >= 0 && cssL[j].trim() === "") j--;
  const commented = j >= 0 && /\*\/\s*$/.test(cssL[j]);
  // Współdzielony komentarz nad grupą (np. preview-half/quarter, tile-hit/miss): szukaj wstecz przez poprzednie bloki keyframes.
  let shared = false;
  if (!commented) {
    for (let k = j; k >= 0; k--) {
      if (/\*\/\s*$/.test(cssL[k])) { shared = true; break; }
      if (/^[^@\s}%]/.test(cssL[k]) && !/^@keyframes/.test(cssL[k])) break;
    }
  }
  keyframes.push({ name: m[1], line: i + 1, comment: commented ? "tak" : shared ? "wspólny z poprzednią" : "nie", inSec5: new RegExp("`" + m[1] + "`").test(sec5) ? "tak" : "nie" });
});
const kfNames = new Set(keyframes.map((k) => k.name));
const kfUse = {};
const TW_ANIM = /\banimate-(spin|pulse|ping|bounce|none)\b/g;
for (const f of files) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    for (const m of l.matchAll(/animate-\[([A-Za-z0-9-]+)((?:_[^\]\s_]+)*)\]/g)) {
      const [, name, rest] = m;
      const parts = rest.split("_").filter(Boolean);
      const time = parts.find((p) => /^[\d.]+m?s$/.test(p)) ?? "";
      const ease = parts.filter((p) => p !== time).join(" ");
      (kfUse[name] ??= []).push(`${f}:${i + 1}`);
      hit("anim", f, i + 1, `[${name} | ${time || "?"} | ${ease || "-"}] ${l}`, kfNames.has(name) ? "do oceny czasu wobec tabeli §5 (D-06)" : "rozbieżność: nazwa spoza katalogu index.css");
    }
    for (const m of l.matchAll(TW_ANIM)) hit("anim", f, i + 1, `[tailwind ${m[0]}] ${l}`, "rozbieżność (niska): wbudowana animacja Tailwinda zamiast keyframes z komentarzem");
    for (const m of l.matchAll(/\banimation(?:Name|Duration|Delay|TimingFunction)?\s*:|\[animation-[\w-]+:[^\]]+\]/g)) hit("anim", f, i + 1, `[${m[0]}] ${l}`, /animationDelay|animation-delay/.test(m[0]) ? (/animation-delay:-|animationDelay:\s*["'`]-|\* -|- \d|-\s*\d+(\.\d+)?\}?s|\? .*- /.test(l) ? "zgodne (ujemny delay w Preview, §5)" : "do oceny: delay bez widocznego minusa (poza Preview albo wyliczany)") : "do oceny (animacja inline)");
  });
}
// view-transition w CSS
const vt = cssL.map((l, i) => [l, i + 1]).filter(([l]) => /view-transition/.test(l));

// Przejścia
for (const f of files) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    const tr = [...l.matchAll(/\btransition(?:-[\w[\],]+)?\b|\bduration-(?:\d+|\[[^\]]+\])|\bdelay-(?:\d+|\[[^\]]+\])|\bease-(?:linear|in|out|in-out|\[[^\]]+\])|\btransition(?:Duration|Property|TimingFunction)?\s*:/g)].map((m) => m[0]);
    if (!tr.length) return;
    const dur = tr.filter((x) => x.startsWith("duration-")).map((x) => x.replace("duration-", "").replace(/[[\]]/g, ""));
    const inl = l.match(/transition(?:Duration)?:\s*[`"']([^`"']+)/);
    const time = dur.length ? dur.map((d) => (/^\d+$/.test(d) ? d + "ms" : d)).join(",") : inl ? inl[1] : tr.some((x) => /^transition/.test(x)) ? "150ms (domyślne Tailwinda)" : "";
    let ocena = "do oceny wobec tabeli §5 (100 ms dotyk, 180 ms przejście stanu)";
    if (time.startsWith("150ms")) ocena = "do oceny: domyślne 150 ms nie ma w tabeli §5 (niska)";
    if (/^(100ms|180ms)$/.test(time)) ocena = "zgodne z tabelą §5, jeśli rola się zgadza";
    hit("trans", f, i + 1, `[${tr.join(", ")} | czas: ${time || "?"}] ${l}`, ocena);
  });
}

// Timery
const reduced = {};
for (const f of files) {
  const code = lines[f].filter((l) => !isComment(l)).join("\n");
  reduced[f] = /reducedMotion|prefers-reduced-motion/.test(code) ? true : /reducedMotion|prefers-reduced-motion/.test(text[f]) ? "komentarz" : false;
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    for (const m of l.matchAll(/\b(setTimeout|setInterval|requestAnimationFrame|startViewTransition|\.animate)\(/g)) {
      hit("timery", f, i + 1, `[${m[1]} | reducedMotion w pliku: ${reduced[f] === true ? "tak" : reduced[f] ? "tylko w komentarzu" : "nie"}] ${l}`, reduced[f] === true ? "do oceny (plik sprawdza reducedMotion; czy ta ścieżka też?)" : "do oceny w planie gry: jeśli steruje animacją, brak reducedMotion = rozbieżność (średnia); jeśli logiką gry, zgodne");
    }
  });
}

for (const f of files.filter((f) => f.startsWith("games/"))) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    for (const m of l.matchAll(/\bperformance\.now\(|\bDate\.now\b|\.timeStamp\b/g)) {
      const c = compAt(f, i + 1);
      const body = c ? lines[f].slice(c.start - 1, c.end).join("\n") : "";
      const anim = [...new Set([...body.matchAll(/animate-\[([A-Za-z0-9-]+)|\btransition(?:-[\w[\]]+)?\b|startViewTransition|requestAnimationFrame/g)].map((x) => x[1] ?? x[0]))];
      hit("pomiar", f, i + 1, `[${m[0]} | komponent: ${c?.name ?? "?"} (${c?.start}-${c?.end}) | animacje w komponencie: ${anim.join(", ") || "brak"}] ${l}`, anim.length ? "do oceny w planie gry: czy bodziec/pomiar nie czeka na animację (§5, waga wysoka przy zależności)" : "zgodne wstępnie (brak animacji w komponencie)");
    }
  });
}

// Wibracje
for (const f of files) {
  lines[f].forEach((l, i) => {
    if (isComment(l)) return;
    for (const m of l.matchAll(/vibrate(\?\.)?\(([^;]*?)\)(?=\s*[;)}]|\s*$)/g)) {
      const pat = m[2].trim();
      const opt = !!m[1];
      let ctx = "?";
      for (let k = i; k >= 0; k--) {
        const c = lines[f][k].match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)|^\s*(?:const|let)\s+(\w+)\s*=\s*(?:useCallback\()?\(?[^=]*=>|^\s*(useEffect|useLayoutEffect)\(/);
        if (c) { ctx = `${c[1] ?? c[2] ?? c[3]} (:${k + 1})`; break; }
      }
      const comp = compAt(f, i + 1)?.name ?? "?";
      const cond = l.trim().startsWith("if") ? l.trim().match(/^if\s*\((.*?)\)\s*navigator/)?.[1] ?? "" : "";
      let ocena;
      if (!opt) ocena = "rozbieżność (średnia): bez `?.`";
      else if (pat === "60") ocena = "zgodne z tabelą §5, jeśli to pomyłka (sprawdzić, czy nie przy trafieniu)";
      else if (pat === "40") ocena = f === "screens/Game.tsx" ? "zgodne (moja tura w Game.tsx)" : "rozbieżność (średnia): 40 = moja tura, robi to Game.tsx";
      else if (pat === "[60, 40, 60]") ocena = "zgodne z tabelą §5, jeśli to zdarzenie od innego gracza";
      else ocena = f === "games/Rytm.tsx" ? "do oceny: wzór spoza tabeli §5 (metronom, KONCEPT.md: klik, błysk i wibracja)" : "rozbieżność (średnia): wzór spoza tabeli §5";
      const prev = lines[f].slice(Math.max(0, i - 3), i).map((x) => x.trim()).filter(Boolean).join(" ⏎ ");
      hit("vibrate", f, i + 1, `[vibrate wzór: ${pat} | ?.: ${opt ? "tak" : "nie"} | kontekst: ${ctx} w ${comp}${cond ? " | warunek: " + cond : ""}] ${l} ‖ 3 linie wcześniej: ${prev}`, ocena);
    }
  });
}

// --- Wyjście ---
const out = [];
const P = (s = "") => out.push(s);
const TABLE_KEYS = KEYS.map(([k]) => k);
const SHORT = { kolory: "kol", akcent: "akc", ksztalt: "zaokr/cień", dotyk: "<48px", onclick: "onClick", piksele: "px", teksty: "tekst", liczby: "liczby", a11y: "a11y", intro: "Intro", anim: "anim", trans: "trans", timery: "timery", pomiar: "pomiar", vibrate: "vibrate" };
P("## Tabela zbiorcza: plik × sprawdzenie (liczba trafień)");
P();
P("Kolumny: " + KEYS.map(([k, t]) => `**${SHORT[k]}** = ${t}`).join("; ") + ". Dodatkowo: **btn-primary** = liczba `btn-primary` w pliku, **pointerDown** = liczba `onPointerDown`, **touch/select** = `touch-none` / `select-none` w pliku (tylko gry), **RM** = plik sprawdza `reducedMotion` / `prefers-reduced-motion`.");
P();
P(`| Plik | ${TABLE_KEYS.map((k) => SHORT[k]).join(" | ")} | btn-primary | pointerDown | touch/select | RM |`);
P(`|---|${TABLE_KEYS.map(() => "---:").join("|")}|---:|---:|---|---|`);
const totals = Object.fromEntries(TABLE_KEYS.map((k) => [k, 0]));
for (const f of [...files, CSS]) {
  const row = TABLE_KEYS.map((k) => {
    const n = (checks[k] ?? []).filter((h) => h.f === f).length;
    totals[k] += n;
    return n || "·";
  });
  const bp = f === CSS ? "-" : (text[f].match(/\bbtn-primary\b/g) ?? []).length || "·";
  const pd = f === CSS ? "-" : (text[f].match(/\bonPointerDown\b/g) ?? []).length || "·";
  const ts = touchStats[f] ? `${touchStats[f].touchNone ? "tak" : "nie"} / ${touchStats[f].selectNone ? "tak" : "nie"}` : "-";
  const rm = f === CSS ? "tak (reguła globalna)" : reduced[f] === true ? "tak" : reduced[f] ? "komentarz" : "nie";
  P(`| ${rel(f)} | ${row.join(" | ")} | ${bp} | ${pd} | ${ts} | ${rm} |`);
}
P(`| **Razem** | ${TABLE_KEYS.map((k) => `**${totals[k]}**`).join(" | ")} | | | | |`);
P();
P("`·` = 0 trafień. `apps/web/src/main.tsx` jest w zakresie grepa (`**/*.tsx` bez `Dev.tsx`), choć D-01 go nie wymienia.");
P();

const section = (k, title, intro) => {
  P(`## ${title}`);
  P();
  if (intro) { P(intro); P(); }
  const hs = checks[k] ?? [];
  P(`Trafień: ${hs.length}.`);
  P();
  if (!hs.length) { P("Brak trafień."); P(); return; }
  let cur = null;
  for (const h of hs) {
    if (h.f !== cur) { if (cur) P(); cur = h.f; P(`**${rel(h.f)}**`); P(); }
    P(`- \`${rel(h.f)}:${h.line}\`: ${h.frag.replace(/`/g, "ʼ")} → *${h.ocena}*`);
  }
  P();
};
section("kolory", "1. Kolory spoza tokenów (UI-01)", "Szukane: `#hex`, `rgb(`/`rgba(`, `hsl(`, `oklch(`, `hwb(`, `lab(` (w `index.css` poza `@theme`) i klasy palety Tailwinda (`bg|text|border|ring|fill|stroke|from|to|via|outline|…-(red|…|white|black)`). Linie-komentarze pominięte. `PLAYER_COLORS` przychodzą przez `style` z danych, więc nie dają trafień.");
P("### Akcent: liczba użyć per plik");
P();
P("| Plik | użycia (token: liczba linii) |");
P("|---|---|");
for (const f of files) if (accentCount[f]) P(`| ${rel(f)} | ${Object.entries(accentCount[f]).map(([a, n]) => `\`${a}\`: ${n}`).join(", ")} |`);
P();
section("akcent", "2. Akcent (UI-01, DESIGN.md §5)", "Szukane: `(bg|text|border|ring|outline|fill|stroke|…)-accent(-soft|-hover|-fg)?`, `btn-primary`, `--color-accent`. Każdy `btn-primary` w pliku gry to kandydat na akcję w partii w akcencie zamiast koloru gracza; dwa lub więcej `btn-primary` w pliku to kandydat na dwa wypełnione przyciski na jednym ekranie (do oceny, bo mogą być na różnych ekranach).");
section("ksztalt", "3. Zaokrąglenia i cienie (UI-01, DESIGN.md §2)", "Szukane: `rounded*` inne niż `rounded-tile`, `rounded-inset`, `rounded-full`, `rounded-[20px]`, `rounded-[10px]` (także warianty narożników); `shadow*`, `drop-shadow*`, `box-shadow`/`boxShadow`, `border-radius`/`borderRadius`, `rx=` w SVG.");
section("dotyk", "4. Pola dotykowe poniżej 48 px (UI-03)", "Znaczniki JSX z `onClick`/`onPointerDown`/`onPointerUp`/`onTouchStart` i klasą `h-N`/`size-N`/`w-N`/`min-h-N`/`min-w-N` dla N < 12, `…-[Npx]` dla N < 48 albo atrybutem `width`/`height` < 48. Heurystyka: nie widzi paddingu ani rozmiaru rodzica.");
P("## 5. onClick w plikach gier i touch-none / select-none (UI-03)");
P();
P("| Plik | onClick | onPointerDown | touch-none | select-none |");
P("|---|---:|---:|---|---|");
for (const [f, s] of Object.entries(touchStats)) P(`| ${rel(f)} | ${s.onClick} | ${s.onPointerDown} | ${s.touchNone ? "tak" : "**nie**"} | ${s.selectNone ? "tak" : "**nie**"} |`);
P();
P("Pliki gier bez `touch-none`: " + Object.entries(touchStats).filter(([, s]) => !s.touchNone).map(([f]) => "`" + rel(f) + "`").join(", ") + ".");
P();
P("Pliki gier bez `select-none`: " + Object.entries(touchStats).filter(([, s]) => !s.selectNone).map(([f]) => "`" + rel(f) + "`").join(", ") + ".");
P();
P("Ocena per plik należy do planu gry: reguła dotyczy tylko pól gry na czas; gry turowe i pliki pomocnicze (`MiniGame.tsx`, `KampusSummary.tsx`) mogą zgodnie nie mieć tych klas.");
P();
section("onclick", "5a. Lista onClick w plikach gier", "Każdy znacznik z `onClick` w `games/*.tsx`. `.btn` w klasie = przycisk (zgodny, jeśli nie jest polem gry na czas).");
section("piksele", "6. Stałe piksele i przewijanie w poziomie (UI-04, D-09, sprawdzenie statyczne)", "Szukane: `w-/min-w-/max-w-[Npx]`, `min-w-[..]`, `width=` liczbą, `style` `width:` liczbą, `whitespace-nowrap`, `overflow-x*`, `grid-cols-[..]`/`gridTemplateColumns` (czy jest `minmax(0,1fr)`), `<svg>` bez `viewBox`.");
section("teksty", "7. Teksty (UI-05)", "Szukane: em-dash `—` i en-dash `–` (w każdej linii; linie-komentarze ocenione jako zgodne), `toFixed(` bez `.replace(\".\", \",\")` ani `tenth` w tej samej linii, słowa `Rewanz|Restart|Zagraj ponownie|Wróć|Powrót|Kontynuuj|Next|OK|Start gry|Dalej »`.");
section("liczby", "8. Liczby bez mono / tabular-nums (UI-01, heurystyka)", "Znacznik `span|div|p|td|th|strong|b|li|text|tspan|dd|output`, którego bezpośrednia treść (do następnego `<`) zawiera `{…}` z wyrażeniem wyglądającym na liczbę (cyfra, `Math.`, `tenth(`, `toFixed(`, nazwy typu `score`, `ms`, `round`, `length`), a klasa nie ma `font-mono`, `tabular-nums` ani `label`. Klasy dziedziczone z rodzica nie są widoczne, więc wszystko jest „do oceny”.");
section("a11y", "9. Dostępność (UI-05: aria-hidden, aria-label)", "`<svg>` i ikony Phosphor (importy z `@phosphor-icons/react` w pliku, oraz `Icon`/`PointIcon`/`GameIcon`) bez `aria-hidden`/`aria-label`/`role`; `<button>` bez tekstu dosłownego i bez `aria-label`.");
P("## 10. Intro (UI-02)");
P();
P("| Plik | `<Intro` | `Preview` w pliku | przez wspólny ekran | podgląd z innego pliku |");
P("|---|---:|---|---|---|");
for (const [f, s] of Object.entries(introStats)) P(`| ${rel(f)} | ${s.n || "·"} | ${s.preview ? "tak" : "nie"} | ${s.uses || "-"} | ${/QuizPreview/.test(text[f]) ? "QuizPreview" : "-"} |`);
const own = Object.entries(introStats).filter(([f, s]) => s.n && !/Quiz|Szacowanie/.test(f)).length;
const viaQ = Object.entries(introStats).filter(([, s]) => s.uses === "Quiz" && !s.n).map(([f]) => f);
const viaS = Object.entries(introStats).filter(([, s]) => s.uses === "Szacowanie").map(([f]) => f);
P();
P(`Mini-gry z własnym \`<Intro\`: ${own}; przez \`Quiz.tsx\` (bez własnego \`<Intro\`): ${viaQ.length} (${viaQ.map((f) => "`" + f + "`").join(", ")}); przez \`Szacowanie.tsx\`: ${viaS.length} (${viaS.map((f) => "`" + f + "`").join(", ")}). Razem ${own + viaQ.length + viaS.length} (KONCEPT.md §2.4: 30 mini-gier). Pliki bez \`<Intro\` i bez wspólnego ekranu to gry główne albo pomocnicze (\`MiniGame.tsx\`, \`KampusSummary.tsx\`): zgodne, Intro dotyczy tylko mini-gier.`);
P();
section("intro", "10a. Atrybuty `<Intro>`", "Dla każdego `<Intro` sprawdzone atrybuty `time`, `task`, `score`, `preview`, `onStart`. Wartości do oceny treści w planach gier (krótkie, po polsku, bez em-dashy).");

P("## 11. Katalog keyframes z index.css (ANIM-01)");
P();
P("| Nazwa | Linia | Komentarz nad regułą | Wymienione w ZASADY.md §5 | Użycia (`animate-[…]`) |");
P("|---|---:|---|---|---|");
for (const k of keyframes) P(`| \`${k.name}\` | ${rel(CSS)}:${k.line} | ${k.comment} | ${k.inSec5} | ${(kfUse[k.name] ?? []).join(", ") || "**nieużywane w .tsx**"} |`);
P();
P(`Reguł \`@keyframes\`: ${keyframes.length}. Nieużywane w plikach .tsx przez \`animate-[…]\`: ${keyframes.filter((k) => !kfUse[k.name]).map((k) => "`" + k.name + "`").join(", ") || "brak"}. Nazwy użyte w \`animate-[…]\` spoza katalogu: ${Object.keys(kfUse).filter((n) => !kfNames.has(n)).map((n) => "`" + n + "`").join(", ") || "brak"}.`);
P();
P("View transitions w `index.css`: " + vt.map(([l, n]) => `\`${rel(CSS)}:${n}\` (${l.trim()})`).join("; ") + ".");
P();
section("anim", "11a. Użycia animacji w kodzie (ANIM-01)", "`animate-[nazwa_czas_easing…]` rozbite na nazwę, czas i resztę (easing, iteracje), wbudowane `animate-spin|pulse|ping|bounce`, inline `animation*:` i `[animation-*:…]`.");
section("trans", "12. Przejścia (ANIM-01)", "Klasy `transition*`, `duration-*`, `delay-*`, `ease-*` i inline `transition*:`. Czas: z `duration-*`, z inline albo domyślne 150 ms Tailwinda dla gołego `transition*`.");
section("timery", "13. Timery i animacje z JS (ANIM-02)", "`setTimeout`, `setInterval`, `requestAnimationFrame`, `startViewTransition`, `.animate(` w plikach gier i ekranów, z informacją, czy plik sprawdza `reducedMotion`/`prefers-reduced-motion`.");
section("pomiar", "14. Pomiar czasu w grach (ANIM-02)", "`performance.now(`, `Date.now`, `.timeStamp` w `games/*.tsx`; komponent (najbliższa `function`/`const X = (…) =>` od początku linii) i animacje/przejścia w tym samym komponencie.");
section("vibrate", "15. Wibracje (ANIM-03)", "Każde wywołanie `vibrate(` z wzorem, obecnością `?.`, najbliższą funkcją / handlerem / efektem i komponentem.");
const vf = [...new Set((checks.vibrate ?? []).map((h) => h.f))];
P(`Pliki z \`vibrate\`: ${vf.length} (${vf.map((f) => "`" + rel(f) + "`").join(", ")}).`);
P();
P("## 16. Reguła `prefers-reduced-motion` z index.css (ANIM-02)");
P();
const rmStart = cssL.findIndex((l) => /@media \(prefers-reduced-motion/.test(l));
let rmEnd = rmStart, d = 0;
for (let i = rmStart; i < cssL.length; i++) { d += (cssL[i].match(/\{/g) ?? []).length - (cssL[i].match(/\}/g) ?? []).length; if (d === 0 && i > rmStart) { rmEnd = i; break; } }
P(`\`${rel(CSS)}:${rmStart + 1}-${rmEnd + 1}\`:`);
P();
P("```css");
P(cssL.slice(rmStart, rmEnd + 1).join("\n"));
P("```");
P();
P("Co wyłącza: wszystkie animacje CSS (`animation-duration: 0.01ms`, jedna iteracja, więc pętle `infinite` w `Preview` stają po pierwszej, a element zostaje w stanie końcowym keyframes) i wszystkie przejścia CSS (`transition-duration: 0.01ms`) na każdym elemencie i pseudoelemencie. Nie obejmuje: animacji z JS (`setTimeout`/`requestAnimationFrame` sterujących stanem, `startViewTransition`; pseudoelementy `::view-transition-*` dziedziczą z `*` tylko przez `animation-duration`, do oceny), ani `animationDelay` (ujemny delay nadal działa). Inline `transitionDuration`/`transition` w `style` przegrywa z `!important` reguły, więc też jest zerowane.");
P();

process.stdout.write(out.join("\n") + "\n");
// Liczby dla nagłówka
process.stderr.write(JSON.stringify({ totals, keyframes: keyframes.length, unused: keyframes.filter((k) => !kfUse[k.name]).map((k) => k.name), vibrateFiles: vf.length, files: files.length }) + "\n");
````

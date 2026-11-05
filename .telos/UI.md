# Wygląd, animacje i wibracje
<!-- Skrót DESIGN.md i ZASADY.md §4-5. Przy sprzeczności wygrywa ZASADY.md. Implementacja: apps/web/src/index.css,
     wspólne komponenty apps/web/src/screens/ui.tsx, wibracje apps/web/src/vibrate.ts. -->

## Charakter
Ciemny, cichy, techniczny (przedłużenie figielak.dev). Ekran nie świeci, nie miga i nie gra.
- Prawie czarne tło z jedną nieruchomą poświatą w prawym górnym rogu (16%, 60vmax). Domyślnie akcent, w partii kolor
  gracza, na którego czekamy (`--ambient`); w Kalamburach zawsze kolor rysującego.
- Jeden wypełniony przycisk akcentu na ekran (akcja platformy); reszta obrysy. Znak aplikacji może mieć akcent.
- Satoshi mówi (nazwy, zdania, przyciski), Geist Mono liczy (kody, wyniki, czasy, podpisy `.label`).

## Tokeny (jedyny katalog: DESIGN.md §2)
| Token | Wartość | Rola |
|---|---|---|
| `bg` | `#0e0e10` | tło, wnętrze podglądu Intro |
| `surface` | `#161618` | pasek statystyk, karty rekordów |
| `surface-inset` | `#111113` | pola formularza |
| `surface-glass` | `rgb(22 22 24 / 0.55)` + blur 16 px | kafel `.tile` |
| `line` / `line-hover` | biel 8% / 16% | obrysy i separatory / pod kursorem |
| `fg` / `fg-muted` / `fg-subtle` | `#ededef` / `#8b8b92` / `#5c5c63` | tekst / opisy i ikony / nieistotne detale |
| `accent` / `accent-hover` | `#ff2445` / `#ff4560` | akcja platformy, focus, zaznaczony kafel, znak / tylko `.btn-primary` |
| `accent-soft` / `accent-fg` | akcent 12% / `#0e0e10` | ikona wyzwania dnia, „Łączenie ponownie…” / tekst na akcencie |
| `warning` | `#ff6369` | ostatnie 10 s, pomyłka, kara, błąd, „nie wolno”, ostrzeżenie o skutku; zawsze z ikoną lub tekstem |
| `success` | `#3dd68c` | trafienie, bodziec „dotknij” |
Kolory graczy (`PLAYER_COLORS` w `lobby.ts`): `#3b9eff`, `#ffc53d`, `#46a758`, `#8e7cff`, `#0ac5b3`, `#f76fbe`.
Głębia z obrysu 1 px i przezroczystości, nie cieni (cienie tylko Kampus Tour 2.5D, okna, pionki i `set-glow`).
Typografia: tytuł Satoshi 30/600 tracking-tight; kod pokoju Mono 60/500, 0,12em; treść 16 (przycisk 500, wyróżnienie 600);
opis 14 `fg-muted`; liczba w `Stats` Mono 18/600; `.label` Mono 11 wersaliki 0,08em `fg-muted`; podpis kafla gry Mono 12.
Promienie: 20 px kafel, 10 px w kaflu i małe kafle, 999 px przyciski i kropki; 4 px tylko odznaka turnieju i pola Kampus Tour.
Odstępy: jedna kolumna `max-w-md`, margines 16 px, odstęp bloków 12 px, wnętrze kafla 20 px (gęste listy 12-16).

## Wzorce i komponenty
- Ekran gry `apps/web/src/games/<Gra>.tsx` dostaje `view`, `me`, `players`, `onMove` (oraz `canMove` albo `ranking`), nie zna sieci.
- `screens/Game.tsx` rysuje wspólny nagłówek (status „Twój ruch” / „Ruch: {nick}” / „Czekamy na: …” / „Wygrywasz!”, pasek czasu
  w kolorze gracza, `GameDots`: inicjały, pierścień postępu, kreska pod własną, przerywany obrys przy rozłączeniu, odznaka wygranych;
  dotknięcie rozwija pigułki), „Oglądasz”, rozłączenie, „Rewanż”, „Do lobby”. Własny nagłówek: tylko Państwa-miasta i Kampus Tour.
- `Screen`, `StickyBar`, `Stats` (liczby nad polem gry), `Scores` (jedna liczba), `ScoreTable` (kolumny: quizy, Dziesiątki,
  Stój!, Refleks), `RoundTable` (rundy w kolumnach; Mapa, Środek, Tort, Nożyczki, Przytrzymaj, Balon, Kropki, Kąt, Który rok?),
  `Intro` (podgląd `Preview` w CSS, punkty `time`/`task`/`score`, „Start”, auto po 15 s), `decimal`/`tenth`, `grade`, `useFresh`, `useHarm`.
- Klasy `index.css`: `.tile`, `.label`, `.btn` + `.btn-primary` / `.btn-ghost`, `.field`. Nowa klasa wspólna dopiero przy drugiej grze.
  `.btn-player` zatwierdzona, ale niewdrożona: dziś `btn text-bg` + `backgroundColor` koloru gracza.
- Wzorce: karta „Sam” (`Home.tsx`), kod pokoju (`Lobby.tsx`), `Intro`, nagłówek partii + `Stats`, siatka mini-gier (3 kolumny).

## Reguły wyglądu
- Kolor gracza, nie czerwień, dla wszystkiego „mojego” lub „czyjegoś”. Akcent = platforma („Zagraj”, „Start”, gotowość,
  „Rewanż”, „Dalej” między grami turnieju, „Jeszcze raz”); akcja w partii („Gotowe”, „Rzuć”, „Zgarnij”, „Dalej” między
  rundami) w kolorze gracza z tekstem `bg`. Własny wybór w kolorze wybierającego z drugim znakiem (`Check`, `aria-pressed`).
  Właściciel elementu planszy ma inicjał lub ikonę. W odsłonie rundy moja odpowiedź w kolorze gracza, prawda neutralna (`fg`).
- Kolor nigdy nie jest jedynym sygnałem; stan blokujący ma podpis („Tryb wybiera gospodarz.”). Stany: obrys, krycie, waga ikony.
  Ładowanie = czasownik z wielokropkiem, bez spinnera; pusty stan = jedno zdanie `fg-muted`.
- Liczby, czasy, kody mono z `tabular-nums` (liczba w zdaniu narracji może być Satoshi); przecinek dziesiętny, typograficzny minus,
  bez „−0,0”; brak wartości = „brak”. Podpis bloku `.label`; grupy w jednej liście Satoshi 14 `fg-muted`.
- Pola dotykowe ≥ 48 px; gry na czas `touch-none select-none` i `onPointerDown`. Gęste plansze (Gomoku, Statki, Chińczyk,
  Labirynt): mniejsze pole tylko wybiera, ruch wysyła przycisk ≥ 48 px (dziś 56 px) z nazwą wyboru („Postaw na H8”).
- Ekran partii mieści się na 360×640 bez poziomego przewijania, plansza skaluje się do szerokości. Listy poza partią, wyniki
  i odsłony mogą przewijać się pionowo z akcjami w `StickyBar`. Wyjątki lokalne: Państwa-miasta (formularz i głosowanie),
  Statki (mała plansza drugiej floty pod 640 px), Kampus Tour (układ poziomy, cele 48 px po skalowaniu).
- Teksty po polsku, krótkie, bez em-dashy. Słownik: „Start”, „Dalej” (po odsłonie do następnego kroku), „Wyniki” (tylko do
  podsumowania), „Gotowe” (oddanie), „Zgłaszam gotowość”, „Rewanż”, „Do lobby”, „(ty)”, „Czekamy na: {nicki}…”, „Idealnie!”,
  „Nowy rekord!” (tylko wszech czasów; lepsza próba w partii to „Najlepsza próba!”); czynności gry własnym słowem („Pokrój”).
- Ozdoby `aria-hidden`, przyciski bez tekstu `aria-label`, pole gry bez tekstu to przycisk z nazwą. Ikony Phosphor
  (`regular`, `fill` wyróżnienie, `bold` małe akcje). `color-scheme: dark`. Tylko ciemny motyw.
- Treść gry (pola Sekwencji, figury, próbki, rogi Kampus Tour, gradient Koła) nie musi pochodzić z tokenów. Statki: trafienie w `accent`.

## Animacje (keyframes w `index.css`, pilnuje `apps/web/src/animations.test.ts`)
| Keyframes | Rola | Czasy |
|---|---|---|
| `stone-pop` | pojawienie elementu planszy | 0.35s; 180ms W pamięci |
| `ring-pulse` | to można wybrać, pętla | 1.2s |
| `dice-tumble` | rzut kośćmi | 0.3s |
| `card-in` | karta lub okno ze stanu gry | 0.35s |
| `float-up` / `float-still` | zmiana liczby / jej wersja reduced motion | 1.6s |
| `set-glow` | świeże osiągnięcie, „Nowy rekord!” | 0.9s ×4 |
| `preview-half` / `preview-quarter` | podgląd w Intro | 1s, 2s, 2.4s, 3s / 2.4s, 4s |
| `line-draw` | linia rysuje się (piątka Gomoku, podgląd koła) | 0.5s; 2.5s |
| `title-pop` | „Wygrywasz!”, tylko zwycięzca | 0.5s |
| `tile-hit` / `tile-miss` | trafienie / pomyłka (błysk) | 0.35s |
| `piece-fall` | ucięty kawałek Wieży | 0.5s |
| `shake` | ruch zignorowany bez kary | 0.3s |
- Czasy: dotyk 100 ms (`duration-100`), stan 180 ms (`duration-180`), krok pionka 180-220 ms (Szybki Chińczyk 110 ms, rzut 400 ms),
  pojawienie 350 ms ease-out, rzut 700 ms, pasek czasu `linear` krokiem `TICK_MS` 250 ms z zegara.
- Animacja pokazuje, co się stało; stan z serwera przychodzi od razu. Nie blokuje gry, nowy stan przerywa starą; duży skok ląduje od razu.
  Kampus Tour i Chińczyk: pierwsze dotknięcie kończy pokaz bez ruchu. Kroki sekwencyjne: `useShow`, `STEP_MS`, `ROLL_MS`.
- Czekanie spokojne (nieruchoma kropka), bez `animate-pulse`/`animate-ping`; ostatnie 10 s to sam kolor `warning`.
- Reduced motion: CSS wyłączone, JS sprawdza `reducedMotion`; wyjątki: ruch będący zadaniem (Kubki, Śledzenie, Wieża, Za zasłoną),
  `float-still`, klatka bazowa podglądu. Pomiar czasu nigdy nie zależy od animacji; bodziec bez przejścia.
- Odsłona prawdy bez animacji (Mapa, Odcień, Kropki, Kąt, Rok, Środek, Tort, Nożyczki, litera Kalamburów). Zastany stan po
  wejściu/odświeżeniu bez animacji (`useFresh`). Zaznaczenie w grze na czas od razu (pierścień 2 px koloru gracza).

## Wibracje (`VIBRATE` w `vibrate.ts`, zawsze `navigator.vibrate?.(...)`)
| Zdarzenie | Wzór |
|---|---|
| moja nowa decyzja (robi `Game.tsx` z `decisionKey`) | 40 |
| rzeczywista pomyłka (falstart, złe pole) | 60 |
| szkoda od innego gracza (zbicie, trafienie floty, wykup pola, STOP) | [60, 40, 60] |
| uderzenie metronomu Rytmu | 30 |
| ruch zignorowany bez kary, legalne pudło w grze turowej, poprawne trafienie | bez wibracji |
Szkoda wibruje raz na zdarzenie (`useHarm`), zastana nie. Połowa rysowania Kalamburów nie jest nową decyzją.

# 02-05: gry główne turowe (wygląd, teksty, animacje, wibracje)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23/24. Kryteria 1-5 fazy 2 dla `piec-w-rzedzie`, `statki`, `chinczyk`, `labirynt`, `memory`.
Repo bez zmian (poza `.planning/`).

## Metoda

- Pliki przeczytane w całości: `apps/web/src/games/PiecWRzedzie.tsx` (129 linii), `Statki.tsx` (540), `Chinczyk.tsx` (313), `Labirynt.tsx` (239), `Memory.tsx` (123),
  do tego `screens/Game.tsx` (nagłówek, pigułki graczy, `Countdown`, `OverActions`), `Screen` i `StickyBar` w `screens/ui.tsx`, klasy i keyframes w `index.css`.
  Reguły: `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md`; sekcje gier w `ZASADY-GIER.md` (§2 :568, §3 :575, §4 :600, §7 :743, §10 :825) i `KONCEPT.md` §2.3, §2.3a, §2.3b, §2.3d.
- Dowód z grepa: wiersze z `02-01-CHECKS.md` (cytowane jako „CHECKS §n”); wzorce platformy: punkty B-xx / W-xx z `02-02-BASELINE.md` (D-10).
  Nagłówek, pigułki graczy, pasek limitu, wibracja tury i „Rewanż” / „Do lobby” należą do `Game.tsx` (plan 02-04); tu tylko odsyłam, gdy wpływają na te gry.
- **360×640 sprawdzono statycznie (D-09)**, bez przeglądarki i bez serwerów dev. Wysokość liczona z klas Tailwinda w px:
  `Screen` `pt-6` + `pb-6` (48), odstęp `gap-3` (12), nagłówek `Game.tsx:233` jako `tile p-4` (obrys 2 + wnętrze 32) z `h1 text-xl` (28), `gap-3`, `Countdown` (20), `gap-3`
  i pigułkami `min-h-9` (36 na wiersz, `gap-2` między wierszami). Szerokość pigułki: `px-3` + kropka 10 + `gap-2` + nick i „(ty)” (Satoshi 14 px, około 7 px na znak) + wartość
  (puchar i „wygrane” około 77 px, pionki Chińczyka 52 px, „ściany” około 50 px, para Memory około 10 px). Wnętrze nagłówka ma 296 px (328 − 32).
  Z tego: przy dwóch graczach o typowych nickach (6-8 znaków) pigułki Gomoku, Chińczyka i Labiryntu łamią się na dwa wiersze (nagłówek 186 px), Memory zwykle mieści dwie w wierszu (142 px),
  Statki w partii mają pigułki `w-full` (`Game.tsx:266`), więc zawsze wiersz na gracza (186 px).
  `StickyBar` (`ui.tsx:252`) to `pt-2` + treść + `pb-3`; jest `sticky bottom-0`, więc przy wyższym ekranie zostaje pod kciukiem, ale **przykrywa dół planszy** (tło `bg/90`), aż gracz przewinie.
- Wagi wg D-07. Klucze zbiorcze: istniejące z CHECKS/BASELINE (`dotyk-48`, `cien`, `promien`, `kolor-spoza-tokenow`, `liczby-mono`, `animate-tailwind`, `ring-pulse-czas`, `keyframes-poza-5`)
  i nowe (lista na końcu).

## Wpisy wspólne dla grupy

#### Z1. Gry główne wyższe niż 640 px w trakcie partii `[zbiorcze: wysokosc-640]`
- Miejsce: `PiecWRzedzie.tsx:42` (plansza `-mx-3`, 352 px), `Statki.tsx:288-337` (rozstawianie), `Statki.tsx:127-139` (bitwa), `Chinczyk.tsx:206` (plansza 328 px) z `:259`,
  `Labirynt.tsx:124` (plansza 352 px) z `:186-236`, `Memory.tsx:60`; nagłówek `Game.tsx:233-338`.
- Wysokość (statycznie, dwóch graczy, typowe nicki; szczegóły w sekcjach gier): Gomoku 686 px (koniec partii 698), Statki rozstawianie około 800, bitwa (moja tura) około 960,
  obrona około 875, Chińczyk 684 (4 graczy do 772), Labirynt w swojej turze 742 (4 graczy 830; poza turą 598), Memory Średnia 651 (pigułki w dwóch wierszach 695).
  `DESIGN.md` §6 zna tylko rozstawianie Statków (około 770) i Gomoku (około 670); Chińczyk, Labirynt, Memory i bitwa w Statkach są nowe, a `DESIGN.md` §6 twierdzi, że „pozostałe ekrany mieszczą się w 640 px”.
- Źródło: `ZASADY.md` §4 Reguły („Ekran mieści się na 360×640”), `AGENTS.md` (UI: 360×640). Waga: **wysoka** (D-07; dla Gomoku i Statków z dopiskiem „znane z `DESIGN.md` §6”, D-05).
  Łagodzi to `StickyBar`: główna akcja zostaje widoczna, ale przykrywa 45-130 px dołu planszy (w Labiryncie dokładnie własny pionek na starcie, bo plansza jest obrócona startem w dół).
- Propozycja (faza 4/5): zmniejszyć wspólny nagłówek gier głównych w trakcie partii (pigułki w jednym przewijanym albo zwijanym wierszu jak `GameDots` w mini-grach, pasek limitu w wierszu tytułu),
  co samo zabiera 44-130 px; potem per gra (sekcje niżej). Po poprawce poprawić `DESIGN.md` §6. Pomiar potwierdzić w przeglądarce (Playwright 360×640, D-09).

#### Z2. Kolor gracza jedynym sygnałem właściciela na planszy `[zbiorcze: kolor-gracza-jedyny-sygnal]`
- Miejsce: kamienie `PiecWRzedzie.tsx:68-73`, pionki `Chinczyk.tsx:217-222`, pionki `Labirynt.tsx:166-170`, zebrane pary `Memory.tsx:92-99`; etykiety bez właściciela:
  `PiecWRzedzie.tsx:62` („Pole 3, 4, zajęte”), `Memory.tsx:74` („Karta 5, jabłko”), pionki Chińczyka bez etykiety poza ruchomymi (`:248`), plansza Labiryntu jako jeden `role="img"` (`Labirynt.tsx:132`).
- Źródło: `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem”. Waga: **średnia** (po jednej na grę: G4, C4, L4, M4 odsyłają tutaj). Gracze sami wybierają kolor w lobby,
  więc zielony `#46a758` i turkusowy `#0ac5b3` mogą grać razem w Gomoku albo Chińczyku. Statki są bez wpisu: plansze mają podpis z nickiem (`Statki.tsx:473`).
- Propozycja (decyzja fazy 4): albo drugi znak (inicjał z `initials` na pionku / kamieniu, jak w `GameDots`, albo wzór na kamieniu drugiego gracza) i nick w `aria-label`,
  albo świadomy wyjątek w `DESIGN.md` §6 („pionki i kamienie: kolor gracza wystarcza, gracze wybierają różne kolory”) plus nick w `aria-label` (to drugie jest tanie w każdym wariancie).

#### Z3. Animacja pojawienia powtarza się po odświeżeniu `[zbiorcze: animacja-po-odswiezeniu]`
- Miejsce: `PiecWRzedzie.tsx:69` (ostatni kamień), `Statki.tsx:373` (ostatni strzał w każdą planszę), `Labirynt.tsx:151` (ostatnia ścianka), `Memory.tsx:104` (wszystkie zebrane pary naraz).
  Klasa `stone-pop` zależy od stanu (`last`, `fresh`, `owner`), nie od zmiany, więc po zamontowaniu ekranu (odświeżenie, powrót do karty, wejście obserwatora) animacja gra jeszcze raz.
- Źródło: `ZASADY.md` §5 „przy dużym skoku (odświeżenie, powrót do karty) element od razu ląduje na miejscu”. Waga: **niska** (350 ms, nie blokuje; w Memory przy 18 parach miga cała plansza).
- Propozycja: animować tylko element, który zmienił się po zamontowaniu (ref z poprzednim `lastMove` / liczbą par, jak `useRolling` w `Chinczyk.tsx:58-70`).

#### Z4. „Czekamy na rywala” animowane na dwa sposoby `[zbiorcze: czekamy-animacja]` (do B-50 `animate-tailwind`)
- Miejsce: kropka z `animate-pulse` w `PiecWRzedzie.tsx:122` i `Statki.tsx:276`, kropka z `animate-ping` (fala) w `Memory.tsx:116`; ta sama sytuacja („rywal się zastanawia”).
  Dowód: CHECKS §11a (`PiecWRzedzie.tsx:122`, `Statki.tsx:276`, `Memory.tsx:116`).
- Źródło: `ZASADY.md` §5 „Ta sama sytuacja w nowej grze używa tej samej animacji”, „Mechanizm: keyframes w `index.css` z komentarzem”. Waga: **średnia** (różne animacje tej samej sytuacji);
  brak keyframes z komentarzem to już B-50 (niska), tu nie powtarzam.
- Propozycja: jedna animacja „czekamy” (keyframes w `index.css` z komentarzem i wierszem w §5) albo nieruchoma kropka; Memory na to samo co Gomoku i Statki.

## Gomoku (`piec-w-rzedzie`)

Ekran: `PiecWRzedzie.tsx`, przed partią `Setup.tsx` (02-03). Brak `Intro` słusznie (gra główna). Gra nie wibruje i nie ma animacji z JS.

### Wygląd (UI-01, UI-02, UI-03)

#### G1. Ekran wyższy niż 640 px (znane z `DESIGN.md` §6) → Z1
- Miejsce: `PiecWRzedzie.tsx:42-105`, `:108-118`. Pomiar: 24 + nagłówek 186 + 12 + plansza 352 (`-mx-3` daje 352 px szerokości, `p-1.5` i obrys, plansza kwadratowa)
  + 12 + `StickyBar` 76 (`h-14`) + 24 = **686 px** (z nickami po 3 znaki pigułki w jednym wierszu: 642). Koniec partii: nagłówek bez paska 154 + plansza 352 + `OverActions` (`pt-4`, dwa `.btn`) 120 → **698 px**,
  „Rewanż” poniżej krawędzi. W turze `StickyBar` przykrywa około 46 px, czyli dwa dolne wiersze planszy.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **wysoka** (znane z `DESIGN.md` §6, zmierzone na nowo: 686 zamiast około 670). Propozycja: Z1; w samej grze przycisk „Postaw” w wierszu z napisem stanu zamiast osobnego `StickyBar` niewiele da, bo plansza ma już całą szerokość.

#### G2. Pole planszy około 22 px `[zbiorcze: dotyk-48]`
- Miejsce: `PiecWRzedzie.tsx:58-66` (przycisk pola w siatce 15×15). Szerokość pola: (352 − 2 − 12) / 15 ≈ 22,5 px. Łagodzi to dwukrokowe stawianie (`:15-18`, `:65`): pierwsze dotknięcie pokazuje kamień i celownik wiersza i kolumny (`:53-56`), drugie albo „Postaw” go stawia.
- Źródło: `ZASADY.md` §4 Reguły („Pola dotykowe co najmniej 48 px”), `AGENTS.md`. Waga: **średnia** (D-07), w praktyce niska dzięki potwierdzeniu.
- Propozycja: wpisać do `DESIGN.md` §6 wyjątek „gęsta plansza (Gomoku 15×15, Statki, Chińczyk, Labirynt 9×9): pole poniżej 48 px, gdy ruch ma podgląd i potwierdzenie”; to samo dotyczy S2, C2, L2.

#### G3. `white` i czarny cień w kamieniu `[zbiorcze: kolor-spoza-tokenow]`, `[zbiorcze: cien]`
- Miejsce: `PiecWRzedzie.tsx:71` (`color-mix(... 70%, white)`, rozjaśnienie kamienia: nowe, CHECKS §1 go nie złapał, bo szuka `rgb(`/hex), `:72` (`0 1px 2px rgb(0 0 0 / 0.6)` pod każdym kamieniem i poświata `0 0 10px 2px` kamieni zwycięskiej linii; CHECKS §1 i §3, `PiecWRzedzie.tsx:72`).
- Źródło: `DESIGN.md` §2 (kolory tylko z tokenów; cień tylko pod oknami i pionkami Kampus Tour i w `set-glow`), `ZASADY.md` §4. Waga: kolor **średnia**, cień i poświata **niska**.
- Propozycja: `var(--color-fg)` zamiast `white`, `var(--color-bg)` w cieniu; cień pod kamieniem dopisać do `DESIGN.md` §2 obok pionków Kampus Tour (kamień też „leży nad planszą”) albo usunąć;
  poświatę zwycięskiej linii zastąpić `set-glow` (świeże osiągnięcie, cień dozwolony).

#### G4. Kamienie różni tylko kolor → Z2
- Miejsce: `PiecWRzedzie.tsx:68-73`, `aria-label` bez właściciela `:62`. Waga: **średnia**. Propozycja: Z2 (nick w `aria-label`: „Pole 3, 4: Ola”).

Zgodne: akcja w partii „Postaw” jako `btn text-bg` w kolorze gracza (`:109-117`, `DESIGN.md` §5, W-05), nieaktywna z podpisem „Wybierz pole” (`DESIGN.md` §4); żadnego `btn-primary`;
zaokrąglenia `rounded-inset` (10 px) i `rounded-full`; punkty orientacyjne w `fg-subtle` (nieistotny detal, `DESIGN.md` §2) z `aria-hidden` (`:81`); celownik z mieszanki tokenów (`:56`);
`onClick` na polu jest poprawny, bo gra nie mierzy czasu (W-13 nie dotyczy); siatka `minmax(0, 1fr)` (`:47`), SVG z `viewBox` (`:88`); `-mx-3` daje 352 px przy 360 px ekranu, bez przewijania w poziomie.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Bez rozbieżności poza Z2 (`aria-label` bez właściciela). Teksty po polsku, bez em-dashy i liczb dziesiętnych; „Wybierz pole”, „Postaw”, „{nick} się zastanawia…” (`:116`, `:123`).
  Stan pusty / czekania jednym zdaniem w `fg-muted` z `role="status"` (`:121`). Liczb nad planszą brak (W-01). Słowa platformy daje `Game.tsx`. Linia zwycięstwa ma `aria-hidden` (`:88`); remis bez linii, status „Remis” z `Game.tsx:197`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| `plik:linia` | Animacja | Ocena |
|---|---|---|
| `:69` | `stone-pop` 0,35 s `ease-out` na ostatnim kamieniu + obrys `fg` | zgodne (B-37, tabela §5 „pojawienie 350 ms”); po odświeżeniu gra jeszcze raz → Z3 (niska) |
| `:78` | `animate-pulse` w podglądzie niepostawionego kamienia | B-50 `[zbiorcze: animate-tailwind]` (niska), sytuacja „wybrane, jeszcze nie zatwierdzone” nie ma odpowiednika w §5; bez osobnego wpisu |
| `:100` | `line-draw` 0,5 s `ease-out backwards` na zwycięskiej linii | B-38 `[zbiorcze: keyframes-poza-5]` (niska, brak w liście §5 i w tabeli czasów); bez osobnego wpisu |
| `:122` | `animate-pulse` kropki „się zastanawia” | → Z4 (średnia) |

`setTimeout` / `requestAnimationFrame` / `startViewTransition`: brak, więc nic do `reducedMotion`; wszystkie animacje są w CSS i obejmuje je reguła globalna (B-51).
Nic nie blokuje ruchu: przycisk działa od razu, nowy stan z serwera podmienia klasy. Wibracje: brak w pliku; moja tura tylko z `Game.tsx:35` (40), pomyłek nie ma (pole zajęte jest `disabled`). Zgodne z W-09.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (kamień) | `stone-pop` 0,35 s `ease-out` + obrys `fg` ostatniego ruchu | brak | „Postaw” (wcześniej „Wybierz pole”) |
| wybór pola (podgląd) | `animate-pulse` (Tailwind, 2 s ∞) w obwódce koloru gracza | brak | „Postaw” |
| moja tura | poświata tła i tytuł w kolorze gracza (`Game.tsx`) | 40 (`Game.tsx:35`) | - |
| czekanie na rywala | kropka `animate-pulse` | brak | - |
| koniec partii | `line-draw` 0,5 s + poświata kamieni linii; `title-pop` 0,5 s u zwycięzcy (`Game.tsx:243`) | brak | „Rewanż”, „Do lobby” (`Game.tsx`) |
| trafienie, pomyłka, odsłona wyniku, koniec rundy, zbicie | nie występują | - | - |

## Statki (`statki`)

Ekran: `Statki.tsx` (rozstawianie `Placement` :177, bitwa `Battle` :342, plansza `Grid` :437, flota w pigułce `FleetLeft` :147 używana w `Game.tsx:291`).

### Wygląd (UI-01, UI-02, UI-03)

#### S1. Rozstawianie i bitwa wyższe niż 640 px (rozstawianie znane z `DESIGN.md` §6) → Z1
- Miejsce: `Statki.tsx:288-337`, `:127-139`, `:381-419`; pigułki `w-full` `Game.tsx:266`.
- Pomiar (plansza ma tę samą wysokość w każdym trybie, bo pola są kwadratowe i dzielą tę samą szerokość: 294 px pól + wiersz liter około 18 + `p-1.5` i obrys 14 ≈ 326 px):
  - rozstawianie: 24 + nagłówek 186 + 12 + podpis 28 + plansza 326 + podpowiedź 40 (dwa wiersze) + „Obróć” / „Losuj” 48 + `StickyBar` „Gotowe” 76 + trzy odstępy 36 + 24 ≈ **800 px** (`DESIGN.md` §6: około 770);
    „Obróć” i „Losuj” są pod krawędzią, aż gracz przewinie;
  - bitwa, moja tura: komunikat 36 + duża plansza z podpisem 354 + `StickyBar` 88 + mała plansza 222 + nagłówek 186 + marginesy ≈ **960 px**; `StickyBar` przykrywa około 60 px dołu celu (dwa wiersze);
  - obrona: około **875 px**; tu nic nie trzeba dotykać.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **wysoka** (rozstawianie znane z `DESIGN.md` §6, zmierzone na nowo; bitwa nowa).
- Propozycja: poza Z1: w bitwie mała plansza obok komunikatu albo zwijana (jest tylko podglądem), podpowiedź rozstawiania w jednym wierszu, „Obróć” i „Losuj” w `StickyBar` obok „Gotowe”.

#### S2. Pola 24-37 px w rozstawianiu i bitwie `[zbiorcze: dotyk-48]`
- Miejsce: `Statki.tsx:510-530`; szerokość pola: (328 − 14 − 20 na kolumnę liczb) / rozmiar = 36,8 px (8×8), 29,4 px (10×10), 24,5 px (12×12). Mała plansza (14-17 px) jest nieinteraktywna.
  W bitwie strzał ma podgląd i potwierdzenie („Strzel w B5”, `:402`, `:415`); w rozstawianiu dotknięcie od razu przenosi statek (`:228`), ale błąd da się cofnąć kolejnym ruchem.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **średnia**. Propozycja: jak G2 (wyjątek w `DESIGN.md` §6 dla gęstych plansz z potwierdzeniem).

#### S3. Akcent jako „niedozwolone” w rozstawianiu (poza wyjątkiem `DESIGN.md` §6)
- Miejsce: strefa zakazana `Statki.tsx:294` (`accent-soft`, CHECKS §2 `Statki.tsx:294`), duch niedozwolonej pozycji i przeciągany statek w złym miejscu `:266`, `:269` (`hull(RED, true)`, `RED` = `accent`, `:174`), tekst „Czerwone pola są za blisko innych.” `:299`.
- Źródło: `DESIGN.md` §6 (wyjątek obejmuje tylko „trafienie i zatopiony statek”), §5 „Kolor znaczy: `warning`: problem”, §2 (rola `warning`: pomyłka, błąd). Waga: **średnia** (token w złej roli, D-04).
- Propozycja: strefa zakazana i duch w `warning` (tło `color-mix` `warning` 12%), tekst „Te pola są za blisko innych.” (nie nazywać koloru); akcent zostaje dla trafień.

#### S4. Poświata zaznaczonego statku i promień 1 px w pigułce floty `[zbiorcze: cien]`, `[zbiorcze: promien]`
- Miejsce: `Statki.tsx:44` (`boxShadow: 0 0 12px` przy `solid`), `:165` (`rounded-[1px]` segmentów floty). CHECKS §3.
- Źródło: `DESIGN.md` §2 (cień, zaokrąglenia 20 / 10 / 999 px). Waga: **niska**. Propozycja: zaznaczenie samym obrysem `outline-fg` (już jest, `:500`), segmenty `rounded-none` albo dopisać 1 px do wyjątków.

#### S5. Podpisy plansz w pogrubionym Satoshi `[zbiorcze: podpis-label]`
- Miejsce: `Statki.tsx:473` (`h2 font-semibold text-sm`/`text-xs` w kolorze właściciela: „Twoja flota · Klasyczny”, „Cel: Ola”).
- Źródło: `DESIGN.md` §5 „Podpis to `.label` … nigdy pogrubiony Satoshi”. Waga: **niska**. Propozycja: `.label` z `style={{ color }}` (kolor właściciela zostaje).

Zgodne: trafienie (`Fire` w `text-accent`, `:396`) i zatopiony statek (`hull(RED)`, `:390`) oraz trafione segmenty floty (`:165`) to wyjątek `DESIGN.md` §6 (lista odstępstw);
„Gotowe” i „Strzel w …” jako `btn text-bg` w kolorze gracza (`:324-335`, `:407-416`), „Obróć”, „Losuj”, „Zmień ustawienie” jako `btn-ghost` (W-05, W-06); pudło to kropka, trafienie płomień, zatopienie czaszka w komunikacie (`:86-89`): kształt, nie tylko kolor;
komunikat o strzale przeciwnika w jego kolorze („czyjeś”, `:131`); X wokół zatopionego w `fg-subtle` (`:399`, nieistotny detal: pola są i tak `disabled`); siatka `minmax(0, 1fr)` z kolumną 1,25 rem / 0,9 rem (CHECKS §6 `Statki.tsx:478`), bez przewijania w poziomie;
plansza rozstawiania ma `touch-none select-none` i zdarzenia wskaźnika (`:477-482`) dla przeciągania; bitwa bez `touch-none` jest w porządku (gra nie mierzy czasu).
Limit 90 s rozstawiania i licznik pokazuje `Game.tsx:250-256` (`def.turn`); „Zmień ustawienie” (cofnięcie gotowości) jest zawsze widoczne u gotowego (`:279`), zgodnie z `ZASADY-GIER.md` §3.

### Teksty, liczby i dostępność (UI-04, UI-05)

#### S6. Etykiety pól bez stanu strzału, własna plansza jako `span` z `aria-label` `[zbiorcze: aria-plansza]`
- Miejsce: `Statki.tsx:523` (przycisk: tylko „B5”, bez „trafienie” / „pudło”; ikony mają `aria-hidden`), `:532` (`span` bez roli z `aria-label`: czytniki zwykle go pomijają), `:397` kropka pudła bez `aria-hidden` (w przycisku z `aria-label` bez skutku).
- Źródło: `ZASADY.md` §4 („Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`”). Waga: **niska**.
- Propozycja: `aria-label={`${name}: trafienie`}` itd. i `role="img"` (albo `role="gridcell"`) na polach własnej planszy.

Poza tym bez rozbieżności: teksty po polsku, bez em-dashy i kropek dziesiętnych; strzałka „→” w komunikacie (`:86-89`) to nie myślnik; opisy osi w mono (`:467`);
liczby nad planszą tylko flota w pigułce `Game.tsx` (`FleetLeft` ma `aria-label` „Statki na wodzie: 3 z 5”, `:161`); stan czekania jednym zdaniem z `role="status"` (`:275-277`); „Obróć” nieaktywne bez zaznaczonego statku, podpowiedź pod planszą mówi, co zrobić (`:299`).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

#### S7. Trafienie w moją flotę bez wibracji; pudło strzelającego też bez `[zbiorcze: wibracja-zlo-od-gracza]`
- Miejsce: `Statki.tsx:81-89` (komunikat „Trafienie!” / „Zatopiony!” o strzale przeciwnika liczony z `lastShot`, bez `navigator.vibrate`). Jedyna wibracja w pliku to `:211` (60 przy niedozwolonym ustawieniu).
  Po trafieniu przeciwnik strzela dalej, więc broniący nie dostaje też wibracji tury (`Game.tsx:35`): seria trafień przechodzi bez żadnego sygnału, gdy telefon leży.
- Źródło: `ZASADY.md` §5, tabela wibracji („coś złego dla mnie od innego gracza (zbity pionek): [60, 40, 60]”; wzór: `Chinczyk.tsx:135`). Waga: **średnia**.
- Propozycja: `navigator.vibrate?.([60, 40, 60])` u właściciela planszy, gdy nowy `lastShot` ma wynik `hit` albo `sunk` (raz na strzał, ref jak `buzzed` w `Chinczyk.tsx:131`).
  Pudło strzelającego (60 jak pomyłka?) rozstrzygnąć w fazie 4 razem z M5, żeby obie gry z „pudłem” działały tak samo.

| `plik:linia` | Animacja / timer / wibracja | Ocena |
|---|---|---|
| `:69-73` | `startViewTransition` zamiany plansz, `setTimeout(swap, SWAP_MS)` 1200 ms po pudle | zgodne: `reducedMotion` sprawdzone (`:48`, `:69`), brak API → od razu; opóźnienie to wyjątek `ZASADY.md` §5 (odstępstwo); start bitwy, koniec partii i odświeżenie zamieniają od razu (`:63`, `:72`); 350 ms `ease-out` w `index.css:354-358` (B-49) |
| `:213` | `setTimeout(() => setGhost(null), 600)` | zgodne: to czas pokazania błędu, nie ruch, więc bez `reducedMotion`; uwaga bez wagi: timer nie jest czyszczony, więc szybki drugi błąd gaśnie wcześniej niż po 600 ms |
| `:211` | `navigator.vibrate?.(60)` przy niedozwolonym ustawieniu | zgodne (pomyłka 60, z `?.`; CHECKS §15) |
| `:276` | `animate-pulse` kropki „Czekamy, aż … ustawi flotę” | → Z4 / B-50 |
| `:373` | `stone-pop` 0,35 s `ease-out` na najświeższym strzale | zgodne (B-37); po odświeżeniu znowu → Z3 |
| `:500` | `transition-colors duration-100` kształtu statku | zgodne (reakcja na dotyk 100 ms) |

Nic poza `SWAP_MS` nie blokuje ruchu; przeciąganie nie czeka na animację. Pomiaru czasu brak.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (strzał na planszy) | `stone-pop` 0,35 s `ease-out` + obrys `fg` ostatniego strzału | brak | „Strzel w B5” (wcześniej „Wybierz pole”) |
| trafienie (moje) | płomień `stone-pop` 0,35 s | brak (zgodne) | „Strzel w …” (kolejny strzał) |
| trafienie w moją flotę (zło od innego gracza) | `stone-pop` 0,35 s na mojej planszy, komunikat | **brak** (S7) | - |
| pomyłka (niedozwolone ustawienie) | czerwony duch 600 ms (`accent`, S3) | 60 | „Gotowe” |
| pudło (zmiana tury) | stary układ 1,2 s (`SWAP_MS`), potem view transition 350 ms `ease-out` | brak (S7) | - |
| moja tura | `Game.tsx` | 40 (`Game.tsx:35`) | - |
| czekanie na rywala (rozstawianie) | kropka `animate-pulse` | brak | „Zmień ustawienie” |
| koniec partii | układ zamienia się od razu; `title-pop` u zwycięzcy (`Game.tsx`) | brak | „Rewanż”, „Do lobby” |
| odsłona wyniku, koniec rundy, zbicie | nie występują (zatopienie to „trafienie”) | - | - |

## Chińczyk (`chinczyk`)

Ekran: `Chinczyk.tsx`; wzorzec kroków sekwencyjnych z `ZASADY.md` §5 (`STEP_MS` :51, `ROLL_MS` :52, `useWalk` :76, `useRolling` :58).

### Wygląd (UI-01, UI-02, UI-03)

#### C1. Ekran wyższy niż 640 px (nowe, `DESIGN.md` §6 go nie wymienia) → Z1
- Miejsce: plansza `Chinczyk.tsx:206` (`tile aspect-square w-full`, 328 px), dolny obszar `:259-298`; komentarz `:255` sam przewiduje, że „plansza się nie mieści”.
- Pomiar: 24 + nagłówek 186 (dwie pigułki z pionkami w dwóch wierszach) + 12 + 328 + 12 + `StickyBar` około 98 (kafel z kostką 48 px i dwoma wierszami tekstu) + 24 = **684 px**;
  4 graczy: pigułki w 3-4 wierszach, **728-772 px**. `StickyBar` przykrywa około 45-130 px, czyli dolne domki i dolne ramię krzyża.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **wysoka**. Propozycja: Z1; poza tym kostka i tekst w jednym wierszu z przyciskiem „Rzuć” (dziś kafel `min-h-14` z trzema liniami).

#### C2. Pola planszy około 25 px `[zbiorcze: dotyk-48]`
- Miejsce: `Chinczyk.tsx:236-246` (przycisk pionka i celu); (328 − 2 − 16 − 10 × 3) / 11 ≈ 25,5 px. Ruch ma podgląd celu i drugie dotknięcie (`:125`, `:195`, `:235`).
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **średnia**. Propozycja: jak G2.

#### C3. Cel zbicia obrysowany w `warning`
- Miejsce: `Chinczyk.tsx:233` (`outline-warning`, gdy ruch zbija), tekst „Zbijesz pionek: Ola.” `:195`.
- Źródło: `DESIGN.md` §2 i §5 (`warning`: problem: czas, pomyłka, kara; „Kolor gracza: to czyjeś”), D-04 (token w innej roli). Waga: **średnia**.
  Dla ruszającego zbicie nie jest problemem; pionek, który wróci do domku, jest „czyjś”.
- Propozycja: obrys w kolorze ofiary (`color(capture)`), tekst zostaje; albo dopisać do `DESIGN.md` §2 rolę `warning` „ostrzeżenie przed skutkiem ruchu”.

#### C4. Pionki różni tylko kolor → Z2
- Miejsce: `Chinczyk.tsx:217-222`; pionki bez ruchu to `span` bez etykiety (`:248`). Waga: **średnia**. Domki startowe i końcowe w odcieniu gracza dają drugi, przestrzenny znak tylko w domkach, nie na torze.

#### C5. Promień 6 px mety `[zbiorcze: promien]`
- Miejsce: `Chinczyk.tsx:307` (`rounded-[6px]`, CHECKS §3). Źródło: `DESIGN.md` §2. Waga: **niska**. Propozycja: `rounded-inset` (10 px) albo bez zaokrąglenia (pole meta jest w środku krzyża).

Zgodne: `tint` w OKLCH i `mix` (`:44-46`) to pochodne koloru gracza i tokenów (CHECKS §1 `Chinczyk.tsx:46`: odcień z `PLAYER_COLORS`, nie nowy kolor; D-04); tor z mieszanki `fg`/`bg` (`:232`);
`boxShadow: inset 0 0 0 2px` na polu startowym (`:242`, `:248`) to obrys, nie cień (CHECKS §3); „Rzuć” jako `btn text-bg` w kolorze gracza (`:265-274`); siatka `minmax(0, 1fr)` (`:206`), SVG mety z `viewBox` (`:307`);
`onClick` jest w porządku (gra nie mierzy czasu, CHECKS §5a `Chinczyk.tsx:237`); brak `touch-none` też.
Pole startowe ma obwódkę i strzałkę kierunku (`:151`, `:228`); to, że jest bezpieczne, pokazuje tylko brak celu (C7).

### Teksty, liczby i dostępność (UI-04, UI-05)

#### C6. Liczniki w Satoshi `[zbiorcze: liczby-mono]`
- Miejsce: `Chinczyk.tsx:273` („(próba 2 z 3)” w przycisku, `font-normal`, CHECKS §8 `Chinczyk.tsx:273`), `:177` („Próba 2 z 3.”), `:289` („wyrzucasz 5”).
- Źródło: `DESIGN.md` §5 „Liczby są mono” (licznik), W-16. Waga: **niska**. Propozycja: liczby w `<span className="font-mono tabular-nums">`.

#### C7. Pionek zablokowany bez wyjaśnienia
- Miejsce: `Chinczyk.tsx:194` („Wybierz pionek.”) i `:213` (pionek bez ruchu po prostu nie pulsuje). Nie wiadomo, czy blokuje go własny pionek, przeskok w domku czy bezpieczne pole startowe rywala (`ZASADY-GIER.md` §4).
- Źródło: `DESIGN.md` §4 („Każdy stan, który coś blokuje, tłumaczy się podpisem”). Waga: **niska** (nie wpływa na grę, serwer i tak odrzuca).
- Propozycja: przy dotknięciu nieruchomego własnego pionka krótki tekst w miejscu podpowiedzi („Ten pionek nie ma ruchu: pole startowe Oli jest zajęte”).

Poza tym bez rozbieżności: teksty po polsku, bez em-dashy i kropek dziesiętnych, `aria-live="polite"` na dolnym obszarze (`:260`), kostka z `aria-label` (`:110`), puste domki z `aria-hidden` (`:211`), odstęp z `aria-hidden` (`:256`).
Pionki w domu pokazuje pigułka `Game.tsx:275-285` z `aria-label` (liczby nad planszą poza `Stats` to wzór platformy dla gier głównych, W-01 nie dotyczy).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

#### C8. Rzut i kroki blokują akcję do końca animacji (sprzeczne z §5, choć §5 wskazuje ten plik jako wzór)
- Miejsce: `Chinczyk.tsx:122-123` (`settled`, `myMove`), `:192` (podpowiedź dopiero po `settled`), `:201` (`rollNow` dopiero po `settled`). Przez `ROLL_MS` (700 ms) i do 6 kroków po `STEP_MS` (do 1080 ms), w trybie Szybkim 400 + 660 ms,
  przycisk „Rzuć” i wybór pionka nie istnieją, a limit tury (60 s, w Szybkim 20 s) biegnie. Nowy stan z serwera nie przerywa kroków, tylko dopisuje się do celu (`:76-93`).
- Źródło: `ZASADY.md` §5 „Animacja nie blokuje gry. Przyciski działają w trakcie, kolejny stan z serwera przerywa poprzednią animację”; ten sam §5 każe brać `Chinczyk.tsx` za wzór kroków. Waga: **wysoka** (D-07: „animacja blokująca ruch”), z dopiskiem: koszt to 0,4-1,8 s, a celem jest, żeby gracz widział wynik rzutu przed wyborem.
- Propozycja (decyzja fazy 4): albo dopisać do §5 wyjątek „kroki sekwencyjne: wybór czeka na koniec animacji (maks. `ROLL_MS` + 6 × `STEP_MS`)”, albo pozwolić na akcję od razu (dotknięcie w trakcie kończy animację: `setShown(target)`).

| `plik:linia` | Animacja / timer / wibracja | Ocena |
|---|---|---|
| `:51-54` | `STEP_MS` 180, `ROLL_MS` 700, `QUICK_STEP_MS` 110, `QUICK_ROLL_MS` 400 | tryb Klasyczny zgodny z tabelą §5 (krok 180-220 ms, rzut 700 ms); Szybki poza tabelą, ale `KONCEPT.md` §2.3a opisuje „szybsze animacje” (odstępstwo, lista na końcu) |
| `:64-67` | `setTimeout` końca turlania | zgodne: `reducedMotion` → bez turlania (`:64`); odświeżenie nie turla (`:59-63`) |
| `:86-89` | `setTimeout` kroku pionka | zgodne: `reducedMotion` i dalekie skoki (> 6, cofnięcia, zbicia) od razu (`:82`, `:86`) |
| `:100` | `setInterval` 90 ms losowych oczek w trakcie turlania (`Math.random` tylko w UI) | zgodne: działa tylko przy `rolling`, które przy `reducedMotion` nie występuje |
| `:108` | `dice-tumble` 0,3 s ∞ przez `ROLL_MS` | zgodne (B-42; razem 700 ms w Klasycznym) |
| `:219` | `ring-pulse` 1 s ∞ na pionku do wyboru | rola zgodna („to można wybrać”); czas 1 s wobec 1,2 s w Memory i „Rewanż” → B-36 `[zbiorcze: ring-pulse-czas]` (średnia, jeden wpis przy platformie) |
| `:135` | `navigator.vibrate?.([60, 40, 60])` u właściciela zbitego pionka, raz na rzut, po dojściu pionków (`:133`) | zgodne (tabela §5; CHECKS §15) |

Brak wibracji przy trzeciej szóstce i „Bez szóstki”: zgodne (to nie pomyłka gracza). Jedyny możliwy ruch robi serwer; ekran pokazuje go krokami i komunikatem (`:180-187`). Pomiaru czasu brak.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| rzut | `dice-tumble` 0,3 s ∞ przez 700 ms (Szybki 400 ms) + losowe oczka co 90 ms | brak | „Rzuć” („(próba 2 z 3)”) |
| pionki do wyboru („można wybrać”) | `ring-pulse` 1 s ∞ | brak | - (dotknięcie pionka, potem celu) |
| krok pionka | `setTimeout` 180 ms na pole (Szybki 110 ms) | brak | - |
| zbicie (mój pionek) | od razu do domku, po dojściu bijącego | [60, 40, 60] | - |
| zbicie (bijący) | obrys celu `warning` w podglądzie (C3), komunikat „Ola zbija: …!” | brak | - |
| moja tura | `Game.tsx` | 40 (`Game.tsx:35`) | „Rzuć” |
| koniec partii (pełny ranking) | brak w grze; `title-pop` u zwycięzcy, lista miejsc (`Game.tsx:402-413`) | brak | „Rewanż”, „Do lobby” |
| pojawienie elementu, trafienie, pomyłka, odsłona wyniku, koniec rundy | nie występują | - | - |

## Labirynt (`labirynt`)

Ekran: `Labirynt.tsx` (SVG z `viewBox`, plansza obrócona tak, że własny start jest na dole, `:20`, `:70`).

### Wygląd (UI-01, UI-02, UI-03)

#### L1. Ekran wyższy niż 640 px w swojej turze (nowe) → Z1
- Miejsce: plansza `Labirynt.tsx:124` (`-mx-3`, SVG 342 px + ramka = 352 px), `StickyBar` `:186-236` (przełącznik 48 + akcja 56 + odstępy, około 132 px); pigułki z „wygrane” i „ściany” (`Game.tsx:300-327`) mieszczą się po jednej w wierszu.
- Pomiar: 24 + nagłówek 186 + 12 + 352 + 12 + 132 + 24 = **742 px** (3 graczy 786, 4 graczy 830); poza turą (bez `StickyBar`) 598 px przy 2 graczach, 686 przy 4.
  `StickyBar` przykrywa około 66 px, czyli dwa dolne wiersze planszy, a tam na starcie stoi **własny pionek** i jego kropki kroku.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **wysoka**. Propozycja: Z1; przełącznik „Pionek / Ściana” i akcja w jednym wierszu (około 56 px zamiast 112).

#### L2. Pole kroku 36 px w trybie Klasycznym `[zbiorcze: dotyk-48]`
- Miejsce: `Labirynt.tsx:101-107` (krok od razu po puszczeniu palca na polu z kropką, bez potwierdzenia); pole 342 × 10 / 96 ≈ 35,6 px (9×9), 45 px (7×7). Ścianka ma podgląd, „Obróć” i „Postaw” (`:155-165`, `:214-232`), szczeliny nie trzeba trafiać (`wallAt`, `:40-53`): zgodne.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **średnia**. Propozycja: przy puszczeniu palca liczyć najbliższe dozwolone pole w promieniu 24 px (jak „Dotknięcie kafla wybiera najbliższy kubek” w Trzech kubkach), albo wyjątek jak G2.

#### L3. Możliwe kroki pulsują `animate-pulse`, a „można wybrać” ma `ring-pulse` `[zbiorcze: animate-tailwind]`
- Miejsce: `Labirynt.tsx:143` (CHECKS §11a). Ta sama sytuacja w Chińczyku (`:219`) i Memory (`:90`) to `ring-pulse`.
- Źródło: `ZASADY.md` §5 („Najpierw istniejące: `ring-pulse` (to można wybrać)”, „Ta sama sytuacja … tej samej animacji”). Waga: **średnia** (inna animacja tej samej sytuacji; brak keyframes z komentarzem już w B-50).
- Propozycja: kropka z obwódką i `ring-pulse` (np. `circle` ze `stroke` i pulsującym promieniem w nowym keyframes) albo nieruchome kropki.

#### L4. Pionki różni tylko kolor → Z2
- Miejsce: `Labirynt.tsx:166-170`; własny pionek ma kreskę „to ja” (`:173-182`), na ruchu biały pierścień (`:169`), ale rywale przy 3-4 osobach różnią się tylko kolorem; plansza to jeden `role="img"` (`:132`). Waga: **średnia**.

Zgodne: ścianki w kolorze stawiającego, mety i pionki w kolorze gracza (`:137`, `:150`, `:169`); podgląd ścianki: kolor gracza, `fg-muted` przy „Zajęte”, `warning` przy „Zamyka drogę”
z napisem na przycisku i obrysem zamiast wypełnienia (`:120`, `:225-230`, kolor nie jest jedynym sygnałem); „Postaw” jako `btn text-bg` w kolorze gracza (`:223-226`);
przełącznik dwóch stanów z `aria-pressed` i zaznaczeniem w kolorze gracza zamiast akcentu (`:190-203`, `DESIGN.md` §5: partia ma kolor gracza); „Ściana (0)” nieaktywna z liczbą w podpisie;
`rx` w jednostkach `viewBox` (CHECKS §3: nie px); `touch-none select-none` i zdarzenia wskaźnika na SVG (`:127-131`); 352 px przy 360 px ekranu bez przewijania w poziomie.
Liczba ścianek nie jest w `Stats`: pokazuje ją pigułka gracza w `Game.tsx:320-327` (mono, `tabular-nums`, `aria-label`) i przycisk „Ściana (N)”; to wzór pigułek gier głównych, nie rozbieżność (W-01 dotyczy mini-gier ze `Stats`).

### Teksty, liczby i dostępność (UI-04, UI-05)

#### L5. Plansza niedostępna dla czytnika i klawiatury `[zbiorcze: aria-plansza]`
- Miejsce: `Labirynt.tsx:132-133` (`role="img"`, `aria-label="Plansza labiryntu"`): pozycje pionków, ścianek i dozwolonych kroków nie mają tekstu, krok da się zrobić tylko wskaźnikiem.
- Źródło: `ZASADY.md` §4 (dostępność: `aria-label`). Waga: **niska**. Propozycja: `aria-label` opisujące pozycję własnego pionka i liczbę kroków albo ukryta lista przycisków kroków („Krok w górę”).

#### L6. Liczba ścianek w przycisku w Satoshi `[zbiorcze: liczby-mono]`
- Miejsce: `Labirynt.tsx:201` („Ściana (5)”). Źródło: `DESIGN.md` §5. Waga: **niska**. Propozycja: liczba w `font-mono tabular-nums`.

Poza tym bez rozbieżności: teksty po polsku, bez em-dashy i liczb dziesiętnych; „Dotknij pola z kropką”, „Dotknij krawędzi pola”, „Zajęte”, „Zamyka drogę”, „Postaw”, „Obróć”; „Nie masz kroku, czekam” (`:208`) to `pass` z `ZASADY-GIER.md` §10; kreska „to ja” ma `aria-hidden` (`:181`).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| `plik:linia` | Animacja | Ocena |
|---|---|---|
| `:143` | `animate-pulse` dozwolonych kroków | → L3 (średnia) i B-50 |
| `:151` | `stone-pop` 0,35 s `ease-out` ostatniej ścianki (`transformBox: fill-box`) | zgodne (B-37); po odświeżeniu znowu → Z3 |
| `:167` | `transition-transform duration-200 ease-out` pionka | zgodne (krok pionka 180-220 ms; przeskok też 200 ms); reguła globalna obejmuje przejście (B-51) |
| `:181` | `transition-all duration-200 ease-out` kreski „to ja” | zgodne (idzie razem z pionkiem) |

`setTimeout` / `requestAnimationFrame`: brak, więc nic do `reducedMotion`. Nic nie blokuje ruchu. Wibracje: brak w pliku; złej ścianki nie da się postawić (przycisk `disabled` z powodem), więc nie ma pomyłki do wibracji; moja tura z `Game.tsx`. Zgodne z W-09.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| możliwe kroki („można wybrać”) | `animate-pulse` (L3) | brak | „Pionek” (przełącznik), „Dotknij pola z kropką” |
| krok pionka | przejście `transform` 200 ms `ease-out` | brak | - |
| pojawienie elementu (ścianka) | `stone-pop` 0,35 s `ease-out` | brak | „Postaw” |
| zła ścianka | podgląd `warning` / `fg-muted`, przycisk z powodem, bez animacji | brak | „Zamyka drogę”, „Zajęte” |
| moja tura | biały pierścień pionka, `Game.tsx` | 40 (`Game.tsx:35`) | - |
| koniec partii | brak w grze; `title-pop` u zwycięzcy (`Game.tsx`) | brak | „Rewanż”, „Do lobby” |
| trafienie, pomyłka, odsłona wyniku, koniec rundy, zbicie | nie występują | - | - |

## Memory (`memory`)

Ekran: `Memory.tsx`; licznik par w pigułce `Game.tsx:286-289`.

### Wygląd (UI-01, UI-02, UI-03)

#### M1. Tryb Średni (domyślny) około 650 px (nowe; komentarz `:55` twierdzi, że się mieści) → Z1
- Miejsce: `Memory.tsx:55-60`, `:75` (4 kolumny × 6 rzędów, karty `aspect-5/4`). Karta (328 − 24) / 4 = 76 × 60,8 px; plansza 6 × 60,8 + 5 × 8 = 405 px.
- Pomiar: 24 + nagłówek 142 (dwie pigułki w wierszu) + 12 + 405 + 12 + status 32 (`h-8`) + 24 = **651 px**; przy pigułkach w dwóch wierszach (długie nicki, 3+ graczy) **695 px**. Koniec partii: 707 px („Do lobby” pod krawędzią).
  Mała (4×4) 574 px i Duża (6×6, karta 48 px) 574 px przy 2 graczach mieszczą się; Duża przy 6 graczach (pigułki w 3 wierszach) około 662.
- Źródło: `ZASADY.md` §4, `AGENTS.md`. Waga: **wysoka** (D-07; przekroczenie o 11 px przy dwóch graczach, do potwierdzenia w przeglądarce, bo zależy od szerokości nicków i czcionki).
- Propozycja: Z1; w grze `aspect-[4/3]` dla trybu Średniego (plansza 366 px) albo status w wierszu nagłówka.

#### M2. Poświata karty „w grze” `[zbiorcze: cien]`
- Miejsce: `Memory.tsx:98` (`boxShadow: 0 0 14px …`, CHECKS §3). Źródło: `DESIGN.md` §2. Waga: **niska**. Propozycja: sam obrys `ring-pulse` (już jest, `:90`) bez poświaty.

#### M3. Rewers przygaszony do 45% poza moją turą
- Miejsce: `Memory.tsx:81-83` (`opacity-45`). Źródło: `DESIGN.md` §4 (przygaszony 60%, nieaktywny 40%, z podpisem). Waga: **niska** (podpis daje status „Ola szuka pary…”, `:118`).
- Propozycja: `opacity-40` (karta jest `disabled`, czyli nieaktywna) albo `opacity-60`.

#### M4. Zebrane pary różni tylko kolor → Z2
- Miejsce: `Memory.tsx:92-99`, `aria-label` bez właściciela `:74`. Waga: **średnia**. Liczbę par każdego gracza podaje pigułka `Game.tsx:287`, ale nie, które karty są czyje.

Zgodne: siatka `minmax(0, 1fr)` (CHECKS §6 `Memory.tsx:60`), karty co najmniej 48 px (`min-h-12`, Duża ma dokładnie 48 px), `onClick` (gra nie mierzy czasu, CHECKS §5a `Memory.tsx:70`),
rewers z mieszanki tokenów i ikona w `fg-subtle` (ozdoba, `aria-hidden` na rodzicu `:84`; CHECKS §9 `Memory.tsx:86` jest więc zgodny), zebrane pary w kolorze właściciela przygaszone do 60% (`DESIGN.md` §4 „przygaszony”),
karta „w grze” w kolorze gracza na ruchu, pudło neutralne (`:65-68`), `rounded-inset`; emoji to treść gry (lista odstępstw).

### Teksty, liczby i dostępność (UI-04, UI-05)

#### M5. Licznik par w pigułce bez mono `[zbiorcze: liczby-mono]` (kod w `Game.tsx`, do scalenia z 02-04)
- Miejsce: `Game.tsx:287` (`text-base font-semibold text-fg tabular-nums` bez `font-mono`, gałąź Memory); pozostałe wartości w pigułkach (`:295`, `:300`, `:321`) mają `font-mono`.
- Źródło: `DESIGN.md` §5 „Liczby są mono”. Waga: **niska**. Propozycja: dodać `font-mono` (jeśli 02-04 ma ten sam wpis, 02-11 zostawia jeden).

Poza tym bez rozbieżności: teksty po polsku, bez em-dashy i liczb; „Odkryj pierwszą kartę”, „Odkryj drugą kartę”, „{nick} szuka pary…” (`:118`, `role="status"`); karty mają `aria-label` z nazwą symbolu po polsku (`:15-36`, `:74`), kropka statusu `aria-hidden` (`:115`).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

#### M6. Pudło bez wibracji 60 `[zbiorcze: wibracja-zlo-od-gracza]`
- Miejsce: `Memory.tsx:45-53` (pudło pokazane 1,5 s), brak `navigator.vibrate` w pliku (CHECKS §15: Memory nie ma wibracji).
- Źródło: `ZASADY.md` §5, tabela wibracji („pomyłka: 60”), W-09. Waga: **średnia**, jeśli pudło uznać za pomyłkę; gracz po pudle traci turę, więc to jego „zła odpowiedź”.
- Propozycja: `navigator.vibrate?.(60)` tylko u odkrywającego (gracz, który odkrył drugą kartę, `view.miss` nowe i `canMove` było u mnie), raz na pudło; decyzja w fazie 4 razem z pudłem w Statkach (S7).

#### M7. Świeża para przez `stone-pop`, a „świeże osiągnięcie” to `set-glow`
- Miejsce: `Memory.tsx:104` (`stone-pop` 0,35 s na emoji zebranej karty). Komplet w Kampus Tour i nowy rekord mają `set-glow` (B-35).
- Źródło: `ZASADY.md` §5 „Najpierw istniejące: … `set-glow` (świeże osiągnięcie)”, „Ta sama sytuacja … tej samej animacji”. Waga: **niska** (do decyzji, czy para to „pojawienie” czy „osiągnięcie”; obie role pasują).
- Propozycja: zostawić `stone-pop` i dopisać w §5, że `set-glow` to komplet w grze z wieloma polami; albo `set-glow` na obu kartach pary w kolorze właściciela (`--glow`).

| `plik:linia` | Animacja / timer | Ocena |
|---|---|---|
| `:51` | `setTimeout(() => setMissShown(false), MISS_MS)` 1500 ms | zgodne: czas pokazania pudła (`ZASADY-GIER.md` §7), nie ruch, więc bez `reducedMotion`; nie blokuje (karty następnego gracza są aktywne od razu, `:73`) |
| `:78` | `transition-transform duration-180` obrotu karty (`rotate-y-180`) | zgodne (przejście stanu 180 ms; nie `card-in`, bo karta nie wjeżdża na środek); reguła globalna obejmuje przejście |
| `:81` | `transition-opacity duration-180` rewersu | zgodne (przejście stanu) |
| `:90` | `ring-pulse` 1,2 s ∞ na karcie „w grze” | rola zgodna; czas → B-36 `[zbiorcze: ring-pulse-czas]` |
| `:104` | `stone-pop` 0,35 s na zebranej parze | zgodne czasowo (B-37); rola → M7; po odświeżeniu wszystkie pary naraz → Z3 |
| `:116` | `animate-ping` kropki „szuka pary” | → Z4 (średnia) i B-50 |

Pomiaru czasu brak; moja tura z `Game.tsx` (40), gra jej nie powtarza.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| odkrycie karty | obrót 180 ms (`transition-transform`) | brak | - („Odkryj drugą kartę”) |
| karta „w grze” („można wybrać” drugą) | `ring-pulse` 1,2 s ∞ + poświata (M2) | brak | - |
| trafienie (para) | `stone-pop` 0,35 s na emoji, kolor właściciela | brak (zgodne) | - |
| pomyłka (pudło) | karty widać 1,5 s, potem obrót 180 ms | **brak** (M6) | - |
| moja tura | rewersy z 45% na 100% (180 ms), `Game.tsx` | 40 (`Game.tsx:35`) | - |
| czekanie na rywala | kropka `animate-ping` (Z4) | brak | - |
| koniec partii | brak w grze; `title-pop` u zwycięzcy (`Game.tsx`), remis bez zwycięzcy | brak | „Rewanż”, „Do lobby” |
| odsłona wyniku, koniec rundy, zbicie | nie występują | - | - |

## Odstępstwa z powodem (D-04, D-05; bez wagi)

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| trafienie i zatopiony statek w `accent` (płomień, kształt, segmenty floty) | `Statki.tsx:174`, `:390`, `:396`, `:165` | `DESIGN.md` §6 (utrwalony znak gry). Strefa zakazana i duch niedozwolonej pozycji nie są objęte (S3) |
| zamiana plansz po pudle dopiero po `SWAP_MS` 1200 ms, strzał niedostępny w tym czasie | `Statki.tsx:47`, `:73`, `:101` | `ZASADY.md` §5 („Wyjątek: Statki po pudle trzymają stary układ…”) |
| tryb Szybki Chińczyka: krok 110 ms, rzut 400 ms (poza tabelą §5) | `Chinczyk.tsx:53-54` | `KONCEPT.md` §2.3a („Szybki … szybsze animacje”); tabela §5 tego nie mówi, więc w fazie 4 warto dopisać wiersz „tryb Szybki Chińczyka: 110 / 400 ms” |
| emoji jako symbole kart | `Memory.tsx:17-36` | treść gry (jak kolory treści w `DESIGN.md` §6), jedno źródło w pliku |
| odcienie OKLCH pól domków i startu z koloru gracza | `Chinczyk.tsx:46`, `:151-155` | pochodna `PLAYER_COLORS` (D-04), nie nowy kolor |

## Podsumowanie wpisów

| Wpis | Gra | Waga | Klucz zbiorczy |
|---|---|---|---|
| Z1 (G1, S1, C1, L1, M1) | wszystkie | wysoka | `wysokosc-640` |
| C8 | chinczyk | wysoka | – |
| Z2 (G4, C4, L4, M4) | gomoku, chinczyk, labirynt, memory | średnia | `kolor-gracza-jedyny-sygnal` |
| Z4 | gomoku, statki, memory | średnia | `czekamy-animacja` (+ B-50 `animate-tailwind`) |
| G2, S2, C2, L2 | gomoku, statki, chinczyk, labirynt | średnia | `dotyk-48` |
| G3 (kolor) | gomoku | średnia | `kolor-spoza-tokenow` |
| S3 | statki | średnia | – |
| S7 | statki | średnia | `wibracja-zlo-od-gracza` |
| C3 | chinczyk | średnia | – |
| L3 | labirynt | średnia | `animate-tailwind` |
| M6 | memory | średnia | `wibracja-zlo-od-gracza` |
| Z3 | gomoku, statki, labirynt, memory | niska | `animacja-po-odswiezeniu` |
| G3 (cień) | gomoku | niska | `cien` |
| S4 | statki | niska | `cien`, `promien` |
| S5 | statki | niska | `podpis-label` |
| S6, L5 | statki, labirynt | niska | `aria-plansza` |
| C5 | chinczyk | niska | `promien` |
| C6, L6, M5 | chinczyk, labirynt, memory (`Game.tsx`) | niska | `liczby-mono` |
| C7 | chinczyk | niska | – |
| M2 | memory | niska | `cien` |
| M3 | memory | niska | – |
| M7 | memory | niska | – |

Liczba wpisów (licząc każdą grę osobno, jak w tabeli „Wpis”): wysokie 6 (G1, S1, C1, L1, M1, C8), średnie 15 (G2, G3-kolor, G4, S2, S3, S7, C2, C3, C4, L2, L3, L4, M4, M6, Z4),
niskie 14 (Z3, G3-cień, S4, S5, S6, C5, C6, C7, L5, L6, M2, M3, M5, M7). Odsyłacze do platformy bez osobnych wpisów: B-36 (`ring-pulse` 1 s / 1,2 s), B-37, B-38 (`line-draw`), B-42, B-49, B-50, B-51.

Nowe klucze zbiorcze dla 02-11: `wysokosc-640`, `kolor-gracza-jedyny-sygnal`, `animacja-po-odswiezeniu`, `czekamy-animacja`, `wibracja-zlo-od-gracza`, `aria-plansza`, `podpis-label`.

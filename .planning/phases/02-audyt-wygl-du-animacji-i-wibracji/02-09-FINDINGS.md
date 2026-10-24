# 02-09 FINDINGS: mini-gry z odchyłką w rundach (wygląd, animacje, wibracje)

**Zakres:** Narysuj koło (`Kolo.tsx`), Odcień (`Kolor.tsx`), Policz kropki (`Kropki.tsx` + wspólny `Szacowanie.tsx`), Kąt (`Kat.tsx`),
Który rok? (`Rok.tsx`), Środek (`Srodek.tsx`), Mapa (`Mapa.tsx`), Tort (`Tort.tsx`), Nożyczki (`Nozyczki.tsx`).
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI); sekcje gier w `ZASADY-GIER.md` i `KONCEPT.md` §2.4 jako opis zamierzonego zachowania.
**Odniesienie:** `02-02-BASELINE.md` (B-xx, W-xx) i wiersze `02-01-CHECKS.md` jako dowód grepa (D-10). Stan kodu: gałąź `labirynt`, 2026-10-23.
**Metoda:** lektura plików gier i statyczne sprawdzenie klas Tailwinda. **360×640 sprawdzono statycznie** (D-09), bez przeglądarki i bez serwerów dev.
Wagi wg D-07. Wpisy wspólne kilku gier tej paczki są w osobnej sekcji (W9a-W9h), sekcje gier do nich odsyłają.

## Metoda szacowania wysokości (360×640, statycznie)

- Szerokość treści: 360 − 2 × 16 px (`Screen` `px-4`) = 328 px.
- Narzut ekranu partii (`Screen` `pt-6` 24 px + `pb` 24 px, nagłówek `Game.tsx:233` jako `.tile p-4`: obrys 2 + 32 + tytuł `text-xl` 28 px
  albo rząd `GameDots` 48 px + `gap-3` 12 + pasek limitu `Countdown` ok. 20 px; odstęp `gap-3` pod nagłówkiem):
  - pokój z innymi graczami: 24 + 114 + 12 + 24 = **174 px**, na grę zostaje **466 px**,
  - gra solo (dodatkowo „Wyjdź” `min-h-12` z `-my-2` = 32 px + 12): **198 px**, na grę zostaje **442 px**.
- Elementy: `Stats` 57 px (obrys 2 + `py-2` 16 + `.label` 11 px × 1,5 + `text-lg leading-tight` 22,5), `.btn` 48 px, `text-5xl` 48 px, `text-3xl` 36 px.
- Kafle z `max-w-[calc(100dvh-N rem)]` przy 640 px wysokości: Środek i Nożyczki 304 px (21rem), Szacowanie 264 px (23,5rem), Mapa wysokość 256 px (24rem), Tort 240 px (25rem).

| Ekran (faza gry) | Treść gry | Razem solo / pokój | Ocena |
|---|---:|---:|---|
| Narysuj koło, przed pierwszą próbą | 57 + 12 + 328 + 12 + 40 = 449 | 647 / 623 | solo ponad 640 (KO1) |
| Narysuj koło, po próbie (z „Zostaw najlepszą i zakończ”) | 449 + 12 + 48 = 509 | 707 / 683 | ponad 640 (KO1) |
| Odcień, suwaki | 16,5 + 12 + 112 + 3 × 72 + 12 + 48 = 417 | 615 / 591 | mieści się |
| Szacowanie (Kropki, Kąt), porównanie | 57 + 8 + 264 + 8 + 36 + 8 + 48 = 429 | 627 / 603 | mieści się bez klawiatury; z klawiaturą SZ1 |
| Który rok? | 57 + 8 + 6 + 8 + 298 = 377 | 575 / 551 | mieści się |
| Środek | 57 + 8 + 304 + 8 + 40 = 417 | 615 / 591 | mieści się |
| Mapa | 57 + 8 + 30 + 8 + 256 + 8 + 48 = 415 | 613 / 589 | mieści się |
| Tort | 57 + 8 + 240 + 8 + 40 + 8 + 48 = 409 | 607 / 583 | mieści się |
| Nożyczki | 57 + 8 + 304 + 8 + 40 = 417 | 615 / 591 | mieści się |

Ekrany końcowe (`Scores` + tabela rund / listy) przewijają się w pionie przy kilku graczach, co jest wspólne dla wszystkich mini-gier i poza zakresem tego planu.
Poziomego przewijania nie ma w żadnej grze paczki: brak stałych `w-[..px]`, `min-w-*` i `whitespace-nowrap`, siatki to `grid-cols-5` / `grid-cols-2`
(w Tailwind 4 `repeat(n, minmax(0, 1fr))`) albo `RoundTable` (B-68); każde `<svg>` ma `viewBox` (`02-01-CHECKS.md` §6: 0 trafień w tych plikach).

## Wpisy wspólne kilku gier tej paczki

### W9a. Odsłona prawdziwego wyniku animowana różnie `[zbiorcze: odslona-animacja]`
- **Gry:** Mapa, Środek, Tort, Nożyczki, Który rok?, Policz kropki, Kąt, Odcień.
- **`plik:linia`:** `Mapa.tsx:177` (pierścień prawdziwego miejsca wskakuje przez `stone-pop` 0,35 s `ease-out`) wobec `Srodek.tsx:171` (pierścień środka), `Tort.tsx:160` (idealne cięcia),
  `Nozyczki.tsx:145` (obie części), `Rok.tsx:180` (pierścień prawdziwego roku), `Szacowanie.tsx:141` (kropki / kąt z łukiem), `Kolor.tsx:166` (wzór obok odpowiedzi): bez animacji.
- **Źródło:** `ZASADY.md` §5 „Ta sama sytuacja w nowej grze używa tej samej animacji”; D-12.
- **Waga:** średnia.
- **Propozycja:** jedno rozwiązanie dla „odsłony prawdziwego wyniku”: `stone-pop` 0,35 s na znaczniku prawdy we wszystkich grach (to „pojawienie się elementu” z tabeli §5) albo bez animacji wszędzie (usunąć z `Mapa.tsx:177`). Decyzja w fazie 4.

### W9b. Przejście do następnej rundy: inne słowa i inny przebieg `[zbiorcze: slowa]`
- **Gry:** Odcień, Policz kropki, Kąt.
- **`plik:linia`:** `Kolor.tsx:178` („Następny kolor”), `Szacowanie.tsx:183` („Następna runda”, po ostatniej „Wyniki”). Pozostałe gry paczki po odsłonie przechodzą same
  (`Rok.tsx:97` 2,5 s, `Srodek.tsx:66` 1 s, `Mapa.tsx:60`, `Tort.tsx:64`, `Nozyczki.tsx:54` 1,5 s).
- **Źródło:** `ZASADY.md` §4 „te same słowa co w innych grach („Start”, „Dalej”…)”.
- **Waga:** średnia.
- **Propozycja:** „Dalej” w obu przyciskach (także zamiast „Wyniki”); przebieg (przycisk czy samoczynnie) zostawić, bo opisują go `ZASADY-GIER.md` (Odcień, Policz kropki), ale zapisać w `ZASADY.md` §4, kiedy odsłona czeka na przycisk.

### W9c. „Idealnie!” i „Idealnie” `[zbiorcze: slowa]`
- **`plik:linia`:** `Srodek.tsx:179`, `Mapa.tsx:187`, `Tort.tsx:173`, `Nozyczki.tsx:155` („Idealnie!”) wobec `Szacowanie.tsx:179`, `Rok.tsx:198` („Idealnie”).
- **Źródło:** `ZASADY.md` §4 „te same słowa”.
- **Waga:** niska.
- **Propozycja:** jedna pisownia („Idealnie!” jak w `ZASADY-GIER.md` Środek, Mapa, Tort, Nożyczki).

### W9d. Kolor prawdziwej wartości i błędu w odsłonie `[zbiorcze: znacznik-prawdy]`
- **`plik:linia`:** Środek, Mapa, Tort, Nożyczki barwią błąd i znacznik prawdy przez `grade` (zielony / zwykły / ostrzegawczy: `Srodek.tsx:168-171`, `Mapa.tsx:170-177`, `Tort.tsx:160`, `Nozyczki.tsx:156`);
  Który rok? ma pierścień prawdziwego roku zawsze `border-success` (`Rok.tsx:180`), a różnicę zieloną tylko przy zerze (`Rok.tsx:198`); Szacowanie tak samo (`Szacowanie.tsx:178`), łuk w Kącie `stroke-fg-muted` (`Kat.tsx:30`).
- **Źródło:** `ZASADY.md` §5 (ta sama sytuacja tak samo), `DESIGN.md` §2 (`success` = trafienie; pierścień prawdy w Który rok? jest zielony także przy dużym błędzie).
- **Waga:** niska.
- **Propozycja:** `grade` z progami także w Który rok? i Szacowaniu (np. do 2 lat / 1 kropki zielony) i neutralny pierścień prawdy (`stroke-fg`) tam, gdzie błąd ma już kolor.

### W9e. Ruch zignorowany bez kary pokazywany różnie `[zbiorcze: zignorowany-ruch]`
- **`plik:linia`:** `Srodek.tsx:91` + `:162` i `Nozyczki.tsx:80` + `:142`: potrząśnięcie `shake` 0,3 s, wibracja 60 i tekst `text-warning` („Dotknij bliżej odcinka”, „Przetnij kształt”);
  `Kolo.tsx:133` + `:217`: niedokończone albo za małe koło (też nie zużywa próby) daje tylko tekst `text-warning`, bez potrząśnięcia i bez wibracji.
- **Źródło:** `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”.
- **Waga:** średnia.
- **Propozycja:** w Kole `shake` 0,3 s na płótnie i ta sama wibracja co w Środku i Nożyczkach (po decyzji z W9h).

### W9f. Tabela rund poza `RoundTable` `[zbiorcze: tabela-rund-wlasna]`
- **`plik:linia`:** `Szacowanie.tsx:32-49` (`Answers`: siatka 5 kolumn „było / wpisane” na gracza; Policz kropki i Kąt), `Rok.tsx:115-135` (lista wydarzeń z rokiem i odpowiedziami), `Kolor.tsx:40-55` (`Pairs`: pary próbek z % zgodności).
- **Źródło:** `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”; W-07.
- **Waga:** średnia.
- **Propozycja:** `RoundTable` z błędem rundy w komórkach i prawdziwą wartością w `children` (wzór: lista miast w `Mapa.tsx:112-118`) dla Szacowania i Który rok?.
  Odcień pokazuje kolory (treść gry), których `RoundTable` nie narysuje: dopisać jako wyjątek do `DESIGN.md` §6. Wszystkie trzy układy opisują `ZASADY-GIER.md`, więc zmiana wymaga też poprawki tam.

### W9g. Punkt `time` w `Intro` bez informacji o czasie `[zbiorcze: intro-time]`
- **`plik:linia`:** `Kolo.tsx:170` („10 prób, możesz zakończyć wcześniej”), `Srodek.tsx:131`, `Mapa.tsx:129`, `Tort.tsx:127`, `Nozyczki.tsx:110` (liczba rund / kształtów). Limit partii (120 / 180 s) widać dopiero w trakcie.
  Odcień, Kropki, Kąt i Który rok? podają czas (`Kolor.tsx:136`, `Kropki.tsx:38`, `Kat.tsx:57`, `Rok.tsx:145`).
- **Źródło:** `ZASADY.md` §4 „`time`: czas”; W-08 (treść punktu), B-72.
- **Waga:** niska.
- **Propozycja:** dopisać limit („10 rund, razem do 2 minut”) albo doprecyzować w `ZASADY.md` §4, że `time` to długość partii (rundy albo sekundy).

### W9h. Wibracja 60 przy ruchu, który „nie jest karą” `[zbiorcze: brak-w-tabeli-5]`
- **`plik:linia`:** `Srodek.tsx:91`, `Nozyczki.tsx:80` (`navigator.vibrate?.(60)`, oba z `?.`); komentarz `index.css:337` przy `shake`: „bez błysku koloru, to nie kara”. Dowód: `02-01-CHECKS.md` §15 (wiersze `Nozyczki.tsx:80`, `Srodek.tsx:91`).
- **Źródło:** `ZASADY.md` §5 tabela wibracji (60 = pomyłka; „ruchu zignorowanego” w tabeli nie ma). `ZASADY-GIER.md` (Środek, Nożyczki) opisuje tę wibrację wprost, więc kod jest zgodny z zasadami gry.
- **Waga:** niska.
- **Propozycja:** dopisać do tabeli §5 wiersz „ruch zignorowany (bez kary): 60 + `shake` 300 ms” albo usunąć wibrację; potem ujednolicić z Kołem (W9e).

## Narysuj koło (`kolo`)

### Wygląd
- **KO1.** `Kolo.tsx:187-195` (płótno `aspect-square w-full`), `:217` (`min-h-10`), `:221` (przycisk). Płótno ma pełną szerokość 328 px i jako jedyne pole kwadratowe w paczce nie maleje na niskim ekranie
  (Środek `:156`, Mapa `:154`, Tort `:152`, Nożyczki `:136`, Szacowanie `:140` mają `max-w-[calc(100dvh-…)]`). Szacunek statyczny: 707 px solo / 683 px w pokoju po pierwszej próbie, 647 px solo przed nią;
  przycisk „Zostaw najlepszą i zakończ” leży pod krawędzią 640 px, a płótno ma `touch-none`, więc przewinąć można tylko poza nim.
  **Źródło:** `ZASADY.md` §4 „Ekran mieści się na 360×640”, `AGENTS.md`. **Waga:** wysoka (szacunek statyczny, do potwierdzenia w przeglądarce; zapas ok. 40-70 px). `[zbiorcze: wysokosc-640]`
  **Propozycja:** `max-w-[calc(100dvh-…rem)] mx-auto` jak w pozostałych grach paczki (ok. 20rem w solo), a `DESIGN.md` §6 („mini-gry mieszczą się w 640 px”) poprawić po pomiarze.
- **KO2.** `Kolo.tsx:71`: odcinki oceny w `hsl(140→0 80% 55%)` (płynna zieleń → czerwień), legenda `:218` „Zielony: blisko niego, czerwony: daleko”. Gry nie ma na liście kolorów treści w `DESIGN.md` §6.
  Dowód: `02-01-CHECKS.md` §1 (`Kolo.tsx:71`). **Źródło:** `DESIGN.md` §2, D-04, `AGENTS.md` „kolory z tokenów”. **Waga:** średnia. `[zbiorcze: kolor-spoza-tokenow]`
  **Propozycja:** `color-mix(in oklab, var(--color-success), var(--color-warning) <t>%)` albo trzy stopnie z `grade` (`success` / `fg` / `warning`) jak w pozostałych grach paczki; albo wpis do `DESIGN.md` §6.
- Bez rozbieżności: akcja „Zostaw najlepszą i zakończ” jako `btn btn-ghost` (`:221`, akcja drugorzędna; nie ma przycisku akcentu ani przycisku w kolorze gracza, W-05),
  rysunek i ślad najlepszej próby w kolorze gracza (`:202-203`), kropka środka `currentColor` (`:201`), płótno z `touch-none select-none`, `onPointerDown/Move/Up/Cancel` i `setPointerCapture` (`:188-195`, `:103`; W-13 spełnione, choć gra nie mierzy czasu),
  `rounded-tile` / `rounded-inset`, cieni brak, SVG z `viewBox="0 0 1 1"` (`:155`, `:188`, `:260`), miniatury na końcu w siatce `grid-cols-2` (`:249`).
- Pole gry (`:188`) bez `aria-hidden` (`02-01-CHECKS.md` §9) to treść, nie ozdoba: zgodne.

### Teksty, liczby i dostępność
- **KO3.** `Kolo.tsx:139`: po próbie lepszej od najlepszej w tej partii napis „Nowy rekord!” w `text-success`. Te same słowa na ekranie „Rekordy” (`Records.tsx:147`) i w panelu po partii (`KONCEPT.md` §2.4) znaczą pobicie rekordu wszech czasów,
  więc gracz widzi „Nowy rekord!” kilka razy w partii, a po niej może go nie dostać. **Źródło:** `ZASADY.md` §4 „te same słowa co w innych grach” (w tej samej roli). **Waga:** średnia. `[zbiorcze: slowa]`
  **Propozycja:** „Najlepsza próba!” (i `ZASADY-GIER.md` bez zmian, bo nie podaje słowa).
- **KO4.** `Kolo.tsx:153-168`: podgląd `Intro` wpisany inline zamiast komponentu `Preview` w pliku gry, `h-24` zamiast `h-28` jak w innych podglądach SVG. Dowód: `02-01-CHECKS.md` §10a (`Kolo.tsx:153`).
  **Źródło:** `ZASADY.md` §4 („mały komponent `Preview` w pliku gry”). **Waga:** niska. **Propozycja:** wynieść do `function Preview()`. Sam podgląd jest animowaną pętlą CSS (`line-draw` 2,5 s), więc W-08 spełnione;
  przy reduced-motion animacja kończy się w stanie bazowym (pełny okrąg), czytelna klatka (W-12 spełnione).
- **KO5.** `Kolo.tsx:184`: brak najlepszego wyniku w `Stats` jako ASCII „-” (Balon ma „–”, `02-01-CHECKS.md` §7). **Źródło:** `DESIGN.md` §4 „stan pusty”, `ZASADY.md` §4 „te same słowa”. **Waga:** niska. `[zbiorcze: brak-wartosci]`
  **Propozycja:** jeden zapis braku wartości w `Stats` dla wszystkich gier (np. „brak” w `fg-muted` albo zawsze „-”).
- Bez rozbieżności: przecinek przez własne `tenths` (`:25`, to samo co `tenth`; W-03), minus U+2212 w różnicy (`:139`), wyniki mono `tabular-nums` (`:209`, `:246`, `:267`), liczby nad płótnem tylko w `Stats` (`:181-186`, W-01),
  `Intro` z trzema punktami i „Start” (punkt `time` W9g), „(ty)” i „gra…” (`:244`, `:246`), kropki koloru `aria-hidden` (`:241`), miniatury z `aria-label` (`:260`), podpowiedź w stałej wysokości (`:217`).
- Ekran końcowy (karty zamiast `Scores`, `:236-276`): **odstępstwo z powodem** (lista na końcu).

### Animacje i wibracje
- `line-draw` 2,5 s ∞ tylko w podglądzie (`:166`): katalog B-38 (`[zbiorcze: keyframes-poza-5]`), pętla podglądu nie ma kategorii w tabeli §5 i nie musi (B-39). Zgodne poza B-38.
- Brak `setTimeout`, `requestAnimationFrame` i `navigator.vibrate` w pliku. Ocena próby i nakładka z wynikiem (`:196-211`) pojawiają się od razu, bez przejścia: zgodne (gra nie mierzy czasu).
- Niedokończone koło bez wibracji i potrząśnięcia: W9e.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (ocena próby, idealny okrąg) | brak (od razu) | brak | - |
| trafienie (lepsza próba) | brak; „Nowy rekord!” `text-success` (KO3) | brak | - |
| pomyłka / ruch zignorowany (niedokończone, za małe) | brak; tekst `text-warning` (W9e) | brak | - |
| odsłona prawdziwego wyniku (idealny okrąg, % na płótnie) | brak, do następnego dotknięcia | brak | - |
| koniec rundy | brak | brak | - |
| koniec partii | karty graczy z miniaturami | brak (moja tura: `Game.tsx`) | „Zostaw najlepszą i zakończ” (wcześniej), potem „Rewanż” / „Do lobby” z `Game.tsx` |

## Odcień (`kolor`)

### Wygląd
- **OD1.** `Kolor.tsx:144-147` (użyty `:153`, `:164`, `:186`): licznik „Kolor 1/5” jako `.label` nad polem gry zamiast `Stats`. **Źródło:** `DESIGN.md` §5 „Liczby nad polem gry to zawsze pasek `Stats`”; W-01. **Waga:** średnia. `[zbiorcze: liczby-poza-stats]`
  **Propozycja:** `Stats` z „Kolor 1/5” (jak „Runda” w pozostałych grach paczki); wysokość rośnie o ok. 40 px, faza suwaków nadal się mieści (ok. 655 / 631 px solo / pokój: w solo trzeba wtedy zmniejszyć próbkę `h-28` do `h-24`).
- Suwaki: tor 36 px (`index.css:148`) i uchwyt `#fff`/`#000` to wpisy platformy B-31 (`[zbiorcze: dotyk-48]`) i B-32; tutaj tylko odsyłacz. Focus `accent` przez `.swatch-range:focus-visible` (B-26), etykieta przez otaczający `<label>` (`:189-190`), więc `aria-label` niepotrzebne.
- Bez rozbieżności: „Zatwierdź kolor” i „Następny kolor” jako `btn text-bg` w kolorze gracza (`:177`, `:202`; W-05), próbki `rounded-tile border-line` (`:18`), pary `rounded-inset` (`:46`),
  siatka par `grid-cols-5` (komórka ok. 54 px mieści „100,0%” w `text-xs` mono), fazy mieszczą się na 360×640 (tabela wysokości). Strona bez `touch-none` (`02-01-CHECKS.md` §5): zgodne, gra nie ma pola na czas, suwaki mają `touch-action: none` w `.swatch-range`.
- Kolory próbek, torów suwaków i podglądu: **odstępstwo z powodem** (lista na końcu).

### Teksty, liczby i dostępność
- Bez rozbieżności: procenty z przecinkiem (`:22`), mono `tabular-nums` (`:50`, `:175`), `Scores` z „gra…” (`:117`), notka „więcej znaczy lepiej” i legenda „wzór | odpowiedź” jak w `ZASADY-GIER.md`, `Intro` z `Preview` i trzema punktami (`:134-140`), przy reduced-motion podgląd pokazuje tylko „Wzór” (druga próbka bazowo `opacity-0`, W-12).
- Słowo „Następny kolor”: W9b. Pary zamiast `RoundTable`: W9f.

### Animacje i wibracje
- `preview-half` 3 s tylko w podglądzie (`:68`): zgodne (B-39).
- `setTimeout` `:88` (2 s pokazu wzoru) to logika gry, nie animacja; wzór pojawia się bez przejścia, więc czas widoczności to dokładnie `KOLOR_SHOW_MS`. Zgodne, `reducedMotion` nie dotyczy.
- Brak `navigator.vibrate`: zgodne (gra nie ma pomyłki, tylko odchyłkę).

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (wzór na 2 s) | brak (od razu) | brak | - |
| odsłona prawdziwego wyniku (wzór obok odpowiedzi, %) | brak (W9a) | brak | „Następny kolor” (W9b) |
| koniec rundy | brak | brak | „Zatwierdź kolor” |
| koniec partii | `Scores` + pary | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Policz kropki (`kropki`) i wspólny `Szacowanie.tsx`

Pełna ocena `Szacowanie.tsx` (D-02, D-03); Kąt do niej odsyła.

### Wygląd
- **SZ1.** `Szacowanie.tsx:140` (`max-w-[calc(100dvh-23.5rem)]`) razem z `apps/web/index.html:5` (`interactive-widget=resizes-content`) i polem z `autoFocus` w kaflu (`:144-155`, formularz `absolute inset-0`).
  Przy `resizes-content` klawiatura na Androidzie zmniejsza układ, a z nim `100dvh`: na telefonie 640 px z klawiaturą ok. 280 px `calc(360px − 376px)` jest ujemne, więc kafel spada do minimum z wypełnienia `.tile` (ok. 42 px),
  a pole odpowiedzi i „Zatwierdź” wewnątrz niego zwężają się do kilkudziesięciu pikseli. Na iOS klawiatura nie zmienia `dvh`, więc problem dotyczy Androida.
  **Źródło:** `ZASADY.md` §4 „Ekran mieści się na 360×640”, `AGENTS.md`. **Waga:** wysoka (statycznie z CSS, **do potwierdzenia w przeglądarce na Androidzie**; jeśli się potwierdzi, nie da się wygodnie wpisać odpowiedzi). `[zbiorcze: wysokosc-640]`
  **Propozycja:** dolna granica kafla (`max-w-[max(16rem,calc(100dvh-23.5rem))]`) albo formularz pod kaflem zamiast w nim w fazie odpowiedzi.
- **SZ2.** `Szacowanie.tsx:157`: „Zatwierdź” nieaktywny (40%) bez podpisu, gdy liczba przekracza `maxAnswer` (w Kącie 181-999, bo `:154` przycina tylko liczbę cyfr). **Źródło:** `DESIGN.md` §4 „Każdy stan, który coś blokuje, tłumaczy się podpisem”. **Waga:** niska.
  **Propozycja:** podpis „Najwyżej 180°” pod polem albo `aria-invalid` na `.field` (B-30).
- Bez rozbieżności: kafel kwadratowy w tym samym miejscu we wszystkich fazach (`:135-141`), kropki `bg-fg` w ułamkach kafla (`Kropki.tsx:43-47`), „Zatwierdź” i „Następna runda” jako `btn text-bg` w kolorze gracza (`:157`, `:182`), `.field` 48 px (`:148`), siatka `Answers` `grid-cols-5`.
  Brak `touch-none` (`02-01-CHECKS.md` §5): zgodne, gra nie ma pola na czas, odpowiedź to pole tekstowe.

### Teksty, liczby i dostępność
- **SZ3.** `Szacowanie.tsx:37`: komórki `Answers` w `font-mono` bez `tabular-nums`. **Źródło:** `DESIGN.md` §5 „Liczby są mono … z `tabular-nums`”; W-16. **Waga:** niska. `[zbiorcze: liczby-mono]` **Propozycja:** dopisać `tabular-nums`.
- Bez rozbieżności: pole odpowiedzi z `inputMode="numeric"`, `enterKeyHint="done"`, `autoComplete="off"`, filtrem cyfr (`:149-154`) i etykietą przez `<label>` (`:145-146`); liczby w `Stats` (`:124-129`, W-01), porównanie mono `tabular-nums` (`:168`, `:173`, `:178`), minus U+2212 (`:53`),
  przecinek w czasie pokazu (`Kropki.tsx:38`), `Intro` z podglądem z pliku gry (`Kropki.tsx:17-26`) i trzema punktami, „(ty)” (`:106`). Przy reduced-motion podgląd pokazuje same kropki („Ile?” bazowo `opacity-0`).
- Słowa „Następna runda” / „Wyniki”: W9b. „Idealnie” bez wykrzyknika: W9c. Kolor różnicy: W9d. `Answers` zamiast `RoundTable`: W9f.

### Animacje i wibracje
- `setTimeout` `:69` (800 ms pustego kafla, potem 1,5 s pokazu): logika gry. Kropki pojawiają się i znikają bez przejścia (`Kropki.tsx:42-48`, brak `transition`/`animate-`), więc czas widoczności to dokładnie `KROPKI_SHOW_MS`. Zgodne, `reducedMotion` nie dotyczy.
- Odsłona po odpowiedzi czeka na przycisk (zgodnie z `ZASADY-GIER.md`: „wynik idzie na serwer dopiero po „Wyniki””), więc nie ma czasu do sprawdzenia; plan zakładał 1,5 s, ale 1,5 s to czas pokazu kropek.
- `preview-half` 3 s w podglądzie (`Kropki.tsx:21`, `:23`): zgodne (B-39). Brak `navigator.vibrate`: zgodne (odchyłka, nie pomyłka).

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (kropki na 1,5 s po 0,8 s pustego kafla) | brak (od razu) | brak | - |
| koniec rundy | brak | brak | „Zatwierdź” |
| odsłona prawdziwego wyniku (kropki + „Było 42, wpisałeś 38”, różnica) | brak (W9a) | brak | „Następna runda” / „Wyniki” (W9b) |
| koniec partii | `Scores` + `Answers` | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Kąt (`kat`)

### Wygląd
- Ekran, fazy i wysokość: `Szacowanie.tsx` (SZ1, SZ2 w sekcji Policz kropki). Własny kod: rysunek `Angle` w SVG z `viewBox="0 0 100 100"`, `aria-hidden`, ramiona `stroke-fg`, łuk `stroke-fg-muted` (`Kat.tsx:29-32`): tokeny, bez stałych pikseli. Bez rozbieżności.

### Teksty, liczby i dostępność
- Stopnie mono przez `Szacowanie.tsx` (`unit="°"`, `Kat.tsx:54`), przecinek w czasie pokazu (`Kat.tsx:57`), `Intro` z podglądem z pliku (`Kat.tsx:37-44`), przy reduced-motion widać sam kąt. Bez rozbieżności poza odsyłaczami SZ3, W9b, W9c, W9d, W9f.

### Animacje i wibracje
- `preview-half` 3 s w podglądzie (`Kat.tsx:40`, `:41`): zgodne. Kąt pojawia się bez przejścia (`Kat.tsx:60`); timery i pomiar w `Szacowanie.tsx` (zgodne). Brak wibracji: zgodne.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (kąt na 1,5 s) | brak (od razu) | brak | - |
| koniec rundy | brak | brak | „Zatwierdź” |
| odsłona prawdziwego wyniku (kąt z łukiem, „Było 70°, wpisałeś 62°”) | brak (W9a) | brak | „Następna runda” / „Wyniki” (W9b) |
| koniec partii | `Scores` + `Answers` | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Który rok? (`rok`)

### Wygląd
- **RK1.** `Rok.tsx:166-170`: własny pasek czasu rundy nad kaflem: kolor `fg-muted` (nie gracza), ostrzeżenie od 5 s (platforma od 10 s z `animate-pulse`, `Game.tsx:596`), przejście szerokości 250 ms `linear` (poza tabelą §5; platforma 300 ms).
  Na ekranie są więc dwa paski czasu o różnym wyglądzie (limit partii w nagłówku i runda nad kaflem). Quiz pokazuje czas rundy przez wspólny `Countdown` z `onRound` (`MiniGame.tsx:315`, `Game.tsx:48`, `:251`). Dowód: `02-01-CHECKS.md` §12 (`Rok.tsx:168`).
  **Źródło:** `ZASADY.md` §4 „Czego gra nie rysuje sama: … pasek czasu w kolorze gracza”, §5 tabela czasów; `DESIGN.md` §3.4. **Waga:** średnia. `[zbiorcze: pasek-rundy-wlasny]`
  **Propozycja:** czas rundy przez `onRound` i `Countdown` z `Game.tsx` jak w Quizie (wtedy `ZASADY-GIER.md` „ostatnie 5 s ostrzegawczy” → 10 s), albo przynajmniej kolor gracza, 10 s i 300 ms.
- Suwak roku: tor 36 px to B-31 (`[zbiorcze: dotyk-48]`), tutaj tylko odsyłacz. Dokładność na 360 px: tor ok. 184 px na 126 lat (ok. 1,5 px na rok), czego palec nie ustawi, ale przyciski −1 / +1 `size-12` (48 px, `:184`, `:188`) to wyrównują. Zgodne.
- Bez rozbieżności: „Zatwierdź” `btn text-bg` w kolorze gracza (`:201`), własny rok na torze w kolorze gracza (`:179`), najdłuższy opis wydarzenia (61 znaków, `rok.ts`) to 2 linie w `text-lg` na 296 px, w `min-h-18` (`:173`), więc kafel nie skacze;
  wysokość 575 / 551 px. Brak `touch-none select-none` (`02-01-CHECKS.md` §5): zgodne, gra ma limit rundy, ale nie mierzy czasu reakcji, a suwak ma `touch-action: none`.

### Teksty, liczby i dostępność
- Bez rozbieżności: rok i różnica mono `tabular-nums` (`:174`, `:196`, `:198`), minus U+2212 (`:19`), liczby nad kaflem w `Stats` (`:160-165`), przyciski −1 / +1 z widocznym tekstem i `aria-label` (`:184`, `:188`), suwak z `aria-label="Rok"` (`:187`), pasek z `role="progressbar"` (`:166`),
  `Intro` z podglądem (`:26-50`, przy reduced-motion widać jeden rok) i czasem w punkcie `time`, ekran końcowy z kropkami `aria-hidden` (`:125`).
- „Idealnie” bez wykrzyknika: W9c. Pierścień prawdy zawsze zielony: W9d. Lista zamiast `RoundTable`: W9f.

### Animacje i wibracje
- `setInterval` `:87` (250 ms) i `Date.now` `:86`, `:88`: limit rundy, nie pomiar wyniku (wynik to rok z suwaka); przejście paska nie wpływa na zatwierdzenie. Zgodne (`02-01-CHECKS.md` §14 `Rok.tsx:86`, `:88`).
- `setTimeout` `:97` (2,5 s odsłony): logika gry zgodna z `ZASADY-GIER.md`; odsłona bez animacji (W9a). Przejście `:168`: RK1. `preview-half` 3 s w podglądzie (`:33`, `:43`): zgodne. Brak wibracji: zgodne.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (wydarzenie) | brak | brak | - |
| koniec rundy (zatwierdzenie albo 20 s) | brak; pasek rundy 250 ms `linear` (RK1) | brak | „Zatwierdź” |
| odsłona prawdziwego wyniku (2,5 s) | brak (W9a) | brak | - (samoczynnie) |
| koniec partii | `Scores` + lista wydarzeń | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Środek (`srodek`)

### Wygląd
- Bez rozbieżności: pole 300 umownych px skaluje się do szerokości (`viewBox="0 0 100 100"`, punkty w ułamkach kafla `:74-77`, strefa w umownych px po stronie `srodekOffset`), kafel maleje na niskim ekranie (`:156`, 304 px przy 640);
  `touch-none select-none`, `onPointerDown/Move/Up/Cancel` i `setPointerCapture` (`:155-161`, `:81`), liczy się puszczenie palca (`:85-97`), pierścień celowania i własny punkt w kolorze gracza (`:164`, `:169`), odcinek `stroke-fg`, błąd przez `grade` (tokeny), wysokość 615 / 591 px.

### Teksty, liczby i dostępność
- Bez rozbieżności: błąd w % z przecinkiem (`:21-22`), mono `tabular-nums` (`:180`), `Stats` (`:149-154`), `RoundTable` z formatem do 3 znaków przy 10 rundach (`:120`, W-07 spełnione), wiersz stanu z `role="status"` (`:176`), SVG pola `aria-hidden` (`:162`),
  `Intro` z podglądem (`:41-48`, przy reduced-motion widać sam odcinek). Punkt `time`: W9g. „Idealnie!”: W9c.

### Animacje i wibracje
- `shake` 0,3 s przy dotknięciu poza strefą (`:162`, `key={miss}` restartuje animację): B-48 (`[zbiorcze: keyframes-poza-5]`).
- `navigator.vibrate?.(60)` `:91` przy ruchu ignorowanym: W9h (niska); z `?.`, tylko przy ruchu bez kary, nie przy trafieniu.
- `setTimeout` `:66` (1 s odsłony): logika gry; w trakcie odsłony dotknięcia są ignorowane (`:80`), co jest zamierzoną pauzą z `ZASADY-GIER.md`, nie animacją blokującą. Odsłona bez animacji: W9a. `preview-half` 2 s w podglądzie (`:45`): zgodne.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (odcinek) | brak | brak | - |
| ruch zignorowany (poza strefą) | `shake` 0,3 s `ease-out`, tekst `text-warning` | 60 (W9h) | - |
| odsłona prawdziwego wyniku (1 s, pierścień środka, błąd) | brak (W9a) | brak | - (samoczynnie) |
| koniec partii | `Scores` + `RoundTable` | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Mapa (`mapa`)

### Wygląd
- Bez rozbieżności: kontur Polski w SVG z `viewBox` o proporcjach `MAPA_ASPECT` (`:38`, `:160`), kafel o tych proporcjach maleje na niskim ekranie (`:154`, mapa 256 px wysokości przy 640), `fill-bg stroke-fg-muted` (`:32`);
  znacznik w kolorze gracza (`:164-165`, `:171`), przenoszenie dotknięciem i przeciąganiem z `touch-none select-none` i `setPointerCapture` (`:152-158`, `:77`), punkt przycięty do pola (`:69-73`);
  „Zatwierdź” jako `btn text-bg` w kolorze gracza, nieaktywny z podpisem „Dotknij mapy” w samym przycisku (`:191-192`, `DESIGN.md` §4 spełnione); wysokość 613 / 589 px.

### Teksty, liczby i dostępność
- **MP1.** `Mapa.tsx:109`: `format={(d) => \`${d}\`}` w `RoundTable` przy 10 rundach: błąd od 1000 km (punkt w rogu pola, `MAX_ERROR` 1000 w `ZASADY-GIER.md`) ma 4 znaki, a komórka na 360 px mieści 3 (B-68, wystaje ok. 2 px). Typowe błędy są poniżej 1000 km.
  **Źródło:** W-07, `ZASADY.md` §4 (360×640). **Waga:** niska. `[zbiorcze: roundtable-szerokosc]` **Propozycja:** powyżej 999 zapis „1k” albo ucięcie do „999+”.
- Bez rozbieżności: km mono `tabular-nums` (`:188`, `Stats` `:145-150`), legenda „czerwony” zgodna z domyślną (`:110`, B-69), lista miast w `children` z numerem mono (`:112-118`), nazwa miasta jako polecenie (`:151`), wiersz z `role="status"` (`:184`), SVG pola `aria-hidden` (`:160`),
  `Intro` z podglądem (`:37-43`, przy reduced-motion widać sam kontur), `toFixed` tylko we współrzędnych (`:25`, `02-01-CHECKS.md` §7: zgodne). Punkt `time`: W9g. „Idealnie!”: W9c.

### Animacje i wibracje
- `stone-pop` 0,35 s `ease-out` na pierścieniu prawdziwego miejsca (`:177`): czas i easing zgodne z tabelą §5 („pojawienie się elementu”, B-37); niespójność z resztą paczki: W9a.
- `setTimeout` `:60` (1,5 s odsłony): logika gry. `preview-half` 2 s (`:40`): zgodne. Brak wibracji: zgodne.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (nazwa miasta, znacznik) | brak | brak | „Dotknij mapy” (nieaktywny) → „Zatwierdź” |
| odsłona prawdziwego wyniku (1,5 s, pierścień, linia, km) | `stone-pop` 0,35 s `ease-out` (W9a) | brak | - (samoczynnie) |
| koniec partii | `Scores` + `RoundTable` z listą miast | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Tort (`tort`)

### Wygląd
- **TO1.** `Tort.tsx:19` (`GRAB = 10`), `:86`: własne cięcie łapie się dotknięciem do 10° od niego. Przy kaflu 240 px (ekran 640 px, `:152`) strefa ma na brzegu tortu ok. 37 px szerokości, bliżej środka mniej; uchwyt rysowany ma promień 2,2 jednostki (ok. 5 px, `:166`).
  Chybienie stawia nowe cięcie (gdy jeszcze brakuje) albo nic nie robi. **Źródło:** `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”, `AGENTS.md`. **Waga:** średnia. `[zbiorcze: dotyk-48]`
  **Propozycja:** strefa łapania liczona w px od palca (np. 24 px promienia, czyli 48 px średnicy) zamiast w stopniach, albo kąt rosnący bliżej środka.
- Bez rozbieżności: tort w SVG z `viewBox` (`:158`), `fill-surface stroke-line-hover`, gotowe cięcie `stroke-fg`, własne cięcia i uchwyty w kolorze gracza (`:161-166`), `touch-none select-none`, `onPointerDown/Move/Up/Cancel` i `setPointerCapture` (`:151-157`, `:88`), martwa strefa przy środku (`:22`, `:78`);
  „Pokrój” `btn text-bg` w kolorze gracza, nieaktywny z podpisem „Zostało cięć: N” nad przyciskiem (`:178`, `:182`); `Stats` z trzema pozycjami mieści się na 296 px (B-65); wysokość 607 / 583 px.

### Teksty, liczby i dostępność
- Bez rozbieżności: błąd przez `tenth` z „%” (`:24`), mono `tabular-nums` (`:174`), `Stats` (`:144-150`), `RoundTable` z domyślnym `tenth` przy 5 rundach (komórka ok. 57 px, `:118`), odmiana „równe kawałki” / „równych kawałków” (`:178`), wiersz `role="status"` (`:170`), SVG pola `aria-hidden`,
  `Intro` z podglądem (`:37-46`, przy reduced-motion widać dwa cięcia). Punkt `time`: W9g. „Idealnie!”: W9c.

### Animacje i wibracje
- `setTimeout` `:64` (1,5 s odsłony idealnych cięć): logika gry; odsłona bez animacji (W9a). `preview-half` 2 s (`:43`): zgodne. Brak wibracji: zgodne. `disabled:opacity-40` (`:182`) dubluje `.btn:disabled` (B-25), bez skutku.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (tort z gotowym cięciem) | brak | brak | „Pokrój” (nieaktywny, podpis „Zostało cięć”) |
| koniec rundy | brak | brak | „Pokrój” |
| odsłona prawdziwego wyniku (1,5 s, idealne cięcia przerywane, błąd) | brak (W9a) | brak | - (samoczynnie) |
| koniec partii | `Scores` + `RoundTable` | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Nożyczki (`nozyczki`)

### Wygląd
- Bez rozbieżności: kształty w SVG z `viewBox="0 0 100 100"` (`:142`), kafel maleje na niskim ekranie (`:136`), gest cięcia z `touch-none select-none`, `onPointerDown/Move/Up/Cancel` i `setPointerCapture` (`:135-141`, `:69`),
  linia podglądu przerywana w kolorze gracza dopiero przy dwóch różnych punktach (`:124`, `:149`), obie części w kolorze gracza o różnym kryciu (`:145`), linia cięcia po odsłonie `var(--color-fg)` (token), wysokość 615 / 591 px.

### Teksty, liczby i dostępność
- Bez rozbieżności: udziały przez `tenth` z „%” w zapisie „53,0% | 47,0%” (`:157`, mieści się w 328 px razem z „Idealnie!”), mono `tabular-nums` (`:156`), `Stats` (`:129-134`), `RoundTable` przy 5 rundach (`:101`), wiersz `role="status"` (`:152`), SVG pola `aria-hidden`,
  `Intro` z podglądem (`:29-36`, przy reduced-motion widać sam kształt). Punkt `time`: W9g. „Idealnie!”: W9c.

### Animacje i wibracje
- `navigator.vibrate?.(60)` `:80`: przy cięciu, które nie jest odpowiedzią (za krótki ruch albo prosta obok kształtu), razem z `shake` 0,3 s (`:142`, B-48) i tekstem „Przetnij kształt” (`:161`). Zgodne z `ZASADY-GIER.md`; ocena wobec §5: W9h. Przy trafieniu brak wibracji: zgodne.
  Uwaga: za krótki ruch (`MIN_CUT`) też wibruje, więc „bez kary” w odczuciu gracza wygląda jak pomyłka (część W9h).
- `setTimeout` `:54` (1,5 s odsłony): logika gry; odsłona bez animacji (W9a). `preview-half` 2 s (`:33`): zgodne.

### Sytuacje

| Sytuacja | Animacja | Wibracja | Słowo na przycisku |
|---|---|---|---|
| pojawienie elementu (kształt) | brak | brak | - |
| ruch zignorowany (za krótki, obok kształtu) | `shake` 0,3 s `ease-out`, tekst `text-warning` | 60 (W9h) | - |
| odsłona prawdziwego wyniku (1,5 s, części, udziały) | brak (W9a) | brak | - (samoczynnie) |
| koniec partii | `Scores` + `RoundTable` | brak | „Rewanż” / „Do lobby” (`Game.tsx`) |

## Odstępstwa z powodem

Sprawdzone, zgodne z wyjątkami z `DESIGN.md` §6, `KONCEPT.md` i `ZASADY.md` (D-04, D-05); bez wagi.

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| kolory próbek, torów suwaków i podglądu w Odcieniu (`rgb(...)` z `kolorHsbToRgb`, `#2f8fd8`, `#3f7fe6`) | `Kolor.tsx:20`, `:33-36`, `:47-48`, `:63-64`, `:154`, `:167-168`, `:187`, `:198` | `DESIGN.md` §6 „próbki Odcienia” to treść gry; jedno źródło (`css`) w pliku gry. Dowód: `02-01-CHECKS.md` §1 |
| ekran końcowy Koła: karta na gracza z miniaturami zamiast `Scores` | `Kolo.tsx:236-276` | `KONCEPT.md` §2.4 („na końcu najlepsze i najgorsze koło każdego gracza”); `ZASADY-GIER.md` „bez osobnej tabeli wyników”. „(ty)”, „gra…” i wynik mono są jak w `Scores` |
| `Math.random` w kliencie Odcienia (start suwaków) | `Kolor.tsx:13-15` | nie zasady gry, tylko położenie startowe suwaków (komentarz `:14`); reguła „losowość z `rng`” dotyczy `packages/games` |

## Podsumowanie wpisów

| ID | Waga | Gra | `plik:linia` | Klucz |
|---|---|---|---|---|
| KO1 | wysoka | Narysuj koło | `Kolo.tsx:187-195` | `wysokosc-640` |
| SZ1 | wysoka | Policz kropki, Kąt (`Szacowanie.tsx`) | `Szacowanie.tsx:140`, `index.html:5` | `wysokosc-640` |
| W9a | średnia | 8 gier paczki | `Mapa.tsx:177` i inne | `odslona-animacja` |
| W9b | średnia | Odcień, Policz kropki, Kąt | `Kolor.tsx:178`, `Szacowanie.tsx:183` | `slowa` |
| W9e | średnia | Narysuj koło (wobec Środka, Nożyczek) | `Kolo.tsx:133`, `:217` | `zignorowany-ruch` |
| W9f | średnia | Policz kropki, Kąt, Który rok?, Odcień | `Szacowanie.tsx:32-49`, `Rok.tsx:115-135`, `Kolor.tsx:40-55` | `tabela-rund-wlasna` |
| KO2 | średnia | Narysuj koło | `Kolo.tsx:71` | `kolor-spoza-tokenow` |
| KO3 | średnia | Narysuj koło | `Kolo.tsx:139` | `slowa` |
| OD1 | średnia | Odcień | `Kolor.tsx:144-147` | `liczby-poza-stats` |
| RK1 | średnia | Który rok? | `Rok.tsx:166-170` | `pasek-rundy-wlasny` |
| TO1 | średnia | Tort | `Tort.tsx:19`, `:86` | `dotyk-48` |
| W9c | niska | 6 gier | `Srodek.tsx:179` i inne | `slowa` |
| W9d | niska | Który rok?, Szacowanie, Kąt | `Rok.tsx:180`, `:198`, `Szacowanie.tsx:178` | `znacznik-prawdy` |
| W9g | niska | 5 gier | `Kolo.tsx:170` i inne | `intro-time` |
| W9h | niska | Środek, Nożyczki | `Srodek.tsx:91`, `Nozyczki.tsx:80` | `brak-w-tabeli-5` |
| KO4 | niska | Narysuj koło | `Kolo.tsx:153-168` | - |
| KO5 | niska | Narysuj koło | `Kolo.tsx:184` | `brak-wartosci` |
| SZ2 | niska | Policz kropki, Kąt | `Szacowanie.tsx:157` | - |
| SZ3 | niska | Policz kropki, Kąt | `Szacowanie.tsx:37` | `liczby-mono` |
| MP1 | niska | Mapa | `Mapa.tsx:109` | `roundtable-szerokosc` |

Odsyłacze do platformy (bez nowych wpisów, D-03): B-31 i B-32 (suwak w Odcieniu i Który rok?), B-38 (`line-draw` w Kole), B-48 (`shake` w Środku i Nożyczkach), B-68 (szerokość komórki `RoundTable`, MP1).

Razem: **2 wysokie, 9 średnich, 9 niskich**, 3 odstępstwa z powodem.

# 02-07: mini-gry na czas i reakcję (wygląd, animacje, wibracje)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-23/24. Zakres: `refleks`, `simon`, `stoper`, `stoj`, `rytm`, `przytrzymaj`, `zaslona`, `balon`
(`apps/web/src/games/{Refleks,Simon,Stoper,Stoj,Rytm,Przytrzymaj,Zaslona,Balon}.tsx`, razem 1421 linii) oraz ich obsługa w `screens/Game.tsx` (ukryty limit, wibracja tury).
Repo bez zmian poza `.planning/`.

## Metoda

- Każdy plik gry przeczytany w całości; porównany z `ZASADY.md` §4 (:109-142) i §5 (:144-184), `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI)
  i sekcjami gier w `ZASADY-GIER.md` (:67-84, :214-229, :298-319, :395-426, :499-522). Decyzje D-01..D-13 z `02-CONTEXT.md`.
- Dowody z grepa: wiersze `02-01-CHECKS.md` (cytowane jako `CHECKS:<linia>`); wzorce platformy: punkty `02-02-BASELINE.md` (B-xx, W-xx). Wzorzec zgodny z BASELINE nie jest sprawdzany od nowa.
- Dodatkowy grep po 8 plikach (`setTimeout|setInterval|requestAnimationFrame|animate-\[|transition|vibrate|duration-|performance.now|timeStamp|onClick|onPointer|touch-none|select-none|font-mono|toFixed`)
  dał listę ocenioną niżej: każde `navigator.vibrate`, każde keyframes i każdy timer ma ocenę w podsekcji „Animacje”.
- **360×640 sprawdzono statycznie** (D-09): wysokości z klas Tailwinda (`Screen` `pt-6`/`pb-6`, nagłówek `Game.tsx` w kaflu około 92 px z paskiem limitu, `Stats` około 56 px, odstępy 12 px),
  szerokości z szacunku Satoshi około 0,56 em i Geist Mono 0,6 em na znak. Bez przeglądarki, bez Playwrighta, serwerów dev nie dotykano.
- Wspólne komponenty: `ui.tsx` (`Intro`, `Stats`, `Scores`, `RoundTable`, `grade`) ocenia 02-02, `Quiz.tsx` (`Results`, używane przez Stój!) ocenia 02-08 (D-02, D-03); tu tylko odsyłacze.
- Wagi wg D-07. Format wpisu: **ID** · `plik:linia` · źródło · waga · propozycja. Klucze `[zbiorcze: …]` dla 02-11.

### Wspólne ustalenia tej paczki (opisane raz, gry odsyłają)

- **Ukryty limit tury** (Stoper, Rytm, Przytrzymaj, Za zasłoną): `Game.tsx:208-210` nie rysuje `Countdown`, gdy `def.id` jest jednym z czterech i `myTurn`; po oddaniu wyniku limit wraca (gracz już skończył). Na ekranie instrukcji limit jest ukryty dla wszystkich (`!game.intro`). Zgodne z `KONCEPT.md` §2.4 i `ZASADY-GIER.md`; trafia na listę „Odstępstwa z powodem” (D-05). Żadna z czterech gier nie ma też licznika sekund we własnym kodzie (sprawdzone: brak `Stats` z czasem, brak `setInterval` wyświetlającego sekundy poza Stoperem do 3 s, co jest zasadą gry).
- **Wibracja tury** `40` tylko w `Game.tsx:35`; żadna z 8 gier jej nie powtarza (grep `vibrate`: tylko `Stoj.tsx:76`, `Rytm.tsx:70`, `Balon.tsx:58`). Zgodne z W-09.
- **Nowy stan z serwera / duży skok**: wszystkie 8 gier toczą się na kliencie (`KONCEPT.md` §2.4), serwer dostaje tylko wynik; odświeżenie = partia od nowa. Animacja nie ma czego „doganiać”; punkt §5 „nowy stan przerywa animację” nie ma tu zastosowania poza wynikami rywali (`Scores` bez animacji).
- **`Intro`** (W-08): każda z 8 gier ma własne `<Intro>` z kompletem `time` / `task` / `score` / `preview` / `onStart` i `Preview` w pliku gry (`CHECKS:854`, `:882`, `:890`, `:898`, `:906`, `:918`, `:922`, `:950`); treść punktów sprawdzona w sekcjach gier. „Start” daje `ui.tsx` (B-72). Uwagi o `Intro` samym w sobie: B-73, B-74 (nie powtarzane).
- **Odstępstwa wspólne z innymi paczkami**: ruch jako treść gry bez `reducedMotion` (Za zasłoną) odsyła do B-53.

---

## Refleks (`refleks`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: tylko tokeny (`bg-surface`, `text-fg-muted`, `bg-success`, `text-bg`, `border-line`) i kolor gracza przez `style` (`Refleks.tsx:62`, `:67`, `:69`, `:108`). Tło wiersza zwycięzcy to kolor gracza 16% (`:62`), puchar w kolorze gracza (`:67`). Zgodne (W-02, `CHECKS:74` kolumna kol = 0).
- Akcent: brak `btn-primary` i `accent` w pliku. Zgodne (W-05).
- Pole gry `Refleks.tsx:208-216`: `<button>` z `onPointerDown={tap}`, `touch-none select-none`, `min-h-80 flex-1` (pole ≥ 320 px). Zgodne (W-13, `CHECKS:390`).
- Bodziec: przed sygnałem `bg-surface text-fg-muted` „Czekaj…”, sygnał `bg-success text-bg` „Teraz!”, przełączane klasą bez `transition` (`:211-213`). Zgodne z `DESIGN.md` §4 „bodziec w grze na refleks”. Kolor nie jest jedynym sygnałem (zmienia się napis i jasność).
- Zaokrąglenia: `rounded-tile` (pole), `rounded-*-inset` (wiersze), `rounded-full` (kropka). Cieni brak. Zgodne.
- 360×640 (statycznie): faza gry: 24 + 92 (nagłówek) + 12 + 56 (`Stats`) + 12 + 320 (pole) + 24 ≈ 540 px. Ekran wyników: tabela `whitespace-nowrap` (`:48`, `CHECKS:572`): kolumny liczbowe „1000 ms” / „NAJLEPSZY” około 200 px z 296 px, kolumna nicku ma `max-w-0` + `truncate` (`:64`, `:71`), więc tabela nie wypycha ekranu w poziomie. Wykres `svg` z `viewBox` (`:102`). Zgodne.

**RF1** · `Refleks.tsx:23-121` (ekran końcowy) · `ZASADY.md` §4 „Wyniki mini-gry: komponent `Scores`, wiersz na gracza”, W-04 · **średnia** `[zbiorcze: wlasna-lista-wynikow]` · Wyniki to własna tabela (średnia, kary, najlepszy) i wykres zamiast `Scores`; tabela powiela „gra…” i „(ty)” nie ma wcale (wiersz gracza wyróżniony tylko grubością linii wykresu, `:109`). Propozycja: `Scores` z wynikiem „{avg} ms” na górze, pod nim tabela kar / najlepszego i wykres jako szczegóły; albo dopisać ekran Refleksu do wyjątków w `DESIGN.md` §6 i dodać „(ty)” przy własnym nicku.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Em-dash: brak. Kropka dziesiętna: brak ułamków (czasy całkowite w ms). Słowa: „Czekaj…”, „Teraz!”, „Falstart!”, „Za wolno!”, „gra…”, „limit czasu”. Polskie, bez wspólnych słów w innej roli. Zgodne.
- `Stats` (`:201-207`): „Runda”, „Kary” (`warn` przy karach), „Średnia”; jedyne liczby nad polem gry. Zgodne (W-01).
- `Intro` (`:187-193`): `time` „12 zmian koloru”, `task` „Dotknij pola, gdy zmieni kolor”, `score` z zasadą kary. Treść zgodna. `Preview` (`:124-133`) to `preview-quarter` 2,4 s w pętli z ujemnym opóźnieniem; przy reduced-motion zostaje „Czekaj…” (warstwa „Teraz!” bazowo `opacity-0`), czytelne (W-12 zgodne).
- Stany: „Teraz!” bez przejścia (bodziec), „gra…” dla nieoddanego wyniku, „limit czasu” dla pustej listy. Zgodne.
- Dostępność: kropka `aria-hidden` (`:69`), puchar z `aria-label="Zwycięzca"` (`:67`), wykres `aria-hidden` (`:102`). Zgodne.

**RF2** · `Refleks.tsx:215`, `:98-100` · `DESIGN.md` §5 „Liczby są mono”, W-16 · **niska** `[zbiorcze: liczby-mono]` · Czas reakcji w polu („{last} ms”, `text-2xl`) i skrajne wartości osi wykresu (`text-xs tabular-nums`) w Satoshi, bez `font-mono`. Propozycja: liczbę w polu w `<span className="font-mono tabular-nums">` (jak `Stoj.tsx:156`), osi wykresu dodać `font-mono`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Keyframes: tylko `preview-quarter` 2,4 s w `Preview` (`:128`, B-40 zgodny). W polu gry żadnej animacji ani przejścia (`CHECKS:1477`: „animacje w komponencie: brak”).
- Timery: `:154` (opóźnienie bodźca z serwera), `:158` (kara po 1 s bez dotknięcia), `:177` (przerwa 0,8 s po falstarcie, `ZASADY-GIER.md` :71) to logika gry, nie animacja; `reducedMotion` niepotrzebny. Sprzątanie `:181`. Zgodne.
- Pomiar: `performance.now()` w `tap` (`:170`) i w chwili ustawienia bodźca (`:155`), niezależny od animacji. Zgodne co do D-07 (pomiar nie zależy od animacji). Uwaga: RF4.
- Wibracje: brak `navigator.vibrate` w pliku (`CHECKS:1609`).

**RF3** · `Refleks.tsx:174-177`, `:215` · `ZASADY.md` §5 tabela wibracji „pomyłka 60”, `DESIGN.md` §5 „Błąd ma ikonę i tekst”, `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji” · **średnia** `[zbiorcze: brak-wibracji-pomylki]`, `[zbiorcze: pomylka-bez-znaku]` · Falstart (kara 1000 ms) nie wibruje i nie ma znaku pomyłki: pole zostaje `bg-surface text-fg-muted` z napisem „Falstart!”, bez `warning` i bez `tile-miss`, którym pomyłkę pokazują Stój! (`Stoj.tsx:145`), `Quiz.tsx`, Schulte, Sudoku, Dziesiątki. Propozycja: przy falstarcie `navigator.vibrate?.(60)`, pole `animate-[tile-miss_0.35s_ease-out] text-warning` (klucz przycisku jak w `Stoj.tsx:140`, żeby animacja ruszała przy każdym falstarcie). „Za wolno!” (`:158`) bez wibracji jest w porządku (gracz nic nie zrobił).

**RF4** · `Refleks.tsx:155`, `:170` · `ZASADY.md` §5 „Pomiar czasu” (dokładność), porównanie z `Rytm.tsx:85`, `Przytrzymaj.tsx:90`, `Zaslona.tsx:99` · **niska** `[zbiorcze: pomiar-timestamp]` · Reakcja = `performance.now()` w obsłudze zdarzenia minus `performance.now()` sprzed `setPhase("go")`, czyli sprzed narysowania bodźca: do wyniku dolicza się czas renderu i klatki (do około 16 ms, u wszystkich podobnie) oraz opóźnienie obsługi przy zajętym wątku. Trzy nowsze gry w tej paczce mierzą `e.timeStamp` z komentarzem „czas zdarzenia, nie obsługi”. Propozycja: `tap(e)` z `e.timeStamp`, a `goAt` ustawiać w `requestAnimationFrame` po zmianie fazy (pierwsza klatka z bodźcem).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie bodźca | brak, przeskok `bg-surface` → `bg-success` (zgodne z `DESIGN.md` §4) | brak | „Teraz!” |
| trafienie | brak; pole wraca do „Czekaj…” z czasem „{n} ms” | brak (zgodne) | „{n} ms” |
| pomyłka (falstart) | brak (RF3) | brak (RF3) | „Falstart!” |
| kara za brak reakcji | brak | brak | „Za wolno!” |
| koniec partii | brak; od razu tabela i wykres | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma (`Game.tsx:35`) | 40 (platforma) | - |

---

## Sekwencja (`simon`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory pól `Simon.tsx:15-20` (`#ff2445`, `#3b82f6`, `#facc15`, `#22c55e`, `CHECKS:152-155`): kolor jako treść gry z jednym źródłem w pliku (`PADS`), wymieniony w `DESIGN.md` §6. Odstępstwo z powodem (lista na końcu). Każde pole ma też kształt (`Circle`, `Square`, `Triangle`, `Star`, `:14`), więc kolor nie jest jedynym sygnałem. Zgodne.
- Pole gry: cztery `<button>` z `onPointerDown`, `touch-none select-none` (`:112-118`, `CHECKS:394`), każde około 158 × 158 px (siatka `aspect-square grid-cols-2 gap-3` na 328 px). Zgodne (W-06, W-13).
- W trakcie pokazu pola są `disabled` (`:116`) bez przygaszenia 40%: świadomie, bo pokaz musi być jasny; stan opisuje `Stats` „Teraz: Patrz / Powtórz” (`:107`), więc stan blokujący ma podpis (`DESIGN.md` §4 „Każdy stan, który coś blokuje, tłumaczy się podpisem”). Zgodne.
- Zaokrąglenia `rounded-tile` (pola), `rounded-inset` (podgląd). Cieni brak. Akcent jako przycisk: brak.
- 360×640 (statycznie): 24 + 92 + 12 + 56 + 12 + 328 (kwadrat pól) + 24 ≈ 548 px; w turnieju z podpisem „Turniej · gra n/m” około 568 px. Mieści się.

**SQ1** · `Simon.tsx:121` · `DESIGN.md` §2 (rola `accent-fg`: „tekst na akcencie”), D-04 · **niska** `[zbiorcze: accent-fg-poza-akcentem]` · Ikona zapalonego pola ma kolor `var(--color-accent-fg)` na tle koloru treści, nie akcentu (`CHECKS:202`); ta sama sztuczka w Stój! (`Stoj.tsx:28`, `:149`). Wartość jest równa `bg`, więc wizualnie nic się nie zmienia, ale token jest w cudzej roli. Waga niska, bo efekt wizualny jest zerowy (02-11 może ją podnieść do średniej dla spójności z W-02). Propozycja: `var(--color-bg)` / `text-bg`, jak w akcji w kolorze gracza (`DESIGN.md` §5).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Em-dash, kropka dziesiętna: brak. Słowa „Patrz”, „Powtórz”, „Seria”, „Teraz”. Zgodne.
- `Stats` (`:104-109`) z dwiema pozycjami; wynik w `Scores` (`:88`, W-04 zgodny, liczba całkowita).
- `Intro` (`:92-98`): `time` „Bez pośpiechu: co rundę dochodzi jeden krok”, `task`, `score` „najdłuższa seria, pierwsza pomyłka kończy grę”. Treść zgodna. `Preview` (`:27-40`): siatka 2×2 pól 48 px, `preview-quarter` 2,4 s z kolejnością przez ujemne `animationDelay` (`CHECKS:1105-1106`). Przy reduced-motion widać cztery przygaszone pola (bazowo `opacity-0` warstwy jasnej), czytelne. Zgodne.
- Dostępność: pola z `aria-label="Pole {n}"` (`:115`), ikony `aria-hidden` (`:124`). Zgodne. (Nazwy „Pole 1-4” nie mówią koloru ani kształtu; bez wpływu na grę dla widzących, czytnik i tak nie zagra w Sekwencję. Bez wpisu.)

Bez rozbieżności w tekstach.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- `transition-colors duration-100` na polach (`:118`, `CHECKS:1234`): reakcja na dotyk i zapalenie pola 100 ms, zgodne z tabelą §5.
- Keyframes: tylko `preview-quarter` w `Preview` (B-40).
- Timery: `later` (`:52`) planuje pokaz sekwencji (`:61-64`: 600 ms wstępu, pole świeci `LIT_MS` 450 ms, przerwa `GAP_MS` 150 ms, zgodne z `ZASADY-GIER.md` :77), błysk po dotknięciu 200 ms (`:75`) i przerwę 400 ms przed następną rundą (`:80`). Pokaz jest **treścią gry**, nie ozdobą: przy reduced-motion reguła globalna skraca tylko 100-ms przejście kolorów, a stany zapalenia trwają dalej 450 ms, więc sekwencja jest widoczna. `reducedMotion` nie jest potrzebny (por. B-53). Zgodne.
- Dotyk w trakcie pokazu: pola `disabled`, a `press` i tak wraca przy `phase !== "input"` (`:73`). Zgodne (pokaz nie jest animacją blokującą ruch, tylko fazą gry).
- Pomiar czasu: brak (gra bez pomiaru).

**SQ2** · `Simon.tsx:76` · `ZASADY.md` §5 tabela wibracji „pomyłka 60”, porównanie z grami „pierwsza pomyłka kończy partię” (Trzy kubki, Śledzenie, W pamięci wibrują, `CHECKS:1609`) · **średnia** `[zbiorcze: brak-wibracji-pomylki]` · Złe pole kończy partię bez wibracji. Propozycja: `navigator.vibrate?.(60)` przed `finish(length - 1)`.

**SQ3** · `Simon.tsx:74-76`, `:88` · `DESIGN.md` §5 „Błąd ma ikonę i tekst”, `ZASADY.md` §5 „Animacja ma pokazać, co się właśnie stało” · **średnia** `[zbiorcze: pomylka-bez-znaku]` · Po złym dotknięciu `setLit(pad)` i natychmiast `finish` przełącza ekran na `Scores`, więc gracz nie widzi błysku, który pole było złe, ani które było dobre; partia po prostu znika. Propozycja: przed `finish` krótka odsłona (np. 1 s: złe pole `tile-miss` 0,35 s, właściwe podświetlone), jak odsłona po pudle w Trzech kubkach (1 s) i Śledzeniu.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pokaz kroku sekwencji | zapalenie pola, `transition-colors` 100 ms, świeci 450 ms | brak | `Stats`: „Patrz” |
| trafienie (dobre pole) | błysk pola 200 ms, `transition-colors` 100 ms | brak (zgodne) | `Stats`: „Powtórz” |
| koniec rundy (seria powtórzona) | brak; 400 ms przerwy, potem pokaz | brak | „Patrz” |
| pomyłka | brak, od razu `Scores` (SQ3) | brak (SQ2) | - |
| koniec partii | brak; `Scores` | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Stoper (`stoper`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: tylko tokeny (`bg-surface`, `border-line`, `text-fg-muted`, `text-success` / `text-fg` / `text-warning` w odsłonie). Zgodne (`CHECKS:83`).
- Pole gry `Stoper.tsx:109-122`: `<button>` z `onPointerDown={stop}`, `touch-none select-none`, `min-h-80 flex-1`. Zgodne (W-13).
- Odchyłka w odsłonie (`:79-82`): kolor wg progów 100 / 500 ms plus liczba ze znakiem, więc kolor nie jest jedynym sygnałem. Zgodne. Progi wpisane lokalnie zamiast `grade` z `ui.tsx` (zob. PT3, ten sam wzór).
- Zaokrąglenia `rounded-tile`, `.tile`. Cieni brak. Akcent: brak.
- 360×640 (statycznie): pole 320 px + nagłówek ≈ 24 + 92 + 12 + 320 + 24 ≈ 472 px (bez `Stats`); u grającego nagłówek bez paska limitu jest niższy. „10,00” w `text-7xl` (72 px Satoshi) około 200 px szerokości z 328. Ekran końcowy: kafel czasu (około 170 px) + `Scores`. Mieści się.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Przecinek: `seconds` = `toFixed(2).replace(".", ",")` (`:16`), cel i odchyłka „10,00 s”, zgodne z `ZASADY.md` §4 (W-03). Minus to `−` (U+2212), plus `+` (`:80`). Em-dash: brak.
- Słowa: „Cel”, „Przygotuj się”, „Dotknij, gdy minie {cel}”, „Twój czas”. Zgodne.
- Wynik w `Scores` jako „{n} ms” (`:67`). Zgodne (W-04).
- `Intro` (`:92-105`): `time` opisuje odliczanie i zniknięcie po 3 s, `task` z celem, `score` „odchyłka od celu, mniej znaczy lepiej”. Zgodne. `Preview` (`:19-33`): cztery napisy „1,00” … „?,??” w `preview-quarter` 4 s z ujemnym opóźnieniem (`CHECKS:1131-1132`); przy reduced-motion widać „1,00” (reszta bazowo `opacity-0`). Zgodne.
- Liczby nad polem: Stoper nie ma `Stats`; cel i stoper są **w** polu gry (są treścią zadania). Zgodne z W-01 (nie jest to pasek liczb nad planszą).
- Dostępność: brak elementów ozdobnych poza podglądem (`aria-hidden` z `ui.tsx:297`). Zgodne.

**SP1** · `Stoper.tsx:78`, `:79`, `:116`, `:117`, `:25` · `DESIGN.md` §5 „Liczby są mono”, W-16 · **niska** `[zbiorcze: liczby-mono]` · Czas, odchyłka, cel i licznik (pole gry i odsłona) mają `tabular-nums`, ale krój Satoshi, bez `font-mono`; Za zasłoną w tej samej roli używa `font-mono` (`Zaslona.tsx:191`). Propozycja: `font-mono` przy każdej z tych liczb.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Keyframes: tylko `preview-quarter` (B-40). W polu gry ani w odsłonie brak animacji i przejść (`CHECKS:1512-1515`: „animacje w komponencie: brak”).
- Timer `setInterval` 30 ms (`:58`, `CHECKS:1395`) tylko odświeża wyświetlany licznik i kończy partię po `giveUp` (2 × cel); pomiar w `stop` (`:49`) liczy z `performance.now()`, więc nie zależy od odświeżania. Odliczanie 3, 2, 1 z tej samej różnicy (`:118`), dotknięcia w odliczaniu ignorowane (`:50`). Licznik znika po `STOPER_VISIBLE_MS` 3 s (`:118`, „?,??”). Zgodne z `ZASADY-GIER.md` :81-83. `reducedMotion` niepotrzebny (to nie animacja).
- Limit tury ukryty u grającego (`Game.tsx:210`, wspólne ustalenia). Odstępstwo z powodem.
- Wibracje: brak. Stoper nie ma pomyłki w sensie §5 (każde dotknięcie to wynik). Zgodne.

**SP2** · `Stoper.tsx:49`, `:112` · `ZASADY.md` §5 „Pomiar czasu” (dokładność) · **niska** `[zbiorcze: pomiar-timestamp]` · `stop` mierzy `performance.now()` w obsłudze, nie `e.timeStamp`; przy zajętym wątku (render co 30 ms z `setInterval`) obsługa może przyjść kilka ms po dotknięciu. Propozycja: `onPointerDown={(e) => stop(e.timeStamp)}` i liczyć `took` z czasu zdarzenia (jak `Rytm.tsx:85`).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| odliczanie / start stopera | brak (zmiana cyfr co 30 ms) | brak | „Przygotuj się”, potem „Dotknij, gdy minie {cel}” |
| zniknięcie licznika po 3 s | brak, przeskok na „?,??” | brak | - |
| odsłona prawdziwego wyniku | brak; kafel „Twój czas” i odchyłka ze znakiem w kolorze progu | brak | - |
| koniec partii | brak; `Scores` pod kaflem | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Stój! (`stoj`)

### Wygląd (UI-01, UI-02, UI-03)

- Bodziec (`Stoj.tsx:143-164`): zielony `bg-success text-bg` z napisem „Dotknij”, czerwony `bg-warning` z ikoną `HandPalm` i „Stój!”, zgaszony `bg-surface text-fg-muted`. Role tokenów zgodne z `DESIGN.md` §2 (`success` „bodziec dotknij”, `warning` „bodziec nie wolno w Stój!, zawsze z ikoną i tekstem”). Kolor nie jest jedynym sygnałem. Zgodne.
- Pole gry: `<button>` z `onPointerDown={tap}`, `touch-none select-none`, `min-h-80 flex-1` (`:138-143`, `CHECKS:398`). Zgodne (W-13).
- Akcent jako przycisk: brak. Zaokrąglenia `rounded-tile`. Cieni brak.
- 360×640 (statycznie): 24 + 92 + 12 + 56 + 12 + 320 + 24 ≈ 540 px. Ekran końcowy: `Results` z `Quiz.tsx` (ocena w 02-08). Mieści się.

**SJ1** · `Stoj.tsx:149`, `:28` · `DESIGN.md` §2 (rola `accent-fg`), D-04 · **niska** `[zbiorcze: accent-fg-poza-akcentem]` · Napis na czerwonym bodźcu (i w podglądzie) w `text-accent-fg` zamiast `text-bg` (`CHECKS:212-213`); wartość identyczna, rola cudza. Zielony bodziec obok używa `text-bg` (`:150`). Propozycja: `text-bg` w obu miejscach (jak SQ1).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Em-dash, kropka: brak. „−2” z U+2212 (`:154`). Słowa „Dotknij”, „Stój!”, „Do końca”, „Punkty”, „Błędy”. Zgodne.
- `Stats` (`:131-137`): „Punkty”, „Błędy” (`warn`), „Do końca {n} s”. Zegar partii 30 s jest zasadą gry (Stój! nie ukrywa czasu), liczby tylko w `Stats`. Zgodne (W-01). Trzy pozycje na 296 px mieszczą się.
- Czas ostatniego trafienia w polu `font-mono tabular-nums` (`:156`). Zgodne.
- `Intro` (`:112-118`): „30 sekund, tempo rośnie”, „Dotykaj zielonych pól, czerwonych nie wolno”, „Trafienie to punkt, dotknięcie czerwonego zabiera 2”. Zgodne. `Preview` (`:24-34`): zielone „Dotknij” pod spodem, czerwone „Stój!” w `preview-half` 2,4 s; przy reduced-motion widać zielone pole z napisem, czytelne.
- Dostępność: `HandPalm` w polu `aria-hidden` (`:159`); w podglądzie bez `aria-hidden`, ale rodzic ma `aria-hidden` (`CHECKS:769`, zgodne).
- Ekran końcowy: `Results` z `Quiz.tsx` z `note` (`:98-106`); wygląd tabeli ocenia 02-08 (D-03), tu bez wpisu.

Bez rozbieżności w tekstach.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Bodziec bez przejścia: przycisk nie ma żadnej klasy `transition` (`:143`). Zgodne (`DESIGN.md` §4, `ZASADY-GIER.md` :228).
- `tile-miss` 0,35 s `ease-out` przy dotknięciu czerwonego (`:145`, `CHECKS:1127`); restart przez zmianę `key` (`:140`). Ten sam czas i keyframes co pomyłka w `Quiz.tsx`, Schulte, Sudoku, Dziesiątki (W-10 zgodne; brak w liście §5 to B-46, `[zbiorcze: keyframes-poza-5]`, nie powtarzam). Następny bodziec zmienia `key` i przerywa animację, więc nie blokuje gry. Zgodne.
- Timery: `after` (`:46-48`) planuje bodźce od startu partii (logika gry), `setInterval` 100 ms (`:83`) odświeża „Do końca” i kończy partię. To nie animacje; `reducedMotion` niepotrzebny. Zgodne.
- Pomiar (`:53`, `:71`): `performance.now()`, niezależny od `tile-miss` (animacja działa tylko po dotknięciu, nie opóźnia bodźca). Zgodne co do D-07. Uwaga SJ2.
- Wibracja `navigator.vibrate?.(60)` tylko przy dotknięciu czerwonego (`:76`, `CHECKS:1591`); trafienie zielonego bez wibracji. Zgodne z tabelą §5 i `ZASADY-GIER.md` :229.

**SJ2** · `Stoj.tsx:53`, `:71` · `ZASADY.md` §5 „Pomiar czasu” (dokładność) · **niska** `[zbiorcze: pomiar-timestamp]` · Jak RF4: `shownAt` ustawiane przed narysowaniem bodźca, reakcja z `performance.now()` w obsłudze zamiast `e.timeStamp`. Przy oknie 300-600 ms i progu 100 ms kilka ms błędu ma znaczenie przy dotknięciach na granicy okna (`Math.min(reaction, window)`, `:74`). Propozycja: `tap(e)` z `e.timeStamp`, `shownAt` w `requestAnimationFrame` po `setShown`.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie bodźca | brak, przeskok koloru (zgodne) | brak | „Dotknij” / ikona + „Stój!” |
| trafienie (zielony) | brak; pole gaśnie, czas „{n} ms” w mono (wg `ZASADY-GIER.md`) | brak (zgodne) | „{n} ms” |
| pomyłka (czerwony) | `tile-miss` 0,35 s `ease-out` | 60 (zgodne) | „−2” w `warning` |
| koniec partii (30 s) | brak; `Results` z `Quiz.tsx` | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Rytm (`rytm`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: błysk metronomu `bg-fg` (pierwsze uderzenie taktu) / `bg-fg-muted` (pozostałe), stuknięcie gracza w jego kolorze przez `style` (`Rytm.tsx:156-158`), kropki uderzeń `bg-fg` / `bg-line` (`:143`), pasek `bg-fg-muted` na `bg-line` (`:147-148`). Tylko tokeny i kolor gracza. Zgodne z `ZASADY-GIER.md` :319 („błyska kolorem gracza”).
- Pole gry: `<button>` z `onPointerDown`, `touch-none select-none`, `min-h-80 flex-1` (`:151-155`); w fazie metronomu `onPointerDown` jest `undefined` (stuknięcia się nie liczą, `:154`). Zgodne (W-13).
- Zaokrąglenia: `rounded-tile`, `rounded-full` (kropki, pasek). Cieni brak. Akcent: brak.
- 360×640 (statycznie): u grającego brak paska limitu w nagłówku; 24 + 60 + 12 + 70 (kafel kropek i paska) + 12 + 320 + 24 ≈ 522 px. Mieści się.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Em-dash, kropka: brak (BPM i ms całkowite). Słowa „Słuchaj”, „Stukaj dalej”, „Twoje tempo”, „cel {n} BPM”. Zgodne.
- Brak licznika sekund i limitu na ekranie: kafel ma tylko kropki uderzeń i płynny pasek (`:146-149`, komentarz o 60 BPM), `Game.tsx:210` ukrywa limit. Zgodne z `ZASADY-GIER.md` :315-316. Odstępstwo z powodem (lista).
- Wynik w `Scores` jako „{n} ms” (`:107`). Zgodne.
- `Intro` (`:126-132`): „8 uderzeń metronomu, potem cisza”, „Stukaj dalej w tym samym tempie przez 10 sekund”, „średnia odchyłka odstępów”. Zgodne. `Preview` (`:25-27`): kropka `preview-half` 1 s w pętli; przy reduced-motion stoi widoczna kropka.
- Kafel kropek i paska `aria-hidden` (`:140`, ozdoba stanu). Pole ma tekst. Zgodne.

**RY1** · `Rytm.tsx:115`, `:116`, `:160` · `DESIGN.md` §5 „Liczby są mono”, W-16 · **niska** `[zbiorcze: liczby-mono]` · Numer uderzenia w polu (`text-7xl tabular-nums`) i tempo na ekranie końcowym bez `font-mono`. Propozycja: `font-mono`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Błysk metronomu i stuknięcia: `FLASH_MS` 100 ms (`:18`, `:73`, `:90`) przełączany klasą, bez `transition` na polu (`:155`). Błysk nie ma przejścia, które rozmywałoby początek uderzenia. Zgodne z tabelą §5 (reakcja na dotyk 100 ms) i z zasadą „bodziec bez przejścia”.
- Keyframes: tylko `preview-half` 1 s (B-39).
- Timery: `after` (`:45`) planuje uderzenia od `begin` (logika gry, nie animacja); `:90` gasi błysk stuknięcia. Dźwięk planuje `AudioContext` z dokładnym `when` (`:50-61`). `reducedMotion` niepotrzebny dla błysków (to bodziec, nie ozdoba).
- Pomiar: `e.timeStamp - r.last` (`:85`), gdzie `r.last` to wyliczony czas ostatniego uderzenia z tego samego zegara (`:43`), nie chwila wywołania timera ani klatka błysku. Pasek z przejściem szerokości nie wpływa na pomiar (`CHECKS:1487-1489` „do oceny” → zgodne). Zgodne.
- Wibracja `navigator.vibrate?.(30)` przy każdym uderzeniu metronomu (`:70`, `CHECKS:1571`): wzór spoza tabeli §5, ale opisany w `KONCEPT.md` §2.4 („klik, błysk i wibracja”) i `ZASADY-GIER.md` :317 („wibruje 30”); to część bodźca, a nie powiadomienie. Odstępstwo z powodem (lista) + RY3. Stuknięcia gracza nie wibrują (zgodne). Klik WebAudio: jedyny dźwięk platformy, odstępstwo z `KONCEPT.md` §1 (lista).

**RY2** · `Rytm.tsx:148` · `ZASADY.md` §5 „Czasy” (D-06), B-51 · **niska** `[zbiorcze: brak-w-tabeli-5]` · Płynny pasek 10 s to `transition-[width] ease-linear` z `transitionDuration: 10000ms`: czas spoza tabeli §5 (pasek postępu nie ma kategorii), a przy `prefers-reduced-motion` reguła globalna skraca przejście do 0,01 ms, więc pasek od razu staje się pełny i przestaje cokolwiek mówić. Propozycja: dopisać do §5 „pasek czasu gry: liniowo przez cały czas” i w Rytmie ustawiać szerokość z `requestAnimationFrame` od `r.last` (płynnie także przy reduced-motion, bo to informacja, nie ozdoba; por. B-53), albo uznać, że przy reduced-motion pasek może zniknąć.

**RY3** · `ZASADY.md` §5 tabela wibracji wobec `Rytm.tsx:70` i `ZASADY-GIER.md` :317 · `ZASADY.md` §5, D-13 (luka między źródłami) · **niska** · Tabela §5 wymienia tylko 40 / 60 / [60, 40, 60], a `KONCEPT.md` §2.4 i `ZASADY-GIER.md` opisują wibrację metronomu 30 ms. D-05 wymienia jako wyjątek tylko klik, nie wibrację. Propozycja: dopisać w §5 wiersz „uderzenie metronomu w Rytmie (część bodźca) | 30” albo przypis pod tabelą.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| uderzenie metronomu (bodziec) | błysk `bg-fg` / `bg-fg-muted` 100 ms, bez przejścia; kropka uderzenia zapala się | 30 (odstępstwo, RY3) + klik WebAudio | numer uderzenia 1-4 |
| stuknięcie gracza | błysk w kolorze gracza 100 ms, bez przejścia | brak (zgodne) | „Stukaj dalej” |
| upływ 10 s stukania | pasek `transition-[width]` 10 s liniowo (RY2) | brak | - |
| koniec partii | brak; kafel tempa i `Scores` | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Przytrzymaj (`przytrzymaj`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: świecenie `bg-fg`, trzymanie w kolorze gracza przez `style`, zgaszone `bg-surface text-fg-muted` (`Przytrzymaj.tsx:212-215`); odchyłki `text-success` / bez koloru / `text-warning` (`:25`), najlepszy w rundzie obrys i tło 28% koloru gracza (`:160`). Tylko tokeny i kolor gracza. Zgodne.
- Pole gry (`:205-216`): `onPointerDown` → `onPointerUp` / `onPointerCancel`, `setPointerCapture` (palec może zjechać, `:87`), `onContextMenu` z `preventDefault` (`:211`), `[-webkit-touch-callout:none]`, `touch-none select-none`, `min-h-80 flex-1`. Długie przytrzymanie nie otwiera menu ani zaznaczenia. Zgodne (W-13).
- Zaokrąglenia `rounded-tile`, `rounded-inset`, `rounded-full`. Cieni brak. Akcent: brak.
- 360×640 (statycznie): faza gry jak w Refleksie bez paska limitu ≈ 500 px; odsłona w polu (etykieta + 72 px + 28 px + 24 px ≈ 160 px) mieści się w 320 px. Tabela końcowa `grid-cols-[auto_repeat(5,1fr)]` (`:130`, `CHECKS:563`): `1fr` bez `minmax(0,1fr)`, ale najdłuższa komórka „−0,12” to 5 znaków mono 12 px ≈ 36 px, a kolumna ma około (296 − 40 − 20) / 5 ≈ 47 px, więc siatka się nie rozpycha. Zgodne statycznie (przy zmianie formatu warto dać `minmax(0,1fr)`).

**PT1** · `Przytrzymaj.tsx:112-176` · `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”, `ZASADY.md` §4 „Wyniki mini-gry: komponent `Scores`”, W-04, W-07 · **średnia** `[zbiorcze: wlasna-tabela-rund]` · Ekran końcowy to własna siatka (cele, odchyłki ze znakiem, suma w wierszu gracza) zamiast `Scores` + `RoundTable`. `ZASADY-GIER.md` :408 opisuje właśnie taką jedną tabelę („bez osobnej listy wyników”), więc to sprzeczność `ZASADY-GIER.md` z `ZASADY.md` §4 / `DESIGN.md` §5 (wygrywa `ZASADY.md`, D-13). Własna siatka powiela też `grade` (PT3) i wyróżnienie najlepszego z `RoundTable` (`ui.tsx:185-248`). Propozycja: rozszerzyć `RoundTable` o opcjonalny wiersz celów i znak odchyłki (`format` z `(error, raw)`), użyć `Scores` + `RoundTable` jak Za zasłoną; albo dopisać wyjątek do `DESIGN.md` §6.

### Teksty, liczby i dostępność (UI-04, UI-05)

- Przecinek: `seconds` z `.replace(".", ",")` (`:24`). Znak `−` (U+2212) / `+`. Em-dash: brak. Słowa „Patrz”, „Zapamiętaj czas”, „Przytrzymaj tak samo długo”, „Trzymaj”, „Twój czas”, „cel”, „(ty)”, „gra…”. Zgodne.
- Brak licznika sekund i limitu na ekranie (`:204` komentarz, `Game.tsx:210`). `Stats` (`:198-203`): „Runda”, „Suma odchyłek” (nie zdradza czasu). Zgodne. Odstępstwo z powodem (lista).
- `Intro` (`:181-187`): „5 rund, pole świeci się od 1 do 5 sekund”, „Przytrzymaj palec tak długo, jak świeciło pole”, „suma odchyłek”. Zgodne. `Preview` (`:28-40`): świecący kwadrat i kwadrat z dłonią na zmianę (`preview-half` 3 s, opóźnienie −1,5 s); przy reduced-motion widać świecący kwadrat. Ikona bez `aria-hidden` w podglądzie z `aria-hidden` rodzica (`CHECKS:757`, zgodne).
- Tabela: kropka `aria-hidden` (`:148`), liczby `font-mono tabular-nums` (`:130`, `:153`). Legenda pełnymi zdaniami (`:170-174`). Zgodne.

**PT2** · `Przytrzymaj.tsx:220`, `:221`, `:222` · `DESIGN.md` §5 „Liczby są mono”, W-16 · **niska** `[zbiorcze: liczby-mono]` · Odsłona w polu („Twój czas” 72 px, „cel … s”, odchyłka) z `tabular-nums`, bez `font-mono`. Propozycja: `font-mono` (jak `Zaslona.tsx:191`).

**PT4** · `Przytrzymaj.tsx:201` wobec `:221-224` i `:164` · `ZASADY.md` §4 „te same słowa co w innych grach” (spójność zapisu), porównanie z `Zaslona.tsx:158` · **niska** `[zbiorcze: jednostka-odchylki]` · Ta sama odchyłka jest na jednym ekranie w dwóch jednostkach: `Stats` „Suma odchyłek: 1234 ms”, a odsłona i tabela w sekundach („+0,12 s”). Za zasłoną pokazuje sumę w `Stats` w sekundach. Do tego „+0,00 s” przy idealnym trafieniu ma znak, a Za zasłoną go pomija i pisze „idealnie” (`Zaslona.tsx:149`, `:195`). Propozycja: `Stats` w sekundach przez `seconds`, zero bez znaku jak w Za zasłoną.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Świecenie i trzymanie bez przejść kolorów (`:204` komentarz, brak `transition` w `:212`). Zgodne (bodziec bez przejścia).
- Keyframes: tylko `preview-half` (B-39).
- Timery: `after` (`:57`) od startu rundy (zapalenie po 1 s, zgaszenie po celu), `:75` odsłona `REVEAL_MS` 1,5 s (zgodne z `ZASADY-GIER.md` :397), `:94` samo zakończenie po 2 × cel. Logika gry, nie animacja; `reducedMotion` niepotrzebny. Sprzątanie `:103-110`. Zgodne.
- Pomiar: `e.timeStamp` w `onPointerDown` i `onPointerUp` / `onPointerCancel` (`:90`, `:100`, `CHECKS:1465-1466`). Niezależny od animacji i od wątku. Zgodne.
- Odsłona 1,5 s nie jest animacją blokującą: dotknięcia w odsłonie są ignorowane (`:85`), bo to faza gry z `ZASADY-GIER.md`. Zgodne.
- Wibracje: brak. Gra nie ma pomyłki w sensie §5 (każde trzymanie to wynik). Zgodne.

**PT3** · `Przytrzymaj.tsx:20-25` · `ZASADY.md` §4 „Z czego gra się składa” (wspólne komponenty), B-67 · **niska** `[zbiorcze: wlasny-grade]` · Własne `grade` i progi 100 / 500 ms zamiast `grade(d, perfect, close)` z `ui.tsx:178`; ten sam lokalny wzór w `Stoper.tsx:79`. Wynik ten sam, ale dwie kopie progu. Propozycja: `grade(off, PERFECT, CLOSE).text` z `ui.tsx` (jak `Zaslona.tsx:191`), stałe `PERFECT` / `CLOSE` wspólne dla Stopera, Przytrzymaj i Za zasłoną.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie bodźca (pole świeci) | brak, przeskok na `bg-fg` | brak | „Zapamiętaj czas” |
| zgaszenie, czas na trzymanie | brak | brak | „Przytrzymaj tak samo długo” |
| trzymanie | pole w kolorze gracza, bez przejścia | brak | „Trzymaj” |
| odsłona prawdziwego wyniku | brak; 1,5 s czas, cel, odchyłka ze znakiem w kolorze progu | brak | - |
| koniec rundy | brak; po 1,5 s następna runda | brak | „Patrz” |
| koniec partii | brak; własna tabela (PT1) | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Za zasłoną (`zaslona`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: kulka w kolorze gracza (`Zaslona.tsx:184`), tor `bg-line`, zasłona `bg-fg/5` z obrysem `border-line` i metą `border-r-fg` (`:173`); w odsłonie obrys przerywany. Odchyłka przez `grade` z `ui.tsx` (`:191`, B-67). Tylko tokeny i kolor gracza. Zgodne.
- Pole gry: cały kafel jest `<button>` z `onPointerDown`, `touch-none select-none`, `onContextMenu` z `preventDefault`, `[-webkit-touch-callout:none]`, `min-h-48 flex-1` (`:162-167`). Zgodne (W-13).
- Zaokrąglenia: `.tile`, `rounded-inset` (podgląd), `rounded-full` (kulka). Cieni brak. Akcent: brak.
- 360×640 (statycznie): ≈ 24 + 60 + 12 + 56 + 12 + pole ≥ 192 px (rozciąga się `flex-1`) + 24, mieści się. Tor `w-[calc(100%-3rem)]` względny, bez stałych pikseli. `RoundTable` przy 8 rundach i formacie „0,12” (4 znaki): komórka około 34 px (B-68), mieści się (W-07 zgodne).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Przecinek: `seconds` (`:25`). Zero bez znaku i z „idealnie”, inaczej „−” / „+” z „za wcześnie” / „za późno” (`:148-149`, `:192-195`), więc kolor odchyłki nie jest jedynym sygnałem. Em-dash: brak. Zgodne.
- Brak licznika sekund i limitu (`:161` komentarz, `Game.tsx:210`). `Stats` (`:155-160`): „Runda”, „Suma odchyłek” w sekundach. Zgodne. Odstępstwo z powodem (lista).
- Liczby w odsłonie `font-mono tabular-nums` (`:191`, `:196`). Zgodne (W-16).
- Ekran końcowy: `Scores` + zdanie + `RoundTable` z `unit`, `format`, `legend` (`:116-128`). Zgodne (W-04, W-07). Legenda „ostrzegawczy” zamiast „czerwony”: B-69 `[zbiorcze: slowa]`, nie powtarzam.
- `Intro` (`:135-141`): „8 rund, kulka toczy się od 1 do 6 sekund” (rzeczywiście 1,8-6 s; zaokrąglenie w dół w opisie, bez wpływu), `task` i `score` zgodne. `Preview` (`:28-42`): kulka w kolorze gracza i „?” na zasłonie na zmianę, `preview-half` 3 s; przy reduced-motion widać kulkę przed zasłoną.
- Podpowiedź tylko w pierwszej rundzie (`:202`). Pole ma tekst albo podpowiedź; w rundach 2-8 przycisk nie ma tekstu ani `aria-label` (kulka i zasłona to `span` bez opisu).

**ZS1** · `Zaslona.tsx:162-167`, `:200-203` · `ZASADY.md` §4 „przyciski bez tekstu `aria-label`”, W-15 · **niska** `[zbiorcze: aria-hidden]` · Od drugiej rundy przycisk pola nie ma żadnego tekstu, więc czytnik ekranu ogłasza pusty przycisk. Propozycja: `aria-label="Dotknij, gdy kulka dotrze do mety"` na przycisku.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Ruch kulki: `requestAnimationFrame` (`:84-91`) ustawia `style.left` z czasu od `r.start`; brak przejścia CSS (`:161` komentarz). Ruch jest treścią gry (prędkość trzeba odczytać), więc przy reduced-motion kulka nadal jedzie (JS, nie CSS) i gra pozostaje grywalna. Brak `reducedMotion` to świadome odstępstwo opisane komentarzem `:78` (`CHECKS:22`, `:1426-1429`): na liście odstępstw z odsyłaczem do B-53 (luka w `ZASADY.md` §5, niska, wpis przy platformie).
- Zasłona i chowanie kulki: `clipPath` liczony z `maskLeft`, bez animacji (`:179`). Odsłona: zasłona przezroczysta z przerywanym obrysem, kulka w miejscu z chwili dotknięcia (`:152`, `:173`), bez przejścia. Zgodne z `ZASADY-GIER.md` :501-502.
- Timery: `:61` przerwa 1 s przed ruszeniem, `:70` odsłona `REVEAL_MS` 1,5 s, `:86` samo zakończenie po `visible + 2 × hidden`. Logika gry. Zgodne.
- Pomiar: `e.timeStamp - r.start - visible` (`:99`); pozycja kulki liczona z tego samego zegara (`now - r.start`), więc to animacja zależy od zegara pomiaru, a nie odwrotnie. Dotknięcie, gdy kulkę widać, ignorowane (`:100`). Zgodne z D-07 i `ZASADY-GIER.md` :515.
- Keyframes: tylko `preview-half` (B-39). Wibracje: brak (duża odchyłka nie jest pomyłką). Zgodne.

**ZS2** · `Zaslona.tsx:100` · `ZASADY.md` §5 „Ta sama sytuacja w nowej grze używa tej samej animacji”, porównanie z `Srodek.tsx:162` / `:91` i `Nozyczki.tsx:142` / `:80` (`shake` 0,3 s + wibracja 60, `CHECKS:18`) · **średnia** `[zbiorcze: dotyk-zignorowany]` · Dotknięcie ignorowane bez kary nie daje tu żadnego znaku, a w Środku i Nożyczkach ta sama sytuacja („zignorowane bez kary”, `ZASADY-GIER.md` :515 odsyła wprost do Środka) ma `shake` i wibrację 60. Która wersja jest dobra, rozstrzyga 02-11 (wibracja 60 przy „nie kara” w Środku też jest do oceny). Propozycja: jeden wzór dla „dotknięcie zignorowane”, np. `shake` 300 ms bez wibracji na torze w Za zasłoną; dopisać go do §5.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| pojawienie elementu (kulka rusza) | ruch z rAF, liniowo (treść gry, bez keyframes) | brak | podpowiedź w 1. rundzie |
| dotknięcie zignorowane (kulkę widać) | brak (ZS2) | brak (ZS2) | - |
| odsłona prawdziwego wyniku | brak; 1,5 s, zasłona przezroczysta, odchyłka ze znakiem | brak | „idealnie” / „za wcześnie” / „za późno” |
| koniec rundy | brak; 1 s przerwy, następna kulka | brak | - |
| koniec partii | brak; `Scores` + `RoundTable` | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Balon (`balon`)

### Wygląd (UI-01, UI-02, UI-03)

- Kolory: balon i podgląd w kolorze gracza (`Balon.tsx:28-29`, `:150`), „+n” `text-success`, „Pękł!” `text-warning` (`:158`), tabela: pęknięty `text-warning line-through`, zgarnięty na granicy `font-semibold text-success`, pusty `text-fg-muted` (`:105`). Tokeny w swoich rolach, kolor nigdy sam (przekreślenie, grubość, legenda `:115`). Zgodne.
- „Zgarnij {n} pkt” to `btn text-bg` z `backgroundColor` koloru gracza (`:165`), akcja w partii zgodna z `DESIGN.md` §5 (W-05); `onClick` dopuszczalny, bo to nie pomiar czasu (`CHECKS:423`). Nieaktywny w pauzie przez `.btn:disabled` 40% (B-25), a pauzę tłumaczy „+n” / „Pękł!”. Zgodne.
- Pole pompowania: `div` z `onPointerDown={pump}`, `touch-none select-none` (`:146`). Zgodne (W-13; gra nie mierzy czasu, ale szybkie stukanie wymaga `onPointerDown`).
- Kształt balonu `rounded-[50%]` (`:149`, `CHECKS:258`): elipsa jako kształt treści gry, nie zaokrąglenie kafla; odstępstwo z powodem (lista). Pozostałe: `.tile`, `rounded-inset`, `rounded-full`. Cieni brak.
- 360×640 (statycznie): kafel `aspect-square` z `max-w-[calc(100dvh-25rem)]` = 240 px przy 640 px wysokości; 24 + 92 + 12 + 56 + 8 + 240 + 8 + 48 + 8 + 40 (podpis w 2 liniach) + 24 ≈ 560 px. Tabela końcowa `grid-cols-10` (Tailwind: `minmax(0,1fr)`), komórka około 27 px na 2 cyfry 11 px. Mieści się.

**BL1** · `Balon.tsx:72-119` (tabela wytrzymałości) · `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”, W-07 · **średnia** `[zbiorcze: wlasna-tabela-rund]` · Tabela balonów (wytrzymałość, stuknięcia gracza) to własna siatka, opisana w `ZASADY-GIER.md` :426; `RoundTable` liczy błędy z progami, a tu wartości mają inne znaczenie (pęknięty / na granicy / pusty). Ta sama sprzeczność dokumentów co PT1 (D-13). Propozycja: `RoundTable` z trybem „własna klasa komórki” (`cell(row, i)`) albo wyjątek w `DESIGN.md` §6 dla tabel, które nie są błędami rund.

**BL2** · `Balon.tsx:87` · `DESIGN.md` §5 „Podpis to `.label`”, W-17 · **niska** `[zbiorcze: podpis-label]` · Nagłówek bloku „Balon wytrzymywał” w Satoshi 14 px `fg-muted`, nie `.label`. Propozycja: `className="label col-span-10 text-left"`.

**BL3** · `Balon.tsx:146` · `ZASADY.md` §4 „Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`”, W-15 · **niska** `[zbiorcze: aria-hidden]` · Pole pompowania to `div` z `onPointerDown`, bez roli, `aria-label` i fokusu; jedyna akcja „pompuj” jest niedostępna z klawiatury i dla czytnika (Zgarnij jest przyciskiem). Propozycja: `<button type="button" aria-label="Pompuj balon">` z tymi samymi klasami (jak pola w Refleksie i Stój!).

### Teksty, liczby i dostępność (UI-04, UI-05)

- Em-dash: brak. Kropka: brak ułamków. Słowa „Zgarnij {n} pkt”, „Pękł!”, „(ty)”, „bez odpowiedzi”, odmiana „pęknięty / pęknięte / pękniętych” (`:22`). Zgodne.
- `Stats` (`:139-145`): „Balon n/10”, „W balonie”, „Suma”; numer balonu w `Stats` (zgodne z planem). Zgodne (W-01).
- `Intro` (`:124-130`): „10 balonów, bez pośpiechu”, zadanie i punktacja. Zgodne. `Preview` (`:25-32`): duży balon miga (`preview-half` 3 s) wokół małego; przy reduced-motion widać duży balon na małym, czytelne.
- Wynik w `Scores` jako „{n} pkt ({k} pęknięte)” (`:77`). Zgodne (W-04). Liczby tabeli `font-mono text-[11px] tabular-nums` (`:86`), „+n” mono (`:157`). Zgodne.
- Komórki z `aria-label` dla pękniętego i pustego (`:107`), kropka `aria-hidden` (`:96`), balon `aria-hidden` (`:151`). Zgodne.

**BL4** · `Balon.tsx:109` · `AGENTS.md` / `ZASADY.md` §4 „bez em-dashy”, W-18 · **niska** `[zbiorcze: myslnik]` · Pusty balon w tabeli to „–” (en-dash, `CHECKS:599`). Litera reguły zakazuje em-dasha, a en-dash w roli „brak wartości” opisuje `ZASADY-GIER.md` :426 („pusty: kreska”) i legenda (`:115`), z `aria-label`. Waga niska zamiast średniej z CHECKS, bo to nie em-dash i znaczenie jest objaśnione; 02-11 decyduje, czy znak „brak wartości” ma być jeden w całej aplikacji (np. „0” w `fg-muted`). Propozycja: `0` w `text-fg-muted` i legenda „Szare 0: zgarnięty bez pompowania”.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Pompowanie: `transition-[width] duration-100` (`:149`, `CHECKS:1200`): reakcja na dotyk 100 ms, zgodna z tabelą §5; rozmiar zależy tylko od liczby stuknięć (`:150`, zgodne z `ZASADY-GIER.md` :424).
- „+n” / „Pękł!”: `float-up` 1,6 s `ease-out forwards` (`:157`, B-44, „zmiana liczby”). Zgodne co do keyframes i czasu. Uwaga BL5.
- Pęknięcie: balon znika od razu (`:135`), „Pękł!” w `warning` i `navigator.vibrate?.(60)` (`:58`, `CHECKS:1547`). Pęknięcie to utrata punktów balonu, czyli pomyłka w sensie §5 i wprost `ZASADY-GIER.md` :425 („wibracja 60”). Zgarnięcie bez wibracji. Zgodne.
- Timer `setTimeout` `PAUSE_MS` 800 ms (`:62-70`, `CHECKS:1286`): pauza między balonami z `ZASADY-GIER.md` :425 (logika gry, nie animacja; `reducedMotion` niepotrzebny). Przyciski w pauzie są nieaktywne z powodu zasady gry, a nie animacji; gra jest „bez pośpiechu” (limit 120 s), więc to nie „animacja blokująca ruch”. Zgodne.
- Keyframes: `preview-half` (B-39), `float-up` (B-44). Pomiar czasu: brak.

**BL5** · `Balon.tsx:16`, `:154-157` · `ZASADY.md` §5 tabela „pływająca liczba 1,6 s” · **niska** `[zbiorcze: animacja-ucieta]` · „+n” / „Pękł!” ma `float-up` 1,6 s, ale znika z DOM po `PAUSE_MS` 0,8 s (warunek `phase === "pause"`), czyli w połowie: przy 50% keyframes napis ma jeszcze krycie około 0,6 i znika skokiem. Propozycja: osobny stan „ostatni wynik” niezależny od fazy (napis zostaje do końca animacji, `pointer-events-none` już jest) albo krótsza animacja dopisana do tabeli §5.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku / w polu |
|---|---|---|---|
| reakcja na dotyk (pompowanie) | `transition-[width]` 100 ms | brak (zgodne) | „Zgarnij {n} pkt” |
| trafienie (zgarnięcie) | `float-up` 1,6 s „+n” w `success`, ucięte po 0,8 s (BL5) | brak (zgodne) | „Zgarnij” nieaktywny w pauzie |
| pomyłka (pęknięcie) | balon znika; `float-up` 1,6 s „Pękł!” w `warning`, ucięte po 0,8 s (inny znak pomyłki niż `tile-miss`, do macierzy 02-11) | 60 (zgodne) | - |
| pojawienie elementu (nowy balon) | brak, balon od razu w rozmiarze minimalnym | brak | - |
| koniec partii | brak; `Scores` + tabela wytrzymałości | brak | „Rewanż” / „Do lobby” z `Game.tsx` |
| moja tura | platforma | 40 (platforma) | - |

---

## Odstępstwa z powodem

Sprawdzone, zgodne z wyjątkami z `ZASADY.md`, `KONCEPT.md`, `ZASADY-GIER.md` i `DESIGN.md` §6 (D-04, D-05); bez wagi.

| Gra | Co | `plik:linia` | Powód (źródło) |
|---|---|---|---|
| Stoper, Rytm, Przytrzymaj, Za zasłoną | limit tury ukryty u grającego, brak licznika sekund | `Game.tsx:208-210`, `Rytm.tsx:146`, `Przytrzymaj.tsx:204`, `Zaslona.tsx:161` | `KONCEPT.md` §2.4, `ZASADY-GIER.md` :83, :315-316, :406-407, :516-517; D-05 |
| Rytm | klik metronomu (WebAudio), jedyny dźwięk | `Rytm.tsx:47-64` | `KONCEPT.md` §1 „Tryb cichy … jedyny wyjątek to klik metronomu”, D-05 |
| Rytm | wibracja 30 przy każdym uderzeniu metronomu | `Rytm.tsx:70` | `KONCEPT.md` §2.4, `ZASADY-GIER.md` :317 (część bodźca); brak wiersza w tabeli §5 to RY3 |
| Sekwencja | kolory pól spoza tokenów (w tym `#ff2445` równy wartości akcentu) | `Simon.tsx:15-20` | `DESIGN.md` §6 „pola Sekwencji”; jedno źródło `PADS`, do koloru kształt; czerwień pola to treść, nie akcja (nie powinna iść za tokenem `accent`) |
| Za zasłoną | ruch kulki z rAF bez `reducedMotion` | `Zaslona.tsx:78-91` | ruch jest treścią gry (komentarz `:78`); wyjątek jeszcze nie jest w `ZASADY.md` §5, wpis przy platformie: B-53 (niska) |
| Balon | kształt `rounded-[50%]` | `Balon.tsx:149` | elipsa balonu to kształt treści gry, nie zaokrąglenie kafla ze skali 20 / 10 / 999 px |
| Stój! | `Stats` „Do końca” z sekundami obok limitu platformy | `Stoj.tsx:135` | zegar partii 30 s to zasada gry (`ZASADY-GIER.md` :215), Stój! nie ukrywa czasu |

## Zestawienie wpisów

| ID | Gra | Waga | Krótko | `plik:linia` | Klucz |
|---|---|---|---|---|---|
| RF1 | Refleks | średnia | wyniki to własna tabela i wykres zamiast `Scores`, bez „(ty)” | `Refleks.tsx:23-121` | `wlasna-lista-wynikow` |
| RF3 | Refleks | średnia | falstart bez wibracji 60 i bez znaku pomyłki | `Refleks.tsx:174-177` | `brak-wibracji-pomylki`, `pomylka-bez-znaku` |
| SQ2 | Sekwencja | średnia | pomyłka bez wibracji 60 | `Simon.tsx:76` | `brak-wibracji-pomylki` |
| SQ3 | Sekwencja | średnia | pomyłka od razu przełącza na wyniki, bez odsłony | `Simon.tsx:74-76` | `pomylka-bez-znaku` |
| PT1 | Przytrzymaj | średnia | własna tabela końcowa zamiast `Scores` + `RoundTable` | `Przytrzymaj.tsx:112-176` | `wlasna-tabela-rund` |
| ZS2 | Za zasłoną | średnia | dotknięcie zignorowane bez znaku, w Środku / Nożyczkach `shake` + 60 | `Zaslona.tsx:100` | `dotyk-zignorowany` |
| BL1 | Balon | średnia | własna tabela wytrzymałości zamiast `RoundTable` | `Balon.tsx:72-119` | `wlasna-tabela-rund` |
| RF2 | Refleks | niska | liczby bez `font-mono` | `Refleks.tsx:215`, `:98-100` | `liczby-mono` |
| RF4 | Refleks | niska | pomiar z `performance.now()` sprzed narysowania bodźca | `Refleks.tsx:155`, `:170` | `pomiar-timestamp` |
| SQ1 | Sekwencja | niska | `accent-fg` jako ciemna ikona na kolorze treści | `Simon.tsx:121` | `accent-fg-poza-akcentem` |
| SP1 | Stoper | niska | liczby bez `font-mono` | `Stoper.tsx:78`, `:116-117` | `liczby-mono` |
| SP2 | Stoper | niska | pomiar w obsłudze, nie z `e.timeStamp` | `Stoper.tsx:49` | `pomiar-timestamp` |
| SJ1 | Stój! | niska | `text-accent-fg` na `warning` | `Stoj.tsx:149`, `:28` | `accent-fg-poza-akcentem` |
| SJ2 | Stój! | niska | pomiar z `performance.now()` sprzed narysowania bodźca | `Stoj.tsx:53`, `:71` | `pomiar-timestamp` |
| RY1 | Rytm | niska | liczby bez `font-mono` | `Rytm.tsx:115-116`, `:160` | `liczby-mono` |
| RY2 | Rytm | niska | pasek 10 s jako przejście CSS: poza tabelą §5, przy reduced-motion od razu pełny | `Rytm.tsx:148` | `brak-w-tabeli-5` |
| RY3 | Rytm | niska | tabela wibracji §5 bez wzoru 30 metronomu | `Rytm.tsx:70`, `ZASADY.md` §5 | - |
| PT2 | Przytrzymaj | niska | liczby odsłony bez `font-mono` | `Przytrzymaj.tsx:220-222` | `liczby-mono` |
| PT3 | Przytrzymaj | niska | własne `grade` zamiast `ui.tsx` (też Stoper) | `Przytrzymaj.tsx:20-25`, `Stoper.tsx:79` | `wlasny-grade` |
| PT4 | Przytrzymaj | niska | odchyłka w ms w `Stats`, w s w odsłonie; „+0,00” ze znakiem | `Przytrzymaj.tsx:201`, `:221-224` | `jednostka-odchylki` |
| ZS1 | Za zasłoną | niska | pole bez tekstu i `aria-label` od 2. rundy | `Zaslona.tsx:162-167` | `aria-hidden` |
| BL2 | Balon | niska | nagłówek bloku nie jako `.label` | `Balon.tsx:87` | `podpis-label` |
| BL3 | Balon | niska | pole pompowania to `div` bez roli i `aria-label` | `Balon.tsx:146` | `aria-hidden` |
| BL4 | Balon | niska | en-dash „–” dla pustego balonu | `Balon.tsx:109` | `myslnik` |
| BL5 | Balon | niska | `float-up` 1,6 s ucinane po 0,8 s | `Balon.tsx:154-157` | `animacja-ucieta` |

Razem: **0 wysokich, 7 średnich, 18 niskich**. Wysokich nie ma: każde pole gry na czas ma `onPointerDown` i `touch-none select-none`, bodźce nie mają przejść, pomiar nie zależy od animacji, żaden ekran nie przekracza 360×640 (statycznie), cztery gry z ukrytym czasem nie pokazują limitu ani licznika.

Nowe klucze `[zbiorcze: …]` (spoza 02-01 / 02-02): `wlasna-lista-wynikow`, `wlasna-tabela-rund`, `brak-wibracji-pomylki`, `pomylka-bez-znaku`, `dotyk-zignorowany`, `pomiar-timestamp`, `accent-fg-poza-akcentem`, `wlasny-grade`, `jednostka-odchylki`, `podpis-label`, `myslnik`, `animacja-ucieta`.

## Do sprawdzenia w przeglądarce (poza zasięgiem sprawdzenia statycznego)

- Wysokość ekranów końcowych przy 6 graczach (Refleks: tabela + wykres, Przytrzymaj: tabela, Balon: tabela) i czy przewijanie pionowe jest akceptowalne obok przycisków „Rewanż” / „Do lobby”.
- Odczucie błysku 100 ms w Rytmie i Przytrzymaj na prawdziwym ekranie (60 / 120 Hz) oraz rozjazd błysku z `setTimeout` względem kliku z `AudioContext`.
- Opóźnienie od `setPhase` do pierwszej klatki bodźca w Refleksie i Stój! (RF4, SJ2), czyli realna wielkość błędu pomiaru.
- Zachowanie `onPointerDown` na `disabled` przyciskach Sekwencji w różnych przeglądarkach (dziś bez skutku, bo `press` i tak sprawdza fazę).

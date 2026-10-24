# 02-02 BASELINE: wzorce platformy (`index.css`, `ui.tsx`)

Punkt odniesienia dla planów 02-03..02-10 (D-10). Gra, która używa wzorca oznaczonego tu jako **zgodny**, odsyła do numeru B-xx
i nie sprawdza go od nowa. Rozbieżność we wzorcu to jeden wpis tutaj (D-03); gry jej nie powtarzają.

- Źródła: `ZASADY.md` §4 (wygląd) i §5 (animacje i wibracje), `DESIGN.md` §2-§5, `AGENTS.md` (twarde reguły UI).
- Wagi wg D-07. Klucze `[zbiorcze: …]` są robocze: `02-01-CHECKS.md` nie istniał w chwili pisania (plan 02-01 szedł równolegle),
  więc 02-11 dopasowuje je do kluczy z CHECKS przy scalaniu.
- **360×640 sprawdzono statycznie** (D-09): szerokości z klas Tailwinda i szacunek szerokości znaków Geist Mono (około 0,6 em), bez przeglądarki.
- Stan kodu: gałąź `labirynt`, `apps/web/src/index.css` (368 linii), `apps/web/src/screens/ui.tsx` (335 linii), 2026-10-23.

Legenda kolumny „Ocena”: **zgodny**, **rozbieżność (wysoka / średnia / niska)**, **odstępstwo** (wyjątek z D-04/D-05, bez wagi, na liście na końcu).

## index.css

### Tokeny `@theme` wobec `DESIGN.md` §2

| ID | Token | `plik:linia` | Wartość w kodzie | `DESIGN.md` §2 | Ocena |
|---|---|---|---|---|---|
| B-01 | `bg` | `index.css:14` | `#0e0e10` | `#0e0e10`, tło strony, wnętrze podglądu | zgodny (użyty w `html` :44, `Intro` `ui.tsx:297`, `StickyBar` `ui.tsx:252`) |
| B-02 | `surface` | `index.css:15` | `#161618` | `#161618`, pasek statystyk, karty rekordów | zgodny (`Stats` `ui.tsx:163`) |
| B-03 | `surface-inset` | `index.css:16` | `#111113` | `#111113`, pola formularza | zgodny (`.field` :126) |
| B-04 | `surface-glass` | `index.css:17` | `rgb(22 22 24 / 0.55)` | to samo + blur 16 px, kafel `.tile` | zgodny (`.tile` :66-67 ma `backdrop-filter: blur(16px)`) |
| B-05 | `line` | `index.css:18` | biel 8% | biel 8%, obrys i separator | zgodny |
| B-06 | `line-hover` | `index.css:19` | biel 16% | biel 16%, obrys pola i przycisku pod kursorem | zgodny (`.field` :124, `.btn-ghost:hover` :118) |
| B-07 | `fg` | `index.css:21` | `#ededef` | `#ededef`, tekst | zgodny |
| B-08 | `fg-muted` | `index.css:22` | `#8b8b92` | `#8b8b92`, opisy, podpisy, ikony pomocnicze | zgodny (`.label` :76, ikony `Intro` `ui.tsx:309`) |
| B-09 | `fg-subtle` | `index.css:24` | `#5c5c63` | `#5c5c63`, tylko nieistotne detale | zgodny; komentarz :23 ostrzega o kontraście. W `ui.tsx` nieużywany. Role w grach sprawdzają plany fali 2 (W-02) |
| B-10 | `accent` | `index.css:26` | `#ff2445` | `#ff2445`, główna akcja, focus, zaznaczony kafel | zgodny (`.btn-primary` :106, focus :101) |
| B-11 | `accent-soft` | `index.css:28` | akcent 12% | akcent 12%, ikona wyzwania dnia, pasek „Łączenie ponownie…” | zgodny (`Screen` `ui.tsx:12`) |
| B-12 | `accent-fg` | `index.css:30` | `#0e0e10` | `#0e0e10`, tekst na akcencie | zgodny (`.btn-primary` :107) |
| B-13 | `warning` | `index.css:32` | `#ff6369` | `#ff6369`, ostatnie 10 s, pomyłka, kara, błąd formularza, „nie wolno” | zgodny (`.field[aria-invalid]` :140, `tile-miss` :312, `Stats` `warn` `ui.tsx:167`, `grade` `ui.tsx:179`). Komentarz :31 opisuje tylko „koniec czasu tury”, węższy niż rola w `DESIGN.md` (niska, B-17) |
| B-14 | `success` | `index.css:34` | `#3dd68c` | `#3dd68c`, trafienie, bodziec „dotknij” | zgodny (`tile-hit` :305, `grade` `ui.tsx:179`). Komentarz :33 („odpowiedź na właściwą literę”) węższy niż rola (niska, B-17) |
| B-15 | `accent-hover` | `index.css:27` | `#ff4560` | **brak w tabeli** | rozbieżność niska: token istnieje i działa (`.btn-primary:hover` :110), ale `DESIGN.md` §2 go nie wymienia. Źródło: `DESIGN.md` §2. Propozycja: dopisać wiersz „`accent-hover` `#ff4560`, akcent pod kursorem (tylko `.btn-primary`)” |
| B-16 | czcionki, zaokrąglenia | `index.css:36-40` | `--font-sans` Satoshi, `--font-mono` Geist Mono Variable, `--radius-tile` 20 px, `--radius-inset` 10 px | Satoshi / Geist Mono; 20 / 10 / 999 px | zgodny. 999 px nie ma tokenu (wpisane w `.btn` :85 i jako `rounded-full`), co wystarcza |
| B-17 | komentarze tokenów | `index.css:31`, `:33` | „koniec czasu tury”, „odpowiedź na właściwą literę” | role szersze (`DESIGN.md` §2) | rozbieżność niska `[zbiorcze: komentarz-nieaktualny]`: komentarz zawęża rolę tokenu i może skłaniać do szukania innego koloru dla pomyłki albo trafienia. Propozycja: komentarze jak kolumna „Rola” w `DESIGN.md` §2 |
| B-18 | lista tokenów w `ZASADY.md` | `ZASADY.md` §4 „Z czego gra się składa” | wymienia 8 tokenów (`bg`, `surface`, `line`, `fg`, `fg-muted`, `accent`, `warning`, `success`) i zaokrąglenia 20 / 10 px | `DESIGN.md` §2: 13 tokenów, zaokrąglenia 20 / 10 / 999 px | rozbieżność niska (sprzeczność źródeł, D-13): `surface-inset`, `surface-glass`, `line-hover`, `fg-subtle`, `accent-soft`, `accent-fg` i 999 px są dozwolone według `DESIGN.md`, a `ZASADY.md` ich nie wymienia. Plany fali 2 traktują je jako dozwolone (D-04 odsyła do `@theme`). Propozycja: w `ZASADY.md` §4 odesłać do tabeli `DESIGN.md` §2 zamiast listy |

Kolory graczy (`PLAYER_COLORS`) nie są w `@theme` i nie muszą (`DESIGN.md` §2: dane, nie dekoracja); w `ui.tsx` idą zawsze przez `style` (B-59, B-60, B-68). Zgodny.

### Tło i poświata

| ID | Wzorzec | `plik:linia` | Źródło | Ocena |
|---|---|---|---|---|
| B-19 | `html`: tło `bg`, tekst `fg`, Satoshi, `-webkit-tap-highlight-color: transparent` | `index.css:43-49` | `AGENTS.md` (tylko ciemny motyw), `DESIGN.md` §1 | zgodny. Brak błysku przy dotknięciu na Androidzie |
| B-20 | brak `color-scheme: dark` | `index.css:43-49` (i `apps/web/index.html`, jest tylko `meta theme-color` :6) | `AGENTS.md` „tylko ciemny motyw”, `ZASADY.md` §4 „Reguły” | rozbieżność niska: natywne kontrolki bez własnego stylu (pasek przewijania, strzałki `input type=number`, klawiatura daty, lista `select`) mogą rysować się jasno. Propozycja: `color-scheme: dark;` w `html` |
| B-21 | poświata `body::before`: `radial-gradient(60vmax 60vmax at 85% -10%, …16%…)`, `position: fixed`, `pointer-events: none`, kolor z `--ambient` (domyślnie `accent`) | `index.css:53-60` | `DESIGN.md` §1 p. 1 (16%, 60vmax, nieruchoma), §5 „Ruch tłumaczy, nie zdobi” | zgodny: 16%, 60vmax, prawy górny róg, bez `animation` i bez `transition` (zmiana `--ambient` przeskakuje od razu, czyli nieruchoma). `--ambient` ustawia `Game.tsx` (poza zakresem 02-02) |

### Klasy wspólne

| ID | Klasa | `plik:linia` | Źródło | Ocena |
|---|---|---|---|---|
| B-22 | `.tile`: obrys 1 px `line`, `radius-tile` 20 px, `surface-glass` z blur 16 px, wnętrze 20 px | `index.css:63-69` | `DESIGN.md` §2 (kształt, `surface-glass`), §5 „Obrys przed wypełnieniem”; `ZASADY.md` §4 | zgodny. Gęste listy nadpisują wnętrze `p-3`/`p-4` (12-16 px, dozwolone w `DESIGN.md` §2 „Kształt i odstępy”) |
| B-23 | `.label`: Geist Mono 11 px, wersaliki, odstęp 0,08em, `fg-muted` | `index.css:71-77` | `DESIGN.md` §2 typografia, §5 „Podpis to `.label`” | zgodny |
| B-24 | `.btn`: `min-height: 48px`, pigułka 999 px, `padding: 0 24px`, waga 500, przejścia `transform`/`background-color`/`border-color` 180 ms, `:active` skala 0,98 | `index.css:79-95` | `ZASADY.md` §4 „pola dotykowe co najmniej 48 px (tyle ma `.btn`)”, §5 tabela „przycisk, przejście stanu 180 ms”; `DESIGN.md` §2 | zgodny |
| B-25 | `.btn:disabled`: krycie 40% | `index.css:96-98` | `DESIGN.md` §4 „przycisk nieaktywny: krycie 40%, bez reakcji na dotyk” | zgodny: natywny `disabled` nie przyjmuje kliknięć, a `:active:not(:disabled)` (:93) i `:hover:not(:disabled)` (:109, :117) wyłączają reakcję. Podpis „dlaczego” to obowiązek ekranu, nie klasy |
| B-26 | focus `.btn` i `.field`: obrys 2 px `accent`, odsunięcie 2 px, tylko `:focus-visible` | `index.css:99-103` | `DESIGN.md` §4 „focus (klawiatura)” | zgodny |
| B-27 | `.btn-primary`: tło `accent`, tekst `accent-fg`, hover `accent-hover` | `index.css:105-111` | `DESIGN.md` §2, §5 „Akcent jest rzadki”, „Akcent należy do platformy” | zgodny jako klasa; liczba wypełnionych przycisków na ekranie to sprawdzenie per ekran (W-05) |
| B-28 | `.btn-ghost`: obrys 1 px `line`, tekst `fg`, hover `line-hover` | `index.css:113-119` | `DESIGN.md` §5 „Obrys przed wypełnieniem” | zgodny |
| B-29 | brak wspólnej klasy dla akcji w partii (`btn text-bg` + `backgroundColor` koloru gracza) | (brak w `index.css`); wzór w 3 plikach, grep `btn text-bg` | `DESIGN.md` §5 „Akcent należy do platformy, kolor gracza do partii”; `ZASADY.md` §4 „nowa klasa wspólna powstaje dopiero, gdy potrzebuje jej druga gra” | rozbieżność niska: wzorzec ma już trzech użytkowników, a jest tylko opisem w `DESIGN.md`, więc łatwo o `btn-primary` w akcji w partii (to byłaby rozbieżność średnia w grze). Propozycja: klasa `.btn-player` (`color: var(--color-bg)`, tło z `--player`) albo przynajmniej wpis w `ZASADY.md` §4 |
| B-30 | `.field`: `min-height: 48px`, obrys `line-hover`, `radius-inset`, tło `surface-inset`, 16 px (bez zoomu iOS), focus: ramka `accent`; `aria-invalid="true"`: ramka i obrys focusu w `warning` | `index.css:121-142` | `DESIGN.md` §4 „pole w edycji”, „błąd formularza” | zgodny. Ikona, tekst 14 px i `role="alert"` pod polem to obowiązek ekranu (`Problem` w `Home.tsx`, plan 02-04) |
| B-31 | `.swatch-range`: tor 36 px wysokości | `index.css:145-152` | `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”; `AGENTS.md` „pola dotykowe min. 48 px” | rozbieżność średnia `[zbiorcze: dotyk-48]`: suwak (Odcień `Kolor.tsx:197`, Który rok? `Rok.tsx:187`) ma 36 px wysokości, uchwyt WebKit 40 px (:156), Firefox 34 px (:164). Propozycja: `height: 48px` toru (albo przezroczysty obszar dotyku 48 px wokół toru 36 px) |
| B-32 | `.swatch-range` uchwyt: `#fff`, `#000`, `box-shadow`, promień 6 px | `index.css:158-159`, `:166-167`, `:157`, `:165` | `ZASADY.md` §4 „kolory tylko z tokenów, zaokrąglenia 20 / 10 px”; `DESIGN.md` §2 (cień tylko Kampus Tour i `set-glow`) | rozbieżność średnia `[zbiorcze: kolor-spoza-tokenow]` (kolor) i niska `[zbiorcze: cien]`, `[zbiorcze: promien]`: biała ramka z czarną obwódką ma powód (widać ją na każdym odcieniu toru), ale nie ma go w `DESIGN.md` §6. Propozycja: `fg` i `bg` zamiast `#fff`/`#000` i dopisanie uchwytu do `DESIGN.md` §6 jako wyjątku; promień 6 px zostawić albo zmienić na `radius-inset` |
| B-33 | komentarz `.swatch-range` | `index.css:144` | `ZASADY.md` §5 „Mechanizm” (komentarz, do czego służy) | rozbieżność niska `[zbiorcze: komentarz-nieaktualny]`: „Suwak koloru (Kolor z pamięci)”, a klasa służy też suwakowi roku w Który rok? (`Rok.tsx:187`), a gra nazywa się Odcień. Propozycja: „Gruby suwak (Odcień, Który rok?)” |
| B-34 | `.landscape`: cały ekran, w pionie obrót o 90° | `index.css:177-191` | `DESIGN.md` §6 „Kampus Tour ma własny układ poziomy” | odstępstwo (lista na końcu) |

### Katalog `@keyframes`

Czas użycia: z `grep -rnoE "animate-\[<nazwa>…\]"` po `apps/web/src` (skrypt powtarzalny: pętla w załączniku A). Kategorie tabeli czasów `ZASADY.md` §5 według D-06.

| ID | `@keyframes` | `plik:linia` | Komentarz w kodzie | W liście §5 „Najpierw istniejące” | Użycia (czas) | Ocena |
|---|---|---|---|---|---|---|
| B-35 | `set-glow` | `index.css:194` | tak: „Świeżo zebrany komplet w Kampus Tour” | tak („świeże osiągnięcie”) | `KampusTour.tsx:803`, `Records.tsx:144` (0,9 s `ease-in-out` ×4) | zgodny co do roli i cienia (`DESIGN.md` §2 dopuszcza cień w `set-glow`). Niska `[zbiorcze: komentarz-nieaktualny]`: komentarz mówi tylko o Kampus Tour, a używa go też ekran „Rekordy” (nowy rekord). Niska `[zbiorcze: brak-w-tabeli-5]`: „świeże osiągnięcie” nie ma czasu w tabeli §5 (D-06); propozycja: dopisać „świeże osiągnięcie: 0,9 s × 4” |
| B-36 | `ring-pulse` | `index.css:205` | tak: „Chińczyk: pionek, którym można się ruszyć” | tak („to można wybrać”) | `Chinczyk.tsx:219` (1 s ∞), `Memory.tsx:90` (1,2 s ∞), `Game.tsx:525` (1,2 s ∞, „Rewanż”, gdy inni już chcą) | zgodny co do roli. Średnia `[zbiorcze: ring-pulse-czas]`: ta sama sytuacja („to można wybrać”) ma 1 s w Chińczyku i 1,2 s gdzie indziej (`ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”); propozycja: jeden czas (1,2 s) i dopisanie go do tabeli §5 (pętla wskazania nie ma kategorii, D-06). Niska `[zbiorcze: komentarz-nieaktualny]`: komentarz wymienia tylko Chińczyka |
| B-37 | `stone-pop` | `index.css:217` | tak: „Pięć w rzędzie: świeżo postawiony kamień” | tak („coś pojawia się na planszy”) | 0,35 s `ease-out`: `Memory.tsx:104`, `PiecWRzedzie.tsx:69`, `Labirynt.tsx:151`, `Mapa.tsx:177`, `Statki.tsx:373`; 0,5 s: `ui.tsx:125`, `Game.tsx:306`; 180 ms: `WPamieci.tsx:130` | zgodny przy 0,35 s (tabela §5 „pojawienie się elementu 350 ms, `ease-out`”). Niska `[zbiorcze: czas-pojawienia]`: 0,5 s w odznace wygranych (`ui.tsx:125`, B-63) i w liczbie wygranych w `Game.tsx:306`; 180 ms w `WPamieci.tsx:130` (ocena w 02-10). Niska: komentarz wymienia tylko Gomoku, a to ogólne „pojawienie się” |
| B-38 | `line-draw` | `index.css:225` | tak: zwycięska linia w Gomoku (`pathLength=1`) | **nie** | `PiecWRzedzie.tsx:100` (0,5 s `ease-out` `backwards`), `Kolo.tsx:166` (2,5 s ∞, podgląd) | rozbieżność niska `[zbiorcze: keyframes-poza-5]` (D-06): brak w liście §5 i brak kategorii czasu („dorysowanie linii”). Propozycja: dopisać do listy §5 „`line-draw` (linia rysuje się od początku do końca)” |
| B-39 | `preview-half` | `index.css:235` | tak (wspólny z `preview-quarter`, :231-234) | tak | 24 użycia w podglądach, cykl 1-3 s `linear` ∞, kolejność ujemnym `animation-delay` | zgodny. Czas cyklu nie ma wiersza w tabeli §5 i nie musi (to pętla podglądu, opisana w §5 „Najpierw istniejące”) |
| B-40 | `preview-quarter` | `index.css:246` | tak (:231-234) | tak | 6 użyć (`Refleks`, `Sudoku`, `WPamieci`, `Schulte`, `Simon`, `Stoper`), cykl 2,4-4 s | zgodny |
| B-41 | `title-pop` | `index.css:258` | tak: „Wygrywasz!” u zwycięzcy | **nie** | `Game.tsx:243` (0,5 s `cubic-bezier(0.2,0.8,0.4,1)`, tylko u zwycięzcy) | rozbieżność niska `[zbiorcze: keyframes-poza-5]`: brak w liście §5; czas 0,5 s poza tabelą (najbliższe „pojawienie 350 ms, `ease-out`”). Propozycja: dopisać „`title-pop` (wygrana)” z czasem 0,5 s albo skrócić do 350 ms `ease-out` |
| B-42 | `dice-tumble` | `index.css:266` | tak: „Turlanie kostki w Kampus Tour” | tak („rzut kośćmi”) | `KampusTour.tsx:293`, `Chinczyk.tsx:108` (0,3 s ∞, w trakcie `ROLL_MS`) | zgodny: pętla 0,3 s trwa tyle, ile `ROLL_MS` (700 ms w tabeli §5), sprawdzają to 02-03 i 02-05. Niska: komentarz wymienia tylko Kampus Tour |
| B-43 | `card-in` | `index.css:280` | tak: „Karta Dziekanatu w Kampus Tour” | tak („karta lub okno na środku”) | `KampusTour.tsx:987`, `:1033`, `:1073`, `KampusSummary.tsx:41` (0,35 s `ease-out`) | zgodny (350 ms, `ease-out`) |
| B-44 | `float-up` | `index.css:288` | tak: kwota w Kampus Tour i „+1” nad zwycięzcą | tak („zmiana liczby”) | `ui.tsx:132`, `Game.tsx:311`, `KampusTour.tsx:756`, `Balon.tsx:157`, `Wieza.tsx:162` (1,6 s `ease-out` `forwards`) | zgodny (1,6 s). Komentarz nie wymienia Balonu i Wieży (niska, `[zbiorcze: komentarz-nieaktualny]`) |
| B-45 | `tile-hit` | `index.css:303` | tak: „Tabela Schultego: zielony błysk trafionego kafelka” | **nie** | 0,35 s `ease-out`: `Quiz.tsx:256`, `Dziesiatki.tsx:142`, `Sudoku.tsx:157`, `Schulte.tsx:141`, `Wieza.tsx:146` | rozbieżność niska `[zbiorcze: keyframes-poza-5]`: brak w liście §5, choć to wspólny znak trafienia w pięciu plikach; 0,35 s nie pasuje do „reakcja na dotyk 100 ms” ani do „pojawienia”. Kolor z tokenu `success` (zgodny). Niska `[zbiorcze: komentarz-nieaktualny]`: komentarz mówi tylko o Schultem. Propozycja: dopisać do §5 „`tile-hit` / `tile-miss` (trafienie / pomyłka na kaflu), 350 ms” |
| B-46 | `tile-miss` | `index.css:310` | tak (wspólny komentarz z `tile-hit`, :302) | **nie** | 0,35 s `ease-out`: `Quiz.tsx:256`, `Sudoku.tsx:157`, `Dziesiatki.tsx:142`, `Schulte.tsx:141`, `Stoj.tsx:145` | jak B-45. Błysk `warning` + potrząśnięcie, więc pomyłka nie jest sygnalizowana samym kolorem (zgodny z `DESIGN.md` §5); wibracja 60 przy pomyłce to obowiązek gry (W-09) |
| B-47 | `piece-fall` | `index.css:330` | tak: „Wieża: ucięty kawałek klocka spada i gaśnie” | **nie** | `Wieza.tsx:142` (0,5 s `ease-in` `forwards`) | rozbieżność niska `[zbiorcze: keyframes-poza-5]`: brak w liście §5 i brak kategorii czasu. Propozycja: dopisać (jeden użytkownik, więc wystarczy wiersz tabeli czasów) |
| B-48 | `shake` | `index.css:338` | tak: „Środek: delikatne potrząśnięcie … to nie kara” | **nie** | `Srodek.tsx:162`, `Nozyczki.tsx:142` (0,3 s `ease-out`) | rozbieżność niska `[zbiorcze: keyframes-poza-5]`: brak w liście §5; komentarz wymienia tylko Środek. Propozycja: dopisać „`shake` (dotknięcie zignorowane, bez kary), 300 ms” |
| B-49 | `::view-transition-group(statki-own / statki-enemy)` (nie `@keyframes`, ale animacja z `index.css`) | `index.css:354-358` | tak | nie dotyczy | 350 ms `ease-out`, start w `Statki.tsx:70` (`startViewTransition`) | zgodny (350 ms `ease-out` jak „pojawienie”); reguła reduced-motion go nie obejmuje (B-51), ale `Statki.tsx:69` sam sprawdza `reducedMotion`. Opóźnienie `SWAP_MS` to odstępstwo z `ZASADY.md` §5 (lista na końcu) |
| B-50 | animacje Tailwinda spoza `index.css`: `animate-pulse`, `animate-ping` | `Labirynt.tsx:143`, `Memory.tsx:116`, `PiecWRzedzie.tsx:78`, `:122`, `Statki.tsx:276`, `Game.tsx:596`, `Lobby.tsx:68`, `:69` | `ZASADY.md` §5 „Mechanizm: keyframes w `index.css` z komentarzem” | rozbieżność niska `[zbiorcze: animate-tailwind]`: wbudowane keyframes Tailwinda nie mają komentarza w `index.css` ani miejsca w liście §5; `animate-pulse` to pętla 2 s, czyli ozdoba w ruchu, jeśli nic się „właśnie nie stało”. Reguła reduced-motion je obejmuje. Ocena każdego użycia w planie gry / ekranu; propozycja dla platformy: albo dopisać `pulse` do listy §5 z rolą (np. „czekamy na coś”), albo zastąpić `ring-pulse` |

Każdy `@keyframes` z `index.css` (14: `set-glow`, `ring-pulse`, `stone-pop`, `line-draw`, `preview-half`, `preview-quarter`, `title-pop`, `dice-tumble`, `card-in`, `float-up`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`) ma punkt B-35..B-48. Wszystkie mają komentarz; nieużywanych nie ma.

### Reguła `prefers-reduced-motion`

| ID | Wzorzec | `plik:linia` | Źródło | Ocena |
|---|---|---|---|---|
| B-51 | `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }` | `index.css:360-368` | `ZASADY.md` §5 „`prefers-reduced-motion`: reguła globalna w `index.css` wyłącza animacje CSS” | zgodny co do zakresu §5. Co obejmuje: każdy `animation` (także `animate-pulse` / `animate-ping` Tailwinda, B-50) i każdy `transition` (klasy `transition-*`, `.btn` :88-91, inline `transition`). Animacje z `forwards` (`float-up`, `piece-fall`) od razu lądują w stanie końcowym, pętle (`ring-pulse`, podglądy) grają jeden przebieg 0,01 ms. Czego **nie** obejmuje: (1) animacji sterowanych z JS (`setTimeout` kroków, `requestAnimationFrame`, pozycji ustawianych wprost w DOM): to obowiązek gry przez stałą `reducedMotion`, dziś w `Chinczyk.tsx:55`, `Statki.tsx:48`, `KampusTour.tsx:208` (W-11); (2) pseudo-elementów `::view-transition-*` (selektor `*` ich nie łapie; Statki omijają to w JS, B-49); (3) `scroll-behavior` (w `apps/web/src` nie ma `scroll-smooth` ani `behavior: "smooth"`, więc nie ma czego wyłączać); (4) `animation-delay` / `transition-delay` (w kodzie są tylko ujemne opóźnienia podglądów, bez skutku po skróceniu) |
| B-52 | podgląd `Intro` przy reduced-motion | `index.css:365` (`animation-iteration-count: 1`) + `preview-half` / `preview-quarter` (B-39, B-40) | `ZASADY.md` §4 „animowany podgląd”, `DESIGN.md` §3.3 | rozbieżność niska: pętla podglądu zatrzymuje się na stylu bazowym, więc widać naraz wszystkie klatki, które bazowo mają `opacity: 1` (komentarz :233: „element z późniejszej części cyklu ma bazowo opacity 0”). Czy taki obraz jest czytelny, zależy od gry (W-12). Propozycja: zasada w §5, że pierwsza klatka podglądu jest bazowo widoczna, a reszta bazowo ukryta, żeby statyczny podgląd pokazywał jedną klatkę |
| B-53 | ruch, który jest treścią gry (Trzy kubki, Śledzenie, Za zasłoną, Wieża) | komentarze `Kubki.tsx:77-78`, `Zaslona.tsx:78` | `ZASADY.md` §5 („każda animacja sterowana z JS sprawdza `reducedMotion` i przeskakuje do stanu końcowego”, „Pomiar czasu nigdy nie zależy od animacji”) | rozbieżność niska (luka w zasadach, nie w kodzie): §5 każe każdej animacji JS przeskakiwać do końca przy reduced-motion, a w tych grach ruch jest zadaniem (przeskok zrobiłby grę niegrywalną), więc gry świadomie ustawiają pozycje z JS bez `reducedMotion`. Propozycja: dopisać do §5 wyjątek „ruch, który gracz śledzi albo mierzy, nie jest animacją i nie podlega reduced-motion; robi go JS, nie przejście CSS”. Plany 02-08..02-10 przenoszą takie gry na listę „Odstępstwa z powodem” z odsyłaczem do B-53 |

## ui.tsx

Eksporty (`grep -n "^export" ui.tsx`): `Send` (typ), `Screen`, `TopBar`, `PlayerDots`, `GameDot` (typ), `GameDots`, `Scores`, `Stats`, `tenth`, `grade`, `RoundTable`, `StickyBar`, `IntroContext`, `Intro`.
Liczba plików używających (bez `ui.tsx`, grep po nazwie w `games/`, `screens/`, `App.tsx`): `Screen` 6, `TopBar` 2, `PlayerDots` 2, `GameDots` 1, `Scores` 21, `Stats` 22, `tenth` 3, `grade` 6, `RoundTable` 5, `StickyBar` 7, `IntroContext` 1, `Intro` 25.

| ID | Eksport | `plik:linia` | Źródło | Ocena |
|---|---|---|---|---|
| B-54 | `Send` (typ) | `ui.tsx:5` | nie dotyczy | typ funkcji wysyłania wiadomości pokoju, bez wyglądu; nic do oceny |
| B-55 | `Screen`: `main`, `max-w-md`, `px-4` (16 px), `gap-3` (12 px), `min-h-[100dvh]`, dół z `safe-area-inset-bottom` | `ui.tsx:8-20` | `ZASADY.md` §4 „Układ: `Screen` (jedna kolumna, `max-w-md`)”; `DESIGN.md` §2 „margines boczny 16 px, odstęp między blokami 12 px” | zgodny. Na 360 px zostaje 328 px treści (statycznie). Pasek rozłączenia: `role="status"`, tło `accent-soft`, ikona `WifiSlash` z `aria-hidden`, tekst „Łączenie ponownie…” (`ui.tsx:11-16`), zgodny z `DESIGN.md` §4 „utrata połączenia (ja)” |
| B-56 | `TopBar`: lewy przycisk „Gry” / „Wyjdź” (`min-h-12`), prawy przycisk kodu z `aria-label` „Kod pokoju …, udostępnij link”, kod mono `text-lg` z odstępem 0,12em, „Skopiowano!” przez 2 s | `ui.tsx:23-52` | `ZASADY.md` §4 „pola dotykowe co najmniej 48 px”, „przyciski bez tekstu `aria-label`”; `DESIGN.md` §2 typografia | zgodny: oba przyciski 48 px wysokości, ikony z `aria-hidden`, przycisk kodu ma `aria-label`. Na 360 px statycznie: lewy około 70 px, prawy około 130 px, środek (`PlayerDots`, 6 × 20 px) około 116 px, razem około 316 z 328 px, mieści się. Pozostałe uwagi: B-57, B-58 |
| B-57 | `TopBar`: waga ikon | `ui.tsx:41` (`ArrowLeft`, `SignOut` 16 px `regular`) wobec `ui.tsx:48` (`Check`, `ShareNetwork` 16 px `bold`) | `DESIGN.md` §2 „Ikony Phosphor: … `bold` w małych akcjach (16-18 px)” | rozbieżność niska `[zbiorcze: waga-ikon]`: dwie małe akcje w jednym wierszu mają różną wagę ikon. Propozycja: `weight="bold"` w `ui.tsx:41` |
| B-58 | `TopBar`: `setTimeout(() => setCopied(false), 2000)` bez sprzątania | `ui.tsx:35` | nie dotyczy §4/§5 (to nie animacja ani pomiar) | uwaga bez wagi: przy wyjściu z ekranu przed upływem 2 s timer zmienia stan odmontowanego komponentu (React 18 tego nie zgłasza). Nie wpływa na wygląd |
| B-59 | `PlayerDots`: kropki 16 px w kolorze gracza (`style`), znaczek `Check` (`text-bg`, `bold`, 10 px) dla gotowego, rozłączony `opacity-40`, `aria-label` z nickiem i stanem na `li` | `ui.tsx:55-74` | `DESIGN.md` §4 „gracz gotowy: znaczek w kropce”, „gracz rozłączony: kropka z kryciem 40%” (przerywany obrys tylko „w partii”) | zgodny: `PlayerDots` jest przed partią (`TopBar` lobby i `Setup`), więc samo krycie 40% wystarcza; stan ma też słowa w `aria-label`. Kropki nie są polem dotykowym, więc 16 px nie łamie 48 px. Przejście krycia: B-62 |
| B-60 | `GameDots`: przycisk `min-h-12` z `aria-expanded` i `title`, kropka 36 px (`size-9`): pierścień postępu `conic-gradient` w kolorze gracza (`fraction`), środek 28 px z inicjałem w `text-bg`; czyta zasady `opacity-40` z pierścieniem; rozłączony: przerywany obrys `fg-muted` zamiast pierścienia i `opacity-40`; „to ja”: kreska 12 × 2 px pod kropką; odznaka: `rounded-full` (wygrane) albo `rounded-sm` (turniej), zero ukryte; „+1”: `float-up` 1,6 s w kolorze gracza; `aria-label` każdej kropki: nick, „(ty)”, stan, odznaka | `ui.tsx:100-140` | `ZASADY.md` §4 „Czego gra nie rysuje sama” (inicjał, pierścień, przygaszenie, przerywany obrys, kreska, odznaka, zera nie widać); `DESIGN.md` §4 wiersze „gracz rozłączony”, „gracz czyta zasady”, „postęp gracza”, „to ja” | zgodny we wszystkich stanach z tabeli. Cały rząd jest jednym przyciskiem 48 px wysokości (dotknięcie w dowolną kropkę rozwija listę, którą rysuje `Game.tsx`; kolejność „ja pierwszy” też ustala `Game.tsx`, plan 02-04). Uwagi: B-61, B-62, B-37 (czas odznaki) |
| B-61 | `GameDots`: odznaka turnieju `rounded-sm` (4 px) | `ui.tsx:125` | `DESIGN.md` §2 „Zaokrąglenia: 20 / 10 / 999 px”; `ZASADY.md` §4 („w turnieju prostokątna”) | rozbieżność niska `[zbiorcze: promien]`: kształt prostokątny wymaga `ZASADY.md` §4, ale 4 px nie ma w skali. Propozycja: dopisać do `DESIGN.md` §2 „4 px: odznaka punktów turnieju” albo użyć `rounded-[3px]`/`rounded-none` z tym samym dopiskiem; najprościej uznać za odstępstwo w `DESIGN.md` §6 |
| B-62 | `PlayerDots` i `GameDots`: `transition-opacity` z czasem domyślnym Tailwinda (150 ms) | `ui.tsx:64`, `ui.tsx:114` | `ZASADY.md` §5 tabela „przycisk, przejście stanu 180 ms” | rozbieżność niska `[zbiorcze: transition-domyslny]`: przejście stanu (rozłączony, czyta zasady) ma 150 ms zamiast 180 ms. Propozycja: `duration-180` (albo uznać 150 ms domyślne Tailwinda za „przejście stanu” i poprawić tabelę §5) |
| B-63 | `GameDots`: odznaka wygranych wskakuje przez `stone-pop` 0,5 s | `ui.tsx:125` | `ZASADY.md` §5 tabela „pojawienie się elementu 350 ms, `ease-out`” | rozbieżność niska `[zbiorcze: czas-pojawienia]` (B-37); ten sam czas 0,5 s ma `Game.tsx:306`, więc platforma jest spójna sama ze sobą, ale nie z tabelą. Propozycja: 0,35 s w obu miejscach |
| B-64 | `Scores`: `ol` w `.tile` `p-4`, wiersz na gracza: kropka koloru (`aria-hidden`), nick, „(ty)” w `fg-muted`, wynik mono `tabular-nums` albo „gra…” w `fg-muted` | `ui.tsx:143-158` | `ZASADY.md` §4 „Wyniki mini-gry: komponent `Scores`, wiersz na gracza, „gra…” dopóki nie oddał”, „(ty)”; `DESIGN.md` §5 „Liczby są mono” | zgodny. Zapis liczby (`score: string`) robi gra: przecinek i jednostka to sprawdzenie per gra (W-04) |
| B-65 | `Stats`: `dl` w `rounded-inset`, obrys `line`, tło `surface`; każda pozycja: `dt.label` i `dd` Geist Mono 18 px (`text-lg`), 600, `tabular-nums`; skrajne do krawędzi; `warn` → `text-warning` | `ui.tsx:161-172` | `DESIGN.md` §3.4, §2 typografia („liczba w pasku statystyk: Geist Mono 18 px, 600, `tabular-nums`”), §5 „Liczby nad polem gry to zawsze pasek `Stats`”; `ZASADY.md` §4 | zgodny. `warn` barwi tylko wartość, ale obok zawsze stoi `.label` z nazwą (np. „kara”), więc kolor nie jest jedynym sygnałem. Statycznie na 360 px: trzy pozycje mieszczą się w 296 px (328 − `px-4`); przy czterech i więcej albo długiej wartości (np. „10,00 s”) szerokość zależy od gry (W-01) |
| B-66 | `tenth`: `n.toFixed(1).replace(".", ",")` | `ui.tsx:175` | `ZASADY.md` §4 „przecinek dziesiętny („10,00 s”)”; `DESIGN.md` §5 | zgodny dla jednego miejsca po przecinku. Niska `[zbiorcze: przecinek]`: nie ma wspólnego odpowiednika na dwa miejsca (przykład z `ZASADY.md` §4 to „10,00 s”), więc gry piszą własne `toFixed(2).replace(...)` albo zapominają o zamianie (sprawdzenie per gra z `02-01-CHECKS.md`, sekcja teksty). Uwaga: wartość z przedziału (−0,05; 0) daje „-0,0” ze znakiem ASCII. Propozycja: `decimal(n, digits)` w `ui.tsx` (z `tenth = (n) => decimal(n, 1)`) i obcięcie minus zera |
| B-67 | `grade(d, perfect, close)`: do `perfect` `text-success` / `stroke-success`, do `close` bez koloru / `stroke-fg`, powyżej `text-warning` / `stroke-warning` | `ui.tsx:178-179` | `DESIGN.md` §2 (`success`: trafienie, `warning`: pomyłka), §5 „Kolor znaczy”, „Kolor nigdy nie jest jedynym sygnałem” | zgodny: tylko tokeny w swoich rolach; liczba błędu stoi zawsze obok koloru. W `RoundTable` dobra komórka ma też `font-semibold` (`ui.tsx:233`) |
| B-68 | `RoundTable`: `.tile` `p-3`; siatka `repeat(n, minmax(0, 1fr))`, `gap-1`, mono `text-xs` `tabular-nums`; wiersz gracza: kropka (`aria-hidden`), nick, „(ty)”, „bez odpowiedzi”; komórki `rounded-inset`, kolor z `grade`; jedyny najlepszy w rundzie ma obrys i tło 28% w kolorze gracza (remis i jeden gracz: nikt); legenda `text-xs` `fg-muted` | `ui.tsx:185-248` | `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”; `ZASADY.md` §4 (360×640, „(ty)”); `DESIGN.md` §4 „stan pusty jednym zdaniem” | zgodny. Siatka z `minmax(0, 1fr)` nie wypycha ekranu w poziomie. Statycznie: na 360 px przy 10 rundach kolumna ma około 27 px (328 − 24 − 36 odstępów, / 10), a `text-xs` mono to około 7,2 px na znak, więc mieszczą się 3 znaki; 4 znaki („12,3”, domyślny `tenth`) wychodzą poza komórkę o około 2 px. Dziś 10 rund mają `Mapa` (`format` całkowity, km), `Srodek` (format do 3 znaków), a domyślny `tenth` tylko gry z 5 rundami (`Tort`, `Nozyczki`), `Zaslona` 8 rund (około 34 px, 4 znaki się mieszczą). Do sprawdzenia w grach: W-07 |
| B-69 | `RoundTable`: domyślna legenda „Zielony: do {perfect}%, czerwony: ponad {close}%.” | `ui.tsx:244` | `ZASADY.md` §4 „te same słowa co w innych grach” | rozbieżność niska `[zbiorcze: slowa]`: domyślna legenda mówi „czerwony”, a `Zaslona.tsx:126` w swojej legendzie „ostrzegawczy” (`Mapa.tsx:110` „czerwony”); `perfect` i `close` wpisane przez `${}` dałyby kropkę dziesiętną przy ułamku (dziś wszystkie progi są całkowite: `Tort.tsx:16-17`, `Nozyczki.tsx:16-17`). Propozycja: jedno słowo w legendach („czerwony” jak w domyślnej) i progi przez `tenth`/`decimal` |
| B-70 | `StickyBar`: `sticky bottom-0`, `-mx-4 px-4`, tło `bg/90` z `backdrop-blur`, dół z `safe-area-inset-bottom`, `gap-3` | `ui.tsx:251-253` | `ZASADY.md` §4 „akcje przy dolnej krawędzi, przy długiej treści `StickyBar`”; `DESIGN.md` §2 „akcje leżą przy dolnej krawędzi” | zgodny. Tło z tokenu `bg` (przezroczystość 90% dozwolona jako wariant tokenu) |
| B-71 | `IntroContext`: `game`, `others` (nick, kolor, `began`), `begin`, `record` | `ui.tsx:256-262` | `ZASADY.md` §4 „Pod przyciskiem widać, kto już gra, a kto czyta zasady”; `KONCEPT.md` §2.4 (linia „Rekord: …”) | zgodny; dostarcza go `Game.tsx` (jedyny użytkownik), więc gry nie przekazują tych danych same |
| B-72 | `Intro`: kafel `my-auto` (wyśrodkowany w pionie), podgląd `h-32` (128 px) na `bg` z obrysem `line`, `rounded-inset`, `aria-hidden`; trzy punkty z ikonami `Timer` / `HandTap` / `Trophy` (20 px, `regular`, `fg-muted`, `aria-hidden`); „Start” `btn btn-primary w-full`; linia „Start automatycznie za N s” z terminu z serwera (`msLeft`); linia rekordu; lista „{nick} już gra / czyta zasady” z `role="status"`; po zamknięciu instrukcji przez serwer gra startuje sama (`ui.tsx:290-293`) | `ui.tsx:268-335` | `ZASADY.md` §4 „Reguły” (Intro, `Preview`, `time` / `task` / `score`, „Start”, `INTRO_SECONDS`, kto gra, kto czyta); `DESIGN.md` §3.3; §5 „Akcent należy do platformy” („Start” w akcencie) | zgodny. **Typ wymusza punkty**: `time`, `task`, `score`, `preview` i `onStart` są wymaganymi propsami (`ui.tsx:268`), więc `pnpm typecheck` nie przepuści `Intro` bez któregoś z nich. `ReactNode` dopuszcza jednak `null` i pusty tekst, więc plany 02-07..02-10 sprawdzają tylko **treść** punktów (czy `time` mówi o czasie, `score` o punktacji, czy `preview` to animowany `Preview` z pliku gry), a nie ich obecność; obecność samego `<Intro` w grze sprawdzają osobno (W-08). Uwagi: B-73, B-74 |
| B-73 | `Intro`: liczby w linii odliczania i rekordu bez `font-mono` | `ui.tsx:319`, `ui.tsx:321` | `DESIGN.md` §5 „Liczby są mono”; `ZASADY.md` §4 „Liczby, czasy i kody czcionką mono z `tabular-nums`” | rozbieżność niska `[zbiorcze: liczby-mono]`: `tabular-nums` jest, kroju mono nie ma (sekundy odliczania w Satoshi). Propozycja: liczbę sekund w `<span className="font-mono">`; w linii rekordu wynik też w mono |
| B-74 | `Intro`: kropka koloru w liście „już gra / czyta zasady” bez `aria-hidden` | `ui.tsx:327` | `ZASADY.md` §4 „Elementy ozdobne mają `aria-hidden`” | rozbieżność niska `[zbiorcze: aria-hidden]`: ten sam wzór w `Scores` (:148) i `RoundTable` (:225) ma `aria-hidden`. Propozycja: dopisać `aria-hidden` |
| B-75 | `Intro`: `setInterval` 250 ms do odliczania, `Date.now` | `ui.tsx:272-287` | `ZASADY.md` §5 (animacje i pomiar) | zgodny: to licznik tekstu, nie animacja ani pomiar wyniku; termin liczony od odebrania wiadomości jak licznik tury (komentarz :271) |
| B-76 | wibracje, animacje i timery w `ui.tsx` | grep `vibrate`: brak; `animate-`: `ui.tsx:125` (`stone-pop`, B-63), `ui.tsx:132` (`float-up` 1,6 s, B-44); `transition-opacity`: `:64`, `:114` (B-62); `setTimeout`: `:35` (B-58); `setInterval`: `:285` (B-75) | `ZASADY.md` §5 (wibracje: moja tura w `Game.tsx`, gra nie powtarza) | zgodny: `ui.tsx` nie wibruje, więc nie dubluje wibracji tury ani gier. Animacje JS: brak (nic do `reducedMotion`) |

### Wzorce do sprawdzenia w grach

Plany fali 2 (02-03..02-10) odhaczają te punkty w każdej grze. „Zgodny z B-xx” znaczy: gra używa wzorca, więc punkt z BASELINE wystarcza.

| ID | Co sprawdzić w grze | Odniesienie | Waga, gdy nie |
|---|---|---|---|
| W-01 | liczby nad polem gry tylko przez `Stats` (żadnych własnych liczników nad planszą); przy czterech i więcej pozycjach mieszczą się na 360 px | B-65, `DESIGN.md` §5 | średnia (liczby poza `Stats`), wysoka (poziome przewijanie) |
| W-02 | kolory tylko z tokenów i koloru gracza przez `style`; token w swojej roli (`fg-subtle` nie dla ważnego tekstu, `success` nie jako ozdoba) | B-01..B-16, D-04 | średnia |
| W-03 | ułamki przez `tenth` (albo własne `toFixed(...).replace(".", ",")`); żadnej kropki dziesiętnej w tekście UI | B-66 | średnia |
| W-04 | wynik do `Scores` sformatowany jak w grze (jednostka, przecinek); `Scores` zamiast własnej listy wyników | B-64 | średnia |
| W-05 | najwyżej jeden `btn-primary` na ekranie; akcja w partii jako `btn text-bg` z kolorem gracza, nie `btn-primary` | B-27, B-29, `DESIGN.md` §5 | średnia |
| W-06 | przyciski i pola dotykowe przez `.btn` / `.field` (48 px) albo równoważne `min-h-12`; własne pola dotykowe co najmniej 48 px | B-24, B-30, B-31 | średnia |
| W-07 | tabela rund tylko przez `RoundTable`; przy 10 rundach `format` daje najwyżej 3 znaki | B-68, B-69 | średnia (własna tabela), niska (tekst wystaje z komórki) |
| W-08 | jest `<Intro` (bezpośrednio albo przez `Quiz.tsx` / `Szacowanie.tsx`), `preview` to animowany `Preview` z pliku gry (CSS w pętli), treść `time` / `task` / `score` mówi to, co ma | B-72 | średnia |
| W-09 | wibracje: pomyłka 60, zło od innego gracza `[60, 40, 60]`, trafienie bez wibracji, moja tura tylko w `Game.tsx`; zawsze `navigator.vibrate?.(...)` | B-76, `ZASADY.md` §5 | średnia |
| W-10 | animacje z katalogu B-35..B-48 w czasach z katalogu; ta sama sytuacja co w innej grze = te same keyframes i czas (trafienie `tile-hit` 0,35 s, pomyłka `tile-miss` 0,35 s, pojawienie `stone-pop` 0,35 s, zmiana liczby `float-up` 1,6 s, „można wybrać” `ring-pulse`) | B-35..B-50 | średnia (ta sama sytuacja inaczej), niska (czas poza tabelą) |
| W-11 | każda animacja z JS (`setTimeout` kroków, `requestAnimationFrame`, `startViewTransition`) sprawdza `reducedMotion` i przeskakuje do stanu końcowego; wyjątek: ruch jako treść gry (B-53) | B-51, B-53 | średnia |
| W-12 | podgląd `Intro` przy reduced-motion pokazuje czytelną klatkę (bazowo widoczna jedna klatka) | B-52 | niska |
| W-13 | pole gry na czas: `touch-none select-none` i `onPointerDown`; bodziec refleksowy bez `transition` (reguła reduced-motion tu nie pomaga, bo bez niej przejście działa) | `ZASADY.md` §4, §5 „Pomiar czasu”, `DESIGN.md` §4 „bodziec w grze na refleks” | wysoka |
| W-14 | `Screen` jako układ (gry zwykle dostają go od `Game.tsx`), akcje przy dolnej krawędzi, przy długiej treści `StickyBar` | B-55, B-70 | średnia |
| W-15 | elementy ozdobne `aria-hidden`, przyciski bez tekstu z `aria-label`, ikony Phosphor w wadze `regular` / `fill` / `bold` zgodnie z `DESIGN.md` §2 | B-57, B-74 | niska |
| W-16 | liczby w polu gry i na ekranie końcowym w Geist Mono z `tabular-nums` | B-65, B-73 | niska |
| W-17 | podpisy bloków jako `.label`, nie pogrubiony Satoshi | B-23 | niska |
| W-18 | słowa: „Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”, „gra…”; w legendach progów to samo słowo na kolor | B-64, B-69 | średnia |

## Odstępstwa z powodem

Sprawdzone i zgodne z wyjątkami z `ZASADY.md`, `KONCEPT.md` i `DESIGN.md` §6 (D-04, D-05); bez wagi.

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| `.landscape` (obrót o 90° w pionie) | `index.css:177-191` | `DESIGN.md` §6: Kampus Tour ma własny układ poziomy |
| cień w `set-glow` | `index.css:200` | `DESIGN.md` §2: cień tylko pod oknami i pionkami Kampus Tour oraz w `set-glow` |
| `::view-transition-group(statki-*)` 350 ms i opóźnienie zamiany plansz | `index.css:354-358`, `SWAP_MS` w `Statki.tsx:47` | `ZASADY.md` §5 „Animacja nie blokuje gry. … Wyjątek: Statki po pudle trzymają stary układ przez 1,2 s” |
| ruch jako treść gry bez `reducedMotion` (Kubki, Śledzenie, Za zasłoną, Wieża) | `Kubki.tsx:77-78`, `Zaslona.tsx:78` | brak wyjątku w `ZASADY.md` §5, dlatego osobny wpis B-53 (niska) z propozycją dopisania; po dopisaniu przechodzi tutaj |

## Rozbieżności platformy (do FINDINGS.md w 02-11)

| ID | Waga | Krótko | `plik:linia` | Klucz |
|---|---|---|---|---|
| B-31 | średnia | suwak `.swatch-range` 36 px wysokości (Odcień, Który rok?) | `index.css:148` | `dotyk-48` |
| B-32 | średnia | uchwyt suwaka `#fff`/`#000` spoza tokenów (do tego cień i promień 6 px: niska) | `index.css:155-168` | `kolor-spoza-tokenow`, `cien`, `promien` |
| B-36 | średnia | `ring-pulse` 1 s w Chińczyku, 1,2 s w Memory i „Rewanż” | `Chinczyk.tsx:219`, `Memory.tsx:90`, `Game.tsx:525` | `ring-pulse-czas` |
| B-15 | niska | token `accent-hover` bez wiersza w `DESIGN.md` §2 | `index.css:27` | - |
| B-17 | niska | komentarze `warning` i `success` węższe niż rola | `index.css:31`, `:33` | `komentarz-nieaktualny` |
| B-18 | niska | `ZASADY.md` §4 wymienia 8 tokenów i 2 zaokrąglenia, `DESIGN.md` §2 13 i 3 | `ZASADY.md` §4 | - |
| B-20 | niska | brak `color-scheme: dark` | `index.css:43-49` | - |
| B-29 | niska | brak wspólnej klasy akcji w partii w kolorze gracza | `index.css` (brak) | - |
| B-33 | niska | komentarz `.swatch-range` z dawną nazwą gry i bez Który rok? | `index.css:144` | `komentarz-nieaktualny` |
| B-35, B-36, B-37, B-42, B-44, B-45 | niska | komentarze keyframes wymieniają jedną grę, a używa ich więcej | `index.css:193`, `:204`, `:216`, `:265`, `:287`, `:302` | `komentarz-nieaktualny` |
| B-35 | niska | „świeże osiągnięcie” (`set-glow` 0,9 s × 4) bez czasu w tabeli §5 | `index.css:194` | `brak-w-tabeli-5` |
| B-38, B-41, B-45, B-46, B-47, B-48 | niska | keyframes spoza listy §5: `line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake` | `index.css:225`, `:258`, `:303`, `:310`, `:330`, `:338` | `keyframes-poza-5` |
| B-37, B-63 | niska | `stone-pop` 0,5 s w odznace wygranych (i `Game.tsx:306`) zamiast 350 ms | `ui.tsx:125` | `czas-pojawienia` |
| B-41 | niska | `title-pop` 0,5 s z własnym easingiem, poza tabelą | `Game.tsx:243` | `keyframes-poza-5` |
| B-50 | niska | `animate-pulse` / `animate-ping` Tailwinda bez komentarza i bez miejsca w §5 | 8 użyć (B-50) | `animate-tailwind` |
| B-52 | niska | podgląd `Intro` przy reduced-motion pokazuje stan bazowy wszystkich klatek | `index.css:365` | - |
| B-53 | niska | §5 nie ma wyjątku dla ruchu, który jest treścią gry | `ZASADY.md` §5 | - |
| B-57 | niska | `TopBar`: ikony 16 px w wadze `regular` obok `bold` | `ui.tsx:41` | `waga-ikon` |
| B-61 | niska | odznaka turnieju `rounded-sm` (4 px) spoza skali zaokrągleń | `ui.tsx:125` | `promien` |
| B-62 | niska | `transition-opacity` 150 ms zamiast 180 ms | `ui.tsx:64`, `:114` | `transition-domyslny` |
| B-66 | niska | brak wspólnego zapisu dwóch miejsc po przecinku; „-0,0” | `ui.tsx:175` | `przecinek` |
| B-69 | niska | legenda progów: „czerwony” w domyślnej, „ostrzegawczy” w Za zasłoną; progi przez `${}` | `ui.tsx:244`, `Zaslona.tsx:126` | `slowa` |
| B-73 | niska | odliczanie i rekord w `Intro` bez `font-mono` | `ui.tsx:319`, `:321` | `liczby-mono` |
| B-74 | niska | kropka w liście „już gra” bez `aria-hidden` | `ui.tsx:327` | `aria-hidden` |

Wysokich rozbieżności w samych wzorcach platformy nie ma: nic w `index.css` ani `ui.tsx` nie wypycha ekranu 360 px w poziomie, nie blokuje ruchu ani nie wiąże pomiaru z animacją (sprawdzenie statyczne).

## Załącznik A: polecenia dowodowe

Uruchamiane z katalogu `apps/web/src`, bez plików w repo.

```sh
# użycia i czasy keyframes
for k in set-glow ring-pulse stone-pop line-draw preview-half preview-quarter title-pop dice-tumble card-in float-up tile-hit tile-miss piece-fall shake; do
  echo "== $k"; grep -rnoE "animate-\[$k[^] \"]*\]" --include=*.tsx --include=*.ts .
done
# animacje Tailwinda spoza index.css
grep -rnoE "animate-[a-z][a-z-]*" --include=*.tsx . | grep -v "animate-\["
# view transitions, smooth scroll, reducedMotion
grep -rn "startViewTransition\|viewTransitionName" --include=*.tsx .
grep -rn "scroll-behavior\|scroll-smooth\|behavior: \"smooth\"" .
grep -rn "reducedMotion\|prefers-reduced" --include=*.tsx .
# opóźnienia animacji
grep -rnoE "animationDelay[^,}]*|\[animation-delay:[^]]*\]|delay-[0-9]+" --include=*.tsx .
# akcja w partii w kolorze gracza
grep -rn "btn text-bg" .
# liczba plików używających eksportów ui.tsx
for e in Screen TopBar PlayerDots GameDots Scores Stats tenth grade RoundTable StickyBar IntroContext Intro; do
  printf "%s: " $e; grep -rlE "\b$e\b" --include=*.tsx games screens App.tsx | grep -v ui.tsx | wc -l
done
```

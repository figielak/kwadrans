# Faza 2: audyt wyglądu, animacji i wibracji (FINDINGS)

Stan repo: gałąź `labirynt`, HEAD `d625d21`, 2026-10-24. Repo bez zmian poza `.planning/`.
Zakres: ekrany platformy (`apps/web/src/screens/*.tsx`, `App.tsx`, `index.css`), 38 gier z `GAMES` z ich plikami w `apps/web/src/games/` (z `Quiz.tsx`, `Szacowanie.tsx`,
`MiniGame.tsx`, `KampusSummary.tsx`) i Turniej (`turniej`); wymagania UI-01..UI-05, ANIM-01..ANIM-03. `Dev.tsx` i `net.ts` poza zakresem (D-01).

Ten plik scala ustalenia częściowe: `02-01-CHECKS.md` (dowód hurtowy grepa, 515 trafień), `02-02-BASELINE.md` (wzorce `index.css` i `ui.tsx`, B-01..B-76, W-01..W-18)
i `02-03..02-10-FINDINGS.md` (ekrany i gry). Pliki częściowe zostają jako źródło: mają pełne opisy, rachunki wysokości, tabele „Sytuacje” każdej gry i oceny „zgodne”.
Tu każdy wpis ma format z roadmapy: gra lub ekran, `plik:linia`, źródło reguły, waga, propozycja. Ścieżki: pliki gier względem `apps/web/src/games/`, ekrany względem `apps/web/src/screens/`.

**Identyfikatory.** Wpisy pojedyncze mają identyfikatory z plików częściowych (GM-1, KT10, SQ2, ZK1…). Część z nich ma w fazie 1 inne znaczenie (ZK1, SQ1, SL1, SL2, KL1-KL3, PM7, PM10,
M1, C4, L1, L2, KO1, KB1, WP1, WP2), dlatego w fazie 4 cytować je z prefiksem **F2:** (np. F2:ZK1). Wpisy zbiorcze mają nowe U1-U37, wpisy z macierzy sytuacji A1-A17
(wpisy zbiorcze Z1-Z4 z `02-05-FINDINGS.md` to tu U1, U6, U32 i A3).

**Wagi** wg D-07: **wysoka** (pomiar zależny od animacji, pole gry na czas bez `onPointerDown`, ekran gry nie mieści się na 360×640, animacja blokująca ruch, licznik w grze, która go ukrywa),
**średnia** (kolor spoza tokenów lub w cudzej roli, kolor jako jedyny sygnał, pole poniżej 48 px, wibracja niezgodna z tabelą, inne słowo niż wspólne, ta sama sytuacja animowana różnie),
**niska** (zaokrąglenia, cienie, `.label`, stany `DESIGN.md` §4 bez wpływu na grę, ikony, mono, `aria`, czasy poza tabelą, komentarze). Ta sama rozbieżność w kilku miejscach ma jedną wagę;
ujednolicenia względem plików częściowych opisuje §5.0.

**Metoda 360×640:** wszystkie wysokości i szerokości policzone statycznie z klas Tailwinda (D-09), bez przeglądarki i bez serwerów dev. Wpisy, w których decyduje szacunek, mają dopisek
„do potwierdzenia w przeglądarce” (lista w §9).

## 1. Podsumowanie

| Waga | Wpisy zbiorcze (U) | Wpisy z macierzy (A) | Wpisy pojedyncze | Razem wpisów | Wystąpień |
|---|---|---|---|---|---|
| wysoka | 2 (U1, U2) | 0 | 2 (KT10, ZK1) | 4 | 15 |
| średnia | 9 (U3-U11) | 12 (A1-A12) | 6 | 27 | 88 |
| niska | 26 (U12-U37) | 5 (A13-A17) | 40 | 71 | 197 |
| **razem** | **37** | **17** | **48** | **102** | **300** |

Wystąpienia: każda gra albo ekran we wpisie zbiorczym liczy się osobno (np. U4 to 14 wystąpień), w wpisach z macierzy liczą się tylko gry odstające.
Pliki częściowe miały razem 222 wpisy fali 2 i 25 rozbieżności platformy; po scaleniu duble (np. GM-2 = KT12, GM-4 = M5) i wpisy wspólne kilku plików (np. 14 wpisów `dotyk-48`) są jednym wpisem.

Co mówi audyt w skrócie:
- **Wzorce platformy** (`index.css`, `ui.tsx`) są zgodne z §4 i §5 w tym, co wpływa na grę: `Intro` z wymaganymi `time` / `task` / `score` / `preview` (typ nie przepuści braku),
  `Stats`, `Scores`, `RoundTable`, `tenth`, `.btn` 48 px, reguła `prefers-reduced-motion`. Rozbieżności platformy są średnie (suwak 36 px, uchwyt `#fff`, `ring-pulse` 1 s / 1,2 s) albo niskie.
- **Wibracje:** wszystkie przez `navigator.vibrate?.()`, wzory 40 / 60 / [60, 40, 60] poza metronomem Rytmu (30, opisany w `KONCEPT.md`). Wibracja tury tylko w `Game.tsx:35`,
  żadna gra jej nie dubluje, żadne trafienie nie wibruje. Luki: brak 60 przy pomyłce w Refleksie i Sekwencji, brak [60, 40, 60] przy „złu od innego gracza” poza Chińczykiem (A6, A7).
- **Pomiar czasu** nigdzie nie zależy od animacji; jedyne pole na czas z `onClick` to „Gotowe” w Zakupach (ZK1). Każde pole gry na czas ma `touch-none select-none` i `onPointerDown`.
- **Ekran 360×640:** w trakcie partii nie mieszczą się wszystkie gry główne poza Kampus Tour (główna przyczyna: pigułki graczy w nagłówku `Game.tsx`), Państwa-miasta, Kalambury u zgadującego,
  Narysuj koło, a na Androidzie z klawiaturą prawdopodobnie Policz kropki, Kąt i W pamięci (U1). Kampus Tour ucina środek planszy (KT10). Poziomego przewijania strony nie ma nigdzie
  (jedyne w kaflu: tabela głosowania Państw-miast, PM2).
- **Animacje:** 14 keyframes z `index.css`, wszystkie użyte, nazwy spoza katalogu nie występują; 6 z nich nie ma w liście §5 (U17), animacje Tailwinda w 8 miejscach (U16).
  Dwie gry wstrzymują akcję do końca animacji (Chińczyk, Kampus Tour: U2), Statki mają na to wyjątek w §5.
- **Ta sama sytuacja inaczej** (kryterium 4): 17 wpisów A1-A17 z macierzy §4; najczęstsze to pomyłka bez znaku i bez wibracji, odsłona prawdziwego wyniku, ruch zignorowany,
  czekanie na rywala i słowa przejścia dalej („OK”, „Następna runda”, „Wyniki” zamiast „Dalej”).

## 2. Wpisy o wysokiej wadze

### U1. Ekran partii nie mieści się na 360×640 `[zbiorcze: wysokosc-640]`
- Źródło: `ZASADY.md` §4 Reguły („Ekran mieści się na 360×640”), `AGENTS.md` (UI: 360×640); D-07 („ekran gry nie mieści się”).
- Waga: **wysoka** dla ekranu, na którym gracz działa w trakcie partii (wykładnia z 02-06 przyjęta dla całej fazy; ekrany podsumowania z akcją w `StickyBar` to U3, listy poza partią HM-8).
  Gomoku i Statki są znane z `DESIGN.md` §6 („Rozbieżności do decyzji”), zmierzone na nowo (D-05); `DESIGN.md` §6 twierdzi, że „pozostałe ekrany mieszczą się w 640 px”, co kłóci się z resztą tabeli.

| Gra | Miejsce | Wysokość (statycznie) | Wpis częściowy |
|---|---|---|---|
| `piec-w-rzedzie` | `PiecWRzedzie.tsx:42-105`, `:108-118`; nagłówek `Game.tsx:233-338` | 686 px w turze, 698 po partii („Rewanż” pod krawędzią); `StickyBar` przykrywa ok. 46 px planszy | G1 (02-05) |
| `statki` | `Statki.tsx:288-337` (rozstawianie), `:127-139`, `:381-419` (bitwa); pigułki `w-full` `Game.tsx:266` | rozstawianie ok. 800 px („Obróć”, „Losuj” pod krawędzią), bitwa ok. 960 px, obrona ok. 875 px | S1 |
| `chinczyk` | `Chinczyk.tsx:206`, `:259-298` (komentarz `:255` sam to przewiduje) | 684 px (4 graczy do 772); `StickyBar` przykrywa dolne domki | C1 |
| `labirynt` | `Labirynt.tsx:124`, `:186-236` | 742 px w swojej turze (4 graczy 830); `StickyBar` przykrywa własny pionek na starcie | L1 |
| `memory` | `Memory.tsx:55-60`, `:75` (komentarz `:55` mówi, że się mieści) | tryb Średni 651 px (pigułki w dwóch wierszach 695); Mała i Duża mieszczą się | M1 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:165-216` (pisanie), `:243-248` (głosowanie) | pisanie ok. 820 px bez klawiatury, głosowanie ok. 770 px (podsumowanie: U3) | PM1 |
| `kalambury` | `Kalambury.tsx:36` (`BELOW_CANVAS_PX` bez nagłówka), `:342`, `:350`, `:358-382` | zgadujący 677-725 px; „Pasuję” pod krawędzią; do potwierdzenia w przeglądarce | KL1 |
| `kolo` | `Kolo.tsx:187-195` (płótno bez `max-w-[calc(100dvh-…)]`), `:217`, `:221` | 707 px solo / 683 w pokoju po pierwszej próbie; do potwierdzenia | KO1 |
| `kropki`, `kat` | `Szacowanie.tsx:140` (`max-w-[calc(100dvh-23.5rem)]`), `:144-155` (formularz w kaflu, `autoFocus`), `apps/web/index.html:5` (`interactive-widget=resizes-content`) | bez klawiatury 603-627 px; na Androidzie klawiatura zmniejsza `100dvh`, kafel z polem i „Zatwierdź” spada do ok. 42 px; do potwierdzenia na Androidzie | SZ1 |
| `w-pamieci` | `WPamieci.tsx:126` (ten sam `max-w-[calc(100dvh-23.5rem)]`), `:135-151` (formularz `absolute inset-0` w kaflu, `autoFocus` `:144`) | jak SZ1 (dopisane w 02-11: 02-10 policzyło wysokość bez klawiatury, 562 px) | WP5 (nowy) |

- Propozycja (faza 4/5): (1) zmniejszyć wspólny nagłówek gier głównych w trakcie partii (pigułki w jednym zwijanym wierszu jak `GameDots`, pasek limitu w wierszu tytułu), co zabiera 44-130 px
  we wszystkich grach głównych naraz; (2) per gra: przełącznik i akcja Labiryntu w jednym wierszu, kostka Chińczyka w wierszu z „Rzuć”, „Obróć” / „Losuj” Statków w `StickyBar`,
  w Memory Średniej `aspect-[4/3]`, w Kalamburach płótno z wysokości pozostałej pod nagłówkiem, w Kole `max-w-[calc(100dvh-…rem)] mx-auto` jak w pozostałych grach paczki,
  w Szacowaniu i W pamięci dolna granica kafla (`max-w-[max(16rem,calc(100dvh-23.5rem))]`) albo formularz pod kaflem; Państwa-miasta: ciaśniejszy formularz albo wyjątek „formularz
  z klawiaturą przewija się, akcja w `StickyBar`” w `DESIGN.md` §6; (3) po poprawkach poprawić `DESIGN.md` §6 i zmierzyć w Playwright 360×640 (D-09).

### U2. Akcja w partii dostępna dopiero po animacji `[zbiorcze: akcja-po-animacji]`
- Źródło: `ZASADY.md` §5 „Animacja nie blokuje gry. Przyciski działają w trakcie, kolejny stan z serwera przerywa poprzednią animację” (jedyny wyjątek: Statki, `SWAP_MS`); D-07 („animacja blokująca ruch”).
- Waga: **wysoka** w obu grach; obie mają powód (nie zdradzać wyniku rzutu przed dojściem pionka), którego §5 nie przewiduje. §5 wskazuje `Chinczyk.tsx` jako wzór kroków, więc wzór sam łamie regułę.

| Gra | Miejsce | Ile trwa blokada | Wpis |
|---|---|---|---|
| `chinczyk` | `Chinczyk.tsx:122-123` (`settled`, `myMove`), `:192`, `:201` | `ROLL_MS` 700 ms + do 6 × `STEP_MS` 180 ms (Szybki: 400 + 660 ms, przy limicie 20 s); nowy stan dopisuje się do celu zamiast przerywać (`:76-93`) | C8 |
| `kampus-tour` | `KampusTour.tsx:350-352` (`settled`, komentarz `:351`), `:394-395`, `:457`, `:870-944`, `:1028`, `:1054` | do 700 + 12 × 220 = 3340 ms na rzut, po dublecie znowu | KA1 |

- Propozycja (decyzja fazy 4): albo dopisać do §5 wyjątek „kroki sekwencyjne: decyzja czeka na dojście pionka, najwyżej `ROLL_MS` + n × `STEP_MS`” obok wyjątku Statków (wtedy oba wpisy przechodzą
  do §6), albo pozwolić na akcję od razu: dotknięcie w trakcie kończy animację (`setShown(target)`). Do fazy 3: marsz Kampus Tour wydłuża partię 20 rund o kilka minut (szacunek 45 min w `KONCEPT.md` §2.1).

### KT10. Kampus Tour: treść środka planszy wyższa niż nakładka (do potwierdzenia w przeglądarce)
- Gra: `kampus-tour`. Miejsce: `KampusTour.tsx:848-849` (nakładka `CENTER_HEIGHT`, `overflow-hidden`, `justify-center`), treść `:850-973`, stałe `:201-202`.
- Źródło: `ZASADY.md` §4 („Ekran mieści się na 360×640”), `AGENTS.md`; D-07. Waga: **wysoka**.
- Opis: nakładka ma 170 px sceny; faza `buy` ok. 224 px, `roll` z Biletem MPK ok. 204 px, po partii ok. 250 px. `justify-center` ucina z obu stron: pierwszy znika wiersz „Runda N/20”
  z paskiem limitu, potem najstarsze wpisy logu, po partii „Rewanż” / „Podsumowanie”. Na 390×844 problem zostaje.
- Propozycja: log do 1-2 wpisów albo z `line-clamp`, `buyInfo` w jednej linii, wiersz rundy z licznikiem poza obszarem z `overflow-hidden`; najpierw zrzut w przeglądarce.

### ZK1. Zakupy: „Gotowe” na `onClick` kończy pomiar drugiego kryterium
- Gra: `zakupy`. Miejsce: `Zakupy.tsx:175` (`onClick={done}`), pomiar `:71`. Styk z fazą 1: F1:ZK1 (limit 60 s bez zapasu, `Zakupy.tsx:68-72`) dotyczy tej samej funkcji `done`.
- Źródło: `ZASADY.md` §4 („pola gry na czas … reagują na `onPointerDown`”), D-07. Waga: **wysoka** (czas zaznaczania to `record.tie`; czas trzymania palca, 50-150 ms, dolicza się nierówno; w praktyce rozstrzyga tylko remisy punktowe).
- Propozycja: `onPointerDown={done}` i `onClick` tylko dla klawiatury (`e.detail === 0`), jak na półce (`Zakupy.tsx:166-168`); poprawić razem z F1:ZK1.

## 3. Rozbieżności platformy (02-02, 02-03)

Wzorce `index.css` i `ui.tsx` (B-xx z `02-02-BASELINE.md`) i ekrany platformy (02-03). Wpisy wspólne z grami są w §5 (numer U), tu tylko odsyłacz.
Ocena pliku po pliku: §8.1.

| Wpis | Miejsce | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| B-31 | `index.css:145-152` (`Kolor.tsx:197`, `Rok.tsx:187`) | suwak `.swatch-range` 36 px | `ZASADY.md` §4, `AGENTS.md` | średnia → **U4** | |
| B-32 | `index.css:155-168` | uchwyt suwaka `#fff` / `#000`, cień, promień 6 px | `ZASADY.md` §4, `DESIGN.md` §2 | średnia → **U5**, niska → U21, U22 | |
| B-36 | `Chinczyk.tsx:219`, `Memory.tsx:90`, `Game.tsx:525` | `ring-pulse` 1 s i 1,2 s | `ZASADY.md` §5 | średnia → **A1** | |
| GM-1 | `Game.tsx:455-459` | akcje po partii poza `StickyBar`, „Rewanż” pod zgięciem | `ZASADY.md` §4, `DESIGN.md` §2 | średnia → **U3** | |
| GM-2 = KT12 | `Game.tsx:93` | pasek limitu Kampus Tour bez koloru gracza | `ZASADY.md` §4, `DESIGN.md` §3.4 | średnia → **U8** | |
| LB-1, LB-2, LB-3 | `Lobby.tsx:435`, `:392`, `:158` | „Wyjdź” ok. 36 px, próbki koloru 40 px, wiersz gracza 44 px | `ZASADY.md` §4, `AGENTS.md` | średnia → **U4** | |
| SU-1 | `Setup.tsx:48-49` | wybrany tryb tylko kolorem | `DESIGN.md` §5, §4 | średnia → **U6** | |
| RC-1 | `Records.tsx:351`, `:355` | liczba „Do pobicia” w `warning` | `DESIGN.md` §2, §5, D-04 | średnia → **U7** | |
| B-15 | `index.css:27` | token `accent-hover` bez wiersza w `DESIGN.md` §2 | `DESIGN.md` §2 | niska | dopisać „`accent-hover` `#ff4560`, akcent pod kursorem (tylko `.btn-primary`)” |
| B-18 | `ZASADY.md` §4 „Z czego gra się składa” | `ZASADY.md` wymienia 8 tokenów i 2 zaokrąglenia, `DESIGN.md` §2 13 i 3 (sprzeczność źródeł, D-13) | `DESIGN.md` §2 | niska | w `ZASADY.md` §4 odesłać do tabeli `DESIGN.md` §2 |
| B-20 | `index.css:43-49`, `apps/web/index.html:6` | brak `color-scheme: dark` (natywne kontrolki mogą być jasne) | `AGENTS.md` (tylko ciemny motyw) | niska | `color-scheme: dark;` w `html` |
| B-29 | `index.css` (brak klasy) | akcja w partii (`btn text-bg` + kolor gracza) bez wspólnej klasy przy trzech i więcej użytkownikach | `DESIGN.md` §5, `ZASADY.md` §4 | niska | `.btn-player` albo wpis w `ZASADY.md` §4 |
| B-52 | `index.css:365` | podgląd `Intro` przy reduced motion pokazuje stan bazowy wszystkich klatek | `ZASADY.md` §4, `DESIGN.md` §3.3 | niska | zasada w §5: pierwsza klatka bazowo widoczna, reszta ukryta (podglądy sprawdzone: wszystkie czytelne) |
| B-53 | `ZASADY.md` §5 | brak wyjątku dla ruchu, który jest treścią gry (Kubki, Śledzenie, Wieża, Za zasłoną) | `ZASADY.md` §5 | niska (luka w zasadach) | dopisać wyjątek (§7); po dopisaniu cztery gry zostają w §6 |
| HM-1 | `Home.tsx:160`, `:241` | dwa wypełnione akcenty („Zagraj”, „Dołącz”) przy pełnym kodzie; `KONCEPT.md` §1 i `DESIGN.md` §3.1 tak to opisują, `DESIGN.md` §5 przeczy | D-13 | niska | „Zagraj” jako `btn-ghost` przy pełnym kodzie albo wyjątek w `DESIGN.md` §5 |
| HM-2 | `Home.tsx:28` | logo w `fill-accent` (znak aplikacji bez roli w `DESIGN.md` §2) | `DESIGN.md` §2, §5 | niska | dopisać „znak aplikacji” do roli `accent` albo do §6 |
| HM-3 | `Home.tsx:188`, `:195` | „Wszystkie (30)” `whitespace-nowrap` w kolumnie ok. 139 px (szacunek 140-158 px); do potwierdzenia | `ZASADY.md` §4 | niska | bez `whitespace-nowrap` albo „Wszystkie” |
| HM-8 | `Home.tsx:265-341`, `Lobby.tsx:75-103`, `Setup.tsx:21-64`, `Records.tsx:332-403` | `DESIGN.md` §6 mówi, że ekrany poza partią mieszczą się w 640 px; ekran główny ok. 890 px, lobby ok. 1000 px, `Setup` Statków ok. 860 px. Pionowe przewijanie list jest w porządku (akcja w `StickyBar`), więc to błąd opisu | `DESIGN.md` §6 wobec `ZASADY.md` §4 | niska | w `DESIGN.md` §6: listy przewijają się w pionie z akcją w `StickyBar`, 640 px dotyczy ekranu partii |
| SU-3 | `Setup.tsx:29` | tytuł ekranu gry w Satoshi 16 px 400 (ani tytuł, ani nazwa wyróżniona) | `DESIGN.md` §2 | niska | `font-semibold` |
| RC-2 | `Records.tsx:260`, `:353`, `:387` | `bg-surface-inset` (rola: pola formularza) jako tło pigułek i kafelków | `DESIGN.md` §2, D-04 | niska | `bg-surface` albo sam obrys `line` |
| RC-3 | `Records.tsx:374` | link „Pokaż wszystkie” / „Zwiń” w kolorze gracza | `DESIGN.md` §5 | niska | `text-fg-muted underline underline-offset-4` |
| RC-6 | `App.tsx:72` → `Records.tsx:333` | „Rekordy” z pokoju z `dropped={false}`: brak paska „Łączenie ponownie…” | `DESIGN.md` §4, `ZASADY.md` §4 | niska | prop `dropped` z `App.tsx` |
| AP-2 | `App.tsx:45` → `Home.tsx:52`, `:231` | „Połączenie z pokojem zostało zamknięte.” jako błąd pola kodu (`aria-invalid`) | `DESIGN.md` §4 | niska | osobny stan `notice` nad sekcjami |

Bez wpisów (zgodne z §4 i §5): tokeny `@theme` (B-01..B-14, B-16), poświata `body::before` (B-21), `.tile`, `.label`, `.btn`, `.btn-primary`, `.btn-ghost`, `.field` (B-22..B-30),
focus (B-26), `Screen`, `TopBar`, `PlayerDots`, `GameDots`, `Scores`, `Stats`, `grade`, `RoundTable`, `StickyBar`, `IntroContext`, `Intro` (B-55..B-72, B-75, B-76), reguła reduced motion (B-51),
wibracja tury `Game.tsx:35` (raz przy przejściu na moją turę, bez powtórki przy kolejnym ruchu tego samego gracza), ukrycie licznika u grającego (`Game.tsx:208-210`).

## 4. Macierz sytuacji między grami (kryterium 4)

Złożona z tabel „Sytuacje” planów 02-03..02-10 (D-12). Wiersz = sytuacja, kolumna = gra; komórka = animacja (keyframes + czas) · wibracja · słowo.
Macierz jest podzielona na bloki według rodzin gier (jak plany fali 2), żeby tabela zmieściła się na ekranie; każda gra z `GAMES` i Turniej mają kolumnę.

Skróty: `sp` = `stone-pop` 0,35 s `ease-out`, `th` / `tm` = `tile-hit` / `tile-miss` 0,35 s, `fu` = `float-up` 1,6 s, `tp` = `title-pop` 0,5 s u zwycięzcy (`Game.tsx:243`),
`rp` = `ring-pulse`, `ci` = `card-in` 0,35 s, `sh` = `shake` 0,3 s, `pf` = `piece-fall` 0,5 s, `ap` / `ag` = `animate-pulse` / `animate-ping` Tailwinda, „brak” = bez animacji,
„·” = sytuacja nie występuje; wibracja: `40`, `60`, `[60,40,60]`, `0` = bez wibracji. W każdej grze „moja tura” to `40` z `Game.tsx:35` (gra nie dubluje), a po partii „Rewanż” / „Do lobby”
(solo „Jeszcze raz” / „Wyjdź”) z `Game.tsx`; wiersze te powtarzają się tylko tam, gdzie gra odstaje.

### 4.1 Gry główne turowe

| Sytuacja | `piec-w-rzedzie` | `statki` | `chinczyk` | `labirynt` | `memory` | `kampus-tour` |
|---|---|---|---|---|---|---|
| pojawienie elementu | `sp` kamień + obrys · 0 | `sp` strzał · 0 | · | `sp` ścianka · 0 | obrót 180 ms · 0 | `ci` okna · 0; okienko pola brak (A16) |
| „to można wybrać” | `ap` podgląd kamienia | · | `rp` 1 s (A1) | `ap` kropki kroku (A2) | `rp` 1,2 s + poświata | pole decyzji unosi się, 150 ms |
| czekamy na rywala | `ap` kropka (A3) | `ap` kropka (A3) | tekst | tekst | `ag` kropka (A3) | tekst „… rzuca kośćmi…” |
| trafienie | · | `sp` płomień · 0 | · | · | `sp` para · 0 (A14) | · |
| pomyłka / pudło | · (pole zajęte nieaktywne) | pudło: stary układ 1,2 s · 0 (A6); złe ustawienie: duch 600 ms · 60 | · | zła ścianka: przycisk z powodem · 0 | pudło widoczne 1,5 s · 0 (A6) | · |
| zbicie / zło od rywala | · | trafienie w moją flotę: `sp` · 0 (A7) | do domku od razu · [60,40,60] | · | · | wykupienie mojego pola: `fu` · 0 (A7) |
| rzut / krok pionka | · | · | `dice-tumble` 700 ms, krok 180 ms | przejście 200 ms | · | `dice-tumble` 700 ms (też bez rzutu, KA2), krok 220 ms (raz krokami, raz od razu, KA3) |
| akcja w trakcie animacji | działa | czeka 1,2 s po pudle (wyjątek §5) | czeka (U2) | działa | działa | ukryta (U2) |
| koniec partii | `line-draw` 0,5 s + poświata + `tp` | `tp` | `tp` + lista miejsc | `tp` | `tp` | `ci` podsumowania, bez `tp` i koloru zwycięzcy (A8) |
| przycisk akcji w partii | „Postaw” (kolor gracza) | „Gotowe”, „Strzel w B5” (kolor gracza) | „Rzuć” (kolor gracza) | „Postaw” (kolor gracza) | karty | „Rzuć kośćmi”, „Kup…” (kolor gracza) |
| przycisk przejścia dalej | · | · | · | · | · | „OK” (U9), „Podsumowanie” |
| nagłówek tury | „Twój ruch” / „Ruch: X” | jak obok | jak obok | jak obok | jak obok | „Twoja tura” / „Tura: X”, „Koniec gry” (U9); pasek limitu `fg-muted` (U8) |

### 4.2 Fazy równoczesne i Turniej

| Sytuacja | `panstwa-miasta` | `kalambury` | `turniej` |
|---|---|---|---|
| pojawienie elementu | baner STOP bez animacji (A7) | kreski i czat bez animacji; odsłonięta litera bez animacji (KL8) | tabela i odznaki bez animacji |
| trafienie | `Check` w `success` · 0 | „Trafione!” w `success` · 0 | (mini-gry) |
| pomyłka | zła litera: ramka `warning` bez ikony (U6) · 0 | pudło w czacie · 0 | (mini-gry) |
| zło od rywala | STOP innego gracza · 0 (A7) | · | · |
| koniec rundy | brak; „Dalej” w kolorze gracza (A11) → „Czekamy na resztę” (U30) | jak obok | koniec gry: `tp` u zwycięzcy gry; „Dalej” `btn-primary` → „Czekamy na: …” |
| koniec partii | `tp` | `tp` | `tp` u mistrza |
| moja tura | 40 tylko przy zmianie `myTurn`, nie przy nowej fazie (A10) | 40 u zgadujących w połowie rysowania (A10) | 40 na starcie każdej gry |
| przycisk akcji | „STOP!” / „Gotowe”, „Oddaj”, „Zatwierdź (odrzucam N)” / „Wszystko się zgadza” | „Zgadnij”, „Pasuję” | „Zagraj: …” (`StartBar`) |
| nagłówek | własny; tytuł fazy i pasek bez koloru gracza, bez kreski „to ja” (U8) | własny; tytuł w kolorze rysującego | `.label` „Turniej · gra n/m” |

### 4.3 Mini-gry na czas i reakcję

| Sytuacja | `refleks` | `simon` | `stoper` | `stoj` | `rytm` | `przytrzymaj` | `zaslona` | `balon` |
|---|---|---|---|---|---|---|---|---|
| pojawienie bodźca | przeskok koloru | zapalenie, przejście 100 ms | cyfry co 30 ms | przeskok koloru | błysk 100 ms bez przejścia · 30 (metronom) | przeskok | ruch z rAF | nowy balon od razu |
| trafienie | brak, „{n} ms” · 0 | błysk 200 ms · 0 | · | brak, czas mono · 0 | błysk w kolorze gracza 100 ms · 0 | · | · | `fu` „+n” (ucięte po 0,8 s, BL5) · 0 |
| pomyłka | falstart: brak · 0 (A6) | brak, od razu wyniki · 0 (A6) | · | `tm` · 60 | · | · | · | pęknięcie: `fu` „Pękł!” · 60 |
| blokada po pomyłce | przerwa 0,8 s | koniec partii | · | brak (kara −2, odstępstwo) | · | · | · | pauza 0,8 s |
| ruch zignorowany | · | · | · | · | · | · | brak znaku (A5) | · |
| odsłona prawdziwego wyniku | · | · | kafel, kolor progu (lokalne `grade`, U35) | · | · | 1,5 s, kolor progu (U35) | 1,5 s, `grade` | · |
| koniec rundy | kolejna zmiana | 400 ms przerwy | · | · | · | samoczynnie po 1,5 s | 1 s przerwy | pauza 0,8 s |
| ekran końcowy | własna tabela + wykres (U10) | `Scores` | kafel + `Scores` | `Results` z `Quiz.tsx` (U10) | kafel + `Scores` | własna tabela (U11) | `Scores` + `RoundTable` | `Scores` + własna tabela (U11) |
| licznik tury u grającego | widoczny | widoczny | ukryty | widoczny | ukryty | ukryty | ukryty | widoczny |
| przycisk akcji | pole | pola | pole | pole | pole | pole | pole | „Zgarnij {n} pkt” (kolor gracza) |

### 4.4 Mini-gry na trafienia

`Q` = jak w kolumnie `stroop` (wspólny `Quiz.tsx`).

| Sytuacja | `stroop` | `liczenie` | `inny` | `obrot` | `literowka` | `dziesiatki` | `schulte` | `sudoku` | `zakupy` |
|---|---|---|---|---|---|---|---|---|---|
| nowa plansza | brak (bodziec bez przejścia) | Q | Q (siatka rośnie) | Q | Q | nowe liczby w `th` pary | · | · | lista bez animacji, pasek pokazu 10 s (U18) |
| trafienie | `th` na przycisku nowego pytania (QZ3) · 0 | Q | Q | Q | Q | `th` obu komórek · 0 | `th` · 0 | `th` · 0 | · |
| pomyłka | `tm` + ramka `warning` + „Źle!” · 60 | Q | Q | Q (−1 pkt) | Q (−1 pkt) | `tm` + „Źle!” · 60 | `tm` + kara w `Stats` · 60 | `tm` + kara w `Stats` · 60 | · (liczy serwer na końcu) |
| blokada po pomyłce | 1 s, reszta 40% | Q | Q, ta sama plansza | Q | Q | 1 s | brak, +3 s | brak, +5 s | · |
| zaznaczenie pola | · | · | · | · | · | ramka 1 px + tło 25%, bez `aria-pressed` (A15) | · | pierścień 2 px (A15) | pierścień 2 px + `aria-pressed` (A15) |
| ekran końcowy | `Results` (U10) | Q | Q | Q | Q | `Results` (U10) | `Scores` + wykres | `Scores` | `Scores` + półka |
| przycisk akcji | odpowiedzi | Q | Q | „Ta sama” / „Lustro” | słowa | pole | pole | klawiatura cyfr | „Gotowe” (kolor gracza, `onClick`: ZK1) |

### 4.5 Mini-gry z odchyłką w rundach

| Sytuacja | `kolo` | `kolor` | `kropki` | `kat` | `rok` | `srodek` | `mapa` | `tort` | `nozyczki` |
|---|---|---|---|---|---|---|---|---|---|
| pojawienie elementu | ocena próby od razu | wzór 2 s bez przejścia | kropki 1,5 s bez przejścia | kąt 1,5 s bez przejścia | wydarzenie | odcinek | nazwa miasta | tort z cięciem | kształt |
| trafienie (lepsza próba) | „Nowy rekord!” (U9) | · | · | · | · | · | · | · | · |
| ruch zignorowany | tekst `warning` · 0 (A5) | · | · | · | · | `sh` + tekst · 60 | · | · | `sh` + tekst · 60 |
| odsłona: animacja | brak | brak | brak | brak | brak | brak | `sp` pierścienia (A4) | brak | brak |
| odsłona: jak długo | do kolejnej próby | do przycisku | do przycisku | do przycisku | 2,5 s | 1 s | 1,5 s | 1,5 s | 1,5 s |
| odsłona: kolor prawdy | % na płótnie | % | różnica zielona tylko przy 0 (U37) | jak `kropki` | pierścień zawsze `success` (U37) | `grade` | `grade` | `grade` | `grade` |
| odsłona: słowo | · | · | „Idealnie” (U30) | „Idealnie” | „Idealnie” | „Idealnie!” | „Idealnie!” | „Idealnie!” | „Idealnie!” |
| przejście do następnej rundy | · | „Następny kolor” (U9) | „Następna runda” / „Wyniki” (U9) | jak `kropki` | samo | samo | samo | samo | samo |
| przycisk akcji | „Zostaw najlepszą i zakończ” (`btn-ghost`) | „Zatwierdź kolor” | „Zatwierdź” | „Zatwierdź” | „Zatwierdź” | gest | „Zatwierdź” | „Pokrój” | gest |
| pasek czasu rundy | · | · | · | · | własny nad kaflem (A12) | · | · | · | · |
| ekran końcowy | karty z miniaturami (odstępstwo) | `Scores` + pary (U11) | `Scores` + `Answers` (U11) | jak `kropki` | `Scores` + lista (U11) | `Scores` + `RoundTable` | jak `srodek` | jak `srodek` | jak `srodek` |

### 4.6 Mini-gry do pierwszej pomyłki

| Sytuacja | `kubki` | `sledzenie` | `wieza` | `w-pamieci` |
|---|---|---|---|---|
| pojawienie elementu | uniesienie kubka 150 ms (U15) | podświetlenie celów bez przejścia, 1,5 s | klocek od razu jedzie | `sp` 180 ms (U19) |
| ruch będący treścią | rAF (odstępstwo, B-53) | rAF (odstępstwo) | rAF (odstępstwo) | · |
| trafienie | „Dobrze” w `Stats` · 0 | „Dobrze” w `Stats` + pierścień `success` · 0 | `th` (idealne) + `fu` werdykt · 0 | „Dobrze” w `success` w kaflu, 800 ms (A13) · 0 |
| pomyłka | zły kubek krycie 0,3, „Pomyłka” · 60 | złe kulki krycie 0,3 + pierścienie celów · 60 | `pf` + `fu` „Pudło” · 60 | odsłona bez animacji · 60 |
| odsłona prawdziwego wyniku | 1 s | 1 s | werdykt `fu` | do „Wyniki”, bez limitu (A9) |
| koniec rundy | opadanie 150 ms + 300 ms | 700 ms przerwy | widok zjeżdża 180 ms | pusty kafel 800 ms |
| koniec partii | po 1 s same `Scores` | po 1 s same `Scores` | po 1 s same `Scores` | po „Wyniki” (A9, U9) |
| przycisk akcji | pole | pole | pole | „Zatwierdź” (kolor gracza) |

### 4.7 Ekrany platformy

| Sytuacja | `Game.tsx` | `Home.tsx` | `Lobby.tsx` | `Setup.tsx` / `MiniGames.tsx` | `Records.tsx` / `App.tsx` |
|---|---|---|---|---|---|
| dotknięcie przycisku | `.btn` skala 0,98, 180 ms | jak obok | jak obok | jak obok | jak obok |
| zaznaczenie / zmiana stanu | pigułka 150 ms (U15) | · | kafel 150 ms, tło przeskakuje (U15) | kafel 150 ms (U15) | strzałka akordeonu 150 ms (U15) |
| ładowanie | · | tekst przycisku „Łączenie…” / „Tworzenie…”; start solo bez słowa (U26) | szkielety `ap` (U16, U26) | rekordy `{}` jako „nie grane” (U26) | „Wczytywanie…”; `TopGame` i wznawianie sesji bez słowa (U26) |
| ostatnie 10 s limitu | `ap` + `warning` (U16) | · | · | · | · |
| koniec partii | `tp` 0,5 s, liczba wygranych `sp` 0,5 s (U19), `fu` „+1” | · | · | · | `set-glow` 0,9 s × 4 przy „Nowy rekord!” |
| inni chcą rewanżu | `rp` 1,2 s na „Rewanż” | · | · | · | · |
| przycisk przejścia dalej | „Rewanż”, „Do lobby”, w turnieju „Dalej” | · | „Zagraj: <gra>”, „Zgłaszam gotowość” | „Zagraj: <gra>”, „Losuj” | „Wróć”, „Pobij”, „Zagraj ponownie” |

### 4.8 Wariant dominujący i gry odstające

| Sytuacja | Wariant dominujący | Gry odstające (wpis) |
|---|---|---|
| pojawienie elementu | `stone-pop` 0,35 s `ease-out` (Gomoku, Statki, Labirynt, Mapa); okno na środku `card-in` 0,35 s; bodziec w grze na refleks bez przejścia (`DESIGN.md` §4) | W pamięci 180 ms, odznaka i liczba wygranych 0,5 s (U19); okienko pola Kampus Tour bez `card-in` (A16); STOP Państw-miast i litera Kalamburów bez animacji (A7, KL8); uniesienie kubka 150 ms (U15) |
| „to można wybrać” | `ring-pulse` 1,2 s ∞ (Memory, „Rewanż”) | Chińczyk 1 s (A1); Labirynt `animate-pulse` (A2) |
| czekamy na rywala | brak dominującego: `animate-pulse` ×2, `animate-ping` ×1, sam tekst ×3 | A3 (decyzja: jedna animacja z komentarzem albo nieruchoma kropka) |
| trafienie | `tile-hit` 0,35 s bez wibracji (Quiz ×5, Dziesiątki, Schulte, Sudoku, Wieża); w grach do pomyłki słowo „Dobrze” w `Stats` (Kubki, Śledzenie); żadne trafienie nie wibruje | W pamięci „Dobrze” w kaflu (A13); Memory para `stone-pop`, a „świeże osiągnięcie” to `set-glow` (A14); błysk na przycisku nowego pytania (QZ3) |
| pomyłka | `tile-miss` 0,35 s + `warning` + słowo + wibracja 60 (Quiz, Dziesiątki, Schulte, Sudoku, Stój!); w grach do pomyłki krycie 0,3 albo `piece-fall` + 60 | Refleks (falstart) i Sekwencja: bez znaku i bez wibracji (A6); do decyzji pudło w Memory i Statkach (A6). Balon: pęknięcie to `float-up` „Pękł!” + 60 (inny obraz, bo balon znika; bez wpisu) |
| blokada po pomyłce | 1 s, reszta przygaszona 40% z „Źle!” (Quiz, Dziesiątki; `KONCEPT.md` §2.4) | bez wpisów: Schulte i Sudoku mają karę czasu, Stój! karę punktową (odstępstwa z powodem, §6) |
| ruch zignorowany (bez kary) | `shake` 0,3 s + tekst `warning` + 60 (Środek, Nożyczki, opisane w `ZASADY-GIER.md`) | Narysuj koło: sam tekst, Za zasłoną: nic (A5); wibracja 60 przy „to nie kara” sama nie ma wiersza w tabeli §5 (A5) |
| odsłona prawdziwego wyniku | bez animacji (7 gier); samoczynnie po 1-2,5 s (Mapa, Środek, Tort, Nożyczki, Który rok?, Za zasłoną, Przytrzymaj, Kubki, Śledzenie); znacznik prawdy przez `grade` | Mapa `stone-pop` (A4); pierścień prawdy zawsze `success` w Który rok? i Szacowaniu (U37); „Idealnie” bez wykrzyknika (U30); odsłona do przycisku: Odcień, Szacowanie (opisane w `ZASADY-GIER.md`, słowa U9), W pamięci bez limitu (A9) |
| koniec rundy / przejście dalej | samoczynnie albo „Dalej” | „OK”, „Następny kolor”, „Następna runda”, „Wyniki” (U9); „Dalej” w kolorze gracza w Państwach-miastach i Kalamburach, w akcencie w turnieju (A11) |
| koniec partii | `title-pop` 0,5 s u zwycięzcy i tytuł w kolorze zwycięzcy (`Game.tsx`); ekran końcowy mini-gry `Scores` (+`RoundTable`) | Kampus Tour bez `title-pop` i koloru (A8); W pamięci czeka na „Wyniki” (A9); własne listy wyników (U10) i tabele rund (U11) |
| zbicie / zło od innego gracza | [60, 40, 60] u ofiary (Chińczyk, tabela §5) | Statki (trafienie w moją flotę), Kampus Tour (wykupienie pola), Państwa-miasta (STOP): bez wibracji (A7) |
| moja tura | 40 z `Game.tsx:35` przy zmianie `myTurn` | Państwa-miasta: brak przy nowej fazie, Kalambury: wibracja w połowie rysowania zdradza połówki (A10) |
| przycisk akcji w partii | `btn text-bg` w kolorze gracza; żaden plik gry nie używa `btn-primary` | brak odstających; KT1 (pola wyboru w akcencie), ZK1 (`onClick` w pomiarze) |
| pasek czasu | `Countdown` z `Game.tsx` w kolorze gracza z ruchem | Kampus Tour, Państwa-miasta (U8); Który rok? własny pasek rundy (A12); pasek pokazu Zakupów i pasek Rytmu jako przejście CSS (U18) |
| zaznaczenie pola w grze na czas | pierścień 2 px w kolorze gracza (Sudoku, Zakupy) | Dziesiątki ramka 1 px bez `aria-pressed`; wszystkie trzy bez przejścia (A15) |

### 4.9 Słowa: ta sama rola, różny tekst

| Rola | Słowo dominujące | Inne słowa (`plik:linia`) | Wpis |
|---|---|---|---|
| przejście do następnej rundy / ekranu | „Dalej” (`PanstwaMiasta.tsx:104`, `Kalambury.tsx:139`, `Game.tsx:554`) | „OK” (`KampusTour.tsx:1044`, `:1097`), „Następny kolor” (`Kolor.tsx:178`), „Następna runda” i „Wyniki” (`Szacowanie.tsx:183`), „Wyniki” (`WPamieci.tsx:170`) | U9 |
| status tury w nagłówku | „Twój ruch” / „Ruch: X” / „Remis” / „Koniec” (`Game.tsx:186-205`) | „Twoja tura” / „Tura: X” / „Koniec gry” (`KampusTour.tsx:406-409`) | U9 |
| nowy rekord | „Nowy rekord!” = rekord wszech czasów (`Records.tsx:147`, `KONCEPT.md` §2.4) | „Nowy rekord!” po lepszej próbie w partii (`Kolo.tsx:139`) | U9 |
| czekanie po własnym „Dalej” | „Czekamy na: {nicki}…” (`Game.tsx:530`, `:556`, `Lobby.tsx:205`) | „Czekamy na resztę” (`PanstwaMiasta.tsx:105`, `Kalambury.tsx:140`) | U30 |
| wynik bez błędu | „Idealnie!” (`Srodek.tsx:179`, `Mapa.tsx:187`, `Tort.tsx:173`, `Nozyczki.tsx:155`, Wieża) | „Idealnie” (`Szacowanie.tsx:179`, `Rok.tsx:198`) | U30 |
| zatwierdzenie odpowiedzi | „Zatwierdź” (`Szacowanie.tsx:157`, `Rok.tsx:201`, `Mapa.tsx:191`, `WPamieci.tsx:149`; „Zatwierdź kolor” `Kolor.tsx:177`) | „Gotowe” (`Zakupy.tsx:175`), „Pokrój” (`Tort.tsx:182`): oba nazwane w `KONCEPT.md` §2.4, bez wpisu | - |
| „Gotowe” | gotowość rozstawienia (`Statki.tsx:324-335`) | oddanie kartki po STOP (`PanstwaMiasta.tsx:202`), zatwierdzenie zaznaczeń (`Zakupy.tsx:175`) | A17 |
| „Dalej” w jednej grze | przejście rundy (`PanstwaMiasta.tsx:105`) | następne pole formularza (`PanstwaMiasta.tsx:212`) | U30 |
| podpis odpowiedzi | „Ta sama” / „Lustro” (`Obrot.tsx:71`, `:75`) | „ta sama” / „lustro” w podglądzie (`Obrot.tsx:55`) | U30 |
| ucięcie klocka | „ucinane” (`ZASADY-GIER.md`, `KONCEPT.md`), „ucięte” (`Wieza.tsx:116`) | „odcięte” (`Wieza.tsx:170`) | U30 |
| legenda progów | „czerwony” (`ui.tsx:244`, `Mapa.tsx:110`) | „ostrzegawczy” (`Zaslona.tsx:126`) | U30 |
| pomyłka | „Źle!” (Quiz, Dziesiątki), „Pomyłka” (Kubki, Śledzenie), „Pudło” (Wieża), „Falstart!” (Refleks) | każde słowo w swojej rodzinie gier i w `ZASADY-GIER.md`; bez wpisu | - |
| powrót | „Wróć” (`Home.tsx:108`, `Records.tsx:336`) | - (spójne; brak słowa wspólnego w §4) | - |

### 4.10 Wpisy z macierzy

| Wpis | Sytuacja | Gry i `plik:linia` | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| A1 `[zbiorcze: ring-pulse-czas]` (B-36) | „to można wybrać” | dominujące 1,2 s: `Memory.tsx:90`, `Game.tsx:525`; odstające: `chinczyk` `Chinczyk.tsx:219` (1 s) | `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji” | średnia | 1,2 s w Chińczyku i wiersz „pętla wskazania 1,2 s” w tabeli §5; komentarz keyframes bez jednej gry (U20) |
| A2 (L3) | „to można wybrać” | `labirynt` `Labirynt.tsx:143` (`animate-pulse` kropek kroku) | `ZASADY.md` §5 („Najpierw istniejące: `ring-pulse` (to można wybrać)”) | średnia | kropka z obwódką i `ring-pulse` albo nieruchome kropki |
| A3 `[zbiorcze: czekamy-animacja]` (02-05 Z4) | czekamy na rywala | `piec-w-rzedzie` `PiecWRzedzie.tsx:122` (`ap`), `statki` `Statki.tsx:276` (`ap`), `memory` `Memory.tsx:116` (`ag`); Chińczyk, Labirynt, Kampus Tour sam tekst | `ZASADY.md` §5 „Ta sama sytuacja…”, „Mechanizm: keyframes w `index.css` z komentarzem” | średnia | jedna animacja „czekamy” (keyframes z komentarzem i wiersz w §5) albo nieruchoma kropka we wszystkich; Memory jak Gomoku i Statki |
| A4 `[zbiorcze: odslona-animacja]` (W9a) | odsłona prawdziwego wyniku | odstające: `mapa` `Mapa.tsx:177` (`stone-pop`); bez animacji: `Srodek.tsx:171`, `Tort.tsx:160`, `Nozyczki.tsx:145`, `Rok.tsx:180`, `Szacowanie.tsx:141` (`kropki`, `kat`), `Kolor.tsx:166` | `ZASADY.md` §5, D-12 | średnia | jedna decyzja dla wszystkich: `stone-pop` 0,35 s na znaczniku prawdy (to „pojawienie” z tabeli §5) albo bez animacji wszędzie (usunąć z `Mapa.tsx:177`) |
| A5 `[zbiorcze: dotyk-zignorowany]` (W9e, ZS2, W9h) | ruch zignorowany bez kary | dominujące `sh` + tekst + 60: `Srodek.tsx:91`, `:162`, `Nozyczki.tsx:80`, `:142`; odstające: `kolo` `Kolo.tsx:133`, `:217` (sam tekst), `zaslona` `Zaslona.tsx:100` (nic; `ZASADY-GIER.md` :515 odsyła wprost do Środka) | `ZASADY.md` §5 „Ta sama sytuacja…”; tabela wibracji (60 = pomyłka, „ruchu zignorowanego” w tabeli nie ma; komentarz `index.css:337` „to nie kara”) | średnia | jeden wzór „dotknięcie zignorowane”: `shake` 300 ms + tekst we wszystkich czterech; wibracja: albo wiersz „ruch zignorowany: 60” w tabeli §5, albo bez wibracji (wtedy też `ZASADY-GIER.md` Środek, Nożyczki). W Nożyczkach za krótki ruch też wibruje (`MIN_CUT`) |
| A6 `[zbiorcze: pomylka-bez-znaku]`, `[zbiorcze: brak-wibracji-pomylki]` (RF3, SQ2, SQ3, M6, S7) | pomyłka | `refleks` `Refleks.tsx:174-177`, `:215` (falstart bez `warning`, `tm` i 60); `simon` `Simon.tsx:74-76` (bez 60), `:88` (od razu `Scores`, nie widać, które pole było złe); do decyzji: `memory` `Memory.tsx:45-53` (pudło bez 60), `statki` `Statki.tsx:81-89` (pudło strzelającego) | `ZASADY.md` §5 tabela („pomyłka: 60”), „Animacja ma pokazać, co się właśnie stało”; `DESIGN.md` §5 „Błąd ma ikonę i tekst” | średnia | Refleks: `navigator.vibrate?.(60)`, `tm` + `text-warning` przy falstarcie (klucz jak `Stoj.tsx:140`); Sekwencja: 60 i odsłona 1 s przed `finish` (złe pole `tm`, właściwe podświetlone; uwaga F1:SQ1: odsłona nie może opóźnić wysłania wyniku przed limitem); Memory i Statki: decyzja fazy 4, czy pudło w grze turowej to pomyłka (wtedy 60 tylko u odkrywającego / strzelającego) |
| A7 `[zbiorcze: wibracja-zlo-od-gracza]` (S7, KA4, PM14) | zło od innego gracza | `statki` `Statki.tsx:81-89` (trafienie i zatopienie w moją flotę bez wibracji, a broniący nie dostaje też wibracji tury); `kampus-tour` `KampusTour.tsx:448-449` (wykupienie mojego pola, brak `vibrate` w pliku); `panstwa-miasta` `PanstwaMiasta.tsx:66-72`, `:115-121` (STOP innego gracza: bez wibracji i bez `stone-pop`) | `ZASADY.md` §5 tabela („coś złego dla mnie od innego gracza (zbity pionek): [60, 40, 60]”), wzór `Chinczyk.tsx:131-135` | średnia (Kampus Tour i Państwa-miasta do decyzji: tabela podaje tylko przykład zbicia) | `navigator.vibrate?.([60, 40, 60])` raz na zdarzenie u ofiary (ref jak `buzzed` w Chińczyku; w Kampus Tour po `settled`); baner STOP z `stone-pop`; w §5 dopisać przykłady (trafienie floty, wykupienie, STOP) |
| A8 `[zbiorcze: koniec-partii]` (KA6) | koniec partii | `kampus-tour` `KampusTour.tsx:857` (`style={over ? undefined : …}`), `KampusSummary.tsx:43`; wzór `Game.tsx:243-244` | `ZASADY.md` §5 „Ta sama sytuacja…”, §4 (własny nagłówek przejmuje cały zakres) | średnia | kolor zwycięzcy w nagłówku i tytule podsumowania, `title-pop` u zwycięzcy (czas wg decyzji U17) |
| A9 `[zbiorcze: koniec-po-pomylce]` (WP3) | koniec partii po pomyłce | `w-pamieci` `WPamieci.tsx:154-172` (wynik wysyłany dopiero w `:169`), `packages/games/src/w-pamieci.ts:89` (`timeoutMove` = 0 rund); wzór: `Kubki.tsx:68-71`, `Sledzenie.tsx:61-64`, `Wieza.tsx:88-91` (po 1 s same) | `ZASADY.md` §5 „Ta sama sytuacja…”, „Animacja nie blokuje gry” | średnia (ryzyko utraty wyniku: odłożony telefon = 0 rund po 300 s; także do fazy 3) | wysłać wynik od razu przy pomyłce, odsłonę zostawić lokalnie z „Dalej” (U9) albo z samoczynnym przejściem po 2,5 s |
| A10 `[zbiorcze: wibracja-fazy]` (PM13, KL7) | moja tura | `Game.tsx:34-36` (wibracja tylko przy zmianie `myTurn`); `panstwa-miasta` `packages/games/src/panstwa-miasta.ts:143-149` (nowa faza po limicie bez wibracji, gdy gracz był i jest w `waitingFor`); `kalambury` `packages/games/src/kalambury.ts:215` (zgadujący wibrują w połowie rysowania, razem z odsłonięciem litery) | `ZASADY.md` §5 tabela („moja tura: 40”), `ZASADY-GIER.md` §9 (połówki widać tylko po literze) | średnia (KL7 średnia w 02-06, PM13 podniesione z niskiej: ten sam mechanizm) | w `Game.tsx` wibrować przy zmianie klucza `turn().key`, gdy `waitingFor` zawiera mnie; dla Kalamburów liczyć turę zgadującego od wejścia w `draw` i pomijać zmianę samej połówki |
| A11 `[zbiorcze: dalej-kolor]` (PM11) | przejście dalej | „Dalej” w kolorze gracza: `panstwa-miasta` `PanstwaMiasta.tsx:104`, `kalambury` `Kalambury.tsx:139`; w akcencie: `Game.tsx:554` (turniej); `DESIGN.md` §5 wymienia „Dalej” wśród przycisków platformy w akcencie | `DESIGN.md` §5 „Akcent należy do platformy, kolor gracza do partii”; `ZASADY.md` §5 | średnia | kod zostaje; dopisać w `DESIGN.md` §5: „Dalej” między rundami partii to akcja w partii (kolor gracza), między grami turnieju to platforma |
| A12 `[zbiorcze: pasek-rundy-wlasny]` (RK1) | pasek czasu | `rok` `Rok.tsx:166-170` (`fg-muted`, ostrzeżenie od 5 s, przejście 250 ms); wzór: Quiz przez `onRound` i `Countdown` (`MiniGame.tsx:315`, `Game.tsx:48`, `:251`) | `ZASADY.md` §4 „Czego gra nie rysuje sama: pasek czasu w kolorze gracza”, §5; `DESIGN.md` §3.4 | średnia | czas rundy przez `onRound` i `Countdown` (wtedy `ZASADY-GIER.md` „ostatnie 5 s” → 10 s) albo przynajmniej kolor gracza, 10 s i 300 ms |
| A13 `[zbiorcze: sytuacja-trafienie]` (WP4) | trafienie w grze do pomyłki | `w-pamieci` `WPamieci.tsx:127` („Dobrze” w `success` w kaflu); wzór `Kubki.tsx:147`, `Sledzenie.tsx:138` („Dobrze” w `Stats`) | `ZASADY.md` §5, §4 „te same słowa” | niska | jedno miejsce na „Dobrze” (np. `Stats` „Teraz” we wszystkich, Wieża zostaje z werdyktem w polu) |
| A14 (M7) | świeża para | `memory` `Memory.tsx:104` (`stone-pop`); komplet w Kampus Tour i nowy rekord mają `set-glow` (B-35) | `ZASADY.md` §5 „Najpierw istniejące: `set-glow` (świeże osiągnięcie)” | niska | zostawić `stone-pop` i dopisać w §5, że `set-glow` to komplet z wielu pól; albo `set-glow` na obu kartach pary |
| A15 `[zbiorcze: zaznaczenie-gracza]`, `[zbiorcze: zaznaczenie-bez-przejscia]` (DZ1, DZ2) | zaznaczenie pola w grze na czas | `dziesiatki` `Dziesiatki.tsx:143` (ramka 1 px + tło 25%, bez `aria-pressed`); bez przejścia: `Dziesiatki.tsx:143`, `sudoku` `Sudoku.tsx:156`, `zakupy` `Zakupy.tsx:165` | `DESIGN.md` §4 (kafel zaznaczony, `aria-pressed`), §5 (kolor nie jedynym sygnałem); `ZASADY.md` §5 („zmiany stanu przez `transition-colors`”) | niska | jeden wzór: pierścień 2 px w kolorze gracza + `aria-pressed`; przejście 100 ms albo zdanie w §5, że zaznaczenie w polu gry na czas nie ma przejścia (jak bodziec) |
| A16 (KT21) | pojawienie okna | `kampus-tour` `KampusTour.tsx:649-652` (okienko pola bez `card-in`, pozostałe okna `:987`, `:1033`, `:1073` z `card-in`) | `ZASADY.md` §5 „Ta sama sytuacja…”, tabela („pojawienie się karty 350 ms”) | niska | `card-in` 0,35 s albo zdanie w §5, że okno otwierane dotknięciem pojawia się od razu |
| A17 (nowy, z macierzy) | „Gotowe” w trzech rolach | `statki` `Statki.tsx:324-335` (gotowość rozstawienia), `panstwa-miasta` `PanstwaMiasta.tsx:202` (oddanie kartki), `zakupy` `Zakupy.tsx:175` (zatwierdzenie zaznaczeń; nazwane w `KONCEPT.md` §2.4) | `ZASADY.md` §4 „te same słowa co w innych grach” (to samo słowo w tej samej roli) | niska | decyzja fazy 4: „Gotowe” tylko jako gotowość (Statki, jak „Zgłaszam gotowość” w lobby), w Zakupach „Zatwierdź” (z poprawką `KONCEPT.md` §2.4), w Państwach-miastach „Oddaj” albo zostawić z dopiskiem w §4 |

## 5. Wpisy zbiorcze

Format: reguła, waga, lista miejsc z `plik:linia` (identyfikator wpisu częściowego w nawiasie), propozycja. Sekcje gier (§8) odsyłają tu.

### 5.0 Ujednolicenia przy scalaniu i styk z fazą 1

- Klucze robocze z planów scalone: `kolor-jedyny-sygnal` = `kolor-gracza-jedyny-sygnal` (U6), `float-up-reduced` = `float-up-reduced-motion` (U27), `wlasna-tabela-wynikow` = `wlasna-lista-wynikow` (U10),
  `tabela-rund-wlasna` = `wlasna-tabela-rund` (U11), `zignorowany-ruch` = `dotyk-zignorowany` (A5), `aria-label`, `aria-label-span`, `aria-plansza` i `aria-hidden` (U23), `naglowek-wlasny` rozdzielony na U8 (PM8) i U7 (PM9),
  `myslnik` i `brak-wartosci` (U33), `stale-piksele` i `siatka-1fr` (U34), `jednostka-odchylki` w U30.
- Duble między planami: GM-2 (02-03) = KT12 (02-04), jeden wpis w U8; GM-4 (02-03) = M5 (02-05), jeden wpis w U12.
- Wagi ujednolicone: 360×640 według ekranu (ekran partii wysoka U1, ekran podsumowania z `StickyBar` średnia U3, listy poza partią niska HM-8); ZK4 z niskiej na średnią (kolor jako jedyny sygnał, D-07);
  PM8 z niskiej na średnią (pasek tury bez koloru gracza, jak GM-2); PM9 z niskiej na średnią (token `success` w cudzej roli, D-04); PM13 z niskiej na średnią (A10); PM14 z niskiej na średnią (A7);
  SQ1 i SJ1 (`accent-fg`) zostają niskie mimo D-04, bo wartość tokenu jest identyczna i wizualnie nic się nie zmienia (U29); BL4 (en-dash) niska zamiast średniej z CHECKS (to nie em-dash, znaczenie objaśnione).
- Dopisane w 02-11: WP5 (W pamięci: ten sam układ kafla z polem co SZ1, `WPamieci.tsx:126`, `:135-151`) do U1; A17 („Gotowe” w trzech rolach) z macierzy; `MiniGame.tsx` sprawdzony (§8.1).
- Styk z fazą 1 (bez dubli: każdy wpis fazy 2 dotyczy innej reguły; tu, co poprawiać razem):
  - F1:ZK1 (limit Zakupów 60 s, `Zakupy.tsx:68-72`) i F2:ZK1 (`onClick` w pomiarze, `Zakupy.tsx:175`): ta sama funkcja `done`.
  - F1:SQ1 (limit Sekwencji 300 s, `Simon.tsx:61-79`) i A6 (Sekwencja bez odsłony pomyłki): odsłona przed `finish` nie może opóźniać wysłania wyniku.
  - F1:Z13 (miejsca w `Quiz.tsx:73` z zaokrąglonej średniej) i F1:Z15 (czasy w `Quiz.tsx:187-188`) a U10 (`Results` jako drugi wzorzec): przy przenoszeniu `Results` do `ui.tsx` brać miejsca z `places`.
  - F1:W2 (Kalambury: ranking dwa razy, `Kalambury.tsx:127-135`) a U3 (KL2, wysokość odsłony): usunięcie zdublowanego rankingu skraca ekran.
  - F1:Z16 (kafel ekranu końcowego Stopera i Rytmu ze stanu lokalnego): ekranów końcowych z samego stanu faza 2 nie ocenia od nowa (odsyłacz w §8).
  - Uwaga 02-06 o numeracji miejsc w tabeli turnieju (`Game.tsx:432`, `i + 1` przy równej sumie) to temat F1:Z18 (`remis-kolejnosc-miejsc`): tylko odsyłacz, bez wpisu fazy 2.
  - Do fazy 3 (balans, nie wygląd): U2 (czas marszu w Kampus Tour, C8 w trybie Szybkim), A9 (W pamięci: 0 rund po limicie), U28 (dokładność pomiaru w Refleksie i Stój!), SC1 w U31 (kary całkowite czy ułamkowe).

### U3. Ekran podsumowania wyższy niż 640 px `[zbiorcze: wysokosc-640]` (podsumowanie)
- Źródło: `ZASADY.md` §4 (360×640; „przy długiej treści `StickyBar`”), `DESIGN.md` §2 (akcje przy dolnej krawędzi). Waga: **średnia** (treść do przejrzenia, ale akcja musi być pod kciukiem).

| Ekran | Miejsce | Wysokość | Wpis |
|---|---|---|---|
| ekran po partii (każda gra przez `Game.tsx`, najdłuższy po mini-grze z `RecordPanel`) | `Game.tsx:455-459` (`OverActions` w zwykłym `div` z `mt-auto`) | 850-1000 px, solo ok. 880; „Rewanż” pod zgięciem | GM-1 |
| `kalambury`, odsłona rundy | `Kalambury.tsx:105-145` | ok. 900 px; „Dalej” w `StickyBar` (zgodne) | KL2 |
| `panstwa-miasta`, podsumowanie rundy | `PanstwaMiasta.tsx:90-108` | ok. 1000 px; „Dalej” w `StickyBar` (zgodne) | PM1 (część) |

- Propozycja: `OverActions` w `StickyBar` (to samo rozwiązuje `NextActions` turnieju, `Game.tsx:540-566`); w Kalamburach mniejsze płótno w odsłonie albo punkty rundy w `Scores` (razem z F1:W2).

### U4. Pola dotykowe poniżej 48 px `[zbiorcze: dotyk-48]`
- Źródło: `ZASADY.md` §4 Reguły („Pola dotykowe co najmniej 48 px”), `AGENTS.md`. Wyjątek `DESIGN.md` §6 obejmuje tylko przyciski budowy 44 px w Kampus Tour (z „Pomiń” w tym rzędzie, §6). Waga: **średnia**.

| Gra / ekran | Miejsce | Rozmiar | Uwaga | Wpis |
|---|---|---|---|---|
| platforma (`kolor`, `rok`) | `index.css:145-152` (`Kolor.tsx:197`, `Rok.tsx:187`) | tor 36 px, uchwyt 40 / 34 px | w Który rok? przyciski −1 / +1 48 px | B-31 |
| `Lobby.tsx` | `Lobby.tsx:435` | „Wyjdź” ok. 36 px | CHECKS §4 go nie złapał (brak klasy rozmiaru) | LB-1 |
| `Lobby.tsx` | `Lobby.tsx:392` (CHECKS §4 `:385`) | próbki koloru 40 px | 6 × 48 = 288 px przy 286 px wnętrza kafla | LB-2 |
| `Lobby.tsx`, `Setup.tsx` | `Lobby.tsx:158` | wiersz gracza 44 px | przycisk u gospodarza | LB-3 |
| `kampus-tour` | `KampusTour.tsx:796-801`, `:774` | pola planszy ok. 35 px | jedyna droga wyboru pola przy sprzedaży, Juwenaliach, MPK | KT4 |
| `kampus-tour` | `KampusTour.tsx:659-661` | „Zamknij” ok. 21 px na ekranie | | KT5 |
| `kampus-tour` | `KampusTour.tsx:970` | „Podsumowanie” 44 px poza wyjątkiem | | KT6 |
| `piec-w-rzedzie` | `PiecWRzedzie.tsx:58-66` | ok. 22 px | podgląd + potwierdzenie „Postaw” | G2 |
| `statki` | `Statki.tsx:510-530` | 24-37 px | strzał z potwierdzeniem; rozstawianie cofalne | S2 |
| `chinczyk` | `Chinczyk.tsx:236-246` | ok. 25 px | podgląd celu i drugie dotknięcie | C2 |
| `labirynt` | `Labirynt.tsx:101-107` | 36 px (9×9), 45 px (7×7) | krok bez potwierdzenia | L2 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:319` (CHECKS §4 `:312`) | komórka głosowania 44 px | | PM3 |
| `tort` | `Tort.tsx:19` (`GRAB` 10°), `:86` | strefa ok. 37 px na brzegu, mniej przy środku | uchwyt rysowany ok. 5 px | TO1 |
| `sledzenie` | `Sledzenie.tsx:94-101`, `packages/games/src/sledzenie.ts:9`, `:25` | 43-46 px między bliskimi kulkami | tylko przy najbliższym ułożeniu (`GAP` 0,14) | SL2 |

- Propozycja: `min-h-12` / `size-12` w Lobby, „Zamknij” i „Podsumowanie” Kampus Tour, komórka głosowania; suwak: tor 48 px albo przezroczysty obszar dotyku 48 px; Tort: strefa łapania w px od palca (promień 24 px);
  Śledzenie: `GAP` ≥ 0,15 (zmiana zasad gry, najpierw test i `ZASADY-GIER.md`) albo wyjątek; Labirynt: przy puszczeniu palca najbliższe dozwolone pole w promieniu 24 px.
  Gęste plansze z podglądem i potwierdzeniem (G2, S2, C2, KT4): decyzja fazy 4, czy dopisać wyjątek do `DESIGN.md` §6 („pole poniżej 48 px, gdy ruch ma podgląd i potwierdzenie”).

### U5. Kolory spoza tokenów `[zbiorcze: kolor-spoza-tokenow]`
- Źródło: `ZASADY.md` §4 („kolory tylko z tokenów”), `DESIGN.md` §2, `AGENTS.md`; D-04 (kolor treści gry jest odstępstwem tylko z listy `DESIGN.md` §6). Waga: **średnia**.

| Gra / ekran | Miejsce | Kolor | Wpis |
|---|---|---|---|
| platforma (`kolor`, `rok`) | `index.css:158-159`, `:166-167` | uchwyt suwaka `#fff` / `#000` | B-32 |
| `kampus-tour` | `KampusTour.tsx:125` (`#ffb224`), `:128` (`#ff6369` = `warning`), `:134` (`#e879f9`), `:140` (`#3dd68c` = `success`); użycia `:747`, `:749`, `:820` | kolory rogów planszy; `success` w roli Biletu MPK | KT2 |
| `kampus-tour` | `KampusTour.tsx:519`, `:1007` | `border-white`, `borderColor: "white"` | KT3 |
| `piec-w-rzedzie` | `PiecWRzedzie.tsx:71` | `color-mix(..., white)` (CHECKS §1 go nie złapał) | G3 (kolor) |
| `kolo` | `Kolo.tsx:71` | `hsl(140→0 80% 55%)` oceny odcinków | KO2 |

- Propozycja: `var(--color-fg)` / `var(--color-bg)` zamiast bieli i czerni (B-32, KT3, G3); w Kampus Tour `var(--color-warning)` dla Kolokwium, reszta rogów jako kolor treści z jednym źródłem (`CORNERS`) po rozszerzeniu
  `DESIGN.md` §6 do „pola planszy Kampus Tour (grupy i rogi)”; w Kole `color-mix` `success` / `warning` albo trzy stopnie z `grade`, albo wpis w `DESIGN.md` §6; uchwyt suwaka dopisać do §6.

### U6. Kolor jako jedyny sygnał `[zbiorcze: kolor-jedyny-sygnal]`
- Źródło: `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem” (`DESIGN.md` §4 przy stanach). Waga: **średnia**.

| Gra / ekran | Miejsce | Co rozpoznaje się tylko kolorem | Wpis |
|---|---|---|---|
| `piec-w-rzedzie` | `PiecWRzedzie.tsx:68-73`, `aria-label` bez właściciela `:62` | kamienie graczy | G4 (02-05 Z2) |
| `chinczyk` | `Chinczyk.tsx:217-222`, `:248` | pionki na torze | C4 |
| `labirynt` | `Labirynt.tsx:166-170`, `:132` | pionki rywali przy 3-4 osobach | L4 |
| `memory` | `Memory.tsx:92-99`, `:74` | czyje są zebrane pary | M4 |
| `kampus-tour` | `KampusTour.tsx:793`, `:837` | właściciel pola na planszy | KT9 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:187`, `index.css:140` | zła litera: sama czerwona ramka, bez ikony i tekstu | PM6 |
| `sledzenie` | `Sledzenie.tsx:151`, `:158`, `:164` | cele i zaznaczone kulki (żółty gracz na `fg`: kontrast ok. 1,3:1) | SL1 |
| `Setup.tsx` | `Setup.tsx:48-49` | wybrany tryb | SU-1 |
| `zakupy` | `Zakupy.tsx:100-106` | kto zaznaczył przedmiot (kropka 6 px) | ZK4 (podniesione z niskiej) |

- Propozycja: drugi znak (inicjał z `initials` na pionku / kamieniu / kropce jak w `GameDots`, ikona postaci właściciela na pasku pola Kampus Tour, obrys celu w Śledzeniu, `Check` przy wybranym trybie,
  ikona `X` / `Warning` przy złej literze) i nick w `aria-label`; dla pionków i kamieni do decyzji świadomy wyjątek w `DESIGN.md` §6 („gracze wybierają różne kolory”), ale nick w `aria-label` w każdym wariancie.

### U7. Token w cudzej roli `[zbiorcze: rola-tokenu]`
- Źródło: `DESIGN.md` §2 (role tokenów), §5 „Kolor znaczy”; D-04. Waga: **średnia**.

| Gra / ekran | Miejsce | Token i rola | Wpis |
|---|---|---|---|
| `statki` | `Statki.tsx:294`, `:266`, `:269`, `:174`, tekst `:299` | `accent` jako „niedozwolone” (strefa zakazana, duch); wyjątek §6 obejmuje tylko trafienie i zatopienie | S3 |
| `chinczyk` | `Chinczyk.tsx:233`, `:195` | `warning` jako cel zbicia (dla ruszającego to nie problem, pionek jest „czyjś”) | C3 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:306`, `:320` | `accent-soft` jako „odrzucone” obok ikony `X` w `warning` | PM4 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:31` | `line-hover` na nieinteraktywnym kaflu litery | PM5 |
| `panstwa-miasta` | `PanstwaMiasta.tsx:57` | `success` jako „skończył krok”, w Kalamburach ta sama fajka = „trafił” | PM9 (podniesione z niskiej) |
| `Records.tsx` | `Records.tsx:351`, `:355` | `warning` dla liczby gier „Do pobicia” | RC-1 |

- Propozycja: Statki: strefa i duch w `warning` (tło 12%), tekst bez nazwy koloru; Chińczyk: obrys w kolorze ofiary albo rola `warning` „ostrzeżenie przed skutkiem ruchu” w `DESIGN.md` §2;
  Państwa-miasta: bez tła odrzuconej (przekreślenie i 0 wystarczą), ikona zaznaczenia w jednym kolorze, `border-line` litery, fajka gotowości w `fg` albo znaczek w kropce jak `PlayerDots`; „Rekordy”: liczba w `fg`.

### U8. Pasek limitu i tytuł tury bez koloru gracza `[zbiorcze: pasek-tury-kolor-gracza]`
- Źródło: `ZASADY.md` §4 „Czego gra nie rysuje sama” (pasek czasu w kolorze gracza z ruchem), „Własny nagłówek … przejmuje cały jego zakres”; `DESIGN.md` §3.4. Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `kampus-tour` | `Game.tsx:93` (`<Countdown … />` bez `color`) → `Game.tsx:596-597` (`bg-fg-muted`) | pasek limitu `fg-muted` | GM-2 = KT12 |
| `panstwa-miasta` | `Game.tsx:384` (`tense`, bez `color`), `PanstwaMiasta.tsx:40-41` | pasek `bg-fg`, tytuł fazy bez koloru, gdy czekamy na mnie; brak kreski „to ja” (Kalambury mają, `Kalambury.tsx:74`) | PM8 (podniesione z niskiej) |

- Propozycja: `color={turnColor}` w `Game.tsx:93` (już wyliczony); w Państwach-miastach `color` paska i tytułu z koloru gracza, gdy `waitingFor` zawiera mnie, i kreska pod własną kropką.

### U9. Inne słowo w roli słowa wspólnego `[zbiorcze: slowa]`
- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach („Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”)”. Waga: **średnia**.

| Gra | Miejsce | Słowo | Zamiast | Wpis |
|---|---|---|---|---|
| `kampus-tour` | `KampusTour.tsx:1044`, `:1097` | „OK” | „Dalej” | KT15 |
| `kampus-tour` | `KampusTour.tsx:406`, `:408`, `:409` | „Koniec gry”, „Twoja tura”, „Tura: …” | „Remis” / „Koniec”, „Twój ruch”, „Ruch: …” (`Game.tsx:186-205`) | KT13 |
| `kolor`, `kropki`, `kat` | `Kolor.tsx:178`, `Szacowanie.tsx:183` | „Następny kolor”, „Następna runda”, „Wyniki” | „Dalej” | W9b |
| `w-pamieci` | `WPamieci.tsx:170` | „Wyniki” | „Dalej” | WP2 |
| `kolo` | `Kolo.tsx:139` | „Nowy rekord!” po lepszej próbie w partii | słowo rekordu wszech czasów; tu „Najlepsza próba!” | KO3 |

- Propozycja: „Dalej” we wszystkich przejściach (albo dopisać „Wyniki” do zestawu w `ZASADY.md` §4, jeśli zostaje w dwóch grach); w §4 zapisać, kiedy odsłona czeka na przycisk (Odcień, Szacowanie);
  słowa wspólnego nagłówka w Kampus Tour; „Najlepsza próba!” w Kole.

### U10. Własna lista wyników zamiast `Scores` `[zbiorcze: wlasna-lista-wynikow]`
- Źródło: `ZASADY.md` §4 „Z czego gra się składa” („Wyniki mini-gry: komponent `Scores`, wiersz na gracza”), W-04. Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `stoj` | `Quiz.tsx:47-138` (`Results`) | tabela: wynik, średni czas, błędy; zachowuje „gra…”, „(ty)” i kolejność | QZ1 |
| `refleks` | `Refleks.tsx:23-121` | tabela (średnia, kary, najlepszy) i wykres; bez „(ty)” | RF1 |

- Propozycja: uznać `Results` za drugi wspólny wzorzec (`ScoreTable` w `ui.tsx`, wpis w `ZASADY.md` §4 obok `Scores`; uwzględnić F1:Z13), Refleks na ten sam wzorzec z wykresem jako szczegółem i z „(ty)”.

### U11. Własna tabela rund zamiast `RoundTable` `[zbiorcze: wlasna-tabela-rund]`
- Źródło: `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”, W-07. `ZASADY-GIER.md` opisuje każdy z tych układów, więc to sprzeczność dokumentów (D-13: wygrywa `ZASADY.md` / `DESIGN.md`). Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `przytrzymaj` | `Przytrzymaj.tsx:112-176` | siatka celów i odchyłek ze znakiem, suma w wierszu gracza (`ZASADY-GIER.md` :408) | PT1 |
| `balon` | `Balon.tsx:72-119` | wytrzymałość balonów i stuknięcia (`ZASADY-GIER.md` :426) | BL1 |
| `kropki`, `kat` | `Szacowanie.tsx:32-49` (`Answers`) | „było / wpisane” w 5 kolumnach | W9f |
| `rok` | `Rok.tsx:115-135` | lista wydarzeń z rokiem i odpowiedziami | W9f |
| `kolor` | `Kolor.tsx:40-55` (`Pairs`) | pary próbek z % zgodności | W9f |

- Propozycja: `RoundTable` z opcjonalnym wierszem celów i znakiem odchyłki (`format(error, raw)`), z `children` na prawdziwe wartości (wzór: lista miast `Mapa.tsx:112-118`) i z własną klasą komórki dla Balonu;
  Odcień jako wyjątek w `DESIGN.md` §6 (kolory to treść); przy każdej zmianie poprawić też `ZASADY-GIER.md`.

### U12. Liczby bez Geist Mono albo bez `tabular-nums` `[zbiorcze: liczby-mono]`
- Źródło: `ZASADY.md` §4 („Liczby, czasy i kody czcionką mono z `tabular-nums`”), `DESIGN.md` §5 „Liczby są mono”, W-16. Waga: **niska**.

| Gra / ekran | Miejsce | Wpis |
|---|---|---|
| platforma (`Intro`) | `ui.tsx:319`, `:321` | B-73 |
| `memory` (pigułka w `Game.tsx`) | `Game.tsx:287` | GM-4 = M5 |
| `Home.tsx` | `Home.tsx:151-156`, `:332`, `:334` | HM-4 |
| `Lobby.tsx` | `Lobby.tsx:207` | LB-7 |
| `Records.tsx` | `Records.tsx:354-355`, `:156` | RC-4 |
| `kampus-tour` | `KampusTour.tsx:151` (`zl` bez `tabular-nums`), `:901-903`, `:503`, `:949`, `:1092`, `:963` | KT16 |
| `kampus-tour` (podsumowanie) | `KampusSummary.tsx:51`, `:59`, `:67`, `:199` | KS4 |
| `chinczyk` | `Chinczyk.tsx:273`, `:177`, `:289` | C6 |
| `labirynt` | `Labirynt.tsx:201` | L6 |
| `refleks` | `Refleks.tsx:215`, `:98-100` | RF2 |
| `stoper` | `Stoper.tsx:78`, `:79`, `:116`, `:117`, `:25` | SP1 |
| `rytm` | `Rytm.tsx:115`, `:116`, `:160` | RY1 |
| `przytrzymaj` | `Przytrzymaj.tsx:220`, `:221`, `:222` | PT2 |
| `liczenie` | `Liczenie.tsx:20`, `:24`, `:25` (mono bez `tabular-nums`) | LI1 |
| `kropki`, `kat` | `Szacowanie.tsx:37` (mono bez `tabular-nums`) | SZ3 |
| `turniej` | `Setup.tsx:211`, `:210`, `:213` | TU7 |

- Propozycja: `font-mono tabular-nums` na liczbach (wzór `Stats`, B-65; `Stoj.tsx:156`, `Zaslona.tsx:191`); decyzja fazy 4, czy reguła obejmuje liczby w zdaniach (log Kampus Tour, linia wyzwania dnia).

### U13. Podpis bloku poza `.label` `[zbiorcze: podpis-label]`
- Źródło: `DESIGN.md` §5 „Podpis to `.label` … nigdy pogrubiony Satoshi” (wyjątek: grupy w jednej liście), W-17. Waga: **niska**.
- Miejsca: `Lobby.tsx:379` („Twój kolor”, LB-5); `Records.tsx:354-355` (etykiety liczb podsumowania, RC-4); `KampusTour.tsx:1037`, `:1077`, `:668` (KT17); `KampusSummary.tsx:49`, `:57`, `:65` (KS5);
  `Statki.tsx:473` (podpisy plansz, S5); `Balon.tsx:87` („Balon wytrzymywał”, BL2); `Zakupy.tsx:92` („Lista zakupów”, ZK3).
- Propozycja: `.label` (na kolorze: `text-bg` zamiast `fg-muted`; kolor właściciela przez `style` zostaje).

### U14. Waga ikony w małej akcji `[zbiorcze: waga-ikon]`
- Źródło: `DESIGN.md` §2 („`bold` w małych akcjach (16-18 px)”), W-15. Waga: **niska**.
- Miejsca: `ui.tsx:41` (`TopBar`, B-57); `Game.tsx:227` (GM-7); `Home.tsx:107`, `:196` (HM-6); `Lobby.tsx:436` (LB-6); `MiniGames.tsx:109` (MG-2); `Records.tsx:335`, `:275` (RC-5);
  `KampusTour.tsx:660` (KT19); `Kalambury.tsx:287`, `:291` (KL6).
- Propozycja: `weight="bold"`.

### U15. Przejście z domyślnym czasem Tailwinda 150 ms `[zbiorcze: transition-domyslny]`
- Źródło: `ZASADY.md` §5 tabela („przycisk, przejście stanu 180 ms”, „reakcja na dotyk 100 ms”). Waga: **niska**.
- Miejsca: `ui.tsx:64`, `:114` (B-62); `Game.tsx:266` (GM-10); `Lobby.tsx:158`, `:255` (LB-9: tło zaznaczonego kafla przeskakuje); `Setup.tsx:48`, `MiniGames.tsx:57` (SU-4); `Records.tsx:268` (RC-8);
  `KampusTour.tsx:801` (KT20); `Kalambury.tsx:277` (KL3); `Setup.tsx:156`, `:184` (TU3); `Kubki.tsx:173` (KB1).
- Propozycja: `duration-180` (`transition-colors` tam, gdzie zmienia się też tło), w palecie Kalamburów `duration-100`; albo uznać 150 ms w tabeli §5.

### U16. Animacje Tailwinda spoza `index.css` `[zbiorcze: animate-tailwind]`
- Źródło: `ZASADY.md` §5 „Mechanizm: keyframes w `index.css` z komentarzem”; `DESIGN.md` §1 („ekran nie świeci, nie miga”). Waga: **niska** (reguła reduced motion je obejmuje).
- Miejsca (B-50): `animate-pulse` w `PiecWRzedzie.tsx:78`, `:122`, `Statki.tsx:276`, `Labirynt.tsx:143`, `Game.tsx:596` (ostatnie 10 s limitu, GM-8), `Lobby.tsx:68`, `:69` (szkielety ładowania, LB-8);
  `animate-ping` w `Memory.tsx:116`. Gdzie to ta sama sytuacja inaczej: A2, A3.
- Propozycja: pasek limitu sam kolorem `warning`; ładowanie słowem z wielokropkiem (U26); albo nazwać pulsowanie w `index.css` z komentarzem i rolą w §5 („czekamy na coś”).

### U17. Keyframes spoza listy §5 `[zbiorcze: keyframes-poza-5]`
- Źródło: `ZASADY.md` §5 „Najpierw istniejące” i tabela czasów; D-06. Waga: **niska**.
- Keyframes (B-38, B-41, B-45..B-48): `line-draw` (`index.css:225`; `PiecWRzedzie.tsx:100` 0,5 s, `Kolo.tsx:166` podgląd), `title-pop` (`index.css:258`; `Game.tsx:243` 0,5 s `cubic-bezier(0.2,0.8,0.4,1)`),
  `tile-hit` / `tile-miss` (`index.css:303`, `:310`; 0,35 s w Quiz, Dziesiątkach, Sudoku, Schultem, Wieży, Stój!), `piece-fall` (`index.css:330`; `Wieza.tsx:142` 0,5 s), `shake` (`index.css:338`; `Srodek.tsx:162`, `Nozyczki.tsx:142` 0,3 s).
- Propozycja: dopisać do listy §5 z rolą i czasem (§7); `title-pop` albo z czasem 0,5 s w tabeli, albo 350 ms `ease-out`.

### U18. Animacja bez kategorii w tabeli czasów §5 `[zbiorcze: brak-w-tabeli-5]`
- Źródło: `ZASADY.md` §5 „Czasy”, D-06. Waga: **niska**.

| Miejsce | Animacja | Wpis |
|---|---|---|
| `index.css:194` (`KampusTour.tsx:803`, `Records.tsx:144`) | `set-glow` 0,9 s × 4 („świeże osiągnięcie”) | B-35 |
| `Game.tsx:596`, `:486` | szerokość paska limitu 300 ms `linear`, paska postępu 200 ms | GM-9 |
| `Rytm.tsx:148` | pasek 10 s jako przejście CSS; przy reduced motion od razu pełny | RY2 |
| `Zakupy.tsx:133-134` | pasek pokazu listy, inline `transition` 10 s; przy reduced motion od razu pusty; tor `bg-surface` zamiast `bg-line` | ZK2 |
| `Kubki.tsx:81-104` | zamiana kubków 500→150 ms (ruch będący treścią) | KB2 |
| `Sledzenie.tsx:72-88` | ruch kulek 5 s (ruch będący treścią); w pliku brak komentarza o reduced motion | SL3 |
| `Wieza.tsx:74-84` | jazda klocka (ruch będący treścią); brak komentarza o reduced motion | WZ5 |

- Propozycja: wiersze tabeli §5 (§7): „świeże osiągnięcie 0,9 s × 4”, „pasek czasu i postępu: przejście szerokości równe krokowi odświeżania, `linear`”, „ruch będący treścią gry: czas z `ZASADY-GIER.md`”;
  paski 10 s (Rytm, Zakupy) liczone z czasu (`setInterval` / `requestAnimationFrame` jak `Countdown`), żeby działały też przy reduced motion; komentarz o reduced motion w Śledzeniu i Wieży jak `Kubki.tsx:77-78`.

### U19. Czas pojawienia inny niż 350 ms `[zbiorcze: czas-pojawienia]`
- Źródło: `ZASADY.md` §5 tabela („pojawienie się elementu 350 ms, `ease-out`”). Waga: **niska**.
- Miejsca: `ui.tsx:125` (odznaka wygranych `stone-pop` 0,5 s, B-63), `Game.tsx:306` (liczba wygranych 0,5 s, B-37), `WPamieci.tsx:130` (180 ms, WP1: krótszy ma sens przy pokazie 1,5 s, ale bez opisu).
- Propozycja: 0,35 s w `ui.tsx` i `Game.tsx`; dla W pamięci wiersz „pojawienie w pokazie na czas: 180 ms” w tabeli §5 i komentarz w kodzie.

### U20. Komentarz w `index.css` węższy niż użycie `[zbiorcze: komentarz-nieaktualny]`
- Źródło: `ZASADY.md` §5 „Mechanizm” (komentarz mówi, do czego służy). Waga: **niska**.
- Miejsca: `index.css:31`, `:33` (role `warning` i `success`, B-17), `:144` (`.swatch-range`: dawna nazwa „Kolor z pamięci”, bez Który rok?, B-33), `:193`, `:204`, `:216`, `:265`, `:287`, `:302`
  (`set-glow`, `ring-pulse`, `stone-pop`, `dice-tumble`, `float-up`, `tile-hit` wymieniają jedną grę, B-35..B-45).
- Propozycja: komentarze jak kolumna „Rola” w `DESIGN.md` §2 i rola keyframes z listy §5.

### U21. Cień poza miejscami z `DESIGN.md` §2 `[zbiorcze: cien]`
- Źródło: `DESIGN.md` §2 („Cień mają tylko … okna i pionki w Kampus Tour oraz `set-glow`”). Waga: **niska**.
- Miejsca: `index.css:157`, `:165` (uchwyt suwaka, B-32); `KampusTour.tsx:203`, `:733`, `:756`, `:779`, `:794`, `:832` (plansza 2.5D, poświaty, `drop-shadow`, KT7); `PiecWRzedzie.tsx:72` (cień kamienia i poświata zwycięskiej linii, G3);
  `Statki.tsx:44` (poświata zaznaczonego statku, S4); `Memory.tsx:98` (poświata karty, M2).
- Propozycja: rozszerzyć wyjątek Kampus Tour w `DESIGN.md` §6 (plansza 2.5D, poświata gracza na turze); w Gomoku cień kamienia dopisać obok pionków albo usunąć, poświatę linii zastąpić `set-glow`; w Statkach i Memory sam obrys.

### U22. Zaokrąglenie spoza 20 / 10 / 999 px `[zbiorcze: promien]`
- Źródło: `DESIGN.md` §2 „Zaokrąglenia”, `ZASADY.md` §4. Waga: **niska**.
- Miejsca: `index.css:157`, `:165` (6 px uchwytu, B-32); `ui.tsx:125` (odznaka turnieju 4 px, B-61); `KampusTour.tsx:162`, `:575`, `:586`, `:801`, `:819` (KT8); `Statki.tsx:165` (1 px, S4); `Chinczyk.tsx:307` (6 px, C5);
  `Obrot.tsx:26` (`rx` klocków, treść gry, OB1); `Wieza.tsx:29-31` (`rounded-sm` w podglądzie, w grze klocki prostokątne, WZ3).
- Propozycja: dopisać do `DESIGN.md` §2 / §6 „4 px: odznaka turnieju i pola planszy Kampus Tour” oraz figury Obrotu jako treść gry; Chińczyk `rounded-inset`; Wieża bez `rounded-sm`; segmenty floty `rounded-none`.

### U23. Dostępność: `aria-hidden`, `aria-label`, role `[zbiorcze: aria]`
- Źródło: `ZASADY.md` §4 („Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`”), W-15. Waga: **niska**.

| Gra / ekran | Miejsce | Co | Wpis |
|---|---|---|---|
| platforma | `ui.tsx:327` | kropka koloru w liście „już gra” bez `aria-hidden` | B-74 |
| `Game.tsx` | `Game.tsx:276`, `:287`, `:300`, `:321` | `aria-label` na `span` bez roli (czytniki pomijają) | GM-5 |
| `Game.tsx` | `Game.tsx:594` | `progressbar` bez `aria-valuemin` / `aria-valuemax` | GM-6 |
| `kampus-tour` | `KampusTour.tsx:660`, `:285`, `:819-821` | ikona `X` bez `aria-hidden`; `aria-label` kostek i Juwenaliów na `span` | KT18 |
| `kalambury` | `Kalambury.tsx:153-158` | płótno bez `role="img"` i bez `aria-hidden` | KL5 |
| `zaslona` | `Zaslona.tsx:162-167`, `:200-203` | od 2. rundy pole bez tekstu i `aria-label` | ZS1 |
| `balon` | `Balon.tsx:146` | pole pompowania to `div` z `onPointerDown`, bez roli i fokusu | BL3 |
| `inny` | `Inny.tsx:21`, `:50` (`Quiz.tsx:248-259`) | komórki siatki bez nazwy | IN1 |
| `sudoku` | `Sudoku.tsx:150-160` | puste pola bez `aria-label`, wybrane bez `aria-pressed` | SU3 |
| `statki` | `Statki.tsx:523`, `:532`, `:397` | pola bez stanu strzału, własna plansza jako `span` z `aria-label` | S6 |
| `labirynt` | `Labirynt.tsx:132-133` | plansza jeden `role="img"`, krok tylko wskaźnikiem | L5 |

- Propozycja: `aria-hidden` na ozdobach; `role="img"` przy `aria-label` na `span` albo tekst `sr-only`; `aria-valuemin={0} aria-valuemax={total}`; `aria-label` z pozycją / stanem pola; Balon jako `<button aria-label="Pompuj balon">`.

### U24. Rozłączony gracz `[zbiorcze: stan-rozlaczony]`
- Źródło: `DESIGN.md` §4 „gracz rozłączony” (w partii przerywany obrys, krycie 40% kropki), `ZASADY.md` §4. Waga: **niska**.
- Miejsca: `Game.tsx:264-328` (pigułki gier głównych nie pokazują rozłączenia, `p.connected` nieużyte, GM-3); `Lobby.tsx:143`, `:158` (cały wiersz `opacity-50`, LB-4).
- Propozycja: przerywany obrys i `opacity-40` pigułki z „rozłączony” w `aria-label` (jak `GameDots`); w lobby krycie tylko kropki.

### U25. Krycie stanu spoza tabeli `DESIGN.md` §4 `[zbiorcze: stan-krycie]`
- Źródło: `DESIGN.md` §4 (przygaszony 60%, nieaktywny 40%, „Każdy stan, który coś blokuje, tłumaczy się podpisem”). Waga: **niska**.
- Miejsca: `PanstwaMiasta.tsx:321` (własne odpowiedzi 50% bez podpisu, PM7); `Setup.tsx:195-200` (stan „bez” bez słowa, „na pewno” ze słowem, TU4); `Memory.tsx:81-83` (rewers 45%, M3);
  `Setup.tsx:47`, `:49` (tryby u gościa 50% bez podpisu „Tryb wybiera gospodarz”, SU-2).
- Propozycja: 40% dla nieaktywnego, 60% dla przygaszonego, krótki podpis przy stanie.

### U26. Stan ładowania niezgodny z `DESIGN.md` §4 `[zbiorcze: stan-ladowania]`
- Źródło: `DESIGN.md` §4 „ładowanie” (czasownik z wielokropkiem, bez spinnera, wszystkie akcje nieaktywne), „stan pusty tylko, gdy naprawdę pusto”. Waga: **niska**.
- Miejsca: `Home.tsx:99`, `:111`, `:160-163` (start solo bez słowa; „Rekordy” i „zmień” aktywne, HM-5); `Home.tsx:60`, `:112` i `MiniGames.tsx:50`, `:66`, `:82-85`, `:138` (rekordy `{}` dają fałszywe „nie grane” / „Nikt jeszcze nie grał”, HM-7, MG-1);
  `Records.tsx:203` (`TopGame` nic nie rysuje do odpowiedzi, RC-7); `App.tsx:50` (wznawianie sesji: pusty ekran, AP-1); szkielety `Lobby.tsx:68-69` (U16).
- Propozycja: „Uruchamianie…” / „Łączenie…” / „Wczytywanie…” w `fg-muted` z `role="status"`; `records: null` do odpowiedzi serwera.

### U27. `float-up` niewidoczne przy reduced motion `[zbiorcze: float-up-reduced]`
- Źródło: `ZASADY.md` §5 „`prefers-reduced-motion`” (przeskok do stanu końcowego zakłada, że stan końcowy coś pokazuje); B-51. Waga: **niska** (ta sama informacja jest w panelu / `Stats`).
- Miejsca: `KampusTour.tsx:756` (KA5), `Wieza.tsx:162` (werdykt „Pudło” / „Idealnie!”, WZ1), `Balon.tsx:157`, `ui.tsx:132`, `Game.tsx:311`; klatka końcowa `index.css:288-300` (`opacity: 0`), reguła `index.css:360-368`.
- Propozycja (decyzja platformy): osobna reguła `@media (prefers-reduced-motion: reduce)` dla `float-up` (widoczna bez ruchu, wygaszana stanem) albo świadomy zapis w §5.

### U28. Pomiar z obsługi zdarzenia zamiast `e.timeStamp` `[zbiorcze: pomiar-timestamp]`
- Źródło: `ZASADY.md` §5 „Pomiar czasu” (dokładność); wzór `Rytm.tsx:85`, `Przytrzymaj.tsx:90`, `Zaslona.tsx:99`. Waga: **niska** (pomiar nie zależy od animacji; błąd kilka-kilkanaście ms, u wszystkich podobny).
- Miejsca: `Refleks.tsx:155`, `:170` (RF4: start sprzed narysowania bodźca); `Stoper.tsx:49`, `:112` (SP2); `Stoj.tsx:53`, `:71` (SJ2); `Wieza.tsx:138`, `:76` (WZ2: 10 ms to ok. 1,4% pola przy progu 2%).
- Propozycja: `e.timeStamp` w `onPointerDown`; start bodźca w `requestAnimationFrame` po zmianie fazy (pierwsza klatka z bodźcem). Wielkość błędu do fazy 3.

### U29. `accent-fg` poza akcentem `[zbiorcze: accent-fg-poza-akcentem]`
- Źródło: `DESIGN.md` §2 (rola `accent-fg`: tekst na akcencie), D-04. Waga: **niska** (wartość równa `bg`, zero skutku widocznego).
- Miejsca: `Simon.tsx:121` (SQ1), `Stoj.tsx:149`, `:28` (SJ1).
- Propozycja: `text-bg` / `var(--color-bg)`.

### U30. Drobne różnice słów `[zbiorcze: slowa-drobne]`
- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach”. Waga: **niska**.
- Miejsca: „Czekamy na resztę” `PanstwaMiasta.tsx:105`, `Kalambury.tsx:140` wobec „Czekamy na: {nicki}…” (PM10); „Dalej” w dwóch znaczeniach `PanstwaMiasta.tsx:212` / `:105` (PM12);
  „Idealnie” `Szacowanie.tsx:179`, `Rok.tsx:198` wobec „Idealnie!” (W9c); podgląd „ta sama / lustro” `Obrot.tsx:55` (OB2); „odcięte” `Wieza.tsx:170` wobec „ucięte” `:116` (WZ4);
  legenda „ostrzegawczy” `Zaslona.tsx:126` wobec „czerwony” `ui.tsx:244` i progi przez `${}` (B-69); odchyłka w ms w `Stats` i w s w odsłonie, „+0,00 s” ze znakiem `Przytrzymaj.tsx:201`, `:221-224` (PT4).
- Propozycja: jedna forma w każdej parze (tabela §4.9).

### U31. Zapis ułamka bez wspólnej funkcji `[zbiorcze: przecinek]`
- Źródło: `ZASADY.md` §4 („przecinek dziesiętny („10,00 s”)”), B-66. Waga: **niska** (dziś żaden tekst nie ma kropki).
- Miejsca: `ui.tsx:175` (`tenth` tylko na jedno miejsce, „-0,0” z minusem ASCII, B-66); `Schulte.tsx:83`, `:115`, `:130`, `Sudoku.tsx:95`, `:123`, `:138` (kara przez szablon, kropka przy ułamkowej karze, SC1).
- Propozycja: `decimal(n, digits)` w `ui.tsx` (z `tenth = (n) => decimal(n, 1)`, bez minus zera) i kary przez nią.

### U32. Animacja pojawienia gra ponownie po odświeżeniu `[zbiorcze: animacja-po-odswiezeniu]` (02-05 Z3)
- Źródło: `ZASADY.md` §5 („przy dużym skoku (odświeżenie, powrót do karty) element od razu ląduje na miejscu”). Waga: **niska**.
- Miejsca: `PiecWRzedzie.tsx:69`, `Statki.tsx:373`, `Labirynt.tsx:151`, `Memory.tsx:104` (wszystkie zebrane pary naraz).
- Propozycja: animować tylko element zmieniony po zamontowaniu (ref z poprzednim stanem, jak `useRolling` w `Chinczyk.tsx:58-70`).

### U33. Zapis braku wartości `[zbiorcze: brak-wartosci]`
- Źródło: `DESIGN.md` §4 „stan pusty”, `ZASADY.md` §4 (bez em-dashy, te same słowa). Waga: **niska**.
- Miejsca: `Kolo.tsx:184` (ASCII „-” w `Stats`, KO5), `Balon.tsx:109` (en-dash „–” w tabeli, BL4; `ZASADY-GIER.md` :426 „kreska”).
- Propozycja: jeden zapis w całej aplikacji (np. „0” albo „brak” w `fg-muted`), z poprawką legendy Balonu.

### U34. Szerokość bez skalowania `[zbiorcze: szerokosc-bez-skalowania]`
- Źródło: `ZASADY.md` §4 („plansza skaluje się do szerokości, nie ma stałych pikseli”), D-09. Waga: **niska** (dziś bez skutku).
- Miejsca: `Quiz.tsx:246` (`inny`, `literowka`) i `Dziesiatki.tsx:130` (`repeat(N, 1fr)` bez `minmax(0, 1fr)`, QZ2); `Sudoku.tsx:142` (`w-64`, SU1).
- Propozycja: `minmax(0, 1fr)`; `w-full max-w-64`.

### U35. Własne progi zamiast `grade` `[zbiorcze: wlasny-grade]`
- Źródło: `ZASADY.md` §4 (wspólne komponenty), B-67. Waga: **niska**.
- Miejsca: `Przytrzymaj.tsx:20-25`, `Stoper.tsx:79` (PT3).
- Propozycja: `grade(off, PERFECT, CLOSE)` z `ui.tsx:178` (jak `Zaslona.tsx:191`), wspólne stałe dla Stopera, Przytrzymaj i Za zasłoną.

### U36. Punkt `time` w `Intro` bez czasu `[zbiorcze: intro-time]`
- Źródło: `ZASADY.md` §4 („`time`: czas”), B-72, W-08. Waga: **niska**.
- Miejsca: `Kolo.tsx:170`, `Srodek.tsx:131`, `Mapa.tsx:129`, `Tort.tsx:127`, `Nozyczki.tsx:110` (W9g: liczba rund, bez limitu partii).
- Propozycja: „10 rund, razem do 2 minut” albo w §4: `time` to długość partii (rundy albo sekundy).

### U37. Kolor znacznika prawdy w odsłonie `[zbiorcze: znacznik-prawdy]`
- Źródło: `ZASADY.md` §5 (ta sama sytuacja tak samo), `DESIGN.md` §2 (`success` = trafienie). Waga: **niska**.
- Miejsca: `Rok.tsx:180` (pierścień prawdziwego roku zawsze `success`), `:198`; `Szacowanie.tsx:178` (`kropki`, `kat`); `Kat.tsx:30` (łuk `stroke-fg-muted`); wzór `grade`: `Srodek.tsx:168-171`, `Mapa.tsx:170-177`, `Tort.tsx:160`, `Nozyczki.tsx:156` (W9d).
- Propozycja: `grade` z progami w Który rok? i Szacowaniu, neutralny znacznik prawdy (`stroke-fg`), gdy błąd ma już kolor.

## 6. Odstępstwa z powodem (D-04, D-05; bez wagi)

Sprawdzone i zgodne z wyjątkami z `ZASADY.md`, `KONCEPT.md`, `ZASADY-GIER.md` i `DESIGN.md` §6; nie są rozbieżnościami.

| Odstępstwo | Gry / ekran, `plik:linia` | Powód (źródło) |
|---|---|---|
| własny układ poziomy (`.landscape`, scena ze `zoom`), bez `Screen` i `StickyBar` | `kampus-tour`: `KampusTour.tsx:717-721`, `index.css:177-191` | `DESIGN.md` §6 (B-34) |
| własny nagłówek (status, runda, licznik na środku, panele graczy z gotówką zamiast `Stats`) | `kampus-tour`: `KampusTour.tsx:722-765`, `:850-860`, `Game.tsx:83-97` | `ZASADY.md` §4, `DESIGN.md` §6; braki zakresu: U8, U9, A8, KT14 |
| własny nagłówek z punktami zamiast `Stats` | `panstwa-miasta`: `PanstwaMiasta.tsx:28-63`; `kalambury`: `Kalambury.tsx:47-85`; `Game.tsx:179`, `:232` | `DESIGN.md` §6; `ZASADY.md` §4 wymienia tylko Państwa-miasta i Kampus Tour (lista do uzupełnienia o Kalambury, §7) |
| kolory grup pól | `kampus-tour`: `KampusTour.tsx:84` (`GROUP_COLORS`, ikona grupy `:86`) | `DESIGN.md` §6 |
| cień pod oknami i pionkami, cień w `set-glow` | `KampusTour.tsx:650`, `:987`, `:1033`, `:1073`, `:519`, `:803`, `KampusSummary.tsx:41`, `index.css:200` | `DESIGN.md` §2, §6 |
| przyciski budowy 44 px (z „Pomiń” w rzędzie) | `KampusTour.tsx:897`, `:906` | `DESIGN.md` §6 |
| obrys przez `box-shadow: inset 0 0 0 Npx` / `0 0 0 2px` (to nie cień) | `KampusTour.tsx:174`, `Chinczyk.tsx:242`, `:248`, `Sudoku.tsx:156`, `Zakupy.tsx:165` | `02-01-CHECKS.md` §3 |
| mieszanki tokenów (`color-mix`) i odcienie OKLCH z koloru gracza | `KampusTour.tsx:89-90`, `:174`, `:778`, `:788`, `:801`; `Chinczyk.tsx:44-46`, `:151-155`; `PiecWRzedzie.tsx:56` | pochodne tokenów i `PLAYER_COLORS`, nie nowe kolory (D-04) |
| trafienie i zatopiony statek w `accent` | `statki`: `Statki.tsx:174`, `:390`, `:396`, `:165` | `DESIGN.md` §6 (strefa zakazana i duch nie są objęte: U7) |
| zamiana plansz po pudle dopiero po `SWAP_MS` 1200 ms | `statki`: `Statki.tsx:47`, `:73`, `:101`, `index.css:354-358` | `ZASADY.md` §5 („Wyjątek: Statki…”) |
| tryb Szybki Chińczyka: krok 110 ms, rzut 400 ms | `chinczyk`: `Chinczyk.tsx:53-54` | `KONCEPT.md` §2.3a („szybsze animacje”); wiersz do tabeli §5 (§7) |
| emoji jako symbole kart | `memory`: `Memory.tsx:17-36` | treść gry, jedno źródło |
| paleta Kalamburów (`#facc15`, `#4ade80`, `#60a5fa`, `#b4763a`), biały i gumka z `fg` / `surface` | `kalambury`: `Kalambury.tsx:21-28` | D-04 |
| `--ambient` zawsze w kolorze rysującego | `kalambury`: `Game.tsx:53-54` | `DESIGN.md` §1 p. 1 |
| odznaka turnieju prostokątna | `turniej`: `ui.tsx:125` (`square`) | `ZASADY.md` §4 (promień 4 px: U22) |
| ukryty pasek limitu u grającego, brak licznika sekund | `stoper`, `rytm`, `przytrzymaj`, `zaslona`: `Game.tsx:208-210`, `Rytm.tsx:146`, `Przytrzymaj.tsx:204`, `Zaslona.tsx:161` | `KONCEPT.md` §2.4, `ZASADY-GIER.md` :83, :315-316, :406-407, :516-517 |
| klik metronomu (WebAudio), jedyny dźwięk | `rytm`: `Rytm.tsx:47-64` | `KONCEPT.md` §1 |
| wibracja 30 przy uderzeniu metronomu | `rytm`: `Rytm.tsx:70` | `KONCEPT.md` §2.4, `ZASADY-GIER.md` :317 (wiersz w tabeli §5: RY3) |
| kolory pól Sekwencji (w tym `#ff2445` równy akcentowi) | `simon`: `Simon.tsx:15-20` (do koloru kształt `:14`) | `DESIGN.md` §6 |
| napisy Koloru liter (`HUES`, ta sama paleta co Sekwencja) | `stroop`: `Stroop.tsx:5`, `:26`, `:38` | `DESIGN.md` §6 (wspólna stała dla obu gier byłaby prostsza, nie jest wymagana) |
| figury Innego elementu `hsl(...)` | `inny`: `Inny.tsx:22` | `DESIGN.md` §6 |
| próbki, tory suwaków i podgląd Odcienia | `kolor`: `Kolor.tsx:20`, `:33-36`, `:47-48`, `:63-64`, `:154`, `:167-168`, `:187`, `:198` | `DESIGN.md` §6 |
| `Math.random` w kliencie poza zasadami gry (start suwaków, losowa gra, oczka w trakcie turlania) | `Kolor.tsx:13-15`, `Home.tsx:190`, `MiniGames.tsx:91`, `KampusTour.tsx:280`, `Chinczyk.tsx:100` | reguła „losowość z `rng`” dotyczy `packages/games` |
| ruch z JS bez `reducedMotion` (ruch jest zadaniem; przy reduced motion gry są grywalne) | `kubki` `Kubki.tsx:79-109` (komentarz `:77-78`), `sledzenie` `Sledzenie.tsx:72-88`, `wieza` `Wieza.tsx:74-84`, `zaslona` `Zaslona.tsx:78-91` | wyjątku nie ma jeszcze w §5: B-53 (§3); po dopisaniu zostaje tutaj |
| pokaz Sekwencji z timerów (stany zapalenia 450 ms, nie ozdoba) | `simon`: `Simon.tsx:52`, `:61-64` | treść gry; przy reduced motion skraca się tylko przejście 100 ms |
| kara punktowa zamiast blokady; `Stats` „Do końca” obok limitu | `stoj`: `Stoj.tsx:135` | `ZASADY-GIER.md` :215, :225-226 |
| blokada 1 s po pomyłce (przyciski nieaktywne) | `stroop`, `liczenie`, `inny`, `obrot`, `literowka`: `Quiz.tsx:33`, `:195`; `dziesiatki`: `Dziesiatki.tsx:73` | `KONCEPT.md` §2.4 (zasada gry, nie animacja) |
| kształty treści (`rounded-[50%]` balonu, `clip-path` kubka, prostokątne klocki, kulki) | `Balon.tsx:149`, `Kubki.tsx:31`, `Wieza.tsx:123`, `Sledzenie.tsx:158` | kształt treści gry, nie zaokrąglenie kafla |
| ekran końcowy Koła: karty z miniaturami zamiast `Scores` | `kolo`: `Kolo.tsx:236-276` | `KONCEPT.md` §2.4, `ZASADY-GIER.md` („bez osobnej tabeli wyników”); „(ty)”, „gra…”, mono jak w `Scores` |
| ikona wyzwania dnia `text-accent` na `accent-soft`, `fill` | `Home.tsx:146-147` | `DESIGN.md` §2, §3.1 |
| „Dołącz” w akcencie po wpisaniu kodu | `Home.tsx:241` | `KONCEPT.md` §1, `DESIGN.md` §3.1 (sprzeczność z §5: HM-1) |
| gospodarz bez możliwości startu widzi zdanie zamiast wyszarzonego przycisku | `Lobby.tsx:218-219` | `DESIGN.md` §4 („samo przygaszenie nie wystarcza”) |
| „Zagraj ponownie”, „Pobij”, „Wróć do pokoju”, „Jeszcze raz”, „Wyjdź”, „Gotowe” w Zakupach, „Pokrój” w Torcie | `Records.tsx:276`, `Home.tsx:324`, `Game.tsx:501`, `Zakupy.tsx:175`, `Tort.tsx:182` | nazwane w `KONCEPT.md` §1, §2.4 („Gotowe” w trzech rolach: A17) |

Nie są odstępstwami (zwykłe wpisy, D-05): przewijanie Państw-miast powyżej 640 px (`DESIGN.md` §6 „Rozbieżności do decyzji”: U1, PM2), rozstawianie Statków i Gomoku powyżej 640 px (U1).

## 7. Propozycje dopisania do `ZASADY.md` i `DESIGN.md` (D-06; decyzja w fazie 4)

**`ZASADY.md` §5, lista „Najpierw istniejące”:** `line-draw` (linia rysuje się od początku do końca), `title-pop` (wygrana), `tile-hit` / `tile-miss` (trafienie / pomyłka na kaflu),
`piece-fall` (ucięty kawałek spada), `shake` (dotknięcie zignorowane, bez kary); jedna animacja „czekamy na rywala” albo jej brak (A3); rola `set-glow` jako komplet z wielu pól (A14). Źródło: U17, A3, A14.

**`ZASADY.md` §5, tabela czasów (nowe wiersze):**

| Sytuacja | Czas | Wpis |
|---|---|---|
| świeże osiągnięcie (`set-glow`) | 0,9 s × 4 | B-35 |
| pętla „to można wybrać” (`ring-pulse`) | 1,2 s | A1 |
| wygrana (`title-pop`) | 0,5 s albo zmiana na 350 ms | U17 |
| trafienie / pomyłka na kaflu | 350 ms | U17 |
| ucięty kawałek (`piece-fall`) | 0,5 s `ease-in` | U17 |
| dotknięcie zignorowane (`shake`) | 300 ms | U17, A5 |
| pasek czasu i postępu | przejście szerokości równe krokowi odświeżania, `linear` (Countdown 300 ms) | U18 |
| ruch będący treścią gry | czas z `ZASADY-GIER.md` (Kubki, Śledzenie, Wieża, Za zasłoną) | U18, B-53 |
| pojawienie w pokazie na czas | 180 ms (W pamięci) | U19 |
| tryb Szybki Chińczyka | krok 110 ms, rzut 400 ms | §6 |
| odsłona prawdziwego wyniku | `stone-pop` 350 ms albo bez animacji (jedna decyzja) | A4 |

**`ZASADY.md` §5, wyjątki i zasady:** ruch, który gracz śledzi albo mierzy, nie podlega reduced motion i robi go JS (B-53); kroki sekwencyjne czekają z decyzją na dojście pionka albo dotknięcie kończy animację (U2);
`float-up` przy reduced motion zostaje widoczne bez ruchu (U27); pierwsza klatka podglądu `Intro` bazowo widoczna (B-52); zaznaczenie w polu gry na czas bez przejścia, jak bodziec (A15); okno otwierane dotknięciem pojawia się od razu (A16).

**`ZASADY.md` §5, tabela wibracji:** wiersz „uderzenie metronomu w Rytmie (część bodźca): 30” (RY3); „ruch zignorowany: 60 albo bez wibracji” (A5); czy pudło w grze turowej to pomyłka (A6);
przykłady „zła od innego gracza”: trafienie floty, wykupienie pola, STOP (A7); wibracja tury przy zmianie klucza fazy, gdy czekamy na mnie (A10).

**`ZASADY.md` §4:** lista tokenów zastąpiona odesłaniem do `DESIGN.md` §2 (B-18); własny nagłówek także w Kalamburach (§6); `Results` / `ScoreTable` jako drugi wzorzec wyników (U10); `RoundTable` z `children`
i wierszem celów (U11); kiedy odsłona czeka na przycisk i jakie słowo („Dalej” albo „Wyniki”) (U9); `time` w `Intro` to długość partii (U36); klasa akcji w partii `.btn-player` (B-29); „Gotowe” tylko w jednej roli (A17).

**`DESIGN.md` §2:** wiersz `accent-hover` (B-15); rola `accent` dla znaku aplikacji (HM-2); rola `warning` „ostrzeżenie przed skutkiem ruchu” albo jej brak (C3 w U7); 4 px dla odznaki turnieju (U22).

**`DESIGN.md` §5:** dwa akcenty na ekranie głównym przy pełnym kodzie albo „Zagraj” jako obrys (HM-1); „Dalej” w partii w kolorze gracza, między grami turnieju w akcencie (A11).

**`DESIGN.md` §6:** wysokości (U1 po pomiarze; HM-8: listy poza partią przewijają się w pionie); gęste plansze z potwierdzeniem poniżej 48 px (U4); Kampus Tour: rogi planszy, plansza 2.5D i poświaty, promień 4 px pól,
pola planszy poniżej 48 px (U5, U21, U22, U4); uchwyt suwaka (U5); figury Obrotu jako treść (U22); pary Odcienia zamiast `RoundTable` (U11); gradient oceny w Kole albo tokeny (U5); pionki i kamienie: kolor gracza wystarcza albo nie (U6).

## 8. Ekrany i gry

Każda sekcja: Wygląd (UI-01..UI-03, w tym 360×640), Teksty (UI-04, UI-05), Animacje (ANIM-01..ANIM-03). „→ Un” / „→ An” to odsyłacz do wpisu zbiorczego albo z macierzy;
wpisy pojedyncze mają tabelę. Ekran końcowy z samego stanu i podpięcie ocenia faza 1 (`01-*/FINDINGS.md` §3, §6). Pełne opisy: plik częściowy podany przy sekcji.

### 8.1 Ekrany platformy i komponenty wspólne

#### `index.css` i `ui.tsx` (wzorce), szczegóły: 02-02-BASELINE.md
- **Wygląd:** tokeny zgodne z `DESIGN.md` §2 poza B-15, B-18; brak `color-scheme` B-20; suwak → U4, U5, U21, U22; brak `.btn-player` B-29; odznaka turnieju → U22. `Screen` na 360 px daje 328 px treści, `TopBar` ok. 316 z 328 px, `RoundTable` przy 10 rundach mieści 3 znaki (B-68).
- **Teksty:** `tenth` → U31; legenda progów → U30; `Intro` liczby → U12, kropka → U23. `Intro` wymusza typem `time` / `task` / `score` / `preview` / `onStart`.
- **Animacje:** keyframes → U17, U18, U19, U20, U16; `ring-pulse` → A1; reduced motion B-51 zgodna, luki B-52, B-53, U27; `ui.tsx` nie wibruje; przejścia → U15.

#### `Game.tsx`, szczegóły: 02-03-FINDINGS.md (część turniejowa: 02-06)
- **Wygląd:** akcje po partii → U3 (GM-1); pasek Kampus Tour → U8 (GM-2); pigułki bez rozłączenia → U24 (GM-3); nagłówek gier głównych jako główna przyczyna U1. Jeden `btn-primary` na ekranie („Rewanż” albo „Jeszcze raz”), kolor gracza przez `style`, bez poziomego przewijania (statycznie).
- **Teksty:** „Rewanż”, „Do lobby”, „(ty)”, „Oglądasz”, „Twój ruch”, „Ruch: X”, „Czekamy na: …” zgodne; liczba par → U12 (GM-4); `aria` → U23 (GM-5, GM-6); ikona → U14 (GM-7).
- **Animacje:** wibracja tury 40 zgodna (raz przy przejściu, `?.`), fazy → A10; ostatnie 10 s → U16 (GM-8); paski → U18 (GM-9); pigułka → U15 (GM-10); `title-pop` → U17; liczba wygranych → U19; „Rewanż” `ring-pulse` → A1; ukrycie licznika zgodne (§6).

#### `Home.tsx`, szczegóły: 02-03-FINDINGS.md
- **Wygląd:** HM-1, HM-2, HM-3 (§3); wysokość listy HM-8 (§3). Formularz, `Problem` z `role="alert"`, kolejność sekcji przy `/?kod=` zgodne.
- **Teksty:** liczby → U12 (HM-4); ładowanie → U26 (HM-5, HM-7); ikony → U14 (HM-6). „Łączenie…”, „Tworzenie…”, „Wróć” zgodne.
- **Animacje:** brak keyframes, timerów i wibracji; tylko `.btn` 180 ms. Zgodne.

#### `Lobby.tsx`, szczegóły: 02-03-FINDINGS.md
- **Wygląd:** pola → U4 (LB-1, LB-2, LB-3); rozłączony → U24 (LB-4). Kod pokoju 60 px mono mieści się w 286 px, stany kafli zgodne z `DESIGN.md` §4, jeden `btn-primary` w `StartBar`.
- **Teksty:** podpis → U13 (LB-5); ikona → U14 (LB-6); liczby → U12 (LB-7); ładowanie → U26, U16 (LB-8).
- **Animacje:** przejścia → U15 (LB-9); `setTimeout` „Skopiowano!” to nie animacja. Bez wibracji.

#### `Setup.tsx` (`Setup` i `TournamentSetup`), szczegóły: 02-03-FINDINGS.md, 02-06-FINDINGS.md
- **Wygląd:** wybrany tryb → U6 (SU-1); tryby u gościa → U25 (SU-2); tytuł SU-3 (§3); wysokość HM-8. Turniej: §8.5.
- **Teksty:** tryby z `role="radiogroup"`, liczby mono zgodne.
- **Animacje:** przejścia → U15 (SU-4, TU3). Bez timerów i wibracji.

#### `MiniGames.tsx`, szczegóły: 02-03-FINDINGS.md
- **Wygląd:** siatka `grid-cols-3`, kafel ok. 104 px, „Przytrzymaj” i „10. miejsce” mieszczą się; jeden `btn-primary`. Zgodne.
- **Teksty:** ładowanie rekordów → U26 (MG-1); ikona → U14 (MG-2).
- **Animacje:** przejście → U15 (SU-4). Bez timerów i wibracji.

#### `Records.tsx` i `App.tsx`, szczegóły: 02-03-FINDINGS.md
- **Wygląd:** `warning` → U7 (RC-1); RC-2, RC-3 (§3). „Jeszcze nie grane” `grid-cols-4` (68 px wnętrza, na granicy), `TopGame` ok. 302 px szerokości (do potwierdzenia, §9).
- **Teksty:** `FORMAT` z przecinkiem zgodny; liczby i podpisy → U12, U13 (RC-4); ikony → U14 (RC-5); RC-6, AP-2 (§3); ładowanie → U26 (RC-7, AP-1).
- **Animacje:** `set-glow` → U18; strzałka → U15 (RC-8). Przejść między ekranami brak (zgodne).

#### `Quiz.tsx` (wspólny, D-02), szczegóły: 02-08-FINDINGS.md sekcja Kolor liter
- **Wygląd:** `touch-none select-none`, `onPointerDown`, odpowiedzi 158 × 96 px, wysokość 412 px (zostaje ok. 468 px); siatka → U34 (QZ2).
- **Teksty:** `Results` → U10 (QZ1); „gra…”, „(ty)”, przecinek w czasie zgodne.
- **Animacje:** `tile-hit` / `tile-miss` 0,35 s, wibracja 60 przy pomyłce, trafienie bez wibracji, pomiar niezależny od błysku; miejsce błysku QZ3 (tabela niżej).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| QZ3 | `Quiz.tsx:184`, `:189`, `:250`, `:256` | `ZASADY.md` §5 („Animacja ma pokazać, co się właśnie stało”) | niska | błysk trafienia nie na przyciskach nowego pytania (np. błysk całego pola albo liczby „Trafienia”) albo zapis w §5, że błysk oznacza miejsce dotknięcia |

#### `Szacowanie.tsx` (wspólny), szczegóły: 02-09-FINDINGS.md sekcja Policz kropki
- **Wygląd:** wysokość → U1 (SZ1); „Zatwierdź” bez podpisu przy liczbie spoza zakresu SZ2 (tabela niżej). Brak `touch-none` zgodny (pole tekstowe, bez pomiaru czasu).
- **Teksty:** `Answers` → U11 (W9f), U12 (SZ3); słowa → U9 (W9b), U30 (W9c); kolor różnicy → U37.
- **Animacje:** kropki i kąt bez przejścia, czas widoczności = stała z zasad; odsłona → A4. Bez wibracji.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SZ2 | `Szacowanie.tsx:157`, `:154` | `DESIGN.md` §4 („Każdy stan, który coś blokuje, tłumaczy się podpisem”) | niska | podpis „Najwyżej 180°” albo `aria-invalid` na `.field` |

#### `MiniGame.tsx` (sprawdzony w 02-11)
- Wybór komponentu mini-gry po `id` (396 linii, importy i rozgałęzienie), bez `className`, tekstów UI, animacji, timerów i wibracji (02-01-CHECKS.md: 0 trafień we wszystkich sprawdzeniach). Bez rozbieżności.

### 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md
- **Wygląd:** scena 800 × 390 w skali 0,8 (640 × 312 px na ekranie), bez poziomego przewijania; środek planszy → **KT10 (wysoka, §2)**; pola wyboru w akcencie KT1; kolory → U5 (KT2, KT3);
  pola → U4 (KT4, KT5, KT6); cienie → U21 (KT7); promienie → U22 (KT8); właściciel → U6 (KT9); tekst 7-8 px KT11; pasek → U8 (KT12); słowa → U9 (KT13, KT15); brak wygranych i „Oglądasz” KT14.
- **Teksty:** liczby → U12 (KT16, KS4); podpisy → U13 (KT17, KS5); `aria` → U23 (KT18); ikona → U14 (KT19).
- **Animacje:** `STEP_MS` 220, `ROLL_MS` 700 zgodne z tabelą, `useWalk` z `reducedMotion` i dużym skokiem; decyzje po marszu → **U2 (KA1)**; turlanie bez rzutu KA2; przeskok raz krokami, raz od razu KA3;
  wykupienie bez wibracji → A7 (KA4); `float-up` → U27 (KA5); koniec partii → A8 (KA6); przejście → U15 (KT20); okienko pola → A16 (KT21). Gra nie dubluje wibracji tury.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| KT1 | `KampusTour.tsx:785`, `:802` (komentarz `:810`) | `ZASADY.md` §4 („Kolor gracza, nie czerwień, dla wszystkiego, co jest moje”), `DESIGN.md` §5 | średnia | `outlineColor: color(me)` dla pól do sprzedaży i Juwenaliów; dług mówi tekst „Brakuje N zł” |
| KT14 | `KampusTour.tsx:722-765`, `Game.tsx:85-95` | `ZASADY.md` §4 „Czego gra nie rysuje sama” + własny nagłówek przejmuje zakres | średnia | przekazać `scores` i `seated`; wygrane z pucharem i „+1” w panelu, „Oglądasz” pod nagłówkiem |
| KA2 | `KampusTour.tsx:260-271` (klucz `JSON.stringify(positions)` `:261`); `packages/games/src/kampus-tour.ts:388-392`, `:436-441` | `ZASADY.md` §5 („Animacja ma pokazać, co się właśnie stało”; `dice-tumble` = rzut) | średnia | wyzwalać turlanie zmianą `view.dice` albo zdarzeniem rzutu, jak `last?.roll` w Chińczyku |
| KA3 | `KampusTour.tsx:245`; `kampus-tour.ts:391`, `:569`, `:436`, `:441` | `ZASADY.md` §5 („Ta sama sytuacja … tej samej animacji”) | średnia | przeskok bez kroków dla każdego ruchu, który nie wynika z rzutu (Kolokwium, MPK, karty); marsz tylko po rzucie |
| KT11 | `KampusTour.tsx:553`, `:597`, `:173`, `:819` | `DESIGN.md` §2 „Typografia”, `AGENTS.md` | niska | do oceny w przeglądarce; krótsze podpisy, większy krój ceny |
| KS1 | `KampusSummary.tsx:133-140` | `DESIGN.md` §4 (stan czytelny), komentarz `:88` | niska | `onPointerDown` ustawia `hover`, bez czyszczenia w `pointerleave` dla dotyku |
| KS2 | `KampusSummary.tsx:74`, `KampusTour.tsx:968` | `DESIGN.md` §5 („Akcent jest rzadki”) | niska | `actions` na środku planszy tylko przy `summaryHidden` |
| KS3 | `KampusSummary.tsx:120`, `:145`, `:150`, `:153`, `:172`, `:190` | `DESIGN.md` §2 „Typografia” | niska | do oceny w przeglądarce razem z KT11 |
| KS6 | `KampusSummary.tsx:46-71` | `DESIGN.md` §4 „stan pusty” | niska | „Za krótka partia na ciekawostki.” w `fg-muted` |

### 8.3 Gomoku (`piec-w-rzedzie`), szczegóły: 02-05-FINDINGS.md
- **Wygląd:** **U1** (686 / 698 px, znane z `DESIGN.md` §6); pole ok. 22 px → U4 (G2); `white` → U5, cień → U21 (G3); kamienie tylko kolorem → U6 (G4). „Postaw” w kolorze gracza, bez `btn-primary`, plansza 352 px bez przewijania w poziomie.
- **Teksty:** bez rozbieżności poza U6 (`aria-label` bez właściciela); „{nick} się zastanawia…” z `role="status"`.
- **Animacje:** `stone-pop` 0,35 s zgodny, po odświeżeniu → U32; podgląd `animate-pulse` → U16; czekanie → A3; `line-draw` → U17. Bez animacji z JS i bez wibracji (moja tura z `Game.tsx`).

### 8.4 Statki (`statki`), szczegóły: 02-05-FINDINGS.md
- **Wygląd:** **U1** (rozstawianie ok. 800 px, znane z `DESIGN.md` §6; bitwa ok. 960 px); pola 24-37 px → U4 (S2); akcent jako „niedozwolone” → U7 (S3); poświata i 1 px → U21, U22 (S4); podpisy → U13 (S5). Trafienie w `accent`: §6.
- **Teksty:** `aria` → U23 (S6). Słowa po polsku, strzałka „→” to nie myślnik.
- **Animacje:** `startViewTransition` z `reducedMotion`, `SWAP_MS` (§6); `stone-pop` → U32; czekanie → A3; trafienie w moją flotę → A7 (S7), pudło → A6; 60 przy złym ustawieniu zgodne.

### 8.5 Chińczyk (`chinczyk`), szczegóły: 02-05-FINDINGS.md
- **Wygląd:** **U1** (684-772 px); pola ok. 25 px → U4 (C2); `warning` jako cel zbicia → U7 (C3); pionki tylko kolorem → U6 (C4); promień 6 px → U22 (C5).
- **Teksty:** liczby → U12 (C6); pionek zablokowany bez wyjaśnienia C7 (tabela niżej).
- **Animacje:** `STEP_MS` 180 / `ROLL_MS` 700 zgodne (Szybki 110 / 400: §6); blokada akcji → **U2 (C8)**; `ring-pulse` 1 s → A1; [60, 40, 60] przy zbiciu zgodne (raz na rzut, po dojściu pionków).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| C7 | `Chinczyk.tsx:194`, `:213` | `DESIGN.md` §4 („Każdy stan, który coś blokuje, tłumaczy się podpisem”) | niska | przy dotknięciu nieruchomego pionka krótki tekst, dlaczego nie ma ruchu |

### 8.6 Memory (`memory`), szczegóły: 02-05-FINDINGS.md
- **Wygląd:** **U1** (tryb Średni 651 px, do potwierdzenia); poświata → U21 (M2); rewers 45% → U25 (M3); pary tylko kolorem → U6 (M4). Karty co najmniej 48 px.
- **Teksty:** licznik par w `Game.tsx` → U12 (M5 = GM-4). `aria-label` kart z nazwą symbolu.
- **Animacje:** obrót 180 ms zgodny; `ring-pulse` 1,2 s (wariant dominujący A1); pudło bez wibracji → A6 (M6); para `stone-pop` → A14 (M7); `animate-ping` → A3, U16; po odświeżeniu → U32.

### 8.7 Kalambury (`kalambury`), szczegóły: 02-06-FINDINGS.md
- **Wygląd:** **U1** (zgadujący 677-725 px, KL1); odsłona → U3 (KL2). Paleta 48 px z `role="radio"`, płótno `touch-none` z `onPointerDown`, rysujący ok. 617 px (mieści się przy graczach w jednej linii).
- **Teksty:** forma „rysuje ty” KL4; płótno → U23 (KL5); ikony → U14 (KL6); „Czekamy na resztę” → U30 (PM10); „Dalej” w kolorze gracza → A11.
- **Animacje:** paleta → U15 (KL3); wibracja w połowie rysowania → A10 (KL7); litera bez animacji KL8. Wysyłka kresek co 200 ms to logika, nie animacja; trafienie nie wibruje.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| KL4 | `Kalambury.tsx:50` | `ZASADY.md` §4 „Teksty po polsku” | niska | „rysujesz” u rysującego, „rysuje {nick}” u reszty |
| KL8 | `Kalambury.tsx:56-62` | `ZASADY.md` §5 („Najpierw istniejące: `stone-pop`”) | niska | odsłonięta litera w `<span key>` z `stone-pop` 0,35 s |

### 8.8 Labirynt (`labirynt`), szczegóły: 02-05-FINDINGS.md
- **Wygląd:** **U1** (742-830 px w turze); pole kroku 36 px → U4 (L2); możliwe kroki `animate-pulse` → A2 (L3); pionki rywali tylko kolorem → U6 (L4). Przełącznik w kolorze gracza zamiast akcentu, SVG `touch-none`.
- **Teksty:** plansza dla czytnika → U23 (L5); liczba ścianek → U12 (L6).
- **Animacje:** `stone-pop` ścianki zgodny, po odświeżeniu → U32; krok `transition-transform` 200 ms zgodny. Bez animacji z JS i bez wibracji.

### 8.9 Mini-gry (`KONCEPT.md` §2.4)

Wspólne dla 30 mini-gier: każda ma `<Intro>` z `Preview` z pliku gry i trzema punktami (23 bezpośrednio, 5 przez `Quiz.tsx`, 2 przez `Szacowanie.tsx`; podgląd inline tylko w Kole, KO4);
podglądy przy reduced motion czytelne (sprawdzone w każdej grze); „Start” z `Intro`; wibracja tury tylko z `Game.tsx`; żadna nie używa `btn-primary`. 360×640 podane przy każdej grze (statycznie, nagłówek `Game.tsx` ok. 172-198 px).

#### Refleks (`refleks`), 02-07-FINDINGS.md
- **Wygląd:** ok. 540 px; pole `touch-none select-none`, `onPointerDown`, bodziec bez przejścia. Zgodne.
- **Teksty:** wyniki → U10 (RF1); liczby → U12 (RF2).
- **Animacje:** falstart bez znaku i wibracji → A6 (RF3); pomiar → U28 (RF4).

#### Sekwencja (`simon`), 02-07-FINDINGS.md
- **Wygląd:** ok. 548 px; pola 158 px z kształtem obok koloru (kolory: §6); `accent-fg` → U29 (SQ1).
- **Teksty:** bez rozbieżności.
- **Animacje:** przejście 100 ms zgodne, pokaz jako treść gry (§6); pomyłka bez 60 i bez odsłony → A6 (SQ2, SQ3; styk z F1:SQ1).

#### Stoper (`stoper`), 02-07-FINDINGS.md
- **Wygląd:** ok. 472 px; pole `onPointerDown`, `touch-none`; progi lokalne → U35.
- **Teksty:** przecinek przez `toFixed(2).replace` zgodny; liczby → U12 (SP1). Ekran końcowy z kaflem ze stanu lokalnego: F1:Z16.
- **Animacje:** `setInterval` 30 ms tylko odświeża licznik, pomiar z `performance.now()` → U28 (SP2); licznik ukryty u grającego (§6). Bez wibracji (każde dotknięcie to wynik).

#### Tabela Schultego (`schulte`), 02-08-FINDINGS.md
- **Wygląd:** 396 px, komórka 59 px, `touch-none`, `onPointerDown`. Zgodne.
- **Teksty:** kara przez szablon → U31 (SC1); podpisy osi SC2 (tabela niżej).
- **Animacje:** `tile-hit` / `tile-miss` 0,35 s, 60 przy pomyłce, pomiar niezależny. Zgodne.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SC2 | `Schulte.tsx:172`, `:178` | `DESIGN.md` §2 „Typografia” (ok. 8,3 px przy minimum 11 px) | niska | 11 jednostek `viewBox` albo mniejsza szerokość `W`, żeby skala była bliska 1 |

#### Kolor liter (`stroop`), 02-08-FINDINGS.md
- **Wygląd:** 412 px (przez `Quiz.tsx`); bodziec „NIEBIESKI” ok. 263 px z 294 mieści się; kolory `HUES` (§6); podgląd ST1 (tabela niżej).
- **Teksty:** instrukcja ST2 (tabela niżej); wyniki → U10 (QZ1).
- **Animacje:** z `Quiz.tsx` (zgodne poza QZ3, §8.1).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| ST1 | `Stroop.tsx:30`, `Quiz.tsx:145` (okno `ui.tsx:297`, `overflow-hidden`) | `ZASADY.md` §4 (360×640), `DESIGN.md` §3.3 | niska | `flex-wrap justify-center` w `QuizPreview` albo trzy odpowiedzi w podglądzie; do potwierdzenia |
| ST2 | `Stroop.tsx:22` (wobec `KONCEPT.md` §2.4, `stroop.ts:8`) | `ZASADY.md` §4 (tekst mówi prawdę o grze) | niska | „Wybierz kolor liter, nie znaczenie słowa (zwykle się różnią)” |

#### Liczenie (`liczenie`), 02-08-FINDINGS.md
- **Wygląd:** 412 px; „108 : 9” ok. 202 px z 294. Zgodne.
- **Teksty:** znaki `−`, `×`, `:` z serwera zgodne; `tabular-nums` → U12 (LI1); wyniki → U10.
- **Animacje:** z `Quiz.tsx`.

#### Narysuj koło (`kolo`), 02-09-FINDINGS.md
- **Wygląd:** **U1** (707 / 683 px po pierwszej próbie, KO1); gradient `hsl` → U5 (KO2). Płótno `touch-none`, `onPointerDown`, `setPointerCapture`; ekran końcowy z kartami (§6).
- **Teksty:** „Nowy rekord!” → U9 (KO3); podgląd inline KO4 (tabela niżej); brak wartości → U33 (KO5); `time` → U36.
- **Animacje:** `line-draw` w podglądzie → U17; niedokończone koło bez znaku → A5. Bez timerów i wibracji.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| KO4 | `Kolo.tsx:153-168` | `ZASADY.md` §4 („mały komponent `Preview` w pliku gry”) | niska | wynieść do `function Preview()`, wysokość jak w innych podglądach SVG |

#### Odcień (`kolor`), 02-09-FINDINGS.md
- **Wygląd:** suwaki ok. 591-615 px (mieści się); suwak → U4, U5 (B-31, B-32); licznik nad polem OD1 (tabela niżej); kolory próbek (§6).
- **Teksty:** „Następny kolor” → U9 (W9b); pary → U11 (W9f). Procenty z przecinkiem, mono.
- **Animacje:** wzór 2 s bez przejścia (czas = stała z zasad); odsłona → A4. Bez wibracji (odchyłka, nie pomyłka).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| OD1 `[zbiorcze: liczby-poza-stats]` | `Kolor.tsx:144-147` (użyte `:153`, `:164`, `:186`) | `DESIGN.md` §5 („Liczby nad polem gry to zawsze pasek `Stats`”), W-01 | średnia | `Stats` z „Kolor 1/5”; w solo próbka `h-24` zamiast `h-28`, żeby faza suwaków dalej się mieściła |

#### Policz kropki (`kropki`), 02-09-FINDINGS.md
- **Wygląd:** przez `Szacowanie.tsx`: **U1 (SZ1)**, SZ2 (§8.1). Kropki w ułamkach kafla.
- **Teksty:** → U9, U11, U12, U30, U37 (§8.1).
- **Animacje:** kropki 1,5 s bez przejścia; odsłona do przycisku (zgodnie z `ZASADY-GIER.md`) → A4. Bez wibracji.

#### Kąt (`kat`), 02-09-FINDINGS.md
- **Wygląd:** przez `Szacowanie.tsx`: **U1 (SZ1)**, SZ2 („Zatwierdź” nieaktywny przy 181-999 bez podpisu). Rysunek SVG z tokenów.
- **Teksty:** jak Policz kropki; łuk → U37.
- **Animacje:** kąt bez przejścia; odsłona → A4. Bez wibracji.

#### Sudoku (`sudoku`), 02-08-FINDINGS.md
- **Wygląd:** 392 px, komórka 60 px, klawiatura 56 px; `w-64` → U34 (SU1); klawiatura bez wybranego pola SU2 (tabela niżej); zaznaczenie → A15.
- **Teksty:** kara przez szablon → U31 (SC1); `aria` → U23 (SU3).
- **Animacje:** `tile-hit` / `tile-miss`, 60 przy złej cyfrze, pomiar niezależny. Zgodne.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| SU2 | `Sudoku.tsx:166-177`, `:72`, `:81` | `DESIGN.md` §4 (nieaktywny 40% z podpisem) | niska | klawiatura `disabled` bez wybranego pola i podpis „Wybierz puste pole” |

#### Trzy kubki (`kubki`), 02-10-FINDINGS.md
- **Wygląd:** ok. 461 px, tercja kafla ok. 109 × 219 px, `touch-none`, `onPointerDown`. Zgodne.
- **Teksty:** „Dobrze” / „Pomyłka” w `Stats`, bez rozbieżności.
- **Animacje:** tasowanie z rAF (§6); uniesienie 150 ms → U15 (KB1); zamiana bez kategorii → U18 (KB2); 60 przy pomyłce, wskazanie z danych, nie z DOM.

#### Który rok? (`rok`), 02-09-FINDINGS.md
- **Wygląd:** ok. 551-575 px; suwak → U4 (B-31), przyciski −1 / +1 48 px; własny pasek rundy → A12 (RK1).
- **Teksty:** „Idealnie” → U30; pierścień prawdy → U37; lista → U11 (W9f).
- **Animacje:** odsłona 2,5 s bez animacji → A4; `Date.now` do limitu rundy, nie do wyniku. Bez wibracji.

#### Środek (`srodek`), 02-09-FINDINGS.md
- **Wygląd:** ok. 591-615 px, kafel maleje na niskim ekranie, `touch-none`, `setPointerCapture`. Zgodne.
- **Teksty:** `RoundTable` z formatem do 3 znaków; `time` → U36; „Idealnie!” (wariant dominujący).
- **Animacje:** `shake` + 60 przy ruchu poza strefą (wariant dominujący A5, wibracja do decyzji); odsłona bez animacji → A4.

#### Stój! (`stoj`), 02-07-FINDINGS.md
- **Wygląd:** ok. 540 px; bodziec bez przejścia, `success` / `warning` w swoich rolach z ikoną i tekstem; `accent-fg` → U29 (SJ1).
- **Teksty:** `Stats` z „Do końca” (§6); ekran końcowy `Results` → U10.
- **Animacje:** `tile-miss` + 60 przy czerwonym, trafienie bez wibracji; pomiar → U28 (SJ2).

#### Śledzenie (`sledzenie`), 02-10-FINDINGS.md
- **Wygląd:** ok. 570 px; cele tylko kolorem → U6 (SL1); dotyk między bliskimi kulkami → U4 (SL2).
- **Teksty:** bez rozbieżności.
- **Animacje:** ruch z rAF (§6), bez komentarza i kategorii → U18 (SL3); 60 przy pomyłce.

#### Wieża (`wieza`), 02-10-FINDINGS.md
- **Wygląd:** ok. 578 px, widok zjeżdża bez przewijania strony; podgląd `rounded-sm` → U22 (WZ3).
- **Teksty:** „odcięte” / „ucięte” → U30 (WZ4).
- **Animacje:** jazda z rAF (§6), bez kategorii → U18 (WZ5); werdykt przy reduced motion → U27 (WZ1); pomiar → U28 (WZ2); `piece-fall` → U17; `tile-hit` przy idealnym (wariant dominujący); 60 przy pudle.

#### Rytm (`rytm`), 02-07-FINDINGS.md
- **Wygląd:** ok. 522 px, pole `onPointerDown` tylko w fazie stukania. Zgodne.
- **Teksty:** liczby → U12 (RY1); brak licznika (§6). Ekran końcowy z kaflem ze stanu lokalnego: F1:Z16.
- **Animacje:** błysk 100 ms bez przejścia, pomiar z `e.timeStamp` zgodny; pasek 10 s → U18 (RY2); wibracja 30 (§6) bez wiersza w tabeli RY3 (tabela niżej).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| RY3 | `Rytm.tsx:70`; `ZASADY.md` §5 tabela wibracji; `ZASADY-GIER.md` :317 | `ZASADY.md` §5, D-13 (luka między źródłami) | niska | wiersz „uderzenie metronomu w Rytmie (część bodźca): 30” albo przypis pod tabelą |

#### Inny element (`inny`), 02-08-FINDINGS.md
- **Wygląd:** 432 px; komórka 6×6 dokładnie 48 px (zgodne, bez zapasu); siatka → U34 (QZ2); figury (§6).
- **Teksty:** komórki bez nazwy → U23 (IN1); forma „Dotknij symbol” IN2 (tabela niżej).
- **Animacje:** z `Quiz.tsx`; QZ3 dotyka tę grę najmocniej (siatka zmienia rozmiar).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| IN2 | `Inny.tsx:49` | `ZASADY.md` §4 „Teksty po polsku” | niska | „Dotknij symbolu, który się różni” |

#### Obrót (`obrot`), 02-08-FINDINGS.md
- **Wygląd:** 412 px, figury SVG skalowane, „Ta sama” / „Lustro” 158 × 96 px; `rx` klocków → U22 (OB1).
- **Teksty:** podgląd małymi literami → U30 (OB2).
- **Animacje:** z `Quiz.tsx`.

#### Literówka (`literowka`), 02-08-FINDINGS.md
- **Wygląd:** 432 px; najdłuższe słowa (10 liter) ok. 120 px w kaflu 158 px; siatka → U34 (QZ2).
- **Teksty:** bez własnych rozbieżności (tylko `Quiz.tsx`: U10).
- **Animacje:** z `Quiz.tsx`.

#### Mapa (`mapa`), 02-09-FINDINGS.md
- **Wygląd:** ok. 589-613 px, kontur w proporcjach `MAPA_ASPECT`, `touch-none`, znacznik w kolorze gracza. Zgodne.
- **Teksty:** 4 znaki przy błędzie od 1000 km w `RoundTable` MP1 (tabela niżej); `time` → U36.
- **Animacje:** odsłona `stone-pop` → A4 (jedyna z animacją).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| MP1 `[zbiorcze: roundtable-szerokosc]` | `Mapa.tsx:109` (B-68) | W-07, `ZASADY.md` §4 (360×640) | niska | powyżej 999 zapis „1k” albo „999+” |

#### Przytrzymaj (`przytrzymaj`), 02-07-FINDINGS.md
- **Wygląd:** ok. 500 px; `onPointerDown` / `onPointerUp`, `setPointerCapture`, bez menu kontekstowego; tabela → U11 (PT1); progi → U35 (PT3).
- **Teksty:** liczby → U12 (PT2); jednostki → U30 (PT4); brak licznika (§6).
- **Animacje:** bez przejść, pomiar z `e.timeStamp`, odsłona 1,5 s (faza gry). Zgodne.

#### Balon (`balon`), 02-07-FINDINGS.md
- **Wygląd:** ok. 560 px; „Zgarnij” w kolorze gracza; tabela → U11 (BL1); kształt balonu (§6).
- **Teksty:** podpis → U13 (BL2); pole pompowania → U23 (BL3); en-dash → U33 (BL4).
- **Animacje:** pompowanie 100 ms, 60 przy pęknięciu zgodne; `float-up` ucinany BL5 (tabela niżej), przy reduced motion → U27.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| BL5 `[zbiorcze: animacja-ucieta]` | `Balon.tsx:16`, `:154-157` (`PAUSE_MS` 0,8 s, `float-up` 1,6 s) | `ZASADY.md` §5 tabela („pływająca liczba 1,6 s”) | niska | stan „ostatni wynik” niezależny od fazy albo krótsza animacja wpisana do tabeli |

#### W pamięci (`w-pamieci`), 02-10-FINDINGS.md
- **Wygląd:** bez klawiatury ok. 562 px; z klawiaturą na Androidzie → **U1 (WP5, dopisane w 02-11)**.
- **Teksty:** „Wyniki” → U9 (WP2); „Dobrze” w kaflu → A13 (WP4).
- **Animacje:** `stone-pop` 180 ms → U19 (WP1); koniec po pomyłce → A9 (WP3); 60 przy złej odpowiedzi.

#### Dziesiątki (`dziesiatki`), 02-08-FINDINGS.md
- **Wygląd:** 432 px, komórka 76 px, `touch-none`, `onPointerDown`; siatka → U34; zaznaczenie → A15 (DZ1, DZ2).
- **Teksty:** wyniki → U10 (QZ1).
- **Animacje:** `tile-hit` pary obejmuje też pojawienie nowych liczb (jedna animacja na sytuację, zgodne), `tile-miss` + 60, blokada 1 s (§6).

#### Tort (`tort`), 02-09-FINDINGS.md
- **Wygląd:** ok. 583-607 px; strefa łapania cięcia → U4 (TO1). „Pokrój” nieaktywny z podpisem „Zostało cięć: N”.
- **Teksty:** `time` → U36; „Idealnie!” (wariant dominujący).
- **Animacje:** odsłona 1,5 s bez animacji → A4. Bez wibracji.

#### Za zasłoną (`zaslona`), 02-07-FINDINGS.md
- **Wygląd:** mieści się (pole `flex-1`), `touch-none`, `onPointerDown`; `RoundTable` przy 8 rundach. Zgodne.
- **Teksty:** pole bez nazwy od 2. rundy → U23 (ZS1); legenda „ostrzegawczy” → U30 (B-69).
- **Animacje:** ruch kulki z rAF (§6); pomiar z `e.timeStamp`, pozycja z tego samego zegara; dotknięcie zignorowane bez znaku → A5 (ZS2).

#### Zakupy (`zakupy`), 02-08-FINDINGS.md
- **Wygląd:** ok. 414 px, półka 57 px; „Gotowe” na `onClick` → **ZK1 (wysoka, §2)**; podpis → U13 (ZK3); kto zaznaczył → U6 (ZK4); długi wynik w `Scores` ZK5 (tabela niżej); zaznaczenie → A15.
- **Teksty:** czas przez `tenth`, odmiana „błąd / błędy / błędów”; „Gotowe” w trzech rolach → A17.
- **Animacje:** pasek pokazu → U18 (ZK2). Bez wibracji (złe zaznaczenia liczy serwer na końcu).

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| ZK5 | `Zakupy.tsx:83` (`Scores`, `ui.tsx:148-152`) | `ZASADY.md` §4 (teksty krótkie, 360×640) | niska | w `Scores` „8 pkt · 12,3 s”, trafienia i błędy na półce albo w drugim wierszu |

#### Nożyczki (`nozyczki`), 02-09-FINDINGS.md
- **Wygląd:** ok. 591-615 px, kafel maleje, `touch-none`, `setPointerCapture`, linia podglądu w kolorze gracza. Zgodne.
- **Teksty:** „53,0% | 47,0%” mieści się; `time` → U36.
- **Animacje:** `shake` + 60 przy cięciu obok kształtu i za krótkim ruchu (wariant dominujący A5, wibracja do decyzji); odsłona → A4.

### 8.10 Państwa-miasta (`panstwa-miasta`), szczegóły: 02-06-FINDINGS.md
- **Wygląd:** **U1** (pisanie ok. 820 px, głosowanie ok. 770 px, znane z `DESIGN.md` §6); podsumowanie → U3; tabela głosowania PM2 (tabela niżej); komórka 44 px → U4 (PM3); role tokenów → U7 (PM4, PM5, PM9);
  zła litera tylko ramką → U6 (PM6); własne odpowiedzi 50% → U25 (PM7); tytuł i pasek bez koloru → U8 (PM8). Akcje w kolorze gracza, sześć `.field` 48 px.
- **Teksty:** „Czekamy na resztę”, „Dalej” w dwóch znaczeniach → U30 (PM10, PM12); „Dalej” w kolorze gracza → A11 (PM11). Punkty mono, `Scores`.
- **Animacje:** w pliku brak keyframes i przejść; wibracja nowej fazy → A10 (PM13); STOP od innego gracza → A7 (PM14). Szkic co 500 ms to logika.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| PM2 | `PanstwaMiasta.tsx:275-276` (`minWidth: players × 6rem`, `overflow-x-auto`, komentarz `:254`) | `ZASADY.md` §4 („bez poziomego przewijania; … nie ma stałych pikseli”) | średnia (strona się nie przewija, ale treść do głosu jest poza kaflem przy 4+ graczach) | przy 4+ graczach układ transponowany (gracz w wierszu, jedna kategoria naraz), bez `minWidth` |

### 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md
- **Wygląd:** stany kafli „losowo / na pewno / bez” zgodne z `DESIGN.md` §4, kafle 80 px, ± 48 px z `aria-label`, jeden `btn-primary` na ekranie; odznaka prostokątna (§6, promień → U22); przyklejony pasek TU6; tytuł TU8.
- **Teksty:** suma w kolumnie 56 px TU1; tabela w solo TU2; przyciski ± bez podpisu TU5; liczby → U12 (TU7); stan „bez” → U25 (TU4). Słowa „Dalej”, „Rewanż”, „Do lobby”, „Zakończ turniej” zgodne.
  Numeracja miejsc przy równej sumie: F1:Z18 (bez wpisu fazy 2).
- **Animacje:** przejścia → U15 (TU3); `title-pop` u mistrza → U17; punkty w odznakach bez `stone-pop` i bez „+1” (zgodne: punkty to nie wygrane); 40 na starcie każdej gry; przejścia między grami nie wibrują.

| Wpis | Miejsce | Źródło | Waga | Propozycja |
|---|---|---|---|---|
| TU1 | `Game.tsx:448` | `ZASADY.md` §4 (360×640), `DESIGN.md` §5 | niska | `w-16 whitespace-nowrap` albo „pkt” w nagłówku kolumny; do potwierdzenia |
| TU2 | `Game.tsx:426-453` wobec `Setup.tsx:115` | `DESIGN.md` §4 („stan pusty jednym zdaniem”) | niska | w solo bez tabeli albo „Rozegrane gry: N/M” |
| TU5 | `Setup.tsx:131-133`, `:143` | `DESIGN.md` §4 (nieaktywny z podpisem) | niska | zdanie przy granicy („Najmniej 3 gry”, „Więcej gier nie ma: reszta wykluczona”) |
| TU6 | `Setup.tsx:209-215` (`StartBar` w `Lobby.tsx:211` to już `StickyBar`) | `ZASADY.md` §4 („przy długiej treści `StickyBar`”, wspólne zamiast kopii) | niska | `StickyBar` z linią podsumowania (prop `note`) albo `StartBar` z `children` |
| TU8 | `Setup.tsx:111` wobec `Setup.tsx:29` | `DESIGN.md` §2 typografia, §5 („Podpis to `.label`”) | niska | kafel jak w `Setup`: ikona `Trophy`, „Turniej”, „1-6 osób” mono |

## 9. Załącznik: dowody i granice dowodu

- `02-01-CHECKS.md`: skrypt `checks.mjs` (scratchpad sesji, treść w załączniku A tam) po 51 plikach `.tsx` i `index.css`: kolory, akcent, zaokrąglenia i cienie, pola dotykowe, `onClick` / `touch-none`,
  stałe piksele, teksty, liczby, `aria`, `Intro`, keyframes i ich użycia, przejścia, timery, pomiar czasu, wibracje, reguła reduced motion. 515 trafień `plik:linia` z oceną wstępną; oceny ostateczne w planach.
- `02-02-BASELINE.md`: wzorce B-01..B-76 i lista kontrolna W-01..W-18 dla gier; polecenia dowodowe w załączniku A tam.
- `02-03..02-10-FINDINGS.md`: lektura plików w całości, rachunki wysokości z klas Tailwinda, tabele „Sytuacje” (źródło macierzy §4).
- Granice dowodu: wszystko statycznie (D-09), bez przeglądarki i bez serwerów dev; liczby wysokości mają błąd ok. ±30 px; wymiary czcionek z szacunku (Satoshi ok. 0,5-0,56 em, Geist Mono ok. 0,6 em).
  Reguła reduced motion sprawdzona z CSS, nie na urządzeniu. Czytniki ekranu nie testowane.

**Do potwierdzenia w przeglądarce (faza 4, Playwright 360×640, D-09):**
- wysokości z U1 (zwłaszcza Memory Średnia 651 px, Kalambury 677-725 px, Narysuj koło 683-707 px) i U3 (ekran po partii), KT10 (środek planszy Kampus Tour w fazach `buy`, `roll` z MPK i po partii);
- SZ1 i WP5 na Androidzie z otwartą klawiaturą (`interactive-widget=resizes-content`);
- HM-3 („Wszystkie (30)”), ST1 (podgląd Koloru liter), TU1 (suma punktów), kafelki „Jeszcze nie grane” i `TopGame` z `RoundTable` przy 10 rundach (`Records.tsx`), ZK5 (wiersz `Scores` w Zakupach);
- KT11 / KS3 (czytelność 7-8 px), KS1 (stuknięcie w wykres), GM-5 (`aria-label` na `span` w TalkBack / VoiceOver), SL1 (kontrast celów dla sześciu kolorów graczy);
- płynność ruchu z `requestAnimationFrame` na słabszym telefonie (Kubki przy 150 ms, Śledzenie w późnych rundach), błysk 100 ms w Rytmie i Przytrzymaj (60 / 120 Hz), wielkość błędu pomiaru U28.

## 10. Kryteria sukcesu i wymagania fazy 2 → sekcje

| Kryterium / wymaganie | Sekcja, która je spełnia |
|---|---|
| Kryterium 1. Każdy kolor spoza tokenów, czerwień zamiast koloru gracza, zaokrąglenia inne niż 20 / 10 px, z `plik:linia` | U5 (kolory spoza tokenów), U7 (token w cudzej roli), U29 (`accent-fg`), KT1 (akcent zamiast koloru gracza), U8 (pasek bez koloru gracza), U22 (zaokrąglenia), U21 (cienie); kolory treści gry w §6; dowód hurtowy 02-01-CHECKS.md §1-§3 |
| Kryterium 2. Pola poniżej 48 px, gry na czas bez `touch-none select-none` / `onPointerDown`, elementy psujące 360×640 | U4 (48 px), ZK1 (jedyne pole w pomiarze na `onClick`; każde inne pole gry na czas zgodne, punkt „Wygląd” każdej mini-gry w §8.9), U1, U3, KT10, HM-8, PM2, U34, ST1, TU1, ZK5 (360×640); wysokość każdej gry w §8 (statycznie) |
| Kryterium 3. Em-dash, kropka dziesiętna, inne słowa, liczby bez mono, niepełne `Intro`, braki `aria` | em-dash: brak w UI (U33: en-dash i „-” jako brak wartości); kropka dziesiętna: brak w tekstach (U31: zapis bez wspólnej funkcji); słowa: U9, U30, A17, KL4, IN2, ST2, tabela §4.9; liczby: U12; `Intro`: wszystkie 30 mini-gier kompletne (§8.9; KO4, U36, B-52); `aria`: U23 |
| Kryterium 4. Animacje spoza keyframes, czasy niezgodne z §5, ta sama sytuacja różnie, JS bez `reducedMotion`, animacje blokujące, pomiar zależny od animacji | U16 (Tailwind), U17 (keyframes spoza listy §5), U18, U19, U15 (czasy), §4 macierz i A1-A17 (ta sama sytuacja), U2 (blokujące), §6 i B-53 (JS bez `reducedMotion` jako treść gry; pozostałe animacje JS sprawdzają flagę: Chińczyk, Kampus Tour, Statki), U27, U32, KA2, KA3, QZ3, BL5; pomiar: nigdzie nie zależy od animacji (U28 tylko dokładność) |
| Kryterium 5. Wibracje o innym wzorze, dublowanie wibracji tury, wibracje przy trafieniu | wzory: tylko 40 / 60 / [60, 40, 60] poza 30 w Rytmie (§6, RY3); dublowania brak (`Game.tsx:35` jedyny, §3); wibracji przy trafieniu brak (§4.8); luki: A5, A6, A7, A10 |
| UI-01 (tokeny, kolor gracza, zaokrąglenia) | jak kryterium 1; U6 (kolor jako jedyny sygnał), U24, U25 (stany) |
| UI-02 (48 px, `touch-none select-none`, `onPointerDown`) | U4, ZK1, A15; §8.9 punkt „Wygląd” każdej mini-gry |
| UI-03 (360×640, bez poziomego przewijania i stałych pikseli) | U1, U3, KT10, HM-8, PM2, U34, KT11, KS3, SC2, ST1, TU1, ZK5; poziomego przewijania strony brak (§1) |
| UI-04 (polski, bez em-dashy, przecinek, te same słowa, mono `tabular-nums`) | U9, U30, U31, U33, U12, A17, KL4, IN2, ST2, §4.9 |
| UI-05 (`Intro` z `Preview` i trzema punktami, `aria-hidden`, `aria-label`) | §8.9 (30 mini-gier: komplet; typ wymusza punkty, B-72), KO4, U36, B-52, U23, U13 |
| ANIM-01 (keyframes z `index.css`, ta sama sytuacja = ta sama animacja, czasy z §5) | §4 (macierz, A1-A17), U16, U17, U18, U19, U15, U20, KA2, KA3, A16; propozycje dopisania §7 |
| ANIM-02 (`reducedMotion`, nieblokowanie, pomiar niezależny od animacji) | U2, B-53 i §6 (ruch jako treść gry), U27, U32, B-52, U28, ZK1; pomiar w każdej grze w §8.9 punkt „Animacje” |
| ANIM-03 (wibracje 40 / 60 / [60, 40, 60], bez dublowania tury, bez wibracji przy trafieniu) | §4.8 wiersze „pomyłka”, „zło od innego gracza”, „moja tura”; A5, A6, A7, A10, RY3; §6 (metronom 30) |

Nie sprawdzono: działania na urządzeniu (czytniki ekranu, klawiatura ekranowa, odświeżanie 120 Hz) i dokładnych wysokości w przeglądarce. Powód: audyt statyczny bez serwerów dev (D-09);
lista do sprawdzenia w §9. Każda gra z `GAMES` ma w §8 ocenę 360×640 (statycznie).

# 02-04 FINDINGS: Kampus Tour (plansza, nagłówek, animacje) i KampusSummary

**Data:** 2026-10-24
**Plan:** `.planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-04-PLAN.md`
**Pliki:** `apps/web/src/games/KampusTour.tsx` (1106 linii), `apps/web/src/games/KampusSummary.tsx` (207 linii); dla nagłówka także gałąź Kampus Tour w `apps/web/src/screens/Game.tsx:82-97`.
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI), decyzje D-01..D-13 (`02-CONTEXT.md`).
**Dowody:** wiersze z `02-01-CHECKS.md` (sekcje 1-15, wiersze `KampusTour.tsx` / `KampusSummary.tsx`), wzorce B-xx / W-xx z `02-02-BASELINE.md`.
**Metoda:** lektura kodu, grep. **360×640 sprawdzono statycznie** (D-09), bez przeglądarki i bez serwerów dev. Rachunek wysokości i szerokości poniżej.

## Rachunek sceny na 360×640 (statycznie)

Kampus Tour nie używa `Screen`: `main.landscape` (`KampusTour.tsx:717`, `index.css:177-191`) zajmuje cały ekran, a w pionie obraca się o 90°.
Scena ma stałą wysokość `STAGE_H` 390 px i szerokość 800-1000 px (`KampusTour.tsx:219-237`), całość jest skalowana `zoom`.

- Telefon 360×640 w pionie → po obrocie vw = 640, vh = 360; szerokość sceny = max(800, 640 · 390 / 360 = 693) = **800**, skala = min(640/800, 360/390) = **0,8**. Scena na ekranie: 640 × 312 px, bez przewijania w poziomie (`overflow-hidden` na `main`).
- Plansza: wnętrze sceny 800 − 2 · 84 (`px-21`) = 632 px, wysokość 390 − 16 = 374 px; `BOARD_WIDTH` = min(632, 374 · 13/7 = 694) = **632** px. Kolumna `1fr` = (632 − 11 · 3 − 6) / 13 = 45,6 px sceny, po `TILT_SCALE` 0,95 i skali 0,8 → **około 35 px na ekranie** (pole narożne około 52 px).
- Tekst na polach: `text-[9px]` / `text-[10px]` → około **6,8 / 7,6 px** na ekranie; `text-xs` w panelach graczy → 9,6 px.
- Nakładka środka: `CENTER_HEIGHT` = 632 · 0,27 = **170 px sceny**, `CENTER_WIDTH` = 455 px (`KampusTour.tsx:201-202`), `overflow-hidden` + `justify-center` (`:849`).
- Szerokości `w-[30rem]`, `w-72`, `w-80`, `w-[36rem]` okien są w jednostkach sceny (najwyżej 576 z 800 px), więc mieszczą się po skalowaniu.

## Kampus Tour: plansza i nagłówek (`kampus-tour`)

### Wygląd (UI-01, UI-02, UI-03)

**KT1. Pola wyboru „moich” pól w akcencie zamiast koloru gracza** (średnia)
- Gra / ekran: Kampus Tour, faza `sell` i `juwenalia`.
- `plik:linia`: `apps/web/src/games/KampusTour.tsx:785` (`sellable = (selling || festive) && owner === me`), `:802` (`outline-2 outline-accent`); dowód: `02-01-CHECKS.md` sekcja 2, wiersz `KampusTour.tsx:802`.
- Źródło: `ZASADY.md` §4 „Reguły: Kolor gracza, nie czerwień, dla wszystkiego, co jest moje”; `DESIGN.md` §5 „Akcent należy do platformy, kolor gracza do partii”.
- Opis: przy sprzedaży za długi i przy wyborze pola na Juwenalia własne pola do wybrania dostają obrys `accent`. Komentarz `:810` mówi „czerwień to akcent i dług”, ale Juwenalia to nie dług, a i przy sprzedaży to są „moje” pola do wybrania. Pole decyzji (`:811`) już używa koloru gracza.
- Propozycja: `outlineColor: color(me)` dla `sellable` (jak dla `deciding`); dług pokazuje tekst „Brakuje N zł” (`:949`).

**KT2. Kolory rogów planszy i znaczków spoza tokenów, dwie wartości tokenów wpisane na sztywno** (średnia) `[zbiorcze: kolor-spoza-tokenow]`
- `plik:linia`: `KampusTour.tsx:125` (`#ffb224`), `:128` (`#ff6369` = `warning`), `:134` (`#e879f9`), `:140` (`#3dd68c` = `success`); użyte też w znaczkach panelu `:747`, `:749` i w znaczniku Juwenaliów `:820`. Dowód: `02-01-CHECKS.md` sekcja 1, wiersze `:125`, `:128`, `:134`, `:140`.
- Źródło: `DESIGN.md` §2 (tokeny i role), §6 (wyjątek obejmuje tylko „grupy pól w Kampus Tour”), D-04.
- Opis: rogi (Początek, Kolokwium, Juwenalia, Bilet MPK) mają własne kolory, które są treścią planszy, ale nie są na liście §6. `success` w roli Biletu MPK to token w innej roli („trafienie”).
- Propozycja: rozszerzyć wyjątek `DESIGN.md` §6 do „pola planszy Kampus Tour (grupy i rogi)” albo zamienić `#ff6369` / `#3dd68c` na `var(--color-warning)` / `var(--color-success)` tylko tam, gdzie rola się zgadza (Kolokwium), a resztę zostawić jako kolor treści z jednym źródłem (`CORNERS`).

**KT3. Biała obwódka żetonów i zajętych postaci** (średnia) `[zbiorcze: kolor-spoza-tokenow]`
- `plik:linia`: `KampusTour.tsx:519` (`border-white`), `:1007` (`borderColor: "white"`); dowód: `02-01-CHECKS.md` sekcja 1, wiersz `:519`.
- Źródło: `ZASADY.md` §4 „Kolory tylko z tokenów”; `DESIGN.md` §2.
- Propozycja: `border-fg` / `var(--color-fg)` (`#ededef`), wygląd prawie ten sam.

**KT4. Pola planszy około 35 px** (średnia) `[zbiorcze: dotyk-48]`
- `plik:linia`: `KampusTour.tsx:796-801` (`button` pola, `min-h-0 min-w-0`), `:774` (siatka 13 fr); rachunek wyżej. Dowód: `02-01-CHECKS.md` sekcja 4, wiersz `:796`.
- Źródło: `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”; `AGENTS.md`. Wyjątek `DESIGN.md` §6 obejmuje tylko przyciski budowy 44 px.
- Opis: stuknięcie pola otwiera okienko i jest jedyną drogą wyboru pola przy sprzedaży, Juwenaliach i jeździe MPK. Na 360×640 pole ma około 35 × 35 px (sąsiednie pola stykają się z odstępem 3 px sceny), na większych telefonach do około 43 px.
- Propozycja: decyzja fazy 4: dopisać do `DESIGN.md` §6 „pola planszy Kampus Tour poniżej 48 px (plansza 12×6 w poziomie)” albo powiększyć planszę kosztem paneli graczy.

**KT5. Przycisk „Zamknij” okienka pola około 26 px** (średnia) `[zbiorcze: dotyk-48]`
- `plik:linia`: `KampusTour.tsx:659-661` (`-m-1 p-1`, ikona 18 px); dowód: `02-01-CHECKS.md` sekcja 5a, wiersz `:659`.
- Źródło: `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”.
- Opis: 18 + 2 · 4 = 26 px sceny, na ekranie około 21 px. Okienko można też zamknąć ponownym stuknięciem pola (`:814`), ale to niewidoczne.
- Propozycja: `size-12 grid place-items-center -m-3` (obszar 48 px przy tej samej ikonie).

**KT6. „Podsumowanie” 44 px poza wyjątkiem** (średnia) `[zbiorcze: dotyk-48]`
- `plik:linia`: `KampusTour.tsx:970` (`btn btn-ghost min-h-11`); dowód: `02-01-CHECKS.md` sekcja 4, wiersz `:970`.
- Źródło: `ZASADY.md` §4; `DESIGN.md` §6 dopuszcza 44 px tylko dla przycisków budowy.
- Propozycja: zwykłe `btn btn-ghost` (48 px) albo dopisać do wyjątku. „Pomiń” w rzędzie budowy (`:906`, `min-h-11`) należy do rzędu przycisków budowy, więc idzie na listę odstępstw.

**KT7. Cienie i poświaty poza oknami i pionkami** (niska) `[zbiorcze: cien]`
- `plik:linia`: `KampusTour.tsx:203` (`TILE_EDGE`, grubość pola), `:779` (cień planszy na „stole”), `:733` (poświata panelu gracza na turze), `:794` (poświata pola decyzji), `:756` (`drop-shadow` pływającej kwoty), `:832` (`drop-shadow` gwiazdki kompletu). Dowód: `02-01-CHECKS.md` sekcja 3, wiersze `:203`, `:733`, `:756`, `:779`, `:812`, `:832`.
- Źródło: `DESIGN.md` §2 „Cień mają tylko … okna i pionki w Kampus Tour oraz `set-glow`”.
- Opis: plansza 2.5D ma cienie pól i podstawy, a panel i pole decyzji poświatę w kolorze gracza. To spójny styl tej gry, ale szerszy niż wyjątek.
- Propozycja: rozszerzyć wyjątek `DESIGN.md` §6 na „plansza 2.5D (grubość pól, cień podstawy) i poświata gracza na turze”; `drop-shadow` kwoty i gwiazdki zostawić jako czytelność na planszy, z dopiskiem.

**KT8. Zaokrąglenia spoza skali 20 / 10 / 999 px** (niska) `[zbiorcze: promien]`
- `plik:linia`: `KampusTour.tsx:162` (`rounded-[3px]`), `:575` (`rounded-t-sm`), `:586` (`rounded-[1px]`), `:801` (`rounded-sm` pola), `:819` (`rounded-br-sm`); dowód: `02-01-CHECKS.md` sekcja 3.
- Źródło: `DESIGN.md` §2 „Zaokrąglenia”; `ZASADY.md` §4.
- Propozycja: dopisać do wyjątku Kampus Tour w `DESIGN.md` §6 „pola planszy 4 px (35 px pole nie zniesie 10 px)”, kwadraciki poziomów zostawić.

**KT9. Właściciel pola widoczny tylko kolorem** (średnia) `[zbiorcze: kolor-jedyny-sygnal]`
- `plik:linia`: `KampusTour.tsx:793` (pasek i obwódka w kolorze właściciela), `:837` (tylko `sr-only`).
- Źródło: `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem”.
- Opis: na planszy właściciela rozpoznaje się wyłącznie po kolorze (komplet ma jeszcze gwiazdkę, też w kolorze). Łagodzi to okienko pola z wierszem „Właściciel” (`:672-673`) i ikona postaci w panelu, ale nie na samej planszy.
- Propozycja: na dolnym pasku pola mała ikona postaci właściciela (te same `CHARACTER_ICONS`, co na żetonie) albo inicjał.

**KT10. Na środku planszy treść wyższa niż nakładka (ucinanie licznika i logu)** (wysoka, do potwierdzenia w przeglądarce)
- `plik:linia`: `KampusTour.tsx:848-849` (nakładka `CENTER_HEIGHT`, `overflow-hidden`, `justify-center`), treść `:850-973`; stałe `:201-202`.
- Źródło: `ZASADY.md` §4 „Ekran mieści się na 360×640”; `AGENTS.md` (360×640); D-07 (ekran gry nie mieści się).
- Opis (szacunek statyczny, wysokości linii Tailwinda): nakładka ma 170 px sceny. Faza `buy` u gracza na turze: wiersz rundy z paskiem czasu 20 + nagłówek 28 + rząd przycisków 48 + `buyInfo` (około 70 znaków 14 px w 439 px, dwie linie) 40 + log 3 × 16 + 4 odstępy po 6 + `p-2` 16 = **około 224 px**. Faza `roll`: około 178 px, z linią Biletu MPK około 204 px. Po końcu partii przy schowanym podsumowaniu: nagłówek, log, `actions` (z linią „… chce rewanżu”) i „Podsumowanie”: około 250 px. Przy `justify-center` nadmiar ucina się z obu stron, więc pierwszy znika wiersz „Runda N/20” z **paskiem limitu** (góra) i najstarsze wpisy logu (dół), a po partii mogą zostać ucięte przyciski „Rewanż” / „Podsumowanie”. Na telefonie 390×844 nakładka ma około 183 px, problem zostaje.
- Propozycja: sprawdzić w przeglądarce (faza 4); poprawka: log ograniczyć do 1-2 wpisów albo przenieść pod nagłówek z `line-clamp`, `buyInfo` skrócić do jednej linii, a wiersz rundy z licznikiem trzymać poza obszarem z `overflow-hidden` (np. stała góra nakładki).

**KT11. Tekst na planszy 7-8 px na 360×640** (niska)
- `plik:linia`: `KampusTour.tsx:553` (`text-[9px]`), `:597` (`text-[9px]` / `text-[10px]`), `:173` (znaczki `text-[9px]`), `:819` (`text-[10px]`).
- Źródło: `DESIGN.md` §2 „Typografia” (większość ekranu 14-16 px), `AGENTS.md` (ekran na 360×640).
- Opis: po skali 0,95 · 0,8 nazwy pól mają około 6,8-7,6 px, znaczki statusu około 7 px. Ekran się mieści, ale czytelność jest na granicy; pełna nazwa jest w okienku pola.
- Propozycja: do oceny w przeglądarce (faza 4); ewentualnie krótsze podpisy i większy krój tylko dla ceny.

**Nagłówek własny wobec wspólnego (`ZASADY.md` §4 „Własny nagłówek … przejmuje cały jego zakres”)**

| Element wspólnego nagłówka (`Game.tsx`) | Kampus Tour | Ocena |
|---|---|---|
| „Twój ruch” / „Ruch: <nick>” w kolorze gracza | „Twoja tura” / „Tura: <nick>”, cały nagłówek w kolorze gracza na turze z żetonem (`KampusTour.tsx:401-409`, `:857-860`) | kolor zgodny; słowa inne (KT13) |
| pasek czasu w kolorze gracza z ruchem | `Countdown` bez `color` (`Game.tsx:93`) → pasek `fg-muted` | KT12 |
| „Czekamy na: …” przy kilku osobach | wybór postaci: „Czekamy na wybór postaci” + „Wybierają: …” (`:989`, `:1018-1021`); inne fazy mają jedną osobę | zgodny co do treści |
| „Wygrywasz!” | „Wygrywasz!” / „Wygrywasz przez monopol!” (`:403`), bez koloru zwycięzcy i bez `title-pop` | KA6 |
| gracze z liczbą wygranych (puchar, „wygrane”, „+1”) | panele w rogach: nick, „(ty)”, gotówka, majątek, pola, znaczki; **bez wygranych partii** | KT14 |
| „Oglądasz” | brak | KT14 |
| komunikat o rozłączeniu (ja) | „Łączenie ponownie…” w `accent-soft` z ikoną, `role="status"` (`:861-866`) | zgodny (B-55) |
| „Rewanż”, „Do lobby” | `OverActions` z `Game.tsx:94` na środku planszy i w podsumowaniu | zgodny (słowa), zob. KS2 |

**KT12. Pasek limitu tury nie jest w kolorze gracza** (średnia)
- `plik:linia`: `apps/web/src/screens/Game.tsx:93` (`<Countdown game={game} total={def.turnSeconds} />` bez `color`), wynik w `Game.tsx:596-597` (`bg-fg-muted`).
- Źródło: `ZASADY.md` §4 „pasek czasu w kolorze gracza z ruchem”; `DESIGN.md` §3.4.
- Propozycja: przekazać `color={turnColor}` (już wyliczony w `Game.tsx` przed gałęzią Kampus Tour).

**KT13. Słowa statusu inne niż we wspólnym nagłówku** (średnia) `[zbiorcze: slowa]`
- `plik:linia`: `KampusTour.tsx:406` („Koniec gry”), `:408` („Twoja tura”), `:409` („Tura: …”); wspólne: `Game.tsx:186-205` („Twój ruch”, „Ruch: …”, „Remis” / „Koniec”).
- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach”.
- Propozycja: „Twój ruch”, „Ruch: <nick>”, a bez zwycięzcy „Remis” (walkower bez rankingu: „Koniec”).

**KT14. Własny nagłówek nie pokazuje wygranych partii ani „Oglądasz”** (średnia)
- `plik:linia`: panele `KampusTour.tsx:722-765` (brak `view.scores`; `KampusTour` nie dostaje ani wyników pokoju, ani informacji, czy gracz siedzi przy stole: `Game.tsx:85-95`).
- Źródło: `ZASADY.md` §4 „Czego gra nie rysuje sama” + „Własny nagłówek … przejmuje cały jego zakres”.
- Opis: w serii partii nie widać, kto ile wygrał, a obserwator widzi „Tura: X” bez informacji, że tylko ogląda.
- Propozycja: przekazać `scores` i `seated` do `KampusTour`; liczba wygranych z pucharem w panelu gracza (z „+1” `float-up` po partii) i „Oglądasz” pod nagłówkiem środka.

**Zgodne (bez wpisu):** akcje w partii przez `style={mine}` + `btn` (tło w kolorze gracza, tekst `bg`, `:382`, `:872`, `:882`, `:897`, `:913`, `:1043`, `:1096`, W-05); żaden `btn-primary` w pliku gry (`02-01-CHECKS.md` sekcja 2); „Pomiń” jako `btn-ghost`; `bg-accent-soft` przy rozłączeniu w roli z `DESIGN.md` §2 (`:862`); karta Dziekanatu w `fg`, ostrzeżenie o monopolu w kolorze gracza (`:1075`); pływające kwoty `success` / `warning` mają znak +/−, więc kolor nie jest jedynym sygnałem (`:757`, `:760`); bankrut: krycie 40% + „bankrut” + przekreślenie (`:731`, `:736`, `:740`), czyli stan z podpisem; pola niewybieralne `opacity-40` z podpisem na środku (`:803`, `:926`, `:938`, `:949`); `onClick` zamiast `onPointerDown` i brak `touch-none select-none` zgodne, bo Kampus Tour to gra turowa bez pomiaru czasu (`02-01-CHECKS.md` sekcja 5, W-13 nie dotyczy); przycisk postaci ma okrąg 56 px (`:1004`); brak SVG; przewijania w poziomie brak (rachunek sceny).

### Teksty, liczby i dostępność (UI-04, UI-05)

**KT15. „OK” zamiast wspólnego słowa** (średnia) `[zbiorcze: slowa]`
- `plik:linia`: `KampusTour.tsx:1044` (karta Dziekanatu), `:1097` (groźba monopolu); dowód: `02-01-CHECKS.md` sekcja 7, wiersze `:1044`, `:1097`.
- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach („Start”, „Dalej”, …)”.
- Propozycja: „Dalej” w obu oknach.

**KT16. Liczby bez mono albo bez `tabular-nums`** (niska) `[zbiorcze: liczby-mono]`
- `plik:linia`: `KampusTour.tsx:151` (`zl`: mono bez `tabular-nums`, używane w panelach i na polach), `:901-903` (koszt i czynsz w przycisku budowy, Satoshi), `:503` (`buyInfo`, Satoshi), `:949` („Brakuje N zł”), `:1092` („{mine}/{total}”), log `:963`. Dowód: `02-01-CHECKS.md` sekcja 8, wiersze `:740`, `:901`, `:1091`.
- Źródło: `ZASADY.md` §4 „Liczby … czcionką mono z `tabular-nums`”; `DESIGN.md` §5.
- Propozycja: `tabular-nums` w `zl` i `zl()` w przycisku budowy oraz w `buyInfo`; w zdaniach logu można zostawić Satoshi (decyzja fazy 4, czy reguła obejmuje liczby w zdaniach).

**KT17. Podpisy bloków w pogrubionym Satoshi zamiast `.label`** (niska) `[zbiorcze: podpis-label]`
- `plik:linia`: `KampusTour.tsx:1037` („Karta Dziekanatu · nick”, `text-xs font-semibold uppercase`), `:1077` („Groźba monopolu”), etykiety wierszy okienka pola `:668` (`dt` w Satoshi `fg-muted`).
- Źródło: `DESIGN.md` §5 „Podpis to `.label` … nigdy pogrubiony Satoshi” (W-17).
- Propozycja: `.label` (dla pasków na kolorze z `text-bg` zamiast `fg-muted`), `dt` jako `.label`.

**KT18. Dostępność: ikony i etykiety** (niska) `[zbiorcze: aria-hidden]`
- `plik:linia`: `KampusTour.tsx:660` (`<X>` bez `aria-hidden`; przycisk ma `aria-label`, więc tylko porządek), `:285` (`aria-label` kostek na zwykłym `span` bez `role`, czytniki go pomijają), `:819-821` (znacznik Juwenaliów: `aria-label` na `span` bez `role`). Dowód: `02-01-CHECKS.md` sekcja 9, wiersz `:660`.
- Źródło: `ZASADY.md` §4 „Elementy ozdobne mają `aria-hidden`”.
- Propozycja: `aria-hidden` na `X`, `role="img"` przy kostkach i znaczniku Juwenaliów (jak żeton `:517`).

**KT19. Waga ikony w małej akcji** (niska) `[zbiorcze: waga-ikon]`
- `plik:linia`: `KampusTour.tsx:660` (`X` 18 px w wadze `regular`).
- Źródło: `DESIGN.md` §2 „`bold` w małych akcjach (16-18 px)”.
- Propozycja: `weight="bold"`.

**Zgodne:** brak em-dashy i kropek dziesiętnych (kwoty całkowite; `02-01-CHECKS.md` sekcja 7); „(ty)” w panelu i okienku (`:738`, `:673`); „Łączenie ponownie…” i „… rzuca kośćmi…”, „… czyta kartę…” jako czasownik z wielokropkiem; `−` (U+2212) w kwocie ujemnej to znak minus, nie myślnik; „Runda N/20” jako `.label` (`:851`); `Intro` nie dotyczy (gra główna), ekran przed partią to `Setup.tsx` (plan 02-03); okna mają `role="dialog"` / `role="alertdialog"` z `aria-label`; pola planszy mają `aria-label` z nazwą i `aria-pressed`; żeton `role="img"` z nickiem.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

Szczegóły ruchu pionka, kości i kwot w sekcji „Kampus Tour: animacje”. W tej części: elementy planszy i nagłówka.

| Użycie | `plik:linia` | Keyframes / mechanizm, czas | Tabela §5 | Ocena |
|---|---|---|---|---|
| świeży komplet | `KampusTour.tsx:803` | `set-glow` 0,9 s × 4 | brak czasu w tabeli | zgodny z B-35; brak w tabeli: odsyłacz do B-35 `[zbiorcze: brak-w-tabeli-5]` |
| pole decyzji unosi się, pola niewybieralne gasną | `KampusTour.tsx:801` | `transition-[opacity,translate]` 150 ms (domyślny Tailwinda) | przejście stanu 180 ms | KT20 |
| okienko pola | `KampusTour.tsx:649-652` | bez animacji | pojawienie 350 ms | KT21 |
| pasek limitu | `Game.tsx:596` | `transition-[width]` 300 ms, `animate-pulse` w ostatnich 10 s | - | ocenia plan `Game.tsx` (B-50 `[zbiorcze: animate-tailwind]`) |
| moja tura | `Game.tsx:35` | `navigator.vibrate?.(40)` | 40, tylko `Game.tsx` | zgodny; `KampusTour.tsx` nie wibruje (brak duplikatu) |

**KT20. Przejście pola 150 ms zamiast 180 ms** (niska) `[zbiorcze: transition-domyslny]`
- `plik:linia`: `KampusTour.tsx:801`; dowód: `02-01-CHECKS.md` sekcja 12, wiersz `:801`.
- Źródło: `ZASADY.md` §5 tabela „przycisk, przejście stanu 180 ms”; odpowiednik B-62.
- Propozycja: `duration-180`.

**KT21. Okienko pola bez animacji pojawienia** (niska)
- `plik:linia`: `KampusTour.tsx:649-652` (okienko), wobec `card-in` w pozostałych oknach `:987`, `:1033`, `:1073`.
- Źródło: `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”, tabela „pojawienie się elementu lub karty 350 ms”.
- Opis: okienko pola jest odpowiedzią na dotknięcie, więc natychmiastowe pojawienie jest do obrony; mimo to to jedyne okno w grze bez `card-in`.
- Propozycja: decyzja fazy 4: `card-in` 0,35 s albo dopisać, że okno otwierane dotknięciem pojawia się od razu.

### Sytuacje (D-12): plansza i nagłówek

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| pojawienie elementu (okienko pola) | brak (KT21) | brak | „Sprzedaj za N zł”, „Juwenalia tutaj (×N)”, „Jedź tutaj MPK” |
| pojawienie okna (wybór postaci, karta, groźba monopolu) | `card-in` 0,35 s `ease-out` | brak | „OK” (KT15) |
| zakup / budowa pola | brak (pasek właściciela i kwadraciki poziomów od razu po dojściu pionka) | brak | „Kup … za N zł”, „Poziom N” / „Landmark”, „Pomiń” |
| świeże osiągnięcie (komplet grupy) | `set-glow` 0,9 s × 4 | brak | - |
| moja tura | brak animacji; nagłówek i poświata `--ambient` w moim kolorze | 40 (`Game.tsx:35`) | „Rzuć kośćmi” / „Rzuć (potrzebny dublet)” / „Rzuć (użyjesz Zaliczenia)” |
| koniec rundy | brak (zmienia się „Runda N/20”) | brak | - |
| trafienie, pomyłka, odsłona wyniku | nie występuje | - | - |

## Kampus Tour: animacje (`kampus-tour`)

### Wygląd (UI-01, UI-02, UI-03)

Bez nowych rozbieżności wyglądu w elementach animowanych poza opisanymi w sekcji „plansza i nagłówek”: kości 44 px (`KampusTour.tsx:291`) w `fg` z `aria-hidden`; pływające kwoty w `success` / `warning` ze znakiem (zgodne, `:757`); poświata pola decyzji i panelu na turze w kolorze gracza (kolor zgodny, cień w KT7); `set-glow` w kolorze właściciela przez `--glow` (`:808`, kolor gracza zgodny z `ZASADY.md` §4).

### Teksty, liczby i dostępność (UI-04, UI-05)

Bez rozbieżności poza KT16 (kwota `float-up` przez `zl`, mono bez `tabular-nums`, `:760`). Kwota pływająca ma `aria-hidden` (`:758`), a ta sama zmiana jest w panelu gracza; kości mają opis w `aria-label` (z uwagą KT18).

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

Ocena każdego timera i każdej animacji z pliku (`02-01-CHECKS.md` sekcje 11a, 13):

| Mechanizm | `plik:linia` | Czas / wzór | `reducedMotion` | Ocena |
|---|---|---|---|---|
| `STEP_MS`, `ROLL_MS` na górze pliku | `KampusTour.tsx:206-207` | 220 ms / pole, 700 ms | - | zgodny z §5 „Kroki sekwencyjne” i tabelą (180-220 ms, 700 ms) |
| `useWalk`: stan pokazywany goni docelowy w `setTimeout` | `KampusTour.tsx:239-257`, timer `:247` | 220 ms na pole, wszystkie zaległe pionki naraz | tak: `:246` od razu `setShown(target)` | zgodny ze wzorem `Chinczyk.tsx:79-95`; duży skok (`far`: brak pozycji albo ponad 12 pól naprzód, w tym każdy ruch wstecz) ląduje od razu (`:245-246`); nowy stan z serwera zmienia cel i krok liczy się od pokazanej pozycji (deps `:255`), cleanup czyści timer (`:254`) |
| `useRolling` | `KampusTour.tsx:260-273`, timer `:269` | 700 ms po każdej zmianie pozycji | tak: `:267` | czas zgodny; wyzwalacz: KA2 |
| `Dice`: losowe oczka w trakcie turlania | `KampusTour.tsx:276-301`, `setInterval` `:280` | co 90 ms, tylko gdy `rolling` | pośrednio: przy reduced-motion `rolling` nigdy nie jest `true` | zgodny; `Math.random` tylko w kosmetyce klienta, wynik zawsze z serwera (`values`) |
| `dice-tumble` | `KampusTour.tsx:293-294` | pętla 0,3 s przez `ROLL_MS`, druga kość z opóźnieniem 80 ms | reguła CSS (B-51) | zgodny z B-42; dodatnie opóźnienie to rozstrzał dwóch kości, nie kolejność podglądu (zgodne) |
| `useFloats` + `float-up` | `KampusTour.tsx:304-318`, timer `:315`, animacja `:756` | 1,6 s, usuwanie po 1,7 s | reguła CSS | czas zgodny z B-44; brak cleanupu opisany komentarzem `:314` (świadome, zgodne); reduced-motion: KA5 |
| `set-glow` | `KampusTour.tsx:803` | 0,9 s × 4 | reguła CSS | B-35 |
| `card-in` | `KampusTour.tsx:987`, `:1033`, `:1073` | 0,35 s `ease-out` | reguła CSS | zgodny z B-43 |
| `transition-[opacity,translate]` | `KampusTour.tsx:801` | 150 ms | reguła CSS | KT20 |
| `navigator.vibrate` | brak w `KampusTour.tsx` | - | - | brak duplikatu wibracji tury (zgodne); brak wibracji przy złym zdarzeniu od rywala: KA4 |
| pomiar czasu | brak (`02-01-CHECKS.md` sekcja 14: 0 trafień) | - | - | nie dotyczy |

**KA1. Przyciski decyzji ukryte do końca rzutu i marszu pionka** (wysoka, do decyzji: kandydat na wyjątek w `ZASADY.md` §5)
- `plik:linia`: `KampusTour.tsx:350-352` (`settled`), bramki `:394-395`, `:457`, `:870-944` (wszystkie przyciski akcji pod `settled &&`), `:1028` (karta Dziekanatu), `:1054` (podsumowanie); komentarz `:351` „żeby nie zdradzać wyniku przed animacją”.
- Źródło: `ZASADY.md` §5 „Animacja nie blokuje gry. Przyciski działają w trakcie” (jedyny wyjątek: Statki, `SWAP_MS`); D-07 „animacja blokująca ruch” = wysoka.
- Opis: po rzucie przez 700 ms turlania i do 12 · 220 = 2640 ms marszu nie widać żadnej akcji (razem do około 3,3 s na rzut, po dublecie znowu). Limit tury na serwerze w tym czasie biegnie (60 s, więc bez realnej straty). Zamysł jest uzasadniony (nie zdradzać pola przed dojściem pionka), ale reguła go nie przewiduje.
- Propozycja: decyzja fazy 4: dopisać do `ZASADY.md` §5 wyjątek „Kampus Tour ukrywa decyzje do dojścia pionka (najwyżej `ROLL_MS` + 12 · `STEP_MS`)” obok wyjątku Statków; albo pokazywać przyciski od razu i skrócić marsz. Po dopisaniu wpis przechodzi na listę odstępstw.

**KA2. Turlanie kości po każdej zmianie pozycji, także bez rzutu** (średnia)
- `plik:linia`: `KampusTour.tsx:260-271` (klucz `JSON.stringify(positions)`, `:261`), wobec `Chinczyk.tsx:57-69` (klucz: wartość rzutu). Zmiany pozycji bez rzutu w zasadach: karta „Spóźnienie” i trzeci dublet (`packages/games/src/kampus-tour.ts:388-392`, `toKolokwium`), karty „idź do” / „cofnij się” / „najbliższe pole usługowe” (`kampus-tour.ts:436-441`).
- Źródło: `ZASADY.md` §5 „Animacja ma pokazać, co się właśnie stało”, `dice-tumble` = „rzut kośćmi”, wzór kroków `Chinczyk.tsx`.
- Opis: po karcie, która przesuwa pionek, kości turlają się 700 ms z losowymi oczkami i lądują na starym wyniku, choć nikt nie rzucał. Jazda MPK losuje oczka na serwerze (do czynszu za Ksero i Stołówkę, `kampus-tour.ts:565`), więc tam turlanie ma sens.
- Propozycja: wyzwalać `useRolling` zmianą `view.dice` albo zdarzeniem rzutu (jak `last?.roll` w Chińczyku), a nie pozycją.

**KA3. Przeskok na Kolokwium i jazda kartą raz krokami, raz od razu** (średnia)
- `plik:linia`: `KampusTour.tsx:245` (`far`: ponad 12 pól naprzód albo wstecz → od razu), wobec zasad `kampus-tour.ts:391` (pozycja Kolokwium ustawiona wprost), `:569` (MPK wprost), `:436`, `:441`.
- Źródło: `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”; D-07 (średnia: ta sama sytuacja animowana różnie).
- Opis: pionek wysłany na Kolokwium z pola do 12 pól przed nim idzie tam krok po kroku jak po rzucie (wygląda, jakby wyrzucił), a z dalszego pola pojawia się od razu. Tak samo jazda MPK i karty „idź do”: krótki dystans to marsz, długi to przeskok. Ruch wstecz („cofnij się o N”) zawsze przeskakuje.
- Propozycja: przeskok bez kroków dla każdego ruchu, który nie wynika z rzutu (Kolokwium, MPK, karty), np. zdarzenie `kolokwium` / `travel` / `card` w logu jako sygnał „od razu”; marsz tylko po rzucie.

**KA4. Brak wibracji przy złym zdarzeniu od rywala** (średnia, do decyzji)
- `plik:linia`: brak `navigator.vibrate` w `KampusTour.tsx`; zdarzenie `buyout` z `to === me` (`KampusTour.tsx:448-449`) oznacza, że rywal wykupił moje pole.
- Źródło: `ZASADY.md` §5 tabela wibracji „coś złego dla mnie od innego gracza (zbity pionek): [60, 40, 60]”.
- Opis: wykupienie mojego pola to dokładny odpowiednik zbicia w Chińczyku (`Chinczyk.tsx:135`), a telefon milczy. Czynsz płacony rywalowi to skutek mojego rzutu, więc nie podpada.
- Propozycja: `navigator.vibrate?.([60, 40, 60])` przy nowym zdarzeniu `buyout` z `to === me` (po `settled`, żeby nie wyprzedzić pionka); decyzja fazy 4, czy dopisać „wykupienie pola” jako przykład w tabeli §5.

**KA5. Przy reduced-motion pływająca kwota w ogóle nie jest widoczna** (niska) `[zbiorcze: float-up-reduced]`
- `plik:linia`: `KampusTour.tsx:756` (`float-up … forwards`), `index.css:288-300` (klatka końcowa `opacity: 0`), reguła `index.css:360-368` (0,01 ms).
- Źródło: `ZASADY.md` §5 „przeskakuje do stanu końcowego”; B-51 (animacje z `forwards` od razu w stanie końcowym).
- Opis: stan końcowy `float-up` jest niewidoczny, więc przy ograniczonym ruchu „+40 zł” / „−12 zł” znika, zanim się pojawi. Ten sam skutek ma „+1” w `ui.tsx:132` i `Game.tsx:311` oraz `Balon.tsx:157`, `Wieza.tsx:162`. W Kampus Tour gotówka w panelu i log niosą tę samą informację, więc skutek jest mały.
- Propozycja: w regule reduced-motion zostawić `float-up` jako krótkie pokazanie bez ruchu (np. osobna reguła `@media` z samym `opacity`), albo przyjąć to świadomie w `ZASADY.md` §5.

**KA6. Koniec partii bez `title-pop` i bez koloru zwycięzcy** (średnia) `[zbiorcze: koniec-partii]`
- `plik:linia`: `KampusTour.tsx:857` (`style={over ? undefined : …}`), tytuł podsumowania `KampusSummary.tsx:43`; wspólny wzór `Game.tsx:243-244` (`title-pop` 0,5 s u zwycięzcy, kolor zwycięzcy).
- Źródło: `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”; `ZASADY.md` §4 (własny nagłówek przejmuje cały zakres).
- Propozycja: w nagłówku i tytule podsumowania kolor zwycięzcy, a u zwycięzcy `title-pop` (czas zgodnie z decyzją B-41).

**Odpowiedzi na pytania planu:** stan pokazywany goni docelowy zgodnie z wzorem (`useWalk`); `reducedMotion` i `far` lądują od razu; kości `dice-tumble` przez 700 ms; `float-up` 1,6 s; `card-in` 0,35 s w każdym oknie poza okienkiem pola (KT21); Bilet MPK i Kolokwium: przeskok tylko powyżej 12 pól (KA3) i z fałszywym turlaniem przy kartach (KA2); przyciski w trakcie kroków nie działają, bo ich nie ma (KA1).

### Sytuacje (D-12): ruch i kości

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| rzut kośćmi | `dice-tumble` 0,3 s w pętli przez `ROLL_MS` 700 ms, oczka losowane co 90 ms | brak | „Rzuć kośćmi” |
| krok pionka | `setTimeout` `STEP_MS` 220 ms na pole (pozycja przeskakuje pole po polu, bez keyframes) | brak | brak przycisków w trakcie (KA1) |
| duży skok / odświeżenie / reduced-motion | od razu na miejscu | brak | - |
| przeskok bez rzutu (Kolokwium, MPK, karta) | turlanie 700 ms (KA2) + marsz do 12 pól albo od razu (KA3) | brak | „Jedź tutaj MPK”, „OK” |
| zmiana gotówki | `float-up` 1,6 s `ease-out` | brak | - |
| odpowiednik zbicia (rywal wykupuje moje pole) | tylko `float-up` kwoty | brak (KA4) | „Wykup … za N zł”, „Pomiń” (u wykupującego) |
| bankructwo | panel przygasa 40% bez przejścia | brak | - |
| koniec partii | podsumowanie `card-in` 0,35 s; bez `title-pop` (KA6) | brak | „Rewanż”, „Do lobby”, „Plansza”, „Podsumowanie” |

## KampusSummary

### Wygląd (UI-01, UI-02, UI-03)

**KS1. Wartości wykresu po stuknięciu znikają po podniesieniu palca** (niska, do potwierdzenia w przeglądarce)
- `plik:linia`: `apps/web/src/games/KampusSummary.tsx:133-140` (`onPointerMove`, `onPointerLeave`).
- Źródło: `DESIGN.md` §4 (stan musi być czytelny), komentarz `:88` „stuknięcie pokazuje wartości”.
- Opis: na dotyku samo stuknięcie zwykle nie wysyła `pointermove`, a `pointerleave` przychodzi zaraz po `pointerup`, więc linia z wartościami pokazuje się tylko w trakcie przesuwania palca i gaśnie po jego podniesieniu.
- Propozycja: obsłużyć `onPointerDown` (ustawić `hover`) i nie czyścić `hover` w `pointerleave` dla `pointerType === "touch"`.

**KS2. Dwa zestawy „Rewanż” / „Do lobby” naraz** (niska)
- `plik:linia`: `KampusSummary.tsx:74` (`actions`) i `KampusTour.tsx:968` (te same `actions` na środku planszy pod nakładką `bg-bg/60 backdrop-blur-sm`, `KampusSummary.tsx:37`).
- Źródło: `DESIGN.md` §5 „Akcent jest rzadki” (jeden wypełniony przycisk akcentu na ekran).
- Opis: pod rozmytą nakładką widać drugi czerwony „Rewanż”; klikać go nie można (nakładka zasłania), ale na ekranie są dwa akcenty.
- Propozycja: na środku planszy renderować `actions` tylko przy `summaryHidden`.

**KS3. Mały tekst osi i legendy na 360×640** (niska)
- `plik:linia`: `KampusSummary.tsx:120` (`text-[11px]`), `:145`, `:150`, `:153` (`text-[9px]`), `:172` (`text-[10px]`), `:190` (`text-[11px]`).
- Źródło: `DESIGN.md` §2 „Typografia”; rachunek sceny (skala 0,8, wykres około 368 px sceny dla `viewBox` 360).
- Opis: liczby osi mają na ekranie około 7,4 px, nicki przy liniach około 8 px.
- Propozycja: do oceny w przeglądarce w fazie 4, razem z KT11.

**Zgodne (bez wpisu):** SVG z `viewBox` (`:129`, `02-01-CHECKS.md` sekcja 6), `w-full`, więc skaluje się do kafla; linie i kropki w kolorach graczy (`:162`, `:169`); legenda z nickami nad wykresem i nicki na końcach linii (`:119-127`, `:171-175`), więc kolor nie jest jedynym sygnałem; nick w statystykach w kolorze gracza i z nazwą (`:30-34`); `w-[36rem]` w jednostkach sceny (576 z 800 px, `02-01-CHECKS.md` sekcja 6, wiersz `:41`, mieści się); wysokość: tytuł 28 + legenda 16 + wykres około 153 + linia wartości 16 + akcje 48 + odstępy i `p-4` około 56 = około 320 z 390 px sceny (statycznie; przy zawiniętym „Czekamy na: …” w drugim wierszu akcji około 370 px, na granicy); cień pod oknem to wyjątek (lista odstępstw); `touch-none` na SVG (`:130`) zgodny, `onClick` „Plansza” (`:75`) zgodny (akcja bez pomiaru czasu, `02-01-CHECKS.md` sekcja 5a); jeden `btn-primary` w oknie („Rewanż” z `Game.tsx`), „Plansza” jako `btn-ghost`; brak kolorów spoza tokenów (`02-01-CHECKS.md` sekcja 1: 0 trafień).

### Teksty, liczby i dostępność (UI-04, UI-05)

**KS4. Kwoty w statystykach i linii wartości bez mono** (niska) `[zbiorcze: liczby-mono]`
- `plik:linia`: `KampusSummary.tsx:51` („{rent[1]} zł”), `:59`, `:67` (liczba dubletów), `:199` („{s.points[hover]} zł”); dowód: `02-01-CHECKS.md` sekcja 8, wiersze `:50`, `:66`.
- Źródło: `ZASADY.md` §4, `DESIGN.md` §5 „Liczby są mono”.
- Propozycja: `font-mono tabular-nums` na liczbach (albo `zl` z `KampusTour.tsx` przeniesione do wspólnego miejsca w pliku podsumowania).

**KS5. Etykiety statystyk w Satoshi zamiast `.label`** (niska) `[zbiorcze: podpis-label]`
- `plik:linia`: `KampusSummary.tsx:49`, `:57`, `:65` (`dt` `text-fg-muted`).
- Źródło: `DESIGN.md` §5 „etykieta liczby to małe wersaliki mono” (W-17).
- Propozycja: `dt className="label"`.

**KS6. Brak zdania przy pustych statystykach** (niska)
- `plik:linia`: `KampusSummary.tsx:46-71` (każda pozycja tylko przy wartości > 0, `:25-29`).
- Źródło: `DESIGN.md` §4 „stan pusty: jedno zdanie `fg-muted`”.
- Opis: w bardzo krótkiej partii (walkower po pierwszym rzucie) kolumna statystyk jest pusta, bez słowa.
- Propozycja: „Za krótka partia na ciekawostki.” w `fg-muted`, gdy `rent`, `tile` i `doubles` są puste.

**Zgodne:** brak em-dashy i kropek dziesiętnych (kwoty całkowite z „zł”, zgodnie z planem: przecinek nie występuje, bo nie ma ułamków); oś bez jednostki, ale `aria-label` wykresu podaje „zł” (`:132`); liczby osi w mono (`:145`); „zapłacił(a)” po polsku; `role="dialog"` z `aria-label` (`:39-40`); kropki i kreski legendy z `aria-hidden` (`:123`, `:198`); wykres `role="img"` z pełnym opisem wyników.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| Mechanizm | `plik:linia` | Ocena |
|---|---|---|
| `card-in` 0,35 s `ease-out` przy otwarciu | `KampusSummary.tsx:41` | zgodny z B-43 (okno na środku, 350 ms) |
| okno dopiero po dojściu pionka | `KampusTour.tsx:1054` (`over && settled`) | zgodny: wynik nie wyprzedza animacji ruchu |
| timery, rAF, `startViewTransition` | brak (`02-01-CHECKS.md` sekcja 13: 0 trafień) | nic do `reducedMotion` |
| `navigator.vibrate` | brak | zgodny (koniec partii nie ma wibracji w tabeli §5) |
| linia i kropki pod palcem | bez przejścia (`:177-187`) | zgodny (reakcja na dotyk natychmiast) |

Rozbieżność: tytuł bez koloru zwycięzcy i bez `title-pop`, opisana raz w KA6.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| koniec partii (pojawienie podsumowania) | `card-in` 0,35 s `ease-out` | brak | „Rewanż”, „Do lobby” (z `Game.tsx`), „Plansza” |
| odsłona wyniku (wartości rundy pod palcem) | brak animacji | brak | - |
| powrót do podsumowania z planszy | `card-in` 0,35 s (okno montuje się od nowa) | brak | „Podsumowanie” (`KampusTour.tsx:971`) |

## Odstępstwa z powodem (D-04, D-05; bez wagi)

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| własny układ poziomy na cały ekran (`.landscape`, scena ze `zoom`), bez `Screen` i `StickyBar` | `KampusTour.tsx:717-721`, `index.css:177-191` | `DESIGN.md` §6; B-34 |
| własny nagłówek (status, runda, licznik na środku, panele graczy z gotówką w rogach zamiast `Stats`) | `KampusTour.tsx:722-765`, `:850-860` | `ZASADY.md` §4 „Własny nagłówek ma tylko … Kampus Tour”; braki zakresu w KT12-KT14 |
| kolory grup pól | `KampusTour.tsx:84` (`GROUP_COLORS`, jedno źródło; ikona grupy odróżnia bez rozpoznawania barw, `:86`) | `DESIGN.md` §6 „grupy pól w Kampus Tour”; D-04 |
| cienie pod oknami | `KampusTour.tsx:650`, `:987`, `:1033`, `:1073`, `KampusSummary.tsx:41` | `DESIGN.md` §2, §6 |
| cień pod pionkami | `KampusTour.tsx:519` | `DESIGN.md` §2, §6 |
| przyciski budowy 44 px (z „Pomiń” w tym samym rzędzie) | `KampusTour.tsx:897`, `:906` | `DESIGN.md` §6 „przyciski budowy o wysokości 44 px” |
| cień w `set-glow` | `KampusTour.tsx:803` (przez `index.css:200`) | `DESIGN.md` §2 |
| obrys znaczków przez `box-shadow: inset 0 0 0 1px` | `KampusTour.tsx:174` | to obrys, nie cień (`02-01-CHECKS.md` sekcja 3) |
| kolory pochodne tokenów (`color-mix` z `fg` / `bg` / `surface`) | `KampusTour.tsx:89-90`, `:174`, `:778`, `:788`, `:801` | mieszanki tokenów, nie nowe kolory (D-04) |

## Zestawienie wpisów

| ID | Waga | Krótko | `plik:linia` | Klucz |
|---|---|---|---|---|
| KT10 | wysoka (do potwierdzenia) | treść środka planszy wyższa niż nakładka 170 px, ucina licznik, log i przyciski po partii | `KampusTour.tsx:848-849` | - |
| KA1 | wysoka (do decyzji) | przyciski ukryte do końca turlania i marszu (do 3,3 s) | `KampusTour.tsx:350-352`, `:870-944` | - |
| KT1 | średnia | wybór własnych pól (sprzedaż, Juwenalia) w akcencie | `KampusTour.tsx:802` | - |
| KT2 | średnia | kolory rogów spoza tokenów, `warning` / `success` wpisane na sztywno | `KampusTour.tsx:125-140` | `kolor-spoza-tokenow` |
| KT3 | średnia | biała obwódka żetonów | `KampusTour.tsx:519`, `:1007` | `kolor-spoza-tokenow` |
| KT4 | średnia | pola planszy około 35 px | `KampusTour.tsx:796` | `dotyk-48` |
| KT5 | średnia | „Zamknij” okienka około 26 px | `KampusTour.tsx:659` | `dotyk-48` |
| KT6 | średnia | „Podsumowanie” 44 px poza wyjątkiem | `KampusTour.tsx:970` | `dotyk-48` |
| KT9 | średnia | właściciel pola tylko kolorem | `KampusTour.tsx:793` | `kolor-jedyny-sygnal` |
| KT12 | średnia | pasek limitu nie w kolorze gracza | `Game.tsx:93` | - |
| KT13 | średnia | „Twoja tura”, „Tura:”, „Koniec gry” | `KampusTour.tsx:406-409` | `slowa` |
| KT14 | średnia | brak wygranych partii i „Oglądasz” | `KampusTour.tsx:722-765`, `Game.tsx:85-95` | - |
| KT15 | średnia | „OK” zamiast „Dalej” | `KampusTour.tsx:1044`, `:1097` | `slowa` |
| KA2 | średnia | turlanie kości po każdej zmianie pozycji | `KampusTour.tsx:261` | - |
| KA3 | średnia | przeskok bez rzutu raz krokami, raz od razu | `KampusTour.tsx:245` | - |
| KA4 | średnia | brak [60, 40, 60] przy wykupieniu mojego pola | `KampusTour.tsx` (brak `vibrate`) | - |
| KA6 | średnia | koniec partii bez `title-pop` i koloru zwycięzcy | `KampusTour.tsx:857`, `KampusSummary.tsx:43` | `koniec-partii` |
| KT7 | niska | cienie i poświaty planszy 2.5D poza wyjątkiem | `KampusTour.tsx:203`, `:733`, `:779`, `:794` | `cien` |
| KT8 | niska | zaokrąglenia 1-4 px | `KampusTour.tsx:162`, `:575`, `:586`, `:801`, `:819` | `promien` |
| KT11 | niska | tekst pól 7-8 px na 360×640 | `KampusTour.tsx:597` | - |
| KT16 | niska | liczby bez mono / `tabular-nums` | `KampusTour.tsx:151`, `:901` | `liczby-mono` |
| KT17 | niska | podpisy w pogrubionym Satoshi | `KampusTour.tsx:1037`, `:1077`, `:668` | `podpis-label` |
| KT18 | niska | `aria-hidden` / `role` przy ikonach i kostkach | `KampusTour.tsx:660`, `:285`, `:819` | `aria-hidden` |
| KT19 | niska | ikona `X` w wadze `regular` | `KampusTour.tsx:660` | `waga-ikon` |
| KT20 | niska | przejście pola 150 ms | `KampusTour.tsx:801` | `transition-domyslny` |
| KT21 | niska | okienko pola bez `card-in` | `KampusTour.tsx:649` | - |
| KA5 | niska | `float-up` niewidoczne przy reduced-motion | `KampusTour.tsx:756`, `index.css:360-368` | `float-up-reduced` |
| KS1 | niska | wartości wykresu gasną po podniesieniu palca | `KampusSummary.tsx:133-140` | - |
| KS2 | niska | dwa „Rewanż” naraz (jeden pod nakładką) | `KampusSummary.tsx:74`, `KampusTour.tsx:968` | - |
| KS3 | niska | tekst osi 7-8 px | `KampusSummary.tsx:145` | - |
| KS4 | niska | kwoty w statystykach bez mono | `KampusSummary.tsx:51`, `:199` | `liczby-mono` |
| KS5 | niska | etykiety statystyk poza `.label` | `KampusSummary.tsx:49` | `podpis-label` |
| KS6 | niska | brak zdania przy pustych statystykach | `KampusSummary.tsx:46-71` | - |

Razem: 2 wysokie, 15 średnich, 16 niskich.

## Do fazy 3 i 4

- **Faza 4 (decyzje):** KA1 (wyjątek „decyzje po dojściu pionka” w `ZASADY.md` §5 czy pokazywanie przycisków od razu), KT4 / KT6 (rozszerzenie wyjątku 44 px na pola planszy i „Podsumowanie”), KT2 / KT7 / KT8 (rozszerzenie `DESIGN.md` §6 o rogi planszy, cienie 2.5D i promień pól), KA4 (wykupienie pola jako „zło od innego gracza”), KA5 (zachowanie `float-up` przy reduced-motion), KT21 (okna otwierane dotknięciem bez `card-in`), KT16 (czy liczby w zdaniach logu muszą być mono).
- **Faza 4 (sprawdzenie w przeglądarce, D-09):** KT10 (ucinanie środka planszy w fazach `buy`, `roll` z MPK i po partii), KT11 / KS3 (czytelność 7-8 px), KS1 (stuknięcie w wykres), wysokość podsumowania z długim „Czekamy na: …”.
- **Faza 3 (balans):** nic nowego z wyglądu; uwaga z KA1: marsz do 3,3 s na rzut wydłuża partię 20 rund o kilka minut, co warto doliczyć do szacunku „około 45 minut” (`KONCEPT.md` §2.1).

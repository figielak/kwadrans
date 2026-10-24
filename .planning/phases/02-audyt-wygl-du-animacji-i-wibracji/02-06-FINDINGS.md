# 02-06 FINDINGS: fazy równoczesne i Turniej (Państwa-miasta, Kalambury, Turniej)

**Plan:** `02-06-PLAN.md` (fala 2). **Data:** 2026-10-24. **Gałąź:** `labirynt`.
**Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §1, §2, §4, §5, §6, `AGENTS.md` (twarde reguły UI), decyzje D-01..D-13 z `02-CONTEXT.md`.
**Dowody:** wiersze `02-01-CHECKS.md` (cytowane jako „CHECKS §n”) i punkty `02-02-BASELINE.md` (B-xx, W-xx).
**Pliki:** `apps/web/src/games/PanstwaMiasta.tsx` (355 linii), `apps/web/src/games/Kalambury.tsx` (388), `apps/web/src/screens/Setup.tsx` (`TournamentSetup`, :67-218),
`apps/web/src/screens/Game.tsx` (część turniejowa: :136-144, :164-165, :182-189, :234-239, :426-453, :540-566; reszta pliku i `Countdown` to plan 02-03).

**360×640 sprawdzono statycznie** (D-09): wysokości z klas Tailwinda (`Screen` `pt-6`/`pb-6` = 24 px, `gap-3` = 12 px, `.field`/`.btn` 48 px, `text-sm` 20 px linii,
`.label` około 16 px linii, `StickyBar` około 68 px), szerokość treści 328 px, Geist Mono około 0,6 em na znak. Bez przeglądarki i bez serwerów dev.
Szacunki mają błąd rzędu ±30 px; wpisy, w których to decyduje, mają dopisek „do potwierdzenia w przeglądarce”.

**Przyjęta wykładnia wagi 360×640** (D-07 nie rozróżnia ekranów): ekran, na którym gracz działa pod limitem (pisanie, głosowanie, zgadywanie, rysowanie),
gdy nie mieści się w 640 px, to **wysoka**; ekran podsumowania z akcją w `StickyBar` (przycisk zawsze pod kciukiem, treść tylko do przejrzenia) to **średnia**.
02-11 może to ujednolicić z innymi planami.

Legenda: ID wpisu (`PM`, `KL`, `TU` + numer), `plik:linia`, źródło, **waga**, propozycja. Klucz `[zbiorcze: …]` przy rozbieżnościach wspólnych z innymi plikami.

---

## Państwa-miasta (`panstwa-miasta`)

Własny nagłówek (`PanstwaMiasta.tsx:28-63`) przejmuje cały zakres wspólnego w fazie `playing` (`Game.tsx:179`, `ownHeader`); po partii nagłówek daje `Game.tsx` (plan 02-03).
`Countdown` w nagłówku (`Game.tsx:384`, `tense`, bez `color`) to komponent `Game.tsx` (plan 02-03); tu oceniam tylko, jak gra go używa.

### Wygląd (UI-01, UI-02, UI-03)

Zgodne (sprawdzone):
- Kolory: w pliku tylko tokeny i kolor gracza przez `style` (CHECKS §1: 0 trafień dla `PanstwaMiasta.tsx`); W-02.
- Akcje w partii jako `btn text-bg` w kolorze gracza: „Dalej” w podsumowaniu `:104`, „STOP!”/„Gotowe” `:202`, „Dalej” w pisaniu `:211`, „Zatwierdź…”/„Wszystko się zgadza” `:245` (CHECKS §5a :488-490); `btn-primary` brak (W-05 zgodny). „Oddaj” `:207` to `btn-ghost` obok wypełnionego (obrys przed wypełnieniem).
- Pola: sześć `.field` 48 px (`:178`), przyciski `.btn` 48 px (B-24, B-30, W-06).
- Gra turowa z limitem fazy, nie gra na refleks: `onClick` i brak `touch-none select-none` są zgodne (CHECKS §5: „nie / nie”; reguła W-13 dotyczy pól gry na czas). `onPointerDown={(e) => e.preventDefault()}` w `:211` tylko trzyma fokus klawiatury.
- Odrzucona odpowiedź nie tylko kolorem: przekreślenie + `fg-muted` (`:324`), w podsumowaniu wynik 0 i liczba głosów przeciw z ikoną (`:333-341`); mój głos w trakcie: ikona `X` + `aria-pressed` + `aria-label` „Odrzucasz” (`:316-317`, `:328-329`).
- Litera rundy jako jedyny duży element (`:30-35`, 96 px, `text-7xl`) to wzór `DESIGN.md` §3.2 („gdy ekran ma jedną informację, powiększ ją”).
- Zaokrąglenia: `rounded-tile`, `rounded-inset`, `rounded-full` (CHECKS §3: 0 trafień). Cieni brak.
- Szerokość nagłówka na 360 px: 96 + 16 + reszta (min-w-0) mieści się; linia graczy `flex-wrap` się łamie, nie wypycha.
- `StickyBar` w pisaniu, głosowaniu i podsumowaniu (W-14 zgodny).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| PM1 | `PanstwaMiasta.tsx:165-216`, `:243-248`, `:90-108` | **Ekran nie mieści się na 360×640 w żadnej fazie** (znane z `DESIGN.md` §6, zmierzone na nowo, statycznie). Pisanie: 24 + nagłówek 96 + 12 + gracze 20-68 + 12 + kafel 552 (6 × (etykieta 14 + 8 + pole 48) + 5 × 20 + 32; ze `StopBanner` +36) + 12 + `StickyBar` 68 + 24 ≈ **820 px** (bez klawiatury; z klawiaturą widać około 380 px). Głosowanie (2-3 graczy): nagłówek + gracze + podpowiedź + tabela (6 × (wiersz kategorii 24 + komórka 44 + odstępy)) + `StickyBar` ≈ **770 px**. Podsumowanie: tabela z punktami + `Scores` + `StickyBar` ≈ **1000 px**. Akcja w `StickyBar` zostaje pod kciukiem, a „Dalej”/Enter przenoszą fokus do pustego pola, więc da się grać, ale trzeba przewijać pod limitem 90/45 s | `ZASADY.md` §4 „Ekran mieści się na 360×640”; `AGENTS.md`; `DESIGN.md` §6 | **wysoka** (pisanie, głosowanie; podsumowanie sam z siebie średnia) | Decyzja fazy 4 (już w `DESIGN.md` §6): albo wyjątek „formularz z klawiaturą przewija się, akcja w `StickyBar`” dopisany do §6 jako odstępstwo, albo ciaśniejszy formularz (etykieta w `placeholder`/w linii z polem, `gap-3` zamiast `gap-5`: około 640 px) i głosowanie po jednej kategorii naraz |
| PM2 | `PanstwaMiasta.tsx:275-276` | Tabela odpowiedzi ma `minWidth: players × 6rem` (96 px na gracza) w kaflu `overflow-x-auto`: na 360 px (312 px w kaflu) mieszczą się 3 kolumny; przy 4 graczach widać około 80% tabeli, przy 6 około połowę, resztę trzeba przewinąć w bok w trakcie głosowania. Strona się nie przewija (nazwa kategorii jest `sticky`), więc to świadomy wybór (komentarz `:254`), ale treść potrzebna do głosu jest poza ekranem; stała szerokość w `rem` | `ZASADY.md` §4 „bez poziomego przewijania; plansza skaluje się do szerokości, nie ma stałych pikseli”; CHECKS §6 (`PanstwaMiasta.tsx:275`) | **średnia** (da się grać; wysoka, jeśli 02-11 uzna przewijanie w kaflu za przewijanie ekranu) | Przy 4+ graczach układ transponowany: gracz w wierszu, odpowiedź obok (jedna kategoria na ekran albo kategorie jako sekcje), bez `minWidth` |
| PM3 | `PanstwaMiasta.tsx:319` | Komórka głosowania `min-h-11` (44 px) jest polem dotykowym (`button`, gdy `canToggle`) | `ZASADY.md` §4 „Pola dotykowe co najmniej 48 px”; `AGENTS.md`; CHECKS §4 (`:312`) | **średnia** `[zbiorcze: dotyk-48]` | `min-h-12` |
| PM4 | `PanstwaMiasta.tsx:306`, `:320` | Odpowiedź odrzucona przez większość (`out`, werdykt w podsumowaniu) dostaje tło `accent-soft`: akcent w roli „problem/odrzucone”, a ta rola należy do `warning` (akcent to „zrób to / to wybrane”). W trakcie głosowania `accent-soft` + `border-accent` dla mojego zaznaczenia to wzór „kafel zaznaczony” z `DESIGN.md` §4 (zgodny), ale obok ikona `X` w `warning` (`:329`), więc jedna komórka ma dwa różne czerwienie | `DESIGN.md` §2 (role `accent`, `warning`), §5 „Kolor znaczy”; D-04; CHECKS §2 (`:320-321`) | **średnia** `[zbiorcze: rola-tokenu]` | W podsumowaniu bez tła (przekreślenie i 0 już mówią „odpada”) albo `warning` 12%; w głosowaniu ikona `X` w `fg` albo w `accent`, żeby zaznaczenie miało jeden kolor |
| PM5 | `PanstwaMiasta.tsx:31` | Kafel litery ma obrys `line-hover`, a ten token jest dla obrysu pola formularza i przycisku pod kursorem; litera nie jest interaktywna | `DESIGN.md` §2 (rola `line-hover`); D-04; W-02 | **średnia** `[zbiorcze: rola-tokenu]` (zgodnie z W-02; wpływ na gracza żaden) | `border-line` jak każdy kafel |
| PM6 | `PanstwaMiasta.tsx:187`, `index.css:140` (B-30) | Odpowiedź na złą literę sygnalizuje tylko czerwona ramka pola (`aria-invalid`); brak ikony i tekstu, które `DESIGN.md` §4 wymaga dla błędu formularza (ikona `Check` pojawia się tylko przy dobrej odpowiedzi, `:191`) | `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem”, §4 „błąd formularza” | **średnia** `[zbiorcze: kolor-jedyny-sygnal]` | Ikona `X`/`Warning` w miejscu `Check` (`text-warning`, `aria-hidden`) i `aria-describedby` z tekstem „Na literę {L}” |
| PM7 | `PanstwaMiasta.tsx:321` | Własne odpowiedzi w głosowaniu przygaszone do 50% bez podpisu przy komórce (wyjaśnia to tylko ogólne zdanie `:242`); 50% nie ma w tabeli stanów poza „turniej: bez” (przygaszony 60%, nieaktywny 40%) | `DESIGN.md` §4 „kafel przygaszony 60%, podpis mówi dlaczego”, „Każdy stan, który coś blokuje, tłumaczy się podpisem” | **niska** `[zbiorcze: stan-krycie]` | `opacity-60` i krótki podpis w komórce („twoja”) albo zostawić 100% (to i tak `div`, nie przycisk) |
| PM8 | `PanstwaMiasta.tsx:40-41`, `Game.tsx:384` | W fazie, w której czekamy na mnie, tytuł fazy nie jest w moim kolorze, a pasek limitu jest `bg-fg` (`tense`, bez `color`); we wspólnym nagłówku mini-gier (`Game.tsx:244`, `:254`) i w Kalamburach (`Kalambury.tsx:53`) tytuł i pasek idą kolorem gracza, gdy to „moja tura”. Dwa własne nagłówki różnią się też znakiem „to ja” (Kalambury mają kreskę pod kropką `Kalambury.tsx:74`, Państwa-miasta nie) | `DESIGN.md` §3.4 „kolor gracza niesie stan (czyja tura, ile czasu)”; `ZASADY.md` §4 „Kolor gracza … podświetlenie mojej tury” | **niska** `[zbiorcze: naglowek-wlasny]` | `color` paska i tytułu z koloru gracza, gdy `waitingFor` zawiera mnie (przekazać `myTurn`/`color` z `Game.tsx` jak w Kalamburach); kreska pod własną kropką w linii graczy |
| PM9 | `PanstwaMiasta.tsx:57` | Zielona fajka `text-success` oznacza „skończył krok” (oddał kartkę, zagłosował, „Dalej”), a w Kalamburach ta sama ikona w tym samym kolorze znaczy „trafił” (`Kalambury.tsx:80`); `success` to w `DESIGN.md` §2 „trafienie”. Gotowość ma w `DESIGN.md` §4 znaczek w kropce (`PlayerDots`) | `DESIGN.md` §2, §4 „gracz gotowy”; D-04 | **niska** `[zbiorcze: naglowek-wlasny]` | Fajka w `fg` (bez zieleni) albo znaczek w kropce jak `PlayerDots`; zieleń zostaje dla trafienia |

### Teksty, liczby i dostępność (UI-04, UI-05)

Zgodne: brak em-dashy, brak ułamków (punkty całkowite), wszystkie teksty po polsku (CHECKS §7: 0 trafień); „(ty)” `:55`, `:284`; „Oglądasz” `:61`;
punkty w nagłówku, w tabeli i licznik `3/6` w Geist Mono z `tabular-nums` (`:56`, `:198`, `:334`) (W-16); wyniki przez `Scores` (`:93`, B-64, W-04);
nazwy kategorii w tabeli jako `.label` (`:294`) (W-17); etykiety pól formularza to `<label>` pola, nie podpis bloku (zgodne); kropki graczy `aria-hidden` (`:53`, `:282`),
ikony `aria-hidden` albo z `aria-label` (`:57`, `:118`, `:191`, `:329-338`); komórki-przyciski z pełnym `aria-label` (`:317`); licznik z `aria-label` (`:198`);
`StopBanner` z `role="status"`, ikoną i tekstem w `warning` (`:117-119`, kolor nie jest jedynym sygnałem); stan pusty „brak” w `fg-muted` (`:326`);
własnego `Intro` brak, co jest zgodne (gra główna; ekran przed partią to `Setup.tsx`, plan 02-03). Punkty w linii graczy zamiast `Stats`: odstępstwo (lista na końcu).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| PM10 | `PanstwaMiasta.tsx:105`, `Kalambury.tsx:140` wobec `Game.tsx:530`, `:556`, `Lobby.tsx:205` | Po własnym „Dalej” przycisk mówi „Czekamy na resztę”, a platforma w tej samej sytuacji „Czekamy na: {nicki}…” (z nickami i wielokropkiem ładowania, `DESIGN.md` §4) | `ZASADY.md` §4 „te same słowa co w innych grach”; `DESIGN.md` §4 „ładowanie” | **niska** `[zbiorcze: slowa]` | „Czekamy na: {nicki}…” z `waitingFor` (Państwa-miasta dostają je już w propsach) |
| PM11 | `PanstwaMiasta.tsx:104` (i `Kalambury.tsx:139`) wobec `Game.tsx:554` | „Dalej” między rundami jest wypełnione kolorem gracza, a „Dalej” między grami turnieju akcentem (`btn-primary`); `DESIGN.md` §5 wymienia „Dalej” wśród przycisków platformy w akcencie, nie rozróżniając tych dwóch sytuacji | `DESIGN.md` §5 „Akcent należy do platformy, kolor gracza do partii”; `ZASADY.md` §5 „ta sama sytuacja … ta sama” | **średnia** `[zbiorcze: dalej-kolor]` | Decyzja fazy 4: dopisać w `DESIGN.md` §5, że „Dalej” w trakcie partii (między rundami) to akcja w partii (kolor gracza), a „Dalej” między grami turnieju to platforma; kod zostaje |
| PM12 | `PanstwaMiasta.tsx:212` wobec `:105` | Słowo „Dalej” ma w jednej grze dwa znaczenia: w pisaniu przenosi fokus do pustego pola, w podsumowaniu kończy rundę | `ZASADY.md` §4 „te same słowa” (to samo słowo w tej samej roli) | **niska** `[zbiorcze: slowa]` | W pisaniu „Następne pole” albo sama strzałka z `aria-label`; „Dalej” zostaje dla przejścia rundy |

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Keyframes, `animate-*`, `transition`: w pliku **brak** (CHECKS tabela: anim 0, trans 0). Pasek limitu (`transition-[width]` 300 ms, `animate-pulse` ≤ 10 s) należy do `Countdown` w `Game.tsx:596` (02-03; B-50 `[zbiorcze: animate-tailwind]`).
- `setTimeout` `:135` (`DRAFT_MS` 500, wysyłka szkicu w tle): logika, nie animacja, więc bez `reducedMotion` jest **zgodne** (CHECKS §13 :1335). Sprzątanie timera `:129`, `:134`, `:140` zgodne.
- `requestAnimationFrame`, `startViewTransition`, `performance.now`: brak. Pomiaru czasu po stronie klienta nie ma (limit liczy serwer).
- `navigator.vibrate`: w pliku **brak**. Wibrację tury robi `Game.tsx:35` (40), gra jej nie powtarza (zgodne).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| PM13 | `Game.tsx:34-36` + `panstwa-miasta.ts:143-149` | Wibracja „moja tura” idzie tylko przy zmianie `myTurn` z `false` na `true`. Gdy faza zmienia się po limicie (STOP i 7 s, koniec 90/45/20 s), a gracz był w `waitingFor` i jest w nim dalej (nie oddał kartki, nie zagłosował, nie dał „Dalej”), nowa faza zaczyna się bez wibracji, choć to dla niego nowe zadanie | `ZASADY.md` §5 tabela wibracji („moja tura” 40) | **niska** `[zbiorcze: wibracja-fazy]` | W `Game.tsx` wibrować przy zmianie klucza `turn().key`, gdy `waitingFor` zawiera mnie (nie tylko przy zmianie `myTurn`) |
| PM14 | `PanstwaMiasta.tsx:66-72`, `:115-121` | STOP od innego gracza (zostaje 7 s) to „coś złego dla mnie od innego gracza”, a pojawia się bez wibracji i bez animacji pojawienia (baner wskakuje bez `stone-pop`); telefon leżący obok nie daje znać, że czas się skrócił | `ZASADY.md` §5 tabela wibracji (`[60, 40, 60]`), „Najpierw istniejące: `stone-pop` (coś się pojawia)” | **niska** (do decyzji: tabela §5 podaje przykład „zbity pionek”) | `navigator.vibrate?.([60, 40, 60])` u piszących, gdy `view.stop` pojawia się i nie jest mną; baner z `animate-[stone-pop_0.35s_ease-out]` |

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| moja tura / nowa faza (pisanie, głos, podsumowanie) | brak (tytuł fazy zmienia się od razu) | 40 z `Game.tsx:35`, gdy `myTurn` przechodzi na `true` (PM13) | „STOP!”, „Oddaj”, „Dalej” (pole), „Wszystko się zgadza” / „Zatwierdź (odrzucam N)”, „Dalej” |
| pojawienie elementu (STOP innego gracza) | brak (PM14) | brak (PM14) | „Gotowe” zamiast „STOP!” |
| trafienie (odpowiedź na dobrą literę) | brak (ikona `Check` `success` od razu) | brak (zgodne) | - |
| pomyłka (odpowiedź na złą literę) | brak (ramka `warning`, `.field` bez przejścia) | brak (to nie ruch, tylko wpisywanie; zgodne) | - |
| odsłona prawdziwego wyniku (cudze odpowiedzi, werdykt, punkty) | brak | brak | - |
| koniec rundy (podsumowanie) | brak | brak | „Dalej” → „Czekamy na resztę” (PM10, PM11) |
| koniec partii | `title-pop` 0,5 s u zwycięzcy (`Game.tsx:243`, B-41, plan 02-03) | brak | „Rewanż”, „Do lobby” (`Game.tsx`) |
| zbicie | nie występuje | - | - |

---

## Kalambury (`kalambury`)

Własny nagłówek (`Kalambury.tsx:47-85`) w fazie `playing` (`Game.tsx:179`); pasek limitu `Countdown` z `drawTime` (jeden pasek 80 s na rysowanie, `Game.tsx:40-44`, `:396`) w kolorze rysującego (`turnColor`); poświata `--ambient` zawsze w kolorze rysującego (`Game.tsx:54`), zgodnie z `DESIGN.md` §1.

### Wygląd (UI-01, UI-02, UI-03)

Zgodne (sprawdzone):
- Paleta (`:21-28`): cztery kolory treści gry wpisane raz w `PALETTE` (żółty, zielony, niebieski, brązowy; CHECKS §1 :120-123), biały to `fg`, gumka to `surface` = tło płótna (`:155`): odstępstwo D-04 (lista na końcu).
- Przyciski palety `size-12` (48 px), `role="radio"` z `aria-checked` i `aria-label` z nazwą koloru, grupa `role="radiogroup"` (`:269-283`); 6 × 48 px = 288 px w 328 px (`justify-between`). Zaznaczenie obrysem 2 px `fg` z odsunięciem 2 px (`:277`), jak „wybrany kolor gracza” w `DESIGN.md` §4. Gumka ma ikonę `Eraser` (`:281`), więc nie rozpoznaje się jej tylko po kolorze.
- Płótno (`:151-173`): `<svg viewBox>` skalowane do szerokości (`aspect-square w-full`), `touch-none select-none`, `-webkit-touch-callout:none`, `rounded-tile`, obrys `line`, tło `surface`; rysowanie przez `onPointerDown`/`Move`/`Up`/`Cancel` z `setPointerCapture` (`:217-248`, `:266`); W-13 zgodny (to nie gra na refleks, ale palec musi trafiać od razu).
- Akcje w partii: „Zgadnij” `btn text-bg` w kolorze gracza (`:375`), „Dalej” w kolorze gracza (`:139`); trzy hasła jako `btn-ghost` (`:92`): trzy równorzędne wybory, obrys przed wypełnieniem (zgodne). `btn-primary` brak (W-05).
- „Wyczyść” i „Cofnij” `btn-ghost` 48 px (`:286-293`); „Cofnij” po „Wyczyść” przywraca rysunek (`:250-260`), wyłączone przyciski 40% (B-25) i sytuacja wyjaśnia się sama (puste płótno).
- „Pasuję” wymaga drugiego dotknięcia: zmiana tekstu na „Dotknij jeszcze raz, żeby spasować” i obrys `fg` (`:379-380`): stan nie tylko kolorem.
- Tytuł w kolorze gracza tylko u rysującego (`:53`), jak „Twój ruch”; długość hasła mono z odstępem 0,3em (`:59`): najdłuższe hasło (11 liter, `kalambury-dane.ts`) ma około 200 px przy `text-xl`, mieści się w 328 px.
- Kolory i tokeny w rolach: `success` dla trafienia (`:80`, `:356`, `:384`), `fg-muted` dla podpisów; cieni brak, zaokrąglenia ze skali (CHECKS §3: 0).
- Szerokość na 360 px: nic nie wystaje (płótno `w-full`, paleta 288 px, `flex gap-2` z `min-w-0` przy polu strzału `:363`).
- Wysokość u rysującego (faza `draw`): 24 + nagłówek 77 + 12 + gracze 20 + 12 + płótno 328 + 12 + paleta 48 + 12 + przyciski 48 + 24 ≈ **617 px** przy graczach w jednej linii: mieści się. Przy 4 graczach (dwie linie) około 641 px, przy 6 (trzy linie) około 665 px (KL1).
- Wybór hasła (`choose`): kafle przy dolnej krawędzi (`flex-1` nad nimi), mieści się.

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| KL1 | `Kalambury.tsx:36`, `:342`, `:350`, `:358-382` | **Ekran zgadującego nie mieści się na 360×640** (szacunek statyczny, do potwierdzenia w przeglądarce). `BELOW_CANVAS_PX` = 210 liczy tylko miejsce pod płótnem, a płótno ma `maxWidth: height − 210` = 430 px, więc na 640 px zajmuje pełne 328 px: 24 + nagłówek 77 + 12 + gracze 20-68 + 12 + płótno 328 + 12 + czat 72 (`min-h-[4.5rem]`) + 12 + pole i „Zgadnij” 48 + 8 + „Pasuję” 48 + 24 ≈ **677 px** (1 linia graczy) do **725 px** (6 graczy). „Pasuję” i część pola leżą pod krawędzią, dopóki gracz nie dotknie pola (wtedy `scrollIntoView` i płótno maleje, `:328-330`). U rysującego przy 4-6 graczach to samo o 0-25 px | `ZASADY.md` §4 „Ekran mieści się na 360×640”; `AGENTS.md`; `DESIGN.md` §6 (Kalambury nie są na liście wyjątków) | **wysoka** (gra pod limitem; do potwierdzenia w przeglądarce) | Rozmiar płótna z wysokości pozostałej pod nagłówkiem: `height − top − BELOW_CANVAS_PX`, gdzie `top` z `getBoundingClientRect()` kontenera (albo płótno w `flex-1 min-h-0` z `aspect-square` ograniczonym wysokością) |
| KL2 | `Kalambury.tsx:105-145` | Ekran odsłony (`reveal`): nagłówek + płótno 328 + kafel punktów rundy (około 100-170) + podpis + `Scores` (około 170) + `StickyBar` ≈ **900 px**; „Dalej” w `StickyBar` zostaje pod kciukiem, limit 20 s | `ZASADY.md` §4 (360×640) | **średnia** (ekran podsumowania z akcją w `StickyBar`) | Mniejsze płótno w odsłonie (np. `maxWidth` 200 px obok listy punktów rundy) albo punkty rundy w `Scores` jako druga kolumna (`+N`), bez osobnego kafla |
| KL3 | `Kalambury.tsx:277` | Przejście koloru przycisków palety `transition-colors` z domyślnym czasem Tailwinda 150 ms | `ZASADY.md` §5 tabela (180 ms przejście stanu, 100 ms reakcja na dotyk); CHECKS §12 :1204 | **niska** `[zbiorcze: transition-domyslny]` | `duration-100` (reakcja na dotyk) albo usunąć (`ring` i tak przeskakuje) |

### Teksty, liczby i dostępność (UI-04, UI-05)

Zgodne: brak em-dashy i ułamków (CHECKS §7: 0); „(ty)” `:77`, „Oglądasz” `:83`; punkty w Geist Mono z `tabular-nums` (`:78`, `:123`), wyniki przez `Scores` (`:128`), podpisy bloków `.label` (`:49`, `:110`, `:116`, `:127`);
stan pusty płótna „Czekamy na hasło…” / „{nick} zaczyna rysować…” (czasownik z wielokropkiem, `:344-347`) i „Nikt nie zgadł.” (`:117`) jak w `DESIGN.md` §4; „Rysunek pełny: cofnij albo wyczyść” przy zablokowanym płótnie (`:267`);
czat z `aria-live="polite"` (`:350`); hasło z `aria-label` z liczbą liter i odsłoniętą literą (`:59`); ikony stanu z `aria-label` (`:79`, `:80`), ozdobne z `aria-hidden` (`:73`, `:120`, `:281`, `:287`, `:291`); pole strzału z `aria-label` (`:371`).
Przyciski haseł mają tekst z wyrażenia `{word}` (CHECKS §9 :735): to widoczny tekst, nie pusty przycisk, zgodne. Własnego `Intro` brak, zgodne (gra główna).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| KL4 | `Kalambury.tsx:50` | „rysuje ty” u rysującego: zła forma czasownika (powinno być „rysujesz”) | `ZASADY.md` §4 „Teksty po polsku” | **niska** | `rysuje {nick}` / `rysujesz` |
| KL5 | `Kalambury.tsx:153-158` | Płótno `<svg>` nie ma ani `aria-hidden`, ani `role="img"` z `aria-label`; to treść gry (rysunek), więc czytnik ekranu nie dostaje nic albo dostaje pustą grafikę | `ZASADY.md` §4 „Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`”; CHECKS §9 :736 | **niska** `[zbiorcze: aria-hidden]` | `role="img" aria-label="Rysunek"` (u rysującego „Płótno do rysowania”) |
| KL6 | `Kalambury.tsx:287`, `:291` | Ikony 18 px w małych akcjach („Cofnij”, „Wyczyść”) w wadze `regular`, a platforma w takich przyciskach ma `bold` (`Game.tsx:502`, `:529`, `:555`) | `DESIGN.md` §2 „`bold` w małych akcjach (16-18 px)” | **niska** `[zbiorcze: waga-ikon]` | `weight="bold"` |
| (PM10) | `Kalambury.tsx:140` | „Czekamy na resztę” zamiast „Czekamy na: {nicki}…” | jak PM10 | niska `[zbiorcze: slowa]` | jak PM10 |
| (PM11) | `Kalambury.tsx:139` | „Dalej” między rundami w kolorze gracza, w turnieju w akcencie | jak PM11 | średnia `[zbiorcze: dalej-kolor]` | jak PM11 |

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- Keyframes i `animate-*`: w pliku **brak**. Jedyne przejście: `transition-colors` palety `:277` (KL3). Pasek limitu: `Countdown` w `Game.tsx` (02-03); przejście połówek 40 s jest ciągłe, bo `drawTime` dolicza drugą połowę do pierwszej (`Game.tsx:40-44`), a nowy obiekt `game` przelicza termin bez skoku paska (zgodne z `ZASADY-GIER.md` §9: „jeden pasek 80 s”).
- `setInterval` `:205` (`SEND_MS` 200, wysyłka kresek) i `setTimeout` `:319` (`CONFIRM_MS` 3000, wygaszenie potwierdzenia „Pasuję”): logika, nie animacja, bez `reducedMotion` **zgodne** (CHECKS §13 :1301-1302). Obie z czyszczeniem w `useEffect`.
- `visualViewport` `resize` (`:300-310`) i `scrollIntoView({ block: "start" })` bez `behavior: "smooth"` (`:329`): przeskok, nie animacja, zgodne (B-51 p. 3).
- Rysunek żyje lokalnie i nie czeka na serwer (`:177-193`): animacja nie blokuje gry, nowy stan z serwera (inny `round`) montuje płótno od nowa (`key={view.round}`, `:99`). Pomiaru czasu na kliencie brak.
- `navigator.vibrate`: w pliku **brak**; trafienie nie wibruje (zgodne).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| KL7 | `Game.tsx:34-36` + `kalambury.ts:215` | U zgadujących wibracja „moja tura” (40) przychodzi **w połowie rysowania**, gdy serwer przełącza `waitingFor` z `[drawer]` (`half === 0`) na zgadujących (`half === 1`), czyli razem z odsłonięciem litery. Zgadywać wolno od początku rysowania, więc to nie jest początek tury; do tego wibracja zdradza podział na połowy, który `ZASADY-GIER.md` §9 każe pokazywać „tylko po odsłoniętej literze”. Rysujący wibruje raz, przy wyborze hasła (zgodne) | `ZASADY.md` §5 tabela wibracji („moja tura” 40); `ZASADY-GIER.md` §9 | **średnia** `[zbiorcze: wibracja-fazy]` | W `Game.tsx` dla Kalamburów liczyć „moją turę” zgadującego od wejścia w `draw` (np. `myTurn = phase === "draw" && !drawer && !guessed`) albo pomijać wibrację przy zmianie samej połówki (`turn().key` `draw:r:1`) |
| KL8 | `Kalambury.tsx:56-62` | Odsłonięcie litery w połowie rysowania (sytuacja „co się właśnie stało”) nie ma żadnej animacji: litera po prostu pojawia się w miejscu podkreślnika | `ZASADY.md` §5 „Najpierw istniejące: `stone-pop` (coś pojawia się)” | **niska** (luka, nie złamanie reguły) | Odsłonięta litera w `<span key>` z `animate-[stone-pop_0.35s_ease-out]` |

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| moja tura (rysujący wybiera hasło) | brak | 40 z `Game.tsx:35` | hasła (`btn-ghost`) |
| moja tura (zgadujący) | brak | 40 w połowie rysowania, nie na starcie (KL7) | „Zgadnij”, „Pasuję” → „Dotknij jeszcze raz, żeby spasować” |
| pojawienie elementu (kreski rysunku, nowy strzał w czacie) | brak (kreski i czat bez przejścia) | brak | - |
| odsłona litery (druga połowa) | brak (KL8) | 40 u zgadujących (KL7) | - |
| trafienie (moje) | brak; tekst „Trafione! Czekamy na resztę.” w `success` | brak (zgodne) | - |
| pomyłka (pudło w czacie) | brak | brak (pudło nie ma kary; do decyzji w 02-11 razem z grami, które wibrują 60 przy ruchu „bez kary”, CHECKS „Najważniejsze”) | „Zgadnij” |
| odsłona prawdziwego wyniku (hasło po rundzie) | brak (hasło w tytule, punkty rundy od razu) | brak | - |
| koniec rundy | brak | brak | „Dalej” → „Czekamy na resztę” (PM10, PM11) |
| koniec partii | `title-pop` 0,5 s u zwycięzcy (`Game.tsx:243`, B-41, 02-03) | brak | „Rewanż”, „Do lobby” |
| zbicie | nie występuje | - | - |

---

## Turniej (`turniej`)

Ekrany: ustawienia przed startem (`TournamentSetup`, `Setup.tsx:67-218`, wywołany z `App.tsx:57`), nagłówek i tabela w trakcie i po grach (`Game.tsx`), przejście między grami (`NextActions`, `Game.tsx:540-566`).
Mini-gry w turnieju rysują swoje ekrany same (plany 02-07..02-10).

### Wygląd (UI-01, UI-02, UI-03)

Zgodne (sprawdzone):
- Stany kafli gier zgodne z `DESIGN.md` §4: **losowo** zwykły kafel (`:185`, `border-line`), **na pewno** ramka `accent` + tło `accent-soft` + ikona `fill` + znaczek `Check` + podpis „na pewno” (`:185`, `:190`, `:195-200`), **bez** ramka `line` + krycie 50% + przekreślona nazwa (`:185`, `:193`); stan w `aria-label` z nickiem tego, kto zaznaczył (`:183`). Akcent w roli „zaznaczony kafel” (CHECKS §2 :240-243), kropka autora w kolorze gracza (`:191`).
- Kafle `min-h-20` (80 px), presety i tryby `min-h-12`, przyciski ± `size-12` z `aria-label` i ikonami `bold` 18 px (`:129-146`) (W-06, W-15).
- Siatka `grid-cols-3` (w Tailwind 4 `minmax(0, 1fr)`): na 360 px kafel około 104 px, najdłuższa nazwa w jednym słowie (np. „Przytrzymaj”, `text-sm`) około 85 px, mieści się; nic nie wypycha w poziomie.
- Nagłówki grup listy (`:173`) to zwykły Satoshi 14 px `fg-muted`: wyjątek z `DESIGN.md` §5 („kategorie w siatce mini-gier”), zgodne.
- Jeden wypełniony przycisk na ekranie: `btn-primary` tylko w `StartBar` (`Lobby.tsx:213` albo `:223`), a „Dalej” między grami (`Game.tsx:554`) to jedyny `btn-primary` ekranu po grze (`RecordPanel` i ekrany końcowe mini-gier go nie mają, CHECKS „Najważniejsze”: `btn-primary` tylko w `Game`, `Home`, `Lobby`, `ui`). „Dalej” i „Zakończ turniej” to przyciski platformy (akcent / obrys), zgodnie z `DESIGN.md` §5.
- Nagłówek w trakcie: `.label` „Turniej · gra 3/8” / „dogrywka” (`Game.tsx:234-239`), kropki `GameDots` z odznaką prostokątną z punktami (`square={!!table}`, `Game.tsx:248`, `:164`; B-60, kształt B-61 `[zbiorcze: promien]`), bez „+1” (`plus: !table`, `Game.tsx:165`): punkty turnieju nie udają wygranych partii.
- Tabela turnieju (`Game.tsx:426-453`): `.tile p-4`, `.label`, miejsce, kropka `aria-hidden`, nick `truncate` z „(ty)”, `+{ostatnia gra}` albo puchar z wygranymi, suma; na 360 px nick dostaje około 140 px.
- „Wygrywasz turniej!” / „Turniej wygrywa {nick}” w kolorze zwycięzcy (`Game.tsx:182-189`, `:244`), „Turniej: remis”, „Koniec turnieju” (solo).
- Ekran ustawień jest listą (około 10 rzędów kafli), więc przewija się w pionie z założenia; start i podsumowanie są przyklejone do dołu (`:209-215`). Ekran po grze: wyniki mini-gry + tabela + „Dalej” przy dole (`mt-auto`), przewija się jak każdy ekran końcowy (ocena ekranów końcowych mini-gier w 02-07..02-10).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| TU1 | `Game.tsx:448` | Suma punktów w kolumnie `w-14` (56 px) jako „{total} pkt” mono 16 px półgrubym: „40 pkt” to 6 znaków × około 9,6 px ≈ 58 px, więc przy dwucyfrowej sumie (już od 10 punktów, np. 4 graczy × 4 gry) napis łamie się na dwie linie („40” / „pkt”); 150 pkt (15 gier, 6 graczy) na pewno | `ZASADY.md` §4 (360×640, czytelność); `DESIGN.md` §5 „Liczby są mono … żeby nie skakały” | **niska** (szacunek statyczny, do potwierdzenia w przeglądarce) | `w-16` + `whitespace-nowrap` albo „pkt” jako `.label` w nagłówku kolumny i sama liczba w komórce |
| TU2 | `Game.tsx:426-453` wobec `Setup.tsx:115` | W turnieju solo tabela pokazuje „1. {nick} +0 … 0 pkt”, a ekran ustawień mówi „Grasz sam, więc punktów nie ma” | `DESIGN.md` §4 „stan pusty jednym zdaniem”; `ZASADY.md` §4 „Teksty … krótkie” | **niska** | Przy `view.seats.length === 1` bez tabeli (albo jedno zdanie „Rozegrane gry: N/M”) |
| TU3 | `Setup.tsx:156`, `:184`, `:48` | `transition-colors` z domyślnym czasem 150 ms na presetach i kaflach gier (i trybach w `Setup`, który ocenia 02-03) | `ZASADY.md` §5 tabela (180 ms); CHECKS §12 :1269-1271 | **niska** `[zbiorcze: transition-domyslny]` | `duration-180` |
| TU4 | `Setup.tsx:195-200` wobec `:185`, `:193` | Komentarz `:194` mówi, że podpis mają gry zmienione, ale stan „bez” nie ma słowa (tylko krycie 50% i przekreślenie), a „na pewno” ma. Przekreślenie jest drugim sygnałem, więc nie jest to samo przygaszenie; tylko niespójność dwóch stanów tej samej listy | `DESIGN.md` §4 „Każdy stan, który coś blokuje, tłumaczy się podpisem” | **niska** `[zbiorcze: stan-krycie]` | Podpis „bez” mono 12 px jak „na pewno” (albo poprawić komentarz, jeśli przekreślenie ma wystarczyć) |
| TU5 | `Setup.tsx:131-133`, `:143` | „Mniej gier” / „Więcej gier” wyłączone bez podpisu, dlaczego (minimum `MIN_LENGTH` albo liczba „na pewno”, maksimum: liczba niewykluczonych); `adjusted` (`:97-102`) tłumaczy tylko część przypadków | `DESIGN.md` §4 „przycisk nieaktywny … podpis mówi dlaczego” | **niska** | Zdanie pod licznikiem przy granicy („Najmniej 3 gry”, „Więcej gier nie ma: reszta wykluczona”) |
| TU6 | `Setup.tsx:209-215` | Własny przyklejony pasek (`sticky bottom-0 -mx-4 bg-bg/90 px-4 backdrop-blur`) owija `StartBar`, który sam jest `StickyBar` (`Lobby.tsx:211`): dwa zagnieżdżone paski z rozmyciem; wzór `StickyBar` skopiowany zamiast rozszerzony | `ZASADY.md` §4 „przy długiej treści `StickyBar`”, „Nowa klasa wspólna powstaje dopiero…” (reuse) | **niska** | `StickyBar` z opcjonalną linią podsumowania nad przyciskiem (prop `note`) albo `StartBar` przyjmujący `children` |

### Teksty, liczby i dostępność (UI-04, UI-05)

Zgodne: teksty po polsku, brak em-dashy i ułamków (CHECKS §7: 0); odmiana „5/10/15 gier” (`:162`) i `plural` w podsumowaniu (`:93-95`); „Dalej”, „Rewanż”, „Do lobby”, „(ty)” ze wspólnego zestawu; „Zakończ turniej” (`Game.tsx:561`) i „Następna gra: …” (`:549`) nazwane w `KONCEPT.md` §2.6 / zrozumiałe;
liczba gier mono `text-2xl` `tabular-nums` z `aria-live` (`:139`), „ok. N min” mono (`:125`), punkty i miejsca w tabeli mono (`Game.tsx:432-448`); odliczanie 15 s przez `Countdown` bez `total` (ikona `Timer`, sekundy mono, `warning` w ostatnich 10 s; `Game.tsx:551`, `:605-610`) zgodne z `KONCEPT.md` §2.6 („sama po 15 s”);
`aria-label` na kaflach, presetach (`aria-pressed`), punktach i pucharze (`Game.tsx:439`, `:444`, `:295`); podpisy bloków `.label` („Liczba gier”, „Tabela turnieju”, „Wyniki turnieju”).

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| TU7 | `Setup.tsx:211`, `:210` (`{summary}`), `:213` | Liczby w podsumowaniu przy przycisku („3 wybrane + 5 losowych z 25 · ok. 12 min”) w Satoshi, a ta sama „ok. N min” wyżej (`:125`) jest mono | `DESIGN.md` §5 „Liczby są mono”; CHECKS §8 :717 | **niska** `[zbiorcze: liczby-mono]` | Liczby w `<span className="font-mono tabular-nums">` |
| TU8 | `Setup.tsx:111` wobec `Setup.tsx:29` | Tytuł ekranu turnieju to `h1.label` (11 px wersaliki „Turniej · 1-6 osób”), a ekran gry głównej obok ma nazwę gry w kaflu z ikoną (`Setup.tsx:25-34`); dwa ekrany tego samego kroku wyglądają różnie | `DESIGN.md` §2 typografia („tytuł ekranu … Satoshi”), §5 „Podpis to `.label`” (podpis, nie tytuł) | **niska** | Kafel jak w `Setup`: ikona `Trophy`, „Turniej” jako nazwa, „1-6 osób” mono pod spodem, opis `:112-116` pod kaflem |

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

- `TournamentSetup`: keyframes brak; przejścia `transition-colors` (TU3). Timerów, `requestAnimationFrame`, `vibrate` brak.
- Część turniejowa `Game.tsx`: `title-pop` 0,5 s u mistrza turnieju (`:243`, `headline === me`; B-41 `[zbiorcze: keyframes-poza-5]`, wpis platformy); odznaka punktów w `GameDots` zmienia się bez `stone-pop`, bo `plus` jest `false` przy `table` (`Game.tsx:165`, `ui.tsx:125`): spokojnie, zgodne; `float-up` „+1” nie występuje w turnieju (zgodne: punkty to nie wygrane).
- `Countdown` (`setInterval` 250 ms, `Game.tsx:582`): licznik tekstu, nie animacja (02-03; jak B-75).
- Wibracja: każda nowa gra turnieju zaczyna się z `myTurn` = `true` (mini-gra czeka na wszystkich), więc `Game.tsx:35` wibruje 40 na starcie gry; to „moja tura”, zgodne. Przejście między grami, dogrywka i wygrana turnieju nie wibrują (zgodne: tabela §5 nie ma takich zdarzeń).
- Pomiaru czasu w części turniejowej brak.

Bez rozbieżności poza TU3 (i wpisami platformy B-41, B-63 w 02-02).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowo na przycisku |
|---|---|---|---|
| zaznaczenie gry (losowo → na pewno → bez) | `transition-colors` 150 ms (TU3) | brak | kafel (bez słowa), start: „Zagraj: …” / „Zgłaszam gotowość: …” (`StartBar`) |
| moja tura (start kolejnej gry) | ekran instrukcji `Intro` (mini-gra) | 40 z `Game.tsx:35` | „Start” |
| odsłona prawdziwego wyniku (wyniki gry i tabela) | brak (tabela od razu, punkty w odznakach bez animacji) | brak | „Dalej” → „Czekamy na: {nicki}…”; gospodarz: „Zakończ turniej” |
| koniec rundy (koniec jednej gry turnieju) | brak; tytuł wygranej gry: `title-pop` 0,5 s u zwycięzcy gry | brak | „Dalej” (sama po 15 s) |
| dogrywka | brak (tekst „dogrywka” w `.label` i w „Następna gra”) | brak | „Dalej” |
| koniec partii (koniec turnieju) | `title-pop` 0,5 s u mistrza (`Game.tsx:243`) | brak | „Rewanż”, „Do lobby” |
| trafienie, pomyłka, zbicie | w mini-grach (02-07..02-10) / nie występuje | - | - |

Uwaga poza zakresem fazy 2: tabela turnieju numeruje miejsca `i + 1` (`Game.tsx:432`), więc gracze z równą sumą i wygranymi dostają różne numery; to sprawa zasad prezentacji (faza 4 razem z remisami w rankingach), nie wyglądu.

---

## Odstępstwa z powodem (D-04, D-05; bez wagi)

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| własny nagłówek Państw-miast: gracze w jednej linii z punktami zamiast `Stats` | `PanstwaMiasta.tsx:28-63` | `DESIGN.md` §6; `ZASADY.md` §4 „Własny nagłówek ma tylko gra, której wspólny nie wystarcza (Państwa-miasta …)” |
| własny nagłówek Kalamburów: gracze w linii z punktami, hasło jako tytuł | `Kalambury.tsx:47-85` | `DESIGN.md` §6 (wymienia Kalambury; `ZASADY.md` §4 wymienia tylko Państwa-miasta i Kampus Tour, więc lista w `ZASADY.md` §4 jest niepełna: do dopisania w fazie 4, sprzeczność źródeł D-13, niska) |
| paleta Kalamburów (`#facc15`, `#4ade80`, `#60a5fa`, `#b4763a`) | `Kalambury.tsx:21-28` | D-04 (paleta Kalamburów jako kolor treści gry), jedno źródło w pliku; biały i gumka z tokenów `fg` / `surface` |
| `--ambient` zawsze w kolorze rysującego | `Game.tsx:53-54` | `DESIGN.md` §1 p. 1 („W Kalamburach to zawsze kolor rysującego”) |
| przewijanie Państw-miast powyżej 640 px | `PanstwaMiasta.tsx` | **nie** jest odstępstwem: `DESIGN.md` §6 wymienia je wśród „Rozbieżności do decyzji”, więc to zwykły wpis PM1 (D-05) |
| odznaka turnieju prostokątna | `ui.tsx:125` (`square`) | `ZASADY.md` §4 („w turnieju prostokątna”); promień 4 px to wpis platformy B-61 `[zbiorcze: promien]` |

## Zestawienie

| Waga | Wpisy |
|---|---|
| wysoka | PM1, KL1 |
| średnia | PM2, PM3, PM4, PM5, PM6, PM11, KL2, KL7 |
| niska | PM7, PM8, PM9, PM10, PM12, PM13, PM14, KL3, KL4, KL5, KL6, KL8, TU1, TU2, TU3, TU4, TU5, TU6, TU7, TU8 |

Razem 30 wpisów: 2 wysokie, 8 średnich, 20 niskich (odsyłacze „(PM10)”, „(PM11)” w Kalamburach nie są osobnymi wpisami), plus 6 pozycji na liście odstępstw.

Klucze zbiorcze użyte tu: istniejące `dotyk-48` (PM3), `slowa` (PM10, PM12), `transition-domyslny` (KL3, TU3), `aria-hidden` (KL5), `waga-ikon` (KL6), `liczby-mono` (TU7), `promien` (odznaka, B-61);
nowe: `rola-tokenu` (PM4, PM5), `kolor-jedyny-sygnal` (PM6), `stan-krycie` (PM7, TU4), `naglowek-wlasny` (PM8, PM9), `dalej-kolor` (PM11), `wibracja-fazy` (PM13, KL7).

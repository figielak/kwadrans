# 02-03 FINDINGS: ekrany platformy (Game, Home, Lobby, Setup, MiniGames, Records, App)

Częściowe ustalenia fazy 2 dla ekranów platformy, scalane w `FINDINGS.md` przez 02-11.

- **Źródła reguł:** `ZASADY.md` §4 i §5, `DESIGN.md` §2, §3, §4, §5, §6, `AGENTS.md` (twarde reguły UI), `KONCEPT.md` §1, §2.4, §3; decyzje D-01..D-13 z `02-CONTEXT.md`.
- **Dowody:** wiersze z `02-01-CHECKS.md` (cytowane jako „CHECKS §n”), wzorce z `02-02-BASELINE.md` (B-xx, W-xx). Wpisy z wzorców platformy (`index.css`, `ui.tsx`) tylko odsyłają do B-xx (D-03).
- **Metoda:** lektura całych plików i grep, bez przeglądarki. **360×640 sprawdzono statycznie** (D-09): szerokości i wysokości z klas Tailwinda, szacunek szerokości znaków Satoshi ok. 0,5 em i Geist Mono ok. 0,6 em; na 360 px `Screen` daje 328 px treści, a kafel `.tile` (20 px wnętrza + obrys) 286 px.
- **Zakres:** `Game.tsx` bez części turniejowej (`:136-144`, `:234-239`, `:294-297`, `:426-453`, `NextActions` `:540-566`: plan 02-06); `Setup.tsx` tylko `Setup` (`:17-65`), `TournamentSetup` to 02-06. Komponenty `Players`, `StartBar`, `Tile`, `GameTile` z `Lobby.tsx` ocenione raz w sekcji Lobby; `RecordList` i `RecordPanel` z `Records.tsx` raz w sekcji Records.
- **Stan kodu:** gałąź `labirynt`, 2026-10-23/24, repo poza `.planning/` bez zmian.
- Identyfikatory wpisów: `GM-` Game.tsx, `HM-` Home.tsx, `LB-` Lobby.tsx, `SU-` Setup.tsx, `MG-` MiniGames.tsx, `RC-` Records.tsx, `AP-` App.tsx.

Nowe klucze zbiorcze tej paczki: `wysokosc-640`, `ladowanie-rekordow`, `podpis-label`, `aria-label-span`, `stan-rozlaczony`. Pozostałe klucze pochodzą z 02-02-BASELINE.md.

---

## Game.tsx

Plik: `apps/web/src/screens/Game.tsx` (611 linii). Wspólny nagłówek partii, pasek limitu, wibracja tury, poświata, „Oglądasz”, ekran po partii.

### Wygląd (UI-01, UI-02, UI-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| GM-1 | `Game.tsx:455-459` | Przyciski po partii („Rewanż” / „Do lobby”, solo „Jeszcze raz” / „Wyjdź”) leżą w zwykłym `div` z `mt-auto`, nie w `StickyBar`. Ekran po mini-grze to nagłówek (ok. 100 px) + ekran końcowy gry (`Scores` i często `RoundTable`, 250-450 px) + `RecordPanel` (ok. 360 px: tytuł, miejsce, zdanie, „Wyżej”, 5 wierszy) + przyciski (112 px), razem ok. 850-1000 px; nawet solo ok. 880 px. Na 360×640 „Rewanż” jest pod zgięciem i trzeba przewijać, żeby zagrać dalej. Sprawdzone statycznie | `ZASADY.md` §4 „Z czego gra się składa” (przy długiej treści `StickyBar`), `DESIGN.md` §2 (akcje przy dolnej krawędzi), W-14 | średnia | `OverActions` w `StickyBar` (jak `StartBar` w lobby); to samo rozwiązuje `NextActions` turnieju (02-06) |
| GM-2 | `Game.tsx:93` | Kampus Tour dostaje `<Countdown game={game} total={def.turnSeconds} />` bez `color`, więc pasek limitu jest `fg-muted`, a nie w kolorze gracza z ruchem (w innych grach `:254` daje `myColor` / `turnColor`). Własny układ Kampus Tour (`DESIGN.md` §6) zwalnia z układu nagłówka, nie z koloru paska, a pasek rysuje `Game.tsx` | `ZASADY.md` §4 „Czego gra nie rysuje sama” (pasek czasu w kolorze gracza), `DESIGN.md` §3.4 | średnia | `color={turnColor}` w `:93` (i `myColor` przy własnej turze, jak w `:254`) |
| GM-3 | `Game.tsx:264-328` | Pigułki graczy w grach głównych nie pokazują rozłączenia (`p.connected` nieużyte): w Gomoku, Chińczyku, Memory, Labiryncie, Statkach rywal, który zniknął, wygląda tak samo jak obecny, a partia czeka do 10 minut. `GameDots` (mini-gry) i `PlayerDots` (lobby) ten stan mają | `DESIGN.md` §4 „gracz rozłączony” (w partii przerywany obrys), `ZASADY.md` §4 „Czego gra nie rysuje sama” | niska `[zbiorcze: stan-rozlaczony]` | przerywany obrys `fg-muted` i `opacity-40` pigułki rozłączonego plus słowo „rozłączony” w `aria-label`, jak w `GameDots` (`ui.tsx:100-140`) |

Odsyłacze i zgodne:
- Akcent: na ekranie po partii jeden `btn-primary` („Rewanż” `:525` albo solo „Jeszcze raz” `:501`), obok `btn-ghost` (CHECKS §2 `:501`, `:525`). Zgodne z `DESIGN.md` §5 („Rewanż”, „Jeszcze raz” w akcencie); W-05 zgodne. `:554` należy do turnieju (02-06).
- Kolor gracza: tytuł `:244` w kolorze zwycięzcy albo moim przy mojej turze; „Ruch: <nick>” z nickiem w `turnColor` (`:205`); aktywna pigułka: obrys i tło 16% w kolorze gracza (`:269`); kropki `:271` przez `style`. Brak kolorów spoza tokenów (CHECKS tabela zbiorcza: kol 0). Zgodne.
- Pasek limitu (`:592-602`): `h-1.5` (6 px), `rounded-full`, kolor gracza, w ostatnich 10 s `bg-warning` i sekundy `text-warning`, liczba sekund obok (kolor nie jest jedynym sygnałem). Zgodne z `DESIGN.md` §3.4 i §4 „koniec czasu”. Mini-gry mają podpis `.label` „Limit” / „Czas” (`:255`). Pulsowanie: GM-4.
- Poświata `--ambient` (`:54-62`): kolor gracza, na którego czekamy, w Kalamburach rysującego, bez przejścia (B-21). Zgodne z `DESIGN.md` §1.
- Zaokrąglenia: tylko `tile`, `rounded-full`; cieni brak. Zgodne.
- Pola dotykowe: „Wyjdź” solo `min-h-12` (`:226`), przyciski `.btn`. Pól gry na czas w `Game.tsx` nie ma (`touch-none` / `onPointerDown` to sprawa gier).
- 360×640: jedyne `whitespace-nowrap` to sekundy `:601` (najwyżej „173 s”, `min-w-10`), pigułki `flex-wrap`, tytuł zawija się; brak stałych szerokości poza `w-10` paska postępu w pigułce. Bez poziomego przewijania (statycznie). Wysokość nagłówka gry głównej dla 2 graczy ok. 140 px (kafel `p-4`, tytuł 28 px, pasek 20 px, pigułki 36 px), dla 6 graczy ok. 210 px; wysokość pola gry oceniają plany gier.

### Teksty, liczby i dostępność (UI-04, UI-05)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| GM-4 | `Game.tsx:287` | Liczba par w Memory w pigułce: `text-base font-semibold tabular-nums` bez `font-mono` (wygrane `:300` i ściany `:321` mają mono) | `DESIGN.md` §5 „Liczby są mono”, W-16 | niska `[zbiorcze: liczby-mono]` | dopisać `font-mono` |
| GM-5 | `Game.tsx:276`, `:287`, `:300`, `:321` | `aria-label` na zwykłym `span` (bez `role`): czytniki ekranu zwykle pomijają nazwę elementu generycznego, więc „W domu: 2 z 4”, „Pary: 3”, „Wygrane partie: 1”, „Ściany: 5” mogą nie zostać odczytane, a widoczny tekst obok jest `aria-hidden` (`:302`, `:322`) | `ZASADY.md` §4 (dostępność: ozdoba `aria-hidden`, nazwa tam, gdzie trzeba) | niska `[zbiorcze: aria-label-span]` | `role="img"` przy `aria-label` albo tekst w `sr-only` zamiast `aria-label` |
| GM-6 | `Game.tsx:594` | `role="progressbar"` z `aria-valuenow={seconds}` bez `aria-valuemin` / `aria-valuemax`: domyślne max 100, więc 60 s czyta się jako 60% | jak GM-5 | niska | `aria-valuemin={0} aria-valuemax={total}` (albo `aria-valuetext="45 s"`) |
| GM-7 | `Game.tsx:227` | Ikona `ArrowLeft` 16 px w wadze `regular` w małej akcji „Wyjdź” (B-57) | `DESIGN.md` §2 „`bold` w małych akcjach (16-18 px)” | niska `[zbiorcze: waga-ikon]` | `weight="bold"` |

Zgodne:
- Słowa: „Rewanż” (`:530`), „Do lobby” (`:534`), „(ty)” (`:273`, `:409`), „Jeszcze raz” i „Wyjdź” (solo, nazwane w `KONCEPT.md` §1), „Oglądasz” (`:335`). Nagłówki „Twój ruch”, „Ruch: <nick>”, „Czekamy na: …”, „Wygrywasz!”, „Wygrywa <nick>”, „Remis”, „Koniec” (solo), „Ustaw statki” (`:181-206`). Zgodne z `ZASADY.md` §4. W-18 zgodne.
- Em-dash i kropka dziesiętna: brak (CHECKS §7: 0 trafień w `Game.tsx`). Wszystko po polsku.
- Liczby: sekundy (`:601`), wygrane (`:300`), postęp (`:488`), miejsca w rankingu (`:406`) w mono z `tabular-nums`. Liczby nad polem gry: pigułki z wygranymi i postępem to zakres „Czego gra nie rysuje sama”, nie liczby gry, więc nie łamią W-01.
- Stany `DESIGN.md` §4: „Rewanż” po kliknięciu jest `disabled` z tekstem „Czekamy na: …” (podpis stanu nieaktywnego, `:526-530`); „X chce rewanżu” z `role="status"` (`:518`); utrata połączenia przez `Screen dropped` (`:223`, B-55). `Intro` dostarcza `IntroContext` (`:214-219`, B-71); własnego `Intro` ekran platformy nie potrzebuje.
- Ozdoby `aria-hidden`: kropki `:271`, `:407`, ikony `:227`, `:301`, `:334`, `:502`, `:529`, „+1” `:313`. Przyciski bez tekstu: brak.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| GM-8 | `Game.tsx:596` | Pasek w ostatnich 10 s pulsuje `animate-pulse` Tailwinda (pętla 2 s, bez keyframes z komentarzem); to ruch powtarzany, a ostrzeżenie niosą już kolor `warning` i sekundy (B-50) | `ZASADY.md` §5 „Mechanizm”, `DESIGN.md` §1 („ekran nie świeci, nie miga”) | niska `[zbiorcze: animate-tailwind]` | zostawić sam kolor `warning` albo nazwać pulsowanie w `index.css` i w §5 |
| GM-9 | `Game.tsx:596`, `:486` | Szerokość paska limitu `transition-[width] duration-300 ease-linear` i paska postępu w pigułce `duration-200`: czasy spoza tabeli §5 (najbliżej „przejście stanu 180 ms”), kategoria „pasek, który się kurczy / rośnie” w tabeli nie istnieje | `ZASADY.md` §5 „Czasy”, D-06 | niska `[zbiorcze: brak-w-tabeli-5]` | dopisać do tabeli „pasek czasu / postępu: przejście szerokości równe kroku odświeżania (250-300 ms, `linear`)” albo użyć 180 ms |
| GM-10 | `Game.tsx:266` | `transition-colors` pigułki z domyślnym czasem Tailwinda 150 ms (B-62) | `ZASADY.md` §5 „Czasy” (180 ms) | niska `[zbiorcze: transition-domyslny]` | `duration-180` |

Odsyłacze: `title-pop` 0,5 s z własnym easingiem u zwycięzcy (`:243`) to B-41 `[zbiorcze: keyframes-poza-5]`; `stone-pop` 0,5 s na liczbie wygranych (`:306`) to B-63 `[zbiorcze: czas-pojawienia]`; `ring-pulse` 1,2 s na „Rewanż”, gdy inni już chcą (`:525`), to B-36 `[zbiorcze: ring-pulse-czas]`. Nowych wpisów nie dodaję.

Ocena każdego elementu ANIM:
- `navigator.vibrate?.(40)` (`:35`, CHECKS §15): w `useEffect` z zależnością `[myTurn]`, więc wibruje raz przy przejściu na moją turę, nie przy każdym renderze ani nie ponownie, gdy ten sam gracz ma kolejny ruch (Statki po trafieniu, Chińczyk po szóstce, dublet w Kampus Tour). Wzór 40, z `?.`. **Zgodne** z tabelą §5. Uwagi bez wagi: (1) w mini-grach `myTurn` jest prawdą od początku, więc 40 przychodzi przy pojawieniu się ekranu instrukcji (start partii), co pasuje do „moja tura”; (2) ponowne zamontowanie `Game` (odświeżenie w trakcie mojej tury) wibruje jeszcze raz.
- `float-up` 1,6 s `ease-out forwards` „+1” nad zwycięzcą (`:311`): kategoria „pływająca liczba” 1,6 s, kolor gracza, `aria-hidden`, `pointer-events-none`. **Zgodne** (B-44).
- `setInterval` 250 ms w `Countdown` (`:582`, CHECKS §13): odświeża tekst licznika, nie steruje animacją ani pomiarem; termin liczony od wiadomości (`:578`). **Zgodne** (jak B-75). Animacji z JS (`setTimeout` kroków, `requestAnimationFrame`, `startViewTransition`) w pliku nie ma, więc `reducedMotion` nie jest potrzebny; przejścia CSS obejmuje reguła globalna (B-51).
- Nieblokowanie: żadna animacja nie wyłącza przycisków; `title-pop`, `stone-pop`, `float-up` grają na elementach bez obsługi dotyku. Nowy stan z serwera podmienia treść od razu (np. `key` z wyniku w `:306`). Zgodne z §5.
- Pomiar czasu: brak w `Game.tsx` (CHECKS tabela: pomiar 0).
- **Ukrycie licznika** (`:208-210`): pasek limitu znika u grającego w Stoperze, Rytmie, Przytrzymaj i Za zasłoną (`myTurn`), a na ekranie instrukcji u wszystkich (`!game.intro`). Zgodne z `KONCEPT.md` §2.4 (Rytm, Przytrzymaj, Za zasłoną: grający nie widzi limitu; Stoper: licznik znika po 3 s). Po oddaniu wyniku i u obserwatora pasek wraca, co niczego nie zdradza. Brak wpisu wysokiej wagi.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| moja tura | brak; tytuł „Twój ruch” i pasek w moim kolorze, poświata przeskakuje bez przejścia | 40 (`:35`) | brak |
| tura innego gracza | brak; „Ruch: <nick>” w jego kolorze | brak | brak |
| ostatnie 10 s limitu | `animate-pulse` (Tailwind, 2 s ∞) + `warning` (GM-8) | brak | brak |
| postęp rywala w mini-grze | przejście szerokości 200 ms (GM-9) | brak | brak |
| koniec partii, wygrywam | `title-pop` 0,5 s `cubic-bezier(0.2,0.8,0.4,1)` (tylko u zwycięzcy) | brak | „Rewanż”, „Do lobby” (solo: „Jeszcze raz”, „Wyjdź”) |
| koniec partii, licznik wygranych | `stone-pop` 0,5 s `ease-out` na liczbie + `float-up` 1,6 s „+1” | brak | jak wyżej |
| inni chcą rewanżu | `ring-pulse` 1,2 s `ease-in-out` ∞ na „Rewanż” | brak | „Rewanż”; po kliknięciu „Czekamy na: …” |
| pojawienie elementu, trafienie, pomyłka, odsłona wyniku, koniec rundy, zbicie | nie dotyczy (rysują gry) | nie dotyczy | nie dotyczy |

---

## Home.tsx

Plik: `apps/web/src/screens/Home.tsx` (343 linie). Ekran główny, lista wszystkich mini-gier (`screen === "all"`); ekran „Rekordy” w sekcji Records.

### Wygląd (UI-01, UI-02, UI-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| HM-1 | `Home.tsx:160`, `:241` | Przy pełnym kodzie na ekranie są dwa wypełnione przyciski akcentu: „Zagraj” i „Dołącz”. Najdłużej przy wejściu z linku `/?kod=ABCD` (kod pełny od startu, czeka na przycisk) i po błędzie złego kodu (kod zostaje pełny). `KONCEPT.md` §1 i `DESIGN.md` §3.1 tak to opisują, a `DESIGN.md` §5 („Jeśli na ekranie są dwa czerwone elementy, jeden z nich jest zbędny”) temu przeczy | D-13 (sprzeczność źródeł), `DESIGN.md` §5 / §3.1, `KONCEPT.md` §1 | niska | przy pełnym kodzie „Zagraj” jako `btn-ghost` (akcja ekranu to wtedy dołączenie) albo dopisać wyjątek w `DESIGN.md` §5 |
| HM-2 | `Home.tsx:28` | Ćwiartka logo w `fill-accent`: znak aplikacji nie ma roli akcentu w `DESIGN.md` §2 („główna akcja, focus, zaznaczony kafel”) i jest trzecią czerwienią obok ikony wyzwania (`:146`) i „Zagraj” | `DESIGN.md` §2, §5 „Akcent jest rzadki”, D-04 | niska | dopisać „znak aplikacji” do roli `accent` w `DESIGN.md` §2 albo do §6 (logo to ta sama grafika co `public/icon.svg`, więc zmiana koloru nie jest wskazana) |
| HM-3 | `Home.tsx:188`, `:195` | Dwa przyciski `whitespace-nowrap px-2` w siatce 2 kolumn: na 360 px kolumna ma ok. 139 px ((286 − 8) / 2), a „Wszystkie (30)” z ikoną 18 px i odstępem 8 px to szacunkowo 140-158 px. Tekst może wyjść poza obrys pigułki (nie poza ekran: nadmiar mieści się w wewnętrznym marginesie kafla, więc poziomego przewijania nie ma). Szacunek na granicy, do potwierdzenia w przeglądarce | `ZASADY.md` §4 (360×640), CHECKS §6 | niska | usunąć `whitespace-nowrap` albo skrócić do „Wszystkie” (liczba gier jest w podpisie listy) |

Odsyłacze i zgodne:
- Jedyny wypełniony przycisk w stanie spoczynku to „Zagraj” (`:160`); „Dołącz” `btn-ghost` i `disabled` bez pełnego kodu, `btn-primary` z pełnym (`:241`). Zgodne z `DESIGN.md` §3.1 i §4 „przycisk nieaktywny” (z wyjątkiem HM-1).
- Ikona wyzwania dnia: `size-12 rounded-inset bg-accent-soft text-accent`, ikona `fill` (`:146-147`): rola `accent-soft` z `DESIGN.md` §2 i waga `fill` dla wyróżnionej. Odstępstwo z powodem (lista na końcu).
- „Grasz jako … · zmień” (`:309-315`): „zmień” to przycisk `min-h-12`, `text-fg-muted underline underline-offset-4`. Zgodne z `DESIGN.md` §5 (link `fg-muted` z podkreśleniem). Nick ma `truncate` bez `min-w-0`, ale `NICK_MAX` = 16 znaków (`lobby.ts:9`) mieści się w 328 px razem z „Grasz jako” i „zmień” (ok. 300 px, statycznie).
- `Problem` (`:33-42`): `role="alert"`, ikona `Warning` `fill` 16 px z `aria-hidden`, tekst 14 px `warning`, puste ukryte; pola mają `aria-invalid` i `aria-describedby` (`:231-232`, `:298-299`), więc ramka i focus idą w `warning` (B-30). Zgodne z `DESIGN.md` §4 „błąd formularza”.
- Kolejność sekcji: przy `/?kod=` najpierw „Ze znajomymi” (`:319`). Zgodne z `KONCEPT.md` §1.
- Podpisy sekcji `.label` z ikoną 14 px nad kaflem (`:138`, `:207`, `:323`). Zgodne z `DESIGN.md` §3.1.
- Pola dotykowe: wszystkie przyciski `.btn` albo `min-h-12` (`:106`, `:172`, `:270`, `:312`, `:329`); pole kodu i nicku `.field` (48 px). Pole kodu w wierszu z „Dołącz”: `.field` ma `width: 100%`, a pola formularza z procentową szerokością się ściskają, więc na 360 px zostaje ok. 152 px na 4 znaki mono 20 px (ok. 80 px). Zgodne.
- Kolory: tylko tokeny (CHECKS kol 0). Cieni brak, zaokrąglenia `tile`, `rounded-inset`, pigułki.
- Wysokość: wpis zbiorczy HM-8.

### Teksty, liczby i dostępność (UI-04, UI-05)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| HM-4 | `Home.tsx:151-156`, `:332`, `:334` | Wyniki w linii wyzwania dnia („Lider Ola 215 ms · ty: 240 ms”), liczba graczy i „5 min temu” w Satoshi bez `tabular-nums`, choć wiersze podpowiedzi tuż niżej (`:176`) mają `font-mono tabular-nums` | `DESIGN.md` §5 „Liczby są mono” | niska `[zbiorcze: liczby-mono]` | wynik w `<span className="font-mono tabular-nums">`, jak w `:176` |
| HM-5 | `Home.tsx:99`, `:111`, `:160-163` | Start gry solo nie ma stanu ładowania: „Zagraj” i kafle zostają z tym samym tekstem (tylko `disabled`), a podpis listy zmienia się na „Dotknij gry, żeby zagrać …” (wielokropek zamiast słowa „samemu.”). „Rekordy” (`:270`) i „zmień” (`:312`) nie są blokowane w trakcie łączenia | `DESIGN.md` §4 „ładowanie” (czasownik z wielokropkiem, wszystkie akcje nieaktywne) | niska | „Uruchamianie…” na klikniętym przycisku albo w podpisie listy; `disabled={!!busy}` także na „Rekordy” i „zmień” |
| HM-6 | `Home.tsx:107`, `:196` | `ArrowLeft` 16 px `regular` w małej akcji „Wróć”; `SquaresFour` `regular` obok `Shuffle` `bold` (`:192`) w dwóch równych przyciskach | `DESIGN.md` §2 (waga ikon) | niska `[zbiorcze: waga-ikon]` | `weight="bold"` w obu |
| HM-7 | `Home.tsx:60`, `:112` (przez `MiniGames.tsx:50`, `:66`) | Lista mini-gier (i podpowiedzi pod wyzwaniem) liczy miejsca z `records`, które do odpowiedzi serwera są `{}`: każdy kafel pokazuje „nie grane”, a po chwili zmienia się na „2. miejsce”; przy błędzie pobierania fałszywe „nie grane” zostaje | `DESIGN.md` §4 „ładowanie”, „stan pusty” (stan pusty tylko, gdy naprawdę pusto) | niska `[zbiorcze: ladowanie-rekordow]` | `records: null` do odpowiedzi i w tym czasie pusta linia stanu (albo „…”) zamiast „nie grane” |

Zgodne:
- Stany ładowania z czasownikiem: „Łączenie…” (`:242`), „Tworzenie…” (`:252`), wszystkie akcje `disabled={!!busy}`. Stan pusty „Dziś nikt jeszcze nie grał” (`:153`). Zgodne z `DESIGN.md` §4.
- Em-dash, kropka dziesiętna: brak (CHECKS §7). „Wróć” (`:108`, CHECKS §7): dla powrotu do poprzedniego ekranu nie ma słowa wspólnego w `ZASADY.md` §4, a ekran „Rekordy” używa tego samego (`Records.tsx:336`), więc zgodne. „Wróć do pokoju” nazwane w `KONCEPT.md` §1. „2 graczy” poprawne (liczebnik męskoosobowy).
- Kod pokoju w mono z odstępem (`:221`, `:330`). Przycisk rekordów bez tekstu ma `aria-label` (`:270`); ikony `aria-hidden`; kropka separatora `aria-hidden` (`:311`). Przycisk podpowiedzi (CHECKS §9 `:172`) ma tekst z wyrażenia (nazwa gry), zgodne.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

Bez rozbieżności. W pliku nie ma `@keyframes`, `animate-*`, `transition-*` poza `.btn` (180 ms, B-24), `setTimeout` / `setInterval` / `requestAnimationFrame` ani `navigator.vibrate` (CHECKS tabela zbiorcza: anim 0, trans 0, timery 0, vibrate 0). `Math.random` w `:190` wybiera losową grę na kliencie (to nie zasady gry, `AGENTS.md` dotyczy `packages/games`). Pomiaru czasu brak.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| dotknięcie przycisku | `.btn:active` skala 0,98, 180 ms (B-24) | brak | „Zagraj”, „Losowa gra”, „Wszystkie (30)”, „Dołącz”, „Utwórz pokój”, „Zapisz”, „zmień”, „Wróć” |
| ładowanie (dołączenie, tworzenie) | brak; tekst przycisku „Łączenie…” / „Tworzenie…” | brak | jak obok |
| błąd formularza | brak; `Problem` z ikoną i ramka pola w `warning` | brak | bez zmian |
| pojawienie elementu (wyzwanie dnia, podpowiedzi po odpowiedzi serwera) | brak (wskakuje bez przejścia) | brak | brak |
| trafienie, pomyłka, odsłona wyniku, koniec rundy, koniec partii, zbicie, moja tura | nie dotyczy | nie dotyczy | nie dotyczy |

### HM-8: wysokość ekranów poza partią `[zbiorcze: wysokosc-640]`

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| HM-8 | `Home.tsx:265-341`, `Lobby.tsx:75-103`, `Setup.tsx:21-64`, `Records.tsx:332-403` | `DESIGN.md` §6 twierdzi, że „mini-gry i pozostałe ekrany mieszczą się w 640 px”. Statyczny szacunek: ekran główny z podpowiedziami i „Wróć do pokoju” ok. 890 px (bez nich ok. 620 px); lobby gospodarza z 8 grami głównymi ok. 1000 px przy 2 graczach; `Setup` Statków (4 tryby) ok. 860 px; „Rekordy” z 30 grami wielokrotnie więcej. Pionowe przewijanie jest tu w porządku (akcje w `StickyBar` w lobby i `Setup`, poziomego przewijania brak), więc to błąd opisu, nie ekranu | `DESIGN.md` §6 wobec `ZASADY.md` §4 (reguła dotyczy poziomego przewijania) | niska | w `DESIGN.md` §6 napisać, że listy (ekran główny, lobby, `Setup`, „Rekordy”) przewijają się w pionie z akcją w `StickyBar`, a 640 px dotyczy ekranu partii |

---

## Lobby.tsx

Plik: `apps/web/src/screens/Lobby.tsx` (451 linii). Ekran lobby oraz wspólne `Players`, `StartBar`, `Tile`, `GameTile`, `ICONS`, `BLURBS` (używane też w `Setup.tsx`, `MiniGames.tsx`, `Home.tsx`).

### Wygląd (UI-01, UI-02, UI-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| LB-1 | `Lobby.tsx:435` | „Wyjdź” w kaflu kodu: `-m-2 p-2 text-sm`, czyli ok. 36 px wysokości (20 px linii + 16 px), bez `min-h-12`. CHECKS §4 go nie złapał (brak klasy rozmiaru) | `ZASADY.md` §4 „pola dotykowe co najmniej 48 px”, `AGENTS.md` | średnia `[zbiorcze: dotyk-48]` | `min-h-12` (jak „Wyjdź” w `TopBar` `ui.tsx`) |
| LB-2 | `Lobby.tsx:392` | Próbki koloru gracza: przycisk `size-10` (40 px), kółko 28 px (CHECKS §4 `:385`). Plan i `AGENTS.md` wymagają 48 px; 6 × 48 px = 288 px przy 286 px wnętrza kafla na 360 px, więc wymaga to `gap-0` albo `justify-between` z ściśnięciem o 2 px | `ZASADY.md` §4, `AGENTS.md` | średnia `[zbiorcze: dotyk-48]` | `size-12` przycisku (kółko może zostać 28 px), ewentualnie kafel `p-4` |
| LB-3 | `Lobby.tsx:158` | Wiersz gracza jako przycisk u gospodarza (przeniesienie między grającymi a oglądającymi, także w `Setup`): `min-h-11` (44 px) | `ZASADY.md` §4, `AGENTS.md` | średnia `[zbiorcze: dotyk-48]` | `min-h-12` |
| LB-4 | `Lobby.tsx:143`, `:158` | Rozłączony gracz: cały wiersz `opacity-50` plus słowo „rozłączony”. `DESIGN.md` §4 mówi o kryciu 40% kropki; tu 50% całego wiersza, więc `fg-muted` przy 50% traci kontrast | `DESIGN.md` §4 „gracz rozłączony” | niska `[zbiorcze: stan-rozlaczony]` | `opacity-40` tylko na kropce, słowo „rozłączony” zostaje w pełnym kryciu |

Odsyłacze i zgodne:
- Kod pokoju (`:442`): Geist Mono `text-6xl` (60 px), `font-medium`, `tracking-[0.12em]`, nad nim `.label`, obok okrągły przycisk 48 px z `aria-label` „Udostępnij link” i ikoną `bold` (`:444-446`); kopiowanie przez dotknięcie kodu z `aria-label` (`:441`). Na 360 px: 4 × 0,72 em × 60 px ≈ 173 px + 16 + 48 px, mieści się w 286 px. Zgodne z `DESIGN.md` §3.2 i §2.
- Ikony gier `regular`, `fill` dla zaznaczonej (`:260`). Zgodne z `ZASADY.md` §4 i `DESIGN.md` §2.
- Stany kafli (`:255-257`, `:275`): zaznaczony `border-accent bg-accent-soft` + ikona `fill` + `aria-pressed`; przygaszony `opacity-60` z podpisem „brakuje 1 gracza”; nieaktywny `opacity-40` + `disabled` z podpisem „max 2 os.” / „tylko 2 os.”. Zgodne z `DESIGN.md` §4 (CHECKS §2 `:256`: rola akcentu zgodna).
- Wybrany kolor: `outline-2 outline-offset-2 outline-fg` + `Check` w `text-bg` (`:396`, `:399`); zajęty: 25% koloru, inicjał właściciela, `disabled`, `aria-label` „…, zajęty: <nick>” (`:390`, `:397`, `:400`); `role="radiogroup"` / `radio`. Zgodne z `DESIGN.md` §4; kolor nie jest jedynym sygnałem.
- Akcent: jeden `btn-primary` naraz: „Zagraj: <gra>” u gospodarza (`:213`) albo „Zgłaszam gotowość” u gościa (`:223`, po zgłoszeniu `btn-ghost`). Gospodarz bez możliwości startu widzi zdanie zamiast wyszarzonego przycisku (`:219`). Zgodne z `DESIGN.md` §5 (gotowość w akcencie).
- `StickyBar` w `StartBar` (`:211`). W-14 zgodne. Tło wierszy graczy z koloru gracza przez `style` (`:159`). Kolorów spoza tokenów brak.
- 360×640: siatka gier `grid-cols-2` (160 px na kafel, najdłuższy podpis „brakuje 1 gracza” ok. 139 px z wnętrzem), kafle szerokie w pełnej szerokości 328 px, wiersze graczy `truncate`. Bez poziomego przewijania (statycznie). Wysokość: HM-8.

### Teksty, liczby i dostępność (UI-04, UI-05)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| LB-5 | `Lobby.tsx:379` | „Twój kolor” to podpis bloku (wyboru koloru) w zwykłym Satoshi 14 px `fg-muted`, a nagłówek tego samego kafla „Gracze” jest `.label` (`:113`). Wyjątek `DESIGN.md` §5 obejmuje grupy w jednej liście („Grają” / „Oglądają” `:131`), nie osobny blok | `DESIGN.md` §5 „Podpis to `.label`” | niska `[zbiorcze: podpis-label]` | `.label` |
| LB-6 | `Lobby.tsx:436` | `SignOut` 16 px `regular` w małej akcji (jak B-57 w `TopBar`) | `DESIGN.md` §2 | niska `[zbiorcze: waga-ikon]` | `weight="bold"` |
| LB-7 | `Lobby.tsx:207` | „Czekamy na gotowość (1/3)”: liczby w Satoshi bez `tabular-nums` (licznik „W pokoju 2/6” `:114` jest mono) | `DESIGN.md` §5 | niska `[zbiorcze: liczby-mono]` | liczby w `font-mono tabular-nums` |
| LB-8 | `Lobby.tsx:68-69` | Stan ładowania lobby to dwa pulsujące szkielety `animate-pulse` (pętla 2 s) zamiast słowa z wielokropkiem; `aria-label="Wczytywanie"` na `div` bez `role` (czytniki go pomijają), drugi bez etykiety | `DESIGN.md` §4 „ładowanie” (bez spinnera), B-50 | niska `[zbiorcze: animate-tailwind]` | „Łączenie…” `text-fg-muted` z `role="status"`, bez pulsowania |

Zgodne:
- Słowa: „(ty)” (`:140`), „gotowe”, „czeka”, „rozłączony”, „Oglądasz. Czekamy, aż … zacznie”, „Skopiowano!”, „Wyjdź”. Start w lobby to „Zagraj: <gra>” (rola startu partii z lobby, „Start” jest słowem `Intro`), zgodne z `KONCEPT.md` §1 („Zagraj”). `BLURBS` (`:330-369`) bez em-dashy, z przecinkiem dziesiętnym („1,5 s”), zakresy łącznikiem („1-4”).
- Podpisy kafli Geist Mono 12 px `fg-muted` (`:262`), zgodne z `DESIGN.md` §2. Grupy „Grają” / „Oglądają” Satoshi 14 px `fg-muted` (wyjątek §5).
- Dostępność: korona `aria-label="Gospodarz"` (`:154`), ozdoby `aria-hidden`; przyciski kafli i wierszy (CHECKS §9 `:163`, `:251`) mają tekst z wyrażenia (nick, nazwa gry): zgodne.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| LB-9 | `Lobby.tsx:158`, `:255` | `transition-opacity` i `transition-[color,border-color,opacity]` z domyślnym 150 ms; tło `bg-accent-soft` zaznaczonego kafla nie jest w liście przejść, więc obrys płynie, a tło przeskakuje | `ZASADY.md` §5 („przejście stanu 180 ms”, „zmiany stanu przez `transition-colors`”) | niska `[zbiorcze: transition-domyslny]` | `transition-colors duration-180` (obejmuje tło i obrys) |

Ocena pozostałych: `animate-pulse` `:68-69` w LB-8 (B-50); `setTimeout(…, 2000)` po kopiowaniu (`:417`, `:428`, CHECKS §13) zmienia tylko podpis „Skopiowano!”, to nie animacja: zgodne (uwaga bez wagi jak B-58: brak sprzątania przy wyjściu z ekranu; `navigator.clipboard.writeText` bez obsługi odmowy). Wibracji, animacji z JS i pomiaru czasu brak.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| ładowanie pokoju | `animate-pulse` 2 s ∞ (LB-8) | brak | brak |
| zaznaczenie / przygaszenie kafla, rozłączenie gracza | przejście 150 ms (LB-9) | brak | brak |
| skopiowanie kodu | brak; podpis „Skopiowano!” i ikona `Check` na 2 s | brak | brak |
| gotowość | `.btn` 180 ms, zmiana wypełnienia | brak | „Zgłaszam gotowość: <gra>” / „Gotowe, czekamy na <nick>”; start: „Zagraj: <gra>” |
| pojawienie elementu, trafienie, pomyłka, odsłona wyniku, koniec rundy, koniec partii, zbicie, moja tura | nie dotyczy | nie dotyczy | nie dotyczy |

---

## Setup.tsx i MiniGames.tsx

Pliki: `apps/web/src/screens/Setup.tsx` (tylko `Setup`, `:17-65`; `TournamentSetup` to 02-06) i `apps/web/src/screens/MiniGames.tsx` (147 linii: `MiniGameGrid`, `MiniGames`). `Players` i `StartBar` w sekcji Lobby (LB-3, LB-4, LB-5, LB-7, LB-9 dotyczą też `Setup`).

### Wygląd (UI-01, UI-02, UI-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| SU-1 | `Setup.tsx:48-49` | Wybrany tryb różni się od pozostałych tylko kolorem obrysu i tła (`border-accent bg-accent-soft`); nie ma ikony, znaczka ani zmiany wagi. Kafle gier w lobby mają dodatkowo ikonę `fill`, kafle turnieju znaczek | `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem”, §4 „kafel zaznaczony” (ikona `fill`) | średnia | znaczek `Check` (`bold`, 14 px) przy nazwie wybranego trybu albo wybrana nazwa `font-semibold` |
| SU-2 | `Setup.tsx:47`, `:49` | U gościa tryby są `disabled` z kryciem 50% i bez podpisu, dlaczego (wybiera gospodarz) | `DESIGN.md` §4 „przycisk nieaktywny” (40%), „Każdy stan, który coś blokuje, tłumaczy się podpisem” | niska | `disabled:opacity-40` i podpis pod „Tryb”: „Tryb wybiera gospodarz” |
| SU-3 | `Setup.tsx:29` | Tytuł ekranu (nazwa gry, `h1`) w Satoshi 16 px wagi 400: ani tytuł ekranu (30 px, 600), ani wyróżniona nazwa (600) z tabeli typografii; ekran „Mini-gry” na ekranie głównym i „Rekordy” mają `text-3xl font-semibold` | `DESIGN.md` §2 „Typografia” | niska | `font-semibold` (nazwa wyróżniona, jak „Wyzwanie dnia” w `Home.tsx:150`) |

Odsyłacze i zgodne (Setup):
- `TopBar` (`:23`, B-56): „Gry” u gospodarza wraca do listy przez `pickGame` z `null`, zgodne z `KONCEPT.md` §3. Ikona wybranej gry `fill` 28 px (`:27`), liczba miejsc mono 12 px (`:30`), opis `BLURBS` 14 px `fg-muted` (`:33`). Zgodne.
- Tryby: `role="radiogroup"` / `radio` z `aria-checked`, `min-h-12` (`:37-48`), podpis trybu mono 12 px (`:54`); zmiana trybu kasuje gotowość po stronie serwera, a `Players` od razu pokazuje „czeka” i przycisk gościa wraca do „Zgłaszam gotowość” (`Lobby.tsx:152`, `:223`). Zgodne z `KONCEPT.md` §3.
- Akcent: jeden `btn-primary` (`StartBar`). Kolory tylko z tokenów (CHECKS §2 `:49`: rola akcentu zgodna, poza SU-1).
- 360×640: kafel opisu, tryby i gracze w jednej kolumnie bez stałych szerokości; wysokość z 4 trybami Statków ok. 860 px, `StickyBar` z akcją (HM-8).

Zgodne (MiniGames):
- Siatka (`MiniGames.tsx:47-68`): `grid-cols-3` (w Tailwind v4 `minmax(0, 1fr)`), `gap-2`, kafle `rounded-inset` (10 px), `min-h-20` (80 px), ikona 20 px, nazwa 14 px, na dole linia mono 12 px z miejscem albo „nie grane”. Na 360 px kafel ma ok. 104 px (88 px wnętrza); najdłuższe słowo nazwy („Przytrzymaj”, ok. 77 px) i „10. miejsce” (ok. 79 px) się mieszczą. Zgodne z `DESIGN.md` §3.5. („10 px” w §3.5 to promień, odstęp w kodzie to 8 px; zgodne z §2 „wszystko w kaflu 10 px”.)
- Nagłówki grup Satoshi 14 px `fg-muted` (`:46`), wyjątek `DESIGN.md` §5. „1. miejsce” w kolorze gracza przez `style` (`:65`), jedyny kolor siatki. Na ekranie głównym gracz nie ma koloru (nie jest w pokoju), więc tam „1. miejsce” zostaje `fg-muted`: zgodne, to brak danych, nie błąd.
- Zaznaczona gra `border-accent bg-accent-soft` + ikona `fill` + `aria-pressed` (`:55-62`); gość widzi kafel „Wybrana gra” z opisem i rekordami (`:115-130`). Jeden `btn-primary` (`StartBar`). Przyciski „Losuj” (`.btn`) i rekordów (`size-12`, `aria-label`) 48 px.
- Własny `sticky` (`:133`) zamiast `StickyBar`, z `StartBar` (który sam jest `StickyBar`) w środku: obie warstwy mają `-mx-4 px-4`, więc wewnętrzna wypełnia dokładnie zewnętrzną (bez poziomego wystawania, statycznie); podwójne `backdrop-blur`. Uwaga bez wagi (ten sam układ w `TournamentSetup`, 02-06).

### Teksty, liczby i dostępność (UI-04, UI-05)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| MG-1 | `MiniGames.tsx:82-85`, `:66`, `:138` | Do odpowiedzi serwera `records` to `{}`: każdy kafel pokazuje „nie grane”, a pasek gospodarza „Nikt jeszcze nie grał”, choć rekordy mogą istnieć (to samo przy błędzie pobierania) | `DESIGN.md` §4 „ładowanie”, „stan pusty” | niska `[zbiorcze: ladowanie-rekordow]` | jak HM-7: `null` do odpowiedzi i pusta linia stanu |
| MG-2 | `MiniGames.tsx:109` | `Trophy` 18 px `regular` w małej akcji obok `Shuffle` 16 px `bold` (`:104`) | `DESIGN.md` §2 | niska `[zbiorcze: waga-ikon]` | `weight="bold"` |

Zgodne: liczby (miejsca, „1-6 osób”, linia rekordu) w mono z `tabular-nums` (`MiniGames.tsx:65`, `:137`, `Setup.tsx:30`, `:54`); słowa „Losuj”, „Wybrana gra”, „Rekordy · <gra>”, „Nikt jeszcze nie grał” (stan pusty jednym zdaniem); em-dash i kropka dziesiętna: brak (CHECKS §7). Przycisk trybu (CHECKS §9 `Setup.tsx:42`) ma tekst z wyrażenia (`m.name`): zgodne. Ikony `aria-hidden`.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| SU-4 | `Setup.tsx:48`, `MiniGames.tsx:57` | `transition-colors` z domyślnym 150 ms (CHECKS §12) | `ZASADY.md` §5 „Czasy” (180 ms) | niska `[zbiorcze: transition-domyslny]` | `duration-180` |

Poza tym w obu plikach brak keyframes, timerów, animacji z JS, pomiaru czasu i wibracji (CHECKS tabela zbiorcza). `Math.random` w `MiniGames.tsx:91` losuje grę w UI gospodarza, nie w zasadach gry: zgodne z `AGENTS.md`.

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| wybór trybu / mini-gry (zaznaczenie kafla) | przejście kolorów 150 ms (SU-4) | brak | brak (kafel); start „Zagraj: <gra>” |
| losowanie mini-gry | brak (zaznaczenie przeskakuje) | brak | „Losuj” |
| gotowość gościa | `.btn` 180 ms | brak | „Zgłaszam gotowość: <gra>” |
| pojawienie elementu, trafienie, pomyłka, odsłona wyniku, koniec rundy, koniec partii, zbicie, moja tura | nie dotyczy | nie dotyczy | nie dotyczy |

---

## Records.tsx i App.tsx

Pliki: `apps/web/src/screens/Records.tsx` (448 linii: `FORMAT`, `RecordList`, `RecordPanel`, `TopGame`, `GameCard`, `Records`, `Wins`) i `apps/web/src/App.tsx` (77 linii).

### Wygląd (UI-01, UI-02, UI-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| RC-1 | `Records.tsx:351`, `:355` | Liczba gier „Do pobicia” jest w `text-warning`, gdy większa od zera. `warning` znaczy problem (czas, pomyłka, kara, błąd); gry do pobicia to zachęta, nie błąd, a przy pierwszym wejściu prawie każdy ma tę liczbę w kolorze ostrzeżenia | `DESIGN.md` §2 (rola `warning`), §5 „Kolor znaczy”, D-04 (token w innej roli) | średnia | bez koloru (`fg`) albo w kolorze gracza, jeśli ma to być „twoje” |
| RC-2 | `Records.tsx:260`, `:353`, `:387` | `bg-surface-inset` (rola: pola formularza) jako tło pigułki miejsca, kafelków podsumowania i kafelków „Jeszcze nie grane” | `DESIGN.md` §2 (role tokenów), D-04 | niska | `bg-surface` (karty rekordów) albo obrys `line` bez tła (`DESIGN.md` §5 „Obrys przed wypełnieniem”) |
| RC-3 | `Records.tsx:374` | Przycisk-link „Pokaż wszystkie” / „Zwiń” w kolorze gracza (`style={{ color }}`). To akcja platformy, nie coś „mojego”; link to `fg-muted` z podkreśleniem | `DESIGN.md` §5 („Link w tekście to `fg-muted` z podkreśleniem”, kolor gracza: „to czyjeś”) | niska | `text-fg-muted underline underline-offset-4` jak „zmień” (`Home.tsx:312`) |

Zgodne:
- Lider (`:84`, `:250`, `:264`, `:431`): korona `fill`, w `fg` przy cudzym rekordzie, w kolorze gracza przy własnym (dziedziczy `color` wiersza). Zgodne z `DESIGN.md` §4 „lider rankingu”.
- Akordeon: `<details name="rekordy">` (`:241`), przeglądarka zamyka poprzednią kartę; `summary` `min-h-14`, karta `rounded-inset border-line bg-surface` (rola `surface`: karty rekordów). Uwaga bez wagi: wykluczające `name` działa od Chrome 120, Safari 17.2, Firefox 130; starsza przeglądarka pozwoli otworzyć kilka kart.
- „Pobij” / „Zagraj ponownie” u gospodarza w pokoju (`:273-278`, tylko gdy jest `onPlay`, czyli `App.tsx:72` u gospodarza; z ekranu głównego to `play` solo): `btn-ghost`, 48 px. Zgodne z `KONCEPT.md` §2.4. Na ekranie „Rekordy” nie ma `btn-primary`.
- Sekcje „Twoje rekordy”, „Do pobicia”, „Jeszcze nie grane (n)”, „Wygrane partie” w Satoshi 14 px `fg-muted` (`:314`, `:372`, `:415`): wyjątek `DESIGN.md` §5 dla sekcji ekranu „Rekordy”. Kolejność i podział zgodne z `KONCEPT.md` §2.4.
- `RecordPanel` (`:115-192`): „Nowy rekord!” w `success` z `set-glow` (świeże osiągnięcie, cień dozwolony w `set-glow`, `DESIGN.md` §2), „Pierwszy wynik” z obrysem `line`, miejsce w kolorze gracza, `aria-live="polite"`. Zgodne z `KONCEPT.md` §2.4 (miejsce, „Nowy rekord!”, „Pierwszy wynik”, awans, ile brakuje).
- Pola dotykowe: „Wróć” `min-h-12` (`:334`), „Pokaż wszystkie” `min-h-12`, kafelki „Jeszcze nie grane” `min-h-16` (przycisk tylko u gospodarza w pokoju), `summary` 56 px. Zgodne.
- 360×640: siatka podsumowania `grid-cols-3` (ok. 104 px), „Jeszcze nie grane” `grid-cols-4` (ok. 76 px, 68 px wnętrza; „Przytrzymaj” w `text-xs` ok. 66 px, na granicy), wiersze `truncate` z `min-w-0`. Bez poziomego przewijania (statycznie). `TopGame` rysuje ekran końcowy mini-gry w karcie (`px-3` + obrys), czyli ok. 302 px zamiast 328 px: `RoundTable` z 10 rundami ma wtedy kolumny ok. 24 px (3 znaki mono `text-xs` to ok. 22 px), więc mieści się tylko format do 3 znaków (dziś Mapa i Środek; B-68); do potwierdzenia w przeglądarce.

`App.tsx` (wygląd): przełączanie ekranów bez własnych kolorów i klas poza `min-h-[100dvh]` (`:50`). Wpisy w Tekstach (AP-1, AP-2).

### Teksty, liczby i dostępność (UI-04, UI-05)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| RC-4 | `Records.tsx:354-355`, `:156` | Podsumowanie: etykiety liczb (`dt`) w Satoshi 14 px zamiast `.label`, wartości `text-2xl font-semibold tabular-nums` bez mono; w `RecordPanel` „3. miejsce” `text-4xl` bez mono (obok „z 12” jest mono) | `DESIGN.md` §5 „Podpis to `.label`” (etykieta liczby), „Liczby są mono” | niska `[zbiorcze: podpis-label]`, `[zbiorcze: liczby-mono]` | `dt.label`, `dd` i miejsce w `font-mono` (wzór `Stats`, B-65) |
| RC-5 | `Records.tsx:335`, `:275` | `ArrowLeft` 16 px `regular` w „Wróć”; `Play` 18 px `regular` w „Pobij” / „Zagraj ponownie” (inne przyciski platformy mają `bold` albo `fill`) | `DESIGN.md` §2 | niska `[zbiorcze: waga-ikon]` | `weight="bold"` |
| RC-6 | `App.tsx:72` → `Records.tsx:333` | Ekran „Rekordy” otwarty z pokoju dostaje `<Screen dropped={false}>`: gdy połączenie z pokojem padnie, nie widać paska „Łączenie ponownie…” (lista mini-gier i lobby go mają) | `DESIGN.md` §4 „utrata połączenia (ja)”, `ZASADY.md` §4 („komunikat o rozłączeniu”) | niska | prop `dropped` w `Records` przekazywany z `App.tsx` (z ekranu głównego `false`) |
| RC-7 | `Records.tsx:203` | `TopGame` do odpowiedzi serwera nic nie rysuje (`return null`), a sekcja z rekordową partią wskakuje po chwili w otwartej karcie | `DESIGN.md` §4 „ładowanie” | niska | linia „Wczytywanie…” `text-sm text-fg-muted` w miejscu sekcji |
| AP-1 | `App.tsx:50` | W trakcie wznawiania sesji (`resumeRoom`) ekran jest pusty (`<main aria-busy />`); na słabym Wi-Fi gracz widzi czarny ekran bez słowa | `DESIGN.md` §4 „ładowanie” (czasownik z wielokropkiem) | niska | „Łączenie…” `text-fg-muted` wyśrodkowane w `main` z `role="status"` |
| AP-2 | `App.tsx:45` → `Home.tsx:52`, `:231` | Komunikat „Połączenie z pokojem zostało zamknięte.” trafia do `roomError`, więc pole kodu dostaje `aria-invalid` i ramkę `warning`, jakby gracz wpisał zły kod | `DESIGN.md` §4 „błąd formularza” (dotyczy błędu w polu) | niska | osobny stan `notice` pokazany nad sekcjami (np. `Problem` bez `aria-invalid` pola) |

Zgodne:
- `FORMAT` (`:9-51`): ułamki przez własne `num` (`toFixed(1).replace(".", ",")`), więc przecinek dziesiętny („12,3 s”, „97,4%”); `tie` Wieży `Math.round(n * 100)%` bez ułamka; jednostki po polsku z odmianą (`plural`). Zgodne z `ZASADY.md` §4 i W-03. Kropka po skrócie „traf.” nie podwaja się (`:171`).
- Liczby w listach mono z `tabular-nums` (`:86`, `:92`, `:159`, `:179`, `:247`, `:260`, `:430`, `:437`). „(ty)” (`:90`, `:435`).
- Stany: „Wczytywanie…” z `aria-busy` (`:341-343`); stany puste jednym zdaniem: „Nikt jeszcze nie grał. Pierwszy wynik będzie rekordem.” (`:68`), „Nie masz jeszcze żadnego wyniku…” / „Wpisz nick…” (`:363`), „Rekord sprzed zapisu partii…” (`:208`). Zgodne z `DESIGN.md` §4.
- Słowa: „Wróć” (CHECKS §7 `:336`; jak `Home.tsx:108`), „Zagraj ponownie” i „Pobij” (`KONCEPT.md` §2.4, CHECKS §7 `:276`), „Pokaż wszystkie” / „Zwiń”. Em-dash: brak. Wszystko po polsku.
- Dostępność: korony z `aria-label` „1. miejsce” / „Lider” (`:84`, `:250`, `:431`), pigułka miejsca z `aria-label` „3. miejsce z 12” (`:262`), „wygrane z partii” `aria-hidden` z pełnym opisem w `aria-label` wiersza (`:420`, `:437`), ikony `aria-hidden`.
- `App.tsx`: pasek „Łączenie ponownie…” w `accent-soft` rysuje `Screen` (B-55) dla lobby, `Setup`, listy mini-gier i partii (`dropped` z `App.tsx:38-39`); wyjątek RC-6.

### Animacje i wibracje (ANIM-01, ANIM-02, ANIM-03)

| ID | `plik:linia` | Rozbieżność | Źródło | Waga | Propozycja |
|---|---|---|---|---|---|
| RC-8 | `Records.tsx:268` | Strzałka akordeonu `transition-transform` z domyślnym 150 ms (CHECKS §12), a treść karty otwiera się bez animacji | `ZASADY.md` §5 „Czasy” (180 ms) | niska `[zbiorcze: transition-domyslny]` | `duration-180` |

Ocena pozostałych:
- `set-glow` 0,9 s `ease-in-out` × 4 na „Nowy rekord!” (`:144`, CHECKS §11a): rola „świeże osiągnięcie” zgodna z listą §5; brak czasu w tabeli to B-35 `[zbiorcze: brak-w-tabeli-5]` (bez nowego wpisu). Kolor poświaty przez `--glow` z tokenu `success`. Animacja nie blokuje przycisków po partii.
- `App.tsx`: przejścia między ekranami nie ma (ekran podmienia się od razu po stanie z serwera), co jest zgodne z §5 („stan przychodzi od razu”, ruch tylko dla tego, co się stało) i nie wymaga `reducedMotion`. Timerów, wibracji i pomiaru czasu brak w obu plikach (CHECKS tabela zbiorcza).

### Sytuacje (D-12)

| Sytuacja | Animacja (keyframes + czas) | Wibracja | Słowa na przyciskach |
|---|---|---|---|
| nowy rekord po partii (`RecordPanel`) | `set-glow` 0,9 s × 4 | brak | „Rewanż” / „Do lobby” (rysuje `Game.tsx`) |
| pierwszy wynik | brak; pigułka „Pierwszy wynik” | brak | jak wyżej |
| rozwinięcie karty gry | strzałka obrót 150 ms (RC-8), treść bez animacji | brak | „Pobij” / „Zagraj ponownie” (gospodarz w pokoju) |
| ładowanie rekordów | brak; „Wczytywanie…” | brak | „Wróć” |
| utrata połączenia | brak; pasek „Łączenie ponownie…” (`Screen`), wyjątek RC-6 | brak | brak |
| przejście między ekranami (`App.tsx`) | brak | brak | brak |
| trafienie, pomyłka, odsłona wyniku, koniec rundy, zbicie, moja tura | nie dotyczy | nie dotyczy | nie dotyczy |

---

## Odstępstwa z powodem

Sprawdzone i zgodne z wyjątkami z `ZASADY.md`, `KONCEPT.md`, `DESIGN.md` (D-04, D-05); bez wagi.

| Wzorzec | `plik:linia` | Powód (źródło) |
|---|---|---|
| ukryty pasek limitu u grającego w Stoperze, Rytmie, Przytrzymaj i Za zasłoną | `Game.tsx:208-210` | `KONCEPT.md` §2.4 (grający nie widzi limitu tury ani licznika sekund), D-05 |
| własny nagłówek Państw-miast i Kalamburów (wspólny chowany w trakcie partii) | `Game.tsx:179`, `:232` | `ZASADY.md` §4, `DESIGN.md` §6 |
| Kampus Tour poza wspólnym nagłówkiem (własny układ, pasek i akcje wstawiane w planszę) | `Game.tsx:83-97` | `DESIGN.md` §6 (układ poziomy); kolor paska to jednak wpis GM-2 |
| poświata w Kalamburach zawsze w kolorze rysującego | `Game.tsx:54` | `DESIGN.md` §1 p. 1 |
| ikona wyzwania dnia `text-accent` na `bg-accent-soft`, `fill` | `Home.tsx:146-147` | `DESIGN.md` §2 (rola `accent-soft`: tło ikony wyzwania dnia; `fill` dla wyzwania dnia), §3.1 |
| „Dołącz” w akcencie po wpisaniu pełnego kodu | `Home.tsx:241` | `KONCEPT.md` §1, `DESIGN.md` §3.1 (sprzeczność z §5 opisana w HM-1) |
| gospodarz bez możliwości startu widzi zdanie zamiast wyszarzonego przycisku | `Lobby.tsx:218-219` | komentarz w kodzie; `DESIGN.md` §4 („samo przygaszenie nie wystarcza”) |

## Do potwierdzenia w przeglądarce (D-09)

- HM-3: czy „Wszystkie (30)” mieści się w pigułce na 360 px (szacunek 140-158 px przy 139 px kolumny; bez metryk Satoshi, plik `woff2` bez narzędzia do odczytu).
- GM-1 i HM-8: dokładne wysokości ekranu po partii i list (szacunek z klas).
- Ekran końcowy mini-gry w `TopGame` (ok. 302 px szerokości) z `RoundTable` przy 10 rundach.
- Kafelki „Jeszcze nie grane” (68 px wnętrza, „Przytrzymaj” w 12 px).
- Czytelność `aria-label` na `span` (GM-5) w TalkBack / VoiceOver.

## Podsumowanie wpisów

| Waga | Wpisy |
|---|---|
| wysoka | brak |
| średnia | GM-1, GM-2, LB-1, LB-2, LB-3 (`dotyk-48`), SU-1, RC-1 |
| niska | GM-3 (`stan-rozlaczony`), GM-4 (`liczby-mono`), GM-5 (`aria-label-span`), GM-6, GM-7 (`waga-ikon`), GM-8 (`animate-tailwind`), GM-9 (`brak-w-tabeli-5`), GM-10 (`transition-domyslny`), HM-1, HM-2, HM-3, HM-4 (`liczby-mono`), HM-5, HM-6 (`waga-ikon`), HM-7 (`ladowanie-rekordow`), HM-8 (`wysokosc-640`), LB-4 (`stan-rozlaczony`), LB-5 (`podpis-label`), LB-6 (`waga-ikon`), LB-7 (`liczby-mono`), LB-8 (`animate-tailwind`), LB-9 (`transition-domyslny`), SU-2, SU-3, SU-4 (`transition-domyslny`), MG-1 (`ladowanie-rekordow`), MG-2 (`waga-ikon`), RC-2, RC-3, RC-4 (`podpis-label`, `liczby-mono`), RC-5 (`waga-ikon`), RC-6, RC-7, RC-8 (`transition-domyslny`), AP-1, AP-2 |

Razem: 0 wysokich, 7 średnich, 36 niskich. Odsyłacze bez nowych wpisów: B-36, B-41, B-44, B-50, B-55, B-56, B-57, B-62, B-63, B-35.

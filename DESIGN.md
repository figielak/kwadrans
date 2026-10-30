# DESIGN.md

Styl wizualny Kwadransa: jak strona wygląda i dlaczego. Opis powstał z przeglądu ekranów na 360×640
(ekran główny, lobby, lista mini-gier, rekordy, ekran instrukcji, partia).

Jedynym katalogiem tokenów, ich ról i skali promieni w dokumentacji jest sekcja 2 tego pliku.
Ich implementacja to `apps/web/src/index.css`, a wspólne komponenty są w `apps/web/src/screens/ui.tsx`.
Reguły odbioru nowej gry (pola dotykowe, czasy animacji, wibracje) są w [ZASADY.md](ZASADY.md), sekcje 4 i 5;
przy sprzeczności obowiązują ZASADY. Opis zatwierdzonej klasy przed wdrożeniem jest jawnie oznaczony w §5.

## 1. Charakter

Ciemny, cichy, techniczny. Telefon często leży obok, a wokół są inni ludzie, więc ekran nie świeci, nie miga i nie gra.
Wygląd jest przedłużeniem figielak.dev: te same tokeny, ten sam krój, te same przyciski w kształcie pigułki.

Trzy rzeczy budują cały styl:

1. **Prawie czarne tło z jedną poświatą.** W prawym górnym rogu leży nieruchomy gradient radialny (16% koloru, 60vmax).
   Domyślnie ma kolor akcentu, a w partii kolor gracza, na którego wszyscy czekają (`--ambient`), więc o turze mówi całe tło.
   W Kalamburach to zawsze kolor rysującego.
2. **Jedna główna akcja na ekran.** Akcent dostaje jeden wypełniony przycisk, czyli najważniejsza akcja platformy. Reszta to obrysy.
   Akcent w znaku aplikacji identyfikuje markę i nie jest drugą akcją.
3. **Dwa kroje o dwóch rolach.** Satoshi mówi (nazwy, zdania, przyciski), Geist Mono liczy (kody, wyniki, czasy, podpisy sekcji).

## 2. Tokeny

### Kolory

| Token | Wartość | Rola |
|---|---|---|
| `bg` | `#0e0e10` | tło strony, wnętrze podglądu na ekranie instrukcji |
| `surface` | `#161618` | pełne powierzchnie: pasek statystyk, karty rekordów |
| `surface-inset` | `#111113` | pola formularza |
| `surface-glass` | `rgb(22 22 24 / 0.55)` + blur 16 px | kafel `.tile`, przez który przebija poświata |
| `line` | biel 8% | każdy obrys i separator |
| `line-hover` | biel 16% | obrys pola formularza i przycisku pod kursorem |
| `fg` | `#ededef` | tekst |
| `fg-muted` | `#8b8b92` | opisy, podpisy, ikony pomocnicze |
| `fg-subtle` | `#5c5c63` | tylko nieistotne detale (kontrast poniżej 4,5:1) |
| `accent` | `#ff2445` | główna akcja platformy, focus, zaznaczony kafel, znak aplikacji |
| `accent-hover` | `#ff4560` | akcent pod kursorem, tylko `.btn-primary` |
| `accent-soft` | akcent 12% | tło ikony wyzwania dnia, pasek „Łączenie ponownie…” |
| `accent-fg` | `#0e0e10` | tekst na akcencie (grafit ma 5,1:1, biały tylko 3,8:1) |
| `warning` | `#ff6369` | ostatnie 10 s limitu, pomyłka, kara, błąd formularza, bodziec „nie wolno” w Stój! (zawsze z ikoną i tekstem) |
| `success` | `#3dd68c` | trafienie, bodziec „dotknij” (Refleks, Stój!) |

Kolory graczy to dane, nie dekoracja (`PLAYER_COLORS` w `lobby.ts`): `#3b9eff`, `#ffc53d`, `#46a758`, `#8e7cff`, `#0ac5b3`, `#f76fbe`.
Żaden nie przypomina czerwieni akcentu. Wszystko, co jest „moje” albo „czyjeś” (tytuł gry w partii, pasek limitu, pionki,
„1. miejsce” na kaflu mini-gry), ma kolor gracza.

Głębię robią obrys 1 px i przezroczystość, nie cienie. Cień mają tylko rzeczy, które naprawdę leżą nad planszą
(okna i pionki w Kampus Tour) oraz animacja `set-glow`.

### Typografia

| Rola | Krój i rozmiar |
|---|---|
| tytuł ekranu („Kwadrans”, „Rekordy”) | Satoshi 30 px, 600, `tracking-tight` |
| kod pokoju w lobby | Geist Mono 60 px, 500, odstęp liter 0,12em |
| nazwa, zdanie, przycisk | Satoshi 16 px, przycisk 500, wyróżnienie 600 |
| opis pod nazwą | Satoshi 14 px, `fg-muted` |
| liczba w pasku statystyk | Geist Mono 18 px, 600, `tabular-nums` |
| podpis sekcji `.label` | Geist Mono 11 px, wersaliki, odstęp liter 0,08em, `fg-muted` |
| podpis na kaflu gry | Geist Mono 12 px, `fg-muted` |

Hierarchię robi kontrast kroju i jasności, nie rozmiar: większość ekranu to 14-16 px, a duże są tylko tytuł i kod pokoju.

### Kształt i odstępy

- Zaokrąglenia: 20 px (kafel), 10 px (wszystko w kaflu i małe kafle gier), 999 px (przyciski, kropki graczy).
- Jedna kolumna `max-w-md`, margines boczny 16 px, odstęp między blokami 12 px, wnętrze kafla 20 px (gęste listy 12-16 px).
- Każde pole dotykowe ma co najmniej 48 px wysokości; akcje leżą przy dolnej krawędzi, w zasięgu kciuka.
- Ikony Phosphor: `regular` domyślnie, `fill` dla wyróżnionej (wyzwanie dnia, korona), `bold` w małych akcjach (16-18 px).

## 3. Wzorcowe sekcje

Te fragmenty najlepiej oddają styl. Nowy ekran powinien wyglądać jak ich rodzeństwo.

### 3.1 Karta „Sam” na ekranie głównym (`Home.tsx`)

Najlepszy przykład hierarchii. Od góry: ikona gry w kwadracie `accent-soft`, nazwa pogrubiona i jedna linia stanu,
potem jedyny wypełniony przycisk ekranu („Zagraj”) na pełną szerokość, pod nim dwa równe przyciski z obrysem.
Wzrok ląduje na czerwieni bez żadnego nagłówka, a „Dołącz” w sąsiedniej karcie dostaje akcent dopiero po wpisaniu pełnego kodu.

Do skopiowania: jedna akcja wypełniona, pozostałe `btn-ghost`; podpis sekcji z małą ikoną leży nad kaflem, nie w nim.

### 3.2 Kod pokoju w lobby (`Code` w `Lobby.tsx`)

Jedyny naprawdę duży element aplikacji: cztery znaki mono 60 px z szerokim odstępem, nad nimi `.label`, obok okrągły przycisk udostępniania.
Kod jest tu treścią ekranu, więc dostaje rozmiar plakatu, a instrukcja pod nim zostaje w 14 px `fg-muted`.

Do skopiowania: gdy ekran ma jedną informację do przekazania, powiększ ją i wycisz resztę, zamiast dodawać ramki i kolory.

### 3.3 Ekran instrukcji mini-gry (`Intro` w `ui.tsx`)

Kafel wyśrodkowany w pionie: animowany podgląd 128 px na tle `bg`, trzy punkty z ikonami (czas, zadanie, punktacja),
przycisk „Start” i wyciszona linia odliczania. Gracz rozumie grę w 3 sekundy, bo podgląd pokazuje ją w ruchu, a tekst ma trzy linie.

Do skopiowania: stały szkielet zamiast dowolnego opisu; ikony `fg-muted` w roli wypunktowania.

### 3.4 Nagłówek partii i pasek statystyk (`Game.tsx`, `Stats` w `ui.tsx`)

Status gry w kolorze gracza, pod nim kropki graczy, cienki pasek limitu (6 px, pigułka) i sekundy mono;
tło strony przyjmuje ten sam odcień przez `--ambient`. Niżej `Stats`: trzy liczby mono 18 px, każda pod własnym `.label`,
skrajne wyrównane do krawędzi. Pole gry zajmuje całą resztę ekranu i jest jedyną dużą plamą koloru.

Do skopiowania: kolor gracza niesie stan (czyja tura, ile czasu), interfejs wokół zostaje szary; liczby zawsze z etykietą i `tabular-nums`.

### 3.5 Siatka mini-gier (`MiniGameGrid` w `MiniGames.tsx`)

Trzy kolumny małych kafli (10 px, min. 80 px wysokości): ikona, nazwa 14 px, na dole linia mono ze stanem („2. miejsce”, „nie grane”).
Grupy rozdziela zwykły wyciszony nagłówek (Satoshi 14 px, `fg-muted`), bez ramek. Pierwsze miejsce gracza świeci jego kolorem i jest jedynym kolorem w całej siatce.

Do skopiowania: przy dużej liczbie elementów kolor zostaje dla wyjątków, a porządek robi siatka i stała pozycja podpisu.

## 4. Stany

Stan pokazują obrys, przezroczystość i waga ikony, nie nowy kolor. Opis odpowiada temu, co jest w kodzie.

| Stan | Wygląd | Przykład |
|---|---|---|
| focus (klawiatura) | obrys 2 px `accent`, odsunięty o 2 px | `.btn`, `.field`, suwak koloru |
| pole w edycji | ramka `accent` zamiast `line-hover` | kod pokoju, nick |
| przycisk nieaktywny | krycie 40%, bez reakcji na dotyk | „Dołącz” bez pełnego kodu (dodatkowo `btn-ghost` zamiast `btn-primary`) |
| kafel zaznaczony | ramka `accent`, tło `accent-soft`, ikona `fill`, `aria-pressed` | wybrana gra w lobby |
| kafel przygaszony, ale do wybrania | krycie 60%, podpis mówi dlaczego („brakuje 1 gracza”) | gra, do której jest za mało osób |
| kafel nieaktywny | krycie 40%, `disabled`, podpis mówi dlaczego („max 2 os.”) | gra, do której jest za dużo osób |
| turniej: losowo | zwykły kafel | stan domyślny każdej gry |
| turniej: na pewno | jak kafel zaznaczony, plus znaczek i podpis „na pewno” | pierwsze dotknięcie |
| turniej: bez | ramka `line`, krycie 50% | drugie dotknięcie |
| wybrany kolor gracza | obrys 2 px `fg`, odsunięty o 2 px | próbki koloru w lobby |
| ładowanie | tekst przycisku zmienia się na czasownik z wielokropkiem, wszystkie akcje ekranu nieaktywne; bez spinnera | „Łączenie…”, „Tworzenie…” |
| stan pusty | jedno zdanie `fg-muted` w miejscu treści, bez ilustracji | „Dziś nikt jeszcze nie grał”, „nie grane” |
| błąd formularza | ikona i tekst 14 px w `warning` pod polem (`role="alert"`); ramka i obrys focusu pola też w `warning`, zamiast akcentu | zły kod pokoju (`Problem` w `Home.tsx`) |
| lider rankingu | korona `fill`: w `fg` przy cudzym rekordzie, w kolorze gracza przy własnym | ekran „Rekordy” |
| bodziec w grze na refleks | przed sygnałem pole `surface` z szarym napisem, sygnał to `success` z ciemnym napisem, bez przejścia | „Czekaj…” i „Teraz!” w Refleksie |
| utrata połączenia (ja) | pasek `accent-soft` z ikoną na górze ekranu | „Łączenie ponownie…” |
| gracz rozłączony | kropka z kryciem 40%; w partii przerywany obrys zamiast pierścienia | `PlayerDots`, `GameDots` |
| gracz czyta zasady | kropka z kryciem 40%, pierścień zostaje | `GameDots` na ekranie instrukcji |
| gracz gotowy | znaczek w kropce | `PlayerDots` w górnym pasku |
| postęp gracza | pierścień wokół kropki w jego kolorze, pełny po oddaniu wyniku | `GameDots` w partii |
| to ja | kreska pod kropką, „(ty)” przy nicku | `GameDots`, tabele wyników |
| koniec czasu | sekundy w `warning` przez ostatnie 10 s | pasek limitu |

Każdy stan, który coś blokuje, tłumaczy się podpisem; samo przygaszenie nie wystarcza.

## 5. Zasady, które z tego wynikają

- **Akcent jest rzadki.** Jeden wypełniony przycisk platformy na ekranie; znak aplikacji może zachować akcent,
  bo identyfikuje markę, nie proponuje kolejnej czynności. Link w tekście („zmień”) to `fg-muted` z podkreśleniem.
- **Akcent należy do platformy, kolor gracza do partii.** Wypełniony akcentem jest przycisk, który prowadzi przez aplikację
  („Zagraj”, „Start”, gotowość, „Rewanż”, „Dalej”, „Jeszcze raz”). Akcja w trakcie partii („Zatwierdź”, „Gotowe”, „Rzuć”, „Zgarnij”)
  jest wypełniona kolorem gracza z tekstem `bg`.
  Zatwierdzony wspólny kontrakt to `.btn` + `.btn-player`: kolor gracza przekazany przez komponent stanowi tło,
  tekst korzysta z `bg`, a rozmiar, focus, stan nieaktywny i reakcja na dotyk pochodzą z `.btn`.
  Klasa współdzieli wygląd, nie zmienia znaczenia akcji ani ról tokenów.
  **Stan przejściowy:** `.btn-player` nie jest jeszcze zaimplementowana; obecne użycia to `btn text-bg`
  i `backgroundColor` z koloru gracza. Dodanie klasy i migracja stylów należą do P4-050.
- **Kolor nigdy nie jest jedynym sygnałem.** Błąd ma ikonę i tekst, bodziec ma napis i skok jasności, stan nieaktywny ma podpis.
- **Kolor znaczy.** Role tokenów określa tabela w §2; kolor gracza wskazuje właściciela lub jego akcję.
- **Obrys przed wypełnieniem.** Karty, przyciski drugorzędne i pola mają obrys 1 px w `line`; pełne tło dostaje tylko to, co ma przyciągać.
- **Liczby są mono.** Kod, wynik, czas, miejsce i licznik idą Geist Mono z `tabular-nums`, żeby nie skakały przy zmianie.
  Liczby nad polem gry to zawsze pasek `Stats`, tabela rund po partii to `RoundTable` (oba w `ui.tsx`).
- **Podpis to `.label`.** Nagłówek nad blokiem (kaflem, sekcją ekranu) i etykieta liczby to małe wersaliki mono, nigdy pogrubiony Satoshi.
  Wyjątek: grupy wewnątrz jednej listy (kategorie w siatce mini-gier, sekcje ekranu „Rekordy”) mają zwykły Satoshi 14 px `fg-muted`,
  bo `.label` nad każdą grupą konkurowałby z podpisami mono na kaflach.
- **Ruch tłumaczy, nie zdobi.** Poświata jest nieruchoma, animacja pokazuje tylko to, co się właśnie stało (szczegóły: `ZASADY.md`, sekcja 5).
- **Tylko ciemny motyw, teksty po polsku, bez em-dashy, z przecinkiem dziesiętnym.**

## 6. Wyjątki i rozbieżności

**Listy poza partią** (np. ekran główny, wybór gry, ustawienia i rekordy) mogą przewijać się pionowo.
Nie muszą w całości mieścić się w 640 px; dolna akcja pozostaje dostępna w `StickyBar`, a edytowane pole nie znika
pod klawiaturą. Wymóg 360×640 dotyczy ekranu partii. Nie znosi to zakazu poziomego przewijania ani wymogów pól dotykowych
z [ZASADY.md §4](ZASADY.md#4-spójność-wyglądu); lokalne wyjątki formularzy i wyników w partii są rozliczane osobno.

Świadome wyjątki od zasad z sekcji 5:

- **Gęste plansze** mają pola poniżej 48 px tylko z wyborem i potwierdzeniem (ZASADY §4). Pierwsze dotknięcie wybiera,
  przycisk min. 48 px w kolorze gracza nazywa wybór i wysyła ruch, drugie dotknięcie tego samego pola też wysyła.
  Gomoku (15×15, pole ~22 px): „Postaw na H8”. Statki (do 12×12, ~23 px): „Strzel w G3”.
  Chińczyk (11×11, ~29 px): kostka obok „Wyjdź na start” / „Rusz o 4 pola” / „Wejdź do domku”, przy biciu „… i zbij”.
  Labirynt (do 9×9, ~34 px): duch pionka i „Idź w górę” / „Przeskocz w lewo”; ścianka: podgląd i „Postaw”.
  Pomiar 360×640 (P4-036): każdy przycisk potwierdzenia ma 56 px, obserwator nie ma aktywnych pól.
  Memory, pola Kampus Tour i gry na czas tego wyjątku nie dostają.
- **Kolory będące treścią gry** nie są interfejsem i nie muszą pochodzić z tokenów: pola Sekwencji, napisy Koloru liter,
  figury Innego elementu, próbki Odcienia, grupy pól w Kampus Tour.
- **Statki**: trafienie i zatopiony statek są w `accent`. To utrwalony znak tej gry, czerwień nie oznacza tam akcji.
- **Państwa-miasta i Kalambury** mają własny nagłówek: gracze w jednej linii z punktami obok nicku zamiast paska `Stats`,
  bo graczy może być 6, a `Stats` mieści trzy liczby. Każdy ma jedną liczbę, więc zapis w linii zostaje czytelny.
- **Kampus Tour** ma własny układ poziomy oraz cienie pod oknami i pionkami. Przyciski decyzji i zamknięcia mają minimum 48 px po skalowaniu sceny; dawne 44 px budowy nie jest już wyjątkiem.

W aktywnej partii wspólny nagłówek pokazuje status oraz jeden wiersz kropek graczy i limitu czasu.
Dotknięcie kropek rozwija pełne nicki, wygrane i statystyki gry; rozłączenie pozostaje oznaczone także w zwiniętym widoku.
Przy kilku oczekujących zwinięty status podaje ich liczbę, rozwinięty pełne nicki. Własne nagłówki pozostają bez zmian.
Zmniejszenie nagłówka nie zastępuje osobnego odbioru geometrii plansz.

Rozbieżności do decyzji (nie są wzorem dla nowych ekranów):

- **Gry główne na 360×640.** Państwa-miasta wymagają przewinięcia;
  jest to rozbieżność do poprawy, a nie zgoda na przewijanie plansz.
  Statki (P4-008, wszystkie tryby): rozstawianie mieści się (flota 142-482 px, „Obróć”/„Losuj”/„Gotowe” w jednym wierszu 534-590 px).
  W bitwie aktywna plansza jest duża u góry razem z akcją (cel 142-482 px i „Wybierz pole” 502-558 px; obrońca i obserwator: ostrzeliwana plansza).
  Wyjątek: mała plansza drugiej floty (3/5 szerokości) może leżeć poniżej 640 px i dochodzi się do niej przewinięciem,
  bo przy obu planszach naraz miałaby pole około 6 px; pasek bitwy nie jest przyklejony, więc nic jej nie zasłania.
  Gomoku mieści się po zmniejszeniu nagłówka (P4-007): plansza 150-487 px (pole 22,5 px), akcja 514-570 px, dokument 640 px,
  u obserwatora plansza 178-515 px; po końcu cała plansza zostaje nad „Rewanż”, a wyniki przewijają się jak w ZASADY §4. Także mini-gry wymagają osobnego odbioru;
  nie zakładamy, że każda mieści się w 640 px. Przewijanie list poza partią jest dopuszczone powyżej.

Odbiór Memory po P4-006/P4-011: Mała, Średnia i Duża mieszczą planszę oraz instrukcję na 360×640
przy 2/6 graczach, także u obserwatora i z długimi nickami. Odstęp plansza–instrukcja to 8 px;
karty mają odpowiednio 76×76, 76×60,8 i 48×48 px przy szerokości 360 px. To pomiar zwiniętego nagłówka.

Kalambury (P4-012): w fazie rysowania rozmiar kwadratowego płótna wynika z rzeczywistego miejsca
pod własnym nagłówkiem i listą graczy, z zachowaniem miejsca na kontrolki danej roli i dolny margines.
Zmiany wysokości nagłówka, czatu i widocznego obszaru aktualizują pomiar. Przy otwartej klawiaturze
zgadujący może przewinąć do pola i przycisków; minimalny bok płótna to 48 px. Czat i potwierdzenie
„Pasuję” pozostają obecne. Odsłona i wyniki zachowują dotychczasowy układ.

Narysuj koło (P4-013): aktywne płótno pozostaje kwadratowe i mieści się w wysokości pozostałej
po nagłówku, statystykach, komunikacie i dolnym marginesie. Miejsce na zakończenie prób jest
zarezerwowane od startu, dzięki czemu pierwsza oceniona próba nie zmienia rozmiaru pola.
Na 360×640 przycisk ma 48 px i kończy się na 616 px; bok płótna wynosi 261 px solo lub 293 px
w pokoju 2/6 osób ze zwiniętym nagłówkiem. Współrzędne i ocena rysunku pozostają niezależne od rozmiaru.

Państwa-miasta (P4-014, wdrożone, fizyczny odbiór U02 otwarty): sześć kategorii formularza przewija
się wewnątrz listy, a dolne Oddaj/Dalej/STOP pozostają poza tą listą. Po zmianie widocznej wysokości
aktywne pole jest przewijane po przeliczeniu układu. Głosowanie i podsumowanie mają osobną tabelę
na kategorię przy 4+ osobach, z graczami w wierszach; przy 2/3 zachowują zwartą tabelę.
Pełne nicki i odpowiedzi mogą łamać się w wierszach; brak poziomego przewijania, cele głosu minimum 48 px.
Jest to lokalny wyjątek przewijania formularza i odpowiedzi opisany w ZASADY §4.

Wyniki (P4-016): wspólny ekran końcowy umieszcza OverActions/NextActions w StickyBar.
Rysunki, rekordy i tabela turnieju mogą przewijać się pionowo w naturalnych rozmiarach;
przyciski są dostępne od razu, a na końcu przewijania ostatni wiersz leży nad paskiem.
Solo ma Jeszcze raz/Wyjdź; między grami turnieju Dalej/Zakończ turniej (dla gospodarza),
a finał Rewanż/Do lobby. Własny poziomy układ Kampus Tour pozostaje osobny.

Kampus Tour (P4-017): środek ma stały wiersz rundy i limitu, status, akcje oraz ostatni wpis logu.
Dłuższy opis może przewijać się w pozostałym miejscu. „Rozbuduj pole” otwiera szczegóły bieżącego pola
z poziomami w dwóch kolumnach, żeby decyzje miały 48 px na ekranie po zoom sceny.
Podsumowanie ma ograniczoną wysokość, przewijaną treść i stałe akcje; po jego otwarciu akcje planszy
nie są renderowane drugi raz. Panele pokazują wygrane, obserwator ma „Oglądasz”. Pełne nicki wykresu
pozostają w legendzie i tytułach etykiet; krótkie etykiety przy końcach linii nie nachodzą na statystyki.

Kampus Tour (P4-018): turlanie rozpoczyna rzeczywisty rzut rozpoznany w istniejącym widoku,
łącznie z kolejnym dubletem o identycznych oczkach i rzutem w Kolokwium bez przesunięcia.
MPK i karta przestawiają pionek bez turlania. Nakładka „Dotknij, aby przejść do decyzji”
kończy pokaz jednym dotknięciem, bez wysyłania ruchu; decyzję wybiera dopiero następne.
Nowa wiadomość zastępuje poprzedni pokaz; refresh i reduced motion pokazują od razu stan serwera.

# Kwadrans (games.figielak.dev) — koncept

Prywatna platforma z grami multiplayer w przeglądarce, do grania ze znajomymi na wykładach.
Jedna strona, kod pokoju, każdy gra na swoim telefonie.

## 1. Założenia

- **Do 6 graczy naraz** w pokoju, kilka pokoi równolegle. Limit miejsc zależy od gry
  (Kampus Tour i Chińczyk 2-4, Gomoku i Statki 2); reszta ogląda.
- **Mobile-first**: telefon w pionie, bez instalacji (PWA z ikoną na ekranie głównym).
- **Bez kont**: gracz wpisuje nick i kod pokoju. Token sesji w `localStorage` pozwala wrócić do gry po odświeżeniu strony.
  Nick jest zapamiętany po pierwszym wpisaniu (ekran główny pokazuje „Grasz jako … · zmień”), tak samo trzy ostatnie pokoje z ostatniej doby do szybkiego powrotu
  (sekcja „Wróć do pokoju”: tylko pokoje, w których było co najmniej 2 graczy i które jeszcze istnieją, sprawdza to `/api/rooms`).
- **Ekran główny**: sekcja „Sam” stoi wyżej niż „Ze znajomymi” (przy wejściu z linku `/?kod=` odwrotnie). „Sam” to wyzwanie dnia, do dwóch gier
  dobranych pod rekordy (cudzy rekord, do którego graczowi najbliżej, i własny do obrony), „Losowa gra” i lista wszystkich mini-gier.
  „Ze znajomymi” łączy pole kodu i „Utwórz pokój”. Jedyny wypełniony przycisk ekranu to „Zagraj” przy wyzwaniu; „Dołącz” dostaje akcent po wpisaniu pełnego kodu.
  Rankingi wygranych gier głównych i turnieju są na dole ekranu „Rekordy” (puchar w nagłówku); równe wygrane i partie to to samo miejsce.
- **Gra solo**: mini-gra z ekranu głównego to po cichu pokój na jedną osobę (`solo` w opcjach tworzenia i w `RoomView`), który od razu startuje grę:
  bez lobby, kodu, wyboru koloru i wpisu w ostatnich pokojach. Po partii „Jeszcze raz” albo „Wyjdź”; wyniki trafiają do tych samych rekordów.
- **Wyzwanie dnia**: jedna mini-gra dziennie, ta sama dla wszystkich (`dailyGame` w core.ts: lista tasowana raz na cykl, więc każda gra wypada raz na tyle dni, ile jest gier;
  dzień zmienia się o polskiej północy, `TZ` w docker-compose). Ranking dnia to najlepsze dzisiejsze wyniki w tej grze z dowolnej partii
  (solo, pokój, turniej), bez limitu prób i bez osobnej tabeli (`/api/daily`). Układ partii jest losowy jak zawsze.
  W rankingach gracza rozpoznaje `nickKey` (bez wielkości liter, polskich znaków i nadmiarowych spacji: „Ala” i „ala” to jedna osoba), pokazywana jest ostatnia pisownia.
- **Dostęp**: strona publiczna, ale do gry trzeba znać kod pokoju. Brak publicznej listy pokoi.
- **Odporność na słabe Wi-Fi**: automatyczne ponowne łączenie, stan gry zawsze po stronie serwera.
- **Tryb wykładowy**: domyślnie bez dźwięku (jedyny wyjątek to klik metronomu w Rytmie), ciemny motyw, wibracje zamiast powiadomień, limit czasu na turę.

## 2. Gry

### 2.1 Kampus Tour (klon Business Tour)

Główna gra platformy, 2-4 graczy. Zachowuje rdzeń mechaniki oryginału, ale ma własny motyw i dodatki.
Mechanik można się inspirować, natomiast nazwy, grafiki i logo oryginału nie są kopiowane.

**Motyw:** Politechnika Rzeszowska i Rzeszów. Pola to budynki kampusu, wydziały i znane miejsca w mieście
(np. Rynek, Zamek Lubomirskich, Bulwary nad Wisłokiem, Millenium Hall). Lista pól: `GROUP_DEFS` i `SPECIAL` w `kampus-tour.ts`.

**Rdzeń (jak w oryginale):**
- pozioma plansza 32 pól (prostokąt 12×6, rogi: Początek, Kolokwium, Juwenalia, Bilet MPK), rzut dwiema kośćmi, dublet daje dodatkowy rzut (trzeci z rzędu wysyła na Kolokwium),
- 2-4 graczy, każdy wybiera na starcie postać (pionek),
- kupowanie pól i płacenie czynszu; gdy brakuje gotówki, sprzedaż pól bankowi za połowę wartości,
- 8 grup kolorów (pory dnia studenta); posiadanie całej grupy zwiększa czynsz,
- rozbudowa pól aż do landmarku,
- **wykupienie pola** od innego gracza za 2× wartość (cena + budynki) po zapłaceniu czynszu (landmarku nie da się wykupić),
- zwycięstwo przez bankructwo przeciwników albo przez monopol (np. 3 pełne grupy kolorów).

**Własne dodatki:**
| Oryginał | Kampus Tour |
|---|---|
| Start | **Początek**: premia za przejście |
| Więzienie | **Kolokwium**: tracisz turę albo zdajesz rzutem dubletu |
| Mistrzostwa świata | **Juwenalia**: wybrane własne pole ma czynsz ×2, kolejne Juwenalia ×3, ×4… (jedno pole naraz) |
| Podróż | **Bilet MPK**: przeskok na dowolne pole w następnej turze |
| Karty szansy | **Karty Dziekanatu**: stypendium, warunek, poprawka itp. |

Do tego pole **Opłata za akademik** (15 zł) oraz Ksero i Stołówka (czynsz zależny od rzutu).

**Długość partii:** maksymalnie około 45 minut. Po 20 rundach wygrywa
gracz z największym majątkiem (gotówka + wartość pól i budynków). Limitu czasu partii nie ma.
Po partii ekran podsumowania (`KampusSummary.tsx`): wykres majątku, zapłacone czynsze, dochód z pól, dublety.

### 2.2 Poprawka (gra karciana typu Uno)

- 2–6 graczy, własne karty, nazwy i grafiki.
- Ukryte informacje: każdy widzi tylko swoją rękę (filtrowanie stanu per gracz).

### 2.3 Statki i Gomoku (pięć w rzędzie)

- Proste gry 1v1, zbudowane jako pierwsze, żeby przetestować cały przepływ platformy.
- Gomoku: plansza 15×15, wygrywa 5 lub więcej w linii; `id` gry to nadal `piec-w-rzedzie`.
- Statki również wymagają ukrywania stanu (plansza przeciwnika).
- Statki: cztery tryby do wyboru w lobby: Klasyczny (10×10, flota 1×4, 2×3, 3×2, 4×1 bez stykania, także rogami),
  Szybki (8×8, flota 4-3-2-2, partia na kilka minut),
  Amerykański (`hasbro`, 10×10, flota 5-4-3-3-2, statki mogą się stykać, bez X wokół zatopionego) i Flota wojenna (12×12, flota 6-5-4-4-3-3-2-2).
- Statki: losowe ustawienie
  na start z przenoszeniem (przeciąganie albo dotknięcie) i obracaniem, trafienie = kolejny strzał, X wokół zatopionego.
  Gotowość w rozstawianiu można cofnąć; całe rozstawianie ma jeden limit 90 s.

### 2.3a Chińczyk (spoza pierwotnego planu)

- 2-4 graczy, wyjście tylko na 6, 3 próby, gdy żaden pionek nie stoi na torze, 6 = kolejny rzut, max 3 szóstki z rzędu.
- Pole startowe z pionkiem właściciela jest bezpieczne (rywal nie może na nim stanąć); w domku końcowym nie wolno przeskakiwać własnych pionków.
- Dwa tryby w lobby: Klasyczny (jak wyżej, 4 pionki, pełny ranking, 60 s) i Szybki (pionek na starcie, wyjście na 1 i 6,
  nadwyżka oczek do domku przepada, dodatkowy rzut za zbicie i wejście do domku, koniec po pierwszym graczu z 3 pionkami, 20 s, szybsze animacje).
- Klasyczny toczy się do pełnego rankingu (`isOver` zwraca `ranking`). Jedyny możliwy ruch wykonuje się sam.

### 2.3b Memory (spoza pierwotnego planu)

- 2-6 graczy, wspólna plansza zakrytych kart z ikonami; w turze odkrywasz dwie karty. Para zostaje u ciebie i daje kolejny ruch,
  po pudle karty widać 1,5 s, a tura od razu przechodzi dalej. Wygrywa najwięcej par, remis na górze bez zwycięzcy.
- Trzy tryby w lobby: Mała (4×4, 8 par), Średnia (4×6, 12 par, domyślna) i Duża (6×6, 18 par).
- Układ kart zna tylko serwer: `playerView` pokazuje symbole kart zebranych, pierwszej karty tury i ostatniego pudła.

### 2.4 Mini-gry (przerywniki)

- **Refleks**: dotknij pola, gdy zmieni kolor; 12 zmian po losowym opóźnieniu 1-3 s, wynik = średnia reakcja w ms (mniej lepiej), falstart albo reakcja ponad 1 s liczy się jak 1000 ms.
- **Sekwencja** (`simon`): powtarzanie rosnącej sekwencji 4 kolorów, wynik = najdłuższa seria.
- **Stoper**: licznik znika po 3 s, dotknij dokładnie przy wylosowanym celu (6-14 s); wynik = odchyłka w ms (mniej lepiej).
- **Tabela Schultego**: siatka 5×5 z liczbami 1-25, dotykasz po kolei; wynik = czas + 3 s za każdą pomyłkę.
  Znalezione liczby zostają widoczne; postęp rywali widać na kropkach graczy (ruch `progress`).
- **Kolor liter** (`stroop`): nazwa koloru napisana innym kolorem, wybierasz kolor liter (w każdej czwórce plansz jedna zgodna); 30 s, wynik = trafienia (remis: niższa średnia).
- **Liczenie**: 30 s działań (+, −, ×, :) z czterema odpowiedziami; wynik jak w Kolorze liter.
  W obu pomyłka blokuje na 1 s (inaczej losowe klepanie byłoby szybsze niż myślenie).
- **Narysuj koło**: do 10 prób palcem, liczy się najlepsza (można zakończyć wcześniej), wynik = % idealności liczony na serwerze z punktów rysunku (dopasowanie okręgu, zakładka obcinana, poniżej 0,9 obrotu albo za małe = 0). Niedokończone koło nie zużywa próby; na końcu najlepsze i najgorsze koło każdego gracza.
- **Odcień** (`kolor`): 5 kolorów, każdy widać 2 s, potem odtwarzasz go suwakami barwy, nasycenia i jasności; wynik = suma odległości ΔE (Lab, każda ucięta do 100, mniej lepiej), liczona na serwerze.
- **Policz kropki**: 10 rund, w każdej 8-40 kropek (razem zawsze 240) widocznych przez 1,5 s, potem wpisujesz ich liczbę; wynik = suma błędów (mniej lepiej), liczona na serwerze. Po każdej odpowiedzi kropki wracają z prawdziwą liczbą i różnicą; numer rundy rywali widać na kropkach graczy (ruch `progress`).
- **Kąt** (`kat`): 10 rund, w każdej kąt 5-175° (wierzchołek na środku, równe ramiona, losowy obrót) widoczny przez 1,5 s, potem wpisujesz jego miarę w stopniach (0-180); wynik = suma odchyłek w stopniach (mniej lepiej), liczona na serwerze. Po limicie czasu każda runda liczy się jak najgorsza możliwa odpowiedź. Odsłona i pigułki jak w Policz kropki.
- **Sudoku** (`sudoku`): plansza 4×4 (bloki 2×2, cyfry 1-4), 6 cyfr danych i 10 do wpisania, jedno rozwiązanie, ta sama dla wszystkich; dotykasz pustego pola i cyfry. Zła cyfra nie zostaje w polu i dodaje 5 s kary. Wynik = czas + kara (mniej lepiej), liczony na kliencie, serwer odrzuca nierealne wartości. Postęp rywali widać na kropkach graczy (ruch `progress`).
- **Trzy kubki** (`kubki`): do 20 rund, w każdej kulka pod jednym z trzech kubków (widać ją 1 s), kubki zamieniają się miejscami (4 zamiany w pierwszej rundzie, o jedną więcej w każdej następnej, od 500 do 150 ms na zamianę), potem dotykasz kubka z kulką. Pierwsza pomyłka kończy partię; wynik = zaliczone rundy (więcej lepiej, bez drugiego kryterium), liczony na serwerze ze wskazań. Po wskazaniu przez 1 s widać, gdzie była kulka.
- **Który rok?**: 10 rund, każda z wydarzeniem historycznym / wynalazkiem / premierą; ustawiasz rok suwakiem w zakresie 1900-2025, wynik = suma odchyłek w latach (mniej lepiej), liczona na serwerze. Runda trwa najwyżej 20 s, po czasie liczy się rok ustawiony na suwaku. Po każdej odpowiedzi przez 2,5 s widać prawdziwy rok i różnicę ze znakiem, numer rundy rywali widać na kropkach graczy (ruch `progress`).
- **Środek**: 10 rund, w każdej odcinek pod losowym kątem, dotykasz go w połowie długości; odcinki mają 50-90% boku pola; dotknięcie jest rzutowane na odcinek, błąd liczy się wzdłuż niego w % długości odcinka, wynik = suma błędów (mniej lepiej), liczona na serwerze. Dotknięcie dalej niż 60 umownych px od odcinka (pole ma bok 300 px niezależnie od telefonu) jest ignorowane bez kary. Liczy się miejsce podniesienia palca (punkt można przesunąć, palec może leżeć obok odcinka); potem przez 1 s widać prawdziwy środek i błąd. Na końcu jedna tabela rund z wyróżnionym najlepszym w każdej.
- **Stój!** (`stoj`): 30 s, jedno pole zapala się na zielono (dotknij) albo czerwono (nie wolno, co trzeci bodziec); odstęp między bodźcami maleje z 1000 do 500 ms. Wynik = trafienia − 2 za każdy błąd (nie mniej niż 0), przy remisie niższa średnia reakcji; liczony na serwerze z czasów reakcji na kolejne bodźce.
- **Śledzenie** (`sledzenie`): do 20 rund, w każdej 8 kulek, 3 cele podświetlone przez 1,5 s, potem wszystkie lecą 5 s (z każdą rundą szybciej) i gracz wskazuje 3 kulki. Pierwsza pomyłka kończy partię; wynik = zaliczone rundy, przy remisie więcej trafionych celów w rundzie z pomyłką, liczony na serwerze.
- **Wieża** (`wieza`): do 30 pięter, klocek jeździ w poziomie (z każdym piętrem szybciej) i gracz zatrzymuje go dotknięciem nad poprzednim; to, co wystaje, jest ucinane, odchyłka do 2% szerokości pola wyrównuje klocek bez ucinania. Pudło kończy partię, niedotknięty klocek spada sam po 5 s; wynik = wysokość wieży, przy remisie szerszy ostatni klocek, liczony na serwerze z czasów zatrzymania. Wysokość wież rywali widać na kropkach graczy (ruch `progress`).
- **Rytm** (`rytm`): metronom gra 8 uderzeń (klik, błysk i wibracja) w tempie 70-130 BPM i cichnie, gracz stuka dalej w tym samym tempie przez 10 s. Wynik = średnia odchyłka odstępów między stuknięciami od odstępu metronomu w ms (mniej lepiej), liczona na serwerze z czasów stuknięć; pominięte uderzenia liczą się jak najgorsze. Grający nie widzi limitu tury ani licznika sekund (podawałyby tempo).
- **Inny element** (`inny`): 30 s, siatka identycznych wielokątów, jeden różni się obrotem, odcieniem, rozmiarem albo kształtem (rodzaje idą potasowanymi kompletami, w każdej partii po równo; kształt tylko dopóki siatka rośnie); dotykasz go. Siatka rośnie z każdym trafieniem na przemian o kolumnę i wiersz od 2×2 do 6×6, a różnica maleje. Pomyłka blokuje na 1 s i plansza zostaje; wynik jak w Kolorze liter.
- **Obrót** (`obrot`): 30 s, dwie figury z klocków (poliomino z 4-7 kwadratów, klocków przybywa co 3 pary); druga to pierwsza obrócona o 90, 180 albo 270° albo jej obrócone lustrzane odbicie, gracz wybiera „Ta sama” albo „Lustro”. Figury są zawsze chiralne, więc odpowiedź jest jedna. Pomyłka blokuje na 1 s i zabiera punkt; wynik = trafienia − pomyłki (nie mniej niż 0), przy remisie niższa średnia.
- **Literówka** (`literowka`): 30 s, cztery słowa w siatce 2×2, jedno z błędem ortograficznym (ó/u, rz/ż albo ch/h, np. „żeka”, „chałas”); dotykasz błędnego. Słowa losuje serwer z listy par w `literowka-dane.ts`, w pierwszych 45 planszach żadne się nie powtarza. Pomyłka blokuje na 1 s i zabiera punkt; wynik jak w Obrocie.
- **Mapa** (`mapa`): 10 rund, w każdej nazwa jednego z 62 większych miast Polski; gracz stawia znacznik na konturze kraju (sam kontur, bez rzek i województw), może go przenieść i zatwierdza. Wynik = suma odległości w km (haversine, każda runda zaokrąglona, mniej lepiej), liczona na serwerze z punktów w ułamkach pola. Po każdej odpowiedzi przez 1,5 s widać prawdziwe miejsce i odległość; na końcu tabela rund z wyróżnionym najlepszym w każdej.
- **Przytrzymaj** (`przytrzymaj`): 5 rund, w każdej pole świeci się przez losowy czas 1-5 s (razem zawsze 15 s), potem gracz trzyma palec na ekranie tak samo długo. Wynik = suma odchyłek w ms (każda ucięta do celu, mniej lepiej), liczona na serwerze z czasów trzymania. Po puszczeniu przez 1,5 s widać czas, cel i odchyłkę ze znakiem; grający nie widzi limitu tury ani licznika sekund. Na końcu tabela rund z wyróżnionym najlepszym w każdej.
- **Balon** (`balon`): 10 balonów, każde stuknięcie pompuje balon i dodaje punkt; gracz w dowolnej chwili zgarnia punkty balonu, a pęknięcie je zabiera. Każdy balon wytrzymuje wylosowaną liczbę stuknięć (1-30, u wszystkich tak samo, razem zawsze 155), następne go rozrywa. Wynik = suma zgarniętych punktów, przy remisie mniej pękniętych balonów, liczony na serwerze z liczby stuknięć w każdym balonie. Numer balonu rywali widać na kropkach graczy (ruch `progress`), punktów nie; na końcu tabela z wytrzymałością balonów.
- **W pamięci** (`w-pamieci`): do 12 rund, w każdej liczba startowa i kolejne działania („+7”, „−3”, „×2”) migają po 1,5 s, wyniku pośredniego nie widać; gracz wpisuje, ile wyszło. Ciąg wydłuża się o jedno działanie co rundę (od 2 do 13), wartości zostają w 1-99. Pierwsza pomyłka kończy partię; wynik = zaliczone rundy, przy remisie mniejsza odchyłka w rundzie z pomyłką, liczony na serwerze z odpowiedzi.
- **Dziesiątki** (`dziesiatki`): 30 s, siatka 4×4 z liczbami 1-9; gracz dotyka dwóch pól dających razem 10 (nie muszą sąsiadować), para znika i wchodzą dwie nowe liczby z dostaw wylosowanych na serwerze (te same dla wszystkich). Na planszy zawsze jest co najmniej jedna para (`take`). Pomyłka blokuje na 1 s; wynik = liczba par, przy remisie niższa średnia, jak w Kolorze liter.
- **Tort** (`tort`): 5 okrągłych tortów, każdy do podziału na 3-7 równych kawałków (każda liczba raz); jedno cięcie od środka leży już pod losowym kątem, resztę gracz stawia dotknięciem i może przesuwać, potem „Pokrój”. Błąd tortu = ile tortu trzeba by przełożyć, żeby kawałki były równe (połowa sumy odchyłek kawałków, w % tortu); wynik = suma błędów (mniej lepiej), liczona na serwerze z kątów cięć. Po każdym torcie przez 1,5 s widać idealne cięcia i błąd; na końcu tabela rund z wyróżnionym najlepszym w każdej.
- **Za zasłoną** (`zaslona`): 8 rund, w każdej kulka toczy się ze stałą prędkością w prawo (widać ją 0,8-2 s), znika za zasłoną i jedzie jeszcze 1-4 s do mety (kreska na zasłonie); dotykasz w chwili, gdy dotrze. Czasy są losowane niezależnie, więc zmieniają się i prędkość, i szerokość zasłony; suma czasów za zasłoną to zawsze 20 s, żeby każda partia była równie trudna. Dotknięcie przed zniknięciem kulki jest ignorowane. Wynik = suma odchyłek w ms (każda ucięta do czasu za zasłoną, mniej lepiej), liczona na serwerze z czasów dotknięć. Po każdej rundzie przez 1,5 s widać, gdzie kulka była, i odchyłkę ze znakiem; na końcu tabela rund. Grający nie widzi limitu tury.
- **Zakupy** (`zakupy`): jedna runda, przez 10 s widać listę 10 przedmiotów (emoji), potem z półki 20 zaznaczasz te z listy i zatwierdzasz „Gotowe”. Zaznaczać można dowolnie (0-20); wynik = trafienia − zaznaczenia spoza listy (nie mniej niż 0), przy remisie krótszy czas zaznaczania, liczony na serwerze z indeksów i czasu. Na końcu jedna półka z odpowiedzią i kropkami graczy przy zaznaczonych przedmiotach.
- **Nożyczki** (`nozyczki`): 5 nieregularnych gładkich kształtów (losowych, w losowym miejscu pola), każdy przecinasz jednym ruchem palca: cięcie to prosta przez punkt dotknięcia i puszczenia, przedłużona przez cały kształt. Błąd = o ile udział części odbiega od połowy, w punktach procentowych (53% i 47% to 3,0); wynik = suma błędów (mniej lepiej), liczona na serwerze z pól po obu stronach prostej. Ruch za krótki albo obok kształtu jest ignorowany bez kary. Po cięciu przez 1,5 s widać obie części i ich udziały; na końcu tabela rund z wyróżnionym najlepszym w każdej.
- 1-6 graczy naraz, każdy gra u siebie to samo wyzwanie (wylosowane na serwerze), na końcu ranking.
  Partia toczy się na kliencie (opóźnienie Wi-Fi zepsułoby pomiar), serwer dostaje tylko wynik i odrzuca nierealne wartości.
- Każda mini-gra zaczyna od ekranu instrukcji (`Intro` w ui.tsx: animowany podgląd, trzy punkty z ikonami, „Start”). Każdy klika „Start” osobno i gra od razu;
  po 15 s (`INTRO_SECONDS`) gra rusza sama. Limit platformy startuje dopiero, gdy wystartuje ostatni gracz (wiadomość pokoju `begin`); na ekranie widać, kto już gra, a kto czyta zasady.
- Każda mini-gra ma jeden typ ruchu `result` (Narysuj koło wysyła go po każdej próbie, Tabela Schultego, Sudoku, Policz kropki, Kąt, Który rok?, Wieża i Balon mają jeszcze `progress`); ranking liczy wspólne `rankResults` (core.ts), zwycięzca tylko przy 2+ graczach bez remisu;
  `places` podaje miejsca z remisami (oba z jednego komparatora przez `ranked`), z których turniej liczy punkty.
  Kolor liter, Liczenie, Inny element, Obrót i Literówka dzielą `quiz.ts` i `Quiz.tsx` (Dziesiątki biorą z nich walidację i tabelę wyników), a Policz kropki i Kąt ekran `Szacowanie.tsx`. Pasek statystyk w trakcie partii to wspólne `Stats` (ui.tsx). Odświeżenie w trakcie = partia od nowa.

- **Rekordy**: po każdej skończonej mini-grze (także solo i w turnieju) serwer zapisuje wynik każdego gracza jako jedną liczbę
  (`record` w `GameDefinition`: `score` i kierunek `lower`) oraz, jeśli gra rozstrzyga remisy drugim kryterium, także je (`tie`: średnia reakcji
  w grach na trafienia i punkty, trafione cele w Śledzeniu, szerokość klocka w Wieży, pęknięte balony w Balonie, czas zaznaczania w Zakupach). Ranking gry to najlepszy wynik każdego nicku: główny wynik,
  potem drugie kryterium („12 traf. · 256 ms”), a przy całkiem równych wyżej wcześniejszy. Widać go w trzech miejscach: panel po partii (`RecordPanel`: miejsce wszech czasów, „Nowy rekord!” po pobiciu własnego albo „Pierwszy wynik”, awans,
  ile brakuje do osoby wyżej), lista po wybraniu gry i linia „Rekord: …” na ekranie instrukcji, oraz ekran „Rekordy” (`Records.tsx`, z ekranu głównego i z listy mini-gier):
  trzy sekcje: „Twoje rekordy” (gry, w których gracz prowadzi), „Do pobicia” (rekord ma ktoś inny; lider z jasną koroną, własny rekord w kolorze gracza)
  i „Jeszcze nie grane”. Karty gier to akordeon (otwarta jedna naraz); gospodarz w pokoju ma w nich „Pobij” i „Zagraj ponownie”, które wybierają grę na liście mini-gier. Miejsca liczy wspólne `standing` (core.ts), jednostki wyniku trzyma `FORMAT` w `Records.tsx`.
  Lider każdej listy ma własny kafel z koroną. Serwer trzyma też **rekordową partię** każdej gry: stan lidera przycięty do jednego gracza (`soloState` w core.ts,
  gracz pod id `SOLO`, bez id sesji; kolumna `detail`, jedna partia na grę). Ekran „Rekordy” po rozwinięciu gry pobiera ją z `/api/records/:gameId/top`
  i pokazuje zwykłym ekranem końcowym tej gry (`MiniGame.tsx`), np. koło narysowane przez lidera albo jego tabelę rund. Rekordy sprzed tej zmiany partii nie mają.

### 2.5 Państwa-miasta

- 2-6 graczy, 5 rund, każda na inną literę (bez Ą Ć Ę Ń Ó Ś Ź Ż Q V X Y), kategorie: Państwo, Miasto, Zwierzę, Roślina, Rzecz, Imię.
- Wszyscy piszą naraz (90 s). Kto pierwszy odda kartkę (z kompletem albo bez), daje STOP i reszta ma jeszcze 7 s. Szkic leci na serwer w tle, więc po czasie albo odświeżeniu nic nie przepada.
- Głosowanie (45 s): odpowiedź odpada, gdy odrzuci ją ponad połowa pozostałych; zła pierwsza litera odpada sama.
- Punkty: 15 jedyna ważna w kategorii, 10 unikalna, 5 powtórzona (bez wielkości liter i polskich znaków), 0 brak lub odrzucona.
- Po głosowaniu podsumowanie rundy (20 s albo „Dalej” od wszystkich).
- Limit zależny od fazy: opcjonalne `turn(state) → { key, seconds }` w `GameDefinition`; licznik startuje od nowa tylko przy zmianie `key`.

### 2.6 Turniej

- Seria mini-gier puszczana po kolei w jednym pokoju, 1-6 graczy. To nie jest gra z rejestru `GAMES`: pokój odpala kolejne mini-gry
  zwykłym `startMatch` i sumuje punkty (zasady w `turniej.ts`, czyste funkcje).
- Gospodarz ustawia liczbę gier (3 do liczby niewykluczonych, domyślnie 8). Każdą mini-grę można oznaczyć jako pewną albo wykluczoną;
  lista jest wspólna i zaznacza ją każdy w pokoju (spory rozstrzygają gracze, nie aplikacja). Resztę losuje serwer.
- Punkty za grę: liczba graczy ze ściśle gorszym miejscem (remisujący dostają tyle samo). Tabela: suma punktów, potem wygrane gry.
- Po każdej grze widać jej wyniki i tabelę; następna rusza po „Dalej” od wszystkich albo sama po 15 s.
- Remis na szczycie po ostatniej grze daje jedną dogrywkę (dolosowana gra); po niej remis zostaje bez zwycięzcy.
- Wyjście gracza przerywa tylko bieżącą grę (bez punktów), turniej trwa. Przed czasem kończy go tylko gospodarz.
- Zwycięzca trafia do rankingu pod `id` `turniej`; pojedyncze gry zapisują się jak zwykle.

## 3. Architektura

```
Telefon (PWA, React)  ⇄  WebSocket  ⇄  Serwer Colyseus (Node)
                                          │
                                          ├─ logika gier (czyste funkcje TS)
                                          └─ SQLite (ranking wygranych i rekordy mini-gier po nicku; stan pokoi w pamięci)
```

**Zasada:** serwer jest jedynym źródłem prawdy. Klient wysyła intencje („rzucam kośćmi”),
serwer je waliduje, losuje, liczy nowy stan i rozsyła każdemu graczowi jego widok.

### Interfejs gry

Każda gra to moduł niezależny od sieci i UI:

```ts
// packages/games/src/core.ts
interface GameDefinition<State, Move> {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  moveSchema: z.ZodType<Move>;          // kształt ruchu z sieci; reguły sprawdza validateMove
  modes?: { id: string; name: string; hint: string; default?: boolean }[]; // tryby do wyboru w lobby
  setup(players: PlayerId[], rng: Rng, mode?: string): State;
  validateMove(state: State, player: PlayerId, move: Move): boolean;
  applyMove(state: State, player: PlayerId, move: Move, rng: Rng): State;
  playerView(state: State, player: PlayerId): unknown; // ukrywanie informacji; obserwator dostaje ""
  isOver(state: State): { winner?: PlayerId; ranking?: PlayerId[] } | null;
  places?(state: State): Record<PlayerId, number>; // mini-gry: miejsca po końcu (od 1, remis = to samo), dla turnieju
  waitingFor(state: State): PlayerId[]; // jedna osoba albo kilka w fazie równoczesnej; [] po końcu
  turnSeconds?: number;                 // limit tury
  turn?(state: State): { key: string; seconds: number }; // limit zależny od fazy, licznik od nowa przy zmianie key
  timeoutMove?(state: State, player: PlayerId, rng: Rng): Move;  // ruch za gracza po limicie
  record?: { lower: boolean; score(state, player): number; tie?: { lower: boolean; score(state, player): number } }; // mini-gry: wynik do rankingu rekordów i drugie kryterium
}
```

Rejestr gier: `GAMES` w `packages/games/src/index.ts`. Wiadomości pokoju: `ROOM_MESSAGES` w `lobby.ts`.
Wspólne pomocnicze w `core.ts`: `createRng` (mulberry32), `roomCode`, `rankResults`, `rankPlaces`, `ranked`, `shuffle`, `average`, `byHitsThenAverage`, `byScoreThenAverage`,
`normalize`, `nickKey`, `initials` (inicjały na kropkach graczy), `standing`, `compareRecords`, `soloState`, `dailyGame`, `withSum` (losowanie o stałej sumie, żeby każda partia miała tyle samo do zdobycia).

### Reguły platformy (obowiązują każdą grę)

- Po limicie tury serwer wykonuje `timeoutMove` (losowy ruch), nie przegraną. Limit odnawia się tylko,
  gdy zmienia się `waitingFor` (albo `key` z `turn`) lub ten sam gracz ma kolejny ruch.
- Gracze bez miejsca oglądają partię. Nowy gracz dostaje miejsce sam, jeśli gra wybrana i jest wolne.
- Rewanż po zgodzie wszystkich grających, kolejność miejsc rotuje (poza mini-grami, gdzie wszyscy grają naraz); do lobby może wrócić każdy.
- W mini-grach (gry solo, `minPlayers: 1`) limit rusza po ekranie instrukcji: gdy wszyscy klikną „Start” albo po 15 s.
- Limit tury: 60 s w większości gier; dłużej w Sekwencji, Śledzeniu i W pamięci (300 s), Który rok? (240 s), Tabeli Schultego, Odcieniu, Wieży, Mapie i Trzech kubkach (180 s),
  Narysuj koło, Sudoku, Policz kropki, Kąt, Przytrzymaj, Za zasłoną, Balon i Tort (120 s), Kolorze liter, Liczeniu, Innym elemencie, Obrocie, Literówce i Dziesiątkach (90 s); Państwa-miasta mają limit per faza, Statki 90 s na całe rozstawianie, Chińczyk w trybie Szybkim 20 s.
- Gdy gracz z miejscem zniknie z pokoju w trakcie partii (wyjdzie sam albo nie wróci w 10 minut), partia się kończy:
  jeśli został jeden gracz, wygrywa walkowerem; przy większej liczbie kończy się bez zwycięzcy.
- Lobby: gospodarz wybiera grę i daje start, goście potwierdzają gotowość; każdy może zmienić swój kolor
  (poza partią); link `/?kod=ABCD` z przyciskiem udostępniania. Lista w lobby to gry główne oraz kafle „Turniej” i „Mini-gry”.
- Gra główna (`minPlayers > 1`) po wybraniu otwiera u wszystkich ekran gry (`Setup.tsx`): opis, tryb (jeśli gra ma `modes`;
  zmiana trybu kasuje gotowość gości), gracze i start; gospodarz wraca do listy gier przez `pickGame` z `null`.
- Mini-gry mają osobny ekran z listą (`MiniGames.tsx`); otwiera go kafel u gospodarza (lokalnie, bez stanu w pokoju), a goście widzą go,
  gdy gospodarz wybierze grę. Mini-gry mają zasady narzucone z góry, bez trybów.
- Turniej ma ekran ustawień (`TournamentSetup` w `Setup.tsx`): `pickTournament` (gospodarz) ustawia liczbę gier, `markGame` (każdy) zaznacza jedną grę; obie kasują gotowość gości.
  W trakcie turnieju `gameId` to bieżąca gra, a `tournament` w `RoomView` niesie listę gier i punkty; „Dalej” między grami to wiadomość `rematch`.
- Limit 3 pokoi na IP (pokoje gry solo liczone osobno, do 20: cała sala na uczelnianym Wi-Fi ma jedno IP), rate limit 10 wiadomości/s na klienta.

**Platforma (skorupa)** jest wspólna dla wszystkich gier: pokoje z 4-znakowym kodem
(bez mylących znaków typu O/0, I/1), lobby z wyborem gry, nicki i kolory graczy,
reconnect, tablica wyników, rewanż, sprzątanie pokoi po godzinie bezczynności.

**Synchronizacja:** stan gry to zwykły obiekt TS. Po każdym ruchu serwer wysyła wiadomość
z `playerView` osobno do każdego gracza, zamiast pełnej synchronizacji Schema z Colyseus.
Prościej i bezpiecznie dla gier z ukrytymi informacjami.

## 4. Stack

| Warstwa | Technologia |
|---|---|
| Język | TypeScript (wszędzie) |
| Monorepo | pnpm workspaces |
| Serwer / pokoje | Colyseus (Node.js) + Express (statyczny frontend, `/api/stats`, `/api/records`, `/api/records/:gameId/top`, `/api/daily`, `/api/rooms`) |
| Walidacja wiadomości | zod |
| Frontend | Vite + React |
| Style / animacje | Tailwind, Motion (planowane, jeszcze niezainstalowane; na razie animacje w CSS) |
| Ikony | Phosphor Icons |
| Plansza | SVG / CSS Grid |
| PWA | manifest + ikony, bez service workera (gra i tak wymaga serwera) |
| Trwałość stanu | SQLite (wbudowany `node:sqlite`) |
| Testy | Vitest (szczególnie zasady Kampus Tour) |
| CI/CD | GitHub Actions → obraz Dockera |

## 5. Struktura repozytorium

```
mini-games/
├─ packages/
│  └─ games/src/   # core.ts (kontrakt, RNG, utilsy), lobby.ts, turniej.ts, index.ts (GAMES),
│                  # <gra>.ts + <gra>.test.ts dla każdej gry (płasko)
├─ apps/
│  ├─ server/src/  # index.ts, LobbyRoom.ts (pokój Colyseus), stats.ts + stats.test.ts (SQLite, GET /api/stats i /api/records)
│  └─ web/src/     # main.tsx, App.tsx, net.ts (połączenie, token, reconnect), Dev.tsx (tryb testowy),
│                  # screens/ (Home, Lobby, Setup (ekran gry głównej i turnieju przed partią), MiniGames, Records (rekordy mini-gier), Game,
│                  # ui.tsx ze wspólnymi Screen/TopBar/StickyBar/Scores),
│                  # games/<Gra>.tsx (UI każdej gry), games/MiniGame.tsx (mini-gra po `id`, dla pokoju i ekranu rekordów), index.css (klasy .tile .label .btn .field)
├─ .github/workflows/ci.yml
├─ Dockerfile, docker-compose.yml, cloudflared/
├─ README.md      # dev i deploy
├─ ZASADY-GIER.md # dokładne zasady każdej gry (czytaj przed zmianą gry, aktualizuj po zmianie zasad)
└─ KONCEPT.md
```

Dokładne zasady gier: `ZASADY-GIER.md` (przeczytaj sekcję gry przed zmianą, popraw po zmianie zasad).

Proces wprowadzania nowej gry (ustalenia, testy przed kodem, spójność zasad, wyglądu i animacji): `ZASADY.md`.

Nowa gra = sekcja w `ZASADY-GIER.md`, plik zasad z testami w `packages/games/src`, wpis w `GAMES`, komponent w `apps/web/src/games`,
podpięcie w `screens/Game.tsx` i ikona w `screens/Lobby.tsx`.

## 6. Hosting

- **Raspberry Pi** w homelabie, kontener Docker obok istniejących usług.
- **Cloudflare Tunnel** (`cloudflared`) wystawia `games.figielak.dev` bez otwierania portów; obsługuje WebSockety.
- Jeden kontener serwuje zbudowany frontend i WebSockety.
- `mem_limit: 256m` w docker-compose, żeby gry nie zagroziły innym usługom.
  Spodziewane zużycie: ~100–150 MB RAM przy kilku pokojach.
- SQLite w wolumenie Dockera, objęty istniejącym backupem homelaba.
- Plan B: ten sam obraz na Cloud Run (`max-instances=1`, timeout 60 min, SQLite → Firestore).

## 7. Bezpieczeństwo i fair play

- Rzuty kośćmi i tasowanie kart tylko na serwerze.
- Walidacja każdego ruchu (czy to tura gracza, czy ruch jest dozwolony, czy stać go na zakup).
- Rate limiting wiadomości i limit liczby pokoi na IP.
- Brak danych osobowych: tylko nick i losowy token sesji.

## 8. Plan prac

| Etap | Zakres | Cel |
|---|---|---|
| 0 | Monorepo, Docker, tunnel, „hello world” pod subdomeną | Infrastruktura działa (gotowe) |
| 1 | Skorupa: pokoje, kody, lobby, nicki, reconnect | Platforma (gotowe) |
| 2 | Gomoku | Pierwsza gra end-to-end, rewanż (gotowe) |
| 3 | Statki | Ukrywanie stanu (`playerView`) (gotowe) |
| 4 | Kampus Tour: rdzeń (ruch, kupno, czynsz, budowanie, bankructwo) | Grywalna wersja główna (gotowe) |
| 5 | Kampus Tour: dodatki (Kolokwium, Juwenalia, karty, wykupienie, Bilet MPK, monopol) | Pełna wersja (gotowe) |
| 6 | Poprawka | Gra karciana (do zrobienia) |
| 7 | PWA, animacje, statystyki, szlify | Polerka (PWA, ranking po nicku i rekordy mini-gier gotowe) |
| + | Chińczyk, Memory, mini-gry (30 sztuk), Państwa-miasta, Turniej z mini-gier | Poza planem (gotowe) |
| dalej | Zapis stanu pokoi w SQLite | Do zrobienia |

## 8a. Sposób pracy

- Plan (plan mode) → akceptacja użytkownika → implementacja.
- TDD: testy zasad gry (`<gra>.test.ts`, Vitest) w osobnym commicie przed implementacją.
- Styl UI: tokeny 1:1 z `../figielak.dev/src/styles/tokens.css` (akcent #ff2445, Satoshi + Geist Mono,
  przyciski pill), tylko ciemny motyw, zero em-dashy w tekstach UI, kolor gracza zamiast czerwieni dla jego akcji.
- `apps/server` nie może mieć bezpośredniej zależności `zod` (druga kopia `@colyseus/core` → „seat reservation expired”);
  schematy trzymamy w `packages/games`.
- Tryb testowy: `/dev` na serwerze Vite pokazuje kilku graczy obok siebie w jednym pokoju (`/dev?n=4`, domyślnie 2);
  każda ramka to `/?dev=N` z własnym tokenem i nickiem. Działa tylko w dev, w buildzie go nie ma.
- Dev serwer działa z `node --watch`: po zmianie w `apps/server` albo `packages/games` restartuje się sam
  (pokoje są w pamięci, więc trwające partie przepadają).

## 9. Otwarte kwestie

- Nazwy pól Kampus Tour ustalone (grupy jako pory dnia studenta, Ksero i Stołówka jak wodociągi); druga nazwa w grupie „Rano” robocza (Automat z przekąskami).
- Balans ekonomii: start 200 zł (+20 zł za każde dalsze miejsce), kieszonkowe 40 zł, czynsz P/10 (cała grupa x2), z budynkami 0,4P / P / 2P / 4P; bez kompletu grupy do poziomu 2 (poziom 3 i landmark z kompletem), jazda Biletem MPK bez kieszonkowego. Zmiany po 4 partiach testowych (2026-10-07): poziom 3 od pierwszej tury i czynsze 60-100 zł przy pustych kieszeniach dawały szybkie bankructwa, a MPK zamieniał się w darmowy komplet. Do sprawdzenia w kolejnych partiach; jeśli monopol dalej będzie łatwy przez grupy dwupolowe, liczyć tylko grupy trzypolowe.
- Zestaw kart specjalnych w Poprawce (talia 18 Kart Dziekanatu ustalona, w kodzie: CARDS w kampus-tour.ts).
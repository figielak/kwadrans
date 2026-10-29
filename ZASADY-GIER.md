# Zasady gier

Opis zasad tak, jak działają w kodzie (`packages/games/src/<id>.ts`). Przeczytaj sekcję gry, zanim ją zmienisz;
po zmianie zasad popraw też ten plik. Źródłem prawdy jest kod i testy (`<id>.test.ts`), tu jest skrót.
Reguły platformy (limit tury, rewanż, walkower, obserwatorzy) są w `KONCEPT.md`, sekcja 3.

| Nazwa w UI | `id` / plik | Gracze | Limit tury | Typ |
|---|---|---|---|---|
| Kampus Tour | `kampus-tour` | 2-4 | 60 s | planszowa, po kolei |
| Chińczyk | `chinczyk` | 2-4 | 60 s (Szybki 20 s) | planszowa, po kolei |
| Statki | `statki` | 2 | 90 s rozstawianie, 60 s strzał | ukryty stan |
| Gomoku | `piec-w-rzedzie` | 2 | 60 s | po kolei |
| Memory | `memory` | 2-6 | 60 s | po kolei, ukryty stan |
| Labirynt | `labirynt` | 2-4 | 60 s | planszowa, po kolei |
| Państwa-miasta | `panstwa-miasta` | 2-6 | zależny od fazy | równoczesna |
| Kalambury | `kalambury` | 2-6 | zależny od fazy | równoczesna, ukryty stan |
| Refleks | `refleks` | 1-6 | 60 s | mini-gra |
| Sekwencja | `simon` | 1-6 | 300 s | mini-gra |
| Stoper | `stoper` | 1-6 | 60 s | mini-gra |
| Tabela Schultego | `schulte` | 1-6 | 180 s | mini-gra |
| Kolor liter | `stroop` | 1-6 | 90 s | mini-gra |
| Liczenie | `liczenie` | 1-6 | 90 s | mini-gra |
| Narysuj koło | `kolo` | 1-6 | 120 s | mini-gra |
| Odcień | `kolor` | 1-6 | 180 s | mini-gra |
| Policz kropki | `kropki` | 1-6 | 120 s | mini-gra |
| Który rok? | `rok` | 1-6 | 240 s | mini-gra |
| Środek | `srodek` | 1-6 | 60 s | mini-gra |
| Stój! | `stoj` | 1-6 | 60 s | mini-gra |
| Śledzenie | `sledzenie` | 1-6 | 300 s | mini-gra |
| Wieża | `wieza` | 1-6 | 180 s | mini-gra |
| Rytm | `rytm` | 1-6 | 60 s | mini-gra |
| Inny element | `inny` | 1-6 | 90 s | mini-gra |
| Obrót | `obrot` | 1-6 | 90 s | mini-gra |
| Literówka | `literowka` | 1-6 | 90 s | mini-gra |
| Mapa | `mapa` | 1-6 | 180 s | mini-gra |
| Kąt | `kat` | 1-6 | 120 s | mini-gra |
| Przytrzymaj | `przytrzymaj` | 1-6 | 120 s | mini-gra |
| Balon | `balon` | 1-6 | 120 s | mini-gra |
| W pamięci | `w-pamieci` | 1-6 | 300 s | mini-gra |
| Dziesiątki | `dziesiatki` | 1-6 | 90 s | mini-gra |
| Tort | `tort` | 1-6 | 120 s | mini-gra |
| Zakupy | `zakupy` | 1-6 | 80 s | mini-gra |
| Za zasłoną | `zaslona` | 1-6 | 120 s | mini-gra |
| Nożyczki | `nozyczki` | 1-6 | 60 s | mini-gra |
| Sudoku | `sudoku` | 1-6 | 120 s | mini-gra |
| Trzy kubki | `kubki` | 1-6 | 180 s | mini-gra |

Nazwy w UI zmieniały się (2026-10-10), `id`, nazwy plików i typów zostały stare: Sekwencja = `simon`, Kolor liter = `stroop`,
Odcień = `kolor`, Gomoku = `piec-w-rzedzie`. Ranking w SQLite jest po `id`, więc `id` nie wolno zmieniać.

## 1. Mini-gry (wspólny schemat)

- Wyzwanie losuje serwer w `setup` (to samo dla wszystkich) i od razu wysyła w widoku. `playerView` zwraca cały stan,
  więc nic nie jest ukryte (da się podejrzeć; świadoma decyzja, komentarze `ponytail:`).
- Partia toczy się na kliencie. Każdy gracz wysyła jeden ruch `{ type: "result", ... }`; drugi ruch tego samego gracza jest odrzucany.
  Wyjątki: Narysuj koło (do 10 ruchów na gracza), Tabela Schultego, Policz kropki, Kąt, Który rok?, Wieża, Balon, Sudoku i Sekwencja (dodatkowy ruch `progress` po każdym trafieniu, rundzie, klocku, balonie albo wpisanej cyfrze).
- Serwer odrzuca tylko nierealne wartości. Wynik liczy serwer tam, gdzie się da (Narysuj koło, Odcień, Policz kropki, Który rok?, Środek, Stój!, Śledzenie, Wieża, Rytm, Mapa, Kąt, Przytrzymaj, Balon, W pamięci, Tort, Zakupy, Za zasłoną, Nożyczki, Trzy kubki),
  w reszcie ufa klientowi.
- Partia zaczyna się ekranem instrukcji (platforma, nie zasady gry): każdy klika „Start” osobno (wiadomość pokoju `begin`) i gra od razu,
  po `INTRO_SECONDS` (15 s) gra rusza sama. Limit tury startuje, gdy wystartują wszyscy albo minie 15 s; wynik oddany wcześniej go nie uruchamia.
- `waitingFor` = gracze bez wyniku. Po limicie `timeoutMove` wpisuje najgorszy możliwy wynik.
- Koniec, gdy wszyscy oddali wynik. Ranking liczy `rankResults` (core.ts): zwycięzca tylko przy 2+ graczach i bez remisu
  na pierwszym miejscu; gra solo nie ma zwycięzcy (nie nabija statystyk).
- Odświeżenie strony w trakcie = partia od nowa na kliencie. `nonce` w stanie (Stoper, Narysuj koło, Rytm) służy tylko do tego,
  żeby rewanż zamontował komponent od nowa.

### Refleks (`refleks`)
- 12 rund (`ROUNDS`). W każdej pole zmienia kolor po losowym opóźnieniu 1-3 s (12 opóźnień z serwera), gracz dotyka jak najszybciej.
  Liczba rund jest stała, żeby losowe opóźnienia nie zmieniały tego, ile da się ugrać (dawniej 30 s i liczba trafień).
- Każda runda daje jeden czas reakcji 100-1000 ms. Falstart (dotknięcie przed zmianą albo reakcja poniżej 100 ms) i reakcja ponad 1 s
  liczą się jak 1000 ms (`PENALTY_MS`) i runda przepada; po falstarcie 0,8 s przerwy.
- Jeden ruch z `times`: 12 czasów w ms (int). Wynik liczy serwer: zaokrąglona średnia w ms, mniej lepiej, równe to remis.
- Walidacja: lista pusta albo dokładnie 12 liczb całkowitych 100-1000. Pusta lista = limit czasu = 1000 ms, czyli najgorszy możliwy wynik.
- Stan trzyma też `times` każdego gracza (tabela i wykres na końcu; liczba kar to czasy równe 1000).

### Sekwencja (`simon`)
- Sekwencja 100 kolorów (0-3). Klient pokazuje pierwsze n, gracz powtarza, potem n+1 itd. (pole świeci 450 ms, przerwa 150 ms).
- Wynik: `score` = najdłuższa powtórzona seria, więcej lepiej. Walidacja: liczba całkowita 0-100.
- Po ukończeniu serii klient wysyła `{ type: "progress", score }`. Serwer zapisuje ostatnią zaliczoną serię w `progress`.
  Postęp nie maleje, powtórzenie tej samej wartości nie dodaje serii; wynik końcowy nie może być mniejszy niż zapisany postęp.
  Obcy gracz, ułamek, wartość poza zakresem i ruch po wyniku są odrzucane. Dotychczasowy model zaufania klientowi pozostaje.
- Limit 300 s ma stały klucz `run`: postęp i wynik rywala nie odnawiają czasu, także przy jednym graczu.
  Po limicie serwer oddaje ostatni zapisany postęp (0, jeśli gracz niczego nie ukończył).
  To celowy wyjątek od najgorszego wyniku timeoutu, żeby nie gubić zdobytej serii; zaczęta, nieukończona seria nie daje punktu.
- Odświeżenie zachowuje postęp serwera. Po Start klient pokazuje kolejną serię po ostatniej zaliczonej;
  pomyłka i timeout oddają ten sam osiągnięty wynik. Po rewanżu nowa sekwencja i pusty postęp.
- Limit jest skończony, niezależnie od bufora 100 kolorów. Model czasu `T(N) ≈ N + (0,6+d)·N(N+1)/2`,
  gdzie `d` to założony średni czas decyzji na pole, a nie pomiar; nie obiecujemy ukończenia dowolnej serii w 300 s.
  Nie dodajemy szybkości jako drugiego kryterium: równe serie to remis.
- Stare rekordy i detail pozostają bez resetu/przeliczania. Historyczny detail bez `progress` pokazuje zapisany wynik;
  nie odtwarzamy utraconych serii dawnych timeoutów.

### Stoper (`stoper`)
- Po „Start” odliczanie 3, 2, 1 (dotknięcia ignorowane), potem licznik biegnie od 0, po 3 s znika, gracz dotyka przy celu. Klient sam kończy po dwukrotności celu.
- Cel (`target`) losuje serwer: pełne sekundy 6-14 s, ten sam dla wszystkich w partii.
- Grający nie widzi limitu tury po starcie (tykający pasek zdradzałby czas); po dotknięciu: odkryty czas i odchyłka ze znakiem.
- Wynik: `deviation` = odchyłka w ms (int, od 0 do celu), mniej lepiej. Limit czasu: odchyłka równa celowi.

### Tabela Schultego (`schulte`)
- Siatka 5×5 z liczbami 1-25 w losowym układzie, dotykasz po kolei od 1.
- Wynik: `ms` + 3000 ms za każdą pomyłkę (`total`), mniej lepiej.
- Walidacja: `ms` od 3750 (25 × 150 ms) do 180000, `mistakes` int ≥ 0.
- Nowy wynik ma `completed: boolean` w stanie. Klient zgłasza ukończenie (brak pola w ruchu oznacza `true`);
  `completed: false` jest dozwolone tylko w zaufanym kontekście `{ source: "timeout" }`, nigdy z JSON klienta.
  Timeout: 180000 ms, 0 pomyłek, puste `splits` i `completed: false`.
- Każde ukończenie jest przed nieukończeniem, także 170 s + 4 pomyłki = 182 s. Ukończeni są porównywani po czasie z karami;
  nieukończeni remisują ze sobą. Ten sam komparator ustala zwycięzcę, ranking i miejsca w turnieju.
- Nowy timeout nie daje rekordu: `record.score` zwraca nieskończoność jako sygnał dla filtra serwera;
  stan JSON i baza zawierają wyłącznie skończone liczby. Ekran pokazuje „Nieukończono”, bez panelu nowego rekordu.
  Przewaga w sekundach jest pokazywana tylko między dwoma ukończonymi wynikami.
- Stare rekordy i detail bez `completed` pozostają historyczne, bez dopisywania statusu i bez przeliczania.
  Sam czas 180000 ms ani wynik z karami nie dowodzi timeoutu; dawny nierozpoznawalny timeout może nadal wyprzedzać nowe ukończenie.
- Międzyczasy: wynik niesie `splits`, czyli 25 czasów szukania kolejnych liczb (int ≥ 0 ms, suma równa `ms`).
  Pusta lista jest dozwolona (limit czasu). Nie wpływają na ranking, służą tylko do ekranu końcowego.
- Ekran końcowy: pod tabelą wyników wiersz z przewagą („Gracz 1 wygrywa o 0,3 s”, tylko gdy jest zwycięzca) i wykres międzyczasów
  (linia na gracza w jego kolorze, kropka na najdłużej szukanej liczbie, w legendzie „najdłużej 17 (4,1 s)”).
- Bez trybów: znalezione liczby zostają widoczne, jak w oryginale. Dotknięcie już znalezionej liczby nic nie robi.
- Postęp rywali: po każdym trafieniu (poza ostatnim) klient wysyła `{ type: "progress", found }` (int 1-24, tylko gracz bez wyniku).
  Serwer zapisuje go w `progress` i pokazuje jako pierścień na kropkach graczy (po ich dotknięciu pasek i `12/25`). Wartość nie musi rosnąć
  (po odświeżeniu gracz zaczyna od 1) i nie wpływa na wynik.
- Limit przez `turn()` ze stałym kluczem: ruch `progress` nie odnawia 180 s, nawet gdy gra już tylko jedna osoba.
- Ekran: trafiony kafelek błyska na zielono, pomyłka na czerwono z potrząśnięciem; lokalny zegar ma etykietę „Twój czas”.

### Kolor liter (`stroop`) i Liczenie (`liczenie`)
Wspólne zasady w `quiz.ts`, wspólny ekran `Quiz.tsx` (dzielą je też Inny element, Obrót i Literówka).
- 30 s pytań z czterema odpowiedziami; serwer losuje pulę 200 pytań, powtarzaną po wyczerpaniu. Rozmiar puli nie ogranicza liczby trafień.
- Pomyłka blokuje na 1 s (inaczej losowe klepanie byłoby szybsze niż myślenie).
- Wynik: `times` (czasy poprawnych) i `errors`. Ranking jak w Refleksie: trafienia, potem niższa średnia. `errors` nie wpływa na ranking, ale jest widoczne w pasku statystyk i w wynikach.
- Ekran końcowy: tabela z miejscem (puchar u zwycięzcy), trafieniami, średnim czasem (od 1 s w sekundach) i błędami; pod nią notka, jak liczony jest ranking.
- Dotknięta odpowiedź błyska: zielono przy trafieniu, czerwono z potrząśnięciem przy pomyłce.
- Walidacja wspólna sześciu quizów (także Inny element, Obrót, Literówka, Dziesiątki): każdy czas całkowity 0-30000 ms,
  suma ≤ 30000 ms, `errors` całkowite 0-30. Pierwsza pomyłka może paść od razu, kolejne najwcześniej co 1000 ms:
  trzydziesta przed końcem rundy, trzydziesta pierwsza dopiero po jej końcu. Suma czasów nie jest powiększana o blokady,
  bo w Inny element i Dziesiątkach czasy trafień już zawierają blokady tego samego zadania.
  Są to konieczne granice danych, nie dowód prawdziwości pomiaru klienta. Limit czasu: zero trafień.
- Ekran zachowuje każde trafienie, także poniżej 150 ms, i cały czas ponad 5 s. Czasy to różnice zaokrąglonych
  znaczników monotonicznego zegara w pełnych ms; 0 ms może wynikać z rozdzielczości zegara. Od końca 30000 ms
  nowe odpowiedzi nie są przyjmowane, wynik jest wysyłany raz. Pula pytań i dostaw zapętla się jak dotychczas.
  Historyczne rekordy/detail pozostają bez przeliczania; nowe wyniki używają poprawionego pomiaru.
- **Kolor liter**: nazwa koloru (CZERWONY, NIEBIESKI, ŻÓŁTY, ZIELONY) napisana kolorem liter; odpowiedź to kolor liter, nie słowo.
  W 25% plansz słowo zgadza się z kolorem (żeby nie dało się grać „zawsze inny”): dokładnie jedna w każdej kolejnej czwórce plansz,
  na losowej pozycji. Zgodne plansze są szybsze, więc każda partia ma ich tyle samo.
- **Liczenie**: działania losowane po równo z czterech typów: `a + b` (10-99), `a − b` (a 20-99, b 10-a, wynik ≥ 0),
  `a × b` (2-9 × 2-12), `a : b` (dzielnik 2-9, wynik 2-12, zawsze bez reszty). Złe odpowiedzi to typowe pomyłki
  blisko poprawnej: ±1, ±2, ±10, ±20 przy dodawaniu i odejmowaniu, ±1, ±2, ±a, ±b przy mnożeniu, ±1, ±2, ±3 przy dzieleniu;
  dodatnie i bez powtórek. Liczby z działania nie ma wśród opcji: działanie z wynikiem równym `a` albo `b` (49 : 7) jest losowane od nowa.

### Narysuj koło (`kolo`)
- Limit przez `turn(state)`: 120 s na wszystkie próby gracza (także solo); licznik rusza od nowa tylko, gdy ktoś skończy próby.
- Do 10 prób palcem, liczy się najlepsza. Punkty rysunku w układzie 0-1 względem kwadratowego płótna.
- Na środku płótna jest mała kropka (pomoc w wyobrażeniu sobie koła); ocena nie zależy od położenia rysunku.
- Każda próba to osobny ruch `result` z `points` (20-1000 punktów, wszystkie w 0-1). Pusta lista kończy pozostałe próby
  (zostaje dotychczasowa najlepsza); to też ruch po limicie czasu.
- Ocenę liczy serwer (`judge`), klient woła tę samą funkcję przed wysłaniem i niedokończonego koła nie wysyła, więc nie zużywa próby.
- `judge`: obcina rysunek po pełnym obrocie (zakładka nie liczy się), dopasowuje okrąg (metoda Kåsy), potem:
  - poniżej 0,9 obrotu albo mniej niż 20 punktów: `unfinished`, 0 pkt,
  - promień poniżej 0,15: `small`, 0 pkt,
  - inaczej `score = 1000 × (1 − 4 × średni błąd promienia / r)² × (1 − przerwa)`, gdzie przerwa między początkiem
    a końcem liczona w częściach obwodu, pierwsze 3% za darmo.
- `judge` zwraca też dopasowany okrąg (`circle`). Po próbie klient pokazuje go przerywaną linią, rysunek koloruje według
  odchylenia od niego (zielony blisko, czerwony od 10% promienia), a na środku płótna wynik z porównaniem do najlepszej próby.
- Wynik 0-1000 (dziesiąte części procenta), więcej lepiej. Stan trzyma `best` i `worst` każdego gracza.
- Ekran końcowy: karta na gracza w kolejności rankingu (nick, duży najlepszy wynik), pod nią miniatury „Najlepsza” (z przerywanym idealnym okręgiem) i „Najgorsza”; bez osobnej tabeli wyników.
- Koniec, gdy każdy ma 10 prób.

### Odcień (`kolor`)
- 5 kolorów HSB; każdy widać 2 s, potem gracz odtwarza go suwakami barwy (0-359), nasycenia i jasności (0-100).
- Cele losowane bez prawie szarych i prawie czarnych: nasycenie 25-100, jasność 30-100.
- Jeden ruch z 5 kolorami (wszystkie składowe int). Wynik liczy serwer: suma ΔE (CIE76 w Lab), każda ucięta do 100,
  zapisana w dziesiątych częściach (int). Mniej lepiej.
- Pusta lista = limit czasu = 5 × 100.
- Ekran: wzór i podgląd mają ten sam rozmiar (duże pole wydaje się jaśniejsze i bardziej nasycone), suwaki startują losowo,
  przycisk „Zatwierdź kolor” w kolorze gracza. Po zatwierdzeniu porównanie: wzór i odpowiedź obok siebie, zgodność w % (100 − ΔE)
  i podpowiedzi z `hints` („za ciemny”, „za mało nasycony”, „za bardzo w stronę żółci”; progi: jasność 8, nasycenie 10, barwa 10°).
  Po ostatnim kolorze nie ma porównania, od razu ekran wyników (pary wszystkich kolorów są tam).
- Tabela wyników pokazuje średnią zgodność w % (100 − suma ΔE / 5); kolejność ta sama co po sumie ΔE. Pod tabelą notka „więcej znaczy lepiej”,
  nad parami legenda „wzór | odpowiedź”; wszystkie procenty z jednym miejscem po przecinku.

### Policz kropki (`kropki`)
- 10 rund, w każdej 8-40 kropek (bez nakładania, odstęp środków ≥ 0,08) widocznych 1,5 s, potem gracz wpisuje liczbę.
  Razem w partii jest zawsze 240 kropek (`TOTAL`, losowanie do skutku przez `withSum`): błąd rośnie z liczbą kropek, więc każda partia jest równie trudna.
- Jeden ruch z 10 odpowiedziami (int 0-99). Wynik liczy serwer: suma |odpowiedź − liczba kropek|, mniej lepiej.
- Pusta lista = limit czasu: każda brakująca odpowiedź dostaje błąd `max(n, 99-n)`, gdzie `n` to liczba kropek.
  Żadna dozwolona odpowiedź 0-99 nie daje większego błędu; przy tym samym błędzie obowiązuje remis.
  Stare rekordy i detail z timeoutem liczonym jak zera pozostają bez przeliczania. Historia obejmuje obie metody.
- Bez tolerancji: każda kropka różnicy to 1 punkt karny, w obie strony tak samo.
- Ruch `progress` (`done` = liczba odpowiedzianych rund, int 1-9) po każdej odpowiedzi poza ostatnią: tylko do podglądu u rywali
  (pasek „3/10” w pigułce gracza), nie odnawia limitu (`turn` ma stały klucz), może spaść po odświeżeniu strony.
- Ekran: kwadratowy kafel stoi w tym samym miejscu we wszystkich fazach (kropki, pole odpowiedzi, porównanie).
  Po każdej odpowiedzi kropki wracają na ekran razem z „Było 42, wpisałeś 38”, różnicą ze znakiem i sumą błędów;
  wynik idzie na serwer dopiero po „Wyniki” na ostatnim porównaniu. Ekran (`Szacowanie.tsx`) dzieli z Kątem.

### Kąt (`kat`)
Przebieg i ekran jak w Policz kropki (`Szacowanie.tsx`); inny jest rysunek, zakres odpowiedzi i wynik po limicie czasu.
- 10 rund, w każdej kąt widoczny 1,5 s (`SHOW_MS`), potem gracz wpisuje jego miarę w stopniach.
- Serwer losuje rundy, te same dla wszystkich. Runda `{ angle, rotation }`, obie liczby całkowite w stopniach: `angle` 5-175 (`MIN`, `MAX`),
  `rotation` 0-359 to kierunek pierwszego ramienia, drugie leży pod `rotation + angle`. Bez kątów wklęsłych, więc nie trzeba oznaczać mierzonej strony.
- Jeden ruch z 10 odpowiedziami (int 0-180, `MAX_ANSWER`). Wynik liczy serwer: suma |odpowiedź − kąt|, mniej lepiej, bez tolerancji.
- Pusta lista = limit czasu = w każdej rundzie najgorszy możliwy błąd, czyli `max(kąt, 180 − kąt)`
  (nie zera jak w kropkach: zero przy kącie 10° byłoby prawie trafieniem).
- Ruch `progress` (`done` = liczba odpowiedzianych rund, int 1-9) po każdej odpowiedzi poza ostatnią: tylko do podglądu u rywali
  (pasek „3/10” w pigułce gracza), nie odnawia limitu (`turn` ma stały klucz), może spaść po odświeżeniu strony.
- Ekran: wierzchołek na środku kwadratowego kafla, oba ramiona tej samej długości (40% boku). Po odpowiedzi kąt wraca z łukiem przy wierzchołku
  razem z „Było 70°, wpisałeś 62°”, różnicą ze znakiem i sumą błędów.

### Który rok? (`rok`)
- 10 rund, w każdej jedno wydarzenie historyczne, wynalazek albo premiera; gracz ustawia rok suwakiem w zakresie 1900-2025.
- Pula `EVENTS` w `rok.ts`: ok. 160 wydarzeń z jednoznacznym rokiem w czterech działach (historia świata, historia Polski,
  wynalazki i technologia, popkultura); tekst nie zawiera czterocyfrowej liczby, premiera to rok pierwszej premiery.
  Serwer losuje z niej 10 różnych wydarzeń, te same dla wszystkich.
- Jeden ruch z 10 odpowiedziami (int 1900-2025). Wynik liczy serwer: suma |odpowiedź − rok|, mniej lepiej.
- Pusta lista = limit czasu partii = w każdej rundzie najgorszy możliwy błąd, czyli `max(rok − 1900, 2025 − rok)`.
- Limit rundy 20 s jest na kliencie: po czasie zatwierdza się rok ustawiony na suwaku. Suwak startuje na środku (1962).
  Limit partii 240 s = 10 × (20 s + 2,5 s odsłony) plus zapas.
- Ruch `progress` (`done` = liczba odpowiedzianych rund, int 1-9) po każdej odpowiedzi poza ostatnią: tylko do podglądu u rywali
  (pasek „3/10” w pigułce gracza), nie odnawia limitu (`turn` ma stały klucz), może spaść po odświeżeniu strony.
- Ekran: kafel z tekstem wydarzenia, dużym rokiem, suwakiem i przyciskami −1 / +1, nad nim pasek czasu rundy (ostatnie 5 s ostrzegawczy).
  Po zatwierdzeniu przez 2,5 s ten sam kafel pokazuje prawdziwy rok, na torze własny rok (kolor gracza) i prawdziwy (pierścień)
  oraz różnicę ze znakiem; potem sama wskakuje następna runda, po dziesiątej wynik idzie na serwer.
- Ekran końcowy: jedna lista 10 wydarzeń z prawdziwym rokiem i odpowiedziami graczy (w trakcie tylko własne, po końcu wszystkich).

### Środek (`srodek`)
- 10 rund, w każdej odcinek pod losowym kątem na kwadratowym polu; gracz dotyka jego środka.
- Odcinki losowane: kąt dowolny, długość 0,5-0,9 boku pola, oba końce co najmniej 0,05 od krawędzi, środek w losowym miejscu,
  na ile pozwala długość. Długie, bo niedokładność palca jest stała (kilka px), a pomyłka oka rośnie z długością:
  na krótkim odcinku gra mierzyłaby palec, nie oko.
- Jeden ruch z 10 punktami dotknięcia (`x`, `y` w ułamkach pola). Wynik liczy serwer, więc nie zależy od rozmiaru telefonu.
- Dotknięcie jest rzutowane prostopadle na prostą odcinka i błąd rundy to odległość rzutu od środka, mierzona wzdłuż odcinka,
  w procentach jego długości (koniec odcinka = 50%). Każda runda waży więc tyle samo, niezależnie od długości.
  Odchylenie w bok nic nie kosztuje: liczy się tylko to, czy gracz dobrze ocenił połowę.
- Strefa akceptacji: dotknięcie dalej niż 60 umownych px od odcinka (pole ma bok 300 px; strefa jest w px, bo dotyczy palca) (od najbliższego punktu, także za końcami) nie jest odpowiedzią.
  Strefa jest szeroka, żeby dało się celować obok odcinka i nie zasłaniać go palcem (lupa nad kaflem tego nie załatwiała).
  Ekran je ignoruje bez kary, serwer odrzuca cały ruch z takim punktem. Dzięki temu przypadkowe stuknięcie w puste pole nie psuje rundy,
  a rzutowania nie da się nadużyć, stukając daleko obok.
- Wynik = suma błędów z 10 rund, zapisana w dziesiątych częściach procenta (int), mniej lepiej. Największy możliwy błąd rundy
  to koniec odcinka plus strefa (50% + 40% na najkrótszym), więc jedna wpadka nie kosztuje więcej.
- Pusta lista = limit czasu = 10 × 100% (więcej niż najgorsza uczciwa partia).
- Ekran: kwadratowy kafel z odcinkiem (poprzeczne kreski na końcach). Liczy się miejsce podniesienia palca: punkt można przytrzymać
  i przesunąć. W trakcie celowania pierścień pokazuje rzut na odcinek
  (tylko w strefie akceptacji). Puszczenie poza strefą: potrząśnięcie odcinka, wibracja 60 i „Dotknij bliżej odcinka”, runda trwa dalej.
  Po puszczeniu przez 1 s widać własny punkt na odcinku (kolor gracza), prawdziwy środek (pierścień), odcinek błędu między nimi
  i błąd w %; kolor według celności: do 2% zielony z „Idealnie!”, do 8% zwykły, dalej ostrzegawczy.
  Potem sama wskakuje następna runda; po dziesiątej wynik idzie na serwer.
- Ekran końcowy: jedna tabela, rundy 1-10 w kolumnach, gracze w wierszach (kolejność rankingu). Liczby w kolorach celności,
  najlepszy w rundzie (bez remisu) ma tło w kolorze gracza.

### Stój! (`stoj`)
- 30 s. Jedno duże pole zapala się na zielono (dotknij) albo czerwono (nie wolno), potem na chwilę gaśnie i przychodzi następny bodziec.
- Tempo rośnie: odstęp między bodźcami maleje liniowo z czasem partii od 1000 ms do 500 ms. Bodziec widać przez 0,6 odstępu,
  ale dotknięcie liczy się aż do pojawienia się następnego. Harmonogram (`SCHEDULE`) wynika ze stałych, jest ten sam w każdej partii.
- Losowe jest tylko to, które bodźce są czerwone: dokładnie co trzeci (`round(N / 3)`), w kolejności potasowanej na serwerze.
- Jedno dotknięcie na bodziec. Zielony = trafienie, czerwony = błąd. Dotknięcie szybciej niż 100 ms od pojawienia się to zgadywanie:
  ekran je ignoruje. Przepuszczony zielony nic nie kosztuje (brak punktu).
- Jeden ruch z `taps`: czas reakcji na każdy bodziec w ms (int) albo `null`, gdy nie było dotknięcia. Wynik liczy serwer:
  `times` (reakcje na zielone) i `errors` (dotknięte czerwone).
- Wynik = trafienia − 2 × błędy, nie mniej niż 0, więcej lepiej. Przy remisie niższa średnia reakcji; dwa wyniki bez trafień to remis,
  a zero punktów z trafieniami jest wyżej niż zero bez trafień.
- Kara jest punktowa, nie blokadą 1 s jak w innych grach na czas: blokada zjadałaby kolejne bodźce, a −2 przy 1/3 czerwonych
  i tak zeruje klepanie na oślep (N − 3 × czerwone ≈ 0).
- Walidacja: najwyżej tyle czasów, ile bodźców, każdy od 100 ms do odstępu swojego bodźca. Pusta lista = limit czasu = 0 pkt.
- Ekran: zielony z napisem „Dotknij”, czerwony z dłonią i „Stój!” (kolor nie jest jedynym sygnałem), bez przejścia. Trafienie gasi pole,
  błąd to czerwony błysk z potrząśnięciem i wibracja 60. Ekran końcowy: tabela z punktami, średnim czasem i błędami (wspólna z `Quiz.tsx`).

### Śledzenie (`sledzenie`)
- Do 20 rund. W każdej 8 identycznych kulek na kwadratowym polu, 3 z nich (cele) są podświetlone przez 1,5 s, potem wszystkie
  ruszają się przez 5 s i stają; gracz wskazuje 3 kulki.
- Pierwsza pomyłka kończy partię (jak w Sekwencji): runda jest zaliczona tylko z kompletem 3 celów.
- Tempo rośnie: prędkość kulek to 0,3 boku pola na sekundę w pierwszej rundzie i o 0,06 więcej w każdej następnej (w dwudziestej ok. 1,45).
  Wszystkie kulki w rundzie mają tę samą prędkość.
- Ruch: każda kulka leci po prostej i odbija się od krawędzi pola, kulki przenikają przez siebie (mijanie się jest tym trudnym momentem).
  Pozycja to wzór od czasu (`position(ball, round, t)`, fala trójkątna na każdej osi), bez symulacji krokowej: ta sama funkcja
  na serwerze i w ekranie, więc u wszystkich ruch jest identyczny.
- Serwer losuje dla każdej rundy 8 kulek: start (`x`, `y`) i kierunek (`angle`). Celami są kulki o indeksach 0-2 (pozycje są losowe,
  więc osobne losowanie indeksów nic by nie dało). Na starcie i po zatrzymaniu kulki się nie nakładają
  (promień 0,06 boku, odstęp środków co najmniej 0,14), w trakcie ruchu mogą.
- Jeden ruch z `picks`: wskazania z kolejnych rozegranych rund, w każdej dokładnie 3 różne indeksy kulek (int 0-7), kolejność bez znaczenia.
  Wynik liczy serwer: `rounds` = liczba rund od początku z kompletem celów, `hits` = trafione cele (0-2) w pierwszej rundzie z błędem.
  Wszystko po pierwszym błędzie jest ignorowane.
- Ranking: więcej rund wyżej, przy równych więcej `hits` („prawie się udało” wygrywa z pudłem); równe oba to remis.
- Walidacja: najwyżej 20 rund, każda to 3 różne liczby całkowite 0-7. Pusta lista = limit czasu = 0 rund i 0 trafionych.
- Bez ruchu `progress`: rywale nie widzą numeru rundy (jak w Sekwencji).
- Ekran: kwadratowy kafel z kulkami; cele podświetlone kolorem gracza, w ruchu wszystkie jednakowe. Po zatrzymaniu dotknięcie zaznacza kulkę
  (ponowne odznacza), trzecie zatwierdza. Potem przez 1 s widać prawdziwe cele; pomyłka to wibracja 60.
  Ruch kulek jest treścią gry, więc działa także przy `prefers-reduced-motion`.

### Trzy kubki (`kubki`)
- Do 20 rund (`ROUNDS`). W każdej trzy identyczne kubki w rzędzie (miejsca 0-2 od lewej), pod jednym jest kulka: kubek z kulką
  jest uniesiony przez 1 s (`SHOW_MS`), opada, potem kubki zamieniają się miejscami parami, a na końcu gracz dotyka kubka.
- Pierwsza pomyłka kończy partię (jak w Śledzeniu i Sekwencji).
- Tempo rośnie (runda `r` od 0): liczba zamian `swapCount(r)` = 4 + r (od 4 do 23), czas jednej zamiany
  `swapMs(r)` = max(150, 500 − 25·r) ms (150 ms od piętnastej rundy). Tasowanie trwa najwyżej 3,6 s.
- Serwer losuje dla każdej rundy miejsce kulki `ball` (0-2) i listę zamian `swaps`: pary miejsc `[a, b]`, a ≠ b.
  Ta sama para nie pada dwa razy z rzędu, także odwrócona (druga zamiana cofałaby pierwszą).
  Gdzie kulka jest po tasowaniu, liczy `ballAt(round)`: ta sama funkcja na serwerze i w ekranie.
- Jeden ruch z `picks`: wskazane miejsce (int 0-2) w kolejnych rozegranych rundach.
  Wynik liczy serwer: liczba rund od początku, w których `picks[i] === ballAt(rounds[i])`. Wszystko po pierwszym błędzie jest ignorowane.
- Ranking: więcej rund wyżej, bez drugiego kryterium (przy trzech kubkach nie ma „prawie”); równe to remis bez zwycięzcy.
- Walidacja: najwyżej 20 wskazań, każde to liczba całkowita 0-2. Pusta lista = limit czasu = 0 rund.
- Bez ruchu `progress`: rywale nie widzą numeru rundy (jak w Śledzeniu).
- Ekran: trzy kubki (trapezy) na kaflu, kulka w kolorze gracza. W zamianie jeden kubek idzie łukiem górą, drugi dołem, żeby się nie przenikały.
  Dotknięcie kafla wybiera najbliższy kubek; potem przez 1 s widać, gdzie była kulka, pomyłka to wibracja 60.
  Ruch kubków jest treścią gry, więc działa także przy `prefers-reduced-motion`.
- Ekran końcowy: tabela wyników z liczbą rund („7 rund”).

### Wieża (`wieza`)
- Do 30 pięter. Pole ma szerokość 1. Na dole leży podstawa o szerokości 0,4 na środku pola; każdy następny klocek ma szerokość
  poprzedniego i jeździ w poziomie od krawędzi do krawędzi pola, a gracz zatrzymuje go dotknięciem.
- Odchyłka od poprzedniego klocka najwyżej 0,02 (`SNAP`) to trafienie idealne: klocek wyrównuje się i zachowuje szerokość.
  Większa odchyłka: zostaje tylko część wspólna z poprzednim klockiem, reszta jest ucinana.
- Część wspólna węższa niż 0,02 (`MIN_WIDTH`) to pudło i koniec partii. Pierwszy klocek zawsze trafia (przy podstawie 0,4 nie da się
  odjechać dalej niż o 0,3), pudło jest możliwe dopiero na zwężonej wieży.
- Tempo rośnie: prędkość klocka to 0,5 pola na sekundę na pierwszym piętrze i o 0,03 więcej na każdym następnym.
- Serwer losuje dla każdego piętra stronę, z której startuje klocek (`sides`, true = z lewej). Pozycja to wzór od czasu
  (`left(fromLeft, level, width, t)`, fala trójkątna lewej krawędzi w `[0, 1 − width]`), bez symulacji krokowej: ta sama funkcja
  na serwerze i w ekranie.
- Niedotknięty klocek spada sam po 5 s (`MAX_STOP_MS`) tam, gdzie akurat jest.
- Jeden ruch ze `stops`: czasy zatrzymania kolejnych klocków w ms od ich startu (int 0-5000). Wynik liczy serwer (`build`):
  `height` = liczba położonych klocków, `width` = szerokość ostatniego położonego (przy 0 klocków szerokość podstawy).
  Czasy po pudle są ignorowane.
- Ranking: wyższa wieża wyżej, przy równych szerszy ostatni klocek; równe oba to remis.
- Walidacja: najwyżej 30 czasów, każdy całkowity 0-5000. Pusta lista = limit czasu = 0 pięter.
- Ruch `progress` (`height` = wysokość wieży, int 1-29) po każdym położonym klocku poza trzydziestym: tylko do podglądu u rywali
  (pierścień na kropkach graczy, po ich dotknięciu pasek i `10/30`), nie wpływa na wynik. Po oddaniu wyniku pierścień jest pełny, a pigułka pokazuje wysokość z wyniku.
  Limit przez `turn()` ze stałym kluczem: ruch `progress` nie odnawia 180 s, nawet gdy gra już tylko jedna osoba.
- Ekran: kwadratowy kafel, widać 8 górnych pięter, klocki w kolorze gracza. Dotknięcie kafla zatrzymuje klocek. Trafienie idealne
  błyska na zielono, ucięty kawałek robi się czerwony i spada. Nad wieżą na chwilę pojawia się ocena: „Idealnie!”, procent klocka,
  który został, albo „Pudło”. Statystyki: wysokość, szerokość i seria (trafienia idealne z rzędu). Pod kaflem jedno zdanie podpowiedzi.
  Pudło to wibracja 60 i po 1 s wynik.
  Ruch klocka jest treścią gry, więc działa także przy `prefers-reduced-motion`.

### Rytm (`rytm`)
- Po „Start” 1 s ciszy, potem metronom gra 8 uderzeń (`BEATS`, 2 takty po 4) i cichnie, a gracz stuka dalej w tym samym tempie
  przez 10 s (`TAP_MS`), licząc od ostatniego uderzenia metronomu.
- Tempo losuje serwer: 70-130 BPM co 5 (13 wartości), to samo dla wszystkich. W stanie jest `interval = round(60000 / BPM)` ms (462-857)
  i `nonce` (rewanż może wylosować to samo tempo).
- Jeden ruch z `taps`: czasy stuknięć w ms (int) od ostatniego uderzenia metronomu. Stuknięcia przed nim i po 10 s ekran ignoruje.
- Wynik liczy serwer (`deviation`): odstępy to różnice kolejnych czasów, pierwszy liczy się od ostatniego uderzenia metronomu.
  Błąd odstępu = różnica względem `interval`, ucięta do `interval`. Oczekiwana liczba odstępów to `floor(10 000 / interval) − 1`
  (`expected`; jedno uderzenie zapasu, żeby grający odrobinę za wolno nie tracił ostatniego stuknięcia o włos); każdy brakujący
  liczy się jak najgorszy, czyli `interval`. Wynik = suma błędów podzielona przez większą z liczb: oczekiwaną i faktyczną liczbę odstępów,
  zaokrąglona do ms.
- Odchyłka liczy się z odstępów, nie od idealnej siatki metronomu: przy siatce mały błąd tempa kumuluje się i po rozjechaniu
  o pół uderzenia wynik jest przypadkowy.
- Skutki: pominięte uderzenie to jeden odstęp z pełnym błędem, klepanie na oślep daje wynik bliski `interval`,
  a dwa idealne stuknięcia i koniec nie wygrywają.
- Wynik = średnia odchyłka w ms (int, od 0 do `interval`), mniej lepiej; równe to remis.
- Walidacja: najwyżej 60 czasów (`MAX_TAPS`), każdy całkowity 1-10 000, ściśle rosnące. Pusta lista = limit czasu = wynik równy `interval`.
- Grający nie widzi limitu tury po starcie (jak w Stoperze: pasek tykający co sekundę podawałby tempo 60 BPM); ekran stukania
  nie ma licznika sekund, tylko płynny pasek.
- Jedyna gra z dźwiękiem: metronom klika (WebAudio), błyska polem (pierwsze uderzenie taktu mocniej) i wibruje 30. Bez gestu
  (start sam po 15 s instrukcji) albo przy wyciszonym telefonie zostaje błysk i wibracja, więc gra jest grywalna z samym błyskiem.
- Ekran: całe pole reaguje na dotyk i błyska kolorem gracza. Ekran końcowy: kafel z własnym tempem w BPM obok celu i tabela z odchyłkami.

### Inny element (`inny`)
Wynik, walidacja, ranking i ekran końcowy jak w Kolorze liter (`quiz.ts`, `Quiz.tsx`); inne jest tylko to, co widać na planszy.
- 30 s. Siatka identycznych symboli, jeden się różni; dotykasz tego jednego.
- Serwer losuje 200 plansz, te same dla wszystkich. Plansza `{ cols, rows, odd, base, other }`: wszystkie pola mają symbol `base`,
  pole `odd` ma `other`. Symbol to `{ sides, angle, hue, light, size }` (wielokąt foremny, obrót w stopniach, barwa i jasność HSL, rozmiar w % pola symbolu).
- Siatka rośnie z każdym trafieniem na przemian o kolumnę i wiersz: 2×2, 3×2, 3×3, 4×3 … 6×6 na planszy 8 i dalej bez zmian
  (`MAX_SIDE = 6`: przy 360 px kafel ma wtedy 48 px).
- `other` różni się od `base` dokładnie jednym polem. Rodzaje różnicy idą potasowanymi kompletami, żeby każda partia miała ich po równo
  (kształt jest łatwiejszy niż odcień): plansze 0-3 i 4-7 mają każdy z czterech rodzajów raz, dalej każda kolejna trójka plansz
  ma raz obrót, odcień i rozmiar. Różnica maleje liniowo
  od planszy 0 do planszy 16 (`HARD`), dalej jest stała:
  - **obrót**: trójkąt, `angle` ± od 40° do 8°,
  - **odcień**: `light` ± od 20 do 5 punktów (jasność, nie barwa, więc działa też dla daltonistów),
  - **rozmiar**: `size` ± od 20 do 10 punktów przy bazowym 80,
  - **kształt**: `sides` n kontra n ± 1, n = `3 + floor(i / 3)`; nigdy mniej niż 3 boki. Tylko na planszach 0-7 (`SHAPE_BOARDS = 8`,
    dopóki siatka rośnie): inna liczba boków rzuca się w oczy nawet na 6×6, więc dalej zostają same subtelne różnice.
  Barwa bazowa, kąt bazowy, znak różnicy i pole `odd` są losowe.
- Pomyłka blokuje na 1 s i plansza zostaje (numer planszy = liczba trafień). Czas trafienia liczy się od pierwszego pokazania planszy;
  zachowujemy cały czas szukania, także ponad 5 s.
- Limit czasu: zero trafień.

### Obrót (`obrot`)
Przebieg, walidacja i ekran końcowy jak w Kolorze liter (`quiz.ts`, `Quiz.tsx`); inne są plansze i punktacja.
- 30 s. Dwie figury z klocków obok siebie i dwie odpowiedzi: „Ta sama” (druga figura to pierwsza po obrocie) albo „Lustro”
  (druga to lustrzane odbicie pierwszej, też obrócone).
- Serwer losuje 200 par, te same dla wszystkich. Para `{ a, b, mirror }`: `a` i `b` to listy pól `[x, y]` dosunięte do rogu (0, 0);
  ekran niczego nie liczy, tylko rysuje.
- Figura `a` to losowo rosnące poliomino (każdy klocek styka się bokiem z innym) z `min(4 + floor(i / 3), 7)` klocków:
  4 w parach 0-2, potem o jeden więcej co 3 pary, od pary 9 zawsze 7 (`MIN_CELLS`, `MAX_CELLS`).
- Figura jest zawsze chiralna (jej odbicie nie jest żadnym z jej czterech obrotów), inaczej pytanie nie miałoby odpowiedzi;
  niechiralna jest losowana od nowa.
- `b` to `a` (albo odbicie `a`, gdy `mirror`) obrócone o losowe 90, 180 albo 270°, zawsze tak, żeby wyglądało inaczej niż przed obrotem
  (figura, która po 180° wygląda tak samo, dostaje 90 albo 270°). `mirror` losowane po równo.
- Pomyłka blokuje na 1 s i zabiera punkt, potem przychodzi następna para (druga próba przy dwóch odpowiedziach byłaby darmowa).
  Sama kara punktowa nie wystarcza: klepanie na oślep daje średnio 0, ale z dużym rozrzutem, blokada go zmniejsza.
- Wynik = trafienia − pomyłki, nie mniej niż 0, więcej lepiej. Przy remisie niższa średnia czasu trafień; dwa wyniki bez trafień to remis.
  Liczy go klient jak w Kolorze liter (serwer zna `mirror`, więc mógłby liczyć sam z listy odpowiedzi, gdyby ktoś zaczął oszukiwać).
- Limit czasu: zero trafień i zero pomyłek.
- Ekran końcowy: tabela z punktami, średnim czasem i błędami (jak w Stój!).

### Literówka (`literowka`)
Przebieg, walidacja, punktacja i ekran końcowy jak w Obrocie (`quiz.ts`, `Quiz.tsx`); inne są plansze.
- 30 s. Plansza to 4 słowa w siatce 2×2 (`WORDS`): trzy napisane poprawnie, jedno z błędem ortograficznym. Gracz dotyka błędnego.
- Błędy są tylko trzech rodzajów: ó/u, rz/ż, ch/h („żeka”, „chałas”). Lista par `[poprawne, błędne]` jest w `literowka-dane.ts` (`PAIRS`):
  co najmniej 100 par, małe litery, 4-12 liter. Błędna forma nie może być prawdziwym słowem (odpadają pary typu morze/może, lód/lud).
- Serwer losuje 200 plansz, te same dla wszystkich: tasuje listę par i rozdaje po 4 na planszę, a po wyczerpaniu listy tasuje od nowa,
  więc w pierwszych 45 planszach (na tyle starcza lista 181 par) żadne słowo się nie powtarza. Jedna z czterech par pokazuje formę błędną, pozostałe poprawną.
  Plansza `{ words, wrong }`: `wrong` to pozycja błędnego słowa (0-3), losowana po równo.
- Pomyłka blokuje na 1 s i zabiera punkt, potem przychodzi następna plansza (bez drugiej próby i bez pokazywania poprawnej pisowni).
- Wynik = trafienia − pomyłki, nie mniej niż 0, więcej lepiej. Przy remisie niższa średnia czasu trafień; dwa wyniki bez trafień to remis.
  Liczy go klient jak w Obrocie (serwer zna `wrong`, więc mógłby liczyć sam z listy odpowiedzi, gdyby ktoś zaczął oszukiwać).
- Limit czasu: zero trafień i zero pomyłek.
- Ekran: cztery kafle ze słowami, pod nimi „Które słowo ma błąd?”; na końcu tabela z punktami, średnim czasem i błędami (jak w Obrocie).

### Mapa (`mapa`)
- 10 rund, w każdej nazwa miasta; gracz wskazuje je na konturze Polski (sam kontur, bez rzek i województw).
- Serwer losuje 10 różnych miast z puli 62 (`CITIES` w `mapa-dane.ts`), te same i w tej samej kolejności dla wszystkich.
  Pula to miasta od ok. 55 tys. mieszkańców; z konurbacji śląskiej tylko Katowice i Gliwice, bez miast przyklejonych do większych
  (Sosnowiec, Pabianice, Pruszków), bo różnica kilku km byłaby zgadywaniem.
- Pole gry to prostokąt geograficzny `BOUNDS` (13,9-24,3°E, 48,9-54,95°N), odwzorowanie liniowe: `x` to długość, `y` szerokość (północ u góry).
  Kafel ma proporcje `ASPECT` (szerokość pola ściśnięta `cos 52°`), więc Polska wygląda jak na zwykłej mapie; zniekształcenie
  na północy i południu do ok. 6% dotyczy tylko rysunku, nie wyniku.
- Jeden ruch z 10 punktami (`x`, `y` w ułamkach pola). Wynik liczy serwer, więc nie zależy od rozmiaru telefonu.
- Błąd rundy = odległość po ortodromie (haversine, R = 6371 km) od wskazanego punktu do miasta, zaokrąglona do pełnych km.
  Wynik = suma z 10 rund w km (int), mniej lepiej.
- Punkt poza konturem Polski jest ważną odpowiedzią (liczy się sama odległość). Punkt poza polem (`x` albo `y` poza 0-1) odrzuca cały ruch.
- Pusta lista = limit czasu = 10 × 1000 km (`MAX_ERROR`, więcej niż przekątna pola, czyli niż najgorsza uczciwa runda).
- Limit 180 s na całą partię, bez limitu na rundę.
- Kontur (`OUTLINE`) pochodzi z Natural Earth 1:50m (domena publiczna), uproszczony do 126 punktów (dokładność ok. 2 km).
- Ekran: nazwa miasta nad mapą, dotknięcie stawia znacznik w kolorze gracza, kolejne dotknięcie albo przeciągnięcie go przenosi,
  „Zatwierdź” kończy rundę. Potem przez 1,5 s widać prawdziwe miejsce (pierścień), linię do znacznika i odległość w km:
  do 20 km na zielono z „Idealnie!”, ponad 150 km kolorem ostrzeżenia.
- Ekran końcowy: suma każdego gracza i tabela rund (miasto, km każdego gracza, najlepszy w rundzie na tle w swoim kolorze).

### Przytrzymaj (`przytrzymaj`)
- 5 rund (`ROUNDS`). W każdej po 1 s przerwy pole świeci się przez czas celu i gaśnie, potem gracz przykłada palec i trzyma go tak długo,
  jak świeciło pole. Po puszczeniu przez 1,5 s widać czas trzymania, cel i odchyłkę ze znakiem.
- Cele (`targets`) losuje serwer: 5 czasów w pełnych ms, każdy 1000-5000 (`MIN_MS`, `MAX_MS`), te same dla wszystkich.
  Suma celów to zawsze 15 000 ms (`TOTAL_MS`, losowanie do skutku przez `withSum`): odchyłka rośnie z długością celu, więc każda partia jest równie trudna.
  Bez `nonce`: pięć losowych ms praktycznie się nie powtarza, więc rewanż montuje ekran od nowa po samych celach.
- Jeden ruch z `holds`: czasy trzymania w ms (int) w kolejnych rundach, mierzone na kliencie między dotknięciem a puszczeniem.
- Wynik liczy serwer: odchyłka rundy (`deviation`) = |czas trzymania − cel|, ucięta do celu; wynik = suma z 5 rund w ms (int), mniej lepiej,
  równe to remis. Ucięcie sprawia, że puszczenie od razu i trzymanie bez końca kosztują tyle samo (jak w Stoperze).
- Walidacja: lista pusta albo dokładnie 5 czasów, każdy całkowity od 0 do 10 000 (`2 × MAX_MS`). Pusta lista = limit czasu = suma celów,
  czyli najgorszy możliwy wynik.
- Ekran sam kończy trzymanie po dwukrotności celu (dalej odchyłka i tak jest ucięta). Grający nie widzi limitu tury ani żadnego licznika
  sekund (podawałyby czas), jak w Stoperze i Rytmie.
- Stan trzyma też `holds` każdego gracza: ekran końcowy to jedna tabela (bez osobnej listy wyników): w wierszu gracza suma, pod nim odchyłki rund ze znakiem, nad nimi cele; najlepszy w rundzie wyróżniony.

### Balon (`balon`)
- 10 balonów po kolei (`BALLOONS`). Każde stuknięcie pompuje balon i dodaje do niego 1 punkt.
- Serwer losuje dla każdego balonu wytrzymałość (`limits`, liczba całkowita 1-30; `MIN_SAFE`, `MAX_SAFE`), tę samą
  dla wszystkich: tyle stuknięć balon wytrzymuje, następne go rozrywa. Pierwsze stuknięcie jest zawsze bezpieczne.
  Suma wytrzymałości to zawsze 155 (`TOTAL`, losowanie do skutku przez `withSum`), więc w każdej partii jest tyle samo do zgarnięcia.
- „Zgarnij” dopisuje punkty balonu do sumy i daje następny balon. Pęknięcie daje za ten balon 0 (zgarnięte wcześniej punkty zostają).
  Zgarnąć można też pusty balon (0 stuknięć, 0 punktów, bez pęknięcia).
- Jeden ruch z `pumps`: liczba stuknięć w każdym z 10 balonów (int 0-31; 31 to zawsze pęknięcie). Wynik liczy serwer (`score`):
  balon z `pumps[i] > limits[i]` jest pęknięty i daje 0, inaczej daje `pumps[i]`; `score` = suma (0-155), `popped` = liczba pękniętych.
- Ranking: więcej punktów wyżej, przy równych mniej pękniętych balonów; równe oba to remis.
- Walidacja: dokładnie 10 liczb całkowitych 0-31 albo pusta lista. Pusta lista = limit czasu = najgorszy wynik: 0 punktów i 10 pękniętych.
- Ruch `progress` (`done` = liczba zakończonych balonów, int 1-9) po każdym balonie poza ostatnim: tylko do podglądu u rywali
  (pasek „3/10” w pigułce gracza), nie odnawia limitu (`turn` ma stały klucz), może spaść po odświeżeniu strony.
  Punktów rywali w trakcie nie widać: zdradzałyby, ile balon wytrzymuje.
- Ekran: kwadratowy kafel z balonem w kolorze gracza, dotknięcie kafla pompuje. Rozmiar balonu zależy tylko od liczby stuknięć,
  nie od wytrzymałości. Pod kaflem „Zgarnij 12 pkt”. Po zgarnięciu „+12”, po pęknięciu „Pękł!” i wibracja 60, przez 0,8 s.
  Na końcu tabela: ile każdy balon wytrzymywał i ile stuknięć zrobił każdy gracz (pęknięty: przekreślona czerwona liczba, pusty: kreska).

### W pamięci (`w-pamieci`)
- Do 12 rund (`ROUNDS`). W każdej na ekranie pojawia się liczba startowa, a po niej kolejne działania („+7”, „−3”, „×2”), każda pozycja
  przez 1,5 s (`SHOW_MS`); wyniku pośredniego nie widać. Na końcu gracz wpisuje, ile wyszło.
- Ciąg się wydłuża: runda `i` (od 0) ma `i + 2` działań (`START_OPS`), ostatnia 13. Każda runda to nowy ciąg, nie przedłużenie poprzedniego.
- Pierwsza zła odpowiedź kończy partię (jak w Sekwencji i Śledzeniu).
- Serwer losuje `rounds` (`{ start, ops: { op, n }[] }`), te same dla wszystkich: start 1-9, działanie to +1..9, −1..9, ×2 albo ×3,
  losowane tak, żeby wartość po każdym kroku była w 1-99 (`MAX_VALUE`). Działania liczy się po kolei od lewej (`value(round)`).
- Jeden ruch z `answers`: odpowiedzi w kolejnych rozegranych rundach (int 0-999, `MAX_ANSWER`). Wynik liczy serwer:
  `rounds` = liczba poprawnych odpowiedzi od początku, `diff` = odchyłka odpowiedzi od wyniku w pierwszej rundzie niezaliczonej
  (brak odpowiedzi w tej rundzie = 999, komplet 12 rund = 0). Wszystko po pierwszym błędzie jest ignorowane.
- Ranking: więcej rund wyżej, przy równych mniejsza odchyłka („prawie dobrze” wygrywa ze strzałem na oślep); równe oba to remis.
- Walidacja: najwyżej 12 liczb całkowitych 0-999. Pusta lista = limit czasu = 0 rund i odchyłka 999.
- Bez ruchu `progress`: rywale nie widzą numeru rundy (jak w Śledzeniu).
- Ekran: kwadratowy kafel, pozycje ciągu wskakują jedna po drugiej (dwa takie same działania z rzędu widać jako dwa), nad nim numer rundy
  i działania. Po dobrej odpowiedzi od razu następna runda; po złej wibracja 60 i cały ciąg z prawdziwym wynikiem.
  Pomyłka albo komplet wysyła wynik natychmiast, bez dodatkowego potwierdzenia. Odsłona po pomyłce pozostaje
  do obejrzenia również po odpowiedzi serwera; „Wyniki” tylko ją zamyka i nie wysyła kolejnego ruchu.
  Odświeżenie po odsłonie pokazuje zapisany wynik. Odpowiedzi, punktacja, tie i limit pozostają bez zmian.

### Dziesiątki (`dziesiatki`)
Wynik, walidacja, ranking i tabela końcowa jak w Kolorze liter (`quiz.ts`, `Results` z `Quiz.tsx`); inny jest przebieg planszy.
- 30 s. Siatka 4×4 (`SIDE`) z liczbami 1-9. Gracz dotyka dwóch pól, które w sumie dają 10 (`TARGET`); pola nie muszą sąsiadować.
  Trafiona para znika, a w jej miejsce wchodzą dwie nowe liczby.
- Serwer losuje to samo dla wszystkich: planszę startową `board` (16 liczb) i dostawy `refills` (400 liczb w zapętlanej puli dostaw).
  Para nr `n` (liczona od 0) dostaje `refills[2n]` w pierwszym dotkniętym polu i `refills[2n + 1]` w drugim.
  Dwie liczby jednej dostawy nigdy nie dają razem 10 (inaczej opłacałoby się klepać w te same dwa pola).
- Na planszy zawsze jest co najmniej jedna para. Jeśli po dostawie żadnej nie ma, drugie nowe pole dostaje `10 − wartość` pierwszego pola
  spoza tej dwójki. Tak samo poprawiana jest plansza startowa (pole 1 = `10 − pole 0`). Liczy to `take` (ta sama funkcja na ekranie i w testach),
  bo plansza gracza zależy od tego, które pary wybrał.
- Pierwsze dotknięcie zaznacza pole, dotknięcie zaznaczonego pola je odznacza (bez kary). Drugie pole, które nie daje 10, to pomyłka:
  blokada 1 s, zaznaczenie znika, plansza zostaje.
- Czas pary liczy się od poprzedniej pary (albo startu) do drugiego dotknięcia; zachowujemy cały czas szukania, także ponad 5 s.
- Wynik liczy klient (jak w Kolorze liter), serwer odrzuca tylko nierealne wartości. Limit czasu: zero par.

### Tort (`tort`)
- 5 tortów (`CAKES`), każdy okrągły; gracz dzieli go cięciami od środka do brzegu na podaną liczbę równych kawałków.
- Liczby kawałków to potasowane 3, 4, 5, 6, 7 (każda dokładnie raz w partii). Każdy tort ma jedno gotowe cięcie pod losowym kątem
  (`first`, int 0-359°), to samo dla wszystkich; bez niego obrót całości byłby dowolny i nie byłoby czego odsłaniać jako ideału.
- Gracz stawia pozostałe `pieces − 1` cięć; każde to kąt w stopniach (liczba, 0 ≤ kąt < 360, niekoniecznie całkowita).
- Jeden ruch z 5 listami kątów, i-ta ma dokładnie `pieces − 1` pozycji. Wynik liczy serwer.
- Błąd tortu (`error`): kawałki to odstępy między kolejnymi cięciami po okręgu (razem z gotowym); błąd = suma |kawałek − 360°/n| / 2,
  w procentach całego tortu. Czyli tyle tortu trzeba by przełożyć między talerzami, żeby każdy miał równo.
  Kolejność cięć na liście nie ma znaczenia. Dwa cięcia w tym samym miejscu to kawałek o zerowej szerokości (dozwolone, po prostu drogie).
- Najgorszy uczciwy tort to wszystkie cięcia na gotowym: (n − 1)/n tortu, przy 7 kawałkach 85,7%.
- Wynik = suma błędów z 5 tortów, zapisana w dziesiątych częściach procenta (int), mniej lepiej.
- Pusta lista = limit czasu = 5 × 100% (`MAX_ERROR`, więcej niż najgorsza uczciwa partia).
- Bez ruchu `progress` (5 krótkich rund).
- Ekran: kwadratowy kafel z tortem, nad nim liczba kawałków. Gotowe cięcie jest w kolorze tekstu, własne w kolorze gracza.
  Dotknięcie tortu stawia cięcie pod kątem palca (dopóki brakuje) i można je od razu przeciągnąć; dotknięcie do 10° (`GRAB`) od własnego
  cięcia łapie je i przesuwa. Gotowego cięcia nie da się ruszyć. Po komplecie cięć przycisk „Pokrój” (kolor gracza).
  Potem przez 1,5 s widać idealne cięcia (przerywane, liczone od gotowego) i błąd w %; kolor według celności: do 2% zielony z „Idealnie!”,
  do 8% zwykły, dalej ostrzegawczy. Potem sam wskakuje następny tort; po piątym wynik idzie na serwer.
- Ekran końcowy: jedna tabela, torty 1-5 w kolumnach (z liczbą kawałków), gracze w wierszach. Najlepszy w rundzie (bez remisu) ma tło w kolorze gracza.

### Zakupy (`zakupy`)
- Jedna runda. Przez 10 s (`SHOW_MS`) widać listę zakupów: 10 przedmiotów (`LIST`, emoji). Potem lista znika i pojawia się półka
  z 20 przedmiotami (`SHELF`): 10 z listy i 10 innych, wymieszane. Gracz zaznacza te, które były na liście, i zatwierdza „Gotowe”.
- Serwer losuje to samo dla wszystkich: `items` to 20 różnych przedmiotów z puli `ITEMS` w kolejności na półce, `listed` to 10 różnych
  indeksów półki w kolejności na liście (inna niż na półce, żeby miejsce niczego nie podpowiadało). Przedmioty spoza listy są losowe
  z tej samej puli, bez dobierania podobnych.
- Zaznaczyć można dowolnie wiele przedmiotów, od 0 do 20. Pustą półkę też można zatwierdzić (0 punktów z prawdziwym czasem).
- Jeden ruch z `picked` (zaznaczone indeksy półki, różne, int 0-19, kolejność bez znaczenia) i `ms` (czas od pokazania półki do dotknięcia „Gotowe”,
  int 0-50 000, `MAX_MS`). Wynik liczy serwer (`score`): `hits` = zaznaczone z listy, `wrong` = zaznaczone spoza listy,
  `score` = `hits − wrong`, nie mniej niż 0 (dolna granica jak w Obrocie), czyli 0-10. Strzał w ciemno może więc kosztować punkt,
  a zaznaczenie całej półki daje 0.
- Ranking: więcej punktów wyżej, przy równych krótszy czas zaznaczania (`ms`); równe oba to remis.
- Limit czasu = pusta półka z `ms` = 50 000: 0 punktów z najgorszym czasem (przegrywa z uczciwie zatwierdzoną pustą półką).
- Limit tury serwera: 80 s. Po 50 s wybierania (`MAX_MS`) klient automatycznie oddaje aktualne zaznaczenia
  tym samym ruchem co „Gotowe”, z `ms` = 50 000; nie oddaje pustej półki zamiast wybranych produktów.
  Serwerowy timeout jest zabezpieczeniem dla klienta, który nie dostarczył żadnego wyniku, i nadal wpisuje pustą półkę.
- Ręczne „Gotowe” kończy pomiar przy `pointerdown`, niezależnie od chwili puszczenia palca.
  Klawiatura działa przez `click` z `detail=0`. Wspólna blokada wysyłki pozwala wysłać wynik tylko raz,
  także przy zbiegu dotknięcia, click i automatycznego oddania.
- Model limitu: `T = 10 s` pokazu + `50 s` wyboru + `3 s` na dostarczenie wyniku = `63 s`.
  Budżet sieci to założenie, nie pomiar. Limit 80 s daje 17 s zapasu (około 27%), spełnia co najmniej 20% i 10 s.
- Dotychczasowe rekordy i detail pozostają bez przeliczania lub resetu. Historia obejmuje dotychczasowy pomiar click
  i nowy pointerdown; pełna porównywalność dawnych czasów nie jest gwarantowana.
- Bez ruchu `progress` (jedna runda).
- Ekran: lista w siatce 5×2 z paskiem upływającego czasu, potem półka 5×4; dotknięcie kafla zaznacza i odznacza (obwódka w kolorze gracza),
  pod spodem „Gotowe”. W pasku statystyk liczba zaznaczonych i czas.
- Ekran końcowy: wyniki („8 pkt (9 traf., 1 błąd) · 12,3 s”) i jedna półka z odpowiedzią: przedmioty z listy podświetlone,
  przy każdym kropki w kolorach graczy, którzy go zaznaczyli.

### Za zasłoną (`zaslona`)
- 8 rund (`ROUNDS`). W każdej po 1 s przerwy kulka rusza z lewej i toczy się w prawo ze stałą prędkością, po chwili znika za zasłoną.
  Gracz dotyka pola w chwili, gdy kulka powinna dotrzeć do mety (kreska na zasłonie). Potem przez 1,5 s zasłona jest przezroczysta:
  widać, gdzie kulka naprawdę była w chwili dotknięcia, i odchyłkę ze znakiem.
- Rundy (`rounds`) losuje serwer, te same dla wszystkich. Każda to dwa niezależne czasy w pełnych ms: `visible` 800-2000
  (`MIN_VISIBLE`, `MAX_VISIBLE`: tyle kulkę widać) i `hidden` 1000-4000 (`MIN_HIDDEN`, `MAX_HIDDEN`: tyle jedzie za zasłoną do mety).
  Suma `hidden` to zawsze 20 000 ms (`TOTAL_HIDDEN`, losowanie do skutku przez `withSum`): odchyłka rośnie z czasem za zasłoną,
  więc stała suma wyrównuje partie. `visible` nie wchodzi do wyniku i jest losowane swobodnie.
  Z obu czasów wynika i prędkość kulki, i szerokość zasłony (`hidden / (visible + hidden)` toru), więc obie zmieniają się co rundę.
  Bez `nonce`: 16 losowych ms praktycznie się nie powtarza, więc rewanż montuje ekran od nowa po samych rundach.
- Jeden ruch z `taps`: czasy w ms (int) od zniknięcia kulki do dotknięcia w kolejnych rundach, mierzone na kliencie.
- Wynik liczy serwer: odchyłka rundy (`deviation`) = |czas dotknięcia − `hidden`|, ucięta do `hidden`; wynik = suma z 8 rund w ms (int),
  mniej lepiej, równe to remis. Ucięcie sprawia, że dotknięcie od razu po zniknięciu i brak dotknięcia kosztują tyle samo (jak w Przytrzymaj).
  Czas `visible` nie wchodzi do wyniku.
- Walidacja: lista pusta albo dokładnie 8 czasów, każdy całkowity od 0 do 8000 (`2 × MAX_HIDDEN`). Pusta lista = limit czasu = suma `hidden`,
  czyli najgorszy możliwy wynik.
- Dotknięcie, gdy kulkę jeszcze widać, jest ignorowane bez kary (jak dotknięcie poza strefą w Środku); liczy się pierwsze dotknięcie po zniknięciu.
- Ekran sam kończy rundę po dwukrotności `hidden` (dalej odchyłka i tak jest ucięta). Grający nie widzi limitu tury ani żadnego licznika
  sekund (podawałyby czas), jak w Stoperze, Rytmie i Przytrzymaj.
- Bez ruchu `progress` (8 krótkich rund).
- Ekran: tor poziomy, kulka w kolorze gracza, kierunek zawsze w prawo. Meta to kreska na zasłonie, nie krawędź pola: za nią zostaje kawałek toru,
  żeby w odsłonie było widać przestrzelenie. Całe pole jest przyciskiem. Kolor odchyłki jak w Stoperze: do 100 ms zielony, ponad 500 ms ostrzegawczy.
- Stan trzyma też `taps` każdego gracza: ekran końcowy to jedna tabela, rundy 1-8 w kolumnach, gracze w wierszach.
  Najlepszy w rundzie (bez remisu) ma tło w kolorze gracza.

### Nożyczki (`nozyczki`)
- 5 kształtów (`SHAPES`), te same dla wszystkich; gracz jednym ruchem palca przecina każdy prostą tak, żeby obie części miały równe pole.
- Kształt to gęsty wielokąt (64 wierzchołki, współrzędne 0-1 w ułamkach pola, zaokrąglone do 3 miejsc). Promień jest funkcją kąta:
  losowa baza (0,20-0,26 boku pola, więc rozmiar też się zmienia) razy (1 + suma czterech fal o losowej amplitudzie i fazie),
  więc kształt jest gładki, nie przecina sam siebie i nie ma symetrii.
  Całość jest losowo przesunięta w polu (margines 0,05 od krawędzi), żeby środek kafla niczego nie podpowiadał.
  Ekran rysuje ten sam wielokąt, więc pole na ekranie i na serwerze jest to samo.
- Cięcie to prosta przez punkt dotknięcia i punkt puszczenia palca (`a`, `b`), przedłużona w obie strony; jak długi był ruch, nie ma znaczenia.
- Wynik liczy serwer: `split` obcina wielokąt do obu stron prostej, `share` to udział jednej strony w polu kształtu.
  Gdy prosta tnie kształt na więcej niż dwa kawałki, liczą się strony prostej (kawałki po tej samej stronie się sumują).
- Błąd kształtu = |udział − 50%| w punktach procentowych (części 53% i 47% to błąd 3,0), od 0 do 50. Kierunek ruchu nie ma znaczenia.
- Cięcie nie jest odpowiedzią, gdy punkty leżą bliżej niż 0,05 boku pola (`MIN_CUT`: kierunek prostej byłby przypadkowy)
  albo mniejsza część ma poniżej 1% pola kształtu (`MIN_PART`: prosta minęła kształt albo ledwie go drasnęła).
  Ekran je ignoruje bez kary, serwer odrzuca cały ruch z takim cięciem (jak strefa akceptacji w Środku).
- Jeden ruch z 5 cięciami. Wynik = suma błędów, zapisana w dziesiątych częściach punktu procentowego (int), mniej lepiej.
- Pusta lista = limit czasu = 5 × 50% (`MAX_ERROR`, tyle co cięcie obok kształtu; każda uczciwa runda kosztuje mniej).
- Bez ruchu `progress` (5 krótkich rund).
- Ekran: kwadratowy kafel z kształtem. Przeciąganie pokazuje prostą przez cały kafel w kolorze gracza, puszczenie tnie.
  Cięcie, które nie jest odpowiedzią: potrząśnięcie, wibracja 60 i „Przetnij kształt”, runda trwa dalej.
  Po cięciu przez 1,5 s obie części mają kolor gracza o różnym kryciu, pod kaflem ich udziały („53,0% | 47,0%”); kolor według celności:
  do 1 zielony z „Idealnie!”, do 5 zwykły, dalej ostrzegawczy. Potem sam wskakuje następny kształt; po piątym wynik idzie na serwer.
- Ekran końcowy: jedna tabela, kształty 1-5 w kolumnach, gracze w wierszach. Najlepszy w rundzie (bez remisu) ma tło w kolorze gracza.

### Sudoku (`sudoku`)
- Plansza 4×4 (`SIZE`), bloki 2×2, cyfry 1-4: w każdym wierszu, kolumnie i bloku każda cyfra dokładnie raz.
  6 pól jest danych (`GIVENS`), 10 do wpisania (`BLANKS`). Plansza jest ta sama dla wszystkich i ma dokładnie jedno rozwiązanie.
- Losowanie na serwerze w `setup`: pełna poprawna siatka (wzorzec bazowy z potasowanymi cyframi, wierszami w pasach, kolumnami w pasach
  i samymi pasami), potem usuwanie pól w wylosowanej kolejności, dopóki rozwiązanie zostaje jedno. Gdy usuwanie utknie powyżej 6 danych,
  losujemy od nowa.
- Stan (= widok, nic nie jest ukryte): `puzzle` (16 pól wiersz po wierszu, 0 = puste) i `solution` (16 cyfr).
- Przebieg: gracz dotyka pustego pola, potem jednej z cyfr 1-4. Dobra cyfra zostaje w polu, zła nie zostaje i liczy się jako pomyłka.
  Partia kończy się po wypełnieniu ostatniego pola. Pól danych i już wypełnionych nie da się zmienić.
- Wynik: `ms` + 5000 ms za każdą pomyłkę (`PENALTY_MS`, `total`), mniej lepiej, bez drugiego kryterium; równe = remis bez zwycięzcy.
- Walidacja: `ms` od 3000 (10 × 300 ms) do 120000, `mistakes` int ≥ 0.
- Nowy wynik ma `completed: boolean` w stanie. Klient zgłasza ukończenie (brak pola w ruchu oznacza `true`);
  `completed: false` jest dozwolone tylko w zaufanym kontekście `{ source: "timeout" }`, nigdy z JSON klienta.
  Timeout: 120000 ms, 0 pomyłek i `completed: false`.
- Każde ukończenie jest przed nieukończeniem, także 60 s + 13 pomyłek = 125 s. Ukończeni są porównywani po czasie z karami;
  nieukończeni remisują ze sobą. Ten sam komparator ustala zwycięzcę, ranking i miejsca w turnieju.
- Nowy timeout nie daje rekordu: `record.score` zwraca nieskończoność jako sygnał dla filtra serwera;
  stan JSON i baza zawierają wyłącznie skończone liczby. Ekran pokazuje „Nieukończono”, bez panelu nowego rekordu.
  Przewaga w sekundach jest pokazywana tylko między dwoma ukończonymi wynikami.
- Stare rekordy i detail bez `completed` pozostają historyczne, bez dopisywania statusu i bez przeliczania.
  Sam czas 120000 ms ani wynik z karami nie dowodzi timeoutu; dawny nierozpoznawalny timeout może nadal wyprzedzać nowe ukończenie.
  Serwer ufa klientowi co do czasu i pomyłek (jak w Tabeli Schultego), przebiegu nie sprawdza.
- Postęp rywali: po każdej dobrej cyfrze (poza ostatnią) klient wysyła `{ type: "progress", filled }` (int 1-9, tylko gracz bez wyniku).
  Serwer zapisuje go w `progress` i pokazuje jako pierścień na kropkach graczy (po ich dotknięciu pasek i `4/10`). Wartość nie musi rosnąć
  (po odświeżeniu gracz zaczyna od nowa) i nie wpływa na wynik.
- Limit przez `turn()` ze stałym kluczem: ruch `progress` nie odnawia 120 s, nawet gdy gra już tylko jedna osoba.
- Bez trybów (jedna wielkość planszy), bez notatek w polach.
- Ekran: siatka 4×4 z grubszą linią między blokami, wybrane pole ma obwódkę w kolorze gracza, pod siatką 4 przyciski cyfr.
  Dobra cyfra błyska na zielono, zła na czerwono z potrząśnięciem i wibracją 60; lokalny zegar ma etykietę „Twój czas”.
- Ekran końcowy: tabela wyników z czasem i karą („23,4 s (+5 s kary)”) i wiersz z przewagą zwycięzcy (tylko gdy jest zwycięzca), bez wykresu.

## 2. Gomoku (`piec-w-rzedzie`)

- Plansza 15×15, dwóch graczy stawia na zmianę; zaczyna `players[0]`.
- Wygrywa 5 lub więcej w linii (poziomo, pionowo, po skosie); dłuższa linia też wygrywa.
- Pełna plansza bez linii = remis (`isOver` zwraca `{}` bez zwycięzcy).
- Limit czasu: losowe wolne pole.

## 3. Statki (`statki`)

- Tryb wybiera gospodarz w lobby (`modes` w definicji gry, `MODES` w `statki.ts`); nieznany albo brak = `klasyczny` (domyślny).
  Lista jest ułożona od najkrótszej partii do najdłuższej.
  Rewanż gra w tym samym trybie, ranking liczy wszystkie tryby razem.

  | Tryb | Plansza | Flota | Stykanie |
  |---|---|---|---|
  | `szybki` | 8×8 | 4, 3, 2, 2 | nie |
  | `hasbro` | 10×10 | 5, 4, 3, 3, 2 | tak |
  | `klasyczny` | 10×10 | 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 | nie |
  | `flota` (Flota wojenna) | 12×12 | 6, 5, 4, 4, 3, 3, 2, 2 | nie |

- Statki proste. Bez stykania: nie mogą się dotykać, także rogami. Ze stykaniem: nie mogą się tylko nakładać.
- **Faza `placing`** (obaj naraz): serwer losuje każdemu poprawną flotę. `place` podmienia całą flotę (walidacja `isValidFleet`),
  `ready` zamyka ustawianie, `unready` je otwiera z powrotem (dopóki drugi gracz nie jest gotowy). Gdy obaj gotowi, zaczyna się bitwa.
  Limit czasu: `ready` z aktualnym ustawieniem.
- **Faza `battle`**: zaczyna `players[0]`. Pudło oddaje turę, trafienie daje kolejny strzał.
- Zatopienie: pola statku dostają wynik `sunk`, a wszystkie pola dookoła (także po skosie) są oznaczane `around`
  i nie da się już w nie strzelić. W trybie ze stykaniem pól dookoła się nie oznacza (może tam stać inny statek).
- Wygrywa ten, kto zatopi całą flotę przeciwnika. Limit czasu: strzał w losowe nieostrzelane pole.
- Limit przez `turn(state)`: całe rozstawianie ma jeden licznik 90 s (`PLACING_SECONDS`), którego nie odnawia ani `place`,
  ani `ready`, ani `unready` (inaczej dałoby się przeciągać rozstawianie bez końca). W bitwie 60 s od nowa po każdym strzale.
- **Ukrywanie stanu**: `playerView` pokazuje właścicielowi wszystkie jego statki, pozostałym (przeciwnik, obserwator) tylko zatopione.

## 4. Chińczyk (`chinczyk`)

- 2-4 graczy, każdy ma 4 pionki. Tor ma 40 pól, potem 4 pola domku końcowego.
- Pozycje liczone od własnego startu: −1 domek startowy, 0-39 tor, 40-43 domek końcowy. Starty co 10 pól; przy dwóch graczach
  naprzeciw siebie (0 i 20).
- Jedna kostka. Wyjście z domku startowego tylko na 6 (na pozycję 0).
- Ruch musi zmieścić się w torze: nie wolno przeskoczyć pozycji 43. Nie wolno stanąć na własnym pionku (także w domku końcowym).
- W domku końcowym nie wolno przeskakiwać własnych pionków, także wchodząc z toru: żaden własny pionek nie może stać
  na polach 40-43 między pozycją startową a docelową.
- Zbicie: pionki przeciwników stojące na tym samym polu toru wracają do domku startowego.
- Pole startowe jest bezpieczne, gdy stoi na nim pionek właściciela (jego pozycja 0): rywal nie może na nim stanąć
  (ruch niedozwolony, przeskoczyć wolno). Obcy pionek na cudzym polu startowym nie jest chroniony, więc wychodzący go zbija.
- Szóstka daje kolejny rzut, także wtedy, gdy nie było możliwego ruchu. Trzecia szóstka z rzędu kończy turę bez ruchu.
- Gdy gracz nie ma żadnego pionka na torze i nie może się ruszyć, ma do 3 rzutów w turze.
- Jedyny możliwy ruch wykonuje się sam; faza `move` (wybór pionka) jest tylko przy 2+ możliwościach.
  Pionki w domku startowym są nierozróżnialne: ruszyć można tylko pierwszym.
- Gracz kończy, gdy wszystkie 4 pionki są w domku końcowym; trafia do `ranking` i wypada z kolejki (bez dodatkowego rzutu,
  nawet po szóstce). Gra toczy się do pełnego rankingu: gdy zostaje jeden gracz, dopisywany jest na końcu.
- Limit czasu: rzut albo losowy z możliwych pionków. Limit przez `turn(state)`: klucz zmienia się po każdym rzucie i ruchu.

**Tryby** (`MODES`): powyżej opisany jest **Klasyczny** (`klasyczny`, domyślny, 60 s). **Szybki** (`szybki`, 20 s, partia na około 10 minut) zmienia:
- Start: jeden pionek stoi już na pozycji 0, trzy w domku startowym.
- Wyjście z domku startowego na 1 albo 6 (kolejny rzut dalej tylko po szóstce).
- Bez dokładnego rzutu: gdy pozycja + oczka przekracza 43, pionek wchodzi na najdalsze wolne pole domku końcowego
  dalsze niż jego pozycja (gdy takiego nie ma, ruchu nie ma). Własne pionki w domku wolno przeskakiwać.
- Zbicie daje dodatkowy rzut. Wejście pionka z toru do domku końcowego też (zawsze jeden dodatkowy rzut, także po szóstce).
- Koniec: pierwszy gracz z 3 pionkami w domku końcowym wygrywa i partia kończy się od razu. Reszta rankingu:
  więcej pionków w domku końcowym, potem większa suma pozycji.

## 5. Państwa-miasta (`panstwa-miasta`)

- 2-6 graczy, 5 rund. Każda runda na inną literę z `ABCDEFGHIJKLŁMNOPRSTUWZ` (bez powtórek w partii).
  `playerView` wysyła litery przyszłych rund jako puste; `nonce` w stanie służy tylko do montowania komponentu od nowa przy rewanżu.
- Kategorie: Państwo, Miasto, Zwierzę, Roślina, Rzecz, Imię. Odpowiedź do 30 znaków.
- **Pisanie (`write`, 90 s)**: wszyscy naraz. Ruch `write` z `done: false` to szkic zapisywany w tle; `done: true` oddaje kartkę.
  Pierwsze oddanie kartki (z kompletem albo bez) to STOP: licznik reszty startuje od nowa na 7 s.
  Po czasie serwer oddaje za gracza jego ostatni szkic.
- **Głosowanie (`vote`, 45 s)**: każdy raz wysyła listę odrzucanych odpowiedzi (nie swoich). Odpowiedź odpada, gdy odrzuci ją
  ponad połowa pozostałych graczy. Odpowiedź pusta albo na złą literę odpada sama (Ł to inna litera niż L). Limit czasu: nic nie odrzucam.
- **Punkty za kategorię**: 15 jedyna ważna odpowiedź w kategorii, 10 ważna i unikalna, 5 powtórzona, 0 brak lub odrzucona.
  Powtórki porównuje `normalize`: bez wielkości liter, polskich znaków i nadmiarowych spacji.
- **Podsumowanie (`summary`, 20 s)**: następna runda, gdy wszyscy klikną „Dalej” (`next`) albo minie czas. Po 5. rundzie od razu koniec.
- Wygrywa suma punktów; przy remisie na górze nie ma zwycięzcy.
- **Ukrywanie stanu**: w pisaniu każdy widzi tylko swój szkic, w głosowaniu tylko swój głos; potem wszystko jest jawne.
- Limit przez `turn(state)`: klucz `faza:runda:stop`, więc licznik startuje od nowa przy zmianie fazy, rundy i przy STOP.

## 6. Kampus Tour (`kampus-tour`)

2-4 graczy (limit 4 to decyzja, nie przeoczenie), 6 postaci do wyboru. Balans ekonomii i jego historia: `KONCEPT.md`, sekcja 9.

### Plansza (32 pola, indeksy zgodnie z ruchem wskazówek zegara)

| Pola | Co |
|---|---|
| 0 | Początek |
| 1, 2 | grupa 0, cena 10: Automat z kawą, Automat z przekąskami |
| 3, 4, 6 | grupa 1, cena 15: Biblioteka PRz, Hala sportowa PRz, Rektorat |
| 5, 13, 21 | Karty Dziekanatu |
| 7, 29 | Ksero, Stołówka (cena 30, czynsz z rzutu) |
| 8, 9, 10 | grupa 2, cena 20: Wydziały Mechaniczny, Elektryczny, Chemiczny |
| 11 | Kolokwium |
| 12, 14, 15 | grupa 3, cena 25: Hala Podpromie, Stadion Stali, Zalew Rzeszowski |
| 16 | Juwenalia |
| 17, 18, 19 | grupa 4, cena 30: Ulica 3 Maja, Galeria Rzeszów, Millenium Hall |
| 20, 22, 23 | grupa 5, cena 35: Kino, Kręgielnia, Klub studencki |
| 24, 25, 26 | grupa 6, cena 40: Bulwary nad Wisłokiem, Okrągła kładka, Pomnik Czynu Rewolucyjnego |
| 27 | Bilet MPK |
| 28 | Opłata za akademik (15 zł do banku) |
| 30, 31 | grupa 7, cena 50: Zamek Lubomirskich, Rynek |

### Start i tura
- Gotówka: 200 zł + 20 zł za każde dalsze miejsce w kolejce (wyrównuje przewagę pierwszego ruchu).
- Faza `pick`: wszyscy naraz wybierają postać, każda tylko raz. Potem tury po kolei od `players[0]`.
- Rzut dwiema kośćmi, ruch o sumę. Przejście przez Początek (albo stanięcie na nim) daje 40 zł kieszonkowego.
- Dublet daje kolejny rzut po rozliczeniu pola. Trzeci dublet z rzędu: od razu na Kolokwium, bez ruchu.
- Fazy po rzucie: `card`, `buy`, `buyout`, `build`, `sell`, `juwenalia`; po rozliczeniu `finish` (kolejny rzut po dublecie albo następny gracz).

### Pola do kupienia
- Wolne pole: faza `buy`, jeśli gracza stać (`buy` albo `skip`). Nie stać: nic się nie dzieje.
- Własne pole (także zaraz po kupnie lub wykupieniu): faza `build`, jeśli jest co budować i stać na kolejny poziom.
- Cudze pole: czynsz dla właściciela, potem ewentualnie wykupienie.

### Czynsz (P = cena pola)
- Bez budynków: P/10 (zaokrąglone); komplet grupy podwaja.
- Z budynkami, poziomy 1-4: 0,4P / P / 2P / 4P (zaokrąglone). Mnożnik za komplet już się nie dolicza.
- Ksero i Stołówka: suma oczek × 2 przy jednym polu, × 5 przy obu. Nie da się na nich budować.
- Juwenalia na polu mnożą czynsz (patrz niżej); karta „Nocny autobus MPK” dodatkowo × 2.

### Budowa
- Tylko na polu, na którym gracz właśnie stoi. Jednym ruchem `build` można wskoczyć o kilka poziomów.
- Poziomy 1-3 kosztują po P/2 (zaokrąglone), poziom 4 (landmark) kosztuje P.
- Bez kompletu grupy najwyżej poziom 2; poziom 3 i landmark tylko z kompletem.

### Wykupienie (`buyout`)
- Po zapłaceniu czynszu można wykupić cudze pole za 2 × wartość (cena + koszt postawionych budynków); pieniądze dostaje właściciel,
  budynki zostają.
- Nie dotyczy landmarków. Oferta jest tylko, gdy gracza stać, i nie ma jej, gdy na czynsz trzeba było sprzedawać pola.

### Dług, sprzedaż, bankructwo
- Gdy gotówki brakuje na czynsz, opłatę lub kartę, a gotówka + sprzedaż pól wystarczy: faza `sell`. Gracz sprzedaje pola bankowi
  za połowę wartości (zaokrąglone w dół, razem z budynkami), aż starczy; dług spłaca się sam.
- Gdy nawet sprzedaż wszystkiego nie wystarczy: bankructwo. Gotówka idzie do wierzycieli (po równo, reszta przepada),
  pola wracają do banku bez budynków.
- Pole, które wraca do banku, traci Juwenalia.

### Pola specjalne
- **Kolokwium** (pole 11): samo stanięcie na nim nic nie robi. Trafia się tam przez trzeci dublet albo kartę „Spóźnienie na zajęcia”:
  pionek idzie na pole 11 bez kieszonkowego i tura się kończy. W następnej turze gracz rzuca:
  - ma kartę „Zaliczenie w pierwszym terminie”: zużywa ją (wraca na spód talii) i rusza się normalnie, dublet daje kolejny rzut,
  - dublet: zdaje, rusza się o oczka, ale bez dodatkowego rzutu,
  - inaczej: traci tę turę; w kolejnej jest już wolny.
- **Juwenalia** (pole 16): gracz, który ma choć jedno pole, wybiera własne pole z mnożnikiem czynszu. Pierwsze Juwenalia w partii × 2,
  kolejne × 3, × 4 itd. (licznik wspólny dla wszystkich). Naraz tylko jedno pole: nowe Juwenalia zastępują stare.
- **Bilet MPK** (pole 27): tura kończy się od razu (także po dublecie). W następnej turze zamiast rzutu można `travel` na dowolne
  inne pole: bez kieszonkowego za Początek, bez dodatkowego rzutu; kości są rzucane tylko po to, żeby policzyć czynsz
  za Ksero i Stołówkę. Zwykły rzut zużywa niewykorzystany bilet.
- **Opłata za akademik** (pole 28): 15 zł do banku.

### Karty Dziekanatu (18 kart, `CARDS`)
- Talia tasowana w `setup`. Karta jest dobierana z wierzchu (faza `card`), efekt działa po ruchu `card` (odkrycie), karta wraca na spód.
  „Zaliczenie” zostaje u gracza do użycia.
- Gotówka z banku: +30, +20, +15, +25. Do banku: −30, −10, −20.
- Korepetycje: każdy płaci graczowi 5 zł, ale najwyżej tyle, ile ma (nie wpędza w dług).
- Składka na imprezę: gracz płaci każdemu po 5 zł.
- Remont w akademiku: 5 zł za każdy poziom budynków, 20 zł za każdy landmark.
- Spóźnienie na zajęcia: na Kolokwium. Zaliczenie w pierwszym terminie: karta do zachowania.
- Zgubiona legitymacja: 3 pola wstecz (bez kieszonkowego), pole jest rozliczane.
- Idź na: Początek (0), Rynek (31), Juwenalia (16), Automat z kawą (1). Ruch do przodu, mijając Początek dostaje się kieszonkowe,
  pole docelowe jest rozliczane.
- Nocny autobus MPK: na najbliższe Ksero albo Stołówkę do przodu, właścicielowi podwójny czynsz.

### Koniec gry
- **Bankructwo**: zostaje jeden gracz.
- **Monopol**: 3 pełne grupy kolorów (Ksero i Stołówka się nie liczą) kończą grę od razu; monopolista wygrywa niezależnie od majątku.
- **Limit**: po 20 rundach wygrywa największy majątek (gotówka + wartość pól z budynkami); przy równym majątku na górze remis bez zwycięzcy.
- Ranking: żyjący według majątku (monopolista pierwszy), potem bankruci od ostatniego do pierwszego.

### Limit tury i widok
- `timeoutMove`: `pick` losowa wolna postać; `buy`, `build`, `buyout` pominięcie; `juwenalia` najdroższe własne pole;
  `card` odkrycie; `sell` najtańsze pole; w pozostałych rzut (czyli Bilet MPK przepada).
- `playerView` ukrywa kolejność talii (zostaje `deckSize`). `events` to 4 ostatnie zdarzenia, UI zamienia je na tekst.
- `stats` (majątek co rundę, zapłacony czynsz, dochód z pól, dublety) służy tylko ekranowi podsumowania.

## 7. Memory (`memory`)

- 2-6 graczy, wspólna plansza zakrytych kart, na każdej jeden z 18 symboli (`SYMBOLS`), każdy symbol dokładnie na dwóch kartach.
- Tryb wybiera gospodarz w lobby (`MODES` w `memory.ts`); nieznany albo brak = `srednia`. Ranking liczy wszystkie tryby razem.

  | Tryb | Plansza | Pary |
  |---|---|---|
  | `mala` (Mała) | 4×4 | 8 |
  | `srednia` (Średnia) | 4 kolumny × 6 rzędów | 12 |
  | `duza` (Duża) | 6×6 | 18 |

- `setup` losuje z 18 symboli tyle, ile par, i tasuje karty. Zaczyna `players[0]`.
- Jeden ruch `{ card }` (indeks karty): odkrycie zakrytej karty. Nie można odkryć karty zebranej ani drugi raz pierwszej karty tury.
- Pierwsza karta tury zostaje odkryta (`first`). Druga karta:
  - **para**: obie karty zostają odkryte u gracza (`owner`), ten sam gracz rusza dalej,
  - **pudło**: tura od razu przechodzi na następnego gracza, a `miss` trzyma indeksy obu kart do następnego odkrycia (ich symbole są wtedy w `faces`).
    Ekran pokazuje je przez 1,5 s (`MISS_MS` w `Memory.tsx`) albo krócej, jeśli następny gracz odkryje kartę wcześniej.
- Koniec, gdy wszystkie pary są zebrane. Wygrywa najwięcej par (`rankResults`); remis na pierwszym miejscu = bez zwycięzcy.
- Limit 60 s na każde odkrycie. Limit czasu: losowa zakryta karta.
- **Ukrywanie stanu**: `playerView` jest taki sam dla wszystkich (także obserwatora) i zawiera symbole tylko kart zebranych,
  `first` i `miss`. Symbol z `miss` zostaje w widoku także po zakryciu kart na ekranie (każdy go już widział).

## 8. Turniej (`turniej`)

Seria mini-gier puszczana po kolei w jednym pokoju. To nie jest gra z rejestru `GAMES`: każda gra turnieju to zwykła partia mini-gry
(instrukcja, limit, wynik i ranking jak w sekcji 1), a pokój sumuje punkty. Zasady w `turniej.ts`, przebieg w `LobbyRoom.ts`.

- Gracze: wszyscy z miejscem (1-6). Skład jest stały na cały turniej; kto dołączy w trakcie, ogląda.
- Konfiguracja `{ length, must, skip }` (sprawdza ją `cleanConfig`). Liczbę gier ustawia gospodarz (wiadomość pokoju `pickTournament`),
  a gry zaznacza **każdy w pokoju**, także oglądający (wiadomość `markGame`: jedna gra na raz, `must`, `skip` albo `any`, funkcja `mark`).
  Lista jest wspólna i wygrywa ostatnie zaznaczenie; spory gracze rozstrzygają między sobą, aplikacja ich nie rozsądza.
  Każda zmiana kasuje gotowość gości. Pokój pamięta, kto ostatni zaznaczył grę (`markedBy` w `RoomView`), i ekran pokazuje przy niej kropkę w kolorze tego gracza.
  - `length`: liczba gier, od `MIN_LENGTH` (3) do liczby niewykluczonych mini-gier, domyślnie `DEFAULT_LENGTH` (8); wartość spoza zakresu jest przycinana,
  - `must`: gry, które będą na pewno; gdy jest ich więcej niż `length`, długość rośnie do ich liczby,
  - `skip`: gry wykluczone; po wykluczeniu muszą zostać co najmniej 3 gry,
  - nieznane `id`, gra jednocześnie w `must` i `skip` albo niecałkowita długość: konfiguracja odrzucona.
- Losowanie na starcie (`draw`): wszystkie `must` i losowe z reszty puli, bez powtórzeń, w potasowanej kolejności.
- Punkty za grę (`gamePoints`): liczba graczy ze ściśle gorszym miejscem. Przy 4 graczach bez remisów 3/2/1/0, remisujący dostają tyle samo.
  Miejsca z remisami podaje `places` mini-gry (`rankPlaces` w core.ts). Gra przerwana (ktoś wyszedł, błąd) daje wszystkim 0.
- Tabela (`standings`): suma punktów malejąco, potem liczba wygranych gier. Wygrana gra to samodzielne 1. miejsce przy 2+ graczach.
- Między grami: wyniki gry i tabela; następna gra rusza, gdy wszyscy grający klikną „Dalej”, najpóźniej po `NEXT_SECONDS` (15 s).
- Koniec po ostatniej grze. Zwycięzcą jest samodzielny lider tabeli (punkty, potem wygrane gry). Przy remisie na szczycie dolosowywana jest
  jedna gra dogrywki: spoza rozegranych i wykluczonych, a gdy takich nie ma, dowolna niewykluczona. Po dogrywce remis zostaje bez zwycięzcy.
  Turniej solo nie ma zwycięzcy ani dogrywki.
- Wyjście gracza: bieżąca gra kończy się bez punktów, gracz znika z tabeli, turniej trwa dalej z pozostałymi.
- Zakończyć turniej przed czasem może tylko gospodarz. Rewanż po turnieju losuje gry od nowa z tą samą konfiguracją.
- Ranking w SQLite: pojedyncze gry zapisują się jak poza turniejem, zwycięzca turnieju dodatkowo pod `id` `turniej`.

## 9. Kalambury (`kalambury`)

- 2-6 graczy. Rysuje się po kolei: w rundzie `r` rysuje `players[r % n]`, reszta zgaduje. Tryb wybiera gospodarz w lobby
  (`MODES` w `kalambury.ts`): `krotka` (Krótka, każdy rysuje raz, domyślna) albo `dluga` (Długa, każdy rysuje dwa razy).
- Hasła: `WORDS` w `kalambury-dane.ts`, ogólne jednowyrazowe rzeczowniki. `setup` losuje 3 hasła na każdą rundę, w całej partii bez powtórek.
  `nonce` w stanie służy tylko do montowania komponentu od nowa przy rewanżu.
- **Wybór (`choose`, 15 s)**: rysujący wybiera jedno z trzech haseł rundy (`{ type: "choose", index }`, 0-2). Limit czasu: pierwsze hasło.
- **Rysowanie (`draw`, 2 × 40 s)**: dwie połowy (`half` 0 i 1), każda z własnym limitem `HALF_SECONDS` (40 s).
  - ekran pokazuje jeden pasek 80 s na całe rysowanie (w pierwszej połowie dolicza drugą); podział widać tylko po odsłoniętej literze,
  - pierwsza połowa kończy się ruchem `{ type: "hint" }` wykonywanym przez serwer za rysującego po limicie.
    `validateMove` dopuszcza go wyłącznie w `draw`, przy `half: 0`, za rysującego i z zaufanym kontekstem `source: "timeout"`.
    Klient, także rysujący, nie może odsłonić litery wcześniej. Brak kontekstu oznacza klienta; `source` w treści ruchu
    nie zmienia źródła walidacji. Hint odsłania jedną losową literę hasła (`rng`, indeks w `revealed`), ustawia `half: 1`
    i zmienia klucz `turn` na drugą połowę. Kolejny hint odpada, także od timeoutu.
  - rysujący wysyła kreski: `{ type: "line", points, start, color }`, gdzie `points` to płaska lista par x, y (liczby całkowite 0-1000,
    parzysta długość, 2-200 liczb w ruchu); `start: true` zaczyna nową kreskę, `false` dokleja punkty do ostatniej (bez kreski odpada).
    `color` to indeks palety 0-5 (`INKS`: biały, żółty, zielony, niebieski, brązowy, gumka); liczy się tylko przy `start`, doklejone punkty
    mają kolor swojej kreski. Gumka (`ERASER`, 5) to kreska w kolorze płótna, grubsza od zwykłej; dla zasad to zwykły kolor.
    Cały rysunek ma najwyżej `MAX_POINTS` (2000) punktów; ruch, który by go przekroczył, odpada.
    `{ type: "undo" }` usuwa ostatnią kreskę, `{ type: "clear" }` czyści rysunek (bez kresek odpada) i odkłada go do `cleared`.
    `undo` przy pustym rysunku przywraca odłożony (`cleared`), więc przypadkowe „Wyczyść” da się cofnąć;
    bez kresek i bez odłożonego rysunku `undo` odpada. Odłożony rysunek zna tylko rysujący.
  - zgadujący wysyła `{ type: "guess", text }` (do 30 znaków, po obcięciu spacji niepusty). Hasło porównuje `normalize`:
    bez wielkości liter, polskich znaków i nadmiarowych spacji. Trafienie dopisuje gracza do `guessed` (treść nie trafia nigdzie),
    pudło trafia do czatu rundy (`chat`), który widzą wszyscy. Najwyżej `MAX_GUESSES` (30) pudeł na gracza w rundzie.
    Kto zgadł albo spasował, nie strzela dalej. Rysujący nie zgaduje.
  - `{ type: "pass" }`: zgadujący rezygnuje z rundy (w obu połowach). Limit drugiej połowy: `pass` za każdego, kto jeszcze nie zgadł.
  - `waitingFor`: w pierwszej połowie rysujący (to jego limit kończy się literą), w drugiej zgadujący, którzy nie zgadli ani nie spasowali.
    Runda kończy się, gdy wszyscy zgadujący zgadli albo spasowali, w dowolnej połowie.
- **Punkty rundy**: zgadujący według kolejności trafień 10, 8, 6, 5, 4 (`GUESS_POINTS`), rysujący 3 za każdego, kto zgadł (`DRAWER_POINTS`).
- **Odsłona (`reveal`, 6 s)**: hasło, kto zgadł i punkty rundy. Następna runda, gdy wszyscy klikną „Dalej” (`next`) albo minie czas.
  Po ostatnim rysowaniu od razu koniec (`over`); hasło i rysunek ostatniej rundy zostają w widoku.
- Wygrywa suma punktów; przy remisie na górze nie ma zwycięzcy.
- **Ukrywanie stanu**: listy haseł nie ma w widoku. W wyborze trzy hasła (`choices`) widzi tylko rysujący, a w rysowaniu hasło (`word`)
  zna tylko rysujący; reszta i obserwator dostają `hint` (każda litera jako „_”, odsłonięta litera jawnie, spacje zostają). Od odsłony hasło jest jawne.
- Limit przez `turn(state)`: klucz `faza:runda:połowa`, więc licznik startuje od nowa przy zmianie fazy, rundy i połowy, a nie przy kresce ani strzale.

## 10. Labirynt (`labirynt`)

- Tryb wybiera gospodarz w lobby (`MODES` w `labirynt.ts`); nieznany albo brak = `klasyczny`.

  | Tryb | Plansza | Ścianki na gracza (2 / 3 / 4 os.) |
  |---|---|---|
  | `klasyczny` | 9×9 | 10 / 7 / 5 |
  | `szybki` | 7×7 | 6 / 4 / 3 |

- Pionki startują na środku krawędzi, kolejność miejsc zgodnie z ruchem wskazówek zegara: `players[0]` na dole,
  przy 2 osobach drugi u góry, przy 3-4 kolejni po lewej, u góry i po prawej. Cel: dowolne pole przeciwległej krawędzi. Zaczyna `players[0]`.
- W turze jeden ruch: krok pionkiem (`step`) albo ścianka (`wall`).
- Krok: o jedno pole w pionie lub poziomie, nie przez ściankę. Gdy na sąsiednim polu stoi pionek, przeskakuje się go prosto;
  jeśli za nim jest ścianka, krawędź albo inny pionek, wolno stanąć skośnie obok niego (z jego pola, nie przez ściankę). Nad dwoma pionkami się nie skacze.
- Ścianka ma długość 2 pól i zaczepia się w punkcie przecięcia linii (`x`, `y` od 0 do rozmiaru − 2), poziomo (`h`, między wierszami `y` i `y+1`,
  kolumny `x` i `x+1`) albo pionowo (`v`). Nie może nachodzić na inną ani krzyżować się z nią (ten sam punkt, druga orientacja)
  i nie może odciąć żadnemu graczowi drogi do celu (pionki nie zasłaniają drogi). Ścianki z puli się kończą.
- `pass` tylko wtedy, gdy pionek nie ma żadnego kroku (możliwe przy 3-4 osobach).
- Koniec: pierwszy, kto stanie na polu celu, wygrywa (także przy 3-4 osobach, bez pełnego rankingu). Remisu nie ma.
- Limit czasu: krok w stronę celu (pole najbliższe celowi po ściankach), a gdy kroku nie ma, `pass`. Losowości w grze nie ma.
- Nic nie jest ukryte: widok to cały stan.

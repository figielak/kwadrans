# Jak wprowadzać nową grę

Kolejność jest stała: **ustalenia → testy zasad → kod zasad → ekran → podpięcie**. Każdy krok to osobny commit.
Ten plik opisuje proces i to, co ma być wspólne dla wszystkich gier. Zasady konkretnych gier są w `ZASADY-GIER.md`,
architektura i reguły platformy w `KONCEPT.md` (sekcja 3).

## 1. Co ustalić, zanim powstanie jakikolwiek plik

Wynikiem tego kroku jest nowa sekcja w `ZASADY-GIER.md` i wiersz w jej tabeli. Dopóki któryś punkt jest niejasny,
nie piszemy testów.

**Tożsamość**
- `id` (małe litery, myślniki). Jest kluczem rankingu w SQLite, więc **nie zmienia się nigdy**, nawet gdy zmieni się nazwa w UI.
- Nazwa w UI: krótka, jedno lub dwa słowa, mieści się na kaflu w lobby.
- Liczba graczy (`minPlayers`, `maxPlayers`). `minPlayers: 1` oznacza grę z grupy „Szybkie i refleksowe”.
- Tryby (opcjonalnie, tylko gry główne; mini-gra ma zasady narzucone z góry): lista `modes` z `id`, nazwą i jednolinijkowym opisem, w kolejności wyświetlania; domyślny ma `default: true`. Tryb zmienia liczby
  (plansza, flota, flagi zasad), nie mechanikę; wszystkie tryby liczą się do jednego rankingu (wzór: `statki.ts`).

**Typ gry** (decyduje o całej reszcie)

| Typ | Kto rusza | Gdzie toczy się partia | Wzorzec do skopiowania |
|---|---|---|---|
| po kolei | jedna osoba w `waitingFor` | serwer | `piec-w-rzedzie.ts`, `chinczyk.ts` |
| ukryty stan | jedna lub obie | serwer, `playerView` filtruje | `statki.ts` |
| równoczesna z fazami | kilka osób naraz | serwer, `turn()` z kluczem fazy | `panstwa-miasta.ts` |
| mini-gra | wszyscy naraz, każdy u siebie | klient, serwer dostaje jeden `result` | `stoper.ts` |

**Zasady**
- Przebieg tury i wszystkie ruchy (lista wariantów `Move`).
- Koniec gry: kiedy następuje, kto wygrywa, co przy remisie, czy jest pełny ranking, czy tylko zwycięzca.
- Co jest losowe i kiedy jest losowane (zawsze na serwerze, z `rng`).
- Co jest ukryte przed kim, i co widzi obserwator.
- Limit tury w sekundach oraz co dokładnie robi `timeoutMove` w każdej fazie.
- Dla mini-gry: jednostka wyniku, kierunek (mniej czy więcej lepiej), rozstrzyganie remisu,
  zakres wartości możliwych do uzyskania (serwer odrzuca resztę) i najgorszy wynik po limicie czasu.
- Wszystkie liczby (rozmiar planszy, liczba rund, czasy, kary) jako nazwane stałe, bez „około”.

**Ekran**
- Pion czy poziom. Poziom tylko wtedy, gdy plansza naprawdę nie mieści się w pionie (dziś wyłącznie Kampus Tour, klasa `.landscape`).
- Co gracz widzi, gdy czeka na innych, i co widzi obserwator.
- Co pokazuje ekran końcowy poza rankingiem.

## 2. Testy przed kodem

Plik `packages/games/src/<id>.test.ts` powstaje i jest commitowany **przed** `<id>.ts`
(commit „<Gra>: testy zasad”, potem „<Gra>: zasady (...)”, potem ekran). W chwili commitu testy nie przechodzą
i tak ma być. Kod zasad jest gotowy, gdy przechodzą wszystkie, bez zmieniania testów pod implementację.
Jeśli w trakcie okaże się, że zasada była źle pomyślana, najpierw zmienia się test i `ZASADY-GIER.md`, potem kod.

Nagłówek pliku to komentarz z listą zasad, które testy ustalają (wzór: `stoper.test.ts`).

### Testy obowiązkowe w każdej grze

- **Definicja**: `minPlayers`, `maxPlayers`, `turnSeconds` albo `turn()`; świeża gra nie jest skończona.
- **Setup**: stan początkowy, kto zaczyna (`waitingFor`), dwa różne seedy dają różne losowania, ten sam seed to samo.
- **Walidacja**, każdy przypadek osobno:
  - gracz spoza gry,
  - ruch poza swoją turą albo w złej fazie,
  - ruch poprawny w kształcie, ale niedozwolony (zajęte pole, za mało pieniędzy, drugi wynik),
  - ruch po końcu gry,
  - wartości brzegowe: pierwsza i ostatnia dozwolona przechodzą, sąsiednie nie.
- **Schemat**: `moveSchema` odrzuca śmieci z sieci (zły typ, brak pola, za długi tekst, liczba niecałkowita).
- **Każda zasada z sekcji w `ZASADY-GIER.md`** ma co najmniej jeden test nazwany tak, jak brzmi zasada.
- **Koniec gry**: wygrana każdego gracza (nie tylko pierwszego), remis, ranking w dobrej kolejności, `waitingFor` puste po końcu.
- **Limit czasu**: `timeoutMove` w każdej fazie zwraca ruch, który przechodzi `validateMove`.
- **Stan**: `applyMove` nie zmienia poprzedniego obiektu; stan przeżywa `JSON.parse(JSON.stringify(...))`.

### Testy zależne od typu

- **Ukryty stan**: `playerView` dla gracza nie zawiera danych przeciwnika, w każdej fazie; widok obserwatora (`""`)
  nie zawiera danych żadnej strony; po odsłonięciu widać dokładnie to, co odsłonięte.
- **Fazy równoczesne**: `waitingFor` kurczy się po kolei, `turn().key` zmienia się tylko przy zmianie fazy,
  minimalna i maksymalna liczba graczy (progi głosowań, większość przy 2 osobach).
- **Mini-gra**: wynik poza zakresem i wynik niecałkowity odpadają, drugi wynik odpada, remis nie daje zwycięzcy,
  gra solo kończy się rankingiem bez zwycięzcy, rewanż daje inne wyzwanie. Jeśli wynik liczy serwer z surowych danych
  (`kolo`, `kolor`, `kropki`), testowana jest funkcja licząca, także na danych zepsutych.

### Jak pisać

- Gracze to stałe `A`, `B`, `C` z imionami, RNG to `createRng(seed)`.
- Pomocnik `send(state, player, move)` sprawdza `validateMove`, potem woła `applyMove` (wzór w każdym pliku testów).
- Nazwy testów po polsku, opisują zasadę, nie funkcję („trafienie daje kolejny strzał”).
- Stan do testu buduje się ruchami albo małym pomocnikiem, nie ręcznie wpisanym obiektem, żeby test nie zależał od kształtu `State`.

## 3. Spójność zasad między grami

Te rzeczy działają tak samo w każdej grze. Odstępstwo wymaga wpisu w `ZASADY-GIER.md` z powodem.

- **Po limicie tury jest ruch, nie przegrana.** `timeoutMove` wybiera ruch neutralny albo losowy dozwolony;
  w mini-grze jest to najgorszy możliwy wynik. Schulte i Sudoku oznaczają nowe nieukończenie przez `completed: false`:
  każde ukończenie jest wyżej, nieukończeni remisują. Taki wynik powstaje wyłącznie w zaufanej ścieżce timeoutu serwera.
- **Remis nie ma zwycięzcy.** `isOver` zwraca wtedy samo `ranking`. Mini-gry używają `ranked` (czyli `rankResults` i `places` z jednego komparatora) i nie liczą remisu ani gry solo do wygranych (rekord zapisuje się także solo, z wyjątkiem nowych timeoutów Schultego/Sudoku);
  te timeouty zwracają niefinitywny `record.score` jako sygnał „brak rekordu”, filtrowany przed zapisem.
  Nieskończoność nie trafia do stanu JSON ani bazy. Stare detail bez `completed` zachowujemy bez przypisywania statusu;
  bez `places` mini-gra nie przejdzie testu kontraktu, bo turniej liczy z niego punkty.
  Świadomy remis po osiągnięciu kompletu jest dopuszczalny: zasady gry opisują powód, a wspólny komparator zachowuje
  ten sam remis w wyniku i miejscach. Sam osiągalny sufit nie wymusza nowego `tie`, pomiaru szybkości ani dodatkowych rund.
- **Kto zaczyna**: pierwszy z `players`. Kolejność miejsc rotuje platforma przy rewanżu, gra nie losuje startu sama.
- **Losowość tylko z `rng`** przekazanego do `setup` i `applyMove`. Żadnego `Math.random` ani `Date.now` w zasadach.
  Losowość czysto klienckiej dekoracji lub wyboru gry nie ustala wyzwania, punktacji ani stanu zasad i nie podlega tej regule.
- **Stan to zwykły obiekt** dający się zapisać do JSON, a `applyMove` zwraca nowy.
- **`validateMove` jest jedynym strażnikiem.** Ekran może blokować przyciski, ale serwer niczego nie zakłada.
  Mini-gry zachowują model zaufania opisany w `ZASADY-GIER.md` §1: czas i reakcje mierzy klient, aby opóźnienie sieci
  nie wpływało na pomiar; serwer waliduje dane i liczy wynik tam, gdzie ma dane surowe (np. Koło z punktów rysunku).
  Walidacja nie jest dowodem prawdziwości pomiaru klienta.
- **Mini-gra ma jeden ruch `result`** i pole odróżniające partie (wyzwanie albo `nonce`), po którym ekran montuje się od nowa przy rewanżu.
- **Ekran końcowy mini-gry rysuje się z samego stanu.** Rekordowa partia w rankingu to stan z `soloState` pokazany komponentem gry z `me=""`,
  więc dane gracza leżą w mapach z id gracza w kluczach (`results`, `taps`…), a wyniki nie zależą od stanu lokalnego komponentu. Nową mini-grę dopisz w `MiniGame.tsx`.
- **Losowanie nie zmienia sufitu wyniku.** Rekordy porównują różne partie, więc każda musi dawać tyle samo do zdobycia:
  cele, od których zależy wynik, mają stałą sumę (`withSum` z `core.ts`), a gra na reakcję ma stałą liczbę bodźców (Refleks), nie stały czas z losowymi przerwami.
  Rodzaje plansz o różnej trudności idą potasowanymi kompletami, nie osobnym losowaniem na planszę (Kolor liter, Inny element, Liczenie, Obrót).
  Gdy gracz decyduje, kiedy przestać i zachować zdobycz (decyzja stop), obowiązuje stały komplet celów tasowany między partiami (Balon: 11-20);
  równa suma różnych rozkładów nie zapewnia tego samego ryzyka. Sama stała suma wystarcza dopiero po uzasadnieniu
  w zasadach gry wpływu rozkładu na decyzje i wynik, nie jako dowód jednakowej trudności dla ludzi.
  Przytrzymaj i Za zasłoną zachowują losowe cele o stałej sumie: odtwarzanie różnych czasów jest treścią zadania,
  a gracz nie wybiera chwili zgarnięcia punktów kosztem ryzyka ich utraty. Nie przenosimy do nich kompletu gry ryzyka.
- **Kara za pomyłkę w grach na czas** to blokada 1 s albo doliczony czas, nigdy koniec partii (inaczej losowe klepanie wygrywa albo jedna pomyłka psuje zabawę).
- **Wspólne funkcje z `core.ts`** zamiast własnych: `shuffle`, `rankResults`, `ranked`, `average`, `byHitsThenAverage`.
  Dwie gry o tej samej mechanice dzielą moduł (jak `quiz.ts` dla Kolorów i Liczenia).
- **Limity tury**: 60 s na ruch w grach po kolei; w mini-grze limit `L >= max(1,2 * T, T + 10 s)`.
  Mini-gra ma jeden termin od końca instrukcji (ostatni „Start” albo 15 s); żaden ruch, także rywala, go nie odnawia.
  Zapas wynosi więc co najmniej 20% czasu `T` i co najmniej 10 s. Model `T` zapisujemy jawnie:
  suma czasów stałych (wstęp po starcie, pokazy, odsłony, pauzy) + czas decyzji wolnego, uczciwego gracza + czas sieci.
  Każdy składnik ma źródło: stała kodu, założenie albo pomiar. Czasy ludzkie, np. 5 s na celowanie,
  oraz budżet sieci są założeniami, dopóki nie zostaną zmierzone; model nie jest pomiarem ani gwarancją wystarczającego czasu.
  Decyzji objętych twardym limitem wewnętrznym nie doliczamy drugi raz ponad ten limit. Uwzględniamy wymagane kliknięcia
  po odsłonach; oceniamy przypadek solo lub ostatniego gracza klikającego „Start”, bez czasu zyskanego od rywali.
  Zapas podajemy w sekundach i procentach. Gdy długość zależy od osiąganej serii, opisujemy `T(N)` oraz zachowanie po limicie,
  zamiast deklarować nieograniczoną partię mieszczącą się w stałym czasie.
- **Obserwator** dostaje widok dla `""` i zawsze widzi coś sensownego.

**Wyjątki od zapasu i stan wdrożenia normy (2026-10-26)**

- Środek pozostaje przy 60 s, a Tort przy 120 s. Są to świadome wyjątki na ten etap, mimo wątpliwości modelowych;
  brak pomiaru ludzi nie potwierdza wystarczalności czasu. Ewentualne zwiększenie po pomiarach wymaga osobnej decyzji.
- Dla Który rok? zatwierdzono 270 s przy `T = 228 s`: 42 s zapasu, około 18,4%, zamiast 273,6 s wymaganych przez pełne 20%.
  To nazwany wyjątek od progu 20% (P4-021).
- Przyjęcie normy nie zmienia automatycznie stałych, losowania ani punktacji istniejących gier. Aktualne liczby pozostają
  w `ZASADY-GIER.md` i `KONCEPT.md`; ich dostosowanie wymaga testu i dokumentacji przed kodem w odpowiednim pakiecie.
  W szczególności nowy komplet Balonu należy do P4-060. Nie wszystkie obecne gry spełniają już powyższe normy.

## 4. Spójność wyglądu

Ekran gry to jeden plik `apps/web/src/games/<Gra>.tsx`. Dostaje `view`, `me`, `players`, `onMove`
(oraz `canMove` albo `ranking`) i nie wie nic o sieci.

**Czego gra nie rysuje sama**
- Nagłówek ze statusem („Twój ruch”, „Ruch: <nick>” z nickiem w kolorze gracza, „Czekamy na: ...” przy kilku osobach, „Wygrywasz!”), pasek czasu w kolorze gracza z ruchem, lista graczy z liczbą wygranych partii (puchar i podpis „wygrane” przed liczbą, „+1” nad pigułką zwycięzcy),
  w aktywnej partii zamiast pigułek rząd kropek przy liczniku (`GameDots` w ui.tsx): inicjał z `initials`,
  w mini-grach pierścień postępu z ruchu `progress` (pełny po oddaniu wyniku), w grach po kolei pełny pierścień u gracza z ruchem,
  przygaszenie u czytającego zasady, przerywany obrys u rozłączonego, kreska pod własną kropką (zawsze pierwszą), odznaka z wygranymi (w turnieju prostokątna, z punktami; zera nie widać);
  dotknięcie kropek rozwija pigułki z nickami i dokładnym postępem. W grze solo kropek nie ma.
  „Oglądasz”, komunikat o rozłączeniu, przyciski „Rewanż” i „Do lobby”. To wszystko daje `screens/Game.tsx`.
- Własny nagłówek ma tylko gra, której wspólny nie wystarcza (Państwa-miasta, Kampus Tour), i wtedy przejmuje cały jego zakres.

**Z czego gra się składa**
- Układ: `Screen` (jedna kolumna, `max-w-md`), akcje przy dolnej krawędzi, przy długiej treści `StickyBar`.
- Klasy z `index.css`: `.tile` (karta), `.label` (podpis), `.btn` + `.btn-primary` / `.btn-ghost`, `.field`.
  Nowa klasa wspólna powstaje dopiero, gdy potrzebuje jej druga gra.
  Zatwierdzony kontrakt wspólnej `.btn-player` dla akcji gracza opisuje [DESIGN.md §5](DESIGN.md#5-zasady-które-z-tego-wynikają);
  jej implementacja i migracja użyć należą do P4-050, klasa nie jest jeszcze dostępna w CSS.
- Wyniki mini-gry: komponent `Scores`, wiersz na gracza, „gra…” dopóki nie oddał.
  Gdy jedna liczba nie wystarcza (trafienia, średni czas, błędy), drugi wspólny wzorzec `ScoreTable` w ui.tsx (quizy, Dziesiątki, Stój!, Refleks):
  te same zasady „gra…”, „(ty)”, pucharu, miejsc z remisami i cyfr mono, szczegół (wykres Refleksu) pod tabelą.
- Rundy po partii: `RoundTable` z rundami w kolumnach i graczami w wierszach; nad rundami może stać wiersz celów (prawdziwe wartości: cel, rok, wytrzymałość).
  Komórka może mieć własny zapis (znak kierunku) i własny kolor bez wyróżniania najlepszego (Balon). Używają go Mapa, Środek, Tort, Nożyczki,
  Przytrzymaj, Balon, Policz kropki, Kąt i Który rok? (wydarzenia pod tabelą). Odcień to nazwany wyjątek: pary próbek kolorów obok siebie.
- Kolory tylko z tokenów, zaokrąglenia według wspólnej skali: pełna tabela tokenów, ich ról i skala promieni
  mają jedno źródło w [DESIGN.md §2](DESIGN.md#2-tokeny).
- Akcja gracza (przycisk w jego kolorze) to klasa `btn-player` obok `btn` (tekst grafitowy, tło `backgroundColor` z koloru gracza);
  `btn-primary` zostaje dla akcji platformy w akcencie. Własny wybór (tryb, liczba gier, „na pewno”, pola do sprzedaży) jest w kolorze tego,
  kto wybiera, nigdy w akcencie, i ma drugi znak (ikona `Check`, `aria-pressed`). Właściciel elementu planszy ma oprócz koloru inicjał
  (`initials`) albo ikonę postaci, a nick w etykiecie.
- Liczby, czasy i kody czcionką mono z `tabular-nums`.
- Ikony z `@phosphor-icons/react`; ikona gry w lobby ma wagę `regular`.

**Reguły**
- **Kolor gracza, nie czerwień**, dla wszystkiego, co jest „moje” lub „czyjeś”: pionki, kamienie, podświetlenie mojej tury.
  `accent` służy akcji platformy i pozostałym rolom z DESIGN §2, w tym znakowi aplikacji; ostrzeżenia używają `warning`.
  W odsłonie rundy moja odpowiedź jest w kolorze gracza, znacznik prawdy neutralny (`fg`), a ocenę (`grade`) niesie linia błędu i liczba.
- Mini-gra zaczyna od ekranu instrukcji: komponent `Intro` (ui.tsx) z animowanym podglądem gry (mały komponent `Preview` w pliku gry,
  sama animacja CSS w pętli), trzema krótkimi punktami (`time`: czas, `task`: co zrobić, `score`: jak liczone są punkty) i przyciskiem „Start”.
  Limit gry jeszcze wtedy nie tyka; po `INTRO_SECONDS` (15 s) gra rusza sama. Pod przyciskiem widać, kto już gra, a kto czyta zasady.
- Pola dotykowe co najmniej 48 px (tyle ma `.btn`), a pola gry na czas mają `touch-none select-none` i reagują na `onPointerDown`.
  Wyjątek mają tylko gęste plansze gier turowych (DESIGN §6): pole mniejsze niż 48 px wolno dotknąć, jeśli dotknięcie
  jedynie wybiera pole lub pionek, wybór jest widoczny na planszy, a ruch wysyła osobny przycisk co najmniej 48 px
  z nazwą wyboru (drugie dotknięcie tego samego pola może go zastąpić). Dotknięcie, które od razu wykonuje akcję, nie dostaje wyjątku.
- Ekran partii mieści się na 360×640 bez poziomego przewijania; plansza skaluje się do szerokości, nie ma stałych pikseli.
  Listy poza partią mogą przewijać się pionowo; dolna akcja pozostaje dostępna w `StickyBar`, a edytowane pole
  nie znika pod klawiaturą. Nie jest to ogólny wyjątek dla plansz ani formularzy w trakcie partii.
  Państwa-miasta mają lokalny wyjątek: lista kategorii w formularzu przewija się pionowo z dolną akcją,
  a głosowanie i podsumowanie przewijają odpowiedzi pionowo. Przy 4+ osobach każda kategoria ma graczy
  w wierszach. Bez przewijania w bok, z pełną treścią i celami głosu minimum 48 px.
  Odbiór formularza wymaga fizycznego Androida z klawiaturą (U02); sama symulacja viewportu nie wystarcza.
  Wyniki partii i odsłony rund mogą przewijać się pionowo. Rewanż/Do lobby, akcje solo i przejście
  turnieju pozostają w StickyBar; ostatni wiersz treści musi dać się przewinąć ponad pasek.
  Kampus Tour zachowuje własny układ poziomy: decyzje, poziomy budowy i zamknięcie okna mają
  minimum 48 px mierzone po skalowaniu sceny. Podsumowanie może przewijać treść ze stałymi akcjami;
  otwarty dialog nie dubluje tych samych akcji na planszy.
- Teksty po polsku, krótkie, bez em-dashy, przecinek dziesiętny („10,00 s”), te same słowa co w innych grach
  („Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”).
- Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`.
- Tylko ciemny motyw.

## 5. Spójność animacji i wibracji

Animacja ma pokazać, **co się właśnie stało**, a nie ozdabiać. Stan zawsze przychodzi z serwera od razu,
animacja tylko go dogania na ekranie.

- **Mechanizm**: keyframes w `index.css` z komentarzem, do czego służą, użyte przez `animate-[nazwa_czas_easing]`.
  Zmiany stanu (kolor, obwódka) przez `transition-colors`. Nowej biblioteki nie dodajemy.
- **Najpierw istniejące**: ta sama sytuacja w nowej grze używa tej samej animacji z katalogu. Katalog to wszystkie keyframes z `index.css`;
  test `apps/web/src/animations.test.ts` pilnuje, żeby każda nazwa miała definicję, komentarz i wiersz tutaj, a każdy użyty czas był w kolumnie „Czasy”.

  | Keyframes | Rola | Czasy |
  |---|---|---|
  | `stone-pop` | coś pojawia się na planszy (kamień, strzał, ścianka, karta Memory, znacznik, nowa wygrana) | `0.35s` standard; `180ms` działanie W pamięci (wyjątek: pokaz co 1,5 s) |
  | `ring-pulse` | to można wybrać (pionek, karta, „Jeszcze raz” po prośbie innych), w pętli | `1.2s` |
  | `dice-tumble` | rzut kośćmi, pętla na czas pokazu rzutu | `0.3s` |
  | `card-in` | karta lub okno na środku ekranu (Karta Dziekanatu, oferty, podsumowanie) | `0.35s` |
  | `float-up` | zmiana liczby (kwota, „+1”, punkty Balonu i Wieży) | `1.6s` |
  | `float-still` | zamiennik `float-up` przy `prefers-reduced-motion`: bez ruchu, gaśnie | `1.6s` |
  | `set-glow` | świeże osiągnięcie: komplet wielu różnych pól (grupa w Kampus Tour), „Nowy rekord!”; para Memory to `stone-pop`, 4 powtórzenia | `0.9s` |
  | `preview-half` | podgląd na ekranie instrukcji: element widać przez pół cyklu; kolejność z ujemnego `animation-delay` | `1s`, `2s`, `2.4s`, `3s` |
  | `preview-quarter` | podgląd na ekranie instrukcji: element widać przez ćwierć cyklu (cztery kroki) | `2.4s`, `4s` |
  | `line-draw` | linia rysuje się od początku do końca (zwycięska piątka; pętla w podglądzie koła) | `0.5s` Gomoku; `2.5s` podgląd Narysuj koło |
  | `title-pop` | „Wygrywasz!” w nagłówku gry (też Kampus Tour), tylko u zwycięzcy; przegrany i remis bez animacji, jedyny tytuł z animacją | `0.5s` |
  | `tile-hit` | trafienie: zielony błysk kafelka | `0.35s` |
  | `tile-miss` | pomyłka: czerwony błysk z potrząśnięciem | `0.35s` |
  | `piece-fall` | ucięty kawałek klocka Wieży spada po wyniku | `0.5s` |
  | `shake` | ruch zignorowany bez kary: potrząśnięcie bez koloru (Środek, Nożyczki) | `0.3s` |

  `card-in` (okno) i `stone-pop` (element planszy) to różne sytuacje; „showtime” nie jest nazwą animacji.
- **Czasy**:

  | Co | Czas |
  |---|---|
  | reakcja na dotyk (kolor, podświetlenie) | 100 ms |
  | przycisk, przejście stanu | 180 ms |
  | krok pionka po planszy | 180-220 ms na pole |
  | pojawienie się elementu lub karty | 350 ms, `ease-out` |
  | rzut kośćmi | 700 ms |
  | pływająca liczba | 1,6 s |
  | świeże osiągnięcie (`set-glow`) | 0,9 s × 4 |
  | pętla „to można wybrać” (`ring-pulse`) | 1,2 s |
  | pasek czasu | przejście szerokości `linear` równe krokowi odświeżania (`TICK_MS` 250 ms), z zegara, nie jednym długim przejściem |
  | pojawienie w pokazie na czas (W pamięci) | 180 ms (wyjątek: działanie co 1,5 s) |
  | Szybki Chińczyk: krok pionka i rzut | 110 ms na pole, 400 ms (wyjątek: tryb na 20 s tury) |

  Czekanie na rywala jest spokojne: nieruchoma kropka w kolorze gracza i tekst, bez `animate-pulse`/`animate-ping` z Tailwinda
  (ekran nie miga, DESIGN §1). Ostatnie 10 s limitu pokazuje sam kolor `warning`. Każde przejście Tailwinda ma jawny czas
  (`duration-180` dla stanu, `duration-100` dla reakcji na dotyk); test `animations.test.ts` to sprawdza.

- **Animacja nie blokuje gry.** Przyciski działają w trakcie, kolejny stan z serwera przerywa poprzednią animację,
  a przy dużym skoku (odświeżenie, powrót do karty) element od razu ląduje na miejscu.
  Kampus Tour: pierwsze dotknięcie podczas turlania lub marszu kończy pokaz do pozycji serwera,
  bez wysyłania ruchu. Kolejne dotknięcie wybiera decyzję. Nowa wiadomość przerywa stary pokaz,
  limit tury biegnie niezależnie. Karta i MPK przestawiają pionek bez udawanego rzutu kośćmi.
  Chińczyk tak samo: pierwsze dotknięcie planszy albo dolnego paska w trakcie turlania lub marszu kończy pokaz
  (bez ruchu i bez wyboru pionka spod palca), kolejne wybiera pionek. Nowy rzut albo ruch zaczyna pokaz od poprzedniego
  widoku serwera, bez zaległej kolejki; wibracja zbicia przychodzi raz, gdy pokaz dojdzie do końca albo zostanie zastąpiony.
  Wyjątek: Statki po pudle trzymają stary układ plansz przez 1,2 s (`SWAP_MS`), zanim plansze się zamienią i pojawi się
  przycisk strzału; bez tego broniący nie widział, gdzie padł strzał.
- **Kroki sekwencyjne** (pionek idzie pole po polu) to stan „pokazywany” goniący stan „docelowy” w `setTimeout`,
  ze stałymi `STEP_MS` i `ROLL_MS` na górze pliku (wzór: `useShow` w `Chinczyk.tsx`).
- **`prefers-reduced-motion`**: reguła globalna w `index.css` wyłącza animacje CSS, a każda animacja sterowana z JS
  sprawdza `reducedMotion` i przeskakuje do stanu końcowego. Wyjątki:
  - **ruch będący zadaniem** (Kubki, Śledzenie, Wieża, Za zasłoną) zostaje: idzie z `requestAnimationFrame` wprost w DOM,
    z tym samym czasem i torem, bo bez niego nie ma czego śledzić ani mierzyć; dekoracje wokół niego znikają,
  - **pływająca liczba** (`float-up`, kończy na `opacity: 0`) zamienia się w `float-still`: stoi i gaśnie w tym samym 1,6 s,
    więc werdykt Wieży, punkty Balonu i kwoty są czytelne bez ruchu,
  - **podgląd na ekranie instrukcji**: zostaje klatka bazowa, czyli pierwsza klatka jest bazowo widoczna, a kolejne mają
    `opacity-0` i pojawiają się tylko przez `animation-delay`, więc bez animacji podgląd pokazuje czytelny pierwszy krok.
- **Pomiar czasu nigdy nie zależy od animacji.** W grach na refleks bodziec pojawia się bez przejścia.
- **Odsłona prawdy od razu, bez animacji** (Mapa, Odcień, Policz kropki, Kąt, Który rok?, Środek, Tort, Nożyczki): cały czas odsłony z zasad
  jest na odczyt, nic nie wskakuje. Tak samo odsłonięta litera Kalamburów pojawia się bez animacji (wyjątek od `stone-pop` dla nowego elementu).
- **Zastany stan pokazujemy od razu**: po wejściu, odświeżeniu albo reconnect kamienie, strzały, ścianki i pary stoją bez animacji
  (`useFresh` w ui.tsx); pojawienie (`stone-pop`) dostaje tylko element nowy od pierwszego otrzymanego stanu, a szkoda od rywala nie wibruje ponownie.
- **Werdykt rundy żyje dłużej niż przerwa**: pływająca liczba Balonu gra pełne 1,6 s, choć następny balon pojawia się po 0,8 s.
  Zaliczona runda w grze do pomyłki (W pamięci) to krótki `tile-hit` kafla, bez wibracji i bez wydłużania przerwy.
- **Zaznaczenie w polu gry na czas** (Dziesiątki, Sudoku, Zakupy) pojawia się od razu, bez przejścia, jak bodziec:
  pierścień 2 px w kolorze gracza i `aria-pressed`.
- **Okno otwierane dotknięciem** (szczegóły pola w Kampus Tour) pojawia się od razu; `card-in` jest tylko dla okna albo karty, które otwiera stan gry.
- **Błysk trafienia** (`tile-hit`) w quizach błyska na liczniku trafień (albo punktów), bo po trafieniu od razu jest nowe pytanie
  i błysk trafiłby w przypadkowy przycisk. Poza tym błysk dotyczy miejsca dokonanej odpowiedzi; błysk pomyłki zostaje na dotkniętym przycisku, bo pytanie stoi przez blokadę.
- **Wibracje zamiast dźwięku**, zawsze `navigator.vibrate?.(...)`:

  | Zdarzenie | Wzór |
  |---|---|
  | moja nowa decyzja: tura albo nowa faza, w której gram (robi to `Game.tsx` z `decisionKey`, gra tego nie powtarza) | 40 |
  | pomyłka: rzeczywisty błąd, także falstart w Refleksie i złe pole w Sekwencji | 60 |
  | coś złego dla mnie od innego gracza: zbity pionek, trafienie mojej floty, wykupienie mojego pola, STOP w Państwach-miastach | [60, 40, 60] |
  | uderzenie metronomu w Rytmie (część bodźca, nie informacja zwrotna) | 30 |
  | ruch zignorowany bez kary (Środek, Nożyczki, Koło): `shake` 300 ms i krótki powód | bez wibracji |
  | legalne pudło w grze turowej (Statki, Memory, Kalambury) | bez wibracji |

  Poprawne trafienie nie wibruje. Wzory są w `VIBRATE` (`apps/web/src/vibrate.ts`), gry nie wpisują własnych liczb.
  Szkoda od rywala wibruje raz na zdarzenie u poszkodowanego (`useHarm`); zdarzenie zastane po wejściu albo odświeżeniu nie wibruje.
  Kalambury: połowa rysowania nie jest nową decyzją (nie wolno jej zdradzić), rysujący decyduje od wyboru hasła, zgadujący od wejścia w rysowanie.
  Za zasłoną: dotknięcie przed zniknięciem kulki jest po prostu ignorowane, bez shake i tekstu (zasady gry, nie pomyłka).

## 6. Podpięcie i odbiór

Podpięcie, w tej kolejności:
1. sekcja i wiersz tabeli w `ZASADY-GIER.md` (krok 1),
2. `packages/games/src/<id>.test.ts` (krok 2),
3. `packages/games/src/<id>.ts`, wpis w `GAMES` i eksport typu `View` oraz stałych w `index.ts`,
4. `apps/web/src/games/<Gra>.tsx`,
5. gałąź w `screens/Game.tsx` (mini-gra: `key` z wyzwania i wpis w `MINI_GAMES`), ikona w `ICONS` w `screens/Lobby.tsx`,
   mini-gra: `record` w definicji (trzeci argument `ranked`; z `tie`, jeśli komparator ma drugie kryterium), przypadek w `RECORDS` w `index.test.ts` i jednostka w `FORMAT` w `screens/Records.tsx`,
6. opis w `KONCEPT.md` (sekcja 2 i tabela etapów).

Po zmianie w `packages/games` serwer deweloperski trzeba zrestartować.

Gra jest gotowa, gdy w `/dev` (`/dev?n=...` dla większej liczby graczy) przeszło wszystko poniżej:
- [ ] `pnpm test` i `pnpm typecheck` bez błędów,
- [ ] pełna partia przy minimalnej i maksymalnej liczbie graczy, plus jeden obserwator,
- [ ] odświeżenie strony w każdej fazie,
- [ ] dobiegnięcie limitu tury w każdej fazie,
- [ ] wyjście gracza w trakcie (walkower),
- [ ] remis, rewanż i powrót do lobby,
- [ ] wynik w rankingu na stronie głównej (mini-gra: na ekranie „Rekordy” i w panelu po partii),
- [ ] ekran 360×640, w wiadomościach WebSocket nie ma ukrytych danych,
- [ ] punkty z sekcji 3, 4 i 5 tego pliku.

# Podróbka: plan gry v1

Data: 2026-11-05. Status: propozycja do akceptacji, bez implementacji.
Źródła: `KONCEPT.md`, `ZASADY.md`, `DESIGN.md`; wzorzec faz i szkiców:
`packages/games/src/panstwa-miasta.ts` i `apps/web/src/games/PanstwaMiasta.tsx`.
Plan jest osobnym zadaniem po audycie; nie otwiera ponownie zakończonych faz 1–5.
Po akceptacji zasady trafią do `ZASADY-GIER.md`, a opis do `KONCEPT.md`.

## 1. Pomysł i zakres

Gra główna `podrobka`, nazwa „Podróbka”, 3–6 graczy, 6 rund, jeden zestaw zasad.
Każdy odpowiada na prywatne pytanie. Jedna losowa osoba dostaje inne, ale podobne pytanie.
Podczas pisania nikt nie dostaje informacji o swojej roli. Po ujawnieniu pytania większości
i wszystkich odpowiedzi gracze próbują wskazać Podróbkę, a ona stara się odwrócić podejrzenia.

Przykład: większość widzi „Ile razy w tygodniu jesz poza domem?”, Podróbka
„Ile razy w tygodniu zamawiasz jedzenie?”. Odpowiedzi mają wspólny format i nakładające się
zakresy, więc samo pytanie nie powinno z góry rozstrzygać głosowania.

Najlepiej działa ze znajomymi przy stole albo na zewnętrznej rozmowie głosowej.
Bez rozmowy można głosować na podstawie odpowiedzi, lecz odpada możliwość słownej obrony.
Pierwsza wersja nie zawiera czatu, połączeń głosowych, własnych pytań, AI, drużyn,
trybów, eliminacji ani integracji z turniejem mini-gier. Bez nowych zależności.

## 2. Losowanie

- W każdej rundzie dokładnie jedna Podróbka, wybierana jednakowo prawdopodobnie spośród graczy.
- Losowania ról są niezależne. Można dostać rolę ponownie lub ani razu w partii.
  Celowo nie ma publicznej rotacji ani zasady „każdy raz”, która zdradzałaby późniejsze role.
  To kompromis: równe prawdopodobieństwo na początku, ale nie równa liczba okazji w każdej partii.
- Serwer tasuje pulę par przez `shuffle` z `core.ts`; sześć par bez powtórzeń w partii.
  Dla każdej pary losuje też kierunek: które pytanie otrzyma większość.
- Wyłącznie przekazane `rng`; bez czasu systemowego i losowości klienta w zasadach.
- Kolejność wyświetlania graczy pozostaje zgodna z `players`; nikt nie zaczyna osobnej tury.
- Nowa partia ma `nonce`, a każda wiadomość ruchu numer rundy. Stary ruch nie przejdzie
  do nowej rundy ani rewanżu. Powtórka tego samego seeda daje ten sam stan.

## 3. Fazy i limity

Stałe: `ROUNDS = 6`, `WRITE_SECONDS = 30`, `VOTE_SECONDS = 60`,
`SUMMARY_SECONDS = 15`, `ANSWER_MAX = 30`, `DRAFT_MS = 500`.
Limity liczy serwer od wejścia w fazę. Szkic, odpowiedź ani głos nie odnawiają czasu.
Klucz `turn()` to partia, runda i faza. Po końcu `waitingFor = []`, limit 0.

### A. Odpowiedzi (`write`, 30 s)

- Każdy widzi tylko swoje pytanie, pojedyncze pole odpowiedzi i „Gotowe”.
  Wspólny komunikat: „Odpowiedz na swoje pytanie. Jedna osoba dostała inne.”
- Odpowiedź jest krótkim tekstem, do 30 jednostek UTF-16, tak jak walidacja Zod i `maxLength`.
  Serwer usuwa zewnętrzne białe znaki i sprowadza ciągi białych znaków do pojedynczej spacji.
  Zachowuje polskie litery i wielkość liter; nie ocenia prawdziwości odpowiedzi.
- Szkic idzie na serwer co najwyżej co 500 ms przy zmianie. „Gotowe” wysyła aktualny tekst,
  nie czeka na zapis szkicu, anuluje zaległe wysyłki i blokuje dalszą edycję po przyjęciu.
- Klient nie może zatwierdzić pustej odpowiedzi. Szkic może być pusty.
- Po czasie serwer zatwierdza ostatni zapisany szkic. Puste zatwierdzenie jest dozwolone
  wyłącznie przy `context.source === "timeout"`; klient nie może podszyć się pod tę ścieżkę.
- Po wszystkich odpowiedziach przejście do głosowania. Jeżeli choć jedna odpowiedź jest
  pusta, runda jest anulowana: wszyscy 0 pkt, bez głosowania, przejście do odsłony.
  Runda zużywa jedno z sześciu miejsc. Powód jest jawny („Brak odpowiedzi: …”).
  Zapobiega to zarabianiu punktów na nieobecności; kosztem jest możliwość zepsucia rundy
  przez bezczynnego gracza. Nie dodajemy osobnego systemu kar do prywatnej gry.
- Po wysłaniu widać własne pytanie i odpowiedź oraz „Czekamy na: …”.

### B. Odpowiedzi i tajne głosowanie (`vote`, 60 s)

- Wszyscy, także obserwator, widzą pytanie większości oraz odpowiedzi podpisane nickami.
  Uczestnik może dodatkowo sprawdzić swoje wcześniejsze pytanie. Pytanie Podróbki
  nie jest jeszcze publiczne. W tej chwili sama rozpoznaje swoją sytuację.
- To wspólny czas na rozmowę i wybór. Nie ma osobnego, obowiązkowego odliczania dyskusji.
  W instrukcji prosimy, by w rozmowie bronić odpowiedzi, a nie cytować prywatne pytanie.
- Każdy, również Podróbka, wskazuje jednego innego gracza. Wybór lokalny można zmieniać
  do „Gotowe”; zatwierdzony głos jest nieodwołalny.
- Nie wolno głosować na siebie, obserwatora ani id spoza partii. Głosy nie są widoczne
  dla pozostałych aż do odsłony; jawne jest tylko, kto już zagłosował.
- Po czasie brak głosu oznacza wstrzymanie (`target: null`), bez losowania oskarżenia.
  Taki ruch zatwierdza tylko serwer w kontekście timeoutu. Niezatwierdzony wybór lokalny
  nie jest głosem. Po wszystkich decyzjach natychmiast następuje odsłona.

### C. Odsłona (`summary`, 15 s)

- Pokazujemy oba pytania, Podróbkę, wszystkie odpowiedzi i głosy, przyrost punktów oraz sumy.
- Podróbka zostaje wykryta, gdy otrzymała **samodzielnie najwięcej głosów i co najmniej dwa**.
  Nie potrzeba większości bezwzględnej. Remis na prowadzeniu oznacza niewykrycie,
  bez dogrywki. Gdy najwięcej głosów dostała inna osoba, Podróbka również uciekła.
- Zwykły gracz dostaje **2 pkt za własny trafny głos**, również gdy grupa nie wykryła Podróbki.
- Podróbka dostaje **3 pkt za uniknięcie wykrycia**, pod warunkiem oddania własnego głosu.
  Gdy została wykryta albo nie zagłosowała, dostaje 0 pkt. Jej głos wpływa na wynik
  oskarżenia, ale nie daje punktów za wskazanie innej osoby.
- Pozostali dostają 0 pkt. Wstrzymanie nie daje punktów; wszyscy bez głosu to 0 pkt dla wszystkich.
- Punktacja jest liczona raz, przy wejściu w odsłonę, a nie przy „Dalej”.
- „Dalej” od wszystkich albo timeout każdego oczekującego otwiera kolejną rundę.
  Ostatnia runda przechodzi bezpośrednio do `over`, gdzie jej odsłona pozostaje widoczna
  bez limitu. Dlatego limit partii to `6 × (30 + 60) + 5 × 15 = 615 s` (10 min 15 s),
  z pominięciem opóźnień sieci i pracy serwera. Partie mogą być dużo krótsze.

### Koniec

- Wygrywa największa suma. Równe sumy to wspólne miejsce, również na dalszych pozycjach.
  Remis na pierwszym nie przyznaje zwycięstwa; bez rozstrzygania szybkością czy rolą.
- Pełny ranking, tabela punktów z sześciu rund i rozwijana historia odsłon.
  Punktacja mieści się w 0–18 na gracza; anulowane rundy mają oznaczenie, nie tylko zero.
- Wygrana trafia do istniejących statystyk gier głównych pod `podrobka`.
  Brak `record`, rekordów solo i wyzwania dnia.

## 4. Pytania

Pierwsze wydanie: 60 ręcznie przygotowanych par; w każdej dwa pytania, wspólna wskazówka
formatu odpowiedzi i stabilne id. Pytanie do 90 jednostek UTF-16, wskazówka do 30.
Po 20 par liczbowych, o przedmiotach/jedzeniu i o miejscach/codziennych sytuacjach.
Kategorie pomagają redakcji, nie są osobnymi trybami i nie są wysyłane jako wskazówka roli.

Przykłady do przetestowania przy stole, nie gotowa pula:

| Pytanie A | Pytanie B | Format |
|---|---|---|
| Ile razy w tygodniu jesz poza domem? | Ile razy w tygodniu zamawiasz jedzenie? | Liczba |
| Co najchętniej jesz na śniadanie? | Co najchętniej jesz na kolację? | Nazwa potrawy |
| Co zabierasz na plażę? | Co zabierasz na basen? | Jedna rzecz |
| Gdzie poszedłbyś na pierwszą randkę? | Gdzie spotkałbyś dawnego znajomego? | Jedno miejsce |

Przegląd każdej pary: oba kierunki grywalne, odpowiedzi tego samego rodzaju, realne nakładanie
się odpowiedzi, bez oczywistego ujawnienia roli przez jednostkę, gramatykę lub rząd wielkości.
Pytania proste, bez wiedzy encyklopedycznej i potrzeby ujawniania wrażliwych szczegółów.
Pary zbyt podobne dają losowe głosowanie, zbyt różne dają automatyczne wykrycie: to trzeba
ocenić w grze z ludźmi. Test automatyczny sprawdzi strukturę, długości i unikalność, nie humor ani balans.

## 5. Stan, ruchy i prywatność

Osobne typy `State` i `View`. Stan serwera: gracze, nonce, wybrane pary i role, runda,
faza, szkice, zatwierdzenia, głosy, gotowość do następnej rundy, sumy i historia odsłon.
Widok budowany z jawnej listy dozwolonych pól, bez rozlewania pełnego `State` i późniejszego kasowania.

Ruchy: `write { nonce, round, answer, done }`, `vote { nonce, round, target }`,
`next { nonce, round }`. Schematy Zod w `packages/games`, semantyka w `validateMove`.
`waitingFor` obejmuje tylko osoby bez zatwierdzenia danej fazy, a szkice nie zmieniają listy.
Zmiany stanu niemutujące, wszystkie dane zwykłym JSON. Zliczanie remisów przez istniejące
`rankResults` i `rankPlaces`, `GameResult.places` zgodne z ekranem.

| Faza | Uczestnik | Obserwator |
|---|---|---|
| write | swoje pytanie, szkic, potwierdzenie; publiczne punkty i gotowość | numer rundy, punkty i gotowość, bez pytań i szkiców |
| vote | pytanie większości, wszystkie odpowiedzi, swoje wcześniejsze pytanie i własny głos | pytanie większości, odpowiedzi i gotowość, bez głosów |
| summary / over | oba pytania, rola, głosy, wyniki ukończonej rundy | ten sam publiczny wynik |

Historia już odsłoniętych rund jest publiczna. Żaden widok nie zawiera przyszłych par, ról,
seeda, id bieżącej pary ani indeksu wariantu, który zdradzałby przypisanie.
Testujemy też gracza spoza partii jako obserwatora. Klient dostaje tylko tekst potrzebnego pytania.

Repo współdzieli rejestr zasad z frontendem, więc statycznej puli pytań nie uznajemy za sekret
ani zabezpieczenie przed sprawdzaniem par w kodzie. Gwarancja v1 dotyczy niewysyłania tajnego
przydziału, cudzych szkiców i głosów. Powtarzanie pytań między partiami i zapamiętywanie par
pozostaje ograniczeniem tej mechaniki; ukrywanie banku wymagałoby osobnego zakresu architektury.

Odświeżenie przywraca zapisany szkic lub zatwierdzoną odpowiedź/głos i ten sam termin fazy.
Niewysłane ostatnie znaki szkicu mogą przepaść; interfejs nie obiecuje ich zapisania.
Rewanż resetuje stan lokalny przez `nonce`; zmiana rundy usuwa zaległy debounce.
Rozłączenia i trwałe wyjście obsługuje istniejąca platforma: timeouty działają, a trwałe usunięcie
gracza przerywa partię według `KONCEPT.md`. Nie kontynuujemy jej z nowymi rolami po zmianie składu.

## 6. Ekran

- Gra w pionie, wspólna skorupa `Game.tsx`: nagłówek, czas, kropki graczy, połączenie,
  obserwator, wygrana i rewanż. Nie tworzymy drugiego pełnego nagłówka.
- Pisanie: „Runda 2/6”, pytanie, wspólny format odpowiedzi, jedno pole z etykietą,
  licznik długości, „Gotowe”. Podczas oczekiwania własny tekst pozostaje czytelny.
- Głosowanie: pytanie większości, sześć zwartych wierszy odpowiedzi z nickami.
  Dotknięcie cudzego wiersza wybiera podejrzanego, obrys w kolorze gracza, znaczek i
  `aria-pressed`; „Gotowe” zatwierdza. Własny wiersz nieaktywny z wyjaśnieniem.
  Własne wcześniejsze pytanie w rozwijanym szczególe. Po oddaniu głosu odpowiedzi zostają widoczne.
- Odsłona: oba pytania i kto miał inne, wynik oskarżenia z uzasadnieniem remisu,
  punkty oraz „Dalej”. Koniec: ranking i historia; wspólne akcje platformy.
- Pola i akcje co najmniej 48 px. Głosowanie i formularz mieszczą się na 360×640,
  pełne odpowiedzi bez ucinania i bez poziomego scrolla. Sprawdzamy maksymalne długości,
  sześciu graczy, długie nicki i otwartą klawiaturę. Odsłony i historia mogą przewijać się
  pionowo zgodnie z `ZASADY.md`. Jeżeli pomiar wykaże brak miejsca w aktywnej fazie,
  poprawiamy układ przed odbiorem, nie dodajemy niejawnego wyjątku od zasad.
- Tokeny, `.field`, `.tile`, `.btn-player`, `StickyBar`, istniejące tabele wyników.
  Faktyczny stan CSS sprawdzamy przy implementacji; dokumenty mają historyczne adnotacje
  o `.btn-player`, mimo że planowanie audytu odnotowuje zakończenie jej migracji.
- Wybór: istniejące przejście 100/180 ms. Odsłona dostępna od razu; ewentualne `card-in`
  0,35 s, przyrost punktów `float-up` 1,6 s z istniejącym reduced motion i bez powtórki
  animacji po reloadzie. Wibracja nowej decyzji przez wspólny mechanizm, bez dublowania.
  Nietrafiony legalny głos bez dodatkowej wibracji, tak jak legalne pudło w innych grach.

## 7. Kolejność implementacji po akceptacji

1. **Ustalenia i dokumenty**: sekcja i wiersz tabeli `ZASADY-GIER.md`, opis w `KONCEPT.md`;
   przenieść zaakceptowane liczby, punktację, losowanie i przypadki brzegowe.
2. **Testy przed kodem**: `packages/games/src/podrobka.test.ts`, z nagłówkiem zasad,
   oraz testy struktury planowanej puli. Uruchomić i potwierdzić oczekiwany brak implementacji.
   Zgodnie z repo testy zasad wymagają osobnego commitu przed kodem; commit wymaga
   osobnej prośby użytkownika. Akceptacja planu nie upoważnia automatycznie do commitu ani push.
3. **Zasady i dane**: `podrobka.ts`, `podrobka-dane.ts`; małe helpery lokalne do faz,
   zliczania głosów i projekcji. Bez wydzielania wspólnego silnika gier fazowych.
4. **Ekran**: `apps/web/src/games/Podrobka.tsx`, wykorzystanie szkiców z Państw-miast
   jako wzorca, bez przejmowania STOP i oceny kategorii.
5. **Podpięcie**: `packages/games/src/index.ts` (GAMES, View, Move i stałe z `PODROBKA_`),
   `screens/Game.tsx` (render, nonce, SIMULTANEOUS, OWN_RANKING, kolor fazy),
   `screens/Lobby.tsx` (istniejąca ikona Phosphor i opis), `vibrate.ts` tylko jeśli klucz
   nowej decyzji wymaga gałęzi; aktualizacja koniecznych testów kontraktu rejestru.
   Setup, statystyki i transport korzystają z obecnych kontraktów. Nie zakładamy zmian
   bazy, nowych endpointów ani zależności serwera.
6. **Odbiór**: testy, build, przeglądarka, WebSocket, fizyczny telefon i próba z ludźmi.
   Wyniki i otwarte ograniczenia zapisać w notatce odbioru, a status w plikach planowania.

## 8. Testy i warunki ukończenia

Wszystkie wymagane testy z `ZASADY.md` §2, w szczególności:

- Definicja 3–6, 6 rund, początek i koniec; deterministyczne seedy i brak powtórzeń par.
- Role legalne, dokładnie jedna na rundę; brak wymuszonej rotacji; oba kierunki par.
- Schemat każdego ruchu: typy, długości, brak pola, liczby niecałkowite, zły target.
- `validateMove`: osoba spoza gry, zła faza, powtórne zatwierdzenie, własny głos,
  zły nonce/runda, ruch po końcu; granice tekstu, biały tekst i uprawnienia timeoutu.
- Szkic nie kończy pisania, nie odnawia czasu i jest prywatny; ostatnie zatwierdzenie
  zmienia fazę dokładnie raz; po czasie zapisany szkic zostaje odpowiedzią.
- Brak odpowiedzi anuluje rundę, również gdy nie odpowiedziała Podróbka; zero punktów,
  wyjaśnienie i poprawne przejście po szóstej rundzie.
- Wszystkie rozkłady głosów dla 3, 4, 5 i 6 osób: samodzielny lider od 2 głosów,
  remis, lider niewinny, pojedynczy głos, wstrzymania; punktacja osobista niezależna
  od wykrycia grupowego, brak premii dla niegłosującej Podróbki.
- Każdy gracz może wygrać; remisy na górze i dalszych miejscach; tabela zgodna z `places`.
- Każda faza ma legalny `timeoutMove`; komplet timeoutów nie zawiesza partii ani nie
  nalicza punktów ponownie. `turn().key` stały wewnątrz fazy.
- `playerView` osobno dla zwykłego gracza, Podróbki, obserwatora i obcego id w każdej fazie;
  brak sekretów także w historii, publicznych listach gotowości i serializacji JSON.
- `applyMove` nie mutuje wejścia; pełna partia przechodzi round-trip JSON.
- Dane: 60 unikalnych par, różne pytania w parze, długości, kategorie, brak pustych wpisów.

Odbiór integracyjny: pełne partie 3 i 6 graczy plus obserwator; odświeżenie i timeout w każdej
fazie; wysyłka szkicu tuż przed zatwierdzeniem/zmianą rundy; reconnect i trwałe wyjście;
remis, rewanż, lobby, zapis wygranej. Inspekcja rzeczywistych wiadomości WebSocket pod kątem sekretów.
Viewport 360×640, klawiatura i dotyk na fizycznym telefonie, reduced motion, czytelność
pytań i pełnych odpowiedzi. Jeżeli urządzenie nie jest dostępne, odbiór pozostaje jawnie otwarty.

Bramki: `pnpm typecheck && pnpm test`, `pnpm --filter web build`.
Po zmianie zasad sprawdzić restart serwera dev i świeży pokój.
Próba balansu z ludźmi dla 3, 4 i 6 osób: długość rund, czytelność instrukcji,
odsetek wykryć, pary zbyt oczywiste lub nierozróżnialne. Ewentualna korekta reguł:
najpierw dokument i test, potem kod. Punktacja 2/3 jest propozycją startową, nie wynikiem pomiaru.

Warunek zatrzymania: wszystkie zaakceptowane zasady wdrożone i udokumentowane, wymagane
testy i odbiory zaliczone, bez poszerzania zadania o nowe tryby albo przebudowę platformy.

## 9. Decyzje do akceptacji

Plan zakłada: 3–6 osób, 6 rund, nieznaną rolę podczas pisania, niezależne losowanie ról,
limity 30/60/15 s, wykrycie przez samodzielne prowadzenie od dwóch głosów, punktację 2/3,
anulowanie rundy z brakującą odpowiedzią i 60 par pytań. To jedna propozycja do zatwierdzenia.
Przed implementacją obowiązuje akceptacja zgodnie z `AGENTS.md`; ten dokument jej nie zastępuje.

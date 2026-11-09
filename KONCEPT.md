# Kwadrans (games.figielak.dev)

Prywatna platforma z grami multiplayer w przeglądarce, do grania ze znajomymi.
Jedna strona, kod pokoju, każdy gra na swoim telefonie.

Ten plik opisuje platformę: założenia, katalog gier, architekturę i reguły wspólne dla wszystkich gier.
Dokładne zasady każdej gry: `ZASADY-GIER.md`. Proces nowej gry i spójność: `ZASADY.md`. Wygląd: `DESIGN.md`.
Dev i deploy: `README.md`. Stan prac i plan: `.telos/ROADMAP.md`.

## 1. Założenia

- **Do 6 graczy naraz** w pokoju, kilka pokoi równolegle. Limit miejsc zależy od gry
  (Kampus Tour, Chińczyk i Labirynt 2-4, Gomoku i Statki 2, Sabotaż i Podróbka 3-6, nie wystartują z mniejszą liczbą); reszta ogląda.
- **Mobile-first**: telefon w pionie, bez instalacji (PWA z ikoną na ekranie głównym).
- **Bez kont**: gracz wpisuje nick i kod pokoju. Token sesji w `localStorage` pozwala wrócić do gry po odświeżeniu strony.
  Nick jest zapamiętany po pierwszym wpisaniu (ekran główny pokazuje „Grasz jako … · zmień”), tak samo trzy ostatnie pokoje z ostatniej doby do szybkiego powrotu
  (sekcja „Wróć do pokoju”: tylko pokoje, w których było co najmniej 2 graczy i które jeszcze istnieją, sprawdza to `/api/rooms`).
- **Ekran główny**: sekcja „Ze znajomymi” stoi wyżej niż „Sam”, bo najwięcej radości daje gra z innymi (zawsze, także przy wejściu z linku `/?kod=`).
  „Ze znajomymi” łączy „Utwórz pokój” i pole kodu. „Sam” to wyzwanie dnia, do dwóch gier
  dobranych pod rekordy (cudzy rekord, do którego graczowi najbliżej, i własny do obrony), „Losowa gra” i lista wszystkich mini-gier.
  Wypełniony przycisk ekranu jest jeden: „Utwórz pokój”, a po wpisaniu pełnego kodu „Dołącz” („Utwórz pokój” przechodzi wtedy na obrys). „Zagraj” przy wyzwaniu ma zawsze obrys.
  Rankingi wygranych gier głównych i turnieju są na dole ekranu „Rekordy” (puchar w nagłówku); równe wygrane i partie to to samo miejsce.
  Stopka pokazuje aktualną wersję strony i otwiera ekran „Co nowego” z opisem zmian w kolejnych wersjach (`CHANGELOG` w `Changelog.tsx`).
- **Gra solo**: mini-gra z ekranu głównego to po cichu pokój na jedną osobę (`solo` w opcjach tworzenia i w `RoomView`), który od razu startuje grę:
  bez lobby, kodu, wyboru koloru i wpisu w ostatnich pokojach. Po partii „Jeszcze raz” albo „Wyjdź”; wyniki trafiają do tych samych rekordów.
  Pierwsza partia pokazuje instrukcję bez odliczania, a „Jeszcze raz” od razu uruchamia grę bez instrukcji, zawsze po decyzji gracza.
- **Wyzwanie dnia**: jedna mini-gra dziennie, ta sama dla wszystkich (`dailyGame` w core.ts: lista tasowana raz na cykl, więc każda gra wypada raz na tyle dni, ile jest gier;
  dzień zmienia się o polskiej północy, `TZ` w docker-compose). Ranking dnia to najlepsze dzisiejsze wyniki w tej grze z dowolnej partii
  (solo, pokój, turniej), bez limitu prób i bez osobnej tabeli (`/api/daily`). Układ partii jest losowy jak zawsze.
  W rankingach gracza rozpoznaje `nickKey` (bez wielkości liter, polskich znaków i nadmiarowych spacji: „Ala” i „ala” to jedna osoba), pokazywana jest ostatnia pisownia.
- **Koniec wieczoru**: własne wyjście z pokoju po co najmniej dwóch partiach (poza solo) pokazuje zamiast ekranu głównego podsumowanie (`Evening.tsx`): mistrz (przy remisie na szczycie współliderzy),
  tabela, 2-3 tytuły i „Udostępnij” z krótkim tekstem (`shareText`, bez kodu pokoju i grafiki; `navigator.share`, bez niego kopiowanie, bez schowka brak przycisku), potem „Na start”.
  Zerwane połączenie nie ma podsumowania, tylko dotychczasowy komunikat. Ostatni widok pokoju trzyma `App`, serwer bez zmian.
- **Dostęp**: strona publiczna, ale do gry trzeba znać kod pokoju. Brak publicznej listy pokoi.
- **Odporność na słabe Wi-Fi**: automatyczne ponowne łączenie, stan gry zawsze po stronie serwera.
- **Tryb cichy**: domyślnie bez dźwięku (jedyny wyjątek to klik metronomu w Rytmie), ciemny motyw, wibracje zamiast powiadomień, limit czasu na turę.

## 2. Gry

Katalog. Zasady, stałe i limity każdej gry są w `ZASADY-GIER.md` (tabela na początku i sekcja gry); tu tylko to, czym gra jest.

### 2.1 Kampus Tour (klon Business Tour)

Główna gra platformy, 2-4 graczy. Zachowuje rdzeń mechaniki oryginału, ale ma własny motyw i dodatki.
Mechanik można się inspirować, natomiast nazwy, grafiki i logo oryginału nie są kopiowane.

**Motyw:** Politechnika Rzeszowska i Rzeszów. Pola to budynki kampusu, wydziały i znane miejsca w mieście
(np. Rynek, Zamek Lubomirskich, Bulwary nad Wisłokiem, Millenium Hall). Lista pól: `GROUP_DEFS` i `SPECIAL` w `kampus-tour.ts`.

**Rdzeń (jak w oryginale):** plansza 32 pól, dwie kości z dubletem, kupno pól i czynsz, 8 grup kolorów (pory dnia studenta),
rozbudowa do landmarku, wykupienie pola rywala za 2× wartość, wygrana przez bankructwo przeciwników albo monopol.

**Własne dodatki:**
| Oryginał | Kampus Tour |
|---|---|
| Start | **Początek**: premia za przejście |
| Więzienie | **Kolokwium**: tracisz turę albo zdajesz rzutem dubletu |
| Mistrzostwa świata | **Juwenalia**: wybrane własne pole ma czynsz ×2, kolejne Juwenalia ×3, ×4… (jedno pole naraz) |
| Podróż | **Bilet MPK**: przeskok na dowolne pole w następnej turze |
| Karty szansy | **Karty Dziekanatu**: stypendium, warunek, Zaliczenie w pierwszym terminie itp. |

**Długość partii:** maksymalnie około 45 minut; po 20 rundach wygrywa największy majątek. Po partii ekran podsumowania (`KampusSummary.tsx`).

### 2.2 Pozostałe gry główne

| Gra | `id` | Gracze | W skrócie |
|---|---|---|---|
| Gomoku | `piec-w-rzedzie` | 2 | 15×15, pięć w linii; pierwsza gra end-to-end |
| Statki | `statki` | 2 | ukryta plansza rywala, cztery tryby floty, losowe ustawienie z przenoszeniem i obracaniem |
| Chińczyk | `chinczyk` | 2-4 | tryby Klasyczny (pełny ranking) i Szybki |
| Memory | `memory` | 2-6 | wspólna plansza par, układ zna tylko serwer, trzy rozmiary |
| Kalambury | `kalambury` | 2-6 | rysowanie palcem i zgadywanie, limit per faza |
| Labirynt | `labirynt` | 2-4 | Quoridor: krok albo ścianka, tryby 9×9 i 7×7 |
| Sabotaż | `sabotaz` | 3-6 | zakryte stosy, licytacja i odkrywanie od góry, 6 rund bez eliminacji, punkty 2/1/0 |
| Wyprawa | `wyprawa` | 2-6 | wspólny szlak, tajne równoczesne decyzje powrotu, bank i ryzyko drugiego takiego samego zagrożenia, 5 wypraw |
| Podróbka | `podrobka` | 3-6 | prywatne pytania, jedna tajna osoba z innym, podobnym; tajne głosowanie i odsłona, 6 rund, punkty 2/3 |
| Państwa-miasta | `panstwa-miasta` | 2-6 | wszyscy piszą naraz, STOP, głosowanie; limit per faza (`turn()`) |
| Poprawka | (do zrobienia) | 2-6 | gra karciana typu Uno, ukryte ręce, własne karty |

### 2.3 Mini-gry

30 krótkich wyzwań (lista: tabela w `ZASADY-GIER.md`, w kodzie `MINI_GAME_IDS`). 1-6 graczy naraz, każdy gra u siebie to samo wyzwanie
(wylosowane na serwerze), na końcu ranking. Wspólne reguły mini-gier są w sekcji 3 (Mini-gry i rekordy).

### 2.4 Turniej

Seria mini-gier puszczana po kolei w jednym pokoju, 1-6 graczy. To nie jest gra z rejestru `GAMES`: pokój odpala kolejne mini-gry
zwykłym `startMatch` i sumuje punkty (zasady w `turniej.ts` i `ZASADY-GIER.md`). Zwycięzca trafia do rankingu pod `id` `turniej`;
pojedyncze gry zapisują się jak zwykle.

**Szybka seria** (`quickSeries`, główny przycisk w dolnym pasku, tylko gospodarz w lobby) to ten sam turniej o stałej długości `QUICK_SERIES_LENGTH = 5`:
bez ekranu ustawień i bez gotowości gości, grają wszyscy w pokoju (do 6). Pełny Turniej z ustawieniami zostaje.

## 3. Architektura

```
Telefon (PWA, React)  ⇄  WebSocket  ⇄  Serwer Colyseus (Node)
                                          │
                                          ├─ logika gier (czyste funkcje TS)
                                          └─ SQLite (ranking wygranych i rekordy mini-gier po nicku; stan pokoi w pamięci)
```

**Zasada:** serwer jest jedynym źródłem prawdy. Klient wysyła intencje („rzucam kośćmi”),
serwer je waliduje, losuje, liczy nowy stan i rozsyła każdemu graczowi jego widok.
Jawny wyjątek: kanał `live` przenosi dekoracyjną liczbę zgłaszaną przez klienta. Nie trafia do `validateMove`,
nie zmienia stanu zasad, wyników ani rekordów; serwer sprawdza tylko dostęp, format i limit wysyłki.

### Interfejs gry

Każda gra to moduł niezależny od sieci i UI:

```ts
// packages/games/src/core.ts
type MoveContext = { source: "client" | "timeout" };

interface GameDefinition<State, Move> {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  moveSchema: z.ZodType<Move>;          // kształt ruchu z sieci; reguły sprawdza validateMove
  modes?: { id: string; name: string; hint: string; default?: boolean }[]; // tryby do wyboru w lobby
  setup(players: PlayerId[], rng: Rng, mode?: string): State;
  validateMove(state: State, player: PlayerId, move: Move, context?: MoveContext): boolean;
  applyMove(state: State, player: PlayerId, move: Move, rng: Rng): State;
  playerView(state: State, player: PlayerId): unknown; // ukrywanie informacji; obserwator dostaje ""
  isOver(state: State): { winner?: PlayerId; ranking?: PlayerId[]; places?: Record<PlayerId, number> } | null; // places: równe dalsze miejsca (Szybki Chińczyk)
  places?(state: State): Record<PlayerId, number>; // mini-gry i gry główne z remisami: miejsca po końcu (od 1, remis = to samo); punkty turnieju
  waitingFor(state: State): PlayerId[]; // jedna osoba albo kilka w fazie równoczesnej; [] po końcu
  turnSeconds?: number;                 // limit tury
  turn?(state: State): { key: string; seconds: number }; // limit zależny od fazy, licznik od nowa przy zmianie key
  timeoutMove?(state: State, player: PlayerId, rng: Rng): Move;  // ruch za gracza po limicie
  live?: { kind: "score" | "round" | "survival"; total?: number }; // dekoracyjny podgląd rywali, total dla round
  record?: { lower: boolean; score(state, player): number; tie?: { lower: boolean; score(state, player): number } }; // mini-gry: wynik do rankingu rekordów i drugie kryterium
}
```

Rejestr gier: `GAMES` w `packages/games/src/index.ts`; `MINI_GAME_IDS` (gry z `minPlayers: 1`) to jedyna lista mini-gier, z której biorą lobby, ekran gry, rekordy i turniej. Wiadomości pokoju: `ROOM_MESSAGES` w `lobby.ts`.
Kontekst `validateMove` pochodzi z miejsca wywołania w serwerze: wiadomość gracza ma `source: "client"`,
ruch zegara `source: "timeout"`. Brak kontekstu oznacza klienta, więc wywołania z trzema argumentami pozostają poprawne.
Kontekst nie jest częścią ruchu ani JSON klienta; pole `source` przesłane przez klienta nie daje uprawnień timeoutu.
Każdy ruch po limicie nadal przechodzi przez `validateMove`. Podpowiedź `hint` Kalamburów jest dozwolona tylko z kontekstem timeoutu.
Serwer przekazuje gotowe miejsca po partii w `RoomView.game.places`: przy wyniku z `ranking` bierze najpierw `result.places`,
potem `def.places(state)`, a gdy obu brak, zwraca `null`. W trakcie partii i po zakończeniu bez rankingu (np. walkowerze)
również zwraca `null`. Miejsca uwzględniają remisy, nie zmieniają zwycięzcy ani punktacji. Poza mini-grami `places` mają
Memory, Kalambury, Państwa-miasta, Kampus Tour i Gomoku (pełna plansza bez wygranej: obaj na pierwszym miejscu).
Wspólne pomocnicze w `core.ts`: `createRng` (mulberry32), `roomCode`, `rankResults`, `rankPlaces`, `ranked`, `byCompletion` (ukończenie przed timeoutem), `shuffle`, `average`, `byHitsThenAverage`, `byScoreThenAverage`,
`normalize`, `nickKey`, `initials` (inicjały na kropkach graczy), `standing`, `compareRecords`, `soloState`, `dailyGame`, `withSum` (losowanie o stałej sumie, żeby każda partia miała tyle samo do zdobycia).

### Reguły platformy (obowiązują każdą grę)

- **Pamięć wieczoru** żyje w pokoju do jego zamknięcia, bez zapisu do SQLite. Każda ukończona partia z co najmniej dwoma
  grającymi, także pojedyncza gra turnieju, daje punkty przez `gamePoints`: po jednym za każdego ze ściśle gorszym miejscem.
  Remisujący dostają tyle samo; partia przerwana, walkower, solo i jeden grający nie dają wpisu.
  Miejsca bierzemy z miejsc wyniku lub definicji gry, potem z kolejności rankingu; przy samym zwycięzcy reszta dzieli drugie miejsce.
  Osoby rozpoznaje `nickKey`, więc wyjście i powrót zachowują punkty; pokazywana jest ostatnia pisownia nicku.
  Tabela zachowuje także osoby, które wyszły, i sortuje po punktach, potem samodzielnych wygranych, jak turniej.
  Po co najmniej dwóch partiach wyliczamy najwyżej trzy tytuły: najwięcej samodzielnych zwycięstw, najlepsza seria kolejnych
  pierwszych miejsc (także remisowych; nieobecność przerywa serię), największy powrót. Powrót to największa strata punktowa
  do ówczesnego lidera, odrobiona przez końcowego lidera tabeli; przy remisie w tabeli bierzemy wszystkich współliderów.
  Brak zwycięstw, pierwszych miejsc albo straty pomija odpowiedni tytuł. Remis o tytuł rozstrzyga kolejność tabeli.
  Punkty wieczoru widać przy wynikach po drugiej partii (`EveningTable`, zwięzła, nie większa od bohatera) i po dotknięciu kropek;
  odznaka na kropce to właśnie te punkty (w turnieju dalej punkty turnieju), `scores` bez zmian.
  `RoomView.evening` niesie tylko liczbę partii, unikalne id rozegranych gier, gotową tabelę i tytuły; historia nie idzie przez sieć.
  Liczba wpisów widoku nie rośnie od kolejnych partii tych samych osób i gier. Dotychczasowe `scores` i ranking wygranych pozostają.
- Po limicie tury serwer wykonuje `timeoutMove` (losowy ruch), nie przegraną. Limit odnawia się tylko,
  gdy zmienia się `waitingFor` (albo `key` z `turn`) lub ten sam gracz ma kolejny ruch.
- Gracze bez miejsca oglądają partię. Nowy gracz dostaje miejsce sam, jeśli gra wybrana i jest wolne.
- Rewanż po zgodzie wszystkich grających, kolejność miejsc rotuje (poza mini-grami, gdzie wszyscy grają naraz); do lobby zabiera wszystkich tylko gospodarz.
- **Głosowanie „Inna gra”**: po partii każdy grający może je rozpocząć (`otherGame`), poza pokojem solo i trwającym turniejem. Serwer losuje do 3 gier (`voteOptions`): bez bieżącej,
  pasujące do liczby `seats`, co najmniej dwie niegrane w tym pokoju (`evening.played`), gdy takie są. Głosują i grają obecne `seats` (`vote: { id }`, liczy się ostatni głos), obserwatorzy tylko oglądają;
  `RoomView.vote` niesie opcje, głosy i `msLeft`. Komplet głosów albo `VOTE_SECONDS = 10` rozstrzyga (`voteWinner`: najwięcej głosów, remis i brak głosów przez `rng`), a wybrana gra rusza w trybie domyślnym
  zwykłym startem z pełną instrukcją; skończony turniej jest wtedy czyszczony. Rewanż w trakcie głosowania jest ignorowany. Wyjście gracza kasuje jego głos i opcje, na które jest już za mało osób;
  gdy nie zostaje żadna, wszyscy wracają do lobby. Gospodarz może zgasić głosowanie przez „Do lobby”.
- W mini-grach (`minPlayers: 1`) przy co najmniej dwóch grających „Start” oznacza gotowość. Komplet gotowości albo upływ 15 s instrukcji
  rozpoczyna wspólne odliczanie 3-2-1; dopiero po nim rusza pełny limit gry. Rewanż skraca instrukcję do 5 s; kolejna gra turnieju ma 15 s.
  Jeden grający czeka bez limitu instrukcji i po „Start” rusza od razu, bez odliczania (także w zwykłym pokoju i turnieju); po godzinie bezczynności pokój jest zamykany.
  Ruchy podczas instrukcji i odliczania są odrzucane. Limit to jeden termin dla całej partii: wynik, `progress` ani próba rywala go nie odnawiają; rewanż i kolejna gra turnieju liczą go od nowa.
- Limit tury: 60 s w większości gier; limity pozostałych w tabeli `ZASADY-GIER.md`. Państwa-miasta i Kalambury mają limit per faza.
- Gdy gracz z miejscem zniknie z pokoju w trakcie partii (wyjdzie sam albo nie wróci w 10 minut), partia się kończy:
  jeśli został jeden gracz, wygrywa walkowerem; przy większej liczbie kończy się bez zwycięzcy.
- Lobby: gospodarz wybiera grę i daje start, goście potwierdzają gotowość albo wskazują, w co chcą grać (`wish`, tylko w lobby, `null` kasuje, jedno życzenie na osobę;
  widać je jako kropkę gracza przy grze, `RoomView.wishes`; start, wybór gry i Szybka seria je czyszczą, wyjście gracza też). Sam w pokoju gracz widzi duży kod; od dwóch osób kod
  zwija się do paska u góry, a gracze to rząd awatarów (kolory rozwija dotknięcie własnego, przy wolnym miejscu „Zaproś”); każdy może zmienić swój kolor
  (poza partią); link `/?kod=ABCD` z przyciskiem udostępniania. Lista w lobby to gry główne oraz kafle „Turniej” i „Mini-gry”.
- Gra główna (`minPlayers > 1`) po wybraniu otwiera u wszystkich ekran gry (`Setup.tsx`): opis, tryb (jeśli gra ma `modes`;
  zmiana trybu kasuje gotowość gości), gracze i start; gospodarz wraca do listy gier przez `pickGame` z `null`.
  Każda gra główna ma kartę „Jak grać” (`howToPlay.ts`, cel, przebieg, punktacja, „Uważaj”): zwijaną sekcję pod opisem na tym ekranie
  i ikonę „?” w nagłówku partii (także dla obserwatora), która otwiera okienko; karta nie otwiera się sama, a czas tury biegnie dalej. Kart nie mają mini-gry (mają `Intro`) ani Turniej.
- Mini-gry mają osobny ekran z listą (`MiniGames.tsx`); otwiera go kafel u gospodarza (lokalnie, bez stanu w pokoju), a goście widzą go,
  gdy gospodarz wybierze grę. Mini-gry mają zasady narzucone z góry, bez trybów.
- Turniej ma ekran ustawień (`TournamentSetup` w `Setup.tsx`): `pickTournament` (gospodarz) ustawia liczbę gier, `markGame` (każdy) zaznacza jedną grę; obie kasują gotowość gości.
  W trakcie turnieju `gameId` to bieżąca gra, a `tournament` w `RoomView` niesie listę gier i punkty; „Dalej” między grami to wiadomość `rematch`.
- **Reakcje**: sześć emotek (`REACTIONS`, wiadomość `react: { index }`) od każdego w pokoju, także obserwatora, w trakcie partii i po niej; serwer rozsyła `react: { id, index }` wszystkim, także nadawcy.
  Osobny limit 1/s, poza limitem 10 wiadomości/s, więc emotki nie zjadają ruchów; bez pełnego `update()`. Grający w mini-grze ma pasek dopiero po oddaniu wyniku, a cudze reakcje widzi po końcu swojego pomiaru.
- Limit 3 pokoi na IP (pokoje gry solo liczone osobno, do 20: wszyscy na jednym Wi-Fi mają jedno IP), rate limit 10 wiadomości/s na klienta. IP pochodzi z `cf-connecting-ip`, a `maxPayload` WebSocket to 32 KB (rysunek Koła do 1000 punktów).

**Platforma (skorupa)** jest wspólna dla wszystkich gier: pokoje z 4-znakowym kodem
(bez mylących znaków typu O/0, I/1), lobby z wyborem gry, nicki i kolory graczy,
reconnect, tablica wyników, rewanż, sprzątanie pokoi po godzinie bezczynności.

### Mini-gry i rekordy

- 1-6 graczy naraz, każdy gra u siebie to samo wyzwanie (wylosowane na serwerze), na końcu ranking.
  Partia toczy się na kliencie (opóźnienie Wi-Fi zepsułoby pomiar), serwer dostaje tylko wynik i odrzuca nierealne wartości.
- Każda mini-gra zaczyna od ekranu instrukcji (`Intro` w ui.tsx: animowany podgląd, trzy punkty z ikonami, „Start”). W pokoju z 2+ grającymi „Start” zgłasza gotowość (`begin`);
  gdy gotowi są wszyscy albo minie 15 s (`INTRO_SECONDS`), serwer uruchamia wspólne 3-2-1 (`COUNTDOWN_SECONDS = 3`).
  Rewanż ma 5 s instrukcji (`REMATCH_INTRO_SECONDS`), kolejna gra turnieju 15 s. W `RoomView.game` podczas odliczania `intro` i `countdown` są `true`,
  a `msLeft` to czas do wspólnego startu. Po odliczaniu oba pola są `false` i rusza pełny limit platformy.
  Jeden grający czeka na „Start” bez limitu instrukcji i rusza od razu bez odliczania.
  Tylko rewanż w pokoju `solo` pomija instrukcję: `RoomView.game.skipIntro` jest `true` do `begin`, potem `false`.
  Klient wysyła wtedy `begin` raz i rozpoczyna partię. Odświeżenie przed `begin` zachowuje ten zamiar, a po `begin` nie uruchamia gry samo i nie odnawia jej limitu.
- Każda mini-gra ma jeden typ ruchu `result` (Narysuj koło wysyła go po każdej próbie, Tabela Schultego, Sudoku, Policz kropki, Kąt, Który rok?, Wieża i Balon mają jeszcze `progress`); ranking liczy wspólne `rankResults` (core.ts), zwycięzca tylko przy 2+ graczach bez remisu;
  `places` podaje miejsca z remisami (oba z jednego komparatora przez `ranked`), z których turniej liczy punkty.
  Kolor liter, Liczenie, Inny element, Obrót i Literówka dzielą `quiz.ts` i `Quiz.tsx` (Dziesiątki biorą z nich walidację i tabelę wyników), a Policz kropki i Kąt ekran `Szacowanie.tsx`. Pasek statystyk w trakcie partii to wspólne `Stats` (ui.tsx). Odświeżenie w trakcie = partia od nowa.

- **Podgląd rywali (`live`)**: mini-gra deklaruje rodzaj w `GameDefinition.live`; brak pola oznacza ciszę podczas pomiaru.
  Klient wysyła `live: { value }` (liczba całkowita 0–9999), a serwer osobnym kanałem przekazuje `live: { id, value }` wszystkim pozostałym w pokoju,
  także obserwatorom. Nadawca nie dostaje własnej wiadomości, nie ma pełnego `update()` ani wiadomości `room` po `live`.
  Własny limit wynosi 2/s na gracza, niezależnie od limitu 10/s dla ruchów; nadmiar przepada. Kanał działa tylko podczas partii z co najmniej dwoma grającymi,
  po instrukcji i odliczaniu, od gracza z miejscem i w grze z polem `live`. Obserwator nie nadaje.
  `RoomView.game.live` zawiera ostatnie wartości dla reconnectu; nowa partia, także rewanż i kolejna gra turnieju, czyści wartości.
  Istniejący `progress` zostaje: Sekwencja, Wieża, Policz kropki, Kąt, Który rok?, Schulte, Sudoku i Balon korzystają z niego,
  bez równoległego wysyłania tej samej rundy kanałem `live`. Wyniki i rekordy nadal pochodzą wyłącznie z normalnych ruchów gry.

  | Rodzaj | Gry | Wartość i liczba etapów (`total`) |
  |---|---|---|
  | `score` (6) | Liczenie, Kolor liter, Inny element, Obrót, Literówka, Dziesiątki | trafienia / punkty, bez `total` |
  | `survival` (5) | Sekwencja, W pamięci, Śledzenie, Trzy kubki, Wieża | ukończona runda / poziom, bez `total` |
  | `round` (13) | Policz kropki, Kąt, Który rok?, Balon, Środek, Mapa, Narysuj koło, Zakupy | etap, po 10 |
  | `round` | Tabela Schultego | znaleziona liczba, 25 |
  | `round` | Sudoku | uzupełnione pole, 10 |
  | `round` | Tort, Nożyczki, Odcień | etap, po 5 |
  | brak (6) | Refleks, Stój!, Stoper, Przytrzymaj, Za zasłoną, Rytm | cisza podczas pomiaru |

- **Rekordy**: po każdej skończonej mini-grze (także solo i w turnieju) serwer zapisuje wynik każdego gracza jako jedną liczbę
  (`record` w `GameDefinition`: `score` i kierunek `lower`) oraz, jeśli gra rozstrzyga remisy drugim kryterium, także je (`tie`: średnia reakcji
  w grach na trafienia i punkty, trafione cele w Śledzeniu, szerokość klocka w Wieży, pęknięte balony w Balonie, czas zaznaczania w Zakupach, odchyłka w rundzie z pomyłką w W pamięci). Ranking gry to najlepszy wynik każdego nicku: główny wynik,
  potem drugie kryterium („12 traf. · 256 ms”; średnia zaokrąglona do ms jak w miejscach partii, brak drugiego kryterium za znanym), a przy całkiem równych wyżej wcześniejszy. Widać go w trzech miejscach: panel po partii (`RecordPanel`: miejsce wszech czasów, „Nowy rekord!” po pobiciu własnego albo „Pierwszy wynik”, awans,
  ile brakuje do osoby wyżej), lista po wybraniu gry i linia „Rekord: …” na ekranie instrukcji, oraz ekran „Rekordy” (`Records.tsx`, z ekranu głównego i z listy mini-gier):
  trzy sekcje: „Twoje rekordy” (gry, w których gracz prowadzi), „Do pobicia” (rekord ma ktoś inny; lider z jasną koroną, własny rekord w kolorze gracza)
  i „Jeszcze nie grane”. Karty gier to akordeon (otwarta jedna naraz); gospodarz w pokoju ma w nich „Pobij” i „Zagraj ponownie”, które wybierają grę na liście mini-gier. Miejsca liczy wspólne `standing` (core.ts), jednostki wyniku trzyma `FORMAT` w `Records.tsx`.
  Lider każdej listy ma własny kafel z koroną. Serwer trzyma też **rekordową partię** każdej gry: stan lidera przycięty do jednego gracza (`soloState` w core.ts,
  gracz pod id `SOLO`, bez id sesji; kolumna `detail`, jedna partia na grę). Ekran „Rekordy” po rozwinięciu gry pobiera ją z `/api/records/:gameId/top`
  i pokazuje zwykłym ekranem końcowym tej gry (`MiniGame.tsx`), np. koło narysowane przez lidera albo jego tabelę rund. Rekordy sprzed tej zmiany partii nie mają.

**Synchronizacja:** stan gry to zwykły obiekt TS. Po każdym ruchu serwer wysyła wiadomość
z `playerView` osobno do każdego gracza, zamiast pełnej synchronizacji Schema z Colyseus.
Prościej i bezpiecznie dla gier z ukrytymi informacjami.

## 4. Stack

| Warstwa | Technologia |
|---|---|
| Język | TypeScript (wszędzie) |
| Monorepo | pnpm workspaces |
| Serwer / pokoje | Colyseus (Node.js) + Express (statyczny frontend, `/api/stats`, `/api/records`, `/api/records/:gameId/top`, `/api/daily`, `/api/rooms`) |
| Walidacja wiadomości | zod (tylko w `packages/games`) |
| Frontend | Vite + React, Tailwind, animacje w CSS (`index.css`) |
| Ikony | Phosphor Icons |
| Plansza | SVG / CSS Grid |
| PWA | manifest + ikony, bez service workera (gra i tak wymaga serwera) |
| Trwałość stanu | SQLite (wbudowany `node:sqlite`) |
| Testy | Vitest |
| CI/CD | GitHub Actions → obraz Dockera |

## 5. Struktura repozytorium

- `packages/games/src/`: `core.ts` (kontrakt, RNG, utilsy), `lobby.ts`, `turniej.ts`, `index.ts` (`GAMES`), płasko `<gra>.ts` + `<gra>.test.ts`.
- `apps/server/src/`: `index.ts`, `LobbyRoom.ts` (pokój Colyseus), `stats.ts` (SQLite i API rekordów).
- `apps/web/src/`: `net.ts` (połączenie, reconnect), `Dev.tsx` (tryb `/dev?n=4`: ramki `/?dev=N` z własnym tokenem i nickiem, tylko w dev), `screens/`, `games/<Gra>.tsx`, `index.css`.

Szczegółowa mapa kodu: `.telos/MAP.md`.

## 6. Hosting

Raspberry Pi w homelabie, kontener Docker (`mem_limit: 256m`) serwuje frontend i WebSockety; `games.figielak.dev` wystawia
Cloudflare Tunnel bez otwierania portów. SQLite w wolumenie objętym backupem homelaba. Plan B: ten sam obraz na Cloud Run
(`max-instances=1`, timeout 60 min, SQLite → Firestore). Szczegóły: `README.md`.

## 7. Bezpieczeństwo i fair play

- Rzuty kośćmi i tasowanie kart tylko na serwerze.
- Walidacja każdego ruchu (czy to tura gracza, czy ruch jest dozwolony, czy stać go na zakup).
- Rate limiting wiadomości i limit liczby pokoi na IP.
- Brak danych osobowych: tylko nick i losowy token sesji.

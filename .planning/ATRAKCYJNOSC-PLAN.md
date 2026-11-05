# Atrakcyjność i „jeszcze jedna partia”: plan v1

2026-11-05. Propozycja do akceptacji, bez implementacji. Źródła: KONCEPT.md, ZASADY.md, DESIGN.md,
przegląd kodu i przejście ekranów na 360×640 z dwoma graczami (`/dev?n=2`, Liczenie).

## 1. Cel

Po partii ludzie mają od razu chcieć następnej, a najwięcej radości ma dawać gra z innymi.
Mierzymy to liczbą partii w jednym pokoju i tym, czy ci sami ludzie wracają w kolejnych dniach.

Pięć źródeł przyjemności, na których opieramy zmiany:

1. **Rywal jest czuć w trakcie**, a nie dopiero w tabeli po końcu.
2. **Finał ma moment**: odsłona wyników, zwycięzca i różnica między wami.
3. **Następna partia jest o jedno dotknięcie**, razem z decyzją „w co teraz”.
4. **Wieczór ma swoją historię**: tabela pokoju, tytuły, odwieczne pojedynki.
5. **Widać własny postęp** i wiadomo, ile brakuje do kolejnego celu.

## 2. Co jest dziś największą przeszkodą

| Ustalenie | Dowód | Skutek |
|---|---|---|
| W 22 z 30 mini-gier rywala w trakcie nie widać | ruch `progress` mają tylko Balon, Kąt, Policz kropki, Sekwencja, Schulte, Który rok?, Sudoku, Wieża; w Liczeniu pierścienie G1/G2 stoją puste do końca | każdy gra sam, a wspólnota zaczyna się na ekranie wyników |
| Każdy startuje kiedy indziej | `Intro.start` w `ui.tsx` odpala grę od razu po własnym „Start”, a kolejni dołączają do 15 s później | nie ma wyścigu, porównanie w trakcie byłoby niesprawiedliwe |
| Wynik wszech czasów przykrywa wynik z kolegami | po partii „Remis” lub „Wygrywa…” to mały nagłówek, a największy tekst ekranu to „1. miejsce” z panelu rekordów; do tego do 4 kolumn i akapit objaśnienia | główna emocja przegrywa z tabelą |
| Zmiana gry to cała ścieżka | „Do lobby” → lista → gra → gotowość gości → „Zagraj” → „Start” | po pierwszej partii rewanż albo koniec; każdy może też jednym dotknięciem zabrać wszystkich do lobby |
| Lobby chowa grę pod ustawieniami | kod, gracze i kolory zajmują większość 640 px, nagłówek „Gry” wypada przy dolnej krawędzi | gość czeka biernie („Czekamy, aż … wybierze grę”) |
| Pokój nie ma pamięci | `scores` liczy tylko wygrane, remisy i miejsca znikają, poza turniejem nie ma tabeli | seria gier nie układa się w historię |
| 30 kafli wygląda tak samo | ikona, nazwa i mono „nie grane” w każdym | trudno mieć ulubioną grę; wybór nie kusi |
| Na ekranie głównym znajomi są drudzy | „Sam” z wypełnionym przyciskiem wyżej, „Utwórz pokój” to obrys przy dolnej krawędzi | ekran zaprasza do gry samemu |
| Solo też ma 15 s na instrukcję | `startMatch` w `LobbyRoom.ts` ustawia ten sam timer | nowy gracz jest poganiany bez powodu |

## 3. Ocena uwag o wyglądzie

| Uwaga | Decyzja | Uzasadnienie |
|---|---|---|
| Jaśniejsze karty i plansze | tak | szkło 55% na prawie czerni i obrys 8% spłaszczają hierarchię; zmiana w tokenach |
| Większe symbole i liczby | tak, ale punktowo | bodźce są już duże (działanie w Liczeniu); za małe są własne punkty, zwycięzca i różnice |
| Charakterystyczne podglądy | tak | podgląd istnieje w każdej grze; na kaflu nieruchoma pierwsza klatka, bo 30 animacji naraz migałoby i obciążało telefon |
| Krótkie reakcje na ważne chwile | tak | wspólny komponent, nigdy w trakcie pomiaru czasu (§5, etap 2) |
| Mniej wersalików mono | tak | `.label` i „nie grane” idą na Satoshi; mono zostaje dla kodów, czasów i wyników |
| Czerwony akcent zostaje | tak | sama zmiana koloru nic nie daje |
| Solo bez automatycznego startu | tak | sam gracz nikogo nie blokuje |

Jedno zastrzeżenie: wyrazistości gier **nie budujemy kolorem kategorii**. Kolor oznacza tu gracza
(niebieski, żółty, zielony, fioletowy, turkusowy, różowy), więc zielone „Refleks” i zielony gracz
mieszałyby się. Tożsamość gry niosą kształt i podgląd.

## 4. Etap 1: wyniki, które mają moment (mały, największy zysk od razu)

- **Bohater po partii** w `Game.tsx`, nad szczegółami gry:

  ```
  Wygrywa Ola                     duży tytuł w jej kolorze
  1. Ola      18 traf.
  2. Ty       16 traf.   o 2 mniej
  3. Bartek   11 traf.
  Do Twojego rekordu zabrakło 1 traf.
  ▸ Szczegóły
  [ Rewanż ]  [ Inna gra ]
  ```

- Jedna główna liczba na gracza i różnica do osoby wyżej. Tabela gry i objaśnienia lądują
  pod „Szczegóły”. Gry z tabelą rund dostają jedną linię najlepszej chwili („Najlepsza runda: Ola, Gdańsk, 4 km”).
- **Odsłona** przy 3+ graczach: od ostatniego do pierwszego, około 0,6 s na wiersz. Dotknięcie kończy pokaz,
  przyciski działają od początku, po odświeżeniu stan stoi od razu (`useFresh`).
- **Panel rekordów składa się do jednej linii**, chyba że padł rekord lub awans. Wtedy pełny panel z `set-glow`.
- **Solo bez licznika instrukcji**: serwer nie ustawia timera, `msLeft: null` już dziś chowa napis w `Intro`.
- **„Jeszcze raz” solo pomija instrukcję** (jedno dotknięcie do kolejnej próby).
- **Ekran główny**: „Ze znajomymi” nad „Sam”, a „Utwórz pokój” jako jedyny wypełniony przycisk (decyzja D1).

Dotyka: `Game.tsx`, nowy wspólny komponent wyników w `ui.tsx`, `Records.tsx`, `Home.tsx`, `LobbyRoom.ts`.
Własne ekrany końcowe 30 gier zostają bez zmian, trafiają tylko do „Szczegółów”, a ekran „Rekordy” dalej ich używa.

## 5. Etap 2: rywalizacja w trakcie partii (największa zmiana odczucia)

### Wspólny start

W pokoju z 2+ osobami „Start” oznacza gotowość. Gdy wszyscy są gotowi albo minie 15 s, serwer daje wspólne 3-2-1
i wszyscy ruszają naraz. Solo startuje od razu jak dotąd. Limit serwera rusza po odliczaniu, więc nie zjada
czasu gry. `Intro` ma już ścieżkę „serwer zamknął instrukcję, gra rusza sama”. Instrukcja po rewanżu: 5 s zamiast 15.

### Podgląd rywali: `live`

Lekka wiadomość pokoju `live`, wysyłana przez `broadcast` do pozostałych, poza stanem gry i poza `validateMove`.
Liczba jest tylko dekoracją: nie wpływa na wynik, a wynik nadal liczy i sprawdza serwer jak dziś.
Oddzielna od pełnego `update()`, żeby Pi nie rozsyłało całego widoku po każdym trafieniu; najwyżej 2 na sekundę od gracza.
Gra deklaruje rodzaj w `GameDefinition` (`live?: "score" | "round" | "survival"`). Istniejący `progress` zostaje.
Gry wysyłają jednym hookiem z kontekstu, bez przeciągania propsów przez `MiniGame`.

| Rodzaj | Gry | Co widać |
|---|---|---|
| Wyścig na punkty (6) | Liczenie, Kolor liter, Inny element, Obrót, Literówka, Dziesiątki | trafienia rywali przy kropkach i miejsce na żywo |
| Przeżycie (5) | Sekwencja, W pamięci, Śledzenie, Trzy kubki, Wieża | runda rywala, „Ola odpada”, „Zostałeś ostatni” |
| Postęp (13) | Policz kropki, Kąt, Który rok?, Schulte, Sudoku, Balon, Środek, Mapa, Tort, Nożyczki, Odcień, Narysuj koło, Zakupy | tylko etap (pierścień), bez punktów, bo te odsłaniałyby informacje; w Balonie wytrzymałość |
| Cisza pomiaru (6) | Refleks, Stój!, Stoper, Przytrzymaj, Za zasłoną, Rytm | w trakcie nic się nie rusza, poza „skończył”; emocje przenosi odsłona po końcu |

Kto skończył, ogląda pozostałych na żywo zamiast samego „gra…”. Obserwator widzi to samo.

### Chwile (`Moment`)

Jeden wspólny, nieklikalny komunikat na górze ekranu (około 1,2 s, najwyżej jeden na 3 s):
zmiana prowadzenia, „Ola odpada”, para w Memory, zatopiony statek, zbicie w Chińczyku, komplet w Kampus Tour, nowy rekord.
W kolorze gracza, którego dotyczy. Nie pojawia się w grach „Cisza pomiaru” w trakcie pomiaru ani u `prefers-reduced-motion` w formie ruchu.
Nowe keyframes wchodzą do katalogu w ZASADY §5 i `animations.test.ts`. Trafienie dalej nie wibruje.

### Reakcje

Sześć emotek pod kropkami graczy (także u obserwatora): szybko unoszą się nad kropką nadawcy. Bez czatu tekstowego,
bez dźwięku. Własny limit jednej reakcji na sekundę, **osobny** od limitu 10 wiadomości, żeby klikanie emotek nie
zjadało ruchów. W grach na czas dostępne dopiero po oddaniu wyniku, u grającego wyświetlane dopiero na końcu pomiaru.
Najbardziej przydadzą się w czasie czekania w grach turowych i po wynikach.

## 6. Etap 3: wieczór w jednym pokoju

- **„Inna gra” zamiast powrotu do lobby**: po partii głosowanie na jedną z 3 wylosowanych gier (mini lub główna pasująca do liczby osób,
  dwie dotąd niegrane w tym pokoju). Każdy dotyka kart, wyniki widać na żywo, 10 s, remis rozstrzyga `rng`. Po wyniku od razu wspólny start.
  „Do lobby” zostaje jako mała akcja gospodarza.
- **Tabela wieczoru**: dla każdej partii w pokoju punkty jak w turnieju (liczba graczy ze ściśle gorszym miejscem), remisujący dostają tyle samo.
  Widoczna przy wynikach i po dotknięciu kropek, odznaka na kropce pokazuje punkty. Wygrane w `scores` dalej zasilają ranking.
- **Szybka seria**: jedno dotknięcie w lobby: 5 losowych mini-gier ze zwykłego `turniej.ts`, bez ekranu ustawień. Pełny Turniej zostaje dla chętnych.
- **Lobby od góry do dołu pod grę**: po dołączeniu drugiej osoby kod zwija się do `TopBar`, kolory do jednej linii,
  a „Szybka seria” i gry wchodzą w pierwszy ekran. Goście mogą dotknąć gry, a gospodarz widzi przy niej ich kropki („chcę w to”).
- **Podsumowanie wieczoru** przy wyjściu: mistrz, tabela i 2-3 tytuły liczone z historii pokoju (najwięcej zwycięstw, najlepsza seria, największy powrót).
  Przycisk udostępnienia wysyła krótki tekst przez `navigator.share`. Bez generowania grafiki.

**Po tym etapie test z ludźmi** (§10). Jego wyniki mogą przesunąć etapy 4-6.

## 7. Etap 4: wybór gry i wygląd

- **Tokeny**: jaśniejsza pełna powierzchnia, nowa `surface-raised` pod plansze i kafle gier, wyraźniejszy obrys.
  Dokładne wartości dobieramy na fizycznym telefonie, kontrast co najmniej 4,5:1 dla tekstu. Zmiana w DESIGN §2 i `index.css`.
- **`.label`**: Satoshi, normalna wielkość liter, bez rozstrzelenia. Mono tylko dla kodów, czasów i wyników (DESIGN §1, ZASADY §4).
- **Kafle z podglądem**: pierwsza klatka `Preview` zamiast ikony, siatka zostaje 3-kolumnowa. Klatka bazowa już działa bez animacji
  (reguła `prefers-reduced-motion`), trzeba tylko wyeksportować `Preview` z 25 plików i dopasować skalę. Podgląd animuje się tylko na wybranym kaflu.
  Znika „nie grane”, zostaje tylko medal lub miejsce.
  **Najpierw pilot na 5 grach**: jeśli pierwsza klatka jest nieczytelna przy około 100 px, ta gra dostaje mały, własny znak zamiast klatki.
- **„Dla was teraz”** nad listą: 3 duże karty z podglądem i powodem („Dawno nie graliście”, „Ola prowadzi o 12 ms”, „Nowa dla Bartka”).
- **Karta gry przed startem** ma duży podgląd, rekord pokoju i pojedynek zamiast tekstu technicznego.
- **Aktualizacja DESIGN §1**: „ciemno i cicho” zostaje, ale jednorazowe, krótkie reakcje na zdarzenie są dozwolone. Stroboskopów i pętli nadal nie ma.

## 8. Etap 5: powroty

Bez kont i powiadomień, wszystko z istniejących tabel `results` i `scores`.

- **Pojedynki**: „Ty : Ola 7:4” w lobby i po partii (wyniki grupowane po `at`, gracze po `nickKey`).
- **Rekord pokoju i znajomych** obok rekordu wszech czasów: rekord globalny szybko staje się nieosiągalny, a bliski cel motywuje.
- **Postęp**: mały wykres ostatnich 10 wyników w grze, „lepiej niż 8 z 10 twoich partii”, odznaczone kolejne progi. Wymaga nowego endpointu historii po nicku.
- **Seria dni wyzwania** bez kary: jeden opuszczony dzień w tygodniu nie zeruje serii, a po przerwie widać łączną liczbę dni, bez komunikatów o stracie.
- **Wspólny układ wyzwania i wynik do udostępnienia** (D5): ten sam seed dla wszystkich tego dnia, do rankingu idzie **pierwsza** próba, kolejne to trening.
  Bez tego można by zapamiętać układ i ranking straciłby sens. Udostępnienie: krótki tekst z wynikiem i linkiem.
- **Wyzwanie znajomego**: „Pobij mój wynik” wysyła link z seedem do tego samego układu i po partii pokazuje porównanie.
  Zapewnia rywalizację, gdy znajomi nie grają w tym samym czasie.

## 9. Tor równoległy: nowe gry imprezowe

Gry z blefem i śmiechem robią więcej dla grupy niż kolejne testy zręczności. Plany czekają na akceptację.
Rekomendacja: **Blef na kościach** po etapie 3 (działa od 2 osób, krótkie partie, bez bazy treści), potem **Podróbka**
(najwięcej śmiechu przy 3+ osobach, ale wymaga 60 dobrych par pytań). Sabotaż, Wyprawa, Wspólny szyfr i Poprawka czekają na wyniki testów.
Nowe mini-gry nie są teraz potrzebne: jest ich 30, a problemem jest wybór, nie liczba.

## 10. Pomiar i odbiór

**Etap 0 (przed zmianami)**: tabela `room_games` (losowy klucz pokoju, gra, liczba graczy, czas), bez nicków.
Powroty można od razu policzyć z obecnej bazy po `nickKey` i `at`.

| Miara | Po co |
|---|---|
| mediana partii w pokoju z 2+ graczami | główna miara „jeszcze jednej” |
| odsetek partii, po których w tym pokoju była kolejna | gdzie ludzie odpadają |
| odsetek pokoi z 3+ partiami | czy wieczór się układa |
| nicki grające z innymi w 2+ różne dni w tygodniu | powroty |

Graczy jest niewielu, więc liczby będą pokazywać tylko kierunek. **Rozstrzyga test z ludźmi**: 3-4 osoby na swoich telefonach,
po jednym wieczorze przed etapem 2 i po etapie 3. Obserwujemy: czy reagują na głos, kto prosi o kolejną, gdzie się nudzą, kiedy kończą i dlaczego.

Każdy etap: dokumenty i testy przed kodem (osobny commit, gdy zmieniają się zasady), `pnpm typecheck && pnpm test`, `pnpm --filter web build`,
sprawdzenie 360×640 z 1, 2 i 6 graczami oraz obserwatorem, `prefers-reduced-motion`, reconnect w trakcie wspólnego startu.

**Warunki zatrzymania**: zmiana psuje pomiar lub porównywalność rekordów; `live` lub reakcje obciążają Pi przy 6 graczach;
elementy na żywo rozpraszają w teście, wtedy wyłączamy je dla danej gry.

## 11. Czego świadomie nie robimy

„Uzależniająca” rozumiemy jako „chcę jeszcze raz, bo to fajne”, a nie „muszę, bo coś stracę”.

- Bez powiadomień, komunikatów o stracie serii i odliczań mających zawstydzić lub zatrzymać gracza.
- Bez nagród losowych, łupów, walut i sztucznie „prawie wygranych” wyników.
- Bez ustawiania trudności ani losowości pod emocje: rekordy mają pozostać uczciwe.
- Bez automatycznego startu kolejnej gry solo. Kolejna partia to zawsze wybór gracza.
- Bez zmian punktacji i starych rekordów przy okazji tego planu.
- Bez dźwięku na razie. Opcjonalne dźwięki (domyślnie wyłączone) można rozważyć po teście z ludźmi.
- Bez nowych zależności: animacje w CSS, ikony Phosphor, emotki systemowe.

## 12. Decyzje do akceptacji

| Nr | Decyzja | Rekomendacja |
|---|---|---|
| D1 | „Ze znajomymi” nad „Sam”, „Utwórz pokój” jako główny przycisk (zmienia KONCEPT §1) | tak |
| D2 | Wspólny start 3-2-1 zamiast osobnego (zmienia KONCEPT §3: regułę platformy oraz mini-gry i rekordy) | tak, warunek uczciwego podglądu rywali |
| D3 | `live` to dekoracja zgłaszana przez klienta, jawny wyjątek obok zasady „serwer jest źródłem prawdy”; nie dotyka wyników | tak |
| D4 | Złagodzenie DESIGN §1: krótkie, jednorazowe reakcje na zdarzenia | tak |
| D5 | Wyzwanie dnia: wspólny układ i ranking z pierwszej próby (dziś układ losowy, próby bez limitu) | tak, w etapie 5 |
| D6 | Kolejność: etapy 1 → 2 → 3, test z ludźmi, potem Blef na kościach oraz etapy 4 i 5 | tak |

Rekomendowany początek po akceptacji: etap 0 i etap 1. To niewielki zakres, bez zmian w zasadach gier, i od razu będzie go widać przy następnym wspólnym graniu.

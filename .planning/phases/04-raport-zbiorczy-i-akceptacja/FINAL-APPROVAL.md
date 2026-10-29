# Jedna końcowa zgoda ZG4-v1

Data: **2026-10-26**. Status: **zatwierdzona w całości**. Źródło: użytkownik „Zatwierdzam”, 2026-10-26; [rejestr akceptacji](DECISIONS.md#zg4-accepted).

Na prośbę użytkownika „Zrób jedną końcową zgode” ten dokument zastępuje dalsze pytania o małe paczki, w tym osobne pytanie o B4-003. Prośba dotyczy przygotowania zgody, nie jest zatwierdzeniem opisanych tu zmian. Historyczny stan przed końcową odpowiedzią: zaakceptowanych było 8 pakietów z B4-001/B4-002; przedstawiony nowy wybór obejmował pozostałe **54 pakiety**, **27 H**, pozostałe odstępstwa i politykę danych.

Podstawa: [REPORT R4-v1](REPORT.md), [PACKAGES PK4-v1](PACKAGES.md), [FINDINGS v1.1](FINDINGS.md), [DECISIONS v1](DECISIONS.md), [EVIDENCE v1](04-02-EVIDENCE.md). Kod: HEAD `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3`, gałąź `labirynt`. ZG4-v1 jest nową, jawną wersją zbiorczego zakresu: zachowuje karty PK4-v1 poza dokładnie wymienionymi doprecyzowaniami §3. Dawne wersje i dotychczasowe zgody pozostają ważne. Przy sprzeczności propozycji bazowej z §3 obowiązuje niniejsza propozycja ZG4-v1, po uzyskanej zgodzie użytkownika. Poniżej zachowano treść wyborów przedstawionych do akceptacji; wszystkie zostały zaakceptowane, a czas przyszły opisuje wykonanie, nie oczekującą zgodę.

## 1. Co obejmuje jedna odpowiedź

Proponowany wybór końcowy:

- **Poprawić** 54 pozostałe pakiety według §2-4. Wykonać także 8 pakietów już zaakceptowanych, bez ponownego pytania o ich zakres.
- **Zostawić jako świadome odstępstwo na ten etap** wszystkie 27 H według §5, z podanymi powodami i wpisami do właściwych sekcji zasad. Nie jest to pozostawienie decyzji bez odpowiedzi ani stwierdzenie, że pomiary już wykonano.
- Utrzymać istniejące odstępstwa według §6, z jawnymi zmianami należącymi do pakietów. Nie aktywować niewybranych alternatyw.
- Zachować stare rekordy, wygrane i zapisane partie bez przeliczania, kasowania, przenoszenia do archiwum ani zmiany schematu SQLite. Przy zmianach rozkładu trudności świadomie zachować wspólną historię (§3.2).
- Po zgodzie zakończyć rejestrację wyborów w 04-04, przygotować przekazanie 04-05 i plan wykonania fazy 5. W obrębie dokładnie tego zakresu nie wracać po zgody na kolejne małe paczki. Podział na zadania wdrożeniowe i ich kolejność nie wymagają nowej akceptacji, jeśli zakres się nie zmienia.

Zgoda na plan nie oznacza wykonania zmian ani odbioru. Nie obejmuje commitów, push, wdrożenia na produkcję, pobierania bazy z Pi, nowych zależności, nowych gier ani zapisu pokoi. To granice istniejącego zadania, nie osobne pytania do użytkownika.

## 2. Wszystkie pakiety i proponowane zachowanie

Każdy wiersz dziedziczy wyłącznie dokładne wystąpienia F4, pliki, zależności i odbiór z odpowiedniej karty PK4-v1. Mapa [PACKAGES §5](PACKAGES.md) nadal obejmuje 168 F4 / 295 rozłącznych części; P4-028 jest istniejącym odstępstwem F1:O04, bez nowego F4. §3 doprecyzowuje kontrakty, nie dodaje nowych błędów.

| Pakiet | Zachowanie po wykonaniu | Stan zgody |
|---|---|---|
| [P4-001: Wspólne reguły i granice wyjątków](PACKAGES.md#p4-001) | Jedna tabela tokenów w DESIGN, listy poza partią mogą przewijać się w pionie; jawny model T i zapas max(20% T,10 s) tylko jeśli wybrany; remis przy komplecie dozwolony z uzasadnieniem. Nie zmieniać samych limitów i losowania. | zaakceptowany ZG4-v1 |
| [P4-002: Najgorszy wynik po limicie](PACKAGES.md#p4-002) | Ukończony Schulte/Sudoku przed timeoutem; nowe timeouty bez rekordu; Kropki z najgorszym błędem. Kontrakt i wyjątek historii: §3.1. | zaakceptowany ZG4-v1 |
| [P4-003: Zakupy: pełny czas i pomiar zatwierdzenia](PACKAGES.md#p4-003) | 80 s limitu platformy; po 50 s wybierania automatyczne oddanie zaznaczeń; koniec pomiaru na pointerdown, klawiatura przez click detail=0, bez podwójnego wyniku. | już zaakceptowany |
| [P4-004: Sekwencja: zachowanie zaliczonej serii](PACKAGES.md#p4-004) | Przy 300 s serwer oddaje ostatnią zaliczoną serię z walidowanego progress, zamiast 0; bez dokładania tie szybkości. | już zaakceptowany |
| [P4-005: W pamięci: oddanie bez dodatkowego przycisku](PACKAGES.md#p4-005) | Pomyłka lub komplet wysyła wynik od razu; odsłona służy obejrzeniu odpowiedzi, nie uruchomieniu zapisu. | już zaakceptowany |
| [P4-006: Wspólny nagłówek aktywnej partii](PACKAGES.md#p4-006) | Zwinąć pigułki i odliczanie tak, by nagłówek zostawiał miejsce planszy, zachowując status, wyniki i rozłączenie. Własne nagłówki nie są przebudowywane. | już zaakceptowany |
| [P4-007: Gomoku: plansza nad dolną akcją](PACKAGES.md#p4-007) | Własny ostatni rząd i podgląd wybranego kamienia widoczne równocześnie z Postaw. | zaakceptowany ZG4-v1 |
| [P4-008: Statki: rozstawianie i bitwa w ekranie](PACKAGES.md#p4-008) | Obróć/Losuj/Gotowe dostępne bez nakładania na flotę; w bitwie i obronie obie role mają dostęp do aktywnej planszy. | zaakceptowany ZG4-v1 |
| [P4-009: Chińczyk: domki i kostka w ekranie](PACKAGES.md#p4-009) | Dolne domki nie są przykryte; kostka i Rzuć współdzielą dostępną wysokość, Klasyczny i Szybki. | zaakceptowany ZG4-v1 |
| [P4-010: Labirynt: własny pionek i wybór ruchu](PACKAGES.md#p4-010) | Startowy pionek, cel, wybór Pionek/Ściana i potwierdzenie widoczne; Klasyczny 9×9 i Szybki 7×7. | zaakceptowany ZG4-v1 |
| [P4-011: Memory: wszystkie rzędy kart](PACKAGES.md#p4-011) | Wszystkie rzędy i instrukcja Memory w 360×640; karty minimum 48 px, bez wyjątku gęstych plansz. | zaakceptowany ZG4-v1 |
| [P4-012: Kalambury: zgadywanie i Pasuję](PACKAGES.md#p4-012) | Płótno liczy wysokość po całym własnym nagłówku; Zgadnij i Pasuję pozostają w zasięgu. | już zaakceptowany |
| [P4-013: Koło: zakończenie prób widoczne](PACKAGES.md#p4-013) | Płótno dopasowuje się do wolnej wysokości, a Zostaw najlepszą… pozostaje widoczne po pierwszej próbie. | już zaakceptowany |
| [P4-014: Państwa-miasta: formularz i tabela głosowania](PACKAGES.md#p4-014) | Formularz przewija się w pionie z dolną akcją; przy 4+ osobach kategoria osobno i gracze w wierszach, bez poziomego przewijania; cele głosu 48 px. | zaakceptowany ZG4-v1 |
| [P4-015: Kropki, Kąt, W pamięci: pole przy klawiaturze](PACKAGES.md#p4-015) | Formularz nie kurczy się do nieużywalnego kafla; odpowiedź i Zatwierdź dostępne z otwartą klawiaturą. | zaakceptowany ZG4-v1 |
| [P4-016: Wyniki: dostępne Rewanż i Do lobby](PACKAGES.md#p4-016) | Wyniki mogą przewijać się w pionie; OverActions i NextActions korzystają ze StickyBar. Dalej Kalamburów/Państw-miast zachowuje dostępność. | już zaakceptowany |
| [P4-017: Kampus Tour: środek i akcje po skalowaniu](PACKAGES.md#p4-017) | Stała nieucinana runda i akcje, log 1-2 wpisy; dialog i plansza nie dublują akcji; Zamknij/Podsumowanie/budowa i potwierdzenia mają 48 px na ekranie, nie tylko w scenie; wygrane i Oglądasz uzupełnione. | zaakceptowany ZG4-v1 |
| [P4-018: Kampus Tour: decyzja bez czekania na marsz](PACKAGES.md#p4-018) | Dotyk podczas marszu kończy animację do celu; akcja odpowiada stanowi serwera. Turlanie tylko po rzucie, przeskok kartą/MPK bez udawanego rzutu. | zaakceptowany ZG4-v1 |
| [P4-019: Chińczyk: ruch dostępny w animacji](PACKAGES.md#p4-019) | Dotyk kończy pokaz i pozwala wybrać pionek według aktualnego widoku, także w Szybkim. | zaakceptowany ZG4-v1 |
| [P4-020: Śledzenie: 360 s na pełną partię](PACKAGES.md#p4-020) | Limit 360 s przy zachowaniu 20 rund i dotychczasowej punktacji. | zaakceptowany ZG4-v1 |
| [P4-021: Który rok?: 270 s z zapasem sieciowym](PACKAGES.md#p4-021) | Limit platformy 270 s, klient nadal ma twarde 228 s maksymalnego przebiegu. | zaakceptowany ZG4-v1 |
| [P4-022: Jeden termin mini-gry niezależny od rywali](PACKAGES.md#p4-022) | Jeden termin od ostatniego Start; wynik rywala nie odnawia czasu. Środek/Tort z jawnymi wyjątkami §3.3. | zaakceptowany ZG4-v1 |
| [P4-023: Quizy: walidacja i wierne czasy trafień](PACKAGES.md#p4-023) | Serwer odrzuca nierealne dane; ekran zachowuje każde prawidłowe trafienie i rzeczywisty czas, bez ścięcia do 5 s. | zaakceptowany ZG4-v1 |
| [P4-024: Jeden komparator średniego czasu](PACKAGES.md#p4-024) | Jedno zaokrąglenie średniej do ms; zachowana historia i wspólna obsługa brakującego tie według §3.2. | zaakceptowany ZG4-v1 |
| [P4-025: Jawny remis i kolejność dalszych miejsc](PACKAGES.md#p4-025) | Gomoku zwraca ranking bez zwycięzcy. Dla Szybkiego Chińczyka proponowane opcjonalne GameResult.places podaje równe dalsze miejsca według liczby pionków w domu i sumy pozycji, ranking zachowuje stabilny porządek. Turniej wyświetla wspólne miejsce z identycznej pary total/wins bez zmiany punktów. | zaakceptowany ZG4-v1 |
| [P4-026: Kampus Tour: karta, wykup i rzeczywisty czynsz](PACKAGES.md#p4-026) | Karta bankruta wraca do talii; Juwenalia i wysokie budynki pozostają po wykupie/utracie kompletu; statystyka pokazuje faktycznie wypłacony czynsz. | zaakceptowany ZG4-v1 |
| [P4-027: Kalambury: podpowiedź tylko po limicie](PACKAGES.md#p4-027) | Zwykły klient nie może wysłać hint. Proponowany czwarty opcjonalny argument validateMove to zaufany kontekst {source: client lub timeout}, domyślnie client. LobbyRoom.play przekazuje source z miejsca wywołania, nigdy z JSON klienta. Tylko timeout przechodzi walidację hint we właściwej połowie. | zaakceptowany ZG4-v1 |
| [P4-028: Labirynt: losowy legalny krok po czasie](PACKAGES.md#p4-028) | Po czasie rng wybiera legalny krok, nie zawsze najkrótszą drogę; pass wyłącznie bez kroku. Zakres F1:O04, bez nowego błędu F4. | zaakceptowany ZG4-v1 |
| [P4-029: Testy: Kampus Tour](PACKAGES.md#p4-029) | Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu. | zaakceptowany ZG4-v1 |
| [P4-030: Testy: gry główne i Turniej](PACKAGES.md#p4-030) | Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu. | zaakceptowany ZG4-v1 |
| [P4-031: Testy: quizy i Stój!](PACKAGES.md#p4-031) | Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu. | zaakceptowany ZG4-v1 |
| [P4-032: Testy: pozostałe mini-gry](PACKAGES.md#p4-032) | Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu. | zaakceptowany ZG4-v1 |
| [P4-033: Rekordowa partia ze stanu, także me=""](PACKAGES.md#p4-033) | Stoper/Rytm nie czytają lokalnego kafla po końcu; test soloState obejmuje mapy napełnione prawdziwą partią. | zaakceptowany ZG4-v1 |
| [P4-034: Jedna lista mini-gier i klucz rewanżu](PACKAGES.md#p4-034) | Rejestr daje listę mini-gier; Sudoku ma nonce z fallbackiem starej planszy; prefiksy stałych i wspólny dolny pasek Turnieju. | zaakceptowany ZG4-v1 |
| [P4-035: Wspólne funkcje bez zmiany reguł](PACKAGES.md#p4-035) | Tasowanie z core i nazwa swapsFor; kopie szkieletu rund pozostają uzasadnionym odstępstwem, Koło zachowuje przyjęte próby po timeout. | zaakceptowany ZG4-v1 |
| [P4-036: Gęste plansze: wybór z potwierdzeniem](PACKAGES.md#p4-036) | Wyjątek <48 px tylko dla pola z podglądem i osobnym potwierdzeniem 48 px. Gomoku/Statki/Chińczyk zachowują takie potwierdzenie; Labirynt wymaga dodania jawnego potwierdzenia lub osobnej decyzji o odmiennej obsłudze. | już zaakceptowany |
| [P4-037: Zwykłe kontrolki 48 px](PACKAGES.md#p4-037) | Suwak Odcienia/Roku ma pole 48 px; wyjście, próbki koloru i wiersze gracza w Lobby/Setup również. | zaakceptowany ZG4-v1 |
| [P4-038: Tort: uchwyt cięcia pod palcem](PACKAGES.md#p4-038) | Łapanie cięcia w odległości 24 px od palca, niezależnie od kąta i odległości od środka; dotknięcie nie przesuwa innego cięcia. | zaakceptowany ZG4-v1 |
| [P4-039: Śledzenie: rozdzielne cele dotyku](PACKAGES.md#p4-039) | Po zatrzymaniu 8 osobnych przycisków 48 px, powiązanych z oznaczeniami kulek według pozycji. Bez zmiany GAP/generatora; szczegóły §3.4. | zaakceptowany ZG4-v1 |
| [P4-040: Reduced motion: zadanie działa, komunikat widoczny](PACKAGES.md#p4-040) | Ruch będący zadaniem zostaje w Kubkach/Śledzeniu/Wieży/Zasłonie; dekoracje znikają, Preview i werdykt są czytelne w klatce bazowej. | zaakceptowany ZG4-v1 |
| [P4-041: Katalog i opisy animacji](PACKAGES.md#p4-041) | Udokumentować istniejące keyframes i ich role, w tym set-glow 0,9 s ×4; komentarze zgodne z rzeczywistym użyciem. Bez przenoszenia logiki gry do animacji. | zaakceptowany ZG4-v1 |
| [P4-042: Przejścia, pętle i paski czasu](PACKAGES.md#p4-042) | Wybór ring-pulse 1,2 s; czekanie spokojne; zwykłe przejścia 180/100 ms; paski z zegara i linear krokiem odświeżenia. W pamięci show 180 ms i Szybki Chińczyk 110/400 jako opisane wyjątki. | zaakceptowany ZG4-v1 |
| [P4-043: Błąd, ignorowany ruch i nowa decyzja](PACKAGES.md#p4-043) | Zignorowanie bez kary ma shake i powód, bez wibracji; realny błąd 60; szkoda od rywala[60,40,60]; nowa decyzja 40 bez sygnału technicznej połowy Kalamburów; metronom 30 jako bodziec. | zaakceptowany ZG4-v1 |
| [P4-044: Odsłona wyniku i prawdy](PACKAGES.md#p4-044) | Wynik i znak prawdy bez animacji; znacznik neutralny, odpowiedź w kolorze gracza; litera Kalamburów również od razu. | zaakceptowany ZG4-v1 |
| [P4-045: Zaznaczenie, okno i błysk trafienia](PACKAGES.md#p4-045) | Zaznaczenie na czas i okno z dotyku są natychmiastowe; błysk dotyczy dokonanej odpowiedzi lub licznika, nie treści nowego pytania. | zaakceptowany ZG4-v1 |
| [P4-046: Koniec, para i powrót do partii](PACKAGES.md#p4-046) | title-pop tylko zwycięzcy; para stone-pop, większy komplet set-glow; zastany stan po reconnect bez nowych zdarzeń; Balon zachowuje werdykt 1,6 s niezależnie od przerwy 0,8 s. | zaakceptowany ZG4-v1 |
| [P4-047: Słowa czynności i przejść](PACKAGES.md#p4-047) | Dalej do następnego kroku, Wyniki do podsumowania; Gotowe dla oddania, Jestem gotowy dla lobby; rysujesz i Dotknij symbolu. Kolor przycisku wynika z roli w partii/między grami. | zaakceptowany ZG4-v1 |
| [P4-048: Wspólne wyniki i tabele rund](PACKAGES.md#p4-048) | Dopuścić drugi wspólny Results/ScoreTable dla kolumn; RoundTable z komórkami/wierszem celów; Odcień zachowuje pary próbek jako nazwany wyjątek. | zaakceptowany ZG4-v1 |
| [P4-049: Liczby, etykiety i wąskie kolumny](PACKAGES.md#p4-049) | Odczyty mono/tabular-nums, narracja może zostać Satoshi; wspólny przecinek i brak wartości; skrót 999+ tylko w ciasnej Mapie, pkt w nagłówku Turnieju. Progi gry zachowane i uzasadnione, nie wymuszać grade. | zaakceptowany ZG4-v1 |
| [P4-050: Role tokenów i drugi sygnał stanu](PACKAGES.md#p4-050) | Wspólna klasa akcji gracza, tokeny w swoich rolach, właściciel/wybór z widoczną ikoną/znakiem; jawne ograniczone wyjątki treści, 2.5D, gradientu Koła i odznaki 4 px. | zaakceptowany ZG4-v1 |
| [P4-051: Etykiety, natywne kontrolki i wykres dotykiem](PACKAGES.md#p4-051) | color-scheme:dark, ozdobne ikony pominięte, przyciski i pola nazwane; tooltip wykresu utrzymuje się po dotknięciu. | zaakceptowany ZG4-v1 |
| [P4-052: Czytelne stany oczekiwania, błędu i blokady](PACKAGES.md#p4-052) | Rozłączenie i ładowanie mają tekst, zamknięcie pokoju właściwy komunikat; brak możliwości akcji ma powód. Sudoku bez wyboru nie udaje aktywnej klawiatury; turniej solo i puste ciekawostki mają opis. | zaakceptowany ZG4-v1 |
| [P4-053: Wąskie podpisy i hierarchia ekranów](PACKAGES.md#p4-053) | Jeden wypełniony akcent Home; tytuły i tła zgodne ze wzorcem; poprawić tylko zmierzone obcięcia podpisów i Preview. Koło ma osobny Preview, Stroop pełny opis zgodnych plansz. | zaakceptowany ZG4-v1 |
| [P4-054: Nieaktualne opisy bez zmiany zasad](PACKAGES.md#p4-054) | Opisy kart/talii/fazy pick, tie W pamięci, jednostka serii, komentarze widoków i Ć odpowiadają istniejącej grze; Intro podaje rundy i uczciwie opisany czas. | zaakceptowany ZG4-v1 |
| [P4-055: Stoper: stały cel](PACKAGES.md#p4-055) | Cel 10 s, wynik nadal w ms. | zaakceptowany ZG4-v1 |
| [P4-056: Rytm: stałe tempo](PACKAGES.md#p4-056) | 100 BPM, wynik nadal w ms. | zaakceptowany ZG4-v1 |
| [P4-057: Liczenie: komplet rodzajów](PACKAGES.md#p4-057) | Potasowane czwórki rodzajów, bez zmiany zakresów liczb. | zaakceptowany ZG4-v1 |
| [P4-058: Obrót: sześć rodzajów planszy](PACKAGES.md#p4-058) | Komplet 90/180/270×ta sama/lustro w każdej szóstce. | zaakceptowany ZG4-v1 |
| [P4-059: W pamięci: stała liczba mnożeń](PACKAGES.md#p4-059) | Stała liczba mnożeń floor(działań/3) na rundę; liczby 1-99. Odbiór generatora i wpływu P11 pozostaje wymagany. | zaakceptowany ZG4-v1 |
| [P4-060: Balon: ten sam komplet ryzyka](PACKAGES.md#p4-060) | Balon: tasowany komplet 11,12,13,14,15,16,17,18,19,20; suma 155, dotychczasowa decyzja stop i tie. | zaakceptowany ZG4-v1 |
| [P4-061: Zegar bodźca i dotyku](PACKAGES.md#p4-061) | Spójny timestamp wejścia i odniesienie bodźca po U14; Stoper/Wieża tylko przy wykazanym znaczeniu zmiany. | zaakceptowany ZG4-v1 |
| [P4-062: Państwa-miasta: pominąć Ł](PACKAGES.md#p4-062) | Ł nie losuje się w rundach, bo kategoria państwa jest systemowo słabsza. | zaakceptowany ZG4-v1 |

## 3. Konkretne rozstrzygnięcia brakujących warunków

### 3.1 P4-002: ukończenie, timeout i historyczne rekordy

Proponujemy D4-001/002/003:A z następującym, zamkniętym kontraktem, zamiast pozostawienia G-DANE do kolejnego pytania:

- Nowy wynik Schultego/Sudoku zawiera w stanie JSON jawne `completed: boolean`. Ukończone wyniki sortujemy po pełnym czasie z karą; nieukończone zawsze za nimi. Nieukończeni remisują ze sobą, bez udawanej wygranej przez brak kar. Ten sam porządek obowiązuje w pokoju i punktach turnieju.
- Klient oddaje wynik ukończony. Nieukończenie powstaje wyłącznie w serwerowej ścieżce timeout. Do rozróżnienia użyć zaufanego kontekstu walidacji `{ source: client | timeout }`, domyślnie client, opisanego już w P4-027. Klient nie może podać tego uprawnienia w JSON. ZG4-v1 rozszerza zastosowanie tego kontraktu na Schulte/Sudoku; P4-002 i P4-027 uzgadniają wspólną zmianę przed wdrożeniem.
- Nowy timeout nie trafia do tabeli rekordów Schultego/Sudoku. `record.score` zwraca dla niego wynik niefinitywny jako istniejący sygnał „brak rekordu”, filtrowany przed zapisem przez LobbyRoom. Niefinitywna wartość nie trafia do stanu JSON ani SQLite. W UI widnieje „Nieukończono”, bez komunikatu o nowym rekordzie. To jawny wyjątek od zapisu każdego wyniku jako liczby.
- Stary wynik lub detail bez znacznika pozostaje historyczny, bez przypisania mu pewnego statusu ukończenia. **Nie wnioskujemy o timeout po 180000/120000 ani po samym score.** Dawne rekordy mogą nadal zawierać nierozpoznawalny timeout i zajmować miejsce przed nowym ukończeniem; świadomie zachowujemy tę niedoskonałość historii. Naprawa gwarantuje prawidłowy porządek w nowych partiach i brak nowych rekordów z timeoutu, nie oczyszcza dawnych tabel.
- W Policz kropki timeout otrzymuje dla każdej rundy `max(n, 99-n)`; stare wyniki z zerowych odpowiedzi pozostają historyczne. Bez zmiany jednostki.

Dodatkowe miejsca względem bazowej karty P4-002: zaufany kontekst w core/LobbyRoom i testy tego kontraktu, komunikat w ekranach Schulte/Sudoku oraz brak zapisu/RecordPanel dla nowego timeoutu. Bez nowej tabeli, migracji, wersjonowania bazy ani rozszerzania antycheatu. G-DANE zostanie rozstrzygnięte samą zgodą na powyższą politykę, natomiast testy kontraktu nadal trzeba wykonać.

### 3.2 G-DANE dla pozostałych pakietów

Zatwierdzona wcześniej polityka Zakupów/Sekwencji pozostaje bez zmian. Proponujemy tę samą zasadę zachowania historii dla P4-020/021/023/024/039/055-061 i wyniku Kropek z P4-002:

- Dawne liczby, `tie`, wygrane, daty i dostępny `detail` pozostają bez przeliczania i kasowania. Nie dodajemy nowej jednostki ani nowego id. P4-039 nie zmienia losowania; zmienia dostęp do wyboru.
- Wszystkie nowe wyniki w tej samej jednostce trafiają do dotychczasowego rankingu. **Historia obejmie partie o różnych limitach, metodach pomiaru i trudności. Nie obiecujemy pełnej porównywalności.** Dotyczy to zwłaszcza celu 10 s w Stoperze, 100 BPM w Rytmie, kompletów Liczenia/Obrotu, liczby mnożeń W pamięci oraz znacznie węższego ryzyka 11-20 w Balonie.
- Stary detail odczytujemy z zapisanego stanu, z fallbackiem brakujących pól. Nie uruchamiamy nowego setup w celu odtworzenia dawnej partii. Nie odzyskamy utraconego postępu, uciętych czasów ani ułamków tie.
- P4-024: porównanie nowych średnich zaokrąglonych do ms jest wspólne w pokoju, rekordach i turnieju. `null` w starym tie oznacza brak danych, nigdy zero. Przy tym samym głównym wyniku znane tie poprzedza brakujące tie, dwa brakujące są równe; porządek całkiem równych rekordów pozostaje chronologiczny. SQL i wspólny komparator/standing UI muszą dawać ten sam porządek; test obejmuje liczby, null i pełny remis. Nie odtwarzamy fałszywej dokładności.
- Opis właściwej gry podaje zmianę metody i zachowanie starszych rekordów. Zachowujemy dotychczasowy model zaufania mini-gier. Ta zgoda nie obejmuje czyszczenia „podejrzanych” wpisów.

### 3.3 G-LIMITY, umowy widoku i zależności

Norma z P4-001 to `L >= max(1,2*T, T+10 s)` z opisanym modelem. Jawne wyjątki na ten etap: **Środek 60 s i Tort 120 s**, mimo modelowych wątpliwości H-001/H-002; **Który rok? 270 s** według D4-011:A. Dla 228 s przebiegu pełne 20% wymagałoby 273,6 s: świadomie przyjmujemy proponowane 270 s, czyli 42 s zapasu (około 18,4%), jako nazwane odstępstwo od nowego progu. Brak pomiaru ludzi nie dowodzi wystarczalności limitu; użytkownik wybiera zachowanie istniejącej długości bez zwiększania jej na podstawie modelu. Nie czekamy na P14 z samą decyzją, ale nie uznajemy P14 za wykonany. W razie późniejszego wykazania zbyt krótkiego czasu nowa wartość będzie osobnym zakresem, nie automatyczną zmianą w tej zgodzie.

Pełna propozycja limitów 30 mini-gier po zmianach:

| Limit platformy | Gry |
|---|---|
| 60 s | Refleks, Stoper, Środek (wyjątek), Stój!, Rytm, Nożyczki |
| 80 s | Zakupy; 50 s wybierania i automatyczne oddanie |
| 90 s | Kolor liter, Liczenie, Inny element, Obrót, Literówka, Dziesiątki |
| 120 s | Narysuj koło, Sudoku, Policz kropki, Kąt, Przytrzymaj, Za zasłoną, Balon, Tort (wyjątek) |
| 180 s | Tabela Schultego, Odcień, Wieża, Mapa, Trzy kubki |
| 270 s | Który rok?; lokalny maksymalny przebieg nadal 228 s, nazwany wyjątek progu 20% |
| 300 s | Sekwencja, W pamięci |
| 360 s | Śledzenie |

Po akceptacji tej tabeli i wyjątków G-LIMITY nie wymaga kolejnej zgody. P4-022 wykonać dopiero po wdrożeniu P4-003/004/020/021; solo i multiplayer mają jeden termin, Start/Intro zachowują opisany mechanizm. Wyjątki nie upoważniają do odnowienia czasu po wyniku rywala ani do ukrytego zwiększenia limitów.

G-KONTRAKT obejmuje podane w P4-025 opcjonalne GameResult.places i w P4-027 zaufane źródło walidacji, z rozszerzeniem z §3.1. To wybrane kontrakty, nie kolejne pytania o architekturę; testy zgodności są bramką implementacji. Wspólne pliki zmieniać sekwencyjnie, wykorzystując jeden kontrakt source dla Kalamburów oraz timeoutu Schultego/Sudoku. Bez nowego pakietu ani nowych zależności.

### 3.4 P4-039: jednoznaczny wybór kulek bez zmiany generatora

Doprecyzowany wariant D4-060:A w Śledzeniu: po zatrzymaniu ruchu plansza pokazuje kulki z numerami 1-8 i obok/pod nią panel ośmiu oddzielnych przycisków minimum 48×48 px (np. dwa rzędy po cztery). Panel jest jedynym obszarem wykonywania wyboru; kulki są podglądem.

Numery nadajemy **dopiero w fazie pick, według końcowej pozycji od góry do dołu, przy równym y od lewej do prawej**, bez zależności od roli celu, indeksu tablicy czy poprawności. Podczas show/move nie ma numerów umożliwiających śledzenie tożsamości zamiast ruchu. Numery nie mogą ujawnić, że pierwsze trzy indeksy stanu są celami. Gdy oznaczenia w planszy są blisko, stosujemy czytelne odnośniki do punktów, bez przesuwania samych kulek.

Dotknięcie przycisku zaznacza/odznacza odpowiadającą kulkę, trzeci wybór kończy wskazywanie tak jak obecnie. Brak nowego czasu odsłony, dodatkowego potwierdzenia i dodatkowych punktów. Układ mieści planszę, panel i instrukcję na 360×640. Generator, GAP=0,14, prędkości i 8 kulek/3 cele pozostają bez zmian. Jest to rozszerzenie obszaru UI P4-039 o panel i mapowanie pozycji, bez zmiany plików zasad losowania.

Odbiór: skrajnie bliskie pozycje, każda kulka dostępna i oznaczona jednoznacznie, panel 48 px bez nakładania, brak informacji o celach w numerach, brak numerów w show/move, dotyk i klawiatura, aktualne wyniki i stary detail bez zmian. U12/U13 nadal wymagają rzeczywistego potwierdzenia. Nie akceptować odbioru na podstawie samego powiększenia CSS.

### 3.5 Dwa sprzeczne skróty w bazowych propozycjach

- **H-005 / D4-018:C (nowy wariant ZG4-v1): zachować dokładnie istniejący generator Dziesiątek.** W bazowej tabeli H-005 zapisano B jako „zachować”, ale D4-018:B w rzeczywistości oznacza dokładnie dwie pary, czyli nową zasadę. Nie wybieramy ani wymogu dwóch par, ani nowego tasowania dostaw. Gwarancja co najmniej jednej pary i wpływ wyborów gracza zostają.
- **D4-090 wybór lokalny:** A dla rejestru/nonce/SoloState i wskazanych wspólnych funkcji; w P4-035 B tylko dla trzech kopii szkieletu rund i zachowania prawidłowych prób Koła po timeout. Nie przeprowadzać zbiorczego refaktoru wszystkich mini-gier. P4-011 nie otrzymuje wyjątku D4-059 dla Memory: karty nadal minimum 48 px.

## 4. Pełna lista proponowanych wariantów D4

Poniżej znajduje się 106 jawnych wyborów. Litera dotyczy wyłącznie wystąpień przypisanych w PACKAGES, z ograniczeniami §3; nie upoważnia do niewymienionych zmian. Już uzyskane zgody pozostają zapisane w DECISIONS §10-11. Pozostałe wiersze zaakceptowano w końcowej odpowiedzi „Zatwierdzam”.

| Decyzja | Proponowany wariant ZG4-v1 | Treść wyboru |
|---|---|---|
| [D4-001](DECISIONS.md#d4-001) | A | Oznaczyć niedokończoną partię i ustawiać ją za każdym wynikiem ukończonym, również z karą ponad 180 s. Kontrakt i wyjątek starych rekordów: §3.1. |
| [D4-002](DECISIONS.md#d4-002) | A | Dodać jawny znacznik nieukończenia i sortować takie partie po ukończonych, także ponad 120 s z karami. Kontrakt i wyjątek starych rekordów: §3.1. |
| [D4-003](DECISIONS.md#d4-003) | A | Liczyć w każdej rundzie max(n, 99-n), zamiast odpowiedzi 0. |
| [D4-004](DECISIONS.md#d4-004) | A | Zachować limit 300 s, wysyłać zaliczoną serię jako progress i po limicie oddawać ostatnią zaliczoną serię. |
| [D4-005](DECISIONS.md#d4-005) | A | Przyjąć L >= max(1,2·T, T+10 s), z jawnym modelem T i oddzielnymi czasami stałymi oraz ludzkimi. |
| [D4-006](DECISIONS.md#d4-006) | A | Podnieść limit do 80 s i automatycznie wywołać oddanie po MAX_MS, zachowując zaznaczenia. |
| [D4-007](DECISIONS.md#d4-007) | B | Zachować 60 s i wrócić po pomiarach P14. |
| [D4-008](DECISIONS.md#d4-008) | B | Zachować 120 s i wrócić po pomiarach P14. |
| [D4-009](DECISIONS.md#d4-009) | A | Podnieść limit z 300 do 360 s. |
| [D4-010](DECISIONS.md#d4-010) | B | Zachować 45 s dla wszystkich konfiguracji. |
| [D4-011](DECISIONS.md#d4-011) | A | Podnieść limit platformy do 270 s przy twardym czasie klienta 228 s. |
| [D4-012](DECISIONS.md#d4-012) | A | Jeden termin od startu ostatniego gracza, bez odnawiania po wyniku innego; Koło także bez odnowienia po zakończeniu prób rywala. |
| [D4-013](DECISIONS.md#d4-013) | A | Stały cel 10 s i nadal wynik w ms. |
| [D4-014](DECISIONS.md#d4-014) | A | Stałe tempo 100 BPM i odchyłka w ms. |
| [D4-015](DECISIONS.md#d4-015) | A | Losować rodzaje potasowanymi czwórkami, po jednym rodzaju w każdej. |
| [D4-016](DECISIONS.md#d4-016) | A | Tasować komplety 90/180/270 stopni × ta sama/lustro. |
| [D4-017](DECISIONS.md#d4-017) | B | Zachować obecny generator 5 barw i najpierw ocenić proponowane pasma w symulacji czułości. |
| [D4-018](DECISIONS.md#d4-018) | C | C: zachować obecny generator; patrz §3.5, bez narzucenia dokładnie dwóch par. |
| [D4-019](DECISIONS.md#d4-019) | B | Zachować obecny generator, jawnie opisać rozrzut 1-7 pól i 2-5 fal. |
| [D4-020](DECISIONS.md#d4-020) | B | Zachować niezależne losowanie każdego kąta. |
| [D4-021](DECISIONS.md#d4-021) | B | Zachować obecny generator i jawnie opisać rozrzut mijanek. |
| [D4-022](DECISIONS.md#d4-022) | A | W każdej rundzie stała liczba mnożeń floor(liczba działań/3), miejsca tasowane, pozostałe + i minus. |
| [D4-023](DECISIONS.md#d4-023) | B | Zachować obecne losowanie. |
| [D4-024](DECISIONS.md#d4-024) | B | Zachować obecne losowanie czasu widocznego. |
| [D4-025](DECISIONS.md#d4-025) | B | Zachować losowanie całej puli. |
| [D4-026](DECISIONS.md#d4-026) | B | Zachować wspólną pulę i zebrać wyniki według epoki oraz działu. |
| [D4-027](DECISIONS.md#d4-027) | B | Zachować obecne losowanie. |
| [D4-028](DECISIONS.md#d4-028) | A | Tasować stały komplet 10 wytrzymałości o sumie 155, np. 11,12,13,14,15,16,17,18,19,20. |
| [D4-029](DECISIONS.md#d4-029) | A | Dopisać, że decyzja stop wymaga stałego kompletu celów; withSum wystarcza dopiero po uzasadnieniu wpływu rozkładu. |
| [D4-030](DECISIONS.md#d4-030) | B | Zostawić obecny remis pełnych wyników i wcześniejszy rekord przy pełnej równości. |
| [D4-031](DECISIONS.md#d4-031) | B | Zachować remis równych wyników i wcześniejszy rekord przy pełnej równości. |
| [D4-032](DECISIONS.md#d4-032) | B | Zachować remis długości; data jedynie porządkuje całkiem równe rekordy, nie wybiera zwycięzcy partii. |
| [D4-033](DECISIONS.md#d4-033) | B | Zachować 30 pięter oraz szerokość jako kryterium precyzji. |
| [D4-034](DECISIONS.md#d4-034) | B | Zachować 10 pozycji i czas jako tie. |
| [D4-035](DECISIONS.md#d4-035) | B | Dopuszczać świadomy remis przy komplecie, z opisem w zasadach i wspólnym komparatorem. |
| [D4-036](DECISIONS.md#d4-036) | A | Zostają na polu wraz z budynkami, dopisać regułę i test. |
| [D4-037](DECISIONS.md#d4-037) | A | Zostawić poziomy 3-4; komplet wymagany tylko przy budowie. |
| [D4-038](DECISIONS.md#d4-038) | B | Zostawić 20 zł i zebrać partie z rotacją miejsc. |
| [D4-039](DECISIONS.md#d4-039) | B | Zostawić darmową jazdę bez kieszonkowego. |
| [D4-040](DECISIONS.md#d4-040) | B | Zostawić trzy dowolne pełne grupy kolorów. |
| [D4-041](DECISIONS.md#d4-041) | B | Zachować 20 rund i zmierzyć pełne partie zegarem. |
| [D4-042](DECISIONS.md#d4-042) | A | Wybierać przez rng losowy dozwolony krok pionkiem; pass tylko gdy brak kroku. |
| [D4-043](DECISIONS.md#d4-043) | B | Zachować obecne pule i rotację przy rewanżu. |
| [D4-044](DECISIONS.md#d4-044) | B | Zachować rotację miejsc bez dodatkowej fazy. |
| [D4-045](DECISIONS.md#d4-045) | B | Zachować start pierwszego i rotację miejsc. |
| [D4-046](DECISIONS.md#d4-046) | A | Usunąć Ł z puli liter. |
| [D4-047](DECISIONS.md#d4-047) | B | Zostawić 3 punkty niezależnie od liczby graczy. |
| [D4-048](DECISIONS.md#d4-048) | B | Zostawić domyślnie 8. |
| [D4-049](DECISIONS.md#d4-049) | A | Stosować e.timeStamp dla wejścia, odniesienie bodźca z rAF spójne z zegarem renderowania; opisać zależność od telefonu. |
| [D4-050](DECISIONS.md#d4-050) | A | Kończyć pomiar na pointerdown; click tylko dla klawiatury z detail=0, bez drugiego wysłania. |
| [D4-051](DECISIONS.md#d4-051) | A | Dotknięcie pomija animację do stanu docelowego, a wybór wykonuje się względem stanu serwera; akcje dostępne w trakcie. |
| [D4-052](DECISIONS.md#d4-052) | A | Pozwolić dotknięciem zakończyć animację i wybierać pionek ze stanu docelowego. |
| [D4-053](DECISIONS.md#d4-053) | A | Dopuścić ruch kulek/kubków/klocka w Śledzeniu, Kubkach, Wieży i Zasłonie przy reduced motion; wyłączać dekoracje, zachować identyczny zegar zadania. |
| [D4-054](DECISIONS.md#d4-054) | A | Bazowa klatka Preview i liczba float-up pozostają widoczne bez przesunięcia; po krótkim czasie usuwa je logika, nie opacity końcowego keyframe. |
| [D4-055](DECISIONS.md#d4-055) | A | Zmniejszyć wspólny nagłówek i dopasować plansze oraz akcje do pozostałej wysokości, bez ukrywania gry pod StickyBar. |
| [D4-056](DECISIONS.md#d4-056) | A | Dopuścić pionowe przewijanie formularzy Państw-miast oraz list poza partią; akcja w StickyBar, pole nie znika pod klawiaturą. |
| [D4-057](DECISIONS.md#d4-057) | A | Dopuścić pionowe przewijanie wyników, OverActions i NextActions umieścić w StickyBar. |
| [D4-058](DECISIONS.md#d4-058) | A | Stały, nieucinany wiersz rundy i akcji, krótszy log (1-2 wpisy); Podsumowanie w dostępnym miejscu, akcje środka tylko gdy dialog schowany. |
| [D4-059](DECISIONS.md#d4-059) | A | Jawny wyjątek dla wyboru pola z osobnym potwierdzeniem: Gomoku, Labirynt, Statki, Chińczyk; wyróżnienie i nazwa wybranego pola, potwierdzenie min. 48 px. Kampus Tour tylko dla szczegółów/potwierdzeń; bez Memory. |
| [D4-060](DECISIONS.md#d4-060) | A | Wszystkie akcje poza wyjątkiem plansz mają rzeczywiste pole co najmniej 48×48 px po skalowaniu: suwak, kolory, plus/minus, budowa, Tort i kulki Śledzenia. Śledzenie: panel §3.4. |
| [D4-061](DECISIONS.md#d4-061) | A | Przy 4+ graczach pokazywać kategorię osobno, gracze w wierszach, z liczbą pozostałych kategorii. |
| [D4-062](DECISIONS.md#d4-062) | A | ZASADY odsyłają do pełnej tabeli DESIGN, dopisać accent-hover, znak aplikacji oraz klasę btn-player dla działań gracza. |
| [D4-063](DECISIONS.md#d4-063) | A | Nazwać w DESIGN wyjątki treści: rogi i grupy Kampus Tour, plansza 2.5D i poświata tury, uchwyt suwaka, figury Obrotu, gradient oceny Koła; pozostałe dekoracje sprowadzić do tokenów/skali. |
| [D4-064](DECISIONS.md#d4-064) | A | Warning zostaje dla ostrzeżeń przed skutkiem ruchu z tekstem lub ikoną; własny wybór zawsze w kolorze gracza; trafienie Statków w accent zachować jako nazwany wyjątek. |
| [D4-065](DECISIONS.md#d4-065) | A | Dodać inicjał/ikonę/kształt właściciela i zaznaczenia; w Śledzeniu dodatkowy widoczny znak celów w pokazie, bez zmiany ruchu. |
| [D4-066](DECISIONS.md#d4-066) | A | Po pełnym kodzie Dołącz jest wypełnione, Zagraj w karcie Sam staje się obrysem. |
| [D4-067](DECISIONS.md#d4-067) | A | Dopisać Kalambury do własnych nagłówków; każdy przejmuje status, obserwatora, rozłączenie i wygrane; paski w kolorze aktywnego gracza. |
| [D4-068](DECISIONS.md#d4-068) | A | Dopuścić wspólny Results/ScoreTable dla mini-gier potrzebujących kolumn, zachować semantykę gra…, (ty), remisy i mono. |
| [D4-069](DECISIONS.md#d4-069) | A | Rozszerzyć RoundTable o komórki/children i wiersz celów; Przytrzymaj/Balon/Szacowanie używają wspólnego wzorca, Odcień zachowuje pary próbek jako wyjątek. |
| [D4-070](DECISIONS.md#d4-070) | A | Dalej przechodzi po odsłonie, Wyniki tylko do końcowego podsumowania; w partii przycisk ma kolor gracza, między grami turnieju akcent. Gotowe zarezerwować dla oddania odpowiedzi, gotowość w lobby nazwać Jestem gotowy. |
| [D4-071](DECISIONS.md#d4-071) | A | Wysyłać wynik natychmiast po pomyłce, odsłonę pokazywać niezależnie od serwera; przy komplecie również wysłać bez dodatkowego potwierdzenia. |
| [D4-072](DECISIONS.md#d4-072) | A | Punkt time podaje rundy i czas stały/modelowy zamiast samej liczby rund; Preview jako osobny komponent także w Kole. |
| [D4-073](DECISIONS.md#d4-073) | A | Dopisać line-draw/title-pop/tile-hit/tile-miss/piece-fall/shake i ich role; pętle Tailwinda zastąpić nazwanymi odpowiednikami w index.css; komentarze zgodne z użyciem. |
| [D4-074](DECISIONS.md#d4-074) | A | ring-pulse 1,2 s; title-pop 500 ms; tile-hit/miss 350 ms; piece-fall 500 ms ease-in; shake 300 ms; set-glow 900 ms ×4. |
| [D4-075](DECISIONS.md#d4-075) | A | Wyjątki tabeli: pojawienie w pokazie W pamięci 180 ms, Szybki Chińczyk krok 110 ms/rzut 400 ms. |
| [D4-076](DECISIONS.md#d4-076) | A | Przycisk/stany 180 ms, reakcja dotykowa 100 ms; pasek linear przez długość kroku odświeżania, Countdown 300 ms. |
| [D4-077](DECISIONS.md#d4-077) | A | Spokojny tekst statusu, bez animate-pulse/ping. |
| [D4-078](DECISIONS.md#d4-078) | A | Wynik i znacznik prawdy pojawiają się od razu, bez animacji. |
| [D4-079](DECISIONS.md#d4-079) | A | Shake 300 ms i krótki powód, bez wibracji i bez kary; w Zasłonie przed ruchem kulki samo zignorowanie zgodnie z zasadami. |
| [D4-080](DECISIONS.md#d4-080) | A | 60 ms przy rzeczywistym błędzie (w tym falstart i błąd Sekwencji), bez wibracji przy legalnym pudle w Statkach/Memory/Kalamburach. |
| [D4-081](DECISIONS.md#d4-081) | A | Wibracja [60,40,60] przy zbiciu pionka, trafieniu mojej floty, wykupieniu mojego pola i STOP od innego. |
| [D4-082](DECISIONS.md#d4-082) | A | Wspólny title-pop tylko u zwycięzcy; pozostali widzą spokojny wynik, remis bez animacji wygranej. |
| [D4-083](DECISIONS.md#d4-083) | A | Dopisać 30 ms jako bodziec metronomu i zachować jedyny dźwięk opisany w zasadach. |
| [D4-084](DECISIONS.md#d4-084) | A | Wibrować przy przejściu do mojej nowej decyzji, nie przy samej zmianie half Kalamburów ani identycznej liście waitingFor bez nowej decyzji. |
| [D4-085](DECISIONS.md#d4-085) | A | Trzymać ostatni wynik niezależnie od fazy, aby float-up mógł trwać 1,6 s mimo przerwy 0,8 s. |
| [D4-086](DECISIONS.md#d4-086) | A | Zaokrąglać średnią do ms zarówno w komparatorze miejsc, jak i w record.tie. |
| [D4-087](DECISIONS.md#d4-087) | A | Odrzucać ułamkowe czasy i nierealne liczby pomyłek; ekran zapisuje rzeczywiste trafienia w dopuszczalnym zakresie, nie ucina ich do 5 s ani nie usuwa poprawnych <150 ms. |
| [D4-088](DECISIONS.md#d4-088) | A | Naprawić Stoper/Rytm i testować soloState na stanie wypełnionym legalnymi ruchami, także z me="". |
| [D4-089](DECISIONS.md#d4-089) | A | Dopisać wskazane w F4 testy kontraktu i reguł, bez zmiany znaczeń zasad. |
| [D4-090](DECISIONS.md#d4-090) | A | Wyprowadzić MINI_GAMES z istniejącego rejestru, użyć core i wspólnych modułów, nonce Sudoku oraz istniejącego StickyBar; zachować tożsamość gry. Lokalnie B w P4-035 według §3.5. |
| [D4-091](DECISIONS.md#d4-091) | A | Wynik i numeracja zachowują równe miejsca przy pełnym remisie; kolejność miejsc tylko porządkuje wyświetlanie, Gomoku zwraca ranking bez zwycięzcy. |
| [D4-092](DECISIONS.md#d4-092) | A | Oddawać Zaliczenie bankruta na spód talii. |
| [D4-093](DECISIONS.md#d4-093) | A | Zapisywać faktycznie zapłaconą kwotę, nie pełny należny czynsz przy bankructwie. |
| [D4-094](DECISIONS.md#d4-094) | B | Usunąć wcześniejsze hint od klienta; połowę kończy tylko serwer po czasie. |
| [D4-095](DECISIONS.md#d4-095) | A | Poprawić literalne rozbieżności z kodem i zasadami: brakujący tie W pamięci, karta i talia Kampus Tour, faza pick, nazwy testów, Refleks liczony na serwerze, seria zamiast pkt, ukrycie rywali, Ć, formy rysujesz i Dotknij symbolu oraz opis zgodnych plansz Stroopa. |
| [D4-096](DECISIONS.md#d4-096) | B | Dopuścić cyfry w zdaniach Satoshi, pozostałe poprawki jak A. |
| [D4-097](DECISIONS.md#d4-097) | A | Uzupełnić role, etykiety i aria-hidden; stan rozłączenia/ładowania z tekstem; powód blokady przy polu, pionku i liczbie gier; Sudoku bez pola ma nieaktywną klawiaturę; dotyk utrzymuje tooltip; pusta ciekawostka i turniej solo mają opis. |
| [D4-098](DECISIONS.md#d4-098) | A | Poprawić dopiero potwierdzone obcięcia; dopasować tytuły do istniejącego wzorca, kolory linków i tła do ról tokenów. |
| [D4-099](DECISIONS.md#d4-099) | A | Krótki tile-hit po zaliczeniu, bez wibracji; podpis Idealnie! tylko gdy oznacza dokładnie zerowy błąd. |
| [D4-100](DECISIONS.md#d4-100) | A | Para to stone-pop 350 ms; set-glow zarezerwować dla kompletu wielu różnych pól. |
| [D4-101](DECISIONS.md#d4-101) | A | Zmiana obrysu i zaznaczenia od razu, bez transition-colors. |
| [D4-102](DECISIONS.md#d4-102) | A | Pojawia się natychmiast; card-in dotyczy automatycznej karty/okna ze stanu gry. |
| [D4-103](DECISIONS.md#d4-103) | A | Animować tylko nowe zdarzenia od pierwszego otrzymanego stanu; zastany stan pokazać od razu. |
| [D4-104](DECISIONS.md#d4-104) | A | Błysk dotyczy zapisanego miejsca trafienia albo licznika trafień, nie przycisków nowego pytania. |
| [D4-105](DECISIONS.md#d4-105) | A | Turlanie tylko po zdarzeniu rzutu; marsz tylko po ruchu z rzutu; karty, Kolokwium i MPK przeskakują od razu. |
| [D4-106](DECISIONS.md#d4-106) | B | Litera pojawia się natychmiast bez animacji. |

## 5. H-001..027: proponowane końcowe pozostawienie na ten etap

Każdy wiersz oznacza decyzję **„zostawić jako odstępstwo z powodem”**, nie „brak decyzji do czasu pomiaru”. Zachowuje dokładne wystąpienia właściciela z PK4-v1. W fazie 5 dopisać powód do właściwej sekcji ZASADY-GIER (KONCEPT tylko jeśli dotyczy), bez zmiany zachowania. Pytania P/U pozostają w EVIDENCE jako ewentualny materiał do przyszłego zadania, ale nie są ukrytymi wdrożeniami w tej zgodzie.

| Pozycja | Wybór w tej zgodzie | Powód pozostawienia | Ewentualny powrót poza zakresem tej zgody |
|---|---|---|---|
| [H-001: Środek: pomiar limitu](PACKAGES.md#h-001) | Zostawić; D4-007 → B | Zostawić 60 s do pomiaru; wysoka ocena oparta na 5 s celowania. | P14: czas starannej partii; potem wariant 90 s i G-DANE jeśli wybrany. |
| [H-002: Tort: pomiar limitu](PACKAGES.md#h-002) | Zostawić; D4-008 → B | Zostawić 120 s do pomiaru; 120,5 s jest modelem. | P14: osobny pomiar Tortu; potem 180 s lub uzasadniony dotychczasowy limit. |
| [H-003: Państwa-miasta:45 s głosowania](PACKAGES.md#h-003) | Zostawić; D4-010 → B | Najpierw czytelny interfejs; nowy wzór skraca czas małych grup. | P08 po pm-ui:5-6 os., ilu zdążyło przejrzeć i zagłosować. |
| [H-004: kolor: zachować generator do weryfikacji](PACKAGES.md#h-004) | Zostawić; D4-017 → B | Nie wykazano wyrównania czułości proponowanymi pasmami. | próba generatora oraz U09; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-005: dziesiatki: zachować generator do weryfikacji](PACKAGES.md#h-005) | Zostawić; D4-018:C, obecny generator | Wpływ liczby par zależy od wyborów gracza. | P19; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-006: sudoku: zachować generator do weryfikacji](PACKAGES.md#h-006) | Zostawić; D4-019 → B | Nie potwierdzono dostatecznej puli plansz 3fale/3jednoznaczne. | próba generatora; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-007: kat: zachować generator do weryfikacji](PACKAGES.md#h-007) | Zostawić; D4-020 → B | Wpływ wielkości kąta na błąd człowieka niezmierzony. | P15; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-008: sledzenie: zachować generator do weryfikacji](PACKAGES.md#h-008) | Zostawić; D4-021 → B | Mijanki są metryką generatora, nie udowodnioną trudnością. | U13 i partie mierzące mijanki; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-009: stoj: zachować generator do weryfikacji](PACKAGES.md#h-009) | Zostawić; D4-023 → B | Błędy końcówki niezmierzone. | P18; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-010: zaslona: zachować generator do weryfikacji](PACKAGES.md#h-010) | Zostawić; D4-024 → B | Widoczność a błąd niezmierzone. | P17; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-011: literowka: zachować generator do weryfikacji](PACKAGES.md#h-011) | Zostawić; D4-025 → B | Rodzaj błędu a czas niezmierzony. | P16; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-012: rok: zachować generator do weryfikacji](PACKAGES.md#h-012) | Zostawić; D4-026 → B | Działy wymagają klasyfikacji danych i partii. | P22; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-013: kubki: zachować generator do weryfikacji](PACKAGES.md#h-013) | Zostawić; D4-027 → B | Niski rozrzut, brak dowodu potrzeby zmiany. | U13; wrócić tylko przy wykazaniu wpływu; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| [H-014: w-pamieci: bez nowego tie](PACKAGES.md#h-014) | Zostawić; D4-030 → B; D4-035 → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P11; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| [H-015: kubki: bez nowego tie](PACKAGES.md#h-015) | Zostawić; D4-031 → B; D4-035 → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P10; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| [H-016: simon: bez nowego tie](PACKAGES.md#h-016) | Zostawić; D4-032 → B; D4-035 → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P09; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| [H-017: wieza: dotychczasowy sufit](PACKAGES.md#h-017) | Zostawić; D4-033 → B | Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. | P13; dopiero potem nowe rundy/lista i ocena limitu/historii. |
| [H-018: zakupy: dotychczasowy sufit](PACKAGES.md#h-018) | Zostawić; D4-034 → B | Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. | P12 po pakiecie zakupy; dopiero potem nowe rundy/lista i ocena limitu/historii. |
| [H-019: kampus-tour: kolejność miejsc bez zmiany](PACKAGES.md#h-019) | Zostawić; D4-038 → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P01; wrócić przed premią/ścianami/swap/losowaniem startu. |
| [H-020: MPK: bez opłaty 15 zł](PACKAGES.md#h-020) | Zostawić; D4-039 → B | Udział kompletów z botów nie wystarcza do zmiany kosztu. | P02; przed nową ceną opisać zachowanie bez gotówki. |
| [H-021: Monopol i długość Kampus Tour](PACKAGES.md#h-021) | Zostawić; D4-040 → B; D4-041 → B | Monopol rzadki w botach, czas gry to model. | P03/P04; dopiero potem ograniczenie grup lub 18 rund. |
| [H-022: labirynt: kolejność miejsc bez zmiany](PACKAGES.md#h-022) | Zostawić; D4-043 → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P06; wrócić przed premią/ścianami/swap/losowaniem startu. |
| [H-023: piec-w-rzedzie: kolejność miejsc bez zmiany](PACKAGES.md#h-023) | Zostawić; D4-044 → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P05; wrócić przed premią/ścianami/swap/losowaniem startu. |
| [H-024: memory: kolejność miejsc bez zmiany](PACKAGES.md#h-024) | Zostawić; D4-045 → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P07; wrócić przed premią/ścianami/swap/losowaniem startu. |
| [H-025: Statki: zachować start pierwszego](PACKAGES.md#h-025) | Zostawić; Decyzja wprost dla tego wystąpienia, brak nowej karty D4. | Boty 50,8-54,5% nie uzasadniają nowej reguły; rotacja pozostaje. | Obserwować Flotę wojenną; brak nowej D4 nie oznacza automatycznej akceptacji: w 04-04 decyzja wprost o tym wystąpieniu. |
| [H-026: Kalambury 2 os.:bez zmiany punktów](PACKAGES.md#h-026) | Zostawić; D4-047 → B | Proporcja 3/10 nie dowodzi złego doświadczenia graczy. | P20; przed zmianą 3→5 porównać źródła punktów w pełnych partiach. |
| [H-027: Turniej:domyślnie 8gier](PACKAGES.md#h-027) | Zostawić; D4-048 → B | Nieparzysta liczba gier nie gwarantuje braku remisu. | Częstość dogrywek w rzeczywistych seriach przed zmianą domyślnej długości. |

H-025 zatwierdzamy wprost: Statki zachowują start pierwszego i rotację miejsc; boty 50,8-54,5% nie uzasadniają nowej reguły. H-001/H-002 są jawnymi wyjątkami normy czasu z §3.3. P4-059 zmienia rozkład mnożeń, natomiast H-014 zachowuje remis przy komplecie; te wybory nie są sprzeczne.

## 6. Istniejące odstępstwa i Mapa

Wszystkie **47 źródłowych odstępstw F1:O01..O14 i F2:O01..O33** mają w [DECISIONS §7](DECISIONS.md) konkretny powód i powiązanie. Propozycja końcowa: utrzymać każde zgodnie z tą tabelą, poza jawnymi korektami należącymi do wybranych pakietów:

- F1:O04: zastąpić optymalny timeout Labiryntu losowym legalnym krokiem przez rng (P4-028/D4-042:A), pass wyłącznie bez kroku; bez losowania ścian.
- F1:O10: dotychczasowy progress jest podglądem; Sekwencja dostaje zatwierdzony, walidowany zapis ostatniej zaliczonej serii. Nie rozszerzać znaczenia progress innych gier.
- F1:O14 i pozostałe tematy balansu: obecne wartości według H, z powodami; brak dowodu z ludzi nie zmienia się w pomiar.
- F2:O01..O06: zachować poziomą scenę, treść i własne nagłówki, ale naprawić pełny zakres informacji, geometrię i akcje minimum 48 px po skalowaniu według P4-017/050. Stare 44 px/35 px po zoom nie są utrzymywanym wyjątkiem.
- F2:O09/11/15/18/24/31/33: zastosować dokładnie wybrane D4-064/075/063/083/053/066/070. Zachowanie trafień Statków w accent i ruchu będącego zadaniem nie legalizuje użycia czerwieni dla akcji gracza ani dowolnych ozdób.
- Pozostałe wiersze: utrzymać wskazany w nich istniejący powód, bez dopisywania nowej mechaniki. Gdy pakiet uzgadnia dokument z kodem, zachować granicę konkretnego odstępstwa, np. istniejące 1200 ms zamiany Statków, emoji Memory i paletę Kalamburów.

**MP-01/P21 Mapa: wariant B**, zakończyć tę obserwację w ramach audytu. Brak stwierdzonego błędu nie uzasadnia nowego generatora lub obowiązkowej kampanii pomiarowej. Kontur, jednostka km i zapisany detail bez zmian. Ponowne badanie po pojawieniu się konkretnego dowodu jest osobnym zadaniem.

## 7. Kolejność wdrożenia i odbiór

Wdrożenia pozostają małymi zadaniami, ale korzystają z jednej uzyskanej zgody:

1. Normy P4-001; wspólny kontrakt źródła timeout dla P4-002/027; poprawki utraty wyniku P4-002..005 i walidacja P4-023. Zachować TDD i dokumentację przy zmianie reguły, z testem przed kodem.
2. P4-006/036 oraz plansze i dolne akcje P4-007..019; wspólne pliki zmieniać sekwencyjnie. W Memory pełne 48 px. Własne nagłówki uzupełniać bez utraty miejsca na planszę.
3. Pozostałe limity P4-020/021, potem P4-022; porządek P4-024/025, reguły P4-026..028/062, brakujące testy P4-029..032. Zmiana zasad nie czeka ze swoim testem na późniejszy pakiet luk.
4. P4-033..054 z zachowaniem zależności i katalogu animacji przed zmianami efektów; P4-039 według §3.4. Testy i pomiary dotyczą dokładnych konfiguracji z kart, nie tylko przykładowego ekranu.
5. P4-055..061 z zaakceptowaną polityką historii, wybranymi liczbami oraz zachowanymi warunkami P11/U14. Reguły generatorów testowane na odpowiednich seedach; te testy nie zastępują partii ludzi.

To grupy prac, nie dodatkowe zależności kolejnego łańcucha. Pełny acykliczny graf PK4-v1 nadal obowiązuje; dokładamy wymóg uzgodnienia wspólnego source przed P4-002/027. Niezależne pakiety można wykonywać, gdy inny czeka na rzeczywisty pomiar. Brak nowego dowodu nie upoważnia do samodzielnej zmiany wybranego wariantu.

Bramki T/UI/D z PACKAGES obowiązują. `pnpm typecheck && pnpm test` oraz właściwy build i pomiary UI po zmianach. Pełna partia, min/max graczy, obserwator, timeout, odświeżenie/reconnect, remis, rewanż, rekordowa partia i turniej stosownie do karty. U01-U14 pozostają rzeczywistymi warunkami odbioru, zwłaszcza Android z klawiaturą, TalkBack/VoiceOver i 60/120 Hz. Nie oznaczać ich jako spełnionych na podstawie emulacji. Agent wykonuje dostępne automatyczne sprawdzenia, użytkownik odbiór wymagający jego urządzeń; brak urządzenia pozostawia jawnie nieodebrany fragment, nie powoduje kolejnego pytania o już wybrany zakres. P11 przed odbiorem wpływu mnożeń, U14 przed zmianą metody zegara; żaden warunek nie jest anulowany przez zgodę.

Nie wprowadzać zbędnej poprawki CSS, jeśli pomiar po wspólnym nagłówku dowiedzie spełnienia konkretnego kryterium. Zapisać wtedy dowód. Nie zmieniać testów pod implementację. Commity i push wyłącznie na prośbę, również przy obowiązującym TDD; ta zgoda nie jest taką prośbą.

## 8. Zapis zgody i warunek zakończenia

Proponowana treść jednej odpowiedzi: **„Zatwierdzam ZG4-v1: poprawić pozostałe 54 pakiety, zachować historię według §3, pozostawić 27 H i odstępstwa według §5-6.”** Wystarczy także jednoznaczne „Zatwierdzam” w odpowiedzi na pytanie o ten dokument; można podać konkretne wyjątki.

Po takiej odpowiedzi zapisać jej datę i treść, przenieść wszystkie wybory do DECISIONS/FINDINGS/PACKAGES/REPORT i przygotować 04-04-SUMMARY. Następnie w 04-05 utworzyć PHASE-5-SCOPE z pełnym mapowaniem i sprawdzić cztery kryteria roadmapy. Dopiero wtedy zamknąć FIX-01. FIX-02 pozostaje otwarte aż do wykonania i odbioru zmian. H są wówczas końcowymi wyborami pozostawienia na ten etap, a niewykonane pomiary pozostają niewykonane. Nie tworzyć obecnie pozornej akceptacji ani podsumowania ukończonego 04-04.

Podstawa wymagania odpowiedzi: [AGENTS.md, Sposób pracy](../../../AGENTS.md) „Plan → akceptacja użytkownika → implementacja” oraz [ROADMAP, kryterium 3 fazy 4](../../ROADMAP.md). Niniejszy dokument zbiera cały pozostały zakres do jednego wyboru, zgodnie z prośbą użytkownika.


## 9. Sprawdzenie gotowości tej propozycji

2026-10-26: kontrola strukturalna potwierdziła 62 pakiety (8 wcześniej zaakceptowanych, 54 oczekujące), 106 wyborów, 27 H, poprawne odsyłacze/tabele i brak zmiany statusów wcześniejszych zgód. `git diff --check` bez błędów. Kod `apps/`, `packages/` i źródłowe dokumenty zasad bez zmian względem HEAD. `pnpm typecheck && pnpm test` przeszło: 1819 testów gier i 15 serwera, łącznie 1834. Jest to kontrola obecnej bazy i dokumentacji planu, nie dowód wykonania lub odbioru przyszłych zmian.


## 10. Otrzymana odpowiedź

2026-10-26: użytkownik **„Zatwierdzam”**, cały ZG4-v1 bez wyjątków. Rejestry zostały uzgodnione w 04-04, a zatwierdzony zakres przekazano w [PHASE-5-SCOPE.md](PHASE-5-SCOPE.md). Nie jest to deklaracja wykonania poprawek.

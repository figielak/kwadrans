# Raport do akceptacji R4-v1

**2026-10-26 · pełna akceptacja ZG4-v1 · faza 4 zakończona (5/5).** Wszystkie P4-001..062 zatwierdzone do wykonania; 27 H pozostawionych z powodami, 106 D4 rozstrzygniętych. [Końcowa zgoda](FINAL-APPROVAL.md), [rejestr odpowiedzi](DECISIONS.md#zg4-accepted), [zakres fazy 5 S5-v1](PHASE-5-SCOPE.md). FIX-01 zakończone; FIX-02 otwarte. Kod i dane bez zmian.

Gracz może stracić prawidłowy wynik po czasie lub nie dosięgnąć akcji na małym ekranie. Proponuję najpierw naprawić te potwierdzone problemy. Zmiany trudności i balansu oparte na modelach oraz brakujące testy urządzeń mają osobne warunki, dzięki czemu nie blokują niezależnych poprawek.

## 1. Co wiadomo

- **168 wpisów** po scaleniu 173 źródeł: 7 wysokich (w tym jeden warunkowo), 55 średnich, 106 niskich. To liczba problemów zbiorczych, nie gotowych commitów. Wagi pozostały bez zmian; priorytety poniżej są osobną oceną wdrożenia.
- Wersja kodu: HEAD `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3`, gałąź `labirynt`. Zastano niezacommitowane materiały 04-02 i zachowano je. Kod i źródłowe zasady bez różnic względem 04-02 i baz audytu.
- Dowody: audyty statyczne F1/F2/F3 oraz **15 pomiarów renderowania z 2026-10-26** i partia sieciowa Memory. Mierzone stany potwierdzają: Memory 651/695 px, Labirynt 830, Chińczyk 750, Gomoku 686, rozstawianie Statków 781, Kalambury 723, Koło 707. Koło po partii ma 1345 px i akcje na y>1200; w odsłonach Kalamburów i Państw-miast Dalej już jest dostępne.
- Kampus Tour: okno 640×360 i scena 800×390 w skali 0,8. Ucięte licznik/log i Podsumowanie; przyciski 48 px sceny mają 38,39 px na ekranie. Nie potwierdzono ucięcia Rewanżu w zmierzonym stanie.
- Modele czasu Środka/Tortu, osiągalność kompletu W pamięci i wyniki botów nadal **nie są pomiarami ludzi**. Brak Androida z klawiaturą, TalkBack/VoiceOver, słabszego telefonu i realnych 60/120 Hz. Kopia bazy nie odtwarza wszystkich przebiegów; nie pobierano niczego z Pi.

Pełne źródła i plik:linia: [FINDINGS v1.1](FINDINGS.md). Metoda, wyniki E01-E15 i wszystkie otwarte U/P: [EVIDENCE v1](04-02-EVIDENCE.md). Warianty: [106 kart D4](DECISIONS.md). Zamknięte zakresy i odbiór: [62 karty PK4-v1](PACKAGES.md).

## 2. Pierwszy zestaw decyzji (historyczna propozycja 04-03)

Poniższe pozycje można omówić oddzielnie. Zgoda na przygotowanie audytu ani „kolejny task” nie jest decyzją o wariancie.

| Propozycja | Skutek i wariant | Pakiety / dowód |
|---|---|---|
| Utrzymać wartość prawidłowo ukończonej partii | D4-001/002/003:A, timeout zawsze za wynikiem ukończonym. Schulte/Sudoku wymagają wcześniej decyzji o reprezentacji i starych danych. | P4-002; F4-001; G-DANE |
| Naprawić Zakupy jednym pakietem | D4-006:A (80 s i automat po MAX_MS), D4-050:A (pointerdown). Lista nadal 10, bez zmiany sufitu. | P4-003; F4-002:zakupy/F4-059 |
| Nie tracić osiągniętego wyniku | Sekwencja D4-004:A zachowuje serię po 300 s; W pamięci D4-071:A oddaje od razu po błędzie/komplecie. Nie dodawać nowego tie szybkości. | P4-004/005; F4-002:simon/F4-083 |
| Odsłonić plansze i dolne akcje | D4-055:A: najpierw wspólny nagłówek, potem konkretne gry; D4-057:A: wyniki mogą przewijać się, akcje zostają przyklejone. | P4-006..016; E01-E12. Android P4-015 warunkowo po U02 |
| Naprawić środek Kampus Tour | D4-058:A i D4-060:A: stałe informacje/akcje, log 1-2, cele 48 px po skali; D4-067:A pełny zakres nagłówka. | P4-017; E13-E15 |
| Rozstrzygnąć wyjątek małych pól | D4-059:A tylko z podglądem i osobnym potwierdzeniem 48 px; Labirynt obecnie go nie ma, więc potrzebna jawna decyzja o dodaniu potwierdzenia. | P4-036, zależne plansze |
| Pozwolić działać podczas animacji | D4-051/052:A: dotyk kończy pokaz, ruch odpowiada stanowi serwera. | P4-018/019; F4-057 |
| Doprecyzować wspólne normy | D4-005:A próg 20%/10 s dopiero jako nowa reguła; D4-035:B pozwala na uzasadniony remis kompletu. Pozostałe limity i tie wybierane per gra. | P4-001; H-001..018 |
| Zachować dane świadomie przed zmianą losowania | D4-013/014/015/016/022/028:A proponują stały cel/tempo/komplety. Najpierw zgoda na porównywalność historii; żadnej migracji ani zmiany id w tym raporcie. | P4-055..060; G-DANE |

Jeśli wybierany jest wariant B lub wyjątek od propozycji, trzeba wskazać jego powód i wystąpienie. Format późniejszej decyzji może być krótki: **„R4-v1 / PK4-v1: P4-003 poprawić według propozycji; P4-015 pozostawić otwarte do U02; H-017 zostawić z podanym powodem”**. To przykład składni, nie zapis uzyskanej zgody. Zatwierdzenie pakietu obejmuje tylko jego listę zakresu i podane warianty; nie obejmuje migracji, implementacji alternatyw H ani całego agregatu F4, którego inną część posiada inny pakiet.

## 3. Pakiety zaakceptowane do wykonania

62 zatwierdzone pakiety: **19 P1, 36 P2, 7 P3**. Rozmiary: 8S/45M/9L. Aktualna kolejność wykonania z P4-027 przed P4-002 jest w PHASE-5-SCOPE §2; numery kolejno w poniższej tabeli zachowują historyczny porządek 04-03. Tabela respektuje zależności; bramki oznaczają warunek do przygotowania/odebrania zmiany, nie nowo potwierdzony błąd. „Akceptacja” oznacza brak osobnej bramki G/U/P na karcie; decyzja użytkownika i cały opisany odbiór nadal obowiązują. U/P w tabeli mogą dotyczyć odbioru, a nie blokować samo przygotowanie poprawki.

| Kolejno | Pakiet | Priorytet / rozmiar | Brakujący dowód / wybór przed poprawką lub odbiorem | Decyzja |
|---|---|---|---|---|
| 1 | [P4-001: Wspólne reguły i granice wyjątków](PACKAGES.md#p4-001) | P2 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 2 | [P4-002: Najgorszy wynik po limicie](PACKAGES.md#p4-002) | P1 / L | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 3 | [P4-003: Zakupy: pełny czas i pomiar zatwierdzenia](PACKAGES.md#p4-003) | P1 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 4 | [P4-004: Sekwencja: zachowanie zaliczonej serii](PACKAGES.md#p4-004) | P1 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 5 | [P4-005: W pamięci: oddanie bez dodatkowego przycisku](PACKAGES.md#p4-005) | P1 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 6 | [P4-006: Wspólny nagłówek aktywnej partii](PACKAGES.md#p4-006) | P1 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 7 | [P4-011: Memory: wszystkie rzędy kart](PACKAGES.md#p4-011) | P1 / M | U01 | poprawić, zatwierdzone ZG4-v1 |
| 8 | [P4-012: Kalambury: zgadywanie i Pasuję](PACKAGES.md#p4-012) | P1 / M | U02 | poprawić, zatwierdzone ZG4-v1 |
| 9 | [P4-013: Koło: zakończenie prób widoczne](PACKAGES.md#p4-013) | P1 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 10 | [P4-014: Państwa-miasta: formularz i tabela głosowania](PACKAGES.md#p4-014) | P1 / M | U02 | poprawić, zatwierdzone ZG4-v1 |
| 11 | [P4-015: Kropki, Kąt, W pamięci: pole przy klawiaturze](PACKAGES.md#p4-015) | P1 / M | U02 | poprawić, zatwierdzone ZG4-v1 |
| 12 | [P4-016: Wyniki: dostępne Rewanż i Do lobby](PACKAGES.md#p4-016) | P1 / M | U07 | poprawić, zatwierdzone ZG4-v1 |
| 13 | [P4-017: Kampus Tour: środek i akcje po skalowaniu](PACKAGES.md#p4-017) | P1 / L | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 14 | [P4-018: Kampus Tour: decyzja bez czekania na marsz](PACKAGES.md#p4-018) | P1 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 15 | [P4-023: Quizy: walidacja i wierne czasy trafień](PACKAGES.md#p4-023) | P1 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 16 | [P4-036: Gęste plansze: wybór z potwierdzeniem](PACKAGES.md#p4-036) | P2 / M | doprecyzowanie wyboru na karcie | poprawić, zatwierdzone ZG4-v1 |
| 17 | [P4-007: Gomoku: plansza nad dolną akcją](PACKAGES.md#p4-007) | P1 / M | U01 | poprawić, zatwierdzone ZG4-v1 |
| 18 | [P4-008: Statki: rozstawianie i bitwa w ekranie](PACKAGES.md#p4-008) | P1 / M | U01 | poprawić, zatwierdzone ZG4-v1 |
| 19 | [P4-009: Chińczyk: domki i kostka w ekranie](PACKAGES.md#p4-009) | P1 / M | U01 | poprawić, zatwierdzone ZG4-v1 |
| 20 | [P4-010: Labirynt: własny pionek i wybór ruchu](PACKAGES.md#p4-010) | P1 / M | U01 | poprawić, zatwierdzone ZG4-v1 |
| 21 | [P4-019: Chińczyk: ruch dostępny w animacji](PACKAGES.md#p4-019) | P1 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 22 | [P4-020: Śledzenie: 360 s na pełną partię](PACKAGES.md#p4-020) | P2 / S | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 23 | [P4-021: Który rok?: 270 s z zapasem sieciowym](PACKAGES.md#p4-021) | P2 / S | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 24 | [P4-022: Jeden termin mini-gry niezależny od rywali](PACKAGES.md#p4-022) | P2 / M | G-LIMITY | poprawić, zatwierdzone ZG4-v1 |
| 25 | [P4-024: Jeden komparator średniego czasu](PACKAGES.md#p4-024) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 26 | [P4-025: Jawny remis i kolejność dalszych miejsc](PACKAGES.md#p4-025) | P2 / M | G-KONTRAKT | poprawić, zatwierdzone ZG4-v1 |
| 27 | [P4-026: Kampus Tour: karta, wykup i rzeczywisty czynsz](PACKAGES.md#p4-026) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 28 | [P4-027: Kalambury: podpowiedź tylko po limicie](PACKAGES.md#p4-027) | P2 / M | G-KONTRAKT | poprawić, zatwierdzone ZG4-v1 |
| 29 | [P4-028: Labirynt: losowy legalny krok po czasie](PACKAGES.md#p4-028) | P2 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 30 | [P4-029: Testy: Kampus Tour](PACKAGES.md#p4-029) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 31 | [P4-030: Testy: gry główne i Turniej](PACKAGES.md#p4-030) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 32 | [P4-031: Testy: quizy i Stój!](PACKAGES.md#p4-031) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 33 | [P4-032: Testy: pozostałe mini-gry](PACKAGES.md#p4-032) | P2 / L | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 34 | [P4-033: Rekordowa partia ze stanu, także me=""](PACKAGES.md#p4-033) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 35 | [P4-037: Zwykłe kontrolki 48 px](PACKAGES.md#p4-037) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 36 | [P4-038: Tort: uchwyt cięcia pod palcem](PACKAGES.md#p4-038) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 37 | [P4-039: Śledzenie: rozdzielne cele dotyku](PACKAGES.md#p4-039) | P2 / M | G-DANE, U12, U13 | poprawić, zatwierdzone ZG4-v1 |
| 38 | [P4-040: Reduced motion: zadanie działa, komunikat widoczny](PACKAGES.md#p4-040) | P2 / M | U13, U14 | poprawić, zatwierdzone ZG4-v1 |
| 39 | [P4-041: Katalog i opisy animacji](PACKAGES.md#p4-041) | P3 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 40 | [P4-042: Przejścia, pętle i paski czasu](PACKAGES.md#p4-042) | P2 / L | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 41 | [P4-043: Błąd, ignorowany ruch i nowa decyzja](PACKAGES.md#p4-043) | P2 / L | U14 | poprawić, zatwierdzone ZG4-v1 |
| 42 | [P4-044: Odsłona wyniku i prawdy](PACKAGES.md#p4-044) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 43 | [P4-045: Zaznaczenie, okno i błysk trafienia](PACKAGES.md#p4-045) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 44 | [P4-046: Koniec, para i powrót do partii](PACKAGES.md#p4-046) | P2 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 45 | [P4-048: Wspólne wyniki i tabele rund](PACKAGES.md#p4-048) | P2 / M | U04 | poprawić, zatwierdzone ZG4-v1 |
| 46 | [P4-050: Role tokenów i drugi sygnał stanu](PACKAGES.md#p4-050) | P2 / L | U12, U11 | poprawić, zatwierdzone ZG4-v1 |
| 47 | [P4-051: Etykiety, natywne kontrolki i wykres dotykiem](PACKAGES.md#p4-051) | P2 / L | U10, U11 | poprawić, zatwierdzone ZG4-v1 |
| 48 | [P4-052: Czytelne stany oczekiwania, błędu i blokady](PACKAGES.md#p4-052) | P2 / L | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 49 | [P4-055: Stoper: stały cel](PACKAGES.md#p4-055) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 50 | [P4-056: Rytm: stałe tempo](PACKAGES.md#p4-056) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 51 | [P4-057: Liczenie: komplet rodzajów](PACKAGES.md#p4-057) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 52 | [P4-058: Obrót: sześć rodzajów planszy](PACKAGES.md#p4-058) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 53 | [P4-059: W pamięci: stała liczba mnożeń](PACKAGES.md#p4-059) | P2 / M | G-DANE, P11 | poprawić, zatwierdzone ZG4-v1 |
| 54 | [P4-060: Balon: ten sam komplet ryzyka](PACKAGES.md#p4-060) | P2 / M | G-DANE | poprawić, zatwierdzone ZG4-v1 |
| 55 | [P4-061: Zegar bodźca i dotyku](PACKAGES.md#p4-061) | P2 / M | G-DANE, U14 | poprawić, zatwierdzone ZG4-v1 |
| 56 | [P4-062: Państwa-miasta: pominąć Ł](PACKAGES.md#p4-062) | P2 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 57 | [P4-034: Jedna lista mini-gier i klucz rewanżu](PACKAGES.md#p4-034) | P3 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 58 | [P4-035: Wspólne funkcje bez zmiany reguł](PACKAGES.md#p4-035) | P3 / S | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 59 | [P4-047: Słowa czynności i przejść](PACKAGES.md#p4-047) | P3 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |
| 60 | [P4-049: Liczby, etykiety i wąskie kolumny](PACKAGES.md#p4-049) | P3 / L | U04, U05, U06 | poprawić, zatwierdzone ZG4-v1 |
| 61 | [P4-053: Wąskie podpisy i hierarchia ekranów](PACKAGES.md#p4-053) | P3 / M | U03, U04, U09 | poprawić, zatwierdzone ZG4-v1 |
| 62 | [P4-054: Nieaktualne opisy bez zmiany zasad](PACKAGES.md#p4-054) | P3 / M | akceptacja | poprawić, zatwierdzone ZG4-v1 |

## 4. Reguły i pomiary: zakres wybrany w ZG4-v1

- **Wynik/limit/komparator:** P4-002/003/004/020/021/022/023/024, reprezentacja remisu P4-025, timeout Labiryntu P4-028. P4-005 zmienia moment wysłania, zachowując wzór wyniku. Test i dokument przed implementacją każdej zmienionej zasady.
- **Gry główne:** P4-026 obieg Zaliczenia oraz opis Juwenaliów/budynków i statystyka faktycznej zapłaty; P4-027 wcześniejsze hint; P4-062 litera Ł. Bez automatycznej korekty premii, MPK, monopolu, punktów Kalamburów ani długości Turnieju.
- **Losowanie:** oddzielnie P4-055..060. Zmiana jednostki ms na promile nie jest rekomendowanym wariantem tego zestawu; gdy użytkownik ją wybierze, konieczny osobny projekt zgodności danych. Nowy klucz zapisu nigdy nie oznacza zmiany id gry.
- **Normy UI/animacji:** P4-001/014/016/036/040..050 dopisują lub uzgadniają wyjątki, wzorce wyników i efekty. Wybór dokumentacyjny nie może po cichu zmienić punktacji ani zagłuszyć bodźca gry.
- **Pozycje H:** 27 propozycji z powodami w [PACKAGES §4](PACKAGES.md). Środek/Tort P14; głosowanie P08 po czytelnym UI; generatory i sufity P09-P19/P22 oraz analiza generatora; ekonomia/kolejność P01-P07; Kalambury P20. MP-01/P21 Mapa bez nowego błędu. Wszystkie H mają końcową decyzję pozostawienia na ten etap, z uzasadnieniami ZG4-v1 §5; pomiary nie zostały przez to wykonane.
- **Urządzenia:** U02 przed poprawką klawiatury; U10/U11 dla wykresu/czytników; U12 dla kolorów celów; U13/U14 dla ruchu i zegarów. U01/U03-U09 uzupełniają konkretne konfiguracje, wąskie teksty i pełny RecordPanel. Dokładne miary i wykonawcy są w EVIDENCE, nic nie oznaczono jako zmierzone bez dowodu.

Najwyższa waga warunkowa W pamięci (sufit 12) nie dostała automatycznie P1 ani pakietu zmiany tie. Utrata wyniku W pamięci po odłożeniu telefonu to inny, potwierdzony mechanizm i ma P4-005/P1. Podobnie niezmierzona klawiatura Androida ma warunkowe P1, bez twierdzenia o wykonanym teście.

## 5. Końcowa kontrola kryteriów fazy 4

| Kryterium roadmapy | Artefakt / dowód | Wynik 2026-10-26 |
|---|---|---|
| 1. Raport bez duplikatów, plik:linia, waga i propozycja | FINDINGS v1.1: 173 źródła → 168 F4, pięć scaleń; źródłowa mapa i karty zachowane | **spełnione**; wszystkie 173 źródła zmapowane, wagi i dowody bez zmian |
| 2. Samodzielne pakiety z priorytetem, odbiorem i zmianą zasad | PACKAGES PK4-v1 + ZG4-v1; S5-v1 §2-4: 62 pakiety, 295 jednostek, zależności i T/UI/D | **spełnione**; acykliczny graf, source w P4-027 przed P4-002, szczegółowy odbiór i pliki |
| 3. Decyzja użytkownika dla każdego wpisu | Użytkownik „Zatwierdzam”; DECISIONS §14, FINAL-APPROVAL ZG4-v1; statusy 106 D4 i 168 F4 | **spełnione**; 267 części poprawić, 28 pozostawić z powodem; 27 H, 47 odstępstw i MP-01 rozstrzygnięte; zero otwartych decyzji |
| 4. Zatwierdzone pakiety jako zakres fazy 5 | PHASE-5-SCOPE S5-v1: wszystkie 62 karty z częściami/plikiem/odbiórem; 27 H i routing 47 odstępstw; pierwszy plan 05-01 | **spełnione**; 295/295 części ma właściciela i miejsce w przekazaniu, bez niezatwierdzonych alternatyw |

Kontrola mapowania i metadanych jest udokumentowana w [04-05-SUMMARY](04-05-SUMMARY.md). Brak pomiaru urządzenia oznacza przyszły nieodebrany fragment, a nie oczekującą decyzję zakresową. H zamknięto rzeczywistym wyborem pozostawienia z powodem, nie domyślną zgodą. FIX-01 jest zakończone; FIX-02 nadal otwarte.

## 6. Weryfikacja i wersja

W 04-03 zmieniono wyłącznie materiały planowania. Bez nowych pomiarów UI, zmian zasad źródłowych, implementacji, zależności, commitów i push. Kontrola zakresu sprawdza pełne mapowanie, brak duplikatów, istniejące odsyłacze F4/D4/P4/H, zgodność wariantów i brak cykli. `pnpm typecheck && pnpm test` przeszło: 1819 testów gier i 15 serwera, razem 1834. To dowód niezmienionej bazy, nie odbiór przyszłych poprawek.

Zmiana merytoryczna karty podnosi wersję tego zakresu i raportu; korekta literówki bez wpływu na wybór nie tworzy dorozumianej akceptacji. Każda późniejsza decyzja musi wskazywać R4-v1/PK4-v1 lub ich jawną następną wersję, pakiety, warianty i wyjątki. Następny plan wykonawczy: **05-01, P4-001**, objęty zatwierdzonym ZG4-v1; ponowna zgoda na ten sam zakres nie jest wymagana.


## 7. Rozpoczęcie 04-04 (historia)

2026-10-26: aktualność kodu potwierdzona, bez nowych pomiarów. Pierwszy konkretny zestaw [B4-001](DECISIONS.md#b4-001) obejmuje P4-005/006/012/013/016 i wskazane tam warianty A. Użytkownik zatwierdził wszystkie pięć odpowiedzią „Zatweirdzam”, bez wyjątków. Aktualizacja DECISIONS §10, kart PACKAGES i wpisów FINDINGS zachowuje tę samą granicę zakresu. Pozostałe zakresy nadal oczekują; 04-04 jest w toku, a faza 4 ma nadal 3/5 zakończonych planów.


## 8. Akceptacja B4-002 (historia)

[Trzy kolejne propozycje](DECISIONS.md#b4-002): Zakupy P4-003 (80 s, automatyczne oddanie i pointerdown), Sekwencja P4-004 (zaliczona seria po 300 s) oraz gęste plansze P4-036 (małe pola tylko z podglądem i potwierdzeniem, dodanym także w Labiryncie). Propozycja danych tylko dla Zakupów/Sekwencji: zachować stare rekordy bez przeliczania/resetu, z jawną różnicą historycznej metody. Użytkownik zatwierdził B4-002 odpowiedzią „Tak”, wraz z zachowaniem rekordów; normy P4-001 i polityka danych pozostałych gier nadal czekają.


## 9. B4-003: zestaw włączony do końcowej propozycji (historia)

[Osiem kolejnych pakietów](DECISIONS.md#b4-003): P4-007/008/009/010/011 dla plansz Gomoku, Statków, Chińczyka, Labiryntu i Memory; P4-017 dla środka i akcji Kampus Tour; P4-018/019 dla działania podczas animacji. Wszystkie oczekują wyboru w ZG4-v1, bez osobnej zgody na tę paczkę. Zgoda nie zmieni punktacji ani ekonomii; szczegóły zakresów i wariantów w DECISIONS §12.


## 10. Przygotowanie jednej końcowej zgody ZG4-v1 (historia)

Użytkownik poprosił o jeden końcowy wybór całego pozostałego zakresu. [FINAL-APPROVAL.md](FINAL-APPROVAL.md) jest konkretną nową wersją tej propozycji: 54 pozostałe pakiety, 27 H, 47 istniejących odstępstw, MP-01 i 106 wariantów, bez ponownego zatwierdzania 8 wcześniej zaakceptowanych pakietów. Podstawa R4-v1/PK4-v1 pozostaje dostępna, a §3 ZG4-v1 jawnie wylicza uzupełnienia zakresu i polityki danych. Prośba o przygotowanie zgody nie jest akceptacją.

Proponowane rozstrzygnięcia brakujących bramek: zachować historię w tej samej jednostce mimo różnic trudności/metody; nowe timeouty Schultego/Sudoku bez rekordu, stare bez zgadywania statusu; Śledzenie z osobnym panelem wyboru bez zmiany generatora; Dziesiątki z obecnym generatorem (nowy wariant C zamiast sprzecznego skrótu B). H mają propozycję końcowego pozostawienia z uzasadnieniem, a nie niekończącej się decyzji odłożonej do pomiaru. U/P pozostają rzeczywistymi pomiarami do wykonania tam, gdzie warunkują odbiór. Wdrożenie dopiero po zgodzie i przekazaniu do fazy 5. Kryteria 3/4 fazy 4 i FIX-01 nadal nie są zamknięte.


## 11. Końcowa odpowiedź i przekazanie

2026-10-26 użytkownik **„Zatwierdzam”** zaakceptował cały ZG4-v1 bez wyjątków. §7-10 zachowują historię częściowych zgód i przygotowania końcowej propozycji; aktualny stan to pełna akceptacja. Nie będą zadawane kolejne pytania o te same paczki.

04-04 zakończone po przeniesieniu wszystkich wyborów; 04-05 zakończone po kontroli 173 źródeł, 168 F4, 106 D4, 62 pakietów, 27 H, 47 odstępstw i 295 rozłącznych części. Zakres wdrożenia: [PHASE-5-SCOPE.md](PHASE-5-SCOPE.md); pierwszy plan: [05-01](../05-poprawki-zaakceptowanych-rozbieznosci/05-01-PLAN.md). Faza 4 ma 5/5 zakończonych planów. Implementacja: 0/62, bez zmian kodu, źródłowych zasad i danych. FIX-02 pozostaje otwarte. Testy/odbiór przyszłych poprawek nadal wymagane, bez nowych zależności, commitów i push w tym zadaniu.

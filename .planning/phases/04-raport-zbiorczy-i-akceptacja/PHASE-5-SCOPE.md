# Zakres fazy 5: zatwierdzone poprawki ZG4-v1

Data przekazania: **2026-10-26**. Wersja: **S5-v1**, wykonawcze przekazanie zatwierdzonego **PK4-v1 + ZG4-v1**; bez nowego wyboru wariantów. Źródło upoważnienia: użytkownik **„Zatwierdzam”** w odpowiedzi na pytanie o cały ZG4-v1; [DECISIONS §14](DECISIONS.md#zg4-accepted), [FINAL-APPROVAL](FINAL-APPROVAL.md). B4-001/B4-002 zachowane.

**Stan wykonania: 10/62 pakietów, 17/267 części poprawek.** P4-014 wdrożony, 2/3 części odebrane; formularz oczekuje fizycznego U02. Zakończono P4-001, P4-027, P4-002..006 i P4-011..013.
Dowody: 05-01..11-SUMMARY.md w ../05-poprawki-zaakceptowanych-rozbieznosci/. Zakres zaakceptowany nie oznacza poprawionego kodu ani odbioru. FIX-01 zakończone po kontroli przekazania; FIX-02 pozostaje otwarte. Kod bazowy: `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3`, gałąź labirynt, bez zmian w apps/packages i źródłowych zasadach podczas fazy 4.

## 1. Pełne pokrycie i granice

- 168 F4 z 173 źródeł; 295 jednostek zakresu ma dokładnie jednego właściciela: **267 części do poprawy, 28 pozostawić z powodem w 27 H**. 158 F4 w całości poprawić, 8 pozostawić, 2 mieszane. Zero otwartych decyzji; brak odrzuconych wpisów.
- Wszystkie P4-001..062 do wykonania. P4-028 obejmuje dodatkowo istniejące odstępstwo F1:O04, bez nowego F4. D4-018:C zachowuje generator Dziesiątek; D4-090 ma lokalny A/B; Memory bez wyjątku małych kart. Wymagane testy i dokumentacja należą do pakietu, nie są późniejszą kosmetyką.
- 47 istniejących odstępstw według ZG4-v1 §6 / DECISIONS §7: utrzymać powody lub zastosować jawne korekty powiązanych pakietów. MP-01:B zamyka obserwację Mapy, bez nowego generatora.
- Rekordy i detail pozostają: bez kasowania, przeliczania, archiwizacji, migracji lub nowej wersji schematu. Nowe timeouty Schulte/Sudoku bez rekordu, stare bez zgadywania completed. Wspólna historia obejmuje różne metody/trudności; porównywalność nie jest gwarantowana. Obsługa tie/null zgodnie z ZG4-v1 §3.2.
- U/P nie są wykonane przez samą zgodę. Pomiary wymagane do wykonania lub odbioru nadal trzeba zebrać; brak dowodu nie oznacza nowego wyboru zakresu. H mają końcową decyzję pozostawienia na ten etap, a badania ich alternatyw pozostają poza tym zakresem.
- Bez commitów/push/produkcji, nowych zależności, nowych gier, zmiany id i pobierania bazy z Pi. Rozbijanie tych prac na zadania nie wymaga kolejnej akceptacji tego samego zakresu.

## 2. Kolejność i podział wdrożenia

Wstępny podział prac według zależności, bez dodawania nowych faz wymagających akceptacji:

| Obszar | Zakres i warunek |
|---|---|
| Normy i utrata wyniku | P4-001, wspólny kontrakt source w P4-027, potem P4-002; P4-003..005 oraz P4-023. Schulte/Sudoku i Kalambury korzystają z jednego źródła timeout. |
| Dostępne plansze | P4-006 i P4-036 przed zależną geometrią P4-007..011/013; P4-012..019 z własnymi warunkami klawiatury i animacji. |
| Terminy i zasady | P4-020/021 po normach, P4-022 po P4-003/004/020/021; P4-024..028/062 zgodnie z grafem. |
| Brakujące testy i podpięcie | P4-029..035. Test zmienianej reguły zawsze wcześniej w pakiecie zmiany, bez oczekiwania na pakiet luk. |
| Dotyk, animacje, semantyka | P4-037..054; katalog P4-041 i reduced motion przed zależnymi efektami, wspólne tabele przed formatowaniem. P4-039: panel, bez GAP. |
| Losowanie i zegar | P4-055..061 z zachowaniem starej historii; P4-059 wymaga P11, P4-061 wymaga U14. |
| Powody i odbiór | Dokumentacja 27 H i 47 odstępstw przypisana w §5; końcowe sprawdzenie 295 części oraz wymaganych scenariuszy. |

Powyższe obszary nie dodają wzajemnych zależności. Można przejść do następnego niezależnego pakietu, jeśli inny oczekuje rzeczywistego pomiaru. Kolejność poniżej jest topologiczna; P4-027 przesunięto przed P4-002 dla wspólnego source. Nie wdrażać usunięcia odnowień terminu przed poprawkami jego zależności.

| Kolejno | Pakiet | Priorytet | Liczba części F4 | Status wykonania |
|---|---|---|---|---|
| 1 | [P4-001: Wspólne reguły i granice wyjątków](#scope-p4-001) | P2 | 5 | wykonane 2026-10-26, 05-01 |
| 2 | [P4-027: Kalambury: podpowiedź tylko po limicie](#scope-p4-027) | P2 | 1 | wykonane 2026-10-26, 05-02 |
| 3 | [P4-002: Najgorszy wynik po limicie](#scope-p4-002) | P1 | 1 | wykonano 2026-10-29, TDD e635dc9 |
| 4 | [P4-003: Zakupy: pełny czas i pomiar zatwierdzenia](#scope-p4-003) | P1 | 2 | wykonano 2026-10-29, testy 7045659/76455c9 |
| 5 | [P4-004: Sekwencja: zachowanie zaliczonej serii](#scope-p4-004) | P1 | 1 | wykonano 2026-10-29, testy f3e7958 |
| 6 | [P4-005: W pamięci: oddanie bez dodatkowego przycisku](#scope-p4-005) | P1 | 1 | wykonano 2026-10-29, testy 28196b5 |
| 7 | [P4-006: Wspólny nagłówek aktywnej partii](#scope-p4-006) | P1 | 1 | wykonano 2026-10-29, 05-07 |
| 8 | [P4-011: Memory: wszystkie rzędy kart](#scope-p4-011) | P1 | 1 | wykonano 2026-10-29, 05-08 |
| 9 | [P4-012: Kalambury: zgadywanie i Pasuję](#scope-p4-012) | P1 | 1 | wykonano 2026-10-29, 05-09; U02 fizyczne otwarte |
| 10 | [P4-013: Koło: zakończenie prób widoczne](#scope-p4-013) | P1 | 1 | wykonano 2026-10-29, 05-10 |
| 11 | [P4-014: Państwa-miasta: formularz i tabela głosowania](#scope-p4-014) | P1 | 3 | wdrożono 2026-10-29; 2/3 odebrane, U02 fizyczne oczekuje |
| 12 | [P4-015: Kropki, Kąt, W pamięci: pole przy klawiaturze](#scope-p4-015) | P1 | 3 | nie rozpoczęto |
| 13 | [P4-016: Wyniki: dostępne Rewanż i Do lobby](#scope-p4-016) | P1 | 1 | nie rozpoczęto |
| 14 | [P4-017: Kampus Tour: środek i akcje po skalowaniu](#scope-p4-017) | P1 | 4 | nie rozpoczęto |
| 15 | [P4-018: Kampus Tour: decyzja bez czekania na marsz](#scope-p4-018) | P1 | 3 | nie rozpoczęto |
| 16 | [P4-023: Quizy: walidacja i wierne czasy trafień](#scope-p4-023) | P1 | 2 | nie rozpoczęto |
| 17 | [P4-036: Gęste plansze: wybór z potwierdzeniem](#scope-p4-036) | P2 | 1 | nie rozpoczęto |
| 18 | [P4-007: Gomoku: plansza nad dolną akcją](#scope-p4-007) | P1 | 1 | nie rozpoczęto |
| 19 | [P4-008: Statki: rozstawianie i bitwa w ekranie](#scope-p4-008) | P1 | 1 | nie rozpoczęto |
| 20 | [P4-009: Chińczyk: domki i kostka w ekranie](#scope-p4-009) | P1 | 1 | nie rozpoczęto |
| 21 | [P4-010: Labirynt: własny pionek i wybór ruchu](#scope-p4-010) | P1 | 1 | nie rozpoczęto |
| 22 | [P4-019: Chińczyk: ruch dostępny w animacji](#scope-p4-019) | P1 | 1 | nie rozpoczęto |
| 23 | [P4-020: Śledzenie: 360 s na pełną partię](#scope-p4-020) | P2 | 1 | nie rozpoczęto |
| 24 | [P4-021: Który rok?: 270 s z zapasem sieciowym](#scope-p4-021) | P2 | 1 | nie rozpoczęto |
| 25 | [P4-022: Jeden termin mini-gry niezależny od rywali](#scope-p4-022) | P2 | 1 | nie rozpoczęto |
| 26 | [P4-024: Jeden komparator średniego czasu](#scope-p4-024) | P2 | 1 | nie rozpoczęto |
| 27 | [P4-025: Jawny remis i kolejność dalszych miejsc](#scope-p4-025) | P2 | 2 | nie rozpoczęto |
| 28 | [P4-026: Kampus Tour: karta, wykup i rzeczywisty czynsz](#scope-p4-026) | P2 | 4 | nie rozpoczęto |
| 29 | [P4-028: Labirynt: losowy legalny krok po czasie](#scope-p4-028) | P2 | 0 | nie rozpoczęto |
| 30 | [P4-029: Testy: Kampus Tour](#scope-p4-029) | P2 | 11 | nie rozpoczęto |
| 31 | [P4-030: Testy: gry główne i Turniej](#scope-p4-030) | P2 | 24 | nie rozpoczęto |
| 32 | [P4-031: Testy: quizy i Stój!](#scope-p4-031) | P2 | 20 | nie rozpoczęto |
| 33 | [P4-032: Testy: pozostałe mini-gry](#scope-p4-032) | P2 | 52 | nie rozpoczęto |
| 34 | [P4-033: Rekordowa partia ze stanu, także me=""](#scope-p4-033) | P2 | 2 | nie rozpoczęto |
| 35 | [P4-037: Zwykłe kontrolki 48 px](#scope-p4-037) | P2 | 1 | nie rozpoczęto |
| 36 | [P4-038: Tort: uchwyt cięcia pod palcem](#scope-p4-038) | P2 | 1 | nie rozpoczęto |
| 37 | [P4-039: Śledzenie: rozdzielne cele dotyku](#scope-p4-039) | P2 | 1 | nie rozpoczęto |
| 38 | [P4-040: Reduced motion: zadanie działa, komunikat widoczny](#scope-p4-040) | P2 | 4 | nie rozpoczęto |
| 39 | [P4-041: Katalog i opisy animacji](#scope-p4-041) | P3 | 3 | nie rozpoczęto |
| 40 | [P4-042: Przejścia, pętle i paski czasu](#scope-p4-042) | P2 | 8 | nie rozpoczęto |
| 41 | [P4-043: Błąd, ignorowany ruch i nowa decyzja](#scope-p4-043) | P2 | 5 | nie rozpoczęto |
| 42 | [P4-044: Odsłona wyniku i prawdy](#scope-p4-044) | P2 | 3 | nie rozpoczęto |
| 43 | [P4-045: Zaznaczenie, okno i błysk trafienia](#scope-p4-045) | P2 | 3 | nie rozpoczęto |
| 44 | [P4-046: Koniec, para i powrót do partii](#scope-p4-046) | P2 | 5 | nie rozpoczęto |
| 45 | [P4-048: Wspólne wyniki i tabele rund](#scope-p4-048) | P2 | 2 | nie rozpoczęto |
| 46 | [P4-050: Role tokenów i drugi sygnał stanu](#scope-p4-050) | P2 | 9 | nie rozpoczęto |
| 47 | [P4-051: Etykiety, natywne kontrolki i wykres dotykiem](#scope-p4-051) | P2 | 3 | nie rozpoczęto |
| 48 | [P4-052: Czytelne stany oczekiwania, błędu i blokady](#scope-p4-052) | P2 | 11 | nie rozpoczęto |
| 49 | [P4-055: Stoper: stały cel](#scope-p4-055) | P2 | 1 | nie rozpoczęto |
| 50 | [P4-056: Rytm: stałe tempo](#scope-p4-056) | P2 | 1 | nie rozpoczęto |
| 51 | [P4-057: Liczenie: komplet rodzajów](#scope-p4-057) | P2 | 1 | nie rozpoczęto |
| 52 | [P4-058: Obrót: sześć rodzajów planszy](#scope-p4-058) | P2 | 1 | nie rozpoczęto |
| 53 | [P4-059: W pamięci: stała liczba mnożeń](#scope-p4-059) | P2 | 1 | nie rozpoczęto |
| 54 | [P4-060: Balon: ten sam komplet ryzyka](#scope-p4-060) | P2 | 1 | nie rozpoczęto |
| 55 | [P4-061: Zegar bodźca i dotyku](#scope-p4-061) | P2 | 1 | nie rozpoczęto |
| 56 | [P4-062: Państwa-miasta: pominąć Ł](#scope-p4-062) | P2 | 1 | nie rozpoczęto |
| 57 | [P4-034: Jedna lista mini-gier i klucz rewanżu](#scope-p4-034) | P3 | 4 | nie rozpoczęto |
| 58 | [P4-035: Wspólne funkcje bez zmiany reguł](#scope-p4-035) | P3 | 1 | nie rozpoczęto |
| 59 | [P4-047: Słowa czynności i przejść](#scope-p4-047) | P3 | 6 | nie rozpoczęto |
| 60 | [P4-049: Liczby, etykiety i wąskie kolumny](#scope-p4-049) | P3 | 12 | nie rozpoczęto |
| 61 | [P4-053: Wąskie podpisy i hierarchia ekranów](#scope-p4-053) | P3 | 11 | nie rozpoczęto |
| 62 | [P4-054: Nieaktualne opisy bez zmiany zasad](#scope-p4-054) | P3 | 10 | nie rozpoczęto |

## 3. Wspólny proces i bramki

Dla każdej zmienianej reguły: przeczytać aktualną sekcję ZASADY-GIER i właściwe źródła; przygotować dokumentację oraz test regresji przed kodem. Repo wymaga osobnego commitu testów przed implementacją reguły, a commit/push tylko na prośbę. **ZG4-v1 nie udziela zgody na commit.** Zgodnie z 04-05-PLAN najpierw przygotować konkretny diff testu i dokumentu; przy braku upoważnienia do wymaganego commitu nie naruszać tej kolejności. Praca nad niezależnymi poprawkami i przygotowanie diffu są nadal dozwolone. To bramka procesu Git, nie ponowne zatwierdzenie pakietu.

Każdy pakiet kończy `pnpm typecheck && pnpm test` bez błędów; frontend także stosowny `pnpm --filter web build` i odbiór zmienionego UI. Powtórzyć metodę audytu dla każdego poprawianego F4. Nie pisać testów samego przeformatowania tekstu; testować zmieniane zachowanie i kontrakty.

Bramki wyboru G-DANE/G-LIMITY/G-KONTRAKT są zamknięte przez ZG4-v1, ale wymagane testy kompatybilności nadal trzeba wykonać. 30 limitów i wyjątki Środek 60 s/Tort 120 s/Który rok? 270 s zgodnie z ZG4-v1 §3.3, bez automatycznej aktywacji alternatyw z H.

UI: 360×640, cele 48 px po skalowaniu lub nazwany wyjątek z podglądem i potwierdzeniem. Scenariusze z kart: min/max graczy i obserwator, fazy gry, timeout, remis, wyjście, refresh/reconnect, rewanż i Do lobby; mini-gra również solo, pokój, rekordowy detail oraz turniej. U01-U14 mają miary/wykonawców w [EVIDENCE §3](04-02-EVIDENCE.md). Emulacja rozmiaru nie zastępuje Androida z klawiaturą, VoiceOver/TalkBack, słabszego telefonu ani 60/120 Hz. Agent wykonuje dostępne automatyczne kontrole, użytkownik odbiór wymagający jego urządzeń. Brak urządzenia pozostawia jawnie nieodebrany fragment; nie daje prawa oznaczyć FIX-02 jako zakończonego.

P4-015: U02 przed wyborem technicznej poprawki; P4-059: P11 przed odbiorem wpływu mnożeń; P4-061: U14 przed zmianą zegara. Pozostałe szczegółowe warunki odbioru z kart zachowane. Nie dodawać CSS na ślepo, jeśli wspólny nagłówek usunął naruszenie: zapisać pomiar spełnienia kryterium.

Każdą ukończoną część odnotować z dowodem testu/pomiaru, plikiem i datą w rejestrze wykonania; samo zaakceptowanie jej nie jest odhaczeniem poprawki. Kolejne zmiany wspólnych plików robić sekwencyjnie, zgodnie z PACKAGES §6; po zmianie geometrii powtórzyć zależny odbiór.

## 4. Karty wykonania: dokładne zakresy, pliki i odbiór

Poniższe karty są przekazaniem wybranych zakresów. Normatywne szczegóły zachowania są w zatwierdzonym ZG4-v1 i źródłowych dokumentach zmienianych dopiero w pakiecie; materiał audytu zachowuje dokładne plik:linia. Nie rozszerzać pakietu na inne wystąpienia znalezione przy okazji.

<a id="scope-p4-001"></a>

### P4-001. Wspólne reguły i granice wyjątków

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-005](DECISIONS.md#d4-005) → A; [D4-029](DECISIONS.md#d4-029) → A; [D4-035](DECISIONS.md#d4-035) → B; [D4-056](DECISIONS.md#d4-056) → A; [D4-062](DECISIONS.md#d4-062) → A.
- Jednostki: [F4-002](FINDINGS.md#f4-002): `regula-zapasu`; [F4-060](FINDINGS.md#f4-060): `całość`; [F4-061](FINDINGS.md#f4-061): `całość`; [F4-067](FINDINGS.md#f4-067): `całość`; [F4-069](FINDINGS.md#f4-069): `całość`
- Zachowanie: Jedna tabela tokenów w DESIGN, listy poza partią mogą przewijać się w pionie; jawny model T i zapas max(20% T,10 s) tylko jeśli wybrany; remis przy komplecie dozwolony z uzasadnieniem. Nie zmieniać samych limitów i losowania.
- Pliki: ZASADY.md §3-5; DESIGN.md §2/§6; KONCEPT.md odsyłacze.
- Zasady/dokumenty: **tak: normy platformy, bez zmiany pojedynczej gry**. Dokumenty: ZASADY; DESIGN; KONCEPT.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Sprawdzić spójność zapisów: model nie jest pomiarem, tokeny mają jedno źródło, reguła nie wymusza tie w każdej grze. Zmiany poszczególnych zasad i UI tylko w ich pakietach.
- Granice: Przyjęcie normy nie zatwierdza wynikających z niej limitów ani wyłączeń dostępności.
- Wykonanie: **zakończone 2026-10-26**, 5/5 części. Dowody każdej części i decyzji: [05-01-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-01-SUMMARY.md). Typecheck i 1834 testy poprawne; normy w ZASADY §3/§4, katalog i kontrakt w DESIGN §2/§5/§6. Bez zmian kodu i limitów gier.

<a id="scope-p4-027"></a>

### P4-027. Kalambury: podpowiedź tylko po limicie

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-094](DECISIONS.md#d4-094) → B.
- Jednostki: [F4-039](FINDINGS.md#f4-039): `całość`
- Zachowanie: Hint Kalamburów wyłącznie od timeoutu. Opcjonalny czwarty argument validateMove to zaufany {source: client lub timeout}, domyślnie client, przekazywany z miejsca wywołania serwera, nigdy z JSON klienta. Ten sam kontrakt obejmuje timeout Schulte/Sudoku z P4-002, zgodnie z ZG4-v1 §3.1.
- Pliki: packages/games/src/core.ts typ kontekstu, kalambury.ts/testy, index.test.ts zgodność wywołań; apps/server/src/LobbyRoom.ts ścieżka klient/timeout i test.
- Zasady/dokumenty: **tak: ograniczenie dozwolonego ruchu**. Dokumenty: ZASADY-GIER §Kalambury; KONCEPT §3 podpis validateMove.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: G-KONTRAKT: test fałszywego source w payloadzie oraz istniejących gier wołających validateMove trzema argumentami; to kontrola podanego kontraktu, nie dodatkowy wybór użytkownika.
- Odbiór: T + UI. Najpierw test wcześniejszego hint od rysującego i obcego, poprawnego timeoutu, zmiany half dokładnie raz oraz klucza turn. Serwerowy timeout nie może zostać odrzucony po usunięciu ścieżki klienta. /dev2/6 osób, refresh w obu połowach.
- Granice: Ukrycie przycisku nie jest walidacją. Wspólna walidacja timeoutów musi zachować validateMove jako strażnika.
- Wykonanie: **zakończone 2026-10-26**, 1/1 części. Testy w osobnym commicie `50172d5` na prośbę użytkownika „Tak”; implementacja lokalna. 1889 testów, typecheck i build poprawne; /dev 2/6 osób i refresh obu połówek odebrane. Dowody: [05-02-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-02-SUMMARY.md), [odbiór przeglądarkowy](../05-poprawki-zaakceptowanych-rozbieznosci/05-02-BROWSER.md).

<a id="scope-p4-002"></a>

### P4-002. Najgorszy wynik po limicie

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-001](DECISIONS.md#d4-001) → A; [D4-002](DECISIONS.md#d4-002) → A; [D4-003](DECISIONS.md#d4-003) → A.
- Jednostki: [F4-001](FINDINGS.md#f4-001): `całość`
- Zachowanie: Schulte/Sudoku: completed w stanie, ukończeni przed timeoutem; nowe timeouty bez rekordu przez istniejący filtr niefinitywnego record.score, bez niefinitywnych danych w JSON. Kropki: max(n,99-n). Historyczne nieoznaczone wyniki pozostają bez zgadywania, zgodnie z ZG4-v1 §3.1.
- Pliki: packages/games/src/{schulte,sudoku,kropki,core}.ts i testy; index.test.ts; apps/server/src/LobbyRoom.ts z zaufanym kontekstem source oraz testy; ekrany Schulte/Sudoku i brak nowego RecordPanel przy timeout. Bez zmiany schematu stats.ts/SQLite.
- Zasady/dokumenty: **tak: wynik i komparator**. Dokumenty: ZASADY-GIER trzy gry; KONCEPT §2.4; ZASADY §3.
- Zależności i rozpoczęcie: [P4-027](PACKAGES.md#p4-027) w zakresie wspólnego kontraktu source client/timeout. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.1; test kompletności/timeoutu i zgodności starego detail przed kodem. Kontekst wspólny, bez drugiej implementacji.
- Odbiór: T + UI. Najpierw testy: 170 s+4 pomyłki Schultego i 60 s+13 błędów Sudoku nadal przed timeoutem; żadna odpowiedź kropek gorsza od timeoutu; remis/solo/places oraz rekord mają identyczny komparator. UI: rekord ze starym detail, timeout jednego z 2/6 graczy, pełny remis i seria turniejowa.
- Granice: Nie rozpoznawać dawnego timeoutu po samym score. Stary nierozpoznawalny timeout może pozostać przed nowym ukończeniem w historycznym rankingu; jawnie zaakceptowany wyjątek ZG4-v1 §3.1.
- Wykonanie: **zakończone 2026-10-29**, 1/1 części po osobnym commicie testów e635dc9. Typecheck, 1918 testów, build i UI 2/6+refresh/stare detail/remis/punktacja i ekran turnieju poprawne. [Dowody wykonania](../05-poprawki-zaakceptowanych-rozbieznosci/05-03-SUMMARY.md). Faza 5: 3/62 pakietów i 7/267 części, FIX-02 otwarte.

<a id="scope-p4-003"></a>

### P4-003. Zakupy: pełny czas i pomiar zatwierdzenia

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-006](DECISIONS.md#d4-006) → A; [D4-050](DECISIONS.md#d4-050) → A.
- Jednostki: [F4-002](FINDINGS.md#f4-002): `zakupy`; [F4-059](FINDINGS.md#f4-059): `całość`
- Zachowanie: 80 s limitu platformy; po 50 s wybierania automatyczne oddanie zaznaczeń; koniec pomiaru na pointerdown, klawiatura przez click detail=0, bez podwójnego wyniku.
- Pliki: packages/games/src/zakupy.ts, zakupy.test.ts; apps/web/src/games/Zakupy.tsx.
- Zasady/dokumenty: **tak: limit i oddanie; dotyk przywraca wymaganą metodę**. Dokumenty: ZASADY-GIER §Zakupy; KONCEPT §3.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w B4-002: stare rekordy pozostają bez przeliczania i resetu. P4-001 wykonany; testy i dokumentacja P4-003 przygotowane przed kodem.
- Odbiór: T + UI. Test 80 s, granica MAX_MS i wynik z zaznaczeń; ten sam ruch ręczny/automatyczny; przytrzymanie przycisku nie dolicza czasu do tie; klawiatura działa raz. Solo/2/6 osób, odświeżenie pokazu i półki, wynik w rekordach i turnieju.
- Granice: Nie zwiększać listy do 12 pozycji; F4-159:zakupy pozostaje osobnym pytaniem.
- Wykonanie: **zakończone 2026-10-29**, 2/2 części. Testy 7045659/76455c9, typy i odbiór UI PASS; końcowo 1947 testów i build PASS. [Dowody](../05-poprawki-zaakceptowanych-rozbieznosci/05-04-SUMMARY.md).

<a id="scope-p4-004"></a>

### P4-004. Sekwencja: zachowanie zaliczonej serii

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-004](DECISIONS.md#d4-004) → A.
- Jednostki: [F4-002](FINDINGS.md#f4-002): `simon`
- Zachowanie: Przy 300 s serwer oddaje ostatnią zaliczoną serię z walidowanego progress, zamiast 0; bez dokładania tie szybkości.
- Pliki: packages/games/src/simon.ts, simon.test.ts, index.ts; apps/web/src/games/Simon.tsx; koperta progress pokoju tylko w wymaganym zakresie.
- Zasady/dokumenty: **tak: wynik po czasie i progress**. Dokumenty: ZASADY-GIER §Sekwencja; KONCEPT §2.4/§3.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w B4-002: stare rekordy pozostają bez przeliczania i resetu. P4-001 oraz ten pakiet wykonane.
- Odbiór: T + UI. Najpierw testy progress 0/1/100, odrzucenia obcego, ułamka, cofnięcia lub wyniku po końcu; timeout zachowuje ostatnią zaliczoną, nie zaczętą serię. /dev: seria blisko 300 s, pomyłka/timeout/refresh i rewanż, solo/6/turniej.
- Granice: Zaufany model mini-gier nie znosi walidacji; bufor 100 kolorów nie daje skończonego czasu decyzji gracza.
- Wykonanie: **zakończone 2026-10-29**, 1/1 części. Testy f3e7958, typy i odbiór UI PASS; końcowo 1947 testów i build PASS. [Dowody](../05-poprawki-zaakceptowanych-rozbieznosci/05-05-SUMMARY.md).

<a id="scope-p4-005"></a>

### P4-005. W pamięci: oddanie bez dodatkowego przycisku

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-071](DECISIONS.md#d4-071) → A.
- Jednostki: [F4-083](FINDINGS.md#f4-083): `całość`
- Zachowanie: Pomyłka lub komplet wysyła wynik od razu; odsłona służy obejrzeniu odpowiedzi, nie uruchomieniu zapisu.
- Pliki: apps/web/src/games/WPamieci.tsx; w-pamieci.test.ts tylko regresja istniejącego kontraktu.
- Zasady/dokumenty: **nie: moment wysłania zgodny z końcem gry; dokumentacja zachowania**. Dokumenty: ZASADY-GIER §W pamięci (ekran).
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonanie i odbiór zakończone.
- Odbiór: T + UI. W /dev uzyskać błąd po kilku zaliczonych rundach i nie naciskać Wyniki; serwer, ranking i rekord zachowują wynik przed timeoutem. Sprawdzić komplet, odświeżenie odsłony, drugi result i solo/6 osób.
- Granice: Nie zmieniać rozkładu działań ani tie pełnych 12 rund.
- Wykonanie: **zakończone 2026-10-29**, 1/1 części. Testy 28196b5, typy i odbiór UI PASS; końcowo 1947 testów i build PASS. [Dowody](../05-poprawki-zaakceptowanych-rozbieznosci/05-06-SUMMARY.md).

<a id="scope-p4-006"></a>

### P4-006. Wspólny nagłówek aktywnej partii

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `naglowek-Game`
- Zachowanie: Zwinąć pigułki i odliczanie tak, by nagłówek zostawiał miejsce planszy, zachowując status, wyniki i rozłączenie. Własne nagłówki nie są przebudowywane.
- Pliki: apps/web/src/screens/Game.tsx:233-338; ui.tsx wyłącznie wykorzystanie/małe rozszerzenie wzorca GameDots.
- Zasady/dokumenty: **nie: układ, bez utraty informacji**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, warunek spełniony.
- Odbiór: T + UI. 360×640 przy 2/4/6 osobach i długich nickach: zwinięty nagłówek mieści status i timer, rozwinięcie pokazuje pełne wygrane i postęp. Pomiar przed/po E01-E06; stan obserwatora, refresh, rozłączenie i koniec. Bez zasłaniania pól samym nagłówkiem.
- Granice: Nie obiecywać, że sam nagłówek rozwiąże geometrię każdej planszy; akcje i plansze mają osobnych właścicieli.
- Wykonanie: **zakończone 2026-10-29**. 1/1 części; [05-07-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-07-SUMMARY.md), typy, 1947 testów, build i UI PASS.

<a id="scope-p4-011"></a>

### P4-011. Memory: wszystkie rzędy kart

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A; D4-059 nie daje wyjątku dla kart Memory.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `memory`
- Zachowanie: Wszystkie rzędy Średniej oraz Małej/Dużej i instrukcja mieszczą się na 360×640 przy min/max graczy. Karty minimum 48 px; bez wyjątku D4-059 dla Memory.
- Pliki: apps/web/src/games/Memory.tsx; tylko lokalne wymiary i układ akcji.
- Zasady/dokumenty: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Wszystkie 6 rzędów Średniej i instrukcja widoczne bez scroll; Mała/Duża również przy min/max graczy. Porównać E01/E02 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Wykonanie: **zakończone 2026-10-29**. 1/1 części, [05-08-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-08-SUMMARY.md). Wszystkie tryby 2/6 + obserwator, 48 px, typy, 1947 testów i build PASS.

<a id="scope-p4-012"></a>

### P4-012. Kalambury: zgadywanie i Pasuję

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `kalambury`
- Zachowanie: Płótno liczy wysokość po całym własnym nagłówku; Zgadnij i Pasuję pozostają w zasięgu.
- Pliki: apps/web/src/games/Kalambury.tsx:36,342-382.
- Zasady/dokumenty: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, warunek spełniony.
- Odbiór: T + UI. Odtworzyć E07 (Krótka, 4 osoby, zgadujący), oba przyciski wewnątrz 640. /dev przy 2/6 osobach, obie role, choose/draw/reveal/over, refresh i pełna partia; U02 dla klawiatury jeśli wpływa na pole.
- Granice: Nie usuwać czatu ani limitu; nie zmieniać wcześniejszego hint w tej poprawce.
- Wykonanie: **zakończone 2026-10-29 w odbiorze przeglądarkowym**. [05-09-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-09-SUMMARY.md). UI/typy/1947 testów/build PASS. U02: symulacja PASS, fizyczny Android pozostaje otwarty.

<a id="scope-p4-013"></a>

### P4-013. Koło: zakończenie prób widoczne

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `kolo`
- Zachowanie: Płótno dopasowuje się do wolnej wysokości, a Zostaw najlepszą… pozostaje widoczne po pierwszej próbie.
- Pliki: apps/web/src/games/Kolo.tsx:187-221.
- Zasady/dokumenty: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006). Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, warunek spełniony.
- Odbiór: T + UI. Powtórzyć E09 solo i pokój 2/6 osób przed/po próbie; przycisk ma pełne 48 px w oknie, pole rysowania zachowuje proporcje, niedokończona próba nie jest wynikiem. Refresh, timeout, me="" i rewanż.
- Granice: Zmniejszenie płótna może wpływać na wygodę; współrzędne wyniku nadal 0-1, punktacja bez zmian.
- Wykonanie: **zakończone 2026-10-29**. [05-10-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-10-SUMMARY.md). Solo/2/6, refresh/timeout/me=""/rewanż, typy, 1947 testów i build PASS.

<a id="scope-p4-014"></a>

### P4-014. Państwa-miasta: formularz i tabela głosowania

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-056](DECISIONS.md#d4-056) → A; [D4-061](DECISIONS.md#d4-061) → A; [D4-060](DECISIONS.md#d4-060) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `panstwa-miasta`; [F4-093](FINDINGS.md#f4-093): `panstwa-miasta`; [F4-152](FINDINGS.md#f4-152): `całość`
- Zachowanie: Formularz przewija się w pionie z dolną akcją; przy 4+ osobach kategoria osobno i gracze w wierszach, bez poziomego przewijania; cele głosu 48 px.
- Pliki: apps/web/src/games/PanstwaMiasta.tsx:165-319.
- Zasady/dokumenty: **nie dla punktacji; tak dla wyjątku UI/formularzy**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: U02 jest warunkiem odbioru formularza z klawiaturą; pomiar samego viewportu nie zamyka go.
- Odbiór: T + UI. E11 write oraz vote/summary przy 2/6 osobach: pełna odpowiedź i wszystkie głosy dostępne bez poziomego scroll; każda kategoria osiągalna, nic nie jest domyślnie odrzucane przez zmianę ekranu. U02: Android z klawiaturą, autoFocus, Oddaj i STOP. Refresh szkicu, koniec czasu i remis.
- Granice: Zmiana sposobu przeglądania nie zmienia progu głosowania ani 45 s; tę stałą rozstrzyga H-003.
- Wykonanie: **wdrożone 2026-10-29; pełny odbiór oczekuje U02**. 2/3 części (F4-093 i F4-152) odebrane; F4-056 wymaga fizycznego Androida. [05-11-SUMMARY](../05-poprawki-zaakceptowanych-rozbieznosci/05-11-SUMMARY.md). Typy, 1947 testów, build i scenariusze przeglądarkowe PASS.

<a id="scope-p4-015"></a>

### P4-015. Kropki, Kąt, W pamięci: pole przy klawiaturze

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-056](DECISIONS.md#d4-056) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `kat`; [F4-056](FINDINGS.md#f4-056): `kropki`; [F4-056](FINDINGS.md#f4-056): `w-pamieci`
- Zachowanie: Formularz nie kurczy się do nieużywalnego kafla; odpowiedź i Zatwierdź dostępne z otwartą klawiaturą.
- Pliki: apps/web/src/games/Szacowanie.tsx:140-155; WPamieci.tsx:126-151; index.html metadane tylko gdy pomiar uzasadni.
- Zasady/dokumenty: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: U02: przed wyborem technicznej poprawki wymagany pomiar telefonu.
- Odbiór: T + UI. U02: prawdziwy Android, 360×640, zanotowane visualViewport/innerHeight i rect formularza po autoFocus, rotacji i zamknięciu klawiatury. Pełna runda, błąd/timeout, refresh i rewanż; desktop bez regresji.
- Granice: Problem jest hipotezą dla urządzenia; nie wdrażać konkretnego max/min rozmiaru wyłącznie z emulacji.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-016"></a>

### P4-016. Wyniki: dostępne Rewanż i Do lobby

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-057](DECISIONS.md#d4-057) → A.
- Jednostki: [F4-092](FINDINGS.md#f4-092): `całość`
- Zachowanie: Wyniki mogą przewijać się w pionie; OverActions i NextActions korzystają ze StickyBar. Dalej Kalamburów/Państw-miast zachowuje dostępność.
- Pliki: apps/web/src/screens/Game.tsx:455-459,540-566; ui.tsx StickyBar; Kalambury/PanstwaMiasta tylko odbiór istniejących odsłon.
- Zasady/dokumenty: **nie; tak dla jawnego wyjątku wysokości wyników**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Odbiór: T + UI. E08/E10/E12 oraz U07: Koło 4/6 osób, solo z pełnym RecordPanel (rekord/awans), Turniej między grami i finał. Rewanż/Do lobby/Dalej w granicach okna, dolny wiersz nie pod paskiem; scroll całej treści działa.
- Granice: Nie ściskać wszystkich rysunków do 640 px i nie dublować akcji w dialogu Kampus Tour.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-017"></a>

### P4-017. Kampus Tour: środek i akcje po skalowaniu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-058](DECISIONS.md#d4-058) → A; [D4-059](DECISIONS.md#d4-059) → A; [D4-060](DECISIONS.md#d4-060) → A; [D4-067](DECISIONS.md#d4-067) → A.
- Jednostki: [F4-058](FINDINGS.md#f4-058): `całość`; [F4-093](FINDINGS.md#f4-093): `kampus-tour`; [F4-130](FINDINGS.md#f4-130): `całość`; [F4-135](FINDINGS.md#f4-135): `całość`
- Zachowanie: Stała nieucinana runda i akcje, log 1-2 wpisy; dialog i plansza nie dublują akcji; Zamknij/Podsumowanie/budowa i potwierdzenia mają 48 px na ekranie, nie tylko w scenie; wygrane i Oglądasz uzupełnione.
- Pliki: apps/web/src/games/KampusTour.tsx:650-765,848-973; KampusSummary.tsx; Game.tsx gałąź przekazująca scores/seated.
- Zasady/dokumenty: **nie dla gry; tak dla reguł UI wyjątków planszy**. Dokumenty: DESIGN §6; ZASADY §4.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Powtórzyć E13-E15 w 360×640 obróconym i 640×360: buy, roll z MPK, over i dialog. Runda, licznik, log oraz każdy przycisk dostępne, rzeczywisty rect min.48 px po zoom. Pick/build/sell/juwenalia, 2/4 osoby+obserwator, refresh i rewanż.
- Granice: Powiększenie przycisków nie może wrócić do overflow; najpierw pomiar budżetu wysokości. Nie zmieniać ekonomii.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-018"></a>

### P4-018. Kampus Tour: decyzja bez czekania na marsz

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-051](DECISIONS.md#d4-051) → A; [D4-105](DECISIONS.md#d4-105) → A.
- Jednostki: [F4-057](FINDINGS.md#f4-057): `kampus-tour`; [F4-131](FINDINGS.md#f4-131): `całość`; [F4-132](FINDINGS.md#f4-132): `całość`
- Zachowanie: Dotyk podczas marszu kończy animację do celu; akcja odpowiada stanowi serwera. Turlanie tylko po rzucie, przeskok kartą/MPK bez udawanego rzutu.
- Pliki: apps/web/src/games/KampusTour.tsx useWalk/useRolling i settled; kontrakt zdarzenia wyłącznie jeśli nie da się użyć istniejącego.
- Zasady/dokumenty: **nie dla zasad ruchu; tak dla opisu animacji**. Dokumenty: ZASADY §5; DESIGN §6.
- Zależności i rozpoczęcie: [P4-017](PACKAGES.md#p4-017). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. /dev: rzut 12, dublet i kolejny rzut, dotyk przed/dojście/po marszu, MPK, karta i Kolokwium, refresh w marszu oraz reduced motion. Jedno dotknięcie nie wykonuje przypadkowej innej decyzji; nowy stan przerywa stary pokaz, zegar nie jest zatrzymywany.
- Granice: Jeśli konieczna nowa informacja w widoku, opisać i sprawdzić playerView przed kodem; bez nowego zdarzenia bez akceptacji kontraktu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-023"></a>

### P4-023. Quizy: walidacja i wierne czasy trafień

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-087](DECISIONS.md#d4-087) → A.
- Jednostki: [F4-014](FINDINGS.md#f4-014): `całość`; [F4-015](FINDINGS.md#f4-015): `całość`
- Zachowanie: Serwer odrzuca nierealne dane; ekran zachowuje każde prawidłowe trafienie i rzeczywisty czas, bez ścięcia do 5 s.
- Pliki: packages/games/src/quiz.ts, quizowe testy; apps/web/src/games/Quiz.tsx; korzystające stroop/liczenie/inny/obrot/literowka/dziesiatki.
- Zasady/dokumenty: **tak: walidacja i wynik klienta**. Dokumenty: ZASADY-GIER §quizy.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Najpierw dowód i testy granic wynikających z 30 s i blokady 1 s; odrzucić ułamki/nieosiągalne pomyłki, przyjąć dozwolone <150 ms i >5 s. Wynik, tie i liczba trafień zgodne w pokoju/rekordzie/turnieju; zła odpowiedź nadal blokuje 1 s.
- Granice: Nie projektować progów pod obecne błędy UI ani dodawać arbitralnego antycheatu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-036"></a>

### P4-036. Gęste plansze: wybór z potwierdzeniem

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-059](DECISIONS.md#d4-059) → A.
- Jednostki: [F4-093](FINDINGS.md#f4-093): `geste-plansze`
- Zachowanie: Wyjątek <48 px tylko dla pola z podglądem i osobnym potwierdzeniem 48 px. Gomoku/Statki/Chińczyk zachowują takie potwierdzenie; Labirynt wymaga dodania jawnego potwierdzenia lub osobnej decyzji o odmiennej obsłudze.
- Pliki: PiecWRzedzie.tsx,Statki.tsx,Chinczyk.tsx,Labirynt.tsx; ZASADY §4/DESIGN §6.
- Zasady/dokumenty: **tak: reguła UI i ewentualne potwierdzenie Labiryntu; nie zasady ruchu**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: B4-002 zatwierdza D4-059:A dla czterech gier, także dodanie osobnego potwierdzenia w Labiryncie. Odbiór nadal wymagany; wykonania nie rozpoczęto.
- Odbiór: T + UI. Dotknięcie wskazuje dokładnie jedno pole/pionek, tekst/znak pokazuje wybór, dopiero potwierdzenie wysyła ruch. 360×640, minimalny wariant i obserwator; przycisk zmierzony po transformacji. Każdy wyjątek ma nazwę gry i powód.
- Granice: Labirynt obecnie wykonuje krok bez potwierdzenia; nie wolno uznać go za już objęty wyjątkiem.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-007"></a>

### P4-007. Gomoku: plansza nad dolną akcją

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `piec-w-rzedzie`
- Zachowanie: Własny ostatni rząd i podgląd wybranego kamienia widoczne równocześnie z Postaw.
- Pliki: apps/web/src/games/PiecWRzedzie.tsx; tylko lokalne wymiary i układ akcji.
- Zasady/dokumenty: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006), [P4-036](PACKAGES.md#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Własny ostatni rząd i podgląd wybranego kamienia widoczne równocześnie z Postaw. Porównać E05 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-008"></a>

### P4-008. Statki: rozstawianie i bitwa w ekranie

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `statki`
- Zachowanie: Obróć/Losuj/Gotowe dostępne bez nakładania na flotę; w bitwie i obronie obie role mają dostęp do aktywnej planszy.
- Pliki: apps/web/src/games/Statki.tsx; tylko lokalne wymiary i układ akcji.
- Zasady/dokumenty: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006), [P4-036](PACKAGES.md#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Obróć/Losuj/Gotowe dostępne bez nakładania na flotę; w bitwie i obronie obie role mają dostęp do aktywnej planszy. Porównać E06 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-009"></a>

### P4-009. Chińczyk: domki i kostka w ekranie

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `chinczyk`
- Zachowanie: Dolne domki nie są przykryte; kostka i Rzuć współdzielą dostępną wysokość, Klasyczny i Szybki.
- Pliki: apps/web/src/games/Chinczyk.tsx; tylko lokalne wymiary i układ akcji.
- Zasady/dokumenty: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006), [P4-036](PACKAGES.md#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Dolne domki nie są przykryte; kostka i Rzuć współdzielą dostępną wysokość, Klasyczny i Szybki. Porównać E04 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-010"></a>

### P4-010. Labirynt: własny pionek i wybór ruchu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Jednostki: [F4-056](FINDINGS.md#f4-056): `labirynt`
- Zachowanie: Startowy pionek, cel, wybór Pionek/Ściana i potwierdzenie widoczne; Klasyczny 9×9 i Szybki 7×7.
- Pliki: apps/web/src/games/Labirynt.tsx; tylko lokalne wymiary i układ akcji.
- Zasady/dokumenty: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności i rozpoczęcie: [P4-006](PACKAGES.md#p4-006), [P4-036](PACKAGES.md#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Startowy pionek, cel, wybór Pionek/Ściana i potwierdzenie widoczne; Klasyczny 9×9 i Szybki 7×7. Porównać E03 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-019"></a>

### P4-019. Chińczyk: ruch dostępny w animacji

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-052](DECISIONS.md#d4-052) → A.
- Jednostki: [F4-057](FINDINGS.md#f4-057): `chinczyk`
- Zachowanie: Dotyk kończy pokaz i pozwala wybrać pionek według aktualnego widoku, także w Szybkim.
- Pliki: apps/web/src/games/Chinczyk.tsx useWalk/settled/myMove.
- Zasady/dokumenty: **nie dla zasad; tak dla opisu animacji**. Dokumenty: ZASADY §5.
- Zależności i rozpoczęcie: [P4-009](PACKAGES.md#p4-009). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Klasyczny/Szybki, 2/4 graczy: rzut 6, wejście do domku, zbicie, dodatkowy rzut, trzeci brak ruchu; dotyk w trakcie i nowy stan nie tworzą podwójnego ruchu. Refresh/reconnect i reduced motion bez zaległej kolejki.
- Granice: Wibracja zbicia raz na zdarzenie; nie zmieniać 20 s ani premii rzutu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-020"></a>

### P4-020. Śledzenie: 360 s na pełną partię

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-009](DECISIONS.md#d4-009) → A.
- Jednostki: [F4-002](FINDINGS.md#f4-002): `sledzenie`
- Zachowanie: Limit 360 s przy zachowaniu 20 rund i dotychczasowej punktacji.
- Pliki: packages/games/src/sledzenie.ts i test; KONCEPT lista limitów.
- Zasady/dokumenty: **tak: limit**. Dokumenty: ZASADY-GIER §Śledzenie; KONCEPT §3.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test liczbowy 360; rachunek 20 rund plus odsłony i czas wskazywania, /dev samoistny timeout, solo/6 graczy i turniej.
- Granice: T=287 s zależy od modelu czasu decyzji; nie jest pomiarem człowieka.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-021"></a>

### P4-021. Który rok?: 270 s z zapasem sieciowym

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-011](DECISIONS.md#d4-011) → A.
- Jednostki: [F4-002](FINDINGS.md#f4-002): `rok`
- Zachowanie: Limit platformy 270 s, klient nadal ma twarde 228 s maksymalnego przebiegu.
- Pliki: packages/games/src/rok.ts i test.
- Zasady/dokumenty: **tak: limit**. Dokumenty: ZASADY-GIER §Który rok?; KONCEPT §3.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test 270, wyliczenie czasu rund, pełna partia z maksymalnym oczekiwaniem, timeout i rewanż; wyniki nie zmieniają jednostki ani zakresu roku.
- Granice: Nie rozszerzać historycznej bazy wydarzeń w pakiecie limitu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-022"></a>

### P4-022. Jeden termin mini-gry niezależny od rywali

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-012](DECISIONS.md#d4-012) → A.
- Jednostki: [F4-162](FINDINGS.md#f4-162): `całość`
- Zachowanie: Wynik rywala ani koniec prób Koła nie odnawia limitu pozostałym; Intro nadal kończy się po ostatnim Start lub 15 s.
- Pliki: apps/server/src/LobbyRoom.ts:375-376 i testy pokoju; turn/key mini-gier tylko zgodnie z wybraną wspólną implementacją.
- Zasady/dokumenty: **tak: zachowanie limitu platformy**. Dokumenty: KONCEPT §3; ZASADY §3.
- Zależności i rozpoczęcie: [P4-003](PACKAGES.md#p4-003), [P4-004](PACKAGES.md#p4-004), [P4-020](PACKAGES.md#p4-020), [P4-021](PACKAGES.md#p4-021). Dodatkowy warunek: G-LIMITY rozstrzygnięte w ZG4-v1 §3.3 dla 30 mini-gier, z nazwanymi wyjątkami Środka/Tortu/Roku. Test jednego terminu po poprzedzających poprawkach.
- Odbiór: T + UI. Kontrolowany zegar: solo/2/6 osób, pierwszy i ostatni Start, progress, wynik pierwszego i ostatniego gracza oraz kolejne próby Koła. Termin pozostałych identyczny przed/po ruchu rywala, jeden timeout na gracza. Wyjście, rewanż i turniej nie dziedziczą terminu poprzedniej partii.
- Granice: Nie wdrażać najpierw usunięcia odnowień przy nadal kwestionowanych limitach.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-024"></a>

### P4-024. Jeden komparator średniego czasu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-086](DECISIONS.md#d4-086) → A.
- Jednostki: [F4-013](FINDINGS.md#f4-013): `całość`
- Zachowanie: Średnia zaokrąglona do ms wspólnie w miejscach i record.tie. Przy równym score znane tie przed null; dwa null równe, null nigdy zero. Ten sam porządek w SQL, core i UI; stare tie bez przeliczania, ZG4-v1 §3.2.
- Pliki: packages/games/src/core.ts, quiz.ts, stoj.ts i testy; stats.test.ts dla tego samego porządku.
- Zasady/dokumenty: **tak: dokładność remisów**. Dokumenty: ZASADY-GIER §Stój!/quizy; KONCEPT §2.4.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Dwa wyniki różniące się tylko ułamkiem ms po zaokrągleniu remisują wszędzie; dokładnie równy wynik bez zwycięzcy. Stary tie/null pozostaje zgodnie z zatwierdzoną polityką danych, a nie traktowany jak zero.
- Granice: Zmiana dokładności miejsc może zmienić punkty turnieju; UI zaokrąglenia nie mogą ukryć innego komparatora.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-025"></a>

### P4-025. Jawny remis i kolejność dalszych miejsc

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-091](DECISIONS.md#d4-091) → A.
- Jednostki: [F4-018](FINDINGS.md#f4-018): `całość`; [F4-036](FINDINGS.md#f4-036): `całość`
- Zachowanie: Gomoku zwraca ranking bez zwycięzcy. Dla Szybkiego Chińczyka proponowane opcjonalne GameResult.places podaje równe dalsze miejsca według liczby pionków w domu i sumy pozycji, ranking zachowuje stabilny porządek. Turniej wyświetla wspólne miejsce z identycznej pary total/wins bez zmiany punktów.
- Pliki: packages/games/src/{core,piec-w-rzedzie,chinczyk,turniej}.ts i testy; Game.tsx numeracja miejsc.
- Zasady/dokumenty: **tak: kontrakt rankingu/dalszych miejsc, bez zmiany historycznych wygranych**. Dokumenty: ZASADY-GIER §Gomoku/Chińczyk/Turniej; KONCEPT §2.6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: G-KONTRAKT: przed kodem test JSON opcjonalnego GameResult.places i zgodności wyniku bez tego pola; proponowany kształt jest częścią tej karty, nie osobną prośbą o zgodę.
- Odbiór: T + UI. Testy remisu Gomoku oraz identycznych dalszych miejsc w Szybkim i Turnieju, w tym dogrywka. Zwycięzca i punkty nie zmieniają się przypadkowo przez samą numerację UI.
- Granice: GameResult.places jest opcjonalne: brak pola zachowuje dotychczasowy odczyt innych gier. Nie zmieniać GameDefinition.places mini-gier ani historycznych punktów przez nową numerację.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-026"></a>

### P4-026. Kampus Tour: karta, wykup i rzeczywisty czynsz

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-036](DECISIONS.md#d4-036) → A; [D4-037](DECISIONS.md#d4-037) → A; [D4-092](DECISIONS.md#d4-092) → A; [D4-093](DECISIONS.md#d4-093) → A.
- Jednostki: [F4-022](FINDINGS.md#f4-022): `całość`; [F4-023](FINDINGS.md#f4-023): `całość`; [F4-030](FINDINGS.md#f4-030): `całość`; [F4-031](FINDINGS.md#f4-031): `całość`
- Zachowanie: Karta bankruta wraca do talii; Juwenalia i wysokie budynki pozostają po wykupie/utracie kompletu; statystyka pokazuje faktycznie wypłacony czynsz.
- Pliki: packages/games/src/kampus-tour.ts i kampus-tour.test.ts.
- Zasady/dokumenty: **tak dla obiegu karty; doprecyzowanie pozostałych reguł; statystyka bez zmiany wypłaty**. Dokumenty: ZASADY-GIER §Kampus Tour/Karty/Wykupienie/Budowa/stats.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test bankructwa z Zaliczeniem i dobierania po pełnym obiegu; Juwenalia zostają po wykupie, znikają po banku; poziomy 3/4 zostają bez kompletu, dalsza budowa nadal wymaga warunku. Statystyka równa faktycznej wypłacie przy długu i kilku wierzycielach. /dev2/4 osoby i obserwator w tych fazach.
- Granice: Nie obniżać premii startowej, kosztować MPK ani zmieniać monopolu; H-019..021 odrębne.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-028"></a>

### P4-028. Labirynt: losowy legalny krok po czasie

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-042](DECISIONS.md#d4-042) → A.
- Jednostki: F1:O04, istniejący timeout Labiryntu; bez nowego F4.
- Zachowanie: Po czasie rng wybiera legalny krok, nie zawsze najkrótszą drogę; pass wyłącznie bez kroku. Zakres F1:O04, bez nowego błędu F4.
- Pliki: packages/games/src/labirynt.ts, labirynt.test.ts.
- Zasady/dokumenty: **tak: timeout wprowadza losowość**. Dokumenty: ZASADY-GIER §Labirynt; KONCEPT opis gry jeśli mówi brak losowości.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test legalności i deterministyczności rng, kilka seedów, brak losowego zużycia ścian; pass gdy brak kroków. /dev2/4 osoby, timeout i skos/skok, rewanż.
- Granice: Zmienia świadome odstępstwo; nie traktować go jako zgody już udzielonej przez opis audytu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-029"></a>

### P4-029. Testy: Kampus Tour

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-089](DECISIONS.md#d4-089) → A.
- Jednostki: [F4-004](FINDINGS.md#f4-004): `kampus-tour`; [F4-007](FINDINGS.md#f4-007): `kampus-tour`; [F4-008](FINDINGS.md#f4-008): `kampus-tour`; [F4-010](FINDINGS.md#f4-010): `kampus-tour`; [F4-012](FINDINGS.md#f4-012): `kampus-tour`; [F4-027](FINDINGS.md#f4-027): `całość`; [F4-028](FINDINGS.md#f4-028): `całość`; [F4-029](FINDINGS.md#f4-029): `całość`; [F4-032](FINDINGS.md#f4-032): `całość`; [F4-033](FINDINGS.md#f4-033): `całość`; [F4-034](FINDINGS.md#f4-034): `całość`
- Zachowanie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Pliki: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zasady/dokumenty: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-030"></a>

### P4-030. Testy: gry główne i Turniej

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-089](DECISIONS.md#d4-089) → A.
- Jednostki: [F4-004](FINDINGS.md#f4-004): `chinczyk`; [F4-004](FINDINGS.md#f4-004): `panstwa-miasta`; [F4-004](FINDINGS.md#f4-004): `piec-w-rzedzie`; [F4-004](FINDINGS.md#f4-004): `statki`; [F4-004](FINDINGS.md#f4-004): `turniej`; [F4-005](FINDINGS.md#f4-005): `panstwa-miasta`; [F4-005](FINDINGS.md#f4-005): `statki`; [F4-006](FINDINGS.md#f4-006): `panstwa-miasta`; [F4-007](FINDINGS.md#f4-007): `panstwa-miasta`; [F4-008](FINDINGS.md#f4-008): `chinczyk`; [F4-008](FINDINGS.md#f4-008): `panstwa-miasta`; [F4-008](FINDINGS.md#f4-008): `piec-w-rzedzie`; [F4-008](FINDINGS.md#f4-008): `statki`; [F4-009](FINDINGS.md#f4-009): `panstwa-miasta`; [F4-010](FINDINGS.md#f4-010): `panstwa-miasta`; [F4-011](FINDINGS.md#f4-011): `kalambury`; [F4-011](FINDINGS.md#f4-011): `panstwa-miasta`; [F4-012](FINDINGS.md#f4-012): `statki`; [F4-037](FINDINGS.md#f4-037): `całość`; [F4-038](FINDINGS.md#f4-038): `całość`; [F4-040](FINDINGS.md#f4-040): `całość`; [F4-041](FINDINGS.md#f4-041): `całość`; [F4-042](FINDINGS.md#f4-042): `całość`; [F4-054](FINDINGS.md#f4-054): `całość`
- Zachowanie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Pliki: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zasady/dokumenty: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-031"></a>

### P4-031. Testy: quizy i Stój!

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-089](DECISIONS.md#d4-089) → A.
- Jednostki: [F4-004](FINDINGS.md#f4-004): `liczenie`; [F4-004](FINDINGS.md#f4-004): `stroop`; [F4-005](FINDINGS.md#f4-005): `liczenie`; [F4-005](FINDINGS.md#f4-005): `stroop`; [F4-006](FINDINGS.md#f4-006): `liczenie`; [F4-006](FINDINGS.md#f4-006): `stroop`; [F4-007](FINDINGS.md#f4-007): `dziesiatki`; [F4-007](FINDINGS.md#f4-007): `inny`; [F4-007](FINDINGS.md#f4-007): `liczenie`; [F4-007](FINDINGS.md#f4-007): `literowka`; [F4-007](FINDINGS.md#f4-007): `obrot`; [F4-007](FINDINGS.md#f4-007): `stroop`; [F4-008](FINDINGS.md#f4-008): `liczenie`; [F4-008](FINDINGS.md#f4-008): `stroop`; [F4-009](FINDINGS.md#f4-009): `liczenie`; [F4-009](FINDINGS.md#f4-009): `stroop`; [F4-010](FINDINGS.md#f4-010): `liczenie`; [F4-010](FINDINGS.md#f4-010): `stroop`; [F4-046](FINDINGS.md#f4-046): `całość`; [F4-049](FINDINGS.md#f4-049): `całość`
- Zachowanie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Pliki: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zasady/dokumenty: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-032"></a>

### P4-032. Testy: pozostałe mini-gry

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-089](DECISIONS.md#d4-089) → A.
- Jednostki: [F4-004](FINDINGS.md#f4-004): `kolo`; [F4-004](FINDINGS.md#f4-004): `kolor`; [F4-004](FINDINGS.md#f4-004): `kropki`; [F4-004](FINDINGS.md#f4-004): `refleks`; [F4-004](FINDINGS.md#f4-004): `schulte`; [F4-004](FINDINGS.md#f4-004): `simon`; [F4-004](FINDINGS.md#f4-004): `stoper`; [F4-005](FINDINGS.md#f4-005): `kolo`; [F4-005](FINDINGS.md#f4-005): `kolor`; [F4-005](FINDINGS.md#f4-005): `kropki`; [F4-005](FINDINGS.md#f4-005): `schulte`; [F4-005](FINDINGS.md#f4-005): `simon`; [F4-005](FINDINGS.md#f4-005): `stoper`; [F4-006](FINDINGS.md#f4-006): `kolo`; [F4-006](FINDINGS.md#f4-006): `kolor`; [F4-006](FINDINGS.md#f4-006): `kropki`; [F4-006](FINDINGS.md#f4-006): `refleks`; [F4-006](FINDINGS.md#f4-006): `schulte`; [F4-006](FINDINGS.md#f4-006): `simon`; [F4-006](FINDINGS.md#f4-006): `srodek`; [F4-006](FINDINGS.md#f4-006): `stoper`; [F4-007](FINDINGS.md#f4-007): `kolo`; [F4-007](FINDINGS.md#f4-007): `kolor`; [F4-007](FINDINGS.md#f4-007): `kropki`; [F4-007](FINDINGS.md#f4-007): `simon`; [F4-008](FINDINGS.md#f4-008): `kolo`; [F4-008](FINDINGS.md#f4-008): `kolor`; [F4-008](FINDINGS.md#f4-008): `refleks`; [F4-008](FINDINGS.md#f4-008): `schulte`; [F4-008](FINDINGS.md#f4-008): `simon`; [F4-008](FINDINGS.md#f4-008): `stoper`; [F4-009](FINDINGS.md#f4-009): `kolo`; [F4-009](FINDINGS.md#f4-009): `kolor`; [F4-009](FINDINGS.md#f4-009): `kropki`; [F4-009](FINDINGS.md#f4-009): `nozyczki`; [F4-009](FINDINGS.md#f4-009): `refleks`; [F4-009](FINDINGS.md#f4-009): `rok`; [F4-009](FINDINGS.md#f4-009): `schulte`; [F4-009](FINDINGS.md#f4-009): `simon`; [F4-009](FINDINGS.md#f4-009): `srodek`; [F4-009](FINDINGS.md#f4-009): `stoper`; [F4-009](FINDINGS.md#f4-009): `tort`; [F4-010](FINDINGS.md#f4-010): `kolo`; [F4-010](FINDINGS.md#f4-010): `kolor`; [F4-010](FINDINGS.md#f4-010): `kropki`; [F4-010](FINDINGS.md#f4-010): `schulte`; [F4-010](FINDINGS.md#f4-010): `simon`; [F4-010](FINDINGS.md#f4-010): `stoper`; [F4-045](FINDINGS.md#f4-045): `całość`; [F4-047](FINDINGS.md#f4-047): `całość`; [F4-050](FINDINGS.md#f4-050): `całość`; [F4-053](FINDINGS.md#f4-053): `całość`
- Zachowanie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Pliki: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zasady/dokumenty: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-033"></a>

### P4-033. Rekordowa partia ze stanu, także me=""

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-088](DECISIONS.md#d4-088) → A.
- Jednostki: [F4-016](FINDINGS.md#f4-016): `całość`; [F4-021](FINDINGS.md#f4-021): `całość`
- Zachowanie: Stoper/Rytm nie czytają lokalnego kafla po końcu; test soloState obejmuje mapy napełnione prawdziwą partią.
- Pliki: apps/web/src/games/Stoper.tsx,Rytm.tsx; packages/games/src/index.test.ts i odpowiednie testy soloState.
- Zasady/dokumenty: **nie: odczyt i test istniejącego kontraktu**. Dokumenty: ZASADY §3/§6 tylko doprecyzowanie testu jeśli potrzebne.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Legalne wyniki wszystkich 8 gier F4-021, soloState→JSON→me="" pokazują ten sam wynik, odchyłkę i tabelę. Otworzyć istniejący stary detail i brak detail, a Stoper/Rytm porównać po refresh.
- Granice: Brak dawnych danych lokalnych wymaga fallbacku, nie domyślnego fałszywego wyniku.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-037"></a>

### P4-037. Zwykłe kontrolki 48 px

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-060](DECISIONS.md#d4-060) → A.
- Jednostki: [F4-093](FINDINGS.md#f4-093): `kontrolki-platformy`
- Zachowanie: Suwak Odcienia/Roku ma pole 48 px; wyjście, próbki koloru i wiersze gracza w Lobby/Setup również.
- Pliki: index.css .swatch-range; Lobby.tsx:158,392,435; Kolor.tsx/Rok.tsx odbiór.
- Zasady/dokumenty: **nie: rozmiar kontrolek**. Dokumenty: DESIGN §6 aktualizacja faktów.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Zmierzyć rect/hitbox 48×48 przy 360 px, 6 kolorów bez poziomego scroll, suwak dotykany przy krawędzi i klawiaturą; układ w Setup i Lobby z 6 osobami.
- Granice: Nie zwiększać samego uchwytu kosztem nakładania, aktywny obszar musi być realny.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-038"></a>

### P4-038. Tort: uchwyt cięcia pod palcem

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-060](DECISIONS.md#d4-060) → A.
- Jednostki: [F4-093](FINDINGS.md#f4-093): `tort`
- Zachowanie: Łapanie cięcia w odległości 24 px od palca, niezależnie od kąta i odległości od środka; dotknięcie nie przesuwa innego cięcia.
- Pliki: apps/web/src/games/Tort.tsx:19,86.
- Zasady/dokumenty: **nie: punktacja/zasady podziału zostają**. Dokumenty: ZASADY-GIER §Tort ekran jeżeli opisuje wybór uchwytu.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Wszystkie 3-7 części, cięcia blisko siebie i centrum: wybór najbliższego z widocznym podglądem, możliwość korekty, Pokrój aktywne po komplecie. Dotyk na prawdziwym telefonie i 360×640.
- Granice: Przy remisie odległości zachowanie musi być deterministyczne i opisane; nie liczyć stopni jako pikseli.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-039"></a>

### P4-039. Śledzenie: rozdzielne cele dotyku

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-060](DECISIONS.md#d4-060) → A.
- Jednostki: [F4-093](FINDINGS.md#f4-093): `sledzenie`
- Zachowanie: Po zatrzymaniu plansza jest podglądem z numerami nadanymi według końcowej pozycji, niezależnie od roli/indeksu celu. Osiem osobnych przycisków 48×48 px wybiera kulki. Brak numerów w show/move; trzeci wybór kończy wskazanie jak obecnie. Bez zmiany GAP=0,14, prędkości, generatora i punktacji.
- Pliki: apps/web/src/games/Sledzenie.tsx: panel, oznaczenia, mapowanie według pozycji i obsługa wyboru; testy zgodności panelu. Zasady generatora sledzenie.ts bez zmian.
- Zasady/dokumenty: nie w losowaniu/punktacji; tak w opisanym sposobie wyboru. Dokumenty: ZASADY-GIER §Śledzenie (numeracja dopiero po ruchu), ZASADY §4 dla panelu 48 px.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: konkretny wariant panelu zatwierdzony w ZG4-v1 §3.4, G-DANE według §3.2. U12/U13 do odbioru; brak zgody na zmianę GAP.
- Odbiór: T + UI; panel 48 px, bliskie/skrajne pozycje, 8 kulek/3 cele, numeracja bez informacji o celu, bez oznaczeń w show/move, dotyk i klawiatura. Plansza/panel/instrukcja w 360×640, stary detail i wynik bez zmian; U12/U13.
- Granice: Numerów nie wyprowadzać z indeksu celu. Kulki nie są obszarem wykonywania wyboru; bez nakładających się hitboxów. Nie przesuwać pozycji kulek dla etykiet i nie zmieniać generatora.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-040"></a>

### P4-040. Reduced motion: zadanie działa, komunikat widoczny

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-053](DECISIONS.md#d4-053) → A; [D4-054](DECISIONS.md#d4-054) → A.
- Jednostki: [F4-064](FINDINGS.md#f4-064): `całość`; [F4-065](FINDINGS.md#f4-065): `całość`; [F4-107](FINDINGS.md#f4-107): `ruch-zadanie`; [F4-116](FINDINGS.md#f4-116): `całość`
- Zachowanie: Ruch będący zadaniem zostaje w Kubkach/Śledzeniu/Wieży/Zasłonie; dekoracje znikają, Preview i werdykt są czytelne w klatce bazowej.
- Pliki: index.css reduced motion/float-up; ui.tsx i Preview gier; Kubki/Sledzenie/Wieza/Zaslona komentarze i sterowanie.
- Zasady/dokumenty: **tak: jawny wyjątek reguły animacji, bez zmiany tempa zadania**. Dokumenty: ZASADY §5; ZASADY-GIER cztery gry.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. prefers-reduced-motion przed otwarciem: Preview ma treść, +wynik/werdykt widoczny bez przesunięcia, zadanie ma identyczny czas i trajektorie. U13/U14 odbiór realnego telefonu; wynik nie zależy od końcowej opacity.
- Granice: Nie obejmować wyjątkiem każdego requestAnimationFrame; odrębne ozdobne kroki pionka skaczą do celu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-041"></a>

### P4-041. Katalog i opisy animacji

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-073](DECISIONS.md#d4-073) → A; [D4-074](DECISIONS.md#d4-074) → A.
- Jednostki: [F4-106](FINDINGS.md#f4-106): `całość`; [F4-107](FINDINGS.md#f4-107): `set-glow`; [F4-109](FINDINGS.md#f4-109): `całość`
- Zachowanie: Udokumentować istniejące keyframes i ich role, w tym set-glow 0,9 s ×4; komentarze zgodne z rzeczywistym użyciem. Bez przenoszenia logiki gry do animacji.
- Pliki: ZASADY §5; index.css komentarze i katalog.
- Zasady/dokumenty: **tak dla norm UI, bez zmiany logiki**. Dokumenty: ZASADY §5.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda używana nazwa ma definicję i rolę; katalog nie myli card-in/stone-pop/showtime, nazwy i czasy zgodne z tabelą. Brak zmiany przebiegu partii.
- Granice: Dodanie nazwy nie zatwierdza użycia przy dowolnym zdarzeniu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-042"></a>

### P4-042. Przejścia, pętle i paski czasu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-074](DECISIONS.md#d4-074) → A; [D4-075](DECISIONS.md#d4-075) → A; [D4-076](DECISIONS.md#d4-076) → A; [D4-077](DECISIONS.md#d4-077) → A.
- Jednostki: [F4-075](FINDINGS.md#f4-075): `całość`; [F4-076](FINDINGS.md#f4-076): `całość`; [F4-077](FINDINGS.md#f4-077): `całość`; [F4-086](FINDINGS.md#f4-086): `całość`; [F4-104](FINDINGS.md#f4-104): `całość`; [F4-105](FINDINGS.md#f4-105): `całość`; [F4-107](FINDINGS.md#f4-107): `paski`; [F4-108](FINDINGS.md#f4-108): `całość`
- Zachowanie: Wybór ring-pulse 1,2 s; czekanie spokojne; zwykłe przejścia 180/100 ms; paski z zegara i linear krokiem odświeżenia. W pamięci show 180 ms i Szybki Chińczyk 110/400 jako opisane wyjątki.
- Pliki: index.css; ui.tsx; Game.tsx paski; Memory/Chinczyk/Quiz/Rytm/Zakupy i inne dokładne użycia z F4.
- Zasady/dokumenty: **tak dla norm UI, nie dla stałych gry**. Dokumenty: ZASADY §5 tabela.
- Zależności i rozpoczęcie: [P4-041](PACKAGES.md#p4-041), [P4-040](PACKAGES.md#p4-040). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Porównać wszystkie wystąpienia F4: ring-pulse 1,2 s, bez Tailwind pulse/ping; pojawienie standardowe 350, pływająca liczba 1,6. Rytm/Zakupy pasek aktualizuje się przy reduced motion i po powrocie do karty, nie zdradza ukrytego zegara.
- Granice: Nie wydłużać pokazów i odsłon wraz z animacją; globalny CSS nie może zmienić bodźca na refleks.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-043"></a>

### P4-043. Błąd, ignorowany ruch i nowa decyzja

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-079](DECISIONS.md#d4-079) → A; [D4-080](DECISIONS.md#d4-080) → A; [D4-081](DECISIONS.md#d4-081) → A; [D4-083](DECISIONS.md#d4-083) → A; [D4-084](DECISIONS.md#d4-084) → A.
- Jednostki: [F4-079](FINDINGS.md#f4-079): `całość`; [F4-080](FINDINGS.md#f4-080): `całość`; [F4-081](FINDINGS.md#f4-081): `całość`; [F4-084](FINDINGS.md#f4-084): `całość`; [F4-147](FINDINGS.md#f4-147): `całość`
- Zachowanie: Zignorowanie bez kary ma shake i powód, bez wibracji; realny błąd 60; szkoda od rywala[60,40,60]; nowa decyzja 40 bez sygnału technicznej połowy Kalamburów; metronom 30 jako bodziec.
- Pliki: Game.tsx efekt tury; odpowiednie gry z F4; index.css shake; Rytm.tsx.
- Zasady/dokumenty: **tak dla reguł informacji zwrotnej, nie punktacji**. Dokumenty: ZASADY §5; ZASADY-GIER wskazane wyjątki.
- Zależności i rozpoczęcie: [P4-041](PACKAGES.md#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Sprawdzić zdarzenia w każdej wskazanej grze: raz na zdarzenie, brak wibracji przy poprawnym trafieniu i legalnym pudle. Reconnect nie powtarza szkody; half Kalamburów nie zdradza fazy. U14 na urządzeniu, poza nim można przechwycić wywołania vibrate, ale nie potwierdzać odczucia.
- Granice: Nie zmieniać kary ani przyjmowania ruchu przez dodanie efektu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-044"></a>

### P4-044. Odsłona wyniku i prawdy

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-078](DECISIONS.md#d4-078) → A; [D4-106](DECISIONS.md#d4-106) → B.
- Jednostki: [F4-078](FINDINGS.md#f4-078): `całość`; [F4-126](FINDINGS.md#f4-126): `całość`; [F4-140](FINDINGS.md#f4-140): `całość`
- Zachowanie: Wynik i znak prawdy bez animacji; znacznik neutralny, odpowiedź w kolorze gracza; litera Kalamburów również od razu.
- Pliki: Mapa/Kolor/Szacowanie/Tort/Nozyczki i gry F4-078/126; Kalambury.tsx.
- Zasady/dokumenty: **tak dla wyjątku UI, nie dla wyniku**. Dokumenty: ZASADY §4/§5.
- Zależności i rozpoczęcie: [P4-041](PACKAGES.md#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Pełna odsłona przez czas z zasad, widoczny kierunek błędu i moja odpowiedź, reduced motion bez różnicy danych. Kalambury odsłaniają tylko nową literę i nie odtwarzają animacji innych.
- Granice: Nie skracać/nie przedłużać rundy dekoracją.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-045"></a>

### P4-045. Zaznaczenie, okno i błysk trafienia

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-101](DECISIONS.md#d4-101) → A; [D4-102](DECISIONS.md#d4-102) → A; [D4-104](DECISIONS.md#d4-104) → A.
- Jednostki: [F4-089](FINDINGS.md#f4-089): `całość`; [F4-090](FINDINGS.md#f4-090): `całość`; [F4-127](FINDINGS.md#f4-127): `całość`
- Zachowanie: Zaznaczenie na czas i okno z dotyku są natychmiastowe; błysk dotyczy dokonanej odpowiedzi lub licznika, nie treści nowego pytania.
- Pliki: Dziesiatki/Zakupy zaznaczenie; KampusTour okno pola; Quiz.tsx/Inny.tsx błysk.
- Zasady/dokumenty: **nie dla zasad; tak dla norm animacji**. Dokumenty: ZASADY §5.
- Zależności i rozpoczęcie: [P4-041](PACKAGES.md#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. W quizie zmiana rozmiaru siatki po trafieniu nie błyska na przypadkowym nowym elemencie; jednoczesny szybki dotyk przyjmuje prawidłową odpowiedź raz. Okno z kliknięcia działa od razu, bez blokady animacji.
- Granice: Nie zmieniać czasu logiki, kara 1 s pozostaje.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-046"></a>

### P4-046. Koniec, para i powrót do partii

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-082](DECISIONS.md#d4-082) → A; [D4-085](DECISIONS.md#d4-085) → A; [D4-099](DECISIONS.md#d4-099) → A; [D4-100](DECISIONS.md#d4-100) → A; [D4-103](DECISIONS.md#d4-103) → A.
- Jednostki: [F4-082](FINDINGS.md#f4-082): `całość`; [F4-087](FINDINGS.md#f4-087): `całość`; [F4-088](FINDINGS.md#f4-088): `całość`; [F4-121](FINDINGS.md#f4-121): `całość`; [F4-150](FINDINGS.md#f4-150): `całość`
- Zachowanie: title-pop tylko zwycięzcy; para stone-pop, większy komplet set-glow; zastany stan po reconnect bez nowych zdarzeń; Balon zachowuje werdykt 1,6 s niezależnie od przerwy 0,8 s.
- Pliki: Game.tsx; Memory/KampusTour/WPamieci/Balon i pozostałe wystąpienia F4; index.css.
- Zasady/dokumenty: **nie dla gry, tak dla norm zdarzeń UI**. Dokumenty: ZASADY §5.
- Zależności i rozpoczęcie: [P4-041](PACKAGES.md#p4-041), [P4-040](PACKAGES.md#p4-040). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Wygrana/przegrana/remis i solo; nowa para/komplet, następna runda Balonu z nadal widocznym wynikiem. Refresh/reconnect nie odtwarza historycznych ruchów ani +1; reduced motion czytelny, punktacja identyczna.
- Granice: Nie czekać z oddaniem wyniku na koniec efektu.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-048"></a>

### P4-048. Wspólne wyniki i tabele rund

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-068](DECISIONS.md#d4-068) → A; [D4-069](DECISIONS.md#d4-069) → A.
- Jednostki: [F4-099](FINDINGS.md#f4-099): `całość`; [F4-100](FINDINGS.md#f4-100): `całość`
- Zachowanie: Dopuścić drugi wspólny Results/ScoreTable dla kolumn; RoundTable z komórkami/wierszem celów; Odcień zachowuje pary próbek jako nazwany wyjątek.
- Pliki: screens/ui.tsx; games/Quiz.tsx,Szacowanie.tsx,Przytrzymaj.tsx,Balon.tsx,Kolor.tsx.
- Zasady/dokumenty: **nie: wyłącznie prezentacja; tak dla wzorców UI**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Trafienia/czas, pęknięcia/wytrzymałości i odchyłki pokazują te same wartości co stan. me="", gra…, (ty), remis, 1/6 osób i 10 rund przy 360 px; U04. Stary detail działa.
- Granice: Nie zmieniać komparatora, formatu score ani limitów przy refaktorze tabel.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-050"></a>

### P4-050. Role tokenów i drugi sygnał stanu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-062](DECISIONS.md#d4-062) → A; [D4-063](DECISIONS.md#d4-063) → A; [D4-064](DECISIONS.md#d4-064) → A; [D4-065](DECISIONS.md#d4-065) → A.
- Jednostki: [F4-063](FINDINGS.md#f4-063): `całość`; [F4-094](FINDINGS.md#f4-094): `całość`; [F4-095](FINDINGS.md#f4-095): `całość`; [F4-096](FINDINGS.md#f4-096): `całość`; [F4-097](FINDINGS.md#f4-097): `całość`; [F4-110](FINDINGS.md#f4-110): `całość`; [F4-111](FINDINGS.md#f4-111): `całość`; [F4-118](FINDINGS.md#f4-118): `całość`; [F4-129](FINDINGS.md#f4-129): `całość`
- Zachowanie: Wspólna klasa akcji gracza, tokeny w swoich rolach, właściciel/wybór z widoczną ikoną/znakiem; jawne ograniczone wyjątki treści, 2.5D, gradientu Koła i odznaki 4 px.
- Pliki: index.css btn-player/tokeny; ui.tsx odznaki; Game.tsx,Plansze/Records/Setup oraz konkretne miejsca F4.
- Zasady/dokumenty: **nie dla gry, tak dla wyjątków standardu**. Dokumenty: ZASADY §4; DESIGN §2/§5/§6.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: U12/U11 do pełnego odbioru sygnałów; część stylistyczna nie dowodzi testu czytnika.
- Odbiór: T + UI. Kolor gracza zamiast akcentu dla wyboru, warning z ikoną/tekstem, contrast accent-fg na prawidłowym tle. U12 sześć kolorów i U11: widoczny znak nie zastąpiony aria-label. Wszystkie wskazane cienie/promienie mają albo token/skale, albo nazwany wyjątek.
- Granice: Wyjątek treści nie legalizuje całej dekoracji; czytelność celów Śledzenia może zmieniać trudność rozpoznania, nie ruch.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-051"></a>

### P4-051. Etykiety, natywne kontrolki i wykres dotykiem

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-097](DECISIONS.md#d4-097) → A.
- Jednostki: [F4-062](FINDINGS.md#f4-062): `całość`; [F4-112](FINDINGS.md#f4-112): `całość`; [F4-134](FINDINGS.md#f4-134): `całość`
- Zachowanie: color-scheme:dark, ozdobne ikony pominięte, przyciski i pola nazwane; tooltip wykresu utrzymuje się po dotknięciu.
- Pliki: index.css; ui.tsx,Game.tsx i wszystkie miejsca F4-112; KampusSummary.tsx tooltip.
- Zasady/dokumenty: **nie**. Dokumenty: DESIGN §4 jeśli doprecyzowanie; bez rozszerzania zasad.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: U10/U11: prawdziwy dotyk/czytnik przed zamknięciem odbioru.
- Odbiór: T + UI. Klawiatura i DOM: nazwy przycisków i role, logiczny fokus. U11 TalkBack/VoiceOver: faktycznie wypowiadane postępy i status; U10 dotknięcie wykresu utrzymuje kwotę. Nie uznać samego aria-label na span za udowodniony odczyt.
- Granice: Odczyt czytnika nie wynika ze snapshotu Playwright.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-052"></a>

### P4-052. Czytelne stany oczekiwania, błędu i blokady

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-097](DECISIONS.md#d4-097) → A.
- Jednostki: [F4-073](FINDINGS.md#f4-073): `całość`; [F4-074](FINDINGS.md#f4-074): `całość`; [F4-113](FINDINGS.md#f4-113): `całość`; [F4-114](FINDINGS.md#f4-114): `całość`; [F4-115](FINDINGS.md#f4-115): `całość`; [F4-128](FINDINGS.md#f4-128): `całość`; [F4-137](FINDINGS.md#f4-137): `całość`; [F4-138](FINDINGS.md#f4-138): `całość`; [F4-146](FINDINGS.md#f4-146): `całość`; [F4-154](FINDINGS.md#f4-154): `całość`; [F4-155](FINDINGS.md#f4-155): `całość`
- Zachowanie: Rozłączenie i ładowanie mają tekst, zamknięcie pokoju właściwy komunikat; brak możliwości akcji ma powód. Sudoku bez wyboru nie udaje aktywnej klawiatury; turniej solo i puste ciekawostki mają opis.
- Pliki: App/Home/Lobby/Setup/Records/Game; Szacowanie/Chinczyk/Sudoku/KampusSummary zgodnie z F4.
- Zasady/dokumenty: **nie: informacja i dostępność, bez nowych kar**. Dokumenty: DESIGN §4.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. W /dev przerwanie/odnowienie połączenia, zamknięcie pokoju, opóźnione API, brak wyników; tekst zamiast fałszywego błędu kodu. Zablokowany pionek, liczba poza zakresem, min/max Turnieju, Sudoku bez pola. Każdy stan wraca po usunięciu przyczyny.
- Granice: Nie zamieniać braku danych i ładowania w pustą tabelę; wyłączenie klawiatury nie może usuwać możliwości wybrania pola.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-055"></a>

### P4-055. Stoper: stały cel

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-013](DECISIONS.md#d4-013) → A.
- Jednostki: [F4-003](FINDINGS.md#f4-003): `stoper`
- Zachowanie: Cel 10 s, wynik nadal w ms.
- Pliki: packages/games/src/stoper.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zasady/dokumenty: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test setup zawsze target 10000 oraz deterministyczny seed; wynik graniczny 0/cel, timeout i ten sam stary detail. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-056"></a>

### P4-056. Rytm: stałe tempo

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-014](DECISIONS.md#d4-014) → A.
- Jednostki: [F4-003](FINDINGS.md#f4-003): `rytm`
- Zachowanie: 100 BPM, wynik nadal w ms.
- Pliki: packages/games/src/rytm.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zasady/dokumenty: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test stałego odstępu 600 ms i zachowania liczby uderzeń, timeout i metronom; stary detail z innym tempem renderuje zapisane dane. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-057"></a>

### P4-057. Liczenie: komplet rodzajów

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-015](DECISIONS.md#d4-015) → A.
- Jednostki: [F4-003](FINDINGS.md#f4-003): `liczenie`
- Zachowanie: Potasowane czwórki rodzajów, bez zmiany zakresów liczb.
- Pliki: packages/games/src/liczenie.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zasady/dokumenty: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. 1000 seedów: każda pełna czwórka ma cztery typy, poprawne liczby i brak zdegenerowanych odpowiedzi; ten sam seed to samo. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-058"></a>

### P4-058. Obrót: sześć rodzajów planszy

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-016](DECISIONS.md#d4-016) → A.
- Jednostki: [F4-003](FINDINGS.md#f4-003): `obrot`
- Zachowanie: Komplet 90/180/270×ta sama/lustro w każdej szóstce.
- Pliki: packages/games/src/obrot.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zasady/dokumenty: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. 1000 seedów: pełne szóstki bez duplikatu typu, prawidłowe lustro i kąty, zakres wyników i kara identyczne. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-059"></a>

### P4-059. W pamięci: stała liczba mnożeń

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-022](DECISIONS.md#d4-022) → A.
- Jednostki: [F4-003](FINDINGS.md#f4-003): `w-pamieci`
- Zachowanie: floor(liczba działań/3) mnożeń na rundę, miejsca tasowane; wartości pośrednie 1-99.
- Pliki: packages/games/src/w-pamieci.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zasady/dokumenty: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane. P11 przed odbiorem wpływu mnożeń, zgodnie z ZG4-v1.
- Odbiór: T + UI. 1000 seedów: liczby mnożeń perrunda stałe, wartości 1-99, seedy odtwarzalne i ciągi nowe; brak nieskończonej pętli generatora. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-060"></a>

### P4-060. Balon: ten sam komplet ryzyka

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-028](DECISIONS.md#d4-028) → A; [D4-029](DECISIONS.md#d4-029) → A.
- Jednostki: [F4-161](FINDINGS.md#f4-161): `całość`
- Zachowanie: Tasować komplet 11..20 o sumie 155 zamiast różnych rozkładów withSum; reguła stop i tie pęknięć zostają.
- Pliki: packages/games/src/balon.ts, balon.test.ts; dokumentacja losowania.
- Zasady/dokumenty: **tak: rozkład wytrzymałości**. Dokumenty: ZASADY-GIER §Balon; KONCEPT §2.4; ZASADY §3 reguła w policy.
- Zależności i rozpoczęcie: [P4-001](PACKAGES.md#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. 1000 seedów: ten sam multizbiór 11..20, suma 155, różna kolejność, score 0..155 i najgorszy timeout. Porównać strategie stop 10/15 na tym samym komplecie. /dev10 balonów, solo/6, rekordy i turniej.
- Granice: Zwężenie z 1..30 do 11..20 mocno zmienia odczucie ryzyka; wymaga jawnej akceptacji kompletu, nie samego słowa wyrównać.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-061"></a>

### P4-061. Zegar bodźca i dotyku

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-049](DECISIONS.md#d4-049) → A.
- Jednostki: [F4-117](FINDINGS.md#f4-117): `całość`
- Zachowanie: Spójny zegar zdarzenia i rAF, opis ograniczeń sprzętu; nie obiecywać usunięcia opóźnienia ekranu/dotyku.
- Pliki: Refleks/Stoj/Stoper/Wieza i inne dokładne miejsca F4-117; bez kalibracji pertelefon.
- Zasady/dokumenty: **tak jeśli zmienia moment pomiaru wyniku; nie same jednostki**. Dokumenty: ZASADY-GIER §Refleks/§Stój!; ZASADY §5.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: U14 oraz G-DANE przed zmianą metody liczenia rekordów.
- Odbiór: T + UI. U14: logi timestamp/rAF, ekrany 60/120 Hz, pomiar błysku i zachowania po powrocie do karty; bodziec bez przejścia. Równa jednostka ms, żaden wynik z ujemnego czasu; porównanie starego i nowego odniesienia.
- Granice: rAF jest przed prezentacją klatki, nie pomiarem emisji piksela. Stoper/Wieża wymagają dowodu sensu zmiany, nie mechanicznej zamiany wszystkich performance.now.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-062"></a>

### P4-062. Państwa-miasta: pominąć Ł

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-046](DECISIONS.md#d4-046) → A.
- Jednostki: [F4-166](FINDINGS.md#f4-166): `całość`
- Zachowanie: Ł nie losuje się w rundach, bo kategoria państwa jest systemowo słabsza.
- Pliki: packages/games/src/panstwa-miasta.ts, test.
- Zasady/dokumenty: **tak: pula liter**. Dokumenty: ZASADY-GIER §Państwa-miasta; KONCEPT §2.5.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Test dozwolonej puli liter,5różnych rund, ten sam seed i brak Ł; /dev start/rewanż z zachowaniem punktacji.
- Granice: Nie jest to korekta odpowiedzi czy progu głosowania.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-034"></a>

### P4-034. Jedna lista mini-gier i klucz rewanżu

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-090](DECISIONS.md#d4-090) → A.
- Jednostki: [F4-017](FINDINGS.md#f4-017): `całość`; [F4-048](FINDINGS.md#f4-048): `całość`; [F4-051](FINDINGS.md#f4-051): `całość`; [F4-156](FINDINGS.md#f4-156): `całość`
- Zachowanie: Rejestr daje listę mini-gier; Sudoku ma nonce z fallbackiem starej planszy; prefiksy stałych i wspólny dolny pasek Turnieju.
- Pliki: index.ts i test; Game.tsx,Lobby.tsx,MiniGame.tsx,Setup.tsx; sudoku.ts/test; eksporty stałych.
- Zasady/dokumenty: **nie**. Dokumenty: KONCEPT §3 struktura; ZASADY §6 odsyłacze.
- Zależności i rozpoczęcie: [P4-016](PACKAGES.md#p4-016). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Porównać zestawy 30 id przed/po, rewanż identycznej planszy Sudoku montuje nową partię, stary detail bez nonce działa. Turniej preset/min/max i przyklejony Start nie zmienia gotowości.
- Granice: Nie dodawać nowej gry ani zależności; zmiana nazw eksportów nie zmienia id.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-035"></a>

### P4-035. Wspólne funkcje bez zmiany reguł

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-090](DECISIONS.md#d4-090) → A dla tasowania/nazwy; B dla kopii rund i końca Koła.
- Jednostki: [F4-019](FINDINGS.md#f4-019): `całość`
- Zachowanie: Tasowanie Kampus Tour z core, nazwa swapsFor w Kubkach; dla trzech kopii rund wybrać zachowanie jawnego odstępstwa zamiast automatycznej ekstrakcji, Koło z opisanym powodem końca.
- Pliki: kampus-tour.ts,kubki.ts; ZASADY-GIER §1/§Koło; bez nowego frameworka rund.
- Zasady/dokumenty: **nie**. Dokumenty: ZASADY-GIER §1 i §Koło.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Dla ustalonych seedów te same talie/zamiany i wyniki przed/po; kontrakt Koła kończy się po próbach wszystkich; dokument wskazuje, dlaczego pozostają kopie szacowania.
- Granice: D4-090:A nie jest zgodą na opcjonalną nową warstwę abstrakcji; to podwybór zachowania obecnych kopii wymagający jawnego zapisu w 04-04.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-047"></a>

### P4-047. Słowa czynności i przejść

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-070](DECISIONS.md#d4-070) → A; [D4-095](DECISIONS.md#d4-095) → A.
- Jednostki: [F4-085](FINDINGS.md#f4-085): `całość`; [F4-091](FINDINGS.md#f4-091): `całość`; [F4-098](FINDINGS.md#f4-098): `całość`; [F4-119](FINDINGS.md#f4-119): `całość`; [F4-139](FINDINGS.md#f4-139): `całość`; [F4-148](FINDINGS.md#f4-148): `całość`
- Zachowanie: Dalej do następnego kroku, Wyniki do podsumowania; Gotowe dla oddania, Jestem gotowy dla lobby; rysujesz i Dotknij symbolu. Kolor przycisku wynika z roli w partii/między grami.
- Pliki: teksty w Game/Lobby/Setup i wszystkich grach wskazanych F4.
- Zasady/dokumenty: **nie dla gry, tak dla słownika UI**. Dokumenty: ZASADY §4; DESIGN §5.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Przejść od Intro przez odsłonę do Rewanżu w wskazanych grach i Turnieju: etykieta mówi co nastąpi, nie znika potrzebna akcja; Potnij/Pokrój pozostaje czynnością gry, nie mechaniczne Dalej.
- Granice: Nie zmieniać momentu wysłania wyniku; właścicielem W pamięci jest P4-005.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-049"></a>

### P4-049. Liczby, etykiety i wąskie kolumny

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-096](DECISIONS.md#d4-096) → B.
- Jednostki: [F4-101](FINDINGS.md#f4-101): `całość`; [F4-102](FINDINGS.md#f4-102): `całość`; [F4-103](FINDINGS.md#f4-103): `całość`; [F4-120](FINDINGS.md#f4-120): `całość`; [F4-122](FINDINGS.md#f4-122): `całość`; [F4-124](FINDINGS.md#f4-124): `całość`; [F4-141](FINDINGS.md#f4-141): `całość`; [F4-145](FINDINGS.md#f4-145): `całość`; [F4-149](FINDINGS.md#f4-149): `całość`; [F4-151](FINDINGS.md#f4-151): `całość`; [F4-153](FINDINGS.md#f4-153): `całość`; [F4-157](FINDINGS.md#f4-157): `całość`
- Zachowanie: Odczyty mono/tabular-nums, narracja może zostać Satoshi; wspólny przecinek i brak wartości; skrót 999+ tylko w ciasnej Mapie, pkt w nagłówku Turnieju. Progi gry zachowane i uzasadnione, nie wymuszać grade.
- Pliki: ui.tsx,Records.tsx,Game.tsx i dokładne miejsca gier z F4.
- Zasady/dokumenty: **nie: wartości i ich progi bez zmian; tak dla wyjątku narracji**. Dokumenty: ZASADY §4; DESIGN §2/§5.
- Zależności i rozpoczęcie: [P4-048](PACKAGES.md#p4-048). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. U04/U05/U06: 10 rund, długie nicki, duża suma turnieju i wynik Zakupów mieszczą się; tooltip/pełny wynik nie gubi liczby przez skrót. Kary Schultego/Sudoku nadal całkowite; test formatowania nie zmienia rankingu.
- Granice: Nie przedstawiać istniejących całkowitych kar jako potwierdzonego błędu dziesiętnego.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-053"></a>

### P4-053. Wąskie podpisy i hierarchia ekranów

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-066](DECISIONS.md#d4-066) → A; [D4-072](DECISIONS.md#d4-072) → A; [D4-095](DECISIONS.md#d4-095) → A; [D4-098](DECISIONS.md#d4-098) → A.
- Jednostki: [F4-066](FINDINGS.md#f4-066): `całość`; [F4-068](FINDINGS.md#f4-068): `całość`; [F4-070](FINDINGS.md#f4-070): `całość`; [F4-071](FINDINGS.md#f4-071): `całość`; [F4-072](FINDINGS.md#f4-072): `całość`; [F4-123](FINDINGS.md#f4-123): `całość`; [F4-133](FINDINGS.md#f4-133): `całość`; [F4-136](FINDINGS.md#f4-136): `całość`; [F4-142](FINDINGS.md#f4-142): `całość`; [F4-143](FINDINGS.md#f4-143): `całość`; [F4-144](FINDINGS.md#f4-144): `całość`
- Zachowanie: Jeden wypełniony akcent Home; tytuły i tła zgodne ze wzorcem; poprawić tylko zmierzone obcięcia podpisów i Preview. Koło ma osobny Preview, Stroop pełny opis zgodnych plansz.
- Pliki: Home/Setup/Records; Stroop/Kolo/KampusTour/KampusSummary; siatki Quiz/Sudoku zgodnie z F4-123.
- Zasady/dokumenty: **nie dla zasad**. Dokumenty: DESIGN §2/§5/§6; ZASADY §4 Intro.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: U03/U04/U09 dla niezmierzonych wystąpień; nie poprawiać hipotetycznych obcięć na ślepo.
- Odbiór: T + UI. U03/U04/U09: Wszystkie(30), komplet odpowiedzi Preview, TopGame i drobne podpisy czytelne przy 360 px i fontach. Pełny kod pokoju: Dołącz primary, Zagraj obrys. Dodatkowy tekst nie zwiększa Intro poza okno.
- Granice: Czytelność 7-8 px wymaga telefonu; sam rozmiar z CSS nie rozstrzyga.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

<a id="scope-p4-054"></a>

### P4-054. Nieaktualne opisy bez zmiany zasad

- Decyzja: **poprawić**; PK4-v1 + ZG4-v1. [D4-072](DECISIONS.md#d4-072) → A; [D4-095](DECISIONS.md#d4-095) → A.
- Jednostki: [F4-020](FINDINGS.md#f4-020): `całość`; [F4-024](FINDINGS.md#f4-024): `całość`; [F4-025](FINDINGS.md#f4-025): `całość`; [F4-026](FINDINGS.md#f4-026): `całość`; [F4-035](FINDINGS.md#f4-035): `całość`; [F4-043](FINDINGS.md#f4-043): `całość`; [F4-044](FINDINGS.md#f4-044): `całość`; [F4-052](FINDINGS.md#f4-052): `całość`; [F4-055](FINDINGS.md#f4-055): `całość`; [F4-125](FINDINGS.md#f4-125): `całość`
- Zachowanie: Opisy kart/talii/fazy pick, tie W pamięci, jednostka serii, komentarze widoków i Ć odpowiadają istniejącej grze; Intro podaje rundy i uczciwie opisany czas.
- Pliki: KONCEPT.md; ZASADY-GIER wskazane sekcje; komentarze i FORMAT w Records.tsx; Intro gier F4-125.
- Zasady/dokumenty: **nie: opis/etykieta, bez nowych liczb zasad**. Dokumenty: KONCEPT; ZASADY-GIER; ZASADY §4.
- Zależności i rozpoczęcie: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Odbiór: T + UI. Wskazane sformułowania i komentarze porównać z kodem; seria nie opisana pkt, karty Kampus Tour nie przypisane Poprawce. Intro ma time/task/score i Preview, nie obiecuje czasu z modelu jako stałego.
- Granice: Jeśli inny zaakceptowany pakiet zmienia tę samą regułę, jego opis ma pierwszeństwo; nie przywracać później starej liczby.
- Wykonanie: **nie rozpoczęto**. Dowody poprawki/odbioru: brak.

## 5. Dokumentacja pozostawionych zakresów i istniejące odstępstwa

Właścicielem dokumentacji każdego H jest ten sam identyfikator H, nie inny pakiet P4. Dla reguł gier dopisać zaakceptowany powód w odpowiedniej sekcji ZASADY-GIER, KONCEPT tylko jeśli dotyczy opisu; bez zmiany kodu lub niewybranej alternatywy. Ta praca należy do zatwierdzonego zakresu, choć nie jest 28 poprawkami zachowania.

| Właściciel | Dokładne części | Wybór / powód / ewentualny powrót | Dokumentacja | Wykonanie |
|---|---|---|---|---|
| [H-001](PACKAGES.md#h-001) | [F4-002](FINDINGS.md#f4-002): `srodek` | Zostawić z powodem. Zostawić 60 s do pomiaru; wysoka ocena oparta na 5 s celowania. Powrót wyłącznie w nowym zakresie: P14: czas starannej partii; potem wariant 90 s i G-DANE jeśli wybrany. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-002](PACKAGES.md#h-002) | [F4-002](FINDINGS.md#f4-002): `tort` | Zostawić z powodem. Zostawić 120 s do pomiaru; 120,5 s jest modelem. Powrót wyłącznie w nowym zakresie: P14: osobny pomiar Tortu; potem 180 s lub uzasadniony dotychczasowy limit. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-003](PACKAGES.md#h-003) | [F4-002](FINDINGS.md#f4-002): `panstwa-miasta` | Zostawić z powodem. Najpierw czytelny interfejs; nowy wzór skraca czas małych grup. Powrót wyłącznie w nowym zakresie: P08 po pm-ui:5-6 os., ilu zdążyło przejrzeć i zagłosować. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-004](PACKAGES.md#h-004) | [F4-003](FINDINGS.md#f4-003): `kolor` | Zostawić z powodem. Nie wykazano wyrównania czułości proponowanymi pasmami. Powrót wyłącznie w nowym zakresie: próba generatora oraz U09; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-005](PACKAGES.md#h-005) | [F4-003](FINDINGS.md#f4-003): `dziesiatki` | Zostawić z powodem. Wpływ liczby par zależy od wyborów gracza. Powrót wyłącznie w nowym zakresie: P19; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-006](PACKAGES.md#h-006) | [F4-003](FINDINGS.md#f4-003): `sudoku` | Zostawić z powodem. Nie potwierdzono dostatecznej puli plansz 3fale/3jednoznaczne. Powrót wyłącznie w nowym zakresie: próba generatora; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-007](PACKAGES.md#h-007) | [F4-003](FINDINGS.md#f4-003): `kat` | Zostawić z powodem. Wpływ wielkości kąta na błąd człowieka niezmierzony. Powrót wyłącznie w nowym zakresie: P15; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-008](PACKAGES.md#h-008) | [F4-003](FINDINGS.md#f4-003): `sledzenie` | Zostawić z powodem. Mijanki są metryką generatora, nie udowodnioną trudnością. Powrót wyłącznie w nowym zakresie: U13 i partie mierzące mijanki; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-009](PACKAGES.md#h-009) | [F4-003](FINDINGS.md#f4-003): `stoj` | Zostawić z powodem. Błędy końcówki niezmierzone. Powrót wyłącznie w nowym zakresie: P18; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-010](PACKAGES.md#h-010) | [F4-003](FINDINGS.md#f4-003): `zaslona` | Zostawić z powodem. Widoczność a błąd niezmierzone. Powrót wyłącznie w nowym zakresie: P17; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-011](PACKAGES.md#h-011) | [F4-003](FINDINGS.md#f4-003): `literowka` | Zostawić z powodem. Rodzaj błędu a czas niezmierzony. Powrót wyłącznie w nowym zakresie: P16; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-012](PACKAGES.md#h-012) | [F4-003](FINDINGS.md#f4-003): `rok` | Zostawić z powodem. Działy wymagają klasyfikacji danych i partii. Powrót wyłącznie w nowym zakresie: P22; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-013](PACKAGES.md#h-013) | [F4-003](FINDINGS.md#f4-003): `kubki` | Zostawić z powodem. Niski rozrzut, brak dowodu potrzeby zmiany. Powrót wyłącznie w nowym zakresie: U13; wrócić tylko przy wykazaniu wpływu; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-014](PACKAGES.md#h-014) | [F4-158](FINDINGS.md#f4-158): `w-pamieci` | Zostawić z powodem. Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. Powrót wyłącznie w nowym zakresie: P11; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-015](PACKAGES.md#h-015) | [F4-158](FINDINGS.md#f4-158): `kubki` | Zostawić z powodem. Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. Powrót wyłącznie w nowym zakresie: P10; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-016](PACKAGES.md#h-016) | [F4-158](FINDINGS.md#f4-158): `simon` | Zostawić z powodem. Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. Powrót wyłącznie w nowym zakresie: P09; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-017](PACKAGES.md#h-017) | [F4-159](FINDINGS.md#f4-159): `wieza` | Zostawić z powodem. Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. Powrót wyłącznie w nowym zakresie: P13; dopiero potem nowe rundy/lista i ocena limitu/historii. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-018](PACKAGES.md#h-018) | [F4-159](FINDINGS.md#f4-159): `zakupy` | Zostawić z powodem. Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. Powrót wyłącznie w nowym zakresie: P12 po pakiecie zakupy; dopiero potem nowe rundy/lista i ocena limitu/historii. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-019](PACKAGES.md#h-019) | [F4-160](FINDINGS.md#f4-160): `kampus-tour` | Zostawić z powodem. Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. Powrót wyłącznie w nowym zakresie: P01; wrócić przed premią/ścianami/swap/losowaniem startu. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-020](PACKAGES.md#h-020) | [F4-163](FINDINGS.md#f4-163): `całość` | Zostawić z powodem. Udział kompletów z botów nie wystarcza do zmiany kosztu. Powrót wyłącznie w nowym zakresie: P02; przed nową ceną opisać zachowanie bez gotówki. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-021](PACKAGES.md#h-021) | [F4-164](FINDINGS.md#f4-164): `całość`; [F4-165](FINDINGS.md#f4-165): `całość` | Zostawić z powodem. Monopol rzadki w botach, czas gry to model. Powrót wyłącznie w nowym zakresie: P03/P04; dopiero potem ograniczenie grup lub 18 rund. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-022](PACKAGES.md#h-022) | [F4-160](FINDINGS.md#f4-160): `labirynt` | Zostawić z powodem. Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. Powrót wyłącznie w nowym zakresie: P06; wrócić przed premią/ścianami/swap/losowaniem startu. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-023](PACKAGES.md#h-023) | [F4-160](FINDINGS.md#f4-160): `piec-w-rzedzie` | Zostawić z powodem. Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. Powrót wyłącznie w nowym zakresie: P05; wrócić przed premią/ścianami/swap/losowaniem startu. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-024](PACKAGES.md#h-024) | [F4-160](FINDINGS.md#f4-160): `memory` | Zostawić z powodem. Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. Powrót wyłącznie w nowym zakresie: P07; wrócić przed premią/ścianami/swap/losowaniem startu. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-025](PACKAGES.md#h-025) | [F4-160](FINDINGS.md#f4-160): `statki` | Zostawić z powodem. Boty 50,8-54,5% nie uzasadniają nowej reguły; rotacja pozostaje. Powrót wyłącznie w nowym zakresie: Obserwować Flotę wojenną; brak nowej D4 nie oznacza automatycznej akceptacji: w 04-04 decyzja wprost o tym wystąpieniu. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-026](PACKAGES.md#h-026) | [F4-167](FINDINGS.md#f4-167): `całość` | Zostawić z powodem. Proporcja 3/10 nie dowodzi złego doświadczenia graczy. Powrót wyłącznie w nowym zakresie: P20; przed zmianą 3→5 porównać źródła punktów w pełnych partiach. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |
| [H-027](PACKAGES.md#h-027) | [F4-168](FINDINGS.md#f4-168): `całość` | Zostawić z powodem. Nieparzysta liczba gier nie gwarantuje braku remisu. Powrót wyłącznie w nowym zakresie: Częstość dogrywek w rzeczywistych seriach przed zmianą domyślnej długości. | ZASADY-GIER: odpowiednia gra; KONCEPT gdy dotyczy opisu | nie rozpoczęto |

47 istniejących odstępstw z DECISIONS §7 ma następujący routing dokumentacji (pełne źródłowe wiersze i powody pozostają pod wskazanym odsyłaczem):

| Źródła | Właściciel dokumentacji / zmiany |
|---|---|
| F1:O01..03 | P4-001: utrzymanie modelu zaufania, pomiaru klienta i obliczania Koła z punktów; odpowiednie sekcje gier i wspólne normy. |
| F1:O04 | P4-028: losowy legalny krok po limicie, zamiast optymalnego. |
| F1:O05 | P4-035: zachowane prawdziwe próby Koła; P4-022 osobno usuwa odnawianie terminu rywalem. |
| F1:O06..08 | P4-043: rozróżnienie kar i bodźca metronomu, bez zmiany -2 w Stój!/kar quizów; powody w odpowiednich sekcjach zasad. |
| F1:O09 | P4-001: zachować losowe cele Przytrzymaj/Zasłony; H-010 osobno zachowuje rozkład widoczności. |
| F1:O10 | P4-004: Sekwencja z walidowanym postępem; pozostałe progress zachowują dotychczasową rolę podglądu. |
| F1:O11 | P4-054: strefa palca Środka w px jako powód, bez zmiany jednostki wyniku. |
| F1:O12 | P4-054: zapisane zniekształcenie Mapy do 6%; MP-01 zamknięte bez implementacji. |
| F1:O13 | H-005: obecny generator Dziesiątek i wpływ wyborów, D4-018:C. |
| F1:O14 | H-019: premia Kampus Tour pozostaje, bez nowego pomiaru lub zmiany ekonomii. |
| F2:O01 | P4-017: scena pozioma zostaje, geometria i kontrolki naprawione. |
| F2:O02..03 | P4-050: własne nagłówki i pełny zakres informacji; P4-017 realizuje swój lokalny fragment Kampus Tour bez podwójnej pracy. |
| F2:O04..05, O07..09, O15 | P4-050: wyjątki treści, pochodne tokenów, obrysy i trafienie Statków; powody w DESIGN/ZASADY. |
| F2:O06 | P4-017: naprawić cele po skali, nie zachowywać 44/35 px. |
| F2:O10 | P4-041: istniejące 1200 ms zamiany Statków pozostaje opisanym wyjątkiem. |
| F2:O11 | P4-042: Szybki Chińczyk 110/400 ms. |
| F2:O12..14 | P4-050: emoji Memory, paleta i poświata Kalamburów jako treść. |
| F2:O16 | P4-042: nie ujawniać licznika w grach, w których zdradza czas/tempo. |
| F2:O17..18 | P4-043: metronom 30 ms i jedyny dźwięk Rytmu. |
| F2:O19..22 | P4-050: figury/palety/kształty/próbki są treścią; kontrolki osobno P4-037. |
| F2:O23 | P4-001: losowa dekoracja klienta pozostaje oddzielna od reguł wymagających rng. |
| F2:O24..25 | P4-040: reduced motion wyłącza dekoracje, zachowuje informację zadania i pokaz Sekwencji. |
| F2:O26..27 | P4-043: kara Stój! i blokada 1 s quizów pozostają; efekty nie zmieniają zasad. |
| F2:O28 | P4-050: geometria balonu/kubka/klocka/kulki jako treść. |
| F2:O29 | P4-048: miniatury Koła zamiast tabeli jako nazwany wyjątek; P4-016 osobno dolne akcje. |
| F2:O30..31 | P4-053: ikona wyzwania zachowana, jeden wypełniony akcent Home. |
| F2:O32 | P4-052: opis blokady startu zamiast pustego przycisku. |
| F2:O33 | P4-047: nazwy według skutku, Pokrój pozostaje czynnością gry. |

Powyższe przypisanie rozlicza dokumentację powodu; nie zmienia mapy 295 jednostek i nie tworzy nowych problemów. W razie wspólnego miejsca w dokumencie wprowadzić uzgodniony zapis raz, a poszczególne wystąpienia odebrać pod ich właścicielem.

## 6. Końcowa kontrola łańcucha i wznowienie

[PACKAGES §5](PACKAGES.md) to pełna mapa źródłowa F4 → właściciel/część. §4 niniejszego przekazania obejmuje wszystkie 267 części P4, §5 wszystkie 28 części H. Karty F4 prowadzą do plik:linia oraz F1/F2/F3, a [DECISIONS §14](DECISIONS.md#zg4-accepted) do rzeczywistej zgody. Wagi i metoda audytu nie zmieniły się po zatwierdzeniu.

Pierwszy plan wykonawczy: [05-01: P4-001, wspólne normy](../05-poprawki-zaakceptowanych-rozbieznosci/05-01-PLAN.md). Kolejne szczegółowe plany rozpisywać według §2 i kart §4, bez ponownego pytania o zgodę na identyczny zakres. Po P4-001 następny niezależny obszar to kontrakt P4-027/P4-002, z testem i dokumentacją przed implementacją reguły.

Faza 4 jest zakończona, faza 5 ma **wykonany P4-001 (1/62 pakietów)**; pozostałe pakiety nie rozpoczęte. Następny plan 05-02/P4-027 przygotowany. FIX-02 można zakończyć dopiero po wykonaniu i udokumentowaniu odbioru wszystkich przypisanych części oraz wymaganych testów; niewykonanych U nie ukrywać w podsumowaniu.

2026-10-26, upoważnienie Git: użytkownik „Tak” zezwolił na konkretny commit pięciu plików TDD 05-02 (`50172d5`) i dalszą implementację. To spełniło warunek kolejności P4-027; nie zmienia domyślnej zasady commitów na prośbę ani zakazu push/produkcji.

# Pakiety poprawek PK4-v1

Data: **2026-10-26**. Stan: **pełna akceptacja ZG4-v1**: 62 pakiety zatwierdzone (8 wcześniej w B4-001/B4-002, pozostałe 54 w ZG4-v1). [ZG4-v1](FINAL-APPROVAL.md) jest zatwierdzoną nakładką na bazowe PK4-v1; uściślenia kart przeniesiono poniżej. Wykonanie i odbiór pozostają przyszłą pracą. Powiązany raport: [R4-v1](REPORT.md). Podstawa: FINDINGS v1.1, DECISIONS v1 i EVIDENCE v1 z 04-02; kod na HEAD `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3` bez zmian względem tych dowodów.

62 pakiety stanowią zatwierdzony zakres do wykonania w fazie 5. 27 pozycji H to zatwierdzone końcowe pozostawienie zachowania na ten etap z powodami. Zgody B4-001/B4-002 zapisane w DECISIONS §10-11, końcowa ZG4-v1 w §14. Pomiary nie zostały wykonane przez samą decyzję o pozostawieniu.

## 1. Jak czytać zakres i odebrać pakiet

- Właścicielem jest pakiet P4 albo pozycja H. Każdy pełny F4 ma jednego właściciela, z wyjątkiem jawnie rozdzielonych wystąpień. Pełny wykaz jest w §5; 295 jednostek zakresu nadal opisuje **168 F4**, nie 295 nowych błędów. Właściciel zakresu nie oznacza własności całego pliku.
- `F4-NNN / całość` oznacza wszystkie i tylko wystąpienia wymienione w tym F4 w wersji v1.1, z ich plik:linia. Nazwana część agregatu ogranicza zakres do wskazanej gry, pliku lub sytuacji. Dokładne definicje podziału poniżej, bez dopisywania przyszłych trafień.
- Wariant na karcie jest **zatwierdzony**, z ograniczeniami ZG4-v1 §3. D4 występujące w kilku pakietach muszą dostać ten sam wybór reguły, chyba że jawnie zaznaczono podział po wystąpieniach. Zmiana istotna oznacza nową wersję zakresu i ponowną decyzję tylko o zmienionej części.
- P1: utrata/nierówne traktowanie wyniku albo niedostępna akcja. P2: pozostałe zasady, obowiązkowe testy i wspólne zachowania. P3: kosmetyka i utrzymanie. To priorytet, nie zmiana wag audytu. P1 warunkowe nie udaje potwierdzonego krytycznego błędu.
- S: mały, jeden mechanizm lub opis; M: kilka powiązanych miejsc i regresji; L: wiele wystąpień/kontrakt danych lub bogaty odbiór. To względny rozmiar, nie estymata godzin. L nie zezwala na dodatkowe zmiany; jego skończona lista jest w karcie i §5.

**Bramka T, każdy pakiet kodu/testów:** `pnpm typecheck && pnpm test` bez błędów po pakiecie. Testy zmienianej zasady i wpis w ZASADY-GIER (oraz KONCEPT, jeśli dotyczy) powstają przed implementacją. Historia testów zasad ma osobny commit przed kodem zgodnie z AGENTS, a commit/push wykonuje się tylko na zlecenie użytkownika. W 04-03 nie piszemy testów ani implementacji. Pakiet obowiązkowych brakujących testów nie zwalnia innych pakietów z własnego testu regresji.

**Bramka UI, każdy pakiet interfejsu:** konkretne przypadki z karty oraz stosowne §6 ZASADY: pełna partia przy minimalnej/maksymalnej liczbie miejsc i obserwator; odświeżenie w każdej dotkniętej fazie, timeout, wyjście/walkower, remis gdy dopuszczony, rewanż i Do lobby; mini-gra również rekord w pokoju i na Rekordach oraz turniej. 360×640 bez poziomego przewijania strony, aktywna plansza bez zasłaniania, cele 48 px lub **zatwierdzony nazwany** wyjątek, kolor gracza, reduced motion i brak ukrytych danych w WebSocket. Żądane urządzenia U02/U10-U14 muszą mieć rzeczywisty wynik; emulacja zastępuje tylko rozmiar okna. Wspólne komponenty sprawdzać na wszystkich grach wyszczególnionych w karcie, nie wyłącznie jednym przykładzie.

**Bramka D, dokumenty:** porównać nowy opis z zaakceptowanym wariantem i z kodem; lista tokenów i reguł ma jedno źródło. Dokumentacja należąca do zmiany zasad pozostaje w jej pakiecie, nie w późniejszej kosmetyce. Pakiet bez kodu także przechodzi kontrolę spójności oraz końcowe wymagane typecheck/test przed zgłoszeniem całego zadania.

### Definicje rozdzielonych wystąpień

| Agregat | Rozdział bez nakładania |
|---|---|
| F4-002 | `regula-zapasu` to zatwierdzona nowa norma ZASADY §3, do wdrożenia w P4-001; pozostałe części to pojedyncze gry simon/zakupy/srodek/tort/sledzenie/panstwa-miasta/rok, ze swoim limitem i dokumentacją. |
| F4-003 | Po jednym wystąpieniu setup/trudności każdej z 15 gier z tabeli rejestru; brak wspólnego pakietu zmieniającego naraz wszystkie generatory. |
| F4-004..012 | Każdy wiersz gry z pola Zakres ma jednego właściciela testu; ta sama gra/reguła nie pojawia się w innej grupie testów. Test nowej zasady we właściwym pakiecie nie jest ponowną realizacją brakującego starego testu. |
| F4-056 | `naglowek-Game` wyłącznie Game.tsx:233-338 (w tym pigułki Statków); pozostałe części to geometria lokalnego komponentu danej gry. Pozwala to zmienić wspólny nagłówek przed lokalną korektą bez podwójnego liczenia. |
| F4-057 | `kampus-tour` i `chinczyk` mają odrębne sterowanie animacją. |
| F4-093 | `kampus-tour`: KT4/KT5/KT6 i uzupełnienie skali E13-E15; `geste-plansze`: G2/S2/C2/L2; `kontrolki-platformy`: B-31 (Odcień/Rok), LB-1/LB-2/LB-3 (Lobby/Setup); `panstwa-miasta`: PM3; `tort`: TO1; `sledzenie`: SL2. |
| F4-107 | `set-glow`: B-35 i jego wiersz tabeli; `paski`: GM-9/RY2/ZK2 oraz ich obliczanie; `ruch-zadanie`: KB2/SL3/WZ5 i przypisany wyjątek. |
| F4-158/159/160 | Osobno każda gra z tabel tych agregatów. Rekomendacja jednej gry nie zatwierdza pozostałych. |

## 2. Bramki, które ograniczają tylko zależny zakres

| Bramka | Wymagane rozstrzygnięcie / warunek przejścia |
|---|---|
| G-DANE | **Rozstrzygnięte ZG4-v1 §3.1-2**: historia pozostaje, nowe timeouty Schulte/Sudoku bez rekordu, stary status bez zgadywania; znane tie przed null. Bez zmian schematu, migracji lub kasowania. Testy kompatybilności pozostają bramką wykonania. |
| G-LIMITY | **Rozstrzygnięte ZG4-v1 §3.3**: tabela 30 mini-gier, Środek/Tort/Rok nazwanymi wyjątkami. P4-022 po P4-003/004/020/021. P14 nie uznano za wykonany. |
| G-KONTRAKT | **Wybór zatwierdzony ZG4-v1 §3.1/3.3**: GameResult.places i zaufane source client/timeout, również dla Schulte/Sudoku. Testy zgodności przed kodem pozostają wymagane, bez kolejnej zgody na ten sam kontrakt. |
| U01-U14, P01-P22 | Warunki, wykonawcy i miary pozostają w EVIDENCE §3/§4. Dla P4 wskazano konkretny podzbiór. Brak telefonu nie blokuje tekstów, nagłówka czy testów niekorzystających z tego dowodu. H mają końcową decyzję pozostawienia z powodem w ZG4-v1; niewykonany pomiar nadal pozostaje niewykonany. |

D4-035:B pozwala na uzasadnione remisy przy komplecie. D4-090 ma zatwierdzony podwybór per wystąpienie: A dla rejestru/nonce/stałych/paska oraz tasowania i nazwy w Kubkach, B z uzasadnieniem dla kopii rund i końca Koła. D4-096:B zostawia narracyjne liczby w Satoshi, ale odczyty nadal mono. Te wybory są nazwane, aby akceptacja jednego pakietu nie wymuszała przeciwnej zmiany w innym.

## 3. Karty pakietów

<a id="p4-001"></a>

### P4-001. Wspólne reguły i granice wyjątków

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: reguły wspólne są zależnością pozostałych zmian.
- Problem i zachowanie po zmianie: Jedna tabela tokenów w DESIGN, listy poza partią mogą przewijać się w pionie; jawny model T i zapas max(20% T,10 s) tylko jeśli wybrany; remis przy komplecie dozwolony z uzasadnieniem. Nie zmieniać samych limitów i losowania.
- Dokładny zakres/właściciel: [F4-002](FINDINGS.md#f4-002) / `regula-zapasu`, [F4-060](FINDINGS.md#f4-060) / całość, [F4-061](FINDINGS.md#f4-061) / całość, [F4-067](FINDINGS.md#f4-067) / całość, [F4-069](FINDINGS.md#f4-069) / całość.
- Zatwierdzone warianty: [D4-005](DECISIONS.md#d4-005) → A; [D4-029](DECISIONS.md#d4-029) → A; [D4-035](DECISIONS.md#d4-035) → B; [D4-056](DECISIONS.md#d4-056) → A; [D4-062](DECISIONS.md#d4-062) → A.
- Pliki/obszary: ZASADY.md §3-5; DESIGN.md §2/§6; KONCEPT.md odsyłacze.
- Zmiana zasad: **tak: normy platformy, bez zmiany pojedynczej gry**. Dokumenty: ZASADY; DESIGN; KONCEPT.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Sprawdzić spójność zapisów: model nie jest pomiarem, tokeny mają jedno źródło, reguła nie wymusza tie w każdej grze. Zmiany poszczególnych zasad i UI tylko w ich pakietach.
- Ryzyko/granice: Przyjęcie normy nie zatwierdza wynikających z niej limitów ani wyłączeń dostępności.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 5 jednostek zakresu i 5 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-002"></a>

### P4-002. Najgorszy wynik po limicie

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: potwierdzone przykłady nieuczciwego rankingu W/S.
- Problem i zachowanie po zmianie: Schulte/Sudoku: completed w stanie, ukończeni przed timeoutem; nowe timeouty bez rekordu przez istniejący filtr niefinitywnego record.score, bez niefinitywnych danych w JSON. Kropki: max(n,99-n). Historyczne nieoznaczone wyniki pozostają bez zgadywania, zgodnie z ZG4-v1 §3.1.
- Dokładny zakres/właściciel: [F4-001](FINDINGS.md#f4-001) / całość.
- Zatwierdzone warianty: [D4-001](DECISIONS.md#d4-001) → A; [D4-002](DECISIONS.md#d4-002) → A; [D4-003](DECISIONS.md#d4-003) → A.
- Pliki/obszary: packages/games/src/{schulte,sudoku,kropki,core}.ts i testy; index.test.ts; apps/server/src/LobbyRoom.ts z zaufanym kontekstem source oraz testy; ekrany Schulte/Sudoku i brak nowego RecordPanel przy timeout. Bez zmiany schematu stats.ts/SQLite.
- Zmiana zasad: **tak: wynik i komparator**. Dokumenty: ZASADY-GIER trzy gry; KONCEPT §2.4; ZASADY §3.
- Zależności pakietowe: [P4-027](#p4-027) w zakresie wspólnego kontraktu source client/timeout. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.1; test kompletności/timeoutu i zgodności starego detail przed kodem. Kontekst wspólny, bez drugiej implementacji.
- Kolejność/odbiór: T + UI. Najpierw testy: 170 s+4 pomyłki Schultego i 60 s+13 błędów Sudoku nadal przed timeoutem; żadna odpowiedź kropek gorsza od timeoutu; remis/solo/places oraz rekord mają identyczny komparator. UI: rekord ze starym detail, timeout jednego z 2/6 graczy, pełny remis i seria turniejowa.
- Ryzyko/granice: Nie rozpoznawać dawnego timeoutu po samym score. Stary nierozpoznawalny timeout może pozostać przed nowym ukończeniem w historycznym rankingu; jawnie zaakceptowany wyjątek ZG4-v1 §3.1.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 1 jednostek zakresu i 3 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-003"></a>

### P4-003. Zakupy: pełny czas i pomiar zatwierdzenia

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-002; użytkownik „Tak”). Priorytet: **P1**. P1: T=63 s >60 s oraz pomiar puszczenia palca są dowodami W/S.
- Problem i zachowanie po zmianie: 80 s limitu platformy; po 50 s wybierania automatyczne oddanie zaznaczeń; koniec pomiaru na pointerdown, klawiatura przez click detail=0, bez podwójnego wyniku.
- Dokładny zakres/właściciel: [F4-002](FINDINGS.md#f4-002) / `zakupy`, [F4-059](FINDINGS.md#f4-059) / całość.
- Decyzje zatwierdzone w granicach tej karty: [D4-006](DECISIONS.md#d4-006) → A; [D4-050](DECISIONS.md#d4-050) → A.
- Pliki/obszary: packages/games/src/zakupy.ts, zakupy.test.ts; apps/web/src/games/Zakupy.tsx.
- Zmiana zasad: **tak: limit i oddanie; dotyk przywraca wymaganą metodę**. Dokumenty: ZASADY-GIER §Zakupy; KONCEPT §3.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w B4-002: stare rekordy pozostają bez przeliczania i resetu. P4-001 zatwierdzony w ZG4-v1; wykonania nie rozpoczęto.
- Kolejność/odbiór: T + UI. Test 80 s, granica MAX_MS i wynik z zaznaczeń; ten sam ruch ręczny/automatyczny; przytrzymanie przycisku nie dolicza czasu do tie; klawiatura działa raz. Solo/2/6 osób, odświeżenie pokazu i półki, wynik w rekordach i turnieju.
- Ryzyko/granice: Nie zwiększać listy do 12 pozycji; F4-159:zakupy pozostaje osobnym pytaniem.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 2 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-004"></a>

### P4-004. Sekwencja: zachowanie zaliczonej serii

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-002; użytkownik „Tak”). Priorytet: **P1**. P1: wyliczony limit ucina rosnące partie; nie dowodzi osiągnięć ludzi.
- Problem i zachowanie po zmianie: Przy 300 s serwer oddaje ostatnią zaliczoną serię z walidowanego progress, zamiast 0; bez dokładania tie szybkości.
- Dokładny zakres/właściciel: [F4-002](FINDINGS.md#f4-002) / `simon`.
- Decyzje zatwierdzone w granicach tej karty: [D4-004](DECISIONS.md#d4-004) → A.
- Pliki/obszary: packages/games/src/simon.ts, simon.test.ts, index.ts; apps/web/src/games/Simon.tsx; koperta progress pokoju tylko w wymaganym zakresie.
- Zmiana zasad: **tak: wynik po czasie i progress**. Dokumenty: ZASADY-GIER §Sekwencja; KONCEPT §2.4/§3.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w B4-002: stare rekordy pozostają bez przeliczania i resetu. P4-001 zatwierdzony w ZG4-v1; wykonania nie rozpoczęto.
- Kolejność/odbiór: T + UI. Najpierw testy progress 0/1/100, odrzucenia obcego, ułamka, cofnięcia lub wyniku po końcu; timeout zachowuje ostatnią zaliczoną, nie zaczętą serię. /dev: seria blisko 300 s, pomyłka/timeout/refresh i rewanż, solo/6/turniej.
- Ryzyko/granice: Zaufany model mini-gier nie znosi walidacji; bufor 100 kolorów nie daje skończonego czasu decyzji gracza.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-005"></a>

### P4-005. W pamięci: oddanie bez dodatkowego przycisku

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-001; „Zatweirdzam”). Priorytet: **P1**. P1 mimo średniej wagi: realne ryzyko utraty wyniku przy odłożeniu telefonu; nie każda partia traci wynik.
- Problem i zachowanie po zmianie: Pomyłka lub komplet wysyła wynik od razu; odsłona służy obejrzeniu odpowiedzi, nie uruchomieniu zapisu.
- Dokładny zakres/właściciel: [F4-083](FINDINGS.md#f4-083) / całość.
- Decyzje zatwierdzone w granicach tej karty: [D4-071](DECISIONS.md#d4-071) → A.
- Pliki/obszary: apps/web/src/games/WPamieci.tsx; w-pamieci.test.ts tylko regresja istniejącego kontraktu.
- Zmiana zasad: **nie: moment wysłania zgodny z końcem gry; dokumentacja zachowania**. Dokumenty: ZASADY-GIER §W pamięci (ekran).
- Zależności pakietowe: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Kolejność/odbiór: T + UI. W /dev uzyskać błąd po kilku zaliczonych rundach i nie naciskać Wyniki; serwer, ranking i rekord zachowują wynik przed timeoutem. Sprawdzić komplet, odświeżenie odsłony, drugi result i solo/6 osób.
- Ryzyko/granice: Nie zmieniać rozkładu działań ani tie pełnych 12 rund.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-006"></a>

### P4-006. Wspólny nagłówek aktywnej partii

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-001; „Zatweirdzam”). Priorytet: **P1**. P1: wspólna przyczyna potwierdzonych M obcięć, przed poprawkami gier.
- Problem i zachowanie po zmianie: Zwinąć pigułki i odliczanie tak, by nagłówek zostawiał miejsce planszy, zachowując status, wyniki i rozłączenie. Własne nagłówki nie są przebudowywane.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `naglowek-Game`.
- Decyzje zatwierdzone w granicach tej karty: [D4-055](DECISIONS.md#d4-055) → A.
- Pliki/obszary: apps/web/src/screens/Game.tsx:233-338; ui.tsx wyłącznie wykorzystanie/małe rozszerzenie wzorca GameDots.
- Zmiana zasad: **nie: układ, bez utraty informacji**. Dokumenty: DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Kolejność/odbiór: T + UI. 360×640 przy 2/4/6 osobach i długich nickach: zwinięty nagłówek mieści status i timer, rozwinięcie pokazuje pełne wygrane i postęp. Pomiar przed/po E01-E06; stan obserwatora, refresh, rozłączenie i koniec. Bez zasłaniania pól samym nagłówkiem.
- Ryzyko/granice: Nie obiecywać, że sam nagłówek rozwiąże geometrię każdej planszy; akcje i plansze mają osobnych właścicieli.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-007"></a>

### P4-007. Gomoku: plansza nad dolną akcją

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: aktywna plansza potwierdzona M; bitwa Statków wymaga uzupełnienia U01.
- Problem i zachowanie po zmianie: Własny ostatni rząd i podgląd wybranego kamienia widoczne równocześnie z Postaw.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `piec-w-rzedzie`.
- Zatwierdzone warianty: [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Pliki/obszary: apps/web/src/games/PiecWRzedzie.tsx; tylko lokalne wymiary i układ akcji.
- Zmiana zasad: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006), [P4-036](#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Własny ostatni rząd i podgląd wybranego kamienia widoczne równocześnie z Postaw. Porównać E05 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Ryzyko/granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-008"></a>

### P4-008. Statki: rozstawianie i bitwa w ekranie

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: aktywna plansza potwierdzona M; bitwa Statków wymaga uzupełnienia U01.
- Problem i zachowanie po zmianie: Obróć/Losuj/Gotowe dostępne bez nakładania na flotę; w bitwie i obronie obie role mają dostęp do aktywnej planszy.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `statki`.
- Zatwierdzone warianty: [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Pliki/obszary: apps/web/src/games/Statki.tsx; tylko lokalne wymiary i układ akcji.
- Zmiana zasad: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006), [P4-036](#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Obróć/Losuj/Gotowe dostępne bez nakładania na flotę; w bitwie i obronie obie role mają dostęp do aktywnej planszy. Porównać E06 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Ryzyko/granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-009"></a>

### P4-009. Chińczyk: domki i kostka w ekranie

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: aktywna plansza potwierdzona M; bitwa Statków wymaga uzupełnienia U01.
- Problem i zachowanie po zmianie: Dolne domki nie są przykryte; kostka i Rzuć współdzielą dostępną wysokość, Klasyczny i Szybki.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `chinczyk`.
- Zatwierdzone warianty: [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Pliki/obszary: apps/web/src/games/Chinczyk.tsx; tylko lokalne wymiary i układ akcji.
- Zmiana zasad: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006), [P4-036](#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Dolne domki nie są przykryte; kostka i Rzuć współdzielą dostępną wysokość, Klasyczny i Szybki. Porównać E04 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Ryzyko/granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-010"></a>

### P4-010. Labirynt: własny pionek i wybór ruchu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: aktywna plansza potwierdzona M; bitwa Statków wymaga uzupełnienia U01.
- Problem i zachowanie po zmianie: Startowy pionek, cel, wybór Pionek/Ściana i potwierdzenie widoczne; Klasyczny 9×9 i Szybki 7×7.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `labirynt`.
- Zatwierdzone warianty: [D4-055](DECISIONS.md#d4-055) → A; [D4-059](DECISIONS.md#d4-059) → A.
- Pliki/obszary: apps/web/src/games/Labirynt.tsx; tylko lokalne wymiary i układ akcji.
- Zmiana zasad: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006), [P4-036](#p4-036). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Startowy pionek, cel, wybór Pionek/Ściana i potwierdzenie widoczne; Klasyczny 9×9 i Szybki 7×7. Porównać E03 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Ryzyko/granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-011"></a>

### P4-011. Memory: wszystkie rzędy kart

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: aktywna plansza potwierdzona M; bitwa Statków wymaga uzupełnienia U01.
- Problem i zachowanie po zmianie: Wszystkie rzędy Średniej oraz Małej/Dużej i instrukcja mieszczą się na 360×640 przy min/max graczy. Karty minimum 48 px; bez wyjątku D4-059 dla Memory.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `memory`.
- Zatwierdzone warianty: [D4-055](DECISIONS.md#d4-055) → A; D4-059 nie daje wyjątku dla kart Memory.
- Pliki/obszary: apps/web/src/games/Memory.tsx; tylko lokalne wymiary i układ akcji.
- Zmiana zasad: **nie: geometria UI**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Wszystkie 6 rzędów Średniej i instrukcja widoczne bez scroll; Mała/Duża również przy min/max graczy. Porównać E01/E02 przy 360×640. Minimalna/maksymalna liczba miejsc + obserwator, wszystkie tryby, własny/cudzy ruch, odświeżenie i rewanż. Brak zmiany reguł ruchu.
- Ryzyko/granice: Nie zmniejszać hitboxów poniżej wybranego wyjątku. Zmieniony nagłówek może usunąć potrzebę części korekt; wówczas zapisać pomiar i nie dodawać zbędnego CSS.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-012"></a>

### P4-012. Kalambury: zgadywanie i Pasuję

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-001; „Zatweirdzam”). Priorytet: **P1**. P1: Pasuję całe poza ekranem M; zakres niezależny od wspólnego nagłówka.
- Problem i zachowanie po zmianie: Płótno liczy wysokość po całym własnym nagłówku; Zgadnij i Pasuję pozostają w zasięgu.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `kalambury`.
- Decyzje zatwierdzone w granicach tej karty: [D4-055](DECISIONS.md#d4-055) → A.
- Pliki/obszary: apps/web/src/games/Kalambury.tsx:36,342-382.
- Zmiana zasad: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Kolejność/odbiór: T + UI. Odtworzyć E07 (Krótka, 4 osoby, zgadujący), oba przyciski wewnątrz 640. /dev przy 2/6 osobach, obie role, choose/draw/reveal/over, refresh i pełna partia; U02 dla klawiatury jeśli wpływa na pole.
- Ryzyko/granice: Nie usuwać czatu ani limitu; nie zmieniać wcześniejszego hint w tej poprawce.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-013"></a>

### P4-013. Koło: zakończenie prób widoczne

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-001; „Zatweirdzam”). Priorytet: **P1**. P1: zakończenie niemal całe poza ekranem M.
- Problem i zachowanie po zmianie: Płótno dopasowuje się do wolnej wysokości, a Zostaw najlepszą… pozostaje widoczne po pierwszej próbie.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `kolo`.
- Decyzje zatwierdzone w granicach tej karty: [D4-055](DECISIONS.md#d4-055) → A.
- Pliki/obszary: apps/web/src/games/Kolo.tsx:187-221.
- Zmiana zasad: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności pakietowe: [P4-006](#p4-006). Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Kolejność/odbiór: T + UI. Powtórzyć E09 solo i pokój 2/6 osób przed/po próbie; przycisk ma pełne 48 px w oknie, pole rysowania zachowuje proporcje, niedokończona próba nie jest wynikiem. Refresh, timeout, me="" i rewanż.
- Ryzyko/granice: Zmniejszenie płótna może wpływać na wygodę; współrzędne wyniku nadal 0-1, punktacja bez zmian.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-014"></a>

### P4-014. Państwa-miasta: formularz i tabela głosowania

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1 dla dostępu do odpowiedzi, mimo średniej wagi tabeli; nie podniesiono wagi F4.
- Problem i zachowanie po zmianie: Formularz przewija się w pionie z dolną akcją; przy 4+ osobach kategoria osobno i gracze w wierszach, bez poziomego przewijania; cele głosu 48 px.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `panstwa-miasta`, [F4-093](FINDINGS.md#f4-093) / `panstwa-miasta`, [F4-152](FINDINGS.md#f4-152) / całość.
- Zatwierdzone warianty: [D4-056](DECISIONS.md#d4-056) → A; [D4-061](DECISIONS.md#d4-061) → A; [D4-060](DECISIONS.md#d4-060) → A.
- Pliki/obszary: apps/web/src/games/PanstwaMiasta.tsx:165-319.
- Zmiana zasad: **nie dla punktacji; tak dla wyjątku UI/formularzy**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: U02 jest warunkiem odbioru formularza z klawiaturą; pomiar samego viewportu nie zamyka go.
- Kolejność/odbiór: T + UI. E11 write oraz vote/summary przy 2/6 osobach: pełna odpowiedź i wszystkie głosy dostępne bez poziomego scroll; każda kategoria osiągalna, nic nie jest domyślnie odrzucane przez zmianę ekranu. U02: Android z klawiaturą, autoFocus, Oddaj i STOP. Refresh szkicu, koniec czasu i remis.
- Ryzyko/granice: Zmiana sposobu przeglądania nie zmienia progu głosowania ani 45 s; tę stałą rozstrzyga H-003.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 3 jednostek zakresu i 3 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-015"></a>

### P4-015. Kropki, Kąt, W pamięci: pole przy klawiaturze

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1 warunkowy: potencjalnie niedostępna akcja; brak potwierdzenia M na Androidzie.
- Problem i zachowanie po zmianie: Formularz nie kurczy się do nieużywalnego kafla; odpowiedź i Zatwierdź dostępne z otwartą klawiaturą.
- Dokładny zakres/właściciel: [F4-056](FINDINGS.md#f4-056) / `kropki`, [F4-056](FINDINGS.md#f4-056) / `kat`, [F4-056](FINDINGS.md#f4-056) / `w-pamieci`.
- Zatwierdzone warianty: [D4-056](DECISIONS.md#d4-056) → A.
- Pliki/obszary: apps/web/src/games/Szacowanie.tsx:140-155; WPamieci.tsx:126-151; index.html metadane tylko gdy pomiar uzasadni.
- Zmiana zasad: **nie: układ**. Dokumenty: DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: U02: przed wyborem technicznej poprawki wymagany pomiar telefonu.
- Kolejność/odbiór: T + UI. U02: prawdziwy Android, 360×640, zanotowane visualViewport/innerHeight i rect formularza po autoFocus, rotacji i zamknięciu klawiatury. Pełna runda, błąd/timeout, refresh i rewanż; desktop bez regresji.
- Ryzyko/granice: Problem jest hipotezą dla urządzenia; nie wdrażać konkretnego max/min rozmiaru wyłącznie z emulacji.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 3 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-016"></a>

### P4-016. Wyniki: dostępne Rewanż i Do lobby

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-001; „Zatweirdzam”). Priorytet: **P1**. P1 mimo średniej wagi: E10 potwierdza akcje ponad 1200 px od góry.
- Problem i zachowanie po zmianie: Wyniki mogą przewijać się w pionie; OverActions i NextActions korzystają ze StickyBar. Dalej Kalamburów/Państw-miast zachowuje dostępność.
- Dokładny zakres/właściciel: [F4-092](FINDINGS.md#f4-092) / całość.
- Decyzje zatwierdzone w granicach tej karty: [D4-057](DECISIONS.md#d4-057) → A.
- Pliki/obszary: apps/web/src/screens/Game.tsx:455-459,540-566; ui.tsx StickyBar; Kalambury/PanstwaMiasta tylko odbiór istniejących odsłon.
- Zmiana zasad: **nie; tak dla jawnego wyjątku wysokości wyników**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: B4-001 zaakceptowana; pozostałe warunki odbioru karty obowiązują, wykonania jeszcze nie rozpoczęto.
- Kolejność/odbiór: T + UI. E08/E10/E12 oraz U07: Koło 4/6 osób, solo z pełnym RecordPanel (rekord/awans), Turniej między grami i finał. Rewanż/Do lobby/Dalej w granicach okna, dolny wiersz nie pod paskiem; scroll całej treści działa.
- Ryzyko/granice: Nie ściskać wszystkich rysunków do 640 px i nie dublować akcji w dialogu Kampus Tour.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-017"></a>

### P4-017. Kampus Tour: środek i akcje po skalowaniu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: ucięcia potwierdzone M; dopisek o pucharach sam jest P2.
- Problem i zachowanie po zmianie: Stała nieucinana runda i akcje, log 1-2 wpisy; dialog i plansza nie dublują akcji; Zamknij/Podsumowanie/budowa i potwierdzenia mają 48 px na ekranie, nie tylko w scenie; wygrane i Oglądasz uzupełnione.
- Dokładny zakres/właściciel: [F4-058](FINDINGS.md#f4-058) / całość, [F4-135](FINDINGS.md#f4-135) / całość, [F4-130](FINDINGS.md#f4-130) / całość, [F4-093](FINDINGS.md#f4-093) / `kampus-tour`.
- Zatwierdzone warianty: [D4-058](DECISIONS.md#d4-058) → A; [D4-059](DECISIONS.md#d4-059) → A; [D4-060](DECISIONS.md#d4-060) → A; [D4-067](DECISIONS.md#d4-067) → A.
- Pliki/obszary: apps/web/src/games/KampusTour.tsx:650-765,848-973; KampusSummary.tsx; Game.tsx gałąź przekazująca scores/seated.
- Zmiana zasad: **nie dla gry; tak dla reguł UI wyjątków planszy**. Dokumenty: DESIGN §6; ZASADY §4.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Powtórzyć E13-E15 w 360×640 obróconym i 640×360: buy, roll z MPK, over i dialog. Runda, licznik, log oraz każdy przycisk dostępne, rzeczywisty rect min.48 px po zoom. Pick/build/sell/juwenalia, 2/4 osoby+obserwator, refresh i rewanż.
- Ryzyko/granice: Powiększenie przycisków nie może wrócić do overflow; najpierw pomiar budżetu wysokości. Nie zmieniać ekonomii.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 4 jednostek zakresu i 4 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-018"></a>

### P4-018. Kampus Tour: decyzja bez czekania na marsz

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: blokada akcji znana S i maksymalny czas W; nie pomiar długości partii ludzi.
- Problem i zachowanie po zmianie: Dotyk podczas marszu kończy animację do celu; akcja odpowiada stanowi serwera. Turlanie tylko po rzucie, przeskok kartą/MPK bez udawanego rzutu.
- Dokładny zakres/właściciel: [F4-057](FINDINGS.md#f4-057) / `kampus-tour`, [F4-131](FINDINGS.md#f4-131) / całość, [F4-132](FINDINGS.md#f4-132) / całość.
- Zatwierdzone warianty: [D4-051](DECISIONS.md#d4-051) → A; [D4-105](DECISIONS.md#d4-105) → A.
- Pliki/obszary: apps/web/src/games/KampusTour.tsx useWalk/useRolling i settled; kontrakt zdarzenia wyłącznie jeśli nie da się użyć istniejącego.
- Zmiana zasad: **nie dla zasad ruchu; tak dla opisu animacji**. Dokumenty: ZASADY §5; DESIGN §6.
- Zależności pakietowe: [P4-017](#p4-017). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. /dev: rzut 12, dublet i kolejny rzut, dotyk przed/dojście/po marszu, MPK, karta i Kolokwium, refresh w marszu oraz reduced motion. Jedno dotknięcie nie wykonuje przypadkowej innej decyzji; nowy stan przerywa stary pokaz, zegar nie jest zatrzymywany.
- Ryzyko/granice: Jeśli konieczna nowa informacja w widoku, opisać i sprawdzić playerView przed kodem; bez nowego zdarzenia bez akceptacji kontraktu.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 3 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-019"></a>

### P4-019. Chińczyk: ruch dostępny w animacji

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: wymuszona blokada pomniejsza czas na decyzję, zwłaszcza w 20 s.
- Problem i zachowanie po zmianie: Dotyk kończy pokaz i pozwala wybrać pionek według aktualnego widoku, także w Szybkim.
- Dokładny zakres/właściciel: [F4-057](FINDINGS.md#f4-057) / `chinczyk`.
- Zatwierdzone warianty: [D4-052](DECISIONS.md#d4-052) → A.
- Pliki/obszary: apps/web/src/games/Chinczyk.tsx useWalk/settled/myMove.
- Zmiana zasad: **nie dla zasad; tak dla opisu animacji**. Dokumenty: ZASADY §5.
- Zależności pakietowe: [P4-009](#p4-009). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Klasyczny/Szybki, 2/4 graczy: rzut 6, wejście do domku, zbicie, dodatkowy rzut, trzeci brak ruchu; dotyk w trakcie i nowy stan nie tworzą podwójnego ruchu. Refresh/reconnect i reduced motion bez zaległej kolejki.
- Ryzyko/granice: Wibracja zbicia raz na zdarzenie; nie zmieniać 20 s ani premii rzutu.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-020"></a>

### P4-020. Śledzenie: 360 s na pełną partię

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: zapas mały według modelu, ale nie wykazano utraty wyniku.
- Problem i zachowanie po zmianie: Limit 360 s przy zachowaniu 20 rund i dotychczasowej punktacji.
- Dokładny zakres/właściciel: [F4-002](FINDINGS.md#f4-002) / `sledzenie`.
- Zatwierdzone warianty: [D4-009](DECISIONS.md#d4-009) → A.
- Pliki/obszary: packages/games/src/sledzenie.ts i test; KONCEPT lista limitów.
- Zmiana zasad: **tak: limit**. Dokumenty: ZASADY-GIER §Śledzenie; KONCEPT §3.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test liczbowy 360; rachunek 20 rund plus odsłony i czas wskazywania, /dev samoistny timeout, solo/6 graczy i turniej.
- Ryzyko/granice: T=287 s zależy od modelu czasu decyzji; nie jest pomiarem człowieka.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-021"></a>

### P4-021. Który rok?: 270 s z zapasem sieciowym

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 mimo niskiej wagi: spójność nowej normy; wariant B pozostaje dopuszczalnym odstępstwem.
- Problem i zachowanie po zmianie: Limit platformy 270 s, klient nadal ma twarde 228 s maksymalnego przebiegu.
- Dokładny zakres/właściciel: [F4-002](FINDINGS.md#f4-002) / `rok`.
- Zatwierdzone warianty: [D4-011](DECISIONS.md#d4-011) → A.
- Pliki/obszary: packages/games/src/rok.ts i test.
- Zmiana zasad: **tak: limit**. Dokumenty: ZASADY-GIER §Który rok?; KONCEPT §3.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test 270, wyliczenie czasu rund, pełna partia z maksymalnym oczekiwaniem, timeout i rewanż; wyniki nie zmieniają jednostki ani zakresu roku.
- Ryzyko/granice: Nie rozszerzać historycznej bazy wydarzeń w pakiecie limitu.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-022"></a>

### P4-022. Jeden termin mini-gry niezależny od rywali

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: niska waga, wyliczona nierówność budżetu, bez nowego dowodu krytycznej utraty.
- Problem i zachowanie po zmianie: Wynik rywala ani koniec prób Koła nie odnawia limitu pozostałym; Intro nadal kończy się po ostatnim Start lub 15 s.
- Dokładny zakres/właściciel: [F4-162](FINDINGS.md#f4-162) / całość.
- Zatwierdzone warianty: [D4-012](DECISIONS.md#d4-012) → A.
- Pliki/obszary: apps/server/src/LobbyRoom.ts:375-376 i testy pokoju; turn/key mini-gier tylko zgodnie z wybraną wspólną implementacją.
- Zmiana zasad: **tak: zachowanie limitu platformy**. Dokumenty: KONCEPT §3; ZASADY §3.
- Zależności pakietowe: [P4-003](#p4-003), [P4-004](#p4-004), [P4-020](#p4-020), [P4-021](#p4-021). Dodatkowy warunek: G-LIMITY rozstrzygnięte w ZG4-v1 §3.3 dla 30 mini-gier, z nazwanymi wyjątkami Środka/Tortu/Roku. Test jednego terminu po poprzedzających poprawkach.
- Kolejność/odbiór: T + UI. Kontrolowany zegar: solo/2/6 osób, pierwszy i ostatni Start, progress, wynik pierwszego i ostatniego gracza oraz kolejne próby Koła. Termin pozostałych identyczny przed/po ruchu rywala, jeden timeout na gracza. Wyjście, rewanż i turniej nie dziedziczą terminu poprzedniej partii.
- Ryzyko/granice: Nie wdrażać najpierw usunięcia odnowień przy nadal kwestionowanych limitach.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-023"></a>

### P4-023. Quizy: walidacja i wierne czasy trafień

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P1**. P1: odrzucanie/gubienie trafień i zmiana wyniku, choć audyt ma wagę średnią.
- Problem i zachowanie po zmianie: Serwer odrzuca nierealne dane; ekran zachowuje każde prawidłowe trafienie i rzeczywisty czas, bez ścięcia do 5 s.
- Dokładny zakres/właściciel: [F4-014](FINDINGS.md#f4-014) / całość, [F4-015](FINDINGS.md#f4-015) / całość.
- Zatwierdzone warianty: [D4-087](DECISIONS.md#d4-087) → A.
- Pliki/obszary: packages/games/src/quiz.ts, quizowe testy; apps/web/src/games/Quiz.tsx; korzystające stroop/liczenie/inny/obrot/literowka/dziesiatki.
- Zmiana zasad: **tak: walidacja i wynik klienta**. Dokumenty: ZASADY-GIER §quizy.
- Zależności pakietowe: brak. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Najpierw dowód i testy granic wynikających z 30 s i blokady 1 s; odrzucić ułamki/nieosiągalne pomyłki, przyjąć dozwolone <150 ms i >5 s. Wynik, tie i liczba trafień zgodne w pokoju/rekordzie/turnieju; zła odpowiedź nadal blokuje 1 s.
- Ryzyko/granice: Nie projektować progów pod obecne błędy UI ani dodawać arbitralnego antycheatu.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 2 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-024"></a>

### P4-024. Jeden komparator średniego czasu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: spójność kryterium, nie potwierdzona częsta strata wyniku.
- Problem i zachowanie po zmianie: Średnia zaokrąglona do ms wspólnie w miejscach i record.tie. Przy równym score znane tie przed null; dwa null równe, null nigdy zero. Ten sam porządek w SQL, core i UI; stare tie bez przeliczania, ZG4-v1 §3.2.
- Dokładny zakres/właściciel: [F4-013](FINDINGS.md#f4-013) / całość.
- Zatwierdzone warianty: [D4-086](DECISIONS.md#d4-086) → A.
- Pliki/obszary: packages/games/src/core.ts, quiz.ts, stoj.ts i testy; stats.test.ts dla tego samego porządku.
- Zmiana zasad: **tak: dokładność remisów**. Dokumenty: ZASADY-GIER §Stój!/quizy; KONCEPT §2.4.
- Zależności pakietowe: brak. Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Dwa wyniki różniące się tylko ułamkiem ms po zaokrągleniu remisują wszędzie; dokładnie równy wynik bez zwycięzcy. Stary tie/null pozostaje zgodnie z zatwierdzoną polityką danych, a nie traktowany jak zero.
- Ryzyko/granice: Zmiana dokładności miejsc może zmienić punkty turnieju; UI zaokrąglenia nie mogą ukryć innego komparatora.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-025"></a>

### P4-025. Jawny remis i kolejność dalszych miejsc

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: obecna F4-018 dotyczy dalszych miejsc, a nie nieuczciwej wygranej.
- Problem i zachowanie po zmianie: Gomoku zwraca ranking bez zwycięzcy. Dla Szybkiego Chińczyka proponowane opcjonalne GameResult.places podaje równe dalsze miejsca według liczby pionków w domu i sumy pozycji, ranking zachowuje stabilny porządek. Turniej wyświetla wspólne miejsce z identycznej pary total/wins bez zmiany punktów.
- Dokładny zakres/właściciel: [F4-018](FINDINGS.md#f4-018) / całość, [F4-036](FINDINGS.md#f4-036) / całość.
- Zatwierdzone warianty: [D4-091](DECISIONS.md#d4-091) → A.
- Pliki/obszary: packages/games/src/{core,piec-w-rzedzie,chinczyk,turniej}.ts i testy; Game.tsx numeracja miejsc.
- Zmiana zasad: **tak: kontrakt rankingu/dalszych miejsc, bez zmiany historycznych wygranych**. Dokumenty: ZASADY-GIER §Gomoku/Chińczyk/Turniej; KONCEPT §2.6.
- Zależności pakietowe: brak. Dodatkowy warunek: G-KONTRAKT: przed kodem test JSON opcjonalnego GameResult.places i zgodności wyniku bez tego pola; proponowany kształt jest częścią tej karty, nie osobną prośbą o zgodę.
- Kolejność/odbiór: T + UI. Testy remisu Gomoku oraz identycznych dalszych miejsc w Szybkim i Turnieju, w tym dogrywka. Zwycięzca i punkty nie zmieniają się przypadkowo przez samą numerację UI.
- Ryzyko/granice: GameResult.places jest opcjonalne: brak pola zachowuje dotychczasowy odczyt innych gier. Nie zmieniać GameDefinition.places mini-gier ani historycznych punktów przez nową numerację.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 2 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-026"></a>

### P4-026. Kampus Tour: karta, wykup i rzeczywisty czynsz

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: przepływ karty i nieopisane reguły, balans ludzi nadal niezmierzony.
- Problem i zachowanie po zmianie: Karta bankruta wraca do talii; Juwenalia i wysokie budynki pozostają po wykupie/utracie kompletu; statystyka pokazuje faktycznie wypłacony czynsz.
- Dokładny zakres/właściciel: [F4-022](FINDINGS.md#f4-022) / całość, [F4-023](FINDINGS.md#f4-023) / całość, [F4-030](FINDINGS.md#f4-030) / całość, [F4-031](FINDINGS.md#f4-031) / całość.
- Zatwierdzone warianty: [D4-036](DECISIONS.md#d4-036) → A; [D4-037](DECISIONS.md#d4-037) → A; [D4-092](DECISIONS.md#d4-092) → A; [D4-093](DECISIONS.md#d4-093) → A.
- Pliki/obszary: packages/games/src/kampus-tour.ts i kampus-tour.test.ts.
- Zmiana zasad: **tak dla obiegu karty; doprecyzowanie pozostałych reguł; statystyka bez zmiany wypłaty**. Dokumenty: ZASADY-GIER §Kampus Tour/Karty/Wykupienie/Budowa/stats.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test bankructwa z Zaliczeniem i dobierania po pełnym obiegu; Juwenalia zostają po wykupie, znikają po banku; poziomy 3/4 zostają bez kompletu, dalsza budowa nadal wymaga warunku. Statystyka równa faktycznej wypłacie przy długu i kilku wierzycielach. /dev2/4 osoby i obserwator w tych fazach.
- Ryzyko/granice: Nie obniżać premii startowej, kosztować MPK ani zmieniać monopolu; H-019..021 odrębne.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 4 jednostek zakresu i 4 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-027"></a>

### P4-027. Kalambury: podpowiedź tylko po limicie

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: nieopisane uprawnienie rysującego, brak dowodu szkody P1.
- Problem i zachowanie po zmianie: Hint Kalamburów wyłącznie od timeoutu. Opcjonalny czwarty argument validateMove to zaufany {source: client lub timeout}, domyślnie client, przekazywany z miejsca wywołania serwera, nigdy z JSON klienta. Ten sam kontrakt obejmuje timeout Schulte/Sudoku z P4-002, zgodnie z ZG4-v1 §3.1.
- Dokładny zakres/właściciel: [F4-039](FINDINGS.md#f4-039) / całość.
- Zatwierdzone warianty: [D4-094](DECISIONS.md#d4-094) → B.
- Pliki/obszary: packages/games/src/core.ts typ kontekstu, kalambury.ts/testy, index.test.ts zgodność wywołań; apps/server/src/LobbyRoom.ts ścieżka klient/timeout i test.
- Zmiana zasad: **tak: ograniczenie dozwolonego ruchu**. Dokumenty: ZASADY-GIER §Kalambury; KONCEPT §3 podpis validateMove.
- Zależności pakietowe: brak. Dodatkowy warunek: G-KONTRAKT: test fałszywego source w payloadzie oraz istniejących gier wołających validateMove trzema argumentami; to kontrola podanego kontraktu, nie dodatkowy wybór użytkownika.
- Kolejność/odbiór: T + UI. Najpierw test wcześniejszego hint od rysującego i obcego, poprawnego timeoutu, zmiany half dokładnie raz oraz klucza turn. Serwerowy timeout nie może zostać odrzucony po usunięciu ścieżki klienta. /dev2/6 osób, refresh w obu połowach.
- Ryzyko/granice: Ukrycie przycisku nie jest walidacją. Wspólna walidacja timeoutów musi zachować validateMove jako strażnika.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-028"></a>

### P4-028. Labirynt: losowy legalny krok po czasie

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: usuwa optymalnego bota za nieaktywnego gracza; oddzielne od badania przewagi miejsc.
- Problem i zachowanie po zmianie: Po czasie rng wybiera legalny krok, nie zawsze najkrótszą drogę; pass wyłącznie bez kroku. Zakres F1:O04, bez nowego błędu F4.
- Dokładny zakres/właściciel: .
- Zatwierdzone warianty: [D4-042](DECISIONS.md#d4-042) → A.
- Pliki/obszary: packages/games/src/labirynt.ts, labirynt.test.ts.
- Zmiana zasad: **tak: timeout wprowadza losowość**. Dokumenty: ZASADY-GIER §Labirynt; KONCEPT opis gry jeśli mówi brak losowości.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test legalności i deterministyczności rng, kilka seedów, brak losowego zużycia ścian; pass gdy brak kroków. /dev2/4 osoby, timeout i skos/skok, rewanż.
- Ryzyko/granice: Zmienia świadome odstępstwo; nie traktować go jako zgody już udzielonej przez opis audytu.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 0 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-029"></a>

### P4-029. Testy: Kampus Tour

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 niezależnie od niskich wag pojedynczych testów: obowiązkowe pokrycie.
- Problem i zachowanie po zmianie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Dokładny zakres/właściciel: [F4-004](FINDINGS.md#f4-004) / `kampus-tour`, [F4-007](FINDINGS.md#f4-007) / `kampus-tour`, [F4-008](FINDINGS.md#f4-008) / `kampus-tour`, [F4-010](FINDINGS.md#f4-010) / `kampus-tour`, [F4-012](FINDINGS.md#f4-012) / `kampus-tour`, [F4-027](FINDINGS.md#f4-027) / całość, [F4-028](FINDINGS.md#f4-028) / całość, [F4-029](FINDINGS.md#f4-029) / całość, [F4-032](FINDINGS.md#f4-032) / całość, [F4-033](FINDINGS.md#f4-033) / całość, [F4-034](FINDINGS.md#f4-034) / całość.
- Zatwierdzone warianty: [D4-089](DECISIONS.md#d4-089) → A.
- Pliki/obszary: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zmiana zasad: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Ryzyko/granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 11 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-030"></a>

### P4-030. Testy: gry główne i Turniej

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 niezależnie od niskich wag pojedynczych testów: obowiązkowe pokrycie.
- Problem i zachowanie po zmianie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Dokładny zakres/właściciel: [F4-004](FINDINGS.md#f4-004) / `piec-w-rzedzie`, [F4-004](FINDINGS.md#f4-004) / `statki`, [F4-004](FINDINGS.md#f4-004) / `chinczyk`, [F4-004](FINDINGS.md#f4-004) / `panstwa-miasta`, [F4-004](FINDINGS.md#f4-004) / `turniej`, [F4-005](FINDINGS.md#f4-005) / `statki`, [F4-005](FINDINGS.md#f4-005) / `panstwa-miasta`, [F4-006](FINDINGS.md#f4-006) / `panstwa-miasta`, [F4-007](FINDINGS.md#f4-007) / `panstwa-miasta`, [F4-008](FINDINGS.md#f4-008) / `piec-w-rzedzie`, [F4-008](FINDINGS.md#f4-008) / `statki`, [F4-008](FINDINGS.md#f4-008) / `chinczyk`, [F4-008](FINDINGS.md#f4-008) / `panstwa-miasta`, [F4-009](FINDINGS.md#f4-009) / `panstwa-miasta`, [F4-010](FINDINGS.md#f4-010) / `panstwa-miasta`, [F4-011](FINDINGS.md#f4-011) / `panstwa-miasta`, [F4-011](FINDINGS.md#f4-011) / `kalambury`, [F4-012](FINDINGS.md#f4-012) / `statki`, [F4-037](FINDINGS.md#f4-037) / całość, [F4-038](FINDINGS.md#f4-038) / całość, [F4-040](FINDINGS.md#f4-040) / całość, [F4-041](FINDINGS.md#f4-041) / całość, [F4-042](FINDINGS.md#f4-042) / całość, [F4-054](FINDINGS.md#f4-054) / całość.
- Zatwierdzone warianty: [D4-089](DECISIONS.md#d4-089) → A.
- Pliki/obszary: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zmiana zasad: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Ryzyko/granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 24 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-031"></a>

### P4-031. Testy: quizy i Stój!

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 niezależnie od niskich wag pojedynczych testów: obowiązkowe pokrycie.
- Problem i zachowanie po zmianie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Dokładny zakres/właściciel: [F4-004](FINDINGS.md#f4-004) / `stroop`, [F4-004](FINDINGS.md#f4-004) / `liczenie`, [F4-005](FINDINGS.md#f4-005) / `stroop`, [F4-005](FINDINGS.md#f4-005) / `liczenie`, [F4-006](FINDINGS.md#f4-006) / `stroop`, [F4-006](FINDINGS.md#f4-006) / `liczenie`, [F4-007](FINDINGS.md#f4-007) / `stroop`, [F4-007](FINDINGS.md#f4-007) / `liczenie`, [F4-007](FINDINGS.md#f4-007) / `inny`, [F4-007](FINDINGS.md#f4-007) / `obrot`, [F4-007](FINDINGS.md#f4-007) / `literowka`, [F4-007](FINDINGS.md#f4-007) / `dziesiatki`, [F4-008](FINDINGS.md#f4-008) / `stroop`, [F4-008](FINDINGS.md#f4-008) / `liczenie`, [F4-009](FINDINGS.md#f4-009) / `stroop`, [F4-009](FINDINGS.md#f4-009) / `liczenie`, [F4-010](FINDINGS.md#f4-010) / `stroop`, [F4-010](FINDINGS.md#f4-010) / `liczenie`, [F4-046](FINDINGS.md#f4-046) / całość, [F4-049](FINDINGS.md#f4-049) / całość.
- Zatwierdzone warianty: [D4-089](DECISIONS.md#d4-089) → A.
- Pliki/obszary: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zmiana zasad: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Ryzyko/granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 20 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-032"></a>

### P4-032. Testy: pozostałe mini-gry

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 niezależnie od niskich wag pojedynczych testów: obowiązkowe pokrycie.
- Problem i zachowanie po zmianie: Uzupełnić wyłącznie nazwane luki istniejących zasad; nie zmieniać produkcyjnej logiki ani rozszerzać zakresu o całą checklistę bez powodu.
- Dokładny zakres/właściciel: [F4-004](FINDINGS.md#f4-004) / `refleks`, [F4-004](FINDINGS.md#f4-004) / `simon`, [F4-004](FINDINGS.md#f4-004) / `stoper`, [F4-004](FINDINGS.md#f4-004) / `schulte`, [F4-004](FINDINGS.md#f4-004) / `kolo`, [F4-004](FINDINGS.md#f4-004) / `kolor`, [F4-004](FINDINGS.md#f4-004) / `kropki`, [F4-005](FINDINGS.md#f4-005) / `simon`, [F4-005](FINDINGS.md#f4-005) / `stoper`, [F4-005](FINDINGS.md#f4-005) / `schulte`, [F4-005](FINDINGS.md#f4-005) / `kolo`, [F4-005](FINDINGS.md#f4-005) / `kolor`, [F4-005](FINDINGS.md#f4-005) / `kropki`, [F4-006](FINDINGS.md#f4-006) / `refleks`, [F4-006](FINDINGS.md#f4-006) / `simon`, [F4-006](FINDINGS.md#f4-006) / `stoper`, [F4-006](FINDINGS.md#f4-006) / `schulte`, [F4-006](FINDINGS.md#f4-006) / `kolo`, [F4-006](FINDINGS.md#f4-006) / `kolor`, [F4-006](FINDINGS.md#f4-006) / `kropki`, [F4-006](FINDINGS.md#f4-006) / `srodek`, [F4-007](FINDINGS.md#f4-007) / `simon`, [F4-007](FINDINGS.md#f4-007) / `kolo`, [F4-007](FINDINGS.md#f4-007) / `kolor`, [F4-007](FINDINGS.md#f4-007) / `kropki`, [F4-008](FINDINGS.md#f4-008) / `refleks`, [F4-008](FINDINGS.md#f4-008) / `simon`, [F4-008](FINDINGS.md#f4-008) / `stoper`, [F4-008](FINDINGS.md#f4-008) / `schulte`, [F4-008](FINDINGS.md#f4-008) / `kolo`, [F4-008](FINDINGS.md#f4-008) / `kolor`, [F4-009](FINDINGS.md#f4-009) / `refleks`, [F4-009](FINDINGS.md#f4-009) / `simon`, [F4-009](FINDINGS.md#f4-009) / `stoper`, [F4-009](FINDINGS.md#f4-009) / `schulte`, [F4-009](FINDINGS.md#f4-009) / `kolo`, [F4-009](FINDINGS.md#f4-009) / `kolor`, [F4-009](FINDINGS.md#f4-009) / `kropki`, [F4-009](FINDINGS.md#f4-009) / `rok`, [F4-009](FINDINGS.md#f4-009) / `srodek`, [F4-009](FINDINGS.md#f4-009) / `tort`, [F4-009](FINDINGS.md#f4-009) / `nozyczki`, [F4-010](FINDINGS.md#f4-010) / `simon`, [F4-010](FINDINGS.md#f4-010) / `stoper`, [F4-010](FINDINGS.md#f4-010) / `schulte`, [F4-010](FINDINGS.md#f4-010) / `kolo`, [F4-010](FINDINGS.md#f4-010) / `kolor`, [F4-010](FINDINGS.md#f4-010) / `kropki`, [F4-045](FINDINGS.md#f4-045) / całość, [F4-047](FINDINGS.md#f4-047) / całość, [F4-050](FINDINGS.md#f4-050) / całość, [F4-053](FINDINGS.md#f4-053) / całość.
- Zatwierdzone warianty: [D4-089](DECISIONS.md#d4-089) → A.
- Pliki/obszary: packages/games/src/*.test.ts dla gier wypisanych w jednostkach zakresu; index.test.ts tylko wspólne przypadki definicji.
- Zmiana zasad: **nie**. Dokumenty: Brak nowych zasad; komentarz testu zgodny z ZASADY-GIER.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda luka ma nazwany test i powiązanie z atomem F4; stan osiągnięty ruchami. Definicje, seed, obcy/po końcu/brzegi, JSON/mutacja i obserwator tylko tam, gdzie wskazał audyt. Pełne pnpm typecheck/test po grupie.
- Ryzyko/granice: Nie utrwalać nowej stałej przed decyzją o jej zmianie: test zmienianej zasady jest częścią właściwego pakietu i powstaje tam przed kodem.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 52 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-033"></a>

### P4-033. Rekordowa partia ze stanu, także me=""

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Stoper/Rytm nie czytają lokalnego kafla po końcu; test soloState obejmuje mapy napełnione prawdziwą partią.
- Dokładny zakres/właściciel: [F4-016](FINDINGS.md#f4-016) / całość, [F4-021](FINDINGS.md#f4-021) / całość.
- Zatwierdzone warianty: [D4-088](DECISIONS.md#d4-088) → A.
- Pliki/obszary: apps/web/src/games/Stoper.tsx,Rytm.tsx; packages/games/src/index.test.ts i odpowiednie testy soloState.
- Zmiana zasad: **nie: odczyt i test istniejącego kontraktu**. Dokumenty: ZASADY §3/§6 tylko doprecyzowanie testu jeśli potrzebne.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Legalne wyniki wszystkich 8 gier F4-021, soloState→JSON→me="" pokazują ten sam wynik, odchyłkę i tabelę. Otworzyć istniejący stary detail i brak detail, a Stoper/Rytm porównać po refresh.
- Ryzyko/granice: Brak dawnych danych lokalnych wymaga fallbacku, nie domyślnego fałszywego wyniku.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 2 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-034"></a>

### P4-034. Jedna lista mini-gier i klucz rewanżu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Rejestr daje listę mini-gier; Sudoku ma nonce z fallbackiem starej planszy; prefiksy stałych i wspólny dolny pasek Turnieju.
- Dokładny zakres/właściciel: [F4-017](FINDINGS.md#f4-017) / całość, [F4-048](FINDINGS.md#f4-048) / całość, [F4-051](FINDINGS.md#f4-051) / całość, [F4-156](FINDINGS.md#f4-156) / całość.
- Zatwierdzone warianty: [D4-090](DECISIONS.md#d4-090) → A.
- Pliki/obszary: index.ts i test; Game.tsx,Lobby.tsx,MiniGame.tsx,Setup.tsx; sudoku.ts/test; eksporty stałych.
- Zmiana zasad: **nie**. Dokumenty: KONCEPT §3 struktura; ZASADY §6 odsyłacze.
- Zależności pakietowe: [P4-016](#p4-016). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Porównać zestawy 30 id przed/po, rewanż identycznej planszy Sudoku montuje nową partię, stary detail bez nonce działa. Turniej preset/min/max i przyklejony Start nie zmienia gotowości.
- Ryzyko/granice: Nie dodawać nowej gry ani zależności; zmiana nazw eksportów nie zmienia id.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 4 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-035"></a>

### P4-035. Wspólne funkcje bez zmiany reguł

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: porządki bez zachowania widocznego dla gracza.
- Problem i zachowanie po zmianie: Tasowanie Kampus Tour z core, nazwa swapsFor w Kubkach; dla trzech kopii rund wybrać zachowanie jawnego odstępstwa zamiast automatycznej ekstrakcji, Koło z opisanym powodem końca.
- Dokładny zakres/właściciel: [F4-019](FINDINGS.md#f4-019) / całość.
- Zatwierdzone warianty: [D4-090](DECISIONS.md#d4-090) → A dla tasowania/nazwy; B dla kopii rund i końca Koła.
- Pliki/obszary: kampus-tour.ts,kubki.ts; ZASADY-GIER §1/§Koło; bez nowego frameworka rund.
- Zmiana zasad: **nie**. Dokumenty: ZASADY-GIER §1 i §Koło.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Dla ustalonych seedów te same talie/zamiany i wyniki przed/po; kontrakt Koła kończy się po próbach wszystkich; dokument wskazuje, dlaczego pozostają kopie szacowania.
- Ryzyko/granice: D4-090:A nie jest zgodą na opcjonalną nową warstwę abstrakcji; to podwybór zachowania obecnych kopii wymagający jawnego zapisu w 04-04.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-036"></a>

### P4-036. Gęste plansze: wybór z potwierdzeniem

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, B4-002; użytkownik „Tak”). Priorytet: **P2**. P2: uzgodnienie standardu przed korektami plansz.
- Problem i zachowanie po zmianie: Wyjątek <48 px tylko dla pola z podglądem i osobnym potwierdzeniem 48 px. Gomoku/Statki/Chińczyk zachowują takie potwierdzenie; Labirynt wymaga dodania jawnego potwierdzenia lub osobnej decyzji o odmiennej obsłudze.
- Dokładny zakres/właściciel: [F4-093](FINDINGS.md#f4-093) / `geste-plansze`.
- Decyzje zatwierdzone w granicach tej karty: [D4-059](DECISIONS.md#d4-059) → A.
- Pliki/obszary: PiecWRzedzie.tsx,Statki.tsx,Chinczyk.tsx,Labirynt.tsx; ZASADY §4/DESIGN §6.
- Zmiana zasad: **tak: reguła UI i ewentualne potwierdzenie Labiryntu; nie zasady ruchu**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: B4-002 zatwierdza D4-059:A dla czterech gier, także dodanie osobnego potwierdzenia w Labiryncie. Odbiór nadal wymagany; wykonania nie rozpoczęto.
- Kolejność/odbiór: T + UI. Dotknięcie wskazuje dokładnie jedno pole/pionek, tekst/znak pokazuje wybór, dopiero potwierdzenie wysyła ruch. 360×640, minimalny wariant i obserwator; przycisk zmierzony po transformacji. Każdy wyjątek ma nazwę gry i powód.
- Ryzyko/granice: Labirynt obecnie wykonuje krok bez potwierdzenia; nie wolno uznać go za już objęty wyjątkiem.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-037"></a>

### P4-037. Zwykłe kontrolki 48 px

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Suwak Odcienia/Roku ma pole 48 px; wyjście, próbki koloru i wiersze gracza w Lobby/Setup również.
- Dokładny zakres/właściciel: [F4-093](FINDINGS.md#f4-093) / `kontrolki-platformy`.
- Zatwierdzone warianty: [D4-060](DECISIONS.md#d4-060) → A.
- Pliki/obszary: index.css .swatch-range; Lobby.tsx:158,392,435; Kolor.tsx/Rok.tsx odbiór.
- Zmiana zasad: **nie: rozmiar kontrolek**. Dokumenty: DESIGN §6 aktualizacja faktów.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Zmierzyć rect/hitbox 48×48 przy 360 px, 6 kolorów bez poziomego scroll, suwak dotykany przy krawędzi i klawiaturą; układ w Setup i Lobby z 6 osobami.
- Ryzyko/granice: Nie zwiększać samego uchwytu kosztem nakładania, aktywny obszar musi być realny.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-038"></a>

### P4-038. Tort: uchwyt cięcia pod palcem

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Łapanie cięcia w odległości 24 px od palca, niezależnie od kąta i odległości od środka; dotknięcie nie przesuwa innego cięcia.
- Dokładny zakres/właściciel: [F4-093](FINDINGS.md#f4-093) / `tort`.
- Zatwierdzone warianty: [D4-060](DECISIONS.md#d4-060) → A.
- Pliki/obszary: apps/web/src/games/Tort.tsx:19,86.
- Zmiana zasad: **nie: punktacja/zasady podziału zostają**. Dokumenty: ZASADY-GIER §Tort ekran jeżeli opisuje wybór uchwytu.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Wszystkie 3-7 części, cięcia blisko siebie i centrum: wybór najbliższego z widocznym podglądem, możliwość korekty, Pokrój aktywne po komplecie. Dotyk na prawdziwym telefonie i 360×640.
- Ryzyko/granice: Przy remisie odległości zachowanie musi być deterministyczne i opisane; nie liczyć stopni jako pikseli.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-039"></a>

### P4-039. Śledzenie: rozdzielne cele dotyku

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: dokładny wariant wymaga decyzji, nie potwierdzony P1.
- Problem i zachowanie po zmianie: Po zatrzymaniu plansza jest podglądem z numerami nadanymi według końcowej pozycji, niezależnie od roli/indeksu celu. Osiem osobnych przycisków 48×48 px wybiera kulki. Brak numerów w show/move; trzeci wybór kończy wskazanie jak obecnie. Bez zmiany GAP=0,14, prędkości, generatora i punktacji.
- Dokładny zakres/właściciel: [F4-093](FINDINGS.md#f4-093) / `sledzenie`.
- Zatwierdzone warianty: [D4-060](DECISIONS.md#d4-060) → A.
- Pliki/obszary: apps/web/src/games/Sledzenie.tsx: panel, oznaczenia, mapowanie według pozycji i obsługa wyboru; testy zgodności panelu. Zasady generatora sledzenie.ts bez zmian.
- Zmiana zasad: nie w losowaniu/punktacji; tak w opisanym sposobie wyboru. Dokumenty: ZASADY-GIER §Śledzenie (numeracja dopiero po ruchu), ZASADY §4 dla panelu 48 px.
- Zależności pakietowe: brak. Dodatkowy warunek: konkretny wariant panelu zatwierdzony w ZG4-v1 §3.4, G-DANE według §3.2. U12/U13 do odbioru; brak zgody na zmianę GAP.
- Kolejność/odbiór: T + UI; panel 48 px, bliskie/skrajne pozycje, 8 kulek/3 cele, numeracja bez informacji o celu, bez oznaczeń w show/move, dotyk i klawiatura. Plansza/panel/instrukcja w 360×640, stary detail i wynik bez zmian; U12/U13.
- Ryzyko/granice: Numerów nie wyprowadzać z indeksu celu. Kulki nie są obszarem wykonywania wyboru; bez nakładających się hitboxów. Nie przesuwać pozycji kulek dla etykiet i nie zmieniać generatora.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-040"></a>

### P4-040. Reduced motion: zadanie działa, komunikat widoczny

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Ruch będący zadaniem zostaje w Kubkach/Śledzeniu/Wieży/Zasłonie; dekoracje znikają, Preview i werdykt są czytelne w klatce bazowej.
- Dokładny zakres/właściciel: [F4-064](FINDINGS.md#f4-064) / całość, [F4-065](FINDINGS.md#f4-065) / całość, [F4-116](FINDINGS.md#f4-116) / całość, [F4-107](FINDINGS.md#f4-107) / `ruch-zadanie`.
- Zatwierdzone warianty: [D4-053](DECISIONS.md#d4-053) → A; [D4-054](DECISIONS.md#d4-054) → A.
- Pliki/obszary: index.css reduced motion/float-up; ui.tsx i Preview gier; Kubki/Sledzenie/Wieza/Zaslona komentarze i sterowanie.
- Zmiana zasad: **tak: jawny wyjątek reguły animacji, bez zmiany tempa zadania**. Dokumenty: ZASADY §5; ZASADY-GIER cztery gry.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. prefers-reduced-motion przed otwarciem: Preview ma treść, +wynik/werdykt widoczny bez przesunięcia, zadanie ma identyczny czas i trajektorie. U13/U14 odbiór realnego telefonu; wynik nie zależy od końcowej opacity.
- Ryzyko/granice: Nie obejmować wyjątkiem każdego requestAnimationFrame; odrębne ozdobne kroki pionka skaczą do celu.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 4 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-041"></a>

### P4-041. Katalog i opisy animacji

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Udokumentować istniejące keyframes i ich role, w tym set-glow 0,9 s ×4; komentarze zgodne z rzeczywistym użyciem. Bez przenoszenia logiki gry do animacji.
- Dokładny zakres/właściciel: [F4-106](FINDINGS.md#f4-106) / całość, [F4-109](FINDINGS.md#f4-109) / całość, [F4-107](FINDINGS.md#f4-107) / `set-glow`.
- Zatwierdzone warianty: [D4-073](DECISIONS.md#d4-073) → A; [D4-074](DECISIONS.md#d4-074) → A.
- Pliki/obszary: ZASADY §5; index.css komentarze i katalog.
- Zmiana zasad: **tak dla norm UI, bez zmiany logiki**. Dokumenty: ZASADY §5.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T/D (T obowiązkowa przy zmianie kodu lub testów). Każda używana nazwa ma definicję i rolę; katalog nie myli card-in/stone-pop/showtime, nazwy i czasy zgodne z tabelą. Brak zmiany przebiegu partii.
- Ryzyko/granice: Dodanie nazwy nie zatwierdza użycia przy dowolnym zdarzeniu.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 3 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-042"></a>

### P4-042. Przejścia, pętle i paski czasu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Wybór ring-pulse 1,2 s; czekanie spokojne; zwykłe przejścia 180/100 ms; paski z zegara i linear krokiem odświeżenia. W pamięci show 180 ms i Szybki Chińczyk 110/400 jako opisane wyjątki.
- Dokładny zakres/właściciel: [F4-075](FINDINGS.md#f4-075) / całość, [F4-076](FINDINGS.md#f4-076) / całość, [F4-077](FINDINGS.md#f4-077) / całość, [F4-086](FINDINGS.md#f4-086) / całość, [F4-104](FINDINGS.md#f4-104) / całość, [F4-105](FINDINGS.md#f4-105) / całość, [F4-108](FINDINGS.md#f4-108) / całość, [F4-107](FINDINGS.md#f4-107) / `paski`.
- Zatwierdzone warianty: [D4-074](DECISIONS.md#d4-074) → A; [D4-075](DECISIONS.md#d4-075) → A; [D4-076](DECISIONS.md#d4-076) → A; [D4-077](DECISIONS.md#d4-077) → A.
- Pliki/obszary: index.css; ui.tsx; Game.tsx paski; Memory/Chinczyk/Quiz/Rytm/Zakupy i inne dokładne użycia z F4.
- Zmiana zasad: **tak dla norm UI, nie dla stałych gry**. Dokumenty: ZASADY §5 tabela.
- Zależności pakietowe: [P4-041](#p4-041), [P4-040](#p4-040). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Porównać wszystkie wystąpienia F4: ring-pulse 1,2 s, bez Tailwind pulse/ping; pojawienie standardowe 350, pływająca liczba 1,6. Rytm/Zakupy pasek aktualizuje się przy reduced motion i po powrocie do karty, nie zdradza ukrytego zegara.
- Ryzyko/granice: Nie wydłużać pokazów i odsłon wraz z animacją; globalny CSS nie może zmienić bodźca na refleks.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 8 jednostek zakresu i 4 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-043"></a>

### P4-043. Błąd, ignorowany ruch i nowa decyzja

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Zignorowanie bez kary ma shake i powód, bez wibracji; realny błąd 60; szkoda od rywala[60,40,60]; nowa decyzja 40 bez sygnału technicznej połowy Kalamburów; metronom 30 jako bodziec.
- Dokładny zakres/właściciel: [F4-079](FINDINGS.md#f4-079) / całość, [F4-080](FINDINGS.md#f4-080) / całość, [F4-081](FINDINGS.md#f4-081) / całość, [F4-084](FINDINGS.md#f4-084) / całość, [F4-147](FINDINGS.md#f4-147) / całość.
- Zatwierdzone warianty: [D4-079](DECISIONS.md#d4-079) → A; [D4-080](DECISIONS.md#d4-080) → A; [D4-081](DECISIONS.md#d4-081) → A; [D4-083](DECISIONS.md#d4-083) → A; [D4-084](DECISIONS.md#d4-084) → A.
- Pliki/obszary: Game.tsx efekt tury; odpowiednie gry z F4; index.css shake; Rytm.tsx.
- Zmiana zasad: **tak dla reguł informacji zwrotnej, nie punktacji**. Dokumenty: ZASADY §5; ZASADY-GIER wskazane wyjątki.
- Zależności pakietowe: [P4-041](#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Sprawdzić zdarzenia w każdej wskazanej grze: raz na zdarzenie, brak wibracji przy poprawnym trafieniu i legalnym pudle. Reconnect nie powtarza szkody; half Kalamburów nie zdradza fazy. U14 na urządzeniu, poza nim można przechwycić wywołania vibrate, ale nie potwierdzać odczucia.
- Ryzyko/granice: Nie zmieniać kary ani przyjmowania ruchu przez dodanie efektu.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 5 jednostek zakresu i 5 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-044"></a>

### P4-044. Odsłona wyniku i prawdy

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Wynik i znak prawdy bez animacji; znacznik neutralny, odpowiedź w kolorze gracza; litera Kalamburów również od razu.
- Dokładny zakres/właściciel: [F4-078](FINDINGS.md#f4-078) / całość, [F4-126](FINDINGS.md#f4-126) / całość, [F4-140](FINDINGS.md#f4-140) / całość.
- Zatwierdzone warianty: [D4-078](DECISIONS.md#d4-078) → A; [D4-106](DECISIONS.md#d4-106) → B.
- Pliki/obszary: Mapa/Kolor/Szacowanie/Tort/Nozyczki i gry F4-078/126; Kalambury.tsx.
- Zmiana zasad: **tak dla wyjątku UI, nie dla wyniku**. Dokumenty: ZASADY §4/§5.
- Zależności pakietowe: [P4-041](#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Pełna odsłona przez czas z zasad, widoczny kierunek błędu i moja odpowiedź, reduced motion bez różnicy danych. Kalambury odsłaniają tylko nową literę i nie odtwarzają animacji innych.
- Ryzyko/granice: Nie skracać/nie przedłużać rundy dekoracją.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 3 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-045"></a>

### P4-045. Zaznaczenie, okno i błysk trafienia

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Zaznaczenie na czas i okno z dotyku są natychmiastowe; błysk dotyczy dokonanej odpowiedzi lub licznika, nie treści nowego pytania.
- Dokładny zakres/właściciel: [F4-089](FINDINGS.md#f4-089) / całość, [F4-090](FINDINGS.md#f4-090) / całość, [F4-127](FINDINGS.md#f4-127) / całość.
- Zatwierdzone warianty: [D4-101](DECISIONS.md#d4-101) → A; [D4-102](DECISIONS.md#d4-102) → A; [D4-104](DECISIONS.md#d4-104) → A.
- Pliki/obszary: Dziesiatki/Zakupy zaznaczenie; KampusTour okno pola; Quiz.tsx/Inny.tsx błysk.
- Zmiana zasad: **nie dla zasad; tak dla norm animacji**. Dokumenty: ZASADY §5.
- Zależności pakietowe: [P4-041](#p4-041). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. W quizie zmiana rozmiaru siatki po trafieniu nie błyska na przypadkowym nowym elemencie; jednoczesny szybki dotyk przyjmuje prawidłową odpowiedź raz. Okno z kliknięcia działa od razu, bez blokady animacji.
- Ryzyko/granice: Nie zmieniać czasu logiki, kara 1 s pozostaje.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 3 jednostek zakresu i 3 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-046"></a>

### P4-046. Koniec, para i powrót do partii

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: title-pop tylko zwycięzcy; para stone-pop, większy komplet set-glow; zastany stan po reconnect bez nowych zdarzeń; Balon zachowuje werdykt 1,6 s niezależnie od przerwy 0,8 s.
- Dokładny zakres/właściciel: [F4-082](FINDINGS.md#f4-082) / całość, [F4-087](FINDINGS.md#f4-087) / całość, [F4-088](FINDINGS.md#f4-088) / całość, [F4-121](FINDINGS.md#f4-121) / całość, [F4-150](FINDINGS.md#f4-150) / całość.
- Zatwierdzone warianty: [D4-082](DECISIONS.md#d4-082) → A; [D4-085](DECISIONS.md#d4-085) → A; [D4-099](DECISIONS.md#d4-099) → A; [D4-100](DECISIONS.md#d4-100) → A; [D4-103](DECISIONS.md#d4-103) → A.
- Pliki/obszary: Game.tsx; Memory/KampusTour/WPamieci/Balon i pozostałe wystąpienia F4; index.css.
- Zmiana zasad: **nie dla gry, tak dla norm zdarzeń UI**. Dokumenty: ZASADY §5.
- Zależności pakietowe: [P4-041](#p4-041), [P4-040](#p4-040). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Wygrana/przegrana/remis i solo; nowa para/komplet, następna runda Balonu z nadal widocznym wynikiem. Refresh/reconnect nie odtwarza historycznych ruchów ani +1; reduced motion czytelny, punktacja identyczna.
- Ryzyko/granice: Nie czekać z oddaniem wyniku na koniec efektu.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 5 jednostek zakresu i 5 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-047"></a>

### P4-047. Słowa czynności i przejść

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Dalej do następnego kroku, Wyniki do podsumowania; Gotowe dla oddania, Jestem gotowy dla lobby; rysujesz i Dotknij symbolu. Kolor przycisku wynika z roli w partii/między grami.
- Dokładny zakres/właściciel: [F4-085](FINDINGS.md#f4-085) / całość, [F4-091](FINDINGS.md#f4-091) / całość, [F4-098](FINDINGS.md#f4-098) / całość, [F4-119](FINDINGS.md#f4-119) / całość, [F4-139](FINDINGS.md#f4-139) / całość, [F4-148](FINDINGS.md#f4-148) / całość.
- Zatwierdzone warianty: [D4-070](DECISIONS.md#d4-070) → A; [D4-095](DECISIONS.md#d4-095) → A.
- Pliki/obszary: teksty w Game/Lobby/Setup i wszystkich grach wskazanych F4.
- Zmiana zasad: **nie dla gry, tak dla słownika UI**. Dokumenty: ZASADY §4; DESIGN §5.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Przejść od Intro przez odsłonę do Rewanżu w wskazanych grach i Turnieju: etykieta mówi co nastąpi, nie znika potrzebna akcja; Potnij/Pokrój pozostaje czynnością gry, nie mechaniczne Dalej.
- Ryzyko/granice: Nie zmieniać momentu wysłania wyniku; właścicielem W pamięci jest P4-005.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 6 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-048"></a>

### P4-048. Wspólne wyniki i tabele rund

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Dopuścić drugi wspólny Results/ScoreTable dla kolumn; RoundTable z komórkami/wierszem celów; Odcień zachowuje pary próbek jako nazwany wyjątek.
- Dokładny zakres/właściciel: [F4-099](FINDINGS.md#f4-099) / całość, [F4-100](FINDINGS.md#f4-100) / całość.
- Zatwierdzone warianty: [D4-068](DECISIONS.md#d4-068) → A; [D4-069](DECISIONS.md#d4-069) → A.
- Pliki/obszary: screens/ui.tsx; games/Quiz.tsx,Szacowanie.tsx,Przytrzymaj.tsx,Balon.tsx,Kolor.tsx.
- Zmiana zasad: **nie: wyłącznie prezentacja; tak dla wzorców UI**. Dokumenty: ZASADY §4; DESIGN §6.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Trafienia/czas, pęknięcia/wytrzymałości i odchyłki pokazują te same wartości co stan. me="", gra…, (ty), remis, 1/6 osób i 10 rund przy 360 px; U04. Stary detail działa.
- Ryzyko/granice: Nie zmieniać komparatora, formatu score ani limitów przy refaktorze tabel.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 2 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-049"></a>

### P4-049. Liczby, etykiety i wąskie kolumny

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Odczyty mono/tabular-nums, narracja może zostać Satoshi; wspólny przecinek i brak wartości; skrót 999+ tylko w ciasnej Mapie, pkt w nagłówku Turnieju. Progi gry zachowane i uzasadnione, nie wymuszać grade.
- Dokładny zakres/właściciel: [F4-101](FINDINGS.md#f4-101) / całość, [F4-102](FINDINGS.md#f4-102) / całość, [F4-103](FINDINGS.md#f4-103) / całość, [F4-120](FINDINGS.md#f4-120) / całość, [F4-122](FINDINGS.md#f4-122) / całość, [F4-124](FINDINGS.md#f4-124) / całość, [F4-141](FINDINGS.md#f4-141) / całość, [F4-145](FINDINGS.md#f4-145) / całość, [F4-149](FINDINGS.md#f4-149) / całość, [F4-151](FINDINGS.md#f4-151) / całość, [F4-153](FINDINGS.md#f4-153) / całość, [F4-157](FINDINGS.md#f4-157) / całość.
- Zatwierdzone warianty: [D4-096](DECISIONS.md#d4-096) → B.
- Pliki/obszary: ui.tsx,Records.tsx,Game.tsx i dokładne miejsca gier z F4.
- Zmiana zasad: **nie: wartości i ich progi bez zmian; tak dla wyjątku narracji**. Dokumenty: ZASADY §4; DESIGN §2/§5.
- Zależności pakietowe: [P4-048](#p4-048). Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. U04/U05/U06: 10 rund, długie nicki, duża suma turnieju i wynik Zakupów mieszczą się; tooltip/pełny wynik nie gubi liczby przez skrót. Kary Schultego/Sudoku nadal całkowite; test formatowania nie zmienia rankingu.
- Ryzyko/granice: Nie przedstawiać istniejących całkowitych kar jako potwierdzonego błędu dziesiętnego.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 12 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-050"></a>

### P4-050. Role tokenów i drugi sygnał stanu

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Wspólna klasa akcji gracza, tokeny w swoich rolach, właściciel/wybór z widoczną ikoną/znakiem; jawne ograniczone wyjątki treści, 2.5D, gradientu Koła i odznaki 4 px.
- Dokładny zakres/właściciel: [F4-063](FINDINGS.md#f4-063) / całość, [F4-094](FINDINGS.md#f4-094) / całość, [F4-095](FINDINGS.md#f4-095) / całość, [F4-096](FINDINGS.md#f4-096) / całość, [F4-097](FINDINGS.md#f4-097) / całość, [F4-110](FINDINGS.md#f4-110) / całość, [F4-111](FINDINGS.md#f4-111) / całość, [F4-118](FINDINGS.md#f4-118) / całość, [F4-129](FINDINGS.md#f4-129) / całość.
- Zatwierdzone warianty: [D4-062](DECISIONS.md#d4-062) → A; [D4-063](DECISIONS.md#d4-063) → A; [D4-064](DECISIONS.md#d4-064) → A; [D4-065](DECISIONS.md#d4-065) → A.
- Pliki/obszary: index.css btn-player/tokeny; ui.tsx odznaki; Game.tsx,Plansze/Records/Setup oraz konkretne miejsca F4.
- Zmiana zasad: **nie dla gry, tak dla wyjątków standardu**. Dokumenty: ZASADY §4; DESIGN §2/§5/§6.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: U12/U11 do pełnego odbioru sygnałów; część stylistyczna nie dowodzi testu czytnika.
- Kolejność/odbiór: T + UI. Kolor gracza zamiast akcentu dla wyboru, warning z ikoną/tekstem, contrast accent-fg na prawidłowym tle. U12 sześć kolorów i U11: widoczny znak nie zastąpiony aria-label. Wszystkie wskazane cienie/promienie mają albo token/skale, albo nazwany wyjątek.
- Ryzyko/granice: Wyjątek treści nie legalizuje całej dekoracji; czytelność celów Śledzenia może zmieniać trudność rozpoznania, nie ruch.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 9 jednostek zakresu i 4 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-051"></a>

### P4-051. Etykiety, natywne kontrolki i wykres dotykiem

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: color-scheme:dark, ozdobne ikony pominięte, przyciski i pola nazwane; tooltip wykresu utrzymuje się po dotknięciu.
- Dokładny zakres/właściciel: [F4-062](FINDINGS.md#f4-062) / całość, [F4-112](FINDINGS.md#f4-112) / całość, [F4-134](FINDINGS.md#f4-134) / całość.
- Zatwierdzone warianty: [D4-097](DECISIONS.md#d4-097) → A.
- Pliki/obszary: index.css; ui.tsx,Game.tsx i wszystkie miejsca F4-112; KampusSummary.tsx tooltip.
- Zmiana zasad: **nie**. Dokumenty: DESIGN §4 jeśli doprecyzowanie; bez rozszerzania zasad.
- Zależności pakietowe: brak. Dodatkowy warunek: U10/U11: prawdziwy dotyk/czytnik przed zamknięciem odbioru.
- Kolejność/odbiór: T + UI. Klawiatura i DOM: nazwy przycisków i role, logiczny fokus. U11 TalkBack/VoiceOver: faktycznie wypowiadane postępy i status; U10 dotknięcie wykresu utrzymuje kwotę. Nie uznać samego aria-label na span za udowodniony odczyt.
- Ryzyko/granice: Odczyt czytnika nie wynika ze snapshotu Playwright.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 3 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-052"></a>

### P4-052. Czytelne stany oczekiwania, błędu i blokady

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: pozostałe zasady i wspólne zachowanie.
- Problem i zachowanie po zmianie: Rozłączenie i ładowanie mają tekst, zamknięcie pokoju właściwy komunikat; brak możliwości akcji ma powód. Sudoku bez wyboru nie udaje aktywnej klawiatury; turniej solo i puste ciekawostki mają opis.
- Dokładny zakres/właściciel: [F4-073](FINDINGS.md#f4-073) / całość, [F4-074](FINDINGS.md#f4-074) / całość, [F4-113](FINDINGS.md#f4-113) / całość, [F4-114](FINDINGS.md#f4-114) / całość, [F4-115](FINDINGS.md#f4-115) / całość, [F4-128](FINDINGS.md#f4-128) / całość, [F4-137](FINDINGS.md#f4-137) / całość, [F4-138](FINDINGS.md#f4-138) / całość, [F4-146](FINDINGS.md#f4-146) / całość, [F4-154](FINDINGS.md#f4-154) / całość, [F4-155](FINDINGS.md#f4-155) / całość.
- Zatwierdzone warianty: [D4-097](DECISIONS.md#d4-097) → A.
- Pliki/obszary: App/Home/Lobby/Setup/Records/Game; Szacowanie/Chinczyk/Sudoku/KampusSummary zgodnie z F4.
- Zmiana zasad: **nie: informacja i dostępność, bez nowych kar**. Dokumenty: DESIGN §4.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. W /dev przerwanie/odnowienie połączenia, zamknięcie pokoju, opóźnione API, brak wyników; tekst zamiast fałszywego błędu kodu. Zablokowany pionek, liczba poza zakresem, min/max Turnieju, Sudoku bez pola. Każdy stan wraca po usunięciu przyczyny.
- Ryzyko/granice: Nie zamieniać braku danych i ładowania w pustą tabelę; wyłączenie klawiatury nie może usuwać możliwości wybrania pola.
- Rozmiar: **L**, zamknięta lista wielu wystąpień albo kontrakt danych i rozbudowany odbiór; 11 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-053"></a>

### P4-053. Wąskie podpisy i hierarchia ekranów

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Jeden wypełniony akcent Home; tytuły i tła zgodne ze wzorcem; poprawić tylko zmierzone obcięcia podpisów i Preview. Koło ma osobny Preview, Stroop pełny opis zgodnych plansz.
- Dokładny zakres/właściciel: [F4-066](FINDINGS.md#f4-066) / całość, [F4-068](FINDINGS.md#f4-068) / całość, [F4-070](FINDINGS.md#f4-070) / całość, [F4-071](FINDINGS.md#f4-071) / całość, [F4-072](FINDINGS.md#f4-072) / całość, [F4-123](FINDINGS.md#f4-123) / całość, [F4-133](FINDINGS.md#f4-133) / całość, [F4-136](FINDINGS.md#f4-136) / całość, [F4-142](FINDINGS.md#f4-142) / całość, [F4-143](FINDINGS.md#f4-143) / całość, [F4-144](FINDINGS.md#f4-144) / całość.
- Zatwierdzone warianty: [D4-066](DECISIONS.md#d4-066) → A; [D4-072](DECISIONS.md#d4-072) → A; [D4-095](DECISIONS.md#d4-095) → A; [D4-098](DECISIONS.md#d4-098) → A.
- Pliki/obszary: Home/Setup/Records; Stroop/Kolo/KampusTour/KampusSummary; siatki Quiz/Sudoku zgodnie z F4-123.
- Zmiana zasad: **nie dla zasad**. Dokumenty: DESIGN §2/§5/§6; ZASADY §4 Intro.
- Zależności pakietowe: brak. Dodatkowy warunek: U03/U04/U09 dla niezmierzonych wystąpień; nie poprawiać hipotetycznych obcięć na ślepo.
- Kolejność/odbiór: T + UI. U03/U04/U09: Wszystkie(30), komplet odpowiedzi Preview, TopGame i drobne podpisy czytelne przy 360 px i fontach. Pełny kod pokoju: Dołącz primary, Zagraj obrys. Dodatkowy tekst nie zwiększa Intro poza okno.
- Ryzyko/granice: Czytelność 7-8 px wymaga telefonu; sam rozmiar z CSS nie rozstrzyga.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 11 jednostek zakresu i 4 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-054"></a>

### P4-054. Nieaktualne opisy bez zmiany zasad

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P3**. P3: wygląd, tekst lub porządek bez potwierdzonej utraty wyniku.
- Problem i zachowanie po zmianie: Opisy kart/talii/fazy pick, tie W pamięci, jednostka serii, komentarze widoków i Ć odpowiadają istniejącej grze; Intro podaje rundy i uczciwie opisany czas.
- Dokładny zakres/właściciel: [F4-020](FINDINGS.md#f4-020) / całość, [F4-024](FINDINGS.md#f4-024) / całość, [F4-025](FINDINGS.md#f4-025) / całość, [F4-026](FINDINGS.md#f4-026) / całość, [F4-035](FINDINGS.md#f4-035) / całość, [F4-043](FINDINGS.md#f4-043) / całość, [F4-044](FINDINGS.md#f4-044) / całość, [F4-052](FINDINGS.md#f4-052) / całość, [F4-055](FINDINGS.md#f4-055) / całość, [F4-125](FINDINGS.md#f4-125) / całość.
- Zatwierdzone warianty: [D4-072](DECISIONS.md#d4-072) → A; [D4-095](DECISIONS.md#d4-095) → A.
- Pliki/obszary: KONCEPT.md; ZASADY-GIER wskazane sekcje; komentarze i FORMAT w Records.tsx; Intro gier F4-125.
- Zmiana zasad: **nie: opis/etykieta, bez nowych liczb zasad**. Dokumenty: KONCEPT; ZASADY-GIER; ZASADY §4.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Wskazane sformułowania i komentarze porównać z kodem; seria nie opisana pkt, karty Kampus Tour nie przypisane Poprawce. Intro ma time/task/score i Preview, nie obiecuje czasu z modelu jako stałego.
- Ryzyko/granice: Jeśli inny zaakceptowany pakiet zmienia tę samą regułę, jego opis ma pierwszeństwo; nie przywracać później starej liczby.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 10 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-055"></a>

### P4-055. Stoper: stały cel

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: wyrównanie wyzwania, wpływ na człowieka nadal częściowo A/Z.
- Problem i zachowanie po zmianie: Cel 10 s, wynik nadal w ms.
- Dokładny zakres/właściciel: [F4-003](FINDINGS.md#f4-003) / `stoper`.
- Zatwierdzone warianty: [D4-013](DECISIONS.md#d4-013) → A.
- Pliki/obszary: packages/games/src/stoper.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zmiana zasad: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test setup zawsze target 10000 oraz deterministyczny seed; wynik graniczny 0/cel, timeout i ten sam stary detail. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Ryzyko/granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-056"></a>

### P4-056. Rytm: stałe tempo

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: wyrównanie wyzwania, wpływ na człowieka nadal częściowo A/Z.
- Problem i zachowanie po zmianie: 100 BPM, wynik nadal w ms.
- Dokładny zakres/właściciel: [F4-003](FINDINGS.md#f4-003) / `rytm`.
- Zatwierdzone warianty: [D4-014](DECISIONS.md#d4-014) → A.
- Pliki/obszary: packages/games/src/rytm.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zmiana zasad: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test stałego odstępu 600 ms i zachowania liczby uderzeń, timeout i metronom; stary detail z innym tempem renderuje zapisane dane. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Ryzyko/granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-057"></a>

### P4-057. Liczenie: komplet rodzajów

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: wyrównanie wyzwania, wpływ na człowieka nadal częściowo A/Z.
- Problem i zachowanie po zmianie: Potasowane czwórki rodzajów, bez zmiany zakresów liczb.
- Dokładny zakres/właściciel: [F4-003](FINDINGS.md#f4-003) / `liczenie`.
- Zatwierdzone warianty: [D4-015](DECISIONS.md#d4-015) → A.
- Pliki/obszary: packages/games/src/liczenie.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zmiana zasad: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. 1000 seedów: każda pełna czwórka ma cztery typy, poprawne liczby i brak zdegenerowanych odpowiedzi; ten sam seed to samo. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Ryzyko/granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-058"></a>

### P4-058. Obrót: sześć rodzajów planszy

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: wyrównanie wyzwania, wpływ na człowieka nadal częściowo A/Z.
- Problem i zachowanie po zmianie: Komplet 90/180/270×ta sama/lustro w każdej szóstce.
- Dokładny zakres/właściciel: [F4-003](FINDINGS.md#f4-003) / `obrot`.
- Zatwierdzone warianty: [D4-016](DECISIONS.md#d4-016) → A.
- Pliki/obszary: packages/games/src/obrot.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zmiana zasad: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. 1000 seedów: pełne szóstki bez duplikatu typu, prawidłowe lustro i kąty, zakres wyników i kara identyczne. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Ryzyko/granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-059"></a>

### P4-059. W pamięci: stała liczba mnożeń

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: wyrównanie wyzwania, wpływ na człowieka nadal częściowo A/Z.
- Problem i zachowanie po zmianie: floor(liczba działań/3) mnożeń na rundę, miejsca tasowane; wartości pośrednie 1-99.
- Dokładny zakres/właściciel: [F4-003](FINDINGS.md#f4-003) / `w-pamieci`.
- Zatwierdzone warianty: [D4-022](DECISIONS.md#d4-022) → A.
- Pliki/obszary: packages/games/src/w-pamieci.ts i test; komponent gry tylko zgodny odczyt stanu.
- Zmiana zasad: **tak: setup/trudność**. Dokumenty: ZASADY-GIER odpowiedniej gry; KONCEPT §2.4.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane. P11 przed odbiorem wpływu mnożeń, zgodnie z ZG4-v1.
- Kolejność/odbiór: T + UI. 1000 seedów: liczby mnożeń perrunda stałe, wartości 1-99, seedy odtwarzalne i ciągi nowe; brak nieskończonej pętli generatora. /dev solo/6 os., rekord/turniej, refresh/rewanż i me="". Test przed implementacją.
- Ryzyko/granice: Stała jednostka nie dowodzi porównywalności dawnych rekordów. Nie regenerować starego detail nowym setup.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-060"></a>

### P4-060. Balon: ten sam komplet ryzyka

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: model strategii wykazuje rozrzut, nie zmierzono skutku u ludzi.
- Problem i zachowanie po zmianie: Tasować komplet 11..20 o sumie 155 zamiast różnych rozkładów withSum; reguła stop i tie pęknięć zostają.
- Dokładny zakres/właściciel: [F4-161](FINDINGS.md#f4-161) / całość.
- Zatwierdzone warianty: [D4-028](DECISIONS.md#d4-028) → A; [D4-029](DECISIONS.md#d4-029) → A.
- Pliki/obszary: packages/games/src/balon.ts, balon.test.ts; dokumentacja losowania.
- Zmiana zasad: **tak: rozkład wytrzymałości**. Dokumenty: ZASADY-GIER §Balon; KONCEPT §2.4; ZASADY §3 reguła w policy.
- Zależności pakietowe: [P4-001](#p4-001). Dodatkowy warunek: G-DANE rozstrzygnięte w ZG4-v1 §3.2, z zachowaniem starej historii; pozostałe testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. 1000 seedów: ten sam multizbiór 11..20, suma 155, różna kolejność, score 0..155 i najgorszy timeout. Porównać strategie stop 10/15 na tym samym komplecie. /dev10 balonów, solo/6, rekordy i turniej.
- Ryzyko/granice: Zwężenie z 1..30 do 11..20 mocno zmienia odczucie ryzyka; wymaga jawnej akceptacji kompletu, nie samego słowa wyrównać.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 2 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-061"></a>

### P4-061. Zegar bodźca i dotyku

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2 pomimo niskiej wagi: precyzja wspólnego mechanizmu, ale nieudowodniony rozmiar efektu sprzętu.
- Problem i zachowanie po zmianie: Spójny zegar zdarzenia i rAF, opis ograniczeń sprzętu; nie obiecywać usunięcia opóźnienia ekranu/dotyku.
- Dokładny zakres/właściciel: [F4-117](FINDINGS.md#f4-117) / całość.
- Zatwierdzone warianty: [D4-049](DECISIONS.md#d4-049) → A.
- Pliki/obszary: Refleks/Stoj/Stoper/Wieza i inne dokładne miejsca F4-117; bez kalibracji pertelefon.
- Zmiana zasad: **tak jeśli zmienia moment pomiaru wyniku; nie same jednostki**. Dokumenty: ZASADY-GIER §Refleks/§Stój!; ZASADY §5.
- Zależności pakietowe: brak. Dodatkowy warunek: U14 oraz G-DANE przed zmianą metody liczenia rekordów.
- Kolejność/odbiór: T + UI. U14: logi timestamp/rAF, ekrany 60/120 Hz, pomiar błysku i zachowania po powrocie do karty; bodziec bez przejścia. Równa jednostka ms, żaden wynik z ujemnego czasu; porównanie starego i nowego odniesienia.
- Ryzyko/granice: rAF jest przed prezentacją klatki, nie pomiarem emisji piksela. Stoper/Wieża wymagają dowodu sensu zmiany, nie mechanicznej zamiany wszystkich performance.now.
- Rozmiar: **M**, kilka powiązanych miejsc lub faz, odrębne regresje; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

<a id="p4-062"></a>

### P4-062. Państwa-miasta: pominąć Ł

- Wersja/status: **PK4-v1 / zaakceptowany zakres: poprawić** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”; uściślenia FINAL-APPROVAL §3). Priorytet: **P2**. P2: zmiana reguły mimo niskiej wagi; wszyscy dostają tę samą literę.
- Problem i zachowanie po zmianie: Ł nie losuje się w rundach, bo kategoria państwa jest systemowo słabsza.
- Dokładny zakres/właściciel: [F4-166](FINDINGS.md#f4-166) / całość.
- Zatwierdzone warianty: [D4-046](DECISIONS.md#d4-046) → A.
- Pliki/obszary: packages/games/src/panstwa-miasta.ts, test.
- Zmiana zasad: **tak: pula liter**. Dokumenty: ZASADY-GIER §Państwa-miasta; KONCEPT §2.5.
- Zależności pakietowe: brak. Dodatkowy warunek: zakres i warianty zatwierdzone w ZG4-v1; testy i odbiór tej karty nadal wymagane.
- Kolejność/odbiór: T + UI. Test dozwolonej puli liter,5różnych rund, ten sam seed i brak Ł; /dev start/rewanż z zachowaniem punktacji.
- Ryzyko/granice: Nie jest to korekta odpowiedzi czy progu głosowania.
- Rozmiar: **S**, jeden ograniczony mechanizm/opis, krótki odbiór; 1 jednostek zakresu i 1 wskazanych wyborów. Tylko wymieniony zakres; bez zmian id i bez nowych zależności.

## 4. Zatwierdzone pozostawienie zachowania z powodami

Wszystkie pozycje H zatwierdzone: zostawić jako świadome odstępstwo z powodem na ten etap (ZG4-v1 §5). To nie lista wdrożeń: nie wymaga testów nowej reguły, dopóki użytkownik nie wybierze zmiany. Po uzyskanym wyborze „zostawić jako odstępstwo” zakres fazy 5 obejmuje ewentualne dopisanie **tego powodu** w sekcji gry, bez niejawnej zmiany kodu. Wybór wariantu A po pomiarze wymaga przygotowania osobnego zamkniętego pakietu z testem i oceną danych; nie aktywuje niewidocznej alternatywy w PK4-v1.

| Właściciel | Dokładne wystąpienia | Propozycja wariantu | Powód | Powrót |
|---|---|---|---|---|
| <a id="h-001"></a>H-001: Środek: pomiar limitu | [F4-002](FINDINGS.md#f4-002) / `srodek` | [D4-007](DECISIONS.md#d4-007) → B | Zostawić 60 s do pomiaru; wysoka ocena oparta na 5 s celowania. | P14: czas starannej partii; potem wariant 90 s i G-DANE jeśli wybrany. |
| <a id="h-002"></a>H-002: Tort: pomiar limitu | [F4-002](FINDINGS.md#f4-002) / `tort` | [D4-008](DECISIONS.md#d4-008) → B | Zostawić 120 s do pomiaru; 120,5 s jest modelem. | P14: osobny pomiar Tortu; potem 180 s lub uzasadniony dotychczasowy limit. |
| <a id="h-003"></a>H-003: Państwa-miasta:45 s głosowania | [F4-002](FINDINGS.md#f4-002) / `panstwa-miasta` | [D4-010](DECISIONS.md#d4-010) → B | Najpierw czytelny interfejs; nowy wzór skraca czas małych grup. | P08 po pm-ui:5-6 os., ilu zdążyło przejrzeć i zagłosować. |
| <a id="h-004"></a>H-004: kolor: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `kolor` | [D4-017](DECISIONS.md#d4-017) → B | Nie wykazano wyrównania czułości proponowanymi pasmami. | próba generatora oraz U09; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-005"></a>H-005: dziesiatki: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `dziesiatki` | [D4-018](DECISIONS.md#d4-018) → C (ZG4-v1: zachować obecny generator) | Wpływ liczby par zależy od wyborów gracza. | P19; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-006"></a>H-006: sudoku: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `sudoku` | [D4-019](DECISIONS.md#d4-019) → B | Nie potwierdzono dostatecznej puli plansz 3fale/3jednoznaczne. | próba generatora; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-007"></a>H-007: kat: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `kat` | [D4-020](DECISIONS.md#d4-020) → B | Wpływ wielkości kąta na błąd człowieka niezmierzony. | P15; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-008"></a>H-008: sledzenie: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `sledzenie` | [D4-021](DECISIONS.md#d4-021) → B | Mijanki są metryką generatora, nie udowodnioną trudnością. | U13 i partie mierzące mijanki; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-009"></a>H-009: stoj: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `stoj` | [D4-023](DECISIONS.md#d4-023) → B | Błędy końcówki niezmierzone. | P18; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-010"></a>H-010: zaslona: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `zaslona` | [D4-024](DECISIONS.md#d4-024) → B | Widoczność a błąd niezmierzone. | P17; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-011"></a>H-011: literowka: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `literowka` | [D4-025](DECISIONS.md#d4-025) → B | Rodzaj błędu a czas niezmierzony. | P16; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-012"></a>H-012: rok: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `rok` | [D4-026](DECISIONS.md#d4-026) → B | Działy wymagają klasyfikacji danych i partii. | P22; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-013"></a>H-013: kubki: zachować generator do weryfikacji | [F4-003](FINDINGS.md#f4-003) / `kubki` | [D4-027](DECISIONS.md#d4-027) → B | Niski rozrzut, brak dowodu potrzeby zmiany. | U13; wrócić tylko przy wykazaniu wpływu; następnie konkretna propozycja A i G-DANE, jeśli nadal potrzebna. |
| <a id="h-014"></a>H-014: w-pamieci: bez nowego tie | [F4-158](FINDINGS.md#f4-158) / `w-pamieci` | [D4-030](DECISIONS.md#d4-030) → B; [D4-035](DECISIONS.md#d4-035) → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P11; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| <a id="h-015"></a>H-015: kubki: bez nowego tie | [F4-158](FINDINGS.md#f4-158) / `kubki` | [D4-031](DECISIONS.md#d4-031) → B; [D4-035](DECISIONS.md#d4-035) → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P10; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| <a id="h-016"></a>H-016: simon: bez nowego tie | [F4-158](FINDINGS.md#f4-158) / `simon` | [D4-032](DECISIONS.md#d4-032) → B; [D4-035](DECISIONS.md#d4-035) → B | Nie wykazano częstych kompletów/remisów u ludzi; nie dokładać szybkości jako nowej umiejętności. | P09; ewentualne nowe tie wymaga G-DANE i osobnej zmiany reprezentacji. |
| <a id="h-017"></a>H-017: wieza: dotychczasowy sufit | [F4-159](FINDINGS.md#f4-159) / `wieza` | [D4-033](DECISIONS.md#d4-033) → B | Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. | P13; dopiero potem nowe rundy/lista i ocena limitu/historii. |
| <a id="h-018"></a>H-018: zakupy: dotychczasowy sufit | [F4-159](FINDINGS.md#f4-159) / `zakupy` | [D4-034](DECISIONS.md#d4-034) → B | Osiągalność sufitu jest założeniem/modelowym wynikiem, nie pomiarem ludzi. | P12 po pakiecie zakupy; dopiero potem nowe rundy/lista i ocena limitu/historii. |
| <a id="h-019"></a>H-019: kampus-tour: kolejność miejsc bez zmiany | [F4-160](FINDINGS.md#f4-160) / `kampus-tour` | [D4-038](DECISIONS.md#d4-038) → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P01; wrócić przed premią/ścianami/swap/losowaniem startu. |
| <a id="h-020"></a>H-020: MPK: bez opłaty 15 zł | [F4-163](FINDINGS.md#f4-163) / całość | [D4-039](DECISIONS.md#d4-039) → B | Udział kompletów z botów nie wystarcza do zmiany kosztu. | P02; przed nową ceną opisać zachowanie bez gotówki. |
| <a id="h-021"></a>H-021: Monopol i długość Kampus Tour | [F4-164](FINDINGS.md#f4-164) / całość, [F4-165](FINDINGS.md#f4-165) / całość | [D4-040](DECISIONS.md#d4-040) → B; [D4-041](DECISIONS.md#d4-041) → B | Monopol rzadki w botach, czas gry to model. | P03/P04; dopiero potem ograniczenie grup lub 18 rund. |
| <a id="h-022"></a>H-022: labirynt: kolejność miejsc bez zmiany | [F4-160](FINDINGS.md#f4-160) / `labirynt` | [D4-043](DECISIONS.md#d4-043) → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P06; wrócić przed premią/ścianami/swap/losowaniem startu. |
| <a id="h-023"></a>H-023: piec-w-rzedzie: kolejność miejsc bez zmiany | [F4-160](FINDINGS.md#f4-160) / `piec-w-rzedzie` | [D4-044](DECISIONS.md#d4-044) → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P05; wrócić przed premią/ścianami/swap/losowaniem startu. |
| <a id="h-024"></a>H-024: memory: kolejność miejsc bez zmiany | [F4-160](FINDINGS.md#f4-160) / `memory` | [D4-045](DECISIONS.md#d4-045) → B | Rotacja miejsc istnieje, boty i teoria nie mierzą przewagi tej grupy ludzi. | P07; wrócić przed premią/ścianami/swap/losowaniem startu. |
| <a id="h-025"></a>H-025: Statki: zachować start pierwszego | [F4-160](FINDINGS.md#f4-160) / `statki` | Decyzja wprost dla tego wystąpienia, brak nowej karty D4. | Boty 50,8-54,5% nie uzasadniają nowej reguły; rotacja pozostaje. | Obserwować Flotę wojenną; brak nowej D4 nie oznacza automatycznej akceptacji: w 04-04 decyzja wprost o tym wystąpieniu. |
| <a id="h-026"></a>H-026: Kalambury 2 os.:bez zmiany punktów | [F4-167](FINDINGS.md#f4-167) / całość | [D4-047](DECISIONS.md#d4-047) → B | Proporcja 3/10 nie dowodzi złego doświadczenia graczy. | P20; przed zmianą 3→5 porównać źródła punktów w pełnych partiach. |
| <a id="h-027"></a>H-027: Turniej:domyślnie 8gier | [F4-168](FINDINGS.md#f4-168) / całość | [D4-048](DECISIONS.md#d4-048) → B | Nieparzysta liczba gier nie gwarantuje braku remisu. | Częstość dogrywek w rzeczywistych seriach przed zmianą domyślnej długości. |

**Pozostałe konteksty:** F1:O04 ma konkretny P4-028. Inne 46 istniejących odstępstw mają zatwierdzone powody w DECISIONS §7 / ZG4-v1 §6; konflikty z F4 rozliczają właściciele §5, resztę jawnie potwierdzono w końcowej zgodzie bez tworzenia nowego błędu. MP-01 (Mapa/P21) zamknięte wariantem B: bez nowego F4, generatora lub obowiązkowego pomiaru. D4-017/019/021 po analizie generatora nie są automatycznie gotowymi specyfikacjami nowych generatorów.

## 5. Pełna mapa właścicieli

Jeden wiersz na F4. W nawiasie nazwa części, jeśli rozdzielono agregat. Wszystkie części są rozłączne według §1. `całość` nie współistnieje z częściami tego samego F4. Odrębne F4 mogą dotykać tego samego wiersza kodu z różnej przyczyny; wykonawca odhacza je osobno, ale nie implementuje dwa razy tej samej zmiany.

| F4 | Właściciel i dokładna część |
|---|---|
| [F4-001](FINDINGS.md#f4-001) | [P4-002](#p4-002) (`całość`) |
| [F4-002](FINDINGS.md#f4-002) | [H-003](#h-003) (`panstwa-miasta`); [P4-001](#p4-001) (`regula-zapasu`); [P4-021](#p4-021) (`rok`); [P4-004](#p4-004) (`simon`); [P4-020](#p4-020) (`sledzenie`); [H-001](#h-001) (`srodek`); [H-002](#h-002) (`tort`); [P4-003](#p4-003) (`zakupy`) |
| [F4-003](FINDINGS.md#f4-003) | [H-005](#h-005) (`dziesiatki`); [H-007](#h-007) (`kat`); [H-004](#h-004) (`kolor`); [H-013](#h-013) (`kubki`); [P4-057](#p4-057) (`liczenie`); [H-011](#h-011) (`literowka`); [P4-058](#p4-058) (`obrot`); [H-012](#h-012) (`rok`); [P4-056](#p4-056) (`rytm`); [H-008](#h-008) (`sledzenie`); [H-009](#h-009) (`stoj`); [P4-055](#p4-055) (`stoper`); [H-006](#h-006) (`sudoku`); [P4-059](#p4-059) (`w-pamieci`); [H-010](#h-010) (`zaslona`) |
| [F4-004](FINDINGS.md#f4-004) | [P4-030](#p4-030) (`chinczyk`); [P4-029](#p4-029) (`kampus-tour`); [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-030](#p4-030) (`piec-w-rzedzie`); [P4-032](#p4-032) (`refleks`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-030](#p4-030) (`statki`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`); [P4-030](#p4-030) (`turniej`) |
| [F4-005](FINDINGS.md#f4-005) | [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-030](#p4-030) (`statki`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`) |
| [F4-006](FINDINGS.md#f4-006) | [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-032](#p4-032) (`refleks`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-032](#p4-032) (`srodek`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`) |
| [F4-007](FINDINGS.md#f4-007) | [P4-031](#p4-031) (`dziesiatki`); [P4-031](#p4-031) (`inny`); [P4-029](#p4-029) (`kampus-tour`); [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-031](#p4-031) (`literowka`); [P4-031](#p4-031) (`obrot`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-032](#p4-032) (`simon`); [P4-031](#p4-031) (`stroop`) |
| [F4-008](FINDINGS.md#f4-008) | [P4-030](#p4-030) (`chinczyk`); [P4-029](#p4-029) (`kampus-tour`); [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-031](#p4-031) (`liczenie`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-030](#p4-030) (`piec-w-rzedzie`); [P4-032](#p4-032) (`refleks`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-030](#p4-030) (`statki`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`) |
| [F4-009](FINDINGS.md#f4-009) | [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-032](#p4-032) (`nozyczki`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-032](#p4-032) (`refleks`); [P4-032](#p4-032) (`rok`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-032](#p4-032) (`srodek`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`); [P4-032](#p4-032) (`tort`) |
| [F4-010](FINDINGS.md#f4-010) | [P4-029](#p4-029) (`kampus-tour`); [P4-032](#p4-032) (`kolo`); [P4-032](#p4-032) (`kolor`); [P4-032](#p4-032) (`kropki`); [P4-031](#p4-031) (`liczenie`); [P4-030](#p4-030) (`panstwa-miasta`); [P4-032](#p4-032) (`schulte`); [P4-032](#p4-032) (`simon`); [P4-032](#p4-032) (`stoper`); [P4-031](#p4-031) (`stroop`) |
| [F4-011](FINDINGS.md#f4-011) | [P4-030](#p4-030) (`kalambury`); [P4-030](#p4-030) (`panstwa-miasta`) |
| [F4-012](FINDINGS.md#f4-012) | [P4-029](#p4-029) (`kampus-tour`); [P4-030](#p4-030) (`statki`) |
| [F4-013](FINDINGS.md#f4-013) | [P4-024](#p4-024) (`całość`) |
| [F4-014](FINDINGS.md#f4-014) | [P4-023](#p4-023) (`całość`) |
| [F4-015](FINDINGS.md#f4-015) | [P4-023](#p4-023) (`całość`) |
| [F4-016](FINDINGS.md#f4-016) | [P4-033](#p4-033) (`całość`) |
| [F4-017](FINDINGS.md#f4-017) | [P4-034](#p4-034) (`całość`) |
| [F4-018](FINDINGS.md#f4-018) | [P4-025](#p4-025) (`całość`) |
| [F4-019](FINDINGS.md#f4-019) | [P4-035](#p4-035) (`całość`) |
| [F4-020](FINDINGS.md#f4-020) | [P4-054](#p4-054) (`całość`) |
| [F4-021](FINDINGS.md#f4-021) | [P4-033](#p4-033) (`całość`) |
| [F4-022](FINDINGS.md#f4-022) | [P4-026](#p4-026) (`całość`) |
| [F4-023](FINDINGS.md#f4-023) | [P4-026](#p4-026) (`całość`) |
| [F4-024](FINDINGS.md#f4-024) | [P4-054](#p4-054) (`całość`) |
| [F4-025](FINDINGS.md#f4-025) | [P4-054](#p4-054) (`całość`) |
| [F4-026](FINDINGS.md#f4-026) | [P4-054](#p4-054) (`całość`) |
| [F4-027](FINDINGS.md#f4-027) | [P4-029](#p4-029) (`całość`) |
| [F4-028](FINDINGS.md#f4-028) | [P4-029](#p4-029) (`całość`) |
| [F4-029](FINDINGS.md#f4-029) | [P4-029](#p4-029) (`całość`) |
| [F4-030](FINDINGS.md#f4-030) | [P4-026](#p4-026) (`całość`) |
| [F4-031](FINDINGS.md#f4-031) | [P4-026](#p4-026) (`całość`) |
| [F4-032](FINDINGS.md#f4-032) | [P4-029](#p4-029) (`całość`) |
| [F4-033](FINDINGS.md#f4-033) | [P4-029](#p4-029) (`całość`) |
| [F4-034](FINDINGS.md#f4-034) | [P4-029](#p4-029) (`całość`) |
| [F4-035](FINDINGS.md#f4-035) | [P4-054](#p4-054) (`całość`) |
| [F4-036](FINDINGS.md#f4-036) | [P4-025](#p4-025) (`całość`) |
| [F4-037](FINDINGS.md#f4-037) | [P4-030](#p4-030) (`całość`) |
| [F4-038](FINDINGS.md#f4-038) | [P4-030](#p4-030) (`całość`) |
| [F4-039](FINDINGS.md#f4-039) | [P4-027](#p4-027) (`całość`) |
| [F4-040](FINDINGS.md#f4-040) | [P4-030](#p4-030) (`całość`) |
| [F4-041](FINDINGS.md#f4-041) | [P4-030](#p4-030) (`całość`) |
| [F4-042](FINDINGS.md#f4-042) | [P4-030](#p4-030) (`całość`) |
| [F4-043](FINDINGS.md#f4-043) | [P4-054](#p4-054) (`całość`) |
| [F4-044](FINDINGS.md#f4-044) | [P4-054](#p4-054) (`całość`) |
| [F4-045](FINDINGS.md#f4-045) | [P4-032](#p4-032) (`całość`) |
| [F4-046](FINDINGS.md#f4-046) | [P4-031](#p4-031) (`całość`) |
| [F4-047](FINDINGS.md#f4-047) | [P4-032](#p4-032) (`całość`) |
| [F4-048](FINDINGS.md#f4-048) | [P4-034](#p4-034) (`całość`) |
| [F4-049](FINDINGS.md#f4-049) | [P4-031](#p4-031) (`całość`) |
| [F4-050](FINDINGS.md#f4-050) | [P4-032](#p4-032) (`całość`) |
| [F4-051](FINDINGS.md#f4-051) | [P4-034](#p4-034) (`całość`) |
| [F4-052](FINDINGS.md#f4-052) | [P4-054](#p4-054) (`całość`) |
| [F4-053](FINDINGS.md#f4-053) | [P4-032](#p4-032) (`całość`) |
| [F4-054](FINDINGS.md#f4-054) | [P4-030](#p4-030) (`całość`) |
| [F4-055](FINDINGS.md#f4-055) | [P4-054](#p4-054) (`całość`) |
| [F4-056](FINDINGS.md#f4-056) | [P4-009](#p4-009) (`chinczyk`); [P4-012](#p4-012) (`kalambury`); [P4-015](#p4-015) (`kat`); [P4-013](#p4-013) (`kolo`); [P4-015](#p4-015) (`kropki`); [P4-010](#p4-010) (`labirynt`); [P4-011](#p4-011) (`memory`); [P4-006](#p4-006) (`naglowek-Game`); [P4-014](#p4-014) (`panstwa-miasta`); [P4-007](#p4-007) (`piec-w-rzedzie`); [P4-008](#p4-008) (`statki`); [P4-015](#p4-015) (`w-pamieci`) |
| [F4-057](FINDINGS.md#f4-057) | [P4-019](#p4-019) (`chinczyk`); [P4-018](#p4-018) (`kampus-tour`) |
| [F4-058](FINDINGS.md#f4-058) | [P4-017](#p4-017) (`całość`) |
| [F4-059](FINDINGS.md#f4-059) | [P4-003](#p4-003) (`całość`) |
| [F4-060](FINDINGS.md#f4-060) | [P4-001](#p4-001) (`całość`) |
| [F4-061](FINDINGS.md#f4-061) | [P4-001](#p4-001) (`całość`) |
| [F4-062](FINDINGS.md#f4-062) | [P4-051](#p4-051) (`całość`) |
| [F4-063](FINDINGS.md#f4-063) | [P4-050](#p4-050) (`całość`) |
| [F4-064](FINDINGS.md#f4-064) | [P4-040](#p4-040) (`całość`) |
| [F4-065](FINDINGS.md#f4-065) | [P4-040](#p4-040) (`całość`) |
| [F4-066](FINDINGS.md#f4-066) | [P4-053](#p4-053) (`całość`) |
| [F4-067](FINDINGS.md#f4-067) | [P4-001](#p4-001) (`całość`) |
| [F4-068](FINDINGS.md#f4-068) | [P4-053](#p4-053) (`całość`) |
| [F4-069](FINDINGS.md#f4-069) | [P4-001](#p4-001) (`całość`) |
| [F4-070](FINDINGS.md#f4-070) | [P4-053](#p4-053) (`całość`) |
| [F4-071](FINDINGS.md#f4-071) | [P4-053](#p4-053) (`całość`) |
| [F4-072](FINDINGS.md#f4-072) | [P4-053](#p4-053) (`całość`) |
| [F4-073](FINDINGS.md#f4-073) | [P4-052](#p4-052) (`całość`) |
| [F4-074](FINDINGS.md#f4-074) | [P4-052](#p4-052) (`całość`) |
| [F4-075](FINDINGS.md#f4-075) | [P4-042](#p4-042) (`całość`) |
| [F4-076](FINDINGS.md#f4-076) | [P4-042](#p4-042) (`całość`) |
| [F4-077](FINDINGS.md#f4-077) | [P4-042](#p4-042) (`całość`) |
| [F4-078](FINDINGS.md#f4-078) | [P4-044](#p4-044) (`całość`) |
| [F4-079](FINDINGS.md#f4-079) | [P4-043](#p4-043) (`całość`) |
| [F4-080](FINDINGS.md#f4-080) | [P4-043](#p4-043) (`całość`) |
| [F4-081](FINDINGS.md#f4-081) | [P4-043](#p4-043) (`całość`) |
| [F4-082](FINDINGS.md#f4-082) | [P4-046](#p4-046) (`całość`) |
| [F4-083](FINDINGS.md#f4-083) | [P4-005](#p4-005) (`całość`) |
| [F4-084](FINDINGS.md#f4-084) | [P4-043](#p4-043) (`całość`) |
| [F4-085](FINDINGS.md#f4-085) | [P4-047](#p4-047) (`całość`) |
| [F4-086](FINDINGS.md#f4-086) | [P4-042](#p4-042) (`całość`) |
| [F4-087](FINDINGS.md#f4-087) | [P4-046](#p4-046) (`całość`) |
| [F4-088](FINDINGS.md#f4-088) | [P4-046](#p4-046) (`całość`) |
| [F4-089](FINDINGS.md#f4-089) | [P4-045](#p4-045) (`całość`) |
| [F4-090](FINDINGS.md#f4-090) | [P4-045](#p4-045) (`całość`) |
| [F4-091](FINDINGS.md#f4-091) | [P4-047](#p4-047) (`całość`) |
| [F4-092](FINDINGS.md#f4-092) | [P4-016](#p4-016) (`całość`) |
| [F4-093](FINDINGS.md#f4-093) | [P4-036](#p4-036) (`geste-plansze`); [P4-017](#p4-017) (`kampus-tour`); [P4-037](#p4-037) (`kontrolki-platformy`); [P4-014](#p4-014) (`panstwa-miasta`); [P4-039](#p4-039) (`sledzenie`); [P4-038](#p4-038) (`tort`) |
| [F4-094](FINDINGS.md#f4-094) | [P4-050](#p4-050) (`całość`) |
| [F4-095](FINDINGS.md#f4-095) | [P4-050](#p4-050) (`całość`) |
| [F4-096](FINDINGS.md#f4-096) | [P4-050](#p4-050) (`całość`) |
| [F4-097](FINDINGS.md#f4-097) | [P4-050](#p4-050) (`całość`) |
| [F4-098](FINDINGS.md#f4-098) | [P4-047](#p4-047) (`całość`) |
| [F4-099](FINDINGS.md#f4-099) | [P4-048](#p4-048) (`całość`) |
| [F4-100](FINDINGS.md#f4-100) | [P4-048](#p4-048) (`całość`) |
| [F4-101](FINDINGS.md#f4-101) | [P4-049](#p4-049) (`całość`) |
| [F4-102](FINDINGS.md#f4-102) | [P4-049](#p4-049) (`całość`) |
| [F4-103](FINDINGS.md#f4-103) | [P4-049](#p4-049) (`całość`) |
| [F4-104](FINDINGS.md#f4-104) | [P4-042](#p4-042) (`całość`) |
| [F4-105](FINDINGS.md#f4-105) | [P4-042](#p4-042) (`całość`) |
| [F4-106](FINDINGS.md#f4-106) | [P4-041](#p4-041) (`całość`) |
| [F4-107](FINDINGS.md#f4-107) | [P4-042](#p4-042) (`paski`); [P4-040](#p4-040) (`ruch-zadanie`); [P4-041](#p4-041) (`set-glow`) |
| [F4-108](FINDINGS.md#f4-108) | [P4-042](#p4-042) (`całość`) |
| [F4-109](FINDINGS.md#f4-109) | [P4-041](#p4-041) (`całość`) |
| [F4-110](FINDINGS.md#f4-110) | [P4-050](#p4-050) (`całość`) |
| [F4-111](FINDINGS.md#f4-111) | [P4-050](#p4-050) (`całość`) |
| [F4-112](FINDINGS.md#f4-112) | [P4-051](#p4-051) (`całość`) |
| [F4-113](FINDINGS.md#f4-113) | [P4-052](#p4-052) (`całość`) |
| [F4-114](FINDINGS.md#f4-114) | [P4-052](#p4-052) (`całość`) |
| [F4-115](FINDINGS.md#f4-115) | [P4-052](#p4-052) (`całość`) |
| [F4-116](FINDINGS.md#f4-116) | [P4-040](#p4-040) (`całość`) |
| [F4-117](FINDINGS.md#f4-117) | [P4-061](#p4-061) (`całość`) |
| [F4-118](FINDINGS.md#f4-118) | [P4-050](#p4-050) (`całość`) |
| [F4-119](FINDINGS.md#f4-119) | [P4-047](#p4-047) (`całość`) |
| [F4-120](FINDINGS.md#f4-120) | [P4-049](#p4-049) (`całość`) |
| [F4-121](FINDINGS.md#f4-121) | [P4-046](#p4-046) (`całość`) |
| [F4-122](FINDINGS.md#f4-122) | [P4-049](#p4-049) (`całość`) |
| [F4-123](FINDINGS.md#f4-123) | [P4-053](#p4-053) (`całość`) |
| [F4-124](FINDINGS.md#f4-124) | [P4-049](#p4-049) (`całość`) |
| [F4-125](FINDINGS.md#f4-125) | [P4-054](#p4-054) (`całość`) |
| [F4-126](FINDINGS.md#f4-126) | [P4-044](#p4-044) (`całość`) |
| [F4-127](FINDINGS.md#f4-127) | [P4-045](#p4-045) (`całość`) |
| [F4-128](FINDINGS.md#f4-128) | [P4-052](#p4-052) (`całość`) |
| [F4-129](FINDINGS.md#f4-129) | [P4-050](#p4-050) (`całość`) |
| [F4-130](FINDINGS.md#f4-130) | [P4-017](#p4-017) (`całość`) |
| [F4-131](FINDINGS.md#f4-131) | [P4-018](#p4-018) (`całość`) |
| [F4-132](FINDINGS.md#f4-132) | [P4-018](#p4-018) (`całość`) |
| [F4-133](FINDINGS.md#f4-133) | [P4-053](#p4-053) (`całość`) |
| [F4-134](FINDINGS.md#f4-134) | [P4-051](#p4-051) (`całość`) |
| [F4-135](FINDINGS.md#f4-135) | [P4-017](#p4-017) (`całość`) |
| [F4-136](FINDINGS.md#f4-136) | [P4-053](#p4-053) (`całość`) |
| [F4-137](FINDINGS.md#f4-137) | [P4-052](#p4-052) (`całość`) |
| [F4-138](FINDINGS.md#f4-138) | [P4-052](#p4-052) (`całość`) |
| [F4-139](FINDINGS.md#f4-139) | [P4-047](#p4-047) (`całość`) |
| [F4-140](FINDINGS.md#f4-140) | [P4-044](#p4-044) (`całość`) |
| [F4-141](FINDINGS.md#f4-141) | [P4-049](#p4-049) (`całość`) |
| [F4-142](FINDINGS.md#f4-142) | [P4-053](#p4-053) (`całość`) |
| [F4-143](FINDINGS.md#f4-143) | [P4-053](#p4-053) (`całość`) |
| [F4-144](FINDINGS.md#f4-144) | [P4-053](#p4-053) (`całość`) |
| [F4-145](FINDINGS.md#f4-145) | [P4-049](#p4-049) (`całość`) |
| [F4-146](FINDINGS.md#f4-146) | [P4-052](#p4-052) (`całość`) |
| [F4-147](FINDINGS.md#f4-147) | [P4-043](#p4-043) (`całość`) |
| [F4-148](FINDINGS.md#f4-148) | [P4-047](#p4-047) (`całość`) |
| [F4-149](FINDINGS.md#f4-149) | [P4-049](#p4-049) (`całość`) |
| [F4-150](FINDINGS.md#f4-150) | [P4-046](#p4-046) (`całość`) |
| [F4-151](FINDINGS.md#f4-151) | [P4-049](#p4-049) (`całość`) |
| [F4-152](FINDINGS.md#f4-152) | [P4-014](#p4-014) (`całość`) |
| [F4-153](FINDINGS.md#f4-153) | [P4-049](#p4-049) (`całość`) |
| [F4-154](FINDINGS.md#f4-154) | [P4-052](#p4-052) (`całość`) |
| [F4-155](FINDINGS.md#f4-155) | [P4-052](#p4-052) (`całość`) |
| [F4-156](FINDINGS.md#f4-156) | [P4-034](#p4-034) (`całość`) |
| [F4-157](FINDINGS.md#f4-157) | [P4-049](#p4-049) (`całość`) |
| [F4-158](FINDINGS.md#f4-158) | [H-015](#h-015) (`kubki`); [H-016](#h-016) (`simon`); [H-014](#h-014) (`w-pamieci`) |
| [F4-159](FINDINGS.md#f4-159) | [H-017](#h-017) (`wieza`); [H-018](#h-018) (`zakupy`) |
| [F4-160](FINDINGS.md#f4-160) | [H-019](#h-019) (`kampus-tour`); [H-022](#h-022) (`labirynt`); [H-024](#h-024) (`memory`); [H-023](#h-023) (`piec-w-rzedzie`); [H-025](#h-025) (`statki`) |
| [F4-161](FINDINGS.md#f4-161) | [P4-060](#p4-060) (`całość`) |
| [F4-162](FINDINGS.md#f4-162) | [P4-022](#p4-022) (`całość`) |
| [F4-163](FINDINGS.md#f4-163) | [H-020](#h-020) (`całość`) |
| [F4-164](FINDINGS.md#f4-164) | [H-021](#h-021) (`całość`) |
| [F4-165](FINDINGS.md#f4-165) | [H-021](#h-021) (`całość`) |
| [F4-166](FINDINGS.md#f4-166) | [P4-062](#p4-062) (`całość`) |
| [F4-167](FINDINGS.md#f4-167) | [H-026](#h-026) (`całość`) |
| [F4-168](FINDINGS.md#f4-168) | [H-027](#h-027) (`całość`) |

## 6. Kolejność i wspólne miejsca zmian

Kolejność topologiczna (warunki danych/urządzeń nadal obowiązują; wolno wziąć następny niezależny pakiet, jeśli poprzedni czeka na bramkę):

[P4-001](#p4-001) → [P4-027](#p4-027) → [P4-002](#p4-002) → [P4-003](#p4-003) → [P4-004](#p4-004) → [P4-005](#p4-005) → [P4-006](#p4-006) → [P4-011](#p4-011) → [P4-012](#p4-012) → [P4-013](#p4-013) → [P4-014](#p4-014) → [P4-015](#p4-015) → [P4-016](#p4-016) → [P4-017](#p4-017) → [P4-018](#p4-018) → [P4-023](#p4-023) → [P4-036](#p4-036) → [P4-007](#p4-007) → [P4-008](#p4-008) → [P4-009](#p4-009) → [P4-010](#p4-010) → [P4-019](#p4-019) → [P4-020](#p4-020) → [P4-021](#p4-021) → [P4-022](#p4-022) → [P4-024](#p4-024) → [P4-025](#p4-025) → [P4-026](#p4-026) → [P4-028](#p4-028) → [P4-029](#p4-029) → [P4-030](#p4-030) → [P4-031](#p4-031) → [P4-032](#p4-032) → [P4-033](#p4-033) → [P4-037](#p4-037) → [P4-038](#p4-038) → [P4-039](#p4-039) → [P4-040](#p4-040) → [P4-041](#p4-041) → [P4-042](#p4-042) → [P4-043](#p4-043) → [P4-044](#p4-044) → [P4-045](#p4-045) → [P4-046](#p4-046) → [P4-048](#p4-048) → [P4-050](#p4-050) → [P4-051](#p4-051) → [P4-052](#p4-052) → [P4-055](#p4-055) → [P4-056](#p4-056) → [P4-057](#p4-057) → [P4-058](#p4-058) → [P4-059](#p4-059) → [P4-060](#p4-060) → [P4-061](#p4-061) → [P4-062](#p4-062) → [P4-034](#p4-034) → [P4-035](#p4-035) → [P4-047](#p4-047) → [P4-049](#p4-049) → [P4-053](#p4-053) → [P4-054](#p4-054).

Priorytet nie wymusza wdrożenia P1 bez spełnienia zależności: P4-001 i P4-036 jako P2 mogą poprzedzić zależne P1, a P4-041 jako P3 poprzedza zmiany efektów. To zależności norm i wyborów, nie podniesienie ich wag. Przed zmianą odpowiedniej zasady zawsze jej test i dokument, nawet gdy ogólny pakiet brakujących testów jest później w kolejności.

| Wspólne miejsce | Konflikt i zasada wykonania |
|---|---|
| Game.tsx | P4-006 tylko nagłówek; P4-016 dolne akcje; P4-017 przekazanie scores/seated; P4-025 numeracja; P4-034 rejestr; P4-042 paski; P4-043 wibracja; P4-046 koniec/reconnect; P4-047 teksty; P4-049 liczby; P4-050 kolory; P4-051/052 dostępność i stany. Zmiany wykonywać sekwencyjnie na aktualnej bazie, nie przez podmianę całego komponentu. Po zmianie wysokości powtórzyć odbiór zależnej geometrii. |
| ui.tsx | P4-006 używa istniejących kropek; P4-016 StickyBar; P4-040 reduced; P4-042 paski/przejścia; P4-048 jedyny właściciel rozszerzenia Scores/RoundTable; P4-049 wyłącznie formaty/typografia; P4-050 style/odznaki; P4-051 etykiety. Nie tworzyć równoległych API tabel w pakietach gier. |
| index.css | P4-037 hitbox suwaka, P4-040 reduced, P4-041 katalog/komentarze, P4-042 czasy i przeniesienie pulse/ping, P4-043 shake użycie/wibracje bez nowej biblioteki, P4-050 kolory/btn-player, P4-051 color-scheme. Każdy zachowuje semantykę zadania z P4-040. |
| ZASADY / DESIGN | P4-001 zmienia tylko wspólne normy; wyjątki 360/48 i animacji mają właścicieli P4-014/016/036/040/041/042/043/044/050. Nie dopisywać tego samego wyjątku drugi raz ani utrzymywać równoległej tabeli tokenów. Wybór A jednej gry nie zatwierdza całej nowej reguły platformy. |
| ZASADY-GIER / KONCEPT | Limit/wynik/setup/timeout mają dokument w swoim pakiecie przed kodem. P4-054 poprawia wyłącznie odziedziczone błędne opisy i nie nadpisuje już zatwierdzonych nowych liczb. H nie zmienia reguły bez decyzji. |
| Testy zasad / index.test.ts | P4-029..032 domykają stare wskazane luki. Zmienianą regułę testuje wcześniej pakiet, który ją zmienia; nie przenosi regresji na koniec. P4-033 jest jedynym właścicielem rozszerzenia soloState, P4-002/024 komparatorów, P4-034 rejestru/nonce. |
| SQLite / stats.ts | G-DANE jest warunkiem, nie zleceniem migracji. P4-002/024/055..061 nie mogą niezależnie wprowadzać sprzecznych wersji score/tie. Brak nowych id, brak kasowania wyników i brak pobierania bazy z Pi. |
| Geometria a dotyk | P4-006 przed lokalnymi P4-007..011/013. P4-036 wybór wyjątku przed użyciem małych pól; P4-017 sprawdza 48 px po zoom, nie deklarację w scenie. P4-050 drugi sygnał nie może ponownie zwiększyć wysokości lub zasłonić celu po odbiorze geometrii. |

Wspólny plik oznacza potrzebę uzgodnienia kolejnych małych zmian, nie zgodę na jeden zbiorczy refaktor. Graf zależności kart jest acykliczny. Kolejność plików w tej tabeli nie dodaje ukrytych zależności do grafu; wskazuje konieczność powtórzenia właściwego odbioru po konflikcie.


## 7. Rejestr akceptacji 04-04 (chronologiczna historia)

2026-10-26, B4-001: użytkownik „Zatweirdzam” zaakceptował P4-005/006/012/013/016 w PK4-v1, według wariantów A wskazanych w DECISIONS §10, bez wyjątków. P4-013 zależy od P4-006, który jest w tej samej zaakceptowanej paczce. Wszystkie pozostałe zależności i odbiory zachowane. Zatwierdzenie nie jest implementacją ani zgodą na commit/push.

Historyczny zapis przed odpowiedzią na B4-002: P4-003/004/036 i zachowanie rekordów oczekiwały nowej odpowiedzi. Nie zmieniono zakresów kart ani przypisania właścicieli.


B4-002, 2026-10-26: użytkownik „Tak” zaakceptował P4-003/004/036 w PK4-v1 oraz zachowanie starych rekordów tylko Zakupów i Sekwencji, bez przeliczania/resetu. P4-003/004 mają nadal oczekującą decyzję norm P4-001; brak jej automatycznej akceptacji. Łącznie 8 zaakceptowanych zakresów, 54 propozycje, 27 H nadal otwarte. B4-003 włączono następnie do końcowej propozycji ZG4-v1, bez osobnego pytania.


2026-10-26, na prośbę „Zrób jedną końcową zgode”: [ZG4-v1](FINAL-APPROVAL.md) zbiera wszystkie pozostałe wybory. Nadal 8 pakietów zaakceptowanych i 54 oczekujące. §2 tego dokumentu podaje 62 wiersze, §3 jawne uzupełnienia kontraktów P4-002/024/027/039 i danych, §4 wszystkie 106 wariantów, §5 końcowe propozycje dla 27 H, §6 odstępstwa/MP-01. Doprecyzowania zastąpią bazowe propozycje wyłącznie po zgodzie. W szczególności bazowy skrót H-005 „B = zachować” jest sprzeczny z treścią D4-018:B; ZG4-v1 jawnie proponuje nowy wariant C, zachowujący obecny generator. Nie zmieniono historycznej zgody ani mapy właścicieli 295 części.


2026-10-26, **końcowa zgoda ZG4-v1**: użytkownik „Zatwierdzam”, całość bez wyjątków. Aktualny stan: 62 zatwierdzone pakiety, 27 końcowych H, 295/295 jednostek z decyzją, zero oczekujących wyborów. Wcześniejsze akapity §7 są historią kolejnych zgód. Wykonanie/odbiór: [PHASE-5-SCOPE.md](PHASE-5-SCOPE.md).

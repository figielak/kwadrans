# 04-02: warianty decyzji, v1

Data przygotowania: 2026-10-26. **Wszystkie 106 decyzji zamknięte** po końcowej zgodzie ZG4-v1: użytkownik „Zatwierdzam”, 2026-10-26. 62 pakiety zaakceptowane; 27 H pozostawione z powodami; 47 odstępstw rozstrzygnięte według ZG4-v1 §6; MP-01:B. Źródło zgody i granice w §14. To akceptacja planu, bez implementacji.

Źródła i dokładne wystąpienia: [FINDINGS.md](FINDINGS.md), [dowody i pomiary](04-02-EVIDENCE.md). F4 zbiorcze mają osobne decyzje per gra, gdy skutek wariantu jest inny. Jedna karta obejmuje wiele F4 tylko przy wspólnym wyborze reguły; nadal wolno zdecydować oddzielnie o wystąpieniu. Żaden wariant nie zmienia id gry.

## 1. Skutki danych i turnieju

Profile poniżej są częścią każdej karty. Wariant zachowujący obecne zachowanie nie zmienia danych. Profil dotyczy wariantu wprowadzającego zmianę, z dodatkowymi uwagami na karcie.

| Profil | Rekordy i dotychczasowe wyniki | Zapisany detail | Turniej i zależności |
|---|---|---|---|
| R0: prezentacja/metoda/testy | Ta sama liczba i komparator; bez przeliczania historii | Czytać stary stan; nowe wymagane pola UI mają fallback | Punkty bez zmian; zmiana sposobu dostępu do akcji może pośrednio poprawić wynik, ale nie zmienia wzoru |
| R1: limit/oddanie | Jednostka zostaje; dłuższy czas lub zachowanie wyniku daje nowe możliwości, stare wyniki z timeoutu mogły utracić postęp | Stary detail nie ma nieprzesłanego postępu; nie można go odzyskać | Wynik rywala nie przesuwa terminu po D4-012; zachowanie ostatniego wyniku zmienia places i punkty w przyszłych partiach |
| R2: trudność/pomiar/wzór w tej samej jednostce | Liczby pozostają czytelne, ale zmienia się rozkład szans lub metoda pomiaru; historyczne rekordy mogą dawać przewagę starej wersji | Nie regenerować dawnego wyzwania nowym setup; renderować zapisany stan; przeliczenie tylko jeśli zachowano dane | W obrębie partii wyzwanie pozostaje wspólne; inne remisy i miejsca możliwe po zmianie |
| R3: nowa jednostka | Starych ms nie wolno porównywać z promilami; potrzebna osobno zaakceptowana wersja rekordów/archiwum przy stałym id | Odczyt starszej jednostki musi być wersjonowany; detail nie zastępuje brakującej historii | places musi używać nowej jednostki; punktacja turnieju nie zmienia wzoru |
| R4: nowe tie/porządek ukończenia | Zmienia komparator, stare wiersze mogą nie mieć znacznika lub dokładności; null nie jest zerem ani dowodem ukończenia | Zachowany jest detail tylko lidera gry, więc nie odtworzymy wszystkich tie ani statusów; sam score może być niejednoznaczny | Jeden komparator dla miejsc, zwycięzcy, record i places; decyzja o reprezentacji danych przed wdrożeniem |
| R5: zasady gry głównej/serii | Zmienia szanse przyszłych wygranych; nie przeliczać dotychczasowego rankingu wygranych | Brak migracji trwających pokoi w tym etapie; zapisane rekordowe mini-gry niezależne, chyba że karta mówi inaczej | Zmienione zasady obowiązują nowe partie; punkty serii tylko jeśli gra/powiązanie tego wymaga |

**Brama danych:** jeżeli wybrany wariant wymaga migracji, wersji formatu, archiwizacji lub czyszczenia bazy, 04-03 musi oznaczyć osobny zakres do decyzji użytkownika. Nie wykonujemy ani nie zatwierdzamy go w 04-02. Zachowanie starych liczb i „migracja niepotrzebna” to różne twierdzenia; zmiana trudności nadal wymaga decyzji o porównywalności. Nowy klucz przechowywania nie oznacza nowego id gry. Żadnych nowych zależności.

## 2. Karty decyzji

<a id="d4-001"></a>

### D4-001. Schulte: wynik po limicie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-001](FINDINGS.md#f4-001).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Oznaczyć niedokończoną partię i ustawiać ją za każdym wynikiem ukończonym, również z karą ponad 180 s.
- B: Ograniczyć wynik z karą do 180 s; ukończone gorsze wyniki zrównają się z timeoutem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ukończenie powinno wyprzedzać brak ukończenia.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Tabela Schultego; ZASADY §3.
- Zależności i warunek przygotowania poprawki: Osobna decyzja o reprezentacji timeoutu w rekordach; liczba ms sama nie gwarantuje porządku.

<a id="d4-002"></a>

### D4-002. Sudoku: wynik po limicie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-001](FINDINGS.md#f4-001).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dodać jawny znacznik nieukończenia i sortować takie partie po ukończonych, także ponad 120 s z karami.
- B: Ograniczyć wynik z karą do 120 s i opisać remis z timeoutem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować wartość ukończenia i pełną karę.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Sudoku; ZASADY §3.
- Zależności i warunek przygotowania poprawki: Stare dane nie mają znacznika; nie rozpoznawać timeoutu tylko po wartości 120000.

<a id="d4-003"></a>

### D4-003. Policz kropki: najgorsza odpowiedź po limicie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-001](FINDINGS.md#f4-001).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Liczyć w każdej rundzie max(n, 99-n), zamiast odpowiedzi 0.
- B: Zostawić same zera jako jawne odstępstwo, dopuszczając wygraną timeoutu nad błędną odpowiedzią.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ten sam wzór najgorszego błędu co w Kącie.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Policz kropki; ZASADY §3.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-004"></a>

### D4-004. Sekwencja: co zachować po 300 s

- Status: **zatwierdzona: poprawić, wariant A** (2026-10-26, B4-002, R4-v1/PK4-v1). Źródło: odpowiedź użytkownika „Tak” na pytanie o B4-002 wraz z zachowaniem rekordów Zakupów i Sekwencji. Powiązanie: [F4-002](FINDINGS.md#f4-002). Potwierdzone w ZG4-v1; brak zmiany zakresu.
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zachować limit 300 s, wysyłać zaliczoną serię jako progress i po limicie oddawać ostatnią zaliczoną serię.
- B: Wydłużyć limit do 600 s, nadal zwracać 0 po limicie; jawnie opisać, że limit nadal może uciąć długą serię.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: częściowy wynik zamiast utraty całej partii; serwer waliduje postęp w modelu zaufania mini-gier.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Sekwencja (odstępstwo timeoutu i T(N)); KONCEPT §2.4 i §3; ZASADY §3.
- Zależności i warunek przygotowania poprawki: P09; D4-032. Sekwencja ma bufor 100 kolorów: jest skończona, ale brak użytecznego maksimum czasu decyzji bez limitu. T(N)≈N+(0,6+d)·N(N+1)/2 (1 s przerw na serię w modelu F3); d jest modelem.

<a id="d4-005"></a>

### D4-005. Wspólny zapas limitu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Przyjąć L >= max(1,2·T, T+10 s), z jawnym modelem T i oddzielnymi czasami stałymi oraz ludzkimi.
- B: Zostawić „najdłuższa uczciwa partia plus zapas”; uzasadniać każdą wartość indywidualnie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A jako proponowana reguła do decyzji; 20% i 10 s dotąd nie zatwierdzono.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §3.
- Zależności i warunek przygotowania poprawki: Nie używać modelu 5 s na celowanie jako pomiaru. Samo przyjęcie wzoru nie zatwierdza żadnego limitu.

<a id="d4-006"></a>

### D4-006. Zakupy: limit platformy i automatyczne oddanie

- Status: **zatwierdzona: poprawić, wariant A** (2026-10-26, B4-002, R4-v1/PK4-v1). Źródło: odpowiedź użytkownika „Tak” na pytanie o B4-002 wraz z zachowaniem rekordów Zakupów i Sekwencji. Powiązanie: [F4-002](FINDINGS.md#f4-002). Potwierdzone w ZG4-v1; brak zmiany zakresu.
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Podnieść limit do 80 s i automatycznie wywołać oddanie po MAX_MS, zachowując zaznaczenia.
- B: Zostawić 60 s platformy i skrócić dopuszczalny czas wybierania tak, aby pokaz i odsłona mieściły się z zapasem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: pełny przewidziany czas wyboru; obecne T=63 s jest wyliczeniem, nie opinią.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Zakupy; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: D4-005, D4-050; wynik po MAX_MS musi być tym samym ruchem co ręczne oddanie.

<a id="d4-007"></a>

### D4-007. Środek: czas starannego celowania

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Podnieść limit do 90 s, zachowując rundy i punktację.
- B: Zachować 60 s i wrócić po pomiarach P14.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P14; model T=63 s przy 5 s na rundę nie dowodzi czasu człowieka.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Środek; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: D4-005; P14.

<a id="d4-008"></a>

### D4-008. Tort: czas przesuwania cięć

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Podnieść limit do 180 s, zachowując 5 tortów i wynik.
- B: Zachować 120 s i wrócić po pomiarach P14.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P14; T=120,5 s to model 5 s na cięcie.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Tort; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: D4-005; P14.

<a id="d4-009"></a>

### D4-009. Śledzenie: zapas na 20 rund

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Podnieść limit z 300 do 360 s.
- B: Zachować 300 s jako świadome ograniczenie czasu wskazywania, opisane w zasadach.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: przy modelu T=287 s zapas rośnie z 13 do 73 s.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Śledzenie; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: D4-005; liczby dotyczą modelu, nie pomiaru człowieka.

<a id="d4-010"></a>

### D4-010. Państwa-miasta: czas głosowania

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Ustalać 20+7·(n-1) s, czyli 27/41/55 s przy 2/4/6 osobach.
- B: Zachować 45 s dla wszystkich konfiguracji.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P08; pomiar przy 6 osobach przed zmianą, bo A skraca czas małych grup.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Państwa-miasta.
- Zależności i warunek przygotowania poprawki: P08; limit rozpatrywać po decyzji o czytelności tabeli D4-061.

<a id="d4-011"></a>

### D4-011. Który rok?: zapas na sieć

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-002](FINDINGS.md#f4-002).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Podnieść limit platformy do 270 s przy twardym czasie klienta 228 s.
- B: Zachować 240 s i opisać 12 s jako zapas wyłącznie na komunikację.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A przy przyjęciu D4-005; B jest możliwym odstępstwem od nowego progu.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Który rok?; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: D4-005.

<a id="d4-012"></a>

### D4-012. Mini-gry: jeden termin niezależny od rywala

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-162](FINDINGS.md#f4-162).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Jeden termin od startu ostatniego gracza, bez odnawiania po wyniku innego; Koło także bez odnowienia po zakończeniu prób rywala.
- B: Zachować odnawianie w 23 grach i opisać różnicę wobec 7 ze stałym key.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ten sam budżet solo i w grupie.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: KONCEPT §3; ZASADY §3.
- Zależności i warunek przygotowania poprawki: Najpierw rozstrzygnąć D4-004 i D4-006..011; inaczej usunięcie odnowień ujawni zbyt krótkie limity.

<a id="d4-013"></a>

### D4-013. Stoper: porównywalny cel

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Stały cel 10 s i nadal wynik w ms.
- B: Zachować losowanie 6-14 s, wynik jako całkowite promile celu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować czytelną jednostkę i ograniczyć zmianę kontraktu.
- Skutki rekordów / detail / turnieju: **R2; B dodatkowo R3** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Stoper; KONCEPT §2.4; ZASADY §3.
- Zależności i warunek przygotowania poprawki: A zmienia trudność dawnych rekordów; B zmienia jednostkę i wymaga osobno zatwierdzonego sposobu przechowania historii.

<a id="d4-014"></a>

### D4-014. Rytm: porównywalne tempo

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Stałe tempo 100 BPM i odchyłka w ms.
- B: Zachować losowane tempo, liczyć błąd w promilach odstępu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: stałe tempo bez zmiany jednostki.
- Skutki rekordów / detail / turnieju: **R2; B dodatkowo R3** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Rytm; KONCEPT §2.4; ZASADY §3.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-015"></a>

### D4-015. Liczenie: cztery rodzaje działań

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Losować rodzaje potasowanymi czwórkami, po jednym rodzaju w każdej.
- B: Zachować niezależne losowanie i zmienić w dokumencie „po równo” na „losowo”.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zbliżyć kod do istniejącej reguły, nie zwiększać losowości.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Liczenie.
- Zależności i warunek przygotowania poprawki: Odrębny test rozkładu oraz walidacji liczb; F4-046.

<a id="d4-016"></a>

### D4-016. Obrót: komplet sześciu rodzajów

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Tasować komplety 90/180/270 stopni × ta sama/lustro.
- B: Zachować niezależne losowanie jako jawny wariant trudności.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ta sama proporcja trudnych przypadków.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Obrót.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-017"></a>

### D4-017. Odcień: pasma barw

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zachować 5 rund: wybrać 5 z 6 sektorów barwy bez powtórzeń (0-59, 60-119, 120-179, 180-239, 240-299, 300-359), nasycenie naprzemiennie 25-62/63-100, jasność 30-64/65-100; kolejność pasm tasowana.
- B: Zachować obecny generator 5 barw i najpierw ocenić proponowane pasma w symulacji czułości.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do próby generatora: A jest konkretną propozycją pasm, ale nie ma dowodu, że wyrównuje czułość. Nie zwiększać liczby rund z 5 do 6.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Odcień.
- Zależności i warunek przygotowania poprawki: Alternatywa ze źródła „losowanie do skutku w medianie ±5%” wymaga dopiero definicji metryki, docelowej mediany, limitu prób i fallbacku; nie jest gotowym wariantem do wdrożenia.

<a id="d4-018"></a>

### D4-018. Dziesiątki: liczba dostępnych par

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant C** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Tasować stałe komplety cyfr w dostawach, zachować wybór gracza i gwarancję co najmniej jednej pary.
- B: Generator po każdym ruchu ma utrzymywać dokładnie 2 dostępne pary.
- C (ZG4-v1): Zachować dokładnie obecny generator, gwarancję co najmniej jednej pary i wpływ wyborów gracza; bez nowego tasowania dostaw i bez wymogu dokładnie dwóch par.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A po P19; B silnie zmienia strategię i może wymagać przebudowy generatora.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Dziesiątki.
- Zależności i warunek przygotowania poprawki: P19; stałe dostawy nie gwarantują identycznej planszy po różnych wyborach, F1:O13 zostaje jawne.

<a id="d4-019"></a>

### D4-019. Sudoku: miara trudności planszy

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Generator ma wybierać planszę z 3 falami rozwiązywania i 3 polami jednoznacznymi na starcie, z limitem prób i gotowym fallbackiem.
- B: Zachować obecny generator, jawnie opisać rozrzut 1-7 pól i 2-5 fal.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do weryfikacji, czy warunek A ma wystarczająco dużo plansz; liczba fal jest tylko przybliżeniem trudności.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Sudoku.
- Zależności i warunek przygotowania poprawki: Oddzielna walidacja generatora przed implementacją A; D4-002.

<a id="d4-020"></a>

### D4-020. Kąt: równe pasma wielkości

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Po dwa kąty z pasm 5-38, 39-72, 73-106, 107-140, 141-175 stopni, kolejność tasowana.
- B: Zachować niezależne losowanie każdego kąta.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P15; wpływu wielkości kąta na błąd ludzi jeszcze nie zmierzono.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kąt.
- Zależności i warunek przygotowania poprawki: P15.

<a id="d4-021"></a>

### D4-021. Śledzenie: mijanki kulek

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Przyjmować rundy w paśmie mediana mijanek ±20%, z limitem prób i fallbackiem.
- B: Zachować obecny generator i jawnie opisać rozrzut mijanek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do pomiaru wpływu mijanek na wynik ludzi; nie uznawać liczby mijanek za gotową miarę trudności.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Śledzenie.
- Zależności i warunek przygotowania poprawki: Przed A ustalić liczenie mijanek i koszt setup; D4-009 pozostaje niezależne.

<a id="d4-022"></a>

### D4-022. W pamięci: rozkład mnożeń

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: W każdej rundzie stała liczba mnożeń floor(liczba działań/3), miejsca tasowane, pozostałe + i minus.
- B: Zachować obecne osobne losowanie działań.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: jednakowa liczba mnożeń dla danego numeru rundy; zastrzec weryfikację wpływu w P11.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §W pamięci.
- Zależności i warunek przygotowania poprawki: P11; D4-030. Losowanie liczb nadal może zmieniać trudność.

<a id="d4-023"></a>

### D4-023. Stój!: rozkład czerwonych bodźców

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Tasować czerwone osobno w każdej tercji harmonogramu przy stałej liczbie w tercji.
- B: Zachować obecne losowanie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P18; obecny wpływ to hipoteza.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Stój!.
- Zależności i warunek przygotowania poprawki: P18.

<a id="d4-024"></a>

### D4-024. Za zasłoną: czas widoczny

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wyrównać sumę widoczności przez withSum do 11200 ms, bez zmiany sumy czasu ukrytego.
- B: Zachować obecne losowanie czasu widocznego.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P17; nie wykazano wpływu krótkiej widoczności u ludzi.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Za zasłoną.
- Zależności i warunek przygotowania poprawki: P17.

<a id="d4-025"></a>

### D4-025. Literówka: komplety rodzajów błędu

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Oznaczyć rodzaj błędu w danych i tasować trójki ó/u, rz/ż, ch/h.
- B: Zachować losowanie całej puli.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P16; A wymaga też oceny dostępności i równowagi słów w każdej kategorii.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Literówka.
- Zależności i warunek przygotowania poprawki: P16; dodatkowy zakres opisu danych, bez nowych zależności.

<a id="d4-026"></a>

### D4-026. Który rok?: działy pytań

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dodać pole dział i losować równe, jawnie opisane liczby pytań z działów.
- B: Zachować wspólną pulę i zebrać wyniki według epoki oraz działu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P22; komentarze w danych nie są jeszcze taksonomią do wdrożenia.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Który rok?.
- Zależności i warunek przygotowania poprawki: P22; wariant A wymaga osobnej akceptacji liczby działów i kwot po klasyfikacji puli.

<a id="d4-027"></a>

### D4-027. Trzy kubki: udział zamian z kulką

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-003](FINDINGS.md#f4-003).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Utrzymywać stałą liczbę zamian z kulką w danej rundzie.
- B: Zachować obecne losowanie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: niski rozrzut i brak dowodu korzyści u ludzi; nie zmieniać tylko na podstawie metryki generatora.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Trzy kubki.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-028"></a>

### D4-028. Balon: komplet wytrzymałości

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-161](FINDINGS.md#f4-161).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Tasować stały komplet 10 wytrzymałości o sumie 155, np. 11,12,13,14,15,16,17,18,19,20.
- B: Zachować withSum z różnymi rozkładami jako świadomą część ryzyka.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ten sam komplet okazji dla strategii „stop”; sprawdzić zgodność zakresów walidatora przed wdrożeniem.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Balon; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: D4-029; suma 155 nie dowodzi identycznych szans przy różnych rozkładach.

<a id="d4-029"></a>

### D4-029. Reguła stałego kompletu w grach ryzyka

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-161](FINDINGS.md#f4-161).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopisać, że decyzja stop wymaga stałego kompletu celów; withSum wystarcza dopiero po uzasadnieniu wpływu rozkładu.
- B: Zachować literalnie tylko warunek stałej sumy.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A jako nowa reguła projektowa, z Tortem jako przykładem kompletu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §3.
- Zależności i warunek przygotowania poprawki: Nie przenosić automatycznie kompletu Balonu do Przytrzymaj i Zasłony; brak dowodu takiej potrzeby.

<a id="d4-030"></a>

### D4-030. W pamięci: remis przy 12 rundach

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-158](FINDINGS.md#f4-158).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zostawić 12 rund, dla kompletu tie = czas odpowiedzi ostatniej rundy; dla błędu nadal odchyłka odpowiedzi, przy czym warunki porównuje jeden komparator.
- B: Zostawić obecny remis pełnych wyników i wcześniejszy rekord przy pełnej równości.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P11; A wymaga przechowywania nowej miary i jawnego rozróżnienia dwóch znaczeń tie.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §W pamięci; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: P11; D4-022 i D4-035. Wydłużenie do 20 rund jest dodatkową alternatywą wymagającą nowego limitu (model ok. 560 s), nie częścią A.

<a id="d4-031"></a>

### D4-031. Trzy kubki: remis na 20 rundach

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-158](FINDINGS.md#f4-158).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dla kompletu tie = suma czasów wskazania; dla niekompletu czas wskazania ostatniej rundy.
- B: Zachować remis równych wyników i wcześniejszy rekord przy pełnej równości.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P10; szybkość wskazania nie musi odpowiadać umiejętności śledzenia.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Trzy kubki; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: P10; D4-035. Zwiększanie liczby rund to osobna zmiana czasu partii.

<a id="d4-032"></a>

### D4-032. Sekwencja: równa długość serii

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-158](FINDINGS.md#f4-158).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Tie = czas wpisywania ostatniej zaliczonej serii, krócej lepiej.
- B: Zachować remis długości; data jedynie porządkuje całkiem równe rekordy, nie wybiera zwycięzcy partii.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P09; oddzielić problem utraty wyniku od dokładania szybkości jako celu.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Sekwencja; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: P09; D4-004.

<a id="d4-033"></a>

### D4-033. Wieża: osiągalność 30 pięter

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-159](FINDINGS.md#f4-159).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zwiększyć limit do 50 pięter, zachowując prędkość i tie szerokości; ponownie sprawdzić czas najdłuższej partii.
- B: Zachować 30 pięter oraz szerokość jako kryterium precyzji.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P13; σ=20 ms w symulacji nie jest zmierzonym graczem.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Wieża; KONCEPT §2.4 i §3.
- Zależności i warunek przygotowania poprawki: P13; D4-035; przed A ponowić symulację i wyliczyć limit, model 50×3 s to założenie.

<a id="d4-034"></a>

### D4-034. Zakupy: sufit 10 punktów

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-159](FINDINGS.md#f4-159).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zwiększyć listę do 12 pozycji przy półce 20; przeliczyć czas pokazu i limit.
- B: Zachować 10 pozycji i czas jako tie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P12; najpierw naprawić pomiar i limit, nie utrudniać gry na podstawie założenia o częstych kompletach.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Zakupy; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: P12; D4-006, D4-050.

<a id="d4-035"></a>

### D4-035. Wspólna reguła osiągalnego sufitu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-158](FINDINGS.md#f4-158), [F4-159](FINDINGS.md#f4-159).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wymagać tie rozróżniającego komplet lub uzasadnionego braku sufitu.
- B: Dopuszczać świadomy remis przy komplecie, z opisem w zasadach i wspólnym komparatorem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: remis może być uczciwym wynikiem; nie wymuszać nowej umiejętności szybkości w każdej grze.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §3.
- Zależności i warunek przygotowania poprawki: Decyzje per gra D4-030..034 pozostają osobne; ewentualne A nie wybiera ich wariantu.

<a id="d4-036"></a>

### D4-036. Kampus Tour: Juwenalia po wykupie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-023](FINDINGS.md#f4-023).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zostają na polu wraz z budynkami, dopisać regułę i test.
- B: Usunąć Juwenalia przy zmianie właściciela.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować działanie i jasno opisać skutek wykupu; dotychczasowy wpływ rzadki w botach.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Wykupienie.
- Zależności i warunek przygotowania poprawki: Nie mylić z powrotem do banku: tam Juwenalia już znikają.

<a id="d4-037"></a>

### D4-037. Kampus Tour: budynki po utracie kompletu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-030](FINDINGS.md#f4-030).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zostawić poziomy 3-4; komplet wymagany tylko przy budowie.
- B: Obniżać budynki do poziomu 2 i oddawać koszt utraconych poziomów z banku.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: brak niszczenia inwestycji, dopisać rozróżnienie budowy i utrzymania.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Budowa.
- Zależności i warunek przygotowania poprawki: B zmienia ekonomię i wymaga testów każdego sposobu utraty kompletu; nie dopisywać jej jako poprawki opisu.

<a id="d4-038"></a>

### D4-038. Kampus Tour: premia za miejsce

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-160](FINDINGS.md#f4-160).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zmniejszyć premię z 20 do 10 zł za dalsze miejsce.
- B: Zostawić 20 zł i zebrać partie z rotacją miejsc.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P01; boty nie wystarczają do zmiany ekonomii.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Start; KONCEPT §9.
- Zależności i warunek przygotowania poprawki: P01; F1:O14.

<a id="d4-039"></a>

### D4-039. Kampus Tour: Bilet MPK

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-163](FINDINGS.md#f4-163).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Jazda kosztuje 15 zł, poza kosztem pola; przed ruchem sprawdzać posiadanie pieniędzy.
- B: Zostawić darmową jazdę bez kieszonkowego.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P02; 30-38% kompletów od MPK pochodzi z botów.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Pola specjalne; KONCEPT §9.
- Zależności i warunek przygotowania poprawki: P02; A wymaga rozstrzygnięcia zachowania bez 15 zł, rekomendacja: wtedy tylko zwykły rzut.

<a id="d4-040"></a>

### D4-040. Kampus Tour: monopol z grupami dwupolowymi

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-164](FINDINGS.md#f4-164).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Liczyć do monopolu wyłącznie trzy grupy trzypolowe.
- B: Zostawić trzy dowolne pełne grupy kolorów.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: monopol rzadki w symulacji; wrócić po P04, nie zapisywać obserwacji bota jako wyniku partii.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Koniec; KONCEPT §9.
- Zależności i warunek przygotowania poprawki: P04.

<a id="d4-041"></a>

### D4-041. Kampus Tour: długość partii

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-165](FINDINGS.md#f4-165).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zmniejszyć liczbę rund z 20 do 18.
- B: Zachować 20 rund i zmierzyć pełne partie zegarem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P03; same animacje nie dowodzą przekroczenia 45 min.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Koniec; KONCEPT §2.1.
- Zależności i warunek przygotowania poprawki: P03; D4-051 (czas marszu).

<a id="d4-042"></a>

### D4-042. Labirynt: najlepszy krok po limicie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-160](FINDINGS.md#f4-160).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wybierać przez rng losowy dozwolony krok pionkiem; pass tylko gdy brak kroku.
- B: Zachować najlepszy krok do celu jako jawne odstępstwo, opisując możliwość wygranej bez aktywnych ruchów.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: brak automatycznej optymalnej strategii za nieobecnego gracza; nie losować ścian zużywających zasób.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Labirynt; ZASADY §3.
- Zależności i warunek przygotowania poprawki: F1:O04 (nie nowy błąd F4); A wprowadza losowość, więc usunąć zdanie „losowości nie ma” i przetestować seedy.

<a id="d4-043"></a>

### D4-043. Labirynt: kolejność przy 3-4 graczach

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-160](FINDINGS.md#f4-160).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Pierwszy i drugi dostają po 1 dodatkowej ściance; kolejność startu zostaje.
- B: Zachować obecne pule i rotację przy rewanżu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P06; przewaga ostatniego u botów nie dowodzi tej samej przewagi u ludzi.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Labirynt.
- Zależności i warunek przygotowania poprawki: P06; zmiana zaczynającego przez losowanie wymagałaby osobnego odstępstwa od ZASADY §3, nie jest dorozumianą poprawką.

<a id="d4-044"></a>

### D4-044. Gomoku: przewaga zaczynającego

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-160](FINDINGS.md#f4-160).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Po pierwszych trzech kamieniach drugi gracz może zamienić kolory.
- B: Zachować rotację miejsc bez dodatkowej fazy.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P05; A to nowy element zasad wymagający kompletnego opisu fazy, nie drobna korekta.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Gomoku; KONCEPT §2.
- Zależności i warunek przygotowania poprawki: P05.

<a id="d4-045"></a>

### D4-045. Memory: start przy 3+ graczach

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-160](FINDINGS.md#f4-160).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: W Małej zaczyna losowy gracz; jawny wyjątek od startu players[0].
- B: Zachować start pierwszego i rotację miejsc.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P07; pełna pamięć bota to odmienna strategia od człowieka.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Memory; ZASADY §3.
- Zależności i warunek przygotowania poprawki: P07.

<a id="d4-046"></a>

### D4-046. Państwa-miasta: litera Ł

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-166](FINDINGS.md#f4-166).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Usunąć Ł z puli liter.
- B: Zachować Ł i wyjaśnić, że runda może nie dawać państwa.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: usunąć systemowo słabszą kategorię w tej rundzie.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Państwa-miasta; KONCEPT §2.5.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-047"></a>

### D4-047. Kalambury: punkty rysującego przy 2 osobach

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-167](FINDINGS.md#f4-167).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dawać rysującemu 5 zamiast 3 punktów za trafienie przy 2 osobach.
- B: Zostawić 3 punkty niezależnie od liczby graczy.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B do P20; nie wnioskować o zabawie z samej proporcji punktów.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kalambury.
- Zależności i warunek przygotowania poprawki: P20.

<a id="d4-048"></a>

### D4-048. Turniej: domyślna liczba gier

- Status: **zatwierdzona: zostawić jako odstępstwo z powodem; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-168](FINDINGS.md#f4-168).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Domyślnie 9 zamiast 8 gier, dalej dopuszczać dowolną liczbę w zakresie.
- B: Zostawić domyślnie 8.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: parzystość sama nie dowodzi problemu; w grze wieloosobowej nieparzysta liczba również nie wyklucza remisu.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: KONCEPT §2.6; ZASADY-GIER §Turniej.
- Zależności i warunek przygotowania poprawki: Dane o rzeczywistej częstości dogrywek przed zmianą.

<a id="d4-049"></a>

### D4-049. Dokładność zegara i zależność od telefonu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-117](FINDINGS.md#f4-117).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Stosować e.timeStamp dla wejścia, odniesienie bodźca z rAF spójne z zegarem renderowania; opisać zależność od telefonu.
- B: Zachować bieżący zegar z opisu zdarzenia i tylko udokumentować ograniczenie sprzętu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A po pomiarze U14: rAF jest znacznikiem przed prezentacją klatki, nie pomiarem chwili emisji piksela; nie obiecywać usunięcia opóźnienia dotyku.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Refleks i §Stój!; ZASADY §5.
- Zależności i warunek przygotowania poprawki: U14; dla Stopera i Wieży osobno zweryfikować, czy zmiana odniesienia ma znaczenie; nie kalibrować na podstawie emulacji.

<a id="d4-050"></a>

### D4-050. Zakupy: chwila zatwierdzenia

- Status: **zatwierdzona: poprawić, wariant A** (2026-10-26, B4-002, R4-v1/PK4-v1). Źródło: odpowiedź użytkownika „Tak” na pytanie o B4-002 wraz z zachowaniem rekordów Zakupów i Sekwencji. Powiązanie: [F4-059](FINDINGS.md#f4-059). Potwierdzone w ZG4-v1; brak zmiany zakresu.
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Kończyć pomiar na pointerdown; click tylko dla klawiatury z detail=0, bez drugiego wysłania.
- B: Zachować click i jawnie liczyć czas puszczenia palca.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: spójny pomiar z pola wyboru i z wymaganiem onPointerDown.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Zakupy (chwila zatwierdzenia); ZASADY §4.
- Zależności i warunek przygotowania poprawki: D4-006; także test dostępności klawiaturą i pojedynczego oddania.

<a id="d4-051"></a>

### D4-051. Kampus Tour: akcja podczas marszu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-057](FINDINGS.md#f4-057).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dotknięcie pomija animację do stanu docelowego, a wybór wykonuje się względem stanu serwera; akcje dostępne w trakcie.
- B: Dopuścić blokadę do 3340 ms po rzucie jako wyjątek przy nadal biegnącym limicie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: limit nie zabiera czasu na decyzję wskutek ozdobnego marszu; sprawdzić brak przypadkowego wyboru pola.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY §5; ZASADY-GIER §Kampus Tour/Ekran.
- Zależności i warunek przygotowania poprawki: D4-058; B wymaga jawnego uzasadnienia i odbioru, nie jest zatwierdzone przez zapas limitu.

<a id="d4-052"></a>

### D4-052. Chińczyk: akcja podczas animacji

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-057](FINDINGS.md#f4-057).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Pozwolić dotknięciem zakończyć animację i wybierać pionek ze stanu docelowego.
- B: Dopuścić blokadę 700+6×180 ms, w Szybkim 400+6×110 ms, jako jawny wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zwłaszcza przy 20 s w Szybkim; nie zmieniać stanów serwera na potrzeby animacji.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY §5; ZASADY-GIER §Chińczyk.
- Zależności i warunek przygotowania poprawki: Sprawdzić kolejne rzuty i zbicie podczas przerwanej animacji.

<a id="d4-053"></a>

### D4-053. Reduced motion a ruch będący zadaniem

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-065](FINDINGS.md#f4-065), [F4-107](FINDINGS.md#f4-107).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopuścić ruch kulek/kubków/klocka w Śledzeniu, Kubkach, Wieży i Zasłonie przy reduced motion; wyłączać dekoracje, zachować identyczny zegar zadania.
- B: Zatrzymywać także ten ruch, co wymaga osobnego wariantu zadania i oceny rekordów.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ruch jest informacją potrzebną do gry; dopisać wyjątek oraz komentarze w Śledzeniu i Wieży.
- Skutki rekordów / detail / turnieju: **R0; B dodatkowo R2** według §1.
- Dokumentacja po wyborze: ZASADY §5; sekcje odpowiednich gier w ZASADY-GIER.
- Zależności i warunek przygotowania poprawki: U13; F2:O24; nie rozciągać wyjątku na wszystkie animacje JS.

<a id="d4-054"></a>

### D4-054. Reduced motion: widoczny werdykt i podgląd

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-064](FINDINGS.md#f4-064), [F4-116](FINDINGS.md#f4-116).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Bazowa klatka Preview i liczba float-up pozostają widoczne bez przesunięcia; po krótkim czasie usuwa je logika, nie opacity końcowego keyframe.
- B: Przy reduced motion zastąpić podgląd i float-up stałym tekstem w istniejącym polu statusu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować ten sam komunikat, poprawić stany bazowe.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: U14; nie mierzy płynności ani percepcji na urządzeniu.

<a id="d4-055"></a>

### D4-055. 360×640: aktywna plansza i nagłówek

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-056](FINDINGS.md#f4-056).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zmniejszyć wspólny nagłówek i dopasować plansze oraz akcje do pozostałej wysokości, bez ukrywania gry pod StickyBar.
- B: Dopuścić pionowe przewijanie plansz gier głównych jako odstępstwo.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: aktywna plansza i podstawowa akcja powinny być widoczne jednocześnie; pomiary E01-E07, E09 i E11.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: D4-059/060 (48 px); skalowanie nie może stworzyć nowych zbyt małych celów.

<a id="d4-056"></a>

### D4-056. Formularze i klawiatura ekranowa

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-056](FINDINGS.md#f4-056), [F4-069](FINDINGS.md#f4-069).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopuścić pionowe przewijanie formularzy Państw-miast oraz list poza partią; akcja w StickyBar, pole nie znika pod klawiaturą.
- B: Wymagać całego formularza bez przewijania także z klawiaturą.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A dla formularzy; w Szacowaniu i W pamięci zapewnić dolną granicę pola lub formularz poza kurczącym się kaflem dopiero po Androidzie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: U02; viewport bez klawiatury nie dowodzi jej zachowania.

<a id="d4-057"></a>

### D4-057. Podsumowania: przewijanie i dolne akcje

- Status: **zatwierdzona: poprawić, wariant A** (2026-10-26, B4-001, R4-v1/PK4-v1). Źródło: odpowiedź użytkownika „Zatweirdzam” na pytanie o pięć pakietów. Powiązanie: [F4-092](FINDINGS.md#f4-092). Potwierdzone w ZG4-v1; brak zmiany zakresu.
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopuścić pionowe przewijanie wyników, OverActions i NextActions umieścić w StickyBar.
- B: Ścisnąć każdą całość do 640 px, także wiele rysunków i tabel.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować czytelne szczegóły i zawsze dostępny Rewanż/Do lobby; istniejące Dalej w odsłonach jest już przyklejone.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: E08, E10 i E12; nie oceniać wysokiego podsumowania z dostępnym Dalej jak aktywnej planszy.

<a id="d4-058"></a>

### D4-058. Kampus Tour: środek planszy

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-058](FINDINGS.md#f4-058), [F4-135](FINDINGS.md#f4-135).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Stały, nieucinany wiersz rundy i akcji, krótszy log (1-2 wpisy); Podsumowanie w dostępnym miejscu, akcje środka tylko gdy dialog schowany.
- B: Dać przewijanie wewnątrz środka z zawsze widocznym paskiem akcji.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: wynik E13-E15 potwierdza ucinanie, samo overflow-auto nie gwarantuje dostępu na małym telefonie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §6; ZASADY §4.
- Zależności i warunek przygotowania poprawki: D4-051 i D4-060; zachować poziomą scenę 800×390 w skali 0,8, nie traktować jej jako viewportu.

<a id="d4-059"></a>

### D4-059. Gęste plansze: cele mniejsze niż 48 px

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-093](FINDINGS.md#f4-093).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Jawny wyjątek dla wyboru pola z osobnym potwierdzeniem: Gomoku, Labirynt, Statki, Chińczyk; wyróżnienie i nazwa wybranego pola, potwierdzenie min. 48 px.
- B: Każde pole co najmniej 48 px, więc plansze wymagają powiększania lub przewijania.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A wyłącznie z potwierdzeniem; Memory i gry na czas bezpośrednio wykonujące akcję nie dziedziczą wyjątku.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: D4-055; pola Kampus Tour otwierające szczegóły: wyjątek tylko po sprawdzeniu potwierdzania ruchu w każdym trybie.

<a id="d4-060"></a>

### D4-060. Zwykłe kontrolki i przeskalowane akcje: 48 px

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-093](FINDINGS.md#f4-093).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wszystkie akcje poza wyjątkiem plansz mają rzeczywiste pole co najmniej 48×48 px po skalowaniu: suwak, kolory, plus/minus, budowa, Tort i kulki Śledzenia.
- B: Dopuścić 44 px budowy oraz 36 px suwaka jako osobno nazwane wyjątki.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: E13-E15 wykazują akcje Kampus Tour wysokości 38,4 px po zoom; 48 px w scenie nie spełnia 48 px na ekranie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: D4-058 i D4-059; nie powiększać nakładających się hitboxów kulek bez reguły wyboru najbliższej.

<a id="d4-061"></a>

### D4-061. Państwa-miasta: tabela bez poziomego przewijania

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-152](FINDINGS.md#f4-152).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Przy 4+ graczach pokazywać kategorię osobno, gracze w wierszach, z liczbą pozostałych kategorii.
- B: Zachować przewijanie tabeli w kaflu jako jawny wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: każda oceniana odpowiedź ma zmieścić się w szerokości ekranu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §6; ZASADY §4.
- Zależności i warunek przygotowania poprawki: D4-010; nie zmieniać sposobu głosowania ani domyślnych głosów.

<a id="d4-062"></a>

### D4-062. Jedno źródło tokenów i promieni

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-060](FINDINGS.md#f4-060), [F4-061](FINDINGS.md#f4-061), [F4-063](FINDINGS.md#f4-063), [F4-067](FINDINGS.md#f4-067).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: ZASADY odsyłają do pełnej tabeli DESIGN, dopisać accent-hover, znak aplikacji oraz klasę btn-player dla działań gracza.
- B: Powielić pełną listę w obu dokumentach i zostawić styl gracza per komponent.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: jedna definicja; btn-player tylko wspólny wygląd, bez zmiany znaczeń tokenów.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §2 i §5.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-063"></a>

### D4-063. Kolory i kształty treści gry

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-094](FINDINGS.md#f4-094), [F4-110](FINDINGS.md#f4-110), [F4-111](FINDINGS.md#f4-111).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Nazwać w DESIGN wyjątki treści: rogi i grupy Kampus Tour, plansza 2.5D i poświata tury, uchwyt suwaka, figury Obrotu, gradient oceny Koła; pozostałe dekoracje sprowadzić do tokenów/skali.
- B: Usunąć wszystkie wyjątki i zastąpić kolory i kształty wyłącznie wspólnymi tokenami i promieniami 20/10/999.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: treść gry może mieć własną reprezentację, ale wyjątek nie legalizuje dowolnych ozdób.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §2 i §6; ZASADY §4.
- Zależności i warunek przygotowania poprawki: Odznaka turnieju 4 px jest osobnym wierszem wyjątku, do przyjęcia w A; nie dotyczy hitboxów D4-060.

<a id="d4-064"></a>

### D4-064. Warning dla groźby zbicia i inne role tokenów

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-096](FINDINGS.md#f4-096), [F4-118](FINDINGS.md#f4-118), [F4-129](FINDINGS.md#f4-129).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Warning zostaje dla ostrzeżeń przed skutkiem ruchu z tekstem lub ikoną; własny wybór zawsze w kolorze gracza; trafienie Statków w accent zachować jako nazwany wyjątek.
- B: Usunąć warning z podglądu zbicia, użyć neutralnego obrysu i opisu; trafienia Statków również przenieść do tokenu success.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować czytelne ostrzeżenie, poprawić miejsca używające akcentu jako błędu i accent-fg na nieodpowiednim tle.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §2 i §6; ZASADY §4.
- Zależności i warunek przygotowania poprawki: Nie zmieniać koloru na jedyny sygnał; D4-065.

<a id="d4-065"></a>

### D4-065. Właściciel i stan rozpoznawalne bez barwy

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-095](FINDINGS.md#f4-095).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dodać inicjał/ikonę/kształt właściciela i zaznaczenia; w Śledzeniu dodatkowy widoczny znak celów w pokazie, bez zmiany ruchu.
- B: Dopuścić sam kolor na pionkach, kamieniach i polach, z nazwą dostępną dopiero po otwarciu szczegółów.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: DESIGN wymaga drugiego sygnału; aria-label nie zastępuje widocznego znaku.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §5 i §6.
- Zależności i warunek przygotowania poprawki: U12 (sześć kolorów), U11 (czytnik) pozostają otwarte.

<a id="d4-066"></a>

### D4-066. Ekran główny: jeden wypełniony akcent

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-066](FINDINGS.md#f4-066).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Po pełnym kodzie Dołącz jest wypełnione, Zagraj w karcie Sam staje się obrysem.
- B: Dopuścić dwa wypełnione akcenty jako wyjątek ekranu głównego.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: utrzymać wskazanie jednej głównej akcji.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §3.1 i §5.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-067"></a>

### D4-067. Własne nagłówki i zakres informacji

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-097](FINDINGS.md#f4-097), [F4-130](FINDINGS.md#f4-130).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopisać Kalambury do własnych nagłówków; każdy przejmuje status, obserwatora, rozłączenie i wygrane; paski w kolorze aktywnego gracza.
- B: Dopuścić pomijanie wygranych i obserwatora w Kampus Tour jako wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: nagłówek może mieć inny układ, zachowuje ten sam zakres.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: D4-058; punkty gry i wygrane partie pozostają odrębnymi liczbami.

<a id="d4-068"></a>

### D4-068. Wyniki graczy: drugi wzorzec tabeli

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-099](FINDINGS.md#f4-099).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopuścić wspólny Results/ScoreTable dla mini-gier potrzebujących kolumn, zachować semantykę gra…, (ty), remisy i mono.
- B: Przebudować wszystkie wyniki na Scores z dodatkowymi danymi w wierszu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: dwa jawne wspólne wzorce, nie osobna tabela na grę.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4.
- Zależności i warunek przygotowania poprawki: Nie zmieniać komparatorów przy refaktorze.

<a id="d4-069"></a>

### D4-069. Tabele rund i Odcień

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-100](FINDINGS.md#f4-100).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Rozszerzyć RoundTable o komórki/children i wiersz celów; Przytrzymaj/Balon/Szacowanie używają wspólnego wzorca, Odcień zachowuje pary próbek jako wyjątek.
- B: Zachować własne tabele każdej gry i opisać je jako kolejne wzorce.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: wspólna semantyka i szerokość, wyjątek tylko dla treści wymagającej porównania próbek.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §6.
- Zależności i warunek przygotowania poprawki: U04 i F4-149 (długie komórki) do odbioru 360 px.

<a id="d4-070"></a>

### D4-070. Przejścia i słowa przycisków

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-085](FINDINGS.md#f4-085), [F4-091](FINDINGS.md#f4-091), [F4-098](FINDINGS.md#f4-098), [F4-119](FINDINGS.md#f4-119).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dalej przechodzi po odsłonie, Wyniki tylko do końcowego podsumowania; w partii przycisk ma kolor gracza, między grami turnieju akcent. Gotowe zarezerwować dla oddania odpowiedzi, gotowość w lobby nazwać Jestem gotowy.
- B: Ujednolicić wszystkie przejścia na Dalej, zostawić Gotowe w dotychczasowych trzech rolach.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: nazwa mówi o skutku, bez mieszania gotowości, oddania i czekania; role muszą być jawne w dokumentach.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §5.
- Zależności i warunek przygotowania poprawki: D4-071 rozstrzyga automatyczne wysłanie po końcu, nie samo słowo.

<a id="d4-071"></a>

### D4-071. W pamięci: wysłanie po pomyłce

- Status: **zatwierdzona: poprawić, wariant A** (2026-10-26, B4-001, R4-v1/PK4-v1). Źródło: odpowiedź użytkownika „Zatweirdzam” na pytanie o pięć pakietów. Powiązanie: [F4-083](FINDINGS.md#f4-083). Potwierdzone w ZG4-v1; brak zmiany zakresu.
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wysyłać wynik natychmiast po pomyłce, odsłonę pokazywać niezależnie od serwera; przy komplecie również wysłać bez dodatkowego potwierdzenia.
- B: Pozostawić wysłanie dopiero przy Wyniki i opisać ryzyko utraty partii po odłożeniu telefonu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zasady mówią, że pomyłka kończy partię; odsłona nie powinna odkładać wyniku.
- Skutki rekordów / detail / turnieju: **R1** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §W pamięci; ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-070; test drugiego oddania i odświeżenia.

<a id="d4-072"></a>

### D4-072. Intro: czas całej partii

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-125](FINDINGS.md#f4-125), [F4-144](FINDINGS.md#f4-144).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Punkt time podaje rundy i czas stały/modelowy zamiast samej liczby rund; Preview jako osobny komponent także w Kole.
- B: Dopuścić liczbę rund bez czasu jako wyjątek mini-gier bez twardego czasu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A z jawnym „zwykle” dla modelu; nie przedstawiać modelu jako gwarancji.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4.
- Zależności i warunek przygotowania poprawki: D4-005; U03 (podgląd Koloru liter) pozostaje do pomiaru.

<a id="d4-073"></a>

### D4-073. Katalog animacji i komentarze

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-105](FINDINGS.md#f4-105), [F4-106](FINDINGS.md#f4-106), [F4-109](FINDINGS.md#f4-109).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopisać line-draw/title-pop/tile-hit/tile-miss/piece-fall/shake i ich role; pętle Tailwinda zastąpić nazwanymi odpowiednikami w index.css; komentarze zgodne z użyciem.
- B: Usunąć animacje spoza aktualnej listy i pętle Tailwinda.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować informację o zdarzeniu, ustanowić jeden katalog.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Wybór czasu i sytuacji jest osobny D4-074..082; dodanie nazwy nie zatwierdza każdego użycia.

<a id="d4-074"></a>

### D4-074. Czasy keyframes i pętli wyboru

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-075](FINDINGS.md#f4-075), [F4-076](FINDINGS.md#f4-076), [F4-107](FINDINGS.md#f4-107), [F4-108](FINDINGS.md#f4-108).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: ring-pulse 1,2 s; title-pop 500 ms; tile-hit/miss 350 ms; piece-fall 500 ms ease-in; shake 300 ms; set-glow 900 ms ×4.
- B: Wszystkie jednorazowe pojawienia 350 ms, pętla wyboru 1,2 s; usunąć pozostałe odstępstwa czasów.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: nazwać konkretne role; stone-pop poza pokazem zawsze 350 ms, nie 500 ms.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5 tabela.
- Zależności i warunek przygotowania poprawki: D4-073; wybór nie obejmuje ruchu zadania ani blokady akcji.

<a id="d4-075"></a>

### D4-075. Czas pokazu W pamięci i Szybki Chińczyk

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-107](FINDINGS.md#f4-107), [F4-108](FINDINGS.md#f4-108).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wyjątki tabeli: pojawienie w pokazie W pamięci 180 ms, Szybki Chińczyk krok 110 ms/rzut 400 ms.
- B: Stosować ogólne 350 ms pojawienia i 180-220/700 ms dla Chińczyka także w Szybkim.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zachować opisane tempo zadań i trybu; jawnie oddzielić od ozdobnych pojawień.
- Skutki rekordów / detail / turnieju: **R0; B dodatkowo R1** według §1.
- Dokumentacja po wyborze: ZASADY §5; ZASADY-GIER §W pamięci i §Chińczyk.
- Zależności i warunek przygotowania poprawki: D4-052; zmiana tempa pokazu wymaga ponownego wyliczenia czasu partii.

<a id="d4-076"></a>

### D4-076. Paski i zwykłe przejścia

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-086](FINDINGS.md#f4-086), [F4-104](FINDINGS.md#f4-104), [F4-107](FINDINGS.md#f4-107).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Przycisk/stany 180 ms, reakcja dotykowa 100 ms; pasek linear przez długość kroku odświeżania, Countdown 300 ms.
- B: Paski bez animacji, pozostałe przejścia jak w A.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: płynne odliczanie, ale bez wpływu na zegar logiki.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Nie opóźniać bodźców ani znaczników wejścia.

<a id="d4-077"></a>

### D4-077. Czekanie na rywala

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-077](FINDINGS.md#f4-077).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Spokojny tekst statusu, bez animate-pulse/ping.
- B: Jeden wspólny ring-pulse 1,2 s na wskaźniku oczekiwania.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: brak zdarzenia do animowania.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-073; nie zmieniać sygnału wyboru pionka.

<a id="d4-078"></a>

### D4-078. Odsłona prawdziwego wyniku

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-078](FINDINGS.md#f4-078), [F4-126](FINDINGS.md#f4-126).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wynik i znacznik prawdy pojawiają się od razu, bez animacji.
- B: Wszędzie stone-pop 350 ms na odsłanianym znaczniku.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: stałe 1,5 s odsłony w całości na odczyt; wspólny znacznik neutralny/fg, kolor gracza dla jego odpowiedzi.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5 i §4.
- Zależności i warunek przygotowania poprawki: Nie zmieniać długości odsłony ani momentu pomiaru.

<a id="d4-079"></a>

### D4-079. Zignorowany ruch

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-079](FINDINGS.md#f4-079).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Shake 300 ms i krótki powód, bez wibracji i bez kary; w Zasłonie przed ruchem kulki samo zignorowanie zgodnie z zasadami.
- B: Shake i wibracja 60 przy każdym zignorowanym ruchu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zignorowanie bez kary nie jest pomyłką punktową; wyjątek Zasłony nazwać wprost.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5; ZASADY-GIER §Nożyczki/Środek/Koło/Za zasłoną.
- Zależności i warunek przygotowania poprawki: Nie dodać kary ani zakończenia próby przez zmianę efektu.

<a id="d4-080"></a>

### D4-080. Pudło i pomyłka

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-080](FINDINGS.md#f4-080).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: 60 ms przy rzeczywistym błędzie (w tym falstart i błąd Sekwencji), bez wibracji przy legalnym pudle w Statkach/Memory/Kalamburach.
- B: Traktować każde pudło jak pomyłkę i dawać 60 ms także w grach turowych.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: legalne sprawdzenie nie oznacza złej akcji; dopisać rozróżnienie w tabeli.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-081"></a>

### D4-081. Szkoda od innego gracza

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-081](FINDINGS.md#f4-081).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wibracja [60,40,60] przy zbiciu pionka, trafieniu mojej floty, wykupieniu mojego pola i STOP od innego.
- B: Ograniczyć ten wzór do zbicia pionka; pozostałe pokazać bez wibracji jako wyjątki.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: jedna semantyka szkody, zawsze u poszkodowanego i raz na zdarzenie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Nie odtwarzać historycznej szkody po reconnect.

<a id="d4-082"></a>

### D4-082. Koniec partii

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-082](FINDINGS.md#f4-082).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wspólny title-pop tylko u zwycięzcy; pozostali widzą spokojny wynik, remis bez animacji wygranej.
- B: Zostawić osobny sposób ogłoszenia wyniku w Kampus Tour jako jawny wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: ten sam sygnał zakończenia i wygranej we wszystkich grach.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-073 i D4-074; bez wpływu na chwilę zakończenia na serwerze.

<a id="d4-083"></a>

### D4-083. Metronom Rytmu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-147](FINDINGS.md#f4-147).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopisać 30 ms jako bodziec metronomu i zachować jedyny dźwięk opisany w zasadach.
- B: Usunąć wibrację metronomu i zostawić bodziec wizualny/dźwiękowy.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: to zadanie, nie nagroda za trafienie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5 tabela; KONCEPT §1 i §2.4.
- Zależności i warunek przygotowania poprawki: F1:O08, F2:O17/O18; U14 do odbioru urządzeniem.

<a id="d4-084"></a>

### D4-084. Wibracja tury przy zmianie fazy

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-084](FINDINGS.md#f4-084).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wibrować przy przejściu do mojej nowej decyzji, nie przy samej zmianie half Kalamburów ani identycznej liście waitingFor bez nowej decyzji.
- B: Wibrować na każdą zmianę klucza turn, gdy jestem w waitingFor.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: klucz techniczny nie jest równoznaczny z nową turą; zapobiec zdradzaniu połówek rysowania.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Nie zdublować Game.tsx i efektu w komponencie gry.

<a id="d4-085"></a>

### D4-085. Ucięty werdykt Balonu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-150](FINDINGS.md#f4-150).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Trzymać ostatni wynik niezależnie od fazy, aby float-up mógł trwać 1,6 s mimo przerwy 0,8 s.
- B: Skrócić animację werdyktu do 0,8 s jako wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: nie zmieniać czasu partii dla dekoracji.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-054; werdykt widoczny także bez ruchu.

<a id="d4-086"></a>

### D4-086. Wspólna dokładność tie

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-013](FINDINGS.md#f4-013).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zaokrąglać średnią do ms zarówno w komparatorze miejsc, jak i w record.tie.
- B: Zapisywać precyzyjną średnią w record.tie i formatować tylko do wyświetlania.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: jedna dokładność i jeden komparator, bez wymagania odtwarzania dawnych ułamków.
- Skutki rekordów / detail / turnieju: **R4** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Stój!/quizy; KONCEPT §2.4.
- Zależności i warunek przygotowania poprawki: Stare rekordy już mają zaokrąglone tie. B nie odzyska dawnych ułamków; detail tylko lidera.

<a id="d4-087"></a>

### D4-087. Quiz: walidacja i zachowanie czasów

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-014](FINDINGS.md#f4-014), [F4-015](FINDINGS.md#f4-015).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Odrzucać ułamkowe czasy i nierealne liczby pomyłek; ekran zapisuje rzeczywiste trafienia w dopuszczalnym zakresie, nie ucina ich do 5 s ani nie usuwa poprawnych <150 ms.
- B: Zachować obecny zakres ekranu jako regułę, dopasować do niego dokumenty i walidację.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: serwer i ekran mają wspólny opis dopuszczalnych wyników, istniejąca blokada 1 s zostaje.
- Skutki rekordów / detail / turnieju: **R2** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kolor liter/Liczenie i gry quizowe.
- Zależności i warunek przygotowania poprawki: Granice z czasu rundy i blokady wyliczyć przed zmianą testów; nie obniżać walidacji do przypadkowo uciętego klienta.

<a id="d4-088"></a>

### D4-088. Ekrany końcowe wyłącznie ze stanu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-016](FINDINGS.md#f4-016), [F4-021](FINDINGS.md#f4-021).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Naprawić Stoper/Rytm i testować soloState na stanie wypełnionym legalnymi ruchami, także z me="".
- B: Ukryć kafel lokalny w rekordowej partii, zostawić go tylko grającemu.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: jednakowe pełne szczegóły partii i rekordu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §3 i §6.
- Zależności i warunek przygotowania poprawki: Stary detail nie może wymagać danych lokalnych; zachować kompatybilny fallback gdy danych nie ma.

<a id="d4-089"></a>

### D4-089. Brakujące testy obowiązujących reguł

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-004](FINDINGS.md#f4-004), [F4-005](FINDINGS.md#f4-005), [F4-006](FINDINGS.md#f4-006), [F4-007](FINDINGS.md#f4-007), [F4-008](FINDINGS.md#f4-008), [F4-009](FINDINGS.md#f4-009), [F4-010](FINDINGS.md#f4-010), [F4-011](FINDINGS.md#f4-011), [F4-012](FINDINGS.md#f4-012), [F4-027](FINDINGS.md#f4-027), [F4-028](FINDINGS.md#f4-028), [F4-029](FINDINGS.md#f4-029), [F4-032](FINDINGS.md#f4-032), [F4-033](FINDINGS.md#f4-033), [F4-034](FINDINGS.md#f4-034), [F4-037](FINDINGS.md#f4-037), [F4-038](FINDINGS.md#f4-038), [F4-040](FINDINGS.md#f4-040), [F4-041](FINDINGS.md#f4-041), [F4-042](FINDINGS.md#f4-042), [F4-045](FINDINGS.md#f4-045), [F4-046](FINDINGS.md#f4-046), [F4-047](FINDINGS.md#f4-047), [F4-049](FINDINGS.md#f4-049), [F4-050](FINDINGS.md#f4-050), [F4-053](FINDINGS.md#f4-053), [F4-054](FINDINGS.md#f4-054).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Dopisać wskazane w F4 testy kontraktu i reguł, bez zmiany znaczeń zasad.
- B: Odrzucić konkretne luki z pisemnym uzasadnieniem, że obejmuje je inny wskazany test.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A poza faktycznymi duplikatami; najpierw ustalić sporne reguły z odpowiednich decyzji.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §2; właściwe sekcje ZASADY-GIER jako oczekiwania.
- Zależności i warunek przygotowania poprawki: Każdy przypadek ma zachować własny F4 i test nazwany regułą. TDD zasad przed kodem, commit tylko na prośbę użytkownika.

<a id="d4-090"></a>

### D4-090. Utrzymanie i podpięcie bez zmiany zachowania

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A dla wskazanych wspólnych funkcji/rejestru, B lokalnie w P4-035** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-017](FINDINGS.md#f4-017), [F4-019](FINDINGS.md#f4-019), [F4-048](FINDINGS.md#f4-048), [F4-051](FINDINGS.md#f4-051), [F4-156](FINDINGS.md#f4-156).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wyprowadzić MINI_GAMES z istniejącego rejestru, użyć core i wspólnych modułów, nonce Sudoku oraz istniejącego StickyBar; zachować tożsamość gry.
- B: Zostawić obecne kopie z uzasadnionym wyjątkiem i testem zgodności.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: mniej rozbieżnych kopii; nonce usuwa powtórzenie planszy jako klucz rewanżu, bez zmiany plansz.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §3 i §6; KONCEPT §3.
- Zależności i warunek przygotowania poprawki: Bez nowych zależności; nonce zgodny ze starym detail przez fallback.

<a id="d4-091"></a>

### D4-091. Remisy: Chińczyk i Turniej

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-018](FINDINGS.md#f4-018), [F4-036](FINDINGS.md#f4-036).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wynik i numeracja zachowują równe miejsca przy pełnym remisie; kolejność miejsc tylko porządkuje wyświetlanie, Gomoku zwraca ranking bez zwycięzcy.
- B: Opisać rozstrzyganie równej pozycji kolejnością graczy jako wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: wspólne znaczenie remisu i points z places, bez przypadkowego zwycięzcy.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Chińczyk/Turniej/Gomoku; ZASADY §3.
- Zależności i warunek przygotowania poprawki: Sprawdzić czy numeracja UI Turnieju wymaga shared standings, nie zmieniać punktacji za wygraną bez osobnego testu.

<a id="d4-092"></a>

### D4-092. Kampus Tour: karta bankruta

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-022](FINDINGS.md#f4-022).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Oddawać Zaliczenie bankruta na spód talii.
- B: Pozostawiać kartę poza talią do końca partii jako jawne odstępstwo.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: karta nie znika z obiegu po eliminacji gracza.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/Karty i bankructwo.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-093"></a>

### D4-093. Kampus Tour: statystyka czynszu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-031](FINDINGS.md#f4-031).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zapisywać faktycznie zapłaconą kwotę, nie pełny należny czynsz przy bankructwie.
- B: Zachować pełną kwotę i nazwać statystykę należnym czynszem.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: podsumowanie pokazuje przepływ gotówki zgodnie z opisem.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kampus Tour/stats.
- Zależności i warunek przygotowania poprawki: Nie zmieniać samej wypłaty ani warunku bankructwa.

<a id="d4-094"></a>

### D4-094. Kalambury: wcześniejsza podpowiedź

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-039](FINDINGS.md#f4-039).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Pozwolić rysującemu odsłonić literę wcześniej przez jawny przycisk i opisać skutek dla połowy.
- B: Usunąć wcześniejsze hint od klienta; połowę kończy tylko serwer po czasie.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: obecny opis wskazuje timeout, nie intencjonalny przycisk; nie rozszerzać automatycznie zasad dlatego, że ruch przechodzi.
- Skutki rekordów / detail / turnieju: **R5** według §1.
- Dokumentacja po wyborze: ZASADY-GIER §Kalambury.
- Zależności i warunek przygotowania poprawki: Nie uznawać samego ukrycia przycisku za walidację serwera.

<a id="d4-095"></a>

### D4-095. Nieaktualne opisy i komentarze

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-020](FINDINGS.md#f4-020), [F4-024](FINDINGS.md#f4-024), [F4-025](FINDINGS.md#f4-025), [F4-026](FINDINGS.md#f4-026), [F4-035](FINDINGS.md#f4-035), [F4-043](FINDINGS.md#f4-043), [F4-044](FINDINGS.md#f4-044), [F4-052](FINDINGS.md#f4-052), [F4-055](FINDINGS.md#f4-055), [F4-139](FINDINGS.md#f4-139), [F4-143](FINDINGS.md#f4-143), [F4-148](FINDINGS.md#f4-148).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Poprawić literalne rozbieżności z kodem i zasadami: brakujący tie W pamięci, karta i talia Kampus Tour, faza pick, nazwy testów, Refleks liczony na serwerze, seria zamiast pkt, ukrycie rywali, Ć, formy rysujesz i Dotknij symbolu oraz opis zgodnych plansz Stroopa.
- B: Zachować wskazane sformułowania jako świadome skróty; dla każdego wskazać powód.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: poprawka redakcyjna, bez dorabiania nowej mechaniki do błędnego opisu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: KONCEPT §2.4 i §9; ZASADY-GIER odpowiednich gier; komentarze kodu i teksty UI.
- Zależności i warunek przygotowania poprawki: Jeśli decyzje zasad zmienią zachowanie, opis odpowiada wersji końcowej, nie kopii dzisiejszego kodu.

<a id="d4-096"></a>

### D4-096. Typografia, podpisy i format liczb

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-101](FINDINGS.md#f4-101), [F4-102](FINDINGS.md#f4-102), [F4-103](FINDINGS.md#f4-103), [F4-120](FINDINGS.md#f4-120), [F4-122](FINDINGS.md#f4-122), [F4-124](FINDINGS.md#f4-124), [F4-141](FINDINGS.md#f4-141), [F4-145](FINDINGS.md#f4-145), [F4-149](FINDINGS.md#f4-149), [F4-151](FINDINGS.md#f4-151), [F4-153](FINDINGS.md#f4-153), [F4-157](FINDINGS.md#f4-157).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Wspólne mono/tabular-nums dla odczytów i cyfr w zdaniach, label dla podpisów, bold małych ikon; format przecinka wspólny, brak wartości „brak”; skrót 999+ w ciasnej tabeli Mapy, pkt w nagłówku Turnieju.
- B: Dopuścić cyfry w zdaniach Satoshi, pozostałe poprawki jak A.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: liczby w narracji nie muszą rozbijać kroju zdania; odczyty, czasy i kody zawsze mono. Zachować własne progi tylko gdy wynikają z jednostki gry, z opisem zamiast mechanicznego grade.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §2 i §5.
- Zależności i warunek przygotowania poprawki: U03/U04/U05; nie zmieniać zaokrąglenia punktacji przez formatter. Kary Schultego/Sudoku są całkowite, to nie potwierdzony błąd kropki.

<a id="d4-097"></a>

### D4-097. Dostępność i komunikaty blokady

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-062](FINDINGS.md#f4-062), [F4-073](FINDINGS.md#f4-073), [F4-074](FINDINGS.md#f4-074), [F4-112](FINDINGS.md#f4-112), [F4-113](FINDINGS.md#f4-113), [F4-114](FINDINGS.md#f4-114), [F4-115](FINDINGS.md#f4-115), [F4-128](FINDINGS.md#f4-128), [F4-134](FINDINGS.md#f4-134), [F4-137](FINDINGS.md#f4-137), [F4-138](FINDINGS.md#f4-138), [F4-146](FINDINGS.md#f4-146), [F4-154](FINDINGS.md#f4-154), [F4-155](FINDINGS.md#f4-155).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Uzupełnić role, etykiety i aria-hidden; stan rozłączenia/ładowania z tekstem; powód blokady przy polu, pionku i liczbie gier; Sudoku bez pola ma nieaktywną klawiaturę; dotyk utrzymuje tooltip; pusta ciekawostka i turniej solo mają opis.
- B: Zachować konkretne stany jako odstępstwa z uzasadnieniem per F4, bez zmiany globalnych reguł.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: zastosować istniejące wymagania, color-scheme: dark dla natywnych kontrolek.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §4; DESIGN §4.
- Zależności i warunek przygotowania poprawki: U10/U11: czytelność i czytniki wymagają urządzenia; samo DOM/ARIA nie potwierdza wypowiedzi czytnika.

<a id="d4-098"></a>

### D4-098. Niskie wątpliwości szerokości i hierarchii

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-068](FINDINGS.md#f4-068), [F4-070](FINDINGS.md#f4-070), [F4-071](FINDINGS.md#f4-071), [F4-072](FINDINGS.md#f4-072), [F4-123](FINDINGS.md#f4-123), [F4-133](FINDINGS.md#f4-133), [F4-136](FINDINGS.md#f4-136), [F4-142](FINDINGS.md#f4-142).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Poprawić dopiero potwierdzone obcięcia; dopasować tytuły do istniejącego wzorca, kolory linków i tła do ról tokenów.
- B: Zostawić wskazane elementy po pomiarze potwierdzającym czytelność i celowy wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A dla naruszeń potwierdzonych pomiarem; pozostałe wymagają U03/U04/U09. Nie przedstawiać szacunku tekstu 7-8 px jako testu czytelności człowieka.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: DESIGN §2/§5/§6; ZASADY §4.
- Zależności i warunek przygotowania poprawki: U03/U04/U09; szczegóły per F4 pozostają w rejestrze.

<a id="d4-099"></a>

### D4-099. Trafienie w grze do pomyłki

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-087](FINDINGS.md#f4-087).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Krótki tile-hit po zaliczeniu, bez wibracji; podpis Idealnie! tylko gdy oznacza dokładnie zerowy błąd.
- B: Zachować różne podpisy i efekty jako wyjątki.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: wspólny sygnał poprawnego wyniku, bez zmiany progu zaliczenia.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-074; nie dodawać czasu oczekiwania przed kolejną rundą.

<a id="d4-100"></a>

### D4-100. Świeża para Memory

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-088](FINDINGS.md#f4-088).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Para to stone-pop 350 ms; set-glow zarezerwować dla kompletu wielu różnych pól.
- B: Dawać set-glow także świeżej parze.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: rozróżnić pojawienie pary od osiągnięcia większego kompletu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: D4-073/074; wspólne znaczenie osiągnięcia dotyczy też Kampus Tour.

<a id="d4-101"></a>

### D4-101. Zaznaczenie w polu na czas

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-089](FINDINGS.md#f4-089).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Zmiana obrysu i zaznaczenia od razu, bez transition-colors.
- B: Dopuszczać 100 ms przejście koloru, bez opóźniania logiki.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: odczyt wskazania nie czeka na przejście.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Nie zmieniać chwili zliczania dotknięcia.

<a id="d4-102"></a>

### D4-102. Okno otwierane dotykiem

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-090](FINDINGS.md#f4-090).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Pojawia się natychmiast; card-in dotyczy automatycznej karty/okna ze stanu gry.
- B: card-in 350 ms dla każdego okna.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: informacja po dotknięciu pola jest dostępna od razu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Nie blokować działania przycisków na czas animacji.

<a id="d4-103"></a>

### D4-103. Ponowna animacja po odświeżeniu

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-121](FINDINGS.md#f4-121).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Animować tylko nowe zdarzenia od pierwszego otrzymanego stanu; zastany stan pokazać od razu.
- B: Odtwarzać stone-pop całej planszy po każdym montowaniu jako wyjątek.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: odświeżenie nie przedstawia starych pionków jako nowych ruchów.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: brak.

<a id="d4-104"></a>

### D4-104. Quiz: miejsce błysku trafienia

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-127](FINDINGS.md#f4-127).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Błysk dotyczy zapisanego miejsca trafienia albo licznika trafień, nie przycisków nowego pytania.
- B: Uznać błysk miejsca dotknięcia za niezależny od treści nowego pytania i opisać to w regule.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: gracz widzi, jaka akcja właśnie się udała.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5.
- Zależności i warunek przygotowania poprawki: Szczególnie Inny element przy zmianie wymiarów siatki; bez wydłużenia rundy.

<a id="d4-105"></a>

### D4-105. Kampus Tour: rzut a przeskok

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant A** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-131](FINDINGS.md#f4-131), [F4-132](FINDINGS.md#f4-132).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Turlanie tylko po zdarzeniu rzutu; marsz tylko po ruchu z rzutu; karty, Kolokwium i MPK przeskakują od razu.
- B: Każda zmiana pozycji uruchamia turlanie i marsz jako jawny skrót prezentacji.
- Historyczna rekomendacja 04-02 i skutek dla gracza: A: animacja oznacza faktyczne zdarzenie.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5; DESIGN §6.
- Zależności i warunek przygotowania poprawki: D4-051; jeśli brakuje identyfikatora zdarzenia, zakres kontraktu widoku wyjaśnić przed poprawką.

<a id="d4-106"></a>

### D4-106. Odsłonięta litera Kalamburów

- Status: **zatwierdzona: wykonać w granicach przypisanych pakietów; wariant B** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Zakres i uściślenia: [FINAL-APPROVAL §3-6](FINAL-APPROVAL.md). Powiązania F4 zachowane poniżej. Pomiary U/P pozostają warunkami odbioru, a nie otwartą decyzją o wyborze.  [F4-140](FINDINGS.md#f4-140).
- Pytanie: który z poniższych wariantów ma obowiązywać?
- A: Nowa litera stone-pop 350 ms, pozostałe bez ponownej animacji.
- B: Litera pojawia się natychmiast bez animacji.
- Historyczna rekomendacja 04-02 i skutek dla gracza: B: bez opóźniania informacji; jawny wyjątek od animacji nowego elementu.
- Skutki rekordów / detail / turnieju: **R0** według §1.
- Dokumentacja po wyborze: ZASADY §5; ZASADY-GIER §Kalambury.
- Zależności i warunek przygotowania poprawki: D4-084; nie dublować sygnału połowy wibracją.

## 3. Mapa wszystkich wpisów F4

To przypisanie tematów do wariantów, nie akceptacja wpisu. F4-002, F4-003, F4-158/159/160 mają wiele decyzji dla różnych gier. Zgoda na jeden wiersz D4 nie zatwierdza pozostałych wariantów agregatu. Szczegółowe zakresy F4 i źródła pozostają w FINDINGS.

| F4 | Decyzje (bieżący status na kartach i w §10) |
|---|---|
| [F4-001](FINDINGS.md#f4-001) | [D4-001](#d4-001), [D4-002](#d4-002), [D4-003](#d4-003) |
| [F4-002](FINDINGS.md#f4-002) | [D4-004](#d4-004), [D4-005](#d4-005), [D4-006](#d4-006), [D4-007](#d4-007), [D4-008](#d4-008), [D4-009](#d4-009), [D4-010](#d4-010), [D4-011](#d4-011) |
| [F4-003](FINDINGS.md#f4-003) | [D4-013](#d4-013), [D4-014](#d4-014), [D4-015](#d4-015), [D4-016](#d4-016), [D4-017](#d4-017), [D4-018](#d4-018), [D4-019](#d4-019), [D4-020](#d4-020), [D4-021](#d4-021), [D4-022](#d4-022), [D4-023](#d4-023), [D4-024](#d4-024), [D4-025](#d4-025), [D4-026](#d4-026), [D4-027](#d4-027) |
| [F4-004](FINDINGS.md#f4-004) | [D4-089](#d4-089) |
| [F4-005](FINDINGS.md#f4-005) | [D4-089](#d4-089) |
| [F4-006](FINDINGS.md#f4-006) | [D4-089](#d4-089) |
| [F4-007](FINDINGS.md#f4-007) | [D4-089](#d4-089) |
| [F4-008](FINDINGS.md#f4-008) | [D4-089](#d4-089) |
| [F4-009](FINDINGS.md#f4-009) | [D4-089](#d4-089) |
| [F4-010](FINDINGS.md#f4-010) | [D4-089](#d4-089) |
| [F4-011](FINDINGS.md#f4-011) | [D4-089](#d4-089) |
| [F4-012](FINDINGS.md#f4-012) | [D4-089](#d4-089) |
| [F4-013](FINDINGS.md#f4-013) | [D4-086](#d4-086) |
| [F4-014](FINDINGS.md#f4-014) | [D4-087](#d4-087) |
| [F4-015](FINDINGS.md#f4-015) | [D4-087](#d4-087) |
| [F4-016](FINDINGS.md#f4-016) | [D4-088](#d4-088) |
| [F4-017](FINDINGS.md#f4-017) | [D4-090](#d4-090) |
| [F4-018](FINDINGS.md#f4-018) | [D4-091](#d4-091) |
| [F4-019](FINDINGS.md#f4-019) | [D4-090](#d4-090) |
| [F4-020](FINDINGS.md#f4-020) | [D4-095](#d4-095) |
| [F4-021](FINDINGS.md#f4-021) | [D4-088](#d4-088) |
| [F4-022](FINDINGS.md#f4-022) | [D4-092](#d4-092) |
| [F4-023](FINDINGS.md#f4-023) | [D4-036](#d4-036) |
| [F4-024](FINDINGS.md#f4-024) | [D4-095](#d4-095) |
| [F4-025](FINDINGS.md#f4-025) | [D4-095](#d4-095) |
| [F4-026](FINDINGS.md#f4-026) | [D4-095](#d4-095) |
| [F4-027](FINDINGS.md#f4-027) | [D4-089](#d4-089) |
| [F4-028](FINDINGS.md#f4-028) | [D4-089](#d4-089) |
| [F4-029](FINDINGS.md#f4-029) | [D4-089](#d4-089) |
| [F4-030](FINDINGS.md#f4-030) | [D4-037](#d4-037) |
| [F4-031](FINDINGS.md#f4-031) | [D4-093](#d4-093) |
| [F4-032](FINDINGS.md#f4-032) | [D4-089](#d4-089) |
| [F4-033](FINDINGS.md#f4-033) | [D4-089](#d4-089) |
| [F4-034](FINDINGS.md#f4-034) | [D4-089](#d4-089) |
| [F4-035](FINDINGS.md#f4-035) | [D4-095](#d4-095) |
| [F4-036](FINDINGS.md#f4-036) | [D4-091](#d4-091) |
| [F4-037](FINDINGS.md#f4-037) | [D4-089](#d4-089) |
| [F4-038](FINDINGS.md#f4-038) | [D4-089](#d4-089) |
| [F4-039](FINDINGS.md#f4-039) | [D4-094](#d4-094) |
| [F4-040](FINDINGS.md#f4-040) | [D4-089](#d4-089) |
| [F4-041](FINDINGS.md#f4-041) | [D4-089](#d4-089) |
| [F4-042](FINDINGS.md#f4-042) | [D4-089](#d4-089) |
| [F4-043](FINDINGS.md#f4-043) | [D4-095](#d4-095) |
| [F4-044](FINDINGS.md#f4-044) | [D4-095](#d4-095) |
| [F4-045](FINDINGS.md#f4-045) | [D4-089](#d4-089) |
| [F4-046](FINDINGS.md#f4-046) | [D4-089](#d4-089) |
| [F4-047](FINDINGS.md#f4-047) | [D4-089](#d4-089) |
| [F4-048](FINDINGS.md#f4-048) | [D4-090](#d4-090) |
| [F4-049](FINDINGS.md#f4-049) | [D4-089](#d4-089) |
| [F4-050](FINDINGS.md#f4-050) | [D4-089](#d4-089) |
| [F4-051](FINDINGS.md#f4-051) | [D4-090](#d4-090) |
| [F4-052](FINDINGS.md#f4-052) | [D4-095](#d4-095) |
| [F4-053](FINDINGS.md#f4-053) | [D4-089](#d4-089) |
| [F4-054](FINDINGS.md#f4-054) | [D4-089](#d4-089) |
| [F4-055](FINDINGS.md#f4-055) | [D4-095](#d4-095) |
| [F4-056](FINDINGS.md#f4-056) | [D4-055](#d4-055), [D4-056](#d4-056) |
| [F4-057](FINDINGS.md#f4-057) | [D4-051](#d4-051), [D4-052](#d4-052) |
| [F4-058](FINDINGS.md#f4-058) | [D4-058](#d4-058) |
| [F4-059](FINDINGS.md#f4-059) | [D4-050](#d4-050) |
| [F4-060](FINDINGS.md#f4-060) | [D4-062](#d4-062) |
| [F4-061](FINDINGS.md#f4-061) | [D4-062](#d4-062) |
| [F4-062](FINDINGS.md#f4-062) | [D4-097](#d4-097) |
| [F4-063](FINDINGS.md#f4-063) | [D4-062](#d4-062) |
| [F4-064](FINDINGS.md#f4-064) | [D4-054](#d4-054) |
| [F4-065](FINDINGS.md#f4-065) | [D4-053](#d4-053) |
| [F4-066](FINDINGS.md#f4-066) | [D4-066](#d4-066) |
| [F4-067](FINDINGS.md#f4-067) | [D4-062](#d4-062) |
| [F4-068](FINDINGS.md#f4-068) | [D4-098](#d4-098) |
| [F4-069](FINDINGS.md#f4-069) | [D4-056](#d4-056) |
| [F4-070](FINDINGS.md#f4-070) | [D4-098](#d4-098) |
| [F4-071](FINDINGS.md#f4-071) | [D4-098](#d4-098) |
| [F4-072](FINDINGS.md#f4-072) | [D4-098](#d4-098) |
| [F4-073](FINDINGS.md#f4-073) | [D4-097](#d4-097) |
| [F4-074](FINDINGS.md#f4-074) | [D4-097](#d4-097) |
| [F4-075](FINDINGS.md#f4-075) | [D4-074](#d4-074) |
| [F4-076](FINDINGS.md#f4-076) | [D4-074](#d4-074) |
| [F4-077](FINDINGS.md#f4-077) | [D4-077](#d4-077) |
| [F4-078](FINDINGS.md#f4-078) | [D4-078](#d4-078) |
| [F4-079](FINDINGS.md#f4-079) | [D4-079](#d4-079) |
| [F4-080](FINDINGS.md#f4-080) | [D4-080](#d4-080) |
| [F4-081](FINDINGS.md#f4-081) | [D4-081](#d4-081) |
| [F4-082](FINDINGS.md#f4-082) | [D4-082](#d4-082) |
| [F4-083](FINDINGS.md#f4-083) | [D4-071](#d4-071) |
| [F4-084](FINDINGS.md#f4-084) | [D4-084](#d4-084) |
| [F4-085](FINDINGS.md#f4-085) | [D4-070](#d4-070) |
| [F4-086](FINDINGS.md#f4-086) | [D4-076](#d4-076) |
| [F4-087](FINDINGS.md#f4-087) | [D4-099](#d4-099) |
| [F4-088](FINDINGS.md#f4-088) | [D4-100](#d4-100) |
| [F4-089](FINDINGS.md#f4-089) | [D4-101](#d4-101) |
| [F4-090](FINDINGS.md#f4-090) | [D4-102](#d4-102) |
| [F4-091](FINDINGS.md#f4-091) | [D4-070](#d4-070) |
| [F4-092](FINDINGS.md#f4-092) | [D4-057](#d4-057) |
| [F4-093](FINDINGS.md#f4-093) | [D4-059](#d4-059), [D4-060](#d4-060) |
| [F4-094](FINDINGS.md#f4-094) | [D4-063](#d4-063) |
| [F4-095](FINDINGS.md#f4-095) | [D4-065](#d4-065) |
| [F4-096](FINDINGS.md#f4-096) | [D4-064](#d4-064) |
| [F4-097](FINDINGS.md#f4-097) | [D4-067](#d4-067) |
| [F4-098](FINDINGS.md#f4-098) | [D4-070](#d4-070) |
| [F4-099](FINDINGS.md#f4-099) | [D4-068](#d4-068) |
| [F4-100](FINDINGS.md#f4-100) | [D4-069](#d4-069) |
| [F4-101](FINDINGS.md#f4-101) | [D4-096](#d4-096) |
| [F4-102](FINDINGS.md#f4-102) | [D4-096](#d4-096) |
| [F4-103](FINDINGS.md#f4-103) | [D4-096](#d4-096) |
| [F4-104](FINDINGS.md#f4-104) | [D4-076](#d4-076) |
| [F4-105](FINDINGS.md#f4-105) | [D4-073](#d4-073) |
| [F4-106](FINDINGS.md#f4-106) | [D4-073](#d4-073) |
| [F4-107](FINDINGS.md#f4-107) | [D4-053](#d4-053), [D4-074](#d4-074), [D4-075](#d4-075), [D4-076](#d4-076) |
| [F4-108](FINDINGS.md#f4-108) | [D4-074](#d4-074), [D4-075](#d4-075) |
| [F4-109](FINDINGS.md#f4-109) | [D4-073](#d4-073) |
| [F4-110](FINDINGS.md#f4-110) | [D4-063](#d4-063) |
| [F4-111](FINDINGS.md#f4-111) | [D4-063](#d4-063) |
| [F4-112](FINDINGS.md#f4-112) | [D4-097](#d4-097) |
| [F4-113](FINDINGS.md#f4-113) | [D4-097](#d4-097) |
| [F4-114](FINDINGS.md#f4-114) | [D4-097](#d4-097) |
| [F4-115](FINDINGS.md#f4-115) | [D4-097](#d4-097) |
| [F4-116](FINDINGS.md#f4-116) | [D4-054](#d4-054) |
| [F4-117](FINDINGS.md#f4-117) | [D4-049](#d4-049) |
| [F4-118](FINDINGS.md#f4-118) | [D4-064](#d4-064) |
| [F4-119](FINDINGS.md#f4-119) | [D4-070](#d4-070) |
| [F4-120](FINDINGS.md#f4-120) | [D4-096](#d4-096) |
| [F4-121](FINDINGS.md#f4-121) | [D4-103](#d4-103) |
| [F4-122](FINDINGS.md#f4-122) | [D4-096](#d4-096) |
| [F4-123](FINDINGS.md#f4-123) | [D4-098](#d4-098) |
| [F4-124](FINDINGS.md#f4-124) | [D4-096](#d4-096) |
| [F4-125](FINDINGS.md#f4-125) | [D4-072](#d4-072) |
| [F4-126](FINDINGS.md#f4-126) | [D4-078](#d4-078) |
| [F4-127](FINDINGS.md#f4-127) | [D4-104](#d4-104) |
| [F4-128](FINDINGS.md#f4-128) | [D4-097](#d4-097) |
| [F4-129](FINDINGS.md#f4-129) | [D4-064](#d4-064) |
| [F4-130](FINDINGS.md#f4-130) | [D4-067](#d4-067) |
| [F4-131](FINDINGS.md#f4-131) | [D4-105](#d4-105) |
| [F4-132](FINDINGS.md#f4-132) | [D4-105](#d4-105) |
| [F4-133](FINDINGS.md#f4-133) | [D4-098](#d4-098) |
| [F4-134](FINDINGS.md#f4-134) | [D4-097](#d4-097) |
| [F4-135](FINDINGS.md#f4-135) | [D4-058](#d4-058) |
| [F4-136](FINDINGS.md#f4-136) | [D4-098](#d4-098) |
| [F4-137](FINDINGS.md#f4-137) | [D4-097](#d4-097) |
| [F4-138](FINDINGS.md#f4-138) | [D4-097](#d4-097) |
| [F4-139](FINDINGS.md#f4-139) | [D4-095](#d4-095) |
| [F4-140](FINDINGS.md#f4-140) | [D4-106](#d4-106) |
| [F4-141](FINDINGS.md#f4-141) | [D4-096](#d4-096) |
| [F4-142](FINDINGS.md#f4-142) | [D4-098](#d4-098) |
| [F4-143](FINDINGS.md#f4-143) | [D4-095](#d4-095) |
| [F4-144](FINDINGS.md#f4-144) | [D4-072](#d4-072) |
| [F4-145](FINDINGS.md#f4-145) | [D4-096](#d4-096) |
| [F4-146](FINDINGS.md#f4-146) | [D4-097](#d4-097) |
| [F4-147](FINDINGS.md#f4-147) | [D4-083](#d4-083) |
| [F4-148](FINDINGS.md#f4-148) | [D4-095](#d4-095) |
| [F4-149](FINDINGS.md#f4-149) | [D4-096](#d4-096) |
| [F4-150](FINDINGS.md#f4-150) | [D4-085](#d4-085) |
| [F4-151](FINDINGS.md#f4-151) | [D4-096](#d4-096) |
| [F4-152](FINDINGS.md#f4-152) | [D4-061](#d4-061) |
| [F4-153](FINDINGS.md#f4-153) | [D4-096](#d4-096) |
| [F4-154](FINDINGS.md#f4-154) | [D4-097](#d4-097) |
| [F4-155](FINDINGS.md#f4-155) | [D4-097](#d4-097) |
| [F4-156](FINDINGS.md#f4-156) | [D4-090](#d4-090) |
| [F4-157](FINDINGS.md#f4-157) | [D4-096](#d4-096) |
| [F4-158](FINDINGS.md#f4-158) | [D4-030](#d4-030), [D4-031](#d4-031), [D4-032](#d4-032), [D4-035](#d4-035) |
| [F4-159](FINDINGS.md#f4-159) | [D4-033](#d4-033), [D4-034](#d4-034), [D4-035](#d4-035) |
| [F4-160](FINDINGS.md#f4-160) | [D4-038](#d4-038), [D4-042](#d4-042), [D4-043](#d4-043), [D4-044](#d4-044), [D4-045](#d4-045) |
| [F4-161](FINDINGS.md#f4-161) | [D4-028](#d4-028), [D4-029](#d4-029) |
| [F4-162](FINDINGS.md#f4-162) | [D4-012](#d4-012) |
| [F4-163](FINDINGS.md#f4-163) | [D4-039](#d4-039) |
| [F4-164](FINDINGS.md#f4-164) | [D4-040](#d4-040) |
| [F4-165](FINDINGS.md#f4-165) | [D4-041](#d4-041) |
| [F4-166](FINDINGS.md#f4-166) | [D4-046](#d4-046) |
| [F4-167](FINDINGS.md#f4-167) | [D4-047](#d4-047) |
| [F4-168](FINDINGS.md#f4-168) | [D4-048](#d4-048) |

## 4. Pełne pokrycie propozycji F2 §7

Każdy składnik P2 pozostaje osobnym wyborem na wskazanej karcie lub częścią wspólnej reguły. Nie akceptujemy całej grupy P2 jednym wariantem innej karty.

| Źródło | Składnik propozycji i decyzja |
|---|---|
| P2-01 | Katalog line-draw/title-pop/tile-hit/tile-miss/piece-fall/shake: [D4-073](#d4-073) |
| P2-01 | Czekanie, para i komplet/set-glow: [D4-077](#d4-077), [D4-100](#d4-100) |
| P2-02 | set-glow 0,9 s ×4; ring-pulse 1,2 s; title-pop 0,5 s lub 350; tile-hit/miss 350; piece-fall 500; shake 300: [D4-074](#d4-074) |
| P2-02 | Pasek czasu i postępu linear równy krokowi: [D4-076](#d4-076) |
| P2-02 | Ruch będący treścią gry: [D4-053](#d4-053) |
| P2-02 | Pokaz W pamięci 180 ms; Szybki Chińczyk 110/400 ms: [D4-075](#d4-075) |
| P2-02 | Odsłona wyniku stone-pop lub od razu: [D4-078](#d4-078) |
| P2-03 | Ruch-zadanie i akcja po marszu: [D4-051](#d4-051), [D4-052](#d4-052), [D4-053](#d4-053) |
| P2-03 | Widoczny float-up i pierwsza klatka Intro: [D4-054](#d4-054) |
| P2-03 | Zaznaczenie na czas i okno z dotyku od razu: [D4-101](#d4-101), [D4-102](#d4-102) |
| P2-04 | Metronom 30; ignorowany ruch; legalne pudło: [D4-079](#d4-079), [D4-080](#d4-080), [D4-083](#d4-083) |
| P2-04 | Szkoda od innego i nowa tura/faza: [D4-081](#d4-081), [D4-084](#d4-084) |
| P2-05 | Jedna lista tokenów, btn-player: [D4-062](#d4-062) |
| P2-05 | Kalambury jako własny nagłówek z pełnym zakresem: [D4-067](#d4-067) |
| P2-05 | Results/ScoreTable, RoundTable children i cele: [D4-068](#d4-068), [D4-069](#d4-069) |
| P2-05 | Przycisk po odsłonie, Dalej/Wyniki/Gotowe: [D4-070](#d4-070), [D4-071](#d4-071) |
| P2-05 | Intro time = długość partii: [D4-072](#d4-072) |
| P2-06 | accent-hover i znak aplikacji: [D4-062](#d4-062) |
| P2-06 | warning ostrzega przed skutkiem ruchu: [D4-064](#d4-064) |
| P2-06 | 4 px odznaki turnieju: [D4-063](#d4-063) |
| P2-07 | Dwa akcenty Home: [D4-066](#d4-066) |
| P2-07 | Dalej w partii i między grami turnieju: [D4-070](#d4-070) |
| P2-08 | 360×640 i listy poza partią: [D4-055](#d4-055), [D4-056](#d4-056), [D4-057](#d4-057), [D4-058](#d4-058) |
| P2-08 | Gęste plansze, pola Kampus Tour i 48 px: [D4-059](#d4-059), [D4-060](#d4-060) |
| P2-08 | Rogi, 2.5D, poświaty, promienie, uchwyt suwaka, figury Obrotu, gradient Koła: [D4-063](#d4-063) |
| P2-08 | Pary Odcienia zamiast RoundTable: [D4-069](#d4-069) |
| P2-08 | Drugi sygnał pionków/kamieni: [D4-065](#d4-065) |

## 5. Pełne pokrycie propozycji F3 §12

| Źródło | Treść / decyzje |
|---|---|
| P3-01 | Juwenalia i budynki: [D4-036](#d4-036), [D4-037](#d4-037) |
| P3-02 | Liczenie po równo: [D4-015](#d4-015) |
| P3-03 | Sekwencja T(N), timeout i remis: [D4-004](#d4-004), [D4-032](#d4-032) |
| P3-04 | Który rok? limit: [D4-011](#d4-011) |
| P3-05 | Telefon a Refleks/Stój!: [D4-049](#d4-049) |
| P3-06 | Państwa-miasta Ł i głosowanie: [D4-010](#d4-010), [D4-046](#d4-046) |
| P3-07 | Brak tie Kubków i komplet W pamięci: [D4-030](#d4-030), [D4-031](#d4-031) |
| P3-08 | Nowe limity i losowanie: [D4-004](#d4-004), [D4-006](#d4-006), [D4-007](#d4-007), [D4-008](#d4-008), [D4-009](#d4-009), [D4-013](#d4-013), [D4-014](#d4-014), [D4-015](#d4-015), [D4-016](#d4-016), [D4-017](#d4-017), [D4-018](#d4-018), [D4-019](#d4-019), [D4-020](#d4-020), [D4-021](#d4-021), [D4-022](#d4-022), [D4-023](#d4-023), [D4-024](#d4-024), [D4-025](#d4-025), [D4-026](#d4-026), [D4-027](#d4-027), [D4-028](#d4-028) |
| P3-09 | Kampus Tour: ekonomia/monopol/premia/MPK: [D4-038](#d4-038), [D4-039](#d4-039), [D4-040](#d4-040), [D4-041](#d4-041) |
| P3-10 | Lista limitów i jeden termin: [D4-004](#d4-004), [D4-006](#d4-006), [D4-007](#d4-007), [D4-008](#d4-008), [D4-009](#d4-009), [D4-011](#d4-011), [D4-012](#d4-012) |
| P3-11 | Domyślna długość Turnieju: [D4-048](#d4-048) |
| P3-12 | Model T, próg 20%/10 s: [D4-005](#d4-005) |
| P3-13 | Stały komplet przy ryzyku: [D4-028](#d4-028), [D4-029](#d4-029) |
| P3-14 | Osiągalny sufit/tie: [D4-030](#d4-030), [D4-031](#d4-031), [D4-032](#d4-032), [D4-033](#d4-033), [D4-034](#d4-034), [D4-035](#d4-035) |
| P3-15 | Względny wynik lub stały cel/tempo: [D4-013](#d4-013), [D4-014](#d4-014) |

## 6. F3:D-01..D-14: status propozycji i metody

Kontekst fazy 3 sam nazywa te punkty propozycjami plannera. Wykonanie audytu upoważniało do jego metody, nie zatwierdziło nowych reguł produktu. „Zastosowano metodę” nie znaczy „użytkownik wybrał wariant”.

| F3 | Rozliczenie w 04-02 |
|---|---|
| D-01 | Metoda zakresu: 30 mini-gier, 8 głównych i Turniej, zachowane. Nie dodaje gry. |
| D-02 | Wszystkie 14 przekazań F3 §10 mapuje się przez F4 w §3; limity D4-004..012, losowanie D4-013..027, Juwenalia/budynki D4-036/037, marsz D4-051/052, wysyłka D4-071, pomiar D4-049, kary/format D4-096. |
| D-03 | Kierunek record to inna kwestia niż użyteczność tie; D4-030..035 i D4-086. |
| D-04 | Setup mierzy rozrzut liczb, nie trudność dla człowieka; decyzje losowania i P15-P19/P21/P22 w EVIDENCE. |
| D-05 | Osiągalność sufitu nadal A/Z; P09-P13, D4-030..035. Bez nowych wyników ludzi. |
| D-06 | Krzywe ze stałych/modelu nie dowodzą ludzkiego progu; U13/U14, D4-021/027/033/049/053. |
| D-07 | 20% i 10 s to wariant A D4-005 oczekujący decyzji; dzisiejsze ZASADY wymagają zapasu bez tych liczb. |
| D-08 | Boty jedynie wskazują hipotezy; P01-P08 i D4-038..045, bez automatycznej zmiany ekonomii. |
| D-09 | Oddzielono wagę, pewność i przyszły priorytet; M dodano tylko do zmierzonych wystąpień; nie zmieniono wag. |
| D-10 | Skrypty diagnostyczne w /tmp, brak nowych zależności; to metoda analizy, nie nowa reguła gry. |
| D-11 | Bez połączenia z Pi, bez analizy zastanej bazy; osobna baza pomiarowa w /tmp. Przyszła kopia tylko udostępniona do analizy. |
| D-12 | Szablon audytu zachowany jako źródło; S/W/Z/A/M jawne, brak pomiaru nazwany w EVIDENCE. |
| D-13 | Warianty mają odsyłacze, rekomendację i status oczekuje. Brak decyzji agenta zastępującej użytkownika. |
| D-14 | Podział grup audytu nie jest podziałem wdrożenia. Pakiety i odbiór dopiero 04-03. |

## 7. Istniejące odstępstwa: wszystkie 47 pozycji

Pełne powody i plik:linia są w FINDINGS §5.2/§5.3. Tu sprawdzono ich aktualność i konflikt z propozycjami. Końcowa zgoda ZG4-v1 §6 zatwierdza wskazane powody z jawnymi korektami powiązanych pakietów. Poniższa tabela zachowuje treść rekomendacji 04-02; ostateczny wybór wynika z §14 i ZG4-v1 §6. Nie doliczamy odstępstw jako kolejnych F4.

| Źródło | Rekomendacja / powiązanie |
|---|---|
| F1:O01 | Utrzymać zaufany model mini-gier z ZASADY-GIER §1; antycheat poza zakresem. |
| F1:O02 | Utrzymać pomiar na kliencie; walidacja nadal na serwerze. Korekty zegara D4-049 nie przenoszą gry do sieci. |
| F1:O03 | Utrzymać liczenie Koła z punktów, z jawnym modelem zaufania. |
| F1:O04 | Otwarty konflikt: optymalny ruch może wygrać bez aktywnego gracza; D4-042 daje konkretną alternatywę z rng. |
| F1:O05 | Zachować już oddane prawdziwe próby Koła, dopisać powód, dlaczego timeout ich nie zeruje; odnowienie terminu osobno D4-012. |
| F1:O06 | Utrzymać karę -2 w Stój!, bo blokada zabierałaby bodźce; nie objęte automatycznie zmianą wibracji. |
| F1:O07 | Utrzymać karę punktową obok blokady w Obrocie/Literówce, bo dwie odpowiedzi dawałyby darmową próbę. |
| F1:O08 | Utrzymać jedyny dźwięk Rytmu; wibracja metronomu D4-083. |
| F1:O09 | Utrzymać cele jako wyróżnik partii Przytrzymaj/Zasłony; nie zastępuje decyzji o rozkładzie celów D4-024. |
| F1:O10 | Utrzymać progress jako podgląd, nie wynik; D4-004 tworzy inną semantykę progress Sekwencji i wymaga jawnego kontraktu. |
| F1:O11 | Utrzymać strefę palca w px w Środku; wynik nadal w jednostkach gry. |
| F1:O12 | Utrzymać opisane zniekształcenie Mapy do 6%; pytanie o trudność pozostaje MP-01. |
| F1:O13 | Utrzymać wpływ wyboru par na dalszą planszę; D4-018 nie gwarantuje identycznych ścieżek graczy. |
| F1:O14 | Premia ma opis, ale jej wysokość oczekuje P01 / D4-038; nie jest wyjątkiem od startu players[0]. |
| F2:O01 | Utrzymać poziomą scenę jako wyjątek; D4-058/060 naprawiają obcięcie i cele po skalowaniu. |
| F2:O02 | Własny nagłówek tak, pełny zakres informacji D4-067 oraz kolor i status końca D4-082. |
| F2:O03 | D4-067: uzupełnić listę o Kalambury, zachować pełny zakres nagłówka. |
| F2:O04 | Utrzymać grupy jako treść, z ikoną grupy; rozszerzenia dekoracji osobno D4-063. |
| F2:O05 | Utrzymać istniejące cienie okien/pionków/set-glow, nie rozszerzać automatycznie na inne; D4-063. |
| F2:O06 | D4-060: 44 px sceny i 35 px po zoom nie stają się dozwolone samą adnotacją w DESIGN. |
| F2:O07 | Utrzymać obrys robiony box-shadow jako obrys, nie cień dekoracyjny. |
| F2:O08 | Utrzymać pochodne tokenów i koloru gracza; to nie nowe kolory dekoracji. |
| F2:O09 | D4-064 rozdziela trafienie Statków w accent od nielegalnego użycia tokenu jako błędu. |
| F2:O10 | Utrzymać opisany SWAP_MS 1200 ms Statków; nie rozszerza wyjątku na inne animacje. |
| F2:O11 | D4-075: jawny czas 110/400 dla Szybkiego, nie automatyczna zmiana reguły. |
| F2:O12 | Utrzymać emoji jako symbole kart Memory. |
| F2:O13 | Utrzymać paletę rysowania Kalamburów jako treść. |
| F2:O14 | Utrzymać poświatę w kolorze rysującego. |
| F2:O15 | Prostokątna odznaka turnieju jest opisana, 4 px promienia do D4-063. |
| F2:O16 | Utrzymać ukryty licznik tam, gdzie zdradza czas; D4-076 nie ma go przywracać. |
| F2:O17 | Utrzymać metronom jako jedyny dźwięk; D4-083. |
| F2:O18 | Wiersz 30 ms wymaga D4-083, nie nowego wzoru nagrody. |
| F2:O19 | Utrzymać paletę Sekwencji z kształtami jako treść. |
| F2:O20 | Utrzymać napisy/paletę Stroopa jako treść, bez przymusu nowego modułu palety. |
| F2:O21 | Utrzymać figury Innego elementu jako treść. |
| F2:O22 | Utrzymać próbki i tor Odcienia; uchwyt kontrolki i rozmiar rozdzielone D4-060/063. |
| F2:O23 | Utrzymać losowość czysto klienckiej dekoracji/wyboru; zasady nadal tylko rng. |
| F2:O24 | Konflikt ogólnej reguły reduced motion rozstrzyga D4-053, nie uznawać komentarza za globalny wyjątek. |
| F2:O25 | Utrzymać zapalanie Sekwencji jako treść, bez wyłączenia informacji w reduced motion. |
| F2:O26 | Utrzymać punktową karę i Do końca w Stój!; D4-080 dotyczy informacji zwrotnej. |
| F2:O27 | Utrzymać blokadę 1 s jako zasadę gry, nie blokującą animację; D4-087 nie usuwa kary. |
| F2:O28 | Utrzymać figury balonu/kubka/klocka/kulki jako treść, D4-063 dotyczy dekoracji. |
| F2:O29 | Utrzymać miniatury Koła zamiast osobnej tabeli; dolne akcje do D4-057. |
| F2:O30 | Utrzymać ikonę wyzwania jako wzorzec; nie legalizuje drugiego wypełnionego przycisku. |
| F2:O31 | Dwa akcenty Home rozstrzyga D4-066. |
| F2:O32 | Utrzymać zdanie o blokadzie startu zamiast pustego przycisku. |
| F2:O33 | Słowa o różnych skutkach rozstrzyga D4-070; Pokrój pozostaje czynnością gry, nie zamienia się mechanicznie w Dalej. |

<a id="mp-01"></a>

## 8. MP-01: pomiar Mapy bez stwierdzonego błędu

Status: **zatwierdzona: wariant B, zakończyć obserwację w ramach audytu** (2026-10-26, ZG4-v1; użytkownik „Zatwierdzam”). Powiązanie: P21 w EVIDENCE, F3 §11 pozycja 21, bez nowego wpisu F4. Nie jest to karta D4 rozbieżności.

- A: zebrać błędy tej samej osoby dla miast przy granicy i wewnątrz, wrócić do trudności dopiero po wykazaniu zależności.
- B: zakończyć obserwację, pozostawić obecną pulę bez dodatkowej hipotezy.
- Rekomendacja: A tylko jeśli użytkownik chce rozwijać temat; nie blokuje niezależnych poprawek.
- Właściciel: użytkownik zbiera partie, agent analizuje dostarczone rundy. Jednostka km, detail, rekordy i turniej pozostają bez zmian, bo to wybór pomiaru. Brak proponowanej zmiany dokumentów zasad przed wynikiem; ewentualny nowy problem dostaje osobny wpis i decyzję.

## 9. Przekazanie do 04-03 (historyczny stan po 04-02)

106 kart D4 obejmuje 168 istniejących wpisów, MP-01 obejmuje pytanie bez rozbieżności. Wszystkie statusy oczekują. 04-03 powinien rozdzielić poprawki literalne, zmiany zasad i zmiany danych, wyznaczyć priorytety oraz odbiór każdego pakietu. Pakiet zależny od P/U może mieć gotowy zakres z otwartym pomiarem, lecz nie może udawać, że brakujący dowód już istnieje. Migracja/archiwizacja/czyszczenie wymagają odrębnej, konkretnej decyzji i nie wchodzą tu automatycznie.


<a id="b4-001"></a>

## 10. 04-04: akceptacja paczki B4-001 (historyczny stan po pierwszej zgodzie)

Status: **zatwierdzona: poprawić pięć pakietów według wariantów poniżej**. Data: 2026-10-26. Źródło: odpowiedź użytkownika „Zatweirdzam” na końcowe pytanie asystenta o dokładnie tę paczkę, bez wyjątków. Podstawa: REPORT R4-v1 / PACKAGES PK4-v1; HEAD `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3`. Sprawdzono brak zmian kodu i dokumentów źródłowych względem dowodów 04-02/04-03. Korekta zapisu SHA w REPORT/PACKAGES usuwa tylko niezamierzone spacje, bez zmiany wariantów lub zakresu.

Polecenie „Kolejny etap” uruchamia zbieranie wyborów w 04-04, nie oznacza akceptacji pakietów. Przed pytaniem o B4-001 nie było wyboru wariantów; późniejsza odpowiedź „Zatweirdzam” zatwierdza wyłącznie poniższy zakres.

| Pakiet PK4-v1 | Wariant i ograniczony zakres | Skutek / dowód |
|---|---|---|
| [P4-005](PACKAGES.md#p4-005) | D4-071:A, wyłącznie F4-083 | W pamięci wysyła wynik przy błędzie/komplecie bez dodatkowego Wyniki; brak zmiany działań i tie. Dowód: analiza wysyłki w F4-083. |
| [P4-006](PACKAGES.md#p4-006) | D4-055:A, tylko F4-056:naglowek-Game | Zwinięty nagłówek zostawia miejsce planszy, pełne informacje po rozwinięciu. E01-E06. |
| [P4-012](PACKAGES.md#p4-012) | D4-055:A, tylko F4-056:kalambury | Zgadnij/Pasuję mieszczą się na 360×640. E07; bez zmiany hint, punktów i limitu. |
| [P4-013](PACKAGES.md#p4-013) | D4-055:A, tylko F4-056:kolo; po P4-006 | Płótno dopasowane do wysokości, zakończenie prób dostępne. E09; punktacja bez zmian. |
| [P4-016](PACKAGES.md#p4-016) | D4-057:A, F4-092 całość | Wyniki przewijane pionowo, Rewanż/Do lobby/Dalej przy dolnej krawędzi. E08/E10/E12; U07 pozostaje warunkiem odbioru. |

Decyzja użytkownika: **poprawić wszystkie pięć według wskazanych wariantów**, bez wyjątków. Akceptacja obejmuje dokumentację i kryteria odbioru kart, nie oznacza wykonania poprawek. Sam wybór D4-055:A dla tych części nie zatwierdza pozostałych gier objętych F4-056. Wiadomość „Zatweirdzam” odnosi się dokładnie do B4-001, powyższych pięciu kart PK4-v1 oraz ich dokumentacji i kryteriów odbioru.

Pozostałe 57 pakietów, 27 pozycji H, kwestie G-DANE/limitów i inne części F4 nadal oczekują. W 04-04 nie ma implementacji, commitów ani push. Rzeczywista decyzja B4-001 została przeniesiona do kart i wskazanych F4. Pozostałe 57 pakietów nie ma akceptacji; 04-04 pozostaje w toku. FIX-01 i FIX-02 otwarte.


<a id="b4-002"></a>

## 11. Akceptacja B4-002 (historyczny stan po drugiej zgodzie)

Status: **zatwierdzona: poprawić P4-003/004/036 według wskazanych wariantów**, bez wyjątków. Źródło: użytkownik „Tak” w odpowiedzi na pytanie o B4-002 wraz z zachowaniem dotychczasowych rekordów. Podstawa: R4-v1 / PK4-v1; data 2026-10-26.

| Pakiet | Proponowany wariant i zakres | Skutek / dowód |
|---|---|---|
| [P4-003](PACKAGES.md#p4-003) | D4-006:A, D4-050:A; F4-002:zakupy i F4-059 | Zakupy: 80 s limitu platformy; po 50 s wybierania oddanie zaznaczeń automatycznie; pomiar kończy pointerdown, klawiatura nadal działa. T=63 s wobec obecnych 60 s i onClick: F4-002/F4-059. Lista nadal 10 przedmiotów. |
| [P4-004](PACKAGES.md#p4-004) | D4-004:A; tylko F4-002:simon | Sekwencja: po 300 s zapis ostatniej zaliczonej serii przez walidowany progress zamiast wyniku 0. Bez nowego tie szybkości. Dowód: F4-002, wyliczenie czasu rosnącej serii. |
| [P4-036](PACKAGES.md#p4-036) | D4-059:A; F4-093:geste-plansze (Gomoku/Statki/Chińczyk/Labirynt) | Mniejsze niż 48 px pola tylko z podglądem i osobnym potwierdzeniem co najmniej 48 px. W Labiryncie oznacza to dodanie potwierdzenia, którego obecnie brak. Bez zmiany legalności ruchów. |

Zatwierdzony wybór danych G-DANE dla P4-003/004: **zachować stare rekordy bez przeliczania, kasowania ani nowej wersji bazy**. Jednostki i kryteria pozostają bez zmian. Stare czasy Zakupów pochodzą z dawnego click i mogą zawierać czas puszczenia palca; nie korygować ich szacunkowo. Sekwencja nie odzyska postępu utraconego w dawnych timeoutach. Odpowiedź „Tak” zamyka wybór G-DANE tylko dla tych dwóch pakietów, z powyższym zachowaniem historii. Nie upoważnia do migracji, przeliczania ani kasowania i nie obejmuje innych gier.

P4-003/004 pozostają zależne od wyboru P4-001 w zakresie wspólnej normy; zatwierdzenie B4-002 nie zatwierdza automatycznie całego P4-001 ani jego pozostałych zmian. Wdrożenie nadal dopiero po zakończeniu uzgadniania zakresu. Pozostałe pakiety, polityka innych rekordów i wszystkie H pozostają otwarte.


<a id="b4-003"></a>

## 12. B4-003: pozostałe plansze i animacje ruchu

Status: **zatwierdzona w ZG4-v1** (2026-10-26, użytkownik „Zatwierdzam”). Osobne pytanie o B4-003 zastąpiono na prośbę użytkownika jednym wyborem całego pozostałego zakresu (§13). Poniższy zestaw zachowano jako część propozycji, bez dorozumianej akceptacji z B4-001/B4-002. Podstawa: R4-v1 / PK4-v1. Rekomendacja: poprawić poniższe osiem pakietów w granicach ich kart i wariantów A.

| Pakiet / wariant | Dokładne wystąpienie | Skutek / dowód |
|---|---|---|
| [P4-007](PACKAGES.md#p4-007), D4-055:A | F4-056:piec-w-rzedzie | Gomoku: cała plansza i Postaw widoczne równocześnie. E05. |
| [P4-008](PACKAGES.md#p4-008), D4-055:A | F4-056:statki | Statki: rozstawianie i aktywna plansza mieszczą się; Obróć/Losuj/Gotowe dostępne. E06, U01 dla bitwy i trybów. |
| [P4-009](PACKAGES.md#p4-009), D4-055:A | F4-056:chinczyk | Chińczyk: dolne domki i Rzuć w ekranie, Klasyczny/Szybki. E04. |
| [P4-010](PACKAGES.md#p4-010), D4-055:A | F4-056:labirynt | Labirynt: własny pionek, plansza i akcje dostępne. E03. |
| [P4-011](PACKAGES.md#p4-011), D4-055:A | F4-056:memory | Memory: wszystkie rzędy, zwłaszcza Średnia, i instrukcja widoczne. E01/E02. Karty nadal co najmniej 48 px; nie dopisywać dla nich wyjątku gęstych plansz. |
| [P4-017](PACKAGES.md#p4-017), D4-058/059/060/067:A tylko Kampus Tour | F4-058/130/135 całość i F4-093:kampus-tour | Czytelny licznik, akcje i log 1-2 wpisy; bez ucięcia Podsumowania. Przyciski 48 px po skalowaniu, małe pola z podglądem/potwierdzeniem. Wygrane i Oglądasz uzupełnione. E13-E15. |
| [P4-018](PACKAGES.md#p4-018), D4-051/105:A | F4-057:kampus-tour, F4-131/132 całość | Dotknięcie kończy marsz i udostępnia decyzję; turlanie tylko po rzucie, karta/MPK/Kolokwium przeskakują bez udawanego rzutu. S/W: blokada do 3340 ms. |
| [P4-019](PACKAGES.md#p4-019), D4-052:A | F4-057:chinczyk | Dotknięcie kończy animację i pozwala wykonać ruch w obu trybach; stan serwera pozostaje podstawą. S/W: blokada animacji przy biegnącym limicie. |

P4-006 (nagłówek) i P4-036 (wyjątek/potwierdzenia) są już zaakceptowane. Zgoda ZG4-v1 objęła powyższe lokalne zakresy, ich dokumentację i odbiór; tych wcześniejszych zależności nie zatwierdzano ponownie. D4-059:A w pozostałych kartach plansz odwołuje się do już wybranego wyjątku dla czterech gier z B4-002; Memory nie dostaje nowego wyjątku.

W Kampus Tour zakres tej grupy obejmuje D4-059/060/067:A w P4-017; inne kontrolki, kolory i własne nagłówki również zatwierdzono końcową zgodą w ich odpowiednich pakietach. Pełne odbiory U01 i scenariusze kart pozostają wymagane, nie zostały wykonane przez samo zatwierdzenie. Bez zmian punktacji, ekonomii, losowania czy limitów tury. Stare rekordy pozostają nietknięte. Implementacja nadal należy do fazy 5.


<a id="zg4-v1"></a>

## 13. Przygotowanie jednej końcowej propozycji ZG4-v1 (historia)

2026-10-26 użytkownik zlecił „Zrób jedną końcową zgode”. Przygotowano [FINAL-APPROVAL.md](FINAL-APPROVAL.md), zastępując dalsze pytania o paczki, w tym B4-003. Samo to zlecenie nie było akceptacją. Późniejsza odpowiedź „Zatwierdzam” zatwierdziła cały przedstawiony zakres; rzeczywistą zgodę rejestruje §14.

<a id="zg4-accepted"></a>

## 14. Końcowa akceptacja ZG4-v1 (2026-10-26)

Status: **zatwierdzona w całości, bez wyjątków**. Źródło: użytkownik „Zatwierdzam” bezpośrednio w odpowiedzi na końcowe pytanie o cały ZG4-v1, bez kolejnych zgód na poszczególne paczki. SHA-256 pliku FINAL-APPROVAL.md przedstawionego do decyzji, przed adnotacją statusu: `74ce15d8fa94a864ab0b2abbf48b0dd2320ef5d02140ad48a65655a5fe456183`.

- Dotychczasowe 8 zgód B4-001/B4-002 pozostają ważne. ZG4-v1 dodaje 54 pozostałe pakiety: łącznie P4-001..062 do wykonania w granicach kart PK4-v1 i jawnych uściśleń ZG4-v1 §3. Bez dorozumianej zgody na inne zmiany.
- Wszystkie 106 wyborów D4 z ZG4-v1 §4 zatwierdzone, w tym nowy D4-018:C oraz lokalny podział A/B D4-090. D4-059 nie daje wyjątku Memory; D4-060 w Śledzeniu oznacza panel §3.4, bez zmiany GAP.
- Wszystkie 27 H: **zostawić jako świadome odstępstwo z podanym powodem na ten etap**, a nie odłożyć samą decyzję. Wykonać dokumentację powodów. Pytania pomiarowe pozostają materiałem do ewentualnych odrębnych badań; nie uruchamiają alternatyw A automatycznie.
- Wszystkie 47 odstępstw: według ZG4-v1 §6 i DECISIONS §7, z jawnymi zmianami w pakietach. MP-01:B: zakończyć obserwację Mapy w tym audycie, bez nowego błędu lub generatora.
- G-DANE: zachować stare liczby, tie, detail, wygrane i wspólną historię mimo różnic metod/trudności. Nowe timeouty Schulte/Sudoku bez rekordu, stare bez zgadywania statusu ukończenia. Znane tie przed null przy tym samym score, null nigdy nie jest zerem. Bez migracji, kasowania, wersji bazy lub zmiany id.
- G-LIMITY: tabela 30 mini-gier w ZG4-v1 §3.3 zatwierdzona. Nazwane wyjątki normy: Środek 60 s, Tort 120 s, Który rok? 270 s (18,4% przy 228 s przebiegu). P4-022 po P4-003/004/020/021, bez odnawiania wynikiem rywala.
- G-KONTRAKT: GameResult.places i zaufane source client/timeout zatwierdzone, z użyciem także dla Schulte/Sudoku. Testy zgodności nadal wymagane przed wdrożeniem.

Kontrola mapy: 295/295 jednostek ma decyzję, w tym **267 poprawić i 28 pozostawić** (27 H, jedno H obejmuje dwa F4). W 168 F4: **158 w całości poprawić, 8 w całości pozostawić, 2 mieszane z decyzją dla każdej części**. Zero nierozstrzygniętych decyzji. P4-028 obejmuje ponadto istniejący F1:O04 bez nowego F4.

Zgoda nie jest dowodem wykonania pomiaru ani poprawki. U01-U14 i P11/U14 warunkujące wykonanie/odbiór zachowane. Ślad wdrożenia i odbioru: [PHASE-5-SCOPE.md](PHASE-5-SCOPE.md). Rozdrobnienie pracy nie wymaga nowej zgody na identyczny zakres. Commit, push, produkcja i nowe zależności nadal wymagają odrębnego upoważnienia, którego tu nie udzielono.

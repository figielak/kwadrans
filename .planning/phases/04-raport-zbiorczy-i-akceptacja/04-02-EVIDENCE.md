# 04-02: dowody i otwarte pomiary

Data: 2026-10-26. Wersja 1. Zakres: wybrane pomiary UI oraz przygotowanie decyzji, bez poprawek aplikacji. Polecenie użytkownika „DObra startuj” kontynuuje zatwierdzone wykonanie planu 04-02.

## 1. Środowisko i metoda

- Gałąź `labirynt`, HEAD `85f0e4fe4e1183c390f9a7c88ad64b5b817d2cb3`. Początkowo czyste drzewo. `git diff e5ac65a..HEAD -- apps packages KONCEPT.md ZASADY-GIER.md ZASADY.md DESIGN.md` pusty: lokalizacje dowodów 04-01 nadal aktualne.
- Node 24.18.0, pnpm 12.9.1, zastane zależności. Serwer `DB_PATH=/tmp/kwadrans-04-02.db pnpm --filter server dev`, frontend `pnpm --filter web dev --host 127.0.0.1`. Użyto Playwright MCP, HeadlessChrome 155, Linux, DPR 1, `prefers-reduced-motion: no-preference`. Satoshi i Geist Mono załadowane (`document.fonts.ready` i `check`).
- Otwarto istniejące `/dev?n=4`. Tylko w DOM sesji ustawiono ramki na **360×640 CSS px** (`box-sizing: content-box`), zamiast domyślnych 390×780. Rozmiar nadrzędnego panelu 1540×700, potem 1900×700, nie jest rozmiarem telefonu. Cienka ramka iframe nie wchodzi do `innerWidth/innerHeight`.
- Pierwsza partia Memory została uruchomiona przez wybór trybu, gotowość trzech gości i `Zagraj: Memory`. Jej rzeczywisty ekran miał 360×695. Zrzut: `/tmp/kwadrans-04-02-memory.png`.
- Dla pozostałych stanów użyto kontrolowanego renderowania istniejącego `Game` w czwartej ramce `/dev`. Oryginalny `#root` ukryto tylko w DOM przeglądarki, a obok zamontowano komponent zaimportowany przez Vite. Nie dodano trasy, diagnostyki ani pliku do aplikacji. Jest to **pomiar rzeczywistego renderowania komponentu z odtworzonym widokiem**, nie partia sieciowa ani test serwera.
- Stany: `GAMES[id].setup(ids, createRng(42), mode)`; każdy ruch przechodzi `validateMove`, potem `applyMove`; widok przez `playerView`. Gracze A/B/C/D, nicki Gracz 1..4, cztery pierwsze kolory platformy. Zmieniono jedynie kopertę `RoomView` do renderowania. W początkowym przebiegu timer koperty był 60000; przebieg stanów powtórzono z rzeczywistym `turn().seconds`/`turnSeconds`. Czasy w ramce służą wyłącznie geometrii, nie pomiarowi opóźnień sieci.
- Każdy ekran zmierzono przy `scrollY=0`. `getBoundingClientRect()` daje rozmiar po transformacji, `clientHeight/scrollHeight` wewnętrzny; sprawdzono także szerokość dokumentu i zasłanianie przez StickyBar. Snapshot pełnej treści nie jest dowodem widoczności: współrzędne i screenshot rozstrzygają o obcięciu.
- Kampus Tour sprawdzono zarówno w pionowym oknie 360×640 z CSS `.landscape`, jak i bez obrotu w oknie **640×360**. Scena ma **800×390**, zoom **0,8**, rzeczywisty obszar **640×312** (y=24..336). Środek sceny ma `clientHeight=171`, na ekranie 136,52 px, a nie 170 px viewportu. Kolumny tabeli poniżej odnoszą się do okna 640×360.
- Playwright sprawdza układ, nie czytelność na fizycznym ekranie ani klawiaturę Androida, TalkBack/VoiceOver, realne 60/120 Hz czy słaby telefon. Nie przeprowadzono partii z ludźmi i nie odczytywano bazy produkcyjnej ani zastanej lokalnej bazy. Serwer pomiarowy zapisuje wyłącznie do osobnej bazy w `/tmp`.

Skrypty i surowe pomiary sesji: `/tmp/kwadrans-04-02/{measure.js,states.js,landscape.js,setup-measurements.json,state-measurements.json,landscape-measurements.json}`. Pliki w `/tmp` są tymczasowe; poniższe wyniki i metoda pozostają w repo po ich usunięciu. Skrypty `states.js`/`landscape.js` wymagają wcześniejszego przygotowania `window.__audit` przez import React, react-dom/client, GAMES i Game w ramce; nie są niezależnymi testami automatycznymi.

## 2. Zmierzone układy

Wszystkie wymiary w CSS px. Wysokość dokumentu zaokrąglona przez przeglądarkę; wartości elementów do 0,01 px. Każdy z poniższych pomiarów ma szerokość dokumentu równą szerokości okna: brak przewijania strony w poziomie w tych stanach. Nie jest to twierdzenie o wszystkich grach i fazach.

| Dowód | Gra, stan, gracz | Okno | Wynik i rzeczywiste obcięcie | F4 / decyzja | Zrzut w /tmp/kwadrans-04-02/ |
|---|---|---|---|---|---|
| E01 | Memory Średnia, 4 os., pierwsza tura A | 360×640 | Dokument 695, nagłówek 186; przekroczenie 55 px. Ostatni rząd kart y=565,98..626,78, instrukcja kończy się poza 640. Zgodne z partią sieciową. | F4-056 / D4-055 | memory4.png |
| E02 | Memory Średnia, 2 os., pierwsza tura A | 360×640 | Dokument 651, nagłówek 142; przekroczenie 11 px. Nie mieści się mimo komentarza w komponencie. | F4-056 / D4-055 | memory2.png |
| E03 | Labirynt Klasyczny, 4 os., pierwsza tura A | 360×640 | Dokument 830, nagłówek 274. Pasek wyboru y=516..564 i akcja StickyBar zasłaniają dolną część planszy, w tym obszar startu własnego pionka. | F4-056 / D4-055 | labirynt4.png |
| E04 | Chińczyk Klasyczny, 4 os., pierwszy rzut A | 360×640 | Dokument 750, nagłówek 274. Rzuć y=572..628 jest dostępne, dolna plansza schowana pod dolnym paskiem. | F4-056 / D4-055 | chinczyk4.png |
| E05 | Gomoku, 2 os., początek A | 360×640 | Dokument 686, nagłówek 186. Wybierz pole y=572..628; pasek przykrywa dolne wiersze planszy, dokument dłuższy o 46 px. | F4-056 / D4-055 | gomoku2.png |
| E06 | Statki Klasyczny, 2 os., rozstawianie A | 360×640 | Dokument 781; Obróć/Losuj y=620,56..668,56, pod krawędzią i częściowo pod paskiem Gotowe (y=572..628). Bitwy nie mierzono. | F4-056 / D4-055 | statki2.png |
| E07 | Kalambury Krótka, 4 os., draw runda 1, zgaduje B | 360×640 | Dokument 723; Zgadnij y=594,5..642,5 częściowo poza ekranem; Pasuję y=650,5..698,5 całkowicie poza. Bez klawiatury ekranowej. | F4-056 / D4-055 | kalambury-draw.png |
| E08 | Kalambury, 4 os., reveal rundy 1, B | 360×640 | Dokument 894; Dalej y=580..628 widoczne w StickyBar. Treść wymaga pionowego przewijania, akcja już dostępna. | F4-092 / D4-057 | kalambury-reveal.png |
| E09 | Narysuj koło, solo A, oddana 1 z 10 prób | 360×640 | Dokument 707; zakończenie Zostaw najlepszą… y=635..683, niemal całe pod krawędzią. To odtworzenie po pierwszej próbie, bez lokalnego werdyktu rysowania. | F4-056 / D4-055 | kolo-play.png |
| E10 | Narysuj koło, 4 os., koniec, A | 360×640 | Dokument 1345; Rewanż y=1216,5..1264,5, Do lobby y=1272,5..1320,5. Wyraźnie poza ekranem; panel rekordów w stanie pustym. | F4-092 / D4-057 | kolo-over.png |
| E11 | Państwa-miasta, 4 os., write runda 1, A | 360×640 | Dokument 846 bez klawiatury; sześć pól wymaga przewijania, Oddaj/Dalej y=580..628 przyklejone. | F4-056 / D4-056 | pm-write.png |
| E12 | Państwa-miasta, 4 os., summary rundy 1, A | 360×640 | Dokument 946; Dalej y=580..628. Nie mylić przewijanej treści wyników z niedostępną akcją. | F4-092 / D4-057 | pm-summary.png |
| E13 | Kampus Tour, 4 os., buy, D, runda 1, 3 zdarzenia logu | 640×360 | Środek y=111,73..248,25; treść 188 wobec 171 px w scenie. Runda/licznik y=104,20..120,20, ucięte od góry o 7,53 px; log kończy się y=255,78, ucięty od dołu o 7,53. | F4-058 / D4-058 | kt-buy-landscape.png |
| E14 | Kampus Tour, 4 os., roll z MPK, C, runda 13 | 640×360 | Środek ten sam; treść 187 wobec 171 px. Runda/licznik od y=104,84, obcięte 6,89 px; log do y=255,16, obcięty 6,91. | F4-058 / D4-058 | kt-mpk-landscape.png |
| E15 | Kampus Tour, 4 os., over po 20 rundach, A, schowane podsumowanie | 640×360 | Treść 200 wobec 171 px. Runda y=94,25..107,44 całkowicie nad obszarem; Podsumowanie y=230,55..265,73 ucięte o 17,48 px; Rewanż/Do lobby y=187,36..225,75 mieszczą się. | F4-058 / D4-058 | kt-over-landscape.png |

Dodatkowe zrzuty obróconego okna 360×640: `kt-buy.png`, `kt-mpk.png`, `kt-over.png`, z identycznym obcięciem w osi obróconej sceny. Pomiar E15 nie potwierdza ucięcia Rewanżu w tym konkretnym stanie: potwierdza ucięcie rundy i Podsumowania. Wcześniejszy szacunek „mogą zostać ucięte Rewanż / Podsumowanie” nie jest uniwersalnym opisem wszystkich wariantów.

**Uzupełnienie 48 px:** E13/E14 przyciski Kup/Pomiń/Rzuć mają rzeczywistą wysokość 38,39 px (48 w scenie ×0,8), w E15 Podsumowanie 35,19 px (44×0,8). To rozszerza pewność F4-093 dla Kampus Tour; nie doliczamy osobnego F4 za tę samą regułę. Same `min-h-12` przed zoom nie dowodzą rozmiaru celu na ekranie.

### Odtwarzanie stanów

1. Setup wszystkich przypadków: seed 42, standardowe nicki. `mode=srednia` Memory, `klasyczny` Labirynt/Chińczyk, pozostałe domyślne.
2. Kalambury: A wybiera indeks 0, potem B/C/D pasują, aby uzyskać reveal; widok dla B. Nie przyspieszano zegara serwera.
3. Koło: A oddaje 81 punktów okręgu `(0,5+0,3*cos(i*pi/40), 0,5+0,3*sin(i*pi/40))`, i=0..80. Do over każdy gracz oddaje puste points, co legalnie kończy próby. Pozostali mają wynik 0. Nie dowodzi to zdolności człowieka do narysowania idealnego koła.
4. Państwa-miasta: po setup po kolei legalne timeoutMove wszystkich oczekujących aż do summary (puste odpowiedzi i brak odrzuceń).
5. Kampus Tour: A/B/C/D wybierają postaci 0/1/2/3. Polityka: buy gdy faza buy, skip gdy build, poza tym timeoutMove; każdy ruch walidowany. Pierwszy buy z co najmniej 3 zdarzeniami daje E13 (D, Biblioteka), pierwszy roll z MPK daje E14 (C, runda 13), koniec daje E15 (runda w stanie 21, UI 20/20). Po końcu kliknięto istniejący przycisk Plansza, bez ingerencji w stan. To bot do osiągnięcia fazy, nie symulacja balansu.
6. Nowe korzenie montowano ze świeżym kluczem, co odpowiada zastanemu stanowi po wejściu/reconnect; nie jest to dowód zachowania marszu w trakcie zmiany widoku. Pomiar akcji podczas animacji F4-057 pozostaje analizą statyczną.

## 3. Pełna lista F2 §9: status, wykonawca i powrót

„Agent” oznacza wykonawcę przyszłego pomiaru lokalnego; „użytkownik na urządzeniu” oznacza konieczność prawdziwego telefonu, nie prośbę o wykonanie teraz. Każda pozycja jest przypisana do decyzji. Uzupełnienia niezależnych dowodów nie czekają na urządzenia.

| ID / pozycja F2 §9 | Stan i brakujący warunek | Wykonawca / miara / warunek powrotu | Decyzje |
|---|---|---|---|
| U01: U1, U3 i KT10 | częściowo zmierzone E01-E15; pozostałe konfiguracje zachowują S | Agent: 360×640, minimalna i maksymalna liczba graczy; Statki bitwa/obrona, inne rozmiary Memory, Chińczyk Szybki i stany po partii. Powrót przed odbiorem odpowiedniego pakietu; rect, scroll, zrzut, widoczność wszystkich aktywnych pól. | [D4-055](DECISIONS.md#d4-055), [D4-057](DECISIONS.md#d4-057), [D4-058](DECISIONS.md#d4-058) |
| U02: SZ1 i WP5, klawiatura Androida | otwarte; brak fizycznego Androida z klawiaturą | Użytkownik na Androidzie: kropki/kat/w-pamieci, po autoFocus przy otwartej klawiaturze zmierzyć visualViewport, innerHeight, rect formularza i Zatwierdź; powrót przed wdrożeniem obejścia rozmiaru kafla. | [D4-056](DECISIONS.md#d4-056) |
| U03: HM-3 Wszystkie (30), ST1 Preview | otwarte; nie wykonano pomiaru tych elementów | Agent: 360×640 z fontami, rect tekstu, rodzica i scrollWidth, wszystkie odpowiedzi w Preview; powrót przed decyzją o zmianie układu. | [D4-072](DECISIONS.md#d4-072), [D4-098](DECISIONS.md#d4-098) |
| U04: Jeszcze nie grane i TopGame/RoundTable 10 rund | otwarte; pusta baza pomiarowa nie daje zestawu rekordów | Agent: odtworzyć Records z legalnym soloState, 10 rund i najdłuższe nazwy; mierzyć komórki i poziome overflow przy 360 px. Powrót przed odbiorem tabel/rekordów. | [D4-069](DECISIONS.md#d4-069), [D4-097](DECISIONS.md#d4-097), [D4-098](DECISIONS.md#d4-098) |
| U05: TU1 suma punktów | otwarte; nie mierzono tabeli z wysokimi punktami | Agent: legalna seria z największą sumą dla 6 graczy, szerokość kolumny i zawijanie pkt; powrót przed zmianą typografii tabeli. | [D4-097](DECISIONS.md#d4-097) |
| U06: ZK5 długi wiersz Scores Zakupów | otwarte; brak renderu tego wyniku | Agent: 6 graczy, długie nicki i wynik z błędami, rect wiersza 360 px; powrót przed decyzją skrócenia tekstu lub odbiorem. | [D4-097](DECISIONS.md#d4-097) |
| U07: Wysokość solo po mini-grze z pełnym RecordPanel | otwarte uzupełnienie U3; E10 mierzy 4 osoby i pusty panel | Agent: stan rekordu pobitego/awansu/przegranej i solo, po załadowaniu API; miara dostępności akcji bez scroll. Powrót przy odbiorze D4-057. | [D4-057](DECISIONS.md#d4-057) |
| U08: Inne ustawienia i listy poza partią | otwarte uzupełnienie HM-8 | Agent: Home/Lobby/Setup/Records 360×640 z maksymalną treścią; pionowe i poziome overflow oraz dolne akcje. Powrót przed odbiorem wyjątku list. | [D4-056](DECISIONS.md#d4-056) |
| U09: KT11/KS3 czytelność 7-8 px | geometria skali potwierdzona E13-E15; czytelność u ludzi otwarta | Użytkownik na 360 px: nazwa/cena pola i opis osi bez przybliżania; odsetek poprawnych odczytów i możliwość otwarcia pełnej nazwy. Powrót przed przyjęciem drobnego tekstu jako odstępstwa. | [D4-098](DECISIONS.md#d4-098) |
| U10: KS1 dotyk wykresu | otwarte; nie testowano dotyku fizycznego | Użytkownik na telefonie: stuknięcie i odsunięcie palca, trwałość tooltipu i odczyt kwoty; powrót przed odbiorem poprawki pointerleave. | [D4-097](DECISIONS.md#d4-097) |
| U11: GM-5 aria-label na span | otwarte; brak TalkBack/VoiceOver | Użytkownik na Androidzie/iOS: zapisać faktycznie wypowiedziane etykiety postępu gracza i kolejność fokusu; powrót przed uznaniem dostępności za potwierdzoną. | [D4-065](DECISIONS.md#d4-065), [D4-097](DECISIONS.md#d4-097) |
| U12: SL1 sześć kolorów celów | otwarte; nie mierzono kontrastu/percepcji | Agent: zmierzyć kontrast każdego z 6 kolorów z tłem; użytkownik: rozpoznawalność celu na telefonie i przy nierozróżnianiu barw. Powrót przed wyborem samego koloru lub drugiego znaku. | [D4-065](DECISIONS.md#d4-065) |
| U13: Kubki 150 ms i późne Śledzenie na słabym telefonie | otwarte; emulacja CPU nie dowodzi wydajności telefonu | Użytkownik na słabszym telefonie: model, runda, czas klatek/pominięte klatki i możliwość śledzenia; powrót przed uznaniem krzywej trudności i wyjątku ruchu za odebrane. | [D4-021](DECISIONS.md#d4-021), [D4-027](DECISIONS.md#d4-027), [D4-053](DECISIONS.md#d4-053) |
| U14: Rytm/Przytrzymaj 100 ms, 60/120 Hz, U28, reduced motion | otwarte; znamy kod i model klatki, brak fizycznego pomiaru | Użytkownik na ekranie 60 i 120 Hz oraz agent z logiem timestamp/rAF: widoczny błysk, spójność zegarów, rozrzut pomiaru; ustawienie reduced motion sprawdzić osobno. Powrót przed zmianą pomiaru i odbiorem werdyktów; rAF nie daje chwili emisji piksela. | [D4-049](DECISIONS.md#d4-049), [D4-054](DECISIONS.md#d4-054), [D4-083](DECISIONS.md#d4-083) |

## 4. Wszystkie 22 pytania F3 §11

Status wszystkich P01-P22: **otwarte, brak nowych partii ludzi**. Każdy wiersz ma miarę, wykonawcę i warunek powrotu. Cele liczby prób są próbą pilotażową, nie dowodem statystycznym przewagi. Brak pomiaru nie awansuje pewności A/Z do M.

Kopia bazy, jeśli użytkownik udostępni ją do tego celu, może częściowo odpowiedzieć na P09-P13. `scores` nie zawiera pełnego przebiegu i czasu każdej partii, a `detail` pozostaje tylko u lidera danej gry. Nie da się z tej bazy automatycznie odzyskać czasów wszystkich partii, lokalnych pomyłek ani wszystkich nieprzesłanych działań. Analizę kopii wykonuje agent tylko do odczytu w `/tmp`, bez połączenia z Pi.

| Pytanie | Gra i miara z F3 | Wykonawca i warunek powrotu | F4 / decyzje |
|---|---|---|---|
| P01 | Kampus Tour: wygrane według miejsca startu; liczba osób i zwycięzca | Użytkownik: co najmniej 8 partii przy 3-4 os., rotacja miejsc; po tabeli wyników wrócić do wysokości premii. | [F4-160](FINDINGS.md#f4-160); [D4-038](DECISIONS.md#d4-038) |
| P02 | Kampus Tour: sposób i runda każdego kompletu (zakup/wykup/MPK) | Użytkownik: zanotować wszystkie komplety w partiach z P01; wrócić przed ograniczeniem MPK. | [F4-163](FINDINGS.md#f4-163); [D4-039](DECISIONS.md#d4-039) |
| P03 | Kampus Tour: czas zegarem, runda końca, sposób końca, pierwsze bankructwo | Użytkownik: pełne partie 2/3/4 os.; wrócić po zmierzeniu, czy 45 min i wczesne bankructwa są problemem. | [F4-165](FINDINGS.md#f4-165); [D4-041](DECISIONS.md#d4-041) |
| P04 | Kampus Tour: monopol i grupy dwupolowe | Użytkownik: notować monopol w każdej partii z P01; wrócić gdy pojawia się częściej niż sporadycznie, podać licznik i mianownik. | [F4-164](FINDINGS.md#f4-164); [D4-040](DECISIONS.md#d4-040) |
| P05 | Gomoku: zaczynający, zwycięzca/remis | Użytkownik: co najmniej 10 partii z rotacją i zbliżonym poziomem graczy; wrócić przed dopisaniem swap. | [F4-160](FINDINGS.md#f4-160); [D4-044](DECISIONS.md#d4-044) |
| P06 | Labirynt: tryb, 3/4 osoby, miejsce zwycięzcy | Użytkownik: serie z rotacją miejsc w obu trybach, odnotować timeouty; wrócić przed premią ścian lub zmianą startu. | [F4-160](FINDINGS.md#f4-160); [D4-042](DECISIONS.md#d4-042), [D4-043](DECISIONS.md#d4-043) |
| P07 | Memory Mała: 3+ osoby, miejsce zwycięzcy i remisy na górze | Użytkownik: partie przy rotacji i kilku liczbach graczy; wrócić przed odstępstwem od pierwszego gracza. | [F4-160](FINDINGS.md#f4-160); [D4-045](DECISIONS.md#d4-045) |
| P08 | Państwa-miasta 5-6 os.: ilu zdążyło obejrzeć/głosować, czy złe odpowiedzi przeszły | Użytkownik: pełna faza głosowania z zegarem, liczba odpowiedzi do oceny i niedokończonych ocen; wrócić przed zmianą 45 s. | [F4-002](FINDINGS.md#f4-002); [D4-010](DECISIONS.md#d4-010), [D4-061](DECISIONS.md#d4-061) |
| P09 | Sekwencja: długość serii, czas partii i wpisywania, równe wyniki w pierwszej trójce | Użytkownik: partie najlepszych z czasem od Start; agent: ewentualna udostępniona kopia bazy dla rozkładu score. Do czasu brakujących danych nie wybierać tie szybkości. | [F4-002](FINDINGS.md#f4-002), [F4-158](FINDINGS.md#f4-158); [D4-004](DECISIONS.md#d4-004), [D4-032](DECISIONS.md#d4-032) |
| P10 | Trzy kubki: wynik i odsetek partii z 20 rundami | Użytkownik lub agent na udostępnionej kopii: licznik kompletów/mianownik, remisy na szczycie; wrócić przed tie lub wydłużaniem gry. | [F4-158](FINDINGS.md#f4-158); [D4-031](DECISIONS.md#d4-031) |
| P11 | W pamięci: czy pada 12, na jakim działaniu pomyłka | Użytkownik: wynik i typ działania w błędnej rundzie; agent na udostępnionej kopii: komplet i dostępny detail lidera. Wrócić przed zmianą pełnego tie i rozkładu mnożeń. | [F4-003](FINDINGS.md#f4-003), [F4-158](FINDINGS.md#f4-158); [D4-022](DECISIONS.md#d4-022), [D4-030](DECISIONS.md#d4-030) |
| P12 | Zakupy: wynik, czas zaznaczania i mylone przedmioty | Użytkownik: kilka partii po odbiorze pomiaru dotyku; agent na udostępnionej kopii: score/tie oraz tylko dostępny detail. Wrócić przed zmianą 10 pozycji. | [F4-159](FINDINGS.md#f4-159); [D4-034](DECISIONS.md#d4-034), [D4-050](DECISIONS.md#d4-050) |
| P13 | Wieża: wysokość i szerokość końcowego klocka | Użytkownik lub agent na udostępnionej kopii: rozkład score/tie, częstość 30 i remisy; wrócić przed 50 piętrami. | [F4-159](FINDINGS.md#f4-159); [D4-033](DECISIONS.md#d4-033) |
| P14 | Środek i Tort: czas Start→oddany wynik, liczba poprawek punktu/cięcia | Użytkownik: oddzielnie każda gra, wolny staranny gracz, stoper i kilka powtórzeń; wrócić do limitów 90/180 s po pomiarze, nie po modelu 5 s. | [F4-002](FINDINGS.md#f4-002); [D4-007](DECISIONS.md#d4-007), [D4-008](DECISIONS.md#d4-008) |
| P15 | Kąt: kąt i błąd każdej rundy u tej samej osoby | Użytkownik: kilka partii, pogrupować pasma kąta i porównać błąd; wrócić przed stałymi pasmami. | [F4-003](FINDINGS.md#f4-003); [D4-020](DECISIONS.md#d4-020) |
| P16 | Literówka: rodzaj błędu, czas odpowiedzi, pomyłka | Użytkownik: powtarzane partie i notatki dla ó/u, rz/ż, ch/h; wrócić przed rozbudową metadanych słownika. | [F4-003](FINDINGS.md#f4-003); [D4-025](DECISIONS.md#d4-025) |
| P17 | Za zasłoną: widoczność, czas ukryty i odchyłka rundy | Użytkownik: kilka partii tej samej osoby, porównać błąd zależnie od widoczności; wrócić przed stałą sumą widoczności. | [F4-003](FINDINGS.md#f4-003); [D4-024](DECISIONS.md#d4-024) |
| P18 | Stój!: wynik, zielone w ostatnich 10 s, pomyłki według czasu | Użytkownik: zapis przebiegu partii lub nagranie do własnej analizy; agent liczy rozkład z udostępnionego stanu. Wrócić przed równaniem tercji. | [F4-003](FINDINGS.md#f4-003); [D4-023](DECISIONS.md#d4-023) |
| P19 | Dziesiątki: wynik i średnia liczba par na planszy w toku partii | Użytkownik: przebieg lub udostępnione stany kolejnych plansz; sam stan końcowy nie odtwarza bezwarunkowo wybranej ścieżki. Wrócić po analizie zależności wyniku od par. | [F4-003](FINDINGS.md#f4-003); [D4-018](DECISIONS.md#d4-018) |
| P20 | Kalambury 2 os.: punkty za rysowanie i zgadywanie obu graczy | Użytkownik: pełne partie z zamianą ról; wrócić po rozdzieleniu źródeł punktów przed zmianą 3→5. | [F4-167](FINDINGS.md#f4-167); [D4-047](DECISIONS.md#d4-047) |
| P21 | Mapa: miasto, odległość od odpowiedzi i położenie przy granicy/wewnątrz | Użytkownik: kilka partii tej samej osoby; agent grupuje dostarczone rundy. Wrócić tylko jeśli zależność się pojawi; obecnie brak wpisu błędu F4. | Brak rozbieżności F4; [MP-01](DECISIONS.md#mp-01) |
| P22 | Który rok?: wydarzenie, epoka/dział i błąd tej samej osoby | Użytkownik: kilka partii; agent klasyfikuje dostarczone rundy. Wrócić przed rozbudową puli o dział i kwoty. | [F4-003](FINDINGS.md#f4-003); [D4-026](DECISIONS.md#d4-026) |

## 5. Pewność i historia ocen

M = nowy pomiar renderowania w Chromium, S/W/Z/A pozostają jak w FINDINGS §1. Nie zmieniono żadnej wagi: 7 wysokich (w tym warunkowe R3), 55 średnich, 106 niskich. M dla układu nie potwierdza balansu, dotyku fizycznego ani długości partii człowieka.

| Wpis | Było w 04-01 | Dowód 04-02 i zmiana pewności | Czego nadal nie wiemy |
|---|---|---|---|
| F4-056 | S + szacunki klas ±30 px | S+M w E01-E07/E09/E11; 651/695 Memory i 707 Koło potwierdzone | Android SZ1/WP5 i niezmierzone konfiguracje U01/U02 |
| F4-058 | S, szacunek buy 224/roll 204/over 250 px | S+M E13-E15; środek faktycznie ucina, ale flex kurczy treść: 188/187/200 px sceny, dlatego wcześniejsze szacunki nie są pomiarami | inne nicki, logi, role i większe okna; Rewanż nieucięty w E15 |
| F4-092 | S, szacunek 850-1000 px | S+M E08/E10/E12; Koło 4 os. z pustym panelem ma aż 1345 px, akcje poza ekranem; Dalej w odsłonach już dostępne | pełny RecordPanel i solo U07 |
| F4-093 (Kampus Tour) | S, 44/48 px w stylach sceny | S+M E13-E15: po zoom 38,39/35,19 px na ekranie | fizyczny dotyk, pozostałe hitboxy i rozstrzyganie nakładania celów |
| F4-002 Środek/Tort | A o czasie decyzji i wyliczenie T | bez zmiany: P14 otwarte | nie uznawać renderu za pomiar tempa człowieka |
| F4-158 W pamięci | wysoka warunkowo | bez zmiany: P11 otwarte | czy 12 rund pada w partiach ludzi |

Nie znaleziono podstaw do podniesienia wagi któregokolwiek niskiego wpisu wyłącznie przez nowy screenshot. Brak zmiany wagi nie blokuje nadania priorytetu w 04-03.

## 6. Stan kontroli

- Pomiary krytycznych U1/U3/KT10 wykonane; reszta F2 §9 ma jawny status U01-U14, miarę i właściciela.
- P01-P22 zachowują pytania F3 i mają warunek powrotu. P21 nie zostało sztucznie dopisane jako nowy błąd.
- Warianty, rekordy, detail, turniej, odstępstwa, propozycje dokumentów i F3:D-01..D-14 opisuje DECISIONS. Każdy wybór nadal oczekuje użytkownika.
- Próg 20%/10 s, praktyczne sufity, model 5 s i wyniki botów nie stały się zaakceptowanymi zasadami.
- Sprawdzono `pnpm typecheck && pnpm test`: kod 0, 41 plików / 1819 testów gier, 1 plik / 15 testów serwera, łącznie 1834. Zakres zapisu w repo pozostaje w `.planning/`; skrypty i zrzuty w `/tmp`, bez nowych zależności i bez commitów/push.

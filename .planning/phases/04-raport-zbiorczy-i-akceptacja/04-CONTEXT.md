# Faza 4: Raport zbiorczy i akceptacja

**Data:** 2026-10-25
**Status:** 04-01 wykonany na zlecenie użytkownika, 1/5; następny 04-02. Warianty poprawek nadal oczekują decyzji.
**Wymaganie:** FIX-01. FIX-02 należy do fazy 5.

## Cel i granice

Z trzech audytów powstaje jedna lista rozbieżności, pakiety poprawek i zapis decyzji użytkownika.
Faza obejmuje sprawdzenie aktualności dowodów, wybrane pomiary UI oraz przygotowanie wariantów do decyzji.
Zmiany kodu, testów i dokumentów źródłowych następują dopiero w fazie 5, zgodnie z zaakceptowanym zakresem.
W fazie 4 zapisujemy wyłącznie pliki `.planning/`; ewentualne skrypty i zrzuty pomiarowe trafiają do `/tmp`.
Nie wykonujemy commitów ani push bez prośby użytkownika.

## Kolejność i rezultaty

| Plan | Zadanie | Rezultat | Zależność |
|---|---|---|---|
| [04-01](04-01-PLAN.md) | Scalić ustalenia i sprawdzić ich aktualność | `FINDINGS.md`: wpisy F4, mapa źródeł, pokrycie gier i ekranów | fazy 1-3 |
| [04-02](04-02-PLAN.md) | Przygotować decyzje i sprawdzić niepewne dowody | `04-02-EVIDENCE.md`, `DECISIONS.md`: warianty, rekomendacje, otwarte pomiary | 04-01 |
| [04-03](04-03-PLAN.md) | Ułożyć pakiety poprawek i raport do akceptacji | `PACKAGES.md`, `REPORT.md`: zakres, priorytety, zależności, odbiór | 04-02 |
| [04-04](04-04-PLAN.md) | Zebrać i zapisać decyzje użytkownika | zatwierdzone warianty i decyzje dla konkretnych wpisów oraz pakietów | 04-03 |
| [04-05](04-05-PLAN.md) | Przekazać zatwierdzony zakres do fazy 5 | `PHASE-5-SCOPE.md`, kontrola FIX-01 i aktualizacja planowania | 04-04 |

Każdy plan kończy się własnym `04-XX-SUMMARY.md` i aktualizacją `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`.
Plany wykonujemy kolejno. Zlecenie rozpisania tasków nie jest zatwierdzeniem ich wykonania ani propozycji z audytów.

## Źródła

- `../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md`: 55 wpisów, prefiks `F1:`.
- `../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md`: 102 wpisy, prefiks `F2:`; szczególnie §5.0, §7 i §9.
- `../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md`: 16 wpisów, prefiks `F3:`; szczególnie §10-12.
- Pliki częściowe, CHECKS i BASELINE są dowodami pomocniczymi, gdy skrót w raporcie nie wystarcza.
- `KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`, `DESIGN.md`, `AGENTS.md` pozostają źródłami prawdy.
  Przy sprzeczności reguł UI wygrywa `ZASADY.md`.

173 to suma wpisów trzech raportów przed deduplikacją, nie liczba niezależnych poprawek.
Odstępstwa z uzasadnieniem, propozycje do dokumentów i pytania do partii również wymagają mapowania,
ale nie należy automatycznie doliczać ich jako nowych błędów.

## Zasady scalania i decyzji

- Jeden wpis `F4-001` itd. opisuje jedną rozbieżność i zachowuje wszystkie odsyłacze F1/F2/F3.
  Identyfikator częściowy bez prefiksu fazy nie jest jednoznaczny; w razie potrzeby dodaj grę i plik źródłowy.
- Tę samą przyczynę i regułę można scalić. Dwa problemy w tym samym pliku trafiają do wspólnego pakietu,
  lecz zachowują osobne wpisy i decyzje.
- Waga, pewność dowodu i priorytet wdrożenia to osobne pola. Model lub wynik bota pozostaje modelem lub wynikiem bota.
  Zmiana wagi względem audytu wymaga uzasadnienia.
- Przy każdym wariancie zmiany zasad ocenić wpływ na wyniki, rekordy, zapisane `detail`, turniej i dokumentację.
  Czyszczenie rekordów, migracje danych, nowe gry i zapis pokoi pozostają poza zakresem.
- Status decyzji początkowo `oczekuje`. Końcowe wybory: `poprawić`, `zostawić jako odstępstwo` z powodem,
  `odrzucić` z powodem. Rekomendacja agenta nie zastępuje decyzji użytkownika.
- Użytkownik może akceptować pakiety partiami, ze wskazaniem wersji i wariantów. Decyzję pakietu przenosimy
  na jego wymienione wpisy; wyjątki zapisujemy osobno. Istotnie zmieniony zakres wymaga ponownej decyzji.
- Brak pomiaru nie blokuje przygotowania niezależnych pakietów. Powiązane decyzje pozostają otwarte
  z pytaniem, osobą odpowiedzialną i warunkiem powrotu. Faza 4 i FIX-01 nie są zakończone, dopóki pozostają wpisy bez decyzji.

## Kontrole i warunek końca

Wybrane sprawdzenia przeglądarkowe służą potwierdzeniu ustaleń, nie zastępują pełnego odbioru `/dev` przez użytkownika.
Klawiatura Androida, TalkBack/VoiceOver, słabszy telefon i partie z ludźmi wymagają właściwego urządzenia lub danych;
emulacja rozmiaru okna nie jest ich dowodem. Nie łączymy się z produkcyjną bazą na Pi.

Faza 4 kończy się, gdy wszystkie wpisy mają decyzję, zaakceptowane pakiety mają zakres i odbiór w `PHASE-5-SCOPE.md`,
a cztery kryteria sukcesu z roadmapy mają wskazany dowód. FIX-02 pozostaje niezrealizowane.

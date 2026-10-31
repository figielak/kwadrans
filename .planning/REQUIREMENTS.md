# Requirements: Kwadrans — audyt spójności

**Defined:** 2026-10-21
**Core Value:** Każda gra działa i wygląda tak samo przewidywalnie: kod zgadza się z dokumentacją, a wyniki i rekordy są uczciwe i porównywalne między partiami.

Kryteria pochodzą z `ZASADY.md` (§2–6), `ZASADY-GIER.md` i `KONCEPT.md`. Każde wymaganie audytu kończy się listą rozbieżności z plikami i liniami; poprawki są osobną kategorią (FIX).

## v1 Requirements

### Zasady: kod vs dokumenty

- [x] **RULE-01**: Każda gra z `GAMES` ma sekcję w `ZASADY-GIER.md` i opis w `KONCEPT.md` §2, a stałe w kodzie (rundy, czasy, kary, limity tury, tryby) zgadzają się z dokumentami
- [x] **RULE-02**: Każda gra spełnia reguły `ZASADY.md` §3 (`timeoutMove` = ruch / najgorszy wynik, remis bez zwycięzcy, start pierwszego z `players`, tylko `rng`, stan JSON, `ranked`/`places`, wspólne funkcje `core.ts`); odstępstwa mają wpis z powodem
- [x] **RULE-03**: Każdy plik testów ma testy obowiązkowe z `ZASADY.md` §2 (lista luk per gra)

### Wygląd UI

- [x] **UI-01**: Kolory tylko z tokenów, kolor gracza zamiast czerwieni, zaokrąglenia 20/10 px
- [x] **UI-02**: Pola dotykowe min. 48 px; gry na czas mają `touch-none select-none` i `onPointerDown`
- [x] **UI-03**: Każdy ekran mieści się na 360×640 bez poziomego przewijania i stałych pikseli
- [x] **UI-04**: Teksty po polsku, bez em-dashy, przecinek dziesiętny, te same słowa („Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”); liczby mono z `tabular-nums`
- [x] **UI-05**: Każda mini-gra ma `Intro` z `Preview` i trzema punktami (time/task/score); ozdobne `aria-hidden`, przyciski bez tekstu `aria-label`

### Animacje i wibracje

- [x] **ANIM-01**: Animacje z istniejących keyframes `index.css` (ta sama sytuacja = ta sama animacja), czasy zgodne z tabelą `ZASADY.md` §5
- [x] **ANIM-02**: Animacje JS sprawdzają `reducedMotion`, animacja nie blokuje gry, pomiar czasu nie zależy od animacji
- [x] **ANIM-03**: Wibracje zgodne z tabelą §5 (40 / 60 / [60,40,60]); gra nie dubluje wibracji tury; trafienie nie wibruje

### Podpięcie

- [x] **WIRE-01**: Każda gra ma komplet podpięć z §6: `GAMES`, eksport `View`, gałąź `Game.tsx`, ikona `ICONS`; mini-gra: `MINI_GAMES`, `record` (+`tie`), `RECORDS` w `index.test.ts`, `FORMAT` w `Records.tsx`, `MiniGame.tsx`
- [x] **WIRE-02**: Ekran końcowy każdej mini-gry rysuje się z samego stanu (rekordowa partia z `soloState` i `me=""` wyświetla się poprawnie)

### Balans rekordów

- [x] **REC-01**: Każda mini-gra z losowymi celami daje w każdej partii tyle samo do zdobycia (`withSum`, stała liczba bodźców, potasowane komplety); raport wskazuje gry, w których tego brakuje
- [x] **REC-02**: Gry „do pierwszej pomyłki” i z limitem rund mają ocenione ryzyko osiągnięcia sufitu (maksimum osiągalne, remisy na szczycie rekordów)
- [x] **REC-03**: `record.tie` jest tam, gdzie wyniki często się powtarzają, a kierunek `lower` zgadza się z dokumentacją

### Balans trudności

- [x] **DIFF-01**: Krzywa trudności w grach z progresją (Kubki, Śledzenie, Wieża, W pamięci, Inny element, Obrót, Sekwencja, Stój! i inne) oceniona na podstawie stałych przyrostu
- [x] **DIFF-02**: Limit tury każdej mini-gry = najdłuższa uczciwa partia + zapas; gry po kolei 60 s
- [x] **DIFF-03**: Gry główne ocenione: ekonomia Kampus Tour (`KONCEPT.md` §9), przewaga pierwszego gracza (Gomoku, Labirynt), tryby Szybkie

### Raport i poprawki

- [x] **FIX-01**: Zbiorczy raport rozbieżności z priorytetami, zaakceptowany przez użytkownika (które poprawiać)
- [ ] **FIX-02**: Zaakceptowane rozbieżności poprawione zgodnie z procesem (test i dokument przed kodem); `pnpm typecheck && pnpm test` bez błędów

Pokrycie FIX-01 w planach fazy 4: **5/5 zakończone**, wszystkie cztery kryteria sprawdzone w REPORT §5 po zgodzie ZG4-v1:

| Plan | Dowód spełnienia wymagania po wykonaniu |
|---|---|
| 04-01 ✓ | `FINDINGS.md` v1: 173 źródła → 168 wpisów, 47 odstępstw, 44 aliasy F3, 22 pytania; aktualność, 39 pozycji i ekrany pokryte |
| 04-02 ✓ | `04-02-EVIDENCE.md`: 15 pomiarów, U01-U14 i P01-P22; `DECISIONS.md`: 106 oczekujących kart, skutki rekordów/detail/turnieju, 168 F4, 47 odstępstw, pełne propozycje F2/F3 |
| 04-03 ✓ | `PACKAGES.md` PK4-v1 i `REPORT.md` R4-v1: 62 propozycje, 27 H, pełna mapa 168 F4 / 295 części, priorytety, acykliczne zależności i odbiór; decyzje oczekują |
| 04-04 ✓ | ZG4-v1 zatwierdzone: 62 pakiety, 106 D4, 27 H, 47 odstępstw i MP-01; zero otwartych decyzji, 295/295 części rozstrzygnięte |
| 04-05 ✓ | PHASE-5-SCOPE S5-v1: 62 pełne karty, 267 części P4, 28 części H, routing odstępstw, kolejność i odbiór; kontrola czterech kryteriów pozytywna |

Samo przygotowanie planów lub częściowa akceptacja nie zamykają FIX-01. FIX-02 pozostaje zakresem fazy 5.

2026-10-26: 05-01/P4-001 wykonany, 5/5 części odebranych w [05-01-SUMMARY](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-01-SUMMARY.md). Faza 5: 1/62 pakietów. Kontrola typów i 1834 testy poprawne; wymaganie FIX-02 nadal otwarte.

## v2 Requirements

### Rekordy

- **REC-V2-01**: Walidacja nierealnych wyników i przegląd bazy rekordów pod kątem wyników niemożliwych

### Trudność

- **DIFF-V2-01**: Porównanie trudności i długości mini-gier między sobą (turniej, wyzwanie dnia)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Nowe gry (Poprawka) | Ten etap porządkuje istniejące gry |
| Zapis stanu pokoi w SQLite | Osobny etap z planu prac |
| Ręczny odbiór w `/dev` (checklista `ZASADY.md` §6) | Robi użytkownik; audyt sprawdza kod |
| Zmiana `id` gier | Klucz rankingu w SQLite |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RULE-01 | Phase 1 | Complete (01-03..01-09, scalone w FINDINGS.md 01-10) |
| RULE-02 | Phase 1 | Complete (01-01, 01-03..01-09, scalone w FINDINGS.md 01-10) |
| RULE-03 | Phase 1 | Complete (01-01, 01-03..01-09, scalone w FINDINGS.md 01-10) |
| WIRE-01 | Phase 1 | Complete (01-02) |
| WIRE-02 | Phase 1 | Complete (01-02) |
| UI-01 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| UI-02 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| UI-03 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| UI-04 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| UI-05 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| ANIM-01 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| ANIM-02 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| ANIM-03 | Phase 2 | Complete (02-01..02-10, scalone w FINDINGS.md 02-11) |
| REC-01 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| REC-02 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| REC-03 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| DIFF-01 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| DIFF-02 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| DIFF-03 | Phase 3 | Complete (03-01..03-08, scalone w FINDINGS.md 03-09) |
| FIX-01 | Phase 4 | Complete (2026-10-26), 5/5; rzeczywista zgoda ZG4-v1 i kompletne przekazanie S5-v1 |
| FIX-02 | Phase 5 | In progress; 35/62 pakietów, 156/267 części; 05-36/P4-038: Tort: uchwyt cięcia pod palcem, typy/testy/build PASS; następny P4-039; F4-046 częściowo SKIP → P4-057; P4-014 (2/3) i P4-015 oczekują U02 |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-21*
*Last updated: 2026-10-31 po 05-36/P4-038; 35/62 pakietów, 156/267 części, FIX-02 otwarte.*

2026-10-26, 05-02/P4-027: testy regresji i dokumentacja przed kodem przygotowane. Oczekiwany RED potwierdza błąd, nie jest spełnieniem FIX-02. Wdrożenie oczekuje osobnego commitu testów na prośbę użytkownika; dowody w [05-02-TDD](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-02-TDD.md).

2026-10-26, 05-02/P4-027 zakończony po osobnym commicie TDD 50172d5 na prośbę użytkownika. 1/1 części odebrana; pełny typecheck i 1889 testów, build oraz /dev2/6 z refresh obu połówek poprawne. Powyższy zapis RED jest historyczny; [dowody wykonania](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-02-SUMMARY.md). Łącznie 2/62 pakietów i 6/267 części; FIX-02 nadal otwarte.


2026-10-29, 05-03/P4-002 w toku: dokumentacja i testy RED przygotowane, typecheck PASS.
Games: 1864 PASS / 25 oczekiwanych FAIL; serwer LobbyRoom: 6 PASS / 8 oczekiwanych FAIL.
Implementacja po osobnym commicie testów na prośbę użytkownika (AGENTS.md).
[Dowody TDD](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-03-TDD.md).
Liczba odebranych pakietów bez zmian: 2/62 i 6/267 części; FIX-02 nadal otwarte.


2026-10-29, 05-03/P4-002 zakończony po osobnym commicie testów e635dc9 na prośbę użytkownika.
Dokumentacja i testy przed kodem, testy bez zmian po commicie; typecheck, 1918 testów i build poprawne.
UI starego detail, timeoutów 2/6 osób i refresh oraz remis i seria punktacji/ekran turnieju sprawdzone.
[Podsumowanie](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-03-SUMMARY.md).
Faza 5: 3/62 pakietów, 7/267 części; FIX-02 otwarte. Następny P4-003 (Zakupy). Wpis RED powyżej jest historyczny.


2026-10-29, 05-04/P4-003 rozpoczęty na „Rób kolejne”: dokumentacja i testy RED gotowe.
Typecheck PASS; Zakupy 37 PASS / 2 FAIL, handlery 14 PASS / 4 FAIL. UI potwierdza brak autozapisu i pointerdown.
Przed implementacją wymagany osobny commit dwóch plików testów; pytanie wysłane asynchronicznie.
[Dowody TDD](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-04-TDD.md).
Nadal 3/62 odebrane pakiety, 7/267 części; FIX-02 otwarte.


2026-10-29, 05-04..06 zakończone: Zakupy (P4-003), Sekwencja (P4-004), W pamięci (P4-005).
Osobne commity testów 7045659/76455c9, f3e7958 i 28196b5; dokumentacja przed kodem.
Typy, 1947 testów, build i UI PASS. Dowody w 05-04-SUMMARY.md, 05-05-SUMMARY.md i 05-06-SUMMARY.md.
6/62 pakietów i 11/267 części; FIX-02 otwarte, następny P4-006. Wcześniejsze wpisy RED są historią.
Stała zgoda użytkownika na obowiązkowe kolejne commity testów obowiązuje, bez ponownych pytań.


2026-10-29, 05-07/P4-006 zakończony: wspólny zwijany nagłówek aktywnej partii.
Pomiar E01-E06: 106 px zamiast 142-274 px; 2/4/6 osób, długie nicki, obserwator,
rozłączenie, rozwinięcie klawiaturą, ponowny montaż i koniec sprawdzone na komponencie.
Typy, 1947 testów i build PASS. Bez zmian zasad i commitów; 7/62 pakietów, 12/267 części.
FIX-02 otwarte, następny P4-011 (Memory). Dowody: 05-07-SUMMARY.md.


2026-10-29, 05-08/P4-011 zakończony: Memory, odstęp plansza–instrukcja 8 zamiast 12 px.
18 konfiguracji trzech trybów, 2/6 osób i ról gracz/rywal/obserwator: dokument 360×640,
karty minimum 48 px. Pełne partie UI, ponowny montaż i rewanż PASS.
Typy, 1947 testów i build PASS. 8/62 pakietów, 13/267 części, FIX-02 otwarte.
Następny P4-012 (Kalambury). Dowody: 05-08-SUMMARY.md. Bez zmian zasad i commitów.


2026-10-29, 05-09/P4-012: Kalambury, płótno mierzy rzeczywisty nagłówek i kontrolki obu ról.
Zgadnij i Pasuję w 640 px, 2/6 osób, pełne partie obu trybów i /dev z WebSocket + refresh PASS.
Typy, 1947 testów i build PASS. U02 fizyczny Android otwarty, symulacja viewportu PASS.
9/62 pakietów, 14/267 części, FIX-02 otwarte; następny P4-013. Dowody: 05-09-SUMMARY.md.
Stała zgoda użytkownika na commity po każdym zadaniu obowiązuje; push nadal wymaga prośby.


2026-10-29, 05-10/P4-013 zakończony: Narysuj koło, płótno dopasowane do wolnej wysokości,
48 px przycisku w oknie, bez skoku rozmiaru po pierwszej próbie. Solo/2/6, refresh, timeout,
me="" i rewanż PASS; rzeczywisty pokój solo z reload i rekordem PASS.
Typy, 1947 testów i build PASS. 10/62 pakietów, 15/267 części, FIX-02 otwarte.
Następny P4-014 (Państwa-miasta). Dowody: 05-10-SUMMARY.md. Commit po zadaniu, bez push.


2026-10-29, 05-11/P4-014 wdrożony: Państwa-miasta, przewijany formularz, dolna akcja,
tabele kategorii z graczami w wierszach przy 4+, cele głosu minimum 48 px.
Przeglądarka 2/6 i vote/summary 2/3/4/6, szkic, timeout i remis PASS; typy, 1947 testów, build PASS.
Pełny odbiór oczekuje fizycznego U02 Android; 2/3 części odebrane. 10/62 pakietów, 17/267 części.
05-11 w toku; następny niezależny pakiet P4-015. Dowody: 05-11-SUMMARY.md. Commit bez push.


2026-10-29, 05-12/P4-016 zakończony: wyniki z OverActions/NextActions w StickyBar.
Koło solo/4/6 z pełnym RecordPanel, awansem i rekordem; turniej między grami i finał oraz E08/E12 PASS.
Typy, 1947 testów i build PASS. 11/62 pakietów, 18/267 części; FIX-02 otwarte.
P4-014 oczekuje fizycznego U02; P4-015 wymaga pomiaru telefonu przed wyborem poprawki, bez zmian kodu.
Następny niezależny P4-017. Dowody: 05-12-SUMMARY.md. Commit bez push.


2026-10-29, 05-13/P4-017 zakończony: Kampus Tour, nieucinany środek i kontrolki >=48 px po zoom,
budowa w szczegółach pola, pojedyncze akcje podsumowania, wygrane i Oglądasz.
E13-E15, 2/4 i obserwator, obie orientacje, typy/1947 testów/build PASS. 4/4 części.
12/62 pakietów, 22/267 części; FIX-02 otwarte. Następny P4-018; P4-014/015 oczekują U02.
Użytkownik: „Zrobię pomiar później, kontynuuj pozostałe pakiety”. Dowody: 05-13-SUMMARY.md.


2026-10-29, 05-14/P4-018 zakończony: Kampus Tour, dotyk kończy turlanie/marsz bez ruchu,
MPK i karta bez fałszywego rzutu, nowy stan anuluje stary pokaz. Bez zmian kontraktu playerView.
Rzut 12/dublety/Kolokwium, oba układy, refresh/reduced motion i /dev przez WebSocket PASS.
Typy, 1947 testów i build PASS. 13/62 pakietów, 25/267 części; FIX-02 otwarte. Następny P4-023.
P4-014/015 oczekują odłożonych pomiarów. Dowody: 05-14-SUMMARY.md. Commit bez push.


2026-10-29, 05-15/P4-023 zakończony: quizy, czasy int 0-30000 i suma <=30000,
pomyłki int 0-30; każdy szybki/wolny czas zachowany. 200 to pula plansz, nie limit trafień.
ZASADY-GIER i testy przed kodem, commit TDD f127c6c. Typy/2049 testów/build PASS.
UI Quiz/retry/Dziesiątki, 201 trafień i rzeczywisty rekord/turniej przez WebSocket PASS.
14/62 pakietów, 27/267 części; FIX-02 otwarte. Następny P4-036; P4-014/015 oczekują pomiarów.
Dowody: 05-15-SUMMARY.md. Historia bez przeliczania; commit implementacji bez push.


2026-10-30, 05-16/P4-036 zakończony: gęste plansze z wyborem i potwierdzeniem 56 px z nazwą wyboru.
Labirynt: krok przez wybór (duch pionka) i „Idź w górę”/„Przeskocz…”; Chińczyk: kostka obok „Rusz o 4 pola”;
Gomoku: „Postaw na H8”; Statki bez zmian. ZASADY §4, DESIGN §6, ZASADY-GIER §10. Typy/2049 testów/build PASS.
/dev 360×640: 9×9 i 7×7, obroty 0/90/180°, obserwator, przeskok PASS. 15/62 pakietów, 28/267 części; FIX-02 otwarte.
Następny P4-007; P4-014/015 oczekują pomiarów. Dowody: 05-16-SUMMARY.md. Commit bez push.


2026-10-30, 05-17/P4-007 zakończony bez zmian kodu: Gomoku po P4-006 mieści się na 360×640
(plansza 150-487 px, „Postaw na O15” 514-570 px, dokument 640; obserwator, koniec, rewanż i odświeżenie PASS).
Pomiar w DESIGN §6 zamiast „około 670 px”. 16/62 pakietów, 29/267 części; FIX-02 otwarte.
Następny P4-008; P4-014/015 oczekują pomiarów. Dowody: 05-17-SUMMARY.md. Commit bez push.


2026-10-30, 05-18/P4-008 zakończony: Statki, rozstawianie z Obróć/Losuj/Gotowe w jednym wierszu (640 px we wszystkich trybach),
obserwator widzi ostrzeliwaną planszę dużą u góry. Mała plansza drugiej floty jako wyjątek DESIGN §6 (zgoda użytkownika).
Cztery tryby, obie role, obserwator, koniec, odświeżenie i rewanż PASS; typy/2049 testów/build PASS.
17/62 pakietów, 30/267 części; FIX-02 otwarte. Następny P4-009. Dowody: 05-18-SUMMARY.md. Commit bez push.


2026-10-30, 05-19/P4-009 zakończony: Chińczyk po P4-006/P4-036 nie przykrywa domków; jedyne 641 px u obserwatora
usunięte (podpowiedź „X rzuca kostką…” tylko bez komunikatu o rzucie). Klasyczny 4+obs, Szybki 2+obs do końca,
długie nicki, odświeżenie i rewanż: 640 px. Typy/2049 testów/build PASS. 18/62 pakietów, 31/267 części; FIX-02 otwarte.
Następny P4-010. Dowody: 05-19-SUMMARY.md. Commit bez push.

2026-10-30, 05-20/P4-010 zakończony: Labirynt, gracz w turze 662→640 px (plansza równo z kafelkiem nagłówka, PAD 3→2,
pole 9×9 ~34 px). Klasyczny 4+obs, ściana, partia do końca, rewanż, Szybki 2+obs i odświeżenie: 640 px w grze.
Typy/2049 testów/build PASS. 19/62 pakietów, 32/267 części; FIX-02 otwarte.
Następny P4-019. Dowody: 05-20-SUMMARY.md. Commit bez push.

2026-10-31, 05-21/P4-019 wykonany: Chińczyk, przerywalny pokaz i ruch dostępny od razu po pominięciu.
Typy/2049 testów/build PASS. 20/62 pakietów, 33/267 części; FIX-02 otwarte.
Następny P4-020. Dowody: 05-21-SUMMARY.md. Commit bez push.

2026-10-31, 05-22/P4-020 zakończony: Śledzenie, limit 360 s zamiast 300 s; 20 rund i punktacja bez zmian.
TDD 6421837, T = 287 s, zapas 73 s (25,4%). Solo/6 graczy, samoistny timeout i turniej PASS.
Typy/2050 testów/build PASS. Historia bez przeliczania. 21/62 pakietów, 34/267 części; FIX-02 otwarte.
Następny P4-021, P4-014/015 nadal oczekują U02. Dowody: 05-22-SUMMARY.md. Commit bez push.

2026-10-31, 05-23/P4-021 zakończony: Który rok?, limit 270 s zamiast 240 s; 10 rund, czasy i punktacja bez zmian.
TDD 57a1785, T = 228 s, zapas 42 s (18,4%), zatwierdzony wyjątek 20%. Pełna partia UI 6 osób, timeout handlerów i rewanż PASS.
Typy/2051 testów/build PASS; historia bez przeliczania. 22/62 pakietów, 35/267 części; FIX-02 otwarte.
Następny P4-022, P4-014/015 nadal oczekują U02. Dowody: 05-23-SUMMARY.md. Commit bez push.

2026-10-31, 05-24/P4-022 zakończony: mini-gra ma jeden termin od końca instrukcji; wynik, progress ani próby rywala go nie odnawiają.
TDD 93ef04b, usunięte `kolo.turn`. Typy/2058 testów/build PASS. 23/62 pakietów, 36/267 części; FIX-02 otwarte.
Następny P4-024, P4-014/015 nadal oczekują U02. Dowody: 05-24-SUMMARY.md. Commit bez push.

2026-10-31, 05-25/P4-024 zakończony: jedna średnia zaokrąglona do ms w miejscach i record.tie; w rekordach znany tie przed null jak w SQL.
TDD 18f979b. Typy/2063 testów/build PASS. 24/62 pakietów, 37/267 części; FIX-02 otwarte.
Następny P4-025, P4-014/015 nadal oczekują U02. Dowody: 05-25-SUMMARY.md. Commit bez push.

2026-10-31, 05-26/P4-025 zakończony: jawny remis Gomoku, opcjonalne GameResult.places dla równych dalszych miejsc Szybkiego Chińczyka, wspólne miejsca w tabeli turnieju.
TDD 53201b6. Typy/2067 testów/build PASS. 25/62 pakietów, 39/267 części; FIX-02 otwarte.
Następny P4-026, P4-014/015 nadal oczekują U02. Dowody: 05-26-SUMMARY.md. Commit bez push.

2026-10-31, 05-27/P4-026 zakończony: Kampus Tour, Zaliczenie bankruta wraca do talii, czynsz w statystyce w kwocie oddanej; Juwenalia i poziom 3 po wykupie opisane i przypięte testami.
TDD b4d749e. Typy/2072 testów/build PASS. 26/62 pakietów, 43/267 części; FIX-02 otwarte.
Następny P4-028 (Codex), potem P4-029; P4-014/015 nadal oczekują U02. Dowody: 05-27-SUMMARY.md. Commit bez push.

2026-10-31, 05-28/P4-028 zakończony (Codex, przegląd Claude): Labirynt po czasie losuje legalny krok, pass tylko bez kroku.
TDD 74f0c54. Typy/2078 testów PASS. 27/62 pakietów, 43/267 części; FIX-02 otwarte.
Następny P4-029; P4-014/015 nadal oczekują U02. Dowody: 05-28-SUMMARY.md. Commit bez push.

2026-10-31, 05-29/P4-029: Testy: Kampus Tour; 11/11 części sprawdzone. Typy i pełne testy PASS. 28/62 pakietów, 54/267 części; FIX-02 otwarte. Następny P4-030; P4-014/015 oczekują U02. Dowody: 05-29-SUMMARY.md. Jeden commit, bez push.

2026-10-31, 05-30/P4-030: Testy: gry główne i Turniej; 24/24 części sprawdzone. Typy i pełne testy PASS. 29/62 pakietów, 78/267 części; FIX-02 otwarte. Następny P4-031; P4-014/015 oczekują U02. Dowody: 05-30-SUMMARY.md. Jeden commit, bez push.

2026-10-31, 05-31/P4-031: Testy: quizy i Stój!; 20/20 części sprawdzone, 19 odebranych; F4-046 częściowo, udział rodzajów SKIP → P4-057. Typy i pełne testy PASS. 30/62 pakietów, 97/267 części; FIX-02 otwarte. Następny P4-032; P4-014/015 oczekują U02. Dowody: 05-31-SUMMARY.md. Jeden commit, bez push.

2026-10-31, 05-32/P4-032: Testy: pozostałe mini-gry; 52/52 części sprawdzone. Typy i pełne testy PASS. 31/62 pakietów, 149/267 części; FIX-02 otwarte. Następny P4-033; P4-014/015 oczekują U02. Dowody: 05-32-SUMMARY.md. Jeden commit, bez push.

2026-10-31, 05-33/P4-033: rozpoczęto przygotowanie testów i dokumentacji danych przed kodem; odbiór jeszcze otwarty. Potem 05-34/P4-037.

2026-10-31, 05-33/P4-033 zakończony: wynik i rekordowa partia ze stanu; typy/testy/build i odbiór UI PASS. 32/62 pakietów, 151/267 części. Następny P4-037; F4-046 częściowo SKIP → P4-057; P4-014/015 oczekują U02; FIX-02 otwarte. Dowody: 05-33-SUMMARY.md. Commity bez push.

2026-10-31, 05-34/P4-037 rozpoczęty: pomiar realnych pól dotyku przed zmianą. Bez zmiany liczby odebranych pakietów/części.

2026-10-31, 05-34/P4-037 zakończony: zwykłe kontrolki 48 px; typy/testy/build i odbiór UI PASS. 33/62 pakietów, 152/267 części. Następny P4-038; F4-046 częściowo SKIP → P4-057; P4-014/015 oczekują U02; FIX-02 otwarte. Dowody: 05-34-SUMMARY.md. Commity bez push.

2026-10-31, 05-35/P4-041 zakończony: katalog 14 keyframes z rolą i czasami w ZASADY §5, komentarze index.css zgodne z użyciem, test animations.test.ts.
TDD 4c1b835. Typy/2324 testów (1 SKIP)/build PASS. 34/62 pakietów, 155/267 części; FIX-02 otwarte.
Następny P4-040 (warunek P4-042); P4-014/015 oczekują U02. Dowody: 05-35-SUMMARY.md. Commit bez push.

2026-10-31, 05-36/P4-038 zakończony: Tort łapie najbliższe cięcie do 24 px od odcinka zamiast 10°.
TDD 5d05002. Typy/testy/build PASS. 35/62 pakietów, 156/267 części; FIX-02 otwarte.
Następny P4-039; P4-014/015 oczekują U02. Dowody: 05-36-SUMMARY.md. Commit bez push.

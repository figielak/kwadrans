---
gsd_state_version: "1.0"
current_phase: 5
current_phase_name: Poprawki zaakceptowanych rozbieżności
status: in_progress
stopped_at: 05-25/P4-024 zakończony; P4-014/015 oczekują U02; następny P4-025
last_updated: "2026-10-31"
last_activity: 2026-10-31
last_activity_desc: "P4-024 odebrany; TDD 18f979b, jeden komparator średniego czasu; typy/2063 testów/build PASS; 24/62 pakietów, 37/267 części"
state_head: 28196b51b38fb21b53c0992a2777b5a397f57777
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 60
  completed_plans: 59
  percent: 98
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-10-25)

**Core value:** Każda gra działa i wygląda tak samo przewidywalnie: kod zgadza się z dokumentacją, a wyniki i rekordy są uczciwe i porównywalne między partiami.
**Current focus:** Faza 5: 05-25/P4-024 odebrany. Następny P4-025; P4-014/015 oczekują U02.

## Current Position

Phase: 5 of 5 (Poprawki zaakceptowanych rozbieżności), zakres ZG4-v1/S5-v1 zatwierdzony.
Plan: 24 of 25 currently planned completed; 05-11 oczekuje fizycznego U02.
Status: In progress. Fazy 1-4 zakończone, FIX-01 zakończone. FIX-02 otwarte.
Wykonano 24/62 pakietów (P4-001, P4-027, P4-002..013, P4-016..022, P4-023, P4-024, P4-036), 37/267 części poprawek; P4-014 wdrożony, 2/3 części odebrane.
Last activity: 2026-10-31: zakończono 05-25/P4-024. Jedna średnia zaokrąglona do ms w miejscach i record.tie,
znany tie przed null w rekordach. Dowody w 05-25-SUMMARY.md.

Poprzednio zakończono 05-24/P4-022. Mini-gra ma jeden termin od końca instrukcji,
ruchy rywali go nie odnawiają; usunięte `kolo.turn`. Dowody w 05-24-SUMMARY.md.

Poprzednio zakończono 05-23/P4-021. Który rok?: 270 s, T = 228 s, zapas 42 s (18,4%),
nazwany wyjątek progu 20%. Pełna partia UI, timeout handlerów i rewanż PASS. Dowody w 05-23-SUMMARY.md.

Poprzednio zakończono 05-22/P4-020. Śledzenie: 360 s, T = 287 s i zapas 73 s (25,4%).
TDD 6421837, 20 rund i punktacja bez zmian; solo/6 graczy/turniej i timeout PASS. Dowody w 05-22-SUMMARY.md.

Poprzednio zakończono 05-21/P4-019. Chińczyk: jeden przerywalny pokaz, pierwsze dotknięcie
kończy go bez ruchu, wibracja zbicia raz na zdarzenie. Dowody w 05-21-SUMMARY.md.

Poprzednio 2026-10-30: zakończono 05-20/P4-010. Labirynt: plansza równo z nagłówkiem,
gracz w turze mieści się w 640 px. Dowody w 05-20-SUMMARY.md.

Poprzednio zakończono 05-19/P4-009. Chińczyk: domki i kostka w 640 px,
kafelek bez zdublowanej podpowiedzi. Dowody w 05-19-SUMMARY.md.

Poprzednio zakończono 05-18/P4-008. Statki: rozstawianie w 640 px, obserwator
z ostrzeliwaną planszą u góry. Dowody w 05-18-SUMMARY.md.

Poprzednio zakończono 05-17/P4-007 bez zmian kodu. Gomoku mieści się na 360×640
po P4-006; pomiar w DESIGN §6. Dowody w 05-17-SUMMARY.md.

Poprzednio zakończono 05-16/P4-036. Gęste plansze: wybór i potwierdzenie 56 px
z nazwą wyboru w Labiryncie, Chińczyku, Gomoku i Statkach; reguła w ZASADY §4/DESIGN §6.
Typy/2049 testów/build i /dev 360×640 PASS. Dowody w 05-16-SUMMARY.md.

Poprzednio zakończono 05-15/P4-023. Quizy: legalne szybkie/wolne trafienia,
int czasu i limit 30 błędów, bez limitu 200 trafień. TDD f127c6c, typy/2049 testów/build PASS.
UI oraz rzeczywisty rekord i turniej zgodne. Dowody w 05-15-SUMMARY.md.

Poprzednio zakończono 05-14/P4-018. Kampus Tour: dotyk pomija pokaz,
MPK/karta bez turlania; dublety, Kolokwium, refresh/reduced motion i sieć PASS.
Typy, 1947 testów i build PASS. Dowody w 05-14-SUMMARY.md.

Poprzednio zakończono 05-13/P4-017. Kampus Tour: środek, kontrolki,
podsumowanie i statusy graczy; E13-E15, 2/4, obie orientacje PASS. Typy, 1947 testów i build PASS.
Użytkownik odłożył pomiary telefonu i zlecił kontynuować pozostałe pakiety.
Dowody w 05-13-SUMMARY.md.

Poprzednio zakończono 05-12/P4-016, dostępne akcje wyników.
Typy, 1947 testów, build i UI PASS. P4-015 oczekuje pomiaru telefonu przed zmianą kodu.
Dowody w 05-12-SUMMARY.md.

Poprzednio wdrożono 05-11/P4-014. Formularz i głosowanie przetestowane
w przeglądarce; typy, 1947 testów i build PASS. Fizyczny U02 Android pozostaje otwarty.
Dowody w 05-11-SUMMARY.md.

Poprzednio zakończono 05-10/P4-013. Koło: widoczne zakończenie prób,
solo/2/6, rzeczywisty refresh solo i rekord PASS. Typy, 1947 testów i build PASS.
Dowody w 05-10-SUMMARY.md.

Poprzednio zakończono 05-09/P4-012. Kalambury: zmierzone płótno obu ról,
pełne partie i /dev 2/6 z odświeżeniem PASS; U02 fizyczny Android otwarty.
Typy, 1947 testów i build PASS. Dowody w 05-09-SUMMARY.md.

Poprzednio zakończono 05-08/P4-011. Memory: wszystkie tryby 360×640,
2/6 osób i obserwator, karty minimum 48 px; typy, 1947 testów, build i UI PASS.
Dowody w 05-08-SUMMARY.md.

Poprzednio zakończono 05-07/P4-006. Wspólny nagłówek 106 px w E01-E06;
2/4/6, długie nicki, obserwator, rozłączenie, klawiatura i ponowny montaż PASS.
Typy, 1947 testów i build PASS. Dowody w 05-07-SUMMARY.md.

Poprzednio zakończono Zakupy, Sekwencję i W pamięci. Osobne commity testów
7045659, 76455c9 (odświeżenie snapshotu), f3e7958 i 28196b5; kod pozostaje lokalny.
Typy, 1947 testów i build poprawne; odbiór UI solo/2/6, refresh, klawiatura/dotyk i autozapis Zakupów,
postęp Sekwencji i wynik W pamięci przed Wyniki opisano w 05-04..06-SUMMARY.md.
Użytkownik „Zapisz ten i kolejne commity testów” dał stałą zgodę na obowiązkowe osobne commity testów
w kolejnych zatwierdzonych pakietach. Nie pytać o nie ponownie. Nowsza zgoda: użytkownik „Po każdym tasku rób commity, pozwalam na to” autoryzuje także
commity implementacji po każdym zadaniu. Nie pytać ponownie; push wymaga osobnej prośby.

Previous activity: 2026-10-24: 03-09 zamknął fazę 3: 16 wpisów z 44 częściowych, macierz 39 gier × 6 kryteriów, 14 przekazań D-02 i 22 pytania do partii. Faza 2 zakończona raportem 102 wpisów (300 wystąpień), faza 1 raportem 55 wpisów.

Progress: 98% obecnie rozpisanych planów, 59/60 (fazy 1-4: 35/35; faza 5: 24/25).
To nie jest procent ukończenia wdrożenia: wykonano 24/62 pakietów, dalsze plany będą dopisywane.

## Performance Metrics

**Velocity:**
- Total plans completed: 49
- Average duration (pierwsze 30 planów; 04-01..04-03 bez pomiaru): ok. 38 min (01-01: 25 min, 01-02: 30 min, 01-03: 40 min, 01-04: 45 min, 01-05: 35 min, 01-06: 40 min, 01-07: 45 min, 01-08: 50 min, 01-09: 35 min, 01-10: 40 min, 02-01: 11 min, 02-02: 8 min, 02-03: 45 min, 02-04: 55 min, 02-05: 60 min, 02-06: 45 min, 02-07: 45 min, 02-08: 45 min, 02-09: 50 min, 02-10: 50 min, 02-11: 70 min, 03-01: 35 min, 03-02: 25 min, 03-03: 45 min, 03-04: 60 min, 03-05: 50 min, 03-06: 45 min, 03-07: 40 min, 03-08: 45 min, 03-09: 40 min)
- Total execution time (pierwsze 30 planów; 04-01..04-03 bez pomiaru): ok. 15,2 h (fala 2 równolegle, ok. 1 h zegarowo bez przerwy na limit API)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 10/10 | ok. 6,4 h | ok. 38 min |
| 2 | 11/11 | ok. 8,1 h | ok. 44 min |
| 3 | 9/9 | ok. 7,2 h | ok. 43 min |

**Recent Trend:**
- Last 5 plans: 03-05, 03-06, 03-07, 03-08, 03-09
- Trend: fala 2 równolegle (8 agentów), plany per gra ok. 45-60 min

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Fazy 1-3 to audyty bez zmian w kodzie, każda kończy się `FINDINGS.md` we wspólnym formacie (`plik:linia`, źródło reguły, waga, propozycja)
- [Roadmap]: Fazy 1-3 są od siebie niezależne; faza 4 (raport i akceptacja) czeka na wszystkie trzy
- [Faza 2]: Źródła reguł UI to `ZASADY.md` §4/§5, `DESIGN.md` i `AGENTS.md`; przy sprzeczności wygrywa `ZASADY.md` (D-13); wyjątki z `DESIGN.md` §6 idą na listę odstępstw z powodem
- [Roadmap]: Zakres fazy 5 ustala zaakceptowany raport; przy dużym zakresie rozbić ją na kolejne fazy
- [Faza 3, metoda, nie zatwierdzona nowa reguła]: Podział jak w fazach 1-2 (Kampus Tour osobno, gry główne, 4 grupy mini-gier); proponowany próg zapasu ≥ 20% i ≥ 10 s (D-07) oczekuje w D4-005; symulacje `setup` i botów w scratchpadzie, lokalna `games.db` tylko do odczytu, bez łączenia z Pi (D-10, D-11); każdy wpis z rekomendacją zostawić / zmienić / sprawdzić w partii

### Pending Todos

- Faza 5: P4-014 wdrożony, pełny odbiór oczekuje U02; P4-015 wymaga pomiaru telefonu przed poprawką. 05-25/P4-024 zakończony; 24/62 pakietów, 37/267 części. Następny P4-025.
  Stała zgoda użytkownika z 2026-10-29: „Zapisz ten i kolejne commity testów”. Obowiązkowe commity testów
  przed kodem są już autoryzowane; nowsza stała zgoda obejmuje też commity implementacji po każdym zadaniu; push wymaga osobnej prośby.
- Faza 3 zamknięta (2026-10-24): wejście do fazy 4 to `phases/03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md` (R1-R8 i wpisy pojedyncze B-*, cytowane z prefiksem F3:); styki z fazami 1-2: R1 = F1:Z2 (+ F2:ZK1), R2 = F1:Z3, R6 = F2:U28, B-KT4 = F1:K2, B-KT5 = F1:K11, B-KT6 z F2:U2; wysokie: R1 (Sekwencja, Zakupy, Środek, Tort), R3 (W pamięci, warunkowo); 22 pytania „sprawdzić w partii” w §11 (pozycje 9-13 może częściowo uzupełnić udostępniona kopia bazy; brak pełnych czasów/przebiegów), propozycje do dokumentów w §12
- Do fali 2 fazy 3 z 03-01/03-02: liczby brać z `03-01-CHECKS.md` (§1 stałe, §2 symulacja, §2.1 krzywa Kubków), limit i progi z `03-02-BASELINE.md`; baza dev ma tylko 9 wyników Za zasłoną, więc remisy na szczycie ocenia się ze stałych; nowe do oceny: limit mini-gier bez `turn()` odnawia się po wyniku rywala (`LobbyRoom.ts:375-376`), a w 7 grach ze stałym `key` nie (różny czas wolnego gracza w grze wieloosobowej)
- Faza 3 zaplanowana (2026-10-24): wpisy z faz 1-2 do zamknięcia wymienia D-02 w `03-CONTEXT.md`; poniższe listy „Do fazy 3” są w nim zebrane
- Faza 2 zamknięta (2026-10-24): wejście do fazy 4 to `phases/02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md` (U1-U37, A1-A17 i wpisy pojedyncze, cytowane z prefiksem F2:); poniższe listy „Do 02-11” i „Do fazy 4 z fali 2” są w nim scalone (§5.0 ujednolicenia, §7 propozycje do dokumentów, §9 do potwierdzenia w przeglądarce)
- Do fazy 4 z 02-11: wysokie U1 (ekran partii > 640 px w 11 grach, w tym nowy WP5), U2 (akcja po animacji: Chińczyk, Kampus Tour), KT10, F2:ZK1; nowy wpis A17 („Gotowe” w trzech rolach)
- Faza 1 zamknięta: wejście do fazy 4 to `phases/01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md` (Z1-Z21 i wpisy pojedyncze; poniższe listy są już w nim scalone)
- Do fazy 3 z FINDINGS.md: Z2/SR1 (pomiar limitu Środka), Z3 (trudność z losowania: Stoper, Rytm, Liczenie, Odcień, Kąt, W pamięci), K2, K11 (balans Kampus Tour)
- Do fazy 3 z 01-03: K11 (budynki po utracie kompletu), K2 (Juwenalia po wykupie)
- Do fazy 4 z 01-04: odstępstwo D-11 Labiryntu (`timeoutMove` to najlepszy krok, gracz bez ruchu idzie do celu); nowy klucz zbiorczy `setup-ten-sam-seed` dla 01-10
- Do fazy 4 z 01-05: KL1 (`hint` w Kalamburach może wysłać sam rysujący przed limitem; dopisać do dokumentu albo dać przycisk); nowy klucz zbiorczy `turn-key-staly` dla 01-10
- Do fazy 3 z 01-06: SQ1 (limit 300 s w Sekwencji pęka od serii ok. 24, pomiar przy kryterium 4), W6a (Stoper i Rytm bez wyrównania trudności, REC-01); nowe klucze zbiorcze `trudnosc-z-losowania`, `tie-zaokraglenie`, `po-koncu`, `wygrana-kazdego` dla 01-10
- Do fazy 4 z 01-07: W7a (limit czasu w Schultem i Sudoku lepszy od wyniku z dużą karą, wysoka), ZK1 (Zakupy: limit 60 s bez zapasu, wysoka; najpierw test :42 i ZASADY-GIER :492); do fazy 3: LC1 (rodzaje działań w Liczeniu, `trudnosc-z-losowania`); nowy klucz zbiorczy `timeout-nie-najgorszy` dla 01-10
- Do fazy 3 z 01-08: SR1 (Środek: limit 60 s do pomiaru, 10 s to same odsłony), W8b (Odcień i Kąt bez wyrównania trudności, `trudnosc-z-losowania`); do fazy 4: W8a (Policz kropki: limit = same zera, dołącza do `timeout-nie-najgorszy`), KO1 (Koło bez `ranked`), W8c (trzy kopie szkieletu kropki/kąt/rok)
- Do fazy 3 z 01-09: W9a (W pamięci: 15-35 mnożeń na partię, `trudnosc-z-losowania`); do fazy 4: SL1 (Śledzenie: test prędkości i odstępu słabszy od dokumentu), WP1 (W pamięci: „każda runda to nowy ciąg” bez testu), KB1, WP2 (niskie); limit czasu we wszystkich 4 grach najgorszy, nowych kluczy zbiorczych brak
- Do fali 2 fazy 2 z 02-01/02-02: dowody brać z `02-01-CHECKS.md` (515 trafień, `plik:linia`) i `02-02-BASELINE.md` (wzorce W-01..W-18 z wagą); klucze `[zbiorcze: …]` w BASELINE są robocze (powstał przed CHECKS), 02-11 dopasowuje je przy scalaniu
- Do fali 2: rozbieżności platformy średnie: B-31 `.swatch-range` 36 px < 48 (`index.css:148`, Odcień, Który rok? → 02-09), B-32 uchwyt suwaka `#fff`/`#000` spoza tokenów (`index.css:155-168`), B-36 `ring-pulse` 1 s w Chińczyku kontra 1,2 s w Memory i `Game.tsx:525` (→ 02-03, 02-05); en-dash w `Balon.tsx:109` (średnia, → 02-07)
- Do fali 2, „do oceny” w planach gier: rAF bez `reducedMotion` w Śledzeniu (:75) i Wieży (:77), Kubki i Za zasłoną z uzasadnieniem w komentarzu, a ZASADY §5 nie ma wyjątku dla ruchu będącego treścią gry (B-53); pomiar czasu obok animacji w 12 grach (CHECKS §14); wibracja 60 przy ruchu ignorowanym bez kary (Nożyczki:80, Środek:91); pola < 48 px: Lobby:385 `size-10`, PanstwaMiasta:312 `min-h-11`; `hsl` w `Kolo.tsx:71` bez wyjątku w DESIGN §6; `text-accent-fg` na tle `warning` w Stój!; hex tokenów na sztywno (Simon, Stroop, KampusTour); `btn-primary` ×3 w Game.tsx, ×2 Home, ×2 Lobby (sprawdzić dwa wypełnione na ekranie)
- Fala 2 fazy 2 zamknięta (2026-10-24): 222 wpisy, wysokie 13: G1, S1, C1, L1, M1 (gry główne > 640 px, główna przyczyna to pigułki graczy w nagłówku `Game.tsx`, Z1 w 02-05), C8 (Chińczyk: akcja dopiero po animacji, limit biegnie), PM1 (Państwa-miasta 770-1000 px), KL1 (Kalambury zgadujący ok. 700 px, `BELOW_CANVAS_PX` bez nagłówka), KT10 (Kampus Tour: środek planszy ucinany), KA1 (Kampus Tour: decyzje po marszu pionka), ZK1 (Zakupy: „Gotowe” na `onClick` w pomiarze remisu), KO1 (Narysuj koło ok. 700 px), SZ1 (Szacowanie: kafel ściska się pod klawiaturą Androida)
- Do fazy 3 z fali 2: ZK1 (waga, bo czas działa tylko przy remisie), kary Schultego/Sudoku całkowite czy ułamkowe (SC1), RF4/SJ2 (Refleks i Stój!: pomiar od zmiany stanu, nie od klatki bodźca), marsz pionka Kampus Tour do 3,3 s na rzut (szacunek 45 min), C8 w trybie Szybkim (do 1 s z 20 s), WP3 (W pamięci: wynik wysyłany dopiero po „Wyniki”, odłożony telefon = 0 rund)
- Do fazy 4 z fali 2 (decyzje o dokumentach): wyjątek w §5 na ruch będący treścią gry (Kubki, Śledzenie, Wieża, Za zasłoną; B-53) i na akcję po animacji (KA1, C8); `float-up` przy reduced motion kończy na `opacity: 0` (WZ1, Balon, `ui.tsx:132`, `Game.tsx:311`); DESIGN §6: mini-gry i ekrany poza partią nie mieszczą się w 640 px (HM-8, KO1), pola < 48 px gęstych plansz, przewijanie Państw-miast; dwa wypełnione przyciski na Home (HM-1); dwa znaczenia „Dalej” i przycisk po odsłonie („Wyniki”, „Następna runda”; PM11, W9b, WP2); jeden wzór „dotknięcia zignorowanego” (Zasłona, Środek, Nożyczki, Koło); pudło = pomyłka z wibracją 60 (Memory, Statki, Kalambury, Simon, falstart Refleksu); wibracja „zło od innego gracza” (trafienie floty, wykupienie pola, STOP); wibracja tury po kluczu fazy (KL7 zdradza połówki rysowania); wiersz metronomu 30 i paska czasu w tabeli §5; własne tabele wyników/rund jako drugi wzorzec albo `RoundTable` z `children` (QZ1, PT1, BL1, W9f); jedna animacja „czekamy na rywala” i odsłony wyniku; `Intro` `time` z liczbą rund; nagłówek gier głównych w `Game.tsx` do zmniejszenia (faza 4/5)
- Do 02-11, nowe klucze zbiorcze z fali 2 (do ujednolicenia, część to synonimy): `wysokosc-640`, `kolor-jedyny-sygnal` = `kolor-gracza-jedyny-sygnal`, `podpis-label`, `float-up-reduced` = `float-up-reduced-motion`, `pomiar-timestamp`, `koniec-po-pomylce`, `sytuacja-trafienie`, `rola-tokenu`, `stan-krycie`, `naglowek-wlasny`, `dalej-kolor`, `wibracja-fazy`, `koniec-partii`, `animacja-po-odswiezeniu`, `czekamy-animacja`, `wibracja-zlo-od-gracza`, `aria-plansza`, `aria-label`, `aria-label-span`, `wlasna-tabela-wynikow` = `wlasna-lista-wynikow`, `tabela-rund-wlasna` = `wlasna-tabela-rund`, `siatka-1fr`, `zaznaczenie-gracza`, `zaznaczenie-bez-przejscia`, `stale-piksele`, `odslona-animacja`, `zignorowany-ruch` = `dotyk-zignorowany`, `intro-time`, `znacznik-prawdy`, `liczby-poza-stats`, `pasek-rundy-wlasny`, `brak-wartosci`, `roundtable-szerokosc`, `brak-wibracji-pomylki`, `pomylka-bez-znaku`, `accent-fg-poza-akcentem`, `wlasny-grade`, `jednostka-odchylki`, `myslnik`, `animacja-ucieta`, `ladowanie-rekordow`, `stan-rozlaczony`; do tego ujednolicić wagę 360×640 (ekran gry = wysoka, podsumowanie ze `StickyBar` = średnia) i scalić licznik par Memory bez mono (`Game.tsx:287`, z 02-05 do 02-03)
- Do 02-11 (niskie, zbiorczo): 6 keyframes spoza tabeli §5 (`line-draw`, `title-pop`, `tile-hit`, `tile-miss`, `piece-fall`, `shake`), 8 użyć `animate-pulse`/`animate-ping`, `rounded-sm`/`rounded-[..]` spoza skali, `stone-pop` 0,5 s zamiast 350 ms, `transition-opacity` 150 ms, nieaktualne komentarze keyframes, brak `color-scheme: dark`, `accent-hover` poza DESIGN §2

### Blockers/Concerns

- Źródłem prawdy są `KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`; przy sprzeczności z `.planning/codebase/` wygrywają one
- Szkice w `plany/` mogą być nieaktualne wobec `ZASADY-GIER.md` (nie traktować ich jako źródła zasad)

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-10-31
Stopped at: 05-25 zakończony; następny P4-025; P4-014/015 oczekują U02; FIX-02 otwarte
Resume file: .planning/phases/05-poprawki-zaakceptowanych-rozbieznosci/05-25-SUMMARY.md


2026-10-29, 05-03/P4-002: dokumentacja i testy regresji przygotowane przed kodem. Typecheck PASS;
pełny games 1864 PASS / 25 FAIL (oczekiwany RED), serwer 6 PASS / 8 FAIL, dotychczasowe Kalambury PASS.
Przed implementacją wymagany osobny commit pięciu plików testów na prośbę użytkownika.
Dowody: [05-03-TDD](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-03-TDD.md).
Nadal 2/62 pakietów i 6/267 części; FIX-02 otwarte. Starsze wpisy „05-03 gotowy, nie rozpoczęty” są historyczne.


2026-10-29, 05-03/P4-002 zakończony po osobnym commicie testów e635dc9 na prośbę użytkownika.
Typecheck, 1918 testów, build i odbiór UI 2/6+refresh/stare detail/remis/turniej poprawne.
3/62 pakietów i 7/267 części; FIX-02 otwarte. Starszy wpis RED powyżej jest historyczny.


2026-10-29, 05-04..06 zakończone. Wcześniejsze wpisy RED i pytania o commity są historyczne.
Zakupy: 80 s, autozapis i pointerdown. Sekwencja: zaliczona seria po limicie i refresh.
W pamięci: wynik natychmiast, niezależna odsłona. Typy, 1947 testów, build i UI PASS.
6/62 pakietów, 11/267 części; FIX-02 otwarte. Stała zgoda na obowiązkowe commity testów obowiązuje.


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

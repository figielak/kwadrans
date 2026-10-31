# Roadmap: Kwadrans

## Overview

Audyt spójności istniejącej platformy: trzy niezależne audyty (zasady, testy i podpięcie; wygląd, animacje i wibracje; balans rekordów i trudności) porównują kod z `KONCEPT.md`, `ZASADY-GIER.md` i `ZASADY.md` §2-6 i niczego w kodzie nie zmieniają. Ich ustalenia trafiają do jednego raportu z priorytetami, który akceptuje użytkownik, a dopiero potem zaakceptowane rozbieżności są poprawiane zgodnie z procesem projektu (test i dokument przed kodem, `pnpm typecheck && pnpm test` bez błędów).

Wspólny format ustaleń (fazy 1-3): plik `FINDINGS.md` w katalogu fazy, jeden wpis na rozbieżność: gra lub ekran, `plik:linia`, źródło reguły (dokument i sekcja), waga (wysoka / średnia / niska), proponowana poprawka.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Audyt zasad, testów i podpięcia** - kod zasad, testy i podpięcie każdej gry kontra `KONCEPT.md`, `ZASADY-GIER.md` i `ZASADY.md` §2, §3, §6
- [x] **Phase 2: Audyt wyglądu, animacji i wibracji** - ekrany gier kontra `ZASADY.md` §4 i §5 oraz `DESIGN.md`
- [x] **Phase 3: Audyt balansu rekordów i trudności** - równe szanse partii, sufit, remisy, krzywa trudności, limity tury, gry główne
- [x] **Phase 4: Raport zbiorczy i akceptacja** - jedna lista rozbieżności z priorytetami i decyzją użytkownika
- [ ] **Phase 5: Poprawki zaakceptowanych rozbieżności** - kod, testy i dokumenty znowu mówią to samo

## Phase Details

### Phase 1: Audyt zasad, testów i podpięcia
**Goal**: Wiadomo, gdzie kod zasad, testy i podpięcie każdej gry z `GAMES` rozjeżdżają się z `KONCEPT.md`, `ZASADY-GIER.md` i regułami `ZASADY.md` §2, §3 i §6
**Depends on**: Nothing (first phase)
**Requirements**: RULE-01, RULE-02, RULE-03, WIRE-01, WIRE-02
**Success Criteria** (what must be TRUE):
  1. Dla każdej gry z `GAMES` `FINDINGS.md` mówi, czy ma sekcję w `ZASADY-GIER.md` i opis w `KONCEPT.md` §2, i wymienia każdą stałą (rundy, czasy, kary, limity tury, tryby) niezgodną z dokumentami, z miejscem w kodzie i w dokumencie
  2. Każde odstępstwo od reguł `ZASADY.md` §3 (`timeoutMove`, remis bez zwycięzcy, start pierwszego z `players`, tylko `rng`, stan JSON, `ranked`/`places`, wspólne funkcje `core.ts`) ma wpis z `plik:linia` i informacją, czy `ZASADY-GIER.md` podaje powód
  3. Dla każdego `<gra>.test.ts` jest lista brakujących testów obowiązkowych z `ZASADY.md` §2, ogólnych i zależnych od typu gry
  4. Tabela podpięć pokazuje dla każdej gry komplet z §6 (`GAMES`, `View`, gałąź `Game.tsx`, `ICONS`; mini-gra: `MINI_GAMES`, `record` i `tie`, `RECORDS`, `FORMAT`, `MiniGame.tsx`) z zaznaczonymi lukami
  5. Dla każdej mini-gry wiadomo, czy ekran końcowy rysuje się z samego stanu (`soloState`, `me=""`); każda zależność od stanu lokalnego komponentu ma `plik:linia`
**Plans**: 10 plans
- [x] 01-01-PLAN.md — skrypty hurtowe reguł §3 i mapa pokrycia index.test.ts (fala 1)
- [x] 01-02-PLAN.md — tabela podpięć §6 i ekran końcowy mini-gier z samego stanu (fala 1)
- [x] 01-03-PLAN.md — Kampus Tour (fala 2)
- [x] 01-04-PLAN.md — gry główne turowe: Gomoku, Statki, Chińczyk, Labirynt, Memory (fala 2)
- [x] 01-05-PLAN.md — fazy równoczesne i Turniej: Państwa-miasta, Kalambury, Turniej (fala 2)
- [x] 01-06-PLAN.md — mini-gry na czas i reakcję (8 gier, fala 2)
- [x] 01-07-PLAN.md — mini-gry na trafienia (9 gier, fala 2)
- [x] 01-08-PLAN.md — mini-gry z odchyłką w rundach (9 gier, fala 2)
- [x] 01-09-PLAN.md — mini-gry do pierwszej pomyłki (4 gry, fala 2)
- [x] 01-10-PLAN.md — scalenie w FINDINGS.md (fala 3)

### Phase 2: Audyt wyglądu, animacji i wibracji
**Goal**: Wiadomo, które ekrany gier i platformy łamią reguły wyglądu (`ZASADY.md` §4, `DESIGN.md`) oraz animacji i wibracji (§5)
**Depends on**: Nothing (niezależna od fazy 1, może iść równolegle)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, ANIM-01, ANIM-02, ANIM-03
**Success Criteria** (what must be TRUE):
  1. `FINDINGS.md` wymienia z `plik:linia` każdy kolor spoza tokenów, czerwień tam, gdzie powinien być kolor gracza, i zaokrąglenia inne niż 20 / 10 px
  2. Wymienione są pola dotykowe poniżej 48 px, gry na czas bez `touch-none select-none` albo bez `onPointerDown` oraz elementy, które psują ekran 360×640 (stałe piksele, poziome przewijanie)
  3. Wymienione są teksty z em-dashem, kropką dziesiętną albo innym słowem niż „Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”, liczby bez mono i `tabular-nums`, mini-gry z niepełnym `Intro` (brak `Preview` albo punktu time / task / score) oraz braki `aria-hidden` i `aria-label`
  4. Wymienione są animacje spoza keyframes `index.css` albo z czasem niezgodnym z tabelą §5, ta sama sytuacja animowana różnie w różnych grach, animacje JS bez `reducedMotion`, animacje blokujące grę i pomiar czasu zależny od animacji
  5. Wymienione są wibracje o wzorze innym niż 40 / 60 / [60, 40, 60], gry dublujące wibrację tury z `Game.tsx` i wibracje przy poprawnym trafieniu
**Plans**: 11 plans
- [x] 02-01-PLAN.md — skrypty hurtowe po `apps/web/src` (kolory spoza tokenów i czerwień, `rounded-*`, em-dash, `toFixed` bez przecinka, `vibrate`, `animate-[...]` kontra keyframes, `setTimeout`/`requestAnimationFrame` bez `reducedMotion`, `onClick` zamiast `onPointerDown`, stałe `w-[..px]`, przyciski bez `aria-label`) → `02-01-CHECKS.md` (fala 1)
- [x] 02-02-PLAN.md — wzorce platformy: `index.css` (tokeny, katalog keyframes z czasami, reguła `prefers-reduced-motion`, `.btn` 48 px) i `ui.tsx` (`Intro`, `GameDots`, `Scores`, `Stats`, `StickyBar`) jako punkt odniesienia dla gier (fala 1)
- [x] 02-03-PLAN.md — ekrany platformy: `Game.tsx` (nagłówek, wibracja tury, „Rewanż” / „Do lobby”), `Home`, `Lobby`, `Setup` (bez `TournamentSetup`), `MiniGames`, `Records`, `App` (fala 2)
- [x] 02-04-PLAN.md — Kampus Tour i `KampusSummary` (własny nagłówek, kroki pionka `STEP_MS`/`ROLL_MS`, kości, pływające kwoty) (fala 2)
- [x] 02-05-PLAN.md — gry główne turowe: Gomoku, Statki (`SWAP_MS`), Chińczyk (wzór kroków), Labirynt, Memory: kolor gracza, `stone-pop`, wibracja zbicia (fala 2)
- [x] 02-06-PLAN.md — fazy równoczesne: Państwa-miasta (własny nagłówek), Kalambury (płótno, paleta), ekran turnieju (`TournamentSetup` i część turniejowa `Game.tsx`) (fala 2)
- [x] 02-07-PLAN.md — mini-gry na czas i reakcję (8 gier): bodziec bez przejścia, `touch-none select-none`, pomiar niezależny od animacji, Rytm i Przytrzymaj bez licznika (fala 2)
- [x] 02-08-PLAN.md — mini-gry na trafienia (9 gier): `Quiz.tsx` raz, blokada 1 s i wibracja pomyłki, trafienie bez wibracji (fala 2)
- [x] 02-09-PLAN.md — mini-gry z odchyłką w rundach (9 gier): `Szacowanie.tsx` raz, odsłona wyniku, przecinek dziesiętny, tabele rund na 360 px (fala 2)
- [x] 02-10-PLAN.md — mini-gry do pierwszej pomyłki (4 gry): animacje kubków, kulek i klocków z `reducedMotion`, przerywanie animacji nowym stanem (fala 2)
- [x] 02-11-PLAN.md — porównanie między grami (ta sama sytuacja = ta sama animacja, te same słowa) i scalenie w `FINDINGS.md` (fala 3)
- [x] [05-07-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-07-PLAN.md) - P4-006, wspólny zwijany nagłówek; pomiar przed/po i odbiór UI PASS
- [x] [05-08-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-08-PLAN.md) - P4-011, Memory: wszystkie tryby mieszczą się w ekranie, minimum 48 px; UI i testy PASS
- [x] [05-09-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-09-PLAN.md) - P4-012, Kalambury: zmierzone płótno obu ról, UI i testy PASS; U02 fizyczne otwarte
- [x] [05-10-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-10-PLAN.md) - P4-013, Koło: płótno i widoczne zakończenie, UI i testy PASS
- [x] [05-11-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-11-PLAN.md) - P4-014, 3/3 części; U02 na Androidzie odebrany 2026-10-31 (razem z P4-015 bez zmian kodu)
- [x] [05-12-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-12-PLAN.md) - P4-016, dostępne akcje wyników; P4-015 pominięty do pomiaru U02
- [x] [05-13-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-13-PLAN.md) - P4-017, Kampus Tour: środek, rozmiary kontrolek i podsumowanie; 4/4 odebrane
- [x] [05-14-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-14-PLAN.md) - P4-018, Kampus Tour: przerywalny pokaz, prawdziwe rzuty i teleporty; 3/3 odebrane
- [x] [05-15-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-15-PLAN.md) - P4-023, quizy: granice i zachowanie czasów; TDD f127c6c, 2/2 odebrane
- [x] [05-16-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-16-PLAN.md) - P4-036, gęste plansze: wybór z potwierdzeniem 56 px; 1/1 odebrane
- [x] [05-17-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-17-PLAN.md) - P4-007, Gomoku: pomiar 360×640 bez zmian kodu; 1/1 odebrane
- [x] [05-18-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-18-PLAN.md) - P4-008, Statki: rozstawianie w ekranie, obserwator z aktywną planszą; 1/1 odebrane
- [x] [05-19-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-19-PLAN.md) - P4-009, Chińczyk: domki i kostka w 640 px; 1/1 odebrane
- [x] [05-20-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-20-PLAN.md) - P4-010, Labirynt: plansza równo z nagłówkiem, tura w 640 px; 1/1 odebrane
- [x] [05-29-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-29-PLAN.md) - P4-029, Testy: Kampus Tour; 11/11 części, typy/testy PASS
- [x] [05-30-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-30-PLAN.md) - P4-030, Testy: gry główne i Turniej; 24/24 części, typy/testy PASS
- [x] [05-31-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-31-PLAN.md) - P4-031, Testy: quizy i Stój!; 19/20 części odebranych; F4-046 częściowo, udział rodzajów SKIP → P4-057; typy/testy PASS
- [x] [05-32-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-32-PLAN.md) - P4-032, Testy: pozostałe mini-gry; 52/52 części, typy/testy PASS
- [x] [05-33-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-33-PLAN.md) - P4-033, wynik i rekordowa partia ze stanu; typy/testy/build/UI PASS
- [x] [05-34-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-34-PLAN.md) - P4-037, zwykłe kontrolki 48 px; typy/testy/build/UI PASS
**UI hint**: yes

### Phase 3: Audyt balansu rekordów i trudności
**Goal**: Wiadomo, które gry dają nierówne szanse między partiami, mogą dobić do sufitu wyniku albo mają źle dobraną krzywą trudności i limit tury
**Depends on**: Nothing (niezależna od faz 1 i 2, może iść równolegle)
**Requirements**: REC-01, REC-02, REC-03, DIFF-01, DIFF-02, DIFF-03
**Success Criteria** (what must be TRUE):
  1. `FINDINGS.md` wskazuje mini-gry z losowymi celami, w których suma do zdobycia zmienia się między partiami (brak `withSum`, zmienna liczba bodźców, osobne losowanie zamiast potasowanych kompletów)
  2. Każda gra „do pierwszej pomyłki” i z limitem rund ma podane maksimum osiągalne i ocenę ryzyka remisów na szczycie rekordów; każda mini-gra ma ocenę, czy potrzebuje `record.tie`, i sprawdzony kierunek `lower` wobec dokumentacji
  3. Każda gra z progresją (Kubki, Śledzenie, Wieża, W pamięci, Inny element, Obrót, Sekwencja, Stój! i inne) ma krzywą trudności wyliczoną ze stałych przyrostu i ocenę, gdzie robi się za łatwa albo niemożliwa
  4. Limit tury każdej mini-gry jest zestawiony z najdłuższą uczciwą partią policzoną ze stałych plus zapas, a gry po kolei są sprawdzone na 60 s
  5. Ekonomia Kampus Tour (pytania z `KONCEPT.md` §9), przewaga pierwszego gracza w Gomoku i Labiryncie oraz tryby Szybkie mają ocenę i rekomendację: zostawić, zmienić albo sprawdzić w partii
**Plans**: 9 plans
- [x] 03-01-PLAN.md — tabela stałych 30 mini-gier, symulacja `setup` na 1000 seedów (do zdobycia, trudność z losowania), rozkład wyników z lokalnej `games.db` → `03-01-CHECKS.md` (fala 1)
- [x] 03-02-PLAN.md — model czasu partii (limit = najdłuższa uczciwa partia + zapas), progi ludzkie, wzorce `withSum` i kompletów, szablon sekcji → `03-02-BASELINE.md` (fala 1)
- [x] 03-03-PLAN.md — Kampus Tour: ekonomia statycznie, symulacja botów (2-4 graczy, 500+ partii), K2, K11, długość partii i limit 60 s z marszem pionka (fala 2)
- [x] 03-04-PLAN.md — gry główne: Gomoku, Labirynt, Statki, Chińczyk, Memory, Państwa-miasta, Kalambury, Turniej: przewaga kolejności, tryby, limity tur i faz (fala 2)
- [x] 03-05-PLAN.md — mini-gry na czas i reakcję (8 gier, fala 2)
- [x] 03-06-PLAN.md — mini-gry na trafienia (9 gier, fala 2)
- [x] 03-07-PLAN.md — mini-gry z odchyłką w rundach (9 gier, fala 2)
- [x] 03-08-PLAN.md — mini-gry do pierwszej pomyłki (4 gry, fala 2)
- [x] 03-09-PLAN.md — scalenie w `FINDINGS.md`: macierz gra × kryterium, wpisy zbiorcze, zamknięcie wpisów z faz 1-2, lista „sprawdzić w partii” (fala 3)

### Phase 4: Raport zbiorczy i akceptacja
**Goal**: Użytkownik ma jedną listę rozbieżności z priorytetami i zdecydował, co poprawiać
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: FIX-01
**Success Criteria** (what must be TRUE):
  1. Jeden raport zbiera ustalenia z faz 1-3 bez duplikatów (ta sama rozbieżność z dwóch audytów to jeden wpis), każdy wpis z `plik:linia`, wagą i proponowaną poprawką
  2. Wpisy są zgrupowane w pakiety poprawek z priorytetem (per gra albo per reguła), z których każdy da się zrobić i sprawdzić osobno; pakiety zmieniające zasady gry są oznaczone
  3. Każdy wpis ma decyzję użytkownika: poprawić, zostawić jako odstępstwo z powodem w `ZASADY-GIER.md` albo odrzucić
  4. Lista zaakceptowanych pakietów jest zapisana jako zakres fazy 5 (przy dużym zakresie rozbita na kolejne fazy przez `/gsd-phase`)
**Plans**: 5/5 zakończone; ZG4-v1 zatwierdzone w całości 2026-10-26, FIX-01 zakończone

Kontekst i kolejność: [04-CONTEXT.md](phases/04-raport-zbiorczy-i-akceptacja/04-CONTEXT.md).

- [x] [04-01-PLAN.md](phases/04-raport-zbiorczy-i-akceptacja/04-01-PLAN.md) - scalenie i aktualność ustaleń F1/F2/F3, mapa źródeł i wpisy F4 → `FINDINGS.md` (fala 1)
- [x] [04-02-PLAN.md](phases/04-raport-zbiorczy-i-akceptacja/04-02-PLAN.md) - wybrane pomiary, niepewne dowody i warianty decyzji → `04-02-EVIDENCE.md`, `DECISIONS.md` (fala 2)
- [x] [04-03-PLAN.md](phases/04-raport-zbiorczy-i-akceptacja/04-03-PLAN.md) - pakiety, priorytety, zależności i odbiór → `PACKAGES.md`, `REPORT.md` (fala 3)
- [x] [04-04-PLAN.md](phases/04-raport-zbiorczy-i-akceptacja/04-04-PLAN.md) - decyzje użytkownika o konkretnej wersji wpisów i pakietów, z obsługą częściowej akceptacji (fala 4, wymaga udziału użytkownika)
- [x] [04-05-PLAN.md](phases/04-raport-zbiorczy-i-akceptacja/04-05-PLAN.md) - zaakceptowany zakres fazy 5 i kontrola czterech kryteriów FIX-01 → `PHASE-5-SCOPE.md` (fala 5)

04-01: `FINDINGS.md` v1 scala 173 źródła w 168 wpisów F4 (7 wysokich, 55 średnich, 106 niskich); zachowano 47 odstępstw i 22 pytania. Wszystkie decyzje oczekują.

04-02: `04-02-EVIDENCE.md` i `DECISIONS.md` v1 gotowe (15 pomiarów układu, U01-U14, P01-P22, 106 oczekujących kart i pełne mapowania). FINDINGS v1.1 aktualizuje pewność czterech agregatów, bez zmiany wag; brak zmian kodu/zasad. Następny 04-03: pakiety i raport.

04-03: `PACKAGES.md` PK4-v1 i `REPORT.md` R4-v1 gotowe: 62 propozycje (19 P1 / 36 P2 / 7 P3), 27 pozycji H, mapa 168 F4 i 295 rozłącznych części, zależności bez cykli, wymagane decyzje i odbiór. Następny 04-04 wymaga udziału użytkownika; nic nie zaakceptowano za niego.

Planowanie, scalenie, warianty ani przygotowanie pakietów nie zamykają FIX-01. Faza 4 kończy się po decyzji dla każdego wpisu i przekazaniu zaakceptowanego zakresu;
otwarte pomiary i częściowa akceptacja pozostają jawne. Zmiany kodu i dokumentów źródłowych należą do fazy 5.

### Phase 5: Poprawki zaakceptowanych rozbieżności
**Goal**: Zaakceptowane rozbieżności w zasadach, testach, podpięciu, UI i balansie są usunięte, a kod, testy i dokumenty znowu mówią to samo
**Depends on**: Phase 4
**Requirements**: FIX-02
**Success Criteria** (what must be TRUE):
  1. Każdy zaakceptowany wpis z raportu jest poprawiony albo jawnie przeniesiony z powodem; żaden nie znika bez śladu
  2. Każda zmiana zasad gry ma w historii najpierw test i wpis w `ZASADY-GIER.md` (oraz `KONCEPT.md`, jeśli dotyczy), dopiero potem kod
  3. `pnpm typecheck && pnpm test` przechodzi bez błędów po każdym pakiecie
  4. Ponowne sprawdzenie poprawionych wpisów tą samą metodą co w audycie nie znajduje ich w kodzie
  5. Żadne `id` gry się nie zmieniło, nie doszła żadna zależność bez zgody, `apps/server` dalej nie ma bezpośredniego `zod`
**Plans**: 44 obecnie rozpisane (44/44 odebranych); pełny zakres 62 pakietów w [S5-v1](phases/04-raport-zbiorczy-i-akceptacja/PHASE-5-SCOPE.md).

- [x] [05-01-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-01-PLAN.md) - P4-001, wspólne normy i granice wyjątków, już zatwierdzone ZG4-v1
- [x] [05-02-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-02-PLAN.md) - P4-027, Kalambury i zaufane źródło walidacji; TDD 50172d5, wdrożenie i odbiór zakończone
- [x] [05-03-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-03-PLAN.md) - P4-002, najgorszy wynik po limicie; TDD e635dc9, implementacja i odbiór zakończone
- [x] [05-04-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-04-PLAN.md) - P4-003, Zakupy: 80 s, autozapis i pointerdown; wykonano po TDD 7045659/76455c9
- [x] [05-05-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-05-PLAN.md) - P4-004, Sekwencja: zaliczona seria po limicie; wykonano po TDD f3e7958
- [x] [05-06-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-06-PLAN.md) - P4-005, W pamięci: wynik natychmiast; wykonano po regresji 28196b5
- [x] [05-07-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-07-PLAN.md) - P4-006, wspólny zwijany nagłówek; pomiar przed/po i odbiór UI PASS
- [x] [05-08-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-08-PLAN.md) - P4-011, Memory: wszystkie tryby mieszczą się w ekranie, minimum 48 px; UI i testy PASS
- [x] [05-09-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-09-PLAN.md) - P4-012, Kalambury: zmierzone płótno obu ról, UI i testy PASS; U02 fizyczne otwarte
- [x] [05-10-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-10-PLAN.md) - P4-013, Koło: płótno i widoczne zakończenie, UI i testy PASS
- [x] [05-11-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-11-PLAN.md) - P4-014, 3/3 części; U02 na Androidzie odebrany 2026-10-31 (razem z P4-015 bez zmian kodu)
- [x] [05-12-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-12-PLAN.md) - P4-016, dostępne akcje wyników; P4-015 pominięty do pomiaru U02
- [x] [05-13-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-13-PLAN.md) - P4-017, Kampus Tour: środek, rozmiary kontrolek i podsumowanie; 4/4 odebrane
- [x] [05-14-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-14-PLAN.md) - P4-018, Kampus Tour: przerywalny pokaz, prawdziwe rzuty i teleporty; 3/3 odebrane
- [x] [05-15-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-15-PLAN.md) - P4-023, quizy: granice i zachowanie czasów; TDD f127c6c, 2/2 odebrane
- [x] [05-16-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-16-PLAN.md) - P4-036, gęste plansze: wybór z potwierdzeniem 56 px; 1/1 odebrane
- [x] [05-17-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-17-PLAN.md) - P4-007, Gomoku: pomiar 360×640 bez zmian kodu; 1/1 odebrane
- [x] [05-18-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-18-PLAN.md) - P4-008, Statki: rozstawianie w ekranie, obserwator z aktywną planszą; 1/1 odebrane
- [x] [05-19-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-19-PLAN.md) - P4-009, Chińczyk: domki i kostka w 640 px; 1/1 odebrane
- [x] [05-20-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-20-PLAN.md) - P4-010, Labirynt: plansza równo z nagłówkiem, tura w 640 px; 1/1 odebrane
- [x] [05-21-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-21-PLAN.md) - P4-019, Chińczyk: przerywalna animacja i dostępny ruch; 1/1 odebrane
- [x] [05-22-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-22-PLAN.md) - P4-020, Śledzenie: limit 360 s i zapas 73 s; TDD 6421837, 1/1 odebrane
- [x] [05-23-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-23-PLAN.md) - P4-021, Który rok?: 270 s i zapas 42 s; TDD 57a1785, 1/1 odebrane
- [x] [05-24-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-24-PLAN.md) - P4-022, jeden termin mini-gry niezależny od rywali; TDD 93ef04b, 1/1 odebrane
- [x] [05-25-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-25-PLAN.md) - P4-024, jeden komparator średniego czasu; TDD 18f979b, 1/1 odebrane
- [x] [05-26-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-26-PLAN.md) - P4-025, jawny remis i kolejność dalszych miejsc; TDD 53201b6, 2/2 odebrane
- [x] [05-27-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-27-PLAN.md) - P4-026, Kampus Tour: karta, wykup i rzeczywisty czynsz; TDD b4d749e, 4/4 odebrane
- [x] [05-28-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-28-PLAN.md) - P4-028, Labirynt: losowy legalny krok po czasie; TDD 74f0c54 (Codex)
- [x] [05-29-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-29-PLAN.md) - P4-029, Testy: Kampus Tour; 11/11 części, typy/testy PASS
- [x] [05-30-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-30-PLAN.md) - P4-030, Testy: gry główne i Turniej; 24/24 części, typy/testy PASS
- [x] [05-31-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-31-PLAN.md) - P4-031, Testy: quizy i Stój!; 19/20 części odebranych; F4-046 częściowo, udział rodzajów SKIP → P4-057; typy/testy PASS
- [x] [05-32-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-32-PLAN.md) - P4-032, Testy: pozostałe mini-gry; 52/52 części, typy/testy PASS
- [x] [05-33-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-33-PLAN.md) - P4-033, wynik i rekordowa partia ze stanu; typy/testy/build/UI PASS
- [x] [05-34-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-34-PLAN.md) - P4-037, zwykłe kontrolki 48 px; typy/testy/build/UI PASS
- [x] [05-35-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-35-PLAN.md) - P4-041, katalog i opisy animacji; TDD 4c1b835
- [x] [05-36-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-36-PLAN.md) - P4-038, Tort: uchwyt cięcia pod palcem; TDD 5d05002
- [x] [05-37-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-37-PLAN.md) - P4-039, Śledzenie: rozdzielne cele dotyku; TDD 05a0dfe
- [x] [05-38-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-38-PLAN.md) - P4-040, reduced motion: zadanie działa, komunikat widoczny; TDD 4a535fb
- [x] [05-39-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-39-PLAN.md) - P4-042, przejścia, pętle i paski czasu; TDD f156052
- [x] [05-40-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-40-PLAN.md) - P4-043, błąd, ignorowany ruch i nowa decyzja; TDD 19f35d5
- [x] [05-41-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-41-PLAN.md) - P4-044, odsłona wyniku i prawdy; TDD 5a1c9ad
- [x] [05-42-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-42-PLAN.md) - P4-045, zaznaczenie, okno i błysk trafienia; TDD 0dd3706
- [x] [05-43-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-43-PLAN.md) - P4-046, koniec, para i powrót do partii; TDD 30688d5
- [x] [05-44-PLAN.md](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-44-PLAN.md) - P4-048, wspólne wyniki i tabele rund; TDD 274960c
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 (fazy 1-3 są od siebie niezależne)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audyt zasad, testów i podpięcia | 10/10 | Complete | 2026-10-23 |
| 2. Audyt wyglądu, animacji i wibracji | 11/11 | Complete | 2026-10-24 |
| 3. Audyt balansu rekordów i trudności | 9/9 | Complete | 2026-10-24 |
| 4. Raport zbiorczy i akceptacja | 5/5 | Complete; ZG4-v1, S5-v1, FIX-01 | 2026-10-26 |
| 5. Poprawki zaakceptowanych rozbieżności | 44/44 obecnie rozpisanych | In progress; 45/62 pakietów, 191/267 części; F4-046 częściowo SKIP → P4-057; P4-014/015 odebrane na Androidzie | - |

04-04 rozpoczęty 2026-10-26: przygotowano B4-001 (P4-005/006/012/013/016, warianty w DECISIONS §10). Użytkownik zatwierdził B4-001 („Zatweirdzam”): pięć pakietów i ich warianty. B4-002 (P4-003/004/036) oczekuje; liczba ukończonych planów nadal 3/5, FIX-01 otwarte.

2026-10-26, 04-04: zapisano B4-002 („Tak”), łącznie 8 pakietów zaakceptowane i 9/295 części. B4-003 (8 nowych pakietów) oczekuje. Nadal 3/5 planów fazy 4 ukończone, FIX-01 otwarte.


2026-10-26, 04-04: na prośbę „Zrób jedną końcową zgode” przygotowano [FINAL-APPROVAL.md, ZG4-v1](phases/04-raport-zbiorczy-i-akceptacja/FINAL-APPROVAL.md). Zastępuje dalsze pytania o paczki, w tym B4-003; obejmuje 54 pozostałe pakiety, 27 H, dane i odstępstwa, z kompletnymi wariantami. To propozycja, nie nowa akceptacja. Nadal 8 pakietów zatwierdzonych, 3/5 planów fazy 4, FIX-01 otwarte. Po zgodzie następne są zapis decyzji i przekazanie 04-05, bez ponownej zgody na identyczny zakres.


**Końcowy stan 2026-10-26:** użytkownik „Zatwierdzam” zaakceptował ZG4-v1 w całości. 04-04/04-05 i faza 4 zakończone; cztery kryteria z dowodami w REPORT §5. FIX-01 zakończone, FIX-02 otwarte. Wcześniejsze datowane wpisy o częściowej akceptacji są historią. Punkt wykonania: 05-01/P4-001, [S5-v1](phases/04-raport-zbiorczy-i-akceptacja/PHASE-5-SCOPE.md). Brak zmian kodu i danych.


2026-10-26, 05-01: P4-001 zakończony (5/5 części); ZASADY/DESIGN ujednolicone, typecheck i 1834 testy poprawne. Faza 5: 1/62 pakietów, FIX-02 otwarte. Następny 05-02/P4-027 przygotowany, wykonania nie rozpoczęto. Dowody: [05-01-SUMMARY](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-01-SUMMARY.md).

2026-10-26, 05-02: przygotowano testy Kalamburów, kontraktu i handlerów pokoju oraz KONCEPT/ZASADY-GIER przed kodem. Potwierdzono wcześniejszy hint klienta i brak zaufanego kontekstu. Stan RED jest celowy; kod produkcyjny bez zmian. Przed implementacją wymagany osobny commit testów na prośbę użytkownika (AGENTS, ZASADY §2, S5-v1 §3). Nadal 1/62 pakietów i 1/2 planów; [dowody TDD](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-02-TDD.md).

2026-10-26, 05-02 zakończony: na odpowiedź „Tak” zapisano commit testów 50172d5, następnie wdrożono zaufane source client/timeout i ograniczono hint. Typecheck, 1889 testów, build i /dev2/6 z odświeżeniem w obu połowach poprawne. Stan RED powyżej jest historią. Faza 5: 2/62 pakietów, 6/267 części; FIX-02 otwarte. Następny 05-03/P4-002 przygotowany. [Dowody](phases/05-poprawki-zaakceptowanych-rozbieznosci/05-02-SUMMARY.md).


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

2026-10-31, 05-21/P4-019 wykonany: Chińczyk, jeden przerywalny pokaz, pierwsze dotknięcie kończy go bez ruchu,
wibracja zbicia raz na zdarzenie. Typy/2049 testów/build PASS. 20/62 pakietów, 33/267 części; FIX-02 otwarte.
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

2026-10-31, 05-33/P4-033 zakończony: wynik i rekordowa partia ze stanu; typy/testy/build i odbiór UI PASS. 32/62 pakietów, 151/267 części. Następny P4-037; F4-046 częściowo SKIP → P4-057; P4-014/015 oczekują U02; FIX-02 otwarte. Dowody: 05-33-SUMMARY.md. Commity bez push.

2026-10-31, 05-34/P4-037 zakończony: zwykłe kontrolki 48 px; typy/testy/build i odbiór UI PASS. 33/62 pakietów, 152/267 części. Następny P4-038; F4-046 częściowo SKIP → P4-057; P4-014/015 oczekują U02; FIX-02 otwarte. Dowody: 05-34-SUMMARY.md. Commity bez push.

2026-10-31, 05-35/P4-041 zakończony: katalog 14 keyframes z rolą i czasami w ZASADY §5, komentarze index.css zgodne z użyciem, test animations.test.ts.
TDD 4c1b835. Typy/2324 testów (1 SKIP)/build PASS. 34/62 pakietów, 155/267 części; FIX-02 otwarte.
Następny P4-040 (warunek P4-042); P4-014/015 oczekują U02. Dowody: 05-35-SUMMARY.md. Commit bez push.

2026-10-31, 05-36/P4-038 zakończony: Tort łapie najbliższe cięcie do 24 px od odcinka zamiast 10°.
TDD 5d05002. Typy/testy/build PASS. 35/62 pakietów, 156/267 części; FIX-02 otwarte.
Następny P4-039; P4-014/015 oczekują U02. Dowody: 05-36-SUMMARY.md. Commit bez push.

2026-10-31, 05-37/P4-039 zakończony: Śledzenie wybiera kulki panelem 8 przycisków 48 px, numery według końcowej pozycji tylko po zatrzymaniu.
TDD 05a0dfe. Typy/testy/build PASS. 36/62 pakietów, 157/267 części; FIX-02 otwarte.
Następny P4-040; P4-014/015 oczekują U02. Dowody: 05-37-SUMMARY.md. Commit bez push.

2026-10-31, 05-38/P4-040 zakończony: przy reduced motion ruch-zadanie zostaje, float-up zamienia się w nieruchome float-still, klatka bazowa podglądu opisana.
TDD 4a535fb. Typy/testy/build PASS. 37/62 pakietów, 161/267 części; FIX-02 otwarte.
Następny P4-042; P4-014/015 oczekują U02. Dowody: 05-38-SUMMARY.md. Commit bez push.

2026-10-31, 05-39/P4-042 zakończony: ring-pulse 1,2 s, czekanie bez migania, jawne czasy przejść, paski czasu z zegara (TimeBar).
TDD f156052. Typy/testy/build PASS. 38/62 pakietów, 169/267 części; FIX-02 otwarte.
Następny P4-043; P4-014/015 oczekują U02. Dowody: 05-39-SUMMARY.md. Commit bez push.

2026-10-31, U02 na fizycznym Androidzie: użytkownik zatwierdził P4-014 (05-11 zamknięty, 3/3 części) i P4-015 (bez zmian kodu, 3/3 części). 40/62 pakietów, 173/267 części; FIX-02 otwarte. Następny P4-043. Dowody: 05-11-SUMMARY.md.

2026-10-31, 05-40/P4-043 zakończony: jedna tabela wibracji (VIBRATE), zignorowany ruch bez wibracji z shake, falstart i Sekwencja 60, szkoda od rywala raz na zdarzenie, wibracja tury przy nowej decyzji. 41/62 pakietów, 178/267 części; FIX-02 otwarte. Następny P4-044. Dowody: 05-40-SUMMARY.md. Commit bez push.

2026-10-31, 05-41/P4-044 zakończony: odsłona prawdy od razu, neutralny znacznik prawdy, ocena na błędzie, litera Kalamburów bez animacji. 42/62 pakietów, 181/267 części; FIX-02 otwarte. Następny P4-045. Dowody: 05-41-SUMMARY.md. Commit bez push.

2026-10-31, 05-42/P4-045 zakończony: zaznaczenie na czas jednym wzorem z aria-pressed, okno z dotyku od razu, błysk trafienia quizu na liczniku. 43/62 pakietów, 184/267 części; FIX-02 otwarte. Następny P4-046. Dowody: 05-42-SUMMARY.md. Commit bez push.

2026-10-31, 05-43/P4-046 zakończony: koniec Kampus Tour w kolorze zwycięzcy z title-pop tylko u niego, zastany stan bez animacji (useFresh), tile-hit w W pamięci, pełny werdykt Balonu. 44/62 pakietów, 189/267 części; FIX-02 otwarte. Następny P4-048. Dowody: 05-43-SUMMARY.md. Commit bez push.

2026-10-31, 05-44/P4-048 zakończony: ScoreTable jako drugi wspólny wzorzec wyników, RoundTable z wierszem celów w Przytrzymaj, Balonie, Policz kropki, Kącie i Który rok?; Odcień wyjątkiem. 45/62 pakietów, 191/267 części; FIX-02 otwarte. Następny P4-050. Dowody: 05-44-SUMMARY.md. Commit bez push.

# Roadmap: Kwadrans

## Overview

Audyt spójności istniejącej platformy: trzy niezależne audyty (zasady, testy i podpięcie; wygląd, animacje i wibracje; balans rekordów i trudności) porównują kod z `KONCEPT.md`, `ZASADY-GIER.md` i `ZASADY.md` §2-6 i niczego w kodzie nie zmieniają. Ich ustalenia trafiają do jednego raportu z priorytetami, który akceptuje użytkownik, a dopiero potem zaakceptowane rozbieżności są poprawiane zgodnie z procesem projektu (test i dokument przed kodem, `pnpm typecheck && pnpm test` bez błędów).

Wspólny format ustaleń (fazy 1-3): plik `FINDINGS.md` w katalogu fazy, jeden wpis na rozbieżność: gra lub ekran, `plik:linia`, źródło reguły (dokument i sekcja), waga (wysoka / średnia / niska), proponowana poprawka.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Audyt zasad, testów i podpięcia** - kod zasad, testy i podpięcie każdej gry kontra `KONCEPT.md`, `ZASADY-GIER.md` i `ZASADY.md` §2, §3, §6
- [ ] **Phase 2: Audyt wyglądu, animacji i wibracji** - ekrany gier kontra `ZASADY.md` §4 i §5
- [ ] **Phase 3: Audyt balansu rekordów i trudności** - równe szanse partii, sufit, remisy, krzywa trudności, limity tury, gry główne
- [ ] **Phase 4: Raport zbiorczy i akceptacja** - jedna lista rozbieżności z priorytetami i decyzją użytkownika
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
- [ ] 01-04-PLAN.md — gry główne turowe: Gomoku, Statki, Chińczyk, Labirynt, Memory (fala 2)
- [ ] 01-05-PLAN.md — fazy równoczesne i Turniej: Państwa-miasta, Kalambury, Turniej (fala 2)
- [ ] 01-06-PLAN.md — mini-gry na czas i reakcję (8 gier, fala 2)
- [ ] 01-07-PLAN.md — mini-gry na trafienia (9 gier, fala 2)
- [ ] 01-08-PLAN.md — mini-gry z odchyłką w rundach (9 gier, fala 2)
- [ ] 01-09-PLAN.md — mini-gry do pierwszej pomyłki (4 gry, fala 2)
- [ ] 01-10-PLAN.md — scalenie w FINDINGS.md (fala 3)

### Phase 2: Audyt wyglądu, animacji i wibracji
**Goal**: Wiadomo, które ekrany gier i platformy łamią reguły wyglądu (`ZASADY.md` §4) oraz animacji i wibracji (§5)
**Depends on**: Nothing (niezależna od fazy 1, może iść równolegle)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, ANIM-01, ANIM-02, ANIM-03
**Success Criteria** (what must be TRUE):
  1. `FINDINGS.md` wymienia z `plik:linia` każdy kolor spoza tokenów, czerwień tam, gdzie powinien być kolor gracza, i zaokrąglenia inne niż 20 / 10 px
  2. Wymienione są pola dotykowe poniżej 48 px, gry na czas bez `touch-none select-none` albo bez `onPointerDown` oraz elementy, które psują ekran 360×640 (stałe piksele, poziome przewijanie)
  3. Wymienione są teksty z em-dashem, kropką dziesiętną albo innym słowem niż „Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”, liczby bez mono i `tabular-nums`, mini-gry z niepełnym `Intro` (brak `Preview` albo punktu time / task / score) oraz braki `aria-hidden` i `aria-label`
  4. Wymienione są animacje spoza keyframes `index.css` albo z czasem niezgodnym z tabelą §5, ta sama sytuacja animowana różnie w różnych grach, animacje JS bez `reducedMotion`, animacje blokujące grę i pomiar czasu zależny od animacji
  5. Wymienione są wibracje o wzorze innym niż 40 / 60 / [60, 40, 60], gry dublujące wibrację tury z `Game.tsx` i wibracje przy poprawnym trafieniu
**Plans**: TBD
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
**Plans**: TBD

### Phase 4: Raport zbiorczy i akceptacja
**Goal**: Użytkownik ma jedną listę rozbieżności z priorytetami i zdecydował, co poprawiać
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: FIX-01
**Success Criteria** (what must be TRUE):
  1. Jeden raport zbiera ustalenia z faz 1-3 bez duplikatów (ta sama rozbieżność z dwóch audytów to jeden wpis), każdy wpis z `plik:linia`, wagą i proponowaną poprawką
  2. Wpisy są zgrupowane w pakiety poprawek z priorytetem (per gra albo per reguła), z których każdy da się zrobić i sprawdzić osobno; pakiety zmieniające zasady gry są oznaczone
  3. Każdy wpis ma decyzję użytkownika: poprawić, zostawić jako odstępstwo z powodem w `ZASADY-GIER.md` albo odrzucić
  4. Lista zaakceptowanych pakietów jest zapisana jako zakres fazy 5 (przy dużym zakresie rozbita na kolejne fazy przez `/gsd-phase`)
**Plans**: TBD

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
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 (fazy 1-3 są od siebie niezależne)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audyt zasad, testów i podpięcia | 3/10 | In progress | - |
| 2. Audyt wyglądu, animacji i wibracji | 0/TBD | Not started | - |
| 3. Audyt balansu rekordów i trudności | 0/TBD | Not started | - |
| 4. Raport zbiorczy i akceptacja | 0/TBD | Not started | - |
| 5. Poprawki zaakceptowanych rozbieżności | 0/TBD | Not started | - |

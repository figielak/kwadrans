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

- [ ] **FIX-01**: Zbiorczy raport rozbieżności z priorytetami, zaakceptowany przez użytkownika (które poprawiać)
- [ ] **FIX-02**: Zaakceptowane rozbieżności poprawione zgodnie z procesem (test i dokument przed kodem); `pnpm typecheck && pnpm test` bez błędów

Pokrycie FIX-01 w planach fazy 4 (0/5 wykonanych, plan do akceptacji):

| Plan | Dowód spełnienia wymagania po wykonaniu |
|---|---|
| 04-01 | `FINDINGS.md`: jeden rejestr, mapa źródeł, aktualność i kompletność rozbieżności |
| 04-02 | `04-02-EVIDENCE.md` i `DECISIONS.md`: pewność dowodów, warianty, konsekwencje i otwarte pomiary |
| 04-03 | `PACKAGES.md` i `REPORT.md`: priorytety, zamknięte zakresy, zależności i odbiór |
| 04-04 | decyzja użytkownika dla każdego wpisu i konkretnej wersji pakietu |
| 04-05 | `PHASE-5-SCOPE.md`: zaakceptowany zakres oraz kontrola czterech kryteriów fazy 4 |

Samo przygotowanie planów lub częściowa akceptacja nie zamykają FIX-01. FIX-02 pozostaje zakresem fazy 5.

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
| FIX-01 | Phase 4 | Planned (04-01..04-05), awaiting approval; 0/5 wykonanych |
| FIX-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-21*
*Last updated: 2026-10-25 po rozpisaniu planów 04-01..04-05 (faza 4 zaplanowana, do akceptacji)*

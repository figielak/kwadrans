# Kwadrans

## What This Is

Prywatna platforma gier multiplayer w przeglądarce (games.figielak.dev) do grania ze znajomymi: jedna strona, kod pokoju, każdy gra na swoim telefonie. Gry główne (Kampus Tour, Gomoku, Statki, Chińczyk, Memory, Kalambury, Labirynt, Państwa-miasta), 30 mini-gier, turniej i wyzwanie dnia z rekordami. Pełny opis: `KONCEPT.md`, zasady gier: `ZASADY-GIER.md`, proces i kryteria spójności: `ZASADY.md`.

Bieżący etap (milestone): **audyt spójności całej platformy**, czyli raport rozbieżności, a potem poprawki.

## Core Value

Każda gra działa i wygląda tak samo przewidywalnie: kod zgadza się z dokumentacją, a wyniki i rekordy są uczciwe i porównywalne między partiami.

## Requirements

### Validated

- ✓ Pokoje z 4-znakowym kodem, lobby, nicki, kolory, reconnect, rewanż, obserwatorzy — existing
- ✓ Serwer Colyseus jako jedyne źródło prawdy, `playerView` per gracz, `timeoutMove` po limicie — existing
- ✓ Kontrakt `GameDefinition` i rejestr `GAMES` w `packages/games` — existing
- ✓ Gry główne: Kampus Tour, Gomoku, Statki, Chińczyk, Memory, Kalambury, Labirynt, Państwa-miasta — existing
- ✓ 30 mini-gier z ekranem `Intro`, wspólnym `rankResults` i `record` — existing
- ✓ Gra solo, turniej, wyzwanie dnia — existing
- ✓ Ranking wygranych i rekordy mini-gier w SQLite, rekordowa partia lidera — existing
- ✓ PWA, ciemny motyw, deploy Docker na Raspberry Pi przez Cloudflare Tunnel — existing

### Active

- [x] Raport rozbieżności: zasady w kodzie vs `ZASADY-GIER.md` / `KONCEPT.md` oraz reguły `ZASADY.md` §3 (faza 1, `FINDINGS.md`)
- [x] Raport rozbieżności: wygląd UI wg `ZASADY.md` §4 (faza 2, `FINDINGS.md`)
- [x] Raport rozbieżności: animacje i wibracje wg `ZASADY.md` §5 (faza 2, `FINDINGS.md`)
- [x] Raport rozbieżności: podpięcie i testy wg `ZASADY.md` §2 i §6 (faza 1, `FINDINGS.md`)
- [x] Raport balansu rekordów: równe szanse partii, sufit wyniku, remisy i drugie kryterium (faza 3, `FINDINGS.md`)
- [x] Raport balansu trudności: krzywa w grze, limity czasu, gry główne (faza 3, `FINDINGS.md`)
- [ ] Raport zbiorczy z priorytetami i decyzją użytkownika, co poprawiać (faza 4)
- [ ] Poprawki zaakceptowanych rozbieżności (osobne fazy, po akceptacji raportu)

### Out of Scope

- Nowe gry (w tym Poprawka) — ten etap tylko porządkuje istniejące
- Zapis stanu pokoi w SQLite — osobny etap z planu prac
- Walidacja nierealnych wyników i czyszczenie bazy rekordów — użytkownik nie wybrał tego obszaru
- Porównanie trudności mini-gier między sobą — użytkownik nie wybrał tego obszaru
- Zmiana `id` gier — klucz rankingu w SQLite, nigdy się nie zmienia

## Context

- Monorepo pnpm, TypeScript; serwer Colyseus (Node 24) + Express + `node:sqlite`; frontend Vite + React; zasady gier jako czyste funkcje w `packages/games`, testy Vitest.
- Mapa kodu: `.planning/codebase/` (zrobiona 2026-10-21 na commicie `fb3f095`), w tym `CONCERNS.md`.
- Źródłem prawdy są `KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`, `AGENTS.md`; przy sprzeczności z mapą kodu wygrywają one.
- Szkice nowych mini-gier w `plany/` (sudoku, trzy-kubki, zakupy, za-zaslona) — gry są już zrobione, szkice mogą być nieaktualne.
- Balans ekonomii Kampus Tour do sprawdzenia w kolejnych partiach (`KONCEPT.md` §9); symulacja botów z fazy 3 i 22 pytania „sprawdzić w partii” w `phases/03-…/FINDINGS.md` §11.
- Wejście do fazy 4: trzy pliki `FINDINGS.md` w `phases/01-…`, `02-…`, `03-…` (prefiksy F1:, F2:, F3:).

## Constraints

- **Proces**: plan → akceptacja użytkownika → implementacja; zmiana zasad = najpierw test i `ZASADY-GIER.md`, potem kod — wymóg `AGENTS.md`
- **Testy**: `pnpm typecheck && pnpm test` bez błędów przed zgłoszeniem zmiany — to samo sprawdza CI
- **Zależności**: bez nowych zależności bez zgody; `apps/server` bez bezpośredniego `zod` — druga kopia `@colyseus/core`
- **Determinizm**: losowość tylko z `rng`, stan gry to zwykły JSON, `applyMove` niemutujący
- **UI**: ciemny motyw, tokeny kolorów, polskie teksty bez em-dashy, pola min. 48 px, ekran 360×640
- **Git**: praca na gałęzi (push na `master` publikuje produkcję), commity po polsku „<Gra>: co się zmieniło”, commit i push tylko na prośbę

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Najpierw raport, poprawki w osobnych fazach | Użytkownik akceptuje rozbieżności przed zmianami | ✓ Fazy 1-3 bez zmian w kodzie, akceptacja w fazie 4 |
| Kryteria spójności z `ZASADY.md` §2–6 | Istniejące, spisane reguły; bez wymyślania nowych | ✓ Fazy 1-2; w fazie 2 także `DESIGN.md`, przy sprzeczności wygrywa `ZASADY.md` |
| Balans rekordów: równe szanse, sufit, remisy | Wybór użytkownika; walidacja oszustw poza zakresem | ✓ Faza 3 (symulacja `setup` na 1000 seedów, wpisy R1-R8) |
| Balans trudności: krzywa, limity, gry główne | Wybór użytkownika; porównanie mini-gier poza zakresem | ✓ Faza 3 (limit = najdłuższa uczciwa partia + zapas ≥ 20% i ≥ 10 s) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-25 po fazie 3 (fazy 1-3 zamknięte, następna faza 4)*

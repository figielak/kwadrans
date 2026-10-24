# Phase 1: Audyt zasad, testów i podpięcia - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-22
**Phase:** 01-audyt-zasad-testow-i-podpiecia
**Areas discussed:** Dokładność testów §2, Kod czy dokument?, Wagi i układ raportu, Metoda sprawdzania

---

## Dokładność testów §2

| Pytanie | Opcje | Wybór |
|--------|-------------|----------|
| Jak sprawdzać „każda zasada ma test” | Pełne mapowanie / Tylko luki / Tylko lista ogólna | Pełne mapowanie |
| Nazwa testu jak zasada | Wystarczy, że sprawdza / Nazwa też się liczy | Wystarczy, że sprawdza |
| Słaby test | Zgłaszać jako lukę / Liczy się obecność | Zgłaszać jako lukę |
| `index.test.ts` | Zaliczają / Nie zaliczają | Zaliczają |

## Kod czy dokument?

| Pytanie | Opcje | Wybór |
|--------|-------------|----------|
| Kierunek poprawki | Agent ocenia z uzasadnieniem / Dokument zawsze wygrywa / Bez kierunku | Agent ocenia |
| KONCEPT vs ZASADY-GIER | Osobny wpis, ZASADY-GIER wyżej / Równorzędne | ZASADY-GIER wyżej |
| Zasada tylko w kodzie | Gdy gracz odczuwa / Wszystkie / Nie | Gdy gracz odczuwa |
| `plany/` i mapa kodu | Ignorować / Też porównać | Ignorować |

## Wagi i układ raportu

| Pytanie | Opcje | Wybór |
|--------|-------------|----------|
| Wagi | Wpływ na gracza / Według źródła reguły | Wpływ na gracza |
| Układ | Per gra + tabele zbiorcze / Per reguła | Per gra + tabele zbiorcze |
| Opisane odstępstwa | Krótka lista / Pomijać | Krótka lista |
| Powtórki | Jeden wpis zbiorczy / Osobno | Jeden wpis zbiorczy |

## Metoda sprawdzania

| Pytanie | Opcje | Wybór |
|--------|-------------|----------|
| Skrypty | Tak, poza repo / Tylko czytanie | Tak, poza repo |
| Kampus Tour | Pełny, osobny plan / Razem z innymi | Pełny, osobny plan |
| Poza GAMES | Turniej tak, moduły przez gry / Tylko GAMES / Wszystko z lobby | Turniej tak |
| Podział | Według typu gry / Według wymagania / Planner | Według typu gry |

## Claude's Discretion

- Podział mini-gier na paczki, forma skryptów i zapis dowodów.

## Deferred Ideas

Brak.

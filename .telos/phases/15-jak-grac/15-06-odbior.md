---
id: 15-06
title: "Odbiór techniczny kart Jak grać"
type: audit         # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-05]         # task IDs, e.g. [01-01]
decisions: [D-02, D-06]       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Sprawdzić w przeglądarce na prawdziwym serwerze, że obie drogi do zasad działają i mieszczą się na 360×640.

## Read first
- ZASADY.md §4
- ZASADY.md §6
- .telos/phases/15-jak-grac/15-CONTEXT.md

## Files

## Constraints
- Bez próby z ludźmi i bez zadania na fizycznym telefonie; faza kończy się na odbiorze technicznym.
- Wady zapisać w Result; poprawki idą osobnym zadaniem albo `/telos:revise`, nie w tym zadaniu.
- Serwery dev (:2567, :5173) zostają włączone po pracy.
- Limit 3 pokoi na IP: przy dłuższym przebiegu restart serwera dev go zeruje.

## Steps
- `Setup` na 360×640 u gospodarza i gościa: sekcja zwinięta, po rozwinięciu przewija się, a `StartBar` jest dostępny; po jednej grze z każdego rodzaju układu, w tym Kampus Tour.
- Ikona w partii dla 2 i 6 graczy z długimi nickami, w nagłówku `compact`, u obserwatora; tytuł i kropki nie wypadają poza ekran.
- Państwa-miasta i Kalambury: ikona w ich własnym nagłówku.
- Okienko: otwarcie, X, Esc, dotknięcie tła, przewijanie karty Kampus Tour; po zamknięciu fokus wraca na ikonę.
- Okienko otwarte podczas ruchu innego gracza i zmiany fazy nie zamyka się ani nie resetuje gry; ruch wykonany po zamknięciu przechodzi.
- Mini-gra i Turniej nie pokazują ikony ani sekcji.

## Acceptance
- [ ] Wszystkie kroki sprawdzone, wyniki w Result
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

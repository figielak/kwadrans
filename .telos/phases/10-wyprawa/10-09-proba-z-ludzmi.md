---
id: 10-09
title: "Próba z ludźmi: czas decyzji i obóz"
type: audit          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-08]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zagrać z ludźmi i zdecydować z użytkownikiem, czy 20 s, samotny powrót i czas w obozie działają w v1.

## Read first
- .planning/WYPRAWA-PLAN.md:126 (pytania próby)
- .planning/WYPRAWA-PLAN.md:66-69 (górna granica czasu)

## Files

## Constraints
- Tylko użytkownik może wykonać i ocenić próbę; zadanie czeka na niego, agent nie zastępuje jej symulacją.
- Rezygnacja z próby jest dopuszczalna tylko jako jawne odstępstwo użytkownika w Result; bez niej nie wolno pisać, że balans jest potwierdzony.
- Zmiana zasad po próbie to najpierw test i ZASADY-GIER.md, poza tym zadaniem.
- Czas do UI (plan §4) wpisujemy dopiero na podstawie tej próby.

## Steps
- Rozegrać co najmniej jedną partię przy 2-3 osobach i jedną przy większym składzie, jeśli jest dostępny.
- Zapisać czas partii, liczbę timeoutów decyzji i najdłuższe czekanie w obozie.
- Zapytać graczy, czy 20 s wystarcza i czy samotny powrót kusi.
- Zapisać decyzję: przyjąć v1 albo konkretne poprawki na `/telos:revise`.

## Acceptance
- [x] `pnpm run typecheck` → exit 0
- [x] Result zawiera pomiary, odpowiedzi graczy i decyzję użytkownika albo jego jawne odstępstwo.

## Result
Próby nie przeprowadzono: jawne odstępstwo użytkownika z 2026-11-07 („10-09 skip. nie robimy tego”). Brak pomiarów i odpowiedzi graczy.
Niepotwierdzone: balans, 20 s na decyzję, atrakcyjność samotnego powrotu i czas czekania w obozie. Czasu partii nie wpisano do UI (plan §4 uzależnia go od tej próby).
Deviations: none

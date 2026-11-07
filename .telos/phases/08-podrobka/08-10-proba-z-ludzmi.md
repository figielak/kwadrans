---
id: 08-10
title: "Telefon i próba balansu z ludźmi"
type: audit          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-09]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Sprawdzić klawiaturę i dotyk na fizycznym telefonie oraz zagrać z ludźmi, a potem zdecydować z użytkownikiem, czy pytania, czasy i punktacja 2/3 działają w v1.

## Read first
- .planning/PODROBKA-PLAN.md:233-240 (telefon, próba balansu)
- .planning/PODROBKA-PLAN.md:124-125 (pary zbyt podobne i zbyt różne)
- Result zadania 08-03 (lista par niepewnych)

## Files

## Constraints
- Tylko użytkownik może wykonać i ocenić próbę; zadanie czeka na niego, agent nie zastępuje jej symulacją.
- Brak telefonu albo rezygnacja z próby to jawne odstępstwo użytkownika w Result; bez niego nie wolno pisać, że odbiór telefonu albo balans są potwierdzone.
- Punktacja 2/3 jest propozycją startową, nie wynikiem pomiaru. Korekta reguł to najpierw test i ZASADY-GIER.md, poza tym zadaniem.

## Steps
- Telefon: pełna runda z otwartą klawiaturą, dotyk, czytelność pytań i pełnych odpowiedzi, reduced motion.
- Rozegrać partie 3, 4 i 6 osób, jeśli składy są dostępne.
- Zapisać długość rund, czytelność instrukcji, odsetek wykryć, liczbę anulowanych rund i pary zbyt oczywiste albo nierozróżnialne.
- Zapisać decyzję: przyjąć v1 albo konkretne poprawki na `/telos:revise`.

## Acceptance
- [ ] `pnpm run typecheck` → exit 0
- [ ] Result zawiera pomiary, odpowiedzi graczy i decyzję użytkownika albo jego jawne odstępstwo.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

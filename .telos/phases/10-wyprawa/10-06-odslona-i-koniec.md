---
id: 10-06
title: "Odsłona, historia i ekran końcowy"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-05]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/games/Wyprawa.tsx", "apps/web/src/games/Wyprawa.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dodać odsłonę po wyprawie i ekran końcowy z historią pięciu wypraw, tak by każdy widział, kto co zyskał i stracił.

## Read first
- ZASADY.md:212-215 (słownik „Dalej”, „Czekamy na”)
- DESIGN.md:131-140 (wynik po partii)
- apps/web/src/screens/ui.tsx:444-460 (ResultDetails)
- apps/web/src/screens/results.ts:49-60 (heroResult)

## Files
- apps/web/src/games/Wyprawa.tsx (modify)
- apps/web/src/games/Wyprawa.test.tsx (modify)

## Constraints
- Odsłona i koniec rysują się wyłącznie ze stanu widoku, także dla `me=""` (05-33, ta sama zasada co rekordowa partia).
- `over` jest bez limitu i bez „Dalej”; ostatnia wyprawa jest widoczna na ekranie końcowym, bo piąta nie ma fazy `summary`.
- Pokazujemy tylko faktycznie odkryty szlak.
- Remis pokazuje wspólne miejsca z `places`; bez dodatkowego tie-breaka.
- Długa historia przewija się pionowo, a ekran mieści 6 graczy w 360×640 (05-09).
- Zastany stan po przeładowaniu bez zaległych animacji.

## Tests (write first)
- Odsłona pokazuje zyski, utraconą zdobycz, kończące zagrożenie albo powrót i banki wszystkich.
- Koniec przez zagrożenie, powrót wszystkich i pustą talię ma poprawny, inny opis.
- „Dalej” wysyła `next` ze stemplem także u osoby, która wróciła wcześniej; po nim przycisk znika, a ekran pokazuje, na kogo czekamy.
- Obserwator widzi odsłonę bez „Dalej”.
- Koniec pokazuje tabelę banków i pięć zysków każdego gracza, bez „Dalej”, także dla `me=""`.
- Remis na górze daje te same miejsca i nie wskazuje zwycięzcy.
- Końcowy widok zawiera wyłącznie odkryte karty.

## Steps
- Napisać testy odsłony i końca na widokach z prawdziwych ruchów.
- Zastąpić stub `summary` odsłoną z tabelą zysków.
- Zastąpić stub `over` tabelą banków i historią wypraw.
- Dodać szczegóły szlaku każdej wyprawy z przewijaniem.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/games/Wyprawa.test.tsx src/tokens.test.ts src/states.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

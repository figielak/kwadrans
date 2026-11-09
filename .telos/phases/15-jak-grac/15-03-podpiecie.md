---
id: 15-03
title: "Jak grać w ekranie gry i nagłówku partii"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-02]         # task IDs, e.g. [01-01]
decisions: [D-02, D-06]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/Setup.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/games/PanstwaMiasta.tsx", "apps/web/src/games/Kalambury.tsx", "apps/web/src/screens/lists.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Pokazać „Jak grać” w kafelku ekranu gry i jako ikonę „?” w trakcie partii, także w grach z własnym nagłówkiem.

## Read first
- apps/web/src/screens/Setup.tsx:30-39 (kafelek gry)
- apps/web/src/screens/Game.tsx:291 (ownHeader)
- apps/web/src/screens/Game.tsx:414-442 (nagłówek, ReactionToggle)
- apps/web/src/screens/Game.tsx:595-612 (montaż z `timer`)
- apps/web/src/games/PanstwaMiasta.tsx:15-48 (własny nagłówek)
- apps/web/src/games/Kalambury.tsx:12-67 (własny nagłówek)
- apps/web/src/screens/lists.test.ts:60-92 (testy montażu przez źródło)

## Files
- apps/web/src/screens/Setup.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/games/PanstwaMiasta.tsx (modify)
- apps/web/src/games/Kalambury.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)

## Constraints
- `RulesDetails` pod `BLURBS` w `Setup`, u gospodarza i gości. `TournamentSetup` bez zmian.
- `RulesButton` w wierszu nagłówka obok `ReactionToggle`, tylko przy `view.phase === "playing"`, także dla obserwatora.
- Mini-gry dostają `null` z `RulesButton` (brak karty), więc nie potrzebują osobnego warunku.
- Gry z `ownHeader` dostają przycisk nowym propsem `help`, tak jak `timer`; bez drugiej ikony poza nagłówkiem.
- Nowy stan z serwera i zmiana fazy nie mogą zamykać okienka: `RulesButton` trzyma stabilną pozycję wśród dzieci.
- Nagłówek w trybie `compact` przy 6 kropkach ma się zmieścić na 360 px; ikona nie może wypychać tytułu poza ekran.

## Tests (write first)
- `Setup` z grą mającą kartę zawiera „Jak grać”, a kolejność w markupie to opis, potem sekcja.
- `TournamentSetup` nie zawiera „Jak grać”.
- Źródło `Game.tsx` montuje `RulesButton` z warunkiem fazy `playing`.
- Źródło `Game.tsx` przekazuje `help` do `PanstwaMiasta` i `Kalambury`.
- Ekrany obu gier z `ownHeader` renderują przekazany `help`, gdy jest `timer`.

## Steps
- Napisać testy i potwierdzić, że są czerwone.
- Podpiąć `RulesDetails` w `Setup` i `RulesButton` w nagłówku `Game`.
- Dodać `help` do obu gier z własnym nagłówkiem.
- Sprawdzić w `/dev?n=3` otwarcie, Esc, zamknięcie tłem i że okienko przeżywa nowy ruch innego gracza.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

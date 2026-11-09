---
id: 15-02
title: "Komponenty karty: treść, sekcja i okienko"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-01]         # task IDs, e.g. [01-01]
decisions: [D-02, D-03, D-06]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/HowToPlay.tsx", "apps/web/src/screens/HowToPlay.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dodać trzy małe komponenty korzystające z jednej treści: `RulesBody`, `RulesDetails` do ekranu gry i `RulesButton` z okienkiem do partii.

## Read first
- DESIGN.md §5 (zasady wyglądu)
- ZASADY.md §4 (pola 48 px, 360×640, teksty)
- apps/web/src/screens/Records.tsx:242 (wzór `<details>`)
- apps/web/src/games/KampusTour.tsx:694-709 (wygląd okienka i przycisk zamknięcia)
- apps/web/src/screens/tables.test.tsx (styl testów `renderToStaticMarkup`)

## Files
- apps/web/src/screens/HowToPlay.tsx (create)
- apps/web/src/screens/HowToPlay.test.tsx (create)

## Constraints
- `RulesBody({ card })`: nagłówki „Cel”, „Przebieg”, „Punktacja”, „Uważaj”, kolory tylko z tokenów.
- `RulesDetails({ gameId })` zwraca `null` bez karty, domyślnie zwinięte, `summary` „Jak grać” z `min-h-12`.
- `RulesButton({ gameId })` zwraca `null` bez karty; przycisk min. 48×48 px, ikona `Question` z Phosphor, `aria-label="Jak grać"`.
- Okienko to `<dialog>` z `showModal()`: Esc i pułapkę fokusu daje przeglądarka, warstwa top layer przykrywa `Moment` i reakcje. Bez nowego keyframe.
- Okienko ma tytuł z nazwą gry, zamknięcie X min. 48 px, zamknięcie dotknięciem tła, przewijanie wewnętrzne w `max-h` i jedno zdanie „Czas tury biegnie dalej”.
- Stan otwarcia lokalny w `RulesButton`; nic nie idzie do serwera.

## Tests (write first)
- `RulesBody` pokazuje cel, wszystkie punkty i cztery nagłówki.
- `RulesDetails` dla gry bez karty daje pusty markup; dla karty `<details>` bez atrybutu `open`.
- `RulesDetails` ma `summary` z klasą `min-h-12` i tekstem „Jak grać”.
- `RulesButton` dla gry bez karty daje pusty markup; dla karty przycisk `type="button"` z `aria-label="Jak grać"`.
- Zamknięty `<dialog>` nie ma atrybutu `open`.
- Markup nie zawiera em-dasha.

## Steps
- Napisać testy i potwierdzić, że są czerwone.
- Zbudować `RulesBody`, potem `RulesDetails` i `RulesButton`.
- Sprawdzić otwieranie i Esc w przeglądarce dopiero po podpięciu (15-03), bo testy `renderToStaticMarkup` nie uruchamiają `showModal()`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm --filter web exec vitest run src/screens/HowToPlay.test.tsx` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

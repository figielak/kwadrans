---
id: 07-04
title: "Etap 1: dokumenty i testy wyników (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-03]
decisions: [D-01, D-09]
scope: ["KONCEPT.md", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/screens/results.test.ts", "apps/web/src/hierarchy.test.ts", "apps/web/src/screens/tables.test.tsx"]
---
## Goal
Zapisz zachowanie ekranu wyników, solo bez limitu instrukcji i nowej kolejności ekranu głównego.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §4
- KONCEPT.md:18-21 (ekran główny)
- apps/server/src/LobbyRoom.test.ts:38-70 (harness pokoju)
- apps/web/src/hierarchy.test.ts:10-12
- apps/web/src/screens/Records.tsx:55-58 (formatRecord)
- apps/web/src/screens/ui.tsx:308-405 (RoundTable)

## Files
- KONCEPT.md (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/screens/results.test.ts (create)
- apps/web/src/hierarchy.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Lekcja 05-33: wyniki liczone wyłącznie ze stanu, `me=""` (obserwator, rekordowa partia) musi działać.

## Steps
1. KONCEPT §1: znajomi nad „Sam”, „Utwórz pokój” jako główny; solo bez licznika instrukcji; „Jeszcze raz” bez instrukcji.
2. `results.test.ts`: `heroResult` (wiersze, miejsca z remisami, różnica do osoby wyżej, gra bez `record`, gra przerwana, obserwator), `revealOrder`, `bestRound`.
3. `tables.test.tsx`: RoundTable z `best={false}` nie daje linii (Balon: `errors` to stuknięcia, nie błędy).
4. `LobbyRoom.test.ts`: jeden grający nie ma limitu instrukcji (`msLeft` null), pokój 2+ ma 15 s; rewanż solo ma `skipIntro`.
5. `hierarchy.test.ts`: jedyny wypełniony przycisk to „Utwórz pokój”, a po pełnym kodzie „Dołącz”.

## Acceptance
- [ ] Testy padają przez brak zachowania
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1

## Result

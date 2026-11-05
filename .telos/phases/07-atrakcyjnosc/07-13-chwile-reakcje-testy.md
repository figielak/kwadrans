---
id: 07-13
title: "Chwile i reakcje: dokumenty i testy (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-12]
decisions: [D-04, D-09]
scope: ["DESIGN.md", "ZASADY.md", "KONCEPT.md", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/moments.test.ts"]
---
## Goal
Zapisz wspólny komunikat `Moment` i sześć reakcji tak, żeby nie psuły pomiaru.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Chwile, Reakcje
- DESIGN.md §1
- ZASADY.md §5
- packages/games/src/kampus-tour.ts:128-146 (typy zdarzeń)
- packages/games/src/memory.ts:80-85 (widok)
- packages/games/src/chinczyk.ts:45 (captured)
- packages/games/src/statki.ts:28 (Shot)

## Files
- DESIGN.md (modify)
- ZASADY.md (modify)
- KONCEPT.md (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/moments.test.ts (create)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Lekcja 05-35: nowe keyframes (`moment-in`, `reaction-float`) trafiają do katalogu ZASADY §5 tu, a kod dostaje je w 07-14.
- Trafienie dalej nie wibruje. Nowy rekord pokazuje panel z etapu 1, bez drugiego komunikatu.

## Steps
1. DESIGN §1 (D-04), ZASADY §5, KONCEPT: reakcje i chwile.
2. `moments.test.ts`: `momentFrom(prev, next, me)`: zmiana prowadzenia, odpadnięcie, para w Memory, zatopiony statek, zbicie, komplet w Kampus Tour; odświeżenie (brak `prev`) nic nie daje; gry ciszy nic nie dają.
3. `moments.test.ts`: `canShowMoment` najwyżej raz na 3 s; `canReact` i `showReaction`: w mini-grze dopiero po oddaniu wyniku, u grającego wstrzymane do końca pomiaru.
4. `LobbyRoom.test.ts`: `react` z obserwatora działa, limit 1/s osobny od 10/s, indeks spoza 0-5 odpada, bez wysyłki `room`.

## Acceptance
- [ ] Testy padają przez brak zachowania
- [ ] `pnpm --filter web exec vitest run src/moments.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1

## Result

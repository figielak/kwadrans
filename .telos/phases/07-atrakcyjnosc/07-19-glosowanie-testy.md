---
id: 07-19
title: "Głosowanie na następną grę: dokumenty i testy (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-18]
decisions: [D-09]
scope: ["KONCEPT.md", "packages/games/src/wieczor.test.ts", "apps/server/src/LobbyRoom.test.ts"]
---
## Goal
Zapisz „Inną grę” i życzenia gości w lobby.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- apps/server/src/LobbyRoom.ts:183-198 (rewanż, toLobby)
- apps/server/src/LobbyRoom.ts:325-337 (maybeRematch)
- apps/server/src/LobbyRoom.ts:95-105 (pickGame: tryb, miejsca)

## Files
- KONCEPT.md (modify)
- packages/games/src/wieczor.test.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- „Do lobby” staje się akcją gospodarza: stary test i KONCEPT zmieniam tu.

## Steps
1. KONCEPT: głosowanie, 10 s, „Do lobby” u gospodarza, życzenia gości.
2. `wieczor.test.ts`: `voteOptions` (3 bez powtórek, pasują do liczby osób, 2 niegrane, gdy są; każdy seed poprawny), `voteWinner` (większość, remis i brak głosów przez `rng`).
3. `LobbyRoom.test.ts`: komplet głosów kończy od razu, 10 s kończy, start wspólnym startem w domyślnym trybie, głos obserwatora i spoza listy odpada, zmiana głosu działa.
4. Brzegi: rewanż w głosowaniu ignorowany, po turnieju `tournament` czyszczone, wyjście gracza z grą za małą → lobby, `toLobby` gospodarza gasi głosowanie, gość nie może.
5. Życzenia: `wish` tylko w lobby, null kasuje, start czyści.

## Acceptance
- [ ] Testy padają przez brak zachowania
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 1
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1

## Result

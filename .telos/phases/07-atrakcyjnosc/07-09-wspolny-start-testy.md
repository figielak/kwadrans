---
id: 07-09
title: "Wspólny start: dokumenty i testy (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-08]
decisions: [D-02, D-09]
scope: ["KONCEPT.md", "ZASADY-GIER.md", "apps/server/src/LobbyRoom.test.ts"]
---
## Goal
Zapisz wspólne 3-2-1: „Start” to gotowość, limit gry rusza po odliczaniu, solo bez zmian.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Wspólny start
- KONCEPT.md:160-161 (instrukcja)
- apps/server/src/LobbyRoom.test.ts:225-256 (begin i limit)
- apps/server/src/LobbyRoom.ts:170-175 (begin)
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)

## Files
- KONCEPT.md (modify)
- ZASADY-GIER.md (modify)
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- Stare testy `begin` bez odliczania poprawiam tu, razem z dokumentem. Lekcja 05-24: jeden termin mini-gry, odliczanie go nie zjada.

## Steps
1. KONCEPT §3 (reguły platformy, mini-gry i rekordy): gotowość, 3-2-1, 5 s instrukcji po rewanżu.
2. `LobbyRoom.test.ts`: komplet `begin` → `startsIn` 3000, limit dopiero po 3 s.
3. Testy: 15 s bez kompletu → odliczanie; rewanż 5 s; kolejna gra turnieju 15 s; jeden grający od razu bez odliczania.
4. Brzegi: reconnect w odliczaniu widzi resztę czasu; wyjście gracza w odliczaniu kończy partię jak dziś i gasi timer; `begin` w trakcie odliczania nic nie zmienia.

## Acceptance
- [ ] Testy padają przez brak `startsIn`
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1

## Result

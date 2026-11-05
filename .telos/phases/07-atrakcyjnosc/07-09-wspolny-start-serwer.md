---
id: 07-09
title: "Etap 2: wspólny start na serwerze"
type: code
status: approved
critical: false
effort: hard
depends: [07-08]
decisions: [D-02]
scope: ["apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "packages/games/src/lobby.ts", "KONCEPT.md", "ZASADY-GIER.md"]
---
## Goal
W pokoju z 2+ grającymi „Start” znaczy gotowość, a serwer daje wspólne 3-2-1 i dopiero po nim rusza limit gry.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Wspólny start
- apps/server/src/LobbyRoom.ts:170-180 (begin, move)
- apps/server/src/LobbyRoom.ts:328-360 (maybeRematch, startMatch, endIntro)
- apps/server/src/LobbyRoom.ts:430-436 (startTurnTimer)
- apps/server/src/LobbyRoom.ts:461-484 (viewFor)
- apps/server/src/LobbyRoom.test.ts:227-256 (begin i limit)
- KONCEPT.md §3
- ZASADY-GIER.md:59-60

## Files
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- packages/games/src/lobby.ts (modify)
- KONCEPT.md (modify)
- ZASADY-GIER.md (modify)

## Constraints
- Lekcja 05-24: jeden termin mini-gry od końca odliczania; odliczanie go nie zjada ani nie odnawia.
- Odliczanie korzysta z tego samego `turnTimer`, więc `finish` i `toLobby` gaszą je bez dodatkowego kodu.
- Stare testy `begin` bez odliczania poprawiam tu, razem z dokumentami, przed kodem.
- Jeden grający (także solo z 07-03) rusza od razu, bez odliczania.

## Tests (write first)
- każdy punkt Edge cases w `LobbyRoom.test.ts`

## Interface
- export const COUNTDOWN_SECONDS = 3; export const REMATCH_INTRO_SECONDS = 5;
- RoomView.game.countdown: boolean  // trwa 3-2-1; `msLeft` liczy czas do startu, `intro` zostaje true
- LobbyRoom.startCountdown()  // z `begin` przy komplecie i z timera instrukcji
- startMatch(def, introSeconds = INTRO_SECONDS)  // rewanż podaje REMATCH_INTRO_SECONDS

## Edge cases
- komplet `begin` → odliczanie, `msLeft` 3000, bez limitu gry
- 15 s bez kompletu → odliczanie
- po odliczaniu → `intro` false, `countdown` false, pełny limit gry
- `begin` w trakcie odliczania → bez zmian, timer nie startuje od nowa
- `move` przy `intro` lub `countdown` w pokoju 2+ → odrzucony, nikt nie gra przed sygnałem
- reconnect w odliczaniu → widok z resztą czasu
- wyjście gracza w odliczaniu → `finish` jak dziś, timer zgaszony, stary callback nic nie robi
- jeden grający → `begin` od razu bez odliczania
- rewanż → instrukcja 5 s; kolejna gra turnieju → 15 s

## Steps
1. KONCEPT §3 (reguły platformy, mini-gry i rekordy), `ZASADY-GIER.md:59-60`: gotowość, 3-2-1, 5 s po rewanżu.
2. `LobbyRoom.test.ts`: testy z Edge cases, poprawa starych, padają na brak `countdown`.
3. `lobby.ts`: stałe i pole `countdown`.
4. `LobbyRoom`: `startCountdown`, `begin`, timer instrukcji, `startMatch(def, introSeconds)`, `maybeRematch`.
5. `LobbyRoom`: wiadomość `move` odrzucana przy trwającej instrukcji.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

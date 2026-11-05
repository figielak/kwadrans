---
id: 07-19
title: "Etap 3: głosowanie „Inna gra” na serwerze"
type: code
status: draft
critical: false
effort: hard
depends: [07-17]
decisions: [D-11]
scope: ["packages/games/src/wieczor.ts", "packages/games/src/wieczor.test.ts", "packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "KONCEPT.md"]
---
## Goal
„Inna gra” zamienia koniec partii w krótkie głosowanie na 3 gry i prowadzi wprost do wspólnego startu.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §6
- apps/server/src/LobbyRoom.ts:97-107 (pickGame: tryb, miejsca)
- apps/server/src/LobbyRoom.ts:183-196 (rewanż, toLobby)
- apps/server/src/LobbyRoom.ts:224-248 (onLeave)
- apps/server/src/LobbyRoom.ts:328-338 (maybeRematch)
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)

## Files
- packages/games/src/wieczor.ts (modify)
- packages/games/src/wieczor.test.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- KONCEPT.md (modify)

## Constraints
- D-11: głosują i grają obecne `seats`; pula pasuje do ich liczby, obserwatorzy oglądają głosowanie.
- Pula bez bieżącej gry; dwie z trzech niegrane w tym pokoju (`evening.played`), gdy takie są.
- Losowanie przez `newRng()`; `voteOptions` i `voteWinner` czyste z `rng`.
- Timer przez ten sam `turnTimer`, gaszony na każdym wyjściu z głosowania. Tryb domyślny jak w `pickGame`. Start przez wspólny start, instrukcja jak nowa gra: 15 s.
- „Do lobby” tylko gospodarz: stary test i KONCEPT §3 zmieniają się tutaj, przed kodem.
- Solo i trwający turniej nie mają głosowania. Po skończonym turnieju `tournament` czyszczone przed startem.

## Tests (write first)
- `wieczor.test.ts`: `voteOptions`, `voteWinner`, także 1000 seedów
- `LobbyRoom.test.ts`: każdy punkt Edge cases o przebiegu pokoju

## Interface
- voteOptions(pool: { id; minPlayers; maxPlayers }[], players: number, current: string, played: string[], rng) → string[]
- voteWinner(options, votes: Record<PlayerId, string>, rng) → string
- export const VOTE_SECONDS = 10;
- RoomView.vote: { options: string[]; votes: Record<PlayerId, string>; msLeft: number } | null
- ROOM_MESSAGES: otherGame, vote { id }

## Edge cases
- komplet głosów → start od razu
- brak głosów po 10 s → losowo z opcji
- remis → `rng`
- zmiana głosu → liczy się ostatni
- głos obserwatora lub spoza opcji → odrzucony
- `rematch` w trakcie głosowania → ignorowany
- `otherGame` w pokoju solo lub w trwającym turnieju → nic
- po turnieju → `tournament` null przed startem
- wyjście gracza, gdy pozostali zagłosowali → rozstrzygnięcie
- wyjście i za mało osób na wybrane opcje → lobby
- `toLobby` od gospodarza → głosowanie zgaszone; od gościa → nic
- gospodarz wyszedł → nowy gospodarz, głosowanie trwa
- każdy seed → 3 różne gry pasujące do liczby osób, gdy tyle jest

## Steps
1. KONCEPT §3: głosowanie, „Do lobby” u gospodarza; poprawa starego testu.
2. Testy padają.
3. `wieczor.ts`: `voteOptions`, `voteWinner`.
4. `lobby.ts`: pola i wiadomości.
5. `LobbyRoom`: `otherGame`, `vote`, `finishVote`, wpięcie w `onLeave`, `maybeRematch`, `toLobby`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 0
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

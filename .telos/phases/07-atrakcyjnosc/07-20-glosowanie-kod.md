---
id: 07-20
title: "Głosowanie na następną grę: kod (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-19]
decisions: [D-09]
scope: ["packages/games/src/wieczor.ts", "packages/games/src/lobby.ts", "packages/games/src/index.ts", "apps/server/src/LobbyRoom.ts", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Lobby.tsx"]
---
## Goal
Po partii „Inna gra” prowadzi głosowaniem wprost do wspólnego startu, a goście mogą wskazać grę w lobby.

## Read first
- apps/server/src/LobbyRoom.ts:183-198 (rewanż, toLobby)
- apps/server/src/LobbyRoom.ts:95-105 (pickGame)
- apps/server/src/LobbyRoom.ts:325-337 (maybeRematch)
- apps/web/src/screens/Game.tsx:541-586 (OverActions)

## Files
- packages/games/src/wieczor.ts (modify)
- packages/games/src/lobby.ts (modify)
- packages/games/src/index.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-19 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Timer głosowania przez `this.clock`, jak pozostałe, gaszony na każdym wyjściu z fazy `over`.
- Losowanie przez `newRng()`; `voteOptions` i `voteWinner` czyste z `rng`.

## Tests (write first)
- `wieczor.test.ts`: voteOptions, voteWinner
- `LobbyRoom.test.ts`: przebieg, odrzucenia, brzegi, życzenia

## Interface
- voteOptions(pool: { id; minPlayers; maxPlayers }[], players: number, played: string[], rng) → string[]
- voteWinner(options, votes: Record<PlayerId,string>, rng) → string
- export const VOTE_SECONDS = 10;
- RoomView.vote: { options: string[]; votes: Record<PlayerId,string>; msLeft: number } | null
- RoomView.wishes: Record<PlayerId,string>
- ROOM_MESSAGES: otherGame, vote { id }, wish { gameId | null }

## Edge cases
- komplet głosów → start od razu
- brak głosów po 10 s → losowo z opcji
- rewanż w trakcie głosowania → ignorowany
- głos obserwatora lub spoza opcji → odrzucony
- po turnieju → `tournament` null przed startem
- wyjście gracza i za mało osób → lobby
- `toLobby` od gospodarza → głosowanie zgaszone; od gościa → nic
- gospodarz wyszedł → nowy gospodarz, głosowanie trwa

## Steps
1. `wieczor.ts`: `voteOptions`, `voteWinner`.
2. `lobby.ts`: pola i wiadomości.
3. `LobbyRoom`: `otherGame`, `vote`, `wish`, `finishVote` (tryb domyślny jak `pickGame`).
4. `OverActions`: „Rewanż”, „Inna gra”, małe „Do lobby” u gospodarza; proste karty głosowania.
5. `Lobby`: dotknięcie gry przez gościa i jego kropka przy grze.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/wieczor.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

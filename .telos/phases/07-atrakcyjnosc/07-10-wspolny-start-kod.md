---
id: 07-10
title: "Wspólny start: kod (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-09]
decisions: [D-02, D-09]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/lobby.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/index.css", "ZASADY.md"]
---
## Goal
Odliczanie na serwerze i prosty ekran 3-2-1 na kliencie; gry ruszają przez istniejącą ścieżkę „serwer zamknął instrukcję”.

## Read first
- apps/server/src/LobbyRoom.ts:170-175 (begin)
- apps/server/src/LobbyRoom.ts:340-354 (startMatch, endIntro)
- apps/server/src/LobbyRoom.ts:456-487 (viewFor)
- packages/games/src/lobby.ts:45-54 (game w RoomView)
- apps/web/src/screens/ui.tsx:423-495 (Intro)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/index.css (modify)
- ZASADY.md (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-09 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`. `ZASADY.md` tylko katalog animacji.
- Odliczanie to stan pokoju i timer zegara pokoju, nie zmiana w `packages/games` poza typem i stałą.
- Klient przy 2+ graczach nie woła `onStart` po własnym „Start”; pomiar zaczyna się dopiero po `intro: false`.

## Tests (write first)
- `LobbyRoom.test.ts`: odliczanie, limity 15 i 5 s, reconnect, wyjście, jeden grający

## Interface
- export const COUNTDOWN_SECONDS = 3; export const REMATCH_INTRO_SECONDS = 5;
- RoomView.game.startsIn: number | null  // ms do startu, liczone jak msLeft
- `intro` zostaje true do końca odliczania; `endIntro` bez zmian

## Edge cases
- komplet `begin` → odliczanie, bez limitu gry
- 15 s bez kompletu → odliczanie
- `begin` w odliczaniu → bez zmian
- reconnect w odliczaniu → `startsIn` z resztą czasu
- wyjście w odliczaniu → `finish`, timer zgaszony
- jeden grający → start od razu
- rewanż → 5 s; nowa gra turnieju → 15 s

## Steps
1. `lobby.ts`: stałe i pole `startsIn`.
2. `LobbyRoom`: `startCountdown()` z `begin` i timera instrukcji, `startMatch` z długością instrukcji.
3. `finish` i `toLobby`: zgaszenie timera odliczania.
4. `Intro`: „Start” → stan „Gotowy”, lista kto gotowy, duże 3-2-1 z `startsIn`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

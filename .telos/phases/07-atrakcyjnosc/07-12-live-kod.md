---
id: 07-12
title: "Podgląd rywali: kod (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-11]
decisions: [D-03, D-09]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/core.ts", "packages/games/src/lobby.ts", "apps/web/src/net.ts", "apps/web/src/App.tsx", "apps/web/src/live.ts", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "packages/games/src/liczenie.ts", "packages/games/src/stroop.ts", "packages/games/src/inny.ts", "packages/games/src/obrot.ts", "packages/games/src/literowka.ts", "packages/games/src/dziesiatki.ts", "packages/games/src/w-pamieci.ts", "packages/games/src/sledzenie.ts", "packages/games/src/simon.ts", "packages/games/src/kubki.ts", "packages/games/src/wieza.ts", "packages/games/src/kropki.ts", "packages/games/src/kat.ts", "packages/games/src/rok.ts", "packages/games/src/schulte.ts", "packages/games/src/sudoku.ts", "packages/games/src/balon.ts", "packages/games/src/srodek.ts", "packages/games/src/mapa.ts", "packages/games/src/tort.ts", "packages/games/src/nozyczki.ts", "packages/games/src/kolor.ts", "packages/games/src/kolo.ts", "packages/games/src/zakupy.ts", "apps/web/src/games/Quiz.tsx", "apps/web/src/games/Dziesiatki.tsx", "apps/web/src/games/WPamieci.tsx", "apps/web/src/games/Sledzenie.tsx", "apps/web/src/games/Kubki.tsx", "apps/web/src/games/Srodek.tsx", "apps/web/src/games/Mapa.tsx", "apps/web/src/games/Tort.tsx", "apps/web/src/games/Nozyczki.tsx", "apps/web/src/games/Kolor.tsx", "apps/web/src/games/Kolo.tsx", "apps/web/src/games/Zakupy.tsx"]
---
## Goal
Serwer przekazuje `live`, 16 gier go wysyła jednym hookiem, a kropki pokazują punkty, rundę albo etap rywala.

## Read first
- apps/server/src/LobbyRoom.ts:259-277 (on, celowo nie dla live)
- apps/server/src/LobbyRoom.ts:456-487 (viewFor)
- apps/web/src/net.ts:101-122 (nasłuch)
- apps/web/src/screens/Game.tsx:136-151 (progressOf)
- apps/web/src/screens/Game.tsx:307-331 (kropki)
- apps/web/src/screens/ui.tsx:100-142 (GameDots)
- apps/web/src/games/Quiz.tsx:116-150 (punkt wysyłki)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- packages/games/src/core.ts, packages/games/src/lobby.ts (modify)
- apps/web/src/net.ts, apps/web/src/App.tsx (modify)
- apps/web/src/live.ts (create)
- apps/web/src/screens/Game.tsx, apps/web/src/screens/ui.tsx (modify)
- apps/web/src/games/Quiz.tsx, apps/web/src/games/Dziesiatki.tsx, apps/web/src/games/WPamieci.tsx, apps/web/src/games/Sledzenie.tsx, apps/web/src/games/Kubki.tsx, apps/web/src/games/Srodek.tsx, apps/web/src/games/Mapa.tsx, apps/web/src/games/Tort.tsx, apps/web/src/games/Nozyczki.tsx, apps/web/src/games/Kolor.tsx, apps/web/src/games/Kolo.tsx, apps/web/src/games/Zakupy.tsx (modify)
- packages/games/src/liczenie.ts, packages/games/src/stroop.ts, packages/games/src/inny.ts, packages/games/src/obrot.ts, packages/games/src/literowka.ts, packages/games/src/dziesiatki.ts, packages/games/src/w-pamieci.ts, packages/games/src/sledzenie.ts, packages/games/src/simon.ts, packages/games/src/kubki.ts, packages/games/src/wieza.ts, packages/games/src/kropki.ts, packages/games/src/kat.ts, packages/games/src/rok.ts, packages/games/src/schulte.ts, packages/games/src/sudoku.ts, packages/games/src/balon.ts, packages/games/src/srodek.ts, packages/games/src/mapa.ts, packages/games/src/tort.ts, packages/games/src/nozyczki.ts, packages/games/src/kolor.ts, packages/games/src/kolo.ts, packages/games/src/zakupy.ts (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-11 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Nie przez `this.on`: tamto woła `update()` po każdej wiadomości, a tu pełny widok ma nie iść.
- Jeden hook z kontekstu, bez propsów przez `MiniGame`. Limit też po stronie klienta: najwyżej 2/s, najnowsza wartość wygrywa.
- Istniejący `progress` zostaje; gry z nim nie wysyłają drugiego kanału tej samej rundy.
- Rodzaj „Postęp” bez punktów, bo odsłaniałyby informacje. Gry ciszy niczego nie wysyłają.

## Tests (write first)
- `index.test.ts`: klasyfikacja 30 gier
- `LobbyRoom.test.ts`: rozsyłka, limit, odrzucenia, reconnect, czyszczenie
- `live.test.ts`: `liveDots`

## Interface
- GameDefinition.live?: { kind: "score" | "round" | "survival"; total?: number }
- ROOM_MESSAGES.live: z.object({ value: z.number().int().min(0).max(9999) })
- serwer → pozostali: "live" { id, value }; RoomView.game.live: Record<PlayerId, number>
- useLive(value: number): void  // hook gry, no-op poza pokojem
- liveDots(def, room, live) → { id, score?, place?, fraction }[]

## Edge cases
- obserwator lub poza partią wysyła `live` → ignorowane
- liczba ujemna, ułamek, tekst → odrzucone
- ponad 2/s → nadmiar przepada, ruchy działają dalej
- reconnect → wartości z `RoomView`
- rewanż → wartości wyczyszczone
- Rekordy (bez pokoju) → hook nic nie wysyła

## Steps
1. `core.ts`, `lobby.ts`, wpisy `live` w definicjach gier.
2. `LobbyRoom`: osobny `onMessage("live")`, własny limit, `broadcast` z `except`, mapa ostatnich wartości.
3. `net.ts`, `App.tsx`: nasłuch i kontekst `live`; `live.ts`: `liveDots`, `useLive`.
4. Podpięcie: `Quiz.tsx` (5 gier naraz), `Dziesiatki.tsx` i pozostałe komponenty z listy planu.
5. `Game.tsx`: kropki z `liveDots`, kto skończył ogląda pozostałych; obserwator to samo.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/index.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

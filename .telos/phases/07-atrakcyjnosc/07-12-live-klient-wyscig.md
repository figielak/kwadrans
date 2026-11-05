---
id: 07-12
title: "Etap 2: kropki na żywo i gry na punkty"
type: code
status: approved
critical: false
effort: hard
depends: [07-10, 07-11]
decisions: [D-03]
scope: ["apps/web/src/net.ts", "apps/web/src/live.ts", "apps/web/src/live.test.ts", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/games/Quiz.tsx", "apps/web/src/games/Dziesiatki.tsx"]
---
## Goal
Rywala czuć w trakcie partii: w sześciu grach na punkty kropki pokazują trafienia i miejsce na żywo, także u obserwatora i u tego, kto już skończył.

## Read first
- apps/web/src/net.ts:101-122 (nasłuch)
- apps/web/src/screens/Game.tsx:135-151 (progressOf)
- apps/web/src/screens/Game.tsx:268-331 (kropki)
- apps/web/src/screens/ui.tsx:100-142 (GameDots)
- apps/web/src/games/Quiz.tsx:116-150 (punkt wysyłki)
- apps/web/src/games/MiniGame.tsx:47-60

## Files
- apps/web/src/net.ts (modify)
- apps/web/src/live.ts (create)
- apps/web/src/live.test.ts (create)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/games/Quiz.tsx (modify)
- apps/web/src/games/Dziesiatki.tsx (modify)

## Constraints
- Wartości w małym magazynie poza stanem Reacta; czyta je tylko komponent kropek (`useSyncExternalStore`), żeby gra i pomiar nie renderowały się przy każdej wiadomości.
- Hook z kontekstu, bez propsów przez `MiniGame`; ekran „Rekordy” bez kontekstu, więc hook nic nie robi.
- Limit też po stronie klienta: najwyżej 2/s, najnowsza wartość wygrywa i dochodzi po przerwie.
- Liczba to dekoracja: miejsce na żywo nie trafia do wyników ani bohatera.
- Kolor gracza z tokenów i `PLAYER_COLORS`; własne dane w kropce jak dziś.

## Tests (write first)
- `live.test.ts`: `liveDots` dla każdego punktu Edge cases
- `live.test.ts`: logika ograniczania wysyłki na zegarze testowym, z wydzieloną funkcją `throttleLive`

## Interface
- useLive(value: number): void  // hook gry, no-op poza pokojem, przy 1 grającym i w grach bez `def.live`
- liveDots(def, room, live, progressOf) → { id, score?, place?, fraction?, done }[]
- watchLive(room, listener) w net.ts, jak `watchRoom`

## Edge cases
- brak wartości rywala → 0 i ostatnie miejsce ex aequo, bez „1.” dla wszystkich na starcie
- remis punktów → to samo miejsce
- rywal skończył (`waitingFor`) → stan „skończył” z ostatnią wartością
- reconnect → start od `game.live`
- rewanż → puste wartości, stare wiadomości nie wracają
- hook wołany wiele razy w 500 ms → jedna wysyłka i jedna z najnowszą wartością na końcu
- obserwator → te same kropki, hook nic nie wysyła

## Steps
1. `live.test.ts`: testy padają.
2. `live.ts`: magazyn, `liveDots`, `throttleLive`, kontekst i `useLive`.
3. `net.ts`: `watchLive`.
4. `Game.tsx`, `ui.tsx`: kontekst, kropki z `liveDots`, ekran „skończył” pokazuje rywali na żywo.
5. `Quiz.tsx` (5 gier naraz), `Dziesiatki.tsx`: `useLive(trafienia)`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/live.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] Odbiór w `/dev?n=2` w Liczeniu: trafienia rywala widać w trakcie, gra działa płynnie

## Result

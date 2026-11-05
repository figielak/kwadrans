---
id: 07-03
title: "Etap 0: kod pomiaru (Codex)"
type: code
status: approved
critical: false
effort: normal
depends: [07-02]
decisions: [D-09, D-11]
scope: ["apps/server/src/stats.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/metrics.ts"]
---
## Goal
Każda partia zostawia anonimowy wpis, a miary da się odczytać skryptem na Pi.

## Read first
- apps/server/src/stats.ts:16-31 (tabele)
- apps/server/src/LobbyRoom.ts:239-248 (onLeave)
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/server/src/LobbyRoom.ts:447-451 (błąd ruchu po limicie)
- apps/server/src/LobbyRoom.ts:85-92 (onCreate)

## Files
- apps/server/src/stats.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/metrics.ts (create)

## Constraints
- Wykonawca: Codex. Testy z 07-02 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Bez publicznego endpointu: miary czyta skrypt (`DB_PATH`), wypisuje JSON.
- `CREATE TABLE IF NOT EXISTS`, bez zmian istniejących tabel. `played_days` ma tylko `nick_key` i `day`, bez pokoju i gry (D-11).

## Tests (write first)
- wszystkie testy `recordRoomGame` i `metrics` z 07-02 w `stats.test.ts`
- testy zapisu partii z 07-02 w `LobbyRoom.test.ts`

## Steps
1. `stats.ts`: tabele `room_games` i `played_days`, `recordRoomGame`, `metrics`. Dzień dopisuje tylko `completed` przy `players >= 2`, doba lokalna serwera (`TZ`).
2. `LobbyRoom.onCreate`: losowy klucz z `node:crypto`.
3. `LobbyRoom.startMatch`: zapamiętaj liczbę miejsc w `match`, bo `onLeave` zmienia `seats` przed `finish`.
4. `LobbyRoom.finish(result, outcome = "completed")`: `onLeave` podaje `walkover` przy zwycięzcy, inaczej `aborted`, błąd ruchu po limicie `aborted`. Jeden wpis na partię, tylko gdy `match.result` było puste, zanim rozejdą się ścieżki turnieju.
5. `metrics.ts`: odczyt przez `openStats`, argument to liczba dni (domyślnie 7), wydruk JSON.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/stats.test.ts` → exit 0
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0

## Result

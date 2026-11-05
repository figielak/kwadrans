---
id: 07-03
title: "Etap 0: kod pomiaru (Codex)"
type: code
status: approved
critical: false
effort: normal
depends: [07-02]
decisions: [D-09]
scope: ["apps/server/src/stats.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/metrics.ts"]
---
## Goal
Każda partia zostawia anonimowy wpis, a miary da się odczytać skryptem na Pi.

## Read first
- apps/server/src/stats.ts:16-31 (tabele)
- apps/server/src/LobbyRoom.ts:382-429 (finish)
- apps/server/src/LobbyRoom.ts:85-92 (onCreate)

## Files
- apps/server/src/stats.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/metrics.ts (create)

## Constraints
- Wykonawca: Codex. Testy z 07-02 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`.
- Bez publicznego endpointu: miary czyta skrypt (`DB_PATH`), wypisuje JSON.
- `CREATE TABLE IF NOT EXISTS`, bez zmian istniejących tabel.

## Tests (write first)
- wszystkie testy `recordRoomGame` i `metrics` z 07-02 w `stats.test.ts`

## Steps
1. `stats.ts`: tabela `room_games`, `recordRoomGame`, `metrics`.
2. `LobbyRoom.onCreate`: losowy klucz z `node:crypto`.
3. `LobbyRoom.finish`: jeden wpis na partię, zanim rozejdą się ścieżki turnieju.
4. `metrics.ts`: odczyt przez `openStats` i wydruk JSON.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/stats.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0

## Result

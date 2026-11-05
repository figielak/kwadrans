---
id: 07-11
title: "Podgląd rywali: dokumenty i testy (Claude)"
type: doc
status: approved
critical: false
effort: normal
depends: [07-10]
decisions: [D-03, D-09]
scope: ["KONCEPT.md", "AGENTS.md", "apps/server/src/LobbyRoom.test.ts", "packages/games/src/index.test.ts", "apps/web/src/live.test.ts"]
---
## Goal
Zapisz `live`: osobny kanał dekoracji, klasyfikacja 30 gier i miejsce na żywo.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Podgląd rywali
- packages/games/src/core.ts:40-45 (record w kontrakcie)
- packages/games/src/index.test.ts:145-182 (RECORDS)
- apps/server/src/LobbyRoom.ts:259-277 (on)
- apps/web/src/screens/Game.tsx:136-151 (progressOf)

## Files
- KONCEPT.md (modify)
- AGENTS.md (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- packages/games/src/index.test.ts (modify)
- apps/web/src/live.test.ts (create)

## Constraints
- Wykonawca: Claude. Dokumenty i testy przed kodem, bez implementacji; testy mają padać przez brak zachowania.
- D-03 wpisz jawnie obok „Serwer jest jedynym źródłem prawdy”: `live` nie trafia do `validateMove` ani do wyników.

## Steps
1. KONCEPT i AGENTS: wyjątek i tabela rodzajów z planu §5.
2. `index.test.ts`: `live` każdej mini-gry zgadza się z tabelą, 6 gier ciszy nie ma `live`, rodzaj `round` ma `total`.
3. `LobbyRoom.test.ts`: `live` idzie tylko do pozostałych, bez wysyłki `room`; limit 2/s osobny od 10/s; obserwator i poza partią odrzuceni; śmieci odrzucone; wynik partii bez zmian; widok po reconnect ma ostatnie wartości; nowa partia je czyści.
4. `live.test.ts`: `liveDots` (miejsce na żywo, pierścień, „skończył” z `waitingFor`).

## Acceptance
- [ ] Testy padają przez brak `live`
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/index.test.ts` → exit 1

## Result

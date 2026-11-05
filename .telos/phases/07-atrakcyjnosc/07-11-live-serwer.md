---
id: 07-11
title: "Etap 2: kanał live i klasyfikacja 30 mini-gier"
type: code
status: approved
critical: false
effort: hard
depends: [07-09]
decisions: [D-03]
scope: ["packages/games/src/liczenie.ts", "packages/games/src/stroop.ts", "packages/games/src/inny.ts", "packages/games/src/obrot.ts", "packages/games/src/literowka.ts", "packages/games/src/dziesiatki.ts", "packages/games/src/w-pamieci.ts", "packages/games/src/sledzenie.ts", "packages/games/src/simon.ts", "packages/games/src/kubki.ts", "packages/games/src/wieza.ts", "packages/games/src/kropki.ts", "packages/games/src/kat.ts", "packages/games/src/rok.ts", "packages/games/src/schulte.ts", "packages/games/src/sudoku.ts", "packages/games/src/balon.ts", "packages/games/src/srodek.ts", "packages/games/src/mapa.ts", "packages/games/src/tort.ts", "packages/games/src/nozyczki.ts", "packages/games/src/kolor.ts", "packages/games/src/kolo.ts", "packages/games/src/zakupy.ts", "packages/games/src/core.ts", "packages/games/src/lobby.ts", "packages/games/src/index.test.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "KONCEPT.md", "AGENTS.md"]
---
## Goal
Serwer przekazuje rywalom lekką liczbę na żywo osobnym kanałem, a każda mini-gra deklaruje, co można o niej pokazywać.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Podgląd rywali
- packages/games/src/core.ts:40-45 (record w kontrakcie)
- packages/games/src/index.test.ts:145-182 (RECORDS)
- apps/server/src/LobbyRoom.ts:260-290 (on, withinRateLimit)
- apps/server/src/LobbyRoom.ts:456-484 (update, viewFor)
- apps/server/src/LobbyRoom.test.ts:38-75 (harness)

## Files
- packages/games/src/liczenie.ts (modify)
- packages/games/src/stroop.ts (modify)
- packages/games/src/inny.ts (modify)
- packages/games/src/obrot.ts (modify)
- packages/games/src/literowka.ts (modify)
- packages/games/src/dziesiatki.ts (modify)
- packages/games/src/w-pamieci.ts (modify)
- packages/games/src/sledzenie.ts (modify)
- packages/games/src/simon.ts (modify)
- packages/games/src/kubki.ts (modify)
- packages/games/src/wieza.ts (modify)
- packages/games/src/kropki.ts (modify)
- packages/games/src/kat.ts (modify)
- packages/games/src/rok.ts (modify)
- packages/games/src/schulte.ts (modify)
- packages/games/src/sudoku.ts (modify)
- packages/games/src/balon.ts (modify)
- packages/games/src/srodek.ts (modify)
- packages/games/src/mapa.ts (modify)
- packages/games/src/tort.ts (modify)
- packages/games/src/nozyczki.ts (modify)
- packages/games/src/kolor.ts (modify)
- packages/games/src/kolo.ts (modify)
- packages/games/src/zakupy.ts (modify)
- packages/games/src/core.ts (modify)
- packages/games/src/lobby.ts (modify)
- packages/games/src/index.test.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- KONCEPT.md (modify)
- AGENTS.md (modify)

## Constraints
- D-03 wpisz jawnie obok „Serwer jest jedynym źródłem prawdy” w AGENTS i KONCEPT: `live` nie trafia do `validateMove` ani wyników.
- Nie przez `this.on`, bo tamto woła `update()`. Wysyłka pętlą po `this.clients` jak w `update`, żeby harness mógł ją sprawdzić.
- Własny limit 2/s, osobny od 10/s; nadmiar przepada, ruchy działają dalej. Lekcja [tests]: 10 wiadomości/s.
- Bez nowej zależności `zod` w serwerze: schemat w `lobby.ts` (lekcja [apps/server/]).
- Rodzaje: `score`: Liczenie, Kolor liter, Inny element, Obrót, Literówka, Dziesiątki. `survival`: Sekwencja, W pamięci, Śledzenie, Trzy kubki, Wieża. `round`: pozostałe 13. Cisza (Refleks, Stój!, Stoper, Przytrzymaj, Za zasłoną, Rytm) bez pola.
- Istniejący `progress` zostaje; gry z nim mają pole `live`, ale nie wysyłają drugiego kanału tej samej rundy.
- Wpis `live` w definicji nie zmienia zasad, losowania ani rekordów (lekcja o stałych mini-gier nie dotyczy).

## Tests (write first)
- `index.test.ts`: `live` każdej mini-gry zgadza się z tabelą, 6 gier ciszy nie ma pola, `round` ma `total`, 30 gier sklasyfikowanych
- `LobbyRoom.test.ts`: każdy punkt Edge cases

## Interface
- GameDefinition.live?: { kind: "score" | "round" | "survival"; total?: number }
- ROOM_MESSAGES.live: z.object({ value: z.number().int().min(0).max(9999) })
- serwer → pozostali: "live" { id, value }
- RoomView.game.live: Record<PlayerId, number>  // ostatnie wartości, dla reconnectu

## Edge cases
- obserwator, poza partią, w instrukcji lub przy 1 grającym wysyła `live` → ignorowane
- liczba ujemna, ułamek, tekst → odrzucone
- ponad 2/s → nadmiar przepada, kolejny `move` w tej sekundzie działa
- nadawca nie dostaje własnej wiadomości; brak wysyłki `room`
- wynik partii i rekord bez zmian po dowolnym `live`
- reconnect → wartości w `RoomView`
- rewanż → wartości wyczyszczone

## Steps
1. KONCEPT, AGENTS: wyjątek i tabela rodzajów.
2. `index.test.ts`, `LobbyRoom.test.ts`: testy padają.
3. `core.ts`, `lobby.ts`: typ, schemat.
4. Definicje 24 gier: pole `live`.
5. `LobbyRoom`: `onMessage("live")`, własny limit, mapa wartości czyszczona w `startMatch`, pole w `viewFor`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/index.test.ts` → exit 0
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

---
id: 07-03
title: "Etap 1: solo bez limitu instrukcji, „Jeszcze raz” od razu"
type: code
status: done
critical: false
effort: hard
depends: [07-01]
decisions: [D-08]
scope: ["apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "packages/games/src/lobby.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/intro.ts", "apps/web/src/screens/intro.test.ts", "KONCEPT.md", "ZASADY-GIER.md"]
---
## Goal
Gracz sam nie ma licznika na ekranie instrukcji, a „Jeszcze raz” w grze solo rusza od razu, bez instrukcji.

## Read first
- apps/server/src/LobbyRoom.ts:170-174 (begin)
- apps/server/src/LobbyRoom.ts:328-338 (maybeRematch)
- apps/server/src/LobbyRoom.ts:340-360 (startMatch, endIntro)
- apps/server/src/LobbyRoom.ts:487-491 (touch)
- apps/web/src/screens/ui.tsx:423-450 (Intro)
- KONCEPT.md §1
- KONCEPT.md §3
- ZASADY-GIER.md:59-60 (start po instrukcji)
- apps/server/src/LobbyRoom.test.ts:227-256 (begin i limit)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/intro.ts (create)
- apps/web/src/screens/intro.test.ts (create)
- KONCEPT.md (modify)
- ZASADY-GIER.md (modify)

## Constraints
- 15 s instrukcji dotyczy tylko 2+ grających; poprawa w KONCEPT §1, §3 (obie linie) i `ZASADY-GIER.md:59-60`, przed kodem.
- Lekcja 05-24: limit mini-gry to jeden termin od końca instrukcji, nic go nie odnawia.
- Bez automatycznego startu kolejnej gry solo: „Jeszcze raz” to zawsze wybór gracza (plan §11).

## Tests (write first)
- każdy punkt Edge cases po stronie serwera w `LobbyRoom.test.ts`
- `intro.test.ts`: `autoStart` dla czterech kombinacji, w tym odświeżenie po `begin`

## Interface
- RoomView.game.skipIntro: boolean  // tylko pokój `solo` po „Jeszcze raz”, póki trwa `intro`; po `begin` false
- autoStart({ skipIntro, intro }) → boolean  // w intro.ts; true tylko przy obu; Intro woła wtedy start() raz
- msLeft: null, gdy jeden grający czeka na instrukcji

## Edge cases
- jeden grający na instrukcji → `msLeft` null, brak timera
- pokój 2+ → `msLeft` 15 s
- rewanż solo → `skipIntro` true, po `begin` false
- pierwsza partia solo, rewanż 2+, kolejna gra turnieju jednoosobowego → `skipIntro` false
- solo bez `begin` przez 59:59 → pokój żyje; po godzinie `disconnect`
- wyjście i nieudany reconnect w instrukcji → koniec bez wyniku, `onDispose` zwalnia limit pokoi solo na IP
- po `begin` → `msLeft` to pełny limit gry
- rewanż solo → stary limit nie kończy partii po czasie gry
- odświeżenie rewanżu przed `begin` → gra rusza raz; po `begin` nic nie rusza samo, tyka zwykły limit
- StrictMode → `begin` wysłany raz (`started` w Intro)

## Steps
1. KONCEPT.md, ZASADY-GIER.md: reguła startu.
2. `LobbyRoom.test.ts`, `intro.test.ts`: testy z Edge cases, padają.
3. `LobbyRoom.startMatch`: przy `seats.length === 1` bez timera, ale zawsze `turnTimer?.clear()` i `turnEndsAt = null`.
4. `LobbyRoom`: `skipIntro` przy rewanżu w pokoju `solo`, wygaszany w `endIntro`; pole w `viewFor` i `lobby.ts`.
5. `intro.ts`, `Intro` w `ui.tsx`: auto-start przez `autoStart`, ten sam `started`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/screens/intro.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] Odbiór w `/dev?n=1`: brak napisu „Start automatycznie”, „Jeszcze raz” od razu w grze

## Result
RED: `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 1: 9 nowych testów wykrywa timer instrukcji jednej osoby i brak `skipIntro`; 46 testów przechodzi.
Instrukcja jednej osoby bez timera; rewanż solo przekazuje `skipIntro` do `begin`; pozostałe rewanże i turniej zachowują instrukcję. Dokumenty i testy zapisane przed kodem w c3d3fbd; test klienta był czerwony z powodu brakującego `intro.ts`.
GREEN: 55 testów LobbyRoom i 5 testów intro; pełne `pnpm typecheck`, `pnpm test`, `pnpm --filter web build` → exit 0; `telos accept 07-03` PASS, oba MANUAL potwierdzone.
Przeglądarka `/dev?n=1`, ramka 360×640: bez odliczania, rewanż od razu w grze, StrictMode wysyła begin raz; odświeżenie przed begin startuje raz, po begin nic nie startuje samo; bez przewijania, Start 48 px. Serwery dev pozostawione uruchomione z bazą /tmp/kwadrans-07-03.db.
Deviations: ZASADY.md — dopasowanie nadrzędnej reguły instrukcji mini-gry do zatwierdzonej zmiany, aby nie pozostawić sprzeczności z KONCEPT.md i ZASADY-GIER.md.

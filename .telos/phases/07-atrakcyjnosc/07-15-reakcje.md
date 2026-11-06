---
id: 07-15
title: "Etap 2: sześć reakcji pod kropkami"
type: code
status: done
critical: false
effort: normal
depends: [07-14]
decisions: [D-04]
scope: ["packages/games/src/lobby.ts", "apps/server/src/LobbyRoom.ts", "apps/server/src/LobbyRoom.test.ts", "apps/web/src/net.ts", "apps/web/src/moments.ts", "apps/web/src/moments.test.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/index.css", "KONCEPT.md", "ZASADY.md"]
---
## Goal
Sześć emotek pod kropkami daje szybką wymianę emocji bez czatu i dźwięku, a w grach na czas nie psuje pomiaru.

## Read first
- .planning/ATRAKCYJNOSC-PLAN.md §5 Reakcje
- apps/server/src/LobbyRoom.ts:260-290 (on, limit)
- apps/web/src/net.ts:101-122
- apps/web/src/screens/ui.tsx:55-142 (kropki)
- ZASADY.md §4

## Files
- packages/games/src/lobby.ts (modify)
- apps/server/src/LobbyRoom.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)
- apps/web/src/net.ts (modify)
- apps/web/src/moments.ts (modify)
- apps/web/src/moments.test.ts (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/index.css (modify)
- KONCEPT.md (modify)
- ZASADY.md (modify)

## Constraints
- Kanał jak `live`: bez `this.on`, bez `update()`, własny limit 1/s osobny od 10/s, żeby emotki nie zjadały ruchów.
- Mini-gra w toku: pasek dopiero po oddaniu wyniku, a u grającego reakcje czekają do końca jego pomiaru. Obserwator może reagować.
- Lekcja 05-35: `reaction-float` w katalogu ZASADY §5. `prefers-reduced-motion` bez unoszenia.
- Sześć pól min. 48 px mieści się w 360 px. Gdy ekran partii nie ma miejsca, pasek chowa się za jednym przyciskiem; sprawdzić na 360×640.
- Kampus Tour: układ poziomy jest zajęty, więc pasek tylko na ekranie końcowym; reakcje innych widać zawsze.
- Emotki systemowe, bez nowych zależności i bez tekstu.

## Tests (write first)
- `LobbyRoom.test.ts`: `react` z obserwatora działa, limit 1/s nie blokuje `move`, indeks spoza 0-5 odpada, bez wysyłki `room`, nadawca też dostaje reakcję
- `moments.test.ts`: `canReact` dla gry turowej, po wyniku w mini-grze, w trakcie pomiaru, obserwatora
- `moments.test.ts`: `showReaction` wstrzymuje u grającego do końca pomiaru i puszcza potem
- `animations.test.ts`: `reaction-float` zgodny z katalogiem

## Steps
- KONCEPT (rate limit i reakcje), ZASADY §5; testy.
- `lobby.ts`: `REACTIONS`, schemat; `LobbyRoom`: `onMessage("react")`.
- `moments.ts`: `canReact`, `showReaction`; `net.ts`: nasłuch.
- `ui.tsx`, `Game.tsx`, `index.css`: pasek i unoszenie nad kropką nadawcy.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/moments.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0

## Result
Sześć emotek (`REACTIONS`), wiadomość `react` z limitem 1/s poza limitem 10/s, bez `update()`; nadawca też dostaje. `canReact` i `createReactionStore` w `moments.ts`: grający w mini-grze ma pasek po oddaniu wyniku, a cudze reakcje wychodzą po końcu jego pomiaru, po jednej od osoby.
W trakcie partii pasek jest za jednym przyciskiem (popover nie przesuwa planszy), po partii stoi nad akcjami. Reakcja bez kropki nadawcy (obserwator, Kampus, własne nagłówki, odsłona) idzie do nakładki `ReactionOverlay`. 40 testów w `moments.test.ts`, 106 w `LobbyRoom.test.ts`, `pnpm test` zielony.
Odbiór na 360×640 w `/dev?n=2`: Memory (przycisk, pola 48 px, bez przesunięcia, emotka nad kropką u obu), Liczenie (bez przycisku w instrukcji i pomiarze, pełny pasek po partii). Na ekranie nie widziałem Kampusu, nakładki i wstrzymania w trakcie pomiaru; to tylko testy. Pasek w Kampusie (góra układu poziomego) może zasłaniać górę podsumowania.
Państwa-miasta i Kalambury mają własny nagłówek, więc w trakcie partii nie mają przycisku, tylko pasek po końcu; reakcje innych widać w nakładce. Asercje `reaction-float` są w `moments.test.ts`, bo `animations.test.ts` jest poza scope, a jego ogólny test obejmuje nową nazwę.
Deviations: none

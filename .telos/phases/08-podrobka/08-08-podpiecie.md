---
id: 08-08
title: "Podpięcie w Lobby, Game i wibracji"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-05, 08-07]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/Game.tsx", "apps/web/src/screens/Lobby.tsx", "apps/web/src/vibrate.ts", "apps/web/src/vibrate.test.ts", "apps/web/src/screens/tables.test.tsx", "apps/web/src/screens/lists.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Udostępnić Podróbkę w pokoju: kafel w lobby, montaż z `nonce`, status równoczesny i jedna wibracja na każdą nową decyzję.

## Read first
- apps/web/src/vibrate.ts:20-32 (decisionKey)
- apps/web/src/vibrate.test.ts:108-114 (testy klucza faz)
- apps/web/src/screens/Game.tsx:101-110 (focus, kolor czekającego)
- apps/web/src/screens/Game.tsx:553-637 (montaż gier w ResultDetails)
- apps/web/src/screens/Game.tsx:669-678 (SIMULTANEOUS, isSimultaneous)
- apps/web/src/screens/Lobby.tsx:376-386 (ICONS)
- apps/web/src/screens/Lobby.tsx:424-433 (BLURBS)
- apps/web/src/screens/lists.test.ts:67-92 (testy kafla i montażu Wyprawy)
- apps/web/src/screens/tables.test.tsx:340-350 (testy równoczesności)

## Files
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/vibrate.ts (modify)
- apps/web/src/vibrate.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)

## Constraints
- `OWN_RANKING` nie wraca: tabela końcowa stoi w `ResultDetails` (plan §7 pkt 5 jest tu nieaktualny, test go zabrania).
- Gra równoczesna we wszystkich fazach: dopisana do zbioru `SIMULTANEOUS` i do gałęzi `focus` jak Państwa-miasta, kolor to własny kolor czekającego.
- `decisionKey`: `nonce:runda:faza`. Bez `useHarm`: wykrycie i nietrafiony głos nie wibrują.
- Ikona z istniejących Phosphor, bez nowych zależności. Opis bez em-dashy i nazw istniejących gier; nie zdradza kierunku pary ani roli poza zasadą gry.
- Setup, statystyki i transport bez zmian; brak nowych endpointów, schematu bazy i zależności serwera.
- CHANGELOG nie należy do tej fazy: wpis dopiero przed publikacją na `master` (AGENTS.md).

## Tests (write first)
- Kolejne fazy i rundy tej samej osoby mają różne klucze; nowy `nonce` daje nowy klucz.
- Zatwierdzenie innego gracza nie zmienia mojego klucza; szkic też nie.
- Klucz jest `null` po moim zatwierdzeniu, dla obserwatora i w `over`.
- `Podrobka.tsx` nie woła `navigator.vibrate` ani `useHarm`.
- `isSimultaneous("podrobka", ...)` jest prawdą w `write`, `vote` i `summary`.
- Lobby pokazuje „Podróbka” i „3-6 os.”, `ICONS.podrobka` istnieje, opis bez em-dashy, poza `MINI_GAME_IDS`, bez `record`.
- `Game.tsx` montuje `<Podrobka` z `key` z `nonce`, `places` i wewnątrz `ResultDetails`.
- Kolor poświaty to własny kolor czekającego.

## Steps
- Dopisać testy przed zmianą kodu.
- vibrate.ts: gałąź `podrobka` w `decisionKey`.
- Game.tsx: `SIMULTANEOUS`, `focus`, import i montaż `Podrobka`.
- Lobby.tsx: `ICONS` i `BLURBS`.
- Sprawdzić w `/dev?n=3`, że gra startuje z lobby i przechodzi przez pierwszą rundę.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

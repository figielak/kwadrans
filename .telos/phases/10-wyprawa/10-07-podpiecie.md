---
id: 10-07
title: "Podpięcie w Lobby, Game i wibracji"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-04, 10-06]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/Game.tsx", "apps/web/src/screens/Lobby.tsx", "apps/web/src/vibrate.ts", "apps/web/src/vibrate.test.ts", "apps/web/src/screens/tables.test.tsx", "apps/web/src/screens/lists.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Udostępnić Wyprawę w pokoju: kafel w lobby, montaż z `nonce`, status równoczesny i jedna wibracja na każdą nową decyzję.

## Read first
- apps/web/src/vibrate.ts:20-30 (decisionKey)
- apps/web/src/vibrate.test.ts:108-114 (testy klucza faz)
- apps/web/src/screens/Game.tsx:79-82 (wibracja tury)
- apps/web/src/screens/Game.tsx:101-110 (focus, kolor czekającego)
- apps/web/src/screens/Game.tsx:613-624 (montaż gry w ResultDetails)
- apps/web/src/screens/Game.tsx:656-662 (SIMULTANEOUS, isSimultaneous)
- apps/web/src/screens/Lobby.tsx:376-384 (ICONS)
- apps/web/src/screens/Lobby.tsx:421-431 (BLURBS)
- apps/web/src/screens/lists.test.ts:36-44 (test kafla gry)
- apps/web/src/screens/tables.test.tsx:329-335 (test równoczesności)

## Files
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/vibrate.ts (modify)
- apps/web/src/vibrate.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)

## Constraints
- `OWN_RANKING` nie wraca: ekran końcowy gry stoi w `ResultDetails` (test go zabrania, plan §6 jest tu nieaktualny).
- Kolor w `focus` to własny kolor czekającego, także gdy na szlaku został jeden gracz; `turnOf` nie może wtedy pisać „Ruch:”.
- `decisionKey` Wyprawy: `nonce:wyprawa:odkrycie:faza`; `useHarm` nie jest potrzebne, bo zagrożenie nie pochodzi od rywala.
- Odsłona to nowa decyzja („Dalej”), więc `Game.tsx` daje przy niej zwykłe `VIBRATE.turn`; zagrożenie nie dodaje `mistake` ani `harm`.
- CHANGELOG nie należy do tej fazy: wpis dopiero przed publikacją na `master` (AGENTS.md).

## Tests (write first)
- Kolejne decyzje tej samej osoby przy tym samym `waitingFor` mają różne klucze.
- Zatwierdzenie innego gracza nie zmienia mojego klucza.
- Klucz jest `null` w obozie, po moim zatwierdzeniu i dla obserwatora.
- Odsłona, nowa wyprawa i nowy `nonce` dają nowe klucze.
- Po moim „Dalej” i w `over` klucz jest `null`, więc koniec partii nie wibruje.
- `Wyprawa.tsx` nie woła `navigator.vibrate` ani `useHarm`.
- `isSimultaneous("wyprawa", ...)` jest prawdą w `decision` i `summary`.
- Lobby pokazuje „Wyprawa” i „2-6 os.”, `ICONS.wyprawa` istnieje, opis bez em-dashy, poza `MINI_GAME_IDS`, bez `record`.
- `Game.tsx` montuje `<Wyprawa` z `key` z `nonce`, `places` i wewnątrz `ResultDetails`.

## Steps
- Dopisać testy przed zmianą kodu.
- vibrate.ts: gałąź `wyprawa` w `decisionKey`.
- Game.tsx: `SIMULTANEOUS`, `focus`, import i montaż `Wyprawa`.
- Lobby.tsx: `ICONS` i `BLURBS` bez nazw istniejących gier.
- Sprawdzić w `/dev?n=2`, że gra startuje z lobby i przechodzi przez pierwszą decyzję.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0

## Result
Podpięte: `decisionKey` Wyprawy w vibrate.ts (nonce:wyprawa:odkrycie:faza, null w obozie, po zatwierdzeniu, dla widza i w over), `isSimultaneous` dla decision i summary, `focus` w kolorze czekającego także przy jednym graczu na szlaku (bez „Ruch:”), montaż `<Wyprawa key={nonce}>` w `ResultDetails` z `places`, kafel w Lobby (ikona Mountains, opis, 2-6 os.). Bez `OWN_RANKING`, `useHarm` i CHANGELOG.
Nowe testy: 7 w vibrate.test.ts, po 1-3 w tables.test.tsx i lists.test.ts. Całość: games 2603, server 200, web 485, typecheck i build czyste.
Sprawdzone w `/dev?n=2`: kafel w lobby, ekran gry, start, pierwsza decyzja obu graczy, rozstrzygnięcie i obóz, status „Czekamy na: …”. Uwaga do 10-08: „Szlak: 1 odkrytych kart” (odmiana liczebnika w Wyprawa.tsx, poza scope tego zadania).
Niestabilny test serwera z losowym głosowaniem oblał raz pierwsze `telos accept`, powtórzenia 3×200/200; nie ten blok.
Deviations: none

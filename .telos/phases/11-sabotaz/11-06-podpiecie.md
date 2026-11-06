---
id: 11-06
title: "Sabotaż: lobby i wspólny ekran gry"
type: code
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard
depends: ["11-05"]
decisions: ["D-01"]
scope: ["apps/web/src/screens/Game.tsx","apps/web/src/screens/Lobby.tsx","apps/web/src/screens/lists.test.ts","apps/web/src/screens/tables.test.tsx","apps/web/src/games/Sabotaz.test.tsx"]
---
## Goal
Udostępnić Sabotaż w lobby oraz wspólnym ekranie gry z fazowymi statusami i istniejącym podsumowaniem wyników.

## Read first
- apps/web/src/screens/Game.tsx:288-325 (status fazy i timer)
- apps/web/src/screens/Game.tsx:550-642 (render, ResultDetails, SIMULTANEOUS)
- apps/web/src/screens/Lobby.tsx:373-382 (ICONS)
- apps/web/src/screens/Lobby.tsx:419-428 (BLURBS)
- apps/web/src/screens/lists.test.ts:35-42 (brak OWN_RANKING)
- ZASADY.md §6. Podpięcie i odbiór

## Files
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/lists.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- apps/web/src/games/Sabotaz.test.tsx (modify)

## Constraints
- D-01: initial/summary równoczesne, place/bid/reveal turowe, 3–6 osób; bez bezwarunkowego dodania do SIMULTANEOUS.
- Zastąpić odwołanie szkicu do OWN_RANKING obecnym ResultHero/ResultDetails, zgodnie z ZASADY §4 i testami lists/tables; nie przywracać starej listy.
- key komponentu z nonce; publiczny View musi wystarczyć dla def.turn(view).seconds w nagłówku.
- Ikona Phosphor regular z istniejącej paczki, opis po polsku, bez gwarancji kwadransa i bez kopiowania oprawy Skull.
- Brak zmian mini-gier, rekordów, zasad turnieju i protokołu serwera; słowa UI zgodne z ZASADY-GIER (.telos/LESSONS.md, docs/05-01).

## Tests (write first)
- Lobby zawiera nazwę, ikonę, opis i limit 3–6; gra nie trafia do mini-gier ani rekordów.
- Initial/summary dają status równoczesny, także kiedy została jedna oczekująca osoba; place/bid/reveal pokazują Twój ruch lub Ruch: nick.
- Nagłówek i timer biorą 30/60/15 s z publicznego View, bez czytania prywatnych rąk i stosów.
- Sabotaż jest montowany z key nonce i obsługą onMove; wynik trafia do ResultHero, szczegóły do ResultDetails bez drugiego tytułu zwycięzcy.
- Remis oraz równe dalsze miejsca są zgodne z serwerem; dotychczasowe gry zachowują statusy i układ wyników.

## Interface
- Lokalna informacja o równoczesności w Game zależy od id i phase; użyta spójnie w statusie, etykiecie limitu i kolorze.
- Komponent gry wysyła send('move', Move); rewanż nadal obsługuje platforma.
- Wynik głównej gry nie ma rekordu mini-gry; sumy Sabotażu pokazują jego szczegóły.

## Edge cases
- Jedna oczekująca osoba w initial → faza nadal równoczesna.
- Reveal kolejny raz u tej samej osoby → aktualny licznik i klucz decyzji.
- Rewanż z nowym nonce → lokalne zaznaczenia i animacje nie przechodzą do nowej partii.
- Remis → neutralny tytuł i miejsca serwera bez fikcyjnego zwycięzcy.

## Steps
1. apps/web/src/screens/lists.test.ts i tables.test.tsx: zapisać oczekiwania podpięcia oraz statusów przed zmianą Game.
2. apps/web/src/screens/Lobby.tsx: dodać ICONS/BLURBS dla sabotaz, wykorzystać istniejący Setup.
3. apps/web/src/screens/Game.tsx: importować Sabotaz i View, montować z nonce w ResultDetails oraz dodać warunkową równoczesność.
4. apps/web/src/games/Sabotaz.test.tsx: uzupełnić testy współpracy publicznego View z czasem i wynikiem; sprawdzić regresje innych gier.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck && pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Z lobby można uruchomić Sabotaż; wspólne akcje po grze i rewanż działają w odbiorze 11-07.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

---
id: 11-05
title: "Sabotaż: odsłony, historia i wibracje"
type: code
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard
depends: ["11-04"]
decisions: ["D-01","D-02"]
scope: ["apps/web/src/games/Sabotaz.tsx","apps/web/src/games/Sabotaz.test.tsx","apps/web/src/vibrate.ts","apps/web/src/vibrate.test.ts"]
---
## Goal
Dodać odsłonę rundy, pełną historię i czytelną reakcję na odkrycia bez uzależniania wyniku od animacji.

## Read first
- .planning/SABOTAZ-PLAN.md §2. Zasady rundy
- ZASADY.md §5. Spójność animacji i wibracji
- apps/web/src/vibrate.ts:15-40 (decisionKey, useHarm)
- apps/web/src/vibrate.test.ts:65-83 (szkoda od rywala)
- apps/web/src/screens/Game.tsx:550-610 (ResultDetails)

## Files
- apps/web/src/games/Sabotaz.tsx (modify)
- apps/web/src/games/Sabotaz.test.tsx (modify)
- apps/web/src/vibrate.ts (modify)
- apps/web/src/vibrate.test.ts (modify)

## Constraints
- D-01: odsłona wszystkich kart, punktacja 2/1/0, finalny remis; D-02: pokazać wszystkie wymuszone odkrycia w zapisanej kolejności.
- Wyniki i historia tylko z View; summary ma Dalej, over używa wspólnych akcji platformy.
- Istniejące stone-pop 0.35s i float-up 1.6s, bez nowych keyframes ani zmian czasu; nowe czasy wymagałyby ZASADY §5 (.telos/LESSONS.md, 05-35).
- Zastany stan i reduced motion od razu czytelne; animacja nie blokuje ruchu ani nie przechowuje kolejki starych stanów (.telos/LESSONS.md, 05-14).
- VIBRATE.turn generuje Game z decisionKey; useHarm tylko raz u odkrywającego cudzą pułapkę, bez wibracji własnej pułapki i po reconnect.

## Tests (write first)
- Summary pokazuje deklarację, kolejność odkryć, kończącą pułapkę, pełne ręce/stosy oraz przyrosty/sumy; własny next przechodzi w oczekiwanie.
- Over zachowuje szóstą odsłonę i historię wszystkich rund bez przycisku next; dane dają się odtworzyć z samego View.
- decisionKey zmienia się po kolejnym reveal tej samej osoby, ale nie po cudzym initial/next; obserwator i osoba bez decyzji dostają null.
- Klucz szkody powstaje tylko dla odkrywającego cudzą pułapkę i zawiera nonce/rundę; własna pułapka oraz sukces nie dają harm.
- Wielokartowa wymuszona sekwencja zachowuje kolejność i jeden werdykt, bez dodatkowego naliczenia punktów w kliencie.

## Interface
- decisionKey(sabotaz, view, me, waitingFor): nonce/round/phase oraz decision w fazach turowych; initial/summary bez zmiennego klucza gotowości innych.
- Klucz useHarm pochodzi z rozstrzygniętej próby: nonce/round/odkrywający/właściciel pułapki; null dla pozostałych.
- Historia zawiera tylko zakończone rundy; ekran nie rekonstruuje prywatnych kart.

## Edge cases
- Dwa kolejne reveal tej samej osoby → dwie decyzje, różne klucze.
- Cudza gotowość initial/summary → własny klucz decyzji bez zmian.
- Własna pułapka → brak harm; cudza → jeden klucz u poszkodowanego.
- Wejście w over → pełna szóstka rund i brak next.

## Steps
1. apps/web/src/games/Sabotaz.test.tsx i apps/web/src/vibrate.test.ts: najpierw testy odsłony, historii, kluczy decyzji i szkody.
2. apps/web/src/games/Sabotaz.tsx: dodać summary/over, czytelną pionową historię i sumy zgodne z miejscami serwera.
3. apps/web/src/vibrate.ts: rozszerzyć decisionKey dla Sabotażu bez zmiany zachowania innych gier.
4. apps/web/src/games/Sabotaz.tsx: wykorzystać useFresh/useHarm i istniejące animacje; odbiór zdarzeń, reconnect i reduced motion w 11-07.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm typecheck && pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Historia i wynik nie zależą od lokalnych animacji; szczegóły nadają się do ResultDetails.

## Result
RED: `vitest run src/games/Sabotaz.test.tsx src/vibrate.test.ts` → exit 1: brak odsłony, harmKey i useHarm w Sabotaz.tsx.
Odsłona i koniec partii z samego View: werdykt, deklaracja, kolejność odkryć, wszystkie stosy od góry i ręce, sumy, miejsca z serwera (bez zgadywania) i zwijana historia rund; Dalej w StickyBar, po nim czekanie, po końcu bez Dalej. decisionKey dla Sabotażu, harmKey tylko dla odkrywającego cudzą Pułapkę; stone-pop i float-up tylko dla nowych zdarzeń.
Testy: 68 w dwóch plikach, razem 2478 + 186 + 418; build i typecheck czyste. Odbiór zdarzeń na żywo, reconnect i reduced motion w 11-07.
Decyzja: historia tylko w odsłonie i po końcu (ekran decyzji ma się zmieścić na 360×640), a sumy punktów doszły na kafle stosów. Odbiega to od pierwszej wersji testu 'Poprzednie rundy' w trakcie rundy, którą zmieniłem przed implementacją.
Deviations: AGENTS.md — zmiana użytkownika sprzed zadania, nie commitowana

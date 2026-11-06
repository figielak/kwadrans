---
id: 11-02
title: "Sabotaż: testy przed kodem i silnik rund"
type: code
status: in-progress # draft | approved | in-progress | done | blocked | reverted
critical: true
effort: hard
depends: ["11-01"]
decisions: ["D-01","D-02"]
scope: ["packages/games/src/sabotaz.test.ts","packages/games/src/sabotaz.ts"]
---
## Goal
Zbudować kompletny silnik SAB-01..03 z testami zapisanymi i commitowanymi przed kodem, bez podpinania gry do UI.

## Read first
- ZASADY-GIER.md §Sabotaż (powstaje w 11-01)
- ZASADY.md §2. Testy przed kodem
- .planning/SABOTAZ-PLAN.md §2–4
- packages/games/src/core.ts:14-44 (GameDefinition)
- packages/games/src/core.ts:77-92 (rankResults, rankPlaces)
- .telos/phases/11-sabotaz/11-CONTEXT.md §Constraints

## Files
- packages/games/src/sabotaz.test.ts (create)
- packages/games/src/sabotaz.ts (create)

## Constraints
- D-01 i D-02: dokładnie zatwierdzone reguły oraz automatyczny własny i ostatni cudzy stos.
- Najpierw cały plik testów i sprawdzenie RED z powodu braku sabotaz.ts; osobny commit testów tylko po wyraźnej prośbie. Bez niej nie przechodzić do implementacji.
- Nazwy testów po polsku, send waliduje przed applyMove; budować stany ruchami, nie dużymi ręcznymi fixture.
- validateMove jest jedynym strażnikiem, także przy bezpośrednim wywołaniu; schema pilnuje kształtu. Bez zaufania do source w payloadzie (.telos/LESSONS.md, 05-02).
- Tylko rng: nonce w setup i wybór timeoutu spośród co najmniej dwóch legalnych stosów; nie losować przy wymuszonym wyborze.
- Stan niemutowalny JSON; playerView budowany jawnie, bez rozlewania prywatnego State.
- Bez zmiany testów pod implementację; korekta zasady wraca najpierw do 11-01.
- Zmiana packages/games restartuje dev i kasuje trwające partie (.telos/LESSONS.md, quick).

## Tests (write first)
- Metadane 3/6, świeży stan, stałe, ten sam seed daje ten sam nonce, różne wybrane seedy różne nonce; ręce zawsze 3+1.
- Obcy/obserwator, zła faza/tura, ruch po over, brak karty, ponowny initial/next, stary nonce/runda/decyzja oraz niepoprawny payload są odrzucane.
- Schemat odrzuca brak pól, nieznany rodzaj, ułamki, NaN/Infinity i zły typ; validateMove odrzuca semantyczne granice także bez parsowania.
- Initial kurczy waitingFor; place odkłada na wierzch i przekazuje turę; ręka pusta wymusza bid, po bid brak dokładania.
- Aukcja: 1 i T legalne, 0/T+1/niepodbijająca wartość nie; skoki, powrót poprzedniego lidera, trwały pas, pomijanie lidera, T wymaga pasów.
- Własny stos od góry automatycznie do celu/pułapki/końca; cel niższy od własnego stosu zostawia resztę zakrytą.
- Cudzy pusty/nieistniejący stos oraz własny cel reveal niedozwolone; zmiana cudzego stosu legalna, ostatni stos odkrywa się automatycznie.
- Sukces daje wyłącznie +2, cudza pierwsza pułapka wyłącznie właścicielowi +1, własna wszystkim 0; brak punktów drugi raz i brak odkryć po zakończeniu próby.
- Summary ujawnia wszystkie karty i zapisuje kolejność, deklarację, przyrosty oraz sumy; next wszystkich lub timeout rozpoczyna świeżą rundę z rotacją.
- Po rundzie 6 od razu over, pełna historia, wynik 0..12; wygrana każdego gracza, remis na górze bez winner, wspólne dalsze miejsca i waitingFor=[].
- W każdej fazie własny widok zna swoje karty, rywale tylko ujawnione; pusty i obcy id nie mają prywatnych kart; historia nie ujawnia trwającej rundy, poprzednie są publiczne.
- Każdy timeout przechodzi schema i validateMove; initial safe/place bid 1/bid pass/reveal legalny losowy/summary next; pełna partia timeoutami kończy się przy 3 i 6.
- Klucz turn stały przy cudzym initial/next, nowy po fazie i każdej decyzji turowej, także kolejnych reveal tej samej osoby; limity 30/60/15 s.
- applyMove nie mutuje stanu ani zagnieżdżonych kart/historii; stan i widoki przeżywają JSON round-trip, zużycie rng tylko w potrzebnych wyborach.

## Interface
- Eksport sabotaz: GameDefinition<State, Move>, View i nazwane stałe; bez zmian core.ts.
- State: players, nonce, round 0..5, phase initial/place/bid/reveal/summary/over, decision, ręce, stosy, gotowość, lider, bid, pasy, odkrycia, totals i history.
- Move: place {kind}, bid {amount}, pass, reveal {owner}, next; wszystkie z nonce/round, turowe także decision. Rodzaje safe/trap.
- View: publiczne nonce/round/phase/decision, tura, wielkości rąk/stosów, własne karty (bez indeksowania cudzego State), odkrycia, totals i zakończona historia.
- turn() korzysta wyłącznie z publicznych pól dostępnych również w View: nonce/round/phase/decision; initial i summary mają stały klucz podczas gotowości.
- isOver i places używają jednego komparatora sum przez core; brak record/live/modes.

## Edge cases
- Zduplikowany albo opóźniony ruch → odrzucenie bez ponownych punktów.
- Cel 1 przy własnej pułapce pod Przejściem → sukces, pułapka pozostaje nieodkryta do summary.
- Deklaracja T → kolejni gracze mogą wyłącznie pasować, dopiero komplet rozpoczyna próbę.
- Ostatni cudzy stos → wymuszone odkrycia tylko do pierwszej pułapki lub celu.
- Gotowość części osób → wspólny termin bez odnowienia; następne reveal jednej osoby → nowy termin.
- Obcy id przed summary → widok obserwatora bez tajnych rodzajów kart.
- Szósta rozstrzygnięta próba → over bez czekania na next, remis bez winner.

## Steps
1. packages/games/src/sabotaz.test.ts: zapisać pełny kontrakt powyższych reguł, uruchomić RED i zatrzymać się na osobnym commicie testów, jeśli nie ma jeszcze prośby użytkownika.
2. packages/games/src/sabotaz.ts: dodać typy, stałe, schema, setup i walidację ruchów z ochroną przed starym komunikatem.
3. packages/games/src/sabotaz.ts: wdrożyć initial/place/bid oraz wymuszone i wybierane odkrycia, punktację i historię rund.
4. packages/games/src/sabotaz.ts: dodać jawny playerView, waitingFor, turn, timeoutMove oraz isOver/places.
5. packages/games/src/sabotaz.test.ts: przejść RED → GREEN bez osłabiania asercji; odnotować osobno dowód kolejności testy/commit/kod.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/sabotaz.test.ts` → exit 0
- [ ] `pnpm typecheck && pnpm test` → exit 0
- [ ] Osobny commit pełnych testów poprzedza sabotaz.ts; brak nieautoryzowanych commitów i zmian testów pod kod.

## Result
RED: pnpm --filter @kwadrans/games exec vitest run src/sabotaz.test.ts → exit 1: brak modułu ./sabotaz.ts (przed implementacją). Czeka na prośbę o osobny commit testów.
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

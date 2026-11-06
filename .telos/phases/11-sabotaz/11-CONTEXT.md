# 11 · Sabotaż
## Goal
Wprowadzić grę główną `sabotaz` dla 3–6 osób według `.planning/SABOTAZ-PLAN.md` v1.
Zakres SAB-01..05: zasady, TDD, prywatne karty, mobilny ekran, podpięcie i odbiór.
To szkic do akceptacji; samo `/telos:plan` nie zatwierdza zasad ani implementacji.

## Decisions
- D-01: Przyjąć v1: 6 rund bez eliminacji, ręka 3 Przejścia + 1 Pułapka, aukcja z trwałym pasem, odkrywanie od góry najpierw własnego stosu do celu, punktacja 2/1/0, remisy i limity 30/60/15 s.
- D-02: Wariant opcjonalny z §2: automatycznie rozstrzygać także ostatni niepusty cudzy stos; zapisywać całą sekwencję, kończyć dokładnie na celu albo pierwszej pułapce.
- D-03: Zachować limit 6 osób w pokoju: odbiór 3 grających + obserwator oraz 6 grających; dla 6 widok obserwatora sprawdzić w testach playerView i viewFor bez siódmego połączenia.

## Constraints
- Źródłem propozycji jest plan v1 z 2026-11-05; aktualne źródła prawdy wygrywają ze szkicem. Zasady przenieść do ZASADY-GIER dopiero po akceptacji D-01..03.
- Rundy w stanie 0..5, w UI 1..6; start players[round % N]. Licznik decyzji nie zmienia wspólnego terminu initial/summary po gotowości jednej osoby.
- Zamiast nieistniejącego OWN_RANKING użyć ResultHero/ResultDetails (Game.tsx, testy lists/tables). To dostosowanie techniczne do obecnej architektury.
- Nowa gra bez modes, live, record, nowych zależności, endpointów, zmian bazy i limitu pokoju. Nie zmieniać kontraktu GameDefinition.
- Implementacja na gałęzi. AGENTS.md ma pierwszeństwo nad dawną zgodą w PROJECT.md: commit i push tylko na prośbę użytkownika. Planowanie niczego nie commituje.
- W 11-02 najpierw cały sabotaz.test.ts i wynik RED, potem osobny commit testów, dopiero sabotaz.ts. Jeśli nadal brak prośby o commit, pozostawić testy do wglądu i uzyskać ją przed kodem.
- Testy z ludźmi i na fizycznym telefonie wykonuje użytkownik; brak pomiaru nie jest odbiorem. Nie obiecywać partii w kwadrans.
- Faza 07 pozostaje aktywna w ROADMAP; wskazanie fazy 11 w STATUS nie zamyka jej ani nie zatwierdza innych propozycji.

## Open questions
- none

## Carried over
- none

## Links
- .planning/SABOTAZ-PLAN.md §1–6
- .telos/PROPOSALS.md §Sabotaż (SAB-01..05)
- KONCEPT.md §3. Architektura
- ZASADY.md §1–6
- DESIGN.md §2. Tokeny
- .telos/MAP.md §Zasady gier, §Serwer, §Ekrany klienta

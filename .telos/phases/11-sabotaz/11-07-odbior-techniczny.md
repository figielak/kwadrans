---
id: 11-07
title: "Sabotaż: odbiór techniczny 3 i 6 graczy"
type: audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal
depends: ["11-06"]
decisions: ["D-03"]
scope: [".telos/"]
---
## Goal
Udowodnić techniczną gotowość SAB-05 i zapisać rzeczywisty wynik każdego scenariusza; przygotować krótką listę prób dla użytkownika.

## Read first
- ZASADY.md §6. Podpięcie i odbiór
- .planning/SABOTAZ-PLAN.md §6. Testy i odbiór
- .telos/phases/11-sabotaz/11-CONTEXT.md §Decisions
- apps/web/src/Dev.tsx:1-34 (iframe trybu dev)
- apps/server/src/LobbyRoom.test.ts:49-84 (limit klientów i obserwator)

## Files
- none

## Constraints
- D-03: /dev?n=4 z 3 miejscami i obserwatorem, osobno /dev?n=6; nie udawać siódmego klienta.
- Każdy telefon w /dev domyślnie ma 390×780: ustawić rzeczywiste ramki na 360×640, mierzyć z nagłówkiem i długimi nickami (.telos/LESSONS.md, 05-09).
- Przeglądarka nie zastępuje fizycznego telefonu i próby balansu; to zadanie 11-08.
- Przestrzegać 10 wiadomości/s i 3 pokoi/IP; korzystać z izolowanych sesji dev/oddzielnych originów (.telos/LESSONS.md, tests/quick).
- Restart serwera dev kasuje partie; testy prowadzić po ostatniej zmianie packages/games i pozostawić dev uruchomiony (.telos/LESSONS.md, games/quick).
- Tylko odbiór, bez poprawek kodu i rozszerzania zakresu. Usterka → plik, reprodukcja, oczekiwane/rzeczywiste i zadanie naprawcze przed odbiorem.





## Steps
- Uruchomić pełne typecheck/test/build, następnie serwery dev; zapisać wersję kodu i wyniki bramek.
- Przejść pełne partie dla 3 + obserwator i 6, w każdej fazie timeout oraz reload/reconnect; skontrolować karty, termin, stary ruch i czyszczenie szkiców.
- Wymusić legalną partią aukcję do T, powrót lidera, wybór cudzych stosów, własną/cudzą pułapkę, sukces, automatyczny ostatni stos oraz remis.
- Sprawdzić WebSocket/DOM, miejsca, wygraną w statystykach, punkty wieczoru, rewanż i lobby; wyjście przy 3+ osobach kończy bez zwycięzcy, zgodnie z KONCEPT.
- Zmierzyć 360×640 z 6 długimi nickami: pola 48 px, potwierdzanie, dostępność własnego stosu, brak przewijania planszy, pionowe odsłony ponad StickyBar; sprawdzić reduced motion, zastany stan i brak podwójnego harm.
- Zapisać w Result dowody i nierozstrzygnięte punkty; przekazać scenariusze fizycznego telefonu i próby ludzi do 11-08.

## Acceptance
- [ ] `pnpm typecheck && pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Każdy scenariusz ma wynik i dowód; brak niezałatwionych błędów funkcjonalnych, prywatności i układu.
- [ ] Odbiór obserwatora dla 6 opiera się na testach 11-02/03, nie na nieistniejącym siódmym miejscu.
- [ ] Nie oznaczono prób z ludźmi ani fizycznego telefonu jako zaliczonych przez samą emulację.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

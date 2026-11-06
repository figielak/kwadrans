---
id: 11-03
title: "Sabotaż: rejestr, zegar pokoju i poufność"
type: code
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: true
effort: hard
depends: ["11-02"]
decisions: ["D-03"]
scope: ["packages/games/src/index.ts","packages/games/src/index.test.ts","apps/server/src/LobbyRoom.test.ts"]
---
## Goal
Podłączyć silnik do rejestru i udowodnić zgodność SAB-03 z rzeczywistą ścieżką pokoju, zegarem i filtrowaniem widoków.

## Read first
- packages/games/src/index.ts:122-168 (GAMES, MINI_GAME_IDS)
- packages/games/src/index.test.ts:109-186 (kontrakt, visited)
- apps/server/src/LobbyRoom.test.ts:36-84 (openRoom, drawing)
- apps/server/src/LobbyRoom.ts:537-556 (play)
- apps/server/src/LobbyRoom.ts:628-690 (startTurnTimer, viewFor)
- KONCEPT.md §3. Architektura

## Files
- packages/games/src/index.ts (modify)
- packages/games/src/index.test.ts (modify)
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- D-03: 3 + obserwator i 6 graczy; widok obserwatora dla 6 testować bez dodawania siódmego klienta.
- Bez zależności zod w apps/server ani przywracania tego wycofanego podejścia (.telos/LESSONS.md, server/quick).
- Bez zmian LobbyRoom.ts, DB, kontraktu lub endpointów; wykryty brak wymaga osobnego uzasadnionego zadania, nie rozszerzania tego zakresu.
- maxPayload wynosi 32 KB; zmierzyć największą pełną wiadomość room z historią 6 rund (.telos/LESSONS.md, server/quick).
- Testy przez rzeczywiste handlery i fałszywy zegar; zachować limit 10 komunikatów/s, aby nie mylić limitu z błędem zasad (.telos/LESSONS.md, tests/quick).

## Tests (write first)
- Rejestr ma sabotaz, zgodną liczbę gier, eksport View/Move i SABOTAZ_*; gra nie jest MINI_GAME_IDS, nie ma record/live/modes.
- Kontrakt używa co najmniej minPlayers zamiast obecnych dwóch id; losowe/timeoutowe partie 3 i 6 kończą się bez regresji starych gier.
- Pokryć reveal sterowaną partią z deklaracją większą niż własny stos; same timeouty bid=1 pomijają tę fazę i nie są dowodem jej odwiedzenia.
- Częściowe initial i next nie resetują msLeft; nowa decyzja tej samej osoby i nowa faza resetują do właściwej wartości.
- Zegar wykonuje tylko oczekujących, przechodzi walidację i nie zużywa nowej fazy w starym callbacku; duplikat ze starej decyzji nic nie zmienia.
- Wiadomości room dla każdego gracza i obserwatora nie ujawniają cudzych kart ani bieżącej tajnej historii; summary/over ujawniają zakończone rundy.
- Największa wiadomość room z 6 osobami i 6 pełnymi rundami mieści się w 32 KB UTF-8.
- Wynik przekazuje places z remisami i jednorazowo punktuje wieczór; remis bez zwycięzcy, ponowne wiadomości nie powielają wyniku.

## Interface
- GAMES.sabotaz i eksporty z przedrostkiem SABOTAZ_, typ SabotazView oraz SabotazMove.
- RoomView bez zmian; viewFor nadal wywołuje playerView, a turn korzysta z publicznych pól View.
- Testowe sterowanie reveal prowadzi legalnymi ruchami, nie osłabia zestawu visited ani validatora.

## Edge cases
- minPlayers=3 → kontrakt nie inicjalizuje gry dla dwóch graczy.
- Same timeouty kończą rundę na własnym safe → reveal sprawdzony osobnym legalnym scenariuszem.
- Ostatnia gotowość w callbacku → nowa faza zachowuje własny termin.
- 6 graczy i pełna historia → wiadomość poniżej 32 KB, bez tajnych danych w aktywnej rundzie.
- Remis lub powtórzony komunikat końca → brak fałszywego zwycięzcy i podwójnych punktów.

## Steps
1. packages/games/src/index.test.ts: najpierw dodać testy rejestru i poprawić tworzenie graczy według minPlayers, zachowując dowód RED.
2. packages/games/src/index.ts: zarejestrować sabotaz oraz eksporty typów i stałych.
3. packages/games/src/index.test.ts: uzupełnić dowód wszystkich faz, w tym reveal, bez udawania że sam timeout go osiąga.
4. apps/server/src/LobbyRoom.test.ts: dodać scenariusze zegara, widoków, maksymalnej wiadomości i wyniku na prawdziwych handlerach.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck && pnpm test` → exit 0
- [ ] Udokumentowane liczby bajtów oraz dowód stałego terminu initial/summary i nowego terminu kolejnych reveal.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

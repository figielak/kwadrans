---
id: 08-09
title: "Odbiór techniczny 3 i 6 graczy"
type: audit          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-08]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Przejść pełną listę odbioru z ZASADY §6 na prawdziwym serwerze. Faza nie idzie dalej, dopóki każdy obowiązkowy punkt nie jest zaliczony.

## Read first
- ZASADY.md:339-351 (lista gotowości gry)
- ZASADY-GIER.md §13. Podróbka
- .planning/PODROBKA-PLAN.md:230-236 (odbiór integracyjny i bramki)

## Files

## Constraints
- Audyt niczego nie naprawia: wady idą do Result jako propozycje na `/telos:revise` albo `/telos:quick`; po poprawce powtarzamy dotknięte punkty, a zadanie do tego czasu nie jest zaliczone.
- Odstępstwo od obowiązkowego punktu tylko po jawnej decyzji użytkownika, zapisanej w Result; agent sam go nie przyznaje.
- Mierz 360×640 z prawdziwym nagłówkiem, 3 i 6 graczami, 16-znakowymi nickami, odpowiedziami po 30 znaków, pytaniami po 90 i obserwatorem; sam viewport nie zastępuje telefonu z klawiaturą, to zostaje w 08-10 (05-09).
- 6 graczy zapełnia pokój: obserwatora przy komplecie sprawdza test `viewFor`, żywego obserwatora robimy przy 3 graczach.
- Playwright: drugi gracz przez `http://127.0.0.1:5173`, Vite z `--host`; limit 3 pokoi na IP zeruje restart serwera; max 10 wiadomości/s (quick).
- Zmiana w `packages/games` restartuje serwer dev i kasuje partie (quick).
- Po pracy nie ubijać serwerów dev, użytkownik testuje dalej (pamięć projektu).

## Steps
- Pełna partia 3 graczy z obserwatorem i 6 graczy w `/dev?n=6`.
- Przeładowanie i dobiegnięcie limitu w `write`, `vote` i `summary`, przeładowanie w `over`, także po zatwierdzeniu.
- Szkic wysłany tuż przed zatwierdzeniem i zmianą rundy: nie trafia do nowej rundy i nie cofa zatwierdzenia.
- Reconnect i trwałe wyjście, remis, rewanż, powrót do lobby, wpis wygranej w rankingu.
- Odczyt wiadomości WebSocket: brak ról, `pairId`, przyszłych par, cudzych szkiców i głosów przed odsłoną.
- 360×640 w każdej fazie z maksymalnymi długościami, reduced motion, jedna wibracja na nową decyzję; wyniki z dowodem w Result.

## Acceptance
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Każdy punkt listy z ZASADY §6 oraz prywatność WebSocket i układ 360×640 są w Result zaliczone z dowodem.
- [x] Niezaliczony punkt ma w Result jawną decyzję użytkownika o odstępstwie; brak takiej decyzji oznacza, że zadanie nie jest ukończone.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->
Odbiór techniczny wykonany, kod bez zmian (audyt). Metoda: osobny serwer audytu :2570 (ten sam kod, `DB_PATH=:memory:`, żeby nie zapisywać w rankingu dev), boty w Node na `@colyseus/sdk` (skrypty w scratchpadzie, poza repo), Playwright na dev :2567 i na buildzie :2570; serwery dev zostawione włączone. Wiadomości „room” to zdekodowane ramki odebrane przez SDK.
1. Bramki: `pnpm run typecheck` exit 0; `pnpm run test` zielone (gry 2773, serwer 215, web 558); `pnpm --filter web build` exit 0.
2. Pełne partie: 3 graczy + obserwator 63/63 PASS (2 partie z rewanżem, 592 wiadomości), 6 graczy 63/63 PASS (1718 wiadomości; bez siódmego połączenia, obserwator przy komplecie to `viewFor` z testu). Każda runda: rola, wykrycie, głosy, punkty zgodne z niezależną wyrocznią w skrypcie, sumy 0-18, zwycięzca i `places`; obserwator na żywo (360×640) widzi pytanie większości i odpowiedzi, bez pola i akcji.
3. Prywatność WebSocket: analiza każdej wiadomości (role, `pairId`, `deals`, `drafts`, `votes` poza historią, przyszłe pary, pytanie Podróbki, cudze szkice, odpowiedzi i głosy przed odsłoną): 0 problemów; autotest analizatora wykrył 8/8 wstrzykniętych wycieków, więc „0” coś znaczy.
4. Odświeżenie: serwer: reconnect w write (wraca szkic), vote (własny głos), summary (gotowość), over (wynik i historia), dla 3 i 6; UI: reload w write (szkic i licznik), po zatwierdzeniu (tekst bez pola), vote (niezatwierdzony wybór ginie, zatwierdzony zostaje), summary (przed i po „Dalej”), over (remis).
5. Limity na zegarze serwera (3 graczy): write 30,0 s, vote 60,0 s, summary 15,0 s (13/13), szkice stają się odpowiedziami, brak głosu to wstrzymanie, punkty raz, szkic ani cudzy głos nie odnawiają limitu; komplet timeoutów 260,8 s (7/7): 6 anulowań, remis bez zwycięzcy, brak wpisu w rankingu, rewanż. Dla 6 graczy: rundy 2-6 przeszły na limitach w scenariuszu układu (30 oznaczeń anulowanych w tabeli), plus test serwera 3 i 6 osób.
6. Wyścigi: szkic tuż przed zatwierdzeniem i spóźniony szkic po nim nie cofają zatwierdzenia; ruch ze starej rundy i starym `nonce` (rewanż) odpada.
7. Wyjście gracza w write (3 i 6): partia kończy się bez zwycięzcy i bez nowego składu, bez wpisu. Rewanż (nowy `nonce`, czysty stan), powrót do lobby z zachowanym wieczorem. Ranking: `/api/stats` zgodny z wyrocznią, widoczny na ekranie „Rekordy i rankingi” z miejscami remisowymi.
8. 360×640 (prawdziwy viewport, 6 graczy, nicki 16 znaków, odpowiedzi 30 znaków, pytanie 90 znaków wstrzyknięte): write, vote, odsłona (anulowana i nieanulowana), over i obserwator: brak poziomego przewijania, brak ucięć, brak celów poniżej 48 px, „Gotowe” i „Dalej” w widoku (przyklejony pasek). Wibracje: dokładnie 1 na nową decyzję (write 1, vote 2, summary 3, runda 2: 4), szkic, cudze zatwierdzenie i wykrycie nie wibrują. Reduced motion na żywo: `card-in` 0,01 ms, pływające „+2” to `float-still`, jedno, własne.
9. Sekcje 3, 4, 5 ZASADY: testy globalne (tokens, states, a11y, hierarchy, words, descriptions, animations, vibrate) skanują `Podrobka.tsx` i są zielone, plus pomiary wyżej; nie przeglądałem osobno każdego zdania sekcji 4.
Uwagi, bez blokady (propozycje na `/telos:quick`, jeśli chcesz): (a) tabela końcowa przy nickach 16-znakowych zawija „1.” / „Szesnastoznakow” / „2” na trzy linie, rzędy rosną, nic nie wychodzi poza ekran (kosmetyka, osobna wąska kolumna miejsca); (b) głosowanie i odsłona dla 6 graczy mają 1019-1242 px wysokości i przewijają się pionowo przy przyklejonym przycisku, co mieści się w ZASADY:197 (zakazane tylko przewijanie poziome); (c) 30 liter „W” przewija się w polu odpowiedzi (326 px), zwykły tekst mieści się; (d) po przeładowaniu Chrome blokuje `navigator.vibrate` („user hasn't tapped”, `Game.tsx:98`), dotyczy platformy, nie Podróbki.
Zostaje do 08-10 (zgodnie z ograniczeniem zadania, to nie odstępstwo): telefon z klawiaturą, balans i czytelność z ludźmi, para tekstów „niepewnych” z 08-03.
Poprawki mojego skryptu w trakcie: SDK samo wznawia sesję po `leave(false)` (zakleszczenie ręcznego `reconnect`), kolejność kluczy w porównaniu odpowiedzi po rotacji miejsc, progi `msLeft` (migawka z chwili wysłania), porównanie rankingu zanieczyszczone równoległymi przebiegami; po każdej poprawce przebieg powtórzony do pełnego PASS. Błędów w kodzie gry nie znaleziono.
Jedno uruchomienie `telos accept` miało 1 padnięty test w `apps/server` (nazwy nie ustaliłem), a 6 kolejnych przebiegów serwera dało 215/215 i powtórka `telos accept` PASS. Prawdopodobny sprawca to znany niestabilny „07-19” z 08-04 (losowanie opcji „Inna gra”), ale tego nie potwierdziłem; poprawka (ograniczenie opcji przez `onlyGames` w teście) czeka jako osobne zgłoszenie.
Deviations: none

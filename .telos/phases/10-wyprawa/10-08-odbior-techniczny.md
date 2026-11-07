---
id: 10-08
title: "Odbiór techniczny 2 i 6 graczy"
type: audit          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-07]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Przejść pełną listę odbioru z ZASADY §6 na prawdziwym serwerze. Faza nie idzie dalej, dopóki każdy obowiązkowy punkt nie jest zaliczony.

## Read first
- ZASADY.md:339-349 (lista gotowości gry)
- ZASADY-GIER.md §12. Wyprawa
- .planning/WYPRAWA-PLAN.md:123-125 (zakres partii i bramki)

## Files

## Constraints
- Audyt niczego nie naprawia: wady idą do Result jako propozycje na `/telos:revise` albo `/telos:quick`; po poprawce powtarzamy dotknięte punkty, a zadanie do tego czasu nie jest zaliczone.
- Odstępstwo od obowiązkowego punktu tylko po jawnej decyzji użytkownika, zapisanej w Result; agent sam go nie przyznaje.
- Mierz 360×640 z prawdziwym nagłówkiem, 2 i 6 graczami, długimi nickami i obserwatorem (05-09).
- 6 graczy zapełnia pokój: obserwatora przy komplecie sprawdza test `viewFor`, żywego obserwatora robimy przy 2 graczach.
- Playwright: drugi gracz przez `http://127.0.0.1:5173`, Vite z `--host`; limit 3 pokoi na IP zeruje restart serwera; max 10 wiadomości/s (quick).
- Zmiana w `packages/games` restartuje serwer dev i kasuje partie (quick).
- Po pracy nie ubijać serwerów dev, użytkownik testuje dalej (pamięć projektu).

## Steps
- Pełna partia 2 graczy z obserwatorem i 6 graczy w `/dev?n=6`.
- Przeładowanie i dobiegnięcie limitu w `decision` i `summary`, przeładowanie w `over`, także w obozie i po zatwierdzeniu.
- Wyjście i reconnect, remis przez komplet powrotów, rewanż, powrót do lobby, wpis wygranej w rankingu.
- Odczyt wiadomości WebSocket: brak talii, seeda i cudzych wyborów przed rozstrzygnięciem.
- Telefon 360×640 w każdej fazie i `prefers-reduced-motion`; jedna wibracja na nową decyzję.
- Zapisać wyniki z dowodem w Result; czasu partii nie traktować jako oceny ludzi.

## Acceptance
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Każdy punkt listy z ZASADY §6 oraz prywatność WebSocket i układ 360×640 są w Result zaliczone z dowodem.
- [x] Niezaliczony punkt ma w Result jawną decyzję użytkownika o odstępstwie; brak takiej decyzji oznacza, że zadanie nie jest ukończone.

## Result
Odbiór na żywym serwerze (Playwright, 360×640, `127.0.0.1:5173`, atrapa `navigator.vibrate`, ramki WS zapisane w stronie). Bramki: typecheck, test (games 2603, server 200, web 485), build zielone w 3 przebiegach.
Zaliczone z dowodem:
- Partie: 2 graczy + żywy obserwator (3 pełne partie, w tym wygrana i remis) oraz 6 graczy z nickami po 16 znaków (74 decyzje, 24 odsłony). Obserwator przy 6: testy `viewFor` z 10-04.
- Odświeżenie: decyzja bez wyboru (wybór zerowy, timer trwa), po zatwierdzeniu („Zatwierdzone: Wracam”, brak aktywnych przycisków), obóz, odsłona (13 s zostaje), over (ten sam wynik u wszystkich).
- Limity: decyzja ok. 20 s i odsłona 15 s (po reloadzie 12,4 s do nowej wyprawy), plus kilka partii dobiegniętych samymi limitami.
- Wyjście: świadome `room.leave()` w trakcie (UI nie ma przycisku): 2 os. walkower („Wygrywasz!”, obserwator „Wygrywa”, „· wyszedł”, ranking +1 wygrana i +1 partia hosta, gość bez porażki); 6 os. koniec „Remis” bez wpisu. Reconnect: zamknięta i otwarta karta wraca do pokoju, „rozłączony” znika. Usunięcie po 10 min rozłączenia nie było widziane: partie trwają ok. 8 min (najdłuższa 494 s).
- Remis (komplet powrotów): banki 7:7, „Remis”, miejsca 1./1., statystyki bez zmian. Rewanż (2 i 5 os.) i „Do lobby” działają. Ranking: wygrana +1/+1, ekran „Rekordy” pokazuje „Wyprawa: wygrane z partii”.
- WS: po „Wracam” gracza 1 rywale, obserwator i 5 pozostałych dostali ramki bez `return`/`continue`; w żadnej sesji (2 i 6 os.) nie ma kluczy `deck` ani `seed`.
- Wibracje: 1 na każdą nową decyzję lub odsłonę (host 14/14, gość 12/12 stanów), 0 w obozie, po zatwierdzeniu i w over. Po reloadzie w dev 2 (React StrictMode), produkcyjnie 1. Reduced motion: card-in 0,35 s→0,01 ms, float-up→float-still. Cele dotykowe: brak elementów <48 px w decyzji, obozie, odsłonie i over; „Gotowe”/„Dalej” zawsze w widoku (580-628 px).
Wady poprawione, punkt 360×640 powtórzony (6 os. z nickami po 16 znaków, 2 os. z obserwatorem; okno 345 px przez pasek przewijania przy 6 os.):
- W1 (`d7ca98e`) odmiana „Szlak: 1 odkryta karta”.
- W2 (`b39496d`) tabela końcowa zawija pełne nicki: kolumna 127 px zamiast 79 px, liczby nie są ucięte.
- W3 (`b39496d`) pasek decyzji 92 px (przyciski 104/105/88×48 px), „Zatwierdzone” 68 px, ostatni wiersz kończy się na 536 px nad paskiem na 548 px; tekst obozu kończy się na 198 px, obserwatora na 222 px.
- W4 (`90ad004`) chwilowe przewinięcie poziome na ekranie wyniku: `stone-pop` (scale 1.6) na wierszu `ResultHero` poszerzał stronę do 396 px przy oknie 345 px, ok. 1 s, 111 próbek. Lista przycina poziom: próbkowanie co 40 ms przy 6 i 3 os. daje 0 próbek. Wspólny ekran, sprawdzony tylko w Wyprawie.
Poprawki zmieniły tylko układ, więc odświeżenia, limitów, wyjścia, remisu, rewanżu, rankingu, WS i wibracji nie powtarzano. Bramki po W4: typecheck, test (games 2603, server 200, web 492), build. Wszystkie punkty zaliczone, odstępstw brak.
Uwagi poza Wyprawą: niestabilny test serwera „07-19: wyjście gracza, gdy pozostali zagłosowali” (losowa gra z min. 3 os., ok. 1 na 6 przebiegów, także `telos accept`).
Czas partii (ok. 8 min najdłuższa przy samych limitach) nie jest oceną ludzi. Serwery dev zostawione włączone.
Deviations: none

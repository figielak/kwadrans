---
id: 10-04
title: "Wyprawa w pokoju: limity, prywatność, wynik"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-03]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/server/src/LobbyRoom.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dowieść testami pokoju, że istniejący serwer poprawnie prowadzi Wyprawę: limity, jednorazowe rozstrzygnięcie, prywatność wiadomości i wynik. Kod serwera nie powinien wymagać zmian.

## Read first
- apps/server/src/LobbyRoom.ts:538-557 (play, odnowienie limitu po zmianie klucza)
- apps/server/src/LobbyRoom.ts:630-652 (startTurnTimer, ruchy zastępcze dla każdego czekającego)
- apps/server/src/LobbyRoom.ts:582 (zapis wygranej)
- apps/server/src/LobbyRoom.test.ts:60-85 (snapshot, drawing)
- apps/server/src/LobbyRoom.test.ts:1491-1498 (msLeft, ruchy z odstępem)
- apps/server/src/LobbyRoom.test.ts:144 (wyjście gracza)

## Files
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- `apps/server` bez bezpośredniej zależności `zod` (usunięte podejście, lekcja quick).
- Ruchy w testach z odstępem ponad 100 ms: limit 10 wiadomości/s daje inaczej fałszywe porażki (quick).
- Zadanie zmienia tylko testy; ujawniona wada serwera to zgłoszenie do użytkownika przed poprawką, bo wyszłaby poza scope.

## Tests (write first)
- Decyzja ma 20 s, a zatwierdzenie innego gracza nie odnawia czasu.
- Nowe odkrycie daje pełne 20 s, także gdy `waitingFor` jest taki sam; odsłona ma 15 s; po końcu brak limitu.
- Limit decyzji przy kilku czekających rozstrzyga raz: bank rośnie jednokrotnie, zatwierdzony wcześniej wybór zostaje.
- Komplet timeoutów przechodzi pięć wypraw i kończy partię remisem bez wpisu zwycięzcy.
- Wiadomość `room` dla gracza, gracza w obozie, obserwatora (2 graczy) i `viewFor` obcego id (6 graczy) nie zawiera talii ani cudzego wyboru przed rozstrzygnięciem.
- Wyraźna wygrana zapisuje `record("wyprawa", ...)` raz, `places` i punkty wieczoru są w `RoomView`, po końcu stary ruch nic nie zmienia.
- Wyjście gracza przy 2 osobach daje walkower, przy większej liczbie koniec bez zwycięzcy.
- Rewanż ma nowy `nonce`, a ruch ze starym stemplem odpada.

## Steps
- Dodać `describe("Wyprawa w pokoju")` z pomocnikami `open`, `viewOf`, `stamp`, `paced` lokalnymi dla bloku.
- Napisać testy limitów na sztucznym zegarze.
- Napisać testy prywatności na `JSON.stringify` wysłanych wiadomości, nie tylko na `view`.
- Napisać testy końca, zapisu, walkoweru i rewanżu.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [x] `pnpm run typecheck` → exit 0

## Result
Blok `describe("Wyprawa w pokoju")` w LobbyRoom.test.ts: 13 testów (termin, zegar, poufność wiadomości room, wynik, walkower, rewanż). Istniejący serwer nie wymagał zmian.
Kolejność kart ustawia `rig` przez podmianę `deck` w stanie meczu, bo `openExpedition` nie jest eksportowany z pakietu (eksport wyszedłby poza scope). Poufność sprawdzana na JSON wysłanych wiadomości i różnicy widoków (zmienia się tylko `ready`).
Pełny plik 176/176 (4 uruchomienia z rzędu), typecheck czysty. Raz pojawiła się porażka starszego testu głosowania („wyjście gracza, gdy pozostali zagłosowali”), niepowtarzalna; to nie ten blok.
Rewanż rotuje kolejność miejsc, więc test porównuje `waitingFor` jako zbiór.
Deviations: none

---
id: 08-05
title: "Podróbka w pokoju: limity, prywatność, wynik"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-04]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/server/src/LobbyRoom.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dowieść testami pokoju, że istniejący serwer poprawnie prowadzi Podróbkę: limity, jednorazowe punktowanie, prywatność wiadomości i wynik. Kod serwera nie powinien wymagać zmian.

## Read first
- apps/server/src/LobbyRoom.ts:538-557 (play, odnowienie limitu tylko po zmianie klucza)
- apps/server/src/LobbyRoom.ts:630-652 (startTurnTimer, ruchy zastępcze dla każdego czekającego)
- apps/server/src/LobbyRoom.test.ts:60-85 (snapshot, drawing)
- apps/server/src/LobbyRoom.test.ts:1774-1800 (blok Wyprawy: pomocnicy `open`, `viewOf`, `paced`)
- apps/server/src/LobbyRoom.test.ts:1960-1975 (obserwator przy 6 graczach przez `viewFor`)

## Files
- apps/server/src/LobbyRoom.test.ts (modify)

## Constraints
- `apps/server` bez bezpośredniej zależności `zod` (usunięte podejście, lekcja quick).
- Ruchy w testach z odstępem ponad 100 ms: limit 10 wiadomości/s daje inaczej fałszywe porażki (quick).
- Zadanie zmienia tylko testy; ujawniona wada serwera to zgłoszenie do użytkownika przed poprawką, bo wyszłaby poza scope.
- Minimum to 3 osoby: `drawing(3, "podrobka", false)`; 6 osób zapełnia pokój, więc obserwator przy komplecie to `viewFor`.

## Tests (write first)
- Pisanie ma 30 s, a szkic ani cudze zatwierdzenie nie odnawiają czasu.
- Głosowanie ma 60 s, a cudzy głos nie odnawia czasu; odsłona ma 15 s; po końcu brak limitu.
- Limit pisania przy kilku czekających zatwierdza szkice raz i przechodzi do głosowania; limit z pustym szkicem anuluje rundę.
- Limit głosowania z częścią głosów nalicza punkty dokładnie raz; limit odsłony otwiera kolejną rundę z pełnym czasem.
- Komplet timeoutów przechodzi sześć rund i kończy partię remisem bez wpisu zwycięzcy.
- Wiadomość `room` dla gracza, Podróbki, obserwatora (3 graczy) i `viewFor` obcego id (6 graczy) nie zawiera roli, cudzego szkicu, cudzego głosu ani pytania Podróbki przed odsłoną.
- Ruch klienta z polem `source: "timeout"` i pustą odpowiedzią odpada.
- Wyraźna wygrana zapisuje `record("podrobka", ...)` raz, `places` i punkty wieczoru są w `RoomView`, po końcu stary ruch nic nie zmienia.
- Wyjście gracza kończy partię bez kontynuacji z nowym składem i bez zwycięzcy przy dwóch pozostałych.
- Rewanż ma nowy `nonce`, a ruch ze starym stemplem odpada.

## Steps
- Dodać `describe("Podróbka w pokoju")` z pomocnikami lokalnymi dla bloku.
- Napisać testy limitów na sztucznym zegarze.
- Napisać testy prywatności na `JSON.stringify` wysłanych wiadomości, nie tylko na `view`.
- Napisać testy końca, zapisu, wyjścia i rewanżu.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter server exec vitest run src/LobbyRoom.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

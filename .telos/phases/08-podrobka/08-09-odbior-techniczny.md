---
id: 08-09
title: "Odbiór techniczny 3 i 6 graczy"
type: audit          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
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
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Każdy punkt listy z ZASADY §6 oraz prywatność WebSocket i układ 360×640 są w Result zaliczone z dowodem.
- [ ] Niezaliczony punkt ma w Result jawną decyzję użytkownika o odstępstwie; brak takiej decyzji oznacza, że zadanie nie jest ukończone.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

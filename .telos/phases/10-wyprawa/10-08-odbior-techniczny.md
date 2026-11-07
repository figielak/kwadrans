---
id: 10-08
title: "Odbiór techniczny 2 i 6 graczy"
type: audit          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
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
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Każdy punkt listy z ZASADY §6 oraz prywatność WebSocket i układ 360×640 są w Result zaliczone z dowodem.
- [ ] Niezaliczony punkt ma w Result jawną decyzję użytkownika o odstępstwie; brak takiej decyzji oznacza, że zadanie nie jest ukończone.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

---
id: 07-20
title: "Etap 3: karty głosowania po partii"
type: code
status: done
critical: false
effort: normal
depends: [07-19]
decisions: [D-11]
scope: ["apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/games/KampusTour.tsx", "apps/web/src/games/KampusSummary.tsx", "apps/web/src/screens/tables.test.tsx", "apps/web/src/index.css", "DESIGN.md"]
---
## Goal
Po partii „Rewanż” i „Inna gra” stoją obok siebie, a głosowanie to duże karty z wynikiem na żywo.

## Read first
- apps/web/src/screens/Game.tsx:541-586 (OverActions)
- apps/web/src/screens/Lobby.tsx:297-336 (ICONS)
- apps/web/src/games/KampusSummary.tsx:20-50
- DESIGN.md §1
- ZASADY.md §4

## Files
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/games/KampusTour.tsx (modify)
- apps/web/src/games/KampusSummary.tsx (modify)
- apps/web/src/screens/tables.test.tsx (modify)
- apps/web/src/index.css (modify)
- DESIGN.md (modify)

## Constraints
- Karty z ikoną gry, nazwą i kropkami głosujących, pola min. 48 px, kolor gracza dla głosu.
- Głosowanie w `OverActions` działa wszędzie, także w poziomym podsumowaniu Kampus Tour; tam karty w jednym rzędzie.
- „Do lobby” mała akcja tylko u gospodarza. Solo bez zmian: „Jeszcze raz” i „Wyjdź”.
- Obserwator widzi karty bez dotyku, z tekstem „Głosują gracze”.
- Wyścig z rewanżem: po starcie głosowania rewanż znika.

## Tests (write first)
- `tables.test.tsx`: `VoteCards` z głosami, własnym wyborem, obserwatorem i trzema opcjami
- `tables.test.tsx`: `OverActions` u gościa bez „Do lobby”, u gospodarza z nim, solo bez głosowania

## Steps
- Testy renderu.
- `ui.tsx`: `VoteCards` z licznikiem czasu.
- `Game.tsx`: `OverActions`.
- Kampus Tour i `/dev?n=2`, `?n=6`, 360×640.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/screens/tables.test.tsx` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] Odbiór w `/dev?n=3`: od końca partii przez głos do 3-2-1 w nowej grze

## Result
`VoteCards` (ui.tsx): trzy karty w rzędzie z ikoną, nazwą, kropkami głosujących i licznikiem sekund; własny wybór z obrysem w moim kolorze, obserwator bez dotyku z napisem „Głosują gracze”.
`OverActions` (Game.tsx, teraz eksportowane): Rewanż i Inna gra obok siebie, „Do lobby” tylko u gospodarza, w głosowaniu rewanż znika; solo bez zmian. Kampus Tour dostał zawijający się pasek akcji; DESIGN.md opisuje układ.
Testy: 7 nowych w tables.test.tsx (48 w pliku); razem 2367 + 165 + 357 PASS. Test stubuje `location` przez `vi.hoisted`, bo Game.tsx importuje net.ts.
Odbiór ręczny w `/dev` na 3 graczach, 360×640: koniec Stopera, głos, Dziesiątki z instrukcją i odliczaniem. Kampus Tour i `?n=6` nie sprawdzone ręcznie.
Deviations: none

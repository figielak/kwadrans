---
id: 07-23
title: "Etap 3: odbiór całego wieczoru"
type: code
status: done
critical: false
effort: normal
depends: [07-20, 07-21, 07-22]
decisions: [D-08]
scope: ["apps/web/src/screens/Lobby.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Evening.tsx", "apps/web/src/index.css", "apps/web/src/screens/evening.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Cały wieczór w pokoju działa na telefonie: lobby, seria partii, głosowanie, tabela i podsumowanie.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §6
- .planning/ATRAKCYJNOSC-PLAN.md §10

## Files
- apps/web/src/screens/Lobby.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Evening.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/screens/evening.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Lekcja 05-09: 360×640, 1, 2 i 6 graczy, długie nicki, obserwator.
- Lekcje [tests]: drugi origin w Playwright, limit 3 pokoi zeruje restart serwera.
- Testy tylko rozszerzać. Tylko poprawki odbioru.

## Tests (write first)
- `evening.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Rozegraj w `/dev?n=3` serię: mini-gra, rewanż, głos, gra główna, Szybka seria, wyjście.
- Reconnect w głosowaniu i odświeżenie po partii.
- `prefers-reduced-motion`, układ i dokumenty.
- Zapisz w Result przebieg i pozostałe rozbieżności.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Lobby, wyniki i podsumowanie sprawdzone na 360×640 z 1, 2 i 6 graczami oraz obserwatorem

## Result
Przebieg w `/dev` (360×640), 6 graczy: Dziesiątki, rewanż, głosowanie (z odświeżeniem w trakcie: karty i głosy wróciły), Tabela Schultego z wynikami, „Do lobby”, wyjście gracza (podsumowanie: mistrz, tabela 6 osób, tytuły, Udostępnij), Szybka seria (start i odświeżenie w intro wracają do gry). 1 gracz: lobby z dużym kodem. Obserwator: Chińczyk 2 z 3 osób, ekran ustawień i gra z „Oglądasz”, bez poziomego przewijania.
Jedna poprawka: trzy przyciski po partii w jednym rzędzie ucinały napisy („Re…”), więc „Do lobby” jest małą akcją pod rzędem Rewanż / Inna gra (Game.tsx; DESIGN.md, ZASADY.md). Błędów logiki nie znaleziono, więc evening.test.ts bez zmian. Nowych animacji nie dodano, więc `prefers-reduced-motion` bez zmian.
Rozbieżności: nie obejrzano ekranu głosowania ani wyników u obserwatora (Chińczyk trwa zbyt długo; pokrywają to testy renderu), długich nicków (dev ma stałe) ani układu z 2 graczami w tym przebiegu (sprawdzony w 07-21). Po „Do lobby” gospodarz ląduje na liście ostatnio granej mini-gry (stare zachowanie, gameId zostaje).
Testy: 2367 + 171 + 364 PASS, build OK.
Uzupełnienie odbioru po `/telos:check` (2026-11-06): rzeczywisty obserwator w pokoju `/dev?n=6` widzi wyniki Stopera i trzy nieklikalne karty głosowania z „Głosują gracze”, bez przewijania w bok. Rzeczywista partia dla 2 osób z nickami „Aleksandra Nowak” i „Maksymilian Lis”: dwie gry Stopera, rewanż, tabela wieczoru i wyjście do podsumowania; wyniki i podsumowanie czytelne na 360×640. Problem zasłaniania gier w lobby poprawiony i ponownie odebrany w 07-21, również z 6 długimi nickami w renderze `Lobby`.
Deviations: none

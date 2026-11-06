---
id: 07-10
title: "Etap 2: gotowość i 3-2-1 na ekranie instrukcji"
type: code
status: done
critical: false
effort: normal
depends: [07-09]
decisions: [D-02]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/intro.ts", "apps/web/src/screens/intro.test.ts", "apps/web/src/index.css", "DESIGN.md", "ZASADY.md"]
---
## Goal
Ekran instrukcji pokazuje gotowość graczy i duże 3-2-1, a gra rusza u wszystkich, gdy serwer zamknie instrukcję.

## Read first
- apps/web/src/screens/ui.tsx:411-490 (IntroContext, Intro)
- apps/web/src/screens/Game.tsx:234-239 (kontekst instrukcji)
- DESIGN.md §3.3
- ZASADY.md §5

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/intro.ts (modify)
- apps/web/src/screens/intro.test.ts (modify)
- apps/web/src/index.css (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Przy 2+ grających klient nie woła `onStart` po własnym „Start”; pomiar zaczyna się po `intro: false` (istniejąca ścieżka w `Intro`).
- Obserwator nie ma „Start”: widzi gotowość i odliczanie, potem przebieg partii.
- „Już gra” znika, bo nikt nie gra osobno; zostaje „gotowy” i „czyta zasady”.
- Lekcja 05-35: liczba 3-2-1 używa istniejącego `stone-pop`, nowy keyframe tylko z wpisem w ZASADY §5.
- Odliczanie to nie pomiar, ale jego koniec nie może przesunąć bodźca: po `intro: false` gra startuje jak dziś.

## Tests (write first)
- `introStage`: gracz bez `begin` → czyta; z `begin` → gotowy; `countdown` → odliczanie; solo → zawsze czyta do własnego „Start”
- `introStage`: obserwator nigdy nie ma stanu „czyta” z przyciskiem
- `introStage`: odświeżenie w odliczaniu → odliczanie, po zamknięciu instrukcji → brak auto-startu bez wcześniejszego `live`

## Steps
- `intro.test.ts`, `intro.ts`: `introStage({ seated, solo, began, countdown, intro })`.
- `Game.tsx`: `seated` i `countdown` w kontekście.
- `Intro`: „Start” → „Gotowy”, lista gotowości, duże 3-2-1 z `msLeft`.
- Sprawdź `/dev?n=2` i `?n=6`, reconnect w odliczaniu i `prefers-reduced-motion`; DESIGN §3.3.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/screens/intro.test.ts` → exit 0
- [x] `pnpm --filter web exec vitest run src/animations.test.ts` → exit 0
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] Odbiór w `/dev?n=3`: gra rusza u wszystkich po 3-2-1

## Result
Ekran instrukcji pokazuje „Gotowy” (2+ grających) albo „Start” (solo), listę „gotowy / czyta zasady” i duże 3-2-1 (`intro-count` na `stone-pop`), a `onStart` przy 2+ grających woła dopiero zamknięcie instrukcji przez serwer.
`introStage` i `startsAfterClose` w `intro.ts`; `seated`, `me`, `myNick`, `myColor` w `IntroContext`. 12 testów w `intro.test.ts`, `pnpm test` zielony.
Odbiór w `/dev?n=3` (Liczenie): trzy ramki odliczają równo i startują razem. Test a11y kotwiczy się na `room.others.map`, więc własny wiersz listy jest za mapą.
Deviations: none

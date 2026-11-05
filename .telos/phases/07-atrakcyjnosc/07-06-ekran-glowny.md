---
id: 07-06
title: "Etap 1: znajomi na górze ekranu głównego"
type: code
status: approved
critical: false
effort: normal
depends: []
decisions: [D-01]
scope: ["apps/web/src/screens/Home.tsx", "apps/web/src/hierarchy.test.ts", "KONCEPT.md", "DESIGN.md"]
---
## Goal
Ekran główny zaprasza do gry ze znajomymi: sekcja „Ze znajomymi” jest na górze, a „Utwórz pokój” to jedyny wypełniony przycisk.

## Read first
- apps/web/src/screens/Home.tsx:143-218 (sekcja Sam)
- apps/web/src/screens/Home.tsx:218-275 (znajomi)
- apps/web/src/hierarchy.test.ts:10-13 (F4-066)
- KONCEPT.md §1
- DESIGN.md §3.1

## Files
- apps/web/src/screens/Home.tsx (modify)
- apps/web/src/hierarchy.test.ts (modify)
- KONCEPT.md (modify)
- DESIGN.md (modify)

## Constraints
- Po pełnym kodzie wypełnienie przechodzi na „Dołącz”, a „Utwórz pokój” ma obrys. „Zagraj” przy wyzwaniu zawsze obrys.
- Stary test F4-066 i DESIGN §3.1 zmieniają się razem z KONCEPT §1, przed kodem, bo zmienia się sama zasada.
- Odwrotna kolejność przy `/?kod=` traci sens, usuń ją razem z warunkiem.
- Ekran mieści się na 360×640: „Utwórz pokój” widoczny bez przewijania.

## Tests (write first)
- bez kodu jedyny `btn-primary` to „Utwórz pokój”, a po pełnym kodzie „Dołącz”
- „Zagraj” nigdy nie ma `btn-primary`
- sekcja `friends` stoi przed `solo`, także przy wejściu z linku

## Steps
- KONCEPT §1, DESIGN §3.1, `hierarchy.test.ts`.
- `Home.tsx`: kolejność sekcji i klasy przycisków, skrócenie karty znajomych.
- Sprawdź 360×640 z nickiem, ostatnimi pokojami i długą nazwą wyzwania.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/hierarchy.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

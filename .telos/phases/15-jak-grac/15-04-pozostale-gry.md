---
id: 15-04
title: "Karty siedmiu starszych gier głównych"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-01]         # task IDs, e.g. [01-01]
decisions: [D-04, D-05]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/screens/howToPlay.ts", "apps/web/src/screens/howToPlay.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dopisać karty Gomoku, Statków, Chińczyka, Memory, Kalamburów, Labiryntu i Państw-miast.

## Read first
- ZASADY-GIER.md §2 Gomoku
- ZASADY-GIER.md §3 Statki
- ZASADY-GIER.md §4 Chińczyk
- ZASADY-GIER.md §5 Państwa-miasta
- ZASADY-GIER.md §7 Memory
- ZASADY-GIER.md §9 Kalambury
- ZASADY-GIER.md §10 Labirynt
- apps/web/src/screens/howToPlay.ts (układ z 15-01)

## Files
- apps/web/src/screens/howToPlay.ts (modify)
- apps/web/src/screens/howToPlay.test.ts (modify)

## Constraints
- Ten sam układ i limit 900 znaków co w 15-01.
- Tryb opisujemy tylko, gdy zmienia zasady (np. Szybki Chińczyk). Tryby Statków, Memory i Labiryntu zmieniają liczby, które pokazuje już `hint` w `Setup`.
- Klucze to `id` z `GAMES`, np. `piec-w-rzedzie`, `panstwa-miasta`, nie nazwy z UI.
- Liczby ze stałych, gdy gra je eksportuje w `index.ts`; bez dopisywania nowych eksportów do `packages/games`.
- Kalambury i Państwa-miasta: karta wyjaśnia limit per faza i głosowanie, bo to w tych grach budzi najwięcej pytań.

## Tests (write first)
- Każda z siedmiu gier ma kartę spełniającą te same reguły kształtu, długości i zakazanych słów co w 15-01.
- Karta `chinczyk` opisuje tryb Szybki.
- Karta `statki` mówi, że trafienie daje kolejny strzał.
- Karta `labirynt` mówi o wyborze między krokiem a ścianką.

## Steps
- Rozszerzyć testy listą siedmiu `id` i potwierdzić, że są czerwone.
- Dopisać karty, po jednej sekcji `ZASADY-GIER.md` naraz.
- Porównać każdą kartę z jej sekcją i z `BLURBS`, żeby się nie wykluczały.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm --filter web exec vitest run src/screens/howToPlay.test.ts` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

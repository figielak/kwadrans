---
id: 10-01
title: Zasady Wyprawy w dokumentach
type: doc          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: []         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["ZASADY-GIER.md", "KONCEPT.md", "ZASADY.md"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Opisać Wyprawę w dokumentach będących źródłem prawdy, zanim powstanie test: pełna sekcja zasad, wiersz katalogu i wibracje.

## Read first
- .planning/WYPRAWA-PLAN.md:7-74 (zasady, timeouty, granica czasu)
- ZASADY.md:7-41 (co ustalić przed pierwszym plikiem)
- ZASADY.md:310-323 (tabela wibracji)
- ZASADY.md:326-337 (podpięcie, nieaktualne `OWN_RANKING` w punkcie 5)
- ZASADY-GIER.md:7-19 (tabela gier głównych)
- ZASADY-GIER.md §11. Sabotaż (ostatnia sekcja, §12 stoi za nią)
- KONCEPT.md:64-76 (katalog gier głównych)

## Files
- ZASADY-GIER.md (modify)
- KONCEPT.md (modify)
- ZASADY.md (modify)

## Constraints
- D-01: treść zasad dokładnie z planu, bez ról, walki, ekwipunku i reliktów. Własny wariant, bez nazw i motywów istniejących gier.
- Wszystkie liczby jako nazwane stałe, bez „około”. Polskie teksty bez em-dashy.
- `OWN_RANKING` już nie istnieje (zabraniają go `tables.test.tsx` i `lists.test.ts`): ZASADY §6 pkt 5 ma wskazywać `ResultDetails`, plan w tym miejscu jest nieaktualny.
- Czas do UI ustali próba z ludźmi (10-09): dokumenty podają tylko górną granicę 2060 s, bez obietnicy typowej długości partii.
- [docs] Słowa UI aktualizujemy razem z zasadami (05-01): „Idę dalej”, „Wracam”, „Gotowe”, „Dalej”.

## Steps
- ZASADY-GIER.md: wiersz tabeli `wyprawa`, 2-6, „20 s decyzja, 15 s odsłona”, typ równoczesna, ukryty stan.
- ZASADY-GIER.md: `## 12. Wyprawa (`wyprawa`)` z talią, przebiegiem, podziałem i przykładem 5 → 9/6/1, końcami wyprawy, pustą talią, timeoutami, granicą 2060 s, remisami i ukrywaniem.
- ZASADY-GIER.md: lokalny wybór bez „Gotowe” nie jest ruchem, więc po limicie liczy się „Wracam”.
- KONCEPT.md §2.2: wiersz katalogu gier.
- ZASADY.md §5: wpis, że nowa decyzja wibruje `turn` raz na odkrycie, gotowość „Dalej” w odsłonie ma tę samą zwykłą wibrację nowej decyzji, a zagrożenie i utrata zdobyczy nie wywołują dodatkowej wibracji (`mistake`, `harm`); §6 pkt 5: `ResultDetails` zamiast `OWN_RANKING`.

## Acceptance
- [ ] `grep -q "^## 12. Wyprawa" ZASADY-GIER.md` → exit 0
- [ ] `grep -q "wyprawa" KONCEPT.md` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] Sekcja odpowiada na wszystkie pytania z ZASADY §1, także „co widzi czekający i obserwator”.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

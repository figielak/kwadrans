---
id: 08-01
title: "Zasady Podróbki w dokumentach"
type: doc          # code | doc | audit
status: draft       # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: []         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["ZASADY-GIER.md", "KONCEPT.md", "ZASADY.md"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Opisać Podróbkę w dokumentach będących źródłem prawdy, zanim powstanie test: pełna sekcja zasad, wiersz katalogu i wibracje.

## Read first
- .planning/PODROBKA-PLAN.md:9-125 (pomysł, losowanie, fazy, punktacja, pytania)
- .planning/PODROBKA-PLAN.md:149-158 (granica prywatności puli, reload, wyjście)
- ZASADY.md:7-41 (co ustalić przed pierwszym plikiem)
- ZASADY.md:310-326 (tabela i wpisy wibracji)
- ZASADY-GIER.md:7-19 (tabela gier głównych)
- ZASADY-GIER.md §12. Wyprawa (ostatnia sekcja, §13 stoi za nią)
- KONCEPT.md §1 Założenia (limity miejsc, wzmianka o Sabotażu 3-6)
- KONCEPT.md §2.2 Pozostałe gry główne

## Files
- ZASADY-GIER.md (modify)
- KONCEPT.md (modify)
- ZASADY.md (modify)

## Constraints
- D-01: treść zasad dokładnie z planu, bez czatu, głosu, własnych pytań, AI, drużyn, trybów, eliminacji i integracji z turniejem. Nic poza planem nie staje się zasadą.
- Wszystkie liczby jako nazwane stałe: `ROUNDS = 6`, `WRITE_SECONDS = 30`, `VOTE_SECONDS = 60`, `SUMMARY_SECONDS = 15`, `ANSWER_MAX = 30`.
- Limit partii podany jako górna granica 615 s, bez obietnicy typowej długości; opóźnienia sieci i pracy serwera poza nią.
- Pula nie jest sekretem (plan §5): dokument obiecuje tylko niewysyłanie przydziału, cudzych szkiców i głosów.
- [docs] Słowa UI aktualizujemy razem z zasadami (05-01): „Gotowe”, „Dalej”, „Czekamy na”, „Brak odpowiedzi: …”, „Podróbka”.
- Polskie teksty bez em-dashy.

## Steps
- ZASADY-GIER.md: wiersz tabeli `podrobka`, 3-6, „30 s odpowiedź, 60 s głos, 15 s odsłona”, typ równoczesna, ukryty stan.
- ZASADY-GIER.md: `## 13. Podróbka (`podrobka`)` z losowaniem, fazami, normalizacją tekstu, anulowaniem rundy, definicją wykrycia, punktacją 2/3, remisami, widokami i timeoutami.
- ZASADY-GIER.md: lokalny wybór i niewysłany szkic nie są ruchem; po limicie liczy się ostatni zapisany szkic albo wstrzymanie głosu.
- KONCEPT.md: wiersz katalogu w §2.2 i wzmianka w §1, że Podróbka ma 3-6 miejsc.
- ZASADY.md §5: nowa faza to raz zwykła wibracja `turn`, nietrafiony głos i wykrycie bez `mistake` i `harm`.

## Acceptance
- [ ] `grep -q "^## 13. Podróbka" ZASADY-GIER.md` → exit 0
- [ ] `grep -q "podrobka" KONCEPT.md` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] Sekcja odpowiada na wszystkie pytania z ZASADY §1, także „co widzi czekający i obserwator”.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

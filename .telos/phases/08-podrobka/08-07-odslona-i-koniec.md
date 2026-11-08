---
id: 08-07
title: "Odsłona, historia i ekran końcowy"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-06]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/games/Podrobka.tsx", "apps/web/src/games/Podrobka.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Dodać odsłonę rundy i ekran końcowy z historią, tak by każdy widział oba pytania, głosy, uzasadnienie wyniku i punkty.

## Read first
- ZASADY.md:212-215 (słownik „Dalej”, „Czekamy na”)
- DESIGN.md:131-140 (wynik po partii)
- .planning/PODROBKA-PLAN.md:79-103 (odsłona, punktacja, koniec)
- apps/web/src/screens/ui.tsx:444-460 (ResultDetails)
- apps/web/src/screens/ui.tsx:897-910 (useFresh)
- apps/web/src/screens/results.ts:49-60 (heroResult)

## Files
- apps/web/src/games/Podrobka.tsx (modify)
- apps/web/src/games/Podrobka.test.tsx (modify)

## Constraints
- Odsłona i koniec rysują się wyłącznie ze stanu widoku, także dla `me=""` (05-33).
- `over` jest bez limitu i bez „Dalej”; szósta runda nie ma `summary`, więc jej odsłona stoi na ekranie końcowym.
- Remis pokazuje wspólne miejsca z `places`, bez tie-breaka szybkością ani rolą.
- Anulowana runda ma oznaczenie i powód („Brak odpowiedzi: …”), nie samo zero.
- Odsłona dostępna od razu; ewentualne `card-in` 0,35 s i `float-up` 1,6 s tylko dla nowego stanu (`useFresh`), z reduced motion, bez powtórki po przeładowaniu. Animacja nie blokuje „Dalej”.
- Nietrafiony głos i wykrycie bez dodatkowej wibracji; ekran nie woła `navigator.vibrate`.
- Długa historia może przewijać się pionowo (ZASADY, plan §6); pełne nicki zawijane, liczby nieucięte (W2 z 10-08).
- Cele 48 px, tylko tokeny, bez em-dashy.

## Tests (write first)
- Odsłona pokazuje oba pytania, kto miał inne, wszystkie odpowiedzi i głosy, przyrost punktów i sumy.
- Uzasadnienie wyniku jest inne dla: wykrycia, remisu na prowadzeniu, niewinnego lidera, pojedynczego głosu i wstrzymań.
- Anulowana runda pokazuje powód z nickami i brak głosowania.
- „Dalej” wysyła `next` ze stemplem; po nim przycisk znika. Obserwator widzi odsłonę bez „Dalej”.
- Koniec pokazuje ranking, tabelę sześciu rund i rozwijaną historię, bez „Dalej”, także dla `me=""`.
- Ekran końcowy zawiera odsłonę szóstej rundy.
- Remis na górze daje te same miejsca i nie wskazuje zwycięzcy.
- Widok w `summary` nie zawiera przyszłych par.

## Steps
- Napisać testy na widokach z prawdziwych ruchów.
- Zastąpić stub `summary` odsłoną z uzasadnieniem i tabelą punktów.
- Zastąpić stub `over` rankingiem, tabelą rund i historią.
- Dodać animacje nowego stanu przez `useFresh`.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/games/Podrobka.test.tsx src/tokens.test.ts src/states.test.ts src/animations.test.ts` → exit 0
- [x] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->
Zastąpiono stub `summary` i `over` w `Podrobka.tsx`: `verdict` (uzasadnienie: wykrycie, remis na prowadzeniu, niewinny lider, za mało głosów, wszyscy wstrzymani, anulowanie z nickami), `RoundReveal` (oba pytania, kto miał inne, wiersze z odpowiedzią, głosem, przyrostem i sumą), `NextBar` („Dalej” albo „Czekamy na: …”) i `Final` (ranking z miejscami z `places` albo z sum, tabela sześciu rund z oznaczeniem anulowanych, odsłona szóstej rundy, rozwijana historia). Animacje tylko `card-in` 0,35 s i `float-up` 1,6 s, tylko dla nowej odsłony przez `useFresh`.
RED: `pnpm --filter web exec vitest run src/games/Podrobka.test.tsx` → 22 czerwone na stubie ("Odsłona rundy." zamiast odsłony) i brakujących eksportach. Teraz `Podrobka.test.tsx` 56/56, pakiet web 548/548, typecheck zielony. Poprawki w moich testach po pierwszym uruchomieniu: brak stałej `FOUR`; błędne oczekiwanie +0 zamiast +2 w scenariuszu remisu (głos na Podróbkę zawsze daje 2). Poza testami: ikona `Mask` nie istnieje w Phosphor (użyto `MaskHappy`), a `a11y.test.ts` wymusił `role="img"` na znaczniku anulowanej rundy.
Nie sprawdzone tu, do 08-09: wygląd odsłony i długiej historii na 360×640 z 6 graczami i 16-znakowymi nickami w przeglądarce oraz faktyczne odtwarzanie `card-in` i `float-up` przy reduced motion. Ekran nadal niepodpięty w `Game.tsx` (08-08), więc `places` i bohatera wyniku da dopiero podpięcie.
Deviations: none

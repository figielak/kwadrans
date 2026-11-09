---
id: 16-01
title: Zasady Kropek i kresek w dokumentach
type: doc          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: []         # task IDs, e.g. [01-01]
decisions: [D-01, D-02]       # phase-local, e.g. [D-03]
scope: ["ZASADY-GIER.md", "KONCEPT.md"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zapisać komplet zasad Kropek i kresek, zanim powstanie test: tabela i sekcja §14 w `ZASADY-GIER.md` oraz katalog w `KONCEPT.md`.

## Read first
- ZASADY.md:7-41 (co ustalić przed grą)
- ZASADY.md:89-98 (timeout, remis, kto zaczyna)
- ZASADY-GIER.md:6-18 (tabela gier)
- ZASADY-GIER.md:678-683 (zwięzły wzór sekcji gry po kolei)
- KONCEPT.md §1 Założenia (limity miejsc)
- KONCEPT.md §2.2 Pozostałe gry główne

## Files
- ZASADY-GIER.md (modify)
- KONCEPT.md (modify)

## Constraints
- D-01: 2-4 graczy. D-02: tryby `mala` 3×3, `srednia` 5×5 (domyślny), `duza` 7×7; rozmiar liczy kwadraty, kropek jest o jeden więcej na bok.
- Tryb zmienia tylko rozmiar; nieznany lub brak to `srednia`, rewanż gra w tym samym, ranking wspólny dla trybów (ZASADY §1).
- Wszystkie liczby jako nazwane stałe; teksty bez em-dashy.

## Steps
- Dodać wiersz tabeli: `Kropki i kreski | kropki-i-kreski | 2-4 | 60 s | po kolei`.
- Dopisać §14 z tabelą trybów i przebiegiem: zaczyna `players[0]`, ruch to jedna wolna kreska między sąsiednimi kropkami.
- Zapisać punktację: kreska zamykająca 1 lub 2 kwadraty daje tyle punktów i obowiązkowy kolejny ruch tej samej osoby; kreska bez kwadratu oddaje ruch następnej.
- Zapisać koniec: ostatnia kreska kończy partię bez kolejnego ruchu; wygrywa najwięcej kwadratów, remis na szczycie bez zwycięzcy, `places` z remisami. Przy 2 osobach nieparzysta liczba kwadratów wyklucza remis.
- Zapisać resztę: brak ukrytych danych, limit 60 s, timeout to losowa wolna kreska, numerację kresek (poziome `y*n+x`, potem pionowe `n*(n+1)+y*(n+1)+x`, `n` to rozmiar) i ekran w pionie z wyborem i potwierdzeniem.
- W `KONCEPT.md` dopisać grę do listy limitów 2-4 w §1 i wiersz w §2.2.

## Acceptance
- [ ] `grep -q "## 14. Kropki i kreski" ZASADY-GIER.md` → exit 0
- [ ] `grep -q "kropki-i-kreski" KONCEPT.md` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

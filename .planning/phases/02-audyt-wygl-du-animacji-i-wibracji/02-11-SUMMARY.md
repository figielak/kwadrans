---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 11
subsystem: web
tags: [audyt, scalenie, findings, macierz-sytuacji, wygląd, animacje, wibracje]

requires: ["02-01", "02-02", "02-03", "02-04", "02-05", "02-06", "02-07", "02-08", "02-09", "02-10"]
provides:
  - "FINDINGS.md: jeden plik fazy 2 dla ekranów platformy, 38 gier i Turnieju; 102 wpisy (4 wysokie, 27 średnich, 71 niskich), 300 wystąpień; 37 wpisów zbiorczych U1-U37, macierz sytuacji z 17 wpisami A1-A17, odstępstwa z powodem, propozycje do ZASADY.md §4/§5 i DESIGN.md, sekcje ekranów i gier, tabela kryterium / wymaganie → sekcja"
affects: [04]

actuals:
  tasks: 4
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Macierz sytuacji w blokach według rodzin gier (wiersz = sytuacja, kolumna = gra), pod nią tabela „wariant dominujący → gry odstające” i tabela słów w tej samej roli"
    - "Wpisy zbiorcze U1-U37 i wpisy z macierzy A1-A17 zachowują identyfikatory wpisów częściowych (GM-1, KT10, SQ2…); w fazie 4 cytowane z prefiksem F2:, bo część identyfikatorów ma w fazie 1 inne znaczenie"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-11-SUMMARY.md
  modified:
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md

key-decisions:
  - "Waga 360×640 według ekranu: ekran partii wysoka (U1), ekran podsumowania z akcją w StickyBar średnia (U3), listy poza partią niska (HM-8, błąd opisu w DESIGN.md §6)"
  - "C8 (Chińczyk) i KA1 (Kampus Tour) scalone w U2 `akcja-po-animacji` (wysoka); oba mają powód, którego §5 nie przewiduje, decyzja w fazie 4"
  - "Duble: GM-2 = KT12 (pasek limitu Kampus Tour, U8), GM-4 = M5 (licznik par Memory, U12)"
  - "Podniesione do średniej dla jednej wagi we wpisie zbiorczym: ZK4 (U6), PM8 (U8), PM9 (U7), PM13 (A10), PM14 (A7); SQ1 i SJ1 (`accent-fg`) zostają niskie, bo wartość tokenu jest identyczna"
  - "Nowe w 02-11: WP5 (W pamięci ma ten sam kafel z polem i `max-w-[calc(100dvh-23.5rem)]` co SZ1, dopisane do U1), A17 („Gotowe” w trzech rolach), ocena MiniGame.tsx (bez rozbieżności)"
  - "Bez dubli z fazą 1; styk opisany w §5.0 (F1:ZK1 i F2:ZK1 w tej samej funkcji, F1:SQ1 i A6, F1:Z13/Z15 i U10, F1:W2 i U3, numeracja miejsc turnieju to F1:Z18)"

requirements-completed: [UI-01, UI-02, UI-03, UI-04, UI-05, ANIM-01, ANIM-02, ANIM-03]

coverage:
  - id: D1
    description: "Macierz sytuacji między grami: kolumna dla każdej gry z GAMES i Turnieju, wariant dominujący każdego wiersza, gry odstające z plik:linia, słowa w tej samej roli"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "FINDINGS.md §4 (4.1-4.10); grep „Macierz sytuacji”"
        status: pass
    human_judgment: false
  - id: D2
    description: "Wpisy zbiorcze bez duplikatów, wagi ujednolicone wg D-07, odsyłacze do fazy 1"
    requirement: UI-01
    verification:
      - kind: other
        ref: "FINDINGS.md §5 (U3-U37, §5.0); grep -c zbiorcze = 58"
        status: pass
    human_judgment: false
  - id: D3
    description: "FINDINGS.md z sekcjami (1)-(9) i tabelą kryteriów; każde id z GAMES, `turniej` i każdy plik screens/ wspomniany"
    requirement: UI-05
    verification:
      - kind: other
        ref: "pętla z planu po `packages/games/src/index.ts` (pusto), pętla po `apps/web/src/screens` (pusto), grep em-dash (0)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Tabela 5 kryteriów i 8 wymagań → sekcja, bez pustych wierszy"
    requirement: ANIM-03
    verification:
      - kind: other
        ref: "FINDINGS.md §10; grep -c Kryterium = 6"
        status: pass
    human_judgment: false

duration: 70min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 11: porównanie między grami i scalenie Summary

**Jeden `FINDINGS.md` fazy 2: 102 wpisy (4 wysokie, 27 średnich, 71 niskich) zamiast ok. 250 wpisów częściowych, z macierzą sytuacji dla 38 gier, Turnieju i ekranów platformy. Wysokie: ekran partii ponad 640 px w 11 grach (U1), akcja dopiero po animacji w Chińczyku i Kampus Tour (U2), ucinany środek planszy Kampus Tour (KT10) i „Gotowe” w Zakupach na `onClick` w pomiarze remisu (ZK1). Macierz dała 17 wpisów „ta sama sytuacja inaczej” (A1-A17), najczęściej pomyłka bez znaku i wibracji, odsłona wyniku, ruch zignorowany i słowa przejścia dalej.**

## Accomplishments

- Macierz sytuacji (§4) w siedmiu blokach: gry główne turowe, fazy równoczesne z Turniejem, cztery rodziny mini-gier i ekrany platformy; pod nią wariant dominujący z grami odstającymi i tabela słów w tej samej roli.
- Wpisy zbiorcze U1-U37 (klucze robocze z planów ujednolicone, synonimy scalone) i odstępstwa z powodem zebrane w jedną listę (§6).
- Propozycje dopisania do `ZASADY.md` §4/§5 i `DESIGN.md` §2/§5/§6 w jednym miejscu (§7), do decyzji w fazie 4.
- Sekcje ekranów i 38 gier w kolejności `KONCEPT.md` §2 z oceną 360×640 każdej gry (§8); tabela kryteriów i wymagań (§10).

## Deviations from Plan

- Dodana sekcja 10 (tabela kryterium / wymaganie → sekcja) zamiast dopisku na końcu §9, żeby układ był jak w fazie 1.
- Dwa nowe wpisy znalezione przy scalaniu: WP5 (W pamięci z klawiaturą, ten sam układ co SZ1, sprawdzone w `WPamieci.tsx:126`, `:135-151`) i A17 („Gotowe” w trzech rolach, z tabeli słów). `MiniGame.tsx` nie miał oceny w żadnym planie; sprawdzony (bez rozbieżności).
- Macierz podzielona na bloki zamiast jednej tabeli z 39 kolumnami (czytelność); każda gra ma kolumnę.

## Verification

- `grep -n "Macierz sytuacji" FINDINGS.md` → `## 4. Macierz sytuacji między grami (kryterium 4)`.
- `grep -c "zbiorcze" FINDINGS.md` → 58.
- Pętla z planu po id z `packages/games/src/index.ts` i `turniej` → pusto; pętla po plikach `apps/web/src/screens` → pusto.
- `grep -c "Kryterium" FINDINGS.md` → 6; `grep -c "—" FINDINGS.md` → 0.
- `git status --porcelain | grep -v ' .planning/'` → 0 wierszy.

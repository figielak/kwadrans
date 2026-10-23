---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 03
subsystem: games
tags: [audyt, kampus-tour, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-03-FINDINGS.md: dwie sekcje Kampus Tour (plansza/pola/karty; tura/czynsz/budowa/wykupienie/dług), każda z Zasadami, Regułami §3 i Testami, wpisy K1-K20"
affects: [01-10]

actuals:
  tasks: 2
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty audytu poza repo (scratchpad): fuzz.ts (1200 losowych partii wszystkimi dozwolonymi ruchami, stan zamrożony, JSON round-trip, timeoutMove w każdej fazie), cases.ts (przypadki brzegowe do wpisów)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-03-FINDINGS.md
  modified: []

key-decisions:
  - "Budynki powyżej poziomu 2 po utracie kompletu (K11): waga średnia i kierunek „popraw dokument”, bo dokument milczy, a zmiana zachowania to decyzja balansu w fazie 3"
  - "timeoutMove w każdej fazie zaliczony przez index.test.ts:72-73 i :121 (D-04), choć testy gry porównują tylko ruch z oczekiwanym"
  - "Kurczenie waitingFor w fazie pick pokryte testem gry (kampus-tour.test.ts:995), mimo że 01-01 dawało N dla samego index.test.ts"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "Kampus Tour: plansza, pola i karty: stałe, 18 kart, pola specjalne, §3, tabela zasada → test"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura kampus-tour.ts i ZASADY-GIER.md §6 punkt po punkcie; cases.ts (K1, K2, K7, K8)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Kampus Tour: tura, czynsz, budowa, wykupienie, dług: stałe ↔ ZASADY-GIER §6 ↔ KONCEPT §9, §3, tabela zasada → test, testy obowiązkowe §2"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "fuzz.ts: 1200 partii, 0 błędów, 8 faz i 10 typów ruchów; cases.ts (K11-K15)"
        status: pass
    human_judgment: false

duration: 40min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 03: Kampus Tour Summary

**Kod Kampus Tour zgadza się z `ZASADY-GIER.md` §6 i `KONCEPT.md` §9 we wszystkich stałych i 18 kartach, a reguły §3 trzymają się we wszystkich fazach. Rozbieżności to zasady obecne tylko w kodzie (budynki po utracie kompletu, Juwenalia po wykupie, Zaliczenie u bankruta), błędna statystyka czynszu przy bankructwie i luki w testach.**

## Accomplishments

- Pełne porównanie stałych (plansza, grupy, ceny, czynsze, budowa, wykupienie, sprzedaż, Kolokwium, Juwenalia, MPK, 20 rund, monopol, remis, limit 60 s) i każdej karty z dokumentem: wszystko zgodne.
- Skrypt `fuzz.ts` uzupełnił 01-01 o fazy, do których same timeouty nie dochodzą (`build`, `buyout`, `sell`, `juwenalia`, `travel`): 0 błędów mutacji, JSON, `timeoutMove` i walidacji.
- Tabele „zasada → test” dla całej sekcji §6 (obie części) i tabela testów obowiązkowych §2.

## Wpisy (szczegóły w 01-03-FINDINGS.md)

- Wysokie: brak.
- Średnie: K7, K8 (brak testów: Zaliczenie + dublet, MPK bez dodatkowego rzutu), K11 (budynki poziomu 3-4 zostają po rozpadzie kompletu), K13, K14 (brak testów: brak wykupu po sprzedaży, bankructwo przy kilku wierzycielach i Juwenaliach), K16-K19 (zbiorcze: definicja i świeża gra, schemat, brzegi, mutacja i JSON).
- Niskie: K1 (Zaliczenie znika z talii przy bankructwie), K2 (Juwenalia po wykupie), K3, K4, K5 (opisy w KONCEPT i tabeli gier), K6 (własne tasowanie zamiast `shuffle`), K9, K10 (licznik Juwenaliów, widok obserwatora), K12 (statystyka czynszu przy bankructwie), K15 (zaokrąglenie sprzedaży), K20 (nieaktualny nagłówek testów).
- Klucze zbiorcze dla 01-10: `definicja-swieza-gra`, `schemat-smieci`, `brzegi`, `stan-mutacja-json`, `widok-obserwatora`.

## Deviations from Plan

- Wspólne luki §2 (K16-K19) opisane raz, w części drugiej; część pierwsza odsyła do nich, żeby nie dublować wpisów.
- Zasady specjalnych pól i kart zmapowane na testy w części pierwszej, a ich stałe (dublety, Kolokwium, Juwenalia, MPK) porównane w części drugiej, jak wymienia zadanie 2.

## Verification

- `grep -n "## Kampus Tour: …"` → oba nagłówki (:18, :171).
- `git status --porcelain | grep -v '^.. .planning/'` → 1 wiersz, `D .claude/CLAUDE.md`, był przed rozpoczęciem planu.
- Żadnego pliku skryptu w repo (skrypty w scratchpadzie sesji).

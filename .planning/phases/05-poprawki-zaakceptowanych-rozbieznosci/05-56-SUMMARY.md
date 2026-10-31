---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 56
status: complete
completed: 2026-10-31
packages: [P4-035]
---

# 05-56 SUMMARY: P4-035

- `kampus-tour.ts`: talia `shuffle(CARDS.map(...), rng)` z core zamiast własnej pętli; te same talie dla seedów 1-3 (strażnik).
- `kubki.ts`: lokalna funkcja zamian nazywa się `swapsFor` (nie zasłania `shuffle` z core); te same zamiany dla seedów 1-3 (strażnik).
- Koło zostaje bez `ranked` z zapisanym powodem (koniec po próbach wszystkich, test); trzy kopie szkieletu rund (Policz kropki, Kąt, Który rok?) zostają jawnie, powód w ZASADY-GIER §1. Bez nowej warstwy abstrakcji.
- TDD `33e148a`: testy-strażnicy, zielone przed i po zmianie (to refaktor, nie zmiana zachowania). Typy i testy gier, serwera i web PASS.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 54
status: complete
completed: 2026-10-31
packages: [P4-062]
---

# 05-54 SUMMARY: P4-062

- `panstwa-miasta.ts`: `LETTERS` = `ABCDEFGHIJKLMNOPRSTUWZ` (22 litery, bez Ł). Losowanie 5 różnych liter bez zmian.
- `fits` nadal traktuje Ł jako inną literę niż L; punktacja, głosowanie, limity i rewanż (`nonce`) bez zmian.
- TDD `cd9d00d` (1 test RED), testy bez zmian w implementacji. Typy, testy gier, serwera i web, build PASS.
- Do odbioru: start i rewanż w /dev z zachowaniem punktacji.

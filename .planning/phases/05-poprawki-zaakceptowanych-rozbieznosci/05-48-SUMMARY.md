---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 48
status: complete
completed: 2026-10-31
packages: [P4-055]
---

# 05-48 SUMMARY: P4-055

- `stoper.ts`: `TARGET_MS = 10_000`, `setup` zawsze daje ten cel; `nonce` nadal z `rng`, więc ten sam seed daje ten sam stan, a rewanż montuje grę od nowa.
- Wynik nadal w ms (0 do celu), timeout = cel. Stary stan z innym celem (np. 7000) przechodzi walidację, timeout i zapis po swoim celu; detail nie jest regenerowany.
- Opis w lobby: „Dotknij dokładnie po 10 sekundach”. Ekran gry bez zmian (czyta `view.target`); instrukcja w /dev pokazuje „10,00 s”.
- ZASADY-GIER i KONCEPT §2.4: stały cel, dawne partie 6-14 s zostają, historia łączy różne cele (ZG4-v1 §3.2).
- TDD `b2bd364` (2 testy RED, test starej partii jako strażnik). Typy, testy gier, serwera i web, build PASS.
- Do odbioru: partia 6 os., rekord i turniej z nowym celem; stara rekordowa partia na ekranie „Rekordy”.

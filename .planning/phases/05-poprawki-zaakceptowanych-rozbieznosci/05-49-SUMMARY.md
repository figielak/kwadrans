---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 49
status: complete
completed: 2026-10-31
packages: [P4-056]
---

# 05-49 SUMMARY: P4-056

- `rytm.ts`: stałe `BPM = 100`, `setup` daje `interval` 600 ms; `nonce` nadal z `rng`. Metronom 8 uderzeń, 10 s stukania i 15 oczekiwanych odstępów.
- Timeout = 600 ms. Stary stan z innym odstępem (np. 857) liczy wynik i taps po swoim odstępie; detail nie jest regenerowany.
- Ekran gry bez zmian (czyta `view.interval`, po partii „cel 100 BPM”).
- ZASADY-GIER i KONCEPT §2.4: stałe tempo, dawne partie 70-130 BPM zostają, historia łączy różne tempa (ZG4-v1 §3.2).
- TDD `1a4d7b8` (2 testy RED, test starej partii jako strażnik); w implementacji poprawiony tylko typ dostępu `taps?.[A]` w nowym teście (tsc), bez zmiany sprawdzenia. Typy, testy gier, serwera i web, build PASS.
- Do odbioru: partia z metronomem na telefonie (klik i wibracja), rekord i turniej; stara rekordowa partia na ekranie „Rekordy”.

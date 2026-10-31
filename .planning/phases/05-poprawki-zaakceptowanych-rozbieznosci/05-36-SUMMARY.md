---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 36
status: complete
completed: 2026-10-31
packages: [P4-038]
---

# 05-36 SUMMARY: P4-038

- Przyczyna: łapanie po kącie (10°) dawało przy środku tortu kilka px tolerancji, a przy brzegu kilkanaście; przy bliskich cięciach brało pierwsze w kącie, nie pod palcem.
- Poprawka: `grab(cuts, point, reach)` liczy odległość od odcinka cięcia (z rzutem na odcinek i końcem za brzegiem), zasięg 24 px przeliczony na jednostki viewBox z szerokości kafla; wybiera najbliższe. Dotknięcie poza zasięgiem nie rusza żadnego cięcia (stawia nowe, gdy brakuje). Martwa strefa przy środku (6 jednostek) bez zmian.
- TDD `5d05002`: 5 testów RED (brak funkcji) przed wdrożeniem.
- Typy, 2268 testów gier (1 SKIP), 45 serwera, 16 web, build PASS.
- Do odbioru: dotyk na prawdziwym telefonie przy 3-7 kawałkach, cięcia blisko siebie i blisko środka.

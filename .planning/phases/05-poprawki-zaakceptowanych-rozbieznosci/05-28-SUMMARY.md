---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 28
status: complete
completed: 2026-10-31
packages: [P4-028]
---

# 05-28 SUMMARY: P4-028

- `timeoutMove` Labiryntu: przekazany `rng` wybiera jeden z legalnych kroków (także przeskok i skos), zamiast zawsze najkrótszej drogi; ścianek po czasie nie stawia, `pass` tylko bez kroku.
- TDD `74f0c54`, poprawka `3f011a8` (Codex); przegląd diffu i ponowne uruchomienie: typy, 2033 testów gier i 45 serwera PASS.
- Do odbioru UI: /dev?n=2 Labirynt, przeczekanie limitu tury kilka razy.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 35
status: complete
completed: 2026-10-31
packages: [P4-041]
---

# 05-35 SUMMARY: P4-041

- ZASADY §5 ma katalog 14 keyframes z rolą i wszystkimi używanymi czasami; `set-glow` 0,9 s × 4 dopisany do tabeli czasów. Wyjątki opisane w katalogu: `stone-pop` 180 ms (W pamięci) i 0,5 s (nowa wygrana), `ring-pulse` 1 s w Chińczyku (ujednolicenie w P4-042), `line-draw` 2,5 s w podglądzie koła.
- index.css: komentarze nad każdym keyframes opisują wszystkie miejsca użycia; role `warning`/`success` jak w DESIGN §2.
- Test `animations.test.ts` (TDD `4c1b835`, RED: brak katalogu i komentarza nad `preview-quarter`) pilnuje zgodności nazw, komentarzy i czasów; przyszła zmiana czasu bez wpisu w katalogu nie przejdzie.
- Bez zmian w zachowaniu: same komentarze CSS i dokumentacja.
- Typy, 2268 testów gier (1 SKIP), 45 serwera, 11 web, build PASS.

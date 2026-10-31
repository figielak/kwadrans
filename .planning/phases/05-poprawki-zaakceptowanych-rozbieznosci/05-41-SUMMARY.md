---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 41
status: complete
completed: 2026-10-31
packages: [P4-044]
---

# 05-41 SUMMARY: P4-044

- Odsłona od razu (D4-078 A): Mapa bez `stone-pop` na pierścieniu prawdy; reszta gier z odsłoną już była bez animacji. Długość odsłony i moment pomiaru bez zmian.
- Znacznik prawdy neutralny (F4-126): pierścień Mapy i Środka, idealne cięcia Tortu `stroke-fg`; pierścień prawdziwego roku `border-fg` zamiast `success`. Odpowiedź gracza dalej w jego kolorze, ocena `grade` na linii błędu i liczbie. Policz kropki, Kąt, Odcień i Nożyczki bez zmian (prawda w tekście albo już neutralna).
- Litera Kalamburów (D4-106 B): bez animacji, jak było; zapisane jako wyjątek w ZASADY §5 i ZASADY-GIER §Kalambury.
- TDD `5a1c9ad` (5 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 51 web, build PASS.
- Do odbioru UI: Mapa, Środek, Tort, Który rok? w odsłonie, także z reduced motion. Odbiór przeglądarkowy nie był wykonany w tej sesji.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 59
status: complete
completed: 2026-10-31
packages: [P4-054]
---

# 05-59 SUMMARY: P4-054

- F4-020: KONCEPT §2.4 wymienia drugie kryterium W pamięci (odchyłka w rundzie z pomyłką).
- F4-024: tabela dodatków Kampus Tour: „stypendium, warunek, Zaliczenie w pierwszym terminie itp.” (karty „poprawka” nie ma).
- F4-025: KONCEPT §9 rozdziela talię Kart Dziekanatu (Kampus Tour, ustalona) od kart Poprawki (gra do zrobienia).
- F4-026: tabela gier: Kampus Tour „planszowa, po kolei (wybór postaci naraz)”.
- F4-035: nagłówek `kampus-tour.test.ts`: kieszonkowe 40 zł, sprzedaż za połowę wartości z budynkami, bez kompletu najwyżej poziom 2, majątek z budynkami i remis; nazwy dwóch testów poprawione. Asercje bez zmian.
- F4-043: Refleks na liście gier z wynikiem liczonym na serwerze (średnia z `times`).
- F4-044: rekord Sekwencji „seria 7” zamiast „7 pkt”.
- F4-052: Balon: punktów rywali nie widać na ekranie, stan i tak jest jawny (§1).
- F4-055: komentarz `LETTERS` wymienia Ć.
- F4-125 (D4-072 A): `upTo(seconds)` w ui.tsx; Intro Koła, Środka, Mapy, Tortu i Nożyczek podaje rundy i twardy limit partii z `turnSeconds` („10 odcinków, razem do minuty”). Limit jest stały, nie model, więc bez „zwykle”. ZASADY §4: `time` to długość partii.
- TDD `a8080e4` (9 testów RED), testy bez zmian w implementacji. Typy i pełne testy PASS (games 2288, server 45, web 146).
- Do odbioru (UI): pięć ekranów Intro na 360×640 mieści się bez przewijania.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 58
status: complete
completed: 2026-10-31
packages: [P4-049]
---

# 05-58 SUMMARY: P4-049

- F4-101: każdy `font-mono` ma `tabular-nums`; duże odczyty (Stoper, Rytm, Przytrzymaj), liczby podsumowania Rekordów i pary Memory w pigułce są mono. Liczby w zdaniach (Intro, opis turnieju, linia wyzwania dnia) zostają Satoshi wg D4-096 B.
- F4-102: `.label` dla „Twój kolor”, „Lista zakupów”, podpisów podsumowania Rekordów i Kampus Tour, nagłówków karty Dziekanatu i groźby monopolu (na kolorze `text-bg`) oraz tytułów plansz Statków (kolor właściciela przez `style`).
- F4-103: `bold` na ikonach małych akcji (powrót, wyjście, Losuj/Wszystkie, Rekordy, Zagraj ponownie, cofnij/wyczyść w Kalamburach, zamknij w Kampus Tour).
- F4-120: `decimal(n, digits)` w ui.tsx (przecinek, typograficzny minus, bez „−0,0”); `tenth`, czasy i kary Schultego i Sudoku przez nią. Kary nadal całkowite (F3 §10), to wspólne formatowanie, nie poprawka błędu.
- F4-122: brak najlepszej próby w Kole to „brak”; pusty balon w tabeli to szare 0 (to wartość, nie brak), legenda poprawiona.
- F4-124: progi 100/500 ms Stopera i Przytrzymaj zostają, powód w ZASADY §4.
- F4-141: podpisy osi wykresu Schultego 12 jednostek (ok. 11 px na telefonie), szerszy margines osi.
- F4-145: Odcień ma licznik w `Stats`, próbka h-24, żeby faza suwaków dalej się mieściła.
- F4-149: Mapa skraca odległość ponad 999 km do „999+” z pełną wartością w podpowiedzi; suma bez skrótu.
- F4-151: wynik Zakupów „8 pkt · 12,3 s”; trafienia i błędy widać na półce.
- F4-153: „pkt” w nagłówku tabeli turnieju, w wierszach sama liczba.
- F4-157: ustawienia turnieju mają nagłówek jak ekran gry (Trophy, „Turniej”, „1-6 osób” mono); sprawdzone w /dev na 360×640.
- TDD `f16aa02` (8 testów RED), testy bez zmian w implementacji. Typy, testy gier, serwera i web, build PASS.
- Do odbioru (U04/U05/U06): 10 rund z długimi nickami, duża suma turnieju, wynik Zakupów, Odcień na 360×640, Mapa z odległością ponad 999 km.

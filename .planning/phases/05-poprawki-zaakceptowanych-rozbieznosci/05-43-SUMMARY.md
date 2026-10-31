---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 43
status: complete
completed: 2026-10-31
packages: [P4-046]
---

# 05-43 SUMMARY: P4-046

- Koniec partii (D4-082 A): Kampus Tour ma własny nagłówek, teraz jak Game.tsx: kolor zwycięzcy, `title-pop` tylko u zwycięzcy, remis neutralny; tytuł podsumowania w kolorze zwycięzcy. Chwila końca na serwerze bez zmian.
- Zastany stan (D4-103 A): `seenAtMount`/`useFresh` w ui.tsx; Gomoku (ostatni kamień), Statki (ostatni strzał), Labirynt (ostatnia ścianka) i Memory (pary) animują `stone-pop` tylko dla elementów nowych od montażu. Klucz, który zniknie (rewanż), przestaje być zastany. Szkoda od rywala (`useHarm`, P4-043) już nie powtarzała się po wejściu.
- Para Memory (D4-100 A): zostaje `stone-pop`; `set-glow` opisany w katalogu jako komplet wielu różnych pól.
- W pamięci (D4-099 A): zaliczona runda to `tile-hit` kafla z „Dobrze”, bez wibracji i bez dodatkowego czekania. Wieża zostaje z „Idealnie!” tylko przy wyrównaniu.
- Balon (D4-085 A): werdykt ostatniego balonu zależy od `pumps.length`, nie od fazy pauzy, więc `float-up` gra pełne 1,6 s; przerwa 0,8 s bez zmian, wynik wysyłany jak dotąd.
- TDD `30688d5` (9 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 66 web, build PASS.
- Do odbioru UI: wygrana/przegrana/remis w Kampus Tour, odświeżenie w Gomoku/Statkach/Labiryncie/Memory (bez ponownego wskakiwania), rewanż Gomoku, kolejny balon z widocznym werdyktem. Odbiór przeglądarkowy nie był wykonany w tej sesji.

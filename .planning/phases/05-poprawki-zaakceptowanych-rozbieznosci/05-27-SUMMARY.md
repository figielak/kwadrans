---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 27
status: complete
completed: 2026-10-31
packages: [P4-026]
---

# 05-27 SUMMARY: P4-026

- Karta: bankrut z „Zaliczeniem w pierwszym terminie” oddaje je na spód talii (`goBankrupt`), więc talia znów ma 18 kart. Zmiana zasad opisana w ZASADY-GIER §6 Karty.
- Statystyka: zdarzenie `rent` (i przez nie `rentPaid`/`tileIncome`) ma kwotę faktycznie oddaną; bankrut oddaje tylko gotówkę. Wypłata bez zmian. Czynsz przez sprzedaż pól jest pokrywany w całości, więc liczy się pełny.
- Juwenalia: zostają po wykupie, przepadają przy powrocie pola do banku. Poziom 3 zostaje po utracie kompletu, dalsza budowa wymaga kompletu. Oba zachowania bez zmian kodu, opisane i przypięte testami.
- TDD `b4d749e`: 2 testy RED (karta, statystyka); 3 testy zachowania istniejącego przechodziły od razu.
- Granice: premia startowa, koszt MPK i monopol bez zmian.
- Typy, 2027 testów gier i 45 serwera, build web PASS.
- Do odbioru UI: /dev 2/4 osoby i obserwator, bankructwo z Zaliczeniem i wykup pola z Juwenaliami.

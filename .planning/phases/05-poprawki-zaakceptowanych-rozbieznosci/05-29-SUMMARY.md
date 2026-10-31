---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 29
status: complete
completed: 2026-10-31
packages: [P4-029]
---

# 05-29 SUMMARY: P4-029

- Wyłącznie `packages/games/src/kampus-tour-audit.test.ts`: **41 nowych testów**, bez zmian logiki produkcyjnej, zależności i dokumentów zasad.
- Wszystkie badane stany z `setup`, wyboru postaci i legalnych ruchów. Zapisane sekwencje z ustalonym seedem obejmują również rzadkie sytuacje ekonomiczne, bez podmiany gotówki, talii czy fazy.

| Atom F4 (Kampus Tour) | Nazwany test / dowód |
|---|---|
| F4-004 | Świeża gra dla 2/3/4 graczy; limit 60 s |
| F4-007 | Gotówka dokładnie równa cenie kupna, wykupu i budowy; postać −1; pola 0/31 w MPK, sprzedaży i Juwenaliach |
| F4-008 | Schemat odrzuca zły typ, brak pola, ułamki, nieznany typ i pola poza planszą |
| F4-010 | Każdy odtwarzany ruch sprawdza głębokie zamrożenie wejścia, brak mutacji oraz JSON round-trip wyniku; wszystkie 10 typów ruchów |
| F4-012 | Obserwator bez `deck`, z prawidłowym `deckSize`, we wszystkich fazach odwiedzanych rozgrywkami (pick, roll, card, buy, buyout, build, sell, juwenalia, over) |
| F4-027 | Zaliczenie i dublet 2+2 na Kolokwium dają kolejny rzut |
| F4-028 | MPK z 3+3 nie daje dodatkowego rzutu |
| F4-029 | Juwenalia drugiego gracza zwiększają wspólny mnożnik z 2 na 3 |
| F4-032 | Po przymusowej sprzedaży brak wykupu mimo wystarczającej reszty gotówki |
| F4-033 | Bankructwo ze Składki przy 4 osobach dzieli gotówkę między wierzycieli; osobny test usuwa Juwenalia bankruta |
| F4-034 | Sprzedaż pola o nieparzystej wartości zaokrągla połowę w dół |

- Weryfikacja: testy celowane **41 PASS**; końcowe `pnpm typecheck && pnpm test`: **2074 testy gier + 45 serwera PASS**.
- Nie ujawniono błędu produkcyjnego; brak pominiętych przypadków. Podczas przygotowania poprawiono warunek danych testowych: początkowa Składka dzieliła kwotę bez reszty, więc usunięto nieuzasadnione założenie o niezerowej reszcie. Test sprawdza faktyczny podział dostępnej gotówki.
- Odbiór T/D: **11/11 części**. FIX-02 nadal otwarte. Zlecony jeden commit „Testy: Kampus Tour, brakujące przypadki P4-029”, bez push.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 32
status: complete
completed: 2026-10-31
packages: [P4-032]
---

# 05-32 SUMMARY: P4-032

- **98 nowych testów** w 13 plikach, wyłącznie brakujące przypadki karty P4-032. Bez zmian produkcyjnych, nowych zależności, zasad, UI i danych rekordów. Wyniki i końce partii uzyskane przez legalne ruchy.

| Atom F4 | Zakres i dowód |
|---|---|
| F4-004 (7 części) | Koło, Odcień, Kropki, Refleks, Schulte, Sekwencja, Stoper: min/max i brakujące limity wprost; świeża gra dla 1/6 tam, gdzie brakowała. Testy nazwane „P4-032/F4-004” |
| F4-005 (6) | Koło, Odcień, Kropki, Schulte, Sekwencja, Stoper: identyczny setup dla identycznego seedu. Sekwencja dokładnie 100 kolorów i inna sekwencja przy innym seedzie; Schulte inne siatki przy innych seedach |
| F4-006 (8) | Koło, Odcień, Kropki, Refleks, Schulte, Środek, Stoper: każdy typ ruchu po końcu odpada dla A/B/obcego; Koło także pusty wynik, Kropki/Schulte także progress. Sekwencja już pokryta po P4-004, bez duplikatu |
| F4-007 (4) | Koło: 19/20/1000 punktów, x/y 0 i 1 oraz sąsiednie −0,0001/1,0001; Odcień: skrajne H/S/B i H = −1; Sekwencja: result 0. Kropki 0/99 już pokryte P4-002 przez walidowane wyniki dla wszystkich odpowiedzi 0-99 |
| F4-008 (6) | Koło, Odcień, Refleks, Schulte, Sekwencja, Stoper: brakujące testy schematu na złych typach, nieznanych ruchach i brakujących polach; w Sekwencji również ułamkowy score. Nie dodano urojonej całkowitości współrzędnych koła ani nowych ograniczeń schematu |
| F4-009 (11) | Wygrana A/C w Refleksie, Sekwencji, Stoperze, Schultem i Kole; wygrana C w Odcieniu, Roku, Środku, Torcie i Nożyczkach. Wygrana C w Kropkach już potwierdzona testem P4-002 „same 99 remisują z timeoutem, a same zera go pokonują” |
| F4-010 (6) | Sekwencja, Stoper, Schulte, Koło, Odcień, Kropki: głębokie zamrożenie wejścia, brak mutacji i JSON round-trip po każdym typie ruchu; Koło także aktualizacja najlepszej/najgorszej próby i zakończenie |
| F4-045 (1) | Schulte: ten sam czas i różne splits dają remis w rankingu i miejscach |
| F4-047 (1) | Koło: przerwa 2% bez straty punktów; judge dla 19 punktów zwraca unfinished |
| F4-050 (1) | Śledzenie: prędkość **każdej** kulki w **każdej** rundzie; odstęp środków ≥0,14 na starcie i końcu ruchu (3 seedy) |
| F4-053 (1) | W pamięci: dla seedów 1/7/42 każda kolejna runda nie zaczyna się poprzednim ciągiem (start + działania) |

- Odbiór **52/52 części**. Zastane testy wskazane powyżej sprawdzono, nie dublowano ich. Nie utrwalono zmian przyszłych pakietów trudności (Stoper/Rytm/Liczenie/W pamięci); nowe testy dotyczą obecnych, nazwanych reguł.
- Testy celowane: **468 PASS** w 13 plikach. `pnpm typecheck && pnpm test`: **2248 gier PASS, 1 SKIP; 45 serwera PASS**. `git diff --check` PASS.
- Brak nowego błędu produkcyjnego w P4-032. Jedyny pominięty test całej serii pochodzi z P4-031: F4-046 (udział rodzajów w Liczeniu), dowód i dyspozycja w **05-31-SUMMARY.md**, naprawa w **P4-057**. Kod generatora pozostawiony bez zmian.
- Stan planowania: **31/62 pakietów, 149/267 zamkniętych części**; dodatkowo F4-046 częściowo sprawdzone (zakresy PASS, udział SKIP), bez doliczania jako zamkniętego. P4-014/015 nadal oczekują U02, FIX-02 otwarte. Następny pakiet P4-033 poza bieżącym zleceniem.
- Jeden commit „Testy: pozostałe mini-gry, luki P4-032”, bez push.

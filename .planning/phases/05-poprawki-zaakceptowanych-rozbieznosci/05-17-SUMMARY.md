---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 17
status: complete
completed: 2026-10-30
requirements: [FIX-02]
---

# 05-17: P4-007 odebrany bez zmian kodu

E05 (04-02) mierzył dokument 686 px, nagłówek 186 px i pasek przykrywający dolne wiersze.
Po zmniejszeniu nagłówka (P4-006) i P4-036 Gomoku mieści się na 360×640, więc zgodnie z granicami karty
nie dodano CSS; pomiar zapisano w DESIGN §6 w miejsce „Gomoku około 670 px”.

## Pomiar (/dev, wnętrze ramki 360×640, 2 graczy + obserwator)

| Stan | Plansza (górna-dolna krawędź) | Akcja | Dokument |
|---|---|---|---|
| Własny ruch, wybór O15 | 150-487 px, pole 22,5 px, kamień do 484 px | „Postaw na O15” 514-570 px (56) | 640 |
| Ruch rywala | 150-487 px | „… się zastanawia” 506-562 px | 640 |
| Obserwator („Oglądasz”) | 178-515 px | status 534-590 px | 640 |
| Koniec partii (5 w rzędzie) | ostatni rząd do 520 px | „Rewanż” 524-572, „Do lobby” 580-628 px | 687, wyniki przewijane (ZASADY §4) |
| Po rewanżu i po odświeżeniu gracza | 150-487 px | 514-570 px | 640 |

Gomoku nie ma trybów; minimalna i maksymalna liczba miejsc to 2. Błędy konsoli: restart serwera dev
i zablokowane `navigator.vibrate` bez dotyku w ramce, bez związku z grą.

Odbiór 1/1 części F4-056:`piec-w-rzedzie`. Łącznie 16/62 pakietów, 29/267 części. FIX-02 otwarte, następny P4-008.
Bez zmian kodu, zasad i zależności; typy/testy bez zmian względem ad4f440 (2049 PASS).

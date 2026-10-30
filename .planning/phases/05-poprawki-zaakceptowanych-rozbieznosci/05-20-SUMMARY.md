---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 20
status: complete
completed: 2026-10-30
requirements: [FIX-02]
---

# 05-20: P4-010 wykonany

E03 (04-02): dokument 830 px. Po P4-006 i P4-036 pomiar przed zmianą (/dev, wnętrze ramki 360×640, pasek przewijania
ukryty jak na telefonie): czekający gracze i obserwator 640, gracz w turze 662 (plansza 342 px, pasek akcji 132 px:
Pionek/Ściana 48 + potwierdzenie 56). Wszystko widać od razu, ale strona przewija się o 22 px; w ramce z paskiem
przewijania plansza dodatkowo zwęża się o 15 px tylko we własnej turze. Szybki 7×7 tak samo (plansza zależy od szerokości).

Labirynt.tsx: plansza bez `-mx-3` (szerokość jak kafelek nagłówka, 342→318 px), PAD viewBoxa 3→2 (paski mety sięgają 1,4).
Pole 9×9 ~36→~34 px, 7×7 ~45→~43 px; wyjątek gęstych plansz z potwierdzeniem bez zmian. Bez zmian zasad, pasków akcji i hitboxów przycisków.

Odbiór 1/1 części F4-056:`labirynt`. Łącznie 19/62 pakietów, 32/267 części. FIX-02 otwarte, następny P4-019.

## Pomiar po zmianie (/dev, wnętrze ramki 360×640)

| Stan | Wynik |
|---|---|
| Klasyczny, 4 graczy + obserwator, start | 640 u wszystkich; plansza 147-465, pasek akcji 482-614 |
| Tryb Ściana z podglądem („Obróć”, „Postaw”) | 640 |
| 23 kroki do wygranej („Idź w górę/w lewo”, „Przeskocz w górę”) | w grze max 640 |
| Koniec partii | 766/742 (obserwator): wyniki u góry przewijane, „Rewanż” w pasku (ZASADY §4), jak w Chińczyku |
| Rewanż (kolejność miejsc rotuje) | 640 u wszystkich |
| Szybki 7×7, 2 graczy + obserwator | 640 u wszystkich |
| Odświeżenie gracza w turze | 640, pasek akcji wraca |

Błędy konsoli: tylko zablokowane `navigator.vibrate` w ramkach bez dotyku.

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 + 36 = 2049. Build web PASS. git diff --check PASS. Commit bez push.

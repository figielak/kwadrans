---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 19
status: complete
completed: 2026-10-30
requirements: [FIX-02]
---

# 05-19: P4-009 wykonany

E04 (04-02): dokument 750 px, nagłówek 274, dolna plansza pod paskiem. Po P4-006 i P4-036 (kostka obok przycisku ruchu)
pomiar przed zmianą: 4 graczy + obserwator, Klasyczny i Szybki, 160-200 tur każdy, domki nigdy nie przykryte (min. 20 px),
jedyne przekroczenie 641 px u obserwatora, gdy kafelek miał 3 linie („wyrzuca 6”, dwuliniowe „Trzecia szóstka z rzędu,
tura przepada.”, „X rzuca kostką…”); to samo z 16-znakowymi nickami w komunikacie o zbiciu (wstawione do DOM, bo /dev nadaje „Gracz N”).

Chinczyk.tsx: podpowiedź „X rzuca kostką…/wybiera pionek…” tylko, gdy kafelek nie ma komunikatu o ostatnim rzucie;
kto ma ruch, pokazuje nagłówek. Bez zmian zasad i hitboxów.

Odbiór 1/1 części F4-056:`chinczyk`. Łącznie 18/62 pakietów, 31/267 części. FIX-02 otwarte, następny P4-010.

## Pomiar po zmianie (/dev, wnętrze ramki 360×640)

| Stan | Wynik |
|---|---|
| Klasyczny, 4 graczy + obserwator, 180 tur, 32 różne stany paska | dokument max 640, domki min. 40 px nad paskiem |
| Obserwator z 16-znakowymi nickami w komunikacie o zbiciu | 640, odstęp 26 px |
| Szybki, 2 graczy + obserwator, partia do końca (327 kroków) | w grze 640; po odświeżeniu gracza 640 (odstęp 68) |
| Koniec partii | plansza 190-503 nad „Rewanż” 524-572; wyniki przewijane (ZASADY §4) |
| Rewanż | 640 u obu graczy i obserwatora |

Błędy konsoli: tylko zablokowane `navigator.vibrate` w ramkach bez dotyku.

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 + 36 = 2049. Build web PASS. git diff --check PASS. Commit bez push.

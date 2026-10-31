---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 23
status: complete
completed: 2026-10-31
requirements: [FIX-02]
---

# 05-23: P4-021 wykonany

Który rok? ma limit serwera 270 s zamiast 240 s. `turnSeconds` i `turn().seconds` korzystają
z tej samej stałej; klucz `run` pozostaje stały. W kodzie zmieniono wyłącznie limit i jego komentarz.
10 rund, 20 s odpowiedzi, 2,5 s odsłony, zakres 1900-2025, pula wydarzeń, punktacja i format stanu są identyczne.

ZASADY-GIER: tabela i sekcja gry zawierają 270 s, rachunek zapasu i zachowanie historii.
KONCEPT §3 ma nowy limit. Z ZASADY §3 usunięto nieaktualny zapis, że P4-021 dopiero zmieni obecne 240 s;
zatwierdzony wyjątek od progu 20% pozostaje jawny.

Odebrano 1/1 części F4-002:`rok`. Łącznie 22/62 pakietów, 35/267 części; FIX-02 otwarte.
Następny P4-022. P4-014/015 nadal oczekują odłożonego U02.

## TDD i zapas czasu

Osobny commit testów: `57a1785` („Który rok?: test limitu 270 s i zapasu na pełną partię”).
RED przed implementacją: 23 PASS, 2 oczekiwane FAIL (240 zamiast 270 s i 12 zamiast 42 s zapasu).
Po zmianie: 25/25 PASS, bez zmian testów po commicie TDD. Dokumentację uzupełniono przed kodem.
Test definicji sprawdza zarówno `turnSeconds`, jak i `turn().seconds` = 270.

Model: 10 × (20 s odpowiedzi + 2,5 s odsłony) = 225 s klienta, plus założone 3 s sieci daje T = 228 s.
Zapas 270 − 228 = 42 s (około 18,4%) przekracza 10 s, ale nie spełnia 20%.
Pełna norma wymagałaby 273,6 s. Test zapisuje zatwierdzony wyjątek D4-011:A / ZG4-v1 §3.3,
bez podnoszenia limitu do 274 s ani udawania spełnienia 20%. Budżet sieci to założenie, nie pomiar;
harmonogram przeglądarki nie gwarantuje ścisłego czasu rzeczywistego. Dodatkowych kliknięć po odsłonach nie ma.

## Odbiór

Lokalny Vite :5174 i Colyseus :2568 z `DB_PATH=:memory:`. Izolowany kontekst Playwright przekierowuje
fetch/WebSocket z domyślnego :2567 na :2568; bez zmian konfiguracji i kodu sieci w repozytorium.

| Przypadek | Wynik |
|---|---|
| `/dev?n=6`, prawdziwy start przez UI | Wszystkie widoki otrzymują 270000 ms i te same 10 wydarzeń |
| Maksymalne czekanie w każdej rundzie | Bez zatwierdzania odpowiedzi, 10 samoczynnych rund i odsłon; każdy oddaje dziesięć odpowiedzi 1962. Suma błędów 302 u wszystkich, remis, poprawna tabela wydarzeń |
| Postęp i geometria | `progress` rośnie do 9, limit stale maleje; aktywne ramki mają dokument 360×640 bez przewijania w bok |
| Timeout, prawdziwe handlery i zegar sterowany | Po 241000 ms ruch `progress` daje nadal `playing` i 29000 ms; przy 269999 ms pozostaje 1 ms; przy 270000 ms `over`, puste odpowiedzi i najgorszy wynik 953 obliczony z wydarzeń |
| Rewanż, handlery | Po timeoutcie świeże 10 wydarzeń, puste wyniki/postęp, nowe intro i 270000 ms po `begin` |
| Rewanż, UI `/dev?n=2` | Po wynikach przesłanych przez WebSocket obaj klikają Rewanż i Start; nowe wydarzenia, puste wyniki/postęp, po 270000 ms |
| Jednostka i rekord | Bezbłędne odpowiedzi dają 0, dziesięć odpowiedzi oddalonych o rok daje 10. Wcześniejsze `best` i `tie` pozostają bez zmian, JSON zapisanego detail lidera identyczny |

Przerwanie sesji zamknęło przeglądarkę i lokalne procesy przed odczytem wyniku osobnego testu czekającego
270 s. Nie zaliczono go jako dowodu rzeczywistego timeoutu przez WebSocket. Brakujący odbiór timeoutu
powtórzono na `LobbyRoom` z rzeczywistymi handlerami, walidacją i bazą pamięciową; zastąpiono tylko zegar
(`node:test` MockTimers i `room.clock.setTimeout`). Rewanż UI powtórzono po uruchomieniu nowych serwerów.
Pomocniczy skrypt kontrolny usunięto po wykonaniu. Nie zmieniano kodu serwera ani testów po commicie TDD.

Nie otwierano ani nie modyfikowano trwałej bazy. Nie ma migracji, przeliczania ani kasowania historii;
nowe wyniki nadal trafiają pod `id` `rok` w tej samej jednostce. Historia obejmuje różne limity,
więc pełna porównywalność dawnych i nowych partii nie jest gwarantowana.

## Weryfikacja końcowa

- `pnpm typecheck && pnpm test`: PASS, 2015 testów gier + 36 serwera = 2051.
- `pnpm --filter web build`: PASS; istniejące ostrzeżenie o pakiecie JS powyżej 500 kB.
- Porównanie rok.ts z commitem TDD: wyłącznie stała limitu i jej komentarz; testy po TDD bez zmian.
- `git diff --check`: PASS.

Commit wdrożenia i dokumentacji po osobnym commicie testów, bez push.

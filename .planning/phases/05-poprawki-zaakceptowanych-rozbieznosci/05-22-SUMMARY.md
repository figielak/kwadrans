---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 22
status: complete
completed: 2026-10-31
requirements: [FIX-02]
---

# 05-22: P4-020 wykonany

Śledzenie ma limit 360 s zamiast 300 s. Jedyna zmiana kodu zasad to `turnSeconds`;
20 rund, generator, ruch kulek, liczenie rund i trafionych celów oraz komparator rekordów pozostają bez zmian.
ZASADY-GIER: tabela limitów i sekcja Śledzenie zawierają 360 s, rachunek czasu i politykę zachowania historii.
KONCEPT §3 ma Śledzenie w osobnej grupie 360 s, Sekwencja i W pamięci pozostają przy 300 s.

Odbiór 1/1 części F4-002:`sledzenie`. Łącznie 21/62 pakietów i 34/267 części; FIX-02 otwarte.
Następny P4-021. P4-014/015 nadal oczekują odłożonego U02.

## TDD i rachunek

Osobny commit testów: `6421837` („Śledzenie: test limitu 360 s i zapasu na pełne 20 rund”).
Przed kodem: 42 testy PASS, 2 oczekiwane FAIL: limit nadal 300 zamiast 360 i 300000 < 344400 ms.
Po zmianie limitu: 44/44 PASS; testów nie zmieniano po commicie TDD.
Dokumentację uzupełniono przed zmianą stałej w kodzie.

T = 20 × (0,7 s oczekiwania + 1,5 s podświetlenia + 5 s ruchu + 3 × 2 s wskazywania + 1 s odsłony)
+ 3 s dostarczenia wyniku = 287 s. Zapas 360 − 287 = 73 s, czyli około 25,4%.
Test sprawdza zarówno minimum 20%, jak i minimum 10 s. Stałe pokazu i ruchu pochodzą z modułu gry;
oczekiwanie i odsłona odpowiadają `TIMED` w Sledzenie.tsx. 2 s na wskazanie i 3 s sieci to założenia
modelu z audytu 03-08, nie pomiar człowieka. Intro poprzedza limit; trzecie wskazanie zatwierdza odpowiedź.

## Odbiór UI i sieci

Własne serwery Vite :5174 i Colyseus :2568 (`DB_PATH=:memory:`). Ponieważ aplikacja dev używa :2567,
wyłącznie przeglądarka testowa przekierowuje jej fetch/WebSocket na :2568. Nie zmieniano net.ts ani konfiguracji repo.

| Przypadek | Dowód |
|---|---|
| `/dev?n=6`, sześciu graczy, start przyciskami | Gra ze stanem 20 rund; po starcie wszyscy odliczają od limitu 360 s |
| Przekroczenie starego limitu | W 301. sekundzie wszystkie widoki nadal `playing`, `results={}`, pozostało około 58990 ms |
| Samoistny timeout | Bez oddania wyników serwer kończy partię po 360 s; sześć wyników `{rounds:0,hits:0}`, remis bez zwycięzcy |
| Geometria | W aktywnej grze wszystkie ramki mają wnętrze 360×640, dokument 360×640, bez przewijania w bok |
| Solo, zwykły ekran aplikacji | Wybór mini-gry i Start przez UI, widoczne 360 s; kliknięcia kulek 0,1,7 dają po odsłonie „0 rund +2”, ekran końcowy, rekord i Jeszcze raz/Wyjdź |
| Turniej, 2 osoby | Rzeczywista seria Rytm → Śledzenie → Stoper; Śledzenie dostaje 360000 ms. Wyniki wysłane przez WebSocket: 20/0 oraz 12/2; wygrana pierwszego, punkty 1/0, poprawna tabela i przejście dalej |
| Rekord i detail | API zapisuje best=20, tie=0 oraz best=12, tie=2; stan lidera ma 20 rund, jednego gracza i wynik 20/0. MiniGame z `me=""` renderuje zapis jako „20 rund” |
| Zachowanie wcześniejszych zapisów | Porównanie API przed nowymi wynikami i po timeoutach/partii solo: wcześniejsze best i tie bez zmian, JSON partii lidera identyczny |

Dodatkowa próba na pomocniczym widoku solo (osobno montowany Game z ręcznie utworzonym klientem)
przeszła lokalnie wszystkie 20 rund, ale wynik nie dotarł do serwera, a ponowne połączenie nie przywróciło klienta.
Nie zaliczono jej jako dowodu poprawnego oddania wyniku. Powtórzono odbiór solo przez zwykłą aplikację
z rzeczywistymi kliknięciami i uzyskano poprawny koniec 0/2. Przyczyny niepowodzenia dodatkowego widoku
nie rozstrzygnięto; nie zmieniano w tym pakiecie sieci ani klienta gry. Pełny wynik 20/0 po stronie serwera
potwierdzają niezmienione testy wyniku oraz rzeczywisty turniej.

Testy korzystały wyłącznie z bazy pamięciowej. Nie otwierano ani nie modyfikowano trwałej bazy rekordów.
Zmiana nie zawiera migracji, przeliczania ani usuwania historii; nowe wyniki trafiają pod tym samym `id`.
Historia obejmuje różne limity czasu, więc nie gwarantujemy pełnej porównywalności dawnych i nowych partii.

## Końcowa weryfikacja

- `pnpm typecheck && pnpm test`: PASS, 2014 testów gier + 36 serwera = 2050.
- `pnpm --filter web build`: PASS; istniejące ostrzeżenie o pakiecie JS powyżej 500 kB.
- `git diff --check`: PASS.

Commit wdrożenia i dokumentacji po osobnym commicie testów, bez push.

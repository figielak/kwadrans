---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 15
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-15: P4-023 wykonany

Sześć quizów waliduje czasy jako int 0-30000 ms, sumę <=30000 ms i błędy int 0-30.
Wspólna stała BLOCK_MS=1000 trafia z zasad na ekran. Zniknęły arbitralne progi 150/5000 ms
oraz limit 200 trafień. 200 pozostaje rozmiarem losowanej i zapętlanej puli pytań/dostaw,
nie progiem szybkości człowieka. Schema i validateMove korzystają z tego samego sprawdzenia.

Quiz.tsx i Dziesiatki.tsx zapisują różnice zaokrąglonych znaczników monotonicznego zegara.
Zachowują każde trafienie i czas, także 0 ms wynikające z rozdzielczości zegara. Różnice końców
niezachodzących na siebie przedziałów nie kumulują błędów zaokrągleń ponad 30 s.
Guard końca działa także w handlerze dotknięcia, nie tylko w interwale: od 30000 ms nie ma nowych trafień.
Ref blokuje powtórną obsługę tego samego renderu oraz ponowny result; wynik wysyłany jako kopia tablicy.
Blokada 1 s i kary punktowe pozostają, w retry i Dziesiątkach czas trafienia nadal obejmuje blokady.

Odebrano F4-014:całość i F4-015:całość, 2/2 części. Łącznie 14/62 pakietów, 27/267 części.
FIX-02 otwarte, następny P4-036. P4-014/015 oczekują pomiarów Androida odłożonych przez użytkownika.
Bez migracji, kasowania lub przeliczania starych rekordów/detail (G-DANE/R2).
Porównywanie starych i nowych rekordów obejmuje historycznie różne pomiary, co pozostaje jawne w zasadach.

## Granice i TDD

- Przed testami wyprowadzono 30 pomyłek: pierwsza może paść w chwili 0,
  następne nie częściej niż co 1000 ms; 31. wypada dopiero od 30000 ms, poza rundą.
- Suma czasów nie jest dodatkowo powiększana o błędy: w Inny element i Dziesiątkach
  te same czasy już zawierają blokady. Walidacja daje konieczne granice danych, nie antycheat.
- Żaden czas nie wymaga 150 ms ani końca po 5 s; pytania i dostawy miały już modulo w klientach.
- ZASADY-GIER zaktualizowane przed implementacją; opisano całościowe granice i historię.
- Nowy quiz.test.ts sprawdza sześć gier, schemat i validateMove, <150/>5000, 201 trafień,
  30/31 błędów, ułamki/NaN/Infinity, sumę, rekord/tie/miejsca i zachowanie obu czasów.
- Dotychczasowe testy zakresu zmieniono według nowych zasad przed kodem:
  ujemny czas zamiast 149, ponad rundę zamiast 5001; Array(201).fill(150) nadal odpada przez sumę.
- RED: 66 FAIL / 36 PASS w 102 nowych przypadkach; typecheck PASS.
  Log /tmp/kwadrans-05-15-red.log. Osobny commit f127c6c, testów po nim nie zmieniano.

## Odbiór ekranu

Prawdziwy Quiz i Dziesiatki z kontrolowanym performance.now, onMove sprawdzany przez niezmienione
applyMove i nowe validateMove. Bez manipulacji kodem punktacji.
- Quiz zwykły: czasy [100,6000,100], errors=1; wynik identyczny po wysłaniu.
- Quiz retry: [100,6000,1200], errors=1, ostatnie trafienie obejmuje pomyłkę i sekundę blokady.
- Dziesiątki: poprawne pary i pomyłka przez rzeczywiste przyciski, [100,6000,1200], errors=1.
- Po błędzie przyciski nieaktywne; po 1100 ms działają, próba w trakcie blokady nie zwiększa wyniku.
- Klik w 30000 ms nie dodaje trafienia; result wysyłany raz, także po dalszym przesunięciu zegara.
- 201 kolejnych odpowiedzi po 1 ms: dokładnie 201 czasów po 1 ms, suma 201 ms, zero zgubionych trafień.
  Test kontrolowanego zegara potwierdza kontrakt i zachowanie klienta, nie tempo człowieka.

## Prawdziwy serwer i turniej

Lokalny serwer z DB_PATH=:memory: uruchomiony ponownie z nową walidacją, bez danych produkcyjnych.
- Pokój solo Koloru liter: dwa trafienia przez UI po 100 i 6000 ms, rzeczywisty WebSocket.
  Serwer results=[100,6000], errors=0; API rekordu best=2/tie=3050; ekran 2 trafienia, 3,05 s.
- Turniej dwóch klientów, trzy gry z puli stroop/liczenie/dziesiatki:
  A=[100,6000], B=[200,6000], oba errors=0. W każdej A wygrywa, miejsca 1/2,
  punkty turnieju 1/0. Rekordy wszystkich trzech gier best=2, tie A=3050/B=3100.
  Finał i ranking turnieju zgodne. Rewanż całego turnieju powtórzony z tym samym wynikiem.
- Próba ułamkowego czasu i 31 pomyłek przez WebSocket nie tworzy wpisu wyniku.
- Automatyzacja gotowości poprawiona: gospodarz nie musi mieć player.ready=true, gotowi muszą być goście.
  Pierwszy zbyt szybki ciąg wiadomości w turnieju trafił w istniejący rate limit; pełny rewanż
  powtórzono z 1100 ms odstępu między rundami, bez błędów i bez zmiany limitera.

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 testów gier + 36 serwera = 2049.
Build web PASS, istniejące ostrzeżenie pakietu JS >500 kB. git diff --check PASS.
Logi /tmp/kwadrans-05-15-tests.log i /tmp/kwadrans-05-15-build.log.
Bez nowych zależności, zmiany id, komparatora rankingów lub bezpośredniego zod w apps/server.
Zasady i testy przed kodem; commit implementacji zgodnie ze stałą zgodą użytkownika, bez push.

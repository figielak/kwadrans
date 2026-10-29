---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 06
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-06: P4-005 wykonany

W pamięci wysyła result natychmiast po pomyłce albo komplecie. Odsłona po pomyłce pozostaje niezależna
od potwierdzenia serwera. Wyniki zmienia tylko lokalną fazę, bez drugiego ruchu. Synchroniczny ref blokuje
drugi result. Zasad, losowania, punktacji, tie i limitu nie zmieniano.

Wykonano 1/1 części F4-083:całość. Łącznie 6/62 pakietów i 11/267 części; FIX-02 otwarte.

## Testy przed kodem

- Prawdziwy WPamieci w przeglądarce, błędna odpowiedź: lista wysłanych ruchów pusta,
  przycisk Wyniki wymagany. Dowód RED dotyczy błędu UI, nie istniejącej funkcji liczącej.
- Przed zmianą ekranu dodano regresję istniejącego kontraktu przy 1/6 graczach: po trzech zaliczonych
  rundach i pomyłce o 2 wynik to rounds=3/diff=2, rekord/tie=3/2; timeout i drugi result nie mogą go nadpisać.
  43 testy w-pamieci.test.ts PASS na niezmienionych zasadach; log /tmp/kwadrans-05-06-baseline.log.
- Osobny commit 28196b5 na podstawie stałej zgody użytkownika. Po commicie testów nie zmieniano.
- ZASADY-GIER opisuje wysyłkę i funkcję odsłony przed zmianą kodu.

## Odbiór

- pnpm typecheck && pnpm test: PASS; 1911 testów gier + 36 serwera = 1947.
- Build web PASS z dotychczasowym ostrzeżeniem o pakiecie JS >500 kB.
- UI z prawdziwym komponentem i modułem zasad, kontrolowany zegar Playwright:
  po 3 dobrych i błędzie o 2 dokładnie jeden result z czterema odpowiedziami i stan rounds=3/diff=2.
  Odsłona nadal widoczna po potwierdzeniu. Kliknięcie Wyniki pozostawia liczbę ruchów równą 1.
  Ponowny montaż jak po refresh pokazuje 3 rundy (o 2).
- Wszystkie 12 rund z poprawnymi odpowiedziami daje dokładnie jeden result, rounds=12/diff=0.
  Test nie zmienia rozkładu działań ani zasad remisu na komplecie.
- /dev 6, prawdziwy WebSocket i UI, przyspieszony wyłącznie zegar klienta:
  każdy zalicza 3 rundy i myli się o 2. Bez naciśnięcia Wyniki serwer ma sześć wyników 3/2,
  wszyscy nadal widzą odsłonę. API rekordów ma sześć best=3/tie=2/played=1.
  Próba drugiego result niczego nie zastępuje; po odświeżeniu wszystkich sześciu ramek widać 3 rundy (o 2).
- Prawdziwy pokój solo: błąd w pierwszej rundzie o 1. Przed Wyniki serwer ma rounds=0/diff=1,
  API rekordów best=0/tie=1/played=1, odsłona widoczna; refresh zachowuje wynik 0 rund (o 1).
- Widok 360×640 ma szerokość dokumentu 360 px. Pozostałe problemy klawiatury/układu należą do innych pakietów.
- Pierwsza próba automatyzacji zakładała jednorazowy skok czasu przez cały ciąg; efekty React
  wymagały dodatkowej synchronizacji. Odbiór powtórzono z krokami zegara do pojawienia się pola odpowiedzi.

Baza wyłącznie w pamięci. Bez nowych zależności, id, zmian schematu i historii SQLite, push lub produkcji.
Implementacja pozostaje lokalna. Następny P4-006: wspólny nagłówek aktywnej partii.

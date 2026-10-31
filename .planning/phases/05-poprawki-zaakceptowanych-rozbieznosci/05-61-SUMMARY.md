---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 61
status: waiting-u14
packages: [P4-061]
---

# 05-61 SUMMARY: P4-061 (krok 1 z 3)

- Narzędzie pomiaru gotowe: `?zegar` (zostaje w sessionStorage do zamknięcia karty), panel w lewym górnym rogu, `pointer-events-none` poza przyciskami.
  Kolumny: bodziec = rAF − chwila zmiany stanu, dotyk = obsługa − `e.timeStamp`, różnica = reakcja starą metodą − nową. Liczy też ujemne czasy nowej metody i ukrycie karty.
- Pomiar agenta (Chromium na komputerze, 60 Hz, zdarzenia syntetyczne Playwright, nie dotyk): mediany refleks 12 dotknięć: bodziec 9,3 ms, dotyk 0,5 ms, różnica 9,8 ms; Stój! 10: 14,7 / 0,4 / 15,1; Wieża 3: 12,3 / 0,4 / 12,8; Stoper 1: dotyk 0,5. Ujemnych czasów 0. To nie jest U14: syntetyczne zdarzenia nie mają opóźnienia dotyku, a ekran nie jest telefonem.
- Wniosek wstępny: obecne odniesienie bodźca jest wcześniejsze o mniej więcej pół do jednej klatki, więc stara metoda zawyża reakcję o ok. 10-15 ms przy 60 Hz. Rozmiar przy 120 Hz i opóźnienie obsługi prawdziwego dotyku rozstrzyga U14.
- Wynik gry bez zmian (test `clock.test.ts`). Typy i testy web PASS.
- Czeka na U14 użytkownika. Telefon musi dosięgnąć Vite: `pnpm --filter web dev --host`, potem `http://<IP komputera>:5173/?zegar`.

---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 61
status: complete
completed: 2026-10-31
packages: [P4-061]
---

# 05-61 SUMMARY: P4-061

- Narzędzie pomiaru gotowe: `?zegar` (zostaje w sessionStorage do zamknięcia karty), panel w lewym górnym rogu, `pointer-events-none` poza przyciskami.
  Kolumny: bodziec = rAF − chwila zmiany stanu, dotyk = obsługa − `e.timeStamp`, różnica = reakcja starą metodą − nową. Liczy też ujemne czasy nowej metody i ukrycie karty.
- Pomiar agenta (Chromium na komputerze, 60 Hz, zdarzenia syntetyczne Playwright, nie dotyk): mediany refleks 12 dotknięć: bodziec 9,3 ms, dotyk 0,5 ms, różnica 9,8 ms; Stój! 10: 14,7 / 0,4 / 15,1; Wieża 3: 12,3 / 0,4 / 12,8; Stoper 1: dotyk 0,5. Ujemnych czasów 0. To nie jest U14: syntetyczne zdarzenia nie mają opóźnienia dotyku, a ekran nie jest telefonem.
- Wniosek wstępny: obecne odniesienie bodźca jest wcześniejsze o mniej więcej pół do jednej klatki, więc stara metoda zawyża reakcję o ok. 10-15 ms przy 60 Hz. Rozmiar przy 120 Hz i opóźnienie obsługi prawdziwego dotyku rozstrzyga U14.
- Wynik gry bez zmian (test `clock.test.ts`). Typy i testy web PASS.
- Decyzja użytkownika 2026-10-31: „Kontynuuj bez mojej weryfikacji”, więc U14 przechodzi do odbioru po fakcie, warunek odnotowany jako uchylony przez użytkownika, nie jako spełniony.
- Zmiana (D4-049 A): `stimulus.ts` (`markFrame`, `reaction`). Refleks i Stój! liczą reakcję od znacznika pierwszej klatki z bodźcem do `e.timeStamp`; do pierwszej klatki odniesieniem jest chwila zmiany stanu. Dotknięcie przed pierwszą klatką daje czas ujemny: w Refleksie falstart, w Stój! ignorowane (jak każde poniżej 100 ms). Ukryta karta: odniesienie to pierwsza klatka po powrocie.
- Stoper i Wieża bez zmian: liczą od własnego startu, który jest też odniesieniem obrazu (Wieża rysuje z `now − started`), a różnica obsługi dotyku to 0,4-0,5 ms (Wieża: ok. 0,1% pola przy progu 2%). Brak wykazanego znaczenia (karta P4-061).
- Rekordy (R2): stare zostają bez przeliczania; są o ok. pół do jednej klatki wyższe (Chromium 60 Hz: 10-15 ms). ZASADY §5, ZASADY-GIER §Refleks i §Stój!.
- TDD `5852378` (4 testy RED); test narzędzia z kroku 1 zaktualizowany osobnym commitem po decyzji o zmianie metody. Typy, testy web (160) i build PASS; testy games 2288 PASS (dwa testy na 1000 seedów przekroczyły 5 s przy pełnym przebiegu równoległym, osobno przechodzą w 3,3 s).
- /dev: Refleks solo z celowym falstartem: kara 1000 ms, najlepsza 210 ms przy odczekaniu 200 ms, brak ujemnych czasów.
- Do odbioru po fakcie: U14 na telefonie 60/120 Hz przez `?zegar` (`pnpm --filter web dev --host`).

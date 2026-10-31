---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 47
status: complete
completed: 2026-10-31
packages: [P4-052]
---

# 05-47 SUMMARY: P4-052

- F4-073: „Rekordy” otwarte z pokoju dostają `dropped` (pasek „Łączenie ponownie…”).
- F4-074: zamknięcie pokoju to kafel `role="status"` z ikoną Info nad sekcjami ekranu głównego, znika przy następnej próbie; pole kodu nie jest już `aria-invalid`.
- F4-115: wznawianie sesji „Łączenie…”, lobby bez widoku „Wczytywanie…” zamiast pustych szkieletów, start solo „Uruchamianie…”; „Rekordy” i „zmień” nieaktywne w trakcie.
  `fetchRecords` zwraca null przy braku odpowiedzi: Home, lista mini-gier i ekran „Rekordy” pokazują „Wczytywanie…” albo „Nie udało się wczytać rekordów.” zamiast „nie grane”; panel rekordu po partii się nie pokazuje. Rekordowa partia ma „Wczytywanie…” i osobny komunikat błędu (`fetchTopRecord` → false).
- F4-113: pigułka rozłączonego gracza ma przerywaną ramkę i kropkę 40%; w lobby przygaszona tylko kropka, nick czytelny.
- F4-114: Memory rewers poza turą 40% (podpis „X szuka pary…” już był), Państwa-miasta własne odpowiedzi 60% z „Swoich nie oceniasz.”, tryb u gościa 40% z „Tryb wybiera gospodarz.”, turniej „bez” 60% z ikoną i słowem.
- F4-155: zdanie przy granicy liczby gier pod licznikiem („Najmniej 3 gry w turnieju.”, „Więcej gier nie ma: reszta jest wykluczona.”).
- F4-128: Szacowanie: „Najwyżej 180°” w `warning` i `aria-invalid` (miejsce zarezerwowane).
- F4-138: Chińczyk: dotknięcie własnego pionka bez ruchu mówi dlaczego (wyjście z bazy, zajęty start, dokładny rzut, przeskok w domku, zajęte pole, chroniony start rywala); dotknięcie dowolnego pionka w bazie wybiera ten, który może wyjść.
- F4-146: Sudoku: klawiatura `disabled` (40%) bez wybranego pola, stały podpis „Wybierz puste pole” / „Wpisz cyfrę”; wybór pola bez zmian. Mieści się na 360×640 (sprawdzone w przeglądarce).
- F4-137: „Za krótka partia na ciekawostki.”; F4-154: turniej solo bez tabeli zer, „Rozegrane gry: N/M”.
- F2:O32 (opis blokady startu) był już spełniony przez `StartBar`.
- TDD `a9656f6` (14 testów RED). Typy, 2268 gier (1 SKIP), 45 serwera, 121 web, build PASS.
- Do odbioru w /dev: przerwanie i odnowienie połączenia, zamknięcie pokoju, wolne API, zablokowany pionek w Chińczyku (wymaga partii 2 os.).

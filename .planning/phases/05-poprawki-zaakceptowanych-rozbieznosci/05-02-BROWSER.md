# 05-02: odbiór przeglądarkowy

2026-10-26, lokalny Vite na 5173 i serwer Colyseus na 2567, `DB_PATH=:memory:`.
Prawdziwy zegar serwera, bez przyspieszania czasu ani zmian produkcyjnego stanu z narzędzi testowych.
Weryfikacja przez Playwright w `/dev?n=2` i `/dev?n=6`; odświeżano wszystkie ramki graczy.

| Scenariusz | Przed odświeżeniem | Po odświeżeniu | Wynik |
|---|---|---|---|
| 2 osoby, pierwsza połowa rundy 2/2, pokój DEZC | Rysujący widzi „żyrafa”, zgadujący `______`, `Hasło, liter: 6`, pasek 79 s | To samo hasło i brak podpowiedzi, ta sama runda, pasek 76 s | poprawnie |
| 2 osoby, druga połowa rundy 1/2, DEZC | „pierogi” u rysującego, `p______` i jedna litera p u zgadującego, 12 s | To samo hasło i litera, ta sama runda, 10 s | poprawnie |
| 6 osób, pierwsza połowa rundy 1/6, pokój 8H9M | „mapa” u rysującego; wszyscy pozostali `____`, bez odsłoniętej litery, 79 s | Wszystkie sześć widoków zachowuje rolę i hasło, pasek 72-73 s | poprawnie |
| 6 osób, druga połowa rundy 1/6, 8H9M | Po timeoutcie wszyscy zgadujący widzą `__p_`, `Hasło, liter: 4, odsłonięta: p` | Wszyscy zachowują tę samą literę i rundę, pasek 34 s | poprawnie |

Obserwowano samoczynne ujawnienie jednej litery przez timeout pierwszej połowy w obu konfiguracjach.
Zgadujący po odświeżeniu nadal nie otrzymują pełnego hasła. Licznik biegnie dalej, zamiast zaczynać ponownie.
Konsola przeglądarki: **0 błędów, 0 ostrzeżeń** (39 komunikatów łącznie).

W pierwszej próbie automatyzacji 2 osób selektor oczekujący nagłówka z samymi podkreśleniami nie uwzględniał
nazwy dostępności. Próba skończyła się timeoutem selektora, bez błędu aplikacji. Następnie oba scenariusze
odświeżenia powtórzono z odczytem `aria-label` i otrzymano powyższe jednoznaczne wyniki.

Zakres tego odbioru to logika podpowiedzi i reconnect. Ramki `/dev` mają 390×780; nie wykonywano
odbioru geometrii 360×640 ani fizycznego telefonu. Te pomiary pozostają w odpowiednich pakietach UI;
P4-027 nie zmienia komponentów ani stylów. Obserwator sprawdzony automatycznie w testach pokoju przy 2 graczach;
6 graczy zajmuje wszystkie miejsca pokoju.

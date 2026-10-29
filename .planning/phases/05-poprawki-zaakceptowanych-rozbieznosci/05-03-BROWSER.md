# 05-03: odbiór przeglądarkowy

2026-10-29. Lokalny Vite 5173, Colyseus 2567, DB_PATH=:memory:. Playwright.
W scenariuszach /dev prawdziwy zegar serwera, bez zmiany stałych ani upływu czasu.
Wyniki ukończone podano normalną wiadomością klienta, zgodnie z modelem zaufania mini-gier;
nie jest to pomiar gry człowieka ani czasu klikania. Nie modyfikowano stanu serwera narzędziami testowymi.

## Partie przez WebSocket i UI

Pozostawiony bez wyniku Gracz 1 dostaje timeout; pozostali zgłaszają wynik z karą ponad limit:
Schulte 170 s + 4 błędy = 182 s, Sudoku 60 s + 13 błędów = 125 s.

| Gra i liczba graczy | Wynik | Odświeżenie wszystkich ramek |
|---|---|---|
| Sudoku, 2, H7QG | Gracz 2 wygrywa z 125 s, Gracz 1 „Nieukończono”, bez RecordPanel | identyczny tekst po odświeżeniu |
| Schulte, 2, XYGJ | Gracz 2 wygrywa z 182 s, Gracz 1 „Nieukończono”, bez RecordPanel i fałszywej przewagi w sekundach | identyczny tekst po odświeżeniu |
| Sudoku, 6, 46GG | Pięciu ukończonych remisuje na górze z 125 s, timeout Gracza 1 na końcu; bez RecordPanel u timeoutu | identyczny tekst po odświeżeniu |
| Schulte, 6, KVHU | Pięciu ukończonych remisuje na górze z 182 s, timeout Gracza 1 na końcu; bez RecordPanel u timeoutu | identyczny tekst po odświeżeniu |

Po końcu KVHU API /api/records zawiera wyłącznie Graczy 2-6, każdy z best=182000. Gracz 1 nie ma rekordu.
Stan ma pięć completed=true i jedno completed=false.

Pierwsza próba uruchomienia czwartego jednoczesnego pokoju została odrzucona przez istniejący limit pokoi na IP.
Użyto ponownie pokoju sześciu osób. Pierwszą próbę Schultego przy sześciu osobach przerwał restart
node --watch po edycji komentarza w schulte.ts, więc powtórzono ją od początku w KVHU.
Nie jest to zmiana zasad ani obejście limitu pokoju.

## Zapis historyczny, remis, panel rekordu

Prawdziwy Game/Schulte/Sudoku renderowany na lokalnej stronie Vite z kontrolowanymi stanami
zbudowanymi przez setup/validateMove/applyMove; stary zapis przez usunięcie completed z kopii JSON.
Żaden taki stan nie trafił do serwera ani historii.

Osiem scenariuszy (dwie gry × cztery stany): jeden timeout i jedno ukończenie, oba timeouty,
oba ukończenia i historyczne solo z me="". Końcowe powtórzenie na zwykłej stronie Vite:
API /api/records HTTP 200 we wszystkich ośmiu przypadkach.

- Timeout: odpowiednio 1 lub 2 etykiety „Nieukończono”, RecordPanel nieobecny dla tego gracza.
- Ukończenie i stare detail: liczbowy czas z karą, bez fałszywego „Nieukończono”, RecordPanel obecny.
- Żaden stan nie pokazuje Infinity/NaN; brak wymyślonej przewagi czasu nad timeoutem.
- Pełny remis po timeoutach nie ma zwycięzcy.
- Widok 360×640: szerokość dokumentu 360 px we wszystkich ośmiu scenariuszach.
  Ekran mieszany Schultego ma również wysokość 640 px. Obejrzany zrzut `.playwright-mcp/05-03-schulte.png`.
  Nie jest to odbiór wszystkich ekranów i fizycznych urządzeń w pozostałych pakietach audytu.

Pierwszy izolowany harness z przechwyconym HTML wymagał preambuły React i trafił na blokadę loopback
przeglądarki przy HMR/API. Odbiór powtórzono na zwykłym dokumencie Vite z API HTTP 200.
Te nieudane próby narzędziowe nie są dowodem awarii aplikacji ani podstawą do pominięcia kontroli.

## Turniej

Z rzeczywistych modułów zasad utworzono serię Schulte → Sudoku → Kropki, zawsze walidując ruchy.
A nie kończy Schultego, B nie kończy Sudoku i Kropek. Wynik:

| Runda | Miejsca A/B | Punkty A/B |
|---|---|---|
| Schulte | 2/1 | 0/1 |
| Sudoku | 1/2 | 1/0 |
| Kropki | 1/2 | 1/0 |

advance/standings zwracają tabelę A=2, B=1 i zwycięzcę A, bez dogrywki.
Prawdziwy Game wyrenderował „Wygrywasz turniej!”, wynik Kropek 0/750 oraz końcową tabelę 2 pkt/1 pkt.
To weryfikacja modułów i UI na kontrolowanym stanie, nie pełna seria trzech odczekanych timeoutów przez WebSocket.
Ścieżkę finish, filtrowanie rekordów i zaufane źródło sprawdzają testy LobbyRoom.

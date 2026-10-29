---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 09
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-09: P4-012, Kalambury

Płótno obu ról mierzy rzeczywisty nagłówek i kontrolki pod nim. ResizeObserver aktualizuje
pomiar po zmianach ich wysokości; visualViewport/window resize obsługuje zmianę obszaru ekranu.
Współrzędne rysunku nadal 0-1000, zasady, podpowiedź, czat i potwierdzenie Pasuję bez zmian.
DESIGN §6 opisuje wynik. Bez nowych zależności, push, produkcji ani zmian historii rekordów.

Odebrano F4-056:kalambury, 1/1 części w odbiorze przeglądarkowym. Łącznie 9/62 pakietów,
14/267 części, FIX-02 otwarte; następny P4-013, Koło.
U02 (fizyczna klawiatura Android) pozostaje otwarty; poniższa symulacja go nie zamyka.

## Pomiar i zachowanie

- E07 odtworzony w obecnej bazie: 4 osoby, Krótka, zgaduje B, 360×640, dokument 699 px,
  Zgadnij y=570,5..618,5, Pasuję y=626,5..674,5. Historyczne E07 723 px pochodziło z wcześniejszej bazy.
- Po zmianie: 2/4/6 osób × rysujący/zgadujący/obserwator z nickami po 20 znaków:
  dokument dokładnie 360×640, Zgadnij do 559,5, Pasuję do 615,5, narzędzia rysującego do 615,5.
  Wszystkie kontrolki mają 48 px wysokości. Płótno pozostaje kwadratowe, przy 6 długich nickach
  bok 230 px dla rysującego i 149 px dla zgadującego. U obserwatora bok 241 px.
- Rysowanie prawdziwymi zdarzeniami wskaźnika zapisuje kreskę; Wyczyść/Cofnij przywraca ją.
  Ponowny montaż ze stanem z serwera nadal pokazuje kreskę. Normalizacja współrzędnych bez zmian.
- Pomyłka trafia do czatu. Pierwsze Pasuję nie wysyła ruchu, drugie dodaje do passed.
- Symulacja zmniejszonego viewportu 360×360 przy aktywnym polu i 6 długich nickach:
  płótno 48 px, scroll 179 px, pole i Zgadnij y=231,5..279,5, Pasuję y=287,5..335,5.
  Po wysłaniu strzału i potwierdzeniu Pasuję ruchy poprawnie przyjęte.
  To test przeglądarkowy, nie fizycznego Androida ani emisji systemowej klawiatury.

## Pełne partie i sieć

- Prawdziwy Game/Kalambury z adapterem validateMove/applyMove/playerView/isOver:
  oba tryby 2/6 osób, kolejno 2/4/6/12 rund, fazy choose/draw/reveal/over, każde hasło wybrane
  i odgadnięte przyciskami, Dalej dla każdego. Wszystkie partie kończą się poprawnie.
- Lokalny serwer z DB_PATH=:memory:, prawdziwy WebSocket i /dev?n=2 oraz /dev?n=6:
  pełne krótkie partie (2/6 rund), każdy rysuje, wszyscy pozostali zgadują, odsłony i koniec.
- Odświeżenie ramki zgadującego podczas draw przy 6 osobach: sesja wraca do tej samej rundy,
  da się zgadnąć i dokończyć partię. Rewanż wszystkich graczy rozpoczyna nową partię.
- Ramki /dev początkowo miały mniejszy obszar z powodu flex-shrink i obrysu iframe.
  Po korekcie wyłącznie w DOM automatyzacji każda ma innerWidth=360, innerHeight=640;
  w draw dokument każdej ma 360×640, Zgadnij i Pasuję mają pełne 48 px w oknie.
- Automatyzacja odświeżenia skorygowana z nieistniejącego Frame.reload na Frame.goto(tego samego URL).
  Po rewanżu rysujący rotuje; pomiar końcowy wykonano według rzeczywistych ról, bez założenia pierwszej ramki.

## Weryfikacja i commity

pnpm typecheck && pnpm test PASS (1911 testów gier + 36 serwera = 1947).
Build web PASS, dotychczasowe ostrzeżenie pakietu JS >500 kB. git diff --check PASS.
Logi /tmp/kwadrans-05-09-tests.log i /tmp/kwadrans-05-09-build.log.
Zmiana układu bez zmiany zasad, brak potrzeby nowego testu zasad i commitu TDD.

Użytkownik udzielił stałej zgody na commity po każdym zadaniu; push bez zgody pozostaje wyłączony.
Wcześniejsze pakiety zapisano oddzielnie: 8d4ce73 (nagłówek), 0eafad3 (Memory i stan planowania).

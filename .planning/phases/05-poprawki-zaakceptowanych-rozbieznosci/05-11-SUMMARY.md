---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 11
status: in_progress
implementation: complete
requirements: [FIX-02]
---

# 05-11: P4-014 wdrożony, U02 pozostaje do odbioru

Państwa-miasta: przewijana lista kategorii z dolną akcją poza listą. Wysokość zależy od położenia
formularza i widocznego viewportu; po zmianie układu aktywne pole jest dosuwane do widocznego obszaru.
Pierwsze pole dostaje autofocus. Przy 4+ osobach każda kategoria ma tabelę graczy w wierszach,
przy 2/3 zachowano zwartą tabelę. Pełne odpowiedzi i nicki zawijają się, przyciski głosu minimum 48 px.
ZASADY §4 i DESIGN §6 opisują lokalny wyjątek przewijania w trakcie partii.
Bez zmian zasad, punktacji, progu odrzucenia, limitów 90/7/45/20 s, zależności i historii rekordów.

## Zakres odbioru

- F4-093:panstwa-miasta, 48 px: odebrane w przeglądarce.
- F4-152:całość, tabela bez poziomego scroll: odebrane w przeglądarce.
- F4-056:panstwa-miasta, formularz: implementacja i testy przeglądarkowe gotowe,
  fizyczny U02 Android jest jawnym warunkiem i nadal pozostaje otwarty.

Pakiet nie jest w pełni odebrany. 2/3 części; łącznie 10/62 odebranych pakietów,
17/267 części. FIX-02 otwarte. Następny niezależny pakiet P4-015 może być wykonywany bez czekania na U02.
Użytkownik dostał asynchroniczną prośbę o fizyczny test: wszystkie 6 pól, aktywne pole nad klawiaturą,
Oddaj i STOP. Nie potraktowano braku odpowiedzi jako potwierdzenia.

## Dowody przed/po

Przed: tabela sześciu osób miała 576 px szerokości przy kontenerze 326 px (poziomy scroll).
Przyciski miały min-h-11 = 44 px, dla długich odpowiedzi rosły. Formularz był listą na wysokość całej strony.
Po zmianie 360×640, długie nicki i odpowiedzi:
- Formularz 2 osoby: y=188..616, przewijane pola 346 px wysokości przy 552 px treści.
- Formularz 6 osób: y=284..616, pola 250 px przy 552 px treści.
- Oddaj/Dalej kończą się na 604 px, mają po 48 px; dokument 360×640.
- Vote 2/3/4/6: szerokość dokumentu 360 px, wszystkie tabele bez wewnętrznego poziomego scroll.
  Przy 4/6 sześć kategorii po osobnej tabeli 328 px; dostępne 18/30 cudzych odpowiedzi.
  Długie odpowiedzi: cele głosu co najmniej 54 px (CSS minimum 48).
- Summary przy 2/3/4/6 również bez poziomego przewijania.
- Zaznaczenie pierwszej i ostatniej odpowiedzi w oddalonych kategoriach zachowane po przewijaniu;
  wysłany głos zawiera dokładnie te 2 odrzucenia. Pozostałe odpowiedzi domyślnie uznane.
- Zrzut vote 6 obejrzany: .playwright-mcp/05-11-vote6.png, ignorowany w git.

## Zachowanie

Prawdziwy Game/PanstwaMiasta, adapter niezmienionych validateMove/applyMove/playerView/timeoutMove.
- Autofocus pierwszego pola; każde z sześciu pól dostępne przez Dalej i przewinięcie.
- Szkic po 500 ms zawiera wszystkie pola. Ponowny montaż ze stanem serwera odtwarza sześć odpowiedzi.
- Częściowe Oddaj zachowuje wpisaną odpowiedź i oznacza oddanie. STOP po komplecie działa.
- Timeout oddaje szkice reszty i przechodzi do vote; timeout głosowania nie odrzuca odpowiedzi.
- Pięć rund dla 2 i 6 osób, bez odrzuceń: 150 pkt każdy, ranking bez zwycięzcy; punktacja bez zmian.
- Symulacja viewportu 360×360 przy edycji ostatniego pola: pole y=231..279,
  STOP y=300..348; działania poprawne przy 2/6 osobach. To nie jest fizyczny test Androida.
- Pierwszy test mniejszego viewportu wykrył przewijanie przed przeliczeniem listy.
  Poprawiono kolejność przez useLayoutEffect zależny od wysokości, potem test powtórzono z wynikiem PASS.

Bez WebSocket i produkcji w tym odbiorze; odtworzenie szkicu sprawdzono ponownym montażem z playerView.
Fizyczny U02 i zachowanie systemowej klawiatury pozostają niepotwierdzone.

## Weryfikacja

pnpm typecheck && pnpm test PASS: 1911 testów gier + 36 serwera = 1947.
pnpm --filter web build PASS, istniejące ostrzeżenie pakietu JS >500 kB. git diff --check PASS.
Logi: /tmp/kwadrans-05-11-tests.log, /tmp/kwadrans-05-11-build.log.
Brak zmiany zasad, więc nie dodawano nowego testu zasad ani commitu TDD.
Commit implementacji zgodnie ze stałą zgodą użytkownika; bez push.

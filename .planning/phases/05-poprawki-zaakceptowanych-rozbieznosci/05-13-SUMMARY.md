---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 13
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-13: P4-017 wykonany

Środek Kampus Tour zachowuje stałe rundę/limit, status, akcje i ostatni wpis logu.
Dłuższy opis wykorzystuje pozostałe miejsce i może przewijać się pionowo. Nie centrujemy już
wyższej treści z obcięciem obu końców. Rozmiar dotyku przycisków decyzji/okien jest korygowany
odwrotnością skali sceny (zaokrąglenie w górę z zapasem), minimum 48 px na ekranie.

Budowa: Rozbuduj pole otwiera szczegóły bieżącego pola z poziomami w dwóch kolumnach.
Ta sama lista buildChoices i te same koszty; jedynym ruchem pozostaje build z wybranym poziomem.
Pomiń nadal dostępne w środku; Zamknij wraca z dialogu bez ruchu. Pozostałe dialogi mają
powiększone potwierdzenia. Otwarty dialog pola chowa centralny wiersz akcji.

Podsumowanie ogranicza wysokość, przewija część treści i zachowuje stały wiersz akcji.
Po jego otwarciu nie renderujemy drugiej kopii OverActions na planszy. Plansza/Podsumowanie
przełączają widok; Rewanż i Do lobby występują tylko raz. Krótkie etykiety końców linii wykresu
nie nachodzą na statystyki; pełne nicki zachowane w legendzie, title i opisie dostępności.
Panele graczy mają wygrane z RoomView.scores; obserwator ma Oglądasz także w podsumowaniu.

Odebrano F4-058:całość, F4-093:kampus-tour, F4-130:całość, F4-135:całość (4/4).
Łącznie 12/62 pakietów i 22/267 części. FIX-02 otwarte. Następny P4-018.
P4-014 nadal oczekuje odbioru Androida; P4-015 pomiaru przed wyborem poprawki.
Użytkownik odpowiedział: „Zrobię pomiar później, kontynuuj pozostałe pakiety”. Nie pytać ponownie.

## Pomiar i odbiór

Prawdziwy Game/KampusTour, moduł zasad i seed 42. Bot uzyskuje stany przez walidowane ruchy
(pick/buy, skip budowy i wykupu, pozostałe timeoutMove). 2/4 graczy; oba okna 640×360 i 360×640 z CSS obrotem.
Stany buy3 (Biblioteka, runda 1, D), roll z MPK, over po limicie, build, pick, card i juwenalia.

- Przed: scena 800×390, skala 0,8, przyciski Kup/Pomiń faktycznie 38,39 px.
  Historyczne E13-E15 wskazują środek y=111,73..248,25, treść wystającą górą i dołem;
  Podsumowanie miało 35,19 px. Aktualny pomiar potwierdził rozmiar przycisków i źródłowy overflow-hidden.
- Po E13 buy: runda y=116,33..129,52; Kup/Pomiń y=153,30..202,09; log y=232,28..245,06.
- Po E14 MPK: analogicznie runda, Rzuć i ostatni log w środku; skrócony opis MPK zostaje widoczny.
- Po E15 Plansza: runda y=114,92..128,11, log y=180,30..193,08;
  Rewanż, Do lobby i Podsumowanie y=196,27..245,06.
- W pionowym oknie te same obszary po obrocie: obie osie przycisków minimum 48 px.
- Zwykłe przyciski, Zamknij, poziomy, sprzedaż i potwierdzenie karty: minimum 48,80 px.
  Wybór postaci minimum 54,06 px. Pomiar po zakończeniu wejścia dialogu (350 ms), nie w klatce jego skali.
- Budowa przy 2/4 i długich nickach: widoczne poziomy 1/2; uzupełniony widok z kompletem grupy
  i budżetem pozwala wybrać także 3 i landmark. Wysłany ruch landmark przechodzi validateMove.
- Juwenalia i MPK: klik pola oraz potwierdzenie wysyłają odpowiednią intencję i zamykają szczegóły.
- Sell: kontrolowany stan długu na bazie legalnego stanu Juwenaliów; własne pole i Sprzedaj działają,
  przycisk y=268,72..317,52 (poziom). To test układu długu, nie nowa reguła ekonomii.
- Obserwator przy 2/4 widzi Oglądasz; panele zawierają wygrane 1/2/3/4 z RoomView.scores.
- Ponowny montaż z playerView odtwarza każdą fazę; zamknięcie/otwarcie podsumowania i intencja rewanżu PASS.
  Odbiór komponentu z kontrolowanymi wiadomościami, bez sesji WebSocket i zmian bazy.
- Zrzuty obejrzane: .playwright-mcp/05-13-buy.png, 05-13-summary.png i 05-13-summary-final.png.

## Weryfikacja

pnpm typecheck && pnpm test PASS (1911 gier + 36 serwera = 1947).
Build web PASS, istniejące ostrzeżenie pakietu JS >500 kB. git diff --check PASS.
Logi /tmp/kwadrans-05-13-tests.log, /tmp/kwadrans-05-13-build.log.
ZASADY §4 i DESIGN §6 zaktualizowane; usunięto dawny wyjątek 44 px budowy.
Bez zmian zasad, ekonomii, id ani nowych zależności. Nie dodawano testu zasad ani commitu TDD.
Animacje useWalk/useRolling i opóźnienie akcji po marszu niezmienione: osobny P4-018.
Commit zgodnie ze stałą zgodą użytkownika, bez push i produkcji.

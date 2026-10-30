---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 16
status: complete
completed: 2026-10-30
requirements: [FIX-02]
---

# 05-16: P4-036 wykonany

Wyjątek <48 px obowiązuje tylko z wyborem widocznym na planszy i osobnym potwierdzeniem 56 px
w kolorze gracza, które nazywa wybór. Drugie dotknięcie tego samego pola nadal potwierdza.
Zapisany w ZASADY §4 i DESIGN §6 z nazwą gry i rozmiarem pola. Memory, Kampus Tour i gry na czas bez wyjątku.

Stan przed zmianą różnił się od karty: Labirynt wysyłał krok od razu, a Chińczyk miał tylko
drugie dotknięcie pola ~29 px, bez przycisku 48 px. Gomoku miał przycisk „Postaw” bez nazwy pola.

- Labirynt.tsx: stan `aim`, duch pionka z przerywanym obrysem, `stepName` liczy kierunek po obrocie planszy.
  Wybór kasuje zmiana trybu, wysłanie i zmiana `view.turn` (ruch po limicie).
- Chinczyk.tsx: w fazie własnego ruchu kostka obok przycisku „Dotknij pionka” → „Wyjdź na start” / „Rusz o 4 pola” /
  „Wejdź do domku”, przy biciu „… i zbij”. Wiersz zastępuje kafel z podpowiedzią, więc pasek nie rośnie.
- PiecWRzedzie.tsx: „Postaw na H8”, aria-label pól w tej samej notacji.

Odbiór 1/1 części F4-093:`geste-plansze`. Łącznie 15/62 pakietów, 28/267 części. FIX-02 otwarte, następny P4-007.

## Odbiór w przeglądarce

/dev, wnętrze ramki dokładnie 360×640, zdarzenia przez prawdziwe przyciski i pointer na SVG.
- Labirynt Klasyczny 9×9, 3 osoby (obroty 0°, 180°, 90°): pole ~34 px; dotknięcie daje ducha i aktywny przycisk 56 px, pionek stoi.
  Nazwy zgodne z przesunięciem na ekranie u każdego gracza. Drugie dotknięcie i przycisk wysyłają ruch; Ściana→Pionek kasuje wybór.
- Labirynt Szybki 7×7, 2 osoby + obserwator: „Przeskocz w górę” przy sąsiednim pionku; obserwator bez kropek i przycisku.
- Chińczyk Klasyczny, 3 osoby: wybór pionka nie wysyła ruchu (1,5 s), przycisk 56 px; zebrano „Wyjdź na start”, „Rusz o 2/3/4 pola”,
  „Rusz o 6 pól”, „Wejdź do domku”. Strona 640 px w każdym stanie wyboru (wersja z przyciskiem pod kafelkiem dawała 641 px).
- Gomoku, 2 osoby + obserwator: pole 22 px, „Postaw na H8” 56 px, obserwator 0 aktywnych pól; ruch widoczny u rywala.
- Statki Flota wojenna 12×12: pole 23 px, „Strzel w G3” 56 px, strzał dopiero po potwierdzeniu.

Rozbieżności istniejące przed zmianą, poza tym pakietem: Labirynt u gracza z ruchem 647 px (to samo na HEAD, P4-010),
Statki w bitwie 823 px z własną flotą pod spodem (P4-008).

## Weryfikacja

pnpm typecheck && pnpm test PASS: 2013 testów gier + 36 serwera = 2049. Build web PASS (istniejące ostrzeżenie >500 kB).
Bez nowych zależności, zmian id, zasad ruchu ani kontraktu. Commit implementacji bez push.

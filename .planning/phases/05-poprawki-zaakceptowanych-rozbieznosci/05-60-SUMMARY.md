---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 60
status: complete
completed: 2026-10-31
packages: [P4-053]
---

# 05-60 SUMMARY: P4-053

Pomiary: Playwright, Chromium 360×640, pasek przewijania wyłączony (jak nakładkowy na telefonie), tekst 100% i 115% (`html { font-size }`).

- F4-066 (D4-066 A): z pełnym kodem „Dołącz” jest `btn-primary`, a „Zagraj” `btn-ghost`; bez kodu odwrotnie. Sprawdzone w przeglądarce. KONCEPT §1, DESIGN §3.1.
- F4-068: zmierzone obcięcie: „Wszystkie (30)” przy 115% ma 145 px treści w 134 px (przy 100%: 130 w 137, ciasno). Teraz „Wszystkie”: 117 w 131 px nawet przy 130%. Uwaga: „Losowa gra” przy 130% ociera się o krawędź (133 w 131), przy 115% mieści się; poza zakresem, do U09.
- F4-070: tytuł Setup i ustawień turnieju był Satoshi 16 px 400 (zmierzone), teraz `font-semibold`.
- F4-071: Rekordy: kafle podsumowania i „Jeszcze nie grane” na `bg-surface` (rola kart rekordów), pigułka miejsca sam obrys `line`.
- F4-072: „Pokaż wszystkie” / „Zwiń” `text-fg-muted underline underline-offset-4` jak inne linki.
- F4-123: `repeat(N, minmax(0, 1fr))` w Quiz i Dziesiątkach, Sudoku `w-full max-w-64`.
- F4-133: podpisy planszy Kampus Tour: przy 360×640 żaden nie wychodzi poza pole (scrollWidth/scrollHeight, zrzut). Krój 9-11 px CSS przed skalowaniem planszy; czytelność to U04 na telefonie, bez zmian w kodzie (D4-098: nie poprawiać hipotetycznych obcięć).
- F4-136: podsumowanie Kampus Tour (9-11 px w wykresie) nie zmierzone w tej sesji (wymaga końca partii); zostaje do U04, bez zmian.
- F4-142: zmierzone obcięcie podglądu Koloru liter: przy 115% rząd 329 px w oknie 282 px (przy 100%: 287 w 292). Teraz trzy odpowiedzi i `flex-wrap justify-center`: 217/292 i 248/282 px, Intro mieści się w oknie przy obu rozmiarach.
- F4-143: opis „Wybierz kolor liter, nie znaczenie słowa (zwykle się różnią)”, bo co czwarta plansza jest zgodna.
- F4-144: `Preview` Koła jako osobny komponent z kolorem gracza, SVG h-28 jak w Mapie.
- TDD `f085fc4` (7 testów RED), testy bez zmian w implementacji. Typy, testy (games 2288, server 45, web 153) i build PASS.
- Do odbioru (U03/U04/U09): telefon z dużą czcionką: Home, podgląd Koloru liter, plansza i podsumowanie Kampus Tour.

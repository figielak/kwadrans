---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 08
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-08: P4-011 wykonany

Memory: odstęp między planszą a instrukcją zmniejszony z 12 do 8 px.
Pozostałą geometrię naprawił wcześniejszy P4-006; nie dodano zbędnego skalowania.
Rozmiary kart, odstępy kart, reguły, animacje i obsługa ruchów bez zmian.
DESIGN §6 zawiera wynik odbioru. Bez nowych zależności, commitów ani push.

Odebrano F4-056:memory, 1/1 części. Łącznie 8/62 pakietów i 13/267 części.
FIX-02 pozostaje otwarte; następny P4-012: Kalambury, zgadywanie i Pasuję.

## Geometria 360×640

Prawdziwy Game/Memory i GAMES.memory, setup seed 42. Trzy tryby × 2/6 osób ×
me=A/B/obserwator = 18 konfiguracji. Nicki po 20 znaków. Nagłówek zwinięty.

| Tryb | Rozmiar karty | Ostatnia karta, dół gracz / obserwator | Instrukcja, dół gracz / obserwator |
|---|---|---|---|
| Mała | 76×76 | 470 / 498 | 510 / 538 |
| Średnia | 76×60,8 | 546,8 / 574,8 | 586,8 / 614,8 |
| Duża | 48×48 | 470 / 498 | 510 / 538 |

Przed zmianą: dokument Średniej u obserwatora 643 px, pozostałe konfiguracje 640 px.
Po zmianie: wszystkie dokumenty dokładnie 360×640; wszystkie karty i instrukcja w oknie.
Karty Dużej spełniają 48 px w obu wymiarach, bez wyjątku dla gęstych plansz.
E01/E02 ze standardowymi nickami już naprawił P4-006: dokument 640 zamiast historycznych 695/651.
Zrzut obserwatora Średniej obejrzany: .playwright-mcp/05-08-memory-observer.png (ignorowany w git).

## Zachowanie i weryfikacja

Każdy tryb przy 2 i 6 osobach rozegrano do końca przez przyciski prawdziwego komponentu.
Lokalny adapter send używa niezmienionych validateMove/applyMove/playerView/isOver.
- Pierwsze odkrycie zmienia instrukcję na Odkryj drugą kartę.
- Ponowny montaż z tym samym widokiem zachowuje odkrytą pierwszą kartę (odtworzenie po refresh).
- Para zapisuje obie karty właścicielowi i zachowuje turę.
- Pudło od razu przenosi turę na B, karty zakrywają się po 1500 ms także po ponownym montażu.
- Kolejne pary prowadzą do końca, poprawny nagłówek zwycięzcy.
- Rewanż przez przycisk odtwarza pustą planszę z innym seedem; karty i instrukcja nadal mieszczą się w oknie.
- 18 / 26 / 38 ruchów na partię odpowiednio dla Małej / Średniej / Dużej (jedno pudło na partię).

To odbiór UI z rzeczywistymi zasadami i kontrolowanym stanem, bez WebSocket i produkcji.
Nie zmieniano reguł, więc nie dodawano testów zasad ani commitów TDD dla zmiany odstępu CSS.

- pnpm typecheck && pnpm test: PASS, 1911 testów gier + 36 serwera = 1947.
- pnpm --filter web build: PASS, istniejące ostrzeżenie o pakiecie >500 kB.
- git diff --check: PASS.
Logi: /tmp/kwadrans-05-08-tests.log, /tmp/kwadrans-05-08-build.log.

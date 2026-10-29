---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 12
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-12: P4-016 wykonany

Wspólne OverActions/NextActions są w StickyBar, z pionowym układem akcji i mt-auto dla krótkiej treści.
StickyBar ma opcjonalne className; pozostałe użycia zachowują wygląd. Zasady i DESIGN opisują
jawny wyjątek pionowego przewijania wyników. Nie zmieniano handlerów, punktacji, zależności ani id.
Wczesny return Kampus Tour omija wspólny pasek, więc jego dialog nie dostał drugiej kopii akcji.

Odebrano F4-092:całość, 1/1 części. Łącznie 11/62 pakietów i 18/267 części.
P4-014 nadal oczekuje fizycznego U02 (2/3 odebrane). P4-015 oczekuje pomiaru telefonu PRZED wyborem poprawki;
nie zmieniono Szacowania, Kropków, Kąta, W pamięci ani metadanych viewportu na podstawie emulacji.
Użytkownik dostał prośbę o pomiar visualViewport/innerHeight/rect formularza po autofocus/rotacji/zamknięciu klawiatury.
Następny niezależny pakiet P4-017: Kampus Tour.

## Dowody 360×640

Prawdziwy Game i moduły zasad, setup seed 42. API rekordów kontrolowane w przeglądarce,
żeby odtworzyć pełny RecordPanel, nowy rekord 500→1000 i awans 2→1. Bez produkcji i zapisu do bazy.

- Przed: Koło 4 osoby, pełny panel rekordów, dokument 1519 px;
  Rewanż y=1391..1439, Do lobby y=1447..1495, całkowicie poza oknem.
  To aktualne odtworzenie E10, z panelem bogatszym niż historyczne 1345 px.
- Po: ta sama treść przewijana, Rewanż y=524..572, Do lobby y=580..628.
- Koło solo/4/6, w tym U07 z Nowy rekord i Awans z 2. miejsca:
  przy scroll 0%, 50%, 100% obie akcje mają pełne 48 px w oknie.
  Na końcu przyciski y=500..548 i 556..604; ostatni panel treści kończy się na 480,
  pasek zaczyna na 492. Szerokość dokumentu 360, ostatni wiersz nie zostaje pod paskiem.
- Kliknięcia wysyłają dokładnie rematch/toLobby; solo rematch/onLeave.
- Turniej między grami: Dalej y=524..572 i Zakończ turniej y=580..628, handler rematch/toLobby.
  Finał: Rewanż/Do lobby w tych samych granicach; tabela końcowa nadal obecna.
- E08 Kalambury, 4 osoby reveal: istniejące Dalej y=580..628; na końcu scroll około 556..604.
- E12 Państwa-miasta, 4 osoby summary: istniejące Dalej y=580..628; na końcu około 556..604.
- Zrzut Koła 6 osób obejrzany: .playwright-mcp/05-12-kolo-results6.png (ignorowany w git).

## Weryfikacja

pnpm typecheck && pnpm test PASS, 1911 testów gier + 36 serwera = 1947.
Build web PASS z istniejącym ostrzeżeniem pakietu JS >500 kB. git diff --check PASS.
Logi /tmp/kwadrans-05-12-tests.log, /tmp/kwadrans-05-12-build.log.
Zmiana układu bez zmian zasad, więc nie dodawano testów zasad ani commitu TDD.
Commit zgodnie ze stałą zgodą użytkownika, bez push.

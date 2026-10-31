---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 07
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-07: P4-006 wykonany

Wspólny nagłówek aktywnej partii wykorzystuje GameDots także w grach głównych.
Status nad jednym wierszem kropek i limitu. Dotknięcie rozwija pełne nicki, statystyki i wygrane;
rozłączenie ma przerywany obrys oraz opis dostępności, po rozwinięciu również tekst.
Obserwator widzi Oglądasz. Zmiana fazy lub gry zwija szczegóły. Własne nagłówki bez przebudowy.
ZASADY §4 i DESIGN opisują końcowy układ. Bez zmian reguł, zależności i id, bez commitów ani push.

Odebrano F4-056:naglowek-Game (1/1). Łącznie 7/62 pakietów, 12/267 części; FIX-02 otwarte.
Następny P4-011: Memory, wszystkie rzędy kart.

## Pomiar 360×640 przed/po

Prawdziwy komponent Game i definicje GAMES, setup seed 42, nicki A-F, domyślne tryby.
Pomiar tej samej geometrii co E01-E06. Wysokość dokumentu co najmniej 640 px z min-height Screen.

| Przypadek | Nagłówek przed | Nagłówek po | Dokument przed | Dokument po |
|---|---:|---:|---:|---:|
| E01 Memory Średnia, 4 | 186 | 106 | 695 | 640 |
| E02 Memory Średnia, 2 | 142 | 106 | 651 | 640 |
| E03 Labirynt Klasyczny, 4 | 274 | 106 | 830 | 662 |
| E04 Chińczyk Klasyczny, 4 | 186 | 106 | 662 | 640 |
| E05 Gomoku, 2 | 186 | 106 | 686 | 640 |
| E06 Statki, rozstawianie, 2 | 186 | 106 | 781 | 701 |

E04 sprzed zmiany różni się od historycznego pomiaru 274/750; tabela podaje rzeczywisty pomiar
bieżącej bazy, nie przypisuje historycznej wartości obecnemu kodowi. Wszystkie szerokości 360 px.
Sam nagłówek nie zamyka odbioru plansz: Labirynt i Statki nadal mają nadmiar wysokości,
Memory wymaga wszystkich trybów w P4-011. Rozwinięte szczegóły zajmują miejsce w normalnym układzie,
nie nakładają się na planszę; można je ponownie zwinąć.

## Odbiór przeglądarkowy

- 2/4/6 osób, nicki po 20 znaków, obserwator, rozłączony rywal i dropped:
  nagłówek 134 px z podpisem Oglądasz, dokument bez poziomego przewijania.
  Stan rozłączenia w aria-label i obrysie; pasek Łączenie ponownie obecny.
- Enter rozwija, klik zwija, aria-expanded zmienia się. Pełne nicki i wygrane każdego widoczne.
  Przycisk ma 48 px wysokości. Pasek czasu ma dodatnią szerokość również przy 6 osobach
  i trzycyfrowym limicie 300 s (około 8 px).
- Statki, wielu oczekujących: zwinięty status z liczbą, rozwinięty z pełnymi nickami.
- Sekwencja: postęp 3/100 i wygrane po rozwinięciu. Schulte zachowuje timer i kropki.
- Stoper, Rytm, Przytrzymaj, Za zasłoną nadal ukrywają timer grającego.
- Kalambury i Państwa-miasta zachowują własne nagłówki, bez nowego GameDots.
- Kontrolowana zmiana props do końca partii: tytuł zwycięzcy, pigułki, Rewanż i Do lobby.
  Powrót do playing zwija szczegóły. Reload strony i ponowny montaż: zwinięty nagłówek 106 px.
- Zrzut 6 osób obejrzany: `.playwright-mcp/05-07-six.png` (ignorowany przez git).

Odbiór komponentu z kontrolowanymi props, bez sesji sieciowej i zmian bazy.
Błędy konsoli wyłącznie ERR_CONNECTION_REFUSED do API nieuruchomionego serwera,
bez błędów renderowania React. Pierwsze asercje końca wymagały korekty fixture:
obserwator i gracze ready=true nie mają etykiety Rewanż. Odbiór powtórzony jako gracz z ready=false.

## Weryfikacja

- pnpm typecheck && pnpm test: PASS (1911 gier + 36 serwera = 1947).
- pnpm --filter web build: PASS; istniejące ostrzeżenie pakietu JS >500 kB.
- git diff --check: PASS.
- Zmiana wyłącznie układu, TDD zasad nie dotyczy. Regresja oparta o pomiar przed/po i scenariusze UI.

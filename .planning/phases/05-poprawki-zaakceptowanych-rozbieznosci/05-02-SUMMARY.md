---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 02
status: complete
completed: 2026-10-26
requirements: [FIX-02]
---

# 05-02: P4-027 wykonany

Podpowiedź Kalamburów jest dostępna wyłącznie po limicie pierwszej połowy rysowania.
Rysujący nie może wcześniej wysłać `hint`, także z fałszywym `source` w JSON.
Wykonano **1/1 części P4-027, F4-039:całość**. Faza 5: **2/62 pakietów, 6/267 części poprawek**.
FIX-02 pozostaje otwarte.

## Kolejność TDD i zakres

- Na prośbę użytkownika „Tak” zapisano dokładnie pięć przygotowanych plików w commicie
  `50172d59cbbe642c4ca3eafe7345e276be9ae4e7`, `Kalambury: testy zaufanego źródła podpowiedzi`.
- Testy i dokumentacja powstały przed implementacją; dowody stanu RED zachowuje [05-02-TDD](05-02-TDD.md).
- Po commicie dodano `MoveContext` jako opcjonalny czwarty argument `validateMove` w `core.ts`.
  Brak kontekstu w Kalamburach oznacza klienta. Pozostałe gry zachowują zgodność z trzema argumentami.
- `LobbyRoom` przekazuje jawnie `client` z handlera wiadomości i `timeout` z callbacku zegara.
  Prywatne `play` wymaga kontekstu; zawsze uruchamia walidację przed `applyMove`. Kontekst nigdy nie pochodzi z payloadu.
- Kalambury dopuszczają hint tylko dla rysującego, w `draw`, przy `half === 0`, ze źródłem timeout.
  Dotychczasowa zmiana połowy, odsłonięcie jednej litery i zmiana klucza `turn` pozostają bez zmian.
- Usunięto tymczasowe adnotacje „przed implementacją” z KONCEPT i ZASADY-GIER. Testów po commicie nie zmieniano.

## Odbiór

Ponownie sprawdzono miejsce wskazane w F4-039 (`kalambury.ts`, gałąź hint) i obie ścieżki wywołania `play`.
Stary warunek dopuszczający klienta zastąpił warunek zaufanego timeoutu. Regresję odtwarzają testy przed kodem;
po zmianie wszystkie przechodzą.

| Kontrola | Wynik |
|---|---|
| Kalambury i kontrakt rejestru | 259 testów poprawnych |
| Handlery LobbyRoom, 2/6 osób, obserwator, fałszywe source | 6 testów poprawnych |
| `pnpm typecheck && pnpm test` | games/server/web: typy poprawne; 1868 testów gier + 21 serwera = **1889 poprawnych** |
| `pnpm --filter web build` | poprawnie; istniejące ostrzeżenie o dużym pakiecie JS, bez błędu |
| `/dev?n=2` i `/dev?n=6`, refresh w obu połowach | poprawnie; szczegóły [05-02-BROWSER](05-02-BROWSER.md) |
| `git diff --check`; testy bez zmian względem commitu | poprawnie |

Nie dodano zależności, nie zmieniono id, stanu JSON, punktacji ani danych. Serwer nadal nie ma bezpośredniego zod.
Baza odbioru była wyłącznie w pamięci. Bez push i produkcji; implementacja pozostaje lokalna, poza commitem testów.
Zachowano zastane zmiany fazy 4 i 05-01. Odbiór fizycznych urządzeń innych pakietów pozostaje otwarty.

## Następny krok

[05-03-PLAN](05-03-PLAN.md): P4-002, najgorszy wynik po limicie w Schultem, Sudoku i Kropkach.
Plan przygotowany, bez rozpoczęcia testów ani implementacji. Wspólny kontekst źródła jest już dostępny;
nie tworzyć drugiej ścieżki omijającej `validateMove`.

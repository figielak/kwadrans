---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 03
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-03: P4-002, najgorszy wynik po limicie

Schulte i Sudoku odróżniają nowe ukończenie od timeoutu. Każde ukończenie jest wyżej,
nieukończeni remisują; nowe timeouty nie dają rekordu. Policz kropki nalicza najgorszy błąd w każdej rundzie.

Wykonano **1/1 części P4-002, F4-001:całość**. Faza 5: **3/62 pakietów, 7/267 części poprawek**. FIX-02 pozostaje otwarte.

## TDD i implementacja

- Użytkownik „Tak” zlecił osobny commit pięciu przygotowanych plików testów:
  `e635dc9cdaa3e1ed81f259484fa59b66f8a98bc2`, `Mini-gry: testy najgorszego wyniku po limicie`.
  Dokumentację przygotowano wcześniej, [stan RED](05-03-TDD.md) odtwarza błędy przed kodem.
  Po commicie testów nie zmieniano.
- Nowe wyniki Schultego/Sudoku zapisują `completed: true/false` w JSON. Brak pola w ruchu klienta to ukończenie;
  nieukończenie wymaga zaufanego kontekstu timeout i kanonicznego ruchu zastępczego.
  Fałszywe `source` lub `context` w JSON nie daje uprawnień. Wszystko przechodzi przez `validateMove`.
- Wspólny `byCompletion` z `core.ts` opakowuje porównanie czasów z karami.
  `ranked` nadal wylicza zwycięzcę i turniejowe miejsca z jednego komparatora.
- `record.score` nowego timeoutu zwraca Infinity jedynie jako sygnał dla istniejącego filtra `Number.isFinite`
  w `LobbyRoom.finish`. Do JSON i SQLite nie trafia niefinitywna liczba. Nie dodano drugiej ścieżki zapisu.
- Ekrany Schulte/Sudoku pokazują „Nieukończono”. Przewaga w sekundach dotyczy wyłącznie dwóch wyników
  bez jawnego nieukończenia; timeout nie daje mylącej przewagi. Wspólny Game pomija RecordPanel dla niefinitywnego wyniku gracza.
- W Kropkach brak odpowiedzi nalicza `max(n, 99-n)`, w aktualnej partii razem 750.
  Najgorsza dozwolona odpowiedź może remisować z timeoutem, nigdy być za nim.
- Stare wyniki i detail bez completed nie są oznaczane ani przeliczane. Ich wyświetlanie zachowuje czas z karą;
  sam czas równy limitowi nie dowodzi timeoutu. Historyczne niedoskonałości pozostają zgodnie z ZG4-v1 §3.1.
- Dokumenty: ZASADY-GIER trzech gier, KONCEPT §2.4 i lista pomocników core, ZASADY §3.

## Weryfikacja

| Kontrola | Wynik |
|---|---|
| Trzy gry: testy celowane | 270 PASS |
| Rzeczywiste handlery LobbyRoom, Kalambury i P4-002 | 14 PASS |
| `pnpm typecheck && pnpm test` | wszystkie typy poprawne; 1889 testów gier + 29 serwera = 1918 PASS |
| `pnpm --filter web build` | PASS, dotychczasowe ostrzeżenie o pakiecie JS > 500 kB |
| Stare detail, timeout, remis i RecordPanel na 360×640 | PASS w prawdziwych komponentach React, API rekordów HTTP 200 |
| Seria Schulte → Sudoku → Kropki | poprawne places, punkty 0:1 → 1:0 → 1:0, tabela 2:1 i zwycięzca A; ekran wyników turnieju poprawny |
| Rzeczywisty zegar serwera, /dev 2/6 i odświeżenie | PASS we wszystkich czterech kombinacjach; [05-03-BROWSER](05-03-BROWSER.md) |
| Testy bez zmian po commicie; `git diff --check` | PASS |

Baza odbioru wyłącznie w pamięci. Nie dodano zależności, nie zmieniono id ani schematu/historii SQLite.
Serwer nadal nie ma bezpośredniej zależności zod. Zachowano zastane zmiany fazy 4, 05-01 i 05-02.
Commit dotyczy wyłącznie testów; implementacja pozostaje lokalna. Bez push i produkcji.

## Dalej

P4-003: Zakupy, limit i zachowanie wyniku. Zakres już zatwierdzony w S5-v1.

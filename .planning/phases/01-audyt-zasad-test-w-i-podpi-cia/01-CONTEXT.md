# Phase 1: Audyt zasad, testów i podpięcia - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Audyt bez zmian w repo: dla każdej gry z `GAMES` (38 gier) oraz dla Turnieju porównać kod zasad, testy i podpięcie z `KONCEPT.md` §2, `ZASADY-GIER.md` i `ZASADY.md` §2, §3, §6. Wynik to jeden `FINDINGS.md` w katalogu fazy (wymagania RULE-01, RULE-02, RULE-03, WIRE-01, WIRE-02). Poprawki, UI, animacje i balans należą do innych faz.

</domain>

<decisions>
## Implementation Decisions

### Dokładność testów (ZASADY.md §2)
- **D-01:** Pełne mapowanie zasada→test dla każdej gry: lista zasad z jej sekcji w `ZASADY-GIER.md` i test, który ją sprawdza, albo luka.
- **D-02:** Nazwa testu nie musi brzmieć jak zasada; liczy się, co test sprawdza. Zła nazwa to co najwyżej wpis o niskiej wadze.
- **D-03:** Test niepełny wobec litery §2 to luka (np. „wygrana każdego gracza” tylko dla A, brzegi bez obu stron, `timeoutMove` nie w każdej fazie).
- **D-04:** Testy kontraktowe w `packages/games/src/index.test.ts` (`describe.each(CASES)`, `RECORDS`) zaliczają punkt obowiązkowy, jeśli naprawdę pokrywają daną grę (i każdy jej tryb/fazę). Audyt sprawdza, co dokładnie pokrywają, zanim uzna punkt za spełniony.

### Kod czy dokument
- **D-05:** Przy rozbieżności kod ↔ `ZASADY-GIER.md` wpis proponuje kierunek („popraw dokument” albo „popraw kod”) z krótkim uzasadnieniem z git log/blame, testów i komentarzy. Ostateczna decyzja w fazie 4.
- **D-06:** `ZASADY-GIER.md` stoi wyżej niż `KONCEPT.md` §2 (ten jest skrótem). Rozbieżność między dokumentami to osobny wpis; kod porównujemy z `ZASADY-GIER.md`.
- **D-07:** Zasady obecne tylko w kodzie zgłaszamy, gdy gracz je odczuwa (czasy, kary, zakresy, remisy, wpływ na wynik). Szczegóły techniczne (np. limit długości tekstu w schemacie) pomijamy.
- **D-08:** Szkice w `plany/` i mapa `.planning/codebase/` nie są źródłem reguł; nie porównujemy ich i nie zgłaszamy. Mapa może pomóc znaleźć pliki.

### Wagi i układ raportu
- **D-09:** Waga według wpływu na gracza:
  - **wysoka**: nieuczciwy wynik albo rekord, błąd zasady, zepsuty rekord lub turniej, złamana reguła twarda (`rng`, JSON, mutacja stanu),
  - **średnia**: luka w testach obowiązkowych, brak podpięcia, stała niezgodna z dokumentem bez wpływu na uczciwość,
  - **niska**: nazwy testów, opis w `KONCEPT.md`, kosmetyka dokumentów.
- **D-10:** Układ `FINDINGS.md`: na górze lista wpisów o wysokiej wadze i tabela podpięć (kryterium 4 roadmapy, gra × elementy §6), potem sekcja dla każdej gry (zasady, §3, testy, ekran końcowy). Wspólny format wpisu z roadmapy: gra, `plik:linia`, źródło reguły, waga, propozycja.
- **D-11:** Odstępstwa od §3 już opisane w `ZASADY-GIER.md` z powodem idą na osobną krótką listę „odstępstwa z powodem” (bez wagi, poza rozbieżnościami), żeby było widać, że sprawdzono.
- **D-12:** Ta sama luka w wielu grach to jeden wpis zbiorczy z listą gier i `plik:linia` dla każdej; sekcje gier odsyłają do niego.

### Metoda sprawdzania
- **D-13:** Dozwolone są tymczasowe skrypty poza repo (katalog tymczasowy, niecommitowane), które ładują `GAMES` i sprawdzają reguły §3 hurtem: `timeoutMove` w kolejnych fazach przechodzi `validateMove`, JSON round-trip, brak mutacji w `applyMove`, grep na `Math.random`/`Date.now`. Wynik skryptu jest dowodem we wpisie. Repo zostaje bez zmian (poza plikami w `.planning/`).
- **D-14:** Kampus Tour w pełnym zakresie (zasady, §3, testy, podpięcie), ale jako osobny plan. Balans ekonomii zostaje w fazie 3.
- **D-15:** Turniej (`packages/games/src/turniej.ts`, `KONCEPT.md` §2.6) audytujemy tak jak gry. `quiz.ts` i `core.ts` tylko w zakresie, w jakim używa ich konkretna gra; `lobby.ts` i reguły platformy są poza zakresem.
- **D-16:** Plany według typu gry (np. gry główne po kolei; ukryty stan i fazy równoczesne; mini-gry w 2-3 paczkach; przekrojowo podpięcie i ekran końcowy), a na końcu scalenie w jeden `FINDINGS.md`. Dokładny podział ustala planner.

### Claude's Discretion
- Dokładny podział mini-gier na paczki i kolejność planów.
- Forma skryptów sprawdzających i sposób zapisu dowodów we wpisach.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reguły do sprawdzenia
- `ZASADY.md` §2: testy obowiązkowe ogólne i zależne od typu gry
- `ZASADY.md` §3: spójność zasad między grami (`timeoutMove`, remis, start, `rng`, JSON, `ranked`/`places`, ekran końcowy z samego stanu, sufit, kary, `core.ts`, limity)
- `ZASADY.md` §6: lista podpięć
- `ZASADY-GIER.md`: dokładne zasady każdej gry (źródło nadrzędne wobec `KONCEPT.md`, D-06)
- `KONCEPT.md` §2 (opis gier, w tym §2.6 Turniej) i §3 (kontrakt `GameDefinition`, reguły platformy, limity tury)
- `AGENTS.md`: twarde reguły

### Zakres i format
- `.planning/ROADMAP.md`: Phase 1, kryteria sukcesu i wspólny format `FINDINGS.md`
- `.planning/REQUIREMENTS.md`: RULE-01..03, WIRE-01..02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/games/src/index.test.ts:56`: `describe.each(CASES)` (testy kontraktu dla każdej gry i trybu); `:134` `RECORDS` (przypadki rekordów mini-gier). Podstawa dla D-04.
- `packages/games/src/core.ts`: `ranked` (:89), `SOLO` / `soloState` (:141, :147), `withSum` (:213).
- `GAMES` w `packages/games/src/index.ts`: lista do iteracji w skryptach (D-13).

### Established Patterns
- 41 plików `*.test.ts` w `packages/games/src` (ok. 10,5 tys. linii), z nagłówkiem listującym zasady (wzór `stoper.test.ts`).
- Wspólne mechaniki: `quiz.ts` (Kolor liter, Liczenie, Inny element, Obrót, Literówka, częściowo Dziesiątki), `Szacowanie.tsx` (Policz kropki, Kąt).

### Integration Points (tabela podpięć, WIRE-01)
- `apps/web/src/screens/Game.tsx:477`: `MINI_GAMES` jako ręczny `Set` id; uwaga: `apps/web/src/screens/Lobby.tsx:246` ma drugi `MINI_GAMES` (filtr `minPlayers === 1`). Audyt powinien porównać oba z `GAMES`.
- `apps/web/src/screens/Lobby.tsx:284`: `ICONS`.
- `apps/web/src/screens/Records.tsx:20`: `FORMAT`.
- `apps/web/src/games/MiniGame.tsx`: mini-gra po `id` (ekran końcowy z samego stanu, WIRE-02).

</code_context>

<specifics>
## Specific Ideas

Brak dodatkowych wymagań; wszystkie decyzje to opcje rekomendowane w dyskusji.

</specifics>

<deferred>
## Deferred Ideas

Brak; dyskusja nie wyszła poza zakres fazy.

</deferred>

---

*Phase: 01-audyt-zasad-testow-i-podpiecia*
*Context gathered: 2026-10-22*

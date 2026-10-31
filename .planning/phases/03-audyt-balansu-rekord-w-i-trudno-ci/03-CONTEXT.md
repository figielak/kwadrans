# Phase 3: Audyt balansu rekordów i trudności - Context

**Gathered:** 2026-10-24
**Status:** Ready for execution (decyzje zaproponowane przez plannera, do potwierdzenia przez użytkownika)

<domain>
## Phase Boundary

Audyt bez zmian w repo: każda mini-gra (30) i każda gra główna (Kampus Tour, Gomoku, Statki, Chińczyk, Labirynt, Memory, Państwa-miasta, Kalambury) oraz Turniej
oceniane pod kątem uczciwości wyników i dobrania trudności (wymagania REC-01..REC-03, DIFF-01..DIFF-03). Wynik to jeden `FINDINGS.md` w katalogu fazy, w formacie faz 1-2,
z rekomendacją przy każdym wpisie: zostawić, zmienić albo sprawdzić w partii. Zasady, testy i podpięcie to faza 1, wygląd to faza 2, decyzje to faza 4, poprawki to faza 5.

</domain>

<decisions>
## Implementation Decisions

### Zakres
- **D-01:** Audytujemy 30 mini-gier z `GAMES` (`minPlayers: 1`), 8 gier głównych (z trybami z `modes`) i Turniej (`turniej.ts`). Kod: `packages/games/src/<gra>.ts`
  (stałe, `setup`, `record`, `tie`, `turnSeconds`/`turn`, `timeoutMove`) i `apps/web/src/games/<Gra>.tsx` (czasy pokazu, odsłon i animacji, które wydłużają partię).
- **D-02:** Wpisy z faz 1-2 przekazane do fazy 3 trzeba zamknąć liczbą albo pomiarem (cytowane z prefiksem `F1:` / `F2:`, bez przepisywania treści):
  - F1:Z2 `limit-tury-bez-zapasu`: SQ1 (Sekwencja 300 s), ZK1 (Zakupy 60 s bez zapasu), SR1 (Środek 60 s, do pomiaru),
  - F1:Z3 `trudnosc-z-losowania`: W6a (Stoper, Rytm), LC1 (Liczenie), W8b (Odcień, Kąt), W9a (W pamięci),
  - F1:K2 (Juwenalia po wykupieniu), F1:K11 (budynki po utracie kompletu),
  - F2:U2 / C8 / KA1 (marsz pionka w Kampus Tour do 3,3 s na rzut, Chińczyk Szybki do 1 s z 20 s), F2:A9 / WP3 (W pamięci: 0 rund po limicie),
    F2:U28 (RF4, SJ2, SP2, WZ2: dokładność pomiaru), F2:U31 / SC1 (kary Schultego i Sudoku całkowite czy ułamkowe).
- **D-03:** Kierunek `record.lower` i obecność `tie` zgodne z dokumentami potwierdziła faza 1 (F1 §3, pilnuje `index.test.ts:180`). Faza 3 tego nie powtarza:
  ocenia, czy `tie` jest potrzebne (częstość remisów) i czy rozstrzyga (zaokrąglenie `Math.round(average)`, klucz F1 `tie-zaokraglenie`).

### Miary
- **D-04 „Do zdobycia” (REC-01):** dla każdej mini-gry z losowaniem trzy miary policzone symulacją `setup` na co najmniej 1000 seedów (`createRng`):
  suma celów (np. wytrzymałość balonów, kropki, czas za zasłoną), liczba bodźców lub rund oraz rozkład rodzajów plansz (komplety czy osobne losowanie).
  Do tego miara trudności, jeśli da się ją policzyć ze stanu (np. suma kątów, liczba mnożeń, odległość miast od konturu). Wynik: min / mediana / max i rozrzut względny.
  Założenie o ludzkiej trudności (np. „mnożenie jest trudniejsze”), którego nie da się policzyć, ma etykietę „założenie, do sprawdzenia w partii”.
- **D-05 Sufit (REC-02):** maksimum teoretyczne ze stałych (np. Kubki 20, Śledzenie 20, Wieża 30, W pamięci 12, Zakupy 10, Balon 155) i maksimum praktyczne
  z progów ludzkich (03-02-BASELINE.md: czas reakcji, blokada 1 s, minimalny czas na planszę). Ryzyko remisów na szczycie: **wysokie**, gdy dobry gracz osiąga sufit,
  a `tie` brak albo prawie zawsze równe; **średnie**, gdy sufit jest blisko praktycznego maksimum; **niskie**, gdy wynik jest ciągły (ms, km, ΔE) albo sufitu nie ma.
- **D-06 Krzywa trudności (DIFF-01):** tabela „runda / piętro / trafienie → parametry” (liczba zamian i ms na zamianę, prędkość, rozmiar siatki, różnica, długość ciągu)
  wyliczona ze stałych, z zaznaczeniem rundy, w której parametr przekracza próg ludzki z 03-02-BASELINE.md („niemożliwa”) i rund, które prawie każdy przechodzi
  („za łatwa”, nie różnicują). Gra bez progresji dostaje jawne „bez progresji”.
- **D-07 Limit tury (DIFF-02):** najdłuższa uczciwa partia = suma czasów stałych (pokazy, odsłony, animacje i opóźnienia z serwera i klienta) + czas decyzji wolnego,
  ale uczciwego gracza (model z 03-02-BASELINE.md) + zapas na sieć. Wymagany zapas: co najmniej 20% i co najmniej 10 s. Limit liczy się od ostatniego „Start”
  (ekran instrukcji się nie wlicza). Gra z wewnętrznym limitem (np. 30 s quizów) porównuje limit tury z wewnętrznym. Gra bez sufitu (Sekwencja) dostaje
  „limit ucina rekordowe partie od wyniku X”. Gry turowe: czy 60 s wystarcza na najdłuższą turę (z animacjami, które blokują akcję, F2:U2).
- **D-08 Gry główne (DIFF-03):** ekonomia Kampus Tour i przewaga pierwszego gracza oceniane statycznie (formuły, znane wyniki teorii gier) i symulacją prostych botów
  w scratchpadzie (`setup` + `applyMove`, ruchy przez `validateMove`), co najmniej 500 partii na konfigurację. Wynik bota to sygnał, nie dowód: rekomendacja
  „sprawdzić w partii”, gdy wynik zależy od strategii ludzi.

### Wagi
- **D-09:** Waga według wpływu na uczciwość rekordów i gry:
  - **wysoka**: limit tury odbiera wynik uczciwej partii (zapas ≤ 0), suma do zdobycia zmienia się między partiami, sufit osiągalny przez dobrego gracza bez rozstrzygnięcia remisu,
    gra główna rozstrzygana głównie przez kolejność albo losowanie,
  - **średnia**: trudność zależna od losowania przy stałej sumie, krzywa niemożliwa w zakresie, który dobry gracz osiąga, albo za płaska przez większość partii,
    zapas limitu poniżej 20% lub 10 s, przewaga pierwszego gracza bez kompensaty (rotacja przy rewanżu się liczy), `tie` z zaokrągleniem, które często remisuje,
  - **niska**: przypadki teoretyczne (np. remis w ms), zapas duży, ale nieopisany, założenia bez wpływu na rekord.

### Metoda
- **D-10:** Dozwolone są tymczasowe skrypty w scratchpadzie sesji (niecommitowane): `node --experimental-strip-types` z importem z `packages/games/src`, bez nowych zależności.
  Wynik skryptu (tabela liczb i seed) jest dowodem we wpisie; treść skryptu w załączniku pliku częściowego. Repo zostaje bez zmian poza `.planning/`.
- **D-11:** Dane z prawdziwych partii: lokalna `apps/server/data/games.db` tylko do odczytu (kopia do scratchpadu, `node:sqlite`), z zastrzeżeniem, że to głównie partie testowe.
  Z bazą produkcyjną na Pi się nie łączymy; jeśli użytkownik sam da kopię, plan 03-01 dolicza z niej to samo.
- **D-12:** Szablon sekcji mini-gry (plany 03-05..03-08): `## <Nazwa> (`<id>`)` z podsekcjami
  **Do zdobycia (REC-01)**, **Sufit i remisy (REC-02, REC-03)**, **Krzywa trudności (DIFF-01)**, **Limit tury (DIFF-02)** i wierszem **Rekomendacja**
  (zostawić / zmienić / sprawdzić w partii, z jednym zdaniem dlaczego). Każda liczba ma pewność: wyliczone (ze stałych), zmierzone (symulacja / baza) albo założenie.

### Format i scalenie
- **D-13:** Wpis jak w fazach 1-2: gra, `plik:linia`, źródło reguły (`ZASADY.md` §3 + linia, `ZASADY-GIER.md`, `KONCEPT.md` §2/§3/§9), waga, proponowana poprawka,
  rekomendacja. Ta sama rozbieżność w wielu grach to wpis zbiorczy (`[zbiorcze: <klucz>]` w plikach częściowych, scalane w 03-09; klucze z faz 1-2, jeśli pasują).
- **D-14:** Podział gier na plany jak w fazach 1-2 (Kampus Tour osobno, gry główne razem, mini-gry w czterech grupach), żeby w fazie 4 ustalenia trzech audytów
  dało się zestawić gra po grze.

### Claude's Discretion
- Strategia botów w symulacjach (byle opisana i powtarzalna z seedem).
- Liczba seedów powyżej minimum i forma tabel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reguły do sprawdzenia
- `ZASADY.md` §3: losowanie nie zmienia sufitu, komplety rodzajów plansz, `withSum`, limit = najdłuższa uczciwa partia + zapas, `timeoutMove`
- `ZASADY-GIER.md`: sekcja każdej gry (stałe, wynik, remisy)
- `KONCEPT.md` §2 (opis gier, tryby), §3 (limity tury), §9 (otwarte pytania ekonomii Kampus Tour)
- `.claude/memory/kampus-tour-economy.md`: ustalenia ekonomii po partiach testowych

### Zakres i format
- `.planning/ROADMAP.md`: Phase 3, kryteria sukcesu i wspólny format `FINDINGS.md`
- `.planning/REQUIREMENTS.md`: REC-01..03, DIFF-01..03
- `.planning/phases/01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md`: Z2, Z3, K2, K11, tabela podpięć (kierunki `record` i `tie`)
- `.planning/phases/02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md`: U2, U28, U31, A9 (wpisy przekazane do fazy 3)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/games/src/core.ts`: `createRng` (seed → powtarzalna partia), `withSum`, `shuffle`, `ranked`, `rankResults`, `byHitsThenAverage`, `byScoreThenAverage`, `average`.
- `withSum` używają dziś tylko `balon.ts`, `kropki.ts`, `przytrzymaj.ts` i `zaslona.ts`; komplety rodzajów: `stroop.ts:34-35`, `inny.ts`.
- `turnSeconds`: 60 s (refleks, stoper, stoj, rytm, srodek, nozyczki, zakupy i gry główne), 90 s (quizy, dziesiątki), 120 s (kolo, kropki, kat, przytrzymaj, zaslona, balon, tort, sudoku),
  180 s (schulte, kolor, wieza, mapa, kubki), 240 s (rok), 300 s (simon, sledzenie, w-pamieci); `turn()` w Statkach (90 s rozstawianie), Kole, Państwach-miastach i Kalamburach.

### Established Patterns
- Testy w `packages/games/src/<gra>.test.ts` często utrwalają stałe (np. `zakupy.test.ts:42`), więc zmiana stałej w fazie 5 to najpierw test i dokument.
- Czasy klienta: odsłony 1 / 1,5 / 2,5 s, pokazy (kropki i kąt 1,5 s, zakupy 10 s, odcień 2 s), `STEP_MS`/`ROLL_MS` w Chińczyku i Kampus Tour.

### Integration Points
- `apps/server/src/stats.ts`: zapis rekordów (`record`, `tie`, `detail`), `apps/server/data/games.db` (lokalna baza dev).

</code_context>

<specifics>
## Specific Ideas

Brak dodatkowych wymagań; decyzje to propozycje plannera wzorowane na fazach 1-2.

</specifics>

<deferred>
## Deferred Ideas

- Zmiany stałych, limitów i ekonomii to decyzja fazy 4 i poprawka fazy 5.
- Partie testowe z ludźmi (rekomendacje „sprawdzić w partii”) zbiera 03-09 w jedną listę dla użytkownika; prowadzi je użytkownik poza tą fazą.

</deferred>

---

*Phase: 03-audyt-balansu-rekordow-i-trudnosci*
*Context gathered: 2026-10-24*

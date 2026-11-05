# Audyt spójności (M1, fazy 01-05) i stan po nim
<!-- Skrót archiwum GSD. Katalog .planning/phases/ i .planning/codebase/ usunięty 2026-11-05; dowody, karty i decyzje
     są w historii gita: `git show fb0f5d2:.planning/phases/<faza>/<plik>` (lista: `git ls-tree -r --name-only fb0f5d2 .planning`).
     Nowe prace prowadzi .telos/. Stan na 2026-11-05. -->

## Cel i wynik
Cel: każda gra działa i wygląda tak samo przewidywalnie, kod zgadza się z dokumentacją, wyniki i rekordy są uczciwe
i porównywalne. Metoda: trzy audyty bez zmian kodu (kryteria z `ZASADY.md` §2-6, `DESIGN.md`, `ZASADY-GIER.md`, `KONCEPT.md`),
jeden raport z decyzją użytkownika, potem poprawki (test i dokument przed kodem). Zakończony 2026-10-31: 62/62 pakietów,
267/267 części poprawek, `pnpm typecheck && pnpm test` i build PASS. Wymagania RULE/WIRE/UI/ANIM/REC/DIFF/FIX-01/FIX-02 spełnione.

## Fazy (w gicie: `fb0f5d2:.planning/phases/`)
| Faza | Wynik | Plik wejściowy dla dalszych faz |
|---|---|---|
| 01 Audyt zasad, testów i podpięcia | 10 planów, 55 wpisów (Z1-Z21 i pojedyncze), tabela podpięć §6 | `01-…/FINDINGS.md` (prefiks F1:) |
| 02 Audyt wyglądu, animacji i wibracji | 11 planów, 102 wpisy (300 wystąpień): U1-U37, A1-A17 | `02-…/FINDINGS.md` (F2:) |
| 03 Audyt balansu rekordów i trudności | 9 planów, symulacja `setup` 1000 seedów i botów Kampus Tour, macierz 39 gier × 6 kryteriów, R1-R8, 22 pytania „sprawdzić w partii” | `03-…/FINDINGS.md` (F3:) |
| 04 Raport zbiorczy i akceptacja | 168 wpisów F4 (7 wys., 55 śr., 106 nis.), 62 pakiety P4 (19 P1/36 P2/7 P3), 106 decyzji D4, 27 H, 47 odstępstw; zgoda ZG4-v1 | `04-…/FINAL-APPROVAL.md`, `PHASE-5-SCOPE.md` (S5-v1) |
| 05 Poprawki zaakceptowanych rozbieżności | 61 planów 05-01..05-61, pakiety P4-001..062 | `05-…/05-NN-SUMMARY.md` (dowody) |

## Decyzje użytkownika (ZG4-v1, „Zatwierdzam”, 2026-10-26)
- Jedna końcowa zgoda na cały zakres: 62 pakiety do poprawy, 27 H jako świadome odstępstwa, istniejące odstępstwa zachowane.
  W obrębie tego zakresu nie pyta się o małe paczki; podział i kolejność zadań nie wymagają nowej akceptacji.
- Stare rekordy, wygrane i zapisane partie bez przeliczania, kasowania ani zmiany schematu SQLite; świadomie wspólna historia
  różnych metod i trudności. Nowe timeouty Schultego/Sudoku bez rekordu; stare `detail` bez `completed` bez nadawania statusu.
- Norma limitów mini-gier `L >= max(1,2·T, T+10 s)` z wyjątkami Środek 60 s, Tort 120 s, Który rok? 270 s (szczegóły `PROCESS.md`).
- Zgoda nie obejmowała push, wdrożenia, pobierania bazy z Pi, nowych zależności, nowych gier ani zapisu pokoi.

## Najważniejsze zmiany fazy 05 (pakiety)
- Zasady i limity: najgorszy wynik po limicie (P4-002), Zakupy 80 s z autozapisem po 50 s (P4-003), Sekwencja zachowuje serię (P4-004),
  W pamięci wysyła wynik od razu (P4-005), Śledzenie 360 s (P4-020), Który rok? 270 s (P4-021), jeden termin mini-gry (P4-022, usunięte
  `kolo.turn`), walidacja quizów (P4-023), jeden komparator średniej (P4-024), jawny remis Gomoku i `places` Szybkiego Chińczyka (P4-025),
  Kampus Tour: karta bankruta wraca, czynsz rzeczywisty (P4-026), `hint` Kalamburów tylko z timeoutu przez `MoveContext` (P4-027),
  Labirynt losowy legalny krok (P4-028), Liczenie/Obrót/W pamięci/Balon losowane kompletami (P4-057..060), Państwa-miasta bez Ł (P4-062),
  reakcja od klatki bodźca w Refleksie i Stój! (P4-061).
- Testy: luki z §2 uzupełnione w Kampus Tour, grach głównych, Turnieju i mini-grach (P4-029..032); rekordowa partia ze stanu (P4-033);
  jedna lista mini-gier i `nonce` Sudoku (P4-034); wspólne funkcje (P4-035).
- UI: zwijany nagłówek partii (P4-006), plansze gier głównych w 360×640 (P4-007..014), wyniki w `StickyBar` (P4-016), Kampus Tour
  środek i przerywalny pokaz (P4-017, 018), Chińczyk przerywalny pokaz (P4-019), gęste plansze z potwierdzeniem 56 px (P4-036),
  kontrolki 48 px (P4-037), Tort i Śledzenie: cele dotyku (P4-038, 039), reduced motion (P4-040), katalog animacji (P4-041),
  przejścia i paski (P4-042), wibracje (P4-043), odsłona prawdy (P4-044, 045), koniec partii (P4-046), słownik słów (P4-047),
  `ScoreTable`/`RoundTable` (P4-048), liczby i etykiety (P4-049), role tokenów (P4-050), a11y (P4-051), stany (P4-052), hierarchia (P4-053),
  opisy (P4-054).

## Świadome odstępstwa H (zostawione na ten etap, powrót po pomiarze)
- Limity: Środek 60 s (H-001), Tort 120 s (H-002), głosowanie Państw-miast 45 s (H-003).
- Generatory bez zmian do weryfikacji: Odcień, Dziesiątki, Sudoku, Kąt, Śledzenie, Stój!, Za zasłoną, Literówka, Który rok?, Kubki (H-004..013).
- Bez nowego `tie`: W pamięci, Kubki, Sekwencja (H-014..016). Sufit bez zmian: Wieża, Zakupy (H-017, 018).
- Kampus Tour: kolejność miejsc, MPK bez opłaty, monopol i długość partii bez zmian (H-019..021).
- Kolejność miejsc bez zmian (rotacja wystarcza): Labirynt, Gomoku, Memory, Statki (H-022..025).
- Kalambury 2 os. bez zmiany punktów (H-026), Turniej domyślnie 8 gier (H-027).
Każda pozycja ma w `FINAL-APPROVAL.md` §5 warunek powrotu (pytanie P01-P22 albo pomiar U).

## Otwarte po audycie
- Odbiory na urządzeniach: U03 (podpisy „Wszystkie” i Preview Koloru liter na 360 px), U04 („Jeszcze nie grane” i tabele
  rund rekordów na 360 px), U09 (czytelność 7-8 px w Kampus Tour u ludzi), U14 (pomiar zegara 60/120 Hz przez `?zegar`;
  uchylony przez użytkownika, odbiór po fakcie), P11 (W pamięci: czy ludzie dochodzą do 12 rund, na jakim działaniu pomyłka).
- 22 pytania „sprawdzić w partii” (`03-…/FINDINGS.md` §11, P01-P22 w `04-02-EVIDENCE.md`).
- v2 poza zakresem: walidacja nierealnych wyników i przegląd bazy rekordów (REC-V2-01), porównanie trudności mini-gier między sobą (DIFF-V2-01).

## Propozycje po audycie (2026-11-05, czekają na akceptację, bez kodu)
Plany w `.planning/*-PLAN.md`, wymagania i status w `.telos/PROPOSALS.md`. Każdy niezależny; akceptacja jednego nie zatwierdza innych.
- Atrakcyjność (ATR-00..05, decyzje D1-D6): pomiar, wyniki z momentem, rywalizacja w trakcie partii, wieczór w jednym pokoju,
  wybór gry i wygląd, powroty. Po akceptacji: etap 0 (pomiar) i 1 (wyniki).
- Podróbka (`podrobka`, POD-01..07): 3-6 osób, 6 rund, odpowiedzi na dwa podobne pytania, tajne głosy, odsłona, 60 par pytań.
- Blef na kościach (BLEF-01..05): 2-6 osób, 3 kości, podbijanie i sprawdzanie, eliminacja.
- Wyprawa (WYP-01..05): 2-6 osób, 5 wypraw, tajne równoczesne powroty, skarby i zagrożenia.
- Sabotaż (SAB-01..05): 3-6 osób, 6 rund bez eliminacji, stosy 3+1, aukcja odkrywania.
- Wspólny szyfr (SZYFR-01..06): 2-6 osób, 3 zamki, kooperacja; wymaga rozszerzenia kontraktu o wynik drużyny bez walkoweru.
- Z dawnego planu w KONCEPT.md: Poprawka (gra karciana) i zapis stanu pokoi w SQLite.

## Znane ryzyka (z dawnego `.planning/codebase/CONCERNS.md`, 2026-10-21)
- Stan pokoi w pamięci: restart lub deploy kończy partie i zeruje limity IP (plan: zapis w SQLite).
- `cf-connecting-ip` można podrobić z pominięciem Cloudflare. Duże pliki: `KampusTour.tsx`, `Statki.tsx`, `MiniGame.tsx`.
- Mini-gry powielają szkielet (intro, timeout, ranking); poprawka w jednej nie trafia do innych.

# History
<!-- Why things were decided, removed or reverted. Changes themselves live in git. -->

## Delete-zone
<!-- Never rotated. One line each; do not recreate unless the user asks.
     "- `path/` — reason (ref, YYYY-MM-DD)"   ← checked by the edit hook
     "- approach: … — reason (ref, YYYY-MM-DD)" ← injected into plan/quick bundles
     `history add remove … --path <relative-path>` or `--approach <text>` records one target.
     `history add revert …` clears only its exact selector; no selector means Log only. -->
- approach: dodanie zod jako zależności apps/server — Bezpośrednia zależność zod w apps/server psuje dołączanie do pokoju (quick, 2026-11-05)
- approach: osobne losowanie rodzaju planszy lub wytrzymałości balonu zamiast kompletu — Osobne losowanie trudności na planszę zastąpione potasowanymi kompletami (quick, 2026-11-05)
- approach: losowy cel Stopera (6-14 s) lub losowe BPM Rytmu — Losowy cel Stopera i losowe tempo Rytmu dawały nierówne szanse rekordów (quick, 2026-11-05)
- approach: kolo.turn / limit mini-gry odnawiany wynikiem lub próbą rywala — turn() w Narysuj koło odnawiał limit po próbie; usunięte w P4-022 (05, 2026-11-05)
- `plany` — Szkice mini-gier w plany/ usunięte; zasady tylko w ZASADY-GIER.md (quick, 2026-11-05)

## Log
<!-- Newest first; written by `telos history add`. Over limits.history_entries,
     oldest entries move to HISTORY-archive.md.
     "- YYYY-MM-DD <kind> <ref>: text"
     kinds: decision | phase | revert | remove | quick | profile | init
     ref: NN, NN-MM, ADR NNN, quick, telos
     Archive is installed first; after an interrupted write it may duplicate live Log rows. -->
- 2026-11-10 phase 16: closed 16-kropki-i-kreski: gra główna Kropki i kreski (2-4 osoby, plansze 3×3, 5×5, 7×7) z testami zasad, ekranem, lobby, kartą Jak grać i odbiorem technicznym
- 2026-11-10 decision 16: D-04: id gry to kropki-i-kreski (klucz rankingu w SQLite, nie zmienia się), limit tury 60 s, po limicie losowa wolna kreska, remis na szczycie bez zwycięzcy, nazwa w UI „Kropki i kreski”
- 2026-11-09 phase 15: closed 15-jak-grac: 11 gier głównych ma kartę Jak grać (sekcja w Setup i okienko w partii), test pilnuje kompletu, odbiór 360×640 przy 2 i 6 graczach; znana wada: Kampus Tour bez ikony w partii
- 2026-11-08 phase 08: closed 08-podrobka: TDD, ekran, podpięcie i odbiór 3/6 graczy z obserwatorem; próba z ludźmi (dawne 08-10) pominięta na decyzję użytkownika
- 2026-11-07 phase 10: closed 10-wyprawa: TDD, ekran, podpięcie i odbiór 2/6 graczy z obserwatorem; próba z ludźmi pominięta decyzją użytkownika, balans niepotwierdzony; FAIL accept 10-02 zaakceptowany (D-04)
- 2026-11-06 phase 11: closed 11-sabotaz: TDD, ekran, podpięcie i odbiór techniczny 3/6 graczy z obserwatorem; v1 przyjęte przez użytkownika bez pomiarów balansu
- 2026-11-06 decision 07-08: Test z ludźmi przed etapem 2 pominięty decyzją użytkownika; etap 2 bez punktu odniesienia, pierwszy test to 07-24
- 2026-11-05 remove quick: Bezpośrednia zależność zod w apps/server psuje dołączanie do pokoju
- 2026-11-05 remove quick: Osobne losowanie trudności na planszę zastąpione potasowanymi kompletami
- 2026-11-05 remove quick: Losowy cel Stopera i losowe tempo Rytmu dawały nierówne szanse rekordów
- 2026-11-05 remove 05: turn() w Narysuj koło odnawiał limit po próbie; usunięte w P4-022
- 2026-11-05 remove quick: Szkice mini-gier w plany/ usunięte; zasady tylko w ZASADY-GIER.md
- 2026-11-05 decision quick: Nazwy UI zmienione 2026-10-10, id zostały: simon, stroop, kolor, piec-w-rzedzie
- 2026-11-05 decision quick: Stoper ma stały cel 10 s (dawniej losowy 6-14 s), Rytm stałe 100 BPM (dawniej 70-130): równe szanse rekordów
- 2026-11-05 decision quick: apps/server bez bezpośredniego zod: druga kopia @colyseus/core daje seat reservation expired
- 2026-11-05 decision quick: Balans Kampus Tour: start 200 zł +20 zł za miejsce, kieszonkowe 40 zł, bez kompletu poziom 1, MPK bez kieszonkowego (2026-10-07)
- 2026-11-05 decision 04: Norma limitu mini-gier L >= max(1,2T, T+10 s); wyjątki Środek 60 s, Tort 120 s, Który rok? 270 s (2026-10-26)
- 2026-11-05 decision 04: ZG4-v1: jedna zgoda na 62 pakiety, 27 H jako odstępstwa, bez przeliczania starych rekordów (2026-10-26)
- 2026-11-05 decision 05: Stała zgoda użytkownika: commit testów i implementacji po każdym zadaniu bez pytania, push tylko na prośbę (2026-10-29)
- 2026-11-05 decision 05: Słownik: Zgłaszam gotowość zamiast Jestem gotowy, Dalej po odsłonie, Wyniki tylko do podsumowania (P4-047, 2026-10-31)
- 2026-11-05 decision 05: P4-027: MoveContext {source} nadaje serwer; hint Kalamburów tylko z timeoutu (2026-10-29)
- 2026-11-05 decision 05: P4-022: mini-gra ma jeden termin od końca instrukcji; wyniki rywali go nie odnawiają (2026-10-31)
- 2026-11-05 decision 05: Losowanie trudności kompletami: Liczenie czwórki działań, Obrót szóstki, W pamięci floor(n/3) mnożeń, Balon 11-20 (P4-057..060, 2026-10-31)
- 2026-11-05 decision 05: P4-061: Refleks i Stój! mierzą od pierwszej klatki z bodźcem (rAF) do e.timeStamp; Stoper i Wieża bez zmian (2026-10-31)
- 2026-11-05 phase 05: Audyt spójności M1 zamknięty: 62/62 pakietów, 267/267 części; otwarte odbiory U03/U04/U09/U14/P11 (2026-10-31)
- 2026-11-05 decision quick: Prowadzenie projektu przeniesione z GSD (.planning/) do .telos/; .planning zostaje archiwum audytu
- 2026-11-05 init telos: initialized (standard profile)

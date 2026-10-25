# Faza 4: scalony rejestr rozbieżności

Data: 2026-10-25. Wykonano plan 04-01. Rejestr v1, stan decyzji: **oczekuje**.
168 pozycji F4 to wynik scalenia 173 pozycji F1/F2/F3. To nie jest zatwierdzony zakres poprawek.
FIX-01 i FIX-02 pozostają otwarte. Nie zmieniono kodu, testów, zasad ani danych.

## 1. Stan odniesienia i aktualność

- Gałąź `labirynt`, HEAD `e5ac65a40a918f38c2cfac785a66639641cd5d89`, przed pracą 3 commity przed `origin/labirynt`.
- Zastany stan roboczy: zmienione `.planning/STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`; nieśledzony katalog tej fazy z `04-CONTEXT.md` i planami 04-01..04-05. Zachowano te materiały; polecenie „Zrób task 04-01” jest akceptacją wykonania tego planu, bez akceptacji wariantów napraw.
- Porównano F1/F2 na `d625d21` i F3 na `06102e7` z HEAD oraz stanem roboczym: `apps/`, `packages/`, `KONCEPT.md`, `ZASADY-GIER.md`, `ZASADY.md`, `DESIGN.md` bez różnic. Nie ma zmienionych fragmentów dowodowych do ponownego audytu.
- Zmiany od baz audytów dotyczą `.planning/` i instrukcji `AGENTS.md` o dokumentach planowania; nie zmieniają ustaleń gier. Brak pozycji o statusie „już rozwiązane”. Sprawdzono obecną listę 38 gier w `packages/games/src/index.ts:123` i Turniej osobno.
- Lokalizacje z raportów zachowują aktualność dzięki identyczności plików. Nie powtarzano symulacji, pomiarów UI ani testów urządzeń. Dziedziczona pewność dowodu nie oznacza nowego pomiaru.

Źródła: [F1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md), [F2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md), [F3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md).
`plik:linia` w odsyłaczach do raportów to początek wpisu lub wiersz tabeli, a lokalizacje kodu są we wpisach F4.
Skrócone `:N` po nazwanym pliku oznacza kolejną linię tego samego pliku. „Brak w pliku” oznacza lukę testu w całym wskazanym pliku, nie nieistniejący numer linii.
Numeracja § i D-* w odziedziczonych opisach wpisów odnosi się do raportu źródłowego podanego w śladzie, chyba że wskazano nazwę dokumentu lub sekcję tego rejestru. Nazwy historycznych skryptów fuzz/cases/checks odnoszą się do scratchpadu audytu, nie do plików repo.

Pewność: **S** = analiza statyczna niezmienionego kodu; **W** = wyliczenie ze stałych; **Z** = wcześniejsza symulacja, nie pomiar człowieka; **A** = założenie.
Wymiary UI są szacunkami z klas (około ±30 px); Android, czytniki, dotyk i płynność wymagają właściwego urządzenia. Próg zapasu 20% i 10 s oraz propozycje D-01..D-14 z fazy 3 nie są jeszcze zatwierdzoną zmianą dokumentów.

## 2. Liczby i deduplikacja

| Zbiór | Wysoka | Średnia | Niska | Razem |
|---|---:|---:|---:|---:|
| F1: 21 zbiorczych + 34 pojedyncze | 2 | 24 | 29 | 55 |
| F2: 37 U + 17 A + 48 pojedynczych | 4 | 27 | 71 | 102 |
| F3: 8 zbiorczych + 8 pojedynczych | 2 | 5 | 9 | 16 |
| Suma źródeł | 8 | 56 | 109 | 173 |
| F4 po pięciu scaleniach | 7 | 55 | 106 | **168** |

Wśród 7 wysokich jedna pozycja jest wysoka warunkowo (R3). Wysoki agregat nie nadaje automatycznie wysokiej wagi każdej grze w jego tabeli. Liczby 177 wystąpień F1, 300 F2 i 44 wpisy częściowe B-* F3 są różnymi jednostkami i nie sumują się do liczby poprawek. Wystąpienia zachowują lokalizacje i aliasy w treści F4; nie dostają kolejnych numerów jako duplikaty.

| Scalane źródła | Wynik i powód |
| [F1:Z2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L56) + [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002): ta sama przyczyna i reguła, nowszy dowód uzupełnia wcześniejszy |
| [F1:Z3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L127) + [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003): ta sama przyczyna i reguła, nowszy dowód uzupełnia wcześniejszy |
| [F2:U28](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L592) + [F3:R6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L318) | [F4-117](#f4-117): ta sama przyczyna i reguła, nowszy dowód uzupełnia wcześniejszy |
| [F1:K2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L404) + [F3:B-KT4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L353) | [F4-023](#f4-023): ta sama przyczyna i reguła, nowszy dowód uzupełnia wcześniejszy |
| [F1:K11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L411) + [F3:B-KT5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L354) | [F4-030](#f4-030): ta sama przyczyna i reguła, nowszy dowód uzupełnia wcześniejszy |

F1:K11 zachowuje wagę średnią dla nieopisanej reguły; niska ocena wpływu balansu z F3:B-KT5 pozostaje jawna. To usuwa jeden niski wpis, nie średni.
F2:U2 i F3:B-KT6 pozostają oddzielne (blokada akcji kontra długość partii). F1:ZK1 jest wystąpieniem F1:Z2, a F2:ZK1 oddzielnym błędem pomiaru dotyku.
U16 oraz A2/A3 opisują różne kryteria: miejsce definicji animacji kontra spójność sytuacji; wspólne wystąpienie nie oznacza dwóch wdrożeń. Podobnie U17/U18 to katalog i kategorie czasu, a B-53 to brak wyjątku dla treści gry. Pakiety w 04-03 powinny połączyć takie zmiany, zachowując niezależne decyzje o regułach.

## 3. Mapa źródło → F4 → status

Każdy wiersz to jeden wpis kanoniczny raportu źródłowego. Prefiks fazy jest obowiązkowy. Rodzaj i sekcja wskazują, czy to agregat, macierz sytuacji czy pojedynczy przypadek. Status „aktualne S” oznacza identyczny kod/dokument, a nie potwierdzony wpływ na człowieka.

| Źródło (plik i linia) | Gra / ekran | Sekcja / rodzaj | F4 | Aktualność / decyzja |
|---|---|---|---|---|
| [F1:Z1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L38) | schulte, sudoku, kropki | Z1. Limit czasu nie jest najgorszym wynikiem `[zbiorcze: timeout-nie-najgorszy]` / zbiorczy | [F4-001](#f4-001) | aktualne S; oczekuje |
| [F1:Z2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L56) | simon, zakupy, srodek, tort, sledzenie, panstwa-miasta, rok | Z2. Limit tury krótszy od najdłuższej uczciwej partii `[zbiorcze: limit-tury-bez-zapasu]` / zbiorczy | [F4-002](#f4-002) | aktualne S; oczekuje |
| [F1:Z3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L127) | stoper, rytm, liczenie, kolor, kat, w-pamieci, obrot, dziesiatki, sudoku, sledzenie, stoj, zaslona, literowka, rok, kubki | Z3. Losowe wyzwanie zmienia trudność partii `[zbiorcze: trudnosc-z-losowania]` / zbiorczy | [F4-003](#f4-003) | aktualne S; oczekuje |
| [F1:Z4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L146) | kampus-tour, piec-w-rzedzie, statki, chinczyk, panstwa-miasta, turniej, refleks, simon, stoper, schulte, stroop, liczenie, kolo, kolor, kropki | Z4. Definicja bez testu: liczba graczy, limit tury, świeża gra `[zbiorcze: definicja-swieza-gra]` / zbiorczy | [F4-004](#f4-004) | aktualne S; oczekuje |
| [F1:Z5](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L171) | statki, panstwa-miasta, simon, stoper, stroop, liczenie, schulte, kolo, kolor, kropki | Z5. Setup: ten sam seed daje to samo `[zbiorcze: setup-ten-sam-seed]` / zbiorczy | [F4-005](#f4-005) | aktualne S; oczekuje |
| [F1:Z6](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L190) | panstwa-miasta, refleks, simon, stoper, stroop, liczenie, schulte, kolo, kolor, kropki, srodek | Z6. Ruch po końcu gry bez testu `[zbiorcze: po-koncu]` / zbiorczy | [F4-006](#f4-006) | aktualne S; oczekuje |
| [F1:Z7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L209) | kampus-tour, panstwa-miasta, simon, stroop, liczenie, inny, obrot, literowka, dziesiatki, kolo, kolor, kropki | Z7. Wartości brzegowe tylko z jednej strony `[zbiorcze: brzegi]` / zbiorczy | [F4-007](#f4-007) | aktualne S; oczekuje |
| [F1:Z8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L229) | kampus-tour, piec-w-rzedzie, statki, chinczyk, panstwa-miasta, refleks, simon, stoper, stroop, liczenie, schulte, kolo, kolor | Z8. Schemat ruchu nie jest testowany na śmieciach `[zbiorcze: schemat-smieci]` / zbiorczy | [F4-008](#f4-008) | aktualne S; oczekuje |
| [F1:Z9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L251) | panstwa-miasta, refleks, simon, stoper, stroop, liczenie, schulte, kolo, kolor, kropki, rok, srodek, tort, nozyczki | Z9. Wygrana tylko jednego gracza `[zbiorcze: wygrana-kazdego]` / zbiorczy | [F4-009](#f4-009) | aktualne S; oczekuje |
| [F1:Z10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L273) | kampus-tour, panstwa-miasta, simon, stoper, stroop, liczenie, schulte, kolo, kolor, kropki | Z10. Brak testu mutacji i JSON round-trip `[zbiorcze: stan-mutacja-json]` / zbiorczy | [F4-010](#f4-010) | aktualne S; oczekuje |
| [F1:Z11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L293) | panstwa-miasta, kalambury | Z11. Stałość klucza `turn()` bez testu `[zbiorcze: turn-key-staly]` / zbiorczy | [F4-011](#f4-011) | aktualne S; oczekuje |
| [F1:Z12](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L299) | kampus-tour, statki | Z12. Widok obserwatora `""` nie w każdej fazie `[zbiorcze: widok-obserwatora]` / zbiorczy | [F4-012](#f4-012) | aktualne S; oczekuje |
| [F1:Z13](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L305) | stoj, stroop, liczenie, inny, obrot, literowka, dziesiatki | Z13. Rekord rozstrzyga remis zaokrągloną średnią, miejsca nie `[zbiorcze: tie-zaokraglenie]` / zbiorczy | [F4-013](#f4-013) | aktualne S; oczekuje |
| [F1:Z14](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L314) | stroop, liczenie, inny, obrot, literowka, dziesiatki | Z14. `quiz.ts`: czasy niecałkowite i nieograniczona liczba pomyłek przechodzą walidację `[zbiorcze: quiz-walidacja]` (Q1) / zbiorczy | [F4-014](#f4-014) | aktualne S; oczekuje |
| [F1:Z15](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L320) | stroop, liczenie, inny, obrot, literowka, dziesiatki | Z15. Ekran quizów ucina czasy do 5 s i gubi trafienia poniżej 150 ms `[zbiorcze: quiz-ekran-czasy]` (Q2) / zbiorczy | [F4-015](#f4-015) | aktualne S; oczekuje |
| [F1:Z16](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L325) | stoper, rytm | Z16. Ekran końcowy z kaflem ze stanu lokalnego `[zbiorcze: ekran-stan-lokalny]` (W3) / zbiorczy | [F4-016](#f4-016) | aktualne S; oczekuje |
| [F1:Z17](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L332) | panstwa-miasta, kalambury, platforma | Z17. Ręczne zbiory `MINI_GAMES` `[zbiorcze: mini-games-zbior]` (W1, W2, W4, W5) / zbiorczy | [F4-017](#f4-017) | aktualne S; oczekuje |
| [F1:Z18](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L341) | chinczyk, turniej | Z18. Pełny remis rozstrzyga kolejność miejsc, dokument tego nie mówi `[zbiorcze: remis-kolejnosc-miejsc]` / zbiorczy | [F4-018](#f4-018) | aktualne S; oczekuje |
| [F1:Z19](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L347) | kampus-tour, kubki, kropki, kat, rok, kolo | Z19. Wspólne funkcje i moduły `core.ts` `[zbiorcze: wspolne-funkcje-core]` / zbiorczy | [F4-019](#f4-019) | aktualne S; oczekuje |
| [F1:Z20](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L355) | w-pamieci | Z20. `KONCEPT.md` §2.4 pomija drugie kryterium W pamięci `[zbiorcze: koncept-drugie-kryteria]` (W7 = WP2) / zbiorczy | [F4-020](#f4-020) | aktualne S; oczekuje |
| [F1:Z21](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L360) | schulte, kropki, kat, rok, wieza, balon, sudoku, kolo | Z21. Test `soloState` nie widzi map wypełnianych tylko w prawdziwej partii `[zbiorcze: test-solostate]` (W9) / zbiorczy | [F4-021](#f4-021) | aktualne S; oczekuje |
| [F1:K1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L403) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-022](#f4-022) | aktualne S; oczekuje |
| [F1:K2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L404) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-023](#f4-023) | aktualne S; oczekuje |
| [F1:K3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L405) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-024](#f4-024) | aktualne S; oczekuje |
| [F1:K4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L406) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-025](#f4-025) | aktualne S; oczekuje |
| [F1:K5](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L407) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-026](#f4-026) | aktualne S; oczekuje |
| [F1:K7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L408) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-027](#f4-027) | aktualne S; oczekuje |
| [F1:K8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L409) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-028](#f4-028) | aktualne S; oczekuje |
| [F1:K9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L410) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-029](#f4-029) | aktualne S; oczekuje |
| [F1:K11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L411) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-030](#f4-030) | aktualne S; oczekuje |
| [F1:K12](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L412) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-031](#f4-031) | aktualne S; oczekuje |
| [F1:K13](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L413) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-032](#f4-032) | aktualne S; oczekuje |
| [F1:K14](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L414) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-033](#f4-033) | aktualne S; oczekuje |
| [F1:K15](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L415) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-034](#f4-034) | aktualne S; oczekuje |
| [F1:K20](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L416) | kampus-tour | 6.1 Kampus Tour (`kampus-tour`), szczegóły: 01-03-FINDINGS.md / pojedynczy | [F4-035](#f4-035) | aktualne S; oczekuje |
| [F1:G1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L426) | piec-w-rzedzie | 6.2 Gomoku (`piec-w-rzedzie`), szczegóły: 01-04-FINDINGS.md / pojedynczy | [F4-036](#f4-036) | aktualne S; oczekuje |
| [F1:C4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L442) | chinczyk | 6.4 Chińczyk (`chinczyk`), szczegóły: 01-04-FINDINGS.md / pojedynczy | [F4-037](#f4-037) | aktualne S; oczekuje |
| [F1:M1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L452) | memory | 6.5 Memory (`memory`), szczegóły: 01-04-FINDINGS.md / pojedynczy | [F4-038](#f4-038) | aktualne S; oczekuje |
| [F1:KL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L462) | kalambury | 6.6 Kalambury (`kalambury`), szczegóły: 01-05-FINDINGS.md / pojedynczy | [F4-039](#f4-039) | aktualne S; oczekuje |
| [F1:KL3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L463) | kalambury | 6.6 Kalambury (`kalambury`), szczegóły: 01-05-FINDINGS.md / pojedynczy | [F4-040](#f4-040) | aktualne S; oczekuje |
| [F1:L1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L473) | labirynt | 6.7 Labirynt (`labirynt`), szczegóły: 01-04-FINDINGS.md / pojedynczy | [F4-041](#f4-041) | aktualne S; oczekuje |
| [F1:L2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L474) | labirynt | 6.7 Labirynt (`labirynt`), szczegóły: 01-04-FINDINGS.md / pojedynczy | [F4-042](#f4-042) | aktualne S; oczekuje |
| [F1:RF1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L488) | refleks | Refleks (`refleks`), 01-06-FINDINGS.md / pojedynczy | [F4-043](#f4-043) | aktualne S; oczekuje |
| [F1:W6](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L496) | simon | Sekwencja (`simon`), 01-06-FINDINGS.md / pojedynczy | [F4-044](#f4-044) | aktualne S; oczekuje |
| [F1:SC7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L508) | schulte | Tabela Schultego (`schulte`), 01-07-FINDINGS.md / pojedynczy | [F4-045](#f4-045) | aktualne S; oczekuje |
| [F1:LC2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L520) | liczenie | Liczenie (`liczenie`), 01-07-FINDINGS.md / pojedynczy | [F4-046](#f4-046) | aktualne S; oczekuje |
| [F1:KO9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L528) | kolo | Narysuj koło (`kolo`), 01-08-FINDINGS.md / pojedynczy | [F4-047](#f4-047) | aktualne S; oczekuje |
| [F1:W8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L548) | sudoku | Sudoku (`sudoku`), 01-07-FINDINGS.md / pojedynczy | [F4-048](#f4-048) | aktualne S; oczekuje |
| [F1:SJ2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L568) | stoj | Stój! (`stoj`), 01-06-FINDINGS.md / pojedynczy | [F4-049](#f4-049) | aktualne S; oczekuje |
| [F1:SL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L576) | sledzenie | Śledzenie (`sledzenie`), 01-09-FINDINGS.md / pojedynczy | [F4-050](#f4-050) | aktualne S; oczekuje |
| [F1:W10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L577) | sledzenie | Śledzenie (`sledzenie`), 01-09-FINDINGS.md / pojedynczy | [F4-051](#f4-051) | aktualne S; oczekuje |
| [F1:BL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L610) | balon | Balon (`balon`), 01-06-FINDINGS.md / pojedynczy | [F4-052](#f4-052) | aktualne S; oczekuje |
| [F1:WP1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L618) | w-pamieci | W pamięci (`w-pamieci`), 01-09-FINDINGS.md / pojedynczy | [F4-053](#f4-053) | aktualne S; oczekuje |
| [F1:PM7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L645) | panstwa-miasta | 6.9 Państwa-miasta (`panstwa-miasta`), szczegóły: 01-05-FINDINGS.md / pojedynczy | [F4-054](#f4-054) | aktualne S; oczekuje |
| [F1:PM10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L646) | panstwa-miasta | 6.9 Państwa-miasta (`panstwa-miasta`), szczegóły: 01-05-FINDINGS.md / pojedynczy | [F4-055](#f4-055) | aktualne S; oczekuje |
| [F2:U1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L51) | piec-w-rzedzie, statki, chinczyk, labirynt, memory, panstwa-miasta, kalambury, kolo, kropki, kat, w-pamieci | U1. Ekran partii nie mieści się na 360×640 `[zbiorcze: wysokosc-640]` / zbiorczy | [F4-056](#f4-056) | aktualne S; oczekuje |
| [F2:U2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L75) | chinczyk, kampus-tour | U2. Akcja w partii dostępna dopiero po animacji `[zbiorcze: akcja-po-animacji]` / zbiorczy | [F4-057](#f4-057) | aktualne S; oczekuje |
| [F2:KT10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L87) | kampus-tour | KT10. Kampus Tour: treść środka planszy wyższa niż nakładka (do potwierdzenia w przeglądarce) / pojedynczy | [F4-058](#f4-058) | aktualne S; oczekuje |
| [F2:ZK1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L94) | zakupy | ZK1. Zakupy: „Gotowe” na `onClick` kończy pomiar drugiego kryterium / pojedynczy | [F4-059](#f4-059) | aktualne S; oczekuje |
| [F2:B-15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L114) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-060](#f4-060) | aktualne S; oczekuje |
| [F2:B-18](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L115) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-061](#f4-061) | aktualne S; oczekuje |
| [F2:B-20](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L116) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-062](#f4-062) | aktualne S; oczekuje |
| [F2:B-29](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L117) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-063](#f4-063) | aktualne S; oczekuje |
| [F2:B-52](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L118) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-064](#f4-064) | aktualne S; oczekuje |
| [F2:B-53](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L119) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-065](#f4-065) | aktualne S; oczekuje |
| [F2:HM-1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L120) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-066](#f4-066) | aktualne S; oczekuje |
| [F2:HM-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L121) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-067](#f4-067) | aktualne S; oczekuje |
| [F2:HM-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L122) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-068](#f4-068) | aktualne S; oczekuje |
| [F2:HM-8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L123) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-069](#f4-069) | aktualne S; oczekuje |
| [F2:SU-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L124) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-070](#f4-070) | aktualne S; oczekuje |
| [F2:RC-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L125) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-071](#f4-071) | aktualne S; oczekuje |
| [F2:RC-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L126) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-072](#f4-072) | aktualne S; oczekuje |
| [F2:RC-6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L127) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-073](#f4-073) | aktualne S; oczekuje |
| [F2:AP-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L128) | platforma | 3. Rozbieżności platformy (02-02, 02-03) / pojedynczy | [F4-074](#f4-074) | aktualne S; oczekuje |
| [F2:A1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L287) | chinczyk | 4.10 Wpisy z macierzy / macierz | [F4-075](#f4-075) | aktualne S; oczekuje |
| [F2:A2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L288) | labirynt | 4.10 Wpisy z macierzy / macierz | [F4-076](#f4-076) | aktualne S; oczekuje |
| [F2:A3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L289) | piec-w-rzedzie, statki, memory | 4.10 Wpisy z macierzy / macierz | [F4-077](#f4-077) | aktualne S; oczekuje |
| [F2:A4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L290) | mapa, kolor, kropki, kat, rok, srodek, tort, nozyczki | 4.10 Wpisy z macierzy / macierz | [F4-078](#f4-078) | aktualne S; oczekuje |
| [F2:A5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L291) | kolo, zaslona, srodek, nozyczki | 4.10 Wpisy z macierzy / macierz | [F4-079](#f4-079) | aktualne S; oczekuje |
| [F2:A6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L292) | refleks, simon, memory, statki | 4.10 Wpisy z macierzy / macierz | [F4-080](#f4-080) | aktualne S; oczekuje |
| [F2:A7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L293) | statki, kampus-tour, panstwa-miasta | 4.10 Wpisy z macierzy / macierz | [F4-081](#f4-081) | aktualne S; oczekuje |
| [F2:A8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L294) | kampus-tour | 4.10 Wpisy z macierzy / macierz | [F4-082](#f4-082) | aktualne S; oczekuje |
| [F2:A9](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L295) | w-pamieci | 4.10 Wpisy z macierzy / macierz | [F4-083](#f4-083) | aktualne S; oczekuje |
| [F2:A10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L296) | panstwa-miasta, kalambury | 4.10 Wpisy z macierzy / macierz | [F4-084](#f4-084) | aktualne S; oczekuje |
| [F2:A11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L297) | panstwa-miasta, kalambury, turniej | 4.10 Wpisy z macierzy / macierz | [F4-085](#f4-085) | aktualne S; oczekuje |
| [F2:A12](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L298) | rok | 4.10 Wpisy z macierzy / macierz | [F4-086](#f4-086) | aktualne S; oczekuje |
| [F2:A13](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L299) | w-pamieci | 4.10 Wpisy z macierzy / macierz | [F4-087](#f4-087) | aktualne S; oczekuje |
| [F2:A14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L300) | memory | 4.10 Wpisy z macierzy / macierz | [F4-088](#f4-088) | aktualne S; oczekuje |
| [F2:A15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L301) | dziesiatki, sudoku, zakupy | 4.10 Wpisy z macierzy / macierz | [F4-089](#f4-089) | aktualne S; oczekuje |
| [F2:A16](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L302) | kampus-tour | 4.10 Wpisy z macierzy / macierz | [F4-090](#f4-090) | aktualne S; oczekuje |
| [F2:A17](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L303) | statki, panstwa-miasta, zakupy | 4.10 Wpisy z macierzy / macierz | [F4-091](#f4-091) | aktualne S; oczekuje |
| [F2:U3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L328) | platforma, kalambury, panstwa-miasta, turniej | U3. Ekran podsumowania wyższy niż 640 px `[zbiorcze: wysokosc-640]` (podsumowanie) / zbiorczy | [F4-092](#f4-092) | aktualne S; oczekuje |
| [F2:U4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L339) | platforma, kolor, rok, kampus-tour, piec-w-rzedzie, statki, chinczyk, labirynt, panstwa-miasta, tort, sledzenie | U4. Pola dotykowe poniżej 48 px `[zbiorcze: dotyk-48]` / zbiorczy | [F4-093](#f4-093) | aktualne S; oczekuje |
| [F2:U5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L363) | platforma, kolor, rok, kampus-tour, piec-w-rzedzie, kolo | U5. Kolory spoza tokenów `[zbiorcze: kolor-spoza-tokenow]` / zbiorczy | [F4-094](#f4-094) | aktualne S; oczekuje |
| [F2:U6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L377) | platforma, piec-w-rzedzie, chinczyk, labirynt, memory, kampus-tour, panstwa-miasta, sledzenie, zakupy | U6. Kolor jako jedyny sygnał `[zbiorcze: kolor-jedyny-sygnal]` / zbiorczy | [F4-095](#f4-095) | aktualne S; oczekuje |
| [F2:U7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L395) | platforma, statki, chinczyk, panstwa-miasta | U7. Token w cudzej roli `[zbiorcze: rola-tokenu]` / zbiorczy | [F4-096](#f4-096) | aktualne S; oczekuje |
| [F2:U8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L410) | kampus-tour, panstwa-miasta | U8. Pasek limitu i tytuł tury bez koloru gracza `[zbiorcze: pasek-tury-kolor-gracza]` / zbiorczy | [F4-097](#f4-097) | aktualne S; oczekuje |
| [F2:U9](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L420) | kampus-tour, kolor, kropki, kat, w-pamieci, kolo | U9. Inne słowo w roli słowa wspólnego `[zbiorcze: slowa]` / zbiorczy | [F4-098](#f4-098) | aktualne S; oczekuje |
| [F2:U10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L434) | stroop, liczenie, inny, obrot, literowka, dziesiatki, stoj, refleks | U10. Własna lista wyników zamiast `Scores` `[zbiorcze: wlasna-lista-wynikow]` / zbiorczy | [F4-099](#f4-099) | aktualne S; oczekuje |
| [F2:U11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L444) | przytrzymaj, balon, kropki, kat, rok, kolor | U11. Własna tabela rund zamiast `RoundTable` `[zbiorcze: wlasna-tabela-rund]` / zbiorczy | [F4-100](#f4-100) | aktualne S; oczekuje |
| [F2:U12](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L458) | platforma, memory, kampus-tour, chinczyk, labirynt, refleks, stoper, rytm, przytrzymaj, liczenie, kropki, kat, turniej | U12. Liczby bez Geist Mono albo bez `tabular-nums` `[zbiorcze: liczby-mono]` / zbiorczy | [F4-101](#f4-101) | aktualne S; oczekuje |
| [F2:U13](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L482) | platforma, kampus-tour, statki, balon, zakupy | U13. Podpis bloku poza `.label` `[zbiorcze: podpis-label]` / zbiorczy | [F4-102](#f4-102) | aktualne S; oczekuje |
| [F2:U14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L488) | platforma, kampus-tour, kalambury | U14. Waga ikony w małej akcji `[zbiorcze: waga-ikon]` / zbiorczy | [F4-103](#f4-103) | aktualne S; oczekuje |
| [F2:U15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L494) | platforma, kampus-tour, kalambury, turniej, kubki | U15. Przejście z domyślnym czasem Tailwinda 150 ms `[zbiorcze: transition-domyslny]` / zbiorczy | [F4-104](#f4-104) | aktualne S; oczekuje |
| [F2:U16](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L500) | platforma, piec-w-rzedzie, statki, labirynt, memory | U16. Animacje Tailwinda spoza `index.css` `[zbiorcze: animate-tailwind]` / zbiorczy | [F4-105](#f4-105) | aktualne S; oczekuje |
| [F2:U17](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L506) | platforma, piec-w-rzedzie, kolo, stroop, liczenie, inny, obrot, literowka, dziesiatki, sudoku, schulte, wieza, stoj, srodek, nozyczki | U17. Keyframes spoza listy §5 `[zbiorcze: keyframes-poza-5]` / zbiorczy | [F4-106](#f4-106) | aktualne S; oczekuje |
| [F2:U18](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L512) | platforma, kampus-tour, rytm, zakupy, kubki, sledzenie, wieza | U18. Animacja bez kategorii w tabeli czasów §5 `[zbiorcze: brak-w-tabeli-5]` / zbiorczy | [F4-107](#f4-107) | aktualne S; oczekuje |
| [F2:U19](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L528) | platforma, turniej, w-pamieci | U19. Czas pojawienia inny niż 350 ms `[zbiorcze: czas-pojawienia]` / zbiorczy | [F4-108](#f4-108) | aktualne S; oczekuje |
| [F2:U20](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L533) | platforma | U20. Komentarz w `index.css` węższy niż użycie `[zbiorcze: komentarz-nieaktualny]` / zbiorczy | [F4-109](#f4-109) | aktualne S; oczekuje |
| [F2:U21](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L539) | platforma, kolor, rok, kampus-tour, piec-w-rzedzie, statki, memory | U21. Cień poza miejscami z `DESIGN.md` §2 `[zbiorcze: cien]` / zbiorczy | [F4-110](#f4-110) | aktualne S; oczekuje |
| [F2:U22](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L545) | platforma, kolor, rok, turniej, kampus-tour, statki, chinczyk, obrot, wieza | U22. Zaokrąglenie spoza 20 / 10 / 999 px `[zbiorcze: promien]` / zbiorczy | [F4-111](#f4-111) | aktualne S; oczekuje |
| [F2:U23](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L551) | platforma, kampus-tour, kalambury, zaslona, balon, inny, sudoku, statki, labirynt | U23. Dostępność: `aria-hidden`, `aria-label`, role `[zbiorcze: aria]` / zbiorczy | [F4-112](#f4-112) | aktualne S; oczekuje |
| [F2:U24](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L570) | platforma | U24. Rozłączony gracz `[zbiorcze: stan-rozlaczony]` / zbiorczy | [F4-113](#f4-113) | aktualne S; oczekuje |
| [F2:U25](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L575) | platforma, panstwa-miasta, turniej, memory | U25. Krycie stanu spoza tabeli `DESIGN.md` §4 `[zbiorcze: stan-krycie]` / zbiorczy | [F4-114](#f4-114) | aktualne S; oczekuje |
| [F2:U26](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L581) | platforma | U26. Stan ładowania niezgodny z `DESIGN.md` §4 `[zbiorcze: stan-ladowania]` / zbiorczy | [F4-115](#f4-115) | aktualne S; oczekuje |
| [F2:U27](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L587) | platforma, kampus-tour, wieza, balon | U27. `float-up` niewidoczne przy reduced motion `[zbiorcze: float-up-reduced]` / zbiorczy | [F4-116](#f4-116) | aktualne S; oczekuje |
| [F2:U28](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L592) | refleks, stoper, stoj, wieza | U28. Pomiar z obsługi zdarzenia zamiast `e.timeStamp` `[zbiorcze: pomiar-timestamp]` / zbiorczy | [F4-117](#f4-117) | aktualne S; oczekuje |
| [F2:U29](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L597) | simon, stoj | U29. `accent-fg` poza akcentem `[zbiorcze: accent-fg-poza-akcentem]` / zbiorczy | [F4-118](#f4-118) | aktualne S; oczekuje |
| [F2:U30](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L602) | platforma, panstwa-miasta, kalambury, kropki, kat, rok, obrot, wieza, zaslona, przytrzymaj | U30. Drobne różnice słów `[zbiorcze: slowa-drobne]` / zbiorczy | [F4-119](#f4-119) | aktualne S; oczekuje |
| [F2:U31](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L609) | platforma, schulte, sudoku | U31. Zapis ułamka bez wspólnej funkcji `[zbiorcze: przecinek]` / zbiorczy | [F4-120](#f4-120) | aktualne S; oczekuje |
| [F2:U32](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L614) | piec-w-rzedzie, statki, labirynt, memory | U32. Animacja pojawienia gra ponownie po odświeżeniu `[zbiorcze: animacja-po-odswiezeniu]` (02-05 Z3) / zbiorczy | [F4-121](#f4-121) | aktualne S; oczekuje |
| [F2:U33](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L619) | kolo, balon | U33. Zapis braku wartości `[zbiorcze: brak-wartosci]` / zbiorczy | [F4-122](#f4-122) | aktualne S; oczekuje |
| [F2:U34](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L624) | inny, literowka, dziesiatki, sudoku | U34. Szerokość bez skalowania `[zbiorcze: szerokosc-bez-skalowania]` / zbiorczy | [F4-123](#f4-123) | aktualne S; oczekuje |
| [F2:U35](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L629) | przytrzymaj, stoper | U35. Własne progi zamiast `grade` `[zbiorcze: wlasny-grade]` / zbiorczy | [F4-124](#f4-124) | aktualne S; oczekuje |
| [F2:U36](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L634) | kolo, srodek, mapa, tort, nozyczki | U36. Punkt `time` w `Intro` bez czasu `[zbiorcze: intro-time]` / zbiorczy | [F4-125](#f4-125) | aktualne S; oczekuje |
| [F2:U37](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L639) | rok, kropki, kat | U37. Kolor znacznika prawdy w odsłonie `[zbiorcze: znacznik-prawdy]` / zbiorczy | [F4-126](#f4-126) | aktualne S; oczekuje |
| [F2:QZ3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L772) | platforma | `Quiz.tsx` (wspólny, D-02), szczegóły: 02-08-FINDINGS.md sekcja Kolor liter / pojedynczy | [F4-127](#f4-127) | aktualne S; oczekuje |
| [F2:SZ2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L781) | platforma | `Szacowanie.tsx` (wspólny), szczegóły: 02-09-FINDINGS.md sekcja Policz kropki / pojedynczy | [F4-128](#f4-128) | aktualne S; oczekuje |
| [F2:KT1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L795) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-129](#f4-129) | aktualne S; oczekuje |
| [F2:KT14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L796) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-130](#f4-130) | aktualne S; oczekuje |
| [F2:KA2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L797) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-131](#f4-131) | aktualne S; oczekuje |
| [F2:KA3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L798) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-132](#f4-132) | aktualne S; oczekuje |
| [F2:KT11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L799) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-133](#f4-133) | aktualne S; oczekuje |
| [F2:KS1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L800) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-134](#f4-134) | aktualne S; oczekuje |
| [F2:KS2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L801) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-135](#f4-135) | aktualne S; oczekuje |
| [F2:KS3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L802) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-136](#f4-136) | aktualne S; oczekuje |
| [F2:KS6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L803) | kampus-tour | 8.2 Kampus Tour (`kampus-tour`) i `KampusSummary`, szczegóły: 02-04-FINDINGS.md / pojedynczy | [F4-137](#f4-137) | aktualne S; oczekuje |
| [F2:C7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L822) | chinczyk | 8.5 Chińczyk (`chinczyk`), szczegóły: 02-05-FINDINGS.md / pojedynczy | [F4-138](#f4-138) | aktualne S; oczekuje |
| [F2:KL4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L836) | kalambury | 8.7 Kalambury (`kalambury`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-139](#f4-139) | aktualne S; oczekuje |
| [F2:KL8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L837) | kalambury | 8.7 Kalambury (`kalambury`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-140](#f4-140) | aktualne S; oczekuje |
| [F2:SC2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L871) | schulte | Tabela Schultego (`schulte`), 02-08-FINDINGS.md / pojedynczy | [F4-141](#f4-141) | aktualne S; oczekuje |
| [F2:ST1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L880) | stroop | Kolor liter (`stroop`), 02-08-FINDINGS.md / pojedynczy | [F4-142](#f4-142) | aktualne S; oczekuje |
| [F2:ST2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L881) | stroop | Kolor liter (`stroop`), 02-08-FINDINGS.md / pojedynczy | [F4-143](#f4-143) | aktualne S; oczekuje |
| [F2:KO4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L895) | kolo | Narysuj koło (`kolo`), 02-09-FINDINGS.md / pojedynczy | [F4-144](#f4-144) | aktualne S; oczekuje |
| [F2:OD1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L904) | kolor | Odcień (`kolor`), 02-09-FINDINGS.md / pojedynczy | [F4-145](#f4-145) | aktualne S; oczekuje |
| [F2:SU2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L923) | sudoku | Sudoku (`sudoku`), 02-08-FINDINGS.md / pojedynczy | [F4-146](#f4-146) | aktualne S; oczekuje |
| [F2:RY3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L962) | rytm | Rytm (`rytm`), 02-07-FINDINGS.md / pojedynczy | [F4-147](#f4-147) | aktualne S; oczekuje |
| [F2:IN2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L971) | inny | Inny element (`inny`), 02-08-FINDINGS.md / pojedynczy | [F4-148](#f4-148) | aktualne S; oczekuje |
| [F2:MP1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L990) | mapa | Mapa (`mapa`), 02-09-FINDINGS.md / pojedynczy | [F4-149](#f4-149) | aktualne S; oczekuje |
| [F2:BL5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1004) | balon | Balon (`balon`), 02-07-FINDINGS.md / pojedynczy | [F4-150](#f4-150) | aktualne S; oczekuje |
| [F2:ZK5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1033) | zakupy | Zakupy (`zakupy`), 02-08-FINDINGS.md / pojedynczy | [F4-151](#f4-151) | aktualne S; oczekuje |
| [F2:PM2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1048) | panstwa-miasta | 8.10 Państwa-miasta (`panstwa-miasta`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-152](#f4-152) | aktualne S; oczekuje |
| [F2:TU1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1058) | turniej | 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-153](#f4-153) | aktualne S; oczekuje |
| [F2:TU2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1059) | turniej | 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-154](#f4-154) | aktualne S; oczekuje |
| [F2:TU5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1060) | turniej | 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-155](#f4-155) | aktualne S; oczekuje |
| [F2:TU6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1061) | turniej | 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-156](#f4-156) | aktualne S; oczekuje |
| [F2:TU8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1062) | turniej | 8.11 Turniej (`turniej`), szczegóły: 02-06-FINDINGS.md / pojedynczy | [F4-157](#f4-157) | aktualne S; oczekuje |
| [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | simon, zakupy, srodek, tort, sledzenie, panstwa-miasta, rok | R1. Limit tury bez zapasu `[zbiorcze: limit-tury-bez-zapasu]` (= F1:Z2, liczby fazy 3) / zbiorczy | [F4-002](#f4-002) | scalone, aktualne S; oczekuje |
| [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | stoper, rytm, liczenie, kolor, kat, w-pamieci, obrot, dziesiatki, sudoku, sledzenie, stoj, zaslona, literowka, rok, kubki | R2. Trudność partii zależy od losowania `[zbiorcze: trudnosc-z-losowania]` (= F1:Z3, liczby fazy 3) / zbiorczy | [F4-003](#f4-003) | scalone, aktualne S; oczekuje |
| [F3:R3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L285) | w-pamieci, kubki, simon | R3. Sufit osiągalny bez rozstrzygnięcia remisu `[zbiorcze: sufit-bez-tie]` / zbiorczy | [F4-158](#f4-158) | aktualne S; oczekuje |
| [F3:R4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L297) | wieza, zakupy | R4. Sufit w zasięgu najlepszych, `tie` mierzy co innego `[zbiorcze: sufit-osiagalny]` / zbiorczy | [F4-159](#f4-159) | aktualne S; oczekuje |
| [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | kampus-tour, piec-w-rzedzie, labirynt, statki, memory | R5. Przewaga kolejności w grach głównych `[zbiorcze: przewaga-pierwszego]` / zbiorczy | [F4-160](#f4-160) | aktualne S; oczekuje |
| [F3:R6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L318) | refleks, stoper, stoj, wieza | R6. Pomiar czasu od zmiany stanu, nie od klatki `[zbiorcze: pomiar-od-klatki]` (styk z F2:U28 `pomiar-timestamp`) / zbiorczy | [F4-117](#f4-117) | scalone, aktualne S; oczekuje |
| [F3:R7](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L329) | balon | R7. `withSum` wyrównuje sumę, ale nie szanse `[zbiorcze: withsum-rozklad]` / zbiorczy | [F4-161](#f4-161) | aktualne S; oczekuje |
| [F3:R8](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L340) | platforma | R8. Limit mini-gry odnawiany wynikiem rywala `[zbiorcze: limit-odnawiany-wynikiem]` / zbiorczy | [F4-162](#f4-162) | aktualne S; oczekuje |
| [F3:B-KT3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L351) | kampus-tour | 8. Wpisy pojedyncze / pojedynczy | [F4-163](#f4-163) | aktualne S; oczekuje |
| [F3:B-KT2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L352) | kampus-tour | 8. Wpisy pojedyncze / pojedynczy | [F4-164](#f4-164) | aktualne S; oczekuje |
| [F3:B-KT4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L353) | kampus-tour | 8. Wpisy pojedyncze / pojedynczy | [F4-023](#f4-023) | scalone, aktualne S; oczekuje |
| [F3:B-KT5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L354) | kampus-tour | 8. Wpisy pojedyncze / pojedynczy | [F4-030](#f4-030) | scalone, aktualne S; oczekuje |
| [F3:B-KT6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L355) | kampus-tour | 8. Wpisy pojedyncze / pojedynczy | [F4-165](#f4-165) | aktualne S; oczekuje |
| [F3:B-PM2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L356) | panstwa-miasta | 8. Wpisy pojedyncze / pojedynczy | [F4-166](#f4-166) | aktualne S; oczekuje |
| [F3:B-KA1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L357) | kalambury | 8. Wpisy pojedyncze / pojedynczy | [F4-167](#f4-167) | aktualne S; oczekuje |
| [F3:B-TU1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L358) | turniej | 8. Wpisy pojedyncze / pojedynczy | [F4-168](#f4-168) | aktualne S; oczekuje |

## 4. Rejestr F4

Każdy wpis ma wariant zmiany wskazany w propozycji oraz wariant zachowania z udokumentowanym powodem albo odrzucenia z uzasadnieniem. Żaden wariant nie został wybrany. Źródła reguł to dokumenty projektu; oznaczenia D-* są metodą audytu, nie nową regułą produktu. Wagi i priorytety wdrożenia są odrębne; pakiety i priorytety powstaną w 04-03.

<a id="f4-001"></a>

### F4-001. Limit czasu nie jest najgorszym wynikiem

- Zakres: `schulte`, `sudoku`, `kropki`.
- Ślad źródłowy: [F1:Z1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L38).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; wynik po limicie może wyprzedzić oddany uczciwie wynik, również w turnieju.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :89-90 („w mini-grze jest to najgorszy możliwy wynik”). Dokumenty gier opisują limit tak, jak robi to kod, więc rozbieżność jest między §3 a parą kod + `ZASADY-GIER.md`.
- Waga: **wysoka** we wszystkich trzech grach (ujednolicone wg D-09; 01-08 dawało Policz kropki średnią, bo tam trzeba odpowiadać gorzej niż samymi zerami, ale skutek jest ten sam:
  gracz po limicie wyprzedza gracza z oddanym wynikiem, także w turnieju).

| Gra | Miejsce | Limit | Najgorszy uczciwy | Dowód |
|---|---|---|---|---|
| `schulte` | `packages/games/src/schulte.ts:75` (limit), `:55-58` (walidacja), `:25` (wynik); `ZASADY-GIER.md` :89; test `packages/games/src/schulte.test.ts:73` | 180 000 ms, 0 pomyłek | bez górnej granicy (np. 170 s + 4 pomyłki = 182 s) | `fuzz07.ts`: 10/400 partii z limitem wyżej (01-07 W7a) |
| `sudoku` | `packages/games/src/sudoku.ts:112`, `:99`, `:29`; `ZASADY-GIER.md` :557; test `packages/games/src/sudoku.test.ts:216` | 120 000 ms, 0 pomyłek | bez górnej granicy (60 s + 13 złych cyfr = 125 s) | `fuzz07.ts`: 16/400 (01-07 W7a) |
| `kropki` | `packages/games/src/kropki.ts:78` (pusta lista = same zera), `:71`; `ZASADY-GIER.md` :152; test `packages/games/src/kropki.test.ts:67` | 240 | 750 (99 w każdej rundzie) | `fuzz08.ts`: 76/400, na 500 seedach zawsze o 510 lepszy (01-08 W8a) |

- Historia: Schulte od `0178866` (2026-10-08), Sudoku od `a6fb8a2` (2026-10-12), Policz kropki od `98a3e34` (2026-10-08); Kąt (`186bb49`) i Który rok? wzięły już najgorszy możliwy błąd,
  a sekcja Kąta w `ZASADY-GIER.md` :166-167 wprost odrzuca wzór „same zera”.
- Propozycja (popraw test, dokument, kod; decyzja w fazie 4):
  - Policz kropki: limit = `max(n, 99 − n)` w każdej rundzie, jak `packages/games/src/kat.ts:34`, `packages/games/src/rok.ts:33`; test „żadna odpowiedź nie jest gorsza od limitu” jak `packages/games/src/kat.test.ts:88`; `ZASADY-GIER.md` :152.
  - Schulte i Sudoku: limit zawsze za każdym oddanym wynikiem (komparator „wynik z limitu na końcu”: w Schultem rozpoznawalny po `splits: []`, w Sudoku potrzebne pole)
    albo górna granica `ms + kara` w walidacji równa wynikowi limitu (wtedy gorszy uczciwy wynik przepada, co też trzeba opisać). Testy „limit przegrywa z wynikiem z karą ponad limit”.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-002"></a>

### F4-002. Limit tury krótszy od najdłuższej uczciwej partii

- Zakres: `simon`, `zakupy`, `srodek`, `tort`, `sledzenie`, `panstwa-miasta`, `rok`.
- Ślad źródłowy: [F1:Z2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L56), [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; limit może odebrać wynik uczciwej partii; Środek i Tort mają wagę wysoką według modelu, do pomiaru.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :106 („tyle, ile trwa najdłuższa uczciwa partia plus zapas”); wymóg zapasu ≥ 20% i ≥ 10 s z D-07.
- Waga: **wysoka** (Sekwencja i Zakupy wyliczone; Środek i Tort wysokie według modelu 5 s na celowanie, do potwierdzenia pomiarem w partii).
  F1:Z2 dawało Środkowi średnią „do pomiaru”; model fazy 3 daje −3 s, więc wysoka z zastrzeżeniem.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `simon` (B-SQ1, F1:SQ1) | `packages/games/src/simon.ts:25`, `:45`; `apps/web/src/games/Simon.tsx:61-64`, `:74-79` (oddanie wyniku) | limit ucina serię 21-24 (d = 0,35-0,7 s na kolor), z zapasem mieści 18-21; dobrzy gracze 15-20 | wysoka | ruch `progress` z bieżącą serią i `timeoutMove` oddający ostatnią zaliczoną (odstępstwo z powodem w `ZASADY-GIER.md` §Sekwencja) albo limit 600 s; wzór T(N) w dokumencie | zmienić | W (wzór), A (d) |
| `zakupy` (B-ZK1, F1:ZK1) | `packages/games/src/zakupy.ts:8-9`, `:37`; `packages/games/src/zakupy.test.ts:42-45`; `ZASADY-GIER.md` :492 | T = 63 s, L = 60 s, zapas −3 s | wysoka | `turnSeconds` 75-80 s, ekran oddaje sam po `MAX_MS` (styk z F2:ZK1: ta sama funkcja `done`); najpierw test i dokument | zmienić | W |
| `srodek` (B-SR1, F1:SR1) | `packages/games/src/srodek.ts:83`; `packages/games/src/srodek.test.ts:39`; `ZASADY-GIER.md` :27; `KONCEPT.md` §3 | T = 63 s przy 5 s na rundę, 43 s przy 3 s | wysoka (A) | `turnSeconds` 90 s | zmienić | A |
| `tort` (B-TO1) | `packages/games/src/tort.ts:42`; `ZASADY-GIER.md` §Tort; `KONCEPT.md` :234 | 20 cięć: T = 120,5 s przy 5 s na cięcie, 80,5 s przy 3 s | wysoka (A) | `turnSeconds` 180 s (zapas 49% przy 5 s) | zmienić albo zmierzyć w partii | A |
| `sledzenie` (B-SL2) | `packages/games/src/sledzenie.ts:70`; `KONCEPT.md` :233 | T = 287 s, zapas 13 s (4,5%); część stała 164 s | średnia | `turnSeconds` 360 s (zapas 25%) | zmienić (tanio) | W, A |
| `panstwa-miasta` (B-PM1) | `packages/games/src/panstwa-miasta.ts:43`, `:153`; `ZASADY-GIER.md` :637 | głosowanie 45 s: przy 6 os. 30 odpowiedzi, 1,5 s na odpowiedź; limit = „nic nie odrzucam” | średnia | głosowanie `20 + 7 × (n − 1)` s (27 / 41 / 55 s przy 2 / 4 / 6 os.) | sprawdzić w partii (6 os.), potem zmienić | W, A |
| `rok` (B-RK2) | `packages/games/src/rok.ts:30`; `ZASADY-GIER.md` :181 | T twarde 228 s, zapas 12 s (5%) tylko na sieć | niska | 270 s albo zapis „T twarde, zapas na sieć” | zmienić (tanio) | W |

- Wspólna propozycja: zapisać model T i wymóg zapasu w `ZASADY.md` §3 :106 (F3 §12) i przy każdej zmianie limitu poprawić `KONCEPT.md` §3 (lista limitów), test `<gra>.test.ts` i `ZASADY-GIER.md`.

Uzgodnienie faz: Scalenie F1:Z2 z F3:R1: Sekwencja i Zakupy zachowują wagę wysoką (wyliczenie). Środek: F1 średnia, F3 wysoka warunkowa przy założeniu 5 s na celowanie; Tort również wysoka według modelu. Nie uznajemy modelu za pomiar człowieka. Śledzenie i głosowanie: średnia; Który rok?: niska. Alternatywa F1 dla Sekwencji: automatyczne oddanie ostatniej zaliczonej serii przed limitem. Samo 600 s nadal nie obejmuje teoretycznej serii 100, więc nie jest pełnym rozwiązaniem bez określenia zachowania na końcu limitu. F1 lokalizuje też `apps/web/src/games/Zakupy.tsx:68`, brak automatycznego oddania wyniku.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-003"></a>

### F4-003. Losowe wyzwanie zmienia trudność partii

- Zakres: `stoper`, `rytm`, `liczenie`, `kolor`, `kat`, `w-pamieci`, `obrot`, `dziesiatki`, `sudoku`, `sledzenie`, `stoj`, `zaslona`, `literowka`, `rok`, `kubki`.
- Ślad źródłowy: [F1:Z3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L127), [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :100-102. Litera (sufit, suma) spełniona; uzasadnienie (każda partia równie trudna) nie.
- Waga: **średnia** (wszyscy w partii grają to samo wyzwanie; dotyka porównania rekordów między partiami: rekord pada w „łatwej” partii).

| gra | miejsce | rozrzut (Z) i skutek | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `stoper` (B-SP1, F1:W6a) | `packages/games/src/stoper.ts:30` | cel 6-14 s; oczekiwana odchyłka 480 → 1120 ms (2,3×) | średnia (największy efekt) | stały cel 10 s albo kilka rund o stałej sumie (`withSum`); albo wynik względny (‰ celu); zmiana wyniku = nowy klucz rekordów | zmienić | W, A |
| `rytm` (B-RY1, F1:W6a) | `packages/games/src/rytm.ts:35`, `:50` | odstęp 462-857 ms; 14-23 ms wobec 26-43 ms (1,9×) | średnia | odchyłka względna (‰ odstępu) albo stałe tempo; nowy klucz rekordów i `FORMAT` | zmienić | Z, A |
| `kolor` (B-KR1, F1:W8b) | `packages/games/src/kolor.ts:89` | czułość 47-86 ΔE, p95 / p5 1,35× | średnia | barwy z sześciu sektorów bez powtórzeń, nasycenie i jasność z pasm na zmianę, albo losowanie do skutku w paśmie mediany ±5% | zmienić | Z, A |
| `liczenie` (B-LC1, F1:LC1) | `packages/games/src/liczenie.ts:32`; `ZASADY-GIER.md` :112 („po równo”) | każdy rodzaj 1-21 na 40; ok. 2 trafienia (13%) | średnia | rodzaje potasowanymi czwórkami (jak `packages/games/src/stroop.ts:35`); przy wyniku równym a albo b losować od nowa tylko liczby | zmienić | Z, A |
| `obrot` (B-OB1) | `packages/games/src/obrot.ts:68`, `:72` | lustro 8-29 i 180° 5-25 na 40; ok. 1-1,5 trafienia (8%) | średnia | szóstki 90 / 180 / 270 × ta sama / lustro, tasowane | zmienić | Z, A |
| `dziesiatki` (B-DZ1) | `packages/games/src/dziesiatki.ts:48-58`, `:27-33` | par na planszy 4,4-19,7 (30%) | średnia | dostawy z kompletów cyfr albo `take` pilnujący stałej liczby par (np. dokładnie 2) | zmienić, sprawdzić w partii | Z, A |
| `sudoku` (B-SU1) | `packages/games/src/sudoku.ts:64-80` | pola z jednym kandydatem 1-7, fale 2-5 | średnia | `makePuzzle` losuje do skutku planszę o stałej liczbie fal i pól „od razu” (np. 3 i 3) | zmienić | Z, A |
| `kat` (B-KAT1, F1:W8b) | `packages/games/src/kat.ts:53` (setup, `int(rng, MIN, MAX)`) | suma kątów 421-1378° (18%); wpływ na błąd nieznany | średnia | po dwa kąty z pięciu pasm (5-38°, 39-72°, 73-106°, 107-140°, 141-175°), tasowane | sprawdzić w partii, potem zmienić | Z, A |
| `sledzenie` (B-SL1) | `packages/games/src/sledzenie.ts:31-45` | mijanki celu w rundzie 1: 11-138 (30%) | średnia | losowanie rundy do skutku w paśmie mediany mijanek ±20% | zmienić | Z, A |
| `w-pamieci` (B-WP1, F1:W9a) | `packages/games/src/w-pamieci.ts:35-46` | mnożeń 15-35 na partię, 2-14 w rundach 1-6 | średnia | co trzecie działanie mnożenie, pozycje tasowane w rundzie | zmienić | Z, A |
| `stoj` (B-SJ1) | `packages/games/src/stoj.ts:54-55` | zielone w szybkiej końcówce 6-16 (14,5%) | niska | czerwone tasowane osobno w każdej tercji harmonogramu | sprawdzić w partii | Z, A |
| `zaslona` (B-ZS1) | `packages/games/src/zaslona.ts:32`, `:46-48` | widoczność 8,3-14,2 s (8,8%) | niska | widoczność przez `withSum` (np. 11 200 ms) albo stały stosunek do ukrytego czasu | sprawdzić w partii | Z, A |
| `literowka` (B-LT1) | `packages/games/src/literowka.ts:38-39`, `packages/games/src/literowka-dane.ts` | rodzaj błędu 6-25 na 45 (18%) | niska | rodzaje błędów w tasowanych trójkach (wymaga pola rodzaju w danych) | sprawdzić w partii | Z, A |
| `rok` (B-RK1) | `packages/games/src/rok.ts:37-213`, `:224` | wydarzeń od 1990 1-9 (29%); działy tylko w komentarzach | niska | pole `dzial` w `EVENTS`, po 2-3 wydarzenia z działu | sprawdzić w partii | Z, A |
| `kubki` (B-KB2) | `packages/games/src/kubki.ts:30-40` | ruchy kulki w rundzie 11: 7-13 (11,6%) | niska | udział zamian z kulką w stałym paśmie | zostawić | Z |

- Gry, w których F1:Z3 przypuszczało wpływ, a faza 3 go nie potwierdza liczbą: brak (wszystkie 6 z F1:Z3 mają rozrzut ≥ 9%). Gry spoza F1:Z3 dodane przez fazę 3: Obrót, Dziesiątki, Sudoku, Śledzenie i niskie.
- Historia (F1:Z3): Stoper, Rytm i Liczenie sprzed reguły kompletów (`a590005`, 2026-10-12). Zmiana miary wyniku (Stoper, Rytm) unieważnia stare rekordy: osobny klucz albo wersja w `apps/server/src/stats.ts` (decyzja fazy 4).

Uzgodnienie faz: Scalenie F1:Z3 z F3:R2: sześć pierwotnych gier i dziewięć rozszerzeń fazy 3 to jeden problem porównywalności. Rozrzut losowania jest zmierzony symulacją; wpływ na błąd człowieka pozostaje założeniem. Sugestie źródła „nowy klucz rekordów” dla Stopera i Rytmu nie upoważniają do zmiany `id`: `AGENTS.md` zabrania zmiany id. Zmiana jednostek wymaga wariantu zgodności dawnych rekordów i `detail` w 04-02; migracja i czyszczenie danych są poza zakresem.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-004"></a>

### F4-004. Definicja bez testu: liczba graczy, limit tury, świeża gra

- Zakres: `kampus-tour`, `piec-w-rzedzie`, `statki`, `chinczyk`, `panstwa-miasta`, `turniej`, `refleks`, `simon`, `stoper`, `schulte`, `stroop`, `liczenie`, `kolo`, `kolor`, `kropki`.
- Ślad źródłowy: [F1:Z4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L146).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Definicja (:54); D-03 (każdy tryb). `packages/games/src/index.test.ts:24` sprawdza tylko id, `:66` przepuściłby grę skończoną od startu (01-01-CHECKS.md §4.2, kolumna Def).
- Waga: **średnia**. Zachowanie poprawne we wszystkich grach (`fuzz04..09.ts`: świeża gra nieskończona; limity zgodne z `KONCEPT.md` §3, 01-01-CHECKS.md §3).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `packages/games/src/kampus-tour.test.ts:165`; `packages/games/src/kampus-tour.ts:471` | `turnSeconds`, świeża gra | K16 |
| `piec-w-rzedzie` | `packages/games/src/piec-w-rzedzie.test.ts:237-239` (`toBeGreaterThan(0)`) | `turnSeconds === 60` | G2 |
| `statki` | `packages/games/src/statki.test.ts:521-523`, `:497`; `packages/games/src/statki.ts:148`, `:247` | 60 s bitwy wprost, świeża gra | S1 |
| `chinczyk` | `packages/games/src/chinczyk.test.ts:53` (Klasyczny), `:439` (tylko Szybki) | świeża gra w trybie Klasycznym | C2 |
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:43`; `packages/games/src/panstwa-miasta.ts:72-73` | min/max, świeża gra | PM1 |
| `turniej` | `packages/games/src/turniej.test.ts:26`; `packages/games/src/turniej.ts:8` | `NEXT_SECONDS === 15` | T2 |
| `refleks` | `packages/games/src/refleks.test.ts:32-39`; `packages/games/src/refleks.ts:29-30` | min/max, świeża gra | RF2 |
| `simon` | brak w `packages/games/src/simon.test.ts`; `packages/games/src/simon.ts:23-25` | min/max, 300 s, świeża gra | SQ2 |
| `stoper` | brak w `packages/games/src/stoper.test.ts`; `packages/games/src/stoper.ts:25-27` | min/max, 60 s | SP1 |
| `schulte` | `packages/games/src/schulte.test.ts:115-116` (porównanie z `game.turnSeconds`); `packages/games/src/schulte.ts:33-34` | 180 s wprost, min/max, świeża gra | SC1 |
| `stroop` | brak w `packages/games/src/stroop.test.ts`; `packages/games/src/stroop.ts:25-28` | wszystko | ST1 |
| `liczenie` | brak w `packages/games/src/liczenie.test.ts`; `packages/games/src/liczenie.ts:57-60` | wszystko | LC3 |
| `kolo` | `packages/games/src/kolo.test.ts:176`; `packages/games/src/kolo.ts:108-110` | min/max, 120 s wprost, świeża gra | KO2 |
| `kolor` | brak w `packages/games/src/kolor.test.ts` (świeża gra częściowo :78); `packages/games/src/kolor.ts:78-80` | min/max, 180 s | OD1 |
| `kropki` | `packages/games/src/kropki.test.ts:79`, `:131`; `packages/games/src/kropki.ts:48-50` | min/max, 120 s wprost | KR1 |

- Propozycja: w każdej grze test jak `packages/games/src/kat.test.ts:26` / `packages/games/src/sudoku.test.ts:52-72` (min, max, limit liczbą, `isOver(setup)` = `null`, w każdym trybie).
  Alternatywa (D-04): jeden test w `packages/games/src/index.test.ts` z tabelą oczekiwanych limitów z `KONCEPT.md` §3 i sprawdzeniem `isOver(setup)` w `describe.each(CASES)` zamyka punkt dla wszystkich gier naraz.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-005"></a>

### F4-005. Setup: ten sam seed daje to samo

- Zakres: `statki`, `panstwa-miasta`, `simon`, `stoper`, `stroop`, `liczenie`, `schulte`, `kolo`, `kolor`, `kropki`.
- Ślad źródłowy: [F1:Z5](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L171).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Setup (:55) i Mini-gra „rewanż daje inne wyzwanie” (:75). Waga: **średnia**. Determinizm potwierdzony skryptem (01-01-CHECKS.md §2, 46/46).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `statki` | `packages/games/src/statki.test.ts:91`, `:134` | ten sam seed | S2 |
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:122` (tylko `nonce`); `packages/games/src/panstwa-miasta.ts:84-85` | ten sam seed, inne litery dla innego | PM2 |
| `simon` | `packages/games/src/simon.test.ts:25` (`length ≥ 50`, kod ma 100) | długość 100, ten sam / inny seed | SQ3 |
| `stoper` | `packages/games/src/stoper.test.ts:35` (tylko inny `nonce`) | ten sam seed | SP2 |
| `stroop` | brak | start, ten sam / inny seed | ST2 |
| `liczenie` | `packages/games/src/liczenie.test.ts:83` (`waitingFor` po ruchu) | start, seedy | LC4 |
| `schulte` | `packages/games/src/schulte.test.ts:32` (tylko „nie posortowana”) | seedy | SC2 |
| `kolo` | `packages/games/src/kolo.test.ts:102` (tylko inny `nonce`) | ten sam seed | KO3 |
| `kolor` | `packages/games/src/kolor.test.ts:38` (tylko inny seed) | ten sam seed | OD2 |
| `kropki` | `packages/games/src/kropki.test.ts:43` (tylko inny seed) | ten sam seed | KR2 |

- Propozycja: `expect(game.setup(p, createRng(n))).toEqual(game.setup(p, createRng(n)))` i `not.toEqual` dla dwóch seedów (wzór `packages/games/src/inny.test.ts:44`, `packages/games/src/kat.test.ts:48`);
  albo jedno sprawdzenie w `describe.each(CASES)`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-006"></a>

### F4-006. Ruch po końcu gry bez testu

- Zakres: `panstwa-miasta`, `refleks`, `simon`, `stoper`, `stroop`, `liczenie`, `schulte`, `kolo`, `kolor`, `kropki`, `srodek`.
- Ślad źródłowy: [F1:Z6](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L190).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Walidacja (:60). `packages/games/src/index.test.ts:110-112` sprawdza tylko ruchy z tej samej partii (01-01-CHECKS.md §4.2, W4 C). Waga: **średnia**. Kod poprawny wszędzie.

| Gra | Miejsce (test kończący partię bez próby ruchu) | Wpis |
|---|---|---|
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:211` | PM3 |
| `refleks` | `packages/games/src/refleks.test.ts:95`; kod `packages/games/src/refleks.ts:43` | RF3 |
| `simon` | `packages/games/src/simon.test.ts:45` | SQ4 |
| `stoper` | `packages/games/src/stoper.test.ts:48` | SP3 |
| `stroop` | `packages/games/src/stroop.test.ts:57`, `:66` | ST4 |
| `liczenie` | `packages/games/src/liczenie.test.ts:94` | LC5 |
| `schulte` | `packages/games/src/schulte.test.ts:113` (tylko `progress` po własnym wyniku) | SC3 |
| `kolo` | `packages/games/src/kolo.test.ts:109-110` (11. próba, nie `isOver`), `:146` | KO5 |
| `kolor` | `packages/games/src/kolor.test.ts:66`, `:75`, `:85` | OD3 |
| `kropki` | `packages/games/src/kropki.test.ts:128` | KR4 |
| `srodek` | `packages/games/src/srodek.test.ts:98` (tylko drugi wynik) | SR2 |

- Propozycja: na końcu testu kończącego partię `validateMove` każdego typu ruchu dla A, B i obcego = `false` (wzór `packages/games/src/kat.test.ts:68`, `packages/games/src/sudoku.test.ts:133-139`).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-007"></a>

### F4-007. Wartości brzegowe tylko z jednej strony

- Zakres: `kampus-tour`, `panstwa-miasta`, `simon`, `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `kolo`, `kolor`, `kropki`.
- Ślad źródłowy: [F1:Z7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L209).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Walidacja (:61 „pierwsza i ostatnia dozwolona przechodzą, sąsiednie nie”), D-03. Waga: **średnia**. Walidacja poprawna wszędzie (`cases*.ts`, `fuzz*.ts`).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `packages/games/src/kampus-tour.test.ts:249`, `:949`, `:484`, `:998`, `:1016` | kupno / wykup / budowa przy gotówce równej cenie; postać −1; pola 0 i 31 w `travel`, `sell`, `juwenalia` | K18 |
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:92`, `:151` | 30 znaków przechodzi; kategoria 5 przechodzi, −1 nie | PM4 |
| `simon` | `packages/games/src/simon.test.ts:33-37` | 0 przechodzi | SQ5 |
| `stroop` | `packages/games/src/stroop.test.ts:46-48` | 150 i 5000 przechodzą; suma 30 000 / 30 001; 200 / 201 czasów | ST3 |
| `liczenie` | `packages/games/src/liczenie.test.ts:62-66` | jak `stroop` oraz 5001 | LC6 |
| `inny` | `packages/games/src/inny.test.ts:148`, `:164` | suma 30 000 / 30 001; 200 czasów przechodzi | IN1 |
| `obrot` | `packages/games/src/obrot.test.ts:141`, `:156` | jak `inny` | OB1 |
| `literowka` | `packages/games/src/literowka.test.ts:128`, `:144` | jak `inny` | LT1 |
| `dziesiatki` | `packages/games/src/dziesiatki.test.ts:126`, `:142` | jak `inny` | DZ1 |
| `kolo` | `packages/games/src/kolo.test.ts:112-115` | 19 / 20 / 1000 punktów; współrzędne 0, 1 i 1,0001 | KO4 |
| `kolor` | `packages/games/src/kolor.test.ts:55-57` | H 0 i 359, S i B 0 i 100 przechodzą; H −1 | OD4 |
| `kropki` | `packages/games/src/kropki.test.ts:57-58` | 0 i 99 przechodzą | KR3 |

- Propozycja: pary „przechodzi / nie przechodzi” na każdej granicy (wzór `packages/games/src/kat.test.ts:62`, `packages/games/src/srodek.test.ts:88-95`); sześć gier z `packages/games/src/quiz.ts` może dostać wspólny `test.each` brzegów sumy i liczby czasów.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-008"></a>

### F4-008. Schemat ruchu nie jest testowany na śmieciach

- Zakres: `kampus-tour`, `piec-w-rzedzie`, `statki`, `chinczyk`, `panstwa-miasta`, `refleks`, `simon`, `stoper`, `stroop`, `liczenie`, `schulte`, `kolo`, `kolor`.
- Ślad źródłowy: [F1:Z8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L229).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Schemat (:62: zły typ, brak pola, liczba niecałkowita, nieznany `type`). `packages/games/src/index.test.ts:72`, `:81` sprawdzają tylko, że poprawny ruch przechodzi. Waga: **średnia**.
  Schematy poprawne (serwer zawsze woła `moveSchema.safeParse` przed `validateMove`, `apps/server/src/LobbyRoom.ts:177`, `:363`), z wyjątkiem Q1 (Z14).

| Gra | Miejsce | Brakuje | Wpis |
|---|---|---|---|
| `kampus-tour` | `packages/games/src/kampus-tour.test.ts` nie woła `moveSchema` | całość | K17 |
| `piec-w-rzedzie` | `packages/games/src/piec-w-rzedzie.test.ts:255-260` | `x: 1.5` w schemacie | G3 |
| `statki` | `packages/games/src/statki.test.ts:541-549` | niecałkowita, brak pola, statek z `length: 1.5` / bez `vertical` | S3 |
| `chinczyk` | `packages/games/src/chinczyk.test.ts:542-549` | `pawn: 1.5`, brak `pawn`, `pawn: -1` | C3 |
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:89-93` | zły typ, brak `done`, `category: 1.5`, nieznany `type` | PM5 |
| `refleks` | `packages/games/src/refleks.test.ts:50-56` | brak listy, inny `type` | RF4 |
| `simon` | `packages/games/src/simon.test.ts` nie woła `moveSchema` | całość (`score: 1.5` odrzuca tylko schemat) | SQ6 |
| `stoper` | `packages/games/src/stoper.test.ts` nie woła `moveSchema` | całość | SP4 |
| `stroop` | `packages/games/src/stroop.test.ts` nie woła `moveSchema` | całość | ST5 |
| `liczenie` | `packages/games/src/liczenie.test.ts` nie woła `moveSchema` | całość | LC7 |
| `schulte` | `packages/games/src/schulte.test.ts` nie woła `moveSchema` | całość | SC4 |
| `kolo` | `packages/games/src/kolo.test.ts` nie woła `moveSchema` | całość | KO6 |
| `kolor` | `packages/games/src/kolor.test.ts` nie woła `moveSchema` | całość | OD5 |

- Propozycja: blok „schemat odrzuca śmieci” (wzór `packages/games/src/inny.test.ts:159-167`, `packages/games/src/srodek.test.ts:101-110`); w starszych plikach `accepts` przez `safeParse` jak `packages/games/src/refleks.test.ts:21`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-009"></a>

### F4-009. Wygrana tylko jednego gracza

- Zakres: `panstwa-miasta`, `refleks`, `simon`, `stoper`, `stroop`, `liczenie`, `schulte`, `kolo`, `kolor`, `kropki`, `rok`, `srodek`, `tort`, `nozyczki`.
- Ślad źródłowy: [F1:Z9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L251).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Koniec gry (:64 „wygrana każdego gracza (nie tylko pierwszego)”), D-03. `packages/games/src/index.test.ts:96` sprawdza tylko, że zwycięzca należy do graczy. Waga: **średnia**.

| Gra | Miejsce | Wygrywa w testach | Wpis |
|---|---|---|---|
| `panstwa-miasta` | `packages/games/src/panstwa-miasta.test.ts:234` | A | PM6 |
| `refleks` | `packages/games/src/refleks.test.ts:82-89` | B | RF5 |
| `simon` | `packages/games/src/simon.test.ts:45-53` | B | SQ7 |
| `stoper` | `packages/games/src/stoper.test.ts:48-55` | B | SP5 |
| `stroop` | `packages/games/src/stroop.test.ts:57-64` | B | ST6 |
| `liczenie` | `packages/games/src/liczenie.test.ts:71-77` | B | LC8 |
| `schulte` | `packages/games/src/schulte.test.ts:49-57`, `:73-78` | B | SC5 |
| `kolo` | `packages/games/src/kolo.test.ts:146-155` | B | KO7 |
| `kolor` | `packages/games/src/kolor.test.ts:72`, `:82` | A, B (C nigdy) | OD6 |
| `kropki` | `packages/games/src/kropki.test.ts:73`, `:84` | A, B | KR5 |
| `rok` | `packages/games/src/rok.test.ts:98`, `:111` | A, B | RK1 |
| `srodek` | `packages/games/src/srodek.test.ts:167`, `:180` | A, B | SR3 |
| `tort` | `packages/games/src/tort.test.ts:147`, `:160`, `:184` | A, B | TR1 |
| `nozyczki` | `packages/games/src/nozyczki.test.ts:192`, `:205`, `:229` | A, B | NZ1 |

- Propozycja: `test.each([A, B, C])` (wzór `packages/games/src/kat.test.ts:96`, `packages/games/src/stoj.test.ts:183`); w Państwach-miastach wariant, w którym komplet pisze B.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-010"></a>

### F4-010. Brak testu mutacji i JSON round-trip

- Zakres: `kampus-tour`, `panstwa-miasta`, `simon`, `stoper`, `stroop`, `liczenie`, `schulte`, `kolo`, `kolor`, `kropki`.
- Ślad źródłowy: [F1:Z10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L273).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Stan (:66). `packages/games/src/index.test.ts` tego nie sprawdza (01-01-CHECKS.md §4.2, St1 N, St2 N; `views` tylko woła `JSON.stringify`). Waga: **średnia**.
  Zachowanie poprawne we wszystkich grach (01-01-CHECKS.md: stan zamrożony rekursywnie, round-trip `isDeepStrictEqual`; `fuzz*.ts` dla pozostałych typów ruchów).

| Gra | Miejsce | Wpis |
|---|---|---|
| `kampus-tour` | brak w `packages/games/src/kampus-tour.test.ts` | K19 |
| `panstwa-miasta` | brak w `packages/games/src/panstwa-miasta.test.ts` | PM9 |
| `simon` | brak w `packages/games/src/simon.test.ts` | SQ8 |
| `stoper` | brak w `packages/games/src/stoper.test.ts` | SP6 |
| `stroop` | brak w `packages/games/src/stroop.test.ts` | ST7 |
| `liczenie` | brak w `packages/games/src/liczenie.test.ts` | LC9 |
| `schulte` | brak w `packages/games/src/schulte.test.ts` | SC6 |
| `kolo` | brak w `packages/games/src/kolo.test.ts` | KO8 |
| `kolor` | brak w `packages/games/src/kolor.test.ts` | OD7 |
| `kropki` | `packages/games/src/kropki.test.ts:108` (tylko po `progress`) | KR6 |

- Propozycja: test jak `packages/games/src/kat.test.ts:130` / `packages/games/src/kalambury.test.ts:618` (`Object.freeze` + `JSON.parse(JSON.stringify(s))`) dla każdego typu ruchu.
  Alternatywa (D-04): zamrażanie i round-trip w `describe.each(CASES)` (`packages/games/src/index.test.ts:56-117`) zamyka punkt dla wszystkich 38 gier jednym testem.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-011"></a>

### F4-011. Stałość klucza `turn()` bez testu

- Zakres: `panstwa-miasta`, `kalambury`.
- Ślad źródłowy: [F1:Z11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L293).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Fazy równoczesne (:72 „`turn().key` zmienia się tylko przy zmianie fazy”). Waga: **średnia**. Zachowanie poprawne (`fuzz05.ts`).
- `panstwa-miasta` (PM8): `packages/games/src/panstwa-miasta.test.ts:55` (szkic), `:147` (głos) nie porównują klucza przed i po; `ZASADY-GIER.md` §5 :644.
- `kalambury` (KL2): `packages/games/src/kalambury.test.ts:196` (kreska), `:345` (strzały), `:475` (pas); kod `packages/games/src/kalambury.ts:220`; `ZASADY-GIER.md` §9 :823.
- Propozycja: po ruchu wewnątrz fazy `expect(game.turn!(s).key)` bez zmiany (np. `draw:0:0` po kresce, pudle i pasie).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-012"></a>

### F4-012. Widok obserwatora `""` nie w każdej fazie

- Zakres: `kampus-tour`, `statki`.
- Ślad źródłowy: [F1:Z12](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L299).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Źródło: `ZASADY.md` §2 Ukryty stan (:70-71 „w każdej fazie”, „widok obserwatora nie zawiera danych żadnej strony”). Waga: **niska** (`playerView` w obu grach traktuje `""` jak obcego; `fuzz04.ts`: 0 wycieków).
- `kampus-tour` (K10): `packages/games/src/kampus-tour.test.ts:567` sprawdza tylko widok gracza A; kod `packages/games/src/kampus-tour.ts:660`.
- `statki` (S4): `packages/games/src/statki.test.ts:324` tylko w bitwie; rozstawianie i koniec bez `""`; kod `packages/games/src/statki.ts:224`.
- Propozycja: `playerView(s, "")` bez `deck` (Kampus Tour) i bez niezatopionych statków w rozstawianiu i po końcu (Statki, testy :306, :266).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-013"></a>

### F4-013. Rekord rozstrzyga remis zaokrągloną średnią, miejsca nie

- Zakres: `stoj`, `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`.
- Ślad źródłowy: [F1:Z13](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L305).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :91 (`rankResults` i `places` z jednego komparatora; rekord to ta sama kolejność, `KONCEPT.md` :152-154). Waga: **niska** (różnica poniżej 1 ms przy równych punktach).
- Gry i miejsca (`record.tie = Math.round(average(times))`, komparator `byHitsThenAverage` / `byScoreThenAverage` w `packages/games/src/core.ts:239-247` bez zaokrąglenia):
  `packages/games/src/stoj.ts:80` (W6b, SJ1), `packages/games/src/stroop.ts:50`, `packages/games/src/liczenie.ts:71`, `packages/games/src/inny.ts:83`, `packages/games/src/obrot.ts:84`, `packages/games/src/literowka.ts:52`, `packages/games/src/dziesiatki.ts:67` (W7b).
- Dowód: 3 trafienia po 300, 300, 301 ms i po 300 ms: `isOver` daje zwycięzcę `b`, rekordy obu `[3, 300]` (`cases07.ts`); `fuzz06.ts`: 2/400 takich par w Stój!.
  Ekran `apps/web/src/games/Quiz.tsx:73` liczy miejsca jeszcze inaczej (z zaokrągloną średnią): obaj „1.”, puchar tylko u `b`.
- Nie dotyczy: Zakupy (`tie` = `ms` bez zaokrąglenia), Wieża, Śledzenie, Balon, W pamięci (`tie` całkowite albo bez zaokrąglenia).
- Propozycja (popraw kod): `Math.round` średniej w obu komparatorach `packages/games/src/core.ts` (jedna poprawka dla 7 gier), ekran `apps/web/src/games/Quiz.tsx` bierze miejsca z `places`; albo `tie` bez zaokrąglenia i zaokrąglanie w `FORMAT`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-014"></a>

### F4-014. `quiz.ts`: czasy niecałkowite i nieograniczona liczba pomyłek przechodzą walidację

- Zakres: `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`.
- Ślad źródłowy: [F1:Z14](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L314).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Gry: `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`. Miejsce: `packages/games/src/quiz.ts:18` (`times: z.array(z.number())` bez `.int()`), `:19`, `:29-30` (`errors` bez górnej granicy).
- Dowód: `{ times: [150.5, 4999.9], errors: 1e9 }` przechodzi (`cases07.ts`); ekran zawsze wysyła całkowite (`apps/web/src/games/Quiz.tsx:182`, `apps/web/src/games/Dziesiatki.tsx:61`).
- Źródło: `ZASADY.md` §2 Mini-gra (:74 „wynik niecałkowity odpada”); `ZASADY-GIER.md` §1 :57. Waga: **niska** (bez wpływu na ranking; Refleks ma `.int()`, `packages/games/src/refleks.ts:32`).
- Propozycja (popraw kod): `z.number().int()` i `errors ≤ DURATION_MS / 1000`; przypadki w teście schematu każdej z 6 gier.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-015"></a>

### F4-015. Ekran quizów ucina czasy do 5 s i gubi trafienia poniżej 150 ms

- Zakres: `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`.
- Ślad źródłowy: [F1:Z15](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L320).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Gry: jak Z14. Miejsce: `apps/web/src/games/Quiz.tsx:187-188`, `apps/web/src/games/Dziesiatki.tsx:62-63` (komentarz `ponytail:`).
- Źródło: `ZASADY-GIER.md` :108 opisuje tylko walidację 150-5000 ms; ucięcie do 5 s opisują Inny element (:339) i Dziesiątki (:456), utraty trafienia < 150 ms żadna sekcja (D-07).
- Waga: **niska**. Propozycja (popraw dokument): zdanie w :108, odesłanie z :339 i :456.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-016"></a>

### F4-016. Ekran końcowy z kaflem ze stanu lokalnego

- Zakres: `stoper`, `rytm`.
- Ślad źródłowy: [F1:Z16](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L325).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Źródło: `ZASADY.md` §3 („Ekran końcowy mini-gry rysuje się z samego stanu”); `ZASADY-GIER.md` :83 (Stoper: odchyłka ze znakiem), :319 (Rytm: kafel z tempem w BPM).
- `stoper`: kafel „Twój czas” z `stopped` (`useState`, `apps/web/src/games/Stoper.tsx:42`, render `:70-83`); stan `packages/games/src/stoper.ts:10` ma tylko odchyłkę bez znaku.
- `rytm`: kafel „Twoje tempo” z `run.current.taps` (`useRef`, `apps/web/src/games/Rytm.tsx:37`, render `:103-117`); stan `packages/games/src/rytm.ts:16` bez czasów stuknięć.
- Waga: **średnia** (wynik i ranking poprawne, ale kafel znika na ekranie „Rekordy” i po odświeżeniu; kafle starsze od rekordowej partii: `4649af6`, `9239058` przed `30ab8f6`).
- Propozycja (popraw kod): mapa per gracz w stanie (`stops`, `taps`, wzorem Środka i Za zasłoną) i kafel z `view`; albo odstępstwo z powodem w `ZASADY-GIER.md`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-017"></a>

### F4-017. Ręczne zbiory `MINI_GAMES`

- Zakres: `panstwa-miasta`, `kalambury`, `platforma`.
- Ślad źródłowy: [F1:Z17](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L332).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- W1 (**średnia**, `panstwa-miasta`): `apps/web/src/screens/Game.tsx:477` to ręczny `Set` 31 id: 30 mini-gier i `panstwa-miasta` (`minPlayers: 2`). Użycia `:201`, `:204`, `:254-255`, `:402`.
  Zbiór znaczy w praktyce „gra z własną tabelą wyników”; nowa mini-gra bez ręcznego dopisania dostanie „Twój ruch” i podwójny ranking. Źródło: `ZASADY.md` §6 pkt 5, `KONCEPT.md` §3.
- W2 (**średnia**, `kalambury`): ranking po partii dwa razy przy 3+ graczach: `apps/web/src/screens/Game.tsx:402` (lista, bo brak w zbiorze) i `apps/web/src/games/Kalambury.tsx:104`, `:127-135` („Suma punktów”).
- W4 (**niska**): drugi `MINI_GAMES` w `apps/web/src/screens/Lobby.tsx:246` powiela `MINI_GAME_IDS` (`packages/games/src/index.ts:165`); `ZASADY.md` §3 (wspólne zamiast własnych).
- W5 (**niska**, dokument): `ZASADY.md` §6 pkt 5 mówi o „wpisie w `MINI_GAMES`”, a są dwa zbiory.
- Propozycja (popraw kod, potem dokument): mini-gry z `MINI_GAME_IDS` (albo `minPlayers === 1`), osobny zbiór „własny ranking” (`panstwa-miasta`, `kalambury`),
  w `apps/web/src/screens/Lobby.tsx` `MINI_GAME_IDS.map((id) => GAMES[id])`; potem usunąć ręczny krok z `ZASADY.md` §6 pkt 5.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-018"></a>

### F4-018. Pełny remis rozstrzyga kolejność miejsc, dokument tego nie mówi

- Zakres: `chinczyk`, `turniej`.
- Ślad źródłowy: [F1:Z18](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L341).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Źródło: zasada odczuwalna tylko w kodzie (D-07). Waga: **niska** (zwycięzca się nie zmienia, tylko kolejność dalszych miejsc na ekranie).
- `chinczyk` (C1): `packages/games/src/chinczyk.ts:157` (tryb Szybki: dom, potem suma, przy równości kolejność `players`); `ZASADY-GIER.md` §4 :626-627. Dowód `cases04.ts`.
- `turniej` (T1): `packages/games/src/turniej.ts:84` (stabilne sortowanie), komentarz `:75`; `ZASADY-GIER.md` §8 :782; test `packages/games/src/turniej.test.ts:218` to zakłada.
- Propozycja (popraw dokument): w obu sekcjach „przy pełnym remisie decyduje kolejność miejsc”. Wspólne miejsce przy remisie w grach głównych to decyzja fazy 4 (wymaga `places` albo zmiany kontraktu).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-019"></a>

### F4-019. Wspólne funkcje i moduły `core.ts`

- Zakres: `kampus-tour`, `kubki`, `kropki`, `kat`, `rok`, `kolo`.
- Ślad źródłowy: [F1:Z19](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L347).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §3 :91, :104-105 („Mini-gry używają `ranked`”, „Wspólne funkcje z `packages/games/src/core.ts` zamiast własnych”, „dwie gry o tej samej mechanice dzielą moduł”). Waga: **niska** (bez wpływu na gracza).
- `kampus-tour` (K6): talia tasowana własną pętlą `packages/games/src/kampus-tour.ts:475-479` zamiast `shuffle` (`packages/games/src/core.ts:221`); algorytm identyczny. Propozycja: `deck: shuffle(CARDS.map((_, i) => i), rng)`.
- `kubki` (KB1): `packages/games/src/kubki.ts:30` lokalna funkcja `shuffle` (losuje zamiany) o nazwie funkcji z `packages/games/src/core.ts`. Propozycja: `swapsFor`.
- `kropki`, `kat`, `rok` (W8c): trzy kopie szkieletu rund `packages/games/src/kropki.ts:45-89`, `packages/games/src/kat.ts:38-85`, `packages/games/src/rok.ts:209-256`; powód tylko w komentarzu `packages/games/src/kat.ts:37` (`ponytail:`); dryf kopii widać w Z1.
  Propozycja: wspólny `szacowanie.ts` albo zdanie z powodem w `ZASADY-GIER.md` §1.
- `kolo` (KO1): `packages/games/src/kolo.ts:144-146` bez `ranked` (koniec zależy od `waitingFor`, nie od pierwszego wyniku); jeden komparator, 0 niezgodności. Propozycja: zdanie w `ZASADY-GIER.md` :133 albo opcjonalny warunek końca w `ranked`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-020"></a>

### F4-020. `KONCEPT.md` §2.4 pomija drugie kryterium W pamięci

- Zakres: `w-pamieci`.
- Ślad źródłowy: [F1:Z20](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L355).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Gra: `w-pamieci`. Miejsce: `KONCEPT.md` :152-154 (lista `tie`); kod `packages/games/src/w-pamieci.ts:84` (`tie`, mniej lepiej); opisane w `KONCEPT.md` :137 i `ZASADY-GIER.md` :438.
  Ten sam wpis padł w 01-02 (W7) i 01-09 (WP2); tu jeden.
- Źródło: D-06. Waga: **niska**. Propozycja (popraw dokument): dopisać „odchyłka w rundzie z pomyłką w W pamięci”.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-021"></a>

### F4-021. Test `soloState` nie widzi map wypełnianych tylko w prawdziwej partii

- Zakres: `schulte`, `kropki`, `kat`, `rok`, `wieza`, `balon`, `sudoku`, `kolo`.
- Ślad źródłowy: [F1:Z21](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L360).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Gry: `schulte`, `kropki`, `kat`, `rok`, `wieza`, `balon`, `sudoku` (`progress`), `kolo` (`attempts`/`best` po częściowej grze). Miejsce: `packages/games/src/index.test.ts:190-210` (same `timeoutMove`).
- Źródło: `ZASADY.md` §3 (dane gracza w mapach z id w kluczach), D-04. Waga: **niska** (kod przycina poprawnie, `packages/games/src/core.ts:148-151`).
- Propozycja: w teście jeden ruch `progress` (albo próba Koła) przed timeoutami.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-022"></a>

### F4-022. Bankrut z kartą „Zaliczenie” zabiera ją z gry

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L403).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:319-337`, `:398`
- Źródło reguły: `ZASADY-GIER.md` §6 :719 (przypadek nieopisany)
- Propozycja: w `goBankrupt` odłożyć Zaliczenia na spód talii, zdanie w §6, test

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-023"></a>

### F4-023. Juwenalia zostają na polu po wykupieniu

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L404), [F3:B-KT4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L353).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:575-588`, `:297-298`
- Źródło reguły: `ZASADY-GIER.md` §6 :703, :711 (D-07)
- Propozycja: dopisać w §6 Wykupienie; zmiana zachowania tylko po decyzji balansu (faza 3)

Uzgodnienie faz: F3:B-KT4 potwierdza tę samą lukę dokumentu: 1-17 przypadków na 1000 partii botów. Waga niska bez zmiany; „zostawić i dopisać” jest rekomendacją, decyzja nadal oczekuje.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-024"></a>

### F4-024. `KONCEPT.md` wymienia kartę „poprawka”, której nie ma

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L405).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `KONCEPT.md:54`; talia `packages/games/src/kampus-tour.ts:79-110`
- Źródło reguły: D-06
- Propozycja: „stypendium, warunek, Zaliczenie w pierwszym terminie itp.”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-025"></a>

### F4-025. `KONCEPT.md` §9 opisuje talię Kampus Tour pod Poprawką

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L406).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `KONCEPT.md:348`
- Źródło reguły: D-06
- Propozycja: rozdzielić na dwa punkty

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-026"></a>

### F4-026. Tabela gier: „po kolei”, a `pick` jest równoczesna

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K5](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L407).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `ZASADY-GIER.md:9`; `packages/games/src/kampus-tour.ts:698-699`
- Źródło reguły: `ZASADY.md` §2 (typy gier)
- Propozycja: „planszowa, po kolei (wybór postaci naraz)”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-027"></a>

### F4-027. Brak testu: Zaliczenie na Kolokwium plus dublet daje kolejny rzut

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L408).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.test.ts:730`; kod `packages/games/src/kampus-tour.ts:641-646`
- Źródło reguły: `ZASADY-GIER.md` §6 :708, `ZASADY.md` §2
- Propozycja: test z rzutem 2+2

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-028"></a>

### F4-028. Brak testu: jazda MPK z dubletem nie daje rzutu

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L409).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.test.ts:883`, `:895`; kod `:569`
- Źródło reguły: `ZASADY-GIER.md` §6 :714
- Propozycja: test `travel` z kośćmi 3+3

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-029"></a>

### F4-029. Licznik Juwenaliów „wspólny” bez testu z dwoma graczami

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L410).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.test.ts:835`
- Źródło reguły: `ZASADY-GIER.md` §6 :711, `ZASADY.md` §2 „Jak pisać”
- Propozycja: A, potem B na Juwenaliach, B dostaje × 3

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-030"></a>

### F4-030. Budynki powyżej poziomu 2 zostają po utracie kompletu

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L411), [F3:B-KT5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L354).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:263-266`, `:538`, `:611-626`, `:575-588`
- Źródło reguły: `ZASADY-GIER.md` §6 :691 (przypadek nieopisany, D-07)
- Propozycja: dopisać w §6 Budowa; zrzut poziomów to decyzja balansu (faza 3)

Uzgodnienie faz: F3:B-KT5 mierzy 0,01-0,14 pola na partię i ocenia skutek jako niski. Zachowujemy średnią F1 dla nieopisanej zasady budowy; niski wpływ balansu z F3 nie usuwa luki dokumentu. Użytkownik nie zatwierdził pozostawienia zachowania.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-031"></a>

### F4-031. Statystyka czynszu liczy pełną kwotę przy bankructwie płacącego

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K12](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L412).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:459-465`, `:230-242`, `:319-325`
- Źródło reguły: `ZASADY-GIER.md` §6 :741, `KONCEPT.md` §2.1 :60
- Propozycja: zapisać w `stats` kwotę faktycznie oddaną

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-032"></a>

### F4-032. Brak testu: po przymusowej sprzedaży nie ma oferty wykupu

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K13](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L413).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.test.ts:315`, `:383`; kod `:461-462`
- Źródło reguły: `ZASADY-GIER.md` §6 :696
- Propozycja: test z gotówką ≥ 2 × wartość po sprzedaży

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-033"></a>

### F4-033. Brak testów bankructwa przy kilku wierzycielach i utraty Juwenaliów przy bankructwie

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K14](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L414).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.ts:322`, `:326`; testy :333, :372, :858
- Źródło reguły: `ZASADY-GIER.md` §6 :701, :703
- Propozycja: dwa testy (Składka przy 4 graczach, bankrut z Juwenaliami)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-034"></a>

### F4-034. Zaokrąglenie w dół przy sprzedaży nieprzetestowane

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K15](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L415).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.ts:271`; testy :315, :527, :611
- Źródło reguły: `ZASADY-GIER.md` §6 :699
- Propozycja: test na polu o nieparzystej wartości

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-035"></a>

### F4-035. Nagłówek i nazwy testów nie nadążyły za zasadami

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F1:K20](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L416).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kampus-tour.test.ts:9`, `:13`, `:19`, `:26`, `:315`, `:758`
- Źródło reguły: `ZASADY.md` §2, D-02
- Propozycja: zsynchronizować komentarze i nazwy z §6

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-036"></a>

### F4-036. Remis zwraca `{}` zamiast samego `ranking`

- Zakres: `piec-w-rzedzie`.
- Ślad źródłowy: [F1:G1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L426).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/piec-w-rzedzie.ts:105`; `ZASADY-GIER.md` §2 :572; test :176
- Źródło reguły: `ZASADY.md` §3 :91 (bez powodu w dokumencie, więc nie D-11)
- Propozycja: `{ ranking: [...state.players] }`, poprawić :572 i test; `{}` znaczy też partię przerwaną (`apps/server/src/LobbyRoom.ts` `finish({})`)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-037"></a>

### F4-037. Brak testu: w Szybkim szóstka z wejściem do domku daje jeden dodatkowy rzut

- Zakres: `chinczyk`.
- Ślad źródłowy: [F1:C4](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L442).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/chinczyk.test.ts:476`, `:488`; kod `packages/games/src/chinczyk.ts:166`
- Źródło reguły: `ZASADY-GIER.md` §4 :625
- Propozycja: test: po szóstce z wejściem jeden rzut, potem tura dalej

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-038"></a>

### F4-038. Liczba 18 symboli bez testu

- Zakres: `memory`.
- Ślad źródłowy: [F1:M1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L452).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/memory.test.ts:95`; `packages/games/src/memory.ts:5`; ekran `apps/web/src/games/Memory.tsx:17-35` (18 emoji)
- Źródło reguły: `ZASADY-GIER.md` §7 :745
- Propozycja: `expect(SYMBOLS).toBe(18)`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-039"></a>

### F4-039. `hint` może wysłać sam rysujący w dowolnej chwili 1. połowy

- Zakres: `kalambury`.
- Ślad źródłowy: [F1:KL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L462).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Lokalizacja: `packages/games/src/kalambury.ts:146`
- Źródło reguły: `ZASADY-GIER.md` §9 :800
- Propozycja: dopisać w dokumencie; przycisk „Odsłoń literę” to decyzja fazy 4

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-040"></a>

### F4-040. `nonce` bez testu

- Zakres: `kalambury`.
- Ślad źródłowy: [F1:KL3](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L463).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: brak w `packages/games/src/kalambury.test.ts`; kod `packages/games/src/kalambury.ts:124`
- Źródło reguły: `ZASADY-GIER.md` §9 :796
- Propozycja: inny seed, inny `nonce` w teście :120

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-041"></a>

### F4-041. `pass` dozwolony i `timeoutMove` = `pass` bez testu

- Zakres: `labirynt`.
- Ślad źródłowy: [F1:L1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L473).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/labirynt.test.ts:163`, `:263`, `:267`; kod `packages/games/src/labirynt.ts:161`, `:190`
- Źródło reguły: `ZASADY-GIER.md` §10 :842, :844
- Propozycja: test zamkniętego pionka przy 3 osobach (losowe partie nie trafiają tego stanu)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-042"></a>

### F4-042. Skos przy pionku za pionkiem i przez ściankę bez testu

- Zakres: `labirynt`.
- Ślad źródłowy: [F1:L2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L474).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/labirynt.test.ts:148`, `:154`; kod `packages/games/src/labirynt.ts:101-108`
- Źródło reguły: `ZASADY-GIER.md` §10 :837-838
- Propozycja: dwa testy przy 3 osobach

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-043"></a>

### F4-043. Wspólny schemat nie wymienia Refleksu wśród gier z wynikiem na serwerze

- Zakres: `refleks`.
- Ślad źródłowy: [F1:RF1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L488).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `ZASADY-GIER.md` §1 :57-58 ↔ :72, `packages/games/src/refleks.ts:48`
- Źródło reguły: rozbieżność wewnątrz `ZASADY-GIER.md`
- Propozycja: dopisać Refleks w :57

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-044"></a>

### F4-044. `FORMAT` pokazuje wynik jako punkty, a wynik to długość serii

- Zakres: `simon`.
- Ślad źródłowy: [F1:W6](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L496).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Records.tsx:29`
- Źródło reguły: `ZASADY-GIER.md` :78, `KONCEPT.md` §2.4
- Propozycja: jednostka serii albo sama liczba, jak `rundy` w Kubkach

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-045"></a>

### F4-045. „Międzyczasy nie wpływają na ranking” bez testu

- Zakres: `schulte`.
- Ślad źródłowy: [F1:SC7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L508).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/schulte.test.ts:121-140`; komparator `packages/games/src/schulte.ts:71`
- Źródło reguły: `ZASADY-GIER.md` :91
- Propozycja: dwa wyniki o tym samym `ms` i różnych `splits` dają remis

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-046"></a>

### F4-046. Zakresy liczb i udział rodzajów bez testu

- Zakres: `liczenie`.
- Ślad źródłowy: [F1:LC2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L520).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/liczenie.test.ts:29-39`; kod `packages/games/src/liczenie.ts:34-45`
- Źródło reguły: `ZASADY-GIER.md` :112-113, `ZASADY.md` §2 :63
- Propozycja: test zakresów parsujący `text`; po poprawce Z3 test kompletów jak `packages/games/src/stroop.test.ts:30`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-047"></a>

### F4-047. „Przerwa do 3% za darmo” i „mniej niż 20 punktów” w `judge` bez testu

- Zakres: `kolo`.
- Ślad źródłowy: [F1:KO9](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L528).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/kolo.ts:15`, `:87`, `:96`; `packages/games/src/kolo.test.ts:90`, `:112`
- Źródło reguły: `ZASADY-GIER.md` :125, :128
- Propozycja: „przerwa 2% nie kosztuje”; `judge` 19 punktów = `unfinished`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-048"></a>

### F4-048. Klucz rewanżu to sama plansza, bez `nonce`

- Zakres: `sudoku`.
- Ślad źródłowy: [F1:W8](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L548).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `apps/web/src/games/MiniGame.tsx:297` (`key={puzzle.join()}`)
- Źródło reguły: `ZASADY.md` §3 (pole odróżniające partie)
- Propozycja: `nonce` w stanie, albo komentarz; `keys2.ts`: 6 powtórzeń na 2000 seedów

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-049"></a>

### F4-049. Widoczność bodźca 0,6 odstępu bez testu

- Zakres: `stoj`.
- Ślad źródłowy: [F1:SJ2](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L568).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/stoj.ts:9` (`VISIBLE`, używa tylko `apps/web/src/games/Stoj.tsx:55`)
- Źródło reguły: `ZASADY-GIER.md` :216
- Propozycja: `expect(VISIBLE).toBe(0.6)`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-050"></a>

### F4-050. Ta sama prędkość kulek i odstęp 0,14 sprawdzone słabiej niż w dokumencie

- Zakres: `sledzenie`.
- Ślad źródłowy: [F1:SL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L576).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `packages/games/src/sledzenie.test.ts:45-48`, `:113`, `:128`; kod `packages/games/src/sledzenie.ts:25`, `:54`
- Źródło reguły: `ZASADY-GIER.md` :236, :242, D-03
- Propozycja: prędkość każdej kulki osobno; próg `≥ 0.14`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-051"></a>

### F4-051. Stałe eksportowane bez przedrostka gry

- Zakres: `sledzenie`.
- Ślad źródłowy: [F1:W10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L577).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `packages/games/src/index.ts:104` (`BALLS`, `ROUNDS`, `SHOW_MS`…)
- Źródło reguły: `ZASADY.md` §6 pkt 3
- Propozycja: `SLEDZENIE_*`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-052"></a>

### F4-052. Uzasadnienie ukrycia punktów rywali nie pasuje do widoku

- Zakres: `balon`.
- Ślad źródłowy: [F1:BL1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L610).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `ZASADY-GIER.md` :423 ↔ `packages/games/src/balon.ts:36-37`, `:71`
- Źródło reguły: `ZASADY-GIER.md` §1 :53-54
- Propozycja: „zdradzałyby na ekranie…”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-053"></a>

### F4-053. „Każda runda to nowy ciąg” bez testu

- Zakres: `w-pamieci`.
- Ślad źródłowy: [F1:WP1](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L618).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/w-pamieci.test.ts:63`; kod `packages/games/src/w-pamieci.ts:62`
- Źródło reguły: `ZASADY-GIER.md` :431
- Propozycja: test: runda nie zaczyna się ciągiem poprzedniej

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-054"></a>

### F4-054. Ukrywanie głosów bez testu

- Zakres: `panstwa-miasta`.
- Ślad źródłowy: [F1:PM7](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L645).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla uzupełnienia testu istniejącej reguły.

- Lokalizacja: `packages/games/src/panstwa-miasta.test.ts:140`; kod `packages/games/src/panstwa-miasta.ts:137-138`
- Źródło reguły: `ZASADY-GIER.md` §5 :643, `ZASADY.md` §2 :70-71
- Propozycja: widok B i `""` bez głosu A w głosowaniu, wszystkie głosy w podsumowaniu

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-055"></a>

### F4-055. Komentarz przy `LETTERS` pomija Ć

- Zakres: `panstwa-miasta`.
- Ślad źródłowy: [F1:PM10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L646).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dowody testowe/fuzz dziedziczone z F1, brak ponownej symulacji.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `packages/games/src/panstwa-miasta.ts:5`
- Źródło reguły: `KONCEPT.md` §2.5 :164
- Propozycja: dopisać Ć

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-056"></a>

### F4-056. Ekran partii nie mieści się na 360×640

- Zakres: `piec-w-rzedzie`, `statki`, `chinczyk`, `labirynt`, `memory`, `panstwa-miasta`, `kalambury`, `kolo`, `kropki`, `kat`, `w-pamieci`.
- Ślad źródłowy: [F2:U1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L51).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; układ może zasłonić pole gry lub akcję podczas partii; statyczny szacunek, część wystąpień wymaga urządzenia.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 Reguły („Ekran mieści się na 360×640”), `AGENTS.md` (UI: 360×640); D-07 („ekran gry nie mieści się”).
- Waga: **wysoka** dla ekranu, na którym gracz działa w trakcie partii (wykładnia z 02-06 przyjęta dla całej fazy; ekrany podsumowania z akcją w `StickyBar` to U3, listy poza partią HM-8).
  Gomoku i Statki są znane z `DESIGN.md` §6 („Rozbieżności do decyzji”), zmierzone na nowo (D-05); `DESIGN.md` §6 twierdzi, że „pozostałe ekrany mieszczą się w 640 px”, co kłóci się z resztą tabeli.

| Gra | Miejsce | Wysokość (statycznie) | Wpis częściowy |
|---|---|---|---|
| `piec-w-rzedzie` | `apps/web/src/games/PiecWRzedzie.tsx:42-105`, `:108-118`; nagłówek `apps/web/src/screens/Game.tsx:233-338` | 686 px w turze, 698 po partii („Rewanż” pod krawędzią); `StickyBar` przykrywa ok. 46 px planszy | G1 (02-05) |
| `statki` | `apps/web/src/games/Statki.tsx:288-337` (rozstawianie), `:127-139`, `:381-419` (bitwa); pigułki `w-full` `apps/web/src/screens/Game.tsx:266` | rozstawianie ok. 800 px („Obróć”, „Losuj” pod krawędzią), bitwa ok. 960 px, obrona ok. 875 px | S1 |
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:206`, `:259-298` (komentarz `:255` sam to przewiduje) | 684 px (4 graczy do 772); `StickyBar` przykrywa dolne domki | C1 |
| `labirynt` | `apps/web/src/games/Labirynt.tsx:124`, `:186-236` | 742 px w swojej turze (4 graczy 830); `StickyBar` przykrywa własny pionek na starcie | L1 |
| `memory` | `apps/web/src/games/Memory.tsx:55-60`, `:75` (komentarz `:55` mówi, że się mieści) | tryb Średni 651 px (pigułki w dwóch wierszach 695); Mała i Duża mieszczą się | M1 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:165-216` (pisanie), `:243-248` (głosowanie) | pisanie ok. 820 px bez klawiatury, głosowanie ok. 770 px (podsumowanie: U3) | PM1 |
| `kalambury` | `apps/web/src/games/Kalambury.tsx:36` (`BELOW_CANVAS_PX` bez nagłówka), `:342`, `:350`, `:358-382` | zgadujący 677-725 px; „Pasuję” pod krawędzią; do potwierdzenia w przeglądarce | KL1 |
| `kolo` | `apps/web/src/games/Kolo.tsx:187-195` (płótno bez `max-w-[calc(100dvh-…)]`), `:217`, `:221` | 707 px solo / 683 w pokoju po pierwszej próbie; do potwierdzenia | KO1 |
| `kropki`, `kat` | `apps/web/src/games/Szacowanie.tsx:140` (`max-w-[calc(100dvh-23.5rem)]`), `:144-155` (formularz w kaflu, `autoFocus`), `apps/web/index.html:5` (`interactive-widget=resizes-content`) | bez klawiatury 603-627 px; na Androidzie klawiatura zmniejsza `100dvh`, kafel z polem i „Zatwierdź” spada do ok. 42 px; do potwierdzenia na Androidzie | SZ1 |
| `w-pamieci` | `apps/web/src/games/WPamieci.tsx:126` (ten sam `max-w-[calc(100dvh-23.5rem)]`), `:135-151` (formularz `absolute inset-0` w kaflu, `autoFocus` `:144`) | jak SZ1 (dopisane w 02-11: 02-10 policzyło wysokość bez klawiatury, 562 px) | WP5 (nowy) |

- Propozycja (faza 4/5): (1) zmniejszyć wspólny nagłówek gier głównych w trakcie partii (pigułki w jednym zwijanym wierszu jak `GameDots`, pasek limitu w wierszu tytułu), co zabiera 44-130 px
  we wszystkich grach głównych naraz; (2) per gra: przełącznik i akcja Labiryntu w jednym wierszu, kostka Chińczyka w wierszu z „Rzuć”, „Obróć” / „Losuj” Statków w `StickyBar`,
  w Memory Średniej `aspect-[4/3]`, w Kalamburach płótno z wysokości pozostałej pod nagłówkiem, w Kole `max-w-[calc(100dvh-…rem)] mx-auto` jak w pozostałych grach paczki,
  w Szacowaniu i W pamięci dolna granica kafla (`max-w-[max(16rem,calc(100dvh-23.5rem))]`) albo formularz pod kaflem; Państwa-miasta: ciaśniejszy formularz albo wyjątek „formularz
  z klawiaturą przewija się, akcja w `StickyBar`” w `DESIGN.md` §6; (3) po poprawkach poprawić `DESIGN.md` §6 i zmierzyć w Playwright 360×640 (D-09).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-057"></a>

### F4-057. Akcja w partii dostępna dopiero po animacji

- Zakres: `chinczyk`, `kampus-tour`.
- Ślad źródłowy: [F2:U2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L75).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; decyzja w partii czeka na zakończenie animacji wbrew regule platformy.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Animacja nie blokuje gry. Przyciski działają w trakcie, kolejny stan z serwera przerywa poprzednią animację” (jedyny wyjątek: Statki, `SWAP_MS`); D-07 („animacja blokująca ruch”).
- Waga: **wysoka** w obu grach; obie mają powód (nie zdradzać wyniku rzutu przed dojściem pionka), którego §5 nie przewiduje. §5 wskazuje `apps/web/src/games/Chinczyk.tsx` jako wzór kroków, więc wzór sam łamie regułę.

| Gra | Miejsce | Ile trwa blokada | Wpis |
|---|---|---|---|
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:122-123` (`settled`, `myMove`), `:192`, `:201` | `ROLL_MS` 700 ms + do 6 × `STEP_MS` 180 ms (Szybki: 400 + 660 ms, przy limicie 20 s); nowy stan dopisuje się do celu zamiast przerywać (`:76-93`) | C8 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:350-352` (`settled`, komentarz `:351`), `:394-395`, `:457`, `:870-944`, `:1028`, `:1054` | do 700 + 12 × 220 = 3340 ms na rzut, po dublecie znowu | KA1 |

- Propozycja (decyzja fazy 4): albo dopisać do §5 wyjątek „kroki sekwencyjne: decyzja czeka na dojście pionka, najwyżej `ROLL_MS` + n × `STEP_MS`” obok wyjątku Statków (wtedy oba wpisy przechodzą
  do §6), albo pozwolić na akcję od razu: dotknięcie w trakcie kończy animację (`setShown(target)`). Do fazy 3: marsz Kampus Tour wydłuża partię 20 rund o kilka minut (szacunek 45 min w `KONCEPT.md` §2.1).

Uzgodnienie faz: F3:B-KT6 oraz F3 §5/§10 potwierdzają zapas limitu: Kampus Tour 65%, Chińczyk Szybki 120% w modelu. Nie rozwiązuje to blokady akcji z §5 ZASADY.md. Ten wpis pozostaje problemem UX, a F3:B-KT6 osobno dotyczy długości całej partii.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-058"></a>

### F4-058. Kampus Tour: treść środka planszy wyższa niż nakładka (do potwierdzenia w przeglądarce)

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KT10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L87).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; overflow może obciąć treść i przyciski planszy; szacunek wymaga potwierdzenia.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Gra: `kampus-tour`. Miejsce: `apps/web/src/games/KampusTour.tsx:848-849` (nakładka `CENTER_HEIGHT`, `overflow-hidden`, `justify-center`), treść `:850-973`, stałe `:201-202`.
- Źródło: `ZASADY.md` §4 („Ekran mieści się na 360×640”), `AGENTS.md`; D-07. Waga: **wysoka**.
- Opis: nakładka ma 170 px sceny; faza `buy` ok. 224 px, `roll` z Biletem MPK ok. 204 px, po partii ok. 250 px. `justify-center` ucina z obu stron: pierwszy znika wiersz „Runda N/20”
  z paskiem limitu, potem najstarsze wpisy logu, po partii „Rewanż” / „Podsumowanie”. Na 390×844 problem zostaje.
- Propozycja: log do 1-2 wpisów albo z `line-clamp`, `buyInfo` w jednej linii, wiersz rundy z licznikiem poza obszarem z `overflow-hidden`; najpierw zrzut w przeglądarce.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-059"></a>

### F4-059. Zakupy: „Gotowe” na `onClick` kończy pomiar drugiego kryterium

- Zakres: `zakupy`.
- Ślad źródłowy: [F2:ZK1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L94).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; długość trzymania przycisku dolicza się do drugiego kryterium wyniku.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Gra: `zakupy`. Miejsce: `apps/web/src/games/Zakupy.tsx:175` (`onClick={done}`), pomiar `:71`. Styk z fazą 1: F1:ZK1 (limit 60 s bez zapasu, `apps/web/src/games/Zakupy.tsx:68-72`) dotyczy tej samej funkcji `done`.
- Źródło: `ZASADY.md` §4 („pola gry na czas … reagują na `onPointerDown`”), D-07. Waga: **wysoka** (czas zaznaczania to `record.tie`; czas trzymania palca, 50-150 ms, dolicza się nierówno; w praktyce rozstrzyga tylko remisy punktowe).
- Propozycja: `onPointerDown={done}` i `onClick` tylko dla klawiatury (`e.detail === 0`), jak na półce (`apps/web/src/games/Zakupy.tsx:166-168`); poprawić razem z F1:ZK1.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-060"></a>

### F4-060. Token accent-hover nieopisany w DESIGN.md

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L114).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/index.css:27`
- Skutek: token `accent-hover` bez wiersza w `DESIGN.md` §2
- Źródło reguły: `DESIGN.md` §2
- Propozycja: dopisać „`accent-hover` `#ff4560`, akcent pod kursorem (tylko `.btn-primary`)”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-061"></a>

### F4-061. Listy tokenów i promieni w dokumentach są sprzeczne

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-18](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L115).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `ZASADY.md:109` §4 „Z czego gra się składa”
- Skutek: `ZASADY.md` wymienia 8 tokenów i 2 zaokrąglenia, `DESIGN.md` §2 13 i 3 (sprzeczność źródeł, D-13)
- Źródło reguły: `DESIGN.md` §2
- Propozycja: w `ZASADY.md` §4 odesłać do tabeli `DESIGN.md` §2

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-062"></a>

### F4-062. Brak deklaracji color-scheme: dark

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-20](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L116).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/index.css:43-49`, `apps/web/index.html:6`
- Skutek: brak `color-scheme: dark` (natywne kontrolki mogą być jasne)
- Źródło reguły: `AGENTS.md` (tylko ciemny motyw)
- Propozycja: `color-scheme: dark;` w `html`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-063"></a>

### F4-063. Brak wspólnej klasy akcji w kolorze gracza

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-29](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L117).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/index.css` (brak klasy)
- Skutek: akcja w partii (`btn text-bg` + kolor gracza) bez wspólnej klasy przy trzech i więcej użytkownikach
- Źródło reguły: `DESIGN.md` §5, `ZASADY.md` §4
- Propozycja: `.btn-player` albo wpis w `ZASADY.md` §4

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-064"></a>

### F4-064. Brak reguły klatki bazowej Intro przy reduced motion

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-52](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L118).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/index.css:365`
- Skutek: podgląd `Intro` przy reduced motion pokazuje stan bazowy wszystkich klatek
- Źródło reguły: `ZASADY.md` §4, `DESIGN.md` §3.3
- Propozycja: zasada w §5: pierwsza klatka bazowo widoczna, reszta ukryta (podglądy sprawdzone: wszystkie czytelne)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-065"></a>

### F4-065. Brak wyjątku reduced motion dla ruchu będącego zadaniem

- Zakres: `platforma`.
- Ślad źródłowy: [F2:B-53](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L119).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `ZASADY.md` §5
- Skutek: brak wyjątku dla ruchu, który jest treścią gry (Kubki, Śledzenie, Wieża, Za zasłoną)
- Źródło reguły: `ZASADY.md` §5
- Propozycja: dopisać wyjątek (§7); po dopisaniu cztery gry zostają w §6

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-066"></a>

### F4-066. Dwa wypełnione akcenty przy pełnym kodzie pokoju

- Zakres: `platforma`.
- Ślad źródłowy: [F2:HM-1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L120).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Home.tsx:160`, `:241`
- Skutek: dwa wypełnione akcenty („Zagraj”, „Dołącz”) przy pełnym kodzie; `KONCEPT.md` §1 i `DESIGN.md` §3.1 tak to opisują, `DESIGN.md` §5 przeczy
- Źródło reguły: D-13
- Propozycja: „Zagraj” jako `btn-ghost` przy pełnym kodzie albo wyjątek w `DESIGN.md` §5

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-067"></a>

### F4-067. Rola accent nie obejmuje logo

- Zakres: `platforma`.
- Ślad źródłowy: [F2:HM-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L121).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Home.tsx:28`
- Skutek: logo w `fill-accent` (znak aplikacji bez roli w `DESIGN.md` §2)
- Źródło reguły: `DESIGN.md` §2, §5
- Propozycja: dopisać „znak aplikacji” do roli `accent` albo do §6

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-068"></a>

### F4-068. Napis Wszystkie (30) może nie mieścić się w kolumnie

- Zakres: `platforma`.
- Ślad źródłowy: [F2:HM-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L122).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Home.tsx:188`, `:195`
- Skutek: „Wszystkie (30)” `whitespace-nowrap` w kolumnie ok. 139 px (szacunek 140-158 px); do potwierdzenia
- Źródło reguły: `ZASADY.md` §4
- Propozycja: bez `whitespace-nowrap` albo „Wszystkie”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-069"></a>

### F4-069. DESIGN.md błędnie opisuje wysokość ekranów z listami

- Zakres: `platforma`.
- Ślad źródłowy: [F2:HM-8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L123).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Home.tsx:265-341`, `apps/web/src/screens/Lobby.tsx:75-103`, `apps/web/src/screens/Setup.tsx:21-64`, `apps/web/src/screens/Records.tsx:332-403`
- Skutek: `DESIGN.md` §6 mówi, że ekrany poza partią mieszczą się w 640 px; ekran główny ok. 890 px, lobby ok. 1000 px, `Setup` Statków ok. 860 px. Pionowe przewijanie list jest w porządku (akcja w `StickyBar`), więc to błąd opisu
- Źródło reguły: `DESIGN.md` §6 wobec `ZASADY.md` §4
- Propozycja: w `DESIGN.md` §6: listy przewijają się w pionie z akcją w `StickyBar`, 640 px dotyczy ekranu partii

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-070"></a>

### F4-070. Tytuł ustawień gry nie ma wyróżnienia

- Zakres: `platforma`.
- Ślad źródłowy: [F2:SU-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L124).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Setup.tsx:29`
- Skutek: tytuł ekranu gry w Satoshi 16 px 400 (ani tytuł, ani nazwa wyróżniona)
- Źródło reguły: `DESIGN.md` §2
- Propozycja: `font-semibold`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-071"></a>

### F4-071. Tło surface-inset użyte do pigułek i kafelków

- Zakres: `platforma`.
- Ślad źródłowy: [F2:RC-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L125).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Records.tsx:260`, `:353`, `:387`
- Skutek: `bg-surface-inset` (rola: pola formularza) jako tło pigułek i kafelków
- Źródło reguły: `DESIGN.md` §2, D-04
- Propozycja: `bg-surface` albo sam obrys `line`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-072"></a>

### F4-072. Link rozwinięcia w kolorze gracza

- Zakres: `platforma`.
- Ślad źródłowy: [F2:RC-3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L126).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Records.tsx:374`
- Skutek: link „Pokaż wszystkie” / „Zwiń” w kolorze gracza
- Źródło reguły: `DESIGN.md` §5
- Propozycja: `text-fg-muted underline underline-offset-4`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-073"></a>

### F4-073. Rekordy otwarte z pokoju nie pokazują ponownego łączenia

- Zakres: `platforma`.
- Ślad źródłowy: [F2:RC-6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L127).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/App.tsx:72` → `apps/web/src/screens/Records.tsx:333`
- Skutek: „Rekordy” z pokoju z `dropped={false}`: brak paska „Łączenie ponownie…”
- Źródło reguły: `DESIGN.md` §4, `ZASADY.md` §4
- Propozycja: prop `dropped` z `apps/web/src/App.tsx`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-074"></a>

### F4-074. Zamknięcie pokoju przedstawiane jako błąd kodu

- Zakres: `platforma`.
- Ślad źródłowy: [F2:AP-2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L128).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/App.tsx:45` → `apps/web/src/screens/Home.tsx:52`, `:231`
- Skutek: „Połączenie z pokojem zostało zamknięte.” jako błąd pola kodu (`aria-invalid`)
- Źródło reguły: `DESIGN.md` §4
- Propozycja: osobny stan `notice` nad sekcjami

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-075"></a>

### F4-075. „to można wybrać”

- Zakres: `chinczyk`.
- Ślad źródłowy: [F2:A1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L287).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: „to można wybrać”
- Gry, lokalizacje i wystąpienia: dominujące 1,2 s: `apps/web/src/games/Memory.tsx:90`, `apps/web/src/screens/Game.tsx:525`; odstające: `chinczyk` `apps/web/src/games/Chinczyk.tsx:219` (1 s)
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja … tej samej animacji”
- Ocena szczegółowa: średnia
- Propozycja: 1,2 s w Chińczyku i wiersz „pętla wskazania 1,2 s” w tabeli §5; komentarz keyframes bez jednej gry (U20)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-076"></a>

### F4-076. „to można wybrać”

- Zakres: `labirynt`.
- Ślad źródłowy: [F2:A2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L288).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: „to można wybrać”
- Gry, lokalizacje i wystąpienia: `labirynt` `apps/web/src/games/Labirynt.tsx:143` (`animate-pulse` kropek kroku)
- Źródło reguły: `ZASADY.md` §5 („Najpierw istniejące: `ring-pulse` (to można wybrać)”)
- Ocena szczegółowa: średnia
- Propozycja: kropka z obwódką i `ring-pulse` albo nieruchome kropki

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-077"></a>

### F4-077. czekamy na rywala

- Zakres: `piec-w-rzedzie`, `statki`, `memory`.
- Ślad źródłowy: [F2:A3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L289).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: czekamy na rywala
- Gry, lokalizacje i wystąpienia: `piec-w-rzedzie` `apps/web/src/games/PiecWRzedzie.tsx:122` (`ap`), `statki` `apps/web/src/games/Statki.tsx:276` (`ap`), `memory` `apps/web/src/games/Memory.tsx:116` (`ag`); Chińczyk, Labirynt, Kampus Tour sam tekst
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja…”, „Mechanizm: keyframes w `apps/web/src/index.css` z komentarzem”
- Ocena szczegółowa: średnia
- Propozycja: jedna animacja „czekamy” (keyframes z komentarzem i wiersz w §5) albo nieruchoma kropka we wszystkich; Memory jak Gomoku i Statki

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-078"></a>

### F4-078. odsłona prawdziwego wyniku

- Zakres: `mapa`, `kolor`, `kropki`, `kat`, `rok`, `srodek`, `tort`, `nozyczki`.
- Ślad źródłowy: [F2:A4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L290).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: odsłona prawdziwego wyniku
- Gry, lokalizacje i wystąpienia: odstające: `mapa` `apps/web/src/games/Mapa.tsx:177` (`stone-pop`); bez animacji: `apps/web/src/games/Srodek.tsx:171`, `apps/web/src/games/Tort.tsx:160`, `apps/web/src/games/Nozyczki.tsx:145`, `apps/web/src/games/Rok.tsx:180`, `apps/web/src/games/Szacowanie.tsx:141` (`kropki`, `kat`), `apps/web/src/games/Kolor.tsx:166`
- Źródło reguły: `ZASADY.md` §5, D-12
- Ocena szczegółowa: średnia
- Propozycja: jedna decyzja dla wszystkich: `stone-pop` 0,35 s na znaczniku prawdy (to „pojawienie” z tabeli §5) albo bez animacji wszędzie (usunąć z `apps/web/src/games/Mapa.tsx:177`)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-079"></a>

### F4-079. ruch zignorowany bez kary

- Zakres: `kolo`, `zaslona`, `srodek`, `nozyczki`.
- Ślad źródłowy: [F2:A5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L291).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: ruch zignorowany bez kary
- Gry, lokalizacje i wystąpienia: dominujące `sh` + tekst + 60: `apps/web/src/games/Srodek.tsx:91`, `:162`, `apps/web/src/games/Nozyczki.tsx:80`, `:142`; odstające: `kolo` `apps/web/src/games/Kolo.tsx:133`, `:217` (sam tekst), `zaslona` `apps/web/src/games/Zaslona.tsx:100` (nic; `ZASADY-GIER.md` :515 odsyła wprost do Środka)
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja…”; tabela wibracji (60 = pomyłka, „ruchu zignorowanego” w tabeli nie ma; komentarz `apps/web/src/index.css:337` „to nie kara”)
- Ocena szczegółowa: średnia
- Propozycja: jeden wzór „dotknięcie zignorowane”: `shake` 300 ms + tekst we wszystkich czterech; wibracja: albo wiersz „ruch zignorowany: 60” w tabeli §5, albo bez wibracji (wtedy też `ZASADY-GIER.md` Środek, Nożyczki). W Nożyczkach za krótki ruch też wibruje (`MIN_CUT`)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-080"></a>

### F4-080. pomyłka

- Zakres: `refleks`, `simon`, `memory`, `statki`.
- Ślad źródłowy: [F2:A6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L292).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: pomyłka
- Gry, lokalizacje i wystąpienia: `refleks` `apps/web/src/games/Refleks.tsx:174-177`, `:215` (falstart bez `warning`, `tm` i 60); `simon` `apps/web/src/games/Simon.tsx:74-76` (bez 60), `:88` (od razu `Scores`, nie widać, które pole było złe); do decyzji: `memory` `apps/web/src/games/Memory.tsx:45-53` (pudło bez 60), `statki` `apps/web/src/games/Statki.tsx:81-89` (pudło strzelającego)
- Źródło reguły: `ZASADY.md` §5 tabela („pomyłka: 60”), „Animacja ma pokazać, co się właśnie stało”; `DESIGN.md` §5 „Błąd ma ikonę i tekst”
- Ocena szczegółowa: średnia
- Propozycja: Refleks: `navigator.vibrate?.(60)`, `tm` + `text-warning` przy falstarcie (klucz jak `apps/web/src/games/Stoj.tsx:140`); Sekwencja: 60 i odsłona 1 s przed `finish` (złe pole `tm`, właściwe podświetlone; uwaga F1:SQ1: odsłona nie może opóźnić wysłania wyniku przed limitem); Memory i Statki: decyzja fazy 4, czy pudło w grze turowej to pomyłka (wtedy 60 tylko u odkrywającego / strzelającego)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-081"></a>

### F4-081. zło od innego gracza

- Zakres: `statki`, `kampus-tour`, `panstwa-miasta`.
- Ślad źródłowy: [F2:A7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L293).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: zło od innego gracza
- Gry, lokalizacje i wystąpienia: `statki` `apps/web/src/games/Statki.tsx:81-89` (trafienie i zatopienie w moją flotę bez wibracji, a broniący nie dostaje też wibracji tury); `kampus-tour` `apps/web/src/games/KampusTour.tsx:448-449` (wykupienie mojego pola, brak `vibrate` w pliku); `panstwa-miasta` `apps/web/src/games/PanstwaMiasta.tsx:66-72`, `:115-121` (STOP innego gracza: bez wibracji i bez `stone-pop`)
- Źródło reguły: `ZASADY.md` §5 tabela („coś złego dla mnie od innego gracza (zbity pionek): [60, 40, 60]”), wzór `apps/web/src/games/Chinczyk.tsx:131-135`
- Ocena szczegółowa: średnia (Kampus Tour i Państwa-miasta do decyzji: tabela podaje tylko przykład zbicia)
- Propozycja: `navigator.vibrate?.([60, 40, 60])` raz na zdarzenie u ofiary (ref jak `buzzed` w Chińczyku; w Kampus Tour po `settled`); baner STOP z `stone-pop`; w §5 dopisać przykłady (trafienie floty, wykupienie, STOP)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-082"></a>

### F4-082. koniec partii

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:A8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L294).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: koniec partii
- Gry, lokalizacje i wystąpienia: `kampus-tour` `apps/web/src/games/KampusTour.tsx:857` (`style={over ? undefined : …}`), `apps/web/src/games/KampusSummary.tsx:43`; wzór `apps/web/src/screens/Game.tsx:243-244`
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja…”, §4 (własny nagłówek przejmuje cały zakres)
- Ocena szczegółowa: średnia
- Propozycja: kolor zwycięzcy w nagłówku i tytule podsumowania, `title-pop` u zwycięzcy (czas wg decyzji U17)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-083"></a>

### F4-083. koniec partii po pomyłce

- Zakres: `w-pamieci`.
- Ślad źródłowy: [F2:A9](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L295).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: koniec partii po pomyłce
- Gry, lokalizacje i wystąpienia: `w-pamieci` `apps/web/src/games/WPamieci.tsx:154-172` (wynik wysyłany dopiero w `:169`), `packages/games/src/w-pamieci.ts:89` (`timeoutMove` = 0 rund); wzór: `apps/web/src/games/Kubki.tsx:68-71`, `apps/web/src/games/Sledzenie.tsx:61-64`, `apps/web/src/games/Wieza.tsx:88-91` (po 1 s same)
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja…”, „Animacja nie blokuje gry”
- Ocena szczegółowa: średnia (ryzyko utraty wyniku: odłożony telefon = 0 rund po 300 s; także do fazy 3)
- Propozycja: wysłać wynik od razu przy pomyłce, odsłonę zostawić lokalnie z „Dalej” (U9) albo z samoczynnym przejściem po 2,5 s

Uzgodnienie faz: F3 §10: po pomyłce w rundzie 8 pozostaje około 170 s na „Wyniki”; zero grozi przy porzuceniu partii. To zawężenie skutku, a nie dowód rozwiązania UX.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-084"></a>

### F4-084. moja tura

- Zakres: `panstwa-miasta`, `kalambury`.
- Ślad źródłowy: [F2:A10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L296).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: moja tura
- Gry, lokalizacje i wystąpienia: `apps/web/src/screens/Game.tsx:34-36` (wibracja tylko przy zmianie `myTurn`); `panstwa-miasta` `packages/games/src/panstwa-miasta.ts:143-149` (nowa faza po limicie bez wibracji, gdy gracz był i jest w `waitingFor`); `kalambury` `packages/games/src/kalambury.ts:215` (zgadujący wibrują w połowie rysowania, razem z odsłonięciem litery)
- Źródło reguły: `ZASADY.md` §5 tabela („moja tura: 40”), `ZASADY-GIER.md` §9 (połówki widać tylko po literze)
- Ocena szczegółowa: średnia (KL7 średnia w 02-06, PM13 podniesione z niskiej: ten sam mechanizm)
- Propozycja: w `apps/web/src/screens/Game.tsx` wibrować przy zmianie klucza `turn().key`, gdy `waitingFor` zawiera mnie; dla Kalamburów liczyć turę zgadującego od wejścia w `draw` i pomijać zmianę samej połówki

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-085"></a>

### F4-085. przejście dalej

- Zakres: `panstwa-miasta`, `kalambury`, `turniej`.
- Ślad źródłowy: [F2:A11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L297).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: przejście dalej
- Gry, lokalizacje i wystąpienia: „Dalej” w kolorze gracza: `panstwa-miasta` `apps/web/src/games/PanstwaMiasta.tsx:104`, `kalambury` `apps/web/src/games/Kalambury.tsx:139`; w akcencie: `apps/web/src/screens/Game.tsx:554` (turniej); `DESIGN.md` §5 wymienia „Dalej” wśród przycisków platformy w akcencie
- Źródło reguły: `DESIGN.md` §5 „Akcent należy do platformy, kolor gracza do partii”; `ZASADY.md` §5
- Ocena szczegółowa: średnia
- Propozycja: kod zostaje; dopisać w `DESIGN.md` §5: „Dalej” między rundami partii to akcja w partii (kolor gracza), między grami turnieju to platforma

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-086"></a>

### F4-086. pasek czasu

- Zakres: `rok`.
- Ślad źródłowy: [F2:A12](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L298).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Sytuacja i skutek: pasek czasu
- Gry, lokalizacje i wystąpienia: `rok` `apps/web/src/games/Rok.tsx:166-170` (`fg-muted`, ostrzeżenie od 5 s, przejście 250 ms); wzór: Quiz przez `onRound` i `Countdown` (`apps/web/src/games/MiniGame.tsx:315`, `apps/web/src/screens/Game.tsx:48`, `:251`)
- Źródło reguły: `ZASADY.md` §4 „Czego gra nie rysuje sama: pasek czasu w kolorze gracza”, §5; `DESIGN.md` §3.4
- Ocena szczegółowa: średnia
- Propozycja: czas rundy przez `onRound` i `Countdown` (wtedy `ZASADY-GIER.md` „ostatnie 5 s” → 10 s) albo przynajmniej kolor gracza, 10 s i 300 ms

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-087"></a>

### F4-087. trafienie w grze do pomyłki

- Zakres: `w-pamieci`.
- Ślad źródłowy: [F2:A13](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L299).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: trafienie w grze do pomyłki
- Gry, lokalizacje i wystąpienia: `w-pamieci` `apps/web/src/games/WPamieci.tsx:127` („Dobrze” w `success` w kaflu); wzór `apps/web/src/games/Kubki.tsx:147`, `apps/web/src/games/Sledzenie.tsx:138` („Dobrze” w `Stats`)
- Źródło reguły: `ZASADY.md` §5, §4 „te same słowa”
- Ocena szczegółowa: niska
- Propozycja: jedno miejsce na „Dobrze” (np. `Stats` „Teraz” we wszystkich, Wieża zostaje z werdyktem w polu)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-088"></a>

### F4-088. świeża para

- Zakres: `memory`.
- Ślad źródłowy: [F2:A14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L300).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: świeża para
- Gry, lokalizacje i wystąpienia: `memory` `apps/web/src/games/Memory.tsx:104` (`stone-pop`); komplet w Kampus Tour i nowy rekord mają `set-glow` (B-35)
- Źródło reguły: `ZASADY.md` §5 „Najpierw istniejące: `set-glow` (świeże osiągnięcie)”
- Ocena szczegółowa: niska
- Propozycja: zostawić `stone-pop` i dopisać w §5, że `set-glow` to komplet z wielu pól; albo `set-glow` na obu kartach pary

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-089"></a>

### F4-089. zaznaczenie pola w grze na czas

- Zakres: `dziesiatki`, `sudoku`, `zakupy`.
- Ślad źródłowy: [F2:A15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L301).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: zaznaczenie pola w grze na czas
- Gry, lokalizacje i wystąpienia: `dziesiatki` `apps/web/src/games/Dziesiatki.tsx:143` (ramka 1 px + tło 25%, bez `aria-pressed`); bez przejścia: `apps/web/src/games/Dziesiatki.tsx:143`, `sudoku` `apps/web/src/games/Sudoku.tsx:156`, `zakupy` `apps/web/src/games/Zakupy.tsx:165`
- Źródło reguły: `DESIGN.md` §4 (kafel zaznaczony, `aria-pressed`), §5 (kolor nie jedynym sygnałem); `ZASADY.md` §5 („zmiany stanu przez `transition-colors`”)
- Ocena szczegółowa: niska
- Propozycja: jeden wzór: pierścień 2 px w kolorze gracza + `aria-pressed`; przejście 100 ms albo zdanie w §5, że zaznaczenie w polu gry na czas nie ma przejścia (jak bodziec)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-090"></a>

### F4-090. pojawienie okna

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:A16](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L302).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: pojawienie okna
- Gry, lokalizacje i wystąpienia: `kampus-tour` `apps/web/src/games/KampusTour.tsx:649-652` (okienko pola bez `card-in`, pozostałe okna `:987`, `:1033`, `:1073` z `card-in`)
- Źródło reguły: `ZASADY.md` §5 „Ta sama sytuacja…”, tabela („pojawienie się karty 350 ms”)
- Ocena szczegółowa: niska
- Propozycja: `card-in` 0,35 s albo zdanie w §5, że okno otwierane dotknięciem pojawia się od razu

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-091"></a>

### F4-091. „Gotowe” w trzech rolach

- Zakres: `statki`, `panstwa-miasta`, `zakupy`.
- Ślad źródłowy: [F2:A17](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L303).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Sytuacja i skutek: „Gotowe” w trzech rolach
- Gry, lokalizacje i wystąpienia: `statki` `apps/web/src/games/Statki.tsx:324-335` (gotowość rozstawienia), `panstwa-miasta` `apps/web/src/games/PanstwaMiasta.tsx:202` (oddanie kartki), `zakupy` `apps/web/src/games/Zakupy.tsx:175` (zatwierdzenie zaznaczeń; nazwane w `KONCEPT.md` §2.4)
- Źródło reguły: `ZASADY.md` §4 „te same słowa co w innych grach” (to samo słowo w tej samej roli)
- Ocena szczegółowa: niska
- Propozycja: decyzja fazy 4: „Gotowe” tylko jako gotowość (Statki, jak „Zgłaszam gotowość” w lobby), w Zakupach „Zatwierdź” (z poprawką `KONCEPT.md` §2.4), w Państwach-miastach „Oddaj” albo zostawić z dopiskiem w §4

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-092"></a>

### F4-092. Ekran podsumowania wyższy niż 640 px

- Zakres: `platforma`, `kalambury`, `panstwa-miasta`, `turniej`.
- Ślad źródłowy: [F2:U3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L328).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 (360×640; „przy długiej treści `StickyBar`”), `DESIGN.md` §2 (akcje przy dolnej krawędzi). Waga: **średnia** (treść do przejrzenia, ale akcja musi być pod kciukiem).

| Ekran | Miejsce | Wysokość | Wpis |
|---|---|---|---|
| ekran po partii (każda gra przez `apps/web/src/screens/Game.tsx`, najdłuższy po mini-grze z `RecordPanel`) | `apps/web/src/screens/Game.tsx:455-459` (`OverActions` w zwykłym `div` z `mt-auto`) | 850-1000 px, solo ok. 880; „Rewanż” pod zgięciem | GM-1 |
| `kalambury`, odsłona rundy | `apps/web/src/games/Kalambury.tsx:105-145` | ok. 900 px; „Dalej” w `StickyBar` (zgodne) | KL2 |
| `panstwa-miasta`, podsumowanie rundy | `apps/web/src/games/PanstwaMiasta.tsx:90-108` | ok. 1000 px; „Dalej” w `StickyBar` (zgodne) | PM1 (część) |

- Propozycja: `OverActions` w `StickyBar` (to samo rozwiązuje `NextActions` turnieju, `apps/web/src/screens/Game.tsx:540-566`); w Kalamburach mniejsze płótno w odsłonie albo punkty rundy w `Scores` (razem z F1:W2).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-093"></a>

### F4-093. Pola dotykowe poniżej 48 px

- Zakres: `platforma`, `kolor`, `rok`, `kampus-tour`, `piec-w-rzedzie`, `statki`, `chinczyk`, `labirynt`, `panstwa-miasta`, `tort`, `sledzenie`.
- Ślad źródłowy: [F2:U4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L339).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Źródło: `ZASADY.md` §4 Reguły („Pola dotykowe co najmniej 48 px”), `AGENTS.md`. Wyjątek `DESIGN.md` §6 obejmuje tylko przyciski budowy 44 px w Kampus Tour (z „Pomiń” w tym rzędzie, §6). Waga: **średnia**.

| Gra / ekran | Miejsce | Rozmiar | Uwaga | Wpis |
|---|---|---|---|---|
| platforma (`kolor`, `rok`) | `apps/web/src/index.css:145-152` (`apps/web/src/games/Kolor.tsx:197`, `apps/web/src/games/Rok.tsx:187`) | tor 36 px, uchwyt 40 / 34 px | w Który rok? przyciski −1 / +1 48 px | B-31 |
| `apps/web/src/screens/Lobby.tsx` | `apps/web/src/screens/Lobby.tsx:435` | „Wyjdź” ok. 36 px | CHECKS §4 go nie złapał (brak klasy rozmiaru) | LB-1 |
| `apps/web/src/screens/Lobby.tsx` | `apps/web/src/screens/Lobby.tsx:392` (CHECKS §4 `:385`) | próbki koloru 40 px | 6 × 48 = 288 px przy 286 px wnętrza kafla | LB-2 |
| `apps/web/src/screens/Lobby.tsx`, `apps/web/src/screens/Setup.tsx` | `apps/web/src/screens/Lobby.tsx:158` | wiersz gracza 44 px | przycisk u gospodarza | LB-3 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:796-801`, `:774` | pola planszy ok. 35 px | jedyna droga wyboru pola przy sprzedaży, Juwenaliach, MPK | KT4 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:659-661` | „Zamknij” ok. 21 px na ekranie | | KT5 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:970` | „Podsumowanie” 44 px poza wyjątkiem | | KT6 |
| `piec-w-rzedzie` | `apps/web/src/games/PiecWRzedzie.tsx:58-66` | ok. 22 px | podgląd + potwierdzenie „Postaw” | G2 |
| `statki` | `apps/web/src/games/Statki.tsx:510-530` | 24-37 px | strzał z potwierdzeniem; rozstawianie cofalne | S2 |
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:236-246` | ok. 25 px | podgląd celu i drugie dotknięcie | C2 |
| `labirynt` | `apps/web/src/games/Labirynt.tsx:101-107` | 36 px (9×9), 45 px (7×7) | krok bez potwierdzenia | L2 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:319` (CHECKS §4 `:312`) | komórka głosowania 44 px | | PM3 |
| `tort` | `apps/web/src/games/Tort.tsx:19` (`GRAB` 10°), `:86` | strefa ok. 37 px na brzegu, mniej przy środku | uchwyt rysowany ok. 5 px | TO1 |
| `sledzenie` | `apps/web/src/games/Sledzenie.tsx:94-101`, `packages/games/src/sledzenie.ts:9`, `:25` | 43-46 px między bliskimi kulkami | tylko przy najbliższym ułożeniu (`GAP` 0,14) | SL2 |

- Propozycja: `min-h-12` / `size-12` w Lobby, „Zamknij” i „Podsumowanie” Kampus Tour, komórka głosowania; suwak: tor 48 px albo przezroczysty obszar dotyku 48 px; Tort: strefa łapania w px od palca (promień 24 px);
  Śledzenie: `GAP` ≥ 0,15 (zmiana zasad gry, najpierw test i `ZASADY-GIER.md`) albo wyjątek; Labirynt: przy puszczeniu palca najbliższe dozwolone pole w promieniu 24 px.
  Gęste plansze z podglądem i potwierdzeniem (G2, S2, C2, KT4): decyzja fazy 4, czy dopisać wyjątek do `DESIGN.md` §6 („pole poniżej 48 px, gdy ruch ma podgląd i potwierdzenie”).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-094"></a>

### F4-094. Kolory spoza tokenów

- Zakres: `platforma`, `kolor`, `rok`, `kampus-tour`, `piec-w-rzedzie`, `kolo`.
- Ślad źródłowy: [F2:U5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L363).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („kolory tylko z tokenów”), `DESIGN.md` §2, `AGENTS.md`; D-04 (kolor treści gry jest odstępstwem tylko z listy `DESIGN.md` §6). Waga: **średnia**.

| Gra / ekran | Miejsce | Kolor | Wpis |
|---|---|---|---|
| platforma (`kolor`, `rok`) | `apps/web/src/index.css:158-159`, `:166-167` | uchwyt suwaka `#fff` / `#000` | B-32 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:125` (`#ffb224`), `:128` (`#ff6369` = `warning`), `:134` (`#e879f9`), `:140` (`#3dd68c` = `success`); użycia `:747`, `:749`, `:820` | kolory rogów planszy; `success` w roli Biletu MPK | KT2 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:519`, `:1007` | `border-white`, `borderColor: "white"` | KT3 |
| `piec-w-rzedzie` | `apps/web/src/games/PiecWRzedzie.tsx:71` | `color-mix(..., white)` (CHECKS §1 go nie złapał) | G3 (kolor) |
| `kolo` | `apps/web/src/games/Kolo.tsx:71` | `hsl(140→0 80% 55%)` oceny odcinków | KO2 |

- Propozycja: `var(--color-fg)` / `var(--color-bg)` zamiast bieli i czerni (B-32, KT3, G3); w Kampus Tour `var(--color-warning)` dla Kolokwium, reszta rogów jako kolor treści z jednym źródłem (`CORNERS`) po rozszerzeniu
  `DESIGN.md` §6 do „pola planszy Kampus Tour (grupy i rogi)”; w Kole `color-mix` `success` / `warning` albo trzy stopnie z `grade`, albo wpis w `DESIGN.md` §6; uchwyt suwaka dopisać do §6.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-095"></a>

### F4-095. Kolor jako jedyny sygnał

- Zakres: `platforma`, `piec-w-rzedzie`, `chinczyk`, `labirynt`, `memory`, `kampus-tour`, `panstwa-miasta`, `sledzenie`, `zakupy`.
- Ślad źródłowy: [F2:U6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L377).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §5 „Kolor nigdy nie jest jedynym sygnałem” (`DESIGN.md` §4 przy stanach). Waga: **średnia**.

| Gra / ekran | Miejsce | Co rozpoznaje się tylko kolorem | Wpis |
|---|---|---|---|
| `piec-w-rzedzie` | `apps/web/src/games/PiecWRzedzie.tsx:68-73`, `aria-label` bez właściciela `:62` | kamienie graczy | G4 (02-05 Z2) |
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:217-222`, `:248` | pionki na torze | C4 |
| `labirynt` | `apps/web/src/games/Labirynt.tsx:166-170`, `:132` | pionki rywali przy 3-4 osobach | L4 |
| `memory` | `apps/web/src/games/Memory.tsx:92-99`, `:74` | czyje są zebrane pary | M4 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:793`, `:837` | właściciel pola na planszy | KT9 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:187`, `apps/web/src/index.css:140` | zła litera: sama czerwona ramka, bez ikony i tekstu | PM6 |
| `sledzenie` | `apps/web/src/games/Sledzenie.tsx:151`, `:158`, `:164` | cele i zaznaczone kulki (żółty gracz na `fg`: kontrast ok. 1,3:1) | SL1 |
| `apps/web/src/screens/Setup.tsx` | `apps/web/src/screens/Setup.tsx:48-49` | wybrany tryb | SU-1 |
| `zakupy` | `apps/web/src/games/Zakupy.tsx:100-106` | kto zaznaczył przedmiot (kropka 6 px) | ZK4 (podniesione z niskiej) |

- Propozycja: drugi znak (inicjał z `initials` na pionku / kamieniu / kropce jak w `GameDots`, ikona postaci właściciela na pasku pola Kampus Tour, obrys celu w Śledzeniu, `Check` przy wybranym trybie,
  ikona `X` / `Warning` przy złej literze) i nick w `aria-label`; dla pionków i kamieni do decyzji świadomy wyjątek w `DESIGN.md` §6 („gracze wybierają różne kolory”), ale nick w `aria-label` w każdym wariancie.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-096"></a>

### F4-096. Token w cudzej roli

- Zakres: `platforma`, `statki`, `chinczyk`, `panstwa-miasta`.
- Ślad źródłowy: [F2:U7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L395).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §2 (role tokenów), §5 „Kolor znaczy”; D-04. Waga: **średnia**.

| Gra / ekran | Miejsce | Token i rola | Wpis |
|---|---|---|---|
| `statki` | `apps/web/src/games/Statki.tsx:294`, `:266`, `:269`, `:174`, tekst `:299` | `accent` jako „niedozwolone” (strefa zakazana, duch); wyjątek §6 obejmuje tylko trafienie i zatopienie | S3 |
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:233`, `:195` | `warning` jako cel zbicia (dla ruszającego to nie problem, pionek jest „czyjś”) | C3 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:306`, `:320` | `accent-soft` jako „odrzucone” obok ikony `X` w `warning` | PM4 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:31` | `line-hover` na nieinteraktywnym kaflu litery | PM5 |
| `panstwa-miasta` | `apps/web/src/games/PanstwaMiasta.tsx:57` | `success` jako „skończył krok”, w Kalamburach ta sama fajka = „trafił” | PM9 (podniesione z niskiej) |
| `apps/web/src/screens/Records.tsx` | `apps/web/src/screens/Records.tsx:351`, `:355` | `warning` dla liczby gier „Do pobicia” | RC-1 |

- Propozycja: Statki: strefa i duch w `warning` (tło 12%), tekst bez nazwy koloru; Chińczyk: obrys w kolorze ofiary albo rola `warning` „ostrzeżenie przed skutkiem ruchu” w `DESIGN.md` §2;
  Państwa-miasta: bez tła odrzuconej (przekreślenie i 0 wystarczą), ikona zaznaczenia w jednym kolorze, `border-line` litery, fajka gotowości w `fg` albo znaczek w kropce jak `PlayerDots`; „Rekordy”: liczba w `fg`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-097"></a>

### F4-097. Pasek limitu i tytuł tury bez koloru gracza

- Zakres: `kampus-tour`, `panstwa-miasta`.
- Ślad źródłowy: [F2:U8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L410).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 „Czego gra nie rysuje sama” (pasek czasu w kolorze gracza z ruchem), „Własny nagłówek … przejmuje cały jego zakres”; `DESIGN.md` §3.4. Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `kampus-tour` | `apps/web/src/screens/Game.tsx:93` (`<Countdown … />` bez `color`) → `apps/web/src/screens/Game.tsx:596-597` (`bg-fg-muted`) | pasek limitu `fg-muted` | GM-2 = KT12 |
| `panstwa-miasta` | `apps/web/src/screens/Game.tsx:384` (`tense`, bez `color`), `apps/web/src/games/PanstwaMiasta.tsx:40-41` | pasek `bg-fg`, tytuł fazy bez koloru, gdy czekamy na mnie; brak kreski „to ja” (Kalambury mają, `apps/web/src/games/Kalambury.tsx:74`) | PM8 (podniesione z niskiej) |

- Propozycja: `color={turnColor}` w `apps/web/src/screens/Game.tsx:93` (już wyliczony); w Państwach-miastach `color` paska i tytułu z koloru gracza, gdy `waitingFor` zawiera mnie, i kreska pod własną kropką.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-098"></a>

### F4-098. Inne słowo w roli słowa wspólnego

- Zakres: `kampus-tour`, `kolor`, `kropki`, `kat`, `w-pamieci`, `kolo`.
- Ślad źródłowy: [F2:U9](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L420).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach („Start”, „Dalej”, „Rewanż”, „Do lobby”, „(ty)”)”. Waga: **średnia**.

| Gra | Miejsce | Słowo | Zamiast | Wpis |
|---|---|---|---|---|
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:1044`, `:1097` | „OK” | „Dalej” | KT15 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:406`, `:408`, `:409` | „Koniec gry”, „Twoja tura”, „Tura: …” | „Remis” / „Koniec”, „Twój ruch”, „Ruch: …” (`apps/web/src/screens/Game.tsx:186-205`) | KT13 |
| `kolor`, `kropki`, `kat` | `apps/web/src/games/Kolor.tsx:178`, `apps/web/src/games/Szacowanie.tsx:183` | „Następny kolor”, „Następna runda”, „Wyniki” | „Dalej” | W9b |
| `w-pamieci` | `apps/web/src/games/WPamieci.tsx:170` | „Wyniki” | „Dalej” | WP2 |
| `kolo` | `apps/web/src/games/Kolo.tsx:139` | „Nowy rekord!” po lepszej próbie w partii | słowo rekordu wszech czasów; tu „Najlepsza próba!” | KO3 |

- Propozycja: „Dalej” we wszystkich przejściach (albo dopisać „Wyniki” do zestawu w `ZASADY.md` §4, jeśli zostaje w dwóch grach); w §4 zapisać, kiedy odsłona czeka na przycisk (Odcień, Szacowanie);
  słowa wspólnego nagłówka w Kampus Tour; „Najlepsza próba!” w Kole.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-099"></a>

### F4-099. Własna lista wyników zamiast `Scores`

- Zakres: `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `stoj`, `refleks`.
- Ślad źródłowy: [F2:U10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L434).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md:109` §4 „Z czego gra się składa” („Wyniki mini-gry: komponent `Scores`, wiersz na gracza”), W-04. Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `stoj` | `apps/web/src/games/Quiz.tsx:47-138` (`Results`) | tabela: wynik, średni czas, błędy; zachowuje „gra…”, „(ty)” i kolejność | QZ1 |
| `refleks` | `apps/web/src/games/Refleks.tsx:23-121` | tabela (średnia, kary, najlepszy) i wykres; bez „(ty)” | RF1 |

- Propozycja: uznać `Results` za drugi wspólny wzorzec (`ScoreTable` w `apps/web/src/screens/ui.tsx`, wpis w `ZASADY.md` §4 obok `Scores`; uwzględnić F1:Z13), Refleks na ten sam wzorzec z wykresem jako szczegółem i z „(ty)”.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-100"></a>

### F4-100. Własna tabela rund zamiast `RoundTable`

- Zakres: `przytrzymaj`, `balon`, `kropki`, `kat`, `rok`, `kolor`.
- Ślad źródłowy: [F2:U11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L444).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: zależnie od wariantu; doprecyzowanie dokumentu bez zmiany zachowania lub zmiana reguły/czasu/kontraktu.

- Źródło: `DESIGN.md` §5 „tabela rund po partii to `RoundTable`”, W-07. `ZASADY-GIER.md` opisuje każdy z tych układów, więc to sprzeczność dokumentów (D-13: wygrywa `ZASADY.md` / `DESIGN.md`). Waga: **średnia**.

| Gra | Miejsce | Co | Wpis |
|---|---|---|---|
| `przytrzymaj` | `apps/web/src/games/Przytrzymaj.tsx:112-176` | siatka celów i odchyłek ze znakiem, suma w wierszu gracza (`ZASADY-GIER.md` :408) | PT1 |
| `balon` | `apps/web/src/games/Balon.tsx:72-119` | wytrzymałość balonów i stuknięcia (`ZASADY-GIER.md` :426) | BL1 |
| `kropki`, `kat` | `apps/web/src/games/Szacowanie.tsx:32-49` (`Answers`) | „było / wpisane” w 5 kolumnach | W9f |
| `rok` | `apps/web/src/games/Rok.tsx:115-135` | lista wydarzeń z rokiem i odpowiedziami | W9f |
| `kolor` | `apps/web/src/games/Kolor.tsx:40-55` (`Pairs`) | pary próbek z % zgodności | W9f |

- Propozycja: `RoundTable` z opcjonalnym wierszem celów i znakiem odchyłki (`format(error, raw)`), z `children` na prawdziwe wartości (wzór: lista miast `apps/web/src/games/Mapa.tsx:112-118`) i z własną klasą komórki dla Balonu;
  Odcień jako wyjątek w `DESIGN.md` §6 (kolory to treść); przy każdej zmianie poprawić też `ZASADY-GIER.md`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-101"></a>

### F4-101. Liczby bez Geist Mono albo bez `tabular-nums`

- Zakres: `platforma`, `memory`, `kampus-tour`, `chinczyk`, `labirynt`, `refleks`, `stoper`, `rytm`, `przytrzymaj`, `liczenie`, `kropki`, `kat`, `turniej`.
- Ślad źródłowy: [F2:U12](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L458).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („Liczby, czasy i kody czcionką mono z `tabular-nums`”), `DESIGN.md` §5 „Liczby są mono”, W-16. Waga: **niska**.

| Gra / ekran | Miejsce | Wpis |
|---|---|---|
| platforma (`Intro`) | `apps/web/src/screens/ui.tsx:319`, `:321` | B-73 |
| `memory` (pigułka w `apps/web/src/screens/Game.tsx`) | `apps/web/src/screens/Game.tsx:287` | GM-4 = M5 |
| `apps/web/src/screens/Home.tsx` | `apps/web/src/screens/Home.tsx:151-156`, `:332`, `:334` | HM-4 |
| `apps/web/src/screens/Lobby.tsx` | `apps/web/src/screens/Lobby.tsx:207` | LB-7 |
| `apps/web/src/screens/Records.tsx` | `apps/web/src/screens/Records.tsx:354-355`, `:156` | RC-4 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:151` (`zl` bez `tabular-nums`), `:901-903`, `:503`, `:949`, `:1092`, `:963` | KT16 |
| `kampus-tour` (podsumowanie) | `apps/web/src/games/KampusSummary.tsx:51`, `:59`, `:67`, `:199` | KS4 |
| `chinczyk` | `apps/web/src/games/Chinczyk.tsx:273`, `:177`, `:289` | C6 |
| `labirynt` | `apps/web/src/games/Labirynt.tsx:201` | L6 |
| `refleks` | `apps/web/src/games/Refleks.tsx:215`, `:98-100` | RF2 |
| `stoper` | `apps/web/src/games/Stoper.tsx:78`, `:79`, `:116`, `:117`, `:25` | SP1 |
| `rytm` | `apps/web/src/games/Rytm.tsx:115`, `:116`, `:160` | RY1 |
| `przytrzymaj` | `apps/web/src/games/Przytrzymaj.tsx:220`, `:221`, `:222` | PT2 |
| `liczenie` | `apps/web/src/games/Liczenie.tsx:20`, `:24`, `:25` (mono bez `tabular-nums`) | LI1 |
| `kropki`, `kat` | `apps/web/src/games/Szacowanie.tsx:37` (mono bez `tabular-nums`) | SZ3 |
| `turniej` | `apps/web/src/screens/Setup.tsx:211`, `:210`, `:213` | TU7 |

- Propozycja: `font-mono tabular-nums` na liczbach (wzór `Stats`, B-65; `apps/web/src/games/Stoj.tsx:156`, `apps/web/src/games/Zaslona.tsx:191`); decyzja fazy 4, czy reguła obejmuje liczby w zdaniach (log Kampus Tour, linia wyzwania dnia).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-102"></a>

### F4-102. Podpis bloku poza `.label`

- Zakres: `platforma`, `kampus-tour`, `statki`, `balon`, `zakupy`.
- Ślad źródłowy: [F2:U13](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L482).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §5 „Podpis to `.label` … nigdy pogrubiony Satoshi” (wyjątek: grupy w jednej liście), W-17. Waga: **niska**.
- Miejsca: `apps/web/src/screens/Lobby.tsx:379` („Twój kolor”, LB-5); `apps/web/src/screens/Records.tsx:354-355` (etykiety liczb podsumowania, RC-4); `apps/web/src/games/KampusTour.tsx:1037`, `:1077`, `:668` (KT17); `apps/web/src/games/KampusSummary.tsx:49`, `:57`, `:65` (KS5);
  `apps/web/src/games/Statki.tsx:473` (podpisy plansz, S5); `apps/web/src/games/Balon.tsx:87` („Balon wytrzymywał”, BL2); `apps/web/src/games/Zakupy.tsx:92` („Lista zakupów”, ZK3).
- Propozycja: `.label` (na kolorze: `text-bg` zamiast `fg-muted`; kolor właściciela przez `style` zostaje).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-103"></a>

### F4-103. Waga ikony w małej akcji

- Zakres: `platforma`, `kampus-tour`, `kalambury`.
- Ślad źródłowy: [F2:U14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L488).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §2 („`bold` w małych akcjach (16-18 px)”), W-15. Waga: **niska**.
- Miejsca: `apps/web/src/screens/ui.tsx:41` (`TopBar`, B-57); `apps/web/src/screens/Game.tsx:227` (GM-7); `apps/web/src/screens/Home.tsx:107`, `:196` (HM-6); `apps/web/src/screens/Lobby.tsx:436` (LB-6); `apps/web/src/screens/MiniGames.tsx:109` (MG-2); `apps/web/src/screens/Records.tsx:335`, `:275` (RC-5);
  `apps/web/src/games/KampusTour.tsx:660` (KT19); `apps/web/src/games/Kalambury.tsx:287`, `:291` (KL6).
- Propozycja: `weight="bold"`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-104"></a>

### F4-104. Przejście z domyślnym czasem Tailwinda 150 ms

- Zakres: `platforma`, `kampus-tour`, `kalambury`, `turniej`, `kubki`.
- Ślad źródłowy: [F2:U15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L494).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 tabela („przycisk, przejście stanu 180 ms”, „reakcja na dotyk 100 ms”). Waga: **niska**.
- Miejsca: `apps/web/src/screens/ui.tsx:64`, `:114` (B-62); `apps/web/src/screens/Game.tsx:266` (GM-10); `apps/web/src/screens/Lobby.tsx:158`, `:255` (LB-9: tło zaznaczonego kafla przeskakuje); `apps/web/src/screens/Setup.tsx:48`, `apps/web/src/screens/MiniGames.tsx:57` (SU-4); `apps/web/src/screens/Records.tsx:268` (RC-8);
  `apps/web/src/games/KampusTour.tsx:801` (KT20); `apps/web/src/games/Kalambury.tsx:277` (KL3); `apps/web/src/screens/Setup.tsx:156`, `:184` (TU3); `apps/web/src/games/Kubki.tsx:173` (KB1).
- Propozycja: `duration-180` (`transition-colors` tam, gdzie zmienia się też tło), w palecie Kalamburów `duration-100`; albo uznać 150 ms w tabeli §5.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-105"></a>

### F4-105. Animacje Tailwinda spoza `index.css`

- Zakres: `platforma`, `piec-w-rzedzie`, `statki`, `labirynt`, `memory`.
- Ślad źródłowy: [F2:U16](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L500).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Mechanizm: keyframes w `apps/web/src/index.css` z komentarzem”; `DESIGN.md` §1 („ekran nie świeci, nie miga”). Waga: **niska** (reguła reduced motion je obejmuje).
- Miejsca (B-50): `animate-pulse` w `apps/web/src/games/PiecWRzedzie.tsx:78`, `:122`, `apps/web/src/games/Statki.tsx:276`, `apps/web/src/games/Labirynt.tsx:143`, `apps/web/src/screens/Game.tsx:596` (ostatnie 10 s limitu, GM-8), `apps/web/src/screens/Lobby.tsx:68`, `:69` (szkielety ładowania, LB-8);
  `animate-ping` w `apps/web/src/games/Memory.tsx:116`. Gdzie to ta sama sytuacja inaczej: A2, A3.
- Propozycja: pasek limitu sam kolorem `warning`; ładowanie słowem z wielokropkiem (U26); albo nazwać pulsowanie w `apps/web/src/index.css` z komentarzem i rolą w §5 („czekamy na coś”).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-106"></a>

### F4-106. Keyframes spoza listy §5

- Zakres: `platforma`, `piec-w-rzedzie`, `kolo`, `stroop`, `liczenie`, `inny`, `obrot`, `literowka`, `dziesiatki`, `sudoku`, `schulte`, `wieza`, `stoj`, `srodek`, `nozyczki`.
- Ślad źródłowy: [F2:U17](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L506).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Najpierw istniejące” i tabela czasów; D-06. Waga: **niska**.
- Keyframes (B-38, B-41, B-45..B-48): `line-draw` (`apps/web/src/index.css:225`; `apps/web/src/games/PiecWRzedzie.tsx:100` 0,5 s, `apps/web/src/games/Kolo.tsx:166` podgląd), `title-pop` (`apps/web/src/index.css:258`; `apps/web/src/screens/Game.tsx:243` 0,5 s `cubic-bezier(0.2,0.8,0.4,1)`),
  `tile-hit` / `tile-miss` (`apps/web/src/index.css:303`, `:310`; 0,35 s w Quiz, Dziesiątkach, Sudoku, Schultem, Wieży, Stój!), `piece-fall` (`apps/web/src/index.css:330`; `apps/web/src/games/Wieza.tsx:142` 0,5 s), `shake` (`apps/web/src/index.css:338`; `apps/web/src/games/Srodek.tsx:162`, `apps/web/src/games/Nozyczki.tsx:142` 0,3 s).
- Propozycja: dopisać do listy §5 z rolą i czasem (§7); `title-pop` albo z czasem 0,5 s w tabeli, albo 350 ms `ease-out`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-107"></a>

### F4-107. Animacja bez kategorii w tabeli czasów §5

- Zakres: `platforma`, `kampus-tour`, `rytm`, `zakupy`, `kubki`, `sledzenie`, `wieza`.
- Ślad źródłowy: [F2:U18](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L512).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Czasy”, D-06. Waga: **niska**.

| Miejsce | Animacja | Wpis |
|---|---|---|
| `apps/web/src/index.css:194` (`apps/web/src/games/KampusTour.tsx:803`, `apps/web/src/screens/Records.tsx:144`) | `set-glow` 0,9 s × 4 („świeże osiągnięcie”) | B-35 |
| `apps/web/src/screens/Game.tsx:596`, `:486` | szerokość paska limitu 300 ms `linear`, paska postępu 200 ms | GM-9 |
| `apps/web/src/games/Rytm.tsx:148` | pasek 10 s jako przejście CSS; przy reduced motion od razu pełny | RY2 |
| `apps/web/src/games/Zakupy.tsx:133-134` | pasek pokazu listy, inline `transition` 10 s; przy reduced motion od razu pusty; tor `bg-surface` zamiast `bg-line` | ZK2 |
| `apps/web/src/games/Kubki.tsx:81-104` | zamiana kubków 500→150 ms (ruch będący treścią) | KB2 |
| `apps/web/src/games/Sledzenie.tsx:72-88` | ruch kulek 5 s (ruch będący treścią); w pliku brak komentarza o reduced motion | SL3 |
| `apps/web/src/games/Wieza.tsx:74-84` | jazda klocka (ruch będący treścią); brak komentarza o reduced motion | WZ5 |

- Propozycja: wiersze tabeli §5 (§7): „świeże osiągnięcie 0,9 s × 4”, „pasek czasu i postępu: przejście szerokości równe krokowi odświeżania, `linear`”, „ruch będący treścią gry: czas z `ZASADY-GIER.md`”;
  paski 10 s (Rytm, Zakupy) liczone z czasu (`setInterval` / `requestAnimationFrame` jak `Countdown`), żeby działały też przy reduced motion; komentarz o reduced motion w Śledzeniu i Wieży jak `apps/web/src/games/Kubki.tsx:77-78`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-108"></a>

### F4-108. Czas pojawienia inny niż 350 ms

- Zakres: `platforma`, `turniej`, `w-pamieci`.
- Ślad źródłowy: [F2:U19](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L528).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 tabela („pojawienie się elementu 350 ms, `ease-out`”). Waga: **niska**.
- Miejsca: `apps/web/src/screens/ui.tsx:125` (odznaka wygranych `stone-pop` 0,5 s, B-63), `apps/web/src/screens/Game.tsx:306` (liczba wygranych 0,5 s, B-37), `apps/web/src/games/WPamieci.tsx:130` (180 ms, WP1: krótszy ma sens przy pokazie 1,5 s, ale bez opisu).
- Propozycja: 0,35 s w `apps/web/src/screens/ui.tsx` i `apps/web/src/screens/Game.tsx`; dla W pamięci wiersz „pojawienie w pokazie na czas: 180 ms” w tabeli §5 i komentarz w kodzie.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-109"></a>

### F4-109. Komentarz w `index.css` węższy niż użycie

- Zakres: `platforma`.
- Ślad źródłowy: [F2:U20](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L533).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Mechanizm” (komentarz mówi, do czego służy). Waga: **niska**.
- Miejsca: `apps/web/src/index.css:31`, `:33` (role `warning` i `success`, B-17), `:144` (`.swatch-range`: dawna nazwa „Kolor z pamięci”, bez Który rok?, B-33), `:193`, `:204`, `:216`, `:265`, `:287`, `:302`
  (`set-glow`, `ring-pulse`, `stone-pop`, `dice-tumble`, `float-up`, `tile-hit` wymieniają jedną grę, B-35..B-45).
- Propozycja: komentarze jak kolumna „Rola” w `DESIGN.md` §2 i rola keyframes z listy §5.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-110"></a>

### F4-110. Cień poza miejscami z `DESIGN.md` §2

- Zakres: `platforma`, `kolor`, `rok`, `kampus-tour`, `piec-w-rzedzie`, `statki`, `memory`.
- Ślad źródłowy: [F2:U21](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L539).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §2 („Cień mają tylko … okna i pionki w Kampus Tour oraz `set-glow`”). Waga: **niska**.
- Miejsca: `apps/web/src/index.css:157`, `:165` (uchwyt suwaka, B-32); `apps/web/src/games/KampusTour.tsx:203`, `:733`, `:756`, `:779`, `:794`, `:832` (plansza 2.5D, poświaty, `drop-shadow`, KT7); `apps/web/src/games/PiecWRzedzie.tsx:72` (cień kamienia i poświata zwycięskiej linii, G3);
  `apps/web/src/games/Statki.tsx:44` (poświata zaznaczonego statku, S4); `apps/web/src/games/Memory.tsx:98` (poświata karty, M2).
- Propozycja: rozszerzyć wyjątek Kampus Tour w `DESIGN.md` §6 (plansza 2.5D, poświata gracza na turze); w Gomoku cień kamienia dopisać obok pionków albo usunąć, poświatę linii zastąpić `set-glow`; w Statkach i Memory sam obrys.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-111"></a>

### F4-111. Zaokrąglenie spoza 20 / 10 / 999 px

- Zakres: `platforma`, `kolor`, `rok`, `turniej`, `kampus-tour`, `statki`, `chinczyk`, `obrot`, `wieza`.
- Ślad źródłowy: [F2:U22](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L545).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §2 „Zaokrąglenia”, `ZASADY.md` §4. Waga: **niska**.
- Miejsca: `apps/web/src/index.css:157`, `:165` (6 px uchwytu, B-32); `apps/web/src/screens/ui.tsx:125` (odznaka turnieju 4 px, B-61); `apps/web/src/games/KampusTour.tsx:162`, `:575`, `:586`, `:801`, `:819` (KT8); `apps/web/src/games/Statki.tsx:165` (1 px, S4); `apps/web/src/games/Chinczyk.tsx:307` (6 px, C5);
  `apps/web/src/games/Obrot.tsx:26` (`rx` klocków, treść gry, OB1); `apps/web/src/games/Wieza.tsx:29-31` (`rounded-sm` w podglądzie, w grze klocki prostokątne, WZ3).
- Propozycja: dopisać do `DESIGN.md` §2 / §6 „4 px: odznaka turnieju i pola planszy Kampus Tour” oraz figury Obrotu jako treść gry; Chińczyk `rounded-inset`; Wieża bez `rounded-sm`; segmenty floty `rounded-none`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-112"></a>

### F4-112. Dostępność: `aria-hidden`, `aria-label`, role

- Zakres: `platforma`, `kampus-tour`, `kalambury`, `zaslona`, `balon`, `inny`, `sudoku`, `statki`, `labirynt`.
- Ślad źródłowy: [F2:U23](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L551).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („Elementy ozdobne mają `aria-hidden`, a przyciski bez tekstu `aria-label`”), W-15. Waga: **niska**.

| Gra / ekran | Miejsce | Co | Wpis |
|---|---|---|---|
| platforma | `apps/web/src/screens/ui.tsx:327` | kropka koloru w liście „już gra” bez `aria-hidden` | B-74 |
| `apps/web/src/screens/Game.tsx` | `apps/web/src/screens/Game.tsx:276`, `:287`, `:300`, `:321` | `aria-label` na `span` bez roli (czytniki pomijają) | GM-5 |
| `apps/web/src/screens/Game.tsx` | `apps/web/src/screens/Game.tsx:594` | `progressbar` bez `aria-valuemin` / `aria-valuemax` | GM-6 |
| `kampus-tour` | `apps/web/src/games/KampusTour.tsx:660`, `:285`, `:819-821` | ikona `X` bez `aria-hidden`; `aria-label` kostek i Juwenaliów na `span` | KT18 |
| `kalambury` | `apps/web/src/games/Kalambury.tsx:153-158` | płótno bez `role="img"` i bez `aria-hidden` | KL5 |
| `zaslona` | `apps/web/src/games/Zaslona.tsx:162-167`, `:200-203` | od 2. rundy pole bez tekstu i `aria-label` | ZS1 |
| `balon` | `apps/web/src/games/Balon.tsx:146` | pole pompowania to `div` z `onPointerDown`, bez roli i fokusu | BL3 |
| `inny` | `apps/web/src/games/Inny.tsx:21`, `:50` (`apps/web/src/games/Quiz.tsx:248-259`) | komórki siatki bez nazwy | IN1 |
| `sudoku` | `apps/web/src/games/Sudoku.tsx:150-160` | puste pola bez `aria-label`, wybrane bez `aria-pressed` | SU3 |
| `statki` | `apps/web/src/games/Statki.tsx:523`, `:532`, `:397` | pola bez stanu strzału, własna plansza jako `span` z `aria-label` | S6 |
| `labirynt` | `apps/web/src/games/Labirynt.tsx:132-133` | plansza jeden `role="img"`, krok tylko wskaźnikiem | L5 |

- Propozycja: `aria-hidden` na ozdobach; `role="img"` przy `aria-label` na `span` albo tekst `sr-only`; `aria-valuemin={0} aria-valuemax={total}`; `aria-label` z pozycją / stanem pola; Balon jako `<button aria-label="Pompuj balon">`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-113"></a>

### F4-113. Rozłączony gracz

- Zakres: `platforma`.
- Ślad źródłowy: [F2:U24](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L570).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §4 „gracz rozłączony” (w partii przerywany obrys, krycie 40% kropki), `ZASADY.md` §4. Waga: **niska**.
- Miejsca: `apps/web/src/screens/Game.tsx:264-328` (pigułki gier głównych nie pokazują rozłączenia, `p.connected` nieużyte, GM-3); `apps/web/src/screens/Lobby.tsx:143`, `:158` (cały wiersz `opacity-50`, LB-4).
- Propozycja: przerywany obrys i `opacity-40` pigułki z „rozłączony” w `aria-label` (jak `GameDots`); w lobby krycie tylko kropki.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-114"></a>

### F4-114. Krycie stanu spoza tabeli `DESIGN.md` §4

- Zakres: `platforma`, `panstwa-miasta`, `turniej`, `memory`.
- Ślad źródłowy: [F2:U25](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L575).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §4 (przygaszony 60%, nieaktywny 40%, „Każdy stan, który coś blokuje, tłumaczy się podpisem”). Waga: **niska**.
- Miejsca: `apps/web/src/games/PanstwaMiasta.tsx:321` (własne odpowiedzi 50% bez podpisu, PM7); `apps/web/src/screens/Setup.tsx:195-200` (stan „bez” bez słowa, „na pewno” ze słowem, TU4); `apps/web/src/games/Memory.tsx:81-83` (rewers 45%, M3);
  `apps/web/src/screens/Setup.tsx:47`, `:49` (tryby u gościa 50% bez podpisu „Tryb wybiera gospodarz”, SU-2).
- Propozycja: 40% dla nieaktywnego, 60% dla przygaszonego, krótki podpis przy stanie.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-115"></a>

### F4-115. Stan ładowania niezgodny z `DESIGN.md` §4

- Zakres: `platforma`.
- Ślad źródłowy: [F2:U26](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L581).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §4 „ładowanie” (czasownik z wielokropkiem, bez spinnera, wszystkie akcje nieaktywne), „stan pusty tylko, gdy naprawdę pusto”. Waga: **niska**.
- Miejsca: `apps/web/src/screens/Home.tsx:99`, `:111`, `:160-163` (start solo bez słowa; „Rekordy” i „zmień” aktywne, HM-5); `apps/web/src/screens/Home.tsx:60`, `:112` i `apps/web/src/screens/MiniGames.tsx:50`, `:66`, `:82-85`, `:138` (rekordy `{}` dają fałszywe „nie grane” / „Nikt jeszcze nie grał”, HM-7, MG-1);
  `apps/web/src/screens/Records.tsx:203` (`TopGame` nic nie rysuje do odpowiedzi, RC-7); `apps/web/src/App.tsx:50` (wznawianie sesji: pusty ekran, AP-1); szkielety `apps/web/src/screens/Lobby.tsx:68-69` (U16).
- Propozycja: „Uruchamianie…” / „Łączenie…” / „Wczytywanie…” w `fg-muted` z `role="status"`; `records: null` do odpowiedzi serwera.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-116"></a>

### F4-116. `float-up` niewidoczne przy reduced motion

- Zakres: `platforma`, `kampus-tour`, `wieza`, `balon`.
- Ślad źródłowy: [F2:U27](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L587).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „`prefers-reduced-motion`” (przeskok do stanu końcowego zakłada, że stan końcowy coś pokazuje); B-51. Waga: **niska** (ta sama informacja jest w panelu / `Stats`).
- Miejsca: `apps/web/src/games/KampusTour.tsx:756` (KA5), `apps/web/src/games/Wieza.tsx:162` (werdykt „Pudło” / „Idealnie!”, WZ1), `apps/web/src/games/Balon.tsx:157`, `apps/web/src/screens/ui.tsx:132`, `apps/web/src/screens/Game.tsx:311`; klatka końcowa `apps/web/src/index.css:288-300` (`opacity: 0`), reguła `apps/web/src/index.css:360-368`.
- Propozycja (decyzja platformy): osobna reguła `@media (prefers-reduced-motion: reduce)` dla `float-up` (widoczna bez ruchu, wygaszana stanem) albo świadomy zapis w §5.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-117"></a>

### F4-117. Pomiar z obsługi zdarzenia zamiast `e.timeStamp`

- Zakres: `refleks`, `stoper`, `stoj`, `wieza`.
- Ślad źródłowy: [F2:U28](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L592), [F3:R6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L318).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 „Pomiar czasu” (dokładność); wzór `apps/web/src/games/Rytm.tsx:85`, `apps/web/src/games/Przytrzymaj.tsx:90`, `apps/web/src/games/Zaslona.tsx:99`. Waga: **niska** (pomiar nie zależy od animacji; błąd kilka-kilkanaście ms, u wszystkich podobny).
- Miejsca: `apps/web/src/games/Refleks.tsx:155`, `:170` (RF4: start sprzed narysowania bodźca); `apps/web/src/games/Stoper.tsx:49`, `:112` (SP2); `apps/web/src/games/Stoj.tsx:53`, `:71` (SJ2); `apps/web/src/games/Wieza.tsx:138`, `:76` (WZ2: 10 ms to ok. 1,4% pola przy progu 2%).
- Propozycja: `e.timeStamp` w `onPointerDown`; start bodźca w `requestAnimationFrame` po zmianie fazy (pierwsza klatka z bodźcem). Wielkość błędu do fazy 3.

Uzgodnienie faz: F3:R6 jest oceną wpływu tego samego pomiaru, więc nie tworzy nowej rozbieżności. Klatka: 8-17 ms przy 120/60 Hz (W); opóźnienie sprzętu 50-100 ms to założenie (A). F3 rekomenduje zmianę Refleksu i Stój!, uznając Stoper i Wieżę za niski wpływ. Cztery wystąpienia U28 zachowane; pomiar urządzeń pozostaje otwarty.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-118"></a>

### F4-118. `accent-fg` poza akcentem

- Zakres: `simon`, `stoj`.
- Ślad źródłowy: [F2:U29](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L597).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §2 (rola `accent-fg`: tekst na akcencie), D-04. Waga: **niska** (wartość równa `bg`, zero skutku widocznego).
- Miejsca: `apps/web/src/games/Simon.tsx:121` (SQ1), `apps/web/src/games/Stoj.tsx:149`, `:28` (SJ1).
- Propozycja: `text-bg` / `var(--color-bg)`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-119"></a>

### F4-119. Drobne różnice słów

- Zakres: `platforma`, `panstwa-miasta`, `kalambury`, `kropki`, `kat`, `rok`, `obrot`, `wieza`, `zaslona`, `przytrzymaj`.
- Ślad źródłowy: [F2:U30](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L602).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 „te same słowa co w innych grach”. Waga: **niska**.
- Miejsca: „Czekamy na resztę” `apps/web/src/games/PanstwaMiasta.tsx:105`, `apps/web/src/games/Kalambury.tsx:140` wobec „Czekamy na: {nicki}…” (PM10); „Dalej” w dwóch znaczeniach `apps/web/src/games/PanstwaMiasta.tsx:212` / `:105` (PM12);
  „Idealnie” `apps/web/src/games/Szacowanie.tsx:179`, `apps/web/src/games/Rok.tsx:198` wobec „Idealnie!” (W9c); podgląd „ta sama / lustro” `apps/web/src/games/Obrot.tsx:55` (OB2); „odcięte” `apps/web/src/games/Wieza.tsx:170` wobec „ucięte” `:116` (WZ4);
  legenda „ostrzegawczy” `apps/web/src/games/Zaslona.tsx:126` wobec „czerwony” `apps/web/src/screens/ui.tsx:244` i progi przez `${}` (B-69); odchyłka w ms w `Stats` i w s w odsłonie, „+0,00 s” ze znakiem `apps/web/src/games/Przytrzymaj.tsx:201`, `:221-224` (PT4).
- Propozycja: jedna forma w każdej parze (tabela §4.9).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-120"></a>

### F4-120. Zapis ułamka bez wspólnej funkcji

- Zakres: `platforma`, `schulte`, `sudoku`.
- Ślad źródłowy: [F2:U31](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L609).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („przecinek dziesiętny („10,00 s”)”), B-66. Waga: **niska** (dziś żaden tekst nie ma kropki).
- Miejsca: `apps/web/src/screens/ui.tsx:175` (`tenth` tylko na jedno miejsce, „-0,0” z minusem ASCII, B-66); `apps/web/src/games/Schulte.tsx:83`, `:115`, `:130`, `apps/web/src/games/Sudoku.tsx:95`, `:123`, `:138` (kara przez szablon, kropka przy ułamkowej karze, SC1).
- Propozycja: `decimal(n, digits)` w `apps/web/src/screens/ui.tsx` (z `tenth = (n) => decimal(n, 1)`, bez minus zera) i kary przez nią.

Uzgodnienie faz: F3 §10: kary Schultego i Sudoku oraz `ms` są całkowite. Nie ma potwierdzonej kropki dziesiętnej na obecnej ścieżce. Zachowany wpis dotyczy współdzielenia formatowania i minus zera, a część o hipotetycznej ułamkowej karze ma status prewencyjnej propozycji, nie bieżącego błędu.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-121"></a>

### F4-121. Animacja pojawienia gra ponownie po odświeżeniu

- Zakres: `piec-w-rzedzie`, `statki`, `labirynt`, `memory`.
- Ślad źródłowy: [F2:U32](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L614).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 („przy dużym skoku (odświeżenie, powrót do karty) element od razu ląduje na miejscu”). Waga: **niska**.
- Miejsca: `apps/web/src/games/PiecWRzedzie.tsx:69`, `apps/web/src/games/Statki.tsx:373`, `apps/web/src/games/Labirynt.tsx:151`, `apps/web/src/games/Memory.tsx:104` (wszystkie zebrane pary naraz).
- Propozycja: animować tylko element zmieniony po zamontowaniu (ref z poprzednim stanem, jak `useRolling` w `apps/web/src/games/Chinczyk.tsx:58-70`).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-122"></a>

### F4-122. Zapis braku wartości

- Zakres: `kolo`, `balon`.
- Ślad źródłowy: [F2:U33](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L619).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `DESIGN.md` §4 „stan pusty”, `ZASADY.md` §4 (bez em-dashy, te same słowa). Waga: **niska**.
- Miejsca: `apps/web/src/games/Kolo.tsx:184` (ASCII „-” w `Stats`, KO5), `apps/web/src/games/Balon.tsx:109` (en-dash „–” w tabeli, BL4; `ZASADY-GIER.md` :426 „kreska”).
- Propozycja: jeden zapis w całej aplikacji (np. „0” albo „brak” w `fg-muted`), z poprawką legendy Balonu.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-123"></a>

### F4-123. Szerokość bez skalowania

- Zakres: `inny`, `literowka`, `dziesiatki`, `sudoku`.
- Ślad źródłowy: [F2:U34](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L624).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („plansza skaluje się do szerokości, nie ma stałych pikseli”), D-09. Waga: **niska** (dziś bez skutku).
- Miejsca: `apps/web/src/games/Quiz.tsx:246` (`inny`, `literowka`) i `apps/web/src/games/Dziesiatki.tsx:130` (`repeat(N, 1fr)` bez `minmax(0, 1fr)`, QZ2); `apps/web/src/games/Sudoku.tsx:142` (`w-64`, SU1).
- Propozycja: `minmax(0, 1fr)`; `w-full max-w-64`.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-124"></a>

### F4-124. Własne progi zamiast `grade`

- Zakres: `przytrzymaj`, `stoper`.
- Ślad źródłowy: [F2:U35](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L629).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 (wspólne komponenty), B-67. Waga: **niska**.
- Miejsca: `apps/web/src/games/Przytrzymaj.tsx:20-25`, `apps/web/src/games/Stoper.tsx:79` (PT3).
- Propozycja: `grade(off, PERFECT, CLOSE)` z `apps/web/src/screens/ui.tsx:178` (jak `apps/web/src/games/Zaslona.tsx:191`), wspólne stałe dla Stopera, Przytrzymaj i Za zasłoną.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-125"></a>

### F4-125. Punkt `time` w `Intro` bez czasu

- Zakres: `kolo`, `srodek`, `mapa`, `tort`, `nozyczki`.
- Ślad źródłowy: [F2:U36](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L634).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §4 („`time`: czas”), B-72, W-08. Waga: **niska**.
- Miejsca: `apps/web/src/games/Kolo.tsx:170`, `apps/web/src/games/Srodek.tsx:131`, `apps/web/src/games/Mapa.tsx:129`, `apps/web/src/games/Tort.tsx:127`, `apps/web/src/games/Nozyczki.tsx:110` (W9g: liczba rund, bez limitu partii).
- Propozycja: „10 rund, razem do 2 minut” albo w §4: `time` to długość partii (rundy albo sekundy).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-126"></a>

### F4-126. Kolor znacznika prawdy w odsłonie

- Zakres: `rok`, `kropki`, `kat`.
- Ślad źródłowy: [F2:U37](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L639).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Źródło: `ZASADY.md` §5 (ta sama sytuacja tak samo), `DESIGN.md` §2 (`success` = trafienie). Waga: **niska**.
- Miejsca: `apps/web/src/games/Rok.tsx:180` (pierścień prawdziwego roku zawsze `success`), `:198`; `apps/web/src/games/Szacowanie.tsx:178` (`kropki`, `kat`); `apps/web/src/games/Kat.tsx:30` (łuk `stroke-fg-muted`); wzór `grade`: `apps/web/src/games/Srodek.tsx:168-171`, `apps/web/src/games/Mapa.tsx:170-177`, `apps/web/src/games/Tort.tsx:160`, `apps/web/src/games/Nozyczki.tsx:156` (W9d).
- Propozycja: `grade` z progami w Który rok? i Szacowaniu, neutralny znacznik prawdy (`stroke-fg`), gdy błąd ma już kolor.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-127"></a>

### F4-127. Błysk trafienia na odpowiedziach nowego pytania

- Zakres: `platforma`.
- Ślad źródłowy: [F2:QZ3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L772).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Quiz.tsx:184`, `:189`, `:250`, `:256`
- Źródło reguły: `ZASADY.md` §5 („Animacja ma pokazać, co się właśnie stało”)
- Propozycja: błysk trafienia nie na przyciskach nowego pytania (np. błysk całego pola albo liczby „Trafienia”) albo zapis w §5, że błysk oznacza miejsce dotknięcia

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-128"></a>

### F4-128. Brak powodu blokady zatwierdzenia odpowiedzi

- Zakres: `platforma`.
- Ślad źródłowy: [F2:SZ2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L781).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Szacowanie.tsx:157`, `:154`
- Źródło reguły: `DESIGN.md` §4 („Każdy stan, który coś blokuje, tłumaczy się podpisem”)
- Propozycja: podpis „Najwyżej 180°” albo `aria-invalid` na `.field`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-129"></a>

### F4-129. Pola wyboru w akcencie zamiast koloru gracza

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KT1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L795).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusTour.tsx:785`, `:802` (komentarz `:810`)
- Źródło reguły: `ZASADY.md` §4 („Kolor gracza, nie czerwień, dla wszystkiego, co jest moje”), `DESIGN.md` §5
- Propozycja: `outlineColor: color(me)` dla pól do sprzedaży i Juwenaliów; dług mówi tekst „Brakuje N zł”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-130"></a>

### F4-130. Własny nagłówek bez wygranych i statusu obserwatora

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KT14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L796).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusTour.tsx:722-765`, `apps/web/src/screens/Game.tsx:85-95`
- Źródło reguły: `ZASADY.md` §4 „Czego gra nie rysuje sama” + własny nagłówek przejmuje zakres
- Propozycja: przekazać `scores` i `seated`; wygrane z pucharem i „+1” w panelu, „Oglądasz” pod nagłówkiem

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-131"></a>

### F4-131. Kości turlają się również przy przesunięciu bez rzutu

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KA2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L797).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusTour.tsx:260-271` (klucz `JSON.stringify(positions)` `:261`); `packages/games/src/kampus-tour.ts:388-392`, `:436-441`
- Źródło reguły: `ZASADY.md` §5 („Animacja ma pokazać, co się właśnie stało”; `dice-tumble` = rzut)
- Propozycja: wyzwalać turlanie zmianą `view.dice` albo zdarzeniem rzutu, jak `last?.roll` w Chińczyku

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-132"></a>

### F4-132. Przeskoki pionka animowane w różny sposób

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KA3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L798).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusTour.tsx:245`; `packages/games/src/kampus-tour.ts:391`, `:569`, `:436`, `:441`
- Źródło reguły: `ZASADY.md` §5 („Ta sama sytuacja … tej samej animacji”)
- Propozycja: przeskok bez kroków dla każdego ruchu, który nie wynika z rzutu (Kolokwium, MPK, karty); marsz tylko po rzucie

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-133"></a>

### F4-133. Podpisy planszy Kampus Tour mają 7-8 px

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KT11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L799).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusTour.tsx:553`, `:597`, `:173`, `:819`
- Źródło reguły: `DESIGN.md` §2 „Typografia”, `AGENTS.md`
- Propozycja: do oceny w przeglądarce; krótsze podpisy, większy krój ceny

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-134"></a>

### F4-134. Podpowiedź wykresu niedostosowana do dotyku

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KS1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L800).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusSummary.tsx:133-140`
- Źródło reguły: `DESIGN.md` §4 (stan czytelny), komentarz `:88`
- Propozycja: `onPointerDown` ustawia `hover`, bez czyszczenia w `pointerleave` dla dotyku

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-135"></a>

### F4-135. Akcje środka planszy dublują akcje podsumowania

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KS2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L801).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusSummary.tsx:74`, `apps/web/src/games/KampusTour.tsx:968`
- Źródło reguły: `DESIGN.md` §5 („Akcent jest rzadki”)
- Propozycja: `actions` na środku planszy tylko przy `summaryHidden`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-136"></a>

### F4-136. Drobny tekst podsumowania Kampus Tour

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KS3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L802).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusSummary.tsx:120`, `:145`, `:150`, `:153`, `:172`, `:190`
- Źródło reguły: `DESIGN.md` §2 „Typografia”
- Propozycja: do oceny w przeglądarce razem z KT11

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-137"></a>

### F4-137. Brak opisu pustych ciekawostek

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F2:KS6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L803).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/KampusSummary.tsx:46-71`
- Źródło reguły: `DESIGN.md` §4 „stan pusty”
- Propozycja: „Za krótka partia na ciekawostki.” w `fg-muted`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-138"></a>

### F4-138. Zablokowany pionek bez wyjaśnienia

- Zakres: `chinczyk`.
- Ślad źródłowy: [F2:C7](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L822).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Chinczyk.tsx:194`, `:213`
- Źródło reguły: `DESIGN.md` §4 („Każdy stan, który coś blokuje, tłumaczy się podpisem”)
- Propozycja: przy dotknięciu nieruchomego pionka krótki tekst, dlaczego nie ma ruchu

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-139"></a>

### F4-139. Niepoprawna forma rysuje ty

- Zakres: `kalambury`.
- Ślad źródłowy: [F2:KL4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L836).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Kalambury.tsx:50`
- Źródło reguły: `ZASADY.md` §4 „Teksty po polsku”
- Propozycja: „rysujesz” u rysującego, „rysuje {nick}” u reszty

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-140"></a>

### F4-140. Odsłonięta litera bez animacji pojawienia

- Zakres: `kalambury`.
- Ślad źródłowy: [F2:KL8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L837).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Kalambury.tsx:56-62`
- Źródło reguły: `ZASADY.md` §5 („Najpierw istniejące: `stone-pop`”)
- Propozycja: odsłonięta litera w `<span key>` z `stone-pop` 0,35 s

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-141"></a>

### F4-141. Zbyt małe podpisy osi wykresu Schultego

- Zakres: `schulte`.
- Ślad źródłowy: [F2:SC2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L871).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Schulte.tsx:172`, `:178`
- Źródło reguły: `DESIGN.md` §2 „Typografia” (ok. 8,3 px przy minimum 11 px)
- Propozycja: 11 jednostek `viewBox` albo mniejsza szerokość `W`, żeby skala była bliska 1

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-142"></a>

### F4-142. Podgląd Koloru liter może ucinać odpowiedzi

- Zakres: `stroop`.
- Ślad źródłowy: [F2:ST1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L880).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Stroop.tsx:30`, `apps/web/src/games/Quiz.tsx:145` (okno `apps/web/src/screens/ui.tsx:297`, `overflow-hidden`)
- Źródło reguły: `ZASADY.md` §4 (360×640), `DESIGN.md` §3.3
- Propozycja: `flex-wrap justify-center` w `QuizPreview` albo trzy odpowiedzi w podglądzie; do potwierdzenia

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-143"></a>

### F4-143. Instrukcja pomija plansze ze zgodnym słowem i kolorem

- Zakres: `stroop`.
- Ślad źródłowy: [F2:ST2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L881).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Stroop.tsx:22` (wobec `KONCEPT.md` §2.4, `packages/games/src/stroop.ts:8`)
- Źródło reguły: `ZASADY.md` §4 (tekst mówi prawdę o grze)
- Propozycja: „Wybierz kolor liter, nie znaczenie słowa (zwykle się różnią)”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-144"></a>

### F4-144. Podgląd Koła inline zamiast komponentu Preview

- Zakres: `kolo`.
- Ślad źródłowy: [F2:KO4](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L895).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Kolo.tsx:153-168`
- Źródło reguły: `ZASADY.md` §4 („mały komponent `Preview` w pliku gry”)
- Propozycja: wynieść do `function Preview()`, wysokość jak w innych podglądach SVG

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-145"></a>

### F4-145. Licznik Odcienia poza wspólnym Stats

- Zakres: `kolor`.
- Ślad źródłowy: [F2:OD1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L904).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Kolor.tsx:144-147` (użyte `:153`, `:164`, `:186`)
- Źródło reguły: `DESIGN.md` §5 („Liczby nad polem gry to zawsze pasek `Stats`”), W-01
- Propozycja: `Stats` z „Kolor 1/5”; w solo próbka `h-24` zamiast `h-28`, żeby faza suwaków dalej się mieściła

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-146"></a>

### F4-146. Klawiatura Sudoku aktywna bez wybranego pola

- Zakres: `sudoku`.
- Ślad źródłowy: [F2:SU2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L923).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Sudoku.tsx:166-177`, `:72`, `:81`
- Źródło reguły: `DESIGN.md` §4 (nieaktywny 40% z podpisem)
- Propozycja: klawiatura `disabled` bez wybranego pola i podpis „Wybierz puste pole”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-147"></a>

### F4-147. Wibracja 30 ms metronomu bez wiersza w tabeli

- Zakres: `rytm`.
- Ślad źródłowy: [F2:RY3](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L962).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Rytm.tsx:70`; `ZASADY.md` §5 tabela wibracji; `ZASADY-GIER.md` :317
- Źródło reguły: `ZASADY.md` §5, D-13 (luka między źródłami)
- Propozycja: wiersz „uderzenie metronomu w Rytmie (część bodźca): 30” albo przypis pod tabelą

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-148"></a>

### F4-148. Niepoprawna forma Dotknij symbol

- Zakres: `inny`.
- Ślad źródłowy: [F2:IN2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L971).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Inny.tsx:49`
- Źródło reguły: `ZASADY.md` §4 „Teksty po polsku”
- Propozycja: „Dotknij symbolu, który się różni”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-149"></a>

### F4-149. Czterocyfrowy błąd Mapy w wąskiej kolumnie

- Zakres: `mapa`.
- Ślad źródłowy: [F2:MP1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L990).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Mapa.tsx:109` (B-68)
- Źródło reguły: W-07, `ZASADY.md` §4 (360×640)
- Propozycja: powyżej 999 zapis „1k” albo „999+”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-150"></a>

### F4-150. Werdykt Balonu ucinany przed końcem animacji

- Zakres: `balon`.
- Ślad źródłowy: [F2:BL5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1004).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Balon.tsx:16`, `:154-157` (`PAUSE_MS` 0,8 s, `float-up` 1,6 s)
- Źródło reguły: `ZASADY.md` §5 tabela („pływająca liczba 1,6 s”)
- Propozycja: stan „ostatni wynik” niezależny od fazy albo krótsza animacja wpisana do tabeli

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-151"></a>

### F4-151. Długi wiersz wyniku Zakupów

- Zakres: `zakupy`.
- Ślad źródłowy: [F2:ZK5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1033).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/Zakupy.tsx:83` (`Scores`, `apps/web/src/screens/ui.tsx:148-152`)
- Źródło reguły: `ZASADY.md` §4 (teksty krótkie, 360×640)
- Propozycja: w `Scores` „8 pkt · 12,3 s”, trafienia i błędy na półce albo w drugim wierszu

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-152"></a>

### F4-152. Tabela głosowania wymaga przewijania poziomego

- Zakres: `panstwa-miasta`.
- Ślad źródłowy: [F2:PM2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1048).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/games/PanstwaMiasta.tsx:275-276` (`minWidth: players × 6rem`, `overflow-x-auto`, komentarz `:254`)
- Źródło reguły: `ZASADY.md` §4 („bez poziomego przewijania; … nie ma stałych pikseli”)
- Propozycja: przy 4+ graczach układ transponowany (gracz w wierszu, jedna kategoria naraz), bez `minWidth`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-153"></a>

### F4-153. Suma punktów turnieju może się zawijać

- Zakres: `turniej`.
- Ślad źródłowy: [F2:TU1](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1058).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Game.tsx:448`
- Źródło reguły: `ZASADY.md` §4 (360×640), `DESIGN.md` §5
- Propozycja: `w-16 whitespace-nowrap` albo „pkt” w nagłówku kolumny; do potwierdzenia

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-154"></a>

### F4-154. Zbędna tabela punktów w turnieju solo

- Zakres: `turniej`.
- Ślad źródłowy: [F2:TU2](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1059).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Game.tsx:426-453` wobec `apps/web/src/screens/Setup.tsx:115`
- Źródło reguły: `DESIGN.md` §4 („stan pusty jednym zdaniem”)
- Propozycja: w solo bez tabeli albo „Rozegrane gry: N/M”

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-155"></a>

### F4-155. Brak powodu blokady przycisków liczby gier

- Zakres: `turniej`.
- Ślad źródłowy: [F2:TU5](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1060).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Setup.tsx:131-133`, `:143`
- Źródło reguły: `DESIGN.md` §4 (nieaktywny z podpisem)
- Propozycja: zdanie przy granicy („Najmniej 3 gry”, „Więcej gier nie ma: reszta wykluczona”)

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-156"></a>

### F4-156. Turniej powiela przyklejony pasek akcji

- Zakres: `turniej`.
- Ślad źródłowy: [F2:TU6](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1061).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Setup.tsx:209-215` (`StartBar` w `apps/web/src/screens/Lobby.tsx:211` to już `StickyBar`)
- Źródło reguły: `ZASADY.md` §4 („przy długiej treści `StickyBar`”, wspólne zamiast kopii)
- Propozycja: `StickyBar` z linią podsumowania (prop `note`) albo `StartBar` z `children`

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-157"></a>

### F4-157. Tytuł ustawień turnieju niespójny z ekranem gry

- Zakres: `turniej`.
- Ślad źródłowy: [F2:TU8](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L1062).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S; dla wymiarów, dotyku, czytników i reduced motion ograniczenia F2 §9; potwierdzenie w 04-02.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `apps/web/src/screens/Setup.tsx:111` wobec `apps/web/src/screens/Setup.tsx:29`
- Źródło reguły: `DESIGN.md` §2 typografia, §5 („Podpis to `.label`”)
- Propozycja: kafel jak w `Setup`: ikona `Trophy`, „Turniej”, „1-6 osób” mono

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-158"></a>

### F4-158. Sufit osiągalny bez rozstrzygnięcia remisu

- Zakres: `w-pamieci`, `kubki`, `simon`.
- Ślad źródłowy: [F3:R3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L285).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **wysoka**; wysoka warunkowo dla kompletu W pamięci; pozostałe gry średnia, brak partii potwierdzających sufit.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: D-05, D-09 (sufit osiągalny przez dobrego gracza bez `tie` albo z `tie`, które prawie zawsze daje równość); `KONCEPT.md` §2.4 (rekordy: przy całkiem równych wyżej wcześniejszy).
- Waga: **wysoka warunkowo** (W pamięci, jeśli partie pokażą, że 12 pada), inaczej średnia.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `w-pamieci` (B-WP2) | `packages/games/src/w-pamieci.ts:4`, `:82-84`; `ZASADY-GIER.md` :437 | 12 rund, ostatnia 13 działań w 21,8 s; przy komplecie `diff` = 0 u wszystkich | wysoka, jeśli 12 pada | wolniejszy przyrost długości po rundzie 12 i więcej rund (20 rund wprost daje T ok. 560 s) albo `tie` przy komplecie = czas odpowiedzi w ostatniej rundzie | sprawdzić w partii, potem zmienić | A |
| `kubki` (B-KB1) | `packages/games/src/kubki.ts:4`, `:70`; `ZASADY-GIER.md` :264 | 20 rund, ostatnia 23 zamiany po 150 ms; wynik 0-20 bez `tie` | średnia | rundy bez górnej granicy z tą samą krzywą (np. 40, limit przeliczyć) albo `tie` = czas wskazania w rundzie z pomyłką | sprawdzić w partii | A |
| `simon` (B-SQ2) | `packages/games/src/simon.ts:41`; `ZASADY-GIER.md` :76-78 | serie dobrych 15-20, wynik całkowity bez `tie` | średnia | `tie` = czas wpisywania ostatniej serii albo zapis w `ZASADY-GIER.md`, że remis rozstrzyga data | sprawdzić w partii | A |

- Wspólna propozycja: reguła w `ZASADY.md` §3, że gra z sufitem osiągalnym ma `tie` albo nie ma sufitu (§12). W Turnieju częste remisy w tych grach spłaszczają tabelę (03-04, A).

Uzgodnienie faz: Wysoka waga dotyczy wyłącznie W pamięci i jest warunkowa: potrzebne partie z kompletem 12. Kubki i Sekwencja zachowują średnią. Brak danych o częstości remisów; lokalne 9 wyników Za zasłoną nie odpowiada na to pytanie.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-159"></a>

### F4-159. Sufit w zasięgu najlepszych, `tie` mierzy co innego

- Zakres: `wieza`, `zakupy`.
- Ślad źródłowy: [F3:R4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L297).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: D-05 (sufit blisko praktycznego maksimum). Różnica wobec R3: `tie` rozstrzyga (wynik ciągły), ale na szczycie gra mierzy coś innego niż w opisie.
- Waga: **średnia**.

| gra | miejsce | liczby fazy 3 | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `wieza` (B-WZ1) | `packages/games/src/wieza.ts:4`, `:12`, `:98` | σ 20 ms: 94,5% partii na 30 piętrach; σ 30 ms: 11% (Z) | średnia | 50 pięter (limit 180 s wystarcza: 50 × 3 s) albo `SPEED_STEP` 0,05; po zmianie przeliczyć symulację (`03-08-FINDINGS.md`, załącznik) | zmienić | Z, A (σ człowieka) |
| `zakupy` (B-ZK2) | `packages/games/src/zakupy.ts:5-6`, `:81` | 10 z 10 dla większości (A); na szczycie decyduje czas klikania (pomiar F2:ZK1) | średnia | jeśli 10 pada często: lista 12-14 albo podobne przedmioty na półce | sprawdzić w partii | A |

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-160"></a>

### F4-160. Przewaga kolejności w grach głównych

- Zakres: `kampus-tour`, `piec-w-rzedzie`, `labirynt`, `statki`, `memory`.
- Ślad źródłowy: [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: kryterium 5 roadmapy, `KONCEPT.md` §9; D-09 (przewaga bez kompensaty = średnia; rotacja przy rewanżu to kompensata). Nazwa klucza historyczna: w Kampus Tour i Labiryncie wygrywa ostatni.
- Waga: **średnia** (Kampus Tour i Labirynt przy 3-4 os.: rotacja wyrównuje dopiero po 3-4 partiach).

| gra | miejsce | liczby fazy 3 (Z, boty) | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| `kampus-tour` (B-KT1) | `packages/games/src/kampus-tour.ts:8` (`SEAT_BONUS`), `:505`; `ZASADY-GIER.md` :671 | 4 os.: 20,7 / 22,4 / 25,8 / 31,0%; 3 os.: 29,2 / 32,2 / 38,3% | średnia | premia 10 zł za miejsce zamiast 20; przed zmianą zapisać wygrane według miejsca w partiach | sprawdzić w partii, potem zmienić | Z |
| `labirynt` (B-LB1) | `packages/games/src/labirynt.ts:138`; `ZASADY-GIER.md` :834-835 | 3-4 os.: ostatni 35-54%, pierwszy 14-23%; 2 os. Klasyczny 58% | średnia (3-4 os.) / niska (2 os.) | przy 3-4 os. zaczyna losowy gracz albo pierwsi dostają +1 ściankę | sprawdzić w partii | Z, A |
| `piec-w-rzedzie` (B-GO1) | setup (tura od `players[0]`); `ZASADY-GIER.md` :570-571 | teoria: pierwszy wygrywa przy idealnej grze | niska (rotacja) | przy przewadze wyraźnie ponad 60%: swap po trzech kamieniach | sprawdzić w partii | A |
| `memory` (B-ME1) | `packages/games/src/memory.ts:56`; `ZASADY-GIER.md` :754 | pełna pamięć, Mała 3 os.: 13,7 / 43,3 / 34,0%; przy 6 kartach równo | niska | jeśli partie potwierdzą: w Małej przy 3+ os. zaczyna losowy gracz | sprawdzić w partii | Z, A |
| `statki` (B-ST1) | bitwa od `players[0]`; `ZASADY-GIER.md` :592 | zaczynający 50,8-54,5% | niska | brak zmian; Flota wojenna do obserwacji | zostawić | Z |

Uzgodnienie faz: Boty stanowią sygnał zależny od strategii, nie dowód przewagi u ludzi. Twierdzenie źródłowe o teoretycznej przewadze w Gomoku nie było w 04-01 ponownie weryfikowane literaturą; przed wyborem wariantu odwołać się do źródła pierwotnego w 04-02 albo oprzeć decyzję na partiach.

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-161"></a>

### F4-161. `withSum` wyrównuje sumę, ale nie szanse

- Zakres: `balon`.
- Ślad źródłowy: [F3:R7](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L329).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :100 („tyle samo do zdobycia”); `03-02-BASELINE.md` §3.1 (czego `withSum` nie gwarantuje).
- Waga: **średnia**.

| gra | miejsce | liczby fazy 3 | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|
| `balon` (B-BL1) | `packages/games/src/balon.ts:53` | suma 155 stała, ale „stop na 10” daje 50-100 pkt (12%), „stop na 15” 45-120 (16%), najlepsza stała strategia po fakcie 72-126 (10%) | stały komplet 10 wytrzymałości o sumie 155, tasowany co partię (wzorzec Tortu) | zmienić | Z |

- Przytrzymaj i Za zasłoną też używają `withSum`; przy błędzie liniowym (prawo skalarne) stała suma wystarcza (rozrzut 5% i 0%, Z). Ten sam stały komplet byłby tam potrzebny, tylko gdyby partie pokazały wpływ rozkładu.
- Do dokumentu: w `ZASADY.md` §3 dopisać, że w grze z ryzykiem (decyzja „stop”) stała suma nie wystarcza, potrzebny jest stały komplet (§12).

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-162"></a>

### F4-162. Limit mini-gry odnawiany wynikiem rywala

- Zakres: `platforma`.
- Ślad źródłowy: [F3:R8](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L340).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Źródło: `ZASADY.md` §3 :106, `KONCEPT.md` §3 (limit po ekranie instrukcji). Waga: **niska** (dotyczy tylko gry wieloosobowej; ocena zapasu w §5 liczy przypadek solo).

| miejsce | liczby fazy 3 | propozycja | rekomendacja | pewność |
|---|---|---|---|---|
| `apps/server/src/LobbyRoom.ts:375-376` (B-PL1); stały `key`: `packages/games/src/balon.ts:45`, `packages/games/src/kropki.ts:52`, `packages/games/src/kat.ts:45`, `packages/games/src/sudoku.ts:86`, `packages/games/src/rok.ts:216`, `packages/games/src/schulte.ts:37`, `packages/games/src/wieza.ts:72`; `packages/games/src/kolo.ts:154` (`key` po `waiting`) | w 23 mini-grach (22 bez `turn()` i Narysuj koło) oddanie wyniku przez rywala daje reszcie pełny limit od nowa (Refleks do 2 × 60 s), w 7 ze stałym `key` nie (Balon zawsze 120 s) | stały `key` dla wszystkich mini-gier (jeden limit od startu), zapis w `KONCEPT.md` §3 | zmienić (tanio) | W |

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-163"></a>

### F4-163. Bilet MPK domyka około jednej trzeciej kompletów

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F3:B-KT3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L351).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **średnia**; wpływ na spójność interakcji, porównywalność albo brak obowiązkowego testu; uzasadnienie szczegółowe i wagi wystąpień poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:530` (`travel`); `ZASADY-GIER.md` :713-715
- Źródło reguły: `KONCEPT.md` §9 (MPK jako darmowy komplet)
- Dowód i propozycja: MPK daje 30-38% kompletów (279-454 na 1000 partii); opcje: jazda nie może kupić pola domykającego komplet, jazda kosztuje (np. 15 zł), albo bilet tylko na pola specjalne
- Rekomendacja źródła (nie decyzja): sprawdzić w partii
- Pewność źródła: Z

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-164"></a>

### F4-164. Monopole zawsze zawierają grupę dwupolową w symulacji

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F3:B-KT2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L352).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `packages/games/src/kampus-tour.ts:366-370`; `KONCEPT.md` §9
- Źródło reguły: `KONCEPT.md` §9 (grupy dwupolowe)
- Dowód i propozycja: monopol 0,2-1% partii, 33 z 33 z grupą dwupolową; zostawić, dopisać odpowiedź w §9; jeśli w partiach częściej niż raz na kilka gier: grupa dwupolowa jako pół
- Rekomendacja źródła (nie decyzja): zostawić
- Pewność źródła: Z

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-165"></a>

### F4-165. Długość Kampus Tour wymaga partii z zegarem

- Zakres: `kampus-tour`.
- Ślad źródłowy: [F3:B-KT6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L355).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: nie dla wariantu zachowującego zasady punktacji i przebieg; nowe odstępstwo od reguł platformy wymaga decyzji i dokumentu.

- Lokalizacja: `KONCEPT.md` §2.1; `apps/web/src/games/KampusTour.tsx:206-207`
- Źródło reguły: `KONCEPT.md` §2.1 (45 min)
- Dowód i propozycja: szacunek 26-41 min przy 4 os.; przy przekroczeniu 16-18 rund albo krótszy `STEP_MS`
- Rekomendacja źródła (nie decyzja): sprawdzić w partii
- Pewność źródła: A

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-166"></a>

### F4-166. Litera Ł daje słabszą rundę Państw-miast

- Zakres: `panstwa-miasta`.
- Ślad źródłowy: [F3:B-PM2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L356).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/panstwa-miasta.ts:6`
- Źródło reguły: kryterium 5 roadmapy
- Dowód i propozycja: usunąć Ł z `LETTERS` (brak państwa) albo zapisać w `ZASADY-GIER.md` jako znaną słabszą rundę
- Rekomendacja źródła (nie decyzja): zostawić albo zmienić (tanio)
- Pewność źródła: W

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-167"></a>

### F4-167. Mały udział punktów za rysowanie przy dwóch osobach

- Zakres: `kalambury`.
- Ślad źródłowy: [F3:B-KA1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L357).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/kalambury.ts:24` (`GUESS_POINTS`), `:26` (`DRAWER_POINTS`); `ZASADY-GIER.md` :817
- Źródło reguły: kryterium 5 roadmapy
- Dowód i propozycja: rysujący 3 pkt × (n − 1); przy 2 os. rozważyć 5 pkt
- Rekomendacja źródła (nie decyzja): sprawdzić w partii
- Pewność źródła: W

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

<a id="f4-168"></a>

### F4-168. Parzysta długość turnieju zwiększa liczbę dogrywek

- Zakres: `turniej`.
- Ślad źródłowy: [F3:B-TU1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L358).
- Aktualność: pliki dowodowe bez zmian od audytu; status decyzji: **oczekuje**.
- Waga rejestru: **niska**; ograniczony skutek: opis, czytelność, dostępność, współdzielenie albo przypadek brzegowy; szczegóły poniżej.
- Pewność: S + W/Z/A zgodnie z tabelą lub uwagą poniżej; wpływ na ludzi i boty nie są równoważne, otwarte pomiary w §7.
- Zmiana zasad: tak w wariancie zmiany zachowania (wynik, losowanie, limit, walidacja, ranking lub balans); wariant dokumentacyjny wymaga powodu.

- Lokalizacja: `packages/games/src/turniej.ts:6` (`DEFAULT_LENGTH` 8); `ZASADY-GIER.md` :775
- Źródło reguły: kryterium 5 roadmapy
- Dowód i propozycja: domyślnie 7 albo 9 gier: przy 2 graczach dogrywka 0% zamiast 27,5%
- Rekomendacja źródła (nie decyzja): zmienić (tanio) albo zostawić
- Pewność źródła: Z

Wariant pozostawienia albo odrzucenia wymaga decyzji z powodem; przygotowanie wariantów i ocena konsekwencji: 04-02.

## 5. Aliasy F3 i istniejące odstępstwa

### 5.1. Pełne 44 aliasy częściowe B-*

Każdy alias ma jeden właścicielski wpis, mimo powtórzeń w macierzach, pytaniach i przekazaniach. Aliasy F1 i F2 (np. W7a, GM-2 = KT12) pozostają przy wystąpieniach w §4; ich właścicielami są źródła kanoniczne z §3.

| Alias | Wpis kanoniczny źródła | F4 |
|---|---|---|
| F3:B-BL1 | [F3:R7](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L329) | [F4-161](#f4-161) |
| F3:B-DZ1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-GO1 | [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | [F4-160](#f4-160) |
| F3:B-KA1 | [F3:B-KA1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L357) | [F4-167](#f4-167) |
| F3:B-KAT1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-KB1 | [F3:R3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L285) | [F4-158](#f4-158) |
| F3:B-KB2 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-KR1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-KT1 | [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | [F4-160](#f4-160) |
| F3:B-KT2 | [F3:B-KT2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L352) | [F4-164](#f4-164) |
| F3:B-KT3 | [F3:B-KT3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L351) | [F4-163](#f4-163) |
| F3:B-KT4 | [F3:B-KT4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L353) | [F4-023](#f4-023) |
| F3:B-KT5 | [F3:B-KT5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L354) | [F4-030](#f4-030) |
| F3:B-KT6 | [F3:B-KT6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L355) | [F4-165](#f4-165) |
| F3:B-LB1 | [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | [F4-160](#f4-160) |
| F3:B-LC1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-LT1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-ME1 | [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | [F4-160](#f4-160) |
| F3:B-OB1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-PL1 | [F3:R8](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L340) | [F4-162](#f4-162) |
| F3:B-PM1 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-PM2 | [F3:B-PM2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L356) | [F4-166](#f4-166) |
| F3:B-RF1 | [F3:R6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L318) | [F4-117](#f4-117) |
| F3:B-RK1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-RK2 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-RY1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-SJ1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-SJ2 | [F3:R6](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L318) | [F4-117](#f4-117) |
| F3:B-SL1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-SL2 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-SP1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-SQ1 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-SQ2 | [F3:R3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L285) | [F4-158](#f4-158) |
| F3:B-SR1 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-ST1 | [F3:R5](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L306) | [F4-160](#f4-160) |
| F3:B-SU1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-TO1 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-TU1 | [F3:B-TU1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L358) | [F4-168](#f4-168) |
| F3:B-WP1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |
| F3:B-WP2 | [F3:R3](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L285) | [F4-158](#f4-158) |
| F3:B-WZ1 | [F3:R4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L297) | [F4-159](#f4-159) |
| F3:B-ZK1 | [F3:R1](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L243) | [F4-002](#f4-002) |
| F3:B-ZK2 | [F3:R4](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L297) | [F4-159](#f4-159) |
| F3:B-ZS1 | [F3:R2](../03-audyt-balansu-rekord-w-i-trudno-ci/FINDINGS.md#L260) | [F4-003](#f4-003) |

### 5.2. Odstępstwa F1 (14)

Każdy wiersz zachowuje powód i lokalizacje. Status: istniejący zapis audytu, nie nowa zgoda na odstępstwo; ewentualna sprzeczność i powiązane otwarte wpisy pozostają do decyzji. Rekomendacja „zostawić” nie zamyka żadnego F4.

| Źródło / status | Odstępstwo i powód | Powiązanie F4 / dalszy krok |
|---|---|---|
| [F1:O01](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L371); zachowane z powodem, bez nowego F4 | `playerView` zwraca cały stan, wyzwanie widoczne od startu (`ponytail:` w kodzie); wszystkie 30 mini-gier (jawnie: `packages/games/src/balon.ts:36-37` wytrzymałości, `packages/games/src/zakupy.ts:47-48` lista, `sudoku` `solution`); `ZASADY-GIER.md` §1 :53-54 („między znajomymi”), Sudoku :553 | bez nowej rozbieżności; 04-02 |
| [F1:O02](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L372); zachowane z powodem, bez nowego F4 | wynik albo pomiar liczony na kliencie, serwer odrzuca nierealne wartości; simon, stoper, stoj, rytm, przytrzymaj, zaslona, schulte, sudoku, wieza, stroop, liczenie, inny, obrot, literowka, dziesiatki; `ZASADY-GIER.md` §1 :57-58 | bez nowej rozbieżności; 04-02 |
| [F1:O03](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L373); zachowane z powodem, bez nowego F4 | wynik Koła z punktów, które klient może wygenerować; kolo (`packages/games/src/kolo.ts:104`); `ponytail:` w kodzie, §1 :57-58 | bez nowej rozbieżności; 04-02 |
| [F1:O04](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L374); zachowane z powodem, bez nowego F4 | `timeoutMove` = najlepszy krok, nie ruch neutralny ani losowy; labirynt (`packages/games/src/labirynt.ts:186-191`); `ZASADY-GIER.md` §10 :844 („losowości w grze nie ma”). **Uwaga do fazy 4:** gracz, który się nie rusza, idzie najkrótszą drogą i może tak wygrać, a `rng` jest dostępny | bez nowej rozbieżności; 04-02 |
| [F1:O05](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L375); zachowane, weryfikacja wariantu w 04-02 | `timeoutMove` kończy próby zamiast dawać najgorszy wynik; limit od nowa, gdy ktoś skończy próby; kolo (`packages/games/src/kolo.ts:150-157`); `ZASADY-GIER.md` :118, :121-122 (powód wynika z zasady: oddane próby są prawdziwymi wynikami; wprost niezapisany) | [F4-162](#f4-162) |
| [F1:O06](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L376); zachowane z powodem, bez nowego F4 | kara punktowa (−2) zamiast blokady 1 s; stoj; `ZASADY-GIER.md` :225-226 („blokada zjadałaby kolejne bodźce”) | bez nowej rozbieżności; 04-02 |
| [F1:O07](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L377); zachowane z powodem, bez nowego F4 | kara punktowa obok blokady; obrot, literowka; `ZASADY-GIER.md` :354-355, :362, :369 („druga próba przy dwóch odpowiedziach byłaby darmowa”) | bez nowej rozbieżności; 04-02 |
| [F1:O08](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L378); zachowane z powodem, bez nowego F4 | jedyna gra z dźwiękiem; rytm; `KONCEPT.md` :26, `ZASADY-GIER.md` :315 | bez nowej rozbieżności; 04-02 |
| [F1:O09](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L379); zachowane z powodem, bez nowego F4 | brak `nonce` (partie odróżniają cele); przytrzymaj, zaslona; `ZASADY-GIER.md` :400-401, :508 | bez nowej rozbieżności; 04-02 |
| [F1:O10](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L380); zachowane z powodem, bez nowego F4 | `progress` od klienta może spaść albo skoczyć (tylko podgląd); kropki, kat, rok, wieza; `ZASADY-GIER.md` :155, :169, :183, :289-290 | bez nowej rozbieżności; 04-02 |
| [F1:O11](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L381); zachowane z powodem, bez nowego F4 | strefa akceptacji w px, nie w %; srodek; `ZASADY-GIER.md` :198 (dotyczy palca) | bez nowej rozbieżności; 04-02 |
| [F1:O12](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L382); zachowane z powodem, bez nowego F4 | zniekształcenie rysunku mapy do 6%; mapa (`packages/games/src/mapa.ts:14-15`); `ZASADY-GIER.md` :381-382 | bez nowej rozbieżności; 04-02 |
| [F1:O13](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L383); zachowane z powodem, bez nowego F4 | plansza zależy od wyborów gracza; dziesiatki; `ZASADY-GIER.md` :452-453 (zawsze jest para, dostawy wspólne) | bez nowej rozbieżności; 04-02 |
| [F1:O14](../01-audyt-zasad-test-w-i-podpi-cia/FINDINGS.md#L384); zachowane, weryfikacja wariantu w 04-02 | premia za miejsce przy stole (`SEAT_BONUS`); kampus-tour (`packages/games/src/kampus-tour.ts:7-8`); `ZASADY-GIER.md` :671 (start dalej od `players[0]`, więc nie odstępstwo od §3) | [F4-160](#f4-160) |


### 5.3. Odstępstwa F2 (33)

Każdy wiersz zachowuje powód i lokalizacje. Status: istniejący zapis audytu, nie nowa zgoda na odstępstwo; ewentualna sprzeczność i powiązane otwarte wpisy pozostają do decyzji. Rekomendacja „zostawić” nie zamyka żadnego F4.

| Źródło / status | Odstępstwo i powód | Powiązanie F4 / dalszy krok |
|---|---|---|
| [F2:O01](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L650); zachowane z powodem, bez nowego F4 | własny układ poziomy (`.landscape`, scena ze `zoom`), bez `Screen` i `StickyBar`; `kampus-tour`: `apps/web/src/games/KampusTour.tsx:717-721`, `apps/web/src/index.css:177-191`; `DESIGN.md` §6 (B-34) | bez nowej rozbieżności; 04-02 |
| [F2:O02](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L651); zachowane, weryfikacja wariantu w 04-02 | własny nagłówek (status, runda, licznik na środku, panele graczy z gotówką zamiast `Stats`); `kampus-tour`: `apps/web/src/games/KampusTour.tsx:722-765`, `:850-860`, `apps/web/src/screens/Game.tsx:83-97`; `ZASADY.md` §4, `DESIGN.md` §6; braki zakresu: U8, U9, A8, KT14 | [F4-097](#f4-097), [F4-098](#f4-098), [F4-082](#f4-082), [F4-130](#f4-130) |
| [F2:O03](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L652); zachowane, weryfikacja wariantu w 04-02 | własny nagłówek z punktami zamiast `Stats`; `panstwa-miasta`: `apps/web/src/games/PanstwaMiasta.tsx:28-63`; `kalambury`: `apps/web/src/games/Kalambury.tsx:47-85`; `apps/web/src/screens/Game.tsx:179`, `:232`; `DESIGN.md` §6; `ZASADY.md` §4 wymienia tylko Państwa-miasta i Kampus Tour (lista do uzupełnienia o Kalambury, §7) | [F4-097](#f4-097) |
| [F2:O04](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L653); zachowane z powodem, bez nowego F4 | kolory grup pól; `kampus-tour`: `apps/web/src/games/KampusTour.tsx:84` (`GROUP_COLORS`, ikona grupy `:86`); `DESIGN.md` §6 | bez nowej rozbieżności; 04-02 |
| [F2:O05](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L654); zachowane z powodem, bez nowego F4 | cień pod oknami i pionkami, cień w `set-glow`; `apps/web/src/games/KampusTour.tsx:650`, `:987`, `:1033`, `:1073`, `:519`, `:803`, `apps/web/src/games/KampusSummary.tsx:41`, `apps/web/src/index.css:200`; `DESIGN.md` §2, §6 | bez nowej rozbieżności; 04-02 |
| [F2:O06](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L655); zachowane, weryfikacja wariantu w 04-02 | przyciski budowy 44 px (z „Pomiń” w rzędzie); `apps/web/src/games/KampusTour.tsx:897`, `:906`; `DESIGN.md` §6 | [F4-093](#f4-093) |
| [F2:O07](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L656); zachowane z powodem, bez nowego F4 | obrys przez `box-shadow: inset 0 0 0 Npx` / `0 0 0 2px` (to nie cień); `apps/web/src/games/KampusTour.tsx:174`, `apps/web/src/games/Chinczyk.tsx:242`, `:248`, `apps/web/src/games/Sudoku.tsx:156`, `apps/web/src/games/Zakupy.tsx:165`; `02-01-CHECKS.md` §3 | bez nowej rozbieżności; 04-02 |
| [F2:O08](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L657); zachowane z powodem, bez nowego F4 | mieszanki tokenów (`color-mix`) i odcienie OKLCH z koloru gracza; `apps/web/src/games/KampusTour.tsx:89-90`, `:174`, `:778`, `:788`, `:801`; `apps/web/src/games/Chinczyk.tsx:44-46`, `:151-155`; `apps/web/src/games/PiecWRzedzie.tsx:56`; pochodne tokenów i `PLAYER_COLORS`, nie nowe kolory (D-04) | bez nowej rozbieżności; 04-02 |
| [F2:O09](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L658); zachowane, weryfikacja wariantu w 04-02 | trafienie i zatopiony statek w `accent`; `statki`: `apps/web/src/games/Statki.tsx:174`, `:390`, `:396`, `:165`; `DESIGN.md` §6 (strefa zakazana i duch nie są objęte: U7) | [F4-096](#f4-096) |
| [F2:O10](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L659); zachowane z powodem, bez nowego F4 | zamiana plansz po pudle dopiero po `SWAP_MS` 1200 ms; `statki`: `apps/web/src/games/Statki.tsx:47`, `:73`, `:101`, `apps/web/src/index.css:354-358`; `ZASADY.md` §5 („Wyjątek: Statki…”) | bez nowej rozbieżności; 04-02 |
| [F2:O11](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L660); zachowane, weryfikacja wariantu w 04-02 | tryb Szybki Chińczyka: krok 110 ms, rzut 400 ms; `chinczyk`: `apps/web/src/games/Chinczyk.tsx:53-54`; `KONCEPT.md` §2.3a („szybsze animacje”); wiersz do tabeli §5 (§7) | [F4-107](#f4-107) |
| [F2:O12](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L661); zachowane z powodem, bez nowego F4 | emoji jako symbole kart; `memory`: `apps/web/src/games/Memory.tsx:17-36`; treść gry, jedno źródło | bez nowej rozbieżności; 04-02 |
| [F2:O13](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L662); zachowane z powodem, bez nowego F4 | paleta Kalamburów (`#facc15`, `#4ade80`, `#60a5fa`, `#b4763a`), biały i gumka z `fg` / `surface`; `kalambury`: `apps/web/src/games/Kalambury.tsx:21-28`; D-04 | bez nowej rozbieżności; 04-02 |
| [F2:O14](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L663); zachowane z powodem, bez nowego F4 | `--ambient` zawsze w kolorze rysującego; `kalambury`: `apps/web/src/screens/Game.tsx:53-54`; `DESIGN.md` §1 p. 1 | bez nowej rozbieżności; 04-02 |
| [F2:O15](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L664); zachowane, weryfikacja wariantu w 04-02 | odznaka turnieju prostokątna; `turniej`: `apps/web/src/screens/ui.tsx:125` (`square`); `ZASADY.md` §4 (promień 4 px: U22) | [F4-111](#f4-111) |
| [F2:O16](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L665); zachowane z powodem, bez nowego F4 | ukryty pasek limitu u grającego, brak licznika sekund; `stoper`, `rytm`, `przytrzymaj`, `zaslona`: `apps/web/src/screens/Game.tsx:208-210`, `apps/web/src/games/Rytm.tsx:146`, `apps/web/src/games/Przytrzymaj.tsx:204`, `apps/web/src/games/Zaslona.tsx:161`; `KONCEPT.md` §2.4, `ZASADY-GIER.md` :83, :315-316, :406-407, :516-517 | bez nowej rozbieżności; 04-02 |
| [F2:O17](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L666); zachowane z powodem, bez nowego F4 | klik metronomu (WebAudio), jedyny dźwięk; `rytm`: `apps/web/src/games/Rytm.tsx:47-64`; `KONCEPT.md` §1 | bez nowej rozbieżności; 04-02 |
| [F2:O18](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L667); zachowane, weryfikacja wariantu w 04-02 | wibracja 30 przy uderzeniu metronomu; `rytm`: `apps/web/src/games/Rytm.tsx:70`; `KONCEPT.md` §2.4, `ZASADY-GIER.md` :317 (wiersz w tabeli §5: RY3) | [F4-147](#f4-147) |
| [F2:O19](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L668); zachowane z powodem, bez nowego F4 | kolory pól Sekwencji (w tym `#ff2445` równy akcentowi); `simon`: `apps/web/src/games/Simon.tsx:15-20` (do koloru kształt `:14`); `DESIGN.md` §6 | bez nowej rozbieżności; 04-02 |
| [F2:O20](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L669); zachowane z powodem, bez nowego F4 | napisy Koloru liter (`HUES`, ta sama paleta co Sekwencja); `stroop`: `apps/web/src/games/Stroop.tsx:5`, `:26`, `:38`; `DESIGN.md` §6 (wspólna stała dla obu gier byłaby prostsza, nie jest wymagana) | bez nowej rozbieżności; 04-02 |
| [F2:O21](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L670); zachowane z powodem, bez nowego F4 | figury Innego elementu `hsl(...)`; `inny`: `apps/web/src/games/Inny.tsx:22`; `DESIGN.md` §6 | bez nowej rozbieżności; 04-02 |
| [F2:O22](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L671); zachowane z powodem, bez nowego F4 | próbki, tory suwaków i podgląd Odcienia; `kolor`: `apps/web/src/games/Kolor.tsx:20`, `:33-36`, `:47-48`, `:63-64`, `:154`, `:167-168`, `:187`, `:198`; `DESIGN.md` §6 | bez nowej rozbieżności; 04-02 |
| [F2:O23](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L672); zachowane z powodem, bez nowego F4 | `Math.random` w kliencie poza zasadami gry (start suwaków, losowa gra, oczka w trakcie turlania); `apps/web/src/games/Kolor.tsx:13-15`, `apps/web/src/screens/Home.tsx:190`, `apps/web/src/screens/MiniGames.tsx:91`, `apps/web/src/games/KampusTour.tsx:280`, `apps/web/src/games/Chinczyk.tsx:100`; reguła „losowość z `rng`” dotyczy `packages/games` | bez nowej rozbieżności; 04-02 |
| [F2:O24](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L673); zachowane, weryfikacja wariantu w 04-02 | ruch z JS bez `reducedMotion` (ruch jest zadaniem; przy reduced motion gry są grywalne); `kubki` `apps/web/src/games/Kubki.tsx:79-109` (komentarz `:77-78`), `sledzenie` `apps/web/src/games/Sledzenie.tsx:72-88`, `wieza` `apps/web/src/games/Wieza.tsx:74-84`, `zaslona` `apps/web/src/games/Zaslona.tsx:78-91`; wyjątku nie ma jeszcze w §5: B-53 (§3); po dopisaniu zostaje tutaj | [F4-065](#f4-065), [F4-107](#f4-107) |
| [F2:O25](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L674); zachowane z powodem, bez nowego F4 | pokaz Sekwencji z timerów (stany zapalenia 450 ms, nie ozdoba); `simon`: `apps/web/src/games/Simon.tsx:52`, `:61-64`; treść gry; przy reduced motion skraca się tylko przejście 100 ms | bez nowej rozbieżności; 04-02 |
| [F2:O26](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L675); zachowane z powodem, bez nowego F4 | kara punktowa zamiast blokady; `Stats` „Do końca” obok limitu; `stoj`: `apps/web/src/games/Stoj.tsx:135`; `ZASADY-GIER.md` :215, :225-226 | bez nowej rozbieżności; 04-02 |
| [F2:O27](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L676); zachowane z powodem, bez nowego F4 | blokada 1 s po pomyłce (przyciski nieaktywne); `stroop`, `liczenie`, `inny`, `obrot`, `literowka`: `apps/web/src/games/Quiz.tsx:33`, `:195`; `dziesiatki`: `apps/web/src/games/Dziesiatki.tsx:73`; `KONCEPT.md` §2.4 (zasada gry, nie animacja) | bez nowej rozbieżności; 04-02 |
| [F2:O28](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L677); zachowane z powodem, bez nowego F4 | kształty treści (`rounded-[50%]` balonu, `clip-path` kubka, prostokątne klocki, kulki); `apps/web/src/games/Balon.tsx:149`, `apps/web/src/games/Kubki.tsx:31`, `apps/web/src/games/Wieza.tsx:123`, `apps/web/src/games/Sledzenie.tsx:158`; kształt treści gry, nie zaokrąglenie kafla | bez nowej rozbieżności; 04-02 |
| [F2:O29](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L678); zachowane z powodem, bez nowego F4 | ekran końcowy Koła: karty z miniaturami zamiast `Scores`; `kolo`: `apps/web/src/games/Kolo.tsx:236-276`; `KONCEPT.md` §2.4, `ZASADY-GIER.md` („bez osobnej tabeli wyników”); „(ty)”, „gra…”, mono jak w `Scores` | bez nowej rozbieżności; 04-02 |
| [F2:O30](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L679); zachowane z powodem, bez nowego F4 | ikona wyzwania dnia `text-accent` na `accent-soft`, `fill`; `apps/web/src/screens/Home.tsx:146-147`; `DESIGN.md` §2, §3.1 | bez nowej rozbieżności; 04-02 |
| [F2:O31](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L680); zachowane, weryfikacja wariantu w 04-02 | „Dołącz” w akcencie po wpisaniu kodu; `apps/web/src/screens/Home.tsx:241`; `KONCEPT.md` §1, `DESIGN.md` §3.1 (sprzeczność z §5: HM-1) | [F4-066](#f4-066) |
| [F2:O32](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L681); zachowane z powodem, bez nowego F4 | gospodarz bez możliwości startu widzi zdanie zamiast wyszarzonego przycisku; `apps/web/src/screens/Lobby.tsx:218-219`; `DESIGN.md` §4 („samo przygaszenie nie wystarcza”) | bez nowej rozbieżności; 04-02 |
| [F2:O33](../02-audyt-wygl-du-animacji-i-wibracji/FINDINGS.md#L682); zachowane, weryfikacja wariantu w 04-02 | „Zagraj ponownie”, „Pobij”, „Wróć do pokoju”, „Jeszcze raz”, „Wyjdź”, „Gotowe” w Zakupach, „Pokrój” w Torcie; `apps/web/src/screens/Records.tsx:276`, `apps/web/src/screens/Home.tsx:324`, `apps/web/src/screens/Game.tsx:501`, `apps/web/src/games/Zakupy.tsx:175`, `apps/web/src/games/Tort.tsx:182`; nazwane w `KONCEPT.md` §1, §2.4 („Gotowe” w trzech rolach: A17) | [F4-091](#f4-091) |

Uwaga do F1:O04: Labirynt może wygrać samymi najlepszymi krokami po limicie; dotychczasowy powód „brak losowości” nie dowodzi braku alternatywy, skoro dostępny jest `rng`. Przegląd tego istniejącego odstępstwa trafia do 04-02 (osoba: agent przygotowuje wariant, użytkownik decyduje). Nie doliczamy go jako 174. źródła błędu.
F1:O05: powód timeoutu Koła wynika z zasady oddanych prób, nie jest wprost wypowiedziany. F2:O24: wyjątek dla ruchu będącego zadaniem nie jest jeszcze w ZASADY.md; właściwy otwarty wpis to B-53. F2:O03: lista własnych nagłówków w ZASADY.md nie wymienia Kalamburów; to propozycja dokumentacyjna P2-05 poniżej.

## 6. Propozycje dokumentów i niezatwierdzone założenia

Te pozycje są mapą redakcyjną do istniejących F4 lub listą metod audytu, bez doliczania nowych błędów. Status każdej: **oczekuje** w 04-02, następnie decyzja w 04-04. Nie zmieniono dokumentów źródłowych.

### 6.1. Propozycje F1

F1 nie ma osobnej listy redakcyjnej. Wszystkie propozycje znajdują się w 55 wpisach odwzorowanych w §3/§4. Dotyczy to także dopisków do `KONCEPT.md`, zasad tylko w kodzie (K1/K2/K11/KL1/Z18) i formatu wyników; nie są dodatkowymi pozycjami.

### 6.2. Propozycje F2 §7

#### P2-01

Mapa do F4: [F4-106](#f4-106), [F4-077](#f4-077), [F4-088](#f4-088). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`ZASADY.md` §5, lista „Najpierw istniejące”:** `line-draw` (linia rysuje się od początku do końca), `title-pop` (wygrana), `tile-hit` / `tile-miss` (trafienie / pomyłka na kaflu),
`piece-fall` (ucięty kawałek spada), `shake` (dotknięcie zignorowane, bez kary); jedna animacja „czekamy na rywala” albo jej brak (A3); rola `set-glow` jako komplet z wielu pól (A14). Źródło: U17, A3, A14.

#### P2-02

Mapa do F4: [F4-107](#f4-107), [F4-075](#f4-075), [F4-106](#f4-106), [F4-079](#f4-079), [F4-108](#f4-108), [F4-078](#f4-078). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`ZASADY.md` §5, tabela czasów (nowe wiersze):**

| Sytuacja | Czas | Wpis |
|---|---|---|
| świeże osiągnięcie (`set-glow`) | 0,9 s × 4 | B-35 |
| pętla „to można wybrać” (`ring-pulse`) | 1,2 s | A1 |
| wygrana (`title-pop`) | 0,5 s albo zmiana na 350 ms | U17 |
| trafienie / pomyłka na kaflu | 350 ms | U17 |
| ucięty kawałek (`piece-fall`) | 0,5 s `ease-in` | U17 |
| dotknięcie zignorowane (`shake`) | 300 ms | U17, A5 |
| pasek czasu i postępu | przejście szerokości równe krokowi odświeżania, `linear` (Countdown 300 ms) | U18 |
| ruch będący treścią gry | czas z `ZASADY-GIER.md` (Kubki, Śledzenie, Wieża, Za zasłoną) | U18, B-53 |
| pojawienie w pokazie na czas | 180 ms (W pamięci) | U19 |
| tryb Szybki Chińczyka | krok 110 ms, rzut 400 ms | §6 |
| odsłona prawdziwego wyniku | `stone-pop` 350 ms albo bez animacji (jedna decyzja) | A4 |

#### P2-03

Mapa do F4: [F4-065](#f4-065), [F4-057](#f4-057), [F4-116](#f4-116), [F4-064](#f4-064), [F4-089](#f4-089), [F4-090](#f4-090). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`ZASADY.md` §5, wyjątki i zasady:** ruch, który gracz śledzi albo mierzy, nie podlega reduced motion i robi go JS (B-53); kroki sekwencyjne czekają z decyzją na dojście pionka albo dotknięcie kończy animację (U2);
`float-up` przy reduced motion zostaje widoczne bez ruchu (U27); pierwsza klatka podglądu `Intro` bazowo widoczna (B-52); zaznaczenie w polu gry na czas bez przejścia, jak bodziec (A15); okno otwierane dotknięciem pojawia się od razu (A16).

#### P2-04

Mapa do F4: [F4-147](#f4-147), [F4-079](#f4-079), [F4-080](#f4-080), [F4-081](#f4-081), [F4-084](#f4-084). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`ZASADY.md` §5, tabela wibracji:** wiersz „uderzenie metronomu w Rytmie (część bodźca): 30” (RY3); „ruch zignorowany: 60 albo bez wibracji” (A5); czy pudło w grze turowej to pomyłka (A6);
przykłady „zła od innego gracza”: trafienie floty, wykupienie pola, STOP (A7); wibracja tury przy zmianie klucza fazy, gdy czekamy na mnie (A10).

#### P2-05

Mapa do F4: [F4-061](#f4-061), [F4-099](#f4-099), [F4-100](#f4-100), [F4-098](#f4-098), [F4-125](#f4-125), [F4-063](#f4-063), [F4-091](#f4-091). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`ZASADY.md` §4:** lista tokenów zastąpiona odesłaniem do `DESIGN.md` §2 (B-18); własny nagłówek także w Kalamburach (§6); `Results` / `ScoreTable` jako drugi wzorzec wyników (U10); `RoundTable` z `children`
i wierszem celów (U11); kiedy odsłona czeka na przycisk i jakie słowo („Dalej” albo „Wyniki”) (U9); `time` w `Intro` to długość partii (U36); klasa akcji w partii `.btn-player` (B-29); „Gotowe” tylko w jednej roli (A17).

#### P2-06

Mapa do F4: [F4-060](#f4-060), [F4-067](#f4-067), [F4-096](#f4-096), [F4-111](#f4-111). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`DESIGN.md` §2:** wiersz `accent-hover` (B-15); rola `accent` dla znaku aplikacji (HM-2); rola `warning` „ostrzeżenie przed skutkiem ruchu” albo jej brak (C3 w U7); 4 px dla odznaki turnieju (U22).

#### P2-07

Mapa do F4: [F4-066](#f4-066), [F4-085](#f4-085). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`DESIGN.md` §5:** dwa akcenty na ekranie głównym przy pełnym kodzie albo „Zagraj” jako obrys (HM-1); „Dalej” w partii w kolorze gracza, między grami turnieju w akcencie (A11).

#### P2-08

Mapa do F4: [F4-056](#f4-056), [F4-069](#f4-069), [F4-093](#f4-093), [F4-094](#f4-094), [F4-110](#f4-110), [F4-111](#f4-111), [F4-100](#f4-100), [F4-095](#f4-095). Źródło: F2 §7; identyfikatory bez prefiksu w poniższej treści odnoszą się do F2.

**`DESIGN.md` §6:** wysokości (U1 po pomiarze; HM-8: listy poza partią przewijają się w pionie); gęste plansze z potwierdzeniem poniżej 48 px (U4); Kampus Tour: rogi planszy, plansza 2.5D i poświaty, promień 4 px pól,
pola planszy poniżej 48 px (U5, U21, U22, U4); uchwyt suwaka (U5); figury Obrotu jako treść (U22); pary Odcienia zamiast `RoundTable` (U11); gradient oceny w Kole albo tokeny (U5); pionki i kamienie: kolor gracza wystarcza albo nie (U6).

### 6.3. Propozycje F3 §12

- **P3-01** (`ZASADY-GIER.md`): §Kampus Tour: Wykupienie (Juwenalia zostają na polu, B-KT4), Budowa (budynki ponad poziom 2 zostają po utracie kompletu, B-KT5). Mapa: [F4-023](#f4-023), [F4-030](#f4-030).
- **P3-02** (`ZASADY-GIER.md`): §Liczenie :112: „po równo z czterech typów” zgodnie z kodem po zmianie (B-LC1) albo opis losowania osobnego. Mapa: [F4-003](#f4-003).
- **P3-03** (`ZASADY-GIER.md`): §Sekwencja: wzór długości partii T(N) i odstępstwo `timeoutMove` (ostatnia zaliczona seria), jeśli faza 4 przyjmie B-SQ1; rozstrzyganie remisu (B-SQ2). Mapa: [F4-002](#f4-002), [F4-158](#f4-158).
- **P3-04** (`ZASADY-GIER.md`): §Który rok?: zapas limitu tylko na sieć, bo czas rundy jest twardy (B-RK2), albo nowy limit. Mapa: [F4-002](#f4-002).
- **P3-05** (`ZASADY-GIER.md`): §Refleks (i Stój!): rekordy zależą od telefonu (R6). Mapa: [F4-117](#f4-117).
- **P3-06** (`ZASADY-GIER.md`): §Państwa-miasta: litera Ł jako słabsza runda albo jej brak (B-PM2); limit głosowania zależny od liczby graczy (B-PM1). Mapa: [F4-166](#f4-166), [F4-002](#f4-002).
- **P3-07** (`ZASADY-GIER.md`): §Trzy kubki :264: uzasadnienie braku `tie` do potwierdzenia partią (B-KB1); §W pamięci :437 rozstrzygnięcie kompletu (B-WP2). Mapa: [F4-158](#f4-158).
- **P3-08** (`ZASADY-GIER.md`): Nowe limity tury (Sekwencja, Zakupy, Środek, Tort, Śledzenie) i zmiany losowania z R2 / R7: w sekcji gry, razem z testem (`AGENTS.md`). Mapa: [F4-003](#f4-003), [F4-161](#f4-161).
- **P3-09** (`KONCEPT.md`): §9: odpowiedzi z §6 (balans zostaje do partii; monopol tylko przez grupy dwupolowe, rzadki; premia za miejsce za wysoka po zmianach 2026-10-07/08; MPK ok. 1/3 kompletów). Mapa: [F4-160](#f4-160), [F4-164](#f4-164), [F4-163](#f4-163).
- **P3-10** (`KONCEPT.md`): §3: lista limitów po zmianach R1; jeden limit od startu dla mini-gier (R8). Mapa: [F4-002](#f4-002), [F4-162](#f4-162).
- **P3-11** (`KONCEPT.md`): §2.6: domyślna liczba gier Turnieju, jeśli faza 4 przyjmie B-TU1. Mapa: [F4-168](#f4-168).
- **P3-12** (`ZASADY.md` §3): :106: model najdłuższej uczciwej partii (`03-02-BASELINE.md` §1.2) i wymóg zapasu ≥ 20% i ≥ 10 s jako jawna reguła. Mapa: [F4-002](#f4-002).
- **P3-13** (`ZASADY.md` §3): :100-102: w grze z decyzją „stop” (ryzyko) stała suma nie wystarcza, potrzebny stały komplet celów (R7); wzorzec Tortu jako trzeci obok `withSum` i kompletów rodzajów. Mapa: [F4-161](#f4-161).
- **P3-14** (`ZASADY.md` §3): Nowa reguła: gra z sufitem osiągalnym ma `tie`, które rozstrzyga komplet, albo nie ma sufitu (R3, R4). Mapa: [F4-158](#f4-158), [F4-159](#f4-159).
- **P3-15** (`ZASADY.md` §3): Wynik w grach na odtwarzanie czasu względny (‰ celu) albo cel stały, jeśli faza 4 przyjmie B-SP1, B-RY1. Mapa: [F4-003](#f4-003).

### 6.4. Założenia 03-CONTEXT.md D-01..D-14

Nie traktujemy ich jako nowych zaakceptowanych reguł. Identyfikatory D-* są lokalne dla kontekstu fazy 3.

| Źródło | Co wymaga rozróżnienia lub decyzji | Mapa / przekazanie |
|---|---|---|
| [F3:D-01](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Zakres 30 mini-gier, 8 głównych i Turnieju | §8 pokrycie; bez nowego F4 |
| [F3:D-02](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | 14 przekazań z faz 1-2 | §7.2; przypisane do istniejących wpisów |
| [F3:D-03](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Zgodność kierunków rekordów a potrzeba tie | [F4-013](#f4-013), [F4-158](#f4-158), [F4-159](#f4-159) |
| [F3:D-04](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Miara trudności z setup nie jest pomiarem człowieka | [F4-003](#f4-003), [F4-161](#f4-161) |
| [F3:D-05](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Praktyczny sufit jest założeniem do partii | [F4-158](#f4-158), [F4-159](#f4-159) |
| [F3:D-06](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Progi ludzkie i krzywe nie są wynikami partii | [F4-158](#f4-158), [F4-159](#f4-159), [F4-003](#f4-003) |
| [F3:D-07](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Zapas 20% i 10 s: proponowany próg, a nie obecny zapis ZASADY.md | [F4-002](#f4-002) |
| [F3:D-08](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Boty dają sygnał balansu, nie dowód u ludzi | [F4-160](#f4-160), [F4-163](#f4-163), [F4-164](#f4-164) |
| [F3:D-09](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Waga osobna od pewności i priorytetu | §2; warunkowość R3 i modeli R1 zachowana |
| [F3:D-10](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Symulacje w /tmp, bez zależności | Metoda zachowana, brak ponawiania symulacji w 04-01 |
| [F3:D-11](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Lokalna baza niewystarczająca; bez łączenia z Pi | §7 pytania 9-13; kopia bazy tylko jeśli użytkownik udostępni |
| [F3:D-12](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Szablon oceny a brak pomiarów człowieka | §7 i macierz F3 §9 |
| [F3:D-13](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Wspólne wpisy, aliasy, osobna rekomendacja | §3-§5; rekomendacja nigdy nie zastępuje decyzji |
| [F3:D-14](../03-audyt-balansu-rekord-w-i-trudno-ci/03-CONTEXT.md) | Grupy audytu nie są jeszcze pakietami wdrożenia | 04-03 ustali zakresy i priorytety |

## 7. Otwarte dowody i przekazanie do 04-02

### 7.1. Wszystkie 22 pytania F3 §11

Pytania nie tworzą kolejnych błędów. Osoba odpowiedzialna: użytkownik za partie i dane z urządzeń; agent 04-02 za analizę udostępnionych danych i warianty. Warunek powrotu: zapisane miary z prawej kolumny, bez przypisywania brakowi odpowiedzi znaczenia akceptacji. Pozycje 9-13 mogą korzystać z kopii bazy udostępnionej przez użytkownika; nie pobierano danych z Pi.

| Pytanie | Gra i F4 | Co rozstrzygnąć | Co zapisać / warunek powrotu |
|---|---|---|---|
| F3:P01 | Kampus Tour (B-KT1); [F4-160](#f4-160) | Czy ostatni w kolejności wygrywa częściej niż pierwszy? | liczba graczy, miejsce startowe zwycięzcy, w ilu partiach (cel ≥ 8 przy 3-4 os.) |
| F3:P02 | Kampus Tour (B-KT3); [F4-163](#f4-163) | Ile kompletów domyka Bilet MPK? | każdy komplet: sposób (zakup, wykup, MPK) i runda |
| F3:P03 | Kampus Tour (B-KT6, balans §9); [F4-165](#f4-165) | Czy partia mieści się w 45 min i czy bankructwa nadal padają wcześnie? | czas partii zegarem, liczba graczy, runda końca, sposób końca, runda pierwszego bankructwa |
| F3:P04 | Kampus Tour (B-KT2); [F4-164](#f4-164) | Czy pada monopol? | grupy w monopolu (dwupolowe czy nie) |
| F3:P05 | Gomoku (B-GO1); [F4-160](#f4-160) | Jak często wygrywa zaczynający? | kto zaczynał, kto wygrał (cel ≥ 10 partii) |
| F3:P06 | Labirynt (B-LB1); [F4-160](#f4-160) | Czy przy 3-4 os. wygrywa ostatni w kolejności? | tryb, liczba graczy, miejsce zwycięzcy w kolejności |
| F3:P07 | Memory (B-ME1); [F4-160](#f4-160) | Czy w Małej przy 3+ os. pierwszy gracz przegrywa częściej? | tryb, liczba graczy, miejsce zwycięzcy, remisy na górze |
| F3:P08 | Państwa-miasta (B-PM1); [F4-002](#f4-002) | Czy przy 5-6 os. wszyscy przeglądają odpowiedzi przed końcem 45 s głosowania? | liczba graczy, ile osób zagłosowało przed limitem, czy złe odpowiedzi przeszły |
| F3:P09 | Sekwencja (B-SQ1, B-SQ2); [F4-002](#f4-002), [F4-158](#f4-158) | Jak długie serie robią najlepsi i jak często serie się powtarzają na szczycie? | seria, czas partii (d = czas wpisania koloru), liczba równych wyników w pierwszej trójce |
| F3:P10 | Trzy kubki (B-KB1); [F4-158](#f4-158) | Czy ktoś zalicza 20 rund? | wynik, odsetek partii z 20 |
| F3:P11 | W pamięci (B-WP2, B-WP1); [F4-158](#f4-158), [F4-003](#f4-003) | Czy ktoś zalicza 12 rund? Czy pomyłki padają na mnożeniu? | wynik, działanie, na którym padła pomyłka (`detail`) |
| F3:P12 | Zakupy (B-ZK2); [F4-159](#f4-159) | Jak często pada 10 z 10? | wynik, czas zaznaczania; przedmioty, przy których padają pomyłki |
| F3:P13 | Wieża (B-WZ1); [F4-159](#f4-159) | Czy najlepsi kończą na 30 piętrach? | wysokość, szerokość ostatniego klocka |
| F3:P14 | Środek (B-SR1) i Tort (B-TO1); [F4-002](#f4-002) | Ile trwa partia wolnego, starannego gracza? | czas od „Start” do wyniku (stoper), liczba poprawek punktu albo cięcia |
| F3:P15 | Kąt (B-KAT1); [F4-003](#f4-003) | Czy błąd zależy od wielkości kąta? | z tabeli rund: kąt i błąd (najlepiej z kilku partii) |
| F3:P16 | Literówka (B-LT1); [F4-003](#f4-003) | Czy któryś rodzaj błędu (ó/u, rz/ż, ch/h) jest wyraźnie wolniejszy albo częściej mylony? | rodzaj planszy, czas, pomyłka |
| F3:P17 | Za zasłoną (B-ZS1); [F4-003](#f4-003) | Czy krótka widoczność kulki podnosi błąd? | z tabeli rund: widoczność, ukryty czas, odchyłka |
| F3:P18 | Stój! (B-SJ1); [F4-003](#f4-003) | Czy błędy skupiają się w szybkiej końcówce? | wynik, liczba zielonych w ostatnich 10 s (ze stanu), błędy według czasu |
| F3:P19 | Dziesiątki (B-DZ1); [F4-003](#f4-003) | Czy wynik rośnie z liczbą par na planszy? | wynik, średnia liczba par na planszy (ze stanu po partii) |
| F3:P20 | Kalambury (B-KA1); [F4-167](#f4-167) | Czy przy 2 os. rysowanie ma znaczenie dla wyniku? | punkty za rysowanie i za zgadywanie u obu graczy |
| F3:P21 | Mapa (03-07, bez wpisu); bez nowej rozbieżności; 04-02 | Czy miasta przy granicy są łatwiejsze niż w środku kraju? | z tabeli rund: miasto i odległość |
| F3:P22 | Który rok? (B-RK1); [F4-003](#f4-003) | Czy dział albo epoka zmienia błąd tej samej osoby? | wydarzenie, rok, błąd |

F3:P21 (Mapa) pozostaje pytaniem bez wpisu błędu; ocena wpływu położenia miast nie była rozstrzygnięta. Nie stworzono sztucznego F4, aby zwiększyć licznik.

### 7.2. Przekazania z F3 §10

„Zamknięte liczbą/modelem” w fazie 3 oznacza zakończenie analizy audytowej, nie wdrożenie ani akceptację odstępstwa. Wszystkie 14 przekazań pozostaje rozpoznawalne:

| Przekazanie | Właściciel F4 i status |
|---|---|
| F1:Z2 / SQ1 | [F4-002](#f4-002); wyliczenie + założenie czasu wpisywania |
| F1:Z2 / ZK1 | [F4-002](#f4-002); wyliczenie; pomiar dotyku osobno |
| F1:Z2 / SR1 | [F4-002](#f4-002); model, czeka na pomiar |
| F1:Z3 / W6a | [F4-003](#f4-003); Stoper i Rytm: model błędu |
| F1:Z3 / LC1 | [F4-003](#f4-003); udział rodzajów zmierzony |
| F1:Z3 / W8b | [F4-003](#f4-003); Odcień symulacja; Kąt do partii |
| F1:Z3 / W9a | [F4-003](#f4-003); udział mnożeń zmierzony |
| F1:K2 | [F4-023](#f4-023); rekomendacja zostawić, oczekuje decyzji |
| F1:K11 | [F4-030](#f4-030); rekomendacja zostawić, oczekuje decyzji |
| F2:U2 / KA1 | [F4-057](#f4-057), [F4-165](#f4-165); limit wystarcza w modelu, blokada UX pozostaje |
| F2:U2 / C8 | [F4-057](#f4-057); limit Szybkiego wystarcza, blokada UX pozostaje |
| F2:A9 / WP3 | [F4-083](#f4-083); ryzyko po porzuceniu partii, UX pozostaje |
| F2:U28 | [F4-117](#f4-117); wpływ opisany, brak pomiaru urządzeń |
| F2:U31 / SC1 | [F4-120](#f4-120); kary całkowite; brak obecnego błędu kropki |

### 7.3. Pomiar UI, urządzenia i interpretacja reguł

Źródło całej listy: F2 §9. Osoba: agent 04-02 za odtwarzalne pomiary w przeglądarce, użytkownik za właściwy telefon/czytnik. Warunek zamknięcia: pomiar lub zapis „niezmierzone” z dalszym warunkiem, nigdy sam upływ czasu.

| Dowód do uzupełnienia | Powiązanie F4 | Metoda / granica |
|---|---|---|
| Wysokości 360×640, Memory Średnia, Kalambury, Koło, środek Kampus Tour buy/MPK/koniec | [F4-056](#f4-056), [F4-092](#f4-092), [F4-058](#f4-058) | Przeglądarka, zmierzone prostokąty i widoczne akcje, także Kampus Tour 390×844 |
| SZ1 i WP5 z otwartą klawiaturą | [F4-056](#f4-056) | Android; emulacja viewportu nie jest pomiarem klawiatury |
| Napisy, podgląd, wynik, RoundTable; kafelki Jeszcze nie grane i TopGame | [F4-068](#f4-068), [F4-142](#f4-142), [F4-153](#f4-153), [F4-151](#f4-151), [F4-149](#f4-149) | Przeglądarka 360×640, długie teksty i 10 rund; dwa ostatnie elementy są sondą bez osobnego błędu |
| Czytelność planszy i podsumowania, dotyk wykresu | [F4-133](#f4-133), [F4-136](#f4-136), [F4-134](#f4-134) | Zrzut i rzeczywisty dotyk |
| GM-5: aria-label na span | [F4-112](#f4-112) | TalkBack lub VoiceOver; sam DOM nie potwierdza wypowiedzi czytnika |
| SL1: kontrast i drugi sygnał celów | [F4-095](#f4-095) | Sześć kolorów graczy, także żółty |
| Ruch Kubków 150 ms i późnego Śledzenia | [F4-065](#f4-065), [F4-107](#f4-107) | Słabszy telefon; płynność nie wynika z samego rAF |
| Błysk Rytmu/Przytrzymaj, pomiar 60/120 Hz, reduced motion | [F4-117](#f4-117), [F4-064](#f4-064), [F4-116](#f4-116) | Osobno zegar, rysowanie i sprzęt; nie obiecywać usunięcia opóźnienia urządzenia |

## 8. Macierz pokrycia

### 8.1. 38 gier i Turniej

Każdy wiersz jest objęty wszystkimi trzema audytami (F1 §6, F2 §8, F3 §9). Wpisy poniżej to zakres bezpośredni i jawne wystąpienia; problemy wspólnej platformy oddziałują także na inne gry przez Game/ui. Brak osobnego wpisu nie oznacza braku audytu.

| Gra | Pokrycie źródeł | Bezpośrednie wpisy F4 | Status |
|---|---|---|---|
| `piec-w-rzedzie` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-008](#f4-008), [F4-036](#f4-036), [F4-056](#f4-056), [F4-077](#f4-077), [F4-093](#f4-093), [F4-094](#f4-094), [F4-095](#f4-095), [F4-105](#f4-105), [F4-106](#f4-106), [F4-110](#f4-110), [F4-121](#f4-121), [F4-160](#f4-160) | audytowane; decyzje oczekują |
| `labirynt` | F1 + F2 + F3 | [F4-041](#f4-041), [F4-042](#f4-042), [F4-056](#f4-056), [F4-076](#f4-076), [F4-093](#f4-093), [F4-095](#f4-095), [F4-101](#f4-101), [F4-105](#f4-105), [F4-112](#f4-112), [F4-121](#f4-121), [F4-160](#f4-160) | audytowane; decyzje oczekują |
| `statki` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-005](#f4-005), [F4-008](#f4-008), [F4-012](#f4-012), [F4-056](#f4-056), [F4-077](#f4-077), [F4-080](#f4-080), [F4-081](#f4-081), [F4-091](#f4-091), [F4-093](#f4-093), [F4-096](#f4-096), [F4-102](#f4-102), [F4-105](#f4-105), [F4-110](#f4-110), [F4-111](#f4-111), [F4-112](#f4-112), [F4-121](#f4-121), [F4-160](#f4-160) | audytowane; decyzje oczekują |
| `chinczyk` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-008](#f4-008), [F4-018](#f4-018), [F4-037](#f4-037), [F4-056](#f4-056), [F4-057](#f4-057), [F4-075](#f4-075), [F4-093](#f4-093), [F4-095](#f4-095), [F4-096](#f4-096), [F4-101](#f4-101), [F4-111](#f4-111), [F4-138](#f4-138) | audytowane; decyzje oczekują |
| `kampus-tour` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-007](#f4-007), [F4-008](#f4-008), [F4-010](#f4-010), [F4-012](#f4-012), [F4-019](#f4-019), [F4-022](#f4-022), [F4-023](#f4-023), [F4-024](#f4-024), [F4-025](#f4-025), [F4-026](#f4-026), [F4-027](#f4-027), [F4-028](#f4-028), [F4-029](#f4-029), [F4-030](#f4-030), [F4-031](#f4-031), [F4-032](#f4-032), [F4-033](#f4-033), [F4-034](#f4-034), [F4-035](#f4-035), [F4-057](#f4-057), [F4-058](#f4-058), [F4-081](#f4-081), [F4-082](#f4-082), [F4-090](#f4-090), [F4-093](#f4-093), [F4-094](#f4-094), [F4-095](#f4-095), [F4-097](#f4-097), [F4-098](#f4-098), [F4-101](#f4-101), [F4-102](#f4-102), [F4-103](#f4-103), [F4-104](#f4-104), [F4-107](#f4-107), [F4-110](#f4-110), [F4-111](#f4-111), [F4-112](#f4-112), [F4-116](#f4-116), [F4-129](#f4-129), [F4-130](#f4-130), [F4-131](#f4-131), [F4-132](#f4-132), [F4-133](#f4-133), [F4-134](#f4-134), [F4-135](#f4-135), [F4-136](#f4-136), [F4-137](#f4-137), [F4-160](#f4-160), [F4-163](#f4-163), [F4-164](#f4-164), [F4-165](#f4-165) | audytowane; decyzje oczekują |
| `memory` | F1 + F2 + F3 | [F4-038](#f4-038), [F4-056](#f4-056), [F4-077](#f4-077), [F4-080](#f4-080), [F4-088](#f4-088), [F4-095](#f4-095), [F4-101](#f4-101), [F4-105](#f4-105), [F4-110](#f4-110), [F4-114](#f4-114), [F4-121](#f4-121), [F4-160](#f4-160) | audytowane; decyzje oczekują |
| `refleks` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-006](#f4-006), [F4-008](#f4-008), [F4-009](#f4-009), [F4-043](#f4-043), [F4-080](#f4-080), [F4-099](#f4-099), [F4-101](#f4-101), [F4-117](#f4-117) | audytowane; decyzje oczekują |
| `simon` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-044](#f4-044), [F4-080](#f4-080), [F4-118](#f4-118), [F4-158](#f4-158) | audytowane; decyzje oczekują |
| `stoper` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-016](#f4-016), [F4-101](#f4-101), [F4-117](#f4-117), [F4-124](#f4-124) | audytowane; decyzje oczekują |
| `schulte` | F1 + F2 + F3 | [F4-001](#f4-001), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-021](#f4-021), [F4-045](#f4-045), [F4-106](#f4-106), [F4-120](#f4-120), [F4-141](#f4-141) | audytowane; decyzje oczekują |
| `stroop` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-099](#f4-099), [F4-106](#f4-106), [F4-142](#f4-142), [F4-143](#f4-143) | audytowane; decyzje oczekują |
| `liczenie` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-046](#f4-046), [F4-099](#f4-099), [F4-101](#f4-101), [F4-106](#f4-106) | audytowane; decyzje oczekują |
| `kolo` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-019](#f4-019), [F4-021](#f4-021), [F4-047](#f4-047), [F4-056](#f4-056), [F4-079](#f4-079), [F4-094](#f4-094), [F4-098](#f4-098), [F4-106](#f4-106), [F4-122](#f4-122), [F4-125](#f4-125), [F4-144](#f4-144) | audytowane; decyzje oczekują |
| `kolor` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-078](#f4-078), [F4-093](#f4-093), [F4-094](#f4-094), [F4-098](#f4-098), [F4-100](#f4-100), [F4-110](#f4-110), [F4-111](#f4-111), [F4-145](#f4-145) | audytowane; decyzje oczekują |
| `kropki` | F1 + F2 + F3 | [F4-001](#f4-001), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-009](#f4-009), [F4-010](#f4-010), [F4-019](#f4-019), [F4-021](#f4-021), [F4-056](#f4-056), [F4-078](#f4-078), [F4-098](#f4-098), [F4-100](#f4-100), [F4-101](#f4-101), [F4-119](#f4-119), [F4-126](#f4-126) | audytowane; decyzje oczekują |
| `rok` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-003](#f4-003), [F4-009](#f4-009), [F4-019](#f4-019), [F4-021](#f4-021), [F4-078](#f4-078), [F4-086](#f4-086), [F4-093](#f4-093), [F4-094](#f4-094), [F4-100](#f4-100), [F4-110](#f4-110), [F4-111](#f4-111), [F4-119](#f4-119), [F4-126](#f4-126) | audytowane; decyzje oczekują |
| `srodek` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-006](#f4-006), [F4-009](#f4-009), [F4-078](#f4-078), [F4-079](#f4-079), [F4-106](#f4-106), [F4-125](#f4-125) | audytowane; decyzje oczekują |
| `stoj` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-013](#f4-013), [F4-049](#f4-049), [F4-099](#f4-099), [F4-106](#f4-106), [F4-117](#f4-117), [F4-118](#f4-118) | audytowane; decyzje oczekują |
| `sledzenie` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-003](#f4-003), [F4-050](#f4-050), [F4-051](#f4-051), [F4-093](#f4-093), [F4-095](#f4-095), [F4-107](#f4-107) | audytowane; decyzje oczekują |
| `wieza` | F1 + F2 + F3 | [F4-021](#f4-021), [F4-106](#f4-106), [F4-107](#f4-107), [F4-111](#f4-111), [F4-116](#f4-116), [F4-117](#f4-117), [F4-119](#f4-119), [F4-159](#f4-159) | audytowane; decyzje oczekują |
| `rytm` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-016](#f4-016), [F4-101](#f4-101), [F4-107](#f4-107), [F4-147](#f4-147) | audytowane; decyzje oczekują |
| `inny` | F1 + F2 + F3 | [F4-007](#f4-007), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-099](#f4-099), [F4-106](#f4-106), [F4-112](#f4-112), [F4-123](#f4-123), [F4-148](#f4-148) | audytowane; decyzje oczekują |
| `obrot` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-007](#f4-007), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-099](#f4-099), [F4-106](#f4-106), [F4-111](#f4-111), [F4-119](#f4-119) | audytowane; decyzje oczekują |
| `literowka` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-007](#f4-007), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-099](#f4-099), [F4-106](#f4-106), [F4-123](#f4-123) | audytowane; decyzje oczekują |
| `mapa` | F1 + F2 + F3 | [F4-078](#f4-078), [F4-125](#f4-125), [F4-149](#f4-149) | audytowane; decyzje oczekują |
| `przytrzymaj` | F1 + F2 + F3 | [F4-100](#f4-100), [F4-101](#f4-101), [F4-119](#f4-119), [F4-124](#f4-124) | audytowane; decyzje oczekują |
| `balon` | F1 + F2 + F3 | [F4-021](#f4-021), [F4-052](#f4-052), [F4-100](#f4-100), [F4-102](#f4-102), [F4-112](#f4-112), [F4-116](#f4-116), [F4-122](#f4-122), [F4-150](#f4-150), [F4-161](#f4-161) | audytowane; decyzje oczekują |
| `w-pamieci` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-020](#f4-020), [F4-053](#f4-053), [F4-056](#f4-056), [F4-083](#f4-083), [F4-087](#f4-087), [F4-098](#f4-098), [F4-108](#f4-108), [F4-158](#f4-158) | audytowane; decyzje oczekują |
| `dziesiatki` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-007](#f4-007), [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-089](#f4-089), [F4-099](#f4-099), [F4-106](#f4-106), [F4-123](#f4-123) | audytowane; decyzje oczekują |
| `tort` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-009](#f4-009), [F4-078](#f4-078), [F4-093](#f4-093), [F4-125](#f4-125) | audytowane; decyzje oczekują |
| `zaslona` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-079](#f4-079), [F4-112](#f4-112), [F4-119](#f4-119) | audytowane; decyzje oczekują |
| `zakupy` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-059](#f4-059), [F4-089](#f4-089), [F4-091](#f4-091), [F4-095](#f4-095), [F4-102](#f4-102), [F4-107](#f4-107), [F4-151](#f4-151), [F4-159](#f4-159) | audytowane; decyzje oczekują |
| `nozyczki` | F1 + F2 + F3 | [F4-009](#f4-009), [F4-078](#f4-078), [F4-079](#f4-079), [F4-106](#f4-106), [F4-125](#f4-125) | audytowane; decyzje oczekują |
| `sudoku` | F1 + F2 + F3 | [F4-001](#f4-001), [F4-003](#f4-003), [F4-021](#f4-021), [F4-048](#f4-048), [F4-089](#f4-089), [F4-106](#f4-106), [F4-112](#f4-112), [F4-120](#f4-120), [F4-123](#f4-123), [F4-146](#f4-146) | audytowane; decyzje oczekują |
| `kat` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-019](#f4-019), [F4-021](#f4-021), [F4-056](#f4-056), [F4-078](#f4-078), [F4-098](#f4-098), [F4-100](#f4-100), [F4-101](#f4-101), [F4-119](#f4-119), [F4-126](#f4-126) | audytowane; decyzje oczekują |
| `panstwa-miasta` | F1 + F2 + F3 | [F4-002](#f4-002), [F4-004](#f4-004), [F4-005](#f4-005), [F4-006](#f4-006), [F4-007](#f4-007), [F4-008](#f4-008), [F4-009](#f4-009), [F4-010](#f4-010), [F4-011](#f4-011), [F4-017](#f4-017), [F4-054](#f4-054), [F4-055](#f4-055), [F4-056](#f4-056), [F4-081](#f4-081), [F4-084](#f4-084), [F4-085](#f4-085), [F4-091](#f4-091), [F4-092](#f4-092), [F4-093](#f4-093), [F4-095](#f4-095), [F4-096](#f4-096), [F4-097](#f4-097), [F4-114](#f4-114), [F4-119](#f4-119), [F4-152](#f4-152), [F4-166](#f4-166) | audytowane; decyzje oczekują |
| `kalambury` | F1 + F2 + F3 | [F4-011](#f4-011), [F4-017](#f4-017), [F4-039](#f4-039), [F4-040](#f4-040), [F4-056](#f4-056), [F4-084](#f4-084), [F4-085](#f4-085), [F4-092](#f4-092), [F4-103](#f4-103), [F4-104](#f4-104), [F4-112](#f4-112), [F4-119](#f4-119), [F4-139](#f4-139), [F4-140](#f4-140), [F4-167](#f4-167) | audytowane; decyzje oczekują |
| `kubki` | F1 + F2 + F3 | [F4-003](#f4-003), [F4-019](#f4-019), [F4-104](#f4-104), [F4-107](#f4-107), [F4-158](#f4-158) | audytowane; decyzje oczekują |
| `turniej` | F1 + F2 + F3 | [F4-004](#f4-004), [F4-018](#f4-018), [F4-085](#f4-085), [F4-092](#f4-092), [F4-101](#f4-101), [F4-104](#f4-104), [F4-108](#f4-108), [F4-111](#f4-111), [F4-114](#f4-114), [F4-153](#f4-153), [F4-154](#f4-154), [F4-155](#f4-155), [F4-156](#f4-156), [F4-157](#f4-157), [F4-168](#f4-168) | audytowane; decyzje oczekują |

### 8.2. Ekrany i wspólne komponenty

| Powierzchnia | Pokrycie | Wpisy / status |
|---|---|---|
| `App.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-073](#f4-073), [F4-074](#f4-074), [F4-115](#f4-115); wpisy otwarte, bez nowego pomiaru UI |
| `Home.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-066](#f4-066), [F4-067](#f4-067), [F4-068](#f4-068), [F4-069](#f4-069), [F4-074](#f4-074), [F4-101](#f4-101), [F4-103](#f4-103), [F4-115](#f4-115); wpisy otwarte, bez nowego pomiaru UI |
| `Lobby.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-017](#f4-017), [F4-069](#f4-069), [F4-093](#f4-093), [F4-101](#f4-101), [F4-102](#f4-102), [F4-103](#f4-103), [F4-104](#f4-104), [F4-105](#f4-105), [F4-113](#f4-113), [F4-115](#f4-115), [F4-156](#f4-156); wpisy otwarte, bez nowego pomiaru UI |
| `Setup.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-069](#f4-069), [F4-070](#f4-070), [F4-093](#f4-093), [F4-095](#f4-095), [F4-101](#f4-101), [F4-104](#f4-104), [F4-114](#f4-114), [F4-154](#f4-154), [F4-155](#f4-155), [F4-156](#f4-156), [F4-157](#f4-157); wpisy otwarte, bez nowego pomiaru UI |
| `MiniGames.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-103](#f4-103), [F4-104](#f4-104), [F4-115](#f4-115); wpisy otwarte, bez nowego pomiaru UI |
| `Records.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-044](#f4-044), [F4-069](#f4-069), [F4-071](#f4-071), [F4-072](#f4-072), [F4-073](#f4-073), [F4-096](#f4-096), [F4-101](#f4-101), [F4-102](#f4-102), [F4-103](#f4-103), [F4-104](#f4-104), [F4-107](#f4-107), [F4-115](#f4-115); wpisy otwarte, bez nowego pomiaru UI |
| `Game.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-017](#f4-017), [F4-048](#f4-048), [F4-056](#f4-056), [F4-075](#f4-075), [F4-082](#f4-082), [F4-084](#f4-084), [F4-085](#f4-085), [F4-086](#f4-086), [F4-092](#f4-092), [F4-097](#f4-097), [F4-098](#f4-098), [F4-101](#f4-101), [F4-103](#f4-103), [F4-104](#f4-104), [F4-105](#f4-105), [F4-106](#f4-106), [F4-107](#f4-107), [F4-108](#f4-108), [F4-112](#f4-112), [F4-113](#f4-113), [F4-116](#f4-116), [F4-130](#f4-130), [F4-153](#f4-153), [F4-154](#f4-154); wpisy otwarte, bez nowego pomiaru UI |
| `ui.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-099](#f4-099), [F4-101](#f4-101), [F4-103](#f4-103), [F4-104](#f4-104), [F4-108](#f4-108), [F4-111](#f4-111), [F4-112](#f4-112), [F4-116](#f4-116), [F4-119](#f4-119), [F4-120](#f4-120), [F4-124](#f4-124), [F4-142](#f4-142), [F4-151](#f4-151); wpisy otwarte, bez nowego pomiaru UI |
| `index.css` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-060](#f4-060), [F4-062](#f4-062), [F4-063](#f4-063), [F4-064](#f4-064), [F4-077](#f4-077), [F4-079](#f4-079), [F4-093](#f4-093), [F4-094](#f4-094), [F4-095](#f4-095), [F4-105](#f4-105), [F4-106](#f4-106), [F4-107](#f4-107), [F4-109](#f4-109), [F4-110](#f4-110), [F4-111](#f4-111), [F4-116](#f4-116); wpisy otwarte, bez nowego pomiaru UI |
| `Quiz.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-013](#f4-013), [F4-014](#f4-014), [F4-015](#f4-015), [F4-099](#f4-099), [F4-112](#f4-112), [F4-123](#f4-123), [F4-127](#f4-127), [F4-142](#f4-142); wpisy otwarte, bez nowego pomiaru UI |
| `Szacowanie.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-056](#f4-056), [F4-078](#f4-078), [F4-098](#f4-098), [F4-100](#f4-100), [F4-101](#f4-101), [F4-119](#f4-119), [F4-126](#f4-126), [F4-128](#f4-128); wpisy otwarte, bez nowego pomiaru UI |
| `MiniGame.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-048](#f4-048), [F4-086](#f4-086); bez własnych rozbieżności F2; podpięcie i klucz Sudoku F1:W8 |
| `KampusSummary.tsx` | F2 §8.1/§8.2 oraz F1 podpięcie i F3 styki | [F4-082](#f4-082), [F4-101](#f4-101), [F4-102](#f4-102), [F4-134](#f4-134), [F4-135](#f4-135), [F4-136](#f4-136), [F4-137](#f4-137); wpisy otwarte, bez nowego pomiaru UI |

`TournamentSetup` jest w `Setup.tsx`, `OverActions`, `NextActions` i `Countdown` w `Game.tsx`; `Results` w `Quiz.tsx`, `Answers` w `Szacowanie.tsx`. Pokryte przez powyższe wiersze. `Dev.tsx` i `net.ts` były poza zakresem F2; nie udajemy ich audytu. Poprawka nie występuje w GAMES i pozostaje poza zakresem.

## 9. Kontrola kompletności i dalszy krok

- 55 + 102 + 16 źródeł kanonicznych ma dokładnie po jednym mapowaniu; 168 unikalnych F4, pięć wspólnych celów, zero osieroconych źródeł.
- Wszystkie 44 aliasy F3 są przypisane. Pełne tabele wystąpień wpisów zbiorczych zachowano; odsyłacze z macierzy nie zwiększają liczby problemów.
- Odstępstwa F1/F2, osiem grup propozycji F2 §7 (w tym komplet tabeli czasów), wszystkie punkty F3 §12, 14 założeń D-* i wszystkie 22 pytania są jawnie rozliczone.
- 39 pozycji i 13 powierzchni platformy/komponentów mają status pokrycia. Brak „już rozwiązane”; brak decyzji poprawić/zostawić/odrzucić bez udziału użytkownika.
- Następny jest 04-02: uzupełnić wskazane dowody, przygotować warianty i konsekwencje (rekordy, detail, turniej, dokumenty). Pakiety i priorytety należą do 04-03, decyzje do 04-04; nie wykonano ich w tym planie.

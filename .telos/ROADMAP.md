# Roadmap
<!-- ≤ 80 lines. One phase per line, updated by `telos roadmap set <NN> <status>`:
     "- NN-name [status] goal · done when: criterion"
     status: planned | drafted | active | done | dropped
     NN-name must match the directory in phases/.
     Optional milestone headings "## M1 · Name"; a finished milestone collapses
     to "## M1 · Name — done (01–05)". -->

## M0 · Platforma i gry (przed telos) — done
<!-- Etapy 0-5 i 7 z dawnego planu w KONCEPT.md: infrastruktura, skorupa, Gomoku, Statki, Kampus Tour, PWA i rekordy,
     a poza planem Chińczyk, Memory, Labirynt, Kalambury, Państwa-miasta, 30 mini-gier i Turniej. Bez katalogów faz. -->

## M1 · Audyt spójności (GSD) — done (01–05)
<!-- Prowadzony w .planning/phases/ (usunięte, w gicie pod fb0f5d2); skrót w .telos/AUDIT.md. -->
- 01-audyt-zasad [done] kod zasad, testy i podpięcie kontra KONCEPT, ZASADY-GIER i ZASADY §2, §3, §6 · done when: FINDINGS F1 z plik:linia dla każdej gry
- 02-audyt-wygladu [done] ekrany kontra ZASADY §4-5 i DESIGN · done when: FINDINGS F2 (kolory, 48 px, 360×640, teksty, animacje, wibracje)
- 03-audyt-balansu [done] równe szanse partii, sufit, remisy, krzywa trudności, limity, gry główne · done when: FINDINGS F3 z rekomendacją
- 04-raport-akceptacja [done] jeden raport z priorytetami i decyzją użytkownika · done when: ZG4-v1 zatwierdzone i zakres S5-v1 zapisany
- 05-poprawki [done] zaakceptowane rozbieżności usunięte · done when: 62/62 pakietów, typecheck/test/build PASS

## M2 · Po audycie (propozycje, kolejność nieustalona, każda czeka na akceptację planu)
- 06-odbiory-urzadzen [planned] domknąć odbiory U03, U04, U09, U14 i P11 na telefonie i w partiach · done when: każdy odbiór ma wynik albo jawną decyzję o pozostawieniu
- 07-atrakcyjnosc [active] ATR-00..05: pomiar, wyniki z momentem, rywalizacja w partii, wieczór w pokoju, wygląd, powroty · done when: zaakceptowane etapy wdrożone i zmierzone
- 08-podrobka [planned] nowa gra główna `podrobka` (POD-01..07) · done when: TDD, ekran, podpięcie i odbiór 3/6 graczy z obserwatorem
- 09-blef-na-kosciach [planned] nowa gra główna (BLEF-01..05) · done when: TDD, ekran, podpięcie i odbiór 2/6 graczy z obserwatorem
- 10-wyprawa [planned] nowa gra główna (WYP-01..05) · done when: TDD, ekran, podpięcie i odbiór 2/6 graczy z obserwatorem
- 11-sabotaz [active] nowa gra główna (SAB-01..05) · done when: TDD, ekran, podpięcie i odbiór 3/6 graczy z obserwatorem
- 12-wspolny-szyfr [planned] gra kooperacyjna z rozszerzeniem kontraktu o wynik drużyny (SZYFR-01..06) · done when: TDD, odbiór 2/6 i brak regresji starych gier
- 13-zapis-pokoi [planned] stan pokoi w SQLite, przeżywa restart i deploy · done when: partia trwa po restarcie serwera
- 14-poprawka [planned] gra karciana typu Uno, 2-6 graczy, ukryte ręce (KONCEPT §2.2) · done when: zestaw kart ustalony, TDD, ekran i odbiór

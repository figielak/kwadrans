---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 09
subsystem: games
tags: [audyt, mini-gry, kubki, sledzenie, wieza, w-pamieci, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-09-FINDINGS.md: sekcje 4 mini-gier do pierwszej pomyłki, każda z Zasadami, Regułami §3 i Testami; wpisy W9a, KB1, SL1, WP1, WP2"
affects: [01-10]

actuals:
  tasks: 4
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypty audytu poza repo (scratchpad): fuzz09.ts (400 partii każdej gry z uczciwymi wynikami, w tym 20% najgorszych uczciwych, i timeoutami; progress w Wieży; najgorszy uczciwy wynik wobec limitu na 500 seedach; najwęższy pierwszy klocek Wieży; mnożenia na partię W pamięci) i kubki09.ts (zamiany z kulką na partię)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-09-FINDINGS.md
  modified: []

key-decisions:
  - "We wszystkich czterech grach limit czasu to najgorszy możliwy wynik: w Kubkach i Śledzeniu równy pomyłce w pierwszej rundzie, w Wieży i W pamięci ściśle gorszy (pierwszy klocek zawsze trafia, uczciwa odchyłka najwyżej 998)"
  - "W9a (W pamięci: 15-35 mnożeń na partię) pod kluczem `trudnosc-z-losowania`, średnia, pomiar do fazy 3; Kubki (±6% zamian z kulką), Śledzenie i Wieża bez wpisów"
  - "SL1 (Śledzenie: ta sama prędkość kulek i odstęp 0,14 sprawdzone słabiej niż w dokumencie) jako średnia: test przepuściłby wolniejszą kulkę-cel"
  - "`tie` Wieży (szerokość bez zaokrąglenia) zgodny z komparatorem, więc nie dołącza do `tie-zaokraglenie`"
  - "KB1 (lokalna funkcja `shuffle` w kubki.ts) jako niska: to nie kopia `shuffle` z core.ts, tylko ta sama nazwa"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "4 mini-gry: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, walidacja, limity tury, czasy faz na ekranie"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts, sekcji ZASADY-GIER.md i KONCEPT.md; grep czasów w apps/web/src/games/{Kubki,Sledzenie,Wieza,WPamieci}.tsx; git blame KONCEPT.md :152-153 (WP2)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 na prawdziwych wynikach; limit czasu wobec najgorszego uczciwego wyniku; limit tury wobec najdłuższej uczciwej partii"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md + fuzz09.ts: 1600 partii, 0 błędów, 0 partii z limitem wyżej niż wynik"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla 4 gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; 01-01-CHECKS.md §4.2 (rekord przez index.test.ts)"
        status: pass
    human_judgment: false

duration: 35min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 09: mini-gry do pierwszej pomyłki Summary

**Stałe Trzech kubków, Śledzenia, Wieży i W pamięci zgadzają się z `ZASADY-GIER.md`, a reguły §3 przeszły 1600 partii z prawdziwymi wynikami bez błędu.
Limit czasu w każdej z gier to najgorszy możliwy wynik, drugie kryterium zgadza się z dokumentem i z komparatorem. Wszystkie cztery pliki testów mają komplet testów obowiązkowych §2;
luki tylko w dwóch zasadach sekcji (SL1, WP1). Brak wpisów wysokiej wagi.**

## Accomplishments

- Porównanie stałych 4 gier z dokumentami: zero rozbieżności kod ↔ `ZASADY-GIER.md`; jedna luka w `KONCEPT.md` (WP2).
- `fuzz09.ts`: 1600 partii, 0 błędów mutacji, JSON, walidacji, drugiego wyniku, klucza `turn()` (Wieża) i zgodności miejsc z rekordami; limit czasu nigdy wyżej od uczciwego wyniku.
- Zestawienie najdłuższej uczciwej partii z limitem tury: wszystkie cztery z zapasem (Wieża najciaśniej, 151 s wobec 180 s).
- Pomiar losowania: W pamięci 15-35 mnożeń na partię (W9a), Kubki 164-197 zamian z kulką na 270 (bez wpisu).

## Wpisy (szczegóły w 01-09-FINDINGS.md)

- Wysokie: brak.
- Średnie: W9a (`trudnosc-z-losowania`), SL1, WP1.
- Niskie: KB1, WP2.
- Odstępstwa z powodem (D-11): wyzwanie i cały stan w widoku od startu, wspólne wzory serwera i ekranu (`ballAt`, `position`, `left`), cele Śledzenia pod indeksami 0-2,
  czasy Wieży od klienta, `progress` Wieży mogący spaść.

## Deviations from Plan

- Brak w zakresie zadań. Zadania 1-4 wykonane w jednym pliku; metoda, przebieg skryptu i tabela limitów opisane raz na górze 01-09-FINDINGS.md, wpis wspólny (W9a) w osobnej sekcji, jak w 01-08.
  Na końcu dodana krótka tabela wpisów paczki dla 01-10.

## Verification

- `grep -n "^## " 01-09-FINDINGS.md` → nagłówki Trzy kubki, Śledzenie, Wieża, W pamięci, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypty w scratchpadzie sesji).

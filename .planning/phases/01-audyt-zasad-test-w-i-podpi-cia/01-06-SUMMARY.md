---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 06
subsystem: games
tags: [audyt, mini-gry, refleks, simon, stoper, stoj, rytm, przytrzymaj, zaslona, balon, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-06-FINDINGS.md: sekcje 8 mini-gier na czas i reakcję, każda z Zasadami, Regułami §3 i Testami; wpisy W6a, W6b, RF1-RF5, SQ1-SQ8, SP1-SP6, SJ1-SJ2, BL1"
affects: [01-10]

actuals:
  tasks: 8
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypt audytu poza repo (scratchpad): fuzz06.ts (400 partii każdej gry z losowymi dozwolonymi wynikami i timeoutami, w Balonie z progress; stan zamrożony, JSON round-trip stanu i widoków, drugi wynik odrzucony, stały klucz turn(), zgodność znaku places z record.score/tie dla każdej pary; plus czas najdłuższej uczciwej partii Sekwencji)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-06-FINDINGS.md
  modified: []

key-decisions:
  - "SQ1 (limit 300 s w Sekwencji kasuje serię od ok. 24) jako wysoka waga: nieuczciwy wynik i rekord właśnie w najlepszych partiach; pomiar przekazany do fazy 3 (kryterium 4)"
  - "W6a (Stoper i Rytm bez wyrównania trudności) jako średnia: litera §3 spełniona (sufit 0), duch nie; reguła stałej sumy (a590005) powstała dwa dni po obu losowaniach; pomiar do fazy 3 (REC-01)"
  - "Kara punktowa w Stój! zaliczona do odstępstw z powodem (D-11), bo ZASADY-GIER.md podaje powód"
  - "Nowe klucze zbiorcze: `trudnosc-z-losowania`, `tie-zaokraglenie` (Stój! i 6 gier z innych paczek), `po-koncu`, `wygrana-kazdego`"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "8 mini-gier: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, granice walidacji, limity tury, zasady ekranu wpływające na wynik"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts, sekcji ZASADY-GIER.md i grep w apps/web/src/games/<Gra>.tsx; git log -L (W6a)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 na prawdziwych wynikach, nie tylko timeoutach; limit tury wobec najdłuższej uczciwej partii"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md + fuzz06.ts: 3200 partii, 0 błędów, 2 niezgodności places ↔ rekord w Stój! (W6b)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla 8 gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; 01-01-CHECKS.md §4.2 (K4, Lim, solo, rekord przez index.test.ts)"
        status: pass
    human_judgment: false

duration: 40min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 06: mini-gry na czas i reakcję Summary

**Wszystkie 8 gier zgadza się z `ZASADY-GIER.md` i `KONCEPT.md` w stałych, walidacji i limitach tury, a granice walidacji pasują do dokumentu (100-1000 ms w Refleksie, odchyłki ucięte do celu w Stoperze, Przytrzymaj i Za zasłoną). Jedyny wpis wysokiej wagi: limit 300 s w Sekwencji kasuje wynik gracza, który dojdzie do serii ok. 24. Nowsze gry (Stój!, Rytm, Przytrzymaj, Za zasłoną, Balon) mają pełne testy obowiązkowe; najstarsze (Refleks, Sekwencja, Stoper) mają wszystkie luki tej paczki.**

## Accomplishments

- Porównanie stałych 8 gier z dokumentami: jedna rozbieżność wewnątrz `ZASADY-GIER.md` (RF1: Refleksu brak na liście gier liczonych na serwerze) i jedno niespójne uzasadnienie (BL1); poza tym zgodne, także z `KONCEPT.md`.
- `fuzz06.ts` sprawdził reguły §3 na 3200 partiach z prawdziwymi wynikami: 0 błędów mutacji, JSON, walidacji, drugiego wyniku i klucza `turn()`; wykrył, że Stój! w 2 / 400 partiach rozstrzyga remis inaczej w partii niż w rekordach (W6b, zaokrąglona średnia w `tie`).
- Zestawienie najdłuższej uczciwej partii z limitem tury: 7 gier mieści się z zapasem, Sekwencja nie (SQ1).
- Stoper i Rytm nie wyrównują trudności między partiami, choć reguła stałej sumy z 2026-10-12 objęła podobne gry (W6a).

## Wpisy (szczegóły w 01-06-FINDINGS.md)

- Wysokie: SQ1 (limit 300 s w Sekwencji).
- Średnie: W6a (`trudnosc-z-losowania`), RF2, SQ2, SP1 (`definicja-swieza-gra`), SQ3, SP2 (`setup-ten-sam-seed`), RF3, SQ4, SP3 (`po-koncu`), SQ5 (`brzegi`),
  RF4, SQ6, SP4 (`schemat-smieci`), RF5, SQ7, SP5 (`wygrana-kazdego`), SQ8, SP6 (`stan-mutacja-json`).
- Niskie: W6b, SJ1 (`tie-zaokraglenie`), RF1, SJ2, BL1.
- Odstępstwa z powodem (D-11): kara punktowa w Stój!, brak `nonce` w Przytrzymaj i Za zasłoną, `limits` w widoku Balonu, wynik Sekwencji liczony na kliencie, `playerView` z całym stanem (wszystkie mini-gry).

## Deviations from Plan

- Brak w zakresie zadań. Zadania 1-8 wykonane po kolei w jednym pliku; metoda, przebieg skryptu i tabela limitów opisane raz na górze 01-06-FINDINGS.md, wpisy wspólne kilku gier (W6a, W6b) w osobnej sekcji.
- Przy pierwszym zapisie numery linii testów Rytmu i Za zasłoną pochodziły z ciągłego wydruku dwóch plików; poprawione i sprawdzone grepem przed zakończeniem.

## Verification

- `grep -n "^## " 01-06-FINDINGS.md` → nagłówki Refleks, Sekwencja, Stoper, Stój!, Rytm, Przytrzymaj, Za zasłoną, Balon, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypt w scratchpadzie sesji).

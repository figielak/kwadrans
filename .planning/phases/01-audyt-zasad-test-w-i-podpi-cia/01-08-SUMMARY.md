---
phase: 01-audyt-zasad-test-w-i-podpi-cia
plan: 08
subsystem: games
tags: [audyt, mini-gry, kolo, kolor, kropki, kat, rok, srodek, mapa, tort, nozyczki, zasady, testy, reguły-§3]

requires: ["01-01"]
provides:
  - "01-08-FINDINGS.md: sekcje 9 mini-gier z odchyłką w rundach, każda z Zasadami, Regułami §3 i Testami; wpisy W8a-W8c, KO1-KO9, OD1-OD7, KR1-KR6, RK1, SR1-SR3, TR1, NZ1"
affects: [01-10]

actuals:
  tasks: 9
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Skrypt audytu poza repo (scratchpad): fuzz08.ts (400 partii każdej gry z losowymi dozwolonymi wynikami, w tym 20% najgorszych uczciwych, i timeoutami; Koło z 1-10 próbami; progress w Policz kropki, Kącie i Który rok?; najgorszy uczciwy wynik wobec limitu na 500 seedach; rozrzut ΔE w Odcieniu i kątów w Kącie na 2000 seedach; brzegi walidacji Koła)"

key-files:
  created:
    - .planning/phases/01-audyt-zasad-test-w-i-podpi-cia/01-08-FINDINGS.md
  modified: []

key-decisions:
  - "W8a (Policz kropki: limit czasu = same zera = 240, najgorszy uczciwy 750) pod kluczem `timeout-nie-najgorszy` jako średnia w tej grze: przegrać z limitem można tylko odpowiadając gorzej niż samymi zerami; Kąt i Który rok? mają już poprawny wzór"
  - "W8b (Odcień i Kąt bez wyrównania trudności losowania) pod kluczem `trudnosc-z-losowania`, średnia, pomiar do fazy 3; Który rok? i Mapa (wiedza) oraz Środek, Nożyczki, Tort (błąd względny, komplet) bez wpisów"
  - "SR1 (Środek: limit 60 s, 10 s to odsłony, przesuwanie punktu wydłuża rundę) jako średnia do pomiaru; po pomiarze może być wysoka jak ZK1"
  - "KO1 (Koło bez `ranked`) jako niska: `ranked` kończy partię po pierwszym wyniku, więc Koło nie może go użyć, ale dokument nie opisuje wyjątku"
  - "Limit w Kole (pusta lista kończy próby, zostaje najlepsza) zaliczony do odstępstw z powodem (D-11): próby oddane przed limitem to prawdziwe wyniki"

requirements-completed: [RULE-01, RULE-02, RULE-03]

coverage:
  - id: D1
    description: "9 mini-gier: stałe i zasady kod ↔ ZASADY-GIER ↔ KONCEPT, walidacja, limity tury, czasy odsłon na ekranie"
    requirement: RULE-01
    verification:
      - kind: other
        ref: "lektura <id>.ts, mapa-dane.ts, sekcji ZASADY-GIER.md i KONCEPT.md; grep czasów w apps/web/src/games/{Kolo,Kolor,Szacowanie,Rok,Srodek,Mapa,Tort,Nozyczki}.tsx; git log (W8a, SR1, KO1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reguły §3 na prawdziwych wynikach; limit czasu wobec najgorszego uczciwego wyniku; limit tury wobec najdłuższej uczciwej partii"
    requirement: RULE-02
    verification:
      - kind: other
        ref: "01-01-CHECKS.md + fuzz08.ts: 3600 partii, 0 błędów, 76 partii Policz kropki z limitem wyżej niż wynik (W8a)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tabele zasada → test i testy obowiązkowe §2 dla 9 gier"
    requirement: RULE-03
    verification:
      - kind: other
        ref: "lektura <id>.test.ts; 01-01-CHECKS.md §4.2 (K4, Lim, solo, rekord przez index.test.ts)"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-10-23
status: complete
---

# Phase 1 Plan 08: mini-gry z odchyłką w rundach Summary

**Stałe 9 gier zgadzają się z `ZASADY-GIER.md` i `KONCEPT.md`, a reguły §3 przeszły 3600 partii z prawdziwymi wynikami bez błędu. Jedno złamanie §3: w Policz kropki limit czasu (same zera, 240) jest lepszy od najgorszej uczciwej odpowiedzi (750). Brak wpisów wysokiej wagi; do pomiaru zostaje limit 60 s w Środku. Nowsze pliki testów (Kąt, Mapa, potem Który rok?, Środek, Tort, Nożyczki) mają prawie komplet testów obowiązkowych, najstarsze (Koło, Odcień, Policz kropki) większość luk.**

## Accomplishments

- Porównanie stałych 9 gier z dokumentami: zero rozbieżności kod ↔ dokument; dokument i kod Policz kropki razem łamią §3 (W8a).
- `fuzz08.ts`: 3600 partii, 0 błędów mutacji, JSON, walidacji, drugiego wyniku, klucza `turn()` i zgodności miejsc z rekordami; limit czasu wyżej od uczciwego wyniku tylko w Policz kropki (76 partii).
- Pomiar losowania: ta sama pomyłka suwakiem w Odcieniu kosztuje 4,6-20,4 ΔE zależnie od celu, suma kątów w Kącie 410-1451 (W8b).
- Zestawienie najdłuższej uczciwej partii z limitem tury: 8 gier z zapasem, Środek do pomiaru (SR1).

## Wpisy (szczegóły w 01-08-FINDINGS.md)

- Wysokie: brak.
- Średnie: W8a (`timeout-nie-najgorszy`), W8b (`trudnosc-z-losowania`), SR1, KO9, KO2, OD1, KR1 (`definicja-swieza-gra`), KO3, OD2, KR2 (`setup-ten-sam-seed`),
  KO4, OD4, KR3 (`brzegi`), KO5, OD3, KR4, SR2 (`po-koncu`), KO6, OD5 (`schemat-smieci`), KO7, OD6, KR5, RK1, SR3, TR1, NZ1 (`wygrana-kazdego`), KO8, OD7, KR6 (`stan-mutacja-json`).
- Niskie: KO1, W8c.
- Odstępstwa z powodem (D-11): wyzwanie w widoku od startu, cały stan w widoku, wynik Koła z punktów od klienta, limit w Kole kończy próby i liczy się od nowa po końcu prób innego gracza,
  strefa Środka w px, zniekształcenie rysunku Mapy, `progress` mogący spaść.

## Deviations from Plan

- Brak w zakresie zadań. Zadania 1-9 wykonane w jednym pliku; metoda, przebieg skryptu i tabela limitów opisane raz na górze 01-08-FINDINGS.md,
  wpisy wspólne kilku gier (W8a-W8c) w osobnej sekcji, jak w 01-07. Gry z kompletem testów (Kąt, Mapa) mają skrócony opis testów obowiązkowych, jak Zakupy w 01-07.

## Verification

- `grep -n "^## " 01-08-FINDINGS.md` → nagłówki Narysuj koło, Odcień, Policz kropki, Kąt, Który rok?, Środek, Mapa, Tort, Nożyczki, każdy z podsekcjami Zasady, Reguły §3, Testy.
- `git status --porcelain | grep -v '^.. .planning/'` → 0 wierszy.
- Żadnego pliku skryptu w repo (skrypt w scratchpadzie sesji).

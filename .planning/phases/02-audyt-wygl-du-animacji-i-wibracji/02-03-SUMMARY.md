---
phase: 02-audyt-wygl-du-animacji-i-wibracji
plan: 03
subsystem: web
tags: [audyt, wygląd, animacje, wibracje, ekrany-platformy, game, home, lobby, setup, minigames, records, app]

requires: ["02-01", "02-02"]
provides:
  - "02-03-FINDINGS.md: sekcje Game.tsx, Home.tsx, Lobby.tsx, Setup.tsx i MiniGames.tsx, Records.tsx i App.tsx, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje; wpisy GM-1..GM-10, HM-1..HM-8, LB-1..LB-9, SU-1..SU-4, MG-1..MG-2, RC-1..RC-8, AP-1..AP-2"
affects: [02-11]

actuals:
  tasks: 5
  commits: 0

tech-stack:
  added: []
  patterns:
    - "Audyt statyczny: lektura całych plików, wiersze z 02-01-CHECKS.md jako dowód, wzorce B-xx / W-xx z 02-02-BASELINE.md jako odniesienie; 360×640 z klas Tailwinda i szacunku szerokości znaków (Satoshi ok. 0,5 em, Geist Mono ok. 0,6 em)"

key-files:
  created:
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-03-FINDINGS.md
    - .planning/phases/02-audyt-wygl-du-animacji-i-wibracji/02-03-SUMMARY.md
  modified: []

key-decisions:
  - "Brak wpisów wysokiej wagi: ukrycie licznika w Stoperze, Rytmie, Przytrzymaj i Za zasłoną działa (Game.tsx:208-210), wibracja tury 40 jest raz na zmianę tury (useEffect [myTurn]), żaden ekran platformy nie przewija się w poziomie (statycznie)"
  - "GM-1 (przyciski po partii poza StickyBar, ekran po mini-grze ok. 850-1000 px) jako średnia: „Rewanż” pod zgięciem na 360×640"
  - "GM-2 (pasek limitu Kampus Tour bez koloru gracza) zapisany w Game.tsx, bo tam powstaje Countdown; wyjątek układu z DESIGN.md §6 nie obejmuje koloru"
  - "HM-1 (dwa btn-primary przy pełnym kodzie) jako niska sprzeczność źródeł (D-13): KONCEPT.md §1 i DESIGN.md §3.1 tak to opisują, DESIGN.md §5 przeczy"
  - "HM-8: DESIGN.md §6 twierdzi, że ekrany poza partią mieszczą się w 640 px; ekran główny, lobby, Setup i Rekordy przewijają się w pionie (z StickyBar), więc poprawić opis, nie ekrany"
  - "RC-1 (warning dla liczby gier „Do pobicia”) jako średnia: token w innej roli (D-04, W-02)"
  - "Nowe klucze zbiorcze: wysokosc-640, ladowanie-rekordow, podpis-label, aria-label-span, stan-rozlaczony"

requirements-completed: []

coverage:
  - id: D1
    description: "Wygląd ekranów platformy: tokeny i ich role, akcent, kolor gracza, pola dotykowe, 360×640"
    requirement: UI-01
    verification:
      - kind: other
        ref: "lektura plików + 02-01-CHECKS.md §1-§6; 360×640 statycznie"
        status: pass
    human_judgment: false
  - id: D2
    description: "Teksty, liczby i dostępność: słowa wspólne, przecinek, mono, stany DESIGN.md §4, aria"
    requirement: UI-05
    verification:
      - kind: other
        ref: "lektura plików + 02-01-CHECKS.md §7-§9"
        status: pass
    human_judgment: false
  - id: D3
    description: "Animacje, timery, wibracje: każde animate-[…], transition, setTimeout / setInterval i navigator.vibrate w 7 plikach ocenione"
    requirement: ANIM-01
    verification:
      - kind: other
        ref: "02-01-CHECKS.md §11a, §12, §13, §15; B-35..B-63"
        status: pass
    human_judgment: false
  - id: D4
    description: "Tabele Sytuacje (D-12) dla 5 sekcji, do macierzy w 02-11"
    requirement: ANIM-02
    verification:
      - kind: other
        ref: "02-03-FINDINGS.md, podsekcje Sytuacje"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-10-24
status: complete
---

# Phase 2 Plan 03: ekrany platformy Summary

**Ekrany platformy trzymają się tokenów, jednego akcentu i wzorców z `ui.tsx`; nic nie przewija się w poziomie, licznik jest ukryty tam, gdzie trzeba, a wibracja tury przychodzi raz. Wysokich wpisów nie ma. Średnie to pola dotykowe poniżej 48 px w lobby, przyciski po partii poza `StickyBar`, pasek limitu Kampus Tour bez koloru gracza, wybór trybu sygnalizowany samym kolorem i `warning` w roli zachęty na ekranie „Rekordy”.**

## Accomplishments

- `Game.tsx` (bez części turniejowej): nagłówek, pasek 6 px z `warning` w ostatnich 10 s, `--ambient`, „Oglądasz”, „Rewanż” / „Do lobby”, pigułki z pucharem i „+1” sprawdzone wobec `ZASADY.md` §4 i `DESIGN.md` §3.4; wibracja 40 zgodna; ukrycie paska w Stoperze, Rytmie, Przytrzymaj i Za zasłoną zgodne z `KONCEPT.md` §2.4.
- `Home.tsx`: „Zagraj” jako jedyny wypełniony przycisk w spoczynku, „Dołącz” w akcencie po pełnym kodzie, `Problem` z `role="alert"`, link „zmień”, kolejność sekcji przy `/?kod=` zgodne; wpisy o sprzeczności źródeł (HM-1), stanie ładowania solo i rekordów, wadze ikon i liczbach bez mono.
- `Lobby.tsx`: kod 60 px mono, przycisk udostępniania z `aria-label`, ikony gier i stany kafli zgodne; trzy pola dotykowe poniżej 48 px („Wyjdź” ok. 36 px, próbki koloru 40 px, wiersze graczy 44 px).
- `Setup.tsx` i `MiniGames.tsx`: siatka 3 kolumn, nagłówki grup, „1. miejsce” w kolorze gracza zgodne; tryb zaznaczony tylko kolorem (SU-1).
- `Records.tsx` i `App.tsx`: akordeon, korony lidera, „Pobij” / „Zagraj ponownie”, sekcje, `FORMAT` z przecinkiem zgodne; `warning` w roli zachęty (RC-1), brak paska rozłączenia w „Rekordach” z pokoju (RC-6), pusty ekran przy wznawianiu (AP-1).
- Pięć tabel Sytuacje dla 02-11.

## Wpisy (szczegóły w 02-03-FINDINGS.md)

- Wysokie: brak.
- Średnie: GM-1, GM-2, LB-1, LB-2, LB-3 (`dotyk-48`), SU-1, RC-1.
- Niskie (36): GM-3 (`stan-rozlaczony`), GM-4, HM-4, LB-7 (`liczby-mono`), GM-5 (`aria-label-span`), GM-6, GM-7, HM-6, LB-6, MG-2, RC-5 (`waga-ikon`), GM-8, LB-8 (`animate-tailwind`), GM-9 (`brak-w-tabeli-5`), GM-10, LB-9, SU-4, RC-8 (`transition-domyslny`), HM-1, HM-2, HM-3, HM-5, HM-7, MG-1 (`ladowanie-rekordow`), HM-8 (`wysokosc-640`), LB-4 (`stan-rozlaczony`), LB-5, RC-4 (`podpis-label`), SU-2, SU-3, RC-2, RC-3, RC-6, RC-7, AP-1, AP-2.
- Odstępstwa z powodem: ukryty pasek w 4 grach, własne nagłówki Państw-miast i Kalamburów, układ Kampus Tour, poświata w Kalamburach, ikona wyzwania dnia w akcencie, „Dołącz” w akcencie z pełnym kodem, zdanie zamiast wyszarzonego startu.

## Deviations from Plan

- Plan każe opisać każdy plik osobno; wpis o wysokości ekranów poza partią (HM-8) jest wspólny dla Home, Lobby, Setup i Records, więc stoi raz w sekcji Home jako osobna podsekcja z kluczem `wysokosc-640`, a pozostałe sekcje odsyłają do niego.
- Komponenty `Players`, `StartBar`, `Tile`, `GameTile` (Lobby.tsx) i `RecordList`, `RecordPanel` (Records.tsx) ocenione raz, w sekcji pliku, w którym są zdefiniowane; `Setup`, `MiniGames` i `Game` odsyłają.
- Praca przerwana limitem API i wznowiona na prośbę koordynatora; lektura plików z pierwszej części wykorzystana bez zmian (kod nie zmienił się w międzyczasie, repo poza `.planning/` czyste).

## Verification

- `grep -n "^## \|^### " 02-03-FINDINGS.md` → sekcje Game.tsx, Home.tsx, Lobby.tsx, Setup.tsx i MiniGames.tsx, Records.tsx i App.tsx, każda z podsekcjami Wygląd, Teksty, Animacje, Sytuacje.
- Każde `navigator.vibrate` (1: `Game.tsx:35`), każde użycie keyframes (`Game.tsx:243`, `:306`, `:311`, `:525`, `:596`, `Lobby.tsx:68-69`, `Records.tsx:144`), każde przejście z CHECKS §12 i każdy timer z CHECKS §13 (`Game.tsx:582`, `Lobby.tsx:417`, `:428`) ma ocenę.
- `git status --porcelain | grep -v '^.. .planning/' | wc -l` → 0.
- Em-dashy w FINDINGS: 0.

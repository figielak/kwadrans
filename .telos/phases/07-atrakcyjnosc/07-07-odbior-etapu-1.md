---
id: 07-07
title: "Etap 1: odbiór na 360×640"
type: code
status: done
critical: false
effort: normal
depends: [07-05, 07-06]
decisions: [D-08]
scope: ["apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/index.css", "apps/web/src/screens/results.test.ts", "DESIGN.md", "ZASADY.md"]
---
## Goal
Wyniki, odsłona i ekran główny są dopracowane na telefonie, a etap 1 nadaje się do wieczoru z ludźmi.

## Read first
- DESIGN.md §1
- ZASADY.md §4
- ZASADY.md §5
- ZASADY.md §6

## Files
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Records.tsx (modify)
- apps/web/src/screens/Home.tsx (modify)
- apps/web/src/index.css (modify)
- apps/web/src/screens/results.test.ts (modify)
- DESIGN.md (modify)
- ZASADY.md (modify)

## Constraints
- Lekcja 05-09: 360×640 z realnym nagłówkiem, 2 i 6 graczami, długimi nickami i obserwatorem.
- Lekcje [tests]: drugi gracz przez `http://127.0.0.1:5173`, Vite z `--host`; restart serwera zeruje limit 3 pokoi na IP.
- Testy tylko rozszerzać. Serwerów dev nie ubijać po pracy.
- Tylko poprawki odbioru, bez nowych funkcji.

## Tests (write first)
- `results.test.ts`: test na każdy błąd logiki znaleziony w odbiorze

## Steps
- Przejdź `/dev?n=1`, `?n=2`, `?n=3`, `?n=6`: mini-gra, gra główna, turniej, Kampus Tour na 4 graczy, obserwator.
- Sprawdź `prefers-reduced-motion` i odświeżenie w każdej fazie.
- Popraw hierarchię i odstępy; zmieniony wzorzec opisz w DESIGN.
- Zapisz w Result przebieg i pozostałe rozbieżności.

## Acceptance
- [x] all listed tests pass
- [x] `pnpm typecheck` → exit 0
- [x] `pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Zrzuty 360×640 sprawdzone przy 1, 2 i 6 graczach oraz obserwatorze

## Result
Przegląd etapu 1 na `127.0.0.1:5173` (Playwright, bez restartu serwera): Mapa 2 graczy z rewanżem, Stoper 6 graczy (odsłona 0,6 s na wiersz, tytuł ostatni), obserwator, walkower w Gomoku i Kampusie na 2 graczy (wiersz pod tytułem podsumowania), przerwany Kampus na 4 graczy (bez wierszy, „Remis”), ekran główny z linku, 360×640 z długim nickiem („Wojciech Kowalski” zawija się, przyciski 48 px, bez przewijania w bok).
`prefers-reduced-motion`: bez pokazu, wszystkie wiersze i tytuł od razu; odświeżenie w `over`: całość od razu; rewanż znów odsłona. Błędów logiki nie znalazłem, więc bez nowych testów (256 w web); dopisany tylko DESIGN §3.6 (wzorzec wyniku po partii), build przechodzi.
Rozbieżności bez zmian (poza zakresem „tylko poprawki odbioru”): „Nowy rekord!” pojawia się też przy 6. miejscu z 7, gdy to poprawa własnego rekordu (zasada sprzed etapu 1); w turnieju przerwana gra pokazuje kafel „Remis” bez wierszy; Kampus z 4 osobami po wyjściu jednej kończy się bez zwycięzcy (zasada platformy). Solo: na 360×640 sprawdziłem ekran gry (Dziesiątki, bez przewijania w bok), a ekran po partii solo (bez bohatera, „Jeszcze raz” i „Wyjdź”) w 07-04 tekstem, bez zrzutu. Nie sprawdzałem turnieju do końca ani odświeżenia w każdej fazie; odświeżenie w `over` i w `playing` sprawdzone.
Deviations: none

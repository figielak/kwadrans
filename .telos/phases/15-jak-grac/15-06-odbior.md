---
id: 15-06
title: "Odbiór techniczny kart Jak grać"
type: audit         # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [15-05]         # task IDs, e.g. [01-01]
decisions: [D-02, D-06]       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Sprawdzić w przeglądarce na prawdziwym serwerze, że obie drogi do zasad działają i mieszczą się na 360×640.

## Read first
- ZASADY.md §4
- ZASADY.md §6
- .telos/phases/15-jak-grac/15-CONTEXT.md

## Files

## Constraints
- Bez próby z ludźmi i bez zadania na fizycznym telefonie; faza kończy się na odbiorze technicznym.
- Wady zapisać w Result; poprawki idą osobnym zadaniem albo `/telos:revise`, nie w tym zadaniu.
- Serwery dev (:2567, :5173) zostają włączone po pracy.
- Limit 3 pokoi na IP: przy dłuższym przebiegu restart serwera dev go zeruje.

## Steps
- `Setup` na 360×640 u gospodarza i gościa: sekcja zwinięta, po rozwinięciu przewija się, a `StartBar` jest dostępny; po jednej grze z każdego rodzaju układu, w tym Kampus Tour.
- Ikona w partii dla 2 i 6 graczy z długimi nickami, w nagłówku `compact`, u obserwatora; tytuł i kropki nie wypadają poza ekran.
- Państwa-miasta i Kalambury: ikona w ich własnym nagłówku.
- Okienko: otwarcie, X, Esc, dotknięcie tła, przewijanie karty Kampus Tour; po zamknięciu fokus wraca na ikonę.
- Okienko otwarte podczas ruchu innego gracza i zmiany fazy nie zamyka się ani nie resetuje gry; ruch wykonany po zamknięciu przechodzi.
- Mini-gra i Turniej nie pokazują ikony ani sekcji.

## Acceptance
- [x] Wszystkie kroki sprawdzone, wyniki w Result
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0

## Result
Przebieg: Chromium 360×640, serwer dev, osobne konteksty z długimi nickami (limit nicka ~16 znaków), Setup i partia: Kampus Tour, Statki (tryby), Gomoku 2 os. + obserwator, Podróbka 6 os., Państwa-miasta i Kalambury 3 os., solo mini-gra i Szybka seria. Zrzuty w scratchpadzie sesji.
OK: sekcja zwinięta, po rozwinięciu strona się przewija, StartBar stoi na dole (u gospodarza i gościa); `summary` i ikona 48 px; ikona w nagłówku `compact` przy 6 kropkach i długich nickach, bez wypadania poza ekran (scrollWidth 360), u obserwatora; Państwa-miasta i Kalambury mają ikonę we własnym nagłówku; okienko: otwarcie, X, Esc, tło, fokus wraca na ikonę, przewija się (w oknie 360×360); zostało otwarte przez zmianę fazy i rundy (Podróbka, limit 30 s), a ruch po zamknięciu przeszedł; mini-gra, Szybka seria i ekran Turnieju bez ikony i sekcji.
WADY (do osobnego zadania lub `/telos:revise`):
1. Kampus Tour w partii nie ma ikony „?”: `Game.tsx:173` wczesnym `return` pomija wspólny nagłówek, a własny układ (obrócona plansza, `KampusTour.tsx`) nie dostał `RulesButton`. Najdłuższa karta jest dostępna tylko w `Setup`; okienko trzeba tam osadzić z uwzględnieniem obróconego układu (top layer `<dialog>` nie dziedziczy obrotu).
2. Ikona „?” ma okrągły obrys (`btn-ghost`), a sąsiednia emotka nie, więc w nagłówku wyglądają niespójnie.
3. Wiersz tytułu z X przewija się razem z treścią; przy długiej karcie (Kampus ~1700 znaków) po przewinięciu zamknięcie to Esc albo tło. Przykleić wiersz tytułu (`sticky`).
4. Poza zakresem: po głosowaniu „Inna gra” gra główna rusza bez ekranu `Setup`, więc nowa osoba nie ma spokojnej chwili na kartę (ikona zostaje, czas tury biegnie). Do rozważenia jako osobne zadanie.
5. Do sprawdzenia: aktywne pole tekstowe w Państwach-miastach i Podróbce ma czerwono-różowy obrys, co jest sprzeczne z regułą „kolor gracza zamiast czerwieni”.
Nie sprawdzone osobno: Wyprawa, Chińczyk, Memory, Labirynt (wspólna ścieżka `Game.tsx`, jak Gomoku i Statki).
`telos accept` przy pierwszym biegu zgłosił błąd testu web pod obciążeniem przeglądarek, po powtórzeniu bez nich: 577/577 i PASS.
Deviations: none

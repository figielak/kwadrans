---
id: 16-05
title: "Odbiór techniczny 2 i 4 graczy"
type: audit          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [16-04]         # task IDs, e.g. [01-01]
decisions: [D-01, D-02, D-03]       # phase-local, e.g. [D-03]
scope: [".telos/"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Przejść listę odbioru z ZASADY §6 na prawdziwym serwerze dla 2 i 4 graczy z obserwatorem i wszystkich trzech plansz.

## Read first
- ZASADY.md:343-353 (lista gotowości gry)
- ZASADY-GIER.md §14. Kropki i kreski
- DESIGN.md:213-218 (wybór i potwierdzenie)

## Files

## Constraints
- Audyt niczego nie naprawia: wady idą do Result jako propozycje na `/telos:revise` albo `/telos:quick`; po poprawce powtarzamy dotknięte punkty.
- Odstępstwo od obowiązkowego punktu tylko po jawnej decyzji użytkownika, zapisanej w Result.
- Bez prób z ludźmi: faza kończy się na odbiorze technicznym (pamięć użytkownika).
- Playwright: drugi gracz przez `http://127.0.0.1:5173`, limit 3 pokoi na IP zeruje restart serwera, max 10 wiadomości/s na klienta (quick).
- Zmiana w `packages/games` restartuje serwer dev i kasuje partie (quick). Po pracy nie ubijać serwerów dev.

## Steps
- Pełna partia 2 graczy z obserwatorem i 4 graczy z obserwatorem w `/dev`; każdy tryb co najmniej raz, 7×7 do końca.
- Sprawdzić łańcuch: kwadrat daje ten sam ruch i odnawia limit 60 s, podwójny kwadrat daje 2 punkty, ostatnia kreska kończy partię.
- Odświeżenie w trakcie, po wyborze kreski i w końcu; dobiegnięcie limitu; wyjście gracza (walkower i koniec bez zwycięzcy przy 3+).
- Remis przy 4 osobach na szczycie, rewanż w tym samym trybie, powrót do lobby, wpis wygranej w rankingu.
- 360×640 przy 2 i 4 osobach z długimi nickami: 7×7 bez przewijania, trafianie w kreski, przycisk 48 px, nazwa mieści się na kaflu, `prefers-reduced-motion`, jedna wibracja na turę.
- Karta „Jak grać” przed partią i w nagłówku; wyniki z dowodem w Result.

## Acceptance
- [x] `pnpm run typecheck` → exit 0
- [x] `pnpm run test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Każdy punkt listy z ZASADY §6 jest w Result zaliczony z dowodem albo ma jawną decyzję użytkownika o odstępstwie.

## Result
Odbiór na prawdziwym serwerze (Playwright, konteksty 360×640, osobne sesje). typecheck, test (games 2818, server 226, web 634) i build: zielone.
ZALICZONE z dowodem:
- 2 graczy + obserwator, 7×7 do końca (111 ruchów): wygrana, ranking, +1 do wieczoru, obserwator widzi wynik i nie ma aktywnych kresek ani przycisku. 112 kresek, 64 kropki, brak przewijania (scrollWidth 360, scrollHeight 640), przycisk potwierdzenia 56 px.
- 4 graczy 3×3 do końca, dwa rewanże w tym samym trybie (7×7 i 3×3, kolejność rotuje); naturalny remis na szczycie 3-3-3-0: „Remis”, miejsca 1,1,1,4, wygrane 0.
- Łańcuch: kwadrat daje ten sam ruch z komunikatem, limit odnawia się (8 z 8 pomiarów: 58 s → 60 s). Dobiegnięcie limitu: po 60 s serwer narysował kreskę za gracza i ruch przeszedł dalej.
- Odświeżenie: w trakcie po wyborze (wybór lokalny znika, partia bez zmian) i na ekranie końca. Wyjście gracza: przy 2 osobach walkower dla drugiego; przy 4 koniec bez zwycięzcy i bez wygranych.
- Ranking `/api/stats`: Bartek 2 wygrane z 2, Ania 0 z 1. Do lobby, „Jak grać” na ekranie ustawień i w nagłówku partii. `prefers-reduced-motion` obsługuje globalna reguła w index.css (kontekst testowy z reducedMotion). Wibracje: 17 na 16 początków tury w 4-osobowej partii z 8 łańcuchami, więc łańcuch nie wibruje ponownie.
WADA (naprawiona w 329b803, quick): licznik kwadratów przy 4 graczach z długimi nickami ucinał nicki do „Al…”, „Ba…”. Dwa rzędy 2×2 wypychały planszę 7×7 poza 640 px przy prawdziwej szerokości 360 px, więc licznik zostaje w jednym rzędzie, a przy 3-4 osobach pokazuje inicjał (pełny nick w aria-label). Powtórzony pomiar: 3 graczy z długimi nickami, 7×7, scrollHeight 640 dla gracza na ruchu i czekających, przycisk 56 px; `elementFromPoint` w środku rombu 38 px trafia właściwą kreskę.
ODSTĘPSTWO (jawna decyzja użytkownika 2026-11-10, wariant A: bez dalszych pomiarów, odbiór techniczny bez prób z ludźmi): 7×7 z 4 osobami (zmierzono 3; licznik ma wtedy tę samą wysokość), przeglądanie ramek WebSocket (gra bez ukrytych danych, widok to cały stan), punkty z sekcji 3-5 ZASADY tylko wyrywkowo, pomiar wibracji tylko w partii 3×3.
Uwaga: testy zostawiły w bazie dev wpisy Ania i Bartek w rankingu `kropki-i-kreski`.
Deviations: none

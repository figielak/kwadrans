---
id: 16-05
title: "Odbiór techniczny 2 i 4 graczy"
type: audit          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
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
- [ ] `pnpm run typecheck` → exit 0
- [ ] `pnpm run test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Każdy punkt listy z ZASADY §6 jest w Result zaliczony z dowodem albo ma jawną decyzję użytkownika o odstępstwie.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

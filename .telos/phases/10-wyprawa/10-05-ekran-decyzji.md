---
id: 10-05
title: "Ekran szlaku, obozu i decyzji"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [10-03]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/games/Wyprawa.tsx", "apps/web/src/games/Wyprawa.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zbudować ekran fazy `decision` na szlaku i w obozie: pełna informacja o ryzyku, tajny wybór z „Gotowe” i brak akcji dla obserwatora.

## Read first
- ZASADY.md:142-218 (spójność wyglądu, słownik ról)
- ZASADY.md:219-249 (animacje, tabela czasów)
- DESIGN.md:180-190 (wypełniona akcja w kolorze gracza)
- apps/web/src/screens/ui.tsx:573-590 (Stats)
- apps/web/src/screens/ui.tsx:759-765 (StickyBar)
- apps/web/src/screens/ui.tsx:897-910 (useFresh)
- apps/web/src/games/Sabotaz.test.tsx:1-6 (import komponentu i render statyczny)

## Files
- apps/web/src/games/Wyprawa.tsx (create)
- apps/web/src/games/Wyprawa.test.tsx (create)

## Constraints
- Widoki w testach pochodzą z prawdziwego `playerView` po legalnych ruchach.
- Lokalny wybór jest związany z kluczem nonce/wyprawa/odkrycie: zmiana klucza kasuje go, więc „Gotowe” nie wyśle starej decyzji (rozszerza plan, który wspomina tylko nonce).
- Ekran mówi wprost: „Bez Gotowe po czasie wracasz”, bo timeout to „Wracam”, a niezatwierdzony wybór nie dociera do serwera.
- Jawna jest gotowość, nie treść: cudzy wybór dopiero z `last`. Własny wybór w kolorze gracza z drugim sygnałem (`aria-pressed` i ikona), bez czerwieni.
- Fazy `summary` i `over` są stubem do 10-06; podpięcie w 10-07.
- `card-in` tylko dla karty nowej względem pierwszego otrzymanego stanu (`useFresh`), zysk `float-up`; animacja nie blokuje wyboru. Bez nowych keyframes; każdy nowy trafia do ZASADY §5, inaczej padnie `animations.test.ts` (05-35).
- Zagrożenie i utrata zdobyczy bez dodatkowej wibracji; ekran nie woła `navigator.vibrate`, zwykłą wibrację nowej decyzji daje `Game.tsx`.
- Ikony Phosphor są już w projekcie (np. `Mountains`, `Waves`, `Bug`, `Bridge`, `Tent`, `Footprints`); bez nowych zależności.
- Cały szlak w szczególe otwieranym dotknięciem, od razu bez `card-in`; aktywny ekran nie rysuje 20 dużych kart.
- Cele 48 px, tylko tokeny, ciemny motyw, bez em-dashy; status „Czekamy na: {nicki}” daje nagłówek w `Game.tsx`, ekran go nie powtarza.

## Tests (write first)
- Pokazuje „Wyprawa 2/5”, bank, carried i loose z rozróżnialnymi podpisami dla gracza na szlaku.
- Główna karta pokazuje skarb albo zagrożenie, a pięć liczników pokazuje nazwę, ikonę i liczbę odkryć.
- Lista 2 i 6 graczy ma znak szlak/obóz i gotowość, bez treści cudzych wyborów przed rozstrzygnięciem.
- „Gotowe” jest nieaktywne bez wyboru, a dotknięcie opcji nie wysyła ruchu.
- Zatwierdzenie buduje `choose` ze stemplem z widoku.
- Lokalny wybór znika przy nowym odkryciu, nowej wyprawie i rewanżu.
- Po zatwierdzeniu i przeładowaniu widać własny wybór z `myChoice`, bez aktywnych przycisków.
- W obozie jest tekst „Jesteś w obozie. Czekasz na koniec wyprawy” i publiczne wydarzenia, bez akcji.
- Obserwator i obce id nie mają akcji ani prywatnych danych.
- Ostatnie decyzje, podział i ostatnia karta z `last` są widoczne w następnej decyzji.
- Szczegół szlaku zawiera wszystkie odkryte karty i żadnej nieodkrytej.

## Steps
- Napisać testy na widokach z prawdziwych ruchów.
- Wydzielić czyste `currentDraft(draft, view)` i `moves(view, draft)`.
- Zbudować `WyprawaBoard` z nagłówkiem liczników, kartą, zagrożeniami, graczami i `StickyBar`.
- Dodać widok obozu, ostatnie rozstrzygnięcie i szczegół szlaku.
- Dodać animacje nowej karty i zysku przez `useFresh`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/games/Wyprawa.test.tsx src/tokens.test.ts src/animations.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

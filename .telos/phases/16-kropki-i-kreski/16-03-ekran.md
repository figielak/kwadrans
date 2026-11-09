---
id: 16-03
title: Ekran planszy z wyborem kreski
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [16-02]         # task IDs, e.g. [01-01]
decisions: [D-02, D-03]       # phase-local, e.g. [D-03]
scope: ["apps/web/src/games/KropkiIKreski.tsx", "apps/web/src/games/KropkiIKreski.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zbudować ekran partii: plansza kropek i kresek z wyborem i potwierdzeniem, kwadraty w kolorach graczy i licznik kwadratów.

## Read first
- apps/web/src/games/PiecWRzedzie.tsx:14-49 (wybór, `useFresh`, nazwa pola)
- apps/web/src/games/PiecWRzedzie.tsx:129-156 (przycisk potwierdzenia, stan czekania)
- apps/web/src/games/Wyprawa.test.tsx:1-30 (testy ekranu z prawdziwego `playerView`)
- apps/web/src/screens/ui.tsx:897-902 (`useFresh`)
- apps/web/src/index.css:223-230 (`stone-pop`)
- apps/web/src/index.css:269-275 (`line-draw`)
- ZASADY.md:193-197 (wyjątek gęstych plansz)
- DESIGN.md:213-214 (wybór i potwierdzenie)
- ZASADY.md §5. Spójność animacji i wibracji

## Files
- apps/web/src/games/KropkiIKreski.tsx (create)
- apps/web/src/games/KropkiIKreski.test.tsx (create)

## Constraints
- D-03: na każdej planszy pierwsze dotknięcie wybiera, drugie w tym samym miejscu albo przycisk min. 48 px w kolorze gracza wysyła ruch; przycisk nazywa wybór: „Postaw kreskę A1-B1”.
- Cele dotykowe: prawdziwe `<button>` w kształcie rombu (`clip-path`) rozpięte między dwiema kropkami, nad SVG; margines planszy 0,5 pola, żeby romby brzegowe nie dawały przewijania w bok.
- Kreska postawiona jest neutralna, ostatnia ma kolor gracza; kwadrat ma kolor właściciela i inicjał z `initials`, więc nie opiera się na samym kolorze.
- Plansza 7×7 i licznik mieszczą się na 360×640 bez przewijania; tylko ciemny motyw i tokeny, kolor gracza zamiast czerwieni, teksty bez em-dashy (PROJECT).
- Komponent nie wibruje (robi to `Game.tsx`), a stan zastany przy wejściu się nie animuje; animacje tylko z istniejących `stone-pop` i `line-draw`.
- Wybór liczony z widoku: znika, gdy kreska jest zajęta albo gracz nie ma ruchu.

## Tests (write first)
- rysuje `(n+1)²` kropek, wszystkie kreski i kwadraty dla 3×3 i 7×7
- wolna kreska jest przyciskiem z nazwą kropek, a zajęta i cudza tura są wyłączone
- obserwator (`canMove: false`) nie ma aktywnych kresek ani przycisku
- bez wyboru przycisk mówi „Wybierz kreskę” i jest wyłączony
- wybór pokazuje podgląd na planszy i przycisk „Postaw kreskę A1-B1”
- `tap` wybiera przy pierwszym dotknięciu, wysyła `{ edge }` przy drugim w tym samym miejscu, a inne miejsce zmienia wybór
- kolejny ruch po własnym kwadracie pokazuje komunikat o następnej kresce
- czekający widzi, kto się zastanawia; po końcu partii nie ma komunikatu ani przycisku
- licznik pokazuje kwadraty każdego gracza przy 2 i 4 osobach, kwadrat ma inicjał właściciela
- stan zastany nie ma klas animacji
- plik nie woła `navigator.vibrate` ani `useHarm` i nie ma em-dasha

## Steps
- Napisać `KropkiIKreski.test.tsx` na widokach z `GAMES["kropki-i-kreski"].playerView`.
- Napisać czystą funkcję `tap(picked, edge)`, nazwę kreski i `Board` przyjmujący `picked`.
- Złożyć `KropkiIKreski` z licznikiem, planszą, komunikatami i `StickyBar` jak w Gomoku.
- Dodać animację nowej kreski i kwadratu przez `useFresh`.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/games/KropkiIKreski.test.tsx` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

---
id: 07-05
title: "Etap 1: kod wyników i solo (Codex)"
type: code
status: approved
critical: false
effort: hard
depends: [07-04]
decisions: [D-01, D-09]
scope: ["apps/server/src/LobbyRoom.ts", "packages/games/src/lobby.ts", "apps/web/src/screens/results.ts", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/Home.tsx", "apps/web/src/games/Balon.tsx", "apps/web/src/index.css", "ZASADY.md"]
---
## Goal
Działająca, prosta wersja ekranu wyników, solo bez limitu instrukcji i nowy ekran główny. Wygląd dopracuje 07-06.

## Read first
- apps/server/src/LobbyRoom.ts:340-354 (startMatch)
- packages/games/src/lobby.ts:24-54 (RoomView)
- apps/web/src/screens/Game.tsx:425-504 (po partii)
- apps/web/src/screens/Game.tsx:541-586 (OverActions)
- apps/web/src/screens/ui.tsx:411-495 (Intro)
- apps/web/src/screens/ui.tsx:504-509 (useFresh)
- apps/web/src/screens/Records.tsx:115-130 (RecordPanel)
- apps/web/src/screens/Home.tsx:218-275 (znajomi)

## Files
- apps/server/src/LobbyRoom.ts (modify)
- packages/games/src/lobby.ts (modify)
- apps/web/src/screens/results.ts (create)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Records.tsx (modify)
- apps/web/src/screens/Home.tsx (modify)
- apps/web/src/games/Balon.tsx (modify)
- apps/web/src/index.css (modify)
- ZASADY.md (modify)

## Constraints
- Wykonawca: Codex. Testy z 07-04 są gotowe: nie zmieniaj ich ani dokumentów. Zła zasada: zatrzymaj się i opisz problem. Bez commitu, bez `.telos/`. `ZASADY.md` tylko katalog animacji (lekcja 05-35).
- Własne ekrany końcowe gier bez zmian: trafiają pod „Szczegóły”, a ekran „Rekordy” dalej ich używa.
- Lekcja 05-14: dotknięcie kończy odsłonę bez wysyłania ruchu; przyciski działają od początku.
- Bez nowych keyframes, jeśli wystarcza istniejący katalog.

## Tests (write first)
- `results.test.ts`: heroResult, revealOrder, bestRound
- `tables.test.tsx`: RoundTable z `best={false}` nie daje linii
- `LobbyRoom.test.ts`: limit instrukcji solo i `skipIntro`
- `hierarchy.test.ts`: główny przycisk ekranu głównego

## Interface
- heroResult({ result, seats, scoreOf?, gap?, format?, me, nick }) → { title, rows: { id, place, score?, gap? }[] }
- revealOrder(rows) → rows od ostatniego do pierwszego
- bestRound(rows) → { round, id, error } | null
- RoomView.game.skipIntro: boolean  // rewanż solo: Intro woła start() przy montażu
- <ResultHero/> i <details>Szczegóły</details> w Game.tsx; RoundTable przez portal wstawia linię najlepszej rundy do slotu bohatera, poza nim nic nie rysuje

## Edge cases
- gra główna bez `record` → wiersze bez liczby
- wynik `{}` (przerwana) → bez wierszy i bez punktów
- remis na górze → tytuł „Remis”, to samo miejsce, różnica pusta
- 1 gracz → bez bohatera z tabelą, jak dziś
- `me=""` → bez „ty” i bez linii rekordu
- Balon (`best={false}`) → bez linii rundy
- ekran „Rekordy” → brak slotu, brak linii

## Steps
1. `LobbyRoom.startMatch`: przy `seats.length === 1` bez timera; `skipIntro` po rewanżu solo.
2. `results.ts`: czyste funkcje z Interface.
3. `ui.tsx`: `ResultHero` z odsłoną (0,6 s na wiersz przy 3+, `useFresh` bez odsłony po odświeżeniu); `Intro` ze `skipIntro`; slot w `RoundTable`.
4. `Game.tsx`: bohater nad szczegółami, „Szczegóły” zwinięte, panel rekordów zwinięty do linii bez rekordu i awansu.
5. `Home.tsx`: kolejność sekcji i główny przycisk.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0

## Result

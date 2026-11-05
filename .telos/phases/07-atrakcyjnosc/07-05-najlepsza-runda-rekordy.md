---
id: 07-05
title: "Etap 1: linia najlepszej rundy i zwinięty panel rekordów"
type: code
status: approved
critical: false
effort: normal
depends: [07-04]
decisions: [D-08]
scope: ["apps/web/src/games/Balon.tsx", "apps/web/src/games/Mapa.tsx", "apps/web/src/games/Tort.tsx", "apps/web/src/games/Nozyczki.tsx", "apps/web/src/games/Srodek.tsx", "apps/web/src/games/Zaslona.tsx", "apps/web/src/games/Szacowanie.tsx", "apps/web/src/games/Rok.tsx", "apps/web/src/screens/ui.tsx", "apps/web/src/screens/Game.tsx", "apps/web/src/screens/Records.tsx", "apps/web/src/screens/results.ts", "apps/web/src/screens/results.test.ts", "apps/web/src/screens/tables.test.tsx"]
---
## Goal
Gry z tabelą rund dają jedną linię najlepszej chwili przy zwiniętych „Szczegółach”, a panel rekordów zwija się do linii, chyba że padł rekord albo awans.

## Read first
- apps/web/src/screens/ui.tsx:308-405 (RoundTable)
- apps/web/src/games/Mapa.tsx:100-122 (nazwy miast w children)
- apps/web/src/games/Tort.tsx:135
- apps/web/src/games/Nozyczki.tsx:100
- apps/web/src/games/Balon.tsx:86
- apps/web/src/screens/Records.tsx:115-160 (RecordPanel)

## Files
- apps/web/src/games/Balon.tsx (modify)
- apps/web/src/games/Mapa.tsx (modify)
- apps/web/src/games/Tort.tsx (modify)
- apps/web/src/games/Nozyczki.tsx (modify)
- apps/web/src/games/Srodek.tsx (modify)
- apps/web/src/games/Zaslona.tsx (modify)
- apps/web/src/games/Szacowanie.tsx (modify)
- apps/web/src/games/Rok.tsx (modify)
- apps/web/src/screens/ui.tsx (modify)
- apps/web/src/screens/Game.tsx (modify)
- apps/web/src/screens/Records.tsx (modify)
- apps/web/src/screens/results.ts (modify)
- apps/web/src/screens/results.test.ts (modify)
- apps/web/src/screens/tables.test.tsx (modify)

## Constraints
- `RoundTable` przez portal wstawia linię do slotu bohatera; poza nim (ekran „Rekordy”) nic nie rysuje.
- Balon: `best={false}`, bo `errors` to stuknięcia, nie błędy. Przytrzymaj bez linii, cisza pomiaru.
- Solo: panel rekordów zostaje pełny, bo to jedyna treść po partii. Zwija się tylko przy bohaterze.
- Pełny panel przy rekordzie lub awansie z istniejącym `set-glow`, bez nowych keyframes.
- Największy tekst zostaje przy bohaterze: panel nie konkuruje z wynikiem z ludźmi.

## Tests (write first)
- `bestRound`: jedyny najmniejszy błąd → `{ round, id, error }`; remis i puste `errors` → null
- `bestRoundLine` daje „Najlepsza runda: Ola, Gdańsk, 4 km”; z `best: false` daje null
- bez `labels`: liczbowy nagłówek „runda 2”, tekstowy („4 kaw.”) zostaje; `shortUnit` zastępuje długi `unit` Tortu
- źródła: Mapa przekazuje `labels`; Tort, Nożyczki, Środek, Zasłona, Szacowanie, Rok mają `shortUnit`
- `recordSummary`: zwykła partia → jedna linia; rekord, awans, pierwszy wynik → pełny panel; obserwator bez linii

## Steps
- Testy `bestRound`, `bestRoundLine`, `recordSummary`.
- `results.ts`: `bestRound`, `recordSummary`; `ui.tsx`: `bestRoundLine`, nowe propsy `labels`, `shortUnit`, `best`, portal do slotu.
- Gry: `labels` w Mapie; `shortUnit`: Tort, Nożyczki, Środek „%”, Zasłona „s”, Rok „l.”, Szacowanie pusty.
- `Records.tsx`, `Game.tsx`: zwinięty panel obok bohatera.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/screens/results.test.ts` → exit 0
- [ ] `pnpm --filter web exec vitest run src/screens/tables.test.tsx` → exit 0
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm test` → exit 0
- [ ] Odbiór w `/dev?n=2`: linia w Mapie widoczna przy zwiniętych „Szczegółach”

## Result

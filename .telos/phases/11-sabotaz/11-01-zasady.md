---
id: 11-01
title: "Sabotaż: zasady i kontrakt v1"
type: doc
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal
depends: []
decisions: ["D-01","D-02","D-03"]
scope: ["ZASADY-GIER.md","KONCEPT.md","ZASADY.md"]
---
## Goal
Utrwalić zaakceptowane zasady SAB-01..03 przed testami; ustalić jednoznaczny kontrakt danych i odbioru.

## Read first
- .planning/SABOTAZ-PLAN.md §1–6
- .telos/phases/11-sabotaz/11-CONTEXT.md §Decisions
- ZASADY.md §1. Co ustalić, zanim powstanie jakikolwiek plik
- KONCEPT.md §3. Architektura
- packages/games/src/core.ts:14-44 (GameDefinition)

## Files
- ZASADY-GIER.md (modify)
- KONCEPT.md (modify)
- ZASADY.md (modify)

## Constraints
- D-01: 6 rund, 3+1, bez eliminacji, 2/1/0, limity 30/60/15 s; D-02: automatyczny ostatni cudzy stos.
- D-03: odbiór 3 + obserwator i osobno 6; bez zwiększania liczby osób w pokoju.
- Nie utożsamiać 6 rund z limitem 15 minut ani nie deklarować potwierdzonego balansu.
- Źródła prawdy wygrywają ze szkicami; każda zmiana zasad lub słów UI aktualizuje właściwy dokument (.telos/LESSONS.md, docs/05-01).
- Commit tylko na prośbę; nie korzystać ze starej zgody w PROJECT.md.





## Steps
- ZASADY-GIER.md: dodać wiersz i sekcję Sabotaż z fazami, punktacją, timeoutami, widokami oraz wszystkimi stałymi.
- ZASADY-GIER.md: doprecyzować round 0..5, stos od dołu do góry, nonce/rundę w każdym ruchu i numer decyzji w ruchach turowych; duplikaty initial/next odrzuca gotowość gracza.
- ZASADY-GIER.md: opisać wspólny termin initial/summary, jawność zakończonych rund i zatrzymanie odsłaniania na celu lub pułapce.
- KONCEPT.md: dodać grę do katalogu z trwałym id sabotaz; ZASADY.md: dopisać przykład cudzej pułapki do wibracji i wyjaśnić odbiór przy limicie 6 osób.
- Sprawdzić zgodność SAB-01..05 i opisu końca po szóstej rundzie bez dodatkowego next.

## Acceptance
- [x] Sekcja rozstrzyga wszystkie ruchy, granice, timeouty i widoki; nie ma nieustalonych reguł przed TDD.
- [x] `pnpm typecheck && pnpm test` → exit 0
- [x] Zasady, katalog i procedura odbioru są zgodne z D-01..03.

## Result
Dodano sekcję 11 „Sabotaż” w ZASADY-GIER.md (wiersz tabeli, stałe, ruchy z `nonce`/`round`/`decision`, fazy, timeouty, punkty 2/1/0, widoki, koniec bez `next` po rundzie 6, balans niepotwierdzony, brak obietnicy kwadransa).
KONCEPT.md: wiersz katalogu `sabotaz` 3-6 i wzmianka o minimum 3 w limicie miejsc. ZASADY.md: wibracja trafionej cudzej pułapki (`useHarm`), własna pułapka jako legalne pudło, odbiór przy limicie pokoju 6.
`pnpm typecheck && pnpm test`: exit 0 (2367 + 171 + 371 testów). Bez commita: AGENTS.md i CONTEXT wymagają prośby użytkownika.
Deviations: AGENTS.md — zmiana sprzed zadania (widoczna w początkowym git status), nie moja, nie stage'owana

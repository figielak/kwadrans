---
id: 08-04
title: "Silnik Podróbki i wpis w rejestrze"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard      # normal | hard
depends: [08-02, 08-03]         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/podrobka.ts", "packages/games/src/index.ts", "packages/games/src/index.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zaimplementować czyste zasady Podróbki, aż przejdą testy z 08-02, i dodać grę do rejestru z eksportami `PODROBKA_`.

## Read first
- packages/games/src/podrobka.test.ts (testy do spełnienia, bez zmian)
- packages/games/src/panstwa-miasta.ts:69-161 (kształt definicji gry faz równoczesnych)
- packages/games/src/core.ts:77-88 (rankResults, rankPlaces)
- packages/games/src/core.ts:239-245 (shuffle)
- packages/games/src/index.ts:135-141 (eksporty stałych z przedrostkiem)
- packages/games/src/index.ts:187-188 (GAMES)
- packages/games/src/index.test.ts:36-46 (EAGER, liczba gier)
- packages/games/src/index.test.ts:129-170 (ogólny kontrakt i sterownik partii)
- packages/games/src/index.test.ts:264-275 (fazy gier wielofazowych)

## Files
- packages/games/src/podrobka.ts (create)
- packages/games/src/index.ts (modify)
- packages/games/src/index.test.ts (modify)

## Constraints
- Testów z 08-02 nie zmieniamy pod implementację; zła zasada to najpierw test i ZASADY-GIER.md.
- Losowość tylko z `rng`, wszystko losowane w `setup`: pary przez `shuffle`, kierunek pary, Podróbka każdej rundy; `applyMove` nie losuje. Bez `Math.random` i `Date.now`.
- `playerView` buduje jawny obiekt polami z Interface, nigdy `...state`. Bez `pairId`, indeksu wariantu i kategorii w widoku.
- Pusta odpowiedź i `target: null` tylko przez `context.source === "timeout"`, nigdy przez pole w JSON (05-02).
- [packages/games/] Timeout nie może się opłacać (05-03): pusta odpowiedź anuluje rundę, Podróbka bez głosu ma 0.
- Reuse `shuffle`, `rankResults`, `rankPlaces`; małe helpery lokalne, bez wspólnego silnika gier fazowych. Definicja bez `record`, `live`, `modes`.
- `id` `podrobka` jest ostateczne: to klucz rankingu w SQLite.
- Sterownik w `index.test.ts` idzie głównie przez `timeoutMove`, a ten w Podróbce zawsze anuluje rundę, więc nigdy nie dojdzie do `vote`. `EAGER` nie ma dostępu do stanu, a ruchy mają stempel: rozszerzamy jego sygnaturę o `state` i dodajemy `podrobka`. Pozostałe wpisy `EAGER` bez zmian.
- Nowy wpis w `GAMES` może zmienić losowanie głosowania „Inna gra” w testach serwera; poprawa takiego testu to osobne zgłoszenie. Znany niestabilny test „07-19” bywa czerwony niezależnie (10-08).
- [packages/games/] Zmiana w tym pakiecie restartuje serwer dev i kasuje partie (quick).

## Tests (write first)
- Wszystkie testy `packages/games/src/podrobka.test.ts` z 08-02, w tym każdy Edge case.
- index.test.ts: rejestr ma 41 gier zamiast 40.
- index.test.ts: Podróbka w rejestrze jest grą główną 3-6 osób, poza `MINI_GAME_IDS`, bez `record`, `live`, `modes`.
- index.test.ts: stałe `PODROBKA_ROUNDS`, `PODROBKA_WRITE_SECONDS`, `PODROBKA_VOTE_SECONDS`, `PODROBKA_SUMMARY_SECONDS`, `PODROBKA_ANSWER_MAX` to 6, 30, 60, 15, 30.
- index.test.ts: `expected.podrobka` to `["write", "vote", "summary"]` w teście faz, osiągnięte dzięki `EAGER`.

## Interface
Kontrakt z 08-02 bez zmian:
```ts
type Move = { type: "write"; nonce: number; round: number; answer: string; done: boolean }
  | { type: "vote"; nonce: number; round: number; target: PlayerId | null }
  | { type: "next"; nonce: number; round: number };
State: players, nonce, deals (6), round (0..5), phase, drafts, done, votes, ready, totals, history: RoundRecord[]
View: players, nonce, round, phase, done, voted, ready, totals, history, hint, myQuestion, myDraft, majorityQuestion, answers, myVote
Eksporty: podrobka, ROUNDS, WRITE_SECONDS, VOTE_SECONDS, SUMMARY_SECONDS, ANSWER_MAX, cleanAnswer(text), resolveVotes(players, impostor, votes)
timeoutMove: write → { answer: drafts[p] ?? "", done: true }; vote → { target: null }; summary → next, wszystko ze stemplem
index.ts: PODROBKA_* oraz typy PodrobkaView, PodrobkaMove
```

## Edge cases
- `"  Ala   ma\tkota "` → zapisane `"Ala ma kota"`
- szkic pusty od klienta → przyjęty; „Gotowe” puste od klienta → odrzucone, z kontekstem timeoutu → przyjęte
- `source: "timeout"` w JSON → brak uprawnień; `target: null` od klienta → odrzucone
- limit przy szkicu → szkic jest odpowiedzią; szkic z samych spacji → pusta i anulowanie
- pusta odpowiedź kogokolwiek → anulowanie, 0 pkt, `missing`, odsłona; w szóstej rundzie od razu `over`
- samodzielny lider od 2 głosów to Podróbka → wykryta; remis, pojedynczy głos, lider niewinny → niewykryta
- trafny głos zwykłego gracza → 2 pkt niezależnie od wykrycia; Podróbka niewykryta z głosem 3, bez głosu 0, wykryta 0
- wszyscy wstrzymani → 0 pkt; szósta rozstrzygnięta runda → `over` bez `next`
- komplet timeoutów → 6 anulowań, remis bez zwycięzcy
- obserwator i obce id → widok bez sekretów w każdej fazie

## Steps
1. packages/games/src/index.test.ts: liczba 41, `describe("Podróbka w rejestrze")`, `expected.podrobka`, `EAGER` ze stanem — czerwone przed kodem.
2. packages/games/src/podrobka.ts: typy, stałe, `cleanAnswer`, `resolveVotes`, `setup` — losowanie i rozkłady głosów przechodzą.
3. packages/games/src/podrobka.ts: `moveSchema`, `validateMove`, `applyMove` — pisanie, anulowanie, punktacja i przejścia przechodzą.
4. packages/games/src/podrobka.ts: `playerView`, `isOver`, `places`, `waitingFor`, `turn`, `timeoutMove` — widoki i limity przechodzą.
5. packages/games/src/index.ts: wpis w `GAMES` i eksporty `PODROBKA_`, `PodrobkaView`, `PodrobkaMove` — ogólny kontrakt przechodzi dla 3 i 6 graczy.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter @kwadrans/games exec vitest run src/podrobka.test.ts src/podrobka-dane.test.ts src/index.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0
- [ ] Plik `podrobka.test.ts` jest niezmieniony względem commitu testów z 08-02.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

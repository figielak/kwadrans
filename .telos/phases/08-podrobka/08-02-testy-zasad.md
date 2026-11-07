---
id: 08-02
title: Testy zasad i puli przed kodem
type: doc          # code | doc | audit
status: draft       # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard      # normal | hard
depends: [08-01]         # task IDs, e.g. [01-01]
decisions: [D-01]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/podrobka.test.ts", "packages/games/src/podrobka-dane.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Napisać komplet testów zasad i struktury puli przed kodem. Zadanie kończy się świadomie na czerwonych testach, dlatego ma typ `doc`.

## Read first
- ZASADY.md:43-83 (testy obowiązkowe, fazy równoczesne, ukryty stan, styl)
- ZASADY-GIER.md §13. Podróbka (zasady z 08-01)
- .planning/PODROBKA-PLAN.md:206-228 (lista testów)
- packages/games/src/core.ts:77-88 (rankResults, rankPlaces)
- packages/games/src/panstwa-miasta.ts:144-161 (waitingFor, turn, timeoutMove faz równoczesnych)

## Files
- packages/games/src/podrobka.test.ts (create)
- packages/games/src/podrobka-dane.test.ts (create)

## Constraints
- Osobny commit „Podróbka: testy zasad” na gałęzi fazy, przed `podrobka.ts`; bez `--no-verify`.
- Kryterium `→ exit 1` nie wchodzi do Acceptance: po 08-04 testy są zielone, więc `telos accept` przy zamknięciu by je oblał (D-04 fazy 10). Czerwony stan zapisujemy w Result.
- Testy puli w osobnym pliku, bo import brakującego `podrobka.ts` wywaliłby cały plik zasad, a pula ma być zielona już po 08-03.
- Nagłówek pliku to komentarz z listą ustalanych zasad; nazwy testów po polsku, jak brzmi zasada; pomocnik `send` przechodzi przez `validateMove` z kontekstem.
- Stan buduj ruchami. Z `State` odczytuj tylko `deals[round].impostor`, żeby wiedzieć, kto jest Podróbką.
- [tests] Pełne rozkłady głosów dla 6 osób to 46 656 układów: jawny dłuższy limit testu, inaczej padnie na CI (quick).
- [packages/games/] Uprawnienia zegara tylko przez `context.source === "timeout"`; pole `source` w JSON odpada (05-02).

## Zakres testów
- Definicja: id, nazwa, 3-6 osób, `turn()`, brak `record`, `live`, `modes`; świeża gra nieskończona.
- Setup: 6 różnych par i po jednej legalnej roli na rundę; ten sam seed to samo, różne seedy co innego, różne `nonce`.
- Losowanie: na wielu seedach oba kierunki par występują, a rola powtarza się albo nie trafia komuś, bez wymuszonej rotacji.
- Schemat: zły `type`, brak pola, liczby niecałkowite, `answer` 31 jednostek UTF-16, `target` złego typu odpadają; 30 jednostek przechodzi.
- `validateMove`: osoba spoza gry, zła faza, drugie zatwierdzenie, głos na siebie, na obcego i obserwatora, stary nonce i runda, ruch po końcu.
- `waitingFor` kurczy się po zatwierdzeniach, szkic go nie zmienia; `turn().key` stały wewnątrz fazy, sekundy 30/60/15/0.
- Każdy przypadek z Edge cases ma osobny test.
- `resolveVotes`: wszystkie rozkłady dla 3, 4, 5 i 6 osób kontra niezależna wyrocznia w teście.
- Ostatnie zatwierdzenie zmienia fazę dokładnie raz; punkty dolicza tylko wejście w odsłonę, `next` ich nie zmienia.
- Widoki: zwykły gracz, Podróbka, obserwator i obce id w każdej fazie; whitelista kluczy w `Object.keys`; brak ról, `pairId`, przyszłych par, cudzych szkiców i głosów także w `JSON.stringify` widoku.
- Koniec: wygrana każdego gracza, remisy na górze i niżej, tabela zgodna z `places`, `waitingFor` puste, zakres sum 0-18.
- Timeout: każda faza ma legalny `timeoutMove` przechodzący schemat i `validateMove`; partie 3 i 6 osób dochodzą do końca samymi timeoutami bez ponownego naliczania.
- `applyMove` nie mutuje; pełna partia przeżywa `JSON.parse(JSON.stringify(...))`.
- Pula (`podrobka-dane.test.ts`): 60 par, po 20 w kategorii, unikalne id, każde pytanie unikalne w całej puli, `a` różne od `b`, pytanie niepuste do 90, kończy się „?”, wskazówka niepusta do 30, bez em-dashy, bez zewnętrznych spacji, bez form „-łbyś”/„-łabyś”.

## Interface
```ts
type Category = "liczby" | "rzeczy" | "miejsca";
type Pair = { id: string; a: string; b: string; hint: string; category: Category }; // podrobka-dane.ts: PAIRS
type Move = { type: "write"; nonce: number; round: number; answer: string; done: boolean }
  | { type: "vote"; nonce: number; round: number; target: PlayerId | null }
  | { type: "next"; nonce: number; round: number };
type Phase = "write" | "vote" | "summary" | "over";
Deal: pairId, majority, other, hint, impostor
RoundRecord: round, majorityQuestion, otherQuestion, hint, impostor, answers, votes, tally, cancelled, missing: PlayerId[], detected, gain
State: players, nonce, deals (6), round (0..5), phase, drafts, done, votes, ready, totals, history: RoundRecord[]
View: players, nonce, round, phase, done, voted, ready, totals, history, hint, myQuestion, myDraft, majorityQuestion, answers, myVote
Eksporty: podrobka, ROUNDS, WRITE_SECONDS, VOTE_SECONDS, SUMMARY_SECONDS, ANSWER_MAX, cleanAnswer(text), resolveVotes(players, impostor, votes) → { tally, detected, gain }
turn(): key `${nonce}:${round}:${phase}`; seconds 30 / 60 / 15 / 0 (over)
```

## Edge cases
- `"  Ala   ma\tkota "` → zapisane `"Ala ma kota"`; polskie litery i wielkość liter bez zmian
- szkic pusty albo z samych spacji od klienta → przyjęty, nie kończy pisania, nie odnawia czasu
- „Gotowe” z pustym tekstem albo samymi spacjami od klienta → odrzucone; to samo z kontekstem timeoutu → przyjęte
- pole `source: "timeout"` w JSON ruchu klienta → brak uprawnień zegara
- szkic po własnym zatwierdzeniu albo ze starej rundy → odrzucony
- limit pisania przy zapisanym szkicu → szkic zostaje odpowiedzią; bez szkicu → pusta odpowiedź
- szkic z samych spacji i limit → pusta odpowiedź, runda anulowana
- pusta odpowiedź Podróbki albo zwykłego gracza → runda anulowana, wszyscy 0, bez głosowania, `missing` z nickami, przejście do odsłony
- anulowana szósta runda → od razu `over`, oznaczenie w historii, partia się kończy
- `target: null` od klienta → odrzucone; z kontekstem timeoutu → wstrzymanie
- Podróbka ma 2 głosy, nikt inny tyle → wykryta (3 osoby: dwa głosy pozostałych)
- Podróbka i ktoś inny po tyle samo najwięcej → niewykryta, bez dogrywki
- pojedynczy głos na Podróbkę bez innych głosów → niewykryta
- lider niewinny → niewykryta; trafny głos zwykłego gracza nadal daje 2 pkt
- Podróbka niewykryta i zagłosowała → 3 pkt; niewykryta bez głosu → 0; wykryta → 0
- trafny głos oddany przez samą Podróbkę nie istnieje; jej głos wpływa na wynik, ale nie daje 2 pkt
- wszyscy się wstrzymali → 0 pkt dla wszystkich
- szósta runda rozstrzygnięta → `over`, bez `summary` i `next`, ostatnia odsłona w `history`
- komplet timeoutów we wszystkich rundach → 6 anulowań, wszyscy 0, remis na pierwszym miejscu bez zwycięzcy
- obserwator i obce id w `write` → bez pytań i szkiców; w `vote` → pytanie większości i odpowiedzi, bez głosów

## Steps
1. packages/games/src/podrobka-dane.test.ts: testy struktury `PAIRS` — importy zgodne z Interface.
2. packages/games/src/podrobka.test.ts: nagłówek i pomocnicy `send`, `writeAll`, `voteAll` — ruchy idą przez `validateMove`.
3. packages/games/src/podrobka.test.ts: definicja, setup, losowanie, schemat, walidacja — sekcje z listy Zakres.
4. packages/games/src/podrobka.test.ts: pisanie, anulowanie, głosy, punktacja, `resolveVotes` — każdy Edge case osobno.
5. packages/games/src/podrobka.test.ts: limity, widoki, koniec, JSON — pełne pokrycie ZASADY §2.

## Acceptance
- [ ] `test -s packages/games/src/podrobka.test.ts` → exit 0
- [ ] `test -s packages/games/src/podrobka-dane.test.ts` → exit 0
- [ ] Oba pliki czerwone przez brak modułów; wynik uruchomienia zapisany w Result.
- [ ] Każdy Edge case i każda zasada z ZASADY-GIER §13 ma test nazwany jak zasada.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

---
id: 10-02
title: Testy zasad Wyprawy przed kodem
type: doc          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard      # normal | hard
depends: [10-01]         # task IDs, e.g. [01-01]
decisions: [D-01, D-02]       # phase-local, e.g. [D-03]
scope: ["packages/games/src/wyprawa.test.ts"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Napisać komplet testów zasad Wyprawy przed kodem. Zadanie kończy się świadomie na czerwonych testach, dlatego ma typ `doc`.

## Read first
- ZASADY.md:43-83 (testy obowiązkowe, fazy równoczesne, ukryty stan, styl)
- ZASADY-GIER.md §12. Wyprawa (zasady z 10-01)
- packages/games/src/core.ts:77-88 (rankResults, rankPlaces)
- packages/games/src/panstwa-miasta.ts:144-161 (waitingFor, turn, timeoutMove faz równoczesnych)

## Files
- packages/games/src/wyprawa.test.ts (create)

## Constraints
- D-02: osobny commit „Wyprawa: testy zasad” na gałęzi fazy, przed `wyprawa.ts`. Testy czerwone w chwili commitu i tak ma być; bez `--no-verify`.
- Nagłówek pliku to komentarz z listą ustalanych zasad; nazwy testów po polsku, jak brzmi zasada; pomocnik `send` przechodzi przez `validateMove`.
- Stan buduj ruchami; kolejność kart ustawia wyłącznie `openExpedition(state, deck)`, bez ręcznego obiektu stanu.
- Kolejność rozstrzygnięcia testuj permutacjami nadawców na tym samym stanie.

## Zakres testów
- Definicja: id, nazwa, 2-6 osób, brak `record`, `live`, `modes`; świeża gra nieskończona.
- Setup: 30 kart, 15 skarbów 1-15 po razie, suma 120, 5 zagrożeń po 3; pierwsza karta odkryta i otwarta decyzja; ten sam seed to samo, różne seedy co innego, różne `nonce`.
- Schemat: zły `type`, zły `choice`, brak stempla, liczby niecałkowite i śmieci odpadają; pierwsza i ostatnia dozwolona wartość przechodzą.
- Każdy przypadek z Edge cases ma osobny test.
- Wiele powrotów naraz daje ten sam stan bez względu na kolejność wiadomości; wybór przed kompletem nie zmienia banku ani loose.
- Wybór nieodwołalny, a kolejne odkrycie to nowy stempel: stary ruch odpada.
- `waitingFor` kurczy się po kolei i pomija obóz; `turn().key` zmienia się tylko przy zmianie odkrycia, wyprawy, fazy albo nonce.
- Odsłona: komplet „Dalej”, także od wracających, otwiera następną wyprawę z pierwszą kartą; carried i loose zerowane, bank zachowany, wszyscy znów na szlaku.
- Timeout: `choose: return` w decyzji i `next` w odsłonie przechodzą schemat i `validateMove`, są też legalne jako zwykły ruch.
- Widoki: gracz na szlaku, w obozie, obserwator i obce id w każdej fazie; whitelista kluczy; brak `deck` i seeda, cudze wybory dopiero w `last`; własny zatwierdzony wybór wraca po przeładowaniu.
- Bilans po każdej wyprawie: suma `gain`, `lost` i `discarded` równa sumie odkrytych skarbów; suma banków najwyżej 600.
- Wygrana każdego gracza, ranking i `places`; `waitingFor` puste po końcu.
- `applyMove` nie mutuje; stan przeżywa `JSON.parse(JSON.stringify(...))`; partie 2 i 6 graczy dochodzą do końca samymi timeoutami.

## Interface
```ts
type Hazard = "osuwisko" | "zalanie" | "roj" | "przepasc" | "most";
type Card = { kind: "treasure"; value: number } | { kind: "hazard"; hazard: Hazard };
type Choice = "continue" | "return";
type Move = { type: "choose"; choice: Choice; nonce: number; expedition: number; reveal: number }
  | { type: "next"; nonce: number; expedition: number };
type Phase = "decision" | "summary" | "over";
State: players, nonce, phase, expedition (0..4), reveal (= trail.length), deck: Card[] (reszta, tajna), trail: Card[],
  onTrail: PlayerId[], bank, carried, loose, choices (tajne), ready: PlayerId[], last: Resolution | null, history: ExpeditionRecord[]
Resolution: reveal, choices (komplet), returned, share, banked: Record<PlayerId, number>, looseAfter
ExpeditionRecord: trail, gain, lost: Record<PlayerId, number>, discarded, end: "hazard" | "returned" | "empty", hazard: Hazard | null
View: stan bez deck i choices, plus deckLeft, ready (gotowi w decyzji), myChoice: Choice | null
Eksporty: wyprawa, EXPEDITIONS = 5, DECISION_SECONDS = 20, SUMMARY_SECONDS = 15, HAZARDS, buildDeck(rng), openExpedition(state, deck)
turn(): key `${nonce}:${expedition}:${reveal}:${phase}`; seconds 20 / 15 / 0 (over)
```

## Edge cases
- skarb 1 przy 6 osobach → carried bez zmian, loose +1
- skarb 15 przy 2 osobach → po 7, loose +1; stare loose nie wchodzi do podziału
- loose 5, wracają dwie osoby z carried 7 i 4 → bank +9 i +6, na szlaku zostaje 1
- samotny powrót → cała reszta loose do banku tej osoby
- loose mniejsze niż liczba wracających → udział 0, loose zostaje
- powrót i drugie takie samo zagrożenie w tym samym kroku → najpierw bank, potem karta; wracający nic nie traci
- pierwsza karta danego zagrożenia i dwie różne → wyprawa trwa
- wszyscy wracają → bez następnej karty, reszta loose przepada, `end: "returned"`
- druga taka sama karta → pozostali tracą carried, loose przepada, bank bez zmian, `end: "hazard"`
- pusta talia przy kimś na szlaku → pozostali bankują carried i dzielą loose, `end: "empty"`
- 15 skarbów i 5 różnych zagrożeń przed powtórką → najwyżej 20 decyzji, 21. karta kończy
- piąta wyprawa zakończona → od razu `over`, `waitingFor` puste, `turn().seconds` 0
- równe banki na górze → bez zwycięzcy, wspólne miejsca; remis niżej zachowuje zwycięzcę
- komplet timeoutów → wszyscy zawsze wracają razem, koniec partii, remis
- ruch ze starym nonce, wyprawą albo odkryciem; drugi wybór; ruch z obozu; obcy gracz; `next` poza odsłoną → odrzucone
- obserwator i obce id → brak `myChoice`, cudzych wyborów i talii w każdej fazie

## Steps
1. packages/games/src/wyprawa.test.ts: nagłówek i pomocnicy `send`, `deckOf`, `playAll` — importy zgodne z Interface.
2. packages/games/src/wyprawa.test.ts: definicja, setup, schemat — sekcje z listy Tests.
3. packages/games/src/wyprawa.test.ts: podział, powroty, końce wyprawy, odsłona, koniec — każdy Edge case osobno.
4. packages/games/src/wyprawa.test.ts: limity, widoki, bilans, JSON — pełne pokrycie ZASADY §2.

## Acceptance
- [x] `test -s packages/games/src/wyprawa.test.ts` → exit 0
- [x] `pnpm --filter @kwadrans/games exec vitest run src/wyprawa.test.ts` → exit 1
- [x] Każdy Edge case i każda zasada z ZASADY-GIER §12 ma test nazwany jak zasada.

## Result
`wyprawa.test.ts`: 120 testów zasad; bez `wyprawa.ts` czerwone (exit 1, brak modułu), tak ma być.
Sprawdzone tymczasową implementacją referencyjną poza commitem: 120/120 zielone, typy bez błędów, 11 mutacji zasad (podział, koniec, kolejność, wycieki, timeout, klucz) oblewa testy.
Niespodzianka: `carried` osób na szlaku jest ruchami zawsze równe, więc przykład „7 i 4 → 9/6/1” z planu i ZASADY-GIER §12 jest nieosiągalny. Test tego przypadku poprawia `carried` ręcznie (jedyny taki stan, opisany w komentarzu), obok jest wariant osiągalny 8 i 8 → 10/10/1.
Ustalone w testach poza Interface: `gain` i `lost` mają wszystkich graczy, w `summary`/`over` carried i loose to 0, `last` jest null na początku wyprawy.
Deviations: none

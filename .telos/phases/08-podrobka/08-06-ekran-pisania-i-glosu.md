---
id: 08-06
title: "Ekran pisania i głosowania"
type: code          # code | doc | audit
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal      # normal | hard
depends: [08-04]         # task IDs, e.g. [01-01]
decisions: []       # phase-local, e.g. [D-03]
scope: ["apps/web/src/games/Podrobka.tsx", "apps/web/src/games/Podrobka.test.tsx"]           # required: path prefixes/globs; ["*"] = unrestricted; audit: [".telos/"]
---
## Goal
Zbudować ekran faz `write` i `vote`: prywatne pytanie z jednym polem i szkicem, potem odpowiedzi z nickami i tajny głos, bez akcji dla obserwatora.

## Read first
- ZASADY.md:142-218 (spójność wyglądu, słownik ról)
- ZASADY.md:219-249 (animacje, tabela czasów)
- .planning/PODROBKA-PLAN.md:160-183 (ekran)
- DESIGN.md:180-190 (wypełniona akcja w kolorze gracza)
- apps/web/src/games/PanstwaMiasta.tsx:135-180 (klawiatura, szkic z debounce, zatwierdzenie)
- apps/web/src/games/Wyprawa.tsx (lokalny wybór związany z kluczem, `aria-pressed`, testy na prawdziwym `playerView`)
- apps/web/src/screens/ui.tsx:759-765 (StickyBar)

## Files
- apps/web/src/games/Podrobka.tsx (create)
- apps/web/src/games/Podrobka.test.tsx (create)

## Constraints
- Widoki w testach pochodzą z prawdziwego `playerView` po legalnych ruchach.
- Stan lokalny związany z kluczem nonce/runda/faza: zmiana klucza kasuje szkic i wybór, usuwa zaległy debounce, więc stara wiadomość nie idzie do nowej rundy.
- Szkic co najwyżej co 500 ms i tylko przy zmianie; „Gotowe” wysyła bieżący tekst, nie czeka na zapis, anuluje zaległą wysyłkę. Widok z serwera nie nadpisuje tekstu podczas pisania, stan początkowy bierze z `myDraft`.
- Interfejs nie obiecuje zapisu ostatnich znaków: „Po czasie liczy się ostatni zapisany tekst”, „Bez Gotowe po czasie nie ma głosu”.
- Pole: etykieta, `maxLength` równe `ANSWER_MAX`, licznik długości. „Gotowe” nieaktywne przy pustym tekście po normalizacji.
- Głos: wiersze z nickiem i pełną odpowiedzią, obrys w kolorze gracza, znaczek i `aria-pressed`. Własny wiersz nieaktywny z wyjaśnieniem. Bez czerwieni.
- Własne wcześniejsze pytanie w rozwijanym szczególe; prośba, by w rozmowie bronić odpowiedzi, a nie cytować pytania.
- Bez drugiego pełnego nagłówka: czas, kropki i „Czekamy na: …” daje `Game.tsx`. Fazy `summary` i `over` są stubem do 08-07; podpięcie w 08-08.
- Ekran nie woła `navigator.vibrate`. Bez nowych keyframes; każdy nowy trafia do ZASADY §5, inaczej padnie `animations.test.ts` (05-35).
- Cele 48 px, tylko tokeny, ciemny motyw, bez em-dashy. Pełne odpowiedzi bez ucinania, 6 graczy, 16-znakowe nicki, 360×640 (05-09).

## Tests (write first)
- Pisanie pokazuje „Runda 2/6”, własne pytanie, wskazówkę formatu, licznik i wspólny komunikat.
- Zmiana tekstu wysyła szkic ze stemplem dopiero po 500 ms, a seria zmian wysyła jeden.
- „Gotowe” wysyła `done: true` z bieżącym tekstem i anuluje zaległy szkic; przy samych spacjach jest nieaktywne.
- Nowa runda albo faza usuwa zaległy szkic bez wysyłki.
- Po przeładowaniu wraca `myDraft`; po zatwierdzeniu własny tekst i pytanie są czytelne, bez edycji.
- Głosowanie pokazuje pytanie większości i wszystkie odpowiedzi z nickami dla 3 i 6 graczy.
- Dotknięcie cudzego wiersza zmienia `aria-pressed` bez wysyłki; „Gotowe” wysyła `vote` ze stemplem; własny wiersz nieaktywny.
- Po głosie wybór widoczny z `myVote`, odpowiedzi zostają, brak aktywnych akcji.
- Podróbka i zwykły gracz mają ten sam układ i te same komunikaty: ekran nie zdradza roli.
- Obserwator i obce id nie mają akcji ani pola; w `write` nie widać pytań.

## Steps
- Napisać testy na widokach z prawdziwych ruchów.
- Wydzielić czyste `moves(view, ...)` i klucz stanu lokalnego.
- Zbudować `WriteForm` z szkicem, licznikiem i `StickyBar`, z zachowaniem klawiatury wzorem Państw-miast.
- Zbudować `VoteList` z wyborem i szczegółem własnego pytania.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm --filter web exec vitest run src/games/Podrobka.test.tsx src/tokens.test.ts src/animations.test.ts` → exit 0
- [ ] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

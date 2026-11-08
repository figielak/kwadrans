---
id: 08-06
title: "Ekran pisania i głosowania"
type: code          # code | doc | audit
status: done        # draft | approved | in-progress | done | blocked | reverted
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
- [x] all listed tests pass
- [x] `pnpm --filter web exec vitest run src/games/Podrobka.test.tsx src/tokens.test.ts src/animations.test.ts` → exit 0
- [x] `pnpm run typecheck` → exit 0

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->
Dodano `Podrobka.tsx`: pisanie (pole z etykietą, `maxLength`, licznik, „Gotowe”, zatwierdzona odpowiedź tylko do odczytu), głosowanie (pytanie większości, odpowiedzi z nickami w pełnym brzmieniu, wybór lokalny do „Gotowe”, własny wiersz nieaktywny, szczegół własnego pytania) i widok obserwatora bez akcji. Odsłona i koniec to stub do 08-07; ekran nie jest jeszcze podpięty w `Game.tsx` (08-08).
Testy: `Podrobka.test.tsx` 34/34, cały pakiet web 526/526, typecheck zielony. RED: brak modułu `Podrobka.tsx`; dwa moje testy poprawiłem po pierwszym uruchomieniu (porównanie dwóch różnych graczy zamiast tego samego gracza w dwóch rolach; `moves` bez `me`).
Web nie ma DOM-u w testach i nie wolno dodawać zależności, więc stan i czas są w czystych eksportach: `DraftSender` (debounce 500 ms, `follow` kasuje zaległy szkic przy zmianie klucza, `now` wysyła od razu), `draftKey`, `currentDraft`, `moves`, `options`; komponenty bez hooków sprawdzane przez markup i przejście po drzewie elementów. Efekt React, który woła `follow`/`cancel`, jest tylko w `Podrobka` i nie ma testu.
Nie sprawdzone tu, zostaje do odbioru 08-09: układ 360×640 z otwartą klawiaturą, 6 graczy z 16-znakowymi nickami w przeglądarce. `cleanAnswer` nie jest w `index.ts`, więc „Gotowe” sprawdza pusty tekst przez `trim()` (to samo, co normalizacja).
Deviations: none

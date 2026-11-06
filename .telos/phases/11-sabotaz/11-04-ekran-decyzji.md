---
id: 11-04
title: "Sabotaż: stosy, ręka i decyzje"
type: code
status: approved    # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: hard
depends: ["11-03"]
decisions: ["D-01","D-02"]
scope: ["apps/web/src/games/Sabotaz.tsx","apps/web/src/games/Sabotaz.test.tsx"]
---
## Goal
Zbudować mobilny ekran decyzji SAB-04 na przefiltrowanym View, z osobnym wyborem i zatwierdzeniem.

## Read first
- .planning/SABOTAZ-PLAN.md §5. Ekran i integracja
- ZASADY.md §4. Spójność wyglądu
- DESIGN.md §2. Tokeny
- DESIGN.md §5. Zasady, które z tego wynikają
- apps/web/src/screens/tables.test.tsx:1-18 (renderToStaticMarkup i środowisko testowe)
- .telos/phases/11-sabotaz/11-02-silnik.md §Interface

## Files
- apps/web/src/games/Sabotaz.tsx (create)
- apps/web/src/games/Sabotaz.test.tsx (create)

## Constraints
- D-01: rodzaje Przejście/Pułapka i limity aukcji; D-02: wymuszone odkrycia nie wymagają kliknięć.
- UI nie ustala wyniku ani legalności na serwerze, wysyła tylko Move z nonce/round/decision otrzymanymi w View.
- Stan lokalny przechowuje tylko szkic wyboru; nowa runda/decyzja/nonce kasuje nieaktualny wybór.
- Ciemne tokeny, btn-player, polskie teksty, aria-pressed i drugi znak wyboru, akcje min. 48 px; bez nowych zależności.
- Układ 2 kolumny × do 3 wierszy ma się mieścić na 360×640 z rzeczywistym nagłówkiem, 6 nickami i obserwatorem (.telos/LESSONS.md, 05-09).
- Cudzych sekretów nie ma nawet w aria-label, title, data-* ani ukrytych elementach DOM.

## Tests (write first)
- Gracz widzi własną rękę i kolejność własnego stosu; rywale i obserwator widzą tylko liczby oraz odsłonięte karty.
- Initial/place: dostępne rodzaje odpowiadają licznościom; pusta ręka pozwala tylko na bid.
- Bid: min/max odpowiadają bieżącej deklaracji i T; przy T zostaje pas, osoba już spasowana nie ma akcji.
- Reveal: wybór tylko legalnego cudzego stosu, postęp x z celu i poprawny opis potwierdzenia.
- Oczekujący i obserwator nie mają aktywnych akcji; nieznany me ma widok obserwatora.
- Każdy render używa wyłącznie View; zakryte karty nie ujawniają rodzajów w DOM, etykietach ani atrybutach.

## Interface
- Sabotaz otrzymuje view: SabotazView, me, players, waitingFor, onMove: (move: SabotazMove) => void oraz opcjonalne wynikowe miejsca/ranking.
- Wybór karty/stosu tylko zmienia lokalne zaznaczenie; osobny przycisk wysyła intencję.
- Wyświetlana nazwa Przejście/Pułapka mapuje safe/trap z zasad, nie jest kluczem protokołu.

## Edge cases
- Pusta ręka → opis i licytacja, bez przycisku dołożenia.
- Oferta T → tylko pas u kolejnego gracza.
- Obserwator/nieznany me → publiczny ekran bez aktywnych ruchów i prywatnej ręki.
- Zakryta cudza pułapka → identyczne etykiety jak zakryte Przejście.

## Steps
1. apps/web/src/games/Sabotaz.test.tsx: dodać testy renderowania faz i prywatności z legalnie zbudowanych widoków.
2. apps/web/src/games/Sabotaz.tsx: zbudować siatkę stosów, własną rękę i wyraźną kolejność od góry.
3. apps/web/src/games/Sabotaz.tsx: wdrożyć wybór i potwierdzenie place/bid/pass/reveal oraz stan oczekiwania.
4. apps/web/src/games/Sabotaz.tsx: czyścić szkice po zmianie publicznego klucza decyzji; sprawdzenie klikania i wymiarów zapisać do odbioru 11-07.

## Acceptance
- [ ] all listed tests pass
- [ ] `pnpm typecheck && pnpm test` → exit 0
- [ ] `pnpm --filter web build` → exit 0
- [ ] Wszystkie fazy decyzji dają się wyrenderować z View bez prywatnego State; pełne interakcje mają odbiór w 11-07.

## Result
<!-- filled by do: 3–5 lines (audit: ≤ 10, findings + proposed follow-ups)
     last line always: "Deviations: none" or "Deviations: path — why" -->

# 07 · atrakcyjnosc
## Goal
Po partii ludzie mają od razu chcieć następnej, a najwięcej radości ma dawać gra z innymi. Faza obejmuje etapy 0-3
z `.planning/ATRAKCYJNOSC-PLAN.md` i test z ludźmi po każdej stronie zmiany rywalizacji; etapy 4-5 rozpisujemy po drugim teście.

## Decisions
- D-01: „Ze znajomymi” nad „Sam”, a „Utwórz pokój” jako główny przycisk (plan D1, zmienia KONCEPT §1).
- D-02: W pokoju z 2+ graczami wspólny start 3-2-1 zamiast osobnego (plan D2, zmienia KONCEPT §3, reguły platformy oraz mini-gry i rekordy).
- D-03: `live` to dekoracja zgłaszana przez klienta, jawny wyjątek obok zasady „serwer jest źródłem prawdy”; nie dotyka wyników (plan D3).
- D-04: DESIGN §1 dopuszcza krótkie, jednorazowe reakcje na zdarzenia; pętli i stroboskopów nadal nie ma (plan D4).
- D-05: Wyzwanie dnia: wspólny układ i ranking z pierwszej próby; przyjęte, ale wdrożenie w etapie 5, poza tą rozpiską (plan D5).
- D-06: Kolejność: etapy 1 → 2 → 3, test z ludźmi, potem Blef na kościach oraz etapy 4 i 5 (plan D6).
- D-07: Ta rozpiska obejmuje etapy 0-3 i testy z ludźmi. Etapy 4-5 rozpisujemy po drugim teście, bo jego wyniki mogą je przesunąć.
- D-08: Codex przegląda plan osobno przed każdym etapem, na aktualnym kodzie.
- D-09: Przebieg pracy: plan Claude z użytkownikiem → przegląd Codex → testy Claude → kod Codex, aż testy przejdą → ekran Claude.
- D-10 [proposed]: Etapy 0 i 1 mają wspólny przegląd Codexa (07-01), bo plan każe je zacząć razem, a etap 0 to jedna tabela.
- D-11: Powroty liczymy z nowej tabeli `played_days(nick_key, day)`, a nie z `results` i `scores` jak w planie §10: `results` ma tylko partie ze zwycięzcą, `scores` także solo i żadna nie ma identyfikatora partii. Tabela nie wiąże osoby z pokojem ani grą, `room_games` zostaje bez nicków, dane zbieramy od wdrożenia, bez liczenia wstecz.
- D-12: Miejsca dla ekranu wyników liczy serwer: `RoomView.game.places` = `result.places`, potem `def.places(state)`, tylko gdy wynik ma `ranking`. `places` dostają też gry główne z możliwym remisem (Memory, Kalambury, Państwa-miasta, Kampus Tour, Gomoku), bez zmiany zasad.

## Constraints
- Zadanie „(Codex)”: wykonuje Codex z promptu użytkownika, nie `/telos:do`. Nie rusza `.telos/` i nie commituje. Potem Claude przegląda diff,
  uruchamia `telos accept`, uzupełnia Result i stan, a commit tworzy na prośbę.
- Zadanie kodu Codexa ma `scope` z listą plików bez testów, więc zmiana testu daje `SCOPE FAIL`. Zła zasada: Codex zatrzymuje się i opisuje problem.
- Zadanie testów Claude'a jest typu `doc` i ma `→ exit 1`: to czerwony commit z dokumentami przed kodem. Nowe importy mogą chwilowo psuć `pnpm typecheck`.
- Stare testy sprzeczne z decyzją zmienia tylko Claude w zadaniu testów, razem z dokumentem. Nigdy w zadaniu kodu.
- Bez zmian punktacji, starych rekordów, nowych zależności, dźwięku i powiadomień (plan §11).
- Praca na osobnej gałęzi od `master`, push tylko na prośbę (push na `master` publikuje produkcję).

## Open questions
- none

## Carried over
- plan atrakcyjności czeka na decyzje D1-D6 → .planning/ATRAKCYJNOSC-PLAN.md ⇒ rozstrzygnięte jako D-01..D-06

## Links
- .planning/ATRAKCYJNOSC-PLAN.md (pełny plan, §4-6 i §10 to zakres tej fazy)
- .telos/PROPOSALS.md §Atrakcyjność i gra z innymi (ATR-00..03)
- .telos/MAP.md §Serwer, §Ekrany klienta

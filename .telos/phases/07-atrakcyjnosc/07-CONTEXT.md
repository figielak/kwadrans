# 07 · atrakcyjnosc
## Goal
Po partii ludzie mają od razu chcieć następnej, a najwięcej radości ma dawać gra z innymi. Faza obejmuje etapy 0-3
z `.planning/ATRAKCYJNOSC-PLAN.md` oraz test z ludźmi przed etapem 2 i po etapie 3.

## Decisions
- D-01: „Ze znajomymi” nad „Sam”, a „Utwórz pokój” jako główny przycisk (plan D1, zmienia KONCEPT §1).
- D-02: W pokoju z 2+ graczami wspólny start 3-2-1 zamiast osobnego (plan D2, zmienia KONCEPT §3).
- D-03: `live` to dekoracja zgłaszana przez klienta, jawny wyjątek obok zasady „serwer jest źródłem prawdy”; nie dotyka wyników (plan D3).
- D-04: DESIGN §1 dopuszcza krótkie, jednorazowe reakcje na zdarzenia; pętli i stroboskopów nadal nie ma (plan D4).
- D-05: Wyzwanie dnia: wspólny układ i ranking z pierwszej próby; przyjęte, wdrożenie w etapie 5, poza tą rozpiską (plan D5).
- D-06: Kolejność: etapy 1 → 2 → 3, test z ludźmi, potem Blef na kościach oraz etapy 4 i 5 (plan D6).
- D-07: Ta rozpiska obejmuje etapy 0-3 i dwa testy z ludźmi. Etapy 4-5 rozpisujemy po drugim teście, bo jego wyniki mogą je przesunąć.
- D-08: Wszystkie zadania wykonuje Claude, bez podziału na Claude'a i Codexa (poprzedni podział użytkownik uznał za błąd). Testy z ludźmi prowadzi użytkownik.
- D-09: Powroty liczymy z nowej tabeli `played_days(nick_key, day)`, a nie z `results` i `scores` jak w planie §10: `results` ma tylko partie ze zwycięzcą, `scores` także solo i żadna nie ma identyfikatora partii. Dane zbieramy od wdrożenia, bez liczenia wstecz.
- D-10: Miejsca dla ekranu wyników liczy serwer (`RoomView.game.places`), a `places` dostają też gry główne z możliwym remisem (Memory, Kalambury, Państwa-miasta, Kampus Tour, Gomoku). To rozszerza kontrakt `GameDefinition`, bez zmiany zasad.
- D-11: W głosowaniu „Inna gra” głosują i grają obecne `seats`, a pula pasuje do ich liczby; obserwatorzy tylko oglądają. Plan §6 mówi ogólnie o „każdym” i „liczbie osób”.

## Constraints
- Każde zadanie `code` sam prowadzi od testów: najpierw dokumenty i testy (czerwone), potem kod. Przy zmianie zasad osobny commit z dokumentami i testami przed kodem (plan §10, AGENTS).
- Stary test sprzeczny z decyzją zmienia się tylko razem z dokumentem, przed kodem. Nigdy pod implementację.
- Bez zmian punktacji, starych rekordów, nowych zależności, dźwięku i powiadomień (plan §11).
- Praca na gałęzi odchodzącej od aktualnej `labirynt`, która ma 14 commitów nad `master`; push tylko na prośbę, bo push na `master` publikuje produkcję.
- Serwerów dev nie ubijać po pracy: użytkownik sam testuje.

## Open questions
- none

## Carried over
- none

## Links
- .planning/ATRAKCYJNOSC-PLAN.md (pełny plan, §4-6 i §10 to zakres tej fazy)
- .telos/PROPOSALS.md §Atrakcyjność i gra z innymi (ATR-00..03)
- .telos/MAP.md §Serwer, §Ekrany klienta
- Wycofana rozpiska z przeglądem Codexa: `git show 4efec2e^:.telos/phases/07-atrakcyjnosc/`; testy etapu 0: `bca0694`

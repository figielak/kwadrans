---
id: 11-07
title: "Sabotaż: odbiór techniczny 3 i 6 graczy"
type: audit
status: done        # draft | approved | in-progress | done | blocked | reverted
critical: false
effort: normal
depends: ["11-06"]
decisions: ["D-03"]
scope: [".telos/"]
---
## Goal
Udowodnić techniczną gotowość SAB-05 i zapisać rzeczywisty wynik każdego scenariusza; przygotować krótką listę prób dla użytkownika.

## Read first
- ZASADY.md §6. Podpięcie i odbiór
- .planning/SABOTAZ-PLAN.md §6. Testy i odbiór
- .telos/phases/11-sabotaz/11-CONTEXT.md §Decisions
- apps/web/src/Dev.tsx:1-34 (iframe trybu dev)
- apps/server/src/LobbyRoom.test.ts:49-84 (limit klientów i obserwator)

## Files
- none

## Constraints
- D-03: /dev?n=4 z 3 miejscami i obserwatorem, osobno /dev?n=6; nie udawać siódmego klienta.
- Każdy telefon w /dev domyślnie ma 390×780: ustawić rzeczywiste ramki na 360×640, mierzyć z nagłówkiem i długimi nickami (.telos/LESSONS.md, 05-09).
- Przeglądarka nie zastępuje fizycznego telefonu i próby balansu; to zadanie 11-08.
- Przestrzegać 10 wiadomości/s i 3 pokoi/IP; korzystać z izolowanych sesji dev/oddzielnych originów (.telos/LESSONS.md, tests/quick).
- Restart serwera dev kasuje partie; testy prowadzić po ostatniej zmianie packages/games i pozostawić dev uruchomiony (.telos/LESSONS.md, games/quick).
- Tylko odbiór, bez poprawek kodu i rozszerzania zakresu. Usterka → plik, reprodukcja, oczekiwane/rzeczywiste i zadanie naprawcze przed odbiorem.





## Steps
- Uruchomić pełne typecheck/test/build, następnie serwery dev; zapisać wersję kodu i wyniki bramek.
- Przejść pełne partie dla 3 + obserwator i 6, w każdej fazie timeout oraz reload/reconnect; skontrolować karty, termin, stary ruch i czyszczenie szkiców.
- Wymusić legalną partią aukcję do T, powrót lidera, wybór cudzych stosów, własną/cudzą pułapkę, sukces, automatyczny ostatni stos oraz remis.
- Sprawdzić WebSocket/DOM, miejsca, wygraną w statystykach, punkty wieczoru, rewanż i lobby; wyjście przy 3+ osobach kończy bez zwycięzcy, zgodnie z KONCEPT.
- Zmierzyć 360×640 z 6 długimi nickami: pola 48 px, potwierdzanie, dostępność własnego stosu, brak przewijania planszy, pionowe odsłony ponad StickyBar; sprawdzić reduced motion, zastany stan i brak podwójnego harm.
- Zapisać w Result dowody i nierozstrzygnięte punkty; przekazać scenariusze fizycznego telefonu i próby ludzi do 11-08.

## Acceptance
- [x] `pnpm typecheck && pnpm test` → exit 0
- [x] `pnpm --filter web build` → exit 0
- [x] Każdy scenariusz ma wynik i dowód; brak niezałatwionych błędów funkcjonalnych, prywatności i układu.
- [x] Odbiór obserwatora dla 6 opiera się na testach 11-02/03, nie na nieistniejącym siódmym miejscu.
- [x] Nie oznaczono prób z ludźmi ani fizycznego telefonu jako zaliczonych przez samą emulację.

## Result
Kod: `47b4e1c` (gałąź faza/11-sabotaz). Bramki: typecheck, testy (2478 + 187 + 428) i build zielone; serwery dev działały (restart po ostatniej zmianie packages/games nie był potrzebny) i zostały uruchomione. Przeglądarka (Playwright, 360×640, `?dev` niepotrzebny: osobne konteksty z nickami po 16 znaków).
3 + obserwator (pokój, obserwator przeniesiony do oglądających): R1 aukcja do T z powrotem lidera, przy T tylko Pas, odkrywanie cudzych stosów, ostatni stos automatycznie do cudzej Pułapki (Celina +1); R2 własna Pułapka (0 pkt); R3 sukces z wyborem stosów A i B na zmianę; R4 same limity: pierwsze karty 30 s (Przejście), układanie 60 s (otwarcie na 1), dwa pasy po 60 s; R5 limit odkrywania 60 s (losowy cudzy stos, szkic wyboru wyczyszczony po nowej decyzji); R6 remis 3:3 (1., 1., 3., Remis, bez zwycięzcy). Limit odsłony 15 s otwiera rundę sam, `Dalej` części osób nie odnawia terminu (licznik 15→12→9). Reload w fazach initial/place/bid/reveal/summary zachowuje stan i termin (np. 47→44 s). Ramki WS obserwatora bez „trap” przed odkryciem; po końcu: Szczegóły z 6 rundami, bez `Dalej`.
Rewanż i druga partia: Ania 12 pkt, „Wygrywasz!”, statystyki `sabotaz`: 1 wygrana (remis nic nie zapisał), tabela wieczoru po 2 grach 3/1/0 i odznaki punktów wieczoru zgodne z regułami. Wyjście zgodne z protokołem przy 3 osobach (skrypt Colyseus na serwerze dev): faza over, wynik {}, miejsca null, wieczór 0, statystyki bez zmian.
6 graczy (nicki po 16 znaków, 360×640, bez przewijania w initial/bid/reveal, pola ≥ 48 px, brak błędów strony): dwie partie do końca, czteroosobowy remis (1., 1., 1., 1., 5., 6.), Do lobby działa, odsłona z 24 kartami przewija się ponad paskiem. Wibracje (zapis `navigator.vibrate`): [60,40,60] raz u odkrywającego cudzą Pułapkę, brak u właściciela i przy własnej Pułapce, brak po reloadzie; ograniczony ruch skraca stone-pop do 1e-05 s; zastany stan bez animacji. Poufność przy 6: ostatnia ramka rywali ma o 5 B i jedno „trap” mniej niż ramka właściciela, DOM rywala bez rodzaju karty. Widok obserwatora dla 6: testy 11-02/03 (bez siódmego połączenia).
USTERKA U1 (LOW, naprawiona w 11-09, `06f45f7`): `apps/web/src/games/Sabotaz.tsx`, faza place przy 6 graczach z nickami 16 zn. i kartami w ręce: `scrollHeight - innerHeight` = 4 px (oczekiwane 0); 3 gracze 0, pusta ręka 0. Pomiar po naprawie: 5 i 6 graczy, initial/place/bid/reveal, wszędzie 0, pola ≥ 48 px. Obserwacja O1: licznik pokazuje 61 s/31 s przy limicie 60/30 s (wspólny `Countdown` w Game.tsx, `Math.ceil` od terminu z zapasem; dotyczy wszystkich gier, poza zakresem).
Nierozstrzygnięte: pełna partia 6 osób samymi limitami (22+ min; pokryta testem 11-02), stary ruch w UI (pokryty testami 11-02/03), wibracje i dotyk na fizycznym telefonie oraz balans (11-08). Zrzuty i skrypty tylko w katalogu tymczasowym sesji.
Deviations: AGENTS.md — zmiana użytkownika sprzed zadania, nie commitowana; .telos/phases/11-sabotaz/11-09-uklad-ukladania-5-6.md — nowe zadanie naprawcze (w zakresie .telos/)

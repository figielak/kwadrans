# Proces i spójność zasad
<!-- Skrót ZASADY.md §1-3 i §6. Źródłem prawdy pozostaje ZASADY.md. -->

## Kolejność nowej gry
Stała: **ustalenia → testy zasad → kod zasad → ekran → podpięcie**, każdy krok osobnym commitem.
1. Sekcja i wiersz tabeli w `ZASADY-GIER.md`. Dopóki punkt jest niejasny, nie pisze się testów.
2. `packages/games/src/<id>.test.ts` commitowany przed kodem („<Gra>: testy zasad”), czerwony w chwili commitu.
3. `packages/games/src/<id>.ts`, wpis w `GAMES`, eksport `View` i stałych z przedrostkiem gry w `index.ts` (np. `SLEDZENIE_ROUNDS`).
4. `apps/web/src/games/<Gra>.tsx`.
5. Gałąź w `screens/Game.tsx` (mini-gra: `key` z wyzwania albo `nonce`; listę daje `MINI_GAME_IDS`; gra główna z własną tabelą
   po partii do `OWN_RANKING`), ikona w `ICONS` w `screens/Lobby.tsx`. Mini-gra: `record` (trzeci argument `ranked`, z `tie`
   przy drugim kryterium), przypadek w `RECORDS` w `index.test.ts`, jednostka w `FORMAT` w `Records.tsx`, wpis w `MiniGame.tsx`.
6. Wiersz w katalogu gier w `KONCEPT.md` (§2).
Kod jest gotowy, gdy przechodzą wszystkie testy bez zmieniania ich pod implementację. Zła zasada: najpierw test i `ZASADY-GIER.md`.

## Co ustalić przed testami
- Tożsamość: `id` (małe litery, myślniki, na zawsze), nazwa w UI (1-2 słowa, mieści się na kaflu), `minPlayers`/`maxPlayers`
  (`minPlayers: 1` = mini-gra), tryby tylko w grach głównych (`modes`, jeden `default`; tryb zmienia liczby, nie mechanikę; jeden ranking).
- Typ gry: po kolei / ukryty stan / równoczesna z fazami / mini-gra (wzorce w `GAMES.md`).
- Zasady: przebieg tury, lista `Move`, koniec gry, remis, pełny ranking czy zwycięzca, co losowe i kiedy, co ukryte przed kim
  i co widzi obserwator, limit tury i `timeoutMove` w każdej fazie. Wszystkie liczby jako nazwane stałe, bez „około”.
- Mini-gra: jednostka, kierunek, remis, zakres możliwych wartości (serwer odrzuca resztę), najgorszy wynik po limicie.
- Ekran: pion (poziom tylko gdy plansza naprawdę nie mieści się w pionie; dziś tylko Kampus Tour), widok czekającego
  i obserwatora, co pokazuje ekran końcowy poza rankingiem.

## Obowiązkowe testy (`<id>.test.ts`)
- Nagłówek: komentarz z listą zasad, które testy ustalają (wzór `stoper.test.ts`).
- Definicja (`minPlayers`, `maxPlayers`, `turnSeconds`/`turn()`, świeża gra nieskończona). Setup (stan, `waitingFor`,
  różne seedy różne losowania, ten sam seed to samo).
- Walidacja osobno: gracz spoza gry, ruch poza turą lub w złej fazie, ruch poprawny w kształcie, ale niedozwolony,
  ruch po końcu gry, wartości brzegowe (pierwsza i ostatnia dozwolona przechodzą, sąsiednie nie).
- `moveSchema` odrzuca śmieci (zły typ, brak pola, za długi tekst, liczba niecałkowita).
- Każda zasada z sekcji `ZASADY-GIER.md` ma test nazwany jak zasada.
- Koniec: wygrana każdego gracza, remis, kolejność rankingu, `waitingFor` puste. Limit: `timeoutMove` w każdej fazie
  przechodzi `validateMove`. Stan: `applyMove` nie mutuje, stan przeżywa `JSON.parse(JSON.stringify(...))`.
- Ukryty stan: `playerView` bez danych przeciwnika w każdej fazie, obserwator bez danych żadnej strony, odsłona dokładna.
- Fazy równoczesne: `waitingFor` kurczy się, `turn().key` zmienia się tylko przy zmianie fazy, progi przy min. i max. liczbie graczy.
- Mini-gra: wynik poza zakresem i niecałkowity odpada, drugi wynik odpada, remis bez zwycięzcy, solo kończy się rankingiem
  bez zwycięzcy, rewanż daje inne wyzwanie; funkcja licząca wynik z surowych danych testowana także na danych zepsutych.
- Styl: gracze `A`, `B`, `C`, `createRng(seed)`, pomocnik `send(state, player, move)` (walidacja, potem `applyMove`),
  stan budowany ruchami, nie ręcznym obiektem. Nazwy po polsku („trafienie daje kolejny strzał”).

## Spójność zasad między grami (odstępstwo wymaga wpisu w `ZASADY-GIER.md` z powodem)
- Po limicie tury ruch, nie przegrana: neutralny albo losowy dozwolony; w mini-grze najgorszy możliwy wynik.
  Schulte i Sudoku: nowe nieukończenie `completed: false`, ukończenia zawsze wyżej, nieukończeni remisują, bez rekordu.
- Remis nie ma zwycięzcy (`isOver` zwraca samo `ranking`). Mini-gry przez `ranked` (`rankResults` i `places` z jednego
  komparatora); remis i solo nie liczą się do wygranych; bez `places` mini-gra nie przejdzie testu kontraktu (turniej).
  Świadomy remis po osiągnięciu kompletu jest dopuszczalny z powodem w zasadach.
- Zaczyna pierwszy z `players`; kolejność rotuje platforma przy rewanżu. Losowość tylko z `rng` (dekoracja klienta nie podlega).
- Mini-gra: jeden ruch `result` i pole odróżniające partie (wyzwanie albo `nonce`). Ekran końcowy rysuje się z samego stanu
  (dane w mapach z id gracza: `results`, `taps`…), bo rekordowa partia jest pokazywana z `me=""`.
- Losowanie nie zmienia sufitu wyniku: cele o stałej sumie (`withSum`), stała liczba bodźców (Refleks), rodzaje plansz
  potasowanymi kompletami (Kolor liter, Inny element, Liczenie, Obrót), decyzja „stop” ze stałym kompletem tasowanym
  (Balon 11-20). Przytrzymaj i Za zasłoną zostają przy losowych celach o stałej sumie (odtwarzanie czasu jest treścią).
- Kara za pomyłkę w grach na czas: blokada 1 s albo doliczony czas, nigdy koniec partii.
- Wspólne funkcje z `core.ts` zamiast własnych; dwie gry o tej samej mechanice dzielą moduł.

## Norma limitów (zatwierdzona ZG4-v1, 2026-10-26)
- Gry po kolei: 60 s na ruch. Mini-gra: `L >= max(1,2 · T, T + 10 s)`, jeden termin od końca instrukcji.
- `T` = czasy stałe (wstęp, pokazy, odsłony, pauzy) + czas decyzji wolnego, uczciwego gracza + sieć; każdy składnik ze źródłem
  (stała, założenie, pomiar). Czasy ludzkie i sieć to założenia, dopóki nie zmierzone. Oceniamy solo/ostatniego klikającego „Start”.
  Zapas w sekundach i procentach; przy długości zależnej od serii opisać `T(N)` i zachowanie po limicie.
- Wyjątki: Środek 60 s i Tort 120 s (świadome, bez pomiaru), Który rok? 270 s przy `T = 228 s` (zapas 42 s, 18,4%, P4-021).
- Przyjęcie normy nie zmienia samo stałych, losowania ani punktacji gier; zmiana = test i dokumentacja przed kodem.

## Odbiór gry (`/dev`, `/dev?n=...`)
`pnpm test` i `pnpm typecheck` bez błędów; pełna partia przy min. i max. liczbie graczy plus obserwator; odświeżenie w każdej
fazie; limit tury w każdej fazie; wyjście gracza (walkower); remis, rewanż, powrót do lobby; wynik w rankingu (mini-gra: „Rekordy”
i panel po partii); ekran 360×640; w wiadomościach WebSocket brak ukrytych danych; punkty z `UI.md`. Po zmianie w `packages/games`
serwer dev restartuje się sam (partie przepadają).

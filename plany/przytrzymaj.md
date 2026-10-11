# Nowa mini-gra: Przytrzymaj (`przytrzymaj`)

## Kontekst

Kolejna mini-gra z grupy „Szybkie i refleksowe”: pole świeci się przez losowy czas (1-5 s), gracz odtwarza ten czas,
trzymając palec na ekranie. 5 rund, wynik = suma odchyłek w ms, mniej lepiej. Mechanicznie to krewny Stopera (ocena czasu
bez licznika) i Rytmu (serwer liczy wynik z surowych czasów). Proces według `ZASADY.md`:
ustalenia → testy → zasady → ekran → opis, każdy krok osobnym commitem (commit dopiero na prośbę).

Przyjęte domyślnie (do zmiany przy akceptacji planu):
- czasy to dowolne pełne ms z zakresu 1000-5000, losowane niezależnie (bez siatki co 0,5 s, żeby nie dało się zgadywać „okrągłych”),
- wynik liczy serwer z surowych czasów trzymania,
- na końcu tabela rund (cel i odchyłka ze znakiem u każdego gracza), jak w Środku i Mapie.

Uwaga: w drzewie roboczym leżą zastage'owane, niezacommitowane Rekordy w tych samych plikach (`index.ts`, `Game.tsx`, `Records.tsx`,
`KONCEPT.md`, `ZASADY.md`). Przytrzymaj dopisuję obok, niczego z nich nie ruszam.

## Zasady (trafią do `ZASADY-GIER.md`)

- `id` `przytrzymaj`, nazwa „Przytrzymaj”, 1-6 graczy, mini-gra, `turnSeconds: 120`
  (najdłuższa uczciwa partia: 5 × (1 s wstępu + 5 s światła + 10 s trzymania + 1,5 s odsłony) ≈ 88 s).
- Stałe: `ROUNDS = 5`, `MIN_MS = 1000`, `MAX_MS = 5000`.
- Serwer losuje w `setup` listę `targets` (5 czasów w ms, int, `MIN_MS..MAX_MS`), tę samą dla wszystkich. Bez `nonce`:
  pięć losowych ms praktycznie się nie powtarza, ekran montuje się od nowa po `key` z `targets`.
- Jeden ruch `{ type: "result", holds: number[] }`: czasy trzymania w ms (int) w kolejnych rundach.
- Wynik liczy serwer funkcją `deviation(target, hold) = min(target, |hold − target|)`; wynik = suma z 5 rund.
  Odchyłka rundy ucięta do celu: puszczenie od razu i trzymanie w nieskończoność kosztują tyle samo (jak w Stoperze).
- Walidacja: gracz z gry, bez wyniku, lista pusta albo dokładnie `ROUNDS` czasów, każdy całkowity `0..2 × MAX_MS`.
  Pusta lista = limit czasu = suma celów (najgorszy możliwy wynik).
- Ranking: mniejsza suma wyżej, równe = remis bez zwycięzcy (`ranked`); rekord `{ lower: true }`, bez `tie`.
- Stan trzyma też `holds` każdego gracza (do tabeli rund na końcu); `playerView` zwraca cały stan
  (cele widać w widoku od startu, komentarz `ponytail:` jak w Środku).
- Grający nie widzi limitu tury ani żadnego licznika sekund (tykający pasek podawałby czas), jak w Stoperze i Rytmie.
- Ekran sam kończy trzymanie po dwukrotności celu (dalej i tak odchyłka jest ucięta).

## Kroki (osobne commity)

1. **Ustalenia**: `plany/przytrzymaj.md` (ten plan), sekcja `### Przytrzymaj (`przytrzymaj`)` i wiersz tabeli w `ZASADY-GIER.md`;
   dopisek „Przytrzymaj” do listy gier, w których wynik liczy serwer.
2. **Testy** `packages/games/src/przytrzymaj.test.ts` (wzór: `rytm.test.ts` i `stoper.test.ts`; nagłówek z listą zasad, `A`/`B`/`C`, `send`):
   - definicja (`["przytrzymaj", 1, 6, 120]`), świeża gra nieskończona,
   - setup: 5 celów, każdy int w 1000-5000, na wielu seedach trafiają się wartości z obu końców zakresu;
     różne seedy dają różne cele, ten sam seed te same,
   - `deviation`: idealnie = 0; za krótko i za długo o tyle samo dają to samo; puszczenie od razu = cel; trzymanie ponad 2× ucięte do celu,
   - wynik = suma odchyłek z 5 rund (stan budowany pomocnikiem `exact(state, offset)` z celów, bez wpisanych liczb),
   - walidacja: obcy gracz, drugi wynik, po końcu gry, lista 4 i 6 czasów odpada, czas −1 i `2 × MAX_MS + 1` odpada
     (0 i `2 × MAX_MS` przechodzą), czas niecałkowity,
   - schemat: czas tekstem, brak listy, zły typ ruchu, lista dłuższa niż `ROUNDS`,
   - koniec: wygrana każdego z trzech, remis bez zwycięzcy, solo bez zwycięzcy, `waitingFor` kurczy się i jest puste,
   - `timeoutMove` przechodzi `validateMove` i daje sumę celów; `applyMove` nie mutuje, stan przeżywa JSON.
   - `index.test.ts`: licznik gier 25 → 26, wpis `przytrzymaj: { lower: true, good: 10, bad: 200 }` w `RECORDS`.
3. **Zasady** `packages/games/src/przytrzymaj.ts` (ok. 60 linii, szkielet z `rytm.ts`: `ranked(...)`, `results: Record<PlayerId, number>`
   plus `holds: Record<PlayerId, number[]>` jak `taps` w `srodek.ts`), wpis w `GAMES` i eksporty w `index.ts`
   (`PrzytrzymajView`, `PRZYTRZYMAJ_ROUNDS`, `przytrzymajDeviation`).
4. **Ekran** `apps/web/src/games/Przytrzymaj.tsx` (wzór `Rytm.tsx` i `Stoper.tsx`) + podpięcie:
   - fazy `intro → show → hold → reveal → sent`; w rundzie: `LEAD_MS = 1000` „Patrz”, pole świeci przez `targets[i]`
     (zapalenie i zgaszenie bez przejścia, terminy liczone od startu rundy), potem „Przytrzymaj”,
   - trzymanie: całe pole `min-h-80`, `touch-none select-none [-webkit-touch-callout:none]`, `onContextMenu` z `preventDefault`
     (długie przytrzymanie na telefonie otwiera menu), `setPointerCapture`; czas z `e.timeStamp` między `onPointerDown`
     a `onPointerUp` / `onPointerCancel`; w trakcie pole w kolorze gracza; timer kończy trzymanie po 2× celu,
   - odsłona 1,5 s: „Twój czas 2,31 s”, „cel 2,50 s”, odchyłka ze znakiem (kolory progów jak w `Stoper.tsx`), potem następna runda;
     po piątej `onMove({ type: "result", holds })`,
   - `Stats` (ui.tsx) nad polem: „Runda 2/5”; żadnego licznika sekund,
   - koniec: `Scores` z „843 ms” i tabela rund (5 kolumn: cel w nagłówku, odchyłka ze znakiem na gracza, najlepszy w rundzie
     wyróżniony kolorem gracza; układ i `best(round)` z `Srodek.tsx`, liczone przez `przytrzymajDeviation`),
   - `Intro` z `Preview` (pole świecące `preview-half`, bez nowych keyframes), punkty: „5 rund, pole świeci się od 1 do 5 sekund”,
     „Przytrzymaj palec tak długo, jak świeciło pole”, „Liczy się suma odchyłek, mniej znaczy lepiej”,
   - `screens/Game.tsx`: gałąź z `key={JSON.stringify(view.targets)}`, wpis w `MINI_GAMES`, ukrycie paska limitu obok `stoper` i `rytm`
     (linia ~183); `screens/Lobby.tsx`: ikona `HandTap` w `ICONS`, zdanie w `BLURBS`; `screens/Records.tsx`: `przytrzymaj: { value: ms }` w `FORMAT`.
5. **Opis** w `KONCEPT.md`: punkt w 2.4, limit 120 s w „Limit tury”, „19 sztuk” → 20 w tabeli etapów.

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/przytrzymaj.test.ts` (po kroku 2 czerwone, po kroku 3 zielone), potem `pnpm typecheck && pnpm test`.
- `/dev?n=2` i solo (Playwright, 360×640): pełna partia, suma z ekranu zgadza się z serwerem; puszczenie od razu, trzymanie do automatycznego końca,
  remis, rewanż (inne cele, ekran od nowa), odświeżenie w trakcie, obserwator, autostart po 15 s, limit tury (wynik = suma celów),
  pasek limitu niewidoczny u grającego, wynik na ekranie „Rekordy” i w panelu po partii.
- Na telefonie: długie przytrzymanie nie otwiera menu ani zaznaczania, zjechanie palcem poza pole nie urywa pomiaru.

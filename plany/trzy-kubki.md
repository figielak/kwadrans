# Trzy kubki (`kubki`): nowa mini-gra

## Kontekst

Nowa mini-gra do listy „Szybkie i refleksowe”: kulka pod jednym z trzech kubków, kubki się tasują, gracz wskazuje właściwy.
Każda runda szybsza, wynik = liczba rund bez pomyłki. Mechanicznie to bliźniak Śledzenia (rundy do pierwszej pomyłki,
ruch z jednego wzoru, wynik liczony na serwerze ze wskazań), więc kopiujemy jego wzorzec: `sledzenie.ts`, `Sledzenie.tsx`.

## Ustalenia (trafią do `ZASADY-GIER.md`)

- **Tożsamość**: `id` `kubki`, nazwa „Trzy kubki”, 1-6 graczy, mini-gra, bez trybów, `turnSeconds: 180`.
- **Runda**: kubek z kulką jest uniesiony przez 1 s (`SHOW_MS`), opada, potem seria zamian miejscami dwóch kubków, potem gracz dotyka kubka.
  Po wskazaniu przez 1 s widać, gdzie była kulka.
- **Tempo** (runda `r` od 0):
  - liczba zamian `swapCount(r)` = 4 + r (`SWAPS_START`, 4 do 23),
  - czas jednej zamiany `swapMs(r)` = max(150, 500 − 25·r) ms (`SWAP_MS_START`, `SWAP_MS_STEP`, `SWAP_MS_MIN`; dno od rundy 15).
  - Tasowanie trwa najwyżej 3,5 s, cała runda ok. 6-7 s, 20 rund ok. 2 min plus namysł, stąd 180 s.
- **Koniec**: pierwsza pomyłka kończy partię (jak Śledzenie i Sekwencja), najwyżej 20 rund (`ROUNDS`).
- **Losowość** (serwer, `setup`, to samo dla wszystkich): dla każdej rundy miejsce kulki `ball` (0-2) i lista zamian `swaps`
  (pary miejsc `[a, b]`, a ≠ b). Ta sama para nie pada dwa razy z rzędu (druga cofałaby pierwszą).
- **Ruch**: jeden `{ type: "result", picks: number[] }`: wskazane miejsce (int 0-2) w kolejnych rundach, najwyżej 20.
  Serwer liczy wynik: liczba rund od początku, w których `picks[i] === ballAt(rounds[i])`; reszta po pierwszym błędzie ignorowana.
- **Wynik**: liczba rund (więcej lepiej), **bez drugiego kryterium** (przy trzech kubkach nie ma „prawie”); równe = remis bez zwycięzcy.
  `record: { lower: false }` bez `tie`.
- **Limit**: `timeoutMove` = `picks: []` = 0 rund (jak Śledzenie).
- **Ukrywanie**: brak, `playerView` zwraca cały stan (wspólna decyzja mini-gier).
- **Ekran końcowy**: `Scores` z „N rund” i jedno zdanie opisu, jak w Śledzeniu.

## Kroki (każdy to osobny commit, wg `ZASADY.md`)

1. **„Trzy kubki: zasady w ZASADY-GIER”**: wiersz tabeli, sekcja `### Trzy kubki (\`kubki\`)`, dopisek na liście „wynik liczy serwer”.
2. **„Trzy kubki: testy zasad”**: `packages/games/src/kubki.test.ts` na wzór `sledzenie.test.ts` (nagłówek z listą zasad, `A/B/C`, `send`, `accepts`):
   definicja, setup (te same rundy dla wszystkich, seed), `swapCount`/`swapMs` na brzegach (r = 0, 14, 19), pary poprawne i bez powtórki z rzędu,
   `ballAt` (ręcznie policzony przykład), liczenie rund do pierwszej pomyłki, walidacja (obcy gracz, drugi wynik, 21 rund, miejsce 3 i −1, niecałkowite),
   schemat, remis, solo, każdy gracz wygrywa, `timeoutMove`, niezmienność stanu i JSON.
   Do tego wpis `kubki: { lower: false, good: 7, bad: 3 }` w `RECORDS` w `index.test.ts`.
3. **„Trzy kubki: zasady (...)”**: `packages/games/src/kubki.ts` (ok. 60 linii): stałe, `swapCount`, `swapMs`, `ballAt`, definicja z `ranked(..., (a, b) => b - a, { lower: false, score: (r) => r })`.
   Wpis w `GAMES` i eksporty w `index.ts` (`KUBKI_ROUNDS`, `KUBKI_SHOW_MS`, `kubkiSwapMs`, `kubkiBallAt`, `KubkiView`).
4. **„Trzy kubki: ekran, podpięcie w grze, lobby i rekordach”**:
   - `apps/web/src/games/Kubki.tsx` na szkielecie `Sledzenie.tsx`: fazy `intro → show → shuffle → pick → reveal → sent`, `Intro` z `Preview`, `Stats` (Runda, Teraz), `Scores`.
   - Tasowanie przez `requestAnimationFrame` z pozycjami wpisywanymi wprost w DOM (jak Śledzenie), nie przez `transition`:
     reguła `prefers-reduced-motion` zeruje przejścia CSS, a identyczne kubki, które przeskakują, byłyby nie do śledzenia. Ruch jest tu treścią gry.
     W zamianie jeden kubek idzie łukiem górą, drugi dołem (`±sin(πp)`), żeby się nie przenikały.
   - Kubki to trzy trapezy (`clip-path`, `bg-fg`), kulka w kolorze gracza; dotyk łapie cały kafel i wybiera najbliższy kubek (`onPointerDown`, `touch-none select-none`). Pomyłka: `navigator.vibrate?.(60)`.
   - `screens/Game.tsx`: gałąź z `key={JSON.stringify(view.rounds)}`, wpis w `MINI_GAMES`; `screens/Lobby.tsx`: `ICONS` (`PintGlass`) i `BLURBS`;
     `screens/Records.tsx`: `FORMAT` z „runda/rundy/rund”.
5. **„Trzy kubki: opis w KONCEPT”**: punkt w sekcji 2.4, 180 s na liście limitów, licznik mini-gier w tabeli etapów.

Bez nowych zależności, bez nowych keyframes (podgląd używa `preview-half`).

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/kubki.test.ts src/index.test.ts`, potem `pnpm typecheck && pnpm test`.
  Uwaga: na gałęzi leży `tort.test.ts` bez `tort.ts` (Tort w toku), więc pełny `pnpm test` może być czerwony z tego powodu; zgłoszę osobno, Tortu nie ruszam.
  Niezacommitowanych zmian w Memory też nie dotykam (commity tylko z własnymi plikami).
- `/dev?n=2` w przeglądarce (Playwright): pełna partia, pomyłka w 1. rundzie, remis, rewanż (inne rundy), obserwator, 360×640, panel rekordu po partii.
- Serwerów dev po pracy nie ubijam.

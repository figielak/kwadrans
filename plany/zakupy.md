# Zakupy (`zakupy`): nowa mini-gra

## Kontekst

Nowa mini-gra pamięciowa: przez 10 s widać listę 10 przedmiotów (emoji), potem z 20 trzeba zaznaczyć te z listy.
Wynik = trafienia minus fałszywe zaznaczenia (więcej lepiej).
Mechanicznie najbliżej jej do Balonu (`balon.ts`): serwer losuje wyzwanie, klient odsyła surowe dane (zaznaczone indeksy),
serwer liczy wynik, ranking ma drugie kryterium. Kopiujemy ten wzorzec, bez nowych abstrakcji.

## Ustalenia (krok 1 z ZASADY.md)

| | |
|---|---|
| `id` / nazwa | `zakupy` / „Zakupy” |
| Gracze / limit | 1-6, `turnSeconds: 60` (10 s pokazu + do 50 s zaznaczania) |
| Stałe | `LIST = 10`, `SHELF = 20`, `SHOW_MS = 10_000`, `MAX_MS = 50_000` |
| Losowanie | z puli około 60 emoji produktów (`ITEMS` w `zakupy.ts`) 20 różnych, te same dla wszystkich: `items` (kolejność na półce) i `listed` (10 indeksów w kolejności na liście); `shuffle` z `core.ts` |
| Ruch | jeden `{ type: "result", picked: number[], ms: number }`: `picked` to różne indeksy 0-19 (najwyżej 20), `ms` to czas od pokazania półki do „Gotowe” (int 0-50 000) |
| Wynik | liczy serwer, `score(listed, picked)`: `hits`, `wrong`, `score = max(0, hits − wrong)`, czyli 0-10 (dolna granica jak w Obrocie) |
| Ranking | więcej punktów wyżej, przy równych krótszy `ms`; równe oba to remis |
| Limit czasu | `picked: []`, `ms: MAX_MS`: 0 pkt z najgorszym czasem |
| Rekord | `{ lower: false }`, `tie: { lower: true }` po `ms` („9 pkt · 8,4 s”) |
| Rewanż | bez `nonce`, ekran montuje się po `items` |

Ustalone z użytkownikiem:
- **Zaznaczać można dowolnie, 0-20.** Strzał w ciemno może kosztować punkt; pustą półkę też można zatwierdzić (0 pkt z prawdziwym czasem).
- **Remis rozstrzyga czas zaznaczania.**

Decyzje, które podjąłem sam (popraw, jeśli chcesz inaczej):
- Bez ruchu `progress` (jedna runda).
- Dystraktory losowe z tej samej puli, bez dobierania „podobnych” do listy.
- `// ponytail:` lista jest w widoku od startu (jak torty i balony), da się ją podejrzeć w WebSockecie; między znajomymi wystarczy.
  Uczciwa wersja to `playerView` bez `listed` do czasu wyniku.

## Ekran (`apps/web/src/games/Zakupy.tsx`, wzór: `Balon.tsx`)

- Fazy: `intro` → `show` (10 s) → `pick` → `sent`.
- `show`: lista 10 emoji w siatce 5×2 i pasek upływającego czasu (animacja CSS, bez pomiaru).
- `pick`: półka 5×4 z 20 emoji, kafle min. 48 px (5 kolumn mieści się na 360 px), `touch-none select-none`, `onPointerDown`.
  Dotknięcie zaznacza i odznacza (obwódka w kolorze gracza). Pod spodem „Gotowe” (`btn-primary`).
  Czas liczony z `performance.now()` od pokazania półki.
- `Stats`: „Zaznaczone 7”, „Czas”.
- `Intro` z `Preview` (kilka kafli na `preview-half` / `preview-quarter`), trzy punkty.
- Ekran końcowy: `Scores` („8 pkt (9 traf., 1 błąd) · 12,3 s”) i jedna półka z odpowiedzią: przedmioty z listy podświetlone,
  przy każdym kropki w kolorach graczy, którzy go zaznaczyli.
- Bez nowych klas i keyframes, jeśli wystarczą istniejące.

## Pliki, w kolejności commitów

1. **„Zakupy: zasady w ZASADY-GIER”**: wiersz tabeli i sekcja `### Zakupy (`zakupy`)` po Torcie w `ZASADY-GIER.md`.
2. **„Zakupy: testy zasad”**: `packages/games/src/zakupy.test.ts`, układ jak `balon.test.ts`
   (definicja, setup z seedami i brakiem powtórzeń, `score` także na danych zepsutych, walidacja brzegów i duplikatów w `picked`,
   schemat, koniec dla A/B/C, remis po czasie, pełny remis, solo, limit, niezmienność + JSON)
   oraz przypadek `zakupy` w `RECORDS` w `index.test.ts` (z `tied` po `ms`).
3. **„Zakupy: zasady (...)”**: `packages/games/src/zakupy.ts` (ok. 70 linii, `ranked` z `core.ts`), import, wpis w `GAMES`
   i eksport `ZAKUPY_LIST`, `ZAKUPY_SHOW_MS`, `zakupyScore`, `ZakupyView` w `index.ts`.
4. **„Zakupy: ekran, podpięcie w grze, lobby i rekordach”**: `Zakupy.tsx`; `screens/Game.tsx` (gałąź z `key` z `items`, wpis w `MINI_GAMES`);
   `screens/Lobby.tsx` (`ICONS`: `ShoppingCart`, `BLURBS`); `screens/Records.tsx` (`FORMAT`: `{ value: points, tie: sekundy z przecinkiem }`).
5. **„Zakupy: opis w KONCEPT”**: punkt w 2.4, drugie kryterium w akapicie o rekordach, licznik mini-gier w tabeli etapów.

Commity tylko na prośbę.

## Uwaga: niezacommitowany Tort

W drzewie roboczym leży niezacommitowany ekran Tortu (`Tort.tsx`, zmiany w `Game.tsx`, `Lobby.tsx`, `Records.tsx`, `ui.tsx`).
Krok 4 dotyka tych samych plików, więc Tort trzeba zacommitować przed nim, inaczej oba ekrany wylądują w jednym commicie.
Kroki 1-3 są od tego niezależne. To samo dotyczy pozostałych planów w `plany/` (krok 4 każdego rusza te same trzy pliki ekranów).

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/zakupy.test.ts` (po kroku 2 czerwone, po kroku 3 zielone).
- `pnpm typecheck && pnpm test`.
- `/dev?n=2` na 360×640: pełna partia, obserwator, odświeżenie w trakcie, dobiegnięcie limitu, remis po czasie, rewanż (inna lista),
  rekord na ekranie „Rekordy” i w panelu po partii. Serwery dev zostają włączone.

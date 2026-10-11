# Nowa mini-gra: Balon (`balon`)

## Kontekst

Dwudziesta pierwsza mini-gra z grupy „Szybkie i refleksowe”: gra na ryzyko zamiast refleksu. Gracz pompuje balon stuknięciami
(stuknięcie = punkt), w dowolnej chwili zgarnia punkty, a pęknięcie je zabiera. 10 balonów, progi losuje serwer, te same
dla wszystkich. Wynik = suma zgarniętych punktów. Proces według `ZASADY.md`: ustalenia → testy → zasady → ekran → opis,
każdy krok osobnym commitem (commit dopiero na prośbę). Praca na gałęzi `turniej`, obok Przytrzymaj.

Ustalone z użytkownikiem:
- progi są w widoku od startu, partia na kliencie, jak w reszcie mini-gier (da się podejrzeć, komentarz `ponytail:`),
- wytrzymałość balonu losowana równomiernie z 1-30,
- remis rozstrzyga mniejsza liczba pękniętych balonów (także w rekordach).

## Zasady (trafią do `ZASADY-GIER.md`)

- `id` `balon`, nazwa „Balon”, 1-6 graczy, mini-gra, `turnSeconds: 120` (10 balonów × najwyżej 31 stuknięć plus pauzy, z zapasem).
- Stałe: `BALLOONS = 10`, `MIN_SAFE = 1`, `MAX_SAFE = 30`.
- `setup` losuje `limits: number[]` (10 liczb całkowitych 1-30): tyle stuknięć balon wytrzymuje. Stuknięcie numer `limit + 1` go rozrywa.
- Każde stuknięcie to 1 punkt w balonie. „Zgarnij” dopisuje punkty balonu do sumy i daje następny balon; pęknięcie daje 0 za ten balon.
  Zgarnięcie pustego balonu (0 stuknięć) jest dozwolone i daje 0.
- Ruch `{ type: "result", pumps: number[] }`: liczba stuknięć w każdym balonie (int 0-31; 31 może znaczyć tylko pęknięcie).
  Lista ma 10 pozycji albo jest pusta (limit czasu).
- Wynik liczy serwer funkcją `score(limits, pumps)` → `{ score, popped }`: balon z `pumps[i] > limits[i]` jest pęknięty (0 pkt),
  inaczej daje `pumps[i]`. Pusta lista = najgorszy wynik: 0 pkt i 10 pękniętych.
- Ranking: więcej punktów wyżej, przy równych mniej pękniętych; równe oba = remis bez zwycięzcy. Zakres wyniku 0-300.
- Ruch `progress` (`done` = liczba zakończonych balonów, int 1-9) po każdym balonie poza ostatnim: tylko pasek „3/10” w pigułce
  gracza, nie odnawia limitu (`turn` ze stałym kluczem). Punktów rywali w trakcie nie widać (zdradzałyby, ile balon wytrzymuje).
- Walidacja: gracz z gry, bez wyniku, kształt jak wyżej.
- Rozmiar balonu na ekranie zależy tylko od liczby stuknięć, nie od progu.

## Kroki (osobne commity)

1. **Ustalenia**: sekcja `### Balon (`balon`)` i wiersz tabeli w `ZASADY-GIER.md`; dopisek „Balon” w liniach 43-44
   (gry z ruchem `progress`, gry, w których wynik liczy serwer). Kopia tego planu do `plany/balon.md` (jak poprzednie gry).
2. **Testy** `packages/games/src/balon.test.ts` (wzór: `kropki.test.ts`, `wieza.test.ts`; `send`, gracze `A`/`B`/`C`, nagłówek z listą zasad):
   - definicja (1-6, 120 s, `turn().key` stały), świeża gra nieskończona,
   - setup: 10 progów, każdy całkowity w 1-30 (kilkadziesiąt seedów), różne seedy różne, ten sam seed to samo, rewanż inne wyzwanie,
   - `score`: stuknięcia równe progowi dają punkty a próg + 1 to pęknięcie, pęknięty balon daje 0, suma z kilku balonów,
     zgarnięty pusty balon to 0 bez pęknięcia, pusta lista = 0 pkt i 10 pękniętych,
   - walidacja: obcy gracz, drugi wynik, po końcu gry, 9 i 11 pozycji, −1 i 32 odpadają (0 i 31 przechodzą);
     `progress`: 0 i 10 odpadają, 1 i 9 przechodzą, po wyniku odpada,
   - schemat: zły typ, brak pola, liczba niecałkowita, za długa lista,
   - koniec: wygrana każdego gracza, remis punktów rozstrzygnięty pękniętymi, pełny remis i solo bez zwycięzcy,
     `places` z remisem, `waitingFor` kurczy się i jest puste, `progress` nie kończy gry,
   - `timeoutMove` przechodzi `validateMove` i daje najgorszy wynik; `applyMove` nie mutuje, stan przeżywa JSON.
   Wyniki w testach buduje pomocnik z `state.limits` (np. „zgarnij wszystko na progu”, „rozerwij n pierwszych”), nie wpisane liczby.
   Do tego wpis w `RECORDS` i licznik gier w `index.test.ts`.
3. **Zasady** `packages/games/src/balon.ts` (ok. 60 linii, szkielet z `kropki.ts`): `ranked(...)` z `core.ts` z komparatorem
   `b.score − a.score || a.popped − b.popped` i `record` `{ lower: false, score, tie: { lower: true, popped } }`.
   Stan trzyma też `pumps` każdego gracza (do tabeli na końcu). Wpis w `GAMES` i eksporty w `index.ts`
   (`BalonView`, `BALON_BALLOONS`, `BALON_MAX_SAFE`).
4. **Ekran** `apps/web/src/games/Balon.tsx` + podpięcie (wzór `Wieza.tsx`):
   - fazy `intro → play → pause → sent`; stan to `pumps: number[]` (zakończone balony) i `current` (stuknięcia w bieżącym),
   - kwadratowy `.tile` z `touch-none select-none`, `onPointerDown` = stuknięcie; balon to koło w kolorze gracza,
     `transform: scale(...)` rosnące z liczbą stuknięć (`transition-transform` 100 ms),
   - pod kaflem `.btn .btn-primary` „Zgarnij 12 pkt”,
   - pęknięcie: balon znika, „Pękł!” (`float-up`, `text-warning`), `navigator.vibrate?.(60)`; zgarnięcie: „+12” (`float-up`);
     pauza `PAUSE_MS = 800`, potem następny balon albo `onMove` z wynikiem; `progress` po każdym balonie poza ostatnim,
   - `Stats`: „Balon 3/10”, „Suma”, „W balonie”,
   - koniec: `Scores` z „84 pkt (2 pęknięte)”, zdanie o remisie i tabela rund jak w `Srodek.tsx` / `Mapa.tsx`:
     wiersz „Wytrzymał” z progami i wiersz na gracza z jego stuknięciami (pęknięte w `text-warning`),
   - `Intro` z `Preview` (koło pulsujące `preview-half`); bez nowych keyframes i zależności,
   - `screens/Game.tsx`: gałąź z `key={JSON.stringify(view.limits)}`, wpis w `MINI_GAMES`, pigułka `Progress` (numer balonu),
   - `screens/Lobby.tsx`: ikona `Balloon` (Phosphor, jest w paczce) i zdanie w `BLURBS`,
   - `screens/Records.tsx`: `FORMAT.balon` = `points` i `tie` „2 pęknięte” przez `plural`.
5. **Opis** w `KONCEPT.md`: punkt w 2.4, Balon na liście gier z `progress`, limit 120 s w regułach platformy, „21 sztuk” w tabeli etapów.

## Weryfikacja

- `pnpm --filter @mini-games/games exec vitest run src/balon.test.ts` (po kroku 2 czerwone, po kroku 3 zielone), potem `pnpm typecheck && pnpm test`.
- `/dev?n=2` i solo w przeglądarce (Playwright, 360×640): pełna partia, pęknięcie i zgarnięcie, zgarnięcie pustego balonu,
  remis rozstrzygnięty pękniętymi, rewanż (inne progi), odświeżenie w trakcie, obserwator, limit czasu;
  suma na ekranie zgadza się z wynikiem z serwera, rekord widać w panelu po partii i na ekranie „Rekordy”.

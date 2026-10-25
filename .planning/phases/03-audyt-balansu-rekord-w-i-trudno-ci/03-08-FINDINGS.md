# 03-08 FINDINGS: mini-gry do pierwszej pomyłki

**Data:** 2026-10-24 · **Plan:** 03-08 (fala 2) · **Gry:** `kubki`, `sledzenie`, `wieza`, `w-pamieci`.
Liczby z `03-01-CHECKS.md` (§1.4, §2, §2.1), model i progi z `03-02-BASELINE.md`, symulacja Wieży w załączniku. Pewność: **W** wyliczone, **Z** zmierzone, **A** założenie. Repo poza `.planning/` bez zmian.
Wspólne: wynik to liczba zaliczonych rund z sufitem, partia kończy się pierwszą pomyłką, więc jedna trudna runda waży całą partię.

## Trzy kubki (`kubki`)

**Do zdobycia (REC-01)**
- 20 rund o stałej liczbie zamian i tempie (`packages/games/src/kubki.ts:4`, `:22-23`). Losowe są miejsce kulki i pary zamian (`:30-40`): ruchów kulki w całej partii 166-197 (rozrzut 2,7%, Z),
  ale w jednej rundzie (runda 11, 14 zamian) 7-13 (11,6%, Z). Kulka, która rusza się częściej, jest trudniejsza do śledzenia (A). Przy grze do pierwszej pomyłki rozrzut pojedynczej rundy ma znaczenie, ale jest umiarkowany. Niska waga.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 20 (W), bez `tie` (`:70`); `ZASADY-GIER.md` :264 uzasadnia: „przy trzech kubkach nie ma prawie”. Wynik całkowity 0-20, więc równe wyniki zdarzają się często, a remis rozstrzyga data.
  Czy 20 jest osiągalne: ostatnia runda to 23 zamiany po 150 ms, ruch pozorny czytelny od ok. 100 ms (A). Dla skupionego gracza prawdopodobnie tak (A).
  Jeśli tak, rekord 20 jest nie do pobicia, a kolejni gracze z 20 tylko dołączają niżej. Ryzyko średnie, do sprawdzenia w partii.
- `timeoutMove` = 0 rund (`:74`). Wynik wysyłany sam po 1 s od pomyłki (F2:A9, wzór). Zgodne.

**Krzywa trudności (DIFF-01)** (W, 03-01 §2.1)
- Zamiany 4 → 23 (+1 na rundę), czas zamiany 500 → 150 ms (od rundy 15 stały). Czas tasowania rośnie do 3,6 s w rundzie 9, spada do 2,7 s w rundzie 15 i rośnie do 3,45 s w rundzie 20.
- Rundy 1-5 (4-8 zamian po 400-500 ms) przechodzi prawie każdy (A): nie różnicują, ale trwają razem ok. 25 s. Żadna runda nie przekracza progu percepcji (150 ms > ok. 100 ms, A).
  O trudności decyduje liczba zamian. Krzywa zgodna; jeśli 20 okaże się częste, dołożyć rundy albo przyspieszać dalej (B-KB1).

**Limit tury (DIFF-02)**
- T = Σ (tasowanie) 62,9 s + 20 × (0,3 + 1 s pokazu + 1 s odsłony, `apps/web/src/games/Kubki.tsx:16`) + 20 × 1 s wskazania + 3 s = 131,4 s (W). L = 180 s (`:48`): zapas 48,6 s (37%). Zgodne.

**Rekomendacja:** sprawdzić w partii, czy 20 pada. Jeśli tak, więcej rund albo drugie kryterium.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-KB1 | `packages/games/src/kubki.ts:4`, `:70`; `ZASADY-GIER.md` :264 | D-05 (sufit bez `tie`) | średnia | jeśli 20 pada: rundy bez górnej granicy (generowane z tą samą krzywą, np. 40) albo `tie` = czas wskazania w rundzie z pomyłką `[zbiorcze: sufit-bez-tie]` | sprawdzić w partii | A |
| B-KB2 | `packages/games/src/kubki.ts:30-40` | `ZASADY.md` §3 :100 | niska | liczba ruchów kulki w rundzie w stałym paśmie (losowanie zamian do skutku, np. ok. 65% zamian z kulką) | zostawić | Z |

## Śledzenie (`sledzenie`)

**Do zdobycia (REC-01)**
- Położenia i kierunki kulek losowe (`packages/games/src/sledzenie.ts:31-45`), z odstępem tylko na starcie i na końcu. Bliskich mijanek celu z inną kulką (odległość poniżej 3 promieni, próbki co 100 ms):
  **runda 1: 11-138, mediana 70 (rozrzut 30%); runda 10: 43-158 (22%); runda 20: 47-127 (16%), Z**. Mijanie się to najtrudniejszy moment (`ZASADY-GIER.md` :237).
  Przy grze do pierwszej pomyłki jedna runda z dużą liczbą mijanek potrafi zakończyć partię dobrego gracza, więc ten sam gracz ma różne wyniki z powodu losowania.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 20 (W). Ostatnie rundy (niżej) są na granicy śledzenia trzech celów, więc 20 będzie rzadkie (A). `tie` = trafione cele w rundzie z pomyłką (0-2, `:121`): rozstrzyga słabo, ale wynik 0-20 z nim daje ok. 60 poziomów. Ryzyko remisów niskie do średniego.
- `timeoutMove` = 0 rund (`:125`). Zgodne.

**Krzywa trudności (DIFF-01)** (W, `:10-11`, `:53`; 1 pole/s ≈ 10°/s przy polu 5-6 cm z 30-35 cm, A)

| runda | prędkość [pola/s] | ok. [°/s] | droga w 5 s [pola] |
|---|---|---|---|
| 1 | 0,30 | 3 | 1,5 |
| 5 | 0,54 | 5 | 2,7 |
| 10 | 0,84 | 8 | 4,2 |
| 15 | 1,14 | 11 | 5,7 |
| 20 | 1,44 | 14 | 7,2 |

- Granica śledzenia trzech celów to ok. 10-15°/s (A): rundy 15-20 są na granicy, nie poza nią. Rundy 1-5 przechodzi prawie każdy (A). Krzywa zgodna.

**Limit tury (DIFF-02)**
- T = 20 × (0,7 s + 1,5 s pokazu + 5 s ruchu + 3 × 2 s wskazań + 1 s odsłony, `apps/web/src/games/Sledzenie.tsx:16`) + 3 s = 287 s (W z A). L = 300 s (`:70`): **zapas 13 s (4,5%)**.
  Część stała to 164 s. Przy 1 s na wskazanie T = 227 s (zapas 32%). Wolny gracz przekracza limit dopiero w rundzie 21, której nie ma, więc limit nie odbiera wyniku, ale zapas jest poniżej D-07.

**Rekomendacja:** zmienić losowanie rund (pasmo mijanek) i dać limit 360 s.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SL1 | `packages/games/src/sledzenie.ts:31-45` | `ZASADY.md` §3 :100 | średnia | losowanie rundy do skutku, aż liczba mijanek celów mieści się w paśmie mediany danej rundy (np. ±20%); koszt to kilka losowań na rundę na serwerze `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (mijanka = trudność) |
| B-SL2 | `packages/games/src/sledzenie.ts:70`; `KONCEPT.md` :233 | D-07 (zapas ≥ 20%) | średnia | `turnSeconds` 360 s (zapas 25%) `[zbiorcze: limit-tury-bez-zapasu]` | zmienić (tanio) | W, A (czas wskazania) |

## Wieża (`wieza`)

**Do zdobycia (REC-01)**
- Losowa jest tylko strona startu (`packages/games/src/wieza.ts:80`, 7-23 z lewej na 30, Z). Klocek startuje przy krawędzi, a cel jest blisko środka, więc droga do celu jest taka sama z obu stron. Bez wpływu na wynik. Zgodne.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 30 pięter (W). Symulacja (załącznik; gracz celuje w moment wyrównania z szumem czasu o odchyleniu σ, 1000 partii na σ, Z):

| σ dotknięcia | wysokość p5 / mediana / p95 | 30 pięter |
|---|---|---|
| 10 ms | 30 / 30 / 30 | 100% (21,7% z pełną szerokością 0,4) |
| 15 ms | 30 / 30 / 30 | 100% (0,4% z pełną szerokością) |
| 20 ms | 29 / 30 / 30 | 94,5% |
| 30 ms | 19 / 24 / 30 | 11,1% |
| 40 ms | 14 / 19 / 24 | 0,2% |
| 60 ms | 9 / 13 / 18 | 0% |

- Precyzja synchronizacji człowieka to 20-40 ms (A), więc **najlepsi gracze regularnie dojdą do 30**. Wtedy o kolejności decyduje `tie` = szerokość ostatniego klocka (`:98`), liczba rzeczywista, która rzadko remisuje
  (pełna szerokość 0,4 tylko przy σ ok. 10 ms, poza zasięgiem człowieka). Remisów całkowitych więc nie będzie, ale rekordy ściśnięte na 30 mierzą już tylko szerokość. Ryzyko średnie.
- `timeoutMove` = 0 pięter (`:102`). Zgodne.

**Krzywa trudności (DIFF-01)** (W, `:8`, `:11-12`)

| piętro | prędkość [pola/s] | okno idealnego trafienia ±2% pola | przejazd przez pole (szer. 0,4) |
|---|---|---|---|
| 1 | 0,50 | ±40 ms | 1,20 s |
| 10 | 0,77 | ±26 ms | 0,78 s |
| 20 | 1,07 | ±19 ms | 0,56 s |
| 30 | 1,37 | ±15 ms | 0,44 s |

- Pudło przychodzi dopiero, gdy szerokość spadnie poniżej 2% (`:10`), więc okno idealnego trafienia nie kończy gry, tylko zwęża wieżę. Od ok. piętra 20 okno ±19 ms jest poniżej typowej precyzji (A).
  Krzywa sensowna, ale za krótka dla najlepszych (sufit wyżej).
- F2:WZ2 (10 ms ≈ 1,4% pola na górze): dotknięcie mierzone `performance.now` przy `onPointerDown` (`apps/web/src/games/Wieza.tsx:138`), a obraz odświeża się co klatkę (8-17 ms).
  To przesunięcie stałe dla danego telefonu, do którego gracz się dostosowuje. Niska waga, bez osobnego wpisu.

**Limit tury (DIFF-02)**
- Najgorszy przypadek: każdy klocek spada sam po 5 s (`:14`): 30 × 5 s + 1 s (`Wieza.tsx:19`) + 3 s = 154 s. L = 180 s (`:33`): zapas 26 s (17%). Uczciwy gracz zatrzymuje klocek w 1-3 s (T ok. 60-95 s, zapas ok. 90%).
  Najgorszy przypadek to gracz, który nie gra. Zgodne.

**Rekomendacja:** zmienić sufit (więcej pięter albo szybszy przyrost), żeby najlepsi nie kończyli wszyscy na 30.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-WZ1 | `packages/games/src/wieza.ts:4`, `:12`, `:98` | D-05 (sufit osiągalny) | średnia | 50 pięter (limit 180 s dalej wystarcza: 50 × 3 s = 150 s) albo `SPEED_STEP` 0,05; po zmianie przeliczyć symulację `[zbiorcze: sufit-osiagalny]` | zmienić | Z (symulacja), A (σ człowieka) |

## W pamięci (`w-pamieci`)

**Do zdobycia (REC-01)**
- Liczba działań stała (2 → 13, razem 90, `packages/games/src/w-pamieci.ts:6`; Z, 0%). Rodzaj działania losowany osobno (+, −, × po 1/3, `:35-46`):
  **mnożeń w partii 15-35, mediana 24 (13%); w rundach 1-6 2-14 (22%), Z**. Mnożenie dwucyfrowej wartości przez 2 albo 3 w 1,5 s jest trudniejsze niż dodanie jednocyfrowej (A).
  Potwierdza F1:W9a.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 12 rund (W). Ostatnia runda to 13 działań po 1,5 s z jedną bieżącą wartością w pamięci; trzeba szybko liczyć, ale nie zapamiętywać ciągu (A, BASELINE §2). Dla osoby sprawnej w liczeniu **12 jest osiągalne** (A).
  Przy komplecie 12 rund `diff` = 0 (`:82-84`, `ZASADY-GIER.md` :437), więc wszyscy z kompletem remisują całkowicie; rozstrzyga tylko data. To przypadek wysoki z D-09, jeśli partie potwierdzą, że 12 pada.
- F2:A9 / WP3: wynik idzie na serwer dopiero po „Wyniki” po pomyłce (`apps/web/src/games/WPamieci.tsx:169`), a `timeoutMove` = 0 rund (`:89`). Gracz, który odłoży telefon po pomyłce, traci wynik.
  Po pomyłce w rundzie 8 (ok. 130 s) zostaje 170 s na kliknięcie, więc ryzyko dotyczy tylko porzuconej partii. Faza 4 (F2), bez nowego wpisu.

**Krzywa trudności (DIFF-01)** (W, `apps/web/src/games/WPamieci.tsx:16`, `w-pamieci.ts:8`)

| runda | działania | pokaz (z 0,8 s czekania) | razem od startu (z 4 s wpisania i 2 s „Dalej”) |
|---|---|---|---|
| 1 | 2 | 5,3 s | 11,3 s |
| 4 | 5 | 9,8 s | 54,2 s |
| 8 | 9 | 15,8 s | 132,4 s |
| 12 | 13 | 21,8 s | 234,6 s |

- Trudność rośnie liniowo z długością ciągu. Wartości ≤ 99 i mnożenie tylko ×2 / ×3, więc żadna runda nie jest niemożliwa (A). Za łatwe są rundy 1-3. Krzywa zgodna, ale kończy się za wcześnie (sufit wyżej).

**Limit tury (DIFF-02)**
- T = 234,6 s + 3 s = 237,6 s (W z A). L = 300 s (`:57`): zapas 62,4 s (26%). Zgodne.

**Rekomendacja:** zmienić (komplety działań, rundy bez górnej granicy albo rozstrzygnięcie remisu przy komplecie) i sprawdzić w partii, czy 12 pada.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-WP1 (F1:W9a, F1:Z3) | `packages/games/src/w-pamieci.ts:35-46` | `ZASADY.md` §3 :102 | średnia | rodzaj działania z kompletów (w każdej rundzie stały udział: co trzecie działanie mnożenie, pozycje tasowane) `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (rozrzut), A (wpływ) |
| B-WP2 | `packages/games/src/w-pamieci.ts:4`, `:82-84`; `ZASADY-GIER.md` :437 | D-05, D-09 (sufit osiągalny bez rozstrzygnięcia) | **wysoka** (jeśli 12 pada; inaczej średnia) | więcej rund (np. 20, limit przeliczyć: przy 20 rundach T ok. 560 s, więc raczej wolniejszy przyrost długości po 12) albo `tie` przy komplecie = czas odpowiedzi w ostatniej rundzie `[zbiorcze: sufit-bez-tie]` | sprawdzić w partii, potem zmienić | A |

## Podsumowanie grupy

| gra | REC-01 | REC-02/03 | DIFF-01 | DIFF-02 | rekomendacja |
|---|---|---|---|---|---|
| `kubki` | B-KB2 niska | B-KB1 średnia | ✓ | ✓ 37% | sprawdzić w partii |
| `sledzenie` | B-SL1 średnia | ✓ | ✓ (granica od rundy 15) | B-SL2 średnia (4,5%) | zmienić |
| `wieza` | ✓ | B-WZ1 średnia | ✓ (za krótka) | ✓ | zmienić |
| `w-pamieci` | B-WP1 średnia | **B-WP2 wysoka** (A) | ✓ (za krótka) | ✓ 26% | zmienić |

Wpisy: wysokie 1 (zależne od partii), średnie 5, niskie 1.

## Załącznik: symulacja Wieży

`wieza.ts` w scratchpadzie (Node 24, import z `packages/games/src`): dla każdego piętra szuka pierwszej chwili ≥ 300 ms, w której klocek jest najbliżej poprzedniego (próbkowanie co 1 ms),
dodaje szum Gaussa o odchyleniu σ (osobny `createRng(seed + 99999)`), liczy wieżę funkcją `build` z gry. Seedy 1..1000 na σ.

```ts
const S = "/home/figielak/Documents/Projects/kwadrans/packages/games/src/";
const { createRng } = await import(S + "core.ts");
const { wieza, build, left, BASE, LEVELS, MAX_STOP_MS } = await import(S + "wieza.ts");
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
for (const sigma of [10, 20, 30, 40, 60]) {
  const heights: number[] = []; const widths: number[] = [];
  for (let seed = 1; seed <= 1000; seed++) {
    const st = wieza.setup(["p"], createRng(seed)); const noise = createRng(seed + 99999);
    const stops: number[] = []; let prev = BASE;
    for (let level = 0; level < LEVELS; level++) {
      let best = 300, bd = 9;
      for (let t = 300; t <= 3500; t++) { const d = Math.abs(left(st.sides[level], level, prev.width, t) - prev.left); if (d < bd - 1e-9) { bd = d; best = t; } if (bd < 1e-4) break; }
      const t = Math.max(0, Math.min(MAX_STOP_MS, Math.round(best + sigma * gauss(noise))));
      stops.push(t);
      const b = build(st.sides, stops); if (b.height < stops.length) break; prev = b.blocks.at(-1)!;
    }
    const r = build(st.sides, stops); heights.push(r.height); widths.push(r.width);
  }
  // wypisanie p5 / mediany / p95 i udziału 30 pięter
}
```

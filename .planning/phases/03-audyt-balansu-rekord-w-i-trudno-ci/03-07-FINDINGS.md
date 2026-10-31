# 03-07 FINDINGS: mini-gry z odchyłką w rundach

**Data:** 2026-10-24 · **Plan:** 03-07 (fala 2) · **Gry:** `kolo`, `kolor`, `kropki`, `kat`, `rok`, `srodek`, `mapa`, `tort`, `nozyczki`.
Liczby z `03-01-CHECKS.md`, model i progi z `03-02-BASELINE.md`. Pewność: **W** wyliczone, **Z** zmierzone, **A** założenie. Repo poza `.planning/` bez zmian.
Wszystkie gry tej grupy mają wynik ciągły albo prawie ciągły (dziesiąte części %, km, stopnie), więc remisy na szczycie są rzadkie i `tie` nie jest potrzebne (D-05), chyba że niżej napisano inaczej.

## Narysuj koło (`kolo`)

**Do zdobycia (REC-01)**
- Bez losowania wpływającego na wynik (tylko `nonce`, `packages/games/src/kolo.ts:113`). Zgodne.

**Sufit i remisy (REC-02, REC-03)**
- Wynik 0-1000 (dziesiąte części %, `:97`), najlepsza z 10 prób. 1000 wymaga zerowego błędu promienia, więc jest nieosiągalne; dobry rysunek palcem to ok. 950-985 (A).
  Rozdzielczość 0,1% przy najlepszej z 10 prób daje remisy na szczycie rzadko (ryzyko niskie, A). `timeoutMove` = pusta lista, zostaje dotychczasowa najlepsza (`:157`): zgodne z opisem, bo limit kończy próby, nie kasuje wyniku.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 10 × (4 s rysunku + 2 s na odczyt wyniku) + 3 s = 63 s (W z A). L = 120 s (`:110`), odnawiany przy zmianie `waiting` (`:154`): zapas 57 s (90%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Odcień (`kolor`)

**Do zdobycia (REC-01)**
- Cele: barwa 0-359, nasycenie 25-100, jasność 30-100 losowane osobno (`packages/games/src/kolor.ts:89`). Czułość ΔE na krok 5 na trzech suwakach (suma 5 celów) to **47-86, p5-p95 55-74 (rozrzut 9%, Z)**:
  przy tej samej dokładności suwaka partia z „czułymi” kolorami (nasycone, jasne, w okolicy zieleni i błękitu) daje ok. 1,35× większą sumę ΔE (p95 / p5, W z założenia stałej dokładności suwaka).
  Potwierdza F1:W8b. ΔE ucięte do 100 dotyczy tylko grubych pomyłek.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, wynik w dziesiątych ΔE. Remisy niskie. `timeoutMove` = 5 × 100 (`:112`), najgorszy. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 5 × (2 s pokazu, `:6` + 15 s trzech suwaków + 2 s „Dalej” po porównaniu, `apps/web/src/games/Kolor.tsx:96`) + 3 s = 98 s (W z A). L = 180 s (`:80`): zapas 82 s (84%). Zgodne.

**Rekomendacja:** zmienić losowanie celów (pasma albo komplety).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-KR1 (F1:W8b, F1:Z3) | `packages/games/src/kolor.ts:89` | `ZASADY.md` §3 :100 | średnia | cele z kompletu pasm (np. 5 barw po jednej z sześciu sektorów bez powtórzeń, nasycenie i jasność z dwóch pasm na zmianę) albo losowanie do skutku zestawu o czułości w paśmie mediany ±5% `[zbiorcze: trudnosc-z-losowania]` | zmienić | Z (czułość), A (stała dokładność suwaka) |

## Policz kropki (`kropki`)

Wspólny ekran `Szacowanie.tsx` (D-13, opisany raz tutaj; Kąt odsyła): 800 ms czekania (`apps/web/src/games/Szacowanie.tsx:29`), pokaz `showMs`, odsłona do kliknięcia („Dalej” / „Wyniki”), wynik wysyłany po ostatniej odsłonie.

**Do zdobycia (REC-01)**
- Suma 240 kropek (`packages/games/src/kropki.ts:60`, `withSum`; 0%, Z). Gdy błąd szacunku rośnie liniowo z liczbą (Weber, A), stała suma daje stały oczekiwany błąd partii.
  Gdyby rósł jak √n, rozrzut miary wynosi 0,7% (Z). Zgodne z `ZASADY.md` :101. Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, wynik to suma całkowitych błędów (typowo kilkadziesiąt, A). Równe sumy u dwóch graczy są możliwe, ale bez znaczenia dla rankingu (remis rozstrzyga data). Ryzyko niskie.
  `timeoutMove` = same zera, błąd = 240 (`:88`); że to nie najgorszy możliwy wynik, opisuje F1:W8a (faza 4).

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 10 × (0,8 + 1,5 s pokazu + 4 s wpisania + 2 s „Dalej”) + 3 s = 86 s (W z A). L = 120 s (`:32`): zapas 34 s (40%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Kąt (`kat`)

**Do zdobycia (REC-01)**
- Kąty 5-175° osobno (`packages/games/src/kat.ts`, setup `int(rng, MIN, MAX)`): suma 421-1378°, p5-p95 646-1173 (rozrzut 18%, Z); kątów 80-100° 0-5 na partię (Z).
  Suma najgorszych odchyłek (miara, od której zależy `timeoutMove`) różni się o 5,9% (Z). Czy błąd oka zależy od kąta, nie wiadomo: kąt bliski prostemu łatwo rozpoznać, a rozwarte ocenia się gorzej (A).
  Potwierdza F1:W8b jako „do pomiaru”.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, suma całkowitych stopni. Jak w Policz kropki. `timeoutMove` = najgorszy błąd w każdej rundzie. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Jak w Policz kropki (pokaz 1,5 s, `:11`): T = 86 s, L = 120 s (`:31`), zapas 40%. Zgodne.

**Rekomendacja:** sprawdzić w partii, czy błąd zależy od kąta. Jeśli tak, kąty kompletami pasm.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-KAT1 (F1:W8b, F1:Z3) | `packages/games/src/kat.ts` (setup, `int(rng, MIN, MAX)`) | `ZASADY.md` §3 :102 | średnia | kąty z kompletu pasm (po dwa z pięciu pasm 5-38°, 39-72°, 73-106°, 107-140°, 141-175°, tasowane) `[zbiorcze: trudnosc-z-losowania]` | sprawdzić w partii, potem zmienić | Z (rozrzut), A (wpływ) |

## Który rok? (`rok`)

**Do zdobycia (REC-01)**
- 10 z 164 wydarzeń (`packages/games/src/rok.ts:224`). Średni rok partii 1957-2005 (Z), wydarzeń od 1990: 1-9, mediana 5 (rozrzut 29%, Z); suma najgorszych odchyłek 786-1093 (5,5%, Z).
  Działy (historia świata, Polski, wynalazki, popkultura; `:38`, `:71`, `:109`, `:152`) są tylko w komentarzach, losowanie ich nie równoważy.
  Wiedza zależy od gracza (młodsi lepiej znają nowsze wydarzenia, A), więc mieszanka epok i działów zmienia trudność partii dla konkretnej osoby. W grze na wiedzę to w dużej mierze nieuniknione.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, suma lat. Remisy niskie. `timeoutMove` = najgorszy błąd w każdej rundzie (`:255`). Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- Klient sam kończy rundę po 20 s (`:8`), odsłona 2,5 s (`:10`), więc T jest twarde: 10 × 22,5 s + 3 s = 228 s (W). L = 240 s (`:30`): **zapas 12 s (5%)**. Poniżej 20% z D-07,
  ale T nie zależy od gracza (gorzej się nie da), więc zapas pokrywa tylko sieć. Wpis niski: dopisać w `ZASADY-GIER.md`, że zapas jest świadomie mały, albo dać 270 s.

**Rekomendacja:** zostawić; opcjonalnie komplety działów (B-RK1) i limit z większym zapasem (B-RK2).

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-RK1 | `packages/games/src/rok.ts:37-213` (działy w komentarzach), `:224` | `ZASADY.md` §3 :102 | niska | pole `dzial` w `EVENTS` i po 2-3 wydarzenia z każdego działu w partii | sprawdzić w partii | Z (rozrzut epok), A (wpływ) |
| B-RK2 | `packages/games/src/rok.ts:30`; `ZASADY-GIER.md` :181 | D-07 (zapas ≥ 20%) | niska | limit 270 s albo jawny zapis „T twarde, zapas tylko na sieć” `[zbiorcze: limit-tury-bez-zapasu]` | zmienić (tanio) | W |

## Środek (`srodek`)

**Do zdobycia (REC-01)**
- Odcinki 50-90% boku pola, kąt i położenie losowe (`packages/games/src/srodek.ts:66-74`). Błąd liczony w % długości (zamierzone, `ZASADY-GIER.md` :192-193), więc stała niedokładność palca waży więcej na krótkim odcinku:
  suma 1/długość różni się o 5,4% (12,7-17,0, Z). Rozrzut mały, bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, dziesiąte części %. Remisy niskie. `timeoutMove` = 10 × 100% (`:115`), najgorszy. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 10 × (5 s na postawienie i poprawienie punktu + 1 s odsłony, `apps/web/src/games/Srodek.tsx:14`) + 3 s = **63 s** przy wolnym, uczciwym graczu (A). L = 60 s (`:83`): zapas −3 s.
  Przy 3 s na rundę T = 43 s (zapas 40%). Wynik zależy od założenia o czasie celowania, więc F1:SR1 dostaje wagę wysoką z dopiskiem „do potwierdzenia pomiarem”.
  Poprawka jest tania: 90 s (`ZASADY-GIER.md` :27, `KONCEPT.md` §3, `srodek.test.ts:39`).

**Rekomendacja:** zmienić limit na 90 s.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-SR1 (F1:SR1, F1:Z2) | `packages/games/src/srodek.ts:83`; `srodek.test.ts:39`; `ZASADY-GIER.md` :27; `KONCEPT.md` §3 | `ZASADY.md` §3 :106 | **wysoka** (wg modelu, do potwierdzenia pomiarem) | `turnSeconds` 90 s; najpierw test i dokumenty `[zbiorcze: limit-tury-bez-zapasu]` | zmienić | A (czas celowania) |

## Mapa (`mapa`)

**Do zdobycia (REC-01)**
- 10 z 62 miast (`packages/games/src/mapa.ts:73`). Suma odległości miast od środka Polski 1454-2725 km (rozrzut 10,6%, Z); suma najgorszych możliwych odchyłek 3,4% (Z).
  Miasta przy granicy łatwiej umieścić względem konturu, a w środku kraju brak punktu odniesienia (A). Kierunek efektu jest niepewny, a rozrzut umiarkowany. Bez wpisu, do partii.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0 km, suma rund zaokrąglonych do km (`:54`). Remisy niskie. `timeoutMove` = 10 × 1000 km (`:93`), najgorszy. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 10 × (5 s znacznik i poprawka + 2 s „Zatwierdź” + 1,5 s odsłony, `apps/web/src/games/Mapa.tsx:14`) + 3 s = 88 s (W z A). L = 180 s (`:65`): zapas 92 s (105%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Tort (`tort`)

**Do zdobycia (REC-01)**
- Komplet 3, 4, 5, 6, 7 kawałków w każdej partii, tasowany (`packages/games/src/tort.ts:50`). Gotowe cięcie pod losowym kątem obraca tylko cały tort, zadanie się nie zmienia. Zgodne z `ZASADY.md` §3, wzorzec stałego zestawu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, dziesiąte części %. Remisy niskie. `timeoutMove` = 5 × 100% (`:74`), gorszy od najgorszej uczciwej partii. Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji (kolejność liczby kawałków losowa). Bez wpisu.

**Limit tury (DIFF-02)**
- Cięć do postawienia: 2 + 3 + 4 + 5 + 6 = 20. T = 20 × 5 s (postawienie i poprawienie) + 5 × (2 s „Pokrój” + 1,5 s odsłony, `apps/web/src/games/Tort.tsx:14`) + 3 s = **120,5 s** przy wolnym, starannym graczu (A).
  L = 120 s (`:42`): zapas −0,5 s. Przy 3 s na cięcie T = 80,5 s (zapas 49%). Jak w Środku, ocena zależy od założenia; precyzyjne dzielenie na 7 równych kawałków zachęca do długiego poprawiania.

**Rekomendacja:** zmienić limit na 180 s albo zmierzyć czas w partii.

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-TO1 | `packages/games/src/tort.ts:42`; `ZASADY-GIER.md` §Tort; `KONCEPT.md` :234 (Tort w grupie 120 s) | `ZASADY.md` §3 :106 | **wysoka** (wg modelu, do potwierdzenia pomiarem) | `turnSeconds` 180 s (zapas 49% przy 5 s na cięcie); test, dokument, `KONCEPT.md` §3 `[zbiorcze: limit-tury-bez-zapasu]` | zmienić albo zmierzyć w partii | A (czas cięcia) |

## Nożyczki (`nozyczki`)

**Do zdobycia (REC-01)**
- Kształty z czterech fal o losowej amplitudzie i fazie (`packages/games/src/nozyczki.ts:76-86`): suma wypukłości 4,68-4,89 z 5 (0,7%), najmniej wypukły kształt 0,91-0,97 (Z),
  suma pól 0,68-1,03 (6,6%, Z). Kształty są prawie wypukłe i mało się różnią; większy kształt łatwiej przeciąć dokładnie (palec waży mniej, A), ale rozrzut jest mały. Bez wpisu.

**Sufit i remisy (REC-02, REC-03)**
- Sufit 0, dziesiąte części punktu %. Remisy niskie. `timeoutMove` = 5 × 50 (`:128`). Zgodne.

**Krzywa trudności (DIFF-01)**
- Bez progresji. Bez wpisu.

**Limit tury (DIFF-02)**
- T = 5 × (4 s cięcia + 1,5 s odsłony, `apps/web/src/games/Nozyczki.tsx:14`) + 3 s = 30,5 s (W z A). L = 60 s (`:100`): zapas 29,5 s (97%). Zgodne.

**Rekomendacja:** zostawić.

Bez wpisów.

## Podsumowanie grupy

| gra | REC-01 | REC-02/03 | DIFF-01 | DIFF-02 | rekomendacja |
|---|---|---|---|---|---|
| `kolo` | ✓ (bez losowania) | ✓ | bez progresji | ✓ 90% | zostawić |
| `kolor` | B-KR1 średnia | ✓ | bez progresji | ✓ 84% | zmienić |
| `kropki` | ✓ | ✓ (F1:W8a) | bez progresji | ✓ 40% | zostawić |
| `kat` | B-KAT1 średnia | ✓ | bez progresji | ✓ 40% | sprawdzić w partii |
| `rok` | B-RK1 niska | ✓ | bez progresji | B-RK2 niska (5%, T twarde) | zostawić |
| `srodek` | ✓ | ✓ | bez progresji | **B-SR1 wysoka** (A) | zmienić |
| `mapa` | ✓ (do partii) | ✓ | bez progresji | ✓ 105% | zostawić |
| `tort` | ✓ | ✓ | bez progresji | **B-TO1 wysoka** (A) | zmienić / zmierzyć |
| `nozyczki` | ✓ | ✓ | bez progresji | ✓ 97% | zostawić |

Wpisy: wysokie 2 (oba zależne od założenia o czasie decyzji), średnie 2, niskie 2.

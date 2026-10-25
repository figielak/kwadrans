# 03-03 FINDINGS: Kampus Tour (ekonomia, kolejność, długość partii)

**Data:** 2026-10-24 · **Plan:** 03-03 (fala 2) · **Gra:** `kampus-tour`.
Źródła: `packages/games/src/kampus-tour.ts`, `ZASADY-GIER.md` §6 (:646-742), `KONCEPT.md` §2.1 i §9, `.claude/memory/kampus-tour-economy.md`, F1:K2, F1:K11, F2:U2 / KA1.
Symulacja w scratchpadzie (`kampus.ts`, załącznik), 1000 partii na wariant. Pewność: **W** wyliczone, **Z** zmierzone (symulacja), **A** założenie. Repo poza `.planning/` bez zmian.

## Ekonomia (statycznie)

Stałe (W): start 200 zł + 20 zł za każde dalsze miejsce (`:6`, `:8`), kieszonkowe 40 zł (`:10`), opłata za akademik 15 zł (`:11`), 20 rund (`:5`), czynsz P/10, komplet × 2 (`:279-292`),
poziomy 0,4P / P / 2P / 4P (`LEVEL_RENT`, `:33`), budowa P/2 za poziom 1-3 i P za landmark (`buildCost`, `:255-260`), bez kompletu do poziomu 2 (`maxLevel`, `:263-266`), wykupienie 2 × (cena + budynki).

| grupa | pola | P | czynsz 0 / komplet | poziom 1 / 2 / 3 / landmark | koszt budowy do poz. 2 / landmarku | zwrot budowy poz. 2 w rundach (2 / 4 os.) | zwrot landmarku (2 / 4 os.) |
|---|---|---|---|---|---|---|---|
| 0 (pola 1, 2) | 2 | 10 | 1 / 2 | 4 / 10 / 20 / 40 | 10 / 25 | 21,7 / 7,2 | 13,6 / 4,5 |
| 1 (3, 4, 6) | 3 | 15 | 2 / 4 | 6 / 15 / 30 / 60 | 16 / 39 | 23,2 / 7,7 | 14,1 / 4,7 |
| 2 (8, 9, 10) | 3 | 20 | 2 / 4 | 8 / 20 / 40 / 80 | 20 / 50 | 21,7 / 7,2 | 13,6 / 4,5 |
| 3 (12, 14, 15) | 3 | 25 | 3 / 6 | 10 / 25 / 50 / 100 | 26 / 64 | 22,6 / 7,5 | 13,9 / 4,6 |
| 4 (17, 18, 19) | 3 | 30 | 3 / 6 | 12 / 30 / 60 / 120 | 30 / 75 | 21,7 / 7,2 | 13,6 / 4,5 |
| 5 (20, 22, 23) | 3 | 35 | 4 / 8 | 14 / 35 / 70 / 140 | 36 / 89 | 22,4 / 7,5 | 13,8 / 4,6 |
| 6 (24, 25, 26) | 3 | 40 | 4 / 8 | 16 / 40 / 80 / 160 | 40 / 100 | 21,7 / 7,2 | 13,6 / 4,5 |
| 7 (30, 31) | 2 | 50 | 5 / 10 | 20 / 50 / 100 / 200 | 50 / 125 | 21,7 / 7,2 | 13,6 / 4,5 |

Zwrot = koszt budowy / (czynsz × wizyty rywali na rundę); wizyty: ok. 0,04 stanięcia na pole na rzut (pamięć projektu, symulacja częstości) × 1,15 rzutu na rundę (dublety) × (n − 1) rywali (W z A).
Ceny wszystkich pól razem 675 zł.

- **Proporcje są równe między grupami** (zwrot ok. 22 / 7 rund przy poziomie 2 i ok. 14 / 4,5 rundy przy landmarku), bo wszystko liczy się z P. Różnice między grupami biorą się tylko z częstości pól
  (pamięć projektu: pola 6-10 do 1,31, drogie 24-26 i 30 ok. 0,83-0,94), więc grupa 2 (20 zł) jest najlepszą inwestycją, a drogie grupy gorszą. Zgodne z ustaleniami z 2026-10-07.
- **2 graczy:** budowa nie zwraca się czynszem w 20 rundach (21-23 rundy dla poziomu 2). Majątek liczy budynki po koszcie (`valueOf`, `:271`), więc budowa nie obniża majątku na koniec,
  tylko zamraża gotówkę. Przy 2 graczach gra rozstrzyga się więc głównie zakupami i kompletami (A).
- **Przepływ gotówki** (W z A): ok. 8 pól na rundę, okrążenie co ok. 4 rundy, czyli ok. 10 zł kieszonkowego na rundę (ok. 200 zł w partii).
  Karty Dziekanatu mają wartość oczekiwaną ok. +7 zł na kartę (gotówka +30 łącznie, „Pobudka” i „Przerwa w kawiarni” po +40, „Juwenalia!” z pola 21 +40; `CARDS`, `:79-110`), minus „Remont”;
  karta wypada ok. 0,14 razy na rundę, więc to ok. 1 zł na rundę: tło, nie źródło dochodu.
- **Start i kolejność:** +20 zł za miejsce daje czwartemu graczowi 260 zł wobec 200 zł pierwszego (+30%). Wyniki symulacji niżej pokazują, że to więcej, niż wynosi przewaga pierwszego ruchu.
- **Monopol:** trzy pełne grupy. Najtańsza droga to grupy dwupolowe 0 i 7 plus jedna trzypolowa (7 pól) zamiast 9 pól z samych trzypolowych. Pytanie z `KONCEPT.md` §9 rozstrzyga symulacja niżej.
- **Bilet MPK** (`travel`, bez kieszonkowego): pozwala wybrać brakujące pole grupy. Symulacja niżej mierzy, ile kompletów daje.
- **F1:K2 (Juwenalia zostają po wykupieniu)** (`:575-588`, `:297-298`): kupujący przejmuje pole razem z mnożnikiem. Płaci 2 × wartość, a mnożnik i tak należy do pola (każde Juwenalia zastępują poprzednie).
  W symulacji wykup pola z Juwenaliami to 1-17 przypadków na 1000 partii (Z): rzadkie, a reguła jest spójna z tym, że Juwenalia są „na polu”. Wystarczy dopisać zachowanie w `ZASADY-GIER.md`.
- **F1:K11 (budynki powyżej poziomu 2 po utracie kompletu)** (`:263-266`, `:611-626`): po wykupie jednego pola grupy właściciel reszty zostaje z poziomem 3 albo landmarkiem bez kompletu i dalej bierze czynsz 2P / 4P.
  W symulacji 12-139 takich pól na 1000 partii (0,01-0,14 na partię, więcej przy agresywnych botach, Z). Rzadkie; rozsądne zachowanie to zostawić budynki (gracz za nie zapłacił) i dopisać to w zasadach.

## Symulacja

Bot (D-08, opis w załączniku): kupuje, gdy po zakupie zostaje rezerwa R; buduje najwyżej, na ile pozwala rezerwa; wykupuje tylko pole domykające własny komplet (przy rezerwie R/2);
Bilet MPK na brakujące pole grupy, w przeciwnym razie na najdroższe wolne pole, na które go stać; Juwenalia i sprzedaż jak `timeoutMove` (najdroższe pole, najtańsze pole).
Dwie strategie: ostrożna (R = 60 zł) i agresywna (R = 10 zł). Seedy 1..1000 na wariant.

| graczy | strategia | wygrane wg miejsca (remis) | koniec: bankructwo / monopol / limit | runda końca (mediana) | partie z kompletem (runda 1. kompletu) | komplety przez zakup / wykup / MPK | monopole z grupą dwupolową | partie z bankructwem (runda 1.) | rzutów / kroków pionków na partię | K2 / K11 na 1000 partii |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | ostrożna | 45,3 / 54,4% (0,3%) | 1,8 / 0,4 / 97,8% | 20 | 68,7% (r13) | 418 / 200 / 279 | 4 z 4 | 1,8% (r17) | 46 / 319 | 1 / 12 |
| 2 | agresywna | 48,0 / 51,8% (0,2%) | 6,2 / 0,5 / 93,3% | 20 | 64,7% (r13) | 491 / 70 / 334 | 5 z 5 | 6,2% (r16) | 46 / 315 | 1 / 94 |
| 3 | ostrożna | 29,2 / 32,2 / 38,3% (0,3%) | 1,1 / 0,4 / 98,5% | 20 | 75,6% (r12) | 421 / 359 / 357 | 4 z 4 | 8,8% (r17) | 69 / 478 | 10 / 20 |
| 3 | agresywna | 31,2 / 32,2 / 36,2% (0,4%) | 1,9 / 1,0 / 97,1% | 20 | 76,2% (r12) | 538 / 189 / 454 | 10 z 10 | 23,5% (r16) | 68 / 469 | 8 / 123 |
| 4 | ostrożna | 20,7 / 22,4 / 25,8 / 31,0% (0,1%) | 0,6 / 0,2 / 99,2% | 20 | 80,3% (r12) | 403 / 493 / 380 | 2 z 2 | 26,9% (r16) | 91 / 631 | 17 / 32 |
| 4 | agresywna | 22,2 / 23,4 / 25,3 / 28,8% (0,3%) | 0,6 / 0,8 / 98,6% | 20 | 78,9% (r11) | 521 / 354 / 454 | 8 z 8 | 51,5% (r16) | 88 / 614 | 14 / 139 |

Wnioski (sygnał z botów, nie dowód):
- **Kolejność:** przy 3-4 graczach **ostatni wygrywa najczęściej** (4 os.: 31,0% wobec 20,7% pierwszego przy uczciwych 25%; 3 os.: 38,3% wobec 29,2%), przy 2 graczach drugi 52-54%.
  Premia +20 zł za miejsce przeważa przewagę pierwszego ruchu (W: 4. gracz ma +60 zł, czyli 2-4 tanie pola więcej). W poprzedniej wersji zasad (kieszonkowe 20 zł, poziom 1 bez kompletu) dawała 49,8 / 33,6 / 25,4% (pamięć projektu); po zmianach z 2026-10-07 i 10-08 równowaga się przesunęła.
- **Koniec gry:** 93-99% partii kończy limit 20 rund, bankructwo kończy 0,6-6%, monopol 0,2-1% (Z). Pierwsze bankructwo w ok. rundzie 16 (u agresywnych botów przy 4 graczach w połowie partii).
  Obserwacje z 4 partii na żywo (szybkie bankructwa, ok. r10) dotyczyły wersji sprzed zmian; boty tego nie powtarzają.
- **Monopol:** rzadki, ale **każdy z 33 monopoli w symulacji zawierał grupę dwupolową** (Z). Odpowiedź na pytanie z §9: monopol nie jest łatwy, a gdy padnie, to przez grupy dwupolowe. Zmiana „liczyć tylko grupy trzypolowe” prawie wyeliminowałaby monopol (A).
- **Bilet MPK:** daje 30-38% wszystkich kompletów (279-454 na 1000 partii, Z), mimo jazdy bez kieszonkowego. Wykup daje 8-39% (zależnie od rezerwy).
  Komplety są w 65-80% partii, pierwszy ok. r11-13. „MPK zamieniał się w darmowy komplet” (§9) nadal jest prawdą dla gracza, który na to celuje.

## Długość partii

- **Animacje** (W z Z): rzut `ROLL_MS` 0,7 s i krok `STEP_MS` 0,22 s (`apps/web/src/games/KampusTour.tsx:206-207`). Przy 2 graczach 46 rzutów i 319 kroków = 32 + 70 = ok. 1,7 min animacji na partię;
  przy 4 graczach 91 rzutów i 631 kroków = 64 + 139 = ok. 3,4 min.
- **Cała partia** (A: średnio 15-25 s na turę z decyzjami i rozmową): 4 graczy × ok. 23 tury = 91 tur → 23-38 min + 3,4 min animacji = **26-41 min**; 2 graczy 46 tur → 12-19 min.
  Mieści się w „maksymalnie około 45 minut” (`KONCEPT.md` §2.1), o ile średnia tura nie przekracza ok. 27 s przy 4 graczach. Do sprawdzenia w partii zegarem.
- **Limit tury 60 s** (`:471`): Kampus Tour nie ma `turn()`, a czekamy zawsze na jedną osobę, więc **każdy ruch (rzut, kupno, budowa) odnawia 60 s** (`apps/server/src/LobbyRoom.ts:375-376`).
  Najdłuższa decyzja po marszu: 0,7 + 12 × 0,22 = 3,3 s animacji (F2:U2 / KA1) + decyzja do 30 s (budowa kilku poziomów, wykup; A) + 3 s sieci = 36,3 s; zapas 23,7 s (65%). F2:U2 / KA1 zamknięte co do limitu:
  marsz zabiera 3,3 s z 60. Że decyzję widać dopiero po marszu, to sprawa UX (faza 4, F2).

## Rekomendacje

| wpis | plik:linia | źródło reguły | waga | propozycja | rekomendacja | pewność |
|---|---|---|---|---|---|---|
| B-KT1 | `packages/games/src/kampus-tour.ts:8` (`SEAT_BONUS`), `:505`; `ZASADY-GIER.md` :671 | kryterium 5 roadmapy, `KONCEPT.md` §9 | średnia | premia 10 zł za miejsce zamiast 20 (przy 4 graczach +30 zł dla ostatniego); przed zmianą zapisać w partiach wygrane według miejsca `[zbiorcze: przewaga-pierwszego]` | sprawdzić w partii, potem zmienić | Z (boty) |
| B-KT2 | `packages/games/src/kampus-tour.ts:366-370` (monopol); `KONCEPT.md` §9 | `KONCEPT.md` §9 (pytanie o grupy dwupolowe) | niska | monopol rzadki (0,2-1%), ale zawsze z grupą dwupolową: zostawić, a jeśli w partiach padnie więcej niż raz na kilka gier, liczyć grupę dwupolową jako pół albo wymagać trzech grup trzypolowych; dopisać odpowiedź w §9 | zostawić (odpowiedź do §9) | Z |
| B-KT3 | `packages/games/src/kampus-tour.ts:530` (`travel`); `ZASADY-GIER.md` :713-715 | `KONCEPT.md` §9 (MPK jako darmowy komplet) | średnia | MPK daje ok. 1/3 kompletów; opcje: jazda nie może kupić pola domykającego komplet, albo jazda kosztuje (np. 15 zł do banku), albo bilet tylko na pola specjalne i Karty | sprawdzić w partii | Z (boty celują w to wprost) |
| B-KT4 (F1:K2) | `packages/games/src/kampus-tour.ts:575-588`, `:297-298` | `ZASADY-GIER.md` §6 :694-697 | niska | zostawić zachowanie (Juwenalia są na polu, kupujący płaci 2 × wartość), dopisać w §6 Wykupienie; 0,1-1,7% partii | zostawić | Z |
| B-KT5 (F1:K11) | `packages/games/src/kampus-tour.ts:263-266`, `:611-626` | `ZASADY-GIER.md` §6 :689-692 | niska | zostawić budynki po utracie kompletu (zapłacone), dopisać w §6 Budowa; 0,01-0,14 pola na partię | zostawić | Z |
| B-KT6 | `KONCEPT.md` §2.1 (45 min); `apps/web/src/games/KampusTour.tsx:206-207` | `KONCEPT.md` §2.1 | niska | szacunek 26-41 min przy 4 graczach; zmierzyć zegarem w partii, przy przekroczeniu skrócić limit rund do 16-18 albo `STEP_MS` | sprawdzić w partii | A (czas tury) |

**Odpowiedzi na pytania z `KONCEPT.md` §9 (do wpisania przez fazę 4/5):**
- Balans start 200 zł, kieszonkowe 40, czynsze i poziomy: u botów partie dochodzą do 20 rund (93-99%), komplety w 65-80% partii, bankructwa późne. Szybkich bankructw z partii testowych nie widać. Zostawić, sprawdzić w partii.
- Monopol przez grupy dwupolowe: rzadki, ale tylko tą drogą (B-KT2).
- Premia za miejsce: po zmianach z 2026-10-07/08 za wysoka (B-KT1).
- Bilet MPK: dalej źródło ok. 1/3 kompletów (B-KT3).

## Załącznik: symulacja

`kampus.ts` w scratchpadzie (Node 24, import `kampusTour` z `packages/games/src/kampus-tour.ts`), uruchomienie z `packages/games`: `node <scratchpad>/kampus.ts 1000` (ok. 2,5 s).
Każdy ruch przechodzi `validateMove` (błędny ruch przerywa partię z komunikatem; w 6000 partiach żadnego). Komplet przypisany do MPK, gdy gracz w tej turze jechał biletem;
K2 = wykup pola z Juwenaliami; K11 = pole z poziomem ≥ 3 bez kompletu, liczone raz na pole i partię.

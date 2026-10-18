---
name: kampus-tour-economy
description: "Zatwierdzony balans ekonomii Kampus Tour (ceny, czynsze, grupy, gotówka) i wynik symulacji częstości pól"
metadata:
  node_type: memory
  type: project
  originSessionId: 40d3bcfe-b294-4df2-8219-ae8c837198cb
  modified: 2026-10-07T18:54:12.795Z
---

Zatwierdzone 2026-10-07:
- Gotówka startowa 200 zł, kieszonkowe za przejście przez Początek 20 zł. Małe, studenckie sumy, waluta „zł”.
- Pole 28 = „Opłata za akademik” (15 zł). Ksero (7) i Stołówka (29) jak wodociągi: 30 zł, czynsz suma oczek ×2 zł, ×5 przy obu. 8 grup (pory dnia), skrajne po 2 pola: [1,2] 10 zł, [3,4,6] 15, [8,9,10] 20, [12,14,15] 25, [17,18,19] 30, [20,22,23] 35, [24,25,26] 40, [30,31] 50. Łącznie 675 zł. Nazwy pól w GROUP_DEFS w kampus-tour.ts; „Automat z przekąskami” to nazwa robocza (Ratusz wypadł z grupy 8 decyzją użytkownika).
- Wszystko z ceny P: czynsz P/10 (cała grupa ×2), poziomy 0,4P / P / 2P, landmark 4P (od f122f1e, wcześniej 0,5/1,5/3/5); budowa 0,5P za poziom, landmark P; wykupienie 2×(cena+budynki). Zaokrąglanie do pełnych zł.
- Symulacja: kształt planszy nie wpływa na częstość, rozkład równy (0,99-1,01), Kolokwium 1,11; ~0,037 stanięcia na pole na turę gracza. Pola 17-19 zyskają po dodaniu „idź na Kolokwium”.
- Symulacja botów (2026-10-07, kupno + czynsz, bez budowania, 3000 partii): zero bankructw w 2-4 osoby, partie kończą się limitem rund. Gotówka (mediana, boty kupujące wszystko): 2 graczy 110 zł w r5, ~37 zł od r10 (21% graczy < 20 zł); 4 graczy ~105-125 zł. Wniosek: niska gotówka na razie nic nie grozi (czynsze 1-10 zł); do ponownej oceny po dodaniu budowania, wtedy rozważyć wyższe kieszonkowe przy 2 graczach.
- Budowanie (2026-10-07, zasady: tylko na swoim polu po staniu/kupnie, wiele poziomów naraz, landmark z kompletem, sprzedaż z budynkami za pół). Symulacja botów budujących (rezerwa 0/30 zł): 4 graczy: bankructwo w 100% partii, pierwsze ok. rundy 7-8, 35-52% partii kończy się przed limitem; 3 graczy: 92-97%, pierwsze r9-10; 2 graczy: 50-67%, r12-13. Gotówka po r5 niska (mediana 16-50 zł). Ryzyko: przy 4 graczach ktoś odpada już w ~1/3 partii i czeka. Decyzja o ewentualnej zmianie (np. wyższe kieszonkowe, niższy czynsz landmarku) po testach z grupą.
- Kolokwium + Karty Dziekanatu (2026-10-07): częstość odwiedzin (4 graczy): Kolokwium 1,34, grupa 17-19 tylko +3..11%, najwięcej zyskały pola 6-10 (1,14-1,31: karty Pobudka/Kawiarnia i wyjście z Kolokwium), Ksero 1,31 (Nocny autobus), Juwenalia 1,26; drogie grupy 24-26 i 30 ok. 0,83-0,94. Grupa 3 (Mechanik/Elektryk/Chemia, 20 zł) to teraz najlepsza wartość. Tempo bankructw bez zmian. Ewentualna korekta cen do decyzji użytkownika.
- Pełny etap 5 (2026-10-07, boty rezerwa 30 zł, 2000 partii, skrypt sim.ts w scratchpadzie sesji): pełną grupę ktokolwiek ma tylko w 29/37/47% partii (2/3/4 graczy), 2 grupy 1-5%, monopol (3 grupy) 0,1-0,2%, landmarki 0,1-0,2 na partię. Przewaga 1. gracza: 55/41/34% wygranych (fair 50/33/25). Wykupy 0,1-0,8 na partię. Warianty: kieszonkowe 40 lub start 300 tylko lekko podnoszą komplety (do ~48-58%); LEVEL_RENT [0.25,0.75,1.5,3] usuwa prawie wszystkie bankructwa (limit rund 86-96%, 4 graczy 85 tur); +10 zł startu za każde dalsze miejsce zmniejsza przewagę 1. gracza do 53,5/36/29%. Komplety są rzadkie strukturalnie (8 grup na 2-4 graczy), żadna zmiana liczb tego nie naprawia: potrzebny handel albo tańszy wykup.
- WDROŻONE 2026-10-07 (commit f122f1e, decyzja użytkownika „wyrównaj balans”): SEAT_BONUS = 20 zł za każde dalsze miejsce, LEVEL_RENT = [0.4, 1, 2, 4] (koszt budowy bez zmian), wykup zostaje 2× (1,5× nic nie zmieniał). Wynik symulacji: wygrane 1. gracza 49,8/33,6/25,4%, pierwsze bankructwo r14/13/10,9, bankructwem kończy się 29/19/13% partii, tur 43/62/78. Komplety dalej rzadkie (34/45/54%), rozwiązaniem byłby handel.
- WDROŻONE 2026-10-07 (commity 10a5eeb testy + 0086efc, po 4 partiach na żywo z Claude jako graczem, decyzja użytkownika „zmień co uważasz”): ALLOWANCE 40 zł, bez kompletu tylko poziom 1 (maxLevel), jazda MPK bez kieszonkowego. Obserwacje z gry: poziom 3 w 1. turze, czynsze 60-100 zł przy gotówce 0-50 zł, szybkie bankructwa (4 graczy: 2 odpadły ok. r10), MPK = darmowy komplet + kieszonkowe, monopol łatwy przez grupy dwupolowe i pola wracające do banku po bankructwie. Ryzyko: symulacja mówiła, że komplety są rzadkie (34-54% partii), więc poziomy 2+ mogą pojawiać się za rzadko; nie sprawdzone symulacją. 2026-10-08 (commity f108159 + f06d59e, prośba użytkownika): limit bez kompletu podniesiony z poziomu 1 do 2; poziom 3 i landmark nadal tylko z kompletem.
- Otwarte: przy 2 graczach landmark zwraca się po ~19 rundach (mnożnik czynszu albo krótszy limit rund, decyzja po testach).

**Why:** balans ustalony z użytkownikiem, nie wynika z kodu.
**How to apply:** trzymać jako stałe w kampus-tour.ts. Powiązane: [[project-progress]].

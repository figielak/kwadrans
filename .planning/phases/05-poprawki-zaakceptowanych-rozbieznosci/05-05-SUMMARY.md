---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 05
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-05: P4-004 wykonany

Sekwencja zgłasza zaliczone serie przez progress. Serwer waliduje liczby całkowite 0-100, odrzuca cofnięcie
postępu i końcowego wyniku, obcego i ruch po końcu. Duplikat postępu nie zwiększa serii.
Po 300 s oddaje ostatni zapisany postęp, bez dodawania punktu za zaczętą serię. Stały turn run nie odnawia
limitu po progress ani wyniku rywala, również solo. Po refresh klient zaczyna od kolejnej serii;
rewanż daje nowy setup. Wspólny nagłówek pokazuje postęp bez nowej koperty wiadomości.

Wykonano 1/1 części F4-002:simon; łącznie 5/62 pakietów, 10/267 części. FIX-02 otwarte.

## TDD i dokumenty

ZASADY-GIER oraz KONCEPT zmieniono przed kodem. Przed kodem 10 FAIL / 13 PASS w simon.test.ts
oraz 3 FAIL / 18 PASS w LobbyRoom.test.ts. Logi /tmp/kwadrans-05-05-{red,server-red}.log.
Commit f3e7958, Sekwencja: testy zachowania zaliczonej serii po limicie, na podstawie stałej zgody użytkownika.
Testów po commicie nie zmieniano. Brak nowego tie, id, zależności, zmian historii i schematu SQLite.

## Odbiór

- pnpm typecheck && pnpm test: PASS, 1909 testów gier + 36 serwera = 1945.
- Build web: PASS z dotychczasowym ostrzeżeniem dużego pakietu JS.
- Testy pokoju 1/2/6: po 290 s progress=7; pozostało 10 s, po kolejnych 10 s koniec z wynikiem 7
  i record=7. Zegar Vitest kontroluje prawdziwe handlery pokoju, bez czekania pięciu minut.
- UI, rzeczywisty Simon i moduły zasad, zegar Playwright: ukończenie pierwszej serii wysyła tylko progress=1;
  timeout w połowie następnej daje result=1 i ekran 1.
- UI: progress=7, częściowa następna seria, ponowny montaż jak po odświeżeniu i pomyłka dają result=7.
  Stary detail bez progress nadal pokazuje 7. Stan z zaliczonymi 100 po Start oddaje dokładnie jeden result=100.
- /dev 6 przez prawdziwy WebSocket i UI, przyspieszony wyłącznie zegar klienta:
  wszyscy zaliczają serię 1, serwer zapisuje sześć progress=1. Pierwszy gracz odświeża i wznawia serię 2.
  Pomyłka w następnej serii u każdego daje result=1, remis bez zwycięzcy.
  Rewanż wszystkich daje progress={}, results={} i inną sekwencję.
- Turniej: moduły i Game na kontrolowanym stanie po timeoutach 7/6 dają miejsca 1/2 i punkty 1/0.
  UI pokazuje wyniki 7 i 6, tabelę 1 pkt/0 pkt i następną grę Zakupy. Record=7, bez tie.
- Szerokość dokumentu 360 px na widoku 360×640. To kontrola zmienionych stanów, bez fizycznego telefonu.
- Stara historia pozostaje bez przeliczania; nie odtwarzamy serii utraconych przez dawne timeouty.

Baza odbioru w pamięci; bez produkcji i push. Implementacja pozostaje lokalna, commity obejmują testy.

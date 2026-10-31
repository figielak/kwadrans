---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 04
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-04: P4-003 wykonany

Zakupy mają 80 s limitu serwera i automatyczne oddanie aktualnych zaznaczeń po 50 s wyboru.
Gotowe kończy pomiar przy pointerdown; klawiatura przez click detail=0. Wspólny ref blokuje drugi wynik,
ref zaznaczeń zachowuje ostatnie zmiany przed timerem. Lista nadal 10 przedmiotów, półka 20.
Wykonano 2/2 części (F4-002:zakupy, F4-059:całość). Faza 5: 4/62 pakietów, 9/267 części; FIX-02 otwarte.

## TDD

Użytkownik „Zapisz ten i kolejne commity testów” upoważnił do obowiązkowych osobnych commitów testów
w dalszych zatwierdzonych pakietach. Zapisano 7045659, Zakupy: testy pełnego czasu wybierania.
Test odbioru msLeft zakładał, że snapshot zmienia się co sekundę; pokój rozsyła go dopiero przy wiadomości.
W 76455c9 poprawiono odświeżenie widoku przez neutralne begin po intro, bez zmiany oczekiwanego czasu.
Ponownie potwierdzono 4 FAIL na starym limicie 60 s, dopiero potem przywrócono implementację 80 s.
Nie zmieniono oczekiwań testów pod kod. RED i dokumentacja przed kodem: 05-04-TDD.md.

## Weryfikacja

- pnpm typecheck && pnpm test: PASS; 1893 testy gier + 33 serwera = 1926.
- Build web: PASS, dotychczasowe ostrzeżenie o pakiecie JS >500 kB.
- Playwright, prawdziwy Zakupy, kontrolowany zegar klienta: po 49 999 ms brak wyniku;
  po ostatnim zaznaczeniu i odznaczeniu oraz kolejnej 1 ms dokładnie jeden result, picked=[1], ms=50000.
- Pointerdown + click detail=0 + zwykły click w tej samej klatce: jeden result, ms=2000;
  po 3 s przytrzymania nadal jeden. Enter, spacja i sam click klawiaturowy również po jednym wyniku z ms=2000.
- /dev 6 osób: rzeczywiste handlery/WebSocket i UI, zegar klienta przyspieszony przez Playwright;
  każdy gracz zachował picked=[0,1], ms=50000, a rekordy API mają tie=50000 i played=1.
- /dev 2 osoby: odświeżenie podczas pokazu i półki. Zgodnie z dotychczasową zasadą lokalna partia zaczyna się od nowa;
  potem autozapis zachowuje nowe picked=[2] obu graczy, po jednym wyniku z ms=50000.
- Prawdziwy pokój solo przez createRoom(nick,zakupy): autozapis, ekran Jeszcze raz, rekord API z tie=50000/played=1.
- 360×640: szerokość dokumentu 360 px. Bez pełnego ponownego audytu innych rozbieżności UI.
- Kontrolowany zegar klienta nie dowodzi czasu ludzkiej gry. Limit serwera 80 s i rekordy przy 1/2/6
  osobach sprawdzają testy prawdziwych handlerów z zegarem serwera kontrolowanym przez Vitest.
- places i tie sprawdzone w testach gry; brak zmian turniejowego przelicznika miejsc.

ZASADY-GIER i KONCEPT opisują model T=63 s i zachowanie starej historii. Bez nowych zależności,
zmiany id, resetu rekordów, schematu SQLite, push i produkcji. Baza odbioru wyłącznie w pamięci.
Implementacja pozostaje lokalna. Następny P4-004: Sekwencja.

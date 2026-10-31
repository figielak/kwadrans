---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 33
status: complete
completed: 2026-10-31
packages: [P4-033]
---

# 05-33 SUMMARY: P4-033

- F4-016: Stoper zapisuje opcjonalny pomiar `stopped` (pełne ms) w mapie `stops`; waliduje zakres 0..2×target i zgodność z dotychczasową odchyłką. Stary ruch bez pomiaru i timeout pozostają kompatybilne. Rytm zachowuje surowe `taps` w mapie per gracz, bez zmiany sposobu liczenia wyniku.
- Kafle Stoper.tsx i Rytm.tsx czytają wyłącznie stan serwera, także po ponownym montażu i przy `me=""` z jednym graczem. Obserwator pokoju wieloosobowego nie dostaje cudzej karty osobistej. Stoper przerywa licznik, gdy serwer zapisał już wynik.
- Starszy Stoper bez `stops`: kafel bezwzględnej odchyłki, bez wymyślonego czasu i znaku. Starszy Rytm bez `taps` lub timeout bez stuknięć: tabela z odchyłką, bez fikcyjnego BPM. Nie zmieniono dawnych rekordów, punktacji, id ani losowania. Opis danych w ZASADY-GIER uzupełniony przed kodem.
- F4-021: osiem gier (Schulte, Kropki, Kąt, Rok, Wieża, Balon, Sudoku, Koło) kończy test legalnymi ruchami z niepustymi mapami. Dla obu graczy `soloState → JSON → playerView("")` zachowuje wszystkie mapy gracza, wynik i dane wyzwania, usuwa cudze id i nie mutuje oryginału.

TDD: **6bb6a85**, testy i opis danych przed implementacją. RED: 12 testów danych i 5 renderu odtwarzały brak zapisu pomiarów / znikające kafle; 8 testów `soloState` od razu PASS. Logi `/tmp/kwadrans-33-red-games.log`, `/tmp/kwadrans-33-red-web.log`. Początkowe dodatkowe oczekiwanie mapy `stops` w Wieży poprawiono przed commitem testów: F4-021 dotyczy tam `progress`, a mapa surowych czasów nie należy do obecnego kontraktu Wieży.

Dodano **20 testów gier i 8 testów renderu React**, bez nowych zależności. `web` ma teraz skrypt testów Vitest używający istniejącej zależności workspace; testy renderują prawdziwe komponenty przez react-dom/server, bez nowego środowiska DOM.

Weryfikacja końcowa:

- `pnpm typecheck && pnpm test && pnpm --filter web build` PASS: **2268 gier + 45 serwera + 8 web**, 1 istniejący SKIP F4-046 → P4-057. Build ma zastane ostrzeżenie JS >500 kB.
- Chrome headless, 360×640, prawdziwe komponenty MiniGame/Records i stany uzyskane przez setup, schemat, validateMove i applyMove: wszystkie 8 gier F4-021 oraz Stoper/Rytm renderują rekordową partię `me=""`, bez NaN/Infinity i błędów JS. Stoper pokazuje 10,88 i −0,12 s, Rytm 100 BPM oraz cel; pełny reload odtwarza identyczną treść.
- Records: otwarcie kafla Stopera ze starym formatem detail pokazuje bezwzględną odchyłkę; brak detail Rytmu pokazuje dotychczasowy komunikat o rekordzie sprzed zapisu partii. To kontrolowane odpowiedzi API w lokalnym odbiorze. Lokalna baza czytana wyłącznie do odczytu nie ma historycznych wpisów Stopera/Rytmu; nie podszywano się pod weryfikację istniejącego produkcyjnego rekordu.
- Odbiór nie uruchamiał WebSocketów ani urządzenia fizycznego; sprawdza rzeczywiste komponenty, stan i ścieżkę Records w przeglądarce. Skrypt i wyniki: `/tmp/kwadrans-33-ui.mjs`, `/tmp/kwadrans-33-ui.json`; zrzuty `/tmp/kwadrans-33-stoper.png`, `/tmp/kwadrans-33-rytm.png`, obejrzane wizualnie.

Odebrano **2/2 części**; 32/62 pakietów, 151/267 zamkniętych części. FIX-02 i wcześniejsze U02 pozostają otwarte. Następny P4-037 jako 05-34. Commity po polsku, bez push.

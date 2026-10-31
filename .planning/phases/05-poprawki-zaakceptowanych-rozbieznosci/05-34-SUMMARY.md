---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 34
status: complete
completed: 2026-10-31
packages: [P4-037]
---

# 05-34 SUMMARY: P4-037

F4-093:kontrolki-platformy, **1/1 części**. Zmiany wyłącznie w index.css, Lobby.tsx, DESIGN §6 oraz planowaniu.

- `.swatch-range`: cały natywny input ma wysokość 48 px; nie ograniczono poprawki do samego uchwytu. Istniejące gradienty, thumb, tokeny focusu i obsługa gestów/klawiatury pozostają.
- Wiersze graczy mają min. 48 px również we współdzielonym `Players` na ekranie Setup.
- Cele koloru: 48×48 px, bez kurczenia we flex. Widoczna kropka pozostaje 28 px. Radiogroup zajmuje po 4 px bocznego paddingu kafla: środki kropek się nie przesuwają, sześć celów mieści się w jednym rzędzie, bez nakładania i poziomego scrolla.
- „Wyjdź” w Lobby ma min. 48 px wysokości/szerokości. Ujemny margines pozostaje tylko u góry i z prawej; dolna krawędź nie zachodzi na wiersz kodu.
- Nie dodano animacji, zależności ani nowych wyjątków od §4-5 ZASADY. Fakty pomiarowe dopisano w DESIGN §6.

## Pomiar przed i po

Chrome headless z emulacją dotyku, 360×640, rzeczywiste komponenty Lobby/Setup/Game i rzeczywisty CSS Vite. Lobby i Setup po 6 osób (także długie nicki), aktywne Odcień/Rok w pełnym komponencie Game z nagłówkiem 6 graczy.

| Kontrolka | Przed | Po |
|---|---:|---:|
| Wyjdź w Lobby | 75,33×36 px | 75,33×48 px |
| Każdy z 6 kolorów | 40×40 px | 48×48 px |
| Wiersz gracza Lobby/Setup | 286×44 px | 286×48 px |
| Każdy z 3 suwaków Odcienia | 328×36 px | 328×48 px |
| Suwak Roku | 182×36 px | 182×48 px |

`document.scrollWidth = innerWidth = 360` we wszystkich badanych ekranach. Środki kolorów zachowane, najbliższe cele rozdzielone odstępem około 1,2 px. Przewijanie pionowe list przed grą pozostaje dopuszczone przez ZASADY §4.

Sprawdzenia interakcji PASS:

- Hit testing przy czterech krawędziach okrągłego celu koloru; rzeczywiste tapnięcie poza widoczną kropką wysyła `pickColor`.
- Wybór wolnego koloru przy 2 osobach, zajęte kolory przy 6 pozostają nieaktywne; dotyk wiersza w Setup wysyła `toggleSeat`, a wyjścia wywołuje `onLeave`.
- Dotyk lewego/prawego brzegu suwaka ustawia min/max; dotyk górnej i dolnej krawędzi zmienia wartość. Home/ArrowRight działają, po klawiaturze focus ma obrys 2 px.
- Odcień: koniec przycisku „Zatwierdź kolor” na **616 px**; Rok: koniec „Zatwierdź” na **502 px**. Dokument obu aktywnych gier nadal ma **640 px**, tak jak przed zmianą.
- Brak błędów JS. Zrzuty Lobby, Setup, Odcienia i Roku zapisane; Lobby i oba ekrany suwaków obejrzane wizualnie.

Przed zmianą zapisano pomiary dowodzące czterech rodzajów zbyt małych celów. Nie dodawano testów powtarzających nazwy klas CSS ani zależności do nowego frameworka E2E; dla tej zmiany rozmiaru dowodem są pomiary i interakcje w przeglądarce. Skrypt `/tmp/kwadrans-34-ui.mjs`, dane `/tmp/kwadrans-34-before.json` i `/tmp/kwadrans-34-after.json`, zrzuty `/tmp/kwadrans-34-after-*.png`. Przy przygotowywaniu skryptu poprawiono odpowiedź API wyzwania dnia, przewijanie celu ponad dolny pasek oraz punkty testowe: krawędzie przycisków, nie obcięte przez border-radius narożniki. To poprawki testowego odbioru, bez dodatkowych zmian produkcyjnych.

Odbiór jest emulacją Chromium, nie pomiarem fizycznego telefonu. Nie uruchamiano prawdziwych klientów WebSocket: intencje kontrolek odbiera kontrolowany callback. W tym pakiecie nie zmieniano handlerów ani reguł serwera.

`pnpm typecheck && pnpm test && pnpm --filter web build` PASS: **2268 gier + 45 serwera + 8 web**, 1 wcześniejszy SKIP F4-046 → P4-057. Log `/tmp/kwadrans-34-checks.log`. Build ma zastane ostrzeżenie JS >500 kB. `git diff --check` PASS.

Planowanie zaktualizowane: **33/62 pakietów, 152/267 zamkniętych części**. F4-046 częściowo otwarte, P4-014/015 nadal oczekują U02, FIX-02 otwarte. Następny P4-038 poza bieżącym zleceniem. Commit po polsku, bez push.

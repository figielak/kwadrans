---
phase: 05-poprawki-zaakceptowanych-rozbieznosci
plan: 14
status: complete
completed: 2026-10-29
requirements: [FIX-02]
---

# 05-14: P4-018 wykonany

Wspólny stan pokazu kości i marszu zastępuje niezależne useRolling/useWalk. Nowa wiadomość
anuluje poprzedni timer i zaczyna od ostatniej pozycji serwera; dotknięcie nakładki kończy pokaz.
Nakładka odbiera cały pierwszy click, więc nie uruchamia nowo odsłoniętego przycisku pod palcem.
Limit tury pozostaje w niezmienionym Countdown. Szczegóły starego pola zamykają się po nowym widoku.

Rozpoznanie rzutu używa istniejących phase/positions/dice/stats.doubles/kolokwium/events.
Nakładanie końca poprzedniego i początku nowego logu pozwala wykryć nowe travel i wykluczyć
MPK, choć zasady generują wtedy oczka do czynszu. Karta nie wychodzi z fazy roll, więc nie turlamy.
Identyczne oczka wykrywa zmiana pozycji/licznika dubletów; rzut bez ruchu w Kolokwium także
opuszczenie listy kolokwium. Nie dodano pola, zdarzenia ani nowej informacji w playerView.

Odebrano F4-057:kampus-tour, F4-131:całość i F4-132:całość (3/3).
Łącznie 13/62 pakietów i 25/267 części. FIX-02 nadal otwarte. Następny P4-023.
P4-014/015 czekają na odłożony przez użytkownika U02; nie prosimy o ten sam pomiar ponownie.

## Dowody

Prawdziwy Game/KampusTour i niezmienione setup/validateMove/applyMove/playerView, kontrolowany RNG.
- RED przed: po rzucie 6+6 jest turlanie, brak Kup i brak możliwości pominięcia.
- Po: dotyk po 100 ms turlania lub 950 ms marszu odsłania Kup, zero wysłanych ruchów.
  Następne dotknięcie Kup wysyła dokładnie jeden ruch. Naturalny pokaz też kończy się decyzją.
- Test współrzędnych faktycznego przycisku Kup w obu oknach 640×360 i 360×640:
  pierwsze stuknięcie podczas animacji daje 0 ruchów, drugie w tym samym miejscu 1 ruch.
- Kolejny dublet 6+6 po pominięciu zakupu ponownie turla kości mimo identycznych oczek.
  Trzeci dublet także turla i kończy na polu 11. Zasady dubletów bez zmian.
- MPK z pola 27 na 1: zero turlania/zero nakładki, decyzja Kup od razu, mimo nowych oczek.
- Karta Idź na Rynek: po odkryciu pionek na 31, zero turlania i marszu.
- Kolokwium: nieudany rzut 1+2, identyczny z poprzednimi oczkami, bez zmiany pozycji,
  nadal pokazuje prawdziwe turlanie i można je pominąć.
- Nowy stan buy podczas starego pokazu: stare timery nie wracają, aktualna budowa dostępna.
- Ponowny montaż ze stanem po rzucie: zero nakładki i turlania, aktualna decyzja od razu.
- Reduced motion emulowane przed załadowaniem modułu: zero turlania i nakładki, Kup dostępne.
- Zegar przed pominięciem/po/później: 60/59/58 s; nie wraca do początku i nadal maleje.

Pierwszy test naturalnego końca miał zbyt ścisłe oczekiwanie 3500 ms zamiast czekania na stan UI;
React i harmonogram przeglądarki dodają narzut do nominalnych 700+12×220 ms. Odbiór powtórzono
z oczekiwaniem na zniknięcie nakładki. Druga korekta automatyzacji rozdzieliła wiadomości
skip i nowy roll między renderami: dwa root.render w tym samym zadaniu JS pomijały stan roll
w fixture. W prawdziwym UI nowy rzut wybiera się po odebraniu i pokazaniu fazy roll.

## Prawdziwa sieć

Lokalny serwer DB_PATH=:memory:, /dev?n=2, ramki innerWidth=640/innerHeight=360.
Wybór gry i postaci przyciskami, rzeczywisty rzut przez WebSocket, pojawia się nakładka.
Po jej dotknięciu liczba wysłanych wiadomości pozostaje 1 (sam roll), JSON stanu serwera identyczny.
Odświeżenie ramki drugiego gracza podczas pokazu wznawia sesję w aktualnym stanie bez nakładki.
Bez zmian bazy trwałej ani produkcji.

## Weryfikacja

pnpm typecheck && pnpm test PASS: 1911 testów gier + 36 serwera = 1947.
pnpm --filter web build PASS; istniejące ostrzeżenie pakietu JS >500 kB. git diff --check PASS.
Logi /tmp/kwadrans-05-14-tests.log i /tmp/kwadrans-05-14-build.log.
ZASADY §5 i DESIGN §6 opisują pomijanie. Bez nowych zależności, zasad ekonomii, id ani kontraktu zdarzeń.
Zmiana klienta, bez potrzeby nowego testu zasad lub commitu TDD. Commit zgodnie ze stałą zgodą, bez push.

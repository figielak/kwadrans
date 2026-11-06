# Blef na kościach: plan v1

2026-11-05. Propozycja do akceptacji, bez implementacji. Źródła: KONCEPT.md,
ZASADY.md i DESIGN.md. Własny prosty wariant gry w deklarowanie wyników ukrytych kości.
Po akceptacji ten opis należy przenieść do ZASADY-GIER.md i skrót do KONCEPT.md.

## 1. Tożsamość i cel

- Id `blef-na-kosciach`, krótka nazwa w lobby „Blef”, pełny opis „Blef na kościach”.
- Gra główna, 2–6 osób, tury po kolei, tajne kości. Jeden wariant, bez solo i turnieju mini-gier.
- Każdy zaczyna z 3 kośćmi. Licytujecie, ile kości danego rodzaju jest łącznie na stole.
  Następna osoba podbija albo mówi „Sprawdzam”. Przegrany sprawdzenia traci jedną kość.
- Wygrywa ostatni gracz z kośćmi. Cel użytkowy: krótka gra w blef, bez liczenia punktów.
  Trzy zamiast pięciu kości skracają eliminację, ale długość zależy od liczby podbić.
  Nie obiecujemy zamknięcia partii w 15 minut przed pomiarami z ludźmi.

## 2. Runda

Stałe: `START_DICE = 3`, `SIDES = 6`, `TURN_SECONDS = 60`, `SUMMARY_SECONDS = 15`.

1. Serwer rzuca niezależnie wszystkimi pozostałymi kośćmi aktywnych graczy, używając rng.
   Każdy widzi własne oczka, cudze liczby kości i łączną liczbę kości `D`.
2. W pierwszej rundzie zaczyna `players[0]`. Pierwsza deklaracja to dowolna para
   `(liczba 1..D, oczka 1..6)`, np. „cztery piątki”, czyli **co najmniej** cztery piątki.
3. Następny aktywny gracz zgodnie z kolejnością `players` podbija lub sprawdza.
   Podbicie: większa liczba kości przy dowolnych oczkach albo ta sama liczba i większe oczka.
   Po „cztery piątki” legalne jest „cztery szóstki” i „pięć jedynek”, a „cztery czwórki” nie.
4. Jedynki są zwykłymi wynikami. Bez jokerów, deklaracji „dokładnie”, specjalnej ostatniej kości
   i zamiany kości. Nie można pasować ani sprawdzić, zanim padnie pierwsza deklaracja.
5. „Sprawdzam” odkrywa wszystkie kości. Jeśli rzeczywista liczba pasujących kości jest
   co najmniej tak duża jak deklaracja, kość traci sprawdzający; inaczej ostatni licytujący.
   Równość potwierdza deklarację. W jednej rundzie zawsze traci dokładnie jedna osoba i jedną kość.
6. Przy utracie ostatniej kości gracz odpada. Może oglądać i uczestniczyć w rewanżu,
   ale nie wykonuje ruchów, nie zatrzymuje odsłony i nie widzi cudzych tajnych kości.
7. W odsłonie widać deklarację, wszystkie rzuty, rzeczywistą liczbę i kto stracił kość.
   Żyjący gracze dają „Dalej”; po wszystkich albo timeoutach rusza następna runda.
8. Zaczyna przegrany poprzedniej rundy, jeśli żyje; inaczej następny żyjący za nim w kolejności.
   Wszystkie pozostałe kości są rzucane od nowa. Nie przenosimy wyników między rundami.

Koniec następuje natychmiast po pozostaniu jednej osoby; ostatnia odsłona jest częścią
ekranu końcowego, bez wymuszonego „Dalej”. Ranking: zwycięzca, potem odpadający od ostatniego
do pierwszego. Remis nie jest osiągalny według tych zasad, bo odpada najwyżej jedna osoba naraz.
Nie stosować remisu według liczby kości do graczy już wyeliminowanych. Wygrana zapisuje się
w obecnych statystykach pod id gry; brak rekordów punktowych.

## 3. Limity i przypadki brzegowe

- Fazy `bid`, `summary`, `over`. W `bid` czekamy na jedną aktywną osobę; w `summary`
  na wszystkich żyjących, którzy nie dali „Dalej”; po końcu na nikogo.
- Timeout bez deklaracji: ruch `bid { quantity: 1, face: 1 }`. Z deklaracją: `challenge`.
  To legalna decyzja, nie automatyczna utrata kości. Odsłona: `next`.
- `turn().key` zawiera nonce, rundę, fazę i licznik decyzji. Każda nowa tura ma 60 s;
  odrzucony ruch i ponowne przesłanie tego samego ruchu nie odnawiają czasu.
- Maksymalna deklaracja `D szóstek` wymusza sprawdzenie następnej osoby.
- Przy N graczach jest najwyżej `3N - 1` rozstrzygnięć (17 przy 6 osobach).
  W rundzie najwyżej `6D` deklaracji i jedno sprawdzenie. Partia jest skończona także
  przy samych timeoutach; nie ma osobnego limitu czasu całej partii.
- Rozłączenie: zwykłe timeouty i reconnect platformy. Trwałe wyjście dowolnego gracza
  z miejscem, również wyeliminowanego, przerywa partię według KONCEPT.md. Nie przebudowujemy
  reguły wyjść przy tej grze; eliminacja z kości sama nie usuwa miejsca z pokoju.

## 4. Stan, ruchy, prywatność

Stan JSON: gracze, nonce, runda, faza, pozostałe liczby kości i prywatne rzuty,
bieżący gracz, deklaracja z autorem, licznik decyzji, kolejność eliminacji,
gotowość po odsłonie i publiczna historia rozstrzygnięć.
Ruchy `bid { quantity, face }`, `challenge`, `next`; każdy zawiera nonce i rundę,
a ruch tury również oczekiwany licznik decyzji, żeby opóźniona wiadomość nie wykonała
się przy następnym obiegu tej samej osoby. Zod w packages/games; semantyka w validateMove.

View budowany jawnie: w licytacji tylko własne kości, publiczne liczności, deklaracja,
tura i zakończone rundy. Wyeliminowany i obserwator nie dostają żadnego prywatnego rzutu.
W odsłonie wszystkie kości zakończonej rundy są jawne, także po przejściu do nowej rundy
w historii. Nigdy nie wysyłamy przyszłych rzutów ani stanu rng. Osobne State i View.
Rewanż resetuje lokalny wybór przez nonce, reload zachowuje rzut i termin serwera.

## 5. Ekran

Pion, wspólna skorupa Game. U góry ostatnia deklaracja i jej autor, niżej własne 1–3 kości,
łączna liczba kości, publiczne liczby rywali. Oczka wybierane sześcioma przyciskami 48 px,
liczba przez minus/plus 48 px i odczyt mono. Domyślnie najmniejsze legalne podbicie,
ale ruch dopiero po „Podbij”; obok „Sprawdzam”. Przed pierwszą deklaracją „Zalicytuj”.
Nielegalne kombinacje wyłączone z opisem, własny wybór ma kolor gracza i aria-pressed.

Odsłona pokazuje rzuty grupowane według gracza i tekst wyniku; historia może przewijać się
pionowo. Po eliminacji podpis „Nie masz już kości. Oglądasz do końca partii”.
Bez animacji udających ponowny rzut po reloadzie. Oczka i werdykt dostępne od razu;
można użyć istniejącego stone-pop 0,35 s dla nowego elementu, reduced motion jak w projekcie.
Nowa tura przez VIBRATE.turn, utrata kości od rywala przez useHarm raz na zdarzenie.
Nie dublować wibracji ani nie blokować decyzji animacją. Ekran sprawdzić przy 360×640,
6 osobach i 18 kościach na odsłonie; dotyk min. 48 px, brak poziomego scrolla.

## 6. Implementacja po akceptacji

1. ZASADY-GIER.md (pełna sekcja i tabela), KONCEPT.md (opis, lista gier).
2. `packages/games/src/blef-na-kosciach.test.ts` przed kodem, osobny commit TDD tylko na
   prośbę użytkownika, jak wymaga AGENTS.md; akceptacja planu nie oznacza zgody na commit/push.
3. `blef-na-kosciach.ts`, lokalne funkcje porządku deklaracji i rozstrzygnięcia;
   rng i wspólne narzędzia core, niemutowalne obiekty, brak nowych zależności.
4. `apps/web/src/games/Blef.tsx`; rejestr GAMES, View/Move/stałe BLEF_, ikona i opis Lobby,
   render z nonce w Game. OWN_RANKING dla własnego końca. Nie oznaczać całej gry jako
   SIMULTANEOUS, bo zasadnicza rozgrywka to pojedyncza tura; obsłużyć wspólne „Dalej”.
5. Klucz wibracji uwzględniający nową decyzję/rundę; test kontraktu i integracja serwera.
   Bez zmian bazy, transportu i istniejącej reguły walkoweru.

## 7. Testy i odbiór

Pełna lista obowiązkowa z ZASADY §2: definicja, setup, seedy, każdy niedozwolony ruch,
granice i schema, wszystkie fazy timeoutu, brak mutacji i serializacja JSON.
Dodatkowo: wszystkie pary kolejnych deklaracji; granice 1/6 i 1/D; brak jokerów;
równość przy sprawdzeniu; kość odejmowana raz; każda osoba może wygrać/przegrać;
start po przegranej i eliminacji; omijanie odpadniętych; pełny ranking eliminacji;
widoki aktywnego, odpadniętego, obcego i obserwatora w każdej fazie; stare ruchy i nonce.
Testy samych timeoutów dla 2 i 6 osób muszą dojść do pojedynczego zwycięzcy.

Odbiór /dev: pełne partie 2 i 6 plus obserwator, eliminacja z dalszym oglądaniem,
reload/timeout każdej fazy, reconnect, wyjście, rewanż, lobby i zapis wygranej.
WebSocket bez cudzych rzutów. 360×640, dotyk na telefonie i reduced motion.
Bramki implementacji: `pnpm typecheck && pnpm test`, `pnpm --filter web build`.
Próba z ludźmi: długość czekania po eliminacji i zrozumiałość podbić. To odbiór balansu,
nie powód do automatycznego dodawania trybu punktowego.

Do akceptacji: 3 kości, brak jokerów, eliminacja, limit 60 s, ranking kolejności odpadania.
Zatrzymanie po kompletnym podpięciu, dokumentacji i odbiorze; żadnej implementacji w tym zadaniu.

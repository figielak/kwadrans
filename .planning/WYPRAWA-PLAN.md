# Wyprawa: plan v1

2026-11-05. Propozycja do akceptacji, bez implementacji. Źródła: KONCEPT.md,
ZASADY.md i DESIGN.md; wzorzec faz równoczesnych: Państwa-miasta.
Własny wariant wspólnej wyprawy po skarby, z tajną decyzją powrotu.

## 1. Tożsamość i cel

Id `wyprawa`, nazwa „Wyprawa”, 2–6 osób, gra główna, 5 wypraw w partii.
Wszyscy idą tym samym szlakiem, ale każdy sam wybiera, kiedy zabezpieczyć zdobycz.
Ryzyko drugiego takiego samego zagrożenia rośnie wraz z odkryciami.
Jednoczesny samotny powrót pozwala zabrać resztki ze szlaku, wspólny dzieli je między wracających.
Jedna wersja, bez ról, walki, ekwipunku, reliktów i indywidualnych talii.

## 2. Talia i zasoby

Stałe: `EXPEDITIONS = 5`, `DECISION_SECONDS = 20`, `SUMMARY_SECONDS = 15`.
Każda wyprawa ma świeżą, przetasowaną przez rng talię 30 kart:

- 15 skarbów o wartościach od 1 do 15, każda wartość raz; łącznie 120 monet.
- 5 rodzajów zagrożeń, po 3 karty: osuwisko, zalanie, rój, przepaść, zawalony most.
  Wszystkie działają jednakowo; różne nazwy i ikony pomagają śledzić powtórzenia.

Każdy ma `bank` (bezpieczne monety z zakończonych powrotów) i `carried` (zagrożona zdobycz
bieżącej wyprawy). Szlak ma wspólne `loose` (resztki podziałów), początkowo zero.
Bank, carried, loose, odkryte karty i liczby zagrożeń są jawne. Przyszła kolejność talii jest tajna.
Stały komplet zapewnia ten sam skład, ale nie identyczny wynik między partiami; brak rekordu solo.

## 3. Przebieg wyprawy

1. Wszyscy wracają do gry, carried i loose zerowane, bank zachowany. Serwer od razu
   odkrywa pierwszą kartę, rozstrzyga ją i otwiera pierwszą decyzję.
2. Skarb o wartości `v` przy `a` osobach na szlaku: każdy dostaje `floor(v/a)` do carried,
   a `v % a` trafia do loose. Poprzednie loose nie jest ponownie rozdzielane ze skarbem.
3. Pierwsza karta danego zagrożenia tylko ostrzega. Druga tego samego rodzaju kończy
   wyprawę: pozostający tracą carried, bank ocalałych w obozie jest nietknięty.
4. Po każdym nieterminalnym odkryciu wszyscy nadal na szlaku potajemnie wybierają
   „Idę dalej” albo „Wracam”. Dotknięcie wybiera, „Gotowe” zatwierdza. Do zatwierdzenia
   wybór jest lokalny i zmienny, potem nieodwołalny. Jawna jest gotowość, nie jej treść.
5. Gdy wszyscy zatwierdzili lub dostali ruch timeoutu, serwer rozstrzyga cały komplet naraz:
   jeśli wraca `k > 0` osób, każda przenosi do banku swoje carried i `floor(loose/k)`.
   Jej carried staje się zero, loose zmniejsza się o `k * floor(loose/k)`.
6. Wszyscy wracający dostają tę samą część resztek, bez przywileju pierwszej wiadomości.
   Wracający nie podejmują już decyzji w tej wyprawie; obserwują ryzyko pozostałych.
7. Jeśli ktoś został, serwer od razu odkrywa następną kartę i zaczyna nową decyzję
   albo odsłonę końca. Ostatnie decyzje, podział i ostatnia karta pozostają widoczne;
   animacja nie opóźnia działania serwera i nie dodaje osobnego obowiązkowego kliknięcia.
8. Jeśli wrócili wszyscy, wyprawa kończy się bez następnej karty. Resztki niepodzielne
   między wracających przepadają. Po zagrożeniu pozostałe loose również przepada.

Przykład: loose = 5, wracają dwie osoby z carried 7 i 4. Do banku trafia odpowiednio 9 i 6,
na szlaku zostaje 1. Następny skarb dzieli się już tylko między osoby nadal na wyprawie.

Odsłona trwa 15 s albo do „Dalej” od wszystkich uczestników (także tych, którzy wrócili).
Pokazuje zyski, utraconą zdobycz, kończące zagrożenie i stan banków. Po piątej wyprawie
bezpośrednio `over`, ostatnia odsłona bez limitu. Wygrywa największy bank, równe banki
dają wspólne miejsca, a remis na górze nie przyznaje zwycięstwa. Bez dodatkowego tie-breaka.
Zakres banku jednego gracza 0–600; suma banków nie może przekroczyć 600.

## 4. Timeouty i zakończenie

- Fazy `decision`, `summary`, `over`. Timeout decyzji to **Wracam**, neutralnie zabezpiecza
  dotychczasowy wynik. Timeout odsłony: `next`. Oba ruchy legalne także w normalnej rozgrywce.
- `waitingFor` w decision to osoby na szlaku bez zatwierdzonego wyboru; nie obejmuje obozu.
  Klucz czasu: nonce, wyprawa, numer odkrycia, faza. Ruch innego gracza nie odnawia czasu.
- W prawidłowej talii najpóźniej 21. karta kończy wyprawę (15 skarbów, najwyżej 5 różnych
  zagrożeń i następnie powtórzenie), więc jest najwyżej 20 decyzji na wyprawę.
  Górna granica czekania: `5 × 20 × 20 + 4 × 15 = 2060 s`, czyli 34 min 20 s,
  bez opóźnień sieci/serwera. Zwykła gra powinna być krótsza; czas do UI ustali próba z ludźmi.
- Ochronne zachowanie przy pustej talii: pozostali wracają razem, bankują carried i dzielą
  loose jak przy powrocie; wyprawa kończy się. Przy normalnych danych ten przypadek nie wystąpi.
- Nic nie jest dopisywane do banku drugi raz po reloadzie, next ani powtórzonej wiadomości.
- Trwałe wyjście przerywa partię według platformy. Chwilowe rozłączenie uruchamia zwykłe
  timeouty. Nie zmieniamy składu talii ani progów po wyjściu.

## 5. Kontrakt i prywatność

State: players, nonce, faza, wyprawa, numer odkrycia, talia i pozycja, odkryty szlak,
osoby na szlaku, bank/carried, loose, prywatne decyzje, gotowość, ostatnie rozstrzygnięcie
i historia pięciu wypraw. Zwykły JSON, niemutowalne applyMove.
Ruchy: `choose { choice: "continue" | "return" }`, `next`; nonce i numer wyprawy w obu,
numer odkrycia w choose. Zod ogranicza typy, validateMove sprawdza fazę, obecność na szlaku,
brak wcześniejszej decyzji i zgodność numerów. Obserwator nigdy nie rusza.

Jawnie budowane View: publiczny stan, własny zatwierdzony wybór, lista gotowych osób.
Cudze wybory dopiero po rozstrzygnięciu, także dla osób w obozie. Żadnego tail talii,
seeda ani danych, z których wynika następna karta. Liczba pozostałych kart może być publiczna.
Po końcu wyprawy pokazujemy faktycznie odkryty szlak; nieodsłonięte karty nie są potrzebne.
Reload przywraca zatwierdzony wybór, nonce rewanżu resetuje lokalny wybór.

## 6. Ekran i integracja

Wspólna skorupa z równoczesnym statusem. U góry „Wyprawa 2/5”, bank, carried i loose
z jednoznacznymi podpisami. Główna karta, pięć liczników zagrożeń, sześciu graczy z ikoną
„szlak/obóz”. Na dole dwa wybory i „Gotowe”, w kolorze gracza z drugim sygnałem zaznaczenia.
W obozie tekst „Jesteś w obozie. Czekasz na koniec wyprawy” i nadal publiczne wydarzenia.
Cały szlak dostępny w szczególe; aktywny ekran nie musi rysować 20 dużych kart.
W odsłonie i na końcu tabela banków i pięciu zysków, historia może przewijać się pionowo.
360×640, cele 48 px, pełny kontrast tokenów, brak czerwieni dla własnego wyboru.

Stan nowej karty od razu, opcjonalne card-in 0,35 s; zysk float-up 1,6 s / float-still.
Porażka wyprawy jest wynikiem ryzyka, bez dodatkowej wibracji „błąd”; nowa decyzja przez
VIBRATE.turn z kluczem wyprawa/odkrycie. Kolejne decyzje tej samej osoby muszą wibrować
raz, nawet gdy waitingFor ponownie obejmuje wszystkich. Reload bez zaległych animacji.

Po akceptacji: dokumenty, `wyprawa.test.ts` przed `wyprawa.ts`, potem
`apps/web/src/games/Wyprawa.tsx`, GAMES i eksporty WYPRAWA_, Lobby, Game z nonce,
SIMULTANEOUS i OWN_RANKING, decisionKey i jego testy. Reuse shuffle, rankResults i rankPlaces.
Wzorzec faz z Państw-miast; bez nowego ogólnego silnika, endpointów, bazy i zależności.
Osobny commit testów tylko na prośbę użytkownika; bez automatycznego commit/push.

## 7. Testy i odbiór

Obowiązkowe ZASADY §2: definicja 2/6, setup, seedy, schematy, granice, złe fazy/osoby,
stare i podwójne ruchy, końce, remisy, timeouty, brak mutacji i JSON.
Szczególnie: skład i suma talii; podział 1/6, 15/2 i reszt; jedno i kilka powrotów naraz;
niezależność rozstrzygnięcia od kolejności wiadomości; bank nie ginie; pierwszy/drugi
hazard, różne hazardy; wszyscy wracają, jedna osoba idzie dalej; powrót przed zagrożeniem;
wyczerpana talia; reset między wyprawami; limit 20 decyzji; komplet timeoutów kończy partię.
Widoki gracza na szlaku, w obozie, obserwatora i obcego id; ukryte wybory i talia w każdej fazie.
Sprawdzenie bilansu monet: bank + carried + loose + utracone/odrzucone = suma odkrytych skarbów.

Pełne partie 2/6 + obserwator, timeout/reload każdej fazy, wyjście/reconnect, remis,
rewanż, zapis wygranej, wiadomości WebSocket, telefon 360×640 i reduced motion.
Bramki: `pnpm typecheck && pnpm test`, `pnpm --filter web build`.
Próba z ludźmi: 20 s na decyzję, atrakcyjność samotnego powrotu i czas czekania w obozie.

Do akceptacji: 5 wypraw, podana talia, drugi identyczny hazard, jednoczesny podział reszt,
bank jawny, timeout powrotu. Koniec zadania po wdrożeniu i odbiorze tych zasad.

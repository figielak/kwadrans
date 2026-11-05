# Sabotaż: plan v1

2026-11-05. Propozycja do akceptacji, bez implementacji. Źródła projektu: KONCEPT.md,
ZASADY.md i DESIGN.md. Wariant inspirowany mechaniką zakrytych kart i licytacji znaną ze Skull,
z własną punktacją, nazwami i oprawą. Nie deklarujemy zgodności z pełnymi zasadami oryginału.

## 1. Tożsamość

Id `sabotaz`, nazwa „Sabotaż”, 3–6 osób, gra główna, 6 rund, bez eliminacji.
Każdy ma 3 karty „Przejście” i 1 „Pułapkę”. Dokładacie je do własnych stosów,
a następnie licytujecie, ile kart odkryjecie bez pułapki. Zwycięzca licytacji sprawdza
swoją deklarację. Pułapki pozwalają zwodzić innych, ale mogą uwięzić własnego autora.
Pierwsza wersja bez specjalnych kart, niszczenia ręki, drużyn, czatu i trybów.
Gra różni się od Blefu: wybieracie zawartość stosów, a porażka nie eliminuje z partii.

## 2. Zasady rundy

Stałe: `ROUNDS = 6`, `SAFE_CARDS = 3`, `TRAP_CARDS = 1`, `INITIAL_SECONDS = 30`,
`TURN_SECONDS = 60`, `SUMMARY_SECONDS = 15`, `SUCCESS_POINTS = 2`, `TRAP_POINTS = 1`.

### Pierwsza karta (`initial`)

Każdy otrzymuje świeży komplet czterech kart. Jednocześnie i potajemnie wybieracie jedną
kartę na własny pusty stos. Zatwierdzenie nieodwołalne, jawne tylko „gotowe”.
Po wszystkich wyborach rozpoczyna się układanie. W rundzie 1 zaczyna players[0],
w kolejnych `players[round % N]`. To jawna rotacja inicjatywy, niezależna od punktów.

### Dokładanie lub otwarcie licytacji (`place`)

W swojej turze wybierasz jedną z dwóch akcji:

- Dołóż jedną kartę z ręki na wierzch własnego stosu. Treść zna tylko właściciel.
- Otwórz licytację liczbą od 1 do liczby wszystkich kart na stole `T`.

Po dołożeniu ruch przechodzi do następnej osoby. Nie można pasować, zaglądać do cudzych
stosów, zmieniać kolejności ani zabrać karty. Z pustą ręką trzeba otworzyć licytację.
Karty bezpieczne są wymienne; ruch wybiera rodzaj, a nie sztuczny identyfikator konkretnej kopii.

### Licytacja (`bid`)

Po pierwszej deklaracji dokładanie jest zamknięte. Wszyscy mogą jeszcze licytować.
Kolejne osoby podają liczbę większą od aktualnej i nie większą od T albo pasują.
Pas wyklucza tylko z tej licytacji, karty pasującego nadal są na stole.
Po podbiciu poprzedni lider może później ponownie podbić lub spasować.
Ruch przechodzi do następnej niepasującej osoby innej niż aktualny lider.
Gdy poza liderem wszyscy spasowali, lider rozpoczyna odkrywanie.
Deklaracja T nie kończy aukcji sama, lecz następni mogą już tylko spasować.

### Odkrywanie (`reveal`)

- Wygrywający musi odkryć zadeklarowaną liczbę bezpiecznych kart. Liczba oznacza łączną
  liczbę odkryć w tej próbie, wliczając własne karty.
- **Najpierw własny stos od góry**. Serwer automatycznie odkrywa wymuszoną część:
  do pułapki, osiągnięcia celu lub wyczerpania własnego stosu. Jeśli cel jest mniejszy
  od własnego stosu, nie trzeba odkrywać reszty. Pułapka pod bezpieczną kartą może więc
  pozostać zakryta przy deklaracji 1.
- Następnie wygrywający wybiera, z czyjego niepustego stosu odsłonić wierzchnią kartę.
  Każdy wybór to osobny zatwierdzony ruch. Może zmieniać właściciela pomiędzy odkryciami.
- Pułapka natychmiast kończy próbę. Po osiągnięciu celu kończy się sukcesem i nie odkrywa
  się następnej karty. Nie wolno wybierać karty spod wierzchu ani przerywać próby dobrowolnie.
- Gdy pozostał jeden niepusty cudzy stos, serwer może rozstrzygnąć wymuszone kolejne odkrycia
  od razu, z zapisem całej kolejności. Wynik nie zależy od obejrzenia animacji.

### Punkty i odsłona (`summary`)

Sukces: licytujący +2 pkt, pozostali 0. Cudza pułapka: jej właściciel +1 pkt,
licytujący i pozostali 0. Własna pułapka: wszyscy 0. Nie ma ujemnych punktów ani utraty kart
na przyszłą rundę. Tylko pierwsza napotkana pułapka może dać punkt, nigdy dalsze karty.

Pokazujemy wszystkie stosy i pozostałe ręce rundy, zwycięską deklarację, kolejność odkryć,
pułapkę kończącą próbę oraz przyrosty i sumy. Wszystkie karty są jawne dopiero w tej odsłonie.
„Dalej” od wszystkich lub 15 s otwiera nową rundę ze świeżymi czterema kartami.
Po szóstej od razu `over`, ostatnia odsłona zostaje. Wygrywa największa suma, remis na górze
bez zwycięzcy, równe dalsze sumy mają wspólne miejsca. Wynik gracza 0–12, pełna historia 6 rund.

## 3. Timeouty i skończoność

- Initial: automatycznie dołóż „Przejście”. Place: otwórz licytację na 1, zamiast dokładać.
- Bid: pas. Reveal: odsłoń wierzch losowego legalnego cudzego stosu przez przekazane rng.
  Wymuszona własna część nie czeka na timeout. Summary: next.
- Wszystkie ruchy timeoutu przechodzą tę samą walidację. Nie ma automatycznej przegranej
  za nieobecność ani dostępu klienta do wyboru losowania serwera.
- Klucz turn: nonce, runda, faza, numer decyzji. Nowa tura 60 s, pierwsze karty wspólne 30 s,
  odsłona wspólne 15 s. Szkice lokalne ani ruchy innych osób w initial nie przedłużają terminu.
- Runda ma najwyżej 3N dodatkowych dołożeń, T <= 4N podbić łącznie z otwarciem,
  N-1 pasów i T odkryć. Cała partia ma 6 rund. Nie ma nieskończonej aukcji, ale nie ma
  też twardego limitu czasu partii. Pełne wykorzystanie 60 s przy każdym ruchu bardzo
  wydłuży grę; nie przedstawiamy liczby rund jako gwarancji kwadransa.
- Trwałe wyjście kończy grę według KONCEPT.md; reconnect zachowuje karty, pas i termin.
  Wszyscy mają miejsce do końca, nikt nie zostaje wyeliminowany przez mechanikę.

## 4. Stan i widoki

State: gracze, nonce, runda/faza, ręce (liczności rodzajów), stosy w kolejności,
gotowość pierwszych kart, bieżący gracz, lider i deklaracja, spasowani, numer decyzji,
publiczna sekwencja odkryć, punkty i historia rund. Zwykły JSON, niemutowalne applyMove.
Ruchy: `place { kind }` (initial/place), `bid { amount }` (place/bid), `pass`,
`reveal { owner }`, `next`. Wszystkie mają nonce/rundę, ruchy po kolei również numer decyzji.
validateMove sprawdza dostępność kart, poprawną turę/fazę, legalne podbicie i niepusty stos.

Jawnie budowane View: własna ręka i kolejność własnego stosu, publiczne wielkości cudzych
stosów/rąk, deklaracja, pasy, tura i odsłonięte karty. W initial liczby już wyłożonych kart
mogą ujawniać gotowość, nigdy rodzaj. W reveal cudze nieodkryte karty pozostają tajne.
Obserwator widzi tylko publiczny stan i odkrycia. Nieznane id traktowane jak obserwator.
W summary i over publiczna historia pełnych kart tylko zakończonych rund.
Nie losujemy na nowo żadnej karty przy reconnect. Nonce rewanżu czyści lokalne zaznaczenia.

## 5. Ekran i integracja

Sześć stosów w siatce 2×3: nick, liczba kart, pas/lider i ujawniony wierzch. Własne karty
na dole jako dwa czytelne typy z licznością. Wybór rodzaju/stosu i osobne zatwierdzenie 48 px.
Licytacja: duża liczba, minus/plus, „Licytuj” i „Pas”. Odkrywanie: widoczne „3 z 5”,
wybrany stos i przycisk „Odkryj u …”. Cel niższy niż własny stos wyjaśniony w instrukcji.
W oczekiwaniu pokazujemy aktualną akcję i publiczny stan; własną rękę można nadal sprawdzić.
Odsłona z pełnymi stosami i tabela punktów mogą przewijać się pionowo.

Wspólne tokeny, btn-player, aria-pressed, polskie teksty, minimum 48 px, 360×640.
Odkrycia dostępne od razu, opcjonalnie stone-pop 0,35 s; punkty float-up 1,6 s.
Reduced motion i zastany stan jak w ZASADY. Nowa decyzja VIBRATE.turn, trafiona cudza
pułapka useHarm raz u odkrywającego, własna pułapka bez dodatkowej wibracji legalnego pudła.
Nie pokazywać treści pułapki w etykiecie DOM zakrytej karty.

Implementacja po akceptacji: dokumenty, `sabotaz.test.ts`, następnie `sabotaz.ts`,
`apps/web/src/games/Sabotaz.tsx`, rejestr i eksporty SABOTAZ_, ikona/opis Lobby,
render z nonce i OWN_RANKING w Game. Równoczesny status tylko initial/summary,
pozostałe fazy „Twój ruch”; nie dodawać gry bezwarunkowo do SIMULTANEOUS.
Klucze decyzji w vibrate.ts muszą obsłużyć kilka odkryć z rzędu tej samej osoby.
Punktacja i miejsca przez core; bez nowych zależności, endpointów i bazy.
Commit testów przed kodem wymagany w repo, tylko na osobną prośbę. Bez automatycznego push.

## 6. Testy i odbiór

Wszystkie obowiązkowe testy ZASADY §2. Dodatkowo: wyczerpanie 3+1 kart, zakaz dodawania
po starcie aukcji, kolejność stosu, licytacja 1/T, skoki wartości, powrót poprzedniego lidera,
pas do końca aukcji, pasy przy maksymalnej deklaracji, jedna osoba pozostała w licytacji;
własny stos przed cudzym, cel niższy od własnego stosu, pułapka własna/cudza, puste stosy,
koniec dokładnie po celu, wymuszona sekwencja; punkty 2/1/0 tylko raz, świeże ręce,
rotacja startu i remisy. Losowanie tylko potrzebnego wyboru timeoutu i nonce przez rng.
Pełna partia samymi timeoutami musi dojść do końca przy 3 i 6 osobach.
Własne/cudze/obserwatora widoki w każdej fazie, karty niewidoczne także w historii przed odsłoną.

/dev: całe partie 3/6 + obserwator, każda faza z timeout/reload, WebSocket bez sekretów,
reconnect, wyjście, rewanż, remis, wygrana w statystykach; telefon 360×640, reduced motion.
Bramki: `pnpm typecheck && pnpm test`, `pnpm --filter web build`.
Próba z ludźmi: długość aukcji, balans premii 2/1, łatwość zapamiętania własnego stosu
i skłonność do zawsze bezpiecznej deklaracji 1. Balans nie jest jeszcze potwierdzony.

Do akceptacji: 6 rund bez eliminacji, komplet 3+1, odkrywanie od góry i własnego stosu,
premia dla właściciela pułapki, limity faz. Koniec po wdrożeniu i odbiorze tego zakresu.

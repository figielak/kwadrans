# Wspólny szyfr: plan v1

2026-11-05. Propozycja do akceptacji, bez implementacji. Źródła: KONCEPT.md,
ZASADY.md, DESIGN.md oraz rzeczywisty GameResult, LobbyRoom.finish/onLeave i status Game.tsx.
Gra wymaga niewielkiego, jawnego rozszerzenia kontraktu dla współpracy.

## 1. Tożsamość i cel

Id `wspolny-szyfr`, nazwa „Wspólny szyfr”, 2–6 osób. Gra główna kooperacyjna:
trzy zamki, po jednym sześciocyfrowym kodzie do każdego. Każdy widzi inny fragment
informacji, dopiero rozmowa pozwala złożyć pełny kod. Wszyscy wygrywają albo przegrywają razem.
Sześć cyfr 0–9, powtórzenia i zero na początku dozwolone. Pozycje oznaczone sześcioma
stałymi, różnymi symbolami z podpisami; kolor nie jest jedynym nośnikiem informacji.

Wersja v1 do wspólnego stołu albo zewnętrznej rozmowy głosowej. Instrukcja prosi o opisywanie
wskazówek słowami zamiast pokazywania telefonu. Bez rozmowy ta wersja nie zapewnia kanału
wymiany informacji. Nie dodajemy czatu, audio, AI, fabularnego escape roomu ani edytora zagadek.
Obsługa wielu telefonów tej samej osoby nie jest mechanizmem przeciw oszustwom.

## 2. Generator z gwarancją rozwiązania

Każdy zamek to sześć wskazówek tworzących skierowany łańcuch po sześciu pozycjach.
Serwer tasuje kolejność pozycji `p0..p5`. Jedna wskazówka daje cyfrę na `p0`.
Każda z kolejnych pięciu definiuje cyfrę następnej pozycji na podstawie poprzedniej.
Wskazówki są przekazywane graczom w potasowanej kolejności, nie jako gotowy łańcuch.

Dopuszczalne przekształcenia, wszystkie odwracalne dla cyfr 0–9:

- Dodaj k, zostaw cyfrę jedności: `b = (a + k) % 10`.
- Odejmij k, po zejściu poniżej zera przejdź od 9: `b = (a - k + 10) % 10`.
- Dopełnij do dziewięciu: `b = 9 - a`.

`k` z 1..4. Działanie opisane słowami i przykładem; gracz nie musi znać modulo.
Np. „Trójkąt ma o 3 więcej niż koło. Po 9 jest 0”, „Kwadrat i gwiazda dają razem 9”.

Zamek 1: pięć dodawań. Zamek 2: trzy dodawania i dwa odejmowania w losowej kolejności.
Zamek 3: dwa dodawania, dwa odejmowania i jedno dopełnienie w losowej kolejności.
Serwer losuje cyfrę startową 0..9, k i pozycje przez rng, wylicza odpowiedź z łańcucha.
Unika identycznego pełnego kodu we wcześniejszych zamkach: przy kolizji zwiększa cyfrę
startową cyklicznie do pierwszej wolnej i przelicza. Najwyżej dwie wcześniejsze odpowiedzi,
więc nie więcej niż trzy kandydatury; bez nieograniczonego losowania.

**Dlaczego to działa:** kotwica i pięć funkcji ustalają dokładnie jeden kod. Usunięcie
kotwicy zostawia dziesięć możliwych kodów; usunięcie dowolnej relacji daje dziesięć
możliwości dla odłączonej części. Każda wskazówka jest niezbędna.

Serwer tasuje sześć wskazówek i rozdziela je kolejno graczom, zaczynając od osoby
`players[lock % N]`. Przy 2 osobach po 3, przy 3 po 2, przy 4 rozkład 2/2/1/1,
przy 5 rozkład 2/1/1/1/1, przy 6 po 1. Rotacja rozdziela nadmiar między zamkami.
Każdy ma co najmniej jedną, nikt wszystkich; bez informacji dowolnego uczestnika
pełny kod nie jest jednoznaczny. Brak losowego generatora z odrzucaniem trudnych układów,
ręcznej puli setek zagadek i ciężkiego solvera w ścieżce produkcyjnej.

## 3. Przebieg i wynik

Stałe: `LOCKS = 3`, `DIGITS = 6`, `LOCK_SECONDS = 180`, `MAX_ATTEMPTS = 3`,
`SUMMARY_SECONDS = 15`, `DRAFT_MS = 500`.

1. Zamek zaczyna od ujawnienia każdemu jego wskazówek i uruchomienia wspólnego terminu 180 s.
   Klucz czasu nie zmienia się przy wpisywaniu ani błędnej próbie.
2. Wprowadzający kod to `players[lock % N]`; w pierwszym zamku players[0]. Tylko on edytuje
   sześć pól, ale cała drużyna widzi zapisany szkic. Pozostali mają aktywną rolę czytania
   i komunikacji, choć nie należą do waitingFor w tej fazie.
3. Szkic aktualizowany najwyżej co 500 ms, zawiera cyfry albo null dla pustego pola.
   „Sprawdź kod” przesyła aktualne pełne sześć cyfr i jest jedynym zatwierdzeniem próby.
   Zaległy debounce zostaje anulowany; zmiana zamka/próby unieważnia starsze wiadomości.
4. Poprawny kod otwiera zamek. Zły zużywa próbę, pokazuje „Kod nie pasuje. Zostały 2 próby”.
   Nie ujawniamy liczby trafionych pozycji ani poprawności poszczególnych cyfr.
5. Trzeci zły kod albo timeout zamyka dany zamek niepowodzeniem. Timeout to zaufany
   ruch `expire`, nie automatyczne wysłanie szkicu. Nie ma dodatkowej próby po terminie.
6. Po rozstrzygnięciu odsłona: wynik zamka, właściwy kod i wszystkie wskazówki ułożone
   w łańcuch z wyliczonymi cyframi. „Dalej” od wszystkich lub 15 s zaczyna kolejny zamek.
7. Rozgrywamy wszystkie trzy zamki nawet po porażce jednego, żeby każdy zobaczył postęp
   i miał okazję rozwiązać dalszą zagadkę. Trzeci od razu kończy partię, bez ostatniego odliczania.

Sukces drużyny tylko przy 3/3 otwartych zamkach. Przy 0–2: wspólne niepowodzenie z czytelnym
wynikiem częściowym, np. „Otwarte zamki: 2/3”. Bez indywidualnych punktów, miejsc i zwycięzcy.
Końcowy ekran zawiera wyniki zamków, liczbę zużytych prób i pełne wyjaśnienia.
Nie mierzymy rekordu szybkości i nie porównujemy zespołów o różnej liczbie osób.
Limit oczekiwania `3 × 180 + 2 × 15 = 570 s`, czyli 9 min 30 s, bez opóźnień serwera/sieci.

## 4. Timeouty, reconnect, wyjścia

Fazy `solve`, `summary`, `over`. waitingFor w solve zawiera tylko wprowadzającego,
w summary osoby bez next; po końcu puste. turn key: nonce, zamek, faza. Nie zawiera
licznika prób ani zmian szkicu. Dzięki temu applyMove nie przedłuża 180 s.
timeoutMove: solve → expire, summary → next. validateMove dopuszcza expire tylko ze
źródła timeout, od aktualnego wprowadzającego; pole source klienta niczego nie uprawnia.

Przejściowa utrata połączenia nie pauzuje zegara, reload przywraca przydział, próby,
ostatni zapisany szkic i termin. W v1 brak przekazywania roli wprowadzającego w środku zamka.
Jeśli nie wróci, zamek może zakończyć się timeoutem, następny ma nowego wprowadzającego.
Trwałe wyjście dowolnego uczestnika przerywa partię bez wyniku drużyny i bez walkoweru
dla pozostałej osoby. To celowy wyjątek od obecnej reguły platformy dla współpracy.

## 5. Kontrakt platformy: wymagany zakres zmiany

Obecnie GameResult zna pojedynczego winner/ranking, Game.tsx pokazuje „Remis” przy braku
zwycięzcy, a LobbyRoom przy wyjściu z gry 2-osobowej daje zwycięstwo osobie pozostałej.
Samo zwrócenie pustego obiektu dałoby zły komunikat, a zwykły ranking sugerowałby rywalizację.

Proponowane rozszerzenie opcjonalne i zgodne ze starymi definicjami:

- `GameDefinition.cooperative?: true`, domyślnie brak, czyli dotychczasowe zachowanie.
- `GameResult.teamResult?: "success" | "failure"`; dla Szyfru bez winner/ranking/places.
- isOver zwraca teamResult dopiero po trzecim zamku. Przerwanie przez wyjście zwraca `{}`,
  bez udawania porażki rozegranej do końca.
- Game.tsx dla cooperative: „Otworzyliście wszystkie zamki!” / „Nie udało się otworzyć
  wszystkich zamków”; dla obserwatora forma „Drużyna…”. Przerwanie: „Przerwano grę”.
  Brak indywidualnej korony, „+1” i komunikatu remis. Pozostają wspólne akcje rewanżu/lobby.
- LobbyRoom.onLeave nie daje walkoweru przy cooperative. finish nie zapisuje indywidualnych
  wygranych ani nie zwiększa pucharów pokoju dla cooperative. Szyfr nie ma record.
- W v1 wynik drużyny pozostaje w podsumowaniu bieżącej partii. Nie dodajemy tabeli SQL,
  rankingu drużyn ani API historii. To świadomy zakres, opisany użytkownikowi w Setup.

Regresja obowiązkowa: wyniki i statystyki dotychczasowych gier, ich remisy oraz walkowery
muszą zachować zachowanie. Dopisać kontrakt i wyjątek wyjścia w KONCEPT.md oraz zasady
prezentacji wyniku współpracy w ZASADY.md. Bez nowych zależności, w szczególności zod w serwerze.

## 6. Stan i prywatność

State: gracze, nonce, numer zamka, faza, prywatne rozwiązanie i sześć wskazówek z właścicielami,
wprowadzający, wspólny szkic, liczba prób, historia błędnych kodów, gotowość i wyniki zamków.
Kolejny zamek generujemy dopiero przy przejściu do niego. Poprzednie odsłony publiczne.
Ruchy `draft { digits }`, `submit { digits }`, `expire`, `next`, każdy z nonce i numerem zamka;
draft/submit dodatkowo oczekiwany numer próby. Zod pilnuje 6 elementów i cyfr całkowitych 0..9,
null tylko w draft; validateMove sprawdza rolę, fazę, numer próby i źródło expire.
applyMove nie mutuje wejścia, stan przechodzi JSON, funkcje generatora korzystają tylko z rng.

Jawnie budowany View: własne wskazówki, publiczny szkic, wprowadzający, pozostałe próby,
błędne kody i postęp. Nie wysyłamy rozwiązania, cudzych wskazówek, porządku łańcucha,
seeda ani dodatkowych identyfikatorów zdradzających połączenia. Symbole w treści wskazówek
są oczywiście widoczne właścicielowi. Obserwator widzi szkic i postęp, bez wskazówek.
Nieznane id dostaje widok obserwatora. Summary/over: pełne dane zakończonego zamka,
nie przyszłych. Nonce rewanżu czyści pola i zaległe szkice.

## 7. Ekran

Wspólna skorupa z czasem, własna treść: „Zamek 1/3”, „Próby: 3”, sześć pozycji kodu,
własne 1–3 krótkie wskazówki. Każdy symbol ma podpis („Koło”, „Gwiazda”…), bez zależności
od koloru. Wprowadzający wybiera pole i cyfrę z klawiatury ekranowej 0–9; pola i klawisze 48 px.
Przycisk „Sprawdź kod” w jego kolorze, z powodem blokady przy pustych polach.
Pozostali widzą „Kod wpisuje …” i wspólny szkic, bez nieaktywnych kontrolek sugerujących błąd.

Sześć pól po 48 px mieści się w 328 px szerokości przy pięciu odstępach po 8 px.
Wskazówki muszą być zwięzłe i mierzone z klawiaturą ekranową przy 360×640. Jeśli wszystkie
trzy nie mieszczą się jednocześnie, można przełączać je zakładkami z licznikiem i pełną
treścią aktywnej, bez zmniejszania pisma czy pól dotyku. Brak klawiatury systemowej.
Przy udanym kodzie wynik dostępny od razu, opcjonalne stone-pop 0,35 s dla otwartego zamka.
Zły kod: krótki tekst i VIBRATE.mistake u wprowadzającego, raz za przyjętą błędną próbę.
Nie wibruje przy każdym szkicu. Nowy zamek VIBRATE.turn u wszystkich odbiorców wskazówek:
decisionKey ma świadomą gałąź cooperative, nie może opierać się tylko na waitingFor.
Reduced motion, zastany stan i polskie teksty według zasad projektu.

## 8. Kolejność implementacji i testy

1. Zatwierdzenie zasad i rozszerzenia cooperative; dokumenty źródłowe przed kodem.
2. Testy generatora i zasad w `wspolny-szyfr.test.ts`, testy kontraktu wyniku i regresji
   LobbyRoom (wyjście, finish), statusu UI oraz decisionKey. Osobny commit TDD na prośbę
   użytkownika przed implementacją. Sam plan nie upoważnia do commit/push.
3. `wspolny-szyfr.ts` i lokalny moduł generatora, jeśli wydzielenie poprawia czytelność;
   core GameDefinition/GameResult i wąskie gałęzie serwera/UI dla cooperative.
4. `apps/web/src/games/WspolnySzyfr.tsx`, GAMES i eksporty SZYFR_, ikona/opis Lobby,
   opis współpracy w Setup, render z nonce i końcowe akcje Game. Gra nie trafia do mini-gier,
   rekordów ani turnieju. Nagłówek solve informuje o wspólnym zadaniu i wprowadzającym.
5. Odbiór funkcjonalny, prywatności, urządzenia i zabawy z ludźmi.

Testy obowiązkowe ZASADY §2 oraz:

- Generator deterministyczny, właściwy zestaw operacji w każdym zamku, zakres cyfr,
  zero początkowe, zawijanie 9→0 i 0→9, dopełnienie, brak powtórzeń kodu.
- Niezależny solver testowy dla ograniczonego zestawu seedów potwierdza jedno rozwiązanie
  wszystkich wskazówek i wiele po usunięciu dowolnej wskazówki lub całego gracza.
  Nie wystarczy ponownie wywołać produkcyjnej funkcji wyliczającej odpowiedź.
- Rozdział wskazówek dla każdej liczby osób 2..6: wszystkie przypisane dokładnie raz,
  każdy coś otrzymuje, nikt nie ma kompletu, rotacja nadmiarowych i wprowadzającego.
- Próby: poprawna pierwsza/trzecia, błędna trzecia, timeout z poprawnym lecz niewysłanym
  szkicem, brak cząstkowych podpowiedzi, stare numery prób, opóźniony debounce.
- Termin nie odnawia się po draft/submit; komplet timeoutów kończy wszystkie trzy zamki.
- 3/3 success, 0/1/2 failure; brak rankingów, indywidualnego winner, zapisu wygranych
  i pucharów. Wyjście z 2 i 6 osób przerywa bez walkoweru; stare gry nadal mają walkower.
- Widoki każdej roli/fazy, obserwatora/obcego, JSON, niemutowalność, schematy i granice.

Odbiór: pełna wygrana i przegrana przy 2/6 plus obserwator; kontrola rozdziału przy 3/4/5;
timeouty/reload każdej fazy, reconnect wprowadzającego i zwykłego uczestnika, wyjście,
rewanż, treść WebSocket, brak wpisu wygranej w SQL, mobilny dotyk i reduced motion.
Próba z ludźmi ma sprawdzić, czy 180 s wystarcza i czy rola jednej wskazówki przy 6 osobach
jest zajmująca. Matematyczna jednoznaczność nie dowodzi dobrej zabawy.
Bramki: `pnpm typecheck && pnpm test`, `pnpm --filter web build`.

Do akceptacji: 3 zamki, 6 cyfr i wskazówek, 180 s/3 próby, rozmowa poza aplikacją,
jedna osoba wpisująca, wspólny wynik bez trwałego rankingu, wyjątek od walkoweru.
Zatrzymanie po implementacji, dokumentacji i pełnym odbiorze tego zakresu.

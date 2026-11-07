// Pula par pytań Podróbki: 60 par, po 20 w kategoriach liczby, rzeczy i miejsca.
// Większość graczy dostaje jedno pytanie z pary, Podróbka drugie; wskazówka formatu jest wspólna.
// Pytania są neutralne płciowo (czas teraźniejszy, bez form „-łbyś”), proste i niewrażliwe.
// Każde pytanie występuje w całej puli tylko raz, bo rozpoznanie drugiej pary zdradzałoby przydział.
// Kategoria służy redakcji i nie trafia do klienta. Pula nie jest sekretem (kod jest współdzielony z frontendem).

export type Category = "liczby" | "rzeczy" | "miejsca";
export type Pair = { id: string; a: string; b: string; hint: string; category: Category };

export const PAIRS: Pair[] = [
  // Liczby
  { id: "l01", category: "liczby", hint: "Liczba razy", a: "Ile razy w tygodniu jesz poza domem?", b: "Ile razy w tygodniu zamawiasz jedzenie?" },
  { id: "l02", category: "liczby", hint: "Liczba filiżanek lub kubków", a: "Ile kaw wypijasz w ciągu dnia?", b: "Ile herbat wypijasz w ciągu dnia?" },
  { id: "l03", category: "liczby", hint: "Liczba godzin", a: "Ile godzin dziennie spędzasz z telefonem w ręku?", b: "Ile godzin dziennie przeglądasz media społecznościowe?" },
  { id: "l04", category: "liczby", hint: "Godzina", a: "O której zwykle wstajesz w dni robocze?", b: "O której zwykle nastawiasz budzik?" },
  { id: "l05", category: "liczby", hint: "Liczba par", a: "Ile par butów masz w domu?", b: "Ile par spodni masz w szafie?" },
  { id: "l06", category: "liczby", hint: "Liczba osób", a: "Ile osób zaprosić na urodziny?", b: "Ile osób zabrać na wspólny wyjazd?" },
  { id: "l07", category: "liczby", hint: "Liczba minut", a: "Ile minut zajmuje Ci droga do szkoły lub pracy?", b: "Ile minut zajmuje Ci dojazd do centrum miasta?" },
  { id: "l08", category: "liczby", hint: "Liczba razy", a: "Ile razy w tygodniu oglądasz jakiś serial?", b: "Ile razy w tygodniu włączasz YouTube?" },
  { id: "l09", category: "liczby", hint: "Liczba godzin", a: "Ile godzin snu potrzebujesz, żeby czuć się dobrze?", b: "Ile godzin śpisz w typową noc?" },
  { id: "l10", category: "liczby", hint: "Liczba razy", a: "Ile razy w tygodniu ćwiczysz?", b: "Ile razy w tygodniu wychodzisz na dłuższy spacer?" },
  { id: "l11", category: "liczby", hint: "Liczba wiadomości", a: "Ile wiadomości dziennie wysyłasz?", b: "Ile wiadomości dziennie dostajesz?" },
  { id: "l12", category: "liczby", hint: "Kwota w złotych", a: "Ile zł jesteś w stanie zapłacić za dobrą pizzę?", b: "Ile zł jesteś w stanie zapłacić za dobry burger?" },
  { id: "l13", category: "liczby", hint: "Wiek w latach", a: "W jakim wieku wypada wyprowadzić się z domu?", b: "W jakim wieku wypada zacząć pracować?" },
  { id: "l14", category: "liczby", hint: "Liczba", a: "Ile kart w przeglądarce masz zwykle otwartych?", b: "Ile aplikacji masz zwykle otwartych w telefonie?" },
  { id: "l15", category: "liczby", hint: "Liczba razy", a: "Ile razy dziennie sprawdzasz pocztę e-mail?", b: "Ile razy dziennie sprawdzasz pogodę?" },
  { id: "l16", category: "liczby", hint: "Liczba minut", a: "Ile minut trwa Twój zwykły prysznic?", b: "Ile minut spędzasz w łazience rano?" },
  { id: "l17", category: "liczby", hint: "Liczba razy", a: "Ile razy w roku wyjeżdżasz na wakacje?", b: "Ile razy w roku wyjeżdżasz za miasto na weekend?" },
  { id: "l18", category: "liczby", hint: "Liczba razy", a: "Ile razy w tygodniu czytasz książkę?", b: "Ile razy w tygodniu czytasz coś dłuższego niż wiadomość?" },
  { id: "l19", category: "liczby", hint: "Liczba sztuk", a: "Ile kubków masz w domu?", b: "Ile talerzy masz w domu?" },
  { id: "l20", category: "liczby", hint: "Liczba razy", a: "Ile razy dziennie jesz coś słodkiego?", b: "Ile razy dziennie podjadasz między posiłkami?" },

  // Rzeczy i jedzenie
  { id: "r01", category: "rzeczy", hint: "Nazwa potrawy", a: "Co najchętniej jesz na śniadanie?", b: "Co najchętniej jesz na kolację?" },
  { id: "r02", category: "rzeczy", hint: "Jedna rzecz", a: "Co zabierasz na plażę?", b: "Co zabierasz na basen?" },
  { id: "r03", category: "rzeczy", hint: "Jedna rzecz", a: "Co zawsze masz w kieszeni?", b: "Co zawsze masz w plecaku?" },
  { id: "r04", category: "rzeczy", hint: "Jeden dodatek", a: "Jaki dodatek do pizzy lubisz najbardziej?", b: "Jaki dodatek do kanapki lubisz najbardziej?" },
  { id: "r05", category: "rzeczy", hint: "Nazwa napoju", a: "Jaki napój pijesz do obiadu?", b: "Jaki napój pijesz w kinie?" },
  { id: "r06", category: "rzeczy", hint: "Nazwa przekąski", a: "Jaka jest Twoja ulubiona przekąska na film?", b: "Jaka jest Twoja ulubiona przekąska w podróży?" },
  { id: "r07", category: "rzeczy", hint: "Jeden smak", a: "Jaki smak lodów wybierasz najczęściej?", b: "Jaki smak jogurtu wybierasz najczęściej?" },
  { id: "r08", category: "rzeczy", hint: "Nazwa aplikacji", a: "Jaką aplikację otwierasz najczęściej rano?", b: "Jaką aplikację otwierasz najczęściej wieczorem?" },
  { id: "r09", category: "rzeczy", hint: "Jedna rzecz", a: "Co zabierasz na wycieczkę w góry?", b: "Co zabierasz na biwak?" },
  { id: "r10", category: "rzeczy", hint: "Jeden prezent", a: "Jaki prezent najchętniej dostajesz na urodziny?", b: "Jaki prezent najchętniej dostajesz na święta?" },
  { id: "r11", category: "rzeczy", hint: "Jedna rzecz", a: "Co kupujesz zwykle w kiosku?", b: "Co kupujesz zwykle na stacji benzynowej?" },
  { id: "r12", category: "rzeczy", hint: "Gatunek muzyki", a: "Jaki gatunek muzyki włączasz do nauki?", b: "Jaki gatunek muzyki włączasz do sprzątania?" },
  { id: "r13", category: "rzeczy", hint: "Jedna rzecz", a: "Jaki przedmiot w domu jest Twoim ulubionym?", b: "Jaki przedmiot w domu jest dla Ciebie najbardziej niezbędny?" },
  { id: "r14", category: "rzeczy", hint: "Nazwa dania", a: "Jakie danie najczęściej wybierasz w restauracji?", b: "Jakie danie najczęściej wybierasz w barze mlecznym?" },
  { id: "r15", category: "rzeczy", hint: "Nazwa owocu", a: "Jaki owoc jesz najczęściej latem?", b: "Jaki owoc jesz najczęściej zimą?" },
  { id: "r16", category: "rzeczy", hint: "Jeden dodatek", a: "Jaki dodatek wybierasz do kawy?", b: "Jaki dodatek wybierasz do herbaty?" },
  { id: "r17", category: "rzeczy", hint: "Nazwa postaci", a: "Jaka postać z bajki jest Twoją ulubioną?", b: "Jaka postać z filmu jest Twoją ulubioną?" },
  { id: "r18", category: "rzeczy", hint: "Nazwa gry", a: "Jaką grę planszową lub karcianą wybierasz najczęściej?", b: "Jaką grę komputerową lub mobilną wybierasz najczęściej?" },
  { id: "r19", category: "rzeczy", hint: "Jedna rzecz", a: "Jaka rzecz leży na Twoim biurku?", b: "Jaka rzecz leży na Twoim stoliku nocnym?" },
  { id: "r20", category: "rzeczy", hint: "Nazwa sosu", a: "Jaki sos wybierasz do frytek?", b: "Jaki sos wybierasz do kebaba?" },

  // Miejsca i codzienne sytuacje
  { id: "m01", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej pójść na pierwszą randkę?", b: "Gdzie najlepiej spotkać się z dawnym znajomym?" },
  { id: "m02", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie lubisz się uczyć lub pracować?", b: "Gdzie lubisz czytać książkę?" },
  { id: "m03", category: "miejsca", hint: "Nazwa miejscowości", a: "Dokąd pojechać na weekend w Polsce?", b: "Dokąd pojechać na wakacje w Polsce?" },
  { id: "m04", category: "miejsca", hint: "Rodzaj lokalu", a: "Gdzie najlepiej zjeść obiad w okolicy?", b: "Gdzie najlepiej wypić kawę w okolicy?" },
  { id: "m05", category: "miejsca", hint: "Nazwa sklepu", a: "Gdzie robisz zakupy spożywcze?", b: "Gdzie kupujesz ubrania?" },
  { id: "m06", category: "miejsca", hint: "Pomieszczenie", a: "W którym pomieszczeniu spędzasz najwięcej czasu w domu?", b: "W którym pomieszczeniu najlepiej Ci się myśli?" },
  { id: "m07", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najchętniej spędzasz niedzielne popołudnie?", b: "Gdzie najchętniej spędzasz piątkowy wieczór?" },
  { id: "m08", category: "miejsca", hint: "Nazwa miasta", a: "Jakie europejskie miasto chcesz zobaczyć?", b: "Jakie europejskie miasto polecasz na weekend?" },
  { id: "m09", category: "miejsca", hint: "Przód, środek albo tył", a: "Gdzie siadasz w kinie?", b: "Gdzie siadasz w autobusie?" },
  { id: "m10", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej spędzić deszczowy dzień?", b: "Gdzie najlepiej spędzić upalny dzień?" },
  { id: "m11", category: "miejsca", hint: "Jedno miejsce", a: "Dokąd chodzisz na spacer?", b: "Dokąd chodzisz pobiegać?" },
  { id: "m12", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie zostawiasz klucze po powrocie do domu?", b: "Gdzie zostawiasz buty po powrocie do domu?" },
  { id: "m13", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie trzymasz ładowarkę do telefonu?", b: "Gdzie trzymasz parasol w domu?" },
  { id: "m14", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej pójść wieczorem z grupą znajomych?", b: "Gdzie najlepiej pójść w niedzielę z rodziną?" },
  { id: "m15", category: "miejsca", hint: "Nazwa lokalu", a: "Gdzie najlepiej zjeść pizzę w mieście?", b: "Gdzie najlepiej zjeść burgera w mieście?" },
  { id: "m16", category: "miejsca", hint: "Rodzaj sklepu", a: "Do jakiego sklepu wchodzisz bez planu?", b: "Do jakiego sklepu wchodzisz z listą?" },
  { id: "m17", category: "miejsca", hint: "Jedno miejsce", a: "Jakie miejsce w mieście pokazać gościowi z zagranicy?", b: "Jakie miejsce w mieście polecić na spacer?" },
  { id: "m18", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie leży Twój telefon w nocy?", b: "Gdzie leży Twój telefon podczas jedzenia?" },
  { id: "m19", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej obejrzeć film?", b: "Gdzie najlepiej posłuchać muzyki?" },
  { id: "m20", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej odpocząć po ciężkim dniu?", b: "Gdzie najlepiej zrelaksować się w weekend?" },
];

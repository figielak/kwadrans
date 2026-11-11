// Pula par pytań Podróbki: 60 par, po 20 w kategoriach liczby, rzeczy i miejsca.
// Większość graczy dostaje jedno pytanie z pary, Podróbka drugie; wskazówka formatu jest wspólna.
// Pytania są neutralne płciowo (czas teraźniejszy, bez form „-łbyś”), proste i niewrażliwe.
// Każde pytanie występuje w całej puli tylko raz, bo rozpoznanie drugiej pary zdradzałoby przydział.
// Kategoria służy redakcji i nie trafia do klienta. Pula nie jest sekretem (kod jest współdzielony z frontendem).

export type Category = "liczby" | "rzeczy" | "miejsca";
export type Pair = { id: string; a: string; b: string; hint: string; category: Category };

export const PAIRS: Pair[] = [
  // Liczby
  { id: "l01", category: "liczby", hint: "Liczba godzin", a: "Ile godzin trwa idealna domówka?", b: "Ile godzin trwa idealny wieczór z planszówkami?" },
  { id: "l02", category: "liczby", hint: "Kwota w złotych", a: "Ile zł to rozsądna cena za bilet do kina?", b: "Ile zł to rozsądna cena za bilet do muzeum?" },
  { id: "l03", category: "liczby", hint: "Liczba minut", a: "Ile minut spóźnienia da się jeszcze wybaczyć?", b: "Ile minut czekasz na spóźnionego znajomego, zanim napiszesz?" },
  { id: "l04", category: "liczby", hint: "Liczba osób", a: "Ile osób mieści się w idealnej paczce znajomych?", b: "Ile osób to idealny skład na planszówki?" },
  { id: "l05", category: "liczby", hint: "Godzina", a: "O której godzinie kończy się dobra impreza?", b: "O której godzinie kładziesz się spać w sobotę?" },
  { id: "l06", category: "liczby", hint: "Liczba dni", a: "Ile dni trwa idealny wyjazd w góry?", b: "Ile dni trwa idealny wyjazd nad morze?" },
  { id: "l07", category: "liczby", hint: "Kwota w złotych", a: "Ile zł wydajesz na prezent dla dobrego znajomego?", b: "Ile zł wydajesz na prezent dla kogoś z rodziny?" },
  { id: "l08", category: "liczby", hint: "Liczba", a: "Ile budzików nastawiasz na rano?", b: "Ile drzemek włączasz, zanim wstaniesz?" },
  { id: "l09", category: "liczby", hint: "Liczba minut", a: "Ile minut przed czasem przychodzisz na pociąg?", b: "Ile minut przed czasem przychodzisz na spotkanie?" },
  { id: "l10", category: "liczby", hint: "Liczba sztuk", a: "Ile kawałków pizzy zjadasz na raz?", b: "Ile pierogów zjadasz na raz?" },
  { id: "l11", category: "liczby", hint: "Wiek w latach", a: "W jakim wieku człowiek jest naprawdę dorosły?", b: "W jakim wieku najlepiej zrobić prawo jazdy?" },
  { id: "l12", category: "liczby", hint: "Ocena od 1 do 10", a: "Na ile oceniasz swoje gotowanie?", b: "Na ile oceniasz swój śpiew?" },
  { id: "l13", category: "liczby", hint: "Liczba godzin", a: "Ile godzin można bez przerwy oglądać serial?", b: "Ile godzin można bez przerwy grać w grę?" },
  { id: "l14", category: "liczby", hint: "Liczba razy", a: "Ile razy w miesiącu jesz fast food?", b: "Ile razy w miesiącu jesz w restauracji?" },
  { id: "l15", category: "liczby", hint: "Kwota w złotych", a: "Ile zł to za dużo za kawę na mieście?", b: "Ile zł to za dużo za lemoniadę w lokalu?" },
  { id: "l16", category: "liczby", hint: "Liczba języków", a: "Ile języków warto znać?", b: "Ile języków znasz choć trochę?" },
  { id: "l17", category: "liczby", hint: "Liczba osób", a: "Do ilu osób piszesz codziennie?", b: "Z iloma osobami rozmawiasz codziennie na żywo?" },
  { id: "l18", category: "liczby", hint: "Liczba minut", a: "Ile minut trwa idealna drzemka?", b: "Ile minut potrzebujesz rano, żeby się obudzić?" },
  { id: "l19", category: "liczby", hint: "Liczba sztuk", a: "Ile roślin doniczkowych to w sam raz do mieszkania?", b: "Ile poduszek to w sam raz na kanapie?" },
  { id: "l20", category: "liczby", hint: "Liczba kilometrów", a: "Ile kilometrów pokonasz pieszo bez narzekania?", b: "Ile kilometrów pokonasz rowerem bez narzekania?" },

  // Rzeczy i jedzenie
  { id: "r01", category: "rzeczy", hint: "Nazwa dania", a: "Jakie danie umiesz ugotować najlepiej?", b: "Jakie danie gotujesz, gdy nie masz czasu?" },
  { id: "r02", category: "rzeczy", hint: "Nazwa zwierzęcia", a: "Jakim zwierzęciem chcesz być przez jeden dzień?", b: "Jakie zwierzę najbardziej Cię przypomina?" },
  { id: "r03", category: "rzeczy", hint: "Jedna rzecz", a: "Bez czego nie wychodzisz z domu?", b: "Co najczęściej zostawiasz w domu przez zapomnienie?" },
  { id: "r04", category: "rzeczy", hint: "Nazwa słodyczy", a: "Jakie słodycze kupujesz sobie na poprawę humoru?", b: "Jakie słodycze bierzesz w długą podróż?" },
  { id: "r05", category: "rzeczy", hint: "Tytuł filmu", a: "Jaki film możesz oglądać w kółko?", b: "Jaki film polecasz każdemu?" },
  { id: "r06", category: "rzeczy", hint: "Jeden kolor", a: "Jakiego koloru ubrań masz najwięcej?", b: "Jaki kolor lubisz najbardziej?" },
  { id: "r07", category: "rzeczy", hint: "Jedna supermoc", a: "Jaka supermoc przydaje się najbardziej w pracy lub szkole?", b: "Jaka supermoc przydaje się najbardziej na wakacjach?" },
  { id: "r08", category: "rzeczy", hint: "Nazwa sportu", a: "Jaki sport lubisz oglądać?", b: "Jaki sport lubisz uprawiać?" },
  { id: "r09", category: "rzeczy", hint: "Nazwa zupy", a: "Jaka zupa jest najlepsza na świecie?", b: "Jaką zupę jesz najczęściej?" },
  { id: "r10", category: "rzeczy", hint: "Jedna rzecz", a: "Co zabierasz na bezludną wyspę?", b: "Co zabierasz na tydzień do chaty bez prądu?" },
  { id: "r11", category: "rzeczy", hint: "Przedmiot szkolny", a: "Jaki przedmiot szkolny jest najciekawszy?", b: "Jaki przedmiot szkolny jest najłatwiejszy?" },
  { id: "r12", category: "rzeczy", hint: "Nazwa instrumentu", a: "Na jakim instrumencie chcesz umieć grać?", b: "Jaki instrument brzmi najładniej?" },
  { id: "r13", category: "rzeczy", hint: "Tytuł serialu", a: "Jaki serial polecasz na jeden weekend?", b: "Jaki serial jest Twoim zdaniem przereklamowany?" },
  { id: "r14", category: "rzeczy", hint: "Jeden sprzęt", a: "Jaki sprzęt w kuchni przydaje się najbardziej?", b: "Jaki sprzęt w kuchni głównie zbiera kurz?" },
  { id: "r15", category: "rzeczy", hint: "Nazwa ciasta lub deseru", a: "Jakie ciasto wybierasz w kawiarni?", b: "Jakie ciasto pojawia się u Ciebie na święta?" },
  { id: "r16", category: "rzeczy", hint: "Jedno warzywo", a: "Jakie warzywo jest najbardziej niedoceniane?", b: "Jakie warzywo jesz najczęściej?" },
  { id: "r17", category: "rzeczy", hint: "Środek transportu", a: "Czym najchętniej jeździsz po mieście?", b: "Czym najchętniej jedziesz na wakacje?" },
  { id: "r18", category: "rzeczy", hint: "Jedna rzecz", a: "Na co wydajesz najwięcej pieniędzy poza jedzeniem?", b: "Na co najchętniej wydajesz niespodziewaną premię?" },
  { id: "r19", category: "rzeczy", hint: "Wykonawca lub zespół", a: "Jakiego wykonawcy słuchasz ostatnio najczęściej?", b: "Na czyj koncert idziesz bez zastanowienia?" },
  { id: "r20", category: "rzeczy", hint: "Jedna część garderoby", a: "Jakie ubranie nosisz najczęściej po domu?", b: "W jakim ubraniu jest Ci najwygodniej?" },

  // Miejsca i codzienne sytuacje
  { id: "m01", category: "miejsca", hint: "Nazwa kraju", a: "Jaki kraj chcesz odwiedzić jako następny?", b: "W jakim kraju możesz zamieszkać na rok?" },
  { id: "m02", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej się schować podczas zabawy w chowanego?", b: "Gdzie w domu najlepiej schować prezent?" },
  { id: "m03", category: "miejsca", hint: "Pomieszczenie", a: "W którym pomieszczeniu jesz najczęściej?", b: "W którym pomieszczeniu najczęściej korzystasz z telefonu?" },
  { id: "m04", category: "miejsca", hint: "Pora dnia", a: "O jakiej porze dnia masz najwięcej energii?", b: "Jaka pora dnia jest Twoją ulubioną?" },
  { id: "m05", category: "miejsca", hint: "Dzień tygodnia", a: "Który dzień tygodnia jest najlepszy?", b: "W który dzień tygodnia najlepiej umawiać spotkania?" },
  { id: "m06", category: "miejsca", hint: "Nazwa miesiąca", a: "Który miesiąc w roku jest najlepszy?", b: "W którym miesiącu najlepiej brać urlop?" },
  { id: "m07", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej smakuje jedzenie?", b: "Gdzie najlepiej smakuje kawa lub herbata?" },
  { id: "m08", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najczęściej gubisz rzeczy?", b: "Gdzie najczęściej znajdujesz zgubione rzeczy?" },
  { id: "m09", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najłatwiej poznać nowych ludzi?", b: "Gdzie najłatwiej spotkać kogoś znajomego?" },
  { id: "m10", category: "miejsca", hint: "Nazwa miasta", a: "Które polskie miasto jest najładniejsze?", b: "W którym polskim mieście najlepiej się mieszka?" },
  { id: "m11", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej przeczekać burzę?", b: "Gdzie najlepiej przeczekać godzinę do pociągu?" },
  { id: "m12", category: "miejsca", hint: "Jedna czynność", a: "Co robisz zaraz po przebudzeniu?", b: "Co robisz tuż przed snem?" },
  { id: "m13", category: "miejsca", hint: "Jedna czynność", a: "Co robisz, gdy nie możesz zasnąć?", b: "Co robisz, gdy się nudzisz?" },
  { id: "m14", category: "miejsca", hint: "Obowiązek domowy", a: "Jakiego obowiązku domowego nie lubisz najbardziej?", b: "Który obowiązek domowy zajmuje Ci najwięcej czasu?" },
  { id: "m15", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej usiąść na sali wykładowej?", b: "Gdzie najlepiej usiąść w pociągu?" },
  { id: "m16", category: "miejsca", hint: "Pora roku", a: "Która pora roku jest najładniejsza?", b: "W której porze roku masz najlepszy humor?" },
  { id: "m17", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej zjeść coś o północy?", b: "Gdzie najlepiej zjeść śniadanie poza domem?" },
  { id: "m18", category: "miejsca", hint: "Jedno miejsce", a: "Dokąd idziesz, gdy chcesz pobyć w ciszy?", b: "Dokąd idziesz, gdy chcesz przewietrzyć głowę?" },
  { id: "m19", category: "miejsca", hint: "Jedno miejsce", a: "Gdzie najlepiej świętować urodziny?", b: "Gdzie najlepiej świętować zdany egzamin?" },
  { id: "m20", category: "miejsca", hint: "Jedna czynność", a: "Co najpierw robisz po przyjeździe do nowego miasta?", b: "Co najpierw robisz po przyjeździe do hotelu?" },
];

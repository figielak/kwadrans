/** Hasła Kalambur: ogólne jednowyrazowe rzeczowniki, które da się narysować w 80 s. Bez powtórek (test sprawdza po `normalize`). */
export const WORDS = [
  // zwierzęta
  "kot", "pies", "koń", "krowa", "świnia", "owca", "kura", "kogut", "kaczka", "królik",
  "mysz", "jeż", "wiewiórka", "lis", "wilk", "niedźwiedź", "jeleń", "łoś", "bóbr", "żaba",
  "wąż", "żółw", "krokodyl", "słoń", "żyrafa", "zebra", "lew", "tygrys", "małpa", "goryl",
  "hipopotam", "nosorożec", "wielbłąd", "kangur", "panda", "pingwin", "foka", "mors", "wieloryb", "delfin",
  "rekin", "ośmiornica", "meduza", "krab", "rak", "ryba", "sowa", "orzeł", "papuga", "bocian",
  "łabędź", "paw", "flaming", "dzięcioł", "pszczoła", "motyl", "mrówka", "pająk", "ślimak", "biedronka",
  "gąsienica", "ważka", "nietoperz", "kret", "chomik", "leniwiec", "lama", "skorpion", "dinozaur",
  // jedzenie
  "jabłko", "gruszka", "banan", "cytryna", "arbuz", "truskawka", "wiśnia", "winogrono", "ananas", "kokos",
  "śliwka", "malina", "marchewka", "pomidor", "ogórek", "cebula", "papryka", "kukurydza", "brokuł", "dynia",
  "grzyb", "chleb", "bagietka", "rogalik", "ser", "jajko", "jajecznica", "kiełbasa", "szaszłyk", "pizza",
  "hamburger", "frytki", "naleśnik", "pierogi", "kebab", "tort", "babeczka", "lody", "lizak", "czekolada",
  "pączek", "gofr", "popcorn", "kanapka", "zupa", "makaron", "sushi", "kawa", "herbata", "miód",
  "precel", "ciastko", "galaretka",
  // dom
  "dom", "okno", "drzwi", "klucz", "kłódka", "dach", "komin", "schody", "balkon", "płot",
  "łóżko", "krzesło", "fotel", "kanapa", "stół", "szafa", "półka", "lampa", "świeca", "zegar",
  "budzik", "lustro", "wanna", "prysznic", "kran", "umywalka", "poduszka", "dywan", "firanka", "telewizor",
  "pilot", "telefon", "laptop", "klawiatura", "drukarka", "lodówka", "kuchenka", "mikrofalówka", "pralka", "odkurzacz",
  "żelazko", "czajnik", "garnek", "patelnia", "talerz", "kubek", "kieliszek", "łyżka", "widelec", "nóż",
  "miotła", "szczotka", "mydło", "ręcznik", "grzebień", "wieszak", "kosz", "wazon", "doniczka", "wentylator",
  "kaloryfer", "gniazdko", "żarówka", "bateria",
  // ubrania i dodatki
  "czapka", "kapelusz", "korona", "okulary", "szalik", "rękawiczki", "kurtka", "płaszcz", "sweter", "koszula",
  "krawat", "muszka", "spódnica", "sukienka", "spodnie", "szorty", "skarpetki", "buty", "kalosze", "klapki",
  "szpilki", "pasek", "plecak", "torebka", "pierścionek", "naszyjnik", "zegarek", "parasol", "walizka", "portfel",
  // transport i sport
  "samochód", "autobus", "tramwaj", "pociąg", "metro", "rower", "hulajnoga", "motocykl", "ciężarówka", "traktor",
  "koparka", "karetka", "taksówka", "samolot", "helikopter", "rakieta", "statek", "łódka", "kajak", "żaglówka",
  "balon", "spadochron", "deskorolka", "sanki", "narty", "łyżwy", "rolki", "wózek", "kierownica", "opona",
  "piłka", "bramka", "paletka", "kręgle", "szachy", "kostka", "karty", "puzzle", "medal", "puchar",
  "podium", "trampolina", "huśtawka", "zjeżdżalnia", "karuzela", "latawiec",
  // natura i miejsca
  "słońce", "księżyc", "gwiazda", "planeta", "kometa", "chmura", "deszcz", "tęcza", "piorun", "tornado",
  "śnieg", "bałwan", "sopel", "góra", "wulkan", "wyspa", "plaża", "fala", "rzeka", "wodospad",
  "jezioro", "las", "drzewo", "pień", "palma", "choinka", "kwiat", "róża", "tulipan", "słonecznik",
  "kaktus", "liść", "szyszka", "żołądź", "koniczyna", "ognisko", "kamień", "jaskinia", "pustynia", "most",
  "tunel", "wieża", "latarnia", "zamek", "kościół", "piramida", "namiot", "igloo", "studnia", "fontanna",
  "wiatrak", "stodoła", "szkoła", "szpital", "sklep", "kino", "cyrk", "stadion", "basen", "lotnisko",
  "cmentarz",
  // przedmioty
  "książka", "ołówek", "kredka", "pędzel", "linijka", "cyrkiel", "zeszyt", "koperta", "znaczek", "prezent",
  "gazeta", "gitara", "pianino", "bęben", "trąbka", "skrzypce", "harfa", "flet", "mikrofon", "aparat",
  "lornetka", "teleskop", "mikroskop", "kompas", "mapa", "globus", "flaga", "młotek", "śrubokręt", "piła",
  "gwóźdź", "śruba", "drabina", "łopata", "grabie", "siekiera", "wiadro", "konewka", "taczka", "wędka",
  "sieć", "kotwica", "miecz", "tarcza", "łuk", "strzała", "armata", "bomba", "skarb", "magnes",
  "termometr", "strzykawka", "plaster", "bandaż", "pieniądze", "moneta", "diament", "kajdanki", "klatka", "pułapka",
  "labirynt", "bombka", "pisanka", "znicz", "fajerwerki", "dzwon", "gwizdek", "lupa", "waga", "klepsydra",
  "kalendarz", "kalkulator", "nożyczki", "igła", "guzik", "sznurek", "węzeł", "kokarda", "wstążka",
  // postacie i ciało
  "pirat", "rycerz", "król", "księżniczka", "czarodziej", "czarownica", "duch", "wampir", "mumia", "szkielet",
  "zombie", "robot", "kosmita", "astronauta", "klaun", "policjant", "strażak", "lekarz", "kucharz", "malarz",
  "rybak", "górnik", "kowboj", "ninja", "syrena", "smok", "jednorożec", "anioł", "diabeł", "serce",
  "oko", "ucho", "nos", "usta", "ręka", "stopa", "ząb", "mózg", "wąsy", "broda",
  "warkocz",
] as const;

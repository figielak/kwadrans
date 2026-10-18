/** Hasła Kalambur: ogólne jednowyrazowe rzeczowniki, które da się narysować w 80 s. Bez powtórek (test sprawdza po `normalize`). */
export const WORDS = [
  // zwierzęta
  "kot", "pies", "koń", "krowa", "świnia", "owca", "koza", "kura", "kogut", "kaczka",
  "gęś", "indyk", "królik", "mysz", "szczur", "jeż", "wiewiórka", "lis", "wilk", "niedźwiedź",
  "dzik", "jeleń", "zając", "bóbr", "żaba", "wąż", "żółw", "jaszczurka", "krokodyl", "słoń",
  "żyrafa", "zebra", "lew", "tygrys", "małpa", "hipopotam", "nosorożec", "wielbłąd", "kangur", "koala",
  "panda", "pingwin", "foka", "wieloryb", "delfin", "rekin", "ośmiornica", "meduza", "krab", "ryba",
  "sowa", "orzeł", "papuga", "bocian", "łabędź", "gołąb", "flaming", "struś", "pszczoła", "motyl",
  "mrówka", "pająk", "ślimak", "biedronka", "komar", "nietoperz", "dinozaur", "smok", "jednorożec", "syrena",
  // jedzenie
  "jabłko", "gruszka", "banan", "cytryna", "pomarańcza", "arbuz", "truskawka", "wiśnia", "winogrono", "ananas",
  "marchewka", "ziemniak", "pomidor", "ogórek", "cebula", "czosnek", "kukurydza", "grzyb", "chleb", "bułka",
  "ser", "jajko", "kiełbasa", "pizza", "hamburger", "frytki", "hotdog", "naleśnik", "pierogi", "tort",
  "lody", "cukierek", "lizak", "czekolada", "pączek", "rogal", "popcorn", "kanapka", "zupa", "spaghetti",
  "kawa", "herbata", "mleko", "sok", "miód", "orzech", "precel", "sushi",
  // dom
  "dom", "okno", "drzwi", "klucz", "zamek", "dach", "komin", "schody", "łóżko", "krzesło",
  "stół", "szafa", "lampa", "świeca", "zegar", "budzik", "lustro", "wanna", "prysznic", "toaleta",
  "poduszka", "kołdra", "dywan", "telewizor", "pilot", "telefon", "komputer", "laptop", "klawiatura", "głośnik",
  "słuchawki", "lodówka", "piekarnik", "pralka", "odkurzacz", "żelazko", "czajnik", "garnek", "patelnia", "talerz",
  "kubek", "szklanka", "łyżka", "widelec", "nóż", "nożyczki", "parasol", "walizka", "torebka", "portfel",
  // ubrania
  "czapka", "kapelusz", "korona", "okulary", "szalik", "rękawiczki", "kurtka", "sweter", "koszula", "krawat",
  "spódnica", "sukienka", "spodnie", "skarpetki", "buty", "kalosze", "piżama", "bikini", "plecak", "pierścionek",
  // transport
  "samochód", "autobus", "tramwaj", "pociąg", "rower", "hulajnoga", "motocykl", "ciężarówka", "traktor", "karetka",
  "samolot", "helikopter", "rakieta", "statek", "łódka", "kajak", "żaglówka", "balon", "spadochron", "deskorolka",
  // natura i miejsca
  "słońce", "księżyc", "gwiazda", "chmura", "deszcz", "tęcza", "piorun", "śnieg", "bałwan", "wiatr",
  "góra", "wulkan", "wyspa", "plaża", "rzeka", "jezioro", "las", "drzewo", "palma", "kwiat",
  "róża", "tulipan", "słonecznik", "kaktus", "liść", "trawa", "ogień", "lód", "kamień", "jaskinia",
  "most", "wieża", "latarnia", "pałac", "kościół", "piramida", "namiot", "igloo", "studnia", "fontanna",
  // przedmioty i różne
  "książka", "ołówek", "długopis", "pędzel", "gumka", "linijka", "zeszyt", "list", "koperta", "prezent",
  "piłka", "rakietka", "bramka", "medal", "puchar", "gitara", "pianino", "bęben", "trąbka", "skrzypce",
  "mikrofon", "aparat", "lornetka", "kompas", "mapa", "flaga", "latawiec", "huśtawka", "zjeżdżalnia", "karuzela",
  "młotek", "śrubokręt", "piła", "gwóźdź", "drabina", "łopata", "grabie", "wiadro", "konewka", "taczka",
  "miecz", "tarcza", "łuk", "strzała", "armata", "kotwica", "skarb", "pirat", "rycerz", "czarownica",
  "duch", "robot", "kosmita", "astronauta", "klaun", "policjant", "strażak", "lekarz", "kucharz", "rolnik",
  "bombka", "choinka", "dynia", "pisanka", "serce", "uśmiech", "oko", "ucho", "nos", "ręka",
  "noga", "ząb", "szkielet", "czaszka", "mumia", "wampir", "anioł", "diabeł", "magnes", "żarówka",
] as const;

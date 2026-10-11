/** Para: słowo napisane poprawnie i to samo słowo z błędem ortograficznym. */
export type Pair = readonly [right: string, wrong: string];

// Błąd to zawsze jedna zamiana ó/u, rz/ż albo ch/h. Błędna forma nie może być prawdziwym słowem,
// dlatego nie ma tu par typu morze/może, lód/lud, hart/chart, duży/durzy.
export const PAIRS: readonly Pair[] = [
  // ó napisane jako u
  ["góra", "gura"], ["król", "krul"], ["wróbel", "wrubel"], ["ołówek", "ołuwek"], ["jaskółka", "jaskułka"],
  ["żółw", "żułw"], ["mróz", "mruz"], ["ogórek", "ogurek"], ["córka", "curka"], ["kłótnia", "kłutnia"],
  ["różnica", "rużnica"], ["podróż", "podruż"], ["wiewiórka", "wiewiurka"], ["źródło", "źrudło"], ["królik", "krulik"],
  ["stół", "stuł"], ["główny", "głuwny"], ["skóra", "skura"], ["wzór", "wzur"], ["próba", "pruba"],
  ["późno", "puźno"], ["równik", "ruwnik"], ["mózg", "muzg"], ["ogród", "ogrud"], ["powódź", "powudź"],
  ["zbiór", "zbiur"], ["kościół", "kościuł"], ["sójka", "sujka"], ["wójt", "wujt"], ["przepiórka", "przepiurka"],
  ["pagórek", "pagurek"], ["tułów", "tułuw"], ["pióro", "piuro"],
  // u napisane jako ó
  ["burak", "bórak"], ["kubek", "kóbek"], ["zasuwka", "zasówka"], ["skuwka", "skówka"], ["pustynia", "póstynia"],
  ["gruszka", "grószka"], ["kukułka", "kukółka"], ["bluza", "blóza"], ["sufit", "sófit"], ["guzik", "gózik"],
  ["kaptur", "kaptór"], ["ratunek", "ratónek"], ["rysunek", "rysónek"], ["biurko", "biórko"], ["mundur", "mundór"],
  ["struna", "stróna"], ["lektura", "lektóra"], ["kangur", "kangór"], ["bruzda", "brózda"], ["żuraw", "żóraw"],
  ["futro", "fótro"], ["szczupak", "szczópak"], ["dłuto", "dłóto"], ["papuga", "papóga"],
  // rz napisane jako ż
  ["rzeka", "żeka"], ["burza", "buża"], ["krzesło", "kżesło"], ["drzewo", "dżewo"], ["warzywo", "ważywo"],
  ["jarzębina", "jażębina"], ["harcerz", "harceż"], ["rzeżucha", "żeżucha"], ["korzeń", "kożeń"], ["orzech", "ożech"],
  ["talerz", "tależ"], ["kołnierz", "kołnież"], ["wierzba", "wieżba"], ["przyjaciel", "pżyjaciel"], ["grzyb", "gżyb"],
  ["brzuch", "bżuch"], ["trzcina", "tżcina"], ["rzemień", "żemień"], ["rzodkiew", "żodkiew"], ["rzęsa", "żęsa"],
  ["wrzesień", "wżesień"], ["pasterz", "pasteż"], ["lekarz", "lekaż"], ["piekarz", "piekaż"], ["malarz", "malaż"],
  ["kalendarz", "kalendaż"], ["zwierzę", "zwieżę"], ["powietrze", "powietże"], ["jarzyna", "jażyna"], ["tchórz", "tchóż"],
  ["uderzenie", "udeżenie"], ["korzyść", "kożyść"], ["wybrzeże", "wybżeże"],
  // ż napisane jako rz
  ["żaba", "rzaba"], ["żyrafa", "rzyrafa"], ["róża", "rórza"], ["plaża", "plarza"], ["książka", "ksiąrzka"],
  ["łyżka", "łyrzka"], ["nożyce", "norzyce"], ["kożuch", "korzuch"], ["jeżyna", "jerzyna"], ["pożar", "porzar"],
  ["żołądź", "rzołądź"], ["żagiel", "rzagiel"], ["bagaż", "bagarz"], ["garaż", "gararz"], ["pejzaż", "pejzarz"],
  ["młodzież", "młodzierz"], ["wróżka", "wrórzka"], ["drużyna", "drurzyna"], ["żołnierz", "rzołnierz"], ["mżawka", "mrzawka"],
  ["łóżko", "łórzko"], ["ciężar", "cięrzar"], ["dyżur", "dyrzur"], ["żubr", "rzubr"], ["leżak", "lerzak"],
  ["wstążka", "wstąrzka"], ["każdy", "karzdy"],
  // h napisane jako ch
  ["hałas", "chałas"], ["herbata", "cherbata"], ["humor", "chumor"], ["huragan", "churagan"], ["bohater", "bochater"],
  ["wahadło", "wachadło"], ["hamulec", "chamulec"], ["hotel", "chotel"], ["hodowla", "chodowla"], ["honor", "chonor"],
  ["historia", "chistoria"], ["huśtawka", "chuśtawka"], ["horyzont", "choryzont"], ["hymn", "chymn"], ["handel", "chandel"],
  ["hejnał", "chejnał"], ["haczyk", "chaczyk"], ["hiena", "chiena"], ["hipopotam", "chipopotam"], ["higiena", "chigiena"],
  ["hurtownia", "churtownia"], ["wataha", "watacha"], ["druh", "druch"], ["błahy", "błachy"], ["hultaj", "chultaj"],
  ["hańba", "chańba"], ["harmonia", "charmonia"], ["hangar", "changar"], ["hrabia", "chrabia"], ["herb", "cherb"],
  // ch napisane jako h
  ["chleb", "hleb"], ["chmiel", "hmiel"], ["chomik", "homik"], ["chusteczka", "husteczka"], ["chirurg", "hirurg"],
  ["chłopiec", "hłopiec"], ["chodnik", "hodnik"], ["choinka", "hoinka"], ["choroba", "horoba"], ["chrzan", "hrzan"],
  ["marchew", "marhew"], ["mucha", "muha"], ["zapach", "zapah"], ["kuchnia", "kuhnia"], ["wachlarz", "wahlarz"],
  ["schody", "shody"], ["pochwała", "pohwała"], ["uchwyt", "uhwyt"], ["chuligan", "huligan"], ["chrabąszcz", "hrabąszcz"],
  ["strach", "strah"], ["groch", "groh"], ["słuchawka", "słuhawka"], ["puchar", "puhar"], ["suchar", "suhar"],
  ["wychowawca", "wyhowawca"], ["chałwa", "hałwa"], ["charakter", "harakter"], ["chemia", "hemia"], ["chaos", "haos"],
  ["chytry", "hytry"], ["chwila", "hwila"], ["chwast", "hwast"], ["chrapanie", "hrapanie"],
];

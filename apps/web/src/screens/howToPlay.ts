import {
  KALAMBURY_HALF_SECONDS,
  KAMPUS_ROUNDS,
  KRESKI_TURN_SECONDS,
  PM_ANSWER_MAX,
  PM_CATEGORIES,
  PODROBKA_ROUNDS,
  PODROBKA_VOTE_SECONDS,
  PODROBKA_WRITE_SECONDS,
  SABOTAZ_ROUNDS,
  SABOTAZ_SAFE_CARDS,
  SABOTAZ_SUCCESS_POINTS,
  SABOTAZ_TRAP_CARDS,
  SABOTAZ_TRAP_POINTS,
  WYPRAWA_DECISION_SECONDS,
  WYPRAWA_EXPEDITIONS,
} from "@kwadrans/games";

/** Karta „Jak grać”: cel, przebieg, punktacja i nieoczywiste pułapki. Treść dla gracza, nie kopia ZASADY-GIER.md. */
export type HowToPlay = { goal: string; flow: string[]; scoring: string[]; watch: string[] };

export const HOW_TO_PLAY: Record<string, HowToPlay> = {
  sabotaz: {
    goal: `Zdobądź najwięcej punktów w ${SABOTAZ_ROUNDS} rundach. Nikt nie odpada, każda runda zaczyna się od nowa.`,
    flow: [
      `Co rundę dostajesz ${SABOTAZ_SAFE_CARDS} Przejścia i ${SABOTAZ_TRAP_CARDS} Pułapkę. Wszyscy naraz kładą potajemnie jedną kartę na swój stos.`,
      "W swojej turze dokładasz kartę na wierzch stosu albo otwierasz licytację: ile Przejść odkryjesz.",
      "Podbijasz albo pasujesz. Kto zostanie, odkrywa tyle kart, ile zadeklarował: najpierw własny stos od góry, potem wierzchy cudzych stosów.",
    ],
    scoring: [
      `Udana deklaracja daje licytującemu ${SABOTAZ_SUCCESS_POINTS} pkt. Cudza Pułapka daje jej właścicielowi ${SABOTAZ_TRAP_POINTS} pkt, a własna nikomu nic.`,
    ],
    watch: [
      "Cel mniejszy od własnego stosu nie odkrywa reszty, więc Pułapka pod wierzchem może zostać ukryta.",
      "Po pierwszej deklaracji nie można już dokładać kart, a pas dotyczy tylko tej licytacji.",
    ],
  },
  wyprawa: {
    goal: `Wróć z jak największym bankiem po ${WYPRAWA_EXPEDITIONS} wyprawach.`,
    flow: [
      "Wszyscy idą jednym szlakiem. Każda odkryta karta to skarb, dzielony po równo między osoby na szlaku, albo zagrożenie.",
      `Po każdej karcie tajnie wybierasz „Idę dalej” albo „Wracam” i zatwierdzasz „Gotowe”. Masz ${WYPRAWA_DECISION_SECONDS} s.`,
      "Kto wraca, chowa niesioną zdobycz do banku i dzieli z innymi wracającymi resztki skarbów, których nie dało się podzielić.",
    ],
    scoring: ["Wygrywa największy bank. Bank jest bezpieczny, zdobycz niesiona na szlaku nie."],
    watch: [
      "Pierwsze zagrożenie tylko ostrzega. Drugie takie samo kończy wyprawę, a kto został na szlaku, traci niesioną zdobycz.",
      "Bez „Gotowe” liczy się „Wracam”, także po upływie czasu.",
    ],
  },
  podrobka: {
    goal: `Wykryj osobę z innym pytaniem, a jeśli to ty, uniknij wykrycia. Gra trwa ${PODROBKA_ROUNDS} rund.`,
    flow: [
      `Każdy odpowiada na swoje pytanie (${PODROBKA_WRITE_SECONDS} s). Jedna osoba, Podróbka, dostała inne, ale podobne.`,
      "Widzicie wszystkie odpowiedzi z nickami i rozmawiacie o nich.",
      `Tajnie głosujecie na podejrzanego (${PODROBKA_VOTE_SECONDS} s). Potem odsłona pytań i Podróbki.`,
    ],
    scoring: [
      "Własny głos na Podróbkę daje 2 pkt, nawet gdy grupa jej nie wykryła. Niewykryta Podróbka dostaje 3 pkt, jeśli sama zagłosowała.",
    ],
    watch: [
      "Podróbka jest wykryta tylko wtedy, gdy ma samodzielnie najwięcej głosów i co najmniej 2. Remis na prowadzeniu oznacza ucieczkę.",
      "Broń odpowiedzi, nie cytuj swojego pytania. Brak odpowiedzi od kogokolwiek anuluje rundę: wszyscy dostają 0.",
    ],
  },
  "kropki-i-kreski": {
    goal: "Zamknij więcej kwadratów niż rywale.",
    flow: [
      `Na planszy z kropek rysujecie po kolei jedną kreskę między sąsiednimi kropkami. Na ruch masz ${KRESKI_TURN_SECONDS} s.`,
      "Dotknij kreski, żeby ją wybrać, i potwierdź ruch.",
      "Kto zamknie kwadrat, bierze go w swoim kolorze i rysuje kolejną kreskę.",
    ],
    scoring: ["Kreska zamykająca dwa kwadraty naraz daje dwa punkty. Wygrywa najwięcej kwadratów, a remis na szczycie oznacza brak zwycięzcy."],
    watch: [
      "Trzecia kreska przy kwadracie oddaje go rywalowi, który zamknie go czwartą.",
      "Kolejny ruch po zamknięciu kwadratu jest obowiązkowy, a po limicie czasu kreska pojawia się sama.",
    ],
  },
  "piec-w-rzedzie": {
    goal: "Ułóż w linii pięć swoich kamieni, zanim zrobi to rywal.",
    flow: ["Na planszy 15×15 stawiacie kamienie na zmianę. Zaczyna pierwszy gracz z listy.", "Linia może biec poziomo, pionowo albo po skosie."],
    scoring: ["Wygrywa ten, kto pierwszy ma pięć lub więcej kamieni w linii."],
    watch: ["Dłuższa linia też wygrywa: sześć w rzędzie się liczy.", "Pełna plansza bez linii to remis. Po czasie na ruch kamień ląduje na losowym wolnym polu."],
  },
  statki: {
    goal: "Zatop całą flotę rywala, zanim on zatopi twoją.",
    flow: [
      "Najpierw rozstawiasz statki: przenosisz je, obracasz albo losujesz od nowa, potem zgłaszasz gotowość. Rozstawianie ma jeden wspólny limit czasu.",
      "Potem strzelacie na zmianę w pola planszy rywala. Pudło oddaje turę, a trafienie daje kolejny strzał.",
    ],
    scoring: ["Wygrywa ten, kto pierwszy zatopi wszystkie statki rywala."],
    watch: [
      "Statki nie mogą się dotykać, nawet rogami, chyba że tryb dopuszcza stykanie.",
      "Wokół zatopionego statku pola są oznaczone i nie da się w nie strzelić (w trybie ze stykaniem tego nie ma).",
    ],
  },
  chinczyk: {
    goal: "Doprowadź wszystkie cztery pionki do domku końcowego.",
    flow: [
      "Rzucasz jedną kostką. Z domku startowego pionek wychodzi tylko na 6.",
      "Prowadzisz pionek o tyle pól, ile oczek. Stając na pionku rywala, odsyłasz go do domku startowego.",
      "Szóstka daje kolejny rzut, ale trzecia z rzędu kończy turę bez ruchu.",
    ],
    scoring: [
      "Kończysz, gdy wszystkie 4 pionki są w domku końcowym. Gra toczy się do pełnego rankingu.",
      "Tryb Szybki kończy się, gdy ktoś ma 3 pionki w domku końcowym.",
    ],
    watch: [
      "Ruch musi zmieścić się w torze i nie wolno stanąć na własnym pionku.",
      "Pole startowe z pionkiem właściciela jest bezpieczne: rywal nie może na nim stanąć.",
      "Szybki: jeden pionek stoi już na starcie, z domku wychodzi się na 1 albo 6, a zbicie i wejście do domku dają dodatkowy rzut.",
    ],
  },
  memory: {
    goal: "Zbierz najwięcej par jednakowych kart.",
    flow: ["Karty leżą zakryte na wspólnej planszy. W swojej turze odkrywasz dwie.", "Para zostaje u ciebie i grasz dalej. Pudło oddaje turę, a obie karty chwilę widać."],
    scoring: ["Wygrywa najwięcej par. Remis na pierwszym miejscu oznacza brak zwycięzcy."],
    watch: ["Pamiętaj karty rywali: pudła widzą wszyscy.", "Nie można odkryć zebranej karty ani drugi raz tej samej w jednej turze."],
  },
  kalambury: {
    goal: "Zdobądź najwięcej punktów, rysując hasła i zgadując cudze.",
    flow: [
      "Rysujecie po kolei. Rysujący wybiera jedno z trzech haseł i rysuje palcem, reszta wpisuje zgadnięcia na czacie.",
      `Rysowanie ma dwie połowy po ${KALAMBURY_HALF_SECONDS} s. Po pierwszej odsłania się jedna litera hasła.`,
      "Runda kończy się, gdy wszyscy zgadną albo spasują.",
    ],
    scoring: ["Zgadujący dostają 10, 8, 6, 5, 4 pkt według kolejności trafień, a rysujący 3 pkt za każdego, kto zgadł."],
    watch: [
      "Każda faza ma własny limit: wybór hasła, pierwsza połowa, druga połowa i odsłona.",
      "Kto spasuje albo zgadnie, nie strzela dalej. Rysujący może cofnąć wyczyszczony rysunek.",
    ],
  },
  labirynt: {
    goal: "Pierwszy dojdź pionkiem na przeciwległą krawędź planszy.",
    flow: [
      "W swojej turze wybierasz jedno: krok pionkiem o pole albo ściankę o długości 2 pól.",
      "Pionek nie przechodzi przez ścianki. Rywala stojącego obok przeskakujesz prosto, a gdy za nim jest przeszkoda, stajesz skośnie.",
    ],
    scoring: ["Wygrywa ten, kto pierwszy stanie na polu celu. Remisu nie ma."],
    watch: [
      "Ścianka nie może nikomu całkiem zamknąć drogi do celu ani nachodzić na inną.",
      "Ścianek w puli jest mało i się kończą. Po czasie na ruch pionek robi losowy krok.",
    ],
  },
  "panstwa-miasta": {
    goal: "Zdobądź najwięcej punktów w 5 rundach, wpisując odpowiedzi na wylosowaną literę.",
    flow: [
      `W każdej rundzie jest inna litera i ${PM_CATEGORIES.length} kategorii: ${PM_CATEGORIES.join(", ")}. Odpowiedź ma do ${PM_ANSWER_MAX} znaków.`,
      "Wszyscy piszą naraz. Kto pierwszy odda kartkę, daje STOP, a reszta ma wtedy niewiele czasu.",
      "Potem głosowanie: odrzucasz cudze odpowiedzi, które uważasz za błędne. Odpada ta, którą odrzuci ponad połowa pozostałych.",
    ],
    scoring: ["Za kategorię: 15 pkt za jedyną ważną odpowiedź, 10 za unikalną, 5 za powtórzoną, 0 za brak lub odrzuconą."],
    watch: [
      "Każda faza ma własny limit czasu, a STOP odlicza go od nowa.",
      "Powtórką jest też odpowiedź różniąca się tylko wielkością liter albo polskimi znakami.",
      "Brak głosu w czasie oznacza, że niczego nie odrzucasz.",
    ],
  },
  "kampus-tour": {
    goal: `Zostań ostatnim wypłacalnym graczem, zbierz 3 pełne grupy pól albo miej największy majątek po ${KAMPUS_ROUNDS} rundach.`,
    flow: [
      "Rzucasz dwiema kośćmi i idziesz o sumę oczek. Przejście przez Początek daje kieszonkowe. Dublet daje kolejny rzut, a trzeci z rzędu wysyła na Kolokwium.",
      "Wolne pole możesz kupić. Własne rozbudowujesz, ale tylko gdy na nim stoisz. Za cudze płacisz czynsz właścicielowi.",
      "Po zapłaceniu czynszu możesz wykupić cudze pole za dwukrotną wartość. Budynki zostają, landmarku wykupić nie można.",
      "Pola specjalne: Karty Dziekanatu dają zysk albo opłatę, Juwenalia mnożą czynsz jednego twojego pola, Bilet MPK pozwala w następnej turze skoczyć na dowolne pole, a z Kolokwium wychodzisz dubletem albo po straconej turze.",
    ],
    scoring: [
      "Czynsz rośnie z każdym poziomem budynków, a pełna grupa kolorów podwaja go na pustym polu. Szczegóły pola zobaczysz po dotknięciu go na planszy.",
      `Wygrywa ostatni wypłacalny albo ten, kto zbierze 3 pełne grupy (od razu). Po ${KAMPUS_ROUNDS} rundach wygrywa największy majątek: gotówka i wartość pól z budynkami.`,
    ],
    watch: [
      "Bez pełnej grupy zbudujesz najwyżej poziom 2. Poziom 3 i landmark wymagają kompletu.",
      "Gdy brakuje gotówki, sprzedajesz pola bankowi za połowę wartości. Jeśli to nie wystarczy, bankrutujesz.",
      "Bilet MPK nie daje kieszonkowego za Początek, a zwykły rzut zużywa niewykorzystany bilet.",
    ],
  },
};

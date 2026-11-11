import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";

export const ROUNDS = 10;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2025;
/** Limit rundy na kliencie: po nim zatwierdza się rok ustawiony na suwaku. */
export const ROUND_MS = 20000;
/** Tyle ms widać prawdziwy rok, potem sama wskakuje następna runda. */
export const REVEAL_MS = 2500;

export type Event = { text: string; year: number };

/** Pusta lista = limit czasu (w każdej rundzie najgorszy możliwy błąd). */
export type Move = { type: "result"; answers: number[] } | { type: "progress"; done: number };

export interface State {
  players: PlayerId[];
  events: Event[];
  /** Suma odchyłek w latach. */
  results: Record<PlayerId, number>;
  answers: Record<PlayerId, number[]>;
  /** Ile rund gracz już odpowiedział (1-9), zgłaszane przez klienta; tylko do podglądu u rywali. */
  progress: Record<PlayerId, number>;
}

export type View = State;

// 10 × (20 s + 2,5 s odsłony) + 3 s sieci = 228 s; zapas 42 s (wyjątek progu 20%, ZASADY §3).
const TURN_SECONDS = 270;

/** Największy błąd, jaki da się zrobić w rundzie: dalszy koniec suwaka. */
const worst = (year: number) => Math.max(year - MIN_YEAR, MAX_YEAR - year);

// Pula wydarzeń z jednoznacznym rokiem w czterech działach; tekst nie zdradza roku (żadnej czterocyfrowej liczby).
// Premiera = rok pierwszej premiery na świecie. Dopisując pozycję, sprawdź datę w źródle.
export const EVENTS: Event[] = [
  // Historia świata
  { text: "Wręczenie pierwszych Nagród Nobla", year: 1901 },
  { text: "Roald Amundsen zdobywa biegun południowy", year: 1911 },
  { text: "Zatonięcie Titanica", year: 1912 },
  { text: "Zamach w Sarajewie na arcyksięcia Franciszka Ferdynanda", year: 1914 },
  { text: "Otwarcie Kanału Panamskiego", year: 1914 },
  { text: "Podpisanie traktatu wersalskiego", year: 1919 },
  { text: "Howard Carter odkrywa grobowiec Tutanchamona", year: 1922 },
  { text: "Charles Lindbergh samotnie przelatuje nad Atlantykiem", year: 1927 },
  { text: "Czarny czwartek na Wall Street", year: 1929 },
  { text: "Katastrofa sterowca Hindenburg", year: 1937 },
  { text: "Kapitulacja Niemiec i koniec II wojny światowej w Europie", year: 1945 },
  { text: "Indie uzyskują niepodległość", year: 1947 },
  { text: "Proklamacja Chińskiej Republiki Ludowej", year: 1949 },
  { text: "Wybuch wojny koreańskiej", year: 1950 },
  { text: "Koronacja królowej Elżbiety II", year: 1953 },
  { text: "Edmund Hillary i Tenzing Norgay zdobywają Mount Everest", year: 1953 },
  { text: "Fidel Castro przejmuje władzę na Kubie", year: 1959 },
  { text: "Martin Luther King wygłasza przemówienie „I have a dream”", year: 1963 },
  { text: "Praska Wiosna i inwazja wojsk Układu Warszawskiego", year: 1968 },
  { text: "Zamach na igrzyskach olimpijskich w Monachium", year: 1972 },
  { text: "Richard Nixon ustępuje po aferze Watergate", year: 1974 },
  { text: "Rewolucja islamska w Iranie", year: 1979 },
  { text: "Zamach na Jana Pawła II na placu św. Piotra", year: 1981 },
  { text: "Wojna o Falklandy", year: 1982 },
  { text: "Katastrofa promu kosmicznego Challenger", year: 1986 },
  { text: "Masakra na placu Tiananmen", year: 1989 },
  { text: "Nelson Mandela wychodzi z więzienia", year: 1990 },
  { text: "Irak najeżdża Kuwejt", year: 1990 },
  { text: "Ludobójstwo w Rwandzie", year: 1994 },
  { text: "Hongkong wraca do Chin", year: 1997 },
  { text: "Zamachy z 11 września", year: 2001 },
  { text: "Amerykańska inwazja na Irak i obalenie Saddama Husajna", year: 2003 },
  { text: "Huragan Katrina zalewa Nowy Orlean", year: 2005 },
  { text: "Upadek banku Lehman Brothers", year: 2008 },
  { text: "Arabska Wiosna: Hosni Mubarak traci władzę w Egipcie", year: 2011 },
  { text: "Jorge Bergoglio zostaje papieżem Franciszkiem", year: 2013 },
  { text: "Rosja anektuje Krym", year: 2014 },
  { text: "Donald Trump po raz pierwszy wygrywa wybory prezydenckie", year: 2016 },
  { text: "Szturm na Kapitol w Waszyngtonie", year: 2021 },
  { text: "Śmierć królowej Elżbiety II", year: 2022 },
  // Historia Polski
  { text: "Maria Skłodowska-Curie dostaje pierwszą Nagrodę Nobla", year: 1903 },
  { text: "Literacka Nagroda Nobla dla Henryka Sienkiewicza", year: 1905 },
  { text: "Polska odzyskuje niepodległość", year: 1918 },
  { text: "Zaślubiny Polski z morzem w Pucku", year: 1920 },
  { text: "Bitwa Warszawska", year: 1920 },
  { text: "Zabójstwo prezydenta Gabriela Narutowicza", year: 1922 },
  { text: "Władysław Reymont dostaje Nagrodę Nobla za „Chłopów”", year: 1924 },
  { text: "Reforma Grabskiego: złoty zastępuje markę polską", year: 1924 },
  { text: "Przewrót majowy", year: 1926 },
  { text: "Żwirko i Wigura wygrywają zawody lotnicze Challenge", year: 1932 },
  { text: "Niemcy napadają na Polskę, wybuch II wojny światowej", year: 1939 },
  { text: "Bitwa o Monte Cassino", year: 1944 },
  { text: "Wybuch powstania warszawskiego", year: 1944 },
  { text: "Polski Październik: Władysław Gomułka wraca do władzy", year: 1956 },
  { text: "Obchody tysiąclecia państwa polskiego", year: 1966 },
  { text: "Remis na Wembley daje Polsce awans na mundial", year: 1973 },
  { text: "Rusza produkcja Fiata 126p, czyli Malucha", year: 1973 },
  { text: "Polscy siatkarze zdobywają olimpijskie złoto w Montrealu", year: 1976 },
  { text: "Mirosław Hermaszewski leci w kosmos", year: 1978 },
  { text: "Karol Wojtyła zostaje papieżem", year: 1978 },
  { text: "Władysław Kozakiewicz zdobywa złoto w Moskwie i pokazuje słynny gest", year: 1980 },
  { text: "Literacka Nagroda Nobla dla Czesława Miłosza", year: 1980 },
  { text: "Strajk w Stoczni Gdańskiej i powstanie Solidarności", year: 1980 },
  { text: "Wprowadzenie stanu wojennego", year: 1981 },
  { text: "Polska trzecia na mundialu w Hiszpanii", year: 1982 },
  { text: "Częściowo wolne wybory 4 czerwca", year: 1989 },
  { text: "Plan Balcerowicza wchodzi w życie", year: 1990 },
  { text: "Ostatnie rosyjskie wojska opuszczają Polskę", year: 1993 },
  { text: "Aleksander Kwaśniewski wygrywa wybory z Lechem Wałęsą", year: 1995 },
  { text: "Uchwalenie obecnej Konstytucji RP", year: 1997 },
  { text: "Andrzej Wajda odbiera Oscara za całokształt twórczości", year: 2000 },
  { text: "Polska wstępuje do Unii Europejskiej", year: 2004 },
  { text: "Justyna Kowalczyk zdobywa olimpijskie złoto w Vancouver", year: 2010 },
  { text: "Katastrofa smoleńska", year: 2010 },
  { text: "Euro w Polsce i na Ukrainie", year: 2012 },
  { text: "Polscy siatkarze zostają mistrzami świata w katowickim Spodku", year: 2014 },
  { text: "Robert Lewandowski strzela pięć goli w dziewięć minut", year: 2015 },
  { text: "Ogłoszenie literackiej Nagrody Nobla dla Olgi Tokarczuk", year: 2019 },
  { text: "Iga Świątek wygrywa Wimbledon", year: 2025 },
  { text: "Sławosz Uznański-Wiśniewski leci na Międzynarodową Stację Kosmiczną", year: 2025 },
  // Wynalazki i technologia
  { text: "Guglielmo Marconi przesyła sygnał radiowy przez Atlantyk", year: 1901 },
  { text: "Pierwszy lot samolotu braci Wright", year: 1903 },
  { text: "Louis Blériot przelatuje samolotem nad kanałem La Manche", year: 1909 },
  { text: "Einstein ogłasza ogólną teorię względności", year: 1915 },
  { text: "John Logie Baird pokazuje działającą telewizję", year: 1926 },
  { text: "Alexander Fleming odkrywa penicylinę", year: 1928 },
  { text: "Otwarcie Empire State Building", year: 1931 },
  { text: "Otwarcie mostu Golden Gate", year: 1937 },
  { text: "Trinity, pierwsza próbna eksplozja bomby atomowej", year: 1945 },
  { text: "Wynalezienie tranzystora w Bell Labs", year: 1947 },
  { text: "Chuck Yeager przekracza barierę dźwięku", year: 1947 },
  { text: "Pies Łajka leci na orbitę", year: 1957 },
  { text: "Powstanie NASA", year: 1958 },
  { text: "Walentina Tierieszkowa pierwszą kobietą w kosmosie", year: 1963 },
  { text: "Pierwszy przeszczep serca u człowieka", year: 1967 },
  { text: "Lądowanie Apollo 11 na Księżycu", year: 1969 },
  { text: "Pierwsze połączenie w sieci ARPANET", year: 1969 },
  { text: "Pierwsza rozmowa z ręcznego telefonu komórkowego", year: 1973 },
  { text: "Ernő Rubik wymyśla kostkę Rubika", year: 1974 },
  { text: "Powstanie Microsoftu", year: 1975 },
  { text: "Powstanie firmy Apple", year: 1976 },
  { text: "Start sond Voyager", year: 1977 },
  { text: "Narodziny Louise Brown, pierwszego dziecka z in vitro", year: 1978 },
  { text: "Pierwsze płyty CD trafiają do sklepów", year: 1982 },
  { text: "Premiera Windowsa 1.0", year: 1985 },
  { text: "Tim Berners-Lee proponuje stworzenie sieci WWW", year: 1989 },
  { text: "Linus Torvalds ogłasza pierwszą wersję Linuksa", year: 1991 },
  { text: "Premiera Windowsa 95", year: 1995 },
  { text: "Start serwisu Allegro", year: 1999 },
  { text: "Pierwsi stali mieszkańcy na Międzynarodowej Stacji Kosmicznej", year: 2000 },
  { text: "Start Wikipedii", year: 2001 },
  { text: "Katastrofa wahadłowca Columbia", year: 2003 },
  { text: "Start Skype'a", year: 2003 },
  { text: "Powstanie Facebooka", year: 2004 },
  { text: "Pierwszy film na YouTubie", year: 2005 },
  { text: "Pluton traci status planety", year: 2006 },
  { text: "Premiera pierwszego iPhone'a", year: 2007 },
  { text: "Uruchomienie Wielkiego Zderzacza Hadronów", year: 2008 },
  { text: "Otwarcie wieżowca Burdż Chalifa w Dubaju", year: 2010 },
  { text: "Felix Baumgartner skacze ze stratosfery", year: 2012 },
  { text: "Lądownik Philae sondy Rosetta siada na komecie", year: 2014 },
  { text: "Sonda New Horizons mija Plutona", year: 2015 },
  { text: "Pierwszy załogowy lot kapsuły Crew Dragon", year: 2020 },
  { text: "Premiera ChatGPT", year: 2022 },
  { text: "Indyjski lądownik Chandrayaan-3 siada na Księżycu", year: 2023 },
  // Popkultura i sport
  { text: "„Parowiec Willie”, pierwszy film dźwiękowy z Myszką Miki", year: 1928 },
  { text: "Pierwsza ceremonia rozdania Oscarów", year: 1929 },
  { text: "Pierwsze mistrzostwa świata w piłce nożnej w Urugwaju", year: 1930 },
  { text: "Jesse Owens zdobywa cztery złote medale na igrzyskach w Berlinie", year: 1936 },
  { text: "Pierwszy komiks z Supermanem", year: 1938 },
  { text: "Otwarcie Disneylandu w Kalifornii", year: 1955 },
  { text: "Pierwszy Konkurs Piosenki Eurowizji", year: 1956 },
  { text: "Lalka Barbie trafia do sklepów", year: 1959 },
  { text: "Beatlesi wydają pierwszy album „Please Please Me”", year: 1963 },
  { text: "Pierwszy festiwal piosenki w Opolu", year: 1963 },
  { text: "Premiera filmu „Sami swoi”", year: 1967 },
  { text: "Pierwszy odcinek „Reksia”", year: 1967 },
  { text: "Rozpad zespołu The Beatles", year: 1970 },
  { text: "ABBA wygrywa Eurowizję piosenką „Waterloo”", year: 1974 },
  { text: "Queen wydaje „Bohemian Rhapsody”", year: 1975 },
  { text: "Premiera gry „Pac-Man”", year: 1980 },
  { text: "Start stacji MTV", year: 1981 },
  { text: "„Ręka Boga” Maradony na mundialu w Meksyku", year: 1986 },
  { text: "Premiera filmu „Dirty Dancing”", year: 1987 },
  { text: "Premiera „Psów” Władysława Pasikowskiego", year: 1992 },
  { text: "Koszykarski Dream Team na igrzyskach w Barcelonie", year: 1992 },
  { text: "Premiera „Listy Schindlera”", year: 1993 },
  { text: "Edyta Górniak zajmuje drugie miejsce na Eurowizji", year: 1994 },
  { text: "Premiera „Forresta Gumpa”", year: 1994 },
  { text: "Spice Girls wydają singiel „Wannabe”", year: 1996 },
  { text: "Premiera pierwszych gier „Pokémon” w Japonii", year: 1996 },
  { text: "Premiera filmu „Kiler”", year: 1997 },
  { text: "Francja wygrywa mundial na własnych stadionach", year: 1998 },
  { text: "Premiera „Ogniem i mieczem” Jerzego Hoffmana", year: 1999 },
  { text: "Premiera gry „The Sims”", year: 2000 },
  { text: "Premiera filmu „Harry Potter i Kamień Filozoficzny”", year: 2001 },
  { text: "Premiera gry „World of Warcraft”", year: 2004 },
  { text: "Zinédine Zidane uderza głową Marco Materazziego w finale mundialu", year: 2006 },
  { text: "Usain Bolt bije rekord świata na 100 m wynikiem 9,58 s", year: 2009 },
  { text: "Premiera „Krainy lodu”", year: 2013 },
  { text: "„Ida” Pawła Pawlikowskiego dostaje Oscara", year: 2015 },
  { text: "Pierwszy sezon „Wiedźmina” na Netfliksie", year: 2019 },
  { text: "„Parasite” dostaje Oscara za najlepszy film", year: 2020 },
  { text: "Argentyna z Leo Messim wygrywa mundial w Katarze", year: 2022 },
  { text: "Taylor Swift rusza w trasę The Eras Tour", year: 2023 },
  { text: "Igrzyska olimpijskie w Paryżu", year: 2024 },
];

// ponytail: lata są w widoku od startu (jak kropki i cele w Kolorze), da się podejrzeć; między znajomymi wystarczy.
export const rok: GameDefinition<State, Move> = {
  id: "rok",
  name: "Który rok?",
  minPlayers: 1,
  maxPlayers: 6,
  live: { kind: "round", total: ROUNDS },
  turnSeconds: TURN_SECONDS,
  // Stały klucz: ruch progress nie odnawia limitu, nawet gdy gra już tylko jedna osoba.
  turn: () => ({ key: "run", seconds: TURN_SECONDS }),
  moveSchema: z.discriminatedUnion("type", [
    z.object({ type: z.literal("result"), answers: z.array(z.number()).max(ROUNDS) }),
    z.object({ type: z.literal("progress"), done: z.number() }),
  ]),

  setup: (players, rng) => ({
    players,
    events: shuffle(EVENTS, rng).slice(0, ROUNDS),
    results: {},
    answers: {},
    progress: {},
  }),

  validateMove: (state, player, move) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (move.type === "progress"
      ? Number.isInteger(move.done) && move.done >= 1 && move.done < ROUNDS
      : move.answers.length === 0 || (move.answers.length === ROUNDS && move.answers.every((year) => Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR))),

  applyMove: (state, player, move) =>
    move.type === "progress"
      ? { ...state, progress: { ...state.progress, [player]: move.done } }
      : {
          ...state,
          results: {
            ...state.results,
            [player]: state.events.reduce((s, e, i) => s + (move.answers.length ? Math.abs(move.answers[i] - e.year) : worst(e.year)), 0),
          },
          answers: { ...state.answers, [player]: move.answers },
        },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => a - b, { lower: true, score: (r) => r }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", answers: [] }),
};

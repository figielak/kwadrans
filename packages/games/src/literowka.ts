import { averageMs, byScoreThenAverage, type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";
import { type Pair, PAIRS } from "./literowka-dane.ts";
import { netScore, QUESTIONS, type QuizMove, quizMoveSchema, type QuizResult, validQuiz } from "./quiz.ts";

/** Słów na planszy. */
export const WORDS = 4;

export type Move = QuizMove;

export interface State {
  players: PlayerId[];
  /** Plansza nr i: słowa i pozycja tego z błędem. */
  trials: { words: string[]; wrong: number }[];
  results: Record<PlayerId, QuizResult>;
}

export type View = State;

export const score = netScore;

// ponytail: wynik liczy klient jak w Obrocie, serwer odrzuca tylko nierealne wartości;
// serwer zna `wrong`, więc mógłby liczyć sam z listy odpowiedzi, gdyby ktoś zaczął oszukiwać.
export const literowka: GameDefinition<State, Move> = {
  id: "literowka",
  name: "Literówka",
  minPlayers: 1,
  maxPlayers: 6,
  // 30 s rundy + zapas na przeczytanie zasad i Start, jak w Kolorze liter.
  turnSeconds: 90,
  moveSchema: quizMoveSchema,

  setup: (players, rng) => {
    // Talia par: plansza bierze z niej cztery, a gdy zabraknie, lista jest tasowana od nowa (reszta z dzielenia przepada).
    let deck: Pair[] = [];
    return {
      players,
      trials: Array.from({ length: QUESTIONS }, () => {
        if (deck.length < WORDS) deck = shuffle(PAIRS, rng);
        const wrong = Math.floor(rng() * WORDS);
        return { words: deck.splice(0, WORDS).map(([right, bad], i) => (i === wrong ? bad : right)), wrong };
      }),
      results: {},
    };
  },

  validateMove: (state, player, move) => validQuiz(state, player, move),

  applyMove: (state, player, { times, errors }) => ({ ...state, results: { ...state.results, [player]: { times, errors } } }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, byScoreThenAverage(score), { lower: false, score, tie: { lower: true, score: (r) => averageMs(r.times) } }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", times: [], errors: 0 }),
};

import { averageMs, byHitsThenAverage, type GameDefinition, type PlayerId, ranked } from "./core.ts";
import { QUESTIONS, type QuizMove, quizMoveSchema, type QuizResult, validQuiz } from "./quiz.ts";

/** Bok siatki: przy 360 px szerokości kafel ma ok. 78 px. */
export const SIDE = 4;
/** Suma, którą ma dać para. */
export const TARGET = 10;

export type Move = QuizMove;

export interface State {
  players: PlayerId[];
  /** Plansza startowa, wierszami. */
  board: number[];
  /** Nowe liczby: para nr n dostaje `refills[2n]` w pierwszym dotkniętym polu i `refills[2n + 1]` w drugim. */
  refills: number[];
  results: Record<PlayerId, QuizResult>;
}

export type View = State;

export const hasPair = (board: number[]) => board.some((x, i) => board.some((y, j) => i !== j && x + y === TARGET));

/**
 * Plansza po zebraniu pary z pól `a` i `b`: wchodzą na nie `x` i `y`. Gdyby nie została żadna para,
 * pole `b` dopasowuje się do pierwszego pola spoza tej dwójki, żeby zawsze było co znaleźć.
 */
export function take(board: number[], a: number, b: number, x: number, y: number): number[] {
  const next = [...board];
  next[a] = x;
  next[b] = y;
  if (!hasPair(next)) next[b] = TARGET - next.find((_, i) => i !== a && i !== b)!;
  return next;
}

// ponytail: wynik liczy klient jak w Kolorze liter, serwer odrzuca tylko nierealne wartości;
// lista wybranych par w ruchu i odtworzenie planszy przez `take` na serwerze, gdyby ktoś zaczął oszukiwać.
export const dziesiatki: GameDefinition<State, Move> = {
  id: "dziesiatki",
  name: "Dziesiątki",
  minPlayers: 1,
  maxPlayers: 6,
  // 30 s rundy + zapas na przeczytanie zasad i Start, jak w Kolorze liter.
  turnSeconds: 90,
  moveSchema: quizMoveSchema,

  setup: (players, rng) => {
    const digit = () => 1 + Math.floor(rng() * 9);
    const board = Array.from({ length: SIDE * SIDE }, digit);
    if (!hasPair(board)) board[1] = TARGET - board[0];
    const refills = Array.from({ length: QUESTIONS }, () => {
      const x = digit();
      let y = digit();
      // Dostawa dająca razem 10 nagradzałaby klepanie w te same dwa pola.
      while (x + y === TARGET) y = digit();
      return [x, y];
    }).flat();
    return { players, board, refills, results: {} };
  },

  validateMove: (state, player, move) => validQuiz(state, player, move),

  applyMove: (state, player, { times, errors }) => ({ ...state, results: { ...state.results, [player]: { times, errors } } }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, byHitsThenAverage, { lower: false, score: (r) => r.times.length, tie: { lower: true, score: (r) => averageMs(r.times) } }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", times: [], errors: 0 }),
};

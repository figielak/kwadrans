import { average, byHitsThenAverage, type GameDefinition, type PlayerId, ranked } from "./core.ts";
import { QUESTIONS, type QuizMove, quizMoveSchema, type QuizResult, validQuiz } from "./quiz.ts";

export { DURATION_MS } from "./quiz.ts";

/** Nazwy kolorów; klient trzyma odcienie w tej samej kolejności. */
export const COLORS = ["CZERWONY", "NIEBIESKI", "ŻÓŁTY", "ZIELONY"] as const;
/** W każdym bloku tylu plansz jedna ma słowo zgodne z kolorem (25%, żeby nie dało się grać „zawsze inny”). */
const BLOCK = 4;

export type Move = QuizMove;

export interface State {
  players: PlayerId[];
  /** Słowo i kolor liter (indeksy COLORS); odpowiedź to kolor liter. */
  trials: { word: number; ink: number }[];
  results: Record<PlayerId, QuizResult>;
}

export type View = State;

export const stroop: GameDefinition<State, Move> = {
  id: "stroop",
  name: "Kolor liter",
  minPlayers: 1,
  maxPlayers: 6,
  // 30 s rundy + zapas na przeczytanie zasad i Start; przy 60 s późny Start ucinał rundę w połowie.
  turnSeconds: 90,
  moveSchema: quizMoveSchema,

  setup: (players, rng) => ({
    players,
    trials: Array.from({ length: QUESTIONS / BLOCK }, () => {
      // Zgodne plansze są szybsze, więc każda czwórka ma dokładnie jedną: liczba zgodnych nie zależy od losowania.
      const same = Math.floor(rng() * BLOCK);
      return Array.from({ length: BLOCK }, (_, i) => {
        const ink = Math.floor(rng() * 4);
        return { word: i === same ? ink : (ink + 1 + Math.floor(rng() * 3)) % 4, ink };
      });
    }).flat(),
    results: {},
  }),

  validateMove: (state, player, move) => validQuiz(state, player, move),

  applyMove: (state, player, { times, errors }) => ({ ...state, results: { ...state.results, [player]: { times, errors } } }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, byHitsThenAverage, { lower: false, score: (r) => r.times.length, tie: { lower: true, score: (r) => Math.round(average(r.times)) } }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", times: [], errors: 0 }),
};

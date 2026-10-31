import { averageMs, byScoreThenAverage, type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";
import { netScore, QUESTIONS, type QuizMove, quizMoveSchema, type QuizResult, validQuiz } from "./quiz.ts";

/** Klocków w figurze: od MIN na pierwszych parach, o jeden więcej co STEP par, do MAX. */
export const MIN_CELLS = 4;
export const MAX_CELLS = 7;
const STEP = 3;

export type Move = QuizMove;

/** Figura z klocków: pola `[x, y]` dosunięte do rogu (0, 0). */
export type Cells = [number, number][];

export interface State {
  players: PlayerId[];
  /** Para nr i: `b` to obrócona `a`, a przy `mirror` obrócone lustrzane odbicie `a`. */
  trials: { a: Cells; b: Cells; mirror: boolean }[];
  results: Record<PlayerId, QuizResult>;
}

export type View = State;

export const score = netScore;

/** Dosuwa figurę do rogu i sortuje pola: dwie takie same figury dają wtedy ten sam zapis. */
function norm(cells: Cells): Cells {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells.map(([x, y]): [number, number] => [x - minX, y - minY]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}
/** Obrót o `times` × 90°. */
const turn = (cells: Cells, times: number): Cells => (times ? turn(norm(cells.map(([x, y]) => [-y, x])), times - 1) : cells);
const flip = (cells: Cells) => norm(cells.map(([x, y]) => [-x, y]));
/** Figura po obrocie o 0, 90, 180 i 270°. */
const rotations = (cells: Cells) => [0, 1, 2].reduce((all, k) => [...all, turn(all[k], 1)], [cells]);
const same = (a: Cells, b: Cells) => String(a) === String(b);

const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Losowa figura z `n` klocków, zawsze chiralna: jej odbicie nie jest żadnym z jej obrotów, więc pytanie ma jedną odpowiedź.
 * Do tego bez symetrii obrotowej: po 180° wyglądałaby jak przed obrotem, a po 90° jak po 270°, więc rodzaj planszy by się zlewał.
 */
function figure(n: number, int: (n: number) => number): Cells {
  for (;;) {
    const cells: Cells = [[0, 0]];
    while (cells.length < n) {
      const [x, y] = cells[int(cells.length)];
      const [dx, dy] = SIDES[int(4)];
      if (!cells.some(([cx, cy]) => cx === x + dx && cy === y + dy)) cells.push([x + dx, y + dy]);
    }
    const a = norm(cells);
    const all = rotations(a);
    const mirror = flip(a);
    if (!all.some((r) => same(r, mirror)) && !same(all[2], a)) return a;
  }
}

// ponytail: wynik liczy klient jak w Kolorze liter, serwer odrzuca tylko nierealne wartości;
// serwer zna `mirror`, więc mógłby liczyć sam z listy odpowiedzi, gdyby ktoś zaczął oszukiwać.
export const obrot: GameDefinition<State, Move> = {
  id: "obrot",
  name: "Obrót",
  minPlayers: 1,
  maxPlayers: 6,
  // 30 s rundy + zapas na przeczytanie zasad i Start, jak w Kolorze liter.
  turnSeconds: 90,
  moveSchema: quizMoveSchema,

  // Rodzaj planszy (90/180/270° × ta sama/lustro) idzie potasowanymi szóstkami: w każdej partii każdego tyle samo.
  setup: (players, rng) => {
    const int = (n: number) => Math.floor(rng() * n);
    const kinds = Array.from({ length: Math.ceil(QUESTIONS / 6) }, () => shuffle([0, 1, 2, 3, 4, 5], rng)).flat();
    return {
      players,
      trials: Array.from({ length: QUESTIONS }, (_, i) => {
        const a = figure(Math.min(MIN_CELLS + Math.floor(i / STEP), MAX_CELLS), int);
        const mirror = kinds[i] % 2 === 1;
        return { a, b: turn(mirror ? flip(a) : a, 1 + Math.floor(kinds[i] / 2)), mirror };
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

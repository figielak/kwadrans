import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, type Rng, shuffle } from "./core.ts";

export const ROUNDS = 12;
/** Tyle działań ma pierwsza runda; każda następna o jedno więcej. */
export const START_OPS = 2;
/** Tyle ms widać liczbę startową i każde działanie. */
export const SHOW_MS = 1500;
/** Wartość po każdym kroku ciągu jest w 1-MAX_VALUE. */
export const MAX_VALUE = 99;
export const MAX_ANSWER = 999;

export type Op = { op: "+" | "−" | "×"; n: number };
export type Round = { start: number; ops: Op[] };
/** Liczba zaliczonych rund i odchyłka odpowiedzi w pierwszej niezaliczonej. */
export type Result = { rounds: number; diff: number };
/** Odpowiedzi w kolejnych rozegranych rundach; pusta lista = limit czasu. */
export type Move = { type: "result"; answers: number[] };

export interface State {
  players: PlayerId[];
  rounds: Round[];
  results: Record<PlayerId, Result>;
}

export type View = State;

const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

const apply = (v: number, { op, n }: Op) => (op === "+" ? v + n : op === "−" ? v - n : v * n);

/** Wynik ciągu: działania po kolei od lewej, bez kolejności działań. */
export const value = (round: Round) => round.ops.reduce(apply, round.start);

/**
 * Ciąg `length` działań z dokładnie floor(length / 3) mnożeniami na potasowanych miejscach, reszta to + i −.
 * Z każdej wartości 1-99 da się zrobić krok + albo − (+1 albo −1), więc te losowania z odrzucaniem zawsze się kończą.
 * Mnożenie wymaga wartości do 49; gdy jej nie ma, cały ciąg losuje się od nowa (średnio około dwóch podejść na ciąg, 10 000 partii bez zawieszenia).
 */
function chain(rng: Rng, length: number): Round {
  const times = shuffle(Array.from({ length }, (_, i) => i < Math.floor(length / 3)), rng);
  for (;;) {
    const start = int(rng, 1, 9);
    const ops: Op[] = [];
    let v = start;
    while (ops.length < length) {
      if (times[ops.length]) {
        const fits = [2, 3].filter((n) => v * n <= MAX_VALUE);
        if (!fits.length) break;
        ops.push({ op: "×", n: fits[Math.floor(rng() * fits.length)] });
      } else {
        const op: Op = rng() < 0.5 ? { op: "+", n: int(rng, 1, 9) } : { op: "−", n: int(rng, 1, 9) };
        const next = apply(v, op);
        if (next < 1 || next > MAX_VALUE) continue;
        ops.push(op);
      }
      v = apply(v, ops[ops.length - 1]);
    }
    if (ops.length === length) return { start, ops };
  }
}

// ponytail: ciągi są w widoku od startu (jak kropki w Policz kropki), da się podejrzeć; między znajomymi wystarczy.
export const wPamieci: GameDefinition<State, Move> = {
  id: "w-pamieci",
  name: "W pamięci",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: 300,
  moveSchema: z.object({ type: z.literal("result"), answers: z.array(z.number().int()).max(ROUNDS) }),

  setup: (players, rng) => ({
    players,
    rounds: Array.from({ length: ROUNDS }, (_, i) => chain(rng, i + START_OPS)),
    results: {},
  }),

  validateMove: (state, player, { answers }) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    answers.length <= ROUNDS &&
    answers.every((a) => Number.isInteger(a) && a >= 0 && a <= MAX_ANSWER),

  applyMove: (state, player, { answers }) => {
    const miss = state.rounds.findIndex((round, i) => answers[i] !== value(round));
    const rounds = miss === -1 ? ROUNDS : miss;
    const diff = miss === -1 ? 0 : miss < answers.length ? Math.abs(answers[miss] - value(state.rounds[miss])) : MAX_ANSWER;
    return { ...state, results: { ...state.results, [player]: { rounds, diff } } };
  },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => b.rounds - a.rounds || a.diff - b.diff, {
    lower: false,
    score: (r) => r.rounds,
    tie: { lower: true, score: (r) => r.diff },
  }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", answers: [] }),
};

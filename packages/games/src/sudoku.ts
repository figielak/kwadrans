import { z } from "zod";
import { byCompletion, type GameDefinition, type PlayerId, type Rng, ranked, shuffle } from "./core.ts";

const SIZE = 4;
const CELLS = SIZE * SIZE;
/** Pola do wpisania; reszta (6) jest dana. */
export const BLANKS = 10;
/** Kara za złą cyfrę. */
export const PENALTY_MS = 5000;
/** Szybciej niż 300 ms na cyfrę nikt nie klika. */
const MIN_MS = BLANKS * 300;
const TURN_SECONDS = 120;

/** Brak completed występuje tylko w historycznym detail; nie odtwarzamy statusu. */
export type Result = { ms: number; mistakes: number; completed?: boolean };
export type Move = ({ type: "result" } & Result) | { type: "progress"; filled: number };

export interface State {
  players: PlayerId[];
  /** Plansza wiersz po wierszu, 0 = puste; ta sama dla wszystkich. */
  puzzle: number[];
  solution: number[];
  results: Record<PlayerId, Result>;
  /** Ile cyfr gracz już wpisał (1-9), zgłaszane przez klienta; tylko do podglądu u rywali. */
  progress: Record<PlayerId, number>;
  /** Odróżnia partie z tą samą planszą (ekran montuje się od nowa przy rewanżu); dawne partie go nie mają. */
  nonce?: number;
}

export type View = State;

export const total = (r: Result) => r.ms + r.mistakes * PENALTY_MS;

const fits = (grid: number[], i: number, v: number) => {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const b = Math.floor(r / 2) * 2 * SIZE + Math.floor(c / 2) * 2;
  for (let k = 0; k < SIZE; k++) {
    const blk = b + Math.floor(k / 2) * SIZE + (k % 2);
    if (grid[r * SIZE + k] === v || grid[k * SIZE + c] === v || grid[blk] === v) return false;
  }
  return true;
};

/** Liczba rozwiązań, przerwana przy 2 (wystarczy wiedzieć, czy jest jedno). */
function count(grid: number[]): number {
  const i = grid.indexOf(0);
  if (i < 0) return 1;
  let n = 0;
  for (let v = 1; v <= SIZE && n < 2; v++) {
    if (!fits(grid, i, v)) continue;
    grid[i] = v;
    n += count(grid);
    grid[i] = 0;
  }
  return n;
}

/** Wzorzec bazowy z potasowanymi cyframi, wierszami i kolumnami w pasach oraz samymi pasami. */
function fullGrid(rng: Rng): number[] {
  const order = () => shuffle([0, 1], rng).flatMap((band) => shuffle([0, 1], rng).map((i) => band * 2 + i));
  const [rows, cols, digits] = [order(), order(), shuffle([1, 2, 3, 4], rng)];
  return rows.flatMap((r) => cols.map((c) => digits[(2 * (r % 2) + Math.floor(r / 2) + c) % SIZE]));
}

function makePuzzle(rng: Rng): { puzzle: number[]; solution: number[] } {
  for (;;) {
    const solution = fullGrid(rng);
    const puzzle = [...solution];
    let blanks = 0;
    for (const i of shuffle(Array.from({ length: CELLS }, (_, k) => k), rng)) {
      if (blanks === BLANKS) break;
      puzzle[i] = 0;
      if (count([...puzzle]) === 1) blanks++;
      else puzzle[i] = solution[i];
    }
    if (blanks === BLANKS) return { puzzle, solution };
  }
}

// ponytail: czas i pomyłki mierzy klient, serwer odrzuca tylko nierealne wartości.
export const sudoku: GameDefinition<State, Move> = {
  id: "sudoku",
  name: "Sudoku",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: TURN_SECONDS,
  // Stały klucz: ruch progress nie odnawia limitu, nawet gdy gra już tylko jedna osoba.
  turn: () => ({ key: "run", seconds: TURN_SECONDS }),
  moveSchema: z.discriminatedUnion("type", [
    z.object({ type: z.literal("result"), ms: z.number(), mistakes: z.number(), completed: z.boolean().optional() }),
    z.object({ type: z.literal("progress"), filled: z.number() }),
  ]),

  // Nonce losowany po planszy, więc seed daje tę samą planszę co przed jego dodaniem.
  setup: (players, rng) => ({ players, ...makePuzzle(rng), results: {}, progress: {}, nonce: Math.floor(rng() * 2 ** 32) }),

  validateMove: (state, player, move, context) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    (move.type === "progress"
      ? Number.isInteger(move.filled) && move.filled >= 1 && move.filled < BLANKS
      : (context?.source === "timeout"
          ? move.completed === false && move.ms === TURN_SECONDS * 1000 && move.mistakes === 0
          : move.completed !== false) &&
        move.ms >= MIN_MS && move.ms <= TURN_SECONDS * 1000 && Number.isInteger(move.mistakes) && move.mistakes >= 0),

  applyMove: (state, player, move) =>
    move.type === "progress"
      ? { ...state, progress: { ...state.progress, [player]: move.filled } }
      : { ...state, results: { ...state.results, [player]: { ms: Math.round(move.ms), mistakes: move.mistakes, completed: move.completed !== false } } },

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, byCompletion((a, b) => total(a) - total(b)), { lower: true, score: (r) => r.completed === false ? Infinity : total(r) }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", ms: TURN_SECONDS * 1000, mistakes: 0, completed: false }),
};

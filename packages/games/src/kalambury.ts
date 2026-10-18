import { z } from "zod";
import { type GameDefinition, normalize, type PlayerId, rankResults, shuffle } from "./core.ts";
import { WORDS } from "./kalambury-dane.ts";

export const MODES = [
  { id: "krotka", name: "Krótka", hint: "każdy rysuje raz", draws: 1, default: true },
  { id: "dluga", name: "Długa", hint: "każdy rysuje dwa razy", draws: 2 },
];
const DEFAULT = MODES.find((m) => m.default)!;

export const CHOICES = 3;
export const ANSWER_MAX = 30;
/** Współrzędne płótna 0-1000, niezależnie od ekranu. */
export const SIDE = 1000;
/** Punktów (par x, y) w jednym ruchu i w całym rysunku. */
export const BATCH_POINTS = 100;
export const MAX_POINTS = 2000;
/** Pudeł na gracza w rundzie: bez tego klepanie Entera zapchałoby czat i łącze. */
export const MAX_GUESSES = 30;
/** Za trafienie według kolejności; przy 6 graczach zgaduje najwyżej 5 osób. */
export const GUESS_POINTS = [10, 8, 6, 5, 4];
/** Dla rysującego za każdego, kto zgadł. */
export const DRAWER_POINTS = 3;
const SECONDS = { choose: 15, draw: 80, reveal: 6 };

export type Move =
  | { type: "choose"; index: number }
  | { type: "line"; points: number[]; start: boolean }
  | { type: "undo" }
  | { type: "clear" }
  | { type: "guess"; text: string }
  | { type: "pass" }
  | { type: "next" };

export type Phase = "choose" | "draw" | "reveal" | "over";

export interface State {
  players: PlayerId[];
  /** Nic nie losuje, tylko odróżnia partie (rewanż montuje grę na kliencie od nowa). */
  nonce: number;
  rounds: number;
  round: number;
  phase: Phase;
  drawer: PlayerId;
  /** Hasła do wyboru, po CHOICES na rundę; nigdy w widoku. */
  words: string[];
  /** Wybrane hasło rundy, "" przed wyborem. */
  word: string;
  /** Kreski jako płaskie listy x, y. */
  strokes: number[][];
  /** Pudła rundy. */
  chat: { player: PlayerId; text: string }[];
  /** Kto zgadł, w kolejności trafień. */
  guessed: PlayerId[];
  passed: PlayerId[];
  /** Kto kliknął „Dalej” po odsłonie. */
  ready: PlayerId[];
  roundScores: Record<PlayerId, number>;
  totals: Record<PlayerId, number>;
}

export type View = Omit<State, "words"> & {
  /** Hasła do wyboru, tylko u rysującego w fazie wyboru. */
  choices: string[];
  /** Hasło z literami zamienionymi na „_” (dla zgadujących). */
  hint: string;
};

const guessers = (s: State) => s.players.filter((p) => p !== s.drawer && !s.guessed.includes(p) && !s.passed.includes(p));
const points = (s: State) => s.strokes.reduce((n, stroke) => n + stroke.length / 2, 0);

function newRound(state: State, round: number): State {
  const drawer = state.players[round % state.players.length];
  return { ...state, round, phase: "choose", drawer, word: "", strokes: [], chat: [], guessed: [], passed: [], ready: [], roundScores: {} };
}

/** Koniec rysowania: punkty rundy, potem odsłona albo koniec partii. */
function score(s: State): State {
  const roundScores = Object.fromEntries(s.players.map((p) => [p, 0]));
  s.guessed.forEach((p, i) => (roundScores[p] = GUESS_POINTS[i]));
  roundScores[s.drawer] = DRAWER_POINTS * s.guessed.length;
  const totals = Object.fromEntries(s.players.map((p) => [p, s.totals[p] + roundScores[p]]));
  return { ...s, roundScores, totals, phase: s.round === s.rounds - 1 ? "over" : "reveal" };
}

const coord = z.number().int().min(0).max(SIDE);

export const kalambury: GameDefinition<State, Move> = {
  id: "kalambury",
  name: "Kalambury",
  minPlayers: 2,
  maxPlayers: 6,
  modes: MODES,
  moveSchema: z.discriminatedUnion("type", [
    z.object({ type: z.literal("choose"), index: z.number().int() }),
    z.object({ type: z.literal("line"), points: z.array(coord).max(BATCH_POINTS * 2), start: z.boolean() }),
    z.object({ type: z.literal("undo") }),
    z.object({ type: z.literal("clear") }),
    z.object({ type: z.literal("guess"), text: z.string().max(ANSWER_MAX) }),
    z.object({ type: z.literal("pass") }),
    z.object({ type: z.literal("next") }),
  ]),

  setup: (players, rng, modeId) => {
    const mode = MODES.find((m) => m.id === modeId) ?? DEFAULT;
    const rounds = players.length * mode.draws;
    const words = shuffle(WORDS, rng).slice(0, rounds * CHOICES);
    const totals = Object.fromEntries(players.map((p) => [p, 0]));
    return newRound({ players, nonce: Math.floor(rng() * 2 ** 32), rounds, words, totals } as unknown as State, 0);
  },

  validateMove: (s, player, move) => {
    if (!s.players.includes(player)) return false;
    const drawing = s.phase === "draw" && player === s.drawer;
    switch (move.type) {
      case "choose":
        return s.phase === "choose" && player === s.drawer && move.index >= 0 && move.index < CHOICES;
      case "line": {
        const { points: p } = move;
        // validateMove jest jedynym strażnikiem, więc zakres współrzędnych sprawdza też sam, nie tylko schemat.
        if (!drawing || p.length < 2 || p.length % 2 || !p.every((n) => coord.safeParse(n).success)) return false;
        if (!move.start && s.strokes.length === 0) return false;
        return points(s) + p.length / 2 <= MAX_POINTS;
      }
      case "undo":
        return drawing && s.strokes.length > 0;
      case "clear":
        return drawing;
      case "guess":
        return (
          s.phase === "draw" &&
          guessers(s).includes(player) &&
          move.text.trim().length > 0 &&
          s.chat.filter((m) => m.player === player).length < MAX_GUESSES
        );
      case "pass":
        return s.phase === "draw" && guessers(s).includes(player);
      case "next":
        return s.phase === "reveal" && !s.ready.includes(player);
    }
  },

  applyMove: (s, player, move) => {
    switch (move.type) {
      case "choose":
        return { ...s, phase: "draw", word: s.words[s.round * CHOICES + move.index] };
      case "line": {
        if (move.start) return { ...s, strokes: [...s.strokes, move.points] };
        const strokes = [...s.strokes];
        strokes[strokes.length - 1] = [...strokes[strokes.length - 1], ...move.points];
        return { ...s, strokes };
      }
      case "undo":
        return { ...s, strokes: s.strokes.slice(0, -1) };
      case "clear":
        return { ...s, strokes: [] };
      case "guess":
      case "pass": {
        const hit = move.type === "guess" && normalize(move.text) === normalize(s.word);
        const next =
          move.type === "pass"
            ? { ...s, passed: [...s.passed, player] }
            : hit
              ? { ...s, guessed: [...s.guessed, player] }
              : { ...s, chat: [...s.chat, { player, text: move.text.trim() }] };
        return guessers(next).length === 0 ? score(next) : next;
      }
      case "next": {
        const ready = [...s.ready, player];
        return ready.length === s.players.length ? newRound(s, s.round + 1) : { ...s, ready };
      }
    }
  },

  // Lista haseł nie wychodzi z serwera. Hasło rundy zna tylko rysujący, dopóki trwa wybór i rysowanie.
  playerView: (s, player): View => {
    const { words, ...rest } = s;
    const secret = (s.phase === "choose" || s.phase === "draw") && player !== s.drawer;
    return {
      ...rest,
      word: secret ? "" : s.word,
      hint: s.word.replace(/\S/g, "_"),
      choices: s.phase === "choose" && player === s.drawer ? words.slice(s.round * CHOICES, (s.round + 1) * CHOICES) : [],
    };
  },

  isOver: (s) => (s.phase === "over" ? rankResults(s.players, s.totals, (a, b) => b - a) : null),

  waitingFor: (s) => {
    if (s.phase === "choose") return [s.drawer];
    if (s.phase === "draw") return guessers(s);
    if (s.phase === "reveal") return s.players.filter((p) => !s.ready.includes(p));
    return [];
  },

  turn: (s) => ({ key: `${s.phase}:${s.round}`, seconds: s.phase === "over" ? 0 : SECONDS[s.phase] }),

  timeoutMove: (s) => {
    if (s.phase === "choose") return { type: "choose", index: 0 };
    if (s.phase === "draw") return { type: "pass" };
    return { type: "next" };
  },
};

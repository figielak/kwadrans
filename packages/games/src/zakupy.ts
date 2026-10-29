import { z } from "zod";
import { type GameDefinition, type PlayerId, ranked, shuffle } from "./core.ts";

/** Przedmioty na liście i na półce. */
export const LIST = 10;
export const SHELF = 20;
/** Tyle widać listę, zanim zniknie; potem gracz ma najwyżej `MAX_MS` na zaznaczanie. */
export const SHOW_MS = 10_000;
export const MAX_MS = 50_000;

/** Pula produktów (emoji), z której serwer losuje półkę. */
export const ITEMS = [
  "🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🍋", "🍉",
  "🥕", "🌽", "🥦", "🍅", "🥔", "🧅", "🧄", "🍄", "🥒", "🌶️",
  "🍞", "🥐", "🧀", "🥚", "🥓", "🍗", "🥩", "🍕", "🌭", "🍔",
  "🥛", "🧃", "☕", "🍵", "🍫", "🍬", "🍪", "🍩", "🍰", "🍯",
  "🧴", "🧻", "🧼", "🪥", "🧽", "🕯️", "🔋", "💡", "🧦", "🧤",
  "🍝", "🍜", "🍚", "🥫", "🥜", "🌰", "🥭", "🍐", "🥑", "🫐",
];

/** `hits` zaznaczeń z listy, `wrong` spoza niej, `ms` czas zaznaczania. */
export type Result = { score: number; hits: number; wrong: number; ms: number };
export type Move = { type: "result"; picked: number[]; ms: number };

export interface State {
  players: PlayerId[];
  /** Półka: 20 różnych przedmiotów, ta sama dla wszystkich. */
  items: string[];
  /** Indeksy półki, które były na liście (w kolejności listy). */
  listed: number[];
  results: Record<PlayerId, Result>;
  picked: Record<PlayerId, number[]>;
}

export type View = State;

const TURN_SECONDS = 80;

/** Trafienia minus zaznaczenia spoza listy, nie mniej niż 0. Powtórzony indeks liczy się raz, indeks spoza półki to błąd. */
export function score(listed: number[], picked: number[]): Omit<Result, "ms"> {
  const unique = new Set(picked);
  const hits = [...unique].filter((i) => listed.includes(i)).length;
  const wrong = unique.size - hits;
  return { score: Math.max(0, hits - wrong), hits, wrong };
}

// ponytail: lista jest w widoku od startu (partia toczy się na kliencie), da się ją podejrzeć w WebSockecie; między znajomymi wystarczy.
// Uczciwa wersja to `playerView` bez `listed` do czasu wyniku.
export const zakupy: GameDefinition<State, Move> = {
  id: "zakupy",
  name: "Zakupy",
  minPlayers: 1,
  maxPlayers: 6,
  turnSeconds: TURN_SECONDS,
  moveSchema: z.object({ type: z.literal("result"), picked: z.array(z.number().int()).max(SHELF), ms: z.number().int() }),

  setup: (players, rng) => ({
    players,
    items: shuffle(ITEMS, rng).slice(0, SHELF),
    listed: shuffle(Array.from({ length: SHELF }, (_, i) => i), rng).slice(0, LIST),
    results: {},
    picked: {},
  }),

  validateMove: (state, player, move) =>
    state.players.includes(player) &&
    !(player in state.results) &&
    move.ms >= 0 &&
    move.ms <= MAX_MS &&
    new Set(move.picked).size === move.picked.length &&
    move.picked.every((i) => i >= 0 && i < SHELF),

  applyMove: (state, player, move) => ({
    ...state,
    results: { ...state.results, [player]: { ...score(state.listed, move.picked), ms: move.ms } },
    picked: { ...state.picked, [player]: move.picked },
  }),

  playerView: (state): View => state,

  ...ranked((state: State) => state.results, (a, b) => b.score - a.score || a.ms - b.ms, { lower: false, score: (r) => r.score, tie: { lower: true, score: (r) => r.ms } }),

  waitingFor: (state) => state.players.filter((p) => !(p in state.results)),

  timeoutMove: () => ({ type: "result", picked: [], ms: MAX_MS }),
};

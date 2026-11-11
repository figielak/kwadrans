import { describe, expect, test } from "vitest";
import { createRng, GAMES } from "./index.ts";

// Zapis pokoi (faza 13): stan każdej gry musi przetrwać JSON.stringify i JSON.parse bez zmiany znaczenia.
// Dwie partie z tym samym ziarnem: jedna w pamięci, druga po każdym ruchu zapisana i odczytana jak z bazy.
// Rozjazd oznacza wartość, której JSON nie przenosi (Infinity, NaN, undefined w tablicy, Set, Map, Date).

const SEEDS = [1, 2];
const MAX_STEPS = 100_000;
/** Pokój trafia do SQLite w jednym wierszu; stan partii ma zostać mały także w najdłuższej grze. */
const MAX_BYTES = 256 * 1024;

const thaw = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Jak w teście kontraktu: sam timeoutMove nie kupuje, nie stawia ścianek i nie pisze odpowiedzi. */
const EAGER: Record<string, (rng: () => number, state: unknown) => unknown[]> = {
  "kampus-tour": (rng) => [{ type: "buy" }, { type: "buyout" }, { type: "build", level: 1 }, { type: "travel", tile: Math.floor(rng() * 32) }],
  labirynt: (rng) => (rng() < 0.3 ? [{ type: "wall", x: Math.floor(rng() * 8), y: Math.floor(rng() * 8), dir: rng() < 0.5 ? "h" : "v" }] : []),
  podrobka: (_, state) => {
    const { nonce, round, players } = state as { nonce: number; round: number; players: string[] };
    return [{ type: "write", nonce, round, answer: "odpowiedź", done: true }, ...players.map((target) => ({ type: "vote", nonce, round, target }))];
  },
};

const CASES = Object.values(GAMES).flatMap((game) =>
  (game.modes ?? [undefined]).map((mode) => ({ game, mode: mode?.id, name: mode ? `${game.name} (${mode.name})` : game.name })),
);

describe.each(CASES)("$name: stan przeżywa zapis", ({ game, mode }) => {
  test.each([...new Set([game.minPlayers, game.maxPlayers])])("%i graczy: partia zapisywana po każdym ruchu toczy się tak samo", (n) => {
    for (const seed of SEEDS) {
      const players = ["p1", "p2", "p3", "p4", "p5", "p6"].slice(0, n);
      const rng = createRng(seed);
      const savedRng = createRng(seed);
      let live = game.setup(players, rng, mode);
      let saved = thaw(game.setup(players, savedRng, mode));

      for (let steps = 0; ; steps++) {
        if (steps > MAX_STEPS) throw new Error(`seed ${seed}: partia się nie kończy`);
        const label = `seed ${seed}, ruch ${steps}`;
        expect(saved, `${label}: stan`).toEqual(live);
        expect(game.waitingFor(saved), `${label}: na kogo czekamy`).toEqual(game.waitingFor(live));
        // Widoki porównujemy jako tekst: tak idą do klienta, a to dużo tańsze niż głębokie porównanie w każdym ruchu.
        for (const viewer of [...players, ""]) expect(JSON.stringify(game.playerView(saved, viewer)), `${label}: widok ${viewer}`).toBe(JSON.stringify(game.playerView(live, viewer)));
        const result = game.isOver(live);
        expect(game.isOver(saved), `${label}: wynik`).toEqual(result);
        if (result) {
          // Wynik i miejsca też trafiają do zapisu pokoju.
          expect(thaw(result), `${label}: wynik w JSON`).toEqual(result);
          if (game.places && result.ranking) expect(game.places(saved), `${label}: miejsca`).toEqual(game.places(live));
          break;
        }

        const waiting = game.waitingFor(live);
        const pick = rng();
        savedRng();
        const player = waiting[Math.floor(pick * waiting.length)];
        const eager = rng() < 0.7;
        savedRng();
        const choose = (state: unknown, random: () => number) =>
          (eager ? EAGER[game.id]?.(random, state).find((m) => game.validateMove(state, player, m)) : undefined) ?? game.timeoutMove!(state, player, random);
        const move = choose(live, rng);
        const savedMove = choose(saved, savedRng);
        expect(savedMove, `${label}: ruch`).toEqual(move);
        live = game.applyMove(live, player, move, rng);
        const json = JSON.stringify(game.applyMove(saved, player, savedMove, savedRng));
        expect(json.length, `${label}: rozmiar stanu`).toBeLessThan(MAX_BYTES);
        saved = JSON.parse(json);
      }
    }
  });
});

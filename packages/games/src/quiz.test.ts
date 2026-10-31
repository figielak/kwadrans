import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { GAMES } from "./index.ts";

// Granice z 30 s i blokady 1 s, bez progu szybkości człowieka:
// - całkowite czasy 0-30000 ms, suma <=30000; trafienia <150 i >5000 zostają,
// - 200 to pula plansz, nie limit trafień (ekrany powtarzają pulę),
// - pomyłki int 0-30: pierwsza może być w 0 ms, kolejne najwcześniej co 1000 ms,
// - wynik, rekord i miejsca używają wszystkich przekazanych czasów.
const A = "ania";
const B = "bartek";
const cases = [
  { name: "zero ms po zaokrągleniu zegara", times: [0], errors: 0, valid: true },
  { name: "trafienie poniżej 150 ms", times: [1, 149], errors: 0, valid: true },
  { name: "trafienie powyżej 5 s", times: [5001, 6000], errors: 0, valid: true },
  { name: "dokładnie 30 s", times: [30000], errors: 0, valid: true },
  { name: "201 trafień mieszczących się w czasie", times: Array(201).fill(1), errors: 0, valid: true },
  { name: "30 pomyłek z blokadą po ostatniej przy końcu", times: [], errors: 30, valid: true },
  { name: "31 pomyłek nie mieści się w rundzie", times: [], errors: 31, valid: false },
  { name: "ujemne pomyłki", times: [], errors: -1, valid: false },
  { name: "ułamkowe pomyłki", times: [], errors: 0.5, valid: false },
  { name: "nieskończone pomyłki", times: [], errors: Infinity, valid: false },
  { name: "ujemny czas", times: [-1], errors: 0, valid: false },
  { name: "ułamkowy czas", times: [150.5], errors: 0, valid: false },
  { name: "nieskończony czas", times: [Infinity], errors: 0, valid: false },
  { name: "NaN", times: [NaN], errors: 0, valid: false },
  { name: "czas ponad rundę", times: [30001], errors: 0, valid: false },
  { name: "suma ponad rundę", times: [15000, 15001], errors: 0, valid: false },
];

describe.each(["stroop", "liczenie", "inny", "obrot", "literowka", "dziesiatki"])("%s: wspólne granice quizu", (id) => {
  const game = GAMES[id];
  test.each(cases)("$name", ({ times, errors, valid }) => {
    const state = game.setup([A, B], createRng(42));
    const move = { type: "result", times, errors };
    expect(game.moveSchema.safeParse(move).success).toBe(valid);
    expect(game.validateMove(state, A, move)).toBe(valid);
  });
  test("szybkie i wolne trafienie zostają w wyniku, rekordzie i miejscach", () => {
    let state = game.setup([A, B], createRng(42));
    for (const [player, times] of [[A, [100, 6000]], [B, [200, 6000]]] as const) {
      const move = { type: "result", times: [...times], errors: 0 };
      expect(game.validateMove(state, player, move)).toBe(true);
      state = game.applyMove(state, player, move, createRng(1));
    }
    expect(game.isOver(state)).toEqual({ winner: A, ranking: [A, B] });
    expect(game.places!(state)).toEqual({ [A]: 1, [B]: 2 });
    expect(game.record!.score(state, A)).toBe(2);
    expect(game.record!.tie!.score(state, A)).toBe(3050);
    expect((game.playerView(state, A) as { results: Record<string, { times: number[] }> }).results[A].times).toEqual([100, 6000]);
  });
});


// P4-031/F4-007: brakujące granice sumy i 200 czasów w sześciu quizach.
// Suma 30001 i 201 poprawnych czasów są już pokryte wyżej (P4-023); bez dublowania.
describe.each(["stroop", "liczenie", "inny", "obrot", "literowka", "dziesiatki"])("%s: P4-031/F4-007", (id) => {
  test.each([
    { name: "suma dwóch czasów dokładnie 30000 ms", times: [15000, 15000], valid: true },
    { name: "200 czasów po 150 ms", times: Array(200).fill(150), valid: true },
  ])("$name", ({ times, valid }) => {
    const game = GAMES[id], s = game.setup([A, B], createRng(1));
    const move = { type: "result", times, errors: 0 };
    expect(game.moveSchema.safeParse(move).success).toBe(valid);
    expect(game.validateMove(s, A, move)).toBe(valid);
  });
});

import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { COLORS, DURATION_MS, type Move, type State, stroop as game, type View } from "./stroop.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - wszyscy dostają te same plansze: słowo (nazwa koloru) napisane innym kolorem (ink), odpowiedź = ink,
// - plansz wystarczy na 30 s, większość jest niezgodna (słowo ≠ kolor),
// - klient oddaje czasy trafień (całkowite 0-30000 ms, razem max 30 s) i liczbę pomyłek,
// - ranking: więcej trafień wyżej, remis rozstrzyga niższa średnia.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (times: number[], errors = 0): Move => ({ type: "result", times, errors });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("plansze: 4 kolory, wystarczy na 30 s, większość niezgodna", () => {
  expect(COLORS).toHaveLength(4);
  const { trials } = game.playerView(game.setup([A, B], createRng(1)), A) as View;
  expect(trials.length * 150).toBeGreaterThanOrEqual(DURATION_MS);
  expect(trials.every((t) => [t.word, t.ink].every((c) => Number.isInteger(c) && c >= 0 && c < 4))).toBe(true);
  expect(trials.filter((t) => t.word !== t.ink).length / trials.length).toBeGreaterThan(0.6);
});

test("w każdej czwórce plansz dokładnie jedna zgodna, na różnych pozycjach: każda partia ma ich tyle samo", () => {
  const positions = new Set<number>();
  for (let seed = 1; seed <= 20; seed++) {
    const { trials } = game.setup([A], createRng(seed));
    for (let i = 0; i < trials.length; i += 4) {
      const same = trials.slice(i, i + 4).flatMap((t, at) => (t.word === t.ink ? [at] : []));
      expect(same, `seed ${seed}, plansze ${i}-${i + 3}`).toHaveLength(1);
      positions.add(same[0]);
    }
  }
  expect([...positions].sort()).toEqual([0, 1, 2, 3]);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  test.each([
    ["ujemny czas", result([-1])],
    ["czas ponad długość rundy", result([30001])],
    ["ponad 30 s", result(Array(11).fill(3000))],
    ["ujemne pomyłki", result([500], -1)],
  ])("%s", (_, move) => expect(game.validateMove(s, A, move)).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, result([500]))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result([500])), A, result([400]))).toBe(false));
  test("pusty wynik", () => expect(game.validateMove(s, A, result([], 4))).toBe(true));
});

describe("koniec", () => {
  test("więcej trafień wygrywa, remis rozstrzyga średnia", () => {
    let s = game.setup([A, B, C], createRng(1));
    s = send(s, A, result([600, 600]));
    s = send(s, B, result([700, 700, 700], 5));
    expect(game.isOver(s)).toBeNull();
    s = send(s, C, result([500, 500]));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
  });

  test("remis na górze i dwa puste wyniki: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result([600, 400]));
    s = send(s, B, result([500, 500], 3));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });

    let t = game.setup([A, B], createRng(1));
    t = send(t, A, result([]));
    t = send(t, B, result([], 7));
    expect(game.isOver(t)).toEqual({ ranking: [A, B] });
  });

  test("po limicie czasu pusty wynik", () => {
    expect(game.timeoutMove!(game.setup([A], createRng(1)), A, createRng(1))).toEqual(result([]));
  });
});


describe("P4-031: brakujące kontrakty F4", () => {
  test.each([[A], [A, B, C, "darek", "ela", "filip"]])("F4-004/F4-005: definicja i start dla %j", (...players) => {
    expect([game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual([1, 6, 90]);
    const s = game.setup(players, createRng(7));
    expect(game.isOver(s)).toBeNull();
    expect(game.waitingFor(s)).toEqual(players);
    expect(s.results).toEqual({});
  });

  test("F4-005: ten sam seed odtwarza stan, inny zmienia wyzwanie", () => {
    const s = game.setup([A, B], createRng(7));
    expect(game.setup([A, B], createRng(7))).toEqual(s);
    const other = game.setup([A, B], createRng(8));
    expect(other).not.toEqual(s);
  });

  test("F4-006: po końcu wynik odrzucony dla każdego gracza i obcego", () => {
    let s = game.setup([A, B], createRng(1));
    for (const p of [A, B]) s = send(s, p, result([500]));
    expect(game.isOver(s)).not.toBeNull();
    for (const p of [A, B, "obcy"]) expect(game.validateMove(s, p, result([400]))).toBe(false);
  });

  test("F4-007: czasy 150 i 5000 ms przechodzą (wewnątrz obecnego zakresu 0-30000)", () => {
    expect(game.validateMove(game.setup([A, B], createRng(1)), A, result([150, 5000]))).toBe(true);
  });

  test.each([
    { type: "nieznany", times: [], errors: 0 },
    { type: "result", errors: 0 },
    { type: "result", times: [] },
    { type: "result", times: ["500"], errors: 0 },
  ])("F4-008: schemat odrzuca %j", (move) => {
    expect(game.moveSchema.safeParse(move).success).toBe(false);
  });

  test.each([A, C])("F4-009: wygrywa także %s", (winner) => {
    let s = game.setup([A, B, C], createRng(1));
    for (const p of [A, B, C]) s = send(s, p, result(p === winner ? [400, 400] : [500]));
    expect(game.isOver(s)?.winner).toBe(winner);
    expect(game.waitingFor(s)).toEqual([]);
  });

  test("F4-010: wynik na zamrożonym wejściu bez mutacji, JSON zachowuje stan", () => {
    function freeze(value: unknown): void {
      if (value && typeof value === "object") {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
      }
    }
    let s = game.setup([A, B], createRng(1));
    for (const p of [A, B]) {
      const before = structuredClone(s);
      freeze(s);
      const next = send(s, p, result([500, 700], 2));
      expect(s).toEqual(before);
      expect(JSON.parse(JSON.stringify(next))).toEqual(next);
      s = next;
    }
  });
});

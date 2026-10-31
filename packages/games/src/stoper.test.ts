import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { type Move, type State, stoper as game } from "./stoper.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy naraz, każdy zatrzymuje stoper u siebie, oddaje odchyłkę od celu w ms (0-cel),
// - mniejsza odchyłka wyżej; zwycięzca tylko przy 2+ graczach i bez remisu,
// - cel losuje serwer: pełne sekundy 6-14 s, ten sam dla wszystkich,
// - po limicie czasu najgorszy wynik (odchyłka równa celowi).

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (deviation: number): Move => ({ type: "result", deviation });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("cel to pełne sekundy 6-14 s i trafiają się oba końce", () => {
  const targets = Array.from({ length: 200 }, (_, i) => game.setup([A, B], createRng(i)).target);
  for (const t of targets) {
    expect(t % 1000).toBe(0);
    expect(t).toBeGreaterThanOrEqual(6000);
    expect(t).toBeLessThanOrEqual(14_000);
  }
  expect(new Set(targets).size).toBe(9);
});

test("wszyscy grają naraz, rewanż ma inne wyzwanie", () => {
  const s = game.setup([A, B], createRng(1));
  expect(game.waitingFor(s)).toEqual([A, B]);
  expect(game.setup([A, B], createRng(2)).nonce).not.toBe(s.nonce);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  test.each([[-1], [s.target + 1], [1.5]])("odchyłka %s", (d) => expect(game.validateMove(s, A, result(d))).toBe(false));
  test("obcy gracz", () => expect(game.validateMove(s, C, result(10))).toBe(false));
  test("drugi wynik", () => expect(game.validateMove(send(s, A, result(10)), A, result(5))).toBe(false));
  test("trafienie w punkt", () => expect(game.validateMove(s, A, result(0))).toBe(true));
  test("najgorszy wynik", () => expect(game.validateMove(s, A, result(s.target))).toBe(true));
});

describe("koniec", () => {
  test("mniejsza odchyłka wygrywa", () => {
    let s = game.setup([A, B, C], createRng(1));
    expect(game.isOver(s)).toBeNull();
    s = send(s, A, result(300));
    s = send(s, B, result(15));
    s = send(s, C, result(120));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
  });

  test("remis: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(40));
    s = send(s, B, result(40));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
  });

  test("po limicie czasu najgorszy wynik", () => {
    const s = game.setup([A, B], createRng(1));
    expect(game.timeoutMove!(s, A, createRng(1))).toEqual(result(s.target));
  });
});


// P4-032: nazwane luki istniejących zasad z F4.
test("P4-032/F4-004: definicja 1-6 graczy", () => {
  expect([game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual([1, 6, 60]);
});

test("P4-032/F4-005: ten sam seed daje ten sam setup", () => {
  const s = game.setup([A, B], createRng(7));
  expect(game.setup([A, B], createRng(7))).toEqual(s);
});


test("P4-032/F4-006: po końcu każdy typ ruchu jest odrzucony dla graczy i obcego", () => {
  let s = game.setup([A, B], createRng(1));
  for (const p of [A, B]) s = send(s, p, result(100));
  expect(game.isOver(s)).not.toBeNull();
  for (const p of [A, B, "obcy"]) for (const move of [result(100)]) expect(game.validateMove(s, p, move)).toBe(false);
});

test.each([null, {}, { type: "nieznany", deviation: 0 }, { type: "result" }, { type: "result", deviation: "0" }])("P4-032/F4-008: schemat odrzuca %j", (move) => {
  expect(game.moveSchema.safeParse(move).success).toBe(false);
});

test.each([A, C])("P4-032/F4-009: wygrywa także %s", (winner) => {
  let s = game.setup([A, B, C], createRng(1));
  for (const p of [A, B, C]) {
    s = send(s, p, result(p === winner ? 0 : 100));
  }
  expect(game.isOver(s)?.winner).toBe(winner);
  expect(game.waitingFor(s)).toEqual([]);
});

test("P4-032/F4-010: każdy typ ruchu bez mutacji zamrożonego wejścia i z JSON round-trip", () => {
  function freeze(value: unknown): void {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  }
  let s = game.setup([A, B], createRng(1));
  const moves: Move[] = [result(100)];
  for (const move of moves) {
    const before = structuredClone(s);
    freeze(s);
    const after = send(s, A, move);
    expect(s).toEqual(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
    s = after;
  }
});

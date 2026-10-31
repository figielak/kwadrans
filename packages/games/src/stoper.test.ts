import { describe, expect, test } from "vitest";
import { createRng, soloState } from "./core.ts";
import { type Move, type State, stoper as game } from "./stoper.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy naraz, każdy zatrzymuje stoper u siebie, oddaje odchyłkę od celu w ms (0-cel),
// - mniejsza odchyłka wyżej; zwycięzca tylko przy 2+ graczach i bez remisu,
// - cel jest stały: 10 s dla wszystkich i w każdej partii (P4-055; dawniej losowe 6-14 s, stare partie zostają ze swoim celem),
// - po limicie czasu najgorszy wynik (odchyłka równa celowi).

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (deviation: number): Move => ({ type: "result", deviation });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("P4-055: cel zawsze 10 s, w każdej partii", () => {
  const targets = new Set(Array.from({ length: 200 }, (_, i) => game.setup([A, B], createRng(i)).target));
  expect([...targets]).toEqual([10_000]);
});

test("P4-055: wynik graniczny 0 i równy celowi, timeout to cel", () => {
  const s = game.setup([A], createRng(3));
  expect(game.validateMove(s, A, { type: "result", deviation: 0, stopped: 10_000 })).toBe(true);
  expect(game.validateMove(s, A, { type: "result", deviation: 10_000, stopped: 20_000 })).toBe(true);
  expect(game.validateMove(s, A, result(10_001))).toBe(false);
  expect(game.timeoutMove!(s, A, createRng(1))).toEqual(result(10_000));
});

test("P4-055: stara partia z innym celem liczy się po swoim celu", () => {
  const old: State = { players: [A], target: 7000, nonce: 1, results: {}, stops: {} };
  expect(game.validateMove(old, A, { type: "result", deviation: 500, stopped: 7500 })).toBe(true);
  expect(game.validateMove(old, A, result(7001))).toBe(false);
  expect(game.timeoutMove!(old, A, createRng(1))).toEqual(result(7000));
  expect(game.applyMove(old, A, { type: "result", deviation: 500, stopped: 7500 }, createRng(1)).target).toBe(7000);
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

// P4-033/F4-016: dane kafla są zapisem pomiaru, nie zmieniają punktacji.
describe("kafel Stopera ze stanu", () => {
  test.each([-123, 0, 456])("czas zatrzymania zachowuje znak odchyłki %i po soloState i JSON", (offset) => {
    const s = game.setup([A, B], createRng(1));
    const stopped = s.target + offset;
    const move = game.moveSchema.parse({ type: "result", deviation: Math.abs(offset), stopped });
    const before = structuredClone(s);
    const after = send(s, A, move);
    expect(s).toEqual(before);
    expect(after).toMatchObject({ stops: { [A]: stopped }, results: { [A]: Math.abs(offset) } });
    const restored = JSON.parse(JSON.stringify(soloState(after, A)));
    expect(game.playerView(restored, "")).toMatchObject({ players: ["1"], stops: { "1": stopped }, results: { "1": Math.abs(offset) } });
  });

  test.each([-1, 1.5, Infinity, NaN, "1000"])("schemat odrzuca zły pomiar stopped=%s", (stopped) => {
    expect(game.moveSchema.safeParse({ type: "result", deviation: 0, stopped }).success).toBe(false);
  });

  test("pomiar musi odpowiadać odchyłce i mieścić się między 0 a dwukrotnością celu", () => {
    const s = game.setup([A, B], createRng(1));
    for (const stopped of [0, s.target, 2 * s.target]) {
      const move = game.moveSchema.parse({ type: "result", deviation: Math.abs(stopped - s.target), stopped });
      expect(game.validateMove(s, A, move)).toBe(true);
    }
    for (const [stopped, deviation] of [[s.target + 100, 99], [2 * s.target + 1, s.target]]) {
      const move = game.moveSchema.parse({ type: "result", deviation, stopped });
      expect(game.validateMove(s, A, move)).toBe(false);
    }
  });

  test("dawny ruch i timeout nie dopisują nieznanego czasu zatrzymania", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(100));
    s = send(s, B, game.timeoutMove!(s, B, createRng(1)));
    expect(s).toMatchObject({ stops: {} });
    expect(game.record!.score(s, A)).toBe(100);
  });
});

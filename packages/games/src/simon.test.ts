import { describe, expect, test } from "vitest";
import { createRng, soloState } from "./core.ts";
import { type Move, simon as game, type State, type View } from "./simon.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie tę samą sekwencję 4 kolorów,
// - klient oddaje najdłuższą powtórzoną serię (0 do długości sekwencji),
// - ranking: dłuższa seria wyżej; zwycięzca tylko przy 2+ graczach i bez remisu.

const A = "ania";
const B = "bartek";
const C = "celina";

const result = (score: number): Move => ({ type: "result", score });

function send(s: State, player: string, move: Move): State {
  expect(game.validateMove(s, player, move), `${player} oddaje wynik`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

test("setup: wspólna sekwencja kolorów 0-3, wszyscy grają naraz", () => {
  const s = game.setup([A, B], createRng(1));
  expect(game.waitingFor(s)).toEqual([A, B]);
  const { sequence } = game.playerView(s, A) as View;
  expect(sequence.length).toBeGreaterThanOrEqual(50);
  expect(sequence.every((c) => [0, 1, 2, 3].includes(c))).toBe(true);
  expect((game.playerView(s, B) as View).sequence).toEqual(sequence);
});

describe("walidacja", () => {
  const s = game.setup([A, B], createRng(1));
  const length = (game.playerView(s, A) as View).sequence.length;
  test("wynik poza zakresem", () => {
    expect(game.validateMove(s, A, result(-1))).toBe(false);
    expect(game.validateMove(s, A, result(length + 1))).toBe(false);
    expect(game.validateMove(s, A, result(length))).toBe(true);
  });
  test("obcy gracz", () => expect(game.validateMove(s, C, result(3))).toBe(false));
  test("drugi wynik tego samego gracza", () => {
    expect(game.validateMove(send(s, A, result(3)), A, result(5))).toBe(false);
  });
});

describe("koniec", () => {
  test("ranking po długości serii", () => {
    let s = game.setup([A, B, C], createRng(1));
    s = send(s, A, result(4));
    expect(game.isOver(s)).toBeNull();
    expect(game.waitingFor(s)).toEqual([B, C]);
    s = send(s, B, result(9));
    s = send(s, C, result(6));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
  });

  test("remis na górze i solo: bez zwycięzcy", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, result(5));
    s = send(s, B, result(5));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.isOver(send(game.setup([A], createRng(1)), A, result(5)))).toEqual({ ranking: [A] });
  });

  test("po limicie czasu wynik 0", () => {
    expect(game.timeoutMove!(game.setup([A], createRng(1)), A, createRng(1))).toEqual(result(0));
  });
});

// P4-004: walidowany, rosnący postęp zachowuje ukończoną serię po limicie i odświeżeniu.
const progress = (score: number): Move => game.moveSchema.parse({ type: "progress", score });

describe("ostatnia zaliczona seria", () => {
  test("limit ma stały klucz, a setup zaczyna z pustym postępem", () => {
    const s = game.setup([A, B], createRng(1));
    expect(s).toMatchObject({ progress: {} });
    expect(game.turn?.(s)).toEqual({ key: "run", seconds: 300 });
  });

  test.each([0, 1, 100])("postęp %i jest dozwolony, widoczny i nie kończy gry", (score) => {
    const s = game.setup([A, B], createRng(1));
    const after = send(s, A, progress(score));
    expect(after).toMatchObject({ progress: { [A]: score }, results: {} });
    expect(game.waitingFor(after)).toEqual([A, B]);
    expect(game.isOver(after)).toBeNull();
    expect(game.turn?.(after)).toEqual(game.turn?.(s));
    for (const viewer of [A, B, ""]) expect(game.playerView(after, viewer)).toMatchObject({ progress: { [A]: score } });
    expect(game.timeoutMove!(after, A, createRng(1))).toEqual(result(score));
  });

  test.each([-1, 101, 1.5, NaN, Infinity])("schemat odrzuca postęp %s", (score) => {
    const s = game.setup([A], createRng(1));
    const parsed = game.moveSchema.safeParse({ type: "progress", score });
    expect(parsed.success && game.validateMove(s, A, parsed.data)).toBe(false);
  });

  test("postęp nie może się cofnąć, a duplikat nie daje kolejnej serii", () => {
    let s = game.setup([A, B], createRng(1));
    s = send(s, A, progress(7));
    expect(game.validateMove(s, A, progress(6))).toBe(false);
    expect(game.validateMove(s, A, result(6))).toBe(false);
    expect(send(s, A, progress(7))).toEqual(s);
    expect(game.timeoutMove!(s, A, createRng(1))).toEqual(result(7));
    expect(game.timeoutMove!(s, B, createRng(1))).toEqual(result(0));
  });

  test("obcy gracz, wynik i postęp po końcu są odrzucane", () => {
    let s = game.setup([A, B], createRng(1));
    expect(game.validateMove(s, C, progress(1))).toBe(false);
    s = send(s, A, result(2));
    expect(game.validateMove(s, A, progress(3))).toBe(false);
    s = send(s, B, result(4));
    for (const p of [A, B, C]) {
      expect(game.validateMove(s, p, progress(5))).toBe(false);
      expect(game.validateMove(s, p, result(5))).toBe(false);
    }
  });

  test.each([1, 2, 6])("%i graczy: timeout zachowuje ukończone serie, miejsca i rekordy", (n) => {
    const players = [A, B, C, "darek", "ewa", "filip"].slice(0, n);
    let s = game.setup(players, createRng(1));
    for (const p of players) s = send(s, p, progress(7));
    const before = JSON.stringify(s);
    for (const p of players) s = send(s, p, game.timeoutMove!(s, p, createRng(1)));
    expect(game.isOver(s)).toEqual({ ranking: players });
    expect(game.places!(s)).toEqual(Object.fromEntries(players.map(p => [p, 1])));
    expect(game.record!.score(s, A)).toBe(7);
    expect(game.record!.tie).toBeUndefined();
    const solo = soloState(s, A);
    expect(game.record!.score(solo, "1")).toBe(7);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(JSON.parse(before)).toMatchObject({ results: {} });
  });

  test("nie ukończona następna seria nie zwiększa zapisanego wyniku", () => {
    let s = send(game.setup([A, B], createRng(1)), A, progress(9));
    s = send(s, B, result(10));
    s = send(s, A, game.timeoutMove!(s, A, createRng(1)));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places!(s)).toEqual({ [A]: 2, [B]: 1 });
  });

  test("stary detail bez progress zachowuje zapisany wynik", () => {
    const s = send(game.setup([A], createRng(1)), A, result(12));
    const old = JSON.parse(JSON.stringify(s));
    delete old.progress;
    const solo = soloState(old, A);
    expect(game.record!.score(solo, "1")).toBe(12);
    expect(game.playerView(solo, "")).toEqual(solo);
    expect(solo).not.toHaveProperty("progress");
  });
});


// P4-032: nazwane luki istniejących zasad z F4.
test("P4-032/F4-004: definicja 1-6 graczy, świeża gra trwa", () => {
  expect([game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual([1, 6, 300]);
  for (const players of [[A], [A, B, C, "darek", "ela", "filip"]]) expect(game.isOver(game.setup(players, createRng(1)))).toBeNull();
});

test("P4-032/F4-005: ten sam seed daje ten sam setup, seedy zmieniają wyzwanie", () => {
  const s = game.setup([A, B], createRng(7));
  expect(game.setup([A, B], createRng(7))).toEqual(s);
  expect(s.sequence).toHaveLength(100);
  expect(game.setup([A, B], createRng(8)).sequence).not.toEqual(s.sequence);
});

test.each([null, {}, { type: "nieznany", score: 0 }, { type: "result" }, { type: "result", score: "1" }, { type: "result", score: 1.5 }, { type: "progress" }, { type: "progress", score: "1" }])("P4-032/F4-008: schemat odrzuca %j", (move) => {
  expect(game.moveSchema.safeParse(move).success).toBe(false);
});

test.each([A, C])("P4-032/F4-009: wygrywa także %s", (winner) => {
  let s = game.setup([A, B, C], createRng(1));
  for (const p of [A, B, C]) {
    s = send(s, p, result(p === winner ? 10 : 5));
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
  const moves: Move[] = [progress(3), result(5)];
  for (const move of moves) {
    const before = structuredClone(s);
    freeze(s);
    const after = send(s, A, move);
    expect(s).toEqual(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
    s = after;
  }
});

test("P4-032/F4-007: wynik 0 przechodzi", () => {
  const s = game.setup([A, B], createRng(1));
  expect(send(s, A, result(0)).results[A]).toBe(0);
});

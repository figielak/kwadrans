import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { BOARD, buildCost, CHARACTERS, kampusTour as game, type Move, type State } from "./kampus-tour.ts";

// P4-029: wyłącznie luki F4 istniejących zasad. Każdy stan powstaje z setup i legalnych ruchów.
const players = ["ania", "bartek", "celina", "darek"];
const A = players[0];

function freeze(value: unknown): void {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}

// F4-010, F4-012: sprawdzamy każdy rodzaj ruchu i każdą odwiedzoną fazę, także pick i over.
function checkView(s: State) {
  const v = game.playerView(s, "");
  expect(v).not.toHaveProperty("deck");
  expect(v).toHaveProperty("deckSize", s.deck.length);
  expect(JSON.parse(JSON.stringify(v))).toEqual(v);
}

function play(s: State, move: Move, a = 1, b = 2): State {
  const player = game.waitingFor(s)[0];
  expect(game.moveSchema.safeParse(move).success).toBe(true);
  expect(game.validateMove(s, player, move), JSON.stringify(move)).toBe(true);
  const before = structuredClone(s);
  freeze(s);
  let i = 0;
  const next = game.applyMove(s, player, move, () => ((i++ === 0 ? a : b) - 0.5) / 6);
  expect(s).toEqual(before);
  expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  checkView(next);
  return next;
}

function start(seed: number, n = 2): State {
  let s = game.setup(players.slice(0, n), createRng(seed));
  checkView(s);
  for (let i = 0; i < n; i++) s = play(s, { type: "pick", character: i });
  return s;
}

// Zapisane rozgrywki: rAB = kości A+B; b = kup, u = wykup, lN = buduj N,
// sN = sprzedaj N, jN = Juwenalia N, c = odkryj kartę, x = pomiń.
function replay(seed: number, n: number, trace: string): State {
  let s = start(seed, n);
  for (const code of trace.split(" ").filter(Boolean)) {
    const arg = Number(code.slice(1));
    if (code[0] === "r") s = play(s, { type: "roll" }, Number(code[1]), Number(code[2]));
    else if (code[0] === "l") s = play(s, { type: "build", level: arg });
    else if (code[0] === "s") s = play(s, { type: "sell", tile: arg });
    else if (code[0] === "j") s = play(s, { type: "juwenalia", tile: arg });
    else s = play(s, { type: code === "b" ? "buy" : code === "u" ? "buyout" : code === "c" ? "card" : "skip" });
  }
  return s;
}

const current = (s: State) => game.waitingFor(s)[0];
const tileValue = (s: State, tile: number) => {
  const field = BOARD[tile];
  if (!("price" in field)) throw new Error("pole bez ceny");
  return field.price + buildCost(tile, 0, s.levels[tile] ?? 0);
};

const travel = () => replay(5627, 2, "r55 x r33 r56 r36 b l2");
const sale_odd = () => replay(101, 2, "r15 x r26 b l2 r36 b l2 r61 u r61 x r22 b l1 r36");
const buy_exact = () => replay(6315, 2, "r36 b l1 r46 b l1 r62 b l2 r34 u r24 x r34");
const festival31 = () => replay(8017, 2, "r32 c b l1 r13 b l1 r23 u l2 r35 b x r66");
const festival = () => replay(1365, 2, "r62 b l2 r25 b r26 j8 r36");
const sell31 = () => replay(3840, 4, "r33 b l1 r55 j6 r56 r35 b l2 r51 x r56 r22 b l2 r63 u r31 b x r64 r25 b l2 r64");
const buyout_exact = () => replay(539, 2, "r32 c r22 x r25 r55 c r44 x r42 b l2 r13");
const pass = () => replay(2185, 2, "r52 x r41 c r42 c r26 c r44 c r22 x r16");
const build_exact = () => replay(6587, 2, "r32 c r14 c r66 b l1 r53 b l1 r31 b l2 r24 b");
const bankrupt_festival = () => replay(5953, 2, "r21 b l1 r66 b l1 r42 x r63 u l2 r53 b l2 r64 b x r14 b l2 r31 r34 b l2 r31 r23 r11 r52 b r26 b l2 r32 r34 r25 s3 s12 r13 b l2 r56 s7 s22 r42 x r56 b l2 r26 b x r52 j9 r46 b l2");
const no_buyout = () => replay(9312, 4, "r61 x r35 b l1 r32 c r22 b l1 r25 r64 b l1 r23 c r32 b x r44 x r44 r42 b l2 r64 x r21 c j10 r32 r61 b l2 r63 r13 b l2 r51 x r22 b l2 r24 r14 c r31 b l2 r45 x r56 b r12 b l1 r24 r12 b l2 r24 b r45 b l1 r31 x r21 c r55 u l2 r25");
const creditors = () => replay(11510, 4, "r62 b l2 r13 b l1 r22 x r24 b l1 r45 b l1 r51 b l2 r66 j4 r56 r12 c r36 b l2 r35 x r66 b r46 b l1 r11 c r66 b l1 r14 b l2 r62 r16 x r23 u r62 r35 b l2 r53 r12 c r63 x r33 b l1 r35 b l1 r32 c r13 x r41 b l2 r62 s6 r13 x r46 u r22 b r62 c r65 r62 l2 r14 s3 r61 u l2 r52 r45 b l2 r26 j18 r52 b l1 r42 l2 r15 r41 c r26 r63 x r25 r35 r22 b l2 r22 b x r11 r54 b l1 r52 x r32 c r61 r45 x r21 r25 r13 b l2 r34 b l2 r45 r56 s10 s18 r62 b l1 r16 x r66 x r51 u r54 r52 l2 r12 r56 r33 r34");


describe("P4-029: brakujące testy Kampus Tour", () => {
  test.each([2, 3, 4])("F4-004: świeża gra dla %i graczy nie jest skończona, limit 60 s", (n) => {
    expect(game.turnSeconds).toBe(60);
    expect(game.isOver(game.setup(players.slice(0, n), createRng(1)))).toBeNull();
  });

  test.each([
    null, "roll", {}, { type: "nieznany" }, { type: "pick" },
    { type: "pick", character: "0" }, { type: "pick", character: 1.5 },
    { type: "build" }, { type: "build", level: 1.5 },
    ...["sell", "travel", "juwenalia"].flatMap((type) => [
      { type }, { type, tile: "1" }, { type, tile: 1.5 }, { type, tile: -1 }, { type, tile: 32 },
    ]),
  ])("F4-008: schemat odrzuca śmieci %j", (move) => {
    expect(game.moveSchema.safeParse(move).success).toBe(false);
  });

  test("F4-007: postać -1 odpada, skrajne postaci 0 i 5 przechodzą", () => {
    const s = game.setup(players.slice(0, 2), createRng(1));
    for (const character of [-1, 0, CHARACTERS.length - 1, CHARACTERS.length]) {
      const move = { type: "pick" as const, character };
      const valid = character >= 0 && character < CHARACTERS.length;
      expect(game.moveSchema.safeParse(move).success).toBe(valid);
      expect(game.validateMove(s, A, move)).toBe(valid);
    }
  });

  test("F4-007: kupno przy gotówce dokładnie równej cenie", () => {
    const s = buy_exact(), p = current(s), tile = s.positions[p];
    expect(s.cash[p]).toBe(tileValue(s, tile));
    const next = play(s, { type: "buy" });
    expect(next.cash[p]).toBe(0);
    expect(next.owners[tile]).toBe(p);
  });

  test("F4-007: budowa przy gotówce dokładnie równej kosztowi", () => {
    const s = build_exact(), p = current(s), tile = s.positions[p], level = (s.levels[tile] ?? 0) + 1;
    expect(s.cash[p]).toBe(buildCost(tile, s.levels[tile] ?? 0, level));
    const next = play(s, { type: "build", level });
    expect(next.cash[p]).toBe(0);
    expect(next.levels[tile]).toBe(level);
  });

  test("F4-007: wykup przy gotówce dokładnie równej cenie", () => {
    const s = buyout_exact(), p = current(s), tile = s.positions[p];
    expect(s.cash[p]).toBe(2 * tileValue(s, tile));
    const next = play(s, { type: "buyout" });
    expect(next.cash[p]).toBe(0);
    expect(next.owners[tile]).toBe(p);
  });

  test.each([0, 31])("F4-007, F4-028: MPK na skrajne pole %i; dublet 3+3 nie daje rzutu", (tile) => {
    const s = travel(), p = current(s), cash = s.cash[p];
    let next = play(s, { type: "travel", tile }, 3, 3);
    expect(next.positions[p]).toBe(tile);
    expect(next.cash[p]).toBe(cash);
    if (next.phase === "buy") next = play(next, { type: "skip" });
    expect(game.waitingFor(next)).not.toContain(p);
  });

  test("F4-007: Juwenalia na 31 przechodzą, Początek 0 nie jest własnym polem", () => {
    const s = festival31(), p = current(s);
    expect(game.validateMove(s, p, { type: "juwenalia", tile: 0 })).toBe(false);
    expect(play(s, { type: "juwenalia", tile: 31 }).juwenalia?.tile).toBe(31);
  });

  test("F4-007: sprzedaż 31 przechodzi, Początek 0 nie jest na sprzedaż", () => {
    const s = sell31(), p = current(s);
    expect(game.validateMove(s, p, { type: "sell", tile: 0 })).toBe(false);
    expect(play(s, { type: "sell", tile: 31 }).owners[31]).toBeUndefined();
  });

  test("F4-027: Zaliczenie na Kolokwium i dublet dają kolejny rzut", () => {
    const s = pass(), p = current(s);
    expect(s.kolokwium).toContain(p);
    expect(s.passes[p]).toBe(1);
    let next = play(s, { type: "roll" }, 2, 2);
    if (next.phase === "buy" || next.phase === "build" || next.phase === "buyout") next = play(next, { type: "skip" });
    expect(next.passes[p]).toBe(0);
    expect(next.kolokwium).not.toContain(p);
    expect(next.deck).toHaveLength(s.deck.length + 1);
    expect(next.phase).toBe("roll");
    expect(game.waitingFor(next)).toEqual([p]);
  });

  test("F4-029: Juwenalia drugiego gracza korzystają ze wspólnego licznika", () => {
    const s = festival(), p = current(s), previous = s.juwenalia!;
    expect(s.owners[previous.tile]).not.toBe(p);
    expect(previous.factor).toBe(2);
    const tile = Number(Object.keys(s.owners).find((t) => s.owners[Number(t)] === p));
    expect(play(s, { type: "juwenalia", tile }).juwenalia).toEqual({ tile, factor: 3 });
  });

  test("F4-032: po przymusowej sprzedaży brak oferty wykupu nawet z wystarczającą resztą", () => {
    const s = no_buyout(), p = current(s), target = s.positions[p];
    const tile = Number(Object.keys(s.owners).find((t) => s.owners[Number(t)] === p &&
      s.cash[p] + Math.floor(tileValue(s, Number(t)) / 2) - s.debt!.amount >= 2 * tileValue(s, target)));
    const next = play(s, { type: "sell", tile });
    expect(next.cash[p]).toBeGreaterThanOrEqual(2 * tileValue(s, target));
    expect(next.phase).not.toBe("buyout");
    expect(game.validateMove(next, p, { type: "buyout" })).toBe(false);
  });

  test("F4-033: bankructwo ze Składki przy czterech graczach dzieli dostępną gotówkę po równo", () => {
    const s = creditors(), p = current(s), cash = s.cash[p];
    expect(cash).toBeGreaterThan(0);
    expect(cash).toBeLessThan(15);
    const next = play(s, { type: "card" });
    expect(next.bankrupt).toContain(p);
    expect(next.cash[p]).toBe(0);
    for (const q of s.players.filter((q) => q !== p)) expect(next.cash[q] - s.cash[q]).toBe(Math.floor(cash / 3));
  });

  test("F4-033, F4-012: bankructwo usuwa Juwenalia; obserwator po końcu nadal nie zna talii", () => {
    const before = bankrupt_festival(), p = current(before);
    expect(before.juwenalia).not.toBeNull();
    expect(before.owners[before.juwenalia!.tile]).toBe(p);
    const next = play(before, { type: "roll" }, 2, 1);
    expect(next.bankrupt).toContain(p);
    expect(game.isOver(next)).not.toBeNull();
    expect(next.juwenalia).toBeNull();
    checkView(next);
  });

  test("F4-034: sprzedaż pola o nieparzystej wartości zaokrągla połowę w dół", () => {
    const s = sale_odd(), p = current(s);
    const tile = Number(Object.keys(s.owners).find((t) => s.owners[Number(t)] === p && tileValue(s, Number(t)) % 2 === 1));
    const value = tileValue(s, tile);
    const next = play(s, { type: "sell", tile });
    expect(next.events).toContainEqual({ type: "sell", player: p, tile, amount: Math.floor(value / 2) });
  });
});

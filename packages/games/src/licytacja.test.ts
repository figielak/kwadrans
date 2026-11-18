import { describe, expect, test } from "vitest";
import { createRng, type Rng } from "./core.ts";
import {
  arrange,
  CHOOSE_SECONDS,
  HAND,
  judge,
  licytacja as game,
  type Move,
  PRIZES,
  REVEAL_SECONDS,
  ROUNDS,
  type State,
  type View,
} from "./licytacja.ts";

// Testy napisane przed implementacją. Ustalają zasady (ZASADY-GIER.md §15):
// - 2-6 graczy, 15 rund, każdy ma rękę 1-15 (każda karta raz), 15 nagród od −5 do −1 i od +1 do +10 tasowanych przez rng,
// - w rundzie odkrywa się nagroda i trafia do puli; wszyscy naraz zatwierdzają jedną kartę z ręki, wybór jest tajny i nieodwołalny,
// - równe karty się znoszą; znak najnowszej nagrody w puli wyznacza kierunek: dodatnia, wygrywa najwyższa karta bez pary,
//   ujemna, najniższa; zwycięzca bierze sumę puli, bez karty bez pary pula przechodzi do następnej rundy,
// - zagrane karty odpadają z rąk, także zniesione,
// - po każdej rundzie poza ostatnią odsłona: komplet „Dalej” albo limit; ostatnia runda rozstrzyga się sama, pula bez zwycięzcy przepada,
// - wygrywa najwięcej punktów, remis na górze bez zwycięzcy, równe punkty to wspólne miejsca,
// - każdy ruch ma nonce i rundę; stary ruch, druga karta, karta spoza ręki i obcy gracz odpadają,
// - limit wyboru to losowa karta z ręki, limit odsłony to next; klucz czasu zmienia tylko runda, faza albo nonce,
// - widok nie ma kolejności nagród ani cudzych kart przed rozstrzygnięciem, obserwator i obce id widzą to samo,
// - punkty się zgadzają: suma punktów i przepadłej puli to suma nagród (+40).

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const E = "ewa";
const F = "filip";
const TWO = [A, B];
const THREE = [A, B, C];
const FOUR = [A, B, C, D];
const SIX = [A, B, C, D, E, F];
const OBSERVER = "";
const STRANGER = "ktos-obcy";
const FULL_HAND = Array.from({ length: 15 }, (_, i) => i + 1);
const PRIZE_SUM = 40;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

/** Każdy stan w testach jest zamrożony: mutacja w applyMove kończy test błędem. */
const start = (players: string[] = THREE, seed = 1) => deepFreeze(game.setup(players, createRng(seed)));

/** Partia z ustaloną kolejnością nagród: podane idą pierwsze, reszta rosnąco. */
const fixed = (players: string[], ...first: number[]) =>
  deepFreeze(arrange(start(players), [...first, ...PRIZES.filter((p) => !first.includes(p)).sort((x, y) => x - y)]));

function send(s: State, player: string, move: Move, rng: Rng = createRng(1)): State {
  expect(game.validateMove(s, player, move), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return deepFreeze(game.applyMove(s, player, move, rng));
}

const rejects = (s: State, player: string, move: unknown) => expect(game.validateMove(s, player, move as Move), JSON.stringify(move)).toBe(false);

const play = (s: State, card: number): Move => ({ type: "play", card, nonce: s.nonce, round: s.round });
const next = (s: State): Move => ({ type: "next", nonce: s.nonce, round: s.round });

/** Komplet kart w rundzie, w kolejności graczy. */
const round = (s: State, cards: Record<string, number>) => s.players.reduce((acc, p) => send(acc, p, play(acc, cards[p])), s);
const allNext = (s: State) => s.players.reduce((acc, p) => send(acc, p, next(acc)), s);

/** Zła implementacja bez końca partii ma oblać test, a nie zawiesić go w synchronicznej pętli. */
const MAX_STEPS = 500;
function guard(steps: number) {
  if (steps > MAX_STEPS) throw new Error("partia się nie kończy");
  return steps + 1;
}

/** Partia według wybranej karty; `until` zatrzymuje wcześniej, `onEach` dostaje każdy stan. */
function playAll(s: State, pick: (s: State, player: string) => number, until: (s: State) => boolean = () => false, onEach: (s: State) => void = () => {}) {
  let acc = s;
  let steps = 0;
  onEach(acc);
  while (acc.phase !== "over" && !until(acc)) {
    steps = guard(steps);
    acc = acc.phase === "reveal" ? allNext(acc) : acc.players.reduce((inner, p) => send(inner, p, play(inner, pick(inner, p))), acc);
    onEach(acc);
  }
  return acc;
}

const lowest = (s: State, p: string) => Math.min(...s.hands[p]);
const highest = (s: State, p: string) => Math.max(...s.hands[p]);
const timeoutOf = (s: State, player: string, rng: Rng = createRng(1)) => game.timeoutMove?.(s, player, rng) as Move;

/** Partia do końca samymi ruchami limitu, tak jak robi to zegar serwera. */
function timeoutAll(s: State, rng: Rng = createRng(3), onEach: (s: State) => void = () => {}) {
  let acc = s;
  let steps = 0;
  while (game.waitingFor(acc).length) {
    steps = guard(steps);
    const player = game.waitingFor(acc)[0];
    const move = timeoutOf(acc, player, rng);
    expect(game.validateMove(acc, player, move, { source: "timeout" })).toBe(true);
    acc = deepFreeze(game.applyMove(acc, player, move, rng));
    onEach(acc);
  }
  return acc;
}

const view = (s: State, player: string) => game.playerView(s, player) as View;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const scoreSum = (s: State) => sum(Object.values(s.score));

describe("definicja", () => {
  test("2-6 graczy, bez trybów, rekordu i podglądu", () => {
    expect(game.id).toBe("licytacja");
    expect(game.name).toBe("Licytacja na ślepo");
    expect(game.minPlayers).toBe(2);
    expect(game.maxPlayers).toBe(6);
    expect(game.modes).toBeUndefined();
    expect(game.record).toBeUndefined();
    expect(game.live).toBeUndefined();
  });

  test("stałe zgodne z zasadami", () => {
    expect(ROUNDS).toBe(15);
    expect(HAND).toBe(15);
    expect(CHOOSE_SECONDS).toBe(20);
    expect(REVEAL_SECONDS).toBe(10);
    expect([...PRIZES].sort((x, y) => x - y)).toEqual([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(sum(PRIZES)).toBe(PRIZE_SUM);
  });
});

describe("setup", () => {
  test("pełne ręce, zero punktów, pierwsza runda z odkrytą nagrodą", () => {
    const s = start(FOUR);
    expect(s.players).toEqual(FOUR);
    for (const p of FOUR) {
      expect(s.hands[p]).toEqual(FULL_HAND);
      expect(s.score[p]).toBe(0);
    }
    expect(s.round).toBe(1);
    expect(s.phase).toBe("choose");
    expect(s.pot).toHaveLength(1);
    expect(s.prizes).toHaveLength(ROUNDS - 1);
    expect([...s.pot, ...s.prizes].sort((x, y) => x - y)).toEqual([...PRIZES].sort((x, y) => x - y));
    expect(s.choices).toEqual({});
    expect(s.ready).toEqual([]);
    expect(s.history).toEqual([]);
    expect(game.isOver(s)).toBeNull();
    expect(game.waitingFor(s)).toEqual(FOUR);
  });

  test("ziarno wyznacza kolejność nagród i nonce", () => {
    const a = start(THREE, 5);
    const b = start(THREE, 5);
    expect([a.pot, a.prizes, a.nonce]).toEqual([b.pot, b.prizes, b.nonce]);
    const orders = new Set(Array.from({ length: 10 }, (_, i) => JSON.stringify(start(THREE, i + 1).prizes)));
    expect(orders.size).toBeGreaterThan(1);
    const nonces = new Set(Array.from({ length: 10 }, (_, i) => start(THREE, i + 1).nonce));
    expect(nonces.size).toBeGreaterThan(1);
  });

  test("arrange ustawia kolejność nagród", () => {
    const s = fixed(TWO, 7, -4);
    expect(s.pot).toEqual([7]);
    expect(s.prizes[0]).toBe(-4);
    expect(s.prizes).toHaveLength(ROUNDS - 1);
  });
});

describe("walidacja", () => {
  test("dozwolone karty z ręki przechodzą", () => {
    const s = start(TWO);
    expect(game.validateMove(s, A, play(s, 1))).toBe(true);
    expect(game.validateMove(s, B, play(s, 15))).toBe(true);
  });

  test("obcy, obserwator, zła karta i zły kształt odpadają", () => {
    const s = start(TWO);
    rejects(s, STRANGER, play(s, 3));
    rejects(s, OBSERVER, play(s, 3));
    for (const card of [0, 16, -1, 1.5, "3", null]) rejects(s, A, { ...play(s, 1), card });
    rejects(s, A, { type: "play", nonce: s.nonce, round: s.round });
    rejects(s, A, { type: "bid", card: 3, nonce: s.nonce, round: s.round });
    rejects(s, A, null);
  });

  test("stary nonce albo inna runda odpadają", () => {
    const s = start(TWO);
    rejects(s, A, { ...play(s, 3), nonce: s.nonce + 1 });
    rejects(s, A, { ...play(s, 3), round: 2 });
    rejects(s, A, { ...play(s, 3), round: 0 });
  });

  test("druga karta w tej samej rundzie odpada", () => {
    const s = send(start(THREE), A, play(start(THREE), 5));
    rejects(s, A, play(s, 6));
    rejects(s, A, play(s, 5));
  });

  test("karta zagrana wcześniej odpada", () => {
    let s = fixed(TWO, 7);
    s = allNext(round(s, { [A]: 5, [B]: 9 }));
    rejects(s, A, play(s, 5));
    rejects(s, B, play(s, 9));
    expect(game.validateMove(s, A, play(s, 9))).toBe(true);
  });

  test("next w wyborze i karta w odsłonie odpadają", () => {
    const s = fixed(TWO, 7);
    rejects(s, A, next(s));
    const r = round(s, { [A]: 5, [B]: 9 });
    expect(r.phase).toBe("reveal");
    rejects(r, A, play(r, 6));
    rejects(r, A, { ...next(r), nonce: r.nonce + 1 });
    rejects(r, A, { ...next(r), round: r.round + 1 });
  });

  test("drugi next tej samej osoby odpada", () => {
    const r = round(fixed(TWO, 7), { [A]: 5, [B]: 9 });
    const s = send(r, A, next(r));
    rejects(s, A, next(s));
    rejects(s, STRANGER, next(s));
  });
});

describe("judge", () => {
  test("dodatnia nagroda: najwyższa karta bez pary", () => {
    expect(judge([7], { [A]: 3, [B]: 12, [C]: 9 })).toEqual({ winner: B, cancelled: [] });
  });

  test("równe karty się znoszą, wygrywa następna", () => {
    expect(judge([7], { [A]: 12, [B]: 12, [C]: 9 })).toEqual({ winner: C, cancelled: [12] });
    expect(judge([4], { [A]: 5, [B]: 5, [C]: 5, [D]: 4 })).toEqual({ winner: D, cancelled: [5] });
  });

  test("ujemna nagroda: najniższa karta bez pary", () => {
    expect(judge([-4], { [A]: 3, [B]: 3, [C]: 8, [D]: 1 })).toEqual({ winner: D, cancelled: [3] });
    expect(judge([-1], { [A]: 2, [B]: 14 })).toEqual({ winner: A, cancelled: [] });
  });

  test("bez karty bez pary nikt nie bierze", () => {
    expect(judge([3], { [A]: 6, [B]: 6 })).toEqual({ winner: null, cancelled: [6] });
    expect(judge([3], { [A]: 6, [B]: 6, [C]: 2, [D]: 2 })).toEqual({ winner: null, cancelled: [2, 6] });
  });

  test("kierunek wyznacza najnowsza nagroda w puli", () => {
    expect(judge([3, -2], { [A]: 2, [B]: 10 }).winner).toBe(A);
    expect(judge([-2, 3], { [A]: 2, [B]: 10 }).winner).toBe(B);
    expect(judge([5, -5], { [A]: 4, [B]: 11 }).winner).toBe(A);
  });
});

describe("runda", () => {
  test("wybór jest tajny do kompletu", () => {
    const s = start(THREE);
    const a = send(s, A, play(s, 7));
    expect(a.phase).toBe("choose");
    expect(a.hands[A]).toEqual(FULL_HAND);
    expect(game.waitingFor(a)).toEqual([B, C]);
    expect(view(a, A).myCard).toBe(7);
    expect(view(a, A).ready).toEqual([A]);
    expect(view(a, B).myCard).toBeNull();
    expect(view(a, B).ready).toEqual([A]);
    for (const p of [B, OBSERVER, STRANGER]) {
      const v = view(a, p);
      expect(v).not.toHaveProperty("choices");
      expect(v.history).toEqual([]);
    }
  });

  test("wygrana karta bierze nagrodę, karty odpadają z rąk", () => {
    const s = round(fixed(THREE, 7), { [A]: 12, [B]: 12, [C]: 9 });
    expect(s.phase).toBe("reveal");
    expect(s.score).toEqual({ [A]: 0, [B]: 0, [C]: 7 });
    expect(s.pot).toEqual([]);
    expect(s.hands[A]).not.toContain(12);
    expect(s.hands[B]).not.toContain(12);
    expect(s.hands[C]).not.toContain(9);
    expect(s.hands[A]).toHaveLength(HAND - 1);
    expect(s.choices).toEqual({});
    expect(s.history).toEqual([{ round: 1, pot: [7], plays: { [A]: 12, [B]: 12, [C]: 9 }, cancelled: [12], winner: C, value: 7 }]);
  });

  test("ujemna nagroda trafia do najniższej karty bez pary", () => {
    const s = round(fixed(FOUR, -4), { [A]: 3, [B]: 3, [C]: 8, [D]: 1 });
    expect(s.score).toEqual({ [A]: 0, [B]: 0, [C]: 0, [D]: -4 });
  });

  test("kolejność wiadomości nie zmienia wyniku", () => {
    const s = fixed(THREE, 6);
    const forward = round(s, { [A]: 4, [B]: 10, [C]: 10 });
    const backward = [C, B, A].reduce((acc, p) => send(acc, p, play(acc, { [A]: 4, [B]: 10, [C]: 10 }[p])), s);
    expect(backward.score).toEqual(forward.score);
    expect(backward.history).toEqual(forward.history);
  });

  test("bez karty bez pary pula przechodzi, kierunek z najnowszej nagrody", () => {
    let s = round(fixed(TWO, 3, -2), { [A]: 6, [B]: 6 });
    expect(s.score).toEqual({ [A]: 0, [B]: 0 });
    expect(s.pot).toEqual([3]);
    expect(s.history[0]).toMatchObject({ winner: null, cancelled: [6], value: 3 });
    s = allNext(s);
    expect(s.round).toBe(2);
    expect(s.pot).toEqual([3, -2]);
    s = round(s, { [A]: 2, [B]: 10 });
    expect(s.score).toEqual({ [A]: 1, [B]: 0 });
    expect(s.pot).toEqual([]);
    expect(s.history[1]).toMatchObject({ round: 2, pot: [3, -2], winner: A, value: 1 });
  });

  test("pula rośnie przez kilka rund", () => {
    let s = fixed(TWO, 2, 4, 10);
    s = allNext(round(s, { [A]: 1, [B]: 1 }));
    s = allNext(round(s, { [A]: 2, [B]: 2 }));
    expect(s.pot).toEqual([2, 4, 10]);
    s = round(s, { [A]: 3, [B]: 15 });
    expect(s.score).toEqual({ [A]: 0, [B]: 16 });
  });
});

describe("odsłona", () => {
  test("czeka na wszystkich, potem następna runda z nową nagrodą", () => {
    let s = round(fixed(THREE, 7, 5), { [A]: 1, [B]: 2, [C]: 3 });
    expect(game.waitingFor(s)).toEqual(THREE);
    s = send(s, B, next(s));
    expect(s.phase).toBe("reveal");
    expect(s.ready).toEqual([B]);
    expect(game.waitingFor(s)).toEqual([A, C]);
    s = send(s, A, next(s));
    s = send(s, C, next(s));
    expect(s.phase).toBe("choose");
    expect(s.round).toBe(2);
    expect(s.pot).toEqual([5]);
    expect(s.prizes).toHaveLength(ROUNDS - 2);
    expect(s.ready).toEqual([]);
    expect(game.waitingFor(s)).toEqual(THREE);
  });
});

describe("koniec", () => {
  test("ostatnia runda rozstrzyga się sama po odsłonie przedostatniej", () => {
    const before = playAll(start(THREE), lowest, (s) => s.round === ROUNDS - 1 && s.phase === "reveal");
    expect(before.phase).toBe("reveal");
    for (const p of THREE) expect(before.hands[p]).toEqual([HAND]);
    const end = allNext(before);
    expect(end.phase).toBe("over");
    expect(end.history).toHaveLength(ROUNDS);
    expect(end.history[ROUNDS - 1]).toMatchObject({ round: ROUNDS, plays: { [A]: HAND, [B]: HAND, [C]: HAND } });
    for (const p of THREE) expect(end.hands[p]).toEqual([]);
    expect(game.waitingFor(end)).toEqual([]);
    expect(game.turn?.(end).seconds).toBe(0);
  });

  test("pula bez zwycięzcy po ostatniej rundzie przepada, remis bez zwycięzcy", () => {
    const end = playAll(start(TWO, 4), lowest);
    expect(end.phase).toBe("over");
    expect(end.history.every((r) => r.winner === null)).toBe(true);
    expect(end.score).toEqual({ [A]: 0, [B]: 0 });
    expect(end.pot).toEqual([]);
    const result = game.isOver(end);
    expect(result?.winner).toBeUndefined();
    expect(game.places?.(end)).toEqual({ [A]: 1, [B]: 1 });
  });

  test("dwie osoby: wyższa karta bierze dodatnie, niższa ujemne", () => {
    // Nagrody: +10, +9, ..., +1, potem −5..−1. A kładzie od góry (15, 14, ...).
    // B w rundzie 1 oddaje 1, potem kładzie od góry (15, 14, ...), czyli zawsze o jeden więcej niż A.
    // Runda 1: A bierze +10. Rundy 2-10: B bierze +9..+1 (45). Rundy 11-15: A ma niższą kartę i bierze −15.
    const prizes = [...PRIZES.filter((p) => p > 0).sort((x, y) => y - x), ...PRIZES.filter((p) => p < 0)];
    const end = playAll(fixed(TWO, ...prizes), (s, p) => (p === B && s.round === 1 ? lowest(s, p) : highest(s, p)));
    expect(end.score).toEqual({ [A]: -5, [B]: 45 });
    expect(game.isOver(end)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places?.(end)).toEqual({ [A]: 2, [B]: 1 });
  });

  test("zwycięzca i ranking wynikają z punktów", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const end = timeoutAll(start(FOUR, seed), createRng(seed));
      const ranking = game.isOver(end)?.ranking ?? [];
      expect([...ranking].sort()).toEqual([...FOUR].sort());
      for (let i = 1; i < ranking.length; i++) expect(end.score[ranking[i - 1]]).toBeGreaterThanOrEqual(end.score[ranking[i]]);
      const top = Math.max(...FOUR.map((p) => end.score[p]));
      const leaders = FOUR.filter((p) => end.score[p] === top);
      expect(game.isOver(end)?.winner).toBe(leaders.length === 1 ? leaders[0] : undefined);
      const places = game.places?.(end) ?? {};
      for (const p of FOUR) expect(places[p]).toBe(1 + FOUR.filter((q) => end.score[q] > end.score[p]).length);
    }
  });

  test("równe punkty dzielą miejsce", () => {
    // A i B kładą zawsze to samo, więc się znoszą; C i D zbierają resztę.
    const pick = (s: State, p: string) => (p === A || p === B ? lowest(s, p) : p === C ? highest(s, p) : s.hands[p][1] ?? lowest(s, p));
    const end = playAll(start(FOUR, 3), pick);
    expect(end.score[A]).toBe(end.score[B]);
    const places = game.places?.(end) ?? {};
    expect(places[A]).toBe(places[B]);
  });
});

describe("limity", () => {
  test("limit wyboru to dozwolona karta z ręki, limit odsłony to next", () => {
    const s = start(THREE);
    const move = timeoutOf(s, A);
    expect(move.type).toBe("play");
    expect(game.validateMove(s, A, move, { source: "timeout" })).toBe(true);
    const r = round(fixed(TWO, 7), { [A]: 5, [B]: 9 });
    expect(timeoutOf(r, A)).toEqual(next(r));
  });

  test("losowa karta zależy od rng", () => {
    const s = start(TWO);
    const cards = new Set(Array.from({ length: 20 }, (_, i) => (timeoutOf(s, A, createRng(i + 1)) as { card: number }).card));
    expect(cards.size).toBeGreaterThan(1);
  });

  test("same limity kończą partię, każdy stan ma legalny ruch limitu", () => {
    for (const players of [TWO, SIX]) {
      const end = timeoutAll(start(players, 9), createRng(9), (s) => {
        for (const p of game.waitingFor(s)) expect(game.validateMove(s, p, timeoutOf(s, p, createRng(2)), { source: "timeout" })).toBe(true);
      });
      expect(end.phase).toBe("over");
      expect(end.history).toHaveLength(ROUNDS);
    }
  });

  test("klucz czasu: runda, faza i nonce; ruch innego gracza go nie zmienia", () => {
    const s = start(THREE);
    expect(game.turn?.(s)).toEqual({ key: `${s.nonce}:1:choose`, seconds: CHOOSE_SECONDS });
    const a = send(s, A, play(s, 4));
    expect(game.turn?.(a)).toEqual(game.turn?.(s));
    const r = round(fixed(THREE, 7), { [A]: 1, [B]: 2, [C]: 3 });
    expect(game.turn?.(r)).toEqual({ key: `${r.nonce}:1:reveal`, seconds: REVEAL_SECONDS });
    expect(game.turn?.(send(r, A, next(r)))).toEqual(game.turn?.(r));
    expect(game.turn?.(allNext(r))?.key).toBe(`${r.nonce}:2:choose`);
  });
});

describe("widok", () => {
  test("bez kolejności nagród, nieodkryte jako posortowany zbiór", () => {
    const s = start(FOUR, 6);
    for (const p of [A, OBSERVER, STRANGER]) {
      const v = view(s, p);
      expect(v).not.toHaveProperty("prizes");
      expect(v).not.toHaveProperty("choices");
      expect(v.prizesLeft).toEqual([...s.prizes].sort((x, y) => x - y));
      expect(v.pot).toEqual(s.pot);
      expect(v.hands).toEqual(s.hands);
      expect(v.score).toEqual(s.score);
    }
  });

  test("obserwator i obce id widzą to samo, bez własnej karty", () => {
    const s = start(THREE);
    const a = send(s, A, play(s, 9));
    expect(view(a, OBSERVER)).toEqual(view(a, STRANGER));
    expect(view(a, OBSERVER).myCard).toBeNull();
  });

  test("po rozstrzygnięciu karty wszystkich są w historii", () => {
    const r = round(fixed(THREE, 7), { [A]: 12, [B]: 12, [C]: 9 });
    expect(view(r, OBSERVER).history[0].plays).toEqual({ [A]: 12, [B]: 12, [C]: 9 });
    expect(view(r, A).myCard).toBeNull();
    expect(view(r, OBSERVER).ready).toEqual([]);
  });
});

describe("spójność", () => {
  test("każdy kładzie każdą kartę raz, punkty i przepadła pula dają +40", () => {
    for (const players of [TWO, THREE, SIX]) {
      for (let seed = 1; seed <= 20; seed++) {
        const end = timeoutAll(start(players, seed), createRng(seed * 7));
        for (const p of players) expect(end.history.map((r) => r.plays[p]).sort((x, y) => x - y)).toEqual(FULL_HAND);
        expect(end.history.map((r) => r.pot.at(-1)).sort((x, y) => (x ?? 0) - (y ?? 0))).toEqual([...PRIZES].sort((x, y) => x - y));
        const taken = sum(end.history.filter((r) => r.winner !== null).map((r) => r.value));
        expect(scoreSum(end)).toBe(taken);
        const last = end.history[ROUNDS - 1];
        const discarded = last.winner === null ? last.value : 0;
        expect(scoreSum(end) + discarded).toBe(PRIZE_SUM);
      }
    }
  });

  test("applyMove nie zmienia poprzedniego stanu, stan przeżywa JSON", () => {
    playAll(start(SIX, 11), (s, p) => s.hands[p][(s.round * 7 + p.length) % s.hands[p].length], undefined, (s) => {
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    });
  });

  test("rewanż z innym ziarnem ma inny nonce", () => {
    expect(start(TWO, 1).nonce).not.toBe(start(TWO, 2).nonce);
  });
});

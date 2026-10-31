import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { labirynt as game, type Move, pawnMoves, type State, wallError } from "./labirynt.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 2-4 graczy, tryby: klasyczny 9×9 (ścianki 10 / 7 / 5 przy 2 / 3 / 4 os.) i szybki 7×7 (6 / 4 / 3); brak albo nieznany = klasyczny,
// - pionki startują na środku krawędzi zgodnie z ruchem wskazówek: players[0] na dole, przy 2 os. drugi u góry,
//   przy 3-4 os. lewa, góra, prawa; cel to przeciwległa krawędź; zaczyna players[0],
// - ruch to krok (`step`) o jedno pole bez przechodzenia przez ściankę albo ścianka (`wall`),
// - pionek przeskakuje się prosto, a gdy za nim ścianka, krawędź albo pionek, wolno stanąć skośnie obok niego,
// - ścianka (2 pola, punkt x, y od 0 do size-2, `h` albo `v`) nie nachodzi na inną, nie krzyżuje się
//   i nie odcina nikomu drogi do celu; ścianki z puli się kończą,
// - `pass` tylko bez żadnego kroku,
// - pierwszy na polu celu wygrywa, remisu nie ma,
// - limit czasu: rng losuje spośród legalnych kroków, także skoków i skosów; bez zużycia ścianek, pass tylko bez kroku.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const rng = createRng(1);

const step = (x: number, y: number): Move => ({ type: "step", x, y });
const wall = (x: number, y: number, dir: "h" | "v"): Move => ({ type: "wall", x, y, dir });

function send(state: State, player: string, move: Move) {
  expect(game.validateMove(state, player, move), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return game.applyMove(state, player, move, rng);
}

/** Ruchy po kolei, zaczynając od players[0]. */
function play(state: State, moves: Move[]) {
  return moves.reduce((s, move) => send(s, game.waitingFor(s)[0], move), state);
}

const duel = (mode?: string) => game.setup([A, B], rng, mode);

/** A i B idą na siebie środkiem planszy 9×9, aż A stanie na (4, 4), a B na (4, 3); teraz ruch B. */
const faceToFace = () => play(duel(), [step(4, 7), step(4, 1), step(4, 6), step(4, 2), step(4, 5), step(4, 3), step(4, 4)]);

const sorted = (cells: { x: number; y: number }[]) => [...cells].sort((a, b) => a.x - b.x || a.y - b.y);

describe("definicja gry", () => {
  test("2-4 graczy, 60 s na ruch, tryby klasyczny (domyślny) i szybki", () => {
    expect(game.minPlayers).toBe(2);
    expect(game.maxPlayers).toBe(4);
    expect(game.turnSeconds).toBe(60);
    expect(game.modes?.map((m) => m.id).sort()).toEqual(["klasyczny", "szybki"]);
    expect(game.modes?.find((m) => m.default)?.id).toBe("klasyczny");
  });

  test("nowa gra nie jest skończona, zaczyna players[0]", () => {
    const state = duel();
    expect(game.isOver(state)).toBeNull();
    expect(game.waitingFor(state)).toEqual([A]);
  });
});

describe("start", () => {
  test("2 osoby: dół i góra planszy 9×9, po 10 ścianek", () => {
    const state = duel();
    expect(state.size).toBe(9);
    expect(state.pawns).toEqual([{ x: 4, y: 8 }, { x: 4, y: 0 }]);
    expect(state.wallsLeft).toEqual([10, 10]);
  });

  test("3 osoby: dół, lewa, góra, po 7 ścianek", () => {
    const state = game.setup([A, B, C], rng);
    expect(state.pawns).toEqual([{ x: 4, y: 8 }, { x: 0, y: 4 }, { x: 4, y: 0 }]);
    expect(state.wallsLeft).toEqual([7, 7, 7]);
  });

  test("4 osoby: dół, lewa, góra, prawa, po 5 ścianek", () => {
    const state = game.setup([A, B, C, D], rng);
    expect(state.pawns).toEqual([{ x: 4, y: 8 }, { x: 0, y: 4 }, { x: 4, y: 0 }, { x: 8, y: 4 }]);
    expect(state.wallsLeft).toEqual([5, 5, 5, 5]);
  });

  test("tryb szybki: plansza 7×7, ścianki 6 / 4 / 3", () => {
    expect(duel("szybki").size).toBe(7);
    expect(duel("szybki").pawns).toEqual([{ x: 3, y: 6 }, { x: 3, y: 0 }]);
    expect(duel("szybki").wallsLeft).toEqual([6, 6]);
    expect(game.setup([A, B, C], rng, "szybki").wallsLeft).toEqual([4, 4, 4]);
    expect(game.setup([A, B, C, D], rng, "szybki").wallsLeft).toEqual([3, 3, 3, 3]);
  });

  test("nieznany tryb to klasyczny", () => {
    expect(duel("turbo").size).toBe(9);
  });
});

describe("walidacja", () => {
  test("ktoś spoza gry nie może się ruszyć", () => {
    expect(game.validateMove(duel(), "obcy", step(4, 7))).toBe(false);
  });

  test("gracze ruszają się po kolei", () => {
    const state = duel();
    expect(game.validateMove(state, B, step(4, 1))).toBe(false);
    const next = send(state, A, step(4, 7));
    expect(game.validateMove(next, A, step(4, 6))).toBe(false);
    expect(game.waitingFor(next)).toEqual([B]);
  });

  test("przy 4 osobach kolejka idzie po wszystkich i wraca do pierwszego", () => {
    let state = game.setup([A, B, C, D], rng);
    state = play(state, [step(4, 7), step(1, 4), step(4, 1), step(7, 4)]);
    expect(game.waitingFor(state)).toEqual([A]);
  });

  test("krok tylko o jedno pole w pionie albo poziomie, w obrębie planszy", () => {
    const state = duel();
    expect(sorted(pawnMoves(state, 0))).toEqual(sorted([{ x: 3, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 7 }]));
    for (const bad of [step(4, 6), step(3, 7), step(4, 9), step(4, 8), step(-1, 8)]) expect(game.validateMove(state, A, bad), JSON.stringify(bad)).toBe(false);
  });

  test("ścianka w zakresie od 0 do size-2", () => {
    const state = duel();
    expect(game.validateMove(state, A, wall(0, 0, "h"))).toBe(true);
    expect(game.validateMove(state, A, wall(7, 7, "v"))).toBe(true);
    expect(game.validateMove(state, A, wall(8, 0, "h"))).toBe(false);
    expect(game.validateMove(state, A, wall(0, 8, "v"))).toBe(false);
    expect(game.validateMove(state, A, wall(-1, 0, "h"))).toBe(false);
  });

  test("schemat odrzuca śmieci z sieci", () => {
    for (const bad of [null, {}, { type: "step" }, { type: "step", x: 1.5, y: 0 }, { type: "wall", x: 0, y: 0, dir: "x" }, { type: "wall", x: "0", y: 0, dir: "h" }, { type: "jump" }]) {
      expect(game.moveSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    }
    for (const ok of [step(1, 2), wall(3, 4, "v"), { type: "pass" }]) expect(game.moveSchema.safeParse(ok).success).toBe(true);
  });
});

describe("krok i skok", () => {
  test("ścianka zatrzymuje krok", () => {
    const state = play(duel(), [wall(0, 0, "h"), wall(3, 7, "h")]);
    expect(game.validateMove(state, A, step(4, 7))).toBe(false);
    expect(game.validateMove(state, A, step(5, 8))).toBe(true);
  });

  test("pionek przeskakuje się prosto, nie staje się na nim", () => {
    const state = faceToFace();
    expect(game.validateMove(state, B, step(4, 4))).toBe(false);
    expect(game.validateMove(state, B, step(4, 5))).toBe(true);
    expect(send(state, B, step(4, 5)).pawns[1]).toEqual({ x: 4, y: 5 });
  });

  test("gdy za pionkiem ścianka, wolno stanąć skośnie obok niego", () => {
    // B stawia ściankę za plecami A, A stawia ściankę gdzieś daleko, znowu ruch B.
    const state = play(faceToFace(), [wall(3, 4, "h"), wall(0, 0, "h")]);
    expect(sorted(pawnMoves(state, 1))).toEqual(sorted([{ x: 3, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 4 }]));
  });

  test("gdy za pionkiem krawędź, wolno stanąć skośnie obok niego", () => {
    // B schodzi do A, który stoi na swojej linii startowej (A tylko przestawia się na boki).
    let state = duel();
    for (let y = 1; y <= 7; y++) state = play(state, [step(y % 2 ? 3 : 4, 8), step(4, y)]);
    // Teraz A na (3, 8), B na (4, 7); A wraca pod B.
    state = play(state, [step(4, 8)]);
    expect(sorted(pawnMoves(state, 1))).toEqual(sorted([{ x: 3, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 6 }, { x: 3, y: 8 }, { x: 5, y: 8 }]));
  });

  test("pass tylko wtedy, gdy nie ma żadnego kroku", () => {
    expect(game.validateMove(duel(), A, { type: "pass" })).toBe(false);
  });
});

describe("ścianki", () => {
  test("ścianka nie nachodzi na inną ani się z nią nie krzyżuje; styk w kształcie T jest dozwolony", () => {
    const state = play(duel(), [wall(3, 4, "h")]);
    expect(wallError(state, { x: 3, y: 4, dir: "h" })).toBe("taken");
    expect(wallError(state, { x: 2, y: 4, dir: "h" })).toBe("taken");
    expect(wallError(state, { x: 4, y: 4, dir: "h" })).toBe("taken");
    expect(wallError(state, { x: 3, y: 4, dir: "v" })).toBe("taken");
    expect(wallError(state, { x: 5, y: 4, dir: "h" })).toBeNull();
    expect(wallError(state, { x: 3, y: 3, dir: "v" })).toBeNull();
    expect(wallError(state, { x: 3, y: 5, dir: "v" })).toBeNull();
    expect(game.validateMove(state, B, wall(4, 4, "h"))).toBe(false);
  });

  test("pionowe ścianki jedna pod drugą nachodzą na siebie, gdy dzielą pole", () => {
    const state = play(duel(), [wall(3, 4, "v")]);
    expect(wallError(state, { x: 3, y: 3, dir: "v" })).toBe("taken");
    expect(wallError(state, { x: 3, y: 5, dir: "v" })).toBe("taken");
    expect(wallError(state, { x: 3, y: 6, dir: "v" })).toBeNull();
  });

  test("ścianka nie może odciąć drogi samemu sobie", () => {
    // Szybki 7×7, A na (3, 6): pola (2, 6) i (3, 6) zamyka ścianka z góry i dwie z boków.
    const state = play(duel("szybki"), [wall(1, 5, "v"), wall(3, 5, "v")]);
    expect(wallError(state, { x: 2, y: 5, dir: "h" })).toBe("blocks");
    expect(game.validateMove(state, A, wall(2, 5, "h"))).toBe(false);
  });

  test("ścianka nie może odciąć drogi rywalowi", () => {
    const state = play(duel("szybki"), [wall(1, 5, "v"), wall(3, 5, "v"), step(2, 6)]);
    expect(game.validateMove(state, B, wall(2, 5, "h"))).toBe(false);
    expect(game.validateMove(state, B, wall(4, 5, "h"))).toBe(true);
  });

  test("pionki nie zasłaniają drogi: ścianka obok pionka rywala jest dozwolona", () => {
    // B stoi naprzeciw A w korytarzu; dla sprawdzania drogi pionków nie ma.
    const state = faceToFace();
    expect(game.validateMove(state, B, wall(3, 4, "v"))).toBe(true);
  });

  test("ścianka zmniejsza pulę, a po ostatniej nie da się postawić kolejnej", () => {
    let state = duel("szybki");
    for (let y = 0; y < 6; y++) state = play(state, [wall(0, y, "h"), step(y % 2 ? 3 : 2, 0)]);
    expect(state.wallsLeft).toEqual([0, 6]);
    expect(game.validateMove(state, A, wall(4, 0, "h"))).toBe(false);
    expect(game.validateMove(state, A, step(3, 5))).toBe(true);
  });
});

describe("koniec gry", () => {
  /** Scenariusz zwycięstwa prowadzi pionki do celu niezależnie od losowego timeoutu. */
  function race(state: State, stall: (s: State, player: string) => Move | undefined = () => undefined) {
    for (let i = 0; !game.isOver(state); i++) {
      if (i > 500) throw new Error("partia się nie kończy");
      const player = game.waitingFor(state)[0];
      const distance = ({ x, y }: { x: number; y: number }) => {
        const side = state.sides[state.turn];
        return side === "bottom" ? y : side === "top" ? state.size - 1 - y : side === "left" ? state.size - 1 - x : x;
      };
      const towardGoal = pawnMoves(state, state.turn).sort((a, b) => distance(a) - distance(b))[0];
      const move = towardGoal ? step(towardGoal.x, towardGoal.y) : { type: "pass" } as const;
      state = send(state, player, stall(state, player) ?? move);
    }
    return state;
  }

  test("wygrywa pierwszy, kto stanie na przeciwległej krawędzi", () => {
    let walls = 0;
    const state = race(duel(), (_, player) => (player === B ? wall(7, walls++, "h") : undefined));
    expect(state.pawns[0].y).toBe(0);
    expect(game.isOver(state)).toEqual({ winner: A });
    expect(game.waitingFor(state)).toEqual([]);
  });

  test("wygrywa też drugi gracz", () => {
    let walls = 0;
    const state = race(duel(), (_, player) => (player === A ? wall(0, walls++, "h") : undefined));
    expect(state.pawns[1].y).toBe(8);
    expect(game.isOver(state)).toEqual({ winner: B });
  });

  test.each([0, 1, 2, 3])("przy 4 osobach wygrywa gracz %i, gdy reszta chodzi na boki", (seat) => {
    const players = [A, B, C, D];
    // Gracze 0 i 2 idą w pionie, więc stoją w miejscu, chodząc w poziomie; 1 i 3 odwrotnie.
    const sideways = (s: State, i: number) => pawnMoves(s, i).find((c) => (i % 2 === 0 ? c.y === s.pawns[i].y : c.x === s.pawns[i].x))!;
    const state = race(game.setup(players, rng), (s, player) => {
      const i = players.indexOf(player);
      if (i === seat) return undefined;
      const c = sideways(s, i);
      return step(c.x, c.y);
    });
    expect(game.isOver(state)).toEqual({ winner: players[seat] });
  });

  test("po końcu nikt nie może się ruszyć", () => {
    const state = race(duel());
    expect(game.validateMove(state, B, step(3, 0))).toBe(false);
    expect(game.validateMove(state, B, wall(0, 0, "h"))).toBe(false);
  });
});

describe("limit czasu", () => {
  test("rng może wybrać każdy legalny krok, także oddalający od najkrótszej drogi", () => {
    const state = duel();
    const legal = pawnMoves(state, state.turn);
    let calls = 0;
    const moves = [0, 0.5, 1 - Number.EPSILON].map((value) => {
      const move = game.timeoutMove!(state, A, () => { calls++; return value; });
      expect(game.validateMove(state, A, move)).toBe(true);
      return move;
    });
    expect(calls).toBeGreaterThan(0);
    expect(new Set(moves.map((move) => JSON.stringify(move)))).toEqual(new Set(legal.map((c) => JSON.stringify(step(c.x, c.y)))));
  });

  test("ten sam seed odtwarza ruch, różne seedy dają różne legalne kroki", () => {
    const state = duel();
    const moves = Array.from({ length: 32 }, (_, seed) => {
      const move = game.timeoutMove!(state, A, createRng(seed));
      expect(game.timeoutMove!(state, A, createRng(seed))).toEqual(move);
      expect(game.validateMove(state, A, move)).toBe(true);
      return JSON.stringify(move);
    });
    expect(new Set(moves).size).toBeGreaterThan(1);
  });

  test.each(["klasyczny", "szybki"])("%s: 2 i 4 osoby, po czasie tylko legalny krok, bez zużycia ścianek i zmiany poprzedniego stanu", (mode) => {
    for (const players of [[A, B], [A, B, C, D]]) {
      let state = game.setup(players, createRng(1), mode);
      for (let turn = 0; turn < 24; turn++) {
        const before = JSON.stringify(state);
        const player = game.waitingFor(state)[0];
        const move = game.timeoutMove!(state, player, createRng(turn));
        expect(move.type).toBe("step");
        expect(game.moveSchema.safeParse(move).success).toBe(true);
        const next = send(state, player, move);
        expect(next.walls).toEqual(state.walls);
        expect(next.wallsLeft).toEqual(state.wallsLeft);
        expect(JSON.stringify(state)).toBe(before);
        state = next;
        if (game.isOver(state)) break;
      }
    }
  });

  test.each([
    ["przed ścianką", () => play(duel(), [wall(0, 0, "h"), wall(3, 7, "h")])],
    ["przy przeskoku", faceToFace],
    ["przy skosie za pionkiem", () => play(faceToFace(), [wall(3, 4, "h"), wall(0, 0, "h")])],
  ])("losowanie obejmuje wszystkie legalne kroki %s", (_, setup) => {
    const state = setup();
    const legal = pawnMoves(state, state.turn);
    const chosen = Array.from({ length: 64 }, (_, seed) => {
      const move = game.timeoutMove!(state, game.waitingFor(state)[0], createRng(seed));
      expect(game.validateMove(state, game.waitingFor(state)[0], move)).toBe(true);
      return JSON.stringify(move);
    });
    expect(new Set(chosen)).toEqual(new Set(legal.map((c) => JSON.stringify(step(c.x, c.y)))));
  });

  test("pass tylko bez legalnego kroku: pionki blokują korytarz, choć droga po ściankach istnieje", () => {
    // A dochodzi do lewego dolnego rogu. B i D stają obok na (1,8) i (2,8).
    // Ścianka nad A i B blokuje wyjście i skos; D uniemożliwia przeskoczenie B.
    // Każda pozycja i ścianka powstaje legalnymi ruchami; C zostaje u góry.
    let state = game.setup([A, B, C, D], createRng(1));
    for (let round = 0; round < 10; round++) {
      const a = round < 4 ? step(3 - round, 8) : step(0, round % 2 === 0 ? 7 : 8);
      const b = round === 0 ? wall(7, 0, "h") : step(1, round < 6 ? round + 3 : round % 2 === 0 ? 7 : 8);
      const c = round === 9 ? wall(0, 7, "h") : step(round % 2 === 0 ? 3 : 4, 0);
      const d = round < 4 ? step(8, round + 5) : step(11 - round, 8);
      state = play(state, [a, b, c, d]);
    }
    expect(game.waitingFor(state)).toEqual([A]);
    expect(pawnMoves(state, state.turn)).toEqual([]);
    const before = JSON.stringify(state);
    const move = game.timeoutMove!(state, A, createRng(1));
    expect(move).toEqual({ type: "pass" });
    expect(game.validateMove(state, A, move)).toBe(true);
    const next = send(state, A, move);
    expect(next.pawns).toEqual(state.pawns);
    expect(next.walls).toEqual(state.walls);
    expect(next.wallsLeft).toEqual(state.wallsLeft);
    expect(game.waitingFor(next)).toEqual([B]);
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe("stan", () => {
  test("applyMove nie zmienia poprzedniego stanu", () => {
    const state = duel();
    const copy = JSON.parse(JSON.stringify(state));
    send(state, A, wall(3, 4, "h"));
    send(state, A, step(4, 7));
    expect(state).toEqual(copy);
  });

  test("stan przeżywa JSON, a widok to cały stan", () => {
    const state = play(duel(), [wall(3, 4, "h"), step(4, 1)]);
    const copy = JSON.parse(JSON.stringify(state));
    expect(copy).toEqual(state);
    expect(game.playerView(state, "")).toEqual(state);
    expect(game.validateMove(copy, A, step(4, 7))).toBe(true);
  });
});

describe("P4-030/F4-042: skos przy trzech pionkach", () => {
  function corridor(blockDiagonal: boolean) {
    return play(game.setup([A, B, C], createRng(1)), [
      step(4, 7), step(1, 4), step(4, 1),
      step(4, 6), step(2, 4), step(4, 2),
      step(4, 5), step(3, 4), step(4, 3),
      wall(7, 7, "h"), step(4, 4), blockDiagonal ? wall(3, 3, "v") : wall(0, 0, "h"),
    ]);
  }

  test("za sąsiadem stoi trzeci pionek: dozwolone skosy, zabroniony podwójny skok", () => {
    const s = corridor(false);
    expect(game.validateMove(s, A, step(4, 2))).toBe(false);
    for (const x of [3, 5]) {
      expect(game.validateMove(s, A, step(x, 4))).toBe(true);
      expect(send(s, A, step(x, 4)).pawns[0]).toEqual({ x, y: 4 });
    }
  });

  test("skos omija sąsiada tylko po stronie bez ścianki", () => {
    const s = corridor(true);
    expect(game.validateMove(s, A, step(3, 4))).toBe(false);
    expect(game.validateMove(s, A, step(5, 4))).toBe(true);
    expect(send(s, A, step(5, 4)).pawns[0]).toEqual({ x: 5, y: 4 });
  });
});

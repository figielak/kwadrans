import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { boxEdges, edgeCount, edgeEnds, kropkiIKreski as game, MODES, type Move, type State, TURN_SECONDS } from "./kropki-i-kreski.ts";

// Testy napisane przed implementacją. Ustalają zasady (ZASADY-GIER.md §14):
// - 2-4 graczy, 60 s na ruch, tryby: mala 3×3 (9 kwadratów, 24 kreski), srednia 5×5 (25, 60, domyślna), duza 7×7 (49, 112),
// - ruch to { edge }: jedna wolna kreska; poziome mają numery y*n+x, pionowe n*(n+1)+y*(n+1)+x; zaczyna players[0],
// - kreska zamykająca 1 lub 2 kwadraty daje tyle punktów i kolejny ruch tej samej osoby, kreska bez kwadratu oddaje ruch następnej,
// - ostatnia kreska kończy partię bez kolejnego ruchu; wygrywa najwięcej kwadratów, remis na szczycie nie ma zwycięzcy,
// - przy 2 osobach liczba kwadratów jest nieparzysta, więc zawsze jest zwycięzca,
// - po limicie timeoutMove rysuje losową wolną kreskę; nic nie jest ukryte.

const A = "ania";
const B = "bartek";
const C = "celina";
const D = "darek";
const rng = createRng(1);

function send(state: State, player: string, move: Move): State {
  expect(game.validateMove(state, player, move), `${player}: ${JSON.stringify(move)}`).toBe(true);
  return game.applyMove(state, player, move, rng);
}

const turnOf = (state: State) => game.waitingFor(state)[0];
const mode = (id: string) => MODES.find((m) => m.id === id)!;

/** Kolejne kreski rysują ci, którzy akurat mają ruch. */
function draw(state: State, edges: number[]): State {
  return edges.reduce((s, edge) => send(s, turnOf(s), { edge }), state);
}

/** Rozmiar 3, wszystkie kreski poza 0 narysowane; kreska 0 należy tylko do kwadratu 0. Kwadraty 1-8 mają właścicieli (miejsca). */
function lastEdge(players: string[], owners: number[], turn: number): State {
  const state = game.setup(players, rng, "mala");
  return { ...state, edges: state.edges.map((_, i) => i !== 0), boxes: [null, ...owners], turn };
}

const own = (a: number, b: number, c = 0, d = 0) => [...Array(a).fill(0), ...Array(b).fill(1), ...Array(c).fill(2), ...Array(d).fill(3)];

describe("definicja gry", () => {
  test("gra dla 2-4 graczy z limitem 60 s, bez rekordu i podglądu", () => {
    expect(game.id).toBe("kropki-i-kreski");
    expect(game.minPlayers).toBe(2);
    expect(game.maxPlayers).toBe(4);
    expect(game.turnSeconds).toBe(60);
    expect(TURN_SECONDS).toBe(60);
    expect(game.record).toBeUndefined();
    expect(game.live).toBeUndefined();
  });

  test("nowa gra nie jest skończona", () => {
    expect(game.isOver(game.setup([A, B], rng))).toBeNull();
  });

  test("trzy tryby, domyślny to średnia", () => {
    expect(game.modes!.map((m) => m.id)).toEqual(["mala", "srednia", "duza"]);
    expect(game.modes!.filter((m) => m.default).map((m) => m.id)).toEqual(["srednia"]);
    expect(MODES.map((m) => m.size)).toEqual([3, 5, 7]);
  });
});

describe("setup", () => {
  test.each([
    ["mala", 3, 24, 9],
    ["srednia", 5, 60, 25],
    ["duza", 7, 112, 49],
  ])("tryb %s ma %i kwadratów na bok, %i kresek i %i kwadratów", (id, size, edges, boxes) => {
    const state = game.setup([A, B], rng, id);
    expect(state.size).toBe(size);
    expect(state.edges).toHaveLength(edges);
    expect(edgeCount(size)).toBe(edges);
    expect(state.edges.every((e) => e === false)).toBe(true);
    expect(state.boxes).toEqual(Array(boxes).fill(null));
  });

  test("nieznany tryb i brak trybu dają 5×5", () => {
    expect(game.setup([A, B], rng, "nie-ma").size).toBe(5);
    expect(game.setup([A, B], rng).size).toBe(5);
  });

  test("zaczyna players[0], nikt jeszcze nie rysował", () => {
    const state = game.setup([C, A, B], rng);
    expect(state.players).toEqual([C, A, B]);
    expect(state.turn).toBe(0);
    expect(state.last).toBeNull();
    expect(game.waitingFor(state)).toEqual([C]);
  });

  test("seed wyznacza nonce", () => {
    const nonce = (seed: number) => game.setup([A, B], createRng(seed)).nonce;
    expect(nonce(7)).toBe(nonce(7));
    expect(nonce(7)).not.toBe(nonce(8));
  });
});

describe("walidacja ruchu", () => {
  const state = game.setup([A, B], rng, "mala");

  test("obcy i cudza tura odpadają", () => {
    expect(game.validateMove(state, "ktos", { edge: 0 })).toBe(false);
    expect(game.validateMove(state, B, { edge: 0 })).toBe(false);
  });

  test("zajęta kreska odpada", () => {
    const next = send(state, A, { edge: 5 });
    expect(game.validateMove(next, B, { edge: 5 })).toBe(false);
  });

  test("numer spoza planszy i ułamek odpadają", () => {
    for (const edge of [-1, 24, 1.5, NaN]) expect(game.validateMove(state, A, { edge }), String(edge)).toBe(false);
  });

  test("pierwsza i ostatnia kreska są dozwolone", () => {
    expect(game.validateMove(state, A, { edge: 0 })).toBe(true);
    expect(game.validateMove(state, A, { edge: 23 })).toBe(true);
  });

  test("po końcu partii nic nie przechodzi", () => {
    const over = send(lastEdge([A, B], own(4, 4), 0), A, { edge: 0 });
    expect(game.validateMove(over, A, { edge: 0 })).toBe(false);
    expect(game.validateMove(over, B, { edge: 0 })).toBe(false);
  });

  test("schemat odrzuca tekst, brak pola i liczbę niecałkowitą", () => {
    expect(game.moveSchema.safeParse({ edge: 3 }).success).toBe(true);
    expect(game.moveSchema.safeParse({ edge: "3" }).success).toBe(false);
    expect(game.moveSchema.safeParse({}).success).toBe(false);
    expect(game.moveSchema.safeParse({ edge: 1.5 }).success).toBe(false);
  });
});

describe("kolejność i kwadraty", () => {
  const start = (players = [A, B]) => game.setup(players, rng, "mala");

  test("kreska bez kwadratu oddaje ruch następnej osobie, po ostatniej wraca do pierwszej", () => {
    let state = start([A, B, C, D]);
    const order: string[] = [];
    for (const edge of [0, 5, 10, 15]) {
      order.push(turnOf(state));
      state = send(state, turnOf(state), { edge });
    }
    expect(order).toEqual([A, B, C, D]);
    expect(turnOf(state)).toBe(A);
  });

  test("trzy boki nie dają punktu", () => {
    // kwadrat 0 ma boki 0, 3 (poziome), 12, 13 (pionowe)
    const state = draw(start(), [0, 3, 12]);
    expect(state.boxes[0]).toBeNull();
    expect(turnOf(state)).toBe(B);
  });

  test("czwarty bok daje punkt, właściciela i kolejny ruch temu samemu graczowi", () => {
    const state = draw(start(), [0, 3, 12, 13]);
    expect(state.boxes[0]).toBe(1);
    expect(turnOf(state)).toBe(B);
    expect(state.last).toEqual({ edge: 13, seat: 1, boxes: [0] });
  });

  test("po zamknięciu kwadratu ten sam gracz może zamknąć następny, a pudło oddaje ruch", () => {
    let state = draw(start(), [0, 3, 12, 13]);
    state = send(state, B, { edge: 20 });
    expect(turnOf(state)).toBe(A);
  });

  test("kreska między dwoma trzybocznymi kwadratami daje 2 punkty i jeden dodatkowy ruch", () => {
    // kwadrat 0: 0, 3, 12, 13; kwadrat 1: 1, 4, 13, 14. Wspólna kreska pionowa to 13.
    let state = draw(start(), [0, 3, 12, 1, 4, 14]);
    expect(turnOf(state)).toBe(A);
    state = send(state, A, { edge: 13 });
    expect(state.boxes[0]).toBe(0);
    expect(state.boxes[1]).toBe(0);
    expect(state.last).toEqual({ edge: 13, seat: 0, boxes: [0, 1] });
    expect(turnOf(state)).toBe(A);
  });

  test("kreska brzegowa należy do jednego kwadratu, wewnętrzna do dwóch", () => {
    const n = 3;
    const owners = (edge: number) => Array.from({ length: n * n }, (_, b) => b).filter((b) => boxEdges(n, b).includes(edge));
    expect(owners(0)).toEqual([0]);
    expect(owners(13)).toEqual([0, 1]);
    for (let edge = 0; edge < edgeCount(n); edge++) expect(owners(edge).length, String(edge)).toBeGreaterThanOrEqual(1);
  });

  test("applyMove nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const before = start();
    const snapshot = JSON.stringify(before);
    const after = game.applyMove(before, A, { edge: 7 }, rng);
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toBe(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
  });
});

describe("koniec partii", () => {
  test("ostatnia kreska kończy partię od razu, bez kolejnego ruchu", () => {
    const state = send(lastEdge([A, B], own(4, 4), 0), A, { edge: 0 });
    expect(state.boxes[0]).toBe(0);
    expect(game.isOver(state)).not.toBeNull();
    expect(game.waitingFor(state)).toEqual([]);
  });

  test("przed ostatnią kreską gra trwa", () => {
    expect(game.isOver(lastEdge([A, B], own(4, 4), 0))).toBeNull();
  });

  test("wygrywa każdy z graczy, ranking malejąco po kwadratach", () => {
    // 3 osoby, 9 kwadratów; kwadrat 0 dostaje ten, kto ma ruch
    const cases: [number[], number, string, string[]][] = [
      [own(4, 3, 1), 0, A, [A, B, C]],
      [own(1, 4, 3), 1, B, [B, C, A]],
      [own(3, 1, 4), 2, C, [C, A, B]],
    ];
    for (const [owners, turn, winner, ranking] of cases) {
      const over = send(lastEdge([A, B, C], owners, turn), [A, B, C][turn], { edge: 0 });
      expect(game.isOver(over)).toEqual({ winner, ranking });
      expect(game.places!(over)[winner]).toBe(1);
    }
  });

  test("remis na szczycie nie ma zwycięzcy, miejsca są wspólne", () => {
    // A 4, B 3 + kwadrat 0 = 4, C 1
    const over = send(lastEdge([A, B, C], own(4, 3, 1), 1), B, { edge: 0 });
    const result = game.isOver(over)!;
    expect(result.winner).toBeUndefined();
    expect(result.ranking).toEqual([A, B, C]);
    expect(game.places!(over)).toEqual({ [A]: 1, [B]: 1, [C]: 3 });
  });

  test("czwórka: pełny ranking i miejsca z remisem na dole", () => {
    // A 3, B 2, C 2, D 1, kwadrat 0 dla A => A 4
    const over = send(lastEdge([A, B, C, D], own(3, 2, 2, 1), 0), A, { edge: 0 });
    expect(game.isOver(over)).toEqual({ winner: A, ranking: [A, B, C, D] });
    expect(game.places!(over)).toEqual({ [A]: 1, [B]: 2, [C]: 2, [D]: 4 });
  });

  test("2 osoby na każdej planszy zawsze mają zwycięzcę, a kwadraty sumują się do liczby pól", () => {
    for (const m of MODES) {
      for (let seed = 1; seed <= 25; seed++) {
        const r = createRng(seed);
        let state = game.setup([A, B], r, m.id);
        while (!game.isOver(state)) state = game.applyMove(state, turnOf(state), game.timeoutMove!(state, turnOf(state), r), r);
        const result = game.isOver(state)!;
        const counts = [A, B].map((_, seat) => state.boxes.filter((b) => b === seat).length);
        expect(result.winner, `${m.id} #${seed}`).toBeDefined();
        expect(counts[0] + counts[1]).toBe(m.size * m.size);
        expect(state.boxes.every((b) => b !== null)).toBe(true);
      }
    }
  });
});

describe("limit czasu", () => {
  test("timeoutMove przechodzi validateMove w każdym stanie partii, także przy ostatniej kresce", () => {
    for (const m of MODES) {
      for (let seed = 1; seed <= 5; seed++) {
        const r = createRng(seed);
        let state = game.setup([A, B, C], r, m.id);
        while (!game.isOver(state)) {
          const who = turnOf(state);
          const move = game.timeoutMove!(state, who, r);
          expect(game.validateMove(state, who, move, { source: "timeout" }), `${m.id} #${seed}`).toBe(true);
          state = game.applyMove(state, who, move, r);
        }
      }
    }
  });

  test("przy jednej wolnej kresce timeoutMove wybiera właśnie ją", () => {
    expect(game.timeoutMove!(lastEdge([A, B], own(4, 4), 0), A, rng)).toEqual({ edge: 0 });
  });

  test("seed wyznacza wybór", () => {
    const state = game.setup([A, B], rng);
    expect(game.timeoutMove!(state, A, createRng(3))).toEqual(game.timeoutMove!(state, A, createRng(3)));
  });
});

describe("geometria", () => {
  test.each([3, 5, 7])("edgeEnds daje unikalne odcinki jednostkowe w obrębie kropek, rozmiar %i", (n) => {
    const seen = new Set<string>();
    for (let edge = 0; edge < edgeCount(n); edge++) {
      const [[x1, y1], [x2, y2]] = edgeEnds(n, edge);
      expect(Math.abs(x2 - x1) + Math.abs(y2 - y1), String(edge)).toBe(1);
      for (const v of [x1, y1, x2, y2]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(n);
      }
      seen.add(JSON.stringify([x1, y1, x2, y2]));
    }
    expect(seen.size).toBe(edgeCount(n));
  });

  test("boxEdges: cztery różne kreski tworzące kwadrat", () => {
    for (let b = 0; b < 9; b++) {
      const edges = boxEdges(3, b);
      expect(new Set(edges).size).toBe(4);
      const x = b % 3;
      const y = Math.floor(b / 3);
      expect(edges).toEqual([y * 3 + x, (y + 1) * 3 + x, 12 + y * 4 + x, 12 + y * 4 + x + 1]);
    }
  });
});

describe("widok", () => {
  test("gracz i obserwator widzą całą planszę", () => {
    const state = draw(game.setup([A, B], rng, "mala"), [0, 3, 12, 13]);
    expect(game.playerView(state, A)).toEqual(state);
    expect(game.playerView(state, "")).toEqual(state);
  });
});

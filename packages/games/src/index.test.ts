import { describe, expect, test } from "vitest";
import { createRng, GAMES, MINI_GAME_IDS, ROOM_MESSAGES, soloState } from "./index.ts";

// Kontrakt wspólny dla każdej gry z rejestru, sprawdzany na losowych partiach granych ruchami po limicie czasu:
// - ruch po limicie czasu każdego gracza, na którego czekamy, przechodzi przez moveSchema i validateMove,
// - ten sam ruch od kogoś spoza gry albo od gracza, na którego nie czekamy, jest odrzucany,
// - partia się kończy, po końcu nikt nie może już nic zrobić, a wynik wskazuje tylko graczy tej partii,
// - widok każdego gracza i obserwatora ("") da się wysłać jako JSON na każdym etapie,
// - mini-gra podaje po końcu miejsca z remisami (`places`), zgodne z rankingiem i zwycięzcą,
// - mini-gra podaje wynik każdego gracza do rankingu rekordów (`record`) jako liczbę skończoną.

const STRANGER = "obcy";
const SEEDS = [1, 2, 3];
const MAX_STEPS = 100_000;
/** Fazy odwiedzone w losowych partiach, po id gry. */
const visited: Record<string, Set<string>> = {};

/** Ruchy „chętnego” gracza: sam timeoutMove nigdy nie kupuje, więc nie doszedłby do budowy, wykupu, sprzedaży ani Juwenaliów. */
const EAGER: Record<string, (rng: () => number) => unknown[]> = {
  "kampus-tour": (rng) => [{ type: "buy" }, { type: "buyout" }, { type: "build", level: 1 }, { type: "travel", tile: Math.floor(rng() * 32) }],
};

test("rejestr: id z sieci nie trafia w pola prototypu obiektu, a klucz to id gry", () => {
  for (const id of ["constructor", "toString", "__proto__", "hasOwnProperty", "nie-ma-takiej"]) expect(GAMES[id], id).toBeUndefined();
  expect(Object.keys(GAMES)).toHaveLength(36);
  for (const [id, game] of Object.entries(GAMES)) expect(game.id).toBe(id);
});

test("mini-gry mają zasady narzucone z góry: tryby tylko w grach głównych", () => {
  for (const game of Object.values(GAMES)) if (game.minPlayers === 1) expect(game.modes, game.id).toBeUndefined();
});

test("pickGame: id gry albo null (powrót do listy gier)", () => {
  expect(ROOM_MESSAGES.pickGame.safeParse({ gameId: "statki" }).success).toBe(true);
  expect(ROOM_MESSAGES.pickGame.safeParse({ gameId: null }).success).toBe(true);
  expect(ROOM_MESSAGES.pickGame.safeParse({ gameId: 1 }).success).toBe(false);
  expect(ROOM_MESSAGES.pickGame.safeParse({}).success).toBe(false);
});

test("turniej: gospodarz ustawia długość, grę zaznacza każdy (jedna gra na wiadomość)", () => {
  expect(ROOM_MESSAGES.pickTournament.safeParse({ length: 8 }).success).toBe(true);
  expect(ROOM_MESSAGES.pickTournament.safeParse({ length: "8" }).success).toBe(false);
  expect(ROOM_MESSAGES.markGame.safeParse({ id: "stoper", mark: "must" }).success).toBe(true);
  expect(ROOM_MESSAGES.markGame.safeParse({ id: "stoper", mark: "skip" }).success).toBe(true);
  expect(ROOM_MESSAGES.markGame.safeParse({ id: "stoper", mark: "any" }).success).toBe(true);
  expect(ROOM_MESSAGES.markGame.safeParse({ id: "stoper", mark: "moze" }).success).toBe(false);
  expect(ROOM_MESSAGES.markGame.safeParse({ id: 1, mark: "must" }).success).toBe(false);
});

// Gra z trybami przechodzi kontrakt w każdym trybie.
const CASES = Object.values(GAMES).flatMap((game) =>
  (game.modes ?? [undefined]).map((mode) => ({ game, mode: mode?.id, name: mode ? `${game.name} (${mode.name})` : game.name })),
);

describe.each(CASES)("$name: kontrakt", ({ game, mode }) => {
  test.each([...new Set([game.minPlayers, game.maxPlayers])])("%i graczy: losowa partia do końca", (n) => {
    for (const seed of SEEDS) {
      const players = ["p1", "p2", "p3", "p4", "p5", "p6"].slice(0, n);
      const rng = createRng(seed);
      const views = (s: unknown) => [...players, ""].map((viewer) => JSON.stringify(game.playerView(s, viewer)));
      const seen = new Map<string, unknown>();
      const phases = (visited[game.id] ??= new Set());
      let s = game.setup(players, rng, mode);

      for (let steps = 0; !game.isOver(s); steps++) {
        if (steps > MAX_STEPS) throw new Error(`seed ${seed}: partia się nie kończy`);
        const waiting = game.waitingFor(s);
        expect(waiting.length, "w trakcie gry zawsze na kogoś czekamy").toBeGreaterThan(0);
        for (const p of waiting) {
          const fallback = game.timeoutMove!(s, p, rng);
          expect(game.moveSchema.safeParse(fallback).success, `seed ${seed}, ruch ${steps}: schemat ${JSON.stringify(fallback)}`).toBe(true);
          expect(game.validateMove(s, p, fallback), `seed ${seed}, ruch ${steps}: timeoutMove ${p} ${JSON.stringify(fallback)}`).toBe(true);
        }
        const player = waiting[Math.floor(rng() * waiting.length)];
        const eager = rng() < 0.7 ? EAGER[game.id]?.(rng).find((m) => game.validateMove(s, player, m)) : undefined;
        const move = eager ?? game.timeoutMove!(s, player, rng);
        phases.add((s as { phase?: string }).phase ?? "");
        const label = `seed ${seed}, ruch ${steps}: ${JSON.stringify(move).slice(0, 80)}`;

        expect(game.moveSchema.safeParse(move).success, label).toBe(true);
        expect(game.validateMove(s, player, move), label).toBe(true);
        expect(game.validateMove(s, STRANGER, move), `${label} (obcy)`).toBe(false);
        for (const other of players) {
          if (!waiting.includes(other)) expect(game.validateMove(s, other, move), `${label} (${other} poza turą)`).toBe(false);
        }
        views(s);

        seen.set(JSON.stringify(move), move);
        s = game.applyMove(s, player, move, rng);
      }

      expect(game.waitingFor(s)).toEqual([]);
      views(s);
      const { winner, ranking } = game.isOver(s)!;
      if (winner !== undefined) expect(players, `seed ${seed}: zwycięzca`).toContain(winner);
      if (ranking) {
        expect([...ranking].sort(), `seed ${seed}: ranking to wszyscy gracze, każdy raz`).toEqual([...players].sort());
        if (winner !== undefined) expect(ranking[0]).toBe(winner);
      }
      if (game.minPlayers === 1) {
        const places = game.places!(s);
        expect(Object.keys(places).sort(), `seed ${seed}: miejsca wszystkich graczy`).toEqual([...players].sort());
        const order = ranking!.map((p) => places[p]);
        expect(order, `seed ${seed}: miejsca rosną wzdłuż rankingu`).toEqual([...order].sort((a, b) => a - b));
        expect(order[0]).toBe(1);
        expect(winner !== undefined, `seed ${seed}: zwycięzca tylko przy samodzielnym 1. miejscu`).toBe(n > 1 && order.filter((x) => x === 1).length === 1);
        for (const p of players) expect(Number.isFinite(game.record!.score(s, p)), `seed ${seed}: rekord ${p}`).toBe(true);
      }
      for (const move of seen.values()) {
        for (const player of [...players, STRANGER]) {
          expect(game.validateMove(s, player, move), `seed ${seed}, po końcu: ${player} ${JSON.stringify(move).slice(0, 80)}`).toBe(false);
        }
      }
    }
  });
});

test("losowe partie przeszły przez każdą fazę gier wielofazowych (timeoutMove sprawdzony w każdej)", () => {
  const expected: Record<string, string[]> = {
    "kampus-tour": ["pick", "roll", "card", "buy", "buyout", "build", "sell", "juwenalia"],
    chinczyk: ["roll", "move"],
    statki: ["placing", "battle"],
    "panstwa-miasta": ["write", "vote", "summary"],
  };
  for (const [id, phases] of Object.entries(expected)) expect([...visited[id]].sort(), id).toEqual([...phases].sort());
});

// Rekord mini-gry to jedna liczba na gracza. Musi iść w tę samą stronę co miejsca: lepszy wynik (`good`) to 1. miejsce.
const quiz = (hits: number, errors = 0) => ({ times: Array.from({ length: hits }, () => 500), errors });
const timed = (hits: number, ms: number, errors = 0) => ({ times: Array.from({ length: hits }, () => ms), errors });
/** `tied`: ten sam główny wynik, o miejscu decyduje drugie kryterium (ta sama para: lepszy, gorszy). */
const RECORDS: Record<string, { lower: boolean; good: unknown; bad: unknown; field?: string; tied?: [unknown, unknown] }> = {
  simon: { lower: false, good: 7, bad: 3 },
  kubki: { lower: false, good: 7, bad: 3 },
  stroop: { lower: false, good: quiz(2), bad: quiz(1), tied: [timed(2, 400), timed(2, 600)] },
  liczenie: { lower: false, good: quiz(2), bad: quiz(1), tied: [timed(2, 400), timed(2, 600)] },
  inny: { lower: false, good: quiz(2), bad: quiz(1), tied: [timed(2, 400), timed(2, 600)] },
  dziesiatki: { lower: false, good: quiz(2), bad: quiz(1), tied: [timed(2, 400), timed(2, 600)] },
  obrot: { lower: false, good: quiz(3), bad: quiz(3, 2), tied: [timed(3, 400), timed(3, 600)] },
  literowka: { lower: false, good: quiz(3), bad: quiz(3, 2), tied: [timed(3, 400), timed(3, 600)] },
  stoj: { lower: false, good: quiz(4), bad: quiz(4, 1), tied: [timed(4, 400), timed(4, 600)] },
  sledzenie: { lower: false, good: { rounds: 5, hits: 0 }, bad: { rounds: 3, hits: 2 }, tied: [{ rounds: 4, hits: 2 }, { rounds: 4, hits: 1 }] },
  wieza: { lower: false, good: { height: 10, width: 0.2 }, bad: { height: 5, width: 0.5 }, tied: [{ height: 7, width: 0.5 }, { height: 7, width: 0.25 }] },
  "w-pamieci": { lower: false, good: { rounds: 5, diff: 9 }, bad: { rounds: 3, diff: 1 }, tied: [{ rounds: 4, diff: 1 }, { rounds: 4, diff: 6 }] },
  balon: { lower: false, good: { score: 90, popped: 3 }, bad: { score: 40, popped: 0 }, tied: [{ score: 60, popped: 1 }, { score: 60, popped: 4 }] },
  zakupy: { lower: false, good: { score: 9, hits: 9, wrong: 0, ms: 30_000 }, bad: { score: 6, hits: 8, wrong: 2, ms: 5000 }, tied: [{ score: 7, hits: 7, wrong: 0, ms: 8000 }, { score: 7, hits: 8, wrong: 1, ms: 12_000 }] },
  kolo: { lower: false, good: { score: 900, points: [] }, bad: { score: 500, points: [] }, field: "best" },
  refleks: { lower: true, good: 10, bad: 200 },
  stoper: { lower: true, good: 10, bad: 200 },
  rytm: { lower: true, good: 10, bad: 200 },
  przytrzymaj: { lower: true, good: 10, bad: 200 },
  zaslona: { lower: true, good: 10, bad: 200 },
  // Szybszy czas z pomyłką przegrywa: liczy się czas z karą.
  schulte: { lower: true, good: { ms: 20_000, mistakes: 0, splits: [] }, bad: { ms: 19_000, mistakes: 1, splits: [] } },
  sudoku: { lower: true, good: { ms: 20_000, mistakes: 0 }, bad: { ms: 19_000, mistakes: 1 } },
  kolor: { lower: true, good: 10, bad: 200 },
  kropki: { lower: true, good: 10, bad: 200 },
  kat: { lower: true, good: 10, bad: 200 },
  rok: { lower: true, good: 10, bad: 200 },
  srodek: { lower: true, good: 10, bad: 200 },
  mapa: { lower: true, good: 10, bad: 200 },
  tort: { lower: true, good: 10, bad: 200 },
  nozyczki: { lower: true, good: 10, bad: 200 },
};

test.each(MINI_GAME_IDS)("%s: rekord idzie w tę samą stronę co miejsca", (id) => {
  const game = GAMES[id];
  const fixture = RECORDS[id];
  expect(fixture, "każda mini-gra ma przypadek w RECORDS").toBeDefined();
  const state = { ...game.setup(["a", "b"], createRng(1)), [fixture.field ?? "results"]: { a: fixture.good, b: fixture.bad } };
  const { lower, score } = game.record!;
  expect(lower).toBe(fixture.lower);
  const [good, bad] = [score(state, "a"), score(state, "b")];
  expect(lower ? good < bad : good > bad, `${good} ma być lepsze niż ${bad}`).toBe(true);
  expect(game.places!(state)).toEqual({ a: 1, b: 2 });

  // Gra, która rozstrzyga remisy drugim kryterium, podaje je też w rekordzie; inaczej ranking rekordów byłby pełen remisów.
  if (!fixture.tied) return expect(game.record!.tie, "gra bez drugiego kryterium nie ma `tie`").toBeUndefined();
  const tied = { ...state, [fixture.field ?? "results"]: { a: fixture.tied[0], b: fixture.tied[1] } };
  const tie = game.record!.tie!;
  expect(score(tied, "a")).toBe(score(tied, "b"));
  const [first, second] = [tie.score(tied, "a"), tie.score(tied, "b")];
  expect(tie.lower ? first < second : first > second, `${first} ma być lepsze niż ${second}`).toBe(true);
  expect(game.places!(tied)).toEqual({ a: 1, b: 2 });
});

// Rekordowa partia w rankingu: stan przycięty do jednego gracza pod kluczem "1", bez id sesji; wyzwanie zostaje, a wynik się nie zmienia.
test.each(MINI_GAME_IDS)("%s: soloState zostawia jednego gracza i ten sam wynik", (id) => {
  const game = GAMES[id];
  const rng = createRng(3);
  let state = game.setup(["sesja-a", "sesja-b"], rng);
  for (let i = 0; i < 500 && !game.isOver(state); i++) {
    const player = game.waitingFor(state)[0];
    state = game.applyMove(state, player, game.timeoutMove!(state, player, rng), rng);
  }
  expect(game.isOver(state)).not.toBeNull();

  const solo = soloState(state, "sesja-b") as { players: string[] };
  expect(solo.players).toEqual(["1"]);
  expect(JSON.stringify(solo)).not.toContain("sesja-");
  expect(game.record!.score(solo, "1")).toBe(game.record!.score(state, "sesja-b"));
  expect(game.isOver(solo)?.ranking).toEqual(["1"]);
  // Wspólne dane wyzwania (wszystko poza mapami per gracz) zostają bez zmian.
  for (const [key, value] of Object.entries(state as Record<string, unknown>)) {
    const perPlayer = key === "players" || (typeof value === "object" && value !== null && !Array.isArray(value) && "sesja-b" in value);
    if (!perPlayer) expect((solo as Record<string, unknown>)[key]).toEqual(value);
  }
  expect(state.players).toEqual(["sesja-a", "sesja-b"]);
});

import { describe, expect, test } from "vitest";
import { createRng, soloState } from "./core.ts";
import { ITEMS, LIST, MAX_MS, type Move, score, SHELF, SHOW_MS, type State, type View, zakupy as game } from "./zakupy.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie; jedna runda: 10 s widać listę 10 przedmiotów, potem półkę z 20,
// - serwer losuje to samo dla wszystkich: 20 różnych przedmiotów z puli (kolejność na półce) i 10 z nich na listę (w innej kolejności),
// - klient oddaje jeden wynik: zaznaczone indeksy półki (różne, 0-19, od 0 do 20 sztuk) i czas zaznaczania (int 0-50 000 ms),
// - serwer liczy: trafienia minus zaznaczenia spoza listy, nie mniej niż 0,
// - więcej punktów wyżej, przy równych krótszy czas; zwycięzca tylko przy 2+ graczach i bez remisu,
// - po limicie czasu pusta półka z najgorszym czasem: 0 punktów i 50 000 ms.

const A = "ania";
const B = "bartek";
const C = "celina";

const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));
const result = (picked: number[], ms = 5000): Move => ({ type: "result", picked, ms });
/** Indeksy półki spoza listy. */
const others = (s: State) => s.items.map((_, i) => i).filter((i) => !s.listed.includes(i));
/** Gracz zaznacza `hits` przedmiotów z listy i `wrong` spoza niej. */
const picks = (s: State, hits = LIST, wrong = 0) => [...s.listed.slice(0, hits), ...others(s).slice(0, wrong)];
const play = (s: State, hits = LIST, wrong = 0, ms = 5000) => result(picks(s, hits, wrong), ms);

/** Tak ruch widzi platforma: najpierw kształt, potem reguły. */
const accepts = (s: State, player: string, move: unknown) => {
  const parsed = game.moveSchema.safeParse(move);
  return parsed.success && game.validateMove(s, player, parsed.data);
};

function send(s: State, player: string, move: Move): State {
  expect(accepts(s, player, move), `${player} wysyła ruch`).toBe(true);
  return game.applyMove(s, player, move, createRng(1));
}

describe("definicja", () => {
  test("1-6 graczy, limit 80 s, świeża gra trwa", () => {
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["zakupy", 1, 6, 80]);
    expect(game.isOver(fresh())).toBeNull();
  });

  test("limit tury daje zapas ponad 10 s pokazu i 50 s zaznaczania", () => {
    expect([LIST, SHELF, SHOW_MS, MAX_MS]).toEqual([10, 20, 10_000, 50_000]);
    expect(game.turnSeconds! * 1000 - SHOW_MS - MAX_MS).toBe(20_000);
  });
});

describe("setup", () => {
  test("pula przedmiotów nie ma powtórzeń i starcza na kilka różnych półek", () => {
    expect(new Set(ITEMS).size).toBe(ITEMS.length);
    expect(ITEMS.length).toBeGreaterThanOrEqual(2 * SHELF);
  });

  test("półka to 20 różnych przedmiotów z puli", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { items } = fresh([A], seed);
      expect(items).toHaveLength(SHELF);
      expect(new Set(items).size).toBe(SHELF);
      for (const item of items) expect(ITEMS).toContain(item);
    }
  });

  test("lista to 10 różnych indeksów półki", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { listed } = fresh([A], seed);
      expect(listed).toHaveLength(LIST);
      expect(new Set(listed).size).toBe(LIST);
      for (const i of listed) {
        expect(Number.isInteger(i)).toBe(true);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(SHELF);
      }
    }
  });

  test("losowanie sięga całej puli i każdego miejsca na półce", () => {
    const games = Array.from({ length: 200 }, (_, seed) => fresh([A], seed + 1));
    expect(new Set(games.flatMap((s) => s.items)).size).toBe(ITEMS.length);
    expect(new Set(games.flatMap((s) => s.listed)).size).toBe(SHELF);
  });

  test("kolejność na liście jest inna niż na półce (miejsce niczego nie podpowiada)", () => {
    const sorted = (list: number[]) => list.every((n, i) => i === 0 || list[i - 1] < n);
    const games = Array.from({ length: 50 }, (_, seed) => fresh([A], seed + 1));
    expect(games.filter((s) => sorted(s.listed)).length).toBeLessThan(5);
    // Lista nie zajmuje też stałych miejsc półki (np. pierwszych dziesięciu).
    expect(games.filter((s) => Math.max(...s.listed) < LIST).length).toBeLessThan(5);
  });

  test("na starcie czekamy na wszystkich, nikt nie ma wyniku", () => {
    const s = fresh([A, B, C]);
    expect(game.waitingFor(s)).toEqual([A, B, C]);
    expect(s.results).toEqual({});
  });

  test("ten sam seed to te same zakupy, inny seed (rewanż) to inne", () => {
    expect(fresh([A, B], 7)).toEqual(fresh([A, B], 7));
    expect(fresh([A, B], 8).items).not.toEqual(fresh([A, B], 7).items);
    expect(fresh([A, B], 8).listed).not.toEqual(fresh([A, B], 7).listed);
  });

  test("półkę i listę widzi każdy gracz i obserwator (partia toczy się na kliencie)", () => {
    const s = fresh();
    for (const viewer of [A, B, ""]) {
      const view = game.playerView(s, viewer) as View;
      expect(view.items).toEqual(s.items);
      expect(view.listed).toEqual(s.listed);
    }
  });
});

describe("liczenie wyniku", () => {
  const listed = [3, 7, 0, 12, 19, 5, 8, 14, 1, 10];

  test("komplet z listy to 10 punktów, kolejność zaznaczania nie ma znaczenia", () => {
    expect(score(listed, listed)).toEqual({ score: LIST, hits: LIST, wrong: 0 });
    expect(score(listed, [...listed].reverse())).toEqual({ score: LIST, hits: LIST, wrong: 0 });
  });

  test("zaznaczenie spoza listy zabiera punkt", () => {
    expect(score(listed, [3, 7, 0, 2])).toEqual({ score: 2, hits: 3, wrong: 1 });
  });

  test("wynik nie spada poniżej 0", () => {
    expect(score(listed, [3, 2, 4, 6])).toEqual({ score: 0, hits: 1, wrong: 3 });
  });

  test("pusta półka to 0 punktów bez błędów", () => {
    expect(score(listed, [])).toEqual({ score: 0, hits: 0, wrong: 0 });
  });

  test("zaznaczenie całej półki daje 0", () => {
    expect(score(listed, Array.from({ length: SHELF }, (_, i) => i))).toEqual({ score: 0, hits: LIST, wrong: SHELF - LIST });
  });

  test("dane zepsute: powtórzony indeks liczy się raz, indeks spoza półki to błąd", () => {
    expect(score(listed, [3, 3, 3, 7])).toEqual({ score: 2, hits: 2, wrong: 0 });
    expect(score(listed, [2, 2])).toEqual({ score: 0, hits: 0, wrong: 1 });
    expect(score(listed, [3, 7, 99, -1])).toEqual({ score: 0, hits: 2, wrong: 2 });
  });
});

describe("walidacja", () => {
  const s = fresh();

  test("gracz spoza gry", () => expect(accepts(s, C, play(s))).toBe(false));
  test("drugi wynik", () => expect(accepts(send(s, A, play(s)), A, play(s))).toBe(false));
  test("po końcu gry", () => {
    const over = send(send(s, A, play(s)), B, play(s));
    expect(accepts(over, A, play(s))).toBe(false);
    expect(accepts(over, B, play(s))).toBe(false);
  });
  test("zaznaczyć można dowolnie wiele: pusta półka i cała półka przechodzą", () => {
    expect(accepts(s, A, result([], 3000))).toBe(true);
    expect(accepts(s, A, result(Array.from({ length: SHELF }, (_, i) => i)))).toBe(true);
  });
  test("indeksy brzegowe: 0 i 19 przechodzą, −1 i 20 nie", () => {
    expect(accepts(s, A, result([0]))).toBe(true);
    expect(accepts(s, A, result([SHELF - 1]))).toBe(true);
    expect(accepts(s, A, result([-1]))).toBe(false);
    expect(accepts(s, A, result([SHELF]))).toBe(false);
  });
  test("indeks niecałkowity", () => expect(accepts(s, A, result([4.5]))).toBe(false));
  test("powtórzony indeks", () => {
    expect(accepts(s, A, result([3, 3]))).toBe(false);
    expect(accepts(s, A, result([0, 5, 9, 5]))).toBe(false);
  });
  test("czas brzegowy: 0 i 50 000 ms przechodzą, −1 i 50 001 nie", () => {
    expect(accepts(s, A, result([0], 0))).toBe(true);
    expect(accepts(s, A, result([0], MAX_MS))).toBe(true);
    expect(accepts(s, A, result([0], -1))).toBe(false);
    expect(accepts(s, A, result([0], MAX_MS + 1))).toBe(false);
  });
  test("czas niecałkowity", () => expect(accepts(s, A, result([0], 1234.5))).toBe(false));

  test("schemat odrzuca śmieci z sieci", () => {
    const parses = (m: unknown) => game.moveSchema.safeParse(m).success;
    expect(parses(play(s))).toBe(true);
    expect(parses({ type: "result" })).toBe(false);
    expect(parses({ type: "result", picked: [1, 2] })).toBe(false);
    expect(parses({ type: "result", ms: 5000 })).toBe(false);
    expect(parses({ type: "result", picked: "5", ms: 5000 })).toBe(false);
    expect(parses({ type: "result", picked: ["5"], ms: 5000 })).toBe(false);
    expect(parses({ type: "result", picked: [1, 2], ms: "5000" })).toBe(false);
    expect(parses({ type: "result", picked: Array(SHELF + 1).fill(1), ms: 5000 })).toBe(false);
    expect(parses({ type: "progress", done: 1 })).toBe(false);
    expect(parses({ type: "skok" })).toBe(false);
  });
});

describe("koniec", () => {
  test("więcej punktów wygrywa, niezależnie od kolejności miejsc", () => {
    for (const best of [A, B, C]) {
      let s = fresh([A, B, C]);
      for (const p of [A, B, C]) s = send(s, p, play(s, p === best ? LIST : LIST - 1));
      expect(game.isOver(s)?.winner).toBe(best);
      expect(s.results[best]).toEqual({ score: LIST, hits: LIST, wrong: 0, ms: 5000 });
      expect(game.waitingFor(s)).toEqual([]);
    }
  });

  test("pełny ranking w dobrej kolejności, zaznaczenia zostają w stanie", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, play(s, LIST, 3));
    s = send(s, B, play(s));
    s = send(s, C, play(s, LIST, 1));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(s.picked[A]).toEqual(picks(s, LIST, 3));
    expect(s.picked[B]).toEqual(picks(s));
  });

  test("strzał w ciemno kosztuje: mniej trafień bez błędów wygrywa z większą liczbą trafień z błędami", () => {
    let s = fresh();
    s = send(s, A, play(s, 6, 3));
    s = send(s, B, play(s, 4, 0));
    expect([s.results[A].score, s.results[B].score]).toEqual([3, 4]);
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });

  test("równe punkty: wygrywa krótszy czas zaznaczania", () => {
    let s = fresh();
    // Ania ma 8 czystych trafień, Bartek 9 trafień i błąd, ale zatwierdził szybciej.
    s = send(s, A, play(s, 8, 0, 9000));
    s = send(s, B, play(s, 9, 1, 4000));
    expect(s.results[A].score).toBe(s.results[B].score);
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places!(s)).toEqual({ [A]: 2, [B]: 1 });
  });

  test("równe punkty i czas: remis bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, play(s, 7, 0, 6000));
    s = send(s, B, play(s, 8, 1, 6000));
    expect(game.isOver(s)).toEqual({ ranking: [A, B] });
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 1 });
  });

  test("gra solo kończy się rankingiem bez zwycięzcy", () => {
    const s = fresh([A]);
    expect(game.isOver(send(s, A, play(s)))).toEqual({ ranking: [A] });
  });

  test("czekamy tylko na tych, którzy nie oddali wyniku", () => {
    let s = fresh([A, B, C]);
    s = send(s, B, play(s));
    expect(game.waitingFor(s)).toEqual([A, C]);
    expect(game.isOver(s)).toBeNull();
  });

  test("po limicie czasu pusta półka z najgorszym czasem, która przechodzi walidację i przegrywa z zatwierdzoną pustą półką", () => {
    let s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    s = send(s, A, move);
    s = send(s, B, result([], MAX_MS - 1));
    expect(s.results[A]).toEqual({ score: 0, hits: 0, wrong: 0, ms: MAX_MS });
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });

  test("applyMove nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const after = send(send(s, A, play(s, 6, 2)), B, play(s));
    expect(JSON.stringify(s)).toBe(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
  });
});

// P4-003: limit platformy z zapasem, ten sam kontrakt ręcznego i automatycznego oddania.
describe("pełny czas wybierania", () => {
  test.each([1, 2, 6])("%i graczy: zaznaczenia z granicy MAX_MS dają normalny wynik, rekord i miejsca", (n) => {
    const players = [A, B, C, "darek", "ewa", "filip"].slice(0, n);
    let s = fresh(players);
    const picked = picks(s, 8, 1);
    const move = result(picked, MAX_MS);
    for (const player of players) s = send(s, player, move);
    expect(game.isOver(s)).toEqual({ ranking: players });
    expect(game.places!(s)).toEqual(Object.fromEntries(players.map(p => [p, 1])));
    for (const player of players) {
      expect(s.picked[player]).toEqual(picked);
      expect(s.results[player]).toEqual({ score: 7, hits: 8, wrong: 1, ms: MAX_MS });
      expect(game.record!.score(s, player)).toBe(7);
      expect(game.record!.tie!.score(s, player)).toBe(MAX_MS);
      expect(accepts(s, player, move)).toBe(false);
    }
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    const solo = soloState(s, A);
    expect(game.record!.score(solo, "1")).toBe(7);
    expect(game.record!.tie!.score(solo, "1")).toBe(MAX_MS);
    expect(solo.picked["1"]).toEqual(picked);
  });

  test("oddanie na końcu wyboru zachowuje zaznaczenia i nie jest timeoutem serwera", () => {
    const initial = fresh();
    const before = JSON.stringify(initial);
    const picked = picks(initial, LIST, 2);
    const manual = send(initial, A, result(picked, MAX_MS));
    const automatic = send(initial, A, result([...picked], MAX_MS));
    expect(automatic).toEqual(manual);
    expect(automatic.results[A]).toEqual({ score: 8, hits: 10, wrong: 2, ms: MAX_MS });
    expect(automatic.results[A]).not.toEqual(send(initial, A, game.timeoutMove!(initial, A, createRng(1))).results[A]);
    expect(JSON.stringify(initial)).toBe(before);
  });
});

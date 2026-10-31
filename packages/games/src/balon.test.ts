import { describe, expect, test } from "vitest";
import { createRng } from "./core.ts";
import { BALLOONS, balon as game, MAX_SAFE, MIN_SAFE, type Move, score, type State, TOTAL, type View } from "./balon.ts";

// Testy napisane przed implementacją. Ustalają zasady:
// - 1-6 graczy grają naraz u siebie; 10 balonów, każde stuknięcie to punkt w balonie,
// - wytrzymałości balonów to zawsze komplet 11-20 stuknięć w potasowanej kolejności, ten sam dla wszystkich; następne stuknięcie rozrywa,
// - suma wytrzymałości to zawsze 155, a ryzyko w każdej partii takie samo (P4-060: dawniej 1-30 o stałej sumie),
// - klient oddaje jeden wynik: liczbę stuknięć w każdym z 10 balonów (int 0-21),
// - serwer liczy: balon z większą liczbą stuknięć niż wytrzymałość pękł i daje 0, inaczej daje tyle punktów, ile stuknięć,
// - więcej punktów wyżej, przy równych mniej pękniętych balonów; zwycięzca tylko przy 2+ graczach i bez remisu,
// - po limicie czasu pusta lista, czyli najgorszy wynik: 0 punktów i 10 pękniętych,
// - ruch progress zgłasza liczbę zakończonych balonów (1-9) do podglądu u rywali i nie odnawia limitu.

const A = "ania";
const B = "bartek";
const C = "celina";

const fresh = (players = [A, B], seed = 1) => game.setup(players, createRng(seed));
const result = (pumps: number[]): Move => ({ type: "result", pumps });
const progress = (done: number): Move => ({ type: "progress", done });
/** Gracz zgarnia każdy balon `margin` stuknięć przed wytrzymałością, a `popped` pierwszych rozrywa. */
const taps = (s: State, margin = 0, popped = 0) => s.limits.map((limit, i) => (i < popped ? limit + 1 : Math.max(0, limit - margin)));
const play = (s: State, margin = 0, popped = 0) => result(taps(s, margin, popped));
const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);

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
  test("1-6 graczy, limit 120 s, świeża gra trwa", () => {
    expect([game.id, game.minPlayers, game.maxPlayers, game.turnSeconds]).toEqual(["balon", 1, 6, 120]);
    expect(game.isOver(fresh())).toBeNull();
  });
});

describe("setup", () => {
  test("10 balonów, każdy wytrzymuje od 11 do 20 stuknięć (liczba całkowita)", () => {
    expect([BALLOONS, MIN_SAFE, MAX_SAFE]).toEqual([10, 11, 20]);
    for (let seed = 1; seed <= 50; seed++) {
      const { limits } = fresh([A], seed);
      expect(limits).toHaveLength(BALLOONS);
      for (const limit of limits) {
        expect(Number.isInteger(limit)).toBe(true);
        expect(limit).toBeGreaterThanOrEqual(MIN_SAFE);
        expect(limit).toBeLessThanOrEqual(MAX_SAFE);
      }
    }
  });

  test("P4-060: każda partia to ten sam komplet 11-20 w innej kolejności, dla 1000 seedów", () => {
    const all = Array.from({ length: 1000 }, (_, seed) => fresh([A], seed + 1).limits);
    for (const limits of all) expect([...limits].sort((a, b) => a - b)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(new Set(all.map(String)).size).toBeGreaterThan(900);
  });

  test("P4-060: ta sama strategia stop daje w każdej partii ten sam wynik", () => {
    const stop = (s: State, at: number) => s.limits.map(() => at);
    for (let seed = 1; seed <= 1000; seed++) {
      const s = fresh([A], seed);
      // Stop po 10: żaden balon nie pęka. Stop po 15: pękają balony 11-14, zostaje 6 × 15.
      expect(score(s.limits, stop(s, 10)), `seed ${seed}`).toEqual({ score: 100, popped: 0 });
      expect(score(s.limits, stop(s, 15)), `seed ${seed}`).toEqual({ score: 90, popped: 4 });
    }
  });

  test("suma wytrzymałości to zawsze 155: każda partia ma tyle samo do zgarnięcia", () => {
    expect(TOTAL).toBe(155);
    for (let seed = 1; seed <= 200; seed++) expect(sum(fresh([A], seed).limits)).toBe(TOTAL);
  });

  test("na starcie czekamy na wszystkich, nikt nie ma wyniku", () => {
    const s = fresh([A, B, C]);
    expect(game.waitingFor(s)).toEqual([A, B, C]);
    expect(s.results).toEqual({});
  });

  test("ten sam seed to te same balony, inny seed (rewanż) to inne", () => {
    expect(fresh([A, B], 7)).toEqual(fresh([A, B], 7));
    expect(fresh([A, B], 8).limits).not.toEqual(fresh([A, B], 7).limits);
  });

  test("balony widzi każdy gracz i obserwator (partia toczy się na kliencie)", () => {
    const s = fresh();
    for (const viewer of [A, B, ""]) expect((game.playerView(s, viewer) as View).limits).toEqual(s.limits);
  });
});

describe("liczenie wyniku", () => {
  const limits = [5, 10, 1, 30, 7, 7, 7, 7, 7, 7];

  test("stuknięcia równe wytrzymałości dają punkty, jedno więcej to pęknięcie", () => {
    expect(score([5], [5])).toEqual({ score: 5, popped: 0 });
    expect(score([5], [6])).toEqual({ score: 0, popped: 1 });
  });

  test("pęknięty balon daje 0, zgarnięte z innych zostają", () => {
    expect(score(limits, [5, 11, 1, 20, 0, 0, 0, 0, 0, 0])).toEqual({ score: 26, popped: 1 });
  });

  test("zgarnięty pusty balon to 0 punktów bez pęknięcia", () => {
    expect(score(limits, Array(BALLOONS).fill(0))).toEqual({ score: 0, popped: 0 });
  });

  test("najlepszy możliwy wynik to suma wytrzymałości", () => {
    expect(score(limits, limits)).toEqual({ score: sum(limits), popped: 0 });
  });

  test("pusta lista (limit czasu) to 0 punktów i wszystkie balony pęknięte", () => {
    expect(score(limits, [])).toEqual({ score: 0, popped: BALLOONS });
  });
});

describe("walidacja", () => {
  const s = fresh();
  const ok = taps(s);
  const last = (n: number) => result([...ok.slice(0, BALLOONS - 1), n]);

  test("gracz spoza gry", () => expect(accepts(s, C, play(s))).toBe(false));
  test("drugi wynik", () => expect(accepts(send(s, A, play(s)), A, play(s))).toBe(false));
  test("po końcu gry", () => {
    const over = send(send(s, A, play(s)), B, play(s));
    expect(accepts(over, A, play(s))).toBe(false);
    expect(accepts(over, B, progress(3))).toBe(false);
  });
  test("pusta lista przechodzi", () => expect(accepts(s, A, result([]))).toBe(true));
  test("za mało i za dużo balonów", () => {
    expect(accepts(s, A, result(ok.slice(0, BALLOONS - 1)))).toBe(false);
    expect(accepts(s, A, result([...ok, 1]))).toBe(false);
  });
  test("wartości brzegowe: 0 i 21 przechodzą, −1 i 22 nie", () => {
    expect(accepts(s, A, last(0))).toBe(true);
    expect(accepts(s, A, last(MAX_SAFE + 1))).toBe(true);
    expect(accepts(s, A, last(-1))).toBe(false);
    expect(accepts(s, A, last(MAX_SAFE + 2))).toBe(false);
  });
  test("liczba niecałkowita", () => expect(accepts(s, A, last(4.5))).toBe(false));

  test("schemat odrzuca śmieci z sieci", () => {
    const parses = (m: unknown) => game.moveSchema.safeParse(m).success;
    expect(parses(play(s))).toBe(true);
    expect(parses(progress(3))).toBe(true);
    expect(parses({ type: "result" })).toBe(false);
    expect(parses({ type: "result", pumps: "5" })).toBe(false);
    expect(parses({ type: "result", pumps: ["5"] })).toBe(false);
    expect(parses({ type: "result", pumps: Array(BALLOONS + 1).fill(1) })).toBe(false);
    expect(parses({ type: "progress" })).toBe(false);
    expect(parses({ type: "progress", done: "3" })).toBe(false);
    expect(parses({ type: "skok" })).toBe(false);
  });
});

describe("koniec", () => {
  test("więcej punktów wygrywa, niezależnie od kolejności miejsc", () => {
    for (const best of [A, B, C]) {
      let s = fresh([A, B, C]);
      for (const p of [A, B, C]) s = send(s, p, play(s, p === best ? 0 : 1));
      expect(game.isOver(s)?.winner).toBe(best);
      expect(s.results[best]).toEqual({ score: sum(s.limits), popped: 0 });
      expect(game.waitingFor(s)).toEqual([]);
    }
  });

  test("pełny ranking w dobrej kolejności, stuknięcia zostają w stanie", () => {
    let s = fresh([A, B, C]);
    s = send(s, A, play(s, 0, 3));
    s = send(s, B, play(s));
    s = send(s, C, play(s, 0, 1));
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, C, A] });
    expect(s.pumps[B]).toEqual(s.limits);
  });

  test("równe punkty: wygrywa ten, komu pękło mniej balonów", () => {
    let s = fresh();
    const [first, second] = s.limits;
    // Ania rozrywa pierwszy balon i zgarnia drugi, Bartek zgarnia tyle samo punktów z drugiego, a pierwszy zostawia pusty.
    s = send(s, A, result([first + 1, second, ...Array(BALLOONS - 2).fill(0)]));
    s = send(s, B, result([0, second, ...Array(BALLOONS - 2).fill(0)]));
    expect(s.results[A].score).toBe(s.results[B].score);
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
    expect(game.places!(s)).toEqual({ [A]: 2, [B]: 1 });
  });

  test("równe punkty i pęknięte: remis bez zwycięzcy", () => {
    let s = fresh();
    s = send(s, A, play(s, 0, 2));
    s = send(s, B, play(s, 0, 2));
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

  test("po limicie czasu najgorszy wynik, który przechodzi walidację", () => {
    let s = fresh();
    const move = game.timeoutMove!(s, A, createRng(1));
    s = send(s, A, move);
    s = send(s, B, result(Array(BALLOONS).fill(0)));
    expect(s.results[A]).toEqual({ score: 0, popped: BALLOONS });
    expect(game.isOver(s)).toEqual({ winner: B, ranking: [B, A] });
  });

  test("applyMove nie zmienia poprzedniego stanu, a stan przeżywa JSON", () => {
    const s = fresh();
    const before = JSON.stringify(s);
    const after = send(send(s, A, progress(2)), A, play(s));
    expect(JSON.stringify(s)).toBe(before);
    expect(JSON.parse(JSON.stringify(after))).toEqual(after);
  });
});

describe("postęp", () => {
  const s = fresh();

  test("na starcie pusty, po zgłoszeniu widzą go wszyscy", () => {
    expect((game.playerView(s, B) as View).progress).toEqual({});
    const after = send(s, A, progress(3));
    expect((game.playerView(after, B) as View).progress).toEqual({ [A]: 3 });
    expect((game.playerView(after, "") as View).progress).toEqual({ [A]: 3 });
  });

  test("nie kończy gry i nie zmienia, na kogo czekamy", () => {
    const after = send(s, A, progress(BALLOONS - 1));
    expect(game.isOver(after)).toBeNull();
    expect(game.waitingFor(after)).toEqual([A, B]);
    expect(accepts(after, A, play(s))).toBe(true);
  });

  test("może spaść (gracz odświeżył stronę i zaczyna od nowa)", () => {
    expect(send(send(s, A, progress(5)), A, progress(1)).progress[A]).toBe(1);
  });

  test.each([
    ["zero", progress(0)],
    ["ostatni balon (to już wynik)", progress(BALLOONS)],
    ["ułamek", progress(1.5)],
  ])("odrzucony: %s", (_, move) => expect(accepts(s, A, move)).toBe(false));
  test("pierwszy i przedostatni balon przechodzą", () => {
    expect(accepts(s, A, progress(1))).toBe(true);
    expect(accepts(s, A, progress(BALLOONS - 1))).toBe(true);
  });
  test("obcy gracz", () => expect(accepts(s, C, progress(3))).toBe(false));
  test("po oddaniu wyniku", () => expect(accepts(send(s, A, play(s)), A, progress(3))).toBe(false));

  test("limit tury ma stały klucz, więc postęp go nie odnawia", () => {
    expect(game.turn!(s)).toEqual({ key: "run", seconds: game.turnSeconds });
    expect(game.turn!(send(s, A, progress(5)))).toEqual(game.turn!(s));
  });
});

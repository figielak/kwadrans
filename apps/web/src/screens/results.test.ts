import { createRng, GAMES, MINI_GAME_IDS } from "@kwadrans/games";
import { describe, expect, test } from "vitest";
import { bestRound, heroResult, recordSummary, revealOrder, shouldReveal } from "./results.ts";

const NICKS: Record<string, string> = { a: "Ala", b: "Bob", c: "Cyd" };
const base = { places: null, seats: ["a", "b", "c"], me: "x", nick: (id: string) => NICKS[id] ?? "Gracz" };
const scored = (scores: Record<string, { best: number; tie?: number | null }>) => ({
  scoreOf: (id: string) => ({ best: scores[id].best, tie: scores[id].tie ?? null }),
  format: (n: number) => `${n} pkt`,
  gap: ({ gap }: { gap: number; onTie: boolean }) => `${gap} pkt`,
});

describe("heroResult", () => {
  test("bez wyniku i partia jednoosobowa: bez bohatera, niezależnie od liczby miejsc", () => {
    expect(heroResult({ ...base, result: null })).toBeNull();
    expect(heroResult({ ...base, result: { ranking: ["a"] } })).toBeNull();
    expect(heroResult({ ...base, seats: ["a"], result: { ranking: ["a"] } })).toBeNull();
  });

  test("walkower: bohater i jeden wiersz, też przy jednym miejscu", () => {
    expect(heroResult({ ...base, seats: ["a"], result: { winner: "a" } })).toEqual({ title: "Wygrywa Ala", rows: [{ id: "a", place: 1 }] });
  });

  test("walkower w mini-grze nie czyta wyniku, bo gracz mógł go nie oddać", () => {
    const scoreOf = () => {
      throw new Error("bez rankingu nie ma wyników");
    };
    expect(heroResult({ ...base, seats: ["a"], result: { winner: "a" }, scoreOf })?.rows).toEqual([{ id: "a", place: 1 }]);
  });

  test("własna wygrana to „Wygrywasz!”", () => {
    expect(heroResult({ ...base, me: "a", result: { winner: "a", ranking: ["a", "b"] } })?.title).toBe("Wygrywasz!");
  });

  test("`me` puste: tytuł w trzeciej osobie", () => {
    expect(heroResult({ ...base, me: "", result: { winner: "a", ranking: ["a", "b"] } })?.title).toBe("Wygrywa Ala");
  });

  test("`{ winner }` bez rankingu (Gomoku, Statki, Labirynt): zwycięzca 1, reszta 2", () => {
    const hero = heroResult({ ...base, seats: ["b", "a"], result: { winner: "a" } });
    expect(hero?.rows).toEqual([{ id: "a", place: 1 }, { id: "b", place: 2 }]);
  });

  test("wynik `{}` (przerwana): bez wierszy", () => {
    expect(heroResult({ ...base, result: {} })).toEqual({ title: "Remis", rows: [] });
  });

  test("gra główna bez `record`: wiersze bez liczby", () => {
    const hero = heroResult({ ...base, result: { winner: "a", ranking: ["a", "b", "c"] } });
    expect(hero?.rows).toEqual([{ id: "a", place: 1 }, { id: "b", place: 2 }, { id: "c", place: 3 }]);
  });

  test("miejsca: `places` przed `result.places` i pozycją w rankingu", () => {
    const hero = heroResult({ ...base, places: { a: 1, b: 2, c: 2 }, result: { winner: "a", ranking: ["a", "b", "c"], places: { a: 1, b: 3, c: 3 } } });
    expect(hero?.rows.map((r) => r.place)).toEqual([1, 2, 2]);
  });

  test("Szybki Chińczyk: `result.places` z równymi dalszymi miejscami, bez `places`", () => {
    const hero = heroResult({ ...base, result: { winner: "b", ranking: ["b", "a", "c"], places: { b: 1, a: 2, c: 2 } } });
    expect(hero?.rows).toEqual([{ id: "b", place: 1 }, { id: "a", place: 2 }, { id: "c", place: 2 }]);
  });

  test("liczba i różnica do osoby wyżej", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 18 }, b: { best: 16 }, c: { best: 11 } }), result: { winner: "a", ranking: ["a", "b", "c"] } });
    expect(hero?.rows).toEqual([
      { id: "a", place: 1, score: "18 pkt" },
      { id: "b", place: 2, score: "16 pkt", gap: "o 2 pkt" },
      { id: "c", place: 3, score: "11 pkt", gap: "o 5 pkt" },
    ]);
  });

  test("remis na górze: tytuł „Remis”, to samo miejsce, bez różnicy", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 5 }, b: { best: 5 }, c: { best: 3 } }), places: { a: 1, b: 1, c: 3 }, result: { ranking: ["a", "b", "c"] } });
    expect(hero?.title).toBe("Remis");
    expect(hero?.rows).toEqual([
      { id: "a", place: 1, score: "5 pkt" },
      { id: "b", place: 1, score: "5 pkt" },
      { id: "c", place: 3, score: "3 pkt", gap: "o 2 pkt" },
    ]);
  });

  test("Schulte 1, 1, 3: druga osoba bez różnicy, trzecia liczy od osoby tuż wyżej", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 20 }, b: { best: 20 }, c: { best: 25 } }), places: { a: 1, b: 1, c: 3 }, result: { ranking: ["a", "b", "c"] } });
    expect(hero?.rows.map((r) => [r.place, r.gap])).toEqual([[1, undefined], [1, undefined], [3, "o 5 pkt"]]);
  });

  test("równy wynik, różne miejsca: różnica z `tie`, nigdy „o 0”", () => {
    const gaps: { gap: number; onTie: boolean }[] = [];
    const hero = heroResult({
      ...base,
      ...scored({ a: { best: 12, tie: 250 }, b: { best: 12, tie: 280 } }),
      gap: (g) => {
        gaps.push(g);
        return `${g.gap} ms`;
      },
      seats: ["a", "b"],
      places: { a: 1, b: 2 },
      result: { winner: "a", ranking: ["a", "b"] },
    });
    expect(gaps).toEqual([{ gap: 30, onTie: true }]);
    expect(hero?.rows[1].gap).toBe("o 30 ms");
  });

  test("równy wynik bez `tie` przy różnych miejscach: bez różnicy", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 12 }, b: { best: 12 } }), seats: ["a", "b"], places: { a: 1, b: 2 }, result: { winner: "a", ranking: ["a", "b"] } });
    expect(hero?.rows[1].gap).toBeUndefined();
  });

  test("różnica, która po zaokrągleniu daje zero, znika (Schulte: 40 ms to „0,0 s”)", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 10_000 }, b: { best: 10_040 } }), gap: () => "0,0 s", seats: ["a", "b"], result: { winner: "a", ranking: ["a", "b"] } });
    expect(hero?.rows[1].gap).toBeUndefined();
  });

  test("zapis różnicy z własnym „o” nie dubluje przyimka (W pamięci)", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 4, tie: 1 }, b: { best: 4, tie: 3 } }), gap: () => "o 2", seats: ["a", "b"], result: { winner: "a", ranking: ["a", "b"] } });
    expect(hero?.rows[1].gap).toBe("o 2");
  });

  test("wynik nieskończony po limicie: miejsce bez liczby i różnicy, także u osoby niżej", () => {
    const hero = heroResult({ ...base, ...scored({ a: { best: 10 }, b: { best: Infinity }, c: { best: 30 } }), result: { winner: "a", ranking: ["a", "b", "c"] } });
    expect(hero?.rows).toEqual([{ id: "a", place: 1, score: "10 pkt" }, { id: "b", place: 2 }, { id: "c", place: 3, score: "30 pkt" }]);
  });

  test.each(MINI_GAME_IDS)("%s: wynik z widoku obserwatora po limitach daje wiersze bez wyjątku", (id) => {
    const def = GAMES[id];
    const rng = createRng(7);
    let state = def.setup(["a", "b"], rng);
    for (let i = 0; i < 2000 && !def.isOver(state); i++) {
      for (const player of def.waitingFor(state)) state = def.applyMove(state, player, def.timeoutMove!(state, player, rng), rng);
    }
    const result = def.isOver(state);
    expect(result).not.toBeNull();
    const view = def.playerView(state, "");
    const hero = heroResult({
      ...base,
      seats: ["a", "b"],
      me: "",
      result,
      places: def.places?.(state) ?? null,
      scoreOf: (player) => ({ best: def.record!.score(view, player), tie: def.record!.tie?.score(view, player) ?? null }),
    });
    expect(hero?.rows).toHaveLength(2);
  });
});

describe("revealOrder", () => {
  test("od ostatniego do pierwszego, bez zmiany wejścia", () => {
    const rows = [{ id: "a", place: 1 }, { id: "b", place: 2 }, { id: "c", place: 3 }];
    expect(revealOrder(rows).map((r) => r.id)).toEqual(["c", "b", "a"]);
    expect(rows[0].id).toBe("a");
  });
});

describe("shouldReveal", () => {
  test("tylko koniec partii na oczach gracza, przy 3+ wierszach", () => {
    expect(shouldReveal("playing", "over", 3)).toBe(true);
    expect(shouldReveal("playing", "over", 6)).toBe(true);
    expect(shouldReveal("playing", "over", 2)).toBe(false);
    expect(shouldReveal("over", "over", 3)).toBe(false);
    expect(shouldReveal(null, "over", 3)).toBe(false);
    expect(shouldReveal("over", "playing", 3)).toBe(false);
    expect(shouldReveal("lobby", "over", 3)).toBe(false);
  });

  test("rewanż znów daje odsłonę", () => {
    const steps = [shouldReveal("playing", "over", 3), shouldReveal("over", "playing", 3), shouldReveal("playing", "over", 3)];
    expect(steps).toEqual([true, false, true]);
  });
});

describe("bestRound", () => {
  test("jedyny najmniejszy błąd ze wszystkich rund i graczy", () => {
    expect(bestRound([{ id: "a", errors: [10, 4, 9] }, { id: "b", errors: [7, 5, 6] }])).toEqual({ round: 1, id: "a", error: 4 });
  });

  test("remis między graczami albo u jednego gracza: null", () => {
    expect(bestRound([{ id: "a", errors: [4, 8] }, { id: "b", errors: [9, 4] }])).toBeNull();
    expect(bestRound([{ id: "a", errors: [4, 4] }])).toBeNull();
  });

  test("puste `errors`: null, a gracz bez odpowiedzi nie przeszkadza reszcie", () => {
    expect(bestRound([])).toBeNull();
    expect(bestRound([{ id: "a", errors: [] }, { id: "b", errors: [] }])).toBeNull();
    expect(bestRound([{ id: "a", errors: [] }, { id: "b", errors: [3] }])).toEqual({ round: 0, id: "b", error: 3 });
  });
});

describe("recordSummary", () => {
  const order = { lower: false };
  const row = (nick: string, best: number) => ({ nick, best, tie: null, played: 1 });
  const common = { nick: "Ala", order, format: (s: { best: number }) => `${s.best} traf.`, gap: (g: { gap: number }) => `${g.gap} traf.` };
  const score = (best: number) => ({ best, tie: null });

  test("zwykła partia poniżej rekordu: jedna linia z brakiem do własnego rekordu", () => {
    const rows = [row("Ola", 30), row("Ala", 20)];
    expect(recordSummary({ ...common, before: rows, after: rows, score: score(19) })).toEqual({ line: "Do Twojego rekordu zabrakło 1 traf." });
  });

  test("wyrównany rekord: jedna linia", () => {
    const rows = [row("Ala", 20)];
    expect(recordSummary({ ...common, before: rows, after: rows, score: score(20) })).toEqual({ line: "Wyrównany rekord: 20 traf." });
  });

  test("bez stanu sprzed partii (odświeżenie) nie udaje wyrównania", () => {
    const rows = [row("Ala", 20)];
    expect(recordSummary({ ...common, before: null, after: rows, score: score(20) })).toEqual({ line: "Twój rekord: 20 traf." });
  });

  test("różnica zaokrąglona do zera nie daje „zabrakło 0”", () => {
    const rows = [row("Ala", 20)];
    expect(recordSummary({ ...common, gap: () => "0,0 s", before: rows, after: rows, score: score(19) })).toEqual({ line: "Twój rekord: 20 traf." });
  });

  test("własny rekord bez zmiany miejsca: pełny panel", () => {
    expect(recordSummary({ ...common, before: [row("Ola", 30), row("Ala", 20)], after: [row("Ola", 30), row("Ala", 25)], score: score(25) })).toEqual({ full: true });
  });

  test("awans: pełny panel", () => {
    expect(recordSummary({ ...common, before: [row("Ola", 30), row("Ala", 20)], after: [row("Ala", 31), row("Ola", 30)], score: score(31) })).toEqual({ full: true });
  });

  test("pierwszy wynik: pełny panel", () => {
    expect(recordSummary({ ...common, before: [row("Ola", 30)], after: [row("Ola", 30), row("Ala", 5)], score: score(5) })).toEqual({ full: true });
  });

  test("obserwator albo brak wyniku w rankingu: bez linii", () => {
    expect(recordSummary({ ...common, before: [], after: [row("Ola", 30)], score: undefined })).toBeNull();
    expect(recordSummary({ ...common, before: [], after: [row("Ola", 30)], score: score(5) })).toBeNull();
  });
});

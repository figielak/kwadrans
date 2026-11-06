import { describe, expect, test } from "vitest";
import { nickKey } from "./core.ts";
import { createRng } from "./core.ts";
import { GAMES } from "./index.ts";
import { addGame, eveningTable, placesFromResult, titles, VOTE_SECONDS, voteOptions, voteWinner, type Evening } from "./wieczor.ts";

const empty = (): Evening => ({ games: [], nicks: {} });
const rows = (...places: number[]) => places.map((place, i) => ({ key: ["ala", "bartek", "celina"][i], nick: ["Ala", "Bartek", "Celina"][i], place }));
const play = (evening: Evening, ...places: number[]) => addGame(evening, "stoper", rows(...places));

describe("placesFromResult", () => {
  const seats = ["a", "b", "c"];
  test("gotowe miejsca zachowują remisy i wycinają osoby poza seats", () => {
    expect(placesFromResult({ ranking: seats }, { a: 1, b: 1, c: 3, observer: 1 }, seats)).toEqual({ a: 1, b: 1, c: 3 });
  });
  test("result.places jest rezerwą dla gotowych miejsc", () => {
    expect(placesFromResult({ ranking: seats, places: { a: 1, b: 2, c: 2 } }, null, seats)).toEqual({ a: 1, b: 2, c: 2 });
  });
  test("ranking bez miejsc daje pozycje, sam zwycięzca wspólne drugie miejsce", () => {
    expect(placesFromResult({ ranking: ["b", "c", "a"] }, null, seats)).toEqual({ a: 3, b: 1, c: 2 });
    expect(placesFromResult({ winner: "b" }, null, seats)).toEqual({ a: 2, b: 1, c: 2 });
  });
  test("przerwanie, solo, jeden grający i walkower nie dają wpisu", () => {
    expect(placesFromResult(null, null, seats)).toBeNull();
    expect(placesFromResult({}, { a: 1, b: 2, c: 3 }, seats)).toBeNull();
    expect(placesFromResult({ ranking: ["a"] }, { a: 1 }, ["a"])).toBeNull();
    expect(placesFromResult({ winner: "a" }, null, ["a"])).toBeNull();
    expect(placesFromResult({}, null, [])).toBeNull();
  });
});

describe("addGame i eveningTable", () => {
  test("pusty wieczór i partia jednoosobowa nie tworzą tabeli", () => {
    const evening = empty();
    expect(eveningTable(evening)).toEqual([]);
    expect(addGame(evening, "stoper", [])).toEqual(evening);
    expect(addGame(evening, "stoper", rows(1))).toEqual(evening);
  });
  test("punkty jak w turnieju, remis bez samodzielnej wygranej", () => {
    expect(eveningTable(play(empty(), 1, 1, 3))).toEqual([
      { key: "ala", nick: "Ala", points: 1, wins: 0 },
      { key: "bartek", nick: "Bartek", points: 1, wins: 0 },
      { key: "celina", nick: "Celina", points: 0, wins: 0 },
    ]);
    expect(eveningTable(play(empty(), 1, 2, 2))[0]).toEqual({ key: "ala", nick: "Ala", points: 2, wins: 1 });
  });
  test("nie zmienia poprzedniego stanu ani wejściowych wierszy", () => {
    const evening = play(empty(), 1, 2);
    const input = rows(2, 1);
    const before = structuredClone({ evening, input });
    const next = addGame(evening, "schulte", input);
    expect({ evening, input }).toEqual(before);
    expect(next.games).toHaveLength(2);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
  test("wyjście i powrót po nickKey zachowują punkty i ostatnią pisownię", () => {
    const evening = play(empty(), 1, 2);
    const next = addGame(evening, "schulte", [{ key: nickKey(" ALA "), nick: "ALA", place: 2 }, { key: "celina", nick: "Celina", place: 1 }]);
    expect(eveningTable(next)).toEqual([
      { key: "ala", nick: "ALA", points: 1, wins: 1 },
      { key: "celina", nick: "Celina", points: 1, wins: 1 },
      { key: "bartek", nick: "Bartek", points: 0, wins: 0 },
    ]);
  });
  test("sortuje po punktach, potem wygranych, pełny remis stabilnie", () => {
    const evening = play(play(play(empty(), 1, 2, 3), 2, 1, 2), 2, 1, 2);
    expect(eveningTable(evening).map(({ key, points, wins }) => ({ key, points, wins }))).toEqual([
      { key: "bartek", points: 5, wins: 2 }, { key: "ala", points: 2, wins: 1 }, { key: "celina", points: 0, wins: 0 },
    ]);
    const tied = play(play(play(empty(), 2, 1, 2), 1, 3, 1), 1, 3, 1);
    expect(eveningTable(tied).map(({ key, points, wins }) => ({ key, points, wins }))).toEqual([
      { key: "bartek", points: 2, wins: 1 }, { key: "ala", points: 2, wins: 0 }, { key: "celina", points: 2, wins: 0 },
    ]);
  });
});

describe("titles", () => {
  test("mniej niż dwie partie nie daje tytułów", () => {
    expect(titles(empty())).toEqual([]);
    expect(titles(play(empty(), 1, 2))).toEqual([]);
  });
  test("najwięcej samodzielnych zwycięstw i najlepsza seria", () => {
    expect(titles(play(play(empty(), 1, 2), 1, 2))).toEqual([
      { title: "Najwięcej zwycięstw", nick: "Ala", detail: "2" },
      { title: "Najlepsza seria", nick: "Ala", detail: "2" },
    ]);
  });
  test("seria liczy remis na pierwszym miejscu, wygrane go nie liczą", () => {
    const evening = play(play(play(empty(), 1, 1, 3), 1, 1, 3), 2, 1, 3);
    expect(titles(evening)).toContainEqual({ title: "Najlepsza seria", nick: "Bartek", detail: "3" });
    expect(titles(evening)).toContainEqual({ title: "Najwięcej zwycięstw", nick: "Bartek", detail: "1" });
    expect(titles(play(play(empty(), 1, 1), 1, 1))).toEqual([{ title: "Najlepsza seria", nick: "Ala", detail: "2" }]);
  });
  test("porażka i nieobecność przerywają serię", () => {
    let evening = play(play(empty(), 1, 2, 3), 1, 2, 3);
    evening = addGame(evening, "schulte", rows(1, 2, 3).slice(1));
    evening = play(play(evening, 1, 2, 3), 2, 1, 3);
    expect(titles(evening)).toContainEqual({ title: "Najlepsza seria", nick: "Ala", detail: "2" });
  });
  test("powrót to największa strata odrobiona przez końcowego lidera", () => {
    let evening = play(play(empty(), 2, 1, 3), 2, 1, 3);
    evening = play(play(play(evening, 1, 2, 3), 1, 2, 3), 1, 2, 3);
    expect(titles(evening)).toContainEqual({ title: "Największy powrót", nick: "Ala", detail: "2 pkt" });
    expect(titles(evening)).toHaveLength(3);
  });
  test("bez straty nie ma powrotu, przegrany nie dostaje tytułu za dawną stratę", () => {
    const evening = play(play(play(empty(), 1, 2, 3), 2, 1, 3), 1, 2, 3);
    expect(titles(evening).some((t) => t.title === "Największy powrót")).toBe(false);
  });
  test("współlider też może odrobić stratę", () => {
    const evening = play(play(empty(), 1, 2), 2, 1);
    expect(titles(evening)).toContainEqual({ title: "Największy powrót", nick: "Bartek", detail: "1 pkt" });
  });
  test("tytuły używają najnowszej pisowni, także za wcześniejszą serię", () => {
    const evening = play(play(empty(), 1, 2), 1, 2);
    const next = addGame(evening, "stoper", [{ key: "ala", nick: "ALA", place: 2 }, { key: "bartek", nick: "Bartek", place: 1 }]);
    expect(titles(next)).toContainEqual({ title: "Najlepsza seria", nick: "ALA", detail: "2" });
  });
});

describe("voteOptions", () => {
  const game = (id: string, minPlayers = 1, maxPlayers = 6) => ({ id, minPlayers, maxPlayers });
  const pool = ["a", "b", "c", "d", "e", "f", "g"].map((id) => game(id));

  test("limit głosowania to 10 s", () => expect(VOTE_SECONDS).toBe(10));

  test("ten sam seed daje ten sam wynik", () => {
    expect(voteOptions(pool, 2, "a", [], createRng(7))).toEqual(voteOptions(pool, 2, "a", [], createRng(7)));
  });

  test("1000 seedów: 3 różne, pasujące gry bez bieżącej, co najmniej dwie niegrane", () => {
    const mixed = [...pool, game("duet", 2, 2), game("tlum", 5, 6)];
    const firsts = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const options = voteOptions(mixed, 3, "a", ["b", "c", "d"], createRng(seed));
      expect(new Set(options).size).toBe(3);
      for (const id of options) expect(["b", "c", "d", "e", "f", "g"]).toContain(id);
      expect(options.filter((id) => ["e", "f", "g"].includes(id)).length).toBeGreaterThanOrEqual(2);
      firsts.add(options[0]);
    }
    // Niegrane nie stoją zawsze na tych samych pozycjach.
    expect(firsts.has("b") || firsts.has("c") || firsts.has("d")).toBe(true);
  });

  test("każdy seed i każda liczba osób w prawdziwym katalogu: 3 różne gry pasujące do osób", () => {
    const catalog = Object.values(GAMES);
    for (let players = 1; players <= 6; players++) {
      for (let seed = 0; seed < 1000; seed++) {
        const options = voteOptions(catalog, players, "stoper", ["refleks"], createRng(seed));
        expect(new Set(options).size).toBe(3);
        expect(options).not.toContain("stoper");
        expect(options.filter((id) => id === "refleks").length).toBeLessThanOrEqual(1);
        for (const id of options) {
          expect(GAMES[id].minPlayers).toBeLessThanOrEqual(players);
          expect(GAMES[id].maxPlayers).toBeGreaterThanOrEqual(players);
        }
      }
    }
  });

  test("mniej niegranych niż dwie: bierze je wszystkie i dopełnia granymi", () => {
    for (let seed = 0; seed < 200; seed++) {
      const options = voteOptions(pool.slice(0, 5), 2, "a", ["b", "c", "d"], createRng(seed));
      expect(options).toHaveLength(3);
      expect(options).toContain("e");
    }
    expect(voteOptions(pool.slice(0, 4), 2, "a", ["a", "b", "c", "d"], createRng(1)).sort()).toEqual(["b", "c", "d"]);
  });

  test("gdy pasuje mniej niż 3, zwraca tyle, ile jest; nie pasuje nic: pusto", () => {
    const small = [game("a"), game("b"), game("duet", 2, 2)];
    expect(voteOptions(small, 1, "a", [], createRng(1))).toEqual(["b"]);
    expect(voteOptions([game("duet", 2, 2)], 1, "a", [], createRng(1))).toEqual([]);
  });
});

describe("voteWinner", () => {
  const options = ["a", "b", "c"];

  test("wygrywa większość", () => {
    for (let seed = 0; seed < 50; seed++) expect(voteWinner(options, { p1: "b", p2: "b", p3: "a" }, createRng(seed))).toBe("b");
  });

  test("remis rozstrzyga rng, tylko między remisującymi, i każdy może wygrać", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) seen.add(voteWinner(options, { p1: "a", p2: "c" }, createRng(seed)));
    expect([...seen].sort()).toEqual(["a", "c"]);
  });

  test("bez głosów losuje spośród wszystkich opcji", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) seen.add(voteWinner(options, {}, createRng(seed)));
    expect([...seen].sort()).toEqual(options);
  });

  test("głosy spoza opcji się nie liczą", () => {
    for (let seed = 0; seed < 50; seed++) expect(voteWinner(options, { p1: "x", p2: "x", p3: "c" }, createRng(seed))).toBe("c");
  });
});

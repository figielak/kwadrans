import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";
import { compareRecords } from "@kwadrans/games";
import { openStats } from "./stats.ts";

describe("statystyki", () => {
  it("zwycięzca dostaje wygraną i partię, reszta tylko partię", () => {
    const stats = openStats(":memory:");
    stats.record("statki", ["Ala", "Ola"], "Ala");
    expect(stats.ranking()).toEqual({
      statki: [
        { nick: "Ala", wins: 1, played: 1 },
        { nick: "Ola", wins: 0, played: 1 },
      ],
    });
  });

  it("gry liczą się osobno", () => {
    const stats = openStats(":memory:");
    stats.record("statki", ["Ala", "Ola"], "Ala");
    stats.record("chinczyk", ["Ala", "Ola", "Ela"], "Ela");
    const ranking = stats.ranking();
    expect(ranking.statki).toHaveLength(2);
    expect(ranking.chinczyk[0]).toEqual({ nick: "Ela", wins: 1, played: 1 });
  });

  it("sortuje po wygranych, przy remisie wyżej ten z mniejszą liczbą partii", () => {
    const stats = openStats(":memory:");
    stats.record("statki", ["Ala", "Ola"], "Ala");
    stats.record("statki", ["Ala", "Ola"], "Ola");
    stats.record("statki", ["Ala", "Ola"], "Ola");
    stats.record("statki", ["Ela", "Ula"], "Ela");
    expect(stats.ranking().statki.map((r) => r.nick)).toEqual(["Ola", "Ela", "Ala", "Ula"]);
  });

  it("pokazuje najwyżej 10 nicków na grę", () => {
    const stats = openStats(":memory:");
    for (let i = 0; i < 12; i++) stats.record("statki", [`G${i}`, "X"], `G${i}`);
    expect(stats.ranking().statki).toHaveLength(10);
  });

  it("nick bez wielkości liter i polskich znaków to jeden gracz, z ostatnią pisownią", () => {
    const stats = openStats(":memory:");
    stats.record("statki", ["Łukasz", "Ola"], "Łukasz");
    stats.record("statki", ["lukasz", "Ola"], "lukasz");
    stats.record("statki", ["LUKASZ", "Ola"], "Ola");
    expect(stats.ranking().statki).toEqual([
      { nick: "LUKASZ", wins: 2, played: 3 },
      { nick: "Ola", wins: 1, played: 3 },
    ]);
  });
});

describe("rekordy mini-gier", () => {
  const GAMES = [
    { id: "stoper", lower: true },
    { id: "simon", lower: false },
    { id: "stoj", lower: false, tie: { lower: true } },
    { id: "wieza", lower: false, tie: { lower: false } },
  ];
  const one = (nick: string, score: number, tie: number | null = null) => [{ nick, score, tie }];

  it("rekord to najlepszy wynik gracza: mniej albo więcej zależnie od gry", () => {
    const stats = openStats(":memory:");
    stats.recordScores("stoper", [...one("Ala", 120), ...one("Ola", 40)]);
    stats.recordScores("stoper", [...one("Ala", 30), ...one("Ola", 300)]);
    stats.recordScores("simon", [...one("Ala", 5), ...one("Ola", 9)]);
    stats.recordScores("simon", [...one("Ala", 7), ...one("Ola", 2)]);
    const records = stats.records(GAMES);
    expect(records.stoper).toEqual([
      { nick: "Ala", best: 30, tie: null, played: 2 },
      { nick: "Ola", best: 40, tie: null, played: 2 },
    ]);
    expect(records.simon).toEqual([
      { nick: "Ola", best: 9, tie: null, played: 2 },
      { nick: "Ala", best: 7, tie: null, played: 2 },
    ]);
  });

  it("partia solo też się liczy, a nick skleja się jak w rankingu wygranych", () => {
    const stats = openStats(":memory:");
    stats.recordScores("stoper", one("Łukasz", 50));
    stats.recordScores("stoper", one("lukasz", 20));
    stats.recordScores("stoper", one("LUKASZ", 80));
    expect(stats.records(GAMES).stoper).toEqual([{ nick: "LUKASZ", best: 20, tie: null, played: 3 }]);
  });

  it("przy równym głównym wyniku rozstrzyga drugie kryterium, w swoim kierunku", () => {
    const stats = openStats(":memory:");
    stats.recordScores("stoj", [...one("Ala", 13, 260), ...one("Ola", 13, 240), ...one("Ela", 14, 400)]);
    // Własny rekord też: te same 13 trafień, ale szybciej.
    stats.recordScores("stoj", one("Ala", 13, 230));
    stats.recordScores("stoj", one("Ala", 12, 100));
    expect(stats.records(GAMES).stoj).toEqual([
      { nick: "Ela", best: 14, tie: 400, played: 1 },
      { nick: "Ala", best: 13, tie: 230, played: 3 },
      { nick: "Ola", best: 13, tie: 240, played: 1 },
    ]);
    stats.recordScores("wieza", [...one("Ala", 7, 0.25), ...one("Ola", 7, 0.5)]);
    expect(stats.records(GAMES).wieza.map((r) => r.nick)).toEqual(["Ola", "Ala"]);
  });

  it("przy całkiem równych rekordach wyżej ten, kto ustanowił go wcześniej", () => {
    const stats = openStats(":memory:");
    stats.recordScores("simon", one("Ola", 4));
    stats.recordScores("simon", one("Ala", 8));
    stats.recordScores("simon", one("Ola", 8));
    stats.recordScores("simon", one("Ela", 8));
    expect(stats.records(GAMES).simon.map((r) => r.nick)).toEqual(["Ala", "Ola", "Ela"]);
  });

  it("zwraca wszystkich graczy, a gra bez wyników ma pustą listę", () => {
    const stats = openStats(":memory:");
    stats.recordScores("stoper", Array.from({ length: 15 }, (_, i) => ({ nick: `G${i}`, score: i, tie: null })));
    const records = stats.records(GAMES);
    expect(records.stoper).toHaveLength(15);
    expect(records.simon).toEqual([]);
  });
});

// P4-024: SQL i compareRecords układają rekordy tak samo, także ze starym tie = null.
describe("rekordy: ten sam porządek w SQL i core", () => {
  it("znany tie przed null przy równym wyniku, kolejność jak compareRecords", () => {
    const stats = openStats(":memory:");
    const order = { lower: false, tie: { lower: true } };
    stats.recordScores("stoj", [{ nick: "Ala", score: 5, tie: null }, { nick: "Ola", score: 5, tie: 900 }, { nick: "Ela", score: 5, tie: 0 }, { nick: "Ula", score: 6, tie: null }], order);
    const rows = stats.records([{ id: "stoj", ...order }]).stoj;
    expect(rows.map((r) => r.nick)).toEqual(["Ula", "Ela", "Ola", "Ala"]);
    expect([...rows].sort(compareRecords(order))).toEqual(rows);
  });
});

describe("migracja rekordów", () => {
  const GAMES = ["balon", "refleks", "przytrzymaj", "kropki", "stroop", "inny", "stoper"].map((id) => ({ id, lower: true }));

  it("kasuje stare rekordy tylko Refleksu (inna jednostka wyniku), raz; reszta i ranking wygranych zostają", () => {
    const path = join(mkdtempSync(join(tmpdir(), "stats-")), "stats.db");
    // Baza sprzed zmiany: bez wersji schematu.
    const old = new DatabaseSync(path);
    old.exec("CREATE TABLE results (game_id TEXT NOT NULL, nick TEXT NOT NULL, won INTEGER NOT NULL, at INTEGER NOT NULL)");
    old.exec("CREATE TABLE scores (game_id TEXT NOT NULL, nick TEXT NOT NULL, score REAL NOT NULL, tie REAL, at INTEGER NOT NULL)");
    for (const { id } of GAMES) old.exec(`INSERT INTO scores VALUES ('${id}', 'Ala', 5, NULL, 0)`);
    old.exec("INSERT INTO results VALUES ('balon', 'Ala', 1, 0)");
    old.close();

    const stats = openStats(path);
    const kept = [{ nick: "Ala", best: 5, tie: null, played: 1 }];
    expect(stats.records(GAMES)).toEqual({ balon: kept, refleks: [], przytrzymaj: kept, kropki: kept, stroop: kept, inny: kept, stoper: kept });
    expect(stats.ranking().balon).toEqual([{ nick: "Ala", wins: 1, played: 1 }]);

    // Wyniki zapisane po migracji przeżywają kolejny start serwera.
    stats.recordScores("refleks", [{ nick: "Ola", score: 240, tie: null }]);
    expect(openStats(path).records(GAMES).refleks).toEqual([{ nick: "Ola", best: 240, tie: null, played: 1 }]);
  });
});

describe("rekordowa partia", () => {
  const STOPER = { id: "stoper", lower: true };
  const SIMON = { id: "simon", lower: false };
  const play = (stats: ReturnType<typeof openStats>, game: typeof STOPER, nick: string, score: number, detail?: unknown) =>
    stats.recordScores(game.id, [{ nick, score, tie: null, detail }], game);
  const details = (path: string) => new DatabaseSync(path).prepare("SELECT COUNT(*) AS n FROM scores WHERE detail IS NOT NULL").get() as { n: number };

  it("top zwraca partię lidera; gorszy wynik jej nie rusza, lepszy podmienia", () => {
    const stats = openStats(":memory:");
    expect(stats.top(STOPER)).toBeNull();
    play(stats, STOPER, "Ala", 50, { target: 7000, results: { 1: 50 } });
    expect(stats.top(STOPER)).toEqual({ target: 7000, results: { 1: 50 } });
    play(stats, STOPER, "Ola", 80, { results: { 1: 80 } });
    expect(stats.top(STOPER)).toEqual({ target: 7000, results: { 1: 50 } });
    play(stats, STOPER, "Ola", 20, { results: { 1: 20 } });
    expect(stats.top(STOPER)).toEqual({ results: { 1: 20 } });
    // Kierunek gry: w Sekwencji lepszy jest większy wynik.
    play(stats, SIMON, "Ala", 5, { results: { 1: 5 } });
    play(stats, SIMON, "Ola", 9, { results: { 1: 9 } });
    expect(stats.top(SIMON)).toEqual({ results: { 1: 9 } });
    // Partie nie trafiają do listy rekordów.
    expect(stats.records([STOPER]).stoper[0]).toEqual({ nick: "Ola", best: 20, tie: null, played: 2 });
  });

  it("w bazie zostaje jedna partia na grę", () => {
    const path = join(mkdtempSync(join(tmpdir(), "stats-")), "stats.db");
    const stats = openStats(path);
    for (const [nick, score] of [["Ala", 50], ["Ola", 80], ["Ela", 20], ["Ala", 90]] as const) play(stats, STOPER, nick, score, { results: { 1: score } });
    play(stats, SIMON, "Ala", 5, { results: { 1: 5 } });
    expect(details(path).n).toBe(2);
    expect(stats.top(STOPER)).toEqual({ results: { 1: 20 } });
  });

  it("rekord sprzed zapisu partii nie ma szczegółów, dopóki ktoś go nie pobije", () => {
    const path = join(mkdtempSync(join(tmpdir(), "stats-")), "stats.db");
    // Baza w wersji 1: bez kolumny `detail`.
    const old = new DatabaseSync(path);
    old.exec("CREATE TABLE scores (game_id TEXT NOT NULL, nick TEXT NOT NULL, score REAL NOT NULL, tie REAL, at INTEGER NOT NULL)");
    old.exec("INSERT INTO scores VALUES ('stoper', 'Ala', 30, NULL, 0)");
    old.exec("PRAGMA user_version = 1");
    old.close();

    const stats = openStats(path);
    expect(stats.top(STOPER)).toBeNull();
    play(stats, STOPER, "Ola", 40, { results: { 1: 40 } });
    expect(stats.top(STOPER)).toBeNull();
    expect(details(path).n).toBe(0);
    play(stats, STOPER, "Ola", 10, { results: { 1: 10 } });
    expect(openStats(path).top(STOPER)).toEqual({ results: { 1: 10 } });
    expect(stats.records([STOPER]).stoper.map((r) => r.nick)).toEqual(["Ola", "Ala"]);
  });

  it("ranking dnia: liczą się tylko wyniki od podanej chwili", () => {
    vi.useFakeTimers();
    try {
      const stats = openStats(":memory:");
      vi.setSystemTime(1_000);
      play(stats, STOPER, "Ala", 10);
      play(stats, STOPER, "Ola", 50);
      vi.setSystemTime(5_000);
      play(stats, STOPER, "Ala", 40);
      play(stats, STOPER, "Ela", 30);
      expect(stats.records([STOPER], 5_000).stoper).toEqual([
        { nick: "Ela", best: 30, tie: null, played: 1 },
        { nick: "Ala", best: 40, tie: null, played: 1 },
      ]);
      expect(stats.records([STOPER]).stoper.map((r) => r.nick)).toEqual(["Ala", "Ela", "Ola"]);
    } finally {
      vi.useRealTimers();
    }
  });
});

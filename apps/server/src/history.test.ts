import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { openStats } from "./stats.ts";
import type { MatchEntry } from "./history.ts";

// 17: historia partii po nicku (profil gracza) i raport gier (/statystyki).
const T = new Date(2026, 10, 10, 20, 0).getTime();
const MIN = 60_000;

type Row = MatchEntry["players"][number];
const p = (nick: string, place: number | null, extra: Partial<Row> = {}): Row => ({
  nick,
  place,
  won: place === 1,
  score: null,
  left: false,
  timeouts: 0,
  ...extra,
});
const match = (gameId: string, players: Row[], extra: Partial<MatchEntry> = {}): MatchEntry => ({
  roomKey: "A",
  gameId,
  mode: null,
  kind: "room",
  source: "host",
  startedAt: T,
  endedAt: T + 5 * MIN,
  started: true,
  observers: 0,
  outcome: "completed",
  reactions: 0,
  players,
  ...extra,
});

describe("zapis partii", () => {
  it("partia i jej gracze trafiają do historii każdego uczestnika", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { mode: "klasyczny" }));
    const [row] = stats.history("ala");
    expect(row).toMatchObject({
      gameId: "statki",
      mode: "klasyczny",
      kind: "room",
      source: "host",
      outcome: "completed",
      startedAt: T,
      endedAt: T + 5 * MIN,
      place: 1,
      won: true,
      players: [
        { nick: "Ala", place: 1, left: false },
        { nick: "Ola", place: 2, left: false },
      ],
    });
    expect(stats.history("ola")[0]).toMatchObject({ place: 2, won: false });
  });

  it("nickKey łączy pisownie, a profil pokazuje ostatnią", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("ala", 1), p("Ola", 2)]));
    stats.recordMatch(match("statki", [p("Ała ", 2), p("Ola", 1)], { startedAt: T + 10 * MIN, endedAt: T + 15 * MIN }));
    expect(stats.history("ala")).toHaveLength(2);
    expect(stats.profile("ala")!.nick).toBe("Ała ".trim());
  });

  it("historia od najnowszej, stronami, z kursorem `before`", () => {
    const stats = openStats(":memory:");
    for (let i = 0; i < 25; i++) stats.recordMatch(match("stoper", [p("Ala", 1)], { kind: "solo", startedAt: T + i * MIN, endedAt: T + i * MIN + 30_000 }));
    const first = stats.history("ala");
    expect(first).toHaveLength(20);
    expect(first[0].startedAt).toBe(T + 24 * MIN);
    const rest = stats.history("ala", first.at(-1)!.id);
    expect(rest).toHaveLength(5);
    expect(rest.at(-1)!.startedAt).toBe(T);
  });

  it("nieznany nick nie ma profilu ani historii", () => {
    const stats = openStats(":memory:");
    expect(stats.profile("nikt")).toBeNull();
    expect(stats.history("nikt")).toEqual([]);
  });

  it("nie zapisuje IP, tokenów ani id sesji: tylko nick i dane partii", () => {
    const path = `${process.env.TMPDIR ?? "/tmp"}/kwadrans-columns-${process.pid}-${Date.now()}.db`;
    openStats(path).recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)]));
    const db = new DatabaseSync(path);
    for (const table of ["matches", "match_players", "game_signals"]) {
      const columns = (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns.join()).not.toMatch(/ip|token|session/i);
    }
  });
});

describe("profil", () => {
  it("liczy partie, dni, ulubioną grę i wygrane per gra", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)]));
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)], { startedAt: T + 10 * MIN, endedAt: T + 20 * MIN }));
    stats.recordMatch(match("stoper", [p("Ala", 1)], { kind: "solo", startedAt: T + 26 * 3600_000, endedAt: T + 26 * 3600_000 + MIN }));
    // Przerwana partia jest w historii, ale nie w liczbach profilu.
    stats.recordMatch(match("memory", [p("Ala", null), p("Ola", null)], { outcome: "stopped" }));
    const profile = stats.profile("ala")!;
    expect(profile).toMatchObject({ nick: "Ala", firstAt: T, matches: 3, days: 2, favorite: "statki" });
    expect(profile.games).toEqual([
      { gameId: "statki", played: 2, wins: 1 },
      { gameId: "stoper", played: 1, wins: 0 },
    ]);
    expect(stats.history("ala")).toHaveLength(4);
  });

  it("solo nie daje wygranej, nawet z pierwszym miejscem", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("stoper", [p("Ala", 1, { won: false })], { kind: "solo" }));
    expect(stats.profile("ala")!.games).toEqual([{ gameId: "stoper", played: 1, wins: 0 }]);
  });

  it("bilans z innymi: kto był wyżej w ukończonych partiach 2+ osób", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)]));
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)]));
    stats.recordMatch(match("memory", [p("Ala", 1), p("Ola", 1), p("Ela", 3)]));
    stats.recordMatch(match("chinczyk", [p("Ala", 3), p("Ola", 1), p("Ela", 2)]));
    // Walkower i przerwana się nie liczą.
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", null, { left: true })], { outcome: "walkover" }));
    expect(stats.profile("ala")!.rivals).toEqual([
      { key: "ola", nick: "Ola", matches: 4, wins: 1, losses: 2, ties: 1 },
      { key: "ela", nick: "Ela", matches: 2, wins: 1, losses: 1, ties: 0 },
    ]);
  });

  it("wieczory: pokój z co najmniej dwiema partiami 2+ osób, mistrz po punktach (remis na szczycie też)", () => {
    const stats = openStats(":memory:");
    // Pokój A: Ala wygrywa wieczór (2 pkt kontra 0).
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { roomKey: "A" }));
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { roomKey: "A" }));
    // Pokój B: remis 1:1, obie są mistrzyniami.
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { roomKey: "B" }));
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)], { roomKey: "B" }));
    // Pokój C: jedna partia to jeszcze nie wieczór.
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)], { roomKey: "C" }));
    // Pokój D: Ola wygrywa.
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)], { roomKey: "D" }));
    stats.recordMatch(match("memory", [p("Ala", 2), p("Ola", 1)], { roomKey: "D" }));
    expect(stats.profile("ala")!.evenings).toEqual({ played: 3, won: 2 });
    expect(stats.profile("ola")!.evenings).toEqual({ played: 3, won: 2 });
  });

  it("najlepsza seria: kolejne pierwsze miejsca w partiach 2+ osób (remis na pierwszym też)", () => {
    const stats = openStats(":memory:");
    const places = [1, 1, 2, 1, 1, 1, 3, 1];
    places.forEach((place, i) =>
      stats.recordMatch(match("memory", [p("Ala", place), p("Ola", place === 1 ? (i === 4 ? 1 : 2) : 1)], { startedAt: T + i * MIN, endedAt: T + i * MIN + 1 })),
    );
    // Solo nie przerywa serii ani jej nie wydłuża.
    stats.recordMatch(match("stoper", [p("Ala", 1)], { kind: "solo", startedAt: T + 4 * MIN + 5, endedAt: T + 4 * MIN + 10 }));
    expect(stats.profile("ala")!.bestStreak).toBe(3);
  });
});

describe("raport gier", () => {
  it("per gra: partie, ukończone, przerwane, gracze, solo, rewanże, mediana czasu, porzucona instrukcja", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { endedAt: T + 4 * MIN }));
    stats.recordMatch(match("statki", [p("Ala", 2), p("Ola", 1)], { source: "rematch", endedAt: T + 6 * MIN }));
    stats.recordMatch(match("statki", [p("Ala", null), p("Ela", null)], { outcome: "stopped", endedAt: T + MIN }));
    stats.recordMatch(match("stoper", [p("Ala", null)], { kind: "solo", source: "daily", outcome: "aborted", started: false, endedAt: T + 10_000 }));
    stats.recordMatch(match("stoper", [p("Ola", 1, { won: false, timeouts: 0 })], { kind: "solo", source: "list", reactions: 0 }));
    const report = stats.report(["statki", "stoper", "memory"], T - 1);
    expect(report.games.find((g) => g.gameId === "statki")).toMatchObject({
      matches: 3,
      completed: 2,
      aborted: 1,
      walkovers: 0,
      players: 3,
      solo: 0,
      rematches: 1,
      medianSeconds: 300,
      introLeft: 0,
    });
    expect(report.games.find((g) => g.gameId === "stoper")).toMatchObject({ matches: 2, completed: 1, aborted: 1, players: 2, solo: 2, introLeft: 1 });
    // Gra bez partii też jest w raporcie: to jej brak mówi najwięcej.
    expect(report.games.find((g) => g.gameId === "memory")).toMatchObject({ matches: 0, completed: 0, players: 0, medianSeconds: null });
    expect(report.totals).toEqual({ matches: 5, players: 3, days: 1 });
  });

  it("okres: `since` odcina starsze partie", () => {
    const stats = openStats(":memory:");
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { startedAt: T - 40 * 86_400_000, endedAt: T - 40 * 86_400_000 }));
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)]));
    expect(stats.report(["statki"], T - 30 * 86_400_000).games[0].matches).toBe(1);
    expect(stats.report(["statki"], 0).games[0].matches).toBe(2);
  });

  it("sygnały: wybrana, porzucona, w głosowaniu, wygrana głosowania, Jak grać; timeouty i reakcje na partię", () => {
    const stats = openStats(":memory:");
    stats.signal("statki", "picked", T);
    stats.signal("statki", "picked", T);
    stats.signal("statki", "dropped", T);
    stats.signal("statki", "voteShown", T);
    stats.signal("statki", "voteShown", T);
    stats.signal("statki", "voteWon", T);
    stats.signal("statki", "howTo", T);
    stats.recordMatch(match("statki", [p("Ala", 1, { timeouts: 3 }), p("Ola", 2, { timeouts: 1 })], { reactions: 6 }));
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { reactions: 2 }));
    expect(stats.report(["statki"], T - 1).games[0]).toMatchObject({
      picked: 2,
      dropped: 1,
      voteShown: 2,
      voteWon: 1,
      howTo: 1,
      timeoutsPerMatch: 2,
      reactionsPerMatch: 4,
    });
  });
});

describe("import starych wyników", () => {
  it("results i scores sprzed historii stają się partiami z `source: import`, raz", () => {
    const path = `${process.env.TMPDIR ?? "/tmp"}/kwadrans-import-${process.pid}-${Date.now()}.db`;
    // Baza w wersji 2: wyniki bez historii partii.
    const old = new DatabaseSync(path);
    old.exec("CREATE TABLE results (game_id TEXT NOT NULL, nick TEXT NOT NULL, won INTEGER NOT NULL, at INTEGER NOT NULL)");
    old.exec("CREATE TABLE scores (game_id TEXT NOT NULL, nick TEXT NOT NULL, score REAL NOT NULL, tie REAL, at INTEGER NOT NULL, detail TEXT)");
    old.exec("PRAGMA user_version = 2");
    const result = old.prepare("INSERT INTO results VALUES (?, ?, ?, ?)");
    result.run("statki", "Ala", 1, T);
    result.run("statki", "Ola", 0, T);
    // Mini-gra z wygraną ma też wiersze w results; partia bierze się ze scores, więc nie liczy się podwójnie.
    result.run("stoper", "Ala", 1, T + 1);
    result.run("stoper", "Ola", 0, T + 1);
    // Mistrz turnieju to nie partia.
    result.run("turniej", "Ala", 1, T + 3);
    const score = old.prepare("INSERT INTO scores (game_id, nick, score, tie, at) VALUES (?, ?, ?, ?, ?)");
    // Stoper: mniejsza odchyłka lepsza.
    score.run("stoper", "Ala", 10, null, T);
    score.run("stoper", "Ola", 40, null, T);
    score.run("stoper", "Ela", 10, null, T);
    score.run("stoper", "Ala", 25, null, T + 2 * MIN);
    old.close();

    const stats = openStats(path);
    const ala = stats.history("ala");
    expect(ala.map((m) => m.gameId)).toEqual(["stoper", "stoper", "statki"]);
    expect(ala.every((m) => m.source === "import" && m.outcome === "completed")).toBe(true);
    expect(ala[2]).toMatchObject({ place: 1, won: true, players: [{ nick: "Ala", place: 1 }, { nick: "Ola", place: 2 }] });
    expect(ala[1]).toMatchObject({ kind: "room", place: 1, players: [{ nick: "Ala", place: 1 }, { nick: "Ola", place: 3 }, { nick: "Ela", place: 1 }] });
    expect(ala[0]).toMatchObject({ kind: "solo", place: 1, won: false, players: [{ nick: "Ala" }] });
    // Ponowne otwarcie nie importuje drugi raz.
    expect(openStats(path).history("ala")).toHaveLength(3);
  });
});

describe("szczegóły raportu (insights)", () => {
  const DAY = 86_400_000;
  // Wtorek 10.11.2026, 20:00.
  const at = (dayOffset: number, hour = 20) => new Date(2026, 10, 10 + dayOffset, hour, 0).getTime();
  const now = at(0, 23);

  function seeded() {
    const stats = openStats(":memory:");
    // Wieczór w pokoju A: dwie ukończone partie (Statki 5 min, Memory 10 min) i jedna przerwana.
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { roomKey: "A", mode: "klasyczny", startedAt: at(0), endedAt: at(0) + 5 * MIN }));
    stats.recordMatch(match("memory", [p("Ala", 2), p("Ola", 1), p("Ela", 3)], { roomKey: "A", source: "vote", startedAt: at(0) + 6 * MIN, endedAt: at(0) + 16 * MIN }));
    stats.recordMatch(match("memory", [p("Ala", null), p("Ola", null), p("Ela", null)], { roomKey: "A", source: "rematch", outcome: "stopped", startedAt: at(0) + 17 * MIN, endedAt: at(0) + 18 * MIN }));
    // Pokój B: mini-gra w pokoju, jedna partia, to jeszcze nie wieczór.
    stats.recordMatch(match("stoper", [p("Ala", 1), p("Ola", 2)], { roomKey: "B", startedAt: at(-1, 9), endedAt: at(-1, 9) + MIN }));
    // Solo Uli dwa dni temu i wczoraj: Ula wraca.
    stats.recordMatch(match("stoper", [p("Ula", 1, { won: false })], { roomKey: "S1", kind: "solo", source: "daily", startedAt: at(-2, 8), endedAt: at(-2, 8) + 30_000 }));
    stats.recordMatch(match("stoper", [p("Ula", 1, { won: false })], { roomKey: "S2", kind: "solo", source: "list", startedAt: at(-1, 8), endedAt: at(-1, 8) + 30_000 }));
    // Stara partia Ali sprzed okresu: Ala nie jest nowa.
    stats.recordMatch(match("statki", [p("Ala", 1), p("Ola", 2)], { roomKey: "Z", startedAt: at(-40), endedAt: at(-40) + 5 * MIN }));
    return stats;
  }

  it("liczby zbiorcze: partie, ukończone, gracze, nowi, powracający, dni, wieczory, czas gry", () => {
    const { totals } = seeded().insights(at(-7), now);
    expect(totals).toEqual({
      matches: 6,
      completed: 5,
      players: 4,
      newPlayers: 2,
      returning: 3,
      days: 3,
      evenings: 1,
      playSeconds: 5 * 60 + 10 * 60 + 60 + 60 + 30 + 30,
    });
  });

  it("przebieg dzienny od początku okresu do dziś, z zerami, w podziale na gry główne, mini-gry w pokoju i solo", () => {
    const { daily } = seeded().insights(at(-3), now);
    expect(daily).toEqual([
      { day: "2026-11-07", main: 0, mini: 0, solo: 0 },
      { day: "2026-11-08", main: 0, mini: 0, solo: 1 },
      { day: "2026-11-09", main: 0, mini: 1, solo: 1 },
      { day: "2026-11-10", main: 3, mini: 0, solo: 0 },
    ]);
  });

  it("całość zaczyna przebieg od pierwszej partii", () => {
    const { daily } = seeded().insights(0, now);
    expect(daily[0].day).toBe("2026-10-01");
    expect(daily).toHaveLength(41);
  });

  it("godziny: tydzień od poniedziałku, 24 godziny", () => {
    const { hours } = seeded().insights(at(-7), now);
    expect(hours).toHaveLength(7);
    expect(hours.every((row) => row.length === 24)).toBe(true);
    // Wtorek 20:00: trzy partie pokoju A; poniedziałek 9:00 stoper, 8:00 solo; niedziela 8:00 solo.
    expect(hours[1][20]).toBe(3);
    expect(hours[0][9]).toBe(1);
    expect(hours[0][8]).toBe(1);
    expect(hours[6][8]).toBe(1);
  });

  it("źródła, rodzaje i wielkość stołu", () => {
    const i = seeded().insights(at(-7), now);
    expect(i.sources).toEqual([
      { source: "host", n: 2 },
      { source: "daily", n: 1 },
      { source: "list", n: 1 },
      { source: "rematch", n: 1 },
      { source: "vote", n: 1 },
    ]);
    expect(i.kinds).toEqual([
      { kind: "room", n: 4 },
      { kind: "solo", n: 2 },
    ]);
    expect(i.sizes).toEqual([
      { players: 1, n: 2 },
      { players: 2, n: 2 },
      { players: 3, n: 2 },
    ]);
  });

  it("wieczory: mediana partii i długości", () => {
    expect(seeded().insights(at(-7), now).evenings).toEqual({ count: 1, medianMatches: 2, medianMinutes: 18 });
  });

  it("gracze: partie, dni, wygrane, ulubiona gra, pierwsza i ostatnia partia, czy nowy", () => {
    const { players } = seeded().insights(at(-7), now);
    expect(players.map((p) => p.nick)).toEqual(["Ala", "Ola", "Ela", "Ula"]);
    expect(players[0]).toEqual({ key: "ala", nick: "Ala", matches: 4, days: 2, wins: 2, favorite: "memory", firstAt: at(-40), lastAt: at(0) + 17 * MIN, isNew: false });
    expect(players[3]).toMatchObject({ key: "ula", matches: 2, days: 2, wins: 0, favorite: "stoper", isNew: true });
  });

  it("szczegóły gry: tryby, źródła, wyniki, stoły, mediana czasu wg stołu, czołówka i 12 tygodni", () => {
    const { games } = seeded().insights(at(-7), now);
    expect(games.memory).toEqual({
      modes: [{ mode: null, n: 2 }],
      sources: [{ source: "rematch", n: 1 }, { source: "vote", n: 1 }],
      outcomes: [{ outcome: "completed", n: 1 }, { outcome: "stopped", n: 1 }],
      sizes: [{ players: 3, n: 2 }],
      medianBySize: [{ players: 3, seconds: 600 }],
      top: [
        { nick: "Ala", matches: 2, wins: 0 },
        { nick: "Ela", matches: 2, wins: 0 },
        { nick: "Ola", matches: 2, wins: 1 },
      ],
      weekly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    });
    expect(games.statki.modes).toEqual([{ mode: "klasyczny", n: 1 }]);
    // Tygodnie liczą się od `now` niezależnie od okresu: stara partia sprzed 40 dni wpada w szósty tydzień wstecz.
    expect(games.statki.weekly).toEqual([0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(games.kalambury).toBeUndefined();
    void DAY;
  });
});

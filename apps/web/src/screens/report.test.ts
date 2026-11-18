import type { ReportGame } from "@kwadrans/games";
import { describe, expect, it } from "vitest";
import { compareBy, duration, hoursMinutes, one, percent, shortDate, sortValue, warnings } from "./report.ts";

const game = (extra: Partial<ReportGame> = {}): ReportGame => ({
  gameId: "statki", matches: 0, completed: 0, aborted: 0, walkovers: 0, players: 0, solo: 0, rematches: 0, medianSeconds: null,
  introLeft: 0, avgPlayers: 0, timeoutsPerMatch: 0, reactionsPerMatch: 0, lastAt: null, picked: 0, dropped: 0, voteShown: 0, voteWon: 0, howTo: 0,
  ...extra,
});

describe("raport: formaty", () => {
  it("procent, czas i liczba", () => {
    expect([percent(3, 4), percent(0, 0)]).toEqual(["75%", "brak"]);
    expect([duration(null), duration(45.4), duration(270), duration(720)]).toEqual(["brak", "45 s", "4 min 30 s", "12 min"]);
    expect([one(2), one(1.25), one(0.04)]).toEqual(["2", "1,3", "0"]);
    expect(shortDate(new Date(2026, 10, 3).getTime())).toBe("03.11.26");
  });

  it("uwagi dopiero przy kilku próbach", () => {
    expect(warnings(game({ matches: 2, completed: 0 }))).toEqual([]);
    expect(warnings(game({ matches: 10, completed: 5 }))).toEqual(["często przerywana"]);
    expect(warnings(game({ picked: 6, dropped: 3, voteShown: 10, voteWon: 1 }))).toEqual(["wybierana i porzucana", "przegrywa głosowania"]);
    expect(warnings(game({ matches: 10, completed: 10, solo: 10, introLeft: 4 }))).toEqual(["porzucana na instrukcji"]);
  });
});

describe("raport: sortowanie i czas", () => {
  it("sortuje malejąco z brakami na końcu, nazwy po polsku", () => {
    const rows = [game({ gameId: "a", matches: 4, completed: 2 }), game({ gameId: "b" }), game({ gameId: "c", matches: 2, completed: 2 })];
    const byCompleted = [...rows].sort(compareBy((g) => sortValue(g, "completed", g.gameId), true)).map((g) => g.gameId);
    expect(byCompleted).toEqual(["c", "a", "b"]);
    const names = ["Żółw", "Ala", "Łoś"].sort(compareBy((n: string) => n, false));
    expect(names).toEqual(["Ala", "Łoś", "Żółw"]);
  });

  it("łączny czas gry", () => {
    expect([hoursMinutes(45 * 60), hoursMinutes(200 * 60)]).toEqual(["45 min", "3 h 20 min"]);
  });
});

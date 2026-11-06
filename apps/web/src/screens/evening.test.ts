import { CloseCode } from "@colyseus/sdk";
import type { RoomView } from "@kwadrans/games";
import { describe, expect, test } from "vitest";
import { champions, shareText, shouldSummarize } from "./evening.ts";

type Evening = RoomView["evening"];
const evening = (table: [string, number][], games = 3, titles: Evening["titles"] = []): Evening => ({
  games,
  played: ["stoper"],
  table: table.map(([nick, points]) => ({ key: nick.toLowerCase(), nick, points, wins: 0 })),
  titles,
});
const titles = [
  { title: "Najwięcej zwycięstw", nick: "Ala", detail: "2" },
  { title: "Największy powrót", nick: "Bob", detail: "3 pkt" },
];

describe("champions", () => {
  test("jeden mistrz, remis na szczycie to wszyscy współliderzy, pusta tabela to nikt", () => {
    expect(champions(evening([["Ala", 5], ["Bob", 3]])).map((r) => r.nick)).toEqual(["Ala"]);
    expect(champions(evening([["Ala", 4], ["Bob", 4], ["Cyd", 1]])).map((r) => r.nick)).toEqual(["Ala", "Bob"]);
    expect(champions(evening([]))).toEqual([]);
  });
});

describe("shareText", () => {
  test("mistrz, punkty, tytuły i link, bez kodu pokoju", () => {
    const text = shareText(evening([["Ala", 5], ["Bob", 3], ["Cyd", 0]], 3, titles));
    expect(text).toContain("3 gry");
    expect(text).toContain("Mistrz: Ala (5 pkt)");
    expect(text).toContain("Najwięcej zwycięstw: Ala (2)");
    expect(text).toContain("Największy powrót: Bob (3 pkt)");
    expect(text).toContain("games.figielak.dev");
    expect(text).not.toMatch(/\bkod\b/i);
  });

  test("remis na szczycie nie ma mistrza, tylko współliderów", () => {
    const text = shareText(evening([["Ala", 4], ["Bob", 4], ["Cyd", 1]]));
    expect(text).not.toContain("Mistrz");
    expect(text).toContain("Remis na szczycie: Ala i Bob (4 pkt)");
  });

  test("bez em-dashy, odmiana liczby gier, bez tytułów też działa", () => {
    for (const games of [2, 5, 12, 22]) expect(shareText(evening([["Ala", 5], ["Bob", 3]], games, titles))).not.toContain("—");
    expect(shareText(evening([["Ala", 1], ["Bob", 0]], 2))).toContain("2 gry");
    expect(shareText(evening([["Ala", 1], ["Bob", 0]], 5))).toContain("5 gier");
    expect(shareText(evening([["Ala", 1], ["Bob", 0]], 12))).toContain("12 gier");
    expect(shareText(evening([["Ala", 1], ["Bob", 0]], 22))).toContain("22 gry");
    expect(shareText(evening([["Ala", 1], ["Bob", 0]], 2))).toContain("Mistrz: Ala");
  });
});

describe("shouldSummarize", () => {
  const room = (games: number, solo = false) => ({ solo, evening: evening([["Ala", 1], ["Bob", 0]], games) });
  test("2+ gry i własne wyjście: tak", () => {
    expect(shouldSummarize(room(2), CloseCode.CONSENTED)).toBe(true);
    expect(shouldSummarize(room(7), CloseCode.CONSENTED)).toBe(true);
  });
  test("1 gra, zerwane połączenie, solo i brak widoku: nie", () => {
    expect(shouldSummarize(room(1), CloseCode.CONSENTED)).toBe(false);
    expect(shouldSummarize(room(0), CloseCode.CONSENTED)).toBe(false);
    expect(shouldSummarize(room(3), CloseCode.ABNORMAL_CLOSURE)).toBe(false);
    expect(shouldSummarize(room(3, true), CloseCode.CONSENTED)).toBe(false);
    expect(shouldSummarize(null, CloseCode.CONSENTED)).toBe(false);
  });
});

import { describe, expect, test } from "vitest";
import { duelLines } from "./profile.ts";

// 19-09: linia pojedynków gracza z obecnymi: „Ty : Ola 7:4”, tylko pary z nim i ze wspólnymi partiami.
describe("linia pojedynków", () => {
  const nicks = { ala: "Ala", ola: "Ola", iza: "Iza", jan: "Jan" };
  const duels = [
    { a: "ala", b: "iza", wins: [1, 0] as [number, number], ties: 0, matches: 1 },
    { a: "ala", b: "ola", wins: [2, 5] as [number, number], ties: 1, matches: 8 },
    { a: "iza", b: "ola", wins: [0, 1] as [number, number], ties: 0, matches: 1 },
  ];

  test("moje pary, wynik od mojej strony, najwięcej partii pierwsze", () => {
    expect(duelLines(duels, "ola", nicks)).toEqual([
      { key: "ala", nick: "Ala", mine: 5, theirs: 2 },
      { key: "iza", nick: "Iza", mine: 1, theirs: 0 },
    ]);
  });

  test("bez moich par albo bez partii: pusto", () => {
    expect(duelLines(duels, "jan", nicks)).toEqual([]);
    expect(duelLines([{ a: "ala", b: "jan", wins: [0, 0], ties: 0, matches: 0 }], "jan", nicks)).toEqual([]);
  });

  test("nieznany nick rywala: pomija (wyszedł z pokoju)", () => {
    expect(duelLines(duels, "iza", { iza: "Iza", ola: "Ola" })).toEqual([{ key: "ola", nick: "Ola", mine: 0, theirs: 1 }]);
  });
});

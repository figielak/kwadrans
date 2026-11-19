import { describe, expect, test } from "vitest";
import { forYouNow } from "./forYou.ts";

// 19-11: „Dla was teraz”: do 3 gier z powodem, liczone u klienta z rekordów i gier wieczoru.
describe("Dla was teraz", () => {
  const row = (nick: string, best: number, tie: number | null = null) => ({ nick, best, tie, played: 1 });
  const orders = { a: { lower: true }, b: { lower: true }, c: { lower: true }, d: { lower: true }, e: { lower: false } };
  const ids = ["a", "b", "c", "d", "e"];
  const base = { nicks: ["Ala", "Ola"], played: [] as string[], current: null as string | null, ids, orders };

  test("po jednym z każdego powodu: nowa, prowadzenie, jeszcze nie dziś", () => {
    const records = {
      a: [row("Ala", 300)],
      b: [row("Ola", 250), row("Ala", 262)],
      c: [row("Ala", 100), row("Ola", 200)],
    };
    expect(forYouNow({ ...base, records })).toEqual([
      { gameId: "a", reason: { kind: "new", nick: "Ola" } },
      { gameId: "b", reason: { kind: "lead", nick: "Ola", gap: 12, onTie: false } },
      { gameId: "d", reason: { kind: "fresh" } },
    ]);
  });

  test("bez bieżącej gry, gier wieczoru w „jeszcze nie dziś” ani powtórek", () => {
    const out = forYouNow({ ...base, records: {}, played: ["a", "b"], current: "c" });
    expect(out).toEqual([
      { gameId: "d", reason: { kind: "fresh" } },
      { gameId: "e", reason: { kind: "fresh" } },
    ]);
  });

  test("prowadzenie przy równym wyniku rozstrzyga drugie kryterium", () => {
    const out = forYouNow({ ...base, ids: ["a"], orders: { a: { lower: true, tie: { lower: true } } }, records: { a: [row("Ala", 10, 200), row("Ola", 10, 230)] } });
    expect(out).toEqual([{ gameId: "a", reason: { kind: "lead", nick: "Ala", gap: 30, onTie: true } }]);
  });

  test("najmniejsza względna różnica wygrywa wśród prowadzeń; nikt z obecnych bez wyniku nie daje „nowej”", () => {
    const records = { a: [row("Ala", 100), row("Ola", 150)], b: [row("Ala", 1000), row("Ola", 1010)], c: [row("Iza", 5)] };
    expect(forYouNow({ ...base, records, played: ids })[0]).toEqual({ gameId: "b", reason: { kind: "lead", nick: "Ala", gap: 10, onTie: false } });
  });

  test("wiele „nowych”: najwięcej wyników przy stole, pierwsza brakująca osoba w kolejności obecnych", () => {
    const nicks = ["Ala", "Ola", "Jan"];
    const records = { a: [row("Ala", 1)], b: [row("Ala", 1), row("Jan", 2)] };
    expect(forYouNow({ ...base, nicks, records, played: ids })[0]).toEqual({ gameId: "b", reason: { kind: "new", nick: "Ola" } });
  });

  test("mniej niż dwie osoby: pusto", () => {
    expect(forYouNow({ ...base, nicks: ["Ala"], records: {} })).toEqual([]);
  });
});

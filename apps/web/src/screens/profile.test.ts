import type { HistoryRow } from "@kwadrans/games";
import { describe, expect, it } from "vitest";
import { historyLine, matchesWord, resultOf, since } from "./profile.ts";

const now = new Date();
const at = new Date(now.getFullYear(), 0, 5, 9, 7).getTime();
const row = (extra: Partial<HistoryRow> = {}): HistoryRow => ({
  id: 1,
  gameId: "statki",
  mode: null,
  kind: "room",
  source: "host",
  outcome: "completed",
  startedAt: at,
  endedAt: at,
  place: 1,
  won: true,
  score: null,
  players: [
    { key: "ala", nick: "Ala", place: 1, left: false },
    { key: "ola", nick: "Ola", place: 2, left: false },
  ],
  ...extra,
});
const format = (_: string, n: number) => `${n} ms`;

describe("profil: teksty", () => {
  it("odmiana partii", () => {
    expect([1, 2, 4, 5, 12, 14, 22, 25].map(matchesWord)).toEqual(["1 partia", "2 partie", "4 partie", "5 partii", "12 partii", "14 partii", "22 partie", "25 partii"]);
  });

  it("data początku z miesiącem w dopełniaczu", () => {
    expect(since(new Date(2026, 10, 3).getTime())).toBe("3 listopada 2026");
  });

  it("linia historii: data i godzina, z kim, bez własnego nicku i etykiety zwykłego pokoju", () => {
    expect(historyLine(row(), "ala")).toBe("05.01, 09:07 · z Ola");
    expect(historyLine(row({ kind: "solo", players: [{ key: "ala", nick: "Ala", place: 1, left: false }] }), "Ala")).toBe("05.01, 09:07 · solo");
    expect(historyLine(row({ kind: "quick" }), "Ala")).toBe("05.01, 09:07 · szybka seria · z Ola");
  });

  it("linia historii: najwyżej trzy nicki, import bez godziny, inny rok z rokiem", () => {
    const players = ["Ala", "Ola", "Ela", "Iza", "Ula"].map((nick, i) => ({ key: nick.toLowerCase(), nick, place: i + 1, left: false }));
    expect(historyLine(row({ players }), "Ala")).toBe("05.01, 09:07 · z Ola, Ela, Iza +1");
    expect(historyLine(row({ source: "import" }), "Ala")).toBe("05.01 · z Ola");
    expect(historyLine(row({ startedAt: new Date(2024, 2, 9, 18, 0).getTime() }), "Ala")).toBe("09.03.24, 18:00 · z Ola");
  });

  it("wynik: miejsce z liczbą grających, wynik solo, walkower i przerwana", () => {
    expect(resultOf(row(), format)).toEqual({ text: "1. z 2", crown: true, muted: false, mono: true });
    expect(resultOf(row({ place: 2 }), format)).toMatchObject({ text: "2. z 2", crown: false, muted: true });
    expect(resultOf(row({ outcome: "stopped" }), format)).toMatchObject({ text: "przerwana", muted: true });
    expect(resultOf(row({ outcome: "walkover" }), format)).toMatchObject({ text: "walkower", muted: false });
    expect(resultOf(row({ outcome: "walkover", place: null }), format)).toMatchObject({ text: "wyszedł", muted: true });
    const solo = { players: [{ key: "ala", nick: "Ala", place: 1, left: false }] };
    expect(resultOf(row({ ...solo, score: 12 }), format)).toMatchObject({ text: "12 ms", mono: true });
    expect(resultOf(row({ ...solo, gameId: "stoper" }), format)).toMatchObject({ text: "ukończona", muted: true });
  });
});

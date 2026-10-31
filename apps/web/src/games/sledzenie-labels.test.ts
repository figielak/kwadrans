import { createRng, GAMES, SLEDZENIE_MOVE_MS, sledzeniePosition, type SledzenieView } from "@kwadrans/games";
import { describe, expect, test } from "vitest";
import { labelOrder } from "./Sledzenie.tsx";

// P4-039: numery kulek po zatrzymaniu wynikają tylko z końcowej pozycji (od góry, przy równym y od lewej).
describe("Śledzenie: numery kulek", () => {
  test("kolejność od góry do dołu, przy równym y od lewej", () => {
    const at = [
      { x: 0.5, y: 0.9 },
      { x: 0.8, y: 0.2 },
      { x: 0.2, y: 0.2 },
      { x: 0.4, y: 0.5 },
    ];
    expect(labelOrder(at)).toEqual([2, 1, 3, 0]);
  });

  test("numer nie zdradza celu: zamiana indeksów kulek daje te same numery na tych samych pozycjach", () => {
    const at = [
      { x: 0.1, y: 0.7 },
      { x: 0.6, y: 0.1 },
      { x: 0.3, y: 0.4 },
    ];
    const swapped = [at[2], at[0], at[1]];
    const label = (list: typeof at, i: number) => labelOrder(list).indexOf(i) + 1;
    for (let i = 0; i < at.length; i++) expect(label(swapped, (i + 1) % 3)).toBe(label(at, i));
  });

  test("każda kulka prawdziwej partii dostaje inny numer 1-8", () => {
    const state = GAMES.sledzenie.setup(["a"], createRng(7)) as SledzenieView;
    state.rounds.forEach((balls, round) => {
      const order = labelOrder(balls.map((b) => sledzeniePosition(b, round, SLEDZENIE_MOVE_MS)));
      expect([...order].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });
});

import { describe, expect, test } from "vitest";
import { grab } from "./Tort.tsx";

// P4-038: cięcie łapie się, gdy palec jest do 24 px od jego odcinka (środek → brzeg), niezależnie od kąta i odległości od środka.
// Współrzędne w jednostkach viewBox (100 = bok kafla); przy kaflu 300 px zasięg 24 px to 8 jednostek.
const REACH = 8;
const at = (deg: number, r: number) => ({ x: 50 + r * Math.sin((deg * Math.PI) / 180), y: 50 - r * Math.cos((deg * Math.PI) / 180) });

describe("Tort: łapanie cięcia", () => {
  test("blisko środka łapie mimo dużej różnicy kąta", () => {
    expect(grab([0, 180], at(40, 8), REACH)).toBe(0);
  });

  test("przy brzegu nie łapie z daleka, choć kąt jest mały", () => {
    expect(grab([0], at(15, 44), REACH)).toBeNull();
    expect(grab([0], at(9, 44), REACH)).toBe(0);
  });

  test("dwa bliskie cięcia: wybiera najbliższe palcu", () => {
    expect(grab([0, 12], at(9, 40), REACH)).toBe(1);
    expect(grab([0, 12], at(3, 40), REACH)).toBe(0);
  });

  test("za brzegiem liczy odległość od końca cięcia", () => {
    expect(grab([90], { x: 99, y: 50 }, REACH)).toBe(0);
    expect(grab([90], { x: 99, y: 58 }, REACH)).toBeNull();
  });

  test("daleko od wszystkich cięć: null, więc nic się nie przesuwa", () => {
    expect(grab([0, 120, 240], at(60, 30), REACH)).toBeNull();
    expect(grab([], at(0, 30), REACH)).toBeNull();
  });
});

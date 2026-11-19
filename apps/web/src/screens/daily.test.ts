import { describe, expect, test } from "vitest";
import { dailyStreakText } from "./profile.ts";

// 19-07: seria przy kaflu wyzwania od 2 dni, po przerwie łączna liczba dni, bez słów o stracie.
describe("podpis serii wyzwania", () => {
  test("bez nicku albo pierwszego dnia: nic", () => {
    expect(dailyStreakText(null)).toBe("");
    expect(dailyStreakText({ streak: 1, total: 1 })).toBe("");
  });

  test("seria od 2 dni", () => {
    expect(dailyStreakText({ streak: 5, total: 9 })).toBe(" · seria 5 dni");
  });

  test("po przerwie łączna liczba dni", () => {
    expect(dailyStreakText({ streak: 0, total: 23 })).toBe(" · łącznie 23 dni");
    expect(dailyStreakText({ streak: 1, total: 4 })).toBe(" · łącznie 4 dni");
  });

  test("nigdy o stracie", () => {
    for (const me of [{ streak: 0, total: 30 }, { streak: 1, total: 2 }]) expect(dailyStreakText(me)).not.toMatch(/strac|koniec|przerw/i);
  });
});

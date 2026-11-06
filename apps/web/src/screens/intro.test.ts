import { describe, expect, test } from "vitest";
import { autoStart } from "./intro.ts";

describe("autoStart: pomijanie instrukcji tylko na prośbę serwera", () => {
  test.each([
    { skipIntro: false, intro: false, expected: false },
    { skipIntro: false, intro: true, expected: false },
    { skipIntro: true, intro: false, expected: false },
    { skipIntro: true, intro: true, expected: true },
  ])("skipIntro=$skipIntro, intro=$intro → $expected", ({ skipIntro, intro, expected }) => {
    expect(autoStart({ skipIntro, intro })).toBe(expected);
  });

  test("odświeżenie przed begin zachowuje zamiar, po begin nic nie startuje samo", () => {
    const refresh = (state: { skipIntro: boolean; intro: boolean }) => JSON.parse(JSON.stringify(state));
    expect(autoStart(refresh({ skipIntro: true, intro: true }))).toBe(true);
    expect(autoStart(refresh({ skipIntro: false, intro: false }))).toBe(false);
  });
});

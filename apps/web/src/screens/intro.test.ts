import { describe, expect, test } from "vitest";
import { autoStart, introStage, startsAfterClose } from "./intro.ts";

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

describe("introStage: co pokazuje ekran instrukcji", () => {
  const base = { seated: true, solo: false, began: false, countdown: false, intro: true };

  test("gracz bez begin czyta, z begin jest gotowy, w odliczaniu odlicza", () => {
    expect(introStage(base)).toBe("reads");
    expect(introStage({ ...base, began: true })).toBe("ready");
    expect(introStage({ ...base, began: true, countdown: true })).toBe("countdown");
    expect(introStage({ ...base, countdown: true })).toBe("countdown");
  });

  test("solo czyta do własnego Start, bo nikt nie odlicza", () => {
    expect(introStage({ ...base, solo: true })).toBe("reads");
    expect(introStage({ ...base, solo: true, began: true })).toBe("reads");
  });

  test("obserwator nigdy nie czyta z przyciskiem", () => {
    expect(introStage({ ...base, seated: false })).toBe("watching");
    expect(introStage({ ...base, seated: false, began: true })).toBe("watching");
    expect(introStage({ ...base, seated: false, countdown: true })).toBe("countdown");
  });

  test("po zamknięciu instrukcji nic nie jest na ekranie", () => {
    expect(introStage({ ...base, intro: false })).toBe("closed");
  });
});

describe("startsAfterClose: start gry po zamknięciu instrukcji", () => {
  test("odświeżenie w odliczaniu: po zamknięciu gra rusza", () => {
    expect(startsAfterClose({ seen: true, intro: false })).toBe(true);
  });
  test("odświeżenie po zamknięciu: brak auto-startu bez wcześniejszego live", () => {
    expect(startsAfterClose({ seen: false, intro: false })).toBe(false);
  });
  test("instrukcja trwa: nic nie rusza", () => {
    expect(startsAfterClose({ seen: true, intro: true })).toBe(false);
  });
});

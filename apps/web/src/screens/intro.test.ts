import { describe, expect, test } from "vitest";
import { autoStart, introStage, secondsLeft, startsAfterClose } from "./intro.ts";

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

describe("secondsLeft: cyfra odliczania nie przekracza czasu z serwera", () => {
  // Odbiór: msLeft 3000 doszło o 10 000 ms zegara klienta.
  const deadline = 13_000;
  const receivedAt = 10_000;

  test("zegar widoku starszy niż wiadomość (tyka co 250 ms): pierwsza cyfra to 3, nie 4", () => {
    expect(secondsLeft({ deadline, now: 9_800, receivedAt })).toBe(3);
  });
  test("zaraz po odebraniu: 3", () => {
    expect(secondsLeft({ deadline, now: 10_000, receivedAt })).toBe(3);
  });
  test("kolejne sekundy: 2, 1", () => {
    expect(secondsLeft({ deadline, now: 10_001, receivedAt })).toBe(3);
    expect(secondsLeft({ deadline, now: 11_200, receivedAt })).toBe(2);
    expect(secondsLeft({ deadline, now: 12_100, receivedAt })).toBe(1);
  });
  test("termin minął: 0, bez wartości ujemnych", () => {
    expect(secondsLeft({ deadline, now: 13_000, receivedAt })).toBe(0);
    expect(secondsLeft({ deadline, now: 14_000, receivedAt })).toBe(0);
  });
  test("brak terminu: 0", () => {
    expect(secondsLeft({ deadline: null, now: 10_000, receivedAt })).toBe(0);
  });
});

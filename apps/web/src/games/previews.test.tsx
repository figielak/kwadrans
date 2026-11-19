import { readFileSync } from "node:fs";
import { MINI_GAME_IDS } from "@kwadrans/games";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { GamePreview, PREVIEWS } from "./previews.tsx";

// 19-03: podgląd z ekranu instrukcji jest też kaflem gry; na kaflu stoi (`.still`), animuje się tylko wybrany.
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("rejestr podglądów", () => {
  test("każda mini-gra ma podgląd, bez wpisów spoza listy", () => {
    expect(Object.keys(PREVIEWS).sort()).toEqual([...MINI_GAME_IDS].sort());
  });

  test.each([...MINI_GAME_IDS])("%s: podgląd renderuje się bez stanu gry", (id) => {
    expect(renderToStaticMarkup(<GamePreview id={id} />)).not.toBe("");
  });

  test("nieruchomy podgląd ma klasę still, wybrany nie", () => {
    expect(renderToStaticMarkup(<GamePreview id="refleks" still />)).toContain("still");
    expect(renderToStaticMarkup(<GamePreview id="refleks" />)).not.toContain("still");
  });

  test(".still zatrzymuje animacje potomków na klatce bazowej", () => {
    const rule = css.match(/\.still[^{]*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/animation-play-state: paused/);
  });
});

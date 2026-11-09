import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { RulesBody, RulesButton, RulesDetails } from "./HowToPlay.tsx";
import { HOW_TO_PLAY } from "./howToPlay.ts";

const card = HOW_TO_PLAY.sabotaz!;

describe("RulesBody", () => {
  const html = renderToStaticMarkup(<RulesBody card={card} />);
  test("pokazuje cztery nagłówki, cel i wszystkie punkty", () => {
    for (const head of ["Cel", "Przebieg", "Punktacja", "Uważaj"]) expect(html).toContain(`>${head}<`);
    for (const line of [card.goal, ...card.flow, ...card.scoring, ...card.watch]) {
      expect(html).toContain(line.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;"));
    }
  });
});

describe("RulesDetails", () => {
  test("gra bez karty daje pusty markup", () => {
    expect(renderToStaticMarkup(<RulesDetails gameId="nie-ma" />)).toBe("");
  });
  test("karta to zwinięte <details> z summary min-h-12 „Jak grać”", () => {
    const html = renderToStaticMarkup(<RulesDetails gameId="sabotaz" />);
    expect(html).toMatch(/^<details/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html).toMatch(/<summary[^>]*min-h-12[^>]*>[\s\S]*Jak grać/);
    expect(html).not.toContain("—");
  });
});

describe("RulesButton", () => {
  test("gra bez karty daje pusty markup", () => {
    expect(renderToStaticMarkup(<RulesButton gameId="nie-ma" />)).toBe("");
  });
  test("karta daje przycisk z aria-label i zamknięty dialog", () => {
    const html = renderToStaticMarkup(<RulesButton gameId="sabotaz" />);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*aria-label="Jak grać"|<button[^>]*aria-label="Jak grać"[^>]*type="button"/);
    expect(html).toContain("<dialog");
    expect(html).not.toMatch(/<dialog[^>]*\sopen/);
    expect(html).toContain("Czas tury biegnie dalej");
    expect(html).toContain("Sabotaż");
    expect(html).not.toContain("—");
  });
});

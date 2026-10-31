import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { RoundTable, ScoreTable } from "./ui.tsx";

// P4-048: dwa wspólne wzorce wyników (Scores, ScoreTable) i jeden tabeli rund (RoundTable z wierszem celów i własną komórką).
const src = new URL("..", import.meta.url).pathname;
const rules = readFileSync(join(src, "../../../ZASADY.md"), "utf8");
const game = (name: string) => readFileSync(join(src, "games", `${name}.tsx`), "utf8");
const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

describe("ScoreTable", () => {
  const render = () => renderToStaticMarkup(
    <ScoreTable
      heads={["Trafienia", "Śr. czas", "Błędy"]}
      winner="a"
      ranked
      rows={[
        { id: "a", nick: "Ala", color: "#f00", me: false, place: 1, cells: [{ value: 12 }, { value: "0,4 s" }, { value: 1, warn: true }] },
        { id: "b", nick: "Bob", color: "#0f0", me: true, place: 2, cells: [{ value: "brak trafień", span: 2, muted: true }, { value: 0 }] },
        { id: "c", nick: "Cyd", me: false, place: 2, cells: null },
      ]}
      note="Wygrywa najwięcej trafień."
    />,
  );

  test("kolumny, zwycięzca, miejsca z remisem, (ty), gra… i notka", () => {
    const html = render();
    const t = text(html);
    for (const s of ["Gracz", "Trafienia", "Śr. czas", "Błędy", "Ala", "12", "0,4 s", "Bob", "(ty)", "brak trafień", "2.", "gra…", "Wygrywa najwięcej trafień."]) expect(t).toContain(s);
    expect(html).toContain('aria-label="Zwycięzca"');
    expect(html).toContain('colSpan="2"');
    expect(html).toMatch(/text-warning[^>]*>1</);
  });
});

describe("RoundTable", () => {
  test("wiersz celów, znak w komórce, wynik w wierszu gracza i gra…", () => {
    const html = renderToStaticMarkup(
      <RoundTable
        heads={["1", "2"]}
        goal={{ label: "Cel", values: ["1,0 s", "2,0 s"] }}
        rows={[
          { id: "a", nick: "Ala", me: true, errors: [100, 0], score: "100 ms" },
          { id: "b", nick: "Bob", me: false, errors: [], score: null },
        ]}
        perfect={0}
        close={500}
        unit="s"
        format={(d, i) => `${i === 0 ? "−" : "+"}${d}`}
      />,
    );
    const t = text(html);
    for (const s of ["Cel", "1,0 s", "2,0 s", "−100", "+0", "100 ms", "(ty)", "gra…"]) expect(t).toContain(s);
    expect(t).not.toContain("bez odpowiedzi");
  });

  test("własny kolor komórki bez wyróżnienia najlepszego i własny podpis", () => {
    const html = renderToStaticMarkup(
      <RoundTable
        heads={["1"]}
        rows={[
          { id: "a", nick: "Ala", color: "#f00", me: false, errors: [5] },
          { id: "b", nick: "Bob", color: "#0f0", me: false, errors: [3] },
        ]}
        perfect={0}
        close={0}
        unit=""
        tone={(d) => ({ className: d > 4 ? "text-warning line-through" : "", label: d > 4 ? "pękł" : undefined })}
        caption="Stuknięcia w każdym balonie."
      />,
    );
    expect(html).toContain("line-through");
    expect(html).toContain('aria-label="pękł"');
    expect(html).not.toContain("color-mix");
    expect(text(html)).toContain("Stuknięcia w każdym balonie.");
    expect(text(html)).not.toContain("Błąd w każdej rundzie");
  });
});

describe("gry na wspólnych wzorcach", () => {
  test.each(["Quiz", "Refleks"])("%s: wyniki przez ScoreTable, bez własnej tabeli", (name) => {
    const code = game(name);
    expect(code).toContain("<ScoreTable");
    expect(code).not.toContain("<table");
  });

  test("Refleks pokazuje (ty) jak inne tabele", () => {
    expect(game("Refleks")).toMatch(/me: id === me/);
  });

  test.each(["Przytrzymaj", "Balon", "Szacowanie", "Rok"])("%s: rundy przez RoundTable", (name) => {
    const code = game(name);
    expect(code).toContain("<RoundTable");
    expect(code).not.toMatch(/grid-cols-(10|5|\[auto_repeat)/);
  });

  test("ZASADY §4: ScoreTable i RoundTable to wspólne wzorce, Odcień to wyjątek", () => {
    expect(rules).toMatch(/`ScoreTable`/);
    expect(rules).toMatch(/`RoundTable`[^\n]*wiersz celów/);
    expect(rules).toMatch(/Odcień[^\n]*wyjątek/);
  });
});

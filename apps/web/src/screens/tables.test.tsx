import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { KampusStats } from "@kwadrans/games";
import { KampusSummary } from "../games/KampusSummary.tsx";
import { ResultDetails, ResultHero, RoundTable, ScoreTable } from "./ui.tsx";

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

describe("ResultHero", () => {
  const NICKS: Record<string, string> = { a: "Ala", b: "Bob", c: "Cyd" };
  const common = { nick: (id: string) => NICKS[id], color: (id: string) => `#${id}${id}${id}`, me: "b" };
  const hero = { title: "Wygrywa Ala", rows: [{ id: "a", place: 1 }, { id: "b", place: 2 }, { id: "c", place: 3 }] };

  test("bez `score` pokazuje tytuł, miejsca i nicki; „(ty)” tylko u siebie", () => {
    const html = renderToStaticMarkup(<ResultHero {...common} hero={hero} winner="a" />);
    const t = text(html);
    for (const s of ["Wygrywa Ala", "1.", "Ala", "2.", "Bob (ty)", "3.", "Cyd"]) expect(t).toContain(s);
    expect(html).toMatch(/<h1[^>]*text-3xl/);
    expect(html).not.toContain("invisible");
  });

  test("`me` puste: bez „(ty)”", () => {
    expect(text(renderToStaticMarkup(<ResultHero {...common} me="" hero={hero} winner="a" />))).not.toContain("(ty)");
  });

  test("liczba i różnica w wierszu", () => {
    const t = text(renderToStaticMarkup(<ResultHero {...common} hero={{ title: "Remis", rows: [{ id: "a", place: 1, score: "18 traf." }, { id: "b", place: 2, score: "16 traf.", gap: "o 2 traf." }] }} />));
    for (const s of ["18 traf.", "16 traf.", "o 2 traf."]) expect(t).toContain(s);
  });

  test("odsłona: najpierw tylko ostatni wiersz, tytuł czeka na koniec", () => {
    const html = renderToStaticMarkup(<ResultHero {...common} hero={hero} winner="a" reveal />);
    expect(html).toMatch(/<h1[^>]*invisible/);
    const rows = html.match(/<li[^>]*>/g)!;
    expect(rows[0]).toContain("invisible");
    expect(rows[1]).toContain("invisible");
    expect(rows[2]).not.toContain("invisible");
    expect(rows[2]).toContain("stone-pop");
  });

  test("`rowsOnly`: same wiersze, bez tytułu i odsłony", () => {
    const html = renderToStaticMarkup(<ResultHero {...common} hero={hero} winner="a" reveal rowsOnly />);
    expect(html).not.toContain("<h1");
    expect(html).not.toContain("Wygrywa Ala");
    expect(html).not.toContain("invisible");
    expect(html).not.toContain("stone-pop");
    expect(text(html)).toContain("Cyd");
  });
});

describe("ResultDetails", () => {
  test("w partii nie dokłada pudełka ani przycisku", () => {
    const html = renderToStaticMarkup(<ResultDetails collapsible={false}><p>plansza</p></ResultDetails>);
    expect(html).toBe('<div class="contents"><p>plansza</p></div>');
  });

  test("po partii zwinięte: przycisk „Szczegóły”, treść ukryta, ale zamontowana", () => {
    const html = renderToStaticMarkup(<ResultDetails collapsible><p>plansza</p></ResultDetails>);
    expect(text(html)).toContain("Szczegóły");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/class="hidden"[^>]*><p>plansza/);
  });
});

describe("Kampus Tour: wiersze pod tytułem podsumowania", () => {
  const stats = { wealth: { a: [100], b: [90] }, rentPaid: {}, tileIncome: {}, doubles: {} } as unknown as KampusStats;

  test("`hero` stoi między tytułem a wykresem", () => {
    const html = renderToStaticMarkup(
      <KampusSummary title="Wygrywa Ala (monopol)" winner="a" stats={stats} players={["a", "b"]} nick={(id) => id} color={() => "#fff"} finalWealth={() => 100} actions={null} hero={<p>WIERSZE</p>} onClose={() => {}} />,
    );
    expect(html.indexOf("Wygrywa Ala (monopol)")).toBeLessThan(html.indexOf("WIERSZE"));
    expect(html.indexOf("WIERSZE")).toBeLessThan(html.indexOf("<figure"));
  });

  test("Game.tsx przekazuje `hero` w gałęzi kampus-tour, a KampusTour dalej do podsumowania", () => {
    const screen = readFileSync(join(src, "screens", "Game.tsx"), "utf8");
    expect(screen.slice(screen.indexOf('def.id === "kampus-tour"'), screen.indexOf("// Labirynt: przy wygranych"))).toMatch(/<KampusTour[\s\S]*hero=\{/);
    expect(game("KampusTour")).toMatch(/<KampusSummary[\s\S]*hero=\{hero\}/);
  });
});

describe("ekran po partii", () => {
  const screen = readFileSync(join(src, "screens", "Game.tsx"), "utf8");

  test("stara lista rankingu zniknęła, gry stoją w `ResultDetails`", () => {
    expect(screen).not.toContain("OWN_RANKING");
    expect(screen).toContain("<ResultDetails");
    // Tytuł bohatera (30 px) ma być największy: „N. miejsce” w panelu rekordów pod nim maleje.
    expect(screen).toContain("underHero={!!hero}");
  });

  test("ZASADY opisują bohatera, a stone-pop obejmuje odsłonę wierszy", () => {
    expect(rules).toMatch(/`ResultHero`/);
    expect(rules).toMatch(/\| `stone-pop` \|[^\n]*wiersz odsłony/);
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

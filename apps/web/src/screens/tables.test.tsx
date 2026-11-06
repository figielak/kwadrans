import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { Timer } from "@phosphor-icons/react";
import type { KampusStats, RoomView } from "@kwadrans/games";
import { KampusSummary } from "../games/KampusSummary.tsx";
import { OverActions } from "./Game.tsx";
import { bestRoundLine, EveningTable, ResultDetails, ResultHero, RoundTable, ScoreTable, VoteCards } from "./ui.tsx";

// Game.tsx przez net.ts czyta `location` już przy imporcie; testy idą w node, więc dostaje namiastkę.
vi.hoisted(() => {
  Object.assign(globalThis, { location: { hostname: "localhost", origin: "http://localhost", search: "" } });
});

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

  test("slot linii: pod wierszami, a w trakcie odsłony niewidoczny", () => {
    const slot = () => {};
    expect(renderToStaticMarkup(<ResultHero {...common} hero={hero} slot={slot} />)).toMatch(/<\/ol><div class="[^"]*empty:hidden/);
    expect(renderToStaticMarkup(<ResultHero {...common} hero={hero} slot={slot} reveal />)).toMatch(/<\/ol><div class="[^"]*invisible/);
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

describe("bestRoundLine", () => {
  const rows = [{ id: "a", nick: "Ola", errors: [4, 9] }, { id: "b", nick: "Bob", errors: [7, 8] }];
  const line = { rows, heads: [1, 2], unit: "km", format: (d: number) => `${d}` };

  test("nick, nazwa rundy i błąd z jednostką", () => {
    expect(bestRoundLine({ ...line, labels: ["Gdańsk", "Kraków"] })).toBe("Najlepsza runda: Ola, Gdańsk, 4 km");
  });

  test("`best: false` albo remis: bez linii", () => {
    expect(bestRoundLine({ ...line, best: false })).toBeNull();
    expect(bestRoundLine({ ...line, rows: [{ ...rows[0], errors: [4] }, { ...rows[1], errors: [4] }] })).toBeNull();
  });

  test("bez `labels`: nagłówek liczbowy to „runda 2”, tekstowy zostaje", () => {
    const second = [{ id: "a", nick: "Ola", errors: [9, 4] }];
    expect(bestRoundLine({ ...line, rows: second })).toBe("Najlepsza runda: Ola, runda 2, 4 km");
    expect(bestRoundLine({ ...line, rows: second, heads: ["3 kaw.", "4 kaw."] })).toBe("Najlepsza runda: Ola, 4 kaw., 4 km");
  });

  test("`shortUnit` zastępuje długi `unit`; procent bez spacji, pusty bez jednostki", () => {
    const tort = { ...line, unit: "% tortu do przełożenia", format: (d: number) => `${d},5` };
    expect(bestRoundLine({ ...tort, shortUnit: "%" })).toBe("Najlepsza runda: Ola, runda 1, 4,5%");
    expect(bestRoundLine({ ...line, shortUnit: "", format: (d: number) => `+${d}°` })).toBe("Najlepsza runda: Ola, runda 1, +4°");
  });

  test("zapis komórki nie będący tekstem (Mapa: „999+”): prawdziwa liczba", () => {
    expect(bestRoundLine({ ...line, format: () => <span>999+</span> })).toBe("Najlepsza runda: Ola, runda 1, 4 km");
  });
});

describe("linia najlepszej rundy w grach", () => {
  test("RoundTable bez slotu bohatera (ekran „Rekordy”) nic nie dokłada", () => {
    const html = renderToStaticMarkup(<RoundTable heads={[1]} rows={[{ id: "a", nick: "Ala", me: false, errors: [5] }]} perfect={0} close={0} unit="km" />);
    expect(text(html)).not.toContain("Najlepsza runda");
  });

  test("Mapa przekazuje `labels`", () => {
    expect(game("Mapa")).toMatch(/labels=\{view\.cities\.map\(\(c\) => c\.name\)\}/);
  });

  test.each([["Tort", "%"], ["Nozyczki", "%"], ["Srodek", "%"], ["Zaslona", "s"], ["Rok", "l."], ["Szacowanie", ""]])("%s ma `shortUnit` „%s”", (name, unit) => {
    expect(game(name)).toContain(`shortUnit="${unit}"`);
  });

  test.each(["Balon", "Przytrzymaj"])("%s bez linii: `best={false}`", (name) => {
    expect(game(name)).toContain("best={false}");
  });

  test("Game.tsx daje slot grom i bohaterowi", () => {
    const screen = readFileSync(join(src, "screens", "Game.tsx"), "utf8");
    expect(screen).toMatch(/<HeroSlot\.Provider value=\{slot\}>[\s\S]*<ResultDetails/);
    expect(screen).toMatch(/<ResultHero[\s\S]*slot=\{setSlot\}/);
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

describe("EveningTable (07-18)", () => {
  const table = [
    { key: "ala", nick: "Ala", points: 5, wins: 2 },
    { key: "bob", nick: "Bob", points: 3, wins: 1 },
    { key: "cyd", nick: "Cyd", points: 3, wins: 0 },
    { key: "dan", nick: "Dan", points: 0, wins: 0 },
  ];
  const evening = (games: number) => ({ games, played: ["stoper"], table, titles: [] });

  test("remis dzieli miejsce, wychodzący zostaje, ty oznaczone", () => {
    const t = text(renderToStaticMarkup(<EveningTable evening={evening(2)} present={["ala", "bob", "dan"]} meKey="bob" />));
    for (const s of ["Wieczór", "Ala", "Bob", "Cyd", "Dan", "(ty)", "5", "wyszedł"]) expect(t).toContain(s);
    expect(t.match(/2\./g)).toHaveLength(2);
    expect(t).toContain("4.");
    expect(t.match(/wyszedł/g)).toHaveLength(1);
  });

  test("przy mniej niż 2 grach tabeli nie ma", () => {
    expect(renderToStaticMarkup(<EveningTable evening={evening(1)} present={["ala"]} meKey="ala" />)).toBe("");
    expect(renderToStaticMarkup(<EveningTable evening={evening(0)} present={[]} meKey="ala" />)).toBe("");
  });
});

describe("VoteCards (07-20)", () => {
  const options = [
    { id: "stoper", name: "Stoper", icon: Timer },
    { id: "refleks", name: "Refleks", icon: Timer },
    { id: "memory", name: "Memory", icon: Timer },
  ];
  const colors: Record<string, string> = { a: "#f00", b: "#0f0", c: "#00f" };
  const render = (props: Partial<Parameters<typeof VoteCards>[0]> = {}) => renderToStaticMarkup(
    <VoteCards
      options={options}
      votes={{ a: "stoper", b: "stoper", c: "memory" }}
      nicks={{ a: "Ala", b: "Bob", c: "Cyd" }}
      colors={colors}
      msLeft={7000}
      me="a"
      seated
      onVote={() => {}}
      {...props}
    />,
  );

  test("trzy karty z nazwami, kropki głosujących w ich kolorach, własny wybór zaznaczony", () => {
    const html = render();
    const t = text(html);
    for (const s of ["Stoper", "Refleks", "Memory", "7 s"]) expect(t).toContain(s);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Stoper, głosują: Ala, Bob"');
    expect(html).toContain('aria-label="Refleks, bez głosów"');
    expect(html).toContain("background-color:#0f0");
    expect(html.match(/<button/g)).toHaveLength(3);
  });

  test("obserwator widzi karty bez dotyku i tekst „Głosują gracze”", () => {
    const html = render({ seated: false, me: "x" });
    expect(text(html)).toContain("Głosują gracze");
    expect(html).not.toContain("<button");
    expect(text(html)).toContain("Stoper");
  });
});

describe("OverActions (07-20)", () => {
  const players = ["a", "b", "c"].map((id, i) => ({ id, nick: id.toUpperCase(), color: ["#f00", "#0f0", "#00f"][i], connected: true, ready: false }));
  const view = (extra: Partial<RoomView> = {}) => ({ solo: false, hostId: "a", players, seats: ["a", "b"], tournament: null, vote: null, ...extra }) as unknown as RoomView;
  const render = (v: RoomView, me: string) => text(renderToStaticMarkup(<OverActions view={v} me={me} send={() => {}} />));

  test("gość: Rewanż i Inna gra, bez Do lobby", () => {
    const t = render(view(), "b");
    expect(t).toContain("Rewanż");
    expect(t).toContain("Inna gra");
    expect(t).not.toContain("Do lobby");
  });

  test("gospodarz ma też Do lobby", () => {
    expect(render(view(), "a")).toContain("Do lobby");
  });

  test("solo: Jeszcze raz i Wyjdź, bez głosowania", () => {
    const t = render(view({ solo: true }), "a");
    expect(t).toContain("Jeszcze raz");
    expect(t).toContain("Wyjdź");
    expect(t).not.toContain("Inna gra");
  });

  test("w trakcie głosowania rewanż znika, są karty; Do lobby tylko u gospodarza", () => {
    const vote = { options: ["stoper", "refleks", "memory"], votes: { b: "stoper" }, msLeft: 8000 };
    const host = render(view({ vote }), "a");
    expect(host).toContain("Stoper");
    expect(host).not.toContain("Rewanż");
    expect(host).not.toContain("Inna gra");
    expect(host).toContain("Do lobby");
    expect(render(view({ vote }), "b")).not.toContain("Do lobby");
  });

  test("oglądający nie ma Rewanżu ani Inna gra; zwykłego gościa spoza miejsc nie ma co pytać", () => {
    const t = render(view(), "c");
    expect(t).not.toContain("Rewanż");
    expect(t).not.toContain("Inna gra");
  });
});

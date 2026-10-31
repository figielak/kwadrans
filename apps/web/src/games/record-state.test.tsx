import { createRng, GAMES, soloState, type LobbyPlayer, type RytmView, type StoperView } from "@kwadrans/games";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Rytm } from "./Rytm.tsx";
import { Stoper } from "./Stoper.tsx";

const A = "ania";
const players: LobbyPlayer[] = [{ id: A, nick: "Ania", color: "#3b9eff", connected: true, ready: false }];
const noMove = () => { throw new Error("Ekran wyniku nie wysyła ruchu"); };
const text = (html: string) => html.replace(/<[^>]*>/g, "");
function finish(id: "stoper" | "rytm", data: unknown) {
  const game = GAMES[id], rng = createRng(1), state = game.setup([A], rng);
  const move = game.moveSchema.parse(data);
  expect(game.validateMove(state, A, move)).toBe(true);
  return game.applyMove(state, A, move, rng);
}

describe("P4-033: odświeżenie i rekordowa partia bez stanu lokalnego", () => {
  test.each([-123, 0, 456])("Stoper zachowuje czas i znak %i po ponownym montażu i soloState", (offset) => {
    const initial = GAMES.stoper.setup([A], createRng(1));
    const state = finish("stoper", { type: "result", deviation: Math.abs(offset), stopped: initial.target + offset });
    for (const record of [false, true]) {
      const view = JSON.parse(JSON.stringify(record ? soloState(state, A) : state)) as StoperView;
      const html = text(renderToStaticMarkup(<Stoper view={view} me={record ? "" : A} players={players} onMove={noMove} />));
      expect(html).toContain(((initial.target + offset) / 1000).toFixed(2).replace(".", ","));
      expect(html).toContain(`${offset < 0 ? "−" : "+"}${(Math.abs(offset) / 1000).toFixed(2).replace(".", ",")} s`);
      expect(html).toContain(`${Math.abs(offset)} ms`);
    }
  });

  test("Stoper ze starego detail pokazuje odchyłkę bez wymyślonego czasu i znaku", () => {
    const state = finish("stoper", { type: "result", deviation: 123 });
    Reflect.deleteProperty(state, "stops");
    const view = JSON.parse(JSON.stringify(soloState(state, A))) as StoperView;
    const html = text(renderToStaticMarkup(<Stoper view={view} me="" players={players} onMove={noMove} />));
    expect(html).toContain("Odchyłka");
    expect(html).toContain("0,12 s");
    expect(html).toContain("123 ms");
    expect(html).not.toContain("Twój czas");
    expect(html).not.toContain("+0,12");
    expect(html).not.toContain("−0,12");
  });

  test("Rytm odtwarza tempo ze stuknięć stanu po ponownym montażu i soloState", () => {
    const state = finish("rytm", { type: "result", taps: [600, 1200, 1800, 2400] });
    for (const record of [false, true]) {
      const view = JSON.parse(JSON.stringify(record ? soloState(state, A) : state)) as RytmView;
      const html = text(renderToStaticMarkup(<Rytm view={view} me={record ? "" : A} players={players} onMove={noMove} />));
      expect(html).toMatch(/(?:Twoje tempo|Tempo gracza)100/);
      expect(html).toContain(`cel ${Math.round(60000 / state.interval)} BPM`);
      expect(html).toContain(`${state.results[A]} ms`);
    }
  });

  test.each([false, true])("Rytm: stary detail albo brak stuknięć nie daje fikcyjnego tempa (stary=%s)", (legacy) => {
    const state = finish("rytm", { type: "result", taps: [] });
    if (legacy) Reflect.deleteProperty(state, "taps");
    const view = JSON.parse(JSON.stringify(soloState(state, A))) as RytmView;
    const html = text(renderToStaticMarkup(<Rytm view={view} me="" players={players} onMove={noMove} />));
    expect(html).toContain(`${state.interval} ms`);
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Infinity");
    expect(html).not.toContain("Twoje tempo");
    expect(html).not.toContain("Tempo gracza");
  });

  test("obserwator partii wieloosobowej nie dostaje kafla cudzej osoby", () => {
    for (const id of ["stoper", "rytm"] as const) {
      const game = GAMES[id], rng = createRng(1);
      let state = game.setup([A, "bartek"], rng);
      for (const p of state.players) {
        const move = game.moveSchema.parse(id === "stoper" ? { type: "result", deviation: 123, stopped: state.target - 123 } : { type: "result", taps: [600, 1200] });
        state = game.applyMove(state, p, move, rng);
      }
      const props = { me: "", players, onMove: noMove };
      const html = text(renderToStaticMarkup(id === "stoper" ? <Stoper {...props} view={state} /> : <Rytm {...props} view={state} />));
      expect(html).not.toContain("Twój czas");
      expect(html).not.toContain("Twoje tempo");
    }
  });
});

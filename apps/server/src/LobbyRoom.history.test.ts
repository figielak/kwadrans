import { type Client, CloseCode } from "@colyseus/core";
import type { RoomView } from "@kwadrans/games";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { createRng, dailyGame, dailySeed, GAMES, MINI_GAME_IDS } from "@kwadrans/games";
import { dailyDay, type MatchEntry } from "./history.ts";

// 17: pokój zapisuje każdą partię do historii (profil, raport) i liczy sygnały gier.
vi.mock("@colyseus/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@colyseus/core")>();
  return { ...actual, matchMaker: { ...actual.matchMaker, query: vi.fn(async () => []) } };
});

let LobbyRoom: typeof import("./LobbyRoom.ts").LobbyRoom;
let stats: typeof import("./LobbyRoom.ts").stats;
beforeAll(async () => {
  vi.stubEnv("DB_PATH", ":memory:");
  try {
    ({ LobbyRoom, stats } = await import("./LobbyRoom.ts"));
  } finally {
    vi.unstubAllEnvs();
  }
});

const rooms: InstanceType<typeof LobbyRoom>[] = [];
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  for (const room of rooms.splice(0)) {
    room.onDispose();
    room.clock.clear();
    room.clock.stop();
  }
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/** n grających i (gdy jest miejsce) jeden obserwator; nicki jak id sesji. */
async function openRoom(n: number, options?: { solo?: string; from?: string; nick?: string }) {
  const room = new LobbyRoom();
  rooms.push(room);
  const handlers = new Map<string, (client: Client, raw: unknown) => void>();
  vi.spyOn(room, "onMessage").mockImplementation((type, handler) => {
    handlers.set(String(type), handler as unknown as (client: Client, raw: unknown) => void);
  });
  vi.spyOn(room.clock, "setTimeout").mockImplementation((callback, ms, ...args) => {
    const timer = setTimeout(callback, ms, ...args);
    return { clear: () => clearTimeout(timer) } as ReturnType<typeof room.clock.setTimeout>;
  });
  await room.onCreate(options);
  const total = options?.solo ? 1 : n + 1;
  const clients = Array.from({ length: total }, (_, i) => ({ sessionId: `p${i + 1}`, send: vi.fn() } as unknown as Client));
  for (const client of clients) {
    room.clients.push(client);
    room.onJoin(client, {}, { nick: options?.nick ?? client.sessionId });
  }
  const send = (player: number, type: string, raw: unknown = {}) => handlers.get(type)!(clients[player], raw);
  const snapshot = (player = 0): RoomView => vi.mocked(clients[player].send).mock.calls.filter(([type]) => type === "room").at(-1)![1] as RoomView;
  const recorded = vi.spyOn(stats, "recordMatch");
  const signals = vi.spyOn(stats, "signal");
  const entries = () => recorded.mock.calls.map(([entry]) => entry as MatchEntry);
  const signalled = () => signals.mock.calls.map(([gameId, kind]) => `${gameId}:${kind}`);
  return { room, send, snapshot, clients, entries, signalled };
}

async function gomoku() {
  const ctx = await openRoom(2);
  ctx.send(0, "pickGame", { gameId: "piec-w-rzedzie" });
  ctx.send(1, "ready", { ready: true });
  ctx.send(0, "start");
  expect(ctx.snapshot().phase).toBe("playing");
  return ctx;
}
function winGomoku(send: (player: number, type: string, raw?: unknown) => void) {
  for (const x of [0, 1, 2, 3, 4]) {
    send(0, "move", { x, y: 0 });
    if (x < 4) send(1, "move", { x, y: 1 });
  }
}
async function stoper(n: number) {
  const ctx = await openRoom(n);
  ctx.send(0, "pickGame", { gameId: "stoper" });
  // Mini-gra sadza wszystkich; ostatni klient zostaje obserwatorem.
  ctx.send(0, "toggleSeat", { id: ctx.clients[n].sessionId });
  for (let i = 1; i < n; i++) ctx.send(i, "ready", { ready: true });
  ctx.send(0, "start");
  for (let i = 0; i < n; i++) ctx.send(i, "begin");
  vi.advanceTimersByTime(3000);
  return ctx;
}

describe("historia partii z pokoju", () => {
  test("ukończona partia: gra, tryb, rodzaj, źródło, czas, obserwatorzy, miejsca i wygrana", async () => {
    vi.setSystemTime(new Date(2026, 10, 10, 20, 0));
    const { send, entries } = await gomoku();
    vi.advanceTimersByTime(5000);
    winGomoku(send);
    expect(entries()).toHaveLength(1);
    const [entry] = entries();
    expect(entry).toMatchObject({
      gameId: "piec-w-rzedzie",
      kind: "room",
      source: "host",
      outcome: "completed",
      started: true,
      observers: 1,
      reactions: 0,
      players: [
        { nick: "p1", place: 1, won: true, left: false, timeouts: 0, score: null },
        { nick: "p2", place: 2, won: false, left: false, timeouts: 0, score: null },
      ],
    });
    expect(entry.endedAt - entry.startedAt).toBe(5000);
    expect(entry.roomKey).toMatch(/.{8,}/);
  });

  test("przerwana przez gospodarza: `stopped`, bez miejsc", async () => {
    const { send, entries } = await gomoku();
    send(0, "stopGame");
    expect(entries()[0]).toMatchObject({ outcome: "stopped", players: [{ place: null, won: false }, { place: null, won: false }] });
  });

  test("wyjście w trakcie: walkower, wychodzący ma `left`", async () => {
    const { room, entries, clients } = await gomoku();
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(entries()[0]).toMatchObject({ outcome: "walkover", players: [{ nick: "p1", place: 1, won: true }, { nick: "p2", place: null, left: true }] });
  });

  test("ruchy zegara liczą się graczowi, reakcje partii", async () => {
    const { send, entries } = await gomoku();
    vi.advanceTimersByTime(60_000);
    send(0, "react", { index: 1 });
    vi.advanceTimersByTime(1000);
    send(1, "react", { index: 2 });
    send(0, "stopGame");
    expect(entries()[0].players[0].timeouts).toBe(1);
    expect(entries()[0].reactions).toBe(2);
  });

  test("rewanż ma źródło `rematch`", async () => {
    const { send, entries } = await gomoku();
    winGomoku(send);
    send(0, "rematch");
    send(1, "rematch");
    send(0, "stopGame");
    expect(entries().map((e) => e.source)).toEqual(["host", "rematch"]);
  });

  test("mini-gra: wynik rekordu i miejsca z remisami", async () => {
    const { send, entries } = await stoper(2);
    send(0, "move", { type: "result", deviation: 100 });
    send(1, "move", { type: "result", deviation: 200 });
    expect(entries()[0]).toMatchObject({ gameId: "stoper", outcome: "completed", players: [{ nick: "p1", place: 1, won: true }, { nick: "p2", place: 2 }] });
    expect(entries()[0].players.every((p) => typeof p.score === "number")).toBe(true);
    // Drugie kryterium trafia do historii zawsze, przy grze bez niego jako null (ranking dnia).
    expect(entries()[0].players.every((p) => p.tie === null || typeof p.tie === "number")).toBe(true);
    expect(entries()[0].players.every((p) => "tie" in p)).toBe(true);
  });

  test("turniej i szybka seria mają swój rodzaj", async () => {
    const quick = await openRoom(2);
    quick.send(0, "quickSeries");
    quick.send(0, "stopGame");
    expect(quick.entries()[0]).toMatchObject({ kind: "quick", source: "tournament" });

    const full = await openRoom(2);
    full.send(0, "pickTournament", { length: 3 });
    full.send(1, "ready", { ready: true });
    full.send(2, "ready", { ready: true });
    full.send(0, "start");
    full.send(0, "stopGame");
    // Oba pokoje zapisują przez ten sam `stats`, więc wpis pełnego turnieju jest ostatni.
    expect(full.entries().at(-1)).toMatchObject({ kind: "tournament", source: "tournament" });
  });

  test("solo: źródło z opcji tworzenia, wyjście z instrukcji to porzucona instrukcja", async () => {
    const { room, entries, clients } = await openRoom(1, { solo: "stoper", from: "daily" });
    await room.onLeave(clients[0], CloseCode.CONSENTED);
    expect(entries()[0]).toMatchObject({ kind: "solo", source: "daily", outcome: "aborted", started: false, players: [{ nick: "p1", place: null, won: false }] });
  });

  test("solo: nieznane źródło to lista, „Jeszcze raz” to rewanż, a jedyny gracz nie wygrywa", async () => {
    const { send, entries } = await openRoom(1, { solo: "stoper", from: "hack" });
    send(0, "begin");
    send(0, "move", { type: "result", deviation: 100 });
    send(0, "rematch");
    expect(entries()[0]).toMatchObject({ kind: "solo", source: "list", started: true, players: [{ place: 1, won: false }] });
    send(0, "begin");
    send(0, "move", { type: "result", deviation: 50 });
    expect(entries()[1]).toMatchObject({ source: "rematch" });
  });

  test("błąd zapisu historii nie psuje końca partii", async () => {
    const { send, snapshot } = await gomoku();
    vi.spyOn(stats, "recordMatch").mockImplementation(() => {
      throw new Error("pełny dysk");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    winGomoku(send);
    expect(snapshot().phase).toBe("over");
  });
});

describe("sygnały gier", () => {
  test("wybór gry i powrót bez startu: picked i dropped; wybór i start: tylko picked", async () => {
    const { send, signalled } = await openRoom(2);
    send(0, "pickGame", { gameId: "statki" });
    send(0, "pickGame", { gameId: null });
    send(0, "pickGame", { gameId: "piec-w-rzedzie" });
    send(1, "ready", { ready: true });
    send(0, "start");
    expect(signalled()).toEqual(["statki:picked", "statki:dropped", "piec-w-rzedzie:picked"]);
  });

  test("zmiana gry na inną też porzuca poprzednią", async () => {
    const { send, signalled } = await openRoom(2);
    send(0, "pickGame", { gameId: "statki" });
    send(0, "pickGame", { gameId: "memory" });
    expect(signalled()).toEqual(["statki:picked", "statki:dropped", "memory:picked"]);
  });

  test("głosowanie: każda pokazana opcja i zwycięzca", async () => {
    const { send, snapshot, signalled } = await stoper(2);
    send(0, "move", { type: "result", deviation: 100 });
    send(1, "move", { type: "result", deviation: 200 });
    send(0, "otherGame");
    const { options } = snapshot().vote!;
    send(0, "vote", { id: options[1] });
    send(1, "vote", { id: options[1] });
    expect(signalled().filter((s) => !s.endsWith(":picked"))).toEqual([...options.map((id) => `${id}:voteShown`), `${options[1]}:voteWon`]);
  });

  test("Jak grać: raz na osobę i grę, w Setup albo w partii; mini-gra i nieznana gra się nie liczą", async () => {
    const { send, signalled } = await openRoom(2);
    send(0, "pickGame", { gameId: "statki" });
    send(0, "howTo", { gameId: "statki" });
    send(0, "howTo", { gameId: "statki" });
    send(1, "howTo", { gameId: "statki" });
    send(1, "howTo", { gameId: "stoper" });
    send(1, "howTo", { gameId: "nie-ma" });
    expect(signalled().filter((s) => s.endsWith("howTo"))).toEqual(["statki:howTo", "statki:howTo"]);
  });
});

// 19-05: pierwsza rozpoczęta próba z kafla wyzwania ma wspólny układ dnia, kolejne to trening z losowym układem.
describe("wspólny układ wyzwania dnia", () => {
  const today = () => dailyGame(dailyDay().day, MINI_GAME_IDS);
  const stateOf = (room: InstanceType<typeof LobbyRoom>) => (room as unknown as { match: { state: unknown; daily?: boolean } }).match;
  const dailyState = (gameId: string) => GAMES[gameId].setup(["p1"], createRng(dailySeed(dailyDay().day, gameId)));

  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 10, 19, 12));
  });

  /** Próba z kafla wyzwania: start po instrukcji i wyjście (porzucona po starcie). */
  async function attempt(nick: string, from = "daily", gameId = today()) {
    const ctx = await openRoom(1, { solo: gameId, from, nick });
    const match = stateOf(ctx.room);
    return { ...ctx, match };
  }

  test("pierwsze próby dwóch osób mają ten sam układ dnia", async () => {
    const a = await attempt("ala-19");
    const b = await attempt("bartek-19");
    expect(a.match.state).toEqual(dailyState(today()));
    expect(b.match.state).toEqual(a.match.state);
    expect(a.match.daily).toBe(true);
  });

  test("ziarno dnia różni się między dniami i grami", () => {
    const { day } = dailyDay();
    expect(dailySeed(day, "stoper")).not.toBe(dailySeed(day + 1, "stoper"));
    expect(dailySeed(day, "stoper")).not.toBe(dailySeed(day, "refleks"));
  });

  test("po rozpoczętej próbie kolejna tego dnia to trening z losowym układem", async () => {
    const first = await attempt("celina-19");
    first.send(0, "begin");
    await first.room.onLeave(first.clients[0], CloseCode.CONSENTED);
    expect(first.entries().at(-1)).toMatchObject({ source: "daily", started: true, daily: true });

    const second = await attempt("celina-19");
    expect(second.match.daily).toBe(false);
    expect(second.match.state).not.toEqual(dailyState(today()));
  });

  test("wyjście z instrukcji nie zużywa dnia", async () => {
    const first = await attempt("darek-19");
    await first.room.onLeave(first.clients[0], CloseCode.CONSENTED);
    const second = await attempt("darek-19");
    expect(second.match.daily).toBe(true);
  });

  test("„Jeszcze raz”, lista i inna gra to nie wyzwanie", async () => {
    // Dzień, w którym wyzwaniem jest Stoper: jego wynik kończy partię jednym ruchem, więc „Jeszcze raz” jest możliwe.
    let at = new Date(2026, 10, 19, 12).getTime();
    while (dailyGame(dailyDay(at).day, MINI_GAME_IDS) !== "stoper") at += 86_400_000;
    vi.setSystemTime(at);
    const tile = await attempt("ewa-19");
    expect(tile.match.daily).toBe(true);
    tile.send(0, "begin");
    tile.send(0, "move", { type: "result", deviation: 100 });
    tile.send(0, "rematch");
    expect(stateOf(tile.room).daily).toBe(false);
    expect(tile.entries().at(-1)).toMatchObject({ source: "daily", daily: true, started: true });

    expect((await attempt("franek-19", "list")).match.daily).toBe(false);
    const other = MINI_GAME_IDS.find((id) => id !== today())!;
    expect((await attempt("gosia-19", "daily", other)).match.daily).toBe(false);
  });
});

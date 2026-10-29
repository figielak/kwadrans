import { type Client } from "@colyseus/core";
import { GAMES, KALAMBURY_HALF_SECONDS, type KalamburyView, type RoomView } from "@kwadrans/games";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Testy przed poprawką P4-027: prawdziwe handlery pokoju i walidator gry,
// zegar sterowany bez czekania 80 s; baza wyłącznie w pamięci.
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

async function drawing(n: number, gameId = "kalambury") {
  const room = new LobbyRoom();
  rooms.push(room);
  const handlers = new Map<string, (client: Client, raw: unknown) => void>();
  vi.spyOn(room, "onMessage").mockImplementation((type, handler) => {
    handlers.set(String(type), handler as unknown as (client: Client, raw: unknown) => void);
  });
  // Podmieniamy jedynie upływ czasu; start i odnawianie limitów wykonuje LobbyRoom.
  vi.spyOn(room.clock, "setTimeout").mockImplementation((callback, ms, ...args) => {
    const timer = setTimeout(callback, ms, ...args);
    return { clear: () => clearTimeout(timer) } as ReturnType<typeof room.clock.setTimeout>;
  });
  await room.onCreate();
  const observer = n < room.maxClients ? n : undefined;
  const clients = Array.from({ length: n + Number(observer !== undefined) }, (_, i) => ({ sessionId: `p${i + 1}`, send: vi.fn() } as unknown as Client));
  for (const client of clients) {
    room.clients.push(client);
    room.onJoin(client, {}, { nick: client.sessionId });
  }
  const send = (player: number, type: string, raw: unknown) => handlers.get(type)!(clients[player], raw);
  const snapshot = (player = 0): RoomView => {
    const calls = vi.mocked(clients[player].send).mock.calls;
    const latest = calls.filter(([type]) => type === "room").at(-1)!;
    return latest[1] as RoomView;
  };
  send(0, "pickGame", { gameId });
  // Przy dwóch graczach jest jeszcze miejsce na obserwatora; sześciu zapełnia pokój.
  if (observer !== undefined) send(0, "toggleSeat", { id: clients[observer].sessionId });
  for (let i = 1; i < n; i++) send(i, "ready", { ready: true });
  send(0, "start", {});
  if (gameId === "kalambury") send(0, "move", { type: "choose", index: 0 });
  else for (let i = 0; i < n; i++) send(i, "begin", {});
  expect(snapshot().phase).toBe("playing");
  if (gameId === "kalambury") expect((snapshot().game!.view as KalamburyView).phase).toBe("draw");
  return { send, snapshot, clients, observer };
}

describe.each([2, 6])("Kalambury: %i graczy", (n) => {
  test("rysujący, zgadujący i obserwator nie przyspieszają podpowiedzi, także fałszując source", async () => {
    const { send, snapshot, observer } = await drawing(n);
    const before = snapshot();
    for (const player of observer === undefined ? [0, 1] : [0, 1, observer]) {
      send(player, "move", { type: "hint", source: "timeout", context: { source: "timeout" } });
      expect(snapshot().game!.view).toEqual(before.game!.view);
      expect(snapshot().game!.msLeft).toBe(before.game!.msLeft);
    }
  });

  test("timeout przechodzi walidację, odsłania jedną literę i daje pełną drugą połowę", async () => {
    const validate = vi.spyOn(GAMES.kalambury, "validateMove");
    const { snapshot, clients, observer } = await drawing(n);
    validate.mockClear();
    vi.advanceTimersByTime(KALAMBURY_HALF_SECONDS * 1000 - 1);
    expect((snapshot().game!.view as KalamburyView).half).toBe(0);
    vi.advanceTimersByTime(1);
    const second = snapshot().game!;
    const state = second.view as KalamburyView;
    expect(state.half).toBe(1);
    expect(state.revealed).toHaveLength(1);
    expect(second.msLeft).toBe(KALAMBURY_HALF_SECONDS * 1000);
    expect((snapshot(1).game!.view as KalamburyView).word).toBe("");
    if (observer !== undefined) expect((snapshot(observer).game!.view as KalamburyView).hint).toBe((snapshot(1).game!.view as KalamburyView).hint);
    vi.advanceTimersByTime(KALAMBURY_HALF_SECONDS * 1000 - 1);
    expect((snapshot().game!.view as KalamburyView).phase).toBe("draw");
    vi.advanceTimersByTime(1);
    const reveal = snapshot().game!.view as KalamburyView;
    expect(reveal.phase).toBe("reveal");
    expect(reveal.revealed).toEqual(state.revealed);
    expect(reveal.passed).toEqual(clients.slice(1, n).map((client) => client.sessionId));
    expect(validate).toHaveBeenCalledWith(expect.anything(), clients[0].sessionId, { type: "hint" }, { source: "timeout" });
  });

  test("źródło zwykłego ruchu pochodzi z handlera klienta", async () => {
    const { send, snapshot, clients } = await drawing(n);
    const validate = vi.spyOn(GAMES.kalambury, "validateMove");
    send(1, "move", { type: "guess", text: "zzz", source: "timeout" });
    expect(validate).toHaveBeenCalledWith(expect.anything(), clients[1].sessionId, { type: "guess", text: "zzz" }, { source: "client" });
    expect((snapshot().game!.view as KalamburyView).chat).toEqual([{ player: clients[1].sessionId, text: "zzz" }]);
  });
});

// P4-002: rzeczywiste handlery, timeout i finish; rekordy w bazie pamięciowej.
describe.each(["schulte", "sudoku"])("%s: ukończenie i zapis rekordów", (gameId) => {
  const complete = () => gameId === "schulte"
    ? { type: "result", ms: 170_000, mistakes: 4, splits: Array(25).fill(6800) }
    : { type: "result", ms: 60_000, mistakes: 13 };

  test.each([2, 6])("%i graczy: timeout za ukończonymi i bez rekordu", async (n) => {
    const { send, snapshot, clients } = await drawing(n, gameId);
    const validate = vi.spyOn(GAMES[gameId], "validateMove");
    const record = vi.spyOn(stats, "recordScores");
    for (let i = 1; i < n; i++) send(i, "move", complete());
    vi.advanceTimersByTime(GAMES[gameId].turnSeconds! * 1000);
    const end = snapshot();
    expect(end.phase).toBe("over");
    expect(end.game!.result?.ranking).toEqual([...clients.slice(1, n), clients[0]].map((c) => c.sessionId));
    expect(end.game!.result?.winner).toBe(n === 2 ? clients[1].sessionId : undefined);
    const state = end.game!.view as { results: Record<string, { completed?: boolean }> };
    expect(state.results[clients[0].sessionId]).toMatchObject({ completed: false });
    expect(validate).toHaveBeenCalledWith(expect.anything(), clients[0].sessionId, expect.objectContaining({ completed: false }), { source: "timeout" });
    expect(record).toHaveBeenCalledTimes(1);
    const rows = record.mock.calls[0][1];
    expect(rows.map((row) => row.nick)).toEqual(clients.slice(1, n).map((c) => c.sessionId));
    for (const row of rows) {
      expect(Number.isFinite(row.score)).toBe(true);
      expect(row.detail).toMatchObject({ players: ["1"], results: { "1": { completed: true } } });
    }
  });

  test("wszyscy po limicie: remis i żadnego nowego rekordu", async () => {
    const { snapshot } = await drawing(2, gameId);
    const record = vi.spyOn(stats, "recordScores");
    vi.advanceTimersByTime(GAMES[gameId].turnSeconds! * 1000);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result?.winner).toBeUndefined();
    expect(record).toHaveBeenCalledWith(gameId, [], GAMES[gameId].record);
  });

  test("JSON klienta ani obserwatora nie daje uprawnienia timeoutu", async () => {
    const { send, snapshot, clients, observer } = await drawing(2, gameId);
    const before = snapshot().game!.view;
    const move = { ...complete(), completed: false, source: "timeout", context: { source: "timeout" } };
    const validate = vi.spyOn(GAMES[gameId], "validateMove");
    for (const player of [0, 1, observer!]) {
      send(player, "move", move);
      expect(snapshot().game!.view).toEqual(before);
    }
    expect(validate).toHaveBeenCalledWith(expect.anything(), clients[0].sessionId, expect.objectContaining({ completed: false }), { source: "client" });
  });
});

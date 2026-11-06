import { type AuthContext, type Client, CloseCode } from "@colyseus/core";
import { GAMES, KALAMBURY_HALF_SECONDS, type KalamburyView, type RoomView, type ZakupyView } from "@kwadrans/games";
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

async function openRoom(n: number, options?: { solo?: string }, ip?: string) {
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
  await room.onCreate(options);
  const observer = n < room.maxClients ? n : undefined;
  const clients = Array.from({ length: n + Number(observer !== undefined) }, (_, i) => ({ sessionId: `p${i + 1}`, send: vi.fn() } as unknown as Client));
  for (const client of clients) {
    room.clients.push(client);
    const auth = ip ? room.onAuth(client, { nick: client.sessionId }, { ip, headers: new Headers() } as AuthContext) : { nick: client.sessionId };
    room.onJoin(client, {}, auth);
  }
  const send = (player: number, type: string, raw: unknown) => {
    expect(handlers.has(type), `pokój obsługuje wiadomość ${type}`).toBe(true);
    handlers.get(type)!(clients[player], raw);
  };
  const snapshot = (player = 0): RoomView => {
    const calls = vi.mocked(clients[player].send).mock.calls;
    const latest = calls.filter(([type]) => type === "room").at(-1)!;
    return latest[1] as RoomView;
  };
  return { room, send, snapshot, clients, observer };
}

async function drawing(n: number, gameId = "kalambury", start = true) {
  const { room, send, snapshot, clients, observer } = await openRoom(n);
  send(0, "pickGame", { gameId });
  // Przy dwóch graczach jest jeszcze miejsce na obserwatora; sześciu zapełnia pokój.
  if (observer !== undefined) send(0, "toggleSeat", { id: clients[observer].sessionId });
  for (let i = 1; i < n; i++) send(i, "ready", { ready: true });
  send(0, "start", {});
  if (gameId === "kalambury") send(0, "move", { type: "choose", index: 0 });
  else if (start) {
    for (let i = 0; i < n; i++) send(i, "begin", {});
    if (n > 1 && GAMES[gameId].minPlayers === 1) vi.advanceTimersByTime(3000);
  }
  expect(snapshot().phase).toBe("playing");
  if (gameId === "kalambury") expect((snapshot().game!.view as KalamburyView).phase).toBe("draw");
  return { room, send, snapshot, clients, observer };
}

describe("07-18: Szybka seria", () => {
  test("gospodarz odpala turniej 5 gier z miejscami dla wszystkich, bez gotowości gości", async () => {
    const { send, snapshot } = await openRoom(3);
    send(0, "quickSeries", {});
    const view = snapshot();
    expect(view.phase).toBe("playing");
    expect(view.tournament!.games).toHaveLength(5);
    expect(view.tournament!.config.length).toBe(5);
    // openRoom(3) dodaje jeszcze czwartego uczestnika; w Szybkiej serii siadają wszyscy.
    expect(view.seats).toEqual(["p1", "p2", "p3", "p4"]);
  });

  test("przy sześciu graczach też siadają wszyscy", async () => {
    const { send, snapshot } = await openRoom(6);
    send(0, "quickSeries", {});
    expect(snapshot().phase).toBe("playing");
    expect(snapshot().seats).toHaveLength(6);
  });

  test("od gościa albo poza lobby nic nie robi", async () => {
    const { send, snapshot } = await openRoom(2);
    send(1, "quickSeries", {});
    expect(snapshot().phase).toBe("lobby");
    expect(snapshot().tournament).toBeNull();
    send(0, "quickSeries", {});
    expect(snapshot().phase).toBe("playing");
    const games = snapshot().tournament!.games;
    send(0, "quickSeries", {});
    expect(snapshot().tournament!.games).toEqual(games);
  });
});

describe("07-17: pamięć wieczoru", () => {
  const finishStoper = (send: Awaited<ReturnType<typeof drawing>>["send"]) => {
    send(0, "move", { type: "result", deviation: 100 });
    send(1, "move", { type: "result", deviation: 200 });
  };
  const rematch = (send: Awaited<ReturnType<typeof drawing>>["send"]) => {
    vi.advanceTimersByTime(1000);
    for (const i of [0, 1]) send(i, "rematch", {});
    for (const i of [0, 1]) send(i, "begin", {});
    vi.advanceTimersByTime(3000);
  };

  test("ukończona partia dopisuje tabelę, obserwator widzi to samo, scores zostają", async () => {
    const { send, snapshot, observer } = await drawing(2, "stoper");
    expect(snapshot()).toHaveProperty("evening", { games: 0, played: [], table: [], titles: [] });
    finishStoper(send);
    expect(snapshot()).toHaveProperty("evening", {
      games: 1, played: ["stoper"], titles: [], table: [
        { key: "p1", nick: "p1", points: 1, wins: 1 }, { key: "p2", nick: "p2", points: 0, wins: 0 },
      ],
    });
    expect(snapshot(observer).evening).toEqual(snapshot().evening);
    expect(snapshot().scores).toEqual({ p1: 1 });
    send(0, "toLobby", {});
    expect(snapshot().evening.games).toBe(1);
  });

  test("remis daje równe punkty, bez samodzielnego zwycięstwa", async () => {
    const { send, snapshot } = await drawing(3, "schulte");
    for (const [i, ms] of [[0, 10_000], [1, 10_000], [2, 20_000]]) send(i, "move", { type: "result", ms, mistakes: 0, splits: [] });
    expect(snapshot()).toHaveProperty("evening.table", [
      { key: "p1", nick: "p1", points: 1, wins: 0 }, { key: "p2", nick: "p2", points: 1, wins: 0 }, { key: "p3", nick: "p3", points: 0, wins: 0 },
    ]);
  });

  test.each([false, true])("jeden grający, solo=%s: bez wpisu", async (solo) => {
    const { send, snapshot } = solo ? await openRoom(1, { solo: "stoper" }) : await drawing(1, "stoper");
    if (solo) send(0, "begin", {});
    send(0, "move", { type: "result", deviation: 100 });
    expect(snapshot().phase).toBe("over");
    expect(snapshot()).toHaveProperty("evening", { games: 0, played: [], table: [], titles: [] });
  });

  test.each([2, 3])("wyjście podczas gry przy %i grających nie dopisuje walkoweru ani przerwania", async (n) => {
    const { room, clients, snapshot } = await drawing(n, "stoper");
    await room.onLeave(clients[n - 1], CloseCode.CONSENTED);
    expect(snapshot().phase).toBe("over");
    expect(snapshot()).toHaveProperty("evening.games", 0);
  });

  test("wyjście po grze zostawia wiersz, powrót po nickKey zmienia pisownię i zachowuje punkty", async () => {
    const { room, clients, send, snapshot } = await drawing(2, "stoper");
    finishStoper(send);
    rematch(send);
    finishStoper(send);
    send(0, "toLobby", {});
    await room.onLeave(clients[0], CloseCode.CONSENTED);
    expect(snapshot(1).evening.table[0]).toEqual({ key: "p1", nick: "p1", points: 2, wins: 2 });
    const returned = { sessionId: "returned", send: vi.fn() } as unknown as Client;
    room.clients.push(returned);
    clients.push(returned);
    room.onJoin(returned, {}, { nick: "P1" });
    expect(snapshot(1).evening.table[0]).toEqual({ key: "p1", nick: "P1", points: 2, wins: 2 });
    expect(snapshot(1).evening.titles.every((t) => t.nick === "P1")).toBe(true);
    // Rezerwację po powrocie dostaje nowe id sesji, punkty pozostają pod nickiem.
    send(clients.length - 1, "ready", { ready: true });
    send(1, "start", {});
    vi.advanceTimersByTime(2 * 60_000);
    expect(snapshot(1).evening.games).toBe(3);
    expect(snapshot(1).evening.table.filter((r) => r.key === "p1")).toHaveLength(1);
    expect(snapshot(1).evening.table.find((r) => r.key === "p1")!.points).toBeGreaterThanOrEqual(2);
  });

  test("Gomoku z samym zwycięzcą także daje punkty", async () => {
    const { send, snapshot } = await drawing(2, "piec-w-rzedzie");
    for (let x = 0; x < 5; x++) {
      send(0, "move", { x, y: 0 });
      if (x < 4) send(1, "move", { x, y: 1 });
    }
    expect(snapshot()).toHaveProperty("evening.table", [
      { key: "p1", nick: "p1", points: 1, wins: 1 }, { key: "p2", nick: "p2", points: 0, wins: 0 },
    ]);
  });

  test("turniej dopisuje każdą grę, bez dodatkowego wpisu za cały turniej", async () => {
    const { send, snapshot } = await openRoom(2);
    send(0, "pickTournament", { length: 3 });
    send(0, "toggleSeat", { id: "p3" });
    send(1, "ready", { ready: true });
    send(0, "start", {});
    vi.advanceTimersByTime(30 * 60_000);
    const tournament = snapshot().tournament!;
    expect(snapshot()).toHaveProperty("evening.games", tournament.games.length);
    expect(snapshot().evening.played).toEqual([...new Set(tournament.games)]);
  });

  test("po 100 partiach room niesie stałą liczbę wpisów, bez historii, a podsumowanie liczone jest raz na partię", async () => {
    const { send, snapshot } = await drawing(2, "stoper");
    finishStoper(send);
    rematch(send);
    finishStoper(send);
    const before = structuredClone(snapshot().evening);
    const beforeSize = JSON.stringify(snapshot()).length;
    // Wiadomość bez nowej partii korzysta z gotowego podsumowania.
    const summary = snapshot().evening;
    send(0, "rematch", {});
    expect(snapshot().evening).toBe(summary);
    for (let game = 2; game < 100; game++) {
      rematch(send);
      finishStoper(send);
    }
    const after = snapshot().evening;
    expect(after.games).toBe(100);
    expect(after.played).toEqual(["stoper"]);
    expect(after.table).toHaveLength(before.table.length);
    expect(after.titles).toHaveLength(before.titles.length);
    expect(Object.keys(after).sort()).toEqual(["games", "played", "table", "titles"]);
    // Zmieniają się jedynie cyfry liczników, nie liczba wierszy ani historia.
    expect(JSON.stringify(snapshot()).length - beforeSize).toBeLessThan(100);
  });
});

describe("07-15: reakcje", () => {
  beforeEach(() => vi.setSystemTime(new Date("2026-11-06T12:00:00Z")));
  const clearMessages = (clients: Client[]) => clients.forEach((client) => vi.mocked(client.send).mockClear());

  test("reakcja idzie do wszystkich, także nadawcy, bez wysyłki room", async () => {
    const { send, clients } = await drawing(2, "stroop");
    clearMessages(clients);
    send(0, "react", { index: 3, id: "p2" });
    for (const client of clients) expect(client.send).toHaveBeenCalledExactlyOnceWith("react", { id: "p1", index: 3 });
  });

  test("obserwator może reagować", async () => {
    const { send, clients, observer } = await drawing(2, "stroop");
    clearMessages(clients);
    send(observer!, "react", { index: 0 });
    expect(clients[0].send).toHaveBeenCalledExactlyOnceWith("react", { id: clients[observer!].sessionId, index: 0 });
  });

  test("limit 1/s od osoby nie blokuje ruchów ani innych osób", async () => {
    const { send, snapshot, clients } = await drawing(2, "stroop");
    clearMessages(clients);
    for (let i = 0; i < 20; i++) send(0, "react", { index: 1 });
    expect(clients[1].send).toHaveBeenCalledTimes(1);
    send(1, "react", { index: 2 });
    expect(clients[0].send).toHaveBeenCalledTimes(2);
    send(0, "move", { type: "result", times: [500], errors: 0 });
    expect(snapshot().game).toMatchObject({ view: { results: { p1: { times: [500], errors: 0 } } } });
    vi.advanceTimersByTime(1000);
    clearMessages(clients);
    send(0, "react", { index: 1 });
    expect(clients[1].send).toHaveBeenCalledTimes(1);
  });

  test.each([{ index: -1 }, { index: 6 }, { index: 1.5 }, { index: "1" }, {}, null])("zły kształt %j odpada i nie zużywa limitu", async (raw) => {
    const { send, clients } = await drawing(2, "stroop");
    clearMessages(clients);
    send(0, "react", raw);
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "react", { index: 5 });
    expect(clients[1].send).toHaveBeenCalledExactlyOnceWith("react", { id: "p1", index: 5 });
  });

  test("po partii działa, w lobby i w pokoju solo nie ma komu", async () => {
    const { send, clients } = await drawing(2, "stroop");
    vi.advanceTimersByTime(GAMES.stroop.turnSeconds! * 1000);
    clearMessages(clients);
    send(0, "react", { index: 1 });
    expect(clients[1].send).toHaveBeenCalledExactlyOnceWith("react", { id: "p1", index: 1 });
    send(0, "toLobby", {});
    vi.advanceTimersByTime(1000);
    clearMessages(clients);
    send(0, "react", { index: 1 });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();

    const solo = await openRoom(1, { solo: "stroop" });
    solo.clients.slice(1).forEach((client) => solo.room.clients.splice(solo.room.clients.indexOf(client), 1));
    clearMessages(solo.clients);
    solo.send(0, "react", { index: 1 });
    expect(solo.clients[0].send).not.toHaveBeenCalled();
  });
});

describe("07-11: dekoracyjny kanał live", () => {
  beforeEach(() => vi.setSystemTime(new Date("2026-11-06T12:00:00Z")));
  const clearMessages = (clients: Client[]) => clients.forEach((client) => vi.mocked(client.send).mockClear());

  test.each([2, 6])("%i grających: tylko pozostali dostają live, bez room i bez walidatora gry", async (n) => {
    const { send, snapshot, clients } = await drawing(n, "stroop");
    const before = structuredClone(snapshot().game);
    const validate = vi.spyOn(GAMES.stroop, "validateMove");
    clearMessages(clients);
    send(0, "live", { value: 7, id: "p2", source: "timeout" });
    expect(clients[0].send).not.toHaveBeenCalled();
    for (const client of clients.slice(1)) expect(client.send).toHaveBeenCalledExactlyOnceWith("live", { id: "p1", value: 7 });
    expect(validate).not.toHaveBeenCalled();
    // Zwykła wiadomość odświeża RoomView; live sam nie rozsyła pełnego pokoju.
    send(0, "begin", {});
    expect(snapshot().game).toEqual({ ...before, live: { p1: 7 } });
  });

  test("obserwator nie nadaje, ale otrzymuje wartości grających", async () => {
    const { send, snapshot, clients, observer } = await drawing(2, "stroop");
    clearMessages(clients);
    send(observer!, "live", { value: 99 });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "live", { value: 3 });
    expect(clients[observer!].send).toHaveBeenCalledExactlyOnceWith("live", { id: "p1", value: 3 });
    send(0, "begin", {});
    expect(snapshot().game).toHaveProperty("live", { p1: 3 });
  });

  test.each(["lobby", "intro", "countdown", "over"])("live ignorowane w fazie %s", async (phase) => {
    const { send, snapshot, clients } = await drawing(2, "stroop", false);
    if (phase !== "intro") for (const player of [0, 1]) send(player, "begin", {});
    if (phase === "over" || phase === "lobby") {
      vi.advanceTimersByTime(3000 + GAMES.stroop.turnSeconds! * 1000);
      if (phase === "lobby") send(0, "toLobby", {});
    }
    clearMessages(clients);
    send(0, "live", { value: 9 });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "begin", {});
    if (snapshot().game) expect(snapshot().game).toHaveProperty("live", {});
  });

  test.each([false, true])("jeden grający nie nadaje, solo=%s", async (solo) => {
    const { send, snapshot, clients } = solo ? await openRoom(1, { solo: "stroop" }) : await drawing(1, "stroop", false);
    send(0, "begin", {});
    clearMessages(clients);
    send(0, "live", { value: 9 });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "begin", {});
    expect(snapshot().game).toHaveProperty("live", {});
  });

  test.each(["refleks", "stoj", "stoper", "przytrzymaj", "zaslona", "rytm", "piec-w-rzedzie"])("%s: gra bez live ignoruje kanał", async (id) => {
    const { send, snapshot, clients } = await drawing(2, id);
    clearMessages(clients);
    send(0, "live", { value: 9 });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "begin", {});
    expect(snapshot().game).toHaveProperty("live", {});
  });

  test.each([-1, 1.5, "7", 10_000, NaN, Infinity, null, undefined])("niepoprawna wartość %s jest odrzucana", async (value) => {
    const { send, snapshot, clients } = await drawing(2, "stroop");
    clearMessages(clients);
    send(0, "live", { value });
    for (const client of clients) expect(client.send).not.toHaveBeenCalled();
    send(0, "begin", {});
    expect(snapshot().game).toHaveProperty("live", {});
  });

  test("dwa live na sekundę od każdej osoby, nadmiar nie blokuje move ani nie odnawia limitu", async () => {
    const { send, snapshot, clients } = await drawing(2, "stroop");
    vi.advanceTimersByTime(20_000);
    clearMessages(clients);
    for (let value = 0; value < 20; value++) send(0, "live", { value });
    expect(clients[1].send).toHaveBeenCalledTimes(2);
    expect(clients[1].send).toHaveBeenNthCalledWith(1, "live", { id: "p1", value: 0 });
    expect(clients[1].send).toHaveBeenNthCalledWith(2, "live", { id: "p1", value: 1 });
    send(1, "live", { value: 10 });
    send(1, "live", { value: 11 });
    expect(clients[0].send).toHaveBeenCalledTimes(2);
    send(0, "move", { type: "result", times: [500], errors: 0 });
    expect(snapshot().game).toMatchObject({ msLeft: 70_000, live: { p1: 1, p2: 11 }, view: { results: { p1: { times: [500], errors: 0 } } } });
    vi.advanceTimersByTime(1000);
    clearMessages(clients);
    send(0, "live", { value: 9999 });
    expect(clients[1].send).toHaveBeenCalledExactlyOnceWith("live", { id: "p1", value: 9999 });
    vi.advanceTimersByTime(69_000);
    expect(snapshot().phase).toBe("over");
  });

  test("zwykłe wiadomości nie zużywają osobnego limitu live", async () => {
    const { send, clients } = await drawing(2, "stroop");
    vi.advanceTimersByTime(1000);
    for (let i = 0; i < 10; i++) send(0, "begin", {});
    clearMessages(clients);
    send(0, "live", { value: 3 });
    send(0, "live", { value: 4 });
    expect(clients[1].send).toHaveBeenCalledTimes(2);
  });

  test("reconnect pokazuje ostatnie wartości wszystkim, bez zmiany stanu gry", async () => {
    const { room, send, snapshot, clients } = await drawing(2, "stroop");
    const before = structuredClone(snapshot().game!.view);
    send(0, "live", { value: 3 });
    send(1, "live", { value: 4 });
    vi.spyOn(room, "allowReconnection").mockResolvedValue(clients[1]);
    await room.onLeave(clients[1], 1006);
    for (const player of clients.keys()) {
      expect(snapshot(player).game).toMatchObject({ live: { p1: 3, p2: 4 }, view: before });
    }
  });

  test("dowolne live nie zmienia wyniku, miejsc ani zapisanych rekordów", async () => {
    const { send, snapshot } = await drawing(2, "stroop");
    const record = vi.spyOn(stats, "recordScores");
    send(0, "live", { value: 0 });
    send(1, "live", { value: 9999 });
    expect(record).not.toHaveBeenCalled();
    send(0, "move", { type: "result", times: [500, 500], errors: 0 });
    send(1, "move", { type: "result", times: [500], errors: 0 });
    expect(snapshot().game).toMatchObject({ result: { winner: "p1", ranking: ["p1", "p2"] }, places: { p1: 1, p2: 2 } });
    expect(record).toHaveBeenCalledTimes(1);
    expect(record.mock.calls[0][1].map(({ nick, score, tie }) => ({ nick, score, tie }))).toEqual([
      { nick: "p1", score: 2, tie: 500 }, { nick: "p2", score: 1, tie: 500 },
    ]);
  });

  test("rewanż czyści wartości, a kolejna partia zbiera je od nowa", async () => {
    const { send, snapshot } = await drawing(2, "stroop");
    send(0, "live", { value: 7 });
    for (const player of [0, 1]) send(player, "move", { type: "result", times: [500], errors: 0 });
    for (const player of [0, 1]) send(player, "rematch", {});
    expect(snapshot().game).toHaveProperty("live", {});
    for (const player of [0, 1]) send(player, "begin", {});
    vi.advanceTimersByTime(3000);
    send(1, "live", { value: 2 });
    send(0, "begin", {});
    expect(snapshot().game).toHaveProperty("live", { p2: 2 });
  });
});

describe("07-09: wspólny start mini-gry", () => {
  test.each([2, 6])("%i graczy: komplet gotowości daje 3 s, a potem pełny limit", async (n) => {
    const { send, snapshot, clients, observer } = await drawing(n, "stoper", false);
    for (let i = 0; i < n - 1; i++) send(i, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: true, countdown: false, msLeft: 15_000 });
    if (observer !== undefined) {
      send(observer, "begin", {});
      expect(snapshot().game!.began).not.toContain(clients[observer].sessionId);
    }
    send(n - 1, "begin", {});
    for (const player of clients.keys()) {
      expect(snapshot(player).game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    }
    vi.advanceTimersByTime(2000);
    const timer = rooms.at(-1)!.clock.setTimeout;
    const calls = vi.mocked(timer).mock.calls.length;
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ countdown: true, msLeft: 1000 });
    // Każda wiadomość odnawia bezczynność pokoju, ale nie odliczanie ani limit gry.
    expect(vi.mocked(timer).mock.calls.slice(calls).map(([, ms]) => ms)).toEqual([3_600_000]);
    vi.advanceTimersByTime(999);
    expect(snapshot().game!.intro).toBe(true);
    vi.advanceTimersByTime(1);
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: 60_000 });
    vi.advanceTimersByTime(59_999);
    expect(snapshot().phase).toBe("playing");
    vi.advanceTimersByTime(1);
    expect(snapshot().phase).toBe("over");
  });

  test.each([false, true])("wyniki i progress są odrzucane przed sygnałem, countdown=%s", async (countdown) => {
    const { send, snapshot, observer } = await drawing(2, "simon", false);
    if (countdown) for (const player of [0, 1]) send(player, "begin", {});
    const before = snapshot().game;
    const validate = vi.spyOn(GAMES.simon, "validateMove");
    for (const player of [0, 1, observer!]) {
      send(player, "move", { type: "progress", score: 7 });
      send(player, "move", { type: "result", score: 7 });
    }
    expect(snapshot().game).toEqual(before);
    expect(validate).not.toHaveBeenCalled();
    for (const player of [0, 1]) send(player, "begin", {});
    vi.advanceTimersByTime(3000);
    send(0, "move", { type: "progress", score: 7 });
    expect(snapshot().game!.view).toMatchObject({ progress: { p1: 7 } });
  });

  test("reconnect podczas odliczania zachowuje pozostały czas", async () => {
    const { room, clients, send, snapshot } = await drawing(2, "stoper", false);
    for (const player of [0, 1]) send(player, "begin", {});
    vi.advanceTimersByTime(1200);
    vi.spyOn(room, "allowReconnection").mockResolvedValue(clients[1]);
    await room.onLeave(clients[1], 1006);
    for (const player of [0, 1, 2]) {
      expect(snapshot(player).game).toMatchObject({ intro: true, countdown: true, msLeft: 1800, began: ["p1", "p2"] });
    }
    vi.advanceTimersByTime(1800);
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: 60_000 });
  });

  test.each([2, 3])("wyjście w odliczaniu (%i grających) gasi timer i stary callback", async (n) => {
    const { room, send, snapshot, clients } = await drawing(n, "stoper", false);
    for (let i = 0; i < n; i++) send(i, "begin", {});
    const callback = vi.mocked(room.clock.setTimeout).mock.calls.find(([, ms]) => ms === 3000)![0];
    const timeout = vi.spyOn(GAMES.stoper, "timeoutMove");
    await room.onLeave(clients[n - 1], CloseCode.CONSENTED);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: null, result: n === 2 ? { winner: "p1" } : {} });
    callback();
    vi.advanceTimersByTime(63_000);
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ countdown: false, msLeft: null });
    expect(timeout).not.toHaveBeenCalled();
    send(0, "toLobby", {});
    callback();
    send(0, "begin", {});
    expect(snapshot()).toMatchObject({ phase: "lobby", game: null });
  });

  test.each([false, true])("jeden grający startuje od razu, solo=%s", async (solo) => {
    const { send, snapshot } = solo ? await openRoom(1, { solo: "stoper" }) : await drawing(1, "stoper", false);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: false, msLeft: null });
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: 60_000 });
  });

  test("rewanż ma 5 s instrukcji i 3 s odliczania", async () => {
    const { send, snapshot } = await drawing(2, "stoper");
    for (const player of [0, 1]) send(player, "move", { type: "result", deviation: 100 });
    for (const player of [0, 1]) send(player, "rematch", {});
    expect(snapshot().game).toMatchObject({ intro: true, countdown: false, msLeft: 5000, began: [] });
    vi.advanceTimersByTime(4999);
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ countdown: false, msLeft: 1 });
    vi.advanceTimersByTime(1);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: 60_000 });
  });

  test.each([false, true])("kolejna gra turnieju ma 15 s instrukcji, automatycznie=%s", async (automatic) => {
    const { send, snapshot } = await openRoom(2);
    send(0, "pickTournament", { length: 3 });
    send(0, "toggleSeat", { id: "p3" });
    send(1, "ready", { ready: true });
    send(0, "start", {});
    expect(snapshot().game).toMatchObject({ intro: true, countdown: false, msLeft: 15_000 });
    for (const player of [0, 1]) send(player, "begin", {});
    vi.advanceTimersByTime(3000 + GAMES[snapshot().gameId!].turnSeconds! * 1000);
    expect(snapshot().phase).toBe("over");
    if (automatic) vi.advanceTimersByTime(snapshot().game!.msLeft!);
    else for (const player of [0, 1]) send(player, "rematch", {});
    expect(snapshot().tournament!.index).toBe(1);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: false, msLeft: 15_000, began: [] });
    vi.advanceTimersByTime(15_000);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: GAMES[snapshot().gameId!].turnSeconds! * 1000 });
  });
});

describe("07-03: instrukcja i rewanż jednej osoby", () => {
  test.each([false, true])("jedna osoba bez timera instrukcji, solo=%s", async (solo) => {
    const { room, snapshot } = solo ? await openRoom(1, { solo: "stoper" }) : await drawing(1, "stoper", false);
    expect(snapshot().game).toMatchObject({ intro: true, msLeft: null, skipIntro: false });
    expect(room.clock.setTimeout).not.toHaveBeenCalledWith(expect.any(Function), 15_000);
    const timeout = vi.spyOn(GAMES.stoper, "timeoutMove");
    vi.advanceTimersByTime(60_000);
    expect(timeout).not.toHaveBeenCalled();
    expect(snapshot().phase).toBe("playing");
    expect(snapshot().game!.intro).toBe(true);
  });

  test.each([2, 6])("%i grających: instrukcja nadal ma 15 sekund", async (n) => {
    const { snapshot } = await drawing(n, "stoper", false);
    expect(snapshot().game).toMatchObject({ intro: true, msLeft: 15_000, skipIntro: false });
    vi.advanceTimersByTime(15_000);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game).toMatchObject({ intro: false, countdown: false, msLeft: 60_000, skipIntro: false });
  });

  test("rewanż solo zachowuje zamiar przed begin i ma świeży, nieodnawialny limit", async () => {
    const { room, send, snapshot, clients } = await openRoom(1, { solo: "stoper" });
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: false, msLeft: 60_000, skipIntro: false });
    vi.advanceTimersByTime(50_000);
    send(0, "move", { type: "result", deviation: 100 });
    expect(snapshot().phase).toBe("over");
    send(0, "rematch", {});
    expect(snapshot().game).toMatchObject({ intro: true, msLeft: null, skipIntro: true });

    // Ponowne połączenie przed begin zachowuje pole pominięcia instrukcji.
    vi.spyOn(room, "allowReconnection").mockResolvedValue(clients[0]);
    await room.onLeave(clients[0], 1006);
    expect(snapshot().game).toMatchObject({ intro: true, skipIntro: true });
    vi.advanceTimersByTime(5000);
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: false, msLeft: 60_000, skipIntro: false });

    // Odświeżenie po begin nie wznawia auto-startu, kolejne begin nie odnawia czasu.
    vi.advanceTimersByTime(5000);
    await room.onLeave(clients[0], 1006);
    send(0, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: false, msLeft: 55_000, skipIntro: false });
    expect(snapshot().phase).toBe("playing");
    vi.advanceTimersByTime(54_999);
    expect(snapshot().phase).toBe("playing");
    vi.advanceTimersByTime(1);
    expect(snapshot().phase).toBe("over");
  });

  test.each([1, 2])("zwykły rewanż %i grających pokazuje instrukcję", async (n) => {
    const { send, snapshot } = await drawing(n, "stoper");
    for (let i = 0; i < n; i++) send(i, "move", { type: "result", deviation: 100 });
    for (let i = 0; i < n; i++) send(i, "rematch", {});
    expect(snapshot().phase).toBe("playing");
    expect(snapshot().game).toMatchObject({ intro: true, skipIntro: false, msLeft: n === 1 ? null : 5000 });
  });

  test("kolejna gra turnieju jednoosobowego czeka na Start, bez skipIntro", async () => {
    const { send, snapshot, clients } = await openRoom(1);
    send(0, "pickTournament", { length: 3 });
    send(0, "toggleSeat", { id: clients[1].sessionId });
    send(0, "start", {});
    expect(snapshot().game).toMatchObject({ intro: true, msLeft: null, skipIntro: false });
    send(0, "begin", {});
    const seconds = GAMES[snapshot().gameId!].turnSeconds!;
    vi.advanceTimersByTime(seconds * 1000);
    expect(snapshot().phase).toBe("over");
    send(0, "rematch", {});
    expect(snapshot().tournament!.index).toBe(1);
    expect(snapshot().game).toMatchObject({ intro: true, msLeft: null, skipIntro: false });
    vi.advanceTimersByTime(15_000);
    expect(snapshot().game!.intro).toBe(true);
  });

  test("instrukcja solo żyje przez 59:59, po godzinie pokój się zamyka", async () => {
    const { room, snapshot } = await openRoom(1, { solo: "stoper" });
    const disconnect = vi.spyOn(room, "disconnect").mockResolvedValue([]);
    const timeout = vi.spyOn(GAMES.stoper, "timeoutMove");
    vi.advanceTimersByTime(3_599_000);
    expect(disconnect).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    expect(snapshot().game!.intro).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  test.each([CloseCode.CONSENTED, 1006])("wyjście z instrukcji (%i) bez wyniku, dispose zwalnia limit solo na IP", async (code) => {
    const ip = `test-intro-${code}`;
    const { room, clients, snapshot } = await openRoom(1, { solo: "stoper" }, ip);
    for (let i = 1; i < 20; i++) await openRoom(1, { solo: "stoper" }, ip);
    const extra = new LobbyRoom();
    rooms.push(extra);
    await extra.onCreate({ solo: "stoper" });
    const auth = () => extra.onAuth(clients[0], { nick: "Nowy" }, { ip, headers: new Headers() } as AuthContext);
    expect(auth).toThrow("Masz już otwarte za dużo pokoi.");
    const record = vi.spyOn(stats, "record");
    const scores = vi.spyOn(stats, "recordScores");
    const entries = vi.spyOn(stats, "recordRoomGame");
    const reconnect = vi.spyOn(room, "allowReconnection").mockRejectedValue(new Error("nie wrócił"));
    await room.onLeave(clients[0], code);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result).toEqual({});
    expect(record).not.toHaveBeenCalled();
    expect(scores).not.toHaveBeenCalled();
    expect(entries).toHaveBeenCalledWith(expect.objectContaining({ players: 1, outcome: "aborted" }));
    if (code === CloseCode.CONSENTED) expect(reconnect).not.toHaveBeenCalled();
    else expect(reconnect).toHaveBeenCalledWith(clients[0], 600);
    room.onDispose();
    rooms.splice(rooms.indexOf(room), 1);
    room.clock.clear();
    room.clock.stop();
    expect(auth).not.toThrow();
  });
});

describe("07-02: miejsca po partii w widoku pokoju", () => {
  test("Schulte: remis 1, 1, 3 widzą gracze i obserwator", async () => {
    const { send, snapshot, observer } = await drawing(3, "schulte");
    for (const [player, ms] of [[0, 10_000], [1, 10_000], [2, 20_000]]) {
      send(player, "move", { type: "result", ms, mistakes: 0, splits: [] });
    }
    expect(snapshot().phase).toBe("over");
    for (const player of [0, 1, 2, observer!]) {
      expect(snapshot(player).game).toHaveProperty("places", { p1: 1, p2: 1, p3: 3 });
    }
  });

  test("Szybki Chińczyk: miejsca pochodzą z result.places", async () => {
    const setup = GAMES.chinczyk.setup;
    vi.spyOn(GAMES.chinczyk, "setup").mockImplementation((players, rng, mode) => ({
      ...setup(players, rng, mode),
      phase: "move",
      dice: 3,
      pawns: { p1: [40, 41, 39, -1], p2: [0, -1, -1, -1], p3: [0, -1, -1, -1] },
    }));
    const { send, snapshot, observer } = await openRoom(3);
    send(0, "pickGame", { gameId: "chinczyk" });
    send(0, "toggleSeat", { id: "p4" });
    send(0, "pickMode", { mode: "szybki" });
    for (const player of [1, 2]) send(player, "ready", { ready: true });
    send(0, "start", {});
    send(0, "move", { type: "move", pawn: 2 });
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result).toEqual({ winner: "p1", ranking: ["p1", "p2", "p3"], places: { p1: 1, p2: 2, p3: 2 } });
    expect(snapshot().game).toHaveProperty("places", { p1: 1, p2: 2, p3: 2 });
    expect(snapshot(observer).game).toHaveProperty("places", { p1: 1, p2: 2, p3: 2 });
  });

  test("w toku partii miejsca są null, także po wyniku jednej osoby", async () => {
    const { send, snapshot } = await drawing(2, "schulte");
    expect(snapshot().game).toHaveProperty("places", null);
    send(0, "move", { type: "result", ms: 10_000, mistakes: 0, splits: [] });
    expect(snapshot().phase).toBe("playing");
    expect(snapshot().game).toHaveProperty("places", null);
  });

  test("walkower nie liczy miejsc z nieukończonej mini-gry", async () => {
    const { room, clients, snapshot } = await drawing(2, "schulte");
    const places = vi.spyOn(GAMES.schulte, "places");
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(snapshot().game!.result).toEqual({ winner: "p1" });
    expect(snapshot().game).toHaveProperty("places", null);
    expect(places).not.toHaveBeenCalled();
  });

  test("Gomoku z samym zwycięzcą ma miejsca null", async () => {
    const { send, snapshot } = await drawing(2, "piec-w-rzedzie");
    for (let x = 0; x < 5; x++) {
      send(0, "move", { x, y: 0 });
      if (x < 4) send(1, "move", { x, y: 1 });
    }
    expect(snapshot().game!.result).toEqual({ winner: "p1" });
    expect(snapshot().game).toHaveProperty("places", null);
  });
});

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

// P4-003: prawdziwy limit serwera nie wyprzedza wyniku po 10 s pokazu i 50 s wyboru.
describe("Zakupy: zapas na oddanie wyniku", () => {
  test.each([1, 2, 6])("%i graczy: wynik z 50 s wybierania dociera po 60 s partii", async (n) => {
    const { send, snapshot, clients } = await drawing(n, "zakupy");
    const record = vi.spyOn(stats, "recordScores");
    const state = snapshot().game!.view as ZakupyView;
    vi.advanceTimersByTime(60_000);
    // Pokój rozsyła czas przy wiadomości, nie co sekundę. begin po intro tylko odświeża widok.
    send(0, "begin", {});
    expect(snapshot().phase).toBe("playing");
    expect(snapshot().game!.msLeft).toBe(20_000);
    for (let i = 0; i < n; i++) send(i, "move", { type: "result", picked: state.listed, ms: 50_000 });
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result).toEqual({ ranking: clients.slice(0, n).map(c => c.sessionId) });
    expect(record).toHaveBeenCalledTimes(1);
    const rows = record.mock.calls[0][1];
    expect(rows).toHaveLength(n);
    for (const row of rows) expect(row).toMatchObject({ score: 10, tie: 50_000, detail: { picked: { "1": state.listed } } });
  });

  test("dopiero po 80 s serwer wpisuje pustą półkę, bez wyniku po 60 s", async () => {
    const { snapshot } = await drawing(2, "zakupy");
    vi.advanceTimersByTime(79_999);
    expect(snapshot().phase).toBe("playing");
    expect((snapshot().game!.view as ZakupyView).results).toEqual({});
    vi.advanceTimersByTime(1);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result?.winner).toBeUndefined();
    expect(Object.values((snapshot().game!.view as ZakupyView).results)).toEqual([
      { score: 0, hits: 0, wrong: 0, ms: 50_000 },
      { score: 0, hits: 0, wrong: 0, ms: 50_000 },
    ]);
  });
});

// P4-004: postęp nie odnawia 300 s, także w grze jednej osoby.
describe("Sekwencja: wynik po limicie", () => {
  test.each([1, 2, 6])("%i graczy: ostatnia zaliczona seria zostaje po 300 s", async (n) => {
    const { send, snapshot, clients } = await drawing(n, "simon");
    const record = vi.spyOn(stats, "recordScores");
    vi.advanceTimersByTime(290_000);
    for (let i = 0; i < n; i++) send(i, "move", { type: "progress", score: 7 });
    expect(snapshot().game!.view).toMatchObject({ progress: Object.fromEntries(clients.slice(0, n).map(c => [c.sessionId, 7])), results: {} });
    expect(snapshot().game!.msLeft).toBe(10_000);
    vi.advanceTimersByTime(10_000);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().game!.result).toEqual({ ranking: clients.slice(0, n).map(c => c.sessionId) });
    const results = (snapshot().game!.view as { results: Record<string, number> }).results;
    expect(Object.values(results)).toEqual(Array(n).fill(7));
    expect(record).toHaveBeenCalledTimes(1);
    for (const row of record.mock.calls[0][1]) expect(row).toMatchObject({ score: 7, tie: null });
  });
});

// P4-022: jeden termin mini-gry od końca instrukcji; ruchy rywali go nie przesuwają.
describe("Mini-gra: jeden termin niezależny od rywali", () => {
  const circle = Array.from({ length: 100 }, (_, i): [number, number] => [0.5 + 0.3 * Math.cos((i / 100) * 2 * Math.PI), 0.5 + 0.3 * Math.sin((i / 100) * 2 * Math.PI)]);

  test("limit rusza po odliczaniu po ostatnim Start", async () => {
    const { send, snapshot } = await drawing(2, "stoper", false);
    expect(snapshot().game!.msLeft).toBe(15_000);
    send(0, "begin", {});
    vi.advanceTimersByTime(5_000);
    send(0, "begin", {});
    expect(snapshot().game!.msLeft).toBe(10_000);
    send(1, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game!.msLeft).toBe(60_000);
  });

  test("bez Start limit rusza po 15 s instrukcji i 3 s odliczania", async () => {
    const { snapshot } = await drawing(2, "stoper", false);
    vi.advanceTimersByTime(15_000);
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game!.msLeft).toBe(60_000);
  });

  test.each([2, 6])("Stoper, %i graczy: wyniki pierwszego i kolejnych nie przesuwają terminu", async (n) => {
    const { send, snapshot } = await drawing(n, "stoper");
    const validate = vi.spyOn(GAMES.stoper, "validateMove");
    vi.advanceTimersByTime(20_000);
    send(0, "move", { type: "result", deviation: 100 });
    expect(snapshot(1).game!.msLeft).toBe(40_000);
    vi.advanceTimersByTime(20_000);
    for (let i = 1; i < n - 1; i++) send(i, "move", { type: "result", deviation: 100 });
    // Widok liczy czas przy wiadomości; begin po instrukcji tylko go odświeża.
    send(0, "begin", {});
    expect(snapshot(n - 1).game!.msLeft).toBe(20_000);
    vi.advanceTimersByTime(19_999);
    expect(snapshot().phase).toBe("playing");
    vi.advanceTimersByTime(1);
    expect(snapshot().phase).toBe("over");
    const timeouts = validate.mock.calls.filter(([, , , context]) => context?.source === "timeout");
    expect(timeouts.map(([, player]) => player)).toEqual([`p${n}`]);
  });

  test.each([2, 6])("Narysuj koło, %i graczy: próby i koniec rywala nie odnawiają limitu", async (n) => {
    const { send, snapshot } = await drawing(n, "kolo");
    vi.advanceTimersByTime(30_000);
    send(1, "move", { type: "result", points: circle });
    expect(snapshot(1).game!.msLeft).toBe(90_000);
    send(0, "move", { type: "result", points: [] });
    expect(snapshot(1).game!.msLeft).toBe(90_000);
    vi.advanceTimersByTime(90_000);
    expect(snapshot().phase).toBe("over");
  });

  test("Narysuj koło solo: kolejne próby nie odnawiają limitu", async () => {
    const { send, snapshot } = await drawing(1, "kolo");
    vi.advanceTimersByTime(30_000);
    send(0, "move", { type: "result", points: circle });
    send(0, "move", { type: "result", points: circle });
    expect(snapshot().game!.msLeft).toBe(90_000);
  });

  test("rewanż nie dziedziczy terminu poprzedniej partii", async () => {
    const { send, snapshot } = await drawing(2, "stoper");
    vi.advanceTimersByTime(50_000);
    send(0, "move", { type: "result", deviation: 100 });
    send(1, "move", { type: "result", deviation: 200 });
    expect(snapshot().phase).toBe("over");
    send(0, "rematch", {});
    send(1, "rematch", {});
    expect(snapshot().game!.msLeft).toBe(5000);
    send(0, "begin", {});
    send(1, "begin", {});
    expect(snapshot().game).toMatchObject({ intro: true, countdown: true, msLeft: 3000 });
    vi.advanceTimersByTime(3000);
    expect(snapshot().game!.msLeft).toBe(60_000);
  });
});

// 07-02: zapis pomiaru z prawdziwego pokoju. Jeden wpis `recordRoomGame` na partię, bez nicków obserwatorów.
describe("pomiar: wpis room_games z pokoju", () => {
  const FIVE = [0, 1, 2, 3, 4];
  // Gracz p1 stawia pięć w poziomie, p2 odpowiada w drugim rzędzie.
  function playGomoku(send: (player: number, type: string, raw: unknown) => void) {
    for (const x of FIVE) {
      send(0, "move", { x, y: 0 });
      if (x < 4) send(1, "move", { x, y: 1 });
    }
  }
  const spyEntries = () => vi.spyOn(stats, "recordRoomGame");

  test("Gomoku do końca: jeden wpis completed z dwiema osobami, obserwator się nie liczy", async () => {
    const entries = spyEntries();
    const { send, snapshot, clients } = await drawing(2, "piec-w-rzedzie");
    expect(clients).toHaveLength(3);
    playGomoku(send);
    expect(snapshot().phase).toBe("over");
    expect(entries).toHaveBeenCalledTimes(1);
    const call = entries.mock.calls[0][0];
    expect(call).toMatchObject({ gameId: "piec-w-rzedzie", players: 2, outcome: "completed" });
    expect([...call.nicks].sort()).toEqual(["p1", "p2"]);
    expect(typeof call.roomKey).toBe("string");
  });

  test("wyjście w 1v1 w trakcie: walkover z players 2, nigdy players 1", async () => {
    const entries = spyEntries();
    const { room, clients } = await drawing(2, "piec-w-rzedzie");
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0]).toMatchObject({ players: 2, outcome: "walkover" });
    expect(entries.mock.calls.some(([call]) => call.players === 1)).toBe(false);
  });

  test("po końcu partii wyjście gracza nie dopisuje drugiego wpisu", async () => {
    const entries = spyEntries();
    const { room, send, snapshot, clients } = await drawing(2, "piec-w-rzedzie");
    playGomoku(send);
    expect(snapshot().phase).toBe("over");
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0].outcome).toBe("completed");
  });

  test("wyjście jednej osoby z trzech: aborted z players 3", async () => {
    const entries = spyEntries();
    const { room, clients } = await drawing(3);
    await room.onLeave(clients[2], CloseCode.CONSENTED);
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0]).toMatchObject({ gameId: "kalambury", players: 3, outcome: "aborted" });
  });

  test("obserwator wychodzący w trakcie nie tworzy wpisu", async () => {
    const entries = spyEntries();
    const { room, clients, observer } = await drawing(2);
    expect(observer).toBeDefined();
    await room.onLeave(clients[observer!], CloseCode.CONSENTED);
    expect(entries).not.toHaveBeenCalled();
  });

  test("solo: wpis z players 1", async () => {
    const entries = spyEntries();
    const { send, snapshot } = await openRoom(1, { solo: "stoper" });
    expect(snapshot().phase).toBe("playing");
    send(0, "begin", {});
    send(0, "move", { type: "result", deviation: 100 });
    expect(snapshot().phase).toBe("over");
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0]).toMatchObject({ gameId: "stoper", players: 1, outcome: "completed" });
  });

  test("rewanż ma ten sam klucz pokoju, drugi pokój inny, a żaden nie jest kodem pokoju", async () => {
    const entries = spyEntries();
    const first = await drawing(2, "stoper");
    const finishRound = (room: Awaited<ReturnType<typeof drawing>>) => {
      room.send(0, "move", { type: "result", deviation: 100 });
      room.send(1, "move", { type: "result", deviation: 200 });
    };
    finishRound(first);
    first.send(0, "rematch", {});
    first.send(1, "rematch", {});
    first.send(0, "begin", {});
    first.send(1, "begin", {});
    vi.advanceTimersByTime(3000);
    finishRound(first);
    const second = await drawing(2, "stoper");
    finishRound(second);
    expect(entries).toHaveBeenCalledTimes(3);
    const keys = entries.mock.calls.map(([call]) => call.roomKey);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[0]);
    expect(keys).not.toContain(first.room.roomId);
    expect(keys).not.toContain(second.room.roomId);
  });

  test("turniej: wpis na każdą grę pod jednym kluczem, bez wpisu za sam turniej", async () => {
    const entries = spyEntries();
    const { send, snapshot, clients } = await openRoom(2);
    send(0, "pickTournament", { length: 3 });
    send(0, "toggleSeat", { id: clients[2].sessionId });
    send(1, "ready", { ready: true });
    send(0, "start", {});
    expect(snapshot().phase).toBe("playing");
    vi.advanceTimersByTime(30 * 60_000);
    const { games } = snapshot().tournament!;
    // Remis po limitach czasu dokłada dogrywkę, więc gier jest 3 albo 4; wpis zawsze jeden na grę.
    expect(games.length).toBeGreaterThanOrEqual(3);
    expect(entries).toHaveBeenCalledTimes(games.length);
    expect(entries.mock.calls.map(([call]) => call.gameId)).toEqual(games);
    expect(new Set(entries.mock.calls.map(([call]) => call.roomKey)).size).toBe(1);
    for (const [call] of entries.mock.calls) expect(call).toMatchObject({ players: 2, outcome: "completed" });
  });

  test("turniej: wyjście w trakcie gry to aborted z players 2", async () => {
    const entries = spyEntries();
    const { room, send, clients } = await openRoom(2);
    send(0, "pickTournament", { length: 3 });
    send(0, "toggleSeat", { id: clients[2].sessionId });
    send(1, "ready", { ready: true });
    send(0, "start", {});
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0]).toMatchObject({ players: 2, outcome: "aborted" });
  });

  test("błąd ruchu po limicie: aborted, jeden wpis", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const entries = spyEntries();
    const { send, snapshot } = await drawing(2, "stoper");
    vi.spyOn(GAMES.stoper, "timeoutMove").mockImplementation(() => {
      throw new Error("błąd zasad");
    });
    send(0, "begin", {});
    send(1, "begin", {});
    vi.advanceTimersByTime(GAMES.stoper.turnSeconds! * 1000);
    expect(snapshot().phase).toBe("over");
    expect(entries).toHaveBeenCalledTimes(1);
    expect(entries.mock.calls[0][0]).toMatchObject({ players: 2, outcome: "aborted" });
  });
});

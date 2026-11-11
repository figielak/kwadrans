import { EventEmitter } from "node:events";
import { type AuthContext, type Client, type ClientPrivate, CloseCode, connectClientToRoom, getMessageBytes, matchMaker, Protocol } from "@colyseus/core";
import { WebSocketClient } from "@colyseus/ws-transport";
import { GAMES, type RoomView } from "@kwadrans/games";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Audyt LobbyRoom: prawdziwy cykl życia Colyseusa (matchMaker, _onJoin, _onLeave, allowReconnection, disconnect)
// bez sieci. Podmienione jest tylko gniazdo WebSocket; zegar pokoju i czas powrotu przesuwają sztuczne timery.
// `test.fails` oznacza odtworzony błąd: test przechodzi, dopóki błąd istnieje, a po poprawce trzeba zamienić go na `test`.

let LobbyRoom: typeof import("./LobbyRoom.ts").LobbyRoom;
let stats: typeof import("./LobbyRoom.ts").stats;
let openStats: typeof import("./stats.ts").openStats;
beforeAll(async () => {
  vi.stubEnv("DB_PATH", ":memory:");
  try {
    ({ LobbyRoom, stats } = await import("./LobbyRoom.ts"));
    ({ openStats } = await import("./stats.ts"));
  } finally {
    vi.unstubAllEnvs();
  }
  await matchMaker.setup();
  matchMaker.defineRoomType("lobby", LobbyRoom);
});

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(async () => {
  // Zamknięcie pokoi czeka na timery, więc najpierw je przesuwamy, a obietnic nie blokujemy.
  for (const closing of matchMaker.disconnectAll()) closing.catch(() => {});
  await vi.advanceTimersByTimeAsync(2000);
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const OPEN = 1;
const CLOSED = 3;

/** Gniazdo w pamięci: to, co serwer wysyła, ląduje w `sent`; `drop` to zerwane połączenie widziane przez serwer. */
class Socket extends EventEmitter {
  readyState = OPEN;
  sent: Uint8Array[] = [];
  closedWith: number | undefined;
  send(data: Uint8Array, _options?: unknown, done?: (error?: Error) => void) {
    this.sent.push(data);
    done?.();
  }
  /** Serwer zamyka połączenie (kick, zamknięcie pokoju). Jak w `ws`: zdarzenie `close` przychodzi później, nie w trakcie wywołania. */
  close(code?: number) {
    setTimeout(() => this.drop(code), 0);
  }
  drop(code = 1006) {
    if (this.readyState === CLOSED) return;
    this.readyState = CLOSED;
    this.closedWith = code;
    this.emit("close", code);
  }
}

interface Seat {
  sessionId: string;
  socket: Socket;
  client: Client & ClientPrivate;
  views: RoomView[];
}

const context = { ip: "10.0.0.1", headers: new Headers() } as unknown as AuthContext;
const tick = (ms = 0) => vi.advanceTimersByTimeAsync(ms);

async function connect(roomId: string, sessionId: string, options: { reconnectionToken?: string; ack?: boolean } = {}): Promise<Seat> {
  const socket = new Socket();
  const client = new WebSocketClient(sessionId, socket as never) as unknown as Client & ClientPrivate;
  const views: RoomView[] = [];
  const send = client.send.bind(client);
  client.send = ((type: string, message: unknown) => {
    if (type === "room") views.push(structuredClone(message) as RoomView);
    send(type, message);
  }) as never;
  await connectClientToRoom(matchMaker.getLocalRoomById(roomId), client, context, { reconnectionToken: options.reconnectionToken });
  // Klient potwierdza dołączenie; dopiero wtedy serwer wypuszcza wiadomości z kolejki.
  if (options.ack !== false) socket.emit("message", Buffer.from([Protocol.JOIN_ROOM]));
  return { sessionId, socket, client, views };
}

async function open(n: number) {
  const first = await matchMaker.create("lobby", { nick: "p1" }, context);
  const roomId = first.roomId;
  const seats = [await connect(roomId, first.sessionId)];
  for (let i = 1; i < n; i++) {
    const next = await matchMaker.joinById(roomId, { nick: `p${i + 1}` }, context);
    seats.push(await connect(roomId, next.sessionId));
  }
  const room = matchMaker.getLocalRoomById(roomId) as InstanceType<typeof LobbyRoom>;
  const send = (seat: Seat, type: string, payload: unknown = {}) => seat.socket.emit("message", getMessageBytes.raw(Protocol.ROOM_DATA, type, payload));
  const view = (seat: Seat) => seat.views.at(-1)!;
  /** Powrót tym samym tokenem, jak robi to SDK po zerwaniu połączenia. */
  const reconnect = async (seat: Seat, options: { ack?: boolean } = {}) => {
    const reconnectionToken = seat.client.reconnectionToken;
    const reservation = await matchMaker.reconnect(roomId, { reconnectionToken });
    const back = await connect(roomId, reservation.sessionId, { reconnectionToken, ...options });
    await tick();
    return back;
  };
  return { room, roomId, seats, send, view, reconnect };
}

/** Gomoku 1v1 w toku: p1 gospodarz, p2 gość. */
async function gomoku() {
  const ctx = await open(2);
  const [p1, p2] = ctx.seats;
  ctx.send(p1, "pickGame", { gameId: "piec-w-rzedzie" });
  ctx.send(p2, "ready", { ready: true });
  ctx.send(p1, "start");
  expect(ctx.view(p1).phase).toBe("playing");
  return { ...ctx, p1, p2 };
}

const RECONNECT_MS = 10 * 60_000;
const ids = (view: RoomView) => view.players.map((p) => p.id);
const player = (view: RoomView, seat: Seat) => view.players.find((p) => p.id === seat.sessionId);

describe("powrót gracza a zegar pokoju (prawdziwe allowReconnection)", () => {
  test("zerwane połączenie i powrót: to samo miejsce, świeży stan dopiero po potwierdzeniu dołączenia", async () => {
    const { p1, p2, view, reconnect, send } = await gomoku();
    p2.socket.drop();
    await tick();
    expect(player(view(p1), p2)!.connected).toBe(false);
    send(p1, "move", { x: 7, y: 7 });
    const back = await reconnect(p2, { ack: false });
    expect(player(view(p1), p2)!.connected).toBe(true);
    // Przed potwierdzeniem serwer wysłał tylko JOIN_ROOM, stan czeka w kolejce.
    expect(back.socket.sent).toHaveLength(1);
    back.socket.emit("message", Buffer.from([Protocol.JOIN_ROOM]));
    expect(back.socket.sent.length).toBeGreaterThan(1);
    expect(view(back)).toMatchObject({ phase: "playing", seats: [p1.sessionId, p2.sessionId], game: { waitingFor: [p2.sessionId] } });
    send(back, "move", { x: 8, y: 8 });
    expect(view(p1).game!.waitingFor).toEqual([p1.sessionId]);
  });

  test("limit tury mija pod nieobecność: ruch zastępczy, a po powrocie gracz widzi bieżącą turę i nowy limit", async () => {
    const { p1, p2, view, reconnect, send } = await gomoku();
    send(p1, "move", { x: 7, y: 7 });
    p2.socket.drop();
    await tick(60_000);
    expect(view(p1).game!.waitingFor).toEqual([p1.sessionId]);
    await tick(20_000);
    const back = await reconnect(p2);
    expect(view(back).game).toMatchObject({ waitingFor: [p1.sessionId], result: null });
    expect(view(back).game!.msLeft).toBeGreaterThan(39_000);
    expect(view(back).game!.msLeft).toBeLessThanOrEqual(40_000);
  });

  test("powrót tuż przed końcem 10 minut zachowuje partię", async () => {
    const { p1, p2, view, reconnect } = await gomoku();
    p2.socket.drop();
    await tick(RECONNECT_MS - 1000);
    const back = await reconnect(p2);
    await tick(5000);
    expect(view(p1).phase).toBe("playing");
    expect(ids(view(back))).toEqual([p1.sessionId, p2.sessionId]);
  });

  test("brak powrotu przez 10 minut: walkower, a stary token już nie działa", async () => {
    const record = vi.spyOn(stats, "record");
    const { roomId, p1, p2, view } = await gomoku();
    const token = p2.client.reconnectionToken;
    p2.socket.drop();
    await tick(RECONNECT_MS);
    expect(view(p1)).toMatchObject({ phase: "over", seats: [p1.sessionId], game: { result: { winner: p1.sessionId } } });
    expect(record).toHaveBeenCalledTimes(1);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: token })).rejects.toThrow();
  });

  test("odświeżenie strony, zanim serwer zauważy zamknięcie starego połączenia: powrót działa", async () => {
    const { p1, p2, view, reconnect } = await gomoku();
    // Stare gniazdo jest jeszcze otwarte; nowe połączenie przychodzi z tym samym tokenem.
    const back = await reconnect(p2);
    await tick(1000);
    expect(ids(view(p1))).toEqual([p1.sessionId, p2.sessionId]);
    expect(player(view(p1), p2)!.connected).toBe(true);
    expect(view(back).phase).toBe("playing");
  });

  test("nieobecny podczas instrukcji mini-gry: odliczanie rusza po 15 s, powrót w trakcie pokazuje resztę czasu", async () => {
    const { seats: [p1, p2], send, view, reconnect } = await open(2);
    send(p1, "pickGame", { gameId: "stoper" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    p2.socket.drop();
    send(p1, "begin");
    expect(view(p1).game).toMatchObject({ intro: true, countdown: false });
    await tick(15_000);
    expect(view(p1).game).toMatchObject({ intro: true, countdown: true });
    await tick(1000);
    const back = await reconnect(p2);
    expect(view(back).game).toMatchObject({ intro: true, countdown: true });
    expect(view(back).game!.msLeft).toBeGreaterThan(1900);
    expect(view(back).game!.msLeft).toBeLessThanOrEqual(2000);
    await tick(2000);
    expect(view(back).game).toMatchObject({ intro: false, countdown: false });
  });

  test("wszyscy rozłączeni: pokój żyje, zegar gra dalej, obaj wracają do tej samej partii", async () => {
    const { p1, p2, view, reconnect } = await gomoku();
    p1.socket.drop();
    p2.socket.drop();
    await tick(3 * 60_000);
    const back1 = await reconnect(p1);
    const back2 = await reconnect(p2);
    expect(view(back1).phase).toBe("playing");
    expect(view(back2).game!.result).toBeNull();
  });

  test("wyrzucenie rozłączonego z pełnego pokoju: prawdziwe odrzucenie powrotu zwalnia miejsce i unieważnia token", async () => {
    const { roomId, seats, send, view } = await open(6);
    await expect(matchMaker.joinById(roomId, { nick: "p7" }, context)).rejects.toThrow();
    const token = seats[5].client.reconnectionToken;
    seats[5].socket.drop();
    await tick();
    send(seats[0], "kick", { id: seats[5].sessionId });
    await tick();
    expect(ids(view(seats[0]))).toHaveLength(5);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: token })).rejects.toThrow();
    const next = await matchMaker.joinById(roomId, { nick: "p7" }, context);
    const p7 = await connect(roomId, next.sessionId);
    expect(ids(view(p7))).toHaveLength(6);
  });

  test("wyrzucenie obecnego gościa zamyka jego gniazdo kodem 4100 i nie zostawia czekania na powrót", async () => {
    const { roomId, seats: [p1, p2], send, view } = await open(2);
    const token = p2.client.reconnectionToken;
    send(p1, "kick", { id: p2.sessionId });
    await tick();
    expect(p2.socket.closedWith).toBe(4100);
    expect(ids(view(p1))).toEqual([p1.sessionId]);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: token })).rejects.toThrow();
  });
});

/** p1 stawia pięć w rzędzie, p2 odpowiada w drugim. */
function winGomoku({ p1, p2, send }: Awaited<ReturnType<typeof gomoku>>) {
  for (const x of [0, 1, 2, 3, 4]) {
    send(p1, "move", { x, y: 0 });
    if (x < 4) send(p2, "move", { x, y: 1 });
  }
}

describe("B1: zamknięcie pokoju rozlicza trwającą partię", () => {
  // Deploy, restart i nieobsłużony wyjątek kończą się tym samym: Colyseus woła disconnect(SERVER_SHUTDOWN) na każdym pokoju.
  // allowReconnection odrzuca wtedy powrót od razu („disposing”), więc onLeave usuwa graczy po kolei jak przy zwykłym wyjściu.
  test("wyłączenie serwera w trakcie 1v1 nie zapisuje wygranej walkowerem", async () => {
    const record = vi.spyOn(stats, "record");
    const measured = vi.spyOn(stats, "recordRoomGame");
    const { room } = await gomoku();
    room.disconnect(CloseCode.SERVER_SHUTDOWN).catch(() => {});
    await tick(100);
    expect(record).not.toHaveBeenCalled();
    expect(measured.mock.calls.map(([entry]) => entry.outcome)).not.toContain("walkover");
  });

  test("zamknięcie bezczynnego pokoju po partii nie startuje rewanżu i nie dopisuje przerwanej partii", async () => {
    const measured = vi.spyOn(stats, "recordRoomGame");
    const { seats: [p1, p2], send, view } = await open(2);
    send(p1, "pickGame", { gameId: "stoper" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    send(p1, "begin");
    send(p2, "begin");
    await tick(3000);
    send(p1, "move", { type: "result", deviation: 100 });
    send(p2, "move", { type: "result", deviation: 200 });
    expect(view(p1).phase).toBe("over");
    send(p1, "rematch");
    await tick(60 * 60_000 + 1000);
    expect(measured.mock.calls.map(([entry]) => entry.outcome)).toEqual(["completed"]);
  });
});

describe("B2: gospodarz przechodzi na rozłączonego", () => {
  test("gospodarz wychodzi, następny w kolejce jest rozłączony: gospodarzem zostaje ktoś obecny", async () => {
    const { seats: [p1, p2, p3], view } = await open(3);
    p2.socket.drop();
    await tick();
    p1.socket.drop(CloseCode.CONSENTED);
    await tick();
    expect(ids(view(p3))).toEqual([p2.sessionId, p3.sessionId]);
    // Dziś hostId wskazuje p2, więc przez 10 minut nikt w pokoju nie może wybrać gry ani dać startu.
    expect(view(p3).hostId).toBe(p3.sessionId);
  });
});

describe("B3: wyjątek poza try zabija cały serwer", () => {
  // Colyseus nie łapie wyjątków z obsługi wiadomości ani z zegara pokoju, a Server rejestruje
  // process.on("uncaughtException") → gracefullyShutdown: padają wszystkie pokoje (i odpala się B1).
  test("błąd widoku gry po ruchu nie wychodzi z obsługi wiadomości", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { p1, send } = await gomoku();
    const broken = vi.spyOn(GAMES["piec-w-rzedzie"], "playerView").mockImplementation(() => {
      throw new Error("błąd widoku");
    });
    try {
      expect(() => send(p1, "move", { x: 7, y: 7 })).not.toThrow();
    } finally {
      broken.mockRestore();
    }
  });

  test("błąd widoku jednego gracza nie odcina od stanu pozostałych", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { p1, p2, send, view } = await gomoku();
    const playerView = GAMES["piec-w-rzedzie"].playerView;
    const broken = vi.spyOn(GAMES["piec-w-rzedzie"], "playerView").mockImplementation((state, id) => {
      if (id === p1.sessionId) throw new Error("błąd widoku");
      return playerView(state, id);
    });
    try {
      send(p1, "move", { x: 7, y: 7 });
      expect(view(p2).game!.waitingFor).toEqual([p2.sessionId]);
    } finally {
      broken.mockRestore();
    }
  });

  test("błąd widoku gry po limicie tury nie wychodzi z zegara pokoju", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await gomoku();
    const broken = vi.spyOn(GAMES["piec-w-rzedzie"], "playerView").mockImplementation(() => {
      throw new Error("błąd widoku");
    });
    try {
      await expect(tick(60_000)).resolves.toBeDefined();
    } finally {
      broken.mockRestore();
    }
  });

  test("błąd zasad na końcu instrukcji mini-gry nie wychodzi z zegara pokoju", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { seats: [p1, p2], send } = await open(2);
    send(p1, "pickGame", { gameId: "stoper" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    const broken = vi.spyOn(GAMES.stoper, "waitingFor").mockImplementation(() => {
      throw new Error("błąd zasad");
    });
    try {
      await expect(tick(15_000)).resolves.toBeDefined();
    } finally {
      broken.mockRestore();
    }
  });
});

describe("B4: błąd zapisu statystyk zostawia koniec partii w połowie", () => {
  test("ruch kończący partię: wygrana liczy się w pokoju mimo błędu bazy", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(stats, "record").mockImplementation(() => {
      throw new Error("database is locked");
    });
    const ctx = await gomoku();
    winGomoku(ctx);
    expect(ctx.view(ctx.p1)).toMatchObject({ phase: "over", game: { result: { winner: ctx.p1.sessionId } } });
    expect(ctx.view(ctx.p1).scores).toEqual({ [ctx.p1.sessionId]: 1 });
  });

  test("koniec po limicie: ukończona partia nie zamienia się w przerwaną z drugim wpisem pomiaru", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const measured = vi.spyOn(stats, "recordRoomGame");
    vi.spyOn(stats, "recordScores").mockImplementation(() => {
      throw new Error("database is locked");
    });
    const { seats: [p1, p2], send, view } = await open(2);
    send(p1, "pickGame", { gameId: "stoper" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    send(p1, "begin");
    send(p2, "begin");
    await tick(3000 + GAMES.stoper.turnSeconds! * 1000);
    expect(view(p1).phase).toBe("over");
    expect(measured.mock.calls.map(([entry]) => entry.outcome)).toEqual(["completed"]);
    expect(view(p1).game!.result).toHaveProperty("ranking");
  });

  test("stats.ts: błąd w środku transakcji nie blokuje kolejnych zapisów (brak ROLLBACK)", () => {
    const db = openStats(":memory:");
    expect(() => db.record("gra", [{} as never], "a")).toThrow();
    expect(() => db.record("gra", ["a"], "a")).not.toThrow();
  });
});

describe("B5: utrata tokenu powrotu to utrata miejsca", () => {
  // Powrót doszedł do serwera (stary token zużyty), ale połączenie padło, zanim klient dostał nowy token.
  // allowReconnection odrzuca wtedy czekanie („not joined”), więc gracz znika od razu, bez 10 minut na powrót.
  test.fails("powrót zerwany przed potwierdzeniem nie kończy partii natychmiast", async () => {
    const { p1, p2, view, reconnect } = await gomoku();
    p2.socket.drop();
    await tick();
    const back = await reconnect(p2, { ack: false });
    back.socket.drop();
    await tick();
    expect(view(p1).phase).toBe("playing");
  });
});

/** Wejście kodem pod nową sesją, jak z ekranu głównego po utracie tokenu. */
async function joinAs(roomId: string, nick: string) {
  const reservation = await matchMaker.joinById(roomId, { nick }, context);
  const seat = await connect(roomId, reservation.sessionId);
  await tick();
  return seat;
}

describe("powrót kodem przejmuje miejsce rozłączonego o tym samym nicku", () => {
  test("w trakcie partii: jedna osoba zamiast ducha, partia trwa, a wracający gra dalej swoim miejscem", async () => {
    const { roomId, p1, p2, view, send } = await gomoku();
    send(p1, "move", { x: 7, y: 7 });
    p2.socket.drop();
    await tick();
    const back = await joinAs(roomId, "p2");
    expect(view(p1).phase).toBe("playing");
    expect(ids(view(p1))).toEqual([p1.sessionId, back.sessionId]);
    expect(view(p1).seats).toEqual([p1.sessionId, back.sessionId]);
    expect(player(view(p1), back)).toMatchObject({ nick: "p2", connected: true, color: player(p2.views.at(-1)!, p2)!.color });
    expect(view(back).game!.waitingFor).toEqual([back.sessionId]);
    send(back, "move", { x: 8, y: 8 });
    expect(view(p1).game!.waitingFor).toEqual([p1.sessionId]);
    // Czas powrotu ducha mija: nic się nie rozlicza, bo ducha już nie ma.
    await tick(RECONNECT_MS + 1000);
    expect(view(p1).phase).toBe("playing");
    expect(ids(view(p1))).toEqual([p1.sessionId, back.sessionId]);
  });

  test("nick porównuje nickKey, zostaje nowa pisownia; gospodarz wraca jako gospodarz", async () => {
    const { roomId, seats: [p1, p2], view } = await open(2);
    p1.socket.drop();
    await tick();
    const back = await joinAs(roomId, "P1");
    expect(ids(view(p2))).toEqual([back.sessionId, p2.sessionId]);
    expect(view(p2).hostId).toBe(back.sessionId);
    expect(player(view(p2), back)!.nick).toBe("P1");
  });

  test("punkty pokoju i stary token przechodzą na nową sesję: stara sesja już nie wróci", async () => {
    const { roomId, p1, p2, view } = await gomoku();
    p1.socket.drop(CloseCode.CONSENTED);
    await tick();
    expect(view(p2).scores).toEqual({ [p2.sessionId]: 1 });
    p2.socket.drop();
    await tick();
    const watcher = await joinAs(roomId, "widz");
    const back = await joinAs(roomId, "p2");
    expect(view(watcher).scores).toEqual({ [back.sessionId]: 1 });
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: p2.client.reconnectionToken })).rejects.toThrow();
  });

  test("obecny gracz o tym samym nicku zostaje: druga osoba wchodzi obok", async () => {
    const { roomId, seats: [p1, p2], view } = await open(2);
    const twin = await joinAs(roomId, "p2");
    expect(ids(view(p1))).toEqual([p1.sessionId, p2.sessionId, twin.sessionId]);
  });
});

describe("rozłączony gospodarz oddaje rolę", () => {
  const HOST_WAIT_MS = 15_000;

  test("po 15 s gospodarzem zostaje pierwszy obecny i może dać start; powrót dawnego gospodarza tego nie cofa", async () => {
    const { seats: [p1, p2, p3], view, send, reconnect } = await open(3);
    p1.socket.drop();
    await tick(HOST_WAIT_MS - 1000);
    expect(view(p2).hostId).toBe(p1.sessionId);
    await tick(1000);
    expect(view(p2).hostId).toBe(p2.sessionId);
    send(p2, "pickGame", { gameId: "piec-w-rzedzie" });
    expect(view(p3).gameId).toBe("piec-w-rzedzie");
    const back = await reconnect(p1);
    expect(view(back).hostId).toBe(p2.sessionId);
  });

  test("gospodarz wraca przed czasem: rola zostaje, także po upływie 15 s od zerwania", async () => {
    const { seats: [p1, p2], view, reconnect } = await open(2);
    p1.socket.drop();
    await tick(5000);
    await reconnect(p1);
    await tick(HOST_WAIT_MS);
    expect(view(p2).hostId).toBe(p1.sessionId);
  });

  test("w trakcie partii nowy gospodarz może ją przerwać", async () => {
    const { p1, p2, view, send } = await gomoku();
    p1.socket.drop();
    await tick(HOST_WAIT_MS);
    send(p2, "stopGame");
    expect(view(p2).phase).toBe("lobby");
  });
});

describe("rewanż nie czeka na rozłączonych", () => {
  /** Chińczyk we trzech albo czterech po przerwanej partii (ostatni wyszedł sam), czyli faza `over` z resztą na miejscach. */
  async function over(n: number) {
    const ctx = await open(n);
    const [host, ...guests] = ctx.seats;
    ctx.send(host, "pickGame", { gameId: "chinczyk" });
    for (const guest of guests) ctx.send(guest, "ready", { ready: true });
    ctx.send(host, "start");
    expect(ctx.view(host).phase).toBe("playing");
    guests.at(-1)!.socket.drop(CloseCode.CONSENTED);
    await tick();
    expect(ctx.view(host).phase).toBe("over");
    return ctx;
  }

  test("rozłączony nie blokuje: rewanż rusza z obecnymi, a on zostaje w pokoju bez miejsca", async () => {
    const { seats: [p1, p2, p3], view, send } = await over(4);
    p2.socket.drop();
    await tick();
    send(p1, "rematch");
    expect(view(p1).phase).toBe("over");
    send(p3, "rematch");
    expect(view(p1).phase).toBe("playing");
    expect([...view(p1).seats].sort()).toEqual([p1.sessionId, p3.sessionId].sort());
    expect(ids(view(p1))).toContain(p2.sessionId);
  });

  test("zerwanie ostatniego niegotowego rusza rewanż, na który reszta już się zgodziła", async () => {
    const { seats: [p1, p2, p3], view, send } = await over(4);
    send(p1, "rematch");
    send(p3, "rematch");
    expect(view(p1).phase).toBe("over");
    p2.socket.drop();
    await tick();
    expect(view(p1).phase).toBe("playing");
    expect(view(p1).seats).not.toContain(p2.sessionId);
  });

  test("za mało obecnych na grę: rewanż czeka", async () => {
    const { seats: [p1, p2], view, send } = await over(3);
    p2.socket.drop();
    await tick();
    send(p1, "rematch");
    expect(view(p1).phase).toBe("over");
  });
});

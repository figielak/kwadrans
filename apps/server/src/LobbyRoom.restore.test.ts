import { EventEmitter } from "node:events";
import { type AuthContext, type Client, type ClientPrivate, CloseCode, connectClientToRoom, getMessageBytes, matchMaker, Protocol } from "@colyseus/core";
import { WebSocketClient } from "@colyseus/ws-transport";
import { GAMES, PLAYER_COLORS, type RoomView } from "@kwadrans/games";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Faza 13: pokoje przeżywają restart serwera. Restart to tutaj: zapis wszystkich pokoi (`saveRooms`), zamknięcie ich
// tak jak robi to Colyseus przy SIGTERM (`onBeforeShutdown`) i odtworzenie z bazy (`restoreRooms`) w tym samym procesie.
// Cykl życia Colyseusa jest prawdziwy (matchMaker, _onJoin, allowReconnection), podmienione jest tylko gniazdo.

let LobbyRoom: typeof import("./LobbyRoom.ts").LobbyRoom;
let stats: typeof import("./LobbyRoom.ts").stats;
let saveRooms: typeof import("./LobbyRoom.ts").saveRooms;
let restoreRooms: typeof import("./LobbyRoom.ts").restoreRooms;
beforeAll(async () => {
  vi.stubEnv("DB_PATH", ":memory:");
  try {
    ({ LobbyRoom, stats, saveRooms, restoreRooms } = await import("./LobbyRoom.ts"));
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
  for (const closing of matchMaker.disconnectAll()) closing.catch(() => {});
  await vi.advanceTimersByTimeAsync(2000);
  // Zapis, którego test nie odtworzył, nie może przejść do następnego testu.
  stats.takeRooms(0);
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const OPEN = 1;
const CLOSED = 3;

class Socket extends EventEmitter {
  readyState = OPEN;
  sent: Uint8Array[] = [];
  closedWith: number | undefined;
  send(data: Uint8Array, _options?: unknown, done?: (error?: Error) => void) {
    this.sent.push(data);
    done?.();
  }
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
  /** Token powrotu z chwili tuż przed restartem: tyle wie klient, gdy serwer znika. */
  token: string;
}

const ip = (address: string) => ({ ip: address, headers: new Headers() }) as unknown as AuthContext;
const context = ip("10.0.0.1");
const tick = (ms = 0) => vi.advanceTimersByTimeAsync(ms);
const room = (roomId: string) => matchMaker.getLocalRoomById(roomId) as InstanceType<typeof LobbyRoom>;
const view = (seat: Seat) => seat.views.at(-1)!;
const send = (seat: Seat, type: string, payload: unknown = {}) => seat.socket.emit("message", getMessageBytes.raw(Protocol.ROOM_DATA, type, payload));
const ids = (v: RoomView) => v.players.map((p) => p.id);
const player = (v: RoomView, seat: Seat) => v.players.find((p) => p.id === seat.sessionId)!;

async function connect(roomId: string, sessionId: string, reconnectionToken?: string, auth: AuthContext = context): Promise<Seat> {
  const socket = new Socket();
  const client = new WebSocketClient(sessionId, socket as never) as unknown as Client & ClientPrivate;
  const views: RoomView[] = [];
  const original = client.send.bind(client);
  client.send = ((type: string, message: unknown) => {
    if (type === "room") views.push(structuredClone(message) as RoomView);
    original(type, message);
  }) as never;
  await connectClientToRoom(room(roomId), client, auth, { reconnectionToken });
  socket.emit("message", Buffer.from([Protocol.JOIN_ROOM]));
  return { sessionId, socket, client, views, token: "" };
}

async function open(n: number, auth: AuthContext = context, options: Record<string, unknown> = {}) {
  const first = await matchMaker.create("lobby", { nick: "p1", ...options }, auth);
  const roomId = first.roomId;
  const seats = [await connect(roomId, first.sessionId, undefined, auth)];
  for (let i = 1; i < n; i++) {
    const next = await matchMaker.joinById(roomId, { nick: `p${i + 1}` }, auth);
    seats.push(await connect(roomId, next.sessionId, undefined, auth));
  }
  return { roomId, seats };
}

/** Zapis, zamknięcie jak przy SIGTERM i start od nowa. `away` to czas bez serwera. */
async function restart(roomIds: string[], seats: Seat[], away = 0) {
  for (const seat of seats) seat.token = seat.client.reconnectionToken;
  saveRooms();
  for (const roomId of roomIds) room(roomId).onBeforeShutdown();
  // Pokój z kimś rozłączonym zamyka się sekundę dłużej: Colyseus odrzuca czekanie na powrót i dopiero potem sprząta.
  await tick(1500);
  for (const roomId of roomIds) expect(room(roomId), `pokój ${roomId} zamknięty`).toBeUndefined();
  await tick(away);
  return restoreRooms();
}

/** Powrót po odświeżeniu strony: klient pyta serwer o miejsce tokenem i łączy się od nowa. */
async function back(roomId: string, seat: Seat) {
  const reservation = await matchMaker.reconnect(roomId, { reconnectionToken: seat.token });
  expect(reservation.sessionId, "powrót pod tym samym id").toBe(seat.sessionId);
  const returned = await connect(roomId, reservation.sessionId, seat.token);
  await tick();
  return returned;
}

async function gomoku() {
  const ctx = await open(2);
  const [p1, p2] = ctx.seats;
  send(p1, "pickGame", { gameId: "piec-w-rzedzie" });
  send(p2, "ready", { ready: true });
  send(p1, "start");
  expect(view(p1).phase).toBe("playing");
  return { ...ctx, p1, p2 };
}

/** Stoper 1v1 rozegrany do końca: p1 wygrywa. */
async function stoperOver() {
  const ctx = await open(2);
  const [p1, p2] = ctx.seats;
  send(p1, "pickGame", { gameId: "stoper" });
  send(p2, "ready", { ready: true });
  send(p1, "start");
  send(p1, "begin");
  send(p2, "begin");
  await tick(3000);
  send(p1, "move", { type: "result", deviation: 100 });
  send(p2, "move", { type: "result", deviation: 200 });
  expect(view(p1).phase).toBe("over");
  return { ...ctx, p1, p2 };
}

const RECONNECT_MS = 10 * 60_000;
/** Widok bez tego, co restart ma prawo zmienić: czas i obecność. */
const stable = (v: RoomView) => ({ ...v, players: v.players.map((p) => ({ ...p, connected: true })), game: v.game && { ...v.game, msLeft: null }, vote: v.vote && { ...v.vote, msLeft: 0 } });

describe("restart w trakcie partii", () => {
  test("Gomoku: ten sam kod, te same miejsca i plansza; gracze wracają starym tokenem i grają dalej", async () => {
    const { roomId, p1, p2 } = await gomoku();
    send(p1, "move", { x: 7, y: 7 });
    send(p2, "move", { x: 8, y: 8 });
    const before = view(p1);
    expect(await restart([roomId], [p1, p2])).toBe(1);

    const b1 = await back(roomId, p1);
    expect(player(view(b1), p1).connected).toBe(true);
    expect(player(view(b1), p2).connected, "drugi jeszcze nie wrócił").toBe(false);
    const b2 = await back(roomId, p2);
    expect(stable(view(b1))).toEqual(stable(before));
    expect(view(b2)).toMatchObject({ code: roomId, phase: "playing", hostId: p1.sessionId, seats: [p1.sessionId, p2.sessionId] });

    send(b1, "move", { x: 7, y: 8 });
    expect(view(b2).game!.waitingFor).toEqual([p2.sessionId]);
    // Ruch na zajęte pole dalej odpada: plansza jest ta sama.
    send(b2, "move", { x: 7, y: 7 });
    expect(view(b2).game!.waitingFor).toEqual([p2.sessionId]);
  });

  test("auto-powrót SDK: samo gniazdo z tokenem, bez pytania o miejsce", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await restart([roomId], [p1, p2]);
    const b1 = await connect(roomId, p1.sessionId, p1.token);
    await tick();
    expect(view(b1)).toMatchObject({ phase: "playing", seats: [p1.sessionId, p2.sessionId] });
    expect(player(view(b1), p1).connected).toBe(true);
  });

  test("serwer zamyka połączenia kodem, po którym klient sam próbuje wrócić", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await restart([roomId], [p1, p2]);
    expect(p1.socket.closedWith).toBe(CloseCode.MAY_TRY_RECONNECT);
    expect(p2.socket.closedWith).toBe(CloseCode.MAY_TRY_RECONNECT);
  });

  test("przestój nie zjada czasu tury: po restarcie zostaje tyle, ile było przy zamknięciu", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await tick(20_000);
    await restart([roomId], [p1, p2], 90_000);
    const b1 = await back(roomId, p1);
    expect(view(b1).game!.msLeft).toBeGreaterThan(39_000);
    expect(view(b1).game!.msLeft).toBeLessThanOrEqual(40_000);
    expect(view(b1).game!.waitingFor).toEqual([p1.sessionId]);
    await tick(40_000);
    expect(view(b1).game!.waitingFor, "po limicie ruch zastępczy").toEqual([p2.sessionId]);
  });

  test("tura, której zostały sekundy, dostaje po restarcie co najmniej 10 s na powrót graczy", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await tick(59_000);
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    expect(view(b1).game!.msLeft).toBeGreaterThan(9000);
    expect(view(b1).game!.msLeft).toBeLessThanOrEqual(10_000);
  });

  test("stary token działa raz, obcy wcale", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await restart([roomId], [p1, p2]);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: "nie-ten-token" })).rejects.toThrow();
    await back(roomId, p1);
    await expect(connect(roomId, p2.sessionId, p1.token)).rejects.toThrow();
  });

  test("kto nie wróci w 10 minut, oddaje partię walkowerem jak przy zwykłym zerwaniu", async () => {
    const record = vi.spyOn(stats, "record");
    const { roomId, p1, p2 } = await gomoku();
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    await tick(RECONNECT_MS);
    expect(view(b1)).toMatchObject({ phase: "over", seats: [p1.sessionId], game: { result: { winner: p1.sessionId } } });
    expect(record).toHaveBeenCalledTimes(1);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: p2.token })).rejects.toThrow();
  });

  test("nikt nie wraca: pokój znika po czasie powrotu i nie zostawia zapisu", async () => {
    const { roomId, p1, p2 } = await gomoku();
    await restart([roomId], [p1, p2]);
    await tick(RECONNECT_MS + 5000);
    expect(room(roomId)).toBeUndefined();
    expect(stats.takeRooms(0)).toEqual([]);
  });

  test("rozłączony przed restartem też wraca na swoje miejsce", async () => {
    const { roomId, p1, p2 } = await gomoku();
    p2.socket.drop();
    await tick();
    await restart([roomId], [p1, p2]);
    const b2 = await back(roomId, p2);
    expect(view(b2)).toMatchObject({ phase: "playing", seats: [p1.sessionId, p2.sessionId] });
  });

  test("Statki: ukryta plansza rywala zostaje ukryta, własna wraca", async () => {
    const { roomId, seats: [p1, p2] } = await open(2);
    send(p1, "pickGame", { gameId: "statki" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    const mine = view(p1).game!.view;
    const theirs = view(p2).game!.view;
    expect(mine).not.toEqual(theirs);
    await restart([roomId], [p1, p2]);
    expect((await back(roomId, p1)).views.at(-1)!.game!.view).toEqual(mine);
    expect((await back(roomId, p2)).views.at(-1)!.game!.view).toEqual(theirs);
  });

  test("mini-gra w odliczaniu: po restarcie odliczanie kończy się i rusza gra", async () => {
    const { roomId, seats: [p1, p2] } = await open(2);
    send(p1, "pickGame", { gameId: "stoper" });
    send(p2, "ready", { ready: true });
    send(p1, "start");
    send(p1, "begin");
    send(p2, "begin");
    await tick(1000);
    expect(view(p1).game).toMatchObject({ intro: true, countdown: true });
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    const b2 = await back(roomId, p2);
    expect(view(b1).game).toMatchObject({ intro: true, countdown: true, began: [p1.sessionId, p2.sessionId] });
    await tick(10_000);
    expect(view(b1).game).toMatchObject({ intro: false, countdown: false });
    send(b1, "move", { type: "result", deviation: 100 });
    send(b2, "move", { type: "result", deviation: 200 });
    expect(view(b1)).toMatchObject({ phase: "over", game: { result: { winner: p1.sessionId } } });
  });

  test("gra solo: pokój na jedną osobę wraca z partią i dalej nikogo nie wpuszcza", async () => {
    const { roomId, seats: [p1] } = await open(1, context, { solo: "stoper" });
    expect(view(p1)).toMatchObject({ solo: true, phase: "playing" });
    await restart([roomId], [p1]);
    const b1 = await back(roomId, p1);
    expect(view(b1)).toMatchObject({ solo: true, phase: "playing", gameId: "stoper" });
    await expect(matchMaker.joinById(roomId, { nick: "p2" }, context)).rejects.toThrow();
    send(b1, "begin");
    send(b1, "move", { type: "result", deviation: 100 });
    expect(view(b1).phase).toBe("over");
  });
});

describe("restart poza partią", () => {
  test("po partii: wynik, wygrane, punkty wieczoru i gospodarz zostają", async () => {
    const { roomId, p1, p2 } = await stoperOver();
    const before = view(p2);
    expect(before.scores).toEqual({ [p1.sessionId]: 1 });
    await restart([roomId], [p1, p2]);
    await back(roomId, p1);
    const b2 = await back(roomId, p2);
    expect(stable(view(b2))).toEqual(stable(before));
  });

  test("po restarcie rewanż rusza po zgodzie obu i trafia do pamięci wieczoru jako druga partia", async () => {
    const { roomId, p1, p2 } = await stoperOver();
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    const b2 = await back(roomId, p2);
    send(b1, "rematch");
    send(b2, "rematch");
    expect(view(b1)).toMatchObject({ phase: "playing", game: { intro: true } });
    send(b1, "begin");
    send(b2, "begin");
    await tick(3000);
    send(b1, "move", { type: "result", deviation: 100 });
    send(b2, "move", { type: "result", deviation: 200 });
    expect(view(b1).evening.games).toBe(2);
    expect(view(b1).scores).toEqual({ [p1.sessionId]: 2 });
  });

  test("głosowanie „Inna gra”: opcje i oddany głos wracają, komplet głosów startuje grę", async () => {
    const { roomId, p1, p2 } = await stoperOver();
    send(p1, "otherGame");
    const { options } = view(p1).vote!;
    send(p1, "vote", { id: options[0] });
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    const b2 = await back(roomId, p2);
    expect(view(b1).vote).toMatchObject({ options, votes: { [p1.sessionId]: options[0] } });
    send(b2, "vote", { id: options[0] });
    expect(view(b1)).toMatchObject({ phase: "playing", gameId: options[0], vote: null });
  });

  test("głosowanie bez kompletu głosów kończy się po restarcie samo", async () => {
    const { roomId, p1, p2 } = await stoperOver();
    send(p1, "otherGame");
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    await back(roomId, p2);
    await tick(10_000);
    expect(view(b1)).toMatchObject({ phase: "playing", vote: null });
  });

  test("turniej między grami: po restarcie rusza następna gra, punkty turnieju zostają", async () => {
    const { roomId, seats: [p1, p2, p3] } = await open(3);
    send(p1, "quickSeries");
    expect(view(p1)).toMatchObject({ phase: "playing", tournament: { index: 0 } });
    // Wyjście jednego gracza kończy bieżącą grę bez punktów, turniej trwa.
    p3.socket.drop(CloseCode.CONSENTED);
    await tick();
    expect(view(p1).phase).toBe("over");
    const tournament = view(p1).tournament!;
    await restart([roomId], [p1, p2]);
    const b1 = await back(roomId, p1);
    await back(roomId, p2);
    expect(view(b1)).toMatchObject({ phase: "over", tournament });
    await tick(15_000);
    expect(view(b1)).toMatchObject({ phase: "playing", tournament: { games: tournament.games }, game: { intro: true } });
    expect(view(b1).gameId).toBe(tournament.games[tournament.index]);
  });

  test("lobby: wybrana gra, tryb, gotowość, kolory i życzenia wracają; nowa osoba wchodzi kodem", async () => {
    const { roomId, seats: [p1, p2, p3] } = await open(3);
    send(p1, "pickGame", { gameId: "chinczyk" });
    send(p1, "pickMode", { mode: GAMES.chinczyk.modes![1].id });
    send(p3, "wish", { id: "memory" });
    send(p2, "ready", { ready: true });
    const taken = view(p1).players.map((p) => p.color);
    send(p3, "pickColor", { color: PLAYER_COLORS.find((c) => !taken.includes(c)) });
    const before = view(p1);
    expect(before).toMatchObject({ gameId: "chinczyk", mode: GAMES.chinczyk.modes![1].id, wishes: { [p3.sessionId]: "memory" } });
    expect(player(before, p3).color).not.toBe(taken[2]);
    await restart([roomId], [p1, p2, p3]);
    const b1 = await back(roomId, p1);
    await back(roomId, p2);
    await back(roomId, p3);
    expect(stable(view(b1))).toEqual(stable(before));
    const next = await matchMaker.joinById(roomId, { nick: "p4" }, context);
    const p4 = await connect(roomId, next.sessionId);
    expect(ids(view(p4))).toHaveLength(4);
  });

  test("gospodarz wyrzuca gracza, który po restarcie nie wrócił: miejsce wolne, token nieważny", async () => {
    const { roomId, seats } = await open(6);
    await restart([roomId], seats);
    const b1 = await back(roomId, seats[0]);
    await expect(matchMaker.joinById(roomId, { nick: "p7" }, context)).rejects.toThrow();
    send(b1, "kick", { id: seats[5].sessionId });
    await tick();
    expect(ids(view(b1))).toHaveLength(5);
    await expect(matchMaker.reconnect(roomId, { reconnectionToken: seats[5].token })).rejects.toThrow();
    const next = await matchMaker.joinById(roomId, { nick: "p7" }, context);
    expect(ids(view(await connect(roomId, next.sessionId)))).toHaveLength(6);
  });

  test("liczba osób w pokoju dla ekranu głównego zgadza się po restarcie i po wyjściu", async () => {
    const { roomId, seats: [p1, p2] } = await open(2);
    await restart([roomId], [p1, p2]);
    expect((await matchMaker.query({ roomId }))[0].clients).toBe(2);
    await back(roomId, p1);
    const b2 = await back(roomId, p2);
    expect((await matchMaker.query({ roomId }))[0].clients).toBe(2);
    b2.socket.drop(CloseCode.CONSENTED);
    await tick();
    expect((await matchMaker.query({ roomId }))[0].clients).toBe(1);
  });
});

describe("granice odtwarzania", () => {
  test("limit pokoi na IP przeżywa restart", async () => {
    const who = ip("10.0.0.7");
    const opened = [await open(1, who), await open(1, who), await open(1, who)];
    expect(await restart(opened.map((o) => o.roomId), opened.flatMap((o) => o.seats))).toBe(3);
    const fourth = await matchMaker.create("lobby", { nick: "p1" }, who);
    await expect(connect(fourth.roomId, fourth.sessionId, undefined, who)).rejects.toThrow(/za dużo pokoi/);
  });

  test("zapis starszy niż godzina przepada, a każdy zapis odtwarza się tylko raz", async () => {
    const old = await gomoku();
    await restart([old.roomId], [old.p1, old.p2], 61 * 60_000);
    expect(room(old.roomId)).toBeUndefined();

    const fresh = await gomoku();
    expect(await restart([fresh.roomId], [fresh.p1, fresh.p2])).toBe(1);
    expect(await restoreRooms()).toBe(0);
  });

  test("zepsuty zapis jednego pokoju nie blokuje pozostałych", async () => {
    const { roomId, p1, p2 } = await gomoku();
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const seat of [p1, p2]) seat.token = seat.client.reconnectionToken;
    saveRooms();
    stats.saveRoom("AAAA", "{to nie jest JSON");
    stats.saveRoom("ZZZZ", JSON.stringify({ v: 999 }));
    room(roomId).onBeforeShutdown();
    await tick(100);
    expect(await restoreRooms()).toBe(1);
    expect(room("AAAA")).toBeUndefined();
    expect(room("ZZZZ")).toBeUndefined();
    expect(view(await back(roomId, p1)).phase).toBe("playing");
  });

  test("zmieniony kształt stanu gry (stateVersion): partia przepada, pokój wraca do lobby z punktami wieczoru", async () => {
    const first = await stoperOver();
    send(first.p1, "rematch");
    send(first.p2, "rematch");
    expect(view(first.p1).phase).toBe("playing");
    const evening = view(first.p1).evening;
    const game = GAMES.stoper as { stateVersion?: number };
    await restart([first.roomId], [first.p1, first.p2]);
    const b1 = await back(first.roomId, first.p1);
    const b2 = await back(first.roomId, first.p2);
    expect(view(b1).phase, "ta sama wersja: partia wraca").toBe("playing");

    for (const seat of [b1, b2]) seat.token = seat.client.reconnectionToken;
    saveRooms();
    room(first.roomId).onBeforeShutdown();
    await tick(100);
    expect(game.stateVersion, "test zakłada grę bez podbitej wersji").toBeUndefined();
    game.stateVersion = 1;
    try {
      expect(await restoreRooms()).toBe(1);
    } finally {
      delete game.stateVersion;
    }
    const c1 = await back(first.roomId, b1);
    expect(view(c1)).toMatchObject({ phase: "lobby", game: null, evening, scores: { [first.p1.sessionId]: 1 } });
  });

  test("stan gry, którego gra nie umie już pokazać, nie psuje pokoju: lobby zamiast partii", async () => {
    const { roomId, p1, p2 } = await gomoku();
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const seat of [p1, p2]) seat.token = seat.client.reconnectionToken;
    saveRooms();
    room(roomId).onBeforeShutdown();
    await tick(100);
    const broken = vi.spyOn(GAMES["piec-w-rzedzie"], "playerView").mockImplementation(() => {
      throw new Error("stary stan");
    });
    expect(await restoreRooms()).toBe(1);
    broken.mockRestore();
    expect(view(await back(roomId, p1))).toMatchObject({ phase: "lobby", game: null });
  });

  test("opcja `restore` od klienta nic nie odtwarza: powstaje zwykły nowy pokój", async () => {
    const { roomId, p1, p2 } = await gomoku();
    const made = await matchMaker.create("lobby", { nick: "obcy", restore: roomId }, context);
    expect(made.roomId).not.toBe(roomId);
    const stranger = await connect(made.roomId, made.sessionId);
    expect(view(stranger)).toMatchObject({ phase: "lobby", players: [{ nick: "obcy" }] });
    expect(ids(view(p1))).toEqual([p1.sessionId, p2.sessionId]);
  });
});

describe("punkt kontrolny: zapis także bez zamknięcia serwera (awaria, brak prądu)", () => {
  test("zmiana w pokoju trafia do bazy najpóźniej po 5 s, a seria zmian to jeden zapis", async () => {
    const save = vi.spyOn(stats, "saveRoom");
    const { roomId, p1, p2 } = await gomoku();
    save.mockClear();
    send(p1, "move", { x: 7, y: 7 });
    send(p2, "move", { x: 8, y: 8 });
    send(p1, "move", { x: 7, y: 8 });
    await tick(5000);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toBe(roomId);
    const saved = JSON.parse(save.mock.calls[0][1]) as { match: { state: unknown } };
    expect(JSON.stringify(saved.match.state)).toContain(p1.sessionId);
    await tick(60_000 - 5000 - 1);
    expect(save, "bez zmian nie ma kolejnych zapisów").toHaveBeenCalledTimes(1);
  });

  test("po awarii pokój odtwarza się z punktu kontrolnego", async () => {
    const { roomId, p1, p2 } = await gomoku();
    send(p1, "move", { x: 7, y: 7 });
    await tick(5000);
    for (const seat of [p1, p2]) seat.token = seat.client.reconnectionToken;
    // Awaria: proces ginie bez saveRooms. W teście pokój znika z pamięci, a jego zapis zostaje, jak po śmierci procesu.
    const rows = stats.takeRooms(0);
    expect(rows.map((r) => r.code)).toEqual([roomId]);
    room(roomId).onBeforeShutdown();
    await tick(100);
    for (const row of rows) stats.saveRoom(row.code, row.json);
    expect(await restoreRooms()).toBe(1);
    const b2 = await back(roomId, p2);
    expect(view(b2).game!.waitingFor).toEqual([p2.sessionId]);
  });

  test("pokój zamknięty zwyczajnie (wszyscy wyszli) kasuje swój zapis", async () => {
    const { roomId, seats: [p1] } = await open(1);
    await tick(5000);
    p1.socket.drop(CloseCode.CONSENTED);
    await tick(2000);
    expect(room(roomId)).toBeUndefined();
    expect(stats.takeRooms(0)).toEqual([]);
  });
});

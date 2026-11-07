import { type AuthContext, type Client, CloseCode } from "@colyseus/core";
import { GAMES, KALAMBURY_HALF_SECONDS, type KalamburyView, type PodrobkaMove, type PodrobkaView, type RoomView, type SabotazKind, type SabotazMove, type SabotazView, type WyprawaMove, type WyprawaView, type ZakupyView } from "@kwadrans/games";
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

describe("07-21: życzenia gości", () => {
  test("gość wskazuje grę, zmienia ją, null kasuje; każdy ma jedno życzenie", async () => {
    const { send, snapshot } = await openRoom(3);
    expect(snapshot().wishes).toEqual({});
    send(1, "wish", { id: "kampus-tour" });
    send(2, "wish", { id: "stoper" });
    expect(snapshot().wishes).toEqual({ p2: "kampus-tour", p3: "stoper" });
    send(1, "wish", { id: "memory" });
    expect(snapshot().wishes).toEqual({ p2: "memory", p3: "stoper" });
    send(1, "wish", { id: null });
    expect(snapshot().wishes).toEqual({ p3: "stoper" });
  });

  test("gospodarz wybiera sam: jego życzenie nic nie robi; gra spoza GAMES odpada", async () => {
    const { send, snapshot } = await openRoom(2);
    send(0, "wish", { id: "stoper" });
    send(1, "wish", { id: "nie-ma-takiej" });
    send(1, "wish", { nope: 1 });
    expect(snapshot().wishes).toEqual({});
  });

  test("poza lobby życzenia nic nie robią", async () => {
    const { send, snapshot } = await drawing(2, "stoper");
    send(1, "wish", { id: "memory" });
    expect(snapshot().wishes).toEqual({});
    for (let i = 0; i < 2; i++) send(i, "move", { type: "result", deviation: 100 + i });
    expect(snapshot().phase).toBe("over");
    send(1, "wish", { id: "memory" });
    expect(snapshot().wishes).toEqual({});
  });

  test("start, pickGame i Szybka seria czyszczą życzenia", async () => {
    const a = await openRoom(2);
    a.send(1, "wish", { id: "stoper" });
    a.send(0, "pickGame", { gameId: "stoper" });
    expect(a.snapshot().wishes).toEqual({});

    const b = await openRoom(2);
    b.send(0, "pickGame", { gameId: "stoper" });
    b.send(1, "wish", { id: "memory" });
    expect(b.snapshot().wishes).toEqual({ p2: "memory" });
    // openRoom(2) dodaje trzeciego uczestnika, który też dostaje miejsce w mini-grze.
    b.send(1, "ready", { ready: true });
    b.send(2, "ready", { ready: true });
    b.send(0, "start", {});
    expect(b.snapshot()).toMatchObject({ phase: "playing", wishes: {} });

    const c = await openRoom(2);
    c.send(1, "wish", { id: "stoper" });
    c.send(0, "quickSeries", {});
    expect(c.snapshot().wishes).toEqual({});
  });

  test("wyjście gracza zabiera jego życzenie", async () => {
    const { room, send, snapshot, clients } = await openRoom(3);
    send(1, "wish", { id: "stoper" });
    send(2, "wish", { id: "memory" });
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(snapshot().wishes).toEqual({ p3: "memory" });
  });

  test("po powrocie do lobby nie ma starych życzeń", async () => {
    const { send, snapshot } = await openRoom(2);
    send(0, "pickGame", { gameId: "stoper" });
    send(1, "ready", { ready: true });
    send(0, "start", {});
    for (let i = 0; i < 2; i++) send(i, "begin", {});
    vi.advanceTimersByTime(3000);
    for (let i = 0; i < 2; i++) send(i, "move", { type: "result", deviation: 100 + i });
    send(0, "toLobby", {});
    expect(snapshot()).toMatchObject({ phase: "lobby", wishes: {} });
  });
});

describe("07-19: głosowanie Inna gra", () => {
  const saved = { ...GAMES };
  afterEach(() => {
    for (const id of Object.keys(GAMES)) delete GAMES[id];
    Object.assign(GAMES, saved);
  });
  /** Zawęża katalog, żeby losowanie opcji nie decydowało o przebiegu testu. */
  const onlyGames = (keep: (id: string) => boolean) => {
    for (const id of Object.keys(GAMES)) if (!keep(id)) delete GAMES[id];
  };
  const minisOnly = () => onlyGames((id) => saved[id].minPlayers === 1);
  const mainsOnly = () => onlyGames((id) => id === "stoper" || saved[id].minPlayers > 1);

  /** Skończona partia stopera: n grających, ostatni klient to obserwator (gdy jest miejsce). */
  async function over(n = 2) {
    const room = await drawing(n, "stoper");
    for (let i = 0; i < n; i++) room.send(i, "move", { type: "result", deviation: 100 + i });
    expect(room.snapshot().phase).toBe("over");
    return room;
  }
  async function voting(n = 2) {
    const room = await over(n);
    room.send(0, "otherGame", {});
    expect(room.snapshot().vote).not.toBeNull();
    return room;
  }

  test("po partii startuje głosowanie: 3 opcje bez bieżącej gry, 10 s, widzi je też obserwator", async () => {
    const { snapshot, observer } = await voting();
    const { vote, phase } = snapshot();
    expect(phase).toBe("over");
    expect(vote!.options).toHaveLength(3);
    expect(vote!.options).not.toContain("stoper");
    expect(vote!.votes).toEqual({});
    expect(vote!.msLeft).toBe(10_000);
    expect(snapshot(observer).vote).toEqual(vote);
  });

  test("przed głosowaniem pole vote jest null; obserwator ani ponowne otherGame niczego nie zmieniają", async () => {
    const { send, snapshot, observer } = await over();
    expect(snapshot().vote).toBeNull();
    send(observer!, "otherGame", {});
    expect(snapshot().vote).toBeNull();
    send(1, "otherGame", {});
    const options = snapshot().vote!.options;
    vi.advanceTimersByTime(4000);
    send(0, "otherGame", {});
    expect(snapshot().vote!.options).toEqual(options);
    expect(snapshot().vote!.msLeft).toBe(6000);
  });

  test("poza końcem partii otherGame nic nie robi", async () => {
    const lobby = await openRoom(2);
    lobby.send(0, "otherGame", {});
    expect(lobby.snapshot()).toMatchObject({ phase: "lobby", vote: null });
    const playing = await drawing(2, "stoper");
    playing.send(0, "otherGame", {});
    expect(playing.snapshot()).toMatchObject({ phase: "playing", vote: null });
  });

  test("komplet głosów: start od razu w mini-grze z pełną instrukcją, timer głosowania zgaszony", async () => {
    minisOnly();
    const { send, snapshot } = await voting();
    const { options } = snapshot().vote!;
    send(0, "vote", { id: options[1] });
    expect(snapshot().phase).toBe("over");
    expect(snapshot().vote!.votes).toEqual({ p1: options[1] });
    send(1, "vote", { id: options[1] });
    const view = snapshot();
    expect(view).toMatchObject({ phase: "playing", gameId: options[1], vote: null, seats: ["p1", "p2"], mode: null });
    expect(view.game).toMatchObject({ intro: true, countdown: false, skipIntro: false, msLeft: 15_000 });
    const match = view.game;
    vi.advanceTimersByTime(10_000);
    // Sam upływ czasu nic nie wysyła: dowolna wiadomość odświeża widok.
    send(0, "otherGame", {});
    expect(snapshot()).toMatchObject({ phase: "playing", gameId: options[1], vote: null });
    expect(snapshot().game!.msLeft).toBe(match!.msLeft! - 10_000);
  });

  test("gra główna rusza bez instrukcji, w trybie domyślnym", async () => {
    onlyGames((id) => id === "stoper" || id === "statki");
    const { send, snapshot } = await voting();
    expect(snapshot().vote!.options).toEqual(["statki"]);
    send(0, "vote", { id: "statki" });
    send(1, "vote", { id: "statki" });
    const def = saved.statki;
    expect(snapshot()).toMatchObject({ phase: "playing", gameId: "statki", mode: (def.modes!.find((m) => m.default) ?? def.modes![0]).id });
    expect(snapshot().game!.intro).toBe(false);
  });

  test("brak głosów po 10 s: losowo z opcji", async () => {
    const { snapshot } = await voting();
    const { options } = snapshot().vote!;
    vi.advanceTimersByTime(9999);
    expect(snapshot().phase).toBe("over");
    vi.advanceTimersByTime(1);
    expect(snapshot()).toMatchObject({ phase: "playing", vote: null });
    expect(options).toContain(snapshot().gameId);
  });

  test("po czasie liczą się oddane głosy; remis rozstrzyga rng między remisującymi", async () => {
    const one = await voting();
    const [a] = one.snapshot().vote!.options;
    one.send(0, "vote", { id: a });
    vi.advanceTimersByTime(10_000);
    expect(one.snapshot().gameId).toBe(a);

    const two = await voting();
    const [x, y] = two.snapshot().vote!.options;
    two.send(0, "vote", { id: x });
    two.send(1, "vote", { id: y });
    expect([x, y]).toContain(two.snapshot().gameId);
    expect(two.snapshot().phase).toBe("playing");
  });

  test("zmiana głosu: liczy się ostatni", async () => {
    const { send, snapshot } = await voting(3);
    const [a, b] = snapshot().vote!.options;
    send(0, "vote", { id: a });
    send(1, "vote", { id: a });
    send(0, "vote", { id: b });
    send(1, "vote", { id: b });
    expect(snapshot().vote!.votes).toEqual({ p1: b, p2: b });
    send(2, "vote", { id: a });
    expect(snapshot().gameId).toBe(b);
  });

  test("głos obserwatora, spoza opcji albo o złym kształcie jest odrzucany", async () => {
    const { send, snapshot, observer } = await voting();
    const { options } = snapshot().vote!;
    send(observer!, "vote", { id: options[0] });
    send(0, "vote", { id: "stoper" });
    send(0, "vote", { id: "nie-ma-takiej" });
    send(0, "vote", { nope: 1 });
    expect(snapshot().vote!.votes).toEqual({});
  });

  test("vote poza głosowaniem nic nie robi", async () => {
    const { send, snapshot } = await over();
    send(0, "vote", { id: "refleks" });
    expect(snapshot()).toMatchObject({ phase: "over", vote: null });
  });

  test("rematch w trakcie głosowania jest ignorowany, wcześniejsza zgoda przepada", async () => {
    const { send, snapshot } = await over();
    send(0, "rematch", {});
    send(1, "otherGame", {});
    expect(snapshot().players.every((p) => !p.ready)).toBe(true);
    send(0, "rematch", {});
    send(1, "rematch", {});
    expect(snapshot()).toMatchObject({ phase: "over", gameId: "stoper" });
    expect(snapshot().vote).not.toBeNull();
    expect(snapshot().players.every((p) => !p.ready)).toBe(true);
  });

  test("pokój solo: otherGame nic nie robi", async () => {
    const { send, snapshot } = await openRoom(1, { solo: "stoper" });
    send(0, "begin", {});
    send(0, "move", { type: "result", deviation: 100 });
    expect(snapshot().phase).toBe("over");
    send(0, "otherGame", {});
    expect(snapshot().vote).toBeNull();
  });

  const tournament = async () => {
    const room = await openRoom(2);
    room.send(0, "pickTournament", { length: 3 });
    room.send(0, "toggleSeat", { id: "p3" });
    room.send(1, "ready", { ready: true });
    room.send(0, "start", {});
    return room;
  };

  test("trwający turniej: otherGame nic nie robi", async () => {
    const { send, snapshot } = await tournament();
    for (let i = 0; i < 600 && snapshot().phase !== "over"; i++) vi.advanceTimersByTime(1000);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().tournament!.index).toBeLessThan(snapshot().tournament!.games.length);
    send(0, "otherGame", {});
    expect(snapshot().vote).toBeNull();
  });

  test("po skończonym turnieju głosowanie działa, a tournament jest null przed startem nowej gry", async () => {
    const { send, snapshot } = await tournament();
    vi.advanceTimersByTime(30 * 60_000);
    expect(snapshot().phase).toBe("over");
    expect(snapshot().tournament).not.toBeNull();
    send(0, "otherGame", {});
    expect(snapshot().tournament).not.toBeNull();
    const [id] = snapshot().vote!.options;
    send(0, "vote", { id });
    send(1, "vote", { id });
    expect(snapshot()).toMatchObject({ phase: "playing", gameId: id, tournament: null, vote: null });
  });

  test("wyjście gracza, gdy pozostali zagłosowali: rozstrzygnięcie", async () => {
    const { room, send, snapshot, clients } = await voting(3);
    const [a] = snapshot().vote!.options;
    send(0, "vote", { id: a });
    send(1, "vote", { id: a });
    await room.onLeave(clients[2], CloseCode.CONSENTED);
    expect(snapshot()).toMatchObject({ phase: "playing", gameId: a, vote: null, seats: ["p1", "p2"] });
  });

  test("wyjście gracza kasuje jego głos; wyjście obserwatora niczego nie rozstrzyga", async () => {
    const { room, send, snapshot, clients, observer } = await voting(3);
    const [a] = snapshot().vote!.options;
    send(0, "vote", { id: a });
    send(1, "vote", { id: a });
    await room.onLeave(clients[observer!], CloseCode.CONSENTED);
    expect(snapshot().phase).toBe("over");
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(snapshot().vote!.votes).toEqual({ p1: a });
  });

  test("za mało osób na wszystkie opcje: lobby, timer zgaszony", async () => {
    mainsOnly();
    const { room, snapshot, clients } = await voting();
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(snapshot()).toMatchObject({ phase: "lobby", vote: null, game: null });
    vi.advanceTimersByTime(10_000);
    expect(snapshot()).toMatchObject({ phase: "lobby", vote: null, game: null });
  });

  test("za mało osób na część opcji: odpadają tylko one, razem z głosami na nie", async () => {
    onlyGames((id) => ["stoper", "statki", "refleks", "stroop"].includes(id));
    const { room, send, snapshot, clients } = await voting();
    expect(snapshot().vote!.options).toContain("statki");
    send(0, "vote", { id: "statki" });
    await room.onLeave(clients[1], CloseCode.CONSENTED);
    expect(snapshot().vote!.options.sort()).toEqual(["refleks", "stroop"]);
    expect(snapshot().vote!.votes).toEqual({});
    expect(snapshot().phase).toBe("over");
  });

  test("toLobby od gospodarza gasi głosowanie, od gościa nic nie robi", async () => {
    const { send, snapshot } = await voting();
    const vote = snapshot().vote;
    send(1, "toLobby", {});
    expect(snapshot()).toMatchObject({ phase: "over", vote });
    send(0, "toLobby", {});
    expect(snapshot()).toMatchObject({ phase: "lobby", vote: null });
    vi.advanceTimersByTime(10_000);
    expect(snapshot()).toMatchObject({ phase: "lobby", vote: null, game: null });
  });

  test("toLobby od gościa po zwykłej partii nic nie robi", async () => {
    const { send, snapshot } = await over();
    send(1, "toLobby", {});
    expect(snapshot().phase).toBe("over");
    send(0, "toLobby", {});
    expect(snapshot().phase).toBe("lobby");
  });

  test("gospodarz wyszedł: nowy gospodarz, głosowanie trwa", async () => {
    const { room, send, snapshot, clients } = await voting(3);
    const vote = snapshot(1).vote!;
    await room.onLeave(clients[0], CloseCode.CONSENTED);
    expect(snapshot(1).hostId).toBe("p2");
    // Sabotaż (od 3 osób) mógł trafić do opcji przy trzech; dla dwóch zostaje reszta bez zmian.
    const left = vote.options.filter((id) => GAMES[id].minPlayers <= 2);
    expect(snapshot(1).vote!.options).toEqual(left);
    send(1, "vote", { id: left[0] });
    send(2, "vote", { id: left[0] });
    expect(snapshot(1)).toMatchObject({ phase: "playing", gameId: left[0], vote: null });
  });

  test("po wyjściu do dwóch osób Sabotaż (od 3 osób) znika z opcji głosowania", async () => {
    // Bez zależności od losowania: szukamy głosowania, w którym Sabotaż wypadł.
    for (let attempt = 0; attempt < 200; attempt++) {
      const { room, snapshot, clients } = await voting(3);
      const vote = snapshot(1).vote!;
      if (!vote.options.includes("sabotaz")) continue;
      await room.onLeave(clients[2], CloseCode.CONSENTED);
      expect(snapshot(1).vote!.options).not.toContain("sabotaz");
      expect(snapshot(1).vote!.options).toEqual(vote.options.filter((id) => id !== "sabotaz"));
      return;
    }
    throw new Error("w 200 głosowaniach Sabotaż ani razu nie wypadł");
  });

  test("toLobby przerywa głosowanie po turnieju tak jak zwykły powrót", async () => {
    const { send, snapshot } = await tournament();
    vi.advanceTimersByTime(30 * 60_000);
    send(1, "otherGame", {});
    send(0, "toLobby", {});
    expect(snapshot()).toMatchObject({ phase: "lobby", vote: null, tournament: { games: [] } });
  });
});

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

describe("11-03: Sabotaż w pokoju", () => {
  type OpenRoom = Awaited<ReturnType<typeof drawing>>;

  const MAX_PAYLOAD = 32 * 1024;
  /** Wartość "trap", a nie klucz liczności `"trap":1` we własnej ręce. */
  const TRAP_CARD = /"trap"(?!:)/;
  const index = (id: string) => Number(id.slice(1)) - 1;

  const open = (n: number) => drawing(n, "sabotaz", false);
  const viewOf = (r: OpenRoom, player = 0) => r.snapshot(player).game!.view as SabotazView;
  const stamp = (r: OpenRoom) => ({ nonce: viewOf(r).nonce, round: viewOf(r).round });
  const decided = (r: OpenRoom) => ({ ...stamp(r), decision: viewOf(r).decision });
  /** Termin na teraz: ostatnia wysłana wiadomość pokazuje stan z chwili wysłania. */
  const msLeft = (r: OpenRoom) => r.room["viewFor"]("p1").game!.msLeft;
  const waiting = (r: OpenRoom) => r.snapshot().game!.waitingFor;

  /** Ruch z odstępem poniżej limitu 10 wiadomości/s, żeby limit nie udawał błędu zasad. */
  function paced(r: OpenRoom, player: string, move: SabotazMove) {
    vi.advanceTimersByTime(110);
    r.send(index(player), "move", move);
  }
  const initials = (r: OpenRoom, kinds: Record<string, SabotazKind> = {}) => {
    for (const p of viewOf(r).players) paced(r, p, { type: "place", kind: kinds[p] ?? "safe", ...stamp(r) });
  };
  const place = (r: OpenRoom, kind: SabotazKind = "safe") => paced(r, viewOf(r).turn!, { type: "place", kind, ...decided(r) });
  const bid = (r: OpenRoom, amount: number) => paced(r, viewOf(r).turn!, { type: "bid", amount, ...decided(r) });
  const passAll = (r: OpenRoom) => {
    while (viewOf(r).phase === "bid") paced(r, viewOf(r).turn!, { type: "pass", ...decided(r) });
  };
  const reveal = (r: OpenRoom, owner: string) => paced(r, viewOf(r).leader!, { type: "reveal", owner, ...decided(r) });
  const nextAll = (r: OpenRoom) => {
    for (const p of waiting(r)) paced(r, p, { type: "next", ...stamp(r) });
  };
  /** Od pierwszych kart do rozstrzygnięcia: same Przejścia, sukces `winner`. */
  function win(r: OpenRoom, winner: string) {
    initials(r);
    bid(r, 1);
    while (viewOf(r).phase === "bid") {
      if (viewOf(r).turn === winner) bid(r, 2);
      else paced(r, viewOf(r).turn!, { type: "pass", ...decided(r) });
    }
    while (viewOf(r).phase === "reveal") reveal(r, viewOf(r).players.find((p) => p !== viewOf(r).leader && viewOf(r).stackSizes[p] > 0)!);
  }
  function playAll(r: OpenRoom, winners: string[]) {
    winners.forEach((winner, round) => {
      win(r, winner);
      if (round < winners.length - 1) nextAll(r);
    });
  }
  /** Stosy po dwie karty, p1 deklaruje `amount`, pozostali pasują. */
  function toReveal(r: OpenRoom, amount: number, kinds: Record<string, SabotazKind> = {}) {
    initials(r, kinds);
    for (let i = 0; i < viewOf(r).players.length; i++) place(r);
    bid(r, amount);
    passAll(r);
  }
  const roomMessages = (r: OpenRoom, player: number) =>
    vi.mocked(r.clients[player].send).mock.calls.filter(([type]) => type === "room").map(([, message]) => message as RoomView);

  describe("termin", () => {
    test("częściowe pierwsze karty nie odnawiają wspólnego terminu, nowa faza ma własne 60 s", async () => {
      const r = await open(3);
      expect(msLeft(r)).toBe(30_000);
      vi.advanceTimersByTime(5000);
      r.send(0, "move", { type: "place", kind: "trap", ...stamp(r) });
      expect(msLeft(r)).toBe(25_000);
      expect(waiting(r)).toEqual(["p2", "p3"]);
      vi.advanceTimersByTime(5000);
      r.send(1, "move", { type: "place", kind: "safe", ...stamp(r) });
      expect(msLeft(r)).toBe(20_000);
      vi.advanceTimersByTime(1000);
      r.send(2, "move", { type: "place", kind: "safe", ...stamp(r) });
      expect(viewOf(r).phase).toBe("place");
      expect(msLeft(r)).toBe(60_000);
    });

    test("częściowe dalej nie odnawia wspólnego terminu odsłony, nowa runda ma własne 30 s", async () => {
      const r = await open(3);
      win(r, "p1");
      expect(viewOf(r).phase).toBe("summary");
      expect(msLeft(r)).toBe(15_000);
      vi.advanceTimersByTime(3000);
      r.send(0, "move", { type: "next", ...stamp(r) });
      expect(msLeft(r)).toBe(12_000);
      vi.advanceTimersByTime(3000);
      r.send(1, "move", { type: "next", ...stamp(r) });
      expect(msLeft(r)).toBe(9000);
      r.send(2, "move", { type: "next", ...stamp(r) });
      expect(viewOf(r).round).toBe(1);
      expect(msLeft(r)).toBe(30_000);
    });

    test("każde kolejne odkrycie tej samej osoby dostaje nowe 60 s", async () => {
      const r = await open(3);
      toReveal(r, 5);
      expect(viewOf(r).phase).toBe("reveal");
      expect(msLeft(r)).toBe(60_000);
      for (const owner of ["p2", "p3"]) {
        vi.advanceTimersByTime(10_000);
        expect(msLeft(r)).toBe(50_000);
        r.send(0, "move", { type: "reveal", owner, ...decided(r) });
        expect(waiting(r)).toEqual(["p1"]);
        expect(msLeft(r)).toBe(60_000);
      }
    });
  });

  describe("zegar", () => {
    test("po limicie pierwszych kart gra tylko za oczekujących, a nowa faza zachowuje pełny własny termin", async () => {
      const r = await open(3);
      r.send(0, "move", { type: "place", kind: "trap", ...stamp(r) });
      vi.advanceTimersByTime(30_000);
      expect(viewOf(r).phase).toBe("place");
      expect(viewOf(r, 0).me?.stack).toEqual(["trap"]);
      expect(viewOf(r, 1).me?.stack).toEqual(["safe"]);
      expect(viewOf(r, 2).me?.stack).toEqual(["safe"]);
      expect(msLeft(r)).toBe(60_000);
      vi.advanceTimersByTime(59_999);
      expect(viewOf(r).decision).toBe(0);
      vi.advanceTimersByTime(1);
      expect(viewOf(r)).toMatchObject({ phase: "bid", leader: "p1", bid: 1, decision: 1 });
    });

    test("cała runda samym zegarem: stary callback nie zużywa nowej rundy", async () => {
      const r = await open(3);
      vi.advanceTimersByTime(30_000 + 60_000 * 3);
      expect(viewOf(r).phase).toBe("summary");
      expect(viewOf(r).history[0]).toMatchObject({ outcome: "success", leader: "p1", bid: 1 });
      expect(msLeft(r)).toBe(15_000);
      vi.advanceTimersByTime(15_000);
      expect(viewOf(r)).toMatchObject({ phase: "initial", round: 1, ready: [] });
      expect(viewOf(r, 1).me).toEqual({ hand: { safe: 3, trap: 1 }, stack: [] });
      expect(msLeft(r)).toBe(30_000);
    });

    test("po limicie odkrywania odsłania legalny cudzy stos i daje nowy termin", async () => {
      const r = await open(3);
      toReveal(r, 5);
      const before = viewOf(r).reveals.length;
      vi.advanceTimersByTime(60_000);
      expect(viewOf(r).reveals).toHaveLength(before + 1);
      expect(viewOf(r).reveals.at(-1)!.owner).not.toBe("p1");
      expect(msLeft(r)).toBe(60_000);
    });

    test("duplikat ze starej decyzji niczego nie zmienia, także terminu", async () => {
      const r = await open(3);
      initials(r);
      const stale: SabotazMove = { type: "place", kind: "safe", ...decided(r) };
      r.send(0, "move", stale);
      vi.advanceTimersByTime(5000);
      const before = viewOf(r);
      r.send(0, "move", stale);
      r.send(1, "move", stale);
      expect(viewOf(r)).toEqual(before);
      expect(msLeft(r)).toBe(55_000);
    });
  });

  describe("poufność wiadomości room", () => {
    /** p1 ma zakrytą Pułapkę, a p2 prowadzi próbę. Zwraca stan w fazie odkrywania. */
    async function hiddenTrap() {
      const r = await open(3);
      initials(r, { p1: "trap" });
      bid(r, 1);
      bid(r, 2);
      paced(r, viewOf(r).turn!, { type: "pass", ...decided(r) });
      paced(r, viewOf(r).turn!, { type: "pass", ...decided(r) });
      expect(viewOf(r)).toMatchObject({ phase: "reveal", leader: "p2" });
      return r;
    }

    test("rywale i obserwator w żadnej wiadomości nie dostają cudzej zakrytej karty", async () => {
      const r = await hiddenTrap();
      expect(r.observer).toBe(3);
      for (const player of [1, 2, r.observer!]) {
        const messages = roomMessages(r, player);
        expect(messages.length).toBeGreaterThan(5);
        for (const message of messages) expect(JSON.stringify(message)).not.toMatch(TRAP_CARD);
      }
      // Kontrola wzorca: właściciel widzi w wiadomości własną kartę.
      expect(JSON.stringify(roomMessages(r, 0).at(-1))).toMatch(TRAP_CARD);
      expect(viewOf(r, r.observer!).me).toBeNull();
      expect(viewOf(r, 1).me?.hand).toEqual({ safe: 2, trap: 1 });
    });

    test("odsłona ujawnia zakończoną rundę wszystkim, także obserwatorowi", async () => {
      const r = await hiddenTrap();
      reveal(r, "p1");
      expect(viewOf(r).phase).toBe("summary");
      for (const player of [0, 1, 2, r.observer!]) {
        expect(viewOf(r, player).history[0]).toMatchObject({ outcome: "foreign-trap", trapOwner: "p1" });
        expect(viewOf(r, player).history[0].stacks.p1).toEqual(["trap"]);
      }
      expect(viewOf(r).totals).toEqual({ p1: 1, p2: 0, p3: 0 });
    });

    test("historia zakończonej rundy jest jawna, a bieżąca runda pozostaje tajna", async () => {
      const r = await open(3);
      win(r, "p1");
      nextAll(r);
      initials(r, { p2: "trap" });
      expect(viewOf(r).phase).toBe("place");
      for (const player of [0, 2, r.observer!]) {
        const { history, ...current } = viewOf(r, player);
        expect(history).toHaveLength(1);
        expect(JSON.stringify(current)).not.toMatch(TRAP_CARD);
        expect(history[0].stacks).toEqual({ p1: ["safe"], p2: ["safe"], p3: ["safe"] });
      }
      expect(viewOf(r, 1).me?.stack).toEqual(["trap"]);
    });

    test("po końcu partii każdy widzi pełną historię sześciu rund", async () => {
      const r = await open(3);
      playAll(r, ["p1", "p2", "p3", "p1", "p2", "p3"]);
      expect(r.snapshot().phase).toBe("over");
      for (const player of [0, 1, 2, r.observer!]) expect(viewOf(r, player).history).toHaveLength(6);
    });

    test("6 graczy bez siódmego połączenia: viewFor osoby spoza miejsc to widok obserwatora", async () => {
      const r = await open(6);
      expect(r.observer).toBeUndefined();
      expect(r.clients).toHaveLength(6);
      initials(r, { p1: "trap", p2: "trap" });
      const outsider = r.room["viewFor"]("kibic");
      const view = outsider.game!.view as SabotazView;
      expect(view.me).toBeNull();
      expect(view.players).toHaveLength(6);
      expect(JSON.stringify(outsider)).not.toMatch(TRAP_CARD);
      expect(viewOf(r, 0).me?.stack).toEqual(["trap"]);
    });
  });

  test("największa wiadomość room: 6 osób i 6 najdłuższych rund mieści się w 32 KB", async () => {
    const r = await open(6);
    for (let round = 0; round < 6; round++) {
      const players = viewOf(r).players;
      // Lider rusza ostatni i zostawia Pułapkę w ręce, reszta kładzie ją na spód: 23 karty i 19 odkryć, najwięcej możliwe.
      const leader = players[(round + 5) % 6];
      initials(r, Object.fromEntries(players.map((p) => [p, p === leader ? "safe" : "trap"])));
      for (let i = 0; i < 17; i++) place(r);
      expect(viewOf(r).turn).toBe(leader);
      bid(r, 23);
      passAll(r);
      while (viewOf(r).phase === "reveal") {
        const { stackSizes } = viewOf(r);
        const owner = players.filter((p) => p !== leader).sort((a, b) => stackSizes[b] - stackSizes[a])[0];
        reveal(r, owner);
      }
      if (round < 5) nextAll(r);
    }
    expect(r.snapshot().phase).toBe("over");
    expect(viewOf(r).history.every((h) => h.reveals.length === 19 && h.outcome === "foreign-trap")).toBe(true);

    const all = r.clients.flatMap((_, player) => roomMessages(r, player)).map((message) => JSON.stringify(message));
    const bytes = (text: string) => new TextEncoder().encode(text).length;
    const largest = Math.max(...all.map(bytes));
    // Testowe id są 2-znakowe. Prawdziwe sessionId ma 9 znaków, a nick do 16 znaków, po 2 bajty na polską literę.
    const realisticIds = Math.max(...all.map((json) => bytes(json.replace(/"p([1-6])"/g, '"$1abcdefgh"'))));
    const nicksMargin = 6 * 2 * 16 * 3;
    expect(largest).toBeLessThan(MAX_PAYLOAD);
    expect(realisticIds + nicksMargin).toBeLessThan(MAX_PAYLOAD);
  });

  describe("wynik", () => {
    test("remis na górze: bez zwycięzcy, miejsca z remisem, jeden wpis wieczoru i brak zapisu wygranej", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(3);
      playAll(r, ["p1", "p2", "p1", "p2", "p1", "p2"]);
      const { game, evening, phase } = r.snapshot();
      expect(phase).toBe("over");
      expect(game!.result?.winner).toBeUndefined();
      expect(game!.places).toEqual({ p1: 1, p2: 1, p3: 3 });
      expect(evening.games).toBe(1);
      expect(record).not.toHaveBeenCalled();
    });

    test("powtórzone wiadomości i czas po końcu nie powielają wyniku", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(3);
      playAll(r, ["p1", "p1", "p1", "p1", "p1", "p1"]);
      expect(r.snapshot().game!.result?.winner).toBe("p1");
      expect(r.snapshot().game!.places).toEqual({ p1: 1, p2: 2, p3: 2 });
      const totals = viewOf(r).totals;
      r.send(0, "move", { type: "next", ...stamp(r) });
      r.send(0, "move", { type: "reveal", owner: "p2", ...decided(r) });
      vi.advanceTimersByTime(120_000);
      expect(viewOf(r).totals).toEqual(totals);
      expect(totals.p1).toBe(12);
      expect(r.snapshot().evening.games).toBe(1);
      expect(record).toHaveBeenCalledTimes(1);
      expect(record).toHaveBeenCalledWith("sabotaz", ["p1", "p2", "p3"], "p1");
    });
  });
});

describe("Wyprawa w pokoju", () => {
  type OpenRoom = Awaited<ReturnType<typeof drawing>>;
  /** Ukryty stan meczu, tylko to, co potrzebne do ustawienia kolejności kart. */
  type Rigged = { state: { players: string[]; deck: unknown[]; trail: unknown[]; carried: Record<string, number>; loose: number; nonce: number } };

  const open = (n: number) => drawing(n, "wyprawa", false);
  const viewOf = (r: OpenRoom, player = 0) => r.snapshot(player).game!.view as WyprawaView;
  const stamp = (r: OpenRoom) => ({ nonce: viewOf(r).nonce, expedition: viewOf(r).expedition });
  const choice = (r: OpenRoom, c: "continue" | "return"): WyprawaMove => ({ type: "choose", choice: c, ...stamp(r), reveal: viewOf(r).reveal });
  /** Termin na teraz: ostatnia wysłana wiadomość pokazuje stan z chwili wysłania. */
  const msLeft = (r: OpenRoom) => r.room["viewFor"]("p1").game!.msLeft;
  const waiting = (r: OpenRoom) => r.snapshot().game!.waitingFor;
  const index = (id: string) => Number(id.slice(1)) - 1;
  const matchOf = (r: OpenRoom) => r.room["match"] as unknown as Rigged;
  const roomMessages = (r: OpenRoom, player: number) =>
    vi.mocked(r.clients[player].send).mock.calls.filter(([type]) => type === "room").map(([, message]) => message as RoomView);

  /** Ruch z odstępem poniżej limitu 10 wiadomości/s, żeby limit nie udawał błędu zasad. */
  function paced(r: OpenRoom, player: string, move: WyprawaMove) {
    vi.advanceTimersByTime(110);
    r.send(index(player), "move", move);
  }
  const everyone = (r: OpenRoom, c: "continue" | "return") => {
    for (const p of [...waiting(r)]) paced(r, p, choice(r, c));
  };
  const nextAll = (r: OpenRoom) => {
    for (const p of [...waiting(r)]) paced(r, p, { type: "next", ...stamp(r) });
  };

  /** Ustawia kolejność reszty talii (liczba to skarb, tekst to zagrożenie); pierwsza karta to skarb 6. Termin się nie zmienia. */
  function rig(r: OpenRoom, ...cards: (number | string)[]) {
    const match = matchOf(r);
    const { players } = match.state;
    match.state = {
      ...match.state,
      trail: [{ kind: "treasure", value: 6 }],
      deck: cards.map((card) => (typeof card === "number" ? { kind: "treasure", value: card } : { kind: "hazard", hazard: card })),
      carried: Object.fromEntries(players.map((p) => [p, Math.floor(6 / players.length)])),
      loose: 6 % players.length,
    };
  }
  /** Wyprawa, w której p1 wraca po pierwszym skarbie (3 monety), a p2 traci swoje na drugim roju. */
  function p1Wins(r: OpenRoom) {
    rig(r, 1, "roj", "roj", 2);
    paced(r, "p1", choice(r, "return"));
    paced(r, "p2", choice(r, "continue"));
    expect(viewOf(r).reveal).toBe(2);
    everyone(r, "continue");
    paced(r, "p2", choice(r, "continue"));
  }
  /** Każdy czeka na limit: sam zegar przechodzi całą partię. */
  function runClock(r: OpenRoom) {
    for (let i = 0; i < 40 && r.snapshot().phase === "playing" && viewOf(r).phase !== "over"; i++) vi.advanceTimersByTime(msLeft(r) ?? 1000);
  }

  describe("termin", () => {
    test("decyzja ma 20 s, a zatwierdzenie innego gracza nie odnawia czasu", async () => {
      const r = await open(2);
      rig(r, 1, 2, 3);
      expect(viewOf(r).phase).toBe("decision");
      expect(msLeft(r)).toBe(20_000);
      vi.advanceTimersByTime(5000);
      r.send(1, "move", choice(r, "continue"));
      expect(waiting(r)).toEqual(["p1"]);
      expect(msLeft(r)).toBe(15_000);
    });

    test("nowe odkrycie daje pełne 20 s, także gdy waitingFor jest taki sam", async () => {
      const r = await open(2);
      rig(r, 1, 2, 3);
      expect(waiting(r)).toEqual(["p1", "p2"]);
      vi.advanceTimersByTime(8000);
      r.send(0, "move", choice(r, "continue"));
      expect(msLeft(r)).toBe(12_000);
      r.send(1, "move", choice(r, "continue"));
      expect(viewOf(r).reveal).toBe(2);
      expect(waiting(r)).toEqual(["p1", "p2"]);
      expect(msLeft(r)).toBe(20_000);
    });

    test("odsłona ma 15 s, częściowe „Dalej” jej nie odnawia, po końcu partii brak limitu", async () => {
      const r = await open(2);
      rig(r, 1);
      everyone(r, "return");
      expect(viewOf(r).phase).toBe("summary");
      expect(msLeft(r)).toBe(15_000);
      vi.advanceTimersByTime(4000);
      r.send(0, "move", { type: "next", ...stamp(r) });
      expect(msLeft(r)).toBe(11_000);
      r.send(1, "move", { type: "next", ...stamp(r) });
      expect(viewOf(r)).toMatchObject({ phase: "decision", expedition: 1 });
      expect(msLeft(r)).toBe(20_000);
      runClock(r);
      expect(viewOf(r).phase).toBe("over");
      expect(msLeft(r)).toBeNull();
    });
  });

  describe("zegar", () => {
    test("limit przy kilku czekających rozstrzyga raz: bank rośnie jednokrotnie, wcześniejszy wybór zostaje", async () => {
      const r = await open(3);
      rig(r, 5, 4, 3);
      // 6 przy 3: po 2, loose 0.
      r.send(0, "move", choice(r, "continue"));
      vi.advanceTimersByTime(20_000);
      const v = viewOf(r);
      expect(v.reveal).toBe(2);
      expect(v.last?.choices).toEqual({ p1: "continue", p2: "return", p3: "return" });
      expect(v.last?.returned).toEqual(["p2", "p3"]);
      expect(v.bank).toEqual({ p1: 0, p2: 2, p3: 2 });
      expect(v.onTrail).toEqual(["p1"]);
      expect(msLeft(r)).toBe(20_000);
      vi.advanceTimersByTime(19_999);
      expect(viewOf(r).bank).toEqual({ p1: 0, p2: 2, p3: 2 });
      expect(viewOf(r).reveal).toBe(2);
    });

    test.each([2, 6])("komplet timeoutów przechodzi pięć wypraw i kończy partię remisem bez wpisu zwycięzcy: %i graczy", async (n) => {
      const record = vi.spyOn(stats, "record");
      const r = await open(n);
      runClock(r);
      const { game, phase, evening } = r.snapshot();
      expect(phase).toBe("over");
      const v = game!.view as WyprawaView;
      expect(v.phase).toBe("over");
      expect(v.history).toHaveLength(5);
      expect(v.history.every((h) => h.end === "returned")).toBe(true);
      expect(new Set(Object.values(v.bank)).size).toBe(1);
      expect(game!.result?.winner).toBeUndefined();
      expect(Object.values(game!.places!)).toEqual(Array(n).fill(1));
      expect(game!.waitingFor).toEqual([]);
      expect(evening.games).toBe(1);
      expect(record).not.toHaveBeenCalled();
    });
  });

  describe("poufność wiadomości room", () => {
    test("rywal, gracz w obozie i obserwator nie dostają cudzego wyboru ani talii przed rozstrzygnięciem", async () => {
      const r = await open(3);
      expect(r.observer).toBe(3);
      rig(r, 5, 4, 3);
      const future = JSON.stringify(matchOf(r).state.deck.slice(0, 2)).slice(1, -1);
      paced(r, "p1", choice(r, "return"));
      paced(r, "p2", choice(r, "continue"));
      // p3 też zatwierdza: rozstrzygnięcie, p1 trafia do obozu, p2 i p3 dostają nowe odkrycie.
      paced(r, "p3", choice(r, "continue"));
      expect(viewOf(r).onTrail).toEqual(["p2", "p3"]);
      const camp = viewOf(r, 0);
      expect(camp.last?.returned).toEqual(["p1"]);
      expect(camp.myChoice).toBeNull();

      const before = [0, 1, 2, r.observer!].map((player) => viewOf(r, player));
      paced(r, "p2", choice(r, "return"));
      const after = [0, 1, 2, r.observer!].map((player) => viewOf(r, player));
      expect(after[1].myChoice).toBe("return");
      // Dla pozostałych zmienia się wyłącznie jawna gotowość.
      for (const i of [0, 2, 3]) {
        expect(after[i].myChoice).toBeNull();
        expect({ ...after[i], ready: [] }).toEqual({ ...before[i], ready: [] });
        expect(after[i].ready).toEqual(["p2"]);
      }
      for (const player of [0, 1, 2, r.observer!]) {
        for (const message of roomMessages(r, player)) {
          const json = JSON.stringify(message);
          expect(json).not.toContain('"deck"');
          expect(json).not.toContain('"choices":{"p2"');
        }
      }
      expect(future.length).toBeGreaterThan(10);
      for (const player of [0, 1, 2, r.observer!]) {
        for (const message of roomMessages(r, player)) expect(JSON.stringify(message)).not.toContain(future);
      }
    });

    test("własny wybór w pierwszej decyzji widzi tylko jego autor", async () => {
      const r = await open(2);
      rig(r, 5, 4);
      paced(r, "p1", choice(r, "return"));
      expect(JSON.stringify(roomMessages(r, 0).at(-1))).toContain('"myChoice":"return"');
      for (const player of [1, r.observer!]) {
        const json = JSON.stringify(roomMessages(r, player).at(-1));
        expect(json).not.toMatch(/"return"|"continue"/);
        expect(json).toContain('"myChoice":null');
      }
      expect(viewOf(r, 1).ready).toEqual(["p1"]);
    });

    test("6 graczy bez siódmego połączenia: viewFor osoby spoza miejsc to widok obserwatora", async () => {
      const r = await open(6);
      expect(r.observer).toBeUndefined();
      expect(r.clients).toHaveLength(6);
      paced(r, "p1", choice(r, "return"));
      const outsider = r.room["viewFor"]("kibic");
      const view = outsider.game!.view as WyprawaView;
      expect(view.myChoice).toBeNull();
      expect(view.ready).toEqual(["p1"]);
      expect(view.players).toHaveLength(6);
      expect(Object.keys(view)).not.toContain("deck");
      expect(Object.keys(view)).not.toContain("choices");
      expect(JSON.stringify(outsider)).not.toMatch(/"return"|"continue"/);
      expect(viewOf(r, 0).myChoice).toBe("return");
    });
  });

  describe("wynik", () => {
    test("wyraźna wygrana zapisuje wygraną raz, places i punkty wieczoru są w RoomView, stary ruch nic nie zmienia", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(2);
      for (let i = 0; i < 5; i++) {
        p1Wins(r);
        if (i < 4) {
          expect(viewOf(r).phase).toBe("summary");
          nextAll(r);
        }
      }
      const { game, evening, phase } = r.snapshot();
      expect(phase).toBe("over");
      expect(viewOf(r).bank).toEqual({ p1: 15, p2: 0 });
      expect(game!.result?.winner).toBe("p1");
      expect(game!.places).toEqual({ p1: 1, p2: 2 });
      expect(evening).toMatchObject({ games: 1, played: ["wyprawa"] });
      expect(evening.table).toEqual([{ key: "p1", nick: "p1", points: 1, wins: 1 }, { key: "p2", nick: "p2", points: 0, wins: 0 }]);
      expect(record).toHaveBeenCalledTimes(1);
      expect(record).toHaveBeenCalledWith("wyprawa", ["p1", "p2"], "p1");

      const final = viewOf(r);
      const stale = { type: "choose" as const, choice: "return" as const, ...stamp(r), reveal: 1 };
      r.send(0, "move", stale);
      r.send(1, "move", { type: "next", ...stamp(r) });
      vi.advanceTimersByTime(120_000);
      expect(viewOf(r)).toEqual(final);
      expect(r.snapshot().evening.games).toBe(1);
      expect(record).toHaveBeenCalledTimes(1);
    });
  });

  describe("wyjście i rewanż", () => {
    test("wyjście gracza przy 2 osobach daje walkower", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(2);
      await r.room.onLeave(r.clients[1], CloseCode.CONSENTED);
      expect(r.snapshot().phase).toBe("over");
      expect(r.snapshot().game!.result?.winner).toBe("p1");
      expect(record).toHaveBeenCalledWith("wyprawa", ["p1"], "p1");
    });

    test("wyjście gracza przy większej liczbie osób kończy partię bez zwycięzcy", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(3);
      await r.room.onLeave(r.clients[2], CloseCode.CONSENTED);
      expect(r.snapshot().phase).toBe("over");
      expect(r.snapshot().game!.result?.winner).toBeUndefined();
      expect(record).not.toHaveBeenCalled();
    });

    test("rewanż ma nowy nonce, a ruch ze starym stemplem odpada", async () => {
      const r = await open(2);
      const old = viewOf(r);
      const oldMove = choice(r, "return");
      runClock(r);
      expect(r.snapshot().phase).toBe("over");
      vi.advanceTimersByTime(1000);
      for (const i of [0, 1]) r.send(i, "rematch", {});
      expect(r.snapshot().phase).toBe("playing");
      const fresh = viewOf(r);
      expect(fresh.nonce).not.toBe(old.nonce);
      expect(fresh).toMatchObject({ phase: "decision", expedition: 0, reveal: 1, history: [], last: null });
      expect(fresh.bank).toEqual({ p1: 0, p2: 0 });
      vi.advanceTimersByTime(110);
      r.send(0, "move", oldMove);
      // Rewanż rotuje kolejność miejsc, więc porównujemy zbiór.
      expect([...waiting(r)].sort()).toEqual(["p1", "p2"]);
      expect(viewOf(r)).toEqual(fresh);
      expect(msLeft(r)).toBe(20_000 - 110);
    });
  });
});

describe("Podróbka w pokoju", () => {
  type OpenRoom = Awaited<ReturnType<typeof drawing>>;
  /** Ukryty stan meczu, tylko to, co potrzebne do ustawienia ról i odczytania pytań. */
  type Deal = { pairId: string; majority: string; other: string; impostor: string };
  type Rigged = { state: { players: string[]; deals: Deal[]; round: number } };

  const open = (n: number) => drawing(n, "podrobka", false);
  const viewOf = (r: OpenRoom, player = 0) => r.snapshot(player).game!.view as PodrobkaView;
  const stamp = (r: OpenRoom) => ({ nonce: viewOf(r).nonce, round: viewOf(r).round });
  const write = (r: OpenRoom, answer: string, done = true): PodrobkaMove => ({ type: "write", ...stamp(r), answer, done });
  const vote = (r: OpenRoom, target: string | null): PodrobkaMove => ({ type: "vote", ...stamp(r), target });
  const next = (r: OpenRoom): PodrobkaMove => ({ type: "next", ...stamp(r) });
  /** Termin na teraz: ostatnia wysłana wiadomość pokazuje stan z chwili wysłania. */
  const msLeft = (r: OpenRoom) => r.room["viewFor"]("p1").game!.msLeft;
  const waiting = (r: OpenRoom) => r.snapshot().game!.waitingFor;
  const index = (id: string) => Number(id.slice(1)) - 1;
  const matchOf = (r: OpenRoom) => r.room["match"] as unknown as Rigged;
  const roomMessages = (r: OpenRoom, player: number) =>
    vi.mocked(r.clients[player].send).mock.calls.filter(([type]) => type === "room").map(([, message]) => message as RoomView);
  const zeroes = (r: OpenRoom) => Object.fromEntries(viewOf(r).players.map((p) => [p, 0]));

  /** Ruch z odstępem poniżej limitu 10 wiadomości/s, żeby limit nie udawał błędu zasad. */
  function paced(r: OpenRoom, player: string, move: PodrobkaMove) {
    vi.advanceTimersByTime(110);
    r.send(index(player), "move", move);
  }
  const writeAll = (r: OpenRoom) => {
    for (const p of [...waiting(r)]) paced(r, p, write(r, `odp ${p}`));
  };
  const voteAll = (r: OpenRoom, votes: Record<string, string | null>) => {
    for (const p of [...waiting(r)]) paced(r, p, vote(r, votes[p]));
  };
  const nextAll = (r: OpenRoom) => {
    for (const p of [...waiting(r)]) paced(r, p, next(r));
  };
  /** Podróbką jest p1 we wszystkich rundach; ustawiane przed pierwszym ruchem, więc nic jeszcze nie pokazało starej roli. */
  function rig(r: OpenRoom, impostor = "p1") {
    const match = matchOf(r);
    match.state = { ...match.state, deals: match.state.deals.map((d) => ({ ...d, impostor })) };
  }
  /** Każdy czeka na limit: sam zegar przechodzi całą partię. */
  function runClock(r: OpenRoom) {
    for (let i = 0; i < 40 && r.snapshot().phase === "playing" && viewOf(r).phase !== "over"; i++) vi.advanceTimersByTime(msLeft(r) ?? 1000);
  }

  describe("termin", () => {
    test("pisanie ma 30 s, a szkic ani cudze zatwierdzenie nie odnawiają czasu", async () => {
      const r = await open(3);
      expect(viewOf(r).phase).toBe("write");
      expect(msLeft(r)).toBe(30_000);
      vi.advanceTimersByTime(5000);
      r.send(1, "move", write(r, "szkic", false));
      expect(waiting(r)).toEqual(["p1", "p2", "p3"]);
      expect(msLeft(r)).toBe(25_000);
      r.send(2, "move", write(r, "gotowe"));
      expect(waiting(r)).toEqual(["p1", "p2"]);
      expect(msLeft(r)).toBe(25_000);
    });

    test("głosowanie ma 60 s, a cudzy głos nie odnawia czasu", async () => {
      const r = await open(3);
      writeAll(r);
      expect(viewOf(r).phase).toBe("vote");
      expect(msLeft(r)).toBe(60_000);
      vi.advanceTimersByTime(7000);
      r.send(0, "move", vote(r, "p2"));
      expect(waiting(r)).toEqual(["p2", "p3"]);
      expect(msLeft(r)).toBe(53_000);
    });

    test("odsłona ma 15 s, częściowe „Dalej” jej nie odnawia, pełne daje 30 s pisania, po końcu partii brak limitu", async () => {
      const r = await open(3);
      writeAll(r);
      voteAll(r, { p1: "p2", p2: "p3", p3: "p1" });
      expect(viewOf(r).phase).toBe("summary");
      expect(msLeft(r)).toBe(15_000);
      vi.advanceTimersByTime(4000);
      r.send(0, "move", next(r));
      expect(msLeft(r)).toBe(11_000);
      r.send(1, "move", next(r));
      r.send(2, "move", next(r));
      expect(viewOf(r)).toMatchObject({ phase: "write", round: 1 });
      expect(msLeft(r)).toBe(30_000);
      runClock(r);
      expect(viewOf(r).phase).toBe("over");
      expect(msLeft(r)).toBeNull();
    });
  });

  describe("zegar", () => {
    test("limit pisania przy kilku czekających zatwierdza szkice i przechodzi do głosowania", async () => {
      const r = await open(3);
      for (const [i, p] of ["p1", "p2", "p3"].entries()) r.send(i, "move", write(r, `  szkic   ${p} `, false));
      vi.advanceTimersByTime(30_000);
      const v = viewOf(r);
      expect(v.phase).toBe("vote");
      expect(v.answers).toEqual({ p1: "szkic p1", p2: "szkic p2", p3: "szkic p3" });
      expect(v.history).toEqual([]);
      expect(msLeft(r)).toBe(60_000);
      vi.advanceTimersByTime(59_999);
      expect(viewOf(r)).toMatchObject({ phase: "vote", history: [] });
    });

    test("limit pisania z pustym szkicem anuluje rundę: zero punktów, jawny brak, odsłona 15 s", async () => {
      const r = await open(3);
      r.send(0, "move", write(r, "jest"));
      r.send(1, "move", write(r, "jest"));
      vi.advanceTimersByTime(30_000);
      const v = viewOf(r);
      expect(v.phase).toBe("summary");
      expect(v.history).toHaveLength(1);
      expect(v.history[0]).toMatchObject({ cancelled: true, missing: ["p3"], gain: zeroes(r) });
      expect(v.totals).toEqual(zeroes(r));
      expect(msLeft(r)).toBe(15_000);
    });

    test("limit głosowania z częścią głosów nalicza punkty dokładnie raz", async () => {
      const r = await open(3);
      rig(r);
      writeAll(r);
      paced(r, "p2", vote(r, "p1"));
      vi.advanceTimersByTime(msLeft(r)!);
      const v = viewOf(r);
      expect(v.phase).toBe("summary");
      expect(v.history).toHaveLength(1);
      expect(v.history[0]).toMatchObject({ impostor: "p1", detected: false, votes: { p1: null, p2: "p1", p3: null } });
      expect(v.totals).toEqual({ p1: 0, p2: 2, p3: 0 });
      vi.advanceTimersByTime(14_000);
      expect(viewOf(r)).toMatchObject({ phase: "summary", totals: { p1: 0, p2: 2, p3: 0 } });
      expect(viewOf(r).history).toHaveLength(1);
    });

    test("limit odsłony otwiera kolejną rundę z pełnym czasem i bez zmiany punktów", async () => {
      const r = await open(3);
      rig(r);
      writeAll(r);
      voteAll(r, { p1: "p2", p2: "p1", p3: "p1" });
      const totals = viewOf(r).totals;
      expect(totals).toEqual({ p1: 0, p2: 2, p3: 2 });
      r.send(0, "move", next(r));
      vi.advanceTimersByTime(msLeft(r)!);
      expect(viewOf(r)).toMatchObject({ phase: "write", round: 1, totals, done: [], voted: [], ready: [] });
      expect(viewOf(r).history).toHaveLength(1);
      expect(msLeft(r)).toBe(30_000);
    });

    test.each([3, 6])("komplet timeoutów przechodzi sześć rund i kończy partię remisem bez wpisu zwycięzcy: %i graczy", async (n) => {
      const record = vi.spyOn(stats, "record");
      const r = await open(n);
      runClock(r);
      const { game, phase, evening } = r.snapshot();
      expect(phase).toBe("over");
      const v = game!.view as PodrobkaView;
      expect(v.phase).toBe("over");
      expect(v.history).toHaveLength(6);
      expect(v.history.every((h) => h.cancelled)).toBe(true);
      expect(Object.values(v.totals)).toEqual(Array(n).fill(0));
      expect(game!.result?.winner).toBeUndefined();
      expect(Object.values(game!.places!)).toEqual(Array(n).fill(1));
      expect(game!.waitingFor).toEqual([]);
      expect(evening.games).toBe(1);
      expect(record).not.toHaveBeenCalled();
    });
  });

  describe("poufność wiadomości room", () => {
    const allJson = (r: OpenRoom, player: number) => roomMessages(r, player).map((m) => JSON.stringify(m)).join("\n");
    const STATE_KEYS = ['"deals"', '"drafts"', '"pairId"', '"votes"', '"impostor"'];

    test("gracz, Podróbka i obserwator dostają tylko swoje: pytania, szkice i głosy przed odsłoną", async () => {
      const r = await open(3);
      expect(r.observer).toBe(3);
      const { deals } = matchOf(r).state;
      const [d0] = deals;
      const fake = index(d0.impostor);
      const real = [0, 1, 2].filter((i) => i !== fake);
      const future = deals.slice(1).flatMap((d) => [d.majority, d.other, d.pairId]);
      const author = real[0];

      paced(r, `p${author + 1}`, write(r, "SEKRETNY-SZKIC", false));
      expect(viewOf(r, author).myDraft).toBe("SEKRETNY-SZKIC");
      for (const player of [0, 1, 2, r.observer!]) {
        const json = allJson(r, player);
        for (const key of STATE_KEYS) expect(json, `${player}: ${key}`).not.toContain(key);
        for (const hidden of future) expect(json, `${player}: przyszła para`).not.toContain(hidden);
        if (player !== author) expect(json, `${player}: cudzy szkic`).not.toContain("SEKRETNY-SZKIC");
      }
      expect(allJson(r, fake)).toContain(d0.other);
      expect(allJson(r, fake)).not.toContain(d0.majority);
      for (const i of real) {
        expect(allJson(r, i)).toContain(d0.majority);
        expect(allJson(r, i)).not.toContain(d0.other);
      }
      expect(allJson(r, r.observer!)).not.toContain(d0.majority);
      expect(allJson(r, r.observer!)).not.toContain(d0.other);

      writeAll(r);
      expect(viewOf(r).phase).toBe("vote");
      paced(r, `p${author + 1}`, vote(r, `p${real[1] + 1}`));
      for (const player of [0, 1, 2, r.observer!]) {
        const json = allJson(r, player);
        for (const key of STATE_KEYS) expect(json, `${player}: ${key}`).not.toContain(key);
        for (const hidden of future) expect(json, `${player}: przyszła para`).not.toContain(hidden);
        if (player !== author) expect(json, `${player}: cudzy głos`).not.toMatch(/"myVote":"p/);
      }
      expect(allJson(r, author)).toContain(`"myVote":"p${real[1] + 1}"`);
      expect(allJson(r, fake)).toContain(d0.other);
      expect(allJson(r, fake)).toContain(d0.majority);
      for (const player of [r.observer!, real[1]]) {
        expect(allJson(r, player)).toContain(d0.majority);
        expect(allJson(r, player)).not.toContain(d0.other);
      }
      expect(viewOf(r, r.observer!)).toMatchObject({ myQuestion: null, myDraft: null, myVote: null, voted: [`p${author + 1}`] });
      expect(viewOf(r, r.observer!).answers).toEqual({ p1: "odp p1", p2: "odp p2", p3: "odp p3" });
    });

    test("6 graczy bez siódmego połączenia: viewFor osoby spoza miejsc to widok obserwatora, bez pytań, szkiców i głosów", async () => {
      const r = await open(6);
      expect(r.observer).toBeUndefined();
      const [d0] = matchOf(r).state.deals;
      paced(r, "p1", write(r, "SEKRETNY-SZKIC", false));
      let outsider = r.room["viewFor"]("kibic");
      let view = outsider.game!.view as PodrobkaView;
      expect(view).toMatchObject({ phase: "write", hint: null, myQuestion: null, myDraft: null, majorityQuestion: null, answers: null, myVote: null });
      expect(view.players).toHaveLength(6);
      for (const hidden of [d0.majority, d0.other, "SEKRETNY-SZKIC"]) expect(JSON.stringify(outsider)).not.toContain(hidden);

      writeAll(r);
      paced(r, "p1", vote(r, "p2"));
      outsider = r.room["viewFor"]("kibic");
      view = outsider.game!.view as PodrobkaView;
      expect(view).toMatchObject({ phase: "vote", majorityQuestion: d0.majority, myQuestion: null, myDraft: null, myVote: null, voted: ["p1"] });
      expect(Object.keys(view.answers!)).toHaveLength(6);
      expect(JSON.stringify(outsider)).not.toContain(d0.other);
      expect(JSON.stringify(outsider)).not.toMatch(/"myVote":"p/);
      expect(viewOf(r, 0).myVote).toBe("p2");
    });

    test("ruch klienta z polem source: timeout i pustą odpowiedzią albo głosem null odpada", async () => {
      const r = await open(3);
      r.send(0, "move", { ...write(r, "", true), source: "timeout", context: { source: "timeout" } });
      expect(waiting(r)).toEqual(["p1", "p2", "p3"]);
      expect(viewOf(r).done).toEqual([]);
      writeAll(r);
      expect(viewOf(r).phase).toBe("vote");
      vi.advanceTimersByTime(110);
      r.send(0, "move", { ...vote(r, null), source: "timeout", context: { source: "timeout" } });
      expect(waiting(r)).toEqual(["p1", "p2", "p3"]);
      expect(viewOf(r).voted).toEqual([]);
    });
  });

  describe("wynik", () => {
    test("wyraźna wygrana zapisuje wygraną raz, places i punkty wieczoru są w RoomView, stary ruch nic nie zmienia", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(3);
      rig(r);
      for (let i = 0; i < 6; i++) {
        writeAll(r);
        // Podróbka p1 nie dostaje głosów, więc uchodzi; p2 prowadzi z dwoma głosami, ale jest niewinny.
        voteAll(r, { p1: "p2", p2: "p3", p3: "p2" });
        if (i < 5) {
          expect(viewOf(r)).toMatchObject({ phase: "summary", round: i });
          nextAll(r);
        }
      }
      const { game, evening, phase } = r.snapshot();
      expect(phase).toBe("over");
      expect(viewOf(r)).toMatchObject({ phase: "over", totals: { p1: 18, p2: 0, p3: 0 } });
      expect(viewOf(r).history).toHaveLength(6);
      expect(game!.result?.winner).toBe("p1");
      expect(game!.places).toEqual({ p1: 1, p2: 2, p3: 2 });
      expect(evening).toMatchObject({ games: 1, played: ["podrobka"] });
      expect(evening.table[0]).toEqual({ key: "p1", nick: "p1", points: 2, wins: 1 });
      expect(evening.table.slice(1).map((row) => row.points)).toEqual([0, 0]);
      expect(record).toHaveBeenCalledTimes(1);
      expect(record).toHaveBeenCalledWith("podrobka", ["p1", "p2", "p3"], "p1");

      const final = viewOf(r);
      vi.advanceTimersByTime(110);
      r.send(0, "move", { type: "write", nonce: final.nonce, round: 0, answer: "spóźnione", done: true });
      r.send(1, "move", { type: "next", nonce: final.nonce, round: 5 });
      r.send(2, "move", { type: "vote", nonce: final.nonce, round: 5, target: "p1" });
      vi.advanceTimersByTime(120_000);
      expect(viewOf(r)).toEqual(final);
      expect(r.snapshot().evening.games).toBe(1);
      expect(record).toHaveBeenCalledTimes(1);
    });
  });

  describe("wyjście i rewanż", () => {
    test("wyjście gracza kończy partię bez zwycięzcy i bez kontynuacji z nowym składem", async () => {
      const record = vi.spyOn(stats, "record");
      const r = await open(3);
      writeAll(r);
      await r.room.onLeave(r.clients[2], CloseCode.CONSENTED);
      expect(r.snapshot().phase).toBe("over");
      expect(r.snapshot().game!.result?.winner).toBeUndefined();
      expect(record).not.toHaveBeenCalled();
      const frozen = viewOf(r);
      vi.advanceTimersByTime(110);
      r.send(0, "move", vote(r, "p2"));
      vi.advanceTimersByTime(120_000);
      expect(r.snapshot().phase).toBe("over");
      expect(viewOf(r)).toEqual(frozen);
      expect(record).not.toHaveBeenCalled();
    });

    test("rewanż ma nowy nonce, a ruch ze starym stemplem odpada", async () => {
      const r = await open(3);
      const old = viewOf(r);
      const oldMove = write(r, "stara odpowiedź");
      runClock(r);
      expect(r.snapshot().phase).toBe("over");
      vi.advanceTimersByTime(1000);
      for (const i of [0, 1, 2]) r.send(i, "rematch", {});
      expect(r.snapshot().phase).toBe("playing");
      const fresh = viewOf(r);
      expect(fresh.nonce).not.toBe(old.nonce);
      expect(fresh).toMatchObject({ phase: "write", round: 0, history: [], done: [], myDraft: "" });
      expect(fresh.totals).toEqual({ p1: 0, p2: 0, p3: 0 });
      vi.advanceTimersByTime(110);
      r.send(0, "move", oldMove);
      // Rewanż rotuje kolejność miejsc, więc porównujemy zbiór.
      expect([...waiting(r)].sort()).toEqual(["p1", "p2", "p3"]);
      expect(viewOf(r)).toEqual(fresh);
      expect(msLeft(r)).toBe(30_000 - 110);
    });
  });
});

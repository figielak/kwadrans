import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { type AuthContext, type Client, CloseCode, matchMaker, Room, ServerError } from "@colyseus/core";
import {
  advance,
  addGame,
  begin,
  cleanConfig,
  cleanNick,
  COUNTDOWN_SECONDS,
  create,
  createRng,
  type Evening,
  eveningTable,
  GAMES,
  INTRO_SECONDS,
  isDone,
  type GameDefinition,
  type GameResult,
  type LobbyPlayer,
  mark,
  MAX_PLAYERS,
  QUICK_SERIES_LENGTH,
  VOTE_SECONDS,
  voteOptions,
  voteWinner,
  MINI_GAME_IDS,
  type MoveContext,
  NEXT_SECONDS,
  nickKey,
  type Phase,
  PLAYER_COLORS,
  placesFromResult,
  REMATCH_INTRO_SECONDS,
  type Rng,
  ROOM_MESSAGES,
  roomCode,
  soloState,
  type RoomView,
  TOURNAMENT_ID,
  titles,
  type Tournament,
  winner,
} from "@kwadrans/games";
import { openStats, type RoomGameOutcome } from "./stats.ts";

const RECONNECT_SECONDS = 10 * 60; // telefon śpi między turami
const IDLE_MS = 60 * 60 * 1000;
const ROOMS_PER_IP = 3;
// Pokoje solo liczą się osobno: wszyscy na jednym Wi-Fi mają jedno IP.
const SOLO_ROOMS_PER_IP = 20;
const MESSAGES_PER_SECOND = 10;
const LIVE_PER_SECOND = 2;

// ponytail: licznik w pamięci jednego procesu, wystarczy przy jednym kontenerze na Pi
const roomsByIp = new Map<string, number>();

const dbPath = process.env.DB_PATH ?? "data/games.db";
mkdirSync(dirname(dbPath), { recursive: true });
export const stats = openStats(dbPath);

type Timer = { clear(): void };

const newRng = () => createRng(crypto.getRandomValues(new Uint32Array(1))[0]);
const defaultMode = (def: GameDefinition<unknown, unknown>) => (def.modes?.find((m) => m.default) ?? def.modes?.[0])?.id ?? null;

interface Match {
  def: GameDefinition<unknown, unknown>;
  state: unknown;
  rng: Rng;
  result: GameResult | null;
  /** Stan przy starcie: onLeave zmienia `seats` jeszcze przed `finish`, a pomiar liczy osoby od początku partii. */
  players: number;
  nicks: string[];
}

export class LobbyRoom extends Room {
  maxClients: number = MAX_PLAYERS;
  private players = new Map<string, LobbyPlayer>();
  private hostId = "";
  private creatorIp: string | undefined;
  private idle?: Timer;

  /** Gra solo z ekranu głównego: pokój na jedną osobę, który od razu startuje wybraną mini-grę. */
  private solo = false;
  private phase: Phase = "lobby";
  private gameId: string | null = null;
  private mode: string | null = null;
  private seats: string[] = [];
  /** Wybrany albo trwający turniej. W trakcie `gameId` wskazuje bieżącą grę, w lobby jest puste. */
  private tournament: Tournament | null = null;
  private markedBy: Record<string, string> = {};
  private scores: Record<string, number> = {};
  private evening: Evening = { games: [], nicks: {} };
  private eveningView: RoomView["evening"] = { games: 0, played: [], table: [], titles: [] };
  /** Trwające głosowanie „Inna gra”, zawsze w fazie `over`; koniec liczy `turnTimer`. */
  private vote: { options: string[]; votes: Record<string, string> } | null = null;
  private match: Match | null = null;
  private turnTimer?: Timer;
  private turnEndsAt: number | null = null;
  /** Instrukcja mini-gry i wspólne odliczanie; limit gry rusza dopiero po ich końcu. */
  private intro = false;
  private countdown = false;
  /** Rewanż w pokoju solo: klient pomija instrukcję i wysyła begin. */
  private skipIntro = false;
  private began = new Set<string>();
  /** Losowy klucz pokoju do pomiaru; kody pokoi wracają, więc nie nadają się na klucz. */
  private roomKey: string = randomUUID();
  private messageCounts = new Map<string, { second: number; count: number }>();
  private liveCounts = new Map<string, { second: number; count: number }>();
  private reactCounts = new Map<string, number>();
  /** Dane dekoracyjne od klientów, nigdy nie trafiają do stanu zasad ani wyników. */
  private liveValues: Record<string, number> = {};

  async onCreate(options?: { solo?: unknown }) {
    if (typeof options?.solo === "string" && MINI_GAME_IDS.includes(options.solo)) {
      this.solo = true;
      this.gameId = options.solo;
      this.maxClients = 1;
    }
    let code = roomCode(Math.random);
    while ((await matchMaker.query({ roomId: code })).length > 0) code = roomCode(Math.random);
    this.roomId = code;
    this.touch();

    // gameId null: powrót z ekranu gry do listy gier.
    this.on("pickGame", (client, { gameId }) => {
      const def = gameId === null ? undefined : GAMES[gameId];
      if (!this.isHost(client) || this.phase !== "lobby" || (gameId !== null && !def)) return;
      this.gameId = gameId;
      this.tournament = null;
      this.markedBy = {};
      this.mode = def ? defaultMode(def) : null;
      this.seats = def ? [...this.players.keys()].slice(0, def.maxPlayers) : [];
      this.resetReady();
    });

    // Wybór turnieju albo zmiana liczby gier; jak zmiana trybu, kasuje gotowość gości. Zaznaczone gry zostają.
    this.on("pickTournament", (client, { length }) => {
      const { must = [], skip = [] } = this.tournament?.config ?? {};
      const config = cleanConfig({ length, must, skip }, MINI_GAME_IDS);
      if (!this.isHost(client) || this.phase !== "lobby" || !config) return;
      // Miejsca dostają wszyscy tylko przy wyborze turnieju; zmiana ustawień nie rusza tych, których gospodarz przesadził.
      if (!this.tournament) this.seats = [...this.players.keys()];
      this.tournament = create(config);
      this.gameId = null;
      this.mode = null;
      this.resetReady();
    });

    // Szybka seria: zwykły turniej o stałej długości, bez ekranu ustawień i gotowości; grają wszyscy w pokoju.
    this.on("quickSeries", (client) => {
      const config = cleanConfig({ length: QUICK_SERIES_LENGTH, must: [], skip: [] }, MINI_GAME_IDS);
      if (!this.isHost(client) || this.phase !== "lobby" || !config) return;
      this.seats = [...this.players.keys()].slice(0, MAX_PLAYERS);
      this.tournament = begin(create(config), MINI_GAME_IDS, newRng());
      this.markedBy = {};
      this.startTournamentGame();
    });

    // Gry turnieju zaznacza każdy w pokoju; spory rozstrzygają gracze między sobą, nie aplikacja.
    this.on("markGame", (client, { id, mark: state }) => {
      if (!this.players.has(client.sessionId) || this.phase !== "lobby" || !this.tournament) return;
      const config = mark(this.tournament.config, id, state, MINI_GAME_IDS);
      if (!config) return;
      this.tournament = create(config);
      if (state === "any") delete this.markedBy[id];
      else this.markedBy[id] = client.sessionId;
      this.resetReady();
    });

    // Zmiana trybu kasuje gotowość: goście zgodzili się na co innego.
    this.on("pickMode", (client, { mode }) => {
      const def = this.gameId ? GAMES[this.gameId] : undefined;
      if (!this.isHost(client) || this.phase !== "lobby" || !def?.modes?.some((m) => m.id === mode)) return;
      this.mode = mode;
      this.resetReady();
    });

    this.on("ready", (client, { ready }) => {
      const player = this.players.get(client.sessionId);
      if (player && this.phase === "lobby" && (this.gameId || this.tournament)) player.ready = ready;
    });

    this.on("toggleSeat", (client, { id }) => {
      const max = this.maxSeats();
      if (!this.isHost(client) || this.phase !== "lobby" || !max || !this.players.has(id)) return;
      if (this.seats.includes(id)) this.seats = this.seats.filter((s) => s !== id);
      else if (this.seats.length < max) this.seats = [...this.seats, id];
    });

    // Kolor zmienia się poza partią; zajętego przez kogoś innego nie da się wziąć.
    this.on("pickColor", (client, { color }) => {
      const player = this.players.get(client.sessionId);
      if (!player || this.phase === "playing") return;
      if ([...this.players.values()].some((p) => p.color === color)) return;
      player.color = color;
    });

    this.on("start", (client) => {
      const def = this.gameId ? GAMES[this.gameId] : undefined;
      if (!this.isHost(client) || this.phase !== "lobby" || (!def && !this.tournament)) return;
      if (this.seats.length < (def?.minPlayers ?? 1) || this.seats.length > this.maxSeats()) return;
      if (this.seats.some((id) => id !== this.hostId && !this.players.get(id)?.ready)) return;
      if (def) return this.startMatch(def);
      this.tournament = begin(this.tournament!, MINI_GAME_IDS, newRng());
      this.startTournamentGame();
    });

    this.on("begin", (client) => {
      if (this.phase !== "playing" || !this.intro || this.countdown || !this.seats.includes(client.sessionId)) return;
      this.began.add(client.sessionId);
      if (this.seats.every((id) => this.began.has(id))) this.startCountdown();
    });

    this.on("move", (client, raw) => {
      if (this.phase !== "playing" || !this.match || this.intro) return;
      const move = this.match.def.moveSchema.safeParse(raw);
      if (move.success) this.play(client.sessionId, move.data, { source: "client" });
    });

    // Własny kanał: bez this.on, pełnego update i zużywania limitu zwykłych wiadomości.
    this.onMessage("live", (client: Client, raw: unknown) => {
      if (this.phase !== "playing" || this.intro || !this.match?.def.live || this.seats.length < 2 || !this.seats.includes(client.sessionId)) return;
      const second = Math.floor(Date.now() / 1000);
      const entry = this.liveCounts.get(client.sessionId);
      const count = entry?.second === second ? entry.count : 0;
      if (count >= LIVE_PER_SECOND) return;
      this.liveCounts.set(client.sessionId, { second, count: count + 1 });
      const parsed = ROOM_MESSAGES.live.safeParse(raw);
      if (!parsed.success) return;
      const { value } = parsed.data;
      this.liveValues = { ...this.liveValues, [client.sessionId]: value };
      for (const other of this.clients) {
        if (other.sessionId !== client.sessionId) other.send("live", { id: client.sessionId, value });
      }
    });

    // Reakcje jak live: bez this.on i pełnego update, jedna na sekundę od osoby. Zły kształt nie zużywa limitu; nadawca też dostaje, bo tak widzi, że przeszło.
    this.onMessage("react", (client: Client, raw: unknown) => {
      if (this.phase === "lobby" || this.clients.length < 2) return;
      const parsed = ROOM_MESSAGES.react.safeParse(raw);
      if (!parsed.success) return;
      const second = Math.floor(Date.now() / 1000);
      if (this.reactCounts.get(client.sessionId) === second) return;
      this.reactCounts.set(client.sessionId, second);
      for (const other of this.clients) other.send("react", { id: client.sessionId, index: parsed.data.index });
    });

    // Po partii `ready` znaczy „chcę rewanż”; rewanż rusza, gdy chcą wszyscy grający.
    this.on("rematch", (client) => {
      const player = this.players.get(client.sessionId);
      if (!player || this.phase !== "over" || this.vote || !this.seats.includes(client.sessionId)) return;
      player.ready = true;
      this.maybeRematch();
    });

    // Inna gra: każdy grający może rozpocząć głosowanie, poza pokojem solo i trwającym turniejem. Dotychczasowa zgoda na rewanż przepada.
    this.on("otherGame", (client) => {
      if (this.phase !== "over" || this.solo || this.vote || !this.seats.includes(client.sessionId)) return;
      if (this.tournament && !isDone(this.tournament)) return;
      const options = voteOptions(Object.values(GAMES), this.seats.length, this.gameId!, this.eveningView.played, newRng());
      if (options.length === 0) return;
      this.vote = { options, votes: {} };
      this.resetReady();
      this.turnEndsAt = Date.now() + VOTE_SECONDS * 1000;
      this.turnTimer = this.clock.setTimeout(() => {
        this.finishVote();
        this.update();
      }, VOTE_SECONDS * 1000);
    });

    this.on("vote", (client, { id }) => {
      if (!this.vote?.options.includes(id) || !this.seats.includes(client.sessionId)) return;
      this.vote = { ...this.vote, votes: { ...this.vote.votes, [client.sessionId]: id } };
      this.maybeFinishVote();
    });

    // Gospodarz zabiera wszystkich do lobby: kończy serię, przerywa turniej albo gasi głosowanie.
    this.on("toLobby", (client) => {
      if (!this.isHost(client) || this.phase !== "over" || this.solo) return;
      this.toLobby();
    });
  }

  onAuth(_client: Client, options: { nick?: unknown }, context: AuthContext) {
    const nick = cleanNick(options?.nick);
    if (!nick) throw new ServerError(400, "Nick musi mieć od 1 do 16 znaków.");

    // Pierwszy wchodzący to twórca pokoju: tylko on liczy się do limitu pokoi na IP.
    if (this.players.size === 0 && this.creatorIp === undefined) {
      const ip = (this.solo ? "solo:" : "") + (context.headers.get("cf-connecting-ip") ?? context.ip ?? "?");
      const count = roomsByIp.get(ip) ?? 0;
      if (count >= (this.solo ? SOLO_ROOMS_PER_IP : ROOMS_PER_IP)) throw new ServerError(429, "Masz już otwarte za dużo pokoi.");
      roomsByIp.set(ip, count + 1);
      this.creatorIp = ip;
    }
    return { nick };
  }

  onJoin(client: Client, _options: unknown, auth: { nick: string }) {
    const taken = new Set([...this.players.values()].map((p) => p.color));
    const color = PLAYER_COLORS.find((c) => !taken.has(c))!;
    this.players.set(client.sessionId, { id: client.sessionId, nick: auth.nick, color, connected: true, ready: false });
    // Powrót pod nową sesją odświeża pisownię także bez rozegrania kolejnej partii.
    const key = nickKey(auth.nick);
    const previousNick = this.evening.nicks[key];
    if (Object.hasOwn(this.evening.nicks, key) && previousNick !== auth.nick) {
      this.evening = { ...this.evening, nicks: { ...this.evening.nicks, [key]: auth.nick } };
      this.eveningView = {
        ...this.eveningView,
        table: this.eveningView.table.map((row) => row.key === key ? { ...row, nick: auth.nick } : row),
        titles: this.eveningView.titles.map((title) => nickKey(title.nick) === key ? { ...title, nick: auth.nick } : title),
      };
    }
    if (!this.hostId) this.hostId = client.sessionId;
    // Gra już wybrana i jest wolne miejsce: nowy gracz od razu gra, gospodarz nie musi go zaznaczać.
    if (this.phase === "lobby" && this.seats.length < this.maxSeats()) this.seats = [...this.seats, client.sessionId];
    if (this.solo) this.startMatch(GAMES[this.gameId!]);
    this.update();
  }

  async onLeave(client: Client, code?: number) {
    const player = this.players.get(client.sessionId);
    if (!player) return;
    if (code !== CloseCode.CONSENTED) {
      player.connected = false;
      this.update();
      try {
        await this.allowReconnection(client, RECONNECT_SECONDS);
        player.connected = true;
        this.update();
        return;
      } catch {
        // nie wrócił na czas
      }
    }
    this.players.delete(client.sessionId);
    this.messageCounts.delete(client.sessionId);
    this.liveCounts.delete(client.sessionId);
    this.reactCounts.delete(client.sessionId);
    if (this.hostId === client.sessionId) this.hostId = this.players.keys().next().value ?? "";
    if (this.seats.includes(client.sessionId)) {
      this.seats = this.seats.filter((s) => s !== client.sessionId);
      // Walkower: w grze 1v1 wygrywa ten, kto został. W turnieju gra przepada bez punktów, a turniej trwa.
      if (this.phase === "playing") {
        const walkover = this.seats.length === 1 && !this.tournament;
        this.finish(walkover ? { winner: this.seats[0] } : {}, walkover ? "walkover" : "aborted");
      }
      else if (this.vote) this.voteAfterLeave(client.sessionId);
      else this.maybeRematch();
    }
    this.update();
  }

  onDispose() {
    this.turnTimer?.clear();
    if (this.creatorIp === undefined) return;
    const left = (roomsByIp.get(this.creatorIp) ?? 1) - 1;
    if (left > 0) roomsByIp.set(this.creatorIp, left);
    else roomsByIp.delete(this.creatorIp);
  }

  /** onMessage z limitem wiadomości na sekundę i walidacją zod; po każdej obsłużonej wiadomości rozsyła stan. */
  private on<K extends keyof typeof ROOM_MESSAGES>(
    type: K,
    handler: (client: Client, payload: (typeof ROOM_MESSAGES)[K]["_output"]) => void,
  ) {
    this.onMessage(type, (client: Client, raw: unknown) => {
      if (!this.withinRateLimit(client.sessionId)) return;
      const parsed = ROOM_MESSAGES[type].safeParse(raw);
      if (!parsed.success) return;
      // Wyjątek w obsłudze (np. błąd w zasadach gry) nie może zabić procesu, czyli wszystkich pokoi: wiadomość przepada.
      try {
        handler(client, parsed.data);
      } catch (error) {
        this.logError(`wiadomość ${type}`, error);
      }
      this.update();
    });
  }

  private logError(where: string, error: unknown) {
    console.error(`[${this.roomId}] ${this.gameId ?? "lobby"}, ${where}:`, error);
  }

  private withinRateLimit(id: string) {
    const second = Math.floor(Date.now() / 1000);
    const entry = this.messageCounts.get(id);
    if (!entry || entry.second !== second) {
      this.messageCounts.set(id, { second, count: 1 });
      return true;
    }
    return ++entry.count <= MESSAGES_PER_SECOND;
  }

  private isHost(client: Client) {
    return client.sessionId === this.hostId;
  }

  private resetReady() {
    for (const p of this.players.values()) p.ready = false;
  }

  /** Ile osób może grać w tym, co wybrane (gra albo turniej); 0, gdy nic nie wybrano. */
  private maxSeats() {
    return this.tournament ? MAX_PLAYERS : this.gameId ? GAMES[this.gameId].maxPlayers : 0;
  }

  private toLobby() {
    this.phase = "lobby";
    this.vote = null;
    this.match = null;
    this.resetReady();
    this.turnTimer?.clear();
    this.turnEndsAt = null;
    if (!this.tournament) return;
    // Powrót na ekran turnieju: ustawienia zostają, tabela i lista gier nie.
    this.tournament = create(this.tournament.config);
    this.gameId = null;
  }

  /** Następna gra turnieju: po „Dalej” od wszystkich albo po NEXT_SECONDS. Po końcu turnieju to rewanż z nowym losowaniem. */
  private startTournamentGame() {
    // Zostali sami oglądający: nie ma komu grać.
    if (this.seats.length === 0) return this.toLobby();
    if (isDone(this.tournament!)) this.tournament = begin(this.tournament!, MINI_GAME_IDS, newRng());
    this.gameId = this.tournament!.games[this.tournament!.index];
    this.mode = null;
    this.resetReady();
    this.startMatch(GAMES[this.gameId]);
  }

  private maybeFinishVote() {
    if (this.vote && this.seats.every((id) => id in this.vote!.votes)) this.finishVote();
  }

  /** Kto wyszedł, nie głosuje; odpadają też opcje, na które jest już za mało osób. Nie zostaje żadna: lobby. */
  private voteAfterLeave(id: string) {
    const options = this.vote!.options.filter((option) => GAMES[option].minPlayers <= this.seats.length);
    if (options.length === 0) return this.toLobby();
    const votes = Object.entries(this.vote!.votes).filter(([voter, vote]) => voter !== id && options.includes(vote));
    this.vote = { options, votes: Object.fromEntries(votes) };
    this.maybeFinishVote();
  }

  /** Wynik głosowania rusza jak nowa gra: tryb domyślny, pełna instrukcja, bez skończonego turnieju. */
  private finishVote() {
    const gameId = voteWinner(this.vote!.options, this.vote!.votes, newRng());
    this.vote = null;
    this.turnTimer?.clear();
    this.turnEndsAt = null;
    this.tournament = null;
    this.markedBy = {};
    this.gameId = gameId;
    this.mode = defaultMode(GAMES[gameId]);
    try {
      this.startMatch(GAMES[gameId]);
    } catch (error) {
      // Jak w turnieju: błąd w zasadach gry nie może zostawić pokoju bez wyjścia.
      this.logError("start gry po głosowaniu", error);
      this.toLobby();
    }
  }

  private maybeRematch() {
    const def = this.gameId ? GAMES[this.gameId] : undefined;
    if (this.phase !== "over" || this.vote || !def || this.seats.length < def.minPlayers) return;
    if (!this.seats.every((id) => this.players.get(id)?.ready)) return;
    if (this.tournament) return this.startTournamentGame();
    // Na zmianę: kto zaczynał, w rewanżu rusza się ostatni. W mini-grach (minPlayers 1) wszyscy grają naraz,
    // więc rotacja nic nie daje, a tylko przestawia graczy w nagłówku i tabeli.
    if (def.minPlayers > 1) this.seats = [...this.seats.slice(1), this.seats[0]];
    this.resetReady();
    this.startMatch(def, REMATCH_INTRO_SECONDS, this.solo);
  }

  private startMatch(def: GameDefinition<unknown, unknown>, introSeconds = INTRO_SECONDS, skipIntro = false) {
    const rng = newRng();
    const nicks = this.seats.map((id) => this.players.get(id)?.nick ?? "?");
    this.match = { def, state: def.setup(this.seats, rng, this.mode ?? undefined), rng, result: null, players: this.seats.length, nicks };
    this.phase = "playing";
    this.began.clear();
    this.liveValues = {};
    this.liveCounts.clear();
    // Ekran instrukcji mają gry solo (te same, które lobby pokazuje jako „Szybkie”).
    this.intro = def.minPlayers === 1;
    this.countdown = false;
    this.skipIntro = this.intro && skipIntro;
    this.turnTimer?.clear();
    this.turnEndsAt = null;
    if (!this.intro) return this.startTurnTimer();
    if (this.seats.length === 1) return;
    this.turnEndsAt = Date.now() + introSeconds * 1000;
    this.turnTimer = this.clock.setTimeout(() => {
      this.startCountdown();
      this.update();
    }, introSeconds * 1000);
  }

  private startCountdown() {
    if (this.phase !== "playing" || !this.intro || this.countdown) return;
    if (this.seats.length === 1) return this.endIntro();
    this.turnTimer?.clear();
    this.countdown = true;
    this.turnEndsAt = Date.now() + COUNTDOWN_SECONDS * 1000;
    const match = this.match;
    this.turnTimer = this.clock.setTimeout(() => {
      if (this.phase !== "playing" || this.match !== match || !this.countdown) return;
      this.endIntro();
      this.update();
    }, COUNTDOWN_SECONDS * 1000);
  }

  private endIntro() {
    this.intro = false;
    this.countdown = false;
    this.skipIntro = false;
    this.began = new Set(this.seats);
    this.startTurnTimer();
  }

  private play(player: string, move: unknown, context: MoveContext) {
    const match = this.match!;
    if (!match.def.validateMove(match.state, player, move, context)) return;
    const before = match.def.waitingFor(match.state).join();
    const keyBefore = match.def.turn?.(match.state).key;
    match.state = match.def.applyMove(match.state, player, move, match.rng);
    const result = match.def.isOver(match.state);
    if (result) return this.finish(result);
    // Mini-gra ma jeden termin od końca odliczania: wynik ani próba nikomu go nie przesuwa.
    if (match.def.minPlayers === 1) return;
    if (match.def.turn) {
      if (match.def.turn(match.state).key !== keyBefore) this.startTurnTimer();
      return;
    }
    // Nowy limit, gdy zmienia się, na kogo czekamy, albo jeden gracz ma kolejny ruch (np. strzał po trafieniu).
    // Przestawianie statków w fazie równoczesnej nie przedłuża czasu.
    const after = match.def.waitingFor(match.state);
    if (after.join() !== before || after.length === 1) this.startTurnTimer();
  }

  private finish(result: GameResult, outcome: RoomGameOutcome = "completed") {
    if (!this.match) return;
    this.match.result = result;
    this.measure(outcome);
    this.phase = "over";
    this.resetReady();
    this.turnTimer?.clear();
    this.turnEndsAt = null;
    this.intro = false;
    this.countdown = false;
    // Kto wyszedł w trakcie, nie siedzi już w seats, więc nie dostaje porażki.
    const nick = (id: string) => this.players.get(id)?.nick ?? "?";
    const { def, state, rng } = this.match;
    const gamePlaces = result.ranking ? (result.places ?? def.places?.(state) ?? null) : null;
    const eveningPlaces = !this.solo && placesFromResult(result, gamePlaces, this.seats);
    if (eveningPlaces) {
      this.evening = addGame(this.evening, this.gameId!, this.seats.map((id) => ({ key: nickKey(nick(id)), nick: nick(id), place: eveningPlaces[id] })));
      this.eveningView = {
        games: this.evening.games.length,
        played: [...new Set([...this.eveningView.played, this.gameId!])],
        table: eveningTable(this.evening),
        titles: titles(this.evening),
      };
    }
    const win = (gameId: string, winnerId: string) => stats.record(gameId, this.seats.map(nick), nick(winnerId));
    if (result.winner) win(this.gameId!, result.winner);
    // Rekordy mini-gier: wynik każdego gracza, także solo. Gra przerwana nie ma rankingu, więc się nie zapisuje.
    const { record } = this.match.def;
    if (record && result.ranking) {
      const { state } = this.match;
      const finite = (n: number | undefined) => (n !== undefined && Number.isFinite(n) ? n : null);
      const scores = this.seats.map((id) => ({ nick: nick(id), score: record.score(state, id), tie: finite(record.tie?.score(state, id)), detail: soloState(state as { players: string[] }, id) }));
      stats.recordScores(this.gameId!, scores.filter((s) => Number.isFinite(s.score)), record);
    }
    if (!this.tournament) {
      if (result.winner) this.scores[result.winner] = (this.scores[result.winner] ?? 0) + 1;
      return;
    }
    // Turniej: punkty z miejsc (gra przerwana nie ma rankingu, więc nie daje punktów); wygrana w pokoju liczy się za cały turniej.
    this.tournament = advance(this.tournament, this.seats, gamePlaces, MINI_GAME_IDS, rng);
    if (isDone(this.tournament)) {
      const champion = winner(this.tournament, this.seats);
      if (!champion) return;
      this.scores[champion] = (this.scores[champion] ?? 0) + 1;
      return win(TOURNAMENT_ID, champion);
    }
    this.turnEndsAt = Date.now() + NEXT_SECONDS * 1000;
    this.turnTimer = this.clock.setTimeout(() => {
      try {
        this.startTournamentGame();
      } catch (error) {
        // Jak w limicie tury: błąd w zasadach gry nie może zabić procesu, turniej wraca do lobby.
        this.logError("następna gra turnieju", error);
        this.toLobby();
      }
      this.update();
    }, NEXT_SECONDS * 1000);
  }

  /** Jeden anonimowy wpis na partię; błąd zapisu pomiaru nie może zepsuć końca partii. */
  private measure(outcome: RoomGameOutcome) {
    const { players, nicks } = this.match!;
    try {
      stats.recordRoomGame({ roomKey: this.roomKey, gameId: this.gameId!, players, outcome, nicks });
    } catch (error) {
      this.logError("pomiar partii", error);
    }
  }

  /** Po limicie czasu serwer wykonuje ruch za gracza, który nie zdążył. */
  private startTurnTimer() {
    // Instrukcja i odliczanie nie zużywają limitu gry.
    if (this.intro) return;
    this.turnTimer?.clear();
    this.turnEndsAt = null;
    const { def, state, rng } = this.match!;
    const seconds = def.turn?.(state).seconds ?? def.turnSeconds;
    if (!seconds || !def.timeoutMove || def.waitingFor(state).length === 0) return;
    const ms = seconds * 1000;
    this.turnEndsAt = Date.now() + ms;
    this.turnTimer = this.clock.setTimeout(() => {
      // Ruch zastępczy za każdego, na kogo wciąż czekamy (w rozstawianiu może to być dwóch graczy).
      try {
        for (const player of def.waitingFor(this.match!.state)) {
          if (this.phase !== "playing") break;
          this.play(player, def.timeoutMove!(this.match!.state, player, rng), { source: "timeout" });
        }
      } catch (error) {
        // Bez ruchu zastępczego nie ruszyłby kolejny limit i partia wisiałaby bez końca, więc kończy się bez zwycięzcy.
        this.logError("ruch po limicie czasu", error);
        this.finish({}, "aborted");
      }
      this.update();
    }, ms);
  }

  private update() {
    for (const client of this.clients) client.send("room", this.viewFor(client.sessionId));
    this.touch();
  }

  private viewFor(id: string): RoomView {
    const match = this.match;
    return {
      code: this.roomId,
      hostId: this.hostId,
      players: [...this.players.values()],
      phase: this.phase,
      solo: this.solo,
      gameId: this.gameId,
      mode: this.mode,
      seats: this.seats,
      tournament: this.tournament,
      markedBy: this.markedBy,
      scores: this.scores,
      evening: this.eveningView,
      vote: this.vote && { ...this.vote, msLeft: Math.max(0, (this.turnEndsAt ?? 0) - Date.now()) },
      game: match && {
        // Obserwator dostaje widok gracza "", czyli bez czyichkolwiek ukrytych informacji.
        view: match.def.playerView(match.state, this.seats.includes(id) ? id : ""),
        waitingFor: match.def.waitingFor(match.state),
        msLeft: this.turnEndsAt && Math.max(0, this.turnEndsAt - Date.now()),
        intro: this.intro,
        countdown: this.countdown,
        skipIntro: this.intro && this.skipIntro,
        began: [...this.began],
        live: this.liveValues,
        result: match.result,
        places: match.result?.ranking ? (match.result.places ?? match.def.places?.(match.state) ?? null) : null,
      },
    };
  }

  /** Pokój bez żadnej zmiany przez godzinę jest zamykany. */
  private touch() {
    this.idle?.clear();
    this.idle = this.clock.setTimeout(() => this.disconnect(), IDLE_MS);
  }
}

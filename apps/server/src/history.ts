import type { DatabaseSync } from "node:sqlite";
import { addGame, eveningTable, GAMES, type Evening, nickKey } from "@kwadrans/games";

/** Gdzie toczyła się partia: pokój solo z ekranu głównego, zwykły pokój, turniej z ustawieniami albo szybka seria. */
export type MatchKind = "solo" | "room" | "tournament" | "quick";
/** Skąd wzięła się partia. Solo: miejsce na ekranie głównym, z którego gracz ją uruchomił. */
export type MatchSource = "host" | "vote" | "rematch" | "tournament" | "list" | "random" | "daily" | "records" | "import";
export const SOLO_SOURCES = ["list", "random", "daily", "records"] as const satisfies MatchSource[];
/** `stopped`: gospodarz przerwał; `aborted`: wyjście gracza bez walkowera albo błąd. */
export type MatchOutcome = "completed" | "walkover" | "aborted" | "stopped";
/** Liczniki per gra i dzień, bez nicków. */
export type Signal = "picked" | "dropped" | "voteShown" | "voteWon" | "howTo";
const SIGNALS: Signal[] = ["picked", "dropped", "voteShown", "voteWon", "howTo"];

export interface MatchEntry {
  /** Losowy klucz pokoju (nie kod): partie jednego wieczoru. */
  roomKey: string;
  gameId: string;
  mode: string | null;
  kind: MatchKind;
  source: MatchSource;
  startedAt: number;
  endedAt: number;
  /** Mini-gra: czy minęła instrukcja; gry główne zawsze true. */
  started: boolean;
  observers: number;
  outcome: MatchOutcome;
  reactions: number;
  /** Wszyscy, którzy siedzieli przy stole na starcie, w kolejności miejsc przy stole. */
  players: { nick: string; place: number | null; won: boolean; score: number | null; left: boolean; timeouts: number }[];
}

export interface HistoryRow {
  id: number;
  gameId: string;
  mode: string | null;
  kind: MatchKind;
  source: MatchSource;
  outcome: MatchOutcome;
  startedAt: number;
  endedAt: number;
  place: number | null;
  won: boolean;
  score: number | null;
  players: { key: string; nick: string; place: number | null; left: boolean }[];
}

export interface Profile {
  nick: string;
  firstAt: number;
  lastAt: number;
  /** Ukończone partie (także solo). */
  matches: number;
  days: number;
  favorite: string | null;
  games: { gameId: string; played: number; wins: number }[];
  rivals: { key: string; nick: string; matches: number; wins: number; losses: number; ties: number }[];
  evenings: { played: number; won: number };
  bestStreak: number;
}

export interface ReportGame {
  gameId: string;
  matches: number;
  completed: number;
  aborted: number;
  walkovers: number;
  players: number;
  solo: number;
  rematches: number;
  medianSeconds: number | null;
  introLeft: number;
  avgPlayers: number;
  timeoutsPerMatch: number;
  reactionsPerMatch: number;
  lastAt: number | null;
  picked: number;
  dropped: number;
  voteShown: number;
  voteWon: number;
  howTo: number;
}

export interface Report {
  games: ReportGame[];
  totals: { matches: number; players: number; days: number };
}

const HISTORY_PAGE = 20;
const RIVALS = 10;

/** Doba lokalna (TZ procesu) jako RRRR-MM-DD. */
export const localDay = (at: number) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Partie, które liczą się do rywalizacji: ukończone, z co najmniej dwiema osobami. */
const VERSUS = "m.outcome = 'completed' AND m.players >= 2";
const DAY_SQL = "date(m.started_at / 1000, 'unixepoch', 'localtime')";

/** Historia partii po nicku i raport gier. Tabele obok `results` i `scores`; `room_games` (bez nicków) zostaje osobno. */
export function openHistory(db: DatabaseSync, transaction: (fn: () => void) => void) {
  db.exec(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY, room_key TEXT NOT NULL, game_id TEXT NOT NULL, mode TEXT, kind TEXT NOT NULL, source TEXT NOT NULL,
    started_at INTEGER NOT NULL, ended_at INTEGER NOT NULL, started INTEGER NOT NULL, players INTEGER NOT NULL,
    observers INTEGER NOT NULL, outcome TEXT NOT NULL, reactions INTEGER NOT NULL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS match_players (
    match_id INTEGER NOT NULL, seat INTEGER NOT NULL, nick_key TEXT NOT NULL, nick TEXT NOT NULL, place INTEGER,
    won INTEGER NOT NULL, score REAL, left_early INTEGER NOT NULL, timeouts INTEGER NOT NULL, PRIMARY KEY (match_id, seat))`);
  db.exec("CREATE INDEX IF NOT EXISTS match_players_nick ON match_players (nick_key, match_id)");
  db.exec("CREATE INDEX IF NOT EXISTS matches_started ON matches (started_at)");
  db.exec(`CREATE TABLE IF NOT EXISTS game_signals (
    game_id TEXT NOT NULL, day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (game_id, day, kind))`);

  const insertMatch = db.prepare("INSERT INTO matches (room_key, game_id, mode, kind, source, started_at, ended_at, started, players, observers, outcome, reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const insertPlayer = db.prepare("INSERT INTO match_players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const upsertSignal = db.prepare("INSERT INTO game_signals VALUES (?, ?, ?, 1) ON CONFLICT (game_id, day, kind) DO UPDATE SET n = n + 1");

  const write = (entry: MatchEntry) => {
    const { lastInsertRowid } = insertMatch.run(
      entry.roomKey, entry.gameId, entry.mode, entry.kind, entry.source, entry.startedAt, entry.endedAt,
      Number(entry.started), entry.players.length, entry.observers, entry.outcome, entry.reactions,
    );
    entry.players.forEach((p, seat) => {
      const nick = p.nick.trim();
      insertPlayer.run(lastInsertRowid, seat, nickKey(nick), nick, p.place, Number(p.won), p.score, Number(p.left), p.timeouts);
    });
  };

  // Wersja 3: historia partii. Dotychczasowe wyniki stają się partiami `import` (bez czasu trwania i współgraczy solo), raz.
  if ((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version < 3) {
    transaction(() => {
      importOld(db, write);
      db.exec("PRAGMA user_version = 3");
    });
  }

  type PlayerRow = { match_id: number; nick_key: string; nick: string; place: number | null; left_early: number };
  const playersOf = (ids: number[]) => {
    if (ids.length === 0) return new Map<number, HistoryRow["players"]>();
    const rows = db.prepare(`SELECT match_id, nick_key, nick, place, left_early FROM match_players WHERE match_id IN (${ids.map(() => "?").join()}) ORDER BY match_id, seat`).all(...ids) as PlayerRow[];
    const byMatch = new Map<number, HistoryRow["players"]>();
    for (const r of rows) {
      const list = byMatch.get(r.match_id) ?? [];
      list.push({ key: r.nick_key, nick: r.nick, place: r.place, left: r.left_early === 1 });
      byMatch.set(r.match_id, list);
    }
    return byMatch;
  };

  return {
    recordMatch(entry: MatchEntry) {
      transaction(() => write(entry));
    },

    signal(gameId: string, kind: Signal, at = Date.now()) {
      upsertSignal.run(gameId, localDay(at), kind);
    },

    /** Partie gracza od najnowszej; `before` to id ostatniej partii poprzedniej strony. */
    history(key: string, before?: number, limit = HISTORY_PAGE): HistoryRow[] {
      const rows = db.prepare(`
        SELECT m.id, m.game_id, m.mode, m.kind, m.source, m.outcome, m.started_at, m.ended_at, me.place, me.won, me.score
        FROM match_players me JOIN matches m ON m.id = me.match_id
        WHERE me.nick_key = ? AND m.id < ? GROUP BY m.id ORDER BY m.id DESC LIMIT ?`).all(key, before ?? Number.MAX_SAFE_INTEGER, limit) as {
        id: number; game_id: string; mode: string | null; kind: MatchKind; source: MatchSource; outcome: MatchOutcome;
        started_at: number; ended_at: number; place: number | null; won: number; score: number | null;
      }[];
      const players = playersOf(rows.map((r) => r.id));
      return rows.map((r) => ({
        id: r.id, gameId: r.game_id, mode: r.mode, kind: r.kind, source: r.source, outcome: r.outcome,
        startedAt: r.started_at, endedAt: r.ended_at, place: r.place, won: r.won === 1, score: r.score,
        players: players.get(r.id) ?? [],
      }));
    },

    profile(key: string): Profile | null {
      const last = db.prepare("SELECT nick FROM match_players WHERE nick_key = ? ORDER BY match_id DESC LIMIT 1").get(key) as { nick: string } | undefined;
      if (!last) return null;
      const span = db.prepare("SELECT MIN(m.started_at) AS first, MAX(m.started_at) AS last FROM match_players me JOIN matches m ON m.id = me.match_id WHERE me.nick_key = ?").get(key) as { first: number; last: number };
      const done = db.prepare(`SELECT COUNT(DISTINCT m.id) AS matches, COUNT(DISTINCT ${DAY_SQL}) AS days FROM match_players me JOIN matches m ON m.id = me.match_id WHERE me.nick_key = ? AND m.outcome = 'completed'`).get(key) as { matches: number; days: number };
      const games = (db.prepare(`
        SELECT m.game_id AS gameId, COUNT(*) AS played, SUM(me.won AND m.players >= 2) AS wins, MAX(m.id) AS latest
        FROM match_players me JOIN matches m ON m.id = me.match_id
        WHERE me.nick_key = ? AND m.outcome = 'completed' GROUP BY m.game_id ORDER BY played DESC, latest DESC`).all(key) as { gameId: string; played: number; wins: number }[])
        .map(({ gameId, played, wins }) => ({ gameId, played, wins }));
      const rivals = (db.prepare(`
        SELECT them.nick_key AS key, COUNT(*) AS matches,
          SUM(me.place < them.place) AS wins, SUM(me.place > them.place) AS losses, SUM(me.place = them.place) AS ties,
          (SELECT nick FROM match_players WHERE nick_key = them.nick_key ORDER BY match_id DESC LIMIT 1) AS nick
        FROM match_players me JOIN matches m ON m.id = me.match_id JOIN match_players them ON them.match_id = me.match_id
        WHERE me.nick_key = ?1 AND them.nick_key != ?1 AND ${VERSUS} AND me.place IS NOT NULL AND them.place IS NOT NULL
        GROUP BY them.nick_key ORDER BY matches DESC, wins DESC, key LIMIT ${RIVALS}`).all(key) as Profile["rivals"])
        .map(({ key, nick, matches, wins, losses, ties }) => ({ key, nick, matches, wins, losses, ties }));

      // Seria: kolejne pierwsze miejsca (także remisowe) w ukończonych partiach z innymi.
      const places = db.prepare(`
        SELECT me.place FROM match_players me JOIN matches m ON m.id = me.match_id
        WHERE me.nick_key = ? AND ${VERSUS} AND me.place IS NOT NULL ORDER BY m.ended_at, m.id`).all(key) as { place: number }[];
      let bestStreak = 0;
      let streak = 0;
      for (const { place } of places) {
        streak = place === 1 ? streak + 1 : 0;
        bestStreak = Math.max(bestStreak, streak);
      }

      return {
        nick: last.nick, firstAt: span.first, lastAt: span.last, matches: done.matches, days: done.days,
        favorite: games[0]?.gameId ?? null, games, rivals, evenings: evenings(key), bestStreak,
      };
    },

    /** Każda gra z listy (także bez partii) od chwili `since`. */
    report(gameIds: string[], since: number): Report {
      const rows = db.prepare(`
        SELECT m.game_id, COUNT(*) AS matches, SUM(m.outcome = 'completed') AS completed, SUM(m.outcome IN ('aborted', 'stopped')) AS aborted,
          SUM(m.outcome = 'walkover') AS walkovers, SUM(m.kind = 'solo') AS solo, SUM(m.source = 'rematch') AS rematches,
          SUM(m.started = 0 AND m.outcome != 'completed') AS introLeft, AVG(m.players) AS avgPlayers, AVG(m.reactions) AS reactionsPerMatch,
          MAX(m.started_at) AS lastAt,
          (SELECT COUNT(DISTINCT p.nick_key) FROM match_players p JOIN matches x ON x.id = p.match_id WHERE x.game_id = m.game_id AND x.started_at >= ?1) AS players,
          (SELECT COALESCE(SUM(p.timeouts), 0) FROM match_players p JOIN matches x ON x.id = p.match_id WHERE x.game_id = m.game_id AND x.started_at >= ?1) AS timeouts
        FROM matches m WHERE m.started_at >= ?1 GROUP BY m.game_id`).all(since) as Record<string, number>[];
      const byGame = new Map(rows.map((r) => [r.game_id as unknown as string, r]));
      const durations = db.prepare("SELECT game_id, (ended_at - started_at) / 1000.0 AS s FROM matches WHERE started_at >= ? AND outcome = 'completed' AND source != 'import'").all(since) as { game_id: string; s: number }[];
      const signals = db.prepare("SELECT game_id, kind, SUM(n) AS n FROM game_signals WHERE day >= ? GROUP BY game_id, kind").all(localDay(since)) as { game_id: string; kind: Signal; n: number }[];
      const games = gameIds.map((gameId): ReportGame => {
        const r = byGame.get(gameId);
        const own = durations.filter((d) => d.game_id === gameId).map((d) => d.s);
        const sig = Object.fromEntries(SIGNALS.map((kind) => [kind, signals.find((s) => s.game_id === gameId && s.kind === kind)?.n ?? 0])) as Record<Signal, number>;
        const matches = r?.matches ?? 0;
        return {
          gameId, matches, completed: r?.completed ?? 0, aborted: r?.aborted ?? 0, walkovers: r?.walkovers ?? 0, players: r?.players ?? 0,
          solo: r?.solo ?? 0, rematches: r?.rematches ?? 0, medianSeconds: own.length ? median(own) : null, introLeft: r?.introLeft ?? 0,
          avgPlayers: r?.avgPlayers ?? 0, timeoutsPerMatch: matches ? (r!.timeouts ?? 0) / matches : 0, reactionsPerMatch: r?.reactionsPerMatch ?? 0,
          lastAt: r?.lastAt ?? null, ...sig,
        };
      });
      const totals = db.prepare(`
        SELECT COUNT(DISTINCT m.id) AS matches, COUNT(DISTINCT p.nick_key) AS players, COUNT(DISTINCT ${DAY_SQL}) AS days
        FROM matches m LEFT JOIN match_players p ON p.match_id = m.id WHERE m.started_at >= ?`).get(since) as Report["totals"];
      return { games, totals: { matches: totals.matches, players: totals.players, days: totals.days } };
    },
  };

  /** Wieczory gracza: pokoje (bez solo i importu) z co najmniej dwiema ukończonymi partiami z innymi; punkty jak w pokoju. */
  function evenings(key: string) {
    const rows = db.prepare(`
      SELECT m.room_key, m.id, m.game_id, p.nick_key, p.nick, p.place FROM matches m JOIN match_players p ON p.match_id = m.id
      WHERE ${VERSUS} AND m.kind != 'solo' AND m.source != 'import' AND p.place IS NOT NULL
        AND m.room_key IN (SELECT x.room_key FROM matches x JOIN match_players me ON me.match_id = x.id WHERE me.nick_key = ?)
      ORDER BY m.room_key, m.id, p.seat`).all(key) as { room_key: string; id: number; game_id: string; nick_key: string; nick: string; place: number }[];
    const rooms = new Map<string, Map<number, { gameId: string; rows: { key: string; nick: string; place: number }[] }>>();
    for (const r of rows) {
      const room = rooms.get(r.room_key) ?? new Map();
      rooms.set(r.room_key, room);
      const game = room.get(r.id) ?? { gameId: r.game_id, rows: [] };
      room.set(r.id, game);
      game.rows.push({ key: r.nick_key, nick: r.nick, place: r.place });
    }
    let played = 0;
    let won = 0;
    for (const room of rooms.values()) {
      let evening: Evening = { games: [], nicks: {} };
      for (const game of room.values()) evening = addGame(evening, game.gameId, game.rows);
      const table = eveningTable(evening);
      if (evening.games.length < 2 || !table.some((row) => row.key === key)) continue;
      played++;
      const best = Math.max(...table.map((row) => row.points));
      if (table.some((row) => row.key === key && row.points === best)) won++;
    }
    return { played, won };
  }
}

/** `results` (gry główne) i `scores` (mini-gry) jako partie; mistrz turnieju to nie partia, a wygrana mini-gry jest już w `scores`. */
function importOld(db: DatabaseSync, write: (entry: MatchEntry) => void) {
  type Group = { gameId: string; at: number; order: number; players: MatchEntry["players"] };
  const groups = new Map<string, Group>();
  const group = (gameId: string, at: number, order: number) => {
    const id = `${order}:${gameId}:${at}`;
    if (!groups.has(id)) groups.set(id, { gameId, at, order, players: [] });
    return groups.get(id)!;
  };
  const isMini = (gameId: string) => GAMES[gameId]?.minPlayers === 1;
  const results = db.prepare("SELECT game_id, nick, won, at FROM results ORDER BY rowid").all() as { game_id: string; nick: string; won: number; at: number }[];
  for (const r of results) {
    if (r.game_id === "turniej" || isMini(r.game_id)) continue;
    group(r.game_id, r.at, 0).players.push({ nick: r.nick, place: r.won ? 1 : 2, won: r.won === 1, score: null, left: false, timeouts: 0 });
  }
  const scores = db.prepare("SELECT game_id, nick, score, tie, at FROM scores ORDER BY rowid").all() as { game_id: string; nick: string; score: number; tie: number | null; at: number }[];
  const ties = new Map<object, number | null>();
  for (const s of scores) {
    const row = { nick: s.nick, place: null, won: false, score: s.score, left: false, timeouts: 0 };
    ties.set(row, s.tie);
    group(s.game_id, s.at, 1).players.push(row);
  }
  for (const g of [...groups.values()].sort((a, b) => a.at - b.at || a.order - b.order)) {
    const record = GAMES[g.gameId]?.record;
    if (g.order === 1 && record) {
      const dir = (lower: boolean) => (lower ? 1 : -1);
      const cmp = (a: MatchEntry["players"][number], b: MatchEntry["players"][number]) => {
        const main = (a.score! - b.score!) * dir(record.lower);
        if (main) return main;
        const ta = ties.get(a) ?? null;
        const tb = ties.get(b) ?? null;
        if (ta === null || tb === null) return ta === tb ? 0 : ta === null ? 1 : -1;
        return (ta - tb) * dir(record.tie?.lower ?? true);
      };
      for (const p of g.players) p.place = 1 + g.players.filter((o) => cmp(o, p) < 0).length;
      const firsts = g.players.filter((p) => p.place === 1);
      if (g.players.length >= 2 && firsts.length === 1) firsts[0].won = true;
    }
    write({
      roomKey: "import", gameId: g.gameId, mode: null, kind: g.order === 1 && g.players.length === 1 ? "solo" : "room", source: "import",
      startedAt: g.at, endedAt: g.at, started: true, observers: 0, outcome: "completed", reactions: 0, players: g.players,
    });
  }
}

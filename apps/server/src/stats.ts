import { DatabaseSync } from "node:sqlite";
import { nickKey, type RecordOrder, type RecordRow } from "@kwadrans/games";

const TOP = 10;

export type RoomGameOutcome = "completed" | "walkover" | "aborted";

export interface RoomGameEntry {
  roomKey: string;
  gameId: string;
  /** Ile osób siedziało przy stole, gdy partia ruszyła (wyjście w trakcie tego nie zmienia). */
  players: number;
  outcome: RoomGameOutcome;
  nicks: string[];
  at?: number;
}

export interface Metrics {
  medianGames: number;
  nextRate: number;
  rooms3Plus: number;
  returningNicks: number;
  interrupted: number;
}

/** Doba lokalna (TZ procesu) jako RRRR-MM-DD. */
const localDay = (at: number) => {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export interface RankingRow {
  nick: string;
  wins: number;
  played: number;
}

/**
 * Wyniki partii po nicku, bez kont. Gracza rozpoznaje `nickKey` („Ala” i „ala” to jedna osoba), pokazujemy ostatnią pisownię.
 * Ranking per gra: najwięcej wygranych, przy remisie mniej partii. Rekordy mini-gier: najlepszy wynik gracza.
 */
export function openStats(path: string) {
  const db = new DatabaseSync(path);
  db.function("nick_key", { deterministic: true }, (nick) => nickKey(String(nick)));
  db.exec("CREATE TABLE IF NOT EXISTS results (game_id TEXT NOT NULL, nick TEXT NOT NULL, won INTEGER NOT NULL, at INTEGER NOT NULL)");
  db.exec("CREATE TABLE IF NOT EXISTS scores (game_id TEXT NOT NULL, nick TEXT NOT NULL, score REAL NOT NULL, tie REAL, at INTEGER NOT NULL)");
  // Wersja 1: Refleks liczy średnią reakcji w ms zamiast trafień, więc stary rekord („20”) byłby nie do pobicia.
  // Balon, Przytrzymaj, Policz kropki, Kolor liter i Inny element dostały tylko wyrównane losowanie: ich rekordy zostają.
  if ((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version < 1) {
    db.exec("DELETE FROM scores WHERE game_id = 'refleks'");
    db.exec("PRAGMA user_version = 1");
  }
  // Wersja 2: `detail` to rekordowa partia gry (JSON ze stanem jednego gracza); starsze rekordy jej nie mają.
  if ((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version < 2) {
    db.exec("ALTER TABLE scores ADD COLUMN detail TEXT");
    db.exec("PRAGMA user_version = 2");
  }
  // Pomiar atrakcyjności (plan §10): wpis na partię w pokoju, bez nicków; klucz pokoju jest losowy, nie kod pokoju.
  db.exec("CREATE TABLE IF NOT EXISTS room_games (room_key TEXT NOT NULL, game_id TEXT NOT NULL, players INTEGER NOT NULL, outcome TEXT NOT NULL, at INTEGER NOT NULL)");
  // Dni gry bez pokoju i gry (D-09): tylko osoba i doba lokalna, do liczenia powrotów.
  db.exec("CREATE TABLE IF NOT EXISTS played_days (nick_key TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY (nick_key, day))");
  // Zapis pokoi: jeden wiersz na pokój (JSON z `LobbyRoom.snapshot`), żyje od punktu kontrolnego do odtworzenia albo zamknięcia pokoju.
  db.exec("CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, json TEXT NOT NULL, at INTEGER NOT NULL)");
  const upsertRoom = db.prepare("INSERT INTO rooms VALUES (?1, ?2, ?3) ON CONFLICT (code) DO UPDATE SET json = ?2, at = ?3");
  const deleteRoom = db.prepare("DELETE FROM rooms WHERE code = ?");
  const selectRooms = db.prepare("SELECT code, json FROM rooms WHERE at >= ? ORDER BY at, code");
  const insert = db.prepare("INSERT INTO results VALUES (?, ?, ?, ?)");
  const insertRoomGame = db.prepare("INSERT INTO room_games VALUES (?, ?, ?, ?, ?)");
  const insertDay = db.prepare("INSERT OR IGNORE INTO played_days VALUES (?, ?)");
  // Jedyny agregat min/max w zapytaniu, więc `nick` pochodzi z wiersza o największym rowid, czyli z ostatniej partii.
  const select = db.prepare(
    "SELECT game_id, nick, SUM(won) AS wins, COUNT(*) AS played, MAX(rowid) FROM results GROUP BY game_id, nick_key(nick) ORDER BY wins DESC, played ASC, nick",
  );
  const insertScore = db.prepare("INSERT INTO scores (game_id, nick, score, tie, at, detail) VALUES (?, ?, ?, ?, ?, ?)");
  // Najlepszy wiersz każdego gracza: główny wynik, potem drugie kryterium, a przy całkiem równych wcześniejszy (mniejszy rowid).
  const best = (order: string) =>
    db.prepare(`
      SELECT nick, best, tie, played FROM (
        SELECT rowid AS id, score AS best, tie,
          COUNT(*) OVER (PARTITION BY nick_key(nick)) AS played,
          FIRST_VALUE(nick) OVER (PARTITION BY nick_key(nick) ORDER BY rowid DESC) AS nick,
          ROW_NUMBER() OVER (PARTITION BY nick_key(nick) ORDER BY ${order}, rowid) AS n
        FROM scores WHERE game_id = ? AND at >= ?
      ) WHERE n = 1 ORDER BY ${order.replace("score", "best")}, id`);
  // Najlepszy wiersz całej gry, w tej samej kolejności co wyżej: jego partię pokazuje ranking, reszta jej nie trzyma.
  const leader = (order: string) => `SELECT rowid FROM scores WHERE game_id = ?1 ORDER BY ${order}, rowid LIMIT 1`;
  const statements = (order: string) => ({
    best: best(order),
    top: db.prepare(`SELECT detail FROM scores WHERE rowid = (${leader(order)})`),
    trim: db.prepare(`UPDATE scores SET detail = NULL WHERE game_id = ?1 AND detail IS NOT NULL AND rowid != (${leader(order)})`),
  });
  const dir = (lower: boolean) => (lower ? "ASC" : "DESC");
  const queries = new Map<string, ReturnType<typeof statements>>();
  const query = ({ lower, tie }: RecordOrder) => {
    const order = `score ${dir(lower)}, tie ${dir(tie?.lower ?? true)} NULLS LAST`;
    if (!queries.has(order)) queries.set(order, statements(order));
    return queries.get(order)!;
  };

  // Bez ROLLBACK po błędzie transakcja zostaje otwarta i każdy kolejny BEGIN rzuca aż do restartu.
  const transaction = (fn: () => void) => {
    db.exec("BEGIN");
    try {
      fn();
      db.exec("COMMIT");
    } catch (error) {
      // Część błędów (np. pełny dysk) SQLite wycofuje sam; wtedy ROLLBACK rzuca i zasłoniłby pierwotny błąd.
      try {
        db.exec("ROLLBACK");
      } catch {}
      throw error;
    }
  };

  return {
    record(gameId: string, nicks: string[], winner: string) {
      const at = Date.now();
      transaction(() => {
        for (const nick of nicks) insert.run(gameId, nick, Number(nick === winner), at);
      });
    },

    /** Jeden wpis na partię w pokoju. Dzień gry dopisuje tylko ukończona partia co najmniej dwóch osób (solo, walkover i przerwana się nie liczą). */
    recordRoomGame({ roomKey, gameId, players, outcome, nicks, at = Date.now() }: RoomGameEntry) {
      transaction(() => {
        insertRoomGame.run(roomKey, gameId, players, outcome, at);
        if (outcome === "completed" && players >= 2) for (const nick of nicks) insertDay.run(nickKey(nick), localDay(at));
      });
    },

    /** Miary z planu §10 od chwili `since`; ułamki 0-1 bez zaokrąglania. Pokoje bez żadnej partii z 2+ osobami nie wchodzą do miar. */
    metrics(since: number): Metrics {
      const rows = db.prepare("SELECT room_key, players, outcome FROM room_games WHERE at >= ? ORDER BY at, rowid").all(since) as { room_key: string; players: number; outcome: RoomGameOutcome }[];
      const rooms = new Map<string, { completed: number }>();
      let completed = 0;
      let followed = 0;
      let interrupted = 0;
      for (const { room_key, players, outcome } of rows) {
        if (players < 2) continue;
        const room = rooms.get(room_key) ?? { completed: 0 };
        rooms.set(room_key, room);
        if (outcome !== "completed") {
          interrupted++;
          continue;
        }
        // Każda ukończona partia poza pierwszą jest „kolejną” dla poprzedniej.
        if (room.completed > 0) followed++;
        room.completed++;
        completed++;
      }
      const counts = [...rooms.values()].map((r) => r.completed);
      const days = db.prepare("SELECT COUNT(*) AS n FROM (SELECT nick_key FROM played_days WHERE day >= ? GROUP BY nick_key HAVING COUNT(*) >= 2)").get(localDay(since)) as { n: number };
      return {
        medianGames: median(counts),
        nextRate: completed ? followed / completed : 0,
        rooms3Plus: counts.length ? counts.filter((n) => n >= 3).length / counts.length : 0,
        returningNicks: days.n,
        interrupted,
      };
    },

    saveRoom(code: string, json: string, at = Date.now()) {
      upsertRoom.run(code, json, at);
    },

    dropRoom(code: string) {
      deleteRoom.run(code);
    },

    /** Zapisane pokoje nie starsze niż `since`; tabela zostaje pusta, więc każdy zapis odtwarza się najwyżej raz. */
    takeRooms(since: number): { code: string; json: string }[] {
      let rows: { code: string; json: string }[] = [];
      transaction(() => {
        rows = selectRooms.all(since) as { code: string; json: string }[];
        db.exec("DELETE FROM rooms");
      });
      return rows;
    },

    ranking() {
      const byGame: Record<string, RankingRow[]> = {};
      for (const row of select.all() as { game_id: string; nick: string; wins: number; played: number }[]) {
        const rows = (byGame[row.game_id] ??= []);
        if (rows.length < TOP) rows.push({ nick: row.nick, wins: row.wins, played: row.played });
      }
      return byGame;
    },

    /**
     * Wynik każdego gracza po skończonej mini-grze (także solo); `tie` to drugie kryterium albo null.
     * `detail` to partia gracza (stan z `soloState`); z `order` w bazie zostaje tylko partia lidera gry, żeby baza nie puchła od rysunków.
     */
    recordScores(gameId: string, rows: { nick: string; score: number; tie: number | null; detail?: unknown }[], order?: RecordOrder) {
      const at = Date.now();
      transaction(() => {
        for (const { nick, score, tie, detail } of rows) insertScore.run(gameId, nick, score, tie, at, detail === undefined ? null : JSON.stringify(detail));
        if (order) query(order).trim.run(gameId);
      });
    },

    /** Partia, w której padł rekord gry, albo null (brak wyników albo rekord sprzed zapisu partii). */
    top(game: { id: string } & RecordOrder): unknown {
      const row = query(game).top.get(game.id) as { detail: string | null } | undefined;
      return row?.detail ? JSON.parse(row.detail) : null;
    },

    // ponytail: wszyscy gracze każdej gry w jednej odpowiedzi (klient liczy z niej miejsca); przy setkach nicków limit i osobne zapytanie o miejsce gracza
    /** `since` zawęża do wyników od tej chwili (ranking wyzwania dnia). */
    records(games: ({ id: string } & RecordOrder)[], since = 0): Record<string, RecordRow[]> {
      return Object.fromEntries(games.map((game) => [game.id, query(game).best.all(game.id, since) as unknown as RecordRow[]]));
    },
  };
}

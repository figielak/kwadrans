import { DatabaseSync } from "node:sqlite";
import { nickKey, type RecordOrder, type RecordRow } from "@mini-games/games";

const TOP = 10;

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
  // Wersja 1: Balon, Refleks, Przytrzymaj, Policz kropki, Kolor liter i Inny element dostały wyrównane losowanie (Refleks także nową jednostkę),
  // stare rekordy nie są porównywalne.
  if ((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version < 1) {
    db.exec("DELETE FROM scores WHERE game_id IN ('balon', 'refleks', 'przytrzymaj', 'kropki', 'stroop', 'inny')");
    db.exec("PRAGMA user_version = 1");
  }
  // Wersja 2: `detail` to rekordowa partia gry (JSON ze stanem jednego gracza); starsze rekordy jej nie mają.
  if ((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version < 2) {
    db.exec("ALTER TABLE scores ADD COLUMN detail TEXT");
    db.exec("PRAGMA user_version = 2");
  }
  const insert = db.prepare("INSERT INTO results VALUES (?, ?, ?, ?)");
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

  return {
    record(gameId: string, nicks: string[], winner: string) {
      const at = Date.now();
      db.exec("BEGIN");
      for (const nick of nicks) insert.run(gameId, nick, Number(nick === winner), at);
      db.exec("COMMIT");
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
      db.exec("BEGIN");
      for (const { nick, score, tie, detail } of rows) insertScore.run(gameId, nick, score, tie, at, detail === undefined ? null : JSON.stringify(detail));
      if (order) query(order).trim.run(gameId);
      db.exec("COMMIT");
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

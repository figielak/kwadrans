// Odczyt miar pomiaru (plan §10) na Pi: `node src/metrics.ts [dni]`, baza z `DB_PATH`. Wypisuje JSON.
import { openStats } from "./stats.ts";

const days = Number(process.argv[2] ?? 7);
if (!Number.isFinite(days) || days <= 0) {
  console.error("Użycie: node src/metrics.ts [liczba dni, domyślnie 7]");
  process.exit(1);
}
const since = Date.now() - days * 24 * 60 * 60 * 1000;
console.log(JSON.stringify({ days, since: new Date(since).toISOString(), ...openStats(process.env.DB_PATH ?? "data/games.db").metrics(since) }, null, 2));

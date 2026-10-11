import { ArrowLeft, CaretDown, Play } from "@phosphor-icons/react";
import { compareRecords, GAMES, KOLOR_COUNT, MINI_GAME_IDS, nickKey, type RecordRow, standing } from "@mini-games/games";
import { type CSSProperties, useEffect, useState } from "react";
import { fetchRecords } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { Screen, Stats } from "./ui.tsx";

const num = (n: number) => n.toFixed(1).replace(".", ",");
const plural = (n: number, one: string, few: string, many: string) => `${n} ${n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? few : many}`;
const hits = (n: number) => `${n} traf.`;
const points = (n: number) => `${n} pkt`;
const ms = (n: number) => `${n} ms`;
const tenthsPercent = (n: number) => `${num(n / 10)}%`;

/**
 * Wynik zapisany tak, jak pokazuje go gra. `gap` osobno tam, gdzie różnica dwóch wyników nie jest wynikiem (Odcień: zgodność w %).
 * `tie` to drugie kryterium gry (średnia reakcji, trafione cele, szerokość klocka), pokazywane obok wyniku.
 */
const FORMAT: Record<string, { value: (n: number) => string; gap?: (n: number) => string; tie?: (n: number) => string }> = {
  refleks: { value: hits, tie: ms },
  stroop: { value: hits, tie: ms },
  liczenie: { value: hits, tie: ms },
  inny: { value: hits, tie: ms },
  obrot: { value: points, tie: ms },
  stoj: { value: points, tie: ms },
  simon: { value: points },
  sledzenie: { value: (n) => plural(n, "runda", "rundy", "rund"), tie: (n) => plural(n, "cel", "cele", "celów") },
  wieza: { value: (n) => plural(n, "piętro", "piętra", "pięter"), tie: (n) => `${Math.round(n * 100)}%` },
  kolo: { value: tenthsPercent },
  stoper: { value: ms },
  rytm: { value: ms },
  przytrzymaj: { value: ms },
  schulte: { value: (n) => `${num(n / 1000)} s` },
  kolor: { value: (n) => `${num(100 - n / (10 * KOLOR_COUNT))}%`, gap: (n) => `${num(n / (10 * KOLOR_COUNT))}%` },
  kropki: { value: (n) => plural(n, "kropka", "kropki", "kropek") },
  kat: { value: (n) => `${n}°` },
  rok: { value: (n) => plural(n, "rok", "lata", "lat") },
  srodek: { value: tenthsPercent },
  mapa: { value: (n) => `${n} km` },
};

type Score = { best: number; tie: number | null };

const formatBest = (gameId: string, n: number) => (FORMAT[gameId]?.value ?? String)(n);
const formatTie = (gameId: string, n: number | null) => (n === null ? null : (FORMAT[gameId]?.tie?.(n) ?? null));
/** „12 traf. · 256 ms”: wynik z drugim kryterium, jeśli gra je ma. */
export const formatRecord = (gameId: string, { best, tie }: Score) => [formatBest(gameId, best), formatTie(gameId, tie)].filter(Boolean).join(" · ");
/** Różnica dwóch rekordów: w głównym wyniku albo, przy równym, w drugim kryterium. */
const formatGap = (gameId: string, { gap, onTie }: { gap: number; onTie: boolean }) =>
  ((onTie ? FORMAT[gameId]?.tie : (FORMAT[gameId]?.gap ?? FORMAT[gameId]?.value)) ?? String)(gap);

const orderOf = (gameId: string) => GAMES[gameId].record!;
/** Miejsce wiersza w posortowanej liście; remis = to samo miejsce. */
const placeAt = (gameId: string, rows: RecordRow[], i: number) => rows.findIndex((r) => compareRecords(orderOf(gameId))(r, rows[i]) === 0) + 1;
/** Jaka część rankingu jest za graczem: 1 u lidera, 0 na końcu. */
const ahead = (place: number, of: number) => (of > 1 ? (of - place) / (of - 1) : 1);

/** Pasek pozycji w rankingu: im pełniejszy, tym wyżej. */
function PlaceBar({ place, of, color }: { place: number; of: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
      <div className={`h-full rounded-full ${color ? "" : "bg-accent"}`} style={{ width: `${Math.max(4, ahead(place, of) * 100)}%`, backgroundColor: color }} />
    </div>
  );
}

/** Ranking rekordów jednej gry: czołówka, a gdy mój wiersz jest niżej, dochodzi na końcu z prawdziwym miejscem. */
export function RecordList({ gameId, rows, me, color, limit = 5 }: { gameId: string; rows: RecordRow[]; me: string | null; color?: string; limit?: number }) {
  if (rows.length === 0) return <p className="text-sm text-fg-muted">Nikt jeszcze nie grał. Pierwszy wynik będzie rekordem.</p>;
  const mine = me ? rows.findIndex((r) => nickKey(r.nick) === nickKey(me)) : -1;
  const shown = rows.slice(0, limit).map((_, i) => i);
  if (mine >= limit) shown.push(mine);
  return (
    <ol className="flex flex-col text-sm">
      {shown.map((i) => (
        <li
          key={rows[i].nick}
          className={`flex gap-3 py-0.5 ${i === mine && !color ? "text-accent" : ""} ${i === mine && i >= limit ? "mt-1 border-t border-line pt-1.5" : ""}`}
          style={i === mine ? { color } : undefined}
        >
          <span className={`w-6 font-mono tabular-nums ${i === mine ? "" : "text-fg-subtle"}`}>{placeAt(gameId, rows, i)}.</span>
          <span className="min-w-0 flex-1 truncate">
            {rows[i].nick}
            {i === mine && " (ty)"}
          </span>
          <span className="font-mono tabular-nums">
            {formatBest(gameId, rows[i].best)}
            {formatTie(gameId, rows[i].tie) && <span className="opacity-60"> · {formatTie(gameId, rows[i].tie)}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

interface PanelProps {
  gameId: string;
  /** Rekordy sprzed partii (null: nie zdążyły dojść albo strona była odświeżana) i po niej. */
  before: RecordRow[] | null;
  after: RecordRow[];
  nick: string;
  color?: string;
  /** Wynik z tej partii (z drugim kryterium); brak u obserwatora. */
  score?: Score;
}

/** Po partii: gdzie jestem w rankingu wszech czasów, czy padł rekord i ile brakuje do osoby wyżej. */
export function RecordPanel({ gameId, before, after, nick, color, score }: PanelProps) {
  const order = orderOf(gameId);
  const now = score === undefined ? null : standing(after, nick, order);
  const title = <h2 className="label">Rekordy · {GAMES[gameId].name}</h2>;
  if (!now || score === undefined) {
    return (
      <section className="tile flex flex-col gap-3 p-4">
        {title}
        <RecordList gameId={gameId} rows={after} me={nick} color={color} />
      </section>
    );
  }
  const was = before && standing(before, nick, order);
  const fresh = !!before && (!was || compareRecords(order)(now, was) < 0);
  // Ile zabrakło do własnego rekordu: w głównym wyniku albo, przy równym, w drugim kryterium.
  const missed =
    score.best !== now.best
      ? { gap: Math.abs(score.best - now.best), onTie: false }
      : score.tie !== null && now.tie !== null && score.tie !== now.tie
        ? { gap: Math.abs(score.tie - now.tie), onTie: true }
        : null;

  return (
    <section className="tile flex flex-col gap-3 p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        {title}
        {fresh && (
          <span
            className="animate-[set-glow_0.9s_ease-in-out_4] rounded-full border border-success px-3 py-0.5 text-sm font-semibold text-success"
            style={{ "--glow": "var(--color-success)" } as CSSProperties}
          >
            Nowy rekord!
          </span>
        )}
      </div>

      <div>
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums" style={{ color }}>
            {now.place}. miejsce
          </span>
          <span className="font-mono text-sm text-fg-muted">z {now.of}</span>
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          {was && was.place > now.place ? `Awans z ${was.place}. miejsca. ` : ""}
          {fresh
            ? was
              ? `Poprzedni rekord: ${formatRecord(gameId, was)}.`
              : "Twój pierwszy wynik w tej grze."
            : missed
              ? `Twój rekord: ${formatRecord(gameId, now)}, teraz zabrakło ${formatGap(gameId, missed)}.`
              : `Wyrównany rekord: ${formatRecord(gameId, now)}.`}
        </p>
      </div>

      {now.of > 1 && <PlaceBar place={now.place} of={now.of} color={color} />}

      {(now.ahead || now.behind) && (
        <p className="text-sm">
          {now.ahead ? (
            <>
              Wyżej: {now.ahead.nick}, brakuje <span className="font-mono font-semibold tabular-nums">{formatGap(gameId, now.ahead)}</span>
            </>
          ) : (
            <>
              Prowadzisz, przewaga <span className="font-mono font-semibold tabular-nums">{formatGap(gameId, now.behind!)}</span> nad: {now.behind!.nick}
            </>
          )}
        </p>
      )}

      <RecordList gameId={gameId} rows={after} me={nick} color={color} />
    </section>
  );
}

/** Ekran „Rekordy”: wszystkie mini-gry naraz, od tych, w których gracz jest najwyżej. */
export function Records({ nick, color, onBack }: { nick: string | null; color?: string; onBack: () => void }) {
  const [records, setRecords] = useState<Record<string, RecordRow[]> | null>(null);
  useEffect(() => {
    fetchRecords().then(setRecords);
  }, []);

  const games = MINI_GAME_IDS.map((id) => {
    const rows = records?.[id] ?? [];
    return { id, rows, mine: nick ? standing(rows, nick, orderOf(id)) : null };
  }).sort((a, b) => (a.mine?.place ?? Infinity) - (b.mine?.place ?? Infinity) || (b.mine?.of ?? 0) - (a.mine?.of ?? 0));
  const played = games.filter((g) => g.mine);

  return (
    <Screen dropped={false}>
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden />
        Wróć
      </button>
      <h1 className="text-3xl font-semibold tracking-tight">Rekordy</h1>

      {records === null ? (
        <p className="text-fg-muted" aria-busy>
          Wczytywanie…
        </p>
      ) : (
        <>
          {played.length > 0 ? (
            <Stats
              items={[
                { label: "Twoje gry", value: `${played.length}/${games.length}` },
                { label: "1. miejsca", value: played.filter((g) => g.mine!.place === 1).length },
                { label: "Podium", value: played.filter((g) => g.mine!.place <= 3).length },
              ]}
            />
          ) : (
            <p className="text-sm text-fg-muted">{nick ? "Nie masz jeszcze żadnego wyniku. Zagraj w mini-grę, a trafisz do rankingu." : "Wpisz nick, żeby zobaczyć swoje miejsca."}</p>
          )}

          <ul className="flex flex-col gap-2">
            {games.map(({ id, rows, mine }) => {
              const GameIcon = ICONS[id] ?? Play;
              return (
                <li key={id}>
                  <details className="group rounded-inset border border-line bg-surface">
                    <summary className="flex min-h-14 cursor-pointer list-none flex-col justify-center gap-1.5 px-3 py-2 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3">
                        <GameIcon size={20} className="shrink-0" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{GAMES[id].name}</span>
                        {mine ? (
                          <span className="font-mono text-sm tabular-nums">
                            <span className="font-semibold">{mine.place}.</span>
                            <span className="text-fg-muted"> z {mine.of}</span>
                          </span>
                        ) : (
                          <span className="truncate text-sm text-fg-muted">{rows[0] ? `${rows[0].nick}: ${formatRecord(id, rows[0])}` : "brak wyników"}</span>
                        )}
                        <CaretDown size={14} className="shrink-0 text-fg-muted transition-transform group-open:rotate-180" aria-hidden />
                      </span>
                      {mine && (
                        <span className="flex items-center gap-3">
                          <span className="flex-1">
                            <PlaceBar place={mine.place} of={mine.of} color={color} />
                          </span>
                          <span className="font-mono text-xs text-fg-muted tabular-nums">{formatRecord(id, mine)}</span>
                        </span>
                      )}
                    </summary>
                    <div className="border-t border-line px-3 py-2">
                      <RecordList gameId={id} rows={rows} me={nick} color={color} limit={10} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Screen>
  );
}

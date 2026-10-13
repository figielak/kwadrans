import { ArrowLeft, CaretDown, Crown, Play } from "@phosphor-icons/react";
import { compareRecords, GAMES, KOLOR_COUNT, MINI_GAME_IDS, nickKey, type RecordRow, SOLO, standing, TOURNAMENT_ID } from "@mini-games/games";
import { type CSSProperties, useEffect, useState } from "react";
import { MiniGame } from "../games/MiniGame.tsx";
import { fetchRanking, fetchRecords, fetchTopRecord, type RankingRow } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { Screen } from "./ui.tsx";

const num = (n: number) => n.toFixed(1).replace(".", ",");
export const plural = (n: number, one: string, few: string, many: string) => `${n} ${n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? few : many}`;
const hits = (n: number) => `${n} traf.`;
const points = (n: number) => `${n} pkt`;
const ms = (n: number) => `${n} ms`;
const tenthsPercent = (n: number) => `${num(n / 10)}%`;

/**
 * Wynik zapisany tak, jak pokazuje go gra. `gap` osobno tam, gdzie różnica dwóch wyników nie jest wynikiem (Odcień: zgodność w %).
 * `tie` to drugie kryterium gry (średnia reakcji, trafione cele, szerokość klocka), pokazywane obok wyniku.
 */
const FORMAT: Record<string, { value: (n: number) => string; gap?: (n: number) => string; tie?: (n: number) => string }> = {
  refleks: { value: ms },
  stroop: { value: hits, tie: ms },
  liczenie: { value: hits, tie: ms },
  inny: { value: hits, tie: ms },
  dziesiatki: { value: (n) => plural(n, "para", "pary", "par"), tie: ms },
  obrot: { value: points, tie: ms },
  literowka: { value: points, tie: ms },
  stoj: { value: points, tie: ms },
  simon: { value: points },
  kubki: { value: (n) => plural(n, "runda", "rundy", "rund") },
  sledzenie: { value: (n) => plural(n, "runda", "rundy", "rund"), tie: (n) => plural(n, "cel", "cele", "celów") },
  "w-pamieci": { value: (n) => plural(n, "runda", "rundy", "rund"), tie: (n) => `o ${n}` },
  wieza: { value: (n) => plural(n, "piętro", "piętra", "pięter"), tie: (n) => `${Math.round(n * 100)}%` },
  kolo: { value: tenthsPercent },
  stoper: { value: ms },
  rytm: { value: ms },
  przytrzymaj: { value: ms },
  zaslona: { value: ms },
  balon: { value: points, tie: (n) => plural(n, "pęknięty", "pęknięte", "pękniętych") },
  schulte: { value: (n) => `${num(n / 1000)} s` },
  sudoku: { value: (n) => `${num(n / 1000)} s` },
  kolor: { value: (n) => `${num(100 - n / (10 * KOLOR_COUNT))}%`, gap: (n) => `${num(n / (10 * KOLOR_COUNT))}%` },
  kropki: { value: (n) => plural(n, "kropka", "kropki", "kropek") },
  kat: { value: (n) => `${n}°` },
  rok: { value: (n) => plural(n, "rok", "lata", "lat") },
  srodek: { value: tenthsPercent },
  tort: { value: tenthsPercent },
  zakupy: { value: points, tie: (n) => `${num(n / 1000)} s` },
  nozyczki: { value: tenthsPercent },
  mapa: { value: (n) => `${n} km` },
};

type Score = { best: number; tie: number | null };

export const formatBest = (gameId: string, n: number) => (FORMAT[gameId]?.value ?? String)(n);
const formatTie = (gameId: string, n: number | null) => (n === null ? null : (FORMAT[gameId]?.tie?.(n) ?? null));
/** „12 traf. · 256 ms”: wynik z drugim kryterium, jeśli gra je ma. */
export const formatRecord = (gameId: string, { best, tie }: Score) => [formatBest(gameId, best), formatTie(gameId, tie)].filter(Boolean).join(" · ");
/** Różnica dwóch rekordów: w głównym wyniku albo, przy równym, w drugim kryterium. */
const formatGap = (gameId: string, { gap, onTie }: { gap: number; onTie: boolean }) =>
  ((onTie ? FORMAT[gameId]?.tie : (FORMAT[gameId]?.gap ?? FORMAT[gameId]?.value)) ?? String)(gap);

const orderOf = (gameId: string) => GAMES[gameId].record!;
/** Miejsce wiersza w posortowanej liście; remis = to samo miejsce. */
const placeAt = (gameId: string, rows: RecordRow[], i: number) => rows.findIndex((r) => compareRecords(orderOf(gameId))(r, rows[i]) === 0) + 1;
/** Ranking rekordów jednej gry: czołówka, a gdy mój wiersz jest niżej, dochodzi na końcu z prawdziwym miejscem. */
export function RecordList({ gameId, rows, me, color, limit = 5 }: { gameId: string; rows: RecordRow[]; me: string | null; color?: string; limit?: number }) {
  if (rows.length === 0) return <p className="text-sm text-fg-muted">Nikt jeszcze nie grał. Pierwszy wynik będzie rekordem.</p>;
  const mine = me ? rows.findIndex((r) => nickKey(r.nick) === nickKey(me)) : -1;
  const shown = rows.slice(0, limit).map((_, i) => i);
  if (mine >= limit) shown.push(mine);
  return (
    <ol className="flex flex-col divide-y divide-line text-sm">
      {shown.map((i) => {
        // Lider (przy remisie kilku) ma koronę i większe pismo.
        const first = placeAt(gameId, rows, i) === 1;
        return (
          <li
            key={rows[i].nick}
            className={`flex items-center gap-3 py-2 ${first ? "text-base font-semibold" : ""}`}
            style={i === mine ? { color } : undefined}
          >
            {first ? (
              <Crown size={20} weight="fill" className={`shrink-0 ${i === mine ? "" : "text-accent"}`} aria-label="1. miejsce" />
            ) : (
              <span className={`w-6 font-mono font-semibold tabular-nums ${i === mine ? "" : "text-fg-muted"}`}>{placeAt(gameId, rows, i)}.</span>
            )}
            <span className="min-w-0 flex-1 truncate">
              {rows[i].nick}
              {i === mine && " (ty)"}
            </span>
            <span className="font-mono tabular-nums">
              {formatBest(gameId, rows[i].best)}
              {formatTie(gameId, rows[i].tie) && <span className="opacity-60"> · {formatTie(gameId, rows[i].tie)}</span>}
            </span>
          </li>
        );
      })}
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
        {fresh &&
          (was ? (
            <span
              className="animate-[set-glow_0.9s_ease-in-out_4] rounded-full border border-success px-3 py-0.5 text-sm font-semibold text-success"
              style={{ "--glow": "var(--color-success)" } as CSSProperties}
            >
              Nowy rekord!
            </span>
          ) : (
            <span className="rounded-full border border-line px-3 py-0.5 text-sm text-fg-muted">Pierwszy wynik</span>
          ))}
      </div>

      <div>
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums" style={{ color }}>
            {now.place}. miejsce
          </span>
          <span className="font-mono text-sm text-fg-muted">z {now.of}</span>
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          Ranking wszech czasów. {was && was.place > now.place ? `Awans z ${was.place}. miejsca. ` : ""}
          {fresh
            ? was
              ? `Poprzedni rekord: ${formatRecord(gameId, was)}.`
              : `Twój wynik: ${formatRecord(gameId, now)}.`
            : missed
              ? `Twój rekord: ${formatRecord(gameId, now)}, teraz zabrakło ${formatGap(gameId, missed)}.`
              : `Wyrównany rekord: ${formatRecord(gameId, now)}.`}
        </p>
      </div>

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

/** Kolor lidera spoza pokoju: wartość `--color-fg` (gry wstawiają kolor gracza do atrybutów SVG, gdzie `var()` nie działa). */
const LEADER_COLOR = "#ededef";

/** Rekordowa partia gry: ekran końcowy mini-gry z zapisanego stanu lidera, jak po partii solo. */
function TopGame({ gameId, nick, color }: { gameId: string; nick: string; color?: string }) {
  const [top, setTop] = useState<unknown>(undefined);
  useEffect(() => {
    fetchTopRecord(gameId).then(setTop);
  }, [gameId]);
  if (top === undefined) return null;
  return (
    <section className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      <h3 className="text-sm text-fg-muted">Rekordowa partia · {nick}</h3>
      {top === null ? (
        <p className="text-sm text-fg-muted">Rekord sprzed zapisu partii. Szczegóły pojawią się po następnym rekordzie.</p>
      ) : (
        <MiniGame
          id={gameId}
          view={top}
          me=""
          players={[{ id: SOLO, nick, color: color ?? LEADER_COLOR, connected: true, ready: false }]}
          ranking={[SOLO]}
          onMove={() => {}}
        />
      )}
    </section>
  );
}

type Entry = { id: string; rows: RecordRow[]; mine: ReturnType<typeof standing> };

interface CardProps {
  game: Entry;
  nick: string | null;
  color?: string;
  /** Karta była już rozwinięta: dopiero wtedy pobieramy rekordową partię. */
  loaded: boolean;
  onOpen: () => void;
  onPlay?: (gameId: string) => void;
}

/** Karta gry z wynikami: u lidera jego wynik, w pozostałych cudzy rekord do pobicia. Rozwinięta pokazuje ranking i rekordową partię. */
function GameCard({ game: { id, rows, mine }, nick, color, loaded, onOpen, onPlay }: CardProps) {
  const GameIcon = ICONS[id] ?? Play;
  const lead = mine?.place === 1;
  return (
    // Wspólne `name` robi z kart akordeon: przeglądarka sama zamyka poprzednią.
    <details name="rekordy" className={`group rounded-inset border bg-surface ${lead ? "border-line" : "border-accent/40"}`} onToggle={(e) => e.currentTarget.open && onOpen()}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
        <GameIcon size={20} className="shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">{GAMES[id].name}</span>
          {lead ? (
            <span className="truncate font-mono text-sm text-fg-muted tabular-nums">{formatRecord(id, mine)}</span>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-fg-muted">
              <Crown size={14} weight="fill" className="shrink-0 text-accent" aria-label="Lider" />
              <span className="truncate">
                {rows[0].nick}: {formatRecord(id, rows[0])}
                {nick && ` · ty: ${mine ? formatRecord(id, mine) : "brak wyniku"}`}
              </span>
            </span>
          )}
        </span>
        {mine && (
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full bg-surface-inset px-2 py-0.5 font-mono text-sm tabular-nums ${lead ? "" : "text-fg-muted"}`}
            style={lead ? { color } : undefined}
            aria-label={`${mine.place}. miejsce z ${mine.of}`}
          >
            {lead && <Crown size={14} weight="fill" aria-hidden />}
            {mine.place}/{mine.of}
          </span>
        )}
        {!lead && onPlay && (
          <button type="button" className="btn btn-ghost shrink-0 px-4" onClick={() => onPlay(id)}>
            Pobij
          </button>
        )}
        <CaretDown size={14} className="shrink-0 text-fg-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-3 pb-3">
        <RecordList gameId={id} rows={rows} me={nick} color={color} limit={10} />
        {loaded && <TopGame gameId={id} nick={rows[0].nick} color={lead ? color : undefined} />}
        {lead && onPlay && (
          <button type="button" className="btn btn-ghost mt-3 w-full" onClick={() => onPlay(id)}>
            <Play size={18} aria-hidden />
            Zagraj ponownie
          </button>
        )}
      </div>
    </details>
  );
}

/** Ile kafli gier bez wyników widać przed „Pokaż wszystkie”. */
const FRESH_SHOWN = 8;

/**
 * Ekran „Rekordy”: gry, w których prowadzę, cudze rekordy do pobicia i gry bez żadnego wyniku.
 * `onPlay` ma tylko gospodarz w pokoju: wybiera grę i wraca na listę mini-gier.
 */
export function Records({ nick, color, onBack, onPlay }: { nick: string | null; color?: string; onBack: () => void; onPlay?: (gameId: string) => void }) {
  const [records, setRecords] = useState<Record<string, RecordRow[]> | null>(null);
  /** Gry rozwinięte choć raz: dopiero wtedy pobieramy ich rekordową partię. */
  const [opened, setOpened] = useState<string[]>([]);
  const [allFresh, setAllFresh] = useState(false);
  const [ranking, setRanking] = useState<Record<string, RankingRow[]>>({});
  useEffect(() => {
    fetchRecords().then(setRecords);
    fetchRanking().then(setRanking);
  }, []);

  const games: Entry[] = MINI_GAME_IDS.map((id) => {
    const rows = records?.[id] ?? [];
    return { id, rows, mine: nick ? standing(rows, nick, orderOf(id)) : null };
  }).sort((a, b) => (a.mine?.place ?? Infinity) - (b.mine?.place ?? Infinity) || (b.mine?.of ?? 0) - (a.mine?.of ?? 0));
  const played = games.filter((g) => g.mine).length;
  const led = games.filter((g) => g.mine?.place === 1);
  const toBeat = games.filter((g) => g.rows.length > 0 && g.mine?.place !== 1);
  const fresh = games.filter((g) => g.rows.length === 0);

  const section = (title: string, list: Entry[]) =>
    list.length > 0 && (
      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-fg-muted">{title}</h2>
        <ul className="flex flex-col gap-2">
          {list.map((g) => (
            <li key={g.id}>
              <GameCard
                game={g}
                nick={nick}
                color={color}
                loaded={opened.includes(g.id)}
                onOpen={() => setOpened((o) => (o.includes(g.id) ? o : [...o, g.id]))}
                onPlay={onPlay}
              />
            </li>
          ))}
        </ul>
      </section>
    );

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
          {played > 0 ? (
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: "Zagrane", value: played, of: games.length },
                { label: "Pierwsze miejsca", value: led.length },
                { label: "Do pobicia", value: toBeat.length, warn: toBeat.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex flex-col justify-between gap-1 rounded-inset bg-surface-inset p-3">
                  <dt className="text-sm leading-tight text-fg-muted">{item.label}</dt>
                  <dd className={`text-2xl leading-tight font-semibold tabular-nums ${item.warn ? "text-warning" : ""}`}>
                    {item.value}
                    {item.of && <span className="text-sm font-normal text-fg-muted"> z {item.of}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-fg-muted">{nick ? "Nie masz jeszcze żadnego wyniku. Zagraj w mini-grę, a trafisz do rankingu." : "Wpisz nick, żeby zobaczyć swoje miejsca."}</p>
          )}

          {section("Twoje rekordy", led)}
          {section("Do pobicia", toBeat)}

          {fresh.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm text-fg-muted">Jeszcze nie grane ({fresh.length})</h2>
                {fresh.length > FRESH_SHOWN && (
                  <button type="button" className="-mr-2 min-h-12 px-2 text-sm" style={{ color }} onClick={() => setAllFresh(!allFresh)}>
                    {allFresh ? "Zwiń" : "Pokaż wszystkie"}
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-4 gap-2">
                {(allFresh ? fresh : fresh.slice(0, FRESH_SHOWN)).map(({ id }) => {
                  const GameIcon = ICONS[id] ?? Play;
                  const Tile = onPlay ? "button" : "div";
                  return (
                    <li key={id}>
                      <Tile
                        {...(onPlay && { type: "button", onClick: () => onPlay(id) })}
                        className="flex h-full min-h-16 w-full flex-col items-center justify-center gap-1 rounded-inset bg-surface-inset px-1 py-2 text-center text-xs leading-tight text-fg-muted"
                      >
                        <GameIcon size={20} aria-hidden />
                        {GAMES[id].name}
                      </Tile>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <Wins ranking={ranking} me={nick} color={color} />
        </>
      )}
    </Screen>
  );
}

/** Wygrane partie w grach głównych i turniejach (mini-gry mają rekordy wyżej). Równe wygrane i partie to to samo miejsce. */
function Wins({ ranking, me, color }: { ranking: Record<string, RankingRow[]>; me: string | null; color?: string }) {
  // Turniej nie jest grą z rejestru, ale ma własny ranking.
  const title = (id: string) => (id === TOURNAMENT_ID ? "Turniej" : GAMES[id]?.minPlayers > 1 ? GAMES[id].name : undefined);
  const key = me && nickKey(me);
  const games = Object.entries(ranking).filter(([id]) => title(id));
  if (games.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm text-fg-muted">Wygrane partie</h2>
      {games.map(([id, rows]) => (
        <div key={id} className="rounded-inset border border-line bg-surface px-3 py-2">
          <div className="flex justify-between gap-3">
            <h3>{title(id)}</h3>
            <span className="text-xs text-fg-subtle" aria-hidden>
              wygrane z partii
            </span>
          </div>
          <ol className="flex flex-col text-sm">
            {rows.map((r) => {
              const place = rows.findIndex((x) => x.wins === r.wins && x.played === r.played) + 1;
              const mine = nickKey(r.nick) === key;
              return (
                <li key={r.nick} className="flex items-center gap-3 py-0.5" style={mine ? { color } : undefined}>
                  <span className={`flex w-6 font-mono tabular-nums ${mine ? "" : "text-fg-muted"}`}>
                    {place === 1 ? <Crown size={14} weight="fill" className={mine ? "" : "text-accent"} aria-label="1. miejsce" /> : `${place}.`}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.nick}
                    {mine && " (ty)"}
                  </span>
                  <span className="font-mono tabular-nums" aria-label={`${r.wins} wygranych z ${r.played} partii`}>
                    {r.wins} z {r.played}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}

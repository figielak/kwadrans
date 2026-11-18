import { CaretDown, CaretUp, Play, Warning } from "@phosphor-icons/react";
import { GAMES, type GameDetail, type Insights, type PlayerStat, type Report, type ReportGame } from "@kwadrans/games";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import { fetchReport } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { matchesWord } from "./profile.ts";
import {
  compareBy, duration, type GameSort, hoursMinutes, KIND_LABEL, one, OUTCOME_LABEL, percent, shortDate, sortValue, SOURCE_LABEL, warnings, WEEKDAYS,
} from "./report.ts";

const PERIODS = [
  { days: 7, label: "7 dni" },
  { days: 30, label: "30 dni" },
  { days: 90, label: "90 dni" },
  { days: 0, label: "Całość" },
];
/** Trzy serie przebiegu dziennego, w stałej kolejności (walidowana paleta z index.css). */
const SERIES = [
  { key: "main", label: "Gry główne", color: "var(--color-series-1)" },
  { key: "mini", label: "Mini-gry w pokoju", color: "var(--color-series-2)" },
  { key: "solo", label: "Solo", color: "var(--color-series-3)" },
] as const;

type Data = Report & { insights: Insights };
const name = (id: string) => GAMES[id]?.name ?? id;
const isMain = (id: string) => (GAMES[id]?.minPlayers ?? 1) > 1;

/**
 * Ukryta strona /statystyki dla właściciela: szeroki układ na laptopa (poza zasadą 360 px reszty aplikacji, ale dalej czytelny na telefonie).
 * Bez linku z aplikacji i bez indeksowania; nicki tylko w tabeli graczy, jak w publicznych rankingach.
 */
export function Statystyki() {
  const [days, setDays] = useState(30);
  /** undefined: wczytywanie, null: serwer nie odpowiada. */
  const [data, setData] = useState<Data | null>();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    document.title = "Statystyki · Kwadrans";
    return () => meta.remove();
  }, []);
  useEffect(() => {
    setData(undefined);
    fetchReport(days).then(setData);
  }, [days]);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statystyki</h1>
          <p className="text-sm text-fg-muted">W co gracie, kiedy i co warto zostawić.</p>
        </div>
        <div className="flex gap-1 rounded-inset bg-surface p-1" role="group" aria-label="Okres">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              aria-pressed={days === p.days}
              className={`min-h-10 rounded-[8px] px-4 text-sm ${days === p.days ? "bg-line font-semibold text-fg" : "text-fg-muted hover:text-fg"}`}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {data === undefined && (
        <p role="status" aria-busy className="text-fg-muted">
          Wczytywanie…
        </p>
      )}
      {data === null && <p role="status" className="text-fg-muted">Nie udało się wczytać raportu.</p>}
      {data && <Dashboard data={data} />}
    </main>
  );
}

function Dashboard({ data }: { data: Data }) {
  const { insights: i } = data;
  const t = i.totals;
  return (
    <>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {[
          { label: "Partie", value: String(t.matches) },
          { label: "Ukończone", value: percent(t.completed, t.matches) },
          { label: "Gracze", value: String(t.players) },
          { label: "Nowi", value: String(t.newPlayers) },
          { label: "Wracają", value: String(t.returning), hint: "co najmniej 2 dni gry" },
          { label: "Dni gry", value: String(t.days) },
          { label: "Wieczory", value: String(t.evenings), hint: "pokoje z 2+ partiami" },
          { label: "Czas gry", value: hoursMinutes(t.playSeconds) },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1 rounded-inset bg-surface p-3" title={item.hint}>
            <dt className="label">{item.label}</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Partie dzień po dniu" className="lg:col-span-2">
          <DailyChart daily={i.daily} />
        </Panel>
        <Panel title="Kiedy gracie">
          <Heatmap hours={i.hours} />
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Skąd się biorą partie">
          <Bars rows={i.sources.map((s) => ({ label: SOURCE_LABEL[s.source] ?? s.source, n: s.n }))} />
        </Panel>
        <Panel title="Gdzie">
          <Bars rows={i.kinds.map((k) => ({ label: KIND_LABEL[k.kind] ?? k.kind, n: k.n }))} />
        </Panel>
        <Panel title="Ilu przy stole">
          <Bars rows={i.sizes.map((s) => ({ label: `${s.players} ${s.players === 1 ? "osoba" : s.players <= 4 ? "osoby" : "osób"}`, n: s.n }))} />
        </Panel>
        <Panel title="Wieczory">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Wieczory", value: String(i.evenings.count) },
              { label: "Partii na wieczór", value: i.evenings.count ? one(i.evenings.medianMatches) : "brak" },
              { label: "Długość", value: i.evenings.medianMinutes === null ? "brak" : `${Math.round(i.evenings.medianMinutes)} min` },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dd className="font-mono text-xl font-semibold tabular-nums">{item.value}</dd>
                <dt className="text-xs text-fg-muted">{item.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-fg-muted">Mediany. Wieczór to pokój z co najmniej dwiema ukończonymi partiami z innymi.</p>
        </Panel>
      </div>

      <GamesTable games={data.games} details={i.games} />
      <PlayersTable players={i.players} />

      <p className="text-xs text-fg-muted">
        Ukończone: partie z wynikiem. Rewanże: część ukończonych, które były rewanżem albo „Jeszcze raz”. Mediana: czas ukończonej partii (bez wyników sprzed historii).
        Wybrana i porzucona: kafel gry w lobby i zmiana wyboru bez startu. Wyjście z instrukcji: zamknięcie mini-gry przed startem. Głosowanie: wygrane z pokazanych.
        Trend: partie w 12 ostatnich tygodniach, niezależnie od okresu.
      </p>
    </>
  );
}

function Panel({ title, className = "", children, aside }: { title: string; className?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className={`rounded-tile border border-line bg-surface p-4 ${className}`} aria-label={title}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Słupki dzienne w trzech seriach, z 2 px przerwą między segmentami; najechanie pokazuje dzień w linii nad wykresem. */
function DailyChart({ daily }: { daily: Insights["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.main + d.mini + d.solo));
  const H = 160;
  const step = 100 / daily.length;
  const shown = hover === null ? null : daily[hover];
  const ticks = [0, Math.round(max / 2), max].filter((v, idx, all) => all.indexOf(v) === idx);
  const labelEvery = Math.max(1, Math.ceil(daily.length / 8));
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-fg-muted">
              <span className="inline-block size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-fg-muted tabular-nums" aria-live="polite">
          {shown ? `${shownDay(shown.day)} · ${shown.main} główne · ${shown.mini} mini · ${shown.solo} solo` : "Najedź na dzień"}
        </p>
      </div>
      <div className="flex gap-2">
        <div className="relative w-6 shrink-0 font-mono text-[10px] text-fg-muted tabular-nums" style={{ height: H }} aria-hidden>
          {ticks.map((v) => (
            <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: H - (v / max) * H }}>
              {v}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="block w-full" style={{ height: H }} role="img" aria-label="Partie dzień po dniu" onMouseLeave={() => setHover(null)}>
            {ticks.map((v) => (
              <line key={v} x1="0" x2="100" y1={H - (v / max) * H} y2={H - (v / max) * H} stroke="var(--color-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {daily.map((d, idx) => {
              let y = H;
              const w = Math.max(step * 0.7, 0.2);
              const x = idx * step + (step - w) / 2;
              return (
                <g key={d.day} opacity={hover === null || hover === idx ? 1 : 0.45}>
                  {SERIES.map((s) => {
                    const n = d[s.key];
                    if (!n) return null;
                    const h = (n / max) * H;
                    y -= h;
                    // 2 px przerwy między segmentami (w jednostkach wysokości wykresu).
                    return <rect key={s.key} x={x} y={y + 1} width={w} height={Math.max(h - 2, 1)} fill={s.color} />;
                  })}
                  <rect x={idx * step} y="0" width={step} height={H} fill="transparent" onMouseEnter={() => setHover(idx)}>
                    <title>{`${shownDay(d.day)}: ${d.main + d.mini + d.solo} partii`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>
          <div className="relative mt-1 h-4 font-mono text-[10px] text-fg-muted tabular-nums" aria-hidden>
            {daily.map((d, idx) =>
              idx % labelEvery === 0 ? (
                <span key={d.day} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(idx + 0.5) * step}%` }}>
                  {shownDay(d.day)}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const shownDay = (day: string) => `${day.slice(8, 10)}.${day.slice(5, 7)}`;

/** Siatka tydzień × godzina; jeden odcień, jaśniejszy przy większej liczbie partii. */
function Heatmap({ hours }: { hours: number[][] }) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const max = Math.max(1, ...hours.flat());
  const busiest = hours.flatMap((row, d) => row.map((n, h) => ({ d, h, n }))).sort((a, b) => b.n - a.n)[0];
  const readout = hover ? { d: hover[0], h: hover[1], n: hours[hover[0]][hover[1]] } : busiest;
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-fg-muted tabular-nums" aria-live="polite">
        {readout && readout.n > 0 ? `${hover ? "" : "Najczęściej: "}${WEEKDAYS[readout.d]} ${String(readout.h).padStart(2, "0")}:00 · ${matchesWord(readout.n)}` : "Brak partii"}
      </p>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "2rem repeat(24, minmax(0, 1fr))" }} onMouseLeave={() => setHover(null)}>
        {hours.map((row, d) => (
          <Fragment key={d}>
            <span className="pr-1 text-right text-[10px] leading-[14px] text-fg-muted">{WEEKDAYS[d]}</span>
            {row.map((n, h) => (
              <span
                key={h}
                className="h-[14px] rounded-[2px]"
                style={{ background: n ? "var(--color-series-1)" : "var(--color-line)", opacity: n ? 0.25 + 0.75 * (n / max) : 1 }}
                title={`${WEEKDAYS[d]} ${h}:00: ${n}`}
                onMouseEnter={() => setHover([d, h])}
              />
            ))}
          </Fragment>
        ))}
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="text-center font-mono text-[9px] text-fg-muted tabular-nums">
            {h % 6 === 0 ? h : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Poziome słupki jednej serii z liczbą i udziałem; etykiety tekstem, kolor tylko na słupku. */
function Bars({ rows }: { rows: { label: string; n: number }[] }) {
  if (rows.length === 0) return <p className="text-sm text-fg-muted">Brak partii.</p>;
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 font-mono text-fg-muted tabular-nums">
              {r.n} · {percent(r.n, total)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-line">
            <div className="h-full rounded-full" style={{ width: `${(r.n / max) * 100}%`, background: "var(--color-series-1)" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Mały wykres 12 tygodni w komórce tabeli. */
function Spark({ weekly }: { weekly: number[] }) {
  const max = Math.max(1, ...weekly);
  const total = weekly.reduce((a, b) => a + b, 0);
  return (
    <svg viewBox="0 0 48 16" className="block h-4 w-12" role="img" aria-label={`12 tygodni: ${weekly.join(", ")}`}>
      <title>{`Ostatnie 12 tygodni: ${total}`}</title>
      {weekly.map((n, idx) => (
        <rect key={idx} x={idx * 4 + 0.5} y={16 - Math.max(n ? 2 : 1, (n / max) * 16)} width="3" height={Math.max(n ? 2 : 1, (n / max) * 16)} rx="0.5" fill={n ? "var(--color-series-1)" : "var(--color-line)"} />
      ))}
    </svg>
  );
}

const COLUMNS: { key: GameSort | null; label: string; title?: string; align?: "left" }[] = [
  { key: "name", label: "Gra", align: "left" },
  { key: "matches", label: "Partie" },
  { key: null, label: "Trend", title: "12 ostatnich tygodni" },
  { key: "players", label: "Gracze" },
  { key: "completed", label: "Ukończone" },
  { key: "rematches", label: "Rewanże" },
  { key: "median", label: "Mediana" },
  { key: null, label: "Śr. osób" },
  { key: "voteWon", label: "Głosowanie", title: "wygrane z pokazanych" },
  { key: null, label: "Wybór", title: "główne: wybrana / porzucona; mini: wyjście z instrukcji" },
  { key: null, label: "Jak grać" },
  { key: null, label: "Timeouty", title: "na partię" },
  { key: null, label: "Reakcje", title: "na partię" },
  { key: "lastAt", label: "Ostatnio" },
];

function GamesTable({ games, details }: { games: ReportGame[]; details: Record<string, GameDetail> }) {
  const [filter, setFilter] = useState<"all" | "main" | "mini">("all");
  const [sort, setSort] = useState<{ key: GameSort; desc: boolean }>({ key: "matches", desc: true });
  const [open, setOpen] = useState<string | null>(null);
  const rows = games
    .filter((g) => GAMES[g.gameId] && (filter === "all" || (filter === "main") === isMain(g.gameId)))
    .sort(compareBy((g) => sortValue(g, sort.key, name(g.gameId)), sort.desc));
  const toggleSort = (key: GameSort) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== "name" }));
  return (
    <Panel
      title="Gry"
      aside={
        <div className="flex gap-1" role="group" aria-label="Rodzaj gier">
          {(
            [
              ["all", "Wszystkie"],
              ["main", "Główne"],
              ["mini", "Mini-gry"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} className={`min-h-9 rounded-[8px] px-3 text-sm ${filter === id ? "bg-line font-semibold" : "text-fg-muted hover:text-fg"}`} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-fg-muted">
              {COLUMNS.map((c) => (
                <th key={c.label} scope="col" title={c.title} className={`py-2 pr-3 font-normal whitespace-nowrap ${c.align === "left" ? "text-left" : "text-right"}`}>
                  {c.key ? (
                    <button type="button" className={`inline-flex items-center gap-1 hover:text-fg ${sort.key === c.key ? "text-fg" : ""}`} onClick={() => toggleSort(c.key!)}>
                      {c.label}
                      {sort.key === c.key && (sort.desc ? <CaretDown size={10} weight="bold" aria-label="malejąco" /> : <CaretUp size={10} weight="bold" aria-label="rosnąco" />)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const GameIcon = ICONS[g.gameId] ?? Play;
              const main = isMain(g.gameId);
              const notes = warnings(g);
              const detail = details[g.gameId];
              const expanded = open === g.gameId;
              return (
                <Fragment key={g.gameId}>
                  <tr className={`border-b border-line ${g.matches === 0 ? "text-fg-muted" : ""} ${expanded ? "bg-line/40" : ""}`}>
                    <td className="py-1.5 pr-3">
                      <button
                        type="button"
                        className="flex min-h-9 items-center gap-2 text-left disabled:cursor-default"
                        aria-expanded={expanded}
                        disabled={!detail}
                        onClick={() => setOpen(expanded ? null : g.gameId)}
                      >
                        <GameIcon size={18} className="shrink-0" aria-hidden />
                        <span className="font-medium">{name(g.gameId)}</span>
                        {!main && <span className="text-xs text-fg-muted">mini</span>}
                        {notes.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-warning" title={notes.join(", ")}>
                            <Warning size={12} aria-hidden />
                            {notes.join(", ")}
                          </span>
                        )}
                        {detail && <CaretDown size={12} className={`text-fg-muted ${expanded ? "rotate-180" : ""}`} aria-hidden />}
                      </button>
                    </td>
                    <Num>{g.matches}</Num>
                    <td className="py-1.5 pr-3">
                      <div className="flex justify-end">{detail ? <Spark weekly={detail.weekly} /> : null}</div>
                    </td>
                    <Num>{g.players}</Num>
                    <Num>{percent(g.completed, g.matches)}</Num>
                    <Num>{percent(g.rematches, g.completed)}</Num>
                    <Num>{duration(g.medianSeconds)}</Num>
                    <Num>{g.matches ? one(g.avgPlayers) : "brak"}</Num>
                    <Num>{g.voteShown ? `${g.voteWon} z ${g.voteShown}` : "brak"}</Num>
                    <Num>{main ? `${g.picked} / ${g.dropped}` : String(g.introLeft)}</Num>
                    <Num>{main ? String(g.howTo) : ""}</Num>
                    <Num>{g.matches ? one(g.timeoutsPerMatch) : ""}</Num>
                    <Num>{g.matches ? one(g.reactionsPerMatch) : ""}</Num>
                    <Num>{g.lastAt ? shortDate(g.lastAt) : "brak"}</Num>
                  </tr>
                  {expanded && detail && (
                    <tr className="border-b border-line">
                      <td colSpan={COLUMNS.length} className="py-4">
                        <GameDetails gameId={g.gameId} detail={detail} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const Num = ({ children }: { children: ReactNode }) => <td className="py-1.5 pr-3 text-right font-mono whitespace-nowrap tabular-nums">{children}</td>;

function GameDetails({ gameId, detail }: { gameId: string; detail: GameDetail }) {
  const modeName = (mode: string | null) => (mode === null ? "domyślny" : (GAMES[gameId]?.modes?.find((m) => m.id === mode)?.name ?? mode));
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      <div>
        <h3 className="label mb-2">Tryby</h3>
        <Bars rows={detail.modes.map((m) => ({ label: modeName(m.mode), n: m.n }))} />
      </div>
      <div>
        <h3 className="label mb-2">Skąd</h3>
        <Bars rows={detail.sources.map((s) => ({ label: SOURCE_LABEL[s.source] ?? s.source, n: s.n }))} />
      </div>
      <div>
        <h3 className="label mb-2">Jak się skończyły</h3>
        <Bars rows={detail.outcomes.map((o) => ({ label: OUTCOME_LABEL[o.outcome] ?? o.outcome, n: o.n }))} />
      </div>
      <div>
        <h3 className="label mb-2">Stół i czas</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-fg-muted">
              <th className="text-left font-normal">Osób</th>
              <th className="text-right font-normal">Partie</th>
              <th className="text-right font-normal">Mediana</th>
            </tr>
          </thead>
          <tbody>
            {detail.sizes.map((s) => (
              <tr key={s.players}>
                <td className="font-mono tabular-nums">{s.players}</td>
                <td className="text-right font-mono tabular-nums">{s.n}</td>
                <td className="text-right font-mono tabular-nums">{duration(detail.medianBySize.find((m) => m.players === s.players)?.seconds ?? null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="label mb-2">Najczęściej grają</h3>
        <ol className="flex flex-col gap-1 text-sm">
          {detail.top.map((p) => (
            <li key={p.nick} className="flex justify-between gap-2">
              <span className="truncate">{p.nick}</span>
              <span className="shrink-0 font-mono text-fg-muted tabular-nums">
                {p.matches}
                {isMain(gameId) && ` · ${p.wins} wygr.`}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

type PlayerSort = "nick" | "matches" | "days" | "wins" | "firstAt" | "lastAt";
const PLAYER_COLUMNS: { key: PlayerSort | null; label: string; align?: "left" }[] = [
  { key: "nick", label: "Gracz", align: "left" },
  { key: "matches", label: "Partie" },
  { key: "days", label: "Dni" },
  { key: "wins", label: "Wygrane" },
  { key: null, label: "Ulubiona", align: "left" },
  { key: "firstAt", label: "Od" },
  { key: "lastAt", label: "Ostatnio" },
];
const PLAYERS_SHOWN = 15;

function PlayersTable({ players }: { players: PlayerStat[] }) {
  const [sort, setSort] = useState<{ key: PlayerSort; desc: boolean }>({ key: "matches", desc: true });
  const [all, setAll] = useState(false);
  if (players.length === 0) return null;
  const rows = [...players].sort(compareBy((p) => p[sort.key], sort.desc));
  const toggleSort = (key: PlayerSort) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== "nick" }));
  return (
    <Panel
      title={`Gracze (${players.length})`}
      aside={
        players.length > PLAYERS_SHOWN && (
          <button type="button" className="min-h-9 px-2 text-sm text-fg-muted underline underline-offset-4" onClick={() => setAll(!all)}>
            {all ? "Zwiń" : "Pokaż wszystkich"}
          </button>
        )
      }
    >
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-fg-muted">
              {PLAYER_COLUMNS.map((c) => (
                <th key={c.label} scope="col" className={`py-2 pr-3 font-normal ${c.align === "left" ? "text-left" : "text-right"}`}>
                  {c.key ? (
                    <button type="button" className={`inline-flex items-center gap-1 hover:text-fg ${sort.key === c.key ? "text-fg" : ""}`} onClick={() => toggleSort(c.key!)}>
                      {c.label}
                      {sort.key === c.key && (sort.desc ? <CaretDown size={10} weight="bold" aria-label="malejąco" /> : <CaretUp size={10} weight="bold" aria-label="rosnąco" />)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(all ? rows : rows.slice(0, PLAYERS_SHOWN)).map((p) => (
              <tr key={p.key} className="border-b border-line">
                <td className="py-1.5 pr-3">
                  {p.nick}
                  {p.isNew && <span className="ml-2 rounded-full bg-line px-2 py-0.5 text-xs text-fg-muted">nowy</span>}
                </td>
                <Num>{p.matches}</Num>
                <Num>{p.days}</Num>
                <Num>{p.wins}</Num>
                <td className="py-1.5 pr-3">{p.favorite ? name(p.favorite) : ""}</td>
                <Num>{shortDate(p.firstAt)}</Num>
                <Num>{shortDate(p.lastAt)}</Num>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

import { ArrowLeft, CaretDown, Crown, Play } from "@phosphor-icons/react";
import { compareRecords, GAMES, KOLOR_COUNT, MINI_GAME_IDS, nickKey, type RecordRow, SOLO, standing, TOURNAMENT_ID } from "@kwadrans/games";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { MiniGame } from "../games/MiniGame.tsx";
import { fetchRanking, fetchRecords, fetchTopRecord, type RankingRow } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { recordChange, recordSummary } from "./results.ts";
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
  simon: { value: (n) => `seria ${n}` },
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
export const formatGap = (gameId: string, { gap, onTie }: { gap: number; onTie: boolean }) =>
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
              <Crown size={20} weight="fill" className={`shrink-0 ${i === mine ? "" : "text-gold"}`} aria-label="1. miejsce" />
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
  /** Nad panelem stoi bohater wyników: to jego tytuł ma być największym tekstem, a zwykła partia składa panel do jednej linii. */
  underHero?: boolean;
}

/** Po partii: gdzie jestem w rankingu wszech czasów, czy padł rekord i ile brakuje do osoby wyżej. */
export function RecordPanel({ gameId, before, after, nick, color, score, underHero }: PanelProps) {
  const order = orderOf(gameId);
  const now = score === undefined ? null : standing(after, nick, order);
  const title = <h2 className="label">Rekordy · {GAMES[gameId].name}</h2>;
  const summary = underHero ? recordSummary({ before, after, nick, order, score, format: (s) => formatRecord(gameId, s), gap: (g) => formatGap(gameId, g) }) : { full: true };
  if (!summary) return null;
  if ("line" in summary) return <p className="px-1 text-sm" aria-live="polite">{summary.line}</p>;
  if (!now || score === undefined) {
    return (
      <section className="tile flex flex-col gap-3 p-4">
        {title}
        <RecordList gameId={gameId} rows={after} me={nick} color={color} />
      </section>
    );
  }
  const { was, fresh, missed } = recordChange(before, nick, order, now, score);

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
          <span className={`font-mono ${underHero ? "text-2xl" : "text-4xl"} font-semibold tabular-nums`} style={{ color }}>
            {now.place}. miejsce
          </span>
          <span className="font-mono text-sm text-fg-muted tabular-nums">z {now.of}</span>
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          Ranking wszech czasów. {was && was.place > now.place ? `Awans z ${was.place}. miejsca. ` : ""}
          {/* Jednostka bywa skrótem z kropką („traf.”): zdanie nie kończy się wtedy dwiema. */}
          {(fresh
            ? was
              ? `Poprzedni rekord: ${formatRecord(gameId, was)}.`
              : `Twój wynik: ${formatRecord(gameId, now)}.`
            : missed
              ? `Twój rekord: ${formatRecord(gameId, now)}, teraz zabrakło ${formatGap(gameId, missed)}.`
              : `Wyrównany rekord: ${formatRecord(gameId, now)}.`
          ).replace("..", ".")}
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
const LEADER_COLOR = "var(--color-fg)";

/** Rekordowa partia gry: ekran końcowy mini-gry z zapisanego stanu lidera, jak po partii solo. */
function TopGame({ gameId, nick, color }: { gameId: string; nick: string; color?: string }) {
  const [top, setTop] = useState<unknown>(undefined);
  useEffect(() => {
    fetchTopRecord(gameId).then(setTop);
  }, [gameId]);
  return (
    <section className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      <h3 className="text-sm text-fg-muted">Rekordowa partia · {nick}</h3>
      {top === undefined || top === false ? (
        <p role="status" className="text-sm text-fg-muted">
          {top === undefined ? "Wczytywanie…" : "Nie udało się wczytać partii."}
        </p>
      ) : top === null ? (
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

/** Różnica między dwoma wynikami w jednostkach gry: w głównym wyniku albo, przy równym, w drugim kryterium. */
const gapBetween = (a: Score, b: Score) => (a.best !== b.best ? { gap: Math.abs(a.best - b.best), onTie: false } : { gap: Math.abs((a.tie ?? 0) - (b.tie ?? 0)), onTie: true });
/** Lider ma 0 w grze, w której więcej znaczy lepiej: rekord pobije pierwszy poprawny wynik. */
const easyLoot = ({ id, rows }: Entry) => rows.length > 0 && !orderOf(id).lower && rows[0].best === 0;
/** Jak daleko do rekordu względem jego wielkości: pozwala porównać gry o różnych jednostkach. Remis w głównym wyniku to prawie zero. */
const distance = ({ rows, mine }: Entry) => {
  if (!mine) return Infinity;
  const { gap, onTie } = gapBetween(rows[0], mine);
  return onTie ? 0 : gap / Math.max(Math.abs(rows[0].best), 1);
};
/** Kolejność „Do pobicia”: najbliższe rekordy, potem łatwe łupy, potem niegrane z najmniejszą liczbą rywali. */
const byReach = (a: Entry, b: Entry) => distance(a) - distance(b) || Number(easyLoot(b)) - Number(easyLoot(a)) || a.rows.length - b.rows.length;

/** Ikona gry na kafelku: u lidera w kolorze gracza. */
function GameBadge({ id, color, size = "size-10" }: { id: string; color?: string; size?: string }) {
  const GameIcon = ICONS[id] ?? Play;
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-inset border border-line bg-bg`}
      style={color ? { color, background: `color-mix(in srgb, ${color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` } : undefined}
      aria-hidden
    >
      <GameIcon size={20} />
    </span>
  );
}

/** Mały znacznik w drugiej linii karty. */
const Chip = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`shrink-0 rounded-full border px-2 text-xs leading-5 ${className}`}>{children}</span>
);

/** Karta gry: rekord dużą liczbą po prawej, pod nim to, co z niego wynika dla mnie. Rozwinięta pokazuje ranking i rekordową partię. */
function GameCard({ game, nick, color, loaded, onOpen, onPlay }: CardProps) {
  const { id, rows, mine } = game;
  const lead = mine?.place === 1;
  const leader = rows[0];
  const tie = formatTie(id, leader.tie);
  // Druga linia po prawej: przewaga lidera, strata do rekordu albo zachęta do pierwszej partii.
  const status = lead ? (
    mine.behind ? (
      <span className="truncate font-mono text-xs tabular-nums" style={{ color }}>
        +{formatGap(id, mine.behind)} przewagi
      </span>
    ) : (
      <span className="truncate text-xs text-fg-muted">jedyny wynik</span>
    )
  ) : mine ? (
    <span className="truncate font-mono text-xs text-fg-muted tabular-nums">brakuje {formatGap(id, gapBetween(leader, mine))}</span>
  ) : easyLoot(game) ? (
    <Chip className="border-success/40 text-success">łatwy łup</Chip>
  ) : (
    nick && <Chip className="border-line text-fg-subtle">nie grane</Chip>
  );
  return (
    // Wspólne `name` robi z kart akordeon: przeglądarka sama zamyka poprzednią.
    <details name="rekordy" className="group rounded-inset border border-line bg-surface open:border-line-hover" onToggle={(e) => e.currentTarget.open && onOpen()}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <GameBadge id={id} color={lead ? color : undefined} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium">{GAMES[id].name}</span>
            {mine && !lead && (
              <span role="img" className="shrink-0 font-mono text-xs text-fg-muted tabular-nums" aria-label={`${mine.place}. miejsce z ${mine.of}`}>
                {mine.place}/{mine.of}
              </span>
            )}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-sm text-fg-muted">
            <Crown size={14} weight="fill" className={`shrink-0 ${lead && color ? "" : "text-gold"}`} style={lead ? { color } : undefined} aria-label="Lider" />
            <span className="truncate" style={lead ? { color } : undefined}>
              {lead ? "Ty" : leader.nick}
            </span>
          </span>
        </span>
        <span className="flex max-w-[45%] shrink-0 flex-col items-end gap-0.5 text-right">
          <span className="font-mono text-lg leading-tight font-semibold tabular-nums" style={lead ? { color } : undefined}>
            {formatBest(id, leader.best)}
            {tie && <span className="sr-only"> · {tie}</span>}
          </span>
          {status}
        </span>
        <CaretDown size={14} className="shrink-0 text-fg-muted transition-transform duration-180 group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-3 pb-3">
        <RecordList gameId={id} rows={rows} me={nick} color={color} limit={10} />
        {loaded && <TopGame gameId={id} nick={rows[0].nick} color={lead ? color : undefined} />}
        {onPlay && (
          <button type="button" className="btn btn-ghost mt-3 w-full" onClick={() => onPlay(id)}>
            <Play size={18} weight="bold" aria-hidden />
            {lead ? "Zagraj ponownie" : "Pobij"}
          </button>
        )}
      </div>
    </details>
  );
}

/** Karta na górze ekranu: jeden rekord, który najłatwiej teraz zdobyć, z przyciskiem do gry. */
function Target({ game, onPlay }: { game: Entry; onPlay?: (gameId: string) => void }) {
  const { id, rows, mine } = game;
  const leader = rows[0];
  const loot = easyLoot(game);
  const [title, line] =
    rows.length === 0
      ? ["Pierwszy rekord", "Nikt jeszcze nie grał. Pierwszy wynik będzie rekordem."]
      : mine
        ? ["Najbliżej rekordu", `Brakuje ci ${formatGap(id, gapBetween(leader, mine))} do ${leader.nick} (${formatRecord(id, leader)}).`]
        : loot
          ? ["Łatwy łup", `${leader.nick} ma ${formatRecord(id, leader)}. Wystarczy jeden poprawny wynik.`]
          : ["Rekord do zdobycia", `${leader.nick}: ${formatRecord(id, leader)}. W rankingu ${plural(rows.length, "osoba", "osoby", "osób")}.`];
  return (
    <section className="tile flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <GameBadge id={id} size="size-12" />
        <p className="flex min-w-0 flex-col leading-tight">
          <span className="label">{title}</span>
          <span className="truncate text-lg font-semibold">{GAMES[id].name}</span>
        </p>
      </div>
      <p className="text-sm text-fg-muted">{line.replace("..", ".")}</p>
      {onPlay && (
        <button type="button" className="btn btn-ghost w-full" onClick={() => onPlay(id)}>
          <Play size={18} weight="fill" aria-hidden />
          Zagraj
        </button>
      )}
    </section>
  );
}

/** Ile kafli gier bez wyników widać przed „Pokaż wszystkie”. */
const FRESH_SHOWN = 8;

/**
 * Ekran „Rekordy”: gry, w których prowadzę, cudze rekordy do pobicia i gry bez żadnego wyniku.
 * `onPlay` ma tylko gospodarz w pokoju: wybiera grę i wraca na listę mini-gier.
 */
export function Records({
  nick,
  color,
  dropped = false,
  onBack,
  onPlay,
}: {
  nick: string | null;
  color?: string;
  /** Otwarte z pokoju: pasek „Łączenie ponownie…” jak na innych ekranach pokoju. */
  dropped?: boolean;
  onBack: () => void;
  onPlay?: (gameId: string) => void;
}) {
  /** undefined do odpowiedzi serwera, null, gdy nie odpowie. */
  const [records, setRecords] = useState<Record<string, RecordRow[]> | null>();
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
  const toBeat = games.filter((g) => g.rows.length > 0 && g.mine?.place !== 1).sort(byReach);
  const fresh = games.filter((g) => g.rows.length === 0);
  // Na start: rekord, do którego najbliżej (albo łatwy łup), a gdy wszystkie moje, pierwsza gra bez wyniku.
  const target = nick ? (toBeat[0] ?? fresh[0]) : undefined;

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
    <Screen dropped={dropped}>
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" aria-hidden />
        Wróć
      </button>
      <h1 className="text-3xl font-semibold tracking-tight">Rekordy</h1>

      {!records ? (
        <p role="status" className="text-fg-muted" aria-busy={records === undefined}>
          {records === undefined ? "Wczytywanie…" : "Nie udało się wczytać rekordów. Spróbuj za chwilę."}
        </p>
      ) : (
        <>
          {played > 0 ? (
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: "Zagrane", value: played, of: games.length },
                { label: "Pierwsze miejsca", value: led.length },
                { label: "Do pobicia", value: toBeat.length },
              ].map((item) => (
                <div key={item.label} className="flex flex-col justify-between gap-1 rounded-inset bg-surface p-3">
                  <dt className="label leading-tight">{item.label}</dt>
                  <dd className="font-mono text-2xl leading-tight font-semibold tabular-nums">
                    {item.value}
                    {item.of && <span className="text-sm font-normal text-fg-muted"> z {item.of}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-fg-muted">{nick ? "Nie masz jeszcze żadnego wyniku. Zagraj w mini-grę, a trafisz do rankingu." : "Wpisz nick, żeby zobaczyć swoje miejsca."}</p>
          )}

          {target && <Target game={target} onPlay={onPlay} />}

          {section("Twoje rekordy", led)}
          {section("Do pobicia", toBeat)}

          {fresh.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm text-fg-muted">Jeszcze nie grane ({fresh.length})</h2>
                {fresh.length > FRESH_SHOWN && (
                  <button type="button" className="-mr-2 min-h-12 px-2 text-sm text-fg-muted underline underline-offset-4" onClick={() => setAllFresh(!allFresh)}>
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
                        className="flex h-full min-h-16 w-full flex-col items-center justify-center gap-1 rounded-inset bg-surface px-1 py-2 text-center text-xs leading-tight text-fg-muted"
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
            <span className="text-xs text-fg-muted" aria-hidden>
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
                    {place === 1 ? <Crown size={14} weight="fill" className={mine ? "" : "text-gold"} aria-label="1. miejsce" /> : `${place}.`}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.nick}
                    {mine && " (ty)"}
                  </span>
                  <span role="img" className="font-mono tabular-nums" aria-label={`${r.wins} wygranych z ${r.played} partii`}>
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

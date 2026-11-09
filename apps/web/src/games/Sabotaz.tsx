import { Bomb, Check, Footprints, Gavel, Minus, Plus } from "@phosphor-icons/react";
import { initials, type LobbyPlayer, SABOTAZ_ROUNDS, type SabotazKind, type SabotazMove, type SabotazRound, type SabotazView } from "@kwadrans/games";
import { type CSSProperties, useRef, useState } from "react";
import { Scores, StickyBar, useFresh } from "../screens/ui.tsx";
import { useHarm } from "../vibrate.ts";

interface Props {
  view: SabotazView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: SabotazMove) => void;
  /** Miejsca po partii z serwera (remisy); bez nich ekran ich nie zgaduje. */
  places?: Record<string, number> | null;
}

/** Lokalny szkic wyboru; serwer nic o nim nie wie. */
export type Draft = { kind?: SabotazKind; amount?: number; owner?: string; bidding?: boolean };
type Stored = { key: string; draft: Draft };

const KINDS: SabotazKind[] = ["safe", "trap"];
const NAME: Record<SabotazKind, string> = { safe: "Przejście", trap: "Pułapka" };
const ACCUSATIVE: Record<SabotazKind, string> = { safe: "Przejście", trap: "Pułapkę" };
const ICON = { safe: Footprints, trap: Bomb };

/** Odstęp między kolejnymi kartami pokazu i górna granica całego pokazu (odsłona trwa 15 s). */
const REVEAL_MS = 350;
const REVEAL_SHOW_MS = 1500;
const reducedMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const SEAT = "relative flex min-h-24 min-w-0 flex-col items-center gap-1 rounded-[10px] border px-1 py-1.5 text-center transition-colors duration-180";
const HAND = "relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-[10px] border px-1 transition-transform duration-180";
const POP = "animate-[stone-pop_0.35s_ease-out_both]";

const tint = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** Klucz szkicu: ten sam co termin decyzji na serwerze, więc cudza gotowość nie kasuje wyboru. */
export function decisionKey(view: SabotazView) {
  const base = `${view.nonce}:${view.round}:${view.phase}`;
  return view.phase === "place" || view.phase === "bid" || view.phase === "reveal" ? `${base}:${view.decision}` : base;
}

export const currentDraft = (stored: Stored, key: string): Draft => (stored.key === key ? stored.draft : {});

/** Ruchy z pól widoku; o legalności decyduje serwer. */
export function moves(view: SabotazView) {
  const stamp = { nonce: view.nonce, round: view.round };
  const decided = { ...stamp, decision: view.decision };
  return {
    place: (kind: SabotazKind): SabotazMove => (view.phase === "initial" ? { type: "place", kind, ...stamp } : { type: "place", kind, ...decided }),
    bid: (amount: number): SabotazMove => ({ type: "bid", amount, ...decided }),
    pass: (): SabotazMove => ({ type: "pass", ...decided }),
    reveal: (owner: string): SabotazMove => ({ type: "reveal", owner, ...decided }),
    next: (): SabotazMove => ({ type: "next", ...stamp }),
  };
}

/** Co ekran proponuje temu graczowi w tej decyzji. */
export function options(view: SabotazView, me: string, waitingFor: string[]) {
  const active = view.me !== null && view.players.includes(me) && waitingFor.includes(me);
  const hand = view.me?.hand;
  const placing = active && hand && (view.phase === "initial" || view.phase === "place");
  const total = view.players.reduce((sum, p) => sum + view.stackSizes[p], 0);
  const min = view.phase === "bid" ? (view.bid ?? 0) + 1 : 1;
  const bidding = active && (view.phase === "place" || view.phase === "bid") && min <= total;
  return {
    active,
    kinds: placing ? KINDS.filter((kind) => hand[kind] > 0) : [],
    bid: bidding ? { min, max: total } : null,
    canPass: active && view.phase === "bid",
    owners: active && view.phase === "reveal" ? view.players.filter((p) => p !== me && view.stackSizes[p] > 0) : [],
  };
}

/** Szkoda od rywala: tylko odkrywający cudzą Pułapkę w właśnie rozstrzygniętej próbie. */
export function harmKey(view: SabotazView, me: string): string | null {
  if (view.phase !== "summary" && view.phase !== "over") return null;
  const last = view.history[view.history.length - 1];
  if (!last || last.round !== view.round || last.outcome !== "foreign-trap" || last.leader !== me) return null;
  return `${view.nonce}:${view.round}:${me}:${last.trapOwner}`;
}

/** Rywale w kolejności tury, zaczynając od osoby po graczu; obserwator widzi wszystkich od pierwszego miejsca. */
export function rivalsOf(seats: string[], me: string) {
  const seat = seats.indexOf(me);
  return seat < 0 ? seats : [...seats.slice(seat + 1), ...seats.slice(0, seat)];
}

/** Co odkryje lider na własnym stosie przy tej deklaracji: odkrywanie zaczyna się od niego, od wierzchu. */
export function bidHint(view: SabotazView, amount: number) {
  const stack = view.me?.stack;
  if (!stack || stack.length === 0) return null;
  const top = stack.slice(-Math.min(amount, stack.length));
  return { count: top.length, trap: top.includes("trap") };
}

const hintText = ({ count, trap }: { count: number; trap: boolean }) => {
  if (count === 1) return trap ? "Najpierw odkryjesz swoją kartę: to Pułapka" : "Najpierw odkryjesz swoją kartę";
  return `Najpierw odkryjesz swoje ${count} karty${trap ? ", w tym swoją Pułapkę" : ""}`;
};

const plural = (count: number, one: string, few: string, many: string) => {
  if (count === 1) return one;
  const tens = count % 100;
  return count % 10 >= 2 && count % 10 <= 4 && (tens < 12 || tens > 14) ? few : many;
};

const coveredLabel = (count: number) => `${count} ${plural(count, "zakryta", "zakryte", "zakrytych")}`;

/**
 * Pierwsza karta z ostatniej aktualizacji odkryć: tylko one grają pokaz. Zastane po wejściu albo
 * odświeżeniu leżą od razu, a raz pokazane nie powtarzają animacji po przejściu do odsłony.
 */
function useRevealBatch(key: string, count: number) {
  const batch = useRef<{ key: string; count: number; from: number } | null>(null);
  const known = batch.current;
  if (!known) batch.current = { key, count, from: count };
  else if (known.key !== key) batch.current = { key, count, from: 0 };
  else if (known.count !== count) batch.current = { key, count, from: known.count };
  return batch.current!.from;
}

function Card({ kind, count }: { kind: SabotazKind; count?: number }) {
  const Icon = ICON[kind];
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Icon size={14} aria-hidden="true" />
      {NAME[kind]}
      {count !== undefined && count > 1 && <span className="font-mono tabular-nums">×{count}</span>}
    </span>
  );
}

/** Odkryta karta: kolor i inicjał właściciela, rodzaj ikoną, pełne wypełnienie dla kończącej Pułapki. */
function Face({ kind, color, label, owner, small = false, strong = false, className = "", delay }: { kind: SabotazKind; color: string; label: string; owner?: string; small?: boolean; strong?: boolean; className?: string; delay?: number }) {
  const Icon = ICON[kind];
  const style: CSSProperties = {
    borderColor: color,
    backgroundColor: strong ? color : "var(--color-surface)",
    color: strong ? "var(--color-bg)" : "var(--color-fg)",
    animationDelay: delay === undefined ? undefined : `${delay}ms`,
  };
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-[4px] border-2 ${small ? "h-9 w-7" : "h-12 w-9"} ${className}`} style={style}>
      <Icon size={small ? 16 : 20} weight={strong ? "fill" : "regular"} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      {owner && (
        <span className="absolute -right-1.5 -bottom-1.5 grid h-4 w-4 place-items-center rounded-full border border-bg text-[8px] font-semibold text-bg" style={{ backgroundColor: color }} aria-hidden="true">
          {owner}
        </span>
      )}
    </span>
  );
}

/** Koszulki zakrytych kart; stos ma najwyżej 4 karty, więc mieści się w wąskiej kolumnie. */
function CoveredStack({ count, color, popAt }: { count: number; color: string; popAt: (index: number) => boolean }) {
  return (
    <span className="flex h-7 items-center justify-center" aria-hidden="true">
      {count === 0 && <span className="h-7 w-5 rounded-[4px] border border-dashed border-line-hover" />}
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-7 w-5 rounded-[4px] border bg-surface ${i > 0 ? "-ml-3.5" : ""} ${popAt(i) ? "animate-[stone-pop_0.35s_ease-out]" : ""}`}
          style={{ borderColor: color, backgroundImage: `repeating-linear-gradient(135deg, ${tint(color, 45)} 0 2px, transparent 2px 5px)` }}
        />
      ))}
    </span>
  );
}

/** Rundy partii: zakończona w kolorze osoby, która zapunktowała; pudło na własnej Pułapce puste. */
function RoundTrack({ history, current, colorOf }: { history: SabotazRound[]; current: number; colorOf: (id: string | null) => string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: SABOTAZ_ROUNDS }, (_, i) => {
          const done = history.find((round) => round.round === i);
          const scorer = done && (done.outcome === "success" ? done.leader : done.outcome === "foreign-trap" ? done.trapOwner : null);
          const style: CSSProperties = scorer ? { backgroundColor: colorOf(scorer) } : done ? { borderColor: "var(--color-fg-subtle)" } : i === current ? { borderColor: "var(--color-fg)" } : { backgroundColor: "var(--color-line-hover)" };
          return <span key={i} className={`h-2.5 w-2.5 rounded-full ${!scorer && (done || i === current) ? "border" : ""}`} style={style} />;
        })}
      </span>
      <span className="label">Runda {current + 1} z {SABOTAZ_ROUNDS}</span>
    </div>
  );
}

/** Werdykt z zapisu rundy; punkty podaje serwer. */
function verdict(round: SabotazRound, nick: (id: string | null) => string) {
  if (round.outcome === "success") return { text: `${nick(round.leader)} odkrywa ${round.bid} z ${round.bid}:`, gain: round.gains[round.leader] };
  if (round.outcome === "foreign-trap") return { text: `${nick(round.leader)} wpada na Pułapkę: ${nick(round.trapOwner)}`, gain: round.gains[round.trapOwner!] };
  return { text: `${nick(round.leader)} wpada na własną Pułapkę, bez punktów`, gain: 0 };
}

type Marks = { nick: (id: string | null) => string; colorOf: (id: string | null) => string; mark: (id: string) => string };

/** Karty w kolejności odkrycia i werdykt. `show` to pokaz świeżo rozstrzygniętej rundy: nowe karty po kolei, werdykt na końcu. */
function RoundOutcome({ round, marks, show = null }: { round: SabotazRound; marks: Marks; show?: { from: number; step: number } | null }) {
  const { text, gain } = verdict(round, marks.nick);
  const last = round.reveals.length - 1;
  const after = show ? Math.max(0, round.reveals.length - show.from) * show.step : undefined;
  const pops = (i: number) => show !== null && i >= show.from;
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <ol className="flex flex-wrap justify-center gap-x-2 gap-y-2.5 pr-1.5 pb-1.5">
        {round.reveals.map((reveal, i) => (
          <li key={i}>
            <Face
              kind={reveal.kind}
              color={marks.colorOf(reveal.owner)}
              label={`${marks.nick(reveal.owner)} ${NAME[reveal.kind]}`}
              owner={marks.mark(reveal.owner)}
              strong={i === last && reveal.kind === "trap"}
              className={pops(i) ? POP : ""}
              delay={pops(i) ? (i - show!.from) * show!.step : undefined}
            />
          </li>
        ))}
      </ol>
      <p className={`relative w-fit text-base font-semibold text-balance ${show ? POP : ""}`} style={show ? { animationDelay: `${after}ms` } : undefined}>
        {text}
        {gain > 0 && <span className="ml-1 font-mono font-semibold tabular-nums">+{gain}</span>}
        {show && gain > 0 && (
          <span className="pointer-events-none absolute -top-2 right-0 animate-[float-up_1.6s_ease-out_both] font-mono font-semibold tabular-nums" style={{ animationDelay: `${after}ms` }} aria-hidden="true">
            +{gain}
          </span>
        )}
      </p>
      <p className="text-sm text-fg-muted">
        Deklaracja <span className="font-mono font-semibold tabular-nums">{round.bid}</span>
      </p>
    </div>
  );
}

/** Wszystkie stosy i pozostałe ręce po rozstrzygnięciu. */
function RoundCards({ round, nick }: { round: SabotazRound; nick: (id: string | null) => string }) {
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {Object.keys(round.stacks).map((id) => (
        <li key={id} data-player={id} className="rounded-[10px] border border-line px-3 py-2">
          <span className="font-medium">{nick(id)}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-fg-muted">
            <span className="text-xs">Stos:</span>
            {[...round.stacks[id]].reverse().map((kind, i) => (
              <Card key={i} kind={kind} />
            ))}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 text-fg-muted">
            <span className="text-xs">Ręka:</span>
            {KINDS.every((kind) => round.hands[id][kind] === 0) && <span className="text-xs">pusta</span>}
            {KINDS.filter((kind) => round.hands[id][kind] > 0).map((kind) => (
              <Card key={kind} kind={kind} count={round.hands[id][kind]} />
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RoundSummary({ view, me, players, waitingFor, onMove, places, fresh, revealFrom }: Props & { fresh: boolean; revealFrom: number }) {
  // Dotknięcie gdziekolwiek stawia od razu całą odsłonę (ZASADY §5).
  const [skipped, setSkipped] = useState(false);
  const player = (id: string | null) => players.find((p) => p.id === id);
  const nick = (id: string | null) => player(id)?.nick ?? "?";
  const colorOf = (id: string | null) => player(id)?.color ?? "var(--color-fg-muted)";
  const labels = initials(view.players.map(nick));
  const marks: Marks = { nick, colorOf, mark: (id) => labels[view.players.indexOf(id)] };
  const last = view.history[view.history.length - 1];
  const earlier = view.history.slice(0, -1);
  const color = colorOf(me);
  const seated = view.players.includes(me);
  const others = waitingFor.filter((id) => id !== me);
  const rows = [...view.players].sort((a, b) => view.totals[b] - view.totals[a]);
  const newCards = Math.max(1, last.reveals.length - revealFrom);
  const show = fresh && !skipped ? { from: revealFrom, step: reducedMotion ? 0 : Math.min(REVEAL_MS, REVEAL_SHOW_MS / newCards) } : null;
  return (
    <div className="flex flex-1 flex-col gap-3" onPointerDown={() => setSkipped(true)}>
      <RoundTrack history={view.history} current={last.round} colorOf={colorOf} />
      <section className="rounded-[10px] border border-line bg-surface-inset px-3 py-4">
        <RoundOutcome round={last} marks={marks} show={show} />
      </section>
      <p className="label -mb-2 px-1">Suma punktów</p>
      <Scores
        rows={rows.map((id) => ({
          id,
          nick: places ? `${places[id]}. ${nick(id)}` : nick(id),
          color: player(id)?.color,
          me: id === me,
          score: String(view.totals[id]),
        }))}
      />
      <details className="rounded-[10px] border border-line px-3">
        <summary className="flex min-h-12 cursor-pointer items-center text-sm">Pokaż karty</summary>
        <div className="pb-3">
          <RoundCards round={last} nick={nick} />
        </div>
      </details>
      {earlier.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="label">Poprzednie rundy</span>
          {earlier.map((round) => (
            <details key={round.round} className="rounded-[10px] border border-line px-3">
              <summary className="flex min-h-12 cursor-pointer items-center text-sm">Runda {round.round + 1}</summary>
              <div className="flex flex-col gap-3 pb-3">
                <RoundOutcome round={round} marks={marks} />
                <RoundCards round={round} nick={nick} />
              </div>
            </details>
          ))}
        </div>
      )}
      {view.phase === "summary" && seated && (
        <StickyBar className="mt-auto">
          <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!waitingFor.includes(me)} onClick={() => onMove(moves(view).next())}>
            {waitingFor.includes(me) ? "Dalej" : `Czekamy na: ${others.map(nick).join(", ")}…`}
          </button>
        </StickyBar>
      )}
    </div>
  );
}

export function SabotazBoard({ view, me, players, waitingFor, onMove, places, draft, onDraft }: Props & { draft: Draft; onDraft: (draft: Draft) => void }) {
  // Zastane po wejściu albo odświeżeniu leży od razu; animuje się tylko to, co stało się przy graczu.
  const stackKeys = view.players.flatMap((id) => Array.from({ length: view.stackSizes[id] }, (_, i) => `stack:${view.round}:${id}:${i}`));
  const { isNew } = useFresh([...stackKeys, ...view.history.map((round) => `round:${round.round}`)]);
  const revealFrom = useRevealBatch(`${view.nonce}:${view.round}`, view.reveals.length);
  const finished = view.phase === "summary" || view.phase === "over";
  if (finished && view.history.length > 0) {
    const round = view.history[view.history.length - 1].round;
    return <RoundSummary view={view} me={me} players={players} waitingFor={waitingFor} onMove={onMove} places={places} fresh={isNew(`round:${round}`)} revealFrom={revealFrom} />;
  }
  const player = (id: string | null) => players.find((p) => p.id === id);
  const nick = (id: string | null) => player(id)?.nick ?? "?";
  const colorOf = (id: string | null) => player(id)?.color ?? "var(--color-fg-muted)";
  const labels = initials(view.players.map(nick));
  const markOf = (id: string) => labels[view.players.indexOf(id)];
  const color = colorOf(me);
  const opts = options(view, me, waitingFor);
  const { active, kinds, bid, canPass, owners } = opts;
  const send = moves(view);
  const seats = rivalsOf(view.players, me);
  const onTable = view.players.reduce((sum, p) => sum + view.stackSizes[p], 0);

  const placing = active && (view.phase === "initial" || view.phase === "place");
  const choosing = placing && kinds.length > 0;
  // Z pustą ręką zostaje tylko licytacja, a w fazie licytacji nie ma już innego wyboru.
  const bidding = bid !== null && (view.phase === "bid" || !choosing || draft.bidding === true);
  const kind = !bidding && draft.kind && kinds.includes(draft.kind) ? draft.kind : null;
  const owner = draft.owner && owners.includes(draft.owner) ? draft.owner : null;
  const amount = bid ? Math.min(bid.max, Math.max(bid.min, draft.amount ?? bid.min)) : 0;
  const verb = view.phase === "initial" ? "Połóż" : "Dołóż";
  const hint = bidding ? bidHint(view, amount) : null;
  const showHand = view.phase === "initial" || view.phase === "place";
  const small = (view.bid ?? 0) > 8;
  const step = reducedMotion ? 0 : Math.min(REVEAL_MS, REVEAL_SHOW_MS / Math.max(1, view.reveals.length - revealFrom));

  const prompt = (() => {
    switch (view.phase) {
      case "initial":
        return active ? "Wybierz kartę na swój stos." : `Czekamy na: ${waitingFor.map(nick).join(", ")}…`;
      case "place":
        if (!active) return `${nick(view.turn)} dokłada albo otwiera licytację.`;
        return kinds.length > 0 ? "Dołóż kartę albo otwórz licytację." : "Ręka pusta: otwórz licytację.";
      case "bid":
        if (!active) return `Teraz decyduje: ${nick(view.turn)}.`;
        return bid ? "Podbij albo spasuj." : "To już wszystkie karty na stole: zostaje pas.";
      case "reveal":
        return active ? "Wybierz stos, z którego odkryjesz wierzchnią kartę." : `${nick(view.leader)} odkrywa karty.`;
      default:
        return "";
    }
  })();

  return (
    <div className="flex flex-1 flex-col gap-2">
      <RoundTrack history={view.history} current={view.round} colorOf={colorOf} />

      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${seats.length}, minmax(0, 1fr))` }}>
        {seats.map((id) => {
          const revealed = view.reveals.filter((r) => r.owner === id);
          const passed = view.passed.includes(id);
          const leads = view.leader === id;
          const picked = owner === id;
          const selectable = owners.includes(id);
          const turn = view.turn === id;
          const count = view.stackSizes[id];
          const label = [`${nick(id)}: ${coveredLabel(count)}`, leads && "lider", passed && "pas", revealed.length > 0 && `odkryte ${revealed.length}`].filter(Boolean).join(", ");
          const status = passed ? "Pas" : leads ? "Lider" : turn ? "Teraz" : null;
          const body = (
            <>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-bg" style={{ backgroundColor: colorOf(id) }} aria-hidden="true">
                {markOf(id)}
              </span>
              <span className="w-full truncate text-xs font-medium">{nick(id)}</span>
              <CoveredStack count={count} color={colorOf(id)} popAt={(i) => isNew(`stack:${view.round}:${id}:${i}`)} />
              <span className="text-[11px] text-fg-muted">
                <span className="font-mono tabular-nums">{view.totals[id]}</span> pkt
              </span>
              <span className="flex min-h-4 items-center text-[11px] leading-4 font-semibold" style={{ color: status === "Pas" ? "var(--color-fg-muted)" : colorOf(id) }}>
                {status}
              </span>
              {picked && <Check size={14} weight="bold" className="absolute top-1 right-1" aria-hidden="true" />}
            </>
          );
          const edge: CSSProperties = picked
            ? { borderColor: color, backgroundColor: tint(color, 16) }
            : turn
              ? { borderColor: colorOf(id), backgroundColor: tint(colorOf(id), 14) }
              : { borderColor: "var(--color-line)" };
          return selectable ? (
            <button
              key={id}
              type="button"
              className={`${SEAT} ${picked ? "" : "animate-[ring-pulse_1.2s_ease-in-out_infinite] outline-2"}`}
              style={{ ...edge, outlineColor: picked ? undefined : color }}
              aria-label={label}
              aria-pressed={picked}
              onClick={() => onDraft({ owner: id })}
            >
              {body}
            </button>
          ) : (
            <div key={id} role="group" className={SEAT} style={edge} aria-label={label}>
              {body}
            </div>
          );
        })}
      </div>

      <section className="flex min-h-20 flex-1 flex-col items-center justify-center gap-1.5 rounded-[10px] border border-line bg-surface-inset px-3 py-2 text-center">
        {view.phase === "reveal" ? (
          <>
            <p className="text-sm">
              Odkryto <span className="font-mono font-semibold tabular-nums">{view.reveals.length} z {view.bid}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-2 pr-1.5 pb-1.5">
              {Array.from({ length: view.bid ?? 0 }, (_, i) => {
                const reveal = view.reveals[i];
                if (!reveal) return <span key={`slot:${i}`} className={`rounded-[4px] border border-dashed border-line-hover ${small ? "h-9 w-7" : "h-12 w-9"}`} aria-hidden="true" />;
                const pops = i >= revealFrom;
                return (
                  <Face
                    key={`card:${i}`}
                    kind={reveal.kind}
                    color={colorOf(reveal.owner)}
                    label={`${nick(reveal.owner)}: ${NAME[reveal.kind]}`}
                    owner={markOf(reveal.owner)}
                    small={small}
                    className={pops ? POP : ""}
                    delay={pops ? (i - revealFrom) * step : undefined}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <>
            {view.phase !== "initial" && (
              <p className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-semibold tabular-nums">{onTable}</span>
                <span className="label">{plural(onTable, "karta", "karty", "kart")} na stole</span>
              </p>
            )}
            {view.bid !== null && (
              <p className="text-sm">
                Deklaracja <span className="font-mono font-semibold tabular-nums">{view.bid}</span> · {view.leader === me ? "ty" : nick(view.leader)}
              </p>
            )}
          </>
        )}
        {prompt && <p className="text-sm text-fg-muted">{prompt}</p>}
      </section>

      {view.me && (
        <div className="flex min-h-9 items-center gap-2 pr-1.5">
          <span className="label">Twój stos</span>
          {view.me.stack.length === 0 ? (
            <span className="text-xs text-fg-muted">pusty</span>
          ) : (
            <>
              <span className="text-[11px] text-fg-muted">wierzch</span>
              <span className="flex gap-1">
                {[...view.me.stack].reverse().map((k, i) => (
                  <Face key={i} kind={k} color={i === 0 ? color : "var(--color-line-hover)"} label={NAME[k]} small />
                ))}
              </span>
            </>
          )}
          <span className="ml-auto flex items-center gap-2 text-xs whitespace-nowrap">
            {view.leader === me && <span className="font-semibold" style={{ color }}>Lider</span>}
            {view.passed.includes(me) && <span className="text-fg-muted">Pas</span>}
            <span className="text-fg-muted">
              <span className="font-mono tabular-nums">{view.totals[me]}</span> pkt
            </span>
          </span>
        </div>
      )}

      {view.me && showHand && (
        <div className="flex flex-col gap-1">
          <span className="label">Twoja ręka</span>
          <div className={`grid gap-2 ${choosing && bid ? "grid-cols-3" : "grid-cols-2"}`}>
            {KINDS.map((k) => {
              const Icon = ICON[k];
              const content = (
                <>
                  <Icon size={22} aria-hidden="true" />
                  <span className="text-sm whitespace-nowrap">
                    {NAME[k]} <span className="font-mono tabular-nums">× {view.me!.hand[k]}</span>
                  </span>
                  {kind === k && <Check size={14} weight="bold" className="absolute top-1 right-1" aria-hidden="true" />}
                </>
              );
              return choosing ? (
                <button
                  key={k}
                  type="button"
                  className={`${HAND} disabled:opacity-40 ${kind === k ? "-translate-y-1" : ""}`}
                  style={{ borderColor: kind === k ? color : "var(--color-line)", backgroundColor: kind === k ? tint(color, 16) : undefined }}
                  aria-pressed={kind === k}
                  disabled={!kinds.includes(k)}
                  onClick={() => onDraft({ amount: draft.amount, kind: k })}
                >
                  {content}
                </button>
              ) : (
                <div key={k} className={`${HAND} border-line text-fg-muted`}>
                  {content}
                </div>
              );
            })}
            {choosing && bid && (
              <button
                type="button"
                className={`${HAND} ${bidding ? "-translate-y-1" : ""}`}
                style={{ borderColor: bidding ? color : "var(--color-line)", backgroundColor: bidding ? tint(color, 16) : undefined }}
                aria-pressed={bidding}
                onClick={() => onDraft({ amount: draft.amount, bidding: true })}
              >
                <Gavel size={22} aria-hidden="true" />
                <span className="text-sm">Licytuj</span>
                {bidding && <Check size={14} weight="bold" className="absolute top-1 right-1" aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      )}

      {active && (
        <div className="flex flex-col gap-2">
          {bidding && bid && (
            <>
              {hint && <p className={`text-center text-xs ${hint.trap ? "font-semibold text-fg" : "text-fg-muted"}`}>{hintText(hint)}</p>}
              <div className="flex items-center justify-between gap-2">
                <button type="button" className="btn btn-ghost w-12 shrink-0 px-0" aria-label="Mniej" disabled={amount <= bid.min} onClick={() => onDraft({ ...draft, amount: amount - 1 })}>
                  <Minus size={18} weight="bold" aria-hidden="true" />
                </button>
                <span className="w-10 text-center font-mono text-3xl font-semibold tabular-nums" aria-hidden="true">{amount}</span>
                <button type="button" className="btn btn-ghost w-12 shrink-0 px-0" aria-label="Więcej" disabled={amount >= bid.max} onClick={() => onDraft({ ...draft, amount: amount + 1 })}>
                  <Plus size={18} weight="bold" aria-hidden="true" />
                </button>
                {/* Ręka zostaje na ekranie, więc przy dokładaniu zatwierdzenie stoi w tym samym rzędzie (360×640). */}
                {view.phase === "place" && (
                  <button type="button" className="btn btn-player min-w-0 flex-1 px-2" style={{ backgroundColor: color }} onClick={() => onMove(send.bid(amount))}>
                    Licytuj <span className="font-mono tabular-nums">{amount}</span>
                  </button>
                )}
              </div>
            </>
          )}
          {placing && !bidding && (kind ? (
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} onClick={() => onMove(send.place(kind))}>
              {verb} {ACCUSATIVE[kind]}
            </button>
          ) : (
            choosing && <div className="min-h-12" aria-hidden="true" />
          ))}
          {view.phase === "bid" && (
            <div className="flex gap-2">
              {canPass && (
                <button type="button" className={`btn btn-ghost ${bid ? "w-24 shrink-0 px-2" : "w-full"}`} onClick={() => onMove(send.pass())}>
                  Pas
                </button>
              )}
              {bid && (
                <button type="button" className="btn btn-player min-w-0 flex-1 px-2" style={{ backgroundColor: color }} onClick={() => onMove(send.bid(amount))}>
                  Podbij do <span className="font-mono tabular-nums">{amount}</span>
                </button>
              )}
            </div>
          )}
          {view.phase === "reveal" && (owner ? (
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} onClick={() => onMove(send.reveal(owner))}>
              Odkryj u {nick(owner)}
            </button>
          ) : (
            <div className="min-h-12" aria-hidden="true" />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sabotaz(props: Props) {
  const key = decisionKey(props.view);
  const [stored, setStored] = useState<Stored>({ key, draft: {} });
  useHarm(harmKey(props.view, props.me));
  return <SabotazBoard {...props} draft={currentDraft(stored, key)} onDraft={(draft) => setStored({ key, draft })} />;
}

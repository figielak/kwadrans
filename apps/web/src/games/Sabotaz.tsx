import { Bomb, Check, Footprints, Minus, Plus } from "@phosphor-icons/react";
import { initials, type LobbyPlayer, SABOTAZ_ROUNDS, type SabotazKind, type SabotazMove, type SabotazView } from "@kwadrans/games";
import { useState } from "react";

interface Props {
  view: SabotazView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: SabotazMove) => void;
}

/** Lokalny szkic wyboru; serwer nic o nim nie wie. */
export type Draft = { kind?: SabotazKind; amount?: number; owner?: string };
type Stored = { key: string; draft: Draft };

const KINDS: SabotazKind[] = ["safe", "trap"];
const NAME: Record<SabotazKind, string> = { safe: "Przejście", trap: "Pułapka" };
const ACCUSATIVE: Record<SabotazKind, string> = { safe: "Przejście", trap: "Pułapkę" };
const ICON = { safe: Footprints, trap: Bomb };

const TILE = "flex min-h-14 flex-col justify-center gap-0.5 rounded-[10px] border px-3 py-2 text-left";

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

const coveredLabel = (count: number) => {
  if (count === 1) return "1 zakryta";
  const tens = count % 100;
  return count % 10 >= 2 && count % 10 <= 4 && (tens < 12 || tens > 14) ? `${count} zakryte` : `${count} zakrytych`;
};

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

export function SabotazBoard({ view, me, players, waitingFor, onMove, draft, onDraft }: Props & { draft: Draft; onDraft: (draft: Draft) => void }) {
  const player = (id: string | null) => players.find((p) => p.id === id);
  const nick = (id: string | null) => player(id)?.nick ?? "?";
  const colorOf = (id: string | null) => player(id)?.color ?? "var(--color-fg-muted)";
  const labels = initials(view.players.map(nick));
  const color = colorOf(me);
  const opts = options(view, me, waitingFor);
  const { active, kinds, bid, canPass, owners } = opts;
  const send = moves(view);

  const kind = draft.kind && kinds.includes(draft.kind) ? draft.kind : null;
  const owner = draft.owner && owners.includes(draft.owner) ? draft.owner : null;
  const amount = bid ? Math.min(bid.max, Math.max(bid.min, draft.amount ?? bid.min)) : 0;
  const placing = active && (view.phase === "initial" || view.phase === "place");
  const verb = view.phase === "initial" ? "Połóż" : "Dołóż";

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
      <div className="flex items-baseline justify-between gap-2">
        <span className="label">Runda {view.round + 1} z {SABOTAZ_ROUNDS}</span>
        {view.bid !== null && (
          <span className="text-sm">
            {view.phase === "reveal" ? (
              <>
                Odkryto <span className="font-mono font-semibold tabular-nums">{view.reveals.length} z {view.bid}</span>
              </>
            ) : (
              <>
                Deklaracja <span className="font-mono font-semibold tabular-nums">{view.bid}</span>
              </>
            )}
          </span>
        )}
      </div>
      {prompt && <p className="text-sm text-fg-muted">{prompt}</p>}

      <div className="grid grid-cols-2 gap-2">
        {view.players.map((id, i) => {
          const revealed = view.reveals.filter((r) => r.owner === id);
          const passed = view.passed.includes(id);
          const leads = view.leader === id;
          const picked = owner === id;
          const count = view.stackSizes[id];
          const label = [`${nick(id)}: ${coveredLabel(count)}`, leads && "lider", passed && "pas", revealed.length > 0 && `odkryte ${revealed.length}`].filter(Boolean).join(", ");
          const body = (
            <>
              <span className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-bg" style={{ backgroundColor: colorOf(id) }} aria-hidden="true">
                  {labels[i]}
                </span>
                <span className="min-w-0 truncate text-sm font-medium">
                  {nick(id)}
                  {id === me && " (ty)"}
                </span>
                {picked && <Check size={16} weight="bold" className="ml-auto shrink-0" aria-hidden="true" />}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
                <span>
                  <span className="font-mono tabular-nums">{count}</span> zakr.
                </span>
                {leads && <span className="font-semibold text-fg">Lider</span>}
                {passed && <span>Pas</span>}
              </span>
              {revealed.length > 0 && (
                <span className="flex flex-wrap gap-x-2">
                  {KINDS.filter((k) => revealed.some((r) => r.kind === k)).map((k) => (
                    <Card key={k} kind={k} count={revealed.filter((r) => r.kind === k).length} />
                  ))}
                </span>
              )}
            </>
          );
          const edge = { borderColor: picked || view.turn === id ? colorOf(id) : "var(--color-line)" };
          return owners.includes(id) ? (
            <button key={id} type="button" className={TILE} style={edge} aria-label={label} aria-pressed={picked} onClick={() => onDraft({ owner: id })}>
              {body}
            </button>
          ) : (
            <div key={id} role="group" className={TILE} style={edge} aria-label={label}>
              {body}
            </div>
          );
        })}
      </div>

      {view.me && (
        <div className="flex flex-col gap-1">
          <span className="label">Twój stos (od góry)</span>
          <div className="flex min-h-5 flex-wrap gap-x-2 gap-y-0.5 text-fg-muted">
            {view.me.stack.length === 0 ? <span className="text-xs">pusty</span> : [...view.me.stack].reverse().map((k, i) => <Card key={i} kind={k} />)}
          </div>
          <span className="label mt-1">Twoja ręka</span>
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => {
              const Icon = ICON[k];
              const content = (
                <>
                  <Icon size={18} aria-hidden="true" />
                  <span className="text-sm">{NAME[k]}</span>
                  <span className="font-mono text-sm tabular-nums">× {view.me!.hand[k]}</span>
                  {kind === k && <Check size={16} weight="bold" aria-hidden="true" />}
                </>
              );
              return placing && kinds.length > 0 ? (
                <button
                  key={k}
                  type="button"
                  className="flex min-h-12 items-center justify-center gap-1.5 rounded-[10px] border px-2 disabled:opacity-40"
                  style={{ borderColor: kind === k ? color : "var(--color-line)" }}
                  aria-pressed={kind === k}
                  disabled={!kinds.includes(k)}
                  onClick={() => onDraft({ ...draft, kind: k })}
                >
                  {content}
                </button>
              ) : (
                <div key={k} className="flex min-h-8 items-center justify-center gap-1.5 rounded-[10px] border border-line px-2 text-fg-muted">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active && (
        <div className="mt-auto flex flex-col gap-2">
          {placing && kinds.length > 0 && (
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!kind} onClick={() => kind && onMove(send.place(kind))}>
              {kind ? `${verb} ${ACCUSATIVE[kind]}` : "Wybierz kartę"}
            </button>
          )}
          {bid && (
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-ghost w-12 shrink-0 px-0" aria-label="Mniej" disabled={amount <= bid.min} onClick={() => onDraft({ ...draft, amount: amount - 1 })}>
                <Minus size={18} weight="bold" aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-ghost w-12 shrink-0 px-0" aria-label="Więcej" disabled={amount >= bid.max} onClick={() => onDraft({ ...draft, amount: amount + 1 })}>
                <Plus size={18} weight="bold" aria-hidden="true" />
              </button>
              {view.phase === "bid" ? (
                <button type="button" className="btn btn-player flex-1 px-2" style={{ backgroundColor: color }} onClick={() => onMove(send.bid(amount))}>
                  Licytuj <span className="font-mono tabular-nums">{amount}</span>
                </button>
              ) : (
                <button type="button" className="btn btn-ghost flex-1 px-2" onClick={() => onMove(send.bid(amount))}>
                  Licytuj <span className="font-mono tabular-nums">{amount}</span>
                </button>
              )}
            </div>
          )}
          {canPass && (
            <button type="button" className="btn btn-ghost w-full" onClick={() => onMove(send.pass())}>
              Pas
            </button>
          )}
          {view.phase === "reveal" && (
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!owner} onClick={() => owner && onMove(send.reveal(owner))}>
              {owner ? `Odkryj u ${nick(owner)}` : "Wybierz stos"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Sabotaz(props: Props) {
  const key = decisionKey(props.view);
  const [stored, setStored] = useState<Stored>({ key, draft: {} });
  return <SabotazBoard {...props} draft={currentDraft(stored, key)} onDraft={(draft) => setStored({ key, draft })} />;
}

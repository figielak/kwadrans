import { Bridge, Bug, Check, Coins, Footprints, Mountains, Tent, Warning, Waves } from "@phosphor-icons/react";
import { initials, type LobbyPlayer, WYPRAWA_EXPEDITIONS, WYPRAWA_HAZARDS, type WyprawaMove, type WyprawaView } from "@kwadrans/games";
import { type ComponentType, type ReactNode, useState } from "react";
import { Stats, StickyBar, useFresh } from "../screens/ui.tsx";

interface Props {
  view: WyprawaView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: WyprawaMove) => void;
  /** Miejsca po partii z serwera (remisy); bez nich ekran ich nie zgaduje. */
  places?: Record<string, number> | null;
}

type Card = WyprawaView["trail"][number];
type Hazard = (typeof WYPRAWA_HAZARDS)[number];
type Choice = NonNullable<WyprawaView["myChoice"]>;

/** Lokalny szkic wyboru; serwer nic o nim nie wie, dopóki gracz nie dotknie „Gotowe”. */
export type Draft = { choice?: Choice };
export type Stored = { key: string; draft: Draft };

const HAZARD: Record<Hazard, { name: string; icon: ComponentType<{ size?: number; "aria-hidden"?: "true" }> }> = {
  osuwisko: { name: "Osuwisko", icon: Mountains },
  zalanie: { name: "Zalanie", icon: Waves },
  roj: { name: "Rój", icon: Bug },
  przepasc: { name: "Przepaść", icon: Warning },
  most: { name: "Zawalony most", icon: Bridge },
};

const CHOICES: { choice: Choice; label: string; icon: ComponentType<{ size?: number; "aria-hidden"?: "true" }> }[] = [
  { choice: "continue", label: "Idę dalej", icon: Footprints },
  { choice: "return", label: "Wracam", icon: Tent },
];
const LABEL: Record<Choice, string> = { continue: "Idę dalej", return: "Wracam" };

const cardName = (card: Card) => (card.kind === "treasure" ? `Skarb ${card.value}` : HAZARD[card.hazard].name);

/** Klucz szkicu: nonce, wyprawa, odkrycie i faza, więc nowa karta, nowa wyprawa i rewanż kasują wybór, a cudza gotowość nie. */
export function decisionKey(view: WyprawaView) {
  return `${view.nonce}:${view.expedition}:${view.reveal}:${view.phase}`;
}

export const currentDraft = (stored: Stored, view: WyprawaView): Draft => (stored.key === decisionKey(view) ? stored.draft : {});

/** Ruchy z pól widoku; o legalności decyduje serwer. `choose` jest tylko po wyborze. */
export function moves(view: WyprawaView, draft: Draft) {
  const stamp = { nonce: view.nonce, expedition: view.expedition };
  return {
    choose: draft.choice ? ({ type: "choose", choice: draft.choice, ...stamp, reveal: view.reveal } satisfies WyprawaMove) : null,
    next: { type: "next", ...stamp } satisfies WyprawaMove,
  };
}

/** Co ekran proponuje temu graczowi w tej decyzji. */
export function options(view: WyprawaView, me: string, waitingFor: string[]) {
  const seated = view.players.includes(me);
  const deciding = view.phase === "decision";
  const onTrail = seated && deciding && view.onTrail.includes(me);
  return {
    seated,
    onTrail,
    camp: seated && deciding && !view.onTrail.includes(me),
    active: onTrail && view.myChoice === null && waitingFor.includes(me),
    confirmed: onTrail ? view.myChoice : null,
  };
}

interface ControlsProps {
  view: WyprawaView;
  me: string;
  waitingFor: string[];
  color: string;
  draft: Draft;
  onDraft: (draft: Draft) => void;
  onMove: (move: WyprawaMove) => void;
}

/** Dolny pasek decyzji: dwie opcje, „Gotowe” albo zatwierdzony wybór. Bez hooków, żeby dało się go sprawdzić bez DOM. */
export function DecisionControls({ view, me, waitingFor, color, draft, onDraft, onMove }: ControlsProps) {
  const { active, confirmed } = options(view, me, waitingFor);
  if (confirmed) {
    return (
      <StickyBar className="mt-auto">
        <p className="flex min-h-12 w-full items-center justify-center gap-1.5 text-sm font-medium">
          <Check size={16} weight="bold" aria-hidden="true" />
          Zatwierdzone: {LABEL[confirmed]}
        </p>
      </StickyBar>
    );
  }
  if (!active) return null;
  const send = moves(view, draft).choose;
  return (
    <StickyBar className="mt-auto">
      <div className="flex w-full flex-col gap-2">
        <p className="text-xs text-fg-muted">Bez Gotowe po czasie wracasz.</p>
        <div className="grid grid-cols-2 gap-2">
          {CHOICES.map(({ choice, label, icon: Icon }) => {
            const picked = draft.choice === choice;
            return (
              <button
                key={choice}
                type="button"
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-[10px] border px-2"
                style={{ borderColor: picked ? color : "var(--color-line)" }}
                aria-pressed={picked}
                onClick={() => onDraft({ choice })}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
                {picked && <Check size={16} weight="bold" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!send} onClick={() => send && onMove(send)}>
          Gotowe
        </button>
      </div>
    </StickyBar>
  );
}

function CurrentCard({ card, view, fresh }: { card: Card; view: WyprawaView; fresh: boolean }) {
  const shown = fresh ? "animate-[card-in_0.35s_ease-out]" : "";
  if (card.kind === "treasure") {
    const people = Math.max(1, view.onTrail.length);
    return (
      <div className={`tile flex items-center gap-3 p-4 ${shown}`}>
        <Coins size={32} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="font-mono text-2xl font-semibold tabular-nums">Skarb {card.value}</span>
          <span className="text-sm text-fg-muted">
            Dzieli się po równo: po {Math.floor(card.value / people)} na osobę, reszta zostaje na szlaku.
          </span>
        </div>
      </div>
    );
  }
  const Icon = HAZARD[card.hazard].icon;
  const seen = view.trail.filter((c) => c.kind === "hazard" && c.hazard === card.hazard).length;
  return (
    <div className={`tile flex items-center gap-3 p-4 ${shown}`}>
      <Icon size={32} aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-2xl font-semibold">{HAZARD[card.hazard].name}</span>
        <span className="text-sm text-fg-muted">{seen > 1 ? "Drugie takie samo: wyprawa się kończy." : "Pierwsze ostrzeżenie. Drugie takie samo kończy wyprawę."}</span>
      </div>
    </div>
  );
}

function Hazards({ view }: { view: WyprawaView }) {
  return (
    <ul className="grid grid-cols-5 gap-1.5">
      {WYPRAWA_HAZARDS.map((hazard) => {
        const Icon = HAZARD[hazard].icon;
        const count = view.trail.filter((c) => c.kind === "hazard" && c.hazard === hazard).length;
        return (
          <li
            key={hazard}
            data-hazard={hazard}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[10px] border border-line px-1 py-1.5 text-center"
            style={{ borderColor: count > 0 ? "var(--color-fg-muted)" : undefined }}
            aria-label={`${HAZARD[hazard].name}: ${count} z 2`}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="text-[10px] leading-tight text-fg-muted">{HAZARD[hazard].name}</span>
            <span className="font-mono text-sm font-semibold tabular-nums">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

function LastResolution({ view, me, nick, fresh }: { view: WyprawaView; me: string; nick: (id: string) => string; fresh: boolean }) {
  const last = view.last;
  if (!last) return null;
  const previous = view.trail[view.trail.length - 2];
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-line px-3 py-2 text-sm">
      <span className="label">Poprzednia decyzja</span>
      {previous && <p className="text-fg-muted">Poprzednia karta: {cardName(previous)}</p>}
      <ul className="flex flex-col gap-0.5">
        {Object.keys(last.choices).map((id) => {
          const back = last.returned.includes(id);
          return (
            <li key={id} data-decision={id} className="relative">
              {nick(id)}: {back ? "wraca" : "idzie dalej"}
              {back && last.banked[id] > 0 && (
                <>
                  , <span className="font-mono tabular-nums">+{last.banked[id]}</span> do banku
                  {fresh && id === me && (
                    <span className="pointer-events-none absolute -top-2 right-0 animate-[float-up_1.6s_ease-out_forwards] font-mono font-semibold tabular-nums" aria-hidden="true">
                      +{last.banked[id]}
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {last.returned.length > 0 && (
        <p className="text-fg-muted">
          Podział resztek: po <span className="font-mono tabular-nums">{last.share}</span>, na szlaku zostaje <span className="font-mono tabular-nums">{last.looseAfter}</span>.
        </p>
      )}
    </div>
  );
}

function Roster({ view, me, players }: { view: WyprawaView; me: string; players: LobbyPlayer[] }) {
  const labels = initials(view.players.map((id) => players.find((p) => p.id === id)?.nick ?? "?"));
  return (
    <ul className="grid grid-cols-2 gap-2">
      {view.players.map((id, i) => {
        const player = players.find((p) => p.id === id);
        const onTrail = view.onTrail.includes(id);
        const ready = view.phase === "decision" && onTrail && view.ready.includes(id);
        const Place = onTrail ? Footprints : Tent;
        return (
          <li key={id} data-player={id} className="flex min-h-13 flex-col justify-center gap-0.5 rounded-[10px] border border-line px-3 py-1.5">
            <span className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-bg" style={{ backgroundColor: player?.color }} aria-hidden="true">
                {labels[i]}
              </span>
              <span className="min-w-0 truncate text-sm font-medium">
                {player?.nick ?? "?"}
                {id === me && " (ty)"}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
              <span className="inline-flex items-center gap-1">
                <Place size={12} aria-hidden="true" />
                {onTrail ? "szlak" : "obóz"}
              </span>
              <span>
                bank <span className="font-mono tabular-nums">{view.bank[id]}</span>
              </span>
              {onTrail && (
                <span>
                  niesie <span className="font-mono tabular-nums">{view.carried[id]}</span>
                </span>
              )}
              {ready && (
                <span className="inline-flex items-center gap-1 font-semibold text-fg">
                  <Check size={12} weight="bold" aria-hidden="true" />
                  gotowe
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function TrailDetails({ view }: { view: WyprawaView }) {
  return (
    <details className="rounded-[10px] border border-line px-3">
      <summary className="flex min-h-12 cursor-pointer items-center text-sm">Szlak: {view.trail.length} odkrytych kart</summary>
      <ol className="flex flex-col gap-1 pb-3 text-sm">
        {view.trail.map((card, i) => (
          <li key={i} data-trail={i + 1} className="flex items-center gap-2">
            <span className="w-5 text-right font-mono tabular-nums text-fg-muted">{i + 1}.</span>
            {card.kind === "treasure" ? <Coins size={14} aria-hidden="true" /> : (() => {
              const Icon = HAZARD[card.hazard].icon;
              return <Icon size={14} aria-hidden="true" />;
            })()}
            {cardName(card)}
          </li>
        ))}
      </ol>
    </details>
  );
}

type Expedition = WyprawaView["history"][number];

/** Powód końca wyprawy, z zapisu wyprawy. */
function endText(record: Expedition) {
  if (record.end === "hazard" && record.hazard) return `Drugie ${HAZARD[record.hazard].name}: wyprawa się kończy. Kto został na szlaku, traci zdobycz.`;
  if (record.end === "empty") return "Talia wyczerpana: pozostali wracają razem i dzielą resztki.";
  return "Wszyscy wrócili do obozu. Nikt nic nie traci.";
}

function Trail({ cards }: { cards: Card[] }) {
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {cards.map((card, i) => {
        const Icon = card.kind === "treasure" ? Coins : HAZARD[card.hazard].icon;
        return (
          <li key={i} data-trail={i + 1} className="flex items-center gap-2">
            <span className="w-5 text-right font-mono tabular-nums text-fg-muted">{i + 1}.</span>
            <Icon size={14} aria-hidden="true" />
            {cardName(card)}
          </li>
        );
      })}
    </ol>
  );
}

/** Przycisk „Dalej” albo informacja, na kogo czekamy; widz nie ma nic. Bez hooków, żeby dało się go sprawdzić bez DOM. */
export function NextBar({ view, me, waitingFor, color, nick, onMove }: { view: WyprawaView; me: string; waitingFor: string[]; color: string; nick: (id: string) => string; onMove: (move: WyprawaMove) => void }) {
  if (view.phase !== "summary" || !view.players.includes(me) || waitingFor.length === 0) return null;
  if (!waitingFor.includes(me)) {
    return (
      <StickyBar className="mt-auto">
        <p className="flex min-h-12 w-full items-center justify-center gap-1.5 text-sm font-medium">
          <Check size={16} weight="bold" aria-hidden="true" />
          Czekamy na: {waitingFor.map(nick).join(", ")}…
        </p>
      </StickyBar>
    );
  }
  return (
    <StickyBar className="mt-auto">
      <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} onClick={() => onMove(moves(view, {}).next)}>
        Dalej
      </button>
    </StickyBar>
  );
}

/** Odsłona: wiersz na gracza ze zyskiem, stratą i bankiem, powód końca i szlak tej wyprawy. */
function Reveal({ view, record, nick, players }: { view: WyprawaView; record: Expedition; nick: (id: string) => string; players: LobbyPlayer[] }) {
  const rows = [...view.players].sort((a, b) => view.bank[b] - view.bank[a]);
  return (
    <>
      <p className="text-sm">{endText(record)}</p>
      <ul className="flex flex-col gap-2">
        {rows.map((id) => (
          <li key={id} data-player={id} className="flex flex-col gap-0.5 rounded-[10px] border border-line px-3 py-2">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{nick(id)}</span>
              <span className="text-sm">
                bank <span className="font-mono font-semibold tabular-nums">{view.bank[id]}</span>
              </span>
            </span>
            <span className="flex gap-x-3 text-xs text-fg-muted">
              <span>
                zdobyte <span className="font-mono tabular-nums">+{record.gain[id]}</span>
              </span>
              <span>
                utracone <span className="font-mono tabular-nums">-{record.lost[id]}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      {record.discarded > 0 && <p className="text-sm text-fg-muted">Przepadło na szlaku: {record.discarded}.</p>}
      <span className="label">Szlak tej wyprawy</span>
      <Trail cards={record.trail} />
    </>
  );
}

/** Koniec partii: banki i zyski z pięciu wypraw, potem ostatnia wyprawa i wcześniejsze do rozwinięcia. */
function Final({ view, nick, players, places }: { view: WyprawaView; nick: (id: string) => string; players: LobbyPlayer[]; places?: Props["places"] }) {
  const rows = [...view.players].sort((a, b) => view.bank[b] - view.bank[a]);
  const last = view.history[view.history.length - 1];
  const earlier = view.history.slice(0, -1);
  return (
    <>
      <div className="tile p-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="label">
              <th className="text-left font-normal">Gracz</th>
              {view.history.map((_, i) => (
                <th key={i} className="w-8 text-right font-normal" aria-label={`Wyprawa ${i + 1}`}>
                  {i + 1}
                </th>
              ))}
              <th className="w-12 text-right font-normal">Bank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((id) => (
              <tr key={id} data-player={id} className="min-h-8">
                <td className="max-w-0 truncate py-1 pr-2">
                  <span className="mr-1.5 inline-block size-2.5 rounded-full align-middle" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
                  {places ? `${places[id]}. ` : ""}
                  {nick(id)}
                </td>
                {view.history.map((record, i) => (
                  <td key={i} data-expedition={i + 1} className="py-1 text-right font-mono tabular-nums text-fg-muted">
                    {record.gain[id]}
                  </td>
                ))}
                <td className="py-1 text-right font-mono font-semibold tabular-nums">{view.bank[id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {last && (
        <>
          <span className="label">Wyprawa {view.history.length}: ostatnia</span>
          <Reveal view={view} record={last} nick={nick} players={players} />
        </>
      )}
      {earlier.map((record, i) => (
        <details key={i} className="rounded-[10px] border border-line px-3">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm">Wyprawa {i + 1}</summary>
          <div className="flex flex-col gap-2 pb-3">
            <p className="text-sm">{endText(record)}</p>
            <ul className="flex flex-col gap-0.5 text-sm text-fg-muted">
              {view.players.map((id) => (
                <li key={id} data-lost={id}>
                  {nick(id)}: <span className="font-mono tabular-nums">+{record.gain[id]}</span>, <span className="font-mono tabular-nums">-{record.lost[id]}</span>
                </li>
              ))}
            </ul>
            {record.discarded > 0 && <p className="text-sm text-fg-muted">Przepadło na szlaku: {record.discarded}.</p>}
            <Trail cards={record.trail} />
          </div>
        </details>
      ))}
    </>
  );
}

function AfterExpedition({ view, me, nick, players, waitingFor, onMove, places, color, header }: Props & { nick: (id: string) => string; color: string; header: ReactNode }) {
  const record = view.history[view.history.length - 1];
  return (
    <div className="flex flex-1 flex-col gap-3">
      {header}
      {view.phase === "over" ? <Final view={view} nick={nick} players={players} places={places} /> : record && <Reveal view={view} record={record} nick={nick} players={players} />}
      <NextBar view={view} me={me} waitingFor={waitingFor} color={color} nick={nick} onMove={onMove} />
    </div>
  );
}

export function WyprawaBoard({ view, me, players, waitingFor, onMove, places, draft, onDraft }: Props & { draft: Draft; onDraft: (draft: Draft) => void }) {
  // Zastane po wejściu albo odświeżeniu leży od razu; animuje się tylko to, co stało się przy graczu.
  const { isNew } = useFresh([...view.trail.map((_, i) => `card:${view.expedition}:${i}`), ...(view.last ? [`last:${view.expedition}:${view.last.reveal}`] : [])]);
  const nick = (id: string) => players.find((p) => p.id === id)?.nick ?? "?";
  const color = players.find((p) => p.id === me)?.color ?? "var(--color-fg-muted)";
  const opts = options(view, me, waitingFor);
  const header = <span className="label">Wyprawa {view.expedition + 1}/{WYPRAWA_EXPEDITIONS}</span>;
  if (view.phase !== "decision") return <AfterExpedition view={view} me={me} nick={nick} players={players} waitingFor={waitingFor} onMove={onMove} places={places} color={color} header={header} />;

  const current = view.trail[view.trail.length - 1];
  const stats = opts.seated
    ? [
        { label: "W banku", value: view.bank[me] },
        { label: "Niesiesz", value: view.carried[me] },
        { label: "Resztki szlaku", value: view.loose },
      ]
    : [
        { label: "Na szlaku", value: view.onTrail.length },
        { label: "Resztki szlaku", value: view.loose },
      ];

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        {header}
        <span className="text-sm text-fg-muted">
          Zostało kart: <span className="font-mono tabular-nums">{view.deckLeft}</span>
        </span>
      </div>
      <Stats items={stats} />
      {current && <CurrentCard card={current} view={view} fresh={isNew(`card:${view.expedition}:${view.trail.length - 1}`)} />}
      <Hazards view={view} />
      <LastResolution view={view} me={me} nick={nick} fresh={!!view.last && isNew(`last:${view.expedition}:${view.last.reveal}`)} />
      <Roster view={view} me={me} players={players} />
      <TrailDetails view={view} />
      {opts.camp && <p className="text-sm">Jesteś w obozie. Czekasz na koniec wyprawy.</p>}
      {!opts.seated && <p className="text-sm text-fg-muted">Oglądasz wyprawę.</p>}
      <DecisionControls view={view} me={me} waitingFor={waitingFor} color={color} draft={draft} onDraft={onDraft} onMove={onMove} />
    </div>
  );
}

export function Wyprawa(props: Props) {
  const key = decisionKey(props.view);
  const [stored, setStored] = useState<Stored>({ key, draft: {} });
  return <WyprawaBoard {...props} draft={currentDraft(stored, props.view)} onDraft={(draft) => setStored({ key, draft })} />;
}

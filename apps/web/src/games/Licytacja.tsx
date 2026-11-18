import { ArrowDown, ArrowUp, Check, Gift } from "@phosphor-icons/react";
import { initials, LICYTACJA_HAND, LICYTACJA_ROUNDS, type LicytacjaMove, type LicytacjaRound, type LicytacjaView, type LobbyPlayer } from "@kwadrans/games";
import { useState } from "react";
import { StickyBar, useFresh } from "../screens/ui.tsx";

interface Props {
  view: LicytacjaView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: LicytacjaMove) => void;
  /** Miejsca po partii z serwera (remisy); bez nich ekran ich nie zgaduje. */
  places?: Record<string, number> | null;
}

/** Lokalny szkic: wybrana karta; serwer nic o niej nie wie, dopóki gracz nie dotknie „Gotowe”. */
export type Draft = { card?: number };
export type Stored = { key: string; draft: Draft };

const CARDS = Array.from({ length: LICYTACJA_HAND }, (_, i) => i + 1);

/** „+7”, „−4” (typograficzny minus), „0”. */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

const total = (pot: number[]) => pot.reduce((a, b) => a + b, 0);

/** Kierunek z najnowszej nagrody w puli: dodatnia, wygrywa najwyższa karta; ujemna, najniższa. */
export const upward = (pot: number[]) => (pot.at(-1) ?? 0) > 0;

/** Klucz szkicu: nonce, runda i faza, więc nowa runda i rewanż kasują wybór, a cudza gotowość nie. */
export const draftKey = (view: LicytacjaView) => `${view.nonce}:${view.round}:${view.phase}`;

export const currentDraft = (stored: Stored, view: LicytacjaView): Draft => (stored.key === draftKey(view) ? stored.draft : {});

/** Ruchy z pól widoku; o legalności decyduje serwer. `play` jest tylko po wyborze karty z ręki. */
export function moves(view: LicytacjaView, me: string, draft: Draft) {
  const stamp = { nonce: view.nonce, round: view.round };
  const card = draft.card !== undefined && view.hands[me]?.includes(draft.card) ? draft.card : null;
  return {
    play: card !== null ? ({ type: "play", card, ...stamp } satisfies LicytacjaMove) : null,
    next: { type: "next", ...stamp } satisfies LicytacjaMove,
  };
}

/** Co ekran proponuje temu graczowi w tej rundzie. */
export function options(view: LicytacjaView, me: string, waitingFor: string[]) {
  const seated = view.players.includes(me);
  const choosing = seated && view.phase === "choose";
  return { seated, active: choosing && view.myCard === null && waitingFor.includes(me), confirmed: choosing ? view.myCard : null };
}

/** Jedno zdanie o wyniku rundy. */
export function verdict(record: LicytacjaRound, nick: (id: string) => string, last: boolean) {
  if (record.winner !== null) return `${nick(record.winner)} bierze ${signed(record.value)}.`;
  return last ? `Nikt nie bierze, pula ${signed(record.value)} przepada.` : `Nikt nie bierze, pula ${signed(record.value)} przechodzi dalej.`;
}

function Dot({ id, label, players, ready = false }: { id: string; label: string; players: LobbyPlayer[]; ready?: boolean }) {
  return (
    <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-bg" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true">
      {label}
      {ready && (
        <span className="absolute -right-1 -bottom-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-fg text-bg">
          <Check size={9} weight="bold" />
        </span>
      )}
    </span>
  );
}

/** „Runda n/15” i liczba nagród w talii; same nagrody są w zwijanej sekcji pod graczami. */
function Header({ view }: { view: LicytacjaView }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="label">Runda {Math.min(view.round, LICYTACJA_ROUNDS)}/{LICYTACJA_ROUNDS}</span>
      {view.prizesLeft.length > 0 && (
        <span className="text-sm text-fg-muted">
          W talii: <span className="font-mono tabular-nums">{view.prizesLeft.length}</span>
        </span>
      )}
    </div>
  );
}

/** Nieodkryte nagrody jako małe żetony, ujemne w kolorze ostrzeżenia. */
function PrizesLeft({ prizes }: { prizes: number[] }) {
  return (
    <p className="flex flex-wrap items-center gap-1 text-xs">
      {prizes.map((prize, i) => (
        <span key={i} data-left={prize} className={`rounded-[6px] border px-1 font-mono tabular-nums ${prize < 0 ? "border-warning/50 text-warning" : "border-line"}`}>
          {signed(prize)}
        </span>
      ))}
    </p>
  );
}

/** Nagroda tej rundy; przy przeniesionej puli rozpisana suma i kierunek z najnowszej. */
function Prize({ view, fresh }: { view: LicytacjaView; fresh: boolean }) {
  const pot = view.pot;
  const newest = pot.at(-1) ?? 0;
  const up = upward(pot);
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <div className={`tile flex items-center gap-3 px-3 py-2.5 ${fresh ? "animate-[card-in_0.35s_ease-out]" : ""}`}>
      <div className={`grid h-16 w-14 shrink-0 place-items-center rounded-inset border-2 ${newest < 0 ? "border-warning text-warning" : "border-fg"}`}>
        <span className="font-mono text-2xl font-semibold tabular-nums">{signed(newest)}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5 label">
          <Gift size={14} aria-hidden="true" />
          {pot.length > 1 ? "Pula" : "Nagroda"}
          <span className="ml-auto">Runda {view.round}/{LICYTACJA_ROUNDS}</span>
        </span>
        {pot.length > 1 && (
          <span className="font-mono text-sm tabular-nums" data-pot={total(pot)}>
            {pot.map(signed).join(" ")} = <span className="font-semibold">{signed(total(pot))}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-sm">
          <Arrow size={14} weight="bold" aria-hidden="true" />
          {up ? "Bierze najwyższa karta bez pary" : "Bierze najniższa karta bez pary"}
        </span>
        {view.prizesLeft.length > 0 && (
          <span className="text-xs text-fg-muted">
            W talii: <span className="font-mono tabular-nums">{view.prizesLeft.length}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Gracze z punktami; w wyborze znak gotowości (nigdy wybrana karta). */
function Roster({ view, me, players }: { view: LicytacjaView; me: string; players: LobbyPlayer[] }) {
  const labels = initials(view.players.map((id) => players.find((p) => p.id === id)?.nick ?? "?"));
  // Przy 5-6 osobach jeden rząd: kropka z inicjałem i punkty; nicki są w kropkach nagłówka, a czytnik dostaje je tekstem.
  if (view.players.length > 4) {
    return (
      <ul className="grid grid-cols-6 gap-1">
        {view.players.map((id, i) => {
          const ready = view.phase === "choose" && view.ready.includes(id);
          return (
            <li key={id} data-player={id} className={`flex flex-col items-center gap-0.5 rounded-inset border py-1 ${id === me ? "border-fg-muted" : "border-line"}`}>
              <Dot id={id} label={labels[i]} players={players} ready={ready} />
              <span className="font-mono text-xs font-semibold tabular-nums">{signed(view.score[id])}</span>
              <span className="sr-only">
                {players.find((p) => p.id === id)?.nick ?? "?"}
                {id === me ? " (ty)" : ""}
                {ready ? ", gotowe" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-1.5">
      {view.players.map((id, i) => {
        const ready = view.phase === "choose" && view.ready.includes(id);
        return (
          <li key={id} data-player={id} className={`flex min-h-10 items-center gap-1.5 rounded-inset border px-2 ${id === me ? "border-fg-muted" : "border-line"}`}>
            <Dot id={id} label={labels[i]} players={players} ready={ready} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {players.find((p) => p.id === id)?.nick ?? "?"}
              {id === me && <span className="text-fg-muted"> (ty)</span>}
            </span>
            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">{signed(view.score[id])}</span>
            {ready && <span className="sr-only">gotowe</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Nagrody w talii i karty, które zostały rywalom (jawne, bo zagrane karty wszyscy widzieli). */
function RivalHands({ view, me, nick }: { view: LicytacjaView; me: string; nick: (id: string) => string }) {
  const rivals = view.players.filter((id) => id !== me);
  return (
    <details className="rounded-inset border border-line px-3">
      <summary className="flex min-h-12 cursor-pointer items-center text-sm">Talia i karty rywali</summary>
      {view.prizesLeft.length > 0 && <PrizesLeft prizes={view.prizesLeft} />}
      <ul className="flex flex-col gap-1 pt-2 pb-3 text-sm">
        {rivals.map((id) => (
          <li key={id} data-hand={id} className="flex gap-2">
            <span className="w-20 shrink-0 truncate text-fg-muted">{nick(id)}</span>
            <span className="font-mono text-xs leading-5 tabular-nums">{view.hands[id].join(" ")}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

interface HandProps {
  view: LicytacjaView;
  me: string;
  waitingFor: string[];
  color: string;
  draft: Draft;
  onDraft: (draft: Draft) => void;
  onMove: (move: LicytacjaMove) => void;
}

/** Ręka 5×3 i „Gotowe”; zagrane karty zostają na miejscu, wygaszone. Bez hooków, żeby dało się ją sprawdzić bez DOM. */
export function HandControls({ view, me, waitingFor, color, draft, onDraft, onMove }: HandProps) {
  const { active, confirmed } = options(view, me, waitingFor);
  const hand = view.hands[me] ?? [];
  const picked = confirmed ?? moves(view, me, draft).play?.card ?? null;
  const send = moves(view, me, draft).play;
  return (
    <StickyBar className="mt-auto">
      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Twoja ręka">
          {CARDS.map((card) => {
            const has = hand.includes(card);
            const on = picked === card;
            return (
              <button
                key={card}
                type="button"
                data-card={card}
                className={`flex min-h-12 items-center justify-center rounded-inset border-2 font-mono text-lg font-semibold tabular-nums transition-colors duration-100 ${has ? "" : "border-dashed border-line text-fg-subtle opacity-40"}`}
                style={on ? { borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)` } : has ? { borderColor: "var(--color-line)" } : undefined}
                aria-pressed={on}
                aria-label={has ? `Karta ${card}` : `Karta ${card}, zagrana`}
                disabled={!has || !active}
                onClick={() => onDraft({ card })}
              >
                {on ? (
                  <span className="flex items-center gap-0.5">
                    <Check size={14} weight="bold" aria-hidden="true" />
                    {card}
                  </span>
                ) : (
                  card
                )}
              </button>
            );
          })}
        </div>
        {confirmed !== null ? (
          <p className="flex min-h-12 w-full items-center justify-center gap-1.5 text-sm font-medium">
            <Check size={16} weight="bold" aria-hidden="true" />
            Zatwierdzone: <span className="font-mono tabular-nums">{confirmed}</span>. Czekasz na pozostałych.
          </p>
        ) : (
          active && (
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!send} onClick={() => send && onMove(send)}>
              {send ? `Gotowe · ${send.card}` : "Gotowe"}
            </button>
          )
        )}
      </div>
    </StickyBar>
  );
}

/** Odsłona rundy: karty wszystkich od najwyższej, zniesione przekreślone, zwycięzca w swoim kolorze. */
function RoundReveal({ record, players, nick, me, fresh, last }: { record: LicytacjaRound; players: LobbyPlayer[]; nick: (id: string) => string; me: string; fresh: boolean; last: boolean }) {
  const rows = Object.entries(record.plays).sort((a, b) => b[1] - a[1]);
  const color = (id: string) => players.find((p) => p.id === id)?.color;
  return (
    <div className={`tile flex flex-col gap-2 p-3 ${fresh ? "animate-[card-in_0.35s_ease-out]" : ""}`}>
      <span className="label">
        Runda {record.round}: pula <span className="font-mono tabular-nums">{signed(record.value)}</span>
      </span>
      <ul className="flex flex-col gap-1">
        {rows.map(([id, card]) => {
          const won = record.winner === id;
          const cancelled = record.cancelled.includes(card);
          return (
            <li key={id} data-play={id} className="relative flex min-h-9 items-center gap-2 rounded-[8px] border px-2" style={{ borderColor: won ? color(id) : "var(--color-line)", backgroundColor: won ? `color-mix(in srgb, ${color(id)} 16%, transparent)` : undefined }}>
              <span className={`w-7 text-right font-mono text-lg font-semibold tabular-nums ${cancelled ? "text-fg-subtle line-through" : ""}`}>{card}</span>
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color(id) }} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {nick(id)}
                {id === me && <span className="text-fg-muted"> (ty)</span>}
              </span>
              {cancelled && <span className="text-xs text-fg-muted">znosi się</span>}
              {won && (
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {signed(record.value)}
                  {fresh && (
                    <span className="pointer-events-none absolute -top-2 right-2 animate-[float-up_1.6s_ease-out_forwards] font-mono font-semibold tabular-nums" aria-hidden="true">
                      {signed(record.value)}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-sm" data-verdict>{verdict(record, nick, last)}</p>
    </div>
  );
}

/** „Dalej” albo informacja, na kogo czekamy; widz nie ma nic. Bez hooków, żeby dało się go sprawdzić bez DOM. */
export function NextBar({ view, me, waitingFor, color, nick, onMove }: { view: LicytacjaView; me: string; waitingFor: string[]; color: string; nick: (id: string) => string; onMove: (move: LicytacjaMove) => void }) {
  if (view.phase !== "reveal" || !view.players.includes(me) || waitingFor.length === 0) return null;
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
      <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} onClick={() => onMove(moves(view, me, {}).next)}>
        Dalej
      </button>
    </StickyBar>
  );
}

/** Koniec: punkty z miejscami, ostatnia runda i przebieg wszystkich rund do rozwinięcia. */
function Final({ view, players, nick, me, places }: { view: LicytacjaView; players: LobbyPlayer[]; nick: (id: string) => string; me: string; places?: Props["places"] }) {
  const rows = [...view.players].sort((a, b) => view.score[b] - view.score[a]);
  const last = view.history.at(-1);
  return (
    <>
      <ul className="tile flex flex-col gap-1 p-3">
        {rows.map((id) => (
          <li key={id} data-player={id} className="flex min-h-8 items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">
              {places ? `${places[id]}. ` : ""}
              {nick(id)}
              {id === me && <span className="text-fg-muted"> (ty)</span>}
            </span>
            <span className="font-mono font-semibold tabular-nums">{signed(view.score[id])}</span>
          </li>
        ))}
      </ul>
      {last && <RoundReveal record={last} players={players} nick={nick} me={me} fresh={false} last />}
      <details className="rounded-inset border border-line px-3">
        <summary className="flex min-h-12 cursor-pointer items-center text-sm">Przebieg rund</summary>
        <ol className="flex flex-col gap-1 pb-3 text-sm">
          {view.history.map((record) => (
            <li key={record.round} data-round={record.round} className="flex flex-wrap items-baseline gap-x-2">
              <span className="w-6 text-right font-mono tabular-nums text-fg-muted">{record.round}.</span>
              <span className="w-8 font-mono tabular-nums">{signed(record.pot.at(-1) ?? 0)}</span>
              <span className="min-w-0 flex-1">{record.winner !== null ? `${nick(record.winner)} (${record.plays[record.winner]})` : "bez zwycięzcy"}</span>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}

export function LicytacjaBoard({ view, me, players, waitingFor, onMove, places, draft, onDraft }: Props & { draft: Draft; onDraft: (draft: Draft) => void }) {
  // Zastane po wejściu albo odświeżeniu leży od razu; animuje się tylko to, co stało się przy graczu.
  const { isNew } = useFresh([`prize:${view.nonce}:${view.round}`, ...view.history.map((r) => `round:${view.nonce}:${r.round}`)]);
  const nick = (id: string) => players.find((p) => p.id === id)?.nick ?? "?";
  const color = players.find((p) => p.id === me)?.color ?? "var(--color-fg-muted)";
  const { seated } = options(view, me, waitingFor);
  const record = view.history.at(-1);

  if (view.phase === "over") {
    return (
      <div className="flex flex-1 flex-col gap-3">
        <Header view={view} />
        <Final view={view} players={players} nick={nick} me={me} places={places} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {!seated && <p className="text-sm text-fg-muted">Oglądasz licytację.</p>}
      {view.phase === "reveal" && record ? (
        <RoundReveal record={record} players={players} nick={nick} me={me} fresh={isNew(`round:${view.nonce}:${record.round}`)} last={false} />
      ) : (
        <Prize view={view} fresh={isNew(`prize:${view.nonce}:${view.round}`)} />
      )}
      <Roster view={view} me={me} players={players} />
      <RivalHands view={view} me={me} nick={nick} />
      {view.phase === "choose" && seated && <HandControls view={view} me={me} waitingFor={waitingFor} color={color} draft={draft} onDraft={onDraft} onMove={onMove} />}
      <NextBar view={view} me={me} waitingFor={waitingFor} color={color} nick={nick} onMove={onMove} />
    </div>
  );
}

export function Licytacja(props: Props) {
  const key = draftKey(props.view);
  const [stored, setStored] = useState<Stored>({ key, draft: {} });
  return <LicytacjaBoard {...props} draft={currentDraft(stored, props.view)} onDraft={(draft) => setStored({ key, draft })} />;
}

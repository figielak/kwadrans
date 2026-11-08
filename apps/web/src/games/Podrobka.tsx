import { Check, MaskHappy } from "@phosphor-icons/react";
import { type LobbyPlayer, PODROBKA_ANSWER_MAX, PODROBKA_ROUNDS, type PodrobkaMove, type PodrobkaView } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { StickyBar, useFresh } from "../screens/ui.tsx";

interface Props {
  view: PodrobkaView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: PodrobkaMove) => void;
  /** Miejsca po partii z serwera (remisy); bez nich ekran liczy je z sum punktów. */
  places?: Record<string, number> | null;
}

type Round = PodrobkaView["history"][number];

/** Szkic idzie na serwer w tle co najwyżej raz na tyle; przepaść mogą najwyżej ostatnie pół sekundy pisania. */
export const DRAFT_MS = 500;

/** Lokalny stan przed zatwierdzeniem: tekst odpowiedzi i wybrany podejrzany. Serwer nic o wyborze nie wie, dopóki nie padnie „Gotowe”. */
export type Draft = { text?: string; pick?: string };
export type Stored = { key: string; draft: Draft };

/** Klucz stanu lokalnego: nonce, runda i faza, więc nowa runda, faza i rewanż go kasują, a cudze zatwierdzenie nie. */
export const draftKey = (view: PodrobkaView) => `${view.nonce}:${view.round}:${view.phase}`;

export const currentDraft = (stored: Stored, view: PodrobkaView): Draft => (stored.key === draftKey(view) ? stored.draft : {});

const stampOf = (view: PodrobkaView) => ({ nonce: view.nonce, round: view.round });

/** Szkic odpowiedzi ze stemplem z widoku; o legalności decyduje serwer. */
export const draftMove = (view: PodrobkaView, text: string): PodrobkaMove => ({ type: "write", ...stampOf(view), answer: text, done: false });

/** Ruchy z pól widoku. Odpowiedź idzie surowa (normalizuje serwer), ale pusta po normalizacji nie jest wysyłana. */
export function moves(view: PodrobkaView, draft: Draft, me?: string) {
  const text = draft.text ?? view.myDraft ?? "";
  const pick = draft.pick && view.players.includes(draft.pick) && draft.pick !== me ? draft.pick : null;
  return {
    done: text.trim() === "" ? null : ({ type: "write", ...stampOf(view), answer: text, done: true } satisfies PodrobkaMove),
    vote: pick ? ({ type: "vote", ...stampOf(view), target: pick } satisfies PodrobkaMove) : null,
    next: { type: "next", ...stampOf(view) } satisfies PodrobkaMove,
  };
}

/** Co ekran proponuje temu graczowi w tej fazie. */
export function options(view: PodrobkaView, me: string, waitingFor: string[]) {
  const seated = view.players.includes(me);
  const write = seated && view.phase === "write";
  const vote = seated && view.phase === "vote";
  return {
    seated,
    writing: write && waitingFor.includes(me) && !view.done.includes(me),
    written: write && (view.done.includes(me) || !waitingFor.includes(me)),
    voting: vote && waitingFor.includes(me) && !view.voted.includes(me),
    voted: vote && view.voted.includes(me),
  };
}

/**
 * Wysyłka szkicu z opóźnieniem. Bez Reacta, żeby dało się ją sprawdzić na sztucznym zegarze.
 * Zmiana klucza (nowa runda, faza, rewanż) kasuje zaległy szkic bez wysyłki, a „Gotowe” wysyła od razu i zaległy anuluje.
 */
export class DraftSender {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private key = "";
  private readonly send: (move: PodrobkaMove) => void;
  private readonly delay: number;

  constructor(send: (move: PodrobkaMove) => void, delay = DRAFT_MS) {
    this.send = send;
    this.delay = delay;
  }

  follow(key: string) {
    if (key === this.key) return;
    this.key = key;
    this.cancel();
  }

  change(move: PodrobkaMove) {
    this.cancel();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.send(move);
    }, this.delay);
  }

  now(move: PodrobkaMove) {
    this.cancel();
    this.send(move);
  }

  cancel() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}

interface SectionProps {
  view: PodrobkaView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  color: string;
  draft: Draft;
  onDraft: (draft: Draft) => void;
  onMove: (move: PodrobkaMove) => void;
}

/** Pole odpowiedzi z „Gotowe”. Bez hooków, żeby dało się go sprawdzić bez DOM; tekst i szkic trzyma `Podrobka`. */
export function WriteForm({ view, color, draft, onText, onMove }: Pick<SectionProps, "view" | "color" | "draft" | "onMove"> & { onText: (text: string) => void }) {
  const value = draft.text ?? view.myDraft ?? "";
  const send = moves(view, draft).done;
  return (
    <form
      className="flex flex-1 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (send) onMove(send);
      }}
    >
      <p className="text-sm">Odpowiedz na swoje pytanie. Jedna osoba dostała inne.</p>
      <div className="tile flex flex-col gap-2 p-4">
        <span className="label">Twoje pytanie</span>
        <p className="text-lg font-semibold wrap-anywhere">{view.myQuestion}</p>
        <p className="text-sm text-fg-muted">Format odpowiedzi: {view.hint}</p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="podrobka-answer" className="text-sm leading-none font-medium text-fg">
          Twoja odpowiedź
        </label>
        <input
          id="podrobka-answer"
          className="field"
          value={value}
          maxLength={PODROBKA_ANSWER_MAX}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          onChange={(e) => onText(e.target.value)}
        />
        <span className="self-end font-mono text-sm text-fg-muted tabular-nums">
          {value.length}/{PODROBKA_ANSWER_MAX}
        </span>
      </div>
      <StickyBar className="mt-auto">
        <div className="flex w-full flex-col gap-2">
          <p className="text-xs text-fg-muted">Po czasie liczy się ostatni zapisany tekst.</p>
          <button type="submit" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!send}>
            Gotowe
          </button>
        </div>
      </StickyBar>
    </form>
  );
}

/** Zatwierdzona odpowiedź: własne pytanie i tekst tylko do odczytu. */
function Written({ view }: { view: PodrobkaView }) {
  return (
    <>
      <div className="tile flex flex-col gap-2 p-4">
        <span className="label">Twoje pytanie</span>
        <p className="text-lg font-semibold wrap-anywhere">{view.myQuestion}</p>
        <p className="text-sm text-fg-muted">Format odpowiedzi: {view.hint}</p>
      </div>
      <div className="tile flex flex-col gap-1 p-4">
        <span className="label">Twoja odpowiedź</span>
        <p className="flex items-center gap-1.5 wrap-anywhere">
          <Check size={16} weight="bold" className="shrink-0" aria-hidden="true" />
          {view.myDraft}
        </p>
      </div>
    </>
  );
}

/** Pytanie większości, odpowiedzi z nickami i tajny głos. Bez hooków, wybór trzyma `Podrobka`. */
export function VoteSection({ view, me, players, waitingFor, color, draft, onDraft, onMove }: SectionProps) {
  const opts = options(view, me, waitingFor);
  const nick = (id: string) => players.find((p) => p.id === id)?.nick ?? "?";
  const locked = opts.voted;
  const chosen = locked ? view.myVote : (moves(view, draft, me).vote?.target ?? null);
  const send = moves(view, draft, me).vote;
  return (
    <>
      <div className="tile flex flex-col gap-1 p-4">
        <span className="label">Pytanie większości</span>
        <p className="text-lg font-semibold wrap-anywhere">{view.majorityQuestion}</p>
      </div>
      <p className="text-sm text-fg-muted">W rozmowie broń odpowiedzi, nie cytuj swojego pytania.</p>
      <ul className="flex flex-col gap-2">
        {view.players.map((id) => {
          const own = id === me;
          const picked = chosen === id;
          const content = (
            <>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
                <span className="min-w-0 text-sm font-medium wrap-anywhere">
                  {nick(id)}
                  {own && " (ty)"}
                </span>
                {picked && <Check size={16} weight="bold" className="ml-auto shrink-0" aria-hidden="true" />}
              </span>
              <span className="wrap-anywhere">{view.answers?.[id]}</span>
              {own && opts.seated && <span className="text-xs text-fg-muted">Nie można głosować na siebie.</span>}
            </>
          );
          return (
            <li key={id} data-player={id}>
              {opts.seated ? (
                <button
                  type="button"
                  data-vote={id}
                  className="flex min-h-12 w-full flex-col gap-1 rounded-[10px] border px-3 py-2 text-left"
                  style={{ borderColor: picked ? color : "var(--color-line)" }}
                  aria-pressed={picked}
                  disabled={own || !opts.voting}
                  onClick={() => onDraft({ ...draft, pick: id })}
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-h-12 w-full flex-col gap-1 rounded-[10px] border border-line px-3 py-2">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
      {opts.seated && view.myQuestion && (
        <details className="rounded-[10px] border border-line px-3">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm">Twoje pytanie</summary>
          <p className="pb-3 text-sm wrap-anywhere">{view.myQuestion}</p>
        </details>
      )}
      {opts.voting && (
        <StickyBar className="mt-auto">
          <div className="flex w-full flex-col gap-2">
            <p className="text-xs text-fg-muted">Bez Gotowe po czasie nie ma głosu.</p>
            <button type="button" className="btn btn-player w-full" style={{ backgroundColor: color }} disabled={!send} onClick={() => send && onMove(send)}>
              Gotowe
            </button>
          </div>
        </StickyBar>
      )}
      {locked && (
        <StickyBar className="mt-auto">
          <p className="flex min-h-12 w-full items-center justify-center gap-1.5 text-sm font-medium">
            <Check size={16} weight="bold" aria-hidden="true" />
            {view.myVote ? `Zatwierdzone: głos na ${nick(view.myVote)}` : "Bez głosu: wstrzymano"}
          </p>
        </StickyBar>
      )}
    </>
  );
}

/** „1 głos”, „2 głosy”, „5 głosów” (12-14 jak 5). */
export function votesText(count: number) {
  if (count === 1) return "1 głos";
  const tens = count % 100;
  return count % 10 >= 2 && count % 10 <= 4 && (tens < 12 || tens > 14) ? `${count} głosy` : `${count} głosów`;
}

/** Uzasadnienie wyniku rundy, wyłącznie z zapisu rundy: wykrycie, remis, niewinny lider, za mało głosów, wstrzymania, anulowanie. */
export function verdict(record: Round, nick: (id: string) => string) {
  if (record.cancelled) return `Brak odpowiedzi: ${record.missing.map(nick).join(", ")}. Runda anulowana, bez głosowania i punktów.`;
  const ids = Object.keys(record.tally);
  const top = Math.max(0, ...ids.map((id) => record.tally[id]));
  const leaders = ids.filter((id) => record.tally[id] === top);
  const who = nick(record.impostor);
  const abstained = ids.filter((id) => record.votes[id] === null);
  if (top === 0) return "Wszyscy wstrzymali głos: nikt nie dostaje punktów.";
  let main: string;
  if (record.detected) main = `Podróbka wykryta: ${who}, ${votesText(top)}, najwięcej i co najmniej 2.`;
  else if (top === 1) main = `Za mało głosów: najwięcej było 1, a do wykrycia trzeba co najmniej 2. Podróbka uciekła: ${who}.`;
  else if (leaders.length > 1) main = `Remis na prowadzeniu (${votesText(top)}): bez dogrywki, Podróbka uciekła: ${who}.`;
  else main = `Najwięcej głosów (${votesText(top)}): ${nick(leaders[0])}, ale to nie Podróbka. Podróbka uciekła: ${who}.`;
  return abstained.length > 0 ? `${main} Wstrzymali się: ${abstained.map(nick).join(", ")}.` : main;
}

/**
 * Odsłona jednej rundy: oba pytania, kto miał inne, uzasadnienie i wiersz na gracza z odpowiedzią, głosem i punktami.
 * `totals` dodaje sumy (tylko ostatnia odsłona, bo widok niesie sumy po niej); `fresh` włącza animacje nowego stanu.
 */
export function RoundReveal({ view, record, me, nick, players, fresh, totals }: { view: PodrobkaView; record: Round; me: string; nick: (id: string) => string; players: LobbyPlayer[]; fresh: boolean; totals: boolean }) {
  return (
    <>
      <div className={`tile flex flex-col gap-3 p-4 ${fresh ? "animate-[card-in_0.35s_ease-out]" : ""}`}>
        <div className="flex flex-col gap-1">
          <span className="label">Pytanie większości</span>
          <p className="text-lg font-semibold wrap-anywhere">{record.majorityQuestion}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="label">Pytanie Podróbki ({nick(record.impostor)})</span>
          <p className="text-lg font-semibold wrap-anywhere">{record.otherQuestion}</p>
        </div>
      </div>
      <p className="text-sm">{verdict(record, nick)}</p>
      <ul className="flex flex-col gap-2">
        {view.players.map((id) => {
          const vote = record.votes[id];
          const gain = record.gain[id];
          return (
            <li key={id} data-player={id} className="relative flex flex-col gap-1 rounded-[10px] border border-line px-3 py-2">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
                <span className="min-w-0 text-sm font-medium wrap-anywhere">
                  {nick(id)}
                  {id === me && " (ty)"}
                </span>
                {id === record.impostor && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold">
                    <MaskHappy size={14} aria-hidden="true" />
                    Podróbka
                  </span>
                )}
                <span className="ml-auto font-mono font-semibold tabular-nums">+{gain}</span>
              </span>
              {fresh && id === me && gain > 0 && (
                <span className="pointer-events-none absolute -top-2 right-3 animate-[float-up_1.6s_ease-out_forwards] font-mono font-semibold tabular-nums" aria-hidden="true">
                  +{gain}
                </span>
              )}
              <span className="wrap-anywhere">{record.answers[id] || "Brak odpowiedzi"}</span>
              {!record.cancelled && <span className="text-xs text-fg-muted">{vote ? `Głos: ${nick(vote)}` : "Wstrzymanie"}</span>}
              {totals && (
                <span className="text-xs text-fg-muted">
                  suma <span className="font-mono tabular-nums">{view.totals[id]}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** „Dalej” albo informacja, na kogo czekamy; widz nie ma nic. Bez hooków, żeby dało się go sprawdzić bez DOM. */
export function NextBar({ view, me, waitingFor, color, nick, onMove }: { view: PodrobkaView; me: string; waitingFor: string[]; color: string; nick: (id: string) => string; onMove: (move: PodrobkaMove) => void }) {
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

/** Miejsca z wyniku serwera albo, gdy ich nie ma, z sum: 1 + liczba graczy z lepszym wynikiem (remis to to samo miejsce). */
const placesOf = (view: PodrobkaView, places?: Props["places"]) =>
  Object.fromEntries(view.players.map((id) => [id, places?.[id] ?? 1 + view.players.filter((q) => view.totals[q] > view.totals[id]).length]));

/** Koniec: ranking z tabelą punktów rund, ostatnia odsłona i wcześniejsze do rozwinięcia. Rozstrzyga serwer, ekran nic nie zgaduje. */
function Final({ view, me, nick, players, places, fresh }: { view: PodrobkaView; me: string; nick: (id: string) => string; players: LobbyPlayer[]; places?: Props["places"]; fresh: boolean }) {
  const place = placesOf(view, places);
  const rows = [...view.players].sort((a, b) => place[a] - place[b]);
  const last = view.history[view.history.length - 1];
  const earlier = view.history.slice(0, -1);
  return (
    <>
      <div className="tile p-3">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="label">
              <th className="text-left font-normal">Gracz</th>
              {view.history.map((_, i) => (
                <th key={i} className="w-6 text-right font-normal" aria-label={`Runda ${i + 1}`}>
                  {i + 1}
                </th>
              ))}
              <th className="w-10 text-right font-normal">Suma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((id) => (
              <tr key={id} data-player={id}>
                <td className="py-1 pr-2 wrap-anywhere">
                  <span className="mr-1.5 inline-block size-2.5 rounded-full align-middle" style={{ backgroundColor: players.find((p) => p.id === id)?.color }} aria-hidden="true" />
                  {place[id]}. {nick(id)}
                  {id === me && " (ty)"}
                </td>
                {view.history.map((record, i) => (
                  <td key={i} data-round={i + 1} className="py-1 text-right font-mono text-xs tabular-nums text-fg-muted">
                    {record.cancelled ? <span role="img" aria-label={`Runda ${i + 1} anulowana`}>×</span> : record.gain[id]}
                  </td>
                ))}
                <td className="py-1 text-right font-mono font-semibold tabular-nums">{view.totals[id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {view.history.some((record) => record.cancelled) && <p className="pt-2 text-xs text-fg-muted">× runda anulowana</p>}
      </div>
      {last && (
        <>
          <span className="label">Runda {view.history.length}: ostatnia</span>
          <RoundReveal view={view} record={last} me={me} nick={nick} players={players} fresh={fresh} totals />
        </>
      )}
      {earlier.map((record, i) => (
        <details key={i} className="rounded-[10px] border border-line px-3">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm">Runda {i + 1}</summary>
          <div className="flex flex-col gap-3 pb-3">
            <RoundReveal view={view} record={record} me={me} nick={nick} players={players} fresh={false} totals={false} />
          </div>
        </details>
      ))}
    </>
  );
}

export function PodrobkaBoard({ view, me, players, waitingFor, onMove, places, draft, onDraft, onText }: Props & { draft: Draft; onDraft: (draft: Draft) => void; onText: (text: string) => void }) {
  const opts = options(view, me, waitingFor);
  const color = players.find((p) => p.id === me)?.color ?? "var(--color-fg-muted)";
  const nick = (id: string) => players.find((p) => p.id === id)?.nick ?? "?";
  // Zastany stan leży od razu; animuje się tylko odsłona, która pojawiła się przy graczu.
  const { isNew } = useFresh(view.history.map((record) => `reveal:${record.round}`));
  const last = view.history[view.history.length - 1];
  const fresh = !!last && isNew(`reveal:${last.round}`);
  return (
    <div className="flex flex-1 flex-col gap-3">
      <span className="label">
        Runda {view.round + 1}/{PODROBKA_ROUNDS}
      </span>
      {view.phase === "write" && opts.writing && <WriteForm view={view} color={color} draft={draft} onText={onText} onMove={onMove} />}
      {view.phase === "write" && opts.written && <Written view={view} />}
      {view.phase === "write" && !opts.seated && (
        <>
          <p className="text-sm text-fg-muted">Oglądasz rundę. Gracze odpowiadają na swoje pytania.</p>
          <p className="text-sm">
            Odpowiedzi: <span className="font-mono tabular-nums">{view.done.length}</span>/<span className="font-mono tabular-nums">{view.players.length}</span>
          </p>
        </>
      )}
      {view.phase === "vote" && <VoteSection view={view} me={me} players={players} waitingFor={waitingFor} color={color} draft={draft} onDraft={onDraft} onMove={onMove} />}
      {view.phase === "summary" && last && (
        <>
          <RoundReveal view={view} record={last} me={me} nick={nick} players={players} fresh={fresh} totals />
          <NextBar view={view} me={me} waitingFor={waitingFor} color={color} nick={nick} onMove={onMove} />
        </>
      )}
      {view.phase === "over" && <Final view={view} me={me} nick={nick} players={players} places={places} fresh={fresh} />}
    </div>
  );
}

export function Podrobka(props: Props) {
  const key = draftKey(props.view);
  const [stored, setStored] = useState<Stored>({ key, draft: {} });
  const latest = useRef(props.onMove);
  useEffect(() => {
    latest.current = props.onMove;
  });
  const [sender] = useState(() => new DraftSender((move) => latest.current(move)));
  useEffect(() => {
    sender.follow(key);
    return () => sender.cancel();
  }, [key, sender]);

  const draft = currentDraft(stored, props.view);
  const setDraft = (next: Draft) => setStored({ key, draft: next });
  return (
    <PodrobkaBoard
      {...props}
      draft={draft}
      onDraft={setDraft}
      onText={(text) => {
        setDraft({ ...draft, text });
        sender.change(draftMove(props.view, text));
      }}
      onMove={(move) => sender.now(move)}
    />
  );
}

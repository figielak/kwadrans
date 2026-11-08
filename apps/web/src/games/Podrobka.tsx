import { Check } from "@phosphor-icons/react";
import { type LobbyPlayer, PODROBKA_ANSWER_MAX, PODROBKA_ROUNDS, type PodrobkaMove, type PodrobkaView } from "@kwadrans/games";
import { useEffect, useRef, useState } from "react";
import { StickyBar } from "../screens/ui.tsx";

interface Props {
  view: PodrobkaView;
  me: string;
  players: LobbyPlayer[];
  waitingFor: string[];
  onMove: (move: PodrobkaMove) => void;
}

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

export function PodrobkaBoard({ view, me, players, waitingFor, onMove, draft, onDraft, onText }: Props & { draft: Draft; onDraft: (draft: Draft) => void; onText: (text: string) => void }) {
  const opts = options(view, me, waitingFor);
  const color = players.find((p) => p.id === me)?.color ?? "var(--color-fg-muted)";
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
      {(view.phase === "summary" || view.phase === "over") && <p className="text-sm text-fg-muted">Odsłona rundy.</p>}
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

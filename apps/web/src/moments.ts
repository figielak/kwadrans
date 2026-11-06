import { KUBKI_ROUNDS, SLEDZENIE_ROUNDS, W_PAMIECI_ROUNDS, WIEZA_LEVELS } from "@kwadrans/games";

export type MomentData = { text: string; playerId: string };
type Nick = (id: string) => string;

/** Czy gracz przeszedł całą grę przeżycia: taki wynik to nie odpadnięcie. */
const SURVIVAL: Record<string, (result: any, view: any) => boolean> = {
  simon: (score, view) => score >= view.sequence.length,
  "w-pamieci": (r) => r.rounds >= W_PAMIECI_ROUNDS,
  sledzenie: (r) => r.rounds >= SLEDZENIE_ROUNDS,
  kubki: (score) => score >= KUBKI_ROUNDS,
  wieza: (r) => r.height >= WIEZA_LEVELS,
};

const fresh = <T,>(before: T[], after: T[]): T[] => {
  const keys = (list: T[]) => list.map((e) => JSON.stringify(e));
  const [old, now] = [keys(before), keys(after)];
  let overlap = Math.min(old.length, now.length);
  while (overlap && old.slice(-overlap).join("|") !== now.slice(0, overlap).join("|")) overlap--;
  return after.slice(overlap);
};

function memory(prev: any, next: any, me: string, nick: Nick): MomentData | null {
  const card = next.owner.findIndex((o: string | null, i: number) => o !== null && prev.owner[i] === null);
  if (card < 0) return null;
  const owner = next.owner[card];
  return { text: owner === me ? "Masz parę!" : `${nick(owner)} ma parę`, playerId: owner };
}

function statki(prev: any, next: any, me: string, nick: Nick): MomentData | null {
  const sunk = (view: any, id: string) => view.boards[id].shots.filter((s: { result: string }) => s.result === "sunk").length;
  const target = next.players.find((id: string) => sunk(next, id) > sunk(prev, id));
  if (!target) return null;
  const shooter = next.players.find((id: string) => id !== target);
  return { text: shooter === me ? "Zatapiasz statek!" : `${nick(shooter)} zatapia statek`, playerId: shooter };
}

function chinczyk(prev: any, next: any, me: string, nick: Nick): MomentData | null {
  const last = next.last;
  const captured: string[] = last?.move?.captured ?? [];
  if (!captured.length || (prev.last?.roll === last.roll && prev.last?.move)) return null;
  const names = captured.map(nick).join(", ");
  if (last.player === me) return { text: `Zbijasz: ${names}`, playerId: me };
  return { text: captured.includes(me) ? `${nick(last.player)} zbija Twój pionek` : `${nick(last.player)} zbija: ${names}`, playerId: last.player };
}

function kampus(prev: any, next: any, me: string, nick: Nick): MomentData | null {
  const set = fresh(prev.events, next.events).find((e: any) => e.type === "set") as { player: string } | undefined;
  if (!set) return null;
  return { text: set.player === me ? "Masz komplet!" : `${nick(set.player)} ma komplet`, playerId: set.player };
}

function survival(completed: (result: any, view: any) => boolean, prev: any, next: any, me: string, nick: Nick): MomentData | null {
  const players: string[] = next.players;
  if (players.length < 2) return null;
  const out = players.find((id) => !(id in prev.results) && id in next.results && !completed(next.results[id], next));
  if (!out) return null;
  if (out === me) return { text: "Odpadasz", playerId: me };
  const left = players.filter((id) => !(id in next.results));
  if (left.length === 1 && left[0] === me) return { text: "Zostałeś ostatni", playerId: me };
  return { text: `${nick(out)} odpada`, playerId: out };
}

/** Ważna chwila z porównania dwóch widoków. Bez poprzedniego (odświeżenie, reconnect) nie ma co ogłaszać; gry ciszy nie mają tu wpisu. */
export function momentFrom(gameId: string, prev: unknown, next: unknown, me: string, nick: Nick): MomentData | null {
  if (!prev) return null;
  if (gameId === "memory") return memory(prev, next, me, nick);
  if (gameId === "statki") return statki(prev, next, me, nick);
  if (gameId === "chinczyk") return chinczyk(prev, next, me, nick);
  if (gameId === "kampus-tour") return kampus(prev, next, me, nick);
  const completed = SURVIVAL[gameId];
  return completed ? survival(completed, prev, next, me, nick) : null;
}

/** Jedyny gracz z najwyższym wynikiem powyżej zera; remis i same zera nie mają lidera. */
export function leaderOf(live: Record<string, number>): string | null {
  const scores = Object.entries(live);
  const top = Math.max(0, ...scores.map(([, v]) => v));
  const leaders = scores.filter(([, v]) => v === top);
  return top > 0 && leaders.length === 1 ? leaders[0][0] : null;
}

/** Nowy lider, gdy przejął prowadzenie od innego. Pierwsze punkty i remis to nie zmiana. */
export function leadChange(prevLive: Record<string, number>, nextLive: Record<string, number>): string | null {
  const [before, after] = [leaderOf(prevLive), leaderOf(nextLive)];
  return before && after && before !== after ? after : null;
}

export const leadText = (id: string, me: string, nick: Nick) => (id === me ? "Prowadzisz!" : `${nick(id)} prowadzi`);

const MOMENT_GAP_MS = 3000;
const MOMENT_MS = 1200;

export const canShowMoment = (lastAt: number | null, now: number) => lastAt === null || now - lastAt >= MOMENT_GAP_MS;

/** Magazyn poza stanem Reacta: komunikat nie renderuje gry, więc nie rusza pomiaru ani dotknięć. */
export function createMomentStore() {
  let current: (MomentData & { id: number }) | null = null;
  let lastAt: number | null = null;
  let id = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    get: () => current,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    show(moment: MomentData) {
      const now = Date.now();
      if (!canShowMoment(lastAt, now)) return;
      lastAt = now;
      current = { ...moment, id: ++id };
      notify();
      clearTimeout(timer);
      timer = setTimeout(() => {
        current = null;
        notify();
      }, MOMENT_MS);
    },
  };
}

export type MomentStore = ReturnType<typeof createMomentStore>;

const REACTION_MS = 1200;

/** Pasek reakcji: grający w mini-grze dopiero po oddaniu wyniku, żeby nic nie odciągało od pomiaru. Sam w pokoju nie ma do kogo. */
export function canReact({ mini, phase, seated, waiting, people }: { mini: boolean; phase: "playing" | "over" | "lobby"; seated: boolean; waiting: boolean; people: number }): boolean {
  if (people < 2 || phase === "lobby") return false;
  return !(phase === "playing" && mini && seated && waiting);
}

export type Reaction = { id: string; index: number };

/** Widoczne reakcje poza stanem Reacta. Wstrzymane (pomiar u grającego) czekają po jednej od osoby i nie budzą nikogo do końca pomiaru. */
export function createReactionStore() {
  let visible: (Reaction & { key: number })[] = [];
  let key = 0;
  let held = false;
  const pending = new Map<string, Reaction>();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  function put(reaction: Reaction) {
    const item = { ...reaction, key: ++key };
    visible = [...visible, item];
    notify();
    setTimeout(() => {
      visible = visible.filter((r) => r.key !== item.key);
      notify();
    }, REACTION_MS);
  }
  return {
    get: () => visible,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    showReaction(reaction: Reaction) {
      if (held) pending.set(reaction.id, reaction);
      else put(reaction);
    },
    setHeld(next: boolean) {
      held = next;
      if (held) return;
      const waiting = [...pending.values()];
      pending.clear();
      waiting.forEach(put);
    },
  };
}

export type ReactionStore = ReturnType<typeof createReactionStore>;

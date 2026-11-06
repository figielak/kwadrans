import { createContext, useContext, useEffect, useRef } from "react";

/** D-03: dekoracja zgłaszana przez klienta. Nie trafia do `validateMove`, wyników ani bohatera. */
export type LiveValues = Record<string, number>;

type LiveKind = { live?: { kind: "score" | "round" | "survival"; total?: number } };
type Progress = { done: number; total: number } | null;

export interface LiveDot {
  id: string;
  score?: number;
  place?: number;
  fraction?: number;
  /** Przeżycie: numer rundy rywala. */
  round?: number;
  /** Przeżycie: rywal oddał wynik, czyli odpadł albo skończył. */
  out?: boolean;
  done: boolean;
}

/**
 * Stan kropek na żywo. Gra na punkty: brak wartości to 0, a zero to ostatnie miejsce ex aequo
 * (nikt nie jest „1.” na starcie). Remis punktów to to samo miejsce.
 */
export function liveDots(def: LiveKind, room: { seats: string[]; game: { waitingFor: string[] } }, live: LiveValues, progressOf: (id: string) => Progress): LiveDot[] {
  const scores = room.seats.map((id) => live[id] ?? 0);
  return room.seats.map((id, i) => {
    const done = !room.game.waitingFor.includes(id);
    if (def.live?.kind === "score") {
      const score = scores[i];
      return { id, score, place: score === 0 ? room.seats.length : 1 + scores.filter((s) => s > score).length, done };
    }
    if (def.live?.kind === "survival") return { id, round: live[id] ?? 0, out: done, done };
    // Gry z `progress` mają dokładniejszy postęp; pozostałe liczą ułamek z wartości na żywo.
    const progress = progressOf(id);
    const total = def.live?.total;
    const fraction = done ? 1 : progress ? progress.done / progress.total : total ? Math.min(1, (live[id] ?? 0) / total) : undefined;
    return { id, fraction, done };
  });
}

/** Wysyła tylko grający w grze z `live`, gdy ma komu pokazywać. */
export const liveActive = (def: LiveKind, seats: string[], me: string) => !!def.live && seats.length > 1 && seats.includes(me);

const THROTTLE_MS = 500;

/** Najwyżej jedna wysyłka na 500 ms: pierwsza od razu, potem najnowsza wartość po przerwie. */
export function throttleLive(send: (value: number) => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: number | null = null;
  function fire(value: number) {
    send(value);
    timer = setTimeout(() => {
      timer = null;
      if (pending === null) return;
      const next = pending;
      pending = null;
      fire(next);
    }, THROTTLE_MS);
  }
  return {
    push(value: number) {
      if (timer === null) fire(value);
      else pending = value;
    },
    cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}

/** Magazyn poza stanem Reacta: czytają go tylko kropki, więc gra i pomiar nie renderują się przy każdej wiadomości. */
export function createLiveStore() {
  let values: LiveValues = {};
  // Własna wartość idzie z opóźnieniem, więc widok serwera może ją mieć starszą.
  let own: LiveValues = {};
  let closed = true;
  const listeners = new Set<() => void>();

  function replace(next: LiveValues) {
    const keys = Object.keys(next);
    if (keys.length === Object.keys(values).length && keys.every((k) => values[k] === next[k])) return;
    values = next;
    listeners.forEach((l) => l());
  }

  return {
    get: () => values,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    /** Wiadomość od rywala. */
    set(id: string, value: number) {
      if (!closed) replace({ ...values, [id]: value });
    },
    /** Własna wartość z hooka gry. */
    report(id: string, value: number) {
      if (closed) return;
      own = { ...own, [id]: value };
      replace({ ...values, [id]: value });
    },
    /** Widok pokoju: start po reconnect, a instrukcja (rewanż, kolejna gra turnieju) czyści wszystko. */
    sync(server: LiveValues, intro: boolean) {
      closed = intro;
      if (intro) own = {};
      replace(intro ? {} : { ...server, ...own });
    },
  };
}

export type LiveStore = ReturnType<typeof createLiveStore>;

/** Kanał gry; `null` poza pokojem, przy 1 grającym, u obserwatora i w grach bez `def.live`. */
export const LiveContext = createContext<{ send: (value: number) => void; report: (value: number) => void } | null>(null);

/** Hook gry: zgłasza wartość, gdy się zmieni. Bez kontekstu (np. ekran „Rekordy”) nic nie robi. */
export function useLive(value: number): void {
  const channel = useContext(LiveContext);
  const throttle = useRef<ReturnType<typeof throttleLive> | null>(null);
  const last = useRef(value);

  useEffect(() => {
    if (!channel) return;
    const t = throttleLive(channel.send);
    throttle.current = t;
    return () => {
      t.cancel();
      throttle.current = null;
    };
  }, [channel]);

  useEffect(() => {
    if (value === last.current) return;
    last.current = value;
    const clean = Math.min(9999, Math.max(0, Math.round(value)));
    channel?.report(clean);
    throttle.current?.push(clean);
  }, [value, channel]);
}

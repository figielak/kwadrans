// U14 (P4-061): pomiar zegara bodźca i dotyku na prawdziwym telefonie. Włącza się parametrem `?zegar` (zostaje do zamknięcia karty)
// i tylko zapisuje: wynik gry nadal liczy obecna metoda. Obok niej zapisuje nową (D4-049 A): wejście z `e.timeStamp`,
// bodziec z pierwszej klatki `requestAnimationFrame` po jego pokazaniu. rAF to chwila przed prezentacją klatki, nie emisja piksela.

export type ProbeGame = "refleks" | "stoj" | "stoper" | "wieza";

export type ProbeRow = {
  game: ProbeGame;
  /** Bodziec: `performance.now()` w chwili zmiany stanu i znacznik pierwszej klatki z bodźcem. */
  stim: number | null;
  raf: number | null;
  /** Wejście: `performance.now()` w obsłudze zdarzenia i `e.timeStamp`. */
  handler: number;
  event: number | null;
  /** Karta była ukryta między bodźcem a jego pierwszą klatką. */
  hidden: boolean;
};

type Pending = { stim: number; raf: number | null; hidden: boolean };

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const spread = (xs: number[]) => (xs.length ? { min: Math.min(...xs), median: median(xs)!, max: Math.max(...xs) } : null);

/** Mediany i rozrzut: przesunięcie bodźca (rAF − stan), opóźnienie obsługi (handler − timeStamp), różnica reakcji (stara − nowa). */
export function summarize(rows: ProbeRow[], frames: number[]) {
  const by = (game: ProbeGame) => {
    const own = rows.filter((r) => r.game === game);
    const shift = own.filter((r) => r.stim !== null && r.raf !== null).map((r) => r.raf! - r.stim!);
    const lag = own.filter((r) => r.event !== null).map((r) => r.handler - r.event!);
    const paired = own.filter((r) => r.stim !== null && r.raf !== null && r.event !== null);
    const oldReaction = paired.map((r) => r.handler - r.stim!);
    const newReaction = paired.map((r) => r.event! - r.raf!);
    return {
      n: own.length,
      shift: spread(shift),
      lag: spread(lag),
      diff: spread(paired.map((_, i) => oldReaction[i] - newReaction[i])),
      negative: newReaction.filter((t) => t < 0).length,
      hidden: own.filter((r) => r.hidden).length,
    };
  };
  const frame = median(frames);
  return { hz: frame ? Math.round(1000 / frame) : null, frame, refleks: by("refleks"), stoj: by("stoj"), stoper: by("stoper"), wieza: by("wieza") };
}

function enabledNow() {
  try {
    if (new URLSearchParams(location.search).has("zegar")) sessionStorage.setItem("zegar", "1");
    return sessionStorage.getItem("zegar") === "1";
  } catch {
    return false;
  }
}

const on = typeof window !== "undefined" && enabledNow();
const rows: ProbeRow[] = [];
const frames: number[] = [];
const visibility: { at: number; hidden: boolean }[] = [];
const pending: Partial<Record<ProbeGame, Pending>> = {};
let panel: HTMLElement | null = null;

/** Bodziec pokazany: zapamiętaj obecne odniesienie i pierwszą klatkę po nim. */
export function stimulus(game: ProbeGame) {
  if (!on) return;
  const p: Pending = { stim: performance.now(), raf: null, hidden: document.hidden };
  pending[game] = p;
  requestAnimationFrame((t) => {
    p.raf = t;
    p.hidden ||= document.hidden;
  });
}

/** Dotknięcie: obsługa i znacznik zdarzenia, w parze z ostatnim bodźcem tej gry. */
export function input(game: ProbeGame, e?: { timeStamp: number }) {
  if (!on) return;
  const handler = performance.now();
  const p = pending[game];
  rows.push({ game, stim: p?.stim ?? null, raf: p?.raf ?? null, handler, event: e?.timeStamp ?? null, hidden: p?.hidden ?? false });
  render();
}

function render() {
  if (!panel) return;
  const s = summarize(rows, frames);
  const ms = (v: { median: number } | null) => (v ? `${v.median.toFixed(1)}` : "–");
  panel.querySelector("pre")!.textContent = [
    `${s.hz ?? "?"} Hz · klatka ${s.frame?.toFixed(2) ?? "?"} ms · ukryta karta ${visibility.filter((v) => v.hidden).length}×`,
    "gra       n  bodziec  dotyk  różnica",
    ...(["refleks", "stoj", "stoper", "wieza"] as const).map(
      (g) => `${g.padEnd(8)} ${String(s[g].n).padStart(2)}  ${ms(s[g].shift).padStart(7)}  ${ms(s[g].lag).padStart(5)}  ${ms(s[g].diff).padStart(7)}${s[g].negative ? ` ujemne ${s[g].negative}` : ""}`,
    ),
  ].join("\n");
}

if (on) {
  let prev = 0;
  requestAnimationFrame(function tick(t) {
    // Po powrocie do karty pierwsza różnica obejmuje czas ukrycia, więc jej nie liczymy.
    if (prev && !document.hidden && t - prev < 100) frames.push(t - prev);
    if (frames.length > 240) frames.shift();
    prev = t;
    requestAnimationFrame(tick);
  });
  document.addEventListener("visibilitychange", () => visibility.push({ at: performance.now(), hidden: document.hidden }));
  const mount = () => {
    panel = document.createElement("aside");
    panel.className = "pointer-events-none fixed top-0 left-0 z-50 m-1 rounded-inset border border-line bg-surface/90 p-1 font-mono text-[10px] leading-tight text-fg-muted";
    panel.innerHTML = '<pre class="whitespace-pre"></pre><div class="pointer-events-auto mt-1 flex gap-1"><button class="btn btn-ghost min-h-8 px-2 text-xs">Kopiuj</button><button class="btn btn-ghost min-h-8 px-2 text-xs">Wyczyść</button></div>';
    const [copy, clear] = panel.querySelectorAll("button");
    copy.onclick = () => {
      const data = JSON.stringify({ userAgent: navigator.userAgent, summary: summarize(rows, frames), rows, visibility });
      navigator.clipboard?.writeText(data).then(() => (copy.textContent = "Skopiowane"), () => (copy.textContent = "Brak schowka"));
      console.log(data);
    };
    clear.onclick = () => {
      rows.length = 0;
      visibility.length = 0;
      render();
    };
    document.body.append(panel);
    render();
    setInterval(render, 1000);
  };
  if (document.body) mount();
  else addEventListener("DOMContentLoaded", mount);
}

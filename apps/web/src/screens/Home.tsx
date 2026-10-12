import { ArrowRight, Crown, Plus, Trophy } from "@phosphor-icons/react";
import { cleanNick, GAMES, NICK_MAX, nickKey, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, TOURNAMENT_ID } from "@mini-games/games";
import { useEffect, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { Records } from "./Records.tsx";
import { StickyBar } from "./ui.tsx";
import {
  codeFromUrl,
  createRoom,
  errorText,
  fetchRanking,
  forgetRecent,
  joinRoom,
  NO_ROOM,
  type RankingRow,
  recentRooms,
  saveNick,
  savedNick,
} from "../net.ts";

/** Wklejony link `/?kod=ABCD` daje sam kod, nie litery z adresu. */
const onlyCodeChars = (s: string) =>
  [...(s.match(/kod=(\w+)/i)?.[1] ?? s).toUpperCase()].filter((c) => ROOM_CODE_ALPHABET.includes(c)).join("").slice(0, ROOM_CODE_LENGTH);

const relative = new Intl.RelativeTimeFormat("pl", { style: "short" });
function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return "przed chwilą";
  return minutes < 60 ? relative.format(-minutes, "minute") : relative.format(-Math.round(minutes / 60), "hour");
}

/** Znak aplikacji: tarcza zegara z zamalowanym pierwszym kwadransem (to samo co `public/icon.svg`, bez tła). */
const Logo = () => (
  <svg viewBox="92 92 328 328" className="size-8 shrink-0" aria-hidden>
    <circle cx="256" cy="256" r="150" fill="none" stroke="currentColor" strokeWidth="28" />
    <path d="M256 256V92A164 164 0 0 1 420 256Z" className="fill-accent" />
  </svg>
);

export function Home({ onRoom, notice }: { onRoom: (room: Room) => void; notice?: string }) {
  const [nick, setNick] = useState(savedNick);
  // Zapamiętany nick to jedna linijka; pole widać tylko za pierwszym razem albo po „zmień”.
  const [editing, setEditing] = useState(() => !savedNick());
  const [code, setCode] = useState(() => onlyCodeChars(codeFromUrl()));
  const [nickError, setNickError] = useState("");
  const [roomError, setRoomError] = useState(notice ?? "");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [ranking, setRanking] = useState<Record<string, RankingRow[]>>({});
  const [records, setRecords] = useState(false);
  const [recent, setRecent] = useState(recentRooms);

  useEffect(() => {
    fetchRanking().then(setRanking);
  }, []);

  function checkNick() {
    const clean = cleanNick(nick);
    setNickError(clean ? "" : `Wpisz nick (do ${NICK_MAX} znaków).`);
    if (!clean) setEditing(true);
    return clean;
  }

  async function go(action: "create" | "join", joinCode = code) {
    const clean = checkNick();
    setRoomError("");
    if (!clean) return;
    setBusy(action);
    try {
      onRoom(action === "create" ? await createRoom(clean) : await joinRoom(joinCode, clean));
      history.replaceState(null, "", "/");
    } catch (e) {
      const text = errorText(e);
      // Pokój z listy ostatnich już nie istnieje, więc nie ma po co go dalej pokazywać.
      if (text === NO_ROOM) {
        forgetRecent(joinCode);
        setRecent(recentRooms());
      }
      setRoomError(text);
      setBusy(null);
    }
  }

  if (records) return <Records nick={cleanNick(nick)} onBack={() => setRecords(false)} />;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-3 px-4 pt-6">
      <header className="flex items-center gap-3">
        <Logo />
        <h1 className="flex-1 text-3xl font-semibold tracking-tight">Kwadrans</h1>
        <button type="button" className="btn btn-ghost size-12 p-0" aria-label="Rekordy mini-gier" onClick={() => setRecords(true)}>
          <Trophy size={20} aria-hidden />
        </button>
      </header>

      {editing ? (
        <form
          className="tile flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const clean = checkNick();
            if (!clean) return;
            saveNick(clean);
            setNick(clean);
            setEditing(false);
          }}
        >
          <label htmlFor="nick" className="label">
            Nick
          </label>
          <div className="flex gap-2">
            <input
              id="nick"
              className="field"
              value={nick}
              maxLength={NICK_MAX}
              autoComplete="nickname"
              enterKeyHint="done"
              aria-invalid={!!nickError}
              aria-describedby="nick-error"
              onChange={(e) => setNick(e.target.value)}
            />
            <button type="submit" className="btn btn-ghost shrink-0">
              Zapisz
            </button>
          </div>
          <p id="nick-error" role="alert" className="text-sm text-accent empty:hidden">
            {nickError}
          </p>
        </form>
      ) : (
        <p className="flex items-center gap-1.5 text-fg-muted">
          Grasz jako <span className="truncate font-semibold text-fg">{nick}</span>
          <span aria-hidden>·</span>
          <button type="button" className="-mx-2 min-h-12 shrink-0 px-2 text-accent" onClick={() => setEditing(true)}>
            zmień
          </button>
        </p>
      )}

      <form
        className="tile flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === ROOM_CODE_LENGTH) go("join");
        }}
      >
        <label htmlFor="code" className="label">
          Dołącz do znajomych
        </label>
        <div className="flex gap-2">
          <input
            id="code"
            className="field font-mono text-xl tracking-[0.4em] uppercase"
            value={code}
            placeholder="KOD"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-invalid={!!roomError}
            aria-describedby="room-error code-hint"
            onChange={(e) => {
              const next = onlyCodeChars(e.target.value);
              setCode(next);
              // Ostatni znak kodu dołącza od razu; kod z linku czeka na przycisk.
              if (next.length === ROOM_CODE_LENGTH && next !== code && !busy) go("join", next);
            }}
          />
          <button type="submit" className="btn btn-primary shrink-0" disabled={!!busy || code.length !== ROOM_CODE_LENGTH}>
            {busy === "join" ? "Łączenie…" : "Dołącz"}
            {busy !== "join" && <ArrowRight size={18} weight="bold" aria-hidden />}
          </button>
        </div>
        <p id="room-error" role="alert" className="text-sm text-accent empty:hidden">
          {roomError}
        </p>
        <p id="code-hint" className="text-sm text-fg-subtle">
          Dołączysz automatycznie po wpisaniu pełnego kodu.
        </p>
      </form>

      {recent.length > 0 && (
        <section aria-labelledby="recent">
          <h2 id="recent" className="label mt-3 mb-2 px-1">
            Ostatnie pokoje
          </h2>
          <ul className="tile flex flex-col divide-y divide-line py-1">
            {recent.map((r) => (
              <li key={r.code}>
                <button type="button" className="flex min-h-12 w-full items-center gap-3 text-left" disabled={!!busy} onClick={() => go("join", r.code)}>
                  <span className="font-mono font-medium tracking-[0.12em]">{r.code}</span>
                  <span className="flex-1 truncate text-sm text-fg-muted">
                    {(r.gameId && GAMES[r.gameId]?.name) || "Lobby"} · {r.players} {r.players === 1 ? "gracz" : "graczy"}
                  </span>
                  <span className="shrink-0 text-sm text-fg-subtle">{ago(r.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Ranking ranking={ranking} me={cleanNick(nick)} />

      <div className="flex-1" />
      <StickyBar>
        <button type="button" className="btn btn-ghost w-full" disabled={!!busy} onClick={() => go("create")}>
          {busy === "create" ? (
            "Tworzenie pokoju…"
          ) : (
            <>
              <Plus size={18} weight="bold" aria-hidden />
              Utwórz pokój
            </>
          )}
        </button>
      </StickyBar>
    </main>
  );
}

function Ranking({ ranking, me }: { ranking: Record<string, RankingRow[]>; me: string | null }) {
  const [all, setAll] = useState(false);
  // Turniej nie jest grą z rejestru, ale ma własny ranking. Mini-gry mają rekordy na osobnym ekranie.
  const title = (id: string) => (id === TOURNAMENT_ID ? "Turniej" : GAMES[id]?.minPlayers > 1 ? GAMES[id].name : undefined);
  const key = me && nickKey(me);
  const games = Object.entries(ranking).filter(([id]) => title(id));
  if (games.length === 0) return null;
  // Zwinięty ranking pokazuje jedną grę: tę, w której gracz już jest, albo pierwszą z listy.
  const first = games.find(([, rows]) => rows.some((r) => nickKey(r.nick) === key)) ?? games[0];
  return (
    <section aria-labelledby="ranking">
      <div className="mt-3 flex items-center justify-between px-1">
        <h2 id="ranking" className="label">
          Ranking{all ? "" : ` · ${title(first[0])}`}
        </h2>
        {games.length > 1 && (
          <button type="button" className="-mr-2 min-h-12 px-2 text-sm text-accent" aria-expanded={all} onClick={() => setAll(!all)}>
            {all ? "Zwiń" : "Wszystkie rankingi"}
          </button>
        )}
      </div>
      <div className={`tile flex flex-col gap-4 ${games.length > 1 ? "" : "mt-2"}`}>
        {(all ? games : [first]).map(([id, rows]) => (
          <div key={id}>
            {all && <h3 className="mb-1 font-semibold">{title(id)}</h3>}
            <div className="flex justify-between text-xs text-fg-subtle" aria-hidden>
              <span>Gracz</span>
              <span>Wygrane</span>
            </div>
            <ol className="flex flex-col text-sm">
              {rows.map((r, i) => (
                <li key={r.nick} className={`flex items-center gap-3 py-0.5 ${nickKey(r.nick) === key ? "text-accent" : ""}`}>
                  <span className="flex w-5 font-mono text-fg-subtle">{i === 0 ? <Crown size={14} weight="fill" className="text-accent" aria-label="1." /> : i + 1}</span>
                  <span className="flex-1 truncate">{r.nick}</span>
                  <span className="font-mono tabular-nums" aria-label={`${r.wins} wygranych z ${r.played} partii`}>
                    {r.wins} z {r.played}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

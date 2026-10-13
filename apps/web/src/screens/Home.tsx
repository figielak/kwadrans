import { ArrowLeft, ArrowRight, CaretRight, Play, Plus, Shuffle, SquaresFour, Trophy, User, UsersThree, Warning } from "@phosphor-icons/react";
import { cleanNick, GAMES, MINI_GAME_IDS, NICK_MAX, type RecordRow, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, standing } from "@mini-games/games";
import { useEffect, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { ICONS } from "./Lobby.tsx";
import { MiniGameGrid } from "./MiniGames.tsx";
import { formatBest, Records } from "./Records.tsx";
import { Screen } from "./ui.tsx";
import { codeFromUrl, createRoom, errorText, fetchDaily, fetchRecords, fetchRooms, forgetRecent, joinRoom, NO_ROOM, recentRooms, saveNick, savedNick } from "../net.ts";

/** Wklejony link `/?kod=ABCD` daje sam kod, nie litery z adresu. */
const onlyCodeChars = (s: string) =>
  [...(s.match(/kod=(\w+)/i)?.[1] ?? s).toUpperCase()].filter((c) => ROOM_CODE_ALPHABET.includes(c)).join("").slice(0, ROOM_CODE_LENGTH);

const relative = new Intl.RelativeTimeFormat("pl", { style: "short" });
function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60_000);
  if (minutes < 1) return "przed chwilą";
  return minutes < 60 ? relative.format(-minutes, "minute") : relative.format(-Math.round(minutes / 60), "hour");
}

/** Znak aplikacji: trzy koła i zamalowany kwadrans (to samo co `public/icon.svg`, bez tła). */
const Logo = () => (
  <svg viewBox="32 32 192 192" className="size-8 shrink-0" fill="currentColor" aria-hidden>
    <circle cx="76" cy="76" r="44" />
    <circle cx="76" cy="180" r="44" />
    <circle cx="180" cy="180" r="44" />
    <path d="M136 120V32a88 88 0 0 1 88 88z" className="fill-accent" />
  </svg>
);

/** Błąd pod polem: kolor ostrzeżenia zawsze z ikoną i tekstem, bo sam odcień czerwieni nie odróżnia go od akcentu. */
const Problem = ({ id, children }: { id?: string; children: string }) => (
  <p id={id} role="alert" className="flex items-center gap-1.5 text-sm text-warning empty:hidden">
    {children && (
      <>
        <Warning size={16} weight="fill" className="shrink-0" aria-hidden />
        {children}
      </>
    )}
  </p>
);

type Busy = "create" | "join" | "solo" | null;

export function Home({ onRoom, notice }: { onRoom: (room: Room) => void; notice?: string }) {
  const [nick, setNick] = useState(savedNick);
  // Zapamiętany nick to jedna linijka; pole widać tylko za pierwszym razem albo po „zmień”.
  const [editing, setEditing] = useState(() => !savedNick());
  const [code, setCode] = useState(() => onlyCodeChars(codeFromUrl()));
  const [nickError, setNickError] = useState("");
  const [roomError, setRoomError] = useState(notice ?? "");
  const [soloError, setSoloError] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [screen, setScreen] = useState<"records" | "all" | null>(null);
  const [recent, setRecent] = useState(recentRooms);
  /** Które z ostatnich pokoi jeszcze istnieją (kod → liczba graczy); dopóki serwer nie odpowie, sekcji nie ma. */
  const [alive, setAlive] = useState<Record<string, number>>({});
  const [daily, setDaily] = useState<{ gameId: string; rows: RecordRow[] } | null>(null);
  const [records, setRecords] = useState<Record<string, RecordRow[]>>({});

  useEffect(() => {
    fetchDaily().then(setDaily);
    fetchRecords().then(setRecords);
    // Wracać jest do czego tylko tam, gdzie byli inni gracze.
    const codes = recentRooms().filter((r) => r.players >= 2).map((r) => r.code);
    if (codes.length > 0) fetchRooms(codes).then(setAlive);
  }, []);

  function checkNick() {
    const clean = cleanNick(nick);
    setNickError(clean ? "" : `Wpisz nick (do ${NICK_MAX} znaków).`);
    if (!clean) setEditing(true);
    return clean;
  }

  /** `arg`: kod pokoju przy dołączaniu, id mini-gry przy grze solo. */
  async function go(action: Exclude<Busy, null>, arg = code) {
    const clean = checkNick();
    setRoomError("");
    setSoloError("");
    if (!clean) return;
    setBusy(action);
    try {
      onRoom(action === "join" ? await joinRoom(arg, clean) : await createRoom(clean, action === "solo" ? arg : undefined));
      history.replaceState(null, "", "/");
    } catch (e) {
      const text = errorText(e);
      // Pokój z listy ostatnich już nie istnieje, więc nie ma po co go dalej pokazywać.
      if (text === NO_ROOM) {
        forgetRecent(arg);
        setRecent(recentRooms());
      }
      (action === "solo" ? setSoloError : setRoomError)(text);
      setScreen(null);
      setBusy(null);
    }
  }
  const play = (gameId: string) => go("solo", gameId);

  const me = cleanNick(nick);
  if (screen === "records") return <Records nick={me} onBack={() => setScreen(null)} onPlay={play} />;
  if (screen === "all") {
    return (
      <Screen dropped={false}>
        <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={() => setScreen(null)}>
          <ArrowLeft size={16} aria-hidden />
          Wróć
        </button>
        <h1 className="text-3xl font-semibold tracking-tight">Mini-gry</h1>
        <p className="text-sm text-fg-muted">Dotknij gry, żeby zagrać {busy === "solo" ? "…" : "samemu."}</p>
        <MiniGameGrid records={records} nick={me} disabled={!!busy} onPick={play} />
      </Screen>
    );
  }

  // Dwie gry pod rekordy: cudzy rekord, do którego mam najbliżej (najwyższe miejsce poza pierwszym), i mój, którego broni się przed największą liczbą rywali.
  // ponytail: bliskość liczona miejscem, nie różnicą wyniku (gry mają różne jednostki); do zmiany, gdyby podpowiedzi były nietrafione
  const mine = MINI_GAME_IDS.filter((id) => id !== daily?.gameId).flatMap((id) => {
    const rows = records[id] ?? [];
    const at = me ? standing(rows, me, GAMES[id].record!) : null;
    return at ? [{ id, at, top: rows[0] }] : [];
  });
  const chase = mine.filter((g) => g.at.place > 1).sort((a, b) => a.at.place - b.at.place || b.at.of - a.at.of)[0];
  const defend = mine.filter((g) => g.at.place === 1 && g.at.of > 1).sort((a, b) => b.at.of - a.at.of)[0];
  const picks = [
    chase && { id: chase.id, text: `ty ${formatBest(chase.id, chase.at.best)} · rekord ${formatBest(chase.id, chase.top.best)}` },
    defend && { id: defend.id, text: `twój rekord ${formatBest(defend.id, defend.at.best)}` },
  ].filter((p) => !!p);

  const DailyIcon = (daily && ICONS[daily.gameId]) || Play;
  const today = daily && me ? standing(daily.rows, me, GAMES[daily.gameId].record!) : null;
  const full = code.length === ROOM_CODE_LENGTH;
  const back = recent.filter((r) => r.players >= 2 && alive[r.code]);

  const solo = (
    <section key="solo" aria-labelledby="solo">
      <h2 id="solo" className="label mt-3 mb-2 flex items-center gap-1.5 px-1">
        <User size={14} aria-hidden />
        Sam
      </h2>
      <div className="tile flex flex-col gap-3">
        {daily && (
          <>
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-inset bg-accent-soft text-accent">
                <DailyIcon size={24} weight="fill" aria-hidden />
              </span>
              <p className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-semibold">Wyzwanie dnia: {GAMES[daily.gameId].name}</span>
                <span className="truncate text-sm text-fg-muted">
                  {daily.rows.length === 0
                    ? "Dziś nikt jeszcze nie grał"
                    : today?.place === 1
                      ? `Prowadzisz: ${formatBest(daily.gameId, today.best)}`
                      : `Lider ${daily.rows[0].nick} ${formatBest(daily.gameId, daily.rows[0].best)} · ty: ${today ? formatBest(daily.gameId, today.best) : "brak wyniku"}`}
                </span>
              </p>
            </div>
            <button type="button" className="btn btn-primary w-full" disabled={!!busy} onClick={() => play(daily.gameId)}>
              <Play size={18} weight="fill" aria-hidden />
              Zagraj
            </button>
          </>
        )}
        {picks.length > 0 && (
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {picks.map(({ id, text }) => {
              const PickIcon = ICONS[id] ?? Play;
              return (
                <li key={id}>
                  <button type="button" className="flex min-h-12 w-full items-center gap-3 text-left" disabled={!!busy} onClick={() => play(id)}>
                    <PickIcon size={20} className="shrink-0" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col py-1.5 leading-tight">
                      <span className="truncate">{GAMES[id].name}</span>
                      <span className="truncate font-mono text-sm text-fg-muted tabular-nums">{text}</span>
                    </span>
                    <CaretRight size={14} className="shrink-0 text-fg-muted" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn btn-ghost px-2 whitespace-nowrap"
            disabled={!!busy}
            onClick={() => play(MINI_GAME_IDS[Math.floor(Math.random() * MINI_GAME_IDS.length)])}
          >
            <Shuffle size={18} weight="bold" className="shrink-0" aria-hidden />
            Losowa gra
          </button>
          <button type="button" className="btn btn-ghost px-2 whitespace-nowrap" disabled={!!busy} onClick={() => setScreen("all")}>
            <SquaresFour size={18} className="shrink-0" aria-hidden />
            Wszystkie ({MINI_GAME_IDS.length})
          </button>
        </div>
        <Problem>{soloError}</Problem>
      </div>
    </section>
  );

  const friends = (
    <section key="friends" aria-labelledby="friends">
      <h2 id="friends" className="label mt-3 mb-2 flex items-center gap-1.5 px-1">
        <UsersThree size={14} aria-hidden />
        Ze znajomymi
      </h2>
      <div className="tile flex flex-col gap-3">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (full) go("join");
          }}
        >
          <div className="flex gap-2">
            <input
              className="field font-mono text-xl tracking-[0.4em] uppercase"
              value={code}
              placeholder="KOD"
              aria-label="Kod pokoju"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              aria-invalid={!!roomError}
              aria-describedby="room-error"
              onChange={(e) => {
                const next = onlyCodeChars(e.target.value);
                setCode(next);
                // Ostatni znak kodu dołącza od razu; kod z linku czeka na przycisk.
                if (next.length === ROOM_CODE_LENGTH && next !== code && !busy) go("join", next);
              }}
            />
            {/* Jedyny wypełniony przycisk ekranu to „Zagraj”; „Dołącz” dostaje akcent dopiero z pełnym kodem. */}
            <button type="submit" className={`btn shrink-0 ${full ? "btn-primary" : "btn-ghost"}`} disabled={!!busy || !full}>
              {busy === "join" ? "Łączenie…" : "Dołącz"}
              {busy !== "join" && <ArrowRight size={18} weight="bold" aria-hidden />}
            </button>
          </div>
          <Problem id="room-error">{roomError}</Problem>
        </form>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="text-sm text-fg-muted">Albo zaproś innych</span>
          <button type="button" className="btn btn-ghost shrink-0" disabled={!!busy} onClick={() => go("create")}>
            {busy === "create" ? (
              "Tworzenie…"
            ) : (
              <>
                <Plus size={18} weight="bold" aria-hidden />
                Utwórz pokój
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-3 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3">
        <Logo />
        <h1 className="flex-1 text-3xl font-semibold tracking-tight">Kwadrans</h1>
        <button type="button" className="btn btn-ghost size-12 p-0" aria-label="Rekordy i rankingi" onClick={() => setScreen("records")}>
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
          <Problem id="nick-error">{nickError}</Problem>
        </form>
      ) : (
        <p className="flex items-center gap-1.5 text-fg-muted">
          Grasz jako <span className="truncate font-semibold text-fg">{nick}</span>
          <span aria-hidden>·</span>
          <button type="button" className="-mx-2 min-h-12 shrink-0 px-2 text-fg-muted underline underline-offset-4" onClick={() => setEditing(true)}>
            zmień
          </button>
        </p>
      )}

      {/* Kto wchodzi z linku z kodem, przyszedł do znajomych: ich sekcja idzie na górę. */}
      {codeFromUrl() ? [friends, solo] : [solo, friends]}

      {back.length > 0 && (
        <section aria-labelledby="recent">
          <h2 id="recent" className="label mt-3 mb-2 px-1">
            Wróć do pokoju
          </h2>
          <ul className="tile flex flex-col divide-y divide-line py-1">
            {back.map((r) => (
              <li key={r.code}>
                <button type="button" className="flex min-h-12 w-full items-center gap-3 text-left" disabled={!!busy} onClick={() => go("join", r.code)}>
                  <span className="font-mono font-medium tracking-[0.12em]">{r.code}</span>
                  <span className="flex-1 truncate text-sm text-fg-muted">
                    {(r.gameId && GAMES[r.gameId]?.name) || "Lobby"} · {alive[r.code]} {alive[r.code] === 1 ? "gracz" : "graczy"}
                  </span>
                  <span className="shrink-0 text-sm text-fg-muted">{ago(r.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

import { ArrowLeft, ArrowRight, CaretRight, Info, Play, Plus, Shuffle, SquaresFour, Trophy, User, UsersThree, Warning } from "@phosphor-icons/react";
import { cleanNick, GAMES, initials, MINI_GAME_IDS, NICK_MAX, type RecordRow, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, standing } from "@kwadrans/games";
import { useEffect, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { Changelog, VERSION } from "./Changelog.tsx";
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

export function Home({ onRoom, notice: closedNotice }: { onRoom: (room: Room) => void; notice?: string }) {
  const [nick, setNick] = useState(savedNick);
  // Zapamiętany nick to jedna linijka; pole widać tylko za pierwszym razem albo po „zmień”.
  const [editing, setEditing] = useState(() => !savedNick());
  const [code, setCode] = useState(() => onlyCodeChars(codeFromUrl()));
  const [nickError, setNickError] = useState("");
  const [roomError, setRoomError] = useState("");
  // Pokój zamknięty po drodze to informacja o tym, co się stało, a nie błąd wpisanego kodu; znika przy następnej próbie.
  const [notice, setNotice] = useState(closedNotice);
  const [soloError, setSoloError] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [screen, setScreen] = useState<"records" | "all" | "changelog" | null>(null);
  const [recent, setRecent] = useState(recentRooms);
  /** Które z ostatnich pokoi jeszcze istnieją (kod → liczba graczy); dopóki serwer nie odpowie, sekcji nie ma. */
  const [alive, setAlive] = useState<Record<string, number>>({});
  const [daily, setDaily] = useState<{ gameId: string; rows: RecordRow[] } | null>(null);
  /** Rekordy do podpowiedzi i kafli; undefined do odpowiedzi serwera, null, gdy nie odpowie. */
  const [records, setRecords] = useState<Record<string, RecordRow[]> | null>();

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
    setNotice(undefined);
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
  if (screen === "changelog") return <Changelog onBack={() => setScreen(null)} />;
  if (screen === "all") {
    return (
      <Screen dropped={false}>
        <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={() => setScreen(null)}>
          <ArrowLeft size={16} weight="bold" aria-hidden />
          Wróć
        </button>
        <h1 className="text-3xl font-semibold tracking-tight">Mini-gry</h1>
        <p role="status" className="text-sm text-fg-muted">
          {busy === "solo" ? "Uruchamianie…" : "Dotknij gry, żeby zagrać samemu."}
        </p>
        {records === null && <p className="text-sm text-fg-muted">Nie udało się wczytać rekordów.</p>}
        <MiniGameGrid records={records} nick={me} disabled={!!busy} onPick={play} />
      </Screen>
    );
  }

  // Dwie gry pod rekordy: cudzy rekord, do którego mam najbliżej (najwyższe miejsce poza pierwszym), i mój, którego broni się przed największą liczbą rywali.
  // ponytail: bliskość liczona miejscem, nie różnicą wyniku (gry mają różne jednostki); do zmiany, gdyby podpowiedzi były nietrafione
  const mine = MINI_GAME_IDS.filter((id) => id !== daily?.gameId).flatMap((id) => {
    const rows = records?.[id] ?? [];
    const order = GAMES[id].record!;
    const at = me ? standing(rows, me, order) : null;
    // Zero w grze, w której wyższy wynik jest lepszy, to brak rekordu: nie ma czego bić ani bronić.
    return at && (order.lower || rows[0].best > 0) ? [{ id, at, top: rows[0] }] : [];
  });
  const chase = mine.filter((g) => g.at.place > 1).sort((a, b) => a.at.place - b.at.place || b.at.of - a.at.of)[0];
  const defend = mine.filter((g) => g.at.place === 1 && g.at.of > 1).sort((a, b) => b.at.of - a.at.of)[0];
  const picks = [
    chase && { id: chase.id, reason: "Do pobicia", value: formatBest(chase.id, chase.top.best) },
    defend && { id: defend.id, reason: "Do obrony", value: formatBest(defend.id, defend.at.best) },
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
      <div className="flex flex-col gap-3">
        {daily && (
          <button
            type="button"
            className="tile flex w-full items-center gap-3 p-4 text-left transition-transform duration-180 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
            disabled={!!busy}
            onClick={() => play(daily.gameId)}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-inset bg-accent-soft text-accent">
              <DailyIcon size={24} weight="fill" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
              <span className="label">Wyzwanie dnia</span>
              <span className="truncate text-lg font-semibold">{GAMES[daily.gameId].name}</span>
              <span className="text-sm text-fg-muted">
                {busy === "solo"
                  ? "Uruchamianie…"
                  : daily.rows.length === 0
                    ? "Zdobądź pierwszy wynik dnia"
                    : today?.place === 1
                      ? `Prowadzisz: ${formatBest(daily.gameId, today.best)}`
                      : `Lider ${daily.rows[0].nick} ${formatBest(daily.gameId, daily.rows[0].best)} · ty: ${today ? formatBest(daily.gameId, today.best) : "brak wyniku"}`}
              </span>
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line">
              <span className="sr-only">Zagraj</span>
              <Play size={16} weight="fill" aria-hidden />
            </span>
          </button>
        )}
        {picks.length > 0 && (
          <ul className="flex flex-col divide-y divide-line px-1">
            {picks.map(({ id, reason, value }) => {
              const PickIcon = ICONS[id] ?? Play;
              return (
                <li key={id}>
                  <button type="button" className="flex min-h-12 w-full items-center gap-3 text-left" disabled={!!busy} onClick={() => play(id)}>
                    <PickIcon size={20} className="shrink-0" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col py-1.5 leading-tight">
                      <span className="truncate">{GAMES[id].name}</span>
                      <span className="truncate text-sm text-fg-muted">{reason}</span>
                    </span>
                    <span className="shrink-0 font-mono text-sm font-medium tabular-nums">{value}</span>
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
            <SquaresFour size={18} weight="bold" className="shrink-0" aria-hidden />
            Wszystkie
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
      <div className="flex flex-col gap-3">
        {/* Powrót stoi nad wszystkim, bo po zerwanym połączeniu to najpilniejsza akcja, a bez żywego pokoju go nie ma. */}
        {back.length > 0 && (
          <ul aria-label="Wróć do pokoju" className="flex flex-col gap-2">
            {back.map((r) => (
              <li key={r.code}>
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center gap-3 rounded-inset border border-line-hover px-4 py-2 text-left disabled:opacity-40"
                  disabled={!!busy}
                  onClick={() => go("join", r.code)}
                >
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="font-medium">
                      Wróć do <span className="font-mono tabular-nums tracking-[0.12em]">{r.code}</span>
                    </span>
                    <span className="truncate text-sm text-fg-muted">
                      {(r.gameId && GAMES[r.gameId]?.name) || "Lobby"} · {alive[r.code]} {alive[r.code] === 1 ? "gracz" : "graczy"} · {ago(r.at)}
                    </span>
                  </span>
                  <CaretRight size={14} className="shrink-0 text-fg-muted" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Jeden wypełniony przycisk na ekranie: „Utwórz pokój”, a z pełnym kodem „Dołącz” (wtedy „Utwórz pokój” to obrys). */}
        <button type="button" className={`btn w-full ${full ? "btn-ghost" : "btn-primary"}`} disabled={!!busy} onClick={() => go("create")}>
          {busy === "create" ? (
            "Tworzenie…"
          ) : (
            <>
              <Plus size={18} weight="bold" aria-hidden />
              Utwórz pokój
            </>
          )}
        </button>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (full) go("join");
          }}
        >
          <label htmlFor="room-code" className="text-sm text-fg-muted">
            Albo wpisz kod
          </label>
          <div className="relative grid grid-cols-4 gap-2">
            {/* Jedno prawdziwe pole nad komórkami: wklejanie linku, klawiatura i czytniki działają jak w zwykłym polu. */}
            <input
              id="room-code"
              className="peer absolute inset-0 z-10 size-full cursor-text text-base opacity-0"
              value={code}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              aria-invalid={!!roomError}
              aria-describedby="room-error"
              onSelect={(e) => {
                // Pola nie widać, więc kursor zostaje na końcu: dotknięcie komórki nie może wstawiać znaku w środek kodu.
                const end = e.currentTarget.value.length;
                if (e.currentTarget.selectionStart !== end) e.currentTarget.setSelectionRange(end, end);
              }}
              onChange={(e) => {
                const next = onlyCodeChars(e.target.value);
                setCode(next);
                // Ostatni znak kodu dołącza od razu; kod z linku czeka na przycisk.
                if (next.length === ROOM_CODE_LENGTH && next !== code && !busy) go("join", next);
              }}
            />
            {Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className={`field flex h-14 items-center justify-center p-0 font-mono text-2xl font-medium tabular-nums ${
                  roomError
                    ? "border-warning"
                    : i === Math.min(code.length, ROOM_CODE_LENGTH - 1)
                      ? "peer-focus:border-accent peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-accent"
                      : ""
                }`}
              >
                {code[i]}
              </span>
            ))}
          </div>
          {full && (
            <button type="submit" className="btn btn-primary w-full" disabled={!!busy}>
              {busy === "join" ? "Łączenie…" : "Dołącz"}
              {busy !== "join" && <ArrowRight size={18} weight="bold" aria-hidden />}
            </button>
          )}
          <Problem id="room-error">{roomError}</Problem>
        </form>
      </div>
    </section>
  );

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-3 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3">
        <Logo />
        <h1 className="flex-1 text-3xl font-semibold tracking-tight">Kwadrans</h1>
        {!editing && (
          <button type="button" className="btn size-12 bg-line p-0 text-lg font-semibold" aria-label={`Grasz jako ${nick}. Zmień nick`} disabled={!!busy} onClick={() => setEditing(true)}>
            {initials([nick])[0]}
          </button>
        )}
        <button type="button" className="btn btn-ghost size-12 p-0" aria-label="Rekordy i rankingi" disabled={!!busy} onClick={() => setScreen("records")}>
          <Trophy size={20} aria-hidden />
        </button>
      </header>

      {editing && (
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
      )}

      {notice && (
        <p role="status" className="tile flex items-center gap-2 text-sm">
          <Info size={18} className="shrink-0 text-fg-muted" aria-hidden />
          {notice}
        </p>
      )}

      {/* Najwięcej radości daje gra z innymi, więc znajomi są na górze zawsze, także przy wejściu z linku. */}
      {[friends, solo]}

      <footer className="mt-auto flex justify-center">
        <button type="button" className="min-h-12 px-2 text-sm text-fg-muted disabled:opacity-40" disabled={!!busy} onClick={() => setScreen("changelog")}>
          Wersja <span className="font-mono tabular-nums">{VERSION}</span> · Co nowego
        </button>
      </footer>
    </main>
  );
}

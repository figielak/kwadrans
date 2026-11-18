import { ArrowLeft, CaretRight, Crown, PencilSimple, Play } from "@phosphor-icons/react";
import { GAMES, type HistoryRow, MINI_GAME_IDS, nickKey, type Profile as ProfileData, type RecordRow, standing } from "@kwadrans/games";
import { useEffect, useState } from "react";
import { fetchHistory, fetchProfile, fetchRecords } from "../net.ts";
import { ICONS } from "./Lobby.tsx";
import { historyLine, matchesWord, resultOf, since } from "./profile.ts";
import { formatBest, plural } from "./Records.tsx";
import { Screen } from "./ui.tsx";

const PAGE = 20;
const GAMES_SHOWN = 5;

/**
 * Profil gracza po nicku, publiczny jak rankingi. Rywala otwiera się z listy „Z kim grasz”, a „Wróć” cofa o jeden profil.
 * `me` to mój nick: przy własnym profilu pojawia się „Zmień nick” (o ile ekran ją obsługuje).
 */
export function Profile({ nick, me, dropped = false, onBack, onEditNick }: { nick: string; me: string | null; dropped?: boolean; onBack: () => void; onEditNick?: () => void }) {
  const [stack, setStack] = useState([nick]);
  const current = stack.at(-1)!;
  const own = !!me && nickKey(me) === nickKey(current);
  return (
    <ProfileView
      key={nickKey(current)}
      nick={current}
      dropped={dropped}
      onBack={() => (stack.length > 1 ? setStack(stack.slice(0, -1)) : onBack())}
      onEditNick={own ? onEditNick : undefined}
      onOpen={(next) => setStack([...stack, next])}
      own={own}
    />
  );
}

function ProfileView({ nick, own, dropped, onBack, onEditNick, onOpen }: {
  nick: string;
  own: boolean;
  dropped: boolean;
  onBack: () => void;
  onEditNick?: () => void;
  onOpen: (nick: string) => void;
}) {
  /** undefined do odpowiedzi, null: brak partii, false: serwer nie odpowiada. */
  const [profile, setProfile] = useState<ProfileData | null | false>();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Record<string, RecordRow[]> | null>(null);
  const [allGames, setAllGames] = useState(false);

  useEffect(() => {
    fetchProfile(nick).then(setProfile);
    fetchHistory(nick).then((rows) => {
      setHistory(rows ?? []);
      setMore(rows?.length === PAGE);
    });
    fetchRecords().then(setRecords);
  }, [nick]);

  async function older() {
    setLoading(true);
    const rows = await fetchHistory(nick, history.at(-1)?.id);
    setLoading(false);
    if (!rows) return;
    setHistory([...history, ...rows]);
    setMore(rows.length === PAGE);
  }

  const shownNick = profile ? profile.nick : nick;
  const places = MINI_GAME_IDS.flatMap((id) => {
    const at = records && standing(records[id] ?? [], shownNick, GAMES[id].record!);
    return at ? [{ id, ...at }] : [];
  }).sort((a, b) => a.place - b.place || b.of - a.of);
  const led = places.filter((p) => p.place === 1).length;

  return (
    <Screen dropped={dropped}>
      <button type="button" className="-ml-2 flex min-h-12 items-center gap-1.5 self-start px-2 text-sm text-fg-muted" onClick={onBack}>
        <ArrowLeft size={16} weight="bold" aria-hidden />
        Wróć
      </button>
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">{shownNick}</h1>
          {profile && (
            <p className="text-sm text-fg-muted">
              Gra od {since(profile.firstAt)} · {plural(profile.days, "dzień", "dni", "dni")} gry
            </p>
          )}
        </div>
        {onEditNick && (
          <button type="button" className="btn btn-ghost shrink-0 px-3" onClick={onEditNick}>
            <PencilSimple size={18} aria-hidden />
            Zmień nick
          </button>
        )}
      </header>

      {profile === undefined && (
        <p role="status" aria-busy className="text-fg-muted">
          Wczytywanie…
        </p>
      )}
      {profile === false && <p role="status" className="text-fg-muted">Nie udało się wczytać profilu. Spróbuj za chwilę.</p>}
      {profile === null && (
        <p className="text-sm text-fg-muted">{own ? "Nie masz jeszcze żadnej partii. Zagraj, a tu pojawi się twoja historia." : "Ten nick nie ma jeszcze żadnej partii."}</p>
      )}

      {profile && (
        <>
          <dl className="grid grid-cols-3 gap-2">
            {[
              { label: "Partie", value: String(profile.matches) },
              { label: "Wygrane wieczory", value: String(profile.evenings.won), of: profile.evenings.played },
              { label: "Najlepsza seria", value: String(profile.bestStreak) },
            ].map((item) => (
              <div key={item.label} className="flex flex-col justify-between gap-1 rounded-inset bg-surface p-3">
                <dt className="label leading-tight">{item.label}</dt>
                <dd className="font-mono text-2xl leading-tight font-semibold tabular-nums">
                  {item.value}
                  {item.of !== undefined && <span className="text-sm font-normal text-fg-muted"> z {item.of}</span>}
                </dd>
              </div>
            ))}
          </dl>

          {profile.games.length > 0 && (
            <section className="flex flex-col gap-1" aria-labelledby="profile-games">
              <div className="flex items-center justify-between gap-3">
                <h2 id="profile-games" className="text-sm text-fg-muted">
                  Gry
                </h2>
                {profile.games.length > GAMES_SHOWN && (
                  <button type="button" className="-mr-2 min-h-12 px-2 text-sm text-fg-muted underline underline-offset-4" onClick={() => setAllGames(!allGames)}>
                    {allGames ? "Zwiń" : "Pokaż wszystkie"}
                  </button>
                )}
              </div>
              <ul className="flex flex-col divide-y divide-line rounded-inset bg-surface px-3">
                {(allGames ? profile.games : profile.games.slice(0, GAMES_SHOWN)).map((g) => {
                  const GameIcon = ICONS[g.gameId] ?? Play;
                  const main = (GAMES[g.gameId]?.minPlayers ?? 1) > 1;
                  return (
                    <li key={g.gameId} className="flex min-h-12 items-center gap-3 py-1.5">
                      <GameIcon size={20} className="shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{GAMES[g.gameId]?.name ?? g.gameId}</span>
                      {main ? (
                        <span role="img" className="font-mono text-sm tabular-nums" aria-label={`${g.wins} wygranych z ${g.played} partii`}>
                          {g.wins} z {g.played}
                        </span>
                      ) : (
                        <span className="font-mono text-sm tabular-nums">{matchesWord(g.played)}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {profile.games.some((g) => (GAMES[g.gameId]?.minPlayers ?? 1) > 1) && <p className="text-xs text-fg-muted">W grach głównych: wygrane z partii.</p>}
            </section>
          )}

          {places.length > 0 && (
            <section className="flex flex-col gap-1" aria-labelledby="profile-records">
              <h2 id="profile-records" className="text-sm text-fg-muted">
                Rekordy · {led > 0 ? `prowadzi w ${plural(led, "grze", "grach", "grach")}` : "bez pierwszego miejsca"}
              </h2>
              <ul className="flex flex-col divide-y divide-line rounded-inset bg-surface px-3">
                {places.slice(0, GAMES_SHOWN).map((p) => {
                  const GameIcon = ICONS[p.id] ?? Play;
                  return (
                    <li key={p.id} className="flex min-h-12 items-center gap-3 py-1.5">
                      <GameIcon size={20} className="shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{GAMES[p.id].name}</span>
                      <span className="flex shrink-0 items-center gap-1 text-sm text-fg-muted">
                        {p.place === 1 ? <Crown size={14} weight="fill" className="text-gold" aria-label="1. miejsce" /> : `${p.place}.`} z {p.of}
                      </span>
                      <span className="shrink-0 text-right font-mono text-sm whitespace-nowrap tabular-nums">{formatBest(p.id, p.best)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {profile.rivals.length > 0 && (
            <section className="flex flex-col gap-1" aria-labelledby="profile-rivals">
              <h2 id="profile-rivals" className="flex justify-between gap-3 text-sm text-fg-muted">
                Z kim gra
                <span className="text-xs">wyżej : niżej</span>
              </h2>
              <ul className="flex flex-col divide-y divide-line rounded-inset bg-surface px-3">
                {profile.rivals.map((r) => (
                  <li key={r.key}>
                    <button type="button" className="flex min-h-12 w-full items-center gap-3 py-1.5 text-left" onClick={() => onOpen(r.nick)}>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate">{r.nick}</span>
                        <span className="text-xs text-fg-muted">
                          {matchesWord(r.matches)}
                          {r.ties > 0 && ` · ${plural(r.ties, "remis", "remisy", "remisów")}`}
                        </span>
                      </span>
                      <span role="img" className="font-mono font-semibold tabular-nums" aria-label={`${r.wins} razy wyżej, ${r.losses} razy niżej`}>
                        {r.wins} : {r.losses}
                      </span>
                      <CaretRight size={14} className="shrink-0 text-fg-muted" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {history.length > 0 && (
            <section className="flex flex-col gap-1" aria-labelledby="profile-history">
              <h2 id="profile-history" className="text-sm text-fg-muted">
                Historia
              </h2>
              <ol className="flex flex-col divide-y divide-line rounded-inset bg-surface px-3">
                {history.map((m) => {
                  const GameIcon = ICONS[m.gameId] ?? Play;
                  const result = resultOf(m, formatBest);
                  return (
                    <li key={m.id} className="flex min-h-12 items-center gap-3 py-1.5">
                      <GameIcon size={20} className="shrink-0" aria-hidden />
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate">{GAMES[m.gameId]?.name ?? m.gameId}</span>
                        <span className="truncate text-xs text-fg-muted">{historyLine(m, shownNick)}</span>
                      </span>
                      <span className={`flex shrink-0 items-center gap-1 text-sm ${result.muted ? "text-fg-muted" : "font-semibold"}`}>
                        {result.crown && <Crown size={14} weight="fill" className="text-gold" aria-hidden />}
                        <span className={result.mono ? "font-mono tabular-nums" : ""}>{result.text}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              {more && (
                <button type="button" className="btn btn-ghost w-full" disabled={loading} onClick={older}>
                  {loading ? "Wczytywanie…" : "Pokaż starsze"}
                </button>
              )}
            </section>
          )}
        </>
      )}
    </Screen>
  );
}

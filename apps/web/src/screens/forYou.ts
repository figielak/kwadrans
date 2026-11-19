import { compareRecords, nickKey, type RecordOrder, type RecordRow } from "@kwadrans/games";

/** Powód karty „Dla was teraz”: ktoś nie grał, ktoś prowadzi niewiele, gra spoza tego wieczoru. */
export type ForYouReason = { kind: "new"; nick: string } | { kind: "lead"; nick: string; gap: number; onTie: boolean } | { kind: "fresh" };

interface Input {
  /** Obecni w pokoju, w kolejności z widoku. */
  nicks: string[];
  /** Gry rozegrane tego wieczoru (`evening.played`). */
  played: string[];
  /** Bieżąca (wybrana) gra; nie wraca jako propozycja. */
  current: string | null;
  /** Mini-gry w kolejności listy. */
  ids: string[];
  orders: Record<string, RecordOrder>;
  records: Record<string, RecordRow[]>;
}

/**
 * Do 3 gier dla stołu: najpierw jedna „nowa dla …” (najwięcej wyników przy stole, ktoś bez wyniku), potem jedno prowadzenie
 * o najmniejszej względnej różnicy między dwiema najlepszymi obecnymi osobami, potem gry spoza wieczoru; brakujące miejsca dopełnia reszta.
 * Deterministycznie, bez powtórek i bez bieżącej gry. Mniej niż dwie osoby: nic.
 */
export function forYouNow({ nicks, played, current, ids, orders, records }: Input): { gameId: string; reason: ForYouReason }[] {
  if (nicks.length < 2) return [];
  const keys = nicks.map(nickKey);
  const games = ids.filter((id) => id !== current && orders[id]);
  const present = (id: string) => (records[id] ?? []).filter((r) => keys.includes(nickKey(r.nick)));

  const news = games
    .map((id) => {
      const rows = present(id);
      const missing = nicks.find((n) => !rows.some((r) => nickKey(r.nick) === nickKey(n)));
      return { id, count: rows.length, missing };
    })
    .filter((g) => g.count > 0 && g.missing)
    .sort((a, b) => b.count - a.count)
    .map((g) => ({ gameId: g.id, reason: { kind: "new", nick: g.missing! } as ForYouReason }));

  const leads = games
    .flatMap((id) => {
      const [first, second] = [...present(id)].sort(compareRecords(orders[id]));
      if (!second) return [];
      const gap = Math.abs(first.best - second.best);
      if (gap > 0) return [{ id, nick: first.nick, gap, onTie: false, relative: gap / Math.max(Math.abs(first.best), Math.abs(second.best), 1) }];
      if (first.tie === null || second.tie === null || first.tie === second.tie) return [];
      return [{ id, nick: first.nick, gap: Math.abs(first.tie - second.tie), onTie: true, relative: 0 }];
    })
    .sort((a, b) => a.relative - b.relative)
    .map((l) => ({ gameId: l.id, reason: { kind: "lead", nick: l.nick, gap: l.gap, onTie: l.onTie } as ForYouReason }));

  const fresh = games.filter((id) => !played.includes(id)).map((id) => ({ gameId: id, reason: { kind: "fresh" } as ForYouReason }));

  const out: { gameId: string; reason: ForYouReason }[] = [];
  for (const pick of [news[0], leads[0], ...fresh, ...news.slice(1), ...leads.slice(1)]) {
    if (pick && out.length < 3 && !out.some((o) => o.gameId === pick.gameId)) out.push(pick);
  }
  return out;
}

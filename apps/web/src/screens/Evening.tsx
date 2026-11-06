import { Check, ShareNetwork, Trophy } from "@phosphor-icons/react";
import type { RoomView } from "@kwadrans/games";
import { useState } from "react";
import { champions, shareText } from "./evening.ts";
import { EveningTable, Screen } from "./ui.tsx";

/**
 * Zakończenie wieczoru po własnym wyjściu z pokoju: mistrz, tabela, tytuły i krótki tekst do udostępnienia.
 * Pokój już nie istnieje, więc to tylko ostatni widok trzymany w `App`.
 */
export function Evening({ evening, meKey, onDone }: { evening: RoomView["evening"]; meKey: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const top = champions(evening);
  const text = shareText(evening);
  // Bez navigator.share przycisk kopiuje; bez schowka znika.
  const canShare = typeof navigator !== "undefined" && (!!navigator.share || !!navigator.clipboard);

  async function share() {
    if (navigator.share) {
      // Anulowanie arkusza udostępniania to nie błąd.
      await navigator.share({ title: "Kwadrans", text }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Screen dropped={false}>
      <section className="tile flex flex-col items-center gap-1 py-6 text-center">
        <Trophy size={32} weight="fill" aria-hidden />
        <h1 className="label">Koniec wieczoru</h1>
        <p className="text-2xl font-semibold break-words">{top.length === 1 ? top[0].nick : top.map((row) => row.nick).join(", ")}</p>
        <p className="text-sm text-fg-muted">{top.length === 1 ? "Mistrz wieczoru" : "Remis na szczycie"} · {top[0]?.points ?? 0} pkt</p>
      </section>

      <EveningTable evening={evening} present={evening.table.map((row) => row.key)} meKey={meKey} />

      {evening.titles.length > 0 && (
        <section className="tile" aria-label="Tytuły wieczoru">
          <h2 className="label mb-2">Tytuły</h2>
          <dl className="flex flex-col gap-2">
            {evening.titles.map((t) => (
              <div key={t.title} className="flex items-baseline justify-between gap-3">
                <dt className="min-w-0 text-sm text-fg-muted">{t.title}</dt>
                <dd className="min-w-0 truncate text-right">
                  <span className="font-semibold">{t.nick}</span> <span className="font-mono text-sm text-fg-muted tabular-nums">{t.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {canShare && (
          <button type="button" className="btn btn-primary w-full" onClick={share}>
            {copied ? <Check size={18} weight="bold" aria-hidden /> : <ShareNetwork size={18} weight="bold" aria-hidden />}
            {copied ? "Skopiowano!" : "Udostępnij"}
          </button>
        )}
        <button type="button" className={`btn w-full ${canShare ? "btn-ghost" : "btn-primary"}`} onClick={onDone}>
          Na start
        </button>
      </div>
    </Screen>
  );
}

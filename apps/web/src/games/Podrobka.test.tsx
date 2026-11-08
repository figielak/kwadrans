import { createRng, GAMES, type LobbyPlayer, PODROBKA_ANSWER_MAX, type PodrobkaMove, type PodrobkaView } from "@kwadrans/games";
import { readFileSync } from "node:fs";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { currentDraft, DRAFT_MS, type Draft, DraftSender, draftKey, draftMove, moves, options, PodrobkaBoard, VoteSection, WriteForm } from "./Podrobka.tsx";

// Testy napisane przed ekranem. Widoki pochodzą z prawdziwego playerView po legalnych ruchach:
// - pisanie: „Runda n/6”, własne pytanie, wskazówka formatu, licznik długości i wspólny komunikat, ten sam dla Podróbki i zwykłego gracza,
// - szkic idzie na serwer ze stemplem dopiero po 500 ms, seria zmian wysyła jeden, „Gotowe” wysyła bieżący tekst i anuluje zaległy szkic,
// - klucz nonce/runda/faza: nowa runda, faza albo rewanż kasuje zaległy szkic bez wysyłki, cudze zatwierdzenie go nie rusza,
// - po przeładowaniu wraca myDraft, widok z serwera nie nadpisuje tekstu podczas pisania, po zatwierdzeniu tekst jest tylko do odczytu,
// - „Gotowe” jest nieaktywne przy pustym tekście po normalizacji, w polu jest maxLength równe ANSWER_MAX,
// - głosowanie: pytanie większości i wszystkie odpowiedzi z nickami (3 i 6 graczy, pełne teksty), wybór tylko lokalny do „Gotowe”, własny wiersz nieaktywny,
// - po głosie widać wybór z myVote i odpowiedzi, bez aktywnych akcji; wstrzymanie nie ma wyboru,
// - obserwator i obce id nie mają pola ani akcji, w pisaniu nie widzą pytań,
// - ekran nie wibruje, nie ma własnych animacji, czerwieni ani em-dashy.

const A = "p1";
const B = "p2";
const C = "p3";
const D = "p4";
const E = "p5";
const F = "p6";
const game = GAMES.podrobka;
const lobby = (id: string, nick: string, color: string): LobbyPlayer => ({ id, nick, color, connected: true, ready: false });
const COLORS = ["#3b9eff", "#ffc53d", "#46a758", "#8e7cff", "#ff8a4c", "#2dd4bf"];
const SHORT = ["Ania", "Bartek", "Celina", "Darek", "Ewa", "Filip"];
const LONG = SHORT.map((_, i) => `Szesnastoznakow${i + 1}`);
const players = (nicks: string[]) => nicks.map((nick, i) => lobby(`p${i + 1}`, nick, COLORS[i]));
const PLAYERS = players(SHORT);
const THREE = [A, B, C];
const SIX = [A, B, C, D, E, F];

type S = unknown;
const setup = (ids: string[], seed = 1) => game.setup(ids, createRng(seed)) as S;
const view = (s: S, me = "") => game.playerView(s, me) as PodrobkaView;
const apply = (s: S, player: string, move: PodrobkaMove, context?: { source: "client" | "timeout" }) => {
  expect(game.validateMove(s, player, move, context), JSON.stringify(move)).toBe(true);
  return game.applyMove(s, player, move, createRng(1)) as S;
};
const stamp = (s: S) => ({ nonce: view(s).nonce, round: view(s).round });
const write = (s: S, player: string, answer: string, done = true) => apply(s, player, { type: "write", ...stamp(s), answer, done });
const answerOf = (id: string) => `Odpowiedź gracza ${id}`;
/** Dokładnie 30 jednostek UTF-16: pełna odpowiedź musi być widoczna bez ucinania. */
const longAnswer = (id: string) => `Odpowiedź ${id} `.padEnd(PODROBKA_ANSWER_MAX, "a");
const writeAll = (s: S, answer: (id: string) => string = answerOf) => game.waitingFor(s).reduce((acc, p) => write(acc, p, answer(p)), s);
/** Domyślnie każdy głosuje na następną osobę w kolejności. */
const voteAll = (s: S, votes: Record<string, string> = {}) =>
  game.waitingFor(s).reduce((acc, p) => {
    const ids = view(acc).players;
    return apply(acc, p, { type: "vote", ...stamp(acc), target: votes[p] ?? ids[(ids.indexOf(p) + 1) % ids.length] });
  }, s);
const nextAll = (s: S) => game.waitingFor(s).reduce((acc, p) => apply(acc, p, { type: "next", ...stamp(acc) }), s);
const impostorOf = (s: S) => (s as { deals: { impostor: string }[] }).deals[view(s).round].impostor;
const dealOf = (s: S) => (s as { deals: { majority: string; other: string }[] }).deals[view(s).round];

type Seats = LobbyPlayer[];
function html(s: S, me: string, draft: Draft = {}, seats: Seats = PLAYERS, v: PodrobkaView = view(s, me)) {
  return renderToStaticMarkup(
    <PodrobkaBoard view={v} me={me} players={seats} waitingFor={game.waitingFor(s)} onMove={() => {}} draft={draft} onDraft={() => {}} onText={() => {}} />,
  );
}
const text = (markup: string) => markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
const buttons = (markup: string) => markup.match(/<button[^>]*>.*?<\/button>/g) ?? [];
const enabled = (markup: string) => buttons(markup).filter((b) => !/^<button[^>]*\sdisabled=/.test(b));
const buttonWith = (markup: string, label: string) => buttons(markup).find((b) => text(b).includes(label));
const row = (markup: string, id: string) => markup.match(new RegExp(`<li[^>]*data-player="${id}"[^>]*>.*?</li>`))?.[0] ?? "";

type Props = { view: PodrobkaView; me: string; players: LobbyPlayer[]; waitingFor: string[]; color: string; draft: Draft; onDraft: (d: Draft) => void; onText: (t: string) => void; onMove: (m: PodrobkaMove) => void };
function props(s: S, me: string, draft: Draft = {}, seats: Seats = PLAYERS): Props {
  return { view: view(s, me), me, players: seats, waitingFor: game.waitingFor(s), color: seats.find((p) => p.id === me)?.color ?? "#ffffff", draft, onDraft: vi.fn(), onText: vi.fn(), onMove: vi.fn() };
}

// Pierwsza runda do pisania: round 0. Druga: po pełnej rundzie, round 1.
/** Pierwsze ziarno, dla którego pierwsza runda spełnia warunek; z State czytamy tylko deals[round]. */
function seedWhere(ids: string[], condition: (s: S) => boolean) {
  for (let seed = 1; seed < 500; seed++) if (condition(setup(ids, seed))) return seed;
  throw new Error("brak ziarna");
}
const writing = (ids = THREE, seed = 1) => setup(ids, seed);
const voting = (ids = THREE, seed = 1, answer = answerOf) => writeAll(setup(ids, seed), answer);
const secondRound = (ids = THREE) => nextAll(voteAll(writeAll(setup(ids))));

describe("pisanie", () => {
  test("pokazuje rundę, własne pytanie, wskazówkę formatu, licznik i wspólny komunikat", () => {
    const s = secondRound();
    const v = view(s, B);
    expect(v.round).toBe(1);
    const seen = text(html(s, B));
    expect(seen).toContain("Runda 2/6");
    expect(seen).toContain(v.myQuestion!);
    expect(seen).toContain(`Format odpowiedzi: ${v.hint}`);
    expect(seen).toContain("Odpowiedz na swoje pytanie. Jedna osoba dostała inne.");
    expect(seen).toContain(`0/${PODROBKA_ANSWER_MAX}`);
    expect(seen).toContain("Po czasie liczy się ostatni zapisany tekst.");
    expect(text(html(s, B, { text: "Mleko" }))).toContain(`5/${PODROBKA_ANSWER_MAX}`);
  });

  test("pole ma etykietę i maxLength równe ANSWER_MAX", () => {
    const markup = html(writing(), A);
    expect(markup).toMatch(new RegExp(`<input[^>]*maxLength="${PODROBKA_ANSWER_MAX}"`));
    const id = markup.match(/<input[^>]*\sid="([^"]+)"/)![1];
    expect(markup).toMatch(new RegExp(`<label[^>]*for="${id}"[^>]*>[^<]*odpowied`, "i"));
  });

  test("Podróbka i zwykły gracz mają ten sam układ i te same komunikaty: ekran nie zdradza roli", () => {
    // Ten sam gracz p1 raz jako Podróbka, raz jako zwykły: rola zmienia tylko to, które z dwóch pytań stoi w którym miejscu.
    const asFake = setup(THREE, seedWhere(THREE, (s) => impostorOf(s) === A));
    const asReal = setup(THREE, seedWhere(THREE, (s) => impostorOf(s) !== A));
    const same = PLAYERS.map((p) => ({ ...p, color: "#3b9eff" }));
    const mask = (s: S, markup: string) =>
      markup.replaceAll(dealOf(s).majority, "PYTANIE").replaceAll(dealOf(s).other, "PYTANIE").replaceAll(view(s, A).hint!, "WSKAZÓWKA");
    expect(view(asFake, A).myQuestion).toBe(dealOf(asFake).other);
    expect(view(asReal, A).myQuestion).toBe(dealOf(asReal).majority);
    expect(mask(asFake, html(asFake, A, {}, same))).toBe(mask(asReal, html(asReal, A, {}, same)));
    expect(mask(asFake, html(writeAll(asFake), A, {}, same))).toBe(mask(asReal, html(writeAll(asReal), A, {}, same)));
  });

  test("zmiana tekstu wysyła szkic ze stemplem dopiero po 500 ms", () => {
    vi.useFakeTimers();
    const s = writing();
    const send = vi.fn();
    const sender = new DraftSender(send);
    sender.change(draftMove(view(s, A), "Mle"));
    vi.advanceTimersByTime(DRAFT_MS - 1);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ type: "write", ...stamp(s), answer: "Mle", done: false });
    expect(game.validateMove(s, A, send.mock.calls[0][0])).toBe(true);
    expect(DRAFT_MS).toBe(500);
  });

  test("seria zmian wysyła jeden szkic z ostatnim tekstem", () => {
    vi.useFakeTimers();
    const s = writing();
    const send = vi.fn();
    const sender = new DraftSender(send);
    for (const part of ["M", "Ml", "Mle", "Mlek", "Mleko"]) {
      sender.change(draftMove(view(s, A), part));
      vi.advanceTimersByTime(100);
    }
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(DRAFT_MS);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ answer: "Mleko", done: false });
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test("„Gotowe” wysyła done z bieżącym tekstem, nie czeka na szkic i anuluje zaległy", () => {
    vi.useFakeTimers();
    const s = writing();
    const send = vi.fn();
    const sender = new DraftSender(send);
    sender.change(draftMove(view(s, A), "Mle"));
    const form = WriteForm({ ...props(s, A, { text: "Mleko" }), onMove: (m) => sender.now(m) });
    findAll(form, "form")[0].props.onSubmit({ preventDefault() {} });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ type: "write", ...stamp(s), answer: "Mleko", done: true });
    expect(game.validateMove(s, A, send.mock.calls[0][0])).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test("przycisk „Gotowe” jest przyciskiem wysyłającym formularz", () => {
    const s = writing();
    const [done] = findAll(WriteForm(props(s, A, { text: "Mleko" })), "button");
    expect(done.props.type).toBe("submit");
    expect(done.props.disabled).toBeFalsy();
  });

  test.each([["pusty", ""], ["z samych spacji", "  \t "]])("„Gotowe” jest nieaktywne przy tekście %s, a formularz nic nie wysyła", (_, input) => {
    const s = writing();
    expect(moves(view(s, A), { text: input }).done).toBeNull();
    const markup = html(s, A, { text: input });
    expect(buttonWith(markup, "Gotowe")).toMatch(/\sdisabled=/);
    expect(enabled(markup)).toHaveLength(0);
    const p = props(s, A, { text: input });
    findAll(WriteForm(p), "form")[0].props.onSubmit({ preventDefault() {} });
    expect(p.onMove).not.toHaveBeenCalled();
  });

  test("z tekstem „Gotowe” jest aktywne, a ruch ma surowy tekst, bo normalizuje serwer", () => {
    const s = writing();
    const move = moves(view(s, A), { text: "  Ala   ma\tkota " }).done!;
    expect(move).toEqual({ type: "write", ...stamp(s), answer: "  Ala   ma\tkota ", done: true });
    expect(game.validateMove(s, A, move)).toBe(true);
    expect(enabled(html(s, A, { text: "Ala" }))).toHaveLength(1);
  });

  test("zmiana tekstu w polu idzie przez onText, bez wysyłki ruchu", () => {
    const s = writing();
    const p = props(s, A);
    findAll(WriteForm(p), "input")[0].props.onChange({ target: { value: "Mleko" } });
    expect(p.onText).toHaveBeenCalledWith("Mleko");
    expect(p.onMove).not.toHaveBeenCalled();
  });

  test("klucz szkicu zmienia nowa runda, faza i rewanż, ale nie cudze zatwierdzenie ani szkic", () => {
    const s = writing();
    const key = draftKey(view(s, A));
    expect(draftKey(view(write(s, B, "cudzy"), A))).toBe(key);
    expect(draftKey(view(write(s, B, "cudzy szkic", false), A))).toBe(key);
    const vote = writeAll(s);
    expect(draftKey(view(vote, A))).not.toBe(key);
    expect(draftKey(view(secondRound(), A))).not.toBe(draftKey(view(vote, A)));
    expect(draftKey(view(setup(THREE, 2), A))).not.toBe(key);
  });

  test("nowa runda albo faza usuwa zaległy szkic bez wysyłki, ten sam klucz go nie rusza", () => {
    vi.useFakeTimers();
    const s = writing();
    const send = vi.fn();
    const sender = new DraftSender(send);
    sender.follow(draftKey(view(s, A)));
    sender.change(draftMove(view(s, A), "Mle"));
    sender.follow(draftKey(view(s, A)));
    vi.advanceTimersByTime(DRAFT_MS);
    expect(send).toHaveBeenCalledTimes(1);

    sender.change(draftMove(view(s, A), "Mleko"));
    sender.follow(draftKey(view(writeAll(s), A)));
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenCalledTimes(1);

    sender.change(draftMove(view(voting(), A), "x"));
    sender.cancel();
    vi.advanceTimersByTime(5000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  test("lokalny stan jest związany z kluczem: po zmianie klucza wraca pusty szkic", () => {
    const s = writing();
    const stored = { key: draftKey(view(s, A)), draft: { text: "Mleko" } };
    expect(currentDraft(stored, view(s, A))).toEqual({ text: "Mleko" });
    expect(currentDraft(stored, view(writeAll(s), A))).toEqual({});
    expect(currentDraft(stored, view(setup(THREE, 2), A))).toEqual({});
  });

  test("po przeładowaniu wraca myDraft, a widok z serwera nie nadpisuje tekstu podczas pisania", () => {
    const s = write(writing(), A, "Mleko", false);
    const v = view(s, A);
    expect(v.myDraft).toBe("Mleko");
    expect(currentDraft({ key: "", draft: { text: "stary" } }, v)).toEqual({});
    const reloaded = html(s, A, {});
    expect(reloaded).toMatch(/<input[^>]*value="Mleko"/);
    expect(text(reloaded)).toContain(`5/${PODROBKA_ANSWER_MAX}`);
    expect(enabled(reloaded)).toHaveLength(1);
    // Serwer ma starszy szkic (Mleko), a gracz dopisał dalej: zostaje to, co wpisał.
    expect(html(s, A, { text: "Mleko z miodem" })).toMatch(/<input[^>]*value="Mleko z miodem"/);
  });

  test("po zatwierdzeniu własny tekst i pytanie są czytelne, bez pola i akcji", () => {
    const s = write(writing(), A, "  Ala   ma kota ");
    const v = view(s, A);
    const markup = html(s, A);
    expect(markup).not.toContain("<input");
    expect(enabled(markup)).toHaveLength(0);
    expect(text(markup)).toContain(v.myQuestion!);
    expect(text(markup)).toContain("Ala ma kota");
    expect(text(markup)).toContain("Runda 1/6");
    expect(markup).not.toContain("Odpowiedz na swoje pytanie");
    // Gracz, który jeszcze pisze, nadal ma pole.
    expect(html(s, B)).toContain("<input");
  });

  test.each([["obserwator", ""], ["obce id", "ktos-obcy"]])("%s w pisaniu nie ma pola ani akcji i nie widzi pytań", (_, id) => {
    const s = write(writing(), A, "Tajna odpowiedź");
    const { majority, other } = dealOf(s);
    const markup = html(s, id);
    expect(markup).not.toContain("<input");
    expect(buttons(markup)).toHaveLength(0);
    expect(text(markup)).toContain("Oglądasz");
    expect(text(markup)).toContain("Runda 1/6");
    for (const hidden of [majority, other, "Tajna odpowiedź"]) expect(markup).not.toContain(hidden);
  });

  test("options: kto pisze, kto już zatwierdził, kto tylko ogląda", () => {
    const s = write(writing(), A, "x");
    const waiting = game.waitingFor(s);
    expect(options(view(s, A), A, waiting)).toMatchObject({ seated: true, writing: false, written: true });
    expect(options(view(s, B), B, waiting)).toMatchObject({ seated: true, writing: true, written: false });
    expect(options(view(s, ""), "", waiting)).toMatchObject({ seated: false, writing: false, written: false, voting: false });
  });
});

describe("głosowanie", () => {
  test.each([[THREE, SHORT], [SIX, LONG]])("pokazuje pytanie większości i wszystkie odpowiedzi z nickami w pełnym brzmieniu (%j)", (ids, nicks) => {
    const seats = players(nicks);
    const s = voting(ids, 3, longAnswer);
    const markup = html(s, ids[0], {}, seats);
    expect(text(markup)).toContain("Runda 1/6");
    expect(text(markup)).toContain(view(s, ids[0]).majorityQuestion!);
    for (const [i, id] of ids.entries()) {
      expect(longAnswer(id)).toHaveLength(PODROBKA_ANSWER_MAX);
      const r = row(markup, id);
      expect(text(r)).toContain(nicks[i]);
      expect(text(r)).toContain(longAnswer(id));
      expect(r).not.toMatch(/truncate|line-clamp|text-ellipsis/);
    }
  });

  test("własne wcześniejsze pytanie jest w rozwijanym szczególe, z prośbą o obronę odpowiedzi", () => {
    const s = voting(THREE, 2);
    const fake = impostorOf(s);
    const real = THREE.find((id) => id !== fake)!;
    for (const id of [fake, real]) {
      const markup = html(s, id);
      const details = markup.match(/<details.*?<\/details>/)![0];
      expect(text(details)).toContain("Twoje pytanie");
      expect(text(details)).toContain(view(s, id).myQuestion!);
      expect(text(markup)).toMatch(/broń odpowiedzi/);
      expect(text(markup)).toMatch(/nie cytuj/);
    }
    expect(view(s, fake).myQuestion).toBe(dealOf(s).other);
    expect(text(html(s, fake))).toContain(dealOf(s).majority);
  });

  test("dotknięcie cudzego wiersza tylko zmienia lokalny wybór, bez wysyłki", () => {
    const s = voting();
    const p = props(s, A);
    const rows = findAll(VoteSection(p), "button").filter((b) => b.props["data-vote"]);
    expect(rows.map((b) => b.props["data-vote"])).toEqual([A, B, C]);
    const pick = rows.find((b) => b.props["data-vote"] === B)!;
    pick.props.onClick();
    expect(p.onDraft).toHaveBeenCalledWith({ pick: B });
    expect(p.onMove).not.toHaveBeenCalled();
  });

  test("wybrany wiersz ma aria-pressed, obrys w kolorze gracza i znaczek, pozostałe nie", () => {
    const s = voting();
    const markup = html(s, A, { pick: B });
    expect(row(markup, B)).toMatch(/aria-pressed="true"/);
    expect(row(markup, B)).toContain(COLORS[0]);
    expect(row(markup, B)).toMatch(/<svg/);
    expect(row(markup, C)).toMatch(/aria-pressed="false"/);
    expect(row(markup, C)).not.toContain(COLORS[0]);
    expect(html(s, A, {})).not.toContain('aria-pressed="true"');
  });

  test("własny wiersz jest nieaktywny i ma wyjaśnienie", () => {
    const s = voting();
    const own = findAll(VoteSection(props(s, A)), "button").find((b) => b.props["data-vote"] === A)!;
    expect(own.props.disabled).toBe(true);
    const markup = html(s, A, { pick: A });
    expect(row(markup, A)).toMatch(/\sdisabled=/);
    expect(text(row(markup, A))).toContain("Nie można głosować na siebie");
    expect(row(markup, A)).not.toContain('aria-pressed="true"');
    expect(moves(view(s, A), { pick: A }, A).vote).toBeNull();
  });

  test("„Gotowe” jest nieaktywne bez wyboru, a z wyborem wysyła vote ze stemplem", () => {
    const s = voting();
    expect(buttonWith(html(s, A), "Gotowe")).toMatch(/\sdisabled=/);
    expect(moves(view(s, A), {}).vote).toBeNull();
    const p = props(s, A, { pick: B });
    const done = findAll(VoteSection(p), "button").at(-1)!;
    expect(done.props.disabled).toBeFalsy();
    done.props.onClick();
    expect(p.onMove).toHaveBeenCalledWith({ type: "vote", ...stamp(s), target: B });
    expect(game.validateMove(s, A, (p.onMove as ReturnType<typeof vi.fn>).mock.calls[0][0])).toBe(true);
    expect(text(html(s, A))).toContain("Bez Gotowe po czasie nie ma głosu.");
  });

  test("po głosie wybór jest widoczny z myVote, odpowiedzi zostają i nie ma aktywnych akcji", () => {
    const s = apply(voting(), A, { type: "vote", ...stamp(voting()), target: B });
    const v = view(s, A);
    expect(v.myVote).toBe(B);
    const markup = html(s, A);
    expect(row(markup, B)).toMatch(/aria-pressed="true"/);
    expect(enabled(markup)).toHaveLength(0);
    expect(text(markup)).toContain("Zatwierdzone: głos na Bartek");
    for (const id of THREE) expect(text(row(markup, id))).toContain(answerOf(id));
    // Pozostali nadal głosują, a cudzego głosu nie widać.
    const other = html(s, C);
    expect(enabled(other).length).toBeGreaterThan(0);
    expect(other).not.toContain('aria-pressed="true"');
    expect(text(other)).not.toContain("Zatwierdzone");
  });

  test("wstrzymanie po czasie nie ma wybranego wiersza i też nie ma akcji", () => {
    const base = voting();
    const s = apply(base, A, { type: "vote", ...stamp(base), target: null }, { source: "timeout" });
    expect(view(s, A).myVote).toBeNull();
    expect(view(s, A).voted).toContain(A);
    const markup = html(s, A);
    expect(markup).not.toContain('aria-pressed="true"');
    expect(enabled(markup)).toHaveLength(0);
    expect(text(markup)).toContain("Bez głosu");
  });

  test.each([["obserwator", ""], ["obce id", "ktos-obcy"]])("%s w głosowaniu widzi pytanie i odpowiedzi, bez akcji i bez głosów", (_, id) => {
    const base = voting();
    const s = apply(base, A, { type: "vote", ...stamp(base), target: B });
    const markup = html(s, id);
    expect(buttons(markup)).toHaveLength(0);
    expect(markup).not.toContain("<input");
    expect(markup).not.toContain('aria-pressed="true"');
    expect(markup).not.toContain("Zatwierdzone");
    expect(text(markup)).toContain(dealOf(s).majority);
    expect(markup).not.toContain(dealOf(s).other);
    for (const p of THREE) expect(text(row(markup, p))).toContain(answerOf(p));
  });

  test("options: kto głosuje, kto zagłosował", () => {
    const base = voting();
    const s = apply(base, A, { type: "vote", ...stamp(base), target: B });
    const waiting = game.waitingFor(s);
    expect(options(view(s, A), A, waiting)).toMatchObject({ voting: false, voted: true });
    expect(options(view(s, B), B, waiting)).toMatchObject({ voting: true, voted: false });
    expect(options(view(s, ""), "", waiting)).toMatchObject({ voting: false, voted: false });
  });
});

describe("odsłona i koniec", () => {
  test("do czasu ekranu odsłony nie ma akcji, a nagłówek rundy zostaje", () => {
    const s = voteAll(voting());
    expect(view(s, A).phase).toBe("summary");
    const markup = html(s, A);
    expect(text(markup)).toContain("Runda 1/6");
    expect(enabled(markup)).toHaveLength(0);
  });
});

describe("zasady wyglądu", () => {
  const source = readFileSync(new URL("./Podrobka.tsx", import.meta.url), "utf8");

  test("ekran nie wibruje sam, nie ma własnych animacji, czerwieni ani em-dashy", () => {
    expect(source).not.toContain("vibrate");
    expect(source).not.toContain("animate-[");
    expect(source).not.toMatch(/\b(?:text|bg|border)-red/);
    expect(source).not.toContain("—");
  });

  test("akcje mają co najmniej 48 px i wspólną klasę akcji gracza", () => {
    const markup = html(voting(), A, { pick: B });
    for (const b of buttons(markup)) expect(b, b).toMatch(/min-h-12|btn/);
    expect(buttonWith(markup, "Gotowe")).toContain("btn-player");
  });
});

beforeEach(() => {
  vi.useRealTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

type Found = ReactElement<{ onClick: () => void; onSubmit: (e: { preventDefault: () => void }) => void; onChange: (e: { target: { value: string } }) => void; disabled?: boolean; type?: string; children?: ReactNode; [key: string]: unknown }>;
function findAll(node: ReactNode, type: string): Found[] {
  if (Array.isArray(node)) return node.flatMap((n) => findAll(n, type));
  if (!isValidElement<{ children?: ReactNode }>(node)) return [];
  const own = node.type === type ? [node as Found] : [];
  return [...own, ...findAll(node.props.children, type)];
}

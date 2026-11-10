import { createRng, GAMES, type LobbyPlayer, PODROBKA_ANSWER_MAX, type PodrobkaMove, type PodrobkaView } from "@kwadrans/games";
import { readFileSync } from "node:fs";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { COUNTER_FROM, currentDraft, DRAFT_MS, EMPTY_WARN_SECONDS, type Draft, DraftSender, draftKey, draftMove, moves, NextBar, options, PodrobkaBoard, RoundReveal, verdict, VoteSection, WriteForm } from "./Podrobka.tsx";

// Testy napisane przed ekranem. Widoki pochodzą z prawdziwego playerView po legalnych ruchach:
// - pisanie: „Runda n/6”, własne pytanie, wskazówka formatu, licznik długości i wspólny komunikat, ten sam dla Podróbki i zwykłego gracza,
// - szkic idzie na serwer ze stemplem dopiero po 500 ms, seria zmian wysyła jeden, „Gotowe” wysyła bieżący tekst i anuluje zaległy szkic,
// - klucz nonce/runda/faza: nowa runda, faza albo rewanż kasuje zaległy szkic bez wysyłki, cudze zatwierdzenie go nie rusza,
// - po przeładowaniu wraca myDraft, widok z serwera nie nadpisuje tekstu podczas pisania, po zatwierdzeniu tekst jest tylko do odczytu,
// - „Gotowe” jest nieaktywne przy pustym tekście po normalizacji, w polu jest maxLength równe ANSWER_MAX,
// - głosowanie: pytanie większości i wszystkie odpowiedzi z nickami (3 i 6 graczy, pełne teksty), wybór tylko lokalny do „Gotowe”, własny wiersz nieaktywny,
// - po głosie widać wybór z myVote i odpowiedzi, bez aktywnych akcji; wstrzymanie nie ma wyboru,
// - obserwator i obce id nie mają pola ani akcji, w pisaniu nie widzą pytań,
// - odsłona: oba pytania, kto miał inne, wszystkie odpowiedzi i głosy, przyrost punktów i sumy, wszystko ze stanu widoku (także dla obserwatora),
// - uzasadnienie wyniku jest inne dla wykrycia, remisu na prowadzeniu, niewinnego lidera, pojedynczego głosu i wstrzymań, anulowana runda ma powód z nickami,
// - „Dalej” wysyła next ze stemplem i znika po kliknięciu, obserwator go nie ma, w widoku nie ma przyszłych par,
// - koniec: ranking ze wspólnymi miejscami przy remisie, tabela sześciu rund z oznaczeniem anulowanych, odsłona szóstej rundy i rozwijana historia, bez „Dalej”,
// - animacje tylko card-in i float-up i tylko dla nowego stanu, zastany stan stoi od razu,
// - ekran nie wibruje, nie ma innych animacji, czerwieni ani em-dashy.

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
const FOUR = [A, B, C, D];
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
function seedWhere(ids: string[], condition: (s: S) => boolean, limit = 500) {
  for (let seed = 1; seed < limit; seed++) if (condition(setup(ids, seed))) return seed;
  throw new Error("brak ziarna");
}
const writing = (ids = THREE, seed = 1) => setup(ids, seed);
const voting = (ids = THREE, seed = 1, answer = answerOf) => writeAll(setup(ids, seed), answer);
const secondRound = (ids = THREE) => nextAll(voteAll(writeAll(setup(ids))));

describe("pisanie", () => {
  const writeForm = (s: S, me: string, draft: Draft, secondsLeft: number | null) =>
    renderToStaticMarkup(<WriteForm view={view(s, me)} color="#3b9eff" draft={draft} onText={() => {}} onMove={() => {}} secondsLeft={secondsLeft} />);

  test("puste pole pod koniec czasu ostrzega, że runda przepadnie; z tekstem albo wcześniej nie", () => {
    const s = writing();
    expect(text(writeForm(s, A, {}, EMPTY_WARN_SECONDS))).toContain("Bez odpowiedzi runda przepada dla wszystkich");
    expect(text(writeForm(s, A, { text: "  " }, 3))).toContain("Bez odpowiedzi runda przepada dla wszystkich");
    expect(text(writeForm(s, A, { text: "Mleko" }, 3))).not.toContain("przepada");
    expect(text(writeForm(s, A, {}, EMPTY_WARN_SECONDS + 1))).not.toContain("przepada");
    expect(text(writeForm(s, A, {}, null))).not.toContain("przepada");
  });

  test("z otwartą klawiaturą „Gotowe” stoi zaraz pod polem, bez paska przyklejonego do dołu, a komunikat znika", () => {
    const s = writing();
    const form = (keyboard: boolean) =>
      renderToStaticMarkup(<WriteForm view={view(s, A)} color="#3b9eff" draft={{ text: "Mleko" }} onText={() => {}} onMove={() => {}} keyboard={keyboard} />);
    expect(form(false)).toContain("sticky");
    expect(form(true)).not.toContain("sticky");
    expect(form(true)).toMatch(/<p class="[^"]*hidden[^"]*">Odpowiedz na swoje pytanie/);
    expect(buttons(form(true)).find((b) => text(b).includes("Gotowe"))).not.toMatch(/\sdisabled=/);
  });

  test("nagłówek rundy pokazuje, ile osób już odpowiedziało, także obserwatorowi", () => {
    const s = write(writing(), A, "Mleko");
    expect(text(html(s, B))).toContain(`Odpowiedzi: 1 / ${view(s).players.length}`);
    expect(text(html(s, ""))).toContain(`Odpowiedzi: 1 / ${view(s).players.length}`);
  });

  test("pokazuje rundę, własne pytanie, wskazówkę formatu, licznik i wspólny komunikat", () => {
    const s = secondRound();
    const v = view(s, B);
    expect(v.round).toBe(1);
    const seen = text(html(s, B));
    expect(seen).toContain("Runda 2/6");
    expect(seen).toContain(v.myQuestion!);
    expect(seen).toContain(`Format odpowiedzi: ${v.hint}`);
    expect(seen).toContain("Odpowiedz na swoje pytanie. Jedna osoba dostała inne.");
    // Licznik dopiero od COUNTER_FROM znaków; krótka odpowiedź go nie potrzebuje.
    expect(seen).not.toContain(`0/${PODROBKA_ANSWER_MAX}`);
    expect(text(html(s, B, { text: "Mleko" }))).not.toContain(`5/${PODROBKA_ANSWER_MAX}`);
    const long = "a".repeat(COUNTER_FROM);
    expect(text(html(s, B, { text: long }))).toContain(`${COUNTER_FROM}/${PODROBKA_ANSWER_MAX}`);
    expect(seen).toContain("Nie zdążysz? Liczy się to, co już wpisane.");
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

/** Głosowanie z wstrzymaniami: null to ruch zegara. */
const voteWith = (s: S, votes: Record<string, string | null>) =>
  game.waitingFor(s).reduce(
    (acc, p) =>
      votes[p] === null
        ? apply(acc, p, { type: "vote", ...stamp(acc), target: null }, { source: "timeout" })
        : apply(acc, p, { type: "vote", ...stamp(acc), target: votes[p] }),
    s,
  );
/** Rundy bez odpowiedzi na samym zegarze: anulowane, bez punktów. */
const cancelRound = (s: S) => game.waitingFor(s).reduce((acc, p) => apply(acc, p, { type: "write", ...stamp(acc), answer: "", done: true }, { source: "timeout" }), s);
const allCancelled = (ids = THREE) => {
  let s = setup(ids);
  for (let i = 0; i < 6; i++) {
    s = cancelRound(s);
    if (view(s).phase === "summary") s = nextAll(s);
  }
  return s;
};
/** Podróbka p1 we wszystkich rundach i zawsze ten sam układ głosów: p1 uchodzi (3 pkt), p2 i p3 dostają 0. */
const rigged = () => {
  let s = setup(THREE, seedWhere(THREE, (st) => (st as { deals: { impostor: string }[] }).deals.every((d) => d.impostor === A), 30_000));
  for (let i = 0; i < 6; i++) {
    s = voteWith(writeAll(s), { [A]: B, [B]: C, [C]: B });
    if (view(s).phase === "summary") s = nextAll(s);
  }
  return s;
};
const others = (s: S, ids: string[]) => ids.filter((id) => id !== impostorOf(s));
const nickOf = (id: string) => SHORT[Number(id.slice(1)) - 1];

describe("odsłona", () => {
  test("pokazuje oba pytania, kto miał inne, wszystkie odpowiedzi i głosy, przyrost punktów i sumy", () => {
    const base = voting(THREE, 4);
    const imp = impostorOf(base);
    const [o0, o1] = others(base, THREE);
    const s = voteWith(base, { [imp]: o0, [o0]: imp, [o1]: imp });
    expect(view(s).phase).toBe("summary");
    const { majority, other } = dealOf(s);
    const markup = html(s, o0);
    const seen = text(markup);
    expect(seen).toContain("Runda 1/6");
    expect(seen).toContain(majority);
    expect(seen).toContain(other);
    expect(text(row(markup, imp))).toContain("Podróbka");
    expect(text(row(markup, o0))).not.toContain("Podróbka");
    for (const id of THREE) {
      expect(text(row(markup, id))).toContain(answerOf(id));
      expect(text(row(markup, id))).toContain(nickOf(id));
    }
    expect(text(row(markup, imp))).toContain(`Głos: ${nickOf(o0)}`);
    expect(text(row(markup, o0))).toContain(`Głos: ${nickOf(imp)}`);
    expect(text(row(markup, imp))).toContain("+0");
    expect(text(row(markup, o0))).toContain("+2");
    expect(text(row(markup, o1))).toContain("+2");
    for (const id of THREE) expect(text(row(markup, id))).toContain(`suma ${view(s).totals[id]}`);
  });

  test("obserwator i obce id widzą tę samą odsłonę, bez „Dalej”", () => {
    const base = voting(THREE, 4);
    const s = voteWith(base, { [A]: B, [B]: C, [C]: A });
    for (const id of ["", "ktos-obcy"]) {
      const markup = html(s, id);
      expect(text(markup)).toContain(dealOf(s).majority);
      expect(text(markup)).toContain(dealOf(s).other);
      for (const p of THREE) expect(text(row(markup, p))).toContain(answerOf(p));
      expect(buttons(markup)).toHaveLength(0);
      expect(text(markup)).not.toContain("Dalej");
    }
  });

  type Scene = {
    name: string;
    ids: string[];
    votes: (imp: string, o: string[]) => Record<string, string | null>;
    marker: RegExp;
    gain: (imp: string, o: string[]) => Record<string, number>;
  };
  const SCENES: Scene[] = [
    {
      name: "wykrycie",
      ids: THREE,
      votes: (imp, [o0, o1]) => ({ [imp]: o0, [o0]: imp, [o1]: imp }),
      marker: /Podróbka wykryta: \S+, 2 głosy/,
      gain: (imp, [o0, o1]) => ({ [imp]: 0, [o0]: 2, [o1]: 2 }),
    },
    {
      name: "remis na prowadzeniu",
      ids: FOUR,
      votes: (imp, [o0, o1, o2]) => ({ [imp]: o0, [o0]: imp, [o1]: imp, [o2]: o0 }),
      marker: /Remis na prowadzeniu \(2 głosy\)/,
      gain: (imp, [o0, o1, o2]) => ({ [imp]: 3, [o0]: 2, [o1]: 2, [o2]: 0 }),
    },
    {
      name: "niewinny lider",
      ids: FOUR,
      votes: (imp, [o0, o1, o2]) => ({ [imp]: o0, [o0]: imp, [o1]: o0, [o2]: o0 }),
      marker: /Najwięcej głosów \(3 głosy\): \S+, ale to nie Podróbka/,
      gain: (imp, [o0, o1, o2]) => ({ [imp]: 3, [o0]: 2, [o1]: 0, [o2]: 0 }),
    },
    {
      name: "pojedynczy głos",
      ids: THREE,
      votes: (imp, [o0, o1]) => ({ [imp]: null, [o0]: imp, [o1]: null }),
      marker: /Za mało głosów: najwięcej było 1, a do wykrycia trzeba co najmniej 2/,
      gain: (imp, [o0, o1]) => ({ [imp]: 0, [o0]: 2, [o1]: 0 }),
    },
    {
      name: "wszyscy wstrzymani",
      ids: THREE,
      votes: (imp, [o0, o1]) => ({ [imp]: null, [o0]: null, [o1]: null }),
      marker: /Wszyscy wstrzymali głos: nikt nie dostaje punktów/,
      gain: (imp, [o0, o1]) => ({ [imp]: 0, [o0]: 0, [o1]: 0 }),
    },
  ];
  const scene = ({ ids, votes }: Scene) => {
    const base = voting(ids, 4);
    const imp = impostorOf(base);
    const rest = others(base, ids);
    return { s: voteWith(base, votes(imp, rest)), imp, rest };
  };

  test.each(SCENES)("uzasadnienie wyniku: $name", (def) => {
    const { s, imp, rest } = scene(def);
    expect(text(html(s, rest[0]))).toMatch(def.marker);
    const expected = def.gain(imp, rest);
    const markup = html(s, rest[0]);
    for (const id of def.ids) expect(text(row(markup, id)), id).toContain(`+${expected[id]}`);
    expect(Object.fromEntries(def.ids.map((id) => [id, view(s).history[0].gain[id]]))).toEqual(expected);
  });

  test("uzasadnienia są różne i żadne nie pasuje do cudzego scenariusza", () => {
    const texts = SCENES.map((def) => text(html(scene(def).s, def.ids[0])));
    SCENES.forEach(({ marker, name }, i) => texts.forEach((t, j) => expect(marker.test(t), `${name} w scenariuszu ${SCENES[j].name}`).toBe(i === j)));
  });

  test("wstrzymanie pojedynczego gracza jest widoczne w jego wierszu i w uzasadnieniu", () => {
    const base = voting(THREE, 4);
    const imp = impostorOf(base);
    const [o0, o1] = others(base, THREE);
    const s = voteWith(base, { [imp]: o0, [o0]: imp, [o1]: null });
    const markup = html(s, o0);
    expect(text(row(markup, o1))).toContain("Wstrzymanie");
    expect(text(markup)).toContain(`Wstrzymali się: ${nickOf(o1)}`);
  });

  test("anulowana runda pokazuje powód z nickami i brak głosowania", () => {
    const base = writing(THREE, 4);
    const answered = apply(apply(base, A, { type: "write", ...stamp(base), answer: "jest", done: true }), B, { type: "write", ...stamp(base), answer: "jest", done: true });
    const cancelled = apply(answered, C, { type: "write", ...stamp(base), answer: "", done: true }, { source: "timeout" });
    expect(view(cancelled).phase).toBe("summary");
    const markup = html(cancelled, A);
    const seen = text(markup);
    expect(seen).toContain("Brak odpowiedzi: Celina");
    expect(seen).toContain("Runda anulowana");
    expect(seen).not.toContain("Głos:");
    expect(seen).not.toContain("Wstrzymanie");
    expect(text(row(markup, C))).toContain("Brak odpowiedzi");
    for (const id of THREE) expect(text(row(markup, id))).toContain("+0");
    expect(text(html(cancelRound(writing(THREE, 4)), A))).toContain("Brak odpowiedzi: Ania, Bartek, Celina");
  });

  test("verdict: czyste uzasadnienie ze stanu rundy", () => {
    const { s, imp, rest } = scene(SCENES[0]);
    const record = view(s).history[0];
    expect(verdict(record, nickOf)).toMatch(/^Podróbka wykryta: /);
    const lone = { ...record, detected: false, tally: { ...record.tally, [imp]: 1, [rest[0]]: 0, [rest[1]]: 0 } };
    expect(verdict(lone, nickOf)).toContain("Za mało głosów");
  });

  test("„Dalej” wysyła next ze stemplem, a po nim przycisk znika i widać, na kogo czekamy", () => {
    const base = voteWith(voting(THREE, 4), { [A]: B, [B]: C, [C]: A });
    const onMove = vi.fn();
    const bar = NextBar({ view: view(base, A), me: A, waitingFor: game.waitingFor(base), color: "#3b9eff", nick: nickOf, onMove });
    const [dalej] = findAll(bar, "button");
    dalej.props.onClick();
    expect(onMove).toHaveBeenCalledWith({ type: "next", ...stamp(base) });
    expect(game.validateMove(base, A, onMove.mock.calls[0][0])).toBe(true);

    const after = apply(base, A, { type: "next", ...stamp(base) });
    const mine = html(after, A);
    expect(buttonWith(mine, "Dalej")).toBeUndefined();
    expect(enabled(mine)).toHaveLength(0);
    expect(text(mine)).toContain("Czekamy na: Bartek, Celina");
    expect(buttonWith(html(after, B), "Dalej")).toBeDefined();
    expect(buttonWith(html(base, A), "Dalej")).toContain("btn-player");
  });

  test("widok w odsłonie nie zawiera przyszłych par", () => {
    const base = voteWith(voting(THREE, 4), { [A]: B, [B]: C, [C]: A });
    const deals = (base as { deals: { majority: string; other: string; pairId: string }[] }).deals;
    for (const id of [A, "", "ktos-obcy"]) {
      const json = JSON.stringify(view(base, id));
      const markup = html(base, id);
      for (const d of deals.slice(1)) {
        for (const hidden of [d.majority, d.other, d.pairId]) {
          expect(json).not.toContain(hidden);
          expect(markup).not.toContain(hidden);
        }
      }
    }
  });

  test("pełne nicki zawijają się, odpowiedzi i liczby nie są ucinane, 6 graczy", () => {
    const seats = players(LONG);
    const s = voteAll(writeAll(setup(SIX, 5), longAnswer));
    const markup = html(s, A, {}, seats);
    for (const [i, id] of SIX.entries()) {
      const r = row(markup, id);
      expect(text(r)).toContain(LONG[i]);
      expect(text(r)).toContain(longAnswer(id));
      expect(r).toContain("wrap-anywhere");
      expect(r).not.toMatch(/truncate|line-clamp|text-ellipsis/);
    }
  });

  test("animacje tylko dla nowego stanu: odsłona wchodzi kartą, własne punkty płyną, zastany stan stoi", () => {
    const { s, imp, rest } = scene(SCENES[0]);
    const me = rest[0];
    const draw = (fresh: boolean) =>
      renderToStaticMarkup(<RoundReveal view={view(s, me)} record={view(s, me).history[0]} me={me} nick={nickOf} players={PLAYERS} fresh={fresh} totals />);
    expect(draw(true)).toContain("animate-[card-in_0.35s");
    expect(draw(true)).toContain("animate-[float-up_1.6s");
    expect(draw(true).match(/animate-\[float-up/g)).toHaveLength(1);
    expect(row(draw(true), imp)).not.toContain("float-up");
    expect(draw(false)).not.toContain("animate-");
    expect(html(s, me)).not.toContain("animate-");
  });
});

describe("koniec partii", () => {
  const tableOf = (markup: string) => markup.match(/<tbody.*?<\/tbody>/)![0];
  const tableRow = (markup: string, id: string) => tableOf(markup).match(new RegExp(`<tr[^>]*data-player="${id}".*?</tr>`))![0];

  test("pokazuje ranking, tabelę sześciu rund i rozwijaną historię, bez „Dalej”, także dla obserwatora", () => {
    const s = rigged();
    expect(view(s).phase).toBe("over");
    for (const id of [A, B, "", "ktos-obcy"]) {
      const markup = html(s, id);
      expect(text(markup)).not.toContain("Dalej");
      expect(buttons(markup)).toHaveLength(0);
      expect((markup.match(/<details/g) ?? []).length).toBe(5);
      expect(text(markup)).toContain("Runda 6/6");
      expect(markup.match(/<th[^>]*aria-label="Runda \d"/g)).toHaveLength(6);
      expect(tableOf(markup).match(/<tr/g)).toHaveLength(3);
    }
  });

  test("ranking ma miejsca z wyniku i sumy punktów", () => {
    const s = rigged();
    expect(game.places!(s)).toEqual({ [A]: 1, [B]: 2, [C]: 2 });
    const markup = html(s, B);
    expect(text(tableRow(markup, A))).toContain("1. Ania");
    expect(text(tableRow(markup, B))).toContain("2. Bartek");
    expect(text(tableRow(markup, C))).toContain("2. Celina");
    expect(text(tableRow(markup, A)).trim().endsWith("18")).toBe(true);
    expect(text(tableRow(markup, B)).trim().endsWith("0")).toBe(true);
    expect(markup.indexOf(`data-player="${A}"`)).toBeLessThan(markup.indexOf(`data-player="${B}"`));
  });

  test("ekran końcowy zawiera odsłonę szóstej rundy z pytaniami, odpowiedziami i głosami", () => {
    const s = rigged();
    const last = view(s).history[5];
    const markup = html(s, A);
    expect(last.round).toBe(5);
    expect(text(markup)).toContain(last.majorityQuestion);
    expect(text(markup)).toContain(last.otherQuestion);
    expect(text(markup)).toContain("Runda 6: ostatnia");
    expect(text(markup)).toMatch(/Najwięcej głosów \(2 głosy\): Bartek, ale to nie Podróbka/);
    for (const id of THREE) expect(text(markup)).toContain(answerOf(id));
    // Wcześniejsze rundy są w rozwijanych szczegółach, z ich własnymi pytaniami.
    const earlier = markup.match(/<details.*?<\/details>/g)!;
    expect(earlier).toHaveLength(5);
    for (const [i, d] of earlier.entries()) expect(text(d)).toContain(view(s).history[i].majorityQuestion);
  });

  test("remis na górze: wspólne miejsca z places, bez zwycięzcy i bez rozstrzygania rolą", () => {
    const s = allCancelled();
    expect(game.isOver(s)!.winner).toBeUndefined();
    const places = game.places!(s);
    expect(places).toEqual({ [A]: 1, [B]: 1, [C]: 1 });
    for (const withPlaces of [places, null]) {
      const markup = renderToStaticMarkup(
        <PodrobkaBoard view={view(s, A)} me={A} players={PLAYERS} waitingFor={[]} onMove={() => {}} places={withPlaces} draft={{}} onDraft={() => {}} onText={() => {}} />,
      );
      for (const id of THREE) expect(text(tableRow(markup, id))).toMatch(/^ ?1\. /);
      expect(text(markup)).not.toMatch(/Wygrywa|Zwycięzc/);
    }
  });

  test("miejsca z remisem niżej: dalsze miejsce liczy się od liczby lepszych, także bez places", () => {
    const s = rigged();
    const markup = renderToStaticMarkup(
      <PodrobkaBoard view={view(s, A)} me={A} players={PLAYERS} waitingFor={[]} onMove={() => {}} places={null} draft={{}} onDraft={() => {}} onText={() => {}} />,
    );
    expect(text(tableRow(markup, A))).toContain("1. Ania");
    expect(text(tableRow(markup, B))).toContain("2. Bartek");
    expect(text(tableRow(markup, C))).toContain("2. Celina");
  });

  test("anulowane rundy mają w tabeli oznaczenie z objaśnieniem, nie tylko zero", () => {
    const s = allCancelled();
    const markup = html(s, A);
    expect(markup.match(/aria-label="Runda \d anulowana"/g)).toHaveLength(18);
    expect(text(markup)).toContain("× runda anulowana");
    expect(text(markup)).toContain("Brak odpowiedzi: Ania, Bartek, Celina");
    // Partia bez anulowań nie ma ani legendy, ani oznaczeń.
    const clean = html(rigged(), A);
    expect(text(clean)).not.toContain("runda anulowana");
    expect(clean).not.toMatch(/anulowana"/);
  });

  test("tabela rund zgadza się z historią i sumami ze stanu", () => {
    const s = rigged();
    const v = view(s);
    const markup = html(s, A);
    for (const [i, record] of v.history.entries()) {
      for (const id of THREE) {
        const cell = tableRow(markup, id).match(new RegExp(`<td[^>]*data-round="${i + 1}"[^>]*>(.*?)</td>`))![1];
        expect(text(cell).trim()).toBe(String(record.gain[id]));
      }
    }
    for (const id of THREE) expect(text(tableRow(markup, id)).trim().endsWith(String(v.totals[id]))).toBe(true);
  });

  test("po końcu nie ma pola ani przycisków także dla uczestnika", () => {
    const markup = html(rigged(), A);
    expect(markup).not.toContain("<input");
    expect(enabled(markup)).toHaveLength(0);
  });
});

describe("zasady wyglądu", () => {
  const source = readFileSync(new URL("./Podrobka.tsx", import.meta.url), "utf8");

  test("ekran nie wibruje sam, używa tylko card-in i float-up, nie ma czerwieni ani em-dashy", () => {
    expect(source).not.toContain("vibrate");
    const used = [...source.matchAll(/animate-\[([a-z0-9-]+)_([0-9.]+s)/g)].map((m) => `${m[1]} ${m[2]}`);
    expect([...new Set(used)].sort()).toEqual(["card-in 0.35s", "float-up 1.6s"]);
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

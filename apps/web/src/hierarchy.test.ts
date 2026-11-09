import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// P4-053: jeden wypełniony akcent, tytuły i tła według ról, zmierzone obcięcia na 360 px, osobny Preview Koła.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

test("07-06: jedyny wypełniony przycisk to „Utwórz pokój”, z pełnym kodem „Dołącz”; „Zagraj” zawsze obrys", () => {
  const home = read("screens/Home.tsx");
  expect(home).not.toContain('className="btn btn-primary w-full"');
  // „Utwórz pokój” oddaje wypełnienie po pełnym kodzie, „Dołącz” je przejmuje.
  expect(home).toContain('className={`btn w-full ${full ? "btn-ghost" : "btn-primary"}`} disabled={!!busy} onClick={() => go("create")}');
  expect(home).toContain('className={`btn shrink-0 ${full ? "btn-primary" : "btn-ghost"}`}');
  // „Zagraj” przy wyzwaniu: bez btn-primary w żadnym stanie.
  const daily = home.slice(home.indexOf("play(daily.gameId)") - 120, home.indexOf("play(daily.gameId)"));
  expect(daily).toContain('className="btn btn-ghost w-full"');
  expect(daily).not.toContain("btn-primary");
  // Jedyne wystąpienia btn-primary w pliku to dwa warunkowe powyżej.
  expect(home.match(/btn-primary/g)).toHaveLength(2);
});

test("07-06: „Ze znajomymi” stoi przed „Sam”, także przy wejściu z linku", () => {
  const home = read("screens/Home.tsx");
  expect(home).toContain("{[friends, solo]}");
  expect(home).not.toContain("codeFromUrl() ? [friends, solo]");
  expect(home).not.toContain("[solo, friends]");
});

test("F4-068: przycisk listy mini-gier mieści się w kolumnie przy powiększonym tekście", () => {
  expect(read("screens/Home.tsx")).not.toContain("Wszystkie ({MINI_GAME_IDS.length})");
});

test("F4-070: tytuł ekranu gry i turnieju jest wyróżniony", () => {
  expect(read("screens/Setup.tsx")).not.toContain('<h1 className="leading-tight">');
  expect(read("screens/Setup.tsx")).toContain('<h1 className="text-3xl font-semibold tracking-tight">{def.name}</h1>');
  expect(read("screens/Setup.tsx")).toContain('<h1 className="text-3xl font-semibold tracking-tight">Turniej</h1>');
});

test("F4-071/F4-072: Rekordy bez tła pól formularza, link rozwinięcia neutralny", () => {
  const records = read("screens/Records.tsx");
  expect(records).not.toContain("bg-surface-inset");
  expect(records).not.toContain('className="-mr-2 min-h-12 px-2 text-sm" style={{ color }}');
  expect(records).toContain('className="-mr-2 min-h-12 px-2 text-sm text-fg-muted underline underline-offset-4"');
});

test("F4-123: siatki skalują się do szerokości", () => {
  expect(read("games/Quiz.tsx")).toContain("repeat(${q.cols}, minmax(0, 1fr))");
  expect(read("games/Dziesiatki.tsx")).toContain("repeat(${DZIESIATKI_SIDE}, minmax(0, 1fr))");
  expect(read("games/Sudoku.tsx")).not.toContain("mx-auto grid w-64");
  expect(read("games/Sudoku.tsx")).toContain("mx-auto grid w-full max-w-64");
});

test("F4-142/F4-143: podgląd Koloru liter mieści odpowiedzi, opis mówi o zgodnych planszach", () => {
  expect(read("games/Quiz.tsx")).toContain('<div className="flex flex-wrap justify-center gap-2">');
  const stroop = read("games/Stroop.tsx");
  expect(stroop).toContain("options={STROOP_COLORS.slice(0, 3)");
  expect(stroop).toContain("zwykle się różnią");
});

test("F4-144: Koło ma osobny Preview", () => {
  const kolo = read("games/Kolo.tsx");
  expect(kolo).toContain("function Preview(");
  expect(kolo).toContain("preview={<Preview");
});

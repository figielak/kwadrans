import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES } from "@kwadrans/games";
import { expect, test } from "vitest";
import * as ui from "./screens/ui.tsx";

// P4-054: opisy i komentarze odpowiadają istniejącej grze, bez zmiany zasad.
const root = new URL("../../../", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(root, file), "utf8");

test("F4-020: KONCEPT wymienia drugie kryterium W pamięci", () => {
  expect(read("KONCEPT.md")).toContain("odchyłka w rundzie z pomyłką w W pamięci");
});

test("F4-024/F4-025: karty Kampus Tour nie mają karty „poprawka” i nie należą do Poprawki", () => {
  const koncept = read("KONCEPT.md");
  expect(koncept).not.toContain("stypendium, warunek, poprawka itp.");
  expect(koncept).toContain("Zaliczenie w pierwszym terminie itp.");
  expect(koncept).not.toContain("Zestaw kart specjalnych w Poprawce (talia 18 Kart Dziekanatu");
});

test("F4-026: tabela gier mówi, że postać w Kampus Tour wybiera się naraz", () => {
  expect(read("ZASADY-GIER.md")).toContain("| planszowa, po kolei (wybór postaci naraz) |");
});

test("F4-035: nagłówek i nazwy testów Kampus Tour zgadzają się z zasadami", () => {
  const src = read("packages/games/src/kampus-tour.test.ts");
  for (const old of ["20 zł kieszonkowego", "dowolnie wiele poziomów naraz;\n//   poziomy 1-3 kosztują P/2, landmark (4) P i wymaga kompletu", "za połowę ceny", "gotówka + ceny pól"])
    expect(src).not.toContain(old);
  expect(src).toContain("bez kompletu grupy najwyżej poziom 2");
});

test("F4-043: Refleks na liście gier z wynikiem liczonym na serwerze", () => {
  const line = read("ZASADY-GIER.md").split("\n").find((l) => l.startsWith("- Serwer odrzuca tylko nierealne wartości."))!;
  expect(line).toContain("(Refleks, ");
});

test("F4-044: rekord Sekwencji to długość serii, nie punkty", () => {
  const records = read("apps/web/src/screens/Records.tsx");
  expect(records).not.toContain("simon: { value: points }");
  expect(records).toContain("simon: { value: (n) => `seria ${n}` }");
});

test("F4-052: ukrycie punktów rywali w Balonie dotyczy ekranu", () => {
  expect(read("ZASADY-GIER.md")).toContain("Punktów rywali w trakcie nie widać na ekranie");
});

test("F4-055: komentarz przy LETTERS wymienia Ć", () => {
  expect(read("packages/games/src/panstwa-miasta.ts")).toContain("Bez Ą Ć Ę Ń Ó Ś Ź Ż Q V X Y");
});

test("F4-125: punkt czasu w Intro podaje limit całej partii", () => {
  const files = { kolo: "Kolo", srodek: "Srodek", mapa: "Mapa", tort: "Tort", nozyczki: "Nozyczki" };
  for (const [id, file] of Object.entries(files)) {
    expect(GAMES[id].turnSeconds).toBeGreaterThan(0);
    expect(read(`apps/web/src/games/${file}.tsx`)).toContain(`razem \${upTo(GAMES.${id}.turnSeconds!)}`);
  }
  const upTo = (ui as { upTo?: (seconds: number) => string }).upTo;
  expect(upTo?.(60)).toBe("do minuty");
  expect(upTo?.(180)).toBe("do 3 minut");
  expect(read("ZASADY.md")).toContain("`time`: długość partii");
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// P4-047: te same słowa w tej samej roli (ZASADY §4, słownik ról).
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

test("F4-098: przejście po odsłonie to „Dalej”, „Wyniki” tylko do podsumowania", () => {
  expect(read("games/Kolor.tsx")).not.toContain("Następny kolor");
  expect(read("games/Szacowanie.tsx")).toContain('answers.length < rounds ? "Dalej" : "Wyniki"');
  expect(read("games/KampusTour.tsx")).not.toMatch(/>\s*OK\s*</);
});

test("F4-098: nagłówek Kampus Tour mówi jak wspólny nagłówek, Koło nie myli próby z rekordem", () => {
  const kampus = read("games/KampusTour.tsx");
  for (const old of ["Twoja tura", "`Tura: ", '"Koniec gry"']) expect(kampus).not.toContain(old);
  expect(kampus).toContain('"Twój ruch"');
  expect(kampus).toContain("`Ruch: ${nick(view.turn!)}`");
  expect(read("games/Kolo.tsx")).not.toContain("Nowy rekord!");
  expect(read("games/Kolo.tsx")).toContain("Najlepsza próba!");
});

test("F4-091: „Gotowe” tylko dla oddania, gotowość to „Zgłaszam gotowość”", () => {
  expect(read("games/Statki.tsx")).toContain("Zgłaszam gotowość");
  expect(read("games/Statki.tsx")).not.toMatch(/>\s*Gotowe\s*</);
  expect(read("screens/Lobby.tsx")).not.toContain("`Gotowe, czekamy");
});

test("F4-119: jedna forma w każdej parze", () => {
  for (const file of ["games/PanstwaMiasta.tsx", "games/Kalambury.tsx"]) expect(read(file)).not.toContain('"Czekamy na resztę"');
  for (const file of ["games/Szacowanie.tsx", "games/Rok.tsx"]) expect(read(file)).not.toContain('"Idealnie"');
  expect(read("games/Obrot.tsx")).toContain('options={["Ta sama", "Lustro"]}');
  expect(read("games/Wieza.tsx")).not.toContain("odcięte");
  expect(read("games/Zaslona.tsx")).not.toContain("ostrzegawczy");
  expect(read("games/Przytrzymaj.tsx")).not.toMatch(/\{diff < 0 \? "−" : "\+"\}/);
});

test("F4-139/F4-148: poprawne formy „rysujesz” i „Dotknij symbolu”", () => {
  expect(read("games/Kalambury.tsx")).not.toContain('drawing ? "ty"');
  expect(read("games/Kalambury.tsx")).toContain('"rysujesz"');
  expect(read("games/Inny.tsx")).toContain("Dotknij symbolu, który się różni");
});

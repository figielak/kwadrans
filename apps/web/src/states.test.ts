import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// P4-052: ładowanie, rozłączenie i zamknięcie pokoju mają tekst; blokada mówi dlaczego; brak danych nie udaje pustej listy.
const src = new URL(".", import.meta.url).pathname;
const read = (file: string) => readFileSync(join(src, file), "utf8");

describe("platforma", () => {
  test("rekordy otwarte z pokoju pokazują ponowne łączenie", () => {
    expect(read("App.tsx")).toMatch(/<Records[^>]*dropped=\{dropped\}/);
  });

  test("zamknięcie pokoju to komunikat nad sekcjami, nie błąd pola kodu", () => {
    const home = read("screens/Home.tsx");
    expect(home).not.toContain("useState(notice");
    expect(home).toMatch(/role="status"[^>]*>\s*\{notice\}|\{notice && \(/);
  });

  test("wznawianie sesji i wczytywanie lobby mają tekst", () => {
    expect(read("App.tsx")).toMatch(/role="status"[\s\S]{0,200}Łączenie…/);
    const lobby = read("screens/Lobby.tsx");
    expect(lobby).toMatch(/role="status"[\s\S]{0,200}Wczytywanie…/);
    expect(lobby).not.toContain('aria-label="Wczytywanie"');
  });

  test("start solo ma czasownik, a reszta akcji ekranu czeka", () => {
    const home = read("screens/Home.tsx");
    expect(home).toContain("Uruchamianie…");
    expect(home).toMatch(/aria-label="Rekordy i rankingi"[^>]*disabled=\{!!busy\}|disabled=\{!!busy\}[^>]*aria-label="Rekordy i rankingi"/);
    expect(home).toMatch(/disabled=\{!!busy\}[^>]*onClick=\{\(\) => setEditing\(true\)\}/);
  });

  test("brak odpowiedzi serwera nie wygląda jak brak rekordów", () => {
    expect(read("net.ts")).toMatch(/fetchRecords[\s\S]*?\.catch\(\(\) => null\)/);
    for (const file of ["screens/Home.tsx", "screens/MiniGames.tsx"]) expect(read(file), file).not.toContain("useState<Record<string, RecordRow[]>>({})");
    expect(read("screens/MiniGames.tsx")).toContain("Wczytywanie…");
    expect(read("screens/Records.tsx")).toContain("Nie udało się wczytać rekordów");
  });

  test("rekordowa partia ma stan wczytywania", () => {
    expect(read("screens/Records.tsx")).not.toContain("if (top === undefined) return null");
  });

  test("rozłączony gracz: przerywany obrys pigułki, w lobby przygaszona tylko kropka", () => {
    expect(read("screens/Game.tsx")).toMatch(/connected \? "" : "border-dashed/);
    const lobby = read("screens/Lobby.tsx");
    expect(lobby).not.toMatch(/p\.connected \? "" : "opacity-50"/);
    expect(lobby).toMatch(/p\.connected \? "" : "opacity-40"/);
  });

  test("krycie stanu tylko z tabeli DESIGN §4", () => {
    expect(read("games/Memory.tsx")).not.toContain("opacity-45");
    expect(read("games/PanstwaMiasta.tsx")).not.toContain('"opacity-50"');
    expect(read("games/PanstwaMiasta.tsx")).toContain("Swoich nie oceniasz");
    const setup = read("screens/Setup.tsx");
    expect(setup).not.toContain("opacity-50");
    expect(setup).toContain("Tryb wybiera gospodarz");
  });

  test("turniej: stan „bez” ma słowo, granice liczby gier mają powód", () => {
    const setup = read("screens/Setup.tsx");
    expect(setup).toMatch(/state === "bez" &&/);
    expect(setup).toContain("Najmniej");
  });

  test("turniej solo bez tabeli punktów", () => {
    const game = read("screens/Game.tsx");
    expect(game).toContain("Rozegrane gry");
    expect(game).toMatch(/view\.seats\.length > 1 &&[\s\S]{0,80}table/);
  });
});

describe("gry", () => {
  test("Szacowanie: liczba poza zakresem ma powód", () => {
    const code = read("games/Szacowanie.tsx");
    expect(code).toContain("aria-invalid=");
    expect(code).toContain("Najwyżej");
  });

  test("Chińczyk: zablokowany pionek mówi, dlaczego nie ma ruchu", () => {
    const code = read("games/Chinczyk.tsx");
    expect(code).toContain("Z bazy wychodzi się");
    expect(code).toContain("setBlocked(");
  });

  test("Sudoku: klawiatura nieaktywna bez wybranego pola", () => {
    const code = read("games/Sudoku.tsx");
    expect(code).toMatch(/disabled=\{selected === null\}/);
    expect(code).toContain("Wybierz puste pole");
  });

  test("Kampus Tour: puste ciekawostki mają opis", () => {
    expect(read("games/KampusSummary.tsx")).toContain("Za krótka partia na ciekawostki.");
  });
});

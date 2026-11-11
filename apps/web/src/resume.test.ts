import { expect, test, vi } from "vitest";
import { resume } from "./resume.ts";

// Faza 13: odświeżenie strony w trakcie restartu serwera nie może spalić miejsca w pokoju.
// Token przepada dopiero wtedy, gdy serwer działa i mimo to nie wpuszcza.

const room = { id: "pokój" };
const wait = () => Promise.resolve();

test("serwer działa i wpuszcza: pokój od pierwszej próby, bez pytania o stan serwera", async () => {
  const serverUp = vi.fn(async () => true);
  expect(await resume({ reconnect: async () => room, serverUp, wait })).toEqual({ room, gone: false });
  expect(serverUp).not.toHaveBeenCalled();
});

test("serwer działa, ale miejsca nie ma: token do wyrzucenia po drugiej, potwierdzającej próbie", async () => {
  const reconnect = vi.fn(async () => {
    throw new Error("session expired");
  });
  expect(await resume({ reconnect, serverUp: async () => true, wait })).toEqual({ room: null, gone: true });
  expect(reconnect).toHaveBeenCalledTimes(2);
});

test("serwer milczy (deploy): czekamy i wracamy, gdy wstanie", async () => {
  let up = false;
  const waited = vi.fn(async () => {
    if (waited.mock.calls.length === 3) up = true;
  });
  const reconnect = vi.fn(async () => {
    if (!up) throw new Error("failed to fetch");
    return room;
  });
  expect(await resume({ reconnect, serverUp: async () => up, wait: waited })).toEqual({ room, gone: false });
  expect(waited).toHaveBeenCalledTimes(3);
});

test("serwer wstał między nieudaną próbą a sprawdzeniem: ponowna próba zamiast utraty miejsca", async () => {
  const reconnect = vi.fn().mockRejectedValueOnce(new Error("failed to fetch")).mockResolvedValueOnce(room);
  expect(await resume({ reconnect, serverUp: async () => true, wait })).toEqual({ room, gone: false });
});

test("serwer nie wraca: po wyczerpaniu prób token zostaje na następne otwarcie strony", async () => {
  const reconnect = vi.fn(async () => {
    throw new Error("failed to fetch");
  });
  expect(await resume({ reconnect, serverUp: async () => false, wait, tries: 5 })).toEqual({ room: null, gone: false });
  expect(reconnect).toHaveBeenCalledTimes(5);
});

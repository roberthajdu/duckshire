import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { Content } from "@/engine/engine";
import { createSaveApi } from "./save-api";
import { openDuckStore } from "./duck-store";

const T0 = 1_000_000;

const sampleContent: Content = {
  skills: {
    foraging: { id: "foraging", name: "Foraging", description: "Test skill." },
  },
  items: {
    reed: { id: "reed", name: "Reed", description: "Test item." },
  },
  actions: {
    "pick-reeds": {
      id: "pick-reeds",
      skillId: "foraging",
      name: "Pick Reeds",
      description: "Test action.",
      cycleMs: 3000,
      experiencePerCycle: 10,
      yields: [{ itemId: "reed", quantity: 1 }],
    },
  },
};

function setup(databasePath = ":memory:") {
  let now = T0;
  const store = openDuckStore(databasePath);
  const api = createSaveApi({
    store,
    content: sampleContent,
    startingActionId: "pick-reeds",
    now: () => now,
  });
  return {
    api,
    closeDatabase: () => store.close(),
    advanceClock: (ms: number) => {
      now += ms;
    },
  };
}

const createRequest = (body: unknown) =>
  new Request("http://test/api/duck", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const withCookie = (url: string, cookie: string, method = "GET") =>
  new Request(url, { method, headers: { cookie } });

/** Turns a Set-Cookie header into the Cookie header a browser would send back. */
const cookieFrom = (response: Response) => {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) throw new Error("Response set no cookie");
  return setCookie.split(";")[0];
};

describe("save API", () => {
  it("creates an anonymous Duck that is already Foraging", async () => {
    const { api } = setup();

    const response = await api.createDuck(createRequest({ name: "Sir Quacksalot" }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      name: "Sir Quacksalot",
      state: {
        duck: { skills: {}, inventory: {} },
        currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 },
      },
      serverNow: T0,
    });
  });

  it("trims the Duck's name", async () => {
    const { api } = setup();

    const response = await api.createDuck(createRequest({ name: "  Puddles  " }));

    expect(await response.json()).toMatchObject({ name: "Puddles" });
  });

  it.each([
    ["a missing name", {}],
    ["a blank name", { name: "   " }],
    ["a name that is not text", { name: 42 }],
    ["a name longer than 24 characters", { name: "Admiral Quackington the Third" }],
  ])("refuses to create a Duck with %s", async (_, body) => {
    const { api } = setup();

    const response = await api.createDuck(createRequest(body));

    expect(response.status).toBe(400);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("restores the same Duck from its anonymous identity", async () => {
    const { api } = setup();
    const created = await api.createDuck(createRequest({ name: "Sir Quacksalot" }));

    const loaded = await api.getDuck(withCookie("http://test/api/duck", cookieFrom(created)));

    expect(loaded.status).toBe(200);
    expect(await loaded.json()).toMatchObject({
      name: "Sir Quacksalot",
      state: { currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 } },
    });
  });

  describe("with a database file", () => {
    let directory: string | undefined;
    afterEach(() => {
      if (directory) rmSync(directory, { recursive: true, force: true });
    });

    it("keeps the Duck when the server restarts", async () => {
      directory = mkdtempSync(join(tmpdir(), "duckshire-test-"));
      const databasePath = join(directory, "test.db");
      const first = setup(databasePath);
      const created = await first.api.createDuck(createRequest({ name: "Sir Quacksalot" }));
      first.closeDatabase();

      const restarted = setup(databasePath);
      const loaded = await restarted.api.getDuck(
        withCookie("http://test/api/duck", cookieFrom(created)),
      );
      restarted.closeDatabase();

      expect(loaded.status).toBe(200);
      expect(await loaded.json()).toMatchObject({ name: "Sir Quacksalot" });
    });
  });

  it("has no Duck for a device without an anonymous identity", async () => {
    const { api } = setup();
    await api.createDuck(createRequest({ name: "Sir Quacksalot" }));

    const anonymous = await api.getDuck(new Request("http://test/api/duck"));
    const stranger = await api.syncDuck(
      withCookie("http://test/api/duck/sync", "duck_token=not-a-real-token", "POST"),
    );

    expect(anonymous.status).toBe(404);
    expect(stranger.status).toBe(404);
  });

  it("syncs the Cycles completed during live play and persists them", async () => {
    const { api, advanceClock } = setup();
    const cookie = cookieFrom(await api.createDuck(createRequest({ name: "Sir Quacksalot" })));

    advanceClock(7_500);
    const synced = await api.syncDuck(withCookie("http://test/api/duck/sync", cookie, "POST"));
    const loaded = await api.getDuck(withCookie("http://test/api/duck", cookie));

    const expectedState = {
      duck: { skills: { foraging: { experience: 20 } }, inventory: { reed: 2 } },
      currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 + 6_000 },
    };
    expect(synced.status).toBe(200);
    expect(await synced.json()).toMatchObject({ state: expectedState, serverNow: T0 + 7_500 });
    expect(await loaded.json()).toMatchObject({ state: expectedState });
  });

  it("applies Offline Progress when a returning Duck loads, and persists it", async () => {
    const { api, advanceClock } = setup();
    const cookie = cookieFrom(await api.createDuck(createRequest({ name: "Sir Quacksalot" })));

    advanceClock(2 * 60 * 60_000 + 1_000);
    const loaded = await api.getDuck(withCookie("http://test/api/duck", cookie));
    const reloaded = await api.getDuck(withCookie("http://test/api/duck", cookie));

    const expectedState = {
      duck: { skills: { foraging: { experience: 24_000 } }, inventory: { reed: 2_400 } },
      currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 + 2 * 60 * 60_000 },
    };
    expect(loaded.status).toBe(200);
    expect(await loaded.json()).toMatchObject({
      state: expectedState,
      offlineProgress: {
        awayMs: 2 * 60 * 60_000 + 1_000,
        items: { reed: 2_400 },
        experience: { foraging: 24_000 },
      },
    });
    expect(await reloaded.json()).toMatchObject({
      state: expectedState,
      offlineProgress: { awayMs: 1_000, items: {}, experience: {} },
    });
  });

  it("grants a returning Duck nothing for time beyond 12 hours", async () => {
    const { api, advanceClock } = setup();
    const cookie = cookieFrom(await api.createDuck(createRequest({ name: "Sir Quacksalot" })));

    advanceClock(3 * 24 * 60 * 60_000);
    const loaded = await api.getDuck(withCookie("http://test/api/duck", cookie));

    expect(await loaded.json()).toMatchObject({
      state: { duck: { inventory: { reed: 14_400 } } },
      offlineProgress: { awayMs: 3 * 24 * 60 * 60_000, items: { reed: 14_400 } },
    });
  });
});

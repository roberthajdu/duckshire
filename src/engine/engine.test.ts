import { describe, expect, it } from "vitest";
import { advanceGame, applyOfflineProgress, type Content, type GameState } from "./engine";

const T0 = 1_000_000;
const ONE_HOUR = 60 * 60_000;

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

const freshDuckForaging = (): GameState => ({
  duck: { skills: {}, inventory: {} },
  currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 },
});

describe("advanceGame", () => {
  it("grants the yield and Skill experience for one whole Cycle", () => {
    const state = advanceGame(freshDuckForaging(), sampleContent, T0 + 3000);

    expect(state.duck.inventory).toEqual({ reed: 1 });
    expect(state.duck.skills).toEqual({ foraging: { experience: 10 } });
  });

  it("grants nothing for a partial Cycle", () => {
    const state = advanceGame(freshDuckForaging(), sampleContent, T0 + 2999);

    expect(state.duck).toEqual({ skills: {}, inventory: {} });
  });

  it("keeps partial Cycle progress for the next call", () => {
    const first = advanceGame(freshDuckForaging(), sampleContent, T0 + 4500);
    const second = advanceGame(first, sampleContent, T0 + 6000);

    expect(first.duck.inventory).toEqual({ reed: 1 });
    expect(second.duck.inventory).toEqual({ reed: 2 });
    expect(second.duck.skills).toEqual({ foraging: { experience: 20 } });
  });

  it("grants exactly the number of whole Cycles elapsed", () => {
    const state = advanceGame(freshDuckForaging(), sampleContent, T0 + 301_000);

    expect(state.duck.inventory).toEqual({ reed: 100 });
    expect(state.duck.skills).toEqual({ foraging: { experience: 1000 } });
  });

  it("adds to what the Duck already has", () => {
    const start: GameState = {
      duck: {
        skills: { foraging: { experience: 5 }, fishing: { experience: 70 } },
        inventory: { reed: 2, pebble: 4 },
      },
      currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 },
    };

    const state = advanceGame(start, sampleContent, T0 + 6000);

    expect(state.duck).toEqual({
      skills: { foraging: { experience: 25 }, fishing: { experience: 70 } },
      inventory: { reed: 4, pebble: 4 },
    });
  });

  it("gives the same result in many small steps as in one call", () => {
    const end = T0 + 10 * 60_000;
    const single = advanceGame(freshDuckForaging(), sampleContent, end);

    let stepped = freshDuckForaging();
    for (let now = T0; now < end; now += 137) {
      stepped = advanceGame(stepped, sampleContent, now);
    }
    stepped = advanceGame(stepped, sampleContent, end);

    expect(stepped).toEqual(single);
    expect(single.duck.inventory).toEqual({ reed: 200 });
  });

  it("grants nothing when the current time is before the Cycle started", () => {
    const start = freshDuckForaging();

    expect(advanceGame(start, sampleContent, T0 - 10_000)).toEqual(start);
  });

  it("does nothing when the Duck has no current Action", () => {
    const duckWithoutAction: GameState = {
      duck: { skills: {}, inventory: { reed: 1 } },
      currentAction: null,
    };

    expect(advanceGame(duckWithoutAction, sampleContent, T0 + 60_000)).toEqual(duckWithoutAction);
  });

  it("rejects an Action the content does not define", () => {
    const state: GameState = {
      duck: { skills: {}, inventory: {} },
      currentAction: { actionId: "juggle-swans", cycleStartedAt: T0 },
    };

    expect(() => advanceGame(state, sampleContent, T0 + 3000)).toThrow(
      'Unknown Action "juggle-swans"',
    );
  });
});

describe("the Offline Progress cap", () => {
  it("grants nothing extra for time beyond 12 hours", () => {
    const atCap = advanceGame(freshDuckForaging(), sampleContent, T0 + 12 * ONE_HOUR);
    const pastCap = advanceGame(freshDuckForaging(), sampleContent, T0 + 30 * ONE_HOUR);

    expect(pastCap.duck).toEqual(atCap.duck);
    expect(pastCap.duck.inventory).toEqual({ reed: 14_400 });
  });

  it("carries on from the return once the cap is reached", () => {
    const returned = advanceGame(freshDuckForaging(), sampleContent, T0 + 30 * ONE_HOUR);
    const later = advanceGame(returned, sampleContent, T0 + 30 * ONE_HOUR + 3000);

    expect(later.duck.inventory).toEqual({ reed: 14_401 });
  });
});

describe("applyOfflineProgress", () => {
  it("equals live play for the same elapsed time", () => {
    const end = T0 + 5 * ONE_HOUR + 1234;
    let live = freshDuckForaging();
    for (let now = T0; now < end; now += 15_000) {
      live = advanceGame(live, sampleContent, now);
    }
    live = advanceGame(live, sampleContent, end);

    const { state } = applyOfflineProgress(freshDuckForaging(), sampleContent, end);

    expect(state).toEqual(live);
    expect(state.duck.inventory).toEqual({ reed: 6000 });
  });

  it("summarises the time away and what the Duck gained", () => {
    const start: GameState = {
      duck: { skills: { foraging: { experience: 50 } }, inventory: { reed: 7 } },
      currentAction: { actionId: "pick-reeds", cycleStartedAt: T0 },
    };

    const { summary } = applyOfflineProgress(start, sampleContent, T0 + ONE_HOUR + 500);

    expect(summary).toEqual({
      awayMs: ONE_HOUR + 500,
      items: { reed: 1200 },
      experience: { foraging: 12_000 },
    });
  });

  it("summarises only the first 12 hours of a longer absence as gains", () => {
    const { summary } = applyOfflineProgress(freshDuckForaging(), sampleContent, T0 + 30 * ONE_HOUR);

    expect(summary).toEqual({
      awayMs: 30 * ONE_HOUR,
      items: { reed: 14_400 },
      experience: { foraging: 144_000 },
    });
  });

  it("has no summary when the Duck has no current Action", () => {
    const noAction: GameState = {
      duck: { skills: {}, inventory: { reed: 1 } },
      currentAction: null,
    };

    expect(applyOfflineProgress(noAction, sampleContent, T0 + ONE_HOUR)).toEqual({
      state: noAction,
      summary: null,
    });
  });
});

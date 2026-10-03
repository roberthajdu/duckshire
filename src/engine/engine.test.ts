import { describe, expect, it } from "vitest";
import { advanceGame, type Content, type GameState } from "./engine";

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

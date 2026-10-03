import { describe, expect, it } from "vitest";
import { advanceGame } from "@/engine/engine";
import { content } from "./content";

const T0 = 1_000_000;
const ONE_HOUR = 60 * 60_000;

describe("content", () => {
  it("lets the Duck forage Duckweed for items and Foraging experience", () => {
    const state = advanceGame(
      {
        duck: { skills: {}, inventory: {} },
        currentAction: { actionId: "forage-duckweed", cycleStartedAt: T0 },
      },
      content,
      T0 + ONE_HOUR,
    );

    expect(Object.keys(state.duck.inventory)).toEqual(["duckweed"]);
    expect(state.duck.inventory.duckweed).toBeGreaterThan(0);
    expect(state.duck.skills.foraging.experience).toBeGreaterThan(0);
  });

  it.each(Object.keys(content.actions))(
    "Action %s trains a defined Skill and yields only defined items",
    (actionId) => {
      const state = advanceGame(
        {
          duck: { skills: {}, inventory: {} },
          currentAction: { actionId, cycleStartedAt: T0 },
        },
        content,
        T0 + ONE_HOUR,
      );

      for (const skillId of Object.keys(state.duck.skills)) {
        expect(content.skills).toHaveProperty(skillId);
      }
      for (const itemId of Object.keys(state.duck.inventory)) {
        expect(content.items).toHaveProperty(itemId);
      }
    },
  );
});

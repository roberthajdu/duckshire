export type SkillId = string;
export type ActionId = string;
export type ItemId = string;

// Skills and Actions are keyed by stable ids so later per-Skill data
// (Skillcapes) and per-Action data (Mastery) can hang off them.
export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
}

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
}

export interface ActionDefinition {
  id: ActionId;
  skillId: SkillId;
  name: string;
  description: string;
  cycleMs: number;
  experiencePerCycle: number;
  yields: { itemId: ItemId; quantity: number }[];
}

export interface Content {
  skills: Record<SkillId, SkillDefinition>;
  actions: Record<ActionId, ActionDefinition>;
  items: Record<ItemId, ItemDefinition>;
}

export interface Duck {
  skills: Record<SkillId, { experience: number }>;
  inventory: Record<ItemId, number>;
}

export interface CurrentAction {
  actionId: ActionId;
  /** Epoch ms when the in-progress Cycle began; advances as Cycles complete. */
  cycleStartedAt: number;
}

export interface GameState {
  duck: Duck;
  currentAction: CurrentAction | null;
}

/**
 * The Game Engine: applies every whole Cycle of the current Action completed
 * by `now`. Live play and Offline Progress both call this.
 */
export function advanceGame(
  state: GameState,
  content: Content,
  now: number,
): GameState {
  const { duck, currentAction } = state;
  if (!currentAction) return state;

  const action = content.actions[currentAction.actionId];
  if (!action) throw new Error(`Unknown Action "${currentAction.actionId}"`);
  const cycles = Math.floor((now - currentAction.cycleStartedAt) / action.cycleMs);
  if (cycles <= 0) return state;

  const inventory = { ...duck.inventory };
  for (const { itemId, quantity } of action.yields) {
    inventory[itemId] = (inventory[itemId] ?? 0) + quantity * cycles;
  }

  const skill = duck.skills[action.skillId] ?? { experience: 0 };
  const skills = {
    ...duck.skills,
    [action.skillId]: { experience: skill.experience + action.experiencePerCycle * cycles },
  };

  return {
    duck: { ...duck, skills, inventory },
    currentAction: {
      ...currentAction,
      cycleStartedAt: currentAction.cycleStartedAt + cycles * action.cycleMs,
    },
  };
}

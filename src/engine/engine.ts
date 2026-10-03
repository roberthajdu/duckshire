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

/** The longest stretch of unobserved time a single call grants Cycles for. */
export const OFFLINE_PROGRESS_CAP_MS = 12 * 60 * 60_000;

/**
 * The Game Engine: applies every whole Cycle of the current Action completed
 * by `now`. Live play and Offline Progress both call this. Time beyond
 * {@link OFFLINE_PROGRESS_CAP_MS} grants nothing, and the next Cycle starts at `now`.
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
  const elapsedMs = now - currentAction.cycleStartedAt;
  const capped = elapsedMs > OFFLINE_PROGRESS_CAP_MS;
  const cycles = Math.floor(Math.min(elapsedMs, OFFLINE_PROGRESS_CAP_MS) / action.cycleMs);
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
      cycleStartedAt: capped ? now : currentAction.cycleStartedAt + cycles * action.cycleMs,
    },
  };
}

/** What the Duck earned while the player was away, for the return summary. */
export interface OfflineProgressSummary {
  /** Time since the in-progress Cycle began, which may exceed the cap. */
  awayMs: number;
  items: Record<ItemId, number>;
  experience: Record<SkillId, number>;
}

/**
 * Offline Progress: advances a returning Duck with the same {@link advanceGame}
 * as live play and summarises what it gained. No summary without a current Action.
 */
export function applyOfflineProgress(
  state: GameState,
  content: Content,
  now: number,
): { state: GameState; summary: OfflineProgressSummary | null } {
  if (!state.currentAction) return { state, summary: null };

  const after = advanceGame(state, content, now);
  return {
    state: after,
    summary: {
      awayMs: Math.max(0, now - state.currentAction.cycleStartedAt),
      items: gains(state.duck.inventory, after.duck.inventory),
      experience: gains(
        mapValues(state.duck.skills, (skill) => skill.experience),
        mapValues(after.duck.skills, (skill) => skill.experience),
      ),
    },
  };
}

/** The positive differences between two tallies, keyed by id. */
function gains(before: Record<string, number>, after: Record<string, number>) {
  const gained: Record<string, number> = {};
  for (const [id, amount] of Object.entries(after)) {
    const difference = amount - (before[id] ?? 0);
    if (difference > 0) gained[id] = difference;
  }
  return gained;
}

function mapValues<T>(record: Record<string, T>, toNumber: (value: T) => number) {
  return Object.fromEntries(Object.entries(record).map(([id, value]) => [id, toNumber(value)]));
}

import { createHash, randomUUID } from "node:crypto";
import {
  advanceGame,
  applyOfflineProgress,
  type ActionId,
  type Content,
  type GameState,
  type OfflineProgressSummary,
} from "@/engine/engine";
import type { DuckSave, DuckStore } from "./duck-store";
import { MAX_NAME_LENGTH } from "./save-limits";

const TOKEN_COOKIE = "duck_token";
const COOKIE_MAX_AGE_S = 10 * 365 * 24 * 60 * 60;

export interface SaveApiOptions {
  store: DuckStore;
  content: Content;
  /** The Action a new Duck starts performing the moment it is named. */
  startingActionId: ActionId;
  now: () => number;
}

/** The save API as Web Request → Response handlers, mounted by the route files. */
export function createSaveApi({ store, content, startingActionId, now }: SaveApiOptions) {
  /** The save belonging to the request's anonymous device token, if any. */
  const findSave = (request: Request) => {
    const token = readCookie(request, TOKEN_COOKIE);
    if (!token) return null;
    const tokenHash = hashToken(token);
    const save = store.find(tokenHash);
    return save ? { tokenHash, save } : null;
  };

  const respond = (
    save: DuckSave & { offlineProgress?: OfflineProgressSummary | null },
    init?: ResponseInit,
  ) => Response.json({ ...save, serverNow: now() }, init);

  return {
    async createDuck(request: Request): Promise<Response> {
      const name = parseDuckName(await request.json().catch(() => null));
      if (!name) {
        return Response.json(
          { error: `A Duck needs a name of 1 to ${MAX_NAME_LENGTH} characters.` },
          { status: 400 },
        );
      }
      const state: GameState = {
        duck: { skills: {}, inventory: {} },
        currentAction: { actionId: startingActionId, cycleStartedAt: now() },
      };
      const token = randomUUID();
      store.create(hashToken(token), { name, state });

      return respond(
        { name, state },
        {
          status: 201,
          headers: {
            "set-cookie": `${TOKEN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_S}`,
          },
        },
      );
    },

    /** Loads a returning Duck, applying and persisting its Offline Progress. */
    async getDuck(request: Request): Promise<Response> {
      const found = findSave(request);
      if (!found) return noDuck();

      const { state, summary } = applyOfflineProgress(found.save.state, content, now());
      store.update(found.tokenHash, state);
      return respond({ ...found.save, state, offlineProgress: summary });
    },

    /** Runs the Game Engine up to now on the server and persists the result. */
    async syncDuck(request: Request): Promise<Response> {
      const found = findSave(request);
      if (!found) return noDuck();

      const state = advanceGame(found.save.state, content, now());
      store.update(found.tokenHash, state);
      return respond({ ...found.save, state });
    },
  };
}

function parseDuckName(body: unknown): string | null {
  const name = (body as { name?: unknown } | null)?.name;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH ? trimmed : null;
}

const noDuck = () => Response.json({ error: "No Duck here yet." }, { status: 404 });

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const pair of header.split(";")) {
    const [key, ...value] = pair.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

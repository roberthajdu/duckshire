import type { GameState, OfflineProgressSummary } from "@/engine/engine";

/** A Duck's save as the save API returns it. */
export interface SaveResponse {
  name: string;
  state: GameState;
  serverNow: number;
  /** What the Duck earned while away; only a load returns it. */
  offlineProgress?: OfflineProgressSummary | null;
}

async function readSave(response: Response): Promise<SaveResponse | null> {
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `The pond is having a moment (${response.status}).`);
  }
  return response.json();
}

/** Loads this device's Duck, or null if it hasn't named one yet. */
export const loadDuck = () => fetch("/api/duck", { cache: "no-store" }).then(readSave);

export async function createDuck(name: string): Promise<SaveResponse> {
  const response = await fetch("/api/duck", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const save = await readSave(response);
  if (!save) throw new Error("The Duck wandered off before it could be named.");
  return save;
}

/** Asks the server to run the Game Engine up to now and save the result. */
export const syncDuck = (options?: { keepalive?: boolean }) =>
  fetch("/api/duck/sync", { method: "POST", keepalive: options?.keepalive }).then(readSave);

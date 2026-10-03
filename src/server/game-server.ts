import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { content, startingActionId } from "@/content/content";
import { openDuckStore } from "./duck-store";
import { createSaveApi } from "./save-api";

let saveApi: ReturnType<typeof createSaveApi> | undefined;

/** The app's save API, opened on first use so builds never touch the database. */
export function getSaveApi() {
  if (!saveApi) {
    const databasePath = process.env.DUCKSHIRE_DB_PATH ?? "data/duckshire.db";
    mkdirSync(dirname(databasePath), { recursive: true });
    saveApi = createSaveApi({
      store: openDuckStore(databasePath),
      content,
      startingActionId,
      now: Date.now,
    });
  }
  return saveApi;
}

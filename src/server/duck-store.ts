import { DatabaseSync } from "node:sqlite";
import type { GameState } from "@/engine/engine";

export interface DuckSave {
  name: string;
  state: GameState;
}

/** Persists Duck saves keyed by a hash of the player's anonymous device token. */
export interface DuckStore {
  create(tokenHash: string, save: DuckSave): void;
  find(tokenHash: string): DuckSave | null;
  update(tokenHash: string, state: GameState): void;
  close(): void;
}

export function openDuckStore(path: string): DuckStore {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ducks (
      token_hash TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL
    )
  `);

  const insert = db.prepare("INSERT INTO ducks (token_hash, name, state) VALUES (?, ?, ?)");
  const select = db.prepare("SELECT name, state FROM ducks WHERE token_hash = ?");
  const updateState = db.prepare("UPDATE ducks SET state = ? WHERE token_hash = ?");

  return {
    create(tokenHash, { name, state }) {
      insert.run(tokenHash, name, JSON.stringify(state));
    },
    find(tokenHash) {
      const row = select.get(tokenHash) as { name: string; state: string } | undefined;
      return row ? { name: row.name, state: JSON.parse(row.state) } : null;
    },
    update(tokenHash, state) {
      updateState.run(JSON.stringify(state), tokenHash);
    },
    close() {
      db.close();
    },
  };
}

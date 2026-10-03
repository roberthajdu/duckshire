"use client";

import { useCallback, useEffect, useState } from "react";
import { content } from "@/content/content";
import { MAX_NAME_LENGTH } from "@/server/save-limits";
import { createDuck, loadDuck, syncDuck, type SaveResponse } from "./save-client";
import { ForagingView } from "./ForagingView";
import styles from "./game.module.css";

const SYNC_INTERVAL_MS = 15_000;

/** A save plus how far the server's clock is ahead of this device's. */
interface ClientSave {
  save: SaveResponse;
  clockOffsetMs: number;
}

type Screen =
  | { kind: "loading" }
  | { kind: "naming" }
  | { kind: "playing"; current: ClientSave }
  | { kind: "error"; message: string };

const toClientSave = (save: SaveResponse): ClientSave => ({
  save,
  clockOffsetMs: save.serverNow - Date.now(),
});

export function Game() {
  const [screen, setScreen] = useState<Screen>({ kind: "loading" });

  useEffect(() => {
    loadDuck()
      .then((save) => setScreen(save ? { kind: "playing", current: toClientSave(save) } : { kind: "naming" }))
      .catch((error: Error) => setScreen({ kind: "error", message: error.message }));
  }, []);

  const playing = screen.kind === "playing";
  useEffect(() => {
    if (!playing) return;

    const sync = (keepalive = false) =>
      syncDuck({ keepalive })
        .then((save) => {
          if (save) setScreen({ kind: "playing", current: toClientSave(save) });
        })
        // A missed sync is harmless: the next one catches up from the stored Action.
        .catch(() => {});

    const interval = setInterval(() => sync(), SYNC_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sync(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [playing]);

  const onNamed = useCallback((save: SaveResponse) => {
    setScreen({ kind: "playing", current: toClientSave(save) });
  }, []);

  return (
    <main className={styles.screen}>
      {screen.kind === "loading" && <p className={styles.muted}>Waking the Duck…</p>}
      {screen.kind === "naming" && <NameDuckForm onNamed={onNamed} />}
      {screen.kind === "playing" && (
        <ForagingView
          name={screen.current.save.name}
          state={screen.current.save.state}
          clockOffsetMs={screen.current.clockOffsetMs}
          content={content}
        />
      )}
      {screen.kind === "error" && (
        <div className={styles.card} role="alert">
          <p>{screen.message}</p>
          <button className={styles.button} onClick={() => location.reload()}>
            Try again
          </button>
        </div>
      )}
    </main>
  );
}

function NameDuckForm({ onNamed }: { onNamed: (save: SaveResponse) => void }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      onNamed(await createDuck(name));
    } catch (caught) {
      setError((caught as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.card} onSubmit={submit}>
      <h1 className={styles.title}>Duckshire</h1>
      <p className={styles.muted}>A duck has wandered up to you. It would like a name.</p>
      <label className={styles.label} htmlFor="duck-name">
        Your Duck&apos;s name
      </label>
      <input
        id="duck-name"
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={MAX_NAME_LENGTH}
        placeholder="Sir Quacksalot"
        autoComplete="off"
        autoFocus
        required
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.button} disabled={submitting || name.trim() === ""}>
        {submitting ? "Quacking…" : "Start foraging"}
      </button>
    </form>
  );
}

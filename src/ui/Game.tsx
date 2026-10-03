"use client";

import { useCallback, useEffect, useState } from "react";
import { content } from "@/content/content";
import type { OfflineProgressSummary } from "@/engine/engine";
import { MAX_NAME_LENGTH } from "@/server/save-limits";
import { createDuck, loadDuck, syncDuck, type SaveResponse } from "./save-client";
import { GameShell, Masthead } from "./GameShell";
import { isWorthSummarising, ReturnSummary } from "./ReturnSummary";
import styles from "./shell.module.css";

const SYNC_INTERVAL_MS = 15_000;

/** A save plus how far the server's clock is ahead of this device's. */
interface ClientSave {
  save: SaveResponse;
  clockOffsetMs: number;
  /** Device time when this save arrived from the server. */
  savedAt: number;
}

type Screen =
  | { kind: "loading" }
  | { kind: "naming" }
  | { kind: "playing"; current: ClientSave }
  | { kind: "error"; message: string };

const toClientSave = (save: SaveResponse): ClientSave => ({
  save,
  clockOffsetMs: save.serverNow - Date.now(),
  savedAt: Date.now(),
});

export function Game() {
  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [returnSummary, setReturnSummary] = useState<OfflineProgressSummary | null>(null);

  useEffect(() => {
    loadDuck()
      .then((save) => {
        if (!save) return setScreen({ kind: "naming" });
        if (isWorthSummarising(save.offlineProgress)) setReturnSummary(save.offlineProgress);
        setScreen({ kind: "playing", current: toClientSave(save) });
      })
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

  if (screen.kind === "playing" && !returnSummary) {
    return (
      <GameShell
        name={screen.current.save.name}
        state={screen.current.save.state}
        clockOffsetMs={screen.current.clockOffsetMs}
        savedAt={screen.current.savedAt}
        content={content}
      />
    );
  }

  return (
    <div className={styles.shell}>
      <Masthead />
      <main className={styles.single}>
        {screen.kind === "loading" && (
          <p className={styles.waiting} role="status">
            Waking the Duck…
          </p>
        )}
        {screen.kind === "naming" && <NameDuckForm onNamed={onNamed} />}
        {screen.kind === "playing" && returnSummary && (
          <ReturnSummary
            name={screen.current.save.name}
            summary={returnSummary}
            content={content}
            onContinue={() => setReturnSummary(null)}
          />
        )}
        {screen.kind === "error" && (
          <section className={styles.form} role="alert" aria-labelledby="error-title">
            <h1 id="error-title" className={styles.band}>
              Something went wrong
            </h1>
            <div className={styles.formBody}>
              <p>{screen.message}</p>
              <button className={styles.primary} onClick={() => location.reload()}>
                Try again
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
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
    <form className={styles.form} onSubmit={submit} aria-labelledby="entry-title">
      <h1 id="entry-title" className={styles.band}>
        Name your Duck
      </h1>
      <div className={styles.formBody}>
        <p className={styles.lede}>A duck has wandered up to you. It would like a name.</p>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="duck-name">
            Duck
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
            aria-describedby={error ? "duck-name-error" : undefined}
          />
        </div>
        {error && (
          <p id="duck-name-error" className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.primary} disabled={submitting || name.trim() === ""}>
          {submitting ? "Starting…" : "Start foraging"}
        </button>
      </div>
    </form>
  );
}

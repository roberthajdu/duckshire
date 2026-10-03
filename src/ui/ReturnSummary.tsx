"use client";

import { OFFLINE_PROGRESS_CAP_MS, type Content, type OfflineProgressSummary } from "@/engine/engine";
import styles from "./return-summary.module.css";

/** Short absences, like a page refresh, aren't worth a summary. */
const MIN_AWAY_MS = 60_000;

export function isWorthSummarising(
  summary: OfflineProgressSummary | null | undefined,
): summary is OfflineProgressSummary {
  return (
    !!summary && summary.awayMs >= MIN_AWAY_MS && Object.keys(summary.items).length > 0
  );
}

interface ReturnSummaryProps {
  name: string;
  summary: OfflineProgressSummary;
  content: Content;
  onContinue: () => void;
}

/** A shareable results slip of what the Duck got up to while the player was away. */
export function ReturnSummary({ name, summary, content, onContinue }: ReturnSummaryProps) {
  const capped = summary.awayMs > OFFLINE_PROGRESS_CAP_MS;
  const workedMs = Math.min(summary.awayMs, OFFLINE_PROGRESS_CAP_MS);

  return (
    <article className={styles.slip} aria-labelledby="return-title">
      <h1 id="return-title" className={styles.band}>
        While you were away
      </h1>

      <header className={styles.top}>
        <p className={styles.name}>{name}</p>
        <dl className={styles.facts}>
          <div>
            <dt className={styles.label}>Kept busy for</dt>
            <dd className={styles.worked}>
              {formatDuration(workedMs)}
              {capped && <span className={styles.stamp}>Limit reached</span>}
            </dd>
          </div>
          {capped && (
            <div>
              <dt className={styles.label}>Away for</dt>
              <dd className={styles.away}>{formatDuration(summary.awayMs)}</dd>
            </div>
          )}
        </dl>
        {capped && (
          <p className={styles.note}>
            Worked the first {formatDuration(OFFLINE_PROGRESS_CAP_MS)}, then napped with one eye
            open.
          </p>
        )}
      </header>

      <section className={styles.haul} aria-labelledby="haul-title">
        <h2 id="haul-title" className={styles.haulTitle}>
          The haul
        </h2>
        <ul className={styles.gains}>
          {Object.entries(summary.items).map(([itemId, quantity]) => (
            <li key={itemId} className={styles.gain}>
              <span className={styles.itemAmount}>+{quantity.toLocaleString()}</span>
              <span>{content.items[itemId]?.name ?? itemId}</span>
            </li>
          ))}
          {Object.entries(summary.experience).map(([skillId, experience]) => (
            <li key={skillId} className={styles.gain}>
              <span className={styles.xpAmount}>+{experience.toLocaleString()}</span>
              <span>{content.skills[skillId]?.name ?? skillId} XP</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className={styles.bottom}>
        <button className={styles.continue} onClick={onContinue} autoFocus>
          Continue
        </button>
      </footer>
    </article>
  );
}

/** "12h", "3h 05m" or "42m". */
function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

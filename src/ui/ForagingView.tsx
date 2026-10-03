"use client";

import { useEffect, useState } from "react";
import { advanceGame, type Content, type GameState } from "@/engine/engine";
import styles from "./game.module.css";

/** Current time, refreshed every animation frame while mounted. */
function useAnimationClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let frame = requestAnimationFrame(function onFrame() {
      setNow(Date.now());
      frame = requestAnimationFrame(onFrame);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return now;
}

interface ForagingViewProps {
  name: string;
  /** The last save from the server, which live play advances locally. */
  state: GameState;
  clockOffsetMs: number;
  content: Content;
}

export function ForagingView({ name, state, clockOffsetMs, content }: ForagingViewProps) {
  const now = useAnimationClock() + clockOffsetMs;
  const { duck, currentAction } = advanceGame(state, content, now);
  const action = currentAction ? content.actions[currentAction.actionId] : null;

  return (
    <div className={styles.play}>
      <header className={styles.header}>
        <p className={styles.muted}>Your Duck</p>
        <h1 className={styles.title}>{name}</h1>
      </header>

      {action && currentAction && (
        <section className={styles.card} aria-labelledby="action-name">
          <h2 id="action-name" className={styles.sectionTitle}>
            {action.name}
          </h2>
          <p className={styles.muted}>{action.description}</p>
          <CycleProgress fraction={(now - currentAction.cycleStartedAt) / action.cycleMs} />
          <SkillExperience
            skillName={content.skills[action.skillId]?.name ?? action.skillId}
            experience={duck.skills[action.skillId]?.experience ?? 0}
          />
        </section>
      )}

      <section className={styles.card} aria-labelledby="inventory-title">
        <h2 id="inventory-title" className={styles.sectionTitle}>
          Inventory
        </h2>
        <Inventory inventory={duck.inventory} content={content} />
      </section>
    </div>
  );
}

function CycleProgress({ fraction }: { fraction: number }) {
  const clamped = Math.min(Math.max(fraction, 0), 1);
  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-label="Current Cycle"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(clamped * 100)}
    >
      <div className={styles.progressFill} style={{ transform: `scaleX(${clamped})` }} />
    </div>
  );
}

function SkillExperience({ skillName, experience }: { skillName: string; experience: number }) {
  return (
    <p className={styles.stat}>
      <span>{skillName} experience</span>
      <Counter value={experience} />
    </p>
  );
}

function Inventory({ inventory, content }: { inventory: Record<string, number>; content: Content }) {
  const entries = Object.entries(inventory).filter(([, quantity]) => quantity > 0);
  if (entries.length === 0) {
    return <p className={styles.muted}>Empty. The Duck is working on it.</p>;
  }
  return (
    <ul className={styles.inventory}>
      {entries.map(([itemId, quantity]) => {
        const item = content.items[itemId];
        return (
          <li key={itemId} className={styles.item}>
            <div className={styles.stat}>
              <span>{item?.name ?? itemId}</span>
              <Counter value={quantity} prefix="×" />
            </div>
            {item && <p className={styles.itemText}>{item.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/** A number that bumps visibly each time it changes. */
function Counter({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <strong key={value} className={styles.counter}>
      {prefix}
      {value.toLocaleString()}
    </strong>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  advanceGame,
  type ActionDefinition,
  type Content,
  type GameState,
  type ItemId,
} from "@/engine/engine";
import styles from "./shell.module.css";

const HOUR_MS = 3_600_000;
/** How many completed Cycles the record keeps on show. */
const RECORD_LENGTH = 8;

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

interface LiveCycle {
  actionName: string;
  fraction: number;
  elapsedMs: number;
  cycleMs: number;
}

/** The reversed band across the top; while an Action runs, its Cycle runs along the foot. */
export function Masthead({ live }: { live?: LiveCycle }) {
  return (
    <header className={styles.masthead}>
      <div className={styles.mastheadInner}>
        <p className={styles.wordmark}>Duckshire</p>
        <p className={styles.region}>Pondhaven</p>
        {live && (
          <p className={styles.mastheadLive} aria-hidden="true">
            <span className={styles.mastheadAction}>{live.actionName}</span>
            <span className={styles.mastheadTime}>
              {formatSeconds(live.elapsedMs)} / {formatSeconds(live.cycleMs)}
            </span>
          </p>
        )}
      </div>
      {live && (
        <div className={styles.cycleLine} aria-hidden="true">
          <div style={{ transform: `scaleX(${live.fraction})` }} />
        </div>
      )}
    </header>
  );
}

interface GameShellProps {
  name: string;
  /** The last save from the server, which live play advances locally. */
  state: GameState;
  clockOffsetMs: number;
  /** Device time of the last save. */
  savedAt: number;
  content: Content;
}

export function GameShell({ name, state, clockOffsetMs, savedAt, content }: GameShellProps) {
  const now = useAnimationClock() + clockOffsetMs;
  const advanced = advanceGame(state, content, now);
  const { duck, currentAction } = advanced;
  const action = currentAction ? content.actions[currentAction.actionId] : null;
  const record = useCycleRecord(advanced, action);

  const elapsedMs =
    action && currentAction ? clampMs(now - currentAction.cycleStartedAt, action.cycleMs) : 0;
  const fraction = action ? elapsedMs / action.cycleMs : 0;

  return (
    <div className={styles.shell}>
      <Masthead
        live={
          action
            ? { actionName: action.name, fraction, elapsedMs, cycleMs: action.cycleMs }
            : undefined
        }
      />

      <main className={styles.board}>
        <section className={styles.entry} aria-labelledby="duck-name">
          <div className={styles.entryDuck}>
            <span className={styles.fieldLabel}>Duck</span>
            <h1 id="duck-name" className={styles.duckName}>
              {name}
            </h1>
          </div>

          {action ? (
            <ActionEntry
              action={action}
              content={content}
              fraction={fraction}
              elapsedMs={elapsedMs}
              experience={duck.skills[action.skillId]?.experience ?? 0}
            />
          ) : (
            <p className={styles.entryIdle}>The Duck is resting. Choose an Action to start it.</p>
          )}

          <RecentCycles
            record={record}
            content={content}
            action={action}
            clockOffsetMs={clockOffsetMs}
          />
        </section>

        <section className={styles.panel} aria-labelledby="skills-title">
          <h2 id="skills-title" className={styles.band}>
            Skills
          </h2>
          <SkillList content={content} state={advanced} />
        </section>

        <section className={styles.panel} aria-labelledby="inventory-title">
          <h2 id="inventory-title" className={styles.band}>
            Inventory
            <span className={styles.bandMeta}>{countLabel(duck.inventory)}</span>
          </h2>
          <Inventory inventory={duck.inventory} content={content} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          Progress saves automatically. Last saved{" "}
          <time dateTime={new Date(savedAt).toISOString()}>{formatClock(savedAt)}</time>.
        </p>
      </footer>
    </div>
  );
}

interface ActionEntryProps {
  action: ActionDefinition;
  content: Content;
  fraction: number;
  elapsedMs: number;
  experience: number;
}

function ActionEntry({ action, content, fraction, elapsedMs, experience }: ActionEntryProps) {
  const cyclesPerHour = HOUR_MS / action.cycleMs;
  const skill = skillName(content, action);

  return (
    <div className={styles.action}>
      <div className={styles.actionHead}>
        <span className={styles.classNumber} aria-hidden="true">
          {skillNumber(content, action.skillId)}
        </span>
        <div>
          <h2 className={styles.actionName}>{action.name}</h2>
          <p className={styles.actionSkill}>{skill}</p>
        </div>
      </div>
      <p className={styles.flavour}>{action.description}</p>

      <div className={styles.cycle}>
        <div className={styles.cycleLabel}>
          <span>Cycle</span>
          <span className={styles.figure}>
            {formatSeconds(elapsedMs)} / {formatSeconds(action.cycleMs)}
          </span>
        </div>
        <div
          className={styles.cycleTrack}
          role="progressbar"
          aria-label="Current Cycle"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(fraction * 100)}
          style={{ "--seconds": action.cycleMs / 1000 } as React.CSSProperties}
        >
          <div className={styles.cycleFill} style={{ transform: `scaleX(${fraction})` }} />
        </div>
      </div>

      <dl className={styles.rates}>
        <div>
          <dt>Per Cycle</dt>
          <dd>
            {action.yields.map(({ itemId, quantity }) => (
              <span key={itemId} className={styles.gainText}>
                {quantity} {itemName(content, itemId)}
              </span>
            ))}
            <span className={styles.xpText}>{action.experiencePerCycle} XP</span>
          </dd>
        </div>
        <div>
          <dt>Per hour</dt>
          <dd>
            {action.yields.map(({ itemId, quantity }) => (
              <span key={itemId} className={styles.gainText}>
                {formatNumber(quantity * cyclesPerHour)} {itemName(content, itemId)}
              </span>
            ))}
            <span className={styles.xpText}>
              {formatNumber(action.experiencePerCycle * cyclesPerHour)} XP
            </span>
          </dd>
        </div>
        <div>
          <dt>{skill} XP</dt>
          <dd>
            <strong className={styles.xpTotal}>
              {formatNumber(experience)}
            </strong>
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface CycleRecordEntry {
  /** Server-clock ms when the last Cycle in this entry completed. */
  completedAt: number;
  cycles: number;
  items: Record<ItemId, number>;
  experience: number;
}

interface CycleSnapshot {
  cycleStartedAt: number | null;
  inventory: Record<ItemId, number>;
  experience: number;
}

/**
 * Completed Cycles seen while this page has been open, newest first.
 * Derived during render: whenever the in-progress Cycle moves on, the
 * difference from the previous snapshot is stamped onto the record.
 */
function useCycleRecord(state: GameState, action: ActionDefinition | null) {
  const snapshot: CycleSnapshot = {
    cycleStartedAt: state.currentAction?.cycleStartedAt ?? null,
    inventory: state.duck.inventory,
    experience: action ? (state.duck.skills[action.skillId]?.experience ?? 0) : 0,
  };
  const [record, setRecord] = useState<{ last: CycleSnapshot; entries: CycleRecordEntry[] }>({
    last: snapshot,
    entries: [],
  });

  const { last } = record;
  if (snapshot.cycleStartedAt !== last.cycleStartedAt) {
    const moved =
      action && last.cycleStartedAt !== null && snapshot.cycleStartedAt !== null
        ? Math.round((snapshot.cycleStartedAt - last.cycleStartedAt) / action.cycleMs)
        : 0;
    const items: Record<ItemId, number> = {};
    for (const [itemId, quantity] of Object.entries(snapshot.inventory)) {
      const gained = quantity - (last.inventory[itemId] ?? 0);
      if (gained > 0) items[itemId] = gained;
    }
    const entries =
      moved > 0
        ? [
            {
              completedAt: snapshot.cycleStartedAt!,
              cycles: moved,
              items,
              experience: snapshot.experience - last.experience,
            },
            ...record.entries,
          ].slice(0, RECORD_LENGTH)
        : record.entries;
    setRecord({ last: snapshot, entries });
  }

  return record.entries;
}

interface RecentCyclesProps {
  record: CycleRecordEntry[];
  content: Content;
  action: ActionDefinition | null;
  clockOffsetMs: number;
}

function RecentCycles({ record, content, action, clockOffsetMs }: RecentCyclesProps) {
  return (
    <div className={styles.record}>
      <h2 className={styles.ruleHeading}>Recent Cycles</h2>
      {record.length === 0 ? (
        <p className={styles.recordEmpty}>
          {action
            ? `Each completed Cycle is recorded here, every ${formatSeconds(action.cycleMs)}.`
            : "Completed Cycles are recorded here."}
        </p>
      ) : (
        <ol className={styles.recordList}>
          {record.map((entry) => (
            <li key={entry.completedAt} className={styles.recordRow}>
              <time className={styles.figure}>{formatClock(entry.completedAt - clockOffsetMs)}</time>
              <span className={styles.recordGains}>
                {Object.entries(entry.items).map(([itemId, quantity]) => (
                  <span key={itemId} className={styles.gainText}>
                    +{formatNumber(quantity)} {itemName(content, itemId)}
                  </span>
                ))}
                {entry.experience > 0 && (
                  <span className={styles.xpText}>
                    +{formatNumber(entry.experience)} {action && skillName(content, action)} XP
                  </span>
                )}
              </span>
              {entry.cycles > 1 && (
                <span className={styles.recordCycles}>{entry.cycles} Cycles</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SkillList({ content, state }: { content: Content; state: GameState }) {
  const current = state.currentAction ? content.actions[state.currentAction.actionId] : null;
  return (
    <ol className={styles.skills}>
      <li className={`${styles.tableHead} ${styles.skillHead}`} aria-hidden="true">
        <span>No.</span>
        <span>Skill</span>
        <span>XP</span>
      </li>
      {Object.values(content.skills).map((skill, index) => {
        const active = current?.skillId === skill.id;
        return (
          <li
            key={skill.id}
            className={styles.skill}
            data-active={active || undefined}
            aria-current={active ? "true" : undefined}
          >
            <span className={styles.classNumber} aria-hidden="true">
              {index + 1}
            </span>
            <span className={styles.skillName}>
              {skill.name}
              {active && <span className={styles.skillState}>Training</span>}
            </span>
            <span className={`${styles.figure} ${styles.skillXp}`}>
              {formatNumber(state.duck.skills[skill.id]?.experience ?? 0)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Inventory({ inventory, content }: { inventory: Record<ItemId, number>; content: Content }) {
  const [open, setOpen] = useState<ItemId | null>(null);
  const lots = Object.keys(content.items);
  const entries = Object.entries(inventory).filter(([, quantity]) => quantity > 0);

  if (entries.length === 0) {
    return <p className={styles.panelEmpty}>Empty. The Duck is working on it.</p>;
  }
  return (
    <ul className={styles.lots}>
      <li className={`${styles.tableHead} ${styles.lotHead}`} aria-hidden="true">
        <span>No.</span>
        <span>Item</span>
        <span>Qty</span>
      </li>
      {entries.map(([itemId, quantity]) => {
        const item = content.items[itemId];
        const expanded = open === itemId;
        return (
          <li key={itemId} className={styles.lot}>
            <button
              className={styles.lotRow}
              aria-expanded={expanded}
              aria-controls={`lot-${itemId}`}
              onClick={() => setOpen(expanded ? null : itemId)}
            >
              <span className={`${styles.lotNumber} ${styles.figure}`}>
                {String(lots.indexOf(itemId) + 1).padStart(3, "0")}
              </span>
              <span className={styles.lotName}>{item?.name ?? itemId}</span>
              <strong className={styles.figure}>
                {formatNumber(quantity)}
              </strong>
            </button>
            {item && (
              <p id={`lot-${itemId}`} className={styles.lotNote} hidden={!expanded}>
                {item.description}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const clampMs = (value: number, max: number) => Math.min(Math.max(value, 0), max);

const skillName = (content: Content, action: ActionDefinition) =>
  content.skills[action.skillId]?.name ?? action.skillId;

const skillNumber = (content: Content, skillId: string) =>
  Object.keys(content.skills).indexOf(skillId) + 1;

const itemName = (content: Content, itemId: ItemId) => content.items[itemId]?.name ?? itemId;

const formatNumber = (value: number) => Math.round(value).toLocaleString();

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const formatClock = (ms: number) =>
  new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function countLabel(inventory: Record<ItemId, number>) {
  const kinds = Object.values(inventory).filter((quantity) => quantity > 0).length;
  return kinds === 1 ? "1 item" : `${kinds} items`;
}

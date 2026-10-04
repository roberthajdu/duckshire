# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Duckshire has one primary audience, served in two stages through gradual unlock:

- **Newcomers arriving from a shared link** (a Duck card or a return summary). They may never have played an idle RPG. They need to go from opening the link to a running first Action in seconds, with nothing to read first.
- **Idle RPG veterans** who know Melvor Idle and RuneScape-style skilling. They expect density: many Skills, levels and XP numbers, inventory grids, gear slots, and precise rates visible at once.

The fully unlocked game is designed for the veteran. A new Duck starts with most of it hidden or locked, and the interface fills in as Skills level up (issue #14). Newcomers grow into veterans; the design never forks into a "simple mode."

Desktop and phone carry equal weight. Players leave the game open in a desktop browser tab and also check in on their phone. Both are first-class play scenes, and dense layouts must work on each.

## Product Purpose

Duckshire is a duck-themed idle RPG in the Melvor Idle style. A single named Duck performs one Action at a time in real time and while the player is away, levels Skills, crafts Material Tier gear, and grows in Power. The vertical slice covers Pondhaven: Foraging, Fishing, Diving, Cooking and Beaksmithing, Feathers and a limited inventory, ending at the Moon Heron milestone, which unlocks the next Region.

Success means a player opens a link, names a Duck, watches it work immediately, comes back hours later to real progress, and wants to share what happened.

## Positioning

It has the systemic depth of Melvor (Skills, Material Tiers, Offline Progress that matches live play) with a duck fantasy that is funny but affectionate, plus anonymous instant play with no signup. Sharing hooks, the Duck card and the return summary, are part of the core loop rather than an afterthought.

## Operating Context

- Sessions are short check-ins: return, read the summary of what happened while away, pick the next Action, leave. Some players also keep a long-running tab open.
- Offline Progress is capped at 12 hours. The return summary explains gains and why the Duck stopped, if it did.
- Players share screenshots of the return summary and the Duck card.
- Input is touch and mouse. Nothing relies on hover or a keyboard.

## Capabilities and Constraints

- Next.js 16 web app with a pure Game Engine (`src/engine`), content defined as data (`src/content`), and a save API (`src/server`). The server is authoritative for Offline Progress.
- Built so far: an anonymous Duck plays Foraging; Offline Progress with a return summary.
- Planned (open issues #5–#17): Skill levels and unlocks, Fishing and Diving, a limited inventory with selling for Feathers and stop reasons, Cooking, Beaksmithing with equipment slots and Power, tools that speed up gathering, the Moon Heron, Breed choice, account claiming, gradual unlocks, a pixel art style guide, a Duck sprite that shows Breed and gear, and the shareable Duck card.
- The terminology in `CONTEXT.md` is binding in all UI copy (Duck, Breed, Skill, Action, Cycle, Region, Power, Material Tier, Feathers, Offline Progress, and the others listed there).
- Mastery, Skillcapes, combat, rarity tiers, and multiplayer are designed for but not built. The UI must leave room for them without showing them.

## Brand Commitments

- Name: **Duckshire**. Tagline in use: "Name a duck. Watch it forage. Become unreasonably proud of it."
- Tone: **a serious frame with funny text.** The interface behaves like a sober, competent idle RPG with no cartoonish chrome. Humor lives in content: item names, Action flavor text, the Moon Heron's introduction, and stat lines on the Duck card. The humor is deadpan, affectionate, and quotable.
- Art: 2D pixel art against a locked palette and resolution, with a written style guide (issue #15). Assets outside the palette are rejected.
- Melvor Idle is the explicit reference for density and seriousness.

## Evidence on Hand

- Product requirements: GitHub issue #1 (vertical slice PRD); domain glossary: `CONTEXT.md`.
- Content definitions: `src/content/content.ts`.
- No pixel art assets yet. `public/` holds only Next.js scaffold SVGs. No player testimonials, metrics, or press exist, so none may be fabricated.

## Product Principles

1. **Progress is always visible.** A Cycle in motion, XP gained, and the next unlock are never more than a glance away.
2. **Depth is revealed, not dumped.** The full Melvor-grade interface is the destination, and gradual unlock is the path there.
3. **Deadpan beats cute.** The interface is earnest and precise; the jokes are in the words.
4. **Offline equals live.** The interface never implies that being away is a penalty or a loophole; summaries are exact.
5. **Every screen is shareable.** The return summary and the Duck card are designed to be screenshotted.

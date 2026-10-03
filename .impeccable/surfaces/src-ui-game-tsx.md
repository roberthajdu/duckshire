---
version: 1
slug: "src-ui-game-tsx"
primary_target: "src/ui/Game.tsx"
related_targets: ["src/ui/ForagingView.tsx","src/ui/ReturnSummary.tsx"]
---

# Game shell

Scope: the persistent game frame (masthead, Skill schedule, current Action, inventory), plus the naming screen and return summary brought into the same world. Mode: Operate.

Audience and job: newcomers need a running Action in seconds; veterans need Melvor-grade density. Real data only (Foraging, Duckweed); slots for future Skills and systems live in the layout and stay hidden until content fills them.

Red lines: no generic SaaS dashboard, no fake pixel-art chrome before #15, not sparse by design, no cutesy UI copy (jokes live in content).

## Direction contract

THESIS: The Duck is entered in the Pondhaven show. Skills are numbered Classes in a printed schedule, the current Action is the entry on the bench, and every Cycle is judged in public. It refuses the Melvor slate-sidebar-and-cards arrangement and the cozy cream pond game.

OWN-WORLD: Letterpress schedule on cool white card stock (#f4f5f0) in green-black ink (#16231b). Reversed ink bands carry headings. Ruled class tables have hairline rules and tabular figures, set in condensed grotesque caps. Prize-card colours are state only: red is the live entry and its Cycle, blue is experience, yellow is Feathers, and green is gains. Square corners, with no cards-in-cards and no rosettes or bunting.

STORY: The player sees their Duck working right now, what it earns per Cycle, and where the haul is piling up. They trust the numbers and come back.

FIRST VIEWPORT: Desktop has a reversed masthead with the Cycle line running along its foot. Below it are three columns: the Schedule of Classes on the left, the Entry card (Duck name, Action, Cycle bar, rates, judging record) in the centre at the largest type, and the Exhibits lot table on the right. On phone the masthead and Entry stack first, then the Schedule and Exhibits.

FORM: Village produce show schedule, list position 7, seed key 505f8dcd. Raises: number everything (catalog); stamp states, never vanish (ticket wallet); two-size register, rank by weight/case/reversal (timetable); tabular quantities on one neutral ramp (darkroom). Signature interaction: each completed Cycle stamps a line onto the entry's judging record.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

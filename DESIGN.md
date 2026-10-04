---
name: Duckshire
description: A village produce show schedule, printed in green-black ink on cool card stock, for a duck-themed idle RPG.
colors:
  card: "#f4f5f0"
  card-inset: "#e8eae2"
  ink: "#16231b"
  ink-soft: "#4a5a50"
  ink-faint: "#66736a"
  rule: "#c5cabd"
  on-ink: "#f4f5f0"
  on-ink-soft: "#aab7ad"
  first: "#c8202f"
  second: "#1f4fa0"
  third: "#f2c230"
  commended: "#2f7d3a"
typography:
  display:
    fontFamily: "Zilla Slab, Georgia, serif"
    fontSize: "clamp(2.75rem, 2rem + 4vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "lnum, pnum"
  headline:
    fontFamily: "Zilla Slab, Georgia, serif"
    fontSize: "clamp(1.625rem, 1.25rem + 1.5vw, 2.375rem)"
    fontWeight: 700
    lineHeight: 1.1
  wordmark:
    fontFamily: "Zilla Slab, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1
  figure:
    fontFamily: "Zilla Slab, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "lnum, tnum"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
spacing:
  cell-y: "8px"
  cell-x: "12px"
  page-x: "16px"
  sheet: "20px"
  entry-x: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.first}"
    textColor: "{colors.on-ink}"
  button-primary-disabled:
    backgroundColor: "{colors.rule}"
    textColor: "{colors.ink-soft}"
  heading-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  table-head:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "6px 12px"
  table-row:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 12px"
    height: "48px"
  table-row-active:
    backgroundColor: "{colors.card-inset}"
  class-number:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "1.75rem"
  class-number-active:
    backgroundColor: "{colors.first}"
    textColor: "{colors.card}"
  input-name:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 0"
    height: "48px"
  state-stamp:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 7px"
---

# Design System: Duckshire

## Overview

**Creative North Star: "The Pondhaven Show Schedule"**

Duckshire is set like the printed schedule of a village produce show. The Duck is an entrant, Skills are numbered classes, the current Action is the entry on the bench, and every Cycle is judged in public. The page is cool white card stock in green-black ink: reversed ink bands carry headings, ruled tables carry the data, and condensed grotesque capitals label everything. Numbers are tabular and trustworthy. The frame is sober and competent; the jokes live in content (item notes, Action flavour text), never in chrome.

Density is the default. Three columns on desktop (Skills, the entry, Inventory) put the running Action, its rates, and the haul in one glance; on phones the same sheet stacks with the entry first. Hierarchy comes from weight, case, width, and reversal rather than from many type sizes, and colour is held back for state: four prize-card colours, each meaning exactly one thing.

The world is light-only for now (`color-scheme: light`); there is no dark theme yet. Surfaces are flat printed paper with square corners. It rejects the slate-sidebar-and-cards idle-game arrangement and the cosy cream pond-game look.

**Key Characteristics:**
- Green-black ink on cool card stock; ink is the only structural colour.
- Reversed ink bands as section headings; hairline-ruled tables with head rows and an ink end rule.
- Two families: Archivo (with its width axis) for everything read, Zilla Slab for names and headline figures.
- Prize-card colours are state, never decoration.
- Square corners everywhere; no cards inside cards.
- One signature motion: the newest Recent Cycles row is stamped in.

## Colors

A near-monochrome ink-and-card palette with four prize-card colours held in reserve for state.

### Primary
- **First-Prize Red** (`first`): the live thing. The Cycle bar fill (in the entry and along the masthead foot), the filled class number of the running Action and the active Skill, the "Training" state on the active Skill row, the text caret, error text, and the pointer hover of the ink button.

### Secondary
- **Second-Prize Blue** (`second`): experience, only where XP is the subject. The Skill's XP total in the entry rates, the XP gain on the newest Recent Cycles row, and XP amounts in the return-summary haul.

### Tertiary
- **Commended Green** (`commended`): fresh gains. Item gains on the newest Recent Cycles row, the wash of the stamp animation, and item amounts in the return-summary haul.
- **Third-Prize Yellow** (`third`): reserved for Feathers. Defined but not yet used. At 1.5:1 against card it cannot carry text; use it as a fill under ink text.

### Neutral
- **Show Ink** (`ink`): all text, every structural rule (panel edges, table end rules, the double rule under the Duck), heading bands, the masthead, the primary button, focus rings, and text selection.
- **Pencilled Ink** (`ink-soft`): labels, table heads, secondary lines (Skill under the Action, times in Recent Cycles, item notes, footer, ledes).
- **Faint Ink** (`ink-faint`): placeholder text and the scrollbar thumb only. It sits right at 4.5:1 on card, so keep it off anything smaller or lighter.
- **Card Stock** (`card`): the page and every sheet.
- **Card Inset** (`card-inset`): the active or expanded row (active Skill, open Inventory lot and its note, row hover).
- **Hairline** (`rule`): interior table rules, the second marks in the Cycle track, and the disabled button.
- **On Ink** (`on-ink`) and **On Ink Soft** (`on-ink-soft`): text in reversed bands and the masthead; the soft tone carries the region name, band counts, and the masthead Action.

### Named Rules
**The Prize-Card Rule.** Red, blue, green, and yellow mean live, experience, gains, and Feathers. Nothing else gets them. Quantities otherwise sit in ink: per-Cycle and per-hour rates, older Recent Cycles rows, and Inventory quantities are all ink.

**The Fresh-Stamp Rule.** Gain colour belongs to what has just happened. Only the newest Recent Cycles row and the return-summary haul show green and blue gains; once a row is no longer newest, it returns to ink.

**The Ink Focus Rule.** Focus rings are ink (2px solid, 2px offset), never a prize colour. Rows inside tables draw the ring inset (-2px offset) so it stays inside the rules. The name input thickens its underline instead.

## Typography

**Display Font:** Zilla Slab 600/700 (with Georgia, serif)
**Body Font:** Archivo, variable with a width axis (with Helvetica Neue, Arial, sans-serif)

**Character:** A printer's slab for the things that are named and the figures that are announced, over a workhorse grotesque that condenses to 75% width for capital labels, as a show schedule sets them.

### Hierarchy
- **Display** (Zilla Slab 700, clamp 2.75rem to 3.75rem, line-height 1, lining proportional figures): the "Kept busy for" duration on the return summary. One per sheet.
- **Headline** (Zilla Slab, clamp 1.625rem to 2.375rem, line-height 1.1): the Duck's name (700) and the Action's name (600). The name input uses Zilla Slab 600 at 1.625rem.
- **Wordmark** (Zilla Slab 700, 1.375rem, line-height 1): "Duckshire" in the masthead only.
- **Figure** (Zilla Slab 700, 1.5rem, lining tabular figures): gain amounts in the return-summary haul.
- **Body** (Archivo 400, 0.9375rem, line-height 1.45): everything read. Flavour text is italic and held to 60ch.
- **Label** (Archivo 700, 0.9375rem, 75% width, 0.06em tracking, uppercase): heading bands, table heads, field labels, rate labels, the "Training" state, buttons, stamps.

### Named Rules
**The One-Register Rule.** Archivo runs at one size (0.9375rem). Rank inside it by weight (400/700/800), case, width, and reversal into an ink band, not by stepping the size.

**The Tabular Rule.** Every quantity, time, and count is set with tabular figures (`tnum`) so columns align and ticking values do not jitter. Zilla Slab numerals are lining (`lnum`); its default old-style figures are not used for numbers.

## Layout

The board is centred at a maximum of 80rem. Below 40rem it is a single column: masthead, the entry, Skills, Inventory, each panel opened by an ink top rule. From 40rem the entry spans the top and Skills and Inventory sit side by side, split by an ink rule. From 64rem it becomes the three-column schedule: Skills (16rem), the entry (flexible), Inventory (20rem), with ink rules on the outer edges and between columns.

The masthead is sticky, reversed, and carries the live Cycle as a 4px line along its foot. On phones it drops the Action name and keeps only the Cycle figure. Single-sheet screens (naming, loading, errors, return summary) centre one sheet of at most 30rem (28rem for the results slip) with top padding of clamp(24px, 8vh, 72px). Safe-area insets are honoured at top and bottom.

Spacing is a working rhythm rather than a scale: table cells pad 8px by 12px, the page inset is 16px on phones, sheets pad 20px, and the entry pads 20px/16px on phones, 28px/24px from 40rem, and 28px/32px from 64rem. Every tappable row and button is at least 48px tall. Label-and-value rate rows turn from three columns to stacked rows below 40rem.

## Elevation & Depth

The schedule is flat paper. Depth is conveyed by ink: reversed bands, ink rules, the 3px double rule under the Duck and the summary header, and the card-inset tone for active rows. The return-summary results slip is the one lifted sheet, carrying a soft ambient shadow (`0 10px 28px -12px rgb(22 35 27 / 0.35)`) because it is handed to the player and screenshotted.

### Named Rules
**The Printed-Paper Rule.** Nothing on the board casts a shadow. Separation is a rule, a band, or a tone, never elevation.

## Shapes

Square corners throughout (0px), including buttons and inputs. Borders do the shaping: 1px ink for structure, 1px hairline for interior rows, 1.5px ink for boxed elements (class numbers, the Cycle track, form sheets, the results slip, state stamps), 2px ink for the name input's underline, and a 3px double ink rule to close an entrant's header. Sheets and panels never nest inside other sheets; the small boxed marks (class numbers, state stamps, the Cycle track) are type furniture, not containers.

## Components

### Buttons
Solid, square, printed in ink.
- **Shape:** square (0px), at least 48px tall, 22px side padding.
- **Primary:** ink fill, on-ink label in condensed caps.
- **Hover / Focus:** on pointer devices, hover turns the fill first-prize red over 150ms (`cubic-bezier(0.16, 1, 0.3, 1)`); press nudges down 1px; focus is the ink ring.
- **Disabled:** hairline fill with pencilled-ink label.

### Heading Bands
The reversed ink strip that opens every panel and sheet: condensed caps on ink, 7px by 12px, with optional right-aligned meta in on-ink-soft (for example the Inventory item count).

### Rule Headings
A condensed-caps heading followed by a 1px ink line running to the column edge ("Recent Cycles", "The haul"). Used for subsections inside a sheet that already has a band.

### Ruled Tables
Skills and Inventory are printed tables. A head row in pencilled condensed caps sits over a 1px ink rule; rows are at least 48px with 1px hairline rules between them; the last row closes on an ink end rule. Lots are numbered with three-digit tabular figures (001). Inventory rows are buttons that expand an item note on a card-inset ground.

### Class Number
A 1.75rem square boxed in 1.5px ink with a weight-800 tabular numeral. On the running Action and the active Skill it fills first-prize red with card-coloured numerals.

### Cycle Track
An 18px track boxed in 1.5px ink, divided by hairline marks at each second, filling left to right in first-prize red. The same fill runs as a 4px line along the masthead foot.

### Rates
A three-column definition list between ink rules, columns split by hairlines: pencilled caps label over bold tabular values in ink. Only the Skill's XP total takes blue.

### Inputs / Fields
- **Style:** no box. Zilla Slab 600 at 1.625rem on a transparent ground over a 2px ink underline; the field label sits above in pencilled caps.
- **Focus:** the underline thickens by 1px of ink.
- **Error:** bold first-prize red text below the field.

### Recent Cycles (signature)
The entry's judging record: up to eight rows of time, gains, and an optional Cycle count, ruled in hairline. When a Cycle completes, the new row is stamped in: it wipes in from the left on a 22% commended wash over 700ms and settles; its item gains read green and its XP blue. This stamp is the world's signature motion and is removed under reduced motion.

### Results Slip
The return summary: a 1.5px ink-boxed sheet opened by a heading band, the Duck's name in headline slab, the worked duration as display figures, label-and-value fact rows ruled in hairline, a double rule, then the haul as slab figures (green items, blue XP) and a right-aligned ink button. A capped duration carries a boxed condensed-caps state stamp ("Limit reached") beside the figure.

## Do's and Don'ts

### Do:
- **Do** open every panel and sheet with a reversed ink heading band.
- **Do** set every quantity, time, and count in tabular figures, and Zilla Slab numerals as lining figures.
- **Do** give tables a pencilled head row, hairline row rules, and an ink end rule.
- **Do** keep Archivo at the one text size (0.9375rem) and rank by weight, case, width (75%), and reversal.
- **Do** keep tappable rows and buttons at least 48px tall, with any hover treatment gated behind `(hover: hover)`.
- **Do** use CONTEXT.md terms in UI copy (Skills, Inventory, Cycle, Action), not show vocabulary.

### Don't:
- **Don't** colour a quantity unless it is live (red), experience as the subject (blue), a fresh gain (green), or Feathers (yellow).
- **Don't** use a prize colour for focus rings, borders, or decoration; focus is ink.
- **Don't** round corners or set a card inside a card; boxed marks such as class numbers and state stamps are the exception because they are type, not sheets.
- **Don't** add shadows to anything on the board; the results slip is the only lifted sheet.
- **Don't** add a dark theme by inverting tokens; the world is light-only until one is designed.
- **Don't** add rosettes, bunting, or other show decoration; the show lives in the typesetting.

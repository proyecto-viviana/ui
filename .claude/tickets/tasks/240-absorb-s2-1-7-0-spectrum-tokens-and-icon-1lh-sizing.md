---
id: 240
type: task
title: "Absorb S2 1.7.0 spectrum-tokens 14.15.0 and icon 1lh sizing"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "copied S2 1.7.0 1lh icon/avatar/progress source, style-macro lh/rlh + POSTFIX 17, color-scheme media query, CloseButton overlay contrast, vertical ActionButtonGroup width, Calendar/RangeCalendar nav 1lh; gates below",
    }
---

## Cause

S2 1.7.0 pins `@adobe/spectrum-tokens` 14.15.0 (was 14.0.0) and sizes
workflow icons with the CSS `lh` unit so they match text line height.
Release note: "Size icons to match the text line height using the lh unit"
and "If you rely on visual regression tests, expect diffs around icon
sizing". Source on `f56660b`: ActionButton `--iconWidth` and icon/avatar/
progress sizes become `'1lh'`
(`packages/@react-spectrum/s2/src/ActionButton.tsx`); same pattern on
ComboBox, Menu, ListView, TreeView, Badge, Button, CloseButton, Field,
SearchField, TagGroup, ToggleButton, NotificationBadge, DragPreview. Avatar
accepts `` `${number}lh` `` (`Avatar.tsx`). ActionButtonGroup vertical
items get `width: '100%'`. `style-utils` color-scheme `light dark` uses a
prefers-color-scheme media query. ActionBar close-button contrast, Menu
`staticColor: 'auto'` for inner buttons, and TableView empty `:has()` are
the other 1.7.0 styled-source deltas. Local still uses `fontRelative(20)`
and tokens 14.15.0 are pinned but styles have not been regenerated through
the macro. ADR 0001: S2 styling is generated from tokens in solid-spectrum;
never hand-tune to make a screenshot pass.

## Work

Regenerate solid-spectrum (and viviana-ui token consumption) from 14.15.0.
Copy the 1lh icon/avatar/progress source from pinned S2. Absorb ActionBar,
Menu staticColor, TableView `:has()`, ActionButtonGroup width, and
color-scheme media-query source. Do not loosen visual thresholds.

## Done when

Styled components match S2 1.7.0 icon metrics and token paint under the
comparison pair/certified gates; any remaining visual miss is a new ticket
with source evidence, not a threshold change.

## Relationship

Child of #220. ADR 0001. Token pin policy is #143 (already verified).
Distinct from #207 (size union alphabet).

## Landed

Macro (`packages/solid-spectrum/src/style/style-macro.ts` and identical
viviana-ui twin): `LengthPercentageUnit` gained `lh`/`rlh`; the percentage
regex accepts them; class-name `POSTFIX` is `"17"` for S2 1.7.0.

Mirrored identical twins: `style/style-macro.ts`, `button/ToggleButton.tsx`,
`button/s2-progress-circle-styles.ts`, `menu/ActionMenu.tsx`,
`notificationbadge/index.tsx`.

Diverged twins received the corresponding hunk where it applied:
ActionButton/Button/LinkButton styles and icon/avatar/progress sizes,
Avatar `${number}lh` + ImageContext reset, Badge, CloseButton contrast,
Field prefix (and viviana-ui suffix), FieldErrorIcon copies, SearchField,
ListView, Menu icon, TreeView, ComboBox/Picker/TextField/NumberField/
Date*/ColorField error icons, `setColorScheme` media query,
Calendar/RangeCalendar nav chevrons `'1lh'` (corresponding ActionButton
hunk; S2 Calendar uses quiet ActionButton + workflow chevrons, the port
inlines nav buttons). viviana-ui Button/ActionButton keep the documented
`fontRelative(16)` local icon size (the 1.7.0 hunk was `fontRelative(20)`
→ `'1lh'`). Avatar isLH outline branch does not apply to viviana-ui's
fixed `outlineWidth: 2`.

Not absorbed (no matching port surface for the S2 hunk):

- TagGroup icon/image `1lh` — the port has no IconContext/ImageContext size
  on tags.
- DragPreview icon `1lh` — `dnd/index.tsx` is headless re-exports only.
- ComboBox progressCircle `1lh` and ComboBoxItem avatar `1lh` — those S2
  slots are not in the ComboBox port (item icons come from Menu in S2;
  Menu `menuItemIcon` was updated).
- TableView `:has([slot="selection"])` — the port has no
  `selectAllCheckboxColumn` with that selector.
- Menu `staticColor: auto` for inner buttons — already absorbed (MenuTrigger
  spreads ActionButton/ToggleButton context).
- ActionButtonGroup context defaults — already absorbed in the Solid port.
- SegmentedControl still uses `fontRelative(20)` (not in the S2 1.7.0
  source file list).

## Evidence

`guard:layer-boundary`: 532 identical, 76 diverged, NEW forks: 0 (one
unrelated lift of `test-utils/index.ts` from another minion).

Owned-package typecheck after `"1lh" as const` on ActionButton avatar
context. `vp run check` and `git diff --check` on owned files: clean.
Changeset `.changeset/s2-1-7-0-icon-1lh.md` (patch solid-spectrum + ui).

Certified comparison (Playwright, existing comparison dist; full
`vp run comparison:test:certified` rebuilds concurrent solidaria-components
work and was not used):

- before: 1962 passed / 158 failed / 4 skipped
  (`output/audit-2026-09/train-2026-09/certified.log`). Every failure was
  an S2 1.7.0 styling delta.
- after: 2116 passed / 8 failed / 4 skipped (32.8m)
  (`output/audit-2026-09/train-2026-09/certified-after-240.log`).
  All original 158 styling surfaces pass (ActionMenu, Badge, Calendar,
  ComboBox invalid, ContextualHelp, DateField/DatePicker/DateRangePicker
  invalid, FieldError, Icon, ListView, Menu list, RangeCalendar,
  SearchField, TimeField invalid, ToggleButtonGroup vertical).

The 8 Playwright failures:

- ComboBox/Picker D13 journeys (4) — ARIA/DOM snapshot, not a 1.7.0
  styling hunk. Already #248.
- Switch D5 tab-cycle (1) and ToggleButton D10 RTL (3) — load flakes
  (worker SIGKILL / `#example` count 0). Isolated rerun: Switch D5 1/1
  passed; ToggleButton D10 6/6 passed. No new ticket.

Effective after flake rerun: 2120 passed / 4 D13 failed / 4 skipped.
No residual that needs a ticket ≥ 250 from this work.

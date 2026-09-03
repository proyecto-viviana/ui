---
id: 260
type: task
title: "Run the React-vs-Solid functional comparison pass"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened from the owner request that is the #136 functional pass: drive both panels, ticket each user-visible divergence",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "overnight coordinator; overlay family first per #243, then collections, fields, buttons, color, rest",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "first overnight batch: picker, combobox, menu, actionmenu against preview :4341; remaining slugs queued on a durable scheduler",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "picker outcome ticketed. User-visible: HiddenSelect stale (#264), disabled trigger aria-disabled (#265), loadingState=loading extra Load more row (#266). Overlay 1px offset left on #248. D13 step-0 DOM still #209/#254. Note output/functional-pass/picker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "actionmenu outcome ticketed. User-visible: wrap from last item (#269), Tab leaves open overlay (#267), live direction/align stale placement (#268). Settled overlay geometry matches. Enter animation still #251/#257. haspopup true vs menu is accepted. No D13 ActionMenu journeys (#249). Note output/functional-pass/actionmenu.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "combobox outcome ticketed. User-visible: menuTrigger=focus does not open (#270), menuTrigger=manual ArrowDown does not open (#271), Enter with custom value leaves overlay open (#272), isRequired uses aria-required instead of native required (#273). Typing unfiltered on both stacks (#245 items). Duplicate filter announcements #80. Dismiss/slot ids #248. data-open #209. Overlay geometry matched when both open. D13 certified still fails step-0 field DOM (#209/#248). Did not start #254. Note output/functional-pass/combobox.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "menu outcome ticketed. User-visible: Tab leaves open overlay (#267), live direction/align stale placement (#268). Single-selection checkmark column 0px stays on #107. aria-haspopup true vs menu is accepted upstream drift (route contract allows either). No new ids this pass. Note output/functional-pass/menu.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "tooltip outcome ticketed. Isolated drive: hover/focus/Escape/press/disabled/placements/flip/noflip/scroll/warmup/cooldown/live placement match. User-visible remainders already on #64 (enter opacity + exit unmount vs ~200ms linger; 0.5px overlay offset). Arrow unlabeled img matches upstream (#67). No D13 Tooltip journeys (#249). Did not start #254. No new ids. Note output/functional-pass/tooltip.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "popover outcome ticketed. User-visible: dismiss does not restore trigger focus (#274), customAnchor triggerRef stuck at origin opacity 0 (#275). DialogTrigger settled geometry/ARIA/Tab trap/form/placements/sizes/hideArrow/offset/maxHeight/live placement match. Enter/exit still #251/#68. No D13 Popover journeys (#249). Did not start #254. Note output/functional-pass/popover.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "datepicker outcome ticketed. User-visible: maxVisibleMonths=2 popover stays 304px (#276), constrainRange Previous/Next stay enabled (#277), createCalendar leaks into field segments (#278), Next paging leaves stale grid name and moves focus to the cell (#279). Default open/keyboard/pointer/disabled/named form matched. No D13 DatePicker journeys (#249). Did not start #254. Note output/functional-pass/datepicker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "daterangepicker outcome ticketed. User-visible: popover under calendar button not FieldGroup (#280), one-month popover 256 vs 304 missing cell-gap (#281), keyboard range-start does not advance focus (#282), min/max cells omit First/Last available date (#283), fr-FR Dismiss stays Dismiss (#284), hour time fields wrap 440 vs 375 (#285). Two-month overlay 504 both (not #276). Constrain Previous/Next disabled both (not #277). data-open #209. No D13 DateRangePicker journeys (#249). Did not start #254. Note output/functional-pass/daterangepicker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "contextualhelp outcome ticketed. User-visible: live placement/shouldFlip stale after mount (#286), trigger aria-haspopup dialog vs omitted (#287). Settled geometry, Tab contain, Escape/outside/repress restore, offset pin 8, flip on remount, copy, touch press match. Enter/exit still #251/#68. Focus restore is not #274. No D13 ContextualHelp journeys (#249). Did not start #254. Note output/functional-pass/contextualhelp.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "autocomplete outcome ticketed. User-visible: typing does not hide non-matching ListBox options (#288), SearchField omits autocomplete/autocorrect/spellcheck/enterkeyhint (#289). Virtual-focus keyboard, Tab, pointer selection, selectionMode, 500ms activedescendant delay, and inline list geometry matched. No D13 Autocomplete journeys. Did not start #254. Note output/functional-pass/autocomplete.md.",
    }
---

Drive the React and Solid panels of every live comparison route through the
same user-visible interactions. Diff DOM, ARIA, focus, form value, overlay
geometry, and behavior after each step. File one bug ticket per real
divergence. Do not treat certified green, axe, or a screenshot as
equivalence.

## Why

#136 recorded this pass as un-ticketed, waiting for the owner's seed. The
owner asked for it on 2026-09-02: component-by-component, outside-world
functional equivalence, bug tickets for each difference. D1–D12 certify
states; D13 covers ComboBox/Picker seeds. This pass walks the rest of the
catalogue the way a user would.

## Order

1. Overlay family (Picker, ComboBox, Menu, ActionMenu, DatePicker,
   DateRangePicker, Popover, Tooltip, Dialog, ContextualHelp) — #243 / #249.
2. Collections (ListBox, ListView, GridList, TableView, TreeView, TagGroup,
   Accordion, Virtualizer, DnD ListBox, CardView).
3. Fields (TextField, TextArea, SearchField, NumberField, DateField,
   TimeField, ColorField, Checkbox, CheckboxGroup, RadioGroup, Switch,
   Slider, RangeSlider, Form).
4. Buttons and chrome (Button, ActionButton, ToggleButton, LinkButton,
   ActionGroup, ButtonGroup, ToggleButtonGroup, ActionBar, Toolbar,
   SegmentedControl).
5. Color and progress.
6. Remaining live slugs.

## Method

For each slug, against production preview (`COMPARISON_CHROMIUM_ARGS` on this
host):

1. Load `/components/<slug>/`, wait for islands-mounted, confirm both panels
   render the real component (not a missing fallback).
2. Exercise default, keyboard, pointer, disabled, and the route controls that
   change user-visible behavior.
3. Diff React vs Solid after each step (D13 observations where the driver
   applies; otherwise roles, names, values, focus, geometry).
4. Classify: `port bug`, `upstream drift`, `harness bug`, `threshold debt`,
   or `unrelated family failure`.
5. File a child of #24 (port bug), #26 (harness), or #136 (gate/audit) — never
   parent a task under this task. Skip filing when an open ticket already
   owns the exact divergence (name it).
6. Record the slug outcome on this ticket. Evidence may live under
   `output/functional-pass/` (gitignored).

Do not implement the ports in this pass unless a one-line harness bug blocks
the next slug. Do not start #254. Do not waive D-reorder (#256) without the
owner.

## Done when

Every live catalogue slug has a recorded outcome (equivalent / ticketed /
blocked with owner). Overlay family is complete. Open divergences have
tickets with a reproduction on the comparison route.

## Relationship

Child of #136 (the audit's functional pass). Uses the D13 driver (#244) and
feeds #243 / #249. Page production-ready is #259. Per-component acceptance
remains #24 — this pass files into it, it does not replace the playbook.

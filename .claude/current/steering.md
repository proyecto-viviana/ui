---
kind: reference
status: current
---

# Owner direction

Status: live reference.
Update when: the owner changes a product boundary, priority rule, or non-goal.

## Direction

Viviana UI is Proyecto Viviana's published Solid UI suite. Its shared lower
layers are unofficial ports of Adobe React Stately, React Aria, and React Aria
Components. `solid-spectrum` ports React Spectrum S2.

Match upstream observable behavior before adding local behavior. Put state,
ARIA, keyboard, focus, and composition in the lowest owning layer. Generate S2
styles only in `solid-spectrum`. Use the comparison app only to prove parity.

`@proyecto-viviana/ui`, `solid-spectrum`, and Kumo are styled siblings above the
same headless stack. Kumo remains a bounded experiment. Do not expand or publish
it without a separate owner decision.

## Work order

Ticket #87 owns the ordered remaining-work program. Generated `status.md` and
`roadmap.md` show current board state. Ticket #82 owns the current Adobe release
train and links each unresolved upstream branch to an atomic task.

Do not copy status counts, passing commands, or task lists into this file.

## Owner decisions

- **TableView structure — #89.** Decide whether the native `<table>` is an
  explicit local architecture or whether TableView must converge on upstream's
  interactive grid structure.
- **TabSwitch and SegmentedControl — #9.** Define whether both public controls
  remain distinct or converge through a documented migration.
- **Spectrum tokens pin — #143.** `solid-spectrum` and `@proyecto-viviana/ui`
  both pin `@adobe/spectrum-tokens` to the S2 oracle version. Viviana theming
  lives in `viviana-tokens.css`. Do not advance UI to a different Adobe token
  major.
- **archive/custom — #145 / #62.** Deleted. Current work is the Solid Spectrum
  API. Do not add new viviana-native components until the owner reopens that
  surface.

Do not change the TableView or TabSwitch public boundaries before the owner
records those decisions.

## Non-goals

- Treat export presence, route presence, axe, or one screenshot as acceptance.
- Weaken protected-main checks to make delivery easier.
- Call an upstream train absorbed because dependencies or pins changed.
- Copy shared behavior into styled packages.
- Patch S2 styling in the comparison app.
- Add or change dependencies without explicit approval.
- Keep completed plans and audit logs in the live documentation tree.

## Before work starts

Confirm the upstream source, the lowest owning package, the regression that will
fail on drift, and any public name or boundary that needs the owner first.

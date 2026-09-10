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

`@proyecto-viviana/ui`, `solid-spectrum`, Kumo, and Geist are styled siblings
above the same headless stack. Kumo and Geist remain bounded experiments. Do
not expand or publish them without a separate owner decision.

## Work order

Ticket #87 owns the ordered remaining-work program. Generated `status.md` and
`roadmap.md` show current board state. Initiative #34 owns Adobe release
absorption. The current train ticket is named in `upstream-sync.md`.

Do not copy status counts, passing commands, or task lists into this file.

## Decisions

Dated. Entries marked (owner) were stated by the owner. Entries marked
(Rule #2, delegated) were derived from upstream evidence under the owner's
2026-09-07 delegation ("why my call? fix them if broken") and stand until the
owner vetoes them.

- **2026-09-07 — TableView converges on upstream's virtualized grid (#89 →
  #490).** (Rule #2, delegated) S2 TableView has no non-virtualized branch: it
  always renders `div[role="grid"]` through the Virtualizer. The native
  `<table>` is a structure with no upstream counterpart, not a local
  architecture. Until #490 lands, the TableView certification is D6-only and
  is not full certification.
- **2026-09-07 — TabSwitch folds into SegmentedControl (#9 → #491).** (Rule
  #2, delegated) TabSwitch duplicates SegmentedControl on the same headless
  primitives with an invented API and a hard-coded label. It becomes a
  deprecated wrapper in the next release and is removed in the following
  breaking release. `@proyecto-viviana/ui` keeps its register pill styling on
  the same behavior source.
- **Spectrum tokens pin — #143.** (owner) `solid-spectrum` and
  `@proyecto-viviana/ui` both pin `@adobe/spectrum-tokens` to the S2 oracle
  version. Viviana theming lives in `viviana-tokens.css`. Do not advance UI to
  a different Adobe token major.
- **archive/custom — #145 / #62.** (owner) Deleted. Current work is the Solid
  Spectrum API. Do not add new viviana-native components until the owner
  reopens that surface.
- **Geist package name — #526.** (owner) The fourth styled sibling is
  `@proyecto-viviana/geist`. The first slice is a Button experiment, not a
  Geist port. `@vercel/geistcn` is not a public oracle.

The TableView and TabSwitch public boundaries change only through #490 and
#491, each with a Changeset and the regression evidence its ticket names.

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

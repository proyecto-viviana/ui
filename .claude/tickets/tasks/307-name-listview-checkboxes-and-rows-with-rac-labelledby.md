---
id: 307
type: task
title: "Name ListView checkboxes and rows with RAC labelledby"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 listview functional pass: RAC checkbox name is Select Project brief.pdf via labelledby; Solid is aria-label Select only. Solid row AX name includes Select and item actions; RAC row is Project brief.pdf PDF document",
    }
---

RAC GridList selection checkboxes join `aria-label="Select"` with the row
via `aria-labelledby`, so the checkbox accessible name is "Select Project
brief.pdf". The row's own name is the label plus description and does not
include the checkbox or item actions.

Solid `createGridListSelectionCheckbox` hardcodes `"aria-label": "Select"`
and never sets `aria-labelledby`
(`packages/solidaria/src/gridlist/createGridListSelectionCheckbox.ts:65`).
`createGridListItem` does not label the row, so the computed name includes
the checkbox ("Select") and any Archive / ActionMenu controls.

## Evidence

`http://127.0.0.1:4341/components/listview/`, islands mounted. Playwright
`ariaSnapshot` of the default Documents grid:

React:

```
- row "Project brief.pdf PDF document" [selected]:
  - gridcell "Select Project brief.pdf Project brief.pdf PDF document":
    - checkbox "Select Project brief.pdf" [checked]
```

Solid:

```
- row "Select Project brief.pdf PDF document" [selected]:
  - gridcell "Select Project brief.pdf PDF document":
    - checkbox "Select" [checked]
```

`?itemActionSlot=buttonGroup` Solid row name also includes "Project
brief.pdf actions". Checkbox `labelledby` is set on React and null on
Solid.

## Done when

The checkbox accessible name is "Select {item}", and the row name is the
item label plus description without "Select" or item actions, matching
React. A comparison-route AX dump fails if the Solid checkbox name is
plain "Select".

## Relationship

Child of #24. Found by #260. Distinct from #305 (intra-row focus) and
#209 (render-prop fields). Do not start #254.

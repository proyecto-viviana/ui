---
id: 441
type: task
title: "Read compiled element children once through a shared helper"
created: 2026-09-03
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #256 Virtualizer/ListBox hydrate note: ~40 probe-then-render children sites; only sites with hydrate fixtures are proven",
    }
---

The probe-then-render idiom —

`typeof x.children === "function" ? x.children(...) : x.children`

and variants — appears at ~40 sites across `solidaria-components`,
`solid-spectrum`, and `viviana-ui`
(`rg -n 'typeof (props|local)\\.children ==='`). Every site that reads a
non-function child more than once has the same hydration-key drift when
that child is a compiled element under SSR. ListBox/ComboBox/Select options
were fixed with an internal `OptionContent` one-read helper (#256). The
rest still probe then render.

Do not 40-patch. One shared helper, then migrate the class.

## Done when

A shared one-read helper exists in the headless layer. Sites that read a
compiled element child more than once go through it. A hydrate fixture
fails if a representative remaining site double-reads. `rg` of the probe
idiom on non-function children is empty or listed as an explicit exception.

## Relationship

Child of #136. Follows #256 `OptionContent` and the children snapshot class
(#192 / remaining styled sites). Distinct from #168's styled-layer
`resolveChildren` wrapper.

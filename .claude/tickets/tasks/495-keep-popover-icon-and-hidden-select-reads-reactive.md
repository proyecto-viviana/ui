---
id: 495
type: task
title: "Keep popover, Icon, and hidden-select reads reactive"
created: 2026-09-07
parent: 31
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 Solid pattern audit: frozen shouldCloseOnInteractOutside, Icon prop snapshot, hidden-select reset reading a plain ref",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement keep-reads-reactive: getter, Icon JSX read, hidden-select selectEl(), update-after-mount tests",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "createPopover shouldCloseOnInteractOutside getter, both Icon wrappers read props.icon via Dynamic, hidden-select reset uses selectEl(). Prove: vp test run packages/solidaria/test/createPopover.test.tsx packages/solidaria/test/createHiddenSelect.test.tsx packages/solid-spectrum/test/Icon.test.tsx packages/viviana-ui/test/Icon.test.tsx — 4 files, 37 passed. cwd /home/emoporemilio/projects/viviana-hub/ui.",
    }
---

Three frozen-read sites of the same class as the Popover 0,0 latch:

- `createPopover` snapshots `shouldCloseOnInteractOutside` once.
- Both Icon components snapshot the icon prop.
- The hidden-select form-reset effect reads a plain ref instead of the
  signal the same file maintains.

A destructured or once-read Solid getter freezes. Forward the getter, or
read it inside the effect / JSX.

## Done when

Each named site re-reads on change. A regression test fails if
`shouldCloseOnInteractOutside`, the Icon renderer, or hidden-select reset
ignores an updated value. No new snapshot of a reactive prop.

## Relationship

Child of #31. Same class as the Popover anchor-signal fix. Not #192
(lying freeze comments on `createToggleState`).

---
id: 630
type: task
title: "Stop Card and TableCell from rebuilding their content on hover, press, and focus"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "D16: a Card in a CardView and a TableCell rebuild their content on hover, press and focus, which drops state held inside (an open menu, typed text). Found in a real browser on 0.8.0-rc.0; happy-dom does not show it.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "Chromium: a TextField in a TableCell keeps its text and focus when the pointer moves onto the next cell, and that cell reports hovered. An open menu in a Card stays open across hover, press, and focus. Mounts stay at 1 for solid-spectrum and viviana-ui. A pre-existing focus-within proxy throws on that focus and does not dismiss the menu.",
    }
---

A `Card` in a `CardView` and a `TableCell` call their content again each time
the row is hovered, pressed, or focused. State held in that content is lost.
In visualmode an `ActionMenu` in a card closed under the mouse press that
opened it, and a `TextField` in a table cell lost its text and its focus when
the pointer reached the next cell. happy-dom does not show it; a real browser
does.

`packages/solid-spectrum/src/card/index.tsx` and
`packages/viviana-ui/src/card/index.tsx` call the card content from inside the
`CardView` item render, which receives hover, press, and focus.
`packages/solidaria-components/src/Table.tsx` `TableCell` calls its children
with `renderValues()`, and those values include `isHovered`, `isPressed`, and
`isFocused`.

Build the content once per item, and pass hover, press, and focus as reactive
reads. No public name. No upstream equivalent; this is a port defect of
render props that re-run.

## Done when

In a browser, typing in a `TextField` inside a `TableCell` and moving the
pointer across the row leaves the text and the focus unchanged. An open menu
inside a `Card` in a `CardView` stays open across hover, press, and focus.
happy-dom is not the proof. Do not close this as unreproduced.

## Relationship

Child of #24. Visualmode works around it at `src/app/admin/AdminTable.tsx`
(02bda79e9) and `src/app/app/FileBrowserSections.tsx` (05b086669). Both go
when this lands. Visualmode tickets #10147 and #10150 wait on it.

## Bounded compiler qualification — 2026-10-08

Admitted source implementer generation `01afa4c5-37d0-42c3-b7b6-351444b75abf` on
base `0d9323a4e94ca07a3bf532bb867d60a05db128ad`; prior #625 owned generation is closed.
Codex fallback is authorized by the saved Grok/AGY quota receipts. Only
TableCell private child narrowing, this ticket, and generated status/roadmap
are writable. Existing tests and Card sources remain read-only. Compiler
qualification is reopened for this bounded slice; historical verified runtime
status does not establish clean native proof. Durable original Card/Table
browser qualification remains a separately admitted follow-on; the historical
tolerated focus exception is not clean native evidence. #557 is not a
prerequisite. No release prose or full-ticket closure is included.

Initial bare-accessor trial was blocked (superseded by the amendment below). The original canonical
compiler run reports 21 errors (6 package, 15 script), including TS2322 at
Table.tsx:2410 and :2419. Separating static children and the existing arity
branches with a private `() => JSX.Element` assertion still reports both
errors: installed `@solidjs/web` JSX.Element excludes functions, including
zero-argument accessors. Source was restored byte-for-byte; no runtime or
public-type change was admitted. A renderer insertion type-contract decision
is required before another implementation attempt; an intersection assertion
that disguises an accessor as JSX.Element would merely suppress the conflict.

The attempted narrowing's existing Table suite reports 167 passed / 1 failed
at Table.test.tsx:3862 (destructured isFocused does not update cell text).
Original source reproduces the same 167 passed / 1 failed result.
Comparison and command receipts are in `/tmp/ui-630-*`; this
is not a new lifecycle certification. Lint passes with two existing warnings.
The worker cannot authenticate gh; the conductor's old main run is not
candidate evidence. No browser/build/SSR/hydration or release claim is made.

### Admitted accessor boundary amendment

The 2026-10-08 conductor amendment retains the same base and generation and
admits localized controls in existing Table.test.tsx. A private predicate
keeps the existing length===0 distinction; a JSX fragment now supplies a
renderer-owned insertion for that accessor. Static children, getter-backed
argument-taking children, outer untrack, and host/custom-render order remain
unchanged. No public types or JSX casts are added.

Installed DOM and hydratable transforms emit `memo(rawChildren)`; renderer
`memo` uses `createMemo(() => fn())`, retaining tracking and zero arguments.
The two added preservation controls exercise both host paths, live content
updates, retained cell/input/button identity, typed input, local component
state and focus. The full suite reports 169 passed / 1 failed; the unchanged
destructured-isFocused assertion remains the separately unresolved consumer
defect reproduced by the original-source 167/168 control. These controls are
not claimed as old-source regressions.

Amended canonical typecheck removes exactly the two owned TS2322 errors,
with no additions: 19 inherited diagnostics remain (4 package / 15 script).
Existing Spectrum Table SSR passes 2/2, then hydration passes 1/1 using the
fresh recorded table-selectable-ssr.html identity. This preserves the existing
fixture's surrounding hydration order, not uncovered zero-argument hydration.
Scoped formatting and lint pass (two inherited lint warnings). Evidence,
compiled transforms, superseded blocker receipts, and final identities are
bound by `/tmp/ui-630-evidence-manifest.json`. Independent conductor review
and exact-generation owned stop remain pending; no full-ticket/native/release
closure is claimed.

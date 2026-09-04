---
id: 327
type: task
title: "Tab out of TreeView to the After button"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: isolated Tab from Weekly Report reaches After on React; Solid loops Weekly Report ↔ BODY and never leaves the collection. hideOther panel visibility:hidden + pointer-events:none; After is in the same canvas",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Tab from the focused tree row leaves the collection onto the next tab stop. Intra-row widgets stay tabIndex=-1 under arrow keyboardNavigationBehavior.",
    }
---

Tab from the focused TreeView row must leave the collection onto the
fixture After button. S2 does. Solid Tab from Weekly Report moves
`activeElement` to `BODY` and the next Tab returns to Weekly Report, so
keyboard users cannot tab out.

The certified D5 walk records Tab _into_ the tree and the End
collection tab-stop (#65). It does not hold Tab _out_.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, other
`.s2-framework-panel` `visibility:hidden` and `pointer-events:none`.
Tab from Before lands on Weekly Report on both. Further Tab:

|     | React                         | Solid                  |
| --- | ----------------------------- | ---------------------- |
| 1   | button After (`inPanel=true`) | BODY (`inPanel=false`) |
| 2   | Information (page chrome)     | Weekly Report          |
| 3   |                               | BODY again             |

After is a sibling of the treegrid in the same canvas. Isolation still
loops, so this is not the other panel intercepting.

## Done when

Tab from the focused Weekly Report row lands on After, matching React.
A comparison-route keyboard walk fails if Solid loops through BODY.

## Relationship

Child of #24. Found by #260. Distinct from #65 (End unmounts offscreen
rows) and from #325 (collapse drops focus; this is the default selected
row with no collapse). Do not start #254.

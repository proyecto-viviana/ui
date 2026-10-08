---
id: 623
type: task
title: "Stop TextField and TextArea from writing their input id during unmount"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode D01, seen on 0.8.0-rc.0 and still on local main. Input and TextArea onCleanup call setInputId(undefined) and throw REACTIVE_WRITE_IN_OWNED_SCOPE. Blocks visualmode #10144, #10145, #10153, #10154, #10161, #10162, and #10163. #625 waits on this.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "Unmounting Input and TextArea no longer writes the input id while the field is disposed, and no longer throws when only the control leaves.",
    }
---

Unmounting a `TextField` input or a `TextArea` writes the field's input id
from `onCleanup`. That write throws `REACTIVE_WRITE_IN_OWNED_SCOPE`. The same
cleanup is in the installed `0.8.0-rc.0` tarball and on local main.

`packages/solidaria-components/src/TextField.tsx`: `Input` registers the id
in a `createEffect` and clears it at the `onCleanup` around line 154.
`TextArea` does the same around line 252. Both call
`context?.setInputId?.(undefined)`. The comment above `Input` already says
Solid 2 refs run with `runWithOwner(null)`, and a styled proxy can throw from
an ownerless thunk.

## Done when

Unmounting `Input` and `TextArea`, including a field that is removed while it
still owns the id, leaves no reactive write and no throw. A regression covers
both elements. Visualmode #10144, #10145, #10153, #10154, #10161, #10162, and
#10163 can drop this blocker.

## Relationship

Child of #24. #625 (in-place TreeView label edit) cannot land honestly until
this unmount write is gone. Do not mark this verified from a green export or
an axe run.

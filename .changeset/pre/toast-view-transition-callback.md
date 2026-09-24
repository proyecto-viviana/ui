---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Toast: run the queue update inside the view transition instead of returning it.
`startViewTransition` passed `() => fn` to `document.startViewTransition`, so the
callback returned the mutation without calling it and no toast ever rendered in
a browser with the View Transitions API. Both packages now mirror upstream S2's
`() => flushSync(fn)` with Solid 2's `flush(fn)`, which drains the queue before
the browser snapshots.

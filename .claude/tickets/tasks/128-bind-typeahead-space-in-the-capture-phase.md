---
id: 128
type: task
title: "Bind typeahead Space in the capture phase"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed upstream behavior sweep" }
---

Make the typeahead Space handler run before a collection's own keydown handler.

`createTypeSelect` exposes the upstream capture and bubble split, but a spread
`onKeyDownCapture` property is inert in Solid. The bubble path covers most visible
behavior, but it does not prove the upstream event phase.

## Done when

The shared binding uses a real capture listener, every consumer cleans it up,
and event-order tests fail if collection selection handles Space first.

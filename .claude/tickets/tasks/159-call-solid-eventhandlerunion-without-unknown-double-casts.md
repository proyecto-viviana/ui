---
id: 159
type: task
title: "Call Solid EventHandlerUnion without unknown double casts"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-09-25,
      note: "shared callEventHandler and SolidEventHandlerUnion across solidaria-components without double casts",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "D18 review found a receiver mismatch in the shared dispatcher and requires bounded consolidation of the private Tab adaptation.",
    }
---

## Cause

`createRadioGroup` / `createRadio` already type props as Solid JSX
attributes. RadioGroup still double-casts to a single-function handler
because `EventHandlerUnion` includes the bound-tuple form. ComboBox extracted
`callInputKeyDown`; ContextualHelpTrigger extracted `callHandler`. RadioGroup
alone has 26 inline casts.

## Work

Share one typed EventHandlerUnion caller at the RAC layer.

## Done when

RadioGroup, Checkbox, DateField, DatePicker, and TimeField do not
`as unknown as` those handlers.

## Relationship

F-TS-010.

## Round-2 note (2026-09-01)

New evidence: the two extracted callers disagree on Solid's bound-tuple order. Installed `BoundEventHandler` is `{0: fn, 1: data}`; ComboBox does `handler[0](handler[1], e)` (correct), ContextualHelpTrigger does `handler[1].call(handler[0], e)` (inverted, throws on a real bound tuple). One shared typed caller fixes the inversion.

## Reopened consolidation — 2026-10-08

#632 preserves Solid's bare bound-handler invocation in a private Tab adapter
because the existing shared components helper invokes the tuple member with
the tuple as its receiver. The aria private helper already uses bare invocation.
This is recorded duplication debt under the hub's never-third-copy rule.

Before a separately registered source slice, admit exact shared helper and
owning test paths. Consolidate the components dispatcher and Tab adaptation
without exporting a helper or changing public API. Qualify normal functions,
canonical [fn, data] tuples including undefined data, undefined receiver,
original event identity, EventListenerObject method receiver, callback removal
and consumer event order. Inspect the existing inverted-tuple compatibility
branch before deciding its scope; do not silently remove supported behavior.
Run all actual dispatcher consumers and preserve #632 caller-before-managed
and caller-onClick exclusion. Existing cast cleanup remains historical proof;
this reopening does not invalidate or reimplement it.

Independent inspection: `/tmp/ui-632-final-review-2026-10-08.md`. No shared
helper repair or passing consolidation tests are claimed yet.

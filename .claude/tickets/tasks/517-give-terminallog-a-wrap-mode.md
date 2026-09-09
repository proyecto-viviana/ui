---
id: 517
type: task
title: "Give TerminalLog a wrap mode"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

`TerminalLog` paints its plate `overflow-x: auto`
(`packages/viviana-ui/src/well/TerminalLog.tsx:79`) and every line
`white-space: pre` (`TerminalLog.tsx:102`). A terminal's lines do not wrap, so a
line longer than the pane turns the plate into a horizontally scrollable region —
and a scrollable region with no tabbable content inside it is exactly what axe
flags as `scrollable-region-focusable`. The `/examples` e2e runs axe per slug and
per scheme, so this is a hard red, not a nit.

Both screens that carry a long line had to work around it in the app:

- `lesson.tsx` hand-breaks the tutor's reply into three literal lines with leading
  spaces for the hanging indent (`apps/web/src/routes/examples/lesson.tsx:119-131`,
  commit `348f83ca`) — prose broken at terminal width by hand, in the data.
- `live.tsx` moves the scrolling out to a focusable wrapper with
  `[data-examples] .ex-live-log > * { width: max-content; min-width: 100% }`
  (`apps/web/src/styles/examples.css:947-953`), a layout rule that only exists
  because the plate cannot wrap.

Neither is the register's intent: the handoff's logs are short command lines, and
prose in a log (the tutor, the live chat) should wrap at the plate.

## Scope

`packages/viviana-ui/src/well/TerminalLog.tsx` — `logStyles` and `lineStyles`,
plus the prop; then `lesson.tsx` restores its reply as one string and `live.tsx`
drops the `ex-live-log > *` rule from `examples.css`.

The API question the owner decides: what the wrapping mode is called and whether
it is per-log or per-line. **Recommended default:** one boolean `wrap?: boolean`
on the log, default `false` (today's behaviour, byte-identical). When `true` the
plate drops `overflow-x: auto` and the lines take `white-space: pre-wrap` with
`overflow-wrap: anywhere`, so leading spaces and the boot stagger still work and
a long token cannot re-open the scroll region. Continuation lines hang under the
line's text, not under its timestamp — that is what a real transcript does and
what `lesson.tsx` faked. Veto it if the owner wants the mode per line (a log that
mixes code and prose) or named for the content rather than the behaviour.

`showCaret`, `bootIn`, the per-span channels and the matte plate are untouched. A
wrapped log is still a log: no glass, same `wellScan` recipe
(`TerminalLog.tsx:62-82`).

## Done when

- `TerminalLog wrap` wraps a line longer than its pane with no horizontal scroll
  and no `scrollable-region-focusable` finding in either scheme.
- `lesson.tsx` carries the tutor's reply as one sentence again, and the three
  hand-broken lines and their comment are gone.
- `.ex-live-log > *` is deleted from `apps/web/src/styles/examples.css` and
  `/examples/live` still scrolls its log vertically inside the pane.
- A regression test names the failure: a wrapped log's `scrollWidth` must equal
  its `clientWidth` for a line that overflows unwrapped.
- Default (`wrap` absent) keeps `white-space: pre` and the scroll plate.

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:examples-purity
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
vp run api:extract && vp run guard:api-reference
```

Plus a minor Changeset on `@proyecto-viviana/ui` (additive prop).

## Relationship

One of the five library gaps the Terminal Glass port surfaced: #515, #516, #518,
#519. Sibling concern to #103 (Glasselated mirror gaps). Example routes:
`/examples/lesson`, `/examples/live`; the log also appears on
`/examples/landing`, `/examples/home`, `/examples/profile` and
`/examples/explore-empty`, which are short-line logs and must not change.

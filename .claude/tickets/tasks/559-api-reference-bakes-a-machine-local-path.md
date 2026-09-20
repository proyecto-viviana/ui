---
id: 559
type: task
title: "The API reference extractor renders a machine-local node_modules path, and 81 of 84 pages have drifted"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: 'found by the #555 item 8.2 writer while looking for the proof that a doc-comment fix reaches the emitted page. It does not - solidaria is not an extracted register - but `vp run guard:api-reference` is red: 81 of 84 pages drifted. The writer ran `api:extract` once to read the diff and reverted all of it rather than re-bless, which is right: regenerating today bakes an absolute-ish `import("../node_modules/solid-js/types/types").RenderedElement` into shipped docs data. Conductor confirmed the red independently (`.agents/chain-walk-2026-09-20/guard-api-reference.out.txt`, EXIT=1, `checked 84 reference pages`, committed data clean) and probed the renderer',
    }
---

## Scope

Two defects are tangled here. Fix them in this order; the second is not safe
before the first.

### 1. The rendering is not reproducible

`scripts/extract-api-reference.ts:269` renders every prop with

```ts
checker.typeToString(display, site, ts.TypeFormatFlags.NoTruncation);
```

When a type is not reachable by name from `site`, the TS printer falls back to
`import("…")` with a path **relative to the site's file**, which for a type that
resolves inside `node_modules` is a path through this checkout's layout. Measured
with `.agents/chain-walk-2026-09-20/probe-typeflags.ts`, which renders exactly
the way line 269 does:

```
packages/viviana-ui   : 11769 property signatures scanned, 26 render as import("…"), 18 distinct
packages/solid-spectrum:  8847 property signatures scanned, 20 render as import("…"), 18 distinct
```

Most leak a package name and are merely ugly — `import("@proyecto-viviana/solidaria").DatePickerAria`,
`import("..").HoverEvent`. Three renderings in each register leak the checkout:

```
number | boolean | Node | import("../node_modules/solid-js/types/types").RenderedElement
  | import("solid-js").ArrayElement | (string & {}) | JSX.ArrayElement
  | ((renderProps: TableRenderProps) => JSX.Element) | null | undefined
```

That is a prop type on a published component's page. It is wrong for a reader,
and it makes the output depend on where the repo sits on disk, so the guard
cannot mean what it claims.

The candidate lever is `ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope`.
The probe renders every hit both ways and it does drop the path:
`import("../node_modules/solid-js/types/types").RenderedElement` → `RenderedElement`.
**Do not take that as settled.** The same probe shows the flag changes one
rendering's _name_, not just its qualification —
`import("@proyecto-viviana/solid-stately").SegmentType` becomes `DateSegmentType`,
because the flag prints the alias reached rather than the target. Read the full
probe output for both registers before choosing
(`probe-typeflags-viviana-ui.txt`, `probe-typeflags-spectrum.txt`), and if the
flag is wrong, the alternative is to resolve the display name ourselves rather
than to widen the flags.

Whatever lands, the proof is a **reproducibility test**: extraction from two
different checkout paths produces byte-identical JSON. Without that, the class
comes back the next time a dependency moves a type into a new file.

### 2. The 81 pages then need regenerating, once

The drift itself is real and expected. `solid-js@2.0.0-rc.9` moved `JSX.Element`'s
members into `types.d.ts` as `RenderedElement`
(`node_modules/solid-js/types/types.d.ts:8,13`), so the checker's answer for
every `children` prop changed. The committed pages predate the Solid 2 RC bump
and say `Node | JSX.ArrayElement | (string & {})`.

So this is #544's own drift: the RC bump is what moved it. Regenerate after
fixing 1, not before.

One coordination constraint: `vp run api:extract` also rewrites the prop counts
in three `apps/web/src/routes/docs/components/*.tsx` SEO lines. Those files
belong to the `public-face` worktree under the owner's 2026-09-20 exception.
Coordinate that hunk with the conductor; do not edit them from the main
checkout.

## Done when

`vp run guard:api-reference` is green, no page contains an `import("…")` path
into `node_modules`, and extraction is proved path-independent.

## Proof

- The probe's two register outputs, re-run after the fix, reporting zero
  renderings that contain `node_modules`.
- Byte-identical extraction from two checkout paths.
- `vp run guard:api-reference` EXIT=0 over all 84 pages.

## Relationship

Child of #544, and a blocker for it: `guard:api-reference` is a step in
`.github/workflows/certification-gates.yml:195`. That workflow is
`disabled_manually` right now, so this is not red in CI today — which is exactly
why it needs a ticket rather than a discovery at re-enable time. It is not in
`ci:release-readiness`, so it does not block queue item 1's chain walk.

Found under #555 item 8.2; the log entry is in
`.agents/audit-defects-555-2026-09-20.log.md`.

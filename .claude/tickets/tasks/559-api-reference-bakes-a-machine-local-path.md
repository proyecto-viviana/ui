---
id: 559
type: task
title: "The API reference extractor renders a machine-local node_modules path, and 81 of 84 pages have drifted"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: 'found by the #555 item 8.2 writer while looking for the proof that a doc-comment fix reaches the emitted page. It does not - solidaria is not an extracted register - but `vp run guard:api-reference` is red: 81 of 84 pages drifted. The writer ran `api:extract` once to read the diff and reverted all of it rather than re-bless, which is right: regenerating today bakes an absolute-ish `import("../node_modules/solid-js/types/types").RenderedElement` into shipped docs data. Conductor confirmed the red independently (`.agents/chain-walk-2026-09-20/guard-api-reference.out.txt`, EXIT=1, `checked 84 reference pages`, committed data clean) and probed the renderer',
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #567 merged, as the next known red on the ladder and the only residue item that is also a defect in a published artifact. No brief file: the ticket already names the lever, the trap in it (the flag changes a rendering's name, not only its qualification) and the proof. One coordination point the writer cannot resolve alone - `api:extract` rewrites prop counts in three `apps/web/src/routes/docs/components/*.tsx` SEO lines, which belong to the public-face worktree; it stops at that hunk and hands it here. Ordered under the release path, `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md` stage 2",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "the flag was rejected on the probe's own evidence and the display name is resolved here instead: `renderType()` strips the `import(\"\u2026\").` qualifier the printer emits and throws if one survives, so the path can never reach a page unnoticed. `UseAliasDefinedOutsideCurrentScope` would have renamed `import(\"@proyecto-viviana/solid-stately\").SegmentType` to `DateSegmentType`, and `DateSegmentType` already names a different type in these same docs. The proof is layout, not checkout path: a fixture renders one type from two nesting depths, `import(\"../../shared/thing\").Thing` against `import(\"../../../../../shared/thing\").Thing`, and both `renderType` to `Thing` - the whole-repo two-path run does not discriminate, because the leaked path is relative and the old script hashes the same from both paths too. Regenerated once: 80 files, zero `import(` and zero `node_modules` left. Importing `buildOutputs()` from the old and new scripts in one process shows 67 files differing only in `\"type\"` strings and 0 elsewhere, so the prop-count moves are the RC bump. Handed to the conductor, reverted here: `colorarea.tsx` 20\u219222, `combobox.tsx` 116\u2192123, `icon.tsx` 20\u219212 - `guard:api-reference` is EXIT=1 on exactly those three and green on the other 81. Evidence `.agents/close-gates-2026-09-20.log.md`",
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
`.github/workflows/certification-gates.yml:193`. The workflow was
`disabled_manually` when this was written and was re-enabled the same evening on
the owner's decision, so this **is** red in CI now — the first walk stopped
earlier, at `guard attribution-headers` (#567), thirteen steps short of it. It is
not in `ci:release-readiness`, which is why the chain walk never saw it: one of
the 28 blocking gates the chain does not run (#568).

Found under #555 item 8.2; the log entry is in
`.agents/audit-defects-555-2026-09-20.log.md`.

## What landed

`renderType(rendered, site)` in `scripts/extract-api-reference.ts`, applied to
every prop rendering. It removes the `import("…").` qualifier the printer emits
and throws if any `import("` survives — a bare `typeof import("solid-js")` has no
name to reach, so it fails the extraction loudly instead of shipping a path.

The flag is not used. The probe's own output rules it out: it prints the alias
reached rather than the target, so `import("@proyecto-viviana/solid-stately").SegmentType`
becomes `DateSegmentType` — a name that in these docs already means
solidaria-components' segment object, not solid-stately's union of segment kinds.
Renaming a type inside a published reference to another type's real name is worse
than an ugly path.

## The proof, and what it is not

`scripts/extract-api-reference.test.ts`: the same source is compiled at two
nesting depths, so the printer's relative path differs (`../../shared/thing`
against `../../../../../shared/thing`) while the type is the same, and both
render to `Thing`. Names reached are kept (`RenderedElement`, `SegmentType`,
`((e: HoverEvent) => void) | undefined`), and the unnameable case throws.

The ticket asked for byte-identical extraction from two checkout paths. That was
run — a detached worktree at a scratch path, both hashing `3545b4a4…` over 170
outputs — but it is a confirmation, not the proof: the **old** script also hashes
one value from both paths (`7c1c37ef…`), because the leaked path is relative. A
test on that axis would have passed on the defect. Layout is the axis the printer
actually varies with.

## The handed-off hunk

`api:extract` rewrites the prop count in three SEO lines under
`apps/web/src/routes/docs/components/`, which are the public-face worktree's:
`colorarea.tsx` 20→22, `combobox.tsx` 116→123, `icon.tsx` 20→12. Reverted here
and left to the conductor. Until they land, `vp run guard:api-reference` is
EXIT=1 on those three lines alone.

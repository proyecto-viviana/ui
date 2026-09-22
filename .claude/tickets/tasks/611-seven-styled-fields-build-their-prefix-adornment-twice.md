---
id: 611
type: task
title: "Seven styled fields build their prefix adornment twice"
created: 2026-09-22
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the review of #545's adornment commit `096776df`, which left this residue named in a ticket note and a receipt but on no board. Seven sites write `<Show when={local.prefix} …><FieldPrefix>{local.prefix}</FieldPrefix>…</Show>`: `packages/solid-spectrum/src/{textfield/index.tsx:422,combobox/index.tsx:1051,numberfield/index.tsx:508,color/index.tsx:1379}` and `packages/viviana-ui/src/{combobox/index.tsx:1066,numberfield/index.tsx:510,color/index.tsx:1377}`. A JSX prop compiles to a getter and `createComponent` is `untrack(() => Comp(props))`, so `Show`'s `when` memo builds the adornment and discards it, and the body builds it again. Measured on `096776df` with a throwaway jsdom probe (`prefix={<Probe/>}`, since deleted): viviana-ui NumberField, ColorField and ComboBox each report 2 instantiations and 1 `[data-probe]` node — one full component built and thrown away per render, and any `onMount`, ref or context registration in an adornment runs twice with the discarded copy never unmounting. It does not throw the way #545 class 2 did: all seven pass `prefixId={prefixId}`, a plain `createUniqueId()` string, so `PrefixInputProvider`'s thunk (`() => props.prefixId`, `field/prefix.tsx`) re-reads the prop and never the adornment, and nothing re-runs it from the input's ownerless ref callback. Unmeasured: whether the discarded build is symmetric under hydration — no route proves these, and the client probe is all that has been run",
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "one thing to know before taking this, landed on #545 and measured there: the `children()` shape Scope prescribes is what `guard:idiomatic-solid` flags, so each of the seven sites will want a row in `scripts/idiomatic-solid-children-baseline.json` and the guard is a blocking gate (`.github/workflows/certification-gates.yml:194`). #545 baselined its own four rows (viviana-ui searchfield and textfield) with `ticket: 545` and taught `ticketForChildrenSite` to return 545 for `/textfield/` and `/searchfield/`, so write the rows with `vp exec tsx scripts/check-idiomatic-solid.ts --write-baseline` rather than by hand. Consequence for this ticket: with that mapping as written, solid-spectrum textfield lands as `ticket: 545` and the six combobox/numberfield/color rows as `ticket: 192`, neither of which is this ticket. Decide it here rather than letting the generator decide - one line in `ticketForChildrenSite` plus the baseline case in `scripts/check-idiomatic-solid.test.ts`, which asserts the committed file and the generator agree. Not decided on #545 because no source of this ticket's had changed there",
    }
---

## Scope

Resolve each adornment once, under the field's own owner, at the seven sites
above, mirroring the shape `096776df` landed in
`packages/viviana-ui/src/textfield/index.tsx`:

```tsx
const prefixNode = children(() => local.prefix);
// …
<Show when={prefixNode()} fallback={…}>
  <FieldPrefix id={prefixId}>{prefixNode()}</FieldPrefix>
```

`packages/solid-spectrum` and `packages/viviana-ui` hold dual copies of
combobox, numberfield and color, so each edit is made in both and
`vp run guard:layer-boundary` stays green on the baseline as written.

Non-goals: the `suffix` wiring and the computed `adornmentIds()` id set, which
only TextField and SearchField carry and which `096776df` already settled; any
change to what the fields render. Optional second half, worth taking if it is
cheap: teach `guard:idiomatic-solid` to refuse `when={local.X}` beside a
`{local.X}` read in the same block, so the eighth copy cannot land — the guard
already owns the "JSX built where it should not be" rule.

## Done when

A probe that renders each of the six components with a component-valued
`prefix` reports one instantiation per adornment, having reported 2 on the
current source first, and the rendered DOM is unchanged.
`vp run guard:layer-boundary` exits 0, `vp exec tsx
scripts/check-changeset-required.mjs` exits 0, and the changeset names both
published packages.

## Proof

The instantiation probe failing first and passing after, `vp run
guard:layer-boundary`, `vp run typecheck`, `vp lint`, and the ComboBox,
NumberField and ColorField suites in both packages.

## Relationship

Child of #531. Residue of [#545](./545-move-the-web-app-to-tanstack-solid-2.md),
whose class 2 is the same reactivity shape one step further along — there the
re-read happened inside the input's ownerless ref callback and threw, blanking
`/showcase/inputs`. Receipts:
`.agents/ssr-545-2026-09-22.adornments-and-combobox-formatter.md` and
`.agents/ssr-545-2026-09-22.review-fixes.md`. Both packages are published, so
the behaviour change owes a changeset.

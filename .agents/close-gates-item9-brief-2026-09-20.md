# Brief — #555 item 9: `createId` crashes the hydration pass

Conductor, 2026-09-20. Items 1–8 are done; `5c8141e3` (8.5) is reviewed and
good. This item is a regression **item 7 introduced and I approved**, found by
walking `test:hydrate` as a chain leg. It is the last blocker I know of for
queue item 1, so take it before anything else.

## What the leg does

`vp run test:hydrate` discovers 27 files. Two fail, both with the same stack,
and then the run **never finishes**.

```
[REACTIVITY_HALTED] ... Error: getNextContextId cannot be used under non-hydrating context
  at Object.hydrationGetNextContextId (solid-js@2.0.0-rc.9/dist/solid.dev.js:71:17)
  at createUniqueId (solid.dev.js:1190:48)
  at createId (packages/solidaria/src/ssr/index.tsx:95:20)
  at createLabels (packages/solidaria/src/label/createLabels.ts:40:12)
  at getFieldProps (packages/solidaria/src/label/createLabel.ts:107:12)
  at Object.get fieldProps (packages/solidaria/src/label/createLabel.ts:119:14)
  at getFieldProps (packages/solidaria/src/label/createField.ts:113:33)
  at Object.get fieldProps (packages/solidaria/src/label/createField.ts:126:14)
  at getInputProps (packages/solidaria/src/textfield/createTextField.ts:293:13)
  at Object.get inputProps (packages/solidaria/src/textfield/createTextField.ts:302:14)
```

- `packages/solid-spectrum/test/TextField.hydrate.test.tsx` — "hydrates the
  server markup without a mismatch"
- `packages/viviana-ui/test/Form.hydrate.test.tsx` — "Form+TextField
  (isRequired + description)"

Full log: `.agents/chain-walk-2026-09-20/leg-test-hydrate.out.txt`.

## Why it is item 7's

`4bbdeff7` moved the generate above the choose:

```ts
const ctx = useContextOptional(SSRContext);
const uniqueId = createUniqueId();
if (defaultId) {
  return defaultId;
}
```

Before that commit, a truthy `defaultId` returned **before** `createUniqueId()`
ran. And on this path `defaultId` is always truthy —
`createLabel.ts:107-111` calls `createLabels({ id: id(), … })`, so `createId`
receives an id every time. So this call site began generating only at `4bbdeff7`,
and that is the call that throws.

Read the guard before you design the fix, because the message misleads:

```js
function hydrationGetNextContextId() {
  const o = getOwner();
  if (!o) throw new Error(`getNextContextId cannot be used under non-hydrating context`);
  …
}
```

It is an **owner** check, not a hydrating check. `sharedConfig.hydrating` is
true — that is how we reach `getNextContextId` at all (`createUniqueId` is
`sharedConfig.hydrating ? sharedConfig.getNextContextId() : \`cl-${counter++}\``,
`solid.dev.js:1190`). What is missing is a reactive owner at the moment the
getter runs.

## Why the test we shipped did not catch it

Item 7's new test (`packages/solidaria/test/ssr.test.tsx`, "consumes an id even
when a default id is given") runs inside `createRoot` and never hydrates. It
proves the counter arithmetic on the `cl-${counter++}` branch — the branch the
change did not need to justify. The comment in the commit and in the source
both argue from the **hydrating** branch, and that branch had no coverage. I
reviewed it and let it through on that test; the miss is mine as much as yours.

## The lead I would follow first

Upstream calls `useId` in the component body. We call `createId` from inside a
lazy property getter — `get fieldProps` → `getFieldProps` → `createLabels` →
`createId` — so it runs whenever a consumer reads the prop, which during the
hydration walk is outside the owner that `getNextContextId` requires. That
divergence, not the generate-first ordering, looks like the real defect; item 7
only stopped masking it.

Two candidate answers. Pick with evidence, do not split the difference:

1. **Hoist the id out of the getter.** Generate once in the hook body, where
   upstream's hook sits, and have the getter read the already-generated value.
   Parity-correct if it holds, and it fixes every caller at once.
2. **Revert item 7's ordering on the `defaultId` path.** Cheap, restores green,
   and gives back the ordering guarantee item 7 was written for — which was
   never proved under hydration anyway. If you land this, say plainly in the
   changeset that the ordering claim is withdrawn, and leave a ticket.

If 1 works, item 7 stays and gets the coverage it should have had.

## The hang is a second fact, and may be its own ticket

After both failures print, the run does not exit. Measured: 27 files
discovered, 2 reported, then 40 threads, RSS flat at ~1.12 GB, ~110% CPU
(one core spinning), no output for 13 minutes; I stopped it. So the other 25
files never ran and `test:hydrate` has no green-or-red verdict at all — it has
no verdict.

Determine whether the hang is **caused by** the crash or independent: fix the
crash, re-run `vp run test:hydrate`, and see whether it terminates. If it
terminates, say so and we are done. If it still hangs, that is a separate
defect and it owes its own ticket — a suite that cannot finish is worse than a
suite that fails, and it would hang the gates when they are re-enabled.

## Done when

- `vp run test:hydrate` **terminates** and reports all 27 files.
- The two named tests pass.
- A regression test exercises `createId` under a real hydration pass, not
  inside a bare `createRoot` — the coverage item 7 owed.
- A changeset, and the `.agents/audit-defects-555-2026-09-20.log.md` section
  written the way you wrote 8.1–8.5.

Commit on its own, as usual. I will review and push.

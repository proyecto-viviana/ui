---
id: 617
type: task
title: "filterDOMProps snapshots reactive data-* props"
created: 2026-09-22
parent: 544
status: done
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the 2026-09-22 ruling that a stale reactive data-* is fixed here, in @proyecto-viviana/solidaria, and VisualMode bumps its dependency after publish. filterDOMProps assigned props[prop] once. A Solid getter became a snapshot, so ActionButton, ToggleButton, and tabs built on ActionButton kept the first data-* value.",
    }
  - {
      state: done,
      at: 2026-09-22,
      note: "Both filterDOMProps copies forward an accessor descriptor instead of reading the kept prop once. A data property is still assigned. createToggleButton already calls mergeProps at lines 97 and 103 and was left as it is. The regression file fails with the sources reverted (3 failed, exit 1) and passes with them restored (3 passed, exit 0). The census, both runs, and the package suites are in the 2026-09-22 note.",
    }
---

`filterDOMProps` read each kept prop once while copying it. A `data-*` passed as a Solid getter was stored as the string from that read. ActionButton, ToggleButton, and a tab built on ActionButton then painted that string after the signal changed.

Upstream copies the value because a React prop is a plain value. Keeping the getter is the React-to-Solid difference. The comment on the change says that.

`mergeProps` already keeps a getter for a key that is not an event, `class`, or `style` (`packages/solidaria/src/utils/mergeProps.ts:60`, `:143`). `createToggleButton` already builds its props with `mergeProps` (`packages/solidaria/src/button/createToggleButton.ts:97`, `:103`). Neither function changed.

`packages/solidaria-components` has no ActionButton. The rendered component test uses its ToggleButton (`packages/solidaria-components/src/ToggleButton.tsx:86`).

## Note 2026-09-22

A kept accessor is copied with `Object.getOwnPropertyDescriptor` and `Object.defineProperty`. The new getter calls the original with the source as `this`. A setter is forwarded the same way, and the property stays enumerable and configurable so a later `delete` still works. A data property still goes through the old assignment. The allow-list (`DOMPropNames`, labelable, link, global, events, `propNames`, `propRe`) is the same condition as before.

The components `filterDOMProps` (`packages/solidaria-components/src/utils.tsx:500`) had the same assignment, written as a cast, so the `] = props[` search did not see it. It now forwards the descriptor the same way. That function is already exported. No new name was added. The two blocks are the two copies. Form is not a third.

### Census

| Site                                                          | Verdict      | Why                                                                                                                     |
| ------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/solidaria/src/utils/filterDOMProps.ts:140`          | fixed        | Accessor descriptor is defined onto the result. A data property is still assigned at `:142`.                            |
| `packages/solidaria-components/src/utils.tsx:550`             | fixed        | Same snapshot in the components filter. Data properties still assign at `:552`.                                         |
| `packages/solidaria-components/src/Tree.tsx:1779`             | not-affected | The only `] = props[` hit. `dataProps` is called from the JSX spread (`:1799`), so each effect run reads `props` again. |
| `packages/solidaria/src/tooltip/createTooltip.ts:68`          | not-affected | One call to the fixed filter, then `mergeProps`. No second copy.                                                        |
| `packages/solidaria-components/src/Tooltip.tsx:767`           | not-affected | One call during setup. The JSX spread at `:795` reads the forwarded getters.                                            |
| `packages/solidaria-components/src/FieldError.tsx:104`        | not-affected | One call. The result is spread into `Text`.                                                                             |
| `packages/solidaria/src/actiongroup/createActionGroup.ts:180` | not-affected | The fixed filter goes straight into `mergeProps`.                                                                       |
| `packages/solidaria/src/button/createToggleButton.ts:97`      | not-affected | Already `mergeProps`. Not edited.                                                                                       |
| `packages/solidaria/src/button/createToggleButton.ts:103`     | not-affected | Already `mergeProps`. Not edited.                                                                                       |
| `packages/solidaria/src/utils/mergeProps.ts:143`              | not-affected | Already keeps a getter when `needsEagerRead` (`:60`) is false. `data-*` is not eager.                                   |
| `packages/solid-stately/src`                                  | not-affected | `rg '] = props['` printed no site there.                                                                                |

`rg '] = props[' packages/solidaria/src packages/solidaria-components/src packages/solid-stately/src` printed only `packages/solidaria-components/src/Tree.tsx:1779` and exited 0.

### Followups

`packages/solidaria-components/src/Form.tsx:117` assigns form names (`action`, `method`, and the rest of that set) that `filterDOMProps` drops. A reactive `action` is still a snapshot. `data-*` on Form already goes through the fixed filter at `:113`. The same descriptor block there would be a third copy, so it is not added.

`packages/solidaria-components/src/ToggleButton.tsx:111` object-spreads `ariaProps` into `createToggleButtonGroupItem` when the button is in a group. The standalone path uses `mergeProps` at `:101`. A grouped ToggleButton still snapshots a reactive `data-*`. That is a different edit, and it is not in this change. The regression covers the standalone path.

### Proof

Reverted only the two source files with `git diff` of those paths into `$TMPDIR/p`, then `git apply -R`. The test file stayed. Restored with `git apply`.

`vp test run packages/solidaria/test/filterDOMProps.test.tsx --maxWorkers=2` at 21:25, sources reverted:

```text
FAIL  packages/solidaria/test/filterDOMProps.test.tsx > filterDOMProps > reads a getter-backed data-foo after the signal changes
AssertionError: expected 'one' to be 'two'
 ❯ packages/solidaria/test/filterDOMProps.test.tsx:26:34

FAIL  packages/solidaria/test/filterDOMProps.test.tsx > filterDOMProps > updates a signal-backed data attribute through createToggleButton
AssertionError: expected 'one' to be 'two'
 ❯ packages/solidaria/test/filterDOMProps.test.tsx:48:45

FAIL  packages/solidaria/test/filterDOMProps.test.tsx > filterDOMProps > updates a signal-backed data attribute through ToggleButton
AssertionError: expected 'one' to be 'two'
 ❯ packages/solidaria/test/filterDOMProps.test.tsx:65:45

Test Files  1 failed (1)
     Tests  3 failed (3)
  Start at  21:25:04
  Duration  3.17s
EXIT=1
```

Same command at 21:25, sources restored:

```text
✓ packages/solidaria/test/filterDOMProps.test.tsx (3 tests) 115ms

Test Files  1 passed (1)
     Tests  3 passed (3)
  Start at  21:25:24
  Duration  3.19s
EXIT=0
```

`vp test run packages/solidaria --maxWorkers=2` at 21:25 also ran `packages/solidaria-components`, because that directory name starts with `packages/solidaria`. Printed: Test Files 170 passed (170). Tests 4251 passed | 6 skipped (4257). Start at 21:25:36. Duration 48.57s. EXIT=0.

`vp test run packages/solidaria-components --maxWorkers=2` at 21:26. Printed: Test Files 76 passed (76). Tests 2457 passed | 6 skipped (2463). Start at 21:26:42. Duration 34.71s. EXIT=0.

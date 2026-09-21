# #606 — the ToggleButton fork, and the three diverged twins it made visible

Written 2026-09-21 from base `45714230` in `ui` on `main`. Every count and exit
code below came from a command run in this seat; nothing is quoted from a prior
session, a log, or memory. This seat does not push, so no CI run backs any of it.

## 1. The red, reproduced

`guard:layer-boundary` stopped Certification Gates run 35623988073 at step 24
(`.github/workflows/certification-gates.yml:183-185`, `run: pnpm run guard:layer-boundary`),
sha `e8bacb9d` — `#588: fix what its review found`, an ancestor of HEAD
(`git merge-base --is-ancestor e8bacb9d HEAD` exits 0). It reproduces at
`45714230`:

```
$ vp run guard:layer-boundary
Shared paths: 608 (identical 523, diverged 85)
NEW forks (identical → diverged): 1
  button/ToggleButton.tsx
EXIT=1
```

Cause, from `git log` on the two files rather than from the message: `7e93d238`
(`form: the four buttons take the Form's size`, unticketed) edited
`packages/solid-spectrum/src/button/ToggleButton.tsx`, a path the baseline
freezes as byte-identical to `packages/viviana-ui/src/button/ToggleButton.tsx`,
and left the copy behind. `45714230` (#602's review fix) edited the same side
again. The other three buttons are baselined as **diverged** forks, so the guard
says nothing about them at all — which is why they had to be read and then
tested by hand.

## 2. Scope 1 — identity restored, baseline untouched

Checked before copying, because the baseline is never loosened to go green:
everything the new ToggleButton code imports exists on the viviana-ui side with
the same meaning.

- `useFormProps` is exported from `packages/viviana-ui/src/form/index.tsx:86`,
  beside `FormContext` (`:70`) and `useIsInForm` (`:82`). `diff` of the two
  `form/index.tsx` files shows only a comment and the spectrum side's two extra
  `FieldContextualHelp` exports — the proxy function itself is the same bytes,
  including the Skeleton override that forces `isDisabled: true`.
- `MenuTriggerContext` was already imported by the viviana-ui copy and comes
  from the shared `@proyecto-viviana/solidaria-components`, not from either
  register.

So the file was taken whole:

```
$ cp packages/solid-spectrum/src/button/ToggleButton.tsx packages/viviana-ui/src/button/ToggleButton.tsx
$ diff -q packages/solid-spectrum/src/button/ToggleButton.tsx packages/viviana-ui/src/button/ToggleButton.tsx
(no output)
```

`scripts/layer-boundary-baseline.json` is not edited by this ticket.

## 3. Scope 2 — the twins' defects, established by test

New file `packages/viviana-ui/test/Form.buttons.test.tsx`, 11 cases: two
`it.each` over `Button`/`ActionButton`/`ToggleButton`/`LinkButton` (`gives %s the
Form's size`, `disables %s through the Form and the Skeleton`), plus
`keeps ActionButtonGroup's isDisabled below the button's own prop`,
`keeps the MenuTrigger's isDisabled below the Form and the Skeleton`, and
`gives ActionButton's NotificationBadge the resolved isDisabled`. It mirrors
solid-spectrum's `Form.test.tsx` cases onto this register.

On the **pre-fix** source (restored ToggleButton only, the three twins as they
stood):

```
$ vp test run packages/viviana-ui/test/Form.buttons.test.tsx --maxWorkers=2
Tests  10 failed | 1 passed (11)
EXIT=1
```

The one pass is `disables Button through the Form and the Skeleton` — an honest
control, not a bound branch: viviana-ui's Button already called `useFormProps`
(`Button.tsx:61`), so its disabled path was right before this ticket while its
size path was not. Button therefore carried **only** the size defect;
`ActionButton` and `LinkButton` carried both, and so did the stale `ToggleButton`
copy, which Scope 1 fixed by taking the spectrum bytes rather than by porting.
Measured, `git show 45714230:packages/viviana-ui/src/button/<name>.tsx | grep -n
'useFormProps\|defaultProps'`: Button prints `:43` import, `:61`
`useProviderProps(useFormProps(runtimeProps))`, `:72` `defaultProps` and `:78`
`useFormProps(mergeProps(defaultProps, …))`; the other three print `defaultProps`
and no `useFormProps` at all. That split is also why 10 failed | 1 passed is the
expected shape and not a short count.

After the fix:

```
$ vp test run packages/viviana-ui/test/Form.buttons.test.tsx --maxWorkers=2
Tests  11 passed (11)
EXIT=0
```

## 4. The fix, per file

Shared logic only; nothing register-specific crossed the boundary.

- **`Button.tsx`** — it wrapped in `useFormProps` but merged `defaultProps`
  first, so a merged-in `size: "M"` left the Form nothing to fill. The merge is
  now `useFormProps(mergeProps(flags, contextProps ?? {}, runtimeProps))` and
  the defaults stay read-time (`local.size ?? "M"`, `:109`). Its own baselined
  divergences are untouched: `fontRelative(16)` for the icon (`:170`) and no
  genai/premium gradient.
- **`LinkButton.tsx`** — gained `import { useFormProps } from "../form"` and the
  same wrapper (`:88`); read-time defaults were already there (`:101-103`).
- **`ActionButton.tsx`** — gained the wrapper, dropped `defaultProps`, took
  `isDisabled` out of `groupProps`, resolved it once after both spreads as
  `headlessProps.isDisabled ?? groupContext?.isDisabled`, and gave
  `notificationBadgeContextValue.isDisabled` the same resolved value,
  `!!isDisabled()`.
- **`ToggleButton.tsx`** — the spectrum bytes, which carry both hunks already:
  the `useFormProps` wrapper around the context/props merge, and `isDisabled`
  lifted out of `menuTriggerButtonProps()` to
  `headlessProps.isDisabled ?? menuTriggerContext?.isDisabled?.()` after the
  spreads.

Upstream ordering, read from the installed pin and not from memory:
`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334` is `props = useFormProps(props)`;
`:345-347` let `ActionButtonGroupContext` win `size`, `staticColor` and
`isQuiet` as destructuring defaults; `:358` is
`isDisabled={props.isDisabled ?? isDisabled}`, group last; and `:381` opens
RACButton's children with `{({isDisabled}) =>`, which shadows the `ctx` value
destructured at `:348`, so the `isDisabled: isDisabled` handed to
`NotificationBadgeContext` at `:436` is that render prop and not the group value
— `react-aria-components@1.21.0/dist/private/Button.mjs:51` is
`isDisabled: props.isDisabled || false`, the coercion our `!!isDisabled()`
matches. `dist/private/ActionButton.mjs:437,508` compiles to the same shadow.
`react-aria-components@1.21.0`'s MenuTrigger never sets `isDisabled` on its
trigger.

## 5. Each new assertion binds its own branch

Two mutations of the fixed tree, each restored from a scratchpad copy of the
fixed file afterwards, each exit 1 and each isolating exactly one assertion:

| mutation | result |
| --- | --- |
| badge back to `!!headlessProps.isDisabled` | 1 failed \| 10 passed — only `gives ActionButton's NotificationBadge the resolved isDisabled` |
| `get isDisabled()` back inside `groupProps` | 1 failed \| 10 passed — only `keeps ActionButtonGroup's isDisabled below the button's own prop` |

## 6. Scope 3 and the regression sweep — exit codes

All run in this seat, all exit 0 unless stated:

| command | result |
| --- | --- |
| `vp run guard:layer-boundary` | PASS, identical 524, diverged 84, NEW forks 0, unbaselined 0 |
| `vp test run` Button / ActionButton / ButtonGroup / Buttons.geometry | 4 files, 16 passed |
| `vp test run packages/viviana-ui/test/` | 35 files, 226 passed |
| `vp run test:ssr` | 30 files, 79 passed |
| `vp run test:hydrate` | 28 files, 99 passed |
| `vp run typecheck` | exit 0 |
| `vp lint` | exit 0 |
| `vp check` over the five changed files | exit 0, formatting and lint clean |

## 7. Scope 4 — the changeset

`packages/viviana-ui` publishes as `@proyecto-viviana/ui` and its published
source changed, so `.changeset/viviana-ui-button-family-form-props.md`, patch.
`packages/solid-spectrum` was not touched here; its own changesets from
`7e93d238` and #602 already stand.

## 8. Scope 5 — how a one-sided edit gets past a writer

Measured by grep over the repository, not assumed. `guard:layer-boundary` has
exactly one automated caller: `certification-gates.yml:185`. It is **not** in
`ci:release-readiness`, whose chain in `package.json` is `check` →
`guard:workflow-pins` → `guard:gate-server-reuse` → `guard:attribution` →
`guard:generated-icons` → `guard:theme-base` → `guard:dependency-security` →
`guard:certified-case-floor` → `guard:source-artifacts` →
`guard:entry-import-budget` → `build` → `guard:package-sourcemaps` →
`typecheck:apps` → `test:run` → `test:ssr` → `test:hydrate` →
`test:comparison-ssr` → `test:comparison-hydrate` → `test:web` →
`comparison:test:journeys-driver`. It is not in `vp run check`.

**This contradicts the brief**, which says the guard runs in CI and in
`ci:release-readiness`. The tree wins and the disagreement is recorded on the
ticket rather than worked around.

### 8a. Correction, same day, from this ticket's own commit

The first version of this section also said the repository has no hook. That was
wrong, and `09779c89` printed the proof while committing it: `vp staged` ran
`vp check --fix` over the eleven staged files. Re-measured afterwards —
`core.hooksPath` is `.vite-hooks/_`, `.vite-hooks/pre-commit` is tracked and
contains `vp staged`, and `vite.config.ts:62-63` maps
`*.{js,jsx,ts,tsx,mjs,cjs,json,jsonc,css,md,yml,yaml}` to `vp check --fix`. The
guard survived that formatter: `vp run guard:layer-boundary` at `09779c89`
exits 0, 524 identical / 84 diverged / 0 new forks.

So the hook is where the smallest answer belongs, since it already fires on
exactly the commits that can fork a dual path. Proposed, not built: a second
`staged` entry in `vite.config.ts`, a glob over
`packages/{solid-spectrum,viviana-ui}/src/**` mapped to
`vp run guard:layer-boundary`. `vp staged` appends the staged paths to the
command, which is safe here:

```
$ grep -n argv scripts/check-layer-boundary.ts
33:const writeBaseline = process.argv.includes("--write-baseline");
34:const reportOnly = process.argv.includes("--report");
$ vp exec tsx scripts/check-layer-boundary.ts packages/viviana-ui/src/button/Button.tsx packages/solid-spectrum/src/button/ToggleButton.tsx
PASS: ... 524 identical copies + 84 diverged
EXIT=0
$ /usr/bin/time -f "REAL %e s" vp run guard:layer-boundary
REAL 0.50 s
```

Complement if a second net is wanted: one `&&` clause adding
`vp run guard:layer-boundary` to `ci:release-readiness` beside
`guard:source-artifacts`, its neighbour on the gates ladder. Rejected: folding
it into `vp run check`, the wrong cadence for a dual-tree inventory. Both are
proposals; `vite.config.ts` and the release chain are outside this ticket's
write paths.

## 9. What this receipt does not prove

- Nothing here has been seen by CI. `merged`, not `verified`.
- The 84 remaining baselined forks and 524 frozen identical paths were not
  audited; only the four button files were.
- #605's residue stands: viviana-ui's ActionButton feeds its NotificationBadge
  the group-resolved `size()` with an `M` floor, the same shape #605 files
  against solid-spectrum. Out of scope here, and #605 should fix both twins in
  one pass.
- The size assertions compare generated class names between a Form-wrapped
  control and a standalone control of the known size; they do not measure
  rendered pixels.

## 10. Review round, same day

Two problems were raised against the landed work. One was wrong and the code
stands; one was right and is corrected above.

**Upheld: the badge getter matches the pin.** The review read
`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:348` (`isDisabled` destructured
out of `ctx || {}`, the `ActionButtonGroupContext` value) and concluded that
`:436`'s `isDisabled: isDisabled` is that group value alone, so the badge should
read `!!groupContext?.isDisabled` and neither the button's own prop nor the Form
should grey it. It misses `:381`, which opens RACButton's children as
`{({isDisabled}) =>` and shadows `:348` for the whole `:381-507` closure that
`:436` sits inside; `dist/private/ActionButton.mjs:437,508` compiles to the same
shadow. So `:436` is the render prop, which
`react-aria-components@1.21.0/dist/private/Button.mjs:51` defines as
`isDisabled: props.isDisabled || false` over what `:358` passed — the resolved
`props.isDisabled ?? ctx.isDisabled`, itself downstream of `:334`'s
`useFormProps`. `!!isDisabled()` is that value. The test binds it: applying the
review's proposed getter to the fixed tree and running the file gives
`1 failed | 10 passed (11)`, EXIT=1, failing only
`expect(cls("own-badge")).not.toBe(cls("enabled-badge"))` at
`Form.buttons.test.tsx:189` — the assertion that distinguishes upstream from the
proposal. Restored, EXIT=0. The changeset line stands as written.

The real defect behind that misreading was the citation: all four copies said
`:436,432` and never named `:381`, so the cited lines did not support the claim
they carried. Both `ActionButton.tsx` badge getters and both test comments now
cite `:348,358,381,436`, and §4 above says why.

**Corrected: "all three diverged twins carried both defects" was false.** §3 now
reads Button as carrying only the size defect, with the grep that shows it, and
names `ActionButton`/`LinkButton` (plus the stale `ToggleButton` copy) as the
ones that carried both. The claim was also in the second ticket note, in the
commit message of `09779c89`, and in #544's note and S0-f bullet; the two
documents are corrected, and the commit message is immutable, so a dated ticket
note carries the correction instead.

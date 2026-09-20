# UI #543 date, overlays, disclosure and navigation execution receipt

Date: 2026-09-20

## Authority and provenance

- Verified starting `HEAD`, `main`, and `origin/main`:
  `fe66e5bdfd631fb7b6019e1d27ed228d0dfd8e6b`.
- The canonical eligibility check passed before source work. Stage A and Stage B
  each received independent acceptance and an explicit next-stage release.
  Stage C was then explicitly released in the same source generation.
- No delegation, install, provider/network use, dependency/config/product
  package/public API change, staging, commit, push, PR, or external message was
  performed. The index remained empty.

## Bounded source result

Nineteen named fixtures under
`apps/comparison/src/components/solid/fixtures/styled/` now directly return the
existing listener teardown from their fixture-owned `onSettled` callback:

- Stage A: `calendar.tsx`, `colorarea.tsx`, `colorfield.tsx`,
  `colorslider.tsx`, `colorswatch.tsx`, `datefield.tsx`, `datepicker.tsx`,
  `daterangepicker.tsx`, and `timefield.tsx`.
- Stage B: `actionmenu.tsx`, `contextualhelp.tsx`, `dialog.tsx`, `menu.tsx`,
  `popover.tsx`, and `tooltip.tsx`.
- Stage C: `accordion.tsx`, `breadcrumbs.tsx`, `disclosure.tsx`, and
  `steplist.tsx`.

Exact event sources and add/remove tuples, callback identities, initialization,
state ownership and public behavior remain in place. Calendar retains its
fixture-specific controls event. Popover still owns only its controls listener;
the shared resolved-theme signal remains its theme owner. ContextualHelp,
Popover and Tooltip retain external-open close guards. Dialog retains a
separate controlled-open owner.

The only additional fixture-local live behavior is bounded to documented
shape changes. Breadcrumbs now keys its inner collection branch by mode plus
serialized path. This repairs an observed defect where keyboard action narrowed
the direct-child path but the static collection retained stale current-item
bookkeeping and rendered no `aria-current`. The passing proof shows a size-only
update retains the same focused Home link, Enter publishes the action and
narrows the path, and the reconstructed branch renders Home with
`aria-current="page"`. The outer root, action count, last action and serialized
path owners stay outside the branch. Switching direct-child to items/render-
prop mode is independently structural because the collection construction
contract changes.

Disclosure's optional header-action change is structural only because the
component alternates between an explicit `DisclosureHeader` containing title
and action and an auto-wrapped title. The proof retains the outer Disclosure
through live size/density/quiet updates, then replaces that affected header
composition and removes the action. Accordion has no structural remount in
this scope. StepList defaults are explicitly uncontrolled initialization
inputs: proof supplies them before mount through the URL, preserves selection
and descendants under live disabled/read-only controls, and does not add a
remount to imitate live default semantics.

## Proof and census

- Stage A final focused proof: 17 passed, 72 skipped;
  `/tmp/ui-543-date-overlays-nav-stage-a-test.log`.
- Stage B corrective focused proof: 12 passed, 89 skipped;
  `/tmp/ui-543-date-overlays-nav-stage-b-corrective-test.log`.
- Stage C final focused proof: 8 passed, 101 skipped;
  `/tmp/ui-543-date-overlays-nav-stage-c-test-green.log`.
- Whole shared fixture file: 109/109 passed;
  `/tmp/ui-543-date-overlays-nav-final-shared-test.log`.
- Root typecheck passed once;
  `/tmp/ui-543-date-overlays-nav-final-typecheck.log`.
- Final Stage C format, lint and diff checks passed;
  `/tmp/ui-543-date-overlays-nav-stage-c-{format,lint,diff-check}.log`.

The TypeScript AST census moved from the accepted 35 registrations in 34 files
to 26/25 after Stage A, 20/19 after Stage B, and 16/15 after Stage C. Stage C's
four-file scope is 0/0. Logs:

- `/tmp/ui-543-date-overlays-nav-stage-a-census-{scoped,total}.log`
- `/tmp/ui-543-date-overlays-nav-stage-b-census-{scoped,total}.log`
- `/tmp/ui-543-date-overlays-nav-stage-c-census-{scoped,total}.log`

Two initial Stage C focused attempts remain recorded honestly. Each passed
7/8; the sole Breadcrumb assertion first queried the pre-narrowing branch, then
the reacquired DOM exposed the missing current semantic. The bounded keyed-path
fixture correction produced the final 8/8 result. Logs:
`/tmp/ui-543-date-overlays-nav-stage-c-test.log` and
`/tmp/ui-543-date-overlays-nav-stage-c-test-final.log`.

An unprefixed read-only launcher inspection attempted to resolve a Node runtime
from `nodejs.org` and failed on restricted DNS. It did not run a product gate,
install, or network bootstrap. All prescribed gates used the installed Node 24
path and local `node_modules/.bin/vp`; the accepted whole-file 109/109 proof was
not repeated because of this launcher-only failure.

## Limits

The shared proof is real-control CSR through Solid `render` in the test DOM. It
does not claim actual fixture SSR/hydration, browser layout/styling, or real-
browser overlay/navigation focus certification. Remaining 16 registrations in
15 collection/navigation/async fixture files, strict-warning and config debt,
broader app/web work, four-layer builds, attribution, packaging and all release
gates remain open. Tickets #543 and #531 remain `in-progress`; no ticket,
foundation, port, packaging, or release acceptance is inferred.

## Protected paths

The five unrelated #534 paths remain byte-identical to the required snapshot
and unstaged:

```text
7c51470ec2dd4ba385a1af66c136efc99f14659e443f740d5d2c7e97294a8f33  packages/solidaria-components/test/Button.test.tsx
0bec2fbe0a4855ed6749da0104e7f6029bb65066cfe4bbaf67b67fb0d4fa1eac  packages/solidaria-components/test/Tooltip.test.tsx
31c0be0a17cfa870e9ad180d3faef79a8d164df0bce6d390f70db8e84944e0f5  packages/solidaria/src/interactions/createHover.ts
f3b7574fd4b1cd8965083c2e4df94044d7d139067936cebb823995508a67e1ae  packages/solidaria/test/createHover.test.tsx
4492658cdb3af38c57c2a67e7f36bc3e8b4953a435f2f65e3cd1b457ad3d7b86  packages/solidaria/test/createTooltip.test.tsx
```

Detailed staged evidence and command ledger:
`/tmp/ui-543-date-overlays-nav-result.md`.

## Final gates and checkout

The final whole shared fixture file passed all 109 cases with the installed
Node 24 runtime and local Vite Plus executable. Root typecheck passed. The
one-time docs generator updated only `.claude/current/status.md` and
`.claude/current/roadmap.md`, and the subsequent docs-current check passed.
Raw logs:

- `/tmp/ui-543-date-overlays-nav-final-shared-test.log`
- `/tmp/ui-543-date-overlays-nav-final-typecheck.log`
- `/tmp/ui-543-date-overlays-nav-final-docs-generate.log`
- `/tmp/ui-543-date-overlays-nav-final-docs-check.log`
- `/tmp/ui-543-date-overlays-nav-final-diff-check.log`

The later unprefixed launcher diagnostic that attempted DNS resolution is
recorded separately above. It was not a product gate and does not invalidate
the accepted 109/109 local-runtime result; per final-gate direction, that
whole-file proof was not rerun.

The final task-owned checkout comprises exactly the 19 named fixtures, the
shared fixture test, four live-doc/ticket files, and this receipt (25 paths).
The only other dirty paths are the five protected #534 files listed above;
their bytes and unstaged state are preserved. The index is empty. No source,
test, gate, or documentation command is authorized after this record closure
pending independent final review.

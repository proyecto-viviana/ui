---
id: 557
type: task
title: "createFocusWithin never fires from a descendant, so overlays need an invented listener"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while deciding #555 item 3. `focusWithinProps` returns `onFocus`/`onBlur`, which in Solid bind the native, non-bubbling `focus`/`blur` events; React's synthetic pair bubbles, which is what upstream useFocusWithin relies on. Measured: a real `.focus()` on a child of the element holding focusWithinProps calls neither onFocusWithin nor onBlurWithin. createOverlay papers over it with a document-level `focusin` listener that upstream does not have; removing that listener turns Popover.test.tsx 'should close modal popovers when focus moves outside' red",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings re-homed here from #555. `555-b/item3-closed-as-removed-but-kept`, confirmed: #555 is merged claiming item 3's invented listener was not kept; it is still live, and this ticket is the one that removes its reason to exist. `555-a/overlay-child-scope-unfixed`, and the headline is **refuted** - the `focusin` effect installs only when `shouldCloseOnBlur` is set, at `createPopover.ts:132`, so no child menu closes its dialog and there is no defect to fix. What is left is exactly this ticket's subject: `createFocusWithin` never fires from a descendant, so an overlay needs a listener upstream does not have. Fixing that deletes the listener; nothing else does.",
    }
  - {
      state: verified,
      at: 2026-09-24,
      note: "Route focusWithinProps through bubbling onFocusIn and onFocusOut events and normalize event type to focus/blur. Removed invented document-level focusin listener from createOverlay. Added dedicated descendant-focus test in createFocusWithin.test.tsx (all 12 tests green). Popover.test.tsx (all 44 tests green), ToggleButton.test.tsx, Dialog.test.tsx, and all 95 solidaria test files green. vp run check passes across 4493 files.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Reopen the bounded native FocusEvent accessor receiver defect reproduced during #632 qualification; preserve the older verified bubbling-transport result as historical evidence.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit the registered native-accessor continuation after #542 closed stop and accepted 1586cfc3 integration. Exact source, owning-test and existing browser-fixture paths are recorded below; original full certification remains pending.",
    }
---

## Scope

1. Port `useFocusWithin` so focus within an element's subtree reaches it, the
   way React's bubbling synthetic `onFocus`/`onBlur` do — `onFocusIn` /
   `onFocusOut` in Solid. The blast radius is every consumer:
   `createFocusRing`, `createMenu`, `createListBox`, `createRadioGroup`,
   `createCheckboxGroup`, `createNumberField`, `createDateField`,
   `createVisuallyHidden`, `createOverlay`. Check each for a prop-name clash
   with its own `onFocusIn`/`onFocusOut`.
2. Then remove `createOverlay`'s document-level `focusin` close listener
   (added by `47746917` for the ActionMenu focus-out contract, no upstream
   counterpart) and prove the contract still holds from `onBlurWithin` alone:
   `packages/solidaria-components/test/Popover.test.tsx` and
   `apps/comparison/e2e/actionmenu-contract.spec.ts`.
3. Re-read `Color.tsx`'s note about `createFocusWithin` only flipping on the
   element itself; it is the same defect described from another component.

## Done when

`createFocusWithin` fires for descendant focus with a red-then-green test, the
invented listener is gone, and the Popover and ActionMenu contracts are green
without it.

## Proof

The red run of the descendant-focus test on the old source, the green run
after, and the two contracts above with the listener removed.

## Relationship

Child of #544. Split out of #555 item 3, which lands the rest of `useOverlay`
parity and leaves the listener in place with a comment pointing here.

## Native accessor continuation admission — 2026-10-08

The 2026-09-24 verified result remains historical bubbling-transport proof.
Current #632 native qualification encountered Chromium Illegal invocation
when the normalized FocusEvent Proxy reads native accessors with the Proxy
receiver. Reopen only this bounded native-accessor owner; the autonomous
remaining-work instruction authorizes ordinary repair, not silent acceptance
of the older full contract or an Escape-focus workaround.

After #542 exact-generation stop and accepted integration, register
`ui-557-native-20261008` in eligible repo:ui main with
`/tmp/ui-557-dispatch-2026-10-08.md`, which supersedes older proposed runner
names in the preparation brief. Codex astra low handles this native receiver
hard slice under Decision040 after the documented Grok quota / AGY manual
approval limitation. Use normal workspace-write/on-request controls. The
conductor accepts and commits after exact-generation stop; native reviewers
write no repository files.

Exact writes:

- `packages/solidaria/src/interactions/createFocusWithin.ts`: native Proxy
  accessor receiver only, retaining normalized type and bound methods.
- `packages/solidaria/test/createFocusWithin.test.tsx`: owner regressions.
- `packages/solidaria-components/test/fixtures/focus-browser/main.tsx`: append
  native focus owner/descendant/disabled/disposal controls; preserve the
  existing DropZone/FileTrigger fixture and original tab order.
- `apps/comparison/e2e/filetrigger-dropzone-focus.browser.ts`: synchronous
  native accessor assertions and pre-navigation zero-error observations for
  original and new cases.
- `.changeset/native-focus-event-accessors.md`: solidaria patch only.
- This ticket, generated status/roadmap through the standard generator, and
  `/tmp/ui-557-*` evidence.

The existing tracked filetrigger-dropzone-focus.playwright.config.ts and
fixture Vite config remain unchanged; no new config, dependency, API, style,
listener, shared helper, or other product path is admitted. Use the existing
source-linked fixture in the sole serialized browser lane, with the tooling
renderer flag on this host. Preserve all four original browser cases and
record the click-spy's OS-dialog limit. Native final assertions must fail
against exact base source, then pass after the accessor repair, with
failure-safe byte/hash restoration. Save raw checks and all final path hashes.

Run focused FocusWithin/Popover and related focus suites, scoped static/docs
checks and one root typecheck with inherited diagnostics. Full original
ActionMenu proof, #632 Escape restoration, #630/#639 native identity, broader
certification and release remain separate pending actual fresh results. No
blanket untrack, caught native errors, synthetic-event substitute, stale
server reuse, or revival of createOverlay's document focusin listener.

## Bounded native accessor worker evidence — 2026-10-08

Registered Codex generation `0da26703-33b8-49a6-8c15-2a630d9df263` started
from clean main `897f6dcba0b0ca7863fb51b73d1d76866eab8607`, after #542's
closed stop and accepted `1586cfc3` integration. Eligibility matched canonical
policy. The only product change makes the native event the explicit receiver
of `Reflect.get`; normalized type, target-bound methods and existing focus
transport/listener behavior remain intact.

The final browser assertions fail against that exact base source: 2 failed,
6 passed, with raw Chromium Illegal invocation stacks at the native accessor.
The final source is restored byte-for-byte under a finally block and SHA256
check. Restored final source passes all 8 native cases, including the lowercase
tabindex fixture correction. Synchronous callback snapshots cover target/currentTarget/relatedTarget
and nonempty native composedPath, descendant A→B→outside without reentry,
direct-owner focus, disabled controls and no later callbacks after disposal.
The original four browser cases are byte-identical; all eight assert errors
and unhandled rejections observed before navigation. The click spy proves
file-click isolation, not opening an OS file dialog. The new fixture uses
Solid lowercase tabindex; both existing configs remain unchanged.

Final ordinary suites: FocusWithin and Popover 62/62; related focus 50/50.
The old-source unit suite also passed 14/14: only the native control reproduces
this accessor defect. Root typecheck fails with exactly the same 24 diagnostics
as the accepted #542 receipt, no additions. That root config excludes ordinary
tests and browser fixtures. No Popover failure required base attribution.

The requested root vp exec command could not resolve playwright; the admitted
installed apps/comparison executable runs the same tracked config. Sandbox
startup failed with listen EPERM on 127.0.0.1:4479, so native runs used approved
host execution, the existing browser cache and --disable-software-rasterizer.
No install, new runner, dependency, server reuse or package build was used.

Exact final native/static/docs outcomes, commands, cwd, exits, counts, raw logs,
source restoration and all admitted-path hashes are in
`/tmp/ui-557-worker-result-2026-10-08.md` and its JSON receipts. Worker evidence
awaits conductor acceptance and exact-generation stop; no commit or push.
Original #557 ActionMenu proof, #632 Escape restoration, #630/#639 native
qualification, candidate/release gates and full certification remain open.

## Conductor acceptance — 2026-10-08

Accepted the bounded native-accessor slice after reading its actual diff,
raw old/final Chromium controls, restored source, 112 ordinary passes,
independent review and all ten admitted-path hashes. Exact owned generation
`0da26703-33b8-49a6-8c15-2a630d9df263` stopped with `closed: true`; receipt:
`/tmp/ui-557-owned-stop-2026-10-08.json`. The review's final append is a dated
snapshot after worker sealing; no source or test hash changed. Root typecheck
still has 24 inherited diagnostics, and hub audit remains failed 13/38; neither
is reported green. Full #557, dependent qualification and release remain open.

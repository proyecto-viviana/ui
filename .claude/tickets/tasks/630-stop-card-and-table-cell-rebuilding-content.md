---
id: 630
type: task
title: "Stop Card and TableCell from rebuilding their content on hover, press, and focus"
created: 2026-10-08
parent: 24
status: in-progress
blocked: true
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "D16: a Card in a CardView and a TableCell rebuild their content on hover, press and focus, which drops state held inside (an open menu, typed text). Found in a real browser on 0.8.0-rc.0; happy-dom does not show it.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "Chromium: a TextField in a TableCell keeps its text and focus when the pointer moves onto the next cell, and that cell reports hovered. An open menu in a Card stays open across hover, press, and focus. Mounts stay at 1 for solid-spectrum and viviana-ui. A pre-existing focus-within proxy throws on that focus and does not dismiss the menu.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Paired runtime experiment reopens qualification: current destructured booleans stay stale; tracked callback reruns dispose fresh stateful children. Exact source/test restoration leaves the inherited red unchanged. Owner compatibility/design disposition is pending.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Owner approved TableCell reactive getter authoring and its React destructuring compatibility consequence. Bounded comments and durable getter preservation controls are qualified; native original-node/caret/Card-menu and installed final-candidate proof remain open.",
    }
---

A `Card` in a `CardView` and a `TableCell` call their content again each time
the row is hovered, pressed, or focused. State held in that content is lost.
In visualmode an `ActionMenu` in a card closed under the mouse press that
opened it, and a `TextField` in a table cell lost its text and its focus when
the pointer reached the next cell. happy-dom does not show it; a real browser
does.

`packages/solid-spectrum/src/card/index.tsx` and
`packages/viviana-ui/src/card/index.tsx` call the card content from inside the
`CardView` item render, which receives hover, press, and focus.
`packages/solidaria-components/src/Table.tsx` `TableCell` calls its children
with `renderValues()`, and those values include `isHovered`, `isPressed`, and
`isFocused`.

Build the content once per item, and pass hover, press, and focus as reactive
reads. No public name. No upstream equivalent; this is a port defect of
render props that re-run.

## Done when

In a browser, typing in a `TextField` inside a `TableCell` and moving the
pointer across the row leaves the text and the focus unchanged. An open menu
inside a `Card` in a `CardView` stays open across hover, press, and focus.
happy-dom is not the proof. Do not close this as unreproduced.

## Relationship

Child of #24. Visualmode works around it at `src/app/admin/AdminTable.tsx`
(02bda79e9) and `src/app/app/FileBrowserSections.tsx` (05b086669). Both go
when this lands. Visualmode tickets #10147 and #10150 wait on it.

## Bounded compiler qualification — 2026-10-08

Admitted source implementer generation `01afa4c5-37d0-42c3-b7b6-351444b75abf` on
base `0d9323a4e94ca07a3bf532bb867d60a05db128ad`; prior #625 owned generation is closed.
Codex fallback is authorized by the saved Grok/AGY quota receipts. Only
TableCell private child narrowing, this ticket, and generated status/roadmap
are writable. Existing tests and Card sources remain read-only. Compiler
qualification is reopened for this bounded slice; historical verified runtime
status does not establish clean native proof. Durable original Card/Table
browser qualification remains a separately admitted follow-on; the historical
tolerated focus exception is not clean native evidence. #557 is not a
prerequisite. No release prose or full-ticket closure is included.

Initial bare-accessor trial was blocked (superseded by the amendment below). The original canonical
compiler run reports 21 errors (6 package, 15 script), including TS2322 at
Table.tsx:2410 and :2419. Separating static children and the existing arity
branches with a private `() => JSX.Element` assertion still reports both
errors: installed `@solidjs/web` JSX.Element excludes functions, including
zero-argument accessors. Source was restored byte-for-byte; no runtime or
public-type change was admitted. A renderer insertion type-contract decision
is required before another implementation attempt; an intersection assertion
that disguises an accessor as JSX.Element would merely suppress the conflict.

The attempted narrowing's existing Table suite reports 167 passed / 1 failed
at Table.test.tsx:3862 (destructured isFocused does not update cell text).
Original source reproduces the same 167 passed / 1 failed result.
Comparison and command receipts are in `/tmp/ui-630-*`; this
is not a new lifecycle certification. Lint passes with two existing warnings.
The worker cannot authenticate gh; the conductor's old main run is not
candidate evidence. No browser/build/SSR/hydration or release claim is made.

### Admitted accessor boundary amendment

The 2026-10-08 conductor amendment retains the same base and generation and
admits localized controls in existing Table.test.tsx. A private predicate
keeps the existing length===0 distinction; a JSX fragment now supplies a
renderer-owned insertion for that accessor. Static children, getter-backed
argument-taking children, outer untrack, and host/custom-render order remain
unchanged. No public types or JSX casts are added.

Installed DOM and hydratable transforms emit `memo(rawChildren)`; renderer
`memo` uses `createMemo(() => fn())`, retaining tracking and zero arguments.
The two added preservation controls exercise both host paths, live content
updates, retained cell/input/button identity, typed input, local component
state and focus. The full suite reports 169 passed / 1 failed; the unchanged
destructured-isFocused assertion remains the separately unresolved consumer
defect reproduced by the original-source 167/168 control. These controls are
not claimed as old-source regressions.

Amended canonical typecheck removes exactly the two owned TS2322 errors,
with no additions: 19 inherited diagnostics remain (4 package / 15 script).
Existing Spectrum Table SSR passes 2/2, then hydration passes 1/1 using the
fresh recorded table-selectable-ssr.html identity. This preserves the existing
fixture's surrounding hydration order, not uncovered zero-argument hydration.
Scoped formatting and lint pass (two inherited lint warnings). Evidence,
compiled transforms, superseded blocker receipts, and final identities are
bound by `/tmp/ui-630-evidence-manifest.json`. Independent conductor review
and exact-generation owned stop remain pending; no full-ticket/native/release
closure is claimed.

## Paired runtime experiment admission — 2026-10-08

Registered source implementer `f321f8ac-9826-4b51-9050-c1d10ba8b978` on base
`a424db2065017ce447bd66317a1df0e348b38364`; prior #54 owned stop reports closed.
Eligibility matches canonical policy; initial tracked inventory is clean.
Owner-authorized Codex fallback runs the bounded reversible experiment. Only
Table.tsx and Table.test.tsx may change temporarily, under double byte restoration;
final writes are this ticket and generated status/roadmap. Conductor owns
acceptance, owned stop and commit. No browser/build/compiler rerun or durable
regression change is authorized by this experiment. Evidence uses
`/tmp/ui-630-runtime-*`.

### Measured runtime boundary and decision debt

Initial full owning Table command, on the admitted source/test hashes:
`vp test run packages/solidaria-components/test/Table.test.tsx --maxWorkers=1`
reports **169 passed / 1 failed**, exit 1. The unchanged destructured header
focus assertion passes; the cell expects `Foo (focused)` and receives `Foo`
at line 3932. This is a new measurement, not a reused historical count.

Four temporary paired controls cover default/custom hosts and fresh/retained
stateful children. Identical final experimental tests give current **4 failed**,
trial **2 passed / 2 failed**, restored source **4 failed**; each skips the 170
original tests and exits 1. The restored observations exactly match current.
Attempt 1 and its preliminary triple are archived with hashes. The valid effect
cleanup correction is retained; a conductor-requested producer observation
correction separates live getters from custom-host snapshot attributes.
No temporary assertion, source change, or extra red test remains in the suite.

Current source invokes each callback once. Both child compositions retain one
mount, zero disposals, original connected nodes, input value, backward selection
and local button state. Focus/hover destructured text stays false. The temporary
one-line tracked insertion makes callback values current but fresh children
reach five mounts/four disposals: the first cell-focus transition already
replaces input/button and prevents returning focus to the original input.
Later hover observations retain that failure; they do not isolate an independent
hover-only replacement. The original detached button no longer updates its DOM.

Both retained controls pass the trial, with seven callbacks but one mount/zero
disposals, live independent effects, text, caret and focus intact. Captured live
child getters confirm focus/hover producers on both hosts and source variants.
The callback still destructures those getters into booleans inside its body.
Default-host state attributes are asserted. Custom-host spread attributes remain
frozen and are recorded separately; they are not evidence of producer failure.
This existing custom-render limitation was not repaired and host ordering was
not changed. Real DOM dispatch observations are untrusted jsdom events, not
browser native proof. This is an experiment, not an accepted product fix or a
passing release gate.

Both source and tests were restored in `finally`, byte-identically to admission;
their final git diff is empty. Full baseline is bound to those same hashes.
Accepted #54 compiler qualification is reused: generation
`01d2dec7-aa09-4584-bd17-93841b552f9b`, qualified typecheck exit 2, 15 inherited
script diagnostics. Exact accepted source/compiler inputs match. No compiler
rerun or runtime-correctness claim follows from that receipt.

Owner choices are now concrete: deliberately narrow consumer compatibility to
reactive getter reads; scope a compiler/reconciliation design separately; or
hold. The tested rerun does not meet original stateful-identity acceptance.
Neither boolean assertions nor public contracts have been amended. These
installed-runtime results do not exhaust compiler transformations or specialized
compositions. A later approved repair must add durable passing regressions;
original Card/Table browser qualification remains open. Handoff, executable
patches, raw logs, observations, restoration and manifests use the authorized
`ui-630-runtime-` evidence prefix in the external temporary directory.

## Approved getter contract admission — 2026-10-08

Owner approved reactive TableCell getter reads and the React callback/destructuring
compatibility consequence. Registered source implementer generation
`cd663182-dece-4deb-a12d-f628c80f80a3` starts on base
`25e6a6ec547ee8860c8476819e1373d10cad4da3`; #19 owned stop is closed,
the checkout is clean, and canonical eligibility passes. Codex fallback is
explicitly authorized while the saved Grok/AGY quota failures persist.
Only Table.tsx comments, Table.test.tsx, the named components patch note, this
ticket and generated status/roadmap are admitted. Runtime, public types, shared
helpers, custom attributes and styled sources stay unchanged. Native original-node,
caret, Card-menu and installed final-candidate qualification remain separate;
this slice cannot close #630. Conductor owns review, exact owned stop and commit.

### Bounded getter results

The actual launch full Table run reports 169 passed / 1 failed, exit 1; the
existing cell destructuring assertion is the failure. Under the explicit approval,
only that cell callback now reads `state.isFocused` inside JSX. Header destructuring
and every existing expectation stay intact. Table.tsx changes are comments only;
TypeScript printing with comments removed is identical before and after.

Two durable default/custom-host controls create a fresh inline StatefulChild in
an argument-taking callback. Focus/hover text and the independently captured
producer getters update through entry/removal while original connected cell,
input, button and event targets survive. Typed value, backward caret, appropriate
focus and independent local state survive; one callback/mount, zero owner disposals
before unmount, and separate effect rerun/cleanup counts are asserted. Explicit
unmount produces one owner disposal and the final returned Solid 2 effect cleanup.
Default managed attributes are live. Custom spread attributes remain the existing
snapshot limitation; no custom attribute repair or header contract is implied.
These are jsdom untrusted-event controls, not native browser proof.

The exact admitted old source passes both final controls (2 passed / 170 skipped,
exit 0), honestly establishing preservation. A temporary snapshot-destructuring
mutant fails both at the intended focused live-text assertion (exit 1). Final source
and tests are restored byte-for-byte with SHA256 receipts; the final full owning
command `vp test run packages/solidaria-components/test/Table.test.tsx --maxWorkers=1`
passes 172/172, exit 0. The previously measured tracked-callback experiment already
showed fresh-child disposal; it was not rerun. The new changeset documents Solid
getter authoring and the React callback/destructuring difference, not a runtime fix.
No duplicate TableCell getter contract note was found.

Canonical `vp run typecheck` was run on the actual launch and final source: both
exit 2 with the same 15 script diagnostics, zero additions/removals. Scoped lint
passes. Formatting and owning generated-doc checks are recorded in the sealed
`/tmp/ui-630-getter-*` evidence with commands, exits, manifests and restoration.
Worker GitHub auth is unavailable; conductor's old green main run is not candidate
qualification. No browser, build or packed-consumer qualification was performed.
Native original-node/caret/Card-menu proof and installed final-candidate evidence
remain separately admitted debt; #630 stays in progress. Conductor independently
reviews, owned-stops and integrates; worker does not commit, push or publish.

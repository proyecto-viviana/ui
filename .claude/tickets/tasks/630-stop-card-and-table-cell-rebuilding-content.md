---
id: 630
type: task
title: "Stop Card and TableCell from rebuilding their content on hover, press, and focus"
created: 2026-10-08
parent: 24
status: in-progress
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
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "ROOT accepted current owning247/0/0, restored source-native76/0/0 and canonical source typecheck exit0. Fixture sensitivity controls were closed and exactly restored; installed final-candidate/release proof remains open.",
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

## Native phase1 source admission — 2026-10-09

Actual registered source implementer generation
`17c3138e-ecbd-4883-bee5-b659c87f6149` on integrated base
`ed4262bb909e7cc025bcddb6734d3f176ec8ad75`; preceding #642 owned generation
reports closed. Registration is `/tmp/ui-630-native-20261009-registration-2026-10-08.json`.
Owner selected gpt-6.1-sol medium. Exactly fixture, browser spec, this ticket and
generated status/roadmap are writable. Canonical eligibility was supplied by
conductor; phase1 forbids runtime eligibility/helper launch and all tests,
controls, discovery, build, browser, server, cache inspection and network.
Accepted #642 checkpoint records native 64/64 raw0 and eight original ledger
cells with eight attempts each (four failed, four passed); original ceiling10
is unchanged. These are conductor-supplied prerequisite facts, not this
worker's execution. Accepted getter contract and #643 cleanup remain accepted;
native retention and installed qualification remain open. No custody is issued.

### Phase1 authored preparation

Prepared an isolated #630 fixture mode using direct Card/CardView/Table/TextField/
ActionMenu/MenuItem sources for both solid-spectrum and viviana-ui. Twelve new
cases are authored and UNEXECUTED: each twin has default/custom Table hover/caret
and focus/press cases, plus Card pointer same-open and keyboard dismissal cases.
Original32 and #64232 case bodies/oracles are preserved; static byte evidence
is distinct from served graph, generated matching CSS and one-Solid runtime proof.
Table callback getter reads, original refs, local signals, separate owner/effect
cleanup counters, trusted synchronous targets and explicit disposal are asserted.
Default managed attrs are live; custom spread remains snapshot-limited.

Named fixture-only `snapshot-table-getters` and `fresh-child-remount` sensitivity
variants are prepared; both must use identical live-text/identity assertions under
focused #630-only selectors. They have NOT RUN. Future controls must save final
fixture/spec bytes, mutate only the named fixture value, restore in finally and
prove exact equality before the single admitted full replay.

The reviewed binding seam is reconciled against exact integrated #642 bytes,
including explicit originalKey/Object.hasOwn/SHA+bytes linkage. Root addendum
`/tmp/ui-630-native-20261009-root-replay-guard-instructions-2026-10-09.md`
pins latest accepted seal/manifest/ledger and actual failed1–4/passed5–8 history.
Both replay keys are required under #630 output; both absent preserve original
#642 output behavior. Prepared invocation starting-state and in-memory serialized
ledger checks reject deletion/truncation across reservation/finalization. This
does not enforce single-use restart protection; root runner must enforce it.
Separate replay allowance is four per cell after genuine prior8, cumulative9–12;
no old ledger/cap/history is rewritten. All guards/controls remain UNEXECUTED.

Root must issue authentic frozen snapshots, binding, unique single-use invocation
starting-state, exact focused/control and final commands, fresh exclusive custody
and explicit separate replay allowance. Native #630 cases never reserve #642 cells;
root must also bound/record their own invocation/attempt inventory before execution.
No runtime, installed consumer, candidate, publication, closure or workaround
removal is claimed. Phase1 handoff/seal use `/tmp/ui-630-native-20261009-*`.

### Root static amendment — phase1 revision2

Root adopted review SHA75eca6f506b08ca571941e9a81914649667b2181e16ca15f2e6e505fa6852ba9.
Preserved the previous sealed revision before editing. Invocation id now requires
an actual string; focused #630 performs readonly replay-ledger preflight after
custody, before routes/navigation, without reservation/write. Unique spec-only
marker comments delimit exact guard declarations/functions; replay custody,
capacity and finalization validation are shared plain-data helpers called by
live paths. A later private root adapter may extract these frozen bytes with
controlled builtins/fs; no full-spec import or control execution is authorized.

Each authored Card pointer case now verifies an original plain surface hit and
trusted direct-row focus/down/up, live row focused/pressed flags and synchronous
original target/currentTarget evidence before popup opens. Same-open popup and
intentional selection/Escape semantics are retained. Twelve cases remain
UNEXECUTED; original64 bytes remain preserved. Root copied input snapshots are
readonly external preparation, without binding/custody/runtime authority.

### Present-ledger epoch anchor — phase1 revision3

Root authorized a private metadata correction after independent static review:
present ledgerBefore now carries epochBindingSha256 as an actual lowercase
64-hex string. Ledger shape checks retain that original epoch binding hash for
present-state invocations, avoiding a serialized current-binding/start-ledger
hash cycle. First absent-state creation still stores the current binding SHA;
expected.binding and exact custody ledgerBefore remain bound to the current
invocation SHA. No existing ledger is rewritten and no budget/history is reset.
Root authenticates the epoch anchor through retained issuance history; spec
checks do not independently authenticate root or enforce process single use.

Revision2 seal, manifests, handoff, command receipts and changed-source bytes
were archived with original-path/SHA256/bytes mapping before editing. All64
legacy bodies and all12 authored tests remain unchanged; guard markers remain
unique. Only scoped static checks are authorized. Guards, controls, browser
runner and runtime remain UNEXECUTED pending separate finite root authority.

### Styled forwarding repair preparation — revision4

Root expanded the same generation 17c3138e-ecbd-4883-bee5-b659c87f6149 at
base ed4262bb909e7cc025bcddb6734d3f176ec8ad75 to ten exact paths: the
previous five plus both styled Table sources, both owning Table suites and
.changeset/table-cell-accessor-forwarding.md. Revision3 endpoint/seal/receipts
were archived before editing with original-path/hash/bytes mapping.

Root reports the first focused native invocation: raw12 failed, zero passed;
ENOSPC left child exit UNKNOWN and normal teardown unverified. Independent root
closure observed owned identities absent and exclusive4479 binding succeeded,
with zero signals. Those receipts remain unchanged. No native identity/lifetime
qualification passed. Two actual Spectrum pageerrors identify styled forwarding
of arguments to a zero-argument accessor; the Viviana twin repair follows the
same source defect without claiming separate runtime causal proof.

Authored and froze owning regressions before changing either old source:
four default/custom-host zero-argument cases retain connected cell/input/button,
typed value/focus, one mount/local state and live before/after signal text with
all argument counts zero; two argument-taking cases retain once-only callbacks
and live getter reads. Six owning cases are authored, UNEXECUTED. Both styled
TableCell wrappers now mirror the private headless length discriminator and
insert zero-argument reads through renderer-owned reactive fragments. Static
children and argument-taking forwarding, markup/host/attrs/style order remain.

The causal plan records exact old source copies, frozen proposed test bytes,
focused old-source RED/repaired GREEN and complete owning-suite commands.
Root must grant each finite runtime command; old-source controls restore exact
bytes and keep meaningful assertions unchanged, then restore candidate bytes
in finally. No tests were executed by this source worker. The native fixture
and spec retain exact revision3 hashes and all64 legacy/all12 authored oracles.
Owning/browser/installed/release proof remain UNEXECUTED for this repair;
ticket remains in progress, pending independent root review and authority.

### Shared chevron slot repair preparation — revision5

Same generation 17c3138e-ecbd-4883-bee5-b659c87f6149 and base
ed4262bb909e7cc025bcddb6734d3f176ec8ad75; root expanded the exact ten-path
scope to twelve with shared Table.tsx and its owning Table.test.tsx. Revision4
seal/manifests/handoff/endpoint/causal-plan, proposed tests and checkout endpoint
were archived before edits; prior helpers, grants, receipts and failures remain.

Root accepted the actual OLD four intended zero-argument failures, zero passes,
with 33 unrelated filtered cases skipped and complete closure/restoration. The
complete repaired styled run was physically closed: 36 passed, one failed,
zero skipped; all six new accessor cases passed. The retained Spectrum chevron
Collapse assertion instead observed Expand. This is causal label RED, not
owning GREEN or native qualification. Raw results and root closure stay intact.

Localized shared production change: a stable chevron slot forwards all eight
existing expandButtonProps fields through live getters. The drag slot, Button,
hook, styled sources, approved TableCell contract and APIs/styles are unchanged.
Existing headless uncontrolled and Spectrum tree tests now retain the original
connected chevron through Expand → Collapse → Expand, preserving row/child
assertions and the actual failing Collapse oracle. The release note adds the
shared published package patch and retains both styled package patches.

Revision5 preparation and its repaired-only finite helper successor are
UNEXECUTED. Proposed qualification runs complete headless and both styled Table
suites once with maxWorkers=1 and a 300-second deadline after a fresh root grant.
No old withdrawal or redundant filtered GREEN is proposed. Fixture/spec bytes
and all64 legacy/all12 authored native tests remain unchanged (76 authored).
Ticket remains in progress; new owning GREEN, native, installed and release
qualification remain open. Only bounded static formatting/lint/docs/diff and
hash preparation run now; root alone accepts proof and issues runtime custody.

## Current owning, restored native and source compiler checkpoint — 2026-10-09

ROOT accepted complete owning suites: 38 + 172 + 29 + 8 = 247 passed, no failures or skips. Both styled TableCell wrappers preserve zero-argument accessor children; shared chevron fields remain live. The localized selectable-item repair guards the complete existing merged keydown/keyup chain, including long-press handlers, around nested interactive targets so typed Space remains input text. Original row activation and the owner-approved TableCell getter contract remain covered.

The restored complete browser file passed 76/0/0: preserved 64 plus 12 Spectrum/Viviana Table and default Card cases. Original connected child/input/menu identities, typed Space and local state, once-only callbacks/mounts, live hover/focus/press state, authored backward caret and intended menu dismissal assertions passed. All 76 error/rejection observers were empty. Explicit bounded disposal balances observed owners/effects; this does not establish unbounded or private-overlay lifetime. Generated CSS, source modules and one observed Solid entry are bounded source-fixture evidence; some intermediate comparisons are assertions rather than persisted snapshots.

Both fixture sensitivity controls failed within their accepted bounded scope and were exactly restored before 76. Corrected snapshot control reaches the identical live-text mismatch; remount control detects replacement/lifetime failure before later typing/caret/hover assertions. These are fixture sensitivity controls, separate from genuine old-product causal tests. Preserve the original unexpected early-remount control, ENOSPC/UNKNOWN first browser result, typedvalue failure, old nested-input 34/4, styled OLD4 and repaired 36/1 chevron-label failure as immutable history.

ROOT accepted physical closure and immutable replay history; the current replay allowance is exhausted. Canonical source typecheck exited 0 with no diagnostics. It covers package source/scripts, not the fixture/spec compiler contract or a full check run. This ticket remains in-progress for the coherent installed final candidate and release. Downstream VisualMode workaround removal has not occurred.

Actual receipts:

- `/tmp/ui-630-native-20261009-space-owning-repaired-20261009T1032Z-51467f3e2a38/root-repaired-247-green-acceptance.json`
- `/tmp/ui-630-native-20261009-whole76-restored-20261009T1150Z-root-green-acceptance.json`
- `/tmp/ui-630-native-20261009-corrected-snapshot-control1-20261009T1127Z-root-control-result-review.json`
- `/tmp/ui-630-native-20261009-remount-control2-20261009T1136Z-root-control-result-review.json`
- `/tmp/ui-630-final-source-typecheck-20261009T121508Z/result.json`

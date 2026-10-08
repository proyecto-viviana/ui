---
id: 636
type: task
title: "Deliver a child Button press to FileTrigger"
created: 2026-10-08
parent: 31
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D21 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queue FileTrigger composition with the top next-RC Visualmode defects; no new public responder API authorized.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit bounded FileTrigger composition after accepted Image repair f7a9bcad; native and release qualification remain open.",
    }
---

## Scope

UI owns Visualmode D21. A Button inside FileTrigger reportedly does not click
the hidden file input. Current headless FileTrigger handles press on a wrapper;
pinned RAC supplies PressResponder to its child. Determine the smallest repair
through existing private composition and Button context while preserving
documented child contracts. Name exact FileTrigger, existing composition and
regression paths before dispatch. No new public responder, dependency or
consumer edits; request an owner decision before any new public surface.

## Done when

A child Button opens the file input once for pointer, Enter and Space presses.
The child's own handler runs once. Disabled behavior, selecting the same file
again, input click propagation and supported custom/raw children remain correct.

## Proof

Reproduce a real headless/styled Button inside FileTrigger against inherited
source. Spy on actual hidden input click with exact counts and exercise the
existing file selection contract. Use native browser proof where required for
composition; synthetic input clicks do not prove an OS dialog appeared.
Qualify the candidate and report actual published fixing versions.

## Relationship

Child of #31, prioritized by #87 before next RC. Producer for Visualmode
#10163, whose CanvasEntryFileField and Assets dock click an input manually.
Related #631 press count and #557 native focus proof remain separate owners.
Source request: visualmode/visualmode/.agents/ui-requests-2026-10-07/D21-button-in-filetrigger-opens-no-dialog.md.
Patch Changeset belongs to the repaired headless layer; no consumer workaround
removal before installed release verification.

## FileTrigger child delivery admission — 2026-10-08

After the preceding #638 source worker's accepted handoff, exact-generation
stop (closed=true), and implementation commit f7a9bcad,
register the sole OS/herdr implementer in eligible repo:ui/main using
`/tmp/ui-636-dispatch-2026-10-08.md`. Codex astra low handles this press/context
ownership slice under the recorded Decision 040 fallback. The conductor alone
reviews, stops the exact generation, accepts and commits. No worker commit/push.

Initial source admission is only
`packages/solidaria-components/src/FileTrigger.tsx`. Owning tests are
`packages/solidaria-components/test/FileTrigger.test.tsx`,
`packages/solidaria-components/test/Button.test.tsx`, and
`packages/solid-spectrum/test/FileTrigger.test.tsx`. Admit
`.changeset/filetrigger-child-button-press.md` for an actual components repair,
this ticket and standard generated views. Button.tsx and a private
fileTriggerContext.ts are not admitted initially: return a reproduced failure
and exact proposal before any same-generation extension. Shared utilities,
press hooks, public exports/API, dependencies, consumers and native fixtures
remain read-only.

Prove actual Button pointer/Enter/Space picker delivery exactly once, live
base/slot/picker/own callback order and replacement/removal without remount,
disabled picker-owner precedence, both pending modes, continuation, raw siblings,
custom roots and live selection/reset behavior. Save exact-base controls against
final assertions, restore safely and verify hashes. The disabled picker guard
runs before reset/click. Never fall through to raw wrapper activation for a
pending registered Button or count two different PressEvents as one by identity
alone. #557's accepted native receiver repair removes its old prerequisite;
unit input-click counts still do not prove a native file chooser. Full native,
candidate, installed-consumer and release qualification remains open.

## Initial inherited-source proof — 2026-10-08

Bound target `ui-636-source-20261008`, generation
`f648bf74-77b6-41c2-9d74-a71f288dfb1b`, start delivery
`a054bad8-3853-4a79-bd50-3bb430a2de44`; actual base
`f7a9bcad3735632ed031413421745bd24091a9ce`. Launch dirt was this conductor
admission and generated views only. Eligibility check passes with cached Node.
GitHub run status is unavailable in this worker: gh authentication is absent.

Actual headless Button pointer/Enter/Space controls each invoke the child once
but input.click zero times. Both pending modes incorrectly click the input once
with no child callback. Same-node A-to-B callback replacement still calls the
base/slot/own A snapshots. Raw native-button positive control passes. Headless
owning file: 6 failed, 6 passed; styled Button with class wrapper: 3 failed,
3 passed, each missing delivery with child callback once. These are inherited
source failures, not a candidate result. Raw logs:
`/tmp/ui-636-inherited-headless.log`, `/tmp/ui-636-inherited-styled.log`.

No production source has changed. Exact conditional Button/private-context
proposal is `/tmp/ui-636-extension-request.md`; await conductor's recorded
same-generation extension before either path is edited. Initial regression
work touches only the two admitted FileTrigger test files. Full final controls,
repair, Changeset and qualification remain outstanding. Unit dispatch evidence
does not establish native filechooser behavior or a fixing release.

## Diagnostic checkpoint acceptance and replacement — 2026-10-08

Conductor read the inherited failing logs and independent delivery/live/pending/raw
controls, rehashed the final diagnostic manifest and verified unchanged product
bytes at f7a9bcad. Exact owned stop of ui-636-source-20261008 generation
f648bf74-77b6-41c2-9d74-a71f288dfb1b returned closed=true after its completed
diagnostic handoff. The extension follow-up was unconfirmed and subsequent
probe was not promptable; preserve history and launch one replacement, without
automating interactive approvals or retrying the former session.

Register sole replacement ui-636-repair-20261008 with
`/tmp/ui-636-repair-dispatch-2026-10-08.md`. The actual reproduced failures now
admit FileTrigger.tsx, Button.tsx and a new PRIVATE fileTriggerContext.ts, the
three existing owning test files, components-only patch note, ticket and
standard views. No shared utility/press/global/public API/dependency/native
fixture expansion. Preserve diagnostic test and coordination dirt; product
sources remain baseline. The conductor alone accepts, stops and commits.
Archived exact diagnostic bytes and controls:
`/tmp/ui-636-diagnostic-checkpoint-2026-10-08/archive-map.json`;
readback `/tmp/ui-636-diagnostic-acceptance-2026-10-08.md`. This checkpoint is
failed-source reproduction only; repair/native/release proof remains open.

## Bound replacement admission — 2026-10-08

Replacement `ui-636-repair-20261008` is bound through OS/herdr to generation
`0663d11f-5444-43c5-8d91-91075b28cfb7`, delivery
`76b297e9-40dd-48ca-8fb8-271bdd71488a` (submitted), pane `w3:p1`.
Base is `f7a9bcad3735632ed031413421745bd24091a9ce`; the five diagnostic
test/ticket/view dirty paths are preserved. FileTrigger.tsx, Button.tsx and
Button.test.tsx were byte-checked against HEAD; context and Changeset absent.
The replacement dispatch supersedes earlier extension gates and admits the
private FileTrigger/Button bridge and exact paths listed above, on accepted
independent delivery/live/pending/raw diagnostic controls. No public API or
shared utility changes. Cached Node eligibility check passes; gh run status
is unavailable because gh authentication is absent. Conductor alone reviews,
stops and commits; native chooser and release qualification remain open.

## Replacement repair proof — 2026-10-08

Candidate source connects actual Button presses through a private, direct-import
context. Activation reads current base, selected slot, picker and own callbacks
once, then retains existing overlay continuation. The picker checks live owner
disability before reset/click. Resolved Button roots register even while pending
or disabled; replacement/disposal releases them. Wrapper native handlers skip
registered roots without blocking propagation or unrelated raw siblings. Live
outer pending resolution is confined to participating Buttons.

Final assertions against exact base source: headless 32 failed / 79 passed;
styled 3 failed / 3 passed. Independent controls: delivery 3 failed, live
callbacks 2 failed, pending fallback 10 failed, raw positives 2 passed, overlay
continuation 2 failed. Individual FileTrigger-only baseline control: 5 failed /
1 passed; Button-only baseline: 6 failed / 1 passed. All controls preserve final
test hashes and restore candidate source in finally with byte/hash checks.

Restored candidate: headless FileTrigger + Button 111 passed, styled FileTrigger
6 passed. Scoped lint passes. Typecheck reports 24 diagnostics outside admitted
paths, matching exact baseline diagnostic lines. Attribution guard reports
contracts outside admitted paths; no attribution baseline is changed. The new private helper adds one
unmarked attribution mapping for conductor review. Docs and scoped format checks
pass; docs scripts use direct tsx loading because CLI IPC is sandbox-blocked.
Ecosystem audit remains red (13 of 38 gates, including sandbox spawn errors);
its raw log is retained without edits outside this ticket scope.

Raw commands, exit codes, logs, restoration hashes and final path manifest are
under `/tmp/ui-636-repair-*`; entry receipt is
`/tmp/ui-636-repair-handoff.md`. Diagnostic tests and accepted receipts remain
preserved; styled tests are unchanged from the accepted diagnostic bytes.
No commit, push, publication, consumer or native fixture changes.

This proves synchronous hidden-input click delivery/counts for Button, including
custom rendered roots, plus the existing raw-child fallback. It does not promise
a general custom usePress responder. Native filechooser/OS behavior, candidate
build, SSR/hydration, certification, installed-consumer and release gates remain
conductor-owned and unqualified. No fixing version is claimed; keep consumer
workarounds until installed release verification. Ticket remains in progress.

## Source acceptance and native admission — 2026-10-08

Conductor accepted the completed repair and final independent review, verified
all116 manifest hashes and owned-stopped repair generation
0663d11f-5444-43c5-8d91-91075b28cfb7 with closed=true. Normal-hook source
commit 5c92a7965aa249470c649be948a6955c216e32f5 preserves all ten accepted path hashes;
tree was clean. Headless111/styled6 unit passes and exact-base failing controls
are source/local proof only. Typecheck24 baseline diagnostics, attribution15
contract failures plus one unmarked private-helper mapping, and ecosystem13/38
failures remain explicit debts; no native or release claim follows.
Accepted archive: /tmp/ui-636-source-checkpoint-2026-10-08/archive-map.json.

Register sole next worker ui-636-native-20261008 through OS/herdr in eligible
repo:ui/main using /tmp/ui-636-native-dispatch-2026-10-08.md; canonical
eligibility check passed. Admit only existing focus-browser main.tsx/config,
filetrigger-dropzone-focus.browser.ts, this ticket and standard generated views.
Fixture config admits existing vivianaMacros before Solid, exactly three
boundary-anchored stately/aria/components source aliases and private /tmp cache;
shared Playwright config and all product/API/dependency paths remain read-only.
Explicitly admit serial exact-pre636 bridge-owner restoration from f7a9bcad
against SAME final native assertions, including context-file absence, with
saved candidate bytes/finally restoration/hash verification. This permits no
source repair. Preserve all original isolation cases; native chooser mode must
leave real file-input click operational. Prove trusted pointer/Enter/Space,
exact owned-input/FileList identity and payload, same-file reset, live callbacks,
disabled/pending guards, continuation and same-node re-enable, with zero
page/console/rejection errors. Conductor accepts/stops/commits. A Chromium
filechooser event proves requested selection, not OS-visible dialog appearance.
Native, candidate, installed-consumer and release gates remain open.

## Native chooser handoff — 2026-10-08

Worker `ui-636-native-20261008`, generation
`35832d32-ec0e-465b-b920-49ebccd7257e`, delivery
`70d07d72-11a4-420b-8199-22dcd5689810`, ran the admitted existing serial
Chromium runner at source commit `5c92a7965aa249470c649be948a6955c216e32f5`.
Final result: 31 passed / 1 failed (12 original cases pass; 19 of 20 added
cases pass). Every case records empty pageerror, console-error and rejection
arrays. Fixture/spec scoped lint, format and whitespace pass. Ecosystem audit
remains red: 13 of 38 gates fail. GitHub status is unavailable without gh auth.

Headless/styled/raw pointer, Enter and Space each request one actual Chromium
filechooser per gesture, identify the owned input, deliver its exact FileList
and deterministic payload, and repeat the same selection. Button own press is
once; raw DOM click baseline is pointer once / keyboard zero. Live callback
updates, owner/child disability, supported focusable pending, continuation,
stable nodes, selection preservation and re-enable are covered. Runtime source
URLs, one Solid runtime mapping and generated matching styled CSS are recorded.
Spectrum supports only focusable pending: no unsupported isPendingFocusable
prop is passed to styled Button; both pending modes are headless-only proof.

Unresolved native contract defect: after headless pending becomes true with
isPendingFocusable=false, the retained Button has disabled=false, tabindex=0
and aria-disabled=true. Real Tab from the preceding control lands on it rather
than skipping it. Both failing assertions remain; picker/own callback blocking,
selected-file preservation and same-node re-enable still pass. No product
repair is admitted or made. Conductor must decide the next source slice;
this handoff does not establish when the focus defect was introduced.

Exact pre-636 bridge-owner combination at f7a9bcad against identical final
fixtures gives six bounded five-second zero-chooser Button failures with own
callback once, and three raw positive cases. Finally restoration rechecks all
three accepted owner hashes and unchanged fixture/spec hashes. No chooser
spy or import/readiness error accounts for these negative controls.

Evidence entry: `/tmp/ui-636-native-handoff.md`; final raw browser log
`/tmp/ui-636-native-final.log`, restoration
`/tmp/ui-636-native-restoration.json`, and SHA inventory
`/tmp/ui-636-native-manifest.json`. Chromium chooser/FileList delivery does not
prove an OS-visible dialog, cancellation, permissions or real filesystem access.
No product patch, Changeset, commit, push, publication or fixing version.
Conductor owns acceptance, exact-generation stop and later qualification.

## Same-generation pending contract extension — 2026-10-08

Conductor accepts the native 31-pass/1-fail result as a reproduced product
defect, not completed proof. Continue sole writer generation
35832d32-ec0e-465b-b920-49ebccd7257e. In addition to native admission, admit only
packages/solidaria-components/src/Button.tsx,
packages/solidaria-components/test/Button.test.tsx,
packages/solidaria-components/test/FileTrigger.test.tsx and existing
.changeset/filetrigger-child-button-press.md if wording needs correction.
Preserve native disabled-property and trusted Tab-skip assertions. Correct only
pending isPendingFocusable=false native disability, honoring live transitions
and child disability; retain default/focusable pending behavior. No shared
hook/context/export/style, public API, name or dependency change. Spectrum
remains focusable pending only. Conductor alone accepts, stops and commits.

Add owning standalone/composed regressions and exact 5c92a796 Button-only
pre-extension controls against final tests/spec, with saved bytes, finally
restoration and hashes. Earlier f7a9bcad bridge controls remain separate and
need rerun only if final fixture/spec hashes change. Run owning headless/styled
suites, scoped checks and fresh full native suite before revised handoff.

## Revised native handoff after pending extension — 2026-10-08

The admitted Button root expression now sets native disabled when pending and
isPendingFocusable=false, otherwise preserves base native disability. Shared
createButton/focus policy and default pending behavior are unchanged. Explicit
child disability keeps precedence. Three standalone and one FileTrigger owning
regressions verify live focusability/pending transitions, same nodes, blocked
callbacks and preserved picker state. Existing Changeset wording records this
correction. Spectrum is tested only for its supported focusable pending mode;
both pending modes are covered headlessly. No API or shared-owner expansion.

Final qualification: 115 headless and 6 styled owning tests pass. Fresh full
Chromium suite passes all 32 cases (all 12 original plus 20 added), including
unchanged native disabled-property and trusted Tab-skip assertions. All 32 have
empty error/rejection evidence. Runtime source resolution, one Solid entry,
generated Spectrum CSS, exact owned FileList identity/payload, repeat selection,
callback updates, blocked routes and same-node re-enable are recorded in
`/tmp/ui-636-native-extension-final.log` and extracted observations/runtime/graph
JSON. Observation windows remain bounded: two browser frames plus 150ms.

Exact pre-extension 5c92a796 Button against these final tests/spec fails all four
new unit regressions and the native pending nonfocusable case. Candidate bytes
were restored in finally and all source/test hashes verified before the final
native run; see `/tmp/ui-636-native-extension-restoration.json`. Separate
f7a9bcad bridge controls retain six bounded zero-chooser failures and three raw
positives: fixture/spec hashes are unchanged, so no redundant rerun. Earlier
failed logs and restoration receipts remain preserved.

Scoped lint, format and whitespace pass. Typecheck retains exactly the same 24
diagnostics; attribution output is byte-identical to accepted repair debt
(15 failures and existing unmarked private helper). Earlier ecosystem audit
retains 13/38 failures; no broad certification claim. Final receipt/manifest and
under-400-word handoff are `/tmp/ui-636-native-receipt.json`,
`/tmp/ui-636-native-manifest.json`, `/tmp/ui-636-native-handoff.md`.
Chromium requested selection and delivered FileList; no OS-visible dialog or
OS cancellation proof. No commit/push/version/publication. Conductor alone
accepts, stops this exact generation and integrates.

## Conductor native acceptance — 2026-10-08

Accepted the revised handoff and independent final review at
`/tmp/ui-636-native-extension-final-independent-review-2026-10-08.md`.
Conductor independently rehashed all 341 manifest entries with zero mismatches;
manifest SHA256 is
`1ec685f5d75d30591fdeb587a48a6f38dd06c43a6b47cd1d19c29db71abf6792`.
Archived the exact reviewed source and receipts in
`/tmp/ui-636-native-checkpoint-2026-10-08/archive-map.json` before integration.
Owned stop for generation `35832d32-ec0e-465b-b920-49ebccd7257e` returned
`ok=true, closed=true`; the conductor takes the scoped commit handoff.

Accepted source/local/native proof is 115 headless, 6 styled and 32 native
passes with preserved exact-source negative controls and restoration. Browser
error/rejection arrays are empty; existing dev warnings remain. The original
31/1 result remains a diagnostic checkpoint, superseded by the repaired run.
The ticket stays in progress pending candidate gates, installed-consumer
verification and actual fixing-version reporting. No release is claimed.

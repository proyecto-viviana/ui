---
id: 632
type: task
title: "Preserve Tab and MenuItem caller attributes"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner requested reproduction, tested repair, and release reporting for Visualmode's October requests.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queued with the top Visualmode consumer work before the next RC, following active source work and qualification blockers.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admitted after the accepted #534 Menu prerequisite at 0e337782. Grok implements the bounded caller-attribute and raw popup-semantics repair; conductor reviews and commits after exact-generation stop. Broader qualification and release remain open.",
    }
---

## Scope

UI owns Visualmode D18: Tab drops caller data attributes and MenuItem drops
caller aria-haspopup/aria-expanded on 0.8.0-rc.0. Confirm pinned RAC DOM filtering
and MenuItem/useMenuItem context composition before fixing the lowest owner.
Preliminary source inspection shows upstream DOES forward caller popup ARIA
with caller precedence; declining that forwarding as beyond upstream is not
supported by this pin. Use SubmenuTrigger for managed cascades. Name exact
source/test paths before dispatch. No new cascade API or consumer edits.

## Done when

Caller data/global attributes reach role=tab and update/remove reactively
without remounting; managed identity, ARIA, and state keep upstream precedence.
MenuItem forwards popup ARIA according to upstream, including reactive values
and caller/context precedence consistently in behavior, render props, and DOM.
Ordinary items and SubmenuTrigger keyboard/focus behavior retain their contract.
Each repair has a failing pre-fix regression. Any actual beyond-upstream
extension is declined with evidence as the owner authorized.

## Proof

Run focused Tabs and Menu suites, related hooks, and styled consumption tests.
Cover static/reactive forwarding, ordinary-item absence, managed-state negative
controls, and SubmenuTrigger interactions. Preserve certified Tabs and menu
modality/focus checks. Record actual proof and published fixing versions after
candidate qualification.

## Relationship

Child of #24, prioritized by #87 alongside #631. Producer for Visualmode
#10202; timeline markers currently live on Text and cascades are hand-built.
Source request in the hub:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D18-tab-and-menuitem-drop-attributes.md.
Coordinate with #617 reactive filtering and #534 Menu repairs. Patch Changesets
cover changed owning packages; rollback stays within attribute forwarding.

## 2026-10-08 bounded implementation admission

Register `ui-632-attributes-20261008` as the sole Grok source implementer in
eligible repo:ui main, using `/tmp/ui-632-worker-2026-10-08.md` and its
`/tmp/ui-632-contract-review-2026-10-08.md` pinned-source decision. The preceding
#534 generation is stopped with closed=true and its repair is committed at
0e337782. The conductor alone accepts and commits; no worker commit, push,
publication, dependency or new public name is admitted.

Named source and test paths:

- `packages/solidaria-components/src/Tabs.tsx`: Tab caller-global filtering
  and reactive forwarding before authoritative managed props only.
- `packages/solidaria-components/src/Menu.tsx`: MenuItem's reactive resolved
  caller/context popup attributes and consistent raw semantic readers only.
- `packages/solidaria/src/menu/createMenuItem.ts`: bounded strict raw expanded
  semantics, only with the required reproduced negative control.
- `packages/solidaria-components/test/Tabs.test.tsx`
- `packages/solidaria-components/test/Menu.test.tsx`
- `packages/solidaria/test/createMenu.test.tsx`
- `packages/solidaria/test/createTabs.test.tsx`, only if a bounded owning
  regression requires an edit; otherwise read/run unchanged.

Also admitted: this ticket, `.changeset/tab-menuitem-caller-attributes.md`
covering actual changed source owners, `/tmp/ui-632-*` evidence, and generated
`.claude/current/status.md` / `.claude/current/roadmap.md` through standard
tooling. Styled Tabs, Menu and ActionMenu consumption tests are read/run only.
Shared mergeProps, DOM helpers, styles, consumers and cascade APIs are outside
this admission. Managed cascades continue to use SubmenuTrigger.

Pinned precedence is context first, defined caller last: false wins and
undefined restores context. Resolve raw values before DOM boolean
serialization. Expanded is open strictly when the raw value is the string
"true"; popup presence follows pinned truthiness. Hook behavior, render state,
markers and emitted ARIA must agree with that distinction. Preserve managed
identity, role, tabindex, selection, event composition, LTR/RTL keyboard,
hover, sibling/root close, focus return and disposal.

Save applicable failing old-source controls and final owning/consumption
tests, scoped format/lint, actual root typecheck and generated-doc checks.
Record exact generation, base HEAD, commands, cwd, exits, counts and all receipt
path SHA256 values in `/tmp/ui-632-worker-result-2026-10-08.md`. Attribute
forwarding is not native browser #557, full certification or release proof.

## Partial worker handoff — 2026-10-08

Generation `337122cc-1548-4c0d-bdd9-940bb9f82abc` recorded old-source proof in
`/tmp/ui-632-pre-fix.log` (6 failed, 3 passed, 279 skipped), then left partial
source/tests when Grok reached its weekly limit. Its owned stop returned
closed=true. No final checks, Changeset, complete receipt or implementation
acceptance exists. Preserve those paths and saved control. The conductor may
register a supported replacement under the same exact admission after checking
eligibility/inventory. The ticket remains in-progress; a coordination commit
does not accept or ship the unfinished repair.

Replacement admission: register `ui-632-resume-agy-20261008` as the sole AGY
implementer using `/tmp/ui-632-resume-worker-2026-10-08.md` on coordination
base 928feaee. The exact source/test/note scope above remains unchanged. Read
the independent partial review before continuing: correct false-popup DOM
expectations, restore Tab caller-event composition and repeat corrected
negative controls. Conductor alone accepts and commits after owned stop.

AGY generation `ae539858-223d-437e-b433-d13d53555712` stopped with closed=true
while waiting for a manual terminal approval. No source changed; all six
transfer digests matched. Do not answer its terminal prompt through automation.
Register `ui-632-resume-codex-20261008` through OS/herdr with the same brief and
exact paths. This bounded event-composition/ARIA slice uses Codex astra under
Decision 040's hard-slice allowance after both default workers were unavailable
(Grok quota, AGY operator input). Retain normal worker approval controls and
independent review. No broader source or publication authority follows.

## Replacement implementation evidence — 2026-10-08

Codex generation `d9785781-c6b5-48a3-ab54-17042616751e`, delivery
`f340943e-f1cb-43b6-993b-7b03504db2b1`, resumed at
`928feaeef33743fb617c7f9fc834aca06dd5a6d6` after both prior owned stops.
All six transfer digests matched. The bounded patch preserves caller globals,
composes live Tab handlers with bare Solid bound-tuple invocation, and resolves
raw MenuItem popup values before hook/render/DOM serialization. Changeset covers
solidaria-components and solidaria. Shared helpers and focus owners are unchanged.

Corrected old-source controls report 7 failures, 11 passes, 271 skipped; the
managed false-popup failure is now the incorrect submenu marker, not false ARIA
serialization. Separate transfer-event and tuple-receiver controls each fail
one test. Raw commands, exits, exact control digests and final check receipts
are in `/tmp/ui-632-worker-result-2026-10-08.md` and its linked evidence.
The original `/tmp/ui-632-pre-fix.log` is retained but its invalid managed
false-popup assertion is not accepted proof.

Inherited qualification debt remains: a direct-menu Escape focus-return probe
fails on base source with focus on body, matching the final-source probe.
`/tmp/ui-632-baseline-native-focus-exact.log` and its exact source/test digests
retain this failure. Default Popover and styled-options Popover probes also
failed; those are recorded limitations, not passing native-focus evidence.
The runnable caller regression retains override, undefined restoration,
managed controls removal, menu close and same-trigger identity. No skip or
focus/Popover source repair was added. Root typecheck reports out-of-scope
diagnostics. Native #557, full certification, serialized SSR/hydration/build,
candidate qualification, acceptance and release remain open. Ticket stays
in-progress; conductor alone accepts and commits after owned stop.

Final owning/hook suites pass 350 tests. The combined styled command fails
18/91 on final source and 16/91 on base with a different accumulation pattern;
it remains a failed consumption check, not an inherited-pass claim. Matching
standalone controls pass Spectrum Tabs 21/21 on both sources; Spectrum Menu
fails the same three selection-indicator tests (30 pass) on both, and
ActionMenu fails the same section-indicator test (33 pass) on both.
Root typecheck fails with 24 diagnostics outside admitted files. Scoped lint,
format and docs checks pass. The standard docs generator's tsx CLI failed at
Unix-pipe setup; the identical generator and docs checker pass via
`node --import tsx`. Generated-view guard and hub audit hit sandbox child-git
EPERM; CI status is unavailable without gh authentication. No check failure
is waived. Raw receipts and digests retain the exact source/control distinction.

## Conductor acceptance of bounded repair — 2026-10-08

Read the complete handoff, independent source review, commands and raw results.
All 117 manifest path digests matched; all three old-source control digests
matched their exact base objects at 928feaee. Owned stop of generation
`d9785781-c6b5-48a3-ab54-17042616751e` returned ok=true and closed=true.
The conductor accepts the bounded caller repair and 350 passing owning/hook
tests for a scoped implementation commit. No source changed after those tests.

The failed combined styled consumption check is still unresolved, not waived
or accepted as a pass. Its isolated indicator failures and lifecycle
contamination now have a prepared test-owner follow-up under #542/#107;
`/tmp/ui-styled-owning-qualification-2026-10-08.md` names the proposed scope.
#159 was reopened in 96515385 for shared receiver-safe dispatch consolidation.
The existing Escape focus failure remains #557 qualification debt. Root
typecheck, full candidate checks and publication still gate release. This
partial implementation acceptance does not close the ticket or certify a port.

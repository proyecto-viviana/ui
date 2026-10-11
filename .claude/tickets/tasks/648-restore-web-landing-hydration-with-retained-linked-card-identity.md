---
id: 648
type: task
title: "Restore web landing hydration with retained linked Card identity"
created: 2026-10-09
parent: 531
status: verified
history:
  - {
      state: open,
      at: 2026-10-09,
      note: "3298 Site Gate records a landing hydration mismatch separately from Typekit CSP failures; historical #549 acceptance does not clear this revision",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "independently reviewed a three-file linked-Card SSR/hydration diagnostic; exact owning test admission prepared, product cause and actual route qualification remain unproved",
    }
  - {
      state: verified,
      at: 2026-10-11,
      note: "Root accepted original full qualification, fresh zero-debt certification, exact-E hosted gates and actual RC1 registry consumer evidence; bounded closure is recorded in the final continuation.",
    }
---

## Cause

The latest recorded Site Gate on 3298 reports a hydration mismatch on
`/examples/landing`. The page renders three linked Card/CardPreview/Image
closures from `LAND_CARDS`. Source inspection has not established a product
cause. #90's Typekit header repair is separately owned and does not establish
landing hydration success.

## Scope

The conductor alone admits these bounded diagnostic and server-purity paths:

- `packages/viviana-ui/test/fixtures/landing-hydration.tsx`.
- `packages/viviana-ui/test/Landing.hydration.ssr.test.tsx`.
- `packages/viviana-ui/test/Landing.hydration.hydrate.test.tsx`.
- `packages/solid-spectrum/src/card/index.tsx`.
- `packages/viviana-ui/src/card/index.tsx`.
- `.changeset/linked-card-server-render-purity.md`.
- This ticket and generated `.claude/current/status.md` / `roadmap.md`.

The two production paths admit only the linked native Card callback
`!isServer` guard around applyInteraction, with the corresponding patch
Changeset for solid-spectrum and @proyecto-viviana/ui. Client callback timing,
plain surface registration and the grid/selection path remain unchanged.
No other production/config/dependency/public API, route-error guard, helper,
CSS, oracle or timeout change is admitted. Preserve #549's accepted history and #543's distinct comparison
island scope.

## Work

1. Integrate the reviewed diagnostic against fresh current source/helper/config
   hashes. It uses the actual landing Card JSX and imported `LAND_CARDS`, with a
   following labeled TextField solely to observe generated-ID allocation.
2. Under one bounded runtime slot, run its server twin first and archive the
   newly generated exact HTML. Then hydrate that same output with the existing
   helper/config. Retain all Card descendant elements, IDs, the input and its
   label through completion and deferred verification. Classify any failure
   before proposing a repair; no expected RED is treated as measured evidence.
3. Reproduce the original production route on a fresh actual web build with its
   router, shell, providers and font/network cadence. A green minimization does
   not clear that route; restore preceding structure incrementally if needed.
   Keep original route error collectors and all linked Card behavior.
4. After causal localization, admit the smallest supported source repair and
   preserve identical OLD/candidate/withdrawn/restored assertions. Add the
   corresponding published-package Changeset only if product behavior changes.
5. Qualify affected original Card/Image/slot suites, fresh full SSR then
   hydration, actual landing browser behavior and complete unchanged Site Gate.
   Record exact source/build identities, outputs and limitations; regenerate
   documentation views and pass applicable checks.

## Done when

The original production landing route hydrates without mismatch or error-guard
failures on a fresh candidate build. Owning linked Card identity and generated-ID
tests pass with fresh matched SSR output, affected original suites remain green,
and the full Site Gate passes on the same final candidate revision.

## Limits and evidence

The fixture omits preceding route structure and uses narrow component entries;
the actual route imports the umbrella package and has an earlier aria-label-only
email field. The following TextField and all-descendant adoption are diagnostics,
not an assertion that production has that trailing field or that later live
image-load replacement is forbidden. Neither a source-level green nor CSP
owning-test green substitutes for the production route and Site Gate.

Reviewed packet: `/tmp/ui-landing-hydration-paired-proposal-2026-10-09/`.
Independent review:
`/tmp/ui-landing-hydration-pair-independent-review-20261009.md`.
All unaffected production/data/helper/config read hashes still match; the packet's
StyledChildren reference changed only through separately admitted #542 work.
At initial diagnostic admission, no runtime or product repair had executed.

Current checkpoint: all three diagnostic test files are now applied with exact
proposal hash matches. Every unaffected production/data/helper/config input was
reverified immediately before integration. At that checkpoint the paired command and original
production-route reproduction remained unexecuted.

## Applied linked-Card server-purity scope — 2026-10-09

The preserved serial SSR raw records SERVER_WRITE under
LandingLinkedCardsFixture > Card > HeadlessLink > ElementTag. The linked
render-child callback synchronously calls applyInteraction, whose five setters
copy interaction state into the Card context. Both linked contexts seed false;
pinned Adobe linked-Card server state is likewise unselected/non-interacting.
The grid/selected path is distinct and is not guarded by this repair.

The conductor applied the reviewed isServer import and guard ONLY to the
linked callback in both admitted card/index.tsx paths. Server rendering now
retains those legitimate initial linked-context values without setter writes;
client callback timing and registration/cleanup remain unchanged. This is
server-purity repair, not warning suppression or a demonstrated explanation
for the production hydration mismatch. The two published packages receive a
patch Changeset; no new public symbol, export or dependency is introduced.

Reviewed packet: /tmp/ui-linked-card-server-purity-proposal-20261009/;
source patch SHA256: 248ac8d1650b849e8284b533861972e68a2f81a55bcb0e85a59674c6da0a4844.
Historical SSR raw: /tmp/ui-serial-production-qualification-proof-20261009/04-calendar-styledchildren-landing-ssr.raw.log.

Fresh full-package build, complete owning Card/Image/slot suites, matched
SSR/hydration and the actual production landing route/Site Gate remain required
for this applied candidate. No warning-free SSR return, retained-node hydration
success, route clearance or task closure is claimed by source review.

## Applied linked-Card client-owner extension — 2026-10-10

The current owner continuation extends the earlier server-purity-only boundary to stable client ownership in both styled Card twins. Each linked Card retains an independently owned root for its render-child registration and disposes that root with the Card. This prevents an intermediate reused server/hydration owner from governing the retained linked child. The existing `!isServer` interaction guard remains; no public name, dependency or styling contract changes.

This is an explicit extension to the original scope, whose production allowance covered only the server guard. The admitted paths remain the two `src/card/index.tsx` twins, the three Viviana Landing fixture/SSR/hydration files, the linked-Card patch note and this ticket. Focused owning and paired evidence does not close the production landing route, Site Gate, installed-consumer or release obligations. Latest complete qualification is still pending; preserve all earlier failed and interrupted returns.

## Actual published-E qualification continuation — 2026-10-11

Final Q26 supplies fresh matched Landing/Card SSR and retained-node/generated-ID hydration assertions with whole owning suites. Accepted whole Site and browser checks clear the earlier local route qualification failures; preserve those failures and the explicit linked-Card client-owner scope extension. Aggregate raw totals are not per-file outcome counts. Actual exact-E Site success and genuine published-consumer linkage are retained below.

Accepted source qualification remains C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1`; E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` records its original eight-shard result (2297 passed, zero failed/skipped/waived/flaky), followed by accepted exact-E strict parity. The same E now has all three required hosted workflows green and automatic Release run `38146924038` successful, independently accepted in `output/qualification-evidence/ui-exact-e-hosted-release-proof-20261011/ROOT-ACTUAL-PUBLICATION-AND-THREE-GATES-REVIEW-20261011.json`. Actual registry capture, crypto consumer and separate installed-native proof are accepted under `output/qualification-evidence/ui-registry-and-native-final-stage-rc1-e-a2ccaf10-proof-20261011/ROOT-CLOSED-STAGE-01-REVIEW.json`, `ROOT-CLOSED-STAGE-02-REVIEW.json` and `ROOT-CLOSED-STAGE-04-REVIEW.json`; the consumer verified 96 signatures and 55 attestations, and registry native passed all 12 original cases. Independently accepted LOCAL12 remains bound to C′ at `output/qualification-evidence/ui-registry-and-native-final-stage-local-rangeslider-viewport-20261011/ROOT-CLOSED-STAGE-02-REVIEW.json`. Physical refs/hashes are cataloged in `.agents/UI-EXECUTION-547-rc1-published-2026-10-11.json`; these later proofs do not recreate missing historical controls or claim complete API parity.

Root accepts this bounded ticket closure against its original Done when. Earlier historical limits and separate exclusions remain.

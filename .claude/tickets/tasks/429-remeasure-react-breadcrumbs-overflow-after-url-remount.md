---
id: 429
type: task
title: "Remeasure React breadcrumbs overflow after URL remount"
created: 2026-09-03
parent: 26
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 breadcrumbs functional pass: ?itemSet=overflow remounts React at stale tail=0 (Home + More items, menu Files/Projects/Reports/Annual report 120×144) against Solid tail=2 (Home + More + Reports + Annual report, menu Files/Projects 88×80). Live comparison:controls-change overflow and overflow-narrow-100 already match. Certified D6 knownDivergence: S2 ResizeObserver on a fixed-width container never re-fires after the initial narrow measure",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Current reference fixture and owning tests admitted; whole-release qualification remains in progress.",
    }
---

The comparison route `?itemSet=overflow` remounts both Breadcrumbs
fixtures with the five-item set (Home / Files / Projects / Reports /
Annual report). Solid settles to the S2 collapse algorithm's
`tail = 2`. React stays at a stale `tail = 0` from the first
narrow layout pass.

Certified D6 already records this as an oracle-side measurement
artifact, not a port miss: hidden-item widths, gap, folder button,
and container width are byte-identical, and the same S2 algorithm
computes `tail = 2` on either stack's settled DOM. The React
fixture's `ResizeObserver` is bound to a fixed-width panel that
never resizes after URL remount, so it never corrects the first
measure. Live `comparison:controls-change` `{itemSet: "overflow"}`
re-measures both stacks to `tail = 2`. Shrinking the canvas to
100px also matches (Home + More + Annual report).

Byte-parity on the URL remount must not regress Solid to React's
stale tail. Force a post-layout remeasure (or a one-frame resize)
on the React fixture so the oracle catches up.

## Evidence

`http://127.0.0.1:4341/components/breadcrumbs/?itemSet=overflow`,
islands mounted. Same split on `?itemSet=overflow&isDisabled=true`
and `?size=L&itemSet=overflow`.

|                            | React                                             | Solid                              |
| -------------------------- | ------------------------------------------------- | ---------------------------------- |
| URL overflow items         | Home, More                                        | Home, More, Reports, Annual report |
| URL overflow menu          | Files, Projects, Reports, Annual report (120×144) | Files, Projects (88×80)            |
| live `{itemSet: overflow}` | Home, More, Reports, Annual report                | same                               |
| overflow-narrow-100        | Home, More, Annual report                         | same                               |

AX (URL remount):

```
React: list "Project location" → Home + button "More items"
Solid: list "Project location" → Home + button "More items" + Reports + Annual report
```

Menu select of Files / Projects still truncates both stacks once
the item is in the menu. Overlay enter/settle geometry (opacity,
dx, dy, gap) matches for the items each stack actually collapsed.

## Repro

1. Open `http://127.0.0.1:4341/components/breadcrumbs/?itemSet=overflow`.
2. Wait for `data-islands-mounted="true"`.
3. Diff the visible `listitem`s and the open "More items" menu
   against the Solid panel.
4. Dispatch `comparison:controls-change` `{itemSet: "overflow"}`
   from the default route and confirm both tails become 2.

## Done when

A URL remount of overflow on the comparison route paints the same
visible tail as Solid (Home + More items + Reports + Annual report)
and the same two-item menu. A walk of `?itemSet=overflow` fails if
React still shows only Home + More. Do not "fix" this by collapsing
Solid to `tail = 0`.

## Relationship

Child of #26. Found by #260. Fixture-only; Solid already re-measures.
Closes the D6 `overflow` knownDivergence in
`breadcrumbs.certified.spec.ts` once the oracle catches up. Distinct
from #267 / #269 (menu Tab / wrap). Do not start #254.

## Current reproduction admission — 2026-10-09

The September measurements above are historical. They do not establish the
current source or pinned-reference outcome. The conductor admitted and applied
tests only in `apps/comparison/e2e/breadcrumbs-contract.spec.ts`: four initial
URL variants (M/L, enabled/disabled) require the complete wide tail and exact
two-item menu; live standard-to-overflow controls require the same shape;
selection remains once-only with the exact truncated path. The entire original
file is preserved, including its 100px responsive case. Source fixtures,
visual/certified assertions, snapshots and budgets are unchanged.

The private proposal is
`/tmp/ui-429-breadcrumbs-test-only-proposal-20261009/`; patch SHA256
`9aedfdee55ddd6e4e7f2de1c2b58a9e255310b5e521b28eb4202062653bffa14`,
applied owning test SHA256
`42ffe5c6002b93116f62a6410c6509968d1821deba263620f9dd04ef2f9beded`.
All 27 preparation inputs and four packet outputs were verified before apply.

At the initial test-only admission, no current browser RED or GREEN had been
measured. The next proof required a fresh
serialized comparison build and whole contract/visual/certified owning files,
with one worker, no retries, the existing config and exact generation custody.
If unchanged fixtures pass, record that result without manufacturing RED.
Only an actual cause-backed result admits a fixture repair; unknown loader,
actionability or timeout output proves no layout cause. Do not remove the D6
skip until its exact assertion passes with the admitted inputs. Supporting
scope is this owning ticket and generated views through the existing generator;
no production repair is admitted by this test-only continuation.

## Actual OLD checkpoint — 2026-10-09

The original complete five-owner browser assay closed with 17 PASS / 13 FAIL
of 30, zero skips, exit 1, no timeout, empty owned-process closure and all
14,891 bound inputs conserved. Four initial URL overflow variants (M/L,
enabled/disabled) lacked React's Reports/Annual report tail; live controls
passed. Overflow D6 reproduced the same accessible-tail mismatch. Standard
D6 crashed before AX measurement and establishes no semantic result.

The computed-style failure compared Solid disabled color 68 with React 175.
The preserved error context exposes both visible Home links as disabled.
Pinned S2 renders hidden measurement links first, omits isDisabled from those
hidden render arguments, and marks their subtree data-hidden-breadcrumb.
The reviewed helper correction selects the original first native anchor/role
link outside that exact subtree; all computed fields and equality assertions
remain. It is not a product color change, and visible-color parity is unproved.

The reviewed fixture candidate waits fonts.ready and uses a one-frame native
list-width pulse, restoring the exact prior width and priority, to trigger
S2's current ResizeObserver callback. Immutable collection snapshots and the
empty-dependency font callback support a stale-size explanation; callback
chronology has not been traced. No historical geometry is current proof.

At the prior checkpoint, the combined candidate whole-five-owner return was outstanding. The separate
Table withdraw/restore must retain both Breadcrumb corrections. After that
GREEN, withdraw only the Breadcrumb pulse while retaining the corrected
visible selector and Table textValue; freshly build and reproduce the four
URL-tail plus overflow-D6-tail failures, then restore and freshly qualify the
same complete five owners. Unexpected failures or crashes stop for review.
No D6 waiver/prose retirement or task closure is justified yet.

Immutable OLD receipt SHA256:
6aa166b9b2ceed66cb189e38a40180c21fd7f7159062d7d6e93f650a2cf9a9bb;
raw SHA256: 4ce117341ba8af42feb7147b27967591128f70fcac73be13294822e44193fa96.
Evidence: /tmp/ui-two-blocker-browser-causal-proof-20261009/actual-stage-02-evidence/.
Reviewed source/helper proposal: /tmp/ui-429-font-settled-remeasure-proposal-20261009/.
Pulse-only continuation: /tmp/ui-429-breadcrumb-fontpulse-causal-continuation-proposal-20261009/.

## Latest native OLD checkpoint and source application — 2026-10-09

The short-TMP successor closed at 23:50:05 UTC with 20 PASS / 10 FAIL
of the same original 30 cases, zero skips, exit 1, empty owned closure and
all bound inputs conserved. Six Breadcrumb failures remained: four initial
URL tails, overflow D6 tail parity, and the computed-color comparison.
Three Table failures remained: sorted D6 and the initial Name/ascending and
Status/descending descriptions. The remaining focus case timed out looking
for Solid's Budget.xlsx rowheader after keyboard focus. Earlier page crashes
and missing React roots did not recur; this establishes no storage cause.

At 23:53 UTC the conductor applied the three reviewed independent deltas:
the React Breadcrumb font-settled native list-width pulse, the existing
visible-link measurement selector excluding data-hidden-breadcrumb, and
the React Table column textValue. The subsequent candidate build/browser
chain was not yet closed at this checkpoint. Source application establishes
no browser success. All full-five-owner candidate, TABLE-ONLY withdrawal/
restoration, and subsequent pulse-only withdrawal/restoration obligations
remain unchanged; no waiver retirement or closure is claimed.

Latest OLD receipt SHA256: f5891190b5ca357f29cbc2a4e62566045729ebb0c0e95c21195ca706acc4195a;
raw SHA256: 230b77d45dfb990e54df2d6ba1b764286f5cc7d7beebc2ce644250aea07355f7.

## Actual combined candidate checkpoint — 2026-10-09

The original complete five-owner candidate closed at 23:57:54.099368 UTC
with 24 PASS / 6 FAIL of 30, zero skips, exit 1, empty owned closure and
14,891 conserved inputs. The certified subset was 7 PASS / 1 FAIL of 8.
Both positive initial Table descriptions and sorted Table D6 now pass;
the Breadcrumb computed-style comparison also passes with the corrected
visible-link selector. Four initial Breadcrumb URL tails and overflow D6
still fail, and Solid's Budget.xlsx rowheader remains unavailable to the
original focus case. The candidate list-width pulse has not cleared the
tail failures. These results identify remaining defects, not their native
ResizeObserver chronology or component remount cause. No task/waiver closure
or aggregate readiness is established.

Receipt SHA256: de1228f09b2f29f7780b1b191cb6ae83dc1669da3c44d593dae20a9a12ad751b;
raw SHA256: 35aebfdc7301bad3bf01435644012666c85b683a602b836b8e26b8436252eb29.
Actual return: output/qualification-evidence/ui-reviewed-combined-browser-causal-successor-proof-20261009/04-table-candidate-breadcrumbs-table-full-owners.return.json.

All candidate and cause-chain obligations remain: whole-five-owner GREEN
before TABLE-ONLY withdrawal/restoration, followed by pulse-only withdrawal/
restoration keeping the corrected visible selector. Unexpected failures stop
for review. Neither passing descriptions nor a diagnostic substitutes for
the original whole owners, matched SSR/hydration and final mandatory gates.

## Native containing-row remeasurement checkpoint — 2026-10-10 UTC

The diagnostic-only native ResizeObserver timeline closed exit 0 with no
page errors and no dropped timeline entries. It records a real callback on
the observed React list after changing the containing fixture row's inline
size, followed by the restored wide tail. The current candidate pulses that
containing row after fonts settle, then restores the original inline-size and
priority. This is native chronology evidence for the bounded fixture response,
not a substitute for the outstanding pulse-only withdrawal/restoration assay.

Diagnostic return:
`output/qualification-evidence/ui-429-native-resize-timeline-proof-20261009/01-breadcrumbs-native-resize-timeline.return.json`,
SHA256 `b968581bfb2cda61c36d684289828083c0f120b4522a195ead0c5626770c42ef`;
raw SHA256 `2adfa04bf23632b9943d2c5877b79325916d650d21f821fe84cd7decbd52d404`;
`native-resize-timeline.json` SHA256
`c02968e925642e851c75d60fcf2a51f8eed36c98696689881d1cd877c6d7798c`.

All original Breadcrumb cases now pass in the fresh complete browser owner run.
[#646](./646-align-tableview-reference-column-text-values-and-qualify-sorted-ax.md)
is the single source for its whole-30 result and remaining Table focus-ring
failure. The pulse-only withdrawal/restoration controls remain outstanding;
this checkpoint closes neither #429 nor full local qualification.

## Completed Table and Breadcrumb pulse control checkpoint — 2026-10-10 UTC

The original whole-five-owner assay has now completed TABLE-ONLY withdrawal
and restoration of the React column `textValue`. All Breadcrumb cases passed
in both phases, including the four URL-remount tails, responsive/live controls
and enabled D5/D6 cases. The Table withdrawal produced precisely its three
column-name failures (27 PASS / 3 FAIL of 30); restoring the exact fixture
returned all 30 original cases to PASS with zero skips and all eight certified
cases to PASS with zero failures/skips/waivers/flaky results. This establishes
the Table control independently while the Breadcrumb row pulse remained
included; it does not establish causality of the Breadcrumb repair.

The complete Table control receipts and archives are recorded in
[#646](./646-align-tableview-reference-column-text-values-and-qualify-sorted-ax.md).
The restored whole-owner return is
`output/qualification-evidence/ui-table-divider-whole-browser-causal-successor-proof-20261010/08-table-restored-breadcrumbs-table-full-owners.return.json`,
SHA256 `2aab6b4ec19142aedb062c9ade1181e0d62840b1dacd3aa34666f74b2a334229`;
raw SHA256 `c66ade31673aced8265003135a22dea8f340bc75a41c3e5a9b7c4a2354a8b635`.
Its retained archive manifest SHA256 is
`72751b5d081a22d3bf85a2f02ee427e494770df94dbe60ae0b19e7e9b5c45ee6`.
The browser phases conserved 14,893 inputs and closed without timeout or
remaining owned processes.

The pulse-only withdrawal stage 2 has since closed with 25 PASS / 5 FAIL
of the same original 30 cases, zero skipped/flaky. Its only failures were
four initial URL tails (M/L and disabled M/L) and overflow D6 tail parity;
all fourteen Table cases passed. The corrected visible-link selector stayed
included. Root independently reviewed the raw, certified JSON and all eighteen
archived source/destination files. Return:
`output/qualification-evidence/ui-429-row-pulse-causal-continuation-proof-20261009/02-breadcrumb-pulse-withdrawn-breadcrumbs-table-full-owners.return.json`,
SHA256 `78ed098eb3281bd383279ff929ce43aa3deb805ec53bfac76537dedbe65eb347`;
raw SHA256 `a2a746bb04793a68708783d0a027e15661021ebcaba0bce6ff4eccaefd46e079`;
archive manifest SHA256
`ae077912bb63ff441760d0373e3c628d290690beed4755710a9b25ac32a12dc2`.

Root restored the exact containing-row pulse (`aaf00b593e83462dbd0782885d8819224c6e968b1f7b1a7d6bcfdae09bdb5395`),
application record SHA256
`94f7a9a9929f0257dbc3daf7d25d1fe46d462b64533e0101057a1ae6d9cf6efe`.
The restored stage 3 full comparison build closed exit 0 in 52.6169 seconds,
with 6,492 conserved inputs and established owned closure. Its actual return is
`output/qualification-evidence/ui-429-row-pulse-causal-continuation-proof-20261009/03-breadcrumb-pulse-restored-comparison-production-build.return.json`,
SHA256 `cdbba8adc84f6c62b88971f9900ca67df9b5bea0efa033362b5c1430d728e4bb`;
raw SHA256 `ee25b92cbab353d299afaad3056d0a59aec40a810c3b1410f48eb96562490c41`.

Restored stage 4 closed at 2026-10-10 01:11:32.849061 UTC, exit 0 in
83.4467 seconds: all 30 original cases PASS, with all eight certified cases
PASS and zero failed/skipped/waived/flaky, `errors: []`. It conserved 14,893
inputs and closed without timeout or remaining owned processes. Return:
`output/qualification-evidence/ui-429-row-pulse-causal-continuation-proof-20261009/04-breadcrumb-pulse-restored-breadcrumbs-table-full-owners.return.json`,
SHA256 `8f75b001030b3af68b82dcb53070cf3e6cdbd9ae90c2a0079ba667c8b6ff1173`;
raw SHA256 `847f0959eb698b736e47388fa8dc9eb89adda546ae5bf238b525a66081304ea9`.
Its retained `actual-stage-04-evidence/MANIFEST.json` SHA256 is
`94711e33302ccfde6f0e7d74bbf0bf38b73c5d8d8ae9da91e59d8ba6dc3b37f7`;
all thirteen archived files (4,575,278 bytes) were independently verified.

The original whole-owner pulse withdrawal/restoration control is complete:
withdrawal reproduced only the five tail failures, and restoration recovered
all thirty cases. Original assertions and budgets were unchanged. This supports
the bounded containing-row fixture repair; preserve the earlier native chronology
as measured evidence, not a callback-installation trace or broader convergence
claim. Mandatory native input, full SSR/hydration and final eight-shard gates
remain outstanding.
#429 remains open; native-13, aggregate readiness, final eight-shard
qualification and publication are not established by this checkpoint.

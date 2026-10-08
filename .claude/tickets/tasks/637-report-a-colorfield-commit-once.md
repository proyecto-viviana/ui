---
id: 637
type: task
title: "Report a ColorField commit once"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D22 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queue equivalent-color commit repair before next RC. Root data attributes match upstream; no inputProps API authorized.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Bounded source worker launched; commit regressions and exact-base controls in progress. Native and release qualification remains conductor-owned.",
    }
---

## Scope

UI owns Visualmode D22's repeated ColorField callback. Enter followed by blur
reportedly commits the same color twice. Inspect solid-stately/src/color/createColorFieldState.ts
against pinned useColorFieldState's equivalent-color suppression. Preserve
supported channels, alpha, formats and controlled behavior. Name exact owning
state/hook/headless/styled regression paths before dispatch; no dependencies,
consumer edits or new public props.

The attribute-placement half differs from upstream: RAC ColorField filters
global DOM props onto its root div, as the local headless component does.
Keep that contract. Existing ColorFieldInput can receive its own DOM props;
do not move or duplicate root data attributes or add inputProps silently.
Any new styled input-targeting API requires separate owner steering.

## Done when

Typing a new valid value, pressing Enter and then blurring reports one committed
change. Recommitting an equivalent color adds no change, while a genuinely
different color remains observable. Empty/null, controlled refusal, alpha and
channel edits retain correct semantics. Root attributes remain on the root.

## Proof

Reproduce the repeated callback against inherited source and test exact counts
through state and real field interaction. Compare equivalent spellings and
different supported colors/channels without collapsing meaningful precision or
alpha changes. Verify root and explicit input attributes against upstream.
Run existing candidate gates and report actual published fixing versions.

## Relationship

Child of #24, prioritized by #87 before next RC. Producer for Visualmode
#10163/#10220; CanvasEntryWorldEnvironmentSection currently drops a color equal
to the held value. Source request:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D22-colorfield-reports-twice-and-keeps-attributes-on-its-wrapper.md.
Patch Changeset belongs to the lowest repaired layer; rollback stays in color
commit behavior. Attribute expansion is not part of this authorized repair.

## ColorField commit admission — 2026-10-08

Preceding #636 native checkpoint is committed as
035b8e151dbbf07c17183ded0af9cb2ffa3906aa. Its sole worker generation
35832d32-ec0e-465b-b920-49ebccd7257e was owned-stopped with closed=true;
all accepted path hashes survived normal hooks and main was clean.
Register the sole OS/herdr implementer in eligible repo:ui/main using
`/tmp/ui-637-dispatch-2026-10-08.md` under the existing Decision 040
Codex astra low fallback for this state/timing slice. No worker commit/push;
conductor accepts and integrates after independent review and exact stop.

Source admission is only
`packages/solid-stately/src/color/createColorFieldState.ts`. Tests are
`packages/solid-stately/test/color.test.ts`,
`packages/solidaria/test/createColorField.test.tsx`,
`packages/solidaria-components/test/Color.test.tsx`, and
`packages/solid-spectrum/test/ColorField.test.tsx`. Admit
`.changeset/colorfield-equivalent-commit.md` for an actual stately repair,
this ticket and standard generated views. Other product owners, global Color
comparators, direct-setter semantics, styles, dependencies, inputProps and
public API remain read-only.

Explicitly admit the pinned narrow controlled commit display reset: after
commit restore text from the current accepted value, including refused empty
input. Read current state after the callback; preserve later reactive formatting
when an accepting signal becomes visible on flush. Refused Enter then blur
requests once through display reset; deliberately retyping is a fresh request.
No requested-value cache, debounce or lifetime suppression. Whole hex/hexa
equivalence is operation-specific, including alpha for hexa; numeric channels
compare the actual normalized edited channel and retain alpha, fractional and
achromatic hue differences. Direct setColorValue behavior remains unchanged.
Root attributes retain the upstream root contract; explicit headless input
attributes have separate positive proof. Save final-assertion exact-base
controls with failure-safe restoration and source hashes, owning checks and
actual inherited diagnostic inventory. Native, candidate, installed-consumer
and release qualification remains open.

## Bounded source evidence — 2026-10-08

Worker generation `1160f45e-bba0-484c-bb4d-dfcc199fce80` repairs only the
admitted stately source. State/hook tests pass 108; headless/Spectrum field
tests pass 154; existing Spectrum swatch composition tests pass 12. These
are testing-library/state checks, not native or independent twin qualification.
Root/input attribute placement remains intentional parity.

Commit uses current accepted state and restores its display after callbacks.
Channel commit also distinguishes edited text from untouched formatting, so
rounded display does not quantize supported fractional values on recommit.
Deliberate edits, even retyping the rounded display, remain numerical edits.
Pinned number state snaps and format/parses its numeric values; preservation
of local fractional precision is an admitted local compatibility requirement,
not a claim that the pin preserves those fractions.

Exact-base controls retain final tests and restore candidate source in finally,
with matching before/after hashes. Detailed per-control outcomes, command logs,
source/test/view hashes and limitations are under `/tmp/ui-637-*`; handoff is
`/tmp/ui-637-worker-result-2026-10-08.md`. Typecheck reports 24 diagnostics outside
admitted paths, identical with exact-base source substituted; this is not a
whole-tree baseline claim. Scoped lint and docs checks pass. Ecosystem audit
has 13 failing gates out of 38; its raw log records environmental and repository
failures. No release fixing version or ticket closure is claimed. Acceptance,
owned stop, integration and later qualification remain conductor-owned.

## Conductor source acceptance — 2026-10-08

Independent final review found no blocker in the bounded source checkpoint
(`/tmp/ui-637-final-independent-review-2026-10-08.md`). The conductor verified
all 32 repository manifest records and 78 evidence hashes against the actual
files, including base hashes and declared absences. The final 26 controls have
20 failures and six positive controls on the exact base, then all pass with the
restored candidate. The original handoff, manifests, evidence and owned-stop
receipt are preserved in `/tmp/ui-637-source-checkpoint-2026-10-08/`; its
archive map binds 116 records across 115 unique original paths.

Worker generation `1160f45e-bba0-484c-bb4d-dfcc199fce80` was stopped through
the owned OS command with `closed=true` before conductor coordination or
integration. Accept this stately source and its regression coverage for a
scoped normal-hooks commit. The 24 inherited type diagnostics and ecosystem
audit failures remain recorded; native, independent twin, installed candidate
and release verification remain open. Ticket stays in-progress.

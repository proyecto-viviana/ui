---
id: 544
type: initiative
title: "Cut the Solid 2 release candidate and its public face"
created: 2026-09-20
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "owner opened a quota-bounded campaign: adversarial audit, a workable main, an -rc prerelease on the next dist-tag, and better public docs and homepages. Iterative durable progress outranks reaching the RC. Owner approved the TanStack 2.0.0-rc.8 bump and gave standing push, docs-deploy and next-tag publish authority for this campaign; no Codex, no Blacksmith",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the 2026-09-21 round-1 adversarial audit landed, receipt `.agents/audit-2026-09-21/round-1-results.md`, owners in `.agents/audit-2026-09-21/OWNERS.md`. 76 findings, every one owned: 15 new tickets #587-#601, 15 existing tickets annotated, 3 findings already settled by commits that landed after the audit range closed (`13080aa0`, `495582e9` twice). The audit's standing result is that the Ordered work list above no longer describes the path, because the ladder stops before most of it: `docs:check` is the earliest blocking red, at `certification-gates.yml:235` at HEAD `65254a8c`, and Certification Gates has had no successful run since 2026-08-31. The replacement is the section `Path to the RC after the 2026-09-21 audit` at the end of this file",
    }
---

Owner direction, 2026-09-20. Spend the remaining Fable and Opus quota on this
repository without wasting it on menial work. Land progress in small verified
slices so that a quota cut loses nothing. Reaching the release candidate is the
aim, not a deadline.

This initiative overlays [#87's ordered plan](../tasks/87-close-every-remaining-audit-item-in-order.md).
It does not replace that census, release a held decision, or lower #537's bar
for a `latest` release.

## Owner decisions recorded here

- **Release candidate shape.** Version the Adobe-stack packages and
  `@proyecto-viviana/ui` as `-rc.N` prereleases on the npm `next` dist-tag, as
  Solid does. Consumers move to the rc at once; nothing important is in
  production. Certified failures may ship as named debt in
  `certification-debt.md`. `latest` stays held to #537.
- **Dependency.** `@tanstack/solid-router` and `@tanstack/solid-start` move to
  `2.0.0-rc.8`, the Solid 2 line (#545).
- **Public surfaces in scope.** Site landing and docs, npm READMEs, the GitHub
  front door, and the comparison site.
- **Standing authority for this campaign.** Push to `origin/main`; deploy the
  docs site once Site Gate is green on the exact revision; publish the rc to
  `next` once #547's gates are green. Never force-push.
- **CI.** GitHub-hosted runners and local checks only. No Blacksmith (#551).
- **Workers.** Fable conducts, decides, and accepts diffs. Opus takes audit
  lenses, hard slices, and the second review seat. AGY is the default
  implementer, runner, and drafter. Grok is the spare reader. No Codex today.

## Ordered work

1. #194 slice: restore the import line the Solid 2 codemod dropped from
   `apps/comparison/scripts/merge-certified-reports.ts`. Two red workflows
   share that one cause.
2. #546 adversarial audit, read-only, in parallel with the writer seat.
3. #534 Hover slice: finish or revert the five preserved files.
4. #545 web app on Solid 2. Site Gate cannot pass before this.
5. #543 remainder, then #139 and the rest of #194, as #87 orders them.
6. #547 rc prerelease on `next`.
7. #548 npm READMEs and GitHub front door.
8. #549 site landing and docs, then deploy.
9. #550 comparison site as public evidence.
10. #551 CI runner record.

Confirmed critical audit findings jump the queue at the writer seat.

Superseded as an ordering by **Path to the RC after the 2026-09-21 audit**, at
the end of this file. The items above are still in scope; the stages there say
which of them can be reached, and in what order.

## How this runs

- One writer in this git at a time. Audit, review, research, and drafting run
  in parallel only when read-only, or when they write outside the checkout.
- Launch long workers through the owned OS runtime with `repo:ui` cataloged.
  They outlive the conductor session. Every Claude worker names
  `--model claude-opus-5`; the host default is Fable.
- A worker writes its result to a named artifact before it reports. Audit
  lenses append findings as they find them, never only at the end.
- Name a slice's write paths in its ticket history before the worker starts,
  so uncommitted work is attributable after a cut.
- One commit per verified slice, pushed at each checkpoint. One dated receipt
  in `.agents/` per five-hour session.

## Done when

An `-rc.N` of each in-scope package is on `next` from one exact revision with
its gates recorded on #547. The public site builds from that revision and is
deployed. The READMEs and front door describe what is certified, what is
experimental, and the Solid 2 requirement, with a proof for each claim.
Confirmed audit findings are fixed or ticketed.

## Relationship

Siblings #443 (the `latest` train), #531 (Solid 2 foundation), #136 (audit),
#26 (comparison site). The scheme forbids an initiative parent. Children:
#547, #548, #549, and the fifteen the 2026-09-21 audit opened, #587-#601.
#545 sits under #531, #546 and #551 under #136, #550 under #26.

## Path to the RC after the 2026-09-21 audit

Written 2026-09-21 from `.agents/audit-2026-09-21/round-1-results.md`; owners
in `.agents/audit-2026-09-21/OWNERS.md`. The stages are ordered by what blocks
what, not by severity. Each one is finished when its tickets are, and the next
one is worth starting only then, because until S1 nothing here can be measured
whole.

**S0 — make the ladder reach its own end.** Today it does not: the first
blocking red is `docs:check`, and everything after it is unexecuted, so the
repository has no verdict on most of its own gates.

- **S0-a #587**, critical. `guard:entry-import-budget` is the twentieth leg of
  the release chain and its own unit test is red, so the chain cannot be walked
  whole until it passes. Also fixes its position: it reads `dist/` and runs
  before `build`.
- **S0-b #588**, high, and the one that truncates everything. The generated
  board views are stale at the commit that generates them, `docs:check` exits
  1, and it is `certification-gates.yml:235` at HEAD. Includes the ladder-row
  correction on #568 and the reproducibility of `docs:generate`.
- **S0-c #589**, medium. CI reports verdicts it does not hold: the eight
  certified shards are `continue-on-error`, `cancel-in-progress` erases a
  verdict rather than deferring it, and one contrast leg is mislabelled.

**S1 — walk the chain as twenty legs. #590**, high, blocked by #587. Retires
"nineteen of nineteen green": the chain grew a twentieth leg on 2026-09-20 and
has not been walked whole since. Ends with one sha, twenty recorded exit codes,
and a CI leg that actually runs the unit suite — which today runs in no enabled
workflow, and so has never proved #555's or #556's tests.

**S2 — the source defects the audit confirmed.** Independent of each other; all
of them are behaviour in published packages, so they land before anything is
published.

- **S2-a #591**, high. `createPress` opens links with `isOpening: true`,
  re-enters on click, and de-duplicates by a shared flag.
- **S2-b #592**, medium. Link items bypass the router at four call sites; a
  pre-existing parity gap, not a regression from this campaign.
- **S2-c #593**, medium. `FocusScope` restores focus without asking which scope
  is active, plus the `focusin` retargeting residue.
- **S2-d #594**, medium. `createPress` injects an un-nonced `<style>`.
- **S2-e #595**, medium. `Dialog` labels itself with an id no element carries.
  Read its note before starting: the audit's prescribed fix diverges from RAC
  1.21.0, and the real gap is at `Button.tsx:483`.
- **S2-f #596**, medium. `createId` throws without an owner and one call site
  was bypassed rather than fixed.

**S3 — stop the ratchets outrunning their receipts. #597**, high, with #579 as
its prerequisite in fact: nine of the thirty facts absorbed into the parity
baseline are the mis-pairing #579 names, so re-measuring before the attribution
rule is fixed measures the same bug again.

**S4 — the publish path. #598** (medium): `guard:publish-drift` measures from a
bump that was never published and skips every package with a pending changeset.
**#599** (medium): the local publish route is gated by a hand-written
attestation. Both are about the route to npm being checkable rather than
attested.

**Site — #545, #549.** Unblocked by S0-b only in the sense that a red ladder
hides their evidence; the real gate is that Site Gate is `disabled_manually`,
so no CI run in this campaign has rendered an `apps/web` route. Enabling it is
an owner action, recorded on #568.

**Public face — #548, #550, #600.** #548 and #550 fix facts in copy Fable owns.
#600 is the install tag, and it is blocked on an owner call: `rc` alone, or
`rc` plus a hand-moved `next`. The conductor's default is `rc` alone.

**Then #547**, the publish itself.

Off the path: **#601**, the seven low residues the stages do not claim. Nothing
in it gates a gate.

**The release condition, in one sentence.** At one sha: the twenty-leg chain
green locally with its exit codes recorded, and Certification Gates, Release
Readiness and Site Gate each with a successful run at that same sha — which
needs the two disabled workflows enabled first, an owner action — and only then
publish.

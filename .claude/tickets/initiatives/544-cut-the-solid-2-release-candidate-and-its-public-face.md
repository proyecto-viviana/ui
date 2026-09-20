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
#547, #548, #549. #545 sits under #531, #546 and #551 under #136, #550 under
#26.

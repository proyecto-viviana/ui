---
id: 132
type: task
title: "Give Certification Gates enough time to finish"
created: 2026-08-20
parent: 30
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "two exact-SHA release qualifications reached the 45-minute limit after every earlier gate passed",
    }
---

Certification Gates runs its blocking browser evidence in sequence. The
45-minute job budget no longer fits the complete sequence.

## Evidence

Run `31296856895` tested release head
`d5e2bcce3b68cb0b0bb8310d41dc747df5fa674d` twice on 2026-08-20. Both attempts
passed every gate before the full axe audit. The retry also passed the certified
comparison suite, then GitHub cancelled axe when the job reached 45 minutes 19
seconds. The required check did not pass, so PR #20 was not merged.

PR #30 changed only `.github/workflows/certification-gates.yml`. It kept all
blocking gates and increased the job budget from 45 to 60 minutes. On commit
`2a13127e1a669817770069ea75a483bc01c90e57`, all four required checks passed.
Certification Gates finished in 43 minutes 31 seconds, including the full axe
audit. The PR merged to `main` as
`08eb84135b1814b656454893c2fb4bc4f0d185f0` on 2026-08-21. Exact-SHA `main`
qualification is now running.

## Work

- Keep the certified comparison suite and full axe audit blocking.
- Increase the job budget from 45 to 60 minutes.
- Proved the workflow change on PR #30.
- Merged the workflow fix before requalifying release PR #20.
- Confirm that Certification Gates also passes on the merge commit.

## Done when

The workflow fix is on `main`, Certification Gates can finish all blocking
steps, and ticket #78 resumes on a fresh release head.

## Relationship

Unblocks ticket #78. Stable release rules remain in
`.claude/current/release-policy.md`.

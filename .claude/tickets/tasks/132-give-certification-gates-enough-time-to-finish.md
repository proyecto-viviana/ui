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

## Work

- Keep the certified comparison suite and full axe audit blocking.
- Increase the job budget from 45 to 60 minutes.
- Prove the workflow change on its pull request.
- Merge the workflow fix before requalifying release PR #20.

## Done when

The workflow fix is on `main`, Certification Gates can finish all blocking
steps, and ticket #78 resumes on a fresh release head.

## Relationship

Unblocks ticket #78. Stable release rules remain in
`.claude/current/release-policy.md`.

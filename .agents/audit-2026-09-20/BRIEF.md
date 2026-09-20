# Adversarial audit brief — ticket #546, 2026-09-20

You are one lens of an adversarial audit of `/home/emoporemilio/projects/viviana-hub/ui`,
a Solid design-system monorepo: `solid-stately` → `solidaria` →
`solidaria-components`, then styled `solid-spectrum`, `viviana-ui`
(`@proyecto-viviana/ui`), `kumo`, `geist`. It ports Adobe React
Stately/Aria/Spectrum S2. The pinned upstream source is vendored under
`react-spectrum/`. The whole stack moved to Solid `2.0.0-rc.9` in commit
`163f4377`, largely by codemod. A release candidate is about to be cut.

Your job is to find what is actually broken or falsely claimed, not to
describe the code. Assume every green check is lying until you see why it is
not.

## Hard rules

- **Read-only.** Do not edit, create, stage, commit, or delete anything in the
  checkout except your one artifact file named below. No `vp install`, no
  builds, no dev servers, no browser runs: another worker holds the writer seat
  and the box has little memory. You may run `git`, `grep`/`rg`, `node -e`,
  `vp exec tsc --noEmit -p <one tsconfig>` and a single-file
  `vp exec vitest run <one test file>`.
- **Append as you go.** Write each finding to your artifact the moment you have
  it. You may be killed at any time; a finding that is only in your head is
  lost. Never batch findings for the end.
- **Evidence or nothing.** Each finding needs a path and line, and a command or
  a short reasoning chain a reviewer can re-run in under two minutes. Mark a
  suspicion you could not prove as `UNPROVEN`. Do not pad.
- **Upstream is the oracle.** When you claim a behavior is wrong, cite the
  upstream file under `react-spectrum/` or the Solid 2 source or docs in
  `node_modules/solid-js` / `node_modules/@solidjs/web`.
- No secrets or secret locations in your output. Do not read `.env*` files.
- Do not fix anything. Do not open tickets. Do not touch `.claude/tickets/`.

## Already known — do not report

- `apps/comparison/scripts/merge-certified-reports.ts` lost an `import {` (fixed `9e0df73c`).
- 373 files were unformatted (fixed `acb75aa4`).
- `apps/web` still depends on TanStack Solid 1 packages (ticket #545).
- The git pre-commit hook path was stale (fixed locally).
- Five uncommitted #534 Hover files in the working tree; ignore their diff.

## Finding format

```
### <SEVERITY> <short title>
- where: path:line (and twins, if the same defect repeats — count them)
- what: one or two sentences
- proof: command or reasoning chain
- expected: the correct behavior and its source
- blast radius: which packages, components, or consumers
```

Severity: `CRITICAL` breaks a consumer or ships a false guarantee; `HIGH`
wrong behavior in a supported path; `MEDIUM` latent or edge; `LOW` hygiene.

Start your artifact with a `## Coverage` list that you keep current: what you
examined, what you skipped and why. End with `## Verdict`: would you ship an
rc from this tree, and the three things you would fix first.

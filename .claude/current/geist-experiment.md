---
kind: reference
status: current
---

# Geist Button experiment

Status: live experiment reference.
Update when: the experiment boundary, oracle, package relationship, or owner
decision changes.

This document defines the approved boundary for the first Geist-on-Solid
experiment. Tickets hold its work state.

## Outcome

Show one honest Geist Button experiment on the shared Solid foundation. The
Button does not prove Geist parity. Workspace `@proyecto-viviana/geist` is
`0.0.0`, incomplete, and expected to have rough edges. `@vercel/geistcn` is
not on public npm, so this slice has no React oracle.

## Architecture

- The package name is `@proyecto-viviana/geist` (owner 2026-09-10).
- `solidaria-components` is the reusable headless layer.
- `solid-spectrum`, `@proyecto-viviana/ui`, `@proyecto-viviana/kumo`, and
  `@proyecto-viviana/geist` are standalone styled siblings above that layer.
- The styled Button uses Geist API names such as `onClick` and `className`.
  Consumers use `solidaria-components` directly for headless APIs such as
  `onPress`, render props, slots, and data attributes.
- Visual rest values come from the public docs at
  https://vercel.com/geist/button. This repository does not copy
  `@vercel/geistcn`.

## Evidence boundary

Ticket #527 owns the package, unit, SSR, hydrate, pack, and smoke evidence.
Ticket #528 owns the Solid comparison fixture. This experiment does not
certify a Geist port. Workspace publish rules are in `release-policy.md`.

## Work

- #527 finishes the workspace package baseline.
- #528 owns the Solid fixture.
- #529 owns the landing-page story.
- #530 records the owner's decision to continue, pause, or delete.

## Limits

- Do not expand beyond Button before #530.
- Do not describe the experiment as a port.
- Do not expose both the Geist and headless APIs on one styled component.
- Do not add `@vercel/geistcn`, `@vercel/geistcn-assets`, or the `geist`
  font package without a separate owner approval.
- Do not reimplement press, focus, keyboard, disabled, or pending
  behavior in `packages/geist`.
- Do not publish Geist as a side effect of landing or deploying the site.
- Do not weaken Adobe-stack evidence to make this experiment pass.

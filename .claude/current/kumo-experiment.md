---
kind: reference
status: current
---

# Kumo Button experiment

Status: live experiment reference.
Update when: the experiment boundary, oracle, package relationship, or owner
decision changes.

This document defines the approved boundary for the first Kumo-on-Solid
experiment. Tickets hold its work state. Git history holds the retired task
specifications.

## Outcome

Show one honest Kumo Button experiment on the Viviana UI site. The page explains
the shared Solid foundation and presents its three standalone styled libraries.

The page must show the maturity difference. The Button does not prove Kumo
parity. `@proyecto-viviana/kumo` is unpublished, incomplete, and expected to
have rough edges.

## Architecture

- The package name is `@proyecto-viviana/kumo`.
- `solidaria-components` is the reusable headless layer.
- `solid-spectrum`, `@proyecto-viviana/ui`, and
  `@proyecto-viviana/kumo` are standalone styled siblings above that layer.
- The styled Button uses Kumo API names such as `onClick` and `className`.
  Consumers use `solidaria-components` directly for headless APIs such as
  `onPress`, render props, slots, and data attributes.
- This repository owns the implementation. `../kumo-solidaria` owns the
  Cloudflare-facing proposal and governance context. It is not a runtime
  dependency.
- The React oracle is the exact published `@cloudflare/kumo@2.11.0` package.
  The comparison app pins that version.

Kumo 2.11.0 changed Badge, LinkButton, Table, and Sidebar. It did not change
Button from 2.10.0. Those other components are outside this pilot.

## Evidence boundary

The comparison must mount the real React and Solid Buttons. It must cover
accessible names, activation, disabled and loading behavior, forms, refs,
focus, SSR, hydration, interaction states, and both themes.

Ticket #38 owns the current results. Package publication and trusted-publisher
registration remain fail-closed prerequisites. This experiment does not
certify a full Kumo port.

## Work

- #37 finishes the releasable package baseline and external prerequisites.
- #38 owns the paired fixture and its browser and visual evidence.
- #39 owns the accurate landing-page story.
- #40 qualifies and deploys the page after explicit owner approval.
- #41 aligns the separate `kumo-solidaria` proposal.
- #42 records the owner's decision to continue, pause, or delete the pilot.

Use the generated `status.md` and `roadmap.md` views for current ticket states.

## Limits

- Do not expand beyond Button before #42.
- Do not describe the experiment as a port without the complete evidence bar.
- Do not expose both the Kumo and headless APIs on one styled component.
- Do not add a runtime or workspace dependency on `../kumo-solidaria`.
- Do not reimplement press, focus, keyboard, or disabled behavior in
  `packages/kumo`.
- Do not publish Kumo as a side effect of landing or deploying the site.
- Do not weaken Adobe-stack evidence to make this experiment pass.

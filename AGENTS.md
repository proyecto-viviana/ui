# Proyecto Viviana

## Rule #1 — A certified port, or it isn't ported

Proyecto Viviana is a published Solid library, and the deliverable is parity
itself. A component is "ported" only when it is **certified**: real
accessibility, real behavior, a full port — as tested and certified as possible.
axe is not enough; a single unit test is not enough; coverage is comprehensive
and strict.

Every user-observable upstream branch is matched and held by a test that can
fail — across API, ARIA/accessibility, keyboard/focus, forms/validation,
behavior/timing, styling, visual parity, and i18n. An export that exists, a route
that renders, a green axe run, and a stable screenshot are **floors**, never
acceptance.

The full bar and the gate ladder live in `.claude/current/certification.md`; the
per-component runner is `apps/comparison/COMPONENT_PLAYBOOK.md` and its ten
acceptance gates in `apps/comparison/playbook/`.

(Owner directive, 2026-06-14 — the #1 rule of this repo; it outranks everything
below.)

## Rule #2 — Mirror upstream; don't invent

Adobe's React Stately, React Aria, and React Spectrum S2 are the authority. Read
the upstream source and official docs first and copy the real values — sizes,
weights, tokens, ARIA wiring, state machines, structure. Do not invent a size, a
name, a behavior, or a structure when an upstream answer exists.

A Solid-specific export with no upstream counterpart (an alias or composition
helper) is allowed only when it is explicit and documented as a _local addition_
— never silent drift. This is the parity discipline that Rule #1 certifies.

## Rule #3 — The architecture lives in the owner; pull it out

The owner already has the correct architecture in mind. The agent's first job in
any design conversation is to extract it: ask questions that help the owner
articulate what they see, mirror it back in their own terms, and confirm the
understanding is shared before building on it.

Do: suggest, ponder, and give opinions — clearly labeled as the agent's own; then
implement faithfully what was discussed. Do not drive design by presenting
pre-framed option menus for the owner to ratify, bury decisions in agent-invented
vocabulary, or mistake acceptance-without-understanding for a decision.

Names with reach — packages, public types, exports, anything that would appear in
a conversation about the system — are owner-steered _now_; never mint one
silently. Lower-level internals may live briefly unnamed, but that is debt to
bring back and decide together, never agent territory.

## Rule #4 — Behavior in the lowest layer; S2 styling has one source

State belongs in `solid-stately`; ARIA, keyboard, and focus in `solidaria`;
composition, slots, render props, and data attributes in `solidaria-components`.
The upper layers (`solid-spectrum`, `viviana-ui`) wrap a headless component with a
design-system API, compose primitives, theme, and add Viviana-native components —
they never fork ARIA or state logic.

S2 component styling lives **only** in `solid-spectrum`, generated from S2 tokens
through the style macro: never hand-authored, never tuned to make a screenshot
pass (ADR 0001, `docs/adr/0001-s2-styling-source-of-truth.md`). The comparison app
_verifies_ styling; it never patches it. The layer chain and boundaries are in
`.claude/current/architecture.md`.

## Rule #5 — Think in systems

(After Donella Meadows.) Behavior comes from structure. Build the structure that
produces parity, not a patch for today's failing case. At a fork between a
pragmatic-but-limited option and a harder one that unifies concerns and scales,
default to the unifying one and pay its cost deliberately — "it's the 80% case /
defer it" is never, by itself, a reason to pick the smaller design.

Patches are for fires. A building held together by fifty patches is the failure
mode. Every patch and prototype is an explicit, conscious exception with a
deadline to become real structure or be deleted — never a parallel truth. Ask
every task: am I building structure, or adding patch #50?

## Rule #6 — Code over docs

Never trust a document against the code. When a doc says one thing and the code
does another, the code is right and the doc is stale — verify against source,
tests, and the report scripts before acting on any documented claim the task
depends on. The exception: a spec or ADR records _intent_; code that disagrees
with its spec is a suspected bug, not a stale doc. The report commands in
`.claude/current/status.md` are the status authority, not memory.

## Rule #7 — Tests prove behavior

A test must be able to fail for the reason it exists: it proves behavior through a
real failure mode. No tautologies, no tests whose named logic lives only in the
test body, no silent environment skips. axe is smoke coverage — use Playwright for
keyboard, focus, forms, computed name/description/value, validation, and
announcements, and React-vs-Solid pair diffs or computed contracts for visual
branches. This is how Rule #1 is enforced.

## What `ls` won't tell you

- The five packages are one dependency chain, each adding one concern:
  `solid-stately → solidaria → solidaria-components → solid-spectrum →
@proyecto-viviana/ui`. The directory `packages/viviana-ui` publishes as
  `@proyecto-viviana/ui` (dir name ≠ npm name). Four packages are releasable
  (`solid-stately`, `solidaria`, `solidaria-components`, `solid-spectrum`);
  `@proyecto-viviana/ui` is public but not yet in the release matrix; two
  test-utils packages are private. See `.claude/current/release-policy.md`.
- `apps/comparison` is the verification harness, not a styling source — it mounts
  upstream React and the ported Solid component side by side and proves parity.
  `apps/comparison/COMPONENT_PLAYBOOK.md` and `apps/comparison/playbook/` are the
  per-component authority.
- `.claude/current/` is the only live deep-docs surface;
  `.claude/current/README.md` is its index. **Git history is the archive** —
  retired plans and audits are deleted from `main`, not kept as trees.
- `docs/adr/` holds the architecture decision records; ADR 0001 is the S2-styling
  source-of-truth boundary, referenced by the comparison playbook.
- A vendored upstream `react-spectrum/` reference tree may be present and
  git-ignored: read-only parity reference, never imported from.
- The dev-only `/admin` dashboard (`apps/web`, dev only) projects
  `.claude/current/` frontmatter — roadmap items and tasks — as the internal
  operating surface. It is tooling, not product: keep a task's state in sync in
  the same commit as the work it tracks. (Seed/mock data for now.)

## Operating

- Work in `/home/emoporemilio/projects/viviana-ui`. Default to `main`.
- Check `git status --short --branch` before edits and before handoff. Preserve
  user work — do not reset, restore, or overwrite unrelated changes. Leave no
  stray temp files or dev servers.
- Use `rg` for search and `vp` for repo commands (raw `pnpm` only when debugging
  pnpm itself). Never add a dependency without explicit approval.
- Docs-only changes need no Changeset; releasable package code usually does. Run
  the relevant gates and `git diff --check` before handoff, and report what
  changed, what passed, and what was not run.

## Playbook

Setup, commands, and day-to-day procedure live in `.claude/current/tooling.md`
and `README.md`. Component parity work runs through
`apps/comparison/COMPONENT_PLAYBOOK.md`.

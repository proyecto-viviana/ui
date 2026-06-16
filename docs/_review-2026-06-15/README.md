# Proyecto Viviana — Harsh Review (2026-06-15)

Evidence-based parity & quality audit. 11 parallel agents, each writing one file
here; the orchestrator synthesizes these into the chat report.

**Standard:** the repo's own Rules #1–#7 (`AGENTS.md`).
**Upstream pin:** vendored `react-spectrum/` — `@react-spectrum/s2 1.1.0`,
`@react-aria/* ~3.27`, `@react-stately/* ~3.9`.

## Manifest

| File                              | Scope                                                    | Model  |
| --------------------------------- | -------------------------------------------------------- | ------ |
| `01-stately-parity.md`            | solid-stately ↔ `@react-stately`                         | opus   |
| `02-solidaria-parity.md`          | solidaria ↔ `@react-aria`                                | opus   |
| `03-components-parity.md`         | solidaria-components ↔ `react-aria-components`           | opus   |
| `04-spectrum-components.md`       | solid-spectrum components ↔ `@react-spectrum/s2`         | opus   |
| `05-style-macro.md`               | solid-spectrum S2 `style()` macro & styling (ADR 0001)   | opus   |
| `06-viviana-ui.md`                | `@proyecto-viviana/ui` wrapper + native components       | opus   |
| `07-a11y-collections-overlays.md` | a11y vs APG/WCAG — menus, lists, overlays, tables        | opus   |
| `08-a11y-forms-inputs.md`         | a11y vs APG/WCAG — forms, inputs, dates, color           | opus   |
| `09-test-integrity.md`            | Rule #1/#7 test-quality audit + comparison harness       | sonnet |
| `10-architecture-types.md`        | layer boundaries (Rule #4/#5) + type/code hygiene        | sonnet |
| `11-build-ci-docs.md`             | CI gate enforcement, release, perf, docs drift (Rule #6) | sonnet |

## Guardrails

Read-only · evidence (our `path:line` + upstream/standard ref) or it doesn't ship ·
suspected findings labeled, never inflated to Critical · upstream read by direct
path with `rg --no-ignore` (vendored tree is git-ignored), never from memory.

_Status: agents dispatched 2026-06-15._

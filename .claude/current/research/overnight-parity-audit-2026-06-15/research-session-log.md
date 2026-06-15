---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Research session log

## Constraints

- User requested analysis documents, no implementation code changes.
- User approved PR creation.
- Parallel agents were used for independent inventory, upstream source mapping, and baseline reports.

## Commands / checks captured

- `git status --short --branch` → branch `work`.
- `find .. -name AGENTS.md -print` → only repo AGENTS plus dependency AGENTS under node_modules; repo scope applies to these docs.
- `./node_modules/.bin/vp run comparison:report:parity` → pass.
- `./node_modules/.bin/vp run comparison:report:gaps` → pass with 349 tracked states, 113 current evidence, 56 strict pair-diff tests.
- `./node_modules/.bin/vp run comparison:report:exports` → pass as report-only with 22 missing non-root/support exports and 69 extra Solid exports.
- `./node_modules/.bin/vp run comparison:report:parity:strict` → pass.
- Guard commands were launched; outcomes are recorded in this pack from the baseline agent: RAC guard warnings due missing vendored upstream source, DnD guard pass, virtualizer guard fail.

## Generated files

- `README.md`
- `upstream-local-map.md`
- `component-audit-matrix.md`
- `evidence-gap-ledger.md`
- `cross-cutting-architecture-findings.md`
- `research-session-log.md`
- `component-data.json`
- `components/*.md` for all 69 official S2 catalogue entries.

## Limitations

This pass performed breadth mapping plus audit seeding for all components. It did not complete literal line-by-line source comparisons for all 69 components in the available interaction window; each component seed names the source files and branch axes to complete next.

## Continuation after owner feedback

- Confirmed current branch was `work`, not `main`, before editing.
- Spawned GPT-5.5 xhigh read-only auditors for independent component-family slices and integrated completed findings into the pack.
- Consulted external accessibility authorities (APG, WAI-ARIA 1.2, WCAG 2.2, APG date picker examples, APG combobox examples, and WCAG dragging guidance) and added a standards-obligations ledger.
- Integrated completed depth findings for overlays/menus/feedback, date/time/color controls, provider/content/layout primitives, and collections/tabs/tags.
- One broad form-control audit exceeded its context window; that is recorded as an execution limitation rather than evidence. Form controls still need a fresh, narrower depth pass before certification.

## Continuation after quota reset

- Resumed the unfinished narrow form-control audit without leaving branch `work`.
- Reviewed installed S2 sources and local `solid-spectrum` wrappers for Form, text/search/number fields, checkbox/radio/switch controls, and meter/progress indicators.
- Added `depth-audits/forms-fields-controls.md` with the remaining form-control findings and proof queue.

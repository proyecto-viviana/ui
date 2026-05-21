# Known Defects And Regression Protection

Use this gate before acceptance and whenever a component was previously marked
accepted under an older gate model. The goal is to prevent known behavioral,
styling, layout, accessibility, API, i18n, lifecycle, or harness bugs from
being hidden by broad status labels.

## Search

Check the component-specific surface:

```bash
rg -n "<Component>|<slug>|TODO|FIXME|skip|fail|blocker|gap|accepted|partial" \
  apps/comparison/playbook/components apps/comparison/e2e packages
vp run comparison:report:gaps
vp run comparison:report:exports
```

Also check:

- current component validation notes and pre-pass notes;
- incoming cross-component findings;
- skipped or failing focused specs;
- open blocker rows and deferred-gap rows;
- user-observed UI bugs from the current pass;
- component README status and manifest/page status.

## Classification

Every finding needs one class:

- `port bug`: Solid differs from installed upstream source or current React.
- `upstream drift`: installed React/S2 changed from prior docs or expectations.
- `harness bug`: route, fixture, timing, environment, or assertion is wrong.
- `threshold debt`: behavior is acceptable for this pass, but evidence is too
  coarse or thresholded to be a strict acceptance gate.
- `out-of-scope`: real issue, but outside this component pass, with an owner.
- `unrelated family failure`: belongs to a different component note.

Known `port bug` and unresolved `harness bug` findings block acceptance.

## Regression Evidence

A fixed user-visible bug needs a durable assertion in the owning layer:

- package test for API, state, ARIA, refs, events, and utility behavior;
- Playwright/runtime test for interaction, focus, forms, overlays, portals, and
  cleanup;
- computed-style or CSS-variable assertion for token and style branches;
- geometry assertion for layout, placement, clipping, overflow, grid math, and
  responsive behavior;
- accessibility assertion for roles, names, descriptions, values, ARIA
  references, keyboard, focus, announcements, and i18n;
- strict pair evidence only when visual output is the contract being proven.

Inspection-only fixes do not close this gate for user-visible bugs.

## Scenario Smoke

Exercise canonical user scenarios where upstream supports them:

- open, select, close, and dismiss;
- keyboard navigation across boundaries;
- disabled, read-only, invalid, required, and pending suppression;
- controlled value updates and uncontrolled defaults;
- form submit, reset, hidden values, and validation;
- overlay mounting, placement, dismissal, focus return, and cleanup;
- locale, direction, calendar system, number/date formatting, and messages.

## Composition Smoke

Check expected component ecosystem usage:

- `Provider` and theme/locale/direction inheritance;
- `Form`, field wrappers, labels, help text, and error text;
- slots, child components, icons, images, avatars, and text wrappers;
- collection items, groups, overlays, portals, and contextual help;
- cross-component contexts this component provides to another component.

## Validation Note Table

```md
| Finding source | Defect or risk | Class | Blocking? | Regression evidence or owner |
| -------------- | -------------- | ----- | --------- | ---------------------------- |
|                |                |       |           |                              |
```

Mark unresolved rows with `defect-blocker`.

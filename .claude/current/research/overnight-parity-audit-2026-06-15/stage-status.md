# Stage status — breadth map vs depth audit

## Answer

Yes: the first committed pack was the **breadth mapping stage**, not the completed depth-first line-by-line audit.

## What is done

- All 69 official S2 catalogue entries have a generated source-map row.
- Each component has an audit seed file with local source candidates, upstream S2 candidates, comparison route/note/test seeds, and the required audit axes.
- Global report findings are captured: strict parity report green; gap report still shows 56/349 strict pair-diff states; export report still shows 22 missing non-root/support S2 exports and 69 extra Solid exports.

## What is not done yet

- The per-component files are not yet line-by-line upstream-vs-local audits.
- The source maps are automated seeds and need human/agent validation for compound components whose names do not map one-to-one.
- The audit has not yet classified every upstream branch across API, ARIA, keyboard/focus, forms/validation, behavior/timing, styling, visual parity, i18n, HTML structure, library usage, and internal architecture.

## Depth-first continuation protocol

For each component family:

1. Read upstream S2 source first.
2. Read lower-layer upstream sources next: React Aria Components, React Aria, React Stately, and external standards/docs where relevant.
3. Read local source in layer order: `solid-stately`, `solidaria`, `solidaria-components`, `solid-spectrum`, `viviana-ui`.
4. Record exact equivalencies and deltas in the component seed file or a family detail file.
5. Mark findings as `parity-gap`, `test-gap`, `architecture-risk`, `documented-local-addition-needed`, `harness-gap`, `upstream-drift`, or `needs-owner-decision`.
6. Do not change implementation code during this research pass.

## 2026-06-15 continuation note — xhigh depth work started

After owner feedback, this branch remained on `work` and the audit continued as PR work rather than `main` work. The pack now distinguishes breadth mapping from depth certification: breadth mapping is complete enough to seed work, but certification is still blocked until every listed finding has source-linked proof and failing tests.

New depth slices added in this continuation:

- `external-standards-obligations.md` records APG/WAI-ARIA/WCAG obligations that must be checked in each component audit.
- `depth-audits/overlay-menu-feedback.md` records overlay/menu/feedback findings such as Menu keyboard close policy, ContextualHelp arrow/labelling, Popover/Dialog portal locale, and Toast focusability.
- `depth-audits/date-color-controls.md` records date/time/color findings such as invalid-message fallback, hard-coded labels, ColorArea duplicate ids, and DateRangePicker time-edit risks.
- `depth-audits/provider-content-layout.md` records Provider, CardView, Breadcrumbs, RangeSlider, SegmentedControl, and primitive findings.
- `depth-audits/collections-tabs-tags.md` records collection virtualization, Picker/ComboBox, TagGroup, Tabs, and button-family follow-up findings.
- `depth-audits/forms-fields-controls.md` records the resumed form-control pass for Form, text/search/number fields, checkbox/switch/radio controls, and meter/progress indicators.

# Component Validation Notes

This directory holds one validation notes file per component pass. Start from
[`../component-validation-notes-template.md`](../component-validation-notes-template.md)
and keep each file scoped to one component or one explicitly named component
family.

It is valid to create a short pre-pass note before a full component pass starts
when another component exposes a real cross-component contract. Keep those notes
under `Incoming Cross-Component Findings` so the later owner validates the
contract instead of rediscovering it.

## Gate Normalization Status

The acceptance gates were expanded after the first retro-audit sweep. Existing
implemented/pass notes keep their historical evidence, but they should be
treated as legacy accepted under the prior playbook until each note is
normalized to the current gate checklist.

- Current accepted under the full gate model: Calendar, Checkbox, ColorArea,
  ColorField, ColorSlider, ColorWheel, ColorSwatch, ColorSwatchPicker,
  Disclosure, Icons, Illustrations, IllustratedMessage, InlineAlert, ListView,
  Popover, TagGroup, Toast, ToggleButton, ToggleButtonGroup, Tooltip.
- Current-gate normalized before the known-defect/regression gate: Accordion,
  ActionBar, ActionMenu, Avatar, AvatarGroup, Badge, Breadcrumbs, Button,
  Button family, CheckboxGroup, ComboBox, ContextualHelp, Divider, Form, Image,
  Link, Meter, NotificationBadge, ProgressBar, ProgressCircle, RangeCalendar,
  RangeSlider, SegmentedControl, SelectBoxGroup, Skeleton, Slider, StatusLight,
  and Text.
- Accepted prior to the current known-defect/regression gate: Accordion,
  ActionBar, ActionMenu, Avatar, AvatarGroup, Badge, Breadcrumbs, Button,
  Button family, CheckboxGroup, ComboBox, ContextualHelp, Divider, Form, Image,
  Link, Meter, NotificationBadge, ProgressBar, ProgressCircle, RangeCalendar,
  RangeSlider, SegmentedControl, SelectBoxGroup, Skeleton, Slider, StatusLight,
  and Text.
- Active current-gate pass: none selected.
- Comparison-live with explicit release-hardening backfill gaps: Card/CardView.
- Pre-pass only: none.

Current-gate normalization means the note contains the current
`Acceptance Gate Checklist`, `Agent Workflow`, `Behavior State Machine`,
`Accessibility And I18n`, `Style Source-To-Computed`, and
`Known Defects And Regression Protection` sections. Until then, do not use a
legacy accepted note as proof that the component passed the current gate model.

Future component passes should not need a legacy-normalization section. Run the
playbook in order, close in-scope gates before moving on, and mark a component
partial if any gate remains unresolved.

## Strict Component Parity Audit

Run `vp run comparison:report:parity` before claiming catalogue parity. The
audit checks official S2 catalogue coverage against the comparison manifest,
sidebar grouping, live styled fixtures, modeled viewer controls, validation
notes, and current visual/asserted evidence.

Current snapshot:

- Route/sidebar/fixture coverage: 69/69 official S2 catalogue entries.
- Modeled viewer controls: 66/69 entries. Missing control groups: Provider,
  TableView, and TreeView.
- Validation notes: 58/69 entries. Missing notes: DropZone, NumberField,
  Picker, Provider, RadioGroup, SearchField, Switch, TableView, TextArea,
  TextField, and TreeView.
- Current visual/asserted evidence: 67/69 entries. Missing evidence: TableView
  and TreeView.

React Spectrum S2 documents the icon route as `Icons`; the comparison slug is
`icons`. Icons and Illustrations now have modeled controls and strict primitive
visual/contract coverage; remaining gaps are listed above.

## Files

- [Accordion](./accordion-validation-notes.md)
- [ActionBar](./actionbar-validation-notes.md)
- [ActionMenu](./actionmenu-validation-notes.md)
- [Avatar](./avatar-validation-notes.md)
- [AvatarGroup](./avatargroup-validation-notes.md)
- [Badge](./badge-validation-notes.md)
- [Button](./button-validation-notes.md)
- [Button family](./button-family-validation-notes.md)
- [Calendar](./calendar-validation-notes.md)
- [Card/CardView](./card-cardview-validation-notes.md)
- [Checkbox](./checkbox-validation-notes.md)
- [CheckboxGroup](./checkboxgroup-validation-notes.md)
- [ColorArea](./colorarea-validation-notes.md)
- [ColorField](./colorfield-validation-notes.md)
- [ColorSlider](./colorslider-validation-notes.md)
- [ColorWheel](./colorwheel-validation-notes.md)
- [ColorSwatch](./colorswatch-validation-notes.md)
- [ColorSwatchPicker](./colorswatchpicker-validation-notes.md)
- [ComboBox](./combobox-validation-notes.md)
- [ContextualHelp](./contextualhelp-validation-notes.md)
- [Disclosure](./disclosure-validation-notes.md)
- [Divider](./divider-validation-notes.md)
- [Form](./form-validation-notes.md)
- [Image](./image-validation-notes.md)
- [Icons and Illustrations](./icon-illustration-validation-notes.md)
- [IllustratedMessage](./illustratedmessage-validation-notes.md)
- [InlineAlert](./inlinealert-validation-notes.md)
- [Link](./link-validation-notes.md)
- [ListView](./listview-validation-notes.md)
- [Meter](./meter-validation-notes.md)
- [NotificationBadge](./notificationbadge-validation-notes.md)
- [Popover](./popover-validation-notes.md)
- [ProgressBar](./progressbar-validation-notes.md)
- [ProgressCircle](./progresscircle-validation-notes.md)
- [RangeCalendar](./rangecalendar-validation-notes.md)
- [RangeSlider](./rangeslider-validation-notes.md)
- [Skeleton](./skeleton-validation-notes.md)
- [SegmentedControl](./segmentedcontrol-validation-notes.md)
- [SelectBoxGroup](./selectboxgroup-validation-notes.md)
- [Slider](./slider-validation-notes.md)
- [StatusLight](./statuslight-validation-notes.md)
- [Tabs](./tabs-validation-notes.md)
- [TagGroup](./taggroup-validation-notes.md)
- [Text](./text-validation-notes.md)
- [Toast](./toast-validation-notes.md)
- [ToggleButton](./togglebutton-validation-notes.md)
- [ToggleButtonGroup](./togglebuttongroup-validation-notes.md)
- [Tooltip](./tooltip-validation-notes.md)

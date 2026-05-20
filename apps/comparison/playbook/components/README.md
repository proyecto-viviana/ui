# Component Validation Notes

This directory holds one validation notes file per component pass. Start from
[`../component-validation-notes-template.md`](../component-validation-notes-template.md)
and keep each file scoped to one component or one explicitly named component
family.

It is valid to create a short pre-pass note before a full component pass starts
when another component exposes a real cross-component contract. Keep those notes
under `Incoming Cross-Component Findings` so the later owner validates the
contract instead of rediscovering it.

## Current-Gate Normalization Status

The acceptance gates were expanded after the first retro-audit sweep. Existing
implemented/pass notes keep their historical evidence, but they should be
treated as legacy accepted under the prior playbook until each note is
normalized to the current gate checklist.

- Legacy accepted under prior playbook: AvatarGroup, Badge, Button, Button
  family, Divider, Form, Image, Link, Meter, Skeleton, and StatusLight.
- Current-gate normalized: ActionBar, Avatar, SegmentedControl, and
  SelectBoxGroup.
- Active current-gate pass: none.
- Comparison-live with explicit release-hardening backfill gaps: none.
- Pre-pass only: Accordion, Text, and NotificationBadge.

Current-gate normalization means the note contains the current
`Acceptance Gate Checklist`, `Agent Workflow`, `Behavior State Machine`,
`Accessibility And I18n`, and `Style Source-To-Computed` sections. Until then,
do not use a legacy accepted note as proof that the component passed the current
gate model.

Future component passes should not need a legacy-normalization section. Run the
playbook in order, close in-scope gates before moving on, and mark a component
partial if any gate remains unresolved.

## Files

- [Accordion](./accordion-validation-notes.md)
- [ActionBar](./actionbar-validation-notes.md)
- [ActionMenu](./actionmenu-validation-notes.md)
- [Avatar](./avatar-validation-notes.md)
- [AvatarGroup](./avatargroup-validation-notes.md)
- [Badge](./badge-validation-notes.md)
- [Button](./button-validation-notes.md)
- [Button family](./button-family-validation-notes.md)
- [ContextualHelp](./contextualhelp-validation-notes.md)
- [Divider](./divider-validation-notes.md)
- [Form](./form-validation-notes.md)
- [Image](./image-validation-notes.md)
- [Link](./link-validation-notes.md)
- [Meter](./meter-validation-notes.md)
- [NotificationBadge](./notificationbadge-validation-notes.md)
- [RangeCalendar](./rangecalendar-validation-notes.md)
- [Skeleton](./skeleton-validation-notes.md)
- [SegmentedControl](./segmentedcontrol-validation-notes.md)
- [SelectBoxGroup](./selectboxgroup-validation-notes.md)
- [StatusLight](./statuslight-validation-notes.md)
- [Text](./text-validation-notes.md)
- [Toast](./toast-validation-notes.md)
- [ToggleButton](./togglebutton-validation-notes.md)
- [ToggleButtonGroup](./togglebuttongroup-validation-notes.md)
- [Tooltip](./tooltip-validation-notes.md)

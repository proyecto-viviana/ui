# Component Validation Notes

This directory holds one validation notes file per component pass. Start from
[`../component-validation-notes-template.md`](../component-validation-notes-template.md)
and keep each file scoped to one component or one explicitly named component
family.

It is valid to create a short pre-pass note before a full component pass starts
when another component exposes a real cross-component contract. Keep those notes
under `Incoming Cross-Component Findings` so the later owner validates the
contract instead of rediscovering it.

## Retro-Audit Status

All existing implemented/pass notes now state their acceptance boundary:

- Playbook-accepted for owned behavior: Avatar, AvatarGroup, Badge, Button,
  Button family, Divider, Link, Meter, Skeleton, and StatusLight.
- Comparison-live with explicit release-hardening backfill gaps: Image and Form.
- Pre-pass only: Text and NotificationBadge.

Future component passes should not need a retro-audit section. Run the playbook
in order, close in-scope gates before moving on, and mark a component partial if
any gate remains unresolved.

## Files

- [Avatar](./avatar-validation-notes.md)
- [AvatarGroup](./avatargroup-validation-notes.md)
- [Badge](./badge-validation-notes.md)
- [Button](./button-validation-notes.md)
- [Button family](./button-family-validation-notes.md)
- [Divider](./divider-validation-notes.md)
- [Form](./form-validation-notes.md)
- [Image](./image-validation-notes.md)
- [Link](./link-validation-notes.md)
- [Meter](./meter-validation-notes.md)
- [NotificationBadge](./notificationbadge-validation-notes.md)
- [Skeleton](./skeleton-validation-notes.md)
- [StatusLight](./statuslight-validation-notes.md)
- [Text](./text-validation-notes.md)

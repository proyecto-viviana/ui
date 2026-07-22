---
"@proyecto-viviana/ui": minor
---

Ship the register's nine-role type ladder as a public API. New `typeRoles` export (with the `TypeRole` type) exposes one precompiled class per role — display, title, headline, label, body, meta, micro, terminal, button — at the register's exact metrics, usable through any `styles` prop or as a plain class. Heading levels 1–3 now render the display/title/headline tiers verbatim (28/20/15px with the inverted 500/600/700 weight ladder and +0.01em pixel-face tracking); h4+ share the headline rung. Standalone `Text`, `Content`, and `Keyboard` bake the meta, body, and terminal roles respectively — only when no slotted context claims them, so composed hosts (Button, MenuItem, Card…) are byte-identical to before. The style theme gains a `semi-bold` (600) font weight and a `letterSpacing` property (0/0.01em/0.1em) to make the ladder expressible.

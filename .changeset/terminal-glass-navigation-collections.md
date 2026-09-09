---
"@proyecto-viviana/ui": minor
---

Port the Terminal Glass register into navigation and collections.

Tabs gains a `terminal` variant — a matte, dithered command strip with a filled
chip on the active tab and no sliding indicator — and `TabList` gains a
`trailing` slot for the strip's flush-right readout. ListView rows move to the
register's 9px/12px box with a 6px corner and a leading `>` mark that fades in
on the hovered, focused or selected row. Breadcrumbs read as a shell path: mono
segments, `/` separators, the walkable ones on the structure channel.
TreeView, Disclosure and Accordion drop their chevron icons for the same
rotating `>` mark. StepList swaps the numbered bubble for channel marks
(`✓ / > / ░`) and keeps the step number in the accessible name. Standalone
links hold their underline back until hover or focus; inline links keep it.
Toolbar and ActionBar sit in the same matte well as the terminal tab strip.

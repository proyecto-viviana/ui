---
"@proyecto-viviana/ui": minor
---

The Glasselated pixel icon set and the register's two Tabs navigation forms. 34 new `Pixel*Icon` components (pixel-art SVGs from the design lane, createIcon-wrapped, each with its own build entry). Tabs gains `variant?: "line" | "pill"`: pill is the mobile tab bar — a full-radius glass capsule spreading column-flex slots (pixel icon stacked over a 10px micro label) space-around, with no selection indicator and no overflow collapse. Vertical tabs become the register rail: the indicator gives way to a mono ">" caret that ghosts in on hover and pins on the active row, rows sit on a flat 32px floor with 12px semi-bold labels, and a `NotificationBadge` child now parks flush right via a badge slot (`order: 2`, `marginStart: auto`).

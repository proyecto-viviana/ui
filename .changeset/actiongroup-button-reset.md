---
"@proyecto-viviana/ui": patch
---

ActionGroup items now paint correctly: the headless layer renders each item as a bare button with no class hook, so the UA button chrome (opaque ButtonFace fill, 2px outset border) painted around the styled span — burying the transparent resting state under grey lozenges and clipping the selected accent pill. The container now ships a css() reset for its direct-child buttons.

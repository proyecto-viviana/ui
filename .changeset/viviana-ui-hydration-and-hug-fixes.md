---
"@proyecto-viviana/ui": patch
---

Fix the Tree hydration abort ("Unable to find DOM nodes for hydration key"): a repeated `children`-prop read re-instantiated item content on the server, shifting every hydration key past the first item and killing the whole route. Standalone components now hug their content instead of stretching in grid or column-flex parents (ActionGroup, Toolbar, Card — `height: 100%` is now CardView-only). ColorEditor sizes its headless ColorArea/ColorSlider parts, which ship gradients but no dimensions. AssetCard previews give icons the square illustration treatment, scoped to the preview slot. Bespoke StepList Step children keep the flex-row list layout.

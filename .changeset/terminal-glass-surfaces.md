---
"@proyecto-viviana/ui": minor
---

Terminal Glass surfaces: card, well, image.

`CardPreview` takes a `tag` — the media card's corner stamp, drawn on a blurred
scrim above the preview's clip so it can sit over cover art. `AssetCard` crops its
asset to the register's fixed 110px cover band instead of letterboxing it into a
square. The signal card takes the yellow detail edge, so it reads as one yellow
object rather than a neutral card with a yellow interior — fuchsia stays reserved
for the filled ask.

`Well` gains `tone` (`well` | `deep`) and `size` (`S` | `M`): the deep plate is the
darker surface the nav and tutor wells sit on, and `S` is the 8px container inset
for wells holding rows that pad themselves. Both are matte, both keep the scan
dither.

`Image` gains `isPixelated`, which resamples with nearest neighbour so low-resolution
pixel thumbs stay blocks when scaled up.

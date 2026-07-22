---
"@proyecto-viviana/ui": patch
---

Restyle TabSwitch to the Glasselated raised-pill idiom and make it actually paint: the native button chrome (opaque ButtonFace fill, 2px outset border) was covering the sliding indicator, leaving the selected label as white text on a bare UA lozenge — illegible in light. Buttons now reset UA chrome; the track is the inset glass surface with a subtle border; the indicator is the raised surface with the edge-glass rim; inks are secondary/primary instead of white-on-accent, matching the island's segmented pill.

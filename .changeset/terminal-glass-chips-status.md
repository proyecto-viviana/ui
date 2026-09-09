---
"@proyecto-viviana/ui": minor
---

Terminal Glass: chips and status readouts.

Badge gets the stamp's own geometry (4px 9px, mono tracking) and its channel inks —
`notice` and `negative` now paint from `--status-signal` / `--status-fault` instead of
the nearest ramp stop, and the subtle fills are mixed from the channel's own colour.
StatusLight dots and Meter fills move onto the same four channel tokens, so a fault dot,
a fault badge and a fault meter are one red; `positive` stays on the library's green.
Meter gains a `metric` variant (local addition) and an 8px default track.

ProgressBar picks up the register's 8px track and two local additions: `trackStyle`
`"bar" | "bracket"`, where the bracket draws the value as the mono readout
`[▮▮▮▮▯▯▯▯▯▯]` for rows inside a terminal well, and `segments`, an array of relative
weights that cuts the track into chapters the fill (and the `pendingValue` dither) flows
across. Indeterminate progress always draws the sweeping bar.

Tag chips take the well's ink: `--terminal-dim` at rest, `--terminal-fg` plus an accent
edge on hover, in place of the fill swap off the neutral ramp.

Three measured AA fixes fell out of the same pass: the bold `metric` badge takes white ink
on its light-column cyan (black measured 4.30:1) and black on the dark one, the bold
`neutral`/`gray` fill drops to gray-200 in dark (white on gray-300 was 4.17:1), and the
subtle `accent`/`informative` ink sinks a stop to blue-1000 (the link blue on its own
tinted plate was 4.14:1).

---
"@proyecto-viviana/solid-spectrum": minor
---

Surface `CenterBaseline` as a public export

`CenterBaseline` is now exported from the package root and from a dedicated
`@proyecto-viviana/solid-spectrum/CenterBaseline` subpath, mirroring
`@react-spectrum/s2`'s promotion of the component to a documented public
export. It was previously internal-only (consumed by radio/calendar/color/
searchfield/picker). The `centerBaseline` factory and `centerBaselineBefore`
helper stay internal, matching upstream's public surface.

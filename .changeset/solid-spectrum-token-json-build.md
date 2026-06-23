---
"@proyecto-viviana/solid-spectrum": patch
---

Avoid materializing the full upstream Spectrum token JSON as a TypeScript literal
during declaration emit.

The style layer still imports Adobe's `@adobe/spectrum-tokens` JSON at runtime,
but the build tsconfig now resolves that JSON to a compact declaration file. This
keeps generated token values faithful to upstream while preventing
`tsc -p tsconfig.build.json` from stalling in the comparison build.

---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/kumo": patch
---

Move package build configuration into Vite+'s supported `vite.config.ts` `pack`
block so builds emit every declared public entry instead of silently falling
back to a single default `index.mjs` bundle.

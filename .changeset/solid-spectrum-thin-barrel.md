---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Thin the solid-spectrum `.` barrel and serve the JSX-free style modules as `.js`

`solid-spectrum`'s `dist/index.jsx` re-exported the whole library inline (~520 KB)
and the JSX-free `dist/style/index.jsx` weighed ~1.26 MB — both over the 500 KB
Babel `compact` deopt threshold. Any consumer of the `@proyecto-viviana/ui` root
barrel (which re-exports solid-spectrum) therefore tripped the Solid-compiler
"code generator has deoptimised … exceeds 500KB" warning, even though the two
lower packages were already split (UC-05).

The build now promotes every barrel re-export target to its own entry, so
`dist/index.jsx` is a thin re-export (~11 KB) and the largest emitted `.jsx` is
~54 KB. `src/icon/index.tsx` stays inlined on purpose so its unused 410-icon
`s2wfIcons` namespace tree-shakes away rather than being rooted by an entry.
`./style` and `./style/runtime` carry no Solid template code, so their `solid`
export condition now points at the prebuilt `.js` (the `.jsx` is no longer
emitted) — the `style()` macro still expands at the consumer build. No public
export was removed; this is internal build shape plus a condition change, so
existing imports keep working — a root-barrel `@proyecto-viviana/ui` import now
builds with no deopt warning.

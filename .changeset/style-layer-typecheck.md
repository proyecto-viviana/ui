---
"@proyecto-viviana/solid-spectrum": patch
---

Typecheck the style layer: drop `@ts-nocheck` from the six `style/` files

The styled layer (`tokens.ts`, `spectrum-theme.ts`, `style-macro.ts`,
`index.ts`, plus the runtime/types helpers) shipped under `@ts-nocheck`, so the
whole macro/token surface was excluded from `tsc`. Removing the directive
surfaces the type errors our stricter config catches that upstream's tsconfig
silently suppresses: upstream sets `noImplicitAny: false`, which mutes every
`TS7053` string-index and `TS7006` implicit-any-parameter site; we run
`strict: true`.

Each surfaced site is reconciled faithfully rather than re-suppressed
file-wide:

- The implicit-`any` index lookups (font-size index map, base-color mapping,
  property/condition/value tables in the style macro) get minimal
  loose-lookup casts at the access point. Every one is already runtime
  null-checked, so this mirrors upstream's effective `any` semantics without
  loosening behavior.
- `tokens.ts` no longer self-references its own `default` key: the
  `import * as` namespace carries a synthetic `default` (esModuleInterop), so
  the token key space now excludes it (`Exclude<keyof …, "default">`), fixing
  the `TS2345` that the previous `default`-unwrap ternary introduced.
- The three `process.env` reads (`runtime.ts`, `style-macro.ts`,
  `spectrum-theme.ts`) now go through the build-safe `globalThis` cast already
  used in `image/` and `statuslight/`, instead of the bare `typeof process`
  form. `tsconfig.typecheck.json` declares `types: ["node"]` but the dts build
  (`tsconfig.build.json`) does not, so the bare form type-checked but broke the
  declaration emit with `TS2591: Cannot find name 'process'`.

No runtime or API change — the emitted CSS and token values are identical; the
layer is now covered by `vp run typecheck` and the dts build (`tsc -p
tsconfig.build.json`).

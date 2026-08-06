---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/ui": patch
"@proyecto-viviana/solid-spectrum": patch
---

Fix Form SSR hydration: do not reify `props.children` into FormContext.

Solid's `props.children` is a create-on-read getter. Spreading full Form props into FormContext (safe in React Aria Components) double-created the child tree and desynced `createUniqueId` hydration keys — Form + sole Spectrum Button blanked consumer routes (effect-latam /perfil, /foros). Context now carries only `validationBehavior`. Spectrum / viviana-ui Form leave children as lazy headless props (no forced render-prop wrapper). Guarded by Form SSR + hydrate fixtures.

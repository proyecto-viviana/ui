---
"@proyecto-viviana/solidaria": patch
---

createInteractionModality: patch `HTMLElement.prototype.focus` via `defineProperty`

`setupGlobalFocusEvents` and its teardown now install the focus-tracking patch
with `Reflect.defineProperty({configurable, writable, value})` instead of plain
assignment, mirroring `@react-aria/interactions` `useFocusVisible`. When `focus`
has been replaced with a getter-only accessor — e.g. by a test library's
`setup()` — plain assignment throws, so our previous `try`/`catch` swallowed the
error and silently skipped the patch (`canOverride = false`), degrading modality
tracking for programmatic `focus()` calls. `defineProperty` installs the wrapper
without throwing and returns `false` rather than throwing in the pathological
non-configurable case, so the obsolete `canOverride` bookkeeping is removed.

---
"@proyecto-viviana/solid-spectrum": patch
---

Fields: add a custom `prefix` slot (port of upstream S2 field prefixes)

Upstream S2 hosts `prefix?: ReactNode` on the shared `FieldGroup`
(`s2/src/Field.tsx`) — a baseline-aligned visual rendered before the input,
associated to the input via a `prefixId` appended to `aria-labelledby`. It is
threaded into `ColorField`, `ComboBox`, `NumberField`, and `TextField`
(prefix-only; there is no `suffix`).

We have no shared `FieldGroup` — each field composes its own group/input from
its headless context — so the port adds a small shared helper
(`field/prefix.tsx`): `FieldPrefix` renders the prefix in a baseline-centered,
icon-styled container with a stable `id`, and `PrefixInputProvider` re-provides
the field's own context through a proxy that appends that `id` to the input's
`aria-labelledby` (preserving reactivity and each context's `inputProps` shape).
`CenterBaseline` gained an optional `id`. Each of the four fields now accepts
`prefix?: JSX.Element`; with no prefix the render path is unchanged.

4 new tests (one per field) assert the prefix renders before the input and is
referenced by the input's `aria-labelledby`.

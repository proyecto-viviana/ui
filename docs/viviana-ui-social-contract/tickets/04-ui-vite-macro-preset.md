# Ticket: `ui-vite-macro-preset`

## Goal

Provide one supported Vite macro setup for apps that author
`@proyecto-viviana/ui/style` calls.

## Problem

The UI package build can pre-expand macros for components it ships, but it cannot
pre-expand app-authored macro calls. Social apps import
`@proyecto-viviana/ui/style` with `{ type: "macro" }`, so their Vite configs must
run the macro plugin. Today the apps carry a copied `s2Macros()` wrapper and
explicit internal package exclusions.

## Scope

- Add a documented `@proyecto-viviana/ui/vite` export or equivalent package-local
  helper that returns the macro plugin wrapper used by `solid-spectrum`.
- Keep the helper focused: macro CSS resolution/loading and import stripping only.
- Document required plugin order relative to TanStack Start, Solid, and Cloudflare.
- Decide which dependency optimization exclusions are truly app-owned and which
  can be hidden behind the helper or a documented array.

## Out Of Scope

- Replacing Vite+ or TanStack Start app setup.
- Removing the need for macros in apps that use app-authored `style()` calls.

## Acceptance Criteria

- Apps can import a supported helper instead of copying the macro wrapper.
- The docs clearly say: built UI components do not require app macro expansion,
  but app-authored `style()` calls do.
- A small fixture or test proves app-authored `@proyecto-viviana/ui/style` macro
  calls generate/load CSS in both DOM and SSR build contexts.
- Companion social-app migration can remove duplicated macro wrapper code from
  `pokeforos` and `bord`.

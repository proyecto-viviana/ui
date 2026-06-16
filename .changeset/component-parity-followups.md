---
"@proyecto-viviana/solid-spectrum": patch
---

Parity fixes: Breadcrumbs current item as div, ContextualHelp no arrow, Disclosure role passthrough

**solid-spectrum / Breadcrumbs**: pass `elementType="div"` for the current (last) breadcrumb item so the headless layer renders a non-interactive `<div>` instead of an `<a>`. Upstream React Spectrum S2 `Breadcrumbs.tsx` renders the current item as a `<div>` and non-current items as `<Link>` — our headless `BreadcrumbItem` was defaulting to `<a>` for every item including the current one.

**solid-spectrum / ContextualHelp and ContextualHelpPopover**: add `hideArrow` to the `<Popover>` in both components. Upstream React Spectrum S2 `ContextualHelp.tsx` uses `<ContextualHelpPopover hideArrow>` — the contextual help popover is a plain card with no directional arrow tip.

**solid-spectrum / DisclosurePanel**: stop stripping the `role` prop with `splitProps` before forwarding to `HeadlessDisclosurePanel`. Upstream react-aria-components `DisclosurePanel` accepts a `role` prop that allows callers to override the default `role="group"` (e.g. `role="region"` for a landmark). Stripping the prop silently prevented this override.

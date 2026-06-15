---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Depth audit slice: provider, content, layout, and visual primitives

## Scope and authority

This slice records the first xhigh read-only pass for `Provider`, `Avatar`, `AvatarGroup`, `Badge`, `Breadcrumbs`, `Card`, `CardView`, `Divider`, `DropZone`, `Icons`, `Illustrations`, `IllustratedMessage`, `Image`, `InlineAlert`, `Skeleton`, `Slider`, `RangeSlider`, `SegmentedControl`, and `StatusLight`. It is a findings queue and must not be read as certification.

## Findings

### PCL-001 — Provider is partial/tracked, not source-equivalent

Local Provider has a broader local inheritance model and emits local data attributes, but misses upstream S2 branches including router propagation, `elementType`, DOM filtering, `UNSAFE_className`/`UNSAFE_style`, font injection, and the `html` element default-background behavior. Certification needs tests for nested overrides, `lang`/`dir`, router propagation, DOM filtering, font injection, and `elementType="html"` defaults.

### PCL-002 — Card and CardView are structurally partial

Local Card/CardView still carry `// @ts-nocheck` in important paths and do not match upstream GridList/CardView architecture. Local CardView renders a non-virtualized headless collection wrapper; upstream S2 uses Virtualizer/layout support, load-more rows, empty state branches, action-bar scroll padding, controlled selection interception, navigable cards, waterfall layout, and richer keyboard/focus behavior.

### PCL-003 — Breadcrumbs rich-overflow and current-item DOM need proof

Local Breadcrumbs mostly match the surface but overflow menu construction converts collapsed items to text labels, while upstream preserves original child props/rendering for menu mode. The current breadcrumb DOM shape also differs: local removes `href` and adds `aria-current`/`aria-disabled`; upstream uses a different non-link current content shape. Tests need rich child/custom prop overflow, render-prop menu mode, and current-item DOM/accessibility snapshots.

### PCL-004 — RangeSlider has an i18n bug and a layer-boundary problem

Upstream localizes range thumb labels with minimum/maximum slider strings. Local RangeSlider hardcodes `Minimum` and `Maximum`. More broadly, RangeSlider hand-rolls state, pointer capture, keyboard handling, slider roles/ARIA, and hidden inputs in `solid-spectrum`, contrary to the repo architecture that behavior belongs in lower layers.

### PCL-005 — Slider is closer but still needs type and AT proof

Single Slider delegates more behavior to lower layers and is closer to the desired architecture, but still carries type suppression and needs pointer, focus, hover, pressed, forced-colors, RTL, touch-AT, and screen-reader transcript proof.

### PCL-006 — SegmentedControl forced-colors and keyboard evidence are incomplete

SegmentedControl is close structurally, but upstream item text and selected indicator include forced-colors branches that local styling does not fully mirror. Existing evidence should be extended with arrow-key behavior, accessible role/name/state snapshots, RTL behavior, and forced-colors computed contracts.

### PCL-007 — Accepted/near-accepted primitives still need local-addition classification

Avatar, AvatarGroup, Badge, Divider, DropZone, Icons, Illustrations, IllustratedMessage, Image, InlineAlert, Skeleton, and StatusLight are comparatively close. Remaining debt is mostly classification and evidence: legacy aliases/fallbacks, local icon/illustration wrappers, Image `fetchpriority` casing nuance, DropZone edge paths (`getDropOperationForPoint`, invalid/cancelled, paste, activation timers), and strict pair/forced-colors proof for each observable state.

## Priority proof queue

1. Provider API and portal/root behavior tests for router, elementType, unsafe props, filtering, fonts, and nested locale/direction.
2. CardView virtualization/load-more/empty/actionbar/waterfall/navigable-card tests before any certification claim.
3. RangeSlider localization fix and lower-layer behavior migration plan.
4. Breadcrumb overflow rich-child and current-item DOM tests.
5. SegmentedControl forced-colors and keyboard tests.
6. DropZone full drag/paste/invalid/cancelled activation-timer tests.

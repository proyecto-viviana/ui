# Harness And Evidence Integrity

Use this after runtime semantics are proven and before visual evidence is used
for acceptance. The goal is to make failures diagnosable instead of treating
all red screenshots as component bugs.

## Evidence Authority

Record the evidence order for the pass:

1. Source-backed semantic and API behavior.
2. Interaction timelines and cleanup.
3. Computed styles, geometry, and accessibility snapshots.
4. Current React-vs-Solid pair diffs.

Do not accept a component based on per-side committed screenshot baselines. They
are intentionally not part of the acceptance hierarchy.

When a pass removes these gates, explicitly record any leftover committed
screenshot artifacts as repository hygiene: obsolete per-side PNG baselines,
snapshot directories, and report text that still describes committed screenshot
coverage. Do not let that cleanup replace current React-vs-Solid evidence.

## Harness Integrity Checks

Before trusting screenshots, prove or record:

- the focused suite was run before implementation when it existed;
- viewport, color scheme, direction, locale, and density are pinned;
- `document.fonts.ready` or an equivalent font-settling step runs before
  screenshots;
- animations, spinners, caret blinking, and progress indicators are frozen or
  waited into a stable frame;
- React and Solid screenshot captures cannot overlap or mutate shared page
  state concurrently;
- current React-vs-Solid pair assertions are used instead of per-side committed
  screenshot assertions;
- no focused acceptance spec still calls Playwright `toHaveScreenshot`,
  `toMatchSnapshot`, or a helper that wraps those APIs for React/Solid panels;
- obsolete committed screenshot PNGs and report wording are either cleaned up in
  this pass or listed as deferred repository hygiene;
- pointer, keyboard focus, open overlays, timers, and local storage are reset
  between visual states;
- screenshots include full focus rings, portals, popovers, and clipped content
  that are part of the target state;
- browser/device coverage is recorded as Chromium-only, cross-browser, mobile,
  or not applicable for the pass.

## Failure Taxonomy

Classify every focused-suite failure before changing code or snapshots:

- `port bug`: Solid differs from upstream source or current React behavior.
- `upstream drift`: installed React/S2 behavior changed from upstream source or
  documented contract.
- `harness bug`: the route, helper, timing, fonts, overlap, or environment made
  the evidence untrustworthy.
- `threshold debt`: current behavior is acceptable for this pass, but the
  visual threshold is too broad to be a strict acceptance gate.
- `unrelated family failure`: a related component failed in a broad focused
  family suite and is not part of the current component acceptance target.

## Acceptance Rules

- A component cannot be visually accepted while any `port bug` or unresolved
  `harness bug` remains.
- `upstream drift` requires recording the installed upstream version or source
  lines that explain the new behavior.
- `unrelated family failure` should be moved to the owning component notes or a
  separate remediation task instead of blocking the current component.

## Output

Record in the component validation notes:

- pre-change focused-suite status;
- harness changes made or confirmed;
- current pair-diff status;
- classified failure list;
- deferred repository cleanup for stale committed screenshot PNGs/report
  wording;
- browser/device coverage;
- whether pair diffs are strict acceptance evidence or thresholded review
  artifacts.

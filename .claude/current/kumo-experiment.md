---
kind: plan
status: current
tasks:
  - id: kumo-button-package-baseline
    title: Land the experimental Kumo Button package as a releasable workspace sibling
    state: in-progress
    roadmap: kumo-solid-experiment
    planned: { start: 2026-08-13, target: null }
  - id: kumo-button-pair-fixture
    title: Mount matched React and Solid Kumo Button fixtures in the comparison app
    state: in-progress
    depends: [kumo-button-package-baseline]
    roadmap: kumo-solid-experiment
    planned: { start: null, target: null }
  - id: kumo-button-behavior-evidence
    title: Prove the Kumo Button interaction and accessibility branches in a browser
    state: done
    finished: 2026-08-19
    depends: [kumo-button-pair-fixture]
    roadmap: kumo-solid-experiment
    planned: { start: 2026-08-19, target: 2026-08-19 }
    note: >-
      e2e/kumo-button.spec.ts 11/11 includes names, click, Enter/Space,
      disabled/loading, shared controls, form participation, callback
      refs, tab order/:focus-visible, and SSR plus first hydrated click.
      Solid fixture is JSX client:load. Dual-config package hydrate is
      not the authority — the Astro island is.
  - id: kumo-button-visual-evidence
    title: Prove the Kumo Button visual branches against the pinned React oracle
    state: done
    finished: 2026-08-19
    depends: [kumo-button-pair-fixture]
    roadmap: kumo-solid-experiment
    planned: { start: 2026-08-19, target: 2026-08-19 }
    note: >-
      e2e/kumo-button.spec.ts 15/15 twice. Rest + hover + pressed +
      keyboard-focus computed paint; primary hover/pressed/focus-visible
      pixels with measured channel threshold 1. Oracle :focus sets ring
      color only (ghost has no rest ring). Classified: extra transparent
      ring layers; 0-width rings; rounded-full vs 9999px; oklch/oklab
      serialization; unused outline-width when style is none.
  - id: kumo-landing-story
    title: Present all three styled libraries and the Kumo experiment on the root landing page
    state: in-progress
    depends: [kumo-button-package-baseline]
    roadmap: kumo-solid-experiment
    planned: { start: null, target: null }
  - id: kumo-site-release
    title: Qualify and deploy the Kumo-aware Viviana UI landing page
    state: open
    depends: [kumo-landing-story]
    roadmap: kumo-solid-experiment
    planned: { start: null, target: null }
  - id: kumo-sibling-proposal-sync
    title: Align the kumo-solidaria proposal with the Button pilot and repository boundary
    state: open
    depends: [kumo-button-package-baseline]
    roadmap: kumo-solid-experiment
    planned: { start: null, target: null }
  - id: kumo-pilot-review
    title: Review the Kumo Button evidence and decide whether the experiment continues
    state: open
    depends:
      - kumo-button-behavior-evidence
      - kumo-button-visual-evidence
      - kumo-site-release
      - kumo-sibling-proposal-sync
    roadmap: kumo-solid-experiment
    planned: { start: null, target: null }
---

# Kumo for Solid Experiment

Status: live plan for the first Kumo-on-Solid pilot and its public presentation.
Update when: a ticket changes state, the pinned Kumo source changes, evidence
lands, the public story changes, or the owner decides whether to continue.

## Outcome

Produce one honest, shareable result at
[`ui.proyectoviviana.org`](https://ui.proyectoviviana.org): a Viviana UI landing
page that explains the shared Solid foundation, presents its three standalone
styled libraries, and shows the first Kumo Button as an experiment.

The page must make the maturity difference explicit. Kumo is a styled sibling
of `solid-spectrum` and `@proyecto-viviana/ui`, but the initial Button does not
prove Kumo parity. The package is unpublished, incomplete, and expected to have
rough edges.

## Confirmed architecture and names

- The package name is `@proyecto-viviana/kumo`.
- `solidaria-components` is the reusable headless layer.
- `solid-spectrum`, `@proyecto-viviana/ui`, and `@proyecto-viviana/kumo` are
  standalone styled siblings built on that layer.
- The public Kumo API follows Kumo names where they differ from the headless
  API. For example, the styled Button uses `onClick` and `className`; consumers
  use `solidaria-components` directly for `onPress`, render props, slots, and
  data attributes.
- The implementation lives in this repository. `../kumo-solidaria` is the
  Cloudflare-facing proposal, review, and governance lane. It is not a runtime
  dependency and does not hold a second Solid implementation.
- The React oracle is the exact published `@cloudflare/kumo@2.11.0` package.
  A moving branch or the sibling repository is not the executable oracle.
- The 2.11.0 release changes Badge, LinkButton, Table, and Sidebar. Its Button
  source is unchanged from 2.10.0, so the Button pilot has no new implementation
  delta. Those other component changes are outside this one-component pilot.

## Dependency order

```text
KX-01 package baseline
  ├─ KX-02 paired comparison fixture
  │    ├─ KX-03 browser behavior evidence
  │    └─ KX-04 visual evidence
  ├─ KX-05 root landing story → KX-06 site qualification and deploy
  └─ KX-07 sibling proposal sync

KX-03 + KX-04 + KX-06 + KX-07 → KX-08 continue, pause, or delete decision
```

KX-03 and KX-04 can run in parallel after the paired fixture exists. The
landing can ship before parity evidence is complete because it reports the
evidence as incomplete; it must not imply that missing evidence passed.

## Ticket specifications

### KX-01 — Land the package baseline

**Task:** `kumo-button-package-baseline`

Turn the current `packages/kumo` implementation into a reviewable repository
baseline. Existing code is a candidate implementation, not proof that the
component is ported.

Scope:

- keep Kumo as a styled sibling that depends on `solidaria-components`;
- keep the first public slice limited to `Button` and its documented Kumo-shaped
  API;
- keep the source pin, Cloudflare MIT attribution, Changeset, build order,
  tarball pack, DOM/SSR smoke, and repository guards in the same change;
- document the unsupported surface, including tooltip `title`, `LinkButton`,
  `RefreshButton`, public `Loader`, `buttonVariants`, and React object refs;
- keep the npm registration/trusted-publisher requirement as a release blocker;
  do not publish as part of this ticket.

Acceptance:

- the package unit suite names real pointer, keyboard, disabled, loading, icon,
  shape, size, variant, ref, and attribute-forwarding failure modes;
- the built tarball exposes the root, Button deep import, CSS, types, Solid
  condition, DOM use, and SSR use;
- repository guards include the sixth releasable package without weakening an
  existing budget;
- the following commands pass:

  ```bash
  vp run build:kumo
  vp test run packages/kumo/test/Button.test.tsx
  vp run ui:smoke
  vp run test:ci-guard-contracts
  vp run ci:changesets
  git diff --check
  ```

### KX-02 — Build the paired Button fixture

**Task:** `kumo-button-pair-fixture`

Add one comparison-app route that mounts the real React Kumo Button and the
workspace Solid Kumo Button from the same fixture model. This route is evidence
infrastructure, not a styling source.

Scope:

- add `@proyecto-viviana/kumo` to the comparison app and its workspace build
  prerequisites;
- keep `@cloudflare/kumo` exact at `2.11.0` for the pilot;
- translate a shared fixture model into each framework's real API instead of
  making either component consume a test-only API;
- render variant, size, shape, icon, loading, disabled, light, and dark cases;
- identify each panel and state so Playwright can target it without depending
  on layout or CSS class implementation details;
- do not add Kumo component paint to `apps/comparison`.

Acceptance:

- the fixture renders both frameworks in development and production builds;
- changing a shared control updates both panels to the corresponding public
  API state;
- the route has no copied component CSS and no local values that override Kumo
  paint;
- comparison build and typecheck pass from a clean prerequisite build.

### KX-03 — Prove browser behavior

**Task:** `kumo-button-behavior-evidence`

Create paired browser tests for user-observable Button behavior. Axe can run as
smoke coverage, but it does not close this ticket.

Required branches:

- accessible name for text, icon-plus-text, square, and circle controls;
- pointer click and keyboard activation with Space and Enter;
- focus entry, `:focus-visible`, focus retention, and tab order;
- explicit disabled and loading-disabled behavior, including event suppression;
- loading announcement/name behavior and loader presentation;
- native button attributes, form participation, and default `type` behavior;
- Kumo `onClick` event semantics and Solid callback-ref timing;
- SSR render and hydrated first interaction without warnings or drift;
- documented framework difference for React object refs, which the Solid public
  contract does not claim to support.

Acceptance:

- each test drives both mounted implementations and reports the side that
  diverged;
- every accepted difference has a written reason and is not silently normalized
  away by the fixture;
- the tests fail when press/focus/disabled logic moves into the styled wrapper
  or stops coming from `solidaria-components`;
- the focused Playwright lane, `vp run comparison:typecheck`, and
  `vp test run packages/kumo/test/Button.test.tsx` pass.

### KX-04 — Prove visual branches

**Task:** `kumo-button-visual-evidence`

Build React-versus-Solid visual evidence from the paired fixture. Derive the
expected values from `@cloudflare/kumo@2.11.0`; do not tune the Solid CSS to an
arbitrary screenshot.

Required branches:

- all implemented variants and sizes;
- base, square, and circle shapes;
- text, icon-plus-text, and icon-only content;
- rest, hover, pressed, keyboard focus, disabled, and loading states;
- light and dark modes at the same viewport, font readiness, and device scale;
- geometry and computed-style contracts for dimensions, padding, gap, radius,
  type, color, border/ring, shadow, and loader placement.

Acceptance:

- deterministic pair captures and computed contracts fail on a one-sided
  change;
- thresholds and masks have a measured reason in the test, not a blanket
  waiver;
- a mismatch remains red until source inspection classifies it as a Solid
  adaptation, a package bug, or an oracle/environment issue;
- the focused visual lane passes twice from clean output.

### KX-05 — Rewrite the root landing story

**Task:** `kumo-landing-story`

Make the existing root page the one URL the owner can deploy and share. Keep the
site's Glasselated visual language, but make the information architecture match
the actual package architecture and maturity.

Content contract:

- replace “two styled systems” with one shared Solid foundation and three
  standalone styled libraries;
- present `@proyecto-viviana/ui`, `solid-spectrum`, and Kumo as architectural
  peers without presenting them as equally complete;
- label Kumo visibly as an experiment with one Button, incomplete evidence,
  rough edges, and an unpublished package;
- remove or qualify global phrases such as “faithfully ported,” “pixel-faithful,”
  and “certified-accessible core” when the page cannot link them to current
  component evidence;
- show the real Solid Kumo Button in a small lab-style specimen, not a mock;
- link to source, limitations, and available evidence. Do not render an npm
  install link until the package exists on npm;
- update the root title, description, and social metadata so a pasted link does
  not make a stronger claim than the page.

Design contract:

- preserve the existing Viviana typography, backdrop, cards, and theme control;
- distinguish maturity with explicit status text, not color alone;
- keep the three libraries scannable as siblings and give Kumo a clearly marked
  experimental specimen;
- scope Kumo tokens and `data-mode` to the specimen so importing Kumo CSS does
  not retheme the Viviana page;
- remain usable at narrow and wide viewports, with no hidden navigation or
  horizontal overflow.

Acceptance:

- a landing-specific Playwright test checks the three library names, Kumo status
  and limitations, live Button activation, source/evidence links, and absence
  of a false npm-install CTA;
- route sweep, unique SEO metadata, sitemap, keyboard navigation, axe smoke,
  contrast, and both color schemes pass;
- the page contains no unqualified “ported,” “parity,” “pixel-faithful,” or
  “certified” claim for Kumo or the shared foundation;
- `vp run build:web`, the landing test, `vp run test:routes`, `vp run test:seo`,
  and the affected accessibility lanes pass.

### KX-06 — Qualify and deploy the shareable page

**Task:** `kumo-site-release`

Qualify the exact revision, then deploy the existing Worker for
`ui.proyectoviviana.org`. Deployment is a separate, explicit action after the
landing change is reviewed.

Acceptance:

- `vp run guard:deploy-target` proves the configured Worker and custom domain;
- site and release-readiness gates pass on the exact revision selected for
  deployment;
- `vp run deploy` completes only after owner approval for the external write;
- the live root returns 200, hydrates without console errors, exposes the same
  canonical URL and social metadata, renders all three libraries, activates the
  Kumo Button, and keeps Kumo marked experimental;
- the deployed revision is recorded with the task-state update.

### KX-07 — Align `../kumo-solidaria`

**Task:** `kumo-sibling-proposal-sync`

Update the sibling repository's proposal after the package baseline has a
stable revision. This is a separate-repository documentation change; it does
not copy source or create a filesystem dependency.

Acceptance:

- the proposal names `Button`, `@proyecto-viviana/kumo`, and the exact
  `@cloudflare/kumo@2.11.0` oracle instead of the earlier Switch-shaped pilot;
- it points to the implementation revision and reports unit, tarball,
  comparison, browser, and visual evidence separately;
- it states that this repository owns the Solid implementation and the sibling
  repository owns Cloudflare-facing review/governance context;
- it lists current gaps and does not describe the experiment as a port;
- no Solid runtime source, workspace link, or file dependency is added to the
  sibling repository.

### KX-08 — Hold the pilot review

**Task:** `kumo-pilot-review`

Review the shipped landing and the paired evidence before adding a second Kumo
component or publishing the package.

The review must choose and record one of three outcomes in the owner's words:

- continue with another dependency-bounded component;
- pause with the Button experiment maintained but not expanded;
- delete the experiment if the API, evidence cost, or upstream relationship is
  not viable.

Acceptance:

- the decision cites the behavior and visual results, known adaptations, package
  maintenance cost, and Cloudflare proposal response;
- continuing creates a new branch matrix and tickets before component code;
- publishing remains a separate owner decision that includes npm package
  registration, trusted-publisher setup, versioning, provenance, and a clean
  consumer smoke;
- no outcome changes Button to “ported” unless the complete evidence bar in
  `certification.md` is actually met.

## Explicit non-goals for this pilot

- A complete Kumo port or a component-count promise.
- A compatibility layer that exposes both the Kumo and headless public APIs on
  one styled component.
- A runtime or workspace dependency on `../kumo-solidaria`.
- Reimplementing press, focus, keyboard, or disabled behavior in
  `packages/kumo`.
- Publishing `@proyecto-viviana/kumo` as a side effect of landing or deploying
  the docs site.
- Letting the Kumo experiment weaken, rebaseline, or delay evidence required for
  the Adobe port stack.

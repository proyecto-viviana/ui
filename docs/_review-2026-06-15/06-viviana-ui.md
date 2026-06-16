# Review — `@proyecto-viviana/ui` (dir `packages/viviana-ui`)

Reviewer 06. Scope: `packages/viviana-ui/src/**` — the DS wrapper (re-export barrels)
plus the Viviana-native components and token/aggregator CSS. Read-only audit against
AGENTS.md (Rules #1–#7) and ADR-0001. Upstream truth for re-exports = `@react-spectrum/s2`;
natives have no upstream and are judged as local additions (documented? accessible?
idiomatic? composing — not forking — ARIA/state?).

Headline: the package does **not** fork ARIA or state — every interactive native
composes the headless `Button` from `solidaria-components`, and the S2 `style()` macro
is used correctly (named tokens carry shape; brand colors ride in as arbitrary
`[var(--color-*)]`). So there is **no Critical** here. The real damage is (a) three
fully-built native components that are unreachable dead code yet were just migrated,
(b) a swarm of undocumented public names with reach, (c) presentational `<div>` natives
with zero ARIA/roles/landmarks/live-regions, and (d) a test that green-tests a component
consumers cannot import.

---

### [High] `Header`, `LateralNav`, `NavHeader` are unreachable dead code — no barrel, no entry, no subpath — yet were migrated to the macro

- Evidence:
  - Implementations exist and are non-trivial:
    `packages/viviana-ui/src/custom/header/index.tsx:50` (`Header`),
    `packages/viviana-ui/src/custom/lateral-nav/index.tsx:125` (`LateralNav`, + `NavItem`/`NavLink`/`NavSection`),
    `packages/viviana-ui/src/custom/nav-header/index.tsx:68` (`NavHeader`).
  - No top-level barrel re-exports them. Barrels exist only for the other 9
    (`Chip.ts`, `Conversation.ts`, `EventCard.ts`, `ProfileCard.ts`, `ProjectCard.ts`,
    `CalendarCard.ts`, `TimelineItem.ts`, `Logo.ts`, `PageLayout.ts`); there is no
    `Header.ts` / `LateralNav.ts` / `NavHeader.ts`.
  - The build entry list omits them — `packages/viviana-ui/vite.config.ts:116-142`
    enumerates exactly the 9 reachable barrels; header/lateral-nav/nav-header are absent,
    so no `dist/*.js` is emitted for them.
  - No `package.json` subpath export exists for them (`package.json:19-180`).
  - Yet the macro-migration commit `4d020ee4` explicitly rewrote all three (its stat
    touches `custom/header`, `custom/lateral-nav`, `custom/nav-header`), and the
    relocation commit `a2bcc458` itself says it exposed **"9 subpath exports"** for **12**
    relocated components — three were knowingly left unwired.
- Why: Rule #5 (patch-as-structure / dead code as a parallel truth) and Rule #1's "an
  export that exists is a floor". Effort was spent porting components to the macro that no
  consumer can import; they rot out of sync with the 9 live ones, and the gap between
  "12 relocated" and "9 exposed" is silent. This is exactly the maturity debt a
  "public but not yet released" package should be cleaning up, not accumulating.
- Fix: decide per component. Either (a) wire them up — add `Header.ts`/`LateralNav.ts`/
  `NavHeader.ts` barrels, add them to the `vite.config.ts` entry array and to
  `package.json` exports, and classify each as `viviana-native` in a tracked manifest; or
  (b) delete the three `custom/` dirs (git history is the archive, per AGENTS.md). Do not
  leave them half-wired.

### [High] Many public names with reach are silently minted — no per-component `viviana-native` classification, and sub-components aren't documented at all

- Evidence:
  - `architecture.md:73` defines a `viviana-native` status, and `glossary.md:51` defines
    "Local addition", but a repo-wide grep for the actual component names in tracked docs
    (`CREDITS.md`, `glossary.md`, `architecture.md`) returns nothing — no component-level
    classification exists for `Chip`, `ProfileCard`, `ProjectCard`, `EventCard`,
    `CalendarCard`, `TimelineItem`, `Conversation`, `Logo`, `PageLayout`.
  - The barrels use `export *`, so they also publish a long tail of secondary public names
    that are documented nowhere and have no subpath of their own:
    `ConversationPreview`, `ConversationBubble`, `Message` (`custom/conversation/index.tsx:94,158,9`),
    `EventListItem` (`custom/event-card/index.tsx:218`), plus the orphaned
    `NavItem`/`NavLink`/`NavSection`/`LateralNav`/`Header`/`NavHeader`. Their interfaces
    (`ChipVariant`, `TimelineEventType`, `ProjectCardSize`, `LogoSize`, …) are exported too.
- Why: Rule #2 ("a Solid-specific export … is allowed only when it is explicit and
  documented as a local addition — never silent drift") and Rule #3 ("names with reach …
  never mint one silently"). The taxonomy slot exists but is unused; these are public,
  reachable names (a consumer doing `import { ConversationBubble } from "@proyecto-viviana/ui/Conversation"`
  gets them) with zero tracked record that they were owner-steered additions.
- Fix: add a tracked manifest (e.g. in `.claude/current/`) listing every native export and
  its status = `viviana-native`, with the secondary names (`ConversationPreview`,
  `ConversationBubble`, `EventListItem`, `Message`) called out. Confirm the owner intends
  each as public; demote internal-only ones out of the `export *` surface.

### [High] Native components ship as `<div>` soup with no roles, landmarks, or live regions — accessibility floor not met for local additions

- Evidence: a repo-wide grep for `aria-*|role=|VisuallyHidden|sr-only` across
  `packages/viviana-ui/src/custom/**` finds **exactly one** hit — the menu `aria-label` in
  the _orphaned_ `nav-header/index.tsx:90`. Every reachable native has none:
  - `Conversation` renders a chat thread as a bare `<div class={thread}>`
    (`custom/conversation/index.tsx:185-198`) — no `role="log"`/`role="list"`, no
    `aria-label`; bubbles are plain `<div>`/`<p>` with no per-message structure. A screen
    reader gets an undifferentiated run of text.
  - `ConversationPreview`'s unread badge is bare text with no announced label
    (`custom/conversation/index.tsx:113-115`) — "3" with no "unread" affordance; the
    online indicator is passed to `Avatar` with no described state.
  - `EventCard` uses decorative glyphs as visible content with no `aria-hidden`:
    `<span class={metaIcon}>@</span>` and `<span class={metaIcon}>⏱</span>`
    (`custom/event-card/index.tsx:129,135`); the `decoration` img uses `alt=""` (ok) but
    the meta glyphs are read aloud as "at sign", "stopwatch".
  - `TimelineItem` builds its sentence from `<span>`s and an icon with no `aria-hidden`
    on the decorative emoji icon (`custom/timeline-item/index.tsx:126`).
  - `LateralNav`/`NavSection` (orphaned) emit a `<ul>` of links but the `accentRail` and
    `NavItem` heading are not associated; the live `PageLayout` is a plain `<div>` shell
    with no `<main>` landmark even though it is the page root.
- Why: AGENTS.md "What `ls` won't tell you" lists `viviana-native` as "a first-class
  Viviana component"; Rule #1's certification bar (real accessibility, computed name/role)
  is the standard the project holds itself to. A first-class component that is invisible to
  assistive tech is not first-class. For a chat log and cards this is the dominant
  correctness axis.
- Fix: give the natives real semantics — `Conversation` → `role="log"` + `aria-label`,
  bubbles labelled with sender; unread badge → visually-hidden "N unread"; decorative
  glyphs/icons → `aria-hidden` with the meaning carried by adjacent text or an `aria-label`;
  `PageLayout` should render or slot a `<main>` landmark. Reuse the existing
  `VisuallyHidden`/i18n primitives from `solidaria-components`/`@proyecto-viviana/ui`
  rather than hand-rolling.

### [Medium] `CustomInteractions.test.tsx` green-tests `NavHeader` — a component no consumer can import — and natives have only a single interaction test each

- Evidence:
  - `packages/viviana-ui/test/CustomInteractions.test.tsx:7` imports `NavHeader` from
    `../src/custom/nav-header` (deep relative path that bypasses the missing barrel) and
    asserts its menu `aria-label`/`onMenuClick` at lines 44-54. Because `NavHeader` is not
    a public export (see High #1), the test passes while exercising a surface consumers
    cannot reach — the test cannot fail for any user-observable reason.
  - The same file is the _only_ test in the package (`test/` contains just this file). It
    covers one press-forwarding path each for `Chip`, `ConversationPreview`, `EventListItem`,
    `NavHeader` — no coverage of the cards, `Conversation`, `TimelineItem`, `Logo`,
    `PageLayout`, `ProjectCard`'s link branch, validation, focus, or computed a11y.
- Why: Rule #7 ("a test must be able to fail for the reason it exists") and Rule #1
  (a single unit test is a floor). Testing through a private deep path entrenches the
  orphan and gives false confidence.
- Fix: once High #1 is resolved, import natives through their public barrels; if `NavHeader`
  is deleted, drop its test. Add coverage proportionate to each native's behavior
  (keyboard, focus, computed name/role) before "released".

### [Medium] `ProjectCard` hard-codes `target="_blank"` with no opt-out and no new-window affordance

- Evidence: `custom/project-card/index.tsx:67-71` — when `href` is set the whole card
  becomes `<a href target="_blank" rel="noopener noreferrer">`. `target` is not a prop;
  every linked ProjectCard force-opens a new tab, and there is no visible/sr-only "(opens
  in new window)" hint.
- Why: Rule #2 (don't invent behavior an upstream answer exists for — S2/RAC links default
  to same-tab and expose link routing, never force `_blank`). Forced new-tab navigation is
  a known a11y/UX anti-pattern and is unconfigurable here.
- Fix: drop the hard-coded `target`/`rel` (or make them props defaulting to same-tab); if a
  new-window variant is wanted, add an explicit prop and announce it.

### [Low] Root `index.ts` doc comment is stale — claims the package is "solid-spectrum verbatim"

- Evidence: `src/index.ts:1-8` says "Until then this is solid-spectrum verbatim" and only
  does `export * from "@proyecto-viviana/solid-spectrum"`. That has been false since the
  relocation: 9 native subpaths now ship (`package.json:104-157`), and natives are
  reachable only via subpaths, never the root barrel. `src/style.ts:4` likewise says the
  viviana token theme "will be swapped in here when we diverge" though `viviana-tokens.css`
  - `theme.css` already diverge the colors.
- Why: Rule #6 (code over docs) — a stale in-file claim that the package is verbatim
  misdirects readers about what `@proyecto-viviana/ui` actually is.
- Fix: update both comments to describe the current shape (re-export base + native subpaths
  - viviana token layer).

### [Low] `Conversation` ignores `Message.id` for keying and drops `Message.sender`/`timestamp` fidelity

- Evidence: `custom/conversation/index.tsx:188-196` — `<For each={props.messages}>` renders
  bubbles but never uses `message.id`; Solid `<For>` keys by reference, so the exported
  `id` field is dead. Fine for static lists, but the public `Message` type advertises an
  `id` contract the component doesn't honor.
- Why: minor API/impl drift on a public type (Rule #2) — the shape promises more than the
  component uses.
- Fix: either use `id` (e.g. via keyed `<Key>`/index) or document that `id` is consumer-only.

---

## SolidJS idiom & reactivity

Generally clean — better than the lower layers in places.

- **Props accessed reactively, not destructured.** No top-level `const { … } = props`
  anywhere in `custom/**` (grep confirms zero hits); accessors are wrapped in functions
  (`Logo.tsx:43-45`, `ProjectCard.tsx:55-56`, `TimelineItem.tsx:102-104`). `PageLayout`
  uses `splitProps` correctly (`page-layout/index.tsx:23`).
- **Caveat — `props.children` read once in PageLayout.** `page-layout/index.tsx:31` renders
  `{props.children}` directly (fine), but the `rest` spread + `props.children` mix is
  slightly redundant; not a bug.
- **Minor — `typeof props.x === "function"` branch on render-prop slots.**
  `EventCard.tsx:157`, `ProfileCard.tsx:109`, plus the `icon`/`message` helpers
  (`Chip.tsx:60-65`, `TimelineItem.tsx:106-118`) re-read `props.actions`/`props.icon` and
  branch on type each call — correct under Solid's lazy evaluation, but the dual
  `JSX.Element | (() => JSX.Element)` API is non-idiomatic (Solid prefers a single callable
  or `children` helper). Consistent across natives, so it reads as an intentional SSR
  pattern (the JSDoc says so) — flagging as style debt, not a defect.
- **No lifecycle leaks.** No `createEffect`/`onMount`/`createSignal`/`onCleanup` in any
  native (grep confirms) — all are pure render functions, so there is nothing to clean up.
  Appropriate for presentational components.
- **Macro usage is idiomatic and correct.** Every native imports
  `style … with { type: "macro" }` from the local `../../style` seam (which re-exports
  solid-spectrum's macro), uses real S2 named tokens for shape (`font: "ui-sm"`,
  `borderRadius: "full"`, spacing scale verified against
  `packages/solid-spectrum/src/style/spectrum-theme.ts`), and confines brand color to
  arbitrary `[var(--color-*)]` values fed by `viviana-tokens.css`. This honors ADR-0001 /
  Rule #4 (S2 styling through the macro; no hand-authored component CSS — grep for
  `.css`/`<style` in `custom/**` is clean). The hand-authored CSS is limited to the token
  layer (`viviana-tokens.css`) and aggregators (`theme.css`, `styles.css`,
  `components.css`), which is the legitimate "skin/tokens" lane, not component styling.

## Accessibility of native components

The dominant gap (see High #3). Summary by component:

- **Chip / ConversationPreview / EventListItem / (orphan) NavHeader** — interactive, and
  correctly composed on the headless `Button` (`onPress`, real `type="button"` defaulted by
  `solidaria-components/src/Button.tsx`). These are the _good_ cases: keyboard + press come
  free from the headless layer. Chip with only an `icon` (no visible text) would be an
  unlabelled button, but text is required, so it is named in practice.
- **Conversation (thread)** — no `role="log"`/`list`, no label; bubbles unstructured. ✗
- **EventCard / ProfileCard / ProjectCard / CalendarCard / TimelineItem** — presentational
  `<div>`s. `<div>` for a non-interactive card is acceptable, but: heading levels are
  hard-coded (`h3`/`h4`) with no override, risking document-outline breakage; decorative
  glyphs/emoji are exposed to AT (no `aria-hidden`); `ProjectCard`'s link branch forces a
  new tab (Medium #2). Images mostly have `alt` (good — `EventCard.tsx:119`,
  `CalendarCard.tsx:86`), though several reuse `title` as `alt` which can be redundant.
- **PageLayout** — page-root shell with no `<main>` landmark. ✗
- **No live regions anywhere** — the unread counter and any dynamic content are silent to AT.
- **The only ARIA in the whole tree** is the orphaned `NavHeader`'s menu `aria-label`
  (`nav-header/index.tsx:90`) — and that component ships to no one.

---

## Suspected (unconfirmed)

- **Suspected:** the `dist` may ship `.js` for the 9 natives but their secondary `export *`
  names (`ConversationBubble`, `EventListItem`, `Message`) have no dedicated subpath, so
  tree-shaking / types resolution for a consumer importing them by name through the parent
  subpath is plausibly fine but untested. Did not build to confirm `.d.ts` emission for the
  secondary names.
- **Suspected:** `viviana-tokens.css` header says "Values mirror apps/web's palette
  verbatim — keep them in sync until apps/web consumes this file directly"
  (`viviana-tokens.css:13`). This is a self-declared duplicated source of truth (two copies
  of the palette) — a Rule #5 parallel-truth risk — but I did not diff against `apps/web`
  (out of lane) to confirm drift.
- **Suspected:** light-mode `--color-*` overrides in `viviana-tokens.css` claim
  "AA-verified" (line 214); contrast not independently re-checked here.
- **Suspected:** several cards pass `alt={props.title}` for the preview image
  (`EventCard.tsx:119`, `CalendarCard.tsx:86`) — if the title is also rendered as text
  adjacent, this double-announces; an empty `alt` may be more correct. Not verified against
  a screen-reader run.

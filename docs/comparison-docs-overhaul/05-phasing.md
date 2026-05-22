# 05 · Phasing, Risks & Acceptance

## Phased delivery

Each phase is independently shippable and leaves the app working.

### Phase 0 — Spikes & governance

- Resolve the open questions below (style-CSS approach, JSX vs hyperscript,
  prop-metadata extractor choice).
- Update `docs/adr/0001-s2-styling-source-of-truth.md`: record that the
  comparison app **shell** may use `solid-spectrum`; the boundary becomes
  "no hand-written CSS re-implementing S2 surfaces", not "no styled components
  in the shell".
- Loosen the CSS-boundary wording in `apps/comparison/README.md` and
  `docs/CURRENT_STATUS.md` to match.
- Prototype one chrome `style()` call end-to-end (author → generate CSS →
  render in Astro) to confirm [`02`](02-style-and-build.md) approach A.
- **Fix the `solid-spectrum` CSS defect** ([`02`](02-style-and-build.md) §2a):
  add `disclosure`/`accordion`/`table`/`card`/`tabs` to
  `scripts/generate-solid-spectrum-s2-css.ts`, regenerate `s2-generated.css`,
  and diff to confirm the components are now styled. This is a `solid-spectrum`
  change, separate from the comparison-app overhaul, and a prerequisite for the
  chrome.

Exit: ADR updated; style + SSR approach proven on a throwaway branch;
`solid-spectrum` CSS defect fixed and verified.

### Phase 1 — Chrome shell

Build `DocsLayout`/`PageShell`, `SettingsContext` + `Provider`, `typography`,
`Nav` (+`Disclosure` CSS), `Header`, `ColorSchemeToggle`, `Footer`, desktop
`Toc`. Wire the chrome CSS generation step. Keep the existing `[slug].astro`
**body** temporarily inside the new shell so nothing breaks. Port `index.astro`
to the new shell.

Exit: every page renders inside real `solid-spectrum` chrome; visual diff of
the shell against `react-spectrum.adobe.com` passes (light + dark).

### Phase 2 — Page framework

Stand up MDX pages, the custom MDX component set, and the
`scripts/import-s2-docs-mdx.ts` migration script. Convert **3 representative
components by hand** to validate the pipeline: Checkbox (simple), Button
(multi-example), DatePicker (complex, date deps).

Exit: 3 MDX pages live, reading like the upstream docs, inside the new chrome.

### Phase 3 — `ComparisonExample` + `PropTable`

Build the dual-panel example (shared controls, two live panels, parity strip,
code tab) and the grouped, parity-aware `PropTable`. Lift the existing control
plumbing from `[slug].astro` into the island.

Exit: the 3 pilot pages have full interactive examples + prop tables.

### Phase 4 — Prop-metadata extraction _(parallel workstream)_

Implement the chosen extractor ([`04`](04-content-pipeline.md) §4) for both
`@react-spectrum/s2` and `solid-spectrum`; emit `data/docs/`. Upgrade
`PropTable` and `PageDescription` to consume it. Can run alongside Phases 2–5.

Exit: prop tables show real types/defaults/descriptions + the parity column.

### Phase 5 — Bulk content port

Run the migration script across all 69 tracked catalogue entries; hand-tune
prose, examples, anatomy, `StateTable`s. Append the parity sections. Track with
`vp run comparison:report:gaps`.

Exit: all catalogue components have MDX pages at content parity.

### Phase 6 — Cleanup

Delete dead `s2-*` rules from `global.css` (keep only harness chrome:
screenshot frames, comparison-panel framing). Update `COMPONENT_PLAYBOOK.md`,
`CURRENT_STATUS.md`, `playbook/` notes, and any e2e/visual specs asserting on
old `.s2-*` selectors.

Exit: no hand-written S2-surface CSS remains; reports and suites green.

## Risk register

| Risk                                                                                                                       | Severity | Mitigation                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chrome `style()` CSS not collected / FOUC                                                                                  | Med      | Approach A build step ([`02`](02-style-and-build.md) §3); prove in Phase 0.                                                                                                    |
| **`solid-spectrum` defect:** `Disclosure`/`Accordion`/`Table`/`Card`/`Tabs` CSS absent from the shipped `s2-generated.css` | High     | Extend the generator's import list; **fix in solid-spectrum, not the app**. Verified omission; confirm by running the generator + diff. See [`02`](02-style-and-build.md) §2a. |
| Chrome depends on Disclosure/Table, which `CURRENT_STATUS.md` flags as not-yet-parity styled components                    | Med      | Pre-existing tracked WIP; chrome fidelity is gated on those components reaching parity. Dogfooding will surface their bugs early.                                              |
| Prop-metadata extraction larger than expected                                                                              | High     | Isolated as Phase 4; `PropTable` degrades gracefully to `apiProps`.                                                                                                            |
| Solid SSR + selective hydration friction in Astro                                                                          | Med      | Integration already present; per-region `client:*` decisions in Phase 1.                                                                                                       |
| Upstream MDX uses RSC-only constructs (`docs:` import, server components)                                                  | Med      | Migration script strips/replaces them; pilot in Phase 2 surfaces edge cases early.                                                                                             |
| Two component libraries (React + Solid) bundled — build weight                                                             | Low      | Already the case today; `astro.config` warning policy tuned.                                                                                                                   |
| Visual drift from upstream over time                                                                                       | Low      | Keep upstream `s2-docs` vendored; periodic diff.                                                                                                                               |
| e2e/visual specs assert on `.s2-*` selectors                                                                               | Med      | Phase 6 selector migration; inventory specs before deleting CSS.                                                                                                               |

## Open questions (Phase 0)

1. **Chrome CSS** — build-time generation (approach A) or SSR-time flush
   (approach B)? Recommendation: A.
2. **Chrome authoring** — normal Solid JSX, or the `solid-js/h` hyperscript
   `ComparisonIsland` uses? Recommendation: JSX unless a constraint is found.
3. **Prop metadata** — reuse react-spectrum's `parcel-transformer-docs`, write
   a `ts-morph` extractor, or hand-author? Recommendation: reuse upstream
   extractor if it runs standalone.
4. **Parity sections placement** — inline after the upstream body, or collapsed
   under one "Porting parity" `Disclosure`? Recommendation: collapsed.
5. **Homepage** — keep `index.astro` or convert to MDX? Either works; convert
   only if it simplifies the shared layout.

## Acceptance criteria

- A component page placed next to its `react-spectrum.adobe.com` counterpart is
  visually indistinguishable in chrome, typography, spacing, and the example /
  prop-table layout, in both light and dark.
- The chrome is built from `solid-spectrum` components, not bespoke CSS.
- Each page carries the upstream prose and examples (full content parity)
  **plus** the React-vs-Solid comparison and porting-parity reporting.
- `apps/comparison/src/styles/global.css` no longer styles S2 surfaces; only
  harness chrome remains.
- `vp run comparison:report:gaps` / `:exports` and the e2e/visual suites pass
  against the new markup.
- ADR 0001 and the steering docs reflect the superseded boundary.

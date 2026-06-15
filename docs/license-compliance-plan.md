# License attribution & per-file header compliance — map & plan

**Status:** Planned (not started). Repo-level attribution landed in `9043beda`;
this plan covers the remaining per-file work.

## Why

The five-layer package chain is a SolidJS **port** (derivative work) of Adobe's
React Spectrum stack — React Stately, React Aria, React Aria Components, and
React Spectrum S2 — all licensed Apache-2.0. Distributing a derivative work
triggers Apache-2.0 **section 4**:

| Obligation                                         | State                           |
| -------------------------------------------------- | ------------------------------- |
| 4(a) include the Apache license                    | **done** — `LICENSE-APACHE-2.0` |
| 4(c) carry the upstream NOTICE                     | **done** — `NOTICE`             |
| human-readable credit                              | **done** — `CREDITS.md`         |
| 4(b) state significant changes (React → Solid)     | partial — README + some markers |
| 4(d) retain each file's copyright / license notice | **the gap (this plan)**         |

Only **12 of 989** source files carry Adobe's header today. Genuinely original
Proyecto Viviana files must be **excluded** — stamping Adobe's copyright on our
own code is misattribution, the opposite failure.

## The map

| Package                | src files | has Adobe hdr | port-marked | unmarked |
| ---------------------- | --------: | ------------: | ----------: | -------: |
| `solid-stately`        |        84 |             0 |          34 |       50 |
| `solidaria`            |       202 |             1 |          80 |      121 |
| `solidaria-components` |        72 |             0 |           3 |       69 |
| `solid-spectrum`       |       614 |            11 |           0 |      603 |
| `viviana-ui`           |        15 |             0 |           1 |       14 |
| **total**              |   **989** |        **12** |     **118** |  **859** |

(Counts are `.ts`/`.tsx` under `src/`, excluding `.d.ts`.)

### Three buckets, three treatments

- **A · Generated assets — ~422 files** (`solid-spectrum/src/icon/**`:
  `s2wf-icons`, `ui-icons`, `icons`, `assets`). Auto-generated from Adobe's 402
  vendored `.svg` sources; each already says _"Auto-generated… do not edit by
  hand"_ but carries no Adobe notice. **Fix the generator and regenerate** — one
  change covers the largest bucket. Uniform year (S2 ≈ 2024).
- **B · Hand-ported source — ~500 files** (the stately/aria/components
  hooks+state, the ~180 non-icon `solid-spectrum` components & style macro).
  **Per-file Adobe header, exact upstream year** (decided approach).
- **C · Genuinely original — ~50 files** (`solid-spectrum/src/custom/`,
  the `viviana-ui` re-export layer, barrels, Solid-only glue). **No Adobe
  header** — our work, MIT. (`src/custom/` legitimacy is itself under review —
  see Open questions.)

### Mappability for the exact-year approach (bucket B)

Strong where our layout mirrors upstream:

- `solidaria` `create*` → `use*`: **100 / 117** map to vendored `@react-aria`.
- `solid-stately` `create*` → `use*`: **36 / 41** map to `@react-stately`.
- `solidaria-components` name-match: **49 / 71** map to `react-aria-components`.
- `solid-spectrum`: flatter upstream layout (our 81 dirs vs ~87 upstream files)
  → expect more fallbacks; lean on the 118 existing `Based on…` / `Ported
from…` markers that already name the upstream module.

## The plan

- **Phase 0 — lock the form.** Header = Adobe's exact Apache block (verbatim,
  the one already in `solidaria/src/dialog/createDialog.ts`) + a one-line
  _"Ported to SolidJS for Proyecto Viviana; based on `<upstream>`"_ change-note.
  **Verify `vp check --fix` (oxfmt/oxlint) does not strip or reflow top-of-file
  license block comments** on a sample first — real risk; add an exception if
  needed.
- **Phase 1 — generated assets (A).** Locate the icon generator
  (`scripts/*icon*`), make it emit the Adobe header (+ _"generated from vendored
  S2 SVG sources, © Adobe, Apache-2.0"_), regenerate, confirm all ~422 headed.
- **Phase 2 — ported source, exact year (B).** Script a mapper: resolve each
  file's upstream via its existing `Based on…` / `Ported from…` marker, else the
  `create→use` / name heuristic, against vendored `react-spectrum/`. For
  matches, copy the **real upstream header verbatim** (true year) + change-note.
  Emit a report of unmapped files.
- **Phase 3 — fallback + manual pass.** Unmapped derivatives get the standard
  block with a documented fallback year (per-package upstream mode: aria/stately
  ≈ 2020, s2/icons ≈ 2024). Hand-classify genuinely ambiguous unmarked files.
- **Phase 4 — carve-outs + verify.** Confirm bucket C stays MIT (optionally a
  short Proyecto-Viviana MIT header). Typecheck/build green (header-only ⇒
  should be safe). Commit in logical splits (generator+regen / ported headers /
  carve-outs).

## Open questions

1. **Icon license** — no icon-specific license found; `s2wf-icons` appear
   covered by `@react-spectrum/s2`'s Apache-2.0. Confirm before stamping ~422
   files (Adobe workflow icons have occasionally carried their own terms).
2. **Fallback year values** — confirm aria/stately ≈ 2020, s2/icons ≈ 2024 for
   the unmappable minority.
3. **`solid-spectrum/src/custom/`** — what is it, should it exist at all, and is
   any of it actually derivative? Resolve before finalizing bucket C.
4. **Barrels / `custom/`** — leave header-less, or add a short MIT /
   Proyecto-Viviana header for clarity?

## References

- Repo-level attribution: commit `9043beda` (`LICENSE`, `LICENSE-APACHE-2.0`,
  `NOTICE`, `CREDITS.md`, README "License & attribution").
- Vendored upstream: `react-spectrum/` (gitignored) and
  `apps/comparison/vendor/s2-docs/` (tracked, carries its own `NOTICE`).

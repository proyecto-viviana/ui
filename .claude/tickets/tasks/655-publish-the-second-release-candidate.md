---
id: 655
type: task
title: "Publish the second release candidate"
created: 2026-10-12
parent: 443
priority: high
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Main is ahead of the published rc.1 with the Geist bridge and three repairs; local readiness is green, the certified postcard is stale.",
    }
---

## Scope

Publish, under the `rc` tag, what main holds past rc.1. Four pending
changesets, all patch:

| Changeset                                      | Packages                        |
| ---------------------------------------------- | ------------------------------- |
| `bridge-the-geist-register` (#649)             | ui                              |
| `reactive-class-style-and-toggle-state` (#651) | solidaria, solidaria-components |
| `focusscope-replacement-restore-target`        | solidaria                       |
| `colorarea-native-input-size`                  | solidaria                       |

`changeset status` bumps solidaria to 0.6.0-rc.2, solidaria-components to
0.7.0-rc.2, ui to 0.8.0-rc.2 and, through its dependencies, solid-spectrum to
0.8.0-rc.2. solid-stately stays at 0.6.0-rc.1. Kumo and Geist stay at 0.0.0.
No `latest` or `next` movement, no prerelease exit.

The order is the one in `.claude/current/release-policy.md`:

1. Version: `vp run changeset:version`, then commit the candidate. Not done
   yet, on purpose: once the bump is committed, `guard:publish-drift` refuses
   any further source change stacked on it until it is published or
   re-versioned, and #652 and #654 are still open.
2. Push. Certification Gates runs the certified shards on the candidate.
3. Record the certified postcard from that run in
   `apps/comparison/src/data/certified-suite-evidence.ts` and push again.
4. Certification Gates, Release Readiness and Site Gate green at that exact
   SHA. `Release` then publishes by itself.
5. Check the registry: `rc` dist-tags, dependency closure, a clean consumer.

## Done when

The four packages are on npm at the versions above under `rc`, `latest` is
unchanged, and a consumer outside the workspace installs
`@proyecto-viviana/ui@rc` and renders Geist with no font rule of its own.

## Proof

Local, at a5341815, 2026-10-12:

- `vp run ci:release-readiness`: exit 0. Unit 423 files, 8287 passed and 1
  expected failure; SSR 49 files, 141 passed; hydration 42 files, 141 passed;
  comparison SSR 2 files, 9 passed; comparison hydration 5 files, 178 passed;
  web 11 files, 64 passed; journey driver 2 files, 12 passed. `vp run check`,
  `vp run build` and every guard in the chain pass; lint reports 0 errors and
  2 warnings.
- `guard:publish-drift` and `guard:release-prerequisites` pass.
- `check-changeset-required` fails on `@proyecto-viviana/solid-spectrum`: the
  only solid-spectrum changes past origin/main are test files. The hosted
  Changesets Check runs on pull requests only, and solid-spectrum is bumped
  through its dependencies anyway.
- `vp run comparison:report:parity:strict`: exit 1, `STALE certified-suite
postcard (79 certified path(s) changed since it …)`. The postcard pins
  d8b57f49. This fails Certification Gates on the first push and is cleared
  by step 3.

Not run locally: `ci:site`, the certified suite, the hosted workflows.

## Relationship

Child of #443. Follows #547 (rc.1). Carries #649 and the first slice of #651.
VisualMode consumes it: it bumps to these versions and removes the `:root`
font rule in `src/styles/design-system.css`.

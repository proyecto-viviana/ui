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
      note: "Main is ahead of the published rc.1; local readiness is green, the certified postcard is stale, and every ticket it carries is merged.",
    }
---

## Scope

Publish, under the `rc` tag, what main holds past rc.1. Ten pending
changesets, all patch:

| Changeset                                      | Packages                        |
| ---------------------------------------------- | ------------------------------- |
| `bridge-the-geist-register` (#649)             | ui                              |
| `ui-font-faces-geist-only` (#649)              | ui                              |
| `ui-inlinealert-status-role` (#650)            | ui                              |
| `ui-dropzone-is-disabled` (#653)               | ui                              |
| `picker-static-children-open` (#652)           | solid-spectrum, ui              |
| `reactive-class-style-and-toggle-state` (#651) | solidaria, solidaria-components |
| `mergeprops-one-time-walk` (#651)              | solidaria, solidaria-components |
| `focusscope-replacement-restore-target`        | solidaria                       |
| `colorarea-native-input-size`                  | solidaria                       |

`changeset status` bumps solid-stately to 0.6.0-rc.2, solidaria to
0.6.0-rc.2, solidaria-components to 0.7.0-rc.2, solid-spectrum to 0.8.0-rc.2
and ui to 0.8.0-rc.2. Kumo and Geist stay at 0.0.0.
No `latest` or `next` movement, no prerelease exit.

The order is the one in `.claude/current/release-policy.md`:

1. Version: `vp run changeset:version`, then commit the candidate. Left to
   the session that runs the release on the owner's direct instruction.
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

Local, at 97527fe4, 2026-10-12:

- `vp run ci:changesets`: passes.
- `vp run ci:release-readiness`: exit 0. Unit 424 files, 8299 passed and 1
  expected failure; SSR 49 files, 141 passed; hydration 42 files, 141 passed;
  comparison SSR 2 files, 9 passed; comparison hydration 5 files, 178 passed;
  web 11 files, 64 passed; journey driver 2 files, 13 passed.
- `vp run ui:smoke`: passes.
- Both ran with `TMPDIR` on disk. `/tmp` is a 7.9 GB tmpfs and was full; with
  it every SSR file fails on `ENOSPC`.
- `vp run comparison:report:parity:strict` fails on the stale certified
  postcard, which pins d8b57f49. This fails Certification Gates on the first
  push and is cleared by step 3.

Not run locally: `ci:site`, the certified suite, the hosted workflows.

## Relationship

Child of #443. Follows #547 (rc.1). Carries #649, #650, #651, #652 and #653.
VisualMode consumes it: it bumps to these versions and removes the `:root`
font rule in `src/styles/design-system.css`.

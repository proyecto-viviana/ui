---
id: 94
type: task
title: "Track dependency compatibility ceilings"
created: 2026-08-20
parent: 27
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-023" }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Ceilings stay at jest-dom 6.9.1, jsdom 29.1.1, and typescript 6.0.3. scripts/dependency-ceilings.json records the recheck, and guard:dependency-ceilings holds the exact pins and the recorded peer ranges.",
    }
---

Three dependencies remain below their latest releases for verified compatibility
reasons:

- `@testing-library/jest-dom@6.9.1` stays until compatibility tests pass for a newer release. Installed peers allow 7.x; `unplugin-solid` is not installed.
- `jsdom@29.1.1` avoids the disconnected-node `getComputedStyle` crash found in
  jsdom 30.0.1.
- `typescript@6.0.3` stays within `@astrojs/check@0.9.10` peer ranges.

## Scope

- Recheck the dependent peer ranges when any related package changes.
- Remove a ceiling only after its compatibility tests pass.
- Keep the reason next to the selected version or in a generated dependency
  report.

Do not force-install a newer version and ignore peer or runtime failures.

## Recheck

On 2026-10-07 none of the three ceilings moved.

- `@testing-library/jest-dom@6.9.1` stays. Installed `@solidjs/vite-plugin@3.0.0-next.44` and `vite-plugin-solid@2.11.14` peer `^5.16.6 || ^5.17.0 || ^6.0.0 || ^7.0.0` (optional). `unplugin-solid` is not in the lockfile. Compatibility tests for 6.10.0 or 7.0.1 have not passed.
- `jsdom@29.1.1` stays. Latest seen was 30.1.2. No published note named the disconnected-node `getComputedStyle` crash as fixed. v30.0.1 fixed a different `getComputedStyle` `calc()` exception.
- `typescript@6.0.3` stays. It is the newest 6.x release inside `@astrojs/check@0.9.10`'s `^5.0.0 || ^6.0.0` peer. `typescript@7.0.2` is outside that range.

`scripts/dependency-ceilings.json` keeps those reasons. `guard:dependency-ceilings` fails when a pin or a recorded peer range drifts.

## Done when

Compatible dependent releases permit each ceiling to move, or the active
ceilings remain explicit and executable checks hold them.

## Bounded script typing qualification, 2026-10-08

Conductor admission binds base `fea28d7a75ab4e1f66678189a203a56192173165`
and registered generation `629a02e5-92cc-490f-8467-d9d4d0ef8d53`. The prior
owned generation is closed. The owner authorizes the Codex gpt-6.1-sol low
fallback for this bounded repair. Writes are limited to the existing test,
this ticket, and normal generated status/roadmap consequences.

The existing plain-JS import directive moves to its diagnostic-bearing line.
The manifest fixture is a path-keyed dependency dictionary, and `problemsOf`
returns string messages. Existing negative assertions and accepted ceiling
behavior remain the qualification boundary; this does not qualify newer
dependency releases or broader compiler debt. Raw evidence is under
`/tmp/ui-94-sol-*`; conductor review and exact-generation stop precede acceptance.

Old-source compiler control reports 11 diagnostics, including all eight owned
locations. The unchanged owning suite passes all 10 tests, including missing
reason, moved pin, peer drift, newly accepted major, and undeclared workspace
manifest cases. The local guard holds all three pins. Final formatter, lint,
compiler and documentation receipts are sealed with the handoff; remaining
inherited compiler failures are reported there without changing this ticket's
verified behavior status. No runtime negative control applies to this type-only
repair; the actual old-source compiler failure is the negative control.

---
id: 21
type: task
title: "Reject scheme-relative prop-table links"
created: 2026-08-20
parent: 26
status: done
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work review of vendored prop-table rendering",
    }
  - {
      state: done,
      at: 2026-08-20,
      note: "defined the local-path boundary, rejected host-changing paths and control forms, and passed 12 DOM-backed regressions",
    }
---

The new prop-table renderer says that it permits web, root-relative, and
fragment links. Its root-relative branch accepts every value that starts with
`/`. This also accepts `//example.com/path`, which a browser treats as an
external scheme-relative URL.

## Scope

- Define the accepted local-path grammar precisely.
- Accept a single-leading-slash local path and fragment links.
- Reject scheme-relative URLs unless the policy explicitly permits them.
- Preserve the explicit `http:` and `https:` handling.
- Add regressions for `//host/path`, encoded control characters, attribute
  delimiters, non-web schemes, fragments, and valid local paths.
- Verify the rendered `href` in a browser or DOM parser, not only with a string
  substring assertion.

Do not broaden the URL policy while fixing this boundary.

## Done when

No input classified as root-relative can navigate to a different host. Tests
fail if a double-leading-slash target becomes an active link.

## Relationship

Hardens the uncommitted prop-table rendering work reviewed under ticket #10.

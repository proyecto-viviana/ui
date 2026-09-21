import { describe, expect, it } from "vite-plus/test";
import { boardRevisionOf } from "./generate-work-views";

/**
 * #588: the board stamp has to move exactly when a view moves.
 *
 * `docs:generate` stamps the views from the board, and the pre-commit `staged`
 * hook then runs `vp check --fix` over the same staged ticket files, so the
 * formatter's rewrite lands *inside* the commit the generator already stamped
 * (`503e50a0`, restamped by `a9ab33ee`). A writer hits the same hole by hand
 * whenever an edit lands after the generator has run. Either way the stamp must
 * move only when one of the fields the two views render moves — path, id, type,
 * title, status, blocked, parent — and hold still for everything else.
 *
 * Fixtures only; the live board is never read here.
 */

const PATH = ".claude/tickets/tasks/900-a-fixture-ticket.md";

// The spelling a writer leaves behind: single-quoted title, one-line flow map,
// a note that escapes its double quotes, loose spacing in the body.
const WRITTEN = `---
id: 900
type: task
title: 'The generated board views are stale at the commit that generates them'
created: 2026-09-21
parent: 544
status: open
history:
  - { state: open, at: 2026-09-21, note: "opened from the round-1 audit, receipt .agents/round-1.md; the popover renders \\"bottom start\\" and the skeptic's 'unproved' stands" }
---

## Scope

One paragraph   that a markdown formatter is free to rewrap however it likes.
`;

// Verbatim output of `vp check --fix` on WRITTEN, not a guess at it: the title
// is requoted to double, the long flow map is expanded, the note flips to
// single quotes with \" unescaped to " and ' doubled to '', and the body's
// spacing is normalised. That requoting is the only transformation ever
// observed to cause this bug — `git diff beb8e9ee 503e50a0 -- .claude/tickets/`
// is it happening to ticket 603. Every parsed value is identical.
const FORMATTED = `---
id: 900
type: task
title: "The generated board views are stale at the commit that generates them"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the round-1 audit, receipt .agents/round-1.md; the popover renders "bottom start" and the skeptic''s ''unproved'' stands',
    }
---

## Scope

One paragraph that a markdown formatter is free to rewrap however it likes.
`;

function stamp(content: string, path = PATH): string {
  return boardRevisionOf([{ path, content }]);
}

function withFrontmatter(content: string, from: string, to: string): string {
  const next = content.replace(from, to);
  expect(next).not.toBe(content);
  return next;
}

describe("boardRevisionOf", () => {
  it("holds still when vp check --fix respells a ticket", () => {
    expect(stamp(FORMATTED)).toBe(stamp(WRITTEN));
  });

  it("moves when a status changes", () => {
    expect(stamp(withFrontmatter(WRITTEN, "status: open", "status: merged"))).not.toBe(
      stamp(WRITTEN),
    );
  });

  it("moves when a title changes", () => {
    expect(stamp(withFrontmatter(WRITTEN, "generates them", "regenerates them"))).not.toBe(
      stamp(WRITTEN),
    );
  });

  it("moves when the blocked flag is set", () => {
    expect(stamp(withFrontmatter(WRITTEN, "status: open", "blocked: true\nstatus: open"))).not.toBe(
      stamp(WRITTEN),
    );
  });

  it("moves when a parent changes", () => {
    expect(stamp(withFrontmatter(WRITTEN, "parent: 544", "parent: 531"))).not.toBe(stamp(WRITTEN));
  });

  it("moves when a transition lands, because the status moves with it", () => {
    const appended = WRITTEN.replace(
      "\n---\n\n## Scope",
      "\n  - { state: next, at: 2026-09-21, note: null }\n---\n\n## Scope",
    ).replace("status: open", "status: next");
    expect(stamp(appended)).not.toBe(stamp(WRITTEN));
  });

  it("moves when a ticket is added or removed", () => {
    const other = WRITTEN.replace("id: 900", "id: 901");
    const otherPath = ".claude/tickets/tasks/901-another-fixture-ticket.md";
    const one = boardRevisionOf([{ path: PATH, content: WRITTEN }]);
    const two = boardRevisionOf([
      { path: PATH, content: WRITTEN },
      { path: otherPath, content: other },
    ]);
    expect(two).not.toBe(one);
  });

  it("moves when a ticket is renamed, because the views link by path", () => {
    expect(stamp(WRITTEN, ".claude/tickets/tasks/900-a-renamed-fixture-ticket.md")).not.toBe(
      stamp(WRITTEN),
    );
  });

  it("does not depend on the order files are handed to it", () => {
    const other = WRITTEN.replace("id: 900", "id: 901");
    const otherPath = ".claude/tickets/tasks/901-another-fixture-ticket.md";
    expect(
      boardRevisionOf([
        { path: otherPath, content: other },
        { path: PATH, content: WRITTEN },
      ]),
    ).toBe(
      boardRevisionOf([
        { path: PATH, content: WRITTEN },
        { path: otherPath, content: other },
      ]),
    );
  });

  // The other half of the contract, and the half the formatter fix alone did
  // not give: a frontmatter field the views never print must not move the
  // stamp either, or "generate, then write the closing history note" stales a
  // view that nobody changed.
  it("holds still when only a history note changes", () => {
    expect(stamp(withFrontmatter(WRITTEN, "round-1 audit", "round-2 audit"))).toBe(stamp(WRITTEN));
  });

  it("holds still when created, subtitle or app change", () => {
    expect(stamp(withFrontmatter(WRITTEN, "created: 2026-09-21", "created: 2026-09-20"))).toBe(
      stamp(WRITTEN),
    );
    expect(
      stamp(withFrontmatter(WRITTEN, "status: open", "subtitle: a qualifier\nstatus: open")),
    ).toBe(stamp(WRITTEN));
    expect(stamp(withFrontmatter(WRITTEN, "status: open", "app: web\nstatus: open"))).toBe(
      stamp(WRITTEN),
    );
  });

  it("ignores the body, which the views do not render and no normalisation survives", () => {
    const rewritten = WRITTEN.replace(
      "One paragraph   that a markdown formatter is free to rewrap however it likes.",
      "A different paragraph entirely, with a new ## Proof section under it.",
    );
    expect(stamp(rewritten)).toBe(stamp(WRITTEN));
  });

  it("keeps unparsable tickets apart, since no view can be rendered from them", () => {
    const broken = "no frontmatter at all\n";
    expect(stamp(broken)).not.toBe(stamp(`${broken}and different text\n`));
  });
});

import { describe, expect, it } from "vite-plus/test";
import { boardRevisionOf } from "./generate-work-views";

/**
 * #588: the board stamp has to be format-insensitive.
 *
 * `docs:generate` stamps the views from the board, and the pre-commit `staged`
 * hook then runs `vp check --fix` over the same staged ticket files, so the
 * formatter's rewrite lands *inside* the commit the generator already stamped.
 * A stamp over raw bytes is therefore stale at the very commit that wrote it
 * (`503e50a0`, restamped by `a9ab33ee`). The stamp must move when the board's
 * meaning moves and hold still when only its spelling does.
 *
 * Fixtures only; the live board is never read here.
 */

const PATH = ".claude/tickets/tasks/900-a-fixture-ticket.md";

// The spelling a writer leaves behind: quoted title, flow-mapped history entry.
const WRITTEN = `---
id: 900
type: task
title: "The generated board views are stale at the commit that generates them"
created: 2026-09-21
parent: 544
status: open
history:
  - { state: open, at: 2026-09-21, note: "opened from the round-1 audit, receipt .agents/round-1.md" }
---

## Scope

One paragraph that a markdown formatter is free to rewrap however it likes.
`;

// The same board, respelled the way \`vp check --fix\` respells it: the title
// loses its quotes, the flow map becomes a block map, the long note folds
// across lines (YAML folds that newline back to one space), and the body is
// rewrapped with trailing whitespace dropped. Every parsed value is identical.
const FORMATTED = `---
id: 900
type: task
title: The generated board views are stale at the commit that generates them
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the round-1 audit, receipt
        .agents/round-1.md",
    }
---

## Scope

One paragraph that a markdown formatter is free to
rewrap however it likes.
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
  it("holds still when the formatter respells a ticket", () => {
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

  it("moves when a history note changes", () => {
    expect(stamp(withFrontmatter(WRITTEN, "round-1 audit", "round-2 audit"))).not.toBe(
      stamp(WRITTEN),
    );
  });

  it("moves when a history entry is appended", () => {
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

  it("ignores the body, which the views do not render and no normalisation survives", () => {
    const rewritten = WRITTEN.replace(
      "One paragraph that a markdown formatter is free to rewrap however it likes.",
      "A different paragraph entirely, with a new ## Proof section under it.",
    );
    expect(stamp(rewritten)).toBe(stamp(WRITTEN));
  });
});

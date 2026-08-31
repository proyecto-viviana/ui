import { describe, expect, it } from "vite-plus/test";
import {
  markReviewed,
  replaceFrontmatter,
  splitFrontmatter,
} from "../../src/app/admin/server/frontmatter";

const DOC = `---
kind: queue
status: current
tasks:
  - id: t1
    title: First task
    state: next
    depends: [t0]
    roadmap: animation
  - id: t2
    title: Second task
    state: done
    finished: 2026-06-09
---

# Title

Status: live queue
Update when: something changes.

Body text with --- a fake fence inside.
`;

describe("splitFrontmatter", () => {
  it("parses the block and returns the exact body", () => {
    const { data, body } = splitFrontmatter(DOC);
    expect(data?.kind).toBe("queue");
    expect(body.startsWith("\n# Title")).toBe(true);
    expect(body).toContain("a fake fence inside");
  });

  it("returns null data for docs without frontmatter", () => {
    const { data, body } = splitFrontmatter("# Plain doc\n");
    expect(data).toBeNull();
    expect(body).toBe("# Plain doc\n");
  });

  it("treats unparseable yaml as no frontmatter", () => {
    const broken = "---\n[: nope\n---\nbody\n";
    expect(splitFrontmatter(broken).data).toBeNull();
  });
});

describe("replaceFrontmatter", () => {
  it("preserves the body byte-for-byte", () => {
    const { data, body } = splitFrontmatter(DOC);
    const rewritten = replaceFrontmatter(DOC, data!);
    expect(splitFrontmatter(rewritten).body).toBe(body);
  });
});

describe("markReviewed", () => {
  it("stamps last_reviewed without touching the body", () => {
    const rewritten = markReviewed(DOC, "2026-06-10");
    const { data, body } = splitFrontmatter(rewritten);
    expect(data?.last_reviewed).toBe("2026-06-10");
    expect(body).toBe(splitFrontmatter(DOC).body);
  });

  it("adds a frontmatter block to plain docs", () => {
    const rewritten = markReviewed("# Plain\n", "2026-06-10");
    const { data, body } = splitFrontmatter(rewritten);
    expect(data?.last_reviewed).toBe("2026-06-10");
    expect(body).toBe("# Plain\n");
  });
});

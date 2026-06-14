import { describe, expect, it } from "vitest";
import {
  extractRoadmapItems,
  extractTasks,
  markReviewed,
  replaceFrontmatter,
  setRoadmapItemStatus,
  setTaskState,
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

Status: Current source of truth
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

describe("extractTasks", () => {
  it("extracts typed tasks with defaults", () => {
    const tasks = extractTasks(splitFrontmatter(DOC).data);
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({
      id: "t1",
      state: "next",
      depends: ["t0"],
      roadmap: "animation",
    });
    expect(tasks[1].finished).toBe("2026-06-09");
  });

  it("ignores malformed entries and unknown states", () => {
    const tasks = extractTasks({
      tasks: [{ id: "x", state: "bogus" }, "junk", { title: "no id" }],
    });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].state).toBe("open");
  });
});

describe("setTaskState", () => {
  it("updates state and stamps finished on done", () => {
    const rewritten = setTaskState(DOC, "t1", "done", "2026-06-10")!;
    const tasks = extractTasks(splitFrontmatter(rewritten).data);
    expect(tasks[0]).toMatchObject({ state: "done", finished: "2026-06-10" });
    expect(splitFrontmatter(rewritten).body).toBe(splitFrontmatter(DOC).body);
  });

  it("clears finished when leaving done", () => {
    const rewritten = setTaskState(DOC, "t2", "in-progress", "2026-06-10")!;
    expect(extractTasks(splitFrontmatter(rewritten).data)[1].finished).toBeNull();
  });

  it("returns null for unknown task ids", () => {
    expect(setTaskState(DOC, "missing", "done", "2026-06-10")).toBeNull();
  });
});

describe("roadmap items", () => {
  const ROADMAP = `---
items:
  - id: animation
    title: Animation
    status: in-progress
    window: { start: 2026-06-08, target: null }
    docs: [animation-sampler.md]
---
body
`;

  it("extracts items with windows", () => {
    const items = extractRoadmapItems(splitFrontmatter(ROADMAP).data);
    expect(items[0]).toMatchObject({ id: "animation", status: "in-progress" });
    expect(items[0].window).toEqual({ start: "2026-06-08", target: null });
  });

  it("updates item status, preserving the body", () => {
    const rewritten = setRoadmapItemStatus(ROADMAP, "animation", "done")!;
    expect(extractRoadmapItems(splitFrontmatter(rewritten).data)[0].status).toBe("done");
    expect(splitFrontmatter(rewritten).body).toBe("body\n");
    expect(setRoadmapItemStatus(ROADMAP, "nope", "done")).toBeNull();
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

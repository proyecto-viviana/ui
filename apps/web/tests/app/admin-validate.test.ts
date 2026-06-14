import { describe, expect, it } from "vitest";
import type { DocTask, RoadmapItem } from "../../src/app/admin/server/frontmatter";
import { type TrackingInput, validateTracking } from "../../src/app/admin/server/validate";

function task(overrides: Partial<DocTask & { doc: string }>): DocTask & { doc: string } {
  return {
    id: "t1",
    title: "Task",
    state: "open",
    depends: [],
    roadmap: "item-a",
    planned: null,
    finished: null,
    doc: ".claude/current/a.md",
    ...overrides,
  };
}

function item(overrides: Partial<RoadmapItem>): RoadmapItem {
  return { id: "item-a", title: "Item A", status: "open", window: null, docs: [], ...overrides };
}

function doc(path: string, frontmatter: Record<string, unknown> | null = null) {
  return {
    path,
    tier: "current",
    frontmatter: frontmatter ?? { kind: "queue", status: "current" },
  };
}

function input(overrides: Partial<TrackingInput>): TrackingInput {
  return {
    docs: [doc(".claude/current/a.md"), doc(".claude/current/roadmap.md")],
    tasks: [task({})],
    roadmap: [item({})],
    ...overrides,
  };
}

const messages = (problems: { message: string }[]) => problems.map((p) => p.message).join("\n");

describe("validateTracking", () => {
  it("accepts a consistent model", () => {
    const result = validateTracking(
      input({
        tasks: [
          task({ id: "a", state: "done", finished: "2026-06-10" }),
          task({ id: "b", state: "in-progress", depends: ["a"] }),
        ],
        roadmap: [item({ status: "in-progress" })],
      }),
    );
    expect(result).toEqual([]);
  });

  it("flags duplicate task ids across docs", () => {
    const result = validateTracking(
      input({ tasks: [task({}), task({ doc: ".claude/current/b.md" })] }),
    );
    expect(messages(result)).toContain('duplicate task id "t1" (also in .claude/current/a.md)');
    expect(result.find((p) => p.message.startsWith("duplicate"))?.doc).toBe(".claude/current/b.md");
  });

  it("flags missing and unknown roadmap refs", () => {
    const result = validateTracking(
      input({ tasks: [task({ roadmap: null }), task({ id: "t2", roadmap: "ghost" })] }),
    );
    expect(messages(result)).toContain('task "t1" has no roadmap item ref');
    expect(messages(result)).toContain('task "t2" references unknown roadmap item "ghost"');
  });

  it("flags depends on unknown task ids", () => {
    const result = validateTracking(input({ tasks: [task({ depends: ["missing"] })] }));
    expect(messages(result)).toContain('task "t1" depends on unknown task "missing"');
  });

  it("enforces done <=> finished", () => {
    const result = validateTracking(
      input({
        tasks: [task({ id: "a", state: "done" }), task({ id: "b", finished: "2026-06-09" })],
      }),
    );
    expect(messages(result)).toContain('task "a" is done but has no finished date');
    expect(messages(result)).toContain('task "b" has a finished date but state "open"');
  });

  it("flags malformed dates and inverted windows", () => {
    const result = validateTracking(
      input({
        tasks: [
          task({
            state: "done",
            finished: "soon",
            planned: { start: "2026-06-12", target: "2026-06-10" },
          }),
        ],
        roadmap: [item({ window: { start: "June", target: null } })],
      }),
    );
    expect(messages(result)).toContain('task "t1" finished "soon" is not YYYY-MM-DD');
    expect(messages(result)).toContain(
      'task "t1" planned start 2026-06-12 is after target 2026-06-10',
    );
    expect(messages(result)).toContain(
      'roadmap item "item-a" window start "June" is not YYYY-MM-DD',
    );
  });

  it("flags raw task entries with missing ids or state typos", () => {
    const result = validateTracking(
      input({
        docs: [
          doc(".claude/current/a.md", {
            kind: "queue",
            status: "current",
            tasks: [
              { title: "no id", state: "open" },
              { id: "typo", state: "in progress" },
            ],
          }),
          doc(".claude/current/roadmap.md"),
        ],
      }),
    );
    expect(messages(result)).toContain("tasks[0] has no id");
    expect(messages(result)).toContain(
      'task "typo" has invalid state "in progress" (expected open|next|in-progress|done|blocked)',
    );
  });

  it("flags current docs without baseline frontmatter", () => {
    const result = validateTracking(
      input({
        docs: [
          doc(".claude/current/a.md"),
          doc(".claude/current/roadmap.md"),
          { path: ".claude/current/bare.md", tier: "current", frontmatter: null },
        ],
      }),
    );
    expect(result).toEqual([
      { doc: ".claude/current/bare.md", message: "missing baseline frontmatter (kind + status)" },
    ]);
  });

  it("ignores non-current tiers", () => {
    const result = validateTracking(
      input({
        docs: [
          doc(".claude/current/a.md"),
          doc(".claude/current/roadmap.md"),
          { path: ".claude/research/x.md", tier: "research", frontmatter: null },
        ],
      }),
    );
    expect(result).toEqual([]);
  });

  it("requires tasks on in-progress roadmap items", () => {
    const result = validateTracking(
      input({
        tasks: [task({})],
        roadmap: [item({ status: "in-progress" }), item({ id: "item-b", status: "in-progress" })],
      }),
    );
    expect(result).toEqual([
      {
        doc: ".claude/current/roadmap.md",
        message: 'roadmap item "item-b" is in-progress but no task references it',
      },
    ]);
  });

  it("flags done items with unfinished tasks, invalid statuses, duplicate ids, missing doc refs", () => {
    const result = validateTracking(
      input({
        tasks: [task({ state: "next" })],
        roadmap: [
          item({ status: "done" }),
          item({ id: "item-a", title: "dupe" }),
          item({ id: "item-b", status: "someday" }),
          item({ id: "item-c", docs: ["ghost.md"] }),
        ],
      }),
    );
    expect(messages(result)).toContain('roadmap item "item-a" is done but task "t1" is next');
    expect(messages(result)).toContain('duplicate roadmap item id "item-a"');
    expect(messages(result)).toContain(
      'roadmap item "item-b" has invalid status "someday" (expected open|in-progress|blocked|done)',
    );
    expect(messages(result)).toContain('roadmap item "item-c" references missing doc "ghost.md"');
  });

  it("flags an empty roadmap", () => {
    const result = validateTracking(input({ tasks: [task({ roadmap: null })], roadmap: [] }));
    expect(messages(result)).toContain("roadmap has no items (frontmatter missing or empty)");
  });
});

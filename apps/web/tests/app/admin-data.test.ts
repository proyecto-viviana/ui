import { describe, expect, it } from "vite-plus/test";
import { isReadablePath, isWritablePath } from "../../src/app/admin/server/data";

describe("admin document paths", () => {
  it("keeps generated views readable but not writable", () => {
    for (const path of [".claude/current/status.md", ".claude/current/roadmap.md"]) {
      expect(isReadablePath(path)).toBe(true);
      expect(isWritablePath(path)).toBe(false);
    }
  });

  it("allows stable current docs and valid tickets to be edited", () => {
    expect(isWritablePath(".claude/current/architecture.md")).toBe(true);
    expect(isWritablePath(".claude/tickets/tasks/12-choose-one-task-state-authority.md")).toBe(
      true,
    );
  });

  it("rejects traversal, absolute, and non-markdown paths", () => {
    expect(isReadablePath("../AGENTS.md")).toBe(false);
    expect(isReadablePath("..%2fAGENTS.md")).toBe(false);
    expect(isReadablePath("/.claude/current/architecture.md")).toBe(false);
    expect(isReadablePath(".claude/current/architecture.ts")).toBe(false);
    expect(isWritablePath("../.claude/tickets/tasks/12-choose-one-task-state-authority.md")).toBe(
      false,
    );
  });
});

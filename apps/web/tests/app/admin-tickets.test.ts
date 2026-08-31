import { describe, expect, it } from "vite-plus/test";
import { splitFrontmatter } from "../../src/app/admin/server/frontmatter";
import {
  type WorkTicket,
  parseTicket,
  setTicketBlocked,
  setTicketStatus,
  validateTicketBoard,
} from "../../src/app/admin/server/tickets";

const TICKET = `---
id: 24
type: task
title: "Test the ticket board"
created: 2026-08-20
status: open
history:
  - { state: open, at: 2026-08-20 }
extra: preserved
---

Body text.
`;
const PATH = ".claude/tickets/tasks/24-test-the-ticket-board.md";

function workTicket(overrides: Partial<WorkTicket> = {}): WorkTicket {
  return {
    id: 24,
    type: "task",
    title: "Test the ticket board",
    subtitle: null,
    created: "2026-08-20",
    parent: null,
    app: null,
    status: "open",
    blocked: false,
    history: [{ state: "open", at: "2026-08-20", note: null }],
    path: PATH,
    ...overrides,
  };
}

describe("parseTicket", () => {
  it("parses a scheme-v1 task", () => {
    const parsed = parseTicket(TICKET, PATH);
    expect(parsed.problems).toEqual([]);
    expect(parsed.ticket).toMatchObject({ id: 24, type: "task", status: "open" });
  });

  it("parses legacy done as merged", () => {
    const content = TICKET.replace("status: open", "status: done").replace(
      "state: open",
      "state: done",
    );
    expect(parseTicket(content, PATH).ticket?.status).toBe("merged");
  });

  it("reports filename, type, date, and history conflicts", () => {
    const content = TICKET.replace("id: 24", "id: 25")
      .replace("type: task", "type: milestone")
      .replace("created: 2026-08-20", "created: soon")
      .replace("status: open", "status: next");
    const result = parseTicket(content, PATH);
    expect(result.problems.map((problem) => problem.message)).toEqual(
      expect.arrayContaining([
        "id 25 does not match filename id 24",
        "type must be task in tasks/",
        "created must use YYYY-MM-DD",
        "status must equal the last history state",
      ]),
    );
  });
});

describe("ticket updates", () => {
  it("appends a lifecycle transition and preserves unknown data and body", () => {
    const rewritten = setTicketStatus(TICKET, 24, "next", "2026-08-21")!;
    const { data, body } = splitFrontmatter(rewritten);
    expect(data?.status).toBe("next");
    expect(data?.extra).toBe("preserved");
    expect(data?.history).toEqual([
      { state: "open", at: "2026-08-20" },
      { state: "next", at: "2026-08-21" },
    ]);
    expect(body).toBe("\nBody text.\n");
  });

  it("stores blocked only when true", () => {
    const blocked = setTicketBlocked(TICKET, 24, true)!;
    expect(splitFrontmatter(blocked).data?.blocked).toBe(true);
    const clear = setTicketBlocked(blocked, 24, false)!;
    expect(splitFrontmatter(clear).data).not.toHaveProperty("blocked");
  });

  it("rejects a mismatched ticket id", () => {
    expect(setTicketStatus(TICKET, 25, "next", "2026-08-21")).toBeNull();
  });
});

describe("validateTicketBoard", () => {
  const directories = new Set(["tasks", "initiatives", "milestones"]);

  it("accepts a valid hierarchy", () => {
    const milestone = workTicket({
      id: 1,
      type: "milestone",
      path: ".claude/tickets/milestones/1-release.md",
    });
    const initiative = workTicket({
      id: 2,
      type: "initiative",
      parent: 1,
      path: ".claude/tickets/initiatives/2-parity.md",
    });
    const task = workTicket({ id: 3, parent: 2 });
    expect(validateTicketBoard([milestone, initiative, task], [], directories)).toEqual([]);
  });

  it("reports missing directories, duplicate ids, and invalid parents", () => {
    const first = workTicket({ id: 1 });
    const duplicate = workTicket({ id: 1, path: ".claude/tickets/tasks/1-duplicate.md" });
    const orphan = workTicket({ id: 2, parent: 99 });
    const result = validateTicketBoard([first, duplicate, orphan], [], new Set(["tasks"]));
    const messages = result.map((problem) => problem.message).join("\n");
    expect(messages).toContain("required ticket directory is missing");
    expect(messages).toContain("duplicate ticket id 1");
    expect(messages).toContain("parent #99 does not exist");
  });
});

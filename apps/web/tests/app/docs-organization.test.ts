import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkDocsOrganization } from "../../../../scripts/docs-organization";

const roots: string[] = [];
const liveDocs = [".claude/current/README.md", ".claude/current/status.md"];

function write(root: string, relative: string, contents: string): void {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "viviana-docs-organization-"));
  roots.push(root);
  write(
    root,
    ".claude/current/README.md",
    `---
kind: index
status: current
---

# Current docs

Status: live index.
Update when: the document set changes.

[Status](status.md)
`,
  );
  write(
    root,
    ".claude/current/status.md",
    `---
kind: generated
status: current
---

# Status

Status: generated ticket view.
Update when: the ticket board changes.
`,
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("documentation organization contract", () => {
  it("accepts the declared live set with valid local links", () => {
    expect(checkDocsOrganization(fixture(), { liveCurrentDocs: liveDocs })).toEqual([]);
  });

  it("rejects an unapproved live document", () => {
    const root = fixture();
    write(
      root,
      ".claude/current/session-audit.md",
      "# Session audit\n\nStatus: live audit.\nUpdate when: findings change.\n",
    );

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toContain(
      "Live-document contract does not allow .claude/current/session-audit.md",
    );
  });

  it("rejects a retired document under the live surface", () => {
    const root = fixture();
    write(
      root,
      ".claude/current/status.md",
      `---
status: archived
---

# Status

Status: generated ticket view.
Update when: the ticket board changes.
`,
    );

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toContain(
      "Retired status archived is not allowed under .claude/current: .claude/current/status.md",
    );
  });

  it("rejects a broken local link", () => {
    const root = fixture();
    write(
      root,
      ".claude/current/status.md",
      `---
status: current
---

# Status

Status: generated ticket view.
Update when: the ticket board changes.

[Missing](missing.md)
`,
    );

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toContain(
      "Broken local link in .claude/current/status.md: .claude/current/missing.md",
    );
  });

  it("requires the index to link to each live document", () => {
    const root = fixture();
    write(
      root,
      ".claude/current/README.md",
      `---
status: current
---

# Current docs

Status: live index.
Update when: the document set changes.
`,
    );

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toContain(
      "Current-doc index does not link to .claude/current/status.md",
    );
  });

  it("rejects an active internal plan under public docs", () => {
    const root = fixture();
    write(root, "docs/release-plan.md", "# Release plan\n\n**Status:** Planned\n\n## The plan\n");

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toContain(
      "Active internal plan is not allowed under public docs: docs/release-plan.md",
    );
  });

  it("rejects a ticket path under .claude that is not on disk", () => {
    const root = fixture();
    write(
      root,
      ".claude/tickets/tasks/example.md",
      "See `.claude/current/tech-debt.md` and [launch](../../current/launch.md).\n",
    );

    const problems = checkDocsOrganization(root, { liveCurrentDocs: liveDocs });
    expect(problems).toContain(
      "Missing ticket path in .claude/tickets/tasks/example.md:1: .claude/current/tech-debt.md",
    );
    expect(problems).toContain(
      "Missing ticket path in .claude/tickets/tasks/example.md:1: .claude/current/launch.md",
    );
  });

  it("accepts a historical or illustrative ticket path, and a path that exists", () => {
    const root = fixture();
    write(
      root,
      ".claude/tickets/tasks/example.md",
      [
        "Replaces `item` from `.claude/current/tech-debt.md` (deleted).",
        "The review used `.claude/tickets/tasks/999-x.md` (example).",
        "Stable policy lives in `.claude/current/status.md`.",
        "Globs such as `.claude/current/*.md` and `.claude/tickets/tasks/603-...md` are not paths.",
        "Bound tuples call `handler[0](handler[1], e)`.",
        "",
      ].join("\n"),
    );

    expect(checkDocsOrganization(root, { liveCurrentDocs: liveDocs })).toEqual([]);
  });
});

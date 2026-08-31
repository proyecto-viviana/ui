import { describe, expect, it } from "vite-plus/test";
import { validateStableDocs } from "../../src/app/admin/server/validate";

const currentDoc = (frontmatter: Record<string, unknown> | null) => ({
  path: ".claude/current/a.md",
  tier: "current",
  frontmatter,
});

describe("validateStableDocs", () => {
  it("accepts stable document metadata without task state", () => {
    expect(
      validateStableDocs([currentDoc({ kind: "reference", status: "current" })], true),
    ).toEqual([]);
  });

  it("requires baseline metadata on current documents", () => {
    expect(validateStableDocs([currentDoc(null)], false)).toEqual([
      {
        doc: ".claude/current/a.md",
        message: "missing baseline frontmatter (kind + status)",
      },
    ]);
  });

  it("rejects legacy task state after migration", () => {
    expect(
      validateStableDocs([currentDoc({ kind: "reference", status: "current", tasks: [] })], true),
    ).toEqual([
      {
        doc: ".claude/current/a.md",
        message: "work state must live in .claude/tickets, not current-document frontmatter",
      },
    ]);
  });

  it("rejects legacy roadmap state after migration", () => {
    expect(
      validateStableDocs([currentDoc({ kind: "roadmap", status: "current", items: [] })], true),
    ).toEqual([
      {
        doc: ".claude/current/a.md",
        message: "work state must live in .claude/tickets, not current-document frontmatter",
      },
    ]);
  });

  it("ignores non-current documents", () => {
    expect(
      validateStableDocs(
        [{ path: ".claude/research/a.md", tier: "research", frontmatter: null }],
        true,
      ),
    ).toEqual([]);
  });
});

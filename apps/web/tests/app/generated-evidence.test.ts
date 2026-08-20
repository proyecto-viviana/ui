import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  checkGeneratedEvidence,
  WCAG_REPORT_COMMAND,
  WCAG_REPORT_GENERATOR,
  WCAG_REPORT_PATH,
} from "../../../../scripts/generated-evidence";

const roots: string[] = [];

function write(root: string, relative: string, contents: string): void {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function report(overrides: Record<string, string | boolean> = {}): string {
  const fields = {
    kind: "generated-evidence",
    status: "current",
    generator: WCAG_REPORT_GENERATOR,
    command: WCAG_REPORT_COMMAND,
    "source-revision": "a".repeat(40),
    "source-dirty": false,
    "generated-at": "2026-08-20T21:12:48.556Z",
    result: "passed",
    scope: "D7 contrast (56 components) and D8 target size (30 components)",
    ...overrides,
  };
  const frontmatter = Object.entries(fields)
    .filter(([, value]) => value !== "")
    .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
    .join("\n");
  return `---
${frontmatter}
---

# WCAG AAA report

- Components scanned for contrast (D7): **56**
- Components scanned for target size (D8): **30**
`;
}

function fixture(contents = report()): string {
  const root = mkdtempSync(path.join(tmpdir(), "viviana-generated-evidence-"));
  roots.push(root);
  write(root, WCAG_REPORT_GENERATOR, "export default class Reporter {}\n");
  write(root, WCAG_REPORT_PATH, contents);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("generated-evidence contract", () => {
  it("accepts a passing report from a clean revision", () => {
    expect(checkGeneratedEvidence(fixture())).toEqual([]);
  });

  it("requires every provenance field", () => {
    const root = fixture(report({ "generated-at": "" }));

    expect(checkGeneratedEvidence(root)).toContain(
      `Generated evidence lacks generated-at: ${WCAG_REPORT_PATH}`,
    );
  });

  it("rejects evidence from a dirty source", () => {
    const root = fixture(report({ "source-dirty": true }));

    expect(checkGeneratedEvidence(root)).toContain(
      `Generated evidence must come from a clean source: ${WCAG_REPORT_PATH}`,
    );
  });

  it("requires a canonical UTC timestamp", () => {
    const root = fixture(report({ "generated-at": "2026-08-20 21:12:48Z" }));

    expect(checkGeneratedEvidence(root)).toContain(
      `Generated evidence has an invalid timestamp: ${WCAG_REPORT_PATH}`,
    );
  });

  it("rejects a failed result", () => {
    const root = fixture(report({ result: "failed" }));

    expect(checkGeneratedEvidence(root)).toContain(
      `Generated evidence does not record a passing result: ${WCAG_REPORT_PATH}`,
    );
  });

  it("requires the structured scope to match the visible summary", () => {
    const root = fixture(
      report({ scope: "D7 contrast (55 components) and D8 target size (30 components)" }),
    );

    expect(checkGeneratedEvidence(root)).toContain(
      `Generated-evidence scope does not match its summary: ${WCAG_REPORT_PATH}`,
    );
  });
});

import { describe, expect, it, vi } from "vite-plus/test";
// @ts-expect-error — plain-JS guard, no types
import { checkAudit, evaluateAuditReport, loadExceptions } from "./check-dependency-security.mjs";

const NOW = new Date("2026-10-21T12:00:00Z");
const ENTRY = loadExceptions()[0];
const PATH = "apps__web>@tanstack/solid-start>@tanstack/start-server-core";

function report(overrides = {}) {
  return {
    advisories: {
      "1242282": {
        github_advisory_id: "GHSA-qx66-fv34-fjm8",
        module_name: "@tanstack/start-server-core",
        severity: "critical",
        findings: [{ version: "1.169.26", paths: [PATH] }],
        ...overrides,
      },
    },
    metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 1 } },
  };
}

describe("reviewed security exceptions", () => {
  it("passes the listed advisory, exact version and private workspace before expiry", () => {
    const result = evaluateAuditReport(report(), [ENTRY], NOW);
    expect(result.failures).toEqual([]);
    expect(result.accepted).toEqual([ENTRY]);
  });

  it.each(["2026-11-03T00:00:00Z", "2026-11-04T12:00:00Z"])(
    "fails the expired exception at %s",
    (date) => {
      const result = evaluateAuditReport(report(), [ENTRY], new Date(date));
      expect(result.accepted).toEqual([]);
      expect(result.failures.join("\n")).toContain("expired security exception");
    },
  );

  it("passes up to the UTC expiry boundary", () => {
    expect(
      evaluateAuditReport(report(), [ENTRY], new Date("2026-11-02T23:59:59.999Z")).failures,
    ).toEqual([]);
  });

  it("fails an unlisted advisory even when another advisory is listed", () => {
    expect(
      evaluateAuditReport(
        report({ github_advisory_id: "GHSA-aaaa-bbbb-cccc" }),
        [ENTRY],
        NOW,
      ).failures.join("\n"),
    ).toContain("GHSA-aaaa-bbbb-cccc");
  });

  it("does not except lower-severity unlisted advisories", () => {
    const audit = report({ severity: "moderate" });
    audit.metadata.vulnerabilities.critical = 0;
    audit.metadata.vulnerabilities.moderate = 1;
    expect(evaluateAuditReport(audit, [], NOW).failures).toHaveLength(1);
  });

  it("fails hidden lower-severity findings even when the visible advisory is excepted", () => {
    const audit = report();
    audit.metadata.vulnerabilities.moderate = 1;
    const result = evaluateAuditReport(audit, [ENTRY], NOW);
    expect(result.accepted).toHaveLength(1);
    expect(result.failures.join("\n")).toContain("without complete advisory details");
  });

  it("still fails an unlisted advisory alongside an accepted finding", () => {
    const mixed = report();
    Object.assign(mixed.advisories, {
      other: report({ github_advisory_id: "GHSA-aaaa-bbbb-cccc" }).advisories["1242282"],
    });
    const result = evaluateAuditReport(mixed, [ENTRY], NOW);
    expect(result.accepted).toHaveLength(1);
    expect(result.failures).toHaveLength(1);
  });

  it("passes a complete clean audit, but requires expired entries to be removed", () => {
    const clean = {
      advisories: {},
      metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 } },
    };
    expect(evaluateAuditReport(clean, [], NOW).failures).toEqual([]);
    expect(
      evaluateAuditReport(clean, [ENTRY], new Date("2026-11-03T00:00:00Z")).failures,
    ).toHaveLength(1);
  });

  it("rejects duplicate exception identities", () => {
    expect(evaluateAuditReport(report(), [ENTRY, ENTRY], NOW).failures.join("\n")).toContain(
      "duplicate security exception",
    );
  });

  it.each([
    { module_name: "another-package" },
    { findings: [{ version: "1.169.27", paths: [PATH] }] },
    { findings: [{ version: "1.169.26", paths: ["packages__solidaria>" + ENTRY.package] }] },
    { findings: [{ version: "1.169.26", paths: [PATH, "packages__solidaria>" + ENTRY.package] }] },
  ])("fails a package, version or reach mismatch: %j", (overrides) => {
    expect(evaluateAuditReport(report(overrides), [ENTRY], NOW).failures).toHaveLength(1);
  });

  it.each([
    {},
    { error: { code: "REGISTRY_UNAVAILABLE" } },
    { advisories: {}, metadata: report().metadata },
    report({ findings: [] }),
    report({ findings: [{ version: "1.169.26", paths: [] }] }),
  ])("fails incomplete audit data: %j", (audit) => {
    expect(evaluateAuditReport(audit, [ENTRY], NOW).failures.length).toBeGreaterThan(0);
  });

  it.each([
    { ...ENTRY, expires: "2026-02-30" },
    { ...ENTRY, reason: "" },
    { ...ENTRY, reach: "" },
    { ...ENTRY, version: "^1.169.26" },
    { ...ENTRY, workspace: ["apps/web"] },
    { ...ENTRY, version: ["1.169.26"] },
  ])("fails malformed exceptions: %j", (entry) => {
    expect(evaluateAuditReport(report(), [entry], NOW).failures.join("\n")).toMatch(
      /malformed security exception|invalid exception expiry/,
    );
  });
});

describe("audit command failures", () => {
  function execute(result: object) {
    return vi.fn(() => ({ stdout: JSON.stringify(report()), stderr: "", signal: null, ...result }));
  }

  it("accepts audit exit 1 only when all findings have a current exception", () => {
    const run = execute({ status: 1 });
    expect(checkAudit("fixture", ["--prod"], [ENTRY], NOW, run)).toBe(0);
    expect(run.mock.calls[0].slice(0, 2)).toEqual([
      "vp",
      ["pm", "audit", "--", "--json", "--audit-level=info", "--prod"],
    ]);
    expect(checkAudit("fixture", [], [], NOW, execute({ status: 1 }))).toBe(1);
    expect(checkAudit("fixture", [], [], NOW, execute({ status: 0 }))).toBe(1);
  });

  it.each([
    { status: 23 },
    { status: null, signal: "SIGTERM" },
    { status: 1, stdout: "registry timeout" },
    { status: 1, stdout: JSON.stringify({ error: "registry timeout" }) },
    { status: 1, stdout: "null" },
  ])("never waives a transport or parse failure: %j", (result) => {
    expect(checkAudit("fixture", [], [ENTRY], NOW, execute(result))).toBe(1);
  });
});

/**
 * Rule #7: the children-snapshot heuristic flags a rendered `children()`
 * snapshot and ignores a structural `.toArray()` probe.
 *
 * Lives under packages test include because root vitest.config.ts does not
 * cover scripts/*.test.ts (that config is owned outside #192).
 */
import { describe, expect, it } from "vite-plus/test";
import { findRenderedChildrenSnapshots } from "../../../scripts/check-idiomatic-solid.ts";

const SNAPSHOT_RENDERED = `
import { children } from "solid-js";

function ActionButton(props: { children?: unknown }) {
  const resolvedChildren = children(() => props.children);
  const content = () => resolvedChildren();
  return content();
}
`;

const STRUCTURAL_ONLY = `
import { children } from "solid-js";

function StaticBreadcrumbItems(props: { children?: unknown }) {
  const staticChildren = children(() => props.children);
  const array = staticChildren.toArray();
  return array.length;
}
`;

describe("findRenderedChildrenSnapshots", () => {
  it("flags children() whose result is returned as content", () => {
    const sites = findRenderedChildrenSnapshots(SNAPSHOT_RENDERED);
    expect(sites).toEqual([{ ident: "resolvedChildren", ordinal: 0, line: 5 }]);
  });

  it("keys a second binding of the same name by ordinal, not line", () => {
    const twice = `${SNAPSHOT_RENDERED}\n${SNAPSHOT_RENDERED.replace("ActionButton", "ActionButtonGroup")}`;
    const sites = findRenderedChildrenSnapshots(twice);
    expect(sites.map((s) => `${s.ident}#${s.ordinal}`)).toEqual([
      "resolvedChildren#0",
      "resolvedChildren#1",
    ]);
  });

  it("does not flag children() used only with toArray / length", () => {
    const sites = findRenderedChildrenSnapshots(STRUCTURAL_ONLY);
    expect(sites).toEqual([]);
  });
});

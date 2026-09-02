/**
 * Hydration regression for the styled Tree (client half).
 *
 * Guards two distinct regressions:
 *  1. Eager-JSX-double-use theft: the styled Tree used to construct both
 *     return branches eagerly, so building the unused detached `framed` div
 *     MOVED the server nodes the returned `collection` had just claimed, and
 *     the live page hydrated an empty subtree. The failure is SILENT — no
 *     Hydration Mismatch warning, no throw — so the load-bearing assertion is
 *     that the rows still exist in the DOM after hydrate() returns, not merely
 *     that nothing complained. See fixtures/tree.tsx for the mechanism.
 *  2. Repeated `local.children` reads (ResolvedItemContent/TreeItemContent):
 *     each read of a static-JSX children getter re-instantiates the subtree,
 *     so the server's first, discarded instantiation consumed a hydration tick
 *     and the emitted copy carried shifted keys — the client threw "Hydration
 *     Mismatch. Unable to find DOM nodes for hydration key". Fixed by the
 *     read-once pattern (see gridlist's ResolvedItemContent).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { TreeFixture, TreeLabeledFixture } from "./fixtures/tree";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

describe("Tree hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("bare Tree keeps its rows after hydration", () => {
    const container = hydrateOverSsr(readSsr("tree-ssr.html"), () => <TreeFixture />);
    // THE regression assertion: the theft left the live DOM with only
    // hydration markers here while both checks above still passed.
    expect(container.querySelectorAll('[role="row"]').length).toBe(4);
    expect(container.textContent).toContain("Projects");
  });

  it("labeled (framed) Tree keeps its rows after hydration", () => {
    const container = hydrateOverSsr(readSsr("tree-labeled-ssr.html"), () => (
      <TreeLabeledFixture />
    ));
    expect(container.querySelectorAll('[role="row"]').length).toBe(4);
    expect(container.textContent).toContain("Projects");
  });
});

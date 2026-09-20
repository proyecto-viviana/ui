/**
 * Regression for #555 item 9: `createId` reached from a lazy prop getter.
 *
 * Item 7 (`4bbdeff7`) made `createId` generate before choosing a default id.
 * The call `createLabels` makes is reached from `get fieldProps`, which runs
 * during the hydration walk with no reactive owner, so `createUniqueId` →
 * `getNextContextId` → `getNextChildId(getOwner())` threw, and every later id
 * in the pass depended on when a consumer happened to read the prop. The hook
 * bodies now own the generation; this exercises the path under a real
 * hydration, which item 7's `createRoot` test could not.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, afterEach } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { CreateIdLabelsFixture } from "./fixtures/createIdLabels";

const html = readFileSync(
  resolve(import.meta.dirname, "../../../output/create-id-labels-ssr.html"),
  "utf8",
);

afterEach(() => {
  cleanupHydrationRoots();
  document.body.innerHTML = "";
});

describe("createId under a hydration pass", () => {
  it("adopts both server inputs and keeps the ids the server emitted", async () => {
    let serverInputs: string[] = [];
    let serverLabelledBy: string[] = [];
    let serverNodes: Element[] = [];

    const container = await hydrateOverSsr(html, () => <CreateIdLabelsFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll("input"));
        expect(serverNodes).toHaveLength(2);
        serverInputs = serverNodes.map((node) => node.id);
        serverLabelledBy = serverNodes.map((node) => node.getAttribute("aria-labelledby") ?? "");
        expect(serverInputs.every(Boolean)).toBe(true);
        expect(serverLabelledBy.every(Boolean)).toBe(true);
      },
    });

    const inputs = Array.from(container.querySelectorAll("input"));
    // Same nodes: a client id namespace out of step with the server's would
    // have left these detached and the server nodes unclaimed.
    expect(inputs).toEqual(serverNodes);
    expect(inputs.map((node) => node.id)).toEqual(serverInputs);
    expect(inputs.map((node) => node.getAttribute("aria-labelledby"))).toEqual(serverLabelledBy);

    // And the labels still point at the fields they name, in order.
    const labels = Array.from(container.querySelectorAll("label"));
    expect(labels.map((label) => label.id)).toEqual(serverLabelledBy);
    expect(labels.map((label) => label.getAttribute("for"))).toEqual(serverInputs);
  });
});

import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import { checkWorkflowPins, findUnpinnedRefs } from "./check-workflow-pins.mjs";

describe("findUnpinnedRefs", () => {
  it("names a global install pinned to a range", () => {
    const problems = findUnpinnedRefs(
      "release.yml",
      "      - name: Upgrade npm\n        run: npm install -g npm@^11.5.1\n",
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("release.yml:2");
    expect(problems[0]).toContain("npm@^11.5.1");
  });

  it("accepts a global install pinned to an exact version", () => {
    expect(findUnpinnedRefs("release.yml", "        run: npm install -g npm@11.19.1\n")).toEqual(
      [],
    );
  });

  it("names a global install with no version at all", () => {
    expect(findUnpinnedRefs("release.yml", "        run: npm install --global npm\n")).toHaveLength(
      1,
    );
  });

  it("names an action pinned to a mutable tag", () => {
    expect(findUnpinnedRefs("release.yml", "      - uses: changesets/action@v1\n")).toHaveLength(1);
  });

  it("accepts an action pinned to a commit SHA", () => {
    expect(
      findUnpinnedRefs(
        "release.yml",
        "      - uses: changesets/action@a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d # v1.9.0\n",
      ),
    ).toEqual([]);
  });

  it("leaves a local action alone; the checkout already pins it", () => {
    expect(findUnpinnedRefs("ci.yml", "      - uses: ./.github/actions/setup\n")).toEqual([]);
  });
});

describe("checkWorkflowPins", () => {
  it("passes this repository's workflows", () => {
    expect(checkWorkflowPins()).toBe(0);
  });
});

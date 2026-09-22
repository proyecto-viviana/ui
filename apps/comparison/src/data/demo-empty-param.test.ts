import { describe, expect, it } from "vite-plus/test";

import { badgeDemoPropsFromSearch, normalizeBadgeDemoProps } from "./badge-demo";
import { linkDemoPropsFromSearch, normalizeLinkDemoProps } from "./link-demo";

// Root vitest include lists data/**/*.test.ts, not src/scripts/**/*.test.ts.
import "../scripts/component-controls.test";

const demoModules = import.meta.glob<Record<string, unknown>>("./*-demo.ts", { eager: true });

interface DemoPair {
  file: string;
  readName: string;
  normalizeName: string;
  read: (search: string) => { children?: unknown };
  normalize: (props: { children?: string }) => { children?: unknown };
}

function normalizeNameFor(readName: string): string | null {
  const head = /^(\w+)DemoPropsFromSearch$/.exec(readName)?.[1];
  if (!head) {
    return null;
  }

  return `normalize${head.charAt(0).toUpperCase()}${head.slice(1)}DemoProps`;
}

function demoPairs(): DemoPair[] {
  const pairs: DemoPair[] = [];

  for (const [file, mod] of Object.entries(demoModules)) {
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value !== "function") {
        continue;
      }

      const normalizeName = normalizeNameFor(name);
      if (!normalizeName) {
        continue;
      }

      const normalize = mod[normalizeName];
      if (typeof normalize !== "function") {
        continue;
      }

      pairs.push({
        file,
        readName: name,
        normalizeName,
        read: value as DemoPair["read"],
        normalize: normalize as DemoPair["normalize"],
      });
    }
  }

  pairs.sort((left, right) => left.readName.localeCompare(right.readName));
  return pairs;
}

const pairs = demoPairs();

describe("explicit empty children", () => {
  it("agrees for badge", () => {
    expect(badgeDemoPropsFromSearch("children=").children).toBe(
      normalizeBadgeDemoProps({ children: "" }).children,
    );
  });

  it("agrees for link", () => {
    expect(linkDemoPropsFromSearch("children=").children).toBe(
      normalizeLinkDemoProps({ children: "" }).children,
    );
  });

  it(`agrees across ${pairs.length} search/normalize pairs`, () => {
    expect(pairs.map((pair) => pair.readName)).toEqual(
      expect.arrayContaining(["badgeDemoPropsFromSearch", "linkDemoPropsFromSearch"]),
    );

    const mismatches: string[] = [];

    for (const pair of pairs) {
      try {
        const readChildren = pair.read("children=").children;
        const normalizedChildren = pair.normalize({ children: "" }).children;
        if (readChildren !== normalizedChildren) {
          mismatches.push(
            `${pair.file} ${pair.readName} ${JSON.stringify(readChildren)} vs ${pair.normalizeName} ${JSON.stringify(normalizedChildren)}`,
          );
        }
      } catch (error) {
        mismatches.push(
          `${pair.file} ${pair.readName} threw ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    expect(mismatches).toEqual([]);
  });
});

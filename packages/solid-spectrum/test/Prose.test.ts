import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";

describe("Adobe prose macro", () => {
  it("emits the same class and CSS as pinned @react-spectrum/ai prose", () => {
    const root = path.resolve(import.meta.dirname, "../../..");
    const output = execFileSync(
      path.join(root, "node_modules/.bin/tsx"),
      [path.join(root, "packages/solid-spectrum/test/prose-oracle.ts")],
      {
        cwd: root,
        encoding: "utf8",
        env: process.env,
      },
    );
    expect(output).toMatch(/^MATCH class=\S+ len=\d+\n$/);
  });
});

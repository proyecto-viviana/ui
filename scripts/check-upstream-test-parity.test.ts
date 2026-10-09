import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";

const checkout = process.cwd();
const require = createRequire(path.join(checkout, "package.json"));
const loader = require.resolve("tsx/cli");
const cli = path.join(checkout, "scripts/check-upstream-test-parity.ts");
const pin = JSON.parse(readFileSync(path.join(checkout, "scripts/upstream-pin.json"), "utf8"));

function runCase(imports: string, expression: string) {
  const root = mkdtempSync("/tmp/ui-579-fixture-");
  const write = (name: string, content: string) => {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  write("scripts/upstream-pin.json", JSON.stringify(pin));
  write(
    "scripts/upstream-test-parity-baseline.json",
    JSON.stringify({ suspects: [], coverageGaps: [], upstreamOnly: [] }),
  );
  for (const pkg of ["react-aria-components", "@react-spectrum/s2"]) {
    write(
      `react-spectrum/packages/${pkg}/package.json`,
      JSON.stringify({ version: pin.tags[pkg] }),
    );
    mkdirSync(path.join(root, `react-spectrum/packages/${pkg}/test`), { recursive: true });
  }
  for (const subject of ["Switch", "Button", "Host"]) {
    write(
      `react-spectrum/packages/react-aria-components/test/${subject}.test.js`,
      "test('oracle', () => {});",
    );
  }
  write(
    "packages/fixture/test/Host.test.tsx",
    `import { ${imports} } from '../src';\ntest('attributes', () => { render(${expression}); expect(control).toHaveAttribute('aria-checked', 'true'); });\n`,
  );
  const result = spawnSync(process.execPath, [loader, cli], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${path.dirname(process.execPath)}:${path.join(checkout, "node_modules/.bin")}:${process.env.PATH}`,
    },
    encoding: "utf8",
  });
  const output = result.stdout + result.stderr;
  write("cli-output.log", output);
  write(
    "cli-receipt.json",
    JSON.stringify({
      command: [process.execPath, loader, cli],
      cwd: root,
      status: result.status,
      error: result.error?.message,
    }),
  );
  expect(result.error).toBeUndefined();
  // Empty baseline deliberately rejects these added facts with exit 1.
  expect(result.status).toBe(1);
  expect(output).not.toContain("DRIFT");
  return output;
}

function expectAttribution(output: string, key: string, unmatched: string[]) {
  expect(output).toContain(`● ${key}  [score 2]\n  ours:     packages/fixture/test/Host.test.tsx`);
  expect(output).toContain("    aria-checked ← packages/fixture/test/Host.test.tsx");
  expect(output.split("New suspect facts:\n")[1]).toBe(
    `  - ${key}|aria|aria-checked\nNew upstream suites without a port-level test:\n${unmatched.map((name) => `  - ${name}\n`).join("")}`,
  );
}

describe("upstream parity CLI array attribution", () => {
  it("recovers one Switch through nested literal spreads in a misleading host file", () => {
    expectAttribution(runCase("Switch", "[...[...[<Switch />]]]"), "switch", ["button", "host"]);
  });
  it("preserves ordinary single Button arrays", () => {
    expectAttribution(runCase("Button", "[<Button />]"), "button", ["host", "switch"]);
  });
  it("preserves filename fallback for two distinct ordinary sibling subjects", () => {
    expectAttribution(runCase("Button, Switch", "[<Button />, <Switch />]"), "host", [
      "button",
      "switch",
    ]);
  });
});

import { describe, expect, it } from "vite-plus/test";

import {
  comparisonRootFrom,
  evaluateFixtureModuleSource,
  evaluateFixtureRegistries,
  evaluateRegistrySource,
} from "../../scripts/fixture-registry-split";

describe("fixture registry split", () => {
  it("keeps the live registries on dynamic import() entries and per-slug modules", () => {
    const root = comparisonRootFrom(import.meta.url);
    expect(root.replaceAll("\\", "/")).toMatch(/apps\/comparison$/);
    expect(evaluateFixtureRegistries(root)).toEqual([]);
  });

  it("fails when a registry statically imports a per-slug fixture", () => {
    const source = `import Button from "./styled/button.js";\nexport const reactStyledFixtures = {\n  button: () => Promise.resolve({ default: Button }),\n};\n`;
    const problems = evaluateRegistrySource("src/components/react/fixtures/styled.js", source);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every((problem) => problem.kind === "static-registry-import")).toBe(true);
  });

  it("accepts a registry that only dynamically imports per-slug fixtures", () => {
    const source = `export const reactStyledFixtures = {\n  button: () => import("./styled/button.js"),\n};\n`;
    expect(evaluateRegistrySource("src/components/react/fixtures/styled.js", source)).toEqual([]);
  });

  it("fails when a fixture module imports another slug's fixture file", () => {
    const known = new Set(["button", "combobox"]);
    expect(
      evaluateFixtureModuleSource(
        "src/components/react/fixtures/styled/button.js",
        `import ComboBox from "./combobox.js";\nexport default ComboBox;\n`,
        known,
      ),
    ).toEqual([expect.objectContaining({ kind: "cross-slug-fixture-import" })]);
  });

  it("fails when a fixture module imports a design-system component whose slug is not its own", () => {
    const known = new Set(["button", "combobox"]);
    expect(
      evaluateFixtureModuleSource(
        "src/components/react/fixtures/styled/button.js",
        `import { ComboBox } from "@react-spectrum/s2";\nexport default () => ComboBox;\n`,
        known,
      ),
    ).toEqual([expect.objectContaining({ kind: "cross-slug-component-import" })]);
  });

  it("allows composition chrome such as Button inside a toast fixture", () => {
    const known = new Set(["button", "toast"]);
    expect(
      evaluateFixtureModuleSource(
        "src/components/react/fixtures/styled/toast.js",
        `import { Button, ToastContainer } from "@react-spectrum/s2";\nexport default () => Button;\n`,
        known,
      ),
    ).toEqual([]);
  });
});

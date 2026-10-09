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

function runCase(imports: string, expression: string, body?: string, drift = false) {
  const root = mkdtempSync("/tmp/ui-579-target-fixture-");
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
      JSON.stringify({ version: drift ? "0.0.0" : pin.tags[pkg] }),
    );
    mkdirSync(path.join(root, `react-spectrum/packages/${pkg}/test`), { recursive: true });
  }
  for (const subject of ["Switch", "Button", "Host", "Dialog", "TextField"]) {
    write(
      `react-spectrum/packages/react-aria-components/test/${subject}.test.js`,
      "test('oracle', () => {});",
    );
  }
  write(
    "packages/fixture/test/Host.test.tsx",
    `import { ${imports} } from '../src';\ntest('attributes', () => { ${body ?? `render(${expression}); expect(control).toHaveAttribute('aria-checked', 'true');`} });\n`,
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
  if (drift) expect(output).toContain("DRIFT");
  else expect(output).not.toContain("DRIFT");
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
    expectAttribution(runCase("Switch", "[...[...[<Switch />]]]"), "switch", [
      "button",
      "dialog",
      "host",
      "textfield",
    ]);
  });
  it("preserves ordinary single Button arrays", () => {
    expectAttribution(runCase("Button", "[<Button />]"), "button", [
      "dialog",
      "host",
      "switch",
      "textfield",
    ]);
  });
  it("preserves filename fallback for two distinct ordinary sibling subjects", () => {
    expectAttribution(runCase("Button, Switch", "[<Button />, <Switch />]"), "host", [
      "button",
      "dialog",
      "switch",
      "textfield",
    ]);
  });
});

function dialogCase(
  children: string,
  extra = "",
  imported = "AlertDialog as Notice",
  tag = "Notice",
  role = "alertdialog",
) {
  return runCase(
    imported,
    "",
    `
    render(() => (<><span id="details-A">Details A</span><${tag} aria-details="details-A" {...({role: "dialog"})}><span>Generated content</span>${children}</${tag}></>));
    const root = screen.getByRole("${role}");
    const input = within(root).getByRole("textbox");
    input.focus();
    await waitFor(() => { expect(within(root).getByRole("textbox")).toBe(input); expect(input).toHaveFocus(); });
    expect(root).toHaveAttribute("aria-details", "details-A");
    ${extra}
  `,
  );
}

function facts(output: string) {
  return output.split("New suspect facts:\n")[1]?.split("New upstream suites")[0];
}

describe("target-bound raw input attribution", () => {
  it.each(["solid-spectrum", "viviana-ui"])(
    "attributes the unchanged real %s caller-contract body",
    (pkg) => {
      const source = readFileSync(
        path.join(checkout, `packages/${pkg}/test/Dialog.test.tsx`),
        "utf8",
      );
      const title = source.indexOf(
        "forwards live caller attributes without replacing the open root or focused child",
      );
      expect(title).toBeGreaterThan(0);
      const start = source.indexOf("    const [value, setValue]", title);
      const end = source.indexOf("\n  });", start);
      expect(end).toBeGreaterThan(start);
      const output = runCase("AlertDialog", "", source.slice(start, end));
      expect(facts(output)).toBe(
        "  - dialog|aria|aria-describedby\n  - dialog|aria|aria-details\n  - dialog|aria|aria-label\n  - dialog|aria|aria-labelledby\n  - dialog|role|alertdialog\n",
      );
      expect(output).toContain("alertdialog ← packages/fixture/test/Host.test.tsx");
      expect(output).toContain("aria-details ← packages/fixture/test/Host.test.tsx");
    },
  );
  it.each([
    ["AlertDialog", "AlertDialog"],
    ["AlertDialog as Notice", "Notice"],
  ])("attributes the styled %s fixture queries only", (imported, tag) => {
    const output = dialogCase('<input aria-label="Persistent input" />', "", imported, tag);
    expect(facts(output)).toBe(
      "  - dialog|aria|aria-details\n  - dialog|aria|aria-label\n  - dialog|role|alertdialog\n",
    );
    expect(output).toContain("aria-details ← packages/fixture/test/Host.test.tsx");
    expect(output).toContain("alertdialog ← packages/fixture/test/Host.test.tsx");
    expect(output).not.toContain("dialog|role|textbox");
  });
  it("supports literal text type and direct render callbacks", () => {
    const output = runCase(
      "Dialog",
      "",
      `render(() => <Dialog><input type="text" /></Dialog>); const root = screen.getByRole("dialog"); within(root).getByRole("textbox"); expect(root).toHaveAttribute("aria-details", "details");`,
    );
    expect(facts(output)).toBe("  - dialog|aria|aria-details\n  - dialog|role|dialog\n");
  });
  it.each([
    ["password", '<input type="password" />', ""],
    ["checkbox", '<input type="checkbox" />', ""],
    ["hidden", '<input type="hidden" />', ""],
    ["dynamic type", "<input type={kind} />", ""],
    ["spread", "<input {...props} />", ""],
    ["hidden attribute", "<input hidden />", ""],
    ["explicit role", '<input role="textbox" />', ""],
    ["unknown child", "<Unknown /><input />", ""],
    ["competing controls", "<textarea /><input />", ""],
    ["competing inputs", "<input /><input />", ""],
    ["dynamic children", "{children}<input />", ""],
    ["shadowed root", "<input />", '{ const root = other; within(root).getByRole("textbox"); }'],
    [
      "destructured shadow",
      "<input />",
      '{ const {root} = other; within(root).getByRole("textbox"); }',
    ],
    ["shadowed import", "<input />", "const Notice = other;"],
    ["independent global", "<input />", 'screen.getByRole("textbox");'],
    [
      "ambiguous global",
      "<input />",
      'screen.queryByRole("textbox"); screen.getByRole("textbox");',
    ],
    ["host assertion", "<input />", 'expect(root).toHaveAttribute("role", "textbox");'],
    ["second root", "<input />", 'const second = screen.getByRole("dialog");'],
  ])("retains textbox for %s", (_name, children, extra) => {
    const output = dialogCase(children, extra, "AlertDialog as Notice, Unknown");
    // Existing textarea fixture rule is preserved: it already deletes textbox.
    if (children.includes("textarea")) expect(output).not.toContain("dialog|role|textbox");
    else {
      expect(facts(output)).toBe(
        `  - dialog|aria|aria-details\n  - dialog|role|alertdialog\n${extra.includes("const second") ? "  - dialog|role|dialog\n" : ""}  - dialog|role|textbox\n`,
      );
      expect(output).toContain("textbox ← packages/fixture/test/Host.test.tsx");
    }
  });
  it("retains TextField host vocabulary with an unrelated raw input", () => {
    const output = runCase(
      "TextField",
      "",
      `render(() => <TextField><input /></TextField>); const root = screen.getByRole("dialog"); within(root).getByRole("textbox");`,
    );
    expect(output).toContain("textfield|role|textbox");
  });
  it("preserves form, textarea and composed dialog fixture rules", () => {
    const output = runCase(
      "Button, Dialog",
      "",
      `render(() => <Button><form /><textarea /><Dialog /></Button>); screen.getByRole("textbox"); screen.getByRole("form"); screen.getByRole("dialog"); expect(control).toHaveAttribute("aria-checked", "true");`,
    );
    expect(facts(output)).toBe("  - button|aria|aria-checked\n");
  });
  it("rejects fresh host ARIA, keys and roles and prints truthful wording", () => {
    const output = runCase(
      "Button",
      "",
      `render(() => <Button />); screen.getByRole("textbox"); expect(control).toHaveAttribute("aria-invalid", "true"); user.keyboard("{Enter}");`,
    );
    expect(facts(output)).toBe(
      "  - button|aria|aria-invalid\n  - button|key|enter\n  - button|role|textbox\n",
    );
    expect(output).toContain("● button  [score 13]");
    expect(output).toContain("vocabulary found locally and absent from matched upstream tests");
    expect(output).not.toContain("wrong shape");
  });
  it("rejects pin drift", () => {
    runCase("Button", "<Button />", undefined, true);
  });
});

describe("target proof conservative boundaries", () => {
  it.each([
    ["outer competing root", '<span role="alertdialog"><input type="password" /></span>', ""],
    ["outer unknown descendant", "<span><Unknown /></span>", ""],
    ["local class declaration", '<span id="details-A">Details A</span>', "class Notice {}"],
    [
      "direct named class expression",
      '<span id="details-A">Details A</span>',
      "const Other = class Notice {};",
    ],
  ])("retains textbox for %s", (_name, outer, binding) => {
    const output = runCase(
      "AlertDialog as Notice",
      "",
      `
      ${binding}
      render(() => <>${outer}<Notice><input /></Notice></>);
      const root = screen.getByRole("alertdialog");
      const input = within(root).getByRole("textbox");
      expect(within(root).getByRole("textbox")).toBe(input);
      expect(root).toHaveAttribute("aria-details", "details-A");
    `,
    );
    expect(facts(output)).toBe(
      "  - dialog|aria|aria-details\n  - dialog|role|alertdialog\n  - dialog|role|textbox\n",
    );
    expect(output).toContain("textbox ← packages/fixture/test/Host.test.tsx");
    expect(output).toContain("● dialog  [score 22]");
  });
});

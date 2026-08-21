import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const PUBLIC_SOURCE_ROOTS = [
  "packages/solid-stately/src",
  "packages/solidaria/src",
  "packages/solidaria-components/src",
  "packages/kumo/src",
  "packages/solid-spectrum/src",
  "packages/viviana-ui/src",
];

const SAFE_DIRECT_REFS = new Map<string, RegExp>([
  [
    "packages/solid-spectrum/src/checkbox/index.tsx#boxElement",
    /checkboxPressScaleStyle\(boxElement/,
  ],
  [
    "packages/solid-spectrum/src/numberfield/index.tsx#decrementButtonElement",
    /buttonPressScaleStyle\(decrementButtonElement/,
  ],
  [
    "packages/solid-spectrum/src/numberfield/index.tsx#incrementButtonElement",
    /buttonPressScaleStyle\(incrementButtonElement/,
  ],
  [
    "packages/solid-spectrum/src/radio/index.tsx#circleElement",
    /radioPressScaleStyle\(circleElement/,
  ],
  ["packages/solid-spectrum/src/slider/index.tsx#thumbElement", /pressScaleStyle\(thumbElement/],
  [
    "packages/solid-spectrum/src/switch/ToggleSwitch.tsx#handleElement",
    /switchHandlePressStyle\(handleElement/,
  ],
  ["packages/viviana-ui/src/checkbox/index.tsx#boxElement", /checkboxPressScaleStyle\(boxElement/],
  [
    "packages/viviana-ui/src/numberfield/index.tsx#decrementButtonElement",
    /buttonPressScaleStyle\(decrementButtonElement/,
  ],
  [
    "packages/viviana-ui/src/numberfield/index.tsx#incrementButtonElement",
    /buttonPressScaleStyle\(incrementButtonElement/,
  ],
  ["packages/viviana-ui/src/radio/index.tsx#circleElement", /radioPressScaleStyle\(circleElement/],
  ["packages/viviana-ui/src/slider/index.tsx#thumbElement", /pressScaleStyle\(thumbElement/],
  [
    "packages/viviana-ui/src/switch/ToggleSwitch.tsx#handleElement",
    /switchHandlePressStyle\(handleElement/,
  ],
]);

const REQUIRED_BEHAVIOR = [
  {
    file: "packages/solidaria-components/src/Dialog.tsx",
    markers: [
      /setAttribute\(["']aria-labelledby["'],\s*trigger\.id\)/,
      /closest\([^)]*alertdialog/,
    ],
  },
  {
    file: "packages/solidaria-components/src/GridList.tsx",
    markers: [/new IntersectionObserver/],
  },
  {
    file: "packages/solidaria-components/src/ListBox.tsx",
    markers: [/new IntersectionObserver/],
  },
  {
    file: "packages/solidaria-components/src/Table.tsx",
    markers: [/new IntersectionObserver/],
  },
  {
    file: "packages/solidaria-components/src/Tree.tsx",
    markers: [/new IntersectionObserver/],
  },
  {
    file: "scripts/fixtures/jsx-ref-dead-code.tsx",
    markers: [
      /data-ref-read/,
      /addEventListener/,
      /\.focus\(\)/,
      /onClose\(\)/,
      /data-ref-close/,
      /removeEventListener/,
    ],
  },
];

function walk(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolute));
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files;
}

function normalize(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

const sourceFiles = PUBLIC_SOURCE_ROOTS.flatMap((directory) => walk(path.join(ROOT, directory)));
const program = ts.createProgram(sourceFiles, {
  jsx: ts.JsxEmit.Preserve,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ESNext,
  types: [],
});
const checker = program.getTypeChecker();
const observedRefs = new Map<string, string[]>();

for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFiles.includes(sourceFile.fileName)) continue;

  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "ref" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression &&
      ts.isIdentifier(node.initializer.expression)
    ) {
      const expression = node.initializer.expression;
      const symbol = checker.getSymbolAtLocation(expression);
      const declaration = symbol?.declarations?.find(ts.isVariableDeclaration);
      const declarationList = declaration?.parent;
      if (
        declaration &&
        declarationList &&
        ts.isVariableDeclarationList(declarationList) &&
        (declarationList.flags & ts.NodeFlags.Let) !== 0
      ) {
        const key = `${normalize(declaration.getSourceFile().fileName)}#${expression.text}`;
        const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const locations = observedRefs.get(key) ?? [];
        locations.push(`${normalize(sourceFile.fileName)}:${position.line + 1}`);
        observedRefs.set(key, locations);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

const observedKeys = [...observedRefs.keys()].sort();
const unexpected = observedKeys.filter((key) => !SAFE_DIRECT_REFS.has(key));
const stale = [...SAFE_DIRECT_REFS.keys()].filter((key) => !observedRefs.has(key));

assert.deepEqual(
  unexpected,
  [],
  `Direct JSX refs backed by local let bindings need an explicit setter callback:\n${unexpected
    .map((key) => `- ${key} at ${observedRefs.get(key)?.join(", ")}`)
    .join("\n")}`,
);
assert.deepEqual(
  stale,
  [],
  `Remove resolved entries from SAFE_DIRECT_REFS:\n${stale.map((key) => `- ${key}`).join("\n")}`,
);

const rootRequire = createRequire(import.meta.url);
const vitePlusEntry = rootRequire.resolve("vite-plus");
const vitePlusRequire = createRequire(vitePlusEntry);
const rolldownEntry = vitePlusRequire.resolve("rolldown");
const { rolldown } = (await import(pathToFileURL(rolldownEntry).href)) as {
  rolldown: (options: object) => Promise<{
    close?: () => Promise<void>;
    generate: (options: object) => Promise<{
      output: Array<{ type: string; code?: string }>;
    }>;
  }>;
};

const bundleCache = new Map<string, string>();
async function bundleSource(file: string): Promise<string> {
  const cached = bundleCache.get(file);
  if (cached) return cached;

  const build = await rolldown({
    input: path.join(ROOT, file),
    external: () => true,
    onLog(
      level: string,
      log: { code?: string },
      defaultHandler: (level: string, log: { code?: string }) => void,
    ) {
      if (log.code !== "CONFIGURATION_FIELD_CONFLICT") defaultHandler(level, log);
    },
    transform: { jsx: "preserve" },
  });
  try {
    const result = await build.generate({ format: "es" });
    const code = result.output
      .filter((output) => output.type === "chunk")
      .map((output) => output.code ?? "")
      .join("\n");
    bundleCache.set(file, code);
    return code;
  } finally {
    await build.close?.();
  }
}

for (const [key, marker] of SAFE_DIRECT_REFS) {
  const file = key.slice(0, key.lastIndexOf("#"));
  const code = await bundleSource(file);
  assert.match(
    code,
    marker,
    `${key} is allowlisted only while its element read remains in emitted JSX styling code`,
  );
}

for (const { file, markers } of REQUIRED_BEHAVIOR) {
  const code = await bundleSource(file);
  for (const marker of markers) {
    assert.match(code, marker, `${file} package transform dropped ${marker}`);
  }
}

process.stdout.write(
  `guard:jsx-ref-dead-code — PASS: ${observedKeys.length} reviewed-safe direct refs and ` +
    `${REQUIRED_BEHAVIOR.length} emitted behavior fixtures retained.\n`,
);

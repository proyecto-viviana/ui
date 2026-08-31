import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const repoRoot = process.cwd();
const solidIconRoot = path.join(repoRoot, "packages/solid-spectrum/src/icon");
const vivianaIconRoot = path.join(repoRoot, "packages/viviana-ui/src/icon");
const generatedIconRoots = [solidIconRoot, vivianaIconRoot];
const uiSourceDir = path.join(solidIconRoot, "assets/ui-icons");
const wfInventoryDir = path.join(solidIconRoot, "assets/s2wf-icons");
const uiOutDirs = generatedIconRoots.map((iconRoot) => path.join(iconRoot, "ui-icons"));
const wfOutDirs = generatedIconRoots.map((iconRoot) => path.join(iconRoot, "s2wf-icons"));
const outputDirs = [...uiOutDirs, ...wfOutDirs];
const comparisonManifestPath = path.join(repoRoot, "apps/comparison/package.json");
const upstreamPinPath = path.join(repoRoot, "scripts/upstream-pin.json");
const requireFromRoot = createRequire(path.join(repoRoot, "package.json"));
const requireFromComparison = createRequire(comparisonManifestPath);
const { JSDOM } = requireFromRoot("jsdom");

// The shipped CJS modules import CSS. Code generation needs only their rendered SVG.
requireFromComparison.extensions[".css"] = () => {};
const React = requireFromComparison("react");
const { renderToStaticMarkup } = requireFromComparison("react-dom/server");
const SvgParser = new JSDOM("").window.DOMParser;
const parser = new SvgParser();

const generatedNotice = `/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
`;
const ignoredWorkflowRootAttributes = new Set([
  "aria-hidden",
  "class",
  "data-slot",
  "focusable",
  "role",
]);

function pascalFromAssetName(name) {
  return name
    .replace(/^S2_Icon_/, "")
    .replace(/_20_N$/, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function safeIdentifier(name) {
  return /^[A-Za-z_]/.test(name) ? name : `Icon${name}`;
}

const uiIconSpecs = [
  {
    name: "Add",
    variants: [
      { size: "XS", file: "S2_AddSize50.svg" },
      { size: "S", file: "S2_AddSize75.svg" },
      { size: "M", file: "S2_AddSize100.svg" },
      { size: "L", file: "S2_AddSize200.svg" },
      { size: "XL", file: "S2_AddSize300.svg" },
    ],
  },
  {
    name: "Arrow",
    variants: [
      { size: "M", file: "S2_ArrowSize100.svg" },
      { size: "XXL", file: "S2_ArrowSize400.svg" },
    ],
  },
  {
    name: "Asterisk",
    variants: [
      { size: "M", file: "S2_AsteriskSize100.svg" },
      { size: "L", file: "S2_AsteriskSize200.svg" },
      { size: "XL", file: "S2_AsteriskSize300.svg" },
    ],
  },
  {
    name: "Checkmark",
    variants: [
      { size: "XS", file: "S2_CheckmarkSize50.svg" },
      { size: "S", file: "S2_CheckmarkSize75.svg" },
      { size: "M", file: "S2_CheckmarkSize100.svg" },
      { size: "L", file: "S2_CheckmarkSize200.svg" },
      { size: "XL", file: "S2_CheckmarkSize300.svg" },
      { size: "XXL", file: "S2_CheckmarkSize400.svg" },
    ],
  },
  {
    name: "Chevron",
    variants: [
      { size: "XS", file: "S2_ChevronSize50.svg" },
      { size: "S", file: "S2_ChevronSize75.svg" },
      { size: "M", file: "S2_ChevronSize100.svg" },
      { size: "L", file: "S2_ChevronSize200.svg" },
      { size: "XL", file: "S2_ChevronSize300.svg" },
      { size: "XXL", file: "S2_ChevronSize400.svg" },
    ],
  },
  {
    name: "CornerTriangle",
    variants: [
      { size: "S", file: "S2_CornerTriangleSize75.svg" },
      { size: "M", file: "S2_CornerTriangleSize100.svg" },
      { size: "L", file: "S2_CornerTriangleSize200.svg" },
      { size: "XL", file: "S2_CornerTriangleSize300.svg" },
    ],
  },
  {
    name: "Cross",
    variants: [
      { size: "S", file: "S2_CrossSize75.svg" },
      { size: "M", file: "S2_CrossSize100.svg" },
      { size: "L", file: "S2_CrossSize200.svg" },
      { size: "XL", file: "S2_CrossSize300.svg" },
      { size: "XXL", file: "S2_CrossSize400.svg" },
      { size: "XXXL", file: "S2_CrossSize500.svg" },
      { size: "XXXXL", file: "S2_CrossSize600.svg" },
    ],
  },
  {
    name: "Dash",
    variants: [
      { size: "XS", file: "S2_DashSize50.svg" },
      { size: "S", file: "S2_DashSize75.svg" },
      { size: "M", file: "S2_DashSize100.svg" },
      { size: "L", file: "S2_DashSize200.svg" },
      { size: "XL", file: "S2_DashSize300.svg" },
    ],
  },
  {
    name: "DragHandle",
    variants: [
      { size: "S", file: "S2_DragHandleSize75.svg" },
      { size: "M", file: "S2_DragHandleSize100.svg" },
      { size: "L", file: "S2_DragHandleSize200.svg" },
      { size: "XL", file: "S2_DragHandleSize300.svg" },
    ],
  },
  { name: "Gripper", variants: [{ size: "M", file: "S2_GripperSize100.svg" }] },
  {
    name: "LinkOut",
    variants: [
      { size: "M", file: "S2_LinkOutSize100.svg" },
      { size: "L", file: "S2_LinkOutSize200.svg" },
      { size: "XL", file: "S2_LinkOutSize300.svg" },
      { size: "XXL", file: "S2_LinkOutSize400.svg" },
    ],
  },
];

function slash(value) {
  return value.split(path.sep).join("/");
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function loadS2Package() {
  const [comparisonManifest, upstreamPin] = await Promise.all([
    readJson(comparisonManifestPath),
    readJson(upstreamPinPath),
  ]);
  const declaredVersion = comparisonManifest.dependencies?.["@react-spectrum/s2"];
  const pinnedVersion = upstreamPin.tags?.["@react-spectrum/s2"];
  const manifestPath = requireFromComparison.resolve("@react-spectrum/s2/package.json");
  const installedManifest = await readJson(manifestPath);

  if (
    !declaredVersion ||
    declaredVersion !== pinnedVersion ||
    declaredVersion !== installedManifest.version
  ) {
    throw new Error(
      `@react-spectrum/s2 version mismatch: comparison=${declaredVersion ?? "missing"}, pin=${pinnedVersion ?? "missing"}, installed=${installedManifest.version ?? "missing"}`,
    );
  }

  return { root: path.dirname(manifestPath), version: installedManifest.version };
}

function toTree(element) {
  return {
    tag: element.tagName,
    attributes: Array.from(element.attributes, ({ name, value }) => ({ name, value })),
    children: Array.from(element.children, toTree),
  };
}

function parseSvg(source, sourceName) {
  const document = parser.parseFromString(source, "image/svg+xml");
  const parseError = document.querySelector("parsererror");
  const svg = document.documentElement;
  if (parseError || svg.tagName !== "svg") {
    throw new Error(`Unable to parse SVG from ${sourceName}`);
  }
  return toTree(svg);
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function renderTree(tree, level = 3, isRoot = true) {
  const indentation = "  ".repeat(level);
  const attributes = tree.attributes
    .filter(({ name }) => !isRoot || !ignoredWorkflowRootAttributes.has(name))
    .map(({ name, value }) => `${name}="${escapeAttribute(value)}"`);
  if (isRoot) {
    attributes.push("{...rest}", "class={className}");
  }

  const compactOpen = `<${tree.tag}${attributes.length ? ` ${attributes.join(" ")}` : ""}`;
  if (tree.children.length === 0 && indentation.length + compactOpen.length + 3 <= 100) {
    return `${indentation}${compactOpen} />`;
  }

  const opening = attributes.length
    ? `${indentation}<${tree.tag}\n${attributes.map((attribute) => `${indentation}  ${attribute}`).join("\n")}\n${indentation}`
    : `${indentation}<${tree.tag}`;
  if (tree.children.length === 0) {
    return `${opening}/>`;
  }

  const children = tree.children.map((child) => renderTree(child, level + 1, false)).join("\n");
  return `${opening}>\n${children}\n${indentation}</${tree.tag}>`;
}

function treePathData(tree) {
  const data = [];
  if (tree.tag === "path") {
    const pathData = tree.attributes.find(({ name }) => name === "d")?.value;
    if (pathData !== undefined) data.push(pathData);
  }
  for (const child of tree.children) data.push(...treePathData(child));
  return data;
}

function modulePathData(source) {
  const data = [];
  const re = /\bd:\s*("(?:[^"\\]|\\.)*")/g;
  let match;
  while ((match = re.exec(source))) data.push(JSON.parse(match[1]));
  return data;
}

async function readShippedSvg(s2Package, relativeBase) {
  const esmPath = path.join(s2Package.root, `${relativeBase}.mjs`);
  const cjsPath = path.join(s2Package.root, `${relativeBase}.cjs`);
  const [esmSource] = await Promise.all([fs.readFile(esmPath, "utf8"), fs.access(cjsPath)]);
  const loaded = requireFromComparison(cjsPath);
  const Component = loaded.default ?? loaded;
  const tree = parseSvg(renderToStaticMarkup(React.createElement(Component)), cjsPath);
  const esmPaths = modulePathData(esmSource);
  const renderedPaths = treePathData(tree);
  if (
    esmPaths.length !== renderedPaths.length ||
    esmPaths.some((value, index) => value !== renderedPaths[index])
  ) {
    throw new Error(`ESM and rendered CJS path data differ for ${relativeBase}`);
  }

  return {
    tree,
    inputs: [
      `@react-spectrum/s2@${s2Package.version}/${slash(`${relativeBase}.mjs`)}`,
      `@react-spectrum/s2@${s2Package.version}/${slash(`${relativeBase}.cjs`)}`,
    ],
  };
}

async function readUiVariant(s2Package, file) {
  const relativeBase = `dist/private/${path.basename(file, ".svg")}`;
  try {
    return await readShippedSvg(s2Package, relativeBase);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    const assetPath = path.join(uiSourceDir, file);
    return {
      tree: parseSvg(await fs.readFile(assetPath, "utf8"), assetPath),
      inputs: [slash(path.relative(repoRoot, assetPath))],
    };
  }
}

function provenanceLines(inputs) {
  return inputs.map((input) => `// Generator input: ${input}`).join("\n");
}

function buildVariantComponent(name, sizeKey, tree) {
  return `
function ${name}_${sizeKey}Svg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
${renderTree(tree)}
  );
}
`.trim();
}

function buildWorkflowIconComponent(name, tree) {
  return `
function ${name}Svg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, ...rest } = props;
  return (
${renderTree(tree)}
  );
}
`.trim();
}

async function generateUiIcon(spec, s2Package) {
  const baseName = spec.name;
  const propsType = `${baseName}Props`;
  const sizeUnion = spec.variants.map((entry) => `"${entry.size}"`).join(" | ");

  const svgVariants = [];
  for (const { size, file } of spec.variants) {
    svgVariants.push({ size, ...(await readUiVariant(s2Package, file)) });
  }

  const variantComponents = svgVariants
    .map((variant) => buildVariantComponent(baseName, variant.size, variant.tree))
    .join("\n\n");

  const cases = svgVariants
    .map(
      (variant) => `    case "${variant.size}":
      return <${baseName}_${variant.size} {...rest} class={className} />;`,
    )
    .join("\n");

  const defaultSize = spec.variants.some((entry) => entry.size === "M")
    ? "M"
    : spec.variants[0].size;

  return `${generatedNotice}${provenanceLines(svgVariants.flatMap(({ inputs }) => inputs))}

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type ${propsType} = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: ${sizeUnion};
};

${variantComponents}

${svgVariants
  .map(
    (variant) =>
      `const ${baseName}_${variant.size} = createUIIcon(${baseName}_${variant.size}Svg);`,
  )
  .join("\n")}

export default function ${baseName}(props: ${propsType}): JSX.Element {
  const { size = "${defaultSize}", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
${cases}
    default:
      return <${baseName}_${defaultSize} {...rest} class={className} />;
  }
}

export const ${baseName}Icon = ${baseName};
`;
}

async function generateWorkflowIcon(inventoryFile, s2Package) {
  const inventoryName = path.basename(inventoryFile, ".svg");
  const moduleName = pascalFromAssetName(inventoryName) || inventoryName;
  const iconName = safeIdentifier(`${moduleName}Icon`);
  const { tree, inputs } = await readShippedSvg(s2Package, `icons/${moduleName}`);

  return {
    iconName,
    content: `${generatedNotice}${provenanceLines(inputs)}

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

${buildWorkflowIconComponent(iconName, tree)}

export type ${iconName}Props = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ${iconName} = createIcon(${iconName}Svg);
export default ${iconName};
`,
  };
}

function buildUiBarrel(files) {
  const lines = [generatedNotice.trimEnd()];
  for (const file of files) {
    const name = path.basename(file, ".tsx");
    lines.push(`export { default as ${name}, ${name}Icon } from "./${name}";`);
    lines.push(`export type { ${name}Props } from "./${name}";`);
  }
  return `${lines.join("\n")}\n`;
}

function buildWorkflowBarrel(names) {
  const lines = [generatedNotice.trimEnd()];
  for (const name of names) {
    lines.push(`export { default as ${name} } from "./${name}";`);
    lines.push(`export type { ${name}Props } from "./${name}";`);
  }
  return `${lines.join("\n")}\n`;
}

async function formatExpected(expected) {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "viviana-generated-icons-"));
  try {
    const temporaryFiles = new Map();
    for (const [filePath, content] of expected) {
      const temporaryPath = path.join(temporaryRoot, path.relative(repoRoot, filePath));
      await fs.mkdir(path.dirname(temporaryPath), { recursive: true });
      await fs.writeFile(temporaryPath, content);
      temporaryFiles.set(filePath, temporaryPath);
    }

    const formatResult = spawnSync(
      "vp",
      ["fmt", ...outputDirs.map((dir) => path.join(temporaryRoot, path.relative(repoRoot, dir)))],
      { cwd: repoRoot, encoding: "utf8" },
    );
    if (formatResult.error || formatResult.status !== 0) {
      const details = [formatResult.stdout, formatResult.stderr].filter(Boolean).join("\n");
      throw new Error(`Unable to format generated icons${details ? `:\n${details}` : ""}`, {
        cause: formatResult.error,
      });
    }

    return new Map(
      await Promise.all(
        [...temporaryFiles].map(async ([filePath, temporaryPath]) => [
          filePath,
          await fs.readFile(temporaryPath, "utf8"),
        ]),
      ),
    );
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function synchronize(expected, checkOnly) {
  const changed = [];
  for (const [filePath, content] of expected) {
    let current;
    try {
      current = await fs.readFile(filePath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    if (current !== content) changed.push(filePath);
  }

  const extra = [];
  for (const dir of outputDirs) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name);
      if (entry.isFile() && !expected.has(filePath)) extra.push(filePath);
    }
  }

  if (checkOnly && (changed.length || extra.length)) {
    const details = [
      ...changed.map((filePath) => `  change: ${slash(path.relative(repoRoot, filePath))}`),
      ...extra.map((filePath) => `  remove: ${slash(path.relative(repoRoot, filePath))}`),
    ];
    throw new Error(`Generated icon output is stale:\n${details.join("\n")}`);
  }

  if (!checkOnly) {
    await Promise.all(outputDirs.map((dir) => fs.mkdir(dir, { recursive: true })));
    await Promise.all(changed.map((filePath) => fs.writeFile(filePath, expected.get(filePath))));
    await Promise.all(extra.map((filePath) => fs.unlink(filePath)));
  }

  return { changed: changed.length, removed: extra.length };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) {
    throw new Error("Usage: node scripts/generate-solid-spectrum-icons.mjs [--check]");
  }
  const checkOnly = args.includes("--check");
  const s2Package = await loadS2Package();
  const expected = new Map();

  for (const spec of uiIconSpecs) {
    const content = await generateUiIcon(spec, s2Package);
    for (const dir of uiOutDirs) expected.set(path.join(dir, `${spec.name}.tsx`), content);
  }

  const wfFiles = (await fs.readdir(wfInventoryDir)).filter((file) => file.endsWith(".svg")).sort();
  const wfNames = [];
  for (const file of wfFiles) {
    const generated = await generateWorkflowIcon(file, s2Package);
    wfNames.push(generated.iconName);
    for (const dir of wfOutDirs) {
      expected.set(path.join(dir, `${generated.iconName}.tsx`), generated.content);
    }
  }

  const uiBarrel = buildUiBarrel(uiIconSpecs.map((spec) => `${spec.name}.tsx`));
  const workflowBarrel = buildWorkflowBarrel(wfNames);
  for (const dir of uiOutDirs) expected.set(path.join(dir, "index.ts"), uiBarrel);
  for (const dir of wfOutDirs) expected.set(path.join(dir, "index.ts"), workflowBarrel);

  const formattedExpected = await formatExpected(expected);
  const result = await synchronize(formattedExpected, checkOnly);
  const action = checkOnly ? "Verified" : "Synchronized";
  console.log(
    `${action} ${expected.size} generated icon files (${result.changed} changed, ${result.removed} removed).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

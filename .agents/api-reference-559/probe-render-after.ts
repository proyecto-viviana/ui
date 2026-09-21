// #559 after-probe. Same walk as .agents/chain-walk-2026-09-20/probe-typeflags.ts
// — every property signature in a register, rendered the way the extractor
// renders a prop — but through `renderType`, and it reports what survives.
import path from "node:path";
import ts from "typescript";
import { renderType } from "../../scripts/extract-api-reference.ts";

const packageDir = path.resolve(process.argv[2] ?? "packages/viviana-ui");
const configPath = ts.findConfigFile(packageDir, ts.sys.fileExists, "tsconfig.json")!;
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
const checker = program.getTypeChecker();

let scanned = 0;
let qualified = 0;
let leaks = 0;
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  if (!sf.fileName.includes(`${path.sep}src${path.sep}`)) continue;
  const visit = (node: ts.Node): void => {
    if (ts.isPropertySignature(node) && node.name) {
      const sym = checker.getSymbolAtLocation(node.name);
      if (sym) {
        scanned++;
        const plain = checker.typeToString(
          checker.getTypeOfSymbolAtLocation(sym, node),
          node,
          ts.TypeFormatFlags.NoTruncation,
        );
        if (plain.includes("import(")) qualified++;
        const rendered = renderType(plain, `${path.relative(process.cwd(), sf.fileName)}`);
        if (rendered.includes("node_modules") || rendered.includes("import(")) {
          leaks++;
          console.log("  LEAK:", rendered.slice(0, 200));
        }
      }
    }
    node.forEachChild(visit);
  };
  sf.forEachChild(visit);
}
console.log(`package: ${path.relative(process.cwd(), packageDir)}`);
console.log(`scanned ${scanned} property signatures`);
console.log(`${qualified} rendered with an import("…") path before renderType`);
console.log(`${leaks} contain a path after renderType`);

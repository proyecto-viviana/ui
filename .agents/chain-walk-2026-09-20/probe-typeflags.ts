// Read-only probe for the #559 api-reference drift. Renders every prop the way
// scripts/extract-api-reference.ts:269 does — checker.typeToString(type, site,
// NoTruncation) — and reports the ones that come out as an `import("…")` path,
// plus what the same type renders as with UseAliasDefinedOutsideCurrentScope.
import ts from "typescript";
import path from "node:path";

const packageDir = path.resolve(process.argv[2] ?? "packages/viviana-ui");
const configPath = ts.findConfigFile(packageDir, ts.sys.fileExists, "tsconfig.json")!;
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
const checker = program.getTypeChecker();

const NO_TRUNC = ts.TypeFormatFlags.NoTruncation;
const WITH_ALIAS = NO_TRUNC | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

const seen = new Map<string, string>();
let hits = 0;
let scanned = 0;

for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  if (!sf.fileName.includes(`${path.sep}src${path.sep}`)) continue;
  const visit = (node: ts.Node): void => {
    if (ts.isPropertySignature(node) && node.name) {
      const sym = checker.getSymbolAtLocation(node.name);
      if (sym) {
        scanned++;
        const t = checker.getTypeOfSymbolAtLocation(sym, node);
        const plain = checker.typeToString(t, node, NO_TRUNC);
        if (plain.includes("import(")) {
          hits++;
          const alias = checker.typeToString(t, node, WITH_ALIAS);
          if (!seen.has(plain)) seen.set(plain, alias);
        }
      }
    }
    node.forEachChild(visit);
  };
  sf.forEachChild(visit);
}

console.log(`package: ${path.relative(process.cwd(), packageDir)}`);
console.log(`scanned ${scanned} property signatures; ${hits} render with an import("…") path`);
console.log(`${seen.size} distinct renderings:\n`);
for (const [plain, alias] of seen) {
  console.log("  NoTruncation           :", plain.slice(0, 240));
  console.log("  +UseAliasDefinedOutside:", alias.slice(0, 240));
  console.log();
}

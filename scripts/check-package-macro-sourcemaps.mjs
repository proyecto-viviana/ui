import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SourceMap } from "node:module";
import { fileURLToPath } from "node:url";
import {
  packageMacros,
  rejectBrokenSourceMap,
  sourceMapWarningGuard,
} from "./package-macro-plugin.mjs";

const fixtureUrl = new URL("./fixtures/style-macro-sourcemap.ts", import.meta.url);
const fixturePath = fileURLToPath(fixtureUrl);
const source = readFileSync(fixtureUrl, "utf8");
const plugin = packageMacros({ stripCssImports: true });
const result = await plugin.transform.call({ addWatchFile() {} }, source, fixturePath);

assert.equal(typeof result, "object", "the fixture transform must return code and a source map");
assert.equal(typeof result.code, "string", "the fixture transform must return generated code");
assert.ok(result.map, "the JSX-preserve transform must retain the macro source map");
assert.doesNotMatch(result.code, /import\s+["']macro-[a-f0-9]+\.css["']/, "CSS imports remain");

function positionOf(code, text) {
  const offset = code.indexOf(text);
  assert.notEqual(offset, -1, `could not find ${JSON.stringify(text)}`);
  const before = code.slice(0, offset);
  const lines = before.split("\n");
  return { line: lines.length - 1, column: lines.at(-1).length };
}

const generated = positionOf(result.code, "authoredStyle");
const authored = positionOf(source, "authoredStyle");
const traced = new SourceMap(result.map).findEntry(generated.line, generated.column);

assert.equal(traced.originalSource, fixturePath, "the generated binding must map to the fixture");
assert.equal(
  traced.originalLine,
  authored.line,
  "the generated binding must map to its authored line",
);
assert.equal(
  traced.originalColumn,
  authored.column,
  "the generated binding must map to its authored column",
);

assert.doesNotThrow(() => rejectBrokenSourceMap("warn", { code: "OTHER_WARNING" }));
assert.throws(
  () =>
    sourceMapWarningGuard().onLog("warn", {
      code: "SOURCEMAP_BROKEN",
      message: "fixture warning",
    }),
  /Published package build rejected SOURCEMAP_BROKEN/,
  "the package build guard must reject broken-map warnings",
);

process.stdout.write(
  `guard:package-sourcemaps — PASS: generated ${generated.line + 1}:${generated.column} maps to ` +
    `${traced.originalSource}:${traced.originalLine + 1}:${traced.originalColumn}; ` +
    "the JSX-preserve transform retains its map and the build rejects SOURCEMAP_BROKEN.\n",
);

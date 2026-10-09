#!/usr/bin/env node
// UC-00 out-of-workspace install smoke.
//
// Proves a real client can install the public packages from packed tarballs.
// The client lives outside this workspace and has no pnpm workspace symlinks.
// It builds `@proyecto-viviana/ui`, `@proyecto-viviana/kumo`, and
// `@proyecto-viviana/geist` for the browser
// and server with the same `@solidjs/vite-plugin` setup that the web app uses.
//
// Prereq: run `vp run pack:local-chain` first (or `vp run ui:smoke`, which chains
// both). This script consumes the tarballs that produced; it does not build them.
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  realpathSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { scratchDir } from "./scratch-dir.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const packsDir = scratchDir("VIVIANA_PACK_OUT", "viviana-ui-packs-chain", { repoRoot });
const consumerDir = scratchDir("VIVIANA_CONSUMER_DIR", "viviana-ui-consume-smoke", { repoRoot });

// Same public package set and order as pack-local-chain.mjs.
const packages = [
  { name: "@proyecto-viviana/solid-stately", dir: "packages/solid-stately" },
  { name: "@proyecto-viviana/solidaria", dir: "packages/solidaria" },
  { name: "@proyecto-viviana/solidaria-components", dir: "packages/solidaria-components" },
  { name: "@proyecto-viviana/kumo", dir: "packages/kumo" },
  { name: "@proyecto-viviana/geist", dir: "packages/geist" },
  { name: "@proyecto-viviana/solid-spectrum", dir: "packages/solid-spectrum" },
  { name: "@proyecto-viviana/ui", dir: "packages/viviana-ui" },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// Mirror `npm pack`'s filename convention: @scope/name@version -> scope-name-version.tgz
function tarballName(name, version) {
  return `${name.replace(/^@/, "").replace(/\//g, "-")}-${version}.tgz`;
}

function run(cmd, args, opts = {}) {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}\n`);
  const result = spawnSync(cmd, args, {
    cwd: consumerDir,
    encoding: "utf8",
    stdio: ["ignore", "inherit", "inherit"],
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd} ${args.join(" ")}`);
  }
  return result;
}

function capture(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: consumerDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd} ${args.join(" ")}`);
  }
  return result.stdout;
}

// vite-plus-core publishes as `vite` via the npm alias, but its package name is
// `@voidzero-dev/vite-plus-core` so npm does not create `.bin/vite`. The CLI
// still ships at dist/vite/node/cli.js (same entry `vp` wraps).
function viteCli() {
  const cli = join(consumerDir, "node_modules", "vite", "dist", "vite", "node", "cli.js");
  if (!existsSync(cli)) {
    throw new Error(`vite-plus-core CLI missing at ${cli}`);
  }
  return cli;
}

function runVite(args) {
  run(process.execPath, [viteCli(), ...args]);
}

// --- Resolve tarballs ----------------------------------------------------------
const tarballs = {};
const missing = [];
for (const pkg of packages) {
  const { version } = readJson(join(repoRoot, pkg.dir, "package.json"));
  const file = join(packsDir, tarballName(pkg.name, version));
  tarballs[pkg.name] = file;
  if (!existsSync(file)) missing.push(file);
}
if (missing.length > 0) {
  throw new Error(
    `Missing packed tarballs:\n  ${missing.join("\n  ")}\n` +
      `Run 'vp run pack:local-chain' first (or 'vp run ui:smoke').`,
  );
}

const fileSpec = (name) => `file:${tarballs[name]}`;
const overrides = {
  ...Object.fromEntries(packages.map((p) => [p.name, fileSpec(p.name)])),
  "solid-js": "2.0.0-rc.9",
  "@solidjs/web": "2.0.0-rc.9",
  "@solidjs/compiler": "2.0.0-rc.9",
  "@solidjs/babel-plugin": "2.0.0-rc.9",
};

// --- Scaffold the out-of-workspace consumer ------------------------------------
rmSync(consumerDir, { recursive: true, force: true });
mkdirSync(join(consumerDir, "src"), { recursive: true });

writeFileSync(
  join(consumerDir, "package.json"),
  `${JSON.stringify(
    {
      name: "viviana-ui-consume-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@proyecto-viviana/kumo": fileSpec("@proyecto-viviana/kumo"),
        "@proyecto-viviana/geist": fileSpec("@proyecto-viviana/geist"),
        "@proyecto-viviana/solid-spectrum": fileSpec("@proyecto-viviana/solid-spectrum"),
        "@proyecto-viviana/ui": fileSpec("@proyecto-viviana/ui"),
        "@solidjs/web": "2.0.0-rc.9",
        "solid-js": "2.0.0-rc.9",
      },
      devDependencies: {
        "@solidjs/vite-plugin": "3.0.0-next.44",
        vite: "npm:@voidzero-dev/vite-plus-core@0.2.9",
      },
      // The closure's internal deps were rewritten workspace:* -> concrete
      // versions that aren't on the registry; redirect every one to its tarball.
      overrides,
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(consumerDir, "vite.config.mjs"),
  `import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

// A client consuming the *pre-built* package does NOT author style() macros, so
// no macro plugin is needed (that is UC-04). It only needs @solidjs/vite-plugin
// plus the standard "keep our Solid packages out of the optimizer, bundle them
// into SSR" wiring — the same shape apps/web uses for workspace sources.
const pkgs = [
  "@proyecto-viviana/ui",
  "@proyecto-viviana/kumo",
  "@proyecto-viviana/geist",
  "@proyecto-viviana/solid-spectrum",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solid-stately",
];

export default defineConfig({
  // ssr:true makes @solidjs/vite-plugin emit generate:'ssr' for the server build
  // and generate:'dom' (hydratable) for the client build — without it the plugin
  // hardcodes 'dom' even under \`vite build --ssr\`, and the server crashes calling
  // template() (a client-only API). TanStack Start wires this for you; a plain
  // dual-target vite build must opt in. Spread the plugin: it returns an array.
  plugins: [...solid({ ssr: true, refresh: { disabled: true } })],
  optimizeDeps: { exclude: pkgs },
  // Vite's SSR resolver defaults don't include the "solid" condition, so it would
  // otherwise grab the DOM-compiled .js (import condition) instead of the .jsx the
  // plugin needs to SSR-compile.
  ssr: {
    noExternal: pkgs,
    resolve: { conditions: ["solid", "node", "import", "module", "default"] },
  },
  build: { minify: false },
  logLevel: "warn",
});
`,
);

// Deep subpath import (not the root barrel) — also exercises subpath resolution.
const app = `import { Button } from "@proyecto-viviana/ui/Button";
import { Button as KumoButton } from "@proyecto-viviana/kumo/components/button";
import { Button as GeistButton } from "@proyecto-viviana/geist/components/button";
import "@proyecto-viviana/kumo/styles.css";
import "@proyecto-viviana/geist/styles.css";

export function App() {
  return <><Button>Hello from packed ui</Button><KumoButton>Hello from packed Kumo</KumoButton><GeistButton>Hello from packed Geist</GeistButton></>;
}
`;
writeFileSync(join(consumerDir, "src", "App.jsx"), app);

writeFileSync(
  join(consumerDir, "src", "entry-client.jsx"),
  `import { render } from "@solidjs/web";
import { App } from "./App.jsx";

render(() => <App />, document.getElementById("root"));
`,
);

writeFileSync(
  join(consumerDir, "src", "entry-ssr.jsx"),
  `import { renderToString } from "@solidjs/web";
import { App } from "./App.jsx";

export function renderApp() {
  return renderToString(() => <App />);
}
`,
);

writeFileSync(
  join(consumerDir, "index.html"),
  `<!doctype html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/entry-client.jsx"></script>
  </body>
</html>
`,
);

// --- Install + build -----------------------------------------------------------
process.stdout.write(`\n=== Consumer: ${consumerDir} ===\n`);
// @solidjs/vite-plugin peers vite ^8 || ^9; vite-plus-core publishes as 0.2.9.
run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error", "--legacy-peer-deps"]);

process.stdout.write(`\n=== DOM build ===\n`);
runVite(["build"]);
if (!existsSync(join(consumerDir, "dist", "index.html"))) {
  throw new Error("DOM build produced no dist/index.html");
}

process.stdout.write(`\n=== SSR build ===\n`);
runVite(["build", "--ssr", "src/entry-ssr.jsx", "--outDir", "dist-ssr"]);

process.stdout.write(`\n=== SSR render ===\n`);
const html = capture("node", [
  "--input-type=module",
  "-e",
  "import('./dist-ssr/entry-ssr.js').then((m) => process.stdout.write(m.renderApp()))",
]).trim();
process.stdout.write(`${html}\n`);

// --- Assertions ----------------------------------------------------------------
const problems = [];
if (!/<button/i.test(html)) problems.push("rendered HTML has no <button> element");
if (!/class="/.test(html))
  problems.push("rendered <button> carries no class attribute (styles lost)");
if (!/Hello from packed ui/.test(html)) problems.push("rendered HTML is missing the button label");
if (!/data-kumo-component="Button"/.test(html))
  problems.push("rendered HTML has no packed Kumo button marker");
if (!/Hello from packed Kumo/.test(html))
  problems.push("rendered HTML is missing the Kumo button label");
if (!/data-geist-component="Button"/.test(html))
  problems.push("rendered HTML has no packed Geist button marker");
if (!/Hello from packed Geist/.test(html))
  problems.push("rendered HTML is missing the Geist button label");

if (problems.length > 0) {
  process.stderr.write(`\nSMOKE FAILED:\n  - ${problems.join("\n  - ")}\n`);
  process.exit(1);
}

// --- UC-01: the export map is complete and coherent against a real install -----
// Two checks, both against the *installed* package (not the source), and neither
// evaluates component code — resolution is the contract here, not server-side
// evaluability. (Importing a DOM-compiled .js in bare Node would evaluate its
// hoisted top-level template() under solid-js/web's *server* build and throw
// "Client-only API called on the server side" — an artifact of the runtime, not
// a broken map. The DOM + SSR builds above already prove real evaluation works.)
//
//   1. Every file path referenced by every export condition (types/solid/import/
//      default, plus the CSS subpaths) exists on disk in the installed package —
//      catches a dangling .jsx/.d.ts/.css the build forgot to emit.
//   2. Node's own resolver (import.meta.resolve) honors every JS subpath
//      specifier — catches an export-map entry Node rejects (ERR_PACKAGE_*).
process.stdout.write(`\n=== Export-map completeness + resolution ===\n`);
const installedPackages = ["ui", "solid-spectrum", "kumo", "geist"].map((directory) => {
  const installedDir = join(consumerDir, "node_modules", "@proyecto-viviana", directory);
  return {
    name: `@proyecto-viviana/${directory}`,
    installedDir,
    manifest: readJson(join(installedDir, "package.json")),
  };
});

// A pattern export (`./icon/s2wf-icons/*` -> `./dist/icon/s2wf-icons/*.js`) is
// one map entry and one file per icon. Expand it before the existence check,
// or the smoke looks for a literal `*.js` and misses the set.
function expandedExportPaths(installedDir, relPath) {
  if (!relPath.includes("*")) return [relPath];
  const star = relPath.indexOf("*");
  const prefix = relPath.slice(0, star);
  const suffix = relPath.slice(star + 1);
  const directory = join(installedDir, prefix);
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .map((name) => `${prefix}${name}`)
    .sort();
}

// (1) Every referenced file exists on disk.
const missingFiles = [];
let fileRefCount = 0;
const checkFileRef = (pkg, subpath, condition, relPath) => {
  if (typeof relPath !== "string") return;
  const paths = expandedExportPaths(pkg.installedDir, relPath);
  if (paths.length === 0) {
    fileRefCount += 1;
    missingFiles.push(`${pkg.name} ${subpath} [${condition}] -> ${relPath}`);
    return;
  }
  for (const concrete of paths) {
    fileRefCount += 1;
    if (!existsSync(join(pkg.installedDir, concrete))) {
      missingFiles.push(`${pkg.name} ${subpath} [${condition}] -> ${concrete}`);
    }
  }
};
for (const pkg of installedPackages) {
  for (const [subpath, target] of Object.entries(pkg.manifest.exports)) {
    if (typeof target === "string") {
      checkFileRef(pkg, subpath, "default", target);
    } else if (target && typeof target === "object") {
      for (const [condition, relPath] of Object.entries(target)) {
        checkFileRef(pkg, subpath, condition, relPath);
      }
    }
  }
}
process.stdout.write(
  `every export file present: ${fileRefCount - missingFiles.length}/${fileRefCount}\n`,
);
if (missingFiles.length > 0) {
  process.stderr.write(
    `\nSMOKE FAILED — export map references missing files:\n  - ${missingFiles.join("\n  - ")}\n`,
  );
  process.exit(1);
}

function concreteJsSpecifiers(pkg, key, importTarget) {
  if (!key.includes("*")) {
    const subpath = key.replace(/^\.\/?/, "");
    return [subpath === "" ? pkg.name : `${pkg.name}/${subpath}`];
  }
  const files = expandedExportPaths(pkg.installedDir, importTarget);
  const targetStar = importTarget.indexOf("*");
  const targetPrefix = importTarget.slice(0, targetStar).replace(/^\.\//, "");
  const targetSuffix = importTarget.slice(targetStar + 1);
  const keyStar = key.indexOf("*");
  const keyPrefix = key.slice(0, keyStar).replace(/^\.\//, "");
  const keySuffix = key.slice(keyStar + 1);
  return files.map((relPath) => {
    const normalized = relPath.replace(/^\.\//, "");
    const matched = normalized.slice(targetPrefix.length, normalized.length - targetSuffix.length);
    return `${pkg.name}/${keyPrefix}${matched}${keySuffix}`;
  });
}

// (2) Node resolves every JS subpath specifier (the import condition).
const jsSubpaths = installedPackages.flatMap((pkg) =>
  Object.entries(pkg.manifest.exports).flatMap(([key, value]) => {
    if (
      key === "./package.json" ||
      !value ||
      typeof value !== "object" ||
      typeof value.import !== "string" ||
      !value.import.endsWith(".js")
    ) {
      return [];
    }
    return concreteJsSpecifiers(pkg, key, value.import);
  }),
);

const probeSource = `import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const specs = ${JSON.stringify(jsSubpaths)};
const ok = []; const bad = [];
for (const spec of specs) {
  try {
    const path = fileURLToPath(import.meta.resolve(spec));
    if (existsSync(path)) ok.push(spec);
    else bad.push(spec + ": resolved to missing file " + path);
  } catch (e) {
    bad.push(spec + ": " + e.message);
  }
}
process.stdout.write(JSON.stringify({ ok: ok.length, bad }));`;
const probeResult = JSON.parse(capture("node", ["--input-type=module", "-e", probeSource]));
process.stdout.write(`Node resolves JS subpaths: ${probeResult.ok}/${jsSubpaths.length}\n`);
if (probeResult.bad.length > 0) {
  process.stderr.write(
    `\nSMOKE FAILED — unresolvable subpaths:\n  - ${probeResult.bad.join("\n  - ")}\n`,
  );
  process.exit(1);
}
if (probeResult.ok !== jsSubpaths.length) {
  process.stderr.write(
    `\nSMOKE FAILED: only ${probeResult.ok}/${jsSubpaths.length} subpaths resolved\n`,
  );
  process.exit(1);
}

// --- UC-03: CSS contract — no export resolves to an incomplete src sheet -------
// The footgun was `{ import: ./dist/X.css, default: ./src/X.css }`: a consumer
// resolving via `default` got the build *source* (e.g. src/styles.css is only the
// unresolved `@import`, missing the macro CSS). Assert no export target anywhere
// points into src/, that every CSS subpath resolves to a single dist target, and
// that the shipped styles.css is the *complete*, self-contained sheet.
process.stdout.write(`\n=== CSS + export-source contract ===\n`);
const cssProblems = [];

const srcTargets = [];
const walk = (subpath, target) => {
  if (typeof target === "string") {
    if (target.includes("/src/")) srcTargets.push(`${subpath} -> ${target}`);
  } else if (target && typeof target === "object") {
    for (const [, v] of Object.entries(target)) walk(subpath, v);
  }
};
for (const pkg of installedPackages) {
  for (const [subpath, target] of Object.entries(pkg.manifest.exports)) {
    walk(`${pkg.name} ${subpath}`, target);
  }
}
if (srcTargets.length > 0) {
  cssProblems.push(
    `export map points into src/ (incomplete build sources):\n    ${srcTargets.join("\n    ")}`,
  );
}

// The dropped sidecar (UC-02): style.css must not ship.
const uiDir = installedPackages.find((pkg) => pkg.name === "@proyecto-viviana/ui").installedDir;
const kumoDir = installedPackages.find((pkg) => pkg.name === "@proyecto-viviana/kumo").installedDir;
const geistDir = installedPackages.find(
  (pkg) => pkg.name === "@proyecto-viviana/geist",
).installedDir;
if (existsSync(join(uiDir, "dist", "style.css"))) {
  cssProblems.push(
    "dist/style.css sidecar is still shipped (should be dropped as redundant cruft)",
  );
}

// styles.css must be the complete, self-contained sheet.
//
// This used to fingerprint the old inline-macro-css.mjs mechanism (a "viviana
// custom components" marker comment plus a nested @import of solid-spectrum's
// sheet). That script is gone: the macro now emits one flat atomic sheet
// directly, so those markers are absent by design and checking for them tested
// the implementation, not the contract. Assert the contract instead.
const styleSheets = {
  ui: readFileSync(join(uiDir, "dist", "styles.css"), "utf8"),
  kumo: readFileSync(join(kumoDir, "dist", "styles.css"), "utf8"),
  geist: readFileSync(join(geistDir, "dist", "styles.css"), "utf8"),
};

// (a) Self-contained: no bare @import survives. A nested bare specifier is
//     followed when the sheet is pulled into a CSS graph but silently dropped
//     when it is loaded as a URL asset (Vite `?url`, <link rel=stylesheet>) —
//     which would ship every component unstyled.
const bareImports = Object.entries(styleSheets).flatMap(([name, sheet]) =>
  [...sheet.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter(
      (specifier) =>
        !specifier.startsWith(".") && !specifier.startsWith("/") && !specifier.startsWith("http"),
    )
    .map((specifier) => `${name}: ${specifier}`),
);
if (bareImports.length > 0) {
  cssProblems.push(`dist/styles.css keeps unresolvable bare @import(s): ${bareImports.join(", ")}`);
}

// (b) Complete: every class the SSR render actually emitted has a rule in the
//     shipped sheet. This is the real contract — it fails on a partial sheet
//     regardless of which build mechanism produced it.
const renderedClasses = [...html.matchAll(/class="([^"]*)"/g)]
  .flatMap((m) => m[1].split(/\s+/))
  .filter(Boolean);
const uniqueClasses = [...new Set(renderedClasses)];
const unstyled = uniqueClasses.filter((className) => {
  const sheet = className.startsWith("pv-kumo-")
    ? styleSheets.kumo
    : className.startsWith("pv-geist-")
      ? styleSheets.geist
      : styleSheets.ui;
  return !new RegExp(`\\.${className.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")}[\\s,{:.>~+]`).test(
    sheet,
  );
});
process.stdout.write(
  `rendered classes backed by a rule: ${uniqueClasses.length - unstyled.length}/${uniqueClasses.length}\n`,
);
if (unstyled.length > 0) {
  cssProblems.push(
    `the owning dist/styles.css has no rule for ${unstyled.length} rendered class(es): ${unstyled.slice(0, 8).join(", ")}`,
  );
}

if (cssProblems.length > 0) {
  process.stderr.write(`\nSMOKE FAILED — CSS contract:\n  - ${cssProblems.join("\n  - ")}\n`);
  process.exit(1);
}
process.stdout.write(
  `no src/ targets; style.css sidecar dropped; styles.css is self-contained and complete\n`,
);

// G17: inspect actual installed exports, then independently build and mount each
// CSS choice. Separate outputs prevent Vite from sharing the full font sheet.
function insist(condition, message) {
  if (!condition) throw new Error(`G17: ${message}`);
}

function digest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function inside(path, root) {
  const rel = relative(root, path);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

// This deliberately accepts only literal local CSS references. Escaped/dynamic
// references cannot silently bypass the offline contract. Resolve symlinks too.
function cssClosure(entry, root, allowFonts = false) {
  root = realpathSync(root);
  const files = [];
  const external = [];
  const externalImports = [];
  const seen = new Set();
  function visit(file) {
    insist(inside(resolve(file), root), `CSS root escape: ${file}`);
    insist(existsSync(file), `missing CSS target: ${file}`);
    file = realpathSync(file);
    insist(inside(file, root), `CSS realpath escape: ${file}`);
    if (seen.has(file)) return;
    seen.add(file);
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    insist(allowFonts || !/@font-face\b/i.test(css), `font-face in ${file}`);
    files.push({ path: file, sha256: digest(file) });
    const imports = [
      ...css.matchAll(/@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s);]+))/gi),
    ];
    const urls = [...css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi)];
    insist(
      imports.length === (css.match(/@import\b/gi) ?? []).length,
      `unparsed import in ${file}`,
    );
    insist(urls.length === (css.match(/url\(/gi) ?? []).length, `unparsed URL in ${file}`);
    for (const [isImport, refs] of [
      [true, imports],
      [false, urls],
    ]) {
      for (const ref of refs) {
        const target = ref[1] ?? ref[2] ?? ref[3];
        insist(!target.includes("\\"), `escaped CSS reference in ${file}`);
        // Generated checkerboard textures are embedded SVG images, not network
        // references. Imports and all other schemes still follow the checks below.
        if (!isImport && /^data:image\/svg\+xml,/i.test(target)) continue;
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) {
          external.push(target);
          if (isImport) externalImports.push(target);
          insist(allowFonts, `external CSS reference: ${target}`);
          continue;
        }
        insist(!target.startsWith("/"), `CSS root escape: ${target}`);
        const local = resolve(dirname(file), decodeURIComponent(target.split(/[?#]/)[0]));
        insist(inside(local, root), `CSS root escape: ${target}`);
        insist(existsSync(local), `missing CSS target: ${target}`);
        insist(inside(realpathSync(local), root), `CSS realpath escape: ${target}`);
        insist(allowFonts || !/font-faces\.css$/i.test(local), `font-faces import: ${target}`);
        if (isImport) visit(local);
      }
    }
  }
  visit(entry);
  return {
    files,
    external: [...new Set(external)],
    externalImports: [...new Set(externalImports)],
  };
}

const styled = installedPackages.filter((pkg) =>
  ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"].includes(pkg.name),
);
const cssSpecs = styled.map((pkg) => `${pkg.name}/components-no-fonts.css`);
const cssProbe = join(consumerDir, "resolve-css.mjs");
writeFileSync(
  cssProbe,
  `console.log(JSON.stringify(${JSON.stringify(cssSpecs)}.map(spec => ({spec, url: import.meta.resolve(spec)}))));\n`,
);
const cssResolutions = JSON.parse(capture(process.execPath, [cssProbe]));
const cssEvidence = { installed: [], negatives: [], runtime: [] };
const expectedEntry = '@import "./theme.css";\n@import "./styles.css";\n';
for (const pkg of styled) {
  const installed = realpathSync(pkg.installedDir);
  insist(
    installed === pkg.installedDir && inside(installed, join(consumerDir, "node_modules")),
    `${pkg.name} is not a physical installed package`,
  );
  const entry = realpathSync(
    fileURLToPath(
      cssResolutions.find((item) => item.spec === `${pkg.name}/components-no-fonts.css`).url,
    ),
  );
  const dist = join(installed, "dist");
  insist(
    inside(entry, dist) && !inside(entry, repoRoot),
    `${pkg.name} CSS resolved outside installed dist`,
  );
  insist(readFileSync(entry, "utf8") === expectedEntry, `${pkg.name} entry bytes/order differ`);
  const noFonts = cssClosure(entry, dist);
  const full = cssClosure(join(dist, "components.css"), dist, true);
  insist(
    full.files.some((file) => file.path.endsWith("/font-faces.css")),
    `${pkg.name} full entry lost font faces`,
  );
  insist(
    full.external.some((url) => new URL(url).hostname === "use.typekit.net"),
    `${pkg.name} full entry lost Adobe URLs`,
  );
  if (pkg.name.endsWith("/ui"))
    insist(
      noFonts.files.some((file) => file.path.endsWith("/viviana-tokens.css")),
      "UI theme tokens were not traversed",
    );
  const identity = {
    name: pkg.name,
    version: pkg.manifest.version,
    manifest: join(installed, "package.json"),
    manifestSha256: digest(join(installed, "package.json")),
    exports: pkg.manifest.exports,
    tarball: tarballs[pkg.name],
    tarballSha256: digest(tarballs[pkg.name]),
    entry,
    noFonts,
    full,
  };
  cssEvidence.installed.push(identity);

  // Never corrupt the installed package. Each detector mutation owns a separate
  // copy, and package hashes are compared again after all negative controls.
  const mutations = [
    ["font-face", "@font-face { font-family: forbidden; src: local(forbidden); }", /font-face/],
    ["font-import", '@import "./font-faces.css";', /font-faces import/],
    [
      "external-url",
      'a { background: url("https://example.invalid/image.png"); }',
      /external CSS reference/,
    ],
    ["external-import", '@import "https://example.invalid/style.css";', /external CSS reference/],
    ["missing", '@import "./missing.css";', /missing CSS target/],
    ["escape", '@import "../outside.css";', /CSS root escape/],
  ];
  for (const [name, addition, expected] of mutations) {
    const copy = join(consumerDir, "css-controls", pkg.name.split("/")[1], name);
    cpSync(dist, copy, { recursive: true });
    // Mutate the transitive theme sheet, not just the public entry.
    writeFileSync(
      join(copy, "theme.css"),
      `${readFileSync(join(copy, "theme.css"), "utf8")}\n${addition}\n`,
    );
    let failure;
    try {
      cssClosure(join(copy, "components-no-fonts.css"), copy);
    } catch (error) {
      failure = error.message;
    }
    insist(
      failure && expected.test(failure),
      `${pkg.name} ${name} negative did not reject the intended defect: ${failure}`,
    );
    cssEvidence.negatives.push({ package: pkg.name, name, copy, failure });
  }
  insist(identity.manifestSha256 === digest(identity.manifest), "installed manifest mutated");
  for (const file of [...noFonts.files, ...full.files])
    insist(digest(file.path) === file.sha256, `installed CSS mutated: ${file.path}`);
}
process.stdout.write(
  `G17 installed CSS resolution/closures and ${cssEvidence.negatives.length} separately copied negatives passed\n`,
);

const casesRoot = join(consumerDir, "css-cases");
const cases = [];
for (const pkg of styled) {
  for (const mode of ["no-css", "no-fonts", "full-fonts"]) {
    const name = `${pkg.name.split("/")[1]}-${mode}`;
    const root = join(casesRoot, name);
    mkdirSync(root, { recursive: true });
    const sheet =
      mode === "no-css"
        ? ""
        : `import "${pkg.name}/${mode === "no-fonts" ? "components-no-fonts.css" : "components.css"}";`;
    writeFileSync(
      join(root, "entry.jsx"),
      `import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Provider } from "${pkg.name}/Provider";
import { Button } from "${pkg.name}/Button";
import { ToggleButton } from "${pkg.name}/ToggleButton";
${sheet}
function App() {
  const [dark, setDark] = createSignal(false);
  const [count, setCount] = createSignal(0);
  return <Provider colorScheme={dark() ? "dark" : "light"} background="base">
    <Button onPress={() => setCount(n => n + 1)}>Packed action</Button>
    <ToggleButton isSelected={dark()} onChange={setDark}>Dark theme</ToggleButton>
    <output id="count">{count()}</output>
    ${mode === "full-fonts" ? '<p id="font-control" style={{ "font-family": "adobe-clean-spectrum-vf", "font-size": "24px" }}>Adobe font detector control</p>' : ""}
  </Provider>;
}
render(() => <App />, document.getElementById("root"));\n`,
    );
    writeFileSync(
      join(root, "index.html"),
      '<!doctype html><html><body><div id="root"></div><script type="module" src="./entry.jsx"></script></body></html>\n',
    );
    writeFileSync(
      join(root, "vite.config.mjs"),
      `import base from "../../vite.config.mjs";\nexport default { ...base, root: ${JSON.stringify(root)}, base: "./", build: { ...base.build, outDir: "dist" } };\n`,
    );
    runVite(["build", "--config", join(root, "vite.config.mjs")]);
    const output = join(root, "dist");
    const emittedHtml = readFileSync(join(output, "index.html"), "utf8");
    const links = [...emittedHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(
      (match) => match[0].match(/href="([^"]+)"/)[1],
    );
    insist(!/<style\b/i.test(emittedHtml), `${name} has an inline style sheet`);
    insist(
      mode === "no-css" ? links.length === 0 : links.length > 0,
      `${name} emitted stylesheet isolation failed`,
    );
    const closures = links.map((href) =>
      cssClosure(resolve(output, href), output, mode === "full-fonts"),
    );
    cases.push({ name, package: pkg.name, mode, output, links, closures });
  }
}

// Existing browser installation only, resolved from the owning app.
const { chromium } = createRequire(join(repoRoot, "apps/web/package.json"))("playwright");
const server = createServer((request, response) => {
  try {
    const path = resolve(
      casesRoot,
      `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`,
    );
    insist(
      inside(path, casesRoot) && inside(realpathSync(path), casesRoot),
      "server traversal refused",
    );
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    response.setHeader("Content-Type", types[extname(path)] ?? "application/octet-stream");
    response.end(readFileSync(path));
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    args: (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean),
  });
  for (const testCase of cases) {
    const context = await browser.newContext({ serviceWorkers: "block", colorScheme: "light" });
    const attempts = [];
    const errors = [];
    try {
      // Record before abort and before navigation. No off-origin request is sent.
      await context.route("**/*", async (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== origin) {
          attempts.push({ url: request.url(), resourceType: request.resourceType() });
          await route.abort();
        } else await route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${origin}/${testCase.name}/dist/index.html`);
      const action = page.getByRole("button", { name: "Packed action", exact: true });
      const toggle = page.getByRole("button", { name: "Dark theme", exact: true });
      await action.waitFor({ state: "visible" });
      const fontsReady = await page.evaluate(async () =>
        Promise.race([
          document.fonts.ready.then(() => "ready"),
          new Promise((resolve) => setTimeout(() => resolve("timeout"), 5000)),
        ]),
      );
      insist(fontsReady === "ready", `${testCase.name} fonts.ready timed out`);
      async function measured() {
        return page.evaluate(() => {
          const provider = document.querySelector('[data-background="base"]');
          const buttons = [...provider.querySelectorAll("button")];
          const p = getComputedStyle(provider);
          return {
            background: p.backgroundColor,
            scheme: p.colorScheme,
            container: p.getPropertyValue("--s2-container-bg").trim(),
            surface: p.getPropertyValue("--surface-app").trim(),
            buttons: buttons.map((button) => {
              const s = getComputedStyle(button);
              const box = button.getBoundingClientRect();
              return {
                height: box.height,
                width: box.width,
                display: s.display,
                radius: s.borderRadius,
                padding: s.padding,
                background: s.backgroundColor,
              };
            }),
            sheets: [...document.styleSheets].map((sheet) => ({
              href: sheet.href,
              tag: sheet.ownerNode.tagName,
              id: sheet.ownerNode.id,
              text: sheet.href ? null : sheet.ownerNode.textContent.replace(/\s+/g, " ").trim(),
              rules: sheet.href
                ? null
                : [...sheet.cssRules].map((rule) => rule.cssText.replace(/\s+/g, " ").trim()),
            })),
          };
        });
      }
      const light = await measured();
      await action.click();
      await page.waitForFunction(() => document.querySelector("#count").textContent === "1");
      await toggle.click();
      await page.waitForFunction(
        () =>
          document.querySelector('[data-color-scheme="dark"]') &&
          document.querySelector('button[aria-pressed="true"]'),
      );
      const dark = await measured();
      let fontLoad;
      if (testCase.mode === "full-fonts") {
        fontLoad = await page.evaluate(async () =>
          Promise.race([
            document.fonts
              .load('24px "adobe-clean-spectrum-vf"', "Adobe font detector control")
              .then(
                () => "loaded",
                () => "rejected",
              ),
            new Promise((resolve) => setTimeout(() => resolve("timeout"), 5000)),
          ]),
        );
        insist(fontLoad !== "timeout", `${testCase.name} font load timed out`);
        const declared = cssEvidence.installed.find((item) => item.name === testCase.package).full;
        const declaredUrls = new Set(declared.external);
        const declaredImports = new Set(declared.externalImports);
        insist(
          attempts.every(
            (item) =>
              declaredUrls.has(item.url) &&
              item.resourceType === (declaredImports.has(item.url) ? "stylesheet" : "font"),
          ),
          `${testCase.name} attempted undeclared external resources: ${JSON.stringify(attempts)}`,
        );
        insist(
          attempts.some(
            (item) =>
              new URL(item.url).hostname === "use.typekit.net" && item.resourceType === "font",
          ),
          `${testCase.name} did not observe a Typekit font attempt`,
        );
      } else
        insist(
          attempts.length === 0,
          `${testCase.name} attempted external requests: ${JSON.stringify(attempts)}`,
        );
      insist(errors.length === 0, `${testCase.name} browser errors: ${errors.join("; ")}`);
      insist(
        light.buttons.length === 2 &&
          light.buttons.every((button) => button.width > 0 && button.height > 0),
        `${testCase.name} did not mount real visible controls`,
      );
      for (const state of [light, dark]) {
        // createPress injects only touch-action behavior, including in the
        // missing-CSS control. It supplies no theme or component geometry.
        const inline = state.sheets.filter((sheet) => !sheet.href);
        insist(
          inline.length === 1 &&
            inline[0].tag === "STYLE" &&
            inline[0].id === "solidaria-pressable-style" &&
            inline[0].text ===
              "@layer { [data-solidaria-pressable] { touch-action: pan-x pan-y pinch-zoom; } }" &&
            inline[0].rules.length === 1 &&
            inline[0].rules[0] ===
              "@layer { [data-solidaria-pressable] { touch-action: pan-x pan-y pinch-zoom; } }",
          `${testCase.name} unexpected inline behavior sheet: ${JSON.stringify(inline)}`,
        );
        const linked = state.sheets.filter((sheet) => sheet.href).map((sheet) => sheet.href);
        const expected = testCase.links.map(
          (href) => new URL(href, `${origin}/${testCase.name}/dist/index.html`).href,
        );
        insist(
          linked.length === expected.length && linked.every((href) => expected.includes(href)),
          `${testCase.name} injected/shared style sheet`,
        );
      }
      cssEvidence.runtime.push({
        ...testCase,
        attempts,
        fontsReady,
        fontLoad,
        light,
        dark,
        actionCount: 1,
        selected: true,
      });
    } finally {
      await context.close();
    }
  }
  for (const pkg of styled) {
    const noCss = cssEvidence.runtime.find(
      (item) => item.package === pkg.name && item.mode === "no-css",
    );
    const noFonts = cssEvidence.runtime.find(
      (item) => item.package === pkg.name && item.mode === "no-fonts",
    );
    // Provider declares background via --s2-container-bg and isolation; buttons
    // declare flex/grid geometry in the generated S2 sheet. UA buttons cannot
    // satisfy this conjunction. Both light/dark mounted controls remain usable.
    const styledPredicate = (state) =>
      state.container !== "" &&
      state.background !== "rgba(0, 0, 0, 0)" &&
      state.buttons[0].display === "flex" &&
      state.buttons[1].display === "grid" &&
      state.buttons.every((button) => button.height >= 24);
    insist(
      styledPredicate(noFonts.light) && styledPredicate(noFonts.dark),
      `${pkg.name} no-font authored style predicate failed`,
    );
    insist(
      !styledPredicate(noCss.light) && !styledPredicate(noCss.dark),
      `${pkg.name} missing-CSS control did not fail style predicate`,
    );
    insist(
      noFonts.light.background !== noFonts.dark.background,
      `${pkg.name} Provider theme did not change background`,
    );
    insist(
      noFonts.light.buttons.some(
        (button, i) =>
          button.height !== noCss.light.buttons[i].height &&
          button.padding !== noCss.light.buttons[i].padding,
      ),
      `${pkg.name} authored geometry matches missing CSS`,
    );
    if (pkg.name.endsWith("/ui"))
      insist(
        noFonts.light.surface &&
          noFonts.dark.surface &&
          noFonts.light.surface !== noFonts.dark.surface &&
          !noCss.light.surface,
        "UI theme tokens missing or not reactive",
      );
  }
} finally {
  try {
    if (browser) await browser.close();
  } finally {
    try {
      await new Promise((resolve) => server.close(resolve));
    } finally {
      writeFileSync(
        join(consumerDir, "css-evidence.json"),
        `${JSON.stringify(cssEvidence, null, 2)}\n`,
      );
    }
  }
}
process.stdout.write(
  `G17: ${cssEvidence.runtime.length} isolated browser cases passed; missing CSS rejected, full-font attempts observed and blocked, no-font external attempts zero\n`,
);

process.stdout.write(
  `\n✓ Smoke passed: the public package set installed from tarballs out-of-workspace; ` +
    `Viviana, Kumo, and Geist built and rendered in DOM + SSR; all ${fileRefCount} checked export-map files exist, ` +
    `all ${jsSubpaths.length} checked JS subpaths resolve, and both CSS export contracts hold.\n`,
);

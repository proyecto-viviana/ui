#!/usr/bin/env node
// UC-00 out-of-workspace install smoke.
//
// Proves a real client can install `@proyecto-viviana/ui` from packed tarballs —
// outside this workspace, with no pnpm symlinks — and build it for both the
// browser (DOM) and the server (SSR) with the same vite-plugin-solid setup a
// TanStack Start / solid-start app uses. The render assertion proves the
// component's macro-expanded style classes survived the publish round-trip.
//
// Prereq: run `vp run pack:local-chain` first (or `vp run ui:smoke`, which chains
// both). This script consumes the tarballs that produced; it does not build them.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const packsDir = resolve(process.env.VIVIANA_PACK_OUT ?? "/tmp/viviana-ui-packs-chain");
const consumerDir = resolve(process.env.VIVIANA_CONSUMER_DIR ?? "/tmp/viviana-ui-consume-smoke");

// Same closure, same order as pack-local-chain.mjs.
const packages = [
  { name: "@proyecto-viviana/solid-stately", dir: "packages/solid-stately" },
  { name: "@proyecto-viviana/solidaria", dir: "packages/solidaria" },
  { name: "@proyecto-viviana/solidaria-components", dir: "packages/solidaria-components" },
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
const overrides = Object.fromEntries(packages.map((p) => [p.name, fileSpec(p.name)]));

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
        "@proyecto-viviana/ui": fileSpec("@proyecto-viviana/ui"),
        "solid-js": "^1.9.0",
      },
      devDependencies: {
        vite: "^6.0.0",
        "vite-plugin-solid": "^2.11.12",
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
import solid from "vite-plugin-solid";

// A client consuming the *pre-built* package does NOT author style() macros, so
// no macro plugin is needed (that is UC-04). It only needs vite-plugin-solid plus
// the standard "keep our Solid packages out of the optimizer, bundle them into
// SSR" wiring — the same shape apps/web uses for workspace sources.
const pkgs = [
  "@proyecto-viviana/ui",
  "@proyecto-viviana/solid-spectrum",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solid-stately",
];

export default defineConfig({
  // ssr:true makes vite-plugin-solid emit generate:'ssr' for the server build and
  // generate:'dom' (hydratable) for the client build — without it the plugin
  // hardcodes 'dom' even under \`vite build --ssr\`, and the server crashes calling
  // template() (a client-only API). solid-start/TanStack Start wire this for you;
  // a plain dual-target vite build must opt in.
  plugins: [solid({ ssr: true })],
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

export function App() {
  return <Button>Hello from packed ui</Button>;
}
`;
writeFileSync(join(consumerDir, "src", "App.jsx"), app);

writeFileSync(
  join(consumerDir, "src", "entry-client.jsx"),
  `import { render } from "solid-js/web";
import { App } from "./App.jsx";

render(() => <App />, document.getElementById("root"));
`,
);

writeFileSync(
  join(consumerDir, "src", "entry-ssr.jsx"),
  `import { renderToString } from "solid-js/web";
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
run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"]);

process.stdout.write(`\n=== DOM build ===\n`);
run("npm", ["exec", "--", "vite", "build"]);
if (!existsSync(join(consumerDir, "dist", "index.html"))) {
  throw new Error("DOM build produced no dist/index.html");
}

process.stdout.write(`\n=== SSR build ===\n`);
run("npm", ["exec", "--", "vite", "build", "--ssr", "src/entry-ssr.jsx", "--outDir", "dist-ssr"]);

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
const installedDir = join(consumerDir, "node_modules", "@proyecto-viviana", "ui");
const installedPkg = readJson(join(installedDir, "package.json"));

// (1) Every referenced file exists on disk.
const missingFiles = [];
let fileRefCount = 0;
const checkFileRef = (subpath, condition, relPath) => {
  if (typeof relPath !== "string") return;
  fileRefCount += 1;
  if (!existsSync(join(installedDir, relPath))) {
    missingFiles.push(`${subpath} [${condition}] -> ${relPath}`);
  }
};
for (const [subpath, target] of Object.entries(installedPkg.exports)) {
  if (typeof target === "string") {
    checkFileRef(subpath, "default", target);
  } else if (target && typeof target === "object") {
    for (const [condition, relPath] of Object.entries(target)) {
      checkFileRef(subpath, condition, relPath);
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

// (2) Node resolves every JS subpath specifier (the import condition).
const jsSubpaths = Object.entries(installedPkg.exports)
  .filter(
    ([key, value]) =>
      key !== "./package.json" &&
      value &&
      typeof value === "object" &&
      typeof value.import === "string" &&
      value.import.endsWith(".js"),
  )
  .map(([key]) => key.replace(/^\.\/?/, ""))
  .map((sub) => (sub === "" ? "@proyecto-viviana/ui" : `@proyecto-viviana/ui/${sub}`));

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

process.stdout.write(
  `\n✓ Smoke passed: @proyecto-viviana/ui installed from tarballs out-of-workspace, built DOM + SSR, ` +
    `rendered a styled <button>; all ${fileRefCount} export-map files exist and all ${jsSubpaths.length} JS subpaths resolve.\n`,
);

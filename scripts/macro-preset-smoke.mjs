#!/usr/bin/env node
// UC-04 in-repo macro-preset smoke.
//
// Proves an app that authors its OWN style() macro calls against
// `@proyecto-viviana/ui/style` can build for DOM and SSR using the published
// `@proyecto-viviana/ui/vite` helper (`vivianaMacros`): the macro generates and
// loads CSS, and the expanded class survives into both the DOM CSS asset and the
// SSR-rendered HTML. Unlike `consume-pack-smoke` (a pre-built consumer with no
// macros), this fixture runs the macro plugin.
//
// It runs IN the workspace on purpose. The workspace pins `vite` ->
// `@voidzero-dev/vite-plus-core` (rolldown-vite) via a pnpm override — the same
// rolldown-vite the helper's `macros.rolldown()` targets and the same flavor the
// real downstream apps build with (their copied wrappers also call
// `macros.rolldown()`). So the fixture imports the *built* `@proyecto-viviana/ui`
// surfaces exactly as a real consumer would, and drives the build through Vite's
// JS API.
//
// The fixture lives under `packages/viviana-ui/test/macro-preset` so Vite's and
// the macro plugin's own resolvers (both walk up from the importer) reach
// `packages/viviana-ui/node_modules` for the dependency chain. Only the package's
// self-reference (`@proyecto-viviana/ui` -> the package root) is missing from
// node_modules, so we materialize that one symlink for the build.
//
// Prereq: `@proyecto-viviana/ui` (and its deps) must be built — run
// `vp run build` first. This consumes the built dist; it does not build it.
import { build } from "vite";
import solid from "vite-plugin-solid";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const pkgDir = join(repoRoot, "packages", "viviana-ui");
const fixtureRoot = join(pkgDir, "test", "macro-preset");
// Build output lives under the fixture's node_modules (gitignored, and removed in
// the finally below). Keeping it inside the package tree matters for the SSR
// step: the server bundle keeps `solid-js` external (the correct server build is
// chosen at runtime), so importing it here must resolve `solid-js` — Node walks
// up from the output file to `packages/viviana-ui/node_modules`.
const outRoot = join(fixtureRoot, "node_modules", ".macro-out");
const domOut = join(outRoot, "dom");
const ssrOut = join(outRoot, "ssr");

// The macro substitutes `[#abcdef]` verbatim into a `background-color` rule. We
// grep the generated CSS for it: its presence proves the macro emitted CSS and
// the helper loaded it through Vite's CSS pipeline.
const SENTINEL = "abcdef";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function listFilesRecursive(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

const problems = [];

// --- The helper under test is exactly what `@proyecto-viviana/ui/vite` ships ----
// Assert the published export points at the built helper, then import that file
// (self-referencing the package by name from outside it isn't guaranteed, so we
// resolve via the export map ourselves).
const pkg = readJson(join(pkgDir, "package.json"));
const viteExport = pkg.exports?.["./vite"];
const viteTarget =
  typeof viteExport === "object" ? (viteExport.import ?? viteExport.default) : null;
if (viteTarget !== "./dist/vite.js") {
  throw new Error(
    `@proyecto-viviana/ui exports['./vite'].import should be ./dist/vite.js, got ${JSON.stringify(viteTarget)}`,
  );
}
const helperFile = join(pkgDir, viteTarget);
if (!existsSync(helperFile)) {
  throw new Error(
    `Helper ${viteTarget} not built — run \`vp run build\` first (missing ${helperFile})`,
  );
}
const { vivianaMacros } = await import(pathToFileURL(helperFile).href);
if (typeof vivianaMacros !== "function") {
  throw new Error("@proyecto-viviana/ui/vite does not export a vivianaMacros() function");
}

// --- Materialize the missing self-reference so the fixture resolves the macro --
// `@proyecto-viviana/ui/style` (and the helper) must resolve by package name for
// both Vite and the parcel macro resolver. node_modules already carries the rest
// of the chain; only the self-link is absent.
const fixtureModules = join(fixtureRoot, "node_modules", "@proyecto-viviana");
rmSync(join(fixtureRoot, "node_modules"), { recursive: true, force: true });
mkdirSync(fixtureModules, { recursive: true });
symlinkSync(pkgDir, join(fixtureModules, "ui"), "dir");

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

try {
  // --- DOM build ---------------------------------------------------------------
  // Default html input (index.html). The macro plugin runs first, expands the
  // app's style() call, emits `import "macro-<hash>.css"` + the matching virtual
  // module; the helper resolves/loads it so Vite extracts it into a CSS asset.
  process.stdout.write(`\n=== DOM build (vivianaMacros + solid, generate:'dom') ===\n`);
  await build({
    root: fixtureRoot,
    logLevel: "warn",
    plugins: [vivianaMacros(), solid({ ssr: true })],
    build: { outDir: domOut, emptyOutDir: true, minify: false },
  });

  const domCssFiles = listFilesRecursive(domOut).filter((f) => f.endsWith(".css"));
  if (domCssFiles.length === 0) {
    problems.push("DOM build emitted no .css asset (macro CSS was not generated/loaded)");
  } else {
    const cssWithSentinel = domCssFiles.filter((f) => readFileSync(f, "utf8").includes(SENTINEL));
    if (cssWithSentinel.length === 0) {
      problems.push(
        `DOM build CSS asset(s) do not contain the macro sentinel '${SENTINEL}':\n    ${domCssFiles.join("\n    ")}`,
      );
    } else {
      process.stdout.write(
        `macro CSS generated + loaded: ${cssWithSentinel.map((f) => f.replace(`${outRoot}/`, "")).join(", ")}\n`,
      );
    }
  }

  // --- SSR build ---------------------------------------------------------------
  // generate:'ssr' for the same fixture. The core SSR proof is that the build
  // completes without "failed to resolve import macro-<hash>.css" — i.e. the
  // helper strips the macro CSS import from the server bundle (renderChunk) — and
  // that the style() class still expands at runtime.
  process.stdout.write(`\n=== SSR build (vivianaMacros + solid, generate:'ssr') ===\n`);
  await build({
    root: fixtureRoot,
    logLevel: "warn",
    plugins: [vivianaMacros(), solid({ ssr: true })],
    build: { outDir: ssrOut, emptyOutDir: true, minify: false, ssr: "entry-ssr.jsx" },
    // SSR resolver must prefer the `solid` condition so our packages SSR-compile
    // from the JSX-preserved entries rather than the DOM-compiled .js.
    ssr: { resolve: { conditions: ["solid", "node", "import", "module", "default"] } },
  });

  const ssrEntry = join(ssrOut, "entry-ssr.js");
  if (!existsSync(ssrEntry)) {
    problems.push("SSR build produced no entry-ssr.js");
  } else {
    const { renderApp } = await import(pathToFileURL(ssrEntry).href);
    const html = renderApp();
    process.stdout.write(`SSR render: ${html}\n`);
    if (!/macro styled/.test(html)) problems.push("SSR HTML is missing the rendered text");
    const classMatch = html.match(/class="([^"]*)"/);
    if (!classMatch || classMatch[1].trim() === "") {
      problems.push(
        "SSR-rendered element carries no style() class (macro did not expand under SSR)",
      );
    } else {
      process.stdout.write(`SSR style() class applied: "${classMatch[1]}"\n`);
    }
  }
} finally {
  rmSync(join(fixtureRoot, "node_modules"), { recursive: true, force: true });
}

// --- Result --------------------------------------------------------------------
if (problems.length > 0) {
  process.stderr.write(`\nMACRO SMOKE FAILED:\n  - ${problems.join("\n  - ")}\n`);
  process.exit(1);
}

process.stdout.write(
  `\n✓ Macro smoke passed: an app authoring @proyecto-viviana/ui/style macros built DOM + SSR ` +
    `through @proyecto-viviana/ui/vite (vivianaMacros); the macro generated CSS (sentinel in the ` +
    `DOM asset) and the style() class expanded in the SSR-rendered HTML.\n`,
);

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const outDir = resolve(process.env.VIVIANA_PACK_OUT ?? "/tmp/viviana-ui-packs-chain");
const stageRoot = resolve(
  process.env.VIVIANA_PACK_STAGE ?? `/tmp/viviana-ui-pack-stage-${process.pid}`,
);

const packages = [
  { name: "@proyecto-viviana/solid-stately", dir: "packages/solid-stately" },
  { name: "@proyecto-viviana/solidaria", dir: "packages/solidaria" },
  { name: "@proyecto-viviana/solidaria-components", dir: "packages/solidaria-components" },
  { name: "@proyecto-viviana/solid-spectrum", dir: "packages/solid-spectrum" },
  { name: "@proyecto-viviana/ui", dir: "packages/viviana-ui" },
];

const packageByName = new Map(packages.map((pkg) => [pkg.name, pkg]));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function copyPackage(pkg) {
  const source = join(repoRoot, pkg.dir);
  const target = join(stageRoot, pkg.dir);

  cpSync(source, target, {
    recursive: true,
    filter(path) {
      return !path.includes("/node_modules/") && !path.endsWith("/node_modules");
    },
  });

  return target;
}

function rewriteWorkspaceDependencies(pkg, stageDir) {
  const manifestPath = join(stageDir, "package.json");
  const manifest = readJson(manifestPath);
  const fields = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

  for (const field of fields) {
    const deps = manifest[field];
    if (!deps) continue;

    for (const [depName, spec] of Object.entries(deps)) {
      if (typeof spec !== "string" || !spec.startsWith("workspace:")) continue;

      const dep = packageByName.get(depName);
      if (!dep) {
        if (field === "devDependencies") {
          delete deps[depName];
          continue;
        }

        throw new Error(`${pkg.name} has unsupported workspace dependency ${depName}`);
      }

      const depManifest = readJson(join(repoRoot, dep.dir, "package.json"));
      deps[depName] = depManifest.version;
    }

    if (Object.keys(deps).length === 0) {
      delete manifest[field];
    }
  }

  writeJson(manifestPath, manifest);
}

function assertDist(pkg, stageDir) {
  const distPath = join(stageDir, "dist");
  if (!existsSync(distPath)) {
    throw new Error(
      `${pkg.name} has no dist directory. Run 'vp run pack:local-chain' to build first, or build ${pkg.dir} before using the skip-build script.`,
    );
  }
}

function pack(stageDir) {
  const result = spawnSync("npm", ["pack", stageDir, "--pack-destination", outDir, "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

  if (result.status !== 0) {
    throw new Error(`npm pack failed for ${stageDir}`);
  }

  const packed = JSON.parse(result.stdout);
  if (!Array.isArray(packed) || !packed[0]?.filename) {
    throw new Error(`npm pack returned unexpected output for ${stageDir}: ${result.stdout}`);
  }

  return resolve(outDir, packed[0].filename);
}

function fileSpec(path) {
  return `file:${path}`;
}

function printJson(title, value) {
  process.stdout.write(`\n${title}\n`);
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

rmSync(outDir, { recursive: true, force: true });
rmSync(stageRoot, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(stageRoot, { recursive: true });

const tarballs = {};

for (const pkg of packages) {
  const stageDir = copyPackage(pkg);
  rewriteWorkspaceDependencies(pkg, stageDir);
  assertDist(pkg, stageDir);
  tarballs[pkg.name] = pack(stageDir);
}

const overrideSpecs = Object.fromEntries(
  packages.map((pkg) => [pkg.name, fileSpec(tarballs[pkg.name])]),
);

printJson("Packed tarballs", tarballs);
printJson("pnpm.overrides for consumers", overrideSpecs);
printJson("Pokeforos dependency", {
  "@proyecto-viviana/ui": fileSpec(tarballs["@proyecto-viviana/ui"]),
});
printJson("Comparison dependencies", {
  "@proyecto-viviana/solid-stately": fileSpec(tarballs["@proyecto-viviana/solid-stately"]),
  "@proyecto-viviana/solidaria": fileSpec(tarballs["@proyecto-viviana/solidaria"]),
  "@proyecto-viviana/solidaria-components": fileSpec(
    tarballs["@proyecto-viviana/solidaria-components"],
  ),
  "@proyecto-viviana/solid-spectrum": fileSpec(tarballs["@proyecto-viviana/solid-spectrum"]),
});

process.stdout.write(`\nStage directory: ${stageRoot}\n`);
process.stdout.write(`Output directory: ${outDir}\n`);

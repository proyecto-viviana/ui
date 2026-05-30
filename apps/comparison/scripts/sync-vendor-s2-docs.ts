// Sync upstream Spectrum 2 docs MDX into apps/comparison/vendor/s2-docs/pages/.
//
// Source: the local `react-spectrum/` checkout at the repo root (gitignored,
// maintained by the developer). We do not clone from GitHub — the local copy
// is authoritative and offline.
//
// Usage (from apps/comparison):
//   vp run sync:vendor                       # syncs every *.mdx in pages/s2
//   vp run sync:vendor -- --pages=Button     # syncs Button.mdx only
//   vp run sync:vendor -- --pages=Button,ComboBox,DatePicker
//
// The script copies the requested MDX files into vendor/s2-docs/pages/ and
// rewrites NOTICE with the upstream package version + sync timestamp.

import {
  readdirSync,
  readFileSync,
  statSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "../..");
const upstreamRoot = resolve(repoRoot, "react-spectrum");
const upstreamPagesDir = resolve(upstreamRoot, "packages/dev/s2-docs/pages/s2");
const vendorDir = resolve(appRoot, "vendor/s2-docs");
const vendorPagesDir = resolve(vendorDir, "pages");
const noticePath = resolve(vendorDir, "NOTICE");

interface CliArgs {
  pages: string[] | "all";
}

function parseArgs(argv: string[]): CliArgs {
  let pages: string[] | "all" = "all";
  for (const arg of argv) {
    if (arg === "--") {
      continue;
    }
    if (arg.startsWith("--pages=")) {
      const list = arg.slice("--pages=".length).trim();
      if (list.length === 0) {
        throw new Error("--pages= requires a non-empty value");
      }
      pages = list
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    } else if (arg === "--help" || arg === "-h") {
      printUsageAndExit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { pages };
}

function printUsageAndExit(code: number): never {
  process.stdout.write(
    `sync-vendor-s2-docs — copy upstream Spectrum 2 MDX from react-spectrum/ into vendor/s2-docs/pages\n\n` +
      `Usage:\n` +
      `  vp run sync:vendor                       # sync every *.mdx page\n` +
      `  vp run sync:vendor -- --pages=Button     # sync one page\n` +
      `  vp run sync:vendor -- --pages=Button,ComboBox,DatePicker\n`,
  );
  process.exit(code);
}

function readUpstreamVersion(): string {
  const pkgPath = resolve(upstreamRoot, "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const json = JSON.parse(raw) as { version?: string };
  if (!json.version) {
    throw new Error(`Could not read version from ${pkgPath}`);
  }
  return json.version;
}

function listAllMdxPages(): string[] {
  const entries = readdirSync(upstreamPagesDir);
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(upstreamPagesDir, entry);
    if (statSync(full).isFile() && entry.endsWith(".mdx")) {
      out.push(entry.slice(0, -".mdx".length));
    }
  }
  return out.sort();
}

function copyPage(name: string) {
  const source = join(upstreamPagesDir, `${name}.mdx`);
  const target = join(vendorPagesDir, `${name}.mdx`);
  try {
    statSync(source);
  } catch {
    throw new Error(`Upstream page not found: ${source}`);
  }
  copyFileSync(source, target);
}

function writeNotice(version: string, syncedPages: string[]) {
  const synced = new Date().toISOString();
  const pageList = syncedPages.map((p) => `  - ${p}.mdx`).join("\n");
  const body =
    `This directory contains MDX source files vendored from\n` +
    `github.com/adobe/react-spectrum under the Apache License 2.0.\n\n` +
    `Upstream:           https://github.com/adobe/react-spectrum\n` +
    `Path:               packages/dev/s2-docs/pages/s2/\n` +
    `License:            Apache-2.0 (see ../LICENSE-react-spectrum)\n` +
    `Source:             local react-spectrum/ checkout at the repo root\n` +
    `Upstream version:   ${version}\n` +
    `Synced:             ${synced}\n\n` +
    `Synced pages:\n${pageList}\n\n` +
    `These files are read-only inputs to\n` +
    `\`apps/comparison/scripts/import-s2-docs-mdx.ts\`. Do not hand-edit. To\n` +
    `refresh, run:\n\n` +
    `  vp run --filter @proyecto-viviana/comparison sync:vendor\n`;
  writeFileSync(noticePath, body);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(vendorPagesDir, { recursive: true });

  const pages = args.pages === "all" ? listAllMdxPages() : args.pages;
  if (pages.length === 0) {
    process.stderr.write("No pages selected to sync.\n");
    process.exit(1);
  }

  process.stdout.write(`Syncing ${pages.length} page(s) from ${upstreamPagesDir}\n`);
  for (const page of pages) {
    process.stdout.write(`  ${page}.mdx\n`);
    copyPage(page);
  }

  const version = readUpstreamVersion();
  writeNotice(version, pages);
  process.stdout.write(`\nNOTICE written to ${noticePath}\n`);
  process.stdout.write(`Upstream version: ${version}\n`);
}

main();

/**
 * Bundle Size Analysis - Compares Proyecto Viviana vs React Spectrum
 *
 * Measures raw, minified, gzipped, and brotli-compressed bundle sizes
 * across three scenarios: single component, multiple components, full library.
 */

import * as esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { gzipSize } from "gzip-size";
import brotliSizeModule from "brotli-size";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Handle both default and named exports for brotli-size
const brotliSize = (brotliSizeModule as any).default || brotliSizeModule;

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BundleMetrics {
  raw: number;
  minified: number;
  gzip: number;
  brotli: number;
}

interface ScenarioResult {
  pv: BundleMetrics;
  rs: BundleMetrics;
}

interface BenchmarkResults {
  timestamp: string;
  environment: {
    node: string;
    esbuild: string;
    pv_version: string;
    rs_version: string;
  };
  scenarios: {
    single_button: ScenarioResult;
    multiple: ScenarioResult;
    full_library: ScenarioResult;
  };
}

async function analyzeBundle(entryPoint: string): Promise<BundleMetrics> {
  const isSolid = entryPoint.includes("pv-");

  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    treeShaking: true,
    platform: "browser",
    format: "esm",
    write: false,
    metafile: true,
    jsx: isSolid ? undefined : "automatic",
    jsxImportSource: isSolid ? undefined : "react",
    plugins: isSolid ? [solidPlugin()] : [],
    loader: { ".css": "text" }, // Include CSS as text in bundle
    logLevel: "silent",
  });

  if (!result.outputFiles || result.outputFiles.length === 0) {
    throw new Error(`No output files generated for ${entryPoint}`);
  }

  const output = result.outputFiles[0];
  const code = output.contents;

  // Measure raw minified size
  const minified = code.length;

  // Create unminified version for raw size
  const rawResult = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: false,
    treeShaking: true,
    platform: "browser",
    format: "esm",
    write: false,
    jsx: isSolid ? undefined : "automatic",
    jsxImportSource: isSolid ? undefined : "react",
    plugins: isSolid ? [solidPlugin()] : [],
    loader: { ".css": "text" }, // Include CSS as text in bundle
    logLevel: "silent",
  });

  const raw = rawResult.outputFiles![0].contents.length;

  // Measure compressed sizes
  const gzip = await gzipSize(code);
  const brotli = await brotliSize(code);

  return { raw, minified, gzip, brotli };
}

async function readPackageJson(path: string): Promise<Record<string, any> | undefined> {
  try {
    if (existsSync(path)) {
      return JSON.parse(await readFile(path, "utf8"));
    }
  } catch (error) {
    console.warn(`Could not read package metadata from ${path}:`, error);
  }
  return undefined;
}

async function getPackageVersions(): Promise<{ pv: string; rs: string }> {
  const [pvPackage, comparisonPackage] = await Promise.all([
    readPackageJson(resolve(__dirname, "../../packages/solid-spectrum/package.json")),
    readPackageJson(resolve(__dirname, "../../apps/comparison/package.json")),
  ]);

  return {
    pv: typeof pvPackage?.version === "string" ? pvPackage.version : "unknown",
    rs:
      typeof comparisonPackage?.dependencies?.["@adobe/react-spectrum"] === "string"
        ? comparisonPackage.dependencies["@adobe/react-spectrum"]
        : "unknown",
  };
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function calculateSavings(pv: number, rs: number): string {
  const savings = ((rs - pv) / rs) * 100;
  return `${savings > 0 ? "+" : ""}${savings.toFixed(1)}%`;
}

function printResults(results: BenchmarkResults) {
  console.log("\n📊 Bundle Size Analysis Results\n");
  console.log("Environment:");
  console.log(`  Node: ${results.environment.node}`);
  console.log(`  esbuild: ${results.environment.esbuild}`);
  console.log(`  PV: ${results.environment.pv_version}`);
  console.log(`  RS: ${results.environment.rs_version}`);
  console.log();

  const scenarios = [
    { name: "Single Button", key: "single_button" as const },
    { name: "Multiple Components", key: "multiple" as const },
    { name: "Full Library", key: "full_library" as const },
  ];

  for (const scenario of scenarios) {
    const data = results.scenarios[scenario.key];
    console.log(`${scenario.name}:`);
    console.log("┌─────────────┬──────────────┬──────────────┬───────────┐");
    console.log("│ Metric      │ PV           │ RS           │ Savings   │");
    console.log("├─────────────┼──────────────┼──────────────┼───────────┤");
    console.log(
      `│ Raw         │ ${formatBytes(data.pv.raw).padEnd(12)} │ ${formatBytes(data.rs.raw).padEnd(12)} │ ${calculateSavings(data.pv.raw, data.rs.raw).padEnd(9)} │`,
    );
    console.log(
      `│ Minified    │ ${formatBytes(data.pv.minified).padEnd(12)} │ ${formatBytes(data.rs.minified).padEnd(12)} │ ${calculateSavings(data.pv.minified, data.rs.minified).padEnd(9)} │`,
    );
    console.log(
      `│ Gzip        │ ${formatBytes(data.pv.gzip).padEnd(12)} │ ${formatBytes(data.rs.gzip).padEnd(12)} │ ${calculateSavings(data.pv.gzip, data.rs.gzip).padEnd(9)} │`,
    );
    console.log(
      `│ Brotli      │ ${formatBytes(data.pv.brotli).padEnd(12)} │ ${formatBytes(data.rs.brotli).padEnd(12)} │ ${calculateSavings(data.pv.brotli, data.rs.brotli).padEnd(9)} │`,
    );
    console.log("└─────────────┴──────────────┴──────────────┴───────────┘");
    console.log();
  }
}

async function main() {
  console.log("🔍 Analyzing bundle sizes...\n");
  const versions = await getPackageVersions();

  const fixtures = {
    single_button: {
      pv: join(__dirname, "fixtures/pv-button.tsx"),
      rs: join(__dirname, "fixtures/rs-button.tsx"),
    },
    multiple: {
      pv: join(__dirname, "fixtures/pv-multiple.tsx"),
      rs: join(__dirname, "fixtures/rs-multiple.tsx"),
    },
    full_library: {
      pv: join(__dirname, "fixtures/pv-full.tsx"),
      rs: join(__dirname, "fixtures/rs-full.tsx"),
    },
  };

  const results: BenchmarkResults = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      esbuild: esbuild.version,
      pv_version: versions.pv,
      rs_version: versions.rs,
    },
    scenarios: {} as any,
  };

  // Analyze each scenario
  for (const [scenarioKey, paths] of Object.entries(fixtures)) {
    console.log(`Analyzing ${scenarioKey}...`);

    const pvMetrics = await analyzeBundle(paths.pv);
    console.log(`  PV: ${formatBytes(pvMetrics.gzip)} (gzip)`);

    const rsMetrics = await analyzeBundle(paths.rs);
    console.log(`  RS: ${formatBytes(rsMetrics.gzip)} (gzip)`);

    results.scenarios[scenarioKey as keyof typeof results.scenarios] = {
      pv: pvMetrics,
      rs: rsMetrics,
    };
  }

  // Print results table
  printResults(results);

  // Save results to JSON
  const resultsDir = join(__dirname, "results");
  await mkdir(resultsDir, { recursive: true });
  const resultsPath = join(resultsDir, "bundle-sizes.json");
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to ${resultsPath}`);
}

main().catch(console.error);

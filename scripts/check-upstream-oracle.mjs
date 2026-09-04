#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const ORACLE = path.join(ROOT, "react-spectrum");
const PIN_PATH = path.join(ROOT, "scripts", "upstream-pin.json");
const ACQUIRE = process.argv.includes("--acquire");
const UPSTREAM_URL = "https://github.com/adobe/react-spectrum.git";

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    const detail = options.capture ? (result.stderr || result.stdout || "").trim() : "";
    throw new Error(`git ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }

  return options.capture ? result.stdout.trim() : "";
}

function acquireOracle(commit) {
  if (existsSync(ORACLE)) return;

  console.log(`- materializing Adobe oracle at ${commit}`);
  mkdirSync(ORACLE, { recursive: false });
  git(["-C", ORACLE, "init"]);
  git(["-C", ORACLE, "remote", "add", "origin", UPSTREAM_URL]);
  git(["-C", ORACLE, "fetch", "--depth", "1", "origin", commit]);
  git(["-C", ORACLE, "checkout", "--detach", "FETCH_HEAD"]);
}

const pin = readJson(PIN_PATH);

console.log("Pinned upstream oracle check");
if (ACQUIRE) acquireOracle(pin.commit);

const failures = [];

if (!existsSync(path.join(ORACLE, ".git"))) {
  failures.push(
    "react-spectrum is absent or is not a git checkout; run `node scripts/check-upstream-oracle.mjs --acquire`.",
  );
} else {
  let head = null;
  try {
    head = git(["-C", ORACLE, "rev-parse", "HEAD"], { capture: true });
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  if (head && head !== pin.commit) {
    failures.push(`oracle HEAD ${head} does not match pinned commit ${pin.commit}.`);
  } else if (head) {
    console.log(`- commit ${head} matches the pin`);
  }
}

const packages = [
  {
    file: "react-spectrum/packages/@react-spectrum/s2/package.json",
    name: "@react-spectrum/s2",
  },
  {
    file: "react-spectrum/packages/react-aria-components/package.json",
    name: "react-aria-components",
  },
];

for (const expected of packages) {
  const manifestPath = path.join(ROOT, expected.file);
  if (!existsSync(manifestPath)) {
    failures.push(`required oracle manifest is missing: ${expected.file}.`);
    continue;
  }

  const manifest = readJson(manifestPath);
  const pinnedVersion = pin.tags[expected.name];
  if (manifest.name !== expected.name || manifest.version !== pinnedVersion) {
    failures.push(
      `${expected.file} is ${manifest.name ?? "?"}@${manifest.version ?? "?"}; expected ${expected.name}@${pinnedVersion}.`,
    );
  } else {
    console.log(`- ${expected.name}@${manifest.version} matches the pin`);
  }
}

const comparisonManifestPath = "apps/comparison/package.json";
const comparisonManifestFile = path.join(ROOT, comparisonManifestPath);
if (!existsSync(comparisonManifestFile)) {
  failures.push(`required comparison manifest is missing: ${comparisonManifestPath}.`);
} else {
  const comparisonManifest = readJson(comparisonManifestFile);
  const comparisonDeps = comparisonManifest.dependencies ?? {};
  for (const [name, pinnedVersion] of Object.entries(pin.tags)) {
    const declared = comparisonDeps[name];
    if (declared !== pinnedVersion) {
      failures.push(
        `${comparisonManifestPath} has ${name}@${declared ?? "(missing)"}; expected ${name}@${pinnedVersion}.`,
      );
    } else {
      console.log(`- comparison ${name}@${declared} matches the pin`);
    }
  }
}

const requiredEvidence = [
  "react-spectrum/packages/react-aria-components/exports/index.ts",
  "react-spectrum/packages/react-aria-components/test",
  "react-spectrum/packages/@react-spectrum/s2/style/spectrum-theme.ts",
  "react-spectrum/packages/@react-spectrum/s2/test",
  "react-spectrum/packages/@react-spectrum/s2/intl",
];

for (const evidencePath of requiredEvidence) {
  if (!existsSync(path.join(ROOT, evidencePath))) {
    failures.push(`required oracle evidence is missing: ${evidencePath}.`);
  }
}

if (failures.length > 0) {
  console.error("");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("");
  console.error("FAIL: upstream-backed checks cannot run against the pinned evidence.");
  process.exit(1);
}

console.log("PASS: the complete upstream oracle is materialized at the tracked pin.");

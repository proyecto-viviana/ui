#!/usr/bin/env node

/**
 * Holds the dependency ceilings in scripts/dependency-ceilings.json.
 *
 * A ceiling is an exact version kept for a compatibility reason. The check
 * fails when a workspace manifest or lockfile importer drifts from that
 * version, when a recorded peer range changes, or when the pinned version
 * stops satisfying that range. A newer release inside an unchanged peer
 * range is not itself a failure: moving the pin waits on compatibility tests.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");
export const REPORT_PATH = join(HERE, "dependency-ceilings.json");

const FIELDS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/;
const ALTERNATIVE = /^(?:\^)?\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/;

function unquote(value) {
  const text = value.trim();
  if (
    (text.startsWith("'") && text.endsWith("'") && text.length >= 2) ||
    (text.startsWith('"') && text.endsWith('"') && text.length >= 2)
  ) {
    return text.slice(1, -1);
  }
  return text;
}

/** The pnpm lockfile section whose header is `name:` and whose body is indented. */
export function extractSection(text, name) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line === `${name}:`);
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^[A-Za-z0-9_]+:/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function indent2(line) {
  return line.startsWith("  ") && !line.startsWith("   ");
}

function indent4(line) {
  return line.startsWith("    ") && !line.startsWith("     ");
}

function indent6(line) {
  return line.startsWith("      ") && !line.startsWith("       ");
}

/** specifier and version a lockfile importer records for one dependency. */
export function readImporterDependency(section, importer, name, field) {
  const lines = section.split("\n");
  let inImporter = false;
  let inDeps = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (indent2(line)) {
      inImporter = unquote(line.trim().replace(/:$/, "")) === importer;
      inDeps = false;
      continue;
    }
    if (!inImporter) continue;
    if (indent4(line)) {
      const key = unquote(line.trim().replace(/:$/, ""));
      inDeps = key === field;
      continue;
    }
    if (!inDeps || !indent6(line)) continue;
    if (unquote(line.trim().replace(/:$/, "")) !== name) continue;
    let specifier = null;
    let version = null;
    for (let inner = index + 1; inner < lines.length; inner += 1) {
      const row = lines[inner];
      if (!row.startsWith("        ")) break;
      const spec = /^\s+specifier:\s*(.*)$/.exec(row);
      const ver = /^\s+version:\s*(.*)$/.exec(row);
      if (spec) specifier = unquote(spec[1]);
      if (ver) version = unquote(ver[1]);
    }
    return { specifier, version };
  }
  return null;
}

/** Peer range and optional flag from the lockfile `packages:` entry, not a snapshot. */
export function readPackagePeer(section, lockKey, peerName) {
  const lines = section.split("\n");
  const headers = new Set([`  '${lockKey}':`, `  "${lockKey}":`, `  ${lockKey}:`]);
  const start = lines.findIndex((line) => headers.has(line));
  if (start < 0) return null;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (indent2(lines[index])) {
      end = index;
      break;
    }
  }
  let mode = null;
  let range = null;
  let optional = false;
  let inMetaPeer = false;
  for (const line of lines.slice(start + 1, end)) {
    if (indent4(line)) {
      const key = line.trim().replace(/:$/, "");
      mode = key === "peerDependencies" || key === "peerDependenciesMeta" ? key : null;
      inMetaPeer = false;
      continue;
    }
    if (mode === "peerDependencies" && indent6(line)) {
      const match = /^\s+([^:]+):\s*(.*)$/.exec(line);
      if (match && unquote(match[1].trim()) === peerName) range = unquote(match[2].trim());
      continue;
    }
    if (mode === "peerDependenciesMeta" && indent6(line)) {
      inMetaPeer = unquote(line.trim().replace(/:$/, "")) === peerName;
      continue;
    }
    if (mode === "peerDependenciesMeta" && inMetaPeer && /^\s+optional:\s*true\s*$/.test(line)) {
      optional = true;
    }
  }
  if (range === null) return { missingPeer: true };
  return { range, optional };
}

export function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.]+))?$/.exec(version);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] ?? null,
  };
}

function compareVersions(left, right) {
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  if (left.patch !== right.patch) return left.patch - right.patch;
  if (left.pre === right.pre) return 0;
  if (left.pre === null) return 1;
  if (right.pre === null) return -1;
  return left.pre < right.pre ? -1 : left.pre > right.pre ? 1 : 0;
}

/** True when every alternative is an exact version or a caret this check can evaluate. */
export function supportedRange(range) {
  const parts = range
    .split("||")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 && parts.every((part) => ALTERNATIVE.test(part));
}

function satisfiesPart(version, part) {
  if (!part.startsWith("^")) return version === part;
  const base = parseVersion(part.slice(1));
  const parsed = parseVersion(version);
  if (!base || !parsed || base.major === 0) return false;
  if (compareVersions(parsed, base) < 0) return false;
  return parsed.major === base.major;
}

/** Caret and exact alternatives joined by `||`. Anything else does not match. */
export function satisfiesRange(version, range) {
  if (!supportedRange(range)) return false;
  return range
    .split("||")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => satisfiesPart(version, part));
}

function resolvedVersion(versionField) {
  const paren = versionField.indexOf("(");
  return paren === -1 ? versionField : versionField.slice(0, paren);
}

export function workspaceGlobs(yaml) {
  const globs = [];
  let inPackages = false;
  for (const line of yaml.split("\n")) {
    if (!inPackages) {
      if (line === "packages:") inPackages = true;
      continue;
    }
    if (/^\S/.test(line)) break;
    const match = /^\s+-\s+["']([^"']+)["']\s*$/.exec(line);
    if (match) globs.push(match[1]);
  }
  return globs;
}

export function listWorkspaceManifests(root = ROOT) {
  const yaml = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
  const manifests = ["package.json"];
  for (const glob of workspaceGlobs(yaml)) {
    if (glob.endsWith("/*")) {
      const dir = join(root, glob.slice(0, -2));
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        if (!name.isDirectory()) continue;
        const rel = `${glob.slice(0, -2)}/${name.name}/package.json`;
        if (existsSync(join(root, rel))) manifests.push(rel);
      }
      continue;
    }
    const rel = `${glob}/package.json`;
    if (existsSync(join(root, rel))) manifests.push(rel);
  }
  return manifests;
}

function declarationKey(manifest, field) {
  return `${manifest} ${field}`;
}

function importerFor(manifest) {
  if (manifest === "package.json") return ".";
  return manifest.slice(0, -"/package.json".length);
}

/**
 * Problems in a ceiling report. `manifests` maps repo-relative package.json
 * paths to parsed manifests. `manifestPaths` is every workspace manifest.
 */
export function ceilingProblems({ report, manifests, lockText, manifestPaths }) {
  const problems = [];
  if (!report || typeof report !== "object" || !Array.isArray(report.ceilings)) {
    return ["dependency-ceilings.json must contain a ceilings array"];
  }
  if (report.ceilings.length === 0) {
    return ["dependency-ceilings.json records no ceilings"];
  }

  const importers = extractSection(lockText, "importers");
  const packages = extractSection(lockText, "packages");
  if (importers === "") problems.push("pnpm-lock.yaml has no importers section");
  if (packages === "") problems.push("pnpm-lock.yaml has no packages section");

  const byName = new Map();
  for (const ceiling of report.ceilings) {
    if (!ceiling || typeof ceiling.name !== "string" || ceiling.name.trim() === "") {
      problems.push("a ceiling is missing its package name");
      continue;
    }
    const name = ceiling.name;
    if (byName.has(name)) problems.push(`${name} is recorded twice`);
    byName.set(name, ceiling);
    if (typeof ceiling.reason !== "string" || ceiling.reason.trim() === "") {
      problems.push(`${name} is missing the reason the ceiling stays`);
    }
    if (typeof ceiling.version !== "string" || !EXACT.test(ceiling.version)) {
      problems.push(`${name} must pin an exact version`);
    }
    if (!Array.isArray(ceiling.declarations) || ceiling.declarations.length === 0) {
      problems.push(`${name} lists no manifest declarations`);
      continue;
    }

    const declared = new Set();
    for (const entry of ceiling.declarations) {
      const manifest = entry?.manifest;
      const field = entry?.field;
      if (
        typeof manifest !== "string" ||
        (manifest !== "package.json" && !manifest.endsWith("/package.json"))
      ) {
        problems.push(`${name} has a declaration that is not a package.json path`);
        continue;
      }
      if (manifest.includes("..")) {
        problems.push(`${name} declaration ${manifest} leaves the repository`);
        continue;
      }
      if (!FIELDS.includes(field)) {
        problems.push(`${name} declaration ${manifest} uses an unknown field`);
        continue;
      }
      const key = declarationKey(manifest, field);
      if (declared.has(key)) problems.push(`${name} lists ${manifest} ${field} twice`);
      declared.add(key);
      const body = manifests[manifest];
      if (!body) {
        problems.push(`${name} lists ${manifest}, which is not a workspace manifest`);
        continue;
      }
      const selected = body[field]?.[name];
      if (selected === undefined) {
        problems.push(`${name} lists ${manifest} ${field}, which does not depend on it`);
        continue;
      }
      if (selected !== ceiling.version) {
        problems.push(
          `${name} is ${selected} in ${manifest} ${field}; the ceiling is ${ceiling.version}`,
        );
      }
      const importer = importerFor(manifest);
      const locked = readImporterDependency(importers, importer, name, field);
      if (!locked) {
        problems.push(`lockfile importer ${importer} does not record ${name}`);
        continue;
      }
      if (locked.specifier !== ceiling.version) {
        problems.push(
          `lockfile importer ${importer} specifier for ${name} is ${locked.specifier}; the ceiling is ${ceiling.version}`,
        );
      }
      if (locked.version === null || resolvedVersion(locked.version) !== ceiling.version) {
        problems.push(
          `lockfile importer ${importer} resolves ${name} to ${locked.version}; the ceiling is ${ceiling.version}`,
        );
      }
    }

    const peers = ceiling.peers ?? [];
    if (!Array.isArray(peers)) {
      problems.push(`${name} peers must be a list`);
      continue;
    }
    for (const peer of peers) {
      const lockKey = peer?.lockKey;
      const range = peer?.range;
      if (typeof lockKey !== "string" || lockKey.trim() === "") {
        problems.push(`${name} has a peer with no lockfile package`);
        continue;
      }
      if (typeof range !== "string" || !supportedRange(range)) {
        problems.push(`${name} peer ${lockKey} has a range this check cannot evaluate`);
        continue;
      }
      if (typeof ceiling.version === "string" && !satisfiesRange(ceiling.version, range)) {
        problems.push(
          `${name}@${ceiling.version} does not satisfy recorded peer ${lockKey} (${range})`,
        );
      }
      const rejects = peer.rejects ?? [];
      if (
        !Array.isArray(rejects) ||
        rejects.some((version) => typeof version !== "string" || !EXACT.test(version))
      ) {
        problems.push(`${name} peer ${lockKey} rejects entries must be exact versions`);
      } else {
        for (const blocked of rejects) {
          if (satisfiesRange(blocked, range)) {
            problems.push(
              `${name} peer ${lockKey} (${range}) accepts ${blocked}, which the ceiling rejects`,
            );
          }
        }
      }
      const found = readPackagePeer(packages, lockKey, name);
      if (!found) {
        problems.push(`lockfile packages has no ${lockKey}`);
        continue;
      }
      if (found.missingPeer) {
        problems.push(`lockfile ${lockKey} does not peer ${name}`);
        continue;
      }
      if (found.range !== range) {
        problems.push(
          `lockfile ${lockKey} peers ${name} at ${found.range}; the record has ${range}. Recheck the ceiling before changing it.`,
        );
      }
      const optional = peer.optional === true;
      if (found.optional !== optional) {
        problems.push(
          `lockfile ${lockKey} peers ${name} optional=${found.optional}; the record has optional=${optional}`,
        );
      }
    }
  }

  for (const [name, ceiling] of byName) {
    const declared = new Set(
      (ceiling.declarations ?? [])
        .filter((entry) => typeof entry?.manifest === "string" && typeof entry?.field === "string")
        .map((entry) => declarationKey(entry.manifest, entry.field)),
    );
    for (const manifest of manifestPaths) {
      const body = manifests[manifest];
      if (!body) continue;
      for (const field of FIELDS) {
        if (body[field]?.[name] === undefined) continue;
        if (!declared.has(declarationKey(manifest, field))) {
          problems.push(
            `${manifest} ${field} declares ${name}, which the ceiling record does not list`,
          );
        }
      }
    }
  }
  return problems;
}

export function checkDependencyCeilings(root = ROOT) {
  const report = JSON.parse(
    readFileSync(join(root, "scripts", "dependency-ceilings.json"), "utf8"),
  );
  const lockText = readFileSync(join(root, "pnpm-lock.yaml"), "utf8");
  const manifestPaths = listWorkspaceManifests(root);
  const manifests = {};
  for (const manifest of manifestPaths) {
    manifests[manifest] = JSON.parse(readFileSync(join(root, manifest), "utf8"));
  }
  const problems = ceilingProblems({ report, manifests, lockText, manifestPaths });
  if (problems.length > 0) {
    console.error("Dependency ceilings drifted:");
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }
  console.log(`dependency ceilings: ${report.ceilings.length} pins held.`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkDependencyCeilings());
}

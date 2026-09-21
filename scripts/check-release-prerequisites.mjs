#!/usr/bin/env node

/**
 * What must be true of the registry before a package may be published.
 *
 * Until #599 an entry passed on `"satisfied": true` plus any non-empty
 * `evidence` string. The string was never parsed and never re-run, so twelve
 * hand-written sentences were the whole gate: the guard passed with the gate
 * ladder red and would have passed with the registry rows false. A stored
 * claim is not evidence.
 *
 * Now every prerequisite is either
 *   - `verify`: re-derived here, from a live read of the registry, on every
 *     run; or
 *   - `attested`: something with no public read (npm's 2FA-gated settings),
 *     carried as an attestation that names who said it and when, and prints as
 *     one.
 *
 * A read that cannot be taken is a failure, not a pass: a gate nobody could
 * check is not a gate that was checked.
 *
 * `attested` is not a shape any row may take. The #599 review found that a
 * one-line edit could downgrade any of the live-read rows to a sentence with
 * four field names instead of two, at any date. So the pairs that may be
 * attested are listed below, everything else must re-derive, and an attestation
 * expires: a claim nobody has re-taken in a season is not current evidence.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { pendingChangesetPackages, releasablePackages } from "./release-candidates.mjs";

const root = process.cwd();
const configPath = path.join(root, "scripts", "release-prerequisites.json");
const registry = (process.env.npm_config_registry ?? "https://registry.npmjs.org").replace(
  /\/+$/,
  "",
);
const PROVENANCE_PREDICATE = "https://slsa.dev/provenance/v1";
const ATTESTATION_FIELDS = ["by", "at", "why", "says"];

/**
 * The prerequisites that may be attested instead of re-derived, by name.
 *
 * Exactly one today: kumo's only tarball is the pre-trusted-publishing
 * `0.0.0-bootstrap.0` reservation, so it carries no provenance to read. From
 * kumo's first OIDC publish, `npm-provenance` replaces this row and the list
 * goes empty.
 */
const ATTESTABLE = new Map([["@proyecto-viviana/kumo", new Set(["trusted-publisher-registered"])]]);

/** How long an attestation stands before it has to be re-taken. */
const ATTESTATION_MAX_AGE_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function fail(message) {
  console.error(`release prerequisites — FAIL: ${message}`);
  process.exitCode = 1;
}

function readJson(file, description) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${description} is unreadable or invalid JSON (${file}): ${error.message}`);
    return null;
  }
}

/** One live read per package, shared by that package's prerequisites. */
const packuments = new Map();

function packument(name) {
  if (!packuments.has(name)) packuments.set(name, fetchPackument(name));
  return packuments.get(name);
}

async function fetchPackument(name) {
  const url = `${registry}/${name.replace("/", "%2f")}`;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return { ok: false, url, why: `${url} → ${response.status} ${response.statusText}` };
    }
    return { ok: true, url, body: await response.json() };
  } catch (error) {
    return { ok: false, url, why: `${url} → ${error.message}` };
  }
}

const verifiers = {
  /** The name exists on the registry we publish to, and serves a `latest`. */
  async "npm-registered"(name) {
    const read = await packument(name);
    if (!read.ok) return { ok: false, detail: read.why };
    const latest = read.body?.["dist-tags"]?.latest;
    if (read.body?.name !== name) {
      return { ok: false, detail: `${read.url} → name=${read.body?.name ?? "absent"}` };
    }
    if (typeof latest !== "string" || latest.length === 0) {
      return { ok: false, detail: `${read.url} → no dist-tags.latest` };
    }
    return { ok: true, detail: `${read.url} → name=${name} dist-tags.latest=${latest}` };
  },

  /**
   * The published tarball carries SLSA provenance.
   *
   * This is the registry's own record that the publish came from the workflow
   * over OIDC rather than from a token on a laptop, and unlike npm's trusted
   * publisher settings it is a public read anyone can re-take.
   */
  async "npm-provenance"(name) {
    const read = await packument(name);
    if (!read.ok) return { ok: false, detail: read.why };
    const latest = read.body?.["dist-tags"]?.latest;
    const attestations = read.body?.versions?.[latest]?.dist?.attestations;
    const predicate = attestations?.provenance?.predicateType;
    if (predicate !== PROVENANCE_PREDICATE) {
      return {
        ok: false,
        detail: `${read.url} → ${name}@${latest ?? "?"} dist.attestations.provenance=${
          predicate ?? "absent"
        }, expected ${PROVENANCE_PREDICATE}`,
      };
    }
    return {
      ok: true,
      detail: `${read.url} → ${name}@${latest} provenance=${predicate}, attestations=${attestations.url}`,
    };
  },
};

async function checkPrerequisite(entry, version, prerequisite) {
  const id = prerequisite?.id ?? "unnamed-prerequisite";
  const subject = `${entry.name}@${version}`;

  if (!prerequisite || typeof prerequisite.id !== "string") {
    fail(`${subject} has a prerequisite with no id`);
    return;
  }

  // The shape that made the gate a formality is refused by name, so it cannot
  // come back one entry at a time (#599).
  if ("satisfied" in prerequisite || "evidence" in prerequisite) {
    fail(
      `${subject} ${id} still carries satisfied/evidence. A stored sentence is a claim, not ` +
        "evidence: give it a `verify` block this guard re-runs, or an `attested` block naming " +
        "who attested it and when (#599).",
    );
    return;
  }

  const hasVerify = prerequisite.verify != null;
  const hasAttested = prerequisite.attested != null;
  if (hasVerify === hasAttested) {
    fail(`${subject} ${id} must define exactly one of verify or attested`);
    return;
  }

  if (hasAttested) {
    if (!ATTESTABLE.get(entry.name)?.has(id)) {
      const listed =
        [...ATTESTABLE]
          .flatMap(([name, ids]) => [...ids].map((each) => `${name}/${each}`))
          .join(", ") || "none";
      fail(
        `${subject} ${id} may not be attested: it has a public read, so it must carry a verify ` +
          `block this guard re-runs. Attestation is permitted for ${listed} and nothing else (#599).`,
      );
      return;
    }
    const missing = ATTESTATION_FIELDS.filter(
      (field) =>
        typeof prerequisite.attested[field] !== "string" ||
        prerequisite.attested[field].trim().length === 0,
    );
    if (missing.length > 0) {
      fail(`${subject} ${id} is an attestation missing ${missing.join(", ")}`);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prerequisite.attested.at)) {
      fail(`${subject} ${id} attestation date must be YYYY-MM-DD, not ${prerequisite.attested.at}`);
      return;
    }
    const ageDays = Math.floor(
      (Date.now() - Date.parse(`${prerequisite.attested.at}T00:00:00Z`)) / DAY_MS,
    );
    if (Number.isNaN(ageDays)) {
      fail(`${subject} ${id} attestation date is not a date: ${prerequisite.attested.at}`);
      return;
    }
    if (ageDays < 0) {
      fail(`${subject} ${id} attestation is dated ${prerequisite.attested.at}, in the future`);
      return;
    }
    if (ageDays > ATTESTATION_MAX_AGE_DAYS) {
      fail(
        `${subject} ${id} attestation was taken ${prerequisite.attested.at}, ${ageDays} days ago, ` +
          `and attestations stand for ${ATTESTATION_MAX_AGE_DAYS} days. Re-take it and date it, ` +
          "or replace it with a verify block.",
      );
      return;
    }
    console.log(
      `ATTESTED: ${subject} ${id} — ${prerequisite.attested.by}, ${prerequisite.attested.at}: ` +
        `${prerequisite.attested.why} (${prerequisite.attested.says}) [${ageDays} days old; ` +
        `an attestation stands for ${ATTESTATION_MAX_AGE_DAYS}]`,
    );
    return;
  }

  const verifier = verifiers[prerequisite.verify.kind];
  if (!verifier) {
    fail(
      `${subject} ${id} names verify kind ${prerequisite.verify.kind ?? "none"}; known kinds are ` +
        Object.keys(verifiers).join(", "),
    );
    return;
  }

  const result = await verifier(entry.name);
  if (!result.ok) {
    fail(`${subject} ${id} could not be re-derived: ${result.detail}`);
    return;
  }
  console.log(`VERIFIED: ${subject} ${id} — ${result.detail}`);
}

const config = readJson(configPath, "release prerequisite configuration");

if (!config) {
  process.exit();
}

if (!Array.isArray(config.packages)) {
  fail(`${configPath} must contain a packages array`);
  process.exit();
}

const candidates = releasablePackages(root);
const pending = pendingChangesetPackages(root);
const listed = new Set(config.packages.map((entry) => entry?.name));

// The guard's subjects come from the tree, never from the list: a candidate the
// list forgets is exactly the release nobody checked.
for (const candidate of candidates) {
  if (listed.has(candidate.name)) continue;
  // A workspace version of 0.0.0 has never been published; the entry loop skips it too.
  if (candidate.version === "0.0.0") continue;
  fail(
    `${candidate.name}@${candidate.version} is a publish candidate with no entry in ` +
      `scripts/release-prerequisites.json — record its prerequisites and the evidence for each.`,
  );
}

for (const entry of config.packages) {
  if (
    !entry ||
    typeof entry.name !== "string" ||
    typeof entry.manifest !== "string" ||
    !Array.isArray(entry.prerequisites)
  ) {
    fail("every package entry must define name, manifest, and prerequisites");
    continue;
  }

  const manifestPath = path.join(root, entry.manifest);
  const manifest = readJson(manifestPath, `${entry.name} manifest`);
  if (!manifest) continue;

  if (manifest.name !== entry.name) {
    fail(`${entry.manifest} declares ${manifest.name ?? "no name"}, expected ${entry.name}`);
    continue;
  }

  if (manifest.version === "0.0.0") {
    if (pending.has(entry.name) && candidates.some((pkg) => pkg.name === entry.name)) {
      fail(
        `${entry.name}@0.0.0 is not a publish candidate, but pending changesets name it. ` +
          "Versioning would bump it off 0.0.0 and publish a fake first release. " +
          "Remove it from those changesets, or add it to .changeset/config.json ignore " +
          "until the workspace version is a real release.",
      );
      continue;
    }
    console.log(`SKIP: ${entry.name}@0.0.0 is not a publish candidate.`);
    continue;
  }

  if (typeof manifest.version !== "string" || manifest.version.length === 0) {
    fail(`${entry.name} has no valid version`);
    continue;
  }

  if (entry.prerequisites.length === 0) {
    fail(`${entry.name}@${manifest.version} has an empty prerequisite set`);
    continue;
  }

  for (const prerequisite of entry.prerequisites) {
    await checkPrerequisite(entry, manifest.version, prerequisite);
  }
}

if (!process.exitCode) {
  console.log("release prerequisites — PASS");
}

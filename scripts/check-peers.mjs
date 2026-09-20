#!/usr/bin/env node

/**
 * Fails when the workspace's unmet `solid-js` (or any other) peer ranges are not
 * exactly the set we have written down and explained.
 *
 * `pnpm peers check` has been red on main since the Solid 2 port, because
 * TanStack's own `2.0.0-rc.8` line still depends on Solid 1 packages:
 * `@solid-devtools/*` and eleven `@solid-primitives/*` under
 * `@tanstack/solid-router`, and `vite-plugin-solid`, `babel-preset-solid` and
 * `solid-refresh` under `@tanstack/solid-start`. No bump of ours satisfies
 * them. The guard that ran it was `peers && audit && audit`, so a red peers
 * check meant neither audit ran — the check that could not pass silenced the
 * two that could.
 *
 * `peerDependencyRules.allowAny: solid-js` would have cleared it, and blinded
 * the same check for our own packages. So the list is a ratchet instead:
 * `expected-unmet-peers.json` names every entry we tolerate with the root
 * dependency that pulls it and why. Anything unlisted fails, and a listed
 * entry that no longer occurs fails too — the list can only shrink, and it
 * shrinks the day TanStack ships a Solid 2 line.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const EXPECTED_PATH = join(HERE, "expected-unmet-peers.json");

/** The identity of an unmet peer: which range, declared by whom, pulled in by what. */
export function peerKey(entry) {
  return [
    entry.workspace,
    entry.peer,
    entry.wantedRange,
    entry.declaredBy,
    entry.rootDependency,
  ].join(" | ");
}

/**
 * Flatten `pnpm peers check --json` into one row per unmet peer.
 *
 * The report is keyed by workspace directory; `bad` holds a peer resolved to a
 * version outside the wanted range and `missing` one not resolved at all. Each
 * entry carries the dependency chain that reaches the declaring package, so the
 * last parent declares the peer and the first is the root dependency of ours
 * that drags it in — the only one we could ever act on.
 */
export function collectUnmetPeers(report) {
  const rows = [];
  for (const [workspace, result] of Object.entries(report ?? {})) {
    for (const kind of ["bad", "missing"]) {
      for (const [peer, entries] of Object.entries(result?.[kind] ?? {})) {
        for (const entry of entries ?? []) {
          const parents = entry.parents ?? [];
          const declaring = parents.at(-1);
          const root = parents[0];
          rows.push({
            workspace,
            kind,
            peer,
            wantedRange: entry.wantedRange ?? "",
            declaredBy: declaring ? `${declaring.name}@${declaring.version}` : "",
            rootDependency: root ? `${root.name}@${root.version}` : "",
            foundVersion: entry.foundVersion ?? null,
          });
        }
      }
    }
  }
  return rows;
}

/**
 * Both failure directions at once: an unmet peer nobody wrote down, and a
 * written-down entry that no longer happens.
 */
export function diffExpectedPeers(actual, expected) {
  const actualKeys = new Set(actual.map(peerKey));
  const expectedKeys = new Set(expected.map(peerKey));

  return {
    unexpected: actual.filter((row) => !expectedKeys.has(peerKey(row))),
    stale: expected.filter((row) => !actualKeys.has(peerKey(row))),
  };
}

export function loadExpectedPeers(path = EXPECTED_PATH) {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return parsed.entries ?? [];
}

/** `pnpm peers check --json` exits non-zero whenever anything is unmet, so its status is not the answer — its report is. */
export function readPeersReport() {
  try {
    return JSON.parse(
      execFileSync("vp", ["exec", "pnpm", "peers", "check", "--json"], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      }),
    );
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.trim().startsWith("{")) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

export function checkPeers() {
  const actual = collectUnmetPeers(readPeersReport());
  const { unexpected, stale } = diffExpectedPeers(actual, loadExpectedPeers());

  for (const row of unexpected) {
    console.error(
      `unexpected unmet peer: ${row.peer}@${row.wantedRange} required by ${row.declaredBy} ` +
        `(via ${row.rootDependency}, ${row.workspace}) — satisfy it, or add it to ` +
        `scripts/expected-unmet-peers.json with the reason it cannot be satisfied.`,
    );
  }
  for (const row of stale) {
    console.error(
      `stale allowlist entry: ${row.peer}@${row.wantedRange} required by ${row.declaredBy} ` +
        `(via ${row.rootDependency}, ${row.workspace}) is no longer unmet — delete the entry ` +
        `from scripts/expected-unmet-peers.json.`,
    );
  }

  const failed = unexpected.length + stale.length > 0;
  if (!failed) {
    console.log(`peers: ${actual.length} unmet peers, all of them expected and explained.`);
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkPeers());
}

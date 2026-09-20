#!/usr/bin/env node

/**
 * Fails when a workflow runs code it did not pin.
 *
 * Every `uses:` in `.github/workflows` is pinned to a commit SHA, because a tag
 * and a branch are both mutable and the release job holds `contents: write`,
 * `pull-requests: write` and an npm publish token. A toolchain the job installs
 * itself is the same exposure through a different door: `npm install -g
 * npm@^11.5.1` resolved to whatever the registry served that morning, fourteen
 * minors past the version anyone reviewed, inside that same job.
 *
 * So both are checked here: an action ref must be a 40-character SHA, and a
 * global install must name an exact version. Bump either deliberately.
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const WORKFLOW_DIR = join(HERE, "..", ".github", "workflows");

const USES = /^\s*(?:-\s*)?uses:\s*(\S+)/;
const GLOBAL_INSTALL = /npm\s+install\s+(?:-g|--global)\s+(\S+)/g;
const SHA = /^[0-9a-f]{40}$/;
const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

/** One problem per unpinned reference, named by file and line. */
export function findUnpinnedRefs(file, source) {
  const problems = [];
  source.split("\n").forEach((line, index) => {
    const at = `${file}:${index + 1}`;
    const uses = USES.exec(line);
    // A local action (`./.github/...`) is this repository's own tree, already pinned by the checkout.
    if (uses && !uses[1].startsWith("./")) {
      const ref = uses[1].split("@")[1];
      if (!ref || !SHA.test(ref)) {
        problems.push(
          `${at}: uses ${uses[1]} — pin the action to a commit SHA, with the tag in a trailing comment.`,
        );
      }
    }
    for (const install of line.matchAll(GLOBAL_INSTALL)) {
      const spec = install[1];
      const version = spec.slice(spec.lastIndexOf("@") + 1);
      if (!spec.includes("@", 1) || !EXACT.test(version)) {
        problems.push(
          `${at}: installs ${spec} globally — name an exact version, and bump it deliberately.`,
        );
      }
    }
  });
  return problems;
}

export function checkWorkflowPins(dir = WORKFLOW_DIR) {
  const files = readdirSync(dir).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
  const problems = files.flatMap((name) =>
    findUnpinnedRefs(join(".github/workflows", name), readFileSync(join(dir, name), "utf8")),
  );

  if (problems.length > 0) {
    console.error("Workflows run unpinned code:");
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }
  console.log(`workflow pins: ${files.length} workflows, every action and global install pinned.`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkWorkflowPins());
}

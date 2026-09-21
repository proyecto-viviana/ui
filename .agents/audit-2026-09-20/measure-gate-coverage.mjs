// Receipt for #568. Read-only; writes nothing, runs no gate.
//
// Answers one question: which blocking gate scripts of
// `.github/workflows/certification-gates.yml` are reachable from
// `ci:release-readiness`?
//
// Two things the first measurement of #568 got wrong, and this does not:
//
//  1. It reads `continue-on-error` from the whole step block, so an advisory
//     step cannot be miscounted as blocking by a fixed look-back window.
//  2. It follows the chain's legs *transitively*. `check` is
//     `vp check && vp run typecheck`, so matching leg names literally reports
//     root `typecheck` as uncovered when the chain does run it.
//
// Run from the repo root: node .agents/audit-2026-09-20/measure-gate-coverage.mjs

import { readFileSync } from "node:fs";

const WORKFLOW = ".github/workflows/certification-gates.yml";
const CHAIN = "ci:release-readiness";

const lines = readFileSync(WORKFLOW, "utf8").split("\n");

// Split into step blocks on "- name:" so each block carries its own flags.
const blocks = [];
let cur = null;
for (const line of lines) {
  if (/^\s*-\s+name:/.test(line)) {
    if (cur) blocks.push(cur);
    cur = [line];
  } else if (cur) cur.push(line);
}
if (cur) blocks.push(cur);

const blocking = [];
const advisory = [];
for (const block of blocks) {
  const text = block.join("\n");
  const found = [...text.matchAll(/pnpm run ([a-zA-Z0-9:_-]+)/g)].map((m) => m[1]);
  if (!found.length) continue;
  const isAdvisory = /continue-on-error:\s*true/.test(text);
  for (const script of found) (isAdvisory ? advisory : blocking).push(script);
}
const distinctBlocking = [...new Set(blocking)];

const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
const legs = (cmd) => [...cmd.matchAll(/vp run ([^\s&|]+)/g)].map((m) => m[1]);

// Transitive closure of the chain. A package-scoped leg (pkg#script) has no
// entry in the root scripts, so it is recorded and not recursed into.
const reachable = new Set();
(function walk(name) {
  if (reachable.has(name)) return;
  reachable.add(name);
  const cmd = scripts[name];
  if (!cmd) return;
  for (const leg of legs(cmd)) walk(leg);
})(CHAIN);
reachable.delete(CHAIN);

const direct = new Set(legs(scripts[CHAIN]));
const uncovered = distinctBlocking.filter((s) => !reachable.has(s)).sort();
const transitiveOnly = distinctBlocking.filter((s) => reachable.has(s) && !direct.has(s)).sort();

console.log(`chain legs, named:      ${direct.size}`);
console.log(`chain legs, transitive: ${reachable.size}`);
console.log(`gate steps running an npm script: ${blocking.length + advisory.length}`);
console.log(`  blocking: ${blocking.length} occurrences / ${distinctBlocking.length} distinct`);
console.log(`  advisory: ${advisory.length} -> ${advisory.join(", ") || "(none)"}`);
console.log("");
console.log(`blocking gate scripts NOT reachable from ${CHAIN}: ${uncovered.length}`);
for (const s of uncovered) console.log(`  ${s}`);
console.log("");
console.log(`run by the chain but not as a named leg: ${transitiveOnly.join(", ") || "(none)"}`);

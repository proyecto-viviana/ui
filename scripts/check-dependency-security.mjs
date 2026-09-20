#!/usr/bin/env node

/**
 * `guard:dependency-security`: the peers allowlist and both audits, every run.
 *
 * It used to be `pnpm peers check && vp pm audit && vp pm audit --prod`. `&&`
 * made the weakest link the gate: the peers check has been red since the Solid
 * 2 port, so neither audit had run on main. Each step runs here whatever the
 * one before it did, and the guard fails if any of the three did.
 */

import { execFileSync } from "node:child_process";
import { checkPeers } from "./check-peers.mjs";

function run(label, command, args) {
  console.log(`\n=== ${label}: ${command} ${args.join(" ")}`);
  try {
    execFileSync(command, args, { stdio: "inherit" });
    return 0;
  } catch (error) {
    return typeof error.status === "number" ? error.status : 1;
  }
}

const results = [
  ["peers", checkPeers()],
  ["audit (high)", run("audit (high)", "vp", ["pm", "audit", "--", "--audit-level=high"])],
  [
    "audit (prod, low)",
    run("audit (prod, low)", "vp", ["pm", "audit", "--", "--prod", "--audit-level=low"]),
  ],
];

const failed = results.filter(([, status]) => status !== 0);
if (failed.length > 0) {
  console.error(`\nguard:dependency-security failed: ${failed.map(([name]) => name).join(", ")}`);
  process.exit(1);
}
console.log("\nguard:dependency-security: peers allowlist and both audits passed.");

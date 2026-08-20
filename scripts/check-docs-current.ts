/// <reference types="node" />

import { collectDocs } from "../apps/web/src/app/admin/server/data";
import { checkDocsOrganization } from "./docs-organization";
import { checkGeneratedWorkViews } from "./generate-work-views";

// docs:check — gate for the .claude/current spine. Every current doc must carry
// the status header, the ticket board must conform to the shared scheme, and
// generated work views must match that board. The same validator drives the
// /admin Home problems strip; see .claude/current/admin-dashboard.md.

const root = process.cwd();
const failures: string[] = [];
function fail(message: string): void {
  failures.push(message);
}

for (const problem of checkDocsOrganization(root)) fail(problem);

// Ticket-board and stable-document integrity.
for (const problem of collectDocs().problems) {
  fail(`Tracking integrity: ${problem.doc}: ${problem.message}`);
}

for (const problem of checkGeneratedWorkViews()) fail(problem);

if (failures.length > 0) {
  console.error("docs:check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("docs:check passed");

#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { sourceAttributionHeader } from "./package-attribution-banner.mjs";

const ROOT = process.cwd();
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "viviana-ci-guards-"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function combined(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function runSync(script, cwd, env = {}, args = []) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function run(script, cwd, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts", script)], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function json(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

// A workflow is a map of jobs, and the same step text repeats across them:
// `run: pnpm run build` is a step of `certification-gates` AND of
// `comparison-build`. An ordering assertion built from whole-file `indexOf`
// offsets therefore compares steps that may live in different jobs, and
// re-anchors silently on the other job when one of them is deleted (#589).
// Every workflow-shape assertion below reads one job's own block.
function jobBlock(workflow, job) {
  const start = workflow.indexOf(`\n  ${job}:\n`);
  assert(start >= 0, `the workflow has no \`${job}\` job`);
  const body = workflow.slice(start + 1);
  const next = body.search(/\n {2}[A-Za-z0-9_-]+:\n/);
  return next >= 0 ? body.slice(0, next + 1) : body;
}

// `concurrency:` is legal on the workflow AND on any job, so one file can hold
// several blocks. Reading the file's first `cancel-in-progress` and pairing it
// with the file's first `group` checks one block against another block's key
// and walks past every later one, which is exactly the drift this contract
// exists to catch (#589). Each block is read whole, on its own.
function concurrencyBlocks(workflow) {
  const lines = workflow.split("\n");
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const header = /^( *)concurrency:(.*)$/.exec(lines[index]);
    if (!header) continue;
    const indent = header[1].length;
    const inline = header[2].trim();
    if (inline.length > 0) {
      // The scalar spelling is a group with the default `cancel-in-progress: false`.
      blocks.push({ line: index + 1, group: inline, cancel: "false" });
      continue;
    }
    let group = "";
    let cancel = "false";
    for (let child = index + 1; child < lines.length; child += 1) {
      const line = lines[child];
      if (line.trim() === "") continue;
      if (line.search(/\S/) <= indent) break;
      if (/^\s*#/.test(line)) continue;
      const groupMatch = /^\s*group: *(.+?) *$/.exec(line);
      if (groupMatch) group = groupMatch[1];
      const cancelMatch = /^\s*cancel-in-progress: *(.+?) *$/.exec(line);
      if (cancelMatch) cancel = cancelMatch[1];
    }
    blocks.push({ line: index + 1, group, cancel });
  }
  return blocks;
}

function triggersPushToMain(workflow) {
  const lines = workflow.split("\n");
  const start = lines.findIndex((line) => /^on:\s*$/.test(line));
  if (start < 0) return false;
  const triggers = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "") continue;
    if (lines[index].search(/\S/) === 0) break;
    triggers.push(lines[index]);
  }
  const pushAt = triggers.findIndex((line) => /^ {2}push:/.test(line));
  if (pushAt < 0) return false;
  const pushBody = [];
  for (let index = pushAt + 1; index < triggers.length; index += 1) {
    if (/^ {2}\S/.test(triggers[index])) break;
    pushBody.push(triggers[index]);
  }
  const branchesAt = pushBody.findIndex((line) => /^ {4}branches:/.test(line));
  // `push:` with no branch filter fires on main too.
  if (branchesAt < 0) return true;
  const flow = /^ {4}branches: *\[(.*)\] *$/.exec(pushBody[branchesAt])?.[1];
  const entries = [];
  if (flow != null) entries.push(...flow.split(","));
  else
    for (let index = branchesAt + 1; index < pushBody.length; index += 1) {
      if (!/^ {6}- /.test(pushBody[index])) break;
      entries.push(pushBody[index].replace(/^ {6}- */, ""));
    }
  return entries.map((entry) => entry.trim().replace(/^["']|["']$/g, "")).includes("main");
}

// `needs:` has three legal spellings — scalar, flow list, block list — so a
// legal reformat must not read as a dropped dependency.
function jobNeeds(jobText) {
  const scalar = /^ {4}needs: *([A-Za-z0-9_-]+) *$/m.exec(jobText)?.[1];
  if (scalar) return [scalar];
  const flow = /^ {4}needs: *\[(.+?)\] *$/m.exec(jobText)?.[1];
  const block = /^ {4}needs: *\n((?: {4,6}- .+\n)+)/m.exec(jobText)?.[1];
  return (flow?.split(",") ?? block?.match(/- .+/g) ?? []).map((entry) =>
    entry.replace(/^- /, "").trim(),
  );
}

function stepBlock(jobText, stepName) {
  const start = jobText.indexOf(`- name: ${stepName}\n`);
  assert(start >= 0, `the job has no \`${stepName}\` step`);
  const body = jobText.slice(start);
  const next = body.slice(1).search(/\n {6}- name: /);
  return next >= 0 ? body.slice(0, next + 1) : body;
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address !== "string", "mock GitHub server did not bind a port");
  return `http://127.0.0.1:${address.port}`;
}

try {
  const rootManifest = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const generatedIconGuard = rootManifest.scripts?.["guard:generated-icons"];
  assert(
    generatedIconGuard === "node scripts/generate-solid-spectrum-icons.mjs --check",
    "the generated-icon guard must call the icon generator in read-only check mode",
  );
  const releaseReadiness = rootManifest.scripts?.["ci:release-readiness"] ?? "";
  const generatedIconGuardIndex = releaseReadiness.indexOf("vp run guard:generated-icons");
  const releaseBuildIndex = releaseReadiness.indexOf("vp run build");
  assert(
    generatedIconGuardIndex >= 0 &&
      releaseBuildIndex >= 0 &&
      generatedIconGuardIndex < releaseBuildIndex,
    "release readiness must check generated icons before building packages",
  );

  const generatedIconSource = readFileSync(
    path.join(ROOT, "scripts", "generate-solid-spectrum-icons.mjs"),
    "utf8",
  );
  assert(
    generatedIconSource.includes("const generatedIconRoots = [solidIconRoot, vivianaIconRoot];"),
    "the icon generator must own both styled-package output trees",
  );
  assert(
    generatedIconSource.includes("readS2UiIconSizeStyle") &&
      generatedIconSource.includes("styles({ size })"),
    "the icon generator must copy S2 ui-icon token width/height maps onto each generated asset",
  );
  assert(
    generatedIconSource.includes('const checkOnly = args.includes("--check");') &&
      generatedIconSource.includes("if (checkOnly && (changed.length || extra.length))"),
    "the generated-icon guard must detect changed and unexpected output files",
  );
  console.log("PASS: release readiness checks both generated icon trees without writing them.");

  // The sourcemap contract can only be proved on built packages, so its guard
  // has to run after the build in the same chain — unwired, it proved nothing
  // while tooling.md claimed it held the pack-pass contract.
  const sourcemapGuardIndex = releaseReadiness.indexOf("vp run guard:package-sourcemaps");
  assert(
    sourcemapGuardIndex > releaseBuildIndex && releaseBuildIndex >= 0,
    "release readiness must run guard:package-sourcemaps after building packages",
  );
  console.log("PASS: release readiness proves the pack-pass sourcemap contract after the build.");

  // The unit chain used to run `vp test run packages scripts` and then name one
  // app file, so fifteen app test files were reachable from no workflow at all.
  // Discovery, not enumeration: the root config already includes the app tests,
  // and each app suite that needs its own config is run by that config.
  assert(
    rootManifest.scripts?.["test:run"] === "vp test run",
    "test:run must discover tests from the config, not filter them to named directories",
  );
  for (const script of [
    "vp run test:run",
    "vp run test:comparison-ssr",
    "vp run test:comparison-hydrate",
    "vp run test:web",
    "vp run comparison:test:journeys-driver",
  ]) {
    assert(
      releaseReadiness.includes(script),
      `release readiness must run ${script}; an app suite in no chain is a suite nobody runs`,
    );
  }
  console.log("PASS: release readiness runs every app unit suite by discovery.");

  // Every browser gate builds the tree it grades. `reuseExistingServer` makes
  // an interactive run cheap and a gate a lie: a stale preview server answers
  // every request and the specs never touch the build under test.
  assert(
    releaseReadiness.includes("vp run guard:gate-server-reuse"),
    "release readiness must run guard:gate-server-reuse; a gate that reuses a server grades nothing",
  );
  console.log("PASS: release readiness holds the no-reuse contract for the browser gates.");

  const changesetsWorkflow = readFileSync(
    path.join(ROOT, ".github", "workflows", "changesets-check.yml"),
    "utf8",
  );
  assert(
    /fetch-depth:\s*0/.test(changesetsWorkflow),
    "Changesets Check must acquire complete release history",
  );
  assert(
    !/git fetch[^\n]*--depth(?:=|\s)/.test(changesetsWorkflow),
    "Changesets Check must not truncate the full checkout with a later shallow fetch",
  );
  console.log("PASS: Changesets Check preserves complete release history.");

  // A push to `main` must end in a verdict. Work lands direct-to-main here, so
  // `cancel-in-progress: true` erased half of it: 54 of the last 200 main runs
  // of Certification Gates are `cancelled` — neither a green nor a recorded
  // red — and `check-release-evidence.mjs` treats a cancelled run at the
  // release sha as a hard block (#589).
  //
  // `cancel-in-progress: false` alone does not buy that verdict: a group holds
  // one *pending* run and "any existing pending job or workflow in the same
  // concurrency group will be canceled" when a newer one queues (GitHub
  // workflow syntax, `concurrency`). A run here outlasts the gap between
  // pushes, so a workflow that fires on a push to main must key its group by
  // sha there. Everywhere else the group stays per ref and still supersedes.
  const workflowsDir = path.join(ROOT, ".github", "workflows");
  const mainExempt = "${{ github.ref != 'refs/heads/main' }}";
  const shaKeyedOnMain = /github\.ref *== *'refs\/heads\/main' *&& *github\.sha/;
  let declaredBlocks = 0;
  let mainShaGroups = 0;
  for (const file of readdirSync(workflowsDir).sort()) {
    if (!/\.ya?ml$/.test(file)) continue;
    const text = readFileSync(path.join(workflowsDir, file), "utf8");
    const pushesToMain = triggersPushToMain(text);
    for (const block of concurrencyBlocks(text)) {
      declaredBlocks += 1;
      const where = `${file}:${block.line}`;
      assert(
        block.cancel === "false" || block.cancel === mainExempt,
        `${where}: a push to main must end in a verdict — cancel-in-progress must be \`false\` or \`${mainExempt}\`, found \`${block.cancel}\``,
      );
      assert(
        !block.group.includes("github.ref") || block.cancel === mainExempt,
        `${where}: a ref-keyed concurrency group must still cancel superseded runs on every ref but main — found \`${block.cancel}\``,
      );
      if (!pushesToMain) continue;
      assert(
        shaKeyedOnMain.test(block.group),
        `${where}: this workflow runs on a push to main, so its concurrency group must be keyed by sha there — one group per main ref leaves a single pending slot that the next push cancels, whatever cancel-in-progress says — found group \`${block.group}\``,
      );
      mainShaGroups += 1;
    }
  }
  assert(
    declaredBlocks >= 6,
    `expected the concurrency contract to cover every declared group, checked only ${declaredBlocks}`,
  );
  assert(
    mainShaGroups >= 3,
    `expected the three push-to-main workflows to key their groups by sha, found ${mainShaGroups}`,
  );
  console.log(
    `PASS: ${declaredBlocks} workflow concurrency blocks let a push to main reach a verdict (${mainShaGroups} keyed by sha on main).`,
  );

  const certificationWorkflow = readFileSync(
    path.join(ROOT, ".github", "workflows", "certification-gates.yml"),
    "utf8",
  );
  const gatesJob = jobBlock(certificationWorkflow, "certification-gates");
  const packageBuild = gatesJob.indexOf("run: pnpm run build\n");
  const jsxDeoptGuard = gatesJob.indexOf("run: pnpm run guard:jsx-deopt-size\n");
  assert(
    packageBuild >= 0 && jsxDeoptGuard >= 0 && packageBuild < jsxDeoptGuard,
    "Certification Gates must build package artifacts before measuring JSX deopt size",
  );
  console.log("PASS: Certification builds package evidence before JSX size checks.");

  // The inverse contract, since #566: the entry import budget measures the
  // source graph behind each published entry, never the emitted chunks, so it
  // needs no build. Proved at a dist-free `git archive` checkout (#587):
  // "entries measured: 5/5", exit 0. Running it after the build spends a
  // twelve-minute walk to learn a number that was available at checkout, so
  // both chains put it first.
  const entryImportBudget = gatesJob.indexOf("run: pnpm run guard:entry-import-budget\n");
  assert(
    packageBuild >= 0 && entryImportBudget >= 0 && entryImportBudget < packageBuild,
    "Certification Gates must measure the entry import budget before building packages",
  );
  const entryBudgetIndex = releaseReadiness.indexOf("vp run guard:entry-import-budget");
  assert(
    entryBudgetIndex >= 0 && releaseBuildIndex >= 0 && entryBudgetIndex < releaseBuildIndex,
    "release readiness must measure the entry import budget before building packages",
  );
  console.log("PASS: both chains measure the entry import budget before the build.");

  // #545: two module-scope `const icon = <svg…>` bindings emptied twenty of the
  // web app's 174 routes. Compiled for the server that JSX runs at module
  // evaluation with no owner, so on a process that has already rendered a page
  // the whole module throws and every route importing it serves an empty shell
  // with HTTP 200 — no test of the component sees it. guard:idiomatic-solid
  // carries the rule, so the gate must run the guard, the rule must be wired
  // into the scan rather than merely exported, and the scan must cover every
  // published package: all of them server-render at a consumer.
  const idiomaticSolidScript = rootManifest.scripts?.["guard:idiomatic-solid"] ?? "";
  assert(
    idiomaticSolidScript === "vp exec tsx scripts/check-idiomatic-solid.ts",
    `guard:idiomatic-solid must run scripts/check-idiomatic-solid.ts, found \`${idiomaticSolidScript}\``,
  );
  assert(
    gatesJob.includes("run: pnpm run guard:idiomatic-solid\n"),
    "Certification Gates must run guard:idiomatic-solid; an unwired guard grades nothing",
  );
  const idiomaticSolidSource = readFileSync(
    path.join(ROOT, "scripts", "check-idiomatic-solid.ts"),
    "utf8",
  );
  assert(
    idiomaticSolidSource.includes("export function findModuleScopeJsx(") &&
      idiomaticSolidSource.includes("for (const site of findModuleScopeJsx(text, rel))"),
    "check-idiomatic-solid must run findModuleScopeJsx over every scanned file, not only export it",
  );
  assert(
    /moduleJsxOffenders\.length > 0\)\s*\{\s*failed = true;/.test(idiomaticSolidSource),
    "a module-scope JSX site must fail guard:idiomatic-solid, not just print",
  );
  const publishedSrcPackages = readdirSync(path.join(ROOT, "packages"), { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(path.join(ROOT, "packages", entry.name, "src")),
    )
    .filter(
      (entry) =>
        !JSON.parse(readFileSync(path.join(ROOT, "packages", entry.name, "package.json"), "utf8"))
          .private,
    )
    .map((entry) => entry.name);
  assert(
    publishedSrcPackages.length >= 7,
    `expected the published packages to be discoverable, found ${publishedSrcPackages.length}`,
  );
  for (const name of publishedSrcPackages) {
    assert(
      idiomaticSolidSource.includes(`"packages/${name}/src"`),
      `check-idiomatic-solid must scan packages/${name}/src — a published package's module-scope JSX takes its consumer's server down`,
    );
  }
  console.log(
    `PASS: Certification Gates runs guard:idiomatic-solid, and its module-scope JSX rule scans all ${publishedSrcPackages.length} published source roots.`,
  );

  // A shard that exits 1 must render red. `continue-on-error` on the shard step
  // concluded all eight shard jobs `success` over an 88-failure suite, with the
  // exit code visible only in the annotations (#589). The blocking verdict is
  // still the merged report, so the matrix must not fail-fast, the blob reports
  // must upload from a failed shard, and the report job must run on a red one.
  const certifiedJob = jobBlock(certificationWorkflow, "certified");
  // Keys, not prose: the job comments name both of these.
  const certifiedKeys = certifiedJob.split("\n").filter((line) => !/^\s*#/.test(line));
  assert(
    !certifiedKeys.some((line) => /^ *continue-on-error:/.test(line)),
    "a certified shard that exits 1 must conclude red: `continue-on-error` makes eight failing shard jobs render green",
  );
  assert(
    certifiedKeys.some((line) => /^ *fail-fast: *false *$/.test(line)),
    "the certified matrix must keep `fail-fast: false`, or the first red shard cancels the other seven and the report loses their evidence",
  );
  // ...and a shard that fails only on waived cases must not. Playwright's exit
  // code knows nothing about `certified-waivers.json`, so without this gate a
  // fully waived suite concludes the run `failure` and blocks the release that
  // the waiver exists to permit — `check-release-evidence.mjs` reads the run
  // conclusion, not the merged report (#589).
  const shardStep = stepBlock(certifiedJob, "certified shard");
  assert(
    shardStep.includes("check-certified-shard.ts") && shardStep.includes("--exit-code"),
    "the certified shard must exit through `check-certified-shard.ts --exit-code`, or a waived failure renders the whole run red",
  );
  const shardUpload = stepBlock(certifiedJob, "Upload certified shard reports");
  assert(
    /^ *if: *(?:\$\{\{ *)?(?:always\(\)|!cancelled\(\))/m.test(shardUpload),
    "a red certified shard must still upload its blob report, or the merged report cannot count the failures that made it red",
  );
  const certifiedReportJob = jobBlock(certificationWorkflow, "certified-report");
  const reportCondition = /^ {4}if: *(.+?) *$/m.exec(certifiedReportJob)?.[1] ?? "";
  assert(
    reportCondition.includes("!cancelled()"),
    `the certified report must run when a shard is red and not when the run was cancelled (\`!cancelled()\`), found \`${reportCondition}\``,
  );
  const reportNeeds = jobNeeds(certifiedReportJob);
  assert(
    reportNeeds.includes("certified") && reportNeeds.includes("comparison-build"),
    `the certified report must wait for every shard before merging, found needs \`${reportNeeds.join(", ") || "none"}\``,
  );
  console.log("PASS: a failing certified shard renders red and still reaches the merged report.");

  // A waiver naming a ticket the board never had, or one whose recorded state
  // the board has moved past, waives *inside* the run: `evaluateCertifiedWaivers`
  // takes no board callback and `merge-certified-reports.ts` emits no
  // `ticket-missing`/`ticket-stale` — that was the deliberate trade #574 made to
  // keep the board out of a verdict the postcard speaks for. The only detector
  // left is this one step, so deleting or renaming it restores the pre-#574 hole
  // with every gate still green.
  const comparisonBuildJob = jobBlock(certificationWorkflow, "comparison-build");
  const waiverTicketsStep = stepBlock(comparisonBuildJob, "guard certified waiver tickets");
  assert(
    waiverTicketsStep.includes("comparison:guard:certified-waiver-tickets"),
    "the `guard certified waiver tickets` step must run `comparison:guard:certified-waiver-tickets`; nothing else reconciles a waiver against the board",
  );
  const waiverTicketsIndex = comparisonBuildJob.indexOf(
    "run: pnpm run comparison:guard:certified-waiver-tickets\n",
  );
  const comparisonBuildIndex = comparisonBuildJob.indexOf("run: pnpm run build\n");
  assert(
    waiverTicketsIndex >= 0 &&
      comparisonBuildIndex >= 0 &&
      waiverTicketsIndex < comparisonBuildIndex,
    "the board reconciliation must run before the build it gates, or an off-board waiver costs a full build before it is named",
  );
  const certifiedNeeds = jobNeeds(certifiedJob);
  assert(
    certifiedNeeds.includes("comparison-build"),
    `the certified shards must depend on \`comparison-build\`: that dependency is what makes an off-board waiver red the whole run rather than one job, found needs \`${certifiedNeeds.join(", ") || "none"}\``,
  );
  // The guard grades the tracked list. A `--waivers` override in the package
  // script would point CI at a file nobody reviews.
  const comparisonManifest = JSON.parse(
    readFileSync(path.join(ROOT, "apps", "comparison", "package.json"), "utf8"),
  );
  const waiverTicketsScript = comparisonManifest.scripts?.["guard:certified-waiver-tickets"] ?? "";
  assert(
    waiverTicketsScript.includes("check-certified-waiver-tickets.ts") &&
      !waiverTicketsScript.includes("--waivers"),
    `guard:certified-waiver-tickets must grade the tracked waiver file, found \`${waiverTicketsScript}\``,
  );
  console.log("PASS: an off-board or stale certified waiver is reconciled before the build.");

  // The unit tests that hold the certified verdict must run in the workflow
  // that enforces it. `certified-shard-gate.test.ts` and
  // `certified-postcard-git.test.ts` were reachable only through root
  // `test:run` — `ci:release-readiness`, hence `Release Readiness`, which is
  // disabled — so a required-field break in one of them sat uncaught.
  const certifiedUnitStep = stepBlock(comparisonBuildJob, "certified verdict unit tests");
  assert(
    certifiedUnitStep.includes("comparison:test:certified-waivers"),
    "the `certified verdict unit tests` step must run `comparison:test:certified-waivers`",
  );
  const certifiedUnitScript = rootManifest.scripts?.["comparison:test:certified-waivers"] ?? "";
  for (const file of [
    "certified-waivers.test.ts",
    "certified-shard-gate.test.ts",
    "certified-postcard-git.test.ts",
  ]) {
    assert(
      certifiedUnitScript.includes(`apps/comparison/src/data/${file}`),
      `comparison:test:certified-waivers must run ${file}; a verdict rule held by a disabled workflow is held by nobody`,
    );
  }
  console.log("PASS: Certification Gates runs every unit test that holds the certified verdict.");

  // release-readiness runs test:run on a plain checkout: the gitignored
  // ./react-spectrum oracle is absent there, so an oracle-backed check placed
  // in `packages/*/test` or `scripts/**/*.test.*` fails with ENOENT instead of
  // proving anything (2026-09-02: intl-catalog.test.tsx). Oracle-backed
  // evidence is a guard in Certification Gates, after the oracle materializes.
  const oracleAcquire = gatesJob.indexOf("check-upstream-oracle.mjs --acquire");
  const intlCatalogGuard = gatesJob.indexOf("run: pnpm run guard:s2-intl-catalog\n");
  assert(
    oracleAcquire >= 0 && intlCatalogGuard >= 0 && oracleAcquire < intlCatalogGuard,
    "Certification Gates must materialize the upstream oracle before guard:s2-intl-catalog",
  );
  const testRunFiles = [];
  const collectTests = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") collectTests(file);
      } else if (/\.test\.[cm]?[jt]sx?$/.test(entry.name)) {
        testRunFiles.push(file);
      }
    }
  };
  for (const packageEntry of readdirSync(path.join(ROOT, "packages"), { withFileTypes: true })) {
    const testDir = path.join(ROOT, "packages", packageEntry.name, "test");
    if (packageEntry.isDirectory() && existsSync(testDir)) collectTests(testDir);
  }
  collectTests(path.join(ROOT, "scripts"));
  const oracleReaders = testRunFiles.filter((file) =>
    readFileSync(file, "utf8").includes("react-spectrum/packages/"),
  );
  assert(
    oracleReaders.length === 0,
    `test:run suites must not read the gitignored upstream oracle (release-readiness has none); move the check to an oracle-backed guard:\n${oracleReaders
      .map((file) => `  ${path.relative(ROOT, file)}`)
      .join("\n")}`,
  );
  console.log(
    `PASS: ${testRunFiles.length} test:run suites are oracle-free; guard:s2-intl-catalog runs after the oracle materializes.`,
  );

  const oracleFixture = path.join(fixtureRoot, "missing-oracle");
  json(path.join(oracleFixture, "scripts", "upstream-pin.json"), {
    commit: "1111111111111111111111111111111111111111",
    tags: {
      "@react-spectrum/s2": "1.5.1",
      "react-aria-components": "1.19.0",
    },
  });
  const missingOracle = runSync("check-upstream-oracle.mjs", oracleFixture);
  assert(missingOracle.status !== 0, "missing upstream oracle unexpectedly passed");
  assert(
    combined(missingOracle).includes("upstream-backed checks cannot run"),
    `missing-oracle failure did not name the evidence contract:\n${combined(missingOracle)}${
      missingOracle.error ? `\n${missingOracle.error.stack ?? missingOracle.error}` : ""
    }`,
  );
  console.log("PASS: missing upstream oracle exits non-zero.");

  const nocheckFixture = path.join(fixtureRoot, "ts-nocheck-growth");
  for (const directory of [
    "packages/solid-stately/src",
    "packages/solidaria/src",
    "packages/solidaria-components/src",
    "packages/kumo/src",
    "packages/geist/src",
    "packages/solid-spectrum/src",
    "packages/viviana-ui/src",
  ]) {
    mkdirSync(path.join(nocheckFixture, directory), { recursive: true });
  }
  json(path.join(nocheckFixture, "scripts", "ts-nocheck-baseline.json"), {
    maxCount: 0,
    paths: [],
  });
  writeFileSync(
    path.join(nocheckFixture, "packages", "solid-stately", "src", "regression.ts"),
    "// @ts-nocheck\nexport {};\n",
  );
  const nocheckGrowth = runSync("check-ts-nocheck-budget.mjs", nocheckFixture);
  assert(nocheckGrowth.status !== 0, "new @ts-nocheck directive unexpectedly passed");
  assert(
    combined(nocheckGrowth).includes("packages/solid-stately/src/regression.ts"),
    "@ts-nocheck failure did not identify the new file",
  );
  console.log("PASS: new @ts-nocheck directive exits non-zero.");

  const sourceArtifactFixture = path.join(fixtureRoot, "source-artifact-growth");
  for (const directory of [
    "packages/solid-stately/src",
    "packages/solidaria/src",
    "packages/solidaria-components/src",
    "packages/kumo/src",
    "packages/geist/src",
    "packages/solid-spectrum/src/style",
    "packages/viviana-ui/src/style",
  ]) {
    mkdirSync(path.join(sourceArtifactFixture, directory), { recursive: true });
  }
  writeFileSync(
    path.join(
      sourceArtifactFixture,
      "packages",
      "solid-spectrum",
      "src",
      "style",
      "spectrum-tokens-json.d.ts",
    ),
    "declare module '@adobe/spectrum-tokens/**/*.json';\n",
  );
  writeFileSync(
    path.join(
      sourceArtifactFixture,
      "packages",
      "viviana-ui",
      "src",
      "style",
      "spectrum-tokens-json.d.ts",
    ),
    "declare module '@adobe/spectrum-tokens/**/*.json';\n",
  );
  writeFileSync(
    path.join(sourceArtifactFixture, "packages", "solid-stately", "src", "stale.d.ts"),
    "export declare const stale: true;\n",
  );
  const sourceArtifactGrowth = runSync("check-source-artifacts.mjs", sourceArtifactFixture);
  assert(sourceArtifactGrowth.status !== 0, "generated source declaration unexpectedly passed");
  assert(
    combined(sourceArtifactGrowth).includes("packages/solid-stately/src/stale.d.ts"),
    "source-artifact failure did not identify the generated declaration",
  );
  console.log("PASS: generated declaration in public-package source exits non-zero.");

  const packageArtifactFixture = path.join(fixtureRoot, "missing-package-artifact");
  json(path.join(packageArtifactFixture, "packages", "example", "package.json"), {
    name: "@proyecto-viviana/example",
    version: "1.0.0",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    scripts: { build: "vp pack" },
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "vite.config.ts"),
    'import { defineConfig } from "vite-plus";\nexport default defineConfig({pack: {entry: "src/index.ts"}});\n',
  );
  mkdirSync(path.join(packageArtifactFixture, "packages", "example", "dist"), {
    recursive: true,
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.d.ts"),
    "export declare const example: true;\n",
  );
  const missingPackageArtifact = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    missingPackageArtifact.status !== 0,
    "missing package export artifact unexpectedly passed",
  );
  assert(
    combined(missingPackageArtifact).includes("missing ./dist/index.js"),
    "package-artifact failure did not identify the missing export target",
  );
  console.log("PASS: missing package export artifact exits non-zero.");

  const builtHeader = [
    "/" + "*",
    " * Copyright 2024 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS',
    " * OF ANY KIND.",
    " *" + "/",
    "",
    "/" + "*",
    " * Copyright 2020 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS',
    " * OF ANY KIND.",
    " *" + "/",
    "",
    "// Ported to SolidJS for Proyecto Viviana; based on packages/upstream/src/collection.ts",
    "// Ported to SolidJS for Proyecto Viviana; based on packages/upstream/src/index.ts",
  ].join("\n");
  const builtSource = `${builtHeader}\n\nexport const example = true;\n`;
  assert(
    sourceAttributionHeader(builtSource) === builtHeader,
    "composite attribution header parsing did not preserve every block and source path",
  );
  mkdirSync(path.join(packageArtifactFixture, "packages", "example", "src"), {
    recursive: true,
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "src", "index.ts"),
    builtSource,
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.js"),
    "const example = true;\n",
  );
  json(path.join(packageArtifactFixture, "packages", "example", "dist", "index.js.map"), {
    version: 3,
    file: "index.js",
    sources: ["../src/index.ts"],
    sourcesContent: [builtSource],
    names: [],
    mappings: "",
  });
  const missingBuiltHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(missingBuiltHeader.status !== 0, "missing built attribution header unexpectedly passed");
  assert(
    combined(missingBuiltHeader).includes(
      "dist/index.js: missing built attribution header for ../src/index.ts",
    ),
    "artifact guard did not identify the stripped attribution header",
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.js"),
    `${builtHeader
      .replace(/^ (?=\*)/gm, "")
      .replace(
        "*/\n\n// Ported to SolidJS",
        "*/\n// Ported to SolidJS",
      )}\n\nconst example = true;\n`,
  );
  const preservedBuiltHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    preservedBuiltHeader.status === 0,
    `preserved built attribution header failed:\n${combined(preservedBuiltHeader)}`,
  );
  console.log("PASS: package artifacts preserve mapped attribution headers after printing.");
  const macroHeader = builtHeader.replace(
    "packages/upstream/src/index.ts",
    "packages/upstream/src/macro.ts",
  );
  const macroSource = `${macroHeader}\n\nexport const macro = true;\n`;
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "src", "macro.ts"),
    macroSource,
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "macro.js"),
    "const macro = true;\n",
  );
  json(path.join(packageArtifactFixture, "packages", "example", "dist", "macro.js.map"), {
    version: 3,
    file: "macro.js",
    sources: ["../src/macro.ts"],
    sourcesContent: [macroSource],
    names: [],
    mappings: "AAAA",
  });
  const runtimeWrite = runSync(
    "write-package-declaration-attribution.mjs",
    packageArtifactFixture,
    {},
    ["packages/example"],
  );
  assert(
    runtimeWrite.status === 0 &&
      combined(runtimeWrite).includes("wrote 1 runtime and 0 declaration"),
    `runtime attribution writer failed:\n${combined(runtimeWrite)}`,
  );
  const writtenMacro = readFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "macro.js"),
    "utf8",
  );
  assert(
    writtenMacro.startsWith(`${macroHeader}\n\n`),
    "runtime attribution writer did not restore the mapped source header",
  );
  const writtenMacroMap = JSON.parse(
    readFileSync(
      path.join(packageArtifactFixture, "packages", "example", "dist", "macro.js.map"),
      "utf8",
    ),
  );
  const macroLineOffset = `${macroHeader}\n\n`.split("\n").length - 1;
  assert(
    writtenMacroMap.mappings === `${";".repeat(macroLineOffset)}AAAA`,
    "runtime attribution writer did not shift source-map lines with the inserted header",
  );
  const preservedRuntimeHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    preservedRuntimeHeader.status === 0,
    `restored runtime attribution header failed:\n${combined(preservedRuntimeHeader)}`,
  );
  console.log("PASS: source maps restore attribution for transformed runtime chunks.");
  const typeOnlyHeader = builtHeader.replace(
    "packages/upstream/src/index.ts",
    "packages/upstream/src/types.ts",
  );
  const typeOnlySource = `${typeOnlyHeader}\n\nexport type Example = true;\n`;
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "src", "types.ts"),
    typeOnlySource,
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "types.d.ts"),
    "export type Example = true;\n",
  );
  json(path.join(packageArtifactFixture, "packages", "example", "dist", "types.d.ts.map"), {
    version: 3,
    file: "types.d.ts",
    sources: ["../src/types.ts"],
    names: [],
    mappings: "",
  });
  const missingDeclarationHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    missingDeclarationHeader.status !== 0 &&
      combined(missingDeclarationHeader).includes(
        "dist/types.d.ts: missing built attribution header for ../src/types.ts",
      ),
    "artifact guard did not identify a stripped declaration-only attribution header",
  );
  const declarationWrite = runSync(
    "write-package-declaration-attribution.mjs",
    packageArtifactFixture,
    {},
    ["packages/example"],
  );
  assert(
    declarationWrite.status === 0 &&
      combined(declarationWrite).includes("wrote 0 runtime and 1 declaration"),
    `declaration attribution writer failed:\n${combined(declarationWrite)}`,
  );
  const preservedDeclarationHeader = runSync(
    "check-package-artifacts.mjs",
    packageArtifactFixture,
    {
      VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
    },
  );
  assert(
    preservedDeclarationHeader.status === 0,
    `preserved declaration attribution header failed:\n${combined(preservedDeclarationHeader)}`,
  );
  const idempotentDeclarationWrite = runSync(
    "write-package-declaration-attribution.mjs",
    packageArtifactFixture,
    {},
    ["packages/example"],
  );
  assert(
    idempotentDeclarationWrite.status === 0 &&
      combined(idempotentDeclarationWrite).includes("wrote 0 runtime and 0 declaration"),
    "declaration attribution writer was not idempotent",
  );
  console.log("PASS: declaration-only attribution survives package builds.");
  rmSync(path.join(packageArtifactFixture, "packages", "example", "dist", "index.js.map"));
  const missingBuiltSourceMap = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(missingBuiltSourceMap.status !== 0, "missing attribution source map unexpectedly passed");
  assert(
    combined(missingBuiltSourceMap).includes(
      "src/index.ts: attributed source has no mapped build output",
    ),
    "artifact guard silently skipped an attributed source without a map",
  );
  console.log("PASS: attributed source without a mapped build output exits non-zero.");

  const attributionFixture = path.join(fixtureRoot, "changed-package-notice");
  mkdirSync(attributionFixture, { recursive: true });
  const adobePackages = [
    ["packages/solid-stately", "@proyecto-viviana/solid-stately"],
    ["packages/solidaria", "@proyecto-viviana/solidaria"],
    ["packages/solidaria-components", "@proyecto-viviana/solidaria-components"],
    ["packages/solid-spectrum", "@proyecto-viviana/solid-spectrum"],
    ["packages/viviana-ui", "@proyecto-viviana/ui"],
  ];
  const fixtureMit = "Proyecto Viviana MIT fixture\n";
  const fixtureApache = "Apache-2.0 fixture\n";
  const fixtureNotice = adobePackages.map(([, name]) => name).join("\n") + "\n";
  writeFileSync(path.join(attributionFixture, "LICENSE"), fixtureMit);
  writeFileSync(path.join(attributionFixture, "LICENSE-APACHE-2.0"), fixtureApache);
  writeFileSync(path.join(attributionFixture, "NOTICE"), fixtureNotice);
  writeFileSync(path.join(attributionFixture, "CREDITS.md"), fixtureNotice);

  for (const [packageDir, name] of adobePackages) {
    json(path.join(attributionFixture, packageDir, "package.json"), {
      name,
      license: "MIT AND Apache-2.0",
      files: ["src", "LICENSE", "LICENSE-APACHE-2.0", "NOTICE"],
    });
    mkdirSync(path.join(attributionFixture, packageDir, "src"), { recursive: true });
    writeFileSync(path.join(attributionFixture, packageDir, "src", "index.ts"), "export {};\n");
    writeFileSync(path.join(attributionFixture, packageDir, "LICENSE"), fixtureMit);
    writeFileSync(path.join(attributionFixture, packageDir, "LICENSE-APACHE-2.0"), fixtureApache);
    writeFileSync(path.join(attributionFixture, packageDir, "NOTICE"), fixtureNotice);
  }

  const kumoFixture = path.join(attributionFixture, "packages", "kumo");
  json(path.join(kumoFixture, "package.json"), {
    name: "@proyecto-viviana/kumo",
    license: "MIT",
    files: ["src", "LICENSE", "LICENSE-CLOUDFLARE"],
  });
  writeFileSync(path.join(kumoFixture, "LICENSE"), fixtureMit);
  writeFileSync(path.join(kumoFixture, "LICENSE-CLOUDFLARE"), "Cloudflare MIT fixture\n");

  const geistFixture = path.join(attributionFixture, "packages", "geist");
  json(path.join(geistFixture, "package.json"), {
    name: "@proyecto-viviana/geist",
    license: "MIT",
    files: ["src", "LICENSE"],
  });
  writeFileSync(path.join(geistFixture, "LICENSE"), fixtureMit);

  writeFileSync(
    path.join(attributionFixture, "packages", "solidaria", "NOTICE"),
    "changed notice\n",
  );
  const changedPackageNotice = runSync("check-package-attribution.mjs", attributionFixture);
  assert(changedPackageNotice.status !== 0, "changed package NOTICE unexpectedly passed");
  assert(
    combined(changedPackageNotice).includes(
      "packages/solidaria/NOTICE: content differs from root NOTICE",
    ),
    "attribution failure did not identify the changed package NOTICE",
  );
  console.log("PASS: changed package NOTICE exits non-zero.");
  writeFileSync(path.join(attributionFixture, "packages", "solidaria", "NOTICE"), fixtureNotice);
  writeFileSync(
    path.join(attributionFixture, "packages", "solid-spectrum", "src", "index.ts"),
    [
      "// Ported to SolidJS for Proyecto Viviana;",
      "// based on packages/@react-spectrum/s2/style/index.ts",
      "export {};",
      "",
    ].join("\n"),
  );
  const completeAttribution = runSync("check-package-attribution.mjs", attributionFixture);
  assert(
    completeAttribution.status === 0 &&
      completeAttribution.stdout.includes(
        "@proyecto-viviana/solid-spectrum: 1 TS/TSX files, 0 Adobe headers, 1 source marker",
      ),
    "package attribution inventory did not use the shared multiline marker parser",
  );
  console.log("PASS: package attribution inventory uses shared source-marker parsing.");

  const mappingFixture = path.join(fixtureRoot, "attribution-mappings");
  for (const directory of [
    "packages/solid-stately/src/calendar",
    "packages/solid-stately/src/color/intl",
    "packages/solid-stately/src/disclosure",
    "packages/solid-stately/src/table",
    "packages/solid-stately/src/utils",
    "packages/solidaria/src/color/intl",
    "packages/solidaria/src/focus",
    "packages/solidaria/src/local",
    "packages/solidaria/src/utils",
    "packages/solidaria/src/table",
    "packages/solidaria-components/src",
    "packages/solid-spectrum/src/shared",
    "packages/solid-spectrum/src/style",
    "packages/solid-spectrum/src/icon/ui-icons",
    "packages/viviana-ui/src/shared",
    "packages/viviana-ui/src/icon/pixel-icons",
    "react-spectrum/packages/react-aria-components/src",
    "react-spectrum/packages/react-aria/intl/color",
    "react-spectrum/packages/react-aria/src/i18n",
    "react-spectrum/packages/react-aria/src/focus",
    "react-spectrum/packages/react-aria/src/utils",
    "react-spectrum/packages/react-aria/src/table",
    "react-spectrum/packages/react-stately/intl/color",
    "react-spectrum/packages/react-stately/src/calendar",
    "react-spectrum/packages/react-stately/src/disclosure",
    "react-spectrum/packages/@react-spectrum/s2/ui-icons",
    "react-spectrum/packages/@react-spectrum/s2/style",
    "react-spectrum/packages/@react-types/table/src",
  ]) {
    mkdirSync(path.join(mappingFixture, directory), { recursive: true });
  }
  const fullAdobeHeader = [
    "/" + "*",
    " * Copyright 2024 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.',
    " *" + "/",
    "",
  ].join("\n");
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/table/useTable.ts"),
    `${fullAdobeHeader}export const useTable = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-types/table/src/index.d.ts"),
    `${fullAdobeHeader}export type TableSource = true;\n`,
  );
  for (const symbol of ["useDisclosureState", "useDisclosureGroupState"]) {
    writeFileSync(
      path.join(
        mappingFixture,
        `react-spectrum/packages/react-stately/src/disclosure/${symbol}.ts`,
      ),
      `${fullAdobeHeader}export const ${symbol} = true;\n`,
    );
  }
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-spectrum/s2/ui-icons/Add.tsx"),
    `${fullAdobeHeader}export default function Add() {}\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-spectrum/s2/style/runtime.ts"),
    `${fullAdobeHeader}export const upstreamRuntime = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria-components/src/utils.tsx"),
    `${fullAdobeHeader}export const upstreamUtils = true;\n`,
  );
  writeFileSync(
    path.join(
      mappingFixture,
      "react-spectrum/packages/react-aria-components/src/HiddenDateInput.tsx",
    ),
    "export const upstreamHiddenDateInput = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-stately/src/calendar/useCalendar.ts"),
    `${fullAdobeHeader}export const useCalendar = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/utils/animation.ts"),
    `${fullAdobeHeader}export const animation = true;\n`,
  );
  writeFileSync(
    path.join(
      mappingFixture,
      "react-spectrum/packages/react-aria/src/i18n/useLocalizedStringFormatter.ts",
    ),
    `${fullAdobeHeader}export const useLocalizedStringFormatter = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/focus/useFocusRing.ts"),
    "export const useFocusRing = true;\n",
  );
  const reviewedFocusRing =
    "// Based on @react-aria/focus useFocusRing.\nexport const localFocusRing = true;\n";
  const reviewedFocusRingPath = path.join(
    mappingFixture,
    "packages/solidaria/src/focus/createFocusRing.ts",
  );
  writeFileSync(reviewedFocusRingPath, reviewedFocusRing);
  json(path.join(mappingFixture, "scripts", "attribution-headerless-reviews.json"), [
    {
      localPath: "packages/solidaria/src/focus/createFocusRing.ts",
      upstreamPath: "packages/react-aria/src/focus/useFocusRing.ts",
      requiredText: ["@react-aria/focus useFocusRing"],
    },
  ]);
  const reviewedDisclosure = {
    localPath: "packages/solid-stately/src/disclosure/createDisclosureState.ts",
    upstreamPaths: [
      "packages/react-stately/src/disclosure/useDisclosureState.ts",
      "packages/react-stately/src/disclosure/useDisclosureGroupState.ts",
    ],
    requiredText: ["useDisclosureState and useDisclosureGroupState"],
  };
  const compositeReviewPath = path.join(
    mappingFixture,
    "scripts",
    "attribution-composite-reviews.json",
  );
  json(compositeReviewPath, [reviewedDisclosure]);
  const reviewedLocalSource = "export { localValue } from './localValue';\n";
  const reviewedLocalPath = path.join(mappingFixture, "packages/solidaria/src/local/index.ts");
  writeFileSync(reviewedLocalPath, reviewedLocalSource);
  const reviewedSolidHelperSource = "export function access(value) { return value; }\n";
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/utils/reactivity.ts"),
    reviewedSolidHelperSource,
  );
  json(path.join(mappingFixture, "scripts", "attribution-local-reviews.json"), [
    {
      localPath: "packages/solidaria/src/local/index.ts",
      classification: "local-module-surface",
      contentSha256: createHash("sha256").update(reviewedLocalSource).digest("hex"),
    },
    {
      localPath: "packages/solid-stately/src/utils/reactivity.ts",
      classification: "local-solid-helper",
      contentSha256: createHash("sha256").update(reviewedSolidHelperSource).digest("hex"),
    },
  ]);

  for (const locale of ["en-US", "fr-FR"]) {
    writeFileSync(
      path.join(mappingFixture, `react-spectrum/packages/react-aria/intl/color/${locale}.json`),
      `{"colorPicker":"${locale}"}\n`,
    );
    writeFileSync(
      path.join(mappingFixture, `react-spectrum/packages/react-stately/intl/color/${locale}.json`),
      `{"colorName":"${locale}"}\n`,
    );
  }

  const exactSource = `// @ts-nocheck\n\n${fullAdobeHeader}// Based on @react-aria/table/useTable.\nexport const local = true;\n`;

  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/createTable.ts"),
    exactSource,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/table/types.ts"),
    "// Ported from packages/@react-types/table/src/index.d.ts.\nexport type LocalTable = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/useTable.ts"),
    "export const unrelated = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/disclosure/createDisclosureState.ts"),
    "// Based on @react-stately/disclosure useDisclosureState and useDisclosureGroupState.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/calendar/createCalendar.ts"),
    [
      "// Based on @react-stately/calendar useCalendar.",
      "// Based on React Stately selection alignment rules.",
      "export const calendar = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/utils.tsx"),
    "// Port of react-aria-components/src/utils.tsx.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/utils/animation.ts"),
    "// Port of react-aria/src/utils/animation.ts.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/color/intl/index.ts"),
    [
      "// Port of @react-aria/color intl catalog.",
      "// Consumed via useLocalizedStringFormatter.",
      "export const colorStrings = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/color/intl/index.ts"),
    [
      "// Color names. Ported from the @react-stately/color intl catalog.",
      "export const colorNames = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/orphan.ts"),
    `${fullAdobeHeader}export const orphan = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/hidden-date-input.ts"),
    [
      "/**",
      " * A faithful port",
      " * of react-aria-components/src/HiddenDateInput.tsx.",
      " */",
      "export const localHiddenDateInput = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/createTable.ts"),
    exactSource,
  );
  const exactS2RuntimeMarker =
    "// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/style/runtime.ts";
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/style/runtime.ts"),
    `${fullAdobeHeader}\n${exactS2RuntimeMarker}\n\nexport const localRuntime = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/documentation.ts"),
    [
      "/**",
      " * Computes spacing based on the input value.",
      " * @example import {style} from '@react-spectrum/s2/style';",
      " */",
      "export const documentation = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/shared/createTable.ts"),
    exactSource,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/icon/pixel-icons/Pixel.tsx"),
    "/" +
      "* Auto-generated from the Glasselated pixel-art SVG set. *" +
      "/\nexport const Pixel = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/icon/ui-icons/Add.tsx"),
    "/" +
      "* Auto-generated from the shipped @react-spectrum/s2 dist assets. *" +
      "/\nexport const Add = true;\n",
  );

  const mappingResult = runSync("report-attribution-mappings.mjs", mappingFixture, {}, ["--json"]);
  assert(
    mappingResult.status === 0,
    `attribution mapping fixture failed:\n${combined(mappingResult)}`,
  );
  const mappingReport = JSON.parse(mappingResult.stdout);
  const mappingByPath = new Map(mappingReport.files.map((file) => [file.path, file]));
  assert(
    mappingByPath.get("packages/solidaria/src/table/createTable.ts")?.status === "exact",
    "explicit unified-source mapping was not exact",
  );
  assert(
    mappingByPath.get("packages/solid-spectrum/src/style/runtime.ts")?.status === "exact",
    "an exact S2 repository path did not resolve",
  );
  const declarationMapping = mappingByPath.get("packages/solid-stately/src/table/types.ts");
  assert(
    declarationMapping?.status === "exact" &&
      declarationMapping.upstreamPaths[0] === "packages/@react-types/table/src/index.d.ts",
    "an explicit upstream declaration path did not resolve",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/hidden-date-input.ts")?.status ===
      "exact-no-header",
    "a multiline provenance comment did not resolve",
  );
  const documentationExample = mappingByPath.get(
    "packages/solid-spectrum/src/shared/documentation.ts",
  );
  assert(
    documentationExample?.status === "unmarked" && documentationExample.markers.length === 0,
    "ordinary API documentation was misclassified as source evidence",
  );
  assert(
    mappingReport.summary.headerContracts.files === 7 &&
      mappingReport.summary.headerContracts.statuses.satisfied === 1 &&
      mappingReport.summary.headerContracts.statuses.mismatch === 3 &&
      mappingReport.summary.headerContracts.statuses.missing === 3,
    "exact header contract states were not reported",
  );
  const reviewedHeaderless = mappingByPath.get("packages/solidaria/src/focus/createFocusRing.ts");
  assert(
    reviewedHeaderless?.status === "exact-no-header" &&
      reviewedHeaderless.reviewRequired === false &&
      reviewedHeaderless.headerlessReview?.status === "satisfied" &&
      mappingReport.summary.headerlessReviews.statuses.satisfied === 1,
    "reviewed exact source without an Adobe header did not retain its audit result",
  );

  assert(
    mappingByPath.get("packages/solidaria/src/table/useTable.ts")?.status === "unmarked",
    "same-name source was promoted without an explicit marker",
  );
  const reviewedLocal = mappingByPath.get("packages/solidaria/src/local/index.ts");
  assert(
    reviewedLocal?.status === "reviewed-local" &&
      reviewedLocal.reviewRequired === false &&
      reviewedLocal.localReview?.status === "satisfied" &&
      mappingReport.summary.localReviews.statuses.satisfied === 2,
    "reviewed local module surface did not retain its content contract",
  );
  const reviewedSolidHelper = mappingByPath.get("packages/solid-stately/src/utils/reactivity.ts");
  assert(
    reviewedSolidHelper?.status === "reviewed-local" &&
      reviewedSolidHelper.localReview?.classification === "local-solid-helper",
    "reviewed Solid helper did not retain its local classification",
  );
  const reviewedComposite = mappingByPath.get(
    "packages/solid-stately/src/disclosure/createDisclosureState.ts",
  );
  assert(
    reviewedComposite?.status === "multiple" &&
      reviewedComposite.reviewRequired === true &&
      reviewedComposite.compositeReview?.status === "satisfied" &&
      mappingReport.summary.compositeReviews.statuses.satisfied === 1,
    reviewedComposite.compositeReview.headerContract?.status === "missing" &&
      "reviewed composite source set or pending header contract was not reported",
  );
  assert(
    mappingByPath.get("packages/solid-stately/src/calendar/createCalendar.ts")?.status ===
      "marker-unresolved",
    "a resolved marker hid a second unresolved marker",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/utils.tsx")?.status === "exact",
    "an explicit react-aria-components TSX path did not resolve",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/utils.tsx")?.upstreamPaths[0] ===
      "packages/react-aria-components/src/utils.tsx",
    "a react-aria-components TSX path was truncated to a TS path",
  );
  assert(
    mappingByPath.get("packages/solidaria/src/utils/animation.ts")?.upstreamPaths[0] ===
      "packages/react-aria/src/utils/animation.ts",
    "an explicit react-aria repository path did not resolve to that file",
  );
  const colorCatalog = mappingByPath.get("packages/solidaria/src/color/intl/index.ts");
  assert(
    colorCatalog?.status === "multiple" &&
      colorCatalog.upstreamPaths.length === 2 &&
      colorCatalog.upstreamPaths.every((source) => source.includes("/intl/color/")),
    "a scoped intl catalog marker fell back to an incidental cross-package hook",
  );
  const statelyColorCatalog = mappingByPath.get("packages/solid-stately/src/color/intl/index.ts");
  assert(
    statelyColorCatalog?.status === "multiple" &&
      statelyColorCatalog.upstreamPaths.length === 2 &&
      statelyColorCatalog.upstreamPaths.every((source) =>
        source.includes("/react-stately/intl/color/"),
      ),
    "a React Stately intl catalog marker did not resolve its complete scoped source set",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/orphan.ts")?.status === "header-unmapped",
    "unmapped Adobe header was not kept for review",
  );
  const mirror = mappingByPath.get("packages/viviana-ui/src/shared/createTable.ts");
  assert(
    mirror?.status === "mirror" && mirror.inheritedStatus === "exact",
    "identical Viviana UI source did not inherit the Spectrum mapping",
  );
  assert(
    mappingByPath.get("packages/viviana-ui/src/icon/pixel-icons/Pixel.tsx")?.status === "unmarked",
    "original generated source was misattributed to S2",
  );
  assert(
    mappingByPath.get("packages/solid-spectrum/src/icon/ui-icons/Add.tsx")?.status ===
      "generated-stale-generator",
    "generated output drift was not reported",
  );
  console.log("PASS: attribution mappings preserve evidence and review boundaries.");
  const incompleteHeaders = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(incompleteHeaders.status !== 0, "incomplete exact-source headers unexpectedly passed");
  assert(
    combined(incompleteHeaders).includes(
      "[mismatch] packages/solidaria/src/table/createTable.ts",
    ) &&
      combined(incompleteHeaders).includes("[missing] packages/solidaria/src/utils/animation.ts"),
    "header check did not identify missing and mismatched contracts",
  );

  const headerWrite = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--write-headers",
  ]);
  assert(headerWrite.status === 0, `header writer failed:\n${combined(headerWrite)}`);
  assert(combined(headerWrite).includes("wrote 7 attribution header contracts"));

  const managedTable = readFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/createTable.ts"),
    "utf8",
  );
  const expectedTablePrefix =
    `// @ts-nocheck\n\n${fullAdobeHeader}\n` +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTable.ts\n\n";
  assert(
    managedTable.startsWith(expectedTablePrefix),
    "writer did not preserve ts-nocheck first or copy the exact header and path",
  );
  assert(
    managedTable.includes("// Based on @react-aria/table/useTable."),
    "writer removed the source evidence marker",
  );

  const managedDisclosure = readFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/disclosure/createDisclosureState.ts"),
    "utf8",
  );
  const expectedDisclosurePrefix =
    `${fullAdobeHeader}\n` +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/disclosure/useDisclosureGroupState.ts\n" +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/disclosure/useDisclosureState.ts\n\n";
  assert(
    managedDisclosure.startsWith(expectedDisclosurePrefix),
    "writer did not deduplicate a composite Adobe block or preserve every exact source path",
  );

  const managedSpectrum = readFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/createTable.ts"),
    "utf8",
  );
  const managedMirror = readFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/shared/createTable.ts"),
    "utf8",
  );
  assert(managedSpectrum === managedMirror, "writer broke an exact inherited mirror");
  assert(
    !readFileSync(
      path.join(mappingFixture, "packages/solidaria-components/src/orphan.ts"),
      "utf8",
    ).includes("Ported to SolidJS for Proyecto Viviana"),
    "writer changed an unmapped Adobe header",
  );

  const completeHeaders = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(
    completeHeaders.status === 0,
    `completed exact-source headers failed:\n${combined(completeHeaders)}`,
  );
  writeFileSync(reviewedLocalPath, `${reviewedLocalSource}export const behavior = true;\n`);
  const contradictedLocalReview = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(
    contradictedLocalReview.status !== 0 &&
      combined(contradictedLocalReview).includes(
        "[mismatch] packages/solidaria/src/local/index.ts",
      ),
    "reviewed local source accepted content drift",
  );
  writeFileSync(reviewedLocalPath, reviewedLocalSource);
  console.log("PASS: reviewed local source rejects content drift.");
  json(compositeReviewPath, [
    {
      ...reviewedDisclosure,
      upstreamPaths: [
        ...reviewedDisclosure.upstreamPaths,
        "packages/react-stately/src/disclosure/missing.ts",
      ],
    },
  ]);
  const contradictedCompositeReview = runSync(
    "report-attribution-mappings.mjs",
    mappingFixture,
    {},
    ["--check-headers"],
  );
  assert(
    contradictedCompositeReview.status !== 0 &&
      combined(contradictedCompositeReview).includes(
        "[mismatch] packages/solid-stately/src/disclosure/createDisclosureState.ts",
      ),
    "reviewed composite mapping accepted a changed upstream source set",
  );
  json(compositeReviewPath, [reviewedDisclosure]);
  console.log("PASS: reviewed composite mappings reject source-set drift.");

  writeFileSync(reviewedFocusRingPath, `${fullAdobeHeader}${reviewedFocusRing}`);
  const contradictedHeaderlessReview = runSync(
    "report-attribution-mappings.mjs",
    mappingFixture,
    {},
    ["--check-headers"],
  );
  assert(
    contradictedHeaderlessReview.status !== 0 &&
      combined(contradictedHeaderlessReview).includes(
        "[mismatch] packages/solidaria/src/focus/createFocusRing.ts",
      ),
    "reviewed headerless source accepted an unsupported Adobe header",
  );
  writeFileSync(reviewedFocusRingPath, reviewedFocusRing);
  console.log("PASS: reviewed headerless mappings reject unsupported Adobe headers.");
  const idempotentWrite = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--write-headers",
  ]);
  assert(
    idempotentWrite.status === 0 && combined(idempotentWrite).includes("wrote 0"),
    "header writer was not idempotent",
  );
  console.log("PASS: exact-source header contracts are enforced and written safely.");

  const missingMapping = runSync("report-attribution-mappings.mjs", oracleFixture);
  assert(missingMapping.status !== 0, "missing attribution upstream unexpectedly passed");
  assert(
    combined(missingMapping).includes("exact source mappings cannot be reported"),
    "missing attribution upstream did not identify the evidence requirement",
  );
  console.log("PASS: attribution mapping report requires the pinned upstream tree.");

  // `npm_config_registry` is npm's own variable, and the prerequisite guard
  // re-derives its registry rows through it (#599), so these contracts hand it
  // a registry they control. The modes are the three registry answers that
  // decide a release: the name is not there, the published tarball carries no
  // provenance, or it does.
  //
  // These runs go through `run`, not `runSync`: `spawnSync` blocks this
  // process's event loop, so the server below would never answer and the
  // guard's read would hang to its timeout instead of reading the status.
  let registryMode = "unregistered";
  const registryServer = createServer((request, response) => {
    const name = decodeURIComponent(request.url ?? "").replace(/^\//, "");
    if (registryMode === "unregistered") {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    const attestations =
      registryMode === "provenance"
        ? {
            url: `https://registry.test/-/npm/v1/attestations/${name}@0.1.0`,
            provenance: { predicateType: "https://slsa.dev/provenance/v1" },
          }
        : undefined;
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        name,
        "dist-tags": { latest: "0.1.0" },
        versions: { "0.1.0": { name, version: "0.1.0", dist: { attestations } } },
      }),
    );
  });
  const registryUrl = await listen(registryServer);
  const registryEnv = { npm_config_registry: registryUrl };

  try {
    const unpublishedPrerequisiteFixture = path.join(fixtureRoot, "unpublished-prerequisite");
    const kumoManifestPath = path.join(
      unpublishedPrerequisiteFixture,
      "packages",
      "kumo",
      "package.json",
    );
    const kumoPrerequisitesPath = path.join(
      unpublishedPrerequisiteFixture,
      "scripts",
      "release-prerequisites.json",
    );
    const rederivedKumo = (prerequisites) => ({
      packages: [
        { name: "@proyecto-viviana/kumo", manifest: "packages/kumo/package.json", prerequisites },
      ],
    });
    const verifiedPrerequisites = [
      { id: "npm-package-registered", verify: { kind: "npm-registered" } },
      { id: "trusted-publisher-registered", verify: { kind: "npm-provenance" } },
    ];

    json(kumoManifestPath, { name: "@proyecto-viviana/kumo", version: "0.0.0" });
    json(kumoPrerequisitesPath, rederivedKumo(verifiedPrerequisites));
    const unpublishedPrerequisites = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      unpublishedPrerequisites.status === 0,
      "unpublished 0.0.0 package was incorrectly treated as a release candidate",
    );
    console.log("PASS: unpublished 0.0.0 package does not require release registration.");

    mkdirSync(path.join(unpublishedPrerequisiteFixture, ".changeset"), { recursive: true });
    writeFileSync(
      path.join(unpublishedPrerequisiteFixture, ".changeset", "kumo-bomb.md"),
      '---\n"@proyecto-viviana/kumo": minor\n---\n\nFake first Kumo release.\n',
    );
    json(path.join(unpublishedPrerequisiteFixture, ".changeset", "config.json"), {
      ignore: [],
    });
    const pendingZeroVersion = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      pendingZeroVersion.status !== 0 &&
        combined(pendingZeroVersion).includes("@proyecto-viviana/kumo@0.0.0") &&
        combined(pendingZeroVersion).includes("pending changesets"),
      "pending changesets on a 0.0.0 package were treated as a publishable release",
    );
    console.log("PASS: pending changesets cannot version a 0.0.0 package.");

    json(path.join(unpublishedPrerequisiteFixture, ".changeset", "config.json"), {
      ignore: ["@proyecto-viviana/kumo"],
    });
    const ignoredZeroVersion = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      ignoredZeroVersion.status === 0 &&
        combined(ignoredZeroVersion).includes("SKIP: @proyecto-viviana/kumo@0.0.0"),
      "ignored 0.0.0 package with leftover changeset names did not skip",
    );
    console.log("PASS: ignored 0.0.0 package stays skipped even if leftover changesets name it.");

    json(kumoManifestPath, { name: "@proyecto-viviana/kumo", version: "0.1.0" });
    const unregisteredPrerequisites = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      unregisteredPrerequisites.status !== 0 &&
        combined(unregisteredPrerequisites).includes(
          "npm-package-registered could not be re-derived",
        ) &&
        combined(unregisteredPrerequisites).includes("404"),
      "a release candidate the registry does not serve passed its own registry row",
    );
    console.log("PASS: an unregistered release candidate fails on the live read, not on a claim.");

    registryMode = "no-provenance";
    const unattestedPrerequisites = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      unattestedPrerequisites.status !== 0 &&
        combined(unattestedPrerequisites).includes(
          "trusted-publisher-registered could not be re-derived",
        ) &&
        combined(unattestedPrerequisites).includes("provenance=absent"),
      "a published tarball with no provenance passed the trusted-publisher row",
    );
    console.log("PASS: no provenance on the published tarball fails the trusted-publisher row.");

    registryMode = "provenance";
    const rederivedPrerequisites = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      rederivedPrerequisites.status === 0 &&
        combined(rederivedPrerequisites).includes(
          "VERIFIED: @proyecto-viviana/kumo@0.1.0 npm-package-registered",
        ) &&
        combined(rederivedPrerequisites).includes(
          "VERIFIED: @proyecto-viviana/kumo@0.1.0 trusted-publisher-registered",
        ),
      "re-derived release prerequisites did not pass on a registry that answers for them",
    );
    console.log("PASS: re-derived release prerequisites exit zero and print what was read.");

    // The shape #599 found: `satisfied: true` plus a sentence nobody parses.
    // It passed with the whole gate ladder red, so it is refused by name —
    // one entry cannot quietly go back to it.
    json(
      kumoPrerequisitesPath,
      rederivedKumo([
        {
          id: "npm-package-registered",
          satisfied: true,
          evidence: "https://www.npmjs.com/package/@proyecto-viviana/kumo",
        },
        {
          id: "trusted-publisher-registered",
          satisfied: true,
          evidence: "npm settings checked 2026-08-19 by repository owner",
        },
      ]),
    );
    const handWrittenPrerequisites = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      handWrittenPrerequisites.status !== 0 &&
        combined(handWrittenPrerequisites).includes("still carries satisfied/evidence"),
      "a hand-written satisfied/evidence pair still passed as release evidence",
    );
    console.log("PASS: satisfied=true plus a sentence is refused as release evidence.");

    // Dates are taken from the clock, not written down: the guard expires an
    // attestation, so a hard-coded date would make this contract pass today and
    // fail in a season (#599 review).
    const daysAgo = (days) =>
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const attestation = {
      by: "repository owner",
      at: daysAgo(17),
      why: "npm's trusted publisher settings are 2FA-gated and have no public read",
      says: "npm trust list -> type: github, file: release.yml, repository: proyecto-viviana/ui",
    };
    json(
      kumoPrerequisitesPath,
      rederivedKumo([
        verifiedPrerequisites[0],
        { id: "trusted-publisher-registered", attested: { ...attestation, at: "" } },
      ]),
    );
    const undatedAttestation = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      undatedAttestation.status !== 0 &&
        combined(undatedAttestation).includes("is an attestation missing at"),
      "an attestation with no date passed as release evidence",
    );
    console.log("PASS: an attestation with no owner and date is refused.");

    json(
      kumoPrerequisitesPath,
      rederivedKumo([
        verifiedPrerequisites[0],
        { id: "trusted-publisher-registered", attested: attestation },
      ]),
    );
    const datedAttestation = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      datedAttestation.status === 0 &&
        combined(datedAttestation).includes(
          "ATTESTED: @proyecto-viviana/kumo@0.1.0 trusted-publisher-registered",
        ) &&
        combined(datedAttestation).includes(`repository owner, ${attestation.at}`),
      "a dated, owned attestation did not pass, or did not print as an attestation",
    );
    console.log("PASS: what cannot be re-derived passes only as a dated, owned attestation.");

    // `attested` is four field names where `satisfied`/`evidence` was two. If
    // any row may take that shape, a live read is one edit away from a sentence
    // again — so the pairs that may be attested are named, and nothing else may
    // (#599 review).
    json(
      kumoPrerequisitesPath,
      rederivedKumo([
        { id: "npm-package-registered", attested: attestation },
        verifiedPrerequisites[1],
      ]),
    );
    const unlistedAttestation = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      unlistedAttestation.status !== 0 &&
        combined(unlistedAttestation).includes("npm-package-registered may not be attested"),
      "a prerequisite with a public read was downgraded to an attestation and passed",
    );
    console.log("PASS: only the listed prerequisite may be attested; the rest must re-derive.");

    json(
      kumoPrerequisitesPath,
      rederivedKumo([
        verifiedPrerequisites[0],
        { id: "trusted-publisher-registered", attested: { ...attestation, at: daysAgo(400) } },
      ]),
    );
    const staleAttestation = await run(
      "check-release-prerequisites.mjs",
      unpublishedPrerequisiteFixture,
      registryEnv,
    );
    assert(
      staleAttestation.status !== 0 &&
        combined(staleAttestation).includes("400 days ago") &&
        combined(staleAttestation).includes("attestations stand for 90 days"),
      "an attestation nobody has re-taken in over a year still passed as current evidence",
    );
    console.log("PASS: an attestation expires; a stale one is refused with its age.");
  } finally {
    registryServer.close();
  }

  // A sha the API can answer for, and a second one that is not it. The
  // contract below is that green for the second is never evidence for the
  // first.
  const releaseSha = "0123456789abcdef0123456789abcdef01234567";
  const otherSha = "89abcdef0123456789abcdef0123456789abcdef";
  // The rows carry the four fields the guard reads. `event` and
  // `head_repository` are there because head_sha plus head_branch is not the
  // whole contract: a `pull_request` run records the PR head's sha under the
  // PR's head ref name, which can be "main", from any fork (#599 review).
  // `run_started_at` and `run_number` ascend with the id, as Actions numbers
  // them: which run is newest is the whole question in the ordering cases
  // below, and the guard reads the clock before it reads the id.
  const releaseRun = (id, conclusion, extra = {}) => ({
    id,
    status: "completed",
    conclusion,
    head_sha: releaseSha,
    head_branch: "main",
    event: "push",
    head_repository: { full_name: "example/project" },
    run_number: id,
    run_started_at: new Date(Date.UTC(2026, 8, 21, 12, id)).toISOString(),
    ...extra,
  });

  let releaseMode = "failed";
  const server = createServer((request, response) => {
    const workflow = request.url?.match(/actions\/workflows\/([^/]+)\/runs/)?.[1];
    const askedSha = new URL(request.url ?? "/", "http://127.0.0.1").searchParams.get("head_sha");
    const redFor = (name, conclusion) =>
      workflow === name ? [releaseRun(1, conclusion)] : [releaseRun(1, "success")];
    const workflowRuns =
      {
        failed: redFor("site-gate.yml", "failure"),
        cancelled: redFor("release-readiness.yml", "cancelled"),
        skipped: redFor("release-readiness.yml", "skipped"),
        "other-sha": [releaseRun(1, "success", { head_sha: otherSha })],
        absent: [],
        "cancelled-rerun": [releaseRun(1, "success"), releaseRun(2, "cancelled")],
        "failed-rerun":
          workflow === "certification-gates.yml"
            ? [releaseRun(1, "success"), releaseRun(2, "failure")]
            : [releaseRun(1, "success")],
        "green-rerun":
          workflow === "certification-gates.yml"
            ? [releaseRun(1, "failure"), releaseRun(2, "success")]
            : [releaseRun(1, "success")],
        "cancelled-over-failure":
          workflow === "site-gate.yml"
            ? [releaseRun(1, "failure"), releaseRun(2, "cancelled")]
            : [releaseRun(1, "success")],
        "pull-request": [releaseRun(1, "success", { event: "pull_request" })],
        "fork-push": [
          releaseRun(1, "success", { head_repository: { full_name: "someone-else/project" } }),
        ],
        "head-derived": [releaseRun(1, "success", { head_sha: askedSha })],
        success: [releaseRun(1, "success")],
      }[releaseMode] ?? [];
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ workflow_runs: workflowRuns }));
  });
  const githubApiUrl = await listen(server);
  const releaseEnv = {
    GITHUB_API_URL: githubApiUrl,
    GITHUB_REPOSITORY: "example/project",
    GITHUB_TOKEN: "fixture-token",
    RELEASE_SHA: releaseSha,
    RELEASE_EVIDENCE_POLL_MS: "1",
    RELEASE_EVIDENCE_TIMEOUT_MS: "20",
    // The second signal the loopback base needs. These two together are the
    // only route into this file that is not a read of api.github.com, and the
    // case below proves either one alone is refused.
    RELEASE_EVIDENCE_FIXTURE: "1",
  };

  try {
    const failedEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(failedEvidence.status !== 0, "failed same-SHA evidence unexpectedly passed");
    assert(
      combined(failedEvidence).includes(`FAIL: Site Gate has no successful run at ${releaseSha}`),
      "release evidence failure did not name the workflow without a successful run",
    );
    console.log("PASS: failed same-SHA release evidence exits non-zero, naming the workflow.");

    releaseMode = "cancelled";
    const cancelledEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      cancelledEvidence.status !== 0 &&
        combined(cancelledEvidence).includes(
          `FAIL: Release Readiness has no successful run at ${releaseSha}`,
        ) &&
        combined(cancelledEvidence).includes("concluded cancelled"),
      "a cancelled run was read as release evidence",
    );
    console.log("PASS: a cancelled conclusion is not release evidence.");

    releaseMode = "skipped";
    const skippedEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      skippedEvidence.status !== 0 &&
        combined(skippedEvidence).includes(
          `FAIL: Release Readiness has no successful run at ${releaseSha}`,
        ) &&
        combined(skippedEvidence).includes("concluded skipped"),
      "a skipped run was read as release evidence",
    );
    console.log("PASS: a skipped conclusion is not release evidence.");

    releaseMode = "other-sha";
    const otherShaEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      otherShaEvidence.status !== 0 &&
        combined(otherShaEvidence).includes(
          `FAIL: Certification Gates has no successful run at ${releaseSha}`,
        ) &&
        combined(otherShaEvidence).includes("no run at this SHA"),
      "three green runs for another revision passed as evidence for this one",
    );
    console.log("PASS: a green run for another revision is not evidence for this SHA.");

    releaseMode = "absent";
    const absentEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      absentEvidence.status !== 0 &&
        combined(absentEvidence).includes(
          `FAIL: Site Gate has no successful run at ${releaseSha}`,
        ) &&
        combined(absentEvidence).includes("timed out"),
      "absent same-SHA evidence did not refuse and name the workflows it waited for",
    );
    console.log("PASS: a workflow with no run at all is refused by name.");

    releaseMode = "cancelled-rerun";
    const rerunEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      rerunEvidence.status === 0,
      "a cancelled re-run retracted the success the same tree already took",
    );
    console.log("PASS: a later cancelled re-run does not retract the success at that SHA.");

    // The other half of the same rule: a cancellation does not retract a green,
    // but a failure does. Certification Gates fires on push, pull_request and
    // workflow_dispatch, so a green push run followed by a red re-run at the
    // same sha is an ordinary Tuesday, not bad faith (#599 review).
    releaseMode = "failed-rerun";
    const failedRerun = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      failedRerun.status !== 0 &&
        combined(failedRerun).includes("Certification Gates has a completed run at") &&
        combined(failedRerun).includes("concluded failure"),
      "a later run that concluded failure did not retract the green at the same SHA",
    );
    console.log("PASS: a later failure at the same SHA retracts the green a run already took.");

    // And the way round that used to be unreleasable: a red run, then a green
    // re-run of the same tree. The verdict was order-blind, so any completed
    // failure in the list refused whatever ran after it — the ordinary "fix the
    // flake and re-run" path could never produce evidence (#599 second review).
    releaseMode = "green-rerun";
    const greenRerun = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      greenRerun.status === 0,
      "a green re-run after a failure at the same SHA was refused, so a re-run can never clear a red",
    );
    console.log("PASS: the newest completed run decides, so a green re-run clears an older red.");

    // Standing aside is not standing in front: a cancellation on top of a
    // failure leaves the failure deciding, not the guard guessing.
    releaseMode = "cancelled-over-failure";
    const cancelledOverFailure = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      cancelledOverFailure.status !== 0 &&
        combined(cancelledOverFailure).includes(
          `FAIL: Site Gate has no successful run at ${releaseSha}`,
        ) &&
        combined(cancelledOverFailure).includes("concluded failure"),
      "a cancelled run on top of a failure hid the failure",
    );
    console.log("PASS: a cancellation stands aside without hiding the red behind it.");

    releaseMode = "pull-request";
    const pullRequestEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      pullRequestEvidence.status !== 0 &&
        combined(pullRequestEvidence).includes(
          `FAIL: Certification Gates has no successful run at ${releaseSha}`,
        ) &&
        combined(pullRequestEvidence).includes("no run at this SHA"),
      "a pull_request run on a branch named main passed as evidence for the release SHA",
    );
    console.log("PASS: a pull_request run is not evidence, whatever its head branch is called.");

    releaseMode = "fork-push";
    const forkEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(
      forkEvidence.status !== 0 && combined(forkEvidence).includes("no run at this SHA"),
      "a run on another repository's main passed as evidence for this repository's release SHA",
    );
    console.log("PASS: a run from another repository is not evidence for this one.");

    releaseMode = "success";
    const successfulEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(successfulEvidence.status === 0, "complete same-SHA release evidence did not pass");
    console.log("PASS: complete same-SHA release evidence exits zero.");

    // Where the runs are read from is not the caller's to choose, and a
    // stand-in host is never handed the developer's `gh` credential: one env
    // var must not be able to both answer the question and collect a token
    // (#599 review).
    const redirectedApi = await run("check-release-evidence.mjs", ROOT, {
      ...releaseEnv,
      GITHUB_API_URL: "https://api.github.example.com",
    });
    assert(
      redirectedApi.status !== 0 &&
        combined(redirectedApi).includes("release evidence is read from api.github.com only"),
      "a redirected API base was read as release evidence",
    );
    console.log("PASS: an API base that is not api.github.com is refused, not read.");

    // The loopback base is the one route in this file that reads something
    // other than api.github.com, and it takes two variables to open. With one
    // of them, the second #599 review pointed a fixture server at this
    // checkout's own HEAD and collected `PASS` and exit 0 from a guard whose
    // header said it had no bypass.
    const unopenedFixture = await run("check-release-evidence.mjs", ROOT, {
      ...releaseEnv,
      RELEASE_EVIDENCE_FIXTURE: "",
    });
    assert(
      unopenedFixture.status !== 0 &&
        combined(unopenedFixture).includes("no RELEASE_EVIDENCE_FIXTURE=1"),
      "a loopback stand-in answered the release question on the strength of one variable",
    );
    console.log("PASS: a loopback stand-in is refused without the second signal beside it.");

    const unauthenticatedFixture = await run("check-release-evidence.mjs", ROOT, {
      ...releaseEnv,
      GITHUB_TOKEN: "",
    });
    assert(
      unauthenticatedFixture.status !== 0 &&
        combined(unauthenticatedFixture).includes("never handed the `gh` credential"),
      "a stand-in API base was allowed to fall back to the local `gh` credential",
    );
    console.log("PASS: a stand-in API base gets no `gh` credential, it gets a refusal.");

    const foreignRepository = await run("check-release-evidence.mjs", ROOT, {
      ...releaseEnv,
      GITHUB_API_URL: "",
    });
    assert(
      foreignRepository.status !== 0 &&
        combined(foreignRepository).includes("GITHUB_REPOSITORY names example/project"),
      "GITHUB_REPOSITORY could name a repository this checkout does not push to",
    );
    console.log("PASS: GITHUB_REPOSITORY may name this checkout's repository and no other.");

    // The local route reaches `changeset publish` through this one script, so
    // the evidence read has to be inside it, before the build it would
    // otherwise spend half an hour on (#599).
    const publishScript = rootManifest.scripts?.["changeset:publish"] ?? "";
    assert(
      publishScript.includes("guard:release-evidence"),
      "changeset:publish does not read same-SHA release evidence, so the local publish route reaches npm without the gate ladder",
    );
    assert(
      publishScript.indexOf("guard:release-evidence") < publishScript.indexOf("vp run build") &&
        publishScript.indexOf("guard:release-evidence") <
          publishScript.indexOf("changeset publish"),
      "changeset:publish reads release evidence only after it has built or published",
    );
    console.log("PASS: the local publish route reads the same same-SHA evidence CI does.");

    const releaseWorkflow = readFileSync(
      path.join(ROOT, ".github", "workflows", "release.yml"),
      "utf8",
    );
    const publishStep = stepBlock(
      jobBlock(releaseWorkflow, "release"),
      "Create release PR or publish packages",
    );
    assert(
      publishStep.includes("RELEASE_SHA:"),
      "the publish step does not name the candidate SHA, so the guard inside changeset:publish would fall back to the default branch head",
    );
    console.log("PASS: the publish step names the candidate SHA for the guard inside it.");

    // The same reasoning one guard along. `ci:changesets` runs publish-drift on
    // pull requests only, and the owner commits straight to main, so the read
    // that stands between this tree and npm is the one inside the publish
    // script (#598 second review).
    assert(
      publishScript.includes("guard:publish-drift") &&
        publishScript.indexOf("guard:publish-drift") < publishScript.indexOf("changeset publish"),
      "changeset:publish uploads without reading what the registry already serves",
    );
    assert(
      !publishScript.includes("--version-stage"),
      "changeset:publish defers the failure it is the last chance to catch",
    );
    console.log("PASS: the local publish route reads publish drift before it uploads anything.");

    const driftStep = stepBlock(jobBlock(releaseWorkflow, "release"), "guard publish-drift");
    assert(
      driftStep.includes("--version-stage"),
      "the drift step before changesets/action refuses the bump the version stage exists to clear",
    );
    console.log("PASS: the drift step before the version stage defers to it, and no further.");

    // With no RELEASE_SHA the sha comes from HEAD, and then `changeset publish`
    // ships this checkout. A green sha with uncommitted edits on top, or a
    // local commit nothing ever ran, is the hole #599 closed wearing a hat
    // (#599 review).
    const headFixture = path.join(fixtureRoot, "head-derived-sha");
    mkdirSync(headFixture, { recursive: true });
    const fixtureGit = (...args) => spawnSync("git", args, { cwd: headFixture, encoding: "utf8" });
    fixtureGit("init", "--quiet");
    fixtureGit("config", "user.email", "fixture@example.com");
    fixtureGit("config", "user.name", "Fixture");
    writeFileSync(path.join(headFixture, "README.md"), "fixture\n");
    fixtureGit("add", "README.md");
    fixtureGit("commit", "--quiet", "--no-gpg-sign", "-m", "fixture");
    const headEnv = { ...releaseEnv, RELEASE_SHA: "", GITHUB_SHA: "" };
    releaseMode = "head-derived";

    const dirtyPath = path.join(headFixture, "uncommitted.txt");
    writeFileSync(dirtyPath, "an edit the gate never saw\n");
    const dirtyTree = await run("check-release-evidence.mjs", headFixture, headEnv);
    assert(
      dirtyTree.status !== 0 && combined(dirtyTree).includes("working tree is not clean"),
      "a dirty working tree published under the evidence of the SHA it no longer matches",
    );
    console.log("PASS: a HEAD-derived publish refuses a working tree the gate never saw.");

    // Named instead of derived, and the same tree either way. `RELEASE_SHA`
    // carrying HEAD's own digits used to skip both checkout refusals at once —
    // `RELEASE_SHA=$(git rev-parse HEAD)` is how a release script writes this,
    // and it published the edits sitting on top of that commit (#599 second
    // review).
    const namedHead = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: headFixture,
      encoding: "utf8",
    }).stdout.trim();
    const namedDirtyTree = await run("check-release-evidence.mjs", headFixture, {
      ...headEnv,
      RELEASE_SHA: namedHead,
    });
    assert(
      namedDirtyTree.status !== 0 && combined(namedDirtyTree).includes("working tree is not clean"),
      "naming HEAD's own SHA published a dirty tree the gate never saw",
    );
    console.log("PASS: naming HEAD's own SHA does not buy a dirty tree past the guard.");

    rmSync(dirtyPath);
    const noRemoteRef = await run("check-release-evidence.mjs", headFixture, headEnv);
    assert(
      noRemoteRef.status !== 0 && combined(noRemoteRef).includes("no `origin/main` ref"),
      "a checkout with nothing to compare HEAD against published anyway",
    );
    console.log("PASS: a HEAD-derived publish needs an origin/main to compare HEAD against.");

    fixtureGit("update-ref", "refs/remotes/origin/main", "HEAD");
    writeFileSync(path.join(headFixture, "local-only.txt"), "never pushed\n");
    fixtureGit("add", "local-only.txt");
    fixtureGit("commit", "--quiet", "--no-gpg-sign", "-m", "local only");
    const unpushedHead = await run("check-release-evidence.mjs", headFixture, headEnv);
    assert(
      unpushedHead.status !== 0 &&
        combined(unpushedHead).includes("HEAD is not contained in `origin/main`"),
      "a commit that was never pushed, and so never ran anything, published anyway",
    );
    console.log("PASS: a HEAD-derived publish refuses a commit origin/main does not contain.");

    fixtureGit("update-ref", "refs/remotes/origin/main", "HEAD");
    const publishableHead = await run("check-release-evidence.mjs", headFixture, headEnv);
    assert(
      publishableHead.status === 0,
      "a clean checkout of a pushed commit with green runs at its SHA was refused",
    );
    console.log("PASS: a clean checkout of a pushed, green commit still publishes.");

    // The other half of that split, kept on purpose: a caller naming a revision
    // this checkout is not sitting on is asking about that revision, and this
    // tree is not it. Uncommitted edits here are not edits to what was named.
    const olderRevision = spawnSync("git", ["rev-parse", "HEAD~1"], {
      cwd: headFixture,
      encoding: "utf8",
    }).stdout.trim();
    writeFileSync(dirtyPath, "an edit on top of a revision nobody is publishing\n");
    const namedOtherRevision = await run("check-release-evidence.mjs", headFixture, {
      ...headEnv,
      RELEASE_SHA: olderRevision,
    });
    rmSync(dirtyPath);
    assert(
      namedOtherRevision.status === 0,
      "a named revision that is not this checkout's HEAD was judged by this checkout's tree",
    );
    console.log("PASS: naming another revision asks about that revision, not about this tree.");
  } finally {
    server.close();
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

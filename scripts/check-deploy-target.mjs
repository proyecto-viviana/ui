/**
 * guard:deploy-target — refuse to deploy the docs site over the production app.
 *
 * `apps/web/wrangler.jsonc` carried `name: "proyecto-viviana"` until 2026-07-24,
 * and the Cloudflare Worker by that name is not this site. It is the live parent
 * application: `wrangler versions view` on its current deployment shows a D1
 * binding, a `WEB_CLIENT_SECRET`, and `APP_URL=https://proyectoviviana.org` /
 * `AUTH_URL=https://auth.proyectoviviana.org` / `ENVIRONMENT=production`. From
 * outside, that host 302s to `/es` and 404s every route this repo builds.
 *
 * So `wrangler deploy` from `apps/web` would upload the docs site over a running
 * production application and drop its bindings on the way past. The audit read
 * that Worker's deploy history as *our* site going stale, which is how a
 * one-command outage got as close as it did.
 *
 * It runs as the first step of `deploy` itself, not as a separate CI job, so it
 * fires on the real path:
 * a guard you have to remember to run is not a guard. It is deliberately narrow
 * — it asserts the name is not the production app's and that a name is set at
 * all. It cannot tell you the name you *did* choose is free; that is what
 * `wrangler deployments list` is for.
 *
 * Removing the check is not the way to unblock a deploy. Choosing a name is.
 * See `.claude/current/tech-debt.md` → `launch-site-deploy-stale` for the four
 * things that decision has to settle.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolved from this file, not `process.cwd()`: the guard runs both from the
 * repo root (`vp run guard:deploy-target`) and from `apps/web` (`predeploy`),
 * and a cwd-relative path is wrong in one of those two.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = path.join(ROOT, "apps/web/wrangler.jsonc");

/** The Worker that serves the parent application. Never ours to overwrite. */
const PRODUCTION_APP_WORKER = "proyecto-viviana";

/**
 * Strips `//` line comments and trailing commas so `JSON.parse` accepts a
 * `.jsonc`. Both are only stripped outside string literals — a URL's `//`
 * inside a quoted value has to survive.
 */
function parseJsonc(source) {
  let out = "";
  let inString = false;
  let inComment = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];
    if (inComment) {
      if (c === "\n") {
        inComment = false;
        out += c;
      }
      continue;
    }
    if (inString) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i++;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }
    if (c === "/" && next === "/") {
      inComment = true;
      i++;
      continue;
    }
    out += c;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

const raw = await readFile(CONFIG, "utf8").catch(() => null);
if (raw === null) {
  console.error(`guard:deploy-target — cannot read ${path.relative(ROOT, CONFIG)}.`);
  process.exit(1);
}

const config = parseJsonc(raw);
const name = typeof config.name === "string" ? config.name : "";

if (name === "") {
  console.error("guard:deploy-target — apps/web/wrangler.jsonc sets no `name`.");
  console.error("Wrangler would fall back to the directory name. Set one explicitly.");
  process.exit(1);
}

if (name === PRODUCTION_APP_WORKER) {
  console.error(
    `guard:deploy-target — refusing to deploy: apps/web/wrangler.jsonc is still named "${PRODUCTION_APP_WORKER}".`,
  );
  console.error("");
  console.error("That Worker is the live parent application — D1 database, WEB_CLIENT_SECRET,");
  console.error("APP_URL=https://proyectoviviana.org, AUTH_URL=https://auth.proyectoviviana.org.");
  console.error("Deploying the docs site to it would replace a running production app.");
  console.error("");
  console.error("Pick a name of our own (and a hostname to serve it from) first:");
  console.error("  .claude/current/tech-debt.md → launch-site-deploy-stale");
  process.exit(1);
}

console.log(`guard:deploy-target — OK, apps/web deploys to Worker "${name}".`);

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Repository-internal Node adapter. A receipt is portable; its original artifacts remain archived. */
export function readCertifiedLocalReceipt(
  repoRoot: string,
  local: { path: string; sha256: string },
): unknown {
  if (!/^\.agents\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(local.path)) {
    throw new Error("local certified receipt must be a flat portable .agents JSON filename");
  }
  if (!/^[0-9a-f]{64}$/.test(local.sha256) || /^0{64}$/.test(local.sha256)) {
    throw new Error("local certified receipt requires a non-placeholder SHA256");
  }
  const bytes = readFileSync(resolve(repoRoot, local.path));
  if (createHash("sha256").update(bytes).digest("hex") !== local.sha256) {
    throw new Error("local certified receipt SHA256 does not match the postcard");
  }
  return JSON.parse(bytes.toString("utf8"));
}

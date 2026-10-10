import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import { readCertifiedLocalReceipt } from "../../scripts/certified-local-receipt";

function withReceiptFixture(run: (root: string, path: string, sha256: string) => void): void {
  const root = mkdtempSync(resolve(tmpdir(), "certified-local-receipt-"));
  const path = ".agents/certified-20261009.json";
  // Synthetic bytes exercise the Node adapter, not an actual certified verdict.
  const bytes = JSON.stringify({ fixture: "local portable receipt" });
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  try {
    mkdirSync(resolve(root, ".agents"));
    writeFileSync(resolve(root, path), bytes);
    run(root, path, sha256);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("portable certified receipt Node adapter", () => {
  it("reads the exact portable bytes bound by the postcard hash", () => {
    withReceiptFixture((root, path, sha256) => {
      expect(readCertifiedLocalReceipt(root, { path, sha256 })).toEqual({
        fixture: "local portable receipt",
      });
    });
  });

  it("fails for a missing receipt and changed bytes", () => {
    withReceiptFixture((root, path, sha256) => {
      expect(() =>
        readCertifiedLocalReceipt(root, { path: ".agents/missing.json", sha256 }),
      ).toThrow();
      writeFileSync(resolve(root, path), JSON.stringify({ changed: true }));
      expect(() => readCertifiedLocalReceipt(root, { path, sha256 })).toThrow(
        "local certified receipt SHA256 does not match the postcard",
      );
    });
  });

  it("rejects traversal, encoded URLs and nested paths before reading files", () => {
    withReceiptFixture((root, _path, sha256) => {
      for (const path of [
        ".agents/../outside.json",
        ".agents/%2e%2e/outside.json",
        ".agents/%2e%2e%2foutside.json",
        ".agents/nested/receipt.json",
        ".agents/..\\outside.json",
        "/tmp/receipt.json",
        ".agents/.hidden.json",
        ".agents/receipt.json?query=1",
      ]) {
        expect(() => readCertifiedLocalReceipt(root, { path, sha256 })).toThrow(
          "local certified receipt must be a flat portable .agents JSON filename",
        );
      }
    });
  });

  it("rejects malformed and placeholder identities", () => {
    withReceiptFixture((root, path) => {
      for (const sha256 of ["pending", "0".repeat(64), "g".repeat(64)]) {
        expect(() => readCertifiedLocalReceipt(root, { path, sha256 })).toThrow(
          "local certified receipt requires a non-placeholder SHA256",
        );
      }
    });
  });
});

/**
 * The peers allowlist ratchets in both directions: an unmet peer nobody wrote
 * down fails, and a written-down entry that no longer occurs fails too.
 * Fixtures only — not the live workspace.
 */
import { describe, expect, it } from "vite-plus/test";
// @ts-expect-error — plain-JS guard, no types
import { collectUnmetPeers, diffExpectedPeers, peerKey } from "./check-peers.mjs";

const REPORT = {
  ".": { bad: {}, missing: {}, conflicts: [], intersections: {} },
  "apps/web": {
    bad: {
      "solid-js": [
        {
          parents: [
            { name: "@tanstack/solid-router", version: "2.0.0-rc.8" },
            { name: "@solid-primitives/refs", version: "1.1.4" },
          ],
          optional: false,
          wantedRange: "^1.6.12",
          foundVersion: "2.0.0-rc.9",
        },
      ],
    },
    missing: {
      "some-peer": [
        {
          parents: [{ name: "@tanstack/solid-start", version: "2.0.0-rc.8" }],
          optional: false,
          wantedRange: "^3.0.0",
        },
      ],
    },
  },
};

const REFS = {
  workspace: "apps/web",
  peer: "solid-js",
  wantedRange: "^1.6.12",
  declaredBy: "@solid-primitives/refs@1.1.4",
  rootDependency: "@tanstack/solid-router@2.0.0-rc.8",
  reason: "TanStack's rc line still depends on the Solid 1 primitives.",
};

const SOME_PEER = {
  workspace: "apps/web",
  peer: "some-peer",
  wantedRange: "^3.0.0",
  declaredBy: "@tanstack/solid-start@2.0.0-rc.8",
  rootDependency: "@tanstack/solid-start@2.0.0-rc.8",
  reason: "fixture",
};

describe("collectUnmetPeers", () => {
  it("flattens both bad and missing peers, naming the declaring and the root package", () => {
    const rows = collectUnmetPeers(REPORT);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      workspace: "apps/web",
      kind: "bad",
      peer: "solid-js",
      wantedRange: "^1.6.12",
      declaredBy: "@solid-primitives/refs@1.1.4",
      rootDependency: "@tanstack/solid-router@2.0.0-rc.8",
      foundVersion: "2.0.0-rc.9",
    });
    expect(rows[1]).toMatchObject({
      kind: "missing",
      peer: "some-peer",
      // A single-parent chain declares the peer and is the root.
      declaredBy: "@tanstack/solid-start@2.0.0-rc.8",
      rootDependency: "@tanstack/solid-start@2.0.0-rc.8",
    });
  });

  it("reads an empty report as no unmet peers", () => {
    expect(collectUnmetPeers({})).toEqual([]);
    expect(collectUnmetPeers(undefined)).toEqual([]);
  });
});

describe("diffExpectedPeers", () => {
  const actual = collectUnmetPeers(REPORT);

  it("passes when the allowlist names exactly what is unmet", () => {
    const diff = diffExpectedPeers(actual, [REFS, SOME_PEER]);

    expect(diff.unexpected).toEqual([]);
    expect(diff.stale).toEqual([]);
  });

  it("fails on an unmet peer the allowlist does not name", () => {
    const diff = diffExpectedPeers(actual, [REFS]);

    expect(diff.unexpected.map(peerKey)).toEqual([peerKey(SOME_PEER)]);
    expect(diff.stale).toEqual([]);
  });

  it("fails on an allowlist entry that is no longer unmet, so the list can only shrink", () => {
    const gone = { ...REFS, declaredBy: "@solid-primitives/refs@1.1.3" };
    const diff = diffExpectedPeers(actual, [REFS, SOME_PEER, gone]);

    expect(diff.stale.map(peerKey)).toEqual([peerKey(gone)]);
    expect(diff.unexpected).toEqual([]);
  });

  it("keys on the range too, so a widened peer range is a new entry", () => {
    const widened = { ...REFS, wantedRange: "^1.0.0" };
    const diff = diffExpectedPeers(actual, [widened, SOME_PEER]);

    expect(diff.unexpected.map(peerKey)).toEqual([peerKey(REFS)]);
    expect(diff.stale.map(peerKey)).toEqual([peerKey(widened)]);
  });
});

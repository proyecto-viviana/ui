import { describe, expect, it } from "vitest";
import { sanitizeDemoHref, sanitizeDemoSrc } from "./demo-url";

const fallback = "https://example.com/safe";

describe("sanitizeDemoHref", () => {
  it("keeps http(s), same-origin paths, and hashes", () => {
    expect(sanitizeDemoHref("https://example.com/docs", fallback)).toBe(
      "https://example.com/docs",
    );
    expect(sanitizeDemoHref("/coverage/", fallback)).toBe("/coverage/");
    expect(sanitizeDemoHref("#api", fallback)).toBe("#api");
  });

  it("drops javascript, data, and protocol-relative values", () => {
    expect(sanitizeDemoHref("javascript:alert(1)", fallback)).toBe(fallback);
    expect(sanitizeDemoHref("JAVASCRIPT:alert(1)", fallback)).toBe(fallback);
    expect(sanitizeDemoHref(" data:text/html,hi", fallback)).toBe(fallback);
    expect(sanitizeDemoHref("//evil.example/x", fallback)).toBe(fallback);
    expect(sanitizeDemoHref("vbscript:msgbox(1)", fallback)).toBe(fallback);
  });

  it("uses the fallback for empty or missing values", () => {
    expect(sanitizeDemoHref("", fallback)).toBe(fallback);
    expect(sanitizeDemoHref(null, fallback)).toBe(fallback);
    expect(sanitizeDemoHref(undefined, fallback)).toBe(fallback);
  });
});

describe("sanitizeDemoSrc", () => {
  it("keeps the avatar fixture path and rejects data urls", () => {
    expect(sanitizeDemoSrc("/fixtures/avatar/docs-avatar.png", fallback)).toBe(
      "/fixtures/avatar/docs-avatar.png",
    );
    expect(sanitizeDemoSrc("data:image/svg+xml,<svg></svg>", fallback)).toBe(fallback);
  });
});

import { describe, expect, it } from "vite-plus/test";
import { safeAdminLinkTarget } from "../../src/app/admin/safe-link";

describe("admin markdown hrefs", () => {
  it("allows http(s), root-relative, and fragment targets", () => {
    expect(safeAdminLinkTarget("https://example.com/path")).toBe("https://example.com/path");
    expect(safeAdminLinkTarget("http://example.com")).toBe("http://example.com");
    expect(safeAdminLinkTarget("/docs/button")).toBe("/docs/button");
    expect(safeAdminLinkTarget("#heading")).toBe("#heading");
  });

  it("rejects javascript and scheme-relative hrefs", () => {
    expect(safeAdminLinkTarget("javascript:alert(1)")).toBeNull();
    expect(safeAdminLinkTarget("//evil.example/path")).toBeNull();
    expect(safeAdminLinkTarget("/\\evil.example")).toBeNull();
  });
});

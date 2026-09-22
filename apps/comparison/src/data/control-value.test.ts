import { describe, expect, it } from "vite-plus/test";
import { controlValueFromField, controlValueFromSearch } from "./control-value";

describe("controlValueFromSearch", () => {
  it("keeps an explicit empty date or time value", () => {
    const params = new URLSearchParams("value=");
    expect(controlValueFromSearch(params, "value", "2025-02-03")).toBe("");
    expect(controlValueFromSearch(params, "value", "09:30:00")).toBe("");
  });

  it("uses the demo default when the param is absent", () => {
    expect(controlValueFromSearch(new URLSearchParams(""), "value", "2025-02-03")).toBe(
      "2025-02-03",
    );
  });

  it("keeps a non-empty param", () => {
    expect(
      controlValueFromSearch(new URLSearchParams("value=2024-01-01"), "value", "2025-02-03"),
    ).toBe("2024-01-01");
  });

  it("reads a boolean from presence", () => {
    expect(
      controlValueFromSearch(new URLSearchParams("isDisabled=true"), "isDisabled", false),
    ).toBe(true);
    expect(controlValueFromSearch(new URLSearchParams(""), "isDisabled", false)).toBe(false);
  });
});

describe("controlValueFromField", () => {
  it("keeps an empty field instead of restoring the demo default", () => {
    expect(controlValueFromField("", "2025-02-03")).toBe("");
    expect(controlValueFromField("", "09:30:00")).toBe("");
  });

  it("uses the demo default when the field is absent", () => {
    expect(controlValueFromField(null, "2025-02-03")).toBe("2025-02-03");
  });

  it("reads a checkbox from its submitted token", () => {
    expect(controlValueFromField("on", false)).toBe(true);
    expect(controlValueFromField(null, false)).toBe(false);
  });
});

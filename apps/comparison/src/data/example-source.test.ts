import { describe, expect, it } from "vite-plus/test";
import type { ComponentControlGroup } from "./component-controls";
import { exampleSourceValuesFromSearch } from "./example-source";

const group: ComponentControlGroup = {
  slug: "datefield",
  title: "DateField",
  coverage: "modeled",
  controls: [
    { name: "value", label: "value", kind: "text", defaultValue: "2025-02-03" },
    { name: "isDisabled", label: "isDisabled", kind: "switch", defaultValue: false },
  ],
  apiProps: ["value"],
  note: "",
};

describe("exampleSourceValuesFromSearch", () => {
  it("keeps an explicit empty value that the controls reader keeps", () => {
    expect(exampleSourceValuesFromSearch(group, "value=").value).toBe("");
  });

  it("uses the demo default when the param is absent", () => {
    expect(exampleSourceValuesFromSearch(group, "").value).toBe("2025-02-03");
    expect(exampleSourceValuesFromSearch(group, "").isDisabled).toBe(false);
  });
});

import { describe, expect, it } from "vite-plus/test";

import { readControls } from "./component-controls";

describe("readControls", () => {
  it("keeps an empty text field and uses the default when the field is missing", () => {
    const defaults = { value: "2025-02-03", label: "Date" };
    const form = document.createElement("form");
    form.className = "s2-prop-controls";
    form.dataset.comparisonControls = "datefield";
    form.dataset.controlDefaults = JSON.stringify(defaults);
    const input = document.createElement("input");
    input.type = "text";
    input.name = "value";
    input.value = "";
    form.append(input);
    document.body.append(form);

    try {
      const values = readControls(form, defaults);
      expect(values.value).toBe("");
      expect(values.label).toBe("Date");
    } finally {
      form.remove();
    }
  });
});

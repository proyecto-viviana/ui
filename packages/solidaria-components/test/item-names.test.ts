/**
 * #224 — canonical RAC item names resolve to the same component as the
 * deprecated Option aliases.
 */
import { describe, expect, it } from "vite-plus/test";
import { ComboBoxItem, ComboBoxOption, ListBoxItem, ListBoxOption } from "../src/index";

describe("canonical item names", () => {
  it("ListBoxOption is a deprecated alias of ListBoxItem", () => {
    expect(ListBoxOption).toBe(ListBoxItem);
  });

  it("ComboBoxOption is a deprecated alias of ComboBoxItem", () => {
    expect(ComboBoxOption).toBe(ComboBoxItem);
  });
});
